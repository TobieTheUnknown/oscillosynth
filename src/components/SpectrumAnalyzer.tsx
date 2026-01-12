/**
 * Spectrum Analyzer
 * FFT visualization with frequency bands
 */

import { useRef, useEffect } from 'react'
import { audioEngine } from '../audio/AudioEngine'

interface SpectrumAnalyzerProps {
  width?: number
  height?: number
}

export function SpectrumAnalyzer({ width = 800, height = 300 }: SpectrumAnalyzerProps) {
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

      // Get FFT data
      const fftData = pipeline.getFFT()

      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)'
      ctx.lineWidth = 1

      // Horizontal lines (dB levels)
      for (let i = 0; i <= 4; i++) {
        const y = (i * height) / 4
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Vertical lines (frequency markers)
      const freqMarkers = [100, 500, 1000, 2000, 5000, 10000]
      const nyquist = 22050 // Half sample rate

      freqMarkers.forEach((freq) => {
        const x = (Math.log10(freq) / Math.log10(nyquist)) * width
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)'
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()

        // Label
        ctx.fillStyle = 'rgba(0, 255, 65, 0.5)'
        ctx.font = '10px monospace'
        ctx.fillText(freq >= 1000 ? `${freq / 1000}k` : `${freq}`, x + 2, height - 5)
      })

      // Draw spectrum bars
      const barCount = fftData.length
      const barWidth = width / barCount

      for (let i = 0; i < barCount; i++) {
        const value = fftData[i] ?? -100 // dB value
        const normalizedValue = (value + 100) / 100 // Normalize from -100dB to 0dB
        const barHeight = Math.max(0, normalizedValue * height)

        // Color gradient based on frequency
        const hue = (i / barCount) * 120 // Green to cyan
        const intensity = Math.min(1, normalizedValue * 2)

        ctx.fillStyle = `hsla(${hue}, 100%, ${50 + intensity * 25}%, ${0.7 + intensity * 0.3})`
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)

        // Glow effect for loud frequencies
        if (normalizedValue > 0.5) {
          ctx.shadowBlur = 8
          ctx.shadowColor = ctx.fillStyle
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)
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
        SPECTRUM ANALYZER
      </div>
    </div>
  )
}
