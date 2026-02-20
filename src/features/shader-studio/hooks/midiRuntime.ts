export async function requestMidiAccess() {
  if (!navigator.requestMIDIAccess) {
    throw new Error('Web MIDI indisponible');
  }
  return navigator.requestMIDIAccess();
}
