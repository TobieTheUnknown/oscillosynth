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

      const halfHeight = height / 2

      // === PAIRE 1: LFO 1+2 (Top half) ===
      // Draw LFO 1 and LFO 2
      for (let i = 0; i < 2; i++) {
        const lfo = lfoEngine.getLFO(i as 0 | 1)
        const color = LFO_COLORS[i] ?? LFO_COLORS[0] ?? 'rgba(0, 255, 65, 0.8)'
        drawLFOInSection(ctx, lfo, i, width, halfHeight, phase, color, 0)
      }
      // Draw combined pair 1
      drawPairCombined(ctx, lfoEngine, 1, width, halfHeight, phase, 0)
      // Draw pair 1 label
      drawPairLabel(ctx, 'PAIR 1: PITCH', width, 20)

      // === PAIRE 2: LFO 3+4 (Bottom half) ===
      // Draw LFO 3 and LFO 4
      for (let i = 2; i < 4; i++) {
        const lfo = lfoEngine.getLFO(i as 2 | 3)
        const color = LFO_COLORS[i] ?? LFO_COLORS[0] ?? 'rgba(0, 255, 65, 0.8)'
        drawLFOInSection(ctx, lfo, i - 2, width, halfHeight, phase, color, halfHeight)
      }
      // Draw combined pair 2
      drawPairCombined(ctx, lfoEngine, 2, width, halfHeight, phase, halfHeight)
      // Draw pair 2 label
      drawPairLabel(ctx, 'PAIR 2: AMP', width, halfHeight + 20)

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
 * Draw individual LFO waveform in a section
 */
function drawLFOInSection(
  ctx: CanvasRenderingContext2D,
  lfo: ReturnType<LFOEngine['getLFO']>,
  indexInPair: number,
  width: number,
  sectionHeight: number,
  phase: number,
  color: string,
  yOffset: number
): void {
  const centerY = sectionHeight / 2 + yOffset
  const amplitude = (sectionHeight / 2 - 20) * 0.4 // Smaller amplitude for individual LFOs

  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()

  // Draw animated waveform
  const points = 200
  const currentValue = lfo.getValue()

  for (let i = 0; i < points; i++) {
    const x = (i / points) * width
    // Create smooth animation using phase and index offset
    const animPhase = phase * (indexInPair + 1) * 0.5
    const t = (i / points) * Math.PI * 2 + animPhase
    // Use current LFO value as amplitude multiplier
    const value = currentValue * Math.sin(t)
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
 * Draw combined pair signal
 */
function drawPairCombined(
  ctx: CanvasRenderingContext2D,
  lfoEngine: LFOEngine,
  pairNumber: 1 | 2,
  width: number,
  sectionHeight: number,
  phase: number,
  yOffset: number
): void {
  const centerY = sectionHeight / 2 + yOffset
  const amplitude = sectionHeight / 2 - 30

  ctx.strokeStyle = COMBINED_COLOR
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Add glow
  ctx.shadowBlur = 10
  ctx.shadowColor = COMBINED_COLOR

  ctx.beginPath()

  const points = 200
  const currentValue = pairNumber === 1 ? lfoEngine.getPair1Value() : lfoEngine.getPair2Value()

  for (let i = 0; i < points; i++) {
    const x = (i / points) * width
    // Create smooth animation for combined signal
    const t = (i / points) * Math.PI * 2 + phase
    // Use current pair value as amplitude multiplier
    const value = currentValue * Math.sin(t)
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
 * Draw pair label
 */
function drawPairLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  _width: number,
  y: number
): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = 'bold 12px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(label, 10, y)
}
