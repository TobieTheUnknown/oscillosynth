/**
 * Note Sequencer
 * 16-step pattern sequencer for playing notes
 */

import { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'

interface Step {
  enabled: boolean
  note: number // MIDI note number
}

interface NoteSequencerProps {
  onNoteOn: (midiNote: number, velocity: number) => void
  onNoteOff: (midiNote: number) => void
  isEnabled: boolean
}

const DEFAULT_STEPS: Step[] = Array.from({ length: 16 }, (_, i) => ({
  enabled: i % 4 === 0, // Enable every 4th step by default
  note: 60 + (i % 8), // C4 scale pattern
}))

export function NoteSequencer({ onNoteOn, onNoteOff, isEnabled }: NoteSequencerProps) {
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS)
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [gateLength, setGateLength] = useState(50) // 0-100% gate length

  const sequenceRef = useRef<Tone.Sequence<number> | null>(null)
  const activeNoteRef = useRef<number | null>(null)

  // Cleanup sequence on unmount or when stopping
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose()
        sequenceRef.current = null
      }
      if (activeNoteRef.current !== null) {
        onNoteOff(activeNoteRef.current)
        activeNoteRef.current = null
      }
    }
  }, [onNoteOff])

  // Setup sequence when parameters change
  useEffect(() => {
    if (!isEnabled) {
      if (isPlaying) {
        handlePlayStop()
      }
      return
    }

    // Dispose old sequence
    if (sequenceRef.current) {
      sequenceRef.current.dispose()
      sequenceRef.current = null
    }

    // Set BPM
    Tone.Transport.bpm.value = bpm

    // Create new sequence
    const sequence = new Tone.Sequence(
      (time, step: number) => {
        // Schedule UI update
        Tone.Draw.schedule(() => {
          setCurrentStep(step)
        }, time)

        const currentStepData = steps[step]
        if (currentStepData && currentStepData.enabled) {
          // Stop previous note immediately
          if (activeNoteRef.current !== null) {
            onNoteOff(activeNoteRef.current)
            activeNoteRef.current = null
          }

          // Play new note
          const note = currentStepData.note
          onNoteOn(note, 100)
          activeNoteRef.current = note

          // Calculate note duration based on gate length
          const stepDuration = 60 / bpm / 4 // Duration of 16th note in seconds
          const noteDuration = stepDuration * (gateLength / 100)

          // Schedule note off
          Tone.Transport.scheduleOnce(() => {
            if (activeNoteRef.current === note) {
              onNoteOff(note)
              activeNoteRef.current = null
            }
          }, time + noteDuration)
        } else {
          // Step is disabled, stop any playing note
          if (activeNoteRef.current !== null) {
            Tone.Draw.schedule(() => {
              if (activeNoteRef.current !== null) {
                onNoteOff(activeNoteRef.current)
                activeNoteRef.current = null
              }
            }, time)
          }
        }
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    )

    sequence.start(0)
    sequenceRef.current = sequence
  }, [steps, bpm, gateLength, isEnabled, onNoteOn, onNoteOff, isPlaying])

  const handlePlayStop = () => {
    if (!isPlaying) {
      Tone.Transport.start()
      setIsPlaying(true)
    } else {
      Tone.Transport.stop()
      Tone.Transport.position = 0 // Reset position
      setIsPlaying(false)
      setCurrentStep(-1)
      if (activeNoteRef.current !== null) {
        onNoteOff(activeNoteRef.current)
        activeNoteRef.current = null
      }
    }
  }

  const toggleStep = (index: number) => {
    const newSteps = [...steps]
    const currentStep = newSteps[index]
    if (currentStep) {
      newSteps[index] = { ...currentStep, enabled: !currentStep.enabled }
      setSteps(newSteps)
    }
  }

  const setStepNote = (index: number, note: number) => {
    const newSteps = [...steps]
    const currentStep = newSteps[index]
    if (currentStep) {
      newSteps[index] = { ...currentStep, note }
      setSteps(newSteps)
    }
  }

  const clearPattern = () => {
    setSteps(steps.map((step) => ({ ...step, enabled: false })))
  }

  const randomizePattern = () => {
    setSteps(
      steps.map(() => ({
        enabled: Math.random() > 0.5,
        note: 48 + Math.floor(Math.random() * 25), // C3 to C5
      }))
    )
  }

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
          NOTE SEQUENCER
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
          <button
            onClick={handlePlayStop}
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
                setBpm(Number(e.target.value))
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
                setGateLength(Number(e.target.value))
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
            onClick={clearPattern}
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
            onClick={randomizePattern}
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
          const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

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
                  toggleStep(index)
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
                    setStepNote(index, Number(e.target.value))
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
