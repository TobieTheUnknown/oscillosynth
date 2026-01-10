/**
 * useAudioEngine Hook
 * Hook React pour interaction avec l'audio engine
 */

import { useEffect, useCallback, useMemo } from 'react'
import { useAudioStore } from '../store/audioStore'
import { usePresetStore } from '../store/presetStore'

export function useAudioEngine() {
  const audioStore = useAudioStore()
  const presetStore = usePresetStore()

  // Initialize on mount (only once)
  useEffect(() => {
    usePresetStore.getState().initPresets()
  }, [])

  // Keyboard MIDI mapping (computer keyboard → MIDI notes)
  const keyboardMap = useMemo(() => ({
    // Row 1: C3-B3
    a: 48, // C3
    w: 49, // C#3
    s: 50, // D3
    e: 51, // D#3
    d: 52, // E3
    f: 53, // F3
    t: 54, // F#3
    g: 55, // G3
    y: 56, // G#3
    h: 57, // A3
    u: 58, // A#3
    j: 59, // B3
    // Row 2: C4-B4
    k: 60, // C4
    o: 61, // C#4
    l: 62, // D4
    p: 63, // D#4
    ';': 64, // E4
    "'": 65, // F4
  }), [])

  // Keyboard event handlers
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.repeat || !audioStore.isStarted) return

      const key = event.key.toLowerCase()
      if (!(key in keyboardMap)) return

      const midiNote = keyboardMap[key as keyof typeof keyboardMap]
      audioStore.noteOn(midiNote, 100)
    },
    [audioStore, keyboardMap]
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!audioStore.isStarted) return

      const key = event.key.toLowerCase()
      if (!(key in keyboardMap)) return

      const midiNote = keyboardMap[key as keyof typeof keyboardMap]
      audioStore.noteOff(midiNote)
    },
    [audioStore, keyboardMap]
  )

  // Setup keyboard listeners
  useEffect(() => {
    if (audioStore.isStarted) {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
      }
    }
    return undefined
  }, [audioStore.isStarted, handleKeyDown, handleKeyUp])

  // Note: No cleanup needed - audio engine persists across component mounts
  // This allows the synth to keep playing even if the component unmounts/remounts

  return {
    // Audio state
    ...audioStore,

    // Preset state
    currentPreset: presetStore.getCurrentPreset(),
    allPresets: presetStore.getAllPresets(),

    // Preset actions
    loadPreset: presetStore.loadPreset,
    saveUserPreset: presetStore.saveUserPreset,
    deleteUserPreset: presetStore.deleteUserPreset,
    updateCurrentPresetLFO: presetStore.updateCurrentPresetLFO,
    updateCurrentPresetOperator: presetStore.updateCurrentPresetOperator,
    updateCurrentPresetFilter: presetStore.updateCurrentPresetFilter,
  }
}
