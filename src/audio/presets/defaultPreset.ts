/**
 * Default Presets - Clean factory presets
 */

import {
  Preset,
  AlgorithmType,
  WaveformType,
  LFODestination,
  OperatorParams,
  LFOParams,
  FilterParams,
  MasterEffectsParams,
  SynthEngineParams,
} from '../types'

import { ambientPresets } from './ambientPresets'
import { creativePresets } from './creativePresets'

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

export const defaultSynthEngine: SynthEngineParams = {
  detune: 0, // No detune by default
  fmIndex: 100, // 100% FM depth (neutral)
  feedback: 0, // No additional feedback
  subOscLevel: 0, // No sub osc
  stereoSpread: 0, // No stereo spread
  brightness: 0, // Neutral brightness (0 dB)
}

/**
 * ELECTRIC PIANO - Bright FM piano
 */
const epOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 80, attack: 0.001, decay: 0.5, sustain: 0.3, release: 0.8 },
  { ratio: 2.0, level: 60, attack: 0.001, decay: 0.3, sustain: 0.2, release: 0.5 },
  { ratio: 3.0, level: 40, attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.3 },
  { ratio: 4.0, level: 30, attack: 0.001, decay: 0.15, sustain: 0.05, release: 0.2 },
]

const epLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 4.0, depth: 10, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.TRIANGLE, rate: 0.5, depth: 15, phase: 0, sync: false, destination: LFODestination.AMPLITUDE },
  { waveform: WaveformType.SINE, rate: 1.5, depth: 20, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.3, depth: 8, phase: 0, sync: false, destination: LFODestination.OP1_LEVEL },
]

export const defaultPreset: Preset = {
  id: 'default-ep',
  name: 'Electric Piano',
  algorithm: AlgorithmType.FAN_OUT,
  operators: epOperators,
  lfos: epLFOs,
  filter: { type: 'lowpass', cutoff: 2000, resonance: 2 },
  masterEffects: defaultMasterEffects,
  synthEngine: defaultSynthEngine,
  masterVolume: 0.7,
}

/**
 * FM BASS - Deep bass sound
 */
const bassOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 90, attack: 0.001, decay: 0.3, sustain: 0.7, release: 0.4 },
  { ratio: 2.0, level: 70, attack: 0.001, decay: 0.2, sustain: 0.5, release: 0.3 },
  { ratio: 1.5, level: 50, attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.2 },
  { ratio: 0.5, level: 40, attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.15, feedback: 0.3 },
]

const bassLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 2.0, depth: 8, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.SAWTOOTH, rate: 0.3, depth: 12, phase: 0, sync: false, destination: LFODestination.AMPLITUDE },
  { waveform: WaveformType.SQUARE, rate: 2.0, depth: 30, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.5, depth: 10, phase: 0, sync: false, destination: LFODestination.OP2_LEVEL },
]

export const bassPreset: Preset = {
  id: 'bass-1',
  name: 'FM Bass',
  algorithm: AlgorithmType.SERIAL,
  operators: bassOperators,
  lfos: bassLFOs,
  filter: { type: 'lowpass', cutoff: 1000, resonance: 4 },
  masterEffects: defaultMasterEffects,
  synthEngine: defaultSynthEngine,
  masterVolume: 0.8,
}

/**
 * Export all presets
 */
export const factoryPresets: Preset[] = [
  defaultPreset,
  bassPreset,
  ...ambientPresets,
  ...creativePresets,
]
