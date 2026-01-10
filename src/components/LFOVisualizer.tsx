/**
 * LFO Visualizer Component
 * Canvas visualization of 4 LFOs combined in real-time
 */

import { useEffect, useRef, useState } from 'react'
import { LFOEngine } from '../audio/LFOEngine'
import { audioEngine } from '../audio/AudioEngine'

interface LFOVisualizerProps {
  width?: number
  height?: number
}

// LFO colors (phosphor variations)
const LFO_COLORS = [
  'rgba(0, 255, 65, 0.8)', // LFO 1: Green
  'rgba(0, 255, 255, 0.8)', // LFO 2: Cyan
  'rgba(255, 255, 0, 0.8)', // LFO 3: Yellow
  'rgba(255, 100, 255, 0.8)', // LFO 4: Magenta
]

const COMBINED_COLOR = 'rgba(255, 255, 255, 1.0)' // White for combined

export function LFOVisualizer({ width = 800, height = 400 }: LFOVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup canvas scaling for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    console.log('✅ LFO Visualizer initialized')

    let phase = 0
    const phaseSpeed = 0.01 // Speed of animation

    // Main render loop
    const render = () => {
      // Get global LFO engine from audio engine
      const lfoEngine = audioEngine.getGlobalLFOEngine()
      if (!lfoEngine) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }

      phase += phaseSpeed

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      drawGrid(ctx, width, height)

      // Draw each LFO
      for (let i = 0; i < 4; i++) {
        const lfo = lfoEngine.getLFO(i as 0 | 1 | 2 | 3)
        const color = LFO_COLORS[i] ?? LFO_COLORS[0] ?? 'rgba(0, 255, 65, 0.8)'
        drawLFO(ctx, lfo, i, width, height, phase, color)
      }

      // Draw combined signal
      drawCombinedSignal(ctx, lfoEngine, width, height, phase, COMBINED_COLOR)

      // Draw phase indicators
      drawPhaseIndicators(ctx, lfoEngine, width, height)

      animationFrameRef.current = requestAnimationFrame(render)
    }

    setIsAnimating(true)
    animationFrameRef.current = requestAnimationFrame(render)

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setIsAnimating(false)
    }
  }, [width, height])

  return (
    <div
      style={{
        position: 'relative',
        width: `${String(width)}px`,
        height: `${String(height)}px`,
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        boxShadow: '0 0 20px var(--color-trace-glow)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      {isAnimating && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--spacing-2)',
            left: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-trace-primary)',
            fontFamily: 'var(--font-family-mono)',
            opacity: 0.7,
          }}
        >
          LFO Visualizer
        </div>
      )}
    </div>
  )
}

/**
 * Draw grid
 */
function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.strokeStyle = '#001a0a' // Dim grid
  ctx.lineWidth = 1

  // Vertical lines
  const gridStepX = width / 8
  for (let x = 0; x <= width; x += gridStepX) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  const gridStepY = height / 6
  for (let y = 0; y <= height; y += gridStepY) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Center line (brighter)
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

/**
 * Draw individual LFO waveform
 */
function drawLFO(
  ctx: CanvasRenderingContext2D,
  lfo: ReturnType<LFOEngine['getLFO']>,
  index: number,
  width: number,
  height: number,
  phase: number,
  color: string
): void {
  const centerY = height / 2
  const amplitude = (height / 2 - 40) * 0.5 // Smaller amplitude for individual LFOs

  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()

  // Draw one full cycle of the LFO
  const points = 200
  for (let i = 0; i < points; i++) {
    const x = (i / points) * width
    // Simulate LFO value over time (simplified sine wave for visualization)
    const value = lfo.getValue() * Math.sin((i / points) * Math.PI * 2 + phase * (index + 1))
    const y = centerY + value * amplitude

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()
}

/**
 * Draw combined signal
 */
function drawCombinedSignal(
  ctx: CanvasRenderingContext2D,
  lfoEngine: LFOEngine,
  width: number,
  height: number,
  phase: number,
  color: string
): void {
  const centerY = height / 2
  const amplitude = height / 2 - 40

  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Add glow
  ctx.shadowBlur = 10
  ctx.shadowColor = color

  ctx.beginPath()

  const points = 200
  for (let i = 0; i < points; i++) {
    const x = (i / points) * width
    const value = lfoEngine.getCombinedValue() * Math.sin((i / points) * Math.PI * 2 + phase)
    const y = centerY + value * amplitude

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()

  // Reset shadow
  ctx.shadowBlur = 0
}

/**
 * Draw phase indicators for each LFO
 */
function drawPhaseIndicators(
  ctx: CanvasRenderingContext2D,
  lfoEngine: LFOEngine,
  width: number,
  height: number
): void {
  const indicatorY = height - 30
  const spacing = width / 5

  for (let i = 0; i < 4; i++) {
    const lfo = lfoEngine.getLFO(i as 0 | 1 | 2 | 3)
    const value = lfo.getValue()
    const x = spacing * (i + 1)
    const color = LFO_COLORS[i] ?? LFO_COLORS[0] ?? 'rgba(0, 255, 65, 0.8)'

    // Draw indicator circle
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, indicatorY, 8, 0, Math.PI * 2)
    ctx.fill()

    // Draw value bar
    const barHeight = value * 15 // -15 to +15
    ctx.fillRect(x - 2, indicatorY - barHeight, 4, barHeight)

    // Draw label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`LFO${String(i + 1)}`, x, height - 10)
  }
}
