/**
 * Audio Pipeline
 * Filter + Limiter + Analyser pour visualisation
 */

import * as Tone from 'tone'

export class AudioPipeline {
  private filter: Tone.Filter
  private limiter: Tone.Limiter
  private analyser: Tone.Analyser
  private output: Tone.Gain

  constructor() {
    // Low-pass filter 24dB (4-pole)
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 20000, // Full range par défaut
      rolloff: -24, // 24dB/octave
      Q: 1,
    })

    // Limiter anti-clipping
    this.limiter = new Tone.Limiter(-0.3) // -0.3dB ceiling

    // Analyser pour visualisation (FFT + waveform)
    this.analyser = new Tone.Analyser({
      type: 'waveform',
      size: 2048,
    })

    // Output gain
    this.output = new Tone.Gain(1.0)

    // Routing: filter → limiter → analyser → output
    this.filter.connect(this.limiter)
    this.limiter.connect(this.analyser)
    this.analyser.connect(this.output)
  }

  /**
   * Connecte une source au pipeline
   */
  connect(source: Tone.ToneAudioNode): void {
    source.connect(this.filter as Tone.InputNode)
  }

  /**
   * Connecte le pipeline à une destination
   */
  toDestination(): this {
    this.output.toDestination()
    return this
  }

  /**
   * Set filter cutoff frequency
   */
  setFilterCutoff(frequency: number): void {
    this.filter.frequency.value = Math.max(20, Math.min(20000, frequency))
  }

  /**
   * Set filter resonance (Q)
   */
  setFilterResonance(q: number): void {
    this.filter.Q.value = Math.max(0.1, Math.min(30, q))
  }

  /**
   * Get waveform data for visualization
   */
  getWaveform(): Float32Array {
    return this.analyser.getValue() as Float32Array
  }

  /**
   * Get FFT data for visualization
   */
  getFFT(): Float32Array {
    this.analyser.type = 'fft'
    const fft = this.analyser.getValue() as Float32Array
    this.analyser.type = 'waveform' // Reset to waveform
    return fft
  }

  /**
   * Switch analyser mode
   */
  setAnalyserMode(mode: 'waveform' | 'fft'): void {
    this.analyser.type = mode
  }

  /**
   * Get current analyser data
   */
  getAnalyserData(): Float32Array {
    return this.analyser.getValue() as Float32Array
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.filter.dispose()
    this.limiter.dispose()
    this.analyser.dispose()
    this.output.dispose()
  }
}
