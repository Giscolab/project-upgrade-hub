import { useEffect } from 'react';
import { ShaderParams } from '@/types/shader';

const STORAGE_KEY = 'shader-studio-react-state';

export function readPersistedParams(): Partial<ShaderParams> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ShaderParams>;
  } catch {
    return null;
  }
}

export function useStudioPersistence(params: ShaderParams) {
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    } catch {
      // ignore storage write issues
    }
  }, [params]);
}
