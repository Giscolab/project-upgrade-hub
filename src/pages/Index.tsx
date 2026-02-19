import { useState, useCallback } from 'react';
import { useShaderParams } from '@/hooks/useShaderParams';
import BabylonCanvas from '@/components/shader/BabylonCanvas';
import GPULoader from '@/components/shader/GPULoader';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const { params } = useShaderParams();

  const handleLoaded = useCallback(() => setLoading(false), []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {loading && <GPULoader onLoaded={handleLoaded} />}

      {/* WebGL Canvas */}
      <BabylonCanvas params={params} />

      {/* Top bar overlay */}
      <header className="glass-panel absolute left-4 right-4 top-4 z-30 flex h-12 items-center justify-between rounded-xl px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="text-sm font-semibold tracking-widest text-foreground">
            SHADER STUDIO
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>v5.0</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span>WebGL 2.0</span>
        </div>
      </header>

      {/* Bottom status bar */}
      <div className="glass-panel absolute bottom-4 left-4 right-4 z-30 flex h-8 items-center justify-between rounded-lg px-4 text-xs text-muted-foreground">
        <span>Geometry: {params.geometry} | Noise: {params.noise}</span>
        <span>Double-click for fullscreen</span>
      </div>
    </div>
  );
};

export default Index;
