/**
 * Audio Store - Zustand
 * State global pour le moteur audio
 */

import { create } from 'zustand'
import { audioEngine } from '../audio/AudioEngine'
import { AlgorithmType, AudioEngineState } from '../audio/types'

interface AudioStore extends AudioEngineState {
  // Actions
  startAudio: () => Promise<void>
  stopAll: () => void
  setMuted: (muted: boolean) => void
  setMasterVolume: (volume: number) => void
  setAlgorithm: (algorithm: AlgorithmType) => void

  // MIDI
  noteOn: (note: number, velocity?: number) => void
  noteOff: (note: number) => void

  // Update state
  updateState: () => void
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial state
  isStarted: false,
  activeVoices: 0,
  maxVoices: 8,
  currentPreset: null,
  isMuted: false,

  // Actions
  startAudio: async () => {
    try {
      await audioEngine.start()
      get().updateState()
    } catch (error) {
      console.error('Failed to start audio:', error)
      throw error
    }
  },

  stopAll: () => {
    audioEngine.stopAll()
    // updateState will be called by auto-update interval
  },

  setMuted: (muted: boolean) => {
    audioEngine.setMuted(muted)
    set({ isMuted: muted })
  },

  setMasterVolume: (volume: number) => {
    audioEngine.setMasterVolume(volume)
    if (get().currentPreset) {
      set((state) => ({
        currentPreset: state.currentPreset
          ? { ...state.currentPreset, masterVolume: volume }
          : null,
      }))
    }
  },

  setAlgorithm: (algorithm: AlgorithmType) => {
    audioEngine.setAlgorithm(algorithm)
    // Force immediate state update to reflect algorithm change
    get().updateState()
  },

  noteOn: (note: number, velocity = 100) => {
    audioEngine.noteOn(note, velocity)
    // updateState will be called by auto-update interval
  },

  noteOff: (note: number) => {
    audioEngine.noteOff(note)
    // updateState will be called by auto-update interval
  },

  updateState: () => {
    const newState = audioEngine.getState()
    const currentState = get()

    // Only update if values have actually changed
    if (
      newState.isStarted !== currentState.isStarted ||
      newState.activeVoices !== currentState.activeVoices ||
      newState.isMuted !== currentState.isMuted ||
      newState.currentPreset?.id !== currentState.currentPreset?.id ||
      newState.currentPreset?.algorithm !== currentState.currentPreset?.algorithm
    ) {
      set(newState)
    }
  },
}))

// Auto-update active voices every 100ms
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useAudioStore.getState()
    if (store.isStarted) {
      store.updateState()
    }
  }, 100)
}
