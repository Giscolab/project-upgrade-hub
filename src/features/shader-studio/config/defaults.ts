import { GeometryType, NoiseAlgorithm, ShaderParams } from '@/types/shader';

export const GEOMETRY_OPTIONS: { value: GeometryType; label: string }[] = [
  { value: 'sphere', label: 'Sphere' },
  { value: 'box', label: 'Box' },
  { value: 'torus', label: 'Torus' },
  { value: 'plane', label: 'Plane' },
  { value: 'cylinder', label: 'Cylinder' },
  { value: 'cone', label: 'Cone' },
  { value: 'torusKnot', label: 'Torus Knot' },
  { value: 'icosphere', label: 'Icosphere' },
  { value: 'octahedron', label: 'Octahedron' },
  { value: 'dodecahedron', label: 'Dodecahedron' },
  { value: 'tetrahedron', label: 'Tetrahedron' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'disc', label: 'Disc' },
  { value: 'ground', label: 'Ground' },
  { value: 'hemisphere', label: 'Hemisphere' },
];

export const NOISE_OPTIONS: { value: NoiseAlgorithm; label: string }[] = [
  { value: 'perlin', label: 'Perlin' },
  { value: 'simplex', label: 'Simplex' },
  { value: 'worley', label: 'Worley' },
  { value: 'fbm', label: 'FBM' },
  { value: 'voronoi', label: 'Voronoi' },
  { value: 'ridged', label: 'Ridged' },
  { value: 'turbulence', label: 'Turbulence' },
  { value: 'domain_warp', label: 'Domain Warp' },
  { value: 'curl', label: 'Curl' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'value', label: 'Value' },
  { value: 'wavelet', label: 'Wavelet' },
  { value: 'gabor', label: 'Gabor' },
  { value: 'blue', label: 'Blue' },
  { value: 'white', label: 'White' },
];

export const PARAM_RANGE = {
  speed: { min: 0, max: 4, step: 0.01 },
  amplitude: { min: 0, max: 2, step: 0.01 },
  frequency: { min: 0.1, max: 12, step: 0.1 },
  scale: { min: 0.2, max: 4, step: 0.01 },
  rotationSpeed: { min: 0, max: 4, step: 0.01 },
  bloomIntensity: { min: 0, max: 2, step: 0.01 },
  rgbShiftAmount: { min: 0, max: 0.02, step: 0.001 },
  glitchIntensity: { min: 0, max: 1, step: 0.01 },
  pixelSize: { min: 1, max: 32, step: 1 },
  vignetteIntensity: { min: 0, max: 1, step: 0.01 },
};

export function formatStatus(params: ShaderParams) {
  return `Geometry: ${params.geometry} | Noise: ${params.noise} | Amp: ${params.amplitude.toFixed(2)} | Scale: ${params.scale.toFixed(2)}`;
}
