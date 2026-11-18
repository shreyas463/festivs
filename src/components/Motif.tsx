import type { FestivalId } from "../data/festivals.ts"

type MotifProps = {
  id: FestivalId
}

export function Motif({ id }: MotifProps) {
  if (id === "diwali") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path fill="currentColor" d="M32 8c3.4 6.6 3.2 11.4 0 16.4c-3.2-5-3.4-9.8 0-16.4z" />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
          d="M14 42c2-8 10-12 18-12s16 4 18 12c1 4-2 8-8 8H22c-6 0-9-4-8-8z"
        />
        <path fill="currentColor" d="M20 50h24c-1 4-6 7-12 7s-11-3-12-7z" />
      </svg>
    )
  }
  if (id === "christmas") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="36" r="14" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M32 22v-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="32" cy="12" r="2.2" fill="currentColor" />
        <path d="M24 36h16M32 28v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === "newyear") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path fill="currentColor" d="M32 4l3.4 20.4L56 32l-20.6 3.4L32 60l-3.4-24.6L8 32l20.6-7.6z" />
      </svg>
    )
  }
  if (id === "holi") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="26" cy="36" r="13" fill="currentColor" />
        <circle cx="42" cy="32" r="11" fill="currentColor" opacity="0.55" />
        <circle cx="34" cy="20" r="8" fill="currentColor" opacity="0.75" />
      </svg>
    )
  }
  if (id === "eid") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path fill="currentColor" d="M38 12a20 20 0 1 0 .2 40a15.5 15.5 0 1 1-.2-40z" />
        <circle cx="48" cy="16" r="2.3" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M26 16h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="22" y="18" width="20" height="26" rx="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <path d="M32 44v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="30" r="3" fill="currentColor" />
    </svg>
  )
}
