import PanelSection from '@/components/ui/PanelSection';
import SliderControl from '@/components/ui/SliderControl';
import ColorSwatch from '@/components/ui/ColorSwatch';
import { AudioReactiveSettings, OscSettings, VideoExportSettings } from '@/features/shader-studio/types';
import { ShaderParams } from '@/types/shader';
import { GEOMETRY_OPTIONS, NOISE_OPTIONS, PARAM_RANGE } from '@/features/shader-studio/config/defaults';

interface RightPanelProps {
  params: ShaderParams;
  onParamsChange: (params: ShaderParams) => void;
  audio: AudioReactiveSettings;
  video: VideoExportSettings;
  osc: OscSettings;
  webcamEnabled: boolean;
  webcamStatus: string;
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
  onOscChange: (osc: OscSettings) => void;
  onToggleWebcam: () => void;
  onStartMicrophone: () => void;
  onSelectAudioFile: (file: File) => void;
  onPauseAudio: () => void;
  onResumeAudio: () => void;
  onStopAudio: () => void;
  onUpdateShaderToyChannel: (index: number, value: string | null) => void;
  onExportVideo: () => void;
  onCancelExportVideo: () => void;
  onExportPng: () => void;
  onExportShadertoy: () => void;
  onRunWebGPU: () => void;
  onToggleMidi: () => void;
  onPresetNameChange: (name: string) => void;
  onSavePreset: () => void;
  onLoadPreset: () => void;
  onDeletePreset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  legacyPresetNames: string[];
  selectedLegacyPreset: string;
  onSelectLegacyPreset: (name: string) => void;
  onApplyLegacyPreset: () => void;
}

const audioTargets: AudioReactiveSettings['mapBassTo'][] = ['displacement', 'speed', 'scale', 'none'];

export default function RightPanel(props: RightPanelProps) {
  const {
    params,
    onParamsChange,
    audio,
    video,
    osc,
    webcamEnabled,
    webcamStatus,
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
    legacyPresetNames,
    selectedLegacyPreset,
  } = props;

  return (
    <aside className="w-[280px] shrink-0 space-y-2 overflow-y-auto border-l border-[#2a2a3a] bg-[#111118] p-2 shader-scrollbar">
      <PanelSection title="Presets" defaultOpen>
        <input className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" placeholder="Nom du preset" value={selectedPresetName} onChange={(e) => props.onPresetNameChange(e.target.value)} />
        <div className="grid grid-cols-2 gap-1">
          <button className="rounded border border-[#2a2a3a] bg-[#6c63ff] px-2 py-1 text-xs text-white" onClick={props.onSavePreset}>Sauver</button>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onLoadPreset}>Appliquer</button>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onDeletePreset}>Supprimer</button>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs disabled:opacity-50" onClick={props.onUndo} disabled={!canUndo}>Undo</button>
          <button className="col-span-2 rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs disabled:opacity-50" onClick={props.onRedo} disabled={!canRedo}>Redo</button>
        </div>
        {presetNames.length > 0 && <p className="text-[11px] text-[#8888aa]">{presetNames.join(', ')}</p>}
      </PanelSection>


      <PanelSection title="Legacy shaders.js presets" defaultOpen={false}>
        <select
          className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs"
          value={selectedLegacyPreset}
          onChange={(e) => props.onSelectLegacyPreset(e.target.value)}
        >
          <option value="">Sélectionner un preset legacy</option>
          {legacyPresetNames.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <button
          className="w-full rounded border border-[#2a2a3a] bg-[#6c63ff] px-2 py-1 text-xs text-white disabled:opacity-50"
          onClick={props.onApplyLegacyPreset}
          disabled={!selectedLegacyPreset}
        >
          Appliquer preset legacy (shader + params)
        </button>
      </PanelSection>

      <PanelSection title="Géométrie & Shader" defaultOpen>
        <select className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={params.geometry} onChange={(e) => onParamsChange({ ...params, geometry: e.target.value as ShaderParams['geometry'] })}>
          {GEOMETRY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={params.noise} onChange={(e) => onParamsChange({ ...params, noise: e.target.value as ShaderParams['noise'] })}>
          {NOISE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>Wireframe</span><input type="checkbox" checked={params.wireframe} onChange={(e) => onParamsChange({ ...params, wireframe: e.target.checked })} /></label>
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>Auto rotate</span><input type="checkbox" checked={params.autoRotate} onChange={(e) => onParamsChange({ ...params, autoRotate: e.target.checked })} /></label>
      </PanelSection>

      <PanelSection title="Couleurs" defaultOpen>
        <div className="grid grid-cols-2 gap-1">
          <ColorSwatch label="A" value={params.colors.color1} onChange={(value) => onParamsChange({ ...params, colors: { ...params.colors, color1: value } })} />
          <ColorSwatch label="B" value={params.colors.color2} onChange={(value) => onParamsChange({ ...params, colors: { ...params.colors, color2: value } })} />
          <ColorSwatch label="C" value={params.colors.color3} onChange={(value) => onParamsChange({ ...params, colors: { ...params.colors, color3: value } })} />
          <ColorSwatch label="Fond" value={params.colors.background} onChange={(value) => onParamsChange({ ...params, colors: { ...params.colors, background: value } })} />
        </div>
      </PanelSection>

      <PanelSection title="Paramètres" defaultOpen>
        <SliderControl label="Speed" value={params.speed} {...PARAM_RANGE.speed} onChange={(speed) => onParamsChange({ ...params, speed })} />
        <SliderControl label="Amplitude" value={params.amplitude} {...PARAM_RANGE.amplitude} onChange={(amplitude) => onParamsChange({ ...params, amplitude })} />
        <SliderControl label="Frequency" value={params.frequency} {...PARAM_RANGE.frequency} onChange={(frequency) => onParamsChange({ ...params, frequency })} />
        <SliderControl label="Scale" value={params.scale} {...PARAM_RANGE.scale} onChange={(scale) => onParamsChange({ ...params, scale })} />
        <SliderControl label="Rotation" value={params.rotationSpeed} {...PARAM_RANGE.rotationSpeed} onChange={(rotationSpeed) => onParamsChange({ ...params, rotationSpeed })} />
      </PanelSection>

      <PanelSection title="Audio" defaultOpen={false}>
        <div className="flex flex-wrap gap-1">
          <button className="rounded border border-[#2a2a3a] bg-[#6c63ff] px-2 py-1 text-xs text-white" onClick={props.onStartMicrophone}>Micro</button>
          <label className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs">Fichier<input type="file" accept="audio/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) props.onSelectAudioFile(file); e.target.value = ''; }} /></label>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={audioPaused ? props.onResumeAudio : props.onPauseAudio}>{audioPaused ? 'Reprendre' : 'Pause'}</button>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onStopAudio}>Stop</button>
        </div>
        <p className="text-[11px] text-[#8888aa]">Source: {activeAudioSource} · {beatPulse ? 'Pulse' : 'Idle'}</p>
        <SliderControl label="Beat" value={audio.beatThreshold} min={0.05} max={1} step={0.01} onChange={(beatThreshold) => props.onAudioChange({ ...audio, beatThreshold })} />
        <SliderControl label="Gain bass" value={audio.gainBass} min={0} max={8} step={0.1} onChange={(gainBass) => props.onAudioChange({ ...audio, gainBass })} />
        <SliderControl label="Gain mid" value={audio.gainMid} min={0} max={8} step={0.1} onChange={(gainMid) => props.onAudioChange({ ...audio, gainMid })} />
        <SliderControl label="Gain high" value={audio.gainHigh} min={0} max={8} step={0.1} onChange={(gainHigh) => props.onAudioChange({ ...audio, gainHigh })} />
        <select className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={audio.mapBassTo} onChange={(e) => props.onAudioChange({ ...audio, enabled: true, mapBassTo: e.target.value as AudioReactiveSettings['mapBassTo'] })}>{audioTargets.map((t) => <option key={t}>{t}</option>)}</select>
        <select className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={audio.mapMidTo} onChange={(e) => props.onAudioChange({ ...audio, enabled: true, mapMidTo: e.target.value as AudioReactiveSettings['mapMidTo'] })}>{audioTargets.map((t) => <option key={t}>{t}</option>)}</select>
        <select className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={audio.mapHighTo} onChange={(e) => props.onAudioChange({ ...audio, enabled: true, mapHighTo: e.target.value as AudioReactiveSettings['mapHighTo'] })}>{audioTargets.map((t) => <option key={t}>{t}</option>)}</select>
      </PanelSection>

      <PanelSection title="Export" defaultOpen={false}>
        <SliderControl label="FPS" value={video.fps} min={12} max={120} step={1} onChange={(fps) => props.onVideoChange({ ...video, fps })} />
        <SliderControl label="Durée" value={video.duration} min={2} max={30} step={1} unit="s" onChange={(duration) => props.onVideoChange({ ...video, duration })} />
        <input className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={video.resolution} onChange={(e) => props.onVideoChange({ ...video, resolution: e.target.value })} />
        <input className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={video.compression} onChange={(e) => props.onVideoChange({ ...video, compression: e.target.value })} />
        {shaderToyChannels.map((channel, index) => <input key={index} className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" placeholder={`iChannel${index} URL`} value={channel ?? ''} onChange={(e) => props.onUpdateShaderToyChannel(index, e.target.value || null)} />)}
        <div className="grid grid-cols-2 gap-1">
          <button className="rounded border border-[#2a2a3a] bg-[#6c63ff] px-2 py-1 text-xs text-white disabled:opacity-50" onClick={props.onExportVideo} disabled={exportInProgress}>{exportInProgress ? 'Export…' : 'Vidéo'}</button>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onExportPng}>PNG</button>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onExportShadertoy}>ShaderToy</button>
          <button className="rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onRunWebGPU}>WebGPU</button>
        </div>
        {exportInProgress && <button className="w-full rounded border border-[#2a2a3a] bg-[#ef4444] px-2 py-1 text-xs text-white" onClick={props.onCancelExportVideo}>Annuler export</button>}
        <p className="text-[11px] text-[#8888aa]">{exportProgress}% · {exportStatus ?? 'Prêt'}</p>
      </PanelSection>

      <PanelSection title="Animation / Matière" defaultOpen={false}>
        <SliderControl label="Metalness" value={params.material.metalness} min={0} max={1} step={0.01} onChange={(metalness) => onParamsChange({ ...params, material: { ...params.material, metalness } })} />
        <SliderControl label="Rim" value={params.material.rimPower} min={0.5} max={8} step={0.1} onChange={(rimPower) => onParamsChange({ ...params, material: { ...params.material, rimPower } })} />
        <SliderControl label="Fresnel" value={params.material.fresnelStrength} min={0} max={8} step={0.1} onChange={(fresnelStrength) => onParamsChange({ ...params, material: { ...params.material, fresnelStrength } })} />
        <SliderControl label="Twist" value={params.material.twist} min={0} max={8} step={0.05} onChange={(twist) => onParamsChange({ ...params, material: { ...params.material, twist } })} />
        <SliderControl label="Pulse" value={params.material.pulse} min={0} max={10} step={0.05} onChange={(pulse) => onParamsChange({ ...params, material: { ...params.material, pulse } })} />
        <SliderControl label="Morph" value={params.material.morphFactor} min={0} max={1} step={0.01} onChange={(morphFactor) => onParamsChange({ ...params, material: { ...params.material, morphFactor } })} />
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>Bloom</span><input type="checkbox" checked={params.postProcessing.bloom} onChange={(e) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, bloom: e.target.checked } })} /></label>
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>RGB Shift</span><input type="checkbox" checked={params.postProcessing.rgbShift} onChange={(e) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, rgbShift: e.target.checked } })} /></label>
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>Glitch</span><input type="checkbox" checked={params.postProcessing.glitch} onChange={(e) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, glitch: e.target.checked } })} /></label>
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>Pixel</span><input type="checkbox" checked={params.postProcessing.pixelArt} onChange={(e) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, pixelArt: e.target.checked } })} /></label>
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>Vignette</span><input type="checkbox" checked={params.postProcessing.vignette} onChange={(e) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, vignette: e.target.checked } })} /></label>
        <SliderControl label="Bloom i." value={params.postProcessing.bloomIntensity} min={0} max={2} step={0.01} onChange={(bloomIntensity) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, bloomIntensity } })} />
        <SliderControl label="RGB i." value={params.postProcessing.rgbShiftAmount} min={0} max={0.02} step={0.0001} onChange={(rgbShiftAmount) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, rgbShiftAmount } })} />
      </PanelSection>


      <PanelSection title="OSC / Webcam" defaultOpen={false}>
        <label className="flex items-center justify-between text-xs text-[#8888aa]"><span>OSC enabled</span><input type="checkbox" checked={osc.enabled} onChange={(e) => props.onOscChange({ ...osc, enabled: e.target.checked })} /></label>
        <input className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={osc.url} onChange={(e) => props.onOscChange({ ...osc, url: e.target.value })} placeholder="ws://localhost:8081" />
        <input className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" value={osc.route} onChange={(e) => props.onOscChange({ ...osc, route: e.target.value })} placeholder="/shader" />
        <p className="text-[11px] text-[#8888aa]">OSC: {osc.status}</p>
        <button className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onToggleWebcam}>{webcamEnabled ? 'Désactiver webcam iChannel0' : 'Activer webcam iChannel0'}</button>
        <p className="text-[11px] text-[#8888aa]">{webcamStatus}</p>
      </PanelSection>

      <PanelSection title="MIDI" defaultOpen={false}>
        <button className="w-full rounded border border-[#2a2a3a] bg-[#1a1a26] px-2 py-1 text-xs" onClick={props.onToggleMidi}>Toggle MIDI</button>
        <p className="text-[11px] text-[#8888aa]">{midiStatus}</p>
        <p className="text-[11px] text-[#8888aa]">{webgpuStatus}</p>
      </PanelSection>
    </aside>
  );
}
