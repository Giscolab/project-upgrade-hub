export interface AudioReactiveSettings {
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
