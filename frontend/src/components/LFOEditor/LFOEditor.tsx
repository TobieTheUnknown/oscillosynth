/**
 * LFO Editor Component
 * Allows editing of LFO parameters: waveform, rate, depth, phase, sync
 */

import { type FC } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { useUIStore } from '../../store/uiStore';
import { WaveformType } from '../../audio/types';
import { Icon } from '../Icon';

interface LFOEditorProps {
  lfoIndex: 0 | 1 | 2 | 3;
}

export const LFOEditor: FC<LFOEditorProps> = ({ lfoIndex }) => {
  const lfo = useAudioStore((state) => state.lfos[lfoIndex]);
  const updateLFO = useAudioStore((state) => state.updateLFO);
  const setLFOWaveform = useAudioStore((state) => state.setLFOWaveform);
  const selectedLFO = useUIStore((state) => state.selectedLFO);
  const setSelectedLFO = useUIStore((state) => state.setSelectedLFO);

  const isSelected = selectedLFO === lfoIndex;
  const lfoColors = ['var(--color-lfo-1)', 'var(--color-lfo-2)', 'var(--color-lfo-3)', 'var(--color-lfo-4)'];

  return (
    <div
      className={`panel ${isSelected ? 'border-glow' : ''}`}
      onClick={() => setSelectedLFO(lfoIndex)}
      style={{ borderColor: lfoColors[lfoIndex] }}
    >
      <div className="panel-header">
        <span className="lfo-indicator" style={{ backgroundColor: lfoColors[lfoIndex] }}></span>
        LFO {lfoIndex + 1}
      </div>

      <div className="stack">
        {/* Waveform selector */}
        <div>
          <label className="label">Waveform</label>
          <div className="cluster">
            {[
              { type: WaveformType.SINE, icon: 'wave-sine' },
              { type: WaveformType.SQUARE, icon: 'wave-square' },
              { type: WaveformType.SAWTOOTH, icon: 'wave-sawtooth' },
              { type: WaveformType.TRIANGLE, icon: 'wave-triangle' },
              { type: WaveformType.RANDOM, icon: 'wave-random' },
            ].map(({ type, icon }) => (
              <button
                key={type}
                className={`btn ${lfo.config.waveform === type ? 'btn-primary' : ''}`}
                onClick={() => setLFOWaveform(lfoIndex, type)}
                title={type}
              >
                <Icon name={icon as any} size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Rate */}
        <div>
          <label className="label">
            Rate
            <span className="value">{lfo.config.rate.toFixed(2)} Hz</span>
          </label>
          <input
            type="range"
            className="slider"
            min="0.01"
            max="40"
            step="0.01"
            value={lfo.config.rate}
            onChange={(e) => updateLFO(lfoIndex, { rate: parseFloat(e.target.value) })}
          />
        </div>

        {/* Depth */}
        <div>
          <label className="label">
            Depth
            <span className="value">{(lfo.config.depth * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            className="slider"
            min="0"
            max="1"
            step="0.01"
            value={lfo.config.depth}
            onChange={(e) => updateLFO(lfoIndex, { depth: parseFloat(e.target.value) })}
          />
        </div>

        {/* Phase */}
        <div>
          <label className="label">
            Phase
            <span className="value">{lfo.config.phase}°</span>
          </label>
          <input
            type="range"
            className="slider"
            min="0"
            max="360"
            step="1"
            value={lfo.config.phase}
            onChange={(e) => updateLFO(lfoIndex, { phase: parseInt(e.target.value) })}
          />
        </div>

        {/* Sync toggle */}
        <div className="cluster">
          <label className="label">Sync</label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={lfo.config.sync === 'tempo'}
              onChange={(e) => updateLFO(lfoIndex, { sync: e.target.checked ? 'tempo' : 'free' })}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="value">{lfo.config.sync === 'tempo' ? 'Tempo' : 'Free'}</span>
        </div>
      </div>
    </div>
  );
};
