/**
 * Operator Controls
 * FM Operator parameter editing with knobs
 */

import { Knob } from './Knob'
import { OperatorParams } from '../audio/types'

interface OperatorControlsProps {
  operatorNumber: 1 | 2 | 3 | 4
  params: OperatorParams
  onChange: (params: Partial<OperatorParams>) => void
}

export function OperatorControls({
  operatorNumber,
  params,
  onChange,
}: OperatorControlsProps) {
  const color = ['#00FF41', '#00FFFF', '#FFFF00', '#FF64FF'][operatorNumber - 1] ?? '#00FF41'

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-3)',
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
        OPERATOR {operatorNumber}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 'var(--spacing-3)',
        }}
      >
        <Knob
          label="Ratio"
          value={params.ratio}
          min={0.5}
          max={16}
          step={0.1}
          color={color}
          onChange={(ratio) => {
            onChange({ ratio })
          }}
        />
        <Knob
          label="Level"
          value={params.level}
          min={0}
          max={100}
          step={1}
          unit="%"
          color={color}
          onChange={(level) => {
            onChange({ level })
          }}
        />
        <Knob
          label="Attack"
          value={params.attack}
          min={0.001}
          max={5}
          step={0.01}
          unit="s"
          color={color}
          onChange={(attack) => {
            onChange({ attack })
          }}
        />
        <Knob
          label="Decay"
          value={params.decay}
          min={0.001}
          max={5}
          step={0.01}
          unit="s"
          color={color}
          onChange={(decay) => {
            onChange({ decay })
          }}
        />
        <Knob
          label="Sustain"
          value={params.sustain}
          min={0}
          max={1}
          step={0.01}
          color={color}
          onChange={(sustain) => {
            onChange({ sustain })
          }}
        />
        <Knob
          label="Release"
          value={params.release}
          min={0.001}
          max={5}
          step={0.01}
          unit="s"
          color={color}
          onChange={(release) => {
            onChange({ release })
          }}
        />
      </div>
    </div>
  )
}
