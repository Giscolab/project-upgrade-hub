# 🎨 Shader Studio v5 (React Migration)

> Éditeur de shaders procéduraux en migration vers une architecture React + Vite.

![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![WebGL](https://img.shields.io/badge/WebGL-2.0-orange.svg)

## ✅ État actuel du projet

Le runtime **actuel** est React (entrée `src/main.tsx`) avec Vite.

- Le code legacy (`App.js`, `main.js`, `style.css`, etc.) reste présent pour compatibilité et migration.
- L'UI active est la page React `src/features/shader-studio/ShaderStudioPage.tsx`.
- Lancer simplement `npx serve` à la racine peut échouer (notamment erreur MIME sur `main.tsx`) car ce n'est pas le flux recommandé pour Vite en source.

## 🚀 Lancer le projet correctement

### 1) Développement (recommandé)

```bash
npm install
npm run dev
```

Ouvrir ensuite l'URL affichée par Vite (en général `http://localhost:5173`).

### 2) Mode “serve” (production locale)

Si tu veux utiliser `serve`, il faut servir le **build** (`dist`) et pas les sources:

```bash
npm run serve:dist
```

Ce script exécute `vite build` puis `npx serve dist -s -l 4173`.

### 3) Alternative preview Vite

```bash
npm run build
npm run preview
```

## 🧭 Pourquoi `npx serve` seul ne marche pas toujours

`npx serve` à la racine sert les fichiers source bruts. Or une app Vite/React attend une transformation/module resolution que ce mode ne garantit pas (d'où erreurs de chargement module/MIME selon contexte). En migration React, il faut passer par `vite` (`dev`/`build`/`preview`).

## 📂 Structure (migration)

```txt
/
├── index.html                       # Shell HTML Vite
├── src/main.tsx                     # Entrée React actuelle
├── src/App.tsx                      # Routing React
├── src/features/shader-studio/*     # UI/logic React principale
├── App.js, main.js, style.css       # Couche legacy conservée pour migration
└── docs/                            # Documentation de migration
```

## 🤝 Contribution

Les contributions sont bienvenues. En priorité: stabilisation React, réduction du legacy DOM, et validation runtime WebGL/WebGPU.

## 📜 Licence

MIT.
