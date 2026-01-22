/**
 * Compact Knob Group
 * Reusable group of 2-4 knobs with LFO pad styling
 */

import { Knob } from './Knob'

interface KnobConfig {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}

interface CompactKnobGroupProps {
  title: string
  knobs: KnobConfig[]
  color: string
}

export function CompactKnobGroup({ title, knobs, color }: CompactKnobGroupProps) {
  return (
    <div
      style={{
        padding: 'var(--spacing-3)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid var(--color-idle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-2)',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: color,
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: `0 0 8px ${color}`,
        }}
      >
        {title}
      </div>

      {/* Knobs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-2)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {knobs.map((knob, index) => (
          <Knob
            key={index}
            label={knob.label}
            value={knob.value}
            min={knob.min}
            max={knob.max}
            step={knob.step ?? 0.1}
            unit={knob.unit ?? ''}
            color={color}
            size="sm"
            onChange={knob.onChange}
          />
        ))}
      </div>
    </div>
  )
}
