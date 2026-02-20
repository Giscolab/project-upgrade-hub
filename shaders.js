import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from './src/types/shader.ts';

/**
 * Legacy shader bundle bridge.
 */
export const vertexShaderMain = DEFAULT_VERTEX_SHADER;
export const fragmentShaderMain = DEFAULT_FRAGMENT_SHADER;

export const ShaderChunks = {
  noise: {
    perlin: 'React runtime default noise implementation',
    simplex: 'React runtime default noise implementation',
    voronoi: 'React runtime default noise implementation',
  },
};

export const PRESETS = {
  default: {
    name: 'React Default',
    shader: {
      geometry: 'sphere',
      noise: 'perlin',
    },
  },
};

export const SHADERTOY_TEMPLATES = {
  basic: '// ShaderToy template now generated from React services.',
};
