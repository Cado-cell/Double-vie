/* Deux Vies — module « Dialogues » (id dialogues)
   Compliments, insultes, blagues, confidences, conseils, souvenirs, conversations à choix, mots doux et répliques de séduction.
   Seul état : L.dlg = {used:{catégorie:[indices déjà dits]}} pour ne pas répéter les phrases dans la même vie. */
(()=>{
const MOD='dialogues';
/* {n} prénom · {m|f} genre de la personne · {e} accord en e · [m|f] genre du joueur */
const fx=(s,p,L)=>String(s).replace(/\{n\}/g,p.first||'').replace(/\{e\}/g,p.gender==='F'?'e':'').replace(/\{([^|{}]*)\|([^{}]*)\}/g,(m,a,b)=>p.gender==='F'?b:a).replace(/\[([^|\]]*)\|([^\]]*)\]/g,(m,a,b)=>L.gender==='F'?b:a);
const num=(v,d)=>typeof v==='number'&&isFinite(v)?v:d;
const D=L=>{const d=L.dlg&&typeof L.dlg==='object'?L.dlg:(L.dlg={});if(!d.used||typeof d.used!=='object')d.used={};return d};
function draw(L,cat,arr){
  const u=D(L).used;let l=Array.isArray(u[cat])?u[cat]:(u[cat]=[]);
  let free=arr.map((x,i)=>i).filter(i=>!l.includes(i));
  if(!free.length){l.length=0;free=arr.map((x,i)=>i)}
  const i=pick(free);l.push(i);if(l.length>200)l.shift();return arr[i];
}
function reg(p){
  switch(p.type){case 'parent':case 'grand':return 'fam';case 'child':case 'grandkid':return 'enf';case 'boss':return 'pro';case 'enemy':return 'ene';case 'partner':return 'pair'}
  if(p.coworker)return 'pro';return 'pair';
}
const sm=p=>num(p.smarts,50),cz=p=>num(p.crazy,30),rl=p=>num(p.rel,50);
const rel=(p,d)=>{p.rel=clamp(rl(p)+d)};

/* ---------- Stocks : compliments ---------- */
const COMP=[
'Tu as un sourire qui illumine la pièce.','Franchement, tu as le meilleur rire que je connaisse.','Tu sens toujours bon le café chaud et les bonnes idées.','Quand tu entres quelque part, la température monte de deux degrés.','Tu es la personne la plus attentionnée du quartier, et je pèse mes mots.','Tes yeux ont une couleur que je ne saurais même pas nommer.','Tu as un talent fou pour mettre les gens à l’aise.','On devrait faire encadrer ta bonne humeur.','Tu es {brillant|brillante} sans même t’en rendre compte.','Tu as toujours le mot juste, c’est rare et précieux.','Ta coiffure aujourd’hui ? Un chef-d’œuvre.','Tu es {un vrai rayon|un vrai rayon} de soleil, même un lundi.','Tu cuisines comme un chef étoilé qui aurait un cœur.','Tu as la voix la plus apaisante du monde.','Je me sens toujours plus intelligent[|e] après t’avoir parlé.','Tu portes les couleurs avec un style que personne n’ose copier.','Tu es {courageux|courageuse}, plus que tu ne le crois.','Ta gentillesse est contagieuse, et c’est la seule contagion que j’accepte.','Tu es la preuve vivante qu’on peut être drôle sans être méchant{e}.','Tu as des mains faites pour réussir les choses compliquées.','Tu as un je-ne-sais-quoi, et j’ai fini par trouver : c’est toi.','Ton avis compte énormément pour moi.','Tu es {le plus fiable|la plus fiable} de tous mes contacts.','Quand tu racontes une histoire, même le facteur reste écouter.','Tu as une élégance naturelle, même en pyjama.','Tu es {parfait|parfaite} pour ce que tu fais, et tu le fais sans en parler.','Tu rends les jours ordinaires beaucoup plus intéressants.','Ton parfum, c’est la signature des gens bien.','Tu as une énergie de héros de film, mais en plus sympa.','Tu m’impressionnes plus que n’importe quel influenceur.','Tu as le don de tout rendre plus simple.','Ta présence suffit à faire de n’importe quel dîner une fête.','Tu es {généreux|généreuse} avec un naturel qui fait envie.','On ne s’ennuie jamais avec toi, c’est un super-pouvoir.','Tu as un regard franc qui inspire confiance.','Tu es plus {fort|forte} que tu n’en as l’air, et tu as déjà l’air costaud.','Tu as du goût, c’est évident : tu m’as choisi comme interlocuteur.','Chaque fois que tu ris, un oiseau trouve son chemin.','Tu es {l’être humain préféré|l’être humain préférée} de mon dimanche.','Tu mérites un trophée pour ta patience.','Tu es {inspirant|inspirante}, sincèrement.','Tu as une façon de marcher qui dit « je sais où je vais ».','Tu es la définition du mot « sympa », dans le dictionnaire il y a ta photo.','Tu as la mémoire des détails, et ça, c’est de l’amour.','Même tes erreurs ont de la classe.','Ton humour est aussi fin qu’un bon fromage affiné.','Tu es un vrai cadeau, sans le papier.','Tu as une aura de personne à qui on peut confier un secret.','Tu fais honneur à ton prénom, {n}.','Ton calme est impressionnant, tu devrais donner des cours.','Tu as un petit quelque chose qui rend le monde plus doux.',
'Tu es {doué|douée} pour les choses du quotidien, et ça vaut tous les diplômes.','Tu fais le meilleur café du monde, point.','Tu as cette façon de te souvenir de tout ce qu’on te dit, c’est touchant.','Ton énergie est communicative, c’est mieux que le sport.','Tu as des idées d’{un génie|une génie}, mais avec les pieds sur terre.','Avec toi, même la file d’attente devient une aventure.','Je ne sais pas comment tu fais, mais tu es toujours {au bon endroit|au bon endroit} au bon moment.','Tu as le sens de la fête et celui du devoir, un équilibre rarissime.','Tu es plus fiable qu’une horloge suisse.','Ta bonne humeur est une ressource renouvelable.','Tu as un cœur gros comme ça, et je mesure large.','Si les gens {gentils|gentilles} avaient un classement, tu serais sur le podium.'
];
const COMP_R={
fam:['Tu as été un modèle pour moi toute ma vie.','Je suis tellement fier[|e] de la famille qu’on forme.','Tu fais le meilleur gratin du monde, il faut le dire plus souvent.','Ta sagesse m’épate, tu devrais écrire un livre.','Tes conseils valent de l’or, et ils sont gratuits.','Grâce à toi, je sais ce que veut dire « chez soi ».','Tu as toujours su quoi dire aux moments qui comptaient.','Tu as les mains les plus rassurantes de la famille.'],
enf:['Tu es la plus belle chose qui me soit arrivée.','Tu as le sourire de ta grand-mère, et c’est un compliment de taille.','Je suis tellement fier[|e] de toi, même quand tu fais des pâtes avec du ketchup.','Tu grandis trop vite, mais tu le fais avec classe.','Tu as un cœur en or massif, ne le change jamais.','Tu es plus malin{e} que moi, je le dis tout haut.','Tu es mon plus beau chef-d’œuvre, et je n’ai même pas eu besoin de pinceau.','Tu as une imagination à faire pâlir les écrivains.'],
pro:['Ton travail est toujours impeccable, ça se remarque.','On ne te dit pas assez que tu portes l’équipe à bout de bras.','Tu as un sens de l’organisation qui fait pâlir mon agenda.','Même tes tableaux Excel ont de l’allure.','Quand tu animes une réunion, personne ne regarde son téléphone.','Tu as le talent de rendre les lundis supportables.','Tu es {le meilleur|la meilleure} collègue possible, honnêtement.','Ta machine à café préférée est jalouse de ta compagnie.'],
pair:['Tu es {le meilleur ami|la meilleure amie} dont on puisse rêver.','Avec toi, je n’ai jamais besoin de faire semblant.','Tu as toujours été de mon côté, même quand j’avais tort.','Tu es dans mon top trois, et les deux autres sont mes chats.','On a tellement de souvenirs ensemble, tu es ma mémoire vivante.','Tu me fais rire plus que n’importe quel humoriste.','Tu as le sens de l’amitié, et ça se fait rare.','Tu es de ceux qu’on garde toute sa vie.'],
ene:['Disons-le : tu m’agaces, mais tu as de la classe.','Je te déteste un peu moins qu’avant, c’est une promotion.','Même mes ennemis jurés devraient avoir ton style.','Tu es un adversaire à ma hauteur, c’est un honneur.','Ta ténacité force le respect, à regret.','Tu sais être exaspérant{e} avec talent.','Si on n’était pas fâchés, je te féliciterais pour ta coiffure.','Ça me coûte de le dire, mais tu es plutôt {doué|douée}.']
};

/* ---------- Stocks : insultes (drôles, jamais haineuses) ---------- */
const INS=[
'Tu as la finesse d’un hippopotame en tutu.','Tu es aussi rapide qu’un escargot sous somnifères.','Ton sens de l’orientation ferait perdre un GPS.','Tu as l’air d’un caméléon qui aurait raté son camouflage.','Tu es aussi discret{e} qu’une fanfare dans une bibliothèque.','Même un fauteuil a plus de conversation que toi.','Tu cuisines comme on rédige un contrat de mauvaise foi.','Ton humour, c’est un vieux yaourt : daté et un peu risqué.','Tu as la mémoire d’un poisson rouge fatigué.','On dirait un panneau « sens interdit » qui aurait vécu.','Tu danses comme un robot qui aurait mal au dos.','Tu as l’élégance d’une poule qui sort d’un ventilateur.','Tu fais plus de bruit qu’un sac de cailloux dans une machine à laver.','Ton charme, c’est une promesse non tenue.','Tu es aussi ponctuel{|le} qu’un train un jour de grève.','Tu es la preuve que le wifi n’atteint pas tous les cerveaux.','Tu as une conversation passionnante : celle du frigo.','Tu ressembles à un coussin qui aurait voulu devenir célèbre.','Tu as le sens du rythme d’un frigo qui hoquette.','Ton style vestimentaire relève de la mission impossible.','Tu es aussi utile qu’un parapluie en chocolat.','Tu as la patience d’un chat devant une porte fermée.','Tu es plus têtu{e} qu’un âne qui fait grève.','Ta voix donne envie de rebrancher le répondeur.','Tu racontes des histoires comme on trie des chaussettes : sans fin.','Tu es la lueur d’espoir d’une bougie en plein mistral.','Tu as des idées lumineuses, comme un four éteint.','Tu es aussi souple qu’une planche de bois verni.','Ton aura est celle d’une plante verte oubliée en juillet.','Tu portes bien ton âge : celui d’un vieux disque rayé.','Tu es plus lent{e} qu’un téléchargement des années 90.','Tu as l’intuition d’un parapluie en plein désert.','On dirait que tu as appris la politesse dans un manuel à l’envers.','Tu as le courage d’un lapin devant un aspirateur.','Tu as une conversation riche comme un biscuit sans beurre.','Ta cuisine est le seul endroit où le fromage a peur.','Tu es à l’humour ce que le brouillard est à la visibilité.','Tu es capable de te perdre dans un couloir droit.','Tu as le charisme d’un sèche-cheveux en panne.','Ton sens de l’économie est aussi précis que tes prévisions météo.','Tu as la grâce d’une grue de chantier qui danse le tango.','Tu as plus de répartie qu’un cactus, mais moins de douceur.','Ta mauvaise foi pourrait remporter une médaille olympique.','Tu es adorable comme un hérisson : de loin.'
];
const INS_R={
fam:['Tu radotes tellement que même ton écho en a marre.','Tu as dû hériter ton sens de l’humour d’un cousin éloigné, très éloigné.','Ta cuisine ferait pleurer un cordon-bleu.'],
enf:['Tu ranges ta chambre comme on organise un cyclone.','Tu as l’appétit d’un ogre et la discrétion d’un tuba.','Tu es aussi tranquille qu’un orage de grêle.'],
pro:['Tes réunions sont longues comme un lundi sans café.','Ton tableau Excel mérite d’être exposé : au musée des horreurs.','Tu réponds aux mails à la vitesse d’un escargot sous le fisc.'],
pair:['Tu pues la mauvaise foi, mais dans une gamme assez gourmande.','Ta tête avant ton café : un film d’épouvante grand public.','Tu as la même mémoire que ton portable : toujours « plus d’espace ».'],
ene:['Tu es le genre de personne que même mon GPS refuse de croiser.','Ton existence est un lundi matin à plein temps.','Tu es mon seul et unique cauchemar préféré.']
};

/* ---------- Stocks : blagues [mise en place, chute] ---------- */
const JOKES=[
['Pourquoi les plongeurs plongent-ils toujours en arrière ?','Parce que sinon ils tombent dans le bateau.'],['Que dit un escargot sur le dos d’une tortue ?','« Wouhou ! »'],['Quel est le comble pour un électricien ?','De ne pas être au courant.'],['Pourquoi les fantômes sont-ils de mauvais menteurs ?','Parce qu’on voit à travers eux.'],['Quel est le fruit le plus drôle ?','La poire, elle est bonne poire.'],['Que fait une fraise sur un cheval ?','Tagada, tagada !'],['Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ?','Un chat-peint de Noël.'],['Pourquoi les poissons détestent-ils l’ordinateur ?','À cause du filet.'],['Que dit un fromage qui se présente à un autre ?','« Brie, enchanté. »'],['Quel est le comble pour un jardinier ?','De raconter des salades.'],['Pourquoi le livre de maths est-il triste ?','Parce qu’il a trop de problèmes.'],['Que dit un oiseau qui se prend une porte ?','« Cui-cui, ça fait mal. »'],['Pourquoi les éléphants ne prennent-ils pas l’avion ?','Parce que leurs valises sont trop lourdes pour les trompes.'],['Que dit une cheminée à une autre ?','« Tu vas bien ? Tu as l’air dans le fumet. »'],['Quel est l’animal le plus rapide ?','Le pou : il est toujours en tête.'],['Pourquoi les mathématiciens aiment-ils le chocolat ?','Parce que c’est un carré tout fait.'],['Pourquoi Napoléon n’a-t-il pas fini ses nouilles ?','Parce qu’il avait perdu Waterzooi.'],['Que fait un crocodile qui surveille la plage ?','Il Lacoste.'],['Comment s’appelle un boomerang qui ne revient pas ?','Un bâton.'],['Qu’est-ce qui est jaune et qui attend ?','Jonathan.'],['Pourquoi les canards sont-ils toujours à l’heure ?','Parce qu’ils sont dans les starting-blocs, coin-coin.'],['Que dit un tableau qui rentre chez lui ?','« Je suis encadré ! »'],['Un homme entre dans un café…','Plouf ! (Ce n’était pas son jour.)'],['Qu’est-ce qu’un chien qui joue aux cartes ?','Un chien pas très fidèle, il triche à la baballe.'],['Pourquoi ne faut-il jamais confier un secret à un champ de maïs ?','Parce qu’il a des oreilles partout.'],['Que dit le zéro au huit ?','« Jolie ceinture ! »'],['Quel est le comble du boulanger ?','D’avoir de la galette et de ne pas être riche.']
];
const J_GOOD=['{n} éclate de rire et manque de s’étouffer.','{n} se tient les côtes en larmes.','{n} rit tellement que tout le monde se retourne.','{n} tape sur la table en hoquetant de joie.'];
const J_OK=['{n} sourit poliment : « Oh, pas mal. »','{n} glousse un petit coup, par politesse.','{n} hoche la tête : « Celle-là, je l’avais déjà entendue, mais bon. »'];
const J_BAD=['{n} soupire : « Tu devrais garder ton emploi. »','{n} te fixe longuement, sans un son. Un ange passe, puis le rejoint.','{n} lève les yeux au ciel : « Dis, tu as lu ça sur un sachet de sucre ? »'];

/* ---------- Stocks : confidences ---------- */
const CONF=[
'Tu avoues que tu as peur de te tromper de vie.','Tu confies que tu chantes sous la douche en inventant les paroles.','Tu admets que tu as déjà fait semblant de comprendre une blague.','Tu murmures que tu rêves de tout plaquer pour ouvrir une crêperie.','Tu reconnais que tu parles à tes plantes, et qu’elles te répondent parfois.','Tu confesses que tu as perdu le dernier livre qu’on t’a prêté.','Tu avoues que tu as pleuré devant un dessin animé le mois dernier.','Tu confies que tu te sens un peu seul[|e] certains soirs.','Tu admets que tu as triché une fois, il y a longtemps, à un jeu de société.','Tu murmures que tu as peur de vieillir trop vite.','Tu reconnais que tu as mangé le dernier gâteau en prétendant l’avoir trouvé vide.','Tu confesses que tu suis un régime… de chocolat.','Tu avoues que tu t’es déjà perdu[|e] dans ta propre ville.','Tu confies que tu envies parfois la vie des autres.','Tu admets que tu n’as jamais vraiment compris la Bourse.','Tu murmures que tu ne sais pas encore ce que tu veux faire de ta vie.','Tu reconnais que tu as eu une grosse dispute dont tu es encore fâché[|e].','Tu confesses que tu as un talent caché pour l’imitation de canards.','Tu avoues que tu as longtemps cru aux licornes administratives.','Tu confies que tu as parfois envie de tout recommencer à zéro.','Tu admets que tu as peur de décevoir ceux que tu aimes.','Tu avoues que tu as gardé un doudou en cachette.'
];
const C_GOOD=['{n} te serre dans ses bras : « Merci de m’avoir fait confiance. »','{n} t’écoute avec une patience infinie, puis te sert une tasse de thé.','{n} pose sa main sur la tienne : « Tu n’es pas seul[|e]. »','{n} te sourit tendrement : « Moi aussi, tu sais. »'];
const C_MOCK=['{n} éclate de rire avant de se reprendre : « Pardon, pardon. »','{n} te regarde, mi-ému{e}, mi-hilare.','{n} répond : « C’est mignon… et très gênant. »'];
const C_LEAK=['{n} se met à tout raconter à la famille dès le lendemain. Ouch.','Tu apprends qu’{il|elle} a déjà tout répété au voisin.','{n} n’a pas tenu sa langue : tout le quartier est au courant.'];

/* ---------- Stocks : conseils [conseil, effets] ---------- */
const ADV=[
['Ne dépense jamais avant d’avoir gagné.',{discipline:3}],['Dors huit heures, le reste suivra.',{health:2,stress:-3}],['Lis un livre par mois, ton cerveau te dira merci.',{smarts:3}],['Dis la vérité, c’est moins fatigant que de mémoriser un mensonge.',{karma:3}],['Bouge un peu chaque jour, même pour aller chercher le pain.',{health:3,athletic:2}],['Sois poli[|e] avec tout le monde, même au téléphone.',{karma:2,fame:1}],['Garde toujours un peu de côté pour les jours de pluie.',{discipline:3}],['Respire profondément avant de répondre à un mail agacé.',{stress:-4,willpower:2}],['Ne te compare pas, tu es déjà assez compliqué[|e] comme ça.',{happy:3}],['Choisis tes batailles, elles sont nombreuses et la journée est courte.',{willpower:3}],['Cuisine plutôt que commander, ça t’apprendra la patience.',{health:2,discipline:2}],['Appelle tes proches avant qu’ils n’appellent la police.',{karma:2,happy:2}],['Prends soin de ton sourire, c’est ton meilleur CV.',{looks:2,happy:2}],['Apprends à dire non, sans écrire de roman.',{willpower:3,stress:-2}],['Fais des pauses, même les ordinateurs en ont besoin.',{stress:-4}],['Ne signe jamais rien sans le lire. Même un menu.',{smarts:2,discipline:1}],['Rends service sans compter, le karma tient les comptes.',{karma:4}],['Mange des légumes. Oui, même les verts.',{health:3}],['Sois curieux{|se} : on apprend toujours plus en posant des questions.',{smarts:3}],['Ris un bon coup tous les jours, c’est gratuit et remboursé.',{happy:4,stress:-2}]
];
const A_INTRO={fam:'{n} te regarde avec sagesse : « ',enf:'{n}, très sérieux{|se}, te souffle : « ',pro:'{n} te prend à part, l’air grave : « ',pair:'{n} réfléchit une seconde : « ',ene:'{n} lâche à contrecœur : « '};
const A_DOUBT=['Tu suis le conseil de {n} à la lettre… et ça finit en fou rire général.','Le conseil de {n} était, disons, discutable. Tu fais comme tu le sens.','{n} improvise un peu : à la réflexion, mieux vaut demander à quelqu’un d’autre.'];

/* ---------- Stocks : souvenirs ---------- */
const MEM=[
'Tu te rappelles la fois où on a raté le dernier bus et fini à pied en chantant ?','Tu te souviens de ce gâteau qui s’est effondré le jour de l’anniversaire ?','On riait tellement ce soir-là qu’on n’a pas entendu l’orage, tu te souviens ?','Tu te souviens de notre première vraie dispute, pour une histoire de télécommande ?','Tu te rappelles cet été où il a plu tous les jours ?','Je repense à ce pique-nique où les fourmis ont tout mangé avant nous.','Tu te souviens du vieux chien du voisin qui nous suivait partout ?','On avait fait un château de coussins qui touchait presque le plafond.','Tu te rappelles de la grande panne d’électricité et des jeux à la bougie ?','Je pense encore à cette crêpe qui avait atterri sur la lampe.','Tu te souviens du train, de la valise coincée dans la porte ?','Tu te rappelles ce vieux jeu de cartes dont on avait perdu le roi de cœur ?','On était sûrs d’avoir vu une étoile filante, et c’était un avion.','Tu te souviens du jour où on a dansé sous la pluie sans raison ?','Souviens-toi de cette fête où la musique s’est arrêtée net, et nous avec.','Je me rappelle ta façon de rire à cette vieille blague, à chaque fois.','Tu te souviens de la fois où on a cru avoir perdu les clés et elles étaient dans la main ?','On avait fait des crêpes à minuit, et la cuisine ressemblait à un champ de bataille.','Tu te souviens de ce vieux vélo qui n’avait plus de freins ?','Je repense à la balade au bord de l’eau, ce jour où le soleil a fait exprès.','Tu te souviens de notre cabane au fond du jardin ?','Tu te rappelles ce jour où on a ri jusqu’à en avoir mal au ventre ?'
];
const M_INTRO={fam:'Autour d’un café, tu dis à {n} : « ',enf:'Tu t’assieds près de {n} : « ',pro:'À la pause, tu glisses à {n} : « ',pair:'Tu lances à {n} : « ',ene:'Même à {n}, tu dis presque malgré toi : « '};
const M_GOOD=['{n} sourit, les yeux dans le vague : « Quel bon temps… »','{n} éclate de rire : « Mais oui ! Je m’en souviens comme si c’était hier ! »','{n} ajoute des détails que tu avais oubliés. Vous rirez pendant une heure.','{n} a la larme à l’œil : « Merci d’y penser. »'];
const M_BAD=['{n} fronce les sourcils : « Moi je me rappelle plutôt que c’était toi, le coupable. »','{n} hausse les épaules : « Ah bon ? Aucun souvenir. »','{n} change de sujet, un peu gêné{e}.'];

/* ---------- Réactions générales ---------- */
const R_COMP_G=['{n} rougit jusqu’aux oreilles : « Oh, arrête, tu vas me faire pleurer. »','{n} sourit largement : « Tu sais parler aux gens, toi. »','{n} te serre la main très fort, sans rien dire.','{n} reste muet{|te} une seconde, puis souffle : « Merci, ça fait du bien. »','{n} se redresse et prend l’air d’un paon. Tu as visé juste.'];
const R_COMP_W=['{n} te regarde, très sérieux{|se} : « Je le savais. Mais merci quand même. »','{n} répond par un clin d’œil et trois pas de danse improvisés.','{n} t’offre un biscuit sorti de sa poche en guise de médaille.','{n} s’exclame : « Enfin quelqu’un qui a des yeux ! »'];
const R_COMP_B=['{n} plisse les yeux : « Qu’est-ce que tu me veux, au juste ? »','{n} marmonne : « C’est ça, c’est ça. » et regarde ailleurs.','{n} répond : « Tu me dis ça parce que tu veux un service ? »'];
const R_INS_LAUGH=['{n} éclate de rire : « Je la ressortirai ! »','{n} applaudit : « Bien joué, vraiment bien joué. »','{n} te renvoie une pique encore pire, et vous finissez en fou rire.'];
const R_INS_HURT=['{n} se fige, vexé{e} : « C’était vraiment nécessaire ? »','{n} tourne les talons sans un mot.','{n} te lance un regard noir et claque la porte.'];
const R_INS_DEF=['{n} te défie du regard : « Répète un peu, pour voir ! »'];
const SECRETS=['{n} te confie, à voix basse, qu’{il|elle} parle aux oiseaux du parc.','{n} avoue avoir gagné, une fois, un concours de grimaces.','{n} te révèle un trésor caché : la recette secrète de sa soupe.','{n} te dit qu’{il|elle} garde toujours un sandwich de secours dans sa poche.','{n} t’avoue avoir peur des pigeons depuis l’enfance.','{n} te murmure son rêve : faire un tour du monde à vélo.','{n} te confie qu’{il|elle} écrit des poèmes en cachette.','{n} t’avoue avoir pleuré devant un film de chiens.','{n} te dévoile son surnom d’enfance, et tu jures de ne jamais l’utiliser (presque).','{n} te raconte l’épisode honteux du mariage de sa cousine.','{n} te révèle où se cache le bon chocolat dans la maison.','{n} te confie une idée géniale d’invention : le parapluie à roulettes.'];

/* ---------- Effets annexes ---------- */
function side(L,p,tone){
  const r=Math.random();if(r>.16)return '';
  if(tone==='good'&&rl(p)>=50&&r<.07){const s=fx(pick(SECRETS),p,L);rel(p,3);chg(L,{happy:1});D(L).secrets=num(D(L).secrets,0)+1;return ' '+s}
  if(tone==='good'&&rl(p)>=65&&p.age>=22&&L.age>=16&&r<.12){const v=R(20,300);earn(L,v,1);return ` ${p.first} te glisse même ${fmt(v)} : « Un prêt. Enfin… on verra. »`}
  if(tone==='bad'){rel(p,-4);return fx(' {n} te fait la tête pendant des jours.',p,L)}
  if(tone==='good'||tone==='joke'){return defi(L,p)}
  return '';
}
function defi(L,p){
  const a=num(L.hid&&L.hid.athletic,50)+L.st.smarts/2+R(-40,40),b=num(p.health,60)+sm(p)/2+R(-40,40);
  const g=pick(['un bras de fer','une partie de pierre-feuille-ciseaux','un concours de grimaces','une course jusqu’au coin de la rue']);
  if(a>=b){chg(L,{happy:3});rel(p,2);return fx(` {n} te défie à ${g} : tu gagnes avec panache.`,p,L)}
  chg(L,{happy:-1});rel(p,3);return fx(` {n} te défie à ${g} : tu perds, mais dans la bonne humeur.`,p,L);
}

/* ---------- Actions de dialogue ---------- */
function compliment(L,p){
  const r=reg(p),stock=COMP.concat(COMP_R[r]||[]),ph=fx(draw(L,'comp',stock),p,L);
  const good=Math.random()<.35+rl(p)/200+(sm(p)<40?.1:0);
  let t=`Tu dis à ${p.first} : « ${ph} »`;
  if(!good){rel(p,-R(0,2));return out(L,`${t} ${fx(pick(R_COMP_B),p,L)}`)}
  if(cz(p)>60&&chance(.5)){rel(p,R(1,5));chg(L,{happy:2});return out(L,`${t} ${fx(pick(R_COMP_W),p,L)}${side(L,p,'good')}`)}
  rel(p,R(3,9));chg(L,{happy:2,karma:1});
  return out(L,`${t} ${fx(pick(R_COMP_G),p,L)}${side(L,p,'good')}`);
}
function insulte(L,p){
  const r=reg(p),stock=INS.concat(INS_R[r]||[]),ph=fx(draw(L,'ins',stock),p,L);
  const humour=(cz(p)+sm(p))/2+rl(p)/2+R(-25,25);let t=`Tu lances à ${p.first} : « ${ph} »`;
  if(humour>75||(r==='ene'&&chance(.3))){rel(p,R(0,4));chg(L,{happy:2});return out(L,`${t} ${fx(pick(R_INS_LAUGH),p,L)}`)}
  chg(L,{karma:-2});
  if(humour>45){rel(p,-R(2,6));return out(L,`${t} ${fx(pick(R_INS_DEF),p,L)}${defi(L,p)}`)}
  rel(p,-R(8,18));chg(L,{happy:-2});
  return out(L,`${t} ${fx(pick(R_INS_HURT),p,L)}${side(L,p,'bad')}`);
}
function blague(L,p){
  const j=draw(L,'joke',JOKES);const t=`Tu racontes à ${p.first} : « ${fx(j[0],p,L)} … ${fx(j[1],p,L)} »`;
  const s=cz(p)/2+sm(p)/3+rl(p)/3+R(-30,30)+(L.st.smarts>70?8:0);
  if(s>62){rel(p,R(4,10));chg(L,{happy:4,fame:chance(.2)?1:0});return out(L,`${t} ${fx(pick(J_GOOD),p,L)}${side(L,p,'joke')}`)}
  if(s>38){rel(p,R(1,4));chg(L,{happy:1});return out(L,`${t} ${fx(pick(J_OK),p,L)}`)}
  rel(p,-R(1,5));chg(L,{happy:-1});return out(L,`${t} ${fx(pick(J_BAD),p,L)}`);
}
function confidence(L,p){
  const ph=fx(draw(L,'conf',CONF),p,L);let t=`${ph}`;
  if(rl(p)<30&&chance(.5)){rel(p,-3);return out(L,`${t} ${fx(pick(C_LEAK),p,L)}`)}
  if(rl(p)>=55&&sm(p)>=35&&chance(.7)){rel(p,R(4,9));chg(L,{happy:R(3,6),stress:-R(3,7)});return out(L,`${t} ${fx(pick(C_GOOD),p,L)}${side(L,p,'good')}`)}
  if(cz(p)>55||chance(.35)){rel(p,R(0,3));chg(L,{happy:2,stress:-2});return out(L,`${t} ${fx(pick(C_MOCK),p,L)}`)}
  if(chance(.3)){rel(p,-R(3,7));chg(L,{stress:3});return out(L,`${t} ${fx(pick(C_LEAK),p,L)}`)}
  rel(p,R(2,5));chg(L,{happy:2,stress:-3});return out(L,`${t} ${fx(pick(C_GOOD),p,L)}`);
}
function conseil(L,p){
  const a=draw(L,'adv',ADV),r=reg(p);
  const intro=fx(A_INTRO[r]||A_INTRO.pair,p,L)+fx(a[0],p,L)+' »';
  if(sm(p)>=40||chance(.4)){chg(L,a[1]);rel(p,R(1,4));chg(L,{happy:1});return out(L,`${intro} Tu retiens la leçon.`)}
  rel(p,R(0,2));return out(L,`${intro} ${fx(pick(A_DOUBT),p,L)}`);
}
function souvenir(L,p){
  const r=reg(p),ph=fx(draw(L,'mem',MEM),p,L);const t=`${fx(M_INTRO[r]||M_INTRO.pair,p,L)}${ph} »`;
  if(chance(.45+rl(p)/250)){rel(p,R(3,8));chg(L,{happy:R(2,5)});return out(L,`${t} ${fx(pick(M_GOOD),p,L)}`)}
  rel(p,-R(0,3));return out(L,`${t} ${fx(pick(M_BAD),p,L)}`);
}

/* ---------- Conversation à choix ---------- */
const lf=(t,r,s,m,alt)=>({t,r:r||0,s:s||null,m:m||0,alt:alt||null});
const al=(pr,t,r,s,m)=>({pr,t,r:r||0,s:s||null,m:m||0});
const SCEN=[
{id:'voyage',t:'{n} déroule une carte sur la table : « J’ai un projet de voyage. Tu serais partant{e} ? »',c:[
 ['Partir, bien sûr !',{t:'« Génial ! Plutôt quelle destination ? »',c:[['Le Japon, ses temples et ses nouilles',lf('Vous passez des heures à rêver devant des photos de sushis. {n} est aux anges.',8,{happy:4})],['Un camping en Ardèche, simple et efficace',lf('Vous voilà partis pour des soirées barbecue. {n} adore l’idée.',6,{happy:3,health:1},0,al(.25,'Il pleut tout le week-end, mais le fou rire est garanti.',5,{happy:2}))],['La lune, sinon rien',lf('{n} éclate de rire : « On commence par le mont Blanc, d’accord ? »',4,{happy:2})]]}],
 ['Plutôt rester chez nous',lf('{n} hausse les épaules : « Tant pis, je rêverai pour deux. »',-2,{happy:-1})],
 ['Je n’ai pas les moyens en ce moment',{t:'{n} fait la moue : « On pourrait trouver une astuce… »',c:[['Faire un voyage à petit prix',lf('Vous dénichez un train de nuit pas cher. {n} te remercie de ta franchise.',5,{discipline:2,happy:2})],['Changer de sujet',lf('Le silence s’installe un peu.',-3)]]}]]},
{id:'carriere',t:'{n} soupire : « Je me demande si je ne devrais pas changer de métier… »',c:[
 ['Fonce, la vie est courte !',{t:'« Mais dans quoi, selon toi ? »',c:[['Dans la pâtisserie',lf('{n} imagine déjà ses éclairs. Tu auras des parts gratuites.',7,{happy:3})],['Dans l’artisanat',lf('Vous échangez des idées jusqu’au soir. {n} se sent soutenu{e}.',7,{happy:2,smarts:1})],['Dans l’astronomie, évidemment',lf('{n} rigole : « J’ai trop peur du vide ! »',3,{happy:1})]]}],
 ['Reste prudent, un emploi stable, c’est précieux',lf('{n} acquiesce : « Tu as raison, je vais y réfléchir. »',4,{smarts:1,discipline:1},0,al(.2,'{n} te remercie en glissant un billet pour la cantine.',5,{},20))],
 ['Deviens influenceur !',lf('{n} s’étouffe de rire. Puis te regarde, soupçonneux{se}, en notant l’idée.',2,{happy:2,fame:1})]]},
{id:'rumeur',t:'{n} se penche vers toi : « Tu as entendu ce qu’on dit sur le voisin du troisième ? »',c:[
 ['Raconte !',{t:'« Il paraît qu’il élève des poules sur son balcon. Je ne sais pas si c’est vrai. »',c:[['Aller vérifier avec {n}',lf('Vous voilà sur le palier à écouter. Cot-cot. C’était vrai ! Fou rire collectif.',7,{happy:4})],['Garder ça pour vous',lf('Vous gardez le secret, comme deux conspirateurs.',5,{karma:1})],['Le répéter à toute la rue',lf('La rumeur fait le tour du quartier. Le voisin n’apprécie pas.',-5,{karma:-3},0,al(.3,'Le voisin vient s’expliquer… avec des œufs frais pour tout le monde.',4,{happy:2}))]]}],
 ['Je n’aime pas les commérages',lf('{n} rougit : « Tu as raison, pardon. »',3,{karma:2})],
 ['Je savais déjà, moi',lf('{n} est impressionné{e} par ta documentation.',2,{happy:1,smarts:1})]]},
{id:'enfance',t:'{n} regarde dans le vide : « Parfois je repense à notre enfance… Tu te souviens de la cabane ? »',c:[
 ['Oui, et du gâteau raté !',lf('Vous riez pendant dix minutes. {n} essuie une larme de rire.',8,{happy:5})],
 ['Un peu flou, honnêtement',{t:'« Ah bon ? Je te raconte alors… »',c:[['Écouter jusqu’au bout',lf('{n} brode avec passion. Tu retrouves enfin le souvenir.',6,{happy:3})],['Dire que tu préfères le présent',lf('{n} sourit, un peu déçu{e} mais compréhensif{|ve}.',1)]]}],
 ['Je ne veux pas en parler',lf('{n} baisse les yeux : « D’accord, désolé{e}. »',-3,{happy:-1})]]},
{id:'dilemme',t:'{n} montre un portefeuille : « Je viens de le trouver. Il y a 300 € dedans. On fait quoi ? »',c:[
 ['On le rend',lf('Vous le rapportez au commissariat. Le propriétaire, ému, vous offre un café et 30 €.',6,{karma:6,happy:3},30)],
 ['On garde l’argent',{t:'« Bon… et si on garde seulement la moitié ? »',c:[['Je refuse, c’est trop moche',lf('{n} rougit : « Tu as raison. Rendons tout. »',4,{karma:4})],['D’accord, on partage',lf('Le karma n’est pas d’accord. Tu empoches un peu mais ressens un malaise.',-3,{karma:-8,happy:-2},150,al(.25,'Le propriétaire vous retrouve. C’est gênant. Tu rends tout.',-8,{karma:-3,happy:-3},-150))]]}],
 ['On cherche le propriétaire sur les réseaux',lf('{n} trouve l’annonce en cinq minutes. Une vraie équipe de détectives !',7,{karma:5,smarts:1})]]},
{id:'gateau',t:'{n} te tend une assiette : « J’ai fait un gâteau pour la première fois. Goûte et dis-moi ! »',c:[
 ['Dire la vérité franchement',{t:'Le gâteau est… dense comme du béton. « Alors ? »',c:[['« C’est un peu sec, mais l’intention est géniale »',lf('{n} rit : « Sec comme tu l’as dit si bien. On recommence ensemble ? »',5,{karma:2})],['« Franchement, c’est immangeable »',lf('{n} est vexé{e}.',-7,{karma:-1},0,al(.3,'{n} éclate de rire : « Au moins, tu es honnête ! »',3))]]}],
 ['Mentir et dire que c’est délicieux',lf('{n} rayonne, et t’en ressert une deuxième part. Ton estomac négocie.',4,{happy:1,health:-1})],
 ['Manger tout sans rien dire',lf('{n} te regarde, bouche bée, avec admiration et une pointe d’inquiétude.',6,{health:-2,happy:1})]]},
{id:'animal',t:'{n} sort son téléphone : « Je songe à adopter un animal. Un perroquet, peut-être. Tu en penses quoi ? »',c:[
 ['Excellente idée !',{t:'« Et il s’appellera comment ? »',c:[['Capitaine Plume',lf('{n} adore. Le perroquet aura un chapeau de pirate.',6,{happy:3})],['Jean-Pierre',lf('{n} rit aux larmes. Jean-Pierre, c’est parfait.',7,{happy:3})]]}],
 ['Un chat serait plus raisonnable',lf('{n} réfléchit longuement : « Peut-être, oui. »',3,{smarts:1})],
 ['Ils crient trop, évite',lf('{n} se vexe un peu mais finit par t’écouter.',-1)]]},
{id:'pret',t:'{n} se gratte la tête : « Dis… tu pourrais me dépanner de 100 € ? Je te rends tout vite. »',c:[
 ['Bien sûr, tiens !',lf('{n} promet de rembourser et te serre dans ses bras.',8,{karma:3},-100,al(.5,'Il te rend 120 € la semaine suivante, avec un mot gentil.',10,{happy:3},120))],
 ['Je préfère ne pas prêter d’argent',lf('{n} comprend, un peu déçu{e}.',-4,{discipline:1})],
 ['Je t’offre plutôt un repas',lf('Vous mangez ensemble, et {n} apprécie le geste sans l’embarras.',6,{happy:2},-20)]]},
{id:'pari',t:'{n} sourit d’un air malicieux : « Un défi ? Je parie que je te bats ! »',c:[
 ['Pierre-feuille-ciseaux',lf('Trois manches serrées. Tu gagnes : {n} demande une revanche immédiate.',5,{happy:3},0,al(.5,'{n} te bat à plate couture, et fait la danse de la victoire.',3,{happy:1}))],
 ['Bras de fer',lf('Les veines gonflent, les rires fusent. Résultat : égalité surprenante.',6,{happy:3,athletic:1})],
 ['Concours de blagues',{t:'« Tu commences ? »',c:[['Oui, avec la plus nulle',lf('{n} se plie en deux. Tu remportes le concours à l’applaudimètre.',7,{happy:4})],['Non, toi d’abord',lf('{n} se lance… et c’est trop drôle pour que tu rivalises.',4,{happy:2})]]}]]},
{id:'stress',t:'{n} soupire : « J’ai un entretien demain et je suis mort{e} de trac. »',c:[
 ['Lui dire qu’on va tout déchirer',lf('{n} se redresse : « Tu as raison, j’y vais à fond ! »',7,{karma:2,happy:2})],
 ['Proposer une répétition générale',{t:'« Vraiment ? Par quoi on commence ? »',c:[['Présentation de soi',lf('Vous répétez dix fois. {n} s’améliore sensiblement.',8,{smarts:1,happy:2})],['Questions pièges',lf('Tu poses des questions absurdes. {n} dérape de rire, puis recommence en sérieux.',6,{happy:3})]]}],
 ['Lui rappeler que ça pourrait mal tourner',lf('{n} blêmit. Oups.',-6,{karma:-1})]]}
];
let CV=null;
function startConv(L,p){
  const s=draw(L,'conv',SCEN.map(x=>x.id));const sc=SCEN.find(x=>x.id===s)||SCEN[0];
  CV={pid:p.id,sc:sc,path:[]};pushPanel(pConv);
}
function curNode(){let n=CV.sc;for(const i of CV.path){n=(n.c&&n.c[i]&&n.c[i][1])||n}return n}
function applyLeaf(L,p,lf0){
  let f=lf0;if(f.alt&&chance(f.alt.pr))f=f.alt;
  rel(p,f.r||0);if(f.s)chg(L,f.s);
  if(f.m>0)earn(L,f.m,1);else if(f.m<0&&L.money>=-f.m)spend(L,-f.m);
  return out(L,'💬 '+fx(f.t,p,L));
}
function pConv(){
  const L=cur();const p=CV&&byId(L,CV.pid);
  if(!CV||!p||p.alive===false)return {title:'Conversation',html:note('La conversation est terminée.')};
  const n=curNode();
  const rows=(n.c||[]).map((c,i)=>{
    const nx=c[1];const leaf=!nx.c;
    return row({ic:leaf?'💬':'➡️',t:fx(c[0],p,L),right:leaf?'':'›',a:()=>{
      if(!leaf){CV.path.push(i);showSheet();return}
      L.used['dl_v'+p.id]=1;track(L,'k_dl_v');STACK.pop();run(()=>applyLeaf(L,p,nx));
    }});
  });
  return {title:`Conversation avec ${p.first}`,html:`<div class="card"><div class="cv">${esc(fx(n.t,p,L))}</div></div>`+note('Choisis ta réponse.')+group('',rows)};
}

/* ---------- Panneau « Lui dire quelque chose » ---------- */
function pSayFor(id){return ()=>{
  const L=cur();const p=byId(L,id);
  if(!p||p.alive===false)return {title:'Parler',html:note('Cette personne n’est plus là.')};
  const k=c=>'dl_'+c+id;
  const A=(ic,t,s,c,fn)=>act(L,{ic,t,s,key:k(c),fn:L=>{const r=fn(L,p);return r}});
  const used=!!L.used['dl_v'+id];
  const rows=[
    A('💐','Complimenter','Quelques mots doux','c',compliment),
    A('🗯️','Insulter','Avec humour, évidemment','i',insulte),
    A('😂','Raconter une blague','Risque de silence gêné','j',blague),
    A('🤫','Se confier','Dire ce qu’on a sur le cœur','f',confidence),
    A('🧭','Demander conseil','Écouter plus sage que soi','a',conseil),
    A('📸','Parler de ses souvenirs','Mémoire partagée','s',souvenir),
    row({ic:'🗣️',t:'Conversation',s:used?'Déjà fait cette année':'Un échange à choix, plusieurs issues',dis:used,a:()=>startConv(L,p),right:used?'':'›'})
  ];
  return {title:`Parler à ${p.first}`,html:note(`${role(p)} · relation ${clamp(rl(p))} %. Une seule fois par an et par option.`)+group('',rows)};
}}

/* ---------- Partenaire ---------- */
const MOTS=[
'Tu es mon premier message du matin, même quand je dors encore.','Mon cœur fait des galipettes quand tu souris.','Avec toi, même la file d’attente de la poste devient romantique.','Tu es mon étoile préférée, et je les ai toutes comptées.','Je t’aime plus que le fromage, et tu sais ce que ça veut dire.','Chaque jour avec toi est un dimanche sans réveil.','Tu es le Wi-Fi de mon cœur : avec toi, je capte tout.','Mon amour, tu es ma pause café préférée.','Ton rire est ma chanson favorite, en boucle.','Si l’amour était un gâteau, tu serais la cerise et la crème.','Tes yeux sont mon fond d’écran préféré.','Je t’aime à la folie, avec modération sur le reste.','Tu es mon plus beau hasard.','Je t’aime comme la baguette aime le beurre.','Quand je pense à toi, mon ventre met un bonnet de bain et plonge.','Tu es la plus belle chose arrivée à mon agenda.','Avec toi, je n’ai peur ni du lundi ni des factures.','Tu as volé mon cœur, mais garde-le, il est à toi.','Tu es mon aventure favorite, pas besoin de carte.','Je te choisirais encore, même dans un monde sans chocolat.','Tu es mon refuge, ma maison, ma meilleure idée.','Tu fais battre mon cœur au rythme d’une samba lente.','Je t’aimerai jusqu’à la fin des soldes, et même après.','Quand tu me regardes, je me sens la personne la plus chanceuse du monde.','Ma vie sans toi serait un livre sans pages.','Tu es mon tout, mon presque-tout et mon toujours.','Tu es la douceur de mes matins, la lumière de mes soirs.','Chaque fois que je te vois, je tombe un peu plus.','Tu es mon plus beau projet, sans date limite.','Je t’aime, tout simplement, et tout compliqué aussi.','Je serai là pour tous tes demains, même les nuageux.','Tu me rends meilleur[|e], et c’est un tour de magie.'
];
const SEDUC=[
'Tu crois aux coups de foudre, ou je dois repasser ?','Tu n’es pas un sandwich, mais tu me donnes faim de toi.','Excuse-moi, je cherche mon cœur : je crois que tu l’as pris.','Si tu étais un fruit, tu serais une belle grosse fraise.','On ne s’est pas déjà vus dans mes rêves ? Tu étais déjà très bien.','Tu as du feu ? Parce que tu m’allumes.','Ton père était boulanger ? Tu es un vrai petit pain, chaud et appétissant.','Je ne suis pas photographe, mais je te vois bien dans mon avenir.','Tu es tombé{e} du ciel ? Parce que tu as une mine d’ange.','Est-ce que ton nom est Wi-Fi ? Parce que je sens une connexion.','Si la beauté était un crime, tu aurais perpétuité.','Pardon, mais mon horoscope dit que je dois te parler ce soir.','On joue à pierre-papier-baiser ? Je commence.','Ton sourire, c’est mon antidote au lundi.','Je ne suis pas un génie, mais je vois bien nos deux prénoms ensemble.','Dis-moi, ça fait mal quand tu te fais autant désirer ?','Je ne sais pas ce que tu as, mais je veux le même… avec toi.','Ça ne te dérange pas si je te regarde ? Je fais mon sport du regard.','Tu veux que je te prête mon cœur ? Je te le rendrai jamais.','On dirait que tu as besoin d’un câlin. Je suis volontaire.','Tu es plus {beau|belle} que le dernier épisode de ma série.','Tu m’as manqué, et pourtant on ne s’est pas quittés.','Si je pouvais réarranger l’alphabet, je mettrais U et I côte à côte.','Tu m’as dit « non » au dessert, mais « oui » à moi ?','Même mon GPS dit que tu es ma destination.','Tu as un plan pour ce soir ? Parce que le mien, c’est toi.','Excuse-moi, je suis vacciné[|e] contre tout, sauf contre toi.','Ma main cherche la tienne, c’est une urgence sentimentale.','On ne s’est pas encore mariés ? Je me demandais, c’est tout.','Je t’offre un verre ? Ou un siècle ? Je suis flexible.','Avec toi, même le silence a de la classe.','Quand tu t’en vas, tout devient un peu moins coloré.'
];
const RINGARD=['{n} te regarde, désemparé{e}, puis lâche un petit rire gêné : « Euh… c’était quoi, ça ? »','{n} lève un sourcil : « On dirait une carte de vœux de supermarché. »','{n} cache son visage dans ses mains : « Ringard, mais mignon. »','Un silence. Puis : « Tu as vu ça sur Internet ? » Tu rougis.'];
const REUSSI=['{n} fond sur place.','{n} te regarde avec des étoiles dans les yeux.','{n} rit doucement et se blottit contre toi.','{n} murmure : « Toi, alors… » avec un sourire désarmant.'];
function pairLine(L,p,cat,arr,lab){
  const ph=fx(draw(L,cat,arr),p,L);
  const cheesy=Math.random()<(cat==='sed'?.28:.18)+(L.st.smarts<40?.07:0)-(L.st.looks>70?.05:0);
  const t=`${lab} à ${p.first} : « ${ph} »`;
  if(cheesy){partnerRel(L,-R(1,4));chg(L,{happy:-2});return out(L,`${t} ${fx(pick(RINGARD),p,L)}`)}
  partnerRel(L,R(3,8));chg(L,{happy:R(2,4)});
  return out(L,`${t} ${fx(pick(REUSSI),p,L)}`);
}

/* ---------- Module ---------- */
registerMod({
  id:MOD,
  born(L){L.dlg={used:{}}},
  inherit(D,L){L.dlg={used:{}}},
  personRows(L,p){
    if(!p||p.type==='pet'||p.alive===false||num(p.age,20)<3)return [];
    D(L);
    return [nav('💬','Lui dire quelque chose','Compliments, blagues, confidences, conversation…',pSayFor(p.id))];
  },
  partnerRows(L){
    const p=partnerOf(L);if(!p||p.alive===false)return [];
    D(L);
    return [
      act(L,{ic:'💌',t:'Mot doux',s:'Un petit mot qui touche (ou pas)',key:'dl_mot',fn:L=>pairLine(L,p,'mot',MOTS,'Tu glisses un mot doux')}),
      L.age>=16&&num(p.age,20)>=16?act(L,{ic:'😘',t:'Répliques de séduction',s:'Charme, humour, risque de ringardise',key:'dl_sed',fn:L=>pairLine(L,p,'sed',SEDUC,'Tu tentes une réplique de séduction')}):null
    ].filter(Boolean);
  }
});
})();
