/**
 * OscilloSynth - Audio Type Definitions
 * Shared types for FM synthesis and LFO modulation
 */

import type * as Tone from 'tone';

// ============================================
// OPERATOR & FM SYNTHESIS
// ============================================

export interface Operator {
  ratio: number; // Frequency ratio (0.5 - 16.0)
  level: number; // Output level (0 - 1)
  envelope: ADSREnvelope;
  feedback?: number; // 0 - 1, only for operator 4
}

export interface ADSREnvelope {
  attack: number; // seconds
  decay: number; // seconds
  sustain: number; // 0 - 1
  release: number; // seconds
}

export enum AlgorithmType {
  ALGO_1 = 1, // 1→2→3→4 (series)
  ALGO_2 = 2, // (1+2)→3→4 (parallel carriers)
  ALGO_3 = 3, // 1→(2+3)→4
  ALGO_4 = 4, // (1→2)+(3→4) (dual stacks)
  ALGO_5 = 5, // 1→2, 1→3, 1→4 (broadcast)
  ALGO_6 = 6, // 1+2+3+4 (parallel additive)
  ALGO_7 = 7, // (1→2)+(3+4)
  ALGO_8 = 8, // 1→2→3, 1→4 (mixed)
}

export interface FMSynthConfig {
  operators: [Operator, Operator, Operator, Operator];
  algorithm: AlgorithmType;
  masterVolume: number; // 0 - 1
  masterPitch: number; // semitones offset
}

// ============================================
// LFO (Low Frequency Oscillator)
// ============================================

export enum WaveformType {
  SINE = 'sine',
  SQUARE = 'square',
  SAWTOOTH = 'sawtooth',
  TRIANGLE = 'triangle',
  RANDOM = 'random',
  CUSTOM = 'custom',
}

export interface LFOConfig {
  id: number; // 0-3 (4 LFOs)
  waveform: WaveformType;
  customWaveform?: Float32Array; // 128 points, normalized -1 to 1
  rate: number; // Hz if free, or tempo sync ratio
  depth: number; // 0 - 1
  phase: number; // 0 - 360 degrees
  sync: 'free' | 'tempo';
  tempoRatio?: string; // '1/16', '1/8', '1/4', '1/2', '1', '2', '4', '8'
}

export enum CombineMode {
  ADD = 'add', // lfo1 + lfo2 + lfo3 + lfo4
  MULTIPLY = 'multiply', // lfo1 * lfo2 * lfo3 * lfo4
  RING_MOD = 'ring_mod', // (lfo1 * lfo2) + (lfo3 * lfo4)
  CHAIN = 'chain', // lfo1 → lfo2 → lfo3 → lfo4
}

export interface LFOState {
  config: LFOConfig;
  currentValue: number; // -1 to 1
  currentPhase: number; // 0 - 1
}

// ============================================
// MODULATION MATRIX
// ============================================

export enum ModulationTarget {
  // Operator parameters (per operator)
  OP1_RATIO = 'op1_ratio',
  OP2_RATIO = 'op2_ratio',
  OP3_RATIO = 'op3_ratio',
  OP4_RATIO = 'op4_ratio',
  OP1_LEVEL = 'op1_level',
  OP2_LEVEL = 'op2_level',
  OP3_LEVEL = 'op3_level',
  OP4_LEVEL = 'op4_level',
  OP4_FEEDBACK = 'op4_feedback',

  // Envelope parameters
  OP1_ATTACK = 'op1_attack',
  OP2_ATTACK = 'op2_attack',
  OP3_ATTACK = 'op3_attack',
  OP4_ATTACK = 'op4_attack',
  OP1_DECAY = 'op1_decay',
  OP2_DECAY = 'op2_decay',
  OP3_DECAY = 'op3_decay',
  OP4_DECAY = 'op4_decay',
  OP1_SUSTAIN = 'op1_sustain',
  OP2_SUSTAIN = 'op2_sustain',
  OP3_SUSTAIN = 'op3_sustain',
  OP4_SUSTAIN = 'op4_sustain',
  OP1_RELEASE = 'op1_release',
  OP2_RELEASE = 'op2_release',
  OP3_RELEASE = 'op3_release',
  OP4_RELEASE = 'op4_release',

  // Global parameters
  MASTER_PITCH = 'master_pitch',
  MASTER_VOLUME = 'master_volume',
  FILTER_CUTOFF = 'filter_cutoff',
  FILTER_RESONANCE = 'filter_resonance',
  PAN = 'pan',
}

export interface ModulationConnection {
  lfoId: number; // 0-3
  target: ModulationTarget;
  amount: number; // -1 to 1 (bipolar)
  enabled: boolean;
}

// ============================================
// AUDIO ENGINE
// ============================================

export interface AudioEngineState {
  context: Tone.BaseContext | null;
  synth: FMSynthConfig;
  lfos: [LFOState, LFOState, LFOState, LFOState];
  combineMode: CombineMode;
  modulationMatrix: ModulationConnection[];
  filterCutoff: number; // Hz
  filterResonance: number; // 0 - 1
  limiterThreshold: number; // dB
  isPlaying: boolean;
  currentNote: number | null; // MIDI note number
}

// ============================================
// PRESET
// ============================================

export interface Preset {
  id: string;
  name: string;
  description?: string;
  category?: 'bass' | 'lead' | 'pad' | 'fx' | 'percussive' | 'other';
  synth: FMSynthConfig;
  lfos: LFOConfig[];
  combineMode: CombineMode;
  modulationMatrix: ModulationConnection[];
  filterCutoff: number;
  filterResonance: number;
  createdAt?: Date;
  tags?: string[];
}

// ============================================
// UTILITY TYPES
// ============================================

export type MIDINoteNumber = number; // 0-127
export type Frequency = number; // Hz
export type NormalizedValue = number; // 0-1
export type BipolarValue = number; // -1 to 1

// Helper to convert MIDI to frequency
export function midiToFreq(midi: MIDINoteNumber): Frequency {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Helper to normalize value to range
export function normalize(
  value: number,
  min: number,
  max: number
): NormalizedValue {
  return (value - min) / (max - min);
}

// Helper to denormalize value from range
export function denormalize(
  normalized: NormalizedValue,
  min: number,
  max: number
): number {
  return normalized * (max - min) + min;
}
