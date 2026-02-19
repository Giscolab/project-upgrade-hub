import { VideoExportSettings } from '../types';

function parseResolution(resolution: string): { width: number; height: number } {
  const [w, h] = resolution.split('x').map((value) => Number(value));
  return { width: w || 1280, height: h || 720 };
}

export async function recordCanvasVideo(canvas: HTMLCanvasElement, settings: VideoExportSettings) {
  const { width, height } = parseResolution(settings.resolution);
  canvas.width = width;
  canvas.height = height;

  const stream = canvas.captureStream(settings.fps);
  const mimeType = MediaRecorder.isTypeSupported(settings.compression) ? settings.compression : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const result = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  recorder.start();
  setTimeout(() => recorder.stop(), settings.duration * 1000);

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
