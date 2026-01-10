# OscilloSynth Design System

Design system basé sur l'esthétique oscilloscope vintage CRT.

## Philosophie Visuelle

**Style:** Oscilloscope vintage à phosphore vert
- Fond noir profond (#000000)
- Tracés phosphore vert (#00FF41) et blanc (#FFFFFF)
- Effets de glow simulant le phosphore CRT
- Typographie monospace (JetBrains Mono)
- Grille subtile façon oscilloscope
- Scanlines CRT légères

## Fichiers

- `tokens.css` - Variables CSS : couleurs, typographie, spacing, effets
- `components.css` - Styles de composants réutilisables
- `README.md` - Cette documentation

## Usage

Les tokens sont importés automatiquement via `index.css`.

### Couleurs Principales

```css
--color-bg: #000000                    /* Fond noir */
--color-phosphor-green: #00FF41        /* Vert phosphore */
--color-phosphor-white: #FFFFFF        /* Blanc phosphore */
--color-grid: #001a0a                  /* Grille subtile */
```

### LFO Colors

Chaque LFO a sa propre couleur distinctive :

```css
--color-lfo-1: #00FF41  /* Green */
--color-lfo-2: #00D4FF  /* Cyan */
--color-lfo-3: #FF00FF  /* Magenta */
--color-lfo-4: #FFB800  /* Amber */
```

### Typographie

```css
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace
```

Tailles : `--text-xs` (10px) à `--text-2xl` (24px)

### Spacing (Compact)

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
```

### Effets Glow

```css
--glow-text-sm: 0 0 4px var(--color-phosphor-green-glow)
--glow-trace: 0 0 6px var(--color-phosphor-green)
--glow-border: 0 0 4px var(--color-phosphor-green-glow)
```

## Composants

### Boutons

```html
<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
```

### Inputs

```html
<input type="text" class="input" placeholder="Enter value..." />
<input type="range" class="slider" min="0" max="100" />
```

### Toggle

```html
<label class="toggle">
  <input type="checkbox" />
  <span class="toggle-slider"></span>
</label>
```

### Panels

```html
<div class="panel">
  <div class="panel-header">LFO 1</div>
  <div class="stack">
    <!-- Content -->
  </div>
</div>
```

### Canvas Wrapper

```html
<div class="canvas-wrapper">
  <canvas id="oscilloscope"></canvas>
</div>
```

### LFO Indicators

```html
<span class="lfo-indicator lfo-indicator-1"></span>
<span class="lfo-indicator lfo-indicator-2"></span>
```

## Animations

```css
.crt-flicker    /* Légère variation d'opacité type CRT */
.pulse-glow     /* Pulsation du glow */
```

## Utilities

```css
.text-glow      /* Petit glow sur texte */
.text-glow-md   /* Glow moyen */
.text-glow-lg   /* Grand glow */
.border-glow    /* Glow sur bordure */
.monospace      /* Force font monospace */
.uppercase      /* Texte en majuscules */
```

## Exemples

### LFO Control Panel

```html
<div class="panel">
  <div class="panel-header">
    <span class="lfo-indicator lfo-indicator-1"></span>
    LFO 1
  </div>
  <div class="stack">
    <div>
      <label class="label">Rate</label>
      <input type="range" class="slider" min="0.01" max="40" step="0.01" />
      <span class="value">2.50 Hz</span>
    </div>
    <div>
      <label class="label">Sync</label>
      <label class="toggle">
        <input type="checkbox" />
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>
</div>
```

## Notes de Design

- Les marges sont compactes (spacing réduit) pour maximiser l'espace
- Tous les textes ont un léger glow par défaut
- Les canvas ont un effet de grille oscilloscope en background
- L'effet scanline est appliqué globalement sur le body
- Les contrôles réagissent au hover avec intensification du glow
- La palette est strictement limitée au vert/blanc/noir pour l'authenticité
