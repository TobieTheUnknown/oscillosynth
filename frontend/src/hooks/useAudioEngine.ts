/**
 * useAudioEngine - React hook to manage OscilloSynth audio engine
 * Initializes and manages FMSynth, LFOEngine, and AudioPipeline
 */

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { FMSynth } from '../audio/engine/FMSynth';
import { LFOEngine } from '../audio/engine/LFOEngine';
import { AudioPipeline } from '../audio/engine/AudioPipeline';
import { ModulationMatrix } from '../audio/engine/ModulationMatrix';
import { useAudioStore } from '../store/audioStore';
import type { MIDINoteNumber } from '../audio/types';

interface AudioEngineInstance {
  synth: FMSynth;
  lfoEngine: LFOEngine;
  pipeline: AudioPipeline;
  modulationMatrix: ModulationMatrix;
  isInitialized: boolean;
}

export function useAudioEngine() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<AudioEngineInstance | null>(null);

  // Get config from store
  const synthConfig = useAudioStore((state) => state.synth);
  const lfoConfigs = useAudioStore((state) => state.lfos.map(lfo => lfo.config));
  const combineMode = useAudioStore((state) => state.combineMode);
  const filterCutoff = useAudioStore((state) => state.filterCutoff);
  const filterResonance = useAudioStore((state) => state.filterResonance);
  const modulationConnections = useAudioStore((state) => state.modulationMatrix);

  /**
   * Initialize audio engine
   * MUST be called after user interaction (click)
   */
  const init = async () => {
    try {
      // Start Tone.js context (requires user gesture)
      await Tone.start();
      console.log('✓ Audio context started');

      // Create synth
      const synth = new FMSynth(synthConfig);
      synth.init();

      // Create LFO engine
      const lfoEngine = new LFOEngine(lfoConfigs);

      // Create audio pipeline
      const pipeline = new AudioPipeline();
      pipeline.setFilterCutoff(filterCutoff);
      pipeline.setFilterResonance(filterResonance);

      // Connect: synth → pipeline → destination
      synth.connect(pipeline.input);
      pipeline.connectOutput(Tone.Destination);

      // Start LFOs
      lfoEngine.start();

      // Create modulation matrix
      const modulationMatrix = new ModulationMatrix(synth, lfoEngine, pipeline);
      modulationMatrix.setConnections(modulationConnections);
      modulationMatrix.setBaseValue('filter_cutoff', filterCutoff);
      modulationMatrix.setBaseValue('filter_resonance', filterResonance);
      modulationMatrix.start();

      // Store engine instance
      engineRef.current = {
        synth,
        lfoEngine,
        pipeline,
        modulationMatrix,
        isInitialized: true,
      };

      setIsReady(true);
      console.log('✓ Audio engine initialized');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('✗ Audio engine init failed:', err);
    }
  };

  /**
   * Play a note
   */
  const playNote = (note: MIDINoteNumber, velocity: number = 1.0) => {
    if (!engineRef.current?.isInitialized) {
      console.warn('Audio engine not initialized');
      return;
    }

    engineRef.current.synth.triggerAttack(note, velocity);
  };

  /**
   * Release a note
   */
  const releaseNote = (note: MIDINoteNumber) => {
    if (!engineRef.current?.isInitialized) {
      console.warn('Audio engine not initialized');
      return;
    }

    engineRef.current.synth.triggerRelease(note);
  };

  /**
   * Update filter cutoff
   */
  const updateFilterCutoff = (cutoff: number) => {
    if (!engineRef.current?.isInitialized) return;
    engineRef.current.pipeline.setFilterCutoff(cutoff);
  };

  /**
   * Update filter resonance
   */
  const updateFilterResonance = (resonance: number) => {
    if (!engineRef.current?.isInitialized) return;
    engineRef.current.pipeline.setFilterResonance(resonance);
  };

  /**
   * Get waveform data for visualization
   */
  const getWaveform = (): Float32Array | null => {
    if (!engineRef.current?.isInitialized) return null;
    return engineRef.current.pipeline.getWaveform();
  };

  /**
   * Get LFO value
   */
  const getLFOValue = (index: number): number => {
    if (!engineRef.current?.isInitialized) return 0;
    return engineRef.current.lfoEngine.getLFOValue(index);
  };

  /**
   * Get combined LFO value
   */
  const getCombinedLFOValue = (): number => {
    if (!engineRef.current?.isInitialized) return 0;
    return engineRef.current.lfoEngine.getCombinedValue();
  };

  /**
   * Update synth config
   */
  useEffect(() => {
    if (engineRef.current?.isInitialized) {
      engineRef.current.synth.updateConfig(synthConfig);
    }
  }, [synthConfig]);

  /**
   * Update LFO combine mode
   */
  useEffect(() => {
    if (engineRef.current?.isInitialized) {
      engineRef.current.lfoEngine.setCombineMode(combineMode);
    }
  }, [combineMode]);

  /**
   * Update filter parameters
   */
  useEffect(() => {
    if (engineRef.current?.isInitialized) {
      engineRef.current.pipeline.setFilterCutoff(filterCutoff);
      engineRef.current.pipeline.setFilterResonance(filterResonance);
      engineRef.current.modulationMatrix.setBaseValue('filter_cutoff', filterCutoff);
      engineRef.current.modulationMatrix.setBaseValue('filter_resonance', filterResonance);
    }
  }, [filterCutoff, filterResonance]);

  /**
   * Update modulation connections
   */
  useEffect(() => {
    if (engineRef.current?.isInitialized) {
      engineRef.current.modulationMatrix.setConnections(modulationConnections);
    }
  }, [modulationConnections]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.synth.dispose();
        engineRef.current.lfoEngine.dispose();
        engineRef.current.pipeline.dispose();
        engineRef.current.modulationMatrix.dispose();
      }
    };
  }, []);

  return {
    isReady,
    error,
    init,
    playNote,
    releaseNote,
    updateFilterCutoff,
    updateFilterResonance,
    getWaveform,
    getLFOValue,
    getCombinedLFOValue,
    engine: engineRef.current,
  };
}
