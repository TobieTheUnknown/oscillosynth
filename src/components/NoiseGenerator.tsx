/**
 * Noise Generator Component
 * White/Pink/Brown noise generator with level control and dedicated filter
 */

import { KnobWithPatchInput } from './KnobWithPatchInput'
import { LFODestination } from '../audio/types'

interface NoiseGeneratorProps {
  noiseType: 'white' | 'pink' | 'brown'
  noiseLevel: number
  noiseFilterCutoff: number
  noiseFilterResonance: number
  onNoiseTypeChange: (type: 'white' | 'pink' | 'brown') => void
  onNoiseLevelChange: (level: number) => void
  onNoiseFilterCutoffChange: (cutoff: number) => void
  onNoiseFilterResonanceChange: (resonance: number) => void
  lfos?: Array<{ destination: LFODestination; color: string; lfoIndex: number }>
  onPatchConnect?: (destination: LFODestination) => void
  onPatchDisconnect?: (destination: LFODestination) => void
}

export function NoiseGenerator({
  noiseType,
  noiseLevel,
  noiseFilterCutoff,
  noiseFilterResonance,
  onNoiseTypeChange,
  onNoiseLevelChange,
  onNoiseFilterCutoffChange,
  onNoiseFilterResonanceChange,
  lfos = [],
  onPatchConnect,
  onPatchDisconnect,
}: NoiseGeneratorProps) {
  // Find ALL LFOs connected to noise destinations (support multiple modulators)
  const levelConnections = lfos.filter((lfo) => lfo.destination === LFODestination.NOISE_LEVEL)
  const cutoffConnections = lfos.filter((lfo) => lfo.destination === LFODestination.NOISE_FILTER_CUTOFF)
  const resoConnections = lfos.filter((lfo) => lfo.destination === LFODestination.NOISE_FILTER_RESONANCE)

  // Extract colors for multi-color display
  const levelColors = levelConnections.map(conn => conn.color)
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
        NOISE
      </div>

      {/* Noise Type Selector */}
      <select
        value={noiseType}
        onChange={(e) => onNoiseTypeChange(e.target.value as 'white' | 'pink' | 'brown')}
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
        <option value="white">WHITE</option>
        <option value="pink">PINK</option>
        <option value="brown">BROWN</option>
      </select>

      {/* All 3 Knobs on one line: Cutoff | Level (bold) | Reso */}
      <div style={{ display: 'flex', gap: 'var(--spacing-1)', alignItems: 'flex-start', marginTop: 'var(--spacing-1)' }}>
        <KnobWithPatchInput
          label="Cutoff"
          value={noiseFilterCutoff}
          min={20}
          max={20000}
          step={10}
          unit="Hz"
          color="var(--color-idle)"
          size="sm"
          onChange={onNoiseFilterCutoffChange}
          destination={LFODestination.NOISE_FILTER_CUTOFF}
          onPatchDrop={onPatchConnect}
          connectionColors={cutoffColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.NOISE_FILTER_CUTOFF)}
        />
        <KnobWithPatchInput
          label="Level"
          value={noiseLevel}
          min={0}
          max={100}
          step={1}
          unit="%"
          color="var(--color-idle)"
          size="sm"
          onChange={onNoiseLevelChange}
          destination={LFODestination.NOISE_LEVEL}
          onPatchDrop={onPatchConnect}
          connectionColors={levelColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.NOISE_LEVEL)}
        />
        <KnobWithPatchInput
          label="Reso"
          value={noiseFilterResonance}
          min={0.1}
          max={20}
          step={0.1}
          color="var(--color-idle)"
          size="sm"
          onChange={onNoiseFilterResonanceChange}
          destination={LFODestination.NOISE_FILTER_RESONANCE}
          onPatchDrop={onPatchConnect}
          connectionColors={resoColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.NOISE_FILTER_RESONANCE)}
        />
      </div>
    </div>
  )
}
