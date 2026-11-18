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
  bits: string[]
}

export const festivals: Festival[] = [
  {
    id: "diwali",
    name: "Diwali",
    greeting: "May your home be full of light.",
    ink: "#3c1b12",
    deep: "#7a2e16",
    accent: "#ef8a2a",
    gold: "#e7b15a",
    paper: "#fff6ea",
    coverA: "#6b2140",
    coverB: "#e25a18",
    night: "#2b0c1c",
    wash: "rgba(255, 140, 40, 0.5)",
    bits: ["#ffb15a", "#fff1c9", "#ff7a3c", "#e23d4a"],
  },
  {
    id: "christmas",
    name: "Christmas",
    greeting: "Wishing you a warm and merry Christmas.",
    ink: "#1c2e28",
    deep: "#1e4a3a",
    accent: "#c7363a",
    gold: "#e4c98a",
    paper: "#f6f3eb",
    coverA: "#145244",
    coverB: "#a32032",
    night: "#071c18",
    wash: "rgba(196, 48, 58, 0.42)",
    bits: ["#f7fffb", "#d7efe4", "#e7c98a", "#ffd0d6"],
  },
  {
    id: "newyear",
    name: "New Year",
    greeting: "Cheers to a bright year ahead.",
    ink: "#1b2033",
    deep: "#1d2440",
    accent: "#e6c98a",
    gold: "#f0d78c",
    paper: "#f7f4ec",
    coverA: "#1a2144",
    coverB: "#3d4d86",
    night: "#0c1228",
    wash: "rgba(240, 210, 130, 0.4)",
    bits: ["#f6e7b8", "#fffaf0", "#d9e2ff", "#f0d48a"],
  },
  {
    id: "holi",
    name: "Holi",
    greeting: "May your days burst with color.",
    ink: "#2a1240",
    deep: "#6d28a8",
    accent: "#ff4f8b",
    gold: "#ffc857",
    paper: "#fff8f2",
    coverA: "#d12a78",
    coverB: "#5b2ee0",
    night: "#220a32",
    wash: "rgba(255, 70, 150, 0.45)",
    bits: ["#ff4d8d", "#ffd23f", "#3ec6ff", "#b388ff"],
  },
  {
    id: "eid",
    name: "Eid",
    greeting: "Wishing you peace, joy, and sweet days.",
    ink: "#102e28",
    deep: "#0f5c4c",
    accent: "#1f8a72",
    gold: "#d7b56a",
    paper: "#fbf7ef",
    coverA: "#0c4a40",
    coverB: "#1c8f72",
    night: "#04211c",
    wash: "rgba(40, 180, 140, 0.4)",
    bits: ["#f3e2b3", "#d9fff4", "#8fd9c8", "#fffaf0"],
  },
  {
    id: "lunar",
    name: "Lunar New Year",
    greeting: "Wishing you prosperity and a joyful new year.",
    ink: "#3a1212",
    deep: "#9a1c1c",
    accent: "#e23b2f",
    gold: "#e8c56b",
    paper: "#fff7ef",
    coverA: "#8e1212",
    coverB: "#e23a2c",
    night: "#2c0a0c",
    wash: "rgba(230, 60, 48, 0.45)",
    bits: ["#f0d06a", "#fff4d8", "#ff8b7a", "#fffaf2"],
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving",
    greeting: "Grateful for you today and always.",
    ink: "#3a2210",
    deep: "#8b3d1a",
    accent: "#c85a28",
    gold: "#e8c56b",
    paper: "#fff8ef",
    coverA: "#5c2e14",
    coverB: "#c45a24",
    night: "#1a1008",
    wash: "rgba(200, 120, 40, 0.45)",
    bits: ["#e8c56b", "#ffb15a", "#c45a24", "#fff4d8"],
  },
  {
    id: "blackfriday",
    name: "Black Friday",
    greeting: "Hope you find something wonderful.",
    ink: "#101018",
    deep: "#1c1c2a",
    accent: "#f5c518",
    gold: "#f5c518",
    paper: "#f4f4f6",
    coverA: "#0a0a10",
    coverB: "#2a2a38",
    night: "#050508",
    wash: "rgba(245, 197, 24, 0.35)",
    bits: ["#f5c518", "#ffffff", "#ff3366", "#9aa0b4"],
  },
]

const festivalIds = new Set<string>(festivals.map((festival) => festival.id))

export function isFestival(value: string): value is FestivalId {
  return festivalIds.has(value)
}

export function festivalById(id: FestivalId): Festival {
  return festivals.find((festival) => festival.id === id) ?? festivals[0]
}
