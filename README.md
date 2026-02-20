# Shader Studio v5

> Éditeur de shaders procéduraux temps réel orienté VJ/performance live, en migration active vers React + TypeScript + Vite.

![Version](https://img.shields.io/badge/version-0.0.0-blue)
![Licence](https://img.shields.io/badge/licence-MIT-green)
![WebGL](https://img.shields.io/badge/WebGL-2.0-orange)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF)

## État du projet

Le runtime principal est déjà branché sur l’application React/TypeScript (`src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx` → `ShaderStudioPage`).

Sur le plan de migration, `migrationPlan.ts` indique **2 domaines terminés** (`audio-engine`, `preset-storage`) et **5 domaines en cours** (`render-core`, `ui-controls`, `midi`, `video-export`, `shadertoy-webgpu`).

Concrètement: le flux React est opérationnel pour le rendu, l’audio-réactivité, une partie MIDI, les exports et la persistance; la parité complète avec le legacy reste en cours sur certains contrôles/validations.  
➡️ Détail et suivi complet: `docs/REACT_MIGRATION_ROADMAP.md`.

## Fonctionnalités actives

- 🎨 **Rendu Babylon.js dans React** (`BabylonCanvas` + orchestration `ShaderStudioPage`)
- 🎧 **Audio-réactivité**: micro + source fichier + FFT + beat detect
- 🎛️ **MIDI runtime**: lifecycle + événements CC + statut UI (MIDI learn/persistance encore en cours)
- 🎬 **Export vidéo** via `MediaRecorder` (progression + annulation)
- 🧪 **Export ShaderToy** depuis les paramètres shader React
- 🖼️ **Export PNG** du canvas (avec fallback)
- 💾 **Persistance versionnée** de l’état studio
- ↩️ **Undo/Redo** (UI + raccourcis clavier)
- 📚 **Presets nommés** (save/load/delete)

## Stack technique

Stack active:

- **React 18.3.1** + **TypeScript 5.8.3** + **Vite 5.4.19**
- **Babylon.js (`@babylonjs/core` 8.52.0)** pour le rendu
- **Web Audio API** pour l’analyse temps réel
- **Web MIDI API** pour les entrées contrôleur
- **MediaRecorder API** pour la capture vidéo

Les fichiers legacy JavaScript à la racine (`App.js`, `AudioEngine.js`, `MidiHandler.js`, etc.) sont conservés comme **bridges temporaires** pendant la décommission progressive.

## Lancer le projet

Prérequis:

- **Node.js**: aucune contrainte `engines` n’est déclarée dans `package.json` (utiliser une version compatible outillage moderne Vite/TypeScript)
- **npm**

Installation:

```bash
npm install
```

Modes d’exécution supportés:

1. Développement

```bash
npm run dev
```

2. Build + preview

```bash
npm run build && npm run preview
```

3. Service du build `dist`

```bash
npm run serve:dist
```

## Structure du projet

```text
.
├── src/
│   ├── main.tsx                         # Entrée React
│   ├── App.tsx                          # Router principal
│   ├── pages/Index.tsx                  # Point d’entrée page studio
│   ├── components/shader/               # BabylonCanvas + loader GPU
│   └── features/shader-studio/
│       ├── ShaderStudioPage.tsx         # Runtime React principal
│       ├── components/                  # Panneaux de contrôle/UI studio
│       ├── hooks/                       # Audio, MIDI, persistance
│       ├── services/                    # Export vidéo/PNG/ShaderToy, WebGPU
│       └── config/                      # Plan de migration, defaults, état
├── docs/
│   ├── REACT_MIGRATION_ROADMAP.md       # Source de vérité migration
│   └── migration-evidence/              # Preuves des gates par module legacy
├── App.js                               # Legacy bridge temporaire
├── AudioEngine.js                       # Legacy bridge temporaire
├── MidiHandler.js                       # Legacy bridge temporaire
├── VideoRecorder.js                     # Legacy bridge temporaire
├── ShadertoyExporter.js                 # Legacy bridge temporaire
├── WebGPUCompute.js                     # Legacy bridge temporaire
├── Config.js                            # Legacy bridge temporaire
├── shaders.js                           # Legacy bridge temporaire
└── main.js                              # Legacy bridge temporaire
```

## Migration en cours

La migration suit une stratégie de **parité fonctionnelle sans régression**: le flux React remplace progressivement les modules legacy tout en gardant les bridges temporaires opérationnels.

La suppression d’un fichier legacy n’est autorisée qu’après passage de la procédure de validation en **7 gates** (inventaire, mapping, preuves, synchronisation plan/docs, PR dédiée).  
La référence de pilotage reste `docs/REACT_MIGRATION_ROADMAP.md`, avec l’état technique courant dans `src/features/shader-studio/config/migrationPlan.ts`.

## Contribution

Voir `CONTRIBUTING.md`.  
Conventions de commits: `feat|fix|docs|refactor|chore(<domaine>): ...`.  
Toute suppression d’un fichier legacy requiert la validation des **7 gates**.

## Licence

MIT — voir [LICENSE](LICENSE).
