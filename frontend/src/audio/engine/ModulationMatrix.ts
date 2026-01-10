/**
 * ModulationMatrix - Routes LFO values to synthesis parameters
 * Applies modulation in real-time using requestAnimationFrame
 */

import type { ModulationConnection, ModulationTarget } from '../types';
import type { FMSynth } from './FMSynth';
import type { LFOEngine } from './LFOEngine';
import type { AudioPipeline } from './AudioPipeline';

export class ModulationMatrix {
  private connections: ModulationConnection[] = [];
  private animationFrame: number | null = null;
  private isRunning: boolean = false;

  // Parameter base values (before modulation)
  private baseValues: Map<ModulationTarget, number> = new Map();

  constructor(
    private synth: FMSynth,
    private lfoEngine: LFOEngine,
    private pipeline: AudioPipeline
  ) {}

  /**
   * Set modulation connections
   */
  setConnections(connections: ModulationConnection[]) {
    this.connections = connections.filter(conn => conn.enabled);
  }

  /**
   * Add a modulation connection
   */
  addConnection(connection: ModulationConnection) {
    const existing = this.connections.findIndex(
      conn => conn.lfoId === connection.lfoId && conn.target === connection.target
    );

    if (existing >= 0) {
      this.connections[existing] = connection;
    } else {
      this.connections.push(connection);
    }
  }

  /**
   * Remove a modulation connection
   */
  removeConnection(lfoId: number, target: ModulationTarget) {
    this.connections = this.connections.filter(
      conn => !(conn.lfoId === lfoId && conn.target === target)
    );
  }

  /**
   * Store base value for a parameter (before modulation)
   */
  setBaseValue(target: ModulationTarget, value: number) {
    this.baseValues.set(target, value);
  }

  /**
   * Start applying modulation in real-time
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const update = () => {
      if (!this.isRunning) return;

      // Apply all active modulation connections
      this.applyModulations();

      this.animationFrame = requestAnimationFrame(update);
    };

    update();
  }

  /**
   * Stop applying modulation
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Apply all modulations for current frame
   */
  private applyModulations() {
    // Group connections by target for efficient processing
    const modulationsByTarget = new Map<ModulationTarget, number>();

    // Calculate total modulation per target
    for (const conn of this.connections) {
      if (!conn.enabled) continue;

      const lfoValue = this.lfoEngine.getLFOValue(conn.lfoId);
      const modAmount = lfoValue * conn.amount;

      const current = modulationsByTarget.get(conn.target) || 0;
      modulationsByTarget.set(conn.target, current + modAmount);
    }

    // Apply modulations to targets
    for (const [target, modulation] of modulationsByTarget.entries()) {
      this.applyToTarget(target, modulation);
    }
  }

  /**
   * Apply modulation value to specific target
   */
  private applyToTarget(target: ModulationTarget, modulation: number) {
    const baseValue = this.baseValues.get(target) || 0;

    switch (target) {
      // Filter parameters
      case 'filter_cutoff': {
        // Modulate cutoff in logarithmic scale (20Hz - 20kHz)
        const minFreq = 20;
        const maxFreq = 20000;
        const logBase = Math.log(baseValue / minFreq) / Math.log(maxFreq / minFreq);
        const modulated = logBase + modulation;
        const newFreq = minFreq * Math.pow(maxFreq / minFreq, Math.max(0, Math.min(1, modulated)));
        this.pipeline.setFilterCutoff(newFreq);
        break;
      }

      case 'filter_resonance': {
        const newRes = Math.max(0, Math.min(1, baseValue + modulation));
        this.pipeline.setFilterResonance(newRes);
        break;
      }

      // Global parameters
      case 'master_volume': {
        const newVol = Math.max(0, Math.min(1, baseValue + modulation * 0.5));
        this.synth.updateConfig({ masterVolume: newVol });
        break;
      }

      case 'master_pitch': {
        // Modulate pitch ±12 semitones
        const newPitch = baseValue + modulation * 12;
        this.synth.updateConfig({ masterPitch: newPitch });
        break;
      }

      // Operator parameters (would need synth API extension)
      // For now, these are placeholders
      case 'op1_ratio':
      case 'op2_ratio':
      case 'op3_ratio':
      case 'op4_ratio': {
        // TODO: Implement operator ratio modulation
        // Would need to extend FMSynth to support real-time operator param changes
        break;
      }

      // Other targets...
      default:
        // Target not yet implemented
        break;
    }
  }

  /**
   * Get current modulation value for a target
   */
  getModulationFor(target: ModulationTarget): number {
    let total = 0;
    for (const conn of this.connections) {
      if (conn.enabled && conn.target === target) {
        const lfoValue = this.lfoEngine.getLFOValue(conn.lfoId);
        total += lfoValue * conn.amount;
      }
    }
    return total;
  }

  /**
   * Dispose modulation matrix
   */
  dispose() {
    this.stop();
    this.connections = [];
    this.baseValues.clear();
  }
}
