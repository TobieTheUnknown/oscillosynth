/**
 * Step Sequencer Control
 * UI for pattern-based modulation with 16 programmable steps
 */

import { Knob } from './Knob'
import { StepSequencerParams, LFODestination } from '../audio/types'

interface StepSequencerControlProps {
  params: StepSequencerParams
  onChange: (params: Partial<StepSequencerParams>) => void
}

const DESTINATION_LABELS: Record<LFODestination, string> = {
  [LFODestination.PITCH]: 'PITCH',
  [LFODestination.AMPLITUDE]: 'AMPLITUDE',
  [LFODestination.PAN]: 'PAN',
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

export function StepSequencerControl({ params, onChange }: StepSequencerControlProps) {
  const destLabel = DESTINATION_LABELS[params.destination] ?? 'UNKNOWN'

  const handleStepClick = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickY = event.clientY - rect.top
    const height = rect.height
    // Invert Y so clicking at top = 100, bottom = 0
    const value = Math.round((1 - clickY / height) * 100)
    const clampedValue = Math.max(0, Math.min(100, value))

    const newSteps = [...params.steps]
    newSteps[index] = clampedValue
    onChange({ steps: newSteps })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {/* Top Row: Title and Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-4)',
        }}
      >
        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
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
            STEP SEQUENCER
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
            label="Rate"
            value={params.rate}
            min={0.1}
            max={20}
            step={0.1}
            unit="Hz"
            color="var(--color-trace-primary)"
            onChange={(rate) => {
              onChange({ rate })
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

      {/* Step Grid */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-2)',
          opacity: params.enabled ? 1 : 0.5,
          pointerEvents: params.enabled ? 'auto' : 'none',
        }}
      >
        {params.steps.map((value, index) => (
          <div
            key={index}
            onClick={(e) => {
              handleStepClick(index, e)
            }}
            style={{
              flex: 1,
              height: '120px',
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Value bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${value}%`,
                backgroundColor: 'var(--color-trace-primary)',
                opacity: 0.6,
                transition: 'height 0.1s ease-out',
              }}
            />
            {/* Step number */}
            <div
              style={{
                position: 'absolute',
                top: 'var(--spacing-1)',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              {index + 1}
            </div>
            {/* Value text */}
            <div
              style={{
                position: 'absolute',
                bottom: 'var(--spacing-1)',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
