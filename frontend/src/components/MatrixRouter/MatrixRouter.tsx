/**
 * Modulation Matrix Router Component
 * Grid interface for routing LFOs to synthesis parameters
 */

import { type FC } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { ModulationTarget } from '../../audio/types';

export const MatrixRouter: FC = () => {
  const modulationMatrix = useAudioStore((state) => state.modulationMatrix);
  const addModulation = useAudioStore((state) => state.addModulation);
  const updateModulation = useAudioStore((state) => state.updateModulation);
  const toggleModulation = useAudioStore((state) => state.toggleModulation);

  const lfoColors = ['var(--color-lfo-1)', 'var(--color-lfo-2)', 'var(--color-lfo-3)', 'var(--color-lfo-4)'];

  // Simplified target list (key targets)
  const targets = [
    ModulationTarget.OP1_RATIO,
    ModulationTarget.OP2_RATIO,
    ModulationTarget.OP3_RATIO,
    ModulationTarget.OP4_RATIO,
    ModulationTarget.FILTER_CUTOFF,
    ModulationTarget.FILTER_RESONANCE,
    ModulationTarget.MASTER_PITCH,
    ModulationTarget.MASTER_VOLUME,
  ];

  const getConnection = (lfoId: number, target: ModulationTarget) => {
    return modulationMatrix.find(
      (conn) => conn.lfoId === lfoId && conn.target === target
    );
  };

  return (
    <div className="panel">
      <div className="panel-header">Modulation Matrix</div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="label" style={{ textAlign: 'left', padding: 'var(--space-2)' }}>
                Target
              </th>
              {[0, 1, 2, 3].map((lfoId) => (
                <th
                  key={lfoId}
                  className="label"
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-2)',
                    color: lfoColors[lfoId],
                  }}
                >
                  LFO {lfoId + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => (
              <tr key={target}>
                <td className="label" style={{ padding: 'var(--space-2)' }}>
                  {target.replace(/_/g, ' ')}
                </td>
                {[0, 1, 2, 3].map((lfoId) => {
                  const connection = getConnection(lfoId, target);
                  return (
                    <td key={lfoId} style={{ padding: 'var(--space-1)', textAlign: 'center' }}>
                      {connection ? (
                        <input
                          type="range"
                          className="slider"
                          min="-1"
                          max="1"
                          step="0.01"
                          value={connection.amount}
                          onChange={(e) =>
                            updateModulation(lfoId, target, parseFloat(e.target.value))
                          }
                          style={{ width: '80px' }}
                        />
                      ) : (
                        <button
                          className="btn"
                          style={{ fontSize: 'var(--text-xs)' }}
                          onClick={() =>
                            addModulation({
                              lfoId,
                              target,
                              amount: 0.5,
                              enabled: true,
                            })
                          }
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
