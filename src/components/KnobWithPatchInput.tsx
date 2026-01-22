/**
 * Knob With Patch Input
 * Wrapper around Knob that enables drag & drop patch connections
 * Drop zone is the entire knob - it changes color when LFO is connected
 */

import { Knob } from './Knob'
import { LFODestination } from '../audio/types'

interface KnobWithPatchInputProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  onChange: (value: number) => void
  destination: LFODestination
  onPatchDrop?: (destination: LFODestination) => void
  connectionColor?: string | null // Deprecated - use connectionColors
  connectionColors?: string[] // Multiple modulator colors
  onDisconnect?: () => void
}

export function KnobWithPatchInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  size = 'md',
  onChange,
  destination,
  onPatchDrop,
  connectionColor,
  connectionColors,
  onDisconnect,
}: KnobWithPatchInputProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'link'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if it's an LFO drop
    const lfoIndexStr = e.dataTransfer.getData('lfoIndex')
    if (lfoIndexStr && onPatchDrop) {
      onPatchDrop(destination)
      return
    }

    // Check if it's an envelope drop
    const envelopeOutput = e.dataTransfer.getData('envelopeOutput')
    if (envelopeOutput === 'true' && onPatchDrop) {
      onPatchDrop(destination)
      return
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // If there's a connection, click to disconnect
    const hasConnection = (connectionColors && connectionColors.length > 0) || connectionColor
    if (hasConnection && onDisconnect) {
      // Only disconnect on direct click, not during knob drag
      const target = e.target as HTMLElement
      if (target.tagName === 'svg' || target.closest('svg')) {
        e.stopPropagation()
        onDisconnect()
      }
    }
  }

  const hasConnection = (connectionColors && connectionColors.length > 0) || connectionColor

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: hasConnection ? 'pointer' : 'default',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      title={hasConnection ? 'Click to disconnect' : 'Drop LFO cable here'}
    >
      <Knob
        label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        unit={unit}
        color={color}
        connectionColor={connectionColor}
        connectionColors={connectionColors}
        size={size}
        onChange={onChange}
      />
    </div>
  )
}
