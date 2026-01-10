# OscilloSynth Design Tokens

Design tokens CSS pour l'esthétique oscilloscope vintage de OscilloSynth.

## 📁 Structure

```
design-tokens/
├── design-tokens-colors.css       # Palette oscilloscope (phosphore green)
├── design-tokens-typography.css   # Typographie monospace
├── design-tokens-spacing.css      # Spacing, touch targets, z-index
├── design-tokens-animations.css   # Transitions et animations
├── design-tokens-complete.css     # Import complet (recommandé)
└── README.md                      # Cette documentation
```

## 🎨 Usage

### Import complet (recommandé)

```typescript
// src/main.tsx
import '/design-tokens/design-tokens-complete.css'
```

### Import sélectif

```typescript
// Si vous n'avez besoin que de certains tokens
import '/design-tokens/design-tokens-colors.css'
import '/design-tokens/design-tokens-typography.css'
```

## 🎯 Tokens Principaux

### Couleurs

```css
/* Background */
--color-bg-primary: #000000;

/* Trace phosphore (couleur signature) */
--color-trace-primary: #00FF41;
--color-trace-glow: rgba(0, 255, 65, 0.6);

/* Text */
--color-text-primary: #FFFFFF;
--color-text-secondary: #00FF41;
```

### Typographie

```css
/* Font family */
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;

/* Font sizes */
--font-size-xs: 0.625rem;   /* 10px - Labels */
--font-size-sm: 0.875rem;   /* 14px - Valeurs */
--font-size-md: 1rem;       /* 16px - Standard */
--font-size-lg: 1.125rem;   /* 18px - Titres */
```

### Spacing

```css
/* Spacing scale (base 4px) */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-4: 1rem;      /* 16px */
--spacing-8: 2rem;      /* 32px */

/* Touch targets */
--touch-target-min: 2.75rem;        /* 44px */
--touch-target-comfortable: 3rem;   /* 48px */
```

### Animations

```css
/* Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easing */
--easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--easing-phosphore: cubic-bezier(0.0, 0.5, 0.5, 1.0);

/* Presets */
--transition-all: all var(--duration-normal) var(--easing-standard);
```

## 💡 Exemples d'Utilisation

### Bouton avec effet phosphore

```css
.button {
  background: transparent;
  color: var(--color-text-secondary);
  border: var(--border-width-medium) solid var(--color-border-primary);
  padding: var(--spacing-3) var(--spacing-6);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  min-height: var(--touch-target-min);
  transition: var(--transition-all);
}

.button:hover {
  background-color: var(--color-hover);
  box-shadow: 0 0 8px var(--color-trace-glow);
}

.button:active {
  background-color: var(--color-active);
}
```

### Texte avec glow effet CRT

```css
.crt-text {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-md);
  color: var(--color-trace-primary);
  text-shadow: 0 0 4px var(--color-trace-glow);
  animation: var(--animation-glow-pulse);
}
```

### Grid oscilloscope

```css
.oscilloscope-grid {
  background-color: var(--color-bg-primary);
  background-image:
    linear-gradient(var(--color-trace-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-trace-grid) 1px, transparent 1px);
  background-size: var(--spacing-8) var(--spacing-8);
}
```

## 🎨 Palette Couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-bg-primary` | `#000000` | Fond principal |
| `--color-trace-primary` | `#00FF41` | Couleur signature phosphore |
| `--color-trace-secondary` | `#FFFFFF` | Trace secondaire |
| `--color-warning` | `#FFB800` | Alertes |
| `--color-error` | `#FF3B30` | Erreurs |
| `--color-info` | `#00D4FF` | Informations |

## ♿ Accessibilité

- **Focus visible**: Outline 2px avec `--color-focus`
- **Touch targets**: Minimum 44px (iOS) / 48px (Material)
- **Reduced motion**: Support automatique avec `prefers-reduced-motion`
- **Contraste**: Testé WCAG AA minimum

## 📐 Système de Spacing

Scale basée sur **4px** (0.25rem):

```
4px  → --spacing-1
8px  → --spacing-2
12px → --spacing-3
16px → --spacing-4
24px → --spacing-6
32px → --spacing-8
```

## 🔄 Maintenance

Lors de modifications:
1. Éditer le fichier token spécifique (`design-tokens-*.css`)
2. Tester dans le navigateur
3. Vérifier contraste accessibilité (WCAG)
4. Documenter changements dans ce README

## 📚 Références

- **Esthétique**: Oscilloscope vectoriel vintage (Tektronix 1970s)
- **Couleur principale**: Phosphore P1 green (#00FF41)
- **Typographie**: Monospace technique (terminal/code)
