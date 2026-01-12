/**
 * Types audio pour OscilloSynth
 */

/**
 * Algorithm FM (DX7-style + extras)
 * 12 algorithmes avec différentes configurations de routage
 */
export enum AlgorithmType {
  ALGO_1 = 1, // 4→3→2→1→OUT (Serial complet)
  ALGO_2 = 2, // (4→3→2)+(4→1)→OUT (Mixed)
  ALGO_3 = 3, // (4→3)+(2→1)→OUT (Dual serial)
  ALGO_4 = 4, // 4+3+2+1→OUT (Parallel complet)
  ALGO_5 = 5, // (4→3)+(2)+(1)→OUT (Semi-parallel)
  ALGO_6 = 6, // (4→3→2→1)→OUT (Serial avec feedback)
  ALGO_7 = 7, // (4→3)+(4→2)+(4→1)→OUT (Fan-out)
  ALGO_8 = 8, // (4+3)→2→1→OUT (Parallel input)
  ALGO_9 = 9, // (4→3→2)+(1)→OUT (Serial trio + carrier)
  ALGO_10 = 10, // (4→3)+(2→1)+(4→2)→OUT (Dual serial cross)
  ALGO_11 = 11, // 4→(3+2)→1→OUT (Split modulator)
  ALGO_12 = 12, // (4→2)+(3→1)→OUT (Dual parallel)
}

/**
 * Forme d'onde LFO
 * Note: RANDOM not supported by Tone.js LFO - use SAWTOOTH as alternative
 */
export enum WaveformType {
  SINE = 'sine',
  SQUARE = 'square',
  SAWTOOTH = 'sawtooth',
  TRIANGLE = 'triangle',
  RANDOM = 'random', // Not supported by Tone.js - placeholder for future implementation
}

/**
 * Mode de combinaison LFO
 */
export enum LFOCombineMode {
  ADD = 'add', // lfo1 + lfo2
  MULTIPLY = 'multiply', // lfo1 * lfo2
  MIN = 'min', // min(lfo1, lfo2)
  MAX = 'max', // max(lfo1, lfo2)
}

/**
 * Destinations de modulation LFO
 */
export enum LFODestination {
  PITCH = 'pitch', // Pitch vibrato (detune)
  AMPLITUDE = 'amplitude', // Amplitude tremolo
  FILTER_CUTOFF = 'filter_cutoff', // Filter cutoff frequency
  FILTER_RESONANCE = 'filter_resonance', // Filter resonance (Q)
  OP1_LEVEL = 'op1_level', // Operator 1 level
  OP2_LEVEL = 'op2_level', // Operator 2 level
  OP3_LEVEL = 'op3_level', // Operator 3 level
  OP4_LEVEL = 'op4_level', // Operator 4 level
  OP1_RATIO = 'op1_ratio', // Operator 1 ratio
  OP2_RATIO = 'op2_ratio', // Operator 2 ratio
  OP3_RATIO = 'op3_ratio', // Operator 3 ratio
  OP4_RATIO = 'op4_ratio', // Operator 4 ratio
  // Master effects
  FX_REVERB_WET = 'fx_reverb_wet',
  FX_DELAY_WET = 'fx_delay_wet',
  FX_DELAY_TIME = 'fx_delay_time',
  FX_CHORUS_WET = 'fx_chorus_wet',
  FX_DISTORTION_WET = 'fx_distortion_wet',
}

/**
 * Paramètres opérateur FM
 */
export interface OperatorParams {
  ratio: number // 0.5 - 16.0 (fréquence relative)
  level: number // 0 - 100 (volume/modulation depth)
  attack: number // 0.001 - 10.0 secondes
  decay: number // 0.001 - 10.0 secondes
  sustain: number // 0 - 1.0
  release: number // 0.001 - 10.0 secondes
  feedback?: number // 0 - 1.0 (operator 4 only)
}

/**
 * Paramètres LFO
 */
export interface LFOParams {
  waveform: WaveformType
  rate: number // 0.01 - 40 Hz
  depth: number // 0 - 200%
  phase: number // 0 - 360 degrés
  sync: boolean // Sync tempo vs free-running
  syncValue?: string // '1/16', '1/8', '1/4', '1/2', '1', '2', '4', '8' bars
  destination: LFODestination // Where this LFO pair modulates
}

/**
 * Paramètres Envelope Follower
 */
export interface EnvelopeFollowerParams {
  enabled: boolean // Envelope follower on/off
  smoothing: number // 0 - 1 (attack/release time)
  depth: number // 0 - 200% (modulation depth)
  destination: LFODestination // Where the envelope follower modulates (reuses LFO destinations)
}

/**
 * Paramètres du filtre
 */
export interface FilterParams {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch'
  cutoff: number // 20 - 20000 Hz
  resonance: number // 0 - 20 (Q factor)
  envelope: number // -100 to 100 (envelope amount on cutoff)
}

/**
 * Paramètres des effets master
 */
export interface MasterEffectsParams {
  // Reverb
  reverbWet: number // 0 - 1
  reverbDecay: number // 0.1 - 10 seconds
  reverbPreDelay: number // 0 - 1 seconds

  // Delay
  delayWet: number // 0 - 1
  delayTime: number // 0 - 2 seconds
  delayFeedback: number // 0 - 0.95

  // Chorus
  chorusWet: number // 0 - 1
  chorusFrequency: number // 0.1 - 10 Hz
  chorusDepth: number // 0 - 1

  // Distortion
  distortionWet: number // 0 - 1
  distortionAmount: number // 0 - 1
}

/**
 * Preset complet
 */
export interface Preset {
  id: string
  name: string
  algorithm: AlgorithmType
  operators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams]
  lfos: [
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams
  ] // 8 LFOs in 4 pairs
  lfoCombineMode: LFOCombineMode
  envelopeFollower: EnvelopeFollowerParams
  filter: FilterParams
  masterEffects: MasterEffectsParams
  masterVolume: number // 0 - 1.0
}

/**
 * État du moteur audio
 */
export interface AudioEngineState {
  isStarted: boolean
  activeVoices: number
  maxVoices: number
  currentPreset: Preset | null
  isMuted: boolean
}
