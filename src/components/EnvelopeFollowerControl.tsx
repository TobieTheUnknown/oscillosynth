/**
 * Envelope Follower Control
 * UI for controlling the envelope follower (audio-reactive modulation)
 */

import { Knob } from './Knob'
import { EnvelopeFollowerParams, LFODestination } from '../audio/types'

interface EnvelopeFollowerControlProps {
  params: EnvelopeFollowerParams
  onChange: (params: Partial<EnvelopeFollowerParams>) => void
}

const DESTINATION_LABELS: Record<LFODestination, string> = {
  [LFODestination.PITCH]: 'PITCH',
  [LFODestination.AMPLITUDE]: 'AMPLITUDE',
  [LFODestination.FILTER_CUTOFF]: 'FILTER CUTOFF',
  [LFODestination.FILTER_RESONANCE]: 'FILTER RESONANCE',
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

export function EnvelopeFollowerControl({ params, onChange }: EnvelopeFollowerControlProps) {
  const destLabel = DESTINATION_LABELS[params.destination] ?? 'UNKNOWN'

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
      {/* Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)',
          minWidth: '120px',
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
          ENV FOLLOWER
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={params.enabled}
            onChange={(e) => {
              onChange({ enabled: e.target.checked })
            }}
            style={{
              cursor: 'pointer',
            }}
          />
          ENABLED
        </label>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-3)',
          opacity: params.enabled ? 1 : 0.5,
          pointerEvents: params.enabled ? 'auto' : 'none',
        }}
      >
        <Knob
          label="Smoothing"
          value={params.smoothing}
          min={0}
          max={1}
          step={0.01}
          unit=""
          color="var(--color-trace-primary)"
          onChange={(smoothing) => {
            onChange({ smoothing })
          }}
        />
        <Knob
          label="Depth"
          value={params.depth}
          min={0}
          max={200}
          step={1}
          unit="%"
          color="var(--color-trace-primary)"
          onChange={(depth) => {
            onChange({ depth })
          }}
        />
      </div>

      {/* Destination */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)',
          minWidth: '180px',
          opacity: params.enabled ? 1 : 0.5,
          pointerEvents: params.enabled ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          DESTINATION
        </div>
        <select
          value={params.destination}
          onChange={(e) => {
            onChange({ destination: e.target.value as LFODestination })
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
            <option value={LFODestination.FILTER_RESONANCE}>FILTER RESONANCE</option>
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
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          → {destLabel}
        </div>
      </div>
    </div>
  )
}
