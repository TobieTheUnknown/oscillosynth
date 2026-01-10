/**
 * Oscilloscope Component
 * Canvas-based waveform visualization with phosphor green aesthetic
 */

import { useEffect, useRef, useState } from 'react'
import { audioEngine } from '../audio/AudioEngine'

interface OscilloscopeProps {
  width?: number
  height?: number
  lineWidth?: number
  glowIntensity?: number
}

export function Oscilloscope({
  width = 800,
  height = 400,
  lineWidth = 2,
  glowIntensity = 0.6,
}: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const [supportsOffscreenCanvas] = useState(() => typeof OffscreenCanvas !== 'undefined')
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

    console.log(
      `✅ Oscilloscope initialized: ${String(width)}x${String(height)}, OffscreenCanvas: ${String(supportsOffscreenCanvas)}`
    )

    let lastFrameTime = 0
    const targetFPS = 60
    const frameInterval = 1000 / targetFPS

    // Main render loop
    const render = (timestamp: number) => {
      // Throttle to target FPS
      if (timestamp - lastFrameTime < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }
      lastFrameTime = timestamp

      // Get audio data from pipeline
      const pipeline = audioEngine.getPipeline()
      const waveform = pipeline.getWaveform()

      // Clear canvas with fade effect (ghosting)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      drawGrid(ctx, width, height)

      // Draw waveform
      drawWaveform(ctx, waveform, width, height, lineWidth, glowIntensity)

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
  }, [width, height, lineWidth, glowIntensity, supportsOffscreenCanvas])

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
            right: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-trace-primary)',
            opacity: 0.5,
          }}
        >
          {supportsOffscreenCanvas ? 'GPU' : 'CPU'}
        </div>
      )}
    </div>
  )
}

/**
 * Draw oscilloscope grid
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Grid lines (very dim)
  ctx.strokeStyle = '#001a0a' // --color-trace-grid
  ctx.lineWidth = 1

  // Vertical lines
  const gridStepX = width / 10
  for (let x = 0; x <= width; x += gridStepX) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  const gridStepY = height / 8
  for (let y = 0; y <= height; y += gridStepY) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Center line (brighter)
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
}

/**
 * Draw waveform with phosphor green glow
 */
function drawWaveform(
  ctx: CanvasRenderingContext2D,
  waveform: Float32Array,
  width: number,
  height: number,
  lineWidth: number,
  glowIntensity: number
): void {
  const centerY = height / 2
  const amplitude = height / 2 - 20 // Leave padding

  // Draw glow layers for phosphor effect
  const glowLayers = [
    { width: lineWidth * 4, opacity: glowIntensity * 0.2 },
    { width: lineWidth * 2, opacity: glowIntensity * 0.4 },
    { width: lineWidth, opacity: 1.0 },
  ]

  glowLayers.forEach((layer) => {
    ctx.strokeStyle = `rgba(0, 255, 65, ${String(layer.opacity)})`
    ctx.lineWidth = layer.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    const step = Math.ceil(waveform.length / width)

    for (let i = 0; i < width; i++) {
      const index = Math.floor(i * step)
      const value = waveform[index] ?? 0
      const x = i
      const y = centerY + value * amplitude

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  })
}
