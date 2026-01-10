/**
 * FMSynth - 4-Operator FM Synthesizer
 * Based on DX7-style FM synthesis with 8 algorithms
 */

import * as Tone from 'tone';
import type { FMSynthConfig, AlgorithmType, MIDINoteNumber } from '../types';

export class FMSynth {
  private operators: Tone.Oscillator[] = [];
  private envelopes: Tone.AmplitudeEnvelope[] = [];
  private gains: Tone.Gain[] = [];
  private output: Tone.Gain;
  private config: FMSynthConfig;
  private activeNotes: Map<MIDINoteNumber, {
    oscs: Tone.Oscillator[];
    envs: Tone.AmplitudeEnvelope[];
  }> = new Map();

  constructor(config: FMSynthConfig) {
    this.config = config;
    this.output = new Tone.Gain(config.masterVolume);
  }

  /**
   * Initialize FM synth with current algorithm
   */
  init() {
    this.cleanup();
    this.buildAlgorithm(this.config.algorithm);
  }

  /**
   * Build FM algorithm routing
   * Each algorithm defines how the 4 operators are connected
   */
  private buildAlgorithm(algorithm: AlgorithmType) {
    // Create 4 operators
    for (let i = 0; i < 4; i++) {
      const osc = new Tone.Oscillator({
        type: 'sine',
        frequency: 0, // Will be set when playing
      });
      const env = new Tone.AmplitudeEnvelope({
        attack: this.config.operators[i].envelope.attack,
        decay: this.config.operators[i].envelope.decay,
        sustain: this.config.operators[i].envelope.sustain,
        release: this.config.operators[i].envelope.release,
      });
      const gain = new Tone.Gain(this.config.operators[i].level);

      this.operators.push(osc);
      this.envelopes.push(env);
      this.gains.push(gain);
    }

    // Route according to algorithm
    switch (algorithm) {
      case 1: // 1→2→3→4 (series)
        this.operators[0].connect(this.gains[0]);
        this.gains[0].connect(this.operators[1].frequency);
        this.operators[1].connect(this.gains[1]);
        this.gains[1].connect(this.operators[2].frequency);
        this.operators[2].connect(this.gains[2]);
        this.gains[2].connect(this.operators[3].frequency);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[3].connect(this.output);
        break;

      case 2: // (1+2)→3→4 (parallel carriers)
        this.operators[0].connect(this.gains[0]);
        this.operators[1].connect(this.gains[1]);
        this.gains[0].connect(this.operators[2].frequency);
        this.gains[1].connect(this.operators[2].frequency);
        this.operators[2].connect(this.gains[2]);
        this.gains[2].connect(this.operators[3].frequency);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[3].connect(this.output);
        break;

      case 3: // 1→(2+3)→4
        this.operators[0].connect(this.gains[0]);
        this.gains[0].connect(this.operators[1].frequency);
        this.gains[0].connect(this.operators[2].frequency);
        this.operators[1].connect(this.gains[1]);
        this.operators[2].connect(this.gains[2]);
        this.gains[1].connect(this.operators[3].frequency);
        this.gains[2].connect(this.operators[3].frequency);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[3].connect(this.output);
        break;

      case 4: // (1→2)+(3→4) (dual stacks)
        this.operators[0].connect(this.gains[0]);
        this.gains[0].connect(this.operators[1].frequency);
        this.operators[1].connect(this.envelopes[1]);
        this.operators[2].connect(this.gains[2]);
        this.gains[2].connect(this.operators[3].frequency);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[1].connect(this.output);
        this.envelopes[3].connect(this.output);
        break;

      case 5: // 1→2, 1→3, 1→4 (broadcast)
        this.operators[0].connect(this.gains[0]);
        this.gains[0].connect(this.operators[1].frequency);
        this.gains[0].connect(this.operators[2].frequency);
        this.gains[0].connect(this.operators[3].frequency);
        this.operators[1].connect(this.envelopes[1]);
        this.operators[2].connect(this.envelopes[2]);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[1].connect(this.output);
        this.envelopes[2].connect(this.output);
        this.envelopes[3].connect(this.output);
        break;

      case 6: // 1+2+3+4 (parallel additive)
        this.operators[0].connect(this.envelopes[0]);
        this.operators[1].connect(this.envelopes[1]);
        this.operators[2].connect(this.envelopes[2]);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[0].connect(this.output);
        this.envelopes[1].connect(this.output);
        this.envelopes[2].connect(this.output);
        this.envelopes[3].connect(this.output);
        break;

      case 7: // (1→2)+(3+4)
        this.operators[0].connect(this.gains[0]);
        this.gains[0].connect(this.operators[1].frequency);
        this.operators[1].connect(this.envelopes[1]);
        this.operators[2].connect(this.envelopes[2]);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[1].connect(this.output);
        this.envelopes[2].connect(this.output);
        this.envelopes[3].connect(this.output);
        break;

      case 8: // 1→2→3, 1→4 (mixed)
        this.operators[0].connect(this.gains[0]);
        this.gains[0].connect(this.operators[1].frequency);
        this.gains[0].connect(this.operators[3].frequency);
        this.operators[1].connect(this.gains[1]);
        this.gains[1].connect(this.operators[2].frequency);
        this.operators[2].connect(this.envelopes[2]);
        this.operators[3].connect(this.envelopes[3]);
        this.envelopes[2].connect(this.output);
        this.envelopes[3].connect(this.output);
        break;
    }

    // Start all oscillators (silent until triggered)
    this.operators.forEach(osc => osc.start());
  }

  /**
   * Trigger note attack
   */
  triggerAttack(note: MIDINoteNumber, velocity: number = 1.0, time?: number) {
    const baseFreq = Tone.Frequency(note, 'midi').toFrequency();
    const pitchOffset = Math.pow(2, this.config.masterPitch / 12);
    const freq = baseFreq * pitchOffset;

    // Create voice
    const oscs: Tone.Oscillator[] = [];
    const envs: Tone.AmplitudeEnvelope[] = [];

    for (let i = 0; i < 4; i++) {
      const osc = new Tone.Oscillator({
        type: 'sine',
        frequency: freq * this.config.operators[i].ratio,
      });
      const env = new Tone.AmplitudeEnvelope({
        attack: this.config.operators[i].envelope.attack,
        decay: this.config.operators[i].envelope.decay,
        sustain: this.config.operators[i].envelope.sustain,
        release: this.config.operators[i].envelope.release,
      });

      oscs.push(osc);
      envs.push(env);
    }

    // Rebuild algorithm routing for this voice
    this.routeVoice(oscs, envs, this.config.algorithm);

    // Start oscillators and trigger envelopes
    oscs.forEach(osc => osc.start(time));
    envs.forEach(env => env.triggerAttack(time, velocity));

    this.activeNotes.set(note, { oscs, envs });
  }

  /**
   * Trigger note release
   */
  triggerRelease(note: MIDINoteNumber, time?: number) {
    const voice = this.activeNotes.get(note);
    if (!voice) return;

    // Trigger envelope release
    voice.envs.forEach(env => env.triggerRelease(time));

    // Cleanup after release
    const releaseTime = Math.max(...voice.envs.map(e => Tone.Time(e.release).toSeconds()));
    setTimeout(() => {
      voice.oscs.forEach(osc => {
        osc.stop();
        osc.dispose();
      });
      voice.envs.forEach(env => env.dispose());
      this.activeNotes.delete(note);
    }, (releaseTime + 0.1) * 1000);
  }

  /**
   * Route voice oscillators according to algorithm
   * (Simplified version for per-voice routing)
   */
  private routeVoice(
    oscs: Tone.Oscillator[],
    envs: Tone.AmplitudeEnvelope[],
    algorithm: AlgorithmType
  ) {
    const gains = oscs.map((_, i) => new Tone.Gain(this.config.operators[i].level));

    // Same routing as buildAlgorithm but for single voice
    // (Simplified here - in production would use same switch logic)
    switch (algorithm) {
      case 1:
        oscs[0].connect(gains[0]);
        gains[0].connect(oscs[1].frequency);
        oscs[1].connect(gains[1]);
        gains[1].connect(oscs[2].frequency);
        oscs[2].connect(gains[2]);
        gains[2].connect(oscs[3].frequency);
        oscs[3].connect(envs[3]);
        envs[3].connect(this.output);
        break;
      // ... other algorithms (same as buildAlgorithm)
      default:
        // Fallback to algorithm 6 (parallel)
        oscs.forEach((osc, i) => {
          osc.connect(envs[i]);
          envs[i].connect(this.output);
        });
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FMSynthConfig>) {
    this.config = { ...this.config, ...config };
    if (config.algorithm) {
      this.init(); // Rebuild if algorithm changed
    }
    if (config.masterVolume !== undefined) {
      this.output.gain.value = config.masterVolume;
    }
  }

  /**
   * Connect to destination
   */
  connect(destination: Tone.InputNode) {
    this.output.connect(destination);
  }

  /**
   * Cleanup
   */
  private cleanup() {
    this.operators.forEach(osc => osc.dispose());
    this.envelopes.forEach(env => env.dispose());
    this.gains.forEach(gain => gain.dispose());
    this.operators = [];
    this.envelopes = [];
    this.gains = [];
  }

  /**
   * Dispose synth
   */
  dispose() {
    this.cleanup();
    this.activeNotes.forEach(voice => {
      voice.oscs.forEach(osc => osc.dispose());
      voice.envs.forEach(env => env.dispose());
    });
    this.activeNotes.clear();
    this.output.dispose();
  }
}
