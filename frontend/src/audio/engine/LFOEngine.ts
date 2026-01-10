/**
 * LFOEngine - Low Frequency Oscillator Engine
 * Manages 4 independent LFOs with various waveforms and combination modes
 */

import * as Tone from 'tone';
import type { LFOConfig } from '../types';
import { CombineMode } from '../types';

export class LFOEngine {
  private lfos: LFO[] = [];
  private combineMode: CombineMode = CombineMode.ADD;
  private updateCallbacks: Map<number, (value: number) => void> = new Map();

  constructor(configs: LFOConfig[]) {
    this.lfos = configs.map(config => new LFO(config));
  }

  /**
   * Start all LFOs
   */
  start() {
    this.lfos.forEach(lfo => lfo.start());
  }

  /**
   * Stop all LFOs
   */
  stop() {
    this.lfos.forEach(lfo => lfo.stop());
  }

  /**
   * Update LFO configuration
   */
  updateLFO(index: number, config: Partial<LFOConfig>) {
    if (this.lfos[index]) {
      this.lfos[index].updateConfig(config);
    }
  }

  /**
   * Set combination mode
   */
  setCombineMode(mode: CombineMode) {
    this.combineMode = mode;
  }

  /**
   * Get current value of a specific LFO
   */
  getLFOValue(index: number): number {
    return this.lfos[index]?.getCurrentValue() || 0;
  }

  /**
   * Get combined value of all LFOs based on combine mode
   */
  getCombinedValue(): number {
    const values = this.lfos.map(lfo => lfo.getCurrentValue());

    switch (this.combineMode) {
      case 'add':
        // Sum and normalize
        return values.reduce((sum, val) => sum + val, 0) / 4;

      case 'multiply':
        // Multiply all (can create interesting dynamics)
        return values.reduce((product, val) => product * val, 1);

      case 'ring_mod':
        // (lfo1 * lfo2) + (lfo3 * lfo4)
        return (values[0] * values[1] + values[2] * values[3]) / 2;

      case 'chain':
        // lfo1 → lfo2 → lfo3 → lfo4 (cascade)
        let result = values[0];
        for (let i = 1; i < values.length; i++) {
          result = result * 0.5 + values[i] * 0.5; // Blend
        }
        return result;

      default:
        return values[0] || 0;
    }
  }

  /**
   * Register callback for LFO value updates
   */
  onUpdate(lfoIndex: number, callback: (value: number) => void) {
    this.updateCallbacks.set(lfoIndex, callback);
  }

  /**
   * Dispose all LFOs
   */
  dispose() {
    this.lfos.forEach(lfo => lfo.dispose());
    this.updateCallbacks.clear();
  }
}

/**
 * Single LFO instance
 */
class LFO {
  private config: LFOConfig;
  private oscillator: Tone.Oscillator | null = null;
  private currentValue: number = 0;
  private currentPhase: number = 0;
  private animationFrame: number | null = null;

  constructor(config: LFOConfig) {
    this.config = config;
  }

  /**
   * Start LFO
   */
  start() {
    if (this.config.sync === 'tempo') {
      this.startTempoSync();
    } else {
      this.startFree();
    }
  }

  /**
   * Start free-running LFO
   */
  private startFree() {
    // For custom waveforms or preset waveforms, we use requestAnimationFrame
    // for precise control over the waveform shape
    const startTime = performance.now();

    const update = () => {
      const elapsed = (performance.now() - startTime) / 1000; // seconds
      const cycles = elapsed * this.config.rate;
      this.currentPhase = (cycles + this.config.phase / 360) % 1;

      // Generate waveform value
      this.currentValue = this.generateWaveform(this.currentPhase) * this.config.depth;

      this.animationFrame = requestAnimationFrame(update);
    };

    update();
  }

  /**
   * Start tempo-synced LFO (using Tone.js Transport)
   */
  private startTempoSync() {
    // TODO: Implement tempo sync using Tone.Transport
    // For now, fallback to free mode
    this.startFree();
  }

  /**
   * Generate waveform value at given phase (0-1)
   */
  private generateWaveform(phase: number): number {
    switch (this.config.waveform) {
      case 'sine':
        return Math.sin(phase * 2 * Math.PI);

      case 'square':
        return phase < 0.5 ? 1 : -1;

      case 'sawtooth':
        return 2 * phase - 1;

      case 'triangle':
        return phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;

      case 'random':
        // Sample & hold - change value at each cycle
        return Math.floor(phase) === 0 ? Math.random() * 2 - 1 : this.currentValue / this.config.depth;

      case 'custom':
        if (!this.config.customWaveform) return 0;
        // Linear interpolation through custom waveform array
        const index = phase * (this.config.customWaveform.length - 1);
        const i1 = Math.floor(index);
        const i2 = Math.min(i1 + 1, this.config.customWaveform.length - 1);
        const frac = index - i1;
        return (
          this.config.customWaveform[i1] * (1 - frac) +
          this.config.customWaveform[i2] * frac
        );

      default:
        return 0;
    }
  }

  /**
   * Stop LFO
   */
  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.dispose();
      this.oscillator = null;
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Get current value
   */
  getCurrentValue(): number {
    return this.currentValue;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): number {
    return this.currentPhase;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LFOConfig>) {
    const needsRestart = config.waveform !== undefined || config.sync !== undefined;
    this.config = { ...this.config, ...config };

    if (needsRestart && this.animationFrame) {
      this.stop();
      this.start();
    }
  }

  /**
   * Dispose LFO
   */
  dispose() {
    this.stop();
  }
}
