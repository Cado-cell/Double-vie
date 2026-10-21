# Double Vie — Feuille de route (benchmark, manques de BitLife, chantiers)

*Rédigée le 21/10/2026. Les cases `[ ]` servent de liste de travail : le pilote automatique les coche au fil des lots.*

---

## 0. Où on en est

| Domaine | État actuel |
|---|---|
| Format | PWA hors connexion, jouable seul ou à deux sur le même téléphone (tours alternés) |
| Contenu | 418 événements (315 en JSON dont 52 chaînes, + 103 classiques), 21 modules (carrières spéciales, bourse, royauté, politique, marché noir, zoo, secte, espion…), 59 pays |
| Interface | DA « jeu » (fond crème à motifs, contours, relief), menus en listes avec emoji en couleur, barre du bas à la couleur du joueur |
| Personnages | Avatars à tous les âges (bébé avec tétine → senior ridé), ~20 coiffures, 9 pilosités, forme de visage/nez/lèvres/maquillage, éditeur complet |
| Sauvegarde | 6 emplacements, 3 copies auto, export/import, machine à remonter le temps |
| Points faibles connus | Événements peu liés entre eux, peu de scènes interactives, pas de vrai « jeu à deux » (les deux joueurs ne s'influencent presque pas), aucun son/animation, pas d'objectifs de vie, pas de partage, pas de pipeline de tests automatique |

---

## 1. Benchmark : ce que font les autres

| Jeu | Boucle de jeu | Ce qui marche | Limites constatées | À emprunter pour Double Vie |
|---|---|---|---|---|
| **BitLife** | Un tap = une année, événements à choix, menus d'actions | Rythme très court, humour, énorme quantité d'événements, mises à jour fréquentes en packs thématiques (prison, bureau, famille recomposée, défis hebdo, créateur de scénarios) | Vies qui se répètent, carrières peu développées (sport, politique), peu de mini-jeux, aucune vraie dimension multijoueur, publicités et contenu payant | Garder le rythme et l'humour ; faire mieux sur la profondeur, le mode à deux et la rejouabilité |
| **Alter Ego** (1986, rééditions) | Questionnaire de personnalité, 7 âges de la vie, scénarios à réactions | Traits cachés qui changent avec les choix, **cohérence récompensée / comportement changeant puni**, possibilité de rejouer une période pour tester d'autres réactions | Daté, ton très sérieux | Personnalité cachée qui colore les événements ; notre machine à remonter le temps joue déjà le rôle du « rejouer » |
| **Reigns** | Cartes à glisser gauche/droite, jauges à équilibrer | Décision en un geste, **choix ambigus** (ni bon ni mauvais), mort sans punition (un successeur reprend), sessions très courtes, cartes tirées selon l'état du royaume (pas un arbre figé) | Contenu qui se répète à la longue | Popups d'événements ultra lisibles, effet de « balance » entre jauges, hérédité sans frustration |
| **Crusader Kings 3** | Dynastie, traits, intrigues | Histoires **émergentes** nées de l'interaction des systèmes ; les joueurs retiennent leurs propres histoires | Critique récurrente : événements prévisibles, « choisis ton aventure », traits qui ne s'enchaînent pas de façon cohérente | Nos événements doivent réagir à l'état du personnage et se souvenir du passé |
| **Les Sims 4** | Besoins, envies, aspirations, construction | Objectifs de court et long terme en permanence, personnalisation poussée, relations nuancées *(connaissances générales, non vérifiées ici)* | Lourd, sessions longues | **Rêves / objectifs de vie** avec jauge de satisfaction ; personnalisation de la maison |
| **Clones mobiles** (Another Life, Age Sim, Family Life) | Même idée que BitLife ou version « idle » multi-générations | Certains misent sur l'héritage multi-générations | Qualité inégale, publicités | Dynasties plus lisibles (arbre, héritage, objets de famille) |
| **Rétention mobile** (guides du secteur) | Défis quotidiens/hebdomadaires, séries, collections, événements saisonniers | Mélange d'objectifs courts (revenir aujourd'hui) et longs (collections, succès) | Sources surtout marketing, chiffres non vérifiés | Défis de la semaine, collections (rubans, souvenirs, objets), événements calendaires |

---

## 2. Ce qui manque le plus à BitLife selon son public

*Niveau de confiance : faible à moyen (avis App Store, pages communautaires, pétitions). Rien n'est une enquête statistique.*

| Manque signalé | Source/confiance | Où en est Double Vie | Chantier lié |
|---|---|---|---|
| **Multijoueur / jouer à plusieurs** | Pétitions Change.org (« backed by thousands » — déclaratif) ; aucune version multijoueur officielle trouvée | Mode 2 joueurs sur un téléphone, mais peu d'interactions | **Chantier 1** (le plus différenciant) |
| Carrières peu développées (sport, politique), vouloir créer et transmettre une entreprise | Avis App Store | Modules politique/entreprise/sport existent, sans profondeur de décision | Chantier 5 |
| Plus de mini-jeux que prison/armée | Avis App Store | Casino, courses, labyrinthe… | Chantier 6 |
| **Répétitivité** des vies | Avis App Store | Aucune répétition dans une même vie, mais pool encore limité | Chantiers 2 et 3 |
| Mises à jour espacées | Avis App Store | Pas de problème : on livre vite | Pilote automatique |
| **Publicités qui persistent après achat, contenu payant, achats non restaurés** | Avis Google Play, ComplaintsBoard | Tout est gratuit, sans pub, sauvegardes locales + export | Argument fort à conserver ; compléter par la sauvegarde 2.0 |
| Familles plus riches (cousins, tantes, garde d'enfants), animaux | Wiki fan (animaux « fonctionnalité la plus demandée »), résumé IA d'avis (peu fiable) | Animaux oui, famille élargie partielle | Chantier 4 |
| Personnalisation plus diverse | Pétition Change.org | Éditeur d'apparence riche | Fait en grande partie ; tenues par métier à venir |
| Décès sans trace (proches qui disparaissent) | Avis sur une appli concurrente | Cimetière familial présent | Fait |

---

## 3. Piliers de design

1. **Un tap, un moment** : jamais plus de 10 secondes sans qu'il se passe quelque chose de drôle, touchant ou surprenant.
2. **Des histoires, pas des tirages** : les événements se souviennent (rivalités, secrets, promesses) et réagissent à qui tu es.
3. **À deux, on s'influence** : l'autre joueur est un personnage de ta vie, pas juste un second compteur.
4. **Les choix ont du poids visible** : chaque grande décision laisse une trace dans le bilan de fin de vie.
5. **Jeu d'abord, appli ensuite** : couleurs, sons, animations, récompenses.
6. **Qualité automatisée** : chaque ajout passe des tests de simulation (pas de blocage, pas de répétition, équilibre).

---

## 4. Backlog hiérarchisé (du plus gros au plus petit)

*Effort : XL ≈ 6+ lots · L ≈ 3-5 lots · M ≈ 1-2 lots · S ≈ moins d'un lot · XS ≈ quelques minutes. Un « lot » = une séance de travail de l'ordre d'une conversation.*

### NIVEAU 1 — Très gros chantiers (XL)

- [ ] **1. Mode Duo 2.0 — « La Double Vie »** *(impact fun : 5/5 — le vrai argument face à BitLife)*
  - **Vie secrète** : chaque joueur peut cacher un second fil (liaison, métier clandestin, enfant caché, dettes de jeu, identité d'espion…) ; l'autre accumule des soupçons, peut enquêter, risque de découvrir.
  - **Écran « Passe le téléphone »** qui masque le tour précédent (indispensable pour les secrets).
  - **Moments à deux** : décisions prises en secret par chacun puis révélées (coopérer / trahir / mentir), en couple, entre amis, entre collègues.
  - **Jokers** (3 par vie) : forcer un événement, relancer une année, saboter ou aider l'autre ; gagnés par de bonnes actions.
  - **Foyer partagé** : compte commun, logement commun, enfants communs, héritage croisé, mariage avec cérémonie.
  - **Défis et rivalité** : « premier millionnaire », « le plus aimé », « la plus belle carrière » ; **bilan comparatif** à la fin (prix décernés : le plus généreux, le plus chanceux…).
  - **Mode synchrone** (optionnel) : les deux avancent d'un an ensemble et les événements se croisent.
- [ ] **2. Moteur d'histoires et mémoire** *(impact : 5/5)*
  - Mémoire des événements marquants (étiquettes de souvenirs) pour des **rappels** : « Ça fait 10 ans que tu as quitté Théo… ».
  - **Personnages récurrents** avec personnalité : le rival d'école, le meilleur ami d'enfance, l'ex qui revient, le voisin pénible.
  - **Arcs sur plusieurs années** (chaînes 3 à 6 étapes avec bifurcations réelles) ; objectif : passer de 52 à 200 chaînes.
  - **Rêves / objectifs de vie** (comme les aspirations des Sims) : choisis 1 à 3 rêves, jauge de satisfaction, regrets à la fin.
  - **Personnalité cachée** (traits qui influencent les probabilités et les options proposées, récompense de la cohérence façon Alter Ego).
- [ ] **3. Contenu ×3 + pipeline qualité** *(impact : 5/5)*
  - Passer de 418 à 1 000+ événements : culture française (bac, concours, CAF, impôts, apéro, tonton à Noël), événements par **métier**, par **pays**, par **âge**, **calendaires** (rentrée, Noël, vacances, élections).
  - **Linter d'événements** : identifiants uniques, chaînes sans impasse, orthographe, ton, équilibre des conséquences.
  - Rapports de simulation automatiques : événements jamais déclenchés, trop fréquents, mortalité, richesse médiane.
- [ ] **4. Relations 2.0** *(impact : 4/5)*
  - **Dialogues** avec choix de répliques (rencards, disputes, réconciliations, demandes en mariage).
  - Famille élargie (cousins, oncles et tantes, beaux-parents, demi-frères), garde d'enfants, jalousie, infidélité, divorce plus dramatique.
  - Amis avec des **arcs** (loyauté, trahison, mariage, deuil), groupes sociaux, réputation et rumeurs.
- [ ] **5. Carrières et argent 2.0** *(impact : 4/5)*
  - Entretiens d'embauche interactifs, promotions argumentées, burn-out, reconversion, **entreprise transmissible**, carrière politique avec décisions, sport pro avec saisons.
  - Impôts, inflation, crédits, marché immobilier vivant, krachs boursiers liés aux événements du monde.

### NIVEAU 2 — Gros chantiers (L)

- [ ] **6. Scènes interactives et mini-jeux ×2** : entretien, examen, rencard, dispute, procès, braquage, match, cuisine… (objectif : 15 mini-scènes courtes, 20 à 40 secondes chacune).
- [ ] **7. Rejouabilité** : départs thématiques (riche, pauvre, royal, immigré, orphelin, célèbre), **seeds de défi partagés** (« même départ pour vous deux, comparez »), défis de la semaine, Hall of Fame, **score de vie**, dynasties lisibles (arbre, héritage, objets de famille).
- [ ] **8. Ères et monde** : choisir l'époque (années 50 à 2040), prix, métiers et technologies d'époque, événements mondiaux (crises, pandémies, innovations), variantes par pays.
- [ ] **9. Santé et esprit** : santé mentale, thérapie, addictions, stress visible, maladies chroniques, vieillesse plus riche, morts variées et testament dramatique.
- [ ] **10. Foyer et objets** : logement personnalisable, décor, voitures et objets visibles, animaux plus profonds (avec avatars), objets de famille transmis.

### NIVEAU 3 — Chantiers moyens (M) : sensation de jeu et confort

- [ ] **11. « Juice »** : compteur d'argent animé, variations de jauges flottantes (+3 ❤️), confettis (anniversaire, diplôme, naissance), vibrations, sons discrets avec interrupteur.
- [ ] **12. Événements illustrés** : cartes d'événement avec décor et avatars des personnes concernées, transitions entre les années.
- [ ] **13. Prise en main en 60 secondes** : tutoriel court, aides contextuelles, popup « Quoi de neuf », rappel des modules disponibles.
- [ ] **14. Fil de vie 2.0** : chronologie, filtre « moments importants », « vieillir jusqu'au prochain événement », **album des portraits par âge** (l'avatar qui vieillit).
- [ ] **15. Bilan de fin de vie + carte à partager** (image via le partage du téléphone) + « photo de famille ».
- [ ] **16. Personnalisation++** : tenues par métier et par époque, évolution du style avec l'âge, thèmes de couleurs de l'appli, cadres de portrait.
- [ ] **17. Infrastructure** : dépôt GitHub pour la source, tests automatiques à chaque modification, publication automatique, découpage du paquet pour un démarrage plus rapide, stats d'équilibrage en local.
- [ ] **18. Accessibilité et réglages** : taille du texte, daltonisme, réduction des animations, bascule clair/sombre manuelle, version anglaise.
- [ ] **19. Sauvegarde 2.0** : transfert d'un téléphone à l'autre (code QR ou fichier), sauvegarde automatique téléchargeable, restauration guidée.

### NIVEAU 4 — Petits chantiers (S)

- [ ] 20. **Carrière avancée** : horaires réglables, demandes d'augmentation avec délai, retraite calculée sur les meilleures années.
- [ ] 21. **Traits au choix à la création** + petit questionnaire de personnalité optionnel.
- [ ] 22. **Jalons de l'enfance** : premiers mots, premiers pas, scène de caprice, rentrée en maternelle (avec visage).
- [ ] 23. **Textes plus simples** : jargon des extensions (bourse, immobilier), phrases plus courtes, accords.
- [ ] 24. **Relecture qualité** des modules écrits sans relecteur (carrières spéciales, marché noir, secte, espion, zoo, showbiz…).
- [ ] 25. Citations, proverbes et « le saviez-vous » dans le bilan de fin de vie.
- [ ] 26. Raccourcis : « refaire la dernière action », favoris, recherche dans les menus.
- [ ] 27. Notification discrète de nouvelle version dans le jeu.

### NIVEAU 5 — Micro-améliorations (XS, à glisser entre deux lots)

- [ ] Vibration légère sur événements importants · [ ] confirmation avant action irréversible · [ ] « annuler » après une action · [ ] bouton nom aléatoire · [ ] âge visible dans les pastilles joueurs · [ ] cœurs de relation · [ ] clignement des yeux de l'avatar · [ ] gâteau 🎂 à chaque anniversaire · [ ] libellés variés pour « Continuer » · [ ] message d'attente plus drôle quand le jeu enregistre.

---

## 5. Ordre de réalisation proposé

1. **Vague 1 — Fondations et plaisir immédiat** : #17 infrastructure (dépôt, tests, publication automatique) → #11 juice → #13 prise en main → #15 bilan partageable → petits chantiers #20, #21, #22, #23.
2. **Vague 2 — Ce qui nous distingue** : #1 Duo 2.0 (écran de passage, moments à deux, vie secrète, jokers, bilan comparatif) → Rêves (#2, partie objectifs).
3. **Vague 3 — Profondeur et contenu** : #2 (mémoire, personnages récurrents) → #3 contenu ×3 → #4 relations → #5 carrières → #6 scènes interactives.
4. **Vague 4 — Durée de vie** : #7 rejouabilité → #8 ères → #9 santé → #10 foyer → #12, #14, #16, #18, #19.

---

## 6. Automatisation : ce qui est possible

**Possible**
- Programmer des **séances de travail à heure fixe** (la nuit, ou juste après la réinitialisation de tes limites) : chaque séance ouvre le dépôt, prend le prochain élément non coché de ce fichier, le développe, lance les tests, met à jour le journal des changements et coche la case.
- **Reprendre seul après une limite atteinte** : si une séance est coupée, la suivante reprend à la case non cochée ; aucun travail n'est perdu tant que le code est enregistré dans le dépôt.
- **Publier automatiquement** vers ta version jouable quand les tests passent (ou garder en attente jusqu'à ton feu vert, au choix).
- Mettre en **pause ou arrêter** à tout moment (un mot de ta part).

**Impossible ou à surveiller**
- Je ne peux **pas augmenter ni réinitialiser** tes limites d'utilisation ; je peux seulement attendre et reprendre.
- Je ne vois pas ce qu'il te reste de crédit : on fixe donc un **plafond par séance** et des **horaires** qui n'empiètent pas sur ton travail.
- **Risque important aujourd'hui** : le code du jeu vit dans l'espace temporaire de cet environnement. S'il est réinitialisé, il disparaît. Il faut donc le mettre sur un dépôt GitHub (ton dépôt `double-vie` ou un autre) avant toute automatisation.

---

## Sources (recherche du 21/10/2026)

- [Mises à jour BitLife (wiki)](https://bitlife-life-simulator.fandom.com/wiki/Updates) · [Pétitions BitLife (Change.org)](https://www.change.org/topic/bitlife-en-us) · [Avis BitLife analysés (marlvel.ai)](https://marlvel.ai/apps/bitlife-life-simulator/reviews)
- [Plaintes et remboursements BitLife](https://www.complaintsboard.com/bitlife-life-simulator-b150146) · [Common Sense Media — BitLife](https://www.commonsensemedia.org/app-reviews/bitlife-life-simulator) · [Avis App Store BitLife](https://apps.apple.com/eg/app/bitlife-life-simulator/id1374403536?see-all=reviews)
- [BitLife 1.31 (défis hebdomadaires)](https://www.gamezebo.com/walkthroughs/bitlife-version-1-31-update-guide-weekly-challenges-relationship-counselling-embezzlement-and-more/) · [BitLife 1.18.1 (créateur de scénarios)](https://www.gamezebo.com/walkthroughs/bitlife-version-1-18-1-guide-scenario-creator-new-countries-cities-and-vacations-and-monk-and-nun-careers-explained/) · [BitLife 1.21 (prison)](https://www.gamezebo.com/walkthroughs/bitlife-version-1-21-guide-prison-life-riot-mini-game-family-heirlooms-job-interviews-and-more-explained/)
- [Jeux similaires à BitLife](https://dotesports.com/bitlife/news/best-games-like-bitlife) · [Alter Ego](https://www.c64-wiki.com/wiki/Alter_Ego) · [Reigns (PC Gamer)](https://www.pcgamer.com/au/how-reigns-and-its-forthcoming-sequel-make-their-tinderocracy-work) · [Reigns (AppSamurai)](https://appsamurai.com/blog/mobile-app-success-story-how-reigns-did-it/)
- [Crusader Kings III (journal de développement)](https://forum.paradoxplaza.com/forum/threads/ck3-dev-diary-0-the-vision.1265472/page-22) · [Rétention mobile](https://gamerefinery.com/keep-your-players-coming-back-introducing-onboarding-best-practices-part-2)
