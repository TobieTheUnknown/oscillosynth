# OscilloSynth - Tâches Prioritaires

## 🔴 PRIORITÉ HAUTE (À faire en premier)

### 1. ✅ Fix LFO Rate Live Updates (2-3h)
**Problème:** Changer le rate d'un LFO ne met pas à jour les voix actives.

**Solution:**
```typescript
// Dans LFOEngine.ts
updateLFORate(lfoIndex: 0-7, newRate: number): void {
  this.lfos[lfoIndex].frequency.value = newRate
}

// Dans AudioEngine.ts
voices.forEach(voice => {
  voice.lfoEngine.updateLFORate(lfoIndex, newRate)
})
```

**Fichiers:**
- `src/audio/LFOEngine.ts`
- `src/audio/AudioEngine.ts`
- `src/store/presetStore.ts`

---

### 2. ✅ UI pour Feedback de l'Opérateur 4 (30min)
**Problème:** Le feedback existe dans le backend mais pas de knob UI.

**Solution:**
```tsx
// Dans OperatorControls.tsx, ajouter:
{operatorNumber === 4 && (
  <PercentageKnob
    label="Feedback"
    value={(params.feedback ?? 0) * 100}
    defaultValue={0}
    color={color}
    onChange={(feedback) => onChange({ feedback: feedback / 100 })}
  />
)}
```

**Fichier:**
- `src/components/OperatorControls.tsx`

---

### 3. ✅ Preset Browser/Manager (4-6h)
**Manque:** Interface pour parcourir/sauvegarder/gérer les presets.

**À implémenter:**
- Grille de presets visuels
- Bouton "Save" (nouveau preset)
- Bouton "Delete" (user presets)
- Export/Import JSON
- Catégories/tags

**Fichiers à créer:**
- `src/components/PresetBrowser.tsx`
- `src/components/PresetCard.tsx`

**Fichiers à modifier:**
- `src/store/presetStore.ts` (save/delete/export/import)
- `src/components/AudioTestV2.tsx`

---

### 4. ✅ Algorithm Visualizer (6-8h)
**Manque:** Diagramme visuel du routing des opérateurs.

**Exemple (Algorithm SPLIT):**
```
    ┌────┐
    │ 4  │────┐
    └────┘    │
              ↓
    ┌────┐  ┌────┐
    │ 3  │→ │ 2  │
    └────┘  └────┘
              ↓
            ┌────┐
            │ 1  │ → OUT
            └────┘
```

**Fichiers à créer:**
- `src/components/AlgorithmVisualizer.tsx`
- `src/components/AlgorithmDiagram.tsx`

---

## 🟡 PRIORITÉ MOYENNE

### 5. ✅ LFO Tempo Sync (3-4h)
**À ajouter:**
- Input BPM (tempo global)
- Toggle sync par LFO
- Sélecteur note value (1/16, 1/8, 1/4, etc.)

**Backend déjà prêt:**
```typescript
interface LFOParams {
  sync: boolean
  syncValue?: '1/16' | '1/8' | '1/4' | '1/2' | '1' | '2' | '4' | '8'
}
```

**Fichiers:**
- `src/components/LFOPairPanel.tsx`
- `src/audio/LFOEngine.ts`
- `src/components/AudioTestV2.tsx`

---

### 6. ✅ Operator Ratio Presets (2-3h)
**À ajouter:**
- Boutons ratio communs (1.0, 2.0, 3.0, 4.0)
- Mode "Harmonic" vs "Inharmonic"
- Indicateur visuel pour ratios harmoniques

**Fichier:**
- `src/components/OperatorControls.tsx`

---

### 7. ✅ Global Tuning (2h)
**À ajouter:**
- Master tuning (-100 to +100 cents)
- Toggle A440 / A432

**Fichiers:**
- `src/audio/AudioEngine.ts`
- `src/components/AudioTestV2.tsx`

---

### 8. ✅ Velocity Curves (3h)
**À ajouter:**
- Sélecteur de courbe (Linear, Exp, Log, Fixed)
- Velocity sensitivity per operator

**Fichiers:**
- `src/audio/types.ts`
- `src/audio/FMOperator.ts`
- `src/components/OperatorControls.tsx`

---

## 🟢 PRIORITÉ BASSE / NICE-TO-HAVE

### 9. Undo/Redo System (4-5h)
- History stack
- Ctrl+Z / Ctrl+Shift+Z
- "Revert to saved"

### 10. MIDI Learn (5-6h)
- Bouton "Learn" sur chaque knob
- Bind CC → parameter

### 11. Performance Mode (10-15h)
- Macro controls (4-8 knobs)
- XY pad
- Automation recorder

### 12. Waveform Export (4-6h)
- Record to WAV/MP3
- Export single note
- Export performance

### 13. Additional Algorithms (2h chacun)
- Algorithm 6: `(4+3→2)+(1)→OUT`
- Algorithm 7: `4→3, 2→1, 3+1→OUT`
- Algorithm 8: `4→3→2, 1→OUT`

### 14. Mobile/Touch Support (15-20h)
- Touch events
- Responsive layout
- Virtual keyboard

### 15. Themes/Skins (6-8h)
- Theme selector
- DX7 style, Modern, Light mode

---

## 🐛 BUGS CONNUS

### Bug 1: LFO Rate pas mis à jour live
**Sévérité:** Moyenne
**Fix:** Voir tâche #1

### Bug 2: Glitch quand on change de preset pendant note
**Sévérité:** Basse
**Fix:** Release all voices avant changement preset

---

## ⚠️ LIMITATIONS

- Max 8 voix (hardcodé) → Rendre configurable
- Pas de MIDI Out → À implémenter
- Desktop only (pas de touch) → Mobile support

---

## 📊 MÉTRIQUES DU PROJET

### Code
- **~8,000+ lignes** de code
- **30+ fichiers** TypeScript
- **15+ composants** React
- **5 classes** audio principales

### Features
- **5 algorithms** FM
- **4 operators** par voice
- **8 LFOs** (4 paires)
- **17 destinations** de modulation
- **4 effets** master
- **3 presets** factory
- **4 variants** de knobs

### Complétion
- Phase 1 (Core Synthesis): ✅ 100%
- Phase 2 (Advanced Features): 🔶 60%
- Phase 3 (Polish/UX): 🔶 40%
- Phase 4 (Extras): ⬜ 0%

---

## 🎯 RECOMMANDATIONS POUR NOUVEL AGENT

### Commencer par (ordre suggéré):
1. **Fix LFO Rate** (2-3h) - Bug critique
2. **Feedback UI** (30min) - Quick win
3. **Preset Browser** (4-6h) - UX essentielle
4. **Algorithm Visualizer** (6-8h) - Grosse amélioration UX
5. **LFO Tempo Sync** (3-4h) - Feature manquante importante

**Total Phase 2 complète:** ~20-25 heures

---

## 📁 FICHIERS CRITIQUES

### À connaître absolument:
1. **`src/audio/AudioEngine.ts`** (800+ lignes) - Cœur du synth
2. **`src/audio/FMEngine.ts`** (246 lignes) - Routing FM
3. **`src/audio/FMOperator.ts`** (307 lignes) - Opérateur individuel
4. **`src/components/AudioTestV2.tsx`** (800+ lignes) - UI principale
5. **`src/store/presetStore.ts`** (400+ lignes) - State management

### Navigation rapide:
- **Changer routing algorithm** → `FMEngine.ts`
- **Ajuster formule FM** → `FMOperator.ts:125`
- **Ajouter preset** → `presets/defaultPreset.ts`
- **Modifier UI operator** → `OperatorControls.tsx`
- **Ajouter effet** → `MasterEffects.tsx` + `AudioEngine.ts`

---

## 🔧 COMMANDES UTILES

```bash
# Dev server
npm run dev

# Build production
npm run build

# Type check
npx tsc --noEmit

# Check bundle size
npm run build && ls -lh dist/assets/
```

---

## ⚡ QUICK WINS (< 1h chacun)

1. ✅ Feedback UI (30min)
2. Ajouter nouveau preset factory (30min)
3. Ajuster couleurs theme (15min)
4. Ajouter tooltips sur knobs (45min)
5. Keyboard shortcuts (Espace = panic/release all) (30min)

---

## 🎹 POINTS IMPORTANTS

### Ce qui marche super bien:
- ✅ FM Engine (son professionnel)
- ✅ Knob System (sensitivity adaptative)
- ✅ LFO Architecture (flexible)
- ✅ Type Safety (pas de bugs runtime)
- ✅ Preset System (updates live fixés)

### Ce qui a besoin d'amour:
- ❌ LFO Rate Updates (bug #1)
- ❌ Preset Browser (manquant)
- ❌ Algorithm Visualizer (clarté)
- ❌ Mobile Support (desktop only)
- ❌ Documentation inline (sparse)

---

## 📖 DOCS DISPONIBLES

- **`README.md`** - Vue d'ensemble
- **`KNOB_VARIANTS.md`** - Guide knobs (comprehensive)
- **`KNOB_INTEGRATION_SUMMARY.md`** - Rapport intégration
- **`PROJECT_HANDOFF.md`** - Document complet (15 sections)
- **`TODO_PRIORITE.md`** - Ce fichier

---

**Status:** ✅ **PRÊT POUR HANDOFF**

**Première tâche recommandée:** Fix LFO Rate (section #1)

**Bonne chance!** 🎛️🎵
