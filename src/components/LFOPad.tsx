/**
 * LFO Pad
 * Compact LFO controller with visualizer, knobs, and patch cable output
 */

import { useRef, useEffect } from 'react'
import { Knob } from './Knob'
import { LFOParams } from '../audio/types'
import { audioEngine } from '../audio/AudioEngine'

interface LFOPadProps {
  lfoNumber: number
  lfoIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  params: LFOParams
  color: string
  onChange: (params: Partial<LFOParams>) => void
  onPatchStart?: () => void
}

// Musical divisions for sync mode (7 steps)
const SYNC_DIVISIONS = ['1', '1/2', '1/4', '1/8', '1/16', '1/32', '1/64']

// Map knob value (0-6) to division index
const syncValueToDivisionIndex = (syncValue: string | undefined): number => {
  if (!syncValue) return 2 // Default to 1/4
  const index = SYNC_DIVISIONS.indexOf(syncValue)
  return index >= 0 ? index : 2
}

export function LFOPad({ lfoNumber, lfoIndex, params, color, onChange, onPatchStart }: LFOPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const width = 180
  const height = 60

  // Handle knob change - map to division when sync is enabled
  const handleRateChange = (value: number) => {
    if (params.sync) {
      // Map knob value (0-6) to division
      const divisionIndex = Math.round(Math.max(0, Math.min(6, value)))
      const division = SYNC_DIVISIONS[divisionIndex]
      onChange({ syncValue: division })
    } else {
      // Normal Hz mode
      onChange({ rate: value })
    }
  }

  // Get display value for knob
  const getRateDisplayValue = (): number => {
    if (params.sync) {
      // Return division index (0-9) for knob position
      return syncValueToDivisionIndex(params.syncValue)
    }
    return params.rate
  }

  // Get display unit
  const getRateUnit = (): string => {
    if (params.sync) {
      const division = params.syncValue || '1/4'
      return division
    }
    return 'Hz'
  }

  // Animated LFO visualizer
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let animationPhase = 0

    const render = () => {
      const engine = audioEngine.getGlobalLFOEngine()
      if (!engine) {
        animationId = requestAnimationFrame(render)
        return
      }

      animationPhase += 0.016

      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(78, 205, 196, 0.05)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 2; i++) {
        const y = (i * height) / 2
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Center line
      ctx.strokeStyle = 'rgba(78, 205, 196, 0.15)'
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      const pointsPerWave = 150
      const centerY = height / 2
      const amplitude = height * 0.35
      const timeWindow = 1.0

      const lfo = engine.getLFO(lfoIndex)

      // Calculate effective frequency (sync mode uses BPM conversion)
      const getEffectiveFrequency = (): number => {
        if (lfo.params.sync && lfo.params.syncValue) {
          // Convert sync division to Hz based on 120 BPM
          const bpm = 120 // TODO: get from Tone.Transport.bpm.value
          const bps = bpm / 60
          const division = lfo.params.syncValue

          if (division.includes('/')) {
            const parts = division.split('/').map(Number)
            const num = parts[0] ?? 1
            const denom = parts[1] ?? 4
            const beats = (num / denom) * 4
            return bps / beats
          } else {
            const bars = Number(division)
            const beats = bars * 4
            return bps / beats
          }
        }
        return lfo.params.rate
      }

      // Compute waveform
      const computeWaveformValue = (t: number): number => {
        const frequency = getEffectiveFrequency()
        const phase = (t * frequency * Math.PI * 2 + (lfo.params.phase * Math.PI) / 180) % (Math.PI * 2)
        let rawValue = 0
        switch (lfo.params.waveform) {
          case 'sine':
            rawValue = Math.sin(phase)
            break
          case 'square':
            rawValue = phase < Math.PI ? 1 : -1
            break
          case 'sawtooth':
            rawValue = phase / Math.PI - 1
            break
          case 'triangle':
            rawValue = phase < Math.PI ? (phase / Math.PI) * 2 - 1 : 3 - (phase / Math.PI) * 2
            break
          default:
            rawValue = Math.sin(phase)
        }
        return rawValue * (lfo.params.depth / 100)
      }

      // Draw waveform
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowBlur = 6
      ctx.shadowColor = color
      ctx.beginPath()

      for (let i = 0; i <= pointsPerWave; i++) {
        const x = (i / pointsPerWave) * width
        const t = (i / pointsPerWave) * timeWindow + animationPhase
        const value = computeWaveformValue(t)
        const y = centerY - value * amplitude

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
  }, [lfoIndex, params, color])

  return (
    <div
      style={{
        padding: 'var(--spacing-2)',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        border: `2px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2)',
        position: 'relative',
      }}
    >
      {/* Title + Sync Button + Patch Output */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: color,
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              textShadow: `0 0 8px ${color}`,
            }}
          >
            LFO {lfoNumber}
          </div>

          {/* Sync Button */}
          <div
            onClick={() => onChange({ sync: !params.sync })}
            style={{
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              color: params.sync ? color : 'rgba(255, 255, 255, 0.3)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textShadow: params.sync ? `0 0 8px ${color}` : 'none',
              opacity: 0.6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              if (!params.sync) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6'
              if (!params.sync) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'
              }
            }}
            title={params.sync ? 'Click to disable sync' : 'Click to enable sync'}
          >
            SYNC
          </div>
        </div>

        {/* Patch Cable Output Jack */}
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('lfoIndex', lfoIndex.toString())
            e.dataTransfer.setData('color', color)
            if (onPatchStart) onPatchStart()
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: color,
            border: '2px solid #000',
            cursor: 'grab',
            boxShadow: `0 0 8px ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Drag to connect"
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#000',
            }}
          />
        </div>
      </div>

      {/* Waveform Visualizer */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: `1px solid rgba(78, 205, 196, 0.3)`,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#000',
        }}
      />

      {/* Knobs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center', position: 'relative' }}>
        <Knob
          label="Rate"
          value={getRateDisplayValue()}
          min={params.sync ? 0 : 0.1}
          max={params.sync ? 6 : 20}
          step={params.sync ? 1 : 0.1}
          unit={getRateUnit()}
          hideNumericValue={params.sync}
          color={color}
          size="sm"
          onChange={handleRateChange}
        />
        <Knob
          label="Depth"
          value={params.depth}
          min={0}
          max={100}
          step={1}
          unit="%"
          color={color}
          size="sm"
          onChange={(depth) => onChange({ depth })}
        />
      </div>

      {/* Waveform selector */}
      <select
        value={params.waveform}
        onChange={(e) => onChange({ waveform: e.target.value as LFOParams['waveform'] })}
        style={{
          padding: 'var(--spacing-1)',
          backgroundColor: 'var(--color-bg-primary)',
          color: color,
          border: `1px solid ${color}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <option value="sine">SINE</option>
        <option value="triangle">TRIANGLE</option>
        <option value="sawtooth">SAWTOOTH</option>
        <option value="square">SQUARE</option>
      </select>
    </div>
  )
}
