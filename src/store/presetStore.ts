/**
 * Preset Store - Zustand
 * Gestion des presets et sélection
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Preset,
  LFOParams,
  OperatorParams,
  FilterParams,
  MasterEffectsParams,
  SynthEngineParams,
} from '../audio/types'
import { factoryPresets, defaultPreset, defaultSynthEngine } from '../audio/presets/defaultPreset'
import { audioEngine } from '../audio/AudioEngine'

/**
 * Migration helper: Add synthEngine to old presets that don't have it
 */
function migratePreset(preset: any): Preset {
  if (!preset.synthEngine) {
    return {
      ...preset,
      synthEngine: defaultSynthEngine,
    }
  }
  return preset as Preset
}

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
  updateCurrentPresetLFO: (index: 0 | 1 | 2 | 3, params: Partial<LFOParams>) => void
  updateCurrentPresetOperator: (index: 0 | 1 | 2 | 3, params: Partial<OperatorParams>) => void
  updateCurrentPresetFilter: (params: Partial<FilterParams>) => void
  updateCurrentPresetMasterEffects: (params: Partial<MasterEffectsParams>) => void
  updateCurrentPresetSynthEngine: (params: Partial<SynthEngineParams>) => void

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

        // Migrate user presets (add synthEngine if missing)
        const migratedUserPresets = get().userPresets.map(migratePreset)

        // Load default preset on init
        const preset = defaultPreset
        audioEngine.loadPreset(preset)
        set({
          currentPresetId: preset.id,
          isInitialized: true,
          userPresets: migratedUserPresets
        })
      },

      updateCurrentPresetLFO: (index: 0 | 1 | 2 | 3, params: Partial<LFOParams>) => {
        const currentPreset = get().getCurrentPreset()
        if (!currentPreset) {
          console.warn('No current preset to update')
          return
        }

        // Update live without stopping notes
        audioEngine.updateLFOParams(index, params)

        // Create updated LFOs array
        const updatedLFOs = [...currentPreset.lfos] as [LFOParams, LFOParams, LFOParams, LFOParams]
        updatedLFOs[index] = { ...updatedLFOs[index]!, ...params }

        // Create updated preset
        const updatedPreset: Preset = {
          ...currentPreset,
          lfos: updatedLFOs,
        }

        // Update store (factory presets update won't persist, which is correct)
        const isFactoryPreset = get().presets.some((p) => p.id === currentPreset.id)
        if (isFactoryPreset) {
          // Update in presets array (temporary, won't persist)
          set((state) => ({
            presets: state.presets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        } else {
          // Update in userPresets array (will persist)
          set((state) => ({
            userPresets: state.userPresets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        }

        // Update AudioEngine reference so active voices use new preset values
        audioEngine.updateCurrentPresetReference(updatedPreset)
      },

      updateCurrentPresetOperator: (index: 0 | 1 | 2 | 3, params: Partial<OperatorParams>) => {
        const currentPreset = get().getCurrentPreset()
        if (!currentPreset) {
          console.warn('No current preset to update')
          return
        }

        // Update live without stopping notes
        audioEngine.updateOperatorParams(index, params)

        // Create updated operators array
        const updatedOperators = [...currentPreset.operators] as [
          OperatorParams,
          OperatorParams,
          OperatorParams,
          OperatorParams
        ]
        updatedOperators[index] = { ...updatedOperators[index]!, ...params }

        // Create updated preset
        const updatedPreset: Preset = {
          ...currentPreset,
          operators: updatedOperators,
        }

        // Update store
        const isFactoryPreset = get().presets.some((p) => p.id === currentPreset.id)
        if (isFactoryPreset) {
          set((state) => ({
            presets: state.presets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        } else {
          set((state) => ({
            userPresets: state.userPresets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        }

        // Update AudioEngine reference so active voices use new preset values
        audioEngine.updateCurrentPresetReference(updatedPreset)
      },

      updateCurrentPresetFilter: (params: Partial<FilterParams>) => {
        const currentPreset = get().getCurrentPreset()
        if (!currentPreset) {
          console.warn('No current preset to update')
          return
        }

        // Update live without stopping notes
        audioEngine.updateFilterParams(params)

        // Create updated preset
        const updatedPreset: Preset = {
          ...currentPreset,
          filter: { ...currentPreset.filter, ...params },
        }

        // Update store
        const isFactoryPreset = get().presets.some((p) => p.id === currentPreset.id)
        if (isFactoryPreset) {
          set((state) => ({
            presets: state.presets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        } else {
          set((state) => ({
            userPresets: state.userPresets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        }

        // Update AudioEngine reference so active voices use new preset values
        audioEngine.updateCurrentPresetReference(updatedPreset)
      },

      updateCurrentPresetMasterEffects: (params: Partial<MasterEffectsParams>) => {
        const currentPreset = get().getCurrentPreset()
        if (!currentPreset) {
          console.warn('No current preset to update')
          return
        }

        // Update live without stopping notes
        audioEngine.updateMasterEffectsParams(params)

        // Create updated preset
        const updatedPreset: Preset = {
          ...currentPreset,
          masterEffects: { ...currentPreset.masterEffects, ...params },
        }

        // Update store
        const isFactoryPreset = get().presets.some((p) => p.id === currentPreset.id)
        if (isFactoryPreset) {
          set((state) => ({
            presets: state.presets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        } else {
          set((state) => ({
            userPresets: state.userPresets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        }

        // Update AudioEngine reference so active voices use new preset values
        audioEngine.updateCurrentPresetReference(updatedPreset)
      },

      updateCurrentPresetSynthEngine: (params: Partial<SynthEngineParams>) => {
        const currentPreset = get().getCurrentPreset()
        if (!currentPreset) {
          console.warn('No current preset to update')
          return
        }

        // Update live without stopping notes
        audioEngine.updateSynthEngineParams(params)

        // Create updated preset
        const updatedPreset: Preset = {
          ...currentPreset,
          synthEngine: { ...currentPreset.synthEngine, ...params },
        }

        // Update store
        const isFactoryPreset = get().presets.some((p) => p.id === currentPreset.id)
        if (isFactoryPreset) {
          set((state) => ({
            presets: state.presets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        } else {
          set((state) => ({
            userPresets: state.userPresets.map((p) =>
              p.id === currentPreset.id ? updatedPreset : p
            ),
          }))
        }

        // Update AudioEngine reference so active voices use new preset values
        audioEngine.updateCurrentPresetReference(updatedPreset)
      },

      // Getters
      getCurrentPreset: () => {
        const presetId = get().currentPresetId
        if (!presetId) return null
        return get().getAllPresets().find((p) => p.id === presetId) ?? null
      },

      getAllPresets: () => {
        // Migrate all presets to ensure they have synthEngine
        return [...get().presets, ...get().userPresets].map(migratePreset)
      },
    }),
    {
      name: 'oscillosynth-presets',
      partialize: (state) => ({
        userPresets: state.userPresets,
        currentPresetId: state.currentPresetId,
      }),
      merge: (persistedState: any, currentState: PresetStore) => {
        // Migrate user presets when loading from localStorage
        const migratedUserPresets = (persistedState?.userPresets || []).map(migratePreset)
        return {
          ...currentState,
          ...persistedState,
          userPresets: migratedUserPresets,
        }
      },
    }
  )
)
