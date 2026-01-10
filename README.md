# OscilloSynth

> Un synthétiseur FM où la modulation devient visible : 4 LFOs créent un espace de modulation visuel dans lequel évoluent les paramètres sonores.

## 🎯 Vision

OscilloSynth transforme la synthèse FM en une expérience visuelle et tactile basée sur l'esthétique oscilloscope vectoriel vintage.

## 🛠️ Stack Technique

- **Frontend**: React 18 + TypeScript + Vite
- **Audio Engine**: Web Audio API + Tone.js
- **State Management**: Zustand
- **Tests**: Vitest + Playwright
- **Déploiement**: Docker

## 📋 Setup

### Prérequis

- Node.js 20 LTS
- npm

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build production
npm run build

# Linter
npm run lint
```

### Docker

```bash
# Build l'image Docker
docker-compose build

# Lancer le conteneur
docker-compose up
```

## 📚 Documentation

- [Vision Produit](./docs/projet.md)
- [Spécifications Techniques](./docs/specs-techniques.md)
- [Checklist de Développement](./docs/checklist.md)

## 🚀 État du Projet

**Phase 0 : Setup Projet** ✅ COMPLÉTÉ

- Infrastructure (Vite + React + TypeScript)
- Dépendances core (Tone.js + Zustand)
- ESLint + Prettier
- Docker configuration
- CI/CD GitHub Actions
- Design tokens CSS complets
- 9 icônes SVG oscilloscope

**Phase 0.5 : Prototypage & Validation** ✅ COMPLÉTÉ

- POC Canvas + Web Worker (60 FPS validé)
- POC Touch Drawing 128 points (Catmull-Rom smoothing)
- POC FM 4 opérateurs Tone.js (4 algorithms DX7-style)
- Matrice compatibilité navigateurs
- Documentation fallbacks techniques

**Prochaine Phase : Phase 1 - Moteur Audio (Core)**

## 📄 License

MIT

---

**Développé avec Claude Code** 🎸
