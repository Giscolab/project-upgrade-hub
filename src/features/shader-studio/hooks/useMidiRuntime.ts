import { useEffect, useState } from 'react';

type MidiTarget = 'amplitude' | 'frequency' | 'speed' | 'scale';

export function useMidiRuntime(
  enabled: boolean,
  mapping: Partial<Record<number, MidiTarget>>,
  onValue: (target: MidiTarget, normalizedValue: number) => void,
) {
  const [status, setStatus] = useState('MIDI inactive');

  useEffect(() => {
    if (!enabled || !navigator.requestMIDIAccess) {
      setStatus(enabled ? 'Web MIDI indisponible' : 'MIDI inactive');
      return;
    }

    let active = true;
    const listeners: Array<{ input: MIDIInput; fn: (event: MIDIMessageEvent) => void }> = [];

    navigator.requestMIDIAccess().then((access) => {
      if (!active) return;
      setStatus(`MIDI connecté (${access.inputs.size} entrée${access.inputs.size > 1 ? 's' : ''})`);
      access.inputs.forEach((input) => {
        const fn = (event: MIDIMessageEvent) => {
          const [statusByte, cc, value] = event.data;
          if ((statusByte & 0xf0) !== 0xb0) return;
          const target = mapping[cc];
          if (!target) return;
          onValue(target, (value ?? 0) / 127);
        };
        input.addEventListener('midimessage', fn);
        listeners.push({ input, fn });
      });
    }).catch(() => {
      setStatus('Permission MIDI refusée');
    });

    return () => {
      active = false;
      listeners.forEach(({ input, fn }) => input.removeEventListener('midimessage', fn));
    };
  }, [enabled, mapping, onValue]);

  return { status };
}
