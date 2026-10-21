/* Deux Vies — données du jeu */

const NAMEPOOLS={
 fr:{H:['Lucas','Hugo','Gabriel','Louis','Arthur','Jules','Adam','Raphaël','Léo','Nathan','Tom','Noah','Ethan','Paul','Sacha','Maxime','Antoine','Théo','Mathis','Yanis','Karim','Enzo','Victor','Samuel','Baptiste','Rayan','Malo','Nino','Elias','Côme','Basile','Gaspard','Timothée','Aurélien','Benoît'],
  F:['Emma','Jade','Louise','Alice','Chloé','Lina','Léa','Rose','Anna','Mia','Inès','Camille','Manon','Zoé','Sarah','Juliette','Clara','Lou','Agathe','Romane','Nina','Margaux','Élise','Lola','Maëlys','Héloïse','Iris','Capucine','Apolline','Joséphine','Mathilde','Constance','Salomé','Eugénie','Anouk'],
  L:['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier','Morel','Girard','André','Mercier','Dupont','Lambert','Bonnet','François','Martinez','Legrand','Garnier','Faure','Rousseau','Blanc','Guérin','Muller','Henry','Roussel','Nicolas','Perrin','Benali','Diallo','Nguyen','Le Gall','Ferreira','Chevalier','Lemoine','Marchand','Picard','Gauthier']},
 ar:{H:['Youssef','Mohamed','Amine','Omar','Mehdi','Hamza','Ilyes','Karim','Nabil','Rachid','Anas','Bilal','Ayoub','Zakaria'],F:['Salma','Aya','Imane','Yasmine','Fatima','Khadija','Nour','Meryem','Leila','Sara','Hiba','Zineb','Rania','Kenza'],L:['Benali','El Amrani','Alaoui','Bennani','Tazi','Idrissi','Chraibi','Berrada','Fassi','Ouazzani','Lahlou','Kettani']},
 sn:{H:['Mamadou','Ousmane','Cheikh','Ibrahima','Moussa','Abdou','Pape','Modou','Babacar','Serigne','Aliou','Lamine'],F:['Fatou','Aminata','Awa','Mariama','Khady','Ndeye','Coumba','Astou','Bineta','Adama','Rokhaya','Sokhna'],L:['Diop','Ndiaye','Fall','Sow','Diallo','Ba','Gueye','Sarr','Faye','Mbaye','Cissé','Seck']},
 it:{H:['Lorenzo','Matteo','Leonardo','Francesco','Alessandro','Giuseppe','Marco','Luca','Andrea','Giovanni','Pietro','Tommaso'],F:['Giulia','Sofia','Aurora','Alice','Ginevra','Chiara','Francesca','Martina','Elena','Sara','Beatrice','Vittoria'],L:['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Conti','Gallo']},
 es:{H:['Hugo','Martín','Lucas','Mateo','Pablo','Alejandro','Daniel','Javier','Diego','Carlos','Álvaro','Sergio'],F:['Lucía','Sofía','Martina','María','Paula','Julia','Carmen','Elena','Valeria','Alba','Noa','Irene'],L:['García','Fernández','González','Rodríguez','López','Martínez','Sánchez','Pérez','Gómez','Ruiz','Navarro','Torres']},
 en:{H:['James','Oliver','Liam','Noah','Jack','Harry','Ethan','Jacob','Henry','Mason','George','Charlie'],F:['Olivia','Emma','Amelia','Ava','Sophia','Isla','Charlotte','Mia','Grace','Lily','Ruby','Evie'],L:['Smith','Johnson','Williams','Brown','Jones','Taylor','Davies','Miller','Wilson','Clark','Evans','Walker']},
 de:{H:['Leon','Paul','Felix','Lukas','Jonas','Maximilian','Elias','Finn','Noah','Ben','Emil','Anton'],F:['Mia','Emilia','Hannah','Lea','Lina','Marie','Sophie','Clara','Lena','Anna','Ida','Greta'],L:['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Koch','Richter','Wolf']},
 jp:{H:['Haruto','Sota','Yuto','Ren','Hinata','Riku','Kaito','Takumi','Daiki','Kenta','Sora','Yuma'],F:['Yui','Hina','Sakura','Aoi','Mio','Rin','Yuna','Mei','Akari','Hana','Emi','Saki'],L:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Yoshida','Mori']},
 br:{H:['Miguel','Arthur','Heitor','Bernardo','Davi','Gabriel','Pedro','Lucas','Rafael','Gustavo','Thiago','Caio'],F:['Helena','Alice','Laura','Valentina','Manuela','Sophia','Isabella','Luiza','Beatriz','Júlia','Lívia','Clara'],L:['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro']}
};

/* cost : niveau de vie relatif (loyers, prix des logements) ; mon : titre du monarque */
const COUNTRIES={
 'France':{pool:'fr',cost:1,cities:['Paris','Lyon','Marseille','Lille','Nantes','Bordeaux','Toulouse','Strasbourg','Rennes','Montpellier','Nice','Brest','Dijon','Grenoble']},
 'Belgique':{pool:'fr',cost:1,cities:['Bruxelles','Liège','Namur','Charleroi','Mons','Bruges'],mon:['Roi','Reine']},
 'Suisse':{pool:'fr',cost:1.5,cities:['Genève','Lausanne','Neuchâtel','Fribourg','Sion']},
 'Monaco':{pool:'fr',cost:2.5,cities:['Monaco','Monte-Carlo','La Condamine'],mon:['Prince souverain','Princesse souveraine']},
 'Canada':{pool:'fr',cost:1.1,cities:['Montréal','Québec','Ottawa','Sherbrooke','Gatineau']},
 'Maroc':{pool:'ar',cost:.45,cities:['Casablanca','Rabat','Marrakech','Tanger','Fès','Agadir'],mon:['Roi','Reine']},
 'Sénégal':{pool:'sn',cost:.35,cities:['Dakar','Saint-Louis','Thiès','Ziguinchor']},
 'Italie':{pool:'it',cost:.9,cities:['Rome','Milan','Naples','Turin','Florence','Venise']},
 'Espagne':{pool:'es',cost:.85,cities:['Madrid','Barcelone','Séville','Valence','Bilbao'],mon:['Roi','Reine']},
 'Royaume-Uni':{pool:'en',cost:1.2,cities:['Londres','Manchester','Édimbourg','Liverpool','Bristol'],mon:['Roi','Reine']},
 'États-Unis':{pool:'en',cost:1.3,cities:['New York','Los Angeles','Chicago','Miami','La Nouvelle-Orléans','Austin']},
 'Allemagne':{pool:'de',cost:1,cities:['Berlin','Munich','Hambourg','Cologne','Francfort']},
 'Japon':{pool:'jp',cost:1.1,cities:['Tokyo','Osaka','Kyoto','Sapporo','Fukuoka'],mon:['Empereur','Impératrice']},
 'Brésil':{pool:'br',cost:.5,cities:['Rio de Janeiro','São Paulo','Salvador','Recife','Brasília']}
};
const ROYAL_HOUSES=['de Valmont','d’Orvelle','de Montclair','de Castelbranc','de Rochebelle','d’Aubeterre'];

const ZODIAC=[['Capricorne',1,19],['Verseau',2,18],['Poissons',3,20],['Bélier',4,19],['Taureau',5,20],['Gémeaux',6,20],['Cancer',7,22],['Lion',8,22],['Vierge',9,22],['Balance',10,22],['Scorpion',11,21],['Sagittaire',12,21],['Capricorne',12,31]];
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

/* Apparence (avatars) */
const SKINS=['#F6D7C3','#EEC1A0','#D9A07A','#B97D57','#8D5A3B','#5E3B27'];
const HAIRC=['#1E1A18','#3B2A20','#6B4428','#A8743F','#D9B36A','#B4502C'];
const EYEC=['#3B2A20','#2D5C8A','#4C7A3D','#6B4428'];
const SHIRTS=['#2F6F8F','#8F3F6B','#3F8F5E','#C77B2A','#5B4BA8','#A83F3F','#3A3A3A','#D9A52B'];

const TALENTS={comedie:'Comédie',musique:'Musique',sport:'Sport',mannequinat:'Mannequinat',peinture:'Peinture',ecriture:'Écriture',cuisine:'Cuisine',danse:'Danse',sciences:'Sciences',crime:'Crime'};
const LESSONS=[
 {k:'piano',n:'Piano',t:'musique',min:5},{k:'guitare',n:'Guitare',t:'musique',min:7},{k:'violon',n:'Violon',t:'musique',min:5},{k:'batterie',n:'Batterie',t:'musique',min:8},{k:'chant',n:'Chant',t:'musique',min:6},
 {k:'danse',n:'Danse classique',t:'danse',min:4},{k:'hiphop',n:'Hip-hop',t:'danse',min:8},{k:'theatre',n:'Théâtre',t:'comedie',min:6},{k:'mannequin',n:'Cours de mannequinat',t:'mannequinat',min:12},
 {k:'dessin',n:'Dessin et peinture',t:'peinture',min:5},{k:'ecriture',n:'Atelier d’écriture',t:'ecriture',min:9},{k:'cuisine',n:'Cours de cuisine',t:'cuisine',min:8},
 {k:'football',n:'Football',t:'sport',min:5},{k:'tennis',n:'Tennis',t:'sport',min:5},{k:'natation',n:'Natation',t:'sport',min:4},{k:'equitation',n:'Équitation',t:'sport',min:6},
 {k:'judo',n:'Judo',t:'sport',min:5,belt:1},{k:'karate',n:'Karaté',t:'sport',min:6,belt:1},{k:'echecs',n:'Échecs',t:'sciences',min:6},{k:'robotique',n:'Robotique',t:'sciences',min:9}
];
const BELTS=['blanche','jaune','orange','verte','bleue','marron','noire'];

/* Études */
const TRADES={plomberie:'plomberie',electricite:'électricité',coiffure:'coiffure',boulangerie:'boulangerie',mecanique:'mécanique',cuisine:'cuisine',menuiserie:'menuiserie',esthetique:'esthétique'};
/* type lic : licence 3 ans, ouvre master puis doctorat ; ecole : diplôme direct */
const MAJORS={
 info:{n:'Informatique',type:'lic',y:3,g:45},
 maths:{n:'Mathématiques',type:'lic',y:3,g:55},
 sciences:{n:'Physique-chimie',type:'lic',y:3,g:50},
 bio:{n:'Biologie',type:'lic',y:3,g:45},
 psycho:{n:'Psychologie',type:'lic',y:3,g:40},
 eco:{n:'Économie',type:'lic',y:3,g:45},
 lettres:{n:'Lettres modernes',type:'lic',y:3,g:35},
 hist:{n:'Histoire',type:'lic',y:3,g:35},
 langues:{n:'Langues étrangères',type:'lic',y:3,g:35},
 arts:{n:'Arts plastiques',type:'lic',y:3,g:30},
 musico:{n:'Musicologie',type:'lic',y:3,g:30},
 staps:{n:'Sport (STAPS)',type:'lic',y:3,g:30},
 medecine:{n:'Médecine',type:'ecole',y:8,g:75,cost:500,dip:'Doctorat de médecine'},
 pharmacie:{n:'Pharmacie',type:'ecole',y:6,g:65,cost:500,dip:'Diplôme de pharmacien'},
 dentaire:{n:'Chirurgie dentaire',type:'ecole',y:6,g:65,cost:500,dip:'Diplôme de chirurgien-dentiste'},
 veto:{n:'École vétérinaire',type:'ecole',y:5,g:70,cost:2500,dip:'Diplôme de vétérinaire'},
 droit:{n:'Droit',type:'ecole',y:5,g:55,cost:300,dip:'Master de droit'},
 commerce:{n:'École de commerce',type:'ecole',y:5,g:50,cost:13000,dip:'Diplôme d’école de commerce'},
 ingenieur:{n:'École d’ingénieurs',type:'ecole',y:5,g:62,cost:3000,dip:'Diplôme d’ingénieur'},
 sciencespo:{n:'Sciences Po',type:'ecole',y:5,g:65,cost:9000,dip:'Diplôme de Sciences Po'},
 archi:{n:'Architecture',type:'ecole',y:5,g:50,cost:600,dip:'Diplôme d’architecte'},
 infirmier:{n:'Soins infirmiers',type:'ecole',y:3,g:40,cost:200,dip:'Diplôme d’État d’infirmier'},
 journalisme:{n:'École de journalisme',type:'ecole',y:2,g:55,cost:6000,dip:'Diplôme de journaliste',needLic:1},
 cinema:{n:'École de cinéma',type:'ecole',y:3,g:40,cost:7000,dip:'Diplôme de réalisation'},
 hotel:{n:'École hôtelière',type:'ecole',y:3,g:35,cost:9000,dip:'Diplôme d’école hôtelière'},
 conservatoire:{n:'Conservatoire',type:'ecole',y:4,g:30,cost:400,dip:'Prix du conservatoire',talent:'musique'}
};
const deOf=n=>{n=n.toLowerCase();return (/^[aeiouyéèêàâîïôûh]/.test(n)?'d’':'de ')+n};
function degName(k){
 if(k==='brevet')return 'Brevet des collèges';if(k==='bac')return 'Baccalauréat';
 if(k.startsWith('cap_'))return 'CAP '+TRADES[k.slice(4)];
 if(k.startsWith('bacpro_'))return 'Bac pro '+TRADES[k.slice(7)];
 if(k.startsWith('lic_'))return 'Licence '+deOf(MAJORS[k.slice(4)].n);
 if(k.startsWith('master_'))return 'Master '+deOf(MAJORS[k.slice(7)].n);
 if(k.startsWith('doc_'))return 'Doctorat '+deOf(MAJORS[k.slice(4)].n);
 return MAJORS[k]?MAJORS[k].dip:k;
}

/* Métiers. req.deg : liste de diplômes acceptés ; '*lic' = n’importe quelle licence, '*master' = n’importe quel master, '*doc' = n’importe quel doctorat */
const CAREERS={
 resto:{n:'Restauration',ladder:['Plongeur','Commis de cuisine','Serveur','Chef de rang','Maître d’hôtel','Gérant de restaurant'],base:19500,step:1.15,req:{age:16}},
 vente:{n:'Commerce',ladder:['Vendeur','Conseiller de vente','Responsable de rayon','Directeur de magasin'],base:20000,step:1.18,req:{age:16}},
 caisse:{n:'Grande distribution',ladder:['Hôte de caisse','Chef de caisse','Manager de secteur','Directeur d’hypermarché'],base:19000,step:1.22,req:{age:16}},
 btp:{n:'Bâtiment',ladder:['Manœuvre','Maçon','Chef d’équipe','Conducteur de travaux'],base:21500,step:1.2,req:{age:16,health:40}},
 menage:{n:'Propreté',ladder:['Agent d’entretien','Chef d’équipe propreté','Gérant d’entreprise de nettoyage'],base:18500,step:1.3,req:{age:16}},
 secu:{n:'Sécurité',ladder:['Agent de sécurité','Chef de poste','Responsable sécurité'],base:20500,step:1.2,req:{age:18,clean:1}},
 livr:{n:'Logistique',ladder:['Préparateur de commandes','Chauffeur-livreur','Chef de quai','Responsable logistique'],base:21000,step:1.18,req:{age:18,license:'car'}},
 taxi:{n:'Transport',ladder:['Chauffeur VTC','Chauffeur de taxi','Patron de compagnie de taxis'],base:21000,step:1.35,req:{age:21,license:'car'}},
 call:{n:'Relation client',ladder:['Téléconseiller','Superviseur','Responsable de plateau'],base:19500,step:1.2,req:{age:18}},
 poste:{n:'La Poste',ladder:['Facteur','Facteur-guichetier','Responsable de bureau de poste'],base:20000,step:1.18,req:{age:18}},
 agri:{n:'Agriculture',ladder:['Ouvrier agricole','Agriculteur','Exploitant agricole'],base:18500,step:1.3,req:{age:16,health:45}},
 peche:{n:'Pêche',ladder:['Matelot','Marin-pêcheur','Patron pêcheur'],base:21000,step:1.3,req:{age:16,health:55}},
 plomb:{n:'Plomberie',ladder:['Apprenti plombier','Plombier','Plombier chauffagiste','Artisan plombier'],base:21000,step:1.25,req:{age:16,deg:['cap_plomberie','bacpro_plomberie']}},
 elec:{n:'Électricité',ladder:['Apprenti électricien','Électricien','Chef de chantier','Artisan électricien'],base:21000,step:1.25,req:{age:16,deg:['cap_electricite','bacpro_electricite']}},
 coiff:{n:'Coiffure',ladder:['Apprenti coiffeur','Coiffeur','Coiffeur styliste','Gérant de salon'],base:19000,step:1.22,req:{age:16,deg:['cap_coiffure','bacpro_coiffure']}},
 boul:{n:'Boulangerie',ladder:['Apprenti boulanger','Boulanger','Chef boulanger','Artisan boulanger'],base:19500,step:1.25,req:{age:16,deg:['cap_boulangerie','bacpro_boulangerie']}},
 meca:{n:'Mécanique',ladder:['Apprenti mécanicien','Mécanicien','Chef d’atelier','Garagiste'],base:20500,step:1.25,req:{age:16,deg:['cap_mecanique','bacpro_mecanique']}},
 menuis:{n:'Menuiserie',ladder:['Apprenti menuisier','Menuisier','Ébéniste','Maître artisan'],base:20500,step:1.25,req:{age:16,deg:['cap_menuiserie','bacpro_menuiserie']}},
 esthe:{n:'Esthétique',ladder:['Esthéticien','Prothésiste ongulaire','Gérant d’institut'],base:19000,step:1.3,req:{age:16,deg:['cap_esthetique','bacpro_esthetique']}},
 cuisine:{n:'Gastronomie',ladder:['Commis','Chef de partie','Sous-chef','Chef de cuisine','Chef étoilé'],base:21000,step:1.3,req:{age:16,deg:['cap_cuisine','bacpro_cuisine','hotel']}},
 soin:{n:'Santé',ladder:['Aide-soignant','Auxiliaire de vie','Responsable d’équipe'],base:22000,step:1.18,req:{deg:['bac']}},
 police:{n:'Police',ladder:['Gardien de la paix','Brigadier','Lieutenant','Capitaine','Commissaire'],base:24000,step:1.22,req:{deg:['bac'],health:50,clean:1}},
 gendarme:{n:'Gendarmerie',ladder:['Gendarme','Maréchal des logis','Adjudant','Officier de gendarmerie'],base:24000,step:1.22,req:{deg:['bac'],health:55,clean:1}},
 pomp:{n:'Pompiers',ladder:['Sapeur-pompier','Caporal','Sergent','Lieutenant','Capitaine'],base:23500,step:1.18,req:{health:65,clean:1}},
 secret:{n:'Secrétariat',ladder:['Secrétaire','Assistant de direction','Office manager'],base:22000,step:1.2,req:{deg:['bac']}},
 immo:{n:'Immobilier',ladder:['Négociateur immobilier','Agent immobilier','Directeur d’agence'],base:23000,step:1.35,req:{deg:['bac']}},
 banqueg:{n:'Banque',ladder:['Chargé d’accueil','Conseiller bancaire','Directeur d’agence bancaire'],base:23000,step:1.3,req:{deg:['bac']}},
 steward:{n:'Aérien',ladder:['Steward','Chef de cabine','Chef de cabine principal'],base:24000,step:1.2,req:{deg:['bac'],looks:40}},
 douane:{n:'Douanes',ladder:['Agent des douanes','Contrôleur des douanes','Inspecteur des douanes'],base:23500,step:1.22,req:{deg:['bac'],clean:1}},
 infi:{n:'Soins infirmiers',ladder:['Infirmier','Infirmier spécialisé','Cadre de santé'],base:27000,step:1.2,req:{deg:['infirmier']}},
 prof:{n:'Enseignement',ladder:['Professeur des écoles','Professeur certifié','Professeur agrégé','Proviseur'],base:25000,step:1.2,req:{age:21,deg:['*master','*lic']}},
 dev:{n:'Informatique',ladder:['Développeur junior','Développeur','Développeur senior','Lead dev','Directeur technique'],base:34000,step:1.25,req:{deg:['lic_info','master_info','ingenieur']}},
 ing:{n:'Ingénierie',ladder:['Ingénieur junior','Ingénieur','Ingénieur principal','Directeur R&D'],base:39000,step:1.25,req:{deg:['ingenieur','master_sciences','master_maths']}},
 med:{n:'Médecine',ladder:['Interne','Médecin généraliste','Médecin spécialiste','Chef de service','Professeur de médecine'],base:32000,step:1.38,req:{deg:['medecine']}},
 chir:{n:'Chirurgie',ladder:['Interne en chirurgie','Chirurgien','Chirurgien en chef'],base:38000,step:1.6,req:{deg:['medecine'],smarts:70}},
 pharma:{n:'Pharmacie',ladder:['Pharmacien adjoint','Pharmacien titulaire','Pharmacien d’officine'],base:38000,step:1.3,req:{deg:['pharmacie']}},
 dent:{n:'Dentaire',ladder:['Chirurgien-dentiste','Dentiste associé','Orthodontiste'],base:48000,step:1.35,req:{deg:['dentaire']}},
 veto:{n:'Vétérinaire',ladder:['Vétérinaire assistant','Vétérinaire','Vétérinaire associé'],base:33000,step:1.3,req:{deg:['veto']}},
 droit:{n:'Droit',ladder:['Juriste','Avocat collaborateur','Avocat associé','Bâtonnier'],base:34000,step:1.4,req:{deg:['droit']}},
 juge:{n:'Magistrature',ladder:['Juge stagiaire','Juge','Président de tribunal','Juge à la Cour de cassation'],base:36000,step:1.3,req:{deg:['droit'],smarts:65,clean:1}},
 notaire:{n:'Notariat',ladder:['Clerc de notaire','Notaire','Notaire associé'],base:30000,step:1.6,req:{deg:['droit']}},
 mkt:{n:'Marketing',ladder:['Assistant marketing','Chef de produit','Directeur marketing','PDG'],base:32000,step:1.4,req:{deg:['commerce','master_eco']}},
 finance:{n:'Finance',ladder:['Analyste financier','Gestionnaire de fonds','Trader','Directeur financier'],base:40000,step:1.45,req:{deg:['commerce','master_eco','master_maths','ingenieur']}},
 compta:{n:'Comptabilité',ladder:['Comptable','Expert-comptable','Associé de cabinet'],base:28000,step:1.4,req:{deg:['lic_eco','master_eco','commerce']}},
 archi:{n:'Architecture',ladder:['Architecte junior','Architecte','Architecte associé','Grand architecte'],base:30000,step:1.35,req:{deg:['archi']}},
 psy:{n:'Psychologie',ladder:['Psychologue','Psychologue clinicien','Psychanalyste réputé'],base:28000,step:1.3,req:{deg:['master_psycho','doc_psycho']}},
 journ:{n:'Journalisme',ladder:['Pigiste','Journaliste','Rédacteur en chef','Directeur de la rédaction'],base:24000,step:1.35,req:{deg:['journalisme','sciencespo','master_lettres','master_hist']}},
 diplo:{n:'Diplomatie',ladder:['Attaché d’ambassade','Conseiller diplomatique','Consul','Ambassadeur'],base:38000,step:1.3,req:{deg:['sciencespo','master_langues','droit'],clean:1}},
 cherch:{n:'Recherche',ladder:['Post-doctorant','Chercheur','Directeur de recherche','Directeur de laboratoire'],base:30000,step:1.3,req:{deg:['*doc']}},
 graph:{n:'Création',ladder:['Graphiste','Designer','Directeur artistique'],base:27000,step:1.3,req:{deg:['lic_arts','master_arts','cinema']}},
 culture:{n:'Culture',ladder:['Bibliothécaire','Conservateur','Directeur de musée'],base:24000,step:1.35,req:{deg:['lic_hist','master_hist','lic_lettres','master_lettres']}},
 coach:{n:'Sport',ladder:['Coach sportif','Préparateur physique','Entraîneur national'],base:22000,step:1.35,req:{deg:['lic_staps','master_staps']}},
 musicien:{n:'Orchestre',ladder:['Musicien d’orchestre','Premier violon','Chef d’orchestre'],base:26000,step:1.4,req:{deg:['conservatoire','lic_musico','master_musico']}},
 pilote:{n:'Aviation',ladder:['Copilote','Commandant de bord','Chef pilote'],base:45000,step:1.4,req:{deg:['bac'],license:'pilot',health:60}},
 capit:{n:'Marine marchande',ladder:['Officier de pont','Second capitaine','Capitaine de navire'],base:32000,step:1.3,req:{deg:['bac'],license:'boat'}}
};
/* Les carrières spéciales sont déclarées par les modules (registerMod, champ special). */
const SPORTS={foot:{n:'Football',team:['FC Lumière','Olympique du Sud','Racing Atlantique','AS Montagne','Stade du Nord']},basket:{n:'Basket',team:['Les Aigles de Paris','BC Riviera','Élan Lyonnais','Les Requins du Havre']},tennis:{n:'Tennis',solo:1},rugby:{n:'Rugby',team:['Stade Basque','Union Toulousaine','RC Garonne','Les Ours de Clermont']},velo:{n:'Cyclisme',team:['Équipe Azur','Team Montagne','Les Grimpeurs','Vélo Club Hexagone']}};
const MOVIE_GENRES=['Action','Comédie','Drame','Horreur','Science-fiction','Romance','Animation','Thriller','Documentaire','Western','Comédie musicale'];
const MUSIC_GENRES=['Pop','Rap','Rock','Électro','Variété française','Jazz','R’n’B','Métal'];
const TITLE_A=['Le Dernier','La Nuit','Les Ombres','Le Secret','L’Été','La Chute','Le Retour','Les Enfants','La Fièvre','Le Silence','Les Lumières','La Promesse','Le Bal','Le Voyage','La Colère'];
const TITLE_B=['de Marseille','du Phare','de minuit','des Lilas','d’hiver','sous la pluie','du Sud','des anges','de l’ours','du grand large','de la lune','sans retour','des étoiles','de Pigalle','du désert'];

const PART_TIME={
 fastfood:{n:'Équipier en fast-food',sal:6500,min:15},caissier:{n:'Caissier le week-end',sal:5500,min:16},
 baby:{n:'Baby-sitter régulier',sal:4000,min:14},colo:{n:'Animateur de colonie',sal:3500,min:17},
 journaux:{n:'Livreur de journaux',sal:2500,min:14},saison:{n:'Saisonnier aux vendanges',sal:3000,min:16},
 cours:{n:'Professeur particulier',sal:5000,min:17,smarts:60}
};
const GIGS=[
 {k:'baby',n:'Garder des enfants',min:12,gain:[40,150]},{k:'pelouse',n:'Tondre la pelouse des voisins',min:10,gain:[20,80]},
 {k:'chiens',n:'Promener des chiens',min:10,gain:[20,90]},{k:'voitures',n:'Laver des voitures',min:11,gain:[30,120]},
 {k:'vide',n:'Vendre des affaires au vide-grenier',min:8,gain:[10,200]},{k:'citron',n:'Tenir un stand de citronnade',min:6,gain:[5,40]},
 {k:'musique',n:'Jouer de la musique dans la rue',min:14,gain:[10,250],skill:'musique'},{k:'velo',n:'Livrer des repas à vélo',min:16,gain:[150,600]}
];
const MILITARY={branches:['Armée de Terre','Marine nationale','Armée de l’Air et de l’Espace','Légion étrangère'],ranks:['Soldat de 2e classe','Caporal','Sergent','Adjudant','Lieutenant','Capitaine','Commandant','Colonel','Général'],base:19500,step:1.15};
const OFFICES=[
 {k:'conseiller',n:'Conseiller municipal',sal:6000,term:6,cost:2000,min:18},
 {k:'maire',n:'Maire',sal:42000,term:6,cost:15000,min:18},
 {k:'depute',n:'Député',sal:87000,term:5,cost:40000,min:18},
 {k:'senateur',n:'Sénateur',sal:87000,term:6,cost:30000,min:24},
 {k:'ministre',n:'Ministre',sal:125000,term:5,appointed:1,min:25},
 {k:'president',n:'Président de la République',sal:185000,term:5,cost:500000,min:35}
];
const PARTIES=['Parti du Progrès','Union Républicaine','Les Écologistes unis','Mouvement Central','Rassemblement Populaire','Indépendant'];
const MOB_FAMILIES=['Le Clan des Calanques','La Famille Moretti','Le Syndicat du Port','Les Frères Kaïdo','La Bande du Canal'];
const MOB_RANKS=['Associé','Soldat','Lieutenant','Capo','Consigliere','Parrain'];
const MOB_JOBS=[
 {n:'Récupérer une dette',gain:[2000,15000],risk:.12,resp:4},{n:'Racketter un commerçant',gain:[3000,20000],risk:.18,resp:5},
 {n:'Escorter une cargaison',gain:[8000,40000],risk:.22,resp:7},{n:'Corrompre un fonctionnaire',gain:[0,0],risk:.2,resp:9,cost:20000},
 {n:'Organiser un casse',gain:[50000,300000],risk:.35,resp:14}
];
const SPY_RANKS=['Recrue','Agent de terrain','Agent confirmé','Chef de mission','Directeur des opérations'];
const SPY_CITIES=['Vienne','Istanbul','Moscou','Le Caire','Buenos Aires','Hong Kong','Berlin','Casablanca','Reykjavik','Singapour'];
const SPY_MISSIONS=[
 {n:'Infiltrer une ambassade',steps:[['Te faire passer pour un traiteur','charme'],['Crocheter le bureau du consul','agilite'],['Photographier les dossiers','sangfroid']]},
 {n:'Exfiltrer un informateur',steps:[['Organiser un rendez-vous discret','sangfroid'],['Semer une filature','agilite'],['Franchir la frontière avec de faux papiers','charme']]},
 {n:'Récupérer une clé USB volée',steps:[['Gagner la confiance du voleur au casino','charme'],['Subtiliser la clé','agilite'],['Quitter l’hôtel sans éveiller les soupçons','sangfroid']]},
 {n:'Démasquer une taupe',steps:[['Analyser les communications','intelligence'],['Tendre un piège','sangfroid'],['Mener l’interrogatoire','charme']]},
 {n:'Saboter un prototype',steps:[['Pénétrer dans l’usine','agilite'],['Désactiver le prototype','intelligence'],['T’échapper par les toits','agilite']]}
];
const SPY_FRONTS=[['Café de quartier',180000],['Librairie ancienne',240000],['Agence de voyages',320000],['Galerie d’art',650000],['Hôtel particulier',1800000]];
const CULT_A=['L’Ordre','Le Cercle','La Fraternité','Le Temple','Le Mouvement','La Communauté'];
const CULT_B=['de la Lumière intérieure','du Grand Tournesol','des Âmes sereines','du Dernier Matin','de l’Éveil cosmique','des Enfants de Sirius'];

/* Biens */
const HOUSE_TYPES=[['Studio',.55],['Appartement T2',.9],['Appartement T3',1.4],['Maison de ville',1.9],['Maison avec jardin',2.3],['Loft',2.8],['Longère',1.7],['Villa avec piscine',5],['Penthouse',8],['Manoir',12],['Château',22]];
const CARS=[['Vespa d’occasion',2500,'scooter'],['Renault Clio d’occasion',6500],['Fiat 500',14000],['Peugeot 208',21000],['Citroën C5 Aircross',33000],['Tesla Model 3',42000],['Volvo XC90',78000],['Range Rover',110000],['Porsche 911',140000],['Ferrari Roma',230000],['Lamborghini Huracán',260000],['Rolls-Royce Phantom',480000]];
const BOATS=[['Kayak de mer',900],['Voilier de 8 mètres',35000],['Bateau à moteur',60000],['Catamaran',320000],['Yacht de luxe',4500000]];
const PLANES=[['ULM',45000],['Cessna d’occasion',120000],['Hélicoptère',900000],['Jet privé',12000000]];
const JEWELS=[['Bague en argent',150],['Collier en or',1200],['Montre suisse',8500],['Bracelet en diamants',22000],['Bague de fiançailles en diamant',9000],['Parure de saphirs',85000],['Diamant rose',1500000]];
const INSTRUMENTS=[['Ukulélé',60,'musique'],['Guitare acoustique',250,'musique'],['Piano numérique',900,'musique'],['Batterie',1100,'musique'],['Violon d’étude',600,'musique'],['Piano à queue',45000,'musique']];
const ART=[['Lithographie signée',2500],['Toile d’un jeune peintre',8000],['Sculpture en bronze',45000],['Tableau impressionniste',900000]];
/* Objets de collection : prix, volatilité annuelle */
const COLLECTIBLES=[['Vinyle original des années 70',180,.25],['Carte Pokémon holographique',450,.45],['Album de timbres anciens',900,.2],['Baskets en édition limitée',650,.4],['Montre vintage',3200,.18],['Bande dessinée en édition originale',1200,.22],['Figurine de collection',150,.35],['Bouteille de grand cru',1500,.15],['Pièce d’or napoléonienne',2400,.12],['Guitare signée par une star du rock',18000,.3]];

/* Bourse */
const STOCKS=[
 {t:'LUXR',n:'Maison Lumière',s:'Luxe',p:310,v:.22},{t:'AERO',n:'Aérodyne',s:'Aéronautique',p:145,v:.25},{t:'VOLT',n:'Voltéo',s:'Énergie',p:28,v:.2},
 {t:'PIXL',n:'Pixelia',s:'Technologie',p:96,v:.35},{t:'BIOG',n:'Biogène',s:'Santé',p:62,v:.4},{t:'BQHX',n:'Banque Hexagone',s:'Banque',p:54,v:.18},
 {t:'DLCO',n:'Délices & Co',s:'Agroalimentaire',p:88,v:.12},{t:'MOTO',n:'Motorama',s:'Automobile',p:41,v:.28},{t:'LUDI',n:'Ludiverse',s:'Jeux vidéo',p:73,v:.38},
 {t:'PIER',n:'Pierre & Toit',s:'Immobilier',p:67,v:.15},{t:'TLCM',n:'Télécomète',s:'Télécoms',p:19,v:.16},{t:'COSM',n:'Cosmonix',s:'Spatial',p:120,v:.5}
];
const CRYPTOS=[{t:'BPC',n:'BitPièce',p:42000,v:.65},{t:'ETH',n:'Éthéron',p:2600,v:.8},{t:'CHAT',n:'ChatCoin',p:.12,v:1.4}];

/* Zoo */
const ZOO_ANIMALS={
 'Suricate':[2500,3,300],'Flamant rose':[3000,4,350],'Pingouin':[8000,7,900],'Loup':[12000,7,1200],'Kangourou':[15000,8,1300],'Zèbre':[25000,9,1800],
 'Paresseux':[20000,10,1500],'Crocodile':[40000,12,2500],'Koala':[50000,14,4000],'Lion':[60000,18,5000],'Tigre':[70000,19,5200],'Hippopotame':[80000,17,6000],
 'Girafe':[90000,20,5500],'Ours polaire':[110000,21,8000],'Gorille':[120000,22,7500],'Rhinocéros':[140000,23,9000],'Éléphant':[150000,26,12000],'Panda géant':[300000,35,20000]
};
const ZOO_NAMES=['Parc animalier','Zoo','Safari parc','Ménagerie','Biopark'];

/* Marché noir : prix de base, volatilité */
const BM_ITEMS={'Montres contrefaites':[60,.5],'Cigarettes de contrebande':[25,.35],'Sacs de luxe contrefaits':[120,.45],'Parfums de contrebande':[35,.3],'Baskets de collection':[180,.6],'Grands crus détournés':[90,.4],'Pièces auto volées':[220,.5],'Œuvres d’art volées':[4000,.8]};

/* Animaux de compagnie : prix, espérance de vie min-max */
const PETS={'Chien':[350,10,16],'Chat':[150,13,20],'Lapin':[60,7,11],'Hamster':[25,2,3],'Cochon d’Inde':[40,5,8],'Perroquet':[900,30,60],'Tortue':[80,40,80],'Furet':[200,6,9],'Cheval':[4500,25,32],'Serpent':[300,15,25],'Poisson rouge':[10,5,15],'Chèvre naine':[250,12,16]};
const PETN=['Biscotte','Filou','Câline','Pixel','Moka','Rocky','Noisette','Oslo','Gribouille','Praline','Pistache','Caramel','Loulou','Nala','Sushi','Crumble','Tofu','Paprika','Hercule','Pépite','Ficelle','Gaufrette','Zorro','Cannelle'];

/* Santé */
const DIS={
 grippe:{n:'la grippe',de:'de la grippe',h:-6,cure:.95,acute:1,w:6},
 angine:{n:'une angine',de:'d’une angine',h:-4,cure:.95,acute:1,w:4},
 gastro:{n:'une gastro-entérite',de:'d’une gastro-entérite',h:-4,cure:.95,acute:1,w:4},
 varicelle:{n:'la varicelle',de:'de la varicelle',h:-3,cure:.95,acute:1,max:12,w:5},
 otite:{n:'une otite',de:'d’une otite',h:-3,cure:.95,acute:1,max:12,w:4},
 allergie:{n:'des allergies',de:'d’une crise allergique',h:-1,hap:-2,cure:.4,w:2},
 asthme:{n:'de l’asthme',de:'d’une crise d’asthme',h:-3,cure:.3,w:1},
 migraine:{n:'des migraines',de:'de migraines',h:-2,hap:-4,cure:.5,w:2},
 depression:{n:'une dépression',de:'d’une dépression',h:-2,hap:-12,cure:.45,min:13,w:2,mental:1},
 anxiete:{n:'des troubles anxieux',de:'de troubles anxieux',hap:-8,h:-1,cure:.5,min:12,w:2,mental:1},
 burnout:{n:'un burn-out',de:'d’un burn-out',hap:-10,h:-3,cure:.6,min:22,w:1,mental:1},
 hernie:{n:'une hernie discale',de:'d’une hernie discale',h:-3,hap:-3,cure:.6,min:25,w:2},
 tension:{n:'de l’hypertension',de:'d’hypertension',h:-3,cure:.5,min:40,w:2},
 cholesterol:{n:'du cholestérol',de:'de cholestérol',h:-2,cure:.6,min:35,w:2},
 diabete:{n:'du diabète',de:'du diabète',h:-4,cure:.15,min:30,w:1},
 arthrose:{n:'de l’arthrose',de:'d’arthrose',h:-3,hap:-2,cure:.2,min:55,w:2},
 cardiaque:{n:'une insuffisance cardiaque',de:'d’une insuffisance cardiaque',h:-10,cure:.3,min:55,w:1},
 alzheimer:{n:'la maladie d’Alzheimer',de:'de la maladie d’Alzheimer',h:-6,smarts:-6,cure:.05,min:68,w:1},
 cancer:{n:'un cancer',de:'d’un cancer',h:-18,cure:.35,min:30,w:1},
 poumon:{n:'un cancer du poumon',de:'d’un cancer du poumon',h:-22,cure:.25,min:40,w:0}
};
const SURGERIES=[['Rhinoplastie',6500,'le nez'],['Lifting du visage',9000,'le visage'],['Implants capillaires',4500,'les cheveux'],['Blanchiment dentaire',800,'le sourire'],['Liposuccion',5000,'la silhouette'],['Injections de botox',400,'les rides'],['Chirurgie des paupières',3500,'le regard'],['Augmentation mammaire',7000,'la poitrine']];

/* Crimes */
const CRIMES=[
 {k:'tag',n:'Graffiti sur un mur',min:12,p:.8,gain:[0,0],jail:[0,0],fine:450,lawyer:800,ic:'🎨'},
 {k:'colis',n:'Vol de colis',min:12,p:.75,gain:[10,300],jail:[0,0],fine:600,lawyer:1200,ic:'📦'},
 {k:'vol',n:'Vol à l’étalage',min:10,p:.72,gain:[5,120],jail:[0,0],fine:300,lawyer:1500,ic:'🛍️'},
 {k:'pick',n:'Pickpocket dans le métro',min:12,p:.6,gain:[20,500],jail:[0,1],fine:800,lawyer:2000,ic:'👛'},
 {k:'cambr',n:'Cambriolage',min:16,p:.5,gain:[500,9000],jail:[1,4],fine:3000,lawyer:5000,ic:'🏠',game:'burglary'},
 {k:'auto',n:'Vol de voiture',min:16,p:.45,gain:[1500,15000],jail:[1,5],fine:5000,lawyer:6000,ic:'🚗'},
 {k:'arnaque',n:'Arnaque en ligne',min:16,p:.45,smart:1,gain:[1000,40000],jail:[1,6],fine:8000,lawyer:8000,ic:'💻'},
 {k:'fraude',n:'Fraude fiscale',min:18,p:.6,smart:1,gain:[5000,80000],jail:[1,5],fine:30000,lawyer:15000,ic:'🧾',needMoney:50000},
 {k:'detour',n:'Détournement de fonds au travail',min:18,p:.55,smart:1,gain:[10000,120000],jail:[2,7],fine:20000,lawyer:15000,ic:'💼',needJob:1},
 {k:'train',n:'Attaque du train postal',min:18,p:.25,gain:[40000,400000],jail:[5,15],fine:0,lawyer:20000,ic:'🚂'},
 {k:'braq',n:'Braquage de banque',min:18,p:.2,gain:[30000,600000],jail:[5,15],fine:0,lawyer:20000,ic:'🏦'}
];
const LAWSUITS=[
 {k:'patron',n:'Ton ancien employeur',why:'licenciement abusif',p:.5,gain:[8000,60000]},
 {k:'medecin',n:'Un médecin',why:'erreur médicale',p:.35,gain:[20000,250000]},
 {k:'voisin',n:'Ton voisin',why:'nuisances sonores',p:.55,gain:[500,5000]},
 {k:'marque',n:'Une grande marque',why:'produit défectueux',p:.3,gain:[10000,500000]},
 {k:'star',n:'Un magazine people',why:'atteinte à la vie privée',p:.45,gain:[5000,150000]},
 {k:'compagnie',n:'Une compagnie aérienne',why:'bagages perdus',p:.7,gain:[300,2500]}
];
const VACATIONS=[
 ['Week-end en Bretagne',400,6,'Crêpes, cidre et grand vent sur la pointe du Raz.'],['Camping dans les Gorges du Verdon',600,7,'Kayak et nuits à la belle étoile.'],
 ['Rome',1200,10,'Tu jettes une pièce dans la fontaine de Trevi.'],['Barcelone',1100,9,'Tapas et coucher de soleil sur la Barceloneta.'],
 ['Marrakech',1300,10,'Tu marchandes dans les souks de la médina.'],['Reykjavik',2400,12,'Aurores boréales et sources chaudes.'],
 ['New York',2800,14,'Tu montes au sommet de l’Empire State Building.'],['Tokyo',3600,15,'Tu te perds avec bonheur dans les ruelles de Shibuya.'],
 ['Bali',3500,16,'Rizières, temples et plongée en eau turquoise.'],['Safari au Kenya',5500,18,'Tu vois un lion à dix mètres de la jeep.'],
 ['Croisière aux Caraïbes',6500,18,'Cocktails et eaux turquoise pendant dix jours.'],['Tour du monde',15000,25,'Six mois, vingt pays, mille souvenirs.']
];
const FESTIVALS=[['Les Vieilles Charrues',180],['Hellfest',290],['Rock en Seine',170],['Les Francofolies',120],['Jazz à Juan',90],['Fête de la musique',0]];
const MOVIES=[['une comédie',2],['un film d’horreur',1],['un blockbuster de super-héros',3],['un drame intimiste',2],['un dessin animé',3],['un film d’auteur coréen',2]];

/* Rubans : un seul par vie, attribué à la mort dans cet ordre de priorité */
const RIBBONS=[
 {k:'president',n:'Chef d’État',d:'Être élu président de la République.',ic:'🏛️'},
 {k:'royal',n:'Couronné',d:'Monter sur le trône.',ic:'👑'},
 {k:'astronaute',n:'Cosmique',d:'Partir dans l’espace.',ic:'🚀'},
 {k:'cinema',n:'Palme d’or',d:'Remporter la Palme d’or ou trois César.',ic:'🎞️'},
 {k:'gourou',n:'Gourou',d:'Réunir 1 000 adeptes dans ton mouvement.',ic:'🕯️'},
 {k:'espion',n:'Agent double',d:'Réussir 10 missions d’espionnage.',ic:'🕶️'},
 {k:'parrain',n:'Parrain',d:'Devenir chef d’une famille du milieu.',ic:'🎩'},
 {k:'charge',n:'Plein aux as',d:'Mourir avec un patrimoine de 20 millions d’euros.',ic:'💎'},
 {k:'riche',n:'Riche',d:'Mourir avec un patrimoine de 2,5 millions d’euros.',ic:'💰'},
 {k:'celebre',n:'Célèbre',d:'Atteindre 90 % de notoriété.',ic:'⭐'},
 {k:'evade',n:'Fugitif',d:'T’évader de prison.',ic:'🗝️'},
 {k:'criminel',n:'Ennemi public',d:'Passer au moins 15 ans en prison.',ic:'⛓️'},
 {k:'bandit',n:'Bandit',d:'Commettre au moins 8 délits.',ic:'🦹'},
 {k:'academique',n:'Académique',d:'Obtenir un doctorat.',ic:'🎓'},
 {k:'heros',n:'Héros',d:'Finir ta vie avec un karma de 95 % ou plus.',ic:'😇'},
 {k:'fertile',n:'Famille nombreuse',d:'Avoir au moins 5 enfants.',ic:'👨‍👩‍👧‍👦'},
 {k:'seducteur',n:'Cœur d’artichaut',d:'Avoir eu au moins 8 partenaires.',ic:'💘'},
 {k:'fidele',n:'Âmes sœurs',d:'Rester marié plus de 50 ans avec la même personne.',ic:'💞'},
 {k:'entrepreneur',n:'Magnat',d:'Bâtir une entreprise valant 10 millions d’euros.',ic:'📈'},
 {k:'immobilier',n:'Propriétaire terrien',d:'Posséder 5 logements en même temps.',ic:'🏘️'},
 {k:'zoo',n:'Ami des bêtes',d:'Avoir 10 animaux dans ton zoo ou 5 animaux de compagnie.',ic:'🦒'},
 {k:'soldat',n:'Vétéran',d:'Servir 10 ans dans l’armée.',ic:'🎖️'},
 {k:'sportif',n:'Athlète',d:'Gagner un trophée sportif ou obtenir la ceinture noire.',ic:'🥋'},
 {k:'voyageur',n:'Globe-trotter',d:'Partir 8 fois en voyage.',ic:'🧳'},
 {k:'genereux',n:'Généreux',d:'Donner au moins 50 000 € au total.',ic:'🎁'},
 {k:'addict',n:'Dépendant',d:'Développer une forte addiction.',ic:'🍷'},
 {k:'centenaire',n:'Centenaire',d:'Vivre jusqu’à 100 ans.',ic:'🎂'},
 {k:'malchanceux',n:'Malchanceux',d:'Mourir avant 30 ans.',ic:'🍀'},
 {k:'pro',n:'Professionnel',d:'Atteindre le sommet de ta carrière.',ic:'💼'},
 {k:'genie',n:'Génie',d:'Mourir avec une intelligence de 95 % ou plus.',ic:'🧠'},
 {k:'beaute',n:'Beauté fatale',d:'Mourir avec une apparence de 95 % ou plus.',ic:'💄'},
 {k:'paresseux',n:'Paresseux',d:'Ne rien faire d’autre qu’appuyer sur Âge.',ic:'🛋️'},
 {k:'mediocre',n:'Ordinaire',d:'Vivre une vie sans éclat particulier.',ic:'😐'}
];

/* Défis : validés une fois pour toute la partie */
const CHALLENGES=[
 {k:'elysee',n:'Le rêve républicain',d:'Devenir président de la République.'},
 {k:'blouse',n:'Grand patron',d:'Devenir chef de service en médecine.'},
 {k:'tribu',n:'Tribu',d:'Avoir 6 enfants dans une même vie.'},
 {k:'evasion',n:'La grande évasion',d:'T’évader de prison.'},
 {k:'million30',n:'Millionnaire précoce',d:'Avoir 1 million d’euros sur ton compte avant 30 ans.'},
 {k:'palme',n:'Croisette',d:'Remporter la Palme d’or.'},
 {k:'duo',n:'Pour le meilleur',d:'Marier les deux joueurs ensemble.'},
 {k:'dynastie',n:'Dynastie',d:'Atteindre la quatrième génération.'},
 {k:'cent',n:'Cent bougies',d:'Fêter ses 100 ans.'},
 {k:'lune',n:'Un petit pas',d:'Marcher sur la Lune.'},
 {k:'ceinture',n:'Ceinture noire',d:'Obtenir la ceinture noire de judo ou de karaté.'},
 {k:'empire',n:'Empire immobilier',d:'Posséder 8 logements.'},
 {k:'arche',n:'L’arche',d:'Réunir 15 animaux dans ton zoo.'},
 {k:'agent',n:'Permis de tout faire',d:'Réussir 20 missions d’espionnage.'},
 {k:'retour',n:'Retour vers le passé',d:'Utiliser la machine à remonter le temps.'},
 {k:'tetedaffiche',n:'Tête d’affiche',d:'Devenir star de cinéma.'},
 {k:'jackpot',n:'Jackpot',d:'Gagner le gros lot du Loto.'},
 {k:'couronne',n:'Longue vie au roi',d:'Monter sur le trône.'}
];

const QUIET=['Une année tranquille.','Rien de notable cette année.','Une année comme les autres.','Le temps passe, doucement.','Une année sans histoire.'];
