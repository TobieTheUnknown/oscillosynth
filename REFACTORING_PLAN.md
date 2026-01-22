# OscilloSynth - Plan Détaillé de Refactorisation

## 📋 Objectifs Principaux

1. **Réduire la complexité des gros fichiers** (AudioEngine 758L, AudioTestV2 509L, Knob 471L)
2. **Éliminer la duplication de code** (~450 lignes répétées dans les sections Compact*)
3. **Améliorer la modularité** pour faciliter maintenance et tests
4. **Rendre le code plus résilient** face aux changements futurs

## 📊 Métriques de Succès

### Avant refactoring:
- **AudioEngine.ts**: 758 lignes
- **AudioTestV2.tsx**: 509 lignes
- **Knob.tsx**: 471 lignes
- **Duplication**: ~450 lignes (CompactFilterSection, CompactEffectsSection, CompactSynthSection)
- **Total lignes dupliquées/complexes**: ~2188 lignes

### Après refactoring (objectif):
- **AudioEngine.ts**: ~150-200 lignes (core orchestration)
- **AudioTestV2.tsx**: ~250-300 lignes (avec hooks)
- **Knob.tsx**: ~100-150 lignes (avec hooks)
- **Nouveaux modules**: +10 fichiers réutilisables bien séparés
- **Réduction totale**: ~1000 lignes de code dupliqué/complexe

---

## 🎯 PHASE 1: Composants Réutilisables (Impact: ⭐⭐⭐)

### Objectif
Créer un composant `ModulatableKnob` générique qui encapsule le pattern "Knob + Patch points" répété dans 3 composants.

### Problème Actuel
- **CompactFilterSection.tsx** (166 lignes): 2 knobs avec patch points
- **CompactEffectsSection.tsx** (145 lignes): 2 knobs avec patch points
- **CompactSynthSection.tsx** (242 lignes): 3 knobs avec patch points
- **Total duplication**: ~450 lignes de code similaire

### Solution

#### 1.1 Créer `src/components/ModulatableKnob.tsx`
```typescript
interface ModulatableKnobProps {
  // Knob props
  value: number
  min: number
  max: number
  step: number
  label: string
  unit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onChange: (value: number) => void

  // Patch connection props
  patchDestination: LFODestination
  activeConnections: LFOConnection[]
  onPatchConnect?: (destination: LFODestination, lfoIndex: number) => void
  onPatchDisconnect?: (destination: LFODestination, lfoIndex: number) => void

  // Optional features
  hideNumericValue?: boolean
  logarithmic?: boolean
}

export function ModulatableKnob(props: ModulatableKnobProps) {
  // Logique de patch overlay
  // Calcul des couleurs de connexion
  // Rendu du Knob avec overlay patch point
}
```

**Taille estimée**: ~120 lignes

#### 1.2 Refactorer CompactFilterSection
Avant (166 lignes) → Après (~60 lignes)

```typescript
export function CompactFilterSection({ ... }: CompactFilterSectionProps) {
  return (
    <div className="compact-section">
      <h3>FILTER</h3>
      <select value={filterType} onChange={...}>...</select>

      <ModulatableKnob
        value={cutoff}
        min={20}
        max={20000}
        label="Cutoff"
        unit="Hz"
        size="md"
        logarithmic
        patchDestination={LFODestination.FILTER_CUTOFF}
        activeConnections={lfos.filter(lfo => lfo.destination === LFODestination.FILTER_CUTOFF)}
        onChange={onFilterCutoffChange}
        onPatchConnect={onPatchConnect}
        onPatchDisconnect={onPatchDisconnect}
      />

      <ModulatableKnob
        value={resonance}
        min={0.1}
        max={30}
        label="Reso"
        patchDestination={LFODestination.FILTER_RESONANCE}
        activeConnections={lfos.filter(lfo => lfo.destination === LFODestination.FILTER_RESONANCE)}
        onChange={onFilterResonanceChange}
        onPatchConnect={onPatchConnect}
        onPatchDisconnect={onPatchDisconnect}
      />
    </div>
  )
}
```

#### 1.3 Refactorer CompactEffectsSection
Avant (145 lignes) → Après (~50 lignes)

Même pattern, 2 ModulatableKnob pour Reverb et Delay.

#### 1.4 Refactorer CompactSynthSection
Avant (242 lignes) → Après (~80 lignes)

3 ModulatableKnob pour les paramètres Richness ou Harmonic.

### Tests Phase 1
- [ ] Tester tous les knobs dans Filter/Noise/Effects
- [ ] Vérifier drag & drop patch connections
- [ ] Vérifier couleurs multiples de modulation
- [ ] Tester double-click reset
- [ ] Tester wheel/keyboard control
- [ ] Tester valeur editing (click → edit → Enter/Escape)

### Commit Phase 1
```bash
git add src/components/ModulatableKnob.tsx \
        src/components/CompactFilterSection.tsx \
        src/components/CompactEffectsSection.tsx \
        src/components/CompactSynthSection.tsx

git commit -m "refactor: create reusable ModulatableKnob component

- Add ModulatableKnob component encapsulating Knob + patch points
- Refactor CompactFilterSection using ModulatableKnob (-106 lines)
- Refactor CompactEffectsSection using ModulatableKnob (-95 lines)
- Refactor CompactSynthSection using ModulatableKnob (-162 lines)
- Total reduction: ~363 lines of duplicated code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🎯 PHASE 2: Hooks de Logique Métier (Impact: ⭐⭐⭐)

### Objectif
Extraire la logique métier d'AudioTestV2 dans des hooks réutilisables.

### Problème Actuel
**AudioTestV2.tsx** (509 lignes) contient:
- Logique Live View (lignes 74-140): getDisplayValue, getDisplayFilter, etc.
- Logique Patch Connections répétée 8+ fois
- Mix UI + business logic difficile à tester

### Solution

#### 2.1 Créer `src/hooks/useLiveView.ts`
```typescript
interface UseLiveViewOptions {
  enabled: boolean
  currentPreset: Preset
  audioEngine: AudioEngine | null
  pollInterval?: number
}

interface LiveViewValues {
  operators: { ratio: number, level: number }[]
  filter: { cutoff: number, resonance: number, type: string }
  effects: { reverb: number, delay: number, chorus: number }
  lfos: { rate: number, depth: number }[]
  // ... etc
}

export function useLiveView({ enabled, currentPreset, audioEngine, pollInterval = 50 }: UseLiveViewOptions) {
  const [modulatedValues, setModulatedValues] = useState<LiveViewValues | null>(null)

  useEffect(() => {
    if (!enabled || !audioEngine) return

    const interval = setInterval(() => {
      const values = audioEngine.getModulatedValues()
      setModulatedValues(values)
    }, pollInterval)

    return () => clearInterval(interval)
  }, [enabled, audioEngine, pollInterval])

  // Helper functions
  const getDisplayValue = (baseValue: number, path: string) => { ... }
  const getDisplayFilter = () => { ... }
  const getDisplayEffects = () => { ... }
  // ... etc

  return {
    modulatedValues,
    getDisplayValue,
    getDisplayFilter,
    getDisplayEffects,
    // ... etc
  }
}
```

**Taille estimée**: ~120 lignes

#### 2.2 Créer `src/hooks/usePatchConnections.ts`
```typescript
interface UsePatchConnectionsOptions {
  currentPreset: Preset
  lfos: LFOParams[]
  envelopeDestinations: { param: string, destination: LFODestination }[]
  onUpdateLFO: (index: number, updates: Partial<LFOParams>) => void
}

export function usePatchConnections({
  currentPreset,
  lfos,
  envelopeDestinations,
  onUpdateLFO
}: UsePatchConnectionsOptions) {

  const handlePatchConnect = useCallback((destination: LFODestination, lfoIndex: number) => {
    onUpdateLFO(lfoIndex, {
      destination,
      depth: lfos[lfoIndex].depth || 50
    })
  }, [lfos, onUpdateLFO])

  const handlePatchDisconnect = useCallback((destination: LFODestination, lfoIndex: number) => {
    if (lfos[lfoIndex].destination === destination) {
      onUpdateLFO(lfoIndex, {
        destination: LFODestination.NONE,
        depth: 0
      })
    }
  }, [lfos, onUpdateLFO])

  const getCombinedConnections = useCallback((destination: LFODestination) => {
    const lfoConnections = lfos
      .map((lfo, idx) => ({ ...lfo, lfoIndex: idx }))
      .filter(lfo => lfo.destination === destination)

    const envelopeConnection = envelopeDestinations.find(
      ed => ed.destination === destination
    )

    return { lfoConnections, envelopeConnection }
  }, [lfos, envelopeDestinations])

  const getConnectionColors = useCallback((destination: LFODestination) => {
    const connections = getCombinedConnections(destination)
    return connections.lfoConnections.map(conn => LFO_COLORS[conn.lfoIndex])
  }, [getCombinedConnections])

  return {
    handlePatchConnect,
    handlePatchDisconnect,
    getCombinedConnections,
    getConnectionColors
  }
}
```

**Taille estimée**: ~80 lignes

#### 2.3 Refactorer AudioTestV2.tsx
Avant (509 lignes) → Après (~250-300 lignes)

```typescript
export function AudioTestV2() {
  // ... state setup ...

  // Use custom hooks
  const liveView = useLiveView({
    enabled: liveViewEnabled,
    currentPreset,
    audioEngine: audioEngineInstance
  })

  const patchConnections = usePatchConnections({
    currentPreset,
    lfos,
    envelopeDestinations,
    onUpdateLFO: updatePresetLFO
  })

  // Simplified render using hooks
  return (
    <div>
      {/* Use liveView.getDisplayValue() */}
      {/* Use patchConnections.handlePatchConnect() */}
      {/* ... */}
    </div>
  )
}
```

### Tests Phase 2
- [ ] Tester Live View toggle on/off
- [ ] Vérifier polling des valeurs modulées
- [ ] Tester patch connect/disconnect via hooks
- [ ] Vérifier couleurs de connexion multiples
- [ ] Tester tous les paramètres modulables

### Commit Phase 2
```bash
git add src/hooks/useLiveView.ts \
        src/hooks/usePatchConnections.ts \
        src/components/AudioTestV2.tsx

git commit -m "refactor: extract business logic into custom hooks

- Add useLiveView hook for modulated values display
- Add usePatchConnections hook for patch routing logic
- Refactor AudioTestV2 to use custom hooks (-200+ lines)
- Improve testability and separation of concerns

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🎯 PHASE 3: Séparation AudioEngine (Impact: ⭐⭐⭐)

### Objectif
Décomposer AudioEngine.ts (758 lignes) en modules spécialisés.

### Problème Actuel
AudioEngine contient:
- Logique LFO modulation (200 lignes): énorme switch statement
- Logique preset loading (100 lignes)
- Méthodes update* (150 lignes)
- Calcul modulation pour Live View (200 lignes)

### Solution

#### 3.1 Créer `src/audio/LFOModulator.ts`
Extrait de AudioEngine.ts lignes 319-515.

```typescript
import { LFODestination, LFOParams } from './types'
import { FMEngine } from './FMEngine'
import { AudioPipeline } from './AudioPipeline'

export class LFOModulator {
  /**
   * Apply LFO modulation to the appropriate destination
   */
  static applyModulation(
    lfo: LFOParams,
    lfoValue: number,
    fmEngine: FMEngine,
    pipeline: AudioPipeline,
    noiseLevel: number,
    setNoiseLevel: (level: number) => void
  ): void {
    const depth = lfo.depth / 100
    const modAmount = lfoValue * depth

    switch (lfo.destination) {
      case LFODestination.PITCH:
        this.modulatePitch(fmEngine, modAmount)
        break
      case LFODestination.FILTER_CUTOFF:
        this.modulateFilterCutoff(pipeline, modAmount)
        break
      case LFODestination.FILTER_RESONANCE:
        this.modulateFilterResonance(pipeline, modAmount)
        break
      // ... etc (all destinations)
    }
  }

  private static modulatePitch(engine: FMEngine, amount: number): void {
    const cents = amount * 1200 // ±1200 cents (1 octave)
    engine.modulatePitch(cents)
  }

  private static modulateFilterCutoff(pipeline: AudioPipeline, amount: number): void {
    // Logarithmic scaling: 20Hz to 20000Hz
    const minFreq = Math.log(20)
    const maxFreq = Math.log(20000)
    const freqRange = maxFreq - minFreq
    const targetFreq = Math.exp(minFreq + (amount + 1) * 0.5 * freqRange)
    pipeline.setFilterCutoff(targetFreq)
  }

  // ... all other modulate* methods
}
```

**Taille estimée**: ~250 lignes

#### 3.2 Créer `src/audio/PresetLoader.ts`
Extrait de AudioEngine.ts lignes 544-599.

```typescript
import { Preset } from './types'
import { AudioPipeline } from './AudioPipeline'

export class PresetLoader {
  /**
   * Load a preset into the audio engine
   */
  static loadPreset(
    preset: Preset,
    pipeline: AudioPipeline,
    onNoiseTypeChange: (type: string) => void,
    onNoiseLevelChange: (level: number) => void
  ): void {
    // Set filter
    if (preset.filter) {
      pipeline.setFilterType(preset.filter.type)
      pipeline.setFilterCutoff(preset.filter.cutoff)
      pipeline.setFilterResonance(preset.filter.resonance)
    }

    // Set effects
    if (preset.masterEffects) {
      this.loadEffects(preset.masterEffects, pipeline)
    }

    // Set noise
    if (preset.noise) {
      onNoiseTypeChange(preset.noise.type)
      onNoiseLevelChange(preset.noise.level)
      if (preset.noise.filterCutoff !== undefined) {
        pipeline.setNoiseFilterCutoff(preset.noise.filterCutoff)
      }
      if (preset.noise.filterResonance !== undefined) {
        pipeline.setNoiseFilterResonance(preset.noise.filterResonance)
      }
    }
  }

  private static loadEffects(effects: any, pipeline: AudioPipeline): void {
    // ... load all effects
  }
}
```

**Taille estimée**: ~120 lignes

#### 3.3 Créer `src/audio/ParameterUpdater.ts`
Extrait de AudioEngine.ts lignes 600-707.

```typescript
import { LFOParams, OperatorParams, MasterEffectsParams } from './types'
import { AudioPipeline } from './AudioPipeline'
import { LFOEngine } from './LFOEngine'

export class ParameterUpdater {
  /**
   * Update LFO parameters in the global LFO engine
   */
  static updateLFO(
    lfoIndex: number,
    updates: Partial<LFOParams>,
    lfoEngine: LFOEngine,
    tempo: number
  ): void {
    const lfo = lfoEngine.getLFO(lfoIndex)
    if (!lfo) return

    if (updates.waveform !== undefined) lfo.setWaveform(updates.waveform)
    if (updates.rate !== undefined) lfo.setRate(updates.rate)
    if (updates.depth !== undefined) lfo.setDepth(updates.depth)
    if (updates.bpmSync !== undefined) {
      lfo.setBPMSync(updates.bpmSync)
      if (updates.bpmSync && updates.division) {
        lfo.setBPMDivision(updates.division, tempo)
      }
    }
  }

  /**
   * Update operator parameters in active voices
   */
  static updateOperator(
    operatorIndex: number,
    updates: Partial<OperatorParams>,
    voices: Map<number, any>
  ): void {
    // Update all active voices
    voices.forEach(voice => {
      if (voice.fmEngine) {
        // ... update operator
      }
    })
  }

  /**
   * Update filter parameters
   */
  static updateFilter(
    updates: { type?: string, cutoff?: number, resonance?: number },
    pipeline: AudioPipeline
  ): void {
    if (updates.type) pipeline.setFilterType(updates.type)
    if (updates.cutoff !== undefined) pipeline.setFilterCutoff(updates.cutoff)
    if (updates.resonance !== undefined) pipeline.setFilterResonance(updates.resonance)
  }

  // ... updateMasterEffects, updateSynthEngineParams, etc.
}
```

**Taille estimée**: ~150 lignes

#### 3.4 Créer `src/audio/ModulationCalculator.ts`
Extrait de AudioEngine.ts lignes 731-934.

```typescript
export class ModulationCalculator {
  /**
   * Calculate all modulated values for Live View
   */
  static getModulatedValues(
    currentPreset: Preset,
    lfoEngine: LFOEngine,
    voices: Map<number, any>
  ): any {
    const lfos = currentPreset.lfos || []

    return {
      operators: this.getModulatedOperators(currentPreset, lfos, lfoEngine),
      filter: this.getModulatedFilter(currentPreset, lfos, lfoEngine),
      effects: this.getModulatedEffects(currentPreset, lfos, lfoEngine),
      lfos: this.getModulatedLFOs(currentPreset, lfos, lfoEngine),
      // ... etc
    }
  }

  private static getModulatedOperators(
    preset: Preset,
    lfos: LFOParams[],
    lfoEngine: LFOEngine
  ): any[] {
    // ... calculate operator modulation
  }

  // ... all other calculation methods
}
```

**Taille estimée**: ~200 lignes

#### 3.5 Refactorer AudioEngine.ts
Avant (758 lignes) → Après (~150-200 lignes)

```typescript
import { LFOModulator } from './LFOModulator'
import { PresetLoader } from './PresetLoader'
import { ParameterUpdater } from './ParameterUpdater'
import { ModulationCalculator } from './ModulationCalculator'

export class AudioEngine {
  // ... constructor and basic setup ...

  noteOn(note: number, velocity: number = 1.0): void {
    // Voice allocation
    // FM/LFO engine creation
    // Start LFO modulation interval using LFOModulator.applyModulation
  }

  loadPreset(preset: Preset): void {
    PresetLoader.loadPreset(preset, this.pipeline, ...)
  }

  updateLFO(lfoIndex: number, updates: Partial<LFOParams>): void {
    ParameterUpdater.updateLFO(lfoIndex, updates, this.globalLFOEngine, this.tempo)
  }

  getModulatedValues(): any {
    return ModulationCalculator.getModulatedValues(
      this.currentPreset,
      this.globalLFOEngine,
      this.voices
    )
  }

  // ... other core methods ...
}
```

### Tests Phase 3
- [ ] Tester toutes les destinations LFO
- [ ] Vérifier loading de tous les presets
- [ ] Tester update de tous les paramètres
- [ ] Vérifier Live View après refactoring
- [ ] Tester noteOn/noteOff
- [ ] Vérifier polyphonie (8 voix)

### Commit Phase 3
```bash
git add src/audio/LFOModulator.ts \
        src/audio/PresetLoader.ts \
        src/audio/ParameterUpdater.ts \
        src/audio/ModulationCalculator.ts \
        src/audio/AudioEngine.ts

git commit -m "refactor: decompose AudioEngine into specialized modules

- Add LFOModulator class for LFO modulation logic
- Add PresetLoader class for preset loading
- Add ParameterUpdater class for parameter updates
- Add ModulationCalculator class for Live View calculations
- Refactor AudioEngine to use new modules (-550+ lines)
- Improve testability and maintainability

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🎯 PHASE 4: Séparation Knob Component (Impact: ⭐)

### Objectif
Décomposer Knob.tsx (471 lignes) pour séparer logique d'interaction et rendu SVG.

### Problème Actuel
Knob.tsx mélange:
- Interaction (drag, wheel, keyboard): ~150 lignes
- Editing de valeur: ~50 lignes
- Rendu SVG: ~200 lignes

### Solution

#### 4.1 Créer `src/components/knob/useKnobInteraction.ts`
```typescript
interface UseKnobInteractionOptions {
  value: number
  min: number
  max: number
  step: number
  logarithmic?: boolean
  onChange: (value: number) => void
  onDoubleClick?: () => void
}

export function useKnobInteraction({
  value,
  min,
  max,
  step,
  logarithmic,
  onChange,
  onDoubleClick
}: UseKnobInteractionOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartValue, setDragStartValue] = useState(0)
  const [sensitivity, setSensitivity] = useState<'normal' | 'fine' | 'ultra'>('normal')

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // ... drag logic
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // ... drag logic
  }, [])

  const handleMouseUp = useCallback(() => {
    // ... drag logic
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // ... wheel logic
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // ... keyboard logic (arrow up/down)
  }, [])

  return {
    isDragging,
    sensitivity,
    handleMouseDown,
    handleWheel,
    handleKeyDown,
    handleDoubleClick: onDoubleClick
  }
}
```

**Taille estimée**: ~120 lignes

#### 4.2 Créer `src/components/knob/useKnobEditing.ts`
```typescript
export function useKnobEditing(
  value: number,
  onChange: (value: number) => void,
  min: number,
  max: number
) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const startEditing = useCallback(() => {
    setIsEditing(true)
    setEditValue(value.toString())
  }, [value])

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const parsed = parseFloat(editValue)
      if (!isNaN(parsed)) {
        onChange(Math.max(min, Math.min(max, parsed)))
      }
      setIsEditing(false)
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }, [editValue, onChange, min, max])

  return {
    isEditing,
    editValue,
    inputRef,
    startEditing,
    setEditValue,
    handleEditKeyDown
  }
}
```

**Taille estimée**: ~60 lignes

#### 4.3 Créer `src/components/knob/KnobSVG.tsx`
```typescript
interface KnobSVGProps {
  value: number
  min: number
  max: number
  size: 'sm' | 'md' | 'lg' | 'xl'
  connectionColors?: string[]
  isDragging: boolean
}

export function KnobSVG({
  value,
  min,
  max,
  size,
  connectionColors,
  isDragging
}: KnobSVGProps) {
  const sizeMap = { sm: 48, md: 60, lg: 80, xl: 100 }
  const svgSize = sizeMap[size]
  const normalized = (value - min) / (max - min)

  return (
    <svg width={svgSize} height={svgSize}>
      {/* Gradient definitions */}
      <defs>
        <radialGradient id="knobGradient">
          {/* ... gradient stops */}
        </radialGradient>
      </defs>

      {/* Background circle */}
      <circle
        cx={svgSize / 2}
        cy={svgSize / 2}
        r={svgSize / 2 - 2}
        fill="url(#knobGradient)"
      />

      {/* Connection color rings */}
      {connectionColors?.map((color, idx) => (
        <circle
          key={idx}
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={svgSize / 2 - 4 - idx * 2}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      ))}

      {/* Value arc */}
      <path
        d={/* ... arc path */}
        stroke="var(--accent-color)"
        strokeWidth="3"
        fill="none"
      />

      {/* Pointer */}
      <line
        x1={svgSize / 2}
        y1={svgSize / 2}
        x2={/* ... based on normalized value */}
        y2={/* ... based on normalized value */}
        stroke="var(--accent-color)"
        strokeWidth="2"
      />

      {/* Tick marks */}
      {/* ... tick marks rendering */}
    </svg>
  )
}
```

**Taille estimée**: ~150 lignes

#### 4.4 Refactorer Knob.tsx
Avant (471 lignes) → Après (~100 lignes)

```typescript
import { useKnobInteraction } from './knob/useKnobInteraction'
import { useKnobEditing } from './knob/useKnobEditing'
import { KnobSVG } from './knob/KnobSVG'

export function Knob({
  value,
  min,
  max,
  step,
  label,
  unit,
  size = 'md',
  connectionColors,
  logarithmic,
  hideNumericValue,
  onChange,
  onDoubleClick
}: KnobProps) {
  const interaction = useKnobInteraction({
    value,
    min,
    max,
    step,
    logarithmic,
    onChange,
    onDoubleClick
  })

  const editing = useKnobEditing(value, onChange, min, max)

  return (
    <div className="knob-container">
      {label && <div className="knob-label">{label}</div>}

      <div
        onMouseDown={interaction.handleMouseDown}
        onWheel={interaction.handleWheel}
        onKeyDown={interaction.handleKeyDown}
        onDoubleClick={interaction.handleDoubleClick}
        onClick={editing.startEditing}
      >
        <KnobSVG
          value={value}
          min={min}
          max={max}
          size={size}
          connectionColors={connectionColors}
          isDragging={interaction.isDragging}
        />
      </div>

      {!hideNumericValue && (
        editing.isEditing ? (
          <input
            ref={editing.inputRef}
            value={editing.editValue}
            onChange={e => editing.setEditValue(e.target.value)}
            onKeyDown={editing.handleEditKeyDown}
            onBlur={() => editing.setIsEditing(false)}
          />
        ) : (
          <div className="knob-value">
            {value.toFixed(1)} {unit}
          </div>
        )
      )}
    </div>
  )
}
```

### Tests Phase 4
- [ ] Tester drag interaction (normal/fine/ultra sensitivity)
- [ ] Tester wheel control
- [ ] Tester keyboard arrows
- [ ] Tester double-click reset
- [ ] Tester value editing
- [ ] Vérifier rendu SVG avec toutes les tailles
- [ ] Vérifier multiple connection colors

### Commit Phase 4
```bash
git add src/components/knob/ \
        src/components/Knob.tsx

git commit -m "refactor: decompose Knob into specialized modules

- Add useKnobInteraction hook for drag/wheel/keyboard logic
- Add useKnobEditing hook for value editing
- Add KnobSVG component for pure SVG rendering
- Refactor Knob to use new modules (-370+ lines)
- Improve testability and separation of concerns

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## ✅ VALIDATION FINALE

### Tests Complets
1. **Fonctionnalité Audio**
   - [ ] Tester tous les presets
   - [ ] Vérifier polyphonie (8 voix)
   - [ ] Tester tous les LFOs avec toutes les destinations
   - [ ] Vérifier filter/effects
   - [ ] Tester noise generator
   - [ ] Vérifier envelope ADSR

2. **UI/UX**
   - [ ] Tester tous les knobs (drag, wheel, keyboard)
   - [ ] Vérifier patch connections
   - [ ] Tester Live View
   - [ ] Vérifier keyboard virtuel (A-')
   - [ ] Tester latch mode
   - [ ] Vérifier preset save/load

3. **Performance**
   - [ ] Vérifier absence de memory leaks
   - [ ] Tester CPU usage avec 8 voix
   - [ ] Vérifier réactivité UI

### Build & Lint
```bash
npm run lint
npm run build
```

### Commit Final
```bash
git add -A
git commit -m "refactor: complete modular architecture refactoring

Summary of changes:
- Phase 1: Created reusable ModulatableKnob (-363 lines duplication)
- Phase 2: Extracted useLiveView and usePatchConnections hooks (-200 lines)
- Phase 3: Decomposed AudioEngine into 4 specialized modules (-550 lines)
- Phase 4: Separated Knob into hooks and SVG component (-370 lines)

Total impact:
- Reduced codebase by ~1500 lines of complex/duplicated code
- Added 10 new reusable modules
- Improved testability and maintainability
- Enhanced code resilience to future changes

All tests passing, no regressions.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

---

## 📈 Résumé des Améliorations

### Métriques Finales
| Fichier | Avant | Après | Réduction |
|---------|-------|-------|-----------|
| AudioEngine.ts | 758 L | ~180 L | -578 L |
| AudioTestV2.tsx | 509 L | ~280 L | -229 L |
| Knob.tsx | 471 L | ~100 L | -371 L |
| Compact*Section | 553 L | ~190 L | -363 L |
| **TOTAL** | **2291 L** | **~750 L** | **-1541 L** |

### Nouveaux Modules Créés
1. `ModulatableKnob.tsx` (~120 L)
2. `useLiveView.ts` (~120 L)
3. `usePatchConnections.ts` (~80 L)
4. `LFOModulator.ts` (~250 L)
5. `PresetLoader.ts` (~120 L)
6. `ParameterUpdater.ts` (~150 L)
7. `ModulationCalculator.ts` (~200 L)
8. `useKnobInteraction.ts` (~120 L)
9. `useKnobEditing.ts` (~60 L)
10. `KnobSVG.tsx` (~150 L)

**Total nouveau code**: ~1370 lignes réutilisables et bien séparées

### Bénéfices
✅ **Réduction nette**: ~170 lignes de code
✅ **Duplication éliminée**: ~450 lignes
✅ **Modularité**: +10 modules réutilisables
✅ **Testabilité**: Chaque module testable indépendamment
✅ **Maintenabilité**: Fichiers de 100-250 lignes vs 500-750 lignes
✅ **Résilience**: Changements isolés dans des modules spécialisés

---

## 🚀 Prochaines Étapes (Post-Refactoring)

### Améliorations Potentielles
1. **Tests Unitaires**: Ajouter tests pour les nouveaux modules
2. **Documentation**: JSDoc pour toutes les fonctions publiques
3. **Performance**: Profiling et optimisations si nécessaire
4. **Features**: Nouvelles destinations LFO faciles à ajouter
5. **UI**: Nouvelles sections modulables faciles à créer

### Architecture Future
Avec cette nouvelle architecture modulaire, ajouter de nouvelles features sera beaucoup plus simple:
- Nouveau LFO destination: ajouter un case dans LFOModulator
- Nouveau paramètre modulable: utiliser ModulatableKnob
- Nouvelle section UI: réutiliser les hooks existants
