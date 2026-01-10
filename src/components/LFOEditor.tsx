/**
 * LFO Editor Component
 * Controls for editing 8 LFOs with oscilloscope aesthetic
 */

import { useState } from 'react'
import { LFOParams, WaveformType, LFODestination } from '../audio/types'

interface LFOEditorProps {
  lfoParams: [
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams,
    LFOParams
  ]
  onLFOChange: (index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, params: Partial<LFOParams>) => void
}

// LFO colors matching visualizer (8 colors)
const LFO_COLORS = [
  '#00FF41',
  '#00FFFF',
  '#FFFF00',
  '#FF64FF',
  '#64C8FF',
  '#FF9664',
  '#96FF96',
  '#FF6496',
]

export function LFOEditor({ lfoParams, onLFOChange }: LFOEditorProps) {
  const [expandedLFO, setExpandedLFO] = useState<number | null>(0)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-trace-primary)',
          marginBottom: 'var(--spacing-2)',
          fontFamily: 'var(--font-family-mono)',
        }}
      >
        LFO Editor
      </h2>

      {lfoParams.map((lfo, index) => (
        <LFOPanel
          key={index}
          index={index as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}
          params={lfo}
          color={LFO_COLORS[index] ?? '#00FF41'}
          isExpanded={expandedLFO === index}
          onToggle={() => {
            setExpandedLFO(expandedLFO === index ? null : index)
          }}
          onChange={(params) => {
            onLFOChange(index as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7, params)
          }}
        />
      ))}
    </div>
  )
}

interface LFOPanelProps {
  index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  params: LFOParams
  color: string
  isExpanded: boolean
  onToggle: () => void
  onChange: (params: Partial<LFOParams>) => void
}

function LFOPanel({ index, params, color, isExpanded, onToggle, onChange }: LFOPanelProps) {
  return (
    <div
      style={{
        border: `1px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: 'var(--spacing-3)',
          backgroundColor: isExpanded ? `${color}15` : 'transparent',
          border: 'none',
          color: color,
          fontSize: 'var(--font-size-md)',
          fontFamily: 'var(--font-family-mono)',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>LFO {index + 1}</span>
        <span style={{ fontSize: 'var(--font-size-sm)', opacity: 0.7 }}>
          {params.waveform.toUpperCase()} • {params.rate.toFixed(2)} Hz • {params.depth}%
        </span>
      </button>

      {/* Controls */}
      {isExpanded && (
        <div
          style={{
            padding: 'var(--spacing-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-4)',
            borderTop: `1px solid ${color}40`,
          }}
        >
          {/* Waveform Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-2)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              Waveform
            </label>
            <select
              value={params.waveform}
              onChange={(e) => {
                onChange({ waveform: e.target.value as WaveformType })
              }}
              style={{
                width: '100%',
                padding: 'var(--spacing-2)',
                backgroundColor: 'var(--color-bg-primary)',
                color: color,
                border: `1px solid ${color}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-mono)',
                cursor: 'pointer',
              }}
            >
              <option value={WaveformType.SINE}>Sine</option>
              <option value={WaveformType.SQUARE}>Square</option>
              <option value={WaveformType.SAWTOOTH}>Sawtooth</option>
              <option value={WaveformType.TRIANGLE}>Triangle</option>
            </select>
          </div>

          {/* Destination Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-2)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              Destination
            </label>
            <select
              value={params.destination}
              onChange={(e) => {
                onChange({ destination: e.target.value as LFODestination })
              }}
              style={{
                width: '100%',
                padding: 'var(--spacing-2)',
                backgroundColor: 'var(--color-bg-primary)',
                color: color,
                border: `1px solid ${color}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-mono)',
                cursor: 'pointer',
              }}
            >
              <option value={LFODestination.PITCH}>Pitch</option>
              <option value={LFODestination.AMPLITUDE}>Amplitude</option>
              <option value={LFODestination.FILTER_CUTOFF}>Filter Cutoff</option>
              <option value={LFODestination.FILTER_RESONANCE}>Filter Resonance</option>
              <option value={LFODestination.OP1_LEVEL}>Operator 1 Level</option>
              <option value={LFODestination.OP2_LEVEL}>Operator 2 Level</option>
              <option value={LFODestination.OP3_LEVEL}>Operator 3 Level</option>
              <option value={LFODestination.OP4_LEVEL}>Operator 4 Level</option>
              <option value={LFODestination.OP1_RATIO}>Operator 1 Ratio</option>
              <option value={LFODestination.OP2_RATIO}>Operator 2 Ratio</option>
              <option value={LFODestination.OP3_RATIO}>Operator 3 Ratio</option>
              <option value={LFODestination.OP4_RATIO}>Operator 4 Ratio</option>
            </select>
          </div>

          {/* Rate Slider */}
          <SliderControl
            label="Rate"
            value={params.rate}
            min={0.1}
            max={20}
            step={0.1}
            unit="Hz"
            color={color}
            onChange={(value) => { onChange({ rate: value }); }}
          />

          {/* Depth Slider */}
          <SliderControl
            label="Depth"
            value={params.depth}
            min={0}
            max={100}
            step={1}
            unit="%"
            color={color}
            onChange={(value) => { onChange({ depth: value }); }}
          />

          {/* Phase Slider */}
          <SliderControl
            label="Phase"
            value={params.phase}
            min={0}
            max={360}
            step={1}
            unit="°"
            color={color}
            onChange={(value) => { onChange({ phase: value }); }}
          />

          {/* Sync Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <label
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-mono)',
                flex: 1,
              }}
            >
              Tempo Sync
            </label>
            <button
              onClick={() => { onChange({ sync: !params.sync }); }}
              style={{
                padding: 'var(--spacing-2) var(--spacing-4)',
                backgroundColor: params.sync ? color : 'transparent',
                color: params.sync ? 'var(--color-bg-primary)' : color,
                border: `1px solid ${color}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-mono)',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '60px',
              }}
            >
              {params.sync ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  color: string
  onChange: (value: number) => void
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
}: SliderControlProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-2)',
        }}
      >
        <label
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            color: color,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
          }}
        >
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => { onChange(Number(e.target.value)); }}
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: `${color}30`,
          borderRadius: '2px',
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: ${color};
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px ${color};
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: ${color};
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px ${color};
        }
      `}</style>
    </div>
  )
}
