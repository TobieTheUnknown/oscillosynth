/**
 * Pan Spread Controls
 * Control stereo width, note spread, and per-operator panning
 */

import { Knob } from './Knob'
import { StereoWidthParams } from '../audio/types'

interface PanControlsProps {
  stereoWidth: StereoWidthParams
  onStereoWidthChange: (params: Partial<StereoWidthParams>) => void
}

export function PanControls({
  stereoWidth,
  onStereoWidthChange,
}: PanControlsProps) {
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
        PAN SPREAD
      </div>

      {/* Stereo Width Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-4)',
          padding: 'var(--spacing-3)',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
          }}
        >
          STEREO WIDTH
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
            onClick={() => onStereoWidthChange({ enabled: !stereoWidth.enabled })}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: stereoWidth.enabled
                ? 'var(--color-success)'
                : 'var(--color-bg-primary)',
              color: stereoWidth.enabled ? '#000' : 'var(--color-text-primary)',
              border: `2px solid ${
                stereoWidth.enabled ? 'var(--color-success)' : 'var(--color-border-primary)'
              }`,
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {stereoWidth.enabled ? '✓ ON' : 'OFF'}
          </button>

          {/* Width Knob */}
          <div>
            <Knob
              label="WIDTH"
              value={stereoWidth.width}
              onChange={(value) => onStereoWidthChange({ width: value })}
              min={0}
              max={200}
              step={5}
              unit="%"
              color="var(--color-trace-primary)"
            />
          </div>
        </div>
      </div>

      {/* Note Spread Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
          padding: 'var(--spacing-3)',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
          }}
        >
          NOTE SPREAD
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
            onClick={() => onStereoWidthChange({ noteSpread: !stereoWidth.noteSpread })}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: stereoWidth.noteSpread
                ? 'var(--color-success)'
                : 'var(--color-bg-primary)',
              color: stereoWidth.noteSpread ? '#000' : 'var(--color-text-primary)',
              border: `2px solid ${
                stereoWidth.noteSpread ? 'var(--color-success)' : 'var(--color-border-primary)'
              }`,
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {stereoWidth.noteSpread ? '✓ ON' : 'OFF'}
          </button>

          {/* Amount Knob */}
          <div>
            <Knob
              label="AMOUNT"
              value={stereoWidth.noteSpreadAmount}
              onChange={(value) => onStereoWidthChange({ noteSpreadAmount: value })}
              min={0}
              max={100}
              step={5}
              unit="%"
              color="var(--color-trace-secondary)"
            />
          </div>

          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-family-mono)',
              fontStyle: 'italic',
              maxWidth: '200px',
            }}
          >
            Pan notes based on pitch (low=left, high=right)
          </div>
        </div>
      </div>
    </div>
  )
}
