/**
 * AudioContext Manager
 * Gère l'initialisation et l'unlock de l'AudioContext (Safari/Chrome mobile)
 */

import * as Tone from 'tone'

export class AudioContextManager {
  private static instance: AudioContextManager | null = null
  private isStarted = false
  private listeners: Set<(state: AudioContextState) => void> = new Set()

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager()
    }
    return AudioContextManager.instance
  }

  /**
   * Démarre l'AudioContext
   * DOIT être appelé dans un user gesture handler (click, touch, etc.)
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      console.warn('AudioContext already started')
      return
    }

    try {
      await Tone.start()

      // Optimize latency settings
      const ctx = Tone.getContext()
      ctx.lookAhead = 0.01 // Reduce look-ahead to 10ms (default: 100ms)
      ctx.latencyHint = 'interactive' // Prioritize low latency

      this.isStarted = true
      this.notifyListeners(ctx.state)
      console.log('✅ AudioContext started:', ctx.state)
      console.log('⚡ Latency optimized: lookAhead =', ctx.lookAhead, 's')
    } catch (error: unknown) {
      console.error('❌ Failed to start AudioContext:', error instanceof Error ? error.message : String(error))
      throw new Error('Failed to start audio. Please try again.')
    }
  }

  /**
   * Resume l'AudioContext si suspendu
   */
  async resume(): Promise<void> {
    const ctx = Tone.getContext()
    if (ctx.state === 'suspended') {
      await ctx.rawContext.resume()
      this.notifyListeners(ctx.state)
    }
  }

  /**
   * Suspend l'AudioContext (économie batterie)
   */
  async suspend(): Promise<void> {
    const ctx = Tone.getContext()
    if (ctx.state === 'running') {
      await ctx.rawContext.suspend(0)
      this.notifyListeners(ctx.state)
    }
  }

  /**
   * Vérifie si Web Audio API est supporté
   */
  static isSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined'
  }

  /**
   * État actuel de l'AudioContext
   */
  getState(): AudioContextState {
    return Tone.getContext().state
  }

  /**
   * Vérifie si l'AudioContext est démarré
   */
  get started(): boolean {
    return this.isStarted
  }

  /**
   * Subscribe aux changements d'état
   */
  onStateChange(callback: (state: AudioContextState) => void): () => void {
    this.listeners.add(callback)
    // Retourne fonction de cleanup
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notifyListeners(state: AudioContextState): void {
    this.listeners.forEach((callback) => {
      callback(state)
    })
  }

  /**
   * Cleanup (pour tests)
   */
  dispose(): void {
    this.listeners.clear()
    this.isStarted = false
  }
}

// Export singleton instance
export const audioContext = AudioContextManager.getInstance()
