/**
 * LFO Engine
 * Système de 4 LFOs avec combinaison par paires
 * Paire 1 (LFO 1+2) → Pitch modulation
 * Paire 2 (LFO 3+4) → Amplitude modulation
 */

import * as Tone from 'tone'
import { LFOParams, LFOCombineMode, WaveformType } from './types'

export class LFO {
  private params: LFOParams
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
      // TODO: Implémenter tempo sync dans Phase 2
    }
  }

  /**
   * Calcule la valeur du waveform à un temps donné
   */
  private computeWaveform(t: number): number {
    const phase = (t * this.params.rate * Math.PI * 2 + this.phase) % (Math.PI * 2)

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
 * LFO Engine avec 4 LFOs et combinaison par paires
 * Paire 1 (LFO 1+2) → Pitch modulation
 * Paire 2 (LFO 3+4) → Amplitude modulation
 */
export class LFOEngine {
  private lfos: [LFO, LFO, LFO, LFO]
  private combineMode: LFOCombineMode

  constructor(
    lfoParams: [LFOParams, LFOParams, LFOParams, LFOParams],
    combineMode: LFOCombineMode = LFOCombineMode.ADD
  ) {
    this.combineMode = combineMode

    // Créer 4 LFOs
    this.lfos = [
      new LFO(lfoParams[0]),
      new LFO(lfoParams[1]),
      new LFO(lfoParams[2]),
      new LFO(lfoParams[3]),
    ]

    console.log('✅ LFO Engine created with pairing system')
  }

  /**
   * Calcule la valeur combinée d'une paire de LFOs
   */
  private computePairValue(lfo1: LFO, lfo2: LFO): number {
    const val1 = lfo1.getValue()
    const val2 = lfo2.getValue()

    switch (this.combineMode) {
      case LFOCombineMode.ADD:
        // ADD: moyenne des deux LFOs (clamped -1 to 1)
        return Math.max(-1, Math.min(1, (val1 + val2) / 2))

      case LFOCombineMode.MULTIPLY:
        // MULTIPLY: produit des deux LFOs
        return val1 * val2

      case LFOCombineMode.MIN:
        // MIN: minimum des deux LFOs
        return Math.min(val1, val2)

      case LFOCombineMode.MAX:
        // MAX: maximum des deux LFOs
        return Math.max(val1, val2)

      default:
        return val1
    }
  }

  /**
   * Update combine mode
   */
  updateCombineMode(mode: LFOCombineMode): void {
    this.combineMode = mode
    console.log(`✅ LFO combine mode: ${mode}`)
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
   * Récupère la valeur combinée de la Paire 1 (LFO 1+2) pour pitch modulation
   */
  getPair1Value(): number {
    return this.computePairValue(this.lfos[0], this.lfos[1])
  }

  /**
   * Récupère la valeur combinée de la Paire 2 (LFO 3+4) pour amplitude modulation
   */
  getPair2Value(): number {
    return this.computePairValue(this.lfos[2], this.lfos[3])
  }

  /**
   * Récupère la valeur combinée actuelle (legacy - maintenant utilise Paire 1)
   * @deprecated Utiliser getPair1Value() ou getPair2Value() à la place
   */
  getCombinedValue(): number {
    return this.getPair1Value()
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.lfos.forEach((lfo) => { lfo.dispose(); })
  }
}
