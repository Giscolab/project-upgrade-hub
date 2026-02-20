import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BabylonCanvas from '@/components/shader/BabylonCanvas';
import GPULoader from '@/components/shader/GPULoader';
import ShaderControls from './components/ShaderControls';
import AudioVideoControls from './components/AudioVideoControls';
import GlslEditorPanel from './components/GlslEditorPanel';
import LegacyMigrationSummary from './components/LegacyMigrationSummary';
import MigrationChecklistPanel from './components/MigrationChecklistPanel';
import { formatStatus } from './config/defaults';
import { readPersistedStudioState, useStudioPersistence } from './hooks/useStudioPersistence';
import { useAudioReactiveRuntime } from './hooks/useAudioReactiveRuntime';
import { useMidiRuntime } from './hooks/useMidiRuntime';
import { DEFAULT_STUDIO_STATE } from './config/studioDefaults';
import { exportShadertoyShader } from './services/shadertoyExportService';
import { exportShaderSource } from './services/shaderExportService';
import { downloadBlob, recordCanvasVideo } from './services/videoExportService';
import { WebGPUComputeService } from './services/webgpuComputeService';
import { DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from '@/types/shader';
import { StudioState } from './types';

export default function ShaderStudioPage() {
  const initialState = useMemo(() => readPersistedStudioState(), []);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<StudioState>(initialState || DEFAULT_STUDIO_STATE);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [shaderError, setShaderError] = useState<string | null>(null);
  const [webgpuStatus, setWebgpuStatus] = useState(
    WebGPUComputeService.isSupported() ? 'WebGPU disponible (test non exécuté)' : 'WebGPU indisponible sur ce navigateur',
  );

  // GLSL editor state
  const [vertexShader, setVertexShader] = useState(DEFAULT_VERTEX_SHADER);
  const [fragmentShader, setFragmentShader] = useState(DEFAULT_FRAGMENT_SHADER);
  const [compileKey, setCompileKey] = useState(0);

  const { bands, start, stop } = useAudioReactiveRuntime(state.audio.enabled);
  const webgpuRef = useRef(new WebGPUComputeService());
  const exportAbortControllerRef = useRef<AbortController | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportInProgress, setExportInProgress] = useState(false);

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

  useEffect(() => () => exportAbortControllerRef.current?.abort(), []);

  const handleExportVideo = useCallback(async () => {
    if (!canvasEl || exportInProgress) return;

    const abortController = new AbortController();
    exportAbortControllerRef.current = abortController;
    setExportInProgress(true);
    setExportProgress(0);
    setExportStatus('Capture vidéo en cours...');

    try {
      const blob = await recordCanvasVideo(canvasEl, state.video, {
        signal: abortController.signal,
        onProgress: setExportProgress,
      });
      downloadBlob(blob, `shader-studio-${Date.now()}.webm`);
      setExportStatus('Export vidéo terminé.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setExportStatus('Export vidéo annulé.');
      } else {
        setExportStatus(`Erreur export vidéo: ${error instanceof Error ? error.message : 'inconnue'}`);
      }
    } finally {
      exportAbortControllerRef.current = null;
      setExportInProgress(false);
    }
  }, [canvasEl, exportInProgress, state.video]);

  const handleCancelExportVideo = useCallback(() => {
    exportAbortControllerRef.current?.abort();
  }, []);

  const handleExportShadertoy = useCallback(() => {
    exportShadertoyShader(state.shader, state.shaderToy.channels);
  }, [state.shader, state.shaderToy.channels]);

  const handleCompile = useCallback(() => {
    setCompileKey((k) => k + 1);
    setShaderError(null);
  }, []);

  const handleExportCode = useCallback(() => {
    exportShaderSource(fragmentShader, `shader-${Date.now()}.frag`);
  }, [fragmentShader]);

  const handleRunWebGPU = useCallback(async () => {
    if (!WebGPUComputeService.isSupported()) {
      setWebgpuStatus('WebGPU indisponible sur ce navigateur');
      return;
    }
    try {
      const result = await webgpuRef.current.runParticleSimulation({ particleCount: 2048, deltaTime: 0.016 });
      setWebgpuStatus(
        `Simulation WebGPU OK · ${result.particleCount} particules · sample=(${result.sample.x.toFixed(2)}, ${result.sample.y.toFixed(2)})`,
      );
    } catch (error) {
      setWebgpuStatus(`Erreur WebGPU: ${error instanceof Error ? error.message : 'inconnue'}`);
    }
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {loading && <GPULoader onLoaded={handleLoaded} />}
      <BabylonCanvas
        key={compileKey}
        params={mappedParams}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
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
        <section className="glass-panel absolute left-[460px] top-20 z-30 max-w-xl rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
          <p className="mb-1 font-semibold">Shader compile/runtime error</p>
          <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed">{shaderError}</pre>
        </section>
      )}

      {/* Phase 2: GLSL Editor Panel */}
      <GlslEditorPanel
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        onVertexChange={setVertexShader}
        onFragmentChange={setFragmentShader}
        onCompile={handleCompile}
        onExportCode={handleExportCode}
      />

      <ShaderControls params={params} onParamsChange={setParams} />
      <AudioVideoControls
        audio={state.audio}
        video={state.video}
        midiStatus={midiStatus}
        webgpuStatus={webgpuStatus}
        exportProgress={exportProgress}
        exportStatus={exportStatus}
        exportInProgress={exportInProgress}
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
        onCancelExportVideo={handleCancelExportVideo}
        onExportShadertoy={handleExportShadertoy}
        onRunWebGPU={handleRunWebGPU}
        onToggleMidi={() => setState((prev) => ({ ...prev, midi: { ...prev.midi, enabled: !prev.midi.enabled } }))}
      />
      <LegacyMigrationSummary />
      <MigrationChecklistPanel />

      <div className="glass-panel absolute bottom-4 left-4 right-4 z-30 flex h-8 items-center justify-between rounded-lg px-4 text-xs text-muted-foreground">
        <span>{formatStatus(params)}</span>
        <span>Double-click canvas for fullscreen · Ctrl+S pour compiler</span>
      </div>
    </div>
  );
}
