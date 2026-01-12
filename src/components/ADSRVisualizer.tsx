/**
 * ADSR Envelope Visualizer
 * Shows envelope shapes for all 4 operators
 */

import { OperatorParams } from '../audio/types'

interface ADSRVisualizerProps {
  operators: [OperatorParams, OperatorParams, OperatorParams, OperatorParams]
  width?: number
  height?: number
}

export function ADSRVisualizer({ operators, width = 800, height = 200 }: ADSRVisualizerProps) {
  const colors = ['#00FF41', '#00FFFF', '#FFFF00', '#FF64FF']

  const drawEnvelope = (
    op: OperatorParams,
    color: string,
    index: number
  ): JSX.Element => {
    const { attack, decay, sustain, release } = op

    // Calculate time segments
    const totalTime = attack + decay + 0.5 + release // 0.5s for sustain display
    const attackWidth = (attack / totalTime) * width
    const decayWidth = (decay / totalTime) * width
    const sustainWidth = (0.5 / totalTime) * width
    const releaseWidth = (release / totalTime) * width

    // Build SVG path
    let pathData = `M 0 ${height}`

    // Attack phase
    pathData += ` L ${attackWidth} 0`

    // Decay phase
    pathData += ` L ${attackWidth + decayWidth} ${height * (1 - sustain)}`

    // Sustain phase
    pathData += ` L ${attackWidth + decayWidth + sustainWidth} ${height * (1 - sustain)}`

    // Release phase
    pathData += ` L ${attackWidth + decayWidth + sustainWidth + releaseWidth} ${height}`

    return (
      <g key={index}>
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={0.7}
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
        {/* Label */}
        <text
          x={10 + index * 80}
          y={20}
          fill={color}
          fontSize="12"
          fontFamily="monospace"
          fontWeight="bold"
        >
          OP{index + 1}
        </text>
      </g>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--spacing-2)',
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        <g opacity={0.1}>
          {/* Horizontal lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(i * height) / 4}
              x2={width}
              y2={(i * height) / 4}
              stroke="#00FF41"
              strokeWidth={1}
            />
          ))}
          {/* Vertical lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line
              key={`v${i}`}
              x1={(i * width) / 8}
              y1={0}
              x2={(i * width) / 8}
              y2={height}
              stroke="#00FF41"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Phase labels */}
        <g opacity={0.5}>
          <text x={10} y={height - 10} fill="#00FF41" fontSize="10" fontFamily="monospace">
            A
          </text>
          <text x={width * 0.2} y={height - 10} fill="#00FF41" fontSize="10" fontFamily="monospace">
            D
          </text>
          <text x={width * 0.5} y={height - 10} fill="#00FF41" fontSize="10" fontFamily="monospace">
            S
          </text>
          <text x={width * 0.8} y={height - 10} fill="#00FF41" fontSize="10" fontFamily="monospace">
            R
          </text>
        </g>

        {/* Draw all envelopes */}
        {operators.map((op, i) => drawEnvelope(op, colors[i] ?? '#00FF41', i))}
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-2)',
          right: 'var(--spacing-2)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          opacity: 0.7,
          textShadow: '0 0 4px #000',
        }}
      >
        ADSR ENVELOPES
      </div>
    </div>
  )
}
