export interface LegacySelectParam {
  id: string;
  name: string;
  type: 'select';
  value: string;
  options: Record<string, string>;
}

export interface LegacyFloatParam {
  id: string;
  name: string;
  type: 'float';
  value: number;
  min: number;
  max: number;
}

export interface LegacyBooleanParam {
  id: string;
  name: string;
  type: 'boolean';
  value: boolean;
}

export interface LegacyColorParam {
  id: string;
  name: string;
  type: 'color';
  value: string;
}

export type LegacyParam = LegacySelectParam | LegacyFloatParam | LegacyBooleanParam | LegacyColorParam;

export const LEGACY_PARAMS: LegacyParam[] = [
  { id: 'geometryType', name: 'Géométrie', type: 'select', value: 'sphere', options: { Plane: 'plane', Sphere: 'sphere', Torus: 'torus', Cone: 'cone', Cylinder: 'cylinder', Capsule: 'capsule' } },
  { id: 'noiseType', name: 'Shader', type: 'select', value: 'simplex', options: { Simplex: 'simplex', Voronoi: 'voronoi', FBM: 'fbm', Ridged: 'ridged', 'Domain Warp': 'domain_warp' } },

  { id: 'uColorA', name: 'Couleur A', type: 'color', value: '#000000' },
  { id: 'uColorB', name: 'Couleur B', type: 'color', value: '#210535' },
  { id: 'uColorC', name: 'Couleur C', type: 'color', value: '#05f2db' },
  { id: 'uColorD', name: 'Couleur D', type: 'color', value: '#ffffff' },

  { id: 'uScale', name: 'Échelle', type: 'float', value: 2.0, min: 0.1, max: 10.0 },
  { id: 'uSpeed', name: 'Vitesse', type: 'float', value: 0.5, min: 0, max: 3 },
  { id: 'uTwist', name: 'Twist', type: 'float', value: 0, min: -5, max: 5 },
  { id: 'uPulse', name: 'Pulsation', type: 'float', value: 2, min: 0, max: 10 },
  { id: 'uMorphFactor', name: 'Morph', type: 'float', value: 0, min: 0, max: 1 },
  { id: 'uDisplacementStrength', name: 'Déplacement', type: 'float', value: 0.4, min: 0, max: 3 },

  { id: 'uMetalness', name: 'Métal', type: 'float', value: 0, min: 0, max: 1 },
  { id: 'uLightIntensity', name: 'Lumière', type: 'float', value: 1.2, min: 0, max: 3 },
  { id: 'uRimPower', name: 'Rim Power', type: 'float', value: 3, min: 1, max: 12 },
  { id: 'uFresnelStrength', name: 'Fresnel', type: 'float', value: 4, min: 1, max: 14 },

  { id: 'uContrast', name: 'Contraste', type: 'float', value: 1.1, min: 0.5, max: 3 },
  { id: 'uSaturation', name: 'Saturation', type: 'float', value: 1.3, min: 0, max: 3 },
  { id: 'uGamma', name: 'Gamma', type: 'float', value: 1.1, min: 0.4, max: 2.5 },

  { id: 'cyberpunkMode', name: 'RGB Shift', type: 'boolean', value: false },
  { id: 'glitchMode', name: 'Glitch', type: 'boolean', value: false },
  { id: 'pixelMode', name: 'Pixel', type: 'boolean', value: false },
  { id: 'vignetteMode', name: 'Vignette', type: 'boolean', value: true },
  { id: 'wireframe', name: 'Wireframe', type: 'boolean', value: false },
  { id: 'autoRotate', name: 'Auto-Rotate', type: 'boolean', value: true },

  { id: 'bgColor', name: 'Fond', type: 'color', value: '#050505' },
  { id: 'rotationSpeed', name: 'Vitesse Rotation', type: 'float', value: 0.3, min: 0, max: 3 },

  { id: 'bloomStrength', name: 'Bloom Force', type: 'float', value: 1.2, min: 0, max: 5 },
  { id: 'glitchAmount', name: 'Glitch Force', type: 'float', value: 0.5, min: 0, max: 1 },
  { id: 'pixelSize', name: 'Pixel Size', type: 'float', value: 4, min: 1, max: 32 },
  { id: 'vignetteAmount', name: 'Vignette Amount', type: 'float', value: 0.5, min: 0, max: 2 },
];

export const LEGACY_AUDIO_DEFAULTS = {
  mapBassTo: 'displacement',
  mapMidTo: 'speed',
  mapHighTo: 'scale',
  gainBass: 2,
  gainMid: 1.5,
  gainHigh: 1,
};

export const LEGACY_VIDEO_DEFAULTS = {
  duration: 10,
  compression: 'Haute qualité',
  resolution: 'Source (native)',
  fps: 60,
};
