/**
 * Portamento Controls
 * Enable/disable portamento and control glide time and mode
 */

import { TimeKnob } from './KnobVariants'
import { PortamentoParams } from '../audio/types'

interface PortamentoControlsProps {
  params: PortamentoParams
  onChange: (params: Partial<PortamentoParams>) => void
}

export function PortamentoControls({ params, onChange }: PortamentoControlsProps) {
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
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        PORTAMENTO
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-4)',
          alignItems: 'center',
        }}
      >
        {/* Enable/Disable Toggle */}
        <button
          onClick={() => onChange({ enabled: !params.enabled })}
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: params.enabled ? 'var(--color-success)' : 'var(--color-bg-primary)',
            color: params.enabled ? '#000' : 'var(--color-text-primary)',
            border: `2px solid ${params.enabled ? 'var(--color-success)' : 'var(--color-border-primary)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {params.enabled ? '✓ ENABLED' : 'DISABLED'}
        </button>

        {/* Glide Time Knob */}
        <div>
          <TimeKnob
            label="TIME"
            value={params.time / 1000}
            onChange={(value) => onChange({ time: value * 1000 })}
            min={0.001}
            max={1}
            defaultValue={0.1}
            color="var(--color-trace-primary)"
          />
        </div>

        {/* Mode Toggle */}
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
            MODE
          </div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-1)',
            }}
          >
            <button
              onClick={() => onChange({ mode: 'always' })}
              style={{
                padding: 'var(--spacing-2) var(--spacing-3)',
                backgroundColor: params.mode === 'always' ? 'var(--color-active)' : 'var(--color-bg-primary)',
                color: params.mode === 'always' ? '#000' : 'var(--color-text-primary)',
                border: `1px solid ${params.mode === 'always' ? 'var(--color-active)' : 'var(--color-border-primary)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ALWAYS
            </button>
            <button
              onClick={() => onChange({ mode: 'legato' })}
              style={{
                padding: 'var(--spacing-2) var(--spacing-3)',
                backgroundColor: params.mode === 'legato' ? 'var(--color-active)' : 'var(--color-bg-primary)',
                color: params.mode === 'legato' ? '#000' : 'var(--color-text-primary)',
                border: `1px solid ${params.mode === 'legato' ? 'var(--color-active)' : 'var(--color-border-primary)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              LEGATO
            </button>
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-family-mono)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            {params.mode === 'always' ? 'Always glide' : 'Only when overlapping'}
          </div>
        </div>
      </div>
    </div>
  )
}
