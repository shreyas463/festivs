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

function drawFloat(ctx: CanvasRenderingContext2D, particle: Particle, festival: FestivalId) {
  ctx.save()
  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rot)
  ctx.globalAlpha = 0.35 + 0.55 * Math.sin((particle.life / particle.max) * Math.PI)
  ctx.fillStyle = particle.color
  ctx.strokeStyle = particle.color
  ctx.shadowColor = particle.color
  ctx.shadowBlur = 12
  ctx.lineWidth = 1.6
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
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.bezierCurveTo(r * 0.7, -r * 0.2, r * 0.5, r * 0.9, 0, r)
    ctx.bezierCurveTo(-r * 0.5, r * 0.9, -r * 0.7, -r * 0.2, 0, -r)
    ctx.fill()
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

    const spawn = (kind: Kind, burst: boolean) => {
      const color = pick(colors)
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
        })
        return
      }
      if (kind === "float") {
        particles.push({
          kind,
          x: burst ? from.x + (Math.random() - 0.5) * 80 : Math.random() * width,
          y: burst ? from.y : height + 20,
          vx: (Math.random() - 0.5) * 1.1,
          vy: burst ? -1.2 - Math.random() * 2.2 : -0.45 - Math.random() * 0.8,
          life: burst ? 0 : Math.random() * 200,
          max: 420,
          size: 12 + Math.random() * 16,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.03,
          color,
          burst,
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
      })
    }

    const tick = (now: number) => {
      if (!alive) return
      const elapsed = now - started
      ctx.clearRect(0, 0, width, height)
      if (ambient) {
        if (particles.length === 0) {
          for (let i = 0; i < 14; i += 1) spawn("float", false)
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
        particle.rot += particle.spin
        if (particle.kind === "confetti") particle.vy += 0.08
        if (particle.life > particle.max || particle.y < -40 || particle.y > height + 40) {
          if (particle.burst || particle.kind === "confetti") particles.splice(i, 1)
          else if (particle.kind === "float") {
            particle.life = 0
            particle.x = Math.random() * width
            particle.y = height + 16
          } else {
            const from = origin()
            particle.life = 0
            particle.x = from.x + (Math.random() - 0.5) * 640
            particle.y = from.y + (Math.random() - 0.5) * 360
          }
          continue
        }
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
