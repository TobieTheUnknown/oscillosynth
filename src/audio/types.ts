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
  PAN = 'pan', // Auto-pan (stereo position)
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
  pan: number // -1.0 to 1.0 (-1=left, 0=center, 1=right)
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
 * Paramètres Step Sequencer
 */
export interface StepSequencerParams {
  enabled: boolean // Step sequencer on/off
  steps: number[] // Array of 16 step values (0-100)
  rate: number // 0.1 - 20 Hz (step rate)
  depth: number // 0 - 200% (modulation depth)
  destination: LFODestination // Where the step sequencer modulates
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
 * Paramètres Portamento
 */
export interface PortamentoParams {
  enabled: boolean // Portamento on/off
  time: number // 0 - 1000 ms (glide time between notes)
  mode: 'always' | 'legato' // always = always glide, legato = only when overlapping notes
}

/**
 * Paramètres Stereo Width
 */
export interface StereoWidthParams {
  enabled: boolean // Stereo width on/off
  width: number // 0 - 200% (0=mono, 100=normal stereo, 200=wide stereo)
  noteSpread: boolean // Spread notes across stereo field based on pitch
  noteSpreadAmount: number // 0 - 100% (amount of note-based panning)
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
  stepSequencer: StepSequencerParams
  filter: FilterParams
  masterEffects: MasterEffectsParams
  portamento: PortamentoParams
  stereoWidth: StereoWidthParams
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
