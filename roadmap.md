# roadmap.md — Suivi opérationnel de migration React

Ce fichier est un pointeur opérationnel vers la source de vérité:
`docs/REACT_MIGRATION_ROADMAP.md`.

## Règles non négociables
- Suppression d’un fichier legacy interdite avant couverture à **100%** (Gate 1→7).
- Chaque bloc legacy doit être mappé à sa cible React/TS.
- Toute différence de comportement doit être documentée et validée.

## Statut
- `priorities_only`

## Priorités (court terme)

### Parité visuelle/graphique
- Finaliser la parité post-process (ordre + intensité vs legacy).
- ✅ Terminer les channels ShaderToy avancés (textures multiples).
- Valider les presets visuels pour garantir le même rendu.

### UI contrôles
- Compléter les contrôles texture/blend.
- ✅ Ajouter les raccourcis/actions de migration avec liens directs par item.

### Audio/MIDI
- ✅ Ajouter source audio fichier + pause/reprise.
- ✅ Implémenter beat detect + calibration UI.
- Finir MIDI learn + persistance de la table de mapping.

### Export/Persistance
- Finaliser l’export image PNG (parité legacy).
- ✅ Ajouter undo/redo.
- ✅ Ajouter presets nommés (avec versioning).

## Discipline PR migration
Chaque PR de migration doit:
1. Mettre à jour `src/features/shader-studio/config/migrationPlan.ts`.
2. Mettre à jour `docs/REACT_MIGRATION_ROADMAP.md` et `roadmap.md`.
3. Inclure checks/tests exécutés.
4. Décrire explicitement le restant à faire.
