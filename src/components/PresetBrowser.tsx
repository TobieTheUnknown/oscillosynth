/**
 * Preset Browser
 * Compact preset selector with save/load functionality
 */

import { Preset } from '../audio/types'

interface PresetBrowserProps {
  currentPreset: Preset | null
  allPresets: Preset[]
  onPresetChange: (presetId: string) => void
  onSavePreset: (preset: Preset) => void
}

export function PresetBrowser({
  currentPreset,
  allPresets,
  onPresetChange,
  onSavePreset,
}: PresetBrowserProps) {
  const handleSavePreset = () => {
    if (!currentPreset) return

    const presetName = window.prompt('Enter a name for this preset:', currentPreset.name)
    if (!presetName) return

    // Create new preset with unique ID and user category
    const newPreset: Preset = {
      ...currentPreset,
      id: `user-${Date.now()}`,
      name: presetName,
      category: 'User',
    }

    onSavePreset(newPreset)
    onPresetChange(newPreset.id)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-family-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        PRESET
      </div>
      <select
        value={currentPreset?.id ?? ''}
        onChange={(e) => onPresetChange(e.target.value)}
        style={{
          padding: 'var(--spacing-2) var(--spacing-4)',
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-family-mono)',
          cursor: 'pointer',
          minWidth: '250px',
        }}
      >
        {allPresets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleSavePreset}
        style={{
          padding: 'var(--spacing-2) var(--spacing-3)',
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-idle)',
          border: '1px solid var(--color-idle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          const idleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-idle').trim()
          e.currentTarget.style.backgroundColor = `${idleColor}20`
          e.currentTarget.style.boxShadow = `0 0 12px ${idleColor}66`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        💾 SAVE
      </button>
    </div>
  )
}
