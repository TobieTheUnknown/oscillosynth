/**
 * Integrated Oscilloscope Controls
 * Overlay controls for the XY oscilloscope
 */

import { Knob } from './Knob'

interface IntegratedOscilloscopeControlsProps {
  latchMode: boolean
  onLatchToggle: () => void
  activeNotesCount: number
  onClearNotes: () => void
  volume: number
  onVolumeChange: (volume: number) => void
}

export function IntegratedOscilloscopeControls({
  latchMode,
  onLatchToggle,
  activeNotesCount,
  onClearNotes,
  volume,
  onVolumeChange,
}: IntegratedOscilloscopeControlsProps) {
  return (
    <>
      {/* Top-Left: Volume Control */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-3)',
          left: 'var(--spacing-3)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--spacing-2)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Knob
            value={volume}
            min={0}
            max={100}
            onChange={onVolumeChange}
            label="VOL"
            unit="%"
            color="var(--color-idle)"
            size="sm"
          />
        </div>
      </div>

      {/* Top-Right: Latch Mode Toggle */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-3)',
          right: 'var(--spacing-3)',
          display: 'flex',
          gap: 'var(--spacing-2)',
          zIndex: 10,
        }}
      >
        <button
          onClick={(e) => {
            onLatchToggle()
            e.currentTarget.blur() // Remove focus immediately so keyboard still works
          }}
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: latchMode ? 'rgba(78, 205, 196, 0.2)' : 'rgba(0, 0, 0, 0.8)',
            color: latchMode ? 'var(--color-active)' : 'rgba(255, 255, 255, 0.7)',
            border: `1px solid ${latchMode ? 'var(--color-active)' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.2s',
            boxShadow: latchMode
              ? '0 0 16px rgba(78, 205, 196, 0.4), 0 4px 16px rgba(0, 0, 0, 0.6)'
              : '0 4px 16px rgba(0, 0, 0, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {latchMode ? '⬢ LATCH' : '○ LATCH'}
        </button>
        {activeNotesCount > 0 && (
          <button
            onClick={(e) => {
              onClearNotes()
              e.currentTarget.blur() // Remove focus immediately so keyboard still works
            }}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'rgba(255, 100, 100, 0.2)',
              color: '#FF6464',
              border: '1px solid rgba(255, 100, 100, 0.5)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s',
              boxShadow: '0 0 16px rgba(255, 100, 100, 0.4), 0 4px 16px rgba(0, 0, 0, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            ⊗ {activeNotesCount}
          </button>
        )}
      </div>
    </>
  )
}
