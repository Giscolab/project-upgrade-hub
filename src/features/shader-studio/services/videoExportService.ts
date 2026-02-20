import { VideoExportSettings } from '../types';

function parseResolution(resolution: string): { width: number; height: number } {
  const [w, h] = resolution.split('x').map((value) => Number(value));
  return { width: w || 1280, height: h || 720 };
}

export interface RecordCanvasVideoOptions {
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

function stopStreamTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

export async function recordCanvasVideo(
  canvas: HTMLCanvasElement,
  settings: VideoExportSettings,
  options: RecordCanvasVideoOptions = {},
) {
  const { width, height } = parseResolution(settings.resolution);
  canvas.width = width;
  canvas.height = height;

  const stream = canvas.captureStream(settings.fps);
  const mimeType = MediaRecorder.isTypeSupported(settings.compression) ? settings.compression : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  let stopTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let progressIntervalId: ReturnType<typeof setInterval> | null = null;
  let aborted = false;

  const clearTimers = () => {
    if (stopTimeoutId) {
      clearTimeout(stopTimeoutId);
      stopTimeoutId = null;
    }
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      progressIntervalId = null;
    }
  };

  const abortHandler = () => {
    aborted = true;
    clearTimers();
    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const result = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => {
      clearTimers();
      stopStreamTracks(stream);
      reject(new Error('MediaRecorder failed while capturing the canvas.'));
    };

    recorder.onstop = () => {
      clearTimers();
      stopStreamTracks(stream);
      options.signal?.removeEventListener('abort', abortHandler);

      if (aborted) {
        reject(new DOMException('Video export cancelled by user.', 'AbortError'));
        return;
      }

      options.onProgress?.(100);
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  options.signal?.addEventListener('abort', abortHandler);

  recorder.start();
  options.onProgress?.(0);

  const startedAt = Date.now();
  const durationMs = Math.max(1, settings.duration * 1000);
  progressIntervalId = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    const progress = Math.min(99, Math.round((elapsed / durationMs) * 100));
    options.onProgress?.(progress);
  }, 100);

  stopTimeoutId = setTimeout(() => {
    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, durationMs);

  return result;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
