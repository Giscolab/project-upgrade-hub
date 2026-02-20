export function createAudioContext() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API indisponible');
  }
  return new AudioContextClass();
}

export function createLoopingAudioElement(file: File) {
  const audioEl = new Audio(URL.createObjectURL(file));
  audioEl.loop = true;
  audioEl.crossOrigin = 'anonymous';
  return audioEl;
}
