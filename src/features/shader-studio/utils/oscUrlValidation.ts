const DEFAULT_ALLOWED_HOSTS = ['localhost', '127.0.0.1', '::1'] as const;
const DEFAULT_ALLOWED_PORTS = [8081] as const;

export interface OscUrlValidationOptions {
  allowedHosts?: string[];
  allowedPorts?: number[];
}

export interface OscUrlValidationResult {
  isValid: boolean;
  normalizedUrl: string | null;
  error: string | null;
}

function normalizeHost(host: string) {
  return host.trim().toLowerCase();
}

export function validateOscWebSocketUrl(
  raw: string,
  options: OscUrlValidationOptions = {},
): OscUrlValidationResult {
  const value = raw.trim();
  if (!value) {
    return {
      isValid: false,
      normalizedUrl: null,
      error: 'URL OSC requise',
    };
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return {
      isValid: false,
      normalizedUrl: null,
      error: 'URL OSC invalide',
    };
  }

  if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
    return {
      isValid: false,
      normalizedUrl: null,
      error: 'Le protocole doit être ws: ou wss:',
    };
  }

  if (parsed.username || parsed.password) {
    return {
      isValid: false,
      normalizedUrl: null,
      error: 'Les identifiants dans l’URL OSC sont interdits',
    };
  }

  if (parsed.hash) {
    return {
      isValid: false,
      normalizedUrl: null,
      error: 'Les fragments (#...) ne sont pas autorisés',
    };
  }

  if (parsed.search) {
    return {
      isValid: false,
      normalizedUrl: null,
      error: 'Les query params OSC ne sont pas autorisés',
    };
  }

  const allowedHosts = (options.allowedHosts ?? [...DEFAULT_ALLOWED_HOSTS]).map(normalizeHost);
  if (!allowedHosts.includes(normalizeHost(parsed.hostname))) {
    return {
      isValid: false,
      normalizedUrl: null,
      error: `Hôte OSC non autorisé: ${parsed.hostname}`,
    };
  }

  const allowedPorts = options.allowedPorts ?? [...DEFAULT_ALLOWED_PORTS];
  if (allowedPorts.length > 0) {
    if (!parsed.port) {
      return {
        isValid: false,
        normalizedUrl: null,
        error: `Port OSC requis (${allowedPorts.join(', ')})`,
      };
    }

    const port = Number(parsed.port);
    if (!Number.isInteger(port) || !allowedPorts.includes(port)) {
      return {
        isValid: false,
        normalizedUrl: null,
        error: `Port OSC non autorisé: ${parsed.port}`,
      };
    }
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
    error: null,
  };
}
