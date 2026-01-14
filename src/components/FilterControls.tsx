/**
 * Filter Controls
 * Filter parameter editing with knobs
 */

import { Knob } from './Knob'
import { LogKnob, BipolarKnob } from './KnobVariants'
import { FilterParams } from '../audio/types'

interface FilterControlsProps {
  params: FilterParams
  onChange: (params: Partial<FilterParams>) => void
}

export function FilterControls({ params, onChange }: FilterControlsProps) {
  const color = '#FF9664'

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-6)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-md)',
          color: color,
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-3)',
          textAlign: 'center',
        }}
      >
        FILTER
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-4)',
        }}
      >
        {/* Filter Type Selector */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-2)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-mono)',
              textAlign: 'center',
            }}
          >
            Type
          </div>
          <select
            value={params.type}
            onChange={(e) => {
              onChange({ type: e.target.value as FilterParams['type'] })
            }}
            style={{
              padding: 'var(--spacing-2)',
              backgroundColor: 'var(--color-bg-primary)',
              color: color,
              border: '2px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-mono)',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: 'bold',
            }}
          >
            <option value="lowpass">LOWPASS</option>
            <option value="highpass">HIGHPASS</option>
            <option value="bandpass">BANDPASS</option>
            <option value="notch">NOTCH</option>
          </select>
        </div>

        {/* Knobs */}
        <LogKnob
          label="Cutoff"
          value={params.cutoff}
          min={20}
          max={20000}
          defaultValue={2000}
          unit="Hz"
          color={color}
          onChange={(cutoff) => {
            onChange({ cutoff })
          }}
        />
        <Knob
          label="Resonance"
          value={params.resonance}
          min={0}
          max={20}
          step={0.1}
          color={color}
          onChange={(resonance) => {
            onChange({ resonance })
          }}
        />
        <BipolarKnob
          label="Envelope"
          value={params.envelope}
          min={-100}
          max={100}
          step={1}
          unit="%"
          color={color}
          colorNegative="#FF4136"
          onChange={(envelope) => {
            onChange({ envelope })
          }}
        />
      </div>
    </div>
  )
}
