export interface AudioReactiveSettings {
  enabled: boolean;
  mapBassTo: 'displacement' | 'speed' | 'scale' | 'none';
  mapMidTo: 'displacement' | 'speed' | 'scale' | 'none';
  mapHighTo: 'displacement' | 'speed' | 'scale' | 'none';
  gainBass: number;
  gainMid: number;
  gainHigh: number;
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

export interface StudioState {
  shader: import('@/types/shader').ShaderParams;
  audio: AudioReactiveSettings;
  video: VideoExportSettings;
  midi: MidiSettings;
}
