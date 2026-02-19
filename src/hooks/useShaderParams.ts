import { useState, useCallback } from 'react';
import { ShaderParams, DEFAULT_SHADER_PARAMS } from '@/types/shader';

export function useShaderParams(initial?: Partial<ShaderParams>) {
  const [params, setParams] = useState<ShaderParams>({
    ...DEFAULT_SHADER_PARAMS,
    ...initial,
  });

  const updateParam = useCallback(<K extends keyof ShaderParams>(
    key: K,
    value: ShaderParams[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateColors = useCallback((colors: Partial<ShaderParams['colors']>) => {
    setParams(prev => ({ ...prev, colors: { ...prev.colors, ...colors } }));
  }, []);

  const updatePostProcessing = useCallback((pp: Partial<ShaderParams['postProcessing']>) => {
    setParams(prev => ({ ...prev, postProcessing: { ...prev.postProcessing, ...pp } }));
  }, []);

  const resetParams = useCallback(() => {
    setParams({ ...DEFAULT_SHADER_PARAMS, ...initial });
  }, [initial]);

  return { params, setParams, updateParam, updateColors, updatePostProcessing, resetParams };
}
