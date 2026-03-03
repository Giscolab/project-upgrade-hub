
# Plan de migration Shader Studio

## ✅ Couplage complet Geometry + Noise + Legacy Presets (DONE)

### Problèmes résolus

1. **Le dropdown Noise reconstruit maintenant le GLSL** : un `useEffect` sur `params.noise` appelle `buildLegacyShaderPair()` et recompile automatiquement.
2. **`applyLegacyPresetToShaderParams` est complet** : transmet `colorGrading` (lightIntensity, contrast, saturation, gamma, glowRadius), `color4` (uColorD), et `rimColor` (uRimColor).
3. **4ème couleur + rimColor dans le modèle React** : `ShaderColors` inclut `color4` et `rimColor`, lus directement par BabylonCanvas au lieu de valeurs calculées.

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| `src/types/shader.ts` | Ajout `color4` et `rimColor` à `ShaderColors` + defaults |
| `src/features/shader-studio/ShaderStudioPage.tsx` | useEffect rebuild shader sur changement de noise + import LEGACY_SHADER_CHUNKS |
| `src/features/shader-studio/config/legacyShaderStudioV5.ts` | `applyLegacyPresetToShaderParams` complété avec colorGrading + color4 + rimColor |
| `src/components/shader/BabylonCanvas.tsx` | uColorD et uRimColor lus depuis params.colors |
| `src/components/layout/RightPanel.tsx` | ColorSwatch D et Rim ajoutés |

## ✅ Contrôles Texture/Blend et Color Grading (DONE)

- Sliders Texture Mix, Layer Blend/Opacity, Light Intensity, Contrast, Saturation, Gamma, Glow Radius dans RightPanel
- Uniforms BabylonCanvas liés aux params au lieu de valeurs hardcodées
- PARAM_RANGE définis dans defaults.ts

## Prochaines étapes potentielles

- Persistance des presets en base Lovable Cloud
- Export GLSL standalone incluant les 4 couleurs + rimColor
- Snapshots visuels pour validation de parité legacy
