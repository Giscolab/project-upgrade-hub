/**
 * AudioEngine legacy bridge.
 * Keeps the class API shape while using a modern lightweight WebAudio runtime.
 */
export class AudioEngine {
  constructor({ fftSize = 2048 } = {}) {
    this.fftSize = fftSize;
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.data = null;
    this.raf = null;
    this.running = false;
    this.smoothing = { bass: 0.75, mid: 0.7, high: 0.65 };
    this.bands = { bass: 0, mid: 0, high: 0 };
    this.listeners = new Set();
  }

  async start() {
    if (this.running) return;

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.85;

    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    this.source.connect(this.analyser);
    this.running = true;
    this.#tick();
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;

    this.source?.disconnect();
    this.analyser?.disconnect();

    this.stream?.getTracks().forEach((track) => track.stop());

    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close();
    }

    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
  }

  setSmoothing({ bass, mid, high } = {}) {
    if (typeof bass === 'number') this.smoothing.bass = bass;
    if (typeof mid === 'number') this.smoothing.mid = mid;
    if (typeof high === 'number') this.smoothing.high = high;
  }

  onUpdate(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getBands() {
    return { ...this.bands };
  }

  dispose() {
    this.stop();
    this.listeners.clear();
  }

  #tick() {
    if (!this.running || !this.analyser || !this.data) return;

    this.analyser.getByteFrequencyData(this.data);

    const bassRaw = this.#average(0, 15);
    const midRaw = this.#average(16, 63);
    const highRaw = this.#average(64, 127);

    this.bands.bass = this.#smooth(this.bands.bass, bassRaw, this.smoothing.bass);
    this.bands.mid = this.#smooth(this.bands.mid, midRaw, this.smoothing.mid);
    this.bands.high = this.#smooth(this.bands.high, highRaw, this.smoothing.high);

    this.listeners.forEach((listener) => listener(this.getBands()));
    this.raf = requestAnimationFrame(() => this.#tick());
  }

  #average(start, end) {
    if (!this.data) return 0;
    let sum = 0;
    let count = 0;

    for (let i = start; i <= end && i < this.data.length; i += 1) {
      sum += this.data[i] / 255;
      count += 1;
    }

    return count > 0 ? sum / count : 0;
  }

  #smooth(current, next, amount) {
    return current * amount + next * (1 - amount);
  }
}

export default AudioEngine;
