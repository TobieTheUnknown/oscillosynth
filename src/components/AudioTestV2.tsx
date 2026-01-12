/**
 * AudioTest V2 Component
 * Version avec Zustand stores et hooks
 */

import { useAudioEngine } from '../hooks/useAudioEngine'
import { AlgorithmType } from '../audio/types'
import { Oscilloscope } from './Oscilloscope'
import { SpectrumAnalyzer } from './SpectrumAnalyzer'
import { OscilloscopeXY } from './OscilloscopeXY'
import { ADSRVisualizer } from './ADSRVisualizer'
import { LFOPairPanel } from './LFOPairPanel'
import { OperatorControls } from './OperatorControls'
import { FilterControls } from './FilterControls'
import { MasterEffects } from './MasterEffects'

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
    updateCurrentPresetOperator,
    updateCurrentPresetFilter,
    updateCurrentPresetMasterEffects,
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

          {/* Visualizations Section */}
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                marginBottom: 'var(--spacing-4)',
                color: 'var(--color-trace-primary)',
                textShadow: '0 0 8px var(--color-trace-glow)',
              }}
            >
              VISUALIZATIONS
            </h2>

            {/* Main Oscilloscope */}
            <div style={{ marginBottom: 'var(--spacing-4)', width: '100%' }}>
              <Oscilloscope
                width={Math.min(800, window.innerWidth - 64)}
                height={300}
                lineWidth={2}
                glowIntensity={0.6}
              />
            </div>

            {/* Side by side: Spectrum + XY */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-4)',
              }}
            >
              <SpectrumAnalyzer width={Math.min(400, (window.innerWidth - 96) / 2)} height={300} />
              <OscilloscopeXY width={Math.min(400, (window.innerWidth - 96) / 2)} height={300} />
            </div>

            {/* ADSR Visualizer */}
            {currentPreset && (
              <ADSRVisualizer
                operators={currentPreset.operators}
                width={Math.min(800, window.innerWidth - 64)}
                height={200}
              />
            )}
          </div>

          {/* Master Effects with visualizer */}
          {currentPreset && (
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <MasterEffects
                params={currentPreset.masterEffects}
                onChange={(params) => {
                  updateCurrentPresetMasterEffects(params)
                }}
              />
            </div>
          )}

          {/* LFO Pair Panels - Integrated visualizer and controls */}
          {currentPreset && (
            <div
              style={{
                marginBottom: 'var(--spacing-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-4)',
              }}
            >
              {[1, 2, 3, 4].map((pairNum) => {
                const pairNumber = pairNum as 1 | 2 | 3 | 4
                const lfo1Index = ((pairNum - 1) * 2) as 0 | 2 | 4 | 6
                const lfo2Index = ((pairNum - 1) * 2 + 1) as 1 | 3 | 5 | 7

                const LFO_COLORS = [
                  '#00FF41',
                  '#00FFFF',
                  '#FFFF00',
                  '#FF64FF',
                  '#64C8FF',
                  '#FF9664',
                  '#96FF96',
                  '#FF6496',
                ]

                return (
                  <LFOPairPanel
                    key={pairNumber}
                    pairNumber={pairNumber}
                    lfo1Params={currentPreset.lfos[lfo1Index]}
                    lfo2Params={currentPreset.lfos[lfo2Index]}
                    lfo1Index={lfo1Index}
                    lfo2Index={lfo2Index}
                    destination={currentPreset.lfos[lfo1Index].destination}
                    color1={LFO_COLORS[lfo1Index] ?? '#00FF41'}
                    color2={LFO_COLORS[lfo2Index] ?? '#00FFFF'}
                    onLFO1Change={(params) => {
                      updateCurrentPresetLFO(lfo1Index, params)
                    }}
                    onLFO2Change={(params) => {
                      updateCurrentPresetLFO(lfo2Index, params)
                    }}
                    onDestinationChange={(destination) => {
                      updateCurrentPresetLFO(lfo1Index, { destination })
                      updateCurrentPresetLFO(lfo2Index, { destination })
                    }}
                  />
                )
              })}
            </div>
          )}

          {/* FM Operators */}
          {currentPreset && (
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2
                style={{
                  fontSize: 'var(--font-size-xl)',
                  marginBottom: 'var(--spacing-4)',
                  color: 'var(--color-trace-primary)',
                  textShadow: '0 0 8px var(--color-trace-glow)',
                }}
              >
                FM OPERATORS
              </h2>
              {[1, 2, 3, 4].map((opNum) => {
                const opIndex = (opNum - 1) as 0 | 1 | 2 | 3
                return (
                  <OperatorControls
                    key={opNum}
                    operatorNumber={opNum as 1 | 2 | 3 | 4}
                    params={currentPreset.operators[opIndex]}
                    onChange={(params) => {
                      updateCurrentPresetOperator(opIndex, params)
                    }}
                  />
                )
              })}
            </div>
          )}

          {/* Filter */}
          {currentPreset && (
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <h2
                style={{
                  fontSize: 'var(--font-size-xl)',
                  marginBottom: 'var(--spacing-4)',
                  color: 'var(--color-trace-primary)',
                  textShadow: '0 0 8px var(--color-trace-glow)',
                }}
              >
                FILTER
              </h2>
              <FilterControls
                params={currentPreset.filter}
                onChange={(params) => {
                  updateCurrentPresetFilter(params)
                }}
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
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 'var(--spacing-2)',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((algo) => (
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
