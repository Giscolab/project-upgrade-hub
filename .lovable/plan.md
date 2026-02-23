

# Plan de nettoyage et reorganisation du projet Shader Studio

## Diagnostic

Le projet contient **8 fichiers legacy JS a la racine** qui sont tous des "bridges" delegant deja vers le code React dans `src/`. Aucun d'entre eux ne contient de logique unique non couverte par React. En parallele, l'architecture React dans `src/` est fonctionnelle mais presente quelques warnings (refs sur composants fonctionnels).

### Fichiers legacy a la racine (tous des bridges)

| Fichier | Contenu reel | Equivalent React |
|---|---|---|
| `App.js` | Bridge qui importe `src/App.tsx` | Inutile, `src/main.tsx` est le vrai entrypoint |
| `main.js` | Instancie `App.js` | Inutile, `src/main.tsx` fait le travail |
| `Config.js` | Importe `src/features/.../legacyConfig.ts` | Pur re-export, zero logique propre |
| `shaders.js` | Re-exporte `src/types/shader.ts` | Pur re-export |
| `AudioEngine.js` | Classe audio legacy | Couvert par `useAudioReactiveRuntime.ts` + `audioRuntime.ts` |
| `MidiHandler.js` | Classe MIDI legacy | Couvert par `useMidiRuntime.ts` + `midiRuntime.ts` |
| `VideoRecorder.js` | Classe MediaRecorder | Couvert par `videoExportService.ts` |
| `ShadertoyExporter.js` | Bridge vers `shadertoyExportService.ts` | Pur re-export |
| `WebGPUCompute.js` | Bridge vers `webgpuComputeService.ts` | Pur re-export |
| `style.css` | 1 regle CSS (drag-over) | Peut etre integree dans `src/index.css` |

### Autres fichiers racine a nettoyer
- `favicon.ico` a la racine : doublon de `public/favicon.ico`
- `Snapshot.jpg` : asset a deplacer dans `public/`
- `ANALYSE_ULTRA_FINE.md` : doc a deplacer dans `docs/`

### Warnings console actuels
- `PanelSection` et `StatusBar` recoivent des refs sans `forwardRef` (warning React mineur)

---

## Plan d'execution (6 etapes)

### Etape 1 : Supprimer les bridges legacy JS de la racine

Supprimer les 9 fichiers suivants qui sont tous des wrappers vides delegant vers le code React :
- `App.js`
- `main.js`
- `Config.js`
- `shaders.js`
- `AudioEngine.js`
- `MidiHandler.js`
- `VideoRecorder.js`
- `ShadertoyExporter.js`
- `WebGPUCompute.js`

Aucune logique n'est perdue : chaque fichier est soit un re-export, soit une classe dont la logique complete existe deja dans `src/`.

### Etape 2 : Supprimer `style.css` et integrer la regle restante

Deplacer la seule regle CSS utile (`canvas.drag-over`) dans `src/index.css`, puis supprimer `style.css`.

### Etape 3 : Deplacer les assets et docs

- Deplacer `Snapshot.jpg` vers `public/snapshot.jpg`
- Deplacer `ANALYSE_ULTRA_FINE.md` vers `docs/ANALYSE_ULTRA_FINE.md`
- Supprimer le doublon `favicon.ico` a la racine (garder `public/favicon.ico`)

### Etape 4 : Nettoyer `index.html`

Verifier que `index.html` n'importe aucun fichier legacy. Actuellement c'est deja propre : il pointe sur `/src/main.tsx`.

### Etape 5 : Corriger les warnings React

Ajouter `forwardRef` a `PanelSection` et `StatusBar` pour eliminer les warnings de ref dans la console.

### Etape 6 : Mettre a jour la documentation de migration

- Mettre a jour `migrationPlan.ts` : passer les modules `AudioEngine`, `MidiHandler`, `VideoRecorder`, `ShadertoyExporter`, `WebGPUCompute`, `Config`, `shaders`, `main`, `App` en statut "done"
- Mettre a jour `docs/REACT_MIGRATION_ROADMAP.md` : cocher les gates correspondantes
- Mettre a jour `roadmap.md` pour refleter l'etat reel

---

## Details techniques

### Justification de suppression pour chaque fichier legacy

**AudioEngine.js** : La classe utilise `getUserMedia`, `AudioContext`, `AnalyserNode`, FFT, smoothing, et bands. Tout cela est couvert par :
- `src/features/shader-studio/hooks/useAudioReactiveRuntime.ts` (hook React avec state)
- `src/features/shader-studio/hooks/audioRuntime.ts` (factory pour AudioContext)
- Le smoothing legacy (coefficients 0.75/0.7/0.65) differe legerement du runtime React (qui utilise les valeurs FFT directes), mais c'est un choix de design documente.

**MidiHandler.js** : Couvert par `useMidiRuntime.ts` + `midiRuntime.ts`. Le hook gere `requestMIDIAccess`, binding inputs, CC parsing, normalisation 0-127.

**VideoRecorder.js** : Couvert par `videoExportService.ts` avec en plus le support `AbortController` et la progression temps reel.

**Config.js / shaders.js / ShadertoyExporter.js / WebGPUCompute.js** : Purs re-exports qui importent depuis `src/`.

**App.js / main.js** : Bridges legacy. Le vrai entrypoint est `src/main.tsx` -> `src/App.tsx` -> `Index` -> `ShaderStudioPage`.

### Structure finale propre

```text
project-root/
  index.html            (pointe vers src/main.tsx)
  public/
    favicon.ico
    snapshot.jpg
  docs/
    ANALYSE_ULTRA_FINE.md
    MIGRATION_RECAP.md
    REACT_MIGRATION_ROADMAP.md
    migration-evidence/
  src/
    main.tsx              (entrypoint React)
    App.tsx               (routing)
    index.css             (styles globaux + drag-over)
    components/
      layout/             (AppLayout, AppHeader, StatusBar, RightPanel)
      shader/             (BabylonCanvas, GPULoader)
      ui/                 (composants generiques)
    features/
      shader-studio/
        ShaderStudioPage.tsx
        components/       (GlslEditorPanel, CanvasOverlay, etc.)
        config/           (defaults, legacyConfig, legacyAdapter, etc.)
        hooks/            (audio, midi, persistence)
        services/         (export video/png/shadertoy/webgpu)
        types.ts
    types/
      shader.ts
```

Aucun fichier `.js` legacy ne restera a la racine. L'application sera 100% pilotee par le pipeline React/Vite.

