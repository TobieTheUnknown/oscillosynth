/**
 * Preset par défaut - Electric Piano
 * Base pour tester le FM engine
 */

import {
  Preset,
  AlgorithmType,
  WaveformType,
  LFOCombineMode,
  LFODestination,
  OperatorParams,
  LFOParams,
  FilterParams,
  MasterEffectsParams,
} from '../types'

/**
 * Opérateurs pour Electric Piano (EP)
 * Algorithm 2: (4→3→2)+(4→1)→OUT
 */
const defaultOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  // Operator 1: Carrier principal
  {
    ratio: 1.0,
    level: 80,
    attack: 0.001,
    decay: 0.5,
    sustain: 0.3,
    release: 0.8,
  },
  // Operator 2: Modulator harmonique
  {
    ratio: 2.0,
    level: 60,
    attack: 0.001,
    decay: 0.3,
    sustain: 0.2,
    release: 0.5,
  },
  // Operator 3: Modulator brillance
  {
    ratio: 3.0,
    level: 40,
    attack: 0.001,
    decay: 0.2,
    sustain: 0.1,
    release: 0.3,
  },
  // Operator 4: Modulator texture
  {
    ratio: 4.0,
    level: 30,
    attack: 0.001,
    decay: 0.15,
    sustain: 0.05,
    release: 0.2,
  },
]

/**
 * LFOs pour vibrato et mouvement (8 LFOs en 4 paires)
 */
type LFOArray = [
  LFOParams,
  LFOParams,
  LFOParams,
  LFOParams,
  LFOParams,
  LFOParams,
  LFOParams,
  LFOParams
]

const defaultLFOs: LFOArray = [
  // Paire 1: Pitch (LFO 1+2)
  {
    waveform: WaveformType.SINE,
    rate: 4.0,
    depth: 10,
    phase: 0,
    sync: false,
    destination: LFODestination.PITCH,
  },
  {
    waveform: WaveformType.SINE,
    rate: 6.0,
    depth: 5,
    phase: 90,
    sync: false,
    destination: LFODestination.PITCH,
  },

  // Paire 2: Amplitude (LFO 3+4)
  {
    waveform: WaveformType.TRIANGLE,
    rate: 0.5,
    depth: 15,
    phase: 0,
    sync: false,
    destination: LFODestination.AMPLITUDE,
  },
  {
    waveform: WaveformType.SAWTOOTH,
    rate: 0.2,
    depth: 3,
    phase: 0,
    sync: false,
    destination: LFODestination.AMPLITUDE,
  },

  // Paire 3: Filter Cutoff (LFO 5+6)
  {
    waveform: WaveformType.SINE,
    rate: 1.5,
    depth: 20,
    phase: 0,
    sync: false,
    destination: LFODestination.FILTER_CUTOFF,
  },
  {
    waveform: WaveformType.TRIANGLE,
    rate: 0.8,
    depth: 12,
    phase: 180,
    sync: false,
    destination: LFODestination.FILTER_CUTOFF,
  },

  // Paire 4: Operator 1 Level (LFO 7+8)
  {
    waveform: WaveformType.SINE,
    rate: 0.3,
    depth: 8,
    phase: 0,
    sync: false,
    destination: LFODestination.OP1_LEVEL,
  },
  {
    waveform: WaveformType.SQUARE,
    rate: 0.1,
    depth: 5,
    phase: 90,
    sync: false,
    destination: LFODestination.OP1_LEVEL,
  },
]

/**
 * Filtre par défaut
 */
const defaultFilter: FilterParams = {
  type: 'lowpass',
  cutoff: 2000,
  resonance: 2,
  envelope: 50,
}

/**
 * Effets master par défaut (tous off)
 */
const defaultMasterEffects: MasterEffectsParams = {
  reverbWet: 0,
  reverbDecay: 2.5,
  reverbPreDelay: 0.01,
  delayWet: 0,
  delayTime: 0.25,
  delayFeedback: 0.3,
  chorusWet: 0,
  chorusFrequency: 1.5,
  chorusDepth: 0.7,
  distortionWet: 0,
  distortionAmount: 0.4,
}

/**
 * Preset complet: Electric Piano
 */
export const defaultPreset: Preset = {
  id: 'default-ep',
  name: 'Electric Piano',
  algorithm: AlgorithmType.ALGO_2,
  operators: defaultOperators,
  lfos: defaultLFOs,
  lfoCombineMode: LFOCombineMode.ADD,
  filter: defaultFilter,
  masterEffects: defaultMasterEffects,
  masterVolume: 0.7,
}

/**
 * Preset Bass
 * Algorithm 1: Serial complet pour bass riche
 */
const bassOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  {
    ratio: 1.0,
    level: 90,
    attack: 0.001,
    decay: 0.3,
    sustain: 0.7,
    release: 0.4,
  },
  {
    ratio: 2.0,
    level: 70,
    attack: 0.001,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
  },
  {
    ratio: 1.5,
    level: 50,
    attack: 0.005,
    decay: 0.15,
    sustain: 0.3,
    release: 0.2,
  },
  {
    ratio: 0.5,
    level: 40,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.2,
    release: 0.15,
  },
]

const bassLFOs: LFOArray = [
  // Paire 1: Pitch
  {
    waveform: WaveformType.SINE,
    rate: 2.0,
    depth: 8,
    phase: 0,
    sync: false,
    destination: LFODestination.PITCH,
  },
  {
    waveform: WaveformType.SQUARE,
    rate: 4.0,
    depth: 5,
    phase: 0,
    sync: false,
    destination: LFODestination.PITCH,
  },

  // Paire 2: Amplitude
  {
    waveform: WaveformType.SAWTOOTH,
    rate: 0.3,
    depth: 12,
    phase: 0,
    sync: false,
    destination: LFODestination.AMPLITUDE,
  },
  {
    waveform: WaveformType.SINE,
    rate: 0.1,
    depth: 2,
    phase: 0,
    sync: false,
    destination: LFODestination.AMPLITUDE,
  },

  // Paire 3: Filter Cutoff
  {
    waveform: WaveformType.SQUARE,
    rate: 2.0,
    depth: 30,
    phase: 0,
    sync: false,
    destination: LFODestination.FILTER_CUTOFF,
  },
  {
    waveform: WaveformType.SAWTOOTH,
    rate: 1.5,
    depth: 25,
    phase: 90,
    sync: false,
    destination: LFODestination.FILTER_CUTOFF,
  },

  // Paire 4: Operator 2 Level
  {
    waveform: WaveformType.SINE,
    rate: 0.5,
    depth: 10,
    phase: 0,
    sync: false,
    destination: LFODestination.OP2_LEVEL,
  },
  {
    waveform: WaveformType.TRIANGLE,
    rate: 0.2,
    depth: 5,
    phase: 120,
    sync: false,
    destination: LFODestination.OP2_LEVEL,
  },
]

const bassFilter: FilterParams = {
  type: 'lowpass',
  cutoff: 1000,
  resonance: 4,
  envelope: 70,
}

export const bassPreset: Preset = {
  id: 'bass-1',
  name: 'FM Bass',
  algorithm: AlgorithmType.ALGO_1,
  operators: bassOperators,
  lfos: bassLFOs,
  lfoCombineMode: LFOCombineMode.ADD,
  filter: bassFilter,
  masterEffects: defaultMasterEffects,
  masterVolume: 0.8,
}

/**
 * Preset Pad
 * Algorithm 4: Parallel pour pad atmosphérique
 */
const padOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  {
    ratio: 1.0,
    level: 70,
    attack: 1.0,
    decay: 0.5,
    sustain: 0.8,
    release: 2.0,
  },
  {
    ratio: 1.5,
    level: 65,
    attack: 1.2,
    decay: 0.6,
    sustain: 0.75,
    release: 2.2,
  },
  {
    ratio: 2.0,
    level: 60,
    attack: 0.8,
    decay: 0.4,
    sustain: 0.7,
    release: 1.8,
  },
  {
    ratio: 3.0,
    level: 50,
    attack: 1.5,
    decay: 0.7,
    sustain: 0.65,
    release: 2.5,
  },
]

const padLFOs: LFOArray = [
  // Paire 1: Pitch
  {
    waveform: WaveformType.SINE,
    rate: 0.3,
    depth: 15,
    phase: 0,
    sync: false,
    destination: LFODestination.PITCH,
  },
  {
    waveform: WaveformType.SINE,
    rate: 0.5,
    depth: 12,
    phase: 120,
    sync: false,
    destination: LFODestination.PITCH,
  },

  // Paire 2: Amplitude
  {
    waveform: WaveformType.TRIANGLE,
    rate: 0.2,
    depth: 20,
    phase: 240,
    sync: false,
    destination: LFODestination.AMPLITUDE,
  },
  {
    waveform: WaveformType.SAWTOOTH,
    rate: 0.1,
    depth: 8,
    phase: 0,
    sync: false,
    destination: LFODestination.AMPLITUDE,
  },

  // Paire 3: Filter Cutoff
  {
    waveform: WaveformType.SINE,
    rate: 0.4,
    depth: 35,
    phase: 0,
    sync: false,
    destination: LFODestination.FILTER_CUTOFF,
  },
  {
    waveform: WaveformType.TRIANGLE,
    rate: 0.6,
    depth: 28,
    phase: 180,
    sync: false,
    destination: LFODestination.FILTER_CUTOFF,
  },

  // Paire 4: Filter Resonance
  {
    waveform: WaveformType.SINE,
    rate: 0.15,
    depth: 15,
    phase: 0,
    sync: false,
    destination: LFODestination.FILTER_RESONANCE,
  },
  {
    waveform: WaveformType.SINE,
    rate: 0.25,
    depth: 10,
    phase: 90,
    sync: false,
    destination: LFODestination.FILTER_RESONANCE,
  },
]

const padFilter: FilterParams = {
  type: 'lowpass',
  cutoff: 3000,
  resonance: 6,
  envelope: 40,
}

export const padPreset: Preset = {
  id: 'pad-1',
  name: 'Atmosphere Pad',
  algorithm: AlgorithmType.ALGO_4,
  operators: padOperators,
  lfos: padLFOs,
  lfoCombineMode: LFOCombineMode.MULTIPLY,
  filter: padFilter,
  masterEffects: defaultMasterEffects,
  masterVolume: 0.6,
}

/**
 * Export all presets
 */
export const factoryPresets: Preset[] = [defaultPreset, bassPreset, padPreset]
