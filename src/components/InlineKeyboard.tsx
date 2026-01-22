/**
 * Inline Keyboard
 * Ultra-compact keyboard controller (no visual keyboard, just text mapping)
 */

import { useEffect, useRef, useCallback } from 'react'

interface InlineKeyboardProps {
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

// C3 to F4 - Physical keyboard mapping
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

export function InlineKeyboard({
  onNoteOn,
  onNoteOff,
  isEnabled,
  latchMode,
  setLatchMode,
  activeNotes,
  setActiveNotes,
}: InlineKeyboardProps) {
  const lastKeyPressTimeRef = useRef<number>(0)
  const isEnabledRef = useRef(isEnabled)
  const latchModeRef = useRef(latchMode)
  const activeNotesRef = useRef(activeNotes)
  const onNoteOnRef = useRef(onNoteOn)
  const onNoteOffRef = useRef(onNoteOff)
  const setActiveNotesRef = useRef(setActiveNotes)

  // Keep refs in sync
  useEffect(() => {
    isEnabledRef.current = isEnabled
    latchModeRef.current = latchMode
    activeNotesRef.current = activeNotes
    onNoteOnRef.current = onNoteOn
    onNoteOffRef.current = onNoteOff
    setActiveNotesRef.current = setActiveNotes
  }, [isEnabled, latchMode, activeNotes, onNoteOn, onNoteOff, setActiveNotes])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabledRef.current) return
    if (event.repeat) return

    // Ignore keyboard events if an input/textarea is being edited
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const key = event.key.toLowerCase()
    const keyData = KEYS.find((k) => k.keyboardKey === key)
    if (!keyData) return

    const currentLatchMode = latchModeRef.current
    const CHORD_WINDOW_MS = 100
    const now = Date.now()
    const timeSinceLastPress = now - lastKeyPressTimeRef.current

    if (currentLatchMode) {
      // Toggle behavior in latch mode
      // IMPORTANT: Always read from ref directly to avoid race conditions
      if (activeNotesRef.current.has(keyData.midiNote)) {
        // Toggle OFF - always toggle off if note is already active, regardless of timing
        const newActiveNotes = new Set(activeNotesRef.current)
        newActiveNotes.delete(keyData.midiNote)
        activeNotesRef.current = newActiveNotes // Update ref FIRST
        setActiveNotesRef.current(newActiveNotes)
        onNoteOffRef.current(keyData.midiNote)
      } else if (timeSinceLastPress > CHORD_WINDOW_MS && activeNotesRef.current.size > 0) {
        // New note after chord window: release all previous notes and play new one
        activeNotesRef.current.forEach((note) => {
          onNoteOffRef.current(note)
        })
        const newActiveNotes = new Set([keyData.midiNote])
        activeNotesRef.current = newActiveNotes // Update ref FIRST
        setActiveNotesRef.current(newActiveNotes)
        onNoteOnRef.current(keyData.midiNote, 100)
        lastKeyPressTimeRef.current = now
      } else {
        // New note within chord window: add to active notes
        const newActiveNotes = new Set(activeNotesRef.current).add(keyData.midiNote)
        activeNotesRef.current = newActiveNotes // Update ref FIRST
        setActiveNotesRef.current(newActiveNotes)
        onNoteOnRef.current(keyData.midiNote, 100)
        lastKeyPressTimeRef.current = now
      }
    } else {
      // Normal mode: only activate if not already active
      if (!activeNotesRef.current.has(keyData.midiNote)) {
        const newActiveNotes = new Set(activeNotesRef.current).add(keyData.midiNote)
        activeNotesRef.current = newActiveNotes // Update ref FIRST
        setActiveNotesRef.current(newActiveNotes)
        onNoteOnRef.current(keyData.midiNote, 100)
      }
    }
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const currentLatchMode = latchModeRef.current
    const currentIsEnabled = isEnabledRef.current
    const currentActiveNotes = activeNotesRef.current

    if (!currentIsEnabled) return
    if (currentLatchMode) return // Don't release in latch mode

    // Ignore keyboard events if an input/textarea is being edited
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const key = event.key.toLowerCase()
    const keyData = KEYS.find((k) => k.keyboardKey === key)

    if (keyData && currentActiveNotes.has(keyData.midiNote)) {
      const newActiveNotes = new Set(currentActiveNotes)
      newActiveNotes.delete(keyData.midiNote)
      setActiveNotesRef.current(newActiveNotes)
      onNoteOffRef.current(keyData.midiNote)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const handleClearAll = () => {
    activeNotesRef.current.forEach((note) => {
      onNoteOffRef.current(note)
    })
    setActiveNotesRef.current(new Set())
  }

  return (
    <div
      style={{
        padding: 'var(--spacing-2)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #4ECDC4',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
        justifyContent: 'center',
      }}
    >
      {/* Keyboard mapping text */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-family-mono)',
          letterSpacing: '0.1em',
        }}
      >
        A W S E D F T G Y H U J K O L P ; '
      </div>

      {/* Latch toggle */}
      <button
        onClick={(e) => {
          setLatchMode(!latchMode)
          e.currentTarget.blur() // Remove focus immediately so keyboard still works
        }}
        disabled={!isEnabled}
        style={{
          padding: 'var(--spacing-1) var(--spacing-2)',
          backgroundColor: latchMode ? '#4ECDC4' : 'rgba(0, 0, 0, 0.5)',
          color: latchMode ? '#000' : '#4ECDC4',
          border: `1px solid #4ECDC4`,
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          cursor: isEnabled ? 'pointer' : 'not-allowed',
          opacity: isEnabled ? 1 : 0.5,
          textTransform: 'uppercase',
        }}
      >
        {latchMode ? '⬢' : '○'} LATCH
      </button>

      {/* Clear button */}
      <button
        onClick={(e) => {
          handleClearAll()
          e.currentTarget.blur() // Remove focus immediately so keyboard still works
        }}
        disabled={!isEnabled || activeNotes.size === 0}
        style={{
          padding: 'var(--spacing-1) var(--spacing-2)',
          backgroundColor: activeNotes.size > 0 ? 'rgba(255, 100, 100, 0.2)' : 'rgba(0, 0, 0, 0.5)',
          color: activeNotes.size > 0 ? '#FF6464' : 'var(--color-text-tertiary)',
          border: `1px solid ${activeNotes.size > 0 ? '#FF6464' : 'var(--color-border-secondary)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          cursor: isEnabled && activeNotes.size > 0 ? 'pointer' : 'not-allowed',
          opacity: isEnabled && activeNotes.size > 0 ? 1 : 0.4,
          textTransform: 'uppercase',
        }}
      >
        ⊗ CLEAR {activeNotes.size > 0 ? `(${activeNotes.size})` : ''}
      </button>
    </div>
  )
}
