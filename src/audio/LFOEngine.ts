/**
 * LFO Engine
 * Système de 4 LFOs avec combinaison multiple
 */

import * as Tone from 'tone'
import { LFOParams, LFOCombineMode } from './types'

export class LFO {
  private oscillator: Tone.LFO
  private params: LFOParams
  private outputSignal: Tone.Signal

  constructor(params: LFOParams) {
    this.params = params

    // LFO oscillator (Tone.js uses standard types)
    this.oscillator = new Tone.LFO({
      type: params.waveform as Tone.ToneOscillatorType,
      frequency: params.rate,
      phase: params.phase,
      min: -1,
      max: 1,
    }).start()

    // Output signal (depth control)
    this.outputSignal = new Tone.Signal(0)
    this.oscillator.connect(this.outputSignal)
  }

  /**
   * Update parameters en temps réel
   */
  updateParams(params: Partial<LFOParams>): void {
    if (params.waveform !== undefined) {
      this.params.waveform = params.waveform
      this.oscillator.type = params.waveform as Tone.ToneOscillatorType
    }

    if (params.rate !== undefined) {
      this.params.rate = params.rate
      this.oscillator.frequency.value = params.rate
    }

    if (params.depth !== undefined) {
      this.params.depth = params.depth
    }

    if (params.phase !== undefined) {
      this.params.phase = params.phase
      this.oscillator.phase = params.phase
    }

    if (params.sync !== undefined) {
      this.params.sync = params.sync
      // TODO: Implémenter tempo sync dans Phase 2
    }
  }

  /**
   * Récupère la valeur actuelle du LFO (-1 à 1)
   */
  getValue(): number {
    // Applique depth
    return this.outputSignal.value * (this.params.depth / 100)
  }

  /**
   * Connecte le LFO à un AudioParam
   */
  connect(destination: AudioParam): void {
    this.oscillator.connect(destination)
  }

  /**
   * Déconnecte le LFO
   */
  disconnect(): void {
    this.oscillator.disconnect()
  }

  /**
   * Récupère l'output signal
   */
  get output(): Tone.LFO {
    return this.oscillator
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.oscillator.dispose()
    this.outputSignal.dispose()
  }
}

/**
 * LFO Engine avec 4 LFOs et combinaison
 */
export class LFOEngine {
  private lfos: [LFO, LFO, LFO, LFO]
  private combineMode: LFOCombineMode
  private combinedSignal: Tone.Signal

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

    // Signal combiné
    this.combinedSignal = new Tone.Signal(0)

    // Setup combine mode
    this.updateCombineMode(combineMode)
  }

  /**
   * Calcule la valeur combinée des 4 LFOs
   */
  private computeCombinedValue(): number {
    const values = this.lfos.map((lfo) => lfo.getValue())

    switch (this.combineMode) {
      case LFOCombineMode.ADD:
        // ADD: lfo1 + lfo2 + lfo3 + lfo4 (clamped -1 to 1)
        return Math.max(-1, Math.min(1, values.reduce((sum, v) => sum + v, 0) / 4))

      case LFOCombineMode.MULTIPLY:
        // MULTIPLY: lfo1 * lfo2 * lfo3 * lfo4
        return values.reduce((product, v) => product * v, 1)

      case LFOCombineMode.MIN:
        // MIN: minimum de tous les LFOs
        return Math.min(...values)

      case LFOCombineMode.MAX:
        // MAX: maximum de tous les LFOs
        return Math.max(...values)

      default:
        return values[0] ?? 0
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
   * Récupère la valeur combinée actuelle
   */
  getCombinedValue(): number {
    return this.computeCombinedValue()
  }

  /**
   * Connecte le signal combiné à une destination
   * Note: Pour l'instant, utilise une approche simplifiée
   * Phase 2: Implémenter Web Audio routing complet
   */
  connect(_destination: AudioParam): void {
    // TODO: Implémenter routing combiné complet
    console.warn('LFO combined routing not yet implemented - use individual LFOs')
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.lfos.forEach((lfo) => { lfo.dispose(); })
    this.combinedSignal.dispose()
  }
}
