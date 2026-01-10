/**
 * FM Operator
 * Un seul opérateur FM avec ADSR envelope
 */

import * as Tone from 'tone'
import { OperatorParams } from './types'

export class FMOperator {
  private oscillator: Tone.Oscillator
  private envelope: Tone.AmplitudeEnvelope
  private gain: Tone.Gain
  private baseFrequency: number
  private params: OperatorParams

  constructor(params: OperatorParams) {
    this.params = params
    this.baseFrequency = 440 // Sera mis à jour lors du noteOn

    // Oscillateur (toujours sine pour FM pur)
    this.oscillator = new Tone.Oscillator({
      type: 'sine',
      frequency: this.baseFrequency * params.ratio,
    }).start()

    // ADSR Envelope
    this.envelope = new Tone.AmplitudeEnvelope({
      attack: params.attack,
      decay: params.decay,
      sustain: params.sustain,
      release: params.release,
    })

    // Gain pour level control
    this.gain = new Tone.Gain(params.level / 100)

    // Routing: oscillator → envelope → gain
    this.oscillator.connect(this.envelope)
    this.envelope.connect(this.gain)
  }

  /**
   * Démarre l'opérateur avec une fréquence donnée
   */
  trigger(frequency: number, velocity: number): void {
    this.baseFrequency = frequency
    this.oscillator.frequency.value = frequency * this.params.ratio

    // Velocity affecte le gain
    const velocityGain = velocity / 127
    this.gain.gain.value = (this.params.level / 100) * velocityGain

    // Trigger envelope
    this.envelope.triggerAttack()
  }

  /**
   * Relâche l'opérateur
   */
  release(): void {
    this.envelope.triggerRelease()
  }

  /**
   * Connecte la sortie de cet opérateur à une destination
   */
  connect(destination: Tone.ToneAudioNode | AudioParam): void {
    this.gain.connect(destination as Tone.InputNode)
  }

  /**
   * Déconnecte cet opérateur
   */
  disconnect(): void {
    this.gain.disconnect()
  }

  /**
   * Apply pitch modulation (vibrato) in cents
   */
  applyPitchModulation(cents: number): void {
    this.oscillator.detune.value = cents
  }

  /**
   * Apply amplitude modulation (tremolo) as multiplier
   */
  applyAmplitudeModulation(multiplier: number): void {
    const baseGain = (this.params.level / 100)
    this.gain.gain.value = baseGain * multiplier
  }

  /**
   * Apply operator level modulation
   */
  applyLevelModulation(baseLevel: number, modulationValue: number): void {
    // modulationValue is -1 to 1
    // Map to ±50% of base level
    const modulatedLevel = baseLevel * (1 + modulationValue * 0.5)
    const clampedLevel = Math.max(0, Math.min(100, modulatedLevel))
    this.gain.gain.value = clampedLevel / 100
  }

  /**
   * Apply operator ratio modulation
   */
  applyRatioModulation(baseRatio: number, modulationValue: number): void {
    // modulationValue is -1 to 1
    // Map to ±20% of base ratio
    const modulatedRatio = baseRatio * (1 + modulationValue * 0.2)
    const clampedRatio = Math.max(0.5, Math.min(16, modulatedRatio))
    this.oscillator.frequency.value = this.baseFrequency * clampedRatio
  }

  /**
   * Mise à jour des paramètres en temps réel
   */
  updateParams(params: Partial<OperatorParams>): void {
    if (params.ratio !== undefined) {
      this.params.ratio = params.ratio
      this.oscillator.frequency.value = this.baseFrequency * params.ratio
    }

    if (params.level !== undefined) {
      this.params.level = params.level
      this.gain.gain.value = params.level / 100
    }

    if (params.attack !== undefined) {
      this.params.attack = params.attack
      this.envelope.attack = params.attack
    }

    if (params.decay !== undefined) {
      this.params.decay = params.decay
      this.envelope.decay = params.decay
    }

    if (params.sustain !== undefined) {
      this.params.sustain = params.sustain
      this.envelope.sustain = params.sustain
    }

    if (params.release !== undefined) {
      this.params.release = params.release
      this.envelope.release = params.release
    }
  }

  /**
   * Récupère le signal audio de sortie
   */
  get output(): Tone.Gain {
    return this.gain
  }

  /**
   * Récupère le frequency AudioParam (pour modulation FM)
   */
  get frequencyParam(): AudioParam {
    return this.oscillator.frequency as unknown as AudioParam
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.oscillator.dispose()
    this.envelope.dispose()
    this.gain.dispose()
  }
}
