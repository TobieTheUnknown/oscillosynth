# Notes pour la prochaine session

## 🎯 Améliorations à implémenter

### 1. Modulation visuelle de l'enveloppe sur les potards
**Demande**: À la manière des LFO, quand je branche l'enveloppe sur un paramètre (filtre, noise ou LFO rate), j'aimerais voir le potard et sa valeur bouger en temps réel.

**Détails**:
- La modulation par enveloppe doit être prise en compte visuellement
- Les potards doivent afficher la valeur modulée en Live View
- La valeur doit être prise en compte par l'engine (déjà le cas, mais à vérifier)
- Destinations concernées: filter cutoff/resonance, noise level/filter, LFO rates

**Fichiers à modifier**:
- `src/audio/AudioEngine.ts` - Ajouter les valeurs modulées par enveloppe dans `getModulatedValues()`
- `src/components/AudioTestV2.tsx` - Utiliser les valeurs modulées pour l'affichage
- `src/components/*.tsx` - Composants de knobs concernés

### 2. Point de suivi sur la visualisation d'enveloppe
**Demande**: Ajouter un point qui suit la position actuelle sur la courbe d'enveloppe quand on appuie sur une note.

**Détails**:
- Visualiser en temps réel où on se trouve dans l'enveloppe (Attack, Decay, Sustain, Release)
- Le point doit suivre la courbe pendant que la note est jouée
- Utile pour comprendre visuellement le comportement de l'enveloppe

**Fichiers à créer/modifier**:
- `src/components/ADSREnvelope.tsx` - Ajouter un point de suivi animé
- `src/audio/AudioEngine.ts` - Exposer la valeur actuelle de l'enveloppe pour visualisation

### 3. Stereo Spreader dans les effets
**Demande**: Ajouter un stereo spreader aux effets maîtres.

**Ordre du signal** (à déterminer le plus logique):
- Option 1: `Spreader → Delay → Reverb` (spreader d'abord, puis effets temporels)
- Option 2: `Reverb → Delay → Spreader` (effets temporels puis spreader)
- Option 3: `Delay → Reverb → Spreader` (delays courts, reverb, puis élargissement)

**Recommandation**: `Delay → Reverb → Spreader`
- Delay crée les échos
- Reverb ajoute l'espace
- Spreader élargit l'image stéréo finale
- C'est l'ordre le plus naturel et utilisé en production

**Fichiers à modifier**:
- `src/audio/AudioPipeline.ts` - Ajouter le Tone.StereoWidener
- `src/audio/types.ts` - Ajouter le paramètre stereoSpread dans MasterEffectsParams
- `src/components/MasterEffects.tsx` - Ajouter le contrôle UI
- `src/audio/presets/defaultPreset.ts` - Ajouter valeur par défaut

### 4. Augmenter le max des cutoff filters à 22 kHz
**Demande**: Set le max des potards de cutoff à 22kHz pour permettre un fine tuning là où il est vraiment utile.

**Détails**:
- Actuellement: max = 20000 Hz
- Nouveau: max = 22000 Hz (22 kHz)
- Concerne les cutoff de:
  - Filter principal (main filter)
  - Noise filter

**Fichiers à modifier**:
- `src/components/CompactFilterSection.tsx` - Changer max du knob cutoff
- `src/components/NoiseGenerator.tsx` - Changer max du knob cutoff
- `src/audio/types.ts` - Mettre à jour les commentaires si nécessaire
- `src/audio/AudioEngine.ts` - Vérifier les clamping (20000 → 22000)
- `src/audio/LFOModulator.ts` - Vérifier les clamping (20000 → 22000)

## 🔧 État actuel du projet

### Dernières modifications (session actuelle)
- ✅ Système de modulation LFO globale implémenté
- ✅ LFO-to-LFO modulation fonctionnelle
- ✅ Séparation destinations per-voice / globales
- ✅ Tous les paramètres globaux (noise, filter, effects) modulés en temps réel

### Architecture de modulation
```
Global LFO Loop (10ms)          Per-Voice LFO Loop (10ms)
├─ Noise                        ├─ Pitch (vibrato)
├─ Filter                       ├─ Amplitude (tremolo)
├─ Effects                      └─ Operators
├─ Synth Engine Params
└─ LFO-to-LFO ✨
```

## 📝 Ordre de priorité suggéré

1. **Cutoff max à 22kHz** - Changement simple et rapide
2. **Stereo Spreader** - Ajout d'effet, impact modéré
3. **Modulation visuelle enveloppe** - Plus complexe, nécessite coordination UI/Audio
4. **Point de suivi enveloppe** - Feature visuelle, peut être fait en parallèle avec #3

---

**Date**: 2026-01-22
**Session précédente**: Implémentation modulation LFO globale + LFO-to-LFO
**Commit**: `57f2077` - feat: implement global LFO modulation and LFO-to-LFO modulation
