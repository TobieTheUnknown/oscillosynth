/**
 * LFO Engine
 * Système de 4 LFOs individuels
 */

import * as Tone from 'tone'
import { LFOParams, WaveformType, LFODestination } from './types'

export class LFO {
  public params: LFOParams // Public pour accès aux destinations
  private startTime: number
  private phase: number

  constructor(params: LFOParams) {
    this.params = params
    this.startTime = Tone.now()
    this.phase = (params.phase / 360) * Math.PI * 2 // Convert degrees to radians
  }

  /**
   * Update parameters en temps réel
   */
  updateParams(params: Partial<LFOParams>): void {
    if (params.waveform !== undefined) {
      this.params.waveform = params.waveform
    }

    if (params.rate !== undefined) {
      this.params.rate = params.rate
    }

    if (params.depth !== undefined) {
      this.params.depth = params.depth
    }

    if (params.phase !== undefined) {
      this.params.phase = params.phase
      this.phase = (params.phase / 360) * Math.PI * 2
    }

    if (params.sync !== undefined) {
      this.params.sync = params.sync
    }

    if (params.syncValue !== undefined) {
      this.params.syncValue = params.syncValue
    }
  }

  /**
   * Convert sync division to frequency in Hz based on current BPM
   */
  private syncDivisionToFrequency(division: string): number {
    const bpm = Tone.Transport.bpm.value
    const bps = bpm / 60 // beats per second

    // Parse division string (e.g., "1/4", "1/8", "1", "2")
    if (division.includes('/')) {
      const parts = division.split('/').map(Number)
      const num = parts[0] ?? 1
      const denom = parts[1] ?? 4
      // 1/4 = quarter note = 1 beat, 1/8 = eighth note = 0.5 beats, etc.
      const beats = (num / denom) * 4 // Convert to beats (4 beats per bar)
      return bps / beats
    } else {
      // Whole numbers represent bars (1 bar = 4 beats)
      const bars = Number(division)
      const beats = bars * 4
      return bps / beats
    }
  }

  /**
   * Calcule la valeur du waveform à un temps donné
   */
  private computeWaveform(t: number): number {
    // Use synced frequency if sync is enabled, otherwise use rate
    const frequency = this.params.sync && this.params.syncValue
      ? this.syncDivisionToFrequency(this.params.syncValue)
      : this.params.rate

    const phase = (t * frequency * Math.PI * 2 + this.phase) % (Math.PI * 2)

    switch (this.params.waveform) {
      case WaveformType.SINE:
        return Math.sin(phase)

      case WaveformType.SQUARE:
        return phase < Math.PI ? 1 : -1

      case WaveformType.SAWTOOTH:
        return (phase / Math.PI - 1)

      case WaveformType.TRIANGLE:
        return phase < Math.PI ? (phase / Math.PI) * 2 - 1 : 3 - (phase / Math.PI) * 2

      default:
        return Math.sin(phase)
    }
  }

  /**
   * Récupère la valeur actuelle du LFO (-1 à 1)
   */
  getValue(): number {
    const now = Tone.now()
    const elapsed = now - this.startTime
    const rawValue = this.computeWaveform(elapsed)

    // Applique depth
    return rawValue * (this.params.depth / 100)
  }

  /**
   * Dispose
   */
  dispose(): void {
    // Rien à disposer pour le moment
  }
}

/**
 * LFO Engine avec 8 LFOs et combinaison par paires
 * Paire 1 (LFO 1+2) → Destination définie dans params
 * Paire 2 (LFO 3+4) → Destination définie dans params
 * Paire 3 (LFO 5+6) → Destination définie dans params
 * Paire 4 (LFO 7+8) → Destination définie dans params
 */
export class LFOEngine {
  private lfos: [LFO, LFO, LFO, LFO]

  constructor(lfoParams: [LFOParams, LFOParams, LFOParams, LFOParams]) {
    // Créer 4 LFOs
    this.lfos = [
      new LFO(lfoParams[0]),
      new LFO(lfoParams[1]),
      new LFO(lfoParams[2]),
      new LFO(lfoParams[3]),
    ]

    console.log('✅ LFO Engine created with 4 individual LFOs')
  }

  /**
   * Update un LFO spécifique
   */
  updateLFO(index: 0 | 1 | 2 | 3, params: Partial<LFOParams>): void {
    this.lfos[index].updateParams(params)
  }

  /**
   * Récupère un LFO spécifique
   */
  getLFO(index: 0 | 1 | 2 | 3): LFO {
    return this.lfos[index]
  }

  /**
   * Récupère la valeur du LFO 1
   */
  getLFO1Value(): number {
    return this.lfos[0].getValue()
  }

  /**
   * Récupère la valeur du LFO 2
   */
  getLFO2Value(): number {
    return this.lfos[1].getValue()
  }

  /**
   * Récupère la valeur du LFO 3
   */
  getLFO3Value(): number {
    return this.lfos[2].getValue()
  }

  /**
   * Récupère la valeur du LFO 4
   */
  getLFO4Value(): number {
    return this.lfos[3].getValue()
  }

  /**
   * Récupère la destination d'un LFO
   */
  getLFODestination(lfoIndex: 0 | 1 | 2 | 3): LFODestination {
    return this.lfos[lfoIndex].params.destination
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.lfos.forEach((lfo) => { lfo.dispose(); })
  }
}
