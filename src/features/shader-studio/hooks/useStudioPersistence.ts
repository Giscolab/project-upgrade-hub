import { useEffect } from 'react';
import { DEFAULT_SHADER_PARAMS, ShaderParams } from '@/types/shader';
import { DEFAULT_STUDIO_STATE, STUDIO_STATE_VERSION } from '../config/studioDefaults';
import { StudioState } from '../types';

const STORAGE_KEY = 'shader-studio-react-state-v2';
const LEGACY_STORAGE_KEY = 'shader-studio-react-state';

interface PersistedStudioState {
  version: number;
  data: StudioState;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function migrateLegacyPayload(raw: unknown): PersistedStudioState | null {
  if (!isObject(raw)) return null;

  if ('version' in raw && 'data' in raw && isObject(raw.data)) {
    return {
      version: Number(raw.version) || STUDIO_STATE_VERSION,
      data: {
        ...DEFAULT_STUDIO_STATE,
        ...(raw.data as Partial<StudioState>),
        shader: {
          ...DEFAULT_SHADER_PARAMS,
          ...((raw.data as Partial<StudioState>).shader ?? {}),
        },
      },
    };
  }

  return {
    version: STUDIO_STATE_VERSION,
    data: {
      ...DEFAULT_STUDIO_STATE,
      shader: {
        ...DEFAULT_SHADER_PARAMS,
        ...(raw as Partial<ShaderParams>),
      },
    },
  };
}

export function readPersistedStudioState(): StudioState {
  const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return DEFAULT_STUDIO_STATE;

  try {
    const migrated = migrateLegacyPayload(JSON.parse(raw));
    if (!migrated) return DEFAULT_STUDIO_STATE;
    return {
      ...DEFAULT_STUDIO_STATE,
      ...migrated.data,
      shader: {
        ...DEFAULT_SHADER_PARAMS,
        ...migrated.data.shader,
      },
    };
  } catch {
    return DEFAULT_STUDIO_STATE;
  }
}

export function useStudioPersistence(state: StudioState) {
  useEffect(() => {
    const payload: PersistedStudioState = {
      version: STUDIO_STATE_VERSION,
      data: state,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage write issues
    }
  }, [state]);
}
