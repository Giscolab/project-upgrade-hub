# Preuve de parité — `ShadertoyExporter.js`

## Fichier legacy concerné pour suppression future
- `ShadertoyExporter.js` (racine du dépôt), à supprimer uniquement après validation complète Gate 1→7.

## Gates 1→7
- [x] Gate 1 — Inventaire figé (API bridge export ShaderToy).
- [x] Gate 2 — Mapping legacy → React/TS documenté.
- [x] Gate 3 — Preuve de parité documentée (ce fichier + tests).
- [x] Gate 4 — `migrationPlan.ts` synchronisé avec ce statut.
- [x] Gate 5 — Roadmaps synchronisées (`docs/REACT_MIGRATION_ROADMAP.md`, `roadmap.md`).
- [ ] Gate 6 — PR non encore fusionnée.
- [ ] Gate 7 — Suppression du fichier legacy non exécutée.

## API legacy attendue

`ShadertoyExporter.js` legacy doit fournir:
- une fonction `buildShadertoyExport(config = {})`,
- un export par défaut pointant sur cette fonction,
- une génération `.frag` compatible ShaderToy selon la config fournie (paramètres shader + channels).

## Cible React/TS exacte

- Le bridge legacy `ShadertoyExporter.js` délègue à `buildShadertoyShaderFromParams(...)` dans `src/features/shader-studio/services/shadertoyExportService.ts`.
- Les valeurs incomplètes du `config` legacy sont normalisées via `DEFAULT_SHADER_PARAMS` (`src/types/shader.ts`) avec merge profond sur:
  - `colors`,
  - `postProcessing`,
  - `material`.
- Les channels legacy (`config.shaderToyChannels`) sont injectés vers la cible TS typée.

Mapping section par section:
1. API `buildShadertoyExport(config)` → conservée et exposée en named + default export.
2. Normalisation des valeurs legacy partielles → assurée par merge avec defaults TS.
3. Génération shader finale → centralisée dans le service React/TS (`buildShadertoyShaderFromParams`).

## Scénarios de validation fonctionnelle

1. **Compatibilité d'API bridge**
   - Vérifier statiquement que `buildShadertoyExport` est exportée en named et default export.
   - Résultat attendu: les appels legacy existants restent valides sans changement.

2. **Parité de génération shader**
   - Exécuter les tests `npm run test` et valider le fichier `src/test/shadertoyExportService.test.ts`.
   - Résultat attendu: le shader généré inclut les paramètres attendus (noise chunk, couleurs, speed/scale/frequency/amplitude).

3. **Parité channels ShaderToy**
   - Valider le scénario avec/sans canal audio (`iChannel0`) via les tests existants.
   - Résultat attendu: présence conditionnelle du code FFT seulement quand un channel audio est configuré.
