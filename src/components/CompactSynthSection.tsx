/**
 * Compact Synth Section
 * Controls for creative synth engine parameters
 */

import { KnobWithPatchInput } from './KnobWithPatchInput'
import { LFODestination } from '../audio/types'

interface LFOConnection {
  destination: LFODestination
  color: string
  lfoIndex: number
}

interface CompactSynthSectionProps {
  title: string
  detune?: number
  fmIndex?: number
  brightness?: number
  feedback?: number
  subOscLevel?: number
  stereoSpread?: number
  onChange: (params: {
    detune?: number
    fmIndex?: number
    brightness?: number
    feedback?: number
    subOscLevel?: number
    stereoSpread?: number
  }) => void
  showHarmonicControls?: boolean // true = detune/fmIndex/brightness, false = feedback/subOsc/spread
  lfos?: LFOConnection[]
  onPatchConnect?: (destination: LFODestination) => void
  onPatchDisconnect?: (destination: LFODestination) => void
}

export function CompactSynthSection({
  title,
  detune = 0,
  fmIndex = 100,
  brightness = 0,
  feedback = 0,
  subOscLevel = 0,
  stereoSpread = 0,
  onChange,
  showHarmonicControls = true,
  lfos = [],
  onPatchConnect,
  onPatchDisconnect,
}: CompactSynthSectionProps) {
  // Helper to get connection colors for a destination
  const getConnectionColors = (destination: LFODestination): string[] => {
    return lfos.filter((lfo) => lfo.destination === destination).map((lfo) => lfo.color)
  }
  return (
    <div
      style={{
        padding: 'var(--spacing-3)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--color-idle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2)',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-idle)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          textAlign: 'center',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </div>

      {/* Knobs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center' }}>
        {showHarmonicControls ? (
          <>
            <KnobWithPatchInput
              label="Detune"
              value={detune}
              min={0}
              max={100}
              step={1}
              unit="¢"
              size="sm"
              color="var(--color-idle)"
              onChange={(detune) => onChange({ detune })}
              destination={LFODestination.SYNTH_DETUNE}
              onPatchDrop={onPatchConnect}
              connectionColors={getConnectionColors(LFODestination.SYNTH_DETUNE)}
              onDisconnect={() => onPatchDisconnect?.(LFODestination.SYNTH_DETUNE)}
            />
            <KnobWithPatchInput
              label="FM Idx"
              value={fmIndex}
              min={0}
              max={200}
              step={1}
              unit="%"
              size="sm"
              color="var(--color-idle)"
              onChange={(fmIndex) => onChange({ fmIndex })}
              destination={LFODestination.SYNTH_FM_INDEX}
              onPatchDrop={onPatchConnect}
              connectionColors={getConnectionColors(LFODestination.SYNTH_FM_INDEX)}
              onDisconnect={() => onPatchDisconnect?.(LFODestination.SYNTH_FM_INDEX)}
            />
            <KnobWithPatchInput
              label="Bright"
              value={brightness}
              min={-12}
              max={12}
              step={0.5}
              unit="dB"
              size="sm"
              color="var(--color-idle)"
              onChange={(brightness) => onChange({ brightness })}
              destination={LFODestination.SYNTH_BRIGHTNESS}
              onPatchDrop={onPatchConnect}
              connectionColors={getConnectionColors(LFODestination.SYNTH_BRIGHTNESS)}
              onDisconnect={() => onPatchDisconnect?.(LFODestination.SYNTH_BRIGHTNESS)}
            />
          </>
        ) : (
          <>
            <KnobWithPatchInput
              label="Feedback"
              value={feedback}
              min={0}
              max={100}
              step={1}
              unit="%"
              size="sm"
              color="var(--color-idle)"
              onChange={(feedback) => onChange({ feedback })}
              destination={LFODestination.SYNTH_FEEDBACK}
              onPatchDrop={onPatchConnect}
              connectionColors={getConnectionColors(LFODestination.SYNTH_FEEDBACK)}
              onDisconnect={() => onPatchDisconnect?.(LFODestination.SYNTH_FEEDBACK)}
            />
            <KnobWithPatchInput
              label="Sub Osc"
              value={subOscLevel}
              min={0}
              max={100}
              step={1}
              unit="%"
              size="sm"
              color="var(--color-idle)"
              onChange={(subOscLevel) => onChange({ subOscLevel })}
              destination={LFODestination.SYNTH_SUB_OSC}
              onPatchDrop={onPatchConnect}
              connectionColors={getConnectionColors(LFODestination.SYNTH_SUB_OSC)}
              onDisconnect={() => onPatchDisconnect?.(LFODestination.SYNTH_SUB_OSC)}
            />
            <KnobWithPatchInput
              label="Spread"
              value={stereoSpread}
              min={0}
              max={100}
              step={1}
              unit="%"
              size="sm"
              color="var(--color-idle)"
              onChange={(stereoSpread) => onChange({ stereoSpread })}
              destination={LFODestination.SYNTH_STEREO_SPREAD}
              onPatchDrop={onPatchConnect}
              connectionColors={getConnectionColors(LFODestination.SYNTH_STEREO_SPREAD)}
              onDisconnect={() => onPatchDisconnect?.(LFODestination.SYNTH_STEREO_SPREAD)}
            />
          </>
        )}
      </div>
    </div>
  )
}
