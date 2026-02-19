# Récapitulatif migration React — état actuel

## Ce qui est déjà en place
- La page principale React utilise un orchestrateur feature (`ShaderStudioPage`).
- Le canvas Babylon est piloté par des paramètres React typés.
- Les contrôles principaux shader sont disponibles en React.
- Un panneau audio/export initial existe en React (scaffold fonctionnel côté état).
- La persistance locale couvre shader + audio + vidéo.
- Un adapter legacy initialise les paramètres React depuis une base de config héritée.
- Un suivi de couverture migration (migré/restant) est exposé dans l'UI.
- Une checklist de migration modulaire est affichée dans l'interface principale (avec snapshot legacy visible en continu).

## Ce qui reste majeur
- Audio engine réel (FFT, beat, mapping runtime).
- MIDI learn + mapping persistant.
- Export vidéo/image complet.
- Pipeline post-process legacy à parité visuelle complète.
- Nettoyage/suppression finale des orchestrations non React.

## Définition “React-first” (cible)
- Plus aucun flux applicatif critique ne dépend directement de la classe `App` legacy.
- Les fonctionnalités historiques sont soit migrées soit retirées explicitement.
- Les états sont centralisés et testés.
