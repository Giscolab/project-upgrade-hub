export interface AudioReactiveSettings {
  enabled: boolean;
  source: 'mic' | 'file';
  fileName: string | null;
  mapBassTo: 'displacement' | 'speed' | 'scale' | 'none';
  mapMidTo: 'displacement' | 'speed' | 'scale' | 'none';
  mapHighTo: 'displacement' | 'speed' | 'scale' | 'none';
  gainBass: number;
  gainMid: number;
  gainHigh: number;
  beatThreshold: number;
}

export interface VideoExportSettings {
  duration: number;
  compression: string;
  resolution: string;
  fps: number;
}

export interface MidiSettings {
  enabled: boolean;
  mappedCc: Partial<Record<number, 'amplitude' | 'frequency' | 'speed' | 'scale'>>;
}

export interface ShaderToySettings {
  enabled: boolean;
  channels: Array<string | null>;
}

export interface OscSettings {
  enabled: boolean;
  url: string;
  route: string;
  status: string;
}

export interface StudioState {
  shader: import('@/types/shader').ShaderParams;
  audio: AudioReactiveSettings;
  video: VideoExportSettings;
  midi: MidiSettings;
  shaderToy: ShaderToySettings;
  osc: OscSettings;
}
