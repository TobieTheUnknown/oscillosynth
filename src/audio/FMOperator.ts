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
  private fmGain: Tone.Gain // Gain dédié pour connexions FM
  private feedbackGain: Tone.Gain | null = null // Feedback loop (operator 4 only)
  private fmConnections: Set<AudioParam> = new Set() // Tracking des cibles FM
  private static readonly FM_INDEX_MULTIPLIER = 50 // Intensité de modulation
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

    // FM-specific gain node (separate from audio gain)
    this.fmGain = new Tone.Gain(0) // Initial value, updated dynamically

    // Parallel FM signal chain: oscillator → envelope → fmGain
    this.envelope.connect(this.fmGain)

    // Setup feedback loop if feedback parameter exists (typically operator 4)
    if (params.feedback !== undefined && params.feedback > 0) {
      // Feedback gain scales the self-modulation depth
      // Typical range: 0-1, mapped to 0-2000 Hz of modulation depth
      this.feedbackGain = new Tone.Gain(params.feedback * 2000)

      // Create feedback loop: envelope → feedbackGain → oscillator.frequency
      this.envelope.connect(this.feedbackGain)
      this.feedbackGain.connect(this.oscillator.frequency)

      console.log(`✨ Feedback FM enabled: ${params.feedback.toFixed(2)} (${(params.feedback * 2000).toFixed(0)} Hz depth)`)
    }
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
   * Démarre l'opérateur avec portamento (glide from startFreq to endFreq)
   */
  triggerWithPortamento(startFreq: number, endFreq: number, glideTime: number, velocity: number): void {
    this.baseFrequency = endFreq

    // Start at the beginning frequency (with ratio applied)
    this.oscillator.frequency.value = startFreq * this.params.ratio

    // Glide to the target frequency
    this.oscillator.frequency.rampTo(endFreq * this.params.ratio, glideTime)

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
   * Calcule la profondeur de modulation FM en Hz basée sur la fréquence porteuse
   * Formule: carrierFreq × (level/100) × FM_INDEX_MULTIPLIER
   */
  private calculateFMDepth(carrierFrequency: number): number {
    const levelRatio = this.params.level / 100
    const fmDepth = carrierFrequency * levelRatio * FMOperator.FM_INDEX_MULTIPLIER
    return fmDepth
  }

  /**
   * Connecte la sortie de cet opérateur au paramètre de fréquence d'un autre (modulation FM)
   * Calcule et applique le scaling FM approprié basé sur la fréquence porteuse
   * @param frequencyParam The frequency AudioParam to modulate
   * @param carrierFrequency The base frequency of the operator being modulated
   */
  connectToFrequency(frequencyParam: AudioParam, carrierFrequency: number): void {
    // Calculer la profondeur FM pour cette fréquence porteuse
    const fmDepth = this.calculateFMDepth(carrierFrequency)

    // Définir le gain FM pour scaler la modulation correctement
    this.fmGain.gain.value = fmDepth

    // Connecter la chaîne de signal FM au paramètre de fréquence cible
    this.fmGain.connect(frequencyParam)

    // Tracker cette connexion pour mises à jour ultérieures
    this.fmConnections.add(frequencyParam)

    console.log(
      `🔗 Connexion FM: OP ratio=${this.params.ratio} level=${this.params.level} → ` +
        `porteuse=${carrierFrequency.toFixed(2)}Hz, profondeur=${fmDepth.toFixed(2)}Hz`
    )
  }

  /**
   * Déconnecte toutes les connexions FM (appelé lors des changements de routing)
   */
  disconnectFM(): void {
    this.fmGain.disconnect()
    this.fmConnections.clear()
  }

  /**
   * Apply pitch modulation (vibrato) in cents
   */
  applyPitchModulation(cents: number): void {
    // Smooth pitch changes to avoid zipper noise (5ms ramp)
    this.oscillator.detune.rampTo(cents, 0.005)
  }

  /**
   * Apply amplitude modulation (tremolo) as multiplier
   */
  applyAmplitudeModulation(multiplier: number): void {
    const baseGain = (this.params.level / 100)
    // Smooth amplitude changes to avoid clicks (5ms ramp)
    this.gain.gain.rampTo(baseGain * multiplier, 0.005)
  }

  /**
   * Apply operator level modulation
   */
  applyLevelModulation(baseLevel: number, modulationValue: number): void {
    // modulationValue is -1 to 1
    // Map to ±100% of base level (full range modulation)
    const modulatedLevel = baseLevel * (1 + modulationValue * 1.0)
    const clampedLevel = Math.max(0, Math.min(100, modulatedLevel))
    // Smooth level changes to avoid clicks (5ms ramp)
    this.gain.gain.rampTo(clampedLevel / 100, 0.005)
  }

  /**
   * Apply operator ratio modulation
   */
  applyRatioModulation(baseRatio: number, modulationValue: number): void {
    // modulationValue is -1 to 1
    // Map to ±50% of base ratio (wider ratio modulation)
    const modulatedRatio = baseRatio * (1 + modulationValue * 0.5)
    const clampedRatio = Math.max(0.5, Math.min(16, modulatedRatio))
    // Smooth frequency changes to avoid clicks (5ms ramp)
    this.oscillator.frequency.rampTo(this.baseFrequency * clampedRatio, 0.005)
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

    if (params.feedback !== undefined) {
      this.params.feedback = params.feedback

      // Update or create feedback loop
      if (params.feedback > 0) {
        if (!this.feedbackGain) {
          // Create new feedback loop
          this.feedbackGain = new Tone.Gain(params.feedback * 2000)
          this.envelope.connect(this.feedbackGain)
          this.feedbackGain.connect(this.oscillator.frequency)
          console.log(`✨ Feedback FM created: ${params.feedback.toFixed(2)}`)
        } else {
          // Update existing feedback gain
          this.feedbackGain.gain.value = params.feedback * 2000
        }
      } else if (this.feedbackGain) {
        // Disable feedback if set to 0
        this.feedbackGain.disconnect()
        this.feedbackGain.dispose()
        this.feedbackGain = null
        console.log('🔇 Feedback FM disabled')
      }
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
   * Récupère les paramètres de l'opérateur (lecture seule)
   */
  getParams(): Readonly<OperatorParams> {
    return this.params
  }

  /**
   * Récupère la fréquence de base actuelle
   */
  getBaseFrequency(): number {
    return this.baseFrequency
  }

  /**
   * Get the output node (for connecting feedback or other effects)
   */
  get output(): Tone.Gain {
    return this.gain
  }

  /**
   * Get the frequency AudioParam (for connecting feedback modulation)
   */
  get frequency(): AudioParam {
    return this.oscillator.frequency
  }

  /**
   * Dispose (cleanup)
   */
  dispose(): void {
    this.oscillator.dispose()
    this.envelope.dispose()
    this.gain.dispose()
    this.fmGain.dispose()

    if (this.feedbackGain) {
      this.feedbackGain.dispose()
    }
  }
}
