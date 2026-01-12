/**
 * AudioTest V2 Component
 * Version avec Zustand stores et hooks
 */

import { useState, useEffect, useRef } from 'react'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { AlgorithmType } from '../audio/types'
import { Oscilloscope } from './Oscilloscope'
import { SpectrumAnalyzer } from './SpectrumAnalyzer'
import { OscilloscopeXY } from './OscilloscopeXY'
import { ADSRVisualizer } from './ADSRVisualizer'
import { LFOPairPanel } from './LFOPairPanel'
import { EnvelopeFollowerControl } from './EnvelopeFollowerControl'
import { FMRoutingVisualizer } from './FMRoutingVisualizer'
import { InteractiveKeyboard } from './InteractiveKeyboard'
import { PresetManager } from './PresetManager'
import { OperatorControls } from './OperatorControls'
import { FilterControls } from './FilterControls'
import { MasterEffects } from './MasterEffects'
import { PortamentoControls } from './PortamentoControls'
import { PanControls } from './PanControls'
import { TabBar } from './TabBar'
import { SequencerUI } from './SequencerUI'
import * as Tone from 'tone'

interface Step {
  enabled: boolean
  note: number
}

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
    updateCurrentPresetPortamento,
    updateCurrentPresetStereoWidth,
  } = useAudioEngine()

  const [activeTab, setActiveTab] = useState('PLAY')
  const tabs = ['PLAY', 'SOUND', 'MODULATION', 'EFFECTS', 'VISUALIZE']

  // Sequencer state
  const DEFAULT_STEPS: Step[] = Array.from({ length: 16 }, (_, i) => ({
    enabled: i % 4 === 0,
    note: 60 + (i % 8),
  }))
  const [seqSteps, setSeqSteps] = useState<Step[]>(DEFAULT_STEPS)
  const [seqCurrentStep, setSeqCurrentStep] = useState<number>(-1)
  const [seqIsPlaying, setSeqIsPlaying] = useState(false)
  const [seqBpm, setSeqBpm] = useState(120)
  const [seqGateLength, setSeqGateLength] = useState(50)
  const sequenceRef = useRef<Tone.Sequence<number> | null>(null)
  const activeNoteRef = useRef<number | null>(null)

  // Sequencer cleanup
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose()
        sequenceRef.current = null
      }
      if (activeNoteRef.current !== null) {
        noteOff(activeNoteRef.current)
        activeNoteRef.current = null
      }
    }
  }, [noteOff])

  // Sequencer logic
  useEffect(() => {
    if (!isStarted) {
      if (seqIsPlaying) {
        setSeqIsPlaying(false)
        Tone.Transport.stop()
        if (activeNoteRef.current !== null) {
          noteOff(activeNoteRef.current)
          activeNoteRef.current = null
        }
      }
      return
    }

    if (sequenceRef.current) {
      sequenceRef.current.dispose()
      sequenceRef.current = null
    }

    Tone.Transport.bpm.value = seqBpm

    const sequence = new Tone.Sequence(
      (time, step: number) => {
        Tone.Draw.schedule(() => {
          setSeqCurrentStep(step)
        }, time)

        const currentStepData = seqSteps[step]
        if (currentStepData && currentStepData.enabled) {
          if (activeNoteRef.current !== null) {
            noteOff(activeNoteRef.current)
            activeNoteRef.current = null
          }

          const note = currentStepData.note
          noteOn(note, 100)
          activeNoteRef.current = note

          const stepDuration = 60 / seqBpm / 4
          const noteDuration = stepDuration * (seqGateLength / 100)

          Tone.Transport.scheduleOnce(() => {
            if (activeNoteRef.current === note) {
              noteOff(note)
              activeNoteRef.current = null
            }
          }, time + noteDuration)
        } else {
          if (activeNoteRef.current !== null) {
            Tone.Draw.schedule(() => {
              if (activeNoteRef.current !== null) {
                noteOff(activeNoteRef.current)
                activeNoteRef.current = null
              }
            }, time)
          }
        }
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    )

    sequence.start(0)
    sequenceRef.current = sequence
  }, [seqSteps, seqBpm, seqGateLength, isStarted, noteOn, noteOff, seqIsPlaying])

  const handleSeqPlayStop = () => {
    if (!seqIsPlaying) {
      Tone.Transport.start()
      setSeqIsPlaying(true)
    } else {
      Tone.Transport.stop()
      Tone.Transport.position = 0
      setSeqIsPlaying(false)
      setSeqCurrentStep(-1)
      if (activeNoteRef.current !== null) {
        noteOff(activeNoteRef.current)
        activeNoteRef.current = null
      }
    }
  }

  const handleToggleStep = (index: number) => {
    const newSteps = [...seqSteps]
    const currentStep = newSteps[index]
    if (currentStep) {
      newSteps[index] = { ...currentStep, enabled: !currentStep.enabled }
      setSeqSteps(newSteps)
    }
  }

  const handleSetStepNote = (index: number, note: number) => {
    const newSteps = [...seqSteps]
    const currentStep = newSteps[index]
    if (currentStep) {
      newSteps[index] = { ...currentStep, note }
      setSeqSteps(newSteps)
    }
  }

  const handleClearPattern = () => {
    setSeqSteps(seqSteps.map((step) => ({ ...step, enabled: false })))
  }

  const handleRandomPattern = () => {
    setSeqSteps(
      seqSteps.map(() => ({
        enabled: Math.random() > 0.5,
        note: 48 + Math.floor(Math.random() * 25),
      }))
    )
  }

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

                {/* Right: Keyboard + Sequencer + Preset Manager */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-4)',
                  }}
                >
                  <InteractiveKeyboard onNoteOn={noteOn} onNoteOff={noteOff} isEnabled={isStarted} />
                  <SequencerUI
                    steps={seqSteps}
                    currentStep={seqCurrentStep}
                    isPlaying={seqIsPlaying}
                    bpm={seqBpm}
                    gateLength={seqGateLength}
                    isEnabled={isStarted}
                    onPlayStop={handleSeqPlayStop}
                    onBpmChange={setSeqBpm}
                    onGateChange={setSeqGateLength}
                    onToggleStep={handleToggleStep}
                    onSetStepNote={handleSetStepNote}
                    onClearPattern={handleClearPattern}
                    onRandomPattern={handleRandomPattern}
                  />
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
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 'var(--spacing-3)',
                      marginBottom: 'var(--spacing-4)',
                    }}
                  >
                    {[
                      { value: AlgorithmType.SERIAL, name: 'SERIAL', color: '#FF6464' },
                      { value: AlgorithmType.PARALLEL, name: 'PARALLEL', color: '#64C8FF' },
                      { value: AlgorithmType.DUAL_SERIAL, name: 'DUAL SERIAL', color: '#FFFF64' },
                      { value: AlgorithmType.FAN_OUT, name: 'FAN OUT', color: '#96FF96' },
                      { value: AlgorithmType.SPLIT, name: 'SPLIT', color: '#FF64FF' },
                    ].map((algo) => (
                      <button
                        key={algo.value}
                        onClick={() => {
                          setAlgorithm(algo.value)
                        }}
                        style={{
                          padding: 'var(--spacing-3)',
                          backgroundColor:
                            currentPreset?.algorithm === algo.value
                              ? algo.color
                              : 'var(--color-bg-primary)',
                          color:
                            currentPreset?.algorithm === algo.value
                              ? '#000'
                              : 'var(--color-text-primary)',
                          border: `2px solid ${algo.color}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-sm)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-family-mono)',
                          fontWeight: 'bold',
                          transition: 'all 0.2s',
                          boxShadow:
                            currentPreset?.algorithm === algo.value
                              ? `0 0 15px ${algo.color}`
                              : 'none',
                        }}
                      >
                        {algo.name}
                      </button>
                    ))}
                  </div>
                  <FMRoutingVisualizer algorithm={currentPreset.algorithm} width={700} height={300} />
                </div>

                {/* Portamento Controls */}
                <PortamentoControls
                  params={currentPreset.portamento}
                  onChange={(params) => {
                    updateCurrentPresetPortamento(params)
                  }}
                />

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

                {/* Pan Spread */}
                <div>
                  <PanControls
                    stereoWidth={currentPreset.stereoWidth}
                    operators={currentPreset.operators}
                    onStereoWidthChange={(params) => {
                      updateCurrentPresetStereoWidth(params)
                    }}
                    onOperatorPanChange={(index, pan) => {
                      updateCurrentPresetOperator(index, { pan })
                    }}
                  />
                </div>

                {/* Portamento */}
                <div>
                  <PortamentoControls
                    params={currentPreset.portamento}
                    onChange={(params) => {
                      updateCurrentPresetPortamento(params)
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
