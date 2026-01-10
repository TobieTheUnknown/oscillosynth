/**
 * OscilloSynth - Main Application
 * FM Synthesizer with visual LFO modulation
 */

import { useState } from 'react';
import { useAudioEngine } from './hooks/useAudioEngine';
import { LFOEditor } from './components/LFOEditor/LFOEditor';
import { FMControls } from './components/FMControls/FMControls';
import { MatrixRouter } from './components/MatrixRouter/MatrixRouter';
import { useAudioStore } from './store/audioStore';

function App() {
  const { isReady, error, init, playNote, releaseNote } = useAudioEngine();
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  // Simple keyboard mapping (QWERTY to chromatic scale)
  const keyMap: Record<string, number> = {
    a: 60, // C4
    w: 61, // C#4
    s: 62, // D4
    e: 63, // D#4
    d: 64, // E4
    f: 65, // F4
    t: 66, // F#4
    g: 67, // G4
    y: 68, // G#4
    h: 69, // A4
    u: 70, // A#4
    j: 71, // B4
    k: 72, // C5
  };

  const handleInit = async () => {
    await init();
  };

  const handleNoteOn = (note: number) => {
    if (!isReady || activeNotes.has(note)) return;
    playNote(note, 0.8);
    setActiveNotes(prev => new Set(prev).add(note));
  };

  const handleNoteOff = (note: number) => {
    if (!isReady || !activeNotes.has(note)) return;
    releaseNote(note);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  // Keyboard event handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.repeat) return;
    const note = keyMap[e.key.toLowerCase()];
    if (note !== undefined) {
      handleNoteOn(note);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const note = keyMap[e.key.toLowerCase()];
    if (note !== undefined) {
      handleNoteOff(note);
    }
  };

  return (
    <div
      className="app"
      style={{
        minHeight: '100vh',
        padding: 'var(--space-4)',
        onKeyDown: handleKeyDown,
        onKeyUp: handleKeyUp,
      }}
      tabIndex={0}
    >
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="text-glow-lg" style={{ fontSize: 'var(--text-2xl)' }}>
          OscilloSynth
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          FM Synthesizer with Visual LFO Modulation
        </p>
      </header>

      {/* Init Button */}
      {!isReady && (
        <div className="panel" style={{ marginBottom: 'var(--space-4)' }}>
          <button className="btn btn-primary" onClick={handleInit}>
            🎵 Initialize Audio Engine
          </button>
          {error && (
            <p style={{ color: 'var(--color-error)', marginTop: 'var(--space-2)' }}>
              Error: {error}
            </p>
          )}
          <p style={{ color: 'var(--color-text-dim)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
            Click to start audio (required by browser)
          </p>
        </div>
      )}

      {isReady && (
        <>
          {/* Quick Test Keyboard */}
          <div className="panel" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="panel-header">Test Keyboard</div>
            <div className="stack">
              <p className="label">Click notes or use QWERTY keyboard (A-K keys)</p>
              <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                {Object.entries(keyMap).map(([key, note]) => (
                  <button
                    key={note}
                    className={`btn ${activeNotes.has(note) ? 'btn-primary' : ''}`}
                    onMouseDown={() => handleNoteOn(note)}
                    onMouseUp={() => handleNoteOff(note)}
                    onMouseLeave={() => activeNotes.has(note) && handleNoteOff(note)}
                    style={{ minWidth: '3rem' }}
                  >
                    {key.toUpperCase()}
                    <br />
                    <span style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>
                      {note}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Controls Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {/* LFO Editors */}
            <LFOEditor lfoIndex={0} />
            <LFOEditor lfoIndex={1} />
            <LFOEditor lfoIndex={2} />
            <LFOEditor lfoIndex={3} />
          </div>

          {/* FM Controls */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <FMControls />
          </div>

          {/* Modulation Matrix */}
          <div>
            <MatrixRouter />
          </div>
        </>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-dim)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <p>OscilloSynth v1.0 | Built with React + Tone.js + Canvas 2D</p>
      </footer>
    </div>
  );
}

export default App;
