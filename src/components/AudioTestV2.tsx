/**
 * AudioTest V2 Component
 * Version avec Zustand stores et hooks
 */

import { useEffect, useState } from 'react'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { AlgorithmType } from '../audio/types'
import { Oscilloscope } from './Oscilloscope'
import { SpectrumAnalyzer } from './SpectrumAnalyzer'
import { OscilloscopeXY } from './OscilloscopeXY'
import { ADSRVisualizer } from './ADSRVisualizer'
import { LFOPairPanel } from './LFOPairPanel'
import { EnvelopeFollowerControl } from './EnvelopeFollowerControl'
import { StepSequencerControl } from './StepSequencerControl'
import { FMRoutingVisualizer } from './FMRoutingVisualizer'
import { InteractiveKeyboard } from './InteractiveKeyboard'
import { PresetManager } from './PresetManager'
import { OperatorControls } from './OperatorControls'
import { FilterControls } from './FilterControls'
import { MasterEffects } from './MasterEffects'
import { TabBar } from './TabBar'

export function AudioTestV2() {
  const {
    isStarted,
    activeVoices,
    maxVoices,
    currentPreset,
    allPresets,
    startAudio,
    loadPreset,
    saveUserPreset,
    deleteUserPreset,
    setAlgorithm,
    noteOn,
    noteOff,
    updateCurrentPresetLFO,
    updateCurrentPresetOperator,
    updateCurrentPresetFilter,
    updateCurrentPresetMasterEffects,
    updateCurrentPresetEnvelopeFollower,
    updateCurrentPresetStepSequencer,
  } = useAudioEngine()

  const [activeTab, setActiveTab] = useState('PLAY')
  const tabs = ['PLAY', 'SOUND', 'MODULATION', 'EFFECTS', 'VISUALIZE']

  // Load preset from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const presetParam = urlParams.get('preset')

    if (presetParam) {
      try {
        const json = atob(presetParam)
        const preset = JSON.parse(json)

        // Validate preset structure
        if (preset.id && preset.name && preset.operators && preset.lfos) {
          // Generate new ID
          preset.id = `shared-${Date.now()}`
          saveUserPreset(preset)
          loadPreset(preset.id)

          // Clean URL
          window.history.replaceState({}, '', window.location.pathname)

          alert(`Shared preset "${preset.name}" loaded successfully!`)
        }
      } catch (error) {
        console.error('Failed to load preset from URL:', error)
      }
    }
  }, [saveUserPreset, loadPreset])

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
    <div
      style={{
        padding: 'var(--spacing-4)',
        maxWidth: '100vw',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-trace-primary)',
              marginBottom: 'var(--spacing-1)',
              textShadow: '0 0 8px var(--color-trace-glow)',
            }}
          >
            OscilloSynth
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            FM Synthesizer
          </p>
        </div>

        {/* Status info */}
        {isStarted && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-3)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            <div>
              <strong>Preset:</strong> {currentPreset?.name ?? 'None'}
            </div>
            <div>
              <strong>Algo:</strong> {currentPreset?.algorithm ?? '--'}
            </div>
            <div>
              <strong>Voices:</strong>{' '}
              <span
                style={{
                  color:
                    activeVoices >= maxVoices ? 'var(--color-warning)' : 'var(--color-success)',
                }}
              >
                {activeVoices}/{maxVoices}
              </span>
            </div>
          </div>
        )}
      </div>

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
          {/* Tab Navigation */}
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {/* PLAY TAB */}
            {activeTab === 'PLAY' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 'var(--spacing-4)',
                  alignItems: 'start',
                }}
              >
                {/* Left: XY Oscilloscope */}
                <div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-trace-primary)',
                      fontFamily: 'var(--font-family-mono)',
                      fontWeight: 'bold',
                      marginBottom: 'var(--spacing-2)',
                      textAlign: 'center',
                    }}
                  >
                    LISSAJOUS (XY)
                  </div>
                  <OscilloscopeXY width={500} height={500} />
                </div>

                {/* Right: Keyboard + Preset Manager */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-4)',
                  }}
                >
                  <InteractiveKeyboard onNoteOn={noteOn} onNoteOff={noteOff} isEnabled={isStarted} />
                  <PresetManager
                    currentPreset={currentPreset}
                    allPresets={allPresets}
                    onLoadPreset={loadPreset}
                    onSavePreset={saveUserPreset}
                    onDeletePreset={deleteUserPreset}
                  />
                </div>
              </div>
            )}

            {/* SOUND TAB */}
            {activeTab === 'SOUND' && currentPreset && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-4)',
                }}
              >
                {/* Algorithm Selector */}
                <div>
                  <h2
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-3)',
                      fontFamily: 'var(--font-family-mono)',
                      fontWeight: 'bold',
                    }}
                  >
                    FM ALGORITHM
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: 'var(--spacing-2)',
                      marginBottom: 'var(--spacing-3)',
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
                  <FMRoutingVisualizer algorithm={currentPreset.algorithm} width={700} height={300} />
                </div>

                {/* Operators in 2x2 grid */}
                <div>
                  <h2
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-3)',
                      fontFamily: 'var(--font-family-mono)',
                      fontWeight: 'bold',
                    }}
                  >
                    FM OPERATORS
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 'var(--spacing-3)',
                    }}
                  >
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
                </div>

                {/* Filter */}
                <div>
                  <h2
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-3)',
                      fontFamily: 'var(--font-family-mono)',
                      fontWeight: 'bold',
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
              </div>
            )}

            {/* MODULATION TAB */}
            {activeTab === 'MODULATION' && currentPreset && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-4)',
                }}
              >
                {/* LFOs */}
                <div>
                  <h2
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-3)',
                      fontFamily: 'var(--font-family-mono)',
                      fontWeight: 'bold',
                    }}
                  >
                    LFOs (8 x 2 PAIRS)
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--spacing-3)',
                    }}
                  >
                    {[1, 2, 3, 4].map((pairNum) => {
                      const pairNumber = pairNum as 1 | 2 | 3 | 4
                      const lfo1Index = ((pairNum - 1) * 2) as 0 | 2 | 4 | 6
                      const lfo2Index = ((pairNum - 1) * 2 + 1) as 1 | 3 | 5 | 7

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
                </div>

                {/* Envelope Follower */}
                <div>
                  <h2
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-3)',
                      fontFamily: 'var(--font-family-mono)',
                      fontWeight: 'bold',
                    }}
                  >
                    ENVELOPE FOLLOWER
                  </h2>
                  <EnvelopeFollowerControl
                    params={currentPreset.envelopeFollower}
                    onChange={(params) => {
                      updateCurrentPresetEnvelopeFollower(params)
                    }}
                  />
                </div>

                {/* Step Sequencer */}
                <div>
                  <h2
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-3)',
                      fontFamily: 'var(--font-family-mono)',
                      fontWeight: 'bold',
                    }}
                  >
                    STEP SEQUENCER
                  </h2>
                  <StepSequencerControl
                    params={currentPreset.stepSequencer}
                    onChange={(params) => {
                      updateCurrentPresetStepSequencer(params)
                    }}
                  />
                </div>
              </div>
            )}

            {/* EFFECTS TAB */}
            {activeTab === 'EFFECTS' && currentPreset && (
              <div>
                <h2
                  style={{
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--color-trace-primary)',
                    marginBottom: 'var(--spacing-3)',
                    fontFamily: 'var(--font-family-mono)',
                    fontWeight: 'bold',
                  }}
                >
                  MASTER EFFECTS
                </h2>
                <MasterEffects
                  params={currentPreset.masterEffects}
                  onChange={(params) => {
                    updateCurrentPresetMasterEffects(params)
                  }}
                />
              </div>
            )}

            {/* VISUALIZE TAB */}
            {activeTab === 'VISUALIZE' && currentPreset && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--spacing-4)',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--font-size-md)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-2)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    SPECTRUM ANALYZER
                  </h3>
                  <SpectrumAnalyzer width={550} height={300} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--font-size-md)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-2)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    OSCILLOSCOPE
                  </h3>
                  <Oscilloscope width={550} height={300} lineWidth={2} glowIntensity={0.6} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--font-size-md)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-2)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    LISSAJOUS (XY)
                  </h3>
                  <OscilloscopeXY width={550} height={550} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--font-size-md)',
                      color: 'var(--color-trace-primary)',
                      marginBottom: 'var(--spacing-2)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    ADSR ENVELOPES
                  </h3>
                  <ADSRVisualizer operators={currentPreset.operators} width={550} height={300} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
