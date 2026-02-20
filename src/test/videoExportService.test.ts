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
    resolution: '1920x1080',
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

  function createCanvasWithStream() {
    const tracks = [{ stop: vi.fn() }, { stop: vi.fn() }];
    const canvas = document.createElement('canvas') as HTMLCanvasElement & {
      captureStream: (fps: number) => MediaStream;
    };
    canvas.width = 800;
    canvas.height = 600;
    canvas.captureStream = vi.fn(() => ({ getTracks: () => tracks } as unknown as MediaStream));
    return { canvas, tracks };
  }

  it('reports progress and resolves to a blob', async () => {
    const progress: number[] = [];
    const { canvas } = createCanvasWithStream();

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

  it('restaure canvas.width et canvas.height après export réussi', async () => {
    const { canvas } = createCanvasWithStream();

    const promise = recordCanvasVideo(canvas, settings);

    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);

    await vi.advanceTimersByTimeAsync(1200);
    await promise;

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it('restaure canvas.width et canvas.height après abort/annulation', async () => {
    const controller = new AbortController();
    const { canvas } = createCanvasWithStream();

    const promise = recordCanvasVideo(canvas, settings, {
      signal: controller.signal,
    });

    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);

    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it('appelle stop() sur toutes les tracks du stream après export', async () => {
    const { canvas, tracks } = createCanvasWithStream();

    const promise = recordCanvasVideo(canvas, settings);

    await vi.advanceTimersByTimeAsync(1200);
    await promise;

    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
  });
});
