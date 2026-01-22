/**
 * Types audio pour OscilloSynth
 */

/**
 * Algorithm FM - 5 distinct algorithms with unique tonal characteristics
 */
export enum AlgorithmType {
  SERIAL = 1, // 4→3→2→1→OUT - Pure serial FM, metallic/bell tones
  PARALLEL = 2, // 4+3+2+1→OUT - All parallel, warm/organ tones
  DUAL_SERIAL = 3, // (4→3)+(2→1)→OUT - Two serial chains, complex harmonics
  FAN_OUT = 4, // 4→(3+2+1)→OUT - One master modulator, rich modulation
  SPLIT = 5, // (4+3)→2→1→OUT - Dual modulators to carrier, thick textures
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

// REMOVED: LFOCombineMode - Simplified to individual LFOs (no combining)

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
  // Noise generator
  NOISE_LEVEL = 'noise_level',
  NOISE_FILTER_CUTOFF = 'noise_filter_cutoff',
  NOISE_FILTER_RESONANCE = 'noise_filter_resonance',
  // Synth engine parameters
  SYNTH_DETUNE = 'synth_detune',
  SYNTH_FM_INDEX = 'synth_fm_index',
  SYNTH_BRIGHTNESS = 'synth_brightness',
  SYNTH_FEEDBACK = 'synth_feedback',
  SYNTH_SUB_OSC = 'synth_sub_osc',
  SYNTH_STEREO_SPREAD = 'synth_stereo_spread',
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

// Removed: EnvelopeFollowerParams - not used in UI
// Removed: StepSequencerParams - not used in UI

/**
 * Paramètres du filtre
 */
export interface FilterParams {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch'
  cutoff: number // 20 - 20000 Hz
  resonance: number // 0 - 20 (Q factor)
}

// Removed: PortamentoParams - not used in UI
// Removed: StereoWidthParams - not used in UI

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

// REMOVED: LFOPairDepths - Simplified to individual LFOs only (no pairs)

/**
 * Paramètres créatifs de la synth engine
 */
export interface SynthEngineParams {
  detune: number // 0 - 100 cents - Désaccordage global de tous les opérateurs
  fmIndex: number // 0 - 200% - Profondeur globale de modulation FM
  feedback: number // 0 - 100% - Feedback global (mélangé avec feedback op4)
  subOscLevel: number // 0 - 100% - Niveau oscillateur sub -1 octave
  stereoSpread: number // 0 - 100% - Désaccordage stéréo pour largeur
  brightness: number // -12 à +12 dB - Filtre shelf haut pour contrôle de brillance
}

/**
 * Preset complet
 */
export interface Preset {
  id: string
  name: string
  category?: string
  algorithm: AlgorithmType
  operators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams]
  lfos: [LFOParams, LFOParams, LFOParams, LFOParams] // 4 individual LFOs
  filter: FilterParams
  masterEffects: MasterEffectsParams
  synthEngine: SynthEngineParams // Paramètres créatifs de la synth engine
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
