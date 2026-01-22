/**
 * Ambient Presets - Clean new presets for pads/ambient/evolving sounds
 * Uses only UI-visible parameters
 */

import {
  Preset,
  AlgorithmType,
  WaveformType,
  LFODestination,
  OperatorParams,
  LFOParams,
  MasterEffectsParams,
  SynthEngineParams,
} from '../types'

import { defaultSynthEngine } from './defaultPreset'

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

const defaultSynthEngine: SynthEngineParams = {
  detune: 0,
  fmIndex: 100,
  feedback: 0,
  subOscLevel: 0,
  stereoSpread: 0,
  brightness: 0,
}

/**
 * COSMIC PAD - Vast evolving soundscape
 */
const cosmicPadOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 75, attack: 2.0, decay: 1.0, sustain: 0.85, release: 4.0 },
  { ratio: 1.5, level: 60, attack: 2.2, decay: 1.2, sustain: 0.8, release: 4.5 },
  { ratio: 2.0, level: 45, attack: 2.5, decay: 1.5, sustain: 0.75, release: 5.0 },
  { ratio: 3.0, level: 30, attack: 2.8, decay: 1.8, sustain: 0.7, release: 5.5 },
]

const cosmicPadLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.1, depth: 5, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.TRIANGLE, rate: 0.2, depth: 15, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.08, depth: 10, phase: 0, sync: false, destination: LFODestination.OP1_LEVEL },
  { waveform: WaveformType.SINE, rate: 0.06, depth: 6, phase: 60, sync: false, destination: LFODestination.FX_REVERB_WET },
]

export const cosmicPadPreset: Preset = {
  id: 'ambient-cosmic-pad',
  name: '🌌 Cosmic Pad',
  algorithm: AlgorithmType.PARALLEL,
  operators: cosmicPadOperators,
  lfos: cosmicPadLFOs,
  filter: { type: 'lowpass', cutoff: 2000, resonance: 2.5 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.6,
    reverbDecay: 5.0,
    chorusWet: 0.3,
  },
  synthEngine: defaultSynthEngine,
  masterVolume: 0.6,
}

/**
 * DEEP OCEAN - Dark underwater drone
 */
const deepOceanOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 0.5, level: 80, attack: 3.0, decay: 1.5, sustain: 0.9, release: 6.0 },
  { ratio: 1.0, level: 70, attack: 3.2, decay: 1.8, sustain: 0.88, release: 6.5 },
  { ratio: 1.5, level: 55, attack: 3.5, decay: 2.0, sustain: 0.85, release: 7.0 },
  { ratio: 2.0, level: 40, attack: 4.0, decay: 2.5, sustain: 0.82, release: 7.5, feedback: 0.15 },
]

const deepOceanLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.05, depth: 3, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.SINE, rate: 0.12, depth: 20, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.04, depth: 12, phase: 0, sync: false, destination: LFODestination.OP1_LEVEL },
  { waveform: WaveformType.TRIANGLE, rate: 0.03, depth: 8, phase: 0, sync: false, destination: LFODestination.FX_REVERB_WET },
]

export const deepOceanPreset: Preset = {
  id: 'ambient-deep-ocean',
  name: '🌊 Deep Ocean',
  algorithm: AlgorithmType.SERIAL,
  operators: deepOceanOperators,
  lfos: deepOceanLFOs,
  filter: { type: 'lowpass', cutoff: 800, resonance: 3.5 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.75,
    reverbDecay: 8.0,
    delayWet: 0.2,
    delayTime: 0.5,
  },
  synthEngine: defaultSynthEngine,
  masterVolume: 0.65,
}

/**
 * SHIMMER - Bright ethereal pad
 */
const shimmerOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 70, attack: 1.5, decay: 0.8, sustain: 0.8, release: 3.0 },
  { ratio: 2.0, level: 60, attack: 1.8, decay: 1.0, sustain: 0.75, release: 3.5 },
  { ratio: 3.0, level: 50, attack: 2.0, decay: 1.2, sustain: 0.7, release: 4.0 },
  { ratio: 5.0, level: 35, attack: 2.5, decay: 1.5, sustain: 0.65, release: 4.5 },
]

const shimmerLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.15, depth: 8, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.TRIANGLE, rate: 0.25, depth: 25, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.12, depth: 15, phase: 0, sync: false, destination: LFODestination.OP3_LEVEL },
  { waveform: WaveformType.SINE, rate: 0.08, depth: 10, phase: 0, sync: false, destination: LFODestination.FX_CHORUS_WET },
]

export const shimmerPreset: Preset = {
  id: 'ambient-shimmer',
  name: '✨ Shimmer',
  algorithm: AlgorithmType.PARALLEL,
  operators: shimmerOperators,
  lfos: shimmerLFOs,
  filter: { type: 'lowpass', cutoff: 3500, resonance: 2.8 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.5,
    reverbDecay: 4.0,
    chorusWet: 0.4,
    chorusFrequency: 2.0,
  },
  synthEngine: defaultSynthEngine,
  masterVolume: 0.7,
}

/**
 * EVOLVING DRONE - Slowly morphing texture
 */
const evolvingDroneOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 75, attack: 4.0, decay: 2.0, sustain: 0.9, release: 8.0 },
  { ratio: 1.01, level: 70, attack: 4.5, decay: 2.5, sustain: 0.88, release: 8.5 },
  { ratio: 2.02, level: 50, attack: 5.0, decay: 3.0, sustain: 0.85, release: 9.0 },
  { ratio: 3.01, level: 35, attack: 5.5, decay: 3.5, sustain: 0.8, release: 9.5, feedback: 0.2 },
]

const evolvingDroneLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.03, depth: 4, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.SINE, rate: 0.08, depth: 30, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.04, depth: 18, phase: 0, sync: false, destination: LFODestination.OP2_RATIO },
  { waveform: WaveformType.TRIANGLE, rate: 0.02, depth: 12, phase: 0, sync: false, destination: LFODestination.FX_DELAY_TIME },
]

export const evolvingDronePreset: Preset = {
  id: 'ambient-evolving-drone',
  name: '🔮 Evolving Drone',
  algorithm: AlgorithmType.FAN_OUT,
  operators: evolvingDroneOperators,
  lfos: evolvingDroneLFOs,
  filter: { type: 'lowpass', cutoff: 1200, resonance: 4.0 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.7,
    reverbDecay: 6.0,
    delayWet: 0.3,
    delayTime: 0.375,
    delayFeedback: 0.5,
  },
  synthEngine: defaultSynthEngine,
  masterVolume: 0.6,
}

/**
 * Export all ambient presets
 */
export const ambientPresets: Preset[] = [
  cosmicPadPreset,
  deepOceanPreset,
  shimmerPreset,
  evolvingDronePreset,
]
