import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"

const root = fileURLToPath(new URL("..", import.meta.url))
const wantDist = process.argv.includes("--dist")
let failed = 0

function fail(message) {
  failed += 1
  console.error(message)
}

const secretPatterns = [
  { name: "aws-access-key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "github-token", re: /ghp_[A-Za-z0-9]{20,}/ },
  { name: "github-fine-grained", re: /github_pat_[A-Za-z0-9_]{20,}/ },
  { name: "stripe-live", re: /sk_live_[A-Za-z0-9]+/ },
  { name: "slack-token", re: /xox[baprs]-[A-Za-z0-9-]{10,}/ },
]

const allowedVite = new Set(["BASE_URL", "DEV", "PROD", "SSR", "MODE"])
const textExt = new Set([".ts", ".tsx", ".js", ".mjs", ".html", ".css", ".yml", ".yaml", ".md", ".json", ".svg"])

async function walk(dir) {
  const found = []
  let entries = []
  try {
    entries = await readdir(dir)
  } catch {
    return found
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git") continue
    const full = path.join(dir, name)
    const info = await stat(full)
    if (info.isDirectory()) found.push(...(await walk(full)))
    else found.push(full)
  }
  return found
}

function rel(file) {
  return path.relative(root, file)
}

async function scanFile(file) {
  const base = path.basename(file)
  if (base === ".env" || base.startsWith(".env.")) fail(`${rel(file)} is an env file and must stay out of the tree`)
  if (!textExt.has(path.extname(file))) return
  if (rel(file) === "scripts/check.mjs") return
  const text = await readFile(file, "utf8")
  for (const pattern of secretPatterns) {
    if (pattern.re.test(text)) fail(`${pattern.name} matched in ${rel(file)}`)
  }
  if (rel(file).startsWith("src/") && /\bconsole\./.test(text)) fail(`${rel(file)} logs to the console`)
  if (rel(file).startsWith("src/")) {
    for (const sink of ["dangerouslySetInnerHTML", "innerHTML", "document.write", "eval(", "new Function"]) {
      if (text.includes(sink)) fail(`${rel(file)} uses ${sink}`)
    }
  }
  const names = text.match(/VITE_[A-Z0-9_]+/g) ?? []
  for (const name of names) {
    if (!allowedVite.has(name)) fail(`${rel(file)} reads ${name}`)
  }
}

async function scanTree(dir) {
  const files = await walk(dir)
  for (const file of files) await scanFile(file)
}

function eq(actual, expected, label) {
  if (actual !== expected) fail(`${label}: expected ${expected}, got ${actual}`)
}

async function checkBehavior() {
  const server = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  })
  try {
    const card = await server.ssrLoadModule("/src/lib/card.ts")
    const season = await server.ssrLoadModule("/src/data/season.ts")
    const image = await server.ssrLoadModule("/src/lib/image.ts")
    if (card.parseHash("#%") !== null) fail("a broken percent-escape was kept")
    if (card.parseHash("#f=nope") !== null) fail("an unknown festival was kept")
    if (card.parseHash("") !== null) fail("an empty hash became a card")
    if (card.parseHash(`#${"a".repeat(2001)}`) !== null) fail("a huge hash was kept")

    const script = card.parseHash("#f=diwali&m=%3Cscript%3Ealert(1)%3C/script%3E")
    eq(script?.message, "<script>alert(1)</script>", "script text")
    eq(script?.festival, "diwali", "script festival")

    const messy = card.parseHash("#f=holi&e=sparkle.nope.confetti.sparkle&to=A%0Asha&m=+++")
    eq(messy?.to, "Asha", "control character")
    eq(messy?.message, "", "blank message")
    eq(messy?.effects.join("."), "sparkle.confetti", "effects")

    const long = card.parseHash(`#f=eid&m=${"a".repeat(400)}`)
    eq(long?.message.length, 180, "message cap")

    const original = {
      festival: "eid",
      to: "A&B",
      from: "Sam",
      message: "Hello\nthere",
      effects: ["glow", "sparkle"],
    }
    const parsed = card.parseHash(`#${card.encodeCard(original)}`)
    eq(parsed?.festival, "eid", "roundtrip festival")
    eq(parsed?.to, "A&B", "roundtrip to")
    eq(parsed?.from, "Sam", "roundtrip from")
    eq(parsed?.message, "Hello\nthere", "roundtrip message")
    eq(parsed?.effects.join("."), "sparkle.glow", "roundtrip effects")
    const sparse = card.encodeCard({
      festival: "diwali",
      to: "   ",
      from: "",
      message: "  ",
      effects: [],
    })
    if (sparse.includes("to=") || sparse.includes("from=") || sparse.includes("m=")) {
      fail("an empty field was written")
    }

    eq(season.nearestFestival(new Date(2026, 10, 17)), "diwali", "november 17")
    eq(season.nearestFestival(new Date(2026, 11, 20)), "christmas", "december 20")
    eq(season.nearestFestival(new Date(2026, 0, 1)), "newyear", "new year")
    eq(season.nearestFestival(new Date(2026, 1, 17)), "lunar", "lunar new year")
    eq(season.nearestFestival(new Date(2026, 2, 3)), "holi", "holi")
    eq(season.nearestFestival(new Date(2026, 2, 20)), "eid", "eid")
    eq(season.nearestFestival(new Date(2027, 9, 29)), "diwali", "diwali 2027")
    eq(season.nearestFestival(new Date(2030, 11, 24)), "christmas", "later christmas")
    const seasonal = card.createDefaultCard(new Date(2026, 11, 20))
    eq(seasonal.festival, "christmas", "default festival")
    eq(seasonal.message, "Wishing you a warm and merry Christmas.", "default greeting")

    const named = { festival: "christmas", to: "../Asha", from: "", message: "Hi", effects: [] }
    eq(image.cardFileName(named), "festivs-for-asha.png", "image name")
    eq(image.cardFileName({ ...named, to: "" }), "festivs-christmas.png", "image name without a person")
  } finally {
    await server.close()
  }
}

async function checkBuiltPage() {
  const html = await readFile(path.join(root, "dist/index.html"), "utf8")
  const raw = html.match(/http-equiv="Content-Security-Policy"[^>]*content="([^"]+)"/) ||
    html.match(/content="([^"]+)"[^>]*http-equiv="Content-Security-Policy"/)
  const policy = raw ? raw[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&") : ""
  if (!policy) fail("the built page has no Content-Security-Policy")
  else {
    if (!policy.includes("script-src 'self'")) fail("the built page does not lock scripts to this site")
    if (policy.includes("unsafe-eval") || /script-src[^;]*unsafe-inline/.test(policy)) {
      fail("the built page allows inline or eval scripts")
    }
  }
  if (!html.includes('name="referrer" content="strict-origin-when-cross-origin"')) {
    fail("the built page has no referrer policy")
  }
  const privacy = await readFile(path.join(root, "dist/privacy.html"), "utf8")
  if (!privacy.includes("script-src 'none'")) fail("the privacy page allows scripts")
}

const sourceDirs = ["src", "scripts", "public", ".github"].map((dir) => path.join(root, dir))
for (const dir of sourceDirs) await scanTree(dir)
for (const file of ["index.html", "README.md", "package.json", "vite.config.ts"]) {
  await scanFile(path.join(root, file))
}

if (wantDist) {
  const dist = path.join(root, "dist")
  try {
    await stat(dist)
  } catch {
    fail("dist is missing. Run the check after the build.")
  }
  await scanTree(dist)
  await checkBuiltPage()
}

await checkBehavior()

if (failed > 0) {
  console.error(`${failed} check${failed === 1 ? "" : "s"} failed`)
  process.exit(1)
}
console.log("checks passed")
