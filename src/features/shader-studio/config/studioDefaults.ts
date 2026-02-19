import { DEFAULT_SHADER_PARAMS } from '@/types/shader';
import { StudioState } from '../types';

export const STUDIO_STATE_VERSION = 2;

export const DEFAULT_STUDIO_STATE: StudioState = {
  shader: DEFAULT_SHADER_PARAMS,
  audio: {
    enabled: false,
    mapBassTo: 'displacement',
    mapMidTo: 'speed',
    mapHighTo: 'scale',
    gainBass: 1,
    gainMid: 1,
    gainHigh: 1,
  },
  video: {
    duration: 8,
    compression: 'video/webm;codecs=vp9',
    resolution: '1280x720',
    fps: 30,
  },
  midi: {
    enabled: false,
    mappedCc: {
      1: 'amplitude',
      2: 'frequency',
      3: 'speed',
    },
  },
};
