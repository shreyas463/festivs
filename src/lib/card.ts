import { festivalById, isFestival, type FestivalId } from "../data/festivals.ts"
import { nearestFestival } from "../data/season.ts"

export const limits = { to: 40, from: 40, message: 180 }

export const effectIds = ["sparkle", "confetti", "glow", "float"] as const

export type EffectId = (typeof effectIds)[number]

export type Card = {
  festival: FestivalId
  to: string
  from: string
  message: string
  effects: EffectId[]
}

export const effectChoices: { id: EffectId; label: string }[] = [
  { id: "sparkle", label: "Sparkle" },
  { id: "confetti", label: "Confetti" },
  { id: "glow", label: "Glow" },
  { id: "float", label: "Float" },
]

const effectSet = new Set<string>(effectIds)

export function isEffect(value: string): value is EffectId {
  return effectSet.has(value)
}

function clip(value: string, max: number): string {
  return Array.from(value).slice(0, max).join("")
}

function stripControls(value: string, keepNewline: boolean): string {
  let out = ""
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (keepNewline && code === 10) {
      out += "\n"
      continue
    }
    if (code <= 31 || code === 127) continue
    if (code >= 0x202a && code <= 0x202e) continue
    if (code >= 0x2066 && code <= 0x2069) continue
    out += char
  }
  return out
}

export function cleanLine(value: string, max: number): string {
  return clip(stripControls(value, false).replace(/\s+/g, " ").trim(), max)
}

export function cleanMessage(value: string, max: number): string {
  const lines = stripControls(value, true)
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
  return clip(lines.join("\n").trim(), max)
}

export function normalizeEffects(values: readonly string[]): EffectId[] {
  const unique = new Set(values.filter(isEffect))
  return effectIds.filter((id) => unique.has(id))
}

export function createDefaultCard(date: Date): Card {
  const festival = nearestFestival(date)
  return {
    festival,
    to: "",
    from: "",
    message: festivalById(festival).greeting,
    effects: ["sparkle", "float"],
  }
}

export function encodeCard(card: Card): string {
  const params = new URLSearchParams()
  params.set("f", card.festival)
  const to = cleanLine(card.to, limits.to)
  const from = cleanLine(card.from, limits.from)
  const message = cleanMessage(card.message, limits.message)
  if (to) params.set("to", to)
  if (from) params.set("from", from)
  if (message) params.set("m", message)
  const effects = normalizeEffects(card.effects)
  if (effects.length > 0) params.set("e", effects.join("."))
  return params.toString()
}

export function parseHash(hash: string): Card | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash
  if (!raw || raw.length > 2000) return null
  try {
    decodeURIComponent(raw.replace(/\+/g, "%20"))
  } catch {
    return null
  }
  const params = new URLSearchParams(raw)
  const festival = params.get("f") ?? ""
  if (!isFestival(festival)) return null
  const effects = normalizeEffects((params.get("e") ?? "").split("."))
  return {
    festival,
    to: cleanLine(params.get("to") ?? "", limits.to),
    from: cleanLine(params.get("from") ?? "", limits.from),
    message: cleanMessage(params.get("m") ?? "", limits.message),
    effects,
  }
}

export function readCard(date = new Date()): Card {
  if (typeof location === "undefined") return createDefaultCard(date)
  return parseHash(location.hash) ?? createDefaultCard(date)
}

export function shownMessage(card: Card): string {
  return cleanMessage(card.message, limits.message) || festivalById(card.festival).greeting
}
