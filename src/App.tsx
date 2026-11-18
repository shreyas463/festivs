import { useEffect, useRef, useState, type CSSProperties } from "react"
import { CardStage } from "./components/CardStage.tsx"
import { Studio } from "./components/Studio.tsx"
import { festivalById } from "./data/festivals.ts"
import { createDefaultCard, encodeCard, parseHash, type Card } from "./lib/card.ts"
import { downloadCard } from "./lib/image.ts"

function themeOf(card: Card): CSSProperties {
  const festival = festivalById(card.festival)
  return {
    "--ink": festival.ink,
    "--deep": festival.deep,
    "--accent": festival.accent,
    "--gold": festival.gold,
    "--paper": festival.paper,
    "--cover-a": festival.coverA,
    "--cover-b": festival.coverB,
    "--night": festival.night,
    "--wash": festival.wash,
  } as CSSProperties
}

function cardFromAddress(): Card | null {
  return parseHash(location.hash)
}

export default function App() {
  const replayTimer = useRef(0)
  const [card, setCard] = useState<Card>(() => cardFromAddress() ?? createDefaultCard(new Date()))
  const [receive, setReceive] = useState(() => cardFromAddress() !== null)
  const [dirty, setDirty] = useState(() => cardFromAddress() !== null)
  const [open, setOpen] = useState(false)
  const [playId, setPlayId] = useState(0)
  const [copied, setCopied] = useState(false)
  const [saveNote, setSaveNote] = useState("")
  const [fallbackUrl, setFallbackUrl] = useState("")

  useEffect(() => {
    if (!dirty) return
    const next = `#${encodeCard(card)}`
    if (location.hash !== next) history.replaceState(null, "", next)
  }, [card, dirty])

  useEffect(() => {
    const onHash = () => {
      const next = parseHash(location.hash)
      if (!next) return
      setDirty(true)
      setCard(next)
      setReceive(true)
      setOpen(false)
      setFallbackUrl("")
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  useEffect(() => {
    const who = card.to.trim()
    document.title = who ? `For ${who} · Festivs` : "Festivs"
  }, [card.to])

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(id)
  }, [copied])

  useEffect(() => {
    if (!saveNote) return
    const id = window.setTimeout(() => setSaveNote(""), 2000)
    return () => window.clearTimeout(id)
  }, [saveNote])

  useEffect(() => () => window.clearTimeout(replayTimer.current), [])

  function update(next: Card) {
    setDirty(true)
    setFallbackUrl("")
    setCard(next)
  }

  function toggle() {
    if (open) {
      if (!receive) setOpen(false)
      return
    }
    setPlayId((value) => value + 1)
    setOpen(true)
  }

  function replay() {
    setOpen(false)
    window.clearTimeout(replayTimer.current)
    replayTimer.current = window.setTimeout(() => {
      setPlayId((value) => value + 1)
      setOpen(true)
    }, 70)
  }

  async function save() {
    try {
      await downloadCard(card)
      setSaveNote("Image saved")
    } catch {
      setSaveNote("The image could not be saved")
    }
  }

  async function share() {
    setDirty(true)
    const hash = encodeCard(card)
    const url = `${location.origin}${location.pathname}${location.search}#${hash}`
    history.replaceState(null, "", `#${hash}`)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setFallbackUrl("")
    } catch {
      setCopied(false)
      setFallbackUrl(url)
    }
  }

  return (
    <div className="app" style={themeOf(card)}>
      <header className="top">
        <div>
          <h1>Festivs</h1>
          <p className="tag">A holiday card they can open.</p>
        </div>
        <a href="privacy.html">Privacy</a>
      </header>
      <main className={receive ? "layout is-receive" : "layout"}>
        <div className="stage-column">
          <CardStage card={card} open={open} playId={playId} canClose={!receive} onToggle={toggle} />
          {receive ? (
            <div className="receive-actions">
              {open ? (
                <button type="button" className="primary" onClick={replay}>
                  Open again
                </button>
              ) : null}
              <button type="button" className="ghost" onClick={() => void save()}>
                Save image
              </button>
              <button type="button" className="ghost" onClick={() => setReceive(false)}>
                Make your own
              </button>
              {saveNote ? <p className="fine">{saveNote}</p> : null}
            </div>
          ) : null}
        </div>
        {receive ? null : (
          <Studio
            card={card}
            copied={copied}
            fallbackUrl={fallbackUrl}
            onChange={update}
            onShare={() => void share()}
            onReplay={replay}
            onSave={() => void save()}
            saveNote={saveNote}
          />
        )}
      </main>
    </div>
  )
}
