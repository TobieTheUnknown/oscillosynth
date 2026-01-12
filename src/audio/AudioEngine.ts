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
import { Preset, AlgorithmType, AudioEngineState, LFODestination } from './types'

interface ActiveVoice {
  voice: Voice
  fmEngine: FMEngine
  lfoEngine: LFOEngine
  lfoInterval: ReturnType<typeof setInterval> | null
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

  private constructor() {
    this.voicePool = new VoicePool(8) // Max 8 voix

    // Master gain
    this.masterGain = new Tone.Gain(0.7)

    // Audio pipeline (filter + limiter + analyser)
    this.pipeline = new AudioPipeline()

    // Routing: masterGain → pipeline → destination
    this.pipeline.connect(this.masterGain)
    this.pipeline.toDestination()

    console.log('✅ AudioEngine initialized with audio pipeline')
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

    // Créer LFO engine pour cette voix
    const lfoEngine = new LFOEngine(this.currentPreset.lfos, this.currentPreset.lfoCombineMode)

    // Connecter FM engine au master gain
    fmEngine.connect(this.masterGain)

    // Trigger note
    fmEngine.noteOn(frequency, velocity)

    // Setup LFO modulation with dynamic routing
    // Poll LFO values every 10ms and route to appropriate destinations
    const lfoInterval = setInterval(() => {
      // Process each of the 4 LFO pairs
      for (let pairIndex = 1; pairIndex <= 4; pairIndex++) {
        const pairIdx = pairIndex as 1 | 2 | 3 | 4
        const destination = lfoEngine.getPairDestination(pairIdx)
        let value = 0

        // Get pair value
        switch (pairIdx) {
          case 1:
            value = lfoEngine.getPair1Value()
            break
          case 2:
            value = lfoEngine.getPair2Value()
            break
          case 3:
            value = lfoEngine.getPair3Value()
            break
          case 4:
            value = lfoEngine.getPair4Value()
            break
        }

        // Route to destination
        this.applyLFOModulation(destination, value, fmEngine)
      }
    }, 10)

    // Stocker voix active
    this.activeVoices.set(voice.id, { voice, fmEngine, lfoEngine, lfoInterval })

    // Setup voice release callback
    voice.release = () => {
      this.releaseVoice(voice.id)
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
        activeVoice.fmEngine.noteOff()
        // La voix sera libérée après release time via setTimeout
        setTimeout(() => {
          this.releaseVoice(voiceId)
        }, 2000) // 2s max release time
      }
    })

    console.log(`🎵 Note OFF: ${String(midiNote)}`)
  }

  /**
   * Apply LFO modulation to the appropriate destination
   */
  private applyLFOModulation(
    destination: LFODestination,
    value: number,
    fmEngine: FMEngine
  ): void {
    if (!this.currentPreset) return

    switch (destination) {
      case LFODestination.PITCH:
        // Pitch vibrato: ±50 cents
        fmEngine.applyPitchModulation(value * 50)
        break

      case LFODestination.AMPLITUDE:
        // Amplitude tremolo: 0.1 to 1.9 (±90% with clamp at 0.1 to prevent silence)
        const ampMod = 1 + value * 0.9
        fmEngine.applyAmplitudeModulation(Math.max(0.1, ampMod))
        break

      case LFODestination.FILTER_CUTOFF:
        // Filter cutoff modulation
        this.pipeline.applyFilterCutoffModulation(this.currentPreset.filter.cutoff, value)
        break

      case LFODestination.FILTER_RESONANCE:
        // Filter resonance modulation
        this.pipeline.applyFilterResonanceModulation(this.currentPreset.filter.resonance, value)
        break

      case LFODestination.OP1_LEVEL:
        fmEngine.applyOperatorLevelModulation(0, this.currentPreset.operators[0].level, value)
        break

      case LFODestination.OP2_LEVEL:
        fmEngine.applyOperatorLevelModulation(1, this.currentPreset.operators[1].level, value)
        break

      case LFODestination.OP3_LEVEL:
        fmEngine.applyOperatorLevelModulation(2, this.currentPreset.operators[2].level, value)
        break

      case LFODestination.OP4_LEVEL:
        fmEngine.applyOperatorLevelModulation(3, this.currentPreset.operators[3].level, value)
        break

      case LFODestination.OP1_RATIO:
        fmEngine.applyOperatorRatioModulation(0, this.currentPreset.operators[0].ratio, value)
        break

      case LFODestination.OP2_RATIO:
        fmEngine.applyOperatorRatioModulation(1, this.currentPreset.operators[1].ratio, value)
        break

      case LFODestination.OP3_RATIO:
        fmEngine.applyOperatorRatioModulation(2, this.currentPreset.operators[2].ratio, value)
        break

      case LFODestination.OP4_RATIO:
        fmEngine.applyOperatorRatioModulation(3, this.currentPreset.operators[3].ratio, value)
        break

      default:
        console.warn(`Unknown LFO destination: ${String(destination)}`)
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
      activeVoice.fmEngine.dispose()
      activeVoice.lfoEngine.dispose()
      this.activeVoices.delete(voiceId)
      this.voicePool.release(voiceId)
    }
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

    // Create global LFO engine for visualization
    if (this.globalLFOEngine) {
      this.globalLFOEngine.dispose()
    }
    this.globalLFOEngine = new LFOEngine(preset.lfos, preset.lfoCombineMode)

    console.log(`✅ Preset loaded: ${preset.name} (Algorithm ${String(preset.algorithm)})`)
    console.log(
      `   Filter: ${preset.filter.type} @ ${String(preset.filter.cutoff)}Hz, Q=${String(preset.filter.resonance)}`
    )
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
   * Dispose (cleanup)
   */
  dispose(): void {
    this.stopAll()
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
