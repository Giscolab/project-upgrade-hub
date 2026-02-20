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
- [x] Audio runtime branché (micro + FFT + source fichier + pause/reprise + beat detect).
- [x] MIDI runtime branché (lifecycle + événements CC + statut UI).
- [x] Export vidéo React branché (progression + annulation).
- [x] Export PNG canvas branché (toBlob + fallback toDataURL).
- [x] Export ShaderToy branché.
- [x] Persistance versionnée branchée sur l’état studio.
- [x] Undo/redo + presets nommés branchés.
- [x] Chaîne post-process React branchée (pixel/glitch/vignette/bloom/rgb-shift).
- [ ] MIDI learn + persistance de mapping non implémentés.
- [ ] Contrôles texture/blend non implémentés.
- [ ] Presets visuels validés en parité legacy non documentés.
- [ ] WebGPU fallback multi-device non validé/documenté.
- [ ] Suppression contrôlée des modules legacy après preuve de couverture 100%.

## 2.1) Focus actuel (mode `priorities_only`)

### Parité visuelle/graphique
- [ ] Finaliser la parité post-process (ordre + intensité vs legacy).
- [ ] Valider les presets visuels pour garantir le même rendu.

### UI contrôles
- [ ] Compléter les contrôles texture/blend.

### Audio/MIDI
- [ ] Finir MIDI learn + persistance de la table de mapping.

### Export/Persistance
- [ ] Valider la matrice de compatibilité codec export vidéo selon navigateurs cibles.
- [ ] Valider la parité PNG face au workflow legacy sur scénarios de référence.

## 3) Plan par domaines (cases à cocher)

### A. Runtime graphique
- [x] Scene/camera/mesh/uniforms principaux migrés.
- [x] Overlay erreurs shader/runtime visible dans l’UI.
- [x] Chaîne post-process branchée dans le runtime React.
- [ ] Parité stricte post-process (ordre/intensité) vs legacy.
- [x] Channels ShaderToy avancés (textures multiples) finalisés.
- [ ] Presets visuels complets + validation parité rendu.
- [ ] WebGPU fallback multi-device validé/documenté.

### B. Contrôles UI
- [x] Contrôles principaux geometry/noise/sliders/toggles migrés.
- [x] Contrôles material avancés (metalness/fresnel/rim) complets.
- [x] Éditeur GLSL React (édition/compile/export) branché.
- [ ] Contrôles texture/blend complets.
- [x] Raccourcis actions migration (liens directs par item) complets.

### C. Audio/MIDI
- [x] Audio live branché (micro + mapping bands).
- [x] Source audio fichier + pause/reprise.
- [x] Beat detect + calibration UI.
- [x] MIDI lifecycle/CC branché.
- [ ] MIDI learn complet + persistance table de mapping.

### D. Export/Persistance
- [x] Export vidéo + progression + annulation.
- [x] Export ShaderToy branché.
- [x] Export image PNG branché.
- [x] Persistance versionnée état studio.
- [x] Undo/redo + presets nommés.

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
- [x] Gate 1/7 — Inventaire figé (bridge legacy + API documentée)
- [x] Gate 2/7 — Mapping legacy → React/TS documenté
- [x] Gate 3/7 — Preuve de parité: `docs/migration-evidence/shadertoy-exporter-parity.md`
- [x] Gate 4/7 — `migrationPlan.ts` référencé avec preuve explicite
- [x] Gate 5/7 — Roadmap/évidence mises à jour
- [ ] Gate 6/7 — PR non encore fusionnée sur `main`
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
- [x] Gate 1/7 — Inventaire figé (entrypoint + cycle dispose HMR)
- [x] Gate 2/7 — Mapping legacy → React/TS documenté
- [x] Gate 3/7 — Preuve de parité: `docs/migration-evidence/main-js-parity.md`
- [x] Gate 4/7 — `migrationPlan.ts` référencé avec preuve explicite
- [x] Gate 5/7 — Roadmap/évidence mises à jour
- [ ] Gate 6/7 — PR non encore fusionnée sur `main`
- [ ] Gate 7/7 (suppression)

> Conformément à la gouvernance (section 5), la suppression des fichiers legacy (`Gate 7`) sera faite via une PR dédiée après validation et fusion des Gates 1–6.

## 5) Gouvernance PR migration

Chaque PR de migration doit:
1. Mettre à jour `src/features/shader-studio/config/migrationPlan.ts`.
2. Mettre à jour `docs/REACT_MIGRATION_ROADMAP.md` + `roadmap.md`.
3. Fournir la preuve de parité (tests/scénario/capture) dans `docs/migration-evidence/`.
4. Ne jamais supprimer le legacy dans la même PR que les gates 1→6.

## 6) Source technique de vérité

- `src/features/shader-studio/config/migrationPlan.ts`
- `src/features/shader-studio/components/MigrationChecklistPanel.tsx`

Date de vérification du plan technique: `2026-02-20`.
