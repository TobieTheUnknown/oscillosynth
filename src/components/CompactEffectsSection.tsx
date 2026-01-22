/**
 * Compact Effects Section
 * Effects with secondary controls above main knobs
 */

import { useState } from 'react'
import { KnobWithPatchInput } from './KnobWithPatchInput'
import { Knob } from './Knob'
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
  const [showDelaySyncSelector, setShowDelaySyncSelector] = useState(false)

  // Find ALL LFOs connected to effects destinations (support multiple modulators)
  const reverbConnections = lfos.filter((lfo) => lfo.destination === LFODestination.FX_REVERB_WET)
  const delayConnections = lfos.filter((lfo) => lfo.destination === LFODestination.FX_DELAY_WET)
  const stereoWidthConnections = lfos.filter((lfo) => lfo.destination === LFODestination.FX_STEREO_WIDTH)

  // Extract colors for multi-color display
  const reverbColors = reverbConnections.map(conn => conn.color)
  const delayColors = delayConnections.map(conn => conn.color)
  const stereoWidthColors = stereoWidthConnections.map(conn => conn.color)

  // Delay sync values (tempo-synced time divisions)
  const delaySyncOptions = ['1/16', '1/8', '1/4', '1/2', '1', '2', '4', '8']
  return (
    <div
      style={{
        padding: 'var(--spacing-1)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid var(--color-idle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
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

      {/* Secondary controls (smaller knobs above) */}
      <div style={{ display: 'flex', gap: 'var(--spacing-1)', alignItems: 'flex-end' }}>
        {/* Chorus Depth - adds shimmer to stereo image */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px' }}>
          <div style={{ fontSize: '7px', color: 'var(--color-idle)', marginBottom: '1px', opacity: 0.5, fontFamily: 'var(--font-family-mono)' }}>
            CHORUS
          </div>
          <Knob
            label=""
            value={params.chorusDepth * 100}
            min={0}
            max={100}
            step={1}
            unit="%"
            color="var(--color-idle)"
            size="sm"
            onChange={(value) => onChange({ chorusDepth: value / 100 })}
          />
        </div>

        {/* Reverb Decay */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px' }}>
          <div style={{ fontSize: '7px', color: 'var(--color-idle)', marginBottom: '1px', opacity: 0.5, fontFamily: 'var(--font-family-mono)' }}>
            DECAY
          </div>
          <Knob
            label=""
            value={params.reverbDecay}
            min={0.1}
            max={10}
            step={0.1}
            unit="s"
            color="var(--color-idle)"
            size="sm"
            onChange={(reverbDecay) => onChange({ reverbDecay })}
          />
        </div>

        {/* Delay Time with Sync */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px' }}>
          <div
            onClick={() => setShowDelaySyncSelector(!showDelaySyncSelector)}
            style={{
              fontSize: '7px',
              color: params.delaySync ? '#4ECDC4' : 'var(--color-idle)',
              marginBottom: '1px',
              cursor: 'pointer',
              opacity: 0.5,
              fontFamily: 'var(--font-family-mono)',
              textDecoration: params.delaySync ? 'underline' : 'none',
            }}
          >
            {params.delaySync ? params.delaySyncValue || '1/4' : 'FREE'}
          </div>
          {showDelaySyncSelector && params.delaySync && (
            <select
              value={params.delaySyncValue || '1/4'}
              onChange={(e) => {
                onChange({ delaySyncValue: e.target.value })
                setShowDelaySyncSelector(false)
              }}
              onBlur={() => setShowDelaySyncSelector(false)}
              autoFocus
              style={{
                position: 'absolute',
                marginTop: '15px',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-idle)',
                border: '1px solid var(--color-idle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '10px',
                padding: '2px',
                zIndex: 1000,
              }}
            >
              {delaySyncOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
          <Knob
            label=""
            value={params.delaySync ? 0 : params.delayTime}
            min={0}
            max={2}
            step={0.01}
            unit="s"
            color={params.delaySync ? '#4ECDC4' : 'var(--color-idle)'}
            size="sm"
            onChange={(delayTime) => {
              onChange({ delayTime, delaySync: false })
            }}
          />
        </div>
      </div>

      {/* Main Knobs with Patch Inputs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        <KnobWithPatchInput
          label="Width"
          value={params.stereoWidth}
          min={0}
          max={200}
          step={1}
          unit="%"
          color="var(--color-idle)"
          size="sm"
          onChange={(value) => onChange({ stereoWidth: value })}
          destination={LFODestination.FX_STEREO_WIDTH}
          onPatchDrop={onPatchConnect}
          connectionColors={stereoWidthColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.FX_STEREO_WIDTH)}
        />
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
