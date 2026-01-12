/**
 * FM Engine
 * Moteur FM 4 opérateurs avec 8 algorithms DX7-style
 */

import * as Tone from 'tone'
import { FMOperator } from './FMOperator'
import { AlgorithmType, OperatorParams } from './types'

export class FMEngine {
  private operators: [FMOperator, FMOperator, FMOperator, FMOperator]
  private algorithm: AlgorithmType
  private output: Tone.Gain
  private feedbackGain: Tone.Gain | null = null

  constructor(
    operatorParams: [OperatorParams, OperatorParams, OperatorParams, OperatorParams],
    algorithm: AlgorithmType = AlgorithmType.SERIAL
  ) {
    this.algorithm = algorithm

    // Créer 4 opérateurs
    this.operators = [
      new FMOperator(operatorParams[0]),
      new FMOperator(operatorParams[1]),
      new FMOperator(operatorParams[2]),
      new FMOperator(operatorParams[3]),
    ]

    // Output gain (master)
    this.output = new Tone.Gain(0.5)

    // Setup routing selon algorithm
    this.setupRouting()
  }

  /**
   * Configure le routing des opérateurs selon l'algorithm
   */
  private setupRouting(): void {
    // Utiliser 440 Hz par défaut pour l'initialisation
    this.setupRoutingWithFrequency(440)
  }

  /**
   * Change l'algorithm et reconfigure le routing
   */
  setAlgorithm(algorithm: AlgorithmType): void {
    if (this.algorithm !== algorithm) {
      this.algorithm = algorithm
      this.setupRouting()
    }
  }

  /**
   * Met à jour le routing FM pour une fréquence de note spécifique
   * Permet le scaling FM correct - doit être appelé avec la fréquence réelle de la note
   * @param noteFrequency La fréquence de la note en Hz
   */
  updateRoutingForFrequency(noteFrequency: number): void {
    this.setupRoutingWithFrequency(noteFrequency)
  }

  /**
   * Configure le routing avec une fréquence de note spécifique
   * Permet le scaling FM correct basé sur la fréquence réelle
   */
  private setupRoutingWithFrequency(noteFrequency: number): void {
    // Déconnecter tout d'abord
    this.operators.forEach((op) => {
      op.disconnect()
      op.disconnectFM()
    })
    this.output.disconnect()

    const [op1, op2, op3, op4] = this.operators

    switch (this.algorithm) {
      case AlgorithmType.SERIAL: {
        // SERIAL: 4→3→2→1→OUT (Pure serial FM, metallic/bell tones)
        const freq1 = noteFrequency * op1.getParams().ratio
        const freq2 = noteFrequency * op2.getParams().ratio
        const freq3 = noteFrequency * op3.getParams().ratio
        op4.connectToFrequency(op3.frequencyParam, freq3)
        op3.connectToFrequency(op2.frequencyParam, freq2)
        op2.connectToFrequency(op1.frequencyParam, freq1)
        op1.connect(this.output)
        break
      }

      case AlgorithmType.PARALLEL:
        // PARALLEL: 4+3+2+1→OUT (All parallel, warm/organ tones)
        // No FM connections - all operators output to audio
        op1.connect(this.output)
        op2.connect(this.output)
        op3.connect(this.output)
        op4.connect(this.output)
        break

      case AlgorithmType.DUAL_SERIAL: {
        // DUAL_SERIAL: (4→3)+(2→1)→OUT (Two serial chains, complex harmonics)
        const freq1 = noteFrequency * op1.getParams().ratio
        const freq3 = noteFrequency * op3.getParams().ratio
        op4.connectToFrequency(op3.frequencyParam, freq3)
        op3.connect(this.output)
        op2.connectToFrequency(op1.frequencyParam, freq1)
        op1.connect(this.output)
        break
      }

      case AlgorithmType.FAN_OUT: {
        // FAN_OUT: 4→(3+2+1)→OUT (One master modulator, rich modulation)
        const freq1 = noteFrequency * op1.getParams().ratio
        const freq2 = noteFrequency * op2.getParams().ratio
        const freq3 = noteFrequency * op3.getParams().ratio
        op4.connectToFrequency(op3.frequencyParam, freq3)
        op4.connectToFrequency(op2.frequencyParam, freq2)
        op4.connectToFrequency(op1.frequencyParam, freq1)
        op3.connect(this.output)
        op2.connect(this.output)
        op1.connect(this.output)
        break
      }

      case AlgorithmType.SPLIT: {
        // SPLIT: (4+3)→2→1→OUT (Dual modulators to carrier, thick textures)
        const freq1 = noteFrequency * op1.getParams().ratio
        const freq2 = noteFrequency * op2.getParams().ratio
        op4.connectToFrequency(op2.frequencyParam, freq2)
        op3.connectToFrequency(op2.frequencyParam, freq2) // LE FIX CRITIQUE!
        op2.connectToFrequency(op1.frequencyParam, freq1)
        op1.connect(this.output)
        break
      }

      default:
        console.warn(`Unknown algorithm: ${String(this.algorithm)}, using SERIAL`)
        this.algorithm = AlgorithmType.SERIAL
        this.setupRoutingWithFrequency(noteFrequency)
    }

    console.log(
      `✅ FM routing établi pour ${noteFrequency.toFixed(2)} Hz (Algorithm ${String(this.algorithm)})`
    )
  }

  /**
   * Déclenche une note
   */
  noteOn(frequency: number, velocity = 100): void {
    this.operators.forEach((op) => {
      op.trigger(frequency, velocity)
    })
  }

  /**
   * Déclenche une note avec portamento (glide from startFreq to endFreq)
   */
  noteOnWithPortamento(startFreq: number, endFreq: number, glideTime: number, velocity = 100): void {
    this.operators.forEach((op) => {
      op.triggerWithPortamento(startFreq, endFreq, glideTime, velocity)
    })
  }

  /**
   * Relâche la note
   */
  noteOff(): void {
    this.operators.forEach((op) => {
      op.release()
    })
  }

  /**
   * Apply pitch modulation to all operators (vibrato)
   */
  applyPitchModulation(cents: number): void {
    this.operators.forEach((op) => {
      op.applyPitchModulation(cents)
    })
  }

  /**
   * Apply amplitude modulation to all operators (tremolo)
   */
  applyAmplitudeModulation(multiplier: number): void {
    this.operators.forEach((op) => {
      op.applyAmplitudeModulation(multiplier)
    })
  }

  /**
   * Apply level modulation to a specific operator
   */
  applyOperatorLevelModulation(
    operatorIndex: 0 | 1 | 2 | 3,
    baseLevel: number,
    modulationValue: number
  ): void {
    this.operators[operatorIndex].applyLevelModulation(baseLevel, modulationValue)
  }

  /**
   * Apply ratio modulation to a specific operator
   */
  applyOperatorRatioModulation(
    operatorIndex: 0 | 1 | 2 | 3,
    baseRatio: number,
    modulationValue: number
  ): void {
    this.operators[operatorIndex].applyRatioModulation(baseRatio, modulationValue)
  }

  /**
   * Apply pan modulation to all operators (auto-pan)
   */
  applyPanModulation(panValue: number): void {
    this.operators.forEach((op) => {
      op.applyPanModulation(panValue)
    })
  }

  /**
   * Mise à jour paramètres opérateur
   */
  updateOperator(index: 0 | 1 | 2 | 3, params: Partial<OperatorParams>): void {
    this.operators[index].updateParams(params)
  }

  /**
   * Connecte le FM engine à une destination
   */
  connect(destination: Tone.ToneAudioNode): void {
    this.output.connect(destination as Tone.InputNode)
  }

  /**
   * Déconnecte le FM engine
   */
  disconnect(): void {
    this.output.disconnect()
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.operators.forEach((op) => { op.dispose(); })
    this.output.dispose()
    if (this.feedbackGain) {
      this.feedbackGain.dispose()
    }
  }
}
