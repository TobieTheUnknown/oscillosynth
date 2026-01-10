/**
 * OscilloSynth - UI State Store
 * Manages UI state, active tabs, editor modes, etc.
 */

import { create } from 'zustand';

type ActiveTab = 'lfos' | 'fm' | 'matrix' | 'presets';

interface UIStore {
  // View state
  activeTab: ActiveTab;
  showKeyboard: boolean;
  showOscilloscope: boolean;
  showGrid: boolean;

  // Editor state
  selectedLFO: number | null; // 0-3 or null
  drawingMode: boolean;
  selectedOperator: number | null; // 0-3 or null

  // MIDI
  midiLearnTarget: string | null;
  midiDevices: string[];

  // Canvas
  canvasScale: number; // Zoom level
  showPhaseIndicators: boolean;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  toggleKeyboard: () => void;
  toggleOscilloscope: () => void;
  toggleGrid: () => void;

  setSelectedLFO: (index: number | null) => void;
  setDrawingMode: (enabled: boolean) => void;
  setSelectedOperator: (index: number | null) => void;

  setMIDILearnTarget: (target: string | null) => void;
  setMIDIDevices: (devices: string[]) => void;

  setCanvasScale: (scale: number) => void;
  togglePhaseIndicators: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  activeTab: 'lfos',
  showKeyboard: true,
  showOscilloscope: true,
  showGrid: true,

  selectedLFO: null,
  drawingMode: false,
  selectedOperator: null,

  midiLearnTarget: null,
  midiDevices: [],

  canvasScale: 1.0,
  showPhaseIndicators: true,

  // Actions
  setActiveTab: (activeTab) => set({ activeTab }),
  toggleKeyboard: () => set((state) => ({ showKeyboard: !state.showKeyboard })),
  toggleOscilloscope: () =>
    set((state) => ({ showOscilloscope: !state.showOscilloscope })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  setSelectedLFO: (selectedLFO) => set({ selectedLFO }),
  setDrawingMode: (drawingMode) => set({ drawingMode }),
  setSelectedOperator: (selectedOperator) => set({ selectedOperator }),

  setMIDILearnTarget: (midiLearnTarget) => set({ midiLearnTarget }),
  setMIDIDevices: (midiDevices) => set({ midiDevices }),

  setCanvasScale: (canvasScale) => set({ canvasScale }),
  togglePhaseIndicators: () =>
    set((state) => ({ showPhaseIndicators: !state.showPhaseIndicators })),
}));
