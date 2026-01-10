/**
 * Types audio pour OscilloSynth
 */

/**
 * Algorithm FM (DX7-style)
 * 8 algorithmes avec différentes configurations de routage
 */
export enum AlgorithmType {
  ALGO_1 = 1, // 4→3→2→1→OUT (Serial complet)
  ALGO_2 = 2, // (4→3→2)+(4→1)→OUT (Mixed)
  ALGO_3 = 3, // (4→3)+(2→1)→OUT (Dual serial)
  ALGO_4 = 4, // 4+3+2+1→OUT (Parallel complet)
  ALGO_5 = 5, // (4→3)+(2)+(1)→OUT (Semi-parallel)
  ALGO_6 = 6, // (4→3→2→1)→OUT (Serial optimisé)
  ALGO_7 = 7, // (4→3)+(4→2)+(4→1)→OUT (Fan-out)
  ALGO_8 = 8, // (4+3)→2→1→OUT (Parallel input)
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
  ADD = 'add', // lfo1 + lfo2 + lfo3 + lfo4
  MULTIPLY = 'multiply', // lfo1 * lfo2 * lfo3 * lfo4
  MIN = 'min', // min(lfo1, lfo2, lfo3, lfo4)
  MAX = 'max', // max(lfo1, lfo2, lfo3, lfo4)
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
  depth: number // 0 - 100%
  phase: number // 0 - 360 degrés
  sync: boolean // Sync tempo vs free-running
  syncValue?: string // '1/16', '1/8', '1/4', '1/2', '1', '2', '4', '8' bars
}

/**
 * Preset complet
 */
export interface Preset {
  id: string
  name: string
  algorithm: AlgorithmType
  operators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams]
  lfos: [LFOParams, LFOParams, LFOParams, LFOParams]
  lfoCombineMode: LFOCombineMode
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
