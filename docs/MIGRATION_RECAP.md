# Récapitulatif migration React — état réel (réanalyse exhaustive)

## Ce qui est **effectivement migré et opérationnel**
- Shell React complet en production (`main.tsx` → `App.tsx` → `Index.tsx` → `ShaderStudioPage`).
- Rendu Babylon intégré côté React via `BabylonCanvas` avec cycle de vie engine/scene.
- Uniforms shader principaux pilotés par état React typé (`time`, `amplitude`, `frequency`, `twist`, `pulse`, `morph`, couleurs, etc.).
- Changement de géométrie au runtime avec reconstruction mesh (`MeshBuilder` côté React).
- Contrôles React stabilisés pour : géométrie, noise, speed, amplitude, frequency, rotation, toggles wireframe/autorotate/post-FX.
- Snapshot de migration legacy visible dans l’UI (`LegacyMigrationSummary`) + checklist visible (`MigrationChecklistPanel`).
- Typage de base consolidé (`ShaderParams`, `PostProcessing`, `MaterialParams`) et valeurs par défaut centralisées.

## Ce qui était listé comme “migré” mais ne l’est pas **intégralement**
- Persistance locale “shader + audio + vidéo” :
  - **partiel seulement**. Le hook de persistance existant ne persiste actuellement que des `ShaderParams`, et il n’est pas branché dans la page principale.
- Panneau audio/export “fonctionnel” :
  - composant existant, mais non branché dans l’écran principal et sans service runtime audio/export connecté.
- Parité post-process legacy :
  - non atteinte (pipeline pixel/glitch/vignette legacy non réimplémenté dans le flux Babylon React actuel).

## Backlog réel restant (priorité migration)
1. Audio runtime React complet (Web Audio, FFT, beat detect, mapping uniforms).
2. MIDI runtime React complet (devices, learn, persistance, monitor).
3. Export vidéo/image complet (MediaRecorder déjà branché + export ShaderToy, progression/annulation/preset restant).
4. Parité visuelle shader/post-process avec le legacy.
5. Intégration avancée WebGPU (visualisation runtime, fallback multi-device).
6. Persistance unifiée (shader + audio + vidéo + versioning + migration schémas).
7. Nettoyage final : décommissionnement des orchestrations legacy (`App.js`, `AudioEngine.js`, `MidiHandler.js`, `VideoRecorder.js`, `ShadertoyExporter.js`, `WebGPUCompute.js`).

## Définition de “React-only” (Done Definition)
La migration sera considérée terminée uniquement si :
- aucun flux critique n’est piloté par les classes/modules legacy,
- toutes les features conservées sont pilotées par des hooks/services React typés,
- l’état est centralisé (shader/audio/midi/export) avec persistance versionnée,
- la parité fonctionnelle est validée par tests + checks runtime,
- les fichiers legacy restants sont soit supprimés, soit explicitement conservés avec justification produit.
