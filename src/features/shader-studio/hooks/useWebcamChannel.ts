import { useEffect, useState } from 'react';

export function useWebcamChannel(enabled: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState('Inactif');

  useEffect(() => {
    if (!enabled) {
      stream?.getTracks().forEach((track) => track.stop());
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
        setStream(nextStream);
        setStatus('Webcam active');
      } catch (error) {
        setStatus(`Erreur webcam: ${error instanceof Error ? error.message : 'inconnue'}`);
      }
    };

    run();

    return () => {
      active = false;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [enabled]);

  return { webcamStream: stream, webcamStatus: status };
}
