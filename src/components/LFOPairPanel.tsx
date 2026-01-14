/**
 * LFO Pair Panel
 * Integrated visualizer and controls for a single LFO pair
 * Layout: [LFO1 Knobs] [Visualizer] [LFO2 Knobs]
 */

import { useRef, useEffect } from 'react'
import { Knob } from './Knob'
import { LFOParams, LFODestination } from '../audio/types'
import { audioEngine } from '../audio/AudioEngine'

interface LFOPairPanelProps {
  pairNumber: 1 | 2 | 3 | 4
  lfo1Params: LFOParams
  lfo2Params: LFOParams
  lfo1Index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  lfo2Index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  destination: LFODestination
  pairDepth: number // 0-200% - Global depth applied to combined LFO signal
  color1: string
  color2: string
  onLFO1Change: (params: Partial<LFOParams>) => void
  onLFO2Change: (params: Partial<LFOParams>) => void
  onDestinationChange: (destination: LFODestination) => void
  onPairDepthChange: (depth: number) => void
}

export function LFOPairPanel({
  pairNumber,
  lfo1Params,
  lfo2Params,
  lfo1Index,
  lfo2Index,
  destination,
  pairDepth,
  color1,
  color2,
  onLFO1Change,
  onLFO2Change,
  onDestinationChange,
  onPairDepthChange,
}: LFOPairPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const width = 400
  const height = 120

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

      // Increment animation phase for scrolling effect
      animationPhase += 0.016 // ~60fps

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
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      const pointsPerWave = 400 // More points for smoother display
      const centerY = height / 2
      const amplitude = height * 0.35

      // Time window: show 1 second of LFO output
      const timeWindow = 1.0 // seconds
      const lfo1 = engine.getLFO(lfo1Index)
      const lfo2 = engine.getLFO(lfo2Index)

      // Helper function to compute waveform value at a specific time
      const computeWaveformValue = (
        lfo: typeof lfo1,
        t: number
      ): number => {
        const phase = (t * lfo.params.rate * Math.PI * 2 + (lfo.params.phase * Math.PI) / 180) % (Math.PI * 2)
        let rawValue = 0
        switch (lfo.params.waveform) {
          case 'sine':
            rawValue = Math.sin(phase)
            break
          case 'square':
            rawValue = phase < Math.PI ? 1 : -1
            break
          case 'sawtooth':
            rawValue = (phase / Math.PI - 1)
            break
          case 'triangle':
            rawValue = phase < Math.PI ? (phase / Math.PI) * 2 - 1 : 3 - (phase / Math.PI) * 2
            break
          default:
            rawValue = Math.sin(phase)
        }
        return rawValue * (lfo.params.depth / 100)
      }

      // Draw LFO 1
      ctx.strokeStyle = color1
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      for (let i = 0; i <= pointsPerWave; i++) {
        const x = (i / pointsPerWave) * width
        const t = (i / pointsPerWave) * timeWindow + animationPhase
        const value = computeWaveformValue(lfo1, t)
        const y = centerY - value * amplitude
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // Draw LFO 2
      ctx.strokeStyle = color2
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      for (let i = 0; i <= pointsPerWave; i++) {
        const x = (i / pointsPerWave) * width
        const t = (i / pointsPerWave) * timeWindow + animationPhase
        const value = computeWaveformValue(lfo2, t)
        const y = centerY - value * amplitude
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // Draw combined signal
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      for (let i = 0; i <= pointsPerWave; i++) {
        const x = (i / pointsPerWave) * width
        const t = (i / pointsPerWave) * timeWindow + animationPhase
        const val1 = computeWaveformValue(lfo1, t)
        const val2 = computeWaveformValue(lfo2, t)

        // Combine using ADD mode (default)
        const combinedValue = val1 + val2

        const y = centerY - combinedValue * amplitude
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      ctx.globalAlpha = 1.0

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [pairNumber, lfo1Index, lfo2Index, color1, color2, width, height])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-4)',
      }}
    >
      {/* LFO 1 Controls (Left) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: color1,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          LFO {lfo1Index + 1}
        </div>
        <Knob
          label="Rate"
          value={lfo1Params.rate}
          min={0.1}
          max={10}
          step={0.1}
          unit="Hz"
          color={color1}
          onChange={(rate) => {
            onLFO1Change({ rate })
          }}
        />
        <Knob
          label="Depth"
          value={lfo1Params.depth}
          min={0}
          max={100}
          step={1}
          unit="%"
          color={color1}
          onChange={(depth) => {
            onLFO1Change({ depth })
          }}
        />
      </div>

      {/* Center: Visualizer + Info */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-2)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-trace-primary)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
          }}
        >
          PAIR {pairNumber}
        </div>
        <select
          value={destination}
          onChange={(e) => {
            onDestinationChange(e.target.value as LFODestination)
          }}
          style={{
            padding: 'var(--spacing-1) var(--spacing-2)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-mono)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <optgroup label="Synth">
            <option value={LFODestination.PITCH}>PITCH</option>
            <option value={LFODestination.AMPLITUDE}>AMPLITUDE</option>
          </optgroup>
          <optgroup label="Filter">
            <option value={LFODestination.FILTER_CUTOFF}>FILTER CUTOFF</option>
            <option value={LFODestination.FILTER_RESONANCE}>FILTER RES</option>
          </optgroup>
          <optgroup label="Operators">
            <option value={LFODestination.OP1_LEVEL}>OP1 LEVEL</option>
            <option value={LFODestination.OP2_LEVEL}>OP2 LEVEL</option>
            <option value={LFODestination.OP3_LEVEL}>OP3 LEVEL</option>
            <option value={LFODestination.OP4_LEVEL}>OP4 LEVEL</option>
            <option value={LFODestination.OP1_RATIO}>OP1 RATIO</option>
            <option value={LFODestination.OP2_RATIO}>OP2 RATIO</option>
            <option value={LFODestination.OP3_RATIO}>OP3 RATIO</option>
            <option value={LFODestination.OP4_RATIO}>OP4 RATIO</option>
          </optgroup>
          <optgroup label="Master FX">
            <option value={LFODestination.FX_REVERB_WET}>REVERB MIX</option>
            <option value={LFODestination.FX_DELAY_WET}>DELAY MIX</option>
            <option value={LFODestination.FX_DELAY_TIME}>DELAY TIME</option>
            <option value={LFODestination.FX_CHORUS_WET}>CHORUS MIX</option>
            <option value={LFODestination.FX_DISTORTION_WET}>DISTORTION MIX</option>
          </optgroup>
        </select>

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            border: '1px solid var(--color-border-secondary)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#000',
          }}
        />

        {/* Global Pair Depth Control */}
        <Knob
          label="Pair Depth"
          value={pairDepth}
          min={0}
          max={200}
          step={1}
          unit="%"
          color="var(--color-accent-primary)"
          onChange={onPairDepthChange}
        />

        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          {lfo1Params.waveform.toUpperCase()} + {lfo2Params.waveform.toUpperCase()}
        </div>
      </div>

      {/* LFO 2 Controls (Right) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: color2,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          LFO {lfo2Index + 1}
        </div>
        <Knob
          label="Rate"
          value={lfo2Params.rate}
          min={0.1}
          max={10}
          step={0.1}
          unit="Hz"
          color={color2}
          onChange={(rate) => {
            onLFO2Change({ rate })
          }}
        />
        <Knob
          label="Depth"
          value={lfo2Params.depth}
          min={0}
          max={100}
          step={1}
          unit="%"
          color={color2}
          onChange={(depth) => {
            onLFO2Change({ depth })
          }}
        />
      </div>
    </div>
  )
}
