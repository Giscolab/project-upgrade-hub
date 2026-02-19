# Roadmap exhaustive — Migration complète vers React (Shader Studio)

## 1) Objectif produit (définition de fin)
La migration est considérée **terminée** uniquement si :
1. Toute orchestration runtime passe par des composants/hooks/services React typés.
2. Les modules legacy JS (`App.js`, `AudioEngine.js`, `MidiHandler.js`, `VideoRecorder.js`, `WebGPUCompute.js`, `ShadertoyExporter.js`) ne pilotent plus l'application en production.
3. Les fonctionnalités historiques critiques sont présentes (ou explicitement supprimées avec décision produit documentée).
4. L'arborescence source est cohérente et maintenable : `features/`, `components/`, `hooks/`, `services/`, `state/`, `types/`.
5. Une stratégie de tests couvre rendu, interaction, persistance, export et intégrations matérielles (audio/MIDI).

---

## 2) Inventaire de migration (source legacy → cible React)

### 2.1 Runtime graphique
- **Legacy source**: `App.js`, `shaders.js`.
- **Cible React**: `src/components/shader/BabylonCanvas.tsx` + `src/features/shader-studio/*`.
- **Déjà migré**:
  - lifecycle canvas React,
  - uniforms principaux,
  - sélection de géométrie,
  - scale runtime.
- **À migrer**:
  - pipeline post-process avancé (glitch/pixel/vignette parity),
  - mode ShaderToy complet,
  - gestion erreurs shader + fallback UI.

### 2.2 Contrôles UI
- **Legacy source**: sections Tweakpane dans `App.js`.
- **Cible React**: `ShaderControls.tsx`, `AudioVideoControls.tsx`, futurs panneaux (MIDI, export, debug).
- **Déjà migré**:
  - contrôles principaux shader,
  - couleurs,
  - toggles post-FX,
  - audio/export scaffold.
- **À migrer**:
  - panneaux expert (material, texture layers, automation),
  - éditeur shader avec validation,
  - regroupement par onglets + responsive.

### 2.3 Audio
- **Legacy source**: `AudioEngine.js`.
- **Cible React**: `features/shader-studio/services/audioEngineService.ts` + hooks.
- **À faire**:
  - wrapper Web Audio API,
  - analyse FFT continue,
  - mapping bandes → uniforms,
  - monitoring + permissions mic/fichier.

### 2.4 MIDI
- **Legacy source**: `MidiHandler.js`.
- **Cible React**: `hooks/useMidiMapping.ts` + panneau React.
- **À faire**:
  - connexion/déconnexion devices,
  - MIDI learn,
  - persistance mapping,
  - monitor évènements en UI.

### 2.5 Export vidéo / image
- **Legacy source**: `VideoRecorder.js`, `ShadertoyExporter.js`.
- **Cible React**: services d'export + états de progression.
- **À faire**:
  - capture MediaRecorder,
  - presets bitrate/résolution,
  - annulation et reprise,
  - export code shader propre.

### 2.6 WebGPU compute
- **Legacy source**: `WebGPUCompute.js`.
- **Cible React**: module optionnel `services/webgpuComputeService.ts`.
- **À faire**:
  - détection support,
  - activation/désactivation runtime,
  - fallback WebGL propre.

---

## 3) Plan d'exécution ultra fin (phases + tâches atomiques)

## Phase A — Stabilisation architecture (Semaine 1)
- [ ] Créer structure `features/shader-studio/{services,state,hooks,components,config,types}` finale.
- [ ] Introduire un store unique (React state + reducer ou Zustand) pour shader/audio/midi/export.
- [ ] Supprimer la logique d'état dupliquée entre composants.
- [ ] Ajouter schéma de version des données persistées.
- [ ] Ajouter migration automatique des clés localStorage legacy.

## Phase B — Parité visuelle shader (Semaines 1–2)
- [ ] Mapper toutes les géométries legacy à des builders Babylon.
- [ ] Migrer tous les uniforms legacy manquants (twist/pulse/morph/material).
- [ ] Refaire pipeline post-FX (ordre exact, intensités, toggles).
- [ ] Ajouter diagnostics shader compile/runtime en overlay.
- [ ] Ajouter presets visuels React (CRUD).

## Phase C — Audio React complet (Semaines 2–3)
- [ ] Implémenter `audioEngineService`.
- [ ] Brancher micro + fichier + pause/reprise.
- [ ] Calculer FFT + smooth + beat detect.
- [ ] Connecter mapping bass/mid/high vers paramètres shader.
- [ ] Ajouter tests d'intégration audio simulée.

## Phase D — MIDI React complet (Semaines 3–4)
- [ ] Implémenter `useMidiMapping`.
- [ ] Ajouter mode learn par contrôle.
- [ ] Ajouter table mapping editable.
- [ ] Sauvegarder/restaurer mapping MIDI.
- [ ] Ajouter tests (mock Web MIDI).

## Phase E — Export & recording (Semaines 4–5)
- [ ] Implémenter service export vidéo.
- [ ] Ajouter UI progression + cancel.
- [ ] Ajouter export image PNG et export code shader.
- [ ] Valider compat navigateur (Chrome/Edge/Firefox si possible).

## Phase F — Hardening & QA (Semaine 6)
- [ ] Couvrir flows critiques en test E2E.
- [ ] Nettoyer fichiers legacy non utilisés.
- [ ] Produire guide de migration final + changelog.
- [ ] Préparer release candidate React-only.

---

## 4) Critères de validation (checklist d'acceptation)

## 4.1 Fonctionnel
- [ ] Tous les contrôles affichés modifient le rendu.
- [ ] Sauvegarde/rechargement restaure l'état complet.
- [ ] Audio mapping agit en temps réel sans freeze.
- [ ] MIDI learn fonctionne device connecté/déconnecté.
- [ ] Export vidéo/image produit fichiers lisibles.

## 4.2 Technique
- [ ] Build CI passe.
- [ ] Lint/Typecheck passent.
- [ ] Aucune erreur runtime console en usage nominal.
- [ ] Pas de fuite mémoire sur changement de scène/preset.

## 4.3 UX
- [ ] Navigation clavier acceptable.
- [ ] Panneaux lisibles sur écrans laptop.
- [ ] États d'erreur explicites (audio permission, shader fail, export fail).

---

## 5) Risques et mitigation
- **Risque**: dépendances navigateur (MIDI, MediaRecorder, WebGPU).
  - **Mitigation**: feature flags + fallback + messages d'état.
- **Risque**: divergence visuelle avec legacy.
  - **Mitigation**: snapshots visuels de référence par preset.
- **Risque**: dette de migration silencieuse.
  - **Mitigation**: checklist versionnée + statut obligatoire par module.

---

## 6) Gouvernance de migration (pour ne rien oublier)
- Chaque PR migration doit :
  1. mettre à jour `migrationPlan.ts`,
  2. mettre à jour cette roadmap,
  3. inclure tests/checks,
  4. préciser explicitement ce qui reste.
- Interdiction d'ajouter une feature sans définir sa place dans la cible React.

