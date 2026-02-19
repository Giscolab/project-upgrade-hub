import { useCallback, useMemo, useState } from 'react';
import BabylonCanvas from '@/components/shader/BabylonCanvas';
import GPULoader from '@/components/shader/GPULoader';
import { useShaderParams } from '@/hooks/useShaderParams';
import ShaderControls from './components/ShaderControls';
import LegacyMigrationSummary from './components/LegacyMigrationSummary';
import AudioVideoControls from './components/AudioVideoControls';
import { formatStatus } from './config/defaults';
import { buildShaderParamsFromLegacy } from './config/legacyAdapter';
import { LEGACY_AUDIO_DEFAULTS, LEGACY_VIDEO_DEFAULTS } from './config/legacyConfig';
import { AudioReactiveSettings, VideoExportSettings } from './types';
import {
  readPersistedAudio,
  readPersistedParams,
  readPersistedVideo,
  useStudioPersistence,
} from './hooks/useStudioPersistence';

export default function ShaderStudioPage() {
  const [loading, setLoading] = useState(true);
  const initialParams = useMemo(() => readPersistedParams() ?? buildShaderParamsFromLegacy(), []);
  const initialAudio = useMemo(() => ({ ...LEGACY_AUDIO_DEFAULTS, ...readPersistedAudio() } as AudioReactiveSettings), []);
  const initialVideo = useMemo(() => ({ ...LEGACY_VIDEO_DEFAULTS, ...readPersistedVideo() } as VideoExportSettings), []);

  const { params, setParams, resetParams } = useShaderParams(initialParams);
  const [audioSettings, setAudioSettings] = useState<AudioReactiveSettings>(initialAudio);
  const [videoSettings, setVideoSettings] = useState<VideoExportSettings>(initialVideo);

  useStudioPersistence(params, audioSettings, videoSettings);

  const handleLoaded = useCallback(() => setLoading(false), []);

  const resetAll = useCallback(() => {
    resetParams();
    setAudioSettings(LEGACY_AUDIO_DEFAULTS as AudioReactiveSettings);
    setVideoSettings(LEGACY_VIDEO_DEFAULTS as VideoExportSettings);
  }, [resetParams]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {loading && <GPULoader onLoaded={handleLoaded} />}
      <BabylonCanvas params={params} />

      <header className="glass-panel absolute left-4 right-4 top-4 z-30 flex h-12 items-center justify-between rounded-xl px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="text-sm font-semibold tracking-widest text-foreground">SHADER STUDIO / REACT</span>
        </div>
        <div className="text-xs text-muted-foreground">Migration legacy JS → React poursuivie</div>
      </header>

      <AudioVideoControls
        audio={audioSettings}
        video={videoSettings}
        onAudioChange={setAudioSettings}
        onVideoChange={setVideoSettings}
      />
      <ShaderControls params={params} onParamsChange={setParams} onReset={resetAll} />
      <LegacyMigrationSummary />

      <div className="glass-panel absolute bottom-4 left-4 right-4 z-30 flex h-8 items-center justify-between rounded-lg px-4 text-xs text-muted-foreground">
        <span>{formatStatus(params)}</span>
        <span>Audio map: bass→{audioSettings.mapBassTo} · Export: {videoSettings.fps} fps</span>
      </div>
    </div>
  );
}
