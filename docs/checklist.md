# Checklist - OscilloSynth

## Légende
- 🎨 = UX-Designer requis
- 💻 = Codeur requis
- 🔊 = Audio-Designer requis
- 🔄 = **Collaboration OBLIGATOIRE** entre agents
- ✅ = Testeur requis

---

## Phase 0 : Setup Projet ✅ COMPLÉTÉ

### Infrastructure
- [x] 💻 Initialiser repo Git dans `/Users/TobieRaggi/Desktop/oscillosynth`
- [x] 💻 Configurer Vite + React + TypeScript
- [x] 💻 Installer dépendances core (Tone.js, Zustand)
- [x] 💻 Setup ESLint + Prettier
- [x] 💻 Créer Dockerfile + docker-compose.yml
- [x] 💻 Setup CI/CD basique (GitHub Actions)
- [x] 💻 Créer structure de dossiers selon specs-techniques.md

### Design System Initial
- [x] 🎨 Définir palette oscilloscope (vert phosphore + blanc)
- [x] 🎨 Sélectionner typographie monospace (JetBrains Mono)
- [x] 🎨 Créer tokens CSS (couleurs, spacing, tailles)
- [ ] 🔄 **Valider le design system avec le codeur avant UI**

---

## Phase 1 : Moteur Audio (Core)

### Engine FM Basique
- [ ] 🔊 Architecture 4 opérateurs Tone.js
- [ ] 🔊 Implémenter 8 algorithmes DX7-style
- [ ] 🔊 ADSR par opérateur
- [ ] 🔊 Paramètres : Ratio, Level, Feedback
- [ ] ✅ Tests unitaires algorithmes FM
- [ ] 🔄 **Review son avec UX-Designer (qualité audio baseline)**

### LFO Engine
- [ ] 🔊 Créer classe LFOEngine (4 instances)
- [ ] 🔊 Formes preset : Sine, Square, Saw, Triangle, Random
- [ ] 🔊 Paramètres : Rate, Depth, Phase, Sync
- [ ] 🔊 Système de combinaison : ADD, MULTIPLY, RING_MOD, CHAIN
- [ ] ✅ Tests unitaires combinaisons LFO
- [ ] 🔊 Formes custom (array 128 points + interpolation)

### Matrice de Modulation
- [ ] 💻 Système de routage LFO → Paramètres
- [ ] 💻 20 cibles minimum (ops, filter, global, enveloppes)
- [ ] 💻 Intensité -100% à +100% par connexion
- [ ] ✅ Tests modulation en temps réel

### Audio Pipeline
- [ ] 🔊 Intégrer low-pass filter 24dB
- [ ] 🔊 Limiteur anti-clipping (-0.3dB ceiling)
- [ ] 🔊 Analyser node pour données viz
- [ ] 🔊 Buffer adaptatif (128/256/512)
- [ ] ✅ Tests : zéro clipping même à saturation

---

## Phase 2 : Visualisation

### Canvas Infrastructure
- [ ] 💻 Setup Canvas 2D dans composant React
- [ ] 💻 Créer Web Worker pour rendering
- [ ] 💻 Pipeline : Audio Analyser → Worker → ImageData → Canvas
- [ ] 🎨 Appliquer style oscilloscope (grid, tracés phosphore)
- [ ] 🔄 **Valider rendu visuel ensemble**

### LFO Visualizer
- [ ] 🎨 Design zone centrale 800×600px
- [ ] 💻 Affichage 4 LFOs combinés en temps réel
- [ ] 💻 Indicateurs de phase (points colorés par LFO)
- [ ] 🎨 Placement paramètres modulés au centre
- [ ] ✅ Test performance : 60 FPS avec 4 LFOs actifs
- [ ] 🔄 **Review intégration design/perf**

### Oscilloscope Audio
- [ ] 💻 Canvas séparé 400×300px
- [ ] 💻 Affichage waveform audio final (20ms window)
- [ ] 💻 Auto-trigger zero-crossing
- [ ] 🎨 Style tracé : 2px anti-aliased, vert phosphore
- [ ] 🔄 **Validation affichage avec audio-designer**

---

## Phase 3 : Interface Utilisateur

### LFO Editor
- [ ] 🎨 Wireframe composant LFOEditor
- [ ] 🔄 **Review design avant implémentation**
- [ ] 💻 Dropdown sélection forme preset
- [ ] 💻 Canvas dessin forme custom (touch + mouse)
- [ ] 💻 Gestures tactiles : draw, pinch zoom, pan
- [ ] 💻 Sliders : Rate, Depth, Phase
- [ ] 💻 Toggle : Sync/Free
- [ ] 💻 Preview waveform temps réel
- [ ] ✅ Tests E2E : dessiner LFO custom → voir modulation
- [ ] 🔄 **Review UX tactile sur tablette**

### FM Controls
- [ ] 🎨 Design interface 4 opérateurs
- [ ] 💻 Sélecteur 8 algorithmes (visual + dropdown)
- [ ] 💻 Contrôles par opérateur : Ratio, Level, ADSR
- [ ] 💻 Feedback control (op 4)
- [ ] 💻 Filter global : Cutoff, Resonance
- [ ] 🔄 **Validation layout avec audio-designer**

### Matrice de Modulation UI
- [ ] 🎨 Design grid 4×20 (LFOs × Params)
- [ ] 💻 Cellules slider -100% à +100%
- [ ] 💻 Couleur intensité : vert/rouge
- [ ] 💻 Tooltips nom complet paramètre
- [ ] ✅ Tests accessibilité clavier

### Clavier Virtuel
- [ ] 🎨 Design 2 octaves visibles + scroll
- [ ] 💻 Mapping clavier QWERTY chromatic
- [ ] 💻 Velocity via position click verticale
- [ ] 💻 Sustain pedal (touche Espace)
- [ ] ✅ Tests MIDI hardware + virtual keyboard simultanés

### Preset Manager
- [ ] 🎨 Design interface presets
- [ ] 💻 Liste presets (factory + user)
- [ ] 💻 Save/Load localStorage
- [ ] 💻 Export/Import JSON
- [ ] 💻 Search/filter presets
- [ ] ✅ Tests : save → reload → identique

---

## Phase 4 : Fonctionnalités Système

### MIDI
- [ ] 💻 MIDI In : Note On/Off
- [ ] 💻 MIDI In : Velocity
- [ ] 💻 MIDI Learn système
- [ ] 💻 Détection devices disponibles
- [ ] 💻 MIDI Out : LFO → CC (v2 feature mais préparer l'archi)
- [ ] ✅ Tests avec contrôleur hardware

### Export Audio
- [ ] 💻 Recording AudioContext → Buffer
- [ ] 💻 Export WAV (Web Audio API)
- [ ] 💻 Export MP3 optionnel (lamejs)
- [ ] 💻 Progress bar pour long renders
- [ ] 💻 Web Worker pour rendering (non-blocking)
- [ ] ✅ Tests : export → réimport → qualité préservée

### Factory Presets
- [ ] 🔊 Créer 10 presets de haute qualité
- [ ] 🔊 Couvrir styles variés : bass, lead, pad, fx, percussive
- [ ] 🔊 Documenter chaque preset (description, use case)
- [ ] 🔄 **Review qualité sonore avec UX-designer**

---

## Phase 5 : Polish & Optimisation

### Performance
- [ ] 💻 Profiling complet (Chrome DevTools)
- [ ] 💻 Optimiser re-renders React (memo, useMemo)
- [ ] 💻 Optimiser Canvas rendering (throttle si CPU < 30%)
- [ ] 💻 Adaptive buffer size basé sur latency monitoring
- [ ] ✅ Tests charge : 4 LFOs + 8 voix polyphonie
- [ ] ✅ Target : <5% CPU idle, <50ms latency totale

### UX Enhancements
- [ ] 🎨 Animations micro-interactions (hover, click feedback)
- [ ] 🎨 Transitions fluides entre vues
- [ ] 🎨 Loading states (si applicable)
- [ ] 🎨 Tooltips contextuels
- [ ] 💻 Keyboard shortcuts (espace = play/pause, etc.)
- [ ] 🔄 **Review UX finale ensemble**

### Tutoriel Interactif
- [ ] 🎨 Design onboarding flow
- [ ] 💻 Guide pas-à-pas : "Créer ton premier son"
- [ ] 💻 Highlights interactifs sur UI
- [ ] 💻 Skip/replay tutoriel

### Accessibilité
- [ ] 💻 ARIA labels sur tous contrôles
- [ ] 💻 Navigation clavier complète
- [ ] 💻 Focus visible
- [ ] 💻 Contrast ratio WCAG AA
- [ ] ✅ Tests accessibilité automatisés (axe-core)
- [ ] ✅ Tests navigation clavier seul

### Documentation
- [ ] 💻 README.md complet (install, usage, architecture)
- [ ] 💻 Inline comments pour code complexe
- [ ] 💻 JSDoc pour fonctions publiques
- [ ] 🎨 Guide utilisateur (si nécessaire)

---

## Phase 6 : Testing Complet

### Tests Unitaires
- [ ] ✅ Couverture >80% (Vitest)
- [ ] ✅ Tous les algorithmes FM
- [ ] ✅ Toutes les combinaisons LFO
- [ ] ✅ Matrice de modulation
- [ ] ✅ Preset save/load/export

### Tests E2E
- [ ] ✅ Scénario 1 : Jouer note → entendre son
- [ ] ✅ Scénario 2 : Dessiner LFO custom → voir modulation
- [ ] ✅ Scénario 3 : Save preset → reload → identique
- [ ] ✅ Scénario 4 : Export audio → fichier WAV valide
- [ ] ✅ Scénario 5 : MIDI learn → controller fonctionne
- [ ] ✅ Tests cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] ✅ Tests tablette (iPad tactile)

### Tests Audio Qualité
- [ ] 🔊 Vérifier zéro clipping à max volume
- [ ] 🔊 Vérifier pas de buffer underruns
- [ ] 🔊 Vérifier latence <10ms (monitoring MIDI in → audio out)
- [ ] 🔊 Vérifier pas d'aliasing FM à haute fréquence

---

## Phase 7 : Déploiement

### Docker Production
- [ ] 💻 Optimiser Dockerfile (multi-stage build)
- [ ] 💻 Build production optimisé (minification, tree-shaking)
- [ ] 💻 Configuration environnements (dev/prod)
- [ ] ✅ Tests image Docker complète

### Pre-Release
- [ ] 🔄 **Review finale : Code + Design + Audio + QA**
- [ ] ✅ Smoke tests sur build production
- [ ] 💻 Versionning (semantic versioning)
- [ ] 💻 CHANGELOG.md
- [ ] 🔄 **Go/No-go décision collective**

### Release
- [ ] 💻 Tag Git v1.0.0
- [ ] 💻 Deploy (hosting statique ou Docker registry)
- [ ] 💻 Monitoring post-release (erreurs, performance)

---

## Points de Synchronisation Obligatoires

| Étape | Participants | Objectif | Timing |
|-------|--------------|----------|--------|
| Après design system | Code + Design | Valider tokens CSS, palette, typo | Fin Phase 0 |
| Après engine audio baseline | Audio + Design | Écouter qualité sonore, ajuster si besoin | Fin Phase 1 |
| Après canvas infrastructure | Code + Design | Valider style oscilloscope | Mi-Phase 2 |
| Avant chaque composant UI | Code + Design | Review wireframes, valider approche | Phase 3 (chaque composant) |
| Après intégration LFO editor | Code + Design + Audio | Test UX tactile + qualité modulation | Fin Phase 3 |
| Après factory presets | Audio + Design | Review qualité/diversité sons | Phase 4 |
| Pré-optimisation | Code + QA | Baseline performance metrics | Début Phase 5 |
| Post-optimisation | Code + QA | Vérifier targets atteintes | Fin Phase 5 |
| Pré-release | Tous | Go/No-go final | Fin Phase 6 |

---

## Métriques de Succès

### Performance
- [ ] Latency totale <50ms (MIDI in → audio out)
- [ ] CPU idle >95% (sans son actif)
- [ ] 60 FPS visualisation (4 LFOs actifs)
- [ ] Zéro clipping audio à volume max

### Qualité
- [ ] Couverture tests >80%
- [ ] Zéro bug critique en production
- [ ] Accessibilité WCAG AA
- [ ] Support 4 navigateurs majeurs

### UX
- [ ] Temps onboarding <5min (premier son créé)
- [ ] Gestes tactiles fluides sur tablette
- [ ] Navigation clavier complète

---

## Notes d'Implémentation

### Ordre Recommandé
1. **Phase 1** en priorité (moteur audio = fondation)
2. **Phase 2** (viz basique pour debug audio)
3. **Phase 3** (UI, itérations rapides design/code)
4. **Phase 4-5** en parallèle (features + polish)
5. **Phase 6-7** séquentielles (tests → deploy)

### Dépendances Critiques
- LFO Engine doit être terminé avant Matrice de Modulation
- Canvas Infrastructure avant tout travail de viz
- FM Engine avant Factory Presets
- Tous les composants UI avant Tutoriel Interactif

### Itérations
- Après chaque composant UI : mini-review Design + Code
- Après chaque feature audio : tests qualité Audio-Designer
- Testing continu par Testeur pendant toutes les phases

---

**Cette checklist sera mise à jour en continu par le chef-projet. Marquer les tâches complétées avec un `[x]`.**
