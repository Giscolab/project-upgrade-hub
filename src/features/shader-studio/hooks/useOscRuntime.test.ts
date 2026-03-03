import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SHADER_PARAMS } from '@/types/shader';
import { useOscRuntime } from '@/features/shader-studio/hooks/useOscRuntime';

describe('useOscRuntime', () => {
  it('n’instancie pas WebSocket quand l’URL OSC est invalide', () => {
    const WebSocketMock = vi.fn();
    vi.stubGlobal('WebSocket', WebSocketMock as unknown as typeof WebSocket);

    const onPatchParams = vi.fn();

    const { result } = renderHook(() =>
      useOscRuntime(true, 'http://localhost:8081', '/shader', DEFAULT_SHADER_PARAMS, onPatchParams),
    );

    expect(WebSocketMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe('Le protocole doit être ws: ou wss:');
  });
});
