'use client'

import React, { useEffect, useRef } from 'react'

// Easing functions (simplified version of easing-utils)
const easingUtils = {
  linear: (t: number) => t,
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1))
}

interface Disc {
  x: number
  y: number
  w: number
  h: number
  p: number
}

interface Particle {
  x: number
  sx: number
  dx: number
  y: number
  vy: number
  p: number
  r: number
  c: string
}

const TunnelAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let discs: Disc[] = []
    let lines: number[][][] = []
    let particles: Particle[] = []
    let render = { width: 0, height: 0, dpi: window.devicePixelRatio }
    let startDisc: any, endDisc: any, clip: any
    let particleArea: any
    let linesCanvas: OffscreenCanvas
    let linesCtx: OffscreenCanvasRenderingContext2D

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      
      render = {
        width: rect.width,
        height: rect.height,
        dpi: window.devicePixelRatio
      }

      canvas.width = render.width * render.dpi
      canvas.height = render.height * render.dpi
    }

    const tweenValue = (start: number, end: number, p: number, ease?: string) => {
      const delta = end - start
      const easeFn = easingUtils[ease === 'easeInExpo' ? 'easeInExpo' : 'linear']
      return start + delta * easeFn(p)
    }

    const tweenDisc = (disc: any) => {
      disc.x = tweenValue(startDisc.x, endDisc.x, disc.p)
      disc.y = tweenValue(startDisc.y, endDisc.y, disc.p, 'easeInExpo')
      disc.w = tweenValue(startDisc.w, endDisc.w, disc.p)
      disc.h = tweenValue(startDisc.h, endDisc.h, disc.p)
      return disc
    }

    const setDiscs = () => {
      const { width, height } = render

      discs = []

      startDisc = {
        x: width * 0.5,
        y: height * 0.45,
        w: width * 0.75,
        h: height * 0.7
      }

      endDisc = {
        x: width * 0.5,
        y: height * 0.95,
        w: 0,
        h: 0
      }

      const totalDiscs = 100
      let prevBottom = height
      clip = {}

      for (let i = 0; i < totalDiscs; i++) {
        const p = i / totalDiscs
        const disc = tweenDisc({ p })
        const bottom = disc.y + disc.h

        if (bottom <= prevBottom) {
          clip = { disc: { ...disc }, i }
        }

        prevBottom = bottom
        discs.push(disc)
      }

      clip.path = new Path2D()
      clip.path.ellipse(
        clip.disc.x,
        clip.disc.y,
        clip.disc.w,
        clip.disc.h,
        0,
        0,
        Math.PI * 2
      )
      clip.path.rect(
        clip.disc.x - clip.disc.w,
        0,
        clip.disc.w * 2,
        clip.disc.y
      )
    }

    const setLines = () => {
      const { width, height } = render

      lines = []
      const totalLines = 100
      const linesAngle = (Math.PI * 2) / totalLines

      for (let i = 0; i < totalLines; i++) {
        lines.push([])
      }

      discs.forEach((disc) => {
        for (let i = 0; i < totalLines; i++) {
          const angle = i * linesAngle
          const p = {
            x: disc.x + Math.cos(angle) * disc.w,
            y: disc.y + Math.sin(angle) * disc.h
          }
          lines[i].push([p.x, p.y])
        }
      })

      linesCanvas = new OffscreenCanvas(width, height)
      linesCtx = linesCanvas.getContext('2d')!

      lines.forEach((line) => {
        linesCtx.save()

        let lineIsIn = false
        line.forEach((p1, j) => {
          if (j === 0) return

          const p0 = line[j - 1]

          if (
            !lineIsIn &&
            (linesCtx.isPointInPath(clip.path, p1[0], p1[1]) ||
              linesCtx.isPointInStroke(clip.path, p1[0], p1[1]))
          ) {
            lineIsIn = true
          } else if (lineIsIn) {
            linesCtx.clip(clip.path)
          }

          linesCtx.beginPath()
          linesCtx.moveTo(p0[0], p0[1])
          linesCtx.lineTo(p1[0], p1[1])
          linesCtx.strokeStyle = "#444"
          linesCtx.lineWidth = 2
          linesCtx.stroke()
          linesCtx.closePath()
        })

        linesCtx.restore()
      })
    }

    const initParticle = (start = false): Particle => {
      const sx = particleArea.sx + particleArea.sw * Math.random()
      const ex = particleArea.ex + particleArea.ew * Math.random()
      const dx = ex - sx
      const y = start ? particleArea.h * Math.random() : particleArea.h
      const r = 0.5 + Math.random() * 4

      return {
        x: sx,
        sx,
        dx,
        y,
        vy: 0.5 + Math.random(),
        p: 0,
        r,
        c: `rgba(255, 255, 255, ${Math.random()})`
      }
    }

    const setParticles = () => {
      const { width, height } = render

      particles = []

      particleArea = {
        sw: clip.disc.w * 0.5,
        ew: clip.disc.w * 2,
        h: height * 0.85
      }
      particleArea.sx = (width - particleArea.sw) / 2
      particleArea.ex = (width - particleArea.ew) / 2

      const totalParticles = 100

      for (let i = 0; i < totalParticles; i++) {
        const particle = initParticle(true)
        particles.push(particle)
      }
    }

    const drawDiscs = () => {
      ctx.strokeStyle = "#444"
      ctx.lineWidth = 2

      // Outer disc
      const outerDisc = startDisc

      ctx.beginPath()
      ctx.ellipse(
        outerDisc.x,
        outerDisc.y,
        outerDisc.w,
        outerDisc.h,
        0,
        0,
        Math.PI * 2
      )
      ctx.stroke()
      ctx.closePath()

      // Inner discs
      discs.forEach((disc, i) => {
        if (i % 5 !== 0) return

        if (disc.w < clip.disc.w - 5) {
          ctx.save()
          ctx.clip(clip.path)
        }

        ctx.beginPath()
        ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.closePath()

        if (disc.w < clip.disc.w - 5) {
          ctx.restore()
        }
      })
    }

    const drawLines = () => {
      ctx.drawImage(linesCanvas, 0, 0)
    }

    const drawParticles = () => {
      ctx.save()
      ctx.clip(clip.path)

      particles.forEach((particle) => {
        ctx.fillStyle = particle.c
        ctx.beginPath()
        ctx.rect(particle.x, particle.y, particle.r, particle.r)
        ctx.closePath()
        ctx.fill()
      })

      ctx.restore()
    }

    const moveDiscs = () => {
      discs.forEach((disc) => {
        disc.p = (disc.p + 0.001) % 1
        tweenDisc(disc)
      })
    }

    const moveParticles = () => {
      particles.forEach((particle) => {
        particle.p = 1 - particle.y / particleArea.h
        particle.x = particle.sx + particle.dx * particle.p
        particle.y -= particle.vy

        if (particle.y < 0) {
          const newParticle = initParticle()
          particle.y = newParticle.y
          particle.x = newParticle.x
          particle.sx = newParticle.sx
          particle.dx = newParticle.dx
          particle.vy = newParticle.vy
          particle.r = newParticle.r
          particle.c = newParticle.c
        }
      })
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.scale(render.dpi, render.dpi)

      moveDiscs()
      moveParticles()

      drawDiscs()
      drawLines()
      drawParticles()

      ctx.restore()

      animationRef.current = requestAnimationFrame(tick)
    }

    const onResize = () => {
      setSize()
      setDiscs()
      setLines()
      setParticles()
    }

    // Initialize
    setSize()
    setDiscs()
    setLines()
    setParticles()

    window.addEventListener('resize', onResize)
    animationRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', onResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="tunnel-container">
      <canvas ref={canvasRef} className="tunnel-canvas" />
      <div className="tunnel-aura" />
      <div className="tunnel-overlay" />
    </div>
  )
}

export default TunnelAnimation
