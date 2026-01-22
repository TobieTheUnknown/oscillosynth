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
  // Custom stereo width control using Mid/Side processing + micro-detune
  private midSideSplit: Tone.MidSideSplit
  private midGain: Tone.Gain
  private sideGain: Tone.Gain
  private sideChorus: Tone.Chorus // Subtle chorus on Side channel for enhanced width
  private midSideMerge: Tone.MidSideMerge
  private limiter: Tone.Limiter
  private analyser: Tone.Analyser
  private stereoAnalyser: Tone.Analyser
  private follower: Tone.Follower
  private meter: Tone.Meter
  private output: Tone.Gain

  constructor() {
    // Low-pass filter 24dB (4-pole)
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 10000, // 10kHz max par défaut
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
      maxDelay: 2, // Max 2 seconds - CRITICAL: allows delay times up to 2s
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

    // Custom Stereo Width control using Mid/Side processing + micro-chorus
    // This allows: 0% = mono, 100% = normal stereo, 200% = ultra-wide stereo
    this.midSideSplit = new Tone.MidSideSplit()
    this.midGain = new Tone.Gain(1.0) // Mid channel (L+R) - always 1.0
    this.sideGain = new Tone.Gain(1.0) // Side channel (L-R) - controls width (1.0 = 100% = normal)

    // Micro-chorus on Side channel for enhanced stereo imaging
    this.sideChorus = new Tone.Chorus({
      frequency: 0.3, // Very slow modulation
      delayTime: 8, // Subtle delay
      depth: 0, // Start at 0, will be controlled by width
    }).start()

    this.midSideMerge = new Tone.MidSideMerge()

    // Limiter anti-clipping
    this.limiter = new Tone.Limiter(-0.3) // -0.3dB ceiling

    // Analyser pour visualisation (FFT + waveform) - mono
    this.analyser = new Tone.Analyser({
      type: 'waveform',
      size: 2048,
    })

    // Stereo analyser for L/R visualization
    this.stereoAnalyser = new Tone.Analyser({
      type: 'waveform',
      size: 2048,
      channels: 2, // Stereo analysis
    })

    // Envelope follower for amplitude tracking
    this.follower = new Tone.Follower({
      smoothing: 0.05, // Default smoothing (attack/release)
    })

    // Meter for reading follower output value
    this.meter = new Tone.Meter()

    // Output gain
    this.output = new Tone.Gain(1.0)

    // Routing: filter → distortion → chorus → delay → [Mid/Side Width] → reverb → limiter → analysers → output
    // Mid/Side width placed BEFORE reverb so reverb affects the widened signal
    // Mid/Side chain: split → (mid gain + side gain) → merge
    // Follower taps after limiter (same point as analyser) for amplitude tracking
    // Follower → Meter for reading smoothed amplitude
    // Both mono and stereo analysers tap after limiter for visualization
    // Each effect uses Tone.js built-in wet parameter for simplicity
    this.filter.connect(this.distortion)
    this.distortion.connect(this.chorus)
    this.chorus.connect(this.delay)

    // Mid/Side stereo width processing with micro-chorus on Side
    this.delay.connect(this.midSideSplit)
    this.midSideSplit.mid.connect(this.midGain)
    this.midSideSplit.side.connect(this.sideGain)
    this.midGain.connect(this.midSideMerge.mid)
    // Side channel goes through gain → chorus → merge for enhanced width
    this.sideGain.connect(this.sideChorus)
    this.sideChorus.connect(this.midSideMerge.side)
    this.midSideMerge.connect(this.reverb)

    this.reverb.connect(this.limiter)
    this.limiter.connect(this.analyser)
    this.limiter.connect(this.stereoAnalyser)
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
   * Connecte une source au pipeline (passe par le filter)
   */
  connect(source: Tone.ToneAudioNode): void {
    source.connect(this.filter as Tone.InputNode)
  }

  /**
   * Connecte une source après le filter, avant les effects (pour noise)
   */
  connectAfterFilter(source: Tone.ToneAudioNode): void {
    source.connect(this.distortion as Tone.InputNode)
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
    const clampedFreq = Math.max(20, Math.min(10000, frequency))
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
   * Get stereo waveform data (for goniometer/L-R visualization)
   * Returns [L_channel, R_channel]
   */
  getStereoWaveform(): [Float32Array, Float32Array] {
    const stereoData = this.stereoAnalyser.getValue()

    if (Array.isArray(stereoData) && stereoData.length === 2) {
      return [stereoData[0] as Float32Array, stereoData[1] as Float32Array]
    }

    // Fallback to mono (both channels same)
    const monoData = stereoData as Float32Array
    return [monoData, monoData]
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

  /**
   * Set delay time with optional tempo sync
   * If sync is true, syncValue is used to calculate time based on BPM
   */
  setDelayTimeWithSync(time: number, sync: boolean, syncValue?: string): void {
    if (sync && syncValue) {
      const convertedTime = this.syncValueToSeconds(syncValue)
      this.delay.delayTime.value = Math.max(0, Math.min(2, convertedTime))
    } else {
      this.setDelayTime(time)
    }
  }

  /**
   * Convert sync value (musical notation) to seconds based on current BPM
   * e.g., '1/4' = quarter note, '1/8' = eighth note, etc.
   */
  private syncValueToSeconds(syncValue: string): number {
    const bpm = Tone.Transport.bpm.value
    const quarterNoteTime = 60 / bpm // Time for one quarter note in seconds

    // Parse sync value (e.g., '1/4', '1/8', '2', etc.)
    const fractionMatch = syncValue.match(/^(\d+)\/(\d+)$/)
    const wholeMatch = syncValue.match(/^(\d+)$/)

    if (fractionMatch) {
      // Fractional note (e.g., '1/4', '1/8')
      const numerator = parseInt(fractionMatch[1])
      const denominator = parseInt(fractionMatch[2])
      const beats = (4 / denominator) * numerator // Convert to quarter note beats
      return quarterNoteTime * beats
    } else if (wholeMatch) {
      // Whole bars (e.g., '1', '2', '4')
      const bars = parseInt(wholeMatch[1])
      return quarterNoteTime * 4 * bars // 4 quarter notes per bar
    }

    // Default to quarter note if parse fails
    return quarterNoteTime
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
   * Stereo Width controls using Mid/Side processing + micro-chorus
   * Width: 0-200% where:
   * - 0% = Mono (no side signal)
   * - 100% = Normal stereo (side gain = 1, no chorus)
   * - 200% = Ultra-wide stereo (side gain = 3.5, chorus active)
   */
  setStereoWidth(width: number): void {
    // Clamp to 0-200%
    const clampedWidth = Math.max(0, Math.min(200, width))

    // More aggressive side gain curve for drastic effect
    // 0% → 0, 100% → 1, 200% → 3.5 (much wider than before)
    let sideGainValue: number
    if (clampedWidth <= 100) {
      // Below 100%: Linear reduction to mono
      sideGainValue = clampedWidth / 100
    } else {
      // Above 100%: Aggressive widening (1 to 3.5)
      // Map 100-200% to 1.0-3.5
      const excessWidth = (clampedWidth - 100) / 100 // 0 to 1
      sideGainValue = 1 + excessWidth * 2.5 // 1 to 3.5
    }

    // Apply side gain
    this.sideGain.gain.value = sideGainValue

    // Activate micro-chorus progressively above 100% for enhanced width
    if (clampedWidth > 100) {
      const chorusAmount = (clampedWidth - 100) / 100 // 0 to 1
      this.sideChorus.wet.value = Math.min(0.3, chorusAmount * 0.3) // Max 30% wet
      this.sideChorus.depth = Math.min(0.5, chorusAmount * 0.5) // Max 50% depth
    } else {
      // No chorus below 100%
      this.sideChorus.wet.value = 0
      this.sideChorus.depth = 0
    }
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
    this.midSideSplit.dispose()
    this.midGain.dispose()
    this.sideGain.dispose()
    this.sideChorus.dispose()
    this.midSideMerge.dispose()
    this.limiter.dispose()
    this.analyser.dispose()
    this.stereoAnalyser.dispose()
    this.follower.dispose()
    this.meter.dispose()
    this.output.dispose()
  }
}
