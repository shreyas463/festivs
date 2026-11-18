import type { CSSProperties } from "react"
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
  const particles = card.effects.some((effect) => effect === "sparkle" || effect === "confetti" || effect === "float")
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
        <span className="face front">
          <span className="cover-frame" aria-hidden="true" />
          <span className="cover-body">
            <span className="eyebrow">For</span>
            <span className={nameClass}>{name}</span>
          </span>
          <span className="cover-band">
            <span className="band-rule" aria-hidden="true" />
            <span className="festival-name">{festival.name}</span>
            <span className="band-rule" aria-hidden="true" />
          </span>
        </span>
      </span>
    </span>
  )

  return (
    <div className={open ? "stage is-open" : "stage"}>
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
        <p className="tap-hint">{open ? "Tap the card to close" : "Tap the card to open"}</p>
      )}
      {open && particles ? (
        <Effects key={playId} festival={festival.id} effects={card.effects} colors={festival.bits} />
      ) : null}
    </div>
  )
}
