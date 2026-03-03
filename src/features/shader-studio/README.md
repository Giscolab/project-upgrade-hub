# Shader Studio

## Contraintes OSC (WebSocket)

Le runtime OSC (`useOscRuntime`) valide strictement l'URL avant toute connexion.

- Protocoles autorisés : `ws:` et `wss:`.
- Hôtes autorisés par défaut : `localhost`, `127.0.0.1`, `::1`.
- Ports autorisés par défaut : `8081`.
- Interdits : credentials (`user:pass@`), query params, fragments (`#...`).

La validation est centralisée dans `utils/oscUrlValidation.ts` via `validateOscWebSocketUrl(raw)`.
Toute évolution OSC doit conserver cette validation (défense en profondeur côté UI + runtime).
