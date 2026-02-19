import { useEffect } from 'react';
import { ShaderParams } from '@/types/shader';
import { AudioReactiveSettings, VideoExportSettings } from '../types';

const SHADER_STORAGE_KEY = 'shader-studio-react-state';
const AUDIO_STORAGE_KEY = 'shader-studio-react-audio';
const VIDEO_STORAGE_KEY = 'shader-studio-react-video';

export function readPersistedParams(): Partial<ShaderParams> | null {
  try {
    const raw = localStorage.getItem(SHADER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<ShaderParams>;
  } catch {
    return null;
  }
}

export function readPersistedAudio(): Partial<AudioReactiveSettings> | null {
  try {
    const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AudioReactiveSettings>;
  } catch {
    return null;
  }
}

export function readPersistedVideo(): Partial<VideoExportSettings> | null {
  try {
    const raw = localStorage.getItem(VIDEO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<VideoExportSettings>;
  } catch {
    return null;
  }
}

export function useStudioPersistence(params: ShaderParams, audio: AudioReactiveSettings, video: VideoExportSettings) {
  useEffect(() => {
    try {
      localStorage.setItem(SHADER_STORAGE_KEY, JSON.stringify(params));
    } catch {
      // ignore storage write issues
    }
  }, [params]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audio));
    } catch {
      // ignore storage write issues
    }
  }, [audio]);

  useEffect(() => {
    try {
      localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(video));
    } catch {
      // ignore storage write issues
    }
  }, [video]);
}
