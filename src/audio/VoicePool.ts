/**
 * Voice Pool Manager
 * Gère l'allocation de voix avec maximum 8 voix simultanées
 * Voice stealing: LRU (Least Recently Used) algorithm
 */

export interface Voice {
  id: number
  note: number
  velocity: number
  startTime: number
  isActive: boolean
  release?: () => void
}

export class VoicePool {
  private maxVoices: number
  private voices: Map<number, Voice> = new Map()
  private nextVoiceId = 0

  constructor(maxVoices = 8) {
    this.maxVoices = maxVoices
  }

  /**
   * Alloue une nouvelle voix
   * Si max atteint, steal la voix la moins récemment utilisée (LRU)
   */
  allocate(note: number, velocity: number): Voice {
    // Si on a dépassé max voices, steal une voix
    if (this.voices.size >= this.maxVoices) {
      this.stealVoice()
    }

    const voice: Voice = {
      id: this.nextVoiceId++,
      note,
      velocity,
      startTime: performance.now(),
      isActive: true,
    }

    this.voices.set(voice.id, voice)
    return voice
  }

  /**
   * Libère une voix par ID
   */
  release(voiceId: number): void {
    const voice = this.voices.get(voiceId)
    if (voice) {
      voice.isActive = false
      // Appeler release callback si défini
      if (voice.release) {
        voice.release()
      }
      this.voices.delete(voiceId)
    }
  }

  /**
   * Libère toutes les voix jouant une note spécifique
   */
  releaseNote(note: number): void {
    const voicesToRelease: number[] = []

    this.voices.forEach((voice) => {
      if (voice.note === note && voice.isActive) {
        voicesToRelease.push(voice.id)
      }
    })

    voicesToRelease.forEach((id) => { this.release(id); })
  }

  /**
   * Steal la voix la moins récemment utilisée (LRU)
   */
  private stealVoice(): void {
    let oldestVoice: Voice | undefined
    let oldestTime = Infinity

    this.voices.forEach((voice) => {
      if (voice.startTime < oldestTime) {
        oldestTime = voice.startTime
        oldestVoice = voice
      }
    })

    if (oldestVoice) {
      console.log(
        `🔄 Voice stealing: releasing voice ${String(oldestVoice.id)} (note ${String(oldestVoice.note)})`
      )
      this.release(oldestVoice.id)
    }
  }

  /**
   * Trouve une voix par note
   */
  findByNote(note: number): Voice | undefined {
    for (const voice of this.voices.values()) {
      if (voice.note === note && voice.isActive) {
        return voice
      }
    }
    return undefined
  }

  /**
   * Récupère toutes les voix actives
   */
  getActiveVoices(): Voice[] {
    return Array.from(this.voices.values()).filter((v) => v.isActive)
  }

  /**
   * Nombre de voix actives
   */
  get activeCount(): number {
    return this.voices.size
  }

  /**
   * Vérifie si le pool est plein
   */
  get isFull(): boolean {
    return this.voices.size >= this.maxVoices
  }

  /**
   * Libère toutes les voix
   */
  clear(): void {
    this.voices.forEach((voice) => {
      if (voice.release) {
        voice.release()
      }
    })
    this.voices.clear()
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.clear()
  }
}
