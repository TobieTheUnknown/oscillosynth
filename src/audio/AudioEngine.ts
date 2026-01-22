/**
 * Audio Engine Principal
 * Orchestre FM Engine, LFO Engine, Voice Pool
 */

import * as Tone from 'tone'
import { audioContext } from './AudioContext'
import { VoicePool, Voice } from './VoicePool'
import { FMEngine } from './FMEngine'
import { LFOEngine } from './LFOEngine'
import { AudioPipeline } from './AudioPipeline'
import { LFOModulator } from './LFOModulator'
import { Preset, AlgorithmType, AudioEngineState, LFODestination } from './types'

interface ActiveVoice {
  voice: Voice
  fmEngine: FMEngine
  lfoEngine: LFOEngine
  lfoInterval: ReturnType<typeof setInterval> | null
  envelopeModulator: Tone.AmplitudeEnvelope | null // Envelope for modulation purposes
  envelopeSignal: Tone.Signal | null // Signal source for envelope modulator
}

export class AudioEngine {
  private static instance: AudioEngine | null = null
  private voicePool: VoicePool
  private activeVoices: Map<number, ActiveVoice> = new Map()
  private masterGain: Tone.Gain
  private pipeline: AudioPipeline
  private currentPreset: Preset | null = null
  private isMuted = false
  private globalLFOEngine: LFOEngine | null = null // For visualization
  private globalLFOInterval: ReturnType<typeof setInterval> | null = null // Global LFO modulation loop
  private envelopeFollowerInterval: ReturnType<typeof setInterval> | null = null // Envelope follower polling
  private stepSequencerInterval: ReturnType<typeof setInterval> | null = null // Step sequencer polling
  private stepSequencerCurrentStep = 0 // Current step index
  private lastPlayedFrequency: number | null = null // For portamento
  // Noise generator
  private noiseSource: Tone.Noise | null = null
  private noiseFilter: Tone.Filter | null = null
  private noiseEnvelope: Tone.AmplitudeEnvelope | null = null
  private noiseGain: Tone.Gain | null = null
  private noiseActiveNotes: Set<number> = new Set() // Track active notes for noise envelope

  // Base noise parameters (for LFO modulation)
  private baseNoiseLevel: number = 0 // 0-100
  private baseNoiseFilterCutoff: number = 5000 // Hz
  private baseNoiseFilterResonance: number = 1 // Q value

  // Base synth engine parameters (for LFO modulation)
  private baseSynthDetune: number = 0 // 0-100 cents
  private baseSynthFmIndex: number = 100 // 0-200%
  private baseSynthBrightness: number = 0 // -12 to +12 dB
  private baseSynthFeedback: number = 0 // 0-100%
  private baseSynthSubOscLevel: number = 0 // 0-100%
  private baseSynthStereoSpread: number = 0 // 0-100%

  // Envelope modulation destinations
  private envelopeDestinations: LFODestination[] = []

  private constructor() {
    this.voicePool = new VoicePool(8) // Max 8 voix

    // Master gain
    this.masterGain = new Tone.Gain(0.7)

    // Audio pipeline (filter + limiter + analyser)
    this.pipeline = new AudioPipeline()

    // Routing: masterGain → pipeline (filter) → effects → destination
    this.pipeline.connect(this.masterGain)
    this.pipeline.toDestination()

    // Noise generator setup
    this.noiseSource = new Tone.Noise('white')
    this.noiseFilter = new Tone.Filter(5000, 'lowpass')

    // Create envelope for noise (uses Operator 1 ADSR settings)
    this.noiseEnvelope = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.5,
    })

    this.noiseGain = new Tone.Gain(0) // Start at 0 volume

    // NEW ROUTING: noise → noiseFilter → envelope → gain → pipeline (after main filter, before effects)
    // This gives: FM -> filter -> (+noise) -> effects
    this.noiseSource.connect(this.noiseFilter)
    this.noiseFilter.connect(this.noiseEnvelope)
    this.noiseEnvelope.connect(this.noiseGain)
    this.pipeline.connectAfterFilter(this.noiseGain)

    // Start noise (it will be silent until gain > 0)
    this.noiseSource.start()

    // Initialize Transport BPM for LFO sync
    Tone.Transport.bpm.value = 120 // Default 120 BPM

    console.log('✅ AudioEngine initialized with audio pipeline + noise generator + BPM 120')
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine()
    }
    return AudioEngine.instance
  }

  /**
   * Démarre l'AudioContext (nécessite user gesture)
   */
  async start(): Promise<void> {
    await audioContext.start()
  }

  /**
   * Joue une note MIDI
   */
  noteOn(midiNote: number, velocity = 100): void {
    if (!this.currentPreset) {
      console.warn('No preset loaded, cannot play note')
      return
    }

    // Convertir MIDI note en fréquence
    const frequency = Tone.Frequency(midiNote, 'midi').toFrequency()

    // Allouer une voix
    const voice = this.voicePool.allocate(midiNote, velocity)

    // Créer FM engine pour cette voix
    const fmEngine = new FMEngine(this.currentPreset.operators, this.currentPreset.algorithm)

    // Utiliser le LFO engine global partagé (au lieu d'en créer un par voix)
    const lfoEngine = this.globalLFOEngine!

    // Connecter FM engine au master gain
    fmEngine.connect(this.masterGain)

    // REMOVED: portamento feature (not in UI)

    // Mettre à jour le routing FM avec la fréquence réelle de la note
    // Ceci assure que le scaling FM est correct pour chaque note
    fmEngine.updateRoutingForFrequency(frequency)

    // Trigger note
    fmEngine.noteOn(frequency, velocity)

    // Initialize synth engine parameters for this voice
    if (this.currentPreset.synthEngine) {
      fmEngine.setFeedback(this.currentPreset.synthEngine.feedback)
      fmEngine.setSubOscLevel(this.currentPreset.synthEngine.subOscLevel)
      // Stereo spread: vary per voice for width
      try {
        const stereoSpread = this.currentPreset.synthEngine.stereoSpread ?? 0
        const voiceSpread = ((voice.id % 8) - 3.5) / 3.5 * stereoSpread
        fmEngine.setStereoSpread(voiceSpread)
      } catch (error) {
        console.error('Error setting stereo spread:', error)
      }
    }

    // Update last played frequency
    this.lastPlayedFrequency = frequency

    // Create envelope modulator (for modulation purposes, not audio path)
    // NOTE: Needs a constant input signal to work properly with .value
    const envelopeSignal = new Tone.Signal(1)
    const envelopeModulator = new Tone.AmplitudeEnvelope({
      attack: this.currentPreset.operators[0].attack,
      decay: this.currentPreset.operators[0].decay,
      sustain: this.currentPreset.operators[0].sustain,
      release: this.currentPreset.operators[0].release,
    })

    // Connect signal to envelope to make .value readable
    envelopeSignal.connect(envelopeModulator)

    // Trigger envelope
    envelopeModulator.triggerAttack()

    // Setup LFO + Envelope modulation with dynamic routing
    // Poll LFO and envelope values every 10ms and route to appropriate destinations
    // NOTE: Only per-voice destinations are modulated here (pitch, amplitude, operators)
    // Global destinations (noise, filter, effects) are handled by startGlobalLFOModulation()
    const lfoInterval = setInterval(() => {
      if (!this.currentPreset) return

      // Process each of the 4 individual LFOs
      for (let lfoIndex = 0; lfoIndex < 4; lfoIndex++) {
        const lfoIdx = lfoIndex as 0 | 1 | 2 | 3
        const destination = lfoEngine.getLFODestination(lfoIdx)

        // Only apply per-voice destinations here (global handled by startGlobalLFOModulation)
        if (LFOModulator.isPerVoiceDestination(destination)) {
          let lfoValue = 0

          // Get LFO value
          switch (lfoIdx) {
            case 0:
              lfoValue = lfoEngine.getLFO1Value()
              break
            case 1:
              lfoValue = lfoEngine.getLFO2Value()
              break
            case 2:
              lfoValue = lfoEngine.getLFO3Value()
              break
            case 3:
              lfoValue = lfoEngine.getLFO4Value()
              break
          }

          // Route to destination with LFO value (per-voice modulation)
          this.applyLFOModulation(destination, lfoValue, fmEngine)
        }
      }

      // Process envelope modulation
      if (this.envelopeDestinations.length > 0 && envelopeModulator) {
        // Get current envelope value (0-1 during sustain, fades during release)
        // We need to read the envelope's current output value
        const envelopeValue = envelopeModulator.value

        // Convert envelope value (0-1) to modulation range (-1 to +1)
        // This allows the envelope to modulate parameters bidirectionally
        const modulationValue = (envelopeValue - 0.5) * 2

        // Apply envelope modulation to all destinations
        this.envelopeDestinations.forEach(destination => {
          // Per-voice: use fmEngine, Global: use null
          const engine = LFOModulator.isPerVoiceDestination(destination) ? fmEngine : null
          this.applyLFOModulation(destination, modulationValue, engine)
        })
      }
    }, 10)

    // Stocker voix active
    this.activeVoices.set(voice.id, { voice, fmEngine, lfoEngine, lfoInterval, envelopeModulator, envelopeSignal })

    // Setup voice release callback
    voice.release = () => {
      this.releaseVoice(voice.id)
    }

    // Noise envelope handling
    const wasNoiseActive = this.noiseActiveNotes.size > 0
    this.noiseActiveNotes.add(midiNote)

    // Trigger noise envelope on first note or retrigger
    if (this.noiseEnvelope) {
      if (!wasNoiseActive) {
        // First note - trigger attack
        this.noiseEnvelope.triggerAttack()
      } else {
        // Retrigger for legato/polyphonic behavior
        this.noiseEnvelope.triggerAttack()
      }
    }

    console.log(
      `🎵 Note ON: ${String(midiNote)} (${frequency.toFixed(2)} Hz), voice ${String(voice.id)}, active: ${String(this.activeVoices.size)}`
    )
  }

  /**
   * Relâche une note MIDI
   */
  noteOff(midiNote: number): void {
    // Trouver et relâcher toutes les voix jouant cette note
    const voicesToRelease: number[] = []

    this.activeVoices.forEach((activeVoice, voiceId) => {
      if (activeVoice.voice.note === midiNote) {
        voicesToRelease.push(voiceId)
      }
    })

    voicesToRelease.forEach((voiceId) => {
      const activeVoice = this.activeVoices.get(voiceId)
      if (activeVoice) {
        // CRITICAL: Stop LFO modulation immediately to prevent errors during release
        if (activeVoice.lfoInterval) {
          clearInterval(activeVoice.lfoInterval)
        }

        activeVoice.fmEngine.noteOff()

        // Trigger envelope modulator release
        if (activeVoice.envelopeModulator) {
          activeVoice.envelopeModulator.triggerRelease()
        }

        // La voix sera libérée après release time via setTimeout
        setTimeout(() => {
          this.releaseVoice(voiceId)
        }, 2000) // 2s max release time
      }
    })

    // Noise envelope handling
    this.noiseActiveNotes.delete(midiNote)

    // Release noise envelope when all notes are off
    if (this.noiseActiveNotes.size === 0 && this.noiseEnvelope) {
      this.noiseEnvelope.triggerRelease()
    }

    console.log(`🎵 Note OFF: ${String(midiNote)}`)
  }

  /**
   * Apply LFO modulation to the appropriate destination
   */
  private applyLFOModulation(
    destination: LFODestination,
    value: number,
    fmEngine: FMEngine | null
  ): void {
    // Delegate to LFOModulator module
    LFOModulator.applyModulation(destination, value, fmEngine, {
      currentPreset: this.currentPreset,
      pipeline: this.pipeline,
      noiseGain: this.noiseGain,
      noiseFilter: this.noiseFilter,
      baseNoiseLevel: this.baseNoiseLevel,
      baseNoiseFilterCutoff: this.baseNoiseFilterCutoff,
      baseNoiseFilterResonance: this.baseNoiseFilterResonance,
      baseSynthDetune: this.baseSynthDetune,
      baseSynthFmIndex: this.baseSynthFmIndex,
      baseSynthBrightness: this.baseSynthBrightness,
      baseSynthFeedback: this.baseSynthFeedback,
      baseSynthSubOscLevel: this.baseSynthSubOscLevel,
      baseSynthStereoSpread: this.baseSynthStereoSpread,
      activeVoices: this.activeVoices as Map<number, { fmEngine: FMEngine }>,
      globalLFOEngine: this.globalLFOEngine ? this.globalLFOEngine : undefined,
    })
  }

  /**
   * Start global LFO modulation loop
   * Modulates global parameters (noise, filter, effects) continuously
   * Independent of active voices
   */
  private startGlobalLFOModulation(): void {
    // Stop existing global LFO interval if any
    this.stopGlobalLFOModulation()

    if (!this.globalLFOEngine || !this.currentPreset) {
      return
    }

    // Poll LFO values every 10ms and apply to global parameters
    this.globalLFOInterval = setInterval(() => {
      if (!this.currentPreset || !this.globalLFOEngine) return

      // Process each of the 4 individual LFOs
      for (let lfoIndex = 0; lfoIndex < 4; lfoIndex++) {
        const lfoIdx = lfoIndex as 0 | 1 | 2 | 3
        const destination = this.globalLFOEngine.getLFODestination(lfoIdx)

        // Only apply global destinations here (per-voice handled in voice loop)
        if (!LFOModulator.isPerVoiceDestination(destination)) {
          let lfoValue = 0

          // Get LFO value
          switch (lfoIdx) {
            case 0:
              lfoValue = this.globalLFOEngine.getLFO1Value()
              break
            case 1:
              lfoValue = this.globalLFOEngine.getLFO2Value()
              break
            case 2:
              lfoValue = this.globalLFOEngine.getLFO3Value()
              break
            case 3:
              lfoValue = this.globalLFOEngine.getLFO4Value()
              break
          }

          // Apply modulation to global parameter (no fmEngine for global modulation)
          this.applyLFOModulation(destination, lfoValue, null)
        }
      }
    }, 10)

    console.log('✅ Global LFO modulation loop started')
  }

  /**
   * Stop global LFO modulation loop
   */
  private stopGlobalLFOModulation(): void {
    if (this.globalLFOInterval) {
      clearInterval(this.globalLFOInterval)
      this.globalLFOInterval = null
      console.log('🛑 Global LFO modulation loop stopped')
    }
  }

  /**
   * Libère une voix
   */
  private releaseVoice(voiceId: number): void {
    const activeVoice = this.activeVoices.get(voiceId)
    if (activeVoice) {
      // Stop LFO modulation interval
      if (activeVoice.lfoInterval) {
        clearInterval(activeVoice.lfoInterval)
      }

      // Dispose envelope modulator and its signal
      if (activeVoice.envelopeModulator) {
        activeVoice.envelopeModulator.dispose()
      }
      if (activeVoice.envelopeSignal) {
        activeVoice.envelopeSignal.dispose()
      }

      activeVoice.fmEngine.dispose()
      activeVoice.lfoEngine.dispose()
      this.activeVoices.delete(voiceId)
      this.voicePool.release(voiceId)
    }
  }

  /**
   * Met à jour la référence du preset actuel sans arrêter les voix
   * Utilisé pour les changements de paramètres en temps réel
   */
  updateCurrentPresetReference(preset: Preset): void {
    this.currentPreset = preset
  }

  /**
   * Charge un preset
   */
  loadPreset(preset: Preset): void {
    // Arrêter toutes les voix actives
    this.stopAll()

    this.currentPreset = preset
    this.masterGain.gain.value = preset.masterVolume

    // Configure filter
    this.pipeline.setFilterType(preset.filter.type)
    this.pipeline.setFilterCutoff(preset.filter.cutoff)
    this.pipeline.setFilterResonance(preset.filter.resonance)

    // Configure master effects
    this.pipeline.setReverbWet(preset.masterEffects.reverbWet)
    this.pipeline.setReverbDecay(preset.masterEffects.reverbDecay)
    this.pipeline.setReverbPreDelay(preset.masterEffects.reverbPreDelay)
    this.pipeline.setDelayWet(preset.masterEffects.delayWet)
    this.pipeline.setDelayTime(preset.masterEffects.delayTime)
    this.pipeline.setDelayFeedback(preset.masterEffects.delayFeedback)
    this.pipeline.setChorusWet(preset.masterEffects.chorusWet)
    this.pipeline.setChorusFrequency(preset.masterEffects.chorusFrequency)
    this.pipeline.setChorusDepth(preset.masterEffects.chorusDepth)
    this.pipeline.setDistortionWet(preset.masterEffects.distortionWet)
    this.pipeline.setDistortionAmount(preset.masterEffects.distortionAmount)

    // Configure stereo width
    // REMOVED: stereoWidth parameter not in UI
    // if (preset.stereoWidth.enabled) {
    //   this.pipeline.setStereoWidth(preset.stereoWidth.width)
    // } else {
      this.pipeline.setStereoWidth(100) // Normal stereo (default)
    // }

    // Configure noise envelope with Operator 1 ADSR settings
    if (this.noiseEnvelope && preset.operators[0]) {
      this.noiseEnvelope.attack = preset.operators[0].attack
      this.noiseEnvelope.decay = preset.operators[0].decay
      this.noiseEnvelope.sustain = preset.operators[0].sustain
      this.noiseEnvelope.release = preset.operators[0].release
    }

    // Create global LFO engine for visualization
    if (this.globalLFOEngine) {
      this.globalLFOEngine.dispose()
    }
    this.globalLFOEngine = new LFOEngine(preset.lfos)

    // Start global LFO modulation loop (for noise, filter, effects)
    this.startGlobalLFOModulation()

    // Setup envelope follower
    // this.setupEnvelopeFollower(preset.envelopeFollower) // REMOVED: envelopeFollower not in UI

    // Setup step sequencer
    // this.setupStepSequencer(preset.stepSequencer) // REMOVED: stepSequencer not in UI

    console.log(`✅ Preset loaded: ${preset.name} (Algorithm ${String(preset.algorithm)})`)
    console.log(
      `   Filter: ${preset.filter.type} @ ${String(preset.filter.cutoff)}Hz, Q=${String(preset.filter.resonance)}`
    )
  }

  /**
   * Récupère le preset actuellement chargé
   */
  getCurrentPreset(): Preset | null {
    return this.currentPreset
  }

  /**
   * Change l'algorithm du preset actuel
   */
  setAlgorithm(algorithm: AlgorithmType): void {
    if (this.currentPreset) {
      this.currentPreset.algorithm = algorithm
      // Appliquer à toutes les voix actives
      this.activeVoices.forEach((activeVoice) => {
        activeVoice.fmEngine.setAlgorithm(algorithm)
      })
    }
  }

  /**
   * Arrête toutes les voix
   */
  stopAll(): void {
    this.activeVoices.forEach((activeVoice) => {
      activeVoice.fmEngine.noteOff()
    })

    // Cleanup après un délai
    setTimeout(() => {
      this.activeVoices.forEach((_, voiceId) => {
        this.releaseVoice(voiceId)
      })
    }, 2000)
  }

  /**
   * Mute/Unmute
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted
    this.masterGain.gain.value = muted ? 0 : this.currentPreset?.masterVolume ?? 0.7
  }

  /**
   * Master volume
   */
  setMasterVolume(volume: number): void {
    if (this.currentPreset) {
      this.currentPreset.masterVolume = volume
    }
    if (!this.isMuted) {
      this.masterGain.gain.value = volume
    }
  }

  /**
   * Noise Generator Controls
   */
  setNoiseType(type: 'white' | 'pink' | 'brown'): void {
    if (this.noiseSource) {
      this.noiseSource.type = type
    }
  }

  setNoiseLevel(level: number): void {
    this.baseNoiseLevel = level
    if (this.noiseGain) {
      // level is 0-100, convert to 0-1
      this.noiseGain.gain.value = level / 100
    }
  }

  setNoiseFilterCutoff(cutoff: number): void {
    this.baseNoiseFilterCutoff = cutoff
    if (this.noiseFilter) {
      this.noiseFilter.frequency.value = cutoff
    }
  }

  setNoiseFilterResonance(resonance: number): void {
    this.baseNoiseFilterResonance = resonance
    if (this.noiseFilter) {
      this.noiseFilter.Q.value = resonance
    }
  }

  /**
   * Set envelope modulation destinations
   */
  setEnvelopeDestinations(destinations: LFODestination[]): void {
    this.envelopeDestinations = destinations
    console.log(`🎛️ Envelope destinations updated:`, destinations)
  }

  /**
   * État actuel
   */
  getState(): AudioEngineState {
    return {
      isStarted: audioContext.started,
      activeVoices: this.activeVoices.size,
      maxVoices: 8,
      currentPreset: this.currentPreset,
      isMuted: this.isMuted,
    }
  }

  /**
   * Get audio pipeline (for visualisation)
   */
  getPipeline(): AudioPipeline {
    return this.pipeline
  }

  /**
   * Get global LFO engine (for visualisation)
   */
  getGlobalLFOEngine(): LFOEngine | null {
    return this.globalLFOEngine
  }

  /**
   * Get current modulated parameter values (for Live View)
   * Returns an object with parameter values after LFO modulation is applied
   */
  getModulatedValues(): Record<string, number> {
    if (!this.globalLFOEngine || !this.currentPreset) {
      return {}
    }

    const modulatedValues: Record<string, number> = {}

    // Get current LFO values (-1 to 1)
    const lfo1 = this.globalLFOEngine.getLFO1Value()
    const lfo2 = this.globalLFOEngine.getLFO2Value()
    const lfo3 = this.globalLFOEngine.getLFO3Value()
    const lfo4 = this.globalLFOEngine.getLFO4Value()

    // Helper function to apply LFO modulation to a parameter
    const applyLFOModulation = (
      baseValue: number,
      destination: LFODestination,
      range: number
    ): number => {
      let modulatedValue = baseValue

      // Check each LFO to see if it's modulating this destination
      if (this.currentPreset!.lfos[0].destination === destination) {
        modulatedValue += lfo1 * range
      }
      if (this.currentPreset!.lfos[1].destination === destination) {
        modulatedValue += lfo2 * range
      }
      if (this.currentPreset!.lfos[2].destination === destination) {
        modulatedValue += lfo3 * range
      }
      if (this.currentPreset!.lfos[3].destination === destination) {
        modulatedValue += lfo4 * range
      }

      return modulatedValue
    }

    // Filter parameters
    modulatedValues.filterCutoff = Math.max(
      20,
      Math.min(
        20000,
        applyLFOModulation(
          this.currentPreset.filter.cutoff,
          LFODestination.FILTER_CUTOFF,
          5000
        )
      )
    )

    modulatedValues.filterResonance = Math.max(
      0.1,
      Math.min(
        20,
        applyLFOModulation(
          this.currentPreset.filter.resonance,
          LFODestination.FILTER_RESONANCE,
          5
        )
      )
    )

    // Operator levels (0-100)
    for (let i = 0; i < 4; i++) {
      const baseLevel = this.currentPreset.operators[i].level
      let destination: LFODestination
      switch (i) {
        case 0:
          destination = LFODestination.OP1_LEVEL
          break
        case 1:
          destination = LFODestination.OP2_LEVEL
          break
        case 2:
          destination = LFODestination.OP3_LEVEL
          break
        case 3:
          destination = LFODestination.OP4_LEVEL
          break
        default:
          continue
      }

      modulatedValues[`op${i + 1}Level`] = Math.max(
        0,
        Math.min(100, applyLFOModulation(baseLevel, destination, 50))
      )
    }

    // Operator ratios
    for (let i = 0; i < 4; i++) {
      const baseRatio = this.currentPreset.operators[i].ratio
      let destination: LFODestination
      switch (i) {
        case 0:
          destination = LFODestination.OP1_RATIO
          break
        case 1:
          destination = LFODestination.OP2_RATIO
          break
        case 2:
          destination = LFODestination.OP3_RATIO
          break
        case 3:
          destination = LFODestination.OP4_RATIO
          break
        default:
          continue
      }

      modulatedValues[`op${i + 1}Ratio`] = Math.max(
        0.1,
        Math.min(32, applyLFOModulation(baseRatio, destination, 2))
      )
    }

    // Effects
    modulatedValues.reverbWet = Math.max(
      0,
      Math.min(
        1,
        applyLFOModulation(
          this.currentPreset.masterEffects.reverbWet,
          LFODestination.FX_REVERB_WET,
          0.5
        )
      )
    )

    modulatedValues.delayWet = Math.max(
      0,
      Math.min(
        1,
        applyLFOModulation(
          this.currentPreset.masterEffects.delayWet,
          LFODestination.FX_DELAY_WET,
          0.5
        )
      )
    )

    modulatedValues.chorusWet = Math.max(
      0,
      Math.min(
        1,
        applyLFOModulation(
          this.currentPreset.masterEffects.chorusWet,
          LFODestination.FX_CHORUS_WET,
          0.5
        )
      )
    )

    // Synth engine parameters
    modulatedValues.detune = Math.max(
      0,
      Math.min(
        100,
        applyLFOModulation(this.baseSynthDetune, LFODestination.SYNTH_DETUNE, 50)
      )
    )

    modulatedValues.fmIndex = Math.max(
      0,
      Math.min(
        200,
        applyLFOModulation(
          this.baseSynthFmIndex,
          LFODestination.SYNTH_FM_INDEX,
          100
        )
      )
    )

    modulatedValues.brightness = Math.max(
      -12,
      Math.min(
        12,
        applyLFOModulation(
          this.baseSynthBrightness,
          LFODestination.SYNTH_BRIGHTNESS,
          6
        )
      )
    )

    // Noise parameters
    modulatedValues.noiseLevel = Math.max(
      0,
      Math.min(
        100,
        applyLFOModulation(
          this.baseNoiseLevel,
          LFODestination.NOISE_LEVEL,
          50
        )
      )
    )

    modulatedValues.noiseFilterCutoff = Math.max(
      20,
      Math.min(
        20000,
        applyLFOModulation(
          this.baseNoiseFilterCutoff,
          LFODestination.NOISE_FILTER_CUTOFF,
          5000
        )
      )
    )

    return modulatedValues
  }

  /**
   * Setup envelope follower
   */
  // private setupEnvelopeFollower // REMOVED
  private _unused_setupEnvelopeFollower(params: any /* EnvelopeFollowerParams removed */): void {
    // Stop existing envelope follower interval
    if (this.envelopeFollowerInterval) {
      clearInterval(this.envelopeFollowerInterval)
      this.envelopeFollowerInterval = null
    }

    if (!params.enabled) {
      return
    }

    // Configure follower smoothing
    this.pipeline.setFollowerSmoothing(params.smoothing)

    // Poll envelope follower value every 10ms and apply modulation
    this.envelopeFollowerInterval = setInterval(() => {
      if (!this.currentPreset) return

      // Get current amplitude from follower (0-1)
      const amplitude = this.pipeline.getFollowerValue()

      // Scale by depth (-1 to 1 range)
      const modulationValue = (amplitude - 0.5) * 2 * (params.depth / 100)

      // Apply modulation to all active voices
      this.activeVoices.forEach((activeVoice) => {
        this.applyLFOModulation(params.destination, modulationValue, activeVoice.fmEngine)
      })

      // Also apply to global effects (filter, master FX)
      this.applyLFOModulation(params.destination, modulationValue, null as any)
    }, 10)
  }

  /**
   * Setup step sequencer
   */
  // private setupStepSequencer // REMOVED
  private _unused_setupStepSequencer(params: any /* StepSequencerParams removed */): void {
    // Stop existing step sequencer interval
    if (this.stepSequencerInterval) {
      clearInterval(this.stepSequencerInterval)
      this.stepSequencerInterval = null
    }

    if (!params.enabled || params.steps.length === 0) {
      return
    }

    // Reset step index
    this.stepSequencerCurrentStep = 0

    // Calculate interval time based on rate (Hz)
    const intervalMs = 1000 / params.rate

    // Poll step sequencer and apply modulation
    this.stepSequencerInterval = setInterval(() => {
      if (!this.currentPreset) return

      // Get current step value (0-100)
      const stepValue = params.steps[this.stepSequencerCurrentStep] ?? 50

      // Normalize to -1 to 1 range and scale by depth
      const modulationValue = ((stepValue / 100) - 0.5) * 2 * (params.depth / 100)

      // Apply modulation to all active voices
      this.activeVoices.forEach((activeVoice) => {
        this.applyLFOModulation(params.destination, modulationValue, activeVoice.fmEngine)
      })

      // Also apply to global effects (filter, master FX)
      this.applyLFOModulation(params.destination, modulationValue, null as any)

      // Advance to next step
      this.stepSequencerCurrentStep = (this.stepSequencerCurrentStep + 1) % params.steps.length
    }, intervalMs)
  }

  /**
   * Update operator parameters live (without stopping notes)
   */
  updateOperatorParams(index: 0 | 1 | 2 | 3, params: Partial<import('./types').OperatorParams>): void {
    if (!this.currentPreset) return

    // Update current preset
    this.currentPreset.operators[index] = { ...this.currentPreset.operators[index]!, ...params }

    // Update all active voices
    this.activeVoices.forEach((activeVoice) => {
      activeVoice.fmEngine.updateOperator(index, params)
    })

    // Update noise envelope when Operator 1 ADSR changes
    if (index === 0 && this.noiseEnvelope) {
      if (params.attack !== undefined) this.noiseEnvelope.attack = params.attack
      if (params.decay !== undefined) this.noiseEnvelope.decay = params.decay
      if (params.sustain !== undefined) this.noiseEnvelope.sustain = params.sustain
      if (params.release !== undefined) this.noiseEnvelope.release = params.release
    }

    // Update envelope modulators for all active voices when Operator 1 ADSR changes
    if (index === 0) {
      this.activeVoices.forEach((activeVoice) => {
        if (activeVoice.envelopeModulator) {
          if (params.attack !== undefined) activeVoice.envelopeModulator.attack = params.attack
          if (params.decay !== undefined) activeVoice.envelopeModulator.decay = params.decay
          if (params.sustain !== undefined) activeVoice.envelopeModulator.sustain = params.sustain
          if (params.release !== undefined) activeVoice.envelopeModulator.release = params.release
        }
      })
    }
  }

  /**
   * Update LFO parameters live (without stopping notes)
   */
  updateLFOParams(index: 0 | 1 | 2 | 3, params: Partial<import('./types').LFOParams>): void {
    if (!this.currentPreset) return

    // Update current preset
    this.currentPreset.lfos[index] = { ...this.currentPreset.lfos[index]!, ...params }

    // Update global LFO engine (without recreating - preserves phase)
    if (this.globalLFOEngine) {
      this.globalLFOEngine.updateLFO(index, params)
    }

    // Update all active voice LFO engines (without recreating - preserves phase)
    this.activeVoices.forEach((activeVoice) => {
      activeVoice.lfoEngine.updateLFO(index, params)
    })

    console.log(`✅ LFO ${index} updated live: rate=${params.rate ?? 'unchanged'}, depth=${params.depth ?? 'unchanged'}`)
  }

  /**
   * Update filter parameters live (without stopping notes)
   */
  updateFilterParams(params: Partial<import('./types').FilterParams>): void {
    if (!this.currentPreset) return

    // Update current preset
    this.currentPreset.filter = { ...this.currentPreset.filter, ...params }

    // Apply to pipeline
    if (params.type !== undefined) {
      this.pipeline.setFilterType(params.type)
    }
    if (params.cutoff !== undefined) {
      this.pipeline.setFilterCutoff(params.cutoff)
    }
    if (params.resonance !== undefined) {
      this.pipeline.setFilterResonance(params.resonance)
    }
  }

  /**
   * Update master effects parameters live (without stopping notes)
   */
  updateMasterEffectsParams(params: Partial<import('./types').MasterEffectsParams>): void {
    if (!this.currentPreset) return

    // Update current preset
    this.currentPreset.masterEffects = { ...this.currentPreset.masterEffects, ...params }

    // Apply to pipeline
    if (params.reverbWet !== undefined) {
      this.pipeline.setReverbWet(params.reverbWet)
    }
    if (params.reverbDecay !== undefined) {
      this.pipeline.setReverbDecay(params.reverbDecay)
    }
    if (params.reverbPreDelay !== undefined) {
      this.pipeline.setReverbPreDelay(params.reverbPreDelay)
    }
    if (params.delayWet !== undefined) {
      this.pipeline.setDelayWet(params.delayWet)
    }
    if (params.delayTime !== undefined) {
      this.pipeline.setDelayTime(params.delayTime)
    }
    if (params.delayFeedback !== undefined) {
      this.pipeline.setDelayFeedback(params.delayFeedback)
    }
    if (params.chorusWet !== undefined) {
      this.pipeline.setChorusWet(params.chorusWet)
    }
    if (params.chorusFrequency !== undefined) {
      this.pipeline.setChorusFrequency(params.chorusFrequency)
    }
    if (params.chorusDepth !== undefined) {
      this.pipeline.setChorusDepth(params.chorusDepth)
    }
    if (params.distortionWet !== undefined) {
      this.pipeline.setDistortionWet(params.distortionWet)
    }
    if (params.distortionAmount !== undefined) {
      this.pipeline.setDistortionAmount(params.distortionAmount)
    }
  }

  /**
   * Update synth engine parameters live (without stopping notes)
   */
  updateSynthEngineParams(params: Partial<import('./types').SynthEngineParams>): void {
    if (!this.currentPreset) return

    // Update current preset
    this.currentPreset.synthEngine = { ...this.currentPreset.synthEngine, ...params }

    // Update base values for LFO modulation
    if (params.detune !== undefined) {
      this.baseSynthDetune = params.detune
      // Apply detune to all active voices
      this.activeVoices.forEach((activeVoice) => {
        activeVoice.fmEngine.applyPitchModulation(params.detune!)
      })
    }

    if (params.fmIndex !== undefined) {
      this.baseSynthFmIndex = params.fmIndex
      // Apply FM index scaling to all active voices
      const scaleFactor = params.fmIndex / 100
      this.activeVoices.forEach((activeVoice) => {
        for (let i = 0; i < 4; i++) {
          const baseLevel = this.currentPreset!.operators[i].level
          activeVoice.fmEngine.applyOperatorLevelModulation(i, baseLevel, (scaleFactor - 1))
        }
      })
    }

    if (params.brightness !== undefined) {
      this.baseSynthBrightness = params.brightness
      // Apply brightness via filter cutoff adjustment
      const cutoffMultiplier = Math.pow(10, params.brightness / 20)
      this.pipeline.applyFilterCutoffModulation(
        this.currentPreset.filter.cutoff,
        (cutoffMultiplier - 1)
      )
    }

    if (params.feedback !== undefined) {
      this.baseSynthFeedback = params.feedback
      // Apply feedback to all active voices
      this.activeVoices.forEach((activeVoice) => {
        activeVoice.fmEngine.setFeedback(params.feedback!)
      })
    }

    if (params.subOscLevel !== undefined) {
      this.baseSynthSubOscLevel = params.subOscLevel
      // Apply sub osc level to all active voices
      this.activeVoices.forEach((activeVoice) => {
        activeVoice.fmEngine.setSubOscLevel(params.subOscLevel!)
      })
    }

    if (params.stereoSpread !== undefined) {
      this.baseSynthStereoSpread = params.stereoSpread
      // Apply stereo spread to all active voices with random panning
      this.activeVoices.forEach((activeVoice, voiceId) => {
        // Use voice ID to create deterministic but varied panning
        const spreadAmount = params.stereoSpread! / 100
        const panOffset = ((voiceId % 8) - 3.5) / 3.5 // Range: -1 to +1
        const panPosition = panOffset * spreadAmount * 100
        activeVoice.fmEngine.setStereoSpread(panPosition)
      })
    }
  }

  /**
   * Update stereo width parameters live (without stopping notes)
   */
  updateStereoWidthParams(params: any /* StereoWidthParams removed */): void {
    // REMOVED: stereoWidth parameter not in UI
    // Method kept for backwards compatibility but does nothing
    return
  }

  /**
   * Update envelope follower parameters live (without stopping notes)
   */
  updateEnvelopeFollowerParams(params: any /* EnvelopeFollowerParams removed */): void {
    // REMOVED: envelopeFollower parameter not in UI
    // Method kept for backwards compatibility but does nothing
    return
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.stopAll()
    this.stopGlobalLFOModulation()
    if (this.envelopeFollowerInterval) {
      clearInterval(this.envelopeFollowerInterval)
    }
    if (this.stepSequencerInterval) {
      clearInterval(this.stepSequencerInterval)
    }
    this.masterGain.dispose()
    this.pipeline.dispose()
    this.voicePool.dispose()
    if (this.globalLFOEngine) {
      this.globalLFOEngine.dispose()
    }
    AudioEngine.instance = null
  }
}

// Export singleton
export const audioEngine = AudioEngine.getInstance()
