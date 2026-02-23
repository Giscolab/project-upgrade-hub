# Shader Studio v5

> Éditeur de shaders procéduraux temps réel orienté VJ/performance live, porté sur React + TypeScript + Vite.

![Version](https://img.shields.io/badge/version-0.0.0-blue)
![Licence](https://img.shields.io/badge/licence-MIT-green)
![WebGL](https://img.shields.io/badge/WebGL-2.0-orange)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF)

## État du projet

Le runtime principal est branché sur l’application React/TypeScript (`src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx` → `ShaderStudioPage`).

Sur le plan de migration, `migrationPlan.ts` indique **7 domaines terminés**, sans domaine `in_progress` ni `pending`.

Concrètement: le flux React couvre le rendu, les contrôles UI, l’audio-réactivité, MIDI, les exports (vidéo/PNG/ShaderToy/WebGPU) et la persistance studio.  
➡️ Détail et suivi complet: `docs/REACT_MIGRATION_ROADMAP.md`.

## Fonctionnalités actives

- 🎨 **Rendu Babylon.js dans React** (`BabylonCanvas` + orchestration `ShaderStudioPage`)
- 🎧 **Audio-réactivité**: micro + source fichier + FFT + beat detect
- 🎛️ **MIDI runtime**: lifecycle + événements CC + statut UI
- 🎬 **Export vidéo** via `MediaRecorder` (progression + annulation)
- 🧪 **Export ShaderToy** depuis les paramètres shader React
- 🖼️ **Export PNG** du canvas (avec fallback)
- 💾 **Persistance versionnée** de l’état studio
- ↩️ **Undo/Redo** (UI + raccourcis clavier)
- 📚 **Presets nommés** (save/load/delete)

## Stack technique

Stack active:

- **React 18.3.1** + **TypeScript 5.8.3** + **Vite 7.3.1**
- **Babylon.js (`@babylonjs/core` 8.52.0)** pour le rendu
- **Web Audio API** pour l’analyse temps réel
- **Web MIDI API** pour les entrées contrôleur
- **MediaRecorder API** pour la capture vidéo

Les bridges JavaScript legacy historiques (`App.js`, `AudioEngine.js`, `MidiHandler.js`, etc.) ont été retirés : le runtime React/TypeScript est désormais la référence active.

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
├── src/test/                            # Tests Vitest (services export, etc.)
├── CONTRIBUTING.md                      # Guide de contribution
└── CHANGELOG.md                         # Historique des évolutions
```

## Migration

La migration vers React/TypeScript est finalisée dans le plan courant (`done` sur tous les domaines du fichier `migrationPlan.ts`).

La stratégie de validation reste documentée (procédure en **7 gates** + preuves de parité dans `docs/migration-evidence/`).  
Les références de pilotage sont `docs/REACT_MIGRATION_ROADMAP.md` et `src/features/shader-studio/config/migrationPlan.ts`.

## Contribution

Voir `CONTRIBUTING.md`.  
Conventions de commits: `feat|fix|docs|refactor|chore(<domaine>): ...`.  
Toute suppression d’un fichier legacy requiert la validation des **7 gates**.

## Licence

MIT — voir [LICENSE](LICENSE).
