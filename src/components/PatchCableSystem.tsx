/**
 * Patch Cable System
 * Visual drag & drop cable routing for LFO destinations
 */

import { useState, useRef, useCallback } from 'react'
import { LFODestination } from '../audio/types'

interface PatchConnection {
  lfoIndex: number
  destination: LFODestination | string
  color: string
}

interface PatchCableSystemProps {
  connections: PatchConnection[]
  onConnect: (lfoIndex: number, destination: LFODestination | string) => void
  onDisconnect: (lfoIndex: number) => void
  dragging: { lfoIndex: number; color: string } | null
  setDragging: (dragging: { lfoIndex: number; color: string } | null) => void
}

export function PatchCableSystem({ connections, onConnect, onDisconnect, dragging, setDragging }: PatchCableSystemProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  // Destination targets for knobs
  const destinations = [
    { id: 'filter-cutoff', label: 'Filter Cutoff', dest: LFODestination.FILTER_CUTOFF },
    { id: 'filter-reso', label: 'Filter Reso', dest: LFODestination.FILTER_RESONANCE },
    { id: 'reverb', label: 'Reverb', dest: LFODestination.FX_REVERB_WET },
    { id: 'delay', label: 'Delay', dest: LFODestination.FX_DELAY_WET },
    { id: 'op1', label: 'OP1 Ratio', dest: LFODestination.OP1_RATIO },
    { id: 'op2', label: 'OP2 Ratio', dest: LFODestination.OP2_RATIO },
    { id: 'op3', label: 'OP3 Ratio', dest: LFODestination.OP3_RATIO },
    { id: 'op4', label: 'OP4 Ratio', dest: LFODestination.OP4_RATIO },
  ]

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'relative',
        padding: 'var(--spacing-3)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #4ECDC4',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: '#4ECDC4',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-2)',
          textShadow: '0 0 8px #4ECDC4',
          textAlign: 'center',
        }}
      >
        PATCH MATRIX
      </div>

      {/* Destination Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--spacing-2)',
        }}
      >
        {destinations.map((dest) => {
          const connection = connections.find((c) => c.destination === dest.dest)
          return (
            <div
              key={dest.id}
              onMouseUp={() => {
                if (dragging) {
                  onConnect(dragging.lfoIndex, dest.dest)
                  setDragging(null)
                }
              }}
              style={{
                padding: 'var(--spacing-2)',
                backgroundColor: connection ? connection.color + '20' : 'rgba(0, 0, 0, 0.5)',
                border: connection ? `2px solid ${connection.color}` : '2px solid rgba(78, 205, 196, 0.3)',
                borderRadius: 'var(--radius-sm)',
                cursor: dragging ? 'pointer' : 'default',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (dragging) {
                  e.currentTarget.style.backgroundColor = dragging.color + '40'
                  e.currentTarget.style.borderColor = dragging.color
                }
              }}
              onMouseLeave={(e) => {
                if (!connection) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
                  e.currentTarget.style.borderColor = 'rgba(78, 205, 196, 0.3)'
                } else {
                  e.currentTarget.style.backgroundColor = connection.color + '20'
                  e.currentTarget.style.borderColor = connection.color
                }
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-size-xxs)',
                  color: connection ? connection.color : 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-family-mono)',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                {dest.label}
              </div>

              {/* Input Jack */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-10px',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: connection ? connection.color : '#333',
                  border: '2px solid #000',
                  boxShadow: connection ? `0 0 8px ${connection.color}` : 'none',
                }}
              />

              {/* Connection indicator */}
              {connection && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onDisconnect(connection.lfoIndex)
                  }}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#FF6464',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: '#000',
                  }}
                  title="Disconnect"
                >
                  ×
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dragging cable SVG overlay */}
      {dragging && (
        <svg
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <line
            x1={mousePos.x - 100}
            y1={mousePos.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke={dragging.color}
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity="0.8"
          />
        </svg>
      )}
    </div>
  )
}

// Hook to start dragging from LFO pads
export function usePatchDrag(lfoIndex: number, color: string, onDragStart: (lfoIndex: number, color: string) => void) {
  const handlePatchStart = useCallback(() => {
    onDragStart(lfoIndex, color)
  }, [lfoIndex, color, onDragStart])

  return handlePatchStart
}
