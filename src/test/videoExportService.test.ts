import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { recordCanvasVideo } from '@/features/shader-studio/services/videoExportService';
import type { VideoExportSettings } from '@/features/shader-studio/types';

class FakeMediaRecorder {
  static isTypeSupported = vi.fn(() => true);

  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['chunk']) });
    this.onstop?.();
  }
}

describe('recordCanvasVideo', () => {
  const settings: VideoExportSettings = {
    duration: 1,
    compression: 'video/webm;codecs=vp9',
    resolution: '1280x720',
    fps: 30,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reports progress and resolves to a blob', async () => {
    const progress: number[] = [];
    const canvas = document.createElement('canvas') as HTMLCanvasElement & {
      captureStream: (fps: number) => MediaStream;
    };
    canvas.captureStream = vi.fn(() => ({ getTracks: () => [{ stop: vi.fn() }] } as unknown as MediaStream));

    const promise = recordCanvasVideo(canvas, settings, {
      onProgress: (value) => progress.push(value),
    });

    await vi.advanceTimersByTimeAsync(1200);
    const blob = await promise;

    expect(blob).toBeInstanceOf(Blob);
    expect(progress[0]).toBe(0);
    expect(progress.at(-1)).toBe(100);
    expect(progress.some((value) => value > 0 && value < 100)).toBe(true);
  });

  it('rejects with AbortError when export is cancelled', async () => {
    const controller = new AbortController();
    const canvas = document.createElement('canvas') as HTMLCanvasElement & {
      captureStream: (fps: number) => MediaStream;
    };
    canvas.captureStream = vi.fn(() => ({ getTracks: () => [{ stop: vi.fn() }] } as unknown as MediaStream));

    const promise = recordCanvasVideo(canvas, settings, {
      signal: controller.signal,
    });

    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
