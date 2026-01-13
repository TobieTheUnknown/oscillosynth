/**
 * Oscilloscope Component
 * Canvas-based waveform visualization with phosphor green aesthetic
 * Enhanced with visual feedback for FM parameters
 */

import { useEffect, useRef, useState } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { usePresetStore } from '../store/presetStore'
import { AlgorithmType } from '../audio/types'

interface OscilloscopeProps {
  width?: number
  height?: number
  lineWidth?: number
  glowIntensity?: number
}

// Algorithm color mapping (hue values)
const ALGORITHM_COLORS: Record<AlgorithmType, { hue: number; name: string; isDual?: boolean; hue2?: number }> = {
  [AlgorithmType.SERIAL]: { hue: 120, name: 'METALLIC' }, // Green
  [AlgorithmType.PARALLEL]: { hue: 30, name: 'WARM' }, // Orange
  [AlgorithmType.DUAL_SERIAL]: { hue: 180, name: 'COMPLEX', isDual: true, hue2: 300 }, // Cyan→Magenta
  [AlgorithmType.FAN_OUT]: { hue: 270, name: 'RICH' }, // Purple
  [AlgorithmType.SPLIT]: { hue: 60, name: 'THICK' }, // Yellow
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

  // Get current preset for visual effects
  const getCurrentPreset = usePresetStore((state) => state.getCurrentPreset)

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

      // Get current preset for visual effects
      const preset = getCurrentPreset()

      // Calculate visual effect parameters
      const algorithm = preset?.algorithm ?? AlgorithmType.SERIAL
      const algorithmColor = ALGORITHM_COLORS[algorithm]

      // Modulation depth: average of operator levels (0-100)
      const avgOperatorLevel = preset
        ? (preset.operators[0].level +
            preset.operators[1].level +
            preset.operators[2].level +
            preset.operators[3].level) /
          4
        : 50

      // Filter cutoff (20-20000 Hz) - normalize to 0-1
      const cutoff = preset?.filter.cutoff ?? 20000
      const cutoffNormalized = Math.log10(cutoff / 20) / Math.log10(20000 / 20) // 0-1

      // Calculate fade amount based on filter cutoff
      // Low cutoff = darker background (slower fade), high cutoff = brighter (faster fade)
      const fadeAmount = 0.2 - cutoffNormalized * 0.15 // 0.2 (dark) to 0.05 (bright)

      // Calculate trace opacity based on cutoff
      const traceOpacity = 0.4 + cutoffNormalized * 0.6 // 0.4 (dim) to 1.0 (bright)

      // Calculate line width based on modulation depth
      const dynamicLineWidth = lineWidth + avgOperatorLevel / 50 // 2-4 typically

      // Calculate glow intensity based on modulation depth
      const dynamicGlowIntensity = glowIntensity + avgOperatorLevel / 125 // 0.6-1.4 typically

      // Clear canvas with dynamic fade effect
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      drawGrid(ctx, width, height)

      // Draw waveform with dynamic parameters
      drawWaveform(
        ctx,
        waveform,
        width,
        height,
        dynamicLineWidth,
        dynamicGlowIntensity,
        algorithmColor,
        traceOpacity
      )

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

  // Get algorithm info for display
  const preset = getCurrentPreset()
  const algorithm = preset?.algorithm ?? AlgorithmType.SERIAL
  const algorithmInfo = ALGORITHM_COLORS[algorithm]
  const algorithmColorString = `hsl(${algorithmInfo.hue}, 100%, 50%)`

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
        boxShadow: `0 0 20px ${algorithmColorString}33`,
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
      {/* Algorithm label */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-2)',
          left: 'var(--spacing-2)',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          color: algorithmColorString,
          opacity: 0.8,
          textShadow: `0 0 8px ${algorithmColorString}`,
          letterSpacing: '0.1em',
        }}
      >
        {algorithmInfo.name}
      </div>
      {/* Performance indicator */}
      {isAnimating && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--spacing-2)',
            right: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-mono)',
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
 * Find zero-crossing point (rising edge) for stable trigger
 */
function findZeroCrossing(waveform: Float32Array): number {
  // Look for rising zero crossing in first 25% of buffer
  const searchRange = Math.floor(waveform.length * 0.25)

  for (let i = 1; i < searchRange; i++) {
    const prev = waveform[i - 1] ?? 0
    const curr = waveform[i] ?? 0

    // Found rising edge through zero
    if (prev <= 0 && curr > 0) {
      return i
    }
  }

  // No zero crossing found, start at beginning
  return 0
}

/**
 * Draw waveform with phosphor glow and zero-crossing trigger
 * Enhanced with algorithm-based color and dynamic intensity
 */
function drawWaveform(
  ctx: CanvasRenderingContext2D,
  waveform: Float32Array,
  width: number,
  height: number,
  lineWidth: number,
  glowIntensity: number,
  algorithmColor: { hue: number; name: string; isDual?: boolean; hue2?: number },
  traceOpacity: number
): void {
  const centerY = height / 2
  const amplitude = height / 2 - 20 // Leave padding

  // Find stable trigger point
  const triggerIndex = findZeroCrossing(waveform)

  // Calculate how many samples to display (approximately 20ms window)
  const displaySamples = Math.min(width * 2, waveform.length - triggerIndex)

  // Draw glow layers for phosphor effect
  const glowLayers = [
    { width: lineWidth * 4, opacity: glowIntensity * 0.2 * traceOpacity },
    { width: lineWidth * 2, opacity: glowIntensity * 0.4 * traceOpacity },
    { width: lineWidth, opacity: traceOpacity },
  ]

  glowLayers.forEach((layer) => {
    // Use algorithm color
    const hue = algorithmColor.hue
    const saturation = 100
    const lightness = 50

    // For dual-color algorithms (DUAL_SERIAL), blend colors
    if (algorithmColor.isDual && algorithmColor.hue2) {
      // Gradient from hue1 to hue2 across the width
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${String(layer.opacity)})`)
      gradient.addColorStop(
        1,
        `hsla(${algorithmColor.hue2}, ${saturation}%, ${lightness}%, ${String(layer.opacity)})`
      )
      ctx.strokeStyle = gradient
    } else {
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${String(layer.opacity)})`
    }

    ctx.lineWidth = layer.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    const step = displaySamples / width

    for (let i = 0; i < width; i++) {
      const sampleIndex = triggerIndex + Math.floor(i * step)
      const value = waveform[sampleIndex] ?? 0
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
