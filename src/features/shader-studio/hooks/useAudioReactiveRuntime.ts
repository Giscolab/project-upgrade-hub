import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioBands {
  bass: number;
  mid: number;
  high: number;
}

const EMPTY_BANDS: AudioBands = { bass: 0, mid: 0, high: 0 };

export function useAudioReactiveRuntime(enabled: boolean) {
  const [bands, setBands] = useState<AudioBands>(EMPTY_BANDS);
  const [active, setActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    setBands(EMPTY_BANDS);
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    if (!enabled || active || !navigator.mediaDevices?.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    audioContextRef.current = context;
    analyserRef.current = analyser;
    setActive(true);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      analyser.getByteFrequencyData(data);
      const sample = (start: number, end: number) => {
        let total = 0;
        for (let i = start; i < end; i += 1) total += data[i];
        return total / Math.max(1, end - start) / 255;
      };

      setBands({
        bass: sample(0, 24),
        mid: sample(24, 128),
        high: sample(128, data.length),
      });
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
  }, [active, enabled]);

  useEffect(() => {
    if (!enabled) cleanup();
    return cleanup;
  }, [cleanup, enabled]);

  return { bands, active, start, stop: cleanup };
}
