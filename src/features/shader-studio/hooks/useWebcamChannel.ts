import { useEffect, useRef, useState } from 'react';

export function useWebcamChannel(enabled: boolean) {
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState('Inactif');

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setStatus('Inactif');
      return;
    }

    let active = true;

    const run = async () => {
      try {
        setStatus('Connexion caméra…');
        const nextStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!active) {
          nextStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = nextStream;
        setStream(nextStream);
        setStatus('Webcam active');
      } catch (error) {
        setStatus(`Erreur webcam: ${error instanceof Error ? error.message : 'inconnue'}`);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [enabled]);

  return { webcamStream: stream, webcamStatus: status };
}
