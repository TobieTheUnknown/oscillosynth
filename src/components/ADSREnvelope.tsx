/**
 * ADSR Envelope Component
 * Visualizes and controls the master ADSR envelope with patch input
 */

import { useEffect, useRef } from 'react'
import { KnobWithPatchInput } from './KnobWithPatchInput'
import { LFODestination, OperatorParams } from '../audio/types'

interface ADSREnvelopeProps {
  attack: number // 0.001 - 10.0 seconds
  decay: number // 0.001 - 10.0 seconds
  sustain: number // 0 - 1.0
  release: number // 0.001 - 10.0 seconds
  onChange: (params: Partial<OperatorParams>) => void
  lfos?: Array<{ destination: LFODestination; color: string; lfoIndex: number }>
  onPatchConnect?: (destination: LFODestination) => void
  onPatchDisconnect?: (destination: LFODestination) => void
  onEnvelopePatchStart?: () => void
  color?: string
}

export function ADSREnvelope({
  attack,
  decay,
  sustain,
  release,
  onChange,
  lfos = [],
  onPatchConnect,
  onPatchDisconnect,
  onEnvelopePatchStart,
  color = '#00FF41',
}: ADSREnvelopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Find ALL LFO connections for each ADSR parameter (support multiple modulators)
  // Note: We'll use OP1 destinations as master envelope destinations for now
  const attackConnections = lfos.filter((lfo) => lfo.destination === LFODestination.OP1_LEVEL)
  const decayConnections = lfos.filter((lfo) => lfo.destination === LFODestination.OP2_LEVEL)
  const sustainConnections = lfos.filter((lfo) => lfo.destination === LFODestination.OP3_LEVEL)
  const releaseConnections = lfos.filter((lfo) => lfo.destination === LFODestination.OP4_LEVEL)

  // Extract colors for multi-color display
  const attackColors = attackConnections.map(conn => conn.color)
  const decayColors = decayConnections.map(conn => conn.color)
  const sustainColors = sustainConnections.map(conn => conn.color)
  const releaseColors = releaseConnections.map(conn => conn.color)

  // Draw ADSR curve
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    // Calculate time proportions (normalize to fit canvas)
    const totalTime = attack + decay + 0.5 + release // 0.5 for sustain visualization
    const attackWidth = (attack / totalTime) * width
    const decayWidth = (decay / totalTime) * width
    const sustainWidth = (0.5 / totalTime) * width
    const releaseWidth = (release / totalTime) * width

    // Draw ADSR curve
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.shadowBlur = 8
    ctx.shadowColor = color

    // Start at bottom left
    ctx.moveTo(0, height)

    // Attack - rise to peak
    ctx.lineTo(attackWidth, 10)

    // Decay - fall to sustain level
    const sustainY = height - sustain * (height - 10)
    ctx.lineTo(attackWidth + decayWidth, sustainY)

    // Sustain - flat line
    ctx.lineTo(attackWidth + decayWidth + sustainWidth, sustainY)

    // Release - fall to zero
    ctx.lineTo(attackWidth + decayWidth + sustainWidth + releaseWidth, height)

    ctx.stroke()

    // Draw labels
    ctx.shadowBlur = 0
    ctx.font = '10px monospace'
    ctx.fillStyle = color
    ctx.fillText('A', attackWidth / 2 - 5, height - 5)
    ctx.fillText('D', attackWidth + decayWidth / 2 - 5, height - 5)
    ctx.fillText('S', attackWidth + decayWidth + sustainWidth / 2 - 5, height - 5)
    ctx.fillText('R', attackWidth + decayWidth + sustainWidth + releaseWidth / 2 - 5, height - 5)

    // Draw gridlines
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (height * i) / 4)
      ctx.lineTo(width, (height * i) / 4)
      ctx.stroke()
    }
  }, [attack, decay, sustain, release, color])

  return (
    <div
      style={{
        padding: 'var(--spacing-3)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: `2px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-2)',
      }}
    >
      {/* Title with Output Jack */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-2)',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: color,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: `0 0 8px ${color}`,
          }}
        >
          ENVELOPE
        </div>
        {/* Output Jack */}
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'link'
            e.dataTransfer.setData('envelopeOutput', 'true')
            e.dataTransfer.setData('color', color)
            if (onEnvelopePatchStart) onEnvelopePatchStart()
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 8px ${color}`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
            e.currentTarget.style.boxShadow = `0 0 12px ${color}`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = `0 0 8px ${color}`
          }}
          title="Drag to patch envelope output"
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* ADSR Visualization */}
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        style={{
          width: '300px',
          height: '80px',
          border: `1px solid ${color}`,
          borderRadius: 'var(--radius-sm)',
        }}
      />

      {/* ADSR Knobs */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
        <KnobWithPatchInput
          label="Attack"
          value={attack}
          min={0.001}
          max={10}
          step={0.01}
          unit="s"
          color={color}
          size="sm"
          onChange={(attack) => onChange({ attack })}
          destination={LFODestination.OP1_LEVEL} // Temporary destination
          onPatchDrop={onPatchConnect}
          connectionColors={attackColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP1_LEVEL)}
        />
        <KnobWithPatchInput
          label="Decay"
          value={decay}
          min={0.001}
          max={10}
          step={0.01}
          unit="s"
          color={color}
          size="sm"
          onChange={(decay) => onChange({ decay })}
          destination={LFODestination.OP2_LEVEL} // Temporary destination
          onPatchDrop={onPatchConnect}
          connectionColors={decayColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP2_LEVEL)}
        />
        <KnobWithPatchInput
          label="Sustain"
          value={sustain}
          min={0}
          max={1}
          step={0.01}
          color={color}
          size="sm"
          onChange={(sustain) => onChange({ sustain })}
          destination={LFODestination.OP3_LEVEL} // Temporary destination
          onPatchDrop={onPatchConnect}
          connectionColors={sustainColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP3_LEVEL)}
        />
        <KnobWithPatchInput
          label="Release"
          value={release}
          min={0.001}
          max={10}
          step={0.01}
          unit="s"
          color={color}
          size="sm"
          onChange={(release) => onChange({ release })}
          destination={LFODestination.OP4_LEVEL} // Temporary destination
          onPatchDrop={onPatchConnect}
          connectionColors={releaseColors}
          onDisconnect={() => onPatchDisconnect && onPatchDisconnect(LFODestination.OP4_LEVEL)}
        />
      </div>
    </div>
  )
}
