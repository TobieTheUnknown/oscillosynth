/**
 * Preset Card Component
 * Visual card for preset selection with algorithm badge
 */

import { Preset } from '../audio/types'

interface PresetCardProps {
  preset: Preset
  isActive: boolean
  isUserPreset: boolean
  onSelect: () => void
  onDelete?: () => void
}

export function PresetCard({
  preset,
  isActive,
  isUserPreset,
  onSelect,
  onDelete,
}: PresetCardProps) {
  const cardColor = isActive ? 'var(--color-active)' : 'var(--color-bg-secondary)'
  const borderColor = isActive ? 'var(--color-active)' : 'var(--color-border-primary)'
  const textColor = isActive ? '#000' : 'var(--color-text-primary)'

  // Algorithm badge colors
  const algoColors: Record<string, string> = {
    SERIAL: '#FF6B6B',
    PARALLEL: '#4ECDC4',
    DUAL_SERIAL: '#FFE66D',
    FAN_OUT: '#A8E6CF',
    SPLIT: '#FF8B94',
  }

  const algoColor = algoColors[preset.algorithm] ?? '#888'

  return (
    <div
      style={{
        position: 'relative',
        padding: 'var(--spacing-3)',
        backgroundColor: cardColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2)',
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--color-trace-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--color-border-primary)'
        }
      }}
    >
      {/* Delete button (user presets only) */}
      {isUserPreset && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          style={{
            position: 'absolute',
            top: 'var(--spacing-2)',
            right: 'var(--spacing-2)',
            width: '20px',
            height: '20px',
            padding: 0,
            backgroundColor: '#FF4136',
            border: 'none',
            borderRadius: '50%',
            color: '#FFF',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ×
        </button>
      )}

      {/* Preset name */}
      <div
        style={{
          fontSize: 'var(--font-size-md)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          color: textColor,
          marginBottom: 'var(--spacing-1)',
        }}
      >
        {preset.name}
      </div>

      {/* Algorithm badge */}
      <div
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          backgroundColor: algoColor,
          color: '#000',
          fontSize: 'var(--font-size-xs)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          borderRadius: 'var(--radius-sm)',
          alignSelf: 'flex-start',
        }}
      >
        {preset.algorithm}
      </div>

      {/* Category/tag */}
      {preset.category && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-mono)',
            color: isActive ? '#000' : 'var(--color-text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {preset.category}
        </div>
      )}

      {/* User preset indicator */}
      {isUserPreset && (
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--spacing-2)',
            right: 'var(--spacing-2)',
            fontSize: 'var(--font-size-xs)',
            color: isActive ? '#000' : 'var(--color-text-tertiary)',
          }}
        >
          👤
        </div>
      )}
    </div>
  )
}
