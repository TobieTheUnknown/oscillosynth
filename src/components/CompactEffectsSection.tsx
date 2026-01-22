/**
 * Compact Effects Section
 * Minimalist effects: Just Reverb + Delay mix controls
 */

import { KnobWithPatchInput } from './KnobWithPatchInput'
import { MasterEffectsParams, LFODestination } from '../audio/types'

interface CompactEffectsSectionProps {
  params: MasterEffectsParams
  onChange: (params: Partial<MasterEffectsParams>) => void
  lfos?: Array<{ destination: LFODestination; color: string; lfoIndex: number }>
  onPatchConnect?: (destination: LFODestination) => void
  onPatchDisconnect?: (destination: LFODestination) => void
}

export function CompactEffectsSection({
  params,
  onChange,
  lfos = [],
  onPatchConnect,
  onPatchDisconnect,
}: CompactEffectsSectionProps) {
  // Find ALL LFOs connected to effects destinations (support multiple modulators)
  const reverbConnections = lfos.filter((lfo) => lfo.destination === LFODestination.FX_REVERB_WET)
  const delayConnections = lfos.filter((lfo) => lfo.destination === LFODestination.FX_DELAY_WET)

  // Extract colors for multi-color display
  const reverbColors = reverbConnections.map(conn => conn.color)
  const delayColors = delayConnections.map(conn => conn.color)
  return (
    <div
      style={{
        padding: 'var(--spacing-3)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid var(--color-idle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-2)',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-idle)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 0 8px var(--color-idle)',
        }}
      >
        EFFECTS
      </div>

      {/* Knobs with Patch Inputs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        <KnobWithPatchInput
          label="Reverb"
          value={params.reverbWet * 100}
          min={0}
          max={100}
          step={1}
          unit="%"
          color="var(--color-idle)"
          size="sm"
          onChange={(value) => onChange({ reverbWet: value / 100 })}
          destination={LFODestination.FX_REVERB_WET}
          onPatchDrop={onPatchConnect}
          connectionColors={reverbColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.FX_REVERB_WET)}
        />
        <KnobWithPatchInput
          label="Delay"
          value={params.delayWet * 100}
          min={0}
          max={100}
          step={1}
          unit="%"
          color="var(--color-idle)"
          size="sm"
          onChange={(value) => onChange({ delayWet: value / 100 })}
          destination={LFODestination.FX_DELAY_WET}
          onPatchDrop={onPatchConnect}
          connectionColors={delayColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.FX_DELAY_WET)}
        />
      </div>
    </div>
  )
}
