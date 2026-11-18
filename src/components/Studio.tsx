import type { CSSProperties } from "react"
import { festivals, festivalById, type FestivalId } from "../data/festivals.ts"
import { effectChoices, limits, type Card, type EffectId } from "../lib/card.ts"

type StudioProps = {
  card: Card
  copied: boolean
  fallbackUrl: string
  shareUrl: string
  onChange: (next: Card) => void
  onShare: () => void
  onReplay: () => void
  onSave: () => void
  onPreview: () => void
  saveNote: string
}

const ideas = [
  { label: "Greeting", text: "" },
  { label: "Thinking of you", text: "Thinking of you today." },
  { label: "A bright day", text: "Wishing you a bright and gentle day." },
]

function count(value: string): number {
  return Array.from(value).length
}

function EffectIcon({ id }: { id: EffectId }) {
  if (id === "sparkle") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" />
      </svg>
    )
  }
  if (id === "confetti") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M4 16l6-8 2 3 3-4 5 9z" />
      </svg>
    )
  }
  if (id === "glow") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3c2 4 6 6 6 11a6 6 0 1 1-12 0c0-5 4-7 6-11z" />
    </svg>
  )
}

export function Studio({
  card,
  copied,
  fallbackUrl,
  shareUrl,
  onChange,
  onShare,
  onReplay,
  onSave,
  onPreview,
  saveNote,
}: StudioProps) {
  const holidays = festivals.filter((festival) => festival.id !== "blackfriday")
  const seasonal = festivals.filter((festival) => festival.id === "blackfriday")

  function chooseFestival(id: FestivalId) {
    const current = festivalById(card.festival)
    const next = festivalById(id)
    const message = card.message.trim() === "" || card.message === current.greeting ? next.greeting : card.message
    onChange({ ...card, festival: id, message })
  }

  function toggleEffect(id: EffectId) {
    const effects = card.effects.includes(id)
      ? card.effects.filter((effect) => effect !== id)
      : [...card.effects, id]
    onChange({ ...card, effects })
  }

  function thumb(festival: (typeof festivals)[number]) {
    const on = card.festival === festival.id
    return (
      <button
        key={festival.id}
        type="button"
        role="radio"
        aria-checked={on}
        className={on ? "thumb is-on" : "thumb"}
        style={{ "--cover-a": festival.coverA, "--cover-b": festival.coverB } as CSSProperties}
        onClick={() => chooseFestival(festival.id)}
      >
        <span className="thumb-art" />
        <span className="thumb-name">{festival.name}</span>
      </button>
    )
  }

  return (
    <section className="studio" aria-label="Make a card">
      <div className="studio-scroll">
        <h2>Make a card</h2>
        <p className="lede">Write a note, add an effect, and send the link.</p>

        <div className="block">
          <p className="label" id="festival-label">
            Festival
          </p>
          <div className="thumb-row" role="radiogroup" aria-labelledby="festival-label">
            {holidays.map(thumb)}
          </div>
          <p className="label seasonal-label" id="seasonal-label">
            Seasonal
          </p>
          <div className="thumb-row" role="radiogroup" aria-labelledby="seasonal-label">
            {seasonal.map(thumb)}
          </div>
        </div>

        <div className="names">
          <label className="block">
            <span className="label">To</span>
            <input
              value={card.to}
              maxLength={limits.to}
              autoComplete="off"
              placeholder="e.g. Asha"
              onChange={(event) => onChange({ ...card, to: event.target.value.slice(0, limits.to) })}
            />
          </label>
          <label className="block">
            <span className="label">From</span>
            <input
              value={card.from}
              maxLength={limits.from}
              autoComplete="off"
              placeholder="e.g. Sam"
              onChange={(event) => onChange({ ...card, from: event.target.value.slice(0, limits.from) })}
            />
          </label>
        </div>

        <div className="block">
          <span className="label" id="message-label">
            Message
          </span>
          <div className="message-field">
            <textarea
              aria-labelledby="message-label"
              value={card.message}
              maxLength={limits.message}
              rows={4}
              placeholder="A short note"
              onChange={(event) => onChange({ ...card, message: event.target.value.slice(0, limits.message) })}
            />
            <span className="count">
              {count(card.message)}/{limits.message}
            </span>
          </div>
          <div className="ideas" aria-label="Message ideas">
            {ideas.map((idea) => {
              const text = idea.text || festivalById(card.festival).greeting
              return (
                <button
                  key={idea.label}
                  type="button"
                  className="idea"
                  onClick={() => onChange({ ...card, message: text.slice(0, limits.message) })}
                >
                  {idea.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="block">
          <p className="label" id="effect-label">
            Effects
          </p>
          <div className="effect-grid" role="group" aria-labelledby="effect-label">
            {effectChoices.map((choice) => {
              const on = card.effects.includes(choice.id)
              return (
                <button
                  key={choice.id}
                  type="button"
                  aria-pressed={on}
                  className={on ? "switch is-on" : "switch"}
                  onClick={() => toggleEffect(choice.id)}
                >
                  <EffectIcon id={choice.id} />
                  <span>{choice.label}</span>
                  <span className="switch-ui" aria-hidden="true" />
                </button>
              )
            })}
          </div>
          <p className="fine">Turn on any mix. They play when the card opens.</p>
        </div>
      </div>

      <div className="dock">
        <div className="actions">
          <button type="button" className="primary" onClick={onShare}>
            {copied ? "Link copied" : "Copy link"}
          </button>
          <button type="button" className="ghost" onClick={onSave}>
            Save image
          </button>
        </div>
        <div className="share-row">
          <button type="button" className="text-btn" onClick={onReplay}>
            Play opening
          </button>
          <button type="button" className="text-btn" onClick={onPreview}>
            Preview as recipient
          </button>
          <a className="text-btn" href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}>
            WhatsApp
          </a>
          <a
            className="text-btn"
            href={`mailto:?subject=${encodeURIComponent("A card for you")}&body=${encodeURIComponent(shareUrl)}`}
          >
            Email
          </a>
        </div>
        {saveNote ? <p className="fine">{saveNote}</p> : null}
        {fallbackUrl ? (
          <label className="block">
            <span className="label">Share link</span>
            <input readOnly value={fallbackUrl} onFocus={(event) => event.currentTarget.select()} />
          </label>
        ) : (
          <p className="fine">No sign-up. The card stays in the link.</p>
        )}
      </div>
    </section>
  )
}
