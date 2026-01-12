/**
 * AudioTest V2 Component
 * Version avec Zustand stores et hooks
 */

import { useEffect } from 'react'
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
import { CollapsibleSection } from './CollapsibleSection'

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

  return (
    <div
      style={{
        padding: 'var(--spacing-4)',
        maxWidth: '100vw',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
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

        {/* Status info - compact */}
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--spacing-4)',
            height: 'calc(100vh - 120px)',
          }}
        >
          {/* LEFT COLUMN: Main XY Oscilloscope */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-trace-primary)',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 'bold',
                marginBottom: 'var(--spacing-2)',
                textShadow: '0 0 8px var(--color-trace-glow)',
              }}
            >
              LISSAJOUS (XY)
            </div>
            <OscilloscopeXY width={600} height={600} />
          </div>

          {/* RIGHT COLUMN: All controls and collapsible sections */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
              overflowY: 'auto',
              maxHeight: '100%',
            }}
          >
            {/* Keyboard */}
            <InteractiveKeyboard onNoteOn={noteOn} onNoteOff={noteOff} isEnabled={isStarted} />

            {/* Preset Manager */}
            <PresetManager
              currentPreset={currentPreset}
              allPresets={allPresets}
              onLoadPreset={loadPreset}
              onSavePreset={saveUserPreset}
              onDeletePreset={deleteUserPreset}
            />

            {/* Other Visualizations - Collapsible */}
            <CollapsibleSection title="OTHER VISUALIZATIONS" defaultExpanded={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <SpectrumAnalyzer width={500} height={200} />
                <Oscilloscope width={500} height={150} lineWidth={2} glowIntensity={0.6} />
                {currentPreset && (
                  <ADSRVisualizer operators={currentPreset.operators} width={500} height={150} />
                )}
              </div>
            </CollapsibleSection>

            {/* FM Algorithm & Routing */}
            {currentPreset && (
              <CollapsibleSection title="FM ALGORITHM" defaultExpanded={false}>
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
                <FMRoutingVisualizer algorithm={currentPreset.algorithm} width={500} height={250} />
              </CollapsibleSection>
            )}

            {/* Master Effects */}
            {currentPreset && (
              <CollapsibleSection title="MASTER EFFECTS" defaultExpanded={false}>
                <MasterEffects
                  params={currentPreset.masterEffects}
                  onChange={(params) => {
                    updateCurrentPresetMasterEffects(params)
                  }}
                />
              </CollapsibleSection>
            )}

            {/* LFOs */}
            {currentPreset && (
              <CollapsibleSection title="LFOs (8 x 2 PAIRS)" defaultExpanded={false}>
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
              </CollapsibleSection>
            )}

            {/* Envelope Follower */}
            {currentPreset && (
              <CollapsibleSection title="ENVELOPE FOLLOWER" defaultExpanded={false}>
                <EnvelopeFollowerControl
                  params={currentPreset.envelopeFollower}
                  onChange={(params) => {
                    updateCurrentPresetEnvelopeFollower(params)
                  }}
                />
              </CollapsibleSection>
            )}

            {/* Step Sequencer */}
            {currentPreset && (
              <CollapsibleSection title="STEP SEQUENCER" defaultExpanded={false}>
                <StepSequencerControl
                  params={currentPreset.stepSequencer}
                  onChange={(params) => {
                    updateCurrentPresetStepSequencer(params)
                  }}
                />
              </CollapsibleSection>
            )}

            {/* FM Operators */}
            {currentPreset && (
              <CollapsibleSection title="FM OPERATORS (1-4)" defaultExpanded={false}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
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
              </CollapsibleSection>
            )}

            {/* Filter */}
            {currentPreset && (
              <CollapsibleSection title="FILTER" defaultExpanded={false}>
                <FilterControls
                  params={currentPreset.filter}
                  onChange={(params) => {
                    updateCurrentPresetFilter(params)
                  }}
                />
              </CollapsibleSection>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
