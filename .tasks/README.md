# 📋 Tâches OscilloSynth - Phase 0

Ce dossier contient les **tâches détaillées** pour la Phase 0 du projet OscilloSynth, générées manuellement et prêtes à être utilisées.

---

## 📁 Contenu du Dossier

| Fichier | Description |
|---------|-------------|
| `TASKS.md` | **Vue d'ensemble** de toutes les tâches Phase 0 |
| `codeur-phase0.md` | Tâches pour l'agent **CODEUR** (8 tâches) |
| `ux-designer-phase0.md` | Tâches pour l'agent **UX-DESIGNER** (3 tâches) |
| `visual-artist-phase0.md` | Tâches pour l'agent **VISUAL-ARTIST** (1 tâche) |
| `process_tasks.sh` | Script helper pour naviguer dans les tâches |
| `README.md` | Ce fichier |

---

## 🚀 Comment Utiliser

### 1️⃣ Vue d'Ensemble

```bash
cat .tasks/TASKS.md
```

Affiche le résumé complet de la Phase 0 : objectifs, agents, dépendances, métriques de succès.

### 2️⃣ Lire une Tâche Spécifique

```bash
# Tâches CODEUR (infrastructure)
cat .tasks/codeur-phase0.md

# Tâches UX-DESIGNER (design system)
cat .tasks/ux-designer-phase0.md

# Tâches VISUAL-ARTIST (icônes SVG)
cat .tasks/visual-artist-phase0.md
```

### 3️⃣ Script Interactif

```bash
./.tasks/process_tasks.sh
```

Lance un menu interactif pour afficher les tâches.

---

## 🎯 Approches de Travail

### Option A : Séquentiel (une tâche à la fois)

```bash
# 1. Lire la première tâche
cat .tasks/codeur-phase0.md

# 2. Travailler dessus (avec Claude Code ou manuellement)
# ...

# 3. Marquer comme complétée dans docs/checklist.md
vim docs/checklist.md

# 4. Passer à la suivante
cat .tasks/ux-designer-phase0.md
```

### Option B : Parallèle (plusieurs instances Claude Code)

Ouvrir 3 terminaux/instances Claude Code :

**Terminal 1** :
```bash
cd /Users/TobieRaggi/Desktop/oscillosynth
cat .tasks/codeur-phase0.md
# Ouvrir Claude Code, lui donner cette tâche
```

**Terminal 2** :
```bash
cd /Users/TobieRaggi/Desktop/oscillosynth
cat .tasks/ux-designer-phase0.md
# Ouvrir Claude Code, lui donner cette tâche
```

**Terminal 3** :
```bash
cd /Users/TobieRaggi/Desktop/oscillosynth
cat .tasks/visual-artist-phase0.md
# Ouvrir Claude Code, lui donner cette tâche
```

Les 3 agents travaillent **en parallèle** ! 🚀

### Option C : Skills Team-Dev Directement

Dans Claude Code, utiliser les skills :

```
/codeur
# Puis copier-coller le contenu de codeur-phase0.md

/ux-designer
# Puis copier-coller le contenu de ux-designer-phase0.md

/visual-artist
# Puis copier-coller le contenu de visual-artist-phase0.md
```

---

## 🔗 Dépendances

**Important** : Il y a une dépendance entre les tâches :

```
UX-DESIGNER (créer tokens CSS)
    ↓
CODEUR (intégrer design tokens)
```

**Ordre recommandé** :
1. **Parallèle** : CODEUR (tâches 1-7) + UX-DESIGNER (tout) + VISUAL-ARTIST (tout)
2. **Séquentiel** : CODEUR (tâche 8 : intégrer tokens) **APRÈS** UX-DESIGNER

---

## ✅ Vérification de Complétion

### Phase 0 Complète Si :

#### Infrastructure ✅
- [ ] `npm run dev` démarre sans erreur
- [ ] `npm run build` build sans erreur
- [ ] `npm run lint` passe sans warning
- [ ] Docker build réussit : `docker-compose build`

#### Design System ✅
- [ ] Fichier `design-tokens-complete.css` existe
- [ ] Palette oscilloscope définie (5+ couleurs)
- [ ] Typographie scale complète (5+ tailles)
- [ ] WCAG AA validé (contrast ratio 4.5:1 minimum)

#### Assets ✅
- [ ] 9+ icônes SVG créées dans `/public/icons/` ou `/src/assets/icons/`
- [ ] Style cohérent (viewBox 24×24, stroke-width 2px)

#### Documentation ✅
- [ ] README.md projet mis à jour
- [ ] Design tokens documentés (`/design-tokens/README.md`)
- [ ] Icônes documentées (`/icons/README.md`)

---

## 📚 Documents de Référence

Les tâches font référence aux documents suivants :

| Document | Chemin | Contenu |
|----------|--------|---------|
| Specs techniques | `docs/specs-techniques.md` | Contrat technique, stack, architecture |
| Vision produit | `docs/projet.md` | Description projet, objectifs, use cases |
| Checklist complète | `docs/checklist.md` | Toutes les phases (0 à 7) |

---

## 🔄 Workflow Post-Complétion

Une fois Phase 0 terminée :

1. **Vérifier** tous les critères de succès
2. **Commit** les changements :
   ```bash
   git add .
   git commit -m "feat: Phase 0 complete - infrastructure setup"
   ```
3. **Passer** à **Phase 0.5 : Prototypage & Validation**
   - POC FM 4 opérateurs
   - POC Canvas + Web Worker
   - POC Touch drawing
   - Matrice compatibilité navigateurs

---

## 💡 Tips

### Travailler en Parallèle (Maximum Efficacité)

Si vous avez accès à **plusieurs instances Claude Code** (par exemple, 3 terminaux) :

```bash
# Terminal 1 - Agent CODEUR
claude-code
# Prompt: "Voici ta tâche: [copier codeur-phase0.md]"

# Terminal 2 - Agent UX-DESIGNER
claude-code
# Prompt: "Voici ta tâche: [copier ux-designer-phase0.md]"

# Terminal 3 - Agent VISUAL-ARTIST
claude-code
# Prompt: "Voici ta tâche: [copier visual-artist-phase0.md]"
```

Les 3 agents travaillent simultanément sur des tâches indépendantes = **gain de temps massif**.

### Marquer les Progrès

Au fur et à mesure, marquer les tâches comme complétées dans `docs/checklist.md` :

```markdown
## Phase 0 : Setup Projet

### Infrastructure
- [x] **[CODEUR]** Initialiser repo Git
- [x] **[CODEUR]** Configurer Vite + React + TypeScript
- [x] **[CODEUR]** Installer dépendances core
...
```

---

## 🐛 Problèmes Courants

### "La tâche est trop longue / complexe"

➡️ **Solution** : Diviser en sous-tâches plus petites. Par exemple, pour CODEUR tâche 2 (Configurer Vite + React + TypeScript), découper en :
1. Créer projet Vite
2. Configurer vite.config.ts
3. Configurer tsconfig.json
4. Tester dev server

### "Dépendance bloquée (tokens CSS pas prêts)"

➡️ **Solution** : Faire les tâches CODEUR 1-7 d'abord (indépendantes), puis attendre UX-DESIGNER pour tâche 8.

### "Pas sûr de l'approche technique"

➡️ **Solution** : Consulter `docs/specs-techniques.md` pour les détails exacts. En cas de doute, noter la question et la poser au chef de projet.

---

## 📞 Support

Si tu rencontres un problème avec ces tâches :

1. Vérifier `docs/specs-techniques.md` (contrat technique)
2. Vérifier `docs/projet.md` (vision produit)
3. Poser la question dans le contexte projet

---

**Bon développement ! 🎸**
