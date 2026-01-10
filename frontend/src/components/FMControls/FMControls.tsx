/**
 * FM Controls Component
 * Controls for 4-operator FM synthesis
 */

import { type FC } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { AlgorithmType } from '../../audio/types';

export const FMControls: FC = () => {
  const synth = useAudioStore((state) => state.synth);
  const setAlgorithm = useAudioStore((state) => state.setAlgorithm);
  const updateOperator = useAudioStore((state) => state.updateOperator);

  return (
    <div className="panel">
      <div className="panel-header">FM Synthesis</div>

      <div className="stack">
        {/* Algorithm selector */}
        <div>
          <label className="label">Algorithm</label>
          <select
            className="input"
            value={synth.algorithm}
            onChange={(e) => setAlgorithm(parseInt(e.target.value) as AlgorithmType)}
          >
            {Object.values(AlgorithmType)
              .filter((v) => typeof v === 'number')
              .map((algo) => (
                <option key={algo} value={algo}>
                  Algorithm {algo}
                </option>
              ))}
          </select>
        </div>

        {/* Operators */}
        {synth.operators.map((op, index) => (
          <div key={index} className="panel" style={{ marginTop: 'var(--space-2)' }}>
            <div className="panel-header">Operator {index + 1}</div>
            <div className="grid-oscilloscope">
              {/* Ratio */}
              <div>
                <label className="label">
                  Ratio
                  <span className="value">{op.ratio.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  className="slider"
                  min="0.5"
                  max="16"
                  step="0.1"
                  value={op.ratio}
                  onChange={(e) =>
                    updateOperator(index as 0 | 1 | 2 | 3, {
                      ratio: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              {/* Level */}
              <div>
                <label className="label">
                  Level
                  <span className="value">{(op.level * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  className="slider"
                  min="0"
                  max="1"
                  step="0.01"
                  value={op.level}
                  onChange={(e) =>
                    updateOperator(index as 0 | 1 | 2 | 3, {
                      level: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              {/* ADSR - simplified display for now */}
              <div>
                <label className="label">Attack</label>
                <input
                  type="range"
                  className="slider"
                  min="0.001"
                  max="2"
                  step="0.001"
                  value={op.envelope.attack}
                  onChange={(e) =>
                    updateOperator(index as 0 | 1 | 2 | 3, {
                      envelope: { ...op.envelope, attack: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>

              <div>
                <label className="label">Release</label>
                <input
                  type="range"
                  className="slider"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={op.envelope.release}
                  onChange={(e) =>
                    updateOperator(index as 0 | 1 | 2 | 3, {
                      envelope: { ...op.envelope, release: parseFloat(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
