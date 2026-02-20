/**
 * VideoRecorder legacy bridge.
 * Maintains the old API surface while delegating capture to browser MediaRecorder.
 */
export class VideoRecorder {
  static RESOLUTIONS = {
    'Source (native)': null,
    '1280x720': { width: 1280, height: 720 },
    '1920x1080': { width: 1920, height: 1080 },
    '3840x2160': { width: 3840, height: 2160 },
  };

  static COMPRESSION_PRESETS = {
    'Haute qualité': { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8_000_000 },
    'Standard': { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 4_000_000 },
    'Légère': { mimeType: 'video/webm', videoBitsPerSecond: 2_500_000 },
  };

  static download(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }

  constructor(canvas) {
    this.canvas = canvas;
    this.recorder = null;
    this.chunks = [];
  }

  async record({ duration = 10, fps = 60, resolution = 'Source (native)', compression = 'Haute qualité' } = {}) {
    if (!this.canvas) {
      throw new Error('VideoRecorder requires a canvas element.');
    }

    const originalSize = { width: this.canvas.width, height: this.canvas.height };
    const requestedResolution = VideoRecorder.RESOLUTIONS[resolution] ?? null;

    if (requestedResolution) {
      this.canvas.width = requestedResolution.width;
      this.canvas.height = requestedResolution.height;
    }

    const stream = this.canvas.captureStream(fps);
    const preset = VideoRecorder.COMPRESSION_PRESETS[compression] ?? VideoRecorder.COMPRESSION_PRESETS['Standard'];
    const mimeType = MediaRecorder.isTypeSupported(preset.mimeType) ? preset.mimeType : 'video/webm';

    this.chunks = [];
    this.recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: preset.videoBitsPerSecond,
    });

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };

    const result = await new Promise((resolve) => {
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          mimeType,
        });
      };

      this.recorder.start();
      setTimeout(() => this.stop(), duration * 1000);
    });

    this.canvas.width = originalSize.width;
    this.canvas.height = originalSize.height;

    return result;
  }

  stop() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
  }
}

export default VideoRecorder;
