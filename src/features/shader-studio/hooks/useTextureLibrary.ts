import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'shaderStudioV5_textures';
const MAX_ITEMS = 24;

export interface TextureLibraryItem {
  id: string;
  name: string;
  dataUrl: string;
}

function readLibrary(): TextureLibraryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.dataUrl === 'string');
  } catch {
    return [];
  }
}

export function useTextureLibrary() {
  const [textures, setTextures] = useState<TextureLibraryItem[]>(() => readLibrary());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(textures));
    } catch {
      // ignore write failures
    }
  }, [textures]);

  const addTexture = useCallback((name: string, dataUrl: string) => {
    setTextures((prev) => [{ id: `tex-${Date.now()}`, name, dataUrl }, ...prev].slice(0, MAX_ITEMS));
  }, []);

  return { textures, addTexture };
}
