import { Maximize2 } from 'lucide-react';

interface CanvasOverlayProps {
  fps: number;
  resolution: string;
  onFullscreen: () => void;
}

export default function CanvasOverlay({ fps, resolution, onFullscreen }: CanvasOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <button
        type="button"
        onClick={onFullscreen}
        className="pointer-events-auto absolute right-2 top-2 h-7 w-7 rounded border border-[#2a2a3a] bg-[#111118]/50 text-[#8888aa] opacity-30 transition hover:bg-[#1a1a26] hover:opacity-100"
      >
        <Maximize2 className="mx-auto h-3.5 w-3.5" />
      </button>
      <div className="absolute bottom-2 left-2 rounded border border-[#2a2a3a] bg-[#111118]/60 px-2 py-0.5 font-mono text-[11px] text-[#8888aa]">
        FPS {fps.toFixed(1)}
      </div>
      <div className="absolute bottom-2 right-2 rounded border border-[#2a2a3a] bg-[#111118]/60 px-2 py-0.5 font-mono text-[11px] text-[#8888aa]">
        {resolution}
      </div>
    </div>
  );
}
