/**
 * LFO Pair Control
 * Compact control for a pair of LFOs with visualizer and 4 knobs
 */

import { Knob } from './Knob'
import { LFOParams, LFODestination } from '../audio/types'

interface LFOPairControlProps {
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
  onPairDepthChange: (depth: number) => void
}

const DESTINATION_LABELS: Record<LFODestination, string> = {
  [LFODestination.PITCH]: 'PITCH',
  [LFODestination.AMPLITUDE]: 'AMP',
  [LFODestination.FILTER_CUTOFF]: 'FILTER CUTOFF',
  [LFODestination.FILTER_RESONANCE]: 'FILTER RES',
  [LFODestination.OP1_LEVEL]: 'OP1 LEVEL',
  [LFODestination.OP2_LEVEL]: 'OP2 LEVEL',
  [LFODestination.OP3_LEVEL]: 'OP3 LEVEL',
  [LFODestination.OP4_LEVEL]: 'OP4 LEVEL',
  [LFODestination.OP1_RATIO]: 'OP1 RATIO',
  [LFODestination.OP2_RATIO]: 'OP2 RATIO',
  [LFODestination.OP3_RATIO]: 'OP3 RATIO',
  [LFODestination.OP4_RATIO]: 'OP4 RATIO',
  [LFODestination.FX_REVERB_WET]: 'REVERB MIX',
  [LFODestination.FX_DELAY_WET]: 'DELAY MIX',
  [LFODestination.FX_DELAY_TIME]: 'DELAY TIME',
  [LFODestination.FX_CHORUS_WET]: 'CHORUS MIX',
  [LFODestination.FX_DISTORTION_WET]: 'DISTORTION MIX',
}

export function LFOPairControl({
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
  onPairDepthChange,
}: LFOPairControlProps) {
  const destLabel = DESTINATION_LABELS[destination] ?? 'UNKNOWN'

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
      }}
    >
      {/* LFO 1 Controls (Left) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
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
          max={20}
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

      {/* Center: Pair info and global depth control */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
          minWidth: '200px',
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
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          → {destLabel}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          {lfo1Params.waveform.toUpperCase()} + {lfo2Params.waveform.toUpperCase()}
        </div>
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
      </div>

      {/* LFO 2 Controls (Right) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
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
          max={20}
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
