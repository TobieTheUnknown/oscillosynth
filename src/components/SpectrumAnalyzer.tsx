/**
 * Spectrum Analyzer
 * FFT visualization with logarithmic frequency scale
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

      // Get FFT data (linear frequency bins)
      const fftData = pipeline.getFFT()
      const sampleRate = 44100 // Standard sample rate
      const nyquist = sampleRate / 2
      const binCount = fftData.length

      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)'
      ctx.lineWidth = 1

      // Horizontal lines (dB levels)
      const dbLevels = [0, -20, -40, -60, -80, -100]
      dbLevels.forEach((db, idx) => {
        const y = (idx / (dbLevels.length - 1)) * height
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()

        // dB label
        ctx.fillStyle = 'rgba(0, 255, 65, 0.4)'
        ctx.font = '10px monospace'
        ctx.fillText(`${db}dB`, 5, y - 2)
      })

      // Frequency markers (logarithmic scale)
      const freqMarkers = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
      const minFreq = 20
      const maxFreq = nyquist

      freqMarkers.forEach((freq) => {
        if (freq > maxFreq) return

        // Logarithmic position
        const logPos = (Math.log10(freq) - Math.log10(minFreq)) /
                       (Math.log10(maxFreq) - Math.log10(minFreq))
        const x = logPos * width

        ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)'
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()

        // Label
        ctx.fillStyle = 'rgba(0, 255, 65, 0.5)'
        ctx.font = '10px monospace'
        const label = freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : `${freq}`
        ctx.fillText(label, x + 2, height - 5)
      })

      // Draw spectrum with logarithmic frequency grouping
      const barCount = 120 // Number of visual bars
      const logMin = Math.log10(minFreq)
      const logMax = Math.log10(maxFreq)
      const barWidth = width / barCount

      for (let i = 0; i < barCount; i++) {
        // Logarithmic frequency range for this bar
        const logFreq1 = logMin + (i / barCount) * (logMax - logMin)
        const logFreq2 = logMin + ((i + 1) / barCount) * (logMax - logMin)
        const freq1 = Math.pow(10, logFreq1)
        const freq2 = Math.pow(10, logFreq2)

        // Convert frequencies to FFT bin indices
        const bin1 = Math.floor((freq1 / nyquist) * binCount)
        const bin2 = Math.ceil((freq2 / nyquist) * binCount)

        // Average the FFT values in this frequency range
        let sum = 0
        let count = 0
        for (let b = bin1; b < Math.min(bin2, binCount); b++) {
          sum += fftData[b] ?? -100
          count++
        }
        const avgValue = count > 0 ? sum / count : -100

        // Normalize dB value (-100 to 0 dB)
        const normalizedValue = Math.max(0, (avgValue + 100) / 100)
        const barHeight = normalizedValue * height

        // Color gradient based on frequency
        const hue = (i / barCount) * 120 // Green (120°) to cyan (180°)
        const intensity = Math.min(1, normalizedValue * 2)
        const lightness = 40 + intensity * 30

        ctx.fillStyle = `hsla(${120 + (i / barCount) * 60}, 100%, ${lightness}%, ${0.6 + intensity * 0.4})`
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)

        // Glow effect for prominent frequencies
        if (normalizedValue > 0.5) {
          ctx.shadowBlur = 10
          ctx.shadowColor = ctx.fillStyle
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight)
          ctx.shadowBlur = 0
        }
      }

      // Peak indicator line
      ctx.strokeStyle = 'rgba(255, 0, 65, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = 0; i < barCount; i++) {
        const logFreq1 = logMin + (i / barCount) * (logMax - logMin)
        const logFreq2 = logMin + ((i + 1) / barCount) * (logMax - logMin)
        const freq1 = Math.pow(10, logFreq1)
        const freq2 = Math.pow(10, logFreq2)

        const bin1 = Math.floor((freq1 / nyquist) * binCount)
        const bin2 = Math.ceil((freq2 / nyquist) * binCount)

        let sum = 0
        let count = 0
        for (let b = bin1; b < Math.min(bin2, binCount); b++) {
          sum += fftData[b] ?? -100
          count++
        }
        const avgValue = count > 0 ? sum / count : -100
        const normalizedValue = Math.max(0, (avgValue + 100) / 100)
        const y = height - normalizedValue * height

        if (i === 0) {
          ctx.moveTo(i * barWidth, y)
        } else {
          ctx.lineTo(i * barWidth, y)
        }
      }
      ctx.stroke()

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
        SPECTRUM ANALYZER (20Hz - 22kHz)
      </div>
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-2)',
          right: 'var(--spacing-2)',
          fontSize: 'var(--font-size-xs)',
          color: 'rgba(0, 255, 65, 0.5)',
          fontFamily: 'var(--font-family-mono)',
          textShadow: '0 0 4px #000',
        }}
      >
        Logarithmic Scale
      </div>
    </div>
  )
}
