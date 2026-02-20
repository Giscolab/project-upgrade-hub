import { buildShadertoyShaderFromParams } from './src/features/shader-studio/services/shadertoyExportService.ts';
import { DEFAULT_SHADER_PARAMS } from './src/types/shader.ts';

/**
 * Legacy exporter bridge.
 * Converts loose legacy config into typed React shader params.
 */
export function buildShadertoyExport(config = {}) {
  const params = {
    ...DEFAULT_SHADER_PARAMS,
    ...config,
    colors: {
      ...DEFAULT_SHADER_PARAMS.colors,
      ...(config.colors ?? {}),
    },
    postProcessing: {
      ...DEFAULT_SHADER_PARAMS.postProcessing,
      ...(config.postProcessing ?? {}),
    },
    material: {
      ...DEFAULT_SHADER_PARAMS.material,
      ...(config.material ?? {}),
    },
  };

  return buildShadertoyShaderFromParams(params, config.shaderToyChannels ?? []);
}

export default buildShadertoyExport;
