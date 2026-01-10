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
    algorithm: AlgorithmType = AlgorithmType.ALGO_1
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
    // Déconnecter tout d'abord
    this.operators.forEach((op) => { op.disconnect(); })
    this.output.disconnect()

    // Feedback gain si nécessaire (operator 4)
    if (this.feedbackGain) {
      this.feedbackGain.dispose()
      this.feedbackGain = null
    }

    const [op1, op2, op3, op4] = this.operators

    switch (this.algorithm) {
      case AlgorithmType.ALGO_1:
        // Serial complet: 4→3→2→1→OUT
        op4.connect(op3.frequencyParam)
        op3.connect(op2.frequencyParam)
        op2.connect(op1.frequencyParam)
        op1.connect(this.output)
        break

      case AlgorithmType.ALGO_2:
        // Mixed: (4→3→2)+(4→1)→OUT
        op4.connect(op3.frequencyParam)
        op4.connect(op1.frequencyParam)
        op3.connect(op2.frequencyParam)
        op2.connect(op1.frequencyParam)
        op1.connect(this.output)
        break

      case AlgorithmType.ALGO_3:
        // Dual serial: (4→3)+(2→1)→OUT
        op4.connect(op3.frequencyParam)
        op3.connect(this.output)
        op2.connect(op1.frequencyParam)
        op1.connect(this.output)
        break

      case AlgorithmType.ALGO_4:
        // Parallel complet: 4+3+2+1→OUT
        op1.connect(this.output)
        op2.connect(this.output)
        op3.connect(this.output)
        op4.connect(this.output)
        break

      case AlgorithmType.ALGO_5:
        // Semi-parallel: (4→3)+(2)+(1)→OUT
        op4.connect(op3.frequencyParam)
        op3.connect(this.output)
        op2.connect(this.output)
        op1.connect(this.output)
        break

      case AlgorithmType.ALGO_6:
        // Serial optimisé: (4→3→2→1)→OUT
        // Similaire à ALGO_1 mais avec feedback sur operator 4
        this.feedbackGain = new Tone.Gain(0.5)
        op4.connect(this.feedbackGain)
        this.feedbackGain.connect(op4.frequencyParam)
        op4.connect(op3.frequencyParam)
        op3.connect(op2.frequencyParam)
        op2.connect(op1.frequencyParam)
        op1.connect(this.output)
        break

      case AlgorithmType.ALGO_7:
        // Fan-out: (4→3)+(4→2)+(4→1)→OUT
        op4.connect(op3.frequencyParam)
        op4.connect(op2.frequencyParam)
        op4.connect(op1.frequencyParam)
        op3.connect(this.output)
        op2.connect(this.output)
        op1.connect(this.output)
        break

      case AlgorithmType.ALGO_8:
        // Parallel input: (4+3)→2→1→OUT
        op4.connect(op2.frequencyParam)
        op3.connect(op2.frequencyParam)
        op2.connect(op1.frequencyParam)
        op1.connect(this.output)
        break

      default:
        console.warn(`Unknown algorithm: ${String(this.algorithm)}, using ALGO_1`)
        this.algorithm = AlgorithmType.ALGO_1
        this.setupRouting()
    }

    console.log(`✅ FM Engine routing set to Algorithm ${String(this.algorithm)}`)
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
   * Déclenche une note
   */
  noteOn(frequency: number, velocity = 100): void {
    this.operators.forEach((op) => {
      op.trigger(frequency, velocity)
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
