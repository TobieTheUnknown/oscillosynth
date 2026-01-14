/**
 * Preset Browser Component
 * Browse, save, load, delete, export/import presets
 */

import { useState } from 'react'
import { usePresetStore } from '../store/presetStore'
import { PresetCard } from './PresetCard'
import { audioEngine } from '../audio/AudioEngine'
import { Preset } from '../audio/types'

interface PresetBrowserProps {
  onClose?: () => void
}

export function PresetBrowser({ onClose }: PresetBrowserProps) {
  const {
    presets,
    userPresets,
    currentPresetId,
    loadPreset,
    saveUserPreset,
    deleteUserPreset,
  } = usePresetStore()

  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetCategory, setNewPresetCategory] = useState('')

  /**
   * Save current settings as a new user preset
   */
  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    const currentPreset = audioEngine.getCurrentPreset()
    if (!currentPreset) {
      alert('No preset loaded')
      return
    }

    const newPreset: Preset = {
      ...currentPreset,
      id: `user-${Date.now()}`,
      name: newPresetName.trim(),
      category: newPresetCategory.trim() || 'User',
    }

    saveUserPreset(newPreset)
    setShowSaveDialog(false)
    setNewPresetName('')
    setNewPresetCategory('')
    loadPreset(newPreset.id) // Auto-load the new preset
  }

  /**
   * Export all user presets as JSON
   */
  const handleExport = () => {
    const dataStr = JSON.stringify(userPresets, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `oscillosynth-presets-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Import user presets from JSON file
   */
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as Preset[]
          if (!Array.isArray(imported)) {
            alert('Invalid preset file format')
            return
          }

          // Save all imported presets
          imported.forEach((preset) => {
            saveUserPreset(preset)
          })

          alert(`Imported ${imported.length} preset(s)`)
        } catch (err) {
          alert('Error importing presets: ' + (err as Error).message)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  /**
   * Export current preset as JSON
   */
  const handleExportCurrent = () => {
    const currentPreset = audioEngine.getCurrentPreset()
    if (!currentPreset) {
      alert('No preset loaded')
      return
    }

    const dataStr = JSON.stringify(currentPreset, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentPreset.name.replace(/\s+/g, '-')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        overflow: 'auto',
        padding: 'var(--spacing-4)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-4)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-trace-primary)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              textShadow: '0 0 8px var(--color-trace-glow)',
            }}
          >
            PRESET BROWSER
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'var(--font-size-md)',
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-2)',
            marginBottom: 'var(--spacing-4)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'var(--color-success)',
              border: '2px solid var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              color: '#000',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            💾 SAVE CURRENT
          </button>

          <button
            onClick={handleExportCurrent}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            📤 EXPORT CURRENT
          </button>

          <button
            onClick={handleExport}
            disabled={userPresets.length === 0}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor:
                userPresets.length === 0 ? '#333' : 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              color:
                userPresets.length === 0
                  ? '#666'
                  : 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: userPresets.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            📦 EXPORT ALL ({userPresets.length})
          </button>

          <button
            onClick={handleImport}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            📥 IMPORT
          </button>
        </div>

        {/* Save dialog */}
        {showSaveDialog && (
          <div
            style={{
              padding: 'var(--spacing-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-active)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-4)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
                marginBottom: 'var(--spacing-3)',
              }}
            >
              SAVE NEW PRESET
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <input
                type="text"
                placeholder="Preset name (required)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                style={{
                  padding: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />

              <input
                type="text"
                placeholder="Category (optional)"
                value={newPresetCategory}
                onChange={(e) => setNewPresetCategory(e.target.value)}
                style={{
                  padding: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />

              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <button
                  onClick={handleSavePreset}
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-2)',
                    backgroundColor: 'var(--color-success)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#000',
                    fontFamily: 'var(--font-family-mono)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  SAVE
                </button>

                <button
                  onClick={() => {
                    setShowSaveDialog(false)
                    setNewPresetName('')
                    setNewPresetCategory('')
                  }}
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-2)',
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-mono)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Factory Presets */}
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <div
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-3)',
            }}
          >
            FACTORY PRESETS
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--spacing-3)',
            }}
          >
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={currentPresetId === preset.id}
                isUserPreset={false}
                onSelect={() => loadPreset(preset.id)}
              />
            ))}
          </div>
        </div>

        {/* User Presets */}
        {userPresets.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
                marginBottom: 'var(--spacing-3)',
              }}
            >
              USER PRESETS ({userPresets.length})
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--spacing-3)',
              }}
            >
              {userPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isActive={currentPresetId === preset.id}
                  isUserPreset={true}
                  onSelect={() => loadPreset(preset.id)}
                  onDelete={() => {
                    if (
                      confirm(`Delete preset "${preset.name}"?`)
                    ) {
                      deleteUserPreset(preset.id)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {userPresets.length === 0 && (
          <div
            style={{
              padding: 'var(--spacing-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px dashed var(--color-border-primary)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-mono)',
              fontStyle: 'italic',
            }}
          >
            No user presets yet. Click "SAVE CURRENT" to create your first preset.
          </div>
        )}
      </div>
    </div>
  )
}
