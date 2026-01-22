/**
 * Compact Filter Section
 * Minimalist filter controls: Type selector + 2 knobs
 */

import { KnobWithPatchInput } from './KnobWithPatchInput'
import { FilterParams, LFODestination } from '../audio/types'

interface CompactFilterSectionProps {
  params: FilterParams
  onChange: (params: Partial<FilterParams>) => void
  lfos?: Array<{ destination: LFODestination; color: string; lfoIndex: number }>
  onPatchConnect?: (destination: LFODestination) => void
  onPatchDisconnect?: (destination: LFODestination) => void
}

export function CompactFilterSection({
  params,
  onChange,
  lfos = [],
  onPatchConnect,
  onPatchDisconnect,
}: CompactFilterSectionProps) {
  // Find ALL LFOs connected to filter destinations (support multiple modulators)
  const cutoffConnections = lfos.filter((lfo) => lfo.destination === LFODestination.FILTER_CUTOFF)
  const resoConnections = lfos.filter((lfo) => lfo.destination === LFODestination.FILTER_RESONANCE)

  // Extract colors for multi-color display
  const cutoffColors = cutoffConnections.map(conn => conn.color)
  const resoColors = resoConnections.map(conn => conn.color)

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
        FILTER
      </div>

      {/* Filter Type */}
      <select
        value={params.type}
        onChange={(e) => onChange({ type: e.target.value as FilterParams['type'] })}
        style={{
          padding: 'var(--spacing-1) var(--spacing-2)',
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-idle)',
          border: '1px solid var(--color-idle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <option value="lowpass">LOWPASS</option>
        <option value="highpass">HIGHPASS</option>
        <option value="bandpass">BANDPASS</option>
        <option value="notch">NOTCH</option>
      </select>

      {/* Knobs with Patch Inputs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        <KnobWithPatchInput
          label="Cutoff"
          value={params.cutoff}
          min={20}
          max={10000}
          step={10}
          unit="Hz"
          color="var(--color-idle)"
          size="sm"
          onChange={(cutoff) => onChange({ cutoff })}
          destination={LFODestination.FILTER_CUTOFF}
          onPatchDrop={onPatchConnect}
          connectionColors={cutoffColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.FILTER_CUTOFF)}
        />
        <KnobWithPatchInput
          label="Reso"
          value={params.resonance}
          min={0.1}
          max={20}
          step={0.1}
          color="var(--color-idle)"
          size="sm"
          onChange={(resonance) => onChange({ resonance })}
          destination={LFODestination.FILTER_RESONANCE}
          onPatchDrop={onPatchConnect}
          connectionColors={resoColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.FILTER_RESONANCE)}
        />
      </div>
    </div>
  )
}
