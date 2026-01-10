/**
 * Audio Engine Principal
 * Orchestre FM Engine, LFO Engine, Voice Pool
 */

import * as Tone from 'tone'
import { audioContext } from './AudioContext'
import { VoicePool, Voice } from './VoicePool'
import { FMEngine } from './FMEngine'
import { LFOEngine } from './LFOEngine'
import { Preset, AlgorithmType, AudioEngineState } from './types'

interface ActiveVoice {
  voice: Voice
  fmEngine: FMEngine
  lfoEngine: LFOEngine
}

export class AudioEngine {
  private static instance: AudioEngine | null = null
  private voicePool: VoicePool
  private activeVoices: Map<number, ActiveVoice> = new Map()
  private masterGain: Tone.Gain
  private currentPreset: Preset | null = null
  private isMuted = false

  private constructor() {
    this.voicePool = new VoicePool(8) // Max 8 voix

    // Master gain → destination
    this.masterGain = new Tone.Gain(0.7).toDestination()

    console.log('✅ AudioEngine initialized')
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

    // Stocker voix active
    this.activeVoices.set(voice.id, { voice, fmEngine, lfoEngine })

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
   * Libère une voix
   */
  private releaseVoice(voiceId: number): void {
    const activeVoice = this.activeVoices.get(voiceId)
    if (activeVoice) {
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

    console.log(`✅ Preset loaded: ${preset.name} (Algorithm ${String(preset.algorithm)})`)
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
   * Dispose (cleanup)
   */
  dispose(): void {
    this.stopAll()
    this.masterGain.dispose()
    this.voicePool.dispose()
    AudioEngine.instance = null
  }
}

// Export singleton
export const audioEngine = AudioEngine.getInstance()
