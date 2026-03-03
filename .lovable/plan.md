

# Couplage complet Geometry + Noise + Legacy Presets

## Probleme identifie

Trois causes racines expliquent pourquoi les selections ne s'appliquent pas :

1. **Le dropdown Noise ne reconstruit pas les shaders GLSL** : quand on change le type de bruit (ex: cellular), seul `params.noise` est mis a jour dans le state React. Le code GLSL (`vertexShader`/`fragmentShader`) reste inchange. La fonction `buildLegacyShaderPair(noiseType)` n'est appelee que lors de l'application d'un preset legacy, jamais lors d'un changement de dropdown.

2. **`applyLegacyPresetToShaderParams` est incomplet** : il ne transmet pas `colorGrading` (lightIntensity, contrast, saturation, gamma, glowRadius) ni `uColorD` (4eme couleur) ni `uRimColor` depuis les presets legacy.

3. **Pas de 4eme couleur dans le modele React** : le preset legacy definit `uColorD` et `uRimColor` mais `ShaderColors` n'a que 3 couleurs. Le canvas calcule `uColorD` comme moyenne des 3 couleurs, ce qui perd la valeur du preset.

## Plan d'implementation

### Etape 1 : Ajouter `color4` et `rimColor` au type ShaderColors

**Fichier** : `src/types/shader.ts`

Ajouter deux champs optionnels :
```typescript
interface ShaderColors {
  color1: string;
  color2: string;
  color3: string;
  color4: string;    // nouveau - uColorD
  background: string;
  rimColor: string;  // nouveau - uRimColor
}
```

Mettre a jour `DEFAULT_SHADER_PARAMS` avec des valeurs par defaut.

### Etape 2 : Reconstruire les shaders quand le noise change via dropdown

**Fichier** : `src/features/shader-studio/ShaderStudioPage.tsx`

Ajouter un `useEffect` qui reagit aux changements de `params.noise` :
```typescript
useEffect(() => {
  // Quand le noise type change, reconstruire le shader pair
  const noiseType = params.noise as LegacyNoise;
  if (LEGACY_SHADER_CHUNKS[noiseType]) {
    const { vertex, fragment } = buildLegacyShaderPair(noiseType);
    setVertexShader(vertex);
    setFragmentShader(fragment);
    setCompileKey(k => k + 1);
  }
}, [params.noise]);
```

Cela garantit que selectionner "cellular" dans le dropdown reconstruit immediatement le GLSL avec le bon chunk de bruit.

### Etape 3 : Completer `applyLegacyPresetToShaderParams`

**Fichier** : `src/features/shader-studio/config/legacyShaderStudioV5.ts`

Ajouter les champs manquants dans la fonction `applyLegacyPresetToShaderParams` :
- `colorGrading.lightIntensity` depuis `preset.uLightIntensity`
- `colorGrading.contrast` depuis `preset.uContrast`
- `colorGrading.saturation` depuis `preset.uSaturation`
- `colorGrading.gamma` depuis `preset.uGamma`
- `colorGrading.glowRadius` depuis `preset.uGlowRadius`
- `colors.color4` depuis `rgbToHex(preset.uColorD)`
- `colors.rimColor` depuis `rgbToHex(preset.uRimColor)`

### Etape 4 : Utiliser color4 et rimColor dans BabylonCanvas

**Fichier** : `src/components/shader/BabylonCanvas.tsx`

Remplacer le calcul de `uColorD` (actuellement la moyenne des 3 couleurs) par la lecture de `p.colors.color4` :
```typescript
const c4 = hexToVec3(p.colors.color4);
material.setVector3('uColorD', new Vector3(c4[0], c4[1], c4[2]));
```

Remplacer `uRimColor` (actuellement = color3) par `p.colors.rimColor`.

### Etape 5 : Ajouter les controles UI pour color4 et rimColor

**Fichier** : `src/components/layout/RightPanel.tsx`

Ajouter deux ColorSwatch supplementaires dans la section "Couleurs" :
- "D" pour `color4`
- "Rim" pour `rimColor`

### Fichiers modifies (5 fichiers)

| Fichier | Modification |
|---|---|
| `src/types/shader.ts` | Ajouter `color4` et `rimColor` a `ShaderColors` |
| `src/features/shader-studio/ShaderStudioPage.tsx` | useEffect pour rebuild shader sur changement de noise |
| `src/features/shader-studio/config/legacyShaderStudioV5.ts` | Completer `applyLegacyPresetToShaderParams` avec colorGrading + colors |
| `src/components/shader/BabylonCanvas.tsx` | Lire `color4` et `rimColor` depuis params |
| `src/components/layout/RightPanel.tsx` | Ajouter ColorSwatch pour D et Rim |

### Resultat attendu

- Changer le noise dans le dropdown reconstruit immediatement le shader GLSL correspondant
- Changer la geometrie continue de fonctionner (deja operationnel)
- Appliquer un preset legacy applique TOUS les parametres : geometrie, noise, 4 couleurs, rimColor, colorGrading, material, postProcessing
- Les selections manuelles (ex: trefoil + cellular) fonctionnent independamment des presets

