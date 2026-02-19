# Roadmap exhaustive — Migration complète vers React (Shader Studio)

## 0) État recalculé après réanalyse complète du repository

### 0.1 Lecture de réalité (ce qui est vraiment fait)
- [x] Application servie par une entrée React (`src/main.tsx`) et routage React (`src/App.tsx`).
- [x] Écran principal unifié React (`src/features/shader-studio/ShaderStudioPage.tsx`).
- [x] Canvas Babylon encapsulé React (`src/components/shader/BabylonCanvas.tsx`) avec uniforms runtime.
- [x] Contrôles shader React de base opérationnels (`ShaderControls.tsx`).
- [x] Composants de visibilité migration exposés à l’écran (`LegacyMigrationSummary`, `MigrationChecklistPanel`).
- [ ] Pipeline post-process legacy à parité complète (pixel/glitch/vignette exacts).
- [ ] Audio runtime branché (au-delà du scaffold d’UI/état).
- [ ] MIDI runtime branché.
- [ ] Export runtime branché.
- [ ] Persistance complète shader + audio + vidéo réellement connectée dans le flux principal.

### 0.2 Corrections de statut par rapport aux itérations précédentes
- [x] `ShaderControls` est stabilisé et typecheckable.
- [x] La checklist migration est visible dans l’UI.
- [x] Le snapshot legacy est visible dans l’UI.
- [ ] “Audio/export migré” est **à requalifier en partiel** : composant non branché dans la page, sans service runtime.
- [ ] “Persistance complète migrée” est **à requalifier en partiel** : hook limité aux `ShaderParams` et non intégré à la page.

---

## 1) Objectif produit (définition de fin)
La migration est considérée terminée uniquement si :
1. Toute orchestration runtime passe par composants/hooks/services React typés.
2. Les modules legacy JS (`App.js`, `AudioEngine.js`, `MidiHandler.js`, `VideoRecorder.js`, `WebGPUCompute.js`, `ShadertoyExporter.js`) ne pilotent plus l’application en production.
3. Les fonctionnalités historiques critiques sont présentes (ou explicitement supprimées avec décision documentée).
4. L’architecture cible est stable et maintenable (`features/`, `components/`, `hooks/`, `services/`, `state/`, `types/`).
5. Une stratégie de tests couvre rendu, interaction, persistance, audio/MIDI, export.

---

## 2) Inventaire ultra exhaustif (legacy → React)

### 2.1 Boot, routing, shell app
- **Legacy source**: `main.js` + initialisation legacy.
- **React cible**: `src/main.tsx`, `src/App.tsx`, `src/pages/Index.tsx`.
- **Statut**: ✅ **Migré intégralement**.
- **Justification**: entrée, providers, routing et page principale sont React-first.

### 2.2 Runtime graphique (scene, mesh, shader)
- **Legacy source**: `App.js`, `shaders.js`.
- **React cible**: `src/components/shader/BabylonCanvas.tsx` + `src/features/shader-studio/*`.
- **Statut**: 🟡 **Partiellement migré**.
- **Migré**:
  - lifecycle engine/scene/camera,
  - uniforms principaux,
  - changement de géométrie,
  - scale + autorotation runtime.
- **Restant critique**:
  - pipeline post-FX complet à parité legacy,
  - mode ShaderToy avancé/channels,
  - surface d’erreurs shader (compile/runtime) en UI.

### 2.3 Contrôles UI shader
- **Legacy source**: sections Tweakpane de `App.js`.
- **React cible**: `ShaderControls.tsx`.
- **Statut**: 🟡 **Partiellement migré**.
- **Migré**:
  - sélecteurs geometry/noise,
  - sliders principaux,
  - toggles wireframe/autorotate/post-FX.
- **Restant**:
  - contrôles avancés material/texture,
  - éditeur shader intégré,
  - structuration panneaux expert (tabs/responsive).

### 2.4 Audio
- **Legacy source**: `AudioEngine.js`.
- **React cible**: services + hooks audio dans `features/shader-studio`.
- **Statut**: ⛔ **Non migré runtime** (scaffold seulement).
- **Constat**: composant `AudioVideoControls` existe, mais pas de service WebAudio branché ni de mapping temps-réel effectif.

### 2.5 MIDI
- **Legacy source**: `MidiHandler.js`.
- **React cible**: `hooks/useMidiMapping.ts` + panneau.
- **Statut**: ⛔ **Non migré**.
- **Constat**: hook/panneau MIDI final absent du flux principal.

### 2.6 Export vidéo/image
- **Legacy source**: `VideoRecorder.js`, `ShadertoyExporter.js`.
- **React cible**: services export + UI progression.
- **Statut**: ⛔ **Non migré runtime**.
- **Constat**: pas de service MediaRecorder React ni progression/cancel actifs.

### 2.7 Persistance et état global
- **Legacy source**: blocs localStorage/history de `App.js`.
- **React cible**: state/store + hooks de persistance.
- **Statut**: 🟡 **Partiel**.
- **Constat**:
  - hook de persistance limité à `ShaderParams`,
  - pas de store unifié shader/audio/video/midi,
  - pas de versioning de schéma + migration old keys.

### 2.8 Legacy adaptation / couverture
- **Source**: `legacyConfig.ts`, `legacyAdapter.ts`, `migrationPlan.ts`.
- **Statut**: 🟡 **Partiel**.
- **Migré**: adaptation initiale de paramètres legacy vers `ShaderParams`.
- **Restant**: augmenter la couverture des paramètres non mappés et fiabiliser la mesure “migré/restant”.

---

## 3) Plan d’exécution mis à jour (cases cochées uniquement si fait intégralement)

## Phase A — Stabilisation architecture
- [ ] Créer la structure finale `features/shader-studio/{services,state,hooks,components,config,types}` avec séparation stricte runtime/UI.
- [ ] Introduire un store unique (Zustand ou reducer) pour shader/audio/midi/export.
- [ ] Brancher `useStudioPersistence` (ou son remplaçant) dans le flux principal.
- [ ] Ajouter versioning de persistance + migration automatique des schémas legacy.
- [ ] Supprimer les duplications d’état entre composants.

## Phase B — Parité visuelle shader
- [x] Stabiliser `ShaderControls` (suppression erreurs TS bloquantes).
- [x] Migrer le socle runtime Babylon React (scene/camera/mesh/uniforms principaux).
- [ ] Mapper 100% des géométries legacy encore absentes.
- [ ] Refaire pipeline post-FX à l’ordre/intensité legacy.
- [ ] Ajouter overlay d’erreurs shader compile/runtime.
- [ ] Ajouter presets visuels React (CRUD + restore).

## Phase C — Audio React complet
- [ ] Implémenter `audioEngineService` Web Audio.
- [ ] Brancher micro + fichier + pause/reprise.
- [ ] Calculer FFT + smoothing + beat detect.
- [ ] Connecter mapping bass/mid/high aux uniforms shader.
- [ ] Ajouter tests d’intégration audio simulée.

## Phase D — MIDI React complet
- [ ] Implémenter hook de lifecycle Web MIDI.
- [ ] Ajouter MIDI learn par contrôle.
- [ ] Ajouter table mapping éditable + persistée.
- [ ] Gérer reconnexion/déconnexion robustement.
- [ ] Ajouter tests Web MIDI mockés.

## Phase E — Export & recording
- [ ] Implémenter service export vidéo (MediaRecorder).
- [ ] Ajouter progression + cancel + états erreur.
- [ ] Ajouter export image PNG + export code shader.
- [ ] Vérifier compatibilité navigateurs supportés.

## Phase F — Hardening & QA
- [ ] Couvrir flows critiques en tests (unit + intégration + e2e ciblés).
- [ ] Nettoyer/supprimer fichiers legacy non utilisés en prod.
- [ ] Produire guide final de migration + changelog de fermeture.
- [ ] Préparer release candidate React-only.

---

## 4) Checklist d’acceptation finale

### 4.1 Fonctionnel
- [ ] Tous les contrôles UI React ont un effet visuel vérifié.
- [ ] Reload restaure l’état complet (shader/audio/midi/export).
- [ ] Audio mapping agit en temps réel sans freeze.
- [ ] MIDI learn fonctionne (device branché/débranché).
- [ ] Export vidéo/image génère des fichiers lisibles.

### 4.2 Technique
- [ ] Build, lint, typecheck, tests passent en CI.
- [ ] Aucune erreur runtime console en scénario nominal.
- [ ] Pas de fuite mémoire sur changements de scène/preset.
- [ ] Temps de frame stable sur sessions longues.

### 4.3 UX
- [ ] Navigation clavier acceptable.
- [ ] Lisibilité panneaux sur laptop et écrans plus petits.
- [ ] États d’erreur explicites (permissions audio, shader fail, export fail, MIDI indisponible).

---

## 5) Gouvernance de migration
- Chaque PR de migration doit :
  1. mettre à jour `src/features/shader-studio/config/migrationPlan.ts`,
  2. mettre à jour ce document `docs/REACT_MIGRATION_ROADMAP.md`,
  3. fournir checks/tests,
  4. expliciter ce qui reste.
- Interdiction de marquer une case “faite” si la fonctionnalité n’est pas branchée dans le flux principal de production.
