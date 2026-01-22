/**
 * Knob Control Component
 * Drag-to-adjust rotary control with SVG arc visualization
 */

import { useRef, useState, useCallback } from 'react'

interface KnobControlProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  unit?: string
  color?: string
  size?: number
  step?: number
}

export function KnobControl({
  value,
  min,
  max,
  onChange,
  label,
  unit = '',
  color = 'var(--color-active)',
  size = 60,
  step,
}: KnobControlProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startValue = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startY.current = e.clientY
    startValue.current = value
    document.body.style.cursor = 'ns-resize'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const deltaY = startY.current - e.clientY
      const range = max - min
      const sensitivity = 0.5
      const scale = range < 20 ? 0.05 : 1

      let newValue = startValue.current + deltaY * scale * sensitivity
      newValue = Math.min(Math.max(newValue, min), max)

      // Apply step if specified
      if (step) {
        newValue = Math.round(newValue / step) * step
      } else {
        // Auto-detect precision
        if (max <= 10) newValue = Math.round(newValue * 10) / 10
        else if (max <= 100) newValue = Math.round(newValue * 10) / 10
        else newValue = Math.round(newValue)
      }

      onChange(newValue)
    },
    [max, min, onChange, step]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.cursor = 'default'
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  // SVG Math for Arc
  const radius = size / 2 - 4
  const circumference = 2 * Math.PI * radius
  const percentage = (value - min) / (max - min)
  const strokeDasharray = `${circumference * 0.75}`
  const strokeDashoffset = circumference * 0.75 * (1 - percentage)
  const rotation = 135

  // Format value for display
  const displayValue = step && step < 1 ? value.toFixed(1) : Math.round(value)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          cursor: 'ns-resize',
          width: `${size}px`,
          height: `${size}px`,
          transition: 'transform 0.1s',
          transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        }}
        onMouseDown={handleMouseDown}
      >
        <svg
          width={size}
          height={size}
          style={{
            transform: 'rotate(-90deg)',
          }}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--color-border-secondary)"
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            strokeLinecap="round"
          />
          {/* Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            strokeLinecap="round"
            style={{
              transition: isDragging ? 'none' : 'stroke-dashoffset 0.075s',
              filter: isDragging ? 'brightness(1.25)' : 'brightness(1)',
            }}
          />
        </svg>

        {/* Inner Knob Visual */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            margin: 'auto',
            width: `${size * 0.7}px`,
            height: `${size * 0.7}px`,
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-tertiary)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--color-border-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '2px',
              height: `${size * 0.35}px`,
              backgroundColor: color,
              borderRadius: '1px',
              position: 'absolute',
              bottom: '50%',
              left: '50%',
              marginLeft: '-1px',
              transformOrigin: 'bottom center',
              transform: `rotate(${45 + percentage * 270}deg)`,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        </div>
      </div>

      {/* Label & Value */}
      <div
        style={{
          marginTop: 'var(--spacing-2)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            color: isDragging ? color : 'var(--color-text-primary)',
            transition: 'color 0.1s',
          }}
        >
          {displayValue}
          {unit}
        </div>
      </div>
    </div>
  )
}
