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
  onChange: (value: number) => void
  color?: string
  unit?: string
}

export function Knob({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  color = '#00FF41',
  unit = '',
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)
  const startValueRef = useRef(0)

  const normalizedValue = (value - min) / (max - min)
  const angle = -140 + normalizedValue * 280 // -140° to +140°

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = value
    e.preventDefault()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY
      const range = max - min
      const sensitivity = 0.5
      const delta = (deltaY * sensitivity * range) / 100

      let newValue = startValueRef.current + delta
      newValue = Math.max(min, Math.min(max, newValue))
      newValue = Math.round(newValue / step) * step

      onChange(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-1)',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Knob SVG */}
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        onMouseDown={handleMouseDown}
        style={{
          filter: isDragging ? `drop-shadow(0 0 8px ${color})` : 'none',
        }}
      >
        {/* Outer ring */}
        <circle
          cx="30"
          cy="30"
          r="25"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Inner circle */}
        <circle
          cx="30"
          cy="30"
          r="20"
          fill="#000"
          stroke={color}
          strokeWidth="2"
        />

        {/* Value arc */}
        <circle
          cx="30"
          cy="30"
          r="25"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${normalizedValue * 157} 157`}
          strokeDashoffset="-39.25"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Pointer */}
        <line
          x1="30"
          y1="30"
          x2="30"
          y2="12"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 30 30)`}
        />

        {/* Center dot */}
        <circle cx="30" cy="30" r="3" fill={color} />
      </svg>

      {/* Label */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-family-mono)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: color,
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
        }}
      >
        {value.toFixed(step < 1 ? 1 : 0)}
        {unit}
      </div>
    </div>
  )
}
