/**
 * Interactive Keyboard
 * Visual piano keyboard with computer keyboard mapping and touch support
 */

import { useState, useEffect } from 'react'

interface InteractiveKeyboardProps {
  onNoteOn: (midiNote: number, velocity: number) => void
  onNoteOff: (midiNote: number) => void
  isEnabled: boolean
}

interface Key {
  midiNote: number
  keyboardKey?: string
  isBlack: boolean
  label: string
}

// C3 to C5 (2 octaves)
const KEYS: Key[] = [
  // C3 octave
  { midiNote: 48, keyboardKey: 'a', isBlack: false, label: 'C3' },
  { midiNote: 49, keyboardKey: 'w', isBlack: true, label: 'C#' },
  { midiNote: 50, keyboardKey: 's', isBlack: false, label: 'D3' },
  { midiNote: 51, keyboardKey: 'e', isBlack: true, label: 'D#' },
  { midiNote: 52, keyboardKey: 'd', isBlack: false, label: 'E3' },
  { midiNote: 53, keyboardKey: 'f', isBlack: false, label: 'F3' },
  { midiNote: 54, keyboardKey: 't', isBlack: true, label: 'F#' },
  { midiNote: 55, keyboardKey: 'g', isBlack: false, label: 'G3' },
  { midiNote: 56, keyboardKey: 'y', isBlack: true, label: 'G#' },
  { midiNote: 57, keyboardKey: 'h', isBlack: false, label: 'A3' },
  { midiNote: 58, keyboardKey: 'u', isBlack: true, label: 'A#' },
  { midiNote: 59, keyboardKey: 'j', isBlack: false, label: 'B3' },
  // C4 octave
  { midiNote: 60, keyboardKey: 'k', isBlack: false, label: 'C4' },
  { midiNote: 61, keyboardKey: 'o', isBlack: true, label: 'C#' },
  { midiNote: 62, keyboardKey: 'l', isBlack: false, label: 'D4' },
  { midiNote: 63, keyboardKey: 'p', isBlack: true, label: 'D#' },
  { midiNote: 64, keyboardKey: ';', isBlack: false, label: 'E4' },
  { midiNote: 65, keyboardKey: "'", isBlack: false, label: 'F4' },
  { midiNote: 66, isBlack: true, label: 'F#' },
  { midiNote: 67, isBlack: false, label: 'G4' },
  { midiNote: 68, isBlack: true, label: 'G#' },
  { midiNote: 69, isBlack: false, label: 'A4' },
  { midiNote: 70, isBlack: true, label: 'A#' },
  { midiNote: 71, isBlack: false, label: 'B4' },
  // C5
  { midiNote: 72, isBlack: false, label: 'C5' },
]

export function InteractiveKeyboard({ onNoteOn, onNoteOff, isEnabled }: InteractiveKeyboardProps) {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      const key = event.key.toLowerCase()
      const keyData = KEYS.find((k) => k.keyboardKey === key)

      if (keyData && !activeNotes.has(keyData.midiNote)) {
        setActiveNotes(new Set(activeNotes).add(keyData.midiNote))
        setPressedKeys(new Set(pressedKeys).add(key))
        onNoteOn(keyData.midiNote, 100)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const keyData = KEYS.find((k) => k.keyboardKey === key)

      if (keyData) {
        const newActiveNotes = new Set(activeNotes)
        newActiveNotes.delete(keyData.midiNote)
        setActiveNotes(newActiveNotes)

        const newPressedKeys = new Set(pressedKeys)
        newPressedKeys.delete(key)
        setPressedKeys(newPressedKeys)

        onNoteOff(keyData.midiNote)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isEnabled, activeNotes, pressedKeys, onNoteOn, onNoteOff])

  const handleMouseDown = (midiNote: number) => {
    if (!isEnabled) return
    setActiveNotes(new Set(activeNotes).add(midiNote))
    onNoteOn(midiNote, 100)
  }

  const handleMouseUp = (midiNote: number) => {
    if (!isEnabled) return
    const newActiveNotes = new Set(activeNotes)
    newActiveNotes.delete(midiNote)
    setActiveNotes(newActiveNotes)
    onNoteOff(midiNote)
  }

  const whiteKeys = KEYS.filter((k) => !k.isBlack)
  const blackKeys = KEYS.filter((k) => k.isBlack)

  const whiteKeyWidth = 50
  const whiteKeyHeight = 180
  const blackKeyWidth = 30
  const blackKeyHeight = 110

  // Calculate black key positions relative to white keys
  const getBlackKeyPosition = (midiNote: number): number => {
    const whiteKeysBefore = KEYS.filter(
      (k) => !k.isBlack && k.midiNote < midiNote
    ).length
    const noteInOctave = midiNote % 12

    // Offset based on position in octave
    let offset = 0
    if (noteInOctave === 1) offset = -5 // C#
    else if (noteInOctave === 3) offset = -5 // D#
    else if (noteInOctave === 6) offset = -5 // F#
    else if (noteInOctave === 8) offset = -5 // G#
    else if (noteInOctave === 10) offset = -5 // A#

    return whiteKeysBefore * whiteKeyWidth + whiteKeyWidth - blackKeyWidth / 2 + offset
  }

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-3)',
          textAlign: 'center',
        }}
      >
        KEYBOARD
      </div>
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-family-mono)',
          marginBottom: 'var(--spacing-4)',
          textAlign: 'center',
        }}
      >
        {isEnabled
          ? 'Use computer keyboard (A-; keys) or click/tap to play'
          : 'Start audio engine to enable keyboard'}
      </div>

      <div
        style={{
          position: 'relative',
          width: whiteKeys.length * whiteKeyWidth,
          height: whiteKeyHeight,
          margin: '0 auto',
          opacity: isEnabled ? 1 : 0.5,
        }}
      >
        {/* White keys */}
        {whiteKeys.map((key, index) => (
          <div
            key={key.midiNote}
            onMouseDown={() => {
              handleMouseDown(key.midiNote)
            }}
            onMouseUp={() => {
              handleMouseUp(key.midiNote)
            }}
            onMouseLeave={() => {
              if (activeNotes.has(key.midiNote)) {
                handleMouseUp(key.midiNote)
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              handleMouseDown(key.midiNote)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleMouseUp(key.midiNote)
            }}
            style={{
              position: 'absolute',
              left: index * whiteKeyWidth,
              top: 0,
              width: whiteKeyWidth,
              height: whiteKeyHeight,
              backgroundColor: activeNotes.has(key.midiNote)
                ? 'var(--color-active)'
                : '#ffffff',
              border: '1px solid #333',
              borderRadius: '0 0 4px 4px',
              cursor: isEnabled ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: 'var(--spacing-2)',
              transition: 'background-color 0.05s',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: '#666',
                fontFamily: 'var(--font-family-mono)',
                marginBottom: 'var(--spacing-1)',
              }}
            >
              {key.label}
            </div>
            {key.keyboardKey && (
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: pressedKeys.has(key.keyboardKey) ? '#ff0000' : '#999',
                  fontFamily: 'var(--font-family-mono)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  border: '1px solid #ccc',
                  borderRadius: '2px',
                  padding: '2px 6px',
                  backgroundColor: pressedKeys.has(key.keyboardKey)
                    ? '#ffe0e0'
                    : '#f5f5f5',
                }}
              >
                {key.keyboardKey}
              </div>
            )}
          </div>
        ))}

        {/* Black keys */}
        {blackKeys.map((key) => (
          <div
            key={key.midiNote}
            onMouseDown={() => {
              handleMouseDown(key.midiNote)
            }}
            onMouseUp={() => {
              handleMouseUp(key.midiNote)
            }}
            onMouseLeave={() => {
              if (activeNotes.has(key.midiNote)) {
                handleMouseUp(key.midiNote)
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              handleMouseDown(key.midiNote)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleMouseUp(key.midiNote)
            }}
            style={{
              position: 'absolute',
              left: getBlackKeyPosition(key.midiNote),
              top: 0,
              width: blackKeyWidth,
              height: blackKeyHeight,
              backgroundColor: activeNotes.has(key.midiNote)
                ? 'var(--color-active)'
                : '#222',
              border: '1px solid #000',
              borderRadius: '0 0 2px 2px',
              cursor: isEnabled ? 'pointer' : 'default',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: 'var(--spacing-1)',
              transition: 'background-color 0.05s',
            }}
          >
            {key.keyboardKey && (
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: pressedKeys.has(key.keyboardKey) ? '#ff6666' : '#fff',
                  fontFamily: 'var(--font-family-mono)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  border: '1px solid #444',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  backgroundColor: pressedKeys.has(key.keyboardKey)
                    ? '#ffffff'
                    : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                {key.keyboardKey}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
