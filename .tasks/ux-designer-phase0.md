# Tâche : Phase 0 - Design System Initial

**Agent:** UX-DESIGNER
**Skill:** ux-designer
**Phase:** Phase 0 - Setup Projet
**ID:** phase0-ux-designer

---

## Instructions

Tu es l'agent **UX-DESIGNER** de la team de développement OscilloSynth.

### Contexte du Projet

OscilloSynth transforme la synthèse FM en une expérience visuelle et tactile. L'identité visuelle est basée sur **l'esthétique oscilloscope vectoriel vintage** :
- Fond noir profond
- Tracés vert phosphore lumineux
- Style CRT (Cathode Ray Tube) vintage
- Typographie monospace technique

**Documents de référence :**
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/specs-techniques.md` - Spécifications visuelles détaillées
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/projet.md` - Vision produit

---

## Ta Mission - Design System Initial

### Tâches à Accomplir

#### 1. Définir la Palette Oscilloscope

Créer une palette de couleurs basée sur l'esthétique oscilloscope vintage.

**Couleurs principales** (specs-techniques.md comme référence) :
- [ ] `--bg` : Noir profond (#000000 ou variant)
- [ ] `--trace-primary` : Vert phosphore (#00FF41 ou variant)
- [ ] `--trace-secondary` : Blanc lumineux (#FFFFFF)
- [ ] `--trace-dim` : Vert atténué (#004411 ou variant)
- [ ] `--grid` : Vert très sombre (#001a0a ou variant)

**Couleurs additionnelles** :
- [ ] Couleurs de statut : success, warning, error
- [ ] Couleurs interactives : hover, active, focus
- [ ] Couleurs de texte : primaire, secondaire, disabled

**Livrables** :
- [ ] Fichier `design-tokens-colors.css` avec toutes les variables CSS
- [ ] Documentation des couleurs avec cas d'usage
- [ ] Vérification contrast ratio WCAG AA (4.5:1 minimum)

#### 2. Sélectionner Typographie Monospace

Créer une scale typographique complète.

**Font stack** :
- [ ] Police principale : 'JetBrains Mono' (ou alternative : 'Fira Code', 'Consolas', monospace)
- [ ] Définir fallbacks appropriés
- [ ] Tester le rendu sur navigateurs principaux

**Scale typographique** (specs-techniques.md référence : 10px/14px/18px) :
- [ ] `--font-size-xs` : Labels (exemple : 10px)
- [ ] `--font-size-sm` : Valeurs paramétriques (exemple : 14px)
- [ ] `--font-size-md` : Texte standard (exemple : 16px)
- [ ] `--font-size-lg` : Titres sections (exemple : 18px)
- [ ] `--font-size-xl` : Titres principaux (exemple : 24px)

**Line heights & weights** :
- [ ] Définir line-heights pour chaque taille
- [ ] Définir font-weights : normal, medium, bold

**Livrables** :
- [ ] Fichier `design-tokens-typography.css`
- [ ] Instructions d'installation de la font (Google Fonts ou local)

#### 3. Créer Tokens CSS Complets

Tokens additionnels pour système complet.

**Spacing** (système cohérent, base 4px ou 8px) :
- [ ] `--spacing-xs` : 4px
- [ ] `--spacing-sm` : 8px
- [ ] `--spacing-md` : 16px
- [ ] `--spacing-lg` : 24px
- [ ] `--spacing-xl` : 32px
- [ ] `--spacing-2xl` : 48px

**Tailles** (composants) :
- [ ] Touch targets minimum : 44×44px (iOS guidelines)
- [ ] Boutons : hauteurs standard (sm, md, lg)
- [ ] Inputs : hauteurs cohérentes avec boutons

**Animations & Transitions** :
- [ ] `--transition-fast` : 150ms (hover, focus)
- [ ] `--transition-normal` : 300ms (standard)
- [ ] `--transition-slow` : 500ms (changements majeurs)
- [ ] Easing functions : ease-out, ease-in-out

**Effets visuels** :
- [ ] Border radius (si applicable, ou 0 pour style CRT)
- [ ] Shadows (subtiles, style glow phosphore)
- [ ] Opacity levels : disabled, hover, etc.

**Livrables** :
- [ ] Fichier `design-tokens-spacing.css`
- [ ] Fichier `design-tokens-animations.css`
- [ ] Fichier `design-tokens-complete.css` (tout combiné)

---

## Critères de Succès

✅ **Palette de couleurs complète** :
- [ ] Toutes les couleurs définies en CSS variables
- [ ] Contrast ratio WCAG AA validé (outils : WebAIM, axe DevTools)
- [ ] Documentation cas d'usage pour chaque couleur

✅ **Typographie fonctionnelle** :
- [ ] Font stack complet avec fallbacks
- [ ] Scale typographique cohérente (5+ tailles)
- [ ] Line-heights optimisés pour lisibilité

✅ **Tokens CSS prêts à l'emploi** :
- [ ] Fichier CSS propre et bien commenté
- [ ] Variables nommées de façon cohérente (`--category-variant-state`)
- [ ] Compatible avec l'intégration par le CODEUR

✅ **Documentation visuelle** :
- [ ] Guide d'utilisation des tokens (markdown ou HTML)
- [ ] Exemples visuels (optionnel : page de démo HTML)

---

## Format de Livraison

Créer les fichiers suivants dans un dossier `/design-tokens/` :

```
design-tokens/
├── design-tokens-complete.css    # Fichier principal (tout combiné)
├── design-tokens-colors.css      # Palette de couleurs
├── design-tokens-typography.css  # Typographie
├── design-tokens-spacing.css     # Spacing & tailles
├── design-tokens-animations.css  # Transitions & animations
└── README.md                      # Guide d'utilisation
```

**Exemple de structure CSS** :
```css
/* design-tokens-colors.css */
:root {
  /* Background */
  --color-bg-primary: #000000;
  --color-bg-secondary: #0a0a0a;

  /* Trace (phosphore green) */
  --color-trace-primary: #00FF41;
  --color-trace-secondary: #FFFFFF;
  --color-trace-dim: #004411;
  --color-trace-grid: #001a0a;

  /* Status */
  --color-success: #00FF41;
  --color-warning: #FFB800;
  --color-error: #FF3B30;

  /* Interactive states */
  --color-hover: rgba(0, 255, 65, 0.1);
  --color-active: rgba(0, 255, 65, 0.2);
  --color-focus: #00FF41;
}
```

---

## Points d'Attention

⚠️ **Identité Visuelle** : Le style oscilloscope vintage est CRITIQUE pour l'ADN du projet. Rester fidèle à cette esthétique.

⚠️ **WCAG AA** : Minimum obligatoire. Vérifier le contrast ratio entre texte et fond (4.5:1 pour texte normal, 3:1 pour texte large).

⚠️ **Touch Targets** : Projet cible tablettes. Tous les touch targets doivent être ≥44×44px (iOS guidelines).

⚠️ **Dépendance** : Le CODEUR attend tes tokens CSS pour la tâche "Intégrer design tokens". Prioriser `design-tokens-complete.css`.

---

## Quand tu as terminé

1. **Vérifier** que tous les critères de succès sont remplis

2. **Créer** le dossier `/design-tokens/` avec tous les fichiers

3. **Valider** :
   - [ ] Contrast ratio WCAG AA (utiliser WebAIM Contrast Checker)
   - [ ] Tous les tokens nommés de façon cohérente
   - [ ] README.md explique comment utiliser les tokens

4. **Notifier** le CODEUR que les tokens sont prêts pour intégration

5. **Documenter** :
   - Choix de couleurs (pourquoi ces nuances de vert ?)
   - Rationale pour la scale typographique
   - Sources d'inspiration (screenshots oscilloscopes vintage ?)

---

**Bon design ! 🎨**
