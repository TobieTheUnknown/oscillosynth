/**
 * AudioTest V2 Component
 * Version avec Zustand stores et hooks
 */

import { useAudioEngine } from '../hooks/useAudioEngine'
import { AlgorithmType } from '../audio/types'
import { Oscilloscope } from './Oscilloscope'
import { LFOVisualizer } from './LFOVisualizer'
import { LFOEditor } from './LFOEditor'

export function AudioTestV2() {
  const {
    isStarted,
    activeVoices,
    maxVoices,
    currentPreset,
    allPresets,
    startAudio,
    loadPreset,
    setAlgorithm,
    noteOn,
    noteOff,
    updateCurrentPresetLFO,
  } = useAudioEngine()

  const playNote = (midiNote: number) => {
    noteOn(midiNote, 100)
    setTimeout(() => {
      noteOff(midiNote)
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
          marginBottom: 'var(--spacing-2)',
          textShadow: '0 0 8px var(--color-trace-glow)',
        }}
      >
        OscilloSynth
      </h1>
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--spacing-6)',
        }}
      >
        FM Synthesizer - Phase 1 Complete
      </p>

      {!isStarted ? (
        <button
          onClick={() => {
            void startAudio()
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
              <strong style={{ color: 'var(--color-text-secondary)' }}>Preset:</strong>{' '}
              {currentPreset?.name ?? 'None'}
            </div>
            <div style={{ marginBottom: 'var(--spacing-2)' }}>
              <strong style={{ color: 'var(--color-text-secondary)' }}>
                Algorithm:
              </strong>{' '}
              {currentPreset?.algorithm ?? '--'}
            </div>
            <div>
              <strong style={{ color: 'var(--color-text-secondary)' }}>
                Active Voices:
              </strong>{' '}
              <span
                style={{
                  color:
                    activeVoices >= maxVoices
                      ? 'var(--color-warning)'
                      : 'var(--color-success)',
                }}
              >
                {activeVoices} / {maxVoices}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-6)', width: '100%' }}>
            <Oscilloscope
              width={Math.min(800, window.innerWidth - 64)}
              height={300}
              lineWidth={2}
              glowIntensity={0.6}
            />
          </div>

          {currentPreset && (
            <div style={{ marginBottom: 'var(--spacing-6)', width: '100%' }}>
              <LFOVisualizer
                lfoParams={currentPreset.lfos}
                combineMode={currentPreset.lfoCombineMode}
                width={Math.min(800, window.innerWidth - 64)}
                height={400}
              />
            </div>
          )}

          {currentPreset && (
            <div style={{ marginBottom: 'var(--spacing-6)', width: '100%' }}>
              <LFOEditor
                lfoParams={currentPreset.lfos}
                onLFOChange={updateCurrentPresetLFO}
              />
            </div>
          )}

          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2
              style={{
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--spacing-3)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Presets
            </h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              {allPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    loadPreset(preset.id)
                  }}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor:
                      currentPreset?.id === preset.id
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
                  {preset.name}
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
                  onClick={() => {
                    setAlgorithm(algo as AlgorithmType)
                  }}
                  style={{
                    padding: 'var(--spacing-2)',
                    backgroundColor:
                      currentPreset?.algorithm === (algo as AlgorithmType)
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
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-tertiary)',
                  marginLeft: 'var(--spacing-2)',
                }}
              >
                or use computer keyboard (A-L keys)
              </span>
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
                    onClick={() => {
                      playNote(note)
                    }}
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
