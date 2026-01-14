/**
 * Knob Variants
 * Specialized knob components for different value types
 */

import { useRef, useState, useEffect } from 'react'

/**
 * BipolarKnob - For values centered at 0 (e.g., pan, detune)
 * Features:
 * - Center marker at 0
 * - Dual-color gradient (negative/positive)
 * - Default value is 0
 */
interface BipolarKnobProps {
  label: string
  value: number
  min: number // Should be negative (e.g., -1, -100)
  max: number // Should be positive (e.g., 1, 100)
  step?: number
  onChange: (value: number) => void
  color?: string
  colorNegative?: string // Color for negative values
  unit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' // Visual hierarchy
}

export function BipolarKnob({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  color = '#00FF41',
  colorNegative = '#FF4136',
  unit = '',
  size = 'md',
}: BipolarKnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [sensitivityMode, setSensitivityMode] = useState<'normal' | 'fine' | 'ultra'>('normal')
  const [isBouncing, setIsBouncing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const startValueRef = useRef(0)

  // Map size prop to pixel values
  const sizeMap = { sm: 60, md: 80, lg: 96, xl: 120 }
  const knobSize = sizeMap[size]

  const normalizedValue = (value - min) / (max - min)
  const angle = -140 + normalizedValue * 280 // -140° to +140°

  // Center position (for 0 value)
  const centerNormalized = (0 - min) / (max - min)

  // Current color based on value
  const currentColor = value >= 0 ? color : colorNegative

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = value
    e.preventDefault()
  }

  const handleDoubleClick = () => {
    // Reset to center (0) with bounce animation
    onChange(0)
    setIsBouncing(true)
    setTimeout(() => setIsBouncing(false), 300)
  }

  const handleValueClick = () => {
    setIsEditing(true)
    setEditValue(value.toFixed(step < 1 ? 2 : 0))
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

  const handleWheel = (e: React.WheelEvent) => {
    if (isEditing) return
    e.preventDefault()

    const increment = e.shiftKey ? step : step * 5
    const direction = e.deltaY < 0 ? 1 : -1
    const newValue = value + (direction * increment)
    const clampedValue = Math.max(min, Math.min(max, newValue))
    onChange(Math.round(clampedValue / step) * step)
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY
      const range = max - min

      let sensitivity = 0.5
      let mode: 'normal' | 'fine' | 'ultra' = 'normal'

      if (e.shiftKey && e.ctrlKey) {
        sensitivity = 0.02
        mode = 'ultra'
      } else if (e.shiftKey) {
        sensitivity = 0.1
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
      onWheel={handleWheel}
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
      <svg
        width={knobSize}
        height={knobSize}
        viewBox="0 0 60 60"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          filter: isDragging
            ? `drop-shadow(0 0 12px ${currentColor}) drop-shadow(0 0 4px ${currentColor})`
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
          transform: isBouncing ? 'scale(1.15)' : 'scale(1)',
          transition: isBouncing ? 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          <radialGradient id={`knob-gradient-${label}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="70%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <filter id={`knob-glow-${label}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks with center emphasis */}
        {Array.from({ length: 11 }).map((_, i) => {
          const tickAngle = -140 + (i * 280 / 10)
          const isActive = normalizedValue >= i / 10
          const isCenterTick = Math.abs((i / 10) - centerNormalized) < 0.05
          const tickLength = isCenterTick ? 6 : (i % 5 === 0 ? 4 : 2)
          const rad = (tickAngle * Math.PI) / 180
          const x1 = 30 + Math.cos(rad - Math.PI / 2) * 27
          const y1 = 30 + Math.sin(rad - Math.PI / 2) * 27
          const x2 = 30 + Math.cos(rad - Math.PI / 2) * (27 - tickLength)
          const y2 = 30 + Math.sin(rad - Math.PI / 2) * (27 - tickLength)

          // Color based on position relative to center
          let tickColor = '#333'
          if (isCenterTick) {
            tickColor = '#888' // Bright center marker
          } else if (isActive) {
            tickColor = (i / 10) < centerNormalized ? colorNegative : color
          }

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={tickColor}
              strokeWidth={isCenterTick ? 3 : (i % 5 === 0 ? 2 : 1)}
              opacity={isActive || isCenterTick ? 0.8 : 0.3}
            />
          )
        })}

        {/* Outer ring */}
        <circle
          cx="30"
          cy="30"
          r="25"
          fill="none"
          stroke={currentColor}
          strokeWidth="1.5"
          opacity="0.2"
        />

        {/* Inner circle */}
        <circle
          cx="30"
          cy="30"
          r="20"
          fill={`url(#knob-gradient-${label})`}
          stroke={currentColor}
          strokeWidth="2"
        />

        {/* Highlight */}
        <ellipse
          cx="28"
          cy="25"
          rx="8"
          ry="6"
          fill="#ffffff"
          opacity="0.1"
        />

        {/* Value arc with dual color */}
        {value >= 0 ? (
          // Positive arc (from center to value)
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(normalizedValue - centerNormalized) * 157} 157`}
            strokeDashoffset={-39.25 - (centerNormalized * 157)}
            strokeLinecap="round"
            opacity="0.9"
            filter={`url(#knob-glow-${label})`}
          />
        ) : (
          // Negative arc (from value to center)
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke={colorNegative}
            strokeWidth="3"
            strokeDasharray={`${(centerNormalized - normalizedValue) * 157} 157`}
            strokeDashoffset={-39.25 - (normalizedValue * 157)}
            strokeLinecap="round"
            opacity="0.9"
            filter={`url(#knob-glow-${label})`}
          />
        )}

        {/* Pointer */}
        <line
          x1="30"
          y1="30"
          x2="30"
          y2="12"
          stroke={currentColor}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 30 30)`}
          filter={`url(#knob-glow-${label})`}
        />

        {/* Center dot */}
        <circle
          cx="30"
          cy="30"
          r="3"
          fill={currentColor}
          filter={`url(#knob-glow-${label})`}
        />
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
            color: currentColor,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: '#000',
            border: `1px solid ${currentColor}`,
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
            color: currentColor,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: 'text',
            padding: '2px 4px',
            borderRadius: '2px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {value >= 0 ? '+' : ''}{value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </div>
      )}

      {/* Sensitivity mode indicator */}
      {isDragging && sensitivityMode !== 'normal' && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: sensitivityMode === 'ultra' ? '#FF6B00' : '#FFD700',
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

/**
 * LogKnob - For logarithmic values (e.g., frequency, filter cutoff)
 * Maps linear drag to logarithmic value for better control over wide ranges
 */
interface LogKnobProps {
  label: string
  value: number
  min: number
  max: number
  defaultValue?: number
  onChange: (value: number) => void
  color?: string
  unit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' // Visual hierarchy
}

export function LogKnob({
  label,
  value,
  min,
  max,
  defaultValue,
  onChange,
  color = '#00FF41',
  unit = '',
  size = 'md',
}: LogKnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [sensitivityMode, setSensitivityMode] = useState<'normal' | 'fine' | 'ultra'>('normal')
  const [isBouncing, setIsBouncing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const startValueRef = useRef(0)

  const resetValue = defaultValue !== undefined ? defaultValue : Math.sqrt(min * max)

  // Map size prop to pixel values
  const sizeMap = { sm: 60, md: 80, lg: 96, xl: 120 }
  const knobSize = sizeMap[size]

  // Logarithmic mapping
  const logMin = Math.log(min)
  const logMax = Math.log(max)
  const logValue = Math.log(value)
  const normalizedValue = (logValue - logMin) / (logMax - logMin)
  const angle = -140 + normalizedValue * 280

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = value
    e.preventDefault()
  }

  const handleDoubleClick = () => {
    onChange(resetValue)
    setIsBouncing(true)
    setTimeout(() => setIsBouncing(false), 300)
  }

  const handleValueClick = () => {
    setIsEditing(true)
    setEditValue(value.toFixed(value >= 1000 ? 0 : value >= 100 ? 1 : 2))
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleEditBlur = () => {
    const parsed = parseFloat(editValue)
    if (!isNaN(parsed)) {
      const newValue = Math.max(min, Math.min(max, parsed))
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

    // Increment is exponential for log scale
    const multiplier = e.shiftKey ? 1.01 : 1.05

    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      const newValue = Math.min(max, value * multiplier)
      onChange(newValue)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const newValue = Math.max(min, value / multiplier)
      onChange(newValue)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (isEditing) return
    e.preventDefault()

    const multiplier = e.shiftKey ? 1.01 : 1.05
    const direction = e.deltaY < 0 ? 1 : -1
    const newValue = direction > 0 ? value * multiplier : value / multiplier
    const clampedValue = Math.max(min, Math.min(max, newValue))
    onChange(clampedValue)
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY

      let sensitivity = 0.5
      let mode: 'normal' | 'fine' | 'ultra' = 'normal'

      if (e.shiftKey && e.ctrlKey) {
        sensitivity = 0.02
        mode = 'ultra'
      } else if (e.shiftKey) {
        sensitivity = 0.1
        mode = 'fine'
      }

      setSensitivityMode(mode)

      // Map linear drag to logarithmic value
      const logRange = logMax - logMin
      const logStart = Math.log(startValueRef.current)
      const delta = (deltaY * sensitivity * logRange) / 100

      let newLogValue = logStart + delta
      newLogValue = Math.max(logMin, Math.min(logMax, newLogValue))

      const newValue = Math.exp(newLogValue)
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
  }, [isDragging, logMin, logMax, onChange])

  return (
    <div
      ref={knobRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
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
      <svg
        width={knobSize}
        height={knobSize}
        viewBox="0 0 60 60"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          filter: isDragging
            ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 4px ${color})`
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
          transform: isBouncing ? 'scale(1.15)' : 'scale(1)',
          transition: isBouncing ? 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          <radialGradient id={`knob-gradient-${label}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="70%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <filter id={`knob-glow-${label}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const tickAngle = -140 + (i * 280 / 10)
          const isActive = normalizedValue >= i / 10
          const tickLength = i % 5 === 0 ? 4 : 2
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
              stroke={isActive ? color : '#333'}
              strokeWidth={i % 5 === 0 ? 2 : 1}
              opacity={isActive ? 0.8 : 0.3}
            />
          )
        })}

        <circle cx="30" cy="30" r="25" fill="none" stroke={color} strokeWidth="1.5" opacity="0.2" />
        <circle cx="30" cy="30" r="20" fill={`url(#knob-gradient-${label})`} stroke={color} strokeWidth="2" />
        <ellipse cx="28" cy="25" rx="8" ry="6" fill="#ffffff" opacity="0.1" />

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
          opacity="0.9"
          filter={`url(#knob-glow-${label})`}
        />

        <line
          x1="30"
          y1="30"
          x2="30"
          y2="12"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 30 30)`}
          filter={`url(#knob-glow-${label})`}
        />

        <circle cx="30" cy="30" r="3" fill={color} filter={`url(#knob-glow-${label})`} />
      </svg>

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
            color: color,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: '#000',
            border: `1px solid ${color}`,
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
            color: color,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: 'text',
            padding: '2px 4px',
            borderRadius: '2px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {value >= 1000 ? value.toFixed(0) : value >= 100 ? value.toFixed(1) : value.toFixed(2)}
          {unit}
        </div>
      )}

      {isDragging && sensitivityMode !== 'normal' && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: sensitivityMode === 'ultra' ? '#FF6B00' : '#FFD700',
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

/**
 * TimeKnob - For time values with automatic unit conversion
 * Features:
 * - Automatic ms/s formatting
 * - Logarithmic scale for better control
 * - Smart formatting (0.001s → 1ms)
 */
interface TimeKnobProps {
  label: string
  value: number // Always in seconds
  min: number // In seconds (e.g., 0.001 = 1ms)
  max: number // In seconds (e.g., 10 = 10s)
  defaultValue?: number
  onChange: (value: number) => void
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' // Visual hierarchy
}

export function TimeKnob({
  label,
  value,
  min,
  max,
  defaultValue,
  onChange,
  color = '#00FF41',
  size = 'md',
}: TimeKnobProps) {
  // Format time value for display
  const formatTime = (seconds: number): { value: string; unit: string } => {
    if (seconds < 1) {
      return {
        value: (seconds * 1000).toFixed(seconds * 1000 < 10 ? 1 : 0),
        unit: 'ms',
      }
    } else {
      return {
        value: seconds.toFixed(seconds < 10 ? 2 : 1),
        unit: 's',
      }
    }
  }

  const { unit } = formatTime(value)

  // Use LogKnob internally with proper defaultValue handling
  return (
    <LogKnob
      label={label}
      value={value}
      min={min}
      max={max}
      {...(defaultValue !== undefined && { defaultValue })}
      onChange={onChange}
      color={color}
      unit={unit}
      size={size}
    />
  )
}

/**
 * PercentageKnob - For percentage values (0-100%)
 * Simplified wrapper around Knob with fixed range
 */
interface PercentageKnobProps {
  label: string
  value: number
  defaultValue?: number
  onChange: (value: number) => void
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' // Visual hierarchy
}

export function PercentageKnob({
  label,
  value,
  defaultValue = 50,
  onChange,
  color = '#00FF41',
  size = 'md',
}: PercentageKnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [sensitivityMode, setSensitivityMode] = useState<'normal' | 'fine' | 'ultra'>('normal')
  const [isBouncing, setIsBouncing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const startValueRef = useRef(0)

  // Map size prop to pixel values
  const sizeMap = { sm: 60, md: 80, lg: 96, xl: 120 }
  const knobSize = sizeMap[size]

  const normalizedValue = value / 100
  const angle = -140 + normalizedValue * 280

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = value
    e.preventDefault()
  }

  const handleDoubleClick = () => {
    onChange(defaultValue)
    setIsBouncing(true)
    setTimeout(() => setIsBouncing(false), 300)
  }

  const handleValueClick = () => {
    setIsEditing(true)
    setEditValue(value.toFixed(0))
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleEditBlur = () => {
    const parsed = parseFloat(editValue)
    if (!isNaN(parsed)) {
      const newValue = Math.max(0, Math.min(100, Math.round(parsed)))
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

    const increment = e.shiftKey ? 1 : 5

    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault()
      const newValue = Math.min(100, value + increment)
      onChange(newValue)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const newValue = Math.max(0, value - increment)
      onChange(newValue)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (isEditing) return
    e.preventDefault()

    const increment = e.shiftKey ? 1 : 5
    const direction = e.deltaY < 0 ? 1 : -1
    const newValue = value + (direction * increment)
    const clampedValue = Math.max(0, Math.min(100, newValue))
    onChange(Math.round(clampedValue))
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY

      let sensitivity = 0.5
      let mode: 'normal' | 'fine' | 'ultra' = 'normal'

      if (e.shiftKey && e.ctrlKey) {
        sensitivity = 0.02
        mode = 'ultra'
      } else if (e.shiftKey) {
        sensitivity = 0.1
        mode = 'fine'
      }

      setSensitivityMode(mode)

      const delta = (deltaY * sensitivity * 100) / 100

      let newValue = startValueRef.current + delta
      newValue = Math.max(0, Math.min(100, newValue))
      newValue = Math.round(newValue)

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
  }, [isDragging, onChange])

  return (
    <div
      ref={knobRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
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
      <svg
        width={knobSize}
        height={knobSize}
        viewBox="0 0 60 60"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{
          filter: isDragging
            ? `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 4px ${color})`
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
          transform: isBouncing ? 'scale(1.15)' : 'scale(1)',
          transition: isBouncing ? 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          <radialGradient id={`knob-gradient-${label}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="70%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <filter id={`knob-glow-${label}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const tickAngle = -140 + (i * 280 / 10)
          const isActive = normalizedValue >= i / 10
          const tickLength = i % 5 === 0 ? 4 : 2
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
              stroke={isActive ? color : '#333'}
              strokeWidth={i % 5 === 0 ? 2 : 1}
              opacity={isActive ? 0.8 : 0.3}
            />
          )
        })}

        <circle cx="30" cy="30" r="25" fill="none" stroke={color} strokeWidth="1.5" opacity="0.2" />
        <circle cx="30" cy="30" r="20" fill={`url(#knob-gradient-${label})`} stroke={color} strokeWidth="2" />
        <ellipse cx="28" cy="25" rx="8" ry="6" fill="#ffffff" opacity="0.1" />

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
          opacity="0.9"
          filter={`url(#knob-glow-${label})`}
        />

        <line
          x1="30"
          y1="30"
          x2="30"
          y2="12"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 30 30)`}
          filter={`url(#knob-glow-${label})`}
        />

        <circle cx="30" cy="30" r="3" fill={color} filter={`url(#knob-glow-${label})`} />
      </svg>

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
            color: color,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            textAlign: 'center',
            backgroundColor: '#000',
            border: `1px solid ${color}`,
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
            color: color,
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 'bold',
            cursor: 'text',
            padding: '2px 4px',
            borderRadius: '2px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 255, 65, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {value.toFixed(0)}%
        </div>
      )}

      {isDragging && sensitivityMode !== 'normal' && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: sensitivityMode === 'ultra' ? '#FF6B00' : '#FFD700',
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
