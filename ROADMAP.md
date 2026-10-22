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
3. **À deux, chacun chez soi, on se compare et on se croise** : mêmes défis, bilans comparés, personnage de l'autre qui passe dans ta vie.
4. **Les choix ont du poids visible** : chaque grande décision laisse une trace dans le bilan de fin de vie.
5. **Jeu d'abord, appli ensuite** : couleurs, sons, animations, récompenses.
6. **Qualité automatisée** : chaque ajout passe des tests de simulation (pas de blocage, pas de répétition, équilibre).
7. **Simple et intuitif avant tout** : on ne se perd jamais dans les menus. Voir la règle de simplicité ci-dessous, valable pour chaque chantier.

---

## 4. Backlog hiérarchisé (du plus gros au plus petit)

*Effort : XL ≈ 6+ lots · L ≈ 3-5 lots · M ≈ 1-2 lots · S ≈ moins d'un lot · XS ≈ quelques minutes. Un « lot » = une séance de travail de l'ordre d'une conversation.*

### Règle de simplicité (transversale, à respecter dans chaque lot)

1. **Peu de touches** : toute action courante à 2 touches maximum depuis l'écran principal, toute action à 4 maximum.
2. **Listes courtes** : 8 lignes visibles au plus ; au-delà, regrouper (catégories, « Pour toi », « Voir tout »).
3. **Rien de grisé sans raison** : les actions réservées à un âge sont masquées (une ligne rappelle qu'elles existent) ; une action grisée doit afficher en une ligne ce qui manque.
4. **Le jeu propose** : toute nouvelle fonction pertinente apparaît d'abord dans « Idées rapides » / « Juste pour toi ».
5. **Mots simples** : pas de jargon, sous-titres de 12 mots maximum.
6. **Découverte progressive** : les extensions avancées (espion, marché noir, secte, zoo, bourse…) ne s'affichent pas d'emblée ; elles apparaissent quand le jeu les suggère ou dans « Plus d'aventures ».
7. **Mesurer** : `node tests/audit_nav.js` avant/après chaque lot ; le nombre de panneaux profonds ne doit pas augmenter sans raison.

*Mesure du 21/10 (personnage de 30 ans) : 116 panneaux, 705 actions, la plupart à 4 touches ; listes de 55 offres d'emploi, 58 pays, 32 articles de contrebande, 24 lignes de journal financier. Objectif : diviser par deux le nombre d'actions visibles d'emblée et ramener les actions courantes à 2 touches.*


### NIVEAU 0 — Simplicité (prioritaire, avant tout nouveau contenu)

- [x] **S1. Idées rapides, verrous d'âge masqués, récents** *(fait le 21/10 : trois raccourcis sous la carte du personnage, « Juste pour toi » et « Récents » dans Activités, actions réservées à un âge masquées : 56 éléments grisés à 8 ans → 1)*.
- [x] **S2. Offres d'emploi** *(fait le 21/10 : 5 « mieux payés pour toi » + 8 secteurs, au lieu de 55 lignes ; chaque métier hors de portée dit ce qu'il manque)*.
- [x] **S3. Émigrer** *(fait le 21/10 : 6 destinations populaires + 6 régions, au lieu de 58 pays en vrac)*.
- [x] **S4. Listes très longues** *(fait le 21/10 : études supérieures → 5 filières pour toi + licences / écoles ; contrebande → une ligne par marchandise ; journal financier → 5 derniers titres ; matrice de volatilité → 3 catégories ; leçons → par talent)*.
- [x] **S4b. Listes restantes** *(fait le 21/10 : défis → 6 à relever + listes à part ; chirurgien esthétique → un chirurgien par ligne puis ses interventions)*. Fiches des actions et panneau des traits raccourcis le 22/10.
- [x] **S5. Découverte progressive** *(fait le 21/10 : Activités passe de 8 à 5 entrées ; argent, pouvoir, zone d'ombre et outils sont rangés dans « Plus d'aventures » ; Bourse et Entreprise remontent en « Juste pour toi » quand tu as de l'argent)*.
- [x] **S6. Garde-fou automatique** *(fait le 21/10 : `tests/nav_budget.js` échoue si une liste dépasse 30 lignes ou si le nombre de panneaux, d'actions ou d'actions à 5 touches dépasse les plafonds ; les plafonds se resserrent à chaque lot)*.
- [x] **S7. Parcours à 2 touches** *(fait le 21/10 : « À voir en ce moment » dans Relations — passer du temps avec les 3 proches qui en ont le plus besoin, en 2 touches ; idées rapides sur l'écran principal)*. Onglet Métier vérifié le 22/10 : les actions courantes sont à 2 touches.

### NIVEAU 1 — Très gros chantiers (XL)

- [ ] **1. Jeu à deux, chacun de son côté (asynchrone, sans serveur)** *(impact : 4/5 — remplace l'ancien « Mode Duo 2.0 » ; fait le 22/10 : code de vie à copier-coller, comparaison côte à côte avec score de vie, invitation du personnage de l'autre, départ partagé par un mot commun ; marchés et tendances communs avec le même mot ; premier million comparé ; reste : d'autres défis communs comparés à la fin, évènements aléatoires de vie communs)*
  - **Code de défi** : un court code à s'envoyer par message ; il donne le même départ (famille, naissance) et les mêmes **événements du monde** année après année (crises, innovations) ; chacun vit sa propre vie, puis on compare.
  - **Carte de bilan partageable** (image + code) à s'envoyer, et **comparaison côte à côte** de deux bilans (richesse, bonheur, amour, héritage, aventures, prix décernés : le plus généreux, le plus chanceux…).
  - **Échange de personnage par code** : le personnage de l'autre joueur apparaît dans ta vie comme ami, rival ou conjoint (avatar, métier, traits), avec des événements liés ; il devient un vrai agent du chantier 2b.
  - **Défis communs** (« premier millionnaire », « la plus belle carrière ») comparés à la fin.
  - **Pas de temps réel** : cela demanderait un serveur ; ce n'est pas nécessaire pour vous deux.
  - *Mode « deux joueurs sur le même téléphone » : il reste tel quel. On n'y investit plus (secrets, écran « passe le téléphone », jokers) tant que ce n'est pas demandé.*
- [ ] **2. Moteur d'histoires et mémoire** *(impact : 5/5 — « Rêves de vie » faits le 21/10 : choix d'un rêve à 12, 25 et 40 ans, onze rêves possibles, progression sur la fiche personnage, bonheur à la réalisation, prix « Rêveur comblé » dans le bilan ; souvenirs faits le 21/10 : le jeu retient mariage, naissance, diplôme, promotion, deuil, rupture et y revient 5, 10, 15… ans plus tard, avec un album « Souvenirs » sur la fiche ; personnalité qui se révèle faite le 22/10 : sept personnalités, évènements propres, récompense de la fidélité, prix dans le bilan ; personnages récurrents faits le 22/10 : rival d'école, meilleur ami d'enfance, voisin pénible, ex qui revient, avec des histoires en 3 à 5 étapes ; reste : arcs plus longs (de 52 à 200 chaînes))*
  - Mémoire des événements marquants (étiquettes de souvenirs) pour des **rappels** : « Ça fait 10 ans que tu as quitté Théo… ».
  - **Personnages récurrents** avec personnalité : le rival d'école, le meilleur ami d'enfance, l'ex qui revient, le voisin pénible.
  - **Arcs sur plusieurs années** (chaînes 3 à 6 étapes avec bifurcations réelles) ; objectif : passer de 52 à 200 chaînes.
  - **Rêves / objectifs de vie** (comme les aspirations des Sims) : choisis 1 à 3 rêves, jauge de satisfaction, regrets à la fin.
  - **Personnalité cachée** (traits qui influencent les probabilités et les options proposées, récompense de la cohérence façon Alter Ego).
- [ ] **2b. Personnages vivants — agents locaux** *(première version faite le 21/10 : chaque année un proche agit de lui-même — appel, visite, anniversaire, demande d'argent avec choix, dispute, réconciliation, reproche s'il n'y a plus de nouvelles depuis 3 ans, déménagement, nouveau métier — selon sa personnalité stable, votre relation et la dernière rencontre ; faite le 22/10 : mémoire de l'aide et des refus (remerciement, rancune) et héritage modifié selon la relation et la dernière rencontre ; rumeurs faites le 22/10 ; personnage échangé fait le 22/10 (inviter le personnage de l'autre) ; reste : buts propres, dialogues)* *(impact : 5/5, s'appuie sur 2 et prépare 1 et 4 ; fonctionne hors connexion, gratuit, testable ; concerne les personnages de TA vie, pas le multijoueur)*
  - **Fiche de personnalité** par personnage (extraversion, gentillesse, ambition, impulsivité, loyauté, humour) + **buts** (carrière, famille, argent, aventure) + **humeur**.
  - **Mémoire** : chaque personnage retient ce que tu lui as fait (cadeau, trahison, oubli d'anniversaire, aide) avec un poids qui s'estompe ; **opinions** envers chaque personne (affection, respect, jalousie).
  - **Cycle annuel autonome** : chaque personnage choisit une action d'après sa personnalité, ses buts et ses opinions (te rappeler, demander de l'argent, se brouiller, se marier, déménager, te déshériter…) ; ce qui te concerne devient un événement, le reste alimente l'arbre familial et les rumeurs.
  - **Rappels** : « Mamie ne t'a pas vu depuis 3 ans » → héritage modifié ; « Théo se souvient que tu l'as aidé ».
  - **Dialogues** générés par grammaire (intention × personnalité × relation), des centaines de variantes, sans connexion.
  - **Personnage échangé** (chantier 1) : le personnage de l'autre joueur, importé par code, se comporte comme n'importe quel agent de ta vie.
  - Garde-fous : budget de calcul par année, tests de simulation (pas de comportement absurde, pas de boucle), graine aléatoire fixe pour reproduire un bug.
- [ ] **2c. Couche IA en ligne (expérimentale, optionnelle)** *(à décider avec toi avant tout travail)* : conversation libre avec un proche et variations de texte par un modèle de langage. Le **simulateur reste la vérité** (il décide ce qui arrive), le modèle ne fait que **parler** ; hors connexion ou en cas d'échec, retour automatique aux dialogues locaux. Prérequis : un petit serveur intermédiaire qui garde la clé secrète (le dépôt étant public, aucune clé ne peut être dans le jeu), un plafond de dépense, un interrupteur dans les réglages, et l'accord sur la vie privée (le texte envoyé quitte le téléphone). Alternative sur téléphone (modèle de 300 à 700 Mo téléchargé dans le navigateur) : possible mais inégale selon les appareils, non recommandée pour l'instant.
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

- [x] **11. « Juice »** *(fait le 21/10 : compteur d'argent animé, variations de jauges flottantes, confettis sur diplôme/mariage/naissance, vibrations, sons synthétisés désactivés par défaut, réglages dans le Menu)*. Gâteau d'anniversaire et clignement des yeux faits le 22/10.
- [ ] **12. Événements illustrés** : cartes d'événement avec décor et avatars des personnes concernées, transitions entre les années.
- [x] **13. Prise en main** *(fait le 21/10 : visite guidée de 6 écrans au premier lancement, rejouable depuis Menu → Réglages ; fenêtre « Quoi de neuf » alimentée par `CHANGELOG.md` quand une nouveauté est publiée)*. Bulles d'aide ponctuelles faites le 22/10 (Métier, Relations, Activités, Biens).
- [ ] **14. Fil de vie 2.0** : chronologie, filtre « moments importants », « vieillir jusqu'au prochain événement », **album des portraits par âge** (l'avatar qui vieillit).
- [x] **15. Bilan de fin de vie + carte à partager** *(fait le 21/10 : prix décernés (Millionnaire, Le plus généreux, Grande famille…), épitaphe, carte image 1080×1500 à partager par le téléphone ou à enregistrer)*. Code de bilan et comparaison à deux faits le 22/10 (chantier 1). Reste : « photo de famille ».
- [ ] **16. Personnalisation++** : tenues par métier et par époque, évolution du style avec l'âge, thèmes de couleurs de l'appli, cadres de portrait.
- [x] **17a. Infrastructure de base** *(fait le 21/10 : dépôt avec `src/`, `tools/`, `tests/`, batterie `node tests/run_all.js`, publication par `python3 tools/build_pwa.py --publish`, pilote automatique de nuit)*.
- [ ] **17b. Infrastructure, suite** : exécution automatique des tests sur GitHub à chaque envoi (GitHub Actions, nécessite l'autorisation « workflow » du jeton), découpage du paquet pour un démarrage plus rapide, stats d'équilibrage en local.
- [ ] **18. Accessibilité et réglages** : taille du texte, daltonisme, réduction des animations, bascule clair/sombre manuelle, version anglaise.
- [ ] **19. Sauvegarde 2.0** : transfert d'un téléphone à l'autre (code QR ou fichier), sauvegarde automatique téléchargeable, restauration guidée.

### NIVEAU 4 — Petits chantiers (S)

- [x] 20. **Carrière avancée** *(fait le 21/10 : rythme de travail tranquille / normal / intense, délai de 1 à 2 ans entre deux demandes d'augmentation, retraite = 5 meilleures années × 2 % par année travaillée, entre 25 % et 75 %)*.
- [x] 21. **Trait au choix à la création** *(fait le 21/10 : un menu « Trait de caractère » (au hasard ou l'une des 8 qualités) dans le formulaire de naissance)*. Questionnaire de trois questions fait le 22/10.
- [x] 22. **Jalons de l'enfance** *(fait le 21/10 : 8 événements — premiers mots, premiers pas, caprice au supermarché, maternelle, ami imaginaire, vélo sans roulettes, CP, goûter d'anniversaire)*.
- [x] 23. **Textes plus simples** *(première passe faite le 21/10 sur la bourse : « turbo baissier » → « pari à la baisse », « matrice de volatilité » → « risque des placements » ; entreprise : « trésorerie » → « argent en caisse », « valorisation » → « valeur de l'entreprise », « dividende » → « part des bénéfices » ; immobilier : fait le 22/10 (« Mes locations », note énergie, assurances, expulsion, achat à crédit) ; secte, zoo, showbiz, marché noir, mafia : passe faite le 22/10 sur les menus ; reste : lire les textes d'évènements de l'espion et des autres extensions)*.
- [ ] 24. **Relecture qualité** des modules écrits sans relecteur (carrières spéciales, marché noir, secte, espion, zoo, showbiz…).
- [x] 25. Citations, proverbes et « le saviez-vous » dans le bilan de fin de vie *(fait le 22/10 : proverbe selon le thème de la vie + nombre de jours vécus)*.
- [ ] 26. Raccourcis : « refaire la dernière action », favoris, recherche dans les menus.
- [ ] 27. Notification discrète de nouvelle version dans le jeu.

### NIVEAU 5 — Micro-améliorations (XS, à glisser entre deux lots)

- [ ] Vibration légère sur événements importants · [ ] confirmation avant action irréversible · [ ] « annuler » après une action · [ ] bouton nom aléatoire · [ ] âge visible dans les pastilles joueurs · [ ] cœurs de relation · [ ] clignement des yeux de l'avatar · [ ] gâteau 🎂 à chaque anniversaire · [ ] libellés variés pour « Continuer » · [ ] message d'attente plus drôle quand le jeu enregistre.

---

## 5. Ordre de réalisation proposé

1. **Vague 1 — Fondations, simplicité et plaisir immédiat** : ~~#17a infrastructure~~ → ~~#11 juice~~ → ~~S1~~ → ~~S4b~~ → ~~#13 prise en main~~ → ~~#15 bilan partageable~~ → petits chantiers ~~#20~~, ~~#21~~, ~~#22~~, #23 → #17b.
2. **Vague 2 — Des personnages et une vie qui ont du relief** : ~~Rêves / objectifs de vie~~ et personnalité cachée (#2, première partie) → **2b personnages vivants** → mémoire et rappels (#2, suite).
3. **Vague 3 — Se comparer à deux, chacun chez soi** : #1 (code de défi, comparaison de bilans, échange de personnage) → #7 (départs thématiques, défis de la semaine, score de vie).
4. **Vague 4 — Profondeur et contenu** : #3 contenu ×3 → #4 relations → #5 carrières → #6 scènes interactives.
5. **Vague 5 — Durée de vie** : #8 ères → #9 santé → #10 foyer → #12, #14, #16, #18, #19.

*Option à tout moment, si tu la demandes : couche IA en ligne (2c).*

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
