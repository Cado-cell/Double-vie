# Double Vie

Simulateur de vie à jouer seul ou à deux sur le même téléphone. Application web installable (PWA), jouable hors connexion.

- **Jouer** : la page publiée par GitHub Pages (Paramètres → Pages → branche `main`, dossier racine). Sur téléphone : « Ajouter à l'écran d'accueil ».
- **Code du jeu** : `src/` (un fichier par module, `deux-vies.html` pour la page).
- **Construire** (depuis la racine du dépôt) :
  ```
  python3 tools/build_pwa.py --publish
  ```
  `--publish` copie le paquet construit à la racine, c'est ce que sert GitHub Pages.
- **Tester** : `node tests/run_all.js` (Playwright requis).
- **Feuille de route** : `ROADMAP.md`. **Pilote automatique** : `AUTOPILOT.md`.

## Déploiement sur Dokploy (Docker)

`docker-compose.yml`, `Dockerfile` et `deploy/nginx.conf` servent le jeu avec nginx. Mode d'emploi dans `deploy/README.md`.
