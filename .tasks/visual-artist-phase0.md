# Tâche : Phase 0 - Icônes SVG Phosphore Green

**Agent:** VISUAL-ARTIST
**Skill:** visual-artist
**Phase:** Phase 0 - Setup Projet
**ID:** phase0-visual-artist

---

## Instructions

Tu es l'agent **VISUAL-ARTIST** de la team de développement OscilloSynth.

### Contexte du Projet

OscilloSynth est un synthétiseur FM avec une identité visuelle basée sur **l'esthétique oscilloscope vectoriel vintage** :
- Tracés vert phosphore lumineux (#00FF41)
- Style minimaliste et technique
- Formes géométriques simples
- Lignes nettes, pas de remplissage (stroke only)

**Documents de référence :**
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/specs-techniques.md` - Spécifications visuelles
- `/Users/TobieRaggi/Desktop/oscillosynth/docs/projet.md` - Vision produit

---

## Ta Mission - Icônes SVG Phosphore Green

### Objectif

Créer **9 icônes SVG minimum** dans le style phosphore green pour l'interface du synthétiseur.

### Icônes Requises (Minimum 9)

#### Icônes Essentielles (Obligatoires)

1. **Play** - Lecture audio (triangle ou fleche)
2. **Pause** - Pause audio (deux barres verticales)
3. **Stop** - Arrêt audio (carré)
4. **Settings** - Paramètres (engrenage ou sliders)
5. **Save** - Sauvegarder preset (disquette ou icône download)
6. **Load** - Charger preset (dossier ou icône upload)
7. **Export** - Exporter audio (flèche sortante + onde)
8. **Waveform** - Forme d'onde (sinusoïde stylisée)
9. **LFO** - Oscillateur (onde modulée)

#### Icônes Bonus (Optionnelles)

- **Delete** - Supprimer (poubelle ou X)
- **Info** - Information (i dans un cercle)
- **Help** - Aide (?)
- **MIDI** - MIDI input (prise MIDI stylisée)
- **Keyboard** - Clavier virtuel (touches piano)

---

## Spécifications Techniques SVG

### Style Visuel

**Couleur** :
- Stroke : `#00FF41` (vert phosphore) ou `currentColor` pour flexibilité
- Fill : Aucun (transparent) ou `none`
- Style : Lignes nettes, stroke-width constant

**Dimensions** :
- ViewBox : `0 0 24 24` (standard)
- Taille réelle : 24×24px (scalable)
- Stroke-width : 2px (ou 1.5px pour détails fins)

**Structure** :
```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- Paths ici -->
</svg>
```

### Cohérence

- [ ] Toutes les icônes utilisent le même viewBox (24×24)
- [ ] Même stroke-width partout (2px)
- [ ] Style cohérent (lignes, pas de remplissage)
- [ ] Alignement optique (visuellement centrées)

---

## Format de Livraison

### Fichiers SVG Individuels

Créer un dossier `/public/icons/` ou `/src/assets/icons/` avec :

```
icons/
├── play.svg
├── pause.svg
├── stop.svg
├── settings.svg
├── save.svg
├── load.svg
├── export.svg
├── waveform.svg
├── lfo.svg
└── (bonus icons...)
```

### Nommage

- Kebab-case : `play.svg`, `save-preset.svg`
- Descriptif et clair
- Pas de caractères spéciaux

### Optimisation

- [ ] SVG optimisé (pas de metadata inutile)
- [ ] Code propre et lisible
- [ ] Taille fichier minimale (<2KB par icône idéalement)
- [ ] Compatible tous navigateurs modernes

---

## Exemples de Référence

### Exemple : Icône Play

```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <polygon points="5 3 19 12 5 21 5 3" />
</svg>
```

### Exemple : Icône Waveform (Sinusoïde)

```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M2 12 Q 6 6, 12 12 T 22 12" />
</svg>
```

---

## Critères de Succès

✅ **9 icônes minimum créées** :
- [ ] Toutes les icônes essentielles présentes
- [ ] Chaque icône dans un fichier SVG séparé
- [ ] Nommage cohérent et clair

✅ **Style uniforme** :
- [ ] Même viewBox (24×24)
- [ ] Même stroke-width (2px)
- [ ] Esthétique oscilloscope respectée (lignes nettes, minimaliste)
- [ ] `currentColor` utilisé pour flexibilité

✅ **Qualité technique** :
- [ ] SVG valides (testés dans navigateur)
- [ ] Code optimisé (pas de bloat)
- [ ] Alignement optique correct

✅ **Documentation** :
- [ ] README.md dans `/icons/` listant toutes les icônes
- [ ] Usage examples (optionnel)

---

## Points d'Attention

⚠️ **Style Phosphore** : Les icônes DOIVENT respecter l'esthétique oscilloscope vintage. Pas de dégradés, pas de remplissage complexe, lignes simples uniquement.

⚠️ **currentColor** : Utiliser `stroke="currentColor"` permet au CODEUR de changer la couleur via CSS. C'est préférable à hardcoder `#00FF41`.

⚠️ **Accessibilité** : Les icônes seront utilisées dans l'UI. Le CODEUR ajoutera les `aria-label` et textes alternatifs.

⚠️ **License** : Si tu t'inspires d'icônes existantes (ex: Feather Icons, Lucide), vérifier la license (MIT généralement OK).

---

## Ressources & Inspiration

**Bibliothèques d'icônes open-source (inspiration)** :
- Feather Icons (feathericons.com) - Style minimaliste
- Lucide Icons (lucide.dev) - Fork de Feather
- Heroicons (heroicons.com) - Tailwind CSS

**Outils de création** :
- Figma (export SVG optimisé)
- Inkscape (open-source)
- SVG code à la main (pour simplicité)

**Vérification SVG** :
- SVGOMG (svgomg.net) - Optimiseur en ligne
- Navigateur (ouvrir .svg directement)

---

## Quand tu as terminé

1. **Vérifier** que les 9 icônes minimum sont créées

2. **Tester** :
   - [ ] Ouvrir chaque SVG dans un navigateur → affichage correct
   - [ ] Vérifier que `currentColor` fonctionne (changer couleur via CSS)
   - [ ] Tester sur fond noir (visibilité)

3. **Créer** le dossier `/public/icons/` ou `/src/assets/icons/`

4. **Ajouter** un `README.md` dans le dossier :
   ```markdown
   # Icônes OscilloSynth

   Style : Phosphore green, oscilloscope vintage

   ## Icônes disponibles
   - play.svg - Lecture
   - pause.svg - Pause
   - stop.svg - Stop
   (etc.)

   ## Usage
   Utiliser avec `currentColor` pour flexibilité couleur.
   ```

5. **Notifier** le CODEUR que les icônes sont prêtes pour intégration

6. **Documenter** :
   - Inspiration (si tu t'es basé sur une bibliothèque existante)
   - Choix de design (pourquoi ces formes ?)

---

**Bon design ! ✨**
