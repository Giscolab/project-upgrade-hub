import { DEFAULT_SHADER_PARAMS } from './src/types/shader.ts';
import { LEGACY_AUDIO_DEFAULTS, LEGACY_PARAMS, LEGACY_VIDEO_DEFAULTS } from './src/features/shader-studio/config/legacyConfig.ts';

/**
 * Legacy config bridge aligned with React defaults.
 */
export const params = LEGACY_PARAMS.map((item) => ({ ...item }));

export const audioParams = [
  {
    id: 'mapBassTo',
    type: 'select',
    name: 'Bass → effet',
    value: LEGACY_AUDIO_DEFAULTS.mapBassTo,
    options: { Déplacement: 'displacement', Vitesse: 'speed', Échelle: 'scale', Rien: 'none' },
  },
  {
    id: 'mapMidTo',
    type: 'select',
    name: 'Mid → effet',
    value: LEGACY_AUDIO_DEFAULTS.mapMidTo,
    options: { Déplacement: 'displacement', Vitesse: 'speed', Échelle: 'scale', Rien: 'none' },
  },
  {
    id: 'mapHighTo',
    type: 'select',
    name: 'High → effet',
    value: LEGACY_AUDIO_DEFAULTS.mapHighTo,
    options: { Déplacement: 'displacement', Vitesse: 'speed', Échelle: 'scale', Rien: 'none' },
  },
  { id: 'gainBass', type: 'float', name: 'Gain Bass', value: LEGACY_AUDIO_DEFAULTS.gainBass, min: 0, max: 8 },
  { id: 'gainMid', type: 'float', name: 'Gain Mid', value: LEGACY_AUDIO_DEFAULTS.gainMid, min: 0, max: 8 },
  { id: 'gainHigh', type: 'float', name: 'Gain High', value: LEGACY_AUDIO_DEFAULTS.gainHigh, min: 0, max: 8 },
];

export const videoParams = {
  ...LEGACY_VIDEO_DEFAULTS,
  format: 'video/webm',
};

export const reactDefaultParams = DEFAULT_SHADER_PARAMS;
