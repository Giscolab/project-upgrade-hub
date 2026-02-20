# Contribuer à Shader Studio

Merci de votre intérêt pour Shader Studio.

## Démarrage rapide (workflow actuel)

```bash
npm install
npm run dev
npm run build
npm run test
```

Le workflow principal est React + TypeScript + Vite.

## Règles de migration legacy → React

La source de vérité technique pour l’avancement est:
- `src/features/shader-studio/config/migrationPlan.ts`

La source documentaire de référence est:
- `docs/REACT_MIGRATION_ROADMAP.md`
- `roadmap.md` (version synthétique)

## Procédure des 7 gates (obligatoire avant suppression d’un fichier legacy)

1. Inventaire figé du fichier legacy.
2. Mapping legacy → React documenté.
3. Preuve de parité fournie (tests/capture/scénario) dans `docs/migration-evidence/`.
4. `migrationPlan.ts` mis à jour.
5. Roadmaps (`docs/REACT_MIGRATION_ROADMAP.md`, `roadmap.md`) mises à jour.
6. PR fusionnée.
7. Suppression du fichier legacy dans une PR dédiée.

## Pull Requests

- Ouvrir des PR petites et ciblées.
- Ne pas cocher un item de migration sans preuve dans le code.
- Ajouter les commandes de vérification exécutées dans la description de PR.

## Signaler un bug / proposer une fonctionnalité

- Ouvrir une issue avec contexte, reproduction, et environnement navigateur.
- Pour les nouvelles fonctionnalités, préciser le domaine (`render`, `audio`, `midi`, `export`, `persistence`).
