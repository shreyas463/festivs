import type { FestivalId } from "./festivals.ts"

type Mark = {
  festival: FestivalId
  month: number
  day: number
}

const dated: Record<number, Mark[]> = {
  2025: [
    { festival: "newyear", month: 1, day: 1 },
    { festival: "lunar", month: 1, day: 29 },
    { festival: "holi", month: 3, day: 14 },
    { festival: "eid", month: 3, day: 30 },
    { festival: "diwali", month: 10, day: 20 },
    { festival: "christmas", month: 12, day: 25 },
  ],
  2026: [
    { festival: "newyear", month: 1, day: 1 },
    { festival: "lunar", month: 2, day: 17 },
    { festival: "holi", month: 3, day: 3 },
    { festival: "eid", month: 3, day: 20 },
    { festival: "diwali", month: 11, day: 8 },
    { festival: "christmas", month: 12, day: 25 },
  ],
  2027: [
    { festival: "newyear", month: 1, day: 1 },
    { festival: "lunar", month: 2, day: 6 },
    { festival: "holi", month: 3, day: 22 },
    { festival: "eid", month: 3, day: 9 },
    { festival: "diwali", month: 10, day: 29 },
    { festival: "christmas", month: 12, day: 25 },
  ],
  2028: [
    { festival: "newyear", month: 1, day: 1 },
    { festival: "lunar", month: 1, day: 26 },
    { festival: "holi", month: 3, day: 11 },
    { festival: "eid", month: 2, day: 26 },
    { festival: "diwali", month: 10, day: 17 },
    { festival: "christmas", month: 12, day: 25 },
  ],
}

function fourthThursdayNovember(year: number): { month: number; day: number } {
  let thursdays = 0
  for (let day = 1; day <= 30; day += 1) {
    if (new Date(Date.UTC(year, 10, day)).getUTCDay() === 4) {
      thursdays += 1
      if (thursdays === 4) return { month: 11, day }
    }
  }
  return { month: 11, day: 22 }
}

function marksFor(year: number): Mark[] {
  const base =
    dated[year] ?? [
      { festival: "newyear", month: 1, day: 1 },
      { festival: "lunar", month: 2, day: 10 },
      { festival: "holi", month: 3, day: 14 },
      { festival: "eid", month: 3, day: 21 },
      { festival: "diwali", month: 11, day: 1 },
      { festival: "christmas", month: 12, day: 25 },
    ]
  const thanks = fourthThursdayNovember(year)
  return [
    ...base,
    { festival: "thanksgiving", month: thanks.month, day: thanks.day },
    { festival: "blackfriday", month: thanks.month, day: thanks.day + 1 },
  ]
}

function utcDay(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day)
}

export function nearestFestival(date: Date): FestivalId {
  const today = utcDay(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const year = date.getFullYear()
  let best: FestivalId = "christmas"
  let bestAt = 0
  let bestGap = Number.POSITIVE_INFINITY
  for (const candidate of [year - 1, year, year + 1]) {
    for (const mark of marksFor(candidate)) {
      const at = utcDay(candidate, mark.month, mark.day)
      const gap = Math.abs(at - today)
      const nearer = gap < bestGap
      const sameDayPreferUpcoming = gap === bestGap && at >= today && bestAt < today
      if (nearer || sameDayPreferUpcoming) {
        best = mark.festival
        bestAt = at
        bestGap = gap
      }
    }
  }
  return best
}