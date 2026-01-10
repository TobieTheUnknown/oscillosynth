# OscilloSynth

Un synthétiseur FM où la modulation devient visible : 4 LFOs créent un espace de modulation visuel dans lequel évoluent les paramètres sonores.

## Vision

Synthé FM 4-opérateurs piloté par 4 LFOs qui se combinent visuellement (style oscilloscope vectoriel). La visualisation n'est pas décorative : c'est l'interface de design sonore elle-même.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Audio:** Web Audio API + Tone.js
- **Visualisation:** Canvas 2D
- **State:** Zustand
- **Tests:** Vitest + Playwright

## Quick Start

### Dev Mode

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up
```

## Documentation

- `docs/projet.md` - Vision complète du projet
- `docs/specs-techniques.md` - Spécifications techniques détaillées
- `docs/checklist.md` - Roadmap et progression

## Status

🚧 En développement - Phase INIT complétée

---

**OscilloSynth** - Rendre la synthèse plus visuelle
