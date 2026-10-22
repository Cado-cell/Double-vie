# Pilote automatique — mode d'emploi pour chaque séance de travail

Tu es Claude, chargé de faire avancer Double Vie pendant que le propriétaire est absent. Chaque séance traite **un lot** puis s'arrête.

## Règles
1. **Dépôt** : travailler uniquement dans `Cado-cell/double-vie`. Ne rien toucher dans les autres dépôts. Ne jamais écrire de secret dans le code.
2. **Choix du lot** : prendre dans `ROADMAP.md` le premier chantier non coché dans l'ordre des « Vagues » (section 5). Un lot = un chantier ou une partie cohérente d'un chantier (≤ 1 séance). État au 22/10 : faits S1 à S7, 1 (en grande partie), 2 (rêves, souvenirs, personnalité, personnages récurrents), 2b (sauf opinions croisées), 11, 13, 15, 17a, 20 à 23 et 25 ; restent #17b, #24, #26, #27, les arcs longs du chantier 2, puis Vague 4 et suivantes. Les séances de nuit automatiques sont désactivées (à la demande du propriétaire) : on travaille maintenant à la demande, avec les mêmes règles.
3. **Plafond** : un seul lot par séance, pas d'équipe d'agents, pas de relecture en parallèle. Si le lot s'annonce plus gros, le découper, cocher la partie faite et noter le reste dans `ROADMAP.md`.
4. **Qualité** : depuis la racine, construire (`python3 tools/build_pwa.py && node tools/make_icons.js`), puis `node tests/run_all.js` (environ 6 minutes : le lancer en arrière-plan et attendre la fin ; ne pas modifier `src/` pendant ce temps). Ajouter un test si le lot ajoute une règle de jeu. **Ne publier que si tout passe.** Ne jamais désactiver ni contourner un test. Le lanceur relance une fois un test qui échoue (pannes dues au hasard ou à une machine lente) : « réussi au 2e essai » est toléré, deux échecs ne le sont pas.
5. **Publication** : `python3 tools/build_pwa.py --publish`, mettre à jour `CHANGELOG.md` (une phrase simple en français, ce que le joueur voit), cocher la case dans `ROADMAP.md`, puis `git add -A && git commit`, `git fetch origin main` (si le dépôt a avancé : `git pull --rebase origin main`) et `git push origin main`. Si le push est refusé (403), appeler `add_repo` (owner « Cado-cell », repo « double-vie », access « push ») puis réessayer une fois ; si c'est toujours refusé, s'arrêter et le dire clairement dans la phrase de bilan (le travail non poussé est perdu à la fin de la séance).
6. **Échec** : si les tests échouent et que tu ne trouves pas la cause rapidement, ne rien publier ; écrire dans `ROADMAP.md` sous le chantier une ligne « Bloqué : … » avec le test en échec, pousser uniquement ce fichier, puis s'arrêter.
7. **Simplicité** : respecter la « règle de simplicité » de `ROADMAP.md` (≤ 8 lignes par liste, pas de verrou visible, 2 à 4 touches, mots simples). Lancer `node tests/audit_nav.js 30` avant et après le lot et noter les chiffres dans `CHANGELOG.md`. Le test `tests/nav_budget.js` impose des plafonds ; si un lot réduit nettement la navigation, resserrer les plafonds dans ce fichier.
8. **Style** : textes du jeu en français, ton simple et drôle, accords corrects, pas de jargon. Interface et avatars : ne pas casser la DA existante.
9. **Fin de séance** : une phrase de bilan (ce qui a changé, ce qui reste).

## Messages de commit
Terminer chaque message de commit par :
```
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: <lien de la séance>
```
