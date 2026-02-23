import { useEffect, useRef, useState } from 'react';
import { ShaderParams } from '@/types/shader';

interface OscMessage {
  route?: string;
  address?: string;
  target?: string;
  param?: string;
  value?: number;
  [key: string]: unknown;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function mapToShaderParam(target: string, value: number, params: ShaderParams): Partial<ShaderParams> | null {
  const normalized = clamp01(value);

  switch (target) {
    case 'uSpeed':
    case 'speed':
      return { speed: normalized * 4 };
    case 'uScale':
    case 'scale':
      return { scale: 0.2 + normalized * 3.8 };
    case 'uAmplitude':
    case 'uDisplacementStrength':
    case 'amplitude':
      return { amplitude: normalized * 2 };
    case 'uFrequency':
    case 'frequency':
      return { frequency: 0.1 + normalized * 11.9 };
    case 'uTwist':
    case 'twist':
      return { material: { ...params.material, twist: normalized * 8 } };
    case 'uPulse':
    case 'pulse':
      return { material: { ...params.material, pulse: normalized * 10 } };
    default:
      return null;
  }
}

export function useOscRuntime(
  enabled: boolean,
  url: string,
  route: string,
  params: ShaderParams,
  onPatchParams: (patch: Partial<ShaderParams>) => void,
) {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState('Déconnecté');

  useEffect(() => {
    if (!enabled) {
      socketRef.current?.close();
      socketRef.current = null;
      setStatus('Déconnecté');
      return;
    }

    let closedByCleanup = false;
    const socket = new WebSocket(url);
    socketRef.current = socket;
    setStatus('Connexion…');

    socket.onopen = () => setStatus('Connecté');
    socket.onerror = () => setStatus('Erreur');
    socket.onclose = () => {
      if (!closedByCleanup) {
        setStatus('Déconnecté');
      }
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as OscMessage;
        const messageRoute = String(payload.route ?? payload.address ?? '');
        if (messageRoute && route && messageRoute !== route) return;

        const target = String(payload.target ?? payload.param ?? '');
        const value = Number(payload.value);
        if (!target || Number.isNaN(value)) return;

        const patch = mapToShaderParam(target, value, params);
        if (patch) {
          onPatchParams(patch);
        }
      } catch {
        // ignore malformed OSC bridge payload
      }
    };

    return () => {
      closedByCleanup = true;
      socket.close();
      socketRef.current = null;
    };
  }, [enabled, onPatchParams, params, route, url]);

  return { status };
}
