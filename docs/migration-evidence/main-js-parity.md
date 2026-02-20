# Preuve de parité — `main.js`

## Fichier legacy concerné pour suppression future
- `main.js` (racine du dépôt), à supprimer uniquement après validation complète Gate 1→7.

## Gates 1→7
- [x] Gate 1 — Inventaire figé (API entrypoint + HMR dispose).
- [x] Gate 2 — Mapping legacy → React/TS documenté.
- [x] Gate 3 — Preuve de parité documentée (ce fichier).
- [x] Gate 4 — `migrationPlan.ts` synchronisé avec ce statut.
- [x] Gate 5 — Roadmaps synchronisées (`docs/REACT_MIGRATION_ROADMAP.md`, `roadmap.md`).
- [ ] Gate 6 — PR non encore fusionnée.
- [ ] Gate 7 — Suppression du fichier legacy non exécutée.

## API legacy attendue

`main.js` legacy doit:
- importer `App` depuis `./App.js`,
- instancier `new App()` au chargement,
- conserver le comportement HMR en appelant `app.dispose()` dans `import.meta.hot.dispose(...)`.

## Cible React/TS exacte

- `main.js` reste un point d'entrée bridge minimal qui délègue au runtime React via `App.js`.
- `App.js` encapsule `createRoot(...).render(ReactApp)` et expose `dispose()` via `root.unmount()`.
- Le runtime principal React est `src/main.tsx` + `src/App.tsx`.

Mapping section par section:
1. `import { App } from './App.js';` → conservé tel quel pour compatibilité legacy.
2. `const app = new App();` → instancie le bridge React dans `App.js`.
3. `import.meta.hot.dispose(() => app.dispose())` → garantit la même sémantique de nettoyage en mode dev.

## Scénarios de validation fonctionnelle

1. **Boot nominal**
   - Lancer `npm run build`.
   - Vérifier que le bundle compile avec `main.js` bridge et `src/main.tsx` React sans erreur de type/runtime.

2. **Contrat de cycle de vie bridge**
   - Vérifier statiquement que `App` expose `dispose()` et que `main.js` l'appelle dans le hook HMR.
   - Résultat attendu: aucune divergence de contrat API entre point d'entrée legacy et runtime React.

3. **Parité d'orchestration**
   - Vérifier que le bridge n'implémente aucune logique métier shader/audio/export, uniquement le routage vers React.
   - Résultat attendu: responsabilité strictement limitée à l'entrypoint + cleanup.
