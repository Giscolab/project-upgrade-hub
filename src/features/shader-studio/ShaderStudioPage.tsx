import { useCallback, useMemo, useState } from 'react';
import BabylonCanvas from '@/components/shader/BabylonCanvas';
import GPULoader from '@/components/shader/GPULoader';
import ShaderControls from './components/ShaderControls';
import AudioVideoControls from './components/AudioVideoControls';
import LegacyMigrationSummary from './components/LegacyMigrationSummary';
import MigrationChecklistPanel from './components/MigrationChecklistPanel';
import { formatStatus } from './config/defaults';
import { readPersistedStudioState, useStudioPersistence } from './hooks/useStudioPersistence';
import { useAudioReactiveRuntime } from './hooks/useAudioReactiveRuntime';
import { useMidiRuntime } from './hooks/useMidiRuntime';
import { DEFAULT_STUDIO_STATE } from './config/studioDefaults';
import { downloadBlob, recordCanvasVideo } from './services/videoExportService';
import { StudioState } from './types';

export default function ShaderStudioPage() {
  const initialState = useMemo(() => readPersistedStudioState(), []);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<StudioState>(initialState || DEFAULT_STUDIO_STATE);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [shaderError, setShaderError] = useState<string | null>(null);
  const { bands, start, stop } = useAudioReactiveRuntime(state.audio.enabled);

  const params = state.shader;
  const setParams = useCallback((updater: StudioState['shader'] | ((prev: StudioState['shader']) => StudioState['shader'])) => {
    setState((prev) => ({
      ...prev,
      shader: typeof updater === 'function' ? updater(prev.shader) : updater,
    }));
  }, []);

  useStudioPersistence(state);

  const handleLoaded = useCallback(() => setLoading(false), []);

  const { status: midiStatus } = useMidiRuntime(state.midi.enabled, state.midi.mappedCc, (target, normalizedValue) => {
    setParams((prev) => ({
      ...prev,
      [target]: target === 'frequency' ? 0.1 + normalizedValue * 8 : normalizedValue * 2,
    }));
  });

  const mappedParams = useMemo(() => {
    if (!state.audio.enabled) return params;
    const next = { ...params };
    const applyMap = (target: string, value: number) => {
      if (target === 'displacement') next.amplitude = Math.max(0, params.amplitude + value * 0.5);
      if (target === 'speed') next.speed = Math.max(0, params.speed + value * 0.8);
      if (target === 'scale') next.scale = Math.max(0.2, params.scale + value * 0.6);
    };

    applyMap(state.audio.mapBassTo, bands.bass * state.audio.gainBass);
    applyMap(state.audio.mapMidTo, bands.mid * state.audio.gainMid);
    applyMap(state.audio.mapHighTo, bands.high * state.audio.gainHigh);
    return next;
  }, [bands.bass, bands.high, bands.mid, params, state.audio]);

  const handleExportVideo = useCallback(async () => {
    if (!canvasEl) return;
    const blob = await recordCanvasVideo(canvasEl, state.video);
    downloadBlob(blob, `shader-studio-${Date.now()}.webm`);
  }, [canvasEl, state.video]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {loading && <GPULoader onLoaded={handleLoaded} />}
      <BabylonCanvas
        params={mappedParams}
        shaderToyChannels={state.shaderToy.channels}
        onCanvasReady={setCanvasEl}
        onShaderError={setShaderError}
      />

      <header className="glass-panel absolute left-4 right-4 top-4 z-30 flex h-12 items-center justify-between rounded-xl px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="text-sm font-semibold tracking-widest text-foreground">SHADER STUDIO / REACT</span>
        </div>
        <div className="text-xs text-muted-foreground">Unification React en cours</div>
      </header>


      {shaderError && (
        <section className="glass-panel absolute left-4 top-20 z-30 max-w-xl rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
          <p className="mb-1 font-semibold">Shader compile/runtime error</p>
          <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed">{shaderError}</pre>
        </section>
      )}

      <ShaderControls params={params} onParamsChange={setParams} />
      <AudioVideoControls
        audio={state.audio}
        video={state.video}
        midiStatus={midiStatus}
        onAudioChange={(audio) => setState((prev) => ({ ...prev, audio }))}
        onVideoChange={(video) => setState((prev) => ({ ...prev, video }))}
        onStartAudio={() => {
          setState((prev) => ({ ...prev, audio: { ...prev.audio, enabled: true } }));
          start();
        }}
        onStopAudio={() => {
          setState((prev) => ({ ...prev, audio: { ...prev.audio, enabled: false } }));
          stop();
        }}
        onExportVideo={handleExportVideo}
        onToggleMidi={() => setState((prev) => ({ ...prev, midi: { ...prev.midi, enabled: !prev.midi.enabled } }))}
      />
      <LegacyMigrationSummary />
      <MigrationChecklistPanel />

      <div className="glass-panel absolute bottom-4 left-4 right-4 z-30 flex h-8 items-center justify-between rounded-lg px-4 text-xs text-muted-foreground">
        <span>{formatStatus(params)}</span>
        <span>Double-click canvas for fullscreen</span>
      </div>
    </div>
  );
}
