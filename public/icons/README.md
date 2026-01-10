# OscilloSynth Icons

Icônes SVG avec esthétique oscilloscope pour l'interface OscilloSynth.

## 🎨 Style

- **Format**: SVG stroke-based (pas de fill)
- **ViewBox**: 24×24
- **Stroke**: `currentColor` (hérite de la couleur du parent)
- **Stroke Width**: 2px
- **Line Caps**: Round
- **Line Joins**: Round

## 📁 Icônes Disponibles

### Transport Controls

- **play.svg** - Lecture/démarrage
- **pause.svg** - Pause
- **stop.svg** - Arrêt complet

### Actions

- **settings.svg** - Paramètres/configuration
- **save.svg** - Sauvegarder preset
- **load.svg** - Charger preset
- **export.svg** - Exporter audio/preset

### Audio/Synth

- **waveform.svg** - Forme d'onde
- **lfo.svg** - LFO/modulation (onde sinusoïdale avec indicateur)

## 💡 Usage

### React Component

```tsx
import playIcon from '/icons/play.svg?react'

function TransportButton() {
  return (
    <button className="transport-btn">
      <img src={playIcon} alt="Play" />
    </button>
  )
}
```

### CSS Styling

```css
.icon {
  width: 24px;
  height: 24px;
  color: var(--color-trace-primary); /* Phosphore green */
}

.icon:hover {
  color: var(--color-text-primary); /* White */
  filter: drop-shadow(0 0 4px var(--color-trace-glow));
}
```

### Inline SVG (pour animations)

```tsx
import PlayIcon from '/icons/play.svg?react'

function AnimatedButton() {
  return (
    <button>
      <PlayIcon className="icon-animated" />
    </button>
  )
}
```

## 🎯 Design Tokens

Les icônes utilisent les design tokens suivants:

- `--color-trace-primary`: Couleur par défaut (#00FF41)
- `--color-trace-glow`: Effet glow au hover
- `--color-text-primary`: Couleur alternative (#FFFFFF)
- `--transition-color`: Transition smooth au hover

## ♿ Accessibilité

- Toujours inclure un `alt` text descriptif
- Utiliser `aria-label` sur les boutons icon-only
- Minimum size: 24×24px (touch target: 44×44px avec padding)

## 🔄 Ajout de Nouvelles Icônes

1. Créer SVG avec viewBox="0 0 24 24"
2. Utiliser stroke="currentColor" (pas de couleurs hardcodées)
3. stroke-width="2", stroke-linecap="round", stroke-linejoin="round"
4. Tester avec différentes couleurs via CSS
5. Documenter dans ce README

## 📐 Grid System

Les icônes sont conçues sur une grille 24×24 avec:
- Safe area: 2px de padding
- Drawing area: 20×20px
- Stroke centered sur la grid

## 🎨 Palette

Bien que les icônes utilisent `currentColor`, voici les couleurs recommandées:

- **Default**: `#00FF41` (phosphore green)
- **Hover**: `#FFFFFF` (white) + glow effect
- **Active**: `#00FF41` + stronger glow
- **Disabled**: `#404040` (gray)
