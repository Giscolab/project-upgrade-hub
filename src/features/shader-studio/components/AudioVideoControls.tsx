import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioReactiveSettings, VideoExportSettings } from '../types';

interface AudioVideoControlsProps {
  audio: AudioReactiveSettings;
  video: VideoExportSettings;
  midiStatus: string;
  onAudioChange: (audio: AudioReactiveSettings) => void;
  onVideoChange: (video: VideoExportSettings) => void;
  onStartAudio: () => void;
  onStopAudio: () => void;
  onExportVideo: () => void;
  onToggleMidi: () => void;
}

const AUDIO_TARGETS: AudioReactiveSettings['mapBassTo'][] = ['displacement', 'speed', 'scale', 'none'];

export default function AudioVideoControls({ audio, video, midiStatus, onAudioChange, onVideoChange, onStartAudio, onStopAudio, onExportVideo, onToggleMidi }: AudioVideoControlsProps) {
  return (
    <aside className="glass-panel absolute left-4 top-20 z-30 max-h-[calc(100vh-10rem)] w-80 space-y-4 overflow-auto rounded-xl p-4">
      <h2 className="text-sm font-semibold">Audio / Export (migration)</h2>

      <div className="flex gap-2">
        <button className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground" onClick={audio.enabled ? onStopAudio : onStartAudio}>
          {audio.enabled ? 'Couper audio' : 'Activer micro'}
        </button>
        <button className="rounded bg-accent px-2 py-1 text-xs text-accent-foreground" onClick={onExportVideo}>
          Export vidéo
        </button>
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onToggleMidi}>
          Toggle MIDI
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{midiStatus}</p>

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
        <p className="text-xs text-muted-foreground">{video.fps} fps · {video.duration}s · {video.resolution}</p>
      </div>
    </aside>
  );
}
