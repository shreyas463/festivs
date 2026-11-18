export type FestivalId =
  | "diwali"
  | "christmas"
  | "newyear"
  | "holi"
  | "eid"
  | "lunar"
  | "thanksgiving"
  | "blackfriday"

export type Festival = {
  id: FestivalId
  name: string
  greeting: string
  ink: string
  deep: string
  accent: string
  gold: string
  paper: string
  coverA: string
  coverB: string
  night: string
  wash: string
  mist: string
  bits: string[]
}

export const festivals: Festival[] = [
  {
    id: "diwali",
    name: "Diwali",
    greeting: "May your home be full of light.",
    ink: "#3a140c",
    deep: "#9a3418",
    accent: "#ff8a1e",
    gold: "#ffd27a",
    paper: "#fff4e6",
    coverA: "#4a1028",
    coverB: "#ff6a1a",
    night: "#2a0c18",
    wash: "rgba(255, 120, 40, 0.72)",
    mist: "rgba(255, 210, 120, 0.42)",
    bits: ["#ffd27a", "#fff1c4", "#ff7a28", "#ff3d55"],
  },
  {
    id: "christmas",
    name: "Christmas",
    greeting: "Wishing you a warm and merry Christmas.",
    ink: "#10241e",
    deep: "#0f6b4c",
    accent: "#e23b45",
    gold: "#f3d48a",
    paper: "#f7f4ec",
    coverA: "#0c3d32",
    coverB: "#d1263c",
    night: "#06241c",
    wash: "rgba(226, 59, 69, 0.62)",
    mist: "rgba(140, 230, 190, 0.38)",
    bits: ["#fff", "#d8f5e8", "#f3d48a", "#ff8aa0"],
  },
  {
    id: "newyear",
    name: "New Year",
    greeting: "Cheers to a bright year ahead.",
    ink: "#14182c",
    deep: "#2a3878",
    accent: "#f0d48a",
    gold: "#ffe7a8",
    paper: "#f6f3ea",
    coverA: "#10163a",
    coverB: "#3c4cae",
    night: "#10183a",
    wash: "rgba(240, 212, 138, 0.55)",
    mist: "rgba(150, 170, 255, 0.42)",
    bits: ["#ffe7a8", "#fff", "#b9c6ff", "#f0d48a"],
  },
  {
    id: "holi",
    name: "Holi",
    greeting: "May your days burst with color.",
    ink: "#2a0e3a",
    deep: "#7a22b8",
    accent: "#ff3d8a",
    gold: "#ffd15c",
    paper: "#fff6f8",
    coverA: "#e01878",
    coverB: "#5b22e0",
    night: "#2a0a28",
    wash: "rgba(255, 60, 150, 0.62)",
    mist: "rgba(90, 180, 255, 0.4)",
    bits: ["#ff4d8d", "#ffd23f", "#3ec6ff", "#d08cff"],
  },
  {
    id: "eid",
    name: "Eid",
    greeting: "Wishing you peace, joy, and sweet days.",
    ink: "#0c2a24",
    deep: "#0d6b58",
    accent: "#1fbf9a",
    gold: "#e6c56a",
    paper: "#f8f4ea",
    coverA: "#073e36",
    coverB: "#12a07e",
    night: "#06302a",
    wash: "rgba(31, 191, 154, 0.58)",
    mist: "rgba(230, 197, 106, 0.4)",
    bits: ["#f3e2b3", "#d9fff4", "#5ee0c0", "#fff"],
  },
  {
    id: "lunar",
    name: "Lunar New Year",
    greeting: "Wishing you prosperity and a joyful new year.",
    ink: "#3a1010",
    deep: "#b01818",
    accent: "#ff4a3a",
    gold: "#f0c85a",
    paper: "#fff6ee",
    coverA: "#8a1014",
    coverB: "#e22c24",
    night: "#3a0c10",
    wash: "rgba(255, 70, 50, 0.6)",
    mist: "rgba(240, 200, 90, 0.42)",
    bits: ["#f0c85a", "#fff4d0", "#ff6a5a", "#fff"],
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving",
    greeting: "Grateful for you today and always.",
    ink: "#3a1c0c",
    deep: "#a34a1c",
    accent: "#e87830",
    gold: "#f0c56a",
    paper: "#fff6ec",
    coverA: "#4a220e",
    coverB: "#e06828",
    night: "#3a1c10",
    wash: "rgba(232, 120, 48, 0.66)",
    mist: "rgba(240, 197, 106, 0.48)",
    bits: ["#f0c56a", "#ffb15a", "#e06828", "#fff4d8"],
  },
  {
    id: "blackfriday",
    name: "Black Friday",
    greeting: "Hope you find something wonderful.",
    ink: "#12121a",
    deep: "#242432",
    accent: "#ffd000",
    gold: "#ffd000",
    paper: "#f4f4f8",
    coverA: "#07070c",
    coverB: "#16161f",
    night: "#101018",
    wash: "rgba(255, 208, 0, 0.5)",
    mist: "rgba(255, 61, 110, 0.38)",
    bits: ["#ffd000", "#fff", "#ff3d6e", "#c8cce0"],
  },
]

const festivalIds = new Set<string>(festivals.map((festival) => festival.id))

export function isFestival(value: string): value is FestivalId {
  return festivalIds.has(value)
}

export function festivalById(id: FestivalId): Festival {
  return festivals.find((festival) => festival.id === id) ?? festivals[0]
}
