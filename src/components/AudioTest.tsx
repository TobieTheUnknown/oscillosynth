/**
 * AudioTest Component
 * Interface de test pour le FM engine
 */

import { useState, useEffect } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { audioContext } from '../audio/AudioContext'
import { defaultPreset, bassPreset, padPreset } from '../audio/presets/defaultPreset'
import { AlgorithmType } from '../audio/types'

export function AudioTest() {
  const [isStarted, setIsStarted] = useState(false)
  const [currentPreset, setCurrentPreset] = useState('default')
  const [currentAlgorithm, setCurrentAlgorithm] = useState(AlgorithmType.FAN_OUT)
  const [activeVoices, setActiveVoices] = useState(0)

  useEffect(() => {
    // Load default preset
    audioEngine.loadPreset(defaultPreset)

    // Update active voices every 100ms
    const interval = setInterval(() => {
      const state = audioEngine.getState()
      setActiveVoices(state.activeVoices)
    }, 100)

    return () => { clearInterval(interval); }
  }, [])

  const handleStart = async () => {
    try {
      await audioEngine.start()
      setIsStarted(true)
    } catch (error) {
      console.error('Failed to start audio:', error)
    }
  }

  const handlePresetChange = (presetId: string) => {
    setCurrentPreset(presetId)
    switch (presetId) {
      case 'default':
        audioEngine.loadPreset(defaultPreset)
        setCurrentAlgorithm(defaultPreset.algorithm)
        break
      case 'bass':
        audioEngine.loadPreset(bassPreset)
        setCurrentAlgorithm(bassPreset.algorithm)
        break
      case 'pad':
        audioEngine.loadPreset(padPreset)
        setCurrentAlgorithm(padPreset.algorithm)
        break
    }
  }

  const handleAlgorithmChange = (algo: AlgorithmType) => {
    setCurrentAlgorithm(algo)
    audioEngine.setAlgorithm(algo)
  }

  const playNote = (midiNote: number) => {
    audioEngine.noteOn(midiNote, 100)
    setTimeout(() => {
      audioEngine.noteOff(midiNote)
    }, 500)
  }

  return (
    <div
      style={{
        padding: 'var(--spacing-8)',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontSize: 'var(--font-size-2xl)',
          color: 'var(--color-trace-primary)',
          marginBottom: 'var(--spacing-6)',
          textShadow: '0 0 8px var(--color-trace-glow)',
        }}
      >
        FM Engine Test
      </h1>

      {!isStarted ? (
        <button
          onClick={() => {
            void handleStart()
          }}
          style={{
            padding: 'var(--spacing-4) var(--spacing-8)',
            backgroundColor: 'transparent',
            color: 'var(--color-trace-primary)',
            border: '2px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-md)',
            cursor: 'pointer',
            fontFamily: 'var(--font-family-mono)',
            minHeight: 'var(--touch-target-min)',
          }}
        >
          Start Audio Engine
        </button>
      ) : (
        <div>
          <div
            style={{
              marginBottom: 'var(--spacing-6)',
              padding: 'var(--spacing-4)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ marginBottom: 'var(--spacing-2)' }}>
              <strong style={{ color: 'var(--color-text-secondary)' }}>Status:</strong>{' '}
              <span style={{ color: 'var(--color-success)' }}>
                {audioContext.getState()}
              </span>
            </div>
            <div>
              <strong style={{ color: 'var(--color-text-secondary)' }}>Active Voices:</strong>{' '}
              {activeVoices} / 8
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2
              style={{
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--spacing-3)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Preset
            </h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              {['default', 'bass', 'pad'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => { handlePresetChange(preset); }}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor:
                      currentPreset === preset
                        ? 'var(--color-active)'
                        : 'transparent',
                    color: 'var(--color-trace-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2
              style={{
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--spacing-3)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Algorithm
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'var(--spacing-2)',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((algo) => (
                <button
                  key={algo}
                  onClick={() => { handleAlgorithmChange(algo as AlgorithmType); }}
                  style={{
                    padding: 'var(--spacing-2)',
                    backgroundColor:
                      currentAlgorithm === (algo as AlgorithmType)
                        ? 'var(--color-active)'
                        : 'transparent',
                    color: 'var(--color-trace-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2
              style={{
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--spacing-3)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Keyboard (C3-C5)
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                gap: 'var(--spacing-2)',
              }}
            >
              {/* C3 to C5 */}
              {[48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72].map(
                (note) => (
                  <button
                    key={note}
                    onClick={() => { playNote(note); }}
                    style={{
                      padding: 'var(--spacing-4) var(--spacing-2)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-trace-primary)',
                      border: '2px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family-mono)',
                      minHeight: 'var(--touch-target-min)',
                    }}
                  >
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'][note % 12 % 7]}
                    {Math.floor(note / 12) - 1}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
