/**
 * Keyboard Latch Control
 * Physical keyboard input with latch mode toggle (no visual keyboard)
 */

import { useState, useEffect } from 'react'

interface KeyboardLatchControlProps {
  onNoteOn: (midiNote: number, velocity: number) => void
  onNoteOff: (midiNote: number) => void
  isEnabled: boolean
}

interface Key {
  midiNote: number
  keyboardKey: string
  label: string
}

// C3 to C5 (2 octaves) - Physical keyboard mapping
const KEYS: Key[] = [
  // C3 octave
  { midiNote: 48, keyboardKey: 'a', label: 'C3' },
  { midiNote: 49, keyboardKey: 'w', label: 'C#3' },
  { midiNote: 50, keyboardKey: 's', label: 'D3' },
  { midiNote: 51, keyboardKey: 'e', label: 'D#3' },
  { midiNote: 52, keyboardKey: 'd', label: 'E3' },
  { midiNote: 53, keyboardKey: 'f', label: 'F3' },
  { midiNote: 54, keyboardKey: 't', label: 'F#3' },
  { midiNote: 55, keyboardKey: 'g', label: 'G3' },
  { midiNote: 56, keyboardKey: 'y', label: 'G#3' },
  { midiNote: 57, keyboardKey: 'h', label: 'A3' },
  { midiNote: 58, keyboardKey: 'u', label: 'A#3' },
  { midiNote: 59, keyboardKey: 'j', label: 'B3' },
  // C4 octave
  { midiNote: 60, keyboardKey: 'k', label: 'C4' },
  { midiNote: 61, keyboardKey: 'o', label: 'C#4' },
  { midiNote: 62, keyboardKey: 'l', label: 'D4' },
  { midiNote: 63, keyboardKey: 'p', label: 'D#4' },
  { midiNote: 64, keyboardKey: ';', label: 'E4' },
  { midiNote: 65, keyboardKey: "'", label: 'F4' },
]

export function KeyboardLatchControl({ onNoteOn, onNoteOff, isEnabled }: KeyboardLatchControlProps) {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())
  const [latchMode, setLatchMode] = useState(false)

  // Handle physical keyboard input
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      const key = event.key.toLowerCase()
      const keyData = KEYS.find((k) => k.keyboardKey === key)

      if (keyData && !activeNotes.has(keyData.midiNote)) {
        const newActiveNotes = new Set(activeNotes).add(keyData.midiNote)
        setActiveNotes(newActiveNotes)
        onNoteOn(keyData.midiNote, 100)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      // In latch mode, don't release notes on key up
      if (latchMode) return

      const key = event.key.toLowerCase()
      const keyData = KEYS.find((k) => k.keyboardKey === key)

      if (keyData && activeNotes.has(keyData.midiNote)) {
        const newActiveNotes = new Set(activeNotes)
        newActiveNotes.delete(keyData.midiNote)
        setActiveNotes(newActiveNotes)
        onNoteOff(keyData.midiNote)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isEnabled, activeNotes, latchMode, onNoteOn, onNoteOff])

  const handleClearAll = () => {
    // Release all active notes
    activeNotes.forEach((note) => {
      onNoteOff(note)
    })
    setActiveNotes(new Set())
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
      <div
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        KEYBOARD CONTROL
      </div>

      {/* Latch Mode Toggle */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-3)',
          alignItems: 'center',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        <button
          onClick={() => setLatchMode(!latchMode)}
          style={{
            flex: 1,
            padding: 'var(--spacing-3)',
            backgroundColor: latchMode ? 'var(--color-active)' : 'var(--color-bg-primary)',
            color: latchMode ? '#000' : 'var(--color-text-primary)',
            border: `2px solid ${latchMode ? 'var(--color-active)' : 'var(--color-border-primary)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-md)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: isEnabled ? 'pointer' : 'not-allowed',
            opacity: isEnabled ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
          disabled={!isEnabled}
        >
          {latchMode ? '🔒 LATCH ON' : '🔓 LATCH OFF'}
        </button>

        <button
          onClick={handleClearAll}
          disabled={!isEnabled || activeNotes.size === 0}
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            color: activeNotes.size > 0 ? '#FF6464' : 'var(--color-text-secondary)',
            border: '2px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: isEnabled && activeNotes.size > 0 ? 'pointer' : 'not-allowed',
            opacity: isEnabled && activeNotes.size > 0 ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
        >
          🛑 CLEAR ({activeNotes.size})
        </button>
      </div>

      {/* Keyboard mapping info */}
      <div
        style={{
          padding: 'var(--spacing-3)',
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-secondary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          Physical Keyboard Layout:
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-mono)',
            lineHeight: '1.6',
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-1)' }}>
            <span style={{ color: 'var(--color-trace-primary)' }}>C3 Octave:</span> A W S E D F T G Y H U J
          </div>
          <div>
            <span style={{ color: 'var(--color-trace-primary)' }}>C4 Octave:</span> K O L P ; '
          </div>
        </div>

        {latchMode && (
          <div
            style={{
              marginTop: 'var(--spacing-2)',
              padding: 'var(--spacing-2)',
              backgroundColor: 'rgba(0, 255, 65, 0.1)',
              border: '1px solid rgba(0, 255, 65, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-success)',
              fontFamily: 'var(--font-family-mono)',
              fontStyle: 'italic',
            }}
          >
            ℹ️ Latch mode: Notes stay on until you press the key again or click CLEAR
          </div>
        )}
      </div>
    </div>
  )
}
