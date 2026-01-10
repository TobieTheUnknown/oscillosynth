/**
 * AudioPipeline - Audio effects chain with filter, limiter, and analyser
 * Ensures zero clipping and provides visualization data
 */

import * as Tone from 'tone';

export class AudioPipeline {
  // Audio nodes
  private input: Tone.Gain;
  private filter: Tone.Filter;
  private limiter: Tone.Limiter;
  private analyser: Tone.Analyser;
  private output: Tone.Gain;

  // Configuration
  private filterCutoff: number = 2000;
  private filterResonance: number = 0.5;

  constructor() {
    // Create input
    this.input = new Tone.Gain(1);

    // Create 24dB low-pass filter (Tone.Filter defaults to 12dB, use rolloff for 24dB)
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: this.filterCutoff,
      Q: this.filterResonance * 30, // Map 0-1 to reasonable Q range
      rolloff: -24, // 24dB per octave
    });

    // Create limiter to prevent clipping
    // Threshold at -0.3dB as per specs
    this.limiter = new Tone.Limiter(-0.3);

    // Create analyser for visualization
    this.analyser = new Tone.Analyser({
      type: 'waveform',
      size: 2048, // FFT size for detailed waveform
    });

    // Create output
    this.output = new Tone.Gain(1);

    // Connect pipeline: input → filter → limiter → analyser → output
    this.input.connect(this.filter);
    this.filter.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.connect(this.output);
  }

  /**
   * Connect input source
   */
  connectInput(source: Tone.OutputNode) {
    source.connect(this.input);
  }

  /**
   * Connect to destination
   */
  connectOutput(destination: Tone.InputNode) {
    this.output.connect(destination);
  }

  /**
   * Update filter cutoff frequency
   */
  setFilterCutoff(frequency: number) {
    this.filterCutoff = Math.max(20, Math.min(20000, frequency));
    this.filter.frequency.rampTo(this.filterCutoff, 0.05);
  }

  /**
   * Update filter resonance (Q)
   */
  setFilterResonance(resonance: number) {
    this.filterResonance = Math.max(0, Math.min(1, resonance));
    const q = this.filterResonance * 30; // Map 0-1 to 0-30
    this.filter.Q.rampTo(q, 0.05);
  }

  /**
   * Get current filter cutoff
   */
  getFilterCutoff(): number {
    return this.filterCutoff;
  }

  /**
   * Get current filter resonance
   */
  getFilterResonance(): number {
    return this.filterResonance;
  }

  /**
   * Get waveform data for visualization
   * Returns Float32Array of waveform values
   */
  getWaveform(): Float32Array {
    return this.analyser.getValue() as Float32Array;
  }

  /**
   * Get FFT data for frequency analysis
   */
  getFFT(): Float32Array {
    const fftAnalyser = new Tone.Analyser({
      type: 'fft',
      size: 1024,
    });

    // Temporarily connect to get FFT
    this.limiter.connect(fftAnalyser);
    const fft = fftAnalyser.getValue() as Float32Array;
    fftAnalyser.dispose();

    return fft;
  }

  /**
   * Get current output level (for metering)
   * Returns RMS value
   */
  getOutputLevel(): number {
    const waveform = this.getWaveform();
    let sum = 0;
    for (let i = 0; i < waveform.length; i++) {
      sum += waveform[i] * waveform[i];
    }
    return Math.sqrt(sum / waveform.length);
  }

  /**
   * Check if signal is clipping (should never happen with limiter)
   */
  isClipping(): boolean {
    const waveform = this.getWaveform();
    const threshold = 0.99; // Close to 1.0
    return waveform.some(sample => Math.abs(sample) > threshold);
  }

  /**
   * Reset filter to defaults
   */
  resetFilter() {
    this.setFilterCutoff(2000);
    this.setFilterResonance(0.5);
  }

  /**
   * Dispose pipeline
   */
  dispose() {
    this.input.dispose();
    this.filter.dispose();
    this.limiter.dispose();
    this.analyser.dispose();
    this.output.dispose();
  }
}

/**
 * Utility: Create a simple peak meter
 */
export class PeakMeter {
  private peak: number = 0;
  private decayRate: number = 0.95; // How fast peak decays

  update(level: number) {
    if (level > this.peak) {
      this.peak = level;
    } else {
      this.peak *= this.decayRate;
    }
  }

  getPeak(): number {
    return this.peak;
  }

  reset() {
    this.peak = 0;
  }
}
