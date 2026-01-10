# 📋 OscilloSynth - Tâches Phase 0

**Projet :** OscilloSynth - Synthétiseur FM visuel
**Phase :** Phase 0 - Setup Projet
**Généré le :** 2026-01-10

---

## 🎯 Objectif de la Phase 0

Mettre en place l'infrastructure complète du projet :
- ✅ Stack technique (Vite + React + TypeScript + Tone.js + Zustand)
- ✅ Design system initial (palette oscilloscope, typographie, tokens CSS)
- ✅ Tooling (ESLint, Prettier, Docker, CI/CD)
- ✅ Structure de dossiers selon specs techniques
- ✅ Assets visuels de base (icônes SVG)

**Résultat attendu :** Projet prêt à accueillir le développement des features (Phase 1+).

---

## 👥 Agents Mobilisés (3)

| Agent | Nb Tâches | Priorité |
|-------|-----------|----------|
| **CODEUR** | 8 tâches | HAUTE |
| **UX-DESIGNER** | 3 tâches | HAUTE |
| **VISUAL-ARTIST** | 1 tâche | MOYENNE |

---

## 📝 Liste des Tâches

### 🟢 CODEUR (8 tâches) - Fichier : `codeur-phase0.md`

**Infrastructure** :
1. ✅ Initialiser repo Git dans `/Users/TobieRaggi/Desktop/oscillosynth`
2. ✅ Configurer Vite + React + TypeScript selon specs-techniques.md
3. ✅ Installer dépendances core (Tone.js, Zustand)
4. ✅ Setup ESLint + Prettier avec règles strictes
5. ✅ Créer Dockerfile + docker-compose.yml
6. ✅ Setup CI/CD basique (GitHub Actions)
7. ✅ Créer structure de dossiers selon specs-techniques.md

**Design System** :
8. ✅ Intégrer design tokens dans le projet (CSS variables)
   - **DÉPEND DE :** UX-Designer doit créer les tokens CSS d'abord

**Critères de validation** :
- `npm run dev` démarre sans erreur
- `npm run build` build sans erreur
- `npm run lint` passe sans warning
- TypeScript strict mode activé
- Docker build réussit

---

### 🎨 UX-DESIGNER (3 tâches) - Fichier : `ux-designer-phase0.md`

**Design System Initial** :
1. ✅ Définir palette oscilloscope (vert phosphore + blanc) avec tokens CSS
   - Couleurs : bg, trace-primary, trace-secondary, trace-dim, grid
   - Contrast ratio WCAG AA validé

2. ✅ Sélectionner typographie monospace (JetBrains Mono) et créer scale
   - Font stack complet avec fallbacks
   - Scale : xs/sm/md/lg/xl (10px, 14px, 16px, 18px, 24px)

3. ✅ Créer tokens CSS complets (couleurs, spacing, tailles, animations)
   - Spacing : système cohérent base 4px/8px
   - Animations : transitions fast/normal/slow
   - Touch targets minimum 44×44px

**Critères de validation** :
- Fichier `design-tokens-complete.css` créé
- Contrast ratio WCAG AA validé (4.5:1 minimum)
- Documentation complète (README.md)
- Prêt pour intégration par CODEUR

---

### ✨ VISUAL-ARTIST (1 tâche) - Fichier : `visual-artist-phase0.md`

**Icônes SVG** :
1. ✅ Créer icônes SVG phosphore green (9 icônes minimum)
   - Essentielles : play, pause, stop, settings, save, load, export, waveform, lfo
   - Style : stroke only, vert phosphore, lignes nettes
   - ViewBox 24×24, stroke-width 2px
   - Format : `currentColor` pour flexibilité

**Critères de validation** :
- 9 icônes SVG minimum créées
- Style cohérent (même viewBox, stroke-width)
- SVG valides et optimisés (<2KB par icône)
- README.md dans `/icons/`

---

## 🔗 Dépendances Entre Tâches

```
UX-DESIGNER (tokens CSS)
    ↓
CODEUR (intégrer design tokens)
```

**Ordre recommandé** :
1. **Parallèle** : CODEUR (infrastructure 1-7) + UX-DESIGNER (tokens) + VISUAL-ARTIST (icônes)
2. **Séquentiel** : CODEUR (intégrer tokens) APRÈS UX-DESIGNER

---

## 📊 Métriques de Succès Phase 0

### Infrastructure ✅
- [ ] Serveur dev démarre : `npm run dev` → OK
- [ ] Build production : `npm run build` → OK
- [ ] Lint passe : `npm run lint` → 0 warning
- [ ] Docker build : `docker-compose build` → OK

### Design System ✅
- [ ] Tokens CSS complets et documentés
- [ ] Palette oscilloscope définie (5+ couleurs)
- [ ] Typographie scale complète (5+ tailles)
- [ ] WCAG AA contrast ratio validé

### Assets ✅
- [ ] 9+ icônes SVG créées
- [ ] Style cohérent et optimisé

### Documentation ✅
- [ ] README.md projet mis à jour
- [ ] Design tokens documentés
- [ ] Icônes documentées

---

## 🚀 Prochaines Étapes (Après Phase 0)

Une fois Phase 0 complétée, on passe à **Phase 0.5 : Prototypage & Validation** :

**Tâches critiques Phase 0.5** :
- POC : FM 4 opérateurs custom avec Tone.js
- POC : Canvas + Web Worker performance
- POC : Touch drawing 128 points
- Matrice compatibilité navigateurs (Chrome, Firefox, Safari, Edge)

**Objectif Phase 0.5** : Valider les approches techniques AVANT l'implémentation complète.

---

## 📁 Fichiers de Tâches

| Fichier | Agent | Description |
|---------|-------|-------------|
| `codeur-phase0.md` | CODEUR | Setup infrastructure + intégration tokens |
| `ux-designer-phase0.md` | UX-DESIGNER | Design system initial (tokens CSS) |
| `visual-artist-phase0.md` | VISUAL-ARTIST | Icônes SVG phosphore green |
| `TASKS.md` | - | Ce fichier (vue d'ensemble) |

---

## 💡 Comment Utiliser Ces Tâches

### Option 1 : Séquentiel (1 agent à la fois)

```bash
# Lire la première tâche
cat .tasks/codeur-phase0.md

# Travailler sur la tâche (CODEUR ou toi-même)
# ...

# Marquer complétée dans docs/checklist.md
# Passer à la suivante
cat .tasks/ux-designer-phase0.md
```

### Option 2 : Parallèle (plusieurs instances Claude Code)

```bash
# Terminal 1 - CODEUR
cat .tasks/codeur-phase0.md
# Ouvrir Claude Code ici

# Terminal 2 - UX-DESIGNER
cat .tasks/ux-designer-phase0.md
# Ouvrir Claude Code ici

# Terminal 3 - VISUAL-ARTIST
cat .tasks/visual-artist-phase0.md
# Ouvrir Claude Code ici
```

Les 3 agents travaillent en même temps ! 🚀

### Option 3 : Skills Team-Dev

```bash
# Utiliser les skills directement
/codeur      # Pour tâches CODEUR
/ux-designer # Pour tâches UX-DESIGNER
/visual-artist # Pour tâches VISUAL-ARTIST
```

---

## ✅ Checklist Phase 0 (Vue Rapide)

### CODEUR
- [ ] Repo Git initialisé
- [ ] Vite + React + TypeScript configuré
- [ ] Tone.js + Zustand installés
- [ ] ESLint + Prettier setup
- [ ] Dockerfile + docker-compose.yml
- [ ] CI/CD GitHub Actions
- [ ] Structure de dossiers créée
- [ ] Design tokens intégrés (attendre UX-Designer)

### UX-DESIGNER
- [ ] Palette oscilloscope définie (5+ couleurs)
- [ ] Typographie monospace sélectionnée (scale complète)
- [ ] Tokens CSS complets (spacing, animations, etc.)

### VISUAL-ARTIST
- [ ] 9+ icônes SVG créées (style phosphore green)

---

**Phase 0 prête à démarrer ! 🎸**

**Documents de référence** :
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/specs-techniques.md`
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/projet.md`
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/checklist.md`
