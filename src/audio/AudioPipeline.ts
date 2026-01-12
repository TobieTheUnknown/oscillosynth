/**
 * Audio Pipeline
 * Filter + Limiter + Analyser pour visualisation
 */

import * as Tone from 'tone'

export class AudioPipeline {
  private filter: Tone.Filter
  private reverb: Tone.Reverb
  private delay: Tone.FeedbackDelay
  private chorus: Tone.Chorus
  private distortion: Tone.Distortion
  private stereoWidener: Tone.StereoWidener
  private limiter: Tone.Limiter
  private analyser: Tone.Analyser
  private follower: Tone.Follower
  private meter: Tone.Meter
  private output: Tone.Gain

  constructor() {
    // Low-pass filter 24dB (4-pole)
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 20000, // Full range par défaut
      rolloff: -24, // 24dB/octave
      Q: 1,
    })

    // Reverb
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.01,
    })

    // Delay
    this.delay = new Tone.FeedbackDelay({
      delayTime: 0.25,
      feedback: 0.3,
    })

    // Chorus
    this.chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
    }).start()

    // Distortion
    this.distortion = new Tone.Distortion({
      distortion: 0.4,
    })

    // Stereo Widener (width: 0=mono, 1=normal stereo, >1=wide)
    this.stereoWidener = new Tone.StereoWidener(0) // Start with normal stereo (no widening)

    // Limiter anti-clipping
    this.limiter = new Tone.Limiter(-0.3) // -0.3dB ceiling

    // Analyser pour visualisation (FFT + waveform)
    this.analyser = new Tone.Analyser({
      type: 'waveform',
      size: 2048,
    })

    // Envelope follower for amplitude tracking
    this.follower = new Tone.Follower({
      smoothing: 0.05, // Default smoothing (attack/release)
    })

    // Meter for reading follower output value
    this.meter = new Tone.Meter()

    // Output gain
    this.output = new Tone.Gain(1.0)

    // Routing: filter → distortion → chorus → delay → reverb → stereoWidener → limiter → analyser → output
    // Follower taps after limiter (same point as analyser) for amplitude tracking
    // Follower → Meter for reading smoothed amplitude
    // Each effect uses Tone.js built-in wet parameter for simplicity
    this.filter.connect(this.distortion)
    this.distortion.connect(this.chorus)
    this.chorus.connect(this.delay)
    this.delay.connect(this.reverb)
    this.reverb.connect(this.stereoWidener)
    this.stereoWidener.connect(this.limiter)
    this.limiter.connect(this.analyser)
    this.limiter.connect(this.follower)
    this.follower.connect(this.meter)
    this.analyser.connect(this.output)

    // Set initial wet values to 0 (bypass all effects)
    this.distortion.wet.value = 0
    this.chorus.wet.value = 0
    this.delay.wet.value = 0
    this.reverb.wet.value = 0
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
   * Set filter type
   */
  setFilterType(type: 'lowpass' | 'highpass' | 'bandpass' | 'notch'): void {
    this.filter.type = type
  }

  /**
   * Set filter cutoff frequency
   */
  setFilterCutoff(frequency: number): void {
    const clampedFreq = Math.max(20, Math.min(20000, frequency))
    // Smooth filter changes to avoid zipper noise (5ms ramp)
    this.filter.frequency.rampTo(clampedFreq, 0.005)
  }

  /**
   * Set filter resonance (Q)
   */
  setFilterResonance(q: number): void {
    const clampedQ = Math.max(0.1, Math.min(30, q))
    // Smooth resonance changes to avoid artifacts (5ms ramp)
    this.filter.Q.rampTo(clampedQ, 0.005)
  }

  /**
   * Apply filter cutoff modulation (cents offset from base cutoff)
   */
  applyFilterCutoffModulation(baseCutoff: number, modulationValue: number): void {
    // modulationValue is -1 to 1
    // Map to ±2 octaves (±2400 cents)
    const cents = modulationValue * 2400
    const semitones = cents / 100
    const multiplier = Math.pow(2, semitones / 12)
    const modulatedCutoff = baseCutoff * multiplier
    this.setFilterCutoff(modulatedCutoff)
  }

  /**
   * Apply filter resonance modulation
   */
  applyFilterResonanceModulation(baseResonance: number, modulationValue: number): void {
    // modulationValue is -1 to 1
    // Map to ±50% of base resonance
    const modulatedResonance = baseResonance * (1 + modulationValue * 0.5)
    this.setFilterResonance(modulatedResonance)
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
   * Reverb controls
   */
  setReverbWet(wet: number): void {
    this.reverb.wet.value = Math.max(0, Math.min(1, wet))
  }

  setReverbDecay(decay: number): void {
    this.reverb.decay = Math.max(0.1, Math.min(10, decay))
  }

  setReverbPreDelay(preDelay: number): void {
    this.reverb.preDelay = Math.max(0, Math.min(1, preDelay))
  }

  /**
   * Delay controls
   */
  setDelayWet(wet: number): void {
    this.delay.wet.value = Math.max(0, Math.min(1, wet))
  }

  setDelayTime(time: number): void {
    this.delay.delayTime.value = Math.max(0, Math.min(2, time))
  }

  setDelayFeedback(feedback: number): void {
    this.delay.feedback.value = Math.max(0, Math.min(0.95, feedback))
  }

  /**
   * Chorus controls
   */
  setChorusWet(wet: number): void {
    this.chorus.wet.value = Math.max(0, Math.min(1, wet))
  }

  setChorusFrequency(freq: number): void {
    this.chorus.frequency.value = Math.max(0.1, Math.min(10, freq))
  }

  setChorusDepth(depth: number): void {
    this.chorus.depth = Math.max(0, Math.min(1, depth))
  }

  /**
   * Distortion controls
   */
  setDistortionWet(wet: number): void {
    this.distortion.wet.value = Math.max(0, Math.min(1, wet))
  }

  setDistortionAmount(amount: number): void {
    this.distortion.distortion = Math.max(0, Math.min(1, amount))
  }

  /**
   * Stereo Width controls
   */
  setStereoWidth(width: number): void {
    // width: 0-200% mapped to 0-1 for Tone.StereoWidener
    // 0% = mono (0), 100% = normal stereo (0), 200% = wide stereo (1)
    const normalizedWidth = (width / 100) - 1 // Map 0-200% to -1 to 1
    const clampedWidth = Math.max(0, Math.min(1, (normalizedWidth + 1) / 2)) // Then to 0-1
    this.stereoWidener.width.value = clampedWidth
  }

  /**
   * Envelope follower controls
   */
  setFollowerSmoothing(smoothing: number): void {
    this.follower.smoothing = Math.max(0, Math.min(1, smoothing))
  }

  getFollowerValue(): number {
    // Returns amplitude from meter (reads follower output)
    const value = this.meter.getValue()
    // Meter returns value in range, normalize to 0-1
    return Math.max(0, Math.min(1, typeof value === 'number' ? value : 0))
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.filter.dispose()
    this.reverb.dispose()
    this.delay.dispose()
    this.chorus.dispose()
    this.distortion.dispose()
    this.stereoWidener.dispose()
    this.limiter.dispose()
    this.analyser.dispose()
    this.follower.dispose()
    this.meter.dispose()
    this.output.dispose()
  }
}
