import { useEffect, useState } from 'react';

interface GPULoaderProps {
  onLoaded: () => void;
}

const GPULoader = ({ onLoaded }: GPULoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing WebGL...');

  useEffect(() => {
    const steps = [
      { p: 20, s: 'Detecting GPU...' },
      { p: 45, s: 'Compiling shaders...' },
      { p: 70, s: 'Building geometry...' },
      { p: 90, s: 'Configuring pipeline...' },
      { p: 100, s: 'Ready' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].p);
        setStatus(steps[i].s);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onLoaded, 300);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onLoaded]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" 
               style={{ animationDuration: '1.5s' }} />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-accent"
               style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary/20 backdrop-blur-sm" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-wider text-foreground">
            SHADER STUDIO
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{status}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GPULoader;
