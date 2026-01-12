/**
 * Master Effects Component
 * Effets globaux avec visualisation et contrôles
 */

import { useRef, useEffect } from 'react'
import { Knob } from './Knob'
import { MasterEffectsParams } from '../audio/types'
import { audioEngine } from '../audio/AudioEngine'

interface MasterEffectsProps {
  params: MasterEffectsParams
  onChange: (params: Partial<MasterEffectsParams>) => void
}

export function MasterEffects({ params, onChange }: MasterEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const width = 800
  const height = 200

  // Visualisation de la forme d'onde avec effets
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

      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)'
      ctx.lineWidth = 1

      // Horizontal lines
      for (let i = 0; i <= 4; i++) {
        const y = (i * height) / 4
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Vertical lines
      for (let i = 0; i <= 8; i++) {
        const x = (i * width) / 8
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)'
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Draw waveform
      const centerY = height / 2
      const amplitude = height * 0.4

      // Color varies based on active effects
      let effectIntensity = 0
      effectIntensity += params.reverbWet * 0.25
      effectIntensity += params.delayWet * 0.25
      effectIntensity += params.chorusWet * 0.25
      effectIntensity += params.distortionWet * 0.25

      const r = Math.floor(effectIntensity * 255)
      const g = Math.floor(255 - effectIntensity * 100)
      const b = Math.floor(65 + effectIntensity * 190)

      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`
      ctx.lineWidth = 2
      ctx.shadowBlur = 8
      ctx.shadowColor = ctx.strokeStyle

      ctx.beginPath()
      for (let i = 0; i < waveform.length; i++) {
        const x = (i / waveform.length) * width
        const y = centerY + (waveform[i] ?? 0) * amplitude
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      ctx.shadowBlur = 0

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [params, width, height])

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-xl)',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-4)',
          textAlign: 'center',
          textShadow: '0 0 8px var(--color-trace-glow)',
        }}
      >
        MASTER EFFECTS
      </div>

      {/* Waveform Visualizer */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: '100%',
          marginBottom: 'var(--spacing-4)',
          border: '1px solid var(--color-border-secondary)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#000',
        }}
      />

      {/* Effects Controls Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--spacing-4)',
        }}
      >
        {/* Reverb */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: '#64C8FF',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-2)',
              textAlign: 'center',
            }}
          >
            REVERB
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <Knob
              label="Mix"
              value={params.reverbWet}
              min={0}
              max={1}
              step={0.01}
              unit="%"
              color="#64C8FF"
              onChange={(reverbWet) => {
                onChange({ reverbWet })
              }}
            />
            <Knob
              label="Decay"
              value={params.reverbDecay}
              min={0.1}
              max={10}
              step={0.1}
              unit="s"
              color="#64C8FF"
              onChange={(reverbDecay) => {
                onChange({ reverbDecay })
              }}
            />
            <Knob
              label="PreDly"
              value={params.reverbPreDelay}
              min={0}
              max={1}
              step={0.01}
              unit="s"
              color="#64C8FF"
              onChange={(reverbPreDelay) => {
                onChange({ reverbPreDelay })
              }}
            />
          </div>
        </div>

        {/* Delay */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: '#FFFF00',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-2)',
              textAlign: 'center',
            }}
          >
            DELAY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <Knob
              label="Mix"
              value={params.delayWet}
              min={0}
              max={1}
              step={0.01}
              unit="%"
              color="#FFFF00"
              onChange={(delayWet) => {
                onChange({ delayWet })
              }}
            />
            <Knob
              label="Time"
              value={params.delayTime}
              min={0}
              max={2}
              step={0.01}
              unit="s"
              color="#FFFF00"
              onChange={(delayTime) => {
                onChange({ delayTime })
              }}
            />
            <Knob
              label="Feedbck"
              value={params.delayFeedback}
              min={0}
              max={0.95}
              step={0.01}
              color="#FFFF00"
              onChange={(delayFeedback) => {
                onChange({ delayFeedback })
              }}
            />
          </div>
        </div>

        {/* Chorus */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: '#FF64FF',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-2)',
              textAlign: 'center',
            }}
          >
            CHORUS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <Knob
              label="Mix"
              value={params.chorusWet}
              min={0}
              max={1}
              step={0.01}
              unit="%"
              color="#FF64FF"
              onChange={(chorusWet) => {
                onChange({ chorusWet })
              }}
            />
            <Knob
              label="Rate"
              value={params.chorusFrequency}
              min={0.1}
              max={10}
              step={0.1}
              unit="Hz"
              color="#FF64FF"
              onChange={(chorusFrequency) => {
                onChange({ chorusFrequency })
              }}
            />
            <Knob
              label="Depth"
              value={params.chorusDepth}
              min={0}
              max={1}
              step={0.01}
              color="#FF64FF"
              onChange={(chorusDepth) => {
                onChange({ chorusDepth })
              }}
            />
          </div>
        </div>

        {/* Distortion */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: '#FF9664',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-2)',
              textAlign: 'center',
            }}
          >
            DISTORTION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <Knob
              label="Mix"
              value={params.distortionWet}
              min={0}
              max={1}
              step={0.01}
              unit="%"
              color="#FF9664"
              onChange={(distortionWet) => {
                onChange({ distortionWet })
              }}
            />
            <Knob
              label="Amount"
              value={params.distortionAmount}
              min={0}
              max={1}
              step={0.01}
              color="#FF9664"
              onChange={(distortionAmount) => {
                onChange({ distortionAmount })
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
