/**
 * Knob/Potentiometer Component
 * Rotary control with oscilloscope aesthetic
 */

import { useRef, useState, useEffect } from 'react'

interface KnobProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  defaultValue?: number // Value to reset to on double-click (defaults to middle of range)
  onChange: (value: number) => void
  color?: string
  connectionColor?: string | null // LFO connection color - overrides default color when connected (deprecated - use connectionColors)
  connectionColors?: string[] // Multiple modulator colors (LFOs + envelope)
  unit?: string
  hideNumericValue?: boolean // Hide the numeric value display (show only unit)
  size?: 'sm' | 'md' | 'lg' | 'xl' // Visual hierarchy: sm=60px, md=80px(default), lg=96px, xl=120px
}

export function Knob({
  label,
  value,
  min,
  max,
  step = 0.1,
  defaultValue,
  onChange,
  color = 'var(--color-idle)',
  connectionColor = null,
  connectionColors = [],
  unit = '',
  hideNumericValue = false,
  size = 'md',
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [sensitivityMode, setSensitivityMode] = useState<'normal' | 'fine' | 'ultra'>('normal')
  const [isBouncing, setIsBouncing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const startValueRef = useRef(0)

  // Knob circle radius and circumference
  const KNOB_RADIUS = 25
  const KNOB_CIRCUMFERENCE = 2 * Math.PI * KNOB_RADIUS // ~157.08

  // Default value is middle of range if not specified
  const resetValue = defaultValue !== undefined ? defaultValue : (min + max) / 2

  // Use connection colors if multiple modulators, or single connection color, or default color
  const hasMultipleConnections = connectionColors.length > 0
  const activeColors = hasMultipleConnections ? connectionColors : (connectionColor ? [connectionColor] : [color])
  const activeColor = activeColors[0] // Primary color for UI elements

  // Map size prop to pixel values (matching CSS variables)
  const sizeMap = { sm: 60, md: 80, lg: 96, xl: 120 }
  const knobSize = sizeMap[size]

  const normalizedValue = (value - min) / (max - min)
  const angle = -140 + normalizedValue * 280 // -140° to +140°

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = value
    e.preventDefault()
  }

  const handleDoubleClick = () => {
    // Reset to default value with bounce animation
    const roundedReset = Math.round(resetValue / step) * step
    onChange(roundedReset)

    // Trigger bounce animation
    setIsBouncing(true)
    setTimeout(() => setIsBouncing(false), 300)
  }

  const handleValueClick = () => {
    setIsEditing(true)
    setEditValue(value.toFixed(step < 1 ? 1 : 0))
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleEditBlur = () => {
    const parsed = parseFloat(editValue)
    if (!isNaN(parsed)) {
      let newValue = Math.max(min, Math.min(max, parsed))
      newValue = Math.round(newValue / step) * step
      onChange(newValue)
    }
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return

    const increment = e.shiftKey ? step : step * 10

    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      const newValue = Math.min(max, value + increment)
      onChange(Math.round(newValue / step) * step)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const newValue = Math.max(min, value - increment)
      onChange(Math.round(newValue / step) * step)
    }
  }

  const handleWheel = (e: WheelEvent) => {
    if (isEditing) return
    e.preventDefault()

    const increment = e.shiftKey ? step : step * 5
    const direction = e.deltaY < 0 ? 1 : -1
    const newValue = value + (direction * increment)
    const clampedValue = Math.max(min, Math.min(max, newValue))
    onChange(Math.round(clampedValue / step) * step)
  }

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Register wheel event as non-passive to allow preventDefault
  useEffect(() => {
    const knobElement = knobRef.current
    if (!knobElement) return

    knobElement.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      knobElement.removeEventListener('wheel', handleWheel)
    }
  }, [isEditing, value, min, max, step, onChange])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY
      const range = max - min

      // Adaptive sensitivity based on modifier keys
      let sensitivity = 0.5 // Normal sensitivity
      let mode: 'normal' | 'fine' | 'ultra' = 'normal'

      if (e.shiftKey && e.ctrlKey) {
        sensitivity = 0.02 // Ultra-fine: 25x slower (Shift+Ctrl)
        mode = 'ultra'
      } else if (e.shiftKey) {
        sensitivity = 0.1 // Fine: 5x slower (Shift only)
        mode = 'fine'
      }

      setSensitivityMode(mode)

      const delta = (deltaY * sensitivity * range) / 100

      let newValue = startValueRef.current + delta
      newValue = Math.max(min, Math.min(max, newValue))
      newValue = Math.round(newValue / step) * step

      onChange(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setSensitivityMode('normal')
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, min, max, step, onChange])

  return (
    <div
      ref={knobRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-1)',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        outline: 'none',
      }}
    >
      {/* Knob SVG */}
      <svg
        width={knobSize}
        height={knobSize}
        viewBox="0 0 60 60"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          filter: isDragging
            ? `drop-shadow(0 0 12px ${activeColor}) drop-shadow(0 0 4px ${activeColor})`
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
          transform: isBouncing ? 'scale(1.15)' : 'scale(1)',
          transition: isBouncing ? 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          {/* Gradient for 3D effect */}
          <radialGradient id={`knob-gradient-${label}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="70%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Glow filter */}
          <filter id={`knob-glow-${label}`}>
            <feGaussianBlur stdDeviation="1.5" result="activeColoredBlur"/>
            <feMerge>
              <feMergeNode in="activeColoredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks (graduations) */}
        {Array.from({ length: 11 }).map((_, i) => {
          const tickAngle = -140 + (i * 280 / 10)
          const isActive = normalizedValue >= i / 10
          const tickLength = i % 5 === 0 ? 4 : 2 // Longer marks at 0, 50, 100%
          const rad = (tickAngle * Math.PI) / 180
          const x1 = 30 + Math.cos(rad - Math.PI / 2) * 27
          const y1 = 30 + Math.sin(rad - Math.PI / 2) * 27
          const x2 = 30 + Math.cos(rad - Math.PI / 2) * (27 - tickLength)
          const y2 = 30 + Math.sin(rad - Math.PI / 2) * (27 - tickLength)

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? activeColor : '#333'}
              strokeWidth={i % 5 === 0 ? 2 : 1}
              opacity={isActive ? 0.8 : 0.3}
            />
          )
        })}

        {/* Outer ring with glow */}
        <circle
          cx="30"
          cy="30"
          r="25"
          fill="none"
          stroke={activeColor}
          strokeWidth="1.5"
          opacity="0.2"
        />

        {/* Inner circle with 3D gradient */}
        <circle
          cx="30"
          cy="30"
          r="20"
          fill={`url(#knob-gradient-${label})`}
          stroke={activeColor}
          strokeWidth="2"
        />

        {/* Highlight for 3D effect */}
        <ellipse
          cx="28"
          cy="25"
          rx="8"
          ry="6"
          fill="#ffffff"
          opacity="0.1"
        />

        {/* Background fixed arcs for multiple connections */}
        {hasMultipleConnections && activeColors.map((connectionColor, index) => {
          const totalArcs = activeColors.length
          const segmentLength = KNOB_CIRCUMFERENCE / totalArcs
          const segmentOffset = -(KNOB_CIRCUMFERENCE / 4) - (index * segmentLength)

          return (
            <circle
              key={`bg-${index}`}
              cx="30"
              cy="30"
              r={KNOB_RADIUS}
              fill="none"
              stroke={connectionColor}
              strokeWidth="2"
              strokeDasharray={`${segmentLength} ${KNOB_CIRCUMFERENCE}`}
              strokeDashoffset={segmentOffset}
              strokeLinecap="round"
              opacity="0.15"
            />
          )
        })}

        {/* Value arc with glow - segmented for multiple connections */}
        {hasMultipleConnections ? (
          // Multiple arcs for multiple modulators
          activeColors.map((connectionColor, index) => {
            const totalArcs = activeColors.length
            const segmentLength = KNOB_CIRCUMFERENCE / totalArcs
            const arcLength = normalizedValue * segmentLength
            const segmentOffset = -(KNOB_CIRCUMFERENCE / 4) - (index * segmentLength)

            return (
              <circle
                key={index}
                cx="30"
                cy="30"
                r={KNOB_RADIUS}
                fill="none"
                stroke={connectionColor}
                strokeWidth="3"
                strokeDasharray={`${arcLength} ${KNOB_CIRCUMFERENCE}`}
                strokeDashoffset={segmentOffset}
                strokeLinecap="round"
                opacity="0.9"
                filter={`url(#knob-glow-${label})`}
              />
            )
          })
        ) : (
          // Single arc for single or no connection
          <circle
            cx="30"
            cy="30"
            r={KNOB_RADIUS}
            fill="none"
            stroke={activeColor}
            strokeWidth="3"
            strokeDasharray={`${normalizedValue * KNOB_CIRCUMFERENCE} ${KNOB_CIRCUMFERENCE}`}
            strokeDashoffset={-(KNOB_CIRCUMFERENCE / 4)}
            strokeLinecap="round"
            opacity="0.9"
            filter={`url(#knob-glow-${label})`}
          />
        )}

        {/* Pointer with glow */}
        <line
          x1="30"
          y1="30"
          x2="30"
          y2="12"
          stroke={activeColor}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 30 30)`}
          filter={`url(#knob-glow-${label})`}
        />

        {/* Center dot with glow - always idle color */}
        <circle
          cx="30"
          cy="30"
          r="3"
          fill={color}
          filter={`url(#knob-glow-${label})`}
        />
      </svg>

      {/* Label */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          activeColor: 'var(--activeColor-text-secondary)',
          fontFamily: 'var(--font-family-mono)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>

      {/* Value (editable on click) */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditBlur}
          onKeyDown={handleEditKeyDown}
          style={{
            width: `${knobSize}px`,
            fontSize: 'var(--font-size-sm)',
            activeColor: activeColor,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: '#000',
            border: `1px solid ${activeColor}`,
            borderRadius: '2px',
            padding: '2px',
            outline: 'none',
          }}
        />
      ) : (
        <div
          onClick={handleValueClick}
          style={{
            fontSize: 'var(--font-size-sm)',
            activeColor: activeColor,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: 'text',
            padding: '2px 4px',
            borderRadius: '2px',
            transition: 'background-activeColor 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {!hideNumericValue && value.toFixed(step < 1 ? 1 : 0)}
          {hideNumericValue && '\u00A0'}
          {unit}
        </div>
      )}

      {/* Sensitivity mode indicator (only during drag) */}
      {isDragging && sensitivityMode !== 'normal' && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            activeColor: sensitivityMode === 'ultra' ? '#FF6B00' : '#FFD700',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '-4px',
          }}
        >
          {sensitivityMode === 'ultra' ? 'ULTRA-FINE' : 'FINE'}
        </div>
      )}
    </div>
  )
}
