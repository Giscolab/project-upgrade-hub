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
  beatPulse: boolean;
  audioPaused: boolean;
  activeAudioSource: string;
  shaderToyChannels: Array<string | null>;
  presetNames: string[];
  selectedPresetName: string;
  canUndo: boolean;
  canRedo: boolean;
  onAudioChange: (audio: AudioReactiveSettings) => void;
  onVideoChange: (video: VideoExportSettings) => void;
  onStartMicrophone: () => void;
  onSelectAudioFile: (file: File) => void;
  onPauseAudio: () => void;
  onResumeAudio: () => void;
  onStopAudio: () => void;
  onUpdateShaderToyChannel: (index: number, value: string | null) => void;
  onExportVideo: () => void;
  onCancelExportVideo: () => void;
  onExportShadertoy: () => void;
  onRunWebGPU: () => void;
  onToggleMidi: () => void;
  onPresetNameChange: (name: string) => void;
  onSavePreset: () => void;
  onLoadPreset: () => void;
  onDeletePreset: () => void;
  onUndo: () => void;
  onRedo: () => void;
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
  beatPulse,
  audioPaused,
  activeAudioSource,
  shaderToyChannels,
  presetNames,
  selectedPresetName,
  canUndo,
  canRedo,
  onAudioChange,
  onVideoChange,
  onStartMicrophone,
  onSelectAudioFile,
  onPauseAudio,
  onResumeAudio,
  onStopAudio,
  onUpdateShaderToyChannel,
  onExportVideo,
  onCancelExportVideo,
  onExportShadertoy,
  onRunWebGPU,
  onToggleMidi,
  onPresetNameChange,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onUndo,
  onRedo,
}: AudioVideoControlsProps) {
  return (
    <aside id="audio-controls" className="glass-panel absolute left-4 bottom-14 z-30 max-h-[56vh] w-96 space-y-4 overflow-auto rounded-xl p-4">
      <h2 className="text-sm font-semibold">Audio / Export (migration)</h2>

      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground" onClick={onStartMicrophone}>
          Activer micro
        </button>
        <label className="rounded bg-secondary px-2 py-1 text-xs cursor-pointer">
          Audio fichier
          <input type="file" accept="audio/*" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelectAudioFile(file);
            event.target.value = '';
          }} />
        </label>
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={audioPaused ? onResumeAudio : onPauseAudio}>
          {audioPaused ? 'Reprendre' : 'Pause'}
        </button>
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onStopAudio}>
          Stop
        </button>
      </div>

      <p className="text-xs text-muted-foreground">Source audio: {activeAudioSource}</p>
      <p className={`text-xs ${beatPulse ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
        Beat detect: {beatPulse ? 'pulse détecté' : 'en attente'}
      </p>

      <div className="space-y-1">
        <Label>Seuil beat detect</Label>
        <Slider min={0.05} max={1} step={0.01} value={[audio.beatThreshold]} onValueChange={(v) => onAudioChange({ ...audio, beatThreshold: v[0] })} />
      </div>

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

      <div id="shadertoy-channels" className="space-y-2 border-t border-border/50 pt-3">
        <Label className="text-xs">ShaderToy channels (textures multiples)</Label>
        {shaderToyChannels.map((channel, index) => (
          <input
            key={index}
            value={channel ?? ''}
            placeholder={`iChannel${index} URL texture`}
            className="w-full rounded border border-border/60 bg-transparent px-2 py-1 text-xs"
            onChange={(event) => onUpdateShaderToyChannel(index, event.target.value || null)}
          />
        ))}
      </div>

      <div id="preset-controls" className="space-y-2 border-t border-border/50 pt-3">
        <Label className="text-xs">Presets nommés (v3)</Label>
        <input
          className="w-full rounded border border-border/60 bg-transparent px-2 py-1 text-xs"
          value={selectedPresetName}
          placeholder="Nom du preset"
          onChange={(event) => onPresetNameChange(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onSavePreset}>Sauver</button>
          <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onLoadPreset}>Charger</button>
          <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onDeletePreset}>Supprimer</button>
          <button className="rounded bg-secondary px-2 py-1 text-xs disabled:opacity-50" onClick={onUndo} disabled={!canUndo}>Undo</button>
          <button className="rounded bg-secondary px-2 py-1 text-xs disabled:opacity-50" onClick={onRedo} disabled={!canRedo}>Redo</button>
        </div>
        {presetNames.length > 0 && <p className="text-xs text-muted-foreground">Presets: {presetNames.join(', ')}</p>}
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

      <div className="flex flex-wrap gap-2 border-t border-border/50 pt-3">
        <button className="rounded bg-accent px-2 py-1 text-xs text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60" onClick={onExportVideo} disabled={exportInProgress}>
          {exportInProgress ? 'Export en cours…' : 'Export vidéo'}
        </button>
        {exportInProgress && (
          <button className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground" onClick={onCancelExportVideo}>
            Annuler export
          </button>
        )}
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onExportShadertoy}>Export ShaderToy</button>
        <button className="rounded bg-secondary px-2 py-1 text-xs" onClick={onRunWebGPU}>Test WebGPU</button>
        <button id="midi-toggle" className="rounded bg-secondary px-2 py-1 text-xs" onClick={onToggleMidi}>Toggle MIDI</button>
      </div>

      <p className="text-xs text-muted-foreground">{midiStatus}</p>
      <p className="text-xs text-muted-foreground">{webgpuStatus}</p>
      <p className="text-xs text-muted-foreground">{video.fps} fps · {video.duration}s · {video.resolution}</p>
      <p className="text-xs text-muted-foreground">Progression export: {exportProgress}%</p>
      {exportStatus && <p className="text-xs text-muted-foreground">{exportStatus}</p>}
    </aside>
  );
}
