# BAK — Donner • Sauver • Vivre
Application web mobile (PWA) de don de sang. Aucune installation : ouvrez `index.html` ou publiez sur GitHub Pages (HTTPS conseillé pour la géolocalisation et le mode PWA).

## Carte réelle
La page « Trouver un donneur » utilise une vraie carte interactive (zoom, déplacement, marqueurs cliquables, bouton « ma position »).
- **Par défaut** : Leaflet + OpenStreetMap, gratuit, sans clé (nécessite internet). Hors ligne, l'image `assets/map.jpg` sert de secours.
- **Google Maps** : ouvrez `config.js` et mettez votre clé dans `gmapsKey`.
- Les coordonnées des donneurs sont dans le tableau `D` de `app.js` (`lat`, `lng`).

Fichiers JSON : `manifest.json` (PWA) et `metadata.json` (Google AI Studio).
