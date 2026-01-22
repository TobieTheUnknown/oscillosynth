/**
 * Idle Color Picker
 * Allows customization of the idle/default color used throughout the UI
 */

import { useState } from 'react'

const DEFAULT_IDLE_COLOR = '#F5DEB3' // Wheat/Beige

export function IdleColorPicker() {
  const [idleColor, setIdleColor] = useState(DEFAULT_IDLE_COLOR)
  const [isOpen, setIsOpen] = useState(false)

  const handleColorChange = (newColor: string) => {
    setIdleColor(newColor)
    // Update CSS custom property for global idle color
    document.documentElement.style.setProperty('--color-idle', newColor)
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
      {/* Color indicator button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          border: `2px solid ${idleColor}`,
          backgroundColor: idleColor,
          cursor: 'pointer',
          boxShadow: `0 0 8px ${idleColor}`,
          transition: 'all 0.2s ease',
        }}
        title="Change idle color"
      />

      {/* Dropdown color picker */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            backgroundColor: 'var(--color-bg-secondary)',
            border: `2px solid ${idleColor}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            minWidth: '200px',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: idleColor,
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-2)',
              textShadow: `0 0 4px ${idleColor}`,
            }}
          >
            IDLE COLOR
          </div>

          {/* HTML5 color input */}
          <input
            type="color"
            value={idleColor}
            onChange={(e) => handleColorChange(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          />

          {/* Preset colors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--spacing-2)',
              marginTop: 'var(--spacing-3)',
            }}
          >
            {[
              '#4ECDC4', // Cyan (default)
              '#FFD700', // Gold
              '#FFFFFF', // White
              '#C0C0C0', // Silver
              '#FF1493', // Deep Pink
              '#00CED1', // Dark Turquoise
              '#DDA0DD', // Plum
              '#F5DEB3', // Wheat
            ].map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${color === idleColor ? color : 'transparent'}`,
                  backgroundColor: color,
                  cursor: 'pointer',
                  boxShadow: color === idleColor ? `0 0 8px ${color}` : 'none',
                }}
                title={color}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              marginTop: 'var(--spacing-3)',
              width: '100%',
              padding: 'var(--spacing-2)',
              backgroundColor: 'transparent',
              border: `1px solid ${idleColor}`,
              borderRadius: 'var(--radius-sm)',
              color: idleColor,
              fontFamily: 'var(--font-family-mono)',
              fontSize: 'var(--font-size-xs)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = idleColor
              e.currentTarget.style.color = 'var(--color-bg-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = idleColor
            }}
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  )
}
