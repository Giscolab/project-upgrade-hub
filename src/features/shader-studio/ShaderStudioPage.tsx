import { useCallback, useMemo, useState } from 'react';
import BabylonCanvas from '@/components/shader/BabylonCanvas';
import GPULoader from '@/components/shader/GPULoader';
import { useShaderParams } from '@/hooks/useShaderParams';
import { DEFAULT_SHADER_PARAMS } from '@/types/shader';
import ShaderControls from './components/ShaderControls';
import LegacyMigrationSummary from './components/LegacyMigrationSummary';
import { formatStatus } from './config/defaults';
import { readPersistedParams, useStudioPersistence } from './hooks/useStudioPersistence';

export default function ShaderStudioPage() {
  const [loading, setLoading] = useState(true);
  const persisted = useMemo(() => readPersistedParams(), []);
  const { params, setParams, resetParams } = useShaderParams(persisted ?? DEFAULT_SHADER_PARAMS);

  useStudioPersistence(params);

  const handleLoaded = useCallback(() => setLoading(false), []);

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

      <ShaderControls params={params} onParamsChange={setParams} onReset={resetParams} />
      <LegacyMigrationSummary />

      <div className="glass-panel absolute bottom-4 left-4 right-4 z-30 flex h-8 items-center justify-between rounded-lg px-4 text-xs text-muted-foreground">
        <span>{formatStatus(params)}</span>
        <span>Double-click canvas for fullscreen</span>
      </div>
    </div>
  );
}
