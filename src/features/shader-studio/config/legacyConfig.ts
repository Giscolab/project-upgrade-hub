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
  { id: 'uScale', name: 'Échelle', type: 'float', value: 2.0, min: 0.1, max: 10.0 },
  { id: 'uSpeed', name: 'Vitesse', type: 'float', value: 0.5, min: 0.0, max: 3.0 },
  { id: 'uDisplacementStrength', name: 'Déplacement', type: 'float', value: 0.4, min: 0.0, max: 3.0 },
  { id: 'wireframe', name: 'Wireframe', type: 'boolean', value: false },
  { id: 'autoRotate', name: 'Auto-Rotate', type: 'boolean', value: true },
  { id: 'vignetteMode', name: 'Vignette', type: 'boolean', value: true },
  { id: 'uColorA', name: 'Couleur A', type: 'color', value: '#000000' },
  { id: 'uColorB', name: 'Couleur B', type: 'color', value: '#210535' },
  { id: 'uColorC', name: 'Couleur C', type: 'color', value: '#05f2db' },
  { id: 'bgColor', name: 'Fond', type: 'color', value: '#050505' },
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
