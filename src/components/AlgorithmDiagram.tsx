/**
 * Algorithm Diagram
 * Visual representation of FM algorithm routing
 */

import { AlgorithmType } from '../audio/types'

interface AlgorithmDiagramProps {
  algorithm: AlgorithmType
  color?: string
}

export function AlgorithmDiagram({ algorithm, color = '#00FF41' }: AlgorithmDiagramProps) {
  const renderDiagram = () => {
    const opSize = 16
    const gap = 12
    const lineColor = color
    const opColor = color

    switch (algorithm) {
      case AlgorithmType.SERIAL:
        // 4→3→2→1→OUT
        return (
          <svg width="120" height="40" viewBox="0 0 120 40">
            {/* Operators */}
            <circle cx="15" cy="20" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="45" cy="20" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="75" cy="20" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="105" cy="20" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            {/* Labels */}
            <text x="15" y="24" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">4</text>
            <text x="45" y="24" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">3</text>
            <text x="75" y="24" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">2</text>
            <text x="105" y="24" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">1</text>
            {/* Connections */}
            <line x1="23" y1="20" x2="37" y2="20" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="53" y1="20" x2="67" y2="20" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="83" y1="20" x2="97" y2="20" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* Arrow marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={lineColor} />
              </marker>
            </defs>
          </svg>
        )

      case AlgorithmType.PARALLEL:
        // 4+3+2+1→OUT
        return (
          <svg width="120" height="70" viewBox="0 0 120 70">
            {/* Operators */}
            <circle cx="30" cy="15" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="30" cy="35" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="30" cy="55" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="60" cy="35" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="90" cy="35" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            {/* Labels */}
            <text x="30" y="19" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">4</text>
            <text x="30" y="39" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">3</text>
            <text x="30" y="59" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">2</text>
            <text x="60" y="39" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">1</text>
            <text x="90" y="39" fill={opColor} fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>
            {/* Connections */}
            <line x1="38" y1="15" x2="52" y2="30" stroke={lineColor} strokeWidth="2" />
            <line x1="38" y1="35" x2="52" y2="35" stroke={lineColor} strokeWidth="2" />
            <line x1="38" y1="55" x2="52" y2="40" stroke={lineColor} strokeWidth="2" />
            <line x1="68" y1="35" x2="82" y2="35" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={lineColor} />
              </marker>
            </defs>
          </svg>
        )

      case AlgorithmType.FAN_OUT:
        // 4→(3+2+1)→OUT
        return (
          <svg width="120" height="70" viewBox="0 0 120 70">
            {/* Operators */}
            <circle cx="20" cy="35" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="60" cy="15" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="60" cy="35" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="60" cy="55" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="100" cy="35" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            {/* Labels */}
            <text x="20" y="39" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">4</text>
            <text x="60" y="19" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">3</text>
            <text x="60" y="39" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">2</text>
            <text x="60" y="59" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">1</text>
            <text x="100" y="39" fill={opColor} fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>
            {/* Connections */}
            <line x1="28" y1="35" x2="52" y2="20" stroke={lineColor} strokeWidth="2" />
            <line x1="28" y1="35" x2="52" y2="35" stroke={lineColor} strokeWidth="2" />
            <line x1="28" y1="35" x2="52" y2="50" stroke={lineColor} strokeWidth="2" />
            <line x1="68" y1="15" x2="92" y2="30" stroke={lineColor} strokeWidth="2" />
            <line x1="68" y1="35" x2="92" y2="35" stroke={lineColor} strokeWidth="2" />
            <line x1="68" y1="55" x2="92" y2="40" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={lineColor} />
              </marker>
            </defs>
          </svg>
        )

      case AlgorithmType.SPLIT:
        // (4+3)→2→1→OUT
        return (
          <svg width="120" height="60" viewBox="0 0 120 60">
            {/* Operators */}
            <circle cx="20" cy="20" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="20" cy="40" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="55" cy="30" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="90" cy="30" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            {/* Labels */}
            <text x="20" y="24" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">4</text>
            <text x="20" y="44" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">3</text>
            <text x="55" y="34" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">2</text>
            <text x="90" y="34" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">1</text>
            {/* Connections */}
            <line x1="28" y1="20" x2="47" y2="25" stroke={lineColor} strokeWidth="2" />
            <line x1="28" y1="40" x2="47" y2="35" stroke={lineColor} strokeWidth="2" />
            <line x1="63" y1="30" x2="82" y2="30" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={lineColor} />
              </marker>
            </defs>
          </svg>
        )

      case AlgorithmType.DUAL_SERIAL:
      default:
        // (4→3)+(2→1)→OUT
        return (
          <svg width="120" height="60" viewBox="0 0 120 60">
            {/* Top chain */}
            <circle cx="20" cy="20" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="50" cy="20" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            {/* Bottom chain */}
            <circle cx="20" cy="40" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            <circle cx="50" cy="40" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            {/* Output */}
            <circle cx="90" cy="30" r={opSize / 2} fill={opColor} opacity="0.3" stroke={opColor} strokeWidth="1.5" />
            {/* Labels */}
            <text x="20" y="24" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">4</text>
            <text x="50" y="24" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">3</text>
            <text x="20" y="44" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">2</text>
            <text x="50" y="44" fill={opColor} fontSize="10" fontFamily="monospace" textAnchor="middle">1</text>
            <text x="90" y="34" fill={opColor} fontSize="9" fontFamily="monospace" textAnchor="middle">OUT</text>
            {/* Connections */}
            <line x1="28" y1="20" x2="42" y2="20" stroke={lineColor} strokeWidth="2" />
            <line x1="28" y1="40" x2="42" y2="40" stroke={lineColor} strokeWidth="2" />
            <line x1="58" y1="20" x2="82" y2="25" stroke={lineColor} strokeWidth="2" />
            <line x1="58" y1="40" x2="82" y2="35" stroke={lineColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={lineColor} />
              </marker>
            </defs>
          </svg>
        )
    }
  }

  return (
    <div
      style={{
        padding: 'var(--spacing-2)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: `1px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {renderDiagram()}
    </div>
  )
}
