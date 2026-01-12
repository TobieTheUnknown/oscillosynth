/**
 * Preset Manager
 * Export, import, save, and manage presets
 */

import { useRef } from 'react'
import { Preset } from '../audio/types'

interface PresetManagerProps {
  currentPreset: Preset | null
  allPresets: Preset[]
  onLoadPreset: (presetId: string) => void
  onSavePreset: (preset: Preset) => void
  onDeletePreset: (presetId: string) => void
}

export function PresetManager({
  currentPreset,
  allPresets,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
}: PresetManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportPreset = () => {
    if (!currentPreset) {
      alert('No preset to export')
      return
    }

    const json = JSON.stringify(currentPreset, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentPreset.name.replace(/\s+/g, '_')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportPreset = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const preset = JSON.parse(json) as Preset

        // Validate preset structure
        if (!preset.id || !preset.name || !preset.operators || !preset.lfos) {
          throw new Error('Invalid preset format')
        }

        // Generate new ID to avoid conflicts
        preset.id = `imported-${Date.now()}`

        onSavePreset(preset)
        onLoadPreset(preset.id)
        alert(`Preset "${preset.name}" imported successfully!`)
      } catch (error) {
        alert(`Failed to import preset: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    reader.readAsText(file)

    // Reset input so same file can be imported again
    event.target.value = ''
  }

  const handleSaveAsNew = () => {
    if (!currentPreset) {
      alert('No preset to save')
      return
    }

    const name = prompt('Enter preset name:', `${currentPreset.name} (Copy)`)
    if (!name) return

    const newPreset: Preset = {
      ...currentPreset,
      id: `user-${Date.now()}`,
      name,
    }

    onSavePreset(newPreset)
    onLoadPreset(newPreset.id)
    alert(`Preset "${name}" saved successfully!`)
  }

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-trace-primary)',
          fontFamily: 'var(--font-family-mono)',
          fontWeight: 'bold',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        PRESET MANAGER
      </div>

      {/* Current Preset Info */}
      {currentPreset && (
        <div
          style={{
            marginBottom: 'var(--spacing-4)',
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-mono)',
              marginBottom: 'var(--spacing-1)',
            }}
          >
            Current Preset:
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-md)',
              color: 'var(--color-trace-primary)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
            }}
          >
            {currentPreset.name}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        <button
          onClick={handleExportPreset}
          disabled={!currentPreset}
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-trace-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            cursor: currentPreset ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-family-mono)',
            opacity: currentPreset ? 1 : 0.5,
          }}
        >
          📥 Export JSON
        </button>

        <button
          onClick={handleImportPreset}
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-trace-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            fontFamily: 'var(--font-family-mono)',
          }}
        >
          📤 Import JSON
        </button>

        <button
          onClick={handleSaveAsNew}
          disabled={!currentPreset}
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-trace-primary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            cursor: currentPreset ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-family-mono)',
            opacity: currentPreset ? 1 : 0.5,
          }}
        >
          💾 Save As New
        </button>
      </div>

      {/* Preset List */}
      <div>
        <div
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          Available Presets ({allPresets.length}):
        </div>
        <div
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-bg-primary)',
          }}
        >
          {allPresets.map((preset) => {
            const isFactory = preset.id.includes('default') || preset.id.includes('bass') || preset.id.includes('pad')
            const isCurrent = currentPreset?.id === preset.id

            return (
              <div
                key={preset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-2)',
                  borderBottom: '1px solid var(--color-border-secondary)',
                  backgroundColor: isCurrent ? 'var(--color-active)' : 'transparent',
                }}
              >
                <button
                  onClick={() => {
                    onLoadPreset(preset.id)
                  }}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    padding: 'var(--spacing-1)',
                    backgroundColor: 'transparent',
                    color: isCurrent ? '#000' : 'var(--color-text-secondary)',
                    border: 'none',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                >
                  {preset.name} {isFactory ? '(Factory)' : '(User)'}
                </button>
                {!isFactory && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete preset "${preset.name}"?`)) {
                        onDeletePreset(preset.id)
                      }
                    }}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-2)',
                      backgroundColor: 'transparent',
                      color: '#ff6464',
                      border: '1px solid #ff6464',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
