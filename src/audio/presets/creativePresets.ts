/**
 * Creative Presets - Full feature showcase
 * Utilise tous les paramètres: 8 LFOs, sync, synth engine, effects, etc.
 */

import {
  Preset,
  AlgorithmType,
  WaveformType,
  LFODestination,
  OperatorParams,
  LFOParams,
} from '../types'

/**
 * EVOLVING PAD - Texture évolutive avec 8 LFOs synchro tempo
 * - Detune pour richesse harmonique
 * - Brightness modulé par LFO
 * - Sub osc pour profondeur
 * - Stereo spread pour largeur
 * - 8 LFOs tous actifs avec sync tempo
 */
const evolvingPad: Preset = {
  id: 'creative-evolving-pad',
  name: '✨ Evolving Pad',
  category: 'Creative',
  algorithm: AlgorithmType.PARALLEL,

  operators: [
    { ratio: 1.0, level: 70, attack: 2.0, decay: 1.5, sustain: 0.8, release: 3.0 },
    { ratio: 2.01, level: 60, attack: 1.8, decay: 1.2, sustain: 0.7, release: 2.5 },
    { ratio: 3.99, level: 50, attack: 1.5, decay: 1.0, sustain: 0.6, release: 2.0 },
    { ratio: 0.5, level: 40, attack: 2.5, decay: 2.0, sustain: 0.5, release: 3.5 },
  ],

  // 4 LFOs tous configurés avec tempo sync
  lfos: [
    // LFO 1: Pitch modulation (slow evolving)
    { waveform: WaveformType.SINE, rate: 0.5, depth: 15, phase: 0, sync: true, syncValue: '2', destination: LFODestination.PITCH },
    // LFO 2: Filter sweep
    { waveform: WaveformType.SINE, rate: 1.0, depth: 40, phase: 0, sync: true, syncValue: '1', destination: LFODestination.FILTER_CUTOFF },
    // LFO 3: Amplitude tremolo
    { waveform: WaveformType.SINE, rate: 2.0, depth: 20, phase: 0, sync: true, syncValue: '1/4', destination: LFODestination.AMPLITUDE },
    // LFO 4: Brightness modulation
    { waveform: WaveformType.SINE, rate: 0.8, depth: 30, phase: 0, sync: true, syncValue: '1', destination: LFODestination.SYNTH_BRIGHTNESS },
    // Dummy LFOs 5-8 (not visible)
    { waveform: WaveformType.SINE, rate: 0.1, depth: 0, phase: 0, sync: false, destination: LFODestination.PITCH },
    { waveform: WaveformType.SINE, rate: 0.1, depth: 0, phase: 0, sync: false, destination: LFODestination.PITCH },
    { waveform: WaveformType.SINE, rate: 0.1, depth: 0, phase: 0, sync: false, destination: LFODestination.PITCH },
    { waveform: WaveformType.SINE, rate: 0.1, depth: 0, phase: 0, sync: false, destination: LFODestination.PITCH },
  ],


  filter: { type: 'lowpass', cutoff: 1200, resonance: 4 },

  masterEffects: {
    reverbWet: 0.4,
    reverbDecay: 4.5,
    reverbPreDelay: 0.02,
    delayWet: 0.25,
    delayTime: 0.375,
    delayFeedback: 0.5,
    delaySync: true,
    delaySyncValue: '1/4',
    chorusWet: 0.35,
    chorusFrequency: 1.2,
    chorusDepth: 0.8,
    distortionWet: 0,
    distortionAmount: 0,
    stereoWidth: 100,
  },

  synthEngine: {
    detune: 25, // Richesse harmonique
    fmIndex: 120, // FM depth augmenté
    brightness: 3, // +3dB high shelf
    feedback: 15, // Légère saturation
    subOscLevel: 30, // Sub osc pour profondeur
    stereoSpread: 40, // Largeur stéréo
  },

  masterVolume: 0.7,
}

/**
 * DIGITAL CHAOS - Texture numérique agressive
 * - FM Index élevé pour harmoniques complexes
 * - Feedback maximal
 * - Square waves pour texture digitale
 * - Distortion
 * - Multiply combine mode pour modulation complexe
 */
const digitalChaos: Preset = {
  id: 'creative-digital-chaos',
  name: '⚡ Digital Chaos',
  category: 'Creative',
  algorithm: AlgorithmType.SERIAL,

  operators: [
    { ratio: 1.0, level: 85, attack: 0.001, decay: 0.1, sustain: 0.9, release: 0.2 },
    { ratio: 3.5, level: 90, attack: 0.001, decay: 0.08, sustain: 0.8, release: 0.15 },
    { ratio: 7.0, level: 75, attack: 0.001, decay: 0.05, sustain: 0.7, release: 0.1 },
    { ratio: 11.0, level: 60, attack: 0.001, decay: 0.03, sustain: 0.6, release: 0.08 },
  ],

  lfos: [
    // LFO 1: Ratio modulation (inharmonic)
    { waveform: WaveformType.SQUARE, rate: 8.0, depth: 40, phase: 0, sync: true, syncValue: '1/16', destination: LFODestination.OP2_RATIO },
    // LFO 2: FM Index modulation (chaos)
    { waveform: WaveformType.SQUARE, rate: 4.0, depth: 80, phase: 0, sync: true, syncValue: '1/4', destination: LFODestination.SYNTH_FM_INDEX },
    // LFO 3: Filter sweep rapide
    { waveform: WaveformType.SQUARE, rate: 16.0, depth: 50, phase: 0, sync: true, syncValue: '1/16', destination: LFODestination.FILTER_CUTOFF },
    // LFO 4: Distortion modulation
    { waveform: WaveformType.SINE, rate: 2.0, depth: 60, phase: 0, sync: true, syncValue: '1/2', destination: LFODestination.FX_DISTORTION_WET },
  ],

  filter: { type: 'bandpass', cutoff: 2500, resonance: 8 },

  masterEffects: {
    reverbWet: 0.2,
    reverbDecay: 1.5,
    reverbPreDelay: 0.005,
    delayWet: 0.3,
    delayTime: 0.125,
    delayFeedback: 0.6,
    delaySync: true,
    delaySyncValue: '1/8',
    chorusWet: 0.15,
    chorusFrequency: 3.5,
    chorusDepth: 0.5,
    distortionWet: 0.5,
    distortionAmount: 0.7,
    stereoWidth: 100,
  },

  synthEngine: {
    detune: 40, // Désaccordage marqué
    fmIndex: 180, // FM profond
    brightness: 8, // Très brillant
    feedback: 80, // Feedback intense
    subOscLevel: 0, // Pas de sub pour garder l'agressivité
    stereoSpread: 60, // Largeur importante
  },

  masterVolume: 0.6,
}

/**
 * MORPHING BASS - Basse évolutive avec modulation tempo
 * - Sub osc maximal
 * - Detune pour richesse
 * - LFOs tempo-synced sur ratios
 * - MIN combine mode pour effets de gate
 */
const morphingBass: Preset = {
  id: 'creative-morphing-bass',
  name: '🎵 Morphing Bass',
  category: 'Creative',
  algorithm: AlgorithmType.FAN_OUT,

  operators: [
    { ratio: 1.0, level: 90, attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 },
    { ratio: 2.0, level: 75, attack: 0.005, decay: 0.2, sustain: 0.6, release: 0.4 },
    { ratio: 0.5, level: 85, attack: 0.02, decay: 0.4, sustain: 0.8, release: 0.6 },
    { ratio: 3.0, level: 60, attack: 0.001, decay: 0.15, sustain: 0.5, release: 0.3 },
  ],

  lfos: [
    // LFO 1: Operator ratio modulation (morphing timbre)
    { waveform: WaveformType.SINE, rate: 1.0, depth: 30, phase: 0, sync: true, syncValue: '1/2', destination: LFODestination.OP1_RATIO },
    // LFO 2: Filter cutoff (wah effect)
    { waveform: WaveformType.SINE, rate: 2.0, depth: 60, phase: 0, sync: true, syncValue: '1/4', destination: LFODestination.FILTER_CUTOFF },
    // LFO 3: Sub osc level modulation
    { waveform: WaveformType.SINE, rate: 0.5, depth: 50, phase: 0, sync: true, syncValue: '2', destination: LFODestination.SYNTH_SUB_OSC },
    // LFO 4: Detune modulation
    { waveform: WaveformType.SINE, rate: 0.3, depth: 40, phase: 0, sync: true, syncValue: '4', destination: LFODestination.SYNTH_DETUNE },
  ],

  filter: { type: 'lowpass', cutoff: 800, resonance: 6 },

  masterEffects: {
    reverbWet: 0.15,
    reverbDecay: 1.8,
    reverbPreDelay: 0.01,
    delayWet: 0.2,
    delayTime: 0.25,
    delayFeedback: 0.4,
    delaySync: true,
    delaySyncValue: '1/4',
    chorusWet: 0.25,
    chorusFrequency: 0.8,
    chorusDepth: 0.9,
    distortionWet: 0.3,
    distortionAmount: 0.5,
    stereoWidth: 100,
  },

  synthEngine: {
    detune: 15, // Richesse
    fmIndex: 110, // FM léger
    brightness: -3, // Plus sombre pour basse
    feedback: 25, // Saturation basse
    subOscLevel: 80, // Sub osc dominant!
    stereoSpread: 20, // Largeur modérée
  },

  masterVolume: 0.75,
}

/**
 * SPACE LEAD - Lead spatial avec effets massifs
 * - Stereo spread maximal
 * - Delay + reverb profonds
 * - MAX combine mode pour pics
 * - Brightness modulé
 */
const spaceLead: Preset = {
  id: 'creative-space-lead',
  name: '🚀 Space Lead',
  category: 'Creative',
  algorithm: AlgorithmType.SPLIT,

  operators: [
    { ratio: 1.0, level: 80, attack: 0.02, decay: 0.3, sustain: 0.7, release: 1.0 },
    { ratio: 4.0, level: 70, attack: 0.01, decay: 0.25, sustain: 0.6, release: 0.8 },
    { ratio: 7.0, level: 60, attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.6 },
    { ratio: 2.0, level: 75, attack: 0.015, decay: 0.28, sustain: 0.65, release: 0.9 },
  ],

  lfos: [
    // LFO 1: Pitch vibrato (expressif)
    { waveform: WaveformType.SINE, rate: 5.0, depth: 12, phase: 0, sync: false, destination: LFODestination.PITCH },
    // LFO 2: Delay time modulation (spacey)
    { waveform: WaveformType.SINE, rate: 0.3, depth: 80, phase: 0, sync: true, syncValue: '4', destination: LFODestination.FX_DELAY_TIME },
    // LFO 3: Brightness sweep
    { waveform: WaveformType.SINE, rate: 0.8, depth: 70, phase: 0, sync: true, syncValue: '1', destination: LFODestination.SYNTH_BRIGHTNESS },
    // LFO 4: Stereo spread modulation
    { waveform: WaveformType.SINE, rate: 0.4, depth: 60, phase: 0, sync: true, syncValue: '2', destination: LFODestination.SYNTH_STEREO_SPREAD },
  ],

  filter: { type: 'lowpass', cutoff: 3500, resonance: 3 },

  masterEffects: {
    reverbWet: 0.6,
    reverbDecay: 6.0,
    reverbPreDelay: 0.03,
    delayWet: 0.45,
    delayTime: 0.5,
    delayFeedback: 0.7,
    delaySync: true,
    delaySyncValue: '1/2',
    chorusWet: 0.4,
    chorusFrequency: 2.0,
    chorusDepth: 0.85,
    distortionWet: 0.1,
    distortionAmount: 0.3,
    stereoWidth: 100,
  },

  synthEngine: {
    detune: 35, // Richesse
    fmIndex: 140, // FM moyen-élevé
    brightness: 5, // Brillant
    feedback: 20, // Légère saturation
    subOscLevel: 10, // Peu de sub
    stereoSpread: 85, // Très large!
  },

  masterVolume: 0.65,
}

/**
 * RHYTHMIC TEXTURE - Texture rythmique complexe
 * - Tous les LFOs sur tempo sync rapide
 * - Operator levels modulés rythmiquement
 * - Feedback élevé
 * - Square waves pour rythme marqué
 */
const rhythmicTexture: Preset = {
  id: 'creative-rhythmic-texture',
  name: '🥁 Rhythmic Texture',
  category: 'Creative',
  algorithm: AlgorithmType.DUAL_SERIAL,

  operators: [
    { ratio: 1.0, level: 75, attack: 0.005, decay: 0.1, sustain: 0.6, release: 0.2 },
    { ratio: 1.5, level: 80, attack: 0.003, decay: 0.08, sustain: 0.5, release: 0.15 },
    { ratio: 2.5, level: 70, attack: 0.002, decay: 0.06, sustain: 0.7, release: 0.18 },
    { ratio: 3.5, level: 65, attack: 0.001, decay: 0.05, sustain: 0.8, release: 0.12 },
  ],

  lfos: [
    // LFO 1: Op1 level (rhythmic pulsing)
    { waveform: WaveformType.SQUARE, rate: 4.0, depth: 70, phase: 0, sync: true, syncValue: '1/4', destination: LFODestination.OP1_LEVEL },
    // LFO 2: Op2 level (offset rhythm)
    { waveform: WaveformType.SQUARE, rate: 8.0, depth: 60, phase: 90, sync: true, syncValue: '1/16', destination: LFODestination.OP2_LEVEL },
    // LFO 3: Filter resonance (emphasis rhythm)
    { waveform: WaveformType.SQUARE, rate: 8.0, depth: 80, phase: 0, sync: true, syncValue: '1/16', destination: LFODestination.FILTER_RESONANCE },
    // LFO 4: Feedback modulation (texture variation)
    { waveform: WaveformType.SINE, rate: 2.0, depth: 70, phase: 0, sync: true, syncValue: '1/2', destination: LFODestination.SYNTH_FEEDBACK },
  ],

  filter: { type: 'bandpass', cutoff: 1800, resonance: 7 },

  masterEffects: {
    reverbWet: 0.25,
    reverbDecay: 2.0,
    reverbPreDelay: 0.01,
    delayWet: 0.35,
    delayTime: 0.1875, // Dotted 16th
    delayFeedback: 0.55,
    delaySync: true,
    delaySyncValue: '1/8',
    chorusWet: 0.2,
    chorusFrequency: 4.0,
    chorusDepth: 0.6,
    distortionWet: 0.4,
    distortionAmount: 0.6,
    stereoWidth: 100,
  },

  synthEngine: {
    detune: 30, // Richesse
    fmIndex: 130, // FM moyen
    brightness: 2, // Légèrement brillant
    feedback: 60, // Feedback marqué
    subOscLevel: 25, // Peu de sub
    stereoSpread: 50, // Largeur moyenne
  },

  masterVolume: 0.7,
}

export const creativePresets: Preset[] = [
  evolvingPad,
  digitalChaos,
  morphingBass,
  spaceLead,
  rhythmicTexture,
]
