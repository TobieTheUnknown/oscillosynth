# OscilloSynth - Structure du Projet et Opportunités de Refactoring

## 📊 Vue d'ensemble

OscilloSynth est un synthétiseur FM 4-opérateurs avec interface oscilloscope XY, LFOs, effets et modulation. Le projet utilise React + TypeScript + Tone.js.

---

## 🗂️ Structure des Dossiers

```
src/
├── audio/              # Moteur audio (Tone.js)
│   ├── presets/        # Presets d'usine
│   └── types.ts        # Types TypeScript
├── components/         # Composants React UI
├── hooks/              # Custom React hooks
├── store/              # State management (Zustand)
└── design-tokens/      # Variables CSS
```

---

## 🎵 AUDIO ENGINE (src/audio/)

### **AudioEngine.ts** (758 lignes) - TRÈS GROS FICHIER
**Rôle**: Moteur audio principal, orchestre FM/LFO/Effects/Voice Pool

#### Sections clés:
- **Lignes 1-57**: Imports et interfaces
- **Lignes 58-99**: Constructor - Initialise pipeline, noise, master gain
- **Lignes 100-287**: `noteOn()` - Allocation de voix, création FM/LFO engines
- **Lignes 288-318**: `noteOff()` - Libération de voix
- **Lignes 319-515**: `applyLFOModulation()` - ÉNORME switch statement pour toutes les destinations LFO
  - ⚠️ **OPPORTUNITÉ DE REFACTORING**: Créer des fonctions séparées par destination
- **Lignes 516-538**: `releaseVoice()` - Cleanup de voix
- **Lignes 544-599**: `loadPreset()` - Charge un preset, configure filter/effects
- **Lignes 600-707**: Méthodes de mise à jour de paramètres:
  - `updateLFO()`, `updateOperator()`, `updateFilter()`, `updateMasterEffects()`, `updateSynthEngineParams()`
- **Lignes 708-730**: `getState()`, `getPipeline()`, `getGlobalLFOEngine()`, **`getModulatedValues()`** (nouveau pour Live View)
- **Lignes 731-934**: `getModulatedValues()` - Calcule valeurs post-modulation pour Live View

**Opportunités de refactoring**:
1. Extraire `applyLFOModulation()` en fichier séparé avec mapping destination → function
2. Créer `PresetLoader.ts` pour logique de chargement
3. Séparer `ParameterUpdater.ts` pour les méthodes update*
4. Créer `ModulationCalculator.ts` pour `getModulatedValues()`

---

### **AudioPipeline.ts** (299 lignes)
**Rôle**: Chaîne d'effets (Filter → Distortion → Chorus → Delay → Reverb → Limiter)

#### Sections:
- **Lignes 22-100**: Constructor - Crée tous les effets Tone.js
- **Lignes 109-129**: Méthodes de connexion (`connect()`, `connectAfterFilter()`, `toDestination()`)
- **Lignes 130-299**: Setters pour chaque effet (reverb, delay, chorus, etc.)

**Routing audio**:
```
FM Synth → Filter → Distortion → Chorus → Delay → Reverb → Limiter → Output
                ↑
            Noise (bypass filter, injecté après)
```

---

### **FMEngine.ts** (319 lignes)
**Rôle**: Moteur FM 4-opérateurs avec algorithms DX7-style

#### Sections:
- **Lignes 10-51**: Constructor - Crée 4 opérateurs + sub osc + panner
- **Lignes 56-160**: `setupRoutingWithFrequency()` - Configure routing selon algorithm
  - Algorithms: SERIAL, PARALLEL, DUAL_SERIAL, FAN_OUT, SPLIT
- **Lignes 165-193**: `noteOn()`, `noteOnWithPortamento()`, `noteOff()`
- **Lignes 197-233**: Méthodes de modulation (pitch, amplitude, operator level/ratio)
- **Lignes 239-266**: `setFeedback()` - Routing feedback OP4 → OP4
- **Lignes 271-283**: `setSubOscLevel()`, `setStereoSpread()` - Richness controls
- **Lignes 288-318**: `connect()`, `disconnect()`, `dispose()`

---

### **FMOperator.ts** (171 lignes)
**Rôle**: Opérateur FM individuel avec envelope ADSR

#### Sections:
- **Lignes 1-82**: Constructor et création de l'oscillateur + envelope
- **Lignes 84-110**: `trigger()`, `triggerWithPortamento()`, `release()`
- **Lignes 112-171**: Méthodes de modulation et utilitaires

---

### **LFOEngine.ts** (200 lignes)
**Rôle**: 4 LFOs individuels avec waveforms et sync BPM

#### Classes:
1. **LFO** (lignes 9-120): LFO individuel
   - `getValue()`: Retourne valeur -1 à 1
   - Waveforms: SINE, SQUARE, SAWTOOTH, TRIANGLE
   - Sync BPM optionnel

2. **LFOEngine** (lignes 129-199): Gestionnaire de 4 LFOs
   - `getLFO1Value()`, `getLFO2Value()`, etc.

---

### **VoicePool.ts** (59 lignes)
**Rôle**: Allocation de voix polyphoniques (8 voix max)

---

### **types.ts** (331 lignes)
**Rôle**: Définitions TypeScript pour tout le projet

Types principaux:
- `Preset` - Preset complet avec operators, LFOs, effects, filter
- `OperatorParams` - Ratio, level, ADSR
- `LFOParams` - Waveform, rate, depth, destination
- `AlgorithmType` - SERIAL, PARALLEL, FAN_OUT, SPLIT, DUAL_SERIAL
- `LFODestination` - Enum de toutes les destinations (PITCH, FILTER_CUTOFF, OP1_LEVEL, etc.)

---

### **Presets** (src/audio/presets/)

- **defaultPreset.ts** (105 lignes) - Liste tous les presets, preset par défaut
- **ambientPresets.ts** (191 lignes) - 4 presets ambient (Cosmic Pad, Deep Ocean, Shimmer, Evolving Drone)
- **texturePresets.ts** (216 lignes) - 5 presets de textures évolutives

---

## 🎨 COMPONENTS (src/components/)

### **AudioTestV2.tsx** (509 lignes) - FICHIER PRINCIPAL UI - TRÈS GROS
**Rôle**: Layout principal de l'application, orchestre tous les composants

#### Structure:
- **Lignes 1-73**: Imports, state management, hooks
- **Lignes 74-140**: Helper functions pour Live View (getDisplayValue, getDisplayFilter, etc.)
- **Lignes 144-209**: Header (titre, volume, preset browser, Live View button)
- **Lignes 211-309**: 4 LFOs autour de l'oscilloscope (grid layout)
- **Lignes 369-448**: Filter → Noise → Effects (3 colonnes)
- **Lignes 450-481**: ADSR Envelope + RICHNESS section
- **Lignes 483-520**: Algorithm + Operators + HARMONIC section
- **Lignes 522-541**: InlineKeyboard en bas

**Opportunités de refactoring**:
1. Extraire la logique de patch connection (répétée partout)
2. Créer un composant `ModulatableSection` générique
3. Extraire les helpers Live View dans un hook `useLiveView()`

---

### **Knob.tsx** (471 lignes) - COMPOSANT RÉUTILISABLE MAIS COMPLEXE
**Rôle**: Knob rotatif SVG avec drag, wheel, keyboard, édition de valeur, multi-modulation

#### Fonctionnalités:
- **Lignes 68-123**: Drag handlers avec sensitivity modes (normal/fine/ultra)
- **Lignes 75-83**: Double-click reset
- **Lignes 85-107**: Value editing (click to edit, Enter/Escape)
- **Lignes 109-134**: Keyboard + wheel support
- **Lignes 199-470**: Rendu SVG (gradient, tick marks, arcs, pointer)

**Props importantes**:
- `connectionColors`: Array de couleurs pour afficher plusieurs modulateurs
- `size`: sm/md/lg/xl pour hiérarchie visuelle
- `hideNumericValue`: Cache la valeur numérique

**Opportunités de refactoring**:
1. Séparer la logique d'interaction du rendu SVG
2. Créer `KnobSVG.tsx` pour le visuel pur
3. Créer `useKnobInteraction()` hook pour la logique

---

### **CompactFilterSection.tsx** (166 lignes) - ⚠️ RÉPÉTITION DE CODE
**Rôle**: Section Filter avec 2 knobs + selector de type

#### Structure:
- **Lignes 1-40**: Props et helper pour compter connexions
- **Lignes 41-166**: Rendu (Type selector + 2 Knobs avec patch points)

**Pattern répété**: Knob + Patch point overlay

---

### **CompactEffectsSection.tsx** (145 lignes) - ⚠️ RÉPÉTITION DE CODE
**Rôle**: Section Effects avec 2 knobs (Reverb, Delay)

Même pattern que CompactFilterSection.

---

### **CompactSynthSection.tsx** (242 lignes) - ⚠️ RÉPÉTITION DE CODE
**Rôle**: Section Richness OU Harmonic (selon prop)

Affiche 3 knobs avec patch points.

---

### **SimplifiedSynthEngine.tsx** (376 lignes) - COMPLEXE
**Rôle**: Affiche algorithm selector + 4 operator knobs + patch routing

#### Sections:
- **Lignes 1-94**: Algorithm diagram SVG
- **Lignes 95-376**: Layout avec algorithm selector + 4 knobs operators

---

### **LFOPad.tsx** (324 lignes)
**Rôle**: Contrôle LFO individuel avec XY pad, rate/depth knobs, waveform selector

#### Fonctionnalités:
- XY Pad pour rate/depth simultané
- Sync BPM avec divisions musicales
- Patch cable drag & drop
- Visualisation de waveform

---

### **NoiseGenerator.tsx** (232 lignes)
**Rôle**: Générateur de bruit (White/Pink/Brown) avec filter + level

---

### **ADSREnvelope.tsx** (260 lignes)
**Rôle**: Contrôle envelope ADSR avec visualisation graphique

---

### **InlineKeyboard.tsx** (226 lignes)
**Rôle**: Clavier virtuel (QWERTY → MIDI) avec latch mode

#### Fonctionnalités:
- Mapping A-' → C3-F4
- Latch mode avec chord window (100ms)
- Ignore inputs/textareas pour éviter conflits
- Blur des boutons après click pour garder keyboard actif

---

### **OscilloscopeXY.tsx** (143 lignes)
**Rôle**: Oscilloscope Lissajous (X/Y) avec canvas

---

### **IntegratedOscilloscopeControls.tsx** (123 lignes)
**Rôle**: Overlay controls sur oscilloscope (Volume, Latch, Clear)

---

### **PresetBrowser.tsx** (181 lignes)
**Rôle**: Sélecteur de presets avec modal grid + save

---

### **IdleColorPicker.tsx** (73 lignes)
**Rôle**: Picker de couleur pour l'idle color

---

## 🎣 HOOKS (src/hooks/)

### **useAudioEngine.ts** (136 lignes)
**Rôle**: Hook principal pour accès à l'audio engine + preset store

Expose:
- State audio (isStarted, activeVoices, currentPreset)
- Actions (noteOn, noteOff, updatePreset, etc.)
- `getModulatedValues()` pour Live View

---

## 🗄️ STORE (src/store/)

### **audioStore.ts** (137 lignes)
**Rôle**: Zustand store pour state audio global

Actions:
- `startAudio()`, `stopAll()`, `setMuted()`
- `noteOn()`, `noteOff()`
- `setNoiseType()`, `setNoiseLevel()`, etc.
- **`getModulatedValues()`** - Nouveau pour Live View

Auto-update des voix actives tous les 100ms.

---

### **presetStore.ts** (162 lignes)
**Rôle**: Zustand store pour gestion des presets

Fonctionnalités:
- Load/save user presets (localStorage)
- Update live parameters (updateCurrentPresetLFO, updateCurrentPresetOperator, etc.)
- Sync avec AudioEngine

---

## 🎯 OPPORTUNITÉS DE REFACTORING MAJEURES

### 1. **Composant Modulatable Générique** ⭐⭐⭐
**Problème actuel**:
- CompactFilterSection, CompactEffectsSection, CompactSynthSection ont le même pattern:
  - Knobs + Patch points overlay
  - Connection handlers
  - Répétition de code ~150 lignes × 3 fichiers

**Solution proposée**:
```typescript
// ModulatableKnob.tsx
<ModulatableKnob
  value={value}
  onChange={onChange}
  label="Cutoff"
  connections={lfos} // Couleurs des LFOs connectés
  onPatchConnect={onPatchConnect}
  onPatchDisconnect={onPatchDisconnect}
  patchDestination={LFODestination.FILTER_CUTOFF}
/>
```

**Bénéfices**:
- Réduction de ~450 lignes de code dupliqué
- Maintenance centralisée
- Ajout facile de nouveaux paramètres modulables

---

### 2. **Séparation AudioEngine.ts** ⭐⭐⭐
**Problème actuel**: 758 lignes, difficile à naviguer

**Solution proposée**:
```
audio/
├── AudioEngine.ts (core orchestration, ~150 lignes)
├── LFOModulator.ts (applyLFOModulation logic, ~200 lignes)
├── PresetLoader.ts (loadPreset logic, ~100 lignes)
├── ParameterUpdater.ts (update* methods, ~150 lignes)
└── ModulationCalculator.ts (getModulatedValues, ~150 lignes)
```

---

### 3. **Hook useLiveView** ⭐⭐
**Problème actuel**: Logique Live View éparpillée dans AudioTestV2

**Solution proposée**:
```typescript
// hooks/useLiveView.ts
export function useLiveView(enabled: boolean, currentPreset: Preset) {
  const [modulatedValues, setModulatedValues] = useState({})

  // Polling logic
  // Helper functions (getDisplayValue, getDisplayFilter, etc.)

  return { modulatedValues, getDisplayValue, getDisplayFilter, ... }
}
```

---

### 4. **Extraction Logique de Patch Connections** ⭐⭐
**Problème actuel**: handlePatchConnect/Disconnect répété dans AudioTestV2

**Solution proposée**:
```typescript
// hooks/usePatchConnections.ts
export function usePatchConnections(currentPreset, lfos, envelopeDestinations) {
  const handleConnect = (destination) => { ... }
  const handleDisconnect = (destination) => { ... }
  const getCombinedConnections = () => { ... }

  return { handleConnect, handleDisconnect, getCombinedConnections }
}
```

---

### 5. **Séparation Knob.tsx** ⭐
**Problème actuel**: 471 lignes, mélange logique + rendu

**Solution proposée**:
```typescript
// components/knob/
├── Knob.tsx (orchestration, ~100 lignes)
├── KnobSVG.tsx (rendu SVG pur, ~200 lignes)
├── useKnobInteraction.ts (drag/wheel/keyboard, ~150 lignes)
└── useKnobEditing.ts (value editing, ~50 lignes)
```

---

## 📊 STATISTIQUES DU PROJET

### Lignes de code par catégorie:
- **Audio Engine**: ~2000 lignes
- **Components**: ~3500 lignes
- **Stores/Hooks**: ~400 lignes
- **Types**: ~330 lignes
- **Presets**: ~500 lignes

### Fichiers les plus gros (opportunités de refactoring):
1. **AudioEngine.ts** - 758 lignes ⚠️
2. **AudioTestV2.tsx** - 509 lignes ⚠️
3. **Knob.tsx** - 471 lignes ⚠️
4. **SimplifiedSynthEngine.tsx** - 376 lignes
5. **types.ts** - 331 lignes
6. **LFOPad.tsx** - 324 lignes

### Répétition de code détectée:
- Pattern "Knob + Patch points" dans Filter/Effects/Synth sections (~450 lignes total)
- Logique de patch connection dans AudioTestV2 (répété 8+ fois)
- Helpers Live View (getDisplayFilter, getDisplayEffects, etc.)

---

## 🚀 PLAN DE REFACTORING RECOMMANDÉ

### Phase 1: Composants réutilisables (Impact: ⭐⭐⭐)
1. Créer `ModulatableKnob.tsx` component
2. Refactorer CompactFilterSection, CompactEffectsSection, CompactSynthSection
3. **Résultat**: -450 lignes, +1 composant réutilisable

### Phase 2: Extraction hooks (Impact: ⭐⭐)
1. Créer `useLiveView()` hook
2. Créer `usePatchConnections()` hook
3. Nettoyer AudioTestV2.tsx
4. **Résultat**: AudioTestV2 passe de 509 → ~300 lignes

### Phase 3: Séparation AudioEngine (Impact: ⭐⭐⭐)
1. Extraire LFOModulator.ts
2. Extraire PresetLoader.ts
3. Extraire ParameterUpdater.ts
4. Extraire ModulationCalculator.ts
5. **Résultat**: AudioEngine passe de 758 → ~150 lignes core

### Phase 4: Refactoring Knob (Impact: ⭐)
1. Créer KnobSVG.tsx (rendu pur)
2. Créer useKnobInteraction.ts
3. Créer useKnobEditing.ts
4. **Résultat**: Knob.tsx passe de 471 → ~100 lignes

---

## 📝 NOTES TECHNIQUES

### Routing Audio Actuel:
```
[FM Operators] → [Master Gain] → [Filter] ────┐
                                               ├→ [Distortion] → [Chorus] → [Delay] → [Reverb] → [Limiter] → [Output]
[Noise] → [Noise Filter] → [Noise Envelope] ──┘
```

### LFO Modulation Flow:
```
LFOEngine (4 LFOs) → applyLFOModulation() → switch(destination) → Parameter update
                                                                 → FMEngine
                                                                 → AudioPipeline
                                                                 → Noise
```

### State Management:
```
User Input → Component → audioStore/presetStore → AudioEngine → Tone.js → Audio Output
                      ↓
                    localStorage (user presets)
```

---

## 🎯 CONCLUSION

Le projet est bien structuré mais souffre de:
1. **Fichiers trop gros** (AudioEngine, AudioTestV2, Knob)
2. **Répétition de code** (pattern Knob+Patch)
3. **Logique mélangée** (UI + business logic)

**Impact du refactoring proposé**:
- Réduction de **~1000 lignes de code dupliqué**
- **+5 composants/hooks réutilisables**
- **Meilleure maintenabilité** et **testabilité**
- **Code plus lisible** et **modulaire**

Les agents pourront travailler sur des fichiers de ~100-200 lignes au lieu de 500-700 lignes, avec un contexte beaucoup plus clair.
