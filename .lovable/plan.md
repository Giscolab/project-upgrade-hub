
# 🎨 Shader Studio — Portage React

## Phase 1 : Fondation & Canvas WebGL
- Layout principal plein écran avec thème sombre (glassmorphism fidèle au style actuel)
- Composant Canvas Babylon.js intégré dans React (rendu WebGL)
- Système de state management pour les paramètres du shader (vitesse, couleurs, bruit, géométrie)
- Loader GPU avec spinner d'initialisation

## Phase 2 : Éditeur de Code GLSL
- Intégration d'un éditeur de code React (CodeMirror 6 via @uiw/react-codemirror) avec coloration GLSL
- Panel latéral gauche rétractable avec header, toolbar (Compile, Import, Save, Clear, ShaderToy Mode)
- Compilation live du shader avec raccourci Ctrl+S
- Détection automatique du mode ShaderToy
- Modal d'export du code GLSL

## Phase 3 : Panneau de Contrôles UI
- Panel latéral droit rétractable avec les contrôles du shader
- Sélection de géométrie (18 formes), algorithmes de bruit (15), et presets (22)
- Sliders pour vitesse, amplitude, échelle, couleurs
- Contrôles de post-processing : Bloom, RGB Shift, Glitch, Pixel Art, Vignette
- Boutons toggle pour afficher/masquer les panels (éditeur et UI)

## Phase 4 : Audio Engine & Réactivité
- Intégration Web Audio API dans un hook React
- Analyse spectrale FFT avec séparation Bass / Mid / High
- Détection de BPM et flash sur le beat
- Support microphone et fichiers audio (drag & drop)
- Mapping dynamique audio → paramètres visuels

## Phase 5 : MIDI & Export
- Support Web MIDI API avec hook dédié
- Mode "Learn" pour mapper les contrôleurs physiques
- Export vidéo WebM/MP4 (60 FPS, jusqu'à 4K)
- Export image PNG haute résolution
- Indicateur d'enregistrement (REC)

## Phase 6 : Finitions
- Sauvegarde automatique des réglages (LocalStorage)
- Moniteurs de performance (FPS, latence)
- Drag & drop pour textures et fichiers audio sur le canvas
- Double-clic pour le plein écran
- Design responsive et toast d'erreurs
