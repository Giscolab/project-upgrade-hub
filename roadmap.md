# roadmap.md — Suivi opérationnel de migration React

Ce fichier est un pointeur opérationnel vers la source de vérité:
`docs/REACT_MIGRATION_ROADMAP.md`.

## Règles non négociables
- Suppression d’un fichier legacy interdite avant couverture à **100%** (Gate 1→7).
- Chaque bloc legacy doit être mappé à sa cible React/TS.
- Toute différence de comportement doit être documentée et validée.

## État global actuel (résumé)
- Runtime React principal branché (scène Babylon, erreurs runtime/shader, audio live, MIDI CC, export vidéo, export ShaderToy, diagnostic WebGPU, persistance versionnée).
- Reste à finaliser: parité UI/FX fine, contrôles texture/blend, source audio fichier + beat detect, MIDI learn persistant, export PNG, undo/redo + presets nommés.
- Retrait des modules legacy reporté jusqu’à validation complète par fichier via la matrice Gate 1/7 → 7/7.

## Domaines prioritaires restants
1. **Runtime graphique**: parité post-process stricte, channels ShaderToy avancés, validation presets visuels.
2. **Contrôles UI**: texture/blend complets, raccourcis de migration item par item.
3. **Audio/MIDI**: lecture fichier audio, calibration beat, MIDI learn + table de mapping persistée.
4. **Export/Persistance**: export PNG, undo/redo, presets nommés.

## Discipline PR migration
Chaque PR de migration doit:
1. Mettre à jour `src/features/shader-studio/config/migrationPlan.ts`.
2. Mettre à jour `docs/REACT_MIGRATION_ROADMAP.md` et `roadmap.md`.
3. Inclure checks/tests exécutés.
4. Décrire explicitement le restant à faire.
