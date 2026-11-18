import { useEffect, useRef } from "react"
import type { FestivalId } from "../data/festivals.ts"
import type { EffectId } from "../lib/card.ts"

type EffectsProps = {
  festival: FestivalId
  effects: readonly EffectId[]
  colors: readonly string[]
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
}

function pick(colors: readonly string[]): string {
  return colors[Math.floor(Math.random() * colors.length)] ?? "#fff6e4"
}

function drawSparkle(ctx: CanvasRenderingContext2D, particle: Particle) {
  const alpha = Math.sin((particle.life / particle.max) * Math.PI)
  const reach = particle.size
  const waist = reach * 0.16
  ctx.save()
  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rot)
  ctx.globalAlpha = alpha
  ctx.fillStyle = particle.color
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
  ctx.restore()
}

function drawConfetti(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save()
  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rot)
  ctx.globalAlpha = Math.max(0, 1 - particle.life / particle.max)
  ctx.fillStyle = particle.color
  ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2)
  ctx.restore()
}

function drawFloat(ctx: CanvasRenderingContext2D, particle: Particle, festival: FestivalId) {
  ctx.save()
  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rot)
  ctx.globalAlpha = 0.85
  ctx.fillStyle = particle.color
  ctx.strokeStyle = particle.color
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

export function Effects({ festival, effects, colors }: EffectsProps) {
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
    let width = 0
    let height = 0
    const started = performance.now()

    const measure = () => {
      width = parent.clientWidth
      height = parent.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const bitmapW = Math.max(1, Math.floor(width * dpr))
      const bitmapH = Math.max(1, Math.floor(height * dpr))
      if (canvas.width !== bitmapW) canvas.width = bitmapW
      if (canvas.height !== bitmapH) canvas.height = bitmapH
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(parent)

    const spawn = (kind: Kind, width: number, height: number) => {
      const color = pick(colors)
      if (kind === "confetti") {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.7
        const speed = 3.2 + Math.random() * 5.4
        particles.push({
          kind,
          x: width / 2,
          y: height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 90 + Math.random() * 40,
          size: 7 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.2,
          color,
        })
        return
      }
      if (kind === "float") {
        particles.push({
          kind,
          x: Math.random() * width,
          y: height * (0.35 + Math.random() * 0.7),
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.35 - Math.random() * 0.55,
          life: Math.random() * 200,
          max: 320,
          size: 7 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.02,
          color,
        })
        return
      }
      particles.push({
        kind,
        x: width * (0.18 + Math.random() * 0.64),
        y: height * (0.16 + Math.random() * 0.68),
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.25,
        life: Math.random() * 80,
        max: 80 + Math.random() * 50,
        size: 8 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.04,
        color,
      })
    }

    const tick = (now: number) => {
      if (!alive) return
      const elapsed = now - started
      ctx.clearRect(0, 0, width, height)
      if (elapsed > 380) {
        if (wantsConfetti && !confettiBorn) {
          confettiBorn = true
          for (let i = 0; i < 70; i += 1) spawn("confetti", width, height)
        }
        if (wantsSparkle) {
          const count = particles.filter((particle) => particle.kind === "sparkle").length
          for (let i = count; i < 10; i += 1) spawn("sparkle", width, height)
        }
        if (wantsFloat) {
          const count = particles.filter((particle) => particle.kind === "float").length
          for (let i = count; i < 14; i += 1) spawn("float", width, height)
        }
      }
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i]
        particle.life += 1
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rot += particle.spin
        if (particle.kind === "confetti") particle.vy += 0.08
        if (particle.life > particle.max || particle.y < -30 || particle.y > height + 30) {
          if (particle.kind === "confetti") particles.splice(i, 1)
          else {
            particle.life = 0
            particle.x = Math.random() * width
            particle.y = particle.kind === "float" ? height + 10 : Math.random() * height
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
      observer.disconnect()
    }
  }, [colors, enabled, festival])

  return <canvas ref={ref} className="fx" aria-hidden="true" />
}
