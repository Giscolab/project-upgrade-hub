export type GeometryType =
  | 'sphere' | 'box' | 'torus' | 'plane' | 'cylinder' | 'cone'
  | 'torusKnot' | 'icosphere' | 'octahedron' | 'dodecahedron'
  | 'tetrahedron' | 'capsule' | 'disc' | 'ribbon' | 'ground'
  | 'hemisphere' | 'polyhedron' | 'geodesic';

export type NoiseAlgorithm =
  | 'perlin' | 'simplex' | 'worley' | 'fbm' | 'voronoi'
  | 'ridged' | 'turbulence' | 'domain_warp' | 'curl'
  | 'gradient' | 'value' | 'wavelet' | 'gabor' | 'blue' | 'white';

export interface ShaderColors {
  color1: string;
  color2: string;
  color3: string;
  background: string;
}

export interface PostProcessing {
  bloom: boolean;
  bloomIntensity: number;
  rgbShift: boolean;
  rgbShiftAmount: number;
  glitch: boolean;
  glitchIntensity: number;
  pixelArt: boolean;
  pixelSize: number;
  vignette: boolean;
  vignetteIntensity: number;
}

export interface ShaderParams {
  geometry: GeometryType;
  noise: NoiseAlgorithm;
  speed: number;
  amplitude: number;
  frequency: number;
  scale: number;
  colors: ShaderColors;
  postProcessing: PostProcessing;
  wireframe: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
}

export const DEFAULT_SHADER_PARAMS: ShaderParams = {
  geometry: 'sphere',
  noise: 'perlin',
  speed: 1.0,
  amplitude: 0.3,
  frequency: 2.0,
  scale: 1.0,
  colors: {
    color1: '#8b5cf6',
    color2: '#06b6d4',
    color3: '#f43f5e',
    background: '#0a0a0f',
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 0.5,
    rgbShift: false,
    rgbShiftAmount: 0.003,
    glitch: false,
    glitchIntensity: 0.3,
    pixelArt: false,
    pixelSize: 4,
    vignette: true,
    vignetteIntensity: 0.4,
  },
  wireframe: false,
  autoRotate: true,
  rotationSpeed: 0.5,
};

export const DEFAULT_VERTEX_SHADER = `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 world;
uniform mat4 worldViewProjection;
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying float vDisplacement;

// Classic Perlin noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUV = uv;
  vNormal = normalize((world * vec4(normal, 0.0)).xyz);

  float displacement = snoise(position * uFrequency + uTime * 0.5) * uAmplitude;
  vDisplacement = displacement;

  vec3 newPosition = position + normal * displacement;
  vPosition = (world * vec4(newPosition, 1.0)).xyz;

  gl_Position = worldViewProjection * vec4(newPosition, 1.0);
}
`;

export const DEFAULT_FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying float vDisplacement;

void main() {
  vec3 light = normalize(vec3(1.0, 1.0, 2.0));
  float diff = max(dot(vNormal, light), 0.0);
  float fresnel = pow(1.0 - max(dot(vNormal, normalize(-vPosition)), 0.0), 3.0);

  vec3 col = mix(uColor1, uColor2, vDisplacement * 2.0 + 0.5);
  col = mix(col, uColor3, fresnel * 0.6);

  col *= 0.3 + diff * 0.7;
  col += fresnel * uColor3 * 0.4;

  // Subtle rim glow
  col += pow(fresnel, 4.0) * uColor2 * 0.3;

  gl_FragColor = vec4(col, 1.0);
}
`;
