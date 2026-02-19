import { DEFAULT_SHADER_PARAMS, ShaderParams } from '@/types/shader';
import { LEGACY_PARAMS } from './legacyConfig';

function findLegacyValue<T extends string | number | boolean>(id: string): T | undefined {
  const param = LEGACY_PARAMS.find((p) => p.id === id);
  return param?.value as T | undefined;
}

export function buildShaderParamsFromLegacy(): ShaderParams {
  const geometry = (findLegacyValue<string>('geometryType') ?? DEFAULT_SHADER_PARAMS.geometry) as ShaderParams['geometry'];
  const noise = (findLegacyValue<string>('noiseType') ?? DEFAULT_SHADER_PARAMS.noise) as ShaderParams['noise'];

  return {
    ...DEFAULT_SHADER_PARAMS,
    geometry,
    noise,
    speed: findLegacyValue<number>('uSpeed') ?? DEFAULT_SHADER_PARAMS.speed,
    amplitude: findLegacyValue<number>('uDisplacementStrength') ?? DEFAULT_SHADER_PARAMS.amplitude,
    scale: findLegacyValue<number>('uScale') ?? DEFAULT_SHADER_PARAMS.scale,
    wireframe: findLegacyValue<boolean>('wireframe') ?? DEFAULT_SHADER_PARAMS.wireframe,
    rotationSpeed: findLegacyValue<number>('rotationSpeed') ?? DEFAULT_SHADER_PARAMS.rotationSpeed,
    autoRotate: findLegacyValue<boolean>('autoRotate') ?? DEFAULT_SHADER_PARAMS.autoRotate,
    colors: {
      ...DEFAULT_SHADER_PARAMS.colors,
      color1: findLegacyValue<string>('uColorA') ?? DEFAULT_SHADER_PARAMS.colors.color1,
      color2: findLegacyValue<string>('uColorB') ?? DEFAULT_SHADER_PARAMS.colors.color2,
      color3: findLegacyValue<string>('uColorC') ?? DEFAULT_SHADER_PARAMS.colors.color3,
      background: findLegacyValue<string>('bgColor') ?? DEFAULT_SHADER_PARAMS.colors.background,
    },
    postProcessing: {
      ...DEFAULT_SHADER_PARAMS.postProcessing,
      vignette: findLegacyValue<boolean>('vignetteMode') ?? DEFAULT_SHADER_PARAMS.postProcessing.vignette,
      bloomIntensity: findLegacyValue<number>('bloomStrength') ?? DEFAULT_SHADER_PARAMS.postProcessing.bloomIntensity,
      glitchIntensity: findLegacyValue<number>('glitchAmount') ?? DEFAULT_SHADER_PARAMS.postProcessing.glitchIntensity,
      pixelSize: findLegacyValue<number>('pixelSize') ?? DEFAULT_SHADER_PARAMS.postProcessing.pixelSize,
      vignetteIntensity: findLegacyValue<number>('vignetteAmount') ?? DEFAULT_SHADER_PARAMS.postProcessing.vignetteIntensity,
    },
    material: {
      ...DEFAULT_SHADER_PARAMS.material,
      twist: findLegacyValue<number>('uTwist') ?? DEFAULT_SHADER_PARAMS.material.twist,
      pulse: findLegacyValue<number>('uPulse') ?? DEFAULT_SHADER_PARAMS.material.pulse,
      morphFactor: findLegacyValue<number>('uMorphFactor') ?? DEFAULT_SHADER_PARAMS.material.morphFactor,
      metalness: findLegacyValue<number>('uMetalness') ?? DEFAULT_SHADER_PARAMS.material.metalness,
      rimPower: findLegacyValue<number>('uRimPower') ?? DEFAULT_SHADER_PARAMS.material.rimPower,
      fresnelStrength: findLegacyValue<number>('uFresnelStrength') ?? DEFAULT_SHADER_PARAMS.material.fresnelStrength,
    },
  };
}

const MIGRATED_PARAM_IDS = new Set([
  'geometryType',
  'noiseType',
  'uScale',
  'uSpeed',
  'uDisplacementStrength',
  'wireframe',
  'autoRotate',
  'vignetteMode',
  'uColorA',
  'uColorB',
  'uColorC',
  'bgColor',
  'rotationSpeed',
  'bloomStrength',
  'glitchAmount',
  'pixelSize',
  'vignetteAmount',
  'uTwist',
  'uPulse',
  'uMorphFactor',
  'uMetalness',
  'uRimPower',
  'uFresnelStrength',
]);

export function getLegacyCoverage() {
  const migrated = LEGACY_PARAMS.filter((p) => MIGRATED_PARAM_IDS.has(p.id));
  const pending = LEGACY_PARAMS.filter((p) => !MIGRATED_PARAM_IDS.has(p.id));

  return {
    total: LEGACY_PARAMS.length,
    migratedCount: migrated.length,
    pendingCount: pending.length,
    pendingIds: pending.map((p) => p.id),
  };
}
