# OscilloSynth

> Un synthétiseur FM où la modulation devient visible : 4 LFOs créent un espace de modulation visuel dans lequel évoluent les paramètres sonores.

## Vision

OscilloSynth transforme la synthèse FM en une expérience visuelle et tactile. Au lieu de moduler "en aveugle", les musiciens dessinent littéralement l'espace dans lequel leurs sons vont évoluer. Les LFOs se combinent comme des formes géométriques sur un oscilloscope vectoriel vintage, créant une matrice de modulation intuitive et inspirante.

L'objectif : rendre la synthèse plus visuelle et immédiate, tout en offrant la profondeur sonore de la FM à 4 opérateurs.

## Utilisateurs Cibles

- **Persona principal :** Musiciens et producteurs créatifs cherchant de nouveaux workflows de sound design
- **Cas d'usage clé :**
  - Session de production : créer des textures évolutives en "dessinant" la modulation
  - Live performance : interaction tactile avec les LFOs sur tablette
  - Exploration sonore : utiliser le randomizer intelligent pour découvrir de nouveaux territoires

## Fonctionnalités Clés

### MVP (v1)

**Moteur Audio**
1. Synthétiseur FM 4 opérateurs avec 8 algorithmes classiques
2. 4 LFOs simultanés avec formes preset (sine/square/saw/triangle/random) + dessinables à la main
3. LFOs sync (tempo) ou free-running
4. Combinaisons LFO : addition, multiplication, ring modulation
5. Matrice de modulation complète (tous paramètres FM modulables)
6. Limiteur/compresseur anti-clipping intégré

**Visualisation**
1. Oscilloscope vectoriel temps réel (style CRT vintage)
2. Affichage des LFOs combinés avec paramètres modulés au centre
3. Waveform audio finale sur oscilloscope séparé
4. Style : fond noir, tracés blancs/verts phosphore

**Interface**
1. Zone centrale : visualisation LFO combinée + placement paramètres
2. Éditeur de formes LFO custom (dessin tactile/souris)
3. Sélecteur d'algorithmes FM
4. Matrice de routage modulation
5. Clavier virtuel MIDI

**Fonctionnalités Système**
1. Export audio WAV haute qualité
2. Sauvegarde/chargement presets (localStorage)
3. Support MIDI In/Out hardware
4. MIDI Learn pour mapping controllers

### Évolutions (v2+)

**Features Créatives**
- **Freeze Frame LFO :** Capturer et sauvegarder une forme LFO générée/dessinée
- **LFO Morphing :** Animation de transition entre 2 formes LFO sur N mesures
- **Randomizer Intelligent :** Génération de variations dans un style donné (doux/agressif/chaotique)
- **MIDI Out Modulation :** Les LFOs génèrent du MIDI CC pour piloter d'autres instruments

**Export & Partage**
- Export visuel (GIF/video de la visualisation)
- Partage presets via URL/JSON
- Mode performance plein écran

**Optimisations**
- Mode offline rendering pour export audio haute qualité
- Presets factory de haute qualité
- Tutoriel interactif intégré

## Stack Technique

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Frontend | React 18 + TypeScript | Structure solide pour UI complexe, typage sûr |
| Audio Engine | Web Audio API + Tone.js | FM native, scheduling précis, anti-clipping |
| Visualisation | Canvas 2D | Suffisant pour style vectoriel, 60fps garanti |
| State Management | Zustand | Léger, évite re-renders coûteux pour audio temps réel |
| Build Tool | Vite | Dev rapide, HMR pour itérations, tree-shaking optimal |
| Tests | Vitest + Playwright | Unitaires rapides + E2E complets |
| Déploiement | Docker + static hosting | Portabilité, pas de backend nécessaire |

## Architecture Simplifiée

```
┌─────────────────────────────────────────────────────────┐
│                     React UI Layer                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ LFO Editor  │  │ FM Controls  │  │ Preset Mgr    │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ Event Bus (Zustand)
┌────────────────────┴────────────────────────────────────┐
│              Audio Engine (Tone.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ LFO 1-4  │→ │ FM Synth │→ │ Limiter  │→ Output     │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────┬────────────────────────────────────┘
                     │ Analysis Data
┌────────────────────┴────────────────────────────────────┐
│        Visualization Layer (Canvas Worker)              │
│  ┌──────────────┐          ┌────────────────┐          │
│  │ LFO Combine  │          │  Oscilloscope  │          │
│  │ Display      │          │  Waveform      │          │
│  └──────────────┘          └────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Séparation critique :**
- Audio thread (Tone.js) isolé du render React
- Canvas dans Web Worker pour ne jamais bloquer l'audio
- Event bus unidirectionnel pour éviter les race conditions

## Points Clés de l'Échange

### Décisions Importantes
- **100% client-side** : Pas de backend, tout tourne dans le navigateur
- **FM 4-op** : Équilibre puissance/complexité (comme DX7)
- **4 LFOs** : Sweet spot entre créativité et CPU
- **Produit polishé** : Pas de compromis sur la qualité UX/audio
- **Desktop + Tablettes** : Tactile important pour dessiner les LFOs

### Insights Créatifs
- Visualisation = interface de design, pas juste cosmétique
- Les LFOs créent un "espace" dans lequel les paramètres évoluent
- Style oscilloscope vintage donne une identité forte
- Freeze/Morph/Randomizer créent un workflow non-linéaire

### Contraintes Techniques
- Zéro clipping (limiteur obligatoire)
- Pas de buffer underruns (adaptive buffer size)
- 60fps pour la viz même avec 4 LFOs actifs
- Latence <10ms pour jouer en temps réel

## Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Performance viz + audio simultanés | H | Canvas dans Worker, throttle updates à 60fps max |
| Latence MIDI inacceptable | H | Buffer adaptatif, profiling early, fallback 128 samples |
| UI complexe = courbe apprentissage | M | Tutoriel interactif, presets factory, tooltips contextuels |
| FM = sons "métalliques" uniquement | M | Algorithmes variés, bon preset design, randomizer intelligent |
| Dessiner LFO tactile = imprécis | M | Lissage de courbe (Bézier), snap-to-grid optionnel |
| Export audio long = freeze UI | L | Web Worker pour rendering, progress bar |

## Notes Brainstorm

- User veut du "produit polishé" dès le MVP → pas de raccourcis
- Analogie oscilloscope + modulation visuelle = ADN du projet
- Expérimental/Artistique pour l'UI, pas juste fonctionnel
- MIDI undirectionnel (In)
- Les 3 features v2 choisies (Freeze, Morph, Randomizer) ajoutent tous une dimension créative non-linéaire
