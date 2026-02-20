# roadmap.md — Suivi opérationnel de migration React

Version synthétique alignée sur `docs/REACT_MIGRATION_ROADMAP.md`.

## Règles non négociables
- Suppression d’un fichier legacy interdite avant couverture à **100%** (Gate 1→7).
- Chaque bloc legacy doit être mappé à sa cible React/TS.
- Toute différence de comportement doit être documentée et validée.

## Statut
- `priorities_only`

## État synthétique
- [x] Runtime React/Babylon en production dans `src/`.
- [x] Audio live + fichier + pause/reprise + beat detect.
- [x] MIDI lifecycle/CC + statut UI.
- [x] Export vidéo (progression/annulation), PNG et ShaderToy.
- [x] Persistance versionnée, undo/redo, presets nommés.
- [x] Chaîne post-process branchée.
- [ ] MIDI learn + persistance mapping.
- [ ] Contrôles texture/blend.
- [ ] Validation de parité presets visuels.
- [ ] Validation WebGPU fallback multi-device.
- [ ] Suppression des fichiers legacy (Gate 7) non démarrée.

## Priorités (court terme)

### Parité visuelle/graphique
- Finaliser la parité post-process (ordre + intensité vs legacy).
- Valider les presets visuels pour garantir le même rendu.

### UI contrôles
- Compléter les contrôles texture/blend.

### Audio/MIDI
- Finir MIDI learn + persistance de la table de mapping.

### Export/Persistance
- Valider la matrice codec export vidéo.
- Valider la parité PNG sur scénarios de référence.

## Discipline PR migration
Chaque PR de migration doit:
1. Mettre à jour `src/features/shader-studio/config/migrationPlan.ts`.
2. Mettre à jour `docs/REACT_MIGRATION_ROADMAP.md` et `roadmap.md`.
3. Inclure checks/tests exécutés.
4. Décrire explicitement le restant à faire.

## Contrôle d’anomalie de structure
Aucune section divergente détectée entre ce fichier synthétique et `docs/REACT_MIGRATION_ROADMAP.md`.
