import { describe, expect, it } from 'vitest';
import { validateOscWebSocketUrl } from '@/features/shader-studio/utils/oscUrlValidation';

describe('validateOscWebSocketUrl', () => {
  it('accepte ws://localhost:8081', () => {
    const result = validateOscWebSocketUrl('ws://localhost:8081');

    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('ws://localhost:8081/');
  });

  it('accepte wss://localhost:8081', () => {
    const result = validateOscWebSocketUrl('wss://localhost:8081');

    expect(result.isValid).toBe(true);
    expect(result.normalizedUrl).toBe('wss://localhost:8081/');
  });

  it('refuse les protocoles non websocket', () => {
    expect(validateOscWebSocketUrl('http://localhost:8081').isValid).toBe(false);
    expect(validateOscWebSocketUrl('file:///tmp/socket').isValid).toBe(false);
  });

  it('refuse les hôtes externes non allowlistés', () => {
    const result = validateOscWebSocketUrl('ws://example.com:8081');

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Hôte OSC non autorisé');
  });

  it('refuse les URLs malformées', () => {
    const result = validateOscWebSocketUrl('ws://localhost::8081');

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('URL OSC invalide');
  });

  it('refuse les credentials dans l’URL', () => {
    const result = validateOscWebSocketUrl('ws://user:pass@localhost:8081');

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('identifiants');
  });

  it('refuse query et fragment', () => {
    expect(validateOscWebSocketUrl('ws://localhost:8081/?foo=1').isValid).toBe(false);
    expect(validateOscWebSocketUrl('ws://localhost:8081/#frag').isValid).toBe(false);
  });
});
