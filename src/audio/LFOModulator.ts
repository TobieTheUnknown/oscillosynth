/**
 * LFO Modulator
 * Handles all LFO modulation routing and application logic
 * Extracted from AudioEngine to improve modularity
 */

import * as Tone from 'tone'
import { LFODestination, Preset } from './types'
import { FMEngine } from './FMEngine'
import { AudioPipeline } from './AudioPipeline'

interface ModulationContext {
  currentPreset: Preset | null
  pipeline: AudioPipeline
  noiseGain: Tone.Gain | null
  noiseFilter: Tone.Filter | null
  baseNoiseLevel: number
  baseNoiseFilterCutoff: number
  baseNoiseFilterResonance: number
  baseSynthDetune: number
  baseSynthFmIndex: number
  baseSynthBrightness: number
  baseSynthFeedback: number
  baseSynthSubOscLevel: number
  baseSynthStereoSpread: number
  activeVoices: Map<number, { fmEngine: FMEngine }>
}

export class LFOModulator {
  /**
   * Apply LFO modulation to the appropriate destination
   *
   * @param destination - The modulation destination
   * @param value - The LFO value (-1 to +1)
   * @param fmEngine - The FM engine for per-voice modulation (or null for global modulation)
   * @param context - The modulation context containing all necessary references
   */
  static applyModulation(
    destination: LFODestination,
    value: number,
    fmEngine: FMEngine | null,
    context: ModulationContext
  ): void {
    if (!context.currentPreset) return

    switch (destination) {
      case LFODestination.PITCH:
        this.modulatePitch(value, fmEngine)
        break

      case LFODestination.AMPLITUDE:
        this.modulateAmplitude(value, fmEngine)
        break

      case LFODestination.FILTER_CUTOFF:
        this.modulateFilterCutoff(value, context)
        break

      case LFODestination.FILTER_RESONANCE:
        this.modulateFilterResonance(value, context)
        break

      case LFODestination.OP1_LEVEL:
        this.modulateOperatorLevel(0, value, fmEngine, context)
        break

      case LFODestination.OP2_LEVEL:
        this.modulateOperatorLevel(1, value, fmEngine, context)
        break

      case LFODestination.OP3_LEVEL:
        this.modulateOperatorLevel(2, value, fmEngine, context)
        break

      case LFODestination.OP4_LEVEL:
        this.modulateOperatorLevel(3, value, fmEngine, context)
        break

      case LFODestination.OP1_RATIO:
        this.modulateOperatorRatio(0, value, fmEngine, context)
        break

      case LFODestination.OP2_RATIO:
        this.modulateOperatorRatio(1, value, fmEngine, context)
        break

      case LFODestination.OP3_RATIO:
        this.modulateOperatorRatio(2, value, fmEngine, context)
        break

      case LFODestination.OP4_RATIO:
        this.modulateOperatorRatio(3, value, fmEngine, context)
        break

      case LFODestination.FX_REVERB_WET:
        this.modulateReverbWet(value, context)
        break

      case LFODestination.FX_DELAY_WET:
        this.modulateDelayWet(value, context)
        break

      case LFODestination.FX_DELAY_TIME:
        this.modulateDelayTime(value, context)
        break

      case LFODestination.FX_CHORUS_WET:
        this.modulateChorusWet(value, context)
        break

      case LFODestination.FX_DISTORTION_WET:
        this.modulateDistortionWet(value, context)
        break

      case LFODestination.NOISE_LEVEL:
        this.modulateNoiseLevel(value, context)
        break

      case LFODestination.NOISE_FILTER_CUTOFF:
        this.modulateNoiseFilterCutoff(value, context)
        break

      case LFODestination.NOISE_FILTER_RESONANCE:
        this.modulateNoiseFilterResonance(value, context)
        break

      case LFODestination.SYNTH_DETUNE:
        this.modulateSynthDetune(value, context)
        break

      case LFODestination.SYNTH_FM_INDEX:
        this.modulateSynthFMIndex(value, context)
        break

      case LFODestination.SYNTH_BRIGHTNESS:
        this.modulateSynthBrightness(value, context)
        break

      case LFODestination.SYNTH_FEEDBACK:
        this.modulateSynthFeedback(value, context)
        break

      case LFODestination.SYNTH_SUB_OSC:
        this.modulateSynthSubOsc(value, context)
        break

      case LFODestination.SYNTH_STEREO_SPREAD:
        this.modulateSynthStereoSpread(value, context)
        break

      default:
        console.warn(`Unknown LFO destination: ${String(destination)}`)
    }
  }

  // ===== Voice-specific modulation methods =====

  /**
   * Modulate pitch (vibrato): ±100 cents
   */
  private static modulatePitch(value: number, fmEngine: FMEngine | null): void {
    if (fmEngine) {
      fmEngine.applyPitchModulation(value * 100)
    }
  }

  /**
   * Modulate amplitude (tremolo): 0.1 to 1.9
   */
  private static modulateAmplitude(value: number, fmEngine: FMEngine | null): void {
    if (fmEngine) {
      const ampMod = 1 + value * 0.9
      fmEngine.applyAmplitudeModulation(Math.max(0.1, ampMod))
    }
  }

  /**
   * Modulate operator level
   */
  private static modulateOperatorLevel(
    operatorIndex: number,
    value: number,
    fmEngine: FMEngine | null,
    context: ModulationContext
  ): void {
    if (fmEngine && context.currentPreset && context.currentPreset.operators[operatorIndex]) {
      const baseLevel = context.currentPreset.operators[operatorIndex].level
      fmEngine.applyOperatorLevelModulation(operatorIndex as 0 | 1 | 2 | 3, baseLevel, value)
    }
  }

  /**
   * Modulate operator ratio
   */
  private static modulateOperatorRatio(
    operatorIndex: number,
    value: number,
    fmEngine: FMEngine | null,
    context: ModulationContext
  ): void {
    if (fmEngine && context.currentPreset && context.currentPreset.operators[operatorIndex]) {
      const baseRatio = context.currentPreset.operators[operatorIndex].ratio
      fmEngine.applyOperatorRatioModulation(operatorIndex as 0 | 1 | 2 | 3, baseRatio, value)
    }
  }

  // ===== Global modulation methods =====

  /**
   * Modulate filter cutoff
   */
  private static modulateFilterCutoff(value: number, context: ModulationContext): void {
    if (context.currentPreset) {
      context.pipeline.applyFilterCutoffModulation(
        context.currentPreset.filter.cutoff,
        value
      )
    }
  }

  /**
   * Modulate filter resonance
   */
  private static modulateFilterResonance(value: number, context: ModulationContext): void {
    if (context.currentPreset) {
      context.pipeline.applyFilterResonanceModulation(
        context.currentPreset.filter.resonance,
        value
      )
    }
  }

  /**
   * Modulate reverb wet amount: ±50%
   */
  private static modulateReverbWet(value: number, context: ModulationContext): void {
    if (context.currentPreset) {
      const baseWet = context.currentPreset.masterEffects.reverbWet
      const modulatedWet = baseWet + value * 0.5
      context.pipeline.setReverbWet(Math.max(0, Math.min(1, modulatedWet)))
    }
  }

  /**
   * Modulate delay wet amount: ±50%
   */
  private static modulateDelayWet(value: number, context: ModulationContext): void {
    if (context.currentPreset) {
      const baseWet = context.currentPreset.masterEffects.delayWet
      const modulatedWet = baseWet + value * 0.5
      context.pipeline.setDelayWet(Math.max(0, Math.min(1, modulatedWet)))
    }
  }

  /**
   * Modulate delay time: ±50%
   */
  private static modulateDelayTime(value: number, context: ModulationContext): void {
    if (context.currentPreset) {
      const baseTime = context.currentPreset.masterEffects.delayTime
      const modulatedTime = baseTime * (1 + value * 0.5)
      context.pipeline.setDelayTime(Math.max(0, Math.min(2, modulatedTime)))
    }
  }

  /**
   * Modulate chorus wet amount: ±50%
   */
  private static modulateChorusWet(value: number, context: ModulationContext): void {
    if (context.currentPreset) {
      const baseWet = context.currentPreset.masterEffects.chorusWet
      const modulatedWet = baseWet + value * 0.5
      context.pipeline.setChorusWet(Math.max(0, Math.min(1, modulatedWet)))
    }
  }

  /**
   * Modulate distortion wet amount: ±50%
   */
  private static modulateDistortionWet(value: number, context: ModulationContext): void {
    if (context.currentPreset) {
      const baseWet = context.currentPreset.masterEffects.distortionWet
      const modulatedWet = baseWet + value * 0.5
      context.pipeline.setDistortionWet(Math.max(0, Math.min(1, modulatedWet)))
    }
  }

  /**
   * Modulate noise level: ±50%
   */
  private static modulateNoiseLevel(value: number, context: ModulationContext): void {
    if (context.noiseGain) {
      const modulatedLevel = context.baseNoiseLevel + value * 50
      context.noiseGain.gain.value = Math.max(0, Math.min(100, modulatedLevel)) / 100
    }
  }

  /**
   * Modulate noise filter cutoff: ±90%
   */
  private static modulateNoiseFilterCutoff(value: number, context: ModulationContext): void {
    if (context.noiseFilter) {
      const modulatedCutoff = context.baseNoiseFilterCutoff * (1 + value * 0.9)
      context.noiseFilter.frequency.value = Math.max(20, Math.min(20000, modulatedCutoff))
    }
  }

  /**
   * Modulate noise filter resonance: ±10
   */
  private static modulateNoiseFilterResonance(value: number, context: ModulationContext): void {
    if (context.noiseFilter) {
      const modulatedReso = context.baseNoiseFilterResonance + value * 10
      context.noiseFilter.Q.value = Math.max(0.1, Math.min(20, modulatedReso))
    }
  }

  /**
   * Modulate synth detune: ±50 cents (applied to all active voices)
   */
  private static modulateSynthDetune(value: number, context: ModulationContext): void {
    const modulatedDetune = context.baseSynthDetune + value * 50
    const clampedDetune = Math.max(0, Math.min(100, modulatedDetune))

    context.activeVoices.forEach((activeVoice) => {
      activeVoice.fmEngine.applyPitchModulation(clampedDetune)
    })
  }

  /**
   * Modulate FM index: ±100% (applied to all active voices)
   */
  private static modulateSynthFMIndex(value: number, context: ModulationContext): void {
    const modulatedFmIndex = context.baseSynthFmIndex + value * 100
    const clampedFmIndex = Math.max(0, Math.min(200, modulatedFmIndex))

    context.activeVoices.forEach((activeVoice) => {
      const scaleFactor = clampedFmIndex / 100
      if (context.currentPreset) {
        const indices: Array<0 | 1 | 2 | 3> = [0, 1, 2, 3]
        indices.forEach(i => {
          if (context.currentPreset?.operators[i]) {
            const baseLevel = context.currentPreset.operators[i].level
            activeVoice.fmEngine.applyOperatorLevelModulation(i, baseLevel, scaleFactor - 1)
          }
        })
      }
    })
  }

  /**
   * Modulate brightness: ±12 dB
   * Note: This is a simplified implementation that modulates filter cutoff as a proxy
   */
  private static modulateSynthBrightness(value: number, context: ModulationContext): void {
    const modulatedBrightness = context.baseSynthBrightness + value * 12
    const clampedBrightness = Math.max(-12, Math.min(12, modulatedBrightness))

    // Convert dB to cutoff frequency adjustment
    const cutoffMultiplier = Math.pow(10, clampedBrightness / 20)

    if (context.currentPreset) {
      context.pipeline.applyFilterCutoffModulation(
        context.currentPreset.filter.cutoff,
        cutoffMultiplier - 1
      )
    }
  }

  /**
   * Modulate feedback: ±50%
   * Note: Currently not implemented in FMEngine
   */
  private static modulateSynthFeedback(_value: number, _context: ModulationContext): void {
    // TODO: Implement feedback modulation in FMEngine
    // For now, this is a placeholder
  }

  /**
   * Modulate sub oscillator level: ±50%
   * Note: Currently not implemented in AudioEngine
   */
  private static modulateSynthSubOsc(_value: number, _context: ModulationContext): void {
    // TODO: Implement sub osc modulation in AudioEngine
    // For now, this is a placeholder
  }

  /**
   * Modulate stereo spread: ±50%
   * Note: Currently not implemented in FMEngine
   */
  private static modulateSynthStereoSpread(_value: number, _context: ModulationContext): void {
    // TODO: Implement stereo spread modulation in FMEngine
    // For now, this is a placeholder
  }
}
