/**
 * Preset Store - Zustand
 * Gestion des presets et sélection
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Preset } from '../audio/types'
import { factoryPresets, defaultPreset } from '../audio/presets/defaultPreset'
import { audioEngine } from '../audio/AudioEngine'

interface PresetStore {
  // State
  currentPresetId: string | null
  presets: Preset[]
  userPresets: Preset[]
  isInitialized: boolean

  // Actions
  loadPreset: (presetId: string) => void
  saveUserPreset: (preset: Preset) => void
  deleteUserPreset: (presetId: string) => void
  initPresets: () => void

  // Getters
  getCurrentPreset: () => Preset | null
  getAllPresets: () => Preset[]
}

export const usePresetStore = create<PresetStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPresetId: null,
      presets: factoryPresets,
      userPresets: [],
      isInitialized: false,

      // Actions
      loadPreset: (presetId: string) => {
        const preset = get().getAllPresets().find((p) => p.id === presetId)
        if (preset) {
          audioEngine.loadPreset(preset)
          set({ currentPresetId: presetId })
        } else {
          console.warn(`Preset ${presetId} not found`)
        }
      },

      saveUserPreset: (preset: Preset) => {
        set((state) => {
          // Check if preset already exists
          const existingIndex = state.userPresets.findIndex((p) => p.id === preset.id)

          if (existingIndex >= 0) {
            // Update existing
            const newUserPresets = [...state.userPresets]
            newUserPresets[existingIndex] = preset
            return { userPresets: newUserPresets }
          } else {
            // Add new
            return { userPresets: [...state.userPresets, preset] }
          }
        })
      },

      deleteUserPreset: (presetId: string) => {
        set((state) => ({
          userPresets: state.userPresets.filter((p) => p.id !== presetId),
          currentPresetId:
            state.currentPresetId === presetId ? null : state.currentPresetId,
        }))
      },

      initPresets: () => {
        // Only initialize once
        if (get().isInitialized) {
          return
        }

        // Load default preset on init
        const preset = defaultPreset
        audioEngine.loadPreset(preset)
        set({ currentPresetId: preset.id, isInitialized: true })
      },

      // Getters
      getCurrentPreset: () => {
        const presetId = get().currentPresetId
        if (!presetId) return null
        return get().getAllPresets().find((p) => p.id === presetId) ?? null
      },

      getAllPresets: () => {
        return [...get().presets, ...get().userPresets]
      },
    }),
    {
      name: 'oscillosynth-presets',
      partialize: (state) => ({
        userPresets: state.userPresets,
        currentPresetId: state.currentPresetId,
      }),
    }
  )
)
