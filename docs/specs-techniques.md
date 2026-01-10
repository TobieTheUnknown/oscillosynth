# Spécifications Techniques - OscilloSynth

> Document de référence pour tous les agents. Contrat technique partagé.

**Version :** 1.0
**Date :** 2026-01-10
**Status :** Validé par brainstorm

---

## Stack Validée

| Technologie | Version | Justification |
|-------------|---------|---------------|
| Node.js | 20 LTS | Stabilité, support ESM natif |
| React | 18.3+ | Concurrent rendering, meilleure perf |
| TypeScript | 5.3+ | Types stricts, meilleur DX |
| Vite | 5.0+ | Build rapide, HMR optimal |
| Tone.js | 15.0+ | Moteur FM + scheduling précis |
| Zustand | 4.5+ | State léger pour audio temps réel |
| Vitest | 1.2+ | Tests unitaires rapides |
| Playwright | 1.40+ | Tests E2E cross-browser |

### Dépendances Optionnelles
- `@tonejs/midi` - Export/import MIDI
- `lamejs` - Export MP3 (en plus de WAV)
- `file-saver` - Download presets/audio

---

## Architecture Détaillée

### Structure de Dossiers

```
oscillosynth/
├── docs/                   # Documentation (ce fichier)
│   ├── projet.md
│   ├── specs-techniques.md
│   └── checklist.md
├── src/
│   ├── audio/             # Moteur audio isolé
│   │   ├── engine/        # Tone.js synth core
│   │   │   ├── FMSynth.ts
│   │   │   ├── LFOEngine.ts
│   │   │   ├── Limiter.ts
│   │   │   └── MIDIController.ts
│   │   ├── presets/       # Presets factory
│   │   └── types.ts       # Types audio
│   ├── visualisation/     # Canvas rendering
│   │   ├── workers/       # Web Workers
│   │   │   └── canvas.worker.ts
│   │   ├── LFOVisualizer.ts
│   │   ├── Oscilloscope.ts
│   │   └── utils.ts
│   ├── components/        # React UI
│   │   ├── LFOEditor/
│   │   ├── FMControls/
│   │   ├── MatrixRouter/
│   │   ├── PresetManager/
│   │   ├── VirtualKeyboard/
│   │   └── Canvas/        # Canvas wrappers
│   ├── store/             # Zustand stores
│   │   ├── audioStore.ts
│   │   ├── uiStore.ts
│   │   └── presetStore.ts
│   ├── hooks/             # Custom hooks
│   ├── utils/
│   ├── types/             # Types globaux
│   ├── App.tsx
│   └── main.tsx
├── public/
├── tests/
│   ├── unit/
│   └── e2e/
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Moteur Audio (Tone.js)

### FMSynth - Synthétiseur 4 Opérateurs

**Algorithmes DX7-style (8 minimum MVP) :**

```
Algo 1: 1→2→3→4 (série pure)
Algo 2: (1+2)→3→4 (parallel carriers)
Algo 3: 1→(2+3)→4
Algo 4: (1→2)+(3→4) (dual stacks)
Algo 5: 1→2, 1→3, 1→4 (broadcast)
Algo 6: 1+2+3+4 (parallel additive)
Algo 7: (1→2)+(3+4)
Algo 8: 1→2→3, 1→4 (mixed)
```

**Paramètres par Opérateur :**
- Ratio (0.5 à 16.0)
- Level (0-100)
- Attack/Decay/Sustain/Release (ADSR)
- Feedback (0-100, pour operator 4 uniquement en feedback loop)

**Paramètres Globaux Modulables :**
- Master Pitch
- Master Volume
- Filter Cutoff (low-pass 24dB)
- Filter Resonance
- Pan

### LFOEngine - 4 LFOs Simultanés

**Formes Preset :**
- Sine
- Square
- Sawtooth
- Triangle
- Random (sample & hold)

**Formes Custom :**
- Dessinées par user (array de 128 points, interpolation linéaire)
- Normalisées -1.0 à +1.0

**Paramètres LFO :**
- Rate : 0.01 Hz - 40 Hz (si free) OU sync tempo (1/16 à 8 bars)
- Depth : 0-100%
- Phase : 0-360°
- Sync : free/tempo

**Combinaisons :**
```typescript
enum CombineMode {
  ADD,      // lfo1 + lfo2 + lfo3 + lfo4
  MULTIPLY, // lfo1 * lfo2 * lfo3 * lfo4
  RING_MOD, // (lfo1 * lfo2) + (lfo3 * lfo4)
  CHAIN     // lfo1 → lfo2 → lfo3 → lfo4 (cascade)
}
```

### Matrice de Modulation

**Routage :**
- Chaque LFO peut moduler N paramètres simultanément
- Intensité de modulation par connexion : -100% à +100%
- Bipolar/Unipolar par cible

**Cibles (20 minimum) :**
- Op1-4 : Ratio, Level, Feedback
- Filter : Cutoff, Resonance
- Global : Pitch, Volume, Pan
- Enveloppes : Attack, Decay, Sustain, Release (par op)

### Audio Pipeline

```
MIDI In → Note → FM Synth (4 op)
                     ↑
                  LFOs (1-4) → Modulation Matrix
                     ↓
             Low-pass Filter
                     ↓
                  Limiter (-0.3dB ceiling)
                     ↓
                  Analyser → Viz Data
                     ↓
                  Output + MIDI Out (LFO CC)
```

**Configuration Audio :**
- Sample Rate : 48000 Hz (fallback 44100)
- Buffer Size : Adaptive (128/256/512 basé sur latency monitoring)
- Limiter : Threshold -0.3dB, Attack 0.003s, Release 0.01s
- Polyphonie : 8 voix max (pour performances)

---

## Visualisation (Canvas 2D)

### Style Visuel

**Palette Oscilloscope :**
```css
--bg: #000000
--trace-primary: #00FF41 (vert phosphore)
--trace-secondary: #FFFFFF
--trace-dim: #004411
--grid: #001a0a
```

**Typographie :**
- Monospace : 'JetBrains Mono', 'Fira Code', monospace
- Tailles : 10px (labels), 14px (valeurs), 18px (titres)

### LFO Visualizer

**Zone Centrale (800×600px minimum) :**
- Background : grid optionnel (style oscilloscope)
- Affichage des 4 LFOs combinés en temps réel
- Paramètres modulés affichés au centre de la forme
- Indicateur de phase pour chaque LFO (points colorés)

**Performance Target :**
- 60 FPS constant
- Update via `requestAnimationFrame`
- Throttle si CPU < 30% disponible → 30 FPS fallback

### Oscilloscope Audio

**Waveform Display (400×300px) :**
- Affiche le signal audio final (post-limiter) + mirror effects
- Fenêtre temporelle : 20ms (1 période à 50Hz) par défaut mais ajustable
- Style tracé : anti-aliased stroke, 2px
- Trigger : auto-detect zero-crossing pour stabilité

**Web Worker :**
```typescript
// canvas.worker.ts
onmessage = (e: MessageEvent<AudioBuffer>) => {
  const waveform = analyzeBuffer(e.data);
  const imageData = renderWaveform(waveform);
  postMessage(imageData);
};
```

---

## État Global (Zustand)

### audioStore

```typescript
interface AudioState {
  // Synth state
  currentNote: number | null;
  activeVoices: Voice[];
  algorithm: AlgorithmType;
  operators: Operator[4];

  // LFO state
  lfos: LFO[4];
  combineMode: CombineMode;
  modulationMatrix: ModConnection[];

  // Global params
  masterVolume: number;
  masterPitch: number;
  filterCutoff: number;
  filterResonance: number;

  // Actions
  playNote: (note: number, velocity: number) => void;
  stopNote: (note: number) => void;
  setAlgorithm: (algo: AlgorithmType) => void;
  updateLFO: (index: number, lfo: Partial<LFO>) => void;
  setModConnection: (connection: ModConnection) => void;
}
```

### presetStore

```typescript
interface PresetState {
  currentPreset: Preset | null;
  presets: Preset[];
  factoryPresets: Preset[];

  loadPreset: (id: string) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  exportPreset: () => string; // JSON
  importPreset: (json: string) => void;
}
```

### uiStore

```typescript
interface UIState {
  // View state
  activeTab: 'lfos' | 'fm' | 'matrix' | 'presets';
  showKeyboard: boolean;
  showOscilloscope: boolean;

  // Editor state
  selectedLFO: number | null;
  drawingMode: boolean;

  // MIDI
  midiDevices: WebMidi.MIDIInput[];
  midiLearnTarget: string | null;
}
```

---

## Composants React Clés

### `<LFOEditor />`

**Props :**
```typescript
interface LFOEditorProps {
  lfoIndex: 0 | 1 | 2 | 3;
  lfo: LFO;
  onUpdate: (lfo: Partial<LFO>) => void;
}
```

**Fonctionnalités :**
- Sélection forme preset (dropdown)
- Canvas de dessin pour forme custom (touch + mouse)
- Sliders : Rate, Depth, Phase
- Toggle : Sync/Free
- Preview waveform en temps réel

**Gestures Tactiles :**
- Single touch : dessiner
- Pinch : zoom vertical (amplitude)
- Two-finger drag : pan horizontal

### `<MatrixRouter />`

**Interface :**
- Grid : 4 LFOs (colonnes) × 20 paramètres (lignes)
- Chaque cellule = slider -100% à +100%
- Couleur intensité : vert (positif), rouge (négatif)
- Hover : affiche nom complet du paramètre

### `<VirtualKeyboard />`

**Specs :**
- 2 octaves visibles, scroll pour plus
- Support clavier QWERTY (mapping chromatic)
- Velocity via click position verticale
- Sustain pedal (touche Espace)

---

## Patterns Obligatoires

### Audio Performance

**RÈGLE #1 : Jamais bloquer l'audio thread**

```typescript
// ❌ MAUVAIS
function updateLFO(lfo: LFO) {
  audioEngine.lfo[0] = lfo; // Direct mutation
  heavyCalculation(); // Bloque l'audio !
}

// ✅ BON
function updateLFO(lfo: LFO) {
  audioEngine.scheduleLFOUpdate(lfo, '+0.01'); // Schedule ahead
  requestIdleCallback(() => heavyCalculation()); // Async
}
```

**RÈGLE #2 : Utiliser Tone.js scheduling**

```typescript
// Toujours scheduler les changements
synth.frequency.rampTo(440, 0.1, '+0.05');
```

### État Immutable

```typescript
// Toujours utiliser immer ou spread
set((state) => ({
  lfos: state.lfos.map((lfo, i) =>
    i === index ? { ...lfo, ...update } : lfo
  )
}));
```

### Error Boundaries

Tous les composants audio doivent avoir un error boundary :

```typescript
<ErrorBoundary fallback={<AudioEngineError />}>
  <FMSynth />
</ErrorBoundary>
```

---

## Conventions de Code

### TypeScript

```typescript
// Typage strict activé
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true
}
```

**Naming :**
- Components : PascalCase (`LFOEditor`)
- Hooks : camelCase avec `use` prefix (`useAudioEngine`)
- Types : PascalCase (`LFOConfig`)
- Constants : UPPER_SNAKE_CASE (`MAX_VOICES`)

### Commentaires

```typescript
// Pas de commentaires évidents
// ❌ Incrémente le compteur
count++;

// ✅ Commentaires pour les trucs non-évidents
// Apply Nyquist limit to prevent aliasing above 20kHz
const maxFreq = Math.min(frequency, sampleRate / 2.4);
```

### Commits

**Format :**
```
<type>(<scope>): <description>

[optional body]
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Bug fix
- `perf`: Amélioration performance
- `refactor`: Refactoring sans changement fonctionnel
- `test`: Ajout/modification tests
- `docs`: Documentation

**Exemple :**
```
feat(audio): add ring modulation LFO combine mode

Implements ring mod as (lfo1*lfo2)+(lfo3*lfo4).
Adds unit tests for all combine modes.
```

---

## Tests

### Unitaires (Vitest)

**Couverture Minimum : 80%**

**Priorités :**
1. Logique audio (LFO math, FM algorithms)
2. Matrice de modulation
3. Preset save/load
4. MIDI mapping

**Exemple :**
```typescript
describe('LFOEngine', () => {
  it('combines 4 LFOs in ADD mode correctly', () => {
    const engine = new LFOEngine();
    engine.setLFO(0, { wave: 'sine', rate: 1 });
    engine.setLFO(1, { wave: 'sine', rate: 1, phase: 180 });

    const combined = engine.getCombined(CombineMode.ADD, 0);
    expect(combined).toBeCloseTo(0, 2); // Opposite phases cancel
  });
});
```

### E2E (Playwright)

**Scénarios Critiques :**
1. Jouer une note → entendre du son
2. Dessiner un LFO custom → voir modulation
3. Sauvegarder preset → recharger → identique
4. MIDI learn → controller fonctionne

---

## Docker

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  oscillosynth:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    environment:
      - NODE_ENV=development
```

---

## Décisions Techniques Brainstorm

### Validées
- ✅ 100% client-side (pas de backend)
- ✅ Canvas 2D suffisant (pas besoin WebGL)
- ✅ Zustand pour state (pas Redux)
- ✅ Tone.js pour FM (pas de synth from scratch)
- ✅ 4 LFOs (pas 8, pas 2)
- ✅ 8 algorithmes FM (sweet spot)
- ✅ MIDI bidirectionnel (In + Out)

### Rejetées
- ❌ Backend pour presets (complexité inutile pour MVP)
- ❌ Support mobile (perf/UI trop complexe)
- ❌ WebGL pour viz (overkill)
- ❌ Plugin VST (scope creep, complexité)

### En Attente V2
- Morphing LFO animé
- Export visuel GIF/video
- Randomizer intelligent
- Mode offline rendering HD

---

## Points de Vigilance

### Performance
- Profiler EARLY : dès que les 4 LFOs sont actifs
- Target : <5% CPU idle, <50ms total latency
- Monitoring continu dans DevTools Performance

### Accessibilité
- Tous les contrôles accessibles au clavier
- ARIA labels sur canvas
- Focus visible
- Contrast ratio WCAG AA minimum

### Compatibilité
- Test sur Chrome, Firefox, Safari, Edge
- Test sur iPad (tactile critique)
- Fallback si Web Audio API indisponible

---

**Ce document est LE contrat technique. Toute déviation doit être discutée et validée.**
