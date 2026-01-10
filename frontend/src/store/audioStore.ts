/**
 * OscilloSynth - Audio State Store
 * Manages FM synth, LFOs, and modulation matrix state
 */

import { create } from 'zustand';
import type {
  FMSynthConfig,
  LFOConfig,
  LFOState,
  CombineMode,
  ModulationConnection,
  AlgorithmType,
  WaveformType,
  MIDINoteNumber,
} from '../audio/types';

interface AudioStore {
  // FM Synth state
  synth: FMSynthConfig;
  algorithm: AlgorithmType;

  // LFO state
  lfos: [LFOState, LFOState, LFOState, LFOState];
  combineMode: CombineMode;

  // Modulation matrix
  modulationMatrix: ModulationConnection[];

  // Global audio parameters
  filterCutoff: number; // Hz
  filterResonance: number; // 0-1
  masterVolume: number; // 0-1
  masterPitch: number; // semitones

  // Playback state
  isPlaying: boolean;
  currentNote: MIDINoteNumber | null;
  activeVoices: MIDINoteNumber[];

  // Actions - FM Synth
  setAlgorithm: (algorithm: AlgorithmType) => void;
  updateOperator: (index: 0 | 1 | 2 | 3, updates: Partial<FMSynthConfig['operators'][0]>) => void;
  setMasterVolume: (volume: number) => void;
  setMasterPitch: (pitch: number) => void;

  // Actions - LFO
  updateLFO: (index: 0 | 1 | 2 | 3, updates: Partial<LFOConfig>) => void;
  setLFOWaveform: (index: 0 | 1 | 2 | 3, waveform: WaveformType) => void;
  setLFOCustomWaveform: (index: 0 | 1 | 2 | 3, waveform: Float32Array) => void;
  setCombineMode: (mode: CombineMode) => void;

  // Actions - Modulation Matrix
  addModulation: (connection: ModulationConnection) => void;
  removeModulation: (lfoId: number, target: string) => void;
  updateModulation: (lfoId: number, target: string, amount: number) => void;
  toggleModulation: (lfoId: number, target: string) => void;

  // Actions - Filter
  setFilterCutoff: (cutoff: number) => void;
  setFilterResonance: (resonance: number) => void;

  // Actions - Playback
  playNote: (note: MIDINoteNumber, velocity?: number) => void;
  stopNote: (note: MIDINoteNumber) => void;
  stopAll: () => void;
}

// Default LFO configuration
const createDefaultLFO = (id: number): LFOState => ({
  config: {
    id,
    waveform: WaveformType.SINE,
    rate: 1.0,
    depth: 0.5,
    phase: 0,
    sync: 'free',
  },
  currentValue: 0,
  currentPhase: 0,
});

// Default FM Synth configuration
const defaultSynth: FMSynthConfig = {
  operators: [
    {
      ratio: 1.0,
      level: 0.8,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 },
    },
    {
      ratio: 2.0,
      level: 0.6,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3 },
    },
    {
      ratio: 3.0,
      level: 0.4,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3 },
    },
    {
      ratio: 4.0,
      level: 0.3,
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 },
      feedback: 0.0,
    },
  ],
  algorithm: AlgorithmType.ALGO_1,
  masterVolume: 0.7,
  masterPitch: 0,
};

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial state
  synth: defaultSynth,
  algorithm: AlgorithmType.ALGO_1,
  lfos: [
    createDefaultLFO(0),
    createDefaultLFO(1),
    createDefaultLFO(2),
    createDefaultLFO(3),
  ],
  combineMode: 'add' as CombineMode,
  modulationMatrix: [],
  filterCutoff: 2000,
  filterResonance: 0.5,
  masterVolume: 0.7,
  masterPitch: 0,
  isPlaying: false,
  currentNote: null,
  activeVoices: [],

  // FM Synth actions
  setAlgorithm: (algorithm) =>
    set({ algorithm, synth: { ...get().synth, algorithm } }),

  updateOperator: (index, updates) =>
    set((state) => {
      const newOperators = [...state.synth.operators] as typeof state.synth.operators;
      newOperators[index] = { ...newOperators[index], ...updates };
      return { synth: { ...state.synth, operators: newOperators } };
    }),

  setMasterVolume: (masterVolume) =>
    set((state) => ({
      masterVolume,
      synth: { ...state.synth, masterVolume }
    })),

  setMasterPitch: (masterPitch) =>
    set((state) => ({
      masterPitch,
      synth: { ...state.synth, masterPitch }
    })),

  // LFO actions
  updateLFO: (index, updates) =>
    set((state) => {
      const newLFOs = [...state.lfos] as typeof state.lfos;
      newLFOs[index] = {
        ...newLFOs[index],
        config: { ...newLFOs[index].config, ...updates },
      };
      return { lfos: newLFOs };
    }),

  setLFOWaveform: (index, waveform) =>
    set((state) => {
      const newLFOs = [...state.lfos] as typeof state.lfos;
      newLFOs[index] = {
        ...newLFOs[index],
        config: { ...newLFOs[index].config, waveform },
      };
      return { lfos: newLFOs };
    }),

  setLFOCustomWaveform: (index, customWaveform) =>
    set((state) => {
      const newLFOs = [...state.lfos] as typeof state.lfos;
      newLFOs[index] = {
        ...newLFOs[index],
        config: {
          ...newLFOs[index].config,
          waveform: WaveformType.CUSTOM,
          customWaveform,
        },
      };
      return { lfos: newLFOs };
    }),

  setCombineMode: (combineMode) => set({ combineMode }),

  // Modulation matrix actions
  addModulation: (connection) =>
    set((state) => ({
      modulationMatrix: [...state.modulationMatrix, connection],
    })),

  removeModulation: (lfoId, target) =>
    set((state) => ({
      modulationMatrix: state.modulationMatrix.filter(
        (conn) => !(conn.lfoId === lfoId && conn.target === target)
      ),
    })),

  updateModulation: (lfoId, target, amount) =>
    set((state) => ({
      modulationMatrix: state.modulationMatrix.map((conn) =>
        conn.lfoId === lfoId && conn.target === target
          ? { ...conn, amount }
          : conn
      ),
    })),

  toggleModulation: (lfoId, target) =>
    set((state) => ({
      modulationMatrix: state.modulationMatrix.map((conn) =>
        conn.lfoId === lfoId && conn.target === target
          ? { ...conn, enabled: !conn.enabled }
          : conn
      ),
    })),

  // Filter actions
  setFilterCutoff: (filterCutoff) => set({ filterCutoff }),
  setFilterResonance: (filterResonance) => set({ filterResonance }),

  // Playback actions
  playNote: (note, velocity = 1.0) =>
    set((state) => ({
      isPlaying: true,
      currentNote: note,
      activeVoices: [...state.activeVoices, note],
    })),

  stopNote: (note) =>
    set((state) => ({
      activeVoices: state.activeVoices.filter((n) => n !== note),
      isPlaying: state.activeVoices.length > 1,
      currentNote: state.activeVoices.length > 1 ? state.activeVoices[0] : null,
    })),

  stopAll: () =>
    set({
      isPlaying: false,
      currentNote: null,
      activeVoices: [],
    }),
}));
