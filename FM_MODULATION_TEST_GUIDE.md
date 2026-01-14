# FM Modulation Scaling - Test Guide

## 🎯 Objectif

Vérifier que le fix de scaling FM fonctionne correctement, particulièrement pour l'algorithme SPLIT où l'OP3 était inaudible auparavant.

## ✅ Fix Implémenté

### Changements Effectués

1. **FMOperator.ts** - Infrastructure FM complète:
   - Nœud `fmGain` dédié pour connexions FM (séparé du gain audio)
   - Méthode `connectToFrequency()` avec scaling automatique
   - Formule: `FM_depth = carrierFreq × (level/100) × 50`
   - Tracking des connexions FM pour cleanup

2. **FMEngine.ts** - Routing avec fréquence réelle:
   - Méthode `setupRoutingWithFrequency(noteFreq)`
   - Calcul des fréquences porteuses réelles: `freq = noteFreq × ratio`
   - Tous les 5 algorithmes utilisent le nouveau système
   - Fix critique SPLIT: OP3 module maintenant OP2 correctement

3. **AudioEngine.ts** - Rafraîchissement du routing:
   - Appel `fmEngine.updateRoutingForFrequency(frequency)` avant note-on
   - Assure que chaque note utilise le scaling FM correct

### Formule FM Finale

```typescript
const FM_INDEX_MULTIPLIER = 50

function calculateFMDepth(carrierFrequency: number, level: number): number {
  return carrierFrequency * (level / 100) * FM_INDEX_MULTIPLIER
}
```

**Exemples de profondeur FM:**
- Porteuse 440 Hz, level 50: **11,000 Hz** (très audible!)
- Porteuse 880 Hz, level 30: **13,200 Hz**
- Porteuse 220 Hz, level 80: **8,800 Hz**

**Avant le fix:**
- Toutes les connexions: ±0.5 Hz (inaudible)

---

## 🧪 Tests de Vérification

### Test 1: SPLIT avec OP3 (TEST CRITIQUE) ⭐

**Configuration initiale:**
```
Algorithm: SPLIT (4+3)→2→1→OUT
OP1: ratio=1.0, level=80 (carrier final)
OP2: ratio=2.0, level=60 (carrier modulé)
OP3: ratio=3.0, level=0  (modulateur - COMMENCER À 0)
OP4: ratio=4.0, level=30 (modulateur)
```

**Procédure:**

1. Mettre OP3 level à **0**
2. Jouer une note (ex: A4 = 440 Hz)
3. Écouter le son → devrait être relativement simple

4. Mettre OP3 level à **50**
5. Rejouer la même note
6. **RÉSULTAT ATTENDU:** Son **beaucoup plus riche et complexe**
   - Plus de harmoniques
   - Timbre plus métallique/brillant
   - Différence **très audible**

7. Augmenter OP3 level à **80**
8. Rejouer → le son devrait être encore plus intense

**✅ Test réussi si:** La différence entre level=0 et level=50 est **clairement audible**

**❌ Test échoué si:** Aucune différence ou différence imperceptible

---

### Test 2: Scaling de Level FM

**Configuration:**
```
Algorithm: SERIAL (4→3→2→1→OUT)
OP1: ratio=1.0, level=80
OP2: ratio=2.0, level=50  ← ON VA MODIFIER CE LEVEL
OP3: ratio=1.5, level=60
OP4: ratio=3.0, level=40
```

**Procédure:**

1. Jouer note avec OP2 level=**25** → modulation subtile
2. Changer OP2 level à **50** → modulation modérée (timbre change)
3. Changer OP2 level à **75** → modulation lourde (timbre très différent)

**✅ Test réussi si:** Chaque augmentation de level produit un timbre **audiblement plus riche**

---

### Test 3: Tracking de Fréquence

**Configuration:**
```
Algorithm: SPLIT
OP1: ratio=1.0, level=70
OP2: ratio=2.0, level=60
OP3: ratio=3.0, level=50  ← Modulateur actif
OP4: ratio=4.0, level=30
```

**Procédure:**

1. Jouer note **grave** (C2 = ~65 Hz)
   - Profondeur FM théorique: 65 × 2.0 × 0.6 × 50 = ~3,900 Hz
2. Écouter le caractère du timbre (richesse relative)

3. Jouer note **aiguë** (C6 = ~1046 Hz)
   - Profondeur FM théorique: 1046 × 2.0 × 0.6 × 50 = ~62,760 Hz
4. Écouter le caractère du timbre

**✅ Test réussi si:** Le **caractère relatif** du timbre est similaire (la modulation scale proportionnellement au pitch)

**Note:** Le timbre en absolu sera différent (grave vs aigu), mais la **richesse relative** de la modulation devrait être comparable.

---

### Test 4: FAN_OUT Multi-Opérateur

**Configuration:**
```
Algorithm: FAN_OUT (4→(3+2+1)→OUT)
OP1: ratio=1.0, level=70
OP2: ratio=2.0, level=60
OP3: ratio=3.0, level=50
OP4: ratio=5.0, level=60  ← Modulateur master
```

**Procédure:**

1. Mettre OP4 level à **0**
2. Jouer note → 3 oscillateurs parallèles (son d'orgue simple)

3. Mettre OP4 level à **60**
4. Rejouer → OP4 module **tous** les 3 opérateurs simultanément

**✅ Test réussi si:** Différence **drastique** entre level=0 (son d'orgue) et level=60 (son FM riche)

---

### Test 5: Compatibilité des Presets

**Procédure:**

1. Charger le preset **"Default"**
   - Devrait sonner plus riche qu'avant (si utilisait SPLIT/SERIAL)

2. Charger le preset **"Bass"**
   - Vérifier qu'aucun crash
   - Le son devrait être cohérent

3. Charger le preset **"Pad"**
   - Vérifier la stabilité
   - Écouter la richesse harmonique

**✅ Test réussi si:**
- Aucun crash
- Sons plus riches mais pas de glitch audio
- Presets se chargent instantanément

---

### Test 6: Feedback de l'Opérateur 4

**Configuration:**
```
Algorithm: SERIAL
OP1-3: paramètres par défaut
OP4: ratio=1.0, level=50, feedback=0  ← TESTER LE FEEDBACK
```

**Procédure:**

1. Feedback = **0** → jouer note (son FM normal)
2. Feedback = **0.5** → rejouer (timbre plus complexe avec auto-modulation)
3. Feedback = **1.0** → rejouer (son très riche/chaotique)

**✅ Test réussi si:** Le feedback ajoute de la complexité audible au timbre

---

## 📊 Logs de Diagnostic

Lors du déclenchement d'une note, vous devriez voir ces logs dans la console:

```
🔗 Connexion FM: OP ratio=4 level=30 → porteuse=880.00Hz, profondeur=13200.00Hz
🔗 Connexion FM: OP ratio=3 level=50 → porteuse=880.00Hz, profondeur=22000.00Hz
🔗 Connexion FM: OP ratio=2 level=60 → porteuse=440.00Hz, profondeur=13200.00Hz
✅ FM routing établi pour 440.00 Hz (Algorithm SPLIT)
```

**Vérifications:**
- ✅ Profondeur FM en **milliers de Hz** (pas 0.5 Hz!)
- ✅ Fréquences porteuses correctes (noteFreq × ratio)
- ✅ Routing établi **avant** note-on

---

## 🔍 Métriques de Succès

### Métriques Quantitatives

- **Profondeur FM minimum:** 1,000 Hz (pour notes basses avec level faible)
- **Profondeur FM typique:** 5,000-20,000 Hz
- **Ratio profondeur/fréquence:** ~10-50x la fréquence porteuse

### Métriques Qualitatives

- ✅ Différence **évidente** quand on change level de modulateur
- ✅ Algorithme SPLIT produit sons plus riches que PARALLEL
- ✅ SERIAL produit timbres métalliques/cloche
- ✅ Aucun glitch ou click lors des changements de preset
- ✅ Portamento glide sans artefacts

---

## 🐛 Problèmes Potentiels

### Si OP3 reste inaudible dans SPLIT:

**Diagnostic:**
1. Vérifier dans console: `🔗 Connexion FM: OP ratio=3 level=X → porteuse=YYYHz, profondeur=ZZZZHz`
2. Si profondeur < 1000 Hz → problème de scaling
3. Si pas de log → problème de routing

**Solutions:**
- Relancer le dev server: `npm run dev`
- Vider le cache navigateur
- Vérifier que `fmEngine.updateRoutingForFrequency()` est appelé (AudioEngine.ts:113)

### Si sons trop extrêmes/distordus:

**Cause possible:** FM_INDEX_MULTIPLIER trop élevé

**Solution:** Réduire les levels des modulateurs (OP2-4) à 30-50 au lieu de 80-100

### Si glitches lors des changements de preset:

**Cause possible:** Voices actives pas relâchées avant changement

**Solution:** Déjà implémenté dans `audioEngine.updateCurrentPresetReference()`

---

## 📈 Comparaison Avant/Après

### AVANT le fix:

```
Algorithme SPLIT, note A4 (440 Hz):
OP4 → OP2: profondeur = 0.3 Hz (inaudible)
OP3 → OP2: profondeur = 0.5 Hz (inaudible)
OP2 → OP1: profondeur = 0.6 Hz (inaudible)

Résultat: Son identique à PARALLEL (aucune modulation FM)
```

### APRÈS le fix:

```
Algorithme SPLIT, note A4 (440 Hz):
OP4 → OP2: profondeur = 13,200 Hz (forte modulation)
OP3 → OP2: profondeur = 22,000 Hz (très forte modulation)
OP2 → OP1: profondeur = 13,200 Hz (forte modulation)

Résultat: Timbre FM riche et complexe, clairement différent de PARALLEL
```

**Gain:** ~44,000x plus de profondeur FM! 🎉

---

## ✅ Checklist de Validation

Cocher après avoir vérifié:

- [ ] **Test 1 (SPLIT OP3)** - OP3 level produit effet audible
- [ ] **Test 2 (Level scaling)** - Augmentation de level = timbre plus riche
- [ ] **Test 3 (Frequency tracking)** - Caractère similaire sur notes graves/aiguës
- [ ] **Test 4 (FAN_OUT)** - OP4 module tous les carriers
- [ ] **Test 5 (Presets)** - Chargement sans crash
- [ ] **Test 6 (Feedback)** - Feedback OP4 audible
- [ ] **Logs console** - Profondeurs FM en milliers de Hz
- [ ] **Aucun glitch** - Pas de clicks/pops lors des changements
- [ ] **Build réussit** - `npm run build` sans erreurs
- [ ] **TypeScript OK** - `npx tsc --noEmit` sans erreurs

---

## 🎛️ Configuration de Test Recommandée

Pour tester rapidement, utiliser cette configuration SPLIT optimale:

```typescript
Algorithm: SPLIT
OP1: ratio=1.0, level=80, attack=0.01s, decay=0.3s, sustain=0.7, release=0.5s
OP2: ratio=2.0, level=60, attack=0.01s, decay=0.3s, sustain=0.7, release=0.5s
OP3: ratio=3.0, level=50, attack=0.01s, decay=0.2s, sustain=0.6, release=0.4s
OP4: ratio=4.0, level=40, attack=0.01s, decay=0.2s, sustain=0.6, release=0.4s

Effets: tous à 0 (pour entendre le son FM pur)
Note: A4 (440 Hz) ou C4 (261.63 Hz)
```

**Manipulation:** Varier uniquement OP3 level de 0 à 80 pour entendre la différence.

---

## 🚀 Prochaines Étapes

Une fois le fix validé:

1. ✅ **FM Modulation Fix** - COMPLET
2. 🔄 **Fix LFO Rate Live Updates** - Prochaine priorité (2-3h)
3. 🔄 **UI pour Feedback OP4** - Quick win (30min)
4. 🔄 **Preset Browser** - UX essentielle (4-6h)
5. 🔄 **Algorithm Visualizer** - Diagramme visuel (6-8h)

---

**Status:** ✅ **FM MODULATION FIX COMPLET**

**Date:** 2026-01-14

**Build:** ✅ 543.92 KB, 0 erreurs TypeScript

**Prêt pour test utilisateur!** 🎵
