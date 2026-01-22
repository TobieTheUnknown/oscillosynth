/**
 * XY Oscilloscope (Lissajous)
 * Phase correlation visualization
 */

import { useRef, useEffect } from 'react'
import { audioEngine } from '../audio/AudioEngine'

interface OscilloscopeXYProps {
  width?: number
  height?: number
  children?: React.ReactNode
}

export function OscilloscopeXY({ width = 400, height = 400, children }: OscilloscopeXYProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const render = () => {
      const pipeline = audioEngine.getPipeline()
      if (!pipeline) {
        animationId = requestAnimationFrame(render)
        return
      }

      // Get waveform data
      const waveform = pipeline.getWaveform()

      // Fade out previous frame for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 1

      // Center cross
      ctx.beginPath()
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height)
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Circular grid
      const circles = 4
      for (let i = 1; i <= circles; i++) {
        const radius = (Math.min(width, height) / 2) * (i / circles)
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // XY plot - use waveform with offset
      const centerX = width / 2
      const centerY = height / 2
      const scale = Math.min(width, height) * 0.4

      const points: Array<{ x: number; y: number }> = []
      const halfLen = Math.floor(waveform.length / 2)

      // Get idle color from CSS variable
      const idleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-idle').trim() || '#4ECDC4'

      ctx.strokeStyle = idleColor
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.shadowColor = idleColor

      ctx.beginPath()
      for (let i = 0; i < halfLen; i++) {
        const x = centerX + (waveform[i] ?? 0) * scale
        const y = centerY + (waveform[i + halfLen] ?? 0) * scale

        points.push({ x, y })

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw brighter dots at ends
      if (points.length > 0) {
        const start = points[0]
        const end = points[points.length - 1]

        if (start && end) {
          // Start point - use idle color
          ctx.fillStyle = idleColor
          ctx.shadowBlur = 12
          ctx.shadowColor = idleColor
          ctx.beginPath()
          ctx.arc(start.x, start.y, 3, 0, Math.PI * 2)
          ctx.fill()

          // End point - slightly different shade
          ctx.fillStyle = idleColor
          ctx.shadowColor = idleColor
          ctx.globalAlpha = 0.6
          ctx.beginPath()
          ctx.arc(end.x, end.y, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.shadowBlur = 0
        }
      }

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [width, height])

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-2)',
          left: 'var(--spacing-2)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          opacity: 0.7,
          textShadow: '0 0 4px #000',
        }}
      >
        XY OSCILLOSCOPE
      </div>
      {children}
    </div>
  )
}
