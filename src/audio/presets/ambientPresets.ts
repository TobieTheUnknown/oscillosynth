/**
 * Ambient Presets - Heavy multi-LFO modulation for evolving pads
 * Focus: Multiple LFOs modulating SAME destinations for complex interactions
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

const defaultMasterEffects: MasterEffectsParams = {
  reverbWet: 0,
  reverbDecay: 2.5,
  reverbPreDelay: 0.01,
  delayWet: 0,
  delayTime: 0.25,
  delayFeedback: 0.3,
  delaySync: true,
  delaySyncValue: '1/4',
  chorusWet: 0,
  chorusFrequency: 1.5,
  chorusDepth: 0.7,
  distortionWet: 0,
  distortionAmount: 0.4,
  stereoWidth: 100,
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
 * FILTER CHAOS - 4 LFOs tous sur FILTER_CUTOFF avec vitesses différentes
 * Créé une modulation de filtre ultra-complexe
 */
const filterChaosOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 85, attack: 3.0, decay: 1.5, sustain: 0.9, release: 6.0 },
  { ratio: 2.0, level: 70, attack: 3.5, decay: 2.0, sustain: 0.88, release: 6.5 },
  { ratio: 1.5, level: 55, attack: 4.0, decay: 2.5, sustain: 0.85, release: 7.0 },
  { ratio: 3.0, level: 40, attack: 4.5, decay: 3.0, sustain: 0.82, release: 7.5 },
]

const filterChaosLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.08, depth: 45, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.TRIANGLE, rate: 0.2, depth: 35, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.05, depth: 50, phase: 90, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SQUARE, rate: 0.15, depth: 25, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
]

export const filterChaosPreset: Preset = {
  id: 'ambient-filter-chaos',
  name: '🌊 Filter Chaos',
  algorithm: AlgorithmType.PARALLEL,
  operators: filterChaosOperators,
  lfos: filterChaosLFOs,
  filter: { type: 'lowpass', cutoff: 3000, resonance: 4.5 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.7,
    reverbDecay: 7.0,
    chorusWet: 0.4,
    chorusDepth: 0.85,
    delayWet: 0.3,
    delaySync: true,
    delaySyncValue: '1/2',
    stereoWidth: 160,
  },
  synthEngine: { ...defaultSynthEngine, brightness: 3 },
  masterVolume: 0.65,
}

/**
 * HARMONIC DRIFT - 3 LFOs sur PITCH + 1 sur FILTER pour dérive harmonique
 */
const harmonicDriftOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 80, attack: 4.0, decay: 2.0, sustain: 0.92, release: 8.0 },
  { ratio: 1.01, level: 75, attack: 4.5, decay: 2.5, sustain: 0.9, release: 8.5 },
  { ratio: 2.02, level: 60, attack: 5.0, decay: 3.0, sustain: 0.87, release: 9.0 },
  { ratio: 0.5, level: 50, attack: 5.5, decay: 3.5, sustain: 0.84, release: 9.5 },
]

const harmonicDriftLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.03, depth: 8, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.SINE, rate: 0.07, depth: 12, phase: 120, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.TRIANGLE, rate: 0.12, depth: 6, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.SINE, rate: 0.15, depth: 40, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
]

export const harmonicDriftPreset: Preset = {
  id: 'ambient-harmonic-drift',
  name: '🎵 Harmonic Drift',
  algorithm: AlgorithmType.PARALLEL,
  operators: harmonicDriftOperators,
  lfos: harmonicDriftLFOs,
  filter: { type: 'lowpass', cutoff: 2000, resonance: 3.0 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.8,
    reverbDecay: 9.0,
    chorusWet: 0.35,
    delayWet: 0.25,
    delaySync: true,
    delaySyncValue: '1',
    stereoWidth: 170,
  },
  synthEngine: { ...defaultSynthEngine, detune: 10, feedback: 18, brightness: -1 },
  masterVolume: 0.6,
}

/**
 * OPERATOR MORPH - Multi-modulation des niveaux d'operators
 * LFO1+2 sur OP1, LFO3 sur OP2, LFO4 sur OP3
 */
const operatorMorphOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 75, attack: 2.5, decay: 1.5, sustain: 0.88, release: 5.5 },
  { ratio: 2.0, level: 70, attack: 3.0, decay: 2.0, sustain: 0.86, release: 6.0 },
  { ratio: 3.0, level: 65, attack: 3.5, decay: 2.5, sustain: 0.84, release: 6.5 },
  { ratio: 1.5, level: 60, attack: 4.0, decay: 3.0, sustain: 0.82, release: 7.0 },
]

const operatorMorphLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.1, depth: 30, phase: 0, sync: false, destination: LFODestination.OP1_LEVEL },
  { waveform: WaveformType.TRIANGLE, rate: 0.25, depth: 25, phase: 0, sync: false, destination: LFODestination.OP1_LEVEL },
  { waveform: WaveformType.SINE, rate: 0.15, depth: 35, phase: 90, sync: false, destination: LFODestination.OP2_LEVEL },
  { waveform: WaveformType.SINE, rate: 0.08, depth: 28, phase: 0, sync: false, destination: LFODestination.OP3_LEVEL },
]

export const operatorMorphPreset: Preset = {
  id: 'ambient-operator-morph',
  name: '🔄 Operator Morph',
  algorithm: AlgorithmType.FAN_OUT,
  operators: operatorMorphOperators,
  lfos: operatorMorphLFOs,
  filter: { type: 'lowpass', cutoff: 3500, resonance: 2.5 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.65,
    reverbDecay: 6.0,
    chorusWet: 0.45,
    chorusDepth: 0.9,
    delayWet: 0.35,
    delaySync: true,
    delaySyncValue: '1/4',
    delayFeedback: 0.5,
    stereoWidth: 145,
  },
  synthEngine: { ...defaultSynthEngine, fmIndex: 130, brightness: 2 },
  masterVolume: 0.68,
}

/**
 * RHYTHMIC VOID - Multi-modulation des effets avec delay sync
 * 2 LFOs sur Reverb wet, 1 sur Delay feedback, 1 sur Stereo width
 */
const rhythmicVoidOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 0.5, level: 88, attack: 3.5, decay: 2.0, sustain: 0.93, release: 7.5 },
  { ratio: 1.0, level: 82, attack: 4.0, decay: 2.5, sustain: 0.91, release: 8.0 },
  { ratio: 1.5, level: 68, attack: 4.5, decay: 3.0, sustain: 0.88, release: 8.5 },
  { ratio: 2.0, level: 52, attack: 5.0, decay: 3.5, sustain: 0.85, release: 9.0, feedback: 0.22 },
]

const rhythmicVoidLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.06, depth: 35, phase: 0, sync: false, destination: LFODestination.FX_REVERB_WET },
  { waveform: WaveformType.TRIANGLE, rate: 0.18, depth: 28, phase: 0, sync: false, destination: LFODestination.FX_REVERB_WET },
  { waveform: WaveformType.SINE, rate: 0.5, depth: 40, phase: 0, sync: true, destination: LFODestination.FX_DELAY_FEEDBACK },
  { waveform: WaveformType.SINE, rate: 0.12, depth: 30, phase: 90, sync: false, destination: LFODestination.FX_STEREO_WIDTH },
]

export const rhythmicVoidPreset: Preset = {
  id: 'ambient-rhythmic-void',
  name: '⚡ Rhythmic Void',
  algorithm: AlgorithmType.SERIAL,
  operators: rhythmicVoidOperators,
  lfos: rhythmicVoidLFOs,
  filter: { type: 'lowpass', cutoff: 1500, resonance: 4.2 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.6,
    reverbDecay: 8.0,
    chorusWet: 0.3,
    delayWet: 0.45,
    delaySync: true,
    delaySyncValue: '1/8',
    delayFeedback: 0.55,
    stereoWidth: 150,
  },
  synthEngine: { ...defaultSynthEngine, feedback: 25, stereoSpread: 30, brightness: -2 },
  masterVolume: 0.62,
}

/**
 * SPECTRAL CASCADE - Multi-modulation complexe: 2 sur Filter, 2 sur Operators
 */
const spectralCascadeOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 78, attack: 2.8, decay: 1.8, sustain: 0.89, release: 5.8 },
  { ratio: 2.0, level: 72, attack: 3.2, decay: 2.2, sustain: 0.87, release: 6.2 },
  { ratio: 3.0, level: 62, attack: 3.6, decay: 2.6, sustain: 0.84, release: 6.6 },
  { ratio: 5.0, level: 48, attack: 4.0, decay: 3.0, sustain: 0.81, release: 7.0 },
]

const spectralCascadeLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.1, depth: 42, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.TRIANGLE, rate: 0.22, depth: 38, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
  { waveform: WaveformType.SINE, rate: 0.14, depth: 32, phase: 60, sync: false, destination: LFODestination.OP2_LEVEL },
  { waveform: WaveformType.SINE, rate: 0.18, depth: 28, phase: 120, sync: false, destination: LFODestination.OP3_LEVEL },
]

export const spectralCascadePreset: Preset = {
  id: 'ambient-spectral-cascade',
  name: '🌈 Spectral Cascade',
  algorithm: AlgorithmType.PARALLEL,
  operators: spectralCascadeOperators,
  lfos: spectralCascadeLFOs,
  filter: { type: 'lowpass', cutoff: 2800, resonance: 3.5 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.7,
    reverbDecay: 6.5,
    chorusWet: 0.5,
    chorusDepth: 0.88,
    delayWet: 0.4,
    delaySync: true,
    delaySyncValue: '1/4',
    delayFeedback: 0.48,
    stereoWidth: 165,
  },
  synthEngine: { ...defaultSynthEngine, fmIndex: 140, brightness: 5 },
  masterVolume: 0.7,
}

/**
 * QUANTUM DRIFT - Modulation extrême multi-paramètres
 * LFO1+2 sur Pitch, LFO3 sur FM Index, LFO4 sur Filter
 */
const quantumDriftOperators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams] = [
  { ratio: 1.0, level: 82, attack: 3.8, decay: 2.2, sustain: 0.91, release: 7.2 },
  { ratio: 1.02, level: 76, attack: 4.2, decay: 2.6, sustain: 0.89, release: 7.6 },
  { ratio: 2.01, level: 64, attack: 4.6, decay: 3.0, sustain: 0.86, release: 8.0 },
  { ratio: 3.03, level: 50, attack: 5.0, decay: 3.4, sustain: 0.83, release: 8.4, feedback: 0.28 },
]

const quantumDriftLFOs: [LFOParams, LFOParams, LFOParams, LFOParams] = [
  { waveform: WaveformType.SINE, rate: 0.04, depth: 10, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.TRIANGLE, rate: 0.09, depth: 15, phase: 0, sync: false, destination: LFODestination.PITCH },
  { waveform: WaveformType.SINE, rate: 0.16, depth: 35, phase: 0, sync: false, destination: LFODestination.SYNTH_FM_INDEX },
  { waveform: WaveformType.SINE, rate: 0.13, depth: 48, phase: 0, sync: false, destination: LFODestination.FILTER_CUTOFF },
]

export const quantumDriftPreset: Preset = {
  id: 'ambient-quantum-drift',
  name: '⚛️ Quantum Drift',
  algorithm: AlgorithmType.FAN_OUT,
  operators: quantumDriftOperators,
  lfos: quantumDriftLFOs,
  filter: { type: 'lowpass', cutoff: 2200, resonance: 3.8 },
  masterEffects: {
    ...defaultMasterEffects,
    reverbWet: 0.75,
    reverbDecay: 7.5,
    chorusWet: 0.38,
    chorusDepth: 0.82,
    delayWet: 0.32,
    delaySync: true,
    delaySyncValue: '1/2',
    delayFeedback: 0.52,
    stereoWidth: 175,
  },
  synthEngine: { ...defaultSynthEngine, detune: 12, fmIndex: 125, feedback: 22, stereoSpread: 28, brightness: 1 },
  masterVolume: 0.64,
}

/**
 * Export all ambient presets
 */
export const ambientPresets: Preset[] = [
  filterChaosPreset,
  harmonicDriftPreset,
  operatorMorphPreset,
  rhythmicVoidPreset,
  spectralCascadePreset,
  quantumDriftPreset,
]
