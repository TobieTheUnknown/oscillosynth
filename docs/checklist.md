# Checklist - OscilloSynth

## ⚠️ Version Corrigée (Review Opus 4.5)

Cette checklist a été **revue et corrigée** par Claude Opus 4.5. Score initial : 6.5/10
**Améliorations appliquées** :
- ✅ Ajout Phase 0.5 : Prototypage & Validation (POCs critiques AVANT implémentation)
- ✅ Restructuration Phase 1 : AudioContext unlock, voice allocation, error boundaries
- ✅ Ajout tâches manquantes : responsive design, fallbacks navigateurs, cleanup Canvas
- ✅ Harmonisation métriques de succès (référence : specs-techniques.md)
- ✅ Granularité améliorée : tâches FM et LFO détaillées
- ✅ Agent FRONTEND-DESIGN fusionné avec UX-DESIGNER
- ✅ Profiling déplacé en Phase 1 (early, pas Phase 5)
- ✅ Factory Presets v2 après polish UX (Phase 5)
- ✅ Tests de régression audio ajoutés (Phase 6)

**Score estimé post-corrections : 8.5/10** - Prêt pour orchestration

---

## Format Team-Dev
Cette checklist est compatible avec l'orchestrateur team-dev.
Utilisez `python ~/.claude/skills/team-dev/orchestrator-claude-code.py` pour générer les tâches.

## Agents Disponibles
- **[CODEUR]** - Développeur React/TypeScript/Vite
- **[AUDIO-DESIGNER]** - Concepteur audio / Web Audio API / Tone.js
- **[UX-DESIGNER]** - Designer UX/UI et animations
- **[TESTEUR]** - Tests unitaires et E2E
- **[VISUAL-ARTIST]** - Graphisme et assets visuels

---

## Phase 0 : Setup Projet ✅ COMPLÉTÉ

### Infrastructure
- [x] **[CODEUR]** Initialiser repo Git dans `/Users/TobieRaggi/Desktop/oscillosynth`
- [x] **[CODEUR]** Configurer Vite + React + TypeScript selon specs-techniques.md
- [x] **[CODEUR]** Installer dépendances core (Tone.js, Zustand)
- [x] **[CODEUR]** Setup ESLint + Prettier avec règles strictes
- [x] **[CODEUR]** Créer Dockerfile + docker-compose.yml
- [x] **[CODEUR]** Setup CI/CD basique (GitHub Actions)
- [x] **[CODEUR]** Créer structure de dossiers selon specs-techniques.md

### Design System Initial
- [x] **[UX-DESIGNER]** Définir palette oscilloscope (vert phosphore + blanc) avec tokens CSS
- [x] **[UX-DESIGNER]** Sélectionner typographie monospace (JetBrains Mono) et créer scale
- [x] **[UX-DESIGNER]** Créer tokens CSS complets (couleurs, spacing, tailles, animations)
- [x] **[CODEUR]** Intégrer design tokens dans le projet (CSS variables)
- [x] **[VISUAL-ARTIST]** Créer icônes SVG phosphore green (9 icônes minimum)

---

## Phase 0.5 : Prototypage & Validation Technique ✅ COMPLÉTÉ

### POCs Critiques (Avant Phase 1)
- [x] **[AUDIO-DESIGNER]** POC : FM 4 opérateurs custom avec Tone.js - valider approche technique
- [x] **[CODEUR]** POC : Canvas rendering + Web Worker - mesurer performance réelle vs main thread
- [x] **[CODEUR]** POC : Touch drawing 128 points - valider UX tactile sur tablette
- [x] **[TESTEUR]** Créer matrice compatibilité navigateurs (Chrome, Firefox, Safari, Edge)
- [x] **[TESTEUR]** Tester support OffscreenCanvas (Safari fallback nécessaire)
- [x] **[AUDIO-DESIGNER]** Tester latence AudioContext sur différents buffers (128/256/512)
- [x] **[CODEUR]** Valider anti-aliasing FM (oversampling) - prévenir aliasing haute fréquence

### Documentation Technique
- [x] **[CODEUR]** Créer docs/browser-compatibility.md avec résultats POCs
- [x] **[CODEUR]** Documenter fallbacks techniques identifiés (Safari, anciens navigateurs)

---

## Phase 1 : Moteur Audio (Core)

### Infrastructure Audio Critique
- [ ] **[CODEUR]** Implémenter AudioContext resume/unlock sur interaction utilisateur (CRITIQUE)
- [ ] **[CODEUR]** Créer ErrorBoundary pour composants audio avec fallback UI
- [ ] **[CODEUR]** Implémenter détection Web Audio API avec message fallback gracieux
- [ ] **[AUDIO-DESIGNER]** Implémenter voice allocation system (8 voix simultanées)
- [ ] **[AUDIO-DESIGNER]** Implémenter voice stealing (LRU algorithm) quand >8 voix
- [ ] **[TESTEUR]** Tester voice allocation : jouer 10 notes, vérifier 8 max actives

### Engine FM Basique
- [ ] **[AUDIO-DESIGNER]** Créer structure classe FM 4 opérateurs
- [ ] **[AUDIO-DESIGNER]** Implémenter routing opérateurs (architecture interne)
- [ ] **[AUDIO-DESIGNER]** Implémenter algorithmes série (Algo 1, 2, 3)
- [ ] **[AUDIO-DESIGNER]** Implémenter algorithmes parallèles (Algo 6)
- [ ] **[AUDIO-DESIGNER]** Implémenter algorithmes mixtes (Algo 4, 5, 7, 8)
- [ ] **[AUDIO-DESIGNER]** Implémenter ADSR par opérateur avec courbes exponentielles
- [ ] **[AUDIO-DESIGNER]** Implémenter paramètres : Ratio (0.5-16.0), Level (0-100), Feedback
- [ ] **[AUDIO-DESIGNER]** Implémenter anti-aliasing FM (oversampling 2x si nécessaire)
- [ ] **[TESTEUR]** Tests unitaires : 1 test par algorithme FM
- [ ] **[TESTEUR]** Tests limites : ratios extrêmes, feedback max
- [ ] **[AUDIO-DESIGNER]** Tester qualité audio baseline (écoute critique tous algos)

### LFO Engine
- [ ] **[AUDIO-DESIGNER]** Créer classe LFOEngine (custom, pas Tone.js natif)
- [ ] **[AUDIO-DESIGNER]** Implémenter 4 instances LFO indépendantes
- [ ] **[AUDIO-DESIGNER]** Implémenter formes preset : Sine, Square, Saw, Triangle, Random
- [ ] **[AUDIO-DESIGNER]** Implémenter paramètres : Rate (0.01-40Hz), Depth (0-100%), Phase (0-360°)
- [ ] **[AUDIO-DESIGNER]** Implémenter sync tempo (1/16 à 8 bars) vs free-running
- [ ] **[AUDIO-DESIGNER]** Implémenter combinaison ADD (lfo1+lfo2+lfo3+lfo4)
- [ ] **[AUDIO-DESIGNER]** Implémenter combinaison MULTIPLY (lfo1*lfo2*lfo3*lfo4)
- [ ] **[AUDIO-DESIGNER]** Implémenter combinaison RING_MOD ((lfo1*lfo2)+(lfo3*lfo4))
- [ ] **[AUDIO-DESIGNER]** Implémenter combinaison CHAIN (cascade lfo1→lfo2→lfo3→lfo4)
- [ ] **[AUDIO-DESIGNER]** Implémenter formes custom : structure array 128 points
- [ ] **[AUDIO-DESIGNER]** Implémenter normalisation -1.0 à +1.0 pour formes custom
- [ ] **[AUDIO-DESIGNER]** Implémenter interpolation linéaire entre points custom
- [ ] **[TESTEUR]** Tests unitaires : chaque combinaison LFO
- [ ] **[TESTEUR]** Tests : phases opposées s'annulent (ADD mode)

### Matrice de Modulation
- [ ] **[AUDIO-DESIGNER]** Designer logique de routage LFO → Paramètres audio
- [ ] **[CODEUR]** Implémenter système de routage LFO → Paramètres (architecture)
- [ ] **[AUDIO-DESIGNER]** Définir 20 cibles modulation : ops (Ratio, Level, Feedback), filter, global, ADSR
- [ ] **[CODEUR]** Implémenter intensité modulation -100% à +100% par connexion
- [ ] **[CODEUR]** Implémenter mode bipolar/unipolar par cible
- [ ] **[TESTEUR]** Tests modulation en temps réel (4 LFOs → 1 paramètre)
- [ ] **[TESTEUR]** Tests : intensité 0% = pas de modulation

### Audio Pipeline
- [ ] **[AUDIO-DESIGNER]** Intégrer low-pass filter 24dB avec Tone.js
- [ ] **[AUDIO-DESIGNER]** Implémenter limiteur anti-clipping (-0.3dB ceiling)
- [ ] **[AUDIO-DESIGNER]** Configurer analyser node pour données visualisation
- [ ] **[AUDIO-DESIGNER]** Implémenter buffer adaptatif (128/256/512)
- [ ] **[TESTEUR]** Tests : vérifier zéro clipping même à saturation

### Intégration App
- [ ] **[CODEUR]** Créer types TypeScript complets (audio/types.ts)
- [ ] **[CODEUR]** Créer stores Zustand (audioStore, uiStore, presetStore)
- [ ] **[CODEUR]** Créer hook useAudioEngine avec lifecycle complet
- [ ] **[CODEUR]** Implémenter synchronisation state Zustand ↔ Tone.js (timing critique)
- [ ] **[TESTEUR]** Test end-to-end : jouer note → entendre son
- [ ] **[TESTEUR]** Test polyphonie : 10 notes rapides → max 8 simultanées

### Profiling Early (Ne pas attendre Phase 5)
- [ ] **[CODEUR]** Profiler performance audio : CPU usage avec 4 LFOs actifs
- [ ] **[TESTEUR]** Mesurer latence totale MIDI in → audio out (cible <50ms)
- [ ] **[AUDIO-DESIGNER]** Tester différents buffer sizes : mesurer underruns vs latence
- [ ] **[CODEUR]** Documenter baseline performance dans docs/

---

## Phase 2 : Visualisation

### Canvas Infrastructure
- [ ] **[CODEUR]** Setup Canvas 2D dans composant React
- [ ] **[CODEUR]** Détecter support OffscreenCanvas (feature detection)
- [ ] **[CODEUR]** Créer Web Worker pour rendering canvas (si OffscreenCanvas disponible)
- [ ] **[CODEUR]** Implémenter fallback : Canvas main thread + throttle 30fps (Safari)
- [ ] **[CODEUR]** Implémenter pipeline : Audio Analyser → Worker/Main → ImageData → Canvas
- [ ] **[CODEUR]** Implémenter cleanup cycle Canvas (dispose ImageData, terminate workers)
- [ ] **[CODEUR]** Implémenter double-buffering si nécessaire (prévenir flicker)
- [ ] **[UX-DESIGNER]** Designer style oscilloscope (grid, tracés phosphore, glow effect)
- [ ] **[CODEUR]** Appliquer style oscilloscope au canvas (shader-like effects en 2D)
- [ ] **[TESTEUR]** Valider rendu visuel cross-browser
- [ ] **[TESTEUR]** Tester performance : 60 FPS sur Chrome/Firefox, 30 FPS acceptable Safari

### LFO Visualizer
- [ ] **[UX-DESIGNER]** Designer zone centrale 800×600px avec layout paramètres
- [ ] **[CODEUR]** Implémenter affichage 4 LFOs combinés en temps réel
- [ ] **[CODEUR]** Implémenter indicateurs de phase (points colorés par LFO)
- [ ] **[UX-DESIGNER]** Designer placement paramètres modulés au centre
- [ ] **[CODEUR]** Intégrer placement paramètres dans visualisation
- [ ] **[TESTEUR]** Test performance : 60 FPS avec 4 LFOs actifs

### Oscilloscope Audio
- [ ] **[CODEUR]** Créer canvas séparé 400×300px pour waveform
- [ ] **[CODEUR]** Implémenter affichage waveform audio final (20ms window)
- [ ] **[CODEUR]** Implémenter auto-trigger zero-crossing
- [ ] **[UX-DESIGNER]** Appliquer style tracé : 2px anti-aliased, vert phosphore
- [ ] **[AUDIO-DESIGNER]** Valider affichage waveform avec qualité audio

---

## Phase 3 : Interface Utilisateur

### Responsive Design (Foundation)
- [ ] **[UX-DESIGNER]** Designer breakpoints : desktop 1440px, laptop 1024px, tablet 768px
- [ ] **[UX-DESIGNER]** Créer wireframes responsive pour chaque breakpoint
- [ ] **[CODEUR]** Implémenter layout grid responsive (CSS Grid + media queries)
- [ ] **[CODEUR]** Adapter composants pour tablet portrait/landscape
- [ ] **[TESTEUR]** Tester sur iPad Pro (1024×1366), iPad (768×1024)

### LFO Editor
- [ ] **[UX-DESIGNER]** Créer wireframe complet composant LFOEditor (desktop + tablet)
- [ ] **[CODEUR]** Implémenter dropdown sélection forme preset (accessible touch)
- [ ] **[CODEUR]** Implémenter canvas dessin forme custom (touch + mouse)
- [ ] **[CODEUR]** Implémenter gestures tactiles : draw, pinch zoom, pan
- [ ] **[CODEUR]** Implémenter sliders : Rate, Depth, Phase (touch-friendly 44px min)
- [ ] **[CODEUR]** Implémenter toggle : Sync/Free
- [ ] **[CODEUR]** Implémenter preview waveform temps réel
- [ ] **[TESTEUR]** Tests E2E : dessiner LFO custom → voir modulation
- [ ] **[UX-DESIGNER]** Review UX tactile sur tablette iPad

### FM Controls
- [ ] **[UX-DESIGNER]** Designer interface 4 opérateurs
- [ ] **[CODEUR]** Implémenter sélecteur 8 algorithmes (visual + dropdown)
- [ ] **[CODEUR]** Implémenter contrôles par opérateur : Ratio, Level, ADSR
- [ ] **[CODEUR]** Implémenter feedback control (op 4)
- [ ] **[CODEUR]** Implémenter filter global : Cutoff, Resonance
- [ ] **[AUDIO-DESIGNER]** Valider layout et mapping paramètres

### Matrice de Modulation UI
- [ ] **[UX-DESIGNER]** Designer grid 4×20 (LFOs × Params)
- [ ] **[CODEUR]** Implémenter cellules slider -100% à +100%
- [ ] **[CODEUR]** Implémenter couleur intensité : vert/rouge
- [ ] **[CODEUR]** Implémenter tooltips nom complet paramètre
- [ ] **[TESTEUR]** Tests accessibilité clavier

### Clavier Virtuel
- [ ] **[UX-DESIGNER]** Designer clavier 2 octaves visibles + scroll
- [ ] **[CODEUR]** Implémenter mapping clavier QWERTY chromatic
- [ ] **[CODEUR]** Implémenter velocity via position click verticale
- [ ] **[CODEUR]** Implémenter sustain pedal (touche Espace)
- [ ] **[TESTEUR]** Tests MIDI hardware + virtual keyboard simultanés

### Preset Manager
- [ ] **[UX-DESIGNER]** Designer interface presets (liste, save/load, export)
- [ ] **[CODEUR]** Implémenter liste presets (factory + user)
- [ ] **[CODEUR]** Implémenter Save/Load localStorage
- [ ] **[CODEUR]** Implémenter Export/Import JSON
- [ ] **[CODEUR]** Implémenter Search/filter presets
- [ ] **[TESTEUR]** Tests : save → reload → identique

---

## Phase 4 : Fonctionnalités Système

### MIDI
- [ ] **[CODEUR]** Implémenter MIDI In : Note On/Off + Velocity (messages combinés)
- [ ] **[CODEUR]** Implémenter détection et sélection MIDI devices disponibles
- [ ] **[CODEUR]** Implémenter MIDI Learn système (assignment paramètre → CC)
- [ ] **[CODEUR]** Implémenter persistance mappings MIDI (localStorage)
- [ ] **[CODEUR]** Préparer architecture MIDI Out : LFO → CC (v2 feature, design seulement)
- [ ] **[TESTEUR]** Tests avec contrôleur hardware MIDI (tous messages)
- [ ] **[TESTEUR]** Tests MIDI Learn : assigner CC → vérifier modulation

### Export Audio
- [ ] **[CODEUR]** Implémenter recording AudioContext → Buffer
- [ ] **[CODEUR]** Implémenter export WAV (Web Audio API)
- [ ] **[CODEUR]** Implémenter export MP3 optionnel (lamejs)
- [ ] **[CODEUR]** Implémenter progress bar pour long renders
- [ ] **[CODEUR]** Implémenter Web Worker pour rendering (non-blocking)
- [ ] **[TESTEUR]** Tests : export → réimport → qualité préservée

### Factory Presets
- [ ] **[AUDIO-DESIGNER]** Créer 10 presets baseline (bass, lead, pad, fx, percussive)
- [ ] **[AUDIO-DESIGNER]** Documenter chaque preset (description, use case, paramètres clés)
- [ ] **[UX-DESIGNER]** Review qualité sonore et diversité presets (avant Phase 5 polish)

---

## Phase 5 : Polish & Optimisation

### Performance (Optimisations suite profiling Phase 1)
- [ ] **[CODEUR]** Optimiser re-renders React (React.memo, useMemo, useCallback)
- [ ] **[CODEUR]** Optimiser Canvas rendering : throttle 30fps si CPU < 30% disponible
- [ ] **[CODEUR]** Implémenter adaptive buffer size : monitor underruns, ajuster 128→256→512
- [ ] **[CODEUR]** Optimiser calculs LFO : lookup tables pour formes preset si nécessaire
- [ ] **[TESTEUR]** Tests charge maximale : 4 LFOs + 8 voix + Canvas 60fps simultanés
- [ ] **[TESTEUR]** Vérifier targets atteintes : CPU idle >95%, latence <50ms, 60fps viz
- [ ] **[CODEUR]** Documenter optimisations appliquées dans docs/performance.md

### Factory Presets v2 (Après Polish UX)
- [ ] **[AUDIO-DESIGNER]** Raffiner 10 presets baseline avec UX finale
- [ ] **[AUDIO-DESIGNER]** Créer 5 presets additionnels exploitant nouvelles features
- [ ] **[AUDIO-DESIGNER]** Review finale qualité sonore avec tous les polish appliqués

### UX Enhancements
- [ ] **[UX-DESIGNER]** Designer animations micro-interactions (hover, click feedback)
- [ ] **[UX-DESIGNER]** Designer transitions fluides entre vues (300ms standard)
- [ ] **[UX-DESIGNER]** Designer loading states pour export audio
- [ ] **[UX-DESIGNER]** Créer tooltips contextuels (tous paramètres complexes)
- [ ] **[CODEUR]** Implémenter animations CSS/JS selon designs
- [ ] **[CODEUR]** Implémenter keyboard shortcuts : Espace (play/pause), Ctrl+S (save preset)
- [ ] **[UX-DESIGNER]** Review UX finale complète (desktop + tablet)

### Tutoriel Interactif
- [ ] **[UX-DESIGNER]** Designer onboarding flow complet
- [ ] **[CODEUR]** Implémenter guide pas-à-pas : "Créer ton premier son"
- [ ] **[CODEUR]** Implémenter highlights interactifs sur UI
- [ ] **[CODEUR]** Implémenter Skip/replay tutoriel

### Accessibilité
- [ ] **[CODEUR]** Ajouter ARIA labels sur tous contrôles
- [ ] **[CODEUR]** Implémenter navigation clavier complète
- [ ] **[CODEUR]** Assurer focus visible sur tous éléments
- [ ] **[UX-DESIGNER]** Vérifier contrast ratio WCAG AA
- [ ] **[TESTEUR]** Tests accessibilité automatisés (axe-core)
- [ ] **[TESTEUR]** Tests navigation clavier seul

### Documentation
- [ ] **[CODEUR]** Créer README.md complet (install, usage, architecture)
- [ ] **[CODEUR]** Ajouter inline comments pour code complexe
- [ ] **[CODEUR]** Ajouter JSDoc pour fonctions publiques
- [ ] **[UX-DESIGNER]** Créer guide utilisateur (si nécessaire)

---

## Phase 6 : Testing Complet

### Tests Unitaires
- [ ] **[TESTEUR]** Atteindre couverture >70% (Vitest) - cible réaliste MVP
- [ ] **[TESTEUR]** Tests : tous les algorithmes FM (8 tests minimum)
- [ ] **[TESTEUR]** Tests : toutes les combinaisons LFO (4 modes)
- [ ] **[TESTEUR]** Tests : matrice de modulation (routage, intensité, bipolar/unipolar)
- [ ] **[TESTEUR]** Tests : preset save/load/export/import
- [ ] **[TESTEUR]** Tests : voice allocation et stealing

### Tests de Régression
- [ ] **[TESTEUR]** Tests régression audio : snapshots waveform pour chaque algorithme FM
- [ ] **[TESTEUR]** Tests régression : preset v1 → v2 migration (si applicable)
- [ ] **[TESTEUR]** Tests régression : aucun breaking change API audio entre versions

### Tests E2E
- [ ] **[TESTEUR]** Scénario 1 : Jouer note → entendre son
- [ ] **[TESTEUR]** Scénario 2 : Dessiner LFO custom → voir modulation
- [ ] **[TESTEUR]** Scénario 3 : Save preset → reload → identique
- [ ] **[TESTEUR]** Scénario 4 : Export audio → fichier WAV valide
- [ ] **[TESTEUR]** Scénario 5 : MIDI learn → controller fonctionne
- [ ] **[TESTEUR]** Tests cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] **[TESTEUR]** Tests tablette (iPad tactile)

### Tests Audio Qualité
- [ ] **[AUDIO-DESIGNER]** Vérifier zéro clipping à max volume
- [ ] **[AUDIO-DESIGNER]** Vérifier pas de buffer underruns
- [ ] **[AUDIO-DESIGNER]** Vérifier latence <10ms (monitoring MIDI in → audio out)
- [ ] **[AUDIO-DESIGNER]** Vérifier pas d'aliasing FM à haute fréquence

---

## Phase 7 : Déploiement

### Docker Production
- [ ] **[CODEUR]** Optimiser Dockerfile (multi-stage build)
- [ ] **[CODEUR]** Build production optimisé (minification, tree-shaking)
- [ ] **[CODEUR]** Configuration environnements (dev/prod)
- [ ] **[TESTEUR]** Tests image Docker complète

### Pre-Release
- [ ] **[TESTEUR]** Smoke tests sur build production
- [ ] **[CODEUR]** Versionning (semantic versioning)
- [ ] **[CODEUR]** Créer CHANGELOG.md
- [ ] **[CODEUR]** Review finale : Code + Design + Audio + QA

### Release
- [ ] **[CODEUR]** Tag Git v1.0.0
- [ ] **[CODEUR]** Deploy (hosting statique ou Docker registry)
- [ ] **[CODEUR]** Monitoring post-release (erreurs, performance)

---

## Points de Synchronisation Obligatoires

| Étape | Participants | Objectif | Timing |
|-------|--------------|----------|--------|
| Après design system | Codeur + UX-Designer | Valider tokens CSS, palette, typo | Fin Phase 0 |
| Après engine audio baseline | Audio-Designer + UX-Designer | Écouter qualité sonore, ajuster si besoin | Fin Phase 1 |
| Après canvas infrastructure | Codeur + UX-Designer | Valider style oscilloscope | Mi-Phase 2 |
| Avant chaque composant UI | Codeur + UX-Designer | Review wireframes, valider approche | Phase 3 (chaque composant) |
| Après intégration LFO editor | Codeur + UX-Designer + Audio-Designer | Test UX tactile + qualité modulation | Fin Phase 3 |
| Après factory presets | Audio-Designer + UX-Designer | Review qualité/diversité sons | Phase 4 |
| Pré-optimisation | Codeur + Testeur | Baseline performance metrics | Début Phase 5 |
| Post-optimisation | Codeur + Testeur | Vérifier targets atteintes | Fin Phase 5 |
| Pré-release | Tous | Go/No-go final | Fin Phase 6 |

---

## Métriques de Succès

**Note** : Valeurs harmonisées avec specs-techniques.md (document de référence)

### Performance
- [ ] Latence totale <50ms (MIDI in → audio out final)
- [ ] CPU idle >95% sans son actif (équivalent : CPU utilisé <5%)
- [ ] Visualisation Canvas 60 FPS sur Chrome/Firefox (30 FPS acceptable Safari)
- [ ] Zéro clipping audio à volume max (limiteur -0.3dB efficace)
- [ ] Aucun buffer underrun en conditions normales (4 LFOs + 8 voix)

### Qualité
- [ ] Couverture tests >70% (réaliste pour MVP)
- [ ] Zéro crash non géré en production (error boundaries actifs)
- [ ] Accessibilité WCAG AA (contrast ratio, ARIA, keyboard nav)
- [ ] Support 4 navigateurs : Chrome, Firefox, Safari, Edge (dernières versions)
- [ ] Tests cross-browser passés (automatisés + manuels)

### UX
- [ ] Temps onboarding <5min mesuré (premier son créé via tutoriel)
- [ ] Touch response <100ms (60fps touch drawing sur iPad)
- [ ] Navigation clavier complète (tous contrôles accessibles sans souris)

---

## Notes d'Implémentation

### Ordre Recommandé (Mise à jour avec Phase 0.5)
1. **Phase 0** : Setup infrastructure (fondation, dépendances, structure)
2. **Phase 0.5** : **CRITIQUE - Prototypage & Validation** (ne PAS skip, valide approches techniques)
3. **Phase 1** : Moteur audio (core du projet, incluant profiling early)
4. **Phase 2** : Visualisation (basique pour debug audio, fallbacks navigateurs)
5. **Phase 3** : Interface utilisateur (responsive design, itérations rapides)
6. **Phase 4** : Features système (MIDI, export, presets baseline)
7. **Phase 5** : Polish & optimisations (suite aux profiling, presets v2 après polish)
8. **Phase 6** : Testing complet (unitaires, E2E, régression)
9. **Phase 7** : Déploiement (Docker, release)

### Dépendances Critiques (Mises à jour)
- **Phase 0.5 POCs AVANT Phase 1** : Validation approche FM 4 ops custom
- **AudioContext unlock (Phase 1) en PREMIER** : Sinon aucun son ne marchera
- **Voice allocation (Phase 1) AVANT polyphonie** : Critique pour 8 voix simultanées
- **LFO Engine terminé AVANT Matrice Modulation** : Logique de routage dépend des LFOs
- **Canvas Infrastructure + fallbacks AVANT visualisation** : Safari nécessite fallback
- **Profiling Phase 1 AVANT optimisations Phase 5** : Baseline performance nécessaire
- **Responsive design (Phase 3) AVANT tous composants UI** : Foundation layout
- **Tous composants UI AVANT Tutoriel Interactif** : Tutoriel référence les composants
- **Factory Presets baseline (Phase 4) AVANT presets v2 (Phase 5)** : Raffinement itératif

### Itérations
- Après chaque composant UI : mini-review UX-Designer + Codeur
- Après chaque feature audio : tests qualité Audio-Designer
- Testing continu par Testeur pendant toutes les phases

---

**Cette checklist est compatible avec l'orchestrateur team-dev.**
**Générez les tâches avec : `python ~/.claude/skills/team-dev/orchestrator-claude-code.py`**
