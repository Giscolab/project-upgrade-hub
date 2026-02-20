import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { DEFAULT_STUDIO_STATE, STUDIO_STATE_VERSION } from './config/studioDefaults';
import { exportShadertoyShader } from './services/shadertoyExportService';
import { exportShaderSource } from './services/shaderExportService';
import { downloadBlob, exportCanvasPng, recordCanvasVideo } from './services/videoExportService';
import { WebGPUComputeService } from './services/webgpuComputeService';
import { DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from '@/types/shader';
import { StudioState } from './types';

interface NamedPreset {
  version: number;
  createdAt: string;
  state: StudioState;
}

const PRESET_STORAGE_KEY = 'shader-studio-react-presets-v3';

const BabylonCanvas = lazy(() => import('@/components/shader/BabylonCanvas'));

function readPresetLibrary(): Record<string, NamedPreset> {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, NamedPreset>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePresetLibrary(library: Record<string, NamedPreset>) {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(library));
}

export default function ShaderStudioPage() {
  const initialState = useMemo(() => readPersistedStudioState(), []);
  const [loading, setLoading] = useState(true);
  const [engineReady, setEngineReady] = useState(false);
  const [firstFrameRendered, setFirstFrameRendered] = useState(false);
  const [shaderCompiled, setShaderCompiled] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [state, setState] = useState<StudioState>(initialState || DEFAULT_STUDIO_STATE);
  const [history, setHistory] = useState<StudioState[]>([]);
  const [future, setFuture] = useState<StudioState[]>([]);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [shaderError, setShaderError] = useState<string | null>(null);
  const [webgpuStatus, setWebgpuStatus] = useState(
    WebGPUComputeService.isSupported() ? 'WebGPU disponible (test non exécuté)' : 'WebGPU indisponible sur ce navigateur',
  );

  const [vertexShader, setVertexShader] = useState(DEFAULT_VERTEX_SHADER);
  const [fragmentShader, setFragmentShader] = useState(DEFAULT_FRAGMENT_SHADER);
  const [compileKey, setCompileKey] = useState(0);
  const [presetLibrary, setPresetLibrary] = useState<Record<string, NamedPreset>>(() => readPresetLibrary());
  const [selectedPresetName, setSelectedPresetName] = useState('');

  const { bands, beatPulse, paused, sourceLabel, startMicrophone, startFile, pause, resume, stop } = useAudioReactiveRuntime(
    state.audio.enabled,
    state.audio.beatThreshold,
  );
  const webgpuRef = useRef(new WebGPUComputeService());
  const exportAbortControllerRef = useRef<AbortController | null>(null);
  const readinessRef = useRef({ engineReady: false, firstFrameRendered: false, shaderCompiled: false });
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportInProgress, setExportInProgress] = useState(false);

  const updateState = useCallback((updater: StudioState | ((prev: StudioState) => StudioState), pushHistory = true) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next === prev) return prev;
      if (pushHistory) {
        setHistory((entries) => [...entries.slice(-49), prev]);
        setFuture([]);
      }
      return next;
    });
  }, []);

  const params = state.shader;
  const setParams = useCallback((updater: StudioState['shader'] | ((prev: StudioState['shader']) => StudioState['shader'])) => {
    updateState((prev) => ({
      ...prev,
      shader: typeof updater === 'function' ? updater(prev.shader) : updater,
    }));
  }, [updateState]);

  useStudioPersistence(state);

  const handleEngineReady = useCallback(() => {
    readinessRef.current.engineReady = true;
    setEngineReady(true);
  }, []);

  const handleFirstFrame = useCallback(() => {
    readinessRef.current.firstFrameRendered = true;
    setFirstFrameRendered(true);
    setLoading(false);
  }, []);

  const handleShaderCompiled = useCallback(() => {
    readinessRef.current.shaderCompiled = true;
    setShaderCompiled(true);
  }, []);

  const handleRuntimeError = useCallback((message: string | null) => {
    setRuntimeError(message);
    if (message) setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    setRuntimeError(null);
    setEngineReady(false);
    setFirstFrameRendered(false);
    setShaderCompiled(false);
    readinessRef.current = { engineReady: false, firstFrameRendered: false, shaderCompiled: false };

    const timeoutId = window.setTimeout(() => {
      if (!readinessRef.current.firstFrameRendered) {
        const details = [
          readinessRef.current.engineReady ? null : 'WebGL context creation failed or was blocked',
          readinessRef.current.shaderCompiled ? null : 'shader compile error or stalled pipeline',
        ].filter(Boolean);
        const reason = details.length > 0 ? details.join(' · ') : 'render loop did not produce a frame';
        setRuntimeError(`Engine readiness timeout: ${reason}`);
        setLoading(false);
      }
    }, 7000);

    return () => window.clearTimeout(timeoutId);
  }, [compileKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        setHistory((entries) => {
          const previous = entries[entries.length - 1];
          if (!previous) return entries;
          setFuture((nextFuture) => [state, ...nextFuture]);
          updateState(previous, false);
          return entries.slice(0, -1);
        });
      }
      if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        setFuture((entries) => {
          const next = entries[0];
          if (!next) return entries;
          setHistory((nextHistory) => [...nextHistory, state]);
          updateState(next, false);
          return entries.slice(1);
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state, updateState]);

  const { status: midiStatus } = useMidiRuntime(state.midi.enabled, state.midi.mappedCc, (target, normalizedValue) => {
    setParams((prev) => ({ ...prev, [target]: target === 'frequency' ? 0.1 + normalizedValue * 8 : normalizedValue * 2 }));
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
      const blob = await recordCanvasVideo(canvasEl, state.video, { signal: abortController.signal, onProgress: setExportProgress });
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

  const handleUndo = useCallback(() => {
    setHistory((entries) => {
      const previous = entries[entries.length - 1];
      if (!previous) return entries;
      setFuture((nextFuture) => [state, ...nextFuture]);
      updateState(previous, false);
      return entries.slice(0, -1);
    });
  }, [state, updateState]);

  const handleRedo = useCallback(() => {
    setFuture((entries) => {
      const next = entries[0];
      if (!next) return entries;
      setHistory((nextHistory) => [...nextHistory, state]);
      updateState(next, false);
      return entries.slice(1);
    });
  }, [state, updateState]);

  const handleSavePreset = useCallback(() => {
    const name = selectedPresetName.trim();
    if (!name) return;
    const nextLibrary = {
      ...presetLibrary,
      [name]: {
        version: STUDIO_STATE_VERSION,
        createdAt: new Date().toISOString(),
        state,
      },
    };
    setPresetLibrary(nextLibrary);
    writePresetLibrary(nextLibrary);
  }, [presetLibrary, selectedPresetName, state]);

  const handleLoadPreset = useCallback(() => {
    const name = selectedPresetName.trim();
    if (!name || !presetLibrary[name]) return;
    updateState(presetLibrary[name].state);
  }, [presetLibrary, selectedPresetName, updateState]);

  const handleDeletePreset = useCallback(() => {
    const name = selectedPresetName.trim();
    if (!name || !presetLibrary[name]) return;
    const nextLibrary = { ...presetLibrary };
    delete nextLibrary[name];
    setPresetLibrary(nextLibrary);
    writePresetLibrary(nextLibrary);
  }, [presetLibrary, selectedPresetName]);

  const handleCancelExportVideo = useCallback(() => exportAbortControllerRef.current?.abort(), []);
  const handleExportPng = useCallback(async () => {
    if (!canvasEl) {
      setExportStatus('Export PNG impossible: canvas indisponible.');
      return;
    }

    setExportStatus('Export PNG en cours...');

    try {
      const blob = await exportCanvasPng(canvasEl);
      downloadBlob(blob, `shader-studio-${Date.now()}.png`);
      setExportStatus('Export PNG terminé.');
    } catch (error) {
      setExportStatus(`Erreur export PNG: ${error instanceof Error ? error.message : 'inconnue'}`);
    }
  }, [canvasEl]);

  const handleExportShadertoy = useCallback(() => exportShadertoyShader(state.shader, state.shaderToy.channels), [state.shader, state.shaderToy.channels]);

  const handleCompile = useCallback(() => {
    setCompileKey((k) => k + 1);
    setShaderError(null);
    setRuntimeError(null);
  }, []);

  const handleExportCode = useCallback(() => exportShaderSource(fragmentShader, `shader-${Date.now()}.frag`), [fragmentShader]);

  const handleRunWebGPU = useCallback(async () => {
    if (!WebGPUComputeService.isSupported()) {
      setWebgpuStatus('WebGPU indisponible sur ce navigateur');
      return;
    }
    try {
      const result = await webgpuRef.current.runParticleSimulation({ particleCount: 2048, deltaTime: 0.016 });
      setWebgpuStatus(`Simulation WebGPU OK · ${result.particleCount} particules · sample=(${result.sample.x.toFixed(2)}, ${result.sample.y.toFixed(2)})`);
    } catch (error) {
      setWebgpuStatus(`Erreur WebGPU: ${error instanceof Error ? error.message : 'inconnue'}`);
    }
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {loading && <GPULoader onLoaded={() => undefined} />}
      <Suspense fallback={null}>
        <BabylonCanvas
        key={compileKey}
        params={mappedParams}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        shaderToyChannels={state.shaderToy.channels}
        onCanvasReady={setCanvasEl}
        onEngineReady={handleEngineReady}
        onFirstFrame={handleFirstFrame}
        onShaderCompiled={handleShaderCompiled}
        onShaderError={setShaderError}
        onRuntimeError={handleRuntimeError}
        />
      </Suspense>

      <header className="glass-panel absolute left-4 right-4 top-4 z-30 flex h-12 items-center justify-between rounded-xl px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="text-sm font-semibold tracking-widest text-foreground">SHADER STUDIO / REACT</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {engineReady && firstFrameRendered && shaderCompiled ? 'Runtime prêt' : 'Unification React en cours'}
        </div>
      </header>

      {shaderError && (
        <section className="glass-panel absolute left-[460px] top-20 z-30 max-w-xl rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
          <p className="mb-1 font-semibold">Shader compile/runtime error</p>
          <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed">{shaderError}</pre>
        </section>
      )}

      {runtimeError && (
        <section className="glass-panel absolute left-[460px] top-56 z-30 max-w-xl rounded-lg border border-destructive/40 p-3 text-xs text-destructive">
          <p className="mb-1 font-semibold">Engine readiness failed</p>
          <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed">{runtimeError}</pre>
        </section>
      )}

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
        beatPulse={beatPulse}
        audioPaused={paused}
        activeAudioSource={sourceLabel}
        shaderToyChannels={state.shaderToy.channels}
        presetNames={Object.keys(presetLibrary)}
        selectedPresetName={selectedPresetName}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onAudioChange={(audio) => updateState((prev) => ({ ...prev, audio }))}
        onVideoChange={(video) => updateState((prev) => ({ ...prev, video }))}
        onStartMicrophone={() => {
          updateState((prev) => ({ ...prev, audio: { ...prev.audio, enabled: true, source: 'mic', fileName: null } }));
          startMicrophone();
        }}
        onSelectAudioFile={(file) => {
          updateState((prev) => ({ ...prev, audio: { ...prev.audio, enabled: true, source: 'file', fileName: file.name } }));
          startFile(file);
        }}
        onPauseAudio={pause}
        onResumeAudio={resume}
        onStopAudio={() => {
          updateState((prev) => ({ ...prev, audio: { ...prev.audio, enabled: false } }));
          stop();
        }}
        onUpdateShaderToyChannel={(index, value) => updateState((prev) => {
          const channels = [...prev.shaderToy.channels];
          channels[index] = value;
          return { ...prev, shaderToy: { ...prev.shaderToy, enabled: channels.some(Boolean), channels } };
        })}
        onExportVideo={handleExportVideo}
        onCancelExportVideo={handleCancelExportVideo}
        onExportPng={handleExportPng}
        onExportShadertoy={handleExportShadertoy}
        onRunWebGPU={handleRunWebGPU}
        onToggleMidi={() => updateState((prev) => ({ ...prev, midi: { ...prev.midi, enabled: !prev.midi.enabled } }))}
        onPresetNameChange={setSelectedPresetName}
        onSavePreset={handleSavePreset}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <LegacyMigrationSummary />
      <MigrationChecklistPanel />

      <div className="glass-panel absolute bottom-4 left-4 right-4 z-30 flex h-8 items-center justify-between rounded-lg px-4 text-xs text-muted-foreground">
        <span>{formatStatus(params)}</span>
        <span>Double-click canvas fullscreen · Ctrl/Cmd+Z undo · Ctrl/Cmd+Y redo</span>
      </div>
    </div>
  );
}
