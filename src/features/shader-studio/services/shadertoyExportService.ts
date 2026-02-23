import { ShaderParams } from '@/types/shader';
import { LEGACY_SHADER_CHUNKS } from '../config/legacyShaderStudioV5';

const SHADERTOY_NOISE_CHUNKS: Partial<Record<ShaderParams['noise'], string>> = LEGACY_SHADER_CHUNKS;

function toVec3(hex: string): string {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean;
  const parsed = Number.parseInt(expanded, 16);
  const r = ((parsed >> 16) & 255) / 255;
  const g = ((parsed >> 8) & 255) / 255;
  const b = (parsed & 255) / 255;
  return `vec3(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;
}

export function buildShadertoyShaderFromParams(params: ShaderParams, channels: Array<string | null> = []): string {
  const chunk = SHADERTOY_NOISE_CHUNKS[params.noise] ?? SHADERTOY_NOISE_CHUNKS.simplex;
  const speed = params.speed.toFixed(3);
  const scale = params.scale.toFixed(3);
  const amp = params.amplitude.toFixed(3);
  const freq = params.frequency.toFixed(3);
  const hasAudio = Boolean(channels[0]);

  return `// Export ShaderToy — généré depuis la version React
// iChannel0 optionnel pour l'audio (FFT)

${chunk}

mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
  float t = iTime * ${speed};

  vec2 p = uv * ${scale};
  p *= rot(t * 0.25);

  float n1 = getNoise(p * ${freq} + vec2(t, -t * 0.7));
  float n2 = getNoise(p * (${freq} * 1.6) - vec2(t * 0.6, t));
  float n = mix(n1, n2, 0.45);

  float ring = smoothstep(0.52, 0.18, abs(length(uv) - (0.28 + n * ${amp})));
  float glow = exp(-3.2 * length(uv - vec2(0.0, 0.08 * sin(t * 1.8))));

  vec3 col = mix(${toVec3(params.colors.color1)}, ${toVec3(params.colors.color2)}, 0.5 + 0.5 * n);
  col = mix(col, ${toVec3(params.colors.color3)}, ring * 0.8);
  col += glow * 0.24;

  ${hasAudio ? 'float fft = texture(iChannel0, vec2(0.07, 0.25)).x;\n  col *= 1.0 + fft * 0.35;' : '// Astuce: brancher un canal audio FFT sur iChannel0 pour moduler la couleur.'}

  fragColor = vec4(pow(max(col, 0.0), vec3(0.95)), 1.0);
}
`;
}

export function exportShadertoyShader(params: ShaderParams, channels: Array<string | null> = []): string {
  const shaderCode = buildShadertoyShaderFromParams(params, channels);
  const blob = new Blob([shaderCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shadertoy-${Date.now()}.frag`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return shaderCode;
}
