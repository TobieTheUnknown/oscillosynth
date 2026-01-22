/**
 * Sequencer UI Component
 * UI for the note sequencer (state managed by parent)
 */

import { KnobControl } from './KnobControl'

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

  const enabledSteps = steps.filter((s) => s.enabled).length

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: '3px',
          background: isPlaying
            ? 'linear-gradient(90deg, #FF6B6B 0%, #FFE66D 50%, var(--color-idle) 100%)'
            : 'linear-gradient(90deg, var(--color-border-primary) 0%, var(--color-text-secondary) 100%)',
          transition: 'background 0.3s',
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: 'var(--spacing-3)',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderBottom: '1px solid var(--color-border-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
          }}
        >
          SEQ_16STEP
        </div>

        {/* Status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-mono)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#FF6B6B' : 'var(--color-text-secondary)',
              boxShadow: isPlaying ? '0 0 8px #FF6B6B' : 'none',
              animation: isPlaying ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          />
          {isPlaying ? `STEP ${currentStep + 1}/16` : `${enabledSteps} ACTIVE`}
        </div>
      </div>

      {/* Controls Section */}
      <div
        style={{
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--color-border-secondary)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 'var(--spacing-4)',
            alignItems: 'center',
          }}
        >
          {/* Play/Stop button */}
          <button
            onClick={onPlayStop}
            disabled={!isEnabled}
            style={{
              padding: 'var(--spacing-3) var(--spacing-5)',
              backgroundColor: isPlaying ? '#FF6B6B' : 'var(--color-active)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-md)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: isEnabled ? 'pointer' : 'not-allowed',
              opacity: isEnabled ? 1 : 0.5,
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: isPlaying ? '0 0 16px rgba(255, 107, 107, 0.4)' : '0 0 16px rgba(78, 205, 196, 0.3)',
            }}
          >
            {isPlaying ? '■ STOP' : '▶ PLAY'}
          </button>

          {/* Knobs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--spacing-5)',
              padding: 'var(--spacing-2)',
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-secondary)',
            }}
          >
            <KnobControl value={bpm} min={40} max={240} onChange={onBpmChange} label="BPM" color="var(--color-idle)" size={50} />
            <div style={{ width: '1px', backgroundColor: 'var(--color-border-secondary)' }} />
            <KnobControl
              value={gateLength}
              min={10}
              max={95}
              onChange={onGateChange}
              label="GATE"
              unit="%"
              color="#FFE66D"
              size={50}
            />
          </div>

          {/* Pattern buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexDirection: 'column' }}>
            <button
              onClick={onRandomPattern}
              style={{
                padding: 'var(--spacing-2) var(--spacing-3)',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
                color: '#8A2BE2',
                border: '1px solid rgba(138, 43, 226, 0.5)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(138, 43, 226, 0.2)'
                e.currentTarget.style.boxShadow = '0 0 8px rgba(138, 43, 226, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(138, 43, 226, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ◈ RANDOM
            </button>
            <button
              onClick={onClearPattern}
              style={{
                padding: 'var(--spacing-2) var(--spacing-3)',
                backgroundColor: 'rgba(255, 100, 100, 0.1)',
                color: '#FF6464',
                border: '1px solid rgba(255, 100, 100, 0.5)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.2)'
                e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 100, 100, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              ⊗ CLEAR
            </button>
          </div>
        </div>
      </div>

      {/* Step Grid */}
      <div style={{ padding: 'var(--spacing-4)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(16, 1fr)',
            gap: 'var(--spacing-2)',
          }}
        >
          {steps.map((step, index) => {
            const isActive = currentStep === index
            const noteIndex = step.note % 12
            const octave = Math.floor(step.note / 12) - 1
            const noteName = `${noteNames[noteIndex]}${octave}`

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
                        : 'rgba(78, 205, 196, 0.6)'
                      : 'var(--color-bg-primary)',
                    border: `1px solid ${
                      isActive ? 'var(--color-active)' : step.enabled ? 'rgba(78, 205, 196, 0.8)' : 'var(--color-border-secondary)'
                    }`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                    fontSize: 'var(--font-size-xs)',
                    color: step.enabled ? '#000' : 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-family-mono)',
                    fontWeight: 'bold',
                    boxShadow: isActive ? '0 0 16px var(--color-active), inset 0 1px 2px rgba(255,255,255,0.3)' : 'none',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!step.enabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                      e.currentTarget.style.borderColor = 'var(--color-border-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!step.enabled) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'
                      e.currentTarget.style.borderColor = 'var(--color-border-secondary)'
                    }
                  }}
                >
                  <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>{index + 1}</div>
                  {step.enabled && (
                    <div
                      style={{
                        fontSize: 'var(--font-size-xxs)',
                        fontWeight: 'normal',
                        marginTop: 'var(--spacing-1)',
                      }}
                    >
                      {noteName}
                    </div>
                  )}
                </button>

                {/* Note selector */}
                {step.enabled && (
                  <select
                    id={`sequencer-step-note-${index}`}
                    name={`sequencer-step-note-${index}`}
                    value={step.note}
                    onChange={(e) => {
                      onSetStepNote(index, Number(e.target.value))
                    }}
                    style={{
                      padding: 'var(--spacing-1)',
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xxs)',
                      fontFamily: 'var(--font-family-mono)',
                      cursor: 'pointer',
                      textAlign: 'center',
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
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-tertiary)',
                      fontFamily: 'var(--font-family-mono)',
                      opacity: 0.3,
                    }}
                  >
                    —
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
