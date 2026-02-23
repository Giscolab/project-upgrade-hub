# Checklist temporaire ESLint

## Regroupement initial des erreurs (npm run lint)

- [x] `@typescript-eslint/no-empty-object-type` (2)
  - `src/components/ui/command.tsx`
  - `src/components/ui/textarea.tsx`
- [x] `@typescript-eslint/no-require-imports` (1)
  - `tailwind.config.ts`

## Lots de correction

- [x] Lot 1 — Corriger `@typescript-eslint/no-empty-object-type`
- [x] Lot 2 — Corriger `@typescript-eslint/no-require-imports`
- [x] Vérification finale — `npm run lint`

## État final

- Plus aucune erreur ESLint bloquante.
- 7 avertissements `react-refresh/only-export-components` restent présents (non bloquants).
