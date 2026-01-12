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

  const sequenceRef = useRef<number | null>(null)
  const activeNoteRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isEnabled) {
      if (isPlaying) {
        setIsPlaying(false)
        Tone.Transport.stop()
        if (activeNoteRef.current !== null) {
          onNoteOff(activeNoteRef.current)
          activeNoteRef.current = null
        }
      }
      return
    }

    Tone.Transport.bpm.value = bpm

    if (sequenceRef.current !== null) {
      Tone.Transport.clear(sequenceRef.current)
    }

    const sequence = new Tone.Sequence(
      (time, step: number) => {
        // Schedule UI update
        Tone.Draw.schedule(() => {
          setCurrentStep(step)
        }, time)

        const currentStepData = steps[step]
        if (currentStepData && currentStepData.enabled) {
          // Stop previous note
          if (activeNoteRef.current !== null) {
            onNoteOff(activeNoteRef.current)
          }

          // Play new note
          const note = currentStepData.note
          onNoteOn(note, 100)
          activeNoteRef.current = note

          // Schedule note off
          Tone.Transport.scheduleOnce(() => {
            if (activeNoteRef.current === note) {
              onNoteOff(note)
              activeNoteRef.current = null
            }
          }, time + 0.1) // Note duration
        }
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    )

    sequence.start(0)
    // Store reference to the sequence (Tone.js doesn't expose id directly)
    sequenceRef.current = 0

    return () => {
      if (sequenceRef.current !== null) {
        Tone.Transport.clear(sequenceRef.current)
        sequenceRef.current = null
      }
    }
  }, [steps, bpm, isEnabled, onNoteOn, onNoteOff])

  const handlePlayStop = () => {
    if (!isPlaying) {
      Tone.Transport.start()
      setIsPlaying(true)
    } else {
      Tone.Transport.stop()
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
