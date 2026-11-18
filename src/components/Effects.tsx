import { useEffect, useRef } from "react"
import type { FestivalId } from "../data/festivals.ts"
import type { EffectId } from "../lib/card.ts"

type EffectsProps = {
  festival: FestivalId
  effects: readonly EffectId[]
  colors: readonly string[]
  ambient?: boolean
}

type Kind = "sparkle" | "confetti" | "float"

type Particle = {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  rot: number
  spin: number
  color: string
  burst: boolean
  layer: number
}

function pick(colors: readonly string[]): string {
  return colors[Math.floor(Math.random() * colors.length)] ?? "#fff6e4"
}

function star(ctx: CanvasRenderingContext2D, reach: number, waist: number) {
  ctx.beginPath()
  ctx.moveTo(0, -reach)
  ctx.lineTo(waist, -waist)
  ctx.lineTo(reach, 0)
  ctx.lineTo(waist, waist)
  ctx.lineTo(0, reach)
  ctx.lineTo(-waist, waist)
  ctx.lineTo(-reach, 0)
  ctx.lineTo(-waist, -waist)
  ctx.closePath()
  ctx.fill()
}

function drawSparkle(ctx: CanvasRenderingContext2D, particle: Particle) {
  const alpha = Math.sin((particle.life / particle.max) * Math.PI)
  const reach = particle.size
  ctx.save()
  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rot)
  ctx.shadowColor = particle.color
  ctx.shadowBlur = reach * 2.4
  ctx.fillStyle = "#fff"
  ctx.globalAlpha = alpha
  star(ctx, reach * 0.55, reach * 0.1)
  ctx.shadowBlur = reach * 1.2
  ctx.fillStyle = particle.color
  star(ctx, reach, reach * 0.16)
  ctx.rotate(Math.PI / 4)
  ctx.globalAlpha = alpha * 0.85
  star(ctx, reach * 0.42, reach * 0.07)
  ctx.restore()
}

function drawConfetti(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save()
  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rot)
  ctx.globalAlpha = Math.max(0, 1 - particle.life / particle.max)
  ctx.shadowColor = particle.color
  ctx.shadowBlur = 8
  ctx.fillStyle = particle.color
  const wide = particle.size % 2 > 0.8
  if (wide) ctx.fillRect(-particle.size * 0.7, -particle.size * 0.18, particle.size * 1.4, particle.size * 0.36)
  else ctx.fillRect(-particle.size * 0.28, -particle.size * 0.45, particle.size * 0.56, particle.size * 0.9)
  ctx.restore()
}

function drawMaple(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.lineTo(r * 0.28, -r * 0.42)
  ctx.lineTo(r * 0.82, -r * 0.55)
  ctx.lineTo(r * 0.48, -r * 0.05)
  ctx.lineTo(r * 0.95, r * 0.08)
  ctx.lineTo(r * 0.42, r * 0.28)
  ctx.lineTo(r * 0.62, r * 0.78)
  ctx.lineTo(r * 0.12, r * 0.42)
  ctx.lineTo(0, r * 0.95)
  ctx.lineTo(-r * 0.12, r * 0.42)
  ctx.lineTo(-r * 0.62, r * 0.78)
  ctx.lineTo(-r * 0.42, r * 0.28)
  ctx.lineTo(-r * 0.95, r * 0.08)
  ctx.lineTo(-r * 0.48, -r * 0.05)
  ctx.lineTo(-r * 0.82, -r * 0.55)
  ctx.lineTo(-r * 0.28, -r * 0.42)
  ctx.closePath()
  ctx.fill()
}

function drawWheat(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  ctx.moveTo(0, r)
  ctx.lineTo(0, -r)
  ctx.stroke()
  for (let i = 0; i < 4; i += 1) {
    const y = -r * 0.85 + i * r * 0.38
    ctx.beginPath()
    ctx.ellipse(-r * 0.32, y, r * 0.16, r * 0.28, -0.5, 0, Math.PI * 2)
    ctx.ellipse(r * 0.32, y, r * 0.16, r * 0.28, 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawFloat(ctx: CanvasRenderingContext2D, particle: Particle, festival: FestivalId) {
  ctx.save()
  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rot)
  const near = particle.layer === 2
  ctx.filter = near ? "blur(2.5px)" : "none"
  ctx.globalAlpha = near ? 0.55 : particle.layer === 0 ? 0.95 : 0.9
  ctx.fillStyle = particle.color
  ctx.strokeStyle = particle.color
  ctx.shadowColor = particle.color
  ctx.shadowBlur = near ? 8 : 0
  ctx.lineWidth = 1.4
  const r = particle.size
  if (festival === "christmas") {
    ctx.beginPath()
    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 4)
      ctx.moveTo(0, 0)
      ctx.lineTo(0, -r)
    }
    ctx.stroke()
  } else if (festival === "eid") {
    ctx.beginPath()
    ctx.arc(r * 0.15, 0, r * 0.7, 0.6, Math.PI * 1.7)
    ctx.stroke()
  } else if (festival === "lunar") {
    ctx.strokeRect(-r * 0.4, -r * 0.45, r * 0.8, r)
    ctx.beginPath()
    ctx.moveTo(0, r * 0.55)
    ctx.lineTo(0, r)
    ctx.stroke()
  } else if (festival === "newyear") {
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
    ctx.stroke()
  } else if (festival === "holi") {
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
    ctx.fill()
  } else if (festival === "thanksgiving") {
    if (Math.round(particle.size) % 5 === 0) drawWheat(ctx, r)
    else drawMaple(ctx, r)
  } else if (festival === "blackfriday") {
    ctx.strokeRect(-r * 0.55, -r * 0.35, r * 1.1, r * 0.7)
    ctx.beginPath()
    ctx.moveTo(-r * 0.2, -r * 0.35)
    ctx.lineTo(-r * 0.2, -r * 0.65)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.bezierCurveTo(r, -r * 0.2, r * 0.55, r * 0.7, 0, r)
    ctx.bezierCurveTo(-r * 0.55, r * 0.7, -r, -r * 0.2, 0, -r)
    ctx.fill()
  }
  ctx.filter = "none"
  ctx.restore()
}

export function Effects({ festival, effects, colors, ambient = false }: EffectsProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const enabled = effects.join(".")

  useEffect(() => {
    const canvas = ref.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const wantsSparkle = enabled.includes("sparkle")
    const wantsConfetti = enabled.includes("confetti")
    const wantsFloat = enabled.includes("float")
    const particles: Particle[] = []
    let alive = true
    let raf = 0
    let confettiBorn = false
    let sparkBurst = false
    let width = 0
    let height = 0
    const started = performance.now()

    const origin = () => {
      const scene = parent.querySelector(".card-scene")
      if (!scene) return { x: width * 0.34, y: height * 0.46 }
      const rect = scene.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 }
    }

    const measure = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const bitmapW = Math.max(1, Math.floor(width * dpr))
      const bitmapH = Math.max(1, Math.floor(height * dpr))
      if (canvas.width !== bitmapW) canvas.width = bitmapW
      if (canvas.height !== bitmapH) canvas.height = bitmapH
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    measure()
    window.addEventListener("resize", measure)
    const observer = new ResizeObserver(measure)
    observer.observe(document.documentElement)

    const leafInk = ["#ffb15a", "#ff8a3d", "#e25b24", "#ffd27a", "#f08a32"]
    const spawn = (kind: Kind, burst: boolean) => {
      const color =
        kind === "float" && festival === "thanksgiving"
          ? leafInk[Math.floor(Math.random() * leafInk.length)]
          : pick(colors)
      const from = origin()
      if (kind === "confetti") {
        const angle = Math.random() * Math.PI * 2
        const speed = 4 + Math.random() * 9
        particles.push({
          kind,
          x: from.x,
          y: from.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 0,
          max: 110 + Math.random() * 50,
          size: 8 + Math.random() * 10,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.28,
          color,
          burst: true,
          layer: 1,
        })
        return
      }
      if (kind === "float") {
        const spot = ambient ? edgeSpot() : { x: from.x + (Math.random() - 0.5) * 80, y: from.y }
        const layer = ambient ? 1 : 1
        const size = layer === 2 ? 30 + Math.random() * 10 : layer === 0 ? 6 + Math.random() * 3 : 14 + Math.random() * 6
        particles.push({
          kind,
          x: spot.x,
          y: spot.y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: burst ? -1.2 - Math.random() * 2.2 : -0.18 - Math.random() * 0.32,
          life: burst ? 0 : Math.random() * 200,
          max: 560,
          size,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.01,
          color,
          burst,
          layer,
        })
        return
      }
      const angle = Math.random() * Math.PI * 2
      const speed = burst ? 3.5 + Math.random() * 8 : 0.15 + Math.random() * 0.35
      particles.push({
        kind,
        x: burst ? from.x : from.x + (Math.random() - 0.5) * Math.min(width, 720),
        y: burst ? from.y : from.y + (Math.random() - 0.5) * 420,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * (burst ? 1 : 0.4),
        life: burst ? 0 : Math.random() * 40,
        max: burst ? 50 + Math.random() * 30 : 90 + Math.random() * 70,
        size: burst ? 16 + Math.random() * 18 : 8 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * (burst ? 0.2 : 0.05),
        color,
        burst,
        layer: 1,
      })
    }

    const edgeSpot = () => {
      const card = origin()
      const side = Math.random()
      let x = Math.random() * width
      let y = Math.random() * height
      if (side < 0.7) {
        x = Math.random() < 0.5 ? Math.random() * width * 0.24 : width * (0.76 + Math.random() * 0.24)
        y = Math.random() * height
      } else if (Math.random() < 0.5) {
        y = Math.random() * height * 0.18
      } else {
        y = height * (0.82 + Math.random() * 0.18)
      }
      if (Math.abs(x - card.x) < 200 && y > card.y - 40 && y < card.y + 460) {
        x = x < width / 2 ? width * 0.06 : width * 0.94
      }
      return { x, y }
    }

    const spawnLayer = (layer: number) => {
      const ink = ["#ffb15a", "#ff8a3d", "#e25b24", "#ffd27a", "#f08a32"]
      const spot = edgeSpot()
      const size = layer === 2 ? 30 + Math.random() * 12 : layer === 0 ? 6 + Math.random() * 3 : 14 + Math.random() * 7
      particles.push({
        kind: "float",
        x: spot.x,
        y: spot.y,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -0.16 - Math.random() * 0.3,
        life: Math.random() * 200,
        max: 560,
        size,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.01,
        color: festival === "thanksgiving" ? ink[Math.floor(Math.random() * ink.length)] ?? "#ffb15a" : pick(colors),
        burst: false,
        layer,
      })
    }

    const tick = (now: number) => {
      if (!alive) return
      const elapsed = now - started
      ctx.clearRect(0, 0, width, height)
      if (ambient) {
        if (particles.length === 0) {
          const plan = width < 760 ? [2, 1, 1, 1, 1, 0, 0, 0] : [2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
          for (const layer of plan) spawnLayer(layer)
        }
      } else if (elapsed > 280) {
        if (wantsSparkle && !sparkBurst) {
          sparkBurst = true
          for (let i = 0; i < 42; i += 1) spawn("sparkle", true)
        }
        if (wantsConfetti && !confettiBorn) {
          confettiBorn = true
          for (let i = 0; i < 120; i += 1) spawn("confetti", true)
        }
        if (wantsFloat && particles.every((particle) => particle.kind !== "float")) {
          for (let i = 0; i < 28; i += 1) spawn("float", i < 10)
        }
        if (wantsSparkle) {
          const count = particles.filter((particle) => particle.kind === "sparkle" && !particle.burst).length
          for (let i = count; i < 16; i += 1) spawn("sparkle", false)
        }
      }
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i]
        particle.life += 1
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.kind === "float") {
          particle.x += Math.sin((particle.life + particle.size * 12) * 0.025) * 0.55
        }
        particle.rot += particle.spin
        if (particle.kind === "confetti") particle.vy += 0.08
        if (particle.life > particle.max || particle.y < -40 || particle.y > height + 40) {
          if (particle.burst || particle.kind === "confetti") particles.splice(i, 1)
          else if (particle.kind === "float") {
            const spot = edgeSpot()
            particle.life = 0
            particle.x = spot.x
            particle.y = height + 16
          } else {
            const from = origin()
            particle.life = 0
            particle.x = from.x + (Math.random() - 0.5) * 640
            particle.y = from.y + (Math.random() - 0.5) * 360
          }
          continue
        }
      }
      const drawList = particles.slice().sort((a, b) => a.layer - b.layer)
      for (const particle of drawList) {
        if (particle.kind === "sparkle") drawSparkle(ctx, particle)
        else if (particle.kind === "confetti") drawConfetti(ctx, particle)
        else drawFloat(ctx, particle, festival)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", measure)
      observer.disconnect()
    }
  }, [ambient, colors, enabled, festival])

  return <canvas ref={ref} className={ambient ? "fx fx-ambient" : "fx"} aria-hidden="true" />
}
