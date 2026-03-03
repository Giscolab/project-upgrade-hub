import { describe, expect, it } from 'vitest';
import { DEFAULT_SHADER_PARAMS } from '@/types/shader';
import { buildShadertoyShaderFromParams } from '@/features/shader-studio/services/shadertoyExportService';

describe('buildShadertoyShaderFromParams', () => {
  it('injecte les couleurs et les uniforms issus des params React', () => {
    const code = buildShadertoyShaderFromParams({
      ...DEFAULT_SHADER_PARAMS,
      speed: 1.7,
      scale: 2.2,
      amplitude: 0.45,
      frequency: 3.5,
      colors: {
        color1: '#ff0000',
        color2: '#00ff00',
        color3: '#0000ff',
        color4: '#ff6688',
        background: '#000000',
        rimColor: '#06b6d4',
      },
    });

    expect(code).toContain('float t = iTime * 1.700');
    expect(code).toContain('vec2 p = uv * 2.200');
    expect(code).toContain('vec3(1.0000, 0.0000, 0.0000)');
    expect(code).toContain('vec3(0.0000, 1.0000, 0.0000)');
    expect(code).toContain('vec3(0.0000, 0.0000, 1.0000)');
  });

  it('active la section iChannel0 quand un channel audio est fourni', () => {
    const code = buildShadertoyShaderFromParams(DEFAULT_SHADER_PARAMS, ['audio-fft', null, null, null]);
    expect(code).toContain('float fft = texture(iChannel0');
  });

  it('supporte les familles de bruit legacy ajoutées pour la migration', () => {
    const code = buildShadertoyShaderFromParams({
      ...DEFAULT_SHADER_PARAMS,
      noise: 'plasma',
    });

    expect(code).toContain('float getNoise(vec2 st){');
    expect(code).toContain('sin(st.x*3.)');
  });
});
