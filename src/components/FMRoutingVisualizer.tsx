/**
 * FM Routing Visualizer
 * Visual representation of FM algorithm routing between operators
 */

import { AlgorithmType } from '../audio/types'

interface FMRoutingVisualizerProps {
  algorithm: AlgorithmType
  width?: number
  height?: number
}

interface Connection {
  from: number // operator index (1-4)
  to: number // operator index (1-4) or 0 for OUT
}

// Define routing for each algorithm
const ALGORITHM_ROUTING: Record<AlgorithmType, Connection[]> = {
  [AlgorithmType.SERIAL]: [
    { from: 4, to: 3 },
    { from: 3, to: 2 },
    { from: 2, to: 1 },
    { from: 1, to: 0 },
  ],
  [AlgorithmType.PARALLEL]: [
    { from: 4, to: 0 },
    { from: 3, to: 0 },
    { from: 2, to: 0 },
    { from: 1, to: 0 },
  ],
  [AlgorithmType.DUAL_SERIAL]: [
    { from: 4, to: 3 },
    { from: 2, to: 1 },
    { from: 3, to: 0 },
    { from: 1, to: 0 },
  ],
  [AlgorithmType.FAN_OUT]: [
    { from: 4, to: 3 },
    { from: 4, to: 2 },
    { from: 4, to: 1 },
    { from: 3, to: 0 },
    { from: 2, to: 0 },
    { from: 1, to: 0 },
  ],
  [AlgorithmType.SPLIT]: [
    { from: 4, to: 2 },
    { from: 3, to: 2 },
    { from: 2, to: 1 },
    { from: 1, to: 0 },
  ],
}

const ALGORITHM_DESCRIPTIONS: Record<AlgorithmType, string> = {
  [AlgorithmType.SERIAL]: 'Metallic & Bell Tones',
  [AlgorithmType.PARALLEL]: 'Warm & Organ Tones',
  [AlgorithmType.DUAL_SERIAL]: 'Complex Harmonics',
  [AlgorithmType.FAN_OUT]: 'Rich Modulation',
  [AlgorithmType.SPLIT]: 'Thick Textures',
}

export function FMRoutingVisualizer({ algorithm, width = 600, height = 300 }: FMRoutingVisualizerProps) {
  const connections = ALGORITHM_ROUTING[algorithm] ?? []
  const description = ALGORITHM_DESCRIPTIONS[algorithm] ?? 'Unknown'

  // Layout: operators positioned in a grid
  // OP4 and OP3 on top row, OP2 and OP1 on bottom row, OUT on right
  const positions: Record<number, { x: number; y: number }> = {
    4: { x: 100, y: 80 },
    3: { x: 250, y: 80 },
    2: { x: 100, y: 200 },
    1: { x: 250, y: 200 },
    0: { x: 480, y: 140 }, // OUT
  }

  const opSize = 60

  // Draw arrow from one operator to another
  const drawArrow = (from: number, to: number) => {
    const fromPos = positions[from]
    const toPos = positions[to]

    if (!fromPos || !toPos) return null

    // Calculate arrow start and end points (from edge of boxes)
    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const angle = Math.atan2(dy, dx)

    const startX = fromPos.x + Math.cos(angle) * (opSize / 2)
    const startY = fromPos.y + Math.sin(angle) * (opSize / 2)
    const endX = toPos.x - Math.cos(angle) * (to === 0 ? opSize / 1.5 : opSize / 2)
    const endY = toPos.y - Math.sin(angle) * (to === 0 ? opSize / 2.5 : opSize / 2)

    // Arrow head
    const arrowSize = 8
    const arrowAngle = Math.PI / 6
    const arrowX1 = endX - arrowSize * Math.cos(angle - arrowAngle)
    const arrowY1 = endY - arrowSize * Math.sin(angle - arrowAngle)
    const arrowX2 = endX - arrowSize * Math.cos(angle + arrowAngle)
    const arrowY2 = endY - arrowSize * Math.sin(angle + arrowAngle)

    return (
      <g key={`${from}-${to}`}>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="var(--color-trace-primary)"
          strokeWidth="2"
          opacity="0.7"
        />
        <polygon
          points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          fill="var(--color-trace-primary)"
          opacity="0.7"
        />
      </g>
    )
  }

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-family-mono)',
          marginBottom: 'var(--spacing-3)',
          textAlign: 'center',
        }}
      >
        ALGORITHM {algorithm}: {description}
      </div>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
        {/* Draw connections first (behind operators) */}
        {connections.map((conn) => drawArrow(conn.from, conn.to))}

        {/* Draw operators */}
        {[4, 3, 2, 1].map((op) => {
          const pos = positions[op]
          if (!pos) return null

          return (
            <g key={op}>
              <rect
                x={pos.x - opSize / 2}
                y={pos.y - opSize / 2}
                width={opSize}
                height={opSize}
                fill="var(--color-bg-primary)"
                stroke="var(--color-trace-primary)"
                strokeWidth="2"
                rx="4"
              />
              <text
                x={pos.x}
                y={pos.y - 5}
                textAnchor="middle"
                fill="var(--color-trace-primary)"
                fontSize="14"
                fontFamily="var(--font-family-mono)"
                fontWeight="bold"
              >
                OP{op}
              </text>
              <text
                x={pos.x}
                y={pos.y + 12}
                textAnchor="middle"
                fill="var(--color-text-tertiary)"
                fontSize="10"
                fontFamily="var(--font-family-mono)"
              >
                {op === 1 ? 'CARRIER' : 'MODULATOR'}
              </text>
            </g>
          )
        })}

        {/* Draw OUT */}
        {(() => {
          const pos = positions[0]
          if (!pos) return null

          return (
            <g>
              <rect
                x={pos.x - opSize / 1.5}
                y={pos.y - opSize / 2.5}
                width={opSize * 1.3}
                height={opSize / 1.2}
                fill="var(--color-bg-primary)"
                stroke="#FF6464"
                strokeWidth="2"
                rx="4"
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="#FF6464"
                fontSize="16"
                fontFamily="var(--font-family-mono)"
                fontWeight="bold"
              >
                OUT
              </text>
            </g>
          )
        })()}
      </svg>
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-tertiary)',
          fontFamily: 'var(--font-family-mono)',
          marginTop: 'var(--spacing-2)',
          textAlign: 'center',
        }}
      >
        Arrows show modulation flow: Modulator → Carrier
      </div>
    </div>
  )
}
