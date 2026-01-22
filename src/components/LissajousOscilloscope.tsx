/**
 * Lissajous Oscilloscope
 * Generates Lissajous patterns from LFO parameters
 */

import { useRef, useEffect } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { WaveformType } from '../audio/types'

interface LissajousOscilloscopeProps {
  width?: number
  height?: number
}

// Generate waveform value at time t for given parameters
function generateWaveformValue(
  time: number,
  rate: number,
  phase: number,
  waveform: WaveformType
): number {
  const phaseRad = (phase / 360) * Math.PI * 2
  const omega = rate * Math.PI * 2
  const totalPhase = omega * time + phaseRad

  switch (waveform) {
    case WaveformType.SINE:
      return Math.sin(totalPhase)
    case WaveformType.TRIANGLE: {
      const normalizedPhase = (totalPhase % (Math.PI * 2)) / (Math.PI * 2)
      return normalizedPhase < 0.5 ? normalizedPhase * 4 - 1 : 3 - normalizedPhase * 4
    }
    case WaveformType.SAWTOOTH: {
      const normalizedPhase = (totalPhase % (Math.PI * 2)) / (Math.PI * 2)
      return normalizedPhase * 2 - 1
    }
    case WaveformType.SQUARE:
      return totalPhase % (Math.PI * 2) < Math.PI ? 1 : -1
    default:
      return Math.sin(totalPhase)
  }
}

export function LissajousOscilloscope({ width = 500, height = 500 }: LissajousOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const render = (timestamp: number) => {
      const lfoEngine = audioEngine.getGlobalLFOEngine()
      if (!lfoEngine) {
        animationId = requestAnimationFrame(render)
        return
      }

      // Get LFO parameters for Pair 1 (indexes 0 and 1)
      const lfo1 = lfoEngine.getLFO(0)
      const lfo2 = lfoEngine.getLFO(1)
      const params1 = lfo1.params
      const params2 = lfo2.params

      // Update time
      timeRef.current = timestamp / 1000 // Convert to seconds

      // Fade out previous frame for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)'
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

      // Generate Lissajous pattern from LFO parameters
      const centerX = width / 2
      const centerY = height / 2
      const scale = Math.min(width, height) * 0.42

      // Calculate how many seconds to display based on LCM of periods
      const period1 = params1.rate > 0 ? 1 / params1.rate : 1
      const period2 = params2.rate > 0 ? 1 / params2.rate : 1
      const displayDuration = Math.max(period1, period2) * 4 // Show 4 cycles of slower LFO

      const numPoints = 1000 // Number of points to draw
      const points: Array<{ x: number; y: number }> = []

      // Generate Lissajous curve
      ctx.strokeStyle = '#00FF41'
      ctx.lineWidth = 2.5
      ctx.shadowBlur = 10
      ctx.shadowColor = '#00FF41'

      ctx.beginPath()
      for (let i = 0; i < numPoints; i++) {
        const t = timeRef.current + (i / numPoints) * displayDuration

        // Generate X from LFO 1
        const xValue = generateWaveformValue(t, params1.rate, params1.phase, params1.waveform)
        const xScaled = xValue * (params1.depth / 100)

        // Generate Y from LFO 2
        const yValue = generateWaveformValue(t, params2.rate, params2.phase, params2.waveform)
        const yScaled = yValue * (params2.depth / 100)

        const x = centerX + xScaled * scale
        const y = centerY + yScaled * scale

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
          ctx.fillStyle = '#00FFFF'
          ctx.shadowBlur = 12
          ctx.shadowColor = '#00FFFF'
          ctx.beginPath()
          ctx.arc(start.x, start.y, 3, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = '#FF00FF'
          ctx.shadowColor = '#FF00FF'
          ctx.beginPath()
          ctx.arc(end.x, end.y, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      animationId = requestAnimationFrame(render)
    }

    render(0)

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
        LISSAJOUS (LFO PAIR 1)
      </div>
    </div>
  )
}
