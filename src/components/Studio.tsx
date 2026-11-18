import type { CSSProperties } from "react"
import { festivals, festivalById, type FestivalId } from "../data/festivals.ts"
import { effectChoices, limits, type Card, type EffectId } from "../lib/card.ts"

type StudioProps = {
  card: Card
  copied: boolean
  fallbackUrl: string
  onChange: (next: Card) => void
  onShare: () => void
  onReplay: () => void
  onSave: () => void
  saveNote: string
}

function count(value: string): number {
  return Array.from(value).length
}

export function Studio({
  card,
  copied,
  fallbackUrl,
  onChange,
  onShare,
  onReplay,
  onSave,
  saveNote,
}: StudioProps) {
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

  return (
    <section className="studio" aria-label="Make a card">
      <h2>Make a card</h2>
      <p className="lede">Write a note, add an effect, and send the link.</p>

      <div className="block">
        <p className="label" id="festival-label">
          Festival
        </p>
        <div className="festival-row" role="radiogroup" aria-labelledby="festival-label">
          {festivals.map((festival) => {
            const on = card.festival === festival.id
            return (
              <button
                key={festival.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={on ? "chip is-on" : "chip"}
                style={{ "--dot": festival.accent } as CSSProperties}
                onClick={() => chooseFestival(festival.id)}
              >
                <i />
                {festival.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="names">
        <label className="block">
          <span className="label">To</span>
          <input
            value={card.to}
            maxLength={limits.to}
            autoComplete="off"
            placeholder="Asha"
            onChange={(event) => onChange({ ...card, to: event.target.value.slice(0, limits.to) })}
          />
        </label>
        <label className="block">
          <span className="label">From</span>
          <input
            value={card.from}
            maxLength={limits.from}
            autoComplete="off"
            placeholder="Your name"
            onChange={(event) => onChange({ ...card, from: event.target.value.slice(0, limits.from) })}
          />
        </label>
      </div>

      <label className="block">
        <span className="label-row">
          <span className="label">Message</span>
          <span className="count">
            {count(card.message)}/{limits.message}
          </span>
        </span>
        <textarea
          value={card.message}
          maxLength={limits.message}
          rows={4}
          placeholder="A short note"
          onChange={(event) => onChange({ ...card, message: event.target.value.slice(0, limits.message) })}
        />
      </label>

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
                className={on ? "effect is-on" : "effect"}
                onClick={() => toggleEffect(choice.id)}
              >
                {choice.label}
              </button>
            )
          })}
        </div>
        <p className="fine">Effects play when the card opens.</p>
      </div>

      <div className="actions">
        <button type="button" className="primary" onClick={onShare}>
          {copied ? "Link copied" : "Copy link"}
        </button>
        <button type="button" className="ghost" onClick={onSave}>
          Save image
        </button>
      </div>
      <button type="button" className="ghost play" onClick={onReplay}>
        Play opening
      </button>
      {saveNote ? <p className="fine">{saveNote}</p> : null}
      {fallbackUrl ? (
        <label className="block">
          <span className="label">Share link</span>
          <input readOnly value={fallbackUrl} onFocus={(event) => event.currentTarget.select()} />
        </label>
      ) : (
        <p className="fine">The address is the link. Anyone with it can open this card.</p>
      )}
    </section>
  )
}
