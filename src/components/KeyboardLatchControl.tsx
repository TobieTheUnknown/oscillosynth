/**
 * Keyboard Latch Control
 * Physical keyboard input with latch mode toggle (no visual keyboard)
 */

import { useEffect, useRef, useCallback } from 'react'

interface KeyboardLatchControlProps {
  onNoteOn: (midiNote: number, velocity: number) => void
  onNoteOff: (midiNote: number) => void
  isEnabled: boolean
  latchMode: boolean
  setLatchMode: (mode: boolean) => void
  activeNotes: Set<number>
  setActiveNotes: (notes: Set<number>) => void
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

export function KeyboardLatchControl({
  onNoteOn,
  onNoteOff,
  isEnabled,
  latchMode,
  setLatchMode,
  activeNotes,
  setActiveNotes,
}: KeyboardLatchControlProps) {
  const lastKeyPressTimeRef = useRef<number>(0)

  // Use refs to always get the latest values without causing re-renders
  const isEnabledRef = useRef(isEnabled)
  const latchModeRef = useRef(latchMode)
  const activeNotesRef = useRef(activeNotes)
  const onNoteOnRef = useRef(onNoteOn)
  const onNoteOffRef = useRef(onNoteOff)
  const setActiveNotesRef = useRef(setActiveNotes)

  // Keep refs in sync with props
  useEffect(() => {
    isEnabledRef.current = isEnabled
    latchModeRef.current = latchMode
    activeNotesRef.current = activeNotes
    onNoteOnRef.current = onNoteOn
    onNoteOffRef.current = onNoteOff
    setActiveNotesRef.current = setActiveNotes
  }, [isEnabled, latchMode, activeNotes, onNoteOn, onNoteOff, setActiveNotes])

  // Handle physical keyboard input
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabledRef.current) return
      if (event.repeat) return

      const key = event.key.toLowerCase()
      const keyData = KEYS.find((k) => k.keyboardKey === key)

      if (!keyData) return

      const currentActiveNotes = activeNotesRef.current
      const currentLatchMode = latchModeRef.current

      const CHORD_WINDOW_MS = 100
      const now = Date.now()
      const timeSinceLastPress = now - lastKeyPressTimeRef.current

      if (currentLatchMode) {
        // Check if note is already active (toggle behavior)
        if (currentActiveNotes.has(keyData.midiNote)) {
          // Toggle OFF: release this note
          const newActiveNotes = new Set(currentActiveNotes)
          newActiveNotes.delete(keyData.midiNote)
          setActiveNotesRef.current(newActiveNotes)
          onNoteOffRef.current(keyData.midiNote)
        } else if (timeSinceLastPress > CHORD_WINDOW_MS && currentActiveNotes.size > 0) {
          // New note after chord window: release all previous notes and activate this one
          currentActiveNotes.forEach((note) => {
            onNoteOffRef.current(note)
          })
          setActiveNotesRef.current(new Set([keyData.midiNote]))
          onNoteOnRef.current(keyData.midiNote, 100)
          lastKeyPressTimeRef.current = now
        } else {
          // New note within chord window: add to active notes
          const newActiveNotes = new Set(currentActiveNotes).add(keyData.midiNote)
          setActiveNotesRef.current(newActiveNotes)
          onNoteOnRef.current(keyData.midiNote, 100)
          lastKeyPressTimeRef.current = now
        }
      } else {
        // Normal mode: only activate if not already active
        if (!currentActiveNotes.has(keyData.midiNote)) {
          const newActiveNotes = new Set(currentActiveNotes).add(keyData.midiNote)
          setActiveNotesRef.current(newActiveNotes)
          onNoteOnRef.current(keyData.midiNote, 100)
        }
      }
    },
    [] // Empty dependencies - use refs instead
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const currentLatchMode = latchModeRef.current
      const currentIsEnabled = isEnabledRef.current
      const currentActiveNotes = activeNotesRef.current

      if (!currentIsEnabled) return
      // In latch mode, don't release notes on key up
      if (currentLatchMode) return

      const key = event.key.toLowerCase()
      const keyData = KEYS.find((k) => k.keyboardKey === key)

      if (keyData && currentActiveNotes.has(keyData.midiNote)) {
        const newActiveNotes = new Set(currentActiveNotes)
        newActiveNotes.delete(keyData.midiNote)
        setActiveNotesRef.current(newActiveNotes)
        onNoteOffRef.current(keyData.midiNote)
      }
    },
    [] // Empty dependencies - use refs instead
  )

  // Setup and cleanup event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const handleClearAll = () => {
    // Release all active notes
    activeNotesRef.current.forEach((note) => {
      onNoteOffRef.current(note)
    })
    setActiveNotesRef.current(new Set())
  }

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
          background: latchMode
            ? 'linear-gradient(90deg, var(--color-active) 0%, #00FFFF 100%)'
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
          KEYBOARD_INPUT
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
              backgroundColor: isEnabled ? 'var(--color-active)' : 'var(--color-text-secondary)',
              boxShadow: isEnabled ? '0 0 8px var(--color-active)' : 'none',
              animation: isEnabled ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          />
          {activeNotes.size > 0 ? `${activeNotes.size} NOTE${activeNotes.size > 1 ? 'S' : ''}` : 'READY'}
        </div>
      </div>

      {/* Main controls */}
      <div style={{ padding: 'var(--spacing-4)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-4)',
          }}
        >
          {/* Latch Mode Toggle */}
          <button
            onClick={() => setLatchMode(!latchMode)}
            disabled={!isEnabled}
            style={{
              padding: 'var(--spacing-3)',
              backgroundColor: latchMode ? 'var(--color-active)' : 'var(--color-bg-primary)',
              color: latchMode ? '#000' : 'var(--color-text-primary)',
              border: `1px solid ${latchMode ? 'var(--color-active)' : 'var(--color-border-primary)'}`,
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-md)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: isEnabled ? 'pointer' : 'not-allowed',
              opacity: isEnabled ? 1 : 0.5,
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: latchMode ? '0 0 16px rgba(78, 205, 196, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)' : 'none',
            }}
          >
            {latchMode ? '⬢ LATCH' : '○ LATCH'}
          </button>

          {/* Clear button */}
          <button
            onClick={handleClearAll}
            disabled={!isEnabled || activeNotes.size === 0}
            style={{
              padding: 'var(--spacing-3)',
              minWidth: '100px',
              backgroundColor: activeNotes.size > 0 ? 'rgba(255, 100, 100, 0.1)' : 'var(--color-bg-primary)',
              color: activeNotes.size > 0 ? '#FF6464' : 'var(--color-text-secondary)',
              border: `1px solid ${activeNotes.size > 0 ? 'rgba(255, 100, 100, 0.5)' : 'var(--color-border-secondary)'}`,
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: isEnabled && activeNotes.size > 0 ? 'pointer' : 'not-allowed',
              opacity: isEnabled && activeNotes.size > 0 ? 1 : 0.4,
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: activeNotes.size > 0 ? '0 0 12px rgba(255, 100, 100, 0.2)' : 'none',
            }}
          >
            ⊗ CLEAR
          </button>
        </div>

        {/* Keyboard layout display */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Key Mapping
          </div>
          <div
            style={{
              display: 'grid',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              lineHeight: '1.8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <span
                style={{
                  color: 'var(--color-trace-primary)',
                  fontWeight: 'bold',
                  minWidth: '80px',
                  textShadow: '0 0 8px currentColor',
                }}
              >
                C3-B3:
              </span>
              <span style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                A W S E D F T G Y H U J
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <span
                style={{
                  color: 'var(--color-trace-primary)',
                  fontWeight: 'bold',
                  minWidth: '80px',
                  textShadow: '0 0 8px currentColor',
                }}
              >
                C4-F4:
              </span>
              <span style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                K O L P ; '
              </span>
            </div>
          </div>

          {latchMode && (
            <div
              style={{
                marginTop: 'var(--spacing-3)',
                padding: 'var(--spacing-2)',
                backgroundColor: 'rgba(78, 205, 196, 0.05)',
                border: '1px solid rgba(78, 205, 196, 0.3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-active)',
                fontFamily: 'var(--font-family-mono)',
                textAlign: 'center',
                letterSpacing: '0.05em',
                textShadow: '0 0 8px currentColor',
              }}
            >
              ▸ PRESS KEY TO TOGGLE • CLEAR TO RESET
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
