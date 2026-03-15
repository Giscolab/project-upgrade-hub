import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import GPULoader from '@/components/shader/GPULoader';
import AppLayout from '@/components/layout/AppLayout';
import CanvasOverlay from './components/CanvasOverlay';
import { formatStatus } from './config/defaults';
import { readPersistedStudioState, useStudioPersistence } from './hooks/useStudioPersistence';
import { useAudioReactiveRuntime } from './hooks/useAudioReactiveRuntime';
import { useMidiRuntime } from './hooks/useMidiRuntime';
import { useOscRuntime } from './hooks/useOscRuntime';
import { useWebcamChannel } from './hooks/useWebcamChannel';
import { useTextureLibrary } from './hooks/useTextureLibrary';
import { DEFAULT_STUDIO_STATE, STUDIO_STATE_VERSION } from './config/studioDefaults';
import { exportShadertoyShader } from './services/shadertoyExportService';
import { exportShaderSource } from './services/shaderExportService';
import { downloadBlob, exportCanvasPng, recordCanvasVideo } from './services/videoExportService';
import { WebGPUComputeService } from './services/webgpuComputeService';
import { DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from '@/types/shader';
import { StudioState } from './types';
import { LEGACY_PRESETS, LEGACY_SHADER_CHUNKS, applyLegacyPresetToShaderParams, buildLegacyShaderPair, type LegacyNoise } from './config/legacyShaderStudioV5';
import { useCloudPresets } from './hooks/useCloudPresets';

const BabylonCanvas = lazy(() => import('@/components/shader/BabylonCanvas'));
const RightPanel = lazy(() => import('@/components/layout/RightPanel'));
const GlslEditorPanel = lazy(() => import('./components/GlslEditorPanel'));
const MigrationChecklistPanel = lazy(() => import('./components/MigrationChecklistPanel'));


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
  const { presetNames: cloudPresetNames, savePreset: cloudSavePreset, deletePreset: cloudDeletePreset, loadPreset: cloudLoadPreset } = useCloudPresets();
  const [selectedPresetName, setSelectedPresetName] = useState('');
  const [selectedLegacyPreset, setSelectedLegacyPreset] = useState('');
  const [videoTextureUrl, setVideoTextureUrl] = useState<string | null>(null);
  const [selectedTextureId, setSelectedTextureId] = useState('');

  const { bands, beatPulse, paused, sourceLabel, startMicrophone, startFile, pause, resume, stop } = useAudioReactiveRuntime(
    state.audio.enabled,
    state.audio.beatThreshold,
  );
  const { textures: textureLibrary, addTexture } = useTextureLibrary();
  const webgpuRef = useRef(new WebGPUComputeService());
  const exportAbortControllerRef = useRef<AbortController | null>(null);
  const readinessRef = useRef({ engineReady: false, firstFrameRendered: false, shaderCompiled: false });
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportInProgress, setExportInProgress] = useState(false);
  const [migrationPanelOpen, setMigrationPanelOpen] = useState(false);
  const [panelsMounted, setPanelsMounted] = useState(false);
  const [fps, setFps] = useState(0);

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

  const { status: oscRuntimeStatus } = useOscRuntime(
    state.osc.enabled,
    state.osc.url,
    state.osc.route,
    state.shader,
    (patch) => setParams((prev) => ({ ...prev, ...patch, material: patch.material ?? prev.material })),
  );

  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const { webcamStream, webcamStatus } = useWebcamChannel(webcamEnabled);


  useEffect(() => {
    if (state.osc.status === oscRuntimeStatus) return;
    updateState((prev) => ({ ...prev, osc: { ...prev.osc, status: oscRuntimeStatus } }), false);
  }, [oscRuntimeStatus, state.osc.status, updateState]);

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

  // Rebuild GLSL when noise type changes via dropdown
  useEffect(() => {
    const noiseType = params.noise as LegacyNoise;
    if (LEGACY_SHADER_CHUNKS[noiseType]) {
      const { vertex, fragment } = buildLegacyShaderPair(noiseType);
      setVertexShader(vertex);
      setFragmentShader(fragment);
      setCompileKey((k) => k + 1);
    }
  }, [params.noise]);

  useEffect(() => () => exportAbortControllerRef.current?.abort(), []);

  useEffect(() => {
    const idleCallback = window.requestIdleCallback?.(() => setPanelsMounted(true), { timeout: 1500 });
    const timeoutId = window.setTimeout(() => setPanelsMounted(true), 800);

    return () => {
      if (typeof idleCallback === 'number' && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleCallback);
      }
      window.clearTimeout(timeoutId);
    };
  }, []);


  useEffect(() => () => {
    if (videoTextureUrl) URL.revokeObjectURL(videoTextureUrl);
  }, [videoTextureUrl]);


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

  const handleSavePreset = useCallback(async () => {
    const name = selectedPresetName.trim();
    if (!name) return;
    await cloudSavePreset(name, state);
  }, [cloudSavePreset, selectedPresetName, state]);

  const handleLoadPreset = useCallback(() => {
    const name = selectedPresetName.trim();
    const loaded = cloudLoadPreset(name);
    if (loaded) updateState(loaded);
  }, [cloudLoadPreset, selectedPresetName, updateState]);

  const handleDeletePreset = useCallback(async () => {
    const name = selectedPresetName.trim();
    if (!name) return;
    await cloudDeletePreset(name);
  }, [cloudDeletePreset, selectedPresetName]);

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

  const handleApplyLegacyPreset = useCallback(() => {
    const preset = LEGACY_PRESETS[selectedLegacyPreset];
    if (!preset) return;

    updateState((prev) => ({
      ...prev,
      shader: applyLegacyPresetToShaderParams(prev.shader, preset),
    }));

    const { vertex, fragment } = buildLegacyShaderPair(preset.noiseType);
    setVertexShader(vertex);
    setFragmentShader(fragment);
    setCompileKey((k) => k + 1);
    setShaderError(null);
    setRuntimeError(null);
  }, [selectedLegacyPreset, updateState]);

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

  useEffect(() => {
    let frameCount = 0;
    let last = performance.now();
    let rafId = 0;

    const measure = (now: number) => {
      frameCount += 1;
      if (now - last >= 1000) {
        setFps((frameCount * 1000) / (now - last));
        frameCount = 0;
        last = now;
      }
      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, []);


  const handleCanvasDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  }, []);

  const handleCanvasDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('drag-over');
  }, []);

  const handleCanvasDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => addTexture(file.name, String(reader.result));
    reader.readAsDataURL(file);

    updateState((prev) => {
      const channels = [...prev.shaderToy.channels];
      channels[0] = url;
      return { ...prev, shaderToy: { ...prev.shaderToy, enabled: true, channels } };
    });
  }, [addTexture, updateState]);

  const resolution = canvasEl ? `${canvasEl.width} x ${canvasEl.height}` : '—';
  const compileOk = engineReady && firstFrameRendered && shaderCompiled && !shaderError && !runtimeError;

  return (
    <AppLayout
      shaderName={params.noise}
      compileOk={compileOk}
      statusText={formatStatus(params)}
      onToggleMigration={() => setMigrationPanelOpen((prev) => !prev)}
      leftPanel={(
        <Suspense fallback={<div className="h-full animate-pulse bg-[#111118]" />}>
          {panelsMounted ? (
            <GlslEditorPanel
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              onVertexChange={setVertexShader}
              onFragmentChange={setFragmentShader}
              onCompile={handleCompile}
              onExportCode={handleExportCode}
            />
          ) : (
            <div className="h-full bg-[#111118]" />
          )}
        </Suspense>
      )}
      canvas={(
        <div className="relative h-full w-full" onDragOver={handleCanvasDragOver} onDragLeave={handleCanvasDragLeave} onDrop={handleCanvasDrop}>
          {loading && <GPULoader onLoaded={() => undefined} />}
          <Suspense fallback={null}>
            <BabylonCanvas
              key={compileKey}
              params={mappedParams}
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              shaderToyChannels={state.shaderToy.channels}
              webcamStream={webcamStream}
              videoTextureUrl={videoTextureUrl}
              onCanvasReady={setCanvasEl}
              onEngineReady={handleEngineReady}
              onFirstFrame={handleFirstFrame}
              onShaderCompiled={handleShaderCompiled}
              onShaderError={setShaderError}
              onRuntimeError={handleRuntimeError}
            />
          </Suspense>

          {shaderError && (
            <section className="absolute left-3 top-3 z-30 max-w-xl rounded border border-[#ef4444]/40 bg-[#111118]/90 p-2 text-xs text-[#ef4444]">
              <p className="mb-1 font-semibold">Shader compile/runtime error</p>
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed">{shaderError}</pre>
            </section>
          )}

          {runtimeError && (
            <section className="absolute left-3 top-32 z-30 max-w-xl rounded border border-[#ef4444]/40 bg-[#111118]/90 p-2 text-xs text-[#ef4444]">
              <p className="mb-1 font-semibold">Engine readiness failed</p>
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed">{runtimeError}</pre>
            </section>
          )}

          <CanvasOverlay
            fps={fps}
            resolution={resolution}
            onFullscreen={() => canvasEl?.requestFullscreen?.()}
          />
          {migrationPanelOpen && (
            <Suspense fallback={null}>
              <MigrationChecklistPanel open={migrationPanelOpen} onClose={() => setMigrationPanelOpen(false)} />
            </Suspense>
          )}
        </div>
      )}
      rightPanel={(
        <Suspense fallback={<aside className="w-[280px] shrink-0 border-l border-[#2a2a3a] bg-[#111118]" />}>
          {panelsMounted ? (
            <RightPanel
              params={params}
              onParamsChange={setParams}
              audio={state.audio}
              video={state.video}
              osc={state.osc}
              webcamEnabled={webcamEnabled}
              webcamStatus={webcamStatus}
              midiStatus={midiStatus}
              webgpuStatus={webgpuStatus}
              exportProgress={exportProgress}
              exportStatus={exportStatus}
              exportInProgress={exportInProgress}
              beatPulse={beatPulse}
              audioPaused={paused}
              activeAudioSource={sourceLabel}
              shaderToyChannels={state.shaderToy.channels}
              textureLibrary={textureLibrary.map((item) => ({ id: item.id, name: item.name }))}
              selectedTextureId={selectedTextureId}
              presetNames={cloudPresetNames}
              selectedPresetName={selectedPresetName}
              canUndo={history.length > 0}
              canRedo={future.length > 0}
              onAudioChange={(audio) => updateState((prev) => ({ ...prev, audio }))}
              onVideoChange={(video) => updateState((prev) => ({ ...prev, video }))}
              onOscChange={(osc) => updateState((prev) => ({ ...prev, osc }))}
              onToggleWebcam={() => setWebcamEnabled((prev) => !prev)}
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

              onSelectTextureId={setSelectedTextureId}
              onApplyTextureFromLibrary={() => {
                const item = textureLibrary.find((entry) => entry.id === selectedTextureId);
                if (!item) return;
                setVideoTextureUrl(null);
                updateState((prev) => {
                  const channels = [...prev.shaderToy.channels];
                  channels[0] = item.dataUrl;
                  return { ...prev, shaderToy: { ...prev.shaderToy, enabled: true, channels } };
                });
              }}
              onUploadTexture={(file) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = String(reader.result);
                  addTexture(file.name, dataUrl);
                  setVideoTextureUrl(null);
                  updateState((prev) => {
                    const channels = [...prev.shaderToy.channels];
                    channels[0] = dataUrl;
                    return { ...prev, shaderToy: { ...prev.shaderToy, enabled: true, channels } };
                  });
                };
                reader.readAsDataURL(file);
              }}
              onUploadVideoTexture={(file) => {
                const url = URL.createObjectURL(file);
                setVideoTextureUrl((previous) => {
                  if (previous) URL.revokeObjectURL(previous);
                  return url;
                });
                updateState((prev) => {
                  const channels = [...prev.shaderToy.channels];
                  channels[0] = null;
                  return { ...prev, shaderToy: { ...prev.shaderToy, enabled: true, channels } };
                });
              }}
              onUploadLayerTexture={(layerIndex, file) => {
                const url = URL.createObjectURL(file);
                updateState((prev) => {
                  const channels = [...prev.shaderToy.channels];
                  channels[layerIndex] = url;
                  return { ...prev, shaderToy: { ...prev.shaderToy, enabled: true, channels } };
                });
              }}
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
              legacyPresetNames={Object.keys(LEGACY_PRESETS)}
              selectedLegacyPreset={selectedLegacyPreset}
              onSelectLegacyPreset={setSelectedLegacyPreset}
              onApplyLegacyPreset={handleApplyLegacyPreset}
            />
          ) : (
            <aside className="w-[280px] shrink-0 border-l border-[#2a2a3a] bg-[#111118]" />
          )}
        </Suspense>
      )}
    />
  );
}
