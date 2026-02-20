import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioReactiveSettings, VideoExportSettings } from '../types';

interface AudioVideoControlsProps {
  audio: AudioReactiveSettings;
  video: VideoExportSettings;
  midiStatus: string;
  webgpuStatus: string;
  exportProgress: number;
  exportStatus: string | null;
  exportInProgress: boolean;
  onAudioChange: (audio: AudioReactiveSettings) => void;
  onVideoChange: (video: VideoExportSettings) => void;
  onStartAudio: () => void;
  onStopAudio: () => void;
  onExportVideo: () => void;
  onCancelExportVideo: () => void;
  onExportShadertoy: () => void;
  onRunWebGPU: () => void;
  onToggleMidi: () => void;
}

const AUDIO_TARGETS: AudioReactiveSettings['mapBassTo'][] = ['displacement', 'speed', 'scale', 'none'];
const VIDEO_RESOLUTIONS = ['640x360', '1280x720', '1920x1080'];
const VIDEO_CODECS = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

export default function AudioVideoControls({
  audio,
  video,
  midiStatus,
  webgpuStatus,
  exportProgress,
  exportStatus,
  exportInProgress,
  onAudioChange,
  onVideoChange,
  onStartAudio,
  onStopAudio,
  onExportVideo,
  onCancelExportVideo,
  onExportShadertoy,
  onRunWebGPU,
  onToggleMidi,
}: AudioVideoControlsProps) {
  return (
    <aside className="glass-panel absolute left-4 top-20 z-30 max-h-[calc(100vh-10rem)] w-80 space-y-4 overflow-auto rounded-xl p-4">
      <h2 className="text-sm font-semibold">Audio / Export (migration)</h2>

      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground" onClick={audio.enabled ? onStopAudio : onStartAudio}>
          {audio.enabled ? 'Couper audio' : 'Activer micro'}
        </button>
        <button
          className="rounded bg-accent px-2 py-1 text-xs text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onExportVideo}
          disabled={exportInProgress}
        >
          {exportInProgress ? 'Export en cours…' : 'Export vidéo'}
        </button>
        {exportInProgress && (
          <button className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground" onClick={onCancelExportVideo}>
            Annuler export
          </button>
        )}
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onExportShadertoy}>
          Export ShaderToy
        </button>
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onRunWebGPU}>
          Test WebGPU
        </button>
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onToggleMidi}>
          Toggle MIDI
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{midiStatus}</p>
      <p className="text-xs text-muted-foreground">{webgpuStatus}</p>

      <div className="space-y-1">
        <Label>Bass mapping</Label>
        <Select value={audio.mapBassTo} onValueChange={(mapBassTo) => onAudioChange({ ...audio, mapBassTo: mapBassTo as AudioReactiveSettings['mapBassTo'], enabled: true })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{AUDIO_TARGETS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Mid mapping</Label>
        <Select value={audio.mapMidTo} onValueChange={(mapMidTo) => onAudioChange({ ...audio, mapMidTo: mapMidTo as AudioReactiveSettings['mapMidTo'], enabled: true })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{AUDIO_TARGETS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>High mapping</Label>
        <Select value={audio.mapHighTo} onValueChange={(mapHighTo) => onAudioChange({ ...audio, mapHighTo: mapHighTo as AudioReactiveSettings['mapHighTo'], enabled: true })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{AUDIO_TARGETS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs"><Label>Gain Bass</Label><span>{audio.gainBass.toFixed(2)}</span></div>
        <Slider min={0} max={8} step={0.1} value={[audio.gainBass]} onValueChange={(v) => onAudioChange({ ...audio, gainBass: v[0] })} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs"><Label>Gain Mid</Label><span>{audio.gainMid.toFixed(2)}</span></div>
        <Slider min={0} max={8} step={0.1} value={[audio.gainMid]} onValueChange={(v) => onAudioChange({ ...audio, gainMid: v[0] })} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs"><Label>Gain High</Label><span>{audio.gainHigh.toFixed(2)}</span></div>
        <Slider min={0} max={8} step={0.1} value={[audio.gainHigh]} onValueChange={(v) => onAudioChange({ ...audio, gainHigh: v[0] })} />
      </div>

      <div className="space-y-1 border-t border-border/50 pt-3">
        <Label>Export FPS</Label>
        <Slider min={12} max={120} step={1} value={[video.fps]} onValueChange={(v) => onVideoChange({ ...video, fps: v[0] })} />
      </div>

      <div className="space-y-1">
        <Label>Duration (seconds)</Label>
        <Slider min={2} max={30} step={1} value={[video.duration]} onValueChange={(v) => onVideoChange({ ...video, duration: v[0] })} />
      </div>

      <div className="space-y-1">
        <Label>Resolution</Label>
        <Select value={video.resolution} onValueChange={(resolution) => onVideoChange({ ...video, resolution })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{VIDEO_RESOLUTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Codec</Label>
        <Select value={video.compression} onValueChange={(compression) => onVideoChange({ ...video, compression })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{VIDEO_CODECS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{video.fps} fps · {video.duration}s · {video.resolution}</p>
      <p className="text-xs text-muted-foreground">Progression export: {exportProgress}%</p>
      {exportStatus && <p className="text-xs text-muted-foreground">{exportStatus}</p>}
    </aside>
  );
}
