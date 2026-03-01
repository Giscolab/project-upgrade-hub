

# Implement Texture/Blend Controls in ShaderControls

## Context

The BabylonCanvas renderer already declares and sets uniforms for texture mixing, layer blending, and color grading -- but they are all hardcoded to static values (e.g. `uTextureMix = 0.0`, `uContrast = 1.0`). These need to be exposed as user-controllable parameters.

## Changes

### 1. Extend `ShaderParams` type (`src/types/shader.ts`)

Add a new `TextureBlendParams` interface and include it in `ShaderParams`:

```typescript
interface TextureBlendParams {
  textureMix: number;       // 0-1, how much texture vs procedural
  layerBlend1: number;      // 0-1, blend mode for layer 1
  layerBlend2: number;      // 0-1, blend mode for layer 2
  layerOpacity1: number;    // 0-1
  layerOpacity2: number;    // 0-1
}

interface ColorGradingParams {
  lightIntensity: number;   // 0-3
  contrast: number;         // 0.5-2
  saturation: number;       // 0-2
  gamma: number;            // 0.5-3
  glowRadius: number;       // 0-2
}
```

Add to `ShaderParams`:
- `textureBlend: TextureBlendParams`
- `colorGrading: ColorGradingParams`

Add defaults in `DEFAULT_SHADER_PARAMS`.

### 2. Update BabylonCanvas (`src/components/shader/BabylonCanvas.tsx`)

Replace the hardcoded uniform values with reads from `params.textureBlend` and `params.colorGrading`:
- `uTextureMix` <- `p.textureBlend.textureMix`
- `uLayerBlend1` <- `p.textureBlend.layerBlend1`
- `uLayerBlend2` <- `p.textureBlend.layerBlend2`
- `uLayerOpacity1` <- `p.textureBlend.layerOpacity1`
- `uLayerOpacity2` <- `p.textureBlend.layerOpacity2`
- `uLightIntensity` <- `p.colorGrading.lightIntensity`
- `uContrast` <- `p.colorGrading.contrast`
- `uSaturation` <- `p.colorGrading.saturation`
- `uGamma` <- `p.colorGrading.gamma`
- `uGlowRadius` <- `p.colorGrading.glowRadius`

### 3. Add controls to ShaderControls (`src/features/shader-studio/components/ShaderControls.tsx`)

Add two new collapsible sections using the existing `ParamSlider` component:

**"Texture / Blend" section** with sliders for:
- Texture Mix (0-1)
- Layer 1 Blend (0-1)
- Layer 2 Blend (0-1)
- Layer 1 Opacity (0-1)
- Layer 2 Opacity (0-1)

**"Color Grading" section** with sliders for:
- Light Intensity (0-3)
- Contrast (0.5-2)
- Saturation (0-2)
- Gamma (0.5-3)
- Glow Radius (0-2)

Both sections follow the existing pattern of bordered rounded sections with a label, identical to the current "Material" and "Post FX intensity" sections.

### 4. Update defaults config (`src/features/shader-studio/config/defaults.ts`)

Add `PARAM_RANGE` entries for all new sliders.

### Files modified (4 files)
- `src/types/shader.ts` -- new interfaces + defaults
- `src/components/shader/BabylonCanvas.tsx` -- read from params instead of hardcoded
- `src/features/shader-studio/components/ShaderControls.tsx` -- new UI sections
- `src/features/shader-studio/config/defaults.ts` -- param ranges

