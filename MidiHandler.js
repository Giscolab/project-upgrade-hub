/**
 * MidiHandler legacy bridge.
 * Exposes a class API compatible with older orchestration code.
 */
export class MidiHandler {
  constructor() {
    this.midiAccess = null;
    this.inputs = new Map();
    this.listeners = new Set();
    this.connected = false;
  }

  static isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
  }

  async init() {
    if (!MidiHandler.isSupported()) {
      throw new Error('Web MIDI API is not supported in this browser.');
    }

    if (this.connected) return;

    this.midiAccess = await navigator.requestMIDIAccess();
    this.midiAccess.onstatechange = () => this.#bindInputs();
    this.#bindInputs();
    this.connected = true;
  }

  onMessage(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus() {
    return {
      connected: this.connected,
      inputCount: this.inputs.size,
      names: Array.from(this.inputs.values()).map((input) => input.name || 'Unknown input'),
    };
  }

  dispose() {
    this.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    this.inputs.clear();

    if (this.midiAccess) {
      this.midiAccess.onstatechange = null;
    }

    this.connected = false;
    this.midiAccess = null;
    this.listeners.clear();
  }

  #bindInputs() {
    if (!this.midiAccess) return;

    this.inputs.clear();
    this.midiAccess.inputs.forEach((input) => {
      this.inputs.set(input.id, input);
      input.onmidimessage = (event) => {
        const [status = 0, cc = 0, value = 0] = event.data ?? [];
        const payload = {
          status,
          cc,
          value,
          normalized: value / 127,
          raw: event,
          device: input.name || 'Unknown input',
        };

        this.listeners.forEach((listener) => listener(payload));
      };
    });
  }
}

export default MidiHandler;
