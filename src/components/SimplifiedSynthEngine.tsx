/**
 * Simplified Synth Engine
 * Ultra-compact FM synthesis controls: Algorithm + 4 operator knobs
 */

import { KnobWithPatchInput } from './KnobWithPatchInput'
import { AlgorithmDiagram } from './AlgorithmDiagram'
import { AlgorithmType, OperatorParams, LFODestination } from '../audio/types'

interface SimplifiedSynthEngineProps {
  algorithm: AlgorithmType
  operators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams]
  onAlgorithmChange: (algorithm: AlgorithmType) => void
  onOperatorChange: (index: number, params: Partial<OperatorParams>) => void
  lfos?: Array<{ destination: LFODestination; color: string; lfoIndex: number }>
  onPatchConnect?: (destination: LFODestination) => void
  onPatchDisconnect?: (destination: LFODestination) => void
}

export function SimplifiedSynthEngine({
  algorithm,
  operators,
  onAlgorithmChange,
  onOperatorChange,
  lfos = [],
  onPatchConnect,
  onPatchDisconnect,
}: SimplifiedSynthEngineProps) {
  // Find ALL LFOs connected to operator destinations (support multiple modulators)
  const op1Connections = lfos.filter((lfo) => lfo.destination === LFODestination.OP1_RATIO)
  const op2Connections = lfos.filter((lfo) => lfo.destination === LFODestination.OP2_RATIO)
  const op3Connections = lfos.filter((lfo) => lfo.destination === LFODestination.OP3_RATIO)
  const op4Connections = lfos.filter((lfo) => lfo.destination === LFODestination.OP4_RATIO)

  // Extract colors for multi-color display
  const op1Colors = op1Connections.map(conn => conn.color)
  const op2Colors = op2Connections.map(conn => conn.color)
  const op3Colors = op3Connections.map(conn => conn.color)
  const op4Colors = op4Connections.map(conn => conn.color)
  return (
    <div
      style={{
        padding: 'var(--spacing-3)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid var(--color-idle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-4)',
      }}
    >
      {/* Left: Algorithm Selector with Diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            textTransform: 'uppercase',
          }}
        >
          Algorithm
        </div>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
          style={{
            padding: 'var(--spacing-2)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-mono)',
            cursor: 'pointer',
          }}
        >
          <option value="SERIAL">SERIAL</option>
          <option value="PARALLEL">PARALLEL</option>
          <option value="FAN_OUT">FAN OUT</option>
          <option value="SPLIT">SPLIT</option>
        </select>
        <AlgorithmDiagram algorithm={algorithm} color="var(--color-idle)" />
      </div>

      {/* Right: 4 Operator Knobs (Ratio only for compactness) */}
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            textTransform: 'uppercase',
          }}
        >
          Operators
        </div>
        <KnobWithPatchInput
          label="OP1"
          value={operators[0].ratio}
          min={0.5}
          max={16}
          step={0.1}
          color="var(--color-idle)"
          size="sm"
          onChange={(ratio) => onOperatorChange(0, { ratio })}
          destination={LFODestination.OP1_RATIO}
          onPatchDrop={onPatchConnect}
          connectionColors={op1Colors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP1_RATIO)}
        />
        <KnobWithPatchInput
          label="OP2"
          value={operators[1].ratio}
          min={0.5}
          max={16}
          step={0.1}
          color="var(--color-idle)"
          size="sm"
          onChange={(ratio) => onOperatorChange(1, { ratio })}
          destination={LFODestination.OP2_RATIO}
          onPatchDrop={onPatchConnect}
          connectionColors={op2Colors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP2_RATIO)}
        />
        <KnobWithPatchInput
          label="OP3"
          value={operators[2].ratio}
          min={0.5}
          max={16}
          step={0.1}
          color="var(--color-idle)"
          size="sm"
          onChange={(ratio) => onOperatorChange(2, { ratio })}
          destination={LFODestination.OP3_RATIO}
          onPatchDrop={onPatchConnect}
          connectionColors={op3Colors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP3_RATIO)}
        />
        <KnobWithPatchInput
          label="OP4"
          value={operators[3].ratio}
          min={0.5}
          max={16}
          step={0.1}
          color="var(--color-idle)"
          size="sm"
          onChange={(ratio) => onOperatorChange(3, { ratio })}
          destination={LFODestination.OP4_RATIO}
          onPatchDrop={onPatchConnect}
          connectionColors={op4Colors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP4_RATIO)}
        />
      </div>
    </div>
  )
}
