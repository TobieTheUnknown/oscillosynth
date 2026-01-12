/**
 * Stereo Goniometer (L-R Phase Correlation)
 * Visualizes stereo width and pan spread
 * - Vertical line = mono center
 * - Diagonal 45° = identical L/R (mono)
 * - Circle/ellipse = stereo width
 * - Horizontal = anti-phase
 */

import { useRef, useEffect } from 'react'
import { audioEngine } from '../audio/AudioEngine'

interface StereoGoniometerProps {
  width?: number
  height?: number
}

export function StereoGoniometer({ width = 400, height = 400 }: StereoGoniometerProps) {
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

      // Get stereo waveform data
      const [leftChannel, rightChannel] = pipeline.getStereoWaveform()

      // Fade out previous frame for trail effect (slower fade for better visibility)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)'
      ctx.lineWidth = 1

      // Center cross
      ctx.beginPath()
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height)
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Diagonal reference lines (mono = 45°)
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)'
      ctx.beginPath()
      ctx.moveTo(0, height)
      ctx.lineTo(width, 0)
      ctx.stroke()

      // Circular grid
      const circles = 4
      for (let i = 1; i <= circles; i++) {
        const radius = (Math.min(width, height) / 2) * (i / circles)
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // L-R plot (goniometer)
      const centerX = width / 2
      const centerY = height / 2
      const scale = Math.min(width, height) * 0.45

      // Main trace
      ctx.strokeStyle = '#00FF41'
      ctx.lineWidth = 3 // Thicker line for better visibility
      ctx.shadowBlur = 12
      ctx.shadowColor = '#00FF41'

      ctx.beginPath()
      const maxSamples = Math.min(leftChannel.length, rightChannel.length, 2048) // More samples for smoother display

      for (let i = 0; i < maxSamples; i++) {
        // L on X axis, R on Y axis (inverted for proper display)
        const x = centerX + (leftChannel[i] ?? 0) * scale
        const y = centerY - (rightChannel[i] ?? 0) * scale

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Calculate correlation for text display
      let correlation = 0
      let lSum = 0
      let rSum = 0
      let lrSum = 0

      for (let i = 0; i < maxSamples; i++) {
        const l = leftChannel[i] ?? 0
        const r = rightChannel[i] ?? 0
        lSum += l * l
        rSum += r * r
        lrSum += l * r
      }

      const denominator = Math.sqrt(lSum * rSum)
      if (denominator > 0) {
        correlation = lrSum / denominator
      }

      // Calculate stereo width (difference between L and R)
      let width_metric = 0
      for (let i = 0; i < maxSamples; i++) {
        const l = leftChannel[i] ?? 0
        const r = rightChannel[i] ?? 0
        width_metric += Math.abs(l - r)
      }
      width_metric = (width_metric / maxSamples) * 100

      // Display correlation info
      ctx.shadowBlur = 0
      ctx.fillStyle = '#00FF41'
      ctx.font = '12px monospace'
      ctx.fillText(`CORR: ${correlation.toFixed(2)}`, 10, height - 30)
      ctx.fillText(`WIDTH: ${width_metric.toFixed(0)}%`, 10, height - 15)

      // Stereo width indicator
      let widthIndicator = ''
      if (correlation > 0.9) widthIndicator = 'MONO'
      else if (correlation > 0.5) widthIndicator = 'NARROW'
      else if (correlation > 0) widthIndicator = 'NORMAL'
      else if (correlation > -0.5) widthIndicator = 'WIDE'
      else widthIndicator = 'ANTI-PHASE'

      ctx.fillStyle = correlation < 0 ? '#FF4444' : '#00FF41'
      ctx.font = 'bold 14px monospace'
      ctx.fillText(widthIndicator, width - 100, height - 15)

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
        STEREO GONIOMETER
      </div>
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-2)',
          right: 'var(--spacing-2)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-family-mono)',
          opacity: 0.7,
          textAlign: 'right',
          textShadow: '0 0 4px #000',
        }}
      >
        L ← → R
      </div>
    </div>
  )
}
