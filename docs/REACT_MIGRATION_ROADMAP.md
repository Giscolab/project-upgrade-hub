# Roadmap exhaustive — Migration complète vers React (Shader Studio)

Ce document est la source de vérité pour migrer **sans perte fonctionnelle** depuis les fichiers legacy vers React.

## 1) Règle de migration (non négociable)

Objectif: ne supprimer un fichier legacy **qu’après couverture à 100%**.

- Chaque bloc legacy doit être mappé vers un bloc React/TS cible.
- Aucune suppression “au feeling”.
- Toute différence de comportement doit être documentée et validée.

## 2) État réel actuel (corrigé)

- [x] Entrée React/Vite active (`src/main.tsx`, `src/App.tsx`, `src/pages/Index.tsx`).
- [x] Runtime scène React actif (`ShaderStudioPage` + `BabylonCanvas`).
- [x] Loader/erreurs runtime connectés au flux principal.
- [x] Audio runtime branché (FFT bands utilisées côté React).
- [x] MIDI runtime branché (événements CC connectés au flux React).
- [x] Export vidéo React branché (progression + annulation).
- [x] Export ShaderToy + diagnostic WebGPU disponibles.
- [x] Persistance versionnée branchée sur l’état studio.
- [ ] Parité fine complète UI/FX legacy ↔ React (reste à finaliser).
- [ ] Suppression contrôlée des modules legacy après preuve de couverture 100%.

## 3) Plan par domaines (cases à cocher)

### A. Runtime graphique
- [x] Scene/camera/mesh/uniforms principaux migrés.
- [x] Overlay erreurs shader/runtime visible dans l’UI.
- [ ] Parité stricte post-process (ordre/intensité) vs legacy.
- [ ] Channels ShaderToy avancés (textures multiples) finalisés.
- [ ] Presets visuels complets + validation parité rendu.

### B. Contrôles UI
- [x] Contrôles principaux geometry/noise/sliders/toggles migrés.
- [ ] Contrôles material avancés (metalness/fresnel/rim) complets.
- [ ] Contrôles texture/blend complets.
- [ ] Raccourcis actions migration (liens directs par item) complets.

### C. Audio/MIDI
- [x] Audio live branché (micro + mapping bands).
- [ ] Source audio fichier + pause/reprise.
- [ ] Beat detect + calibration UI.
- [x] MIDI lifecycle/CC branché.
- [ ] MIDI learn complet + persistance table de mapping.

### D. Export/Persistance
- [x] Export vidéo + progression + annulation.
- [x] Export ShaderToy branché.
- [ ] Export image PNG (parité legacy) finalisé.
- [x] Persistance versionnée état studio.
- [ ] Undo/redo + presets nommés.

## 4) Système “100% avant suppression” (checklist de fusion)

> À appliquer pour **chaque fichier legacy** avant retrait.

### 4.1 Gate obligatoire (à 100%)
- [ ] 1. Inventaire du fichier figé (fonctions/sections listées).
- [ ] 2. Mapping legacy → React documenté (section par section).
- [ ] 3. Preuve de parité fournie (test, capture, ou scénario validé).
- [ ] 4. `migrationPlan.ts` mis à jour.
- [ ] 5. Roadmap mise à jour (ce document + `roadmap.md`).
- [ ] 6. PR fusionnée sur branche principale.
- [ ] 7. Suppression du fichier legacy faite dans une PR dédiée.

### 4.2 Matrice de suivi par fichier legacy

#### `App.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `AudioEngine.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `MidiHandler.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `VideoRecorder.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `ShadertoyExporter.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `WebGPUCompute.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `Config.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `shaders.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

#### `main.js`
- [ ] Gate 1/7
- [ ] Gate 2/7
- [ ] Gate 3/7
- [ ] Gate 4/7
- [ ] Gate 5/7
- [ ] Gate 6/7
- [ ] Gate 7/7 (suppression)

## 5) Gouvernance PR migration

Chaque PR de migration doit:
1. Mettre à jour `src/features/shader-studio/config/migrationPlan.ts`.
2. Mettre à jour `docs/REACT_MIGRATION_ROADMAP.md` et `roadmap.md`.
3. Fournir checks/tests exécutés.
4. Décrire clairement ce qui reste.

Interdiction de cocher “fait” si ce n’est pas branché au flux principal de production.
