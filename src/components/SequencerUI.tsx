/**
 * Sequencer UI Component
 * UI for the note sequencer (state managed by parent)
 */

interface Step {
  enabled: boolean
  note: number
}

interface SequencerUIProps {
  steps: Step[]
  currentStep: number
  isPlaying: boolean
  bpm: number
  gateLength: number
  isEnabled: boolean
  onPlayStop: () => void
  onBpmChange: (bpm: number) => void
  onGateChange: (gate: number) => void
  onToggleStep: (index: number) => void
  onSetStepNote: (index: number, note: number) => void
  onClearPattern: () => void
  onRandomPattern: () => void
}

export function SequencerUI({
  steps,
  currentStep,
  isPlaying,
  bpm,
  gateLength,
  isEnabled,
  onPlayStop,
  onBpmChange,
  onGateChange,
  onToggleStep,
  onSetStepNote,
  onClearPattern,
  onRandomPattern,
}: SequencerUIProps) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-4)',
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
          NOTE SEQUENCER {isPlaying && '►'}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
          <button
            onClick={onPlayStop}
            disabled={!isEnabled}
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              backgroundColor: isPlaying ? 'var(--color-warning)' : 'var(--color-success)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: isEnabled ? 'pointer' : 'not-allowed',
              opacity: isEnabled ? 1 : 0.5,
            }}
          >
            {isPlaying ? '⏸ STOP' : '▶ PLAY'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <label
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              BPM:
            </label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => {
                onBpmChange(Number(e.target.value))
              }}
              min={40}
              max={240}
              style={{
                width: '60px',
                padding: 'var(--spacing-1)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-mono)',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <label
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              Gate:
            </label>
            <input
              type="range"
              value={gateLength}
              onChange={(e) => {
                onGateChange(Number(e.target.value))
              }}
              min={10}
              max={95}
              style={{
                width: '80px',
              }}
            />
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-mono)',
                width: '35px',
              }}
            >
              {gateLength}%
            </span>
          </div>

          <button
            onClick={onClearPattern}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>

          <button
            onClick={onRandomPattern}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              cursor: 'pointer',
            }}
          >
            Random
          </button>
        </div>
      </div>

      {/* Step Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(16, 1fr)',
          gap: 'var(--spacing-2)',
        }}
      >
        {steps.map((step, index) => {
          const isActive = currentStep === index

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-1)',
              }}
            >
              {/* Step button */}
              <button
                onClick={() => {
                  onToggleStep(index)
                }}
                style={{
                  height: '60px',
                  backgroundColor: step.enabled
                    ? isActive
                      ? 'var(--color-active)'
                      : 'var(--color-trace-primary)'
                    : 'var(--color-bg-primary)',
                  border: `2px solid ${isActive ? 'var(--color-active)' : 'var(--color-border-primary)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  fontSize: 'var(--font-size-xs)',
                  color: step.enabled ? '#000' : 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-family-mono)',
                  fontWeight: 'bold',
                  boxShadow: isActive ? '0 0 10px var(--color-active)' : 'none',
                }}
              >
                {index + 1}
              </button>

              {/* Note selector */}
              {step.enabled && (
                <select
                  value={step.note}
                  onChange={(e) => {
                    onSetStepNote(index, Number(e.target.value))
                  }}
                  style={{
                    padding: 'var(--spacing-1)',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    fontFamily: 'var(--font-family-mono)',
                    cursor: 'pointer',
                  }}
                >
                  {Array.from({ length: 37 }, (_, i) => i + 36).map((note) => {
                    const n = noteNames[note % 12]
                    const o = Math.floor(note / 12) - 1
                    return (
                      <option key={note} value={note}>
                        {n}
                        {o}
                      </option>
                    )
                  })}
                </select>
              )}
              {!step.enabled && (
                <div
                  style={{
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                >
                  -
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
