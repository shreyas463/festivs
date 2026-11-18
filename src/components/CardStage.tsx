import type { CSSProperties, PointerEvent } from "react"
import { festivalById } from "../data/festivals.ts"
import { cleanLine, limits, shownMessage, type Card } from "../lib/card.ts"
import { Effects } from "./Effects.tsx"
import { Motif } from "./Motif.tsx"

type CardStageProps = {
  card: Card
  open: boolean
  playId: number
  canClose: boolean
  onToggle: () => void
}

function PopMessage({ text, playId }: { text: string; playId: number }) {
  const lines = text.split("\n").map((line) => line.split(" ").filter((word) => word.length > 0))
  const size = text.length > 120 ? "is-long" : text.length > 70 ? "is-mid" : ""
  return (
    <p id="card-message" className={size ? `message ${size}` : "message"}>
      {lines.map((words, lineIndex) => {
        const before = lines.slice(0, lineIndex).reduce((sum, line) => sum + line.length, 0)
        return (
          <span key={`${playId}-${lineIndex}`} className="line">
            {words.map((word, index) => (
              <span
                key={`${playId}-${before + index}`}
                className="word"
                style={{ animationDelay: `${420 + (before + index) * 38}ms` }}
              >
                {word}
              </span>
            ))}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </span>
        )
      })}
    </p>
  )
}

export function CardStage({ card, open, playId, canClose, onToggle }: CardStageProps) {
  const festival = festivalById(card.festival)
  const message = shownMessage(card)
  const to = cleanLine(card.to, limits.to)
  const from = cleanLine(card.from, limits.from)
  const name = to || "you"
  const nameClass = name.length > 18 ? "cover-name is-long" : name.length > 10 ? "cover-name is-mid" : "cover-name"
  const signDelay = `${420 + message.split(/\s+/).filter(Boolean).length * 38 + 80}ms`
  const overlay = card.effects.filter((effect) => effect === "sparkle" || effect === "confetti")
  const glow = card.effects.includes("glow")
  const interactive = !open || canClose
  const className = open ? `card-hit is-open${glow ? " has-glow" : ""}` : "card-hit"
  const scene = (
    <span className="card-scene">
      <span className="card-inside">
        <span className="inside-mark" aria-hidden="true">
          <Motif id={festival.id} />
        </span>
        <span className="inside-kicker">{festival.name}</span>
        <PopMessage key={playId} text={message} playId={playId} />
        {from ? <span className="signoff">— {from}</span> : null}
      </span>
      <span className="lid">
        <span className="face front" data-festival={festival.id}>
          <span className="cover-body">
            <span className="cover-frame" aria-hidden="true" />
            <span className="cover-art" aria-hidden="true">
              <Motif id={festival.id} />
            </span>
            <span className="cover-copy">
              <span className="eyebrow">For</span>
              <span className={nameClass}>{name}</span>
              {from ? <span className="from-line">With love, {from}</span> : null}
              <span className="teaser">A note is waiting…</span>
            </span>
          </span>
          <span className="cover-band">
            <span className="band-rule" aria-hidden="true" />
            <span className="festival-name">{festival.name}</span>
            <span className="band-rule" aria-hidden="true" />
          </span>
          <span className="wax" aria-hidden="true">
            <svg viewBox="0 0 80 88">
              <defs>
                <radialGradient id="wax-fill" cx="32%" cy="28%" r="72%">
                  <stop offset="0%" stopColor="#f0a06a" />
                  <stop offset="42%" stopColor="#c4522a" />
                  <stop offset="100%" stopColor="#6e2410" />
                </radialGradient>
                <clipPath id="wax-left">
                  <rect x="0" y="0" width="40" height="88" />
                </clipPath>
                <clipPath id="wax-right">
                  <rect x="40" y="0" width="40" height="88" />
                </clipPath>
              </defs>
              {(["left", "right"] as const).map((side) => (
                <g key={side} className={`wax-half is-${side}`} clipPath={`url(#wax-${side})`}>
                  <path
                    fill="url(#wax-fill)"
                    d="M40 7c8 0 14 3 18 9 4 6 9 8 11 16 2 9-2 15 0 22-2 8-8 13-15 17-4 8-8 12-14 12s-10-4-14-12c-7-4-13-9-15-17-2-7-2-13 0-22 2-8 7-10 11-16 4-6 10-9 18-9z"
                  />
                  <ellipse cx="30" cy="20" rx="10" ry="7" fill="#fff" opacity="0.28" />
                  <circle cx="40" cy="38" r="15" fill="none" stroke="#4a160c" strokeWidth="1.6" opacity="0.55" />
                  <path
                    fill="#f6d7bc"
                    d="M40 26l1.6 3.4 3.4-.8-1.1 3.4L48 34l-3.4 1.3 1.1 3.4-3.4-.9L40 42l-1.6-3.2-3.4.9 1.1-3.4L32 34l3.6-1.4-1.1-3.4 3.4.8z"
                  />
                </g>
              ))}
            </svg>
          </span>
        </span>
      </span>
    </span>
  )

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`)
    event.currentTarget.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`)
  }

  function untilt(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--tilt-x", "0deg")
    event.currentTarget.style.setProperty("--tilt-y", "0deg")
  }

  return (
    <div
      className={open ? "stage is-open" : "stage"}
      onPointerMove={tilt}
      onPointerLeave={untilt}
    >
      {interactive ? (
        <button
          type="button"
          className={className}
          style={{ "--sign-delay": signDelay } as CSSProperties}
          aria-expanded={open}
          aria-label={open ? "Close the card" : `Open the card for ${to || "you"}`}
          aria-describedby={open ? "card-message" : undefined}
          onClick={onToggle}
        >
          {scene}
        </button>
      ) : (
        <div className={className} style={{ "--sign-delay": signDelay } as CSSProperties}>
          {scene}
        </div>
      )}
      {open && !canClose ? null : (
        <p className="tap-hint">
          {open ? null : <span className="hint-arrow" aria-hidden="true">↑</span>}
          {open ? "Tap the card to close" : "Tap the seal to open"}
        </p>
      )}
      {open && overlay.length > 0 ? (
        <Effects key={playId} festival={festival.id} effects={overlay} colors={festival.bits} />
      ) : null}
    </div>
  )
}
