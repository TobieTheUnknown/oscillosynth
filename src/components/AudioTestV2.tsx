/**
 * AudioTestV2 - Redesigned Ultra-Compact Layout
 * Everything on one screen - centered oscilloscope with compact controls
 */

import { useState, useEffect } from 'react'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { OscilloscopeXY } from './OscilloscopeXY'
import { IntegratedOscilloscopeControls } from './IntegratedOscilloscopeControls'
import { InlineKeyboard } from './InlineKeyboard'
import { SimplifiedSynthEngine } from './SimplifiedSynthEngine'
import { CompactFilterSection } from './CompactFilterSection'
import { CompactEffectsSection } from './CompactEffectsSection'
import { CompactSynthSection } from './CompactSynthSection'
import { ADSREnvelope } from './ADSREnvelope'
import { LFOPad } from './LFOPad'
import { PresetBrowser } from './PresetBrowser'
import { NoiseGenerator } from './NoiseGenerator'
import { IdleColorPicker } from './IdleColorPicker'
import { usePresetStore } from '../store/presetStore'
import { LFODestination } from '../audio/types'
import * as Tone from 'tone'

// Color palette
const COLORS = {
  cyan: '#4ECDC4',
  rose: '#FF6B9D',
  yellow: '#FFE66D',
  violet: '#8A2BE2',
}

// LFO colors for 8 LFOs (softened/pastel versions)
const LFO_COLORS = [
  '#FF6B6B', // LFO 1: Soft Red
  '#6B9DFF', // LFO 2: Soft Blue
  '#9FFF9F', // LFO 3: Soft Green
  '#B19CD9', // LFO 4: Soft Violet
  '#5FD3F3', // LFO 5: Soft Cyan
  '#FFB380', // LFO 6: Soft Orange
  '#7FFFD4', // LFO 7: Soft Mint (Aquamarine)
  '#FFB3D9', // LFO 8: Soft Pink
]

export function AudioTestV2() {
  const {
    isStarted,
    activeVoices,
    maxVoices,
    currentPreset,
    startAudio,
    setAlgorithm,
    noteOn,
    noteOff,
    setMasterVolume,
    updateCurrentPresetLFO,
    updateCurrentPresetOperator,
    updateCurrentPresetFilter,
    updateCurrentPresetMasterEffects,
    updateCurrentPresetSynthEngine,
    setNoiseType,
    setNoiseLevel,
    setNoiseFilterCutoff,
    setNoiseFilterResonance,
    setEnvelopeDestinations,
    getModulatedValues,
  } = useAudioEngine()

  const { loadPreset, getAllPresets, saveUserPreset } = usePresetStore()

  // Latch mode for keyboard
  const [latchMode, setLatchMode] = useState(true)
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())

  // Live View mode - show modulated values in real-time
  const [liveViewEnabled, setLiveViewEnabled] = useState(false)
  const [modulatedValues, setModulatedValues] = useState<Record<string, number>>({})

  // Poll modulated values when Live View is enabled
  useEffect(() => {
    if (!liveViewEnabled || !isStarted) {
      setModulatedValues({})
      return
    }

    // Poll at 30fps (every ~33ms) for smooth visual updates
    const interval = setInterval(() => {
      const values = getModulatedValues()
      setModulatedValues(values)
    }, 33)

    return () => clearInterval(interval)
  }, [liveViewEnabled, isStarted, getModulatedValues])

  // Helper to get display value (modulated if Live View enabled, otherwise base)
  const getDisplayValue = (baseValue: number, modulatedKey: string): number => {
    if (liveViewEnabled && modulatedKey in modulatedValues) {
      return modulatedValues[modulatedKey]
    }
    return baseValue
  }

  // Create display params with modulated values when Live View is enabled
  const getDisplayFilter = () => {
    if (!currentPreset) return null
    return {
      ...currentPreset.filter,
      cutoff: getDisplayValue(currentPreset.filter.cutoff, 'filterCutoff'),
      resonance: getDisplayValue(currentPreset.filter.resonance, 'filterResonance'),
    }
  }

  const getDisplayEffects = () => {
    if (!currentPreset) return null
    return {
      ...currentPreset.masterEffects,
      reverbWet: getDisplayValue(currentPreset.masterEffects.reverbWet, 'reverbWet'),
      delayWet: getDisplayValue(currentPreset.masterEffects.delayWet, 'delayWet'),
      chorusWet: getDisplayValue(currentPreset.masterEffects.chorusWet, 'chorusWet'),
    }
  }

  const getDisplaySynthEngine = () => {
    if (!currentPreset) return null
    return {
      ...currentPreset.synthEngine,
      detune: getDisplayValue(currentPreset.synthEngine.detune, 'detune'),
      fmIndex: getDisplayValue(currentPreset.synthEngine.fmIndex, 'fmIndex'),
      brightness: getDisplayValue(currentPreset.synthEngine.brightness, 'brightness'),
    }
  }

  const getDisplayOperators = () => {
    if (!currentPreset) return null
    return currentPreset.operators.map((op, index) => ({
      ...op,
      level: getDisplayValue(op.level, `op${index + 1}Level`),
      ratio: getDisplayValue(op.ratio, `op${index + 1}Ratio`),
    }))
  }

  // Noise generator state (UI only, audio is controlled directly)
  const [noiseType, setNoiseTypeUI] = useState<'white' | 'pink' | 'brown'>('white')
  const [noiseLevel, setNoiseLevelUI] = useState(0)
  const [noiseFilterCutoff, setNoiseFilterCutoffUI] = useState(5000)
  const [noiseFilterResonance, setNoiseFilterResonanceUI] = useState(1)

  // Patch cable dragging state
  const [draggingLfoIndex, setDraggingLfoIndex] = useState<number | null>(null)
  const [draggingEnvelope, setDraggingEnvelope] = useState(false)

  // Envelope connections (destinations where envelope modulates)
  const [envelopeDestinations, setEnvelopeDestinationsLocal] = useState<LFODestination[]>([])

  // Sync envelope destinations with audio engine
  useEffect(() => {
    if (setEnvelopeDestinations) {
      setEnvelopeDestinations(envelopeDestinations)
    }
  }, [envelopeDestinations, setEnvelopeDestinations])

  // Handle patch connection
  const handlePatchConnect = (destination: LFODestination) => {
    if (draggingLfoIndex !== null) {
      updateCurrentPresetLFO(draggingLfoIndex, { destination })
      setDraggingLfoIndex(null)
    } else if (draggingEnvelope) {
      // Add envelope destination if not already present
      if (!envelopeDestinations.includes(destination)) {
        setEnvelopeDestinationsLocal([...envelopeDestinations, destination])
      }
      setDraggingEnvelope(false)
    }
  }

  // Handle envelope disconnect
  const handleEnvelopeDisconnect = (destination: LFODestination) => {
    setEnvelopeDestinationsLocal(envelopeDestinations.filter(d => d !== destination))
  }

  // Helper to combine LFO and envelope connections for display
  const getCombinedConnections = () => {
    if (!currentPreset) return []

    const lfoConnections = currentPreset.lfos.map((lfo, index) => ({
      destination: lfo.destination,
      color: LFO_COLORS[index],
      lfoIndex: index,
    }))

    const envelopeConnections = envelopeDestinations.map(dest => ({
      destination: dest,
      color: '#FF8C42', // Orange color for envelope
      lfoIndex: -1, // Special index to identify envelope connections
    }))

    return [...lfoConnections, ...envelopeConnections]
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-family-base)',
        overflow: 'auto',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          zIndex: 100,
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xl)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              background: `linear-gradient(90deg, ${COLORS.cyan} 0%, ${COLORS.rose} 50%, ${COLORS.yellow} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.05em',
            }}
          >
            OSCILLOSYNTH
          </h1>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isStarted ? 'var(--color-idle)' : 'var(--color-text-tertiary)',
                boxShadow: isStarted ? '0 0 8px var(--color-idle)' : 'none',
                animation: isStarted ? 'pulse 2s ease-in-out infinite' : 'none',
              }}
            />
            {activeVoices}/{maxVoices} VOICES
          </div>
        </div>

        {/* Live View + Preset Browser + Idle Color Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          {/* Live View Toggle */}
          <button
            onClick={() => setLiveViewEnabled(!liveViewEnabled)}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: liveViewEnabled ? 'var(--color-idle)' : 'var(--color-bg-tertiary)',
              color: liveViewEnabled ? '#000' : 'var(--color-text-primary)',
              border: `1px solid ${liveViewEnabled ? 'var(--color-idle)' : 'var(--color-border-primary)'}`,
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              boxShadow: liveViewEnabled ? '0 0 12px var(--color-idle)' : 'none',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: liveViewEnabled ? '#000' : 'var(--color-idle)',
                animation: liveViewEnabled ? 'pulse 1s ease-in-out infinite' : 'none',
              }}
            />
            LIVE VIEW
          </button>

          <PresetBrowser
            currentPreset={currentPreset}
            allPresets={getAllPresets()}
            onPresetChange={loadPreset}
            onSavePreset={saveUserPreset}
          />
          <IdleColorPicker />
        </div>
      </header>

      {/* Main Content - Centered Layout */}
      <main
        style={{
          padding: 'var(--spacing-4)',
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-4)',
        }}
      >
        {/* Top Section: 4 LFOs around Oscilloscope */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 500px 200px',
            gap: 'var(--spacing-3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Left LFOs - Stacked Vertically */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {/* LFO 1 */}
            {currentPreset && (
              <LFOPad
                lfoNumber={1}
                lfoIndex={0}
                params={currentPreset.lfos[0]}
                color={LFO_COLORS[0]}
                onChange={(params) => updateCurrentPresetLFO(0, params)}
                onPatchStart={() => setDraggingLfoIndex(0)}
              />
            )}
            {/* LFO 2 */}
            {currentPreset && (
              <LFOPad
                lfoNumber={2}
                lfoIndex={1}
                params={currentPreset.lfos[1]}
                color={LFO_COLORS[1]}
                onChange={(params) => updateCurrentPresetLFO(1, params)}
                onPatchStart={() => setDraggingLfoIndex(1)}
              />
            )}
          </div>

          {/* Oscilloscope XY - Center */}
          <OscilloscopeXY width={500} height={500}>
            <IntegratedOscilloscopeControls
              latchMode={latchMode}
              onLatchToggle={async () => {
                // Start audio if not already started
                if (!isStarted) {
                  try {
                    await startAudio()
                  } catch (error) {
                    console.error('Failed to start audio:', error)
                  }
                }
                setLatchMode(!latchMode)
              }}
              activeNotesCount={activeNotes.size}
              onClearNotes={() => {
                activeNotes.forEach((note) => noteOff(note))
                setActiveNotes(new Set())
              }}
              volume={(currentPreset?.masterVolume ?? 0.7) * 100}
              onVolumeChange={(volume) => setMasterVolume(volume / 100)}
            />
          </OscilloscopeXY>

          {/* Right LFOs - Stacked Vertically */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            {/* LFO 3 */}
            {currentPreset && (
              <LFOPad
                lfoNumber={3}
                lfoIndex={2}
                params={currentPreset.lfos[2]}
                color={LFO_COLORS[2]}
                onChange={(params) => updateCurrentPresetLFO(2, params)}
                onPatchStart={() => setDraggingLfoIndex(2)}
              />
            )}
            {/* LFO 4 */}
            {currentPreset && (
              <LFOPad
                lfoNumber={4}
                lfoIndex={3}
                params={currentPreset.lfos[3]}
                color={LFO_COLORS[3]}
                onChange={(params) => updateCurrentPresetLFO(3, params)}
                onPatchStart={() => setDraggingLfoIndex(3)}
              />
            )}
          </div>
        </div>

        {/* Filter → Noise → Effects (ordre du signal audio) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--spacing-4)',
            width: '100%',
            maxWidth: '900px',
          }}
        >
          {/* Filter */}
          {currentPreset && getDisplayFilter() && (
            <CompactFilterSection
              params={getDisplayFilter()!}
              onChange={updateCurrentPresetFilter}
              lfos={getCombinedConnections()}
              onPatchConnect={handlePatchConnect}
              onPatchDisconnect={(destination) => {
                const lfoIndex = currentPreset.lfos.findIndex((lfo) => lfo.destination === destination)
                if (lfoIndex !== -1) {
                  updateCurrentPresetLFO(lfoIndex, { destination: LFODestination.PITCH })
                } else if (envelopeDestinations.includes(destination)) {
                  handleEnvelopeDisconnect(destination)
                }
              }}
            />
          )}

          {/* Noise Generator (avec son propre filtre) */}
          {currentPreset && (
            <NoiseGenerator
              noiseType={noiseType}
              noiseLevel={getDisplayValue(noiseLevel, 'noiseLevel')}
              noiseFilterCutoff={getDisplayValue(noiseFilterCutoff, 'noiseFilterCutoff')}
              noiseFilterResonance={noiseFilterResonance}
              onNoiseTypeChange={(type) => {
                setNoiseTypeUI(type)
                setNoiseType(type)
              }}
              onNoiseLevelChange={(level) => {
                setNoiseLevelUI(level)
                setNoiseLevel(level)
              }}
              onNoiseFilterCutoffChange={(cutoff) => {
                setNoiseFilterCutoffUI(cutoff)
                setNoiseFilterCutoff(cutoff)
              }}
              onNoiseFilterResonanceChange={(resonance) => {
                setNoiseFilterResonanceUI(resonance)
                setNoiseFilterResonance(resonance)
              }}
              lfos={getCombinedConnections()}
              onPatchConnect={handlePatchConnect}
              onPatchDisconnect={(destination) => {
                const lfoIndex = currentPreset.lfos.findIndex((lfo) => lfo.destination === destination)
                if (lfoIndex !== -1) {
                  updateCurrentPresetLFO(lfoIndex, { destination: LFODestination.PITCH })
                } else if (envelopeDestinations.includes(destination)) {
                  handleEnvelopeDisconnect(destination)
                }
              }}
            />
          )}

          {/* Effects */}
          {currentPreset && getDisplayEffects() && (
            <CompactEffectsSection
              params={getDisplayEffects()!}
              onChange={updateCurrentPresetMasterEffects}
              lfos={getCombinedConnections()}
              onPatchConnect={handlePatchConnect}
              onPatchDisconnect={(destination) => {
                const lfoIndex = currentPreset.lfos.findIndex((lfo) => lfo.destination === destination)
                if (lfoIndex !== -1) {
                  updateCurrentPresetLFO(lfoIndex, { destination: LFODestination.PITCH })
                } else if (envelopeDestinations.includes(destination)) {
                  handleEnvelopeDisconnect(destination)
                }
              }}
            />
          )}
        </div>

        {/* ADSR Envelope + Synth Controls (Richness/Space) */}
        {currentPreset && (
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              display: 'grid',
              gridTemplateColumns: '1fr 280px',
              gap: 'var(--spacing-3)',
            }}
          >
            <ADSREnvelope
              attack={currentPreset.operators[0].attack}
              decay={currentPreset.operators[0].decay}
              sustain={currentPreset.operators[0].sustain}
              release={currentPreset.operators[0].release}
              onChange={(params) => updateCurrentPresetOperator(0, params)}
              onEnvelopePatchStart={() => setDraggingEnvelope(true)}
              color="#FF8C42"
            />
            <CompactSynthSection
              title="RICHNESS"
              feedback={getDisplaySynthEngine()?.feedback ?? currentPreset.synthEngine.feedback}
              subOscLevel={getDisplaySynthEngine()?.subOscLevel ?? currentPreset.synthEngine.subOscLevel}
              stereoSpread={getDisplaySynthEngine()?.stereoSpread ?? currentPreset.synthEngine.stereoSpread}
              onChange={updateCurrentPresetSynthEngine}
              showHarmonicControls={false}
              lfos={getCombinedConnections()}
              onPatchConnect={handlePatchConnect}
              onPatchDisconnect={(destination) => {
                const lfoIndex = currentPreset.lfos.findIndex((lfo) => lfo.destination === destination)
                if (lfoIndex !== -1) {
                  updateCurrentPresetLFO(lfoIndex, { destination: LFODestination.PITCH })
                } else if (envelopeDestinations.includes(destination)) {
                  handleEnvelopeDisconnect(destination)
                }
              }}
            />
          </div>
        )}

        {/* Synth Engine - Ultra Compact + Synth Controls (Harmonic) */}
        {currentPreset && (
          <div
            style={{
              width: '100%',
              maxWidth: '900px',
              display: 'grid',
              gridTemplateColumns: '1fr 280px',
              gap: 'var(--spacing-3)',
            }}
          >
            <SimplifiedSynthEngine
              algorithm={currentPreset.algorithm}
              operators={(getDisplayOperators() as any) ?? currentPreset.operators}
              onAlgorithmChange={setAlgorithm}
              onOperatorChange={updateCurrentPresetOperator}
              lfos={getCombinedConnections()}
              onPatchConnect={handlePatchConnect}
              onPatchDisconnect={(destination) => {
                const lfoIndex = currentPreset.lfos.findIndex((lfo) => lfo.destination === destination)
                if (lfoIndex !== -1) {
                  updateCurrentPresetLFO(lfoIndex, { destination: LFODestination.PITCH })
                } else if (envelopeDestinations.includes(destination)) {
                  handleEnvelopeDisconnect(destination)
                }
              }}
            />
            <CompactSynthSection
              title="HARMONIC"
              detune={getDisplaySynthEngine()?.detune ?? currentPreset.synthEngine.detune}
              fmIndex={getDisplaySynthEngine()?.fmIndex ?? currentPreset.synthEngine.fmIndex}
              brightness={getDisplaySynthEngine()?.brightness ?? currentPreset.synthEngine.brightness}
              onChange={updateCurrentPresetSynthEngine}
              showHarmonicControls={true}
              lfos={getCombinedConnections()}
              onPatchConnect={handlePatchConnect}
              onPatchDisconnect={(destination) => {
                const lfoIndex = currentPreset.lfos.findIndex((lfo) => lfo.destination === destination)
                if (lfoIndex !== -1) {
                  updateCurrentPresetLFO(lfoIndex, { destination: LFODestination.PITCH })
                } else if (envelopeDestinations.includes(destination)) {
                  handleEnvelopeDisconnect(destination)
                }
              }}
            />
          </div>
        )}

        {/* Inline Keyboard - Bottom */}
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <InlineKeyboard
            onNoteOn={noteOn}
            onNoteOff={noteOff}
            isEnabled={isStarted}
            latchMode={latchMode}
            setLatchMode={async (mode) => {
              // Start audio if not already started
              if (!isStarted) {
                try {
                  await startAudio()
                } catch (error) {
                  console.error('Failed to start audio:', error)
                }
              }
              setLatchMode(mode)
            }}
            activeNotes={activeNotes}
            setActiveNotes={setActiveNotes}
          />
        </div>
      </main>
    </div>
  )
}
