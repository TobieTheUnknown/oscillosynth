# Tâche : Phase 0 - Setup Infrastructure

**Agent:** CODEUR
**Skill:** codeur
**Phase:** Phase 0 - Setup Projet
**ID:** phase0-codeur

---

## Instructions

Tu es l'agent **CODEUR** de la team de développement OscilloSynth.

### Contexte du Projet

OscilloSynth est un synthétiseur FM où la modulation devient visible : 4 LFOs créent un espace de modulation visuel dans lequel évoluent les paramètres sonores.

**Stack technique :**
- Frontend : React 18 + TypeScript + Vite
- Audio Engine : Web Audio API + Tone.js
- State Management : Zustand
- Tests : Vitest + Playwright
- Déploiement : Docker

**Documents de référence :**
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/specs-techniques.md` - Spécifications techniques complètes
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/projet.md` - Vision produit
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/checklist.md` - Checklist complète

---

## Ta Mission - Phase 0 Infrastructure

### Tâches à Accomplir

#### 1. Initialiser repo Git
- [ ] Vérifier que le repo Git est initialisé dans `/Users/TobieRaggi/Desktop/oscillosynth`
- [ ] Si non initialisé : `git init`
- [ ] Vérifier qu'il y a au moins un commit initial

#### 2. Configurer Vite + React + TypeScript
- [ ] Créer projet Vite avec template React + TypeScript
- [ ] Configurer `vite.config.ts` selon specs-techniques.md
- [ ] Configurer `tsconfig.json` avec strict mode activé
- [ ] Tester que le dev server démarre : `npm run dev`

#### 3. Installer dépendances core
- [ ] Installer Tone.js (`npm install tone`)
- [ ] Installer Zustand (`npm install zustand`)
- [ ] Installer React Router si nécessaire
- [ ] Vérifier que toutes les dépendances sont dans `package.json`

#### 4. Setup ESLint + Prettier
- [ ] Installer ESLint avec config TypeScript
- [ ] Installer Prettier
- [ ] Créer `.eslintrc.json` avec règles strictes
- [ ] Créer `.prettierrc` avec config projet
- [ ] Tester : `npm run lint` doit passer

#### 5. Créer Dockerfile + docker-compose.yml
- [ ] Créer `Dockerfile` selon specs (voir specs-techniques.md section Docker)
- [ ] Créer `docker-compose.yml`
- [ ] Tester build : `docker-compose build`

#### 6. Setup CI/CD basique
- [ ] Créer `.github/workflows/ci.yml`
- [ ] Configurer workflow : lint + test + build
- [ ] Tester localement si possible

#### 7. Créer structure de dossiers
- [ ] Créer structure selon specs-techniques.md :
  ```
  src/
  ├── audio/
  │   ├── engine/
  │   ├── presets/
  │   └── types.ts
  ├── visualisation/
  │   ├── workers/
  │   └── utils.ts
  ├── components/
  ├── store/
  ├── hooks/
  ├── utils/
  ├── types/
  ├── App.tsx
  └── main.tsx
  ```

#### 8. Intégrer design tokens (Après UX-Designer)
- [ ] **DÉPEND DE : UX-Designer doit créer les tokens CSS**
- [ ] Intégrer tokens CSS fournis par UX-Designer dans le projet
- [ ] Créer fichier `src/styles/tokens.css` avec CSS variables
- [ ] Importer tokens dans `main.tsx` ou `App.tsx`

---

## Critères de Succès

✅ **Infrastructure complète** :
- [ ] `npm run dev` démarre le serveur sans erreur
- [ ] `npm run build` build le projet sans erreur
- [ ] `npm run lint` passe sans warning
- [ ] Structure de dossiers complète selon specs
- [ ] Docker build réussit
- [ ] Git repo fonctionnel avec .gitignore correct

✅ **Dépendances** :
- [ ] Tone.js installé et importable
- [ ] Zustand installé et importable
- [ ] TypeScript strict mode activé

✅ **Documentation** :
- [ ] README.md mis à jour avec instructions de setup
- [ ] Commandes de dev documentées

---

## Points d'Attention

⚠️ **TypeScript Strict Mode** : Activé obligatoirement (voir specs-techniques.md)

⚠️ **Dépendance** : La tâche #8 (intégrer design tokens) DOIT attendre que UX-Designer ait créé les tokens CSS.

⚠️ **Git** : Le repo existe déjà. Vérifier son état avant de réinitialiser.

⚠️ **Node Version** : Node.js 20 LTS requis (voir specs-techniques.md)

---

## Quand tu as terminé

1. **Vérifier** que tous les critères de succès sont remplis
2. **Tester** : `npm run dev` → le serveur démarre
3. **Commit** tes changements :
   ```bash
   git add .
   git commit -m "feat(setup): Phase 0 infrastructure complete

   - Vite + React + TypeScript configured
   - Tone.js + Zustand dependencies installed
   - ESLint + Prettier setup
   - Docker configuration
   - CI/CD GitHub Actions
   - Project folder structure
   - Design tokens integration

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

4. **Marquer** cette phase comme complétée dans `docs/checklist.md`

5. **Documenter** tout problème rencontré ou décision technique prise

---

**Bon courage ! 💻**
