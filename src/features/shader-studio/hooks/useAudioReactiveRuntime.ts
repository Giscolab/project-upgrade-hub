import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioBands {
  bass: number;
  mid: number;
  high: number;
}

const EMPTY_BANDS: AudioBands = { bass: 0, mid: 0, high: 0 };

export function useAudioReactiveRuntime(enabled: boolean, beatThreshold: number) {
  const [bands, setBands] = useState<AudioBands>(EMPTY_BANDS);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sourceLabel, setSourceLabel] = useState('microphone');
  const [beatPulse, setBeatPulse] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const fileAudioRef = useRef<HTMLAudioElement | null>(null);
  const beatCooldownUntilRef = useRef(0);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    sourceNodeRef.current?.disconnect();
    sourceNodeRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (fileAudioRef.current) {
      fileAudioRef.current.pause();
      fileAudioRef.current.src = '';
      fileAudioRef.current.load();
    }
    fileAudioRef.current = null;

    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;

    setBands(EMPTY_BANDS);
    setActive(false);
    setPaused(false);
    setBeatPulse(false);
    setSourceLabel('microphone');
  }, []);

  const attachAndRunAnalyser = useCallback((analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      analyser.getByteFrequencyData(data);
      const sample = (start: number, end: number) => {
        let total = 0;
        for (let i = start; i < end; i += 1) total += data[i];
        return total / Math.max(1, end - start) / 255;
      };

      const nextBands = {
        bass: sample(0, 24),
        mid: sample(24, 128),
        high: sample(128, data.length),
      };
      setBands(nextBands);

      const now = performance.now();
      const energy = (nextBands.bass * 0.5) + (nextBands.mid * 0.35) + (nextBands.high * 0.15);
      if (energy > beatThreshold && now > beatCooldownUntilRef.current) {
        beatCooldownUntilRef.current = now + 250;
        setBeatPulse(true);
        window.setTimeout(() => setBeatPulse(false), 120);
      }

      rafRef.current = requestAnimationFrame(update);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(update);
  }, [beatThreshold]);

  const startMicrophone = useCallback(async () => {
    if (!enabled || active || !navigator.mediaDevices?.getUserMedia) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    audioContextRef.current = context;
    analyserRef.current = analyser;
    streamRef.current = stream;
    sourceNodeRef.current = source;
    setSourceLabel('microphone');
    setActive(true);
    setPaused(false);

    attachAndRunAnalyser(analyser);
  }, [active, attachAndRunAnalyser, enabled]);

  const startFile = useCallback(async (file: File) => {
    if (!enabled || active) return;

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;

    const audioEl = new Audio(URL.createObjectURL(file));
    audioEl.loop = true;
    audioEl.crossOrigin = 'anonymous';

    const source = context.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(context.destination);

    await context.resume();
    await audioEl.play();

    fileAudioRef.current = audioEl;
    audioContextRef.current = context;
    analyserRef.current = analyser;
    sourceNodeRef.current = source;
    setSourceLabel(file.name);
    setActive(true);
    setPaused(false);

    attachAndRunAnalyser(analyser);
  }, [active, attachAndRunAnalyser, enabled]);

  const pause = useCallback(async () => {
    if (!active || paused) return;
    fileAudioRef.current?.pause();
    if (audioContextRef.current?.state === 'running') {
      await audioContextRef.current.suspend();
    }
    setPaused(true);
  }, [active, paused]);

  const resume = useCallback(async () => {
    if (!active || !paused) return;
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    if (fileAudioRef.current) {
      await fileAudioRef.current.play();
    }
    setPaused(false);
  }, [active, paused]);

  useEffect(() => {
    if (!enabled) cleanup();
    return cleanup;
  }, [cleanup, enabled]);

  return {
    bands,
    active,
    paused,
    beatPulse,
    sourceLabel,
    startMicrophone,
    startFile,
    pause,
    resume,
    stop: cleanup,
  };
}
