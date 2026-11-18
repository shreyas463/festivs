import { festivalById } from "../data/festivals.ts"
import { cleanLine, limits, shownMessage, type Card } from "./card.ts"

const width = 800
const height = 1040

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(" ").filter((word) => word.length > 0)
    let line = ""
    for (const word of words) {
      const next = line ? `${line} ${word}` : word
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = next
      }
    }
    if (line) lines.push(line)
  }
  return lines.length > 0 ? lines : [""]
}

export function cardFileName(card: Card): string {
  const slug = cleanLine(card.to, limits.to)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug ? `festivs-for-${slug}.png` : `festivs-${card.festival}.png`
}

export async function cardBlob(card: Card): Promise<Blob> {
  const festival = festivalById(card.festival)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")

  try {
    await document.fonts.load("italic 64px Fraunces")
    await document.fonts.load("36px Fraunces")
    await document.fonts.load("600 22px Outfit")
  } catch {
    // The fallback faces still draw the card.
  }

  const message = shownMessage(card)
  const from = cleanLine(card.from, limits.from)
  const fontSize = message.length > 120 ? 40 : message.length > 70 ? 52 : 64

  roundedRect(ctx, 0, 0, width, height, 48)
  ctx.save()
  ctx.clip()
  const paper = ctx.createLinearGradient(0, 0, 0, height)
  paper.addColorStop(0, festival.paper)
  paper.addColorStop(1, "#fffdf9")
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = festival.gold
  ctx.globalAlpha = 0.85
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(width - 86, height - 86, 18, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `italic ${fontSize}px Fraunces, Georgia, serif`
  const lines = wrapLines(ctx, message, width - 150)
  const lineHeight = Math.round(fontSize * 1.18)
  const group = 56 + lines.length * lineHeight + (from ? 72 : 0)
  let cursor = (height - group) / 2

  ctx.fillStyle = festival.deep
  ctx.font = "600 22px Outfit, sans-serif"
  ctx.fillText(festival.name.toUpperCase(), width / 2, cursor + 12)
  cursor += 56

  ctx.fillStyle = festival.ink
  ctx.font = `italic ${fontSize}px Fraunces, Georgia, serif`
  for (const line of lines) {
    ctx.fillText(line, width / 2, cursor + lineHeight / 2)
    cursor += lineHeight
  }

  if (from) {
    ctx.fillStyle = festival.deep
    ctx.font = "36px Fraunces, Georgia, serif"
    ctx.fillText(`— ${from}`, width / 2, cursor + 36)
  }
  ctx.restore()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("png")
  return blob
}

export async function downloadCard(card: Card): Promise<void> {
  const blob = await cardBlob(card)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = cardFileName(card)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
