/* Deux Vies — évènements au format JSON (interprétés par evRun dans events.js).
   Les suites d’une chaîne n’ont pas de poids propre : elles ne sortent que par next_forced_event_id ou une représaille. */
(()=>{
EVENT_DB.push(...[
{
  id:'evt_career_choice_042', category:'career_event', icon:'💼', once:true,
  conditions:{min_age:18,max_age:65,current_job:['banqueg','finance'],min_bank_balance:250000},
  probability_weight:0.15,
  prompt_text:'Ta fortune commence à faire jaser dans les couloirs de la banque. Un collègue mystérieux te propose de falsifier des comptes pour blanchir l’argent de la mafia locale.',
  choices:[
    {choice_text:'Accepter l’offre et plonger dans l’illégalité.',consequences:{bank_balance_modifier:[60000,150000],hidden_crime_stat_modifier:25,stress_level_increment:30,karma_modifier:-12,set_flag:'mafia_hook',next_forced_event_id:'evt_mafia_contact_01',result_text:'Tu signes les faux ordres de virement. L’argent arrive sur ton compte dès le lendemain.'}},
    {choice_text:'Refuser poliment et le signaler aux ressources humaines.',consequences:{job_performance_modifier:20,relationship_boss_modifier:15,karma_modifier:6,probability_of_retaliation_trigger:0.4,retaliation_event_id:'evt_career_retaliation',result_text:'Les RH te remercient. Ton collègue, lui, te regarde déjà de travers.'}},
    {choice_text:'Démissionner sur-le-champ pour vivre de tes rentes.',consequences:{current_job:null,happiness_modifier:10,stress_level_increment:-40,result_text:'Tu rends ton badge et tu sors en sifflotant.'}}
  ]
},
{
  id:'evt_mafia_contact_01', category:'career_event', icon:'🎩', conditions:{flag:'mafia_hook'}, probability_weight:0,
  prompt_text:'Un an plus tard, deux hommes en costume sombre t’attendent à la sortie de la banque. « Les affaires ont bien marché. On en reparle ? »',
  choices:[
    {choice_text:'Continuer à blanchir pour eux.',consequences:{bank_balance_modifier:[100000,300000],hidden_crime_stat_modifier:20,stress_level_increment:20,karma_modifier:-10,next_forced_event_id:'evt_mafia_police_02',next_forced_delay:2,result_text:'Tes comptes gonflent. Ta conscience, un peu moins.'}},
    {choice_text:'Couper les ponts, quitte à te faire discret.',consequences:{clear_flag:'mafia_hook',stress_level_increment:-10,happiness_modifier:-4,probability_of_retaliation_trigger:0.5,retaliation_event_id:'evt_mafia_threat_03',result_text:'Les deux hommes haussent les épaules. Tu sens qu’ils n’ont pas dit leur dernier mot.'}},
    {choice_text:'Tout raconter à la police.',consequences:{clear_flag:'mafia_hook',karma_modifier:10,fame_modifier:3,next_forced_event_id:'evt_mafia_threat_03',next_forced_delay:1,result_text:'Un commissaire te remercie chaleureusement… et te conseille de changer de numéro.'}}
  ]
},
{
  id:'evt_mafia_police_02', category:'crime', icon:'🚔', conditions:{flag:'mafia_hook'}, probability_weight:0,
  prompt_text:'Des enquêteurs de la brigade financière épluchent les comptes de ta banque. Ton nom apparaît dans plusieurs lignes de leur tableau.',
  choices:[
    {choice_text:'Détruire des documents.',consequences:{clear_flag:'mafia_hook',hidden_crime_stat_modifier:10,stress_level_increment:25,probability_of_retaliation_trigger:0.55,retaliation_event_id:'evt_mafia_arrest_04',result_text:'Le broyeur de bureau chauffe toute la nuit.'}},
    {choice_text:'Coopérer en échange d’une peine allégée.',consequences:{clear_flag:'mafia_hook',bank_balance_modifier:-50000,karma_modifier:5,add_record:1,current_job:null,result_text:'Tu rends l’argent, tu perds ton poste, mais tu gardes ta liberté.'}},
    {choice_text:'Prendre l’avion pour une destination sans extradition.',consequences:{clear_flag:'mafia_hook',bank_balance_modifier:-20000,current_job:null,happiness_modifier:-8,stress_level_increment:-20,add_record:1,result_text:'Tu quittes la France avec une valise et beaucoup d’imagination.'}}
  ]
},
{
  id:'evt_mafia_threat_03', category:'crime', icon:'📞', conditions:{}, probability_weight:0,
  prompt_text:'Un appel anonyme te glace le sang : « On sait où tu habites. Rends-nous un petit service et on oublie tout. »',
  choices:[
    {choice_text:'Céder au chantage.',consequences:{bank_balance_modifier:-30000,hidden_crime_stat_modifier:10,stress_level_increment:15,result_text:'Tu paies. Le téléphone cesse de sonner, pour l’instant.'}},
    {choice_text:'Porter plainte.',consequences:{karma_modifier:4,stress_level_increment:10,health_modifier:-2,result_text:'La police prend ta déposition et place ton domicile sous surveillance.'}},
    {choice_text:'Déménager discrètement.',consequences:{bank_balance_modifier:-8000,stress_level_increment:-5,happiness_modifier:-3,result_text:'Nouvelle ville, nouvelle boîte aux lettres.'}}
  ]
},
{
  id:'evt_mafia_arrest_04', category:'crime', icon:'⛓️', conditions:{}, probability_weight:0,
  prompt_text:'La police débarque à l’aube : les documents que tu croyais détruits avaient été sauvegardés sur un serveur.',
  consequences:{prison_years:[2,5],add_record:1,hidden_crime_stat_modifier:5,stress_level_increment:20,fame_modifier:2,result_text:'Tu es condamné pour blanchiment et obstruction.'}
},
{
  id:'evt_career_retaliation', category:'career_event', icon:'🗯️', conditions:{current_job:'any'}, probability_weight:0,
  prompt_text:'Ton collègue rancunier fait circuler des rumeurs sur toi à la machine à café : tu serais « celui qui balance ».',
  choices:[
    {choice_text:'En parler franchement à {boss}.',consequences:{relationship_boss_modifier:8,job_performance_modifier:-4,result_text:'{boss} te croit, mais la rumeur laisse des traces.'}},
    {choice_text:'Ignorer et travailler plus dur.',consequences:{job_performance_modifier:6,stress_level_increment:12,happiness_modifier:-4}},
    {choice_text:'Lui rendre la pareille.',consequences:{hidden_crime_stat_modifier:3,karma_modifier:-4,relationship_boss_modifier:-8,happiness_modifier:3,result_text:'Un petit coup de communication bien placé, et c’est lui qui se retrouve gêné.'}}
  ]
},
{
  id:'evt_stress_warning_100', category:'health', icon:'🔥', conditions:{has_job:true,min_hidden:{stress:62}}, probability_weight:0.35,
  prompt_text:'Tu dors mal, tu oublies des rendez-vous et ton médecin te regarde avec inquiétude : « Vous êtes au bord du burn-out. »',
  choices:[
    {choice_text:'Prendre trois semaines de vacances.',consequences:{bank_balance_modifier:-1800,stress_level_increment:-30,happiness_modifier:8,job_performance_modifier:-5,result_text:'Plage, livres et téléphone éteint. Tu reviens transformé.'}},
    {choice_text:'Continuer comme si de rien n’était.',consequences:{stress_level_increment:10,health_modifier:-4,next_forced_event_id:'evt_stress_collapse_101',next_forced_delay:1}},
    {choice_text:'Demander un temps partiel à {boss}.',consequences:{salary_multiplier:0.85,stress_level_increment:-20,relationship_boss_modifier:-4,happiness_modifier:6}}
  ]
},
{
  id:'evt_stress_collapse_101', category:'health', icon:'🚑', conditions:{has_job:true}, probability_weight:0,
  prompt_text:'Tu t’effondres en pleine réunion. Les pompiers t’emmènent aux urgences, sous les regards effarés de tes collègues.',
  consequences:{health_modifier:-10,stress_level_increment:-25,job_performance_modifier:-12,add_illness:'burnout',bank_balance_modifier:-600,result_text:'Arrêt maladie de deux mois et leçon retenue.'}
},
{
  id:'evt_tax_audit_110', category:'money', icon:'🧾', conditions:{min_age:25,min_bank_balance:200000}, probability_weight:0.08,
  prompt_text:'Un courrier du fisc t’annonce un contrôle approfondi de tes comptes sur les trois dernières années.',
  choices:[
    {choice_text:'Tout présenter avec un expert-comptable.',consequences:{bank_balance_modifier:-3500,stress_level_increment:5,result_text:'Tout est en règle. Tu n’as perdu que les honoraires.'}},
    {choice_text:'Régler le problème à l’amiable.',consequences:{money_percent:-4,stress_level_increment:8,result_text:'Un redressement de 4 % de tes avoirs, pas de pénalités.'}},
    {choice_text:'Cacher quelques revenus.',consequences:{money_percent:-12,hidden_crime_stat_modifier:6,karma_modifier:-4,add_record:1,stress_level_increment:15,result_text:'Le contrôleur n’a pas apprécié. Pénalités et casier.'}}
  ]
},
{
  id:'evt_boss_dinner_120', category:'career_event', icon:'🍷', conditions:{has_job:true,min_age:22}, probability_weight:0.25,
  prompt_text:'{boss} t’invite à dîner dans un restaurant chic « pour parler de ton avenir dans l’entreprise ».',
  choices:[
    {choice_text:'Y aller et jouer le jeu.',consequences:{bank_balance_modifier:-60,relationship_boss_modifier:[6,14],job_performance_modifier:4,stress_level_increment:3}},
    {choice_text:'Décliner poliment.',consequences:{relationship_boss_modifier:-4,stress_level_increment:-2}},
    {choice_text:'Profiter pour demander une augmentation.',consequences:{salary_multiplier:1.06,relationship_boss_modifier:-3,result_text:'Un oui du bout des lèvres, mais un oui quand même : +6 %.'}}
  ]
}
]);
/* ===== Nouveaux évènements ===== */
const C=(t,c)=>({choice_text:t,consequences:c});
const E=(id,category,icon,conditions,w,prompt_text,choices,extra)=>Object.assign({id:'evt_'+id,category,icon,conditions,probability_weight:w,prompt_text},Array.isArray(choices)?{choices}:{consequences:choices},extra||{});
EVENT_DB.push(...[
/* --- Chaîne 1 : la promotion convoitée (tous métiers) --- */
E('promo_rumeur_201','career_event','📣',{has_job:true,min_age:23,max_age:60},.3,'Le bruit court chez {job} : un poste de responsable se libère, et {boss} cherche un candidat. Toute la machine à café en parle.',[
 C('Postuler officiellement.',{job_performance_modifier:5,stress_level_increment:6,next_forced_event_id:'evt_promo_entretien_202',result_text:'Ton dossier est déposé. Plus qu’à attendre.'}),
 C('Faire discrètement du lèche-bottes.',{relationship_boss_modifier:[5,10],karma_modifier:-2,next_forced_event_id:'evt_promo_entretien_202',result_text:'Tu apportes des viennoiseries tous les matins. Les collègues s’interrogent.'}),
 C('Laisser tomber, tu es bien comme ça.',{stress_level_increment:-6,happiness_modifier:2})]),
E('promo_entretien_202','career_event','🎤',{has_job:true},.01,'Entretien avec {boss} et une DRH au sourire de façade : « Où vous voyez-vous dans cinq ans ? »',[
 C('Jouer la carte de l’ambition.',{job_performance_modifier:4,relationship_boss_modifier:4,next_forced_event_id:'evt_promo_verdict_203',next_forced_delay:0,result_text:'Tu cites trois fois le mot « synergie ». Ça passe.'}),
 C('Être sincère, quitte à être drôle.',{happiness_modifier:3,relationship_boss_modifier:[-4,8],next_forced_event_id:'evt_promo_verdict_203',next_forced_delay:0}),
 C('Annoncer que tu vises le poste de {boss}.',{relationship_boss_modifier:-8,fame_modifier:1,next_forced_event_id:'evt_promo_verdict_203',next_forced_delay:0,result_text:'Silence gêné. Puis un rire nerveux.'})]),
E('promo_verdict_203','career_event','🏆',{has_job:true},.01,'La réponse tombe un mardi matin, par mail, avec un smiley ambigu.',[
 C('Ouvrir le mail.',{salary_multiplier:1.12,job_performance_modifier:6,happiness_modifier:6,stress_level_increment:4,result_text:'C’est oui ! Augmentation de 12 % et un nouveau badge.'}),
 C('Ouvrir le mail en croisant les doigts.',{job_performance_modifier:-3,happiness_modifier:-3,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_headhunter_210',result_text:'C’est non. « Une prochaine fois », promet-on.'})]),
E('headhunter_210','career_event','🕴️',{has_job:true,min_age:25,max_age:58},.05,'Un chasseur de têtes t’appelle sur LinkedIn : « Un poste confidentiel, mieux payé, dans une autre ville… »',[
 C('Accepter de le rencontrer.',{salary_multiplier:1.15,stress_level_increment:8,relationship_boss_modifier:-6,result_text:'Tu négocies ta paie en secret, puis tu la fais valoir à {boss}.'}),
 C('Raccrocher poliment.',{relationship_boss_modifier:3,job_performance_modifier:2})]),
/* --- Chaîne 2 : le client qui a tout compris (banque) --- */
E('banque_client_220','career_event','🏦',{current_job:'banqueg',min_age:21,max_age:62},.3,'Un client âgé et très bavard te dit chaque semaine qu’il veut léguer toute sa fortune à « une personne de confiance ». Il te regarde fixement.',[
 C('Lui conseiller de voir un notaire.',{karma_modifier:5,job_performance_modifier:3,next_forced_event_id:'evt_banque_client_221',result_text:'Ton honnêteté l’émeut.'}),
 C('Lui vendre un produit d’épargne maison.',{bank_balance_modifier:[500,2500],job_performance_modifier:6,karma_modifier:-3,hidden_crime_stat_modifier:2,stress_level_increment:3,next_forced_event_id:'evt_banque_client_221'}),
 C('Éviter son guichet.',{stress_level_increment:-2})]),
E('banque_client_221','career_event','📜',{current_job:'banqueg'},.01,'Le client est décédé. Sa famille t’attend avec un notaire, des lunettes sévères et un testament surprise.',[
 C('Rester professionnel et neutre.',{karma_modifier:3,relationship_boss_modifier:4}),
 C('Accepter le petit legs qu’il t’a laissé.',{bank_balance_modifier:[3000,9000],karma_modifier:1,stress_level_increment:5,probability_of_retaliation_trigger:.4,retaliation_event_id:'evt_banque_inspection_222'}),
 ]),
E('banque_inspection_222','career_event','🔎',{current_job:'banqueg'},.01,'L’inspection générale de la banque s’intéresse à ce legs. Un jeune contrôleur à lunettes ouvre un grand classeur.',[
 C('Tout expliquer calmement.',{stress_level_increment:6,job_performance_modifier:-3,result_text:'Après trois heures, la lumière revient.'}),
 C('Rendre l’argent immédiatement.',{bank_balance_modifier:-5000,karma_modifier:4,relationship_boss_modifier:5})]),
E('banque_tentation_223','crime','💳',{current_job:['banqueg','finance','compta'],min_age:22},.12,'En passant des écritures, tu remarques qu’un compte dormant contient 8 000 € que personne ne réclamera jamais.',[
 C('Les signaler au service compétent.',{karma_modifier:4,job_performance_modifier:4}),
 C('Les « emprunter » un petit moment.',{bank_balance_modifier:8000,hidden_crime_stat_modifier:10,karma_modifier:-8,stress_level_increment:12,probability_of_retaliation_trigger:.4,retaliation_event_id:'evt_banque_inspection_222'}),
 C('Fermer l’écran en regardant ailleurs.',{stress_level_increment:2})]),
/* --- Chaîne 3 : médecine, la garde de nuit --- */
E('med_garde_230','career_event','🏥',{current_job:['med','infi','soin','chir'],min_age:22},.3,'Garde de nuit aux urgences : la salle d’attente déborde, la machine à café est en panne, et un patient exige de voir « le vrai médecin ».',[
 C('Prendre les cas les plus lourds.',{job_performance_modifier:6,stress_level_increment:14,health_modifier:-2,karma_modifier:3,next_forced_event_id:'evt_med_patient_231'}),
 C('Faire de la pédagogie et calmer tout le monde.',{job_performance_modifier:3,stress_level_increment:6,happiness_modifier:2}),
 C('Boire trois cafés et foncer.',{stress_level_increment:10,health_modifier:-1,job_performance_modifier:4,bank_balance_modifier:-4})]),
E('med_patient_231','career_event','💌',{current_job:['med','infi','soin','chir']},.01,'Un patient que tu as sauvé une nuit d’hiver revient avec une boîte de chocolats et une carte de remerciements dessinée par ses petits-enfants.',{happiness_modifier:8,karma_modifier:3,stress_level_increment:-10,fame_modifier:1,result_text:'Il y a des jours où ce métier a du sens.'}),
E('med_erreur_232','career_event','💊',{current_job:['med','infi','pharma','chir'],min_age:23},.1,'Tu t’aperçois qu’une ordonnance, la veille, comportait une erreur de dosage : personne ne l’a encore remarqué.',[
 C('Prévenir immédiatement le patient et le chef de service.',{karma_modifier:6,stress_level_increment:10,job_performance_modifier:-2,relationship_boss_modifier:5}),
 C('Rattraper discrètement l’erreur.',{karma_modifier:-1,hidden_crime_stat_modifier:2,stress_level_increment:6}),
 C('Dire que c’est la faute du logiciel.',{karma_modifier:-6,hidden_crime_stat_modifier:3,stress_level_increment:9,probability_of_retaliation_trigger:.35,retaliation_event_id:'evt_retaliation_plainte_270'})]),
E('med_conference_233','career_event','🎓',{current_job:['med','chir','pharma','dent','veto','cherch'],min_age:25},.15,'On t’invite à intervenir dans un congrès à Lyon. Buffet, badge doré, et un public sceptique.',[
 C('Préparer une communication solide.',{smarts_modifier:2,fame_modifier:2,bank_balance_modifier:-300,job_performance_modifier:4,stress_level_increment:4}),
 C('Improviser avec ton charme.',{fame_modifier:1,happiness_modifier:3,job_performance_modifier:-1}),
 C('Envoyer ton stagiaire à ta place.',{stress_level_increment:-4,relationship_boss_modifier:-3})]),
/* --- Chaîne 4 : droit, le dossier explosif --- */
E('droit_dossier_240','career_event','⚖️',{current_job:['droit','juge','notaire'],min_age:23},.25,'Un confrère te confie un dossier explosif : un chef d’entreprise très médiatisé cherche un défenseur discret.',[
 C('Prendre l’affaire.',{bank_balance_modifier:[4000,15000],fame_modifier:3,stress_level_increment:12,next_forced_event_id:'evt_droit_audience_241'}),
 C('Décliner, trop risqué.',{stress_level_increment:-3,job_performance_modifier:-1}),
 C('Transmettre à un jeune collaborateur.',{relationship_boss_modifier:3,karma_modifier:1})]),
E('droit_audience_241','career_event','🏛️',{current_job:['droit','juge','notaire']},.01,'Le jour de l’audience, les caméras sont là. Le président tousse, ton adversaire sourit, ton dossier tient en quarante pages.',[
 C('Plaider avec le cœur.',{fame_modifier:4,job_performance_modifier:6,happiness_modifier:5,stress_level_increment:8,result_text:'Tes envolées font la une du site du Monde, section « Société ».'}),
 C('Rester technique et froid.',{job_performance_modifier:4,smarts_modifier:1,stress_level_increment:5}),
 C('Demander un renvoi.',{stress_level_increment:3,job_performance_modifier:-4,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_retaliation_plainte_270'})]),
E('droit_tentation_242','crime','🗂️',{current_job:['droit','juge','notaire','compta'],min_age:23},.1,'Un client glisse une enveloppe épaisse dans un dossier : « Pour que le calendrier s’arrange. »',[
 C('Refuser et rappeler la déontologie.',{karma_modifier:5,job_performance_modifier:3,relationship_boss_modifier:3}),
 C('Empocher et faire semblant de ne rien voir.',{bank_balance_modifier:[3000,9000],hidden_crime_stat_modifier:9,karma_modifier:-7,stress_level_increment:9,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_retaliation_plainte_270'})]),
/* --- Chaîne 5 : police, la filature --- */
E('police_filature_250','career_event','🚓',{current_job:['police','gendarme','douane'],min_age:21},.25,'Une planque de six heures dans une voiture sans chauffage, face à un tabac-presse où se passe un trafic.',[
 C('Tenir jusqu’au bout.',{job_performance_modifier:6,stress_level_increment:8,health_modifier:-1,next_forced_event_id:'evt_police_arrestation_251'}),
 C('Quitter la voiture pour un café.',{job_performance_modifier:-3,happiness_modifier:2,bank_balance_modifier:-4}),
 C('Appeler du renfort.',{relationship_boss_modifier:4,stress_level_increment:3})]),
E('police_arrestation_251','career_event','🔦',{current_job:['police','gendarme','douane']},.01,'Ton obstination paie : une opération coup de poing démantèle un petit réseau. La presse locale t’interviewe, un peu ébahie.',{job_performance_modifier:10,fame_modifier:3,happiness_modifier:6,relationship_boss_modifier:8,stress_level_increment:5,next_forced_event_id:'evt_police_menace_252',result_text:'« Un travail d’équipe remarquable », dit le préfet. Tu rougis.'}),
E('police_menace_252','crime','✉️',{current_job:['police','gendarme','douane']},.01,'Une lettre anonyme glissée sous ta porte : « On sait que c’est toi. »',[
 C('Prévenir ta hiérarchie.',{relationship_boss_modifier:5,stress_level_increment:6,karma_modifier:2}),
 C('Garder ça pour toi.',{stress_level_increment:14,happiness_modifier:-3})]),
E('police_corruption_253','crime','🕵️',{current_job:['police','gendarme','douane','secu'],min_age:21},.1,'Lors d’un contrôle, un automobiliste pressé te tend discrètement un billet de 200 € avec son permis.',[
 C('Verbaliser sans état d’âme.',{karma_modifier:4,job_performance_modifier:3}),
 C('Fermer les yeux, empocher.',{bank_balance_modifier:200,hidden_crime_stat_modifier:6,karma_modifier:-6,stress_level_increment:7})]),
/* --- Restauration --- */
E('resto_coup_de_feu_260','career_event','🍽️',{current_job:['resto','cuisine'],min_age:16},.3,'Samedi soir, 120 couverts, le four tombe en panne et {boss} hurle depuis les fourneaux.',[
 C('Improviser un menu court.',{job_performance_modifier:6,stress_level_increment:9,relationship_boss_modifier:5,result_text:'« Menu du chef : surprise ! » Les clients adorent.'}),
 C('Garder ton calme et gérer les commandes.',{job_performance_modifier:4,stress_level_increment:5}),
 C('Quitter la cuisine en plein service.',{job_performance_modifier:-10,relationship_boss_modifier:-12,stress_level_increment:-6,happiness_modifier:3})]),
E('resto_critique_261','career_event','⭐',{current_job:['resto','cuisine'],min_age:20,job_level_min:1},.12,'Un critique gastronomique est attablé incognito, tu le reconnais à son carnet et à sa moue experte.',[
 C('Soigner l’assiette comme jamais.',{fame_modifier:3,job_performance_modifier:6,happiness_modifier:4,stress_level_increment:8,next_forced_event_id:'evt_resto_guide_262'}),
 C('Faire comme d’habitude.',{job_performance_modifier:1}),
 C('Lui offrir une bouteille.',{bank_balance_modifier:-80,hidden_crime_stat_modifier:1,fame_modifier:1,karma_modifier:-1})]),
E('resto_guide_262','career_event','📖',{current_job:['resto','cuisine']},.01,'Le guide régional publie sa nouvelle édition : ton établissement y a droit à une demi-page enthousiaste.',{fame_modifier:3,bank_balance_modifier:[1500,6000],happiness_modifier:7,job_performance_modifier:6,result_text:'La réservation explose, les cuisiniers pleurent de joie.'}),
E('resto_pourboires_263','money','🪙',{current_job:['resto','cuisine','steward'],min_age:16},.2,'Un client oublie sa liasse de pourboires sur la table, bien plus que ton salaire d’un mois.',[
 C('La rendre au client qui revient.',{karma_modifier:5,happiness_modifier:2}),
 C('La glisser dans ta poche.',{bank_balance_modifier:[400,1200],hidden_crime_stat_modifier:4,karma_modifier:-4,stress_level_increment:4})]),
/* --- Informatique --- */
E('dev_bug_270','career_event','🐛',{current_job:['dev','ing'],min_age:21},.3,'Vendredi à 17 h 58, un bug critique plante la prod. {boss} te regarde depuis l’autre bout de l’open space.',[
 C('Rester toute la nuit pour le corriger.',{job_performance_modifier:7,stress_level_increment:12,health_modifier:-2,relationship_boss_modifier:6,result_text:'Samedi matin, tout fonctionne. Tu sens le café dans tes veines.'}),
 C('Mettre une rustine et partir.',{job_performance_modifier:-2,stress_level_increment:2,next_forced_event_id:'evt_dev_rollback_271'}),
 C('Faire semblant de ne rien avoir vu.',{job_performance_modifier:-6,relationship_boss_modifier:-4,hidden_crime_stat_modifier:1})]),
E('dev_rollback_271','career_event','🔥',{current_job:['dev','ing']},.01,'La rustine a tenu jusqu’à lundi matin. Le site est en panne depuis six heures et le service client croule.',[
 C('Assumer et tout réparer.',{job_performance_modifier:3,stress_level_increment:10,relationship_boss_modifier:2,karma_modifier:2}),
 C('Accuser le stagiaire.',{karma_modifier:-5,relationship_boss_modifier:-5,stress_level_increment:6,hidden_crime_stat_modifier:1})]),
E('dev_startup_272','career_event','🚀',{current_job:['dev','ing','mkt'],min_age:22,max_age:50},.1,'Un ami fonde une start-up et te propose des parts en échange d’un an de salaire amputé de moitié.',[
 C('Plonger dans l’aventure.',{salary_multiplier:.6,happiness_modifier:6,stress_level_increment:10,next_forced_event_id:'evt_startup_bilan_273',next_forced_delay:2}),
 C('Rester dans ton CDI.',{stress_level_increment:-2,happiness_modifier:-1})]),
E('startup_bilan_273','money','📈',{current_job:['dev','ing','mkt']},.01,'Deux ans plus tard, la start-up est rachetée par un géant américain pour une somme que tu n’oses pas répéter.',[
 C('Encaisser les parts.',{bank_balance_modifier:[30000,160000],fame_modifier:2,happiness_modifier:8,salary_multiplier:1.1,result_text:'Tu t’achètes un ordinateur plus puissant que ton ancienne voiture.'}),
 C('Réinvestir dans la prochaine.',{bank_balance_modifier:[5000,60000],stress_level_increment:6,happiness_modifier:3})]),
E('dev_cyber_274','crime','💻',{current_job:['dev','ing'],min_age:18,min_hidden:{crime:5}},.08,'Tu découvres une faille dans le site d’une grande enseigne : tu pourrais t’offrir un bon cadeau de 500 € sans que personne ne le sache.',[
 C('La signaler à l’entreprise.',{karma_modifier:5,bank_balance_modifier:[100,500],fame_modifier:1}),
 C('Exploiter la faille.',{bank_balance_modifier:500,hidden_crime_stat_modifier:10,karma_modifier:-7,stress_level_increment:6,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_police_menace_252'})]),
/* --- Enseignement --- */
E('prof_classe_280','career_event','🍎',{current_job:'prof',min_age:22},.3,'Ta classe de 5e est déchaînée : une chaise a volé, un élève chante du rap, et l’inspecteur frappe à la porte.',[
 C('Rétablir le calme avec fermeté.',{job_performance_modifier:5,stress_level_increment:6,relationship_boss_modifier:4}),
 C('Faire un cours sur le thème du chahut.',{job_performance_modifier:4,happiness_modifier:3,smarts_modifier:1}),
 C('Quitter la salle en soupirant.',{job_performance_modifier:-6,stress_level_increment:-1,relationship_boss_modifier:-6})]),
E('prof_parents_281','career_event','👨‍👩‍👧',{current_job:'prof',min_age:22},.2,'Une réunion parents-professeurs vire au tribunal : un père conteste la note de 11/20 donnée à son fils prodige.',[
 C('Défendre posément la note.',{job_performance_modifier:3,stress_level_increment:5,karma_modifier:2}),
 C('Remonter la note pour avoir la paix.',{karma_modifier:-3,stress_level_increment:-3,job_performance_modifier:-2}),
 C('Inviter le père à corriger lui-même la copie.',{happiness_modifier:3,relationship_boss_modifier:-3,fame_modifier:1})]),
E('prof_voyage_282','career_event','🚌',{current_job:'prof',min_age:23},.12,'Le chef d’établissement te propose d’encadrer le voyage scolaire à Rome : 40 élèves, 3 jours, aucun sommeil.',[
 C('Accepter, tu es courageux.',{happiness_modifier:5,stress_level_increment:12,job_performance_modifier:6,relationship_boss_modifier:7,health_modifier:-1}),
 C('Refuser, tu as déjà donné.',{relationship_boss_modifier:-4,stress_level_increment:-3})]),
/* --- Relation avec le patron --- */
E('boss_erreur_300','career_event','📎',{has_job:true,min_age:18},.3,'{boss} te reproche publiquement une erreur de tableur dans laquelle tu n’es pour rien.',[
 C('Rétablir les faits calmement.',{relationship_boss_modifier:[-3,8],job_performance_modifier:2,stress_level_increment:4}),
 C('Endosser la faute.',{relationship_boss_modifier:5,stress_level_increment:6,karma_modifier:1}),
 C('Répondre du tac au tac.',{relationship_boss_modifier:-10,happiness_modifier:3,stress_level_increment:5,next_forced_event_id:'evt_boss_conflit_301'})]),
E('boss_conflit_301','career_event','⚡',{has_job:true},.01,'{boss} te convoque dans son bureau, porte fermée : « Il faut qu’on parle de ton attitude. »',[
 C('Présenter des excuses sincères.',{relationship_boss_modifier:9,stress_level_increment:3,karma_modifier:1}),
 C('Tenir bon sur le fond.',{relationship_boss_modifier:-3,job_performance_modifier:-2,stress_level_increment:6,probability_of_retaliation_trigger:.4,retaliation_event_id:'evt_boss_placard_302'}),
 C('Poser ta démission sur-le-champ.',{current_job:null,stress_level_increment:-20,happiness_modifier:2})]),
E('boss_placard_302','career_event','🗄️',{has_job:true},.01,'Du jour au lendemain, ton bureau est déplacé dans un ancien local à archives, à côté de la chaudière.',[
 C('Prendre ça avec humour.',{happiness_modifier:-1,stress_level_increment:2,job_performance_modifier:2}),
 C('Contacter les syndicats.',{relationship_boss_modifier:-5,job_performance_modifier:4,stress_level_increment:5,karma_modifier:1}),
 C('Chercher ailleurs.',{current_job:null,stress_level_increment:-10,happiness_modifier:-2})]),
E('boss_anniversaire_303','career_event','🎂',{has_job:true},.2,'C’est l’anniversaire de {boss}. Les collègues se cotisent pour une carte et un gros gâteau.',[
 C('Participer généreusement.',{bank_balance_modifier:-25,relationship_boss_modifier:[2,6]}),
 C('Écrire un mot drôle sur la carte.',{relationship_boss_modifier:[-2,8],happiness_modifier:1}),
 C('Dire que tu as oublié ton portefeuille.',{relationship_boss_modifier:-3,karma_modifier:-1})]),
E('boss_mentor_304','career_event','🧭',{has_job:true,min_age:20,max_age:55},.12,'{boss} te prend sous son aile : « Je vois du potentiel en toi. Viens, je te présente quelques personnes. »',[
 C('Saisir la perche.',{relationship_boss_modifier:10,job_performance_modifier:6,smarts_modifier:1}),
 C('Rester humble et discret.',{relationship_boss_modifier:4,karma_modifier:1})]),
E('collegue_idee_305','career_event','💡',{has_job:true,min_age:20},.2,'Un collègue présente en réunion une idée qui est clairement la tienne. {boss} hoche la tête avec enthousiasme.',[
 C('Le dire franchement à voix haute.',{relationship_boss_modifier:[-4,6],job_performance_modifier:3,stress_level_increment:5,karma_modifier:1}),
 C('Régler ça en privé avec le collègue.',{stress_level_increment:2,karma_modifier:1,add_enemy:true}),
 C('Faire des mails vengeurs en copie.',{hidden_crime_stat_modifier:2,karma_modifier:-3,relationship_boss_modifier:-5,happiness_modifier:2})]),
/* --- Stress et burn-out --- */
E('stress_dimanche_310','health','😰',{has_job:true,min_hidden:{stress:40}},.25,'Chaque dimanche à 18 h, une boule se noue dans ton ventre : demain, c’est lundi, et la liste des tâches ne tient plus sur une page.',[
 C('Pratiquer la méditation en ligne.',{stress_level_increment:-12,discipline_modifier:2,bank_balance_modifier:-30}),
 C('Faire un footing pour te défouler.',{stress_level_increment:-10,health_modifier:2}),
 C('Noyer ça dans une série.',{stress_level_increment:-3,happiness_modifier:2,willpower_modifier:-1})]),
E('stress_insomnie_311','health','🌙',{min_age:18,min_hidden:{stress:55}},.25,'Trois heures du matin. Tu fixes le plafond en refaisant mentalement ta dernière dispute.',[
 C('Consulter un médecin du sommeil.',{bank_balance_modifier:-60,stress_level_increment:-12,health_modifier:2}),
 C('Boire une tisane et lire.',{stress_level_increment:-6,smarts_modifier:1}),
 C('Scroller sur ton téléphone jusqu’à l’aube.',{stress_level_increment:6,health_modifier:-2,happiness_modifier:-2})]),
E('stress_vacances_312','health','🏝️',{has_job:true,min_age:20,min_bank_balance:3000},.2,'Tu as 18 jours de congés non pris. Les RH menacent de te les voler.',[
 C('Partir une semaine au soleil.',{bank_balance_modifier:-1500,stress_level_increment:-22,happiness_modifier:7}),
 C('Faire du bricolage chez toi.',{bank_balance_modifier:-200,stress_level_increment:-8,discipline_modifier:1}),
 C('Les perdre, tu es indispensable.',{stress_level_increment:6,job_performance_modifier:2,happiness_modifier:-3})]),
E('stress_crise_313','health','💥',{min_hidden:{stress:75}},.3,'Un simple mail de relance te fait claquer la porte d’un bureau, puis fondre en larmes dans l’escalier.',[
 C('Prendre rendez-vous avec un psychologue.',{bank_balance_modifier:-80,stress_level_increment:-20,happiness_modifier:3,add_illness:'anxiete'}),
 C('Appeler un ami, ça va mieux en le disant.',{stress_level_increment:-12,happiness_modifier:2}),
 C('Tout garder pour toi.',{stress_level_increment:8,health_modifier:-3,add_illness:'anxiete'})]),
/* --- Argent et impôts --- */
E('impots_declaration_320','money','📬',{min_age:18,has_job:true},.2,'La déclaration d’impôts en ligne ouvre, et tu hésites sur quelques frais déductibles.',[
 C('Déclarer au centime près.',{stress_level_increment:3,karma_modifier:2,result_text:'Tu récupères de petites réductions.'}),
 C('Tricher un peu sur les frais.',{bank_balance_modifier:600,hidden_crime_stat_modifier:3,karma_modifier:-2,probability_of_retaliation_trigger:.2,retaliation_event_id:'evt_impots_controle_321'}),
 C('Tout laisser pré-rempli.',{bank_balance_modifier:-120,stress_level_increment:-3})]),
E('impots_controle_321','money','🕵️‍♂️',{min_age:20,min_bank_balance:1000},.01,'Le fisc t’envoie une « demande d’éclaircissements » de douze pages. L’en-tête est menaçant.',[
 C('Répondre point par point.',{bank_balance_modifier:-600,stress_level_increment:6}),
 C('Régulariser en payant la pénalité.',{money_percent:-3,add_record:0,stress_level_increment:4}),
 C('Ne pas répondre.',{money_percent:-9,hidden_crime_stat_modifier:3,stress_level_increment:10,add_record:1})]),
E('loto_322','money','🎰',{min_age:18,min_bank_balance:50},.12,'Au tabac, la buraliste te dit que la cagnotte du Loto est à 30 millions. Tu as une pièce de 5 € dans la poche.',[
 C('Tenter ta chance.',{bank_balance_modifier:-5,happiness_modifier:1}),
 C('Jouer gros.',{bank_balance_modifier:[-100,1500],stress_level_increment:2,discipline_modifier:-1,result_text:'Les boules tournent… et la fortune fait ce qu’elle veut.'}),
 C('Résister, tu connais les probabilités.',{smarts_modifier:1,discipline_modifier:1})]),
E('heritage_323','money','⚰️',{min_age:30,max_age:75},.08,'Une grand-tante éloignée que tu connaissais à peine t’a couché sur son testament. Le notaire t’invite à Limoges.',[
 C('Aller toucher ton héritage.',{bank_balance_modifier:[3000,45000],happiness_modifier:3,karma_modifier:1,result_text:'Une petite fortune et un vieux service à thé.'}),
 C('Partager avec la famille.',{bank_balance_modifier:[1000,15000],karma_modifier:5,relationship_parents_modifier:4})]),
E('arnaque_324','crime','📞',{min_age:18,min_bank_balance:1000},.15,'Un faux conseiller de ta banque t’appelle : « Un virement suspect est en cours, communiquez-moi votre code. »',[
 C('Raccrocher et appeler ta banque.',{smarts_modifier:1,karma_modifier:1}),
 C('Donner le code par réflexe.',{bank_balance_modifier:[-6000,-1000],stress_level_increment:12,smarts_modifier:-1}),
 C('Jouer l’idiot pour le faire parler.',{happiness_modifier:3,fame_modifier:1})]),
E('immo_325','money','🏠',{min_age:25,min_bank_balance:30000},.12,'Un agent immobilier t’appelle : un appartement dans le Marais est à vendre, 15 % sous le marché, mais il faut décider avant ce soir.',[
 C('Acheter.',{bank_balance_modifier:-26000,add_asset:{kind:'house',name:'Appartement dans le Marais',value:46000},stress_level_increment:8,happiness_modifier:4}),
 C('Refuser, tu veux visiter avant.',{stress_level_increment:-2}),
 C('Faire une contre-offre cynique.',{bank_balance_modifier:[-5000,5000],happiness_modifier:1})]),
E('crypto_326','money','🪙',{min_age:20,min_bank_balance:2000},.12,'Un ami ne parle plus que de « cryptos révolutionnaires » et de lamborghinis imaginaires. Il te montre un graphique en dents de scie.',[
 C('Investir 2 000 €.',{bank_balance_modifier:[-2000,5000],stress_level_increment:6,discipline_modifier:-1}),
 C('Lui prêter tes oreilles, pas ton argent.',{discipline_modifier:1,happiness_modifier:1}),
 C('Le dénoncer pour pyramide.',{karma_modifier:2,add_enemy:true})]),
E('petit_prix_327','crime','🧾',{min_age:16,max_age:70},.15,'Au supermarché, la caisse automatique oublie de scanner un article de 40 € dans ton panier.',[
 C('Prévenir la caissière.',{karma_modifier:3,bank_balance_modifier:-40}),
 C('Partir sans rien dire.',{hidden_crime_stat_modifier:3,karma_modifier:-2,bank_balance_modifier:0,stress_level_increment:2}),
 C('Acheter pour 40 € de plus, solidaire des caisses.',{bank_balance_modifier:-40,happiness_modifier:1})]),
E('fraude_chomage_328','crime','🪪',{min_age:20,max_age:60,max_bank_balance:20000},.1,'Un cousin te propose de continuer à toucher le chômage en bossant au noir sur des chantiers.',[
 C('Accepter, tout le monde le fait.',{bank_balance_modifier:[1500,5000],hidden_crime_stat_modifier:7,karma_modifier:-4,stress_level_increment:6,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_impots_controle_321'}),
 C('Refuser net.',{karma_modifier:3})]),
/* --- Couple et famille --- */
E('couple_soiree_340','relationship','🍷',{has_partner:true,min_age:18},.3,'Ça fait un moment que {partner} et toi n’avez pas eu de vraie soirée à deux.',[
 C('Réserver un restaurant romantique.',{bank_balance_modifier:-120,relationship_partner_modifier:[8,14],happiness_modifier:4}),
 C('Cuisiner à la maison.',{bank_balance_modifier:-25,relationship_partner_modifier:[4,9],happiness_modifier:3}),
 C('Rester devant la télé chacun avec son téléphone.',{relationship_partner_modifier:-5,stress_level_increment:-2})]),
E('couple_dispute_341','relationship','💢',{has_partner:true,min_age:18},.3,'Une dispute éclate pour une broutille : à qui le tour de sortir la poubelle. Elle dérape sur le reste.',[
 C('S’excuser le premier.',{relationship_partner_modifier:[4,10],karma_modifier:1}),
 C('Camper sur tes positions.',{relationship_partner_modifier:-12,stress_level_increment:8,next_forced_event_id:'evt_couple_crise_342'}),
 C('Aller dormir chez un ami.',{relationship_partner_modifier:-6,stress_level_increment:3})]),
E('couple_crise_342','relationship','🧊',{has_partner:true},.01,'Le silence s’est installé dans le salon. {partner} te demande : « Est-ce qu’on est encore ensemble ? »',[
 C('Proposer une thérapie de couple.',{bank_balance_modifier:-200,relationship_partner_modifier:[8,18],stress_level_increment:-4}),
 C('Dire que tu y réfléchis.',{relationship_partner_modifier:-12,stress_level_increment:6,probability_of_retaliation_trigger:.45,retaliation_event_id:'evt_couple_rupture_343'}),
 C('Rompre.',{break_up:true,stress_level_increment:6,happiness_modifier:-6})]),
E('couple_rupture_343','relationship','💔',{has_partner:true},.01,'Un matin, {partner} te laisse une lettre sur la table de la cuisine et quitte l’appartement avec deux valises.',{break_up:true,happiness_modifier:-12,stress_level_increment:12,result_text:'Tu restes seul, avec la lettre et la cafetière.'}),
E('couple_voyage_344','relationship','🧳',{has_partner:true,min_age:20,min_bank_balance:2500},.2,'{partner} propose un week-end surprise à Venise, avec gondole et rouge à lèvres.',[
 C('Dire oui tout de suite.',{bank_balance_modifier:-1400,relationship_partner_modifier:[8,16],happiness_modifier:8,stress_level_increment:-10}),
 C('Choisir un week-end à la campagne.',{bank_balance_modifier:-350,relationship_partner_modifier:[4,9],happiness_modifier:4}),
 C('Dire que tu n’as pas le temps.',{relationship_partner_modifier:-8})]),
E('couple_jalousie_345','relationship','👀',{has_partner:true,min_age:18},.12,'Tu surprends {partner} en train de rire un peu trop fort avec un collègue sur son téléphone.',[
 C('Poser la question franchement.',{relationship_partner_modifier:[-4,6],stress_level_increment:3}),
 C('Fouiller son téléphone.',{relationship_partner_modifier:-8,hidden_crime_stat_modifier:1,karma_modifier:-2,stress_level_increment:5}),
 C('Faire confiance, tout simplement.',{relationship_partner_modifier:4,karma_modifier:1})]),
E('mariage_346','relationship','💍',{has_partner:true,partner_status:'conjoint',min_age:25},.1,'Ton mariage fête un anniversaire important : la famille te propose de renouveler les vœux en grand.',[
 C('Organiser une grande fête.',{bank_balance_modifier:-3500,relationship_partner_modifier:[8,14],happiness_modifier:6,relationship_parents_modifier:4}),
 C('Se contenter d’un repas à deux.',{bank_balance_modifier:-180,relationship_partner_modifier:[4,8],happiness_modifier:3})]),
E('parents_dimanche_350','family','🥘',{min_age:20,max_age:65},.25,'Tes parents t’invitent pour le traditionnel déjeuner du dimanche. Pot-au-feu, remarques sur ta vie, et fromage.',[
 C('Y aller de bon cœur.',{relationship_parents_modifier:[4,9],happiness_modifier:2,bank_balance_modifier:-15}),
 C('Y aller en regardant l’heure.',{relationship_parents_modifier:2,stress_level_increment:2}),
 C('Inventer une excuse.',{relationship_parents_modifier:-6,happiness_modifier:-1})]),
E('parents_retraite_351','family','🧓',{min_age:30,max_age:70},.12,'Tes parents ont du mal à boucler leurs fins de mois et n’osent pas te le dire. Ta mère laisse échapper l’information en parlant du chauffage.',[
 C('Leur donner un coup de pouce régulier.',{bank_balance_modifier:-1200,relationship_parents_modifier:[8,14],karma_modifier:5}),
 C('Les aider ponctuellement.',{bank_balance_modifier:-300,relationship_parents_modifier:[3,7],karma_modifier:2}),
 C('Compatir en espérant que ça passe.',{relationship_parents_modifier:-6,karma_modifier:-3})]),
E('enfant_ecole_352','family','🎒',{has_kids:true,min_age:22},.25,'La maîtresse de ton enfant te convoque : « Il parle beaucoup en classe, mais il est adorable. »',[
 C('Discuter avec l’enfant calmement.',{happiness_modifier:2,karma_modifier:1,stress_level_increment:2}),
 C('Le punir : pas de dessin animé ce week-end.',{stress_level_increment:3,happiness_modifier:-1}),
 C('En rire avec la maîtresse.',{happiness_modifier:2})]),
E('enfant_fievre_353','health','🌡️',{has_kids:true,min_age:22},.25,'Ton enfant se réveille à 39° de fièvre un lundi matin, la veille d’un rendez-vous important.',[
 C('Prendre un jour de congé.',{stress_level_increment:6,job_performance_modifier:-2,happiness_modifier:2,karma_modifier:2}),
 C('Appeler les grands-parents à la rescousse.',{relationship_parents_modifier:4,stress_level_increment:3}),
 C('Aller travailler quand même.',{stress_level_increment:9,karma_modifier:-3,job_performance_modifier:2})]),
E('ami_dette_354','family','🤝',{min_age:18,min_bank_balance:3000},.15,'Un ami d’enfance te demande 2 000 € « jusqu’à fin du mois » avec ses yeux de chiot.',[
 C('Les lui prêter.',{bank_balance_modifier:-2000,karma_modifier:3,happiness_modifier:1,probability_of_retaliation_trigger:.5,retaliation_event_id:'evt_ami_rembourse_355'}),
 C('Lui donner 200 € et basta.',{bank_balance_modifier:-200,karma_modifier:1}),
 C('Refuser, on ne mélange pas argent et amitié.',{happiness_modifier:-1,add_enemy:true})]),
E('ami_rembourse_355','family','🧾',{min_age:18},.01,'Ton ami n’a toujours pas remboursé, et il poste maintenant des photos de ses vacances à Ibiza.',[
 C('Lui rappeler gentiment.',{bank_balance_modifier:[0,1500],stress_level_increment:3}),
 C('Passer l’éponge.',{karma_modifier:2,happiness_modifier:-1}),
 C('Lui poser un ultimatum.',{bank_balance_modifier:[0,2000],karma_modifier:-1,add_enemy:true})]),
/* --- Santé --- */
E('sante_bilan_360','health','🩺',{min_age:35,max_age:80},.3,'Ton médecin traitant te conseille un bilan de santé complet. « À votre âge, on ne rigole plus avec ça. »',[
 C('Faire tous les examens.',{bank_balance_modifier:-250,health_modifier:3,stress_level_increment:3,smarts_modifier:1}),
 C('Promettre d’y aller « bientôt ».',{discipline_modifier:-1}),
 C('Rire et changer de sujet.',{stress_level_increment:-1,health_modifier:-1})]),
E('sante_sport_361','health','🏃',{min_age:18,max_age:60,max_stats:{health:70}},.25,'Une amie te propose de participer à un semi-marathon dans trois mois.',[
 C('Relever le défi.',{health_modifier:5,discipline_modifier:3,stress_level_increment:-6,happiness_modifier:4,bank_balance_modifier:-35}),
 C('Marcher un peu plus, c’est suffisant.',{health_modifier:2,stress_level_increment:-3}),
 C('Rester sur le canapé.',{health_modifier:-2,discipline_modifier:-1})]),
E('sante_dos_362','health','🪑',{has_job:true,min_age:30,max_age:65},.15,'Un matin, ton dos se bloque en plein milieu de ton open space. Les collègues te regardent plier comme un vieux parapluie.',[
 C('Voir un kiné.',{bank_balance_modifier:-120,health_modifier:2,stress_level_increment:-3}),
 C('Serrer les dents et bosser debout.',{health_modifier:-3,job_performance_modifier:2}),
 C('Poser un arrêt maladie.',{job_performance_modifier:-2,stress_level_increment:-6,add_illness:'hernie'})]),
E('sante_alcool_363','health','🍺',{min_age:18,max_age:70,min_hidden:{stress:30}},.15,'Après une journée difficile, tu te retrouves à ouvrir une deuxième bouteille de vin pour te détendre.',[
 C('La remettre au frigo.',{discipline_modifier:2,willpower_modifier:1}),
 C('La finir, au diable les conséquences.',{happiness_modifier:2,health_modifier:-2,willpower_modifier:-1,stress_level_increment:-4}),
 C('Appeler un ami pour parler.',{stress_level_increment:-6,happiness_modifier:2})]),
E('sante_vaccin_364','health','💉',{min_age:15},.15,'Un mail du cabinet médical te rappelle que ton vaccin antigrippal est disponible. La salle d’attente embaume la lavande.',[
 C('Y aller, quelques minutes suffisent.',{health_modifier:2,bank_balance_modifier:-15}),
 C('Dire que tu as mieux à faire.',{health_modifier:-1,probability_of_retaliation_trigger:.2,retaliation_event_id:'evt_sante_grippe_365'})]),
E('sante_grippe_365','health','🤧',{min_age:5},.01,'Un virus te cloue au lit pendant dix jours, entre mouchoirs, soupe et séries.',{health_modifier:-4,happiness_modifier:-3,stress_level_increment:-4,add_illness:'grippe',job_performance_modifier:-3}),
/* --- École et université --- */
E('ecole_triche_380','education','📝',{in_school:true,min_age:11},.3,'Le contrôle de maths est difficile. Ton voisin, brillant et nerveux, laisse sa copie bien visible.',[
 C('Regarder, un tout petit peu.',{smarts_modifier:-1,hidden_crime_stat_modifier:3,karma_modifier:-3,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_ecole_convocation_381'}),
 C('Écrire ce que tu sais, honnêtement.',{smarts_modifier:1,karma_modifier:2,discipline_modifier:1}),
 C('Rendre copie blanche.',{happiness_modifier:-2,smarts_modifier:-1})]),
E('ecole_convocation_381','education','🪪',{in_school:true},.01,'Le surveillant général te convoque : on a soupçonné une triche lors du dernier contrôle.',[
 C('Nier en bloc.',{karma_modifier:-3,hidden_crime_stat_modifier:2,stress_level_increment:6}),
 C('Avouer et accepter la sanction.',{karma_modifier:3,smarts_modifier:-1,stress_level_increment:3,relationship_parents_modifier:-4})]),
E('ecole_amoureux_382','education','💌',{in_school:true,min_age:13,max_age:20},.25,'Un mot doux, plié en quatre, atterrit sur ton bureau pendant le cours de français.',[
 C('Répondre avec un dessin.',{happiness_modifier:5,looks_modifier:1,stress_level_increment:3}),
 C('Le montrer à tes amis.',{karma_modifier:-3,fame_modifier:1,add_enemy:true}),
 C('Faire comme si de rien n’était.',{happiness_modifier:-1})]),
E('ecole_sortie_383','education','🚌',{in_school:true,min_age:6,max_age:17},.2,'Sortie scolaire au musée : la guide te pose une question et toute la classe attend ta réponse.',[
 C('Répondre avec assurance.',{smarts_modifier:2,fame_modifier:1,happiness_modifier:2}),
 C('Faire une blague.',{happiness_modifier:3,smarts_modifier:-1}),
 C('Te cacher derrière un camarade.',{stress_level_increment:3})]),
E('fac_examen_384','education','🎓',{in_school:true,min_age:18,max_age:30},.3,'Partiels dans trois jours, et tu n’as pas ouvert un seul cours : la bibliothèque universitaire semble un monde lointain.',[
 C('Réviser jour et nuit.',{smarts_modifier:3,stress_level_increment:12,health_modifier:-1,discipline_modifier:2}),
 C('Organiser un groupe d’entraide.',{smarts_modifier:2,stress_level_increment:5,happiness_modifier:2,add_friend:true}),
 C('Compter sur la chance.',{smarts_modifier:-1,happiness_modifier:1,discipline_modifier:-1})]),
E('fac_soiree_385','education','🎉',{in_school:true,min_age:18,max_age:28},.25,'La soirée d’intégration promet d’être inoubliable : bières tièdes, enceinte qui grésille, et ambiance de tous les dangers.',[
 C('Y aller et danser jusqu’à l’aube.',{happiness_modifier:6,health_modifier:-1,add_friend:true,bank_balance_modifier:-25}),
 C('Y passer une heure, par politesse.',{happiness_modifier:2,add_friend:true}),
 C('Rester réviser.',{smarts_modifier:2,happiness_modifier:-2})]),
E('fac_stage_386','education','🏢',{in_school:true,min_age:19,max_age:30},.15,'On te propose un stage non rémunéré dans une grande entreprise : « C’est une chance incroyable pour votre CV. »',[
 C('Accepter malgré tout.',{smarts_modifier:2,job_performance_modifier:0,bank_balance_modifier:-300,discipline_modifier:1,stress_level_increment:5}),
 C('Négocier une petite gratification.',{bank_balance_modifier:[100,500],smarts_modifier:1}),
 C('Décliner, tu préfères travailler en boutique.',{bank_balance_modifier:[500,1500]})]),
E('lycee_orientation_387','education','🧭',{in_school:true,min_age:14,max_age:18},.2,'La conseillère d’orientation te présente tes options en agitant des brochures. Elle a l’air de vouloir t’orienter vers un BTS.',[
 C('Suivre ses conseils.',{smarts_modifier:1,discipline_modifier:1}),
 C('Choisir ta propre voie.',{willpower_modifier:2,happiness_modifier:2,stress_level_increment:3}),
 C('Demander l’avis de tes parents.',{relationship_parents_modifier:4})]),
/* --- Retraite --- */
E('retraite_ennui_400','retirement','🛋️',{min_age:62,has_job:false},.25,'La retraite, c’est bien trois semaines. Ensuite, tu connais par cœur la programmation télé de la matinée.',[
 C('Rejoindre un club de pétanque.',{happiness_modifier:5,add_friend:true,health_modifier:1,bank_balance_modifier:-30}),
 C('Te lancer dans le jardinage.',{happiness_modifier:4,health_modifier:2,bank_balance_modifier:-120}),
 C('Rester devant la télé.',{happiness_modifier:-2,health_modifier:-2})]),
E('retraite_petits_enfants_401','retirement','👶',{min_age:60,has_kids:true},.2,'Tes enfants te demandent de garder les petits-enfants tous les mercredis. Tu as des projets, mais leurs sourires désarment.',[
 C('Dire oui avec joie.',{happiness_modifier:7,stress_level_increment:3,health_modifier:-1}),
 C('Accepter un mercredi sur deux.',{happiness_modifier:4}),
 C('Refuser, tu veux voyager.',{happiness_modifier:2,karma_modifier:-1})]),
E('retraite_voyage_402','retirement','🌍',{min_age:62,min_bank_balance:8000},.2,'Tu as toujours rêvé de voyager. Cette fois, plus d’excuse : l’agence de voyages a une offre sur la Toscane.',[
 C('Partir un mois en camping-car.',{bank_balance_modifier:-4500,happiness_modifier:9,health_modifier:1,stress_level_increment:-8}),
 C('Faire une croisière en Méditerranée.',{bank_balance_modifier:-3200,happiness_modifier:7}),
 C('Rester au pays pour garder le budget.',{happiness_modifier:-1})]),
E('retraite_pension_403','retirement','📄',{min_age:62,has_job:false},.15,'Un courrier de la caisse de retraite te réclame des justificatifs pour réévaluer ta pension. Il manque toujours un document.',[
 C('Passer la matinée à l’agence.',{stress_level_increment:5,bank_balance_modifier:[100,800]}),
 C('Tout envoyer par mail.',{stress_level_increment:2,bank_balance_modifier:[0,400]}),
 C('Laisser traîner.',{bank_balance_modifier:-200,stress_level_increment:4})]),
E('retraite_transmission_404','retirement','🪑',{min_age:60,has_job:false,min_bank_balance:30000},.1,'Le notaire propose d’anticiper ta succession par une donation à tes proches.',[
 C('Faire une donation à tes proches.',{bank_balance_modifier:-15000,relationship_parents_modifier:3,karma_modifier:5,happiness_modifier:4}),
 C('Tout garder jusqu’au bout.',{happiness_modifier:-1}),
 C('Léguer à une association.',{bank_balance_modifier:-10000,karma_modifier:8,fame_modifier:1})]),
/* --- Notoriété --- */
E('fame_video_420','fame','📱',{min_age:12,max_fame:40},.2,'Une vidéo de toi, maladroite, circule sur les réseaux : tu glisses sur une peau de banane avec grâce.',[
 C('Assumer et en rire.',{fame_modifier:4,happiness_modifier:3,looks_modifier:0}),
 C('Demander le retrait.',{stress_level_increment:5,fame_modifier:1}),
 C('Surfer sur la vague et en faire d’autres.',{fame_modifier:6,bank_balance_modifier:[50,800],happiness_modifier:2,stress_level_increment:4,next_forced_event_id:'evt_fame_marque_421'})]),
E('fame_marque_421','fame','🤳',{min_age:12},.01,'Une marque de baskets te contacte : « Votre univers nous intéresse. Parlons partenariat. »',[
 C('Signer le contrat.',{bank_balance_modifier:[2000,12000],fame_modifier:3,happiness_modifier:4,karma_modifier:-1}),
 C('Refuser par principe.',{karma_modifier:3,fame_modifier:1}),
 C('Négocier ton cachet.',{bank_balance_modifier:[3000,18000],stress_level_increment:5,fame_modifier:2})]),
E('fame_inconnu_422','fame','🕶️',{min_fame:25},.2,'On te reconnaît au supermarché. Une personne te demande un selfie, une autre te reproche quelque chose que tu n’as pas dit.',[
 C('Poser avec le sourire.',{fame_modifier:2,happiness_modifier:3}),
 C('Éviter le regard.',{stress_level_increment:3}),
 C('Répondre aux critiques avec humour.',{fame_modifier:3,karma_modifier:1,stress_level_increment:2})]),
E('fame_interview_423','fame','🎙️',{min_fame:30},.15,'Une radio nationale t’invite à une matinale : questions pièges, jingles et trac assurés.',[
 C('Y aller avec ton plus beau sourire.',{fame_modifier:4,bank_balance_modifier:[0,500],stress_level_increment:6}),
 C('Refuser poliment.',{stress_level_increment:-2}),
 C('Y aller et dire ce que tu penses vraiment.',{fame_modifier:6,karma_modifier:-1,stress_level_increment:9,happiness_modifier:2})]),
E('fame_scandale_424','fame','📰',{min_fame:35},.1,'Un tabloïd prétend détenir des photos compromettantes de toi, floues mais accusatrices.',[
 C('Démentir fermement.',{fame_modifier:-2,stress_level_increment:8,karma_modifier:1}),
 C('Assumer avec une touche d’autodérision.',{fame_modifier:3,happiness_modifier:-1,stress_level_increment:5}),
 C('Verser un petit arrangement pour étouffer l’affaire.',{bank_balance_modifier:-8000,hidden_crime_stat_modifier:3,karma_modifier:-3,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_fame_chantage_425'})]),
E('fame_chantage_425','fame','🕳️',{min_fame:20},.01,'Un journaliste revient avec de nouvelles révélations et réclame une somme « pour les frais de dossier ».',[
 C('Payer encore une fois.',{bank_balance_modifier:-12000,stress_level_increment:12,karma_modifier:-2}),
 C('Contacter un avocat.',{bank_balance_modifier:-2500,stress_level_increment:6,fame_modifier:-1,karma_modifier:2}),
 C('Tout révéler publiquement.',{fame_modifier:5,stress_level_increment:12,karma_modifier:3,happiness_modifier:-2})]),
/* --- Petites tentations criminelles --- */
E('tentation_velo_440','crime','🚲',{min_age:12,max_age:60},.15,'Un vélo électrique flambant neuf est attaché avec un simple cadenas devant la gare. Tu as ta pince dans le sac, par hasard.',[
 C('Passer ton chemin.',{karma_modifier:2,willpower_modifier:1}),
 C('Le voler.',{bank_balance_modifier:[300,900],hidden_crime_stat_modifier:8,karma_modifier:-6,stress_level_increment:8,probability_of_retaliation_trigger:.3,retaliation_event_id:'evt_tentation_police_441'}),
 C('Signaler le cadenas faible au propriétaire.',{karma_modifier:3,fame_modifier:1})]),
E('tentation_police_441','crime','🚔',{min_age:12,min_hidden:{crime:5}},.01,'Deux policiers frappent chez toi : « On a repéré une personne qui vous ressemble près de la gare. »',[
 C('Avouer.',{add_record:1,karma_modifier:3,bank_balance_modifier:-400,stress_level_increment:8}),
 C('Nier avec aplomb.',{hidden_crime_stat_modifier:2,stress_level_increment:12,karma_modifier:-2,probability_of_retaliation_trigger:.4,retaliation_event_id:'evt_tentation_condamnation_442'})]),
E('tentation_condamnation_442','crime','⚖️',{min_age:12},.01,'La caméra de la gare n’est pas la meilleure, mais elle t’a identifié sans doute possible : audience devant le tribunal.',{add_record:1,bank_balance_modifier:-1500,prison_years:[0,1],stress_level_increment:12,karma_modifier:-2,result_text:'Condamnation avec sursis et amende. Tu retiens la leçon.'}),
E('tentation_resto_443','crime','🍷',{min_age:16,max_age:60},.12,'Tu te rends compte à la sortie du restaurant que l’addition n’a pas inclus le dessert : le serveur n’a rien vu.',[
 C('Revenir payer.',{karma_modifier:3,bank_balance_modifier:-9}),
 C('Filer à l’anglaise.',{hidden_crime_stat_modifier:2,karma_modifier:-2,happiness_modifier:1,stress_level_increment:2})]),
E('tentation_triche_444','crime','🧮',{has_job:true,min_age:18},.12,'Tu pourrais gonfler tes notes de frais de 300 € sans que personne ne vérifie vraiment.',[
 C('Les déclarer honnêtement.',{karma_modifier:2,job_performance_modifier:2}),
 C('Gonfler un peu.',{bank_balance_modifier:300,hidden_crime_stat_modifier:4,karma_modifier:-3,probability_of_retaliation_trigger:.2,retaliation_event_id:'evt_retaliation_plainte_270'})]),
E('tentation_fraude_445','crime','🎟️',{min_age:14,max_age:50},.1,'Dans le métro, un contrôleur contrôle les titres de transport. Tu n’as pas validé ton ticket.',[
 C('Dire la vérité et payer.',{bank_balance_modifier:-35,karma_modifier:2}),
 C('Faire semblant de chercher ton pass.',{stress_level_increment:6,hidden_crime_stat_modifier:1}),
 C('Descendre à la prochaine et courir.',{stress_level_increment:5,health_modifier:1,hidden_crime_stat_modifier:2})]),
E('tentation_bar_446','crime','🍻',{min_age:18,max_age:55,min_hidden:{crime:15}},.1,'Dans un bar, un inconnu te propose un « coup facile » avec 3 000 € à la clé : transporter un colis sans poser de question.',[
 C('Refuser clairement.',{karma_modifier:3,stress_level_increment:-2}),
 C('Accepter, tu as besoin d’argent.',{bank_balance_modifier:3000,hidden_crime_stat_modifier:12,karma_modifier:-8,stress_level_increment:12,probability_of_retaliation_trigger:.35,retaliation_event_id:'evt_tentation_police_441'}),
 C('Prévenir la police.',{karma_modifier:5,fame_modifier:1,add_enemy:true})]),
/* --- Représailles génériques --- */
E('retaliation_plainte_270','career_event','📨',{has_job:true},.01,'Un recommandé t’annonce une plainte, une mise en cause, et une convocation à la direction.',[
 C('Te défendre avec un avocat.',{bank_balance_modifier:-1800,stress_level_increment:8,karma_modifier:1}),
 C('Présenter des excuses publiques.',{job_performance_modifier:-5,relationship_boss_modifier:-3,stress_level_increment:6}),
 C('Démissionner avant la sanction.',{current_job:null,stress_level_increment:-5,happiness_modifier:-4})]),
/* --- Divers de vie quotidienne --- */
E('voisin_bruit_460','family','🔊',{min_age:20},.2,'Le voisin du dessus répète de la batterie à 23 heures. Ton plafond tremble au rythme du Boléro.',[
 C('Monter lui parler gentiment.',{karma_modifier:2,stress_level_increment:-3}),
 C('Appeler le syndic.',{stress_level_increment:2,add_enemy:true}),
 C('Répondre au balai.',{stress_level_increment:4,happiness_modifier:1,karma_modifier:-1})]),
E('animal_461','family','🐕',{min_age:18,has_pet:false},.1,'Un chiot errant te suit depuis la boulangerie, la langue pendante, avec un air de reproche tendre.',[
 C('L’adopter.',{add_pet:'Chien',bank_balance_modifier:-120,happiness_modifier:7,stress_level_increment:-4}),
 C('Le confier à un refuge.',{karma_modifier:3,happiness_modifier:1}),
 C('Lui donner un morceau de jambon.',{happiness_modifier:2})]),
E('greve_462','career_event','✊',{has_job:true,min_age:20},.15,'Un préavis de grève est affiché dans le hall : mots d’ordre, tracts, et pain au chocolat en solidarité.',[
 C('Faire grève avec les collègues.',{bank_balance_modifier:-250,relationship_boss_modifier:-3,happiness_modifier:2,karma_modifier:1}),
 C('Travailler quand même.',{relationship_boss_modifier:4,karma_modifier:-1,stress_level_increment:4}),
 C('Prendre un jour de RTT.',{stress_level_increment:-6})]),
E('transport_463','family','🚆',{has_job:true,min_age:18},.2,'Un retard de train te fait arriver avec 50 minutes de retard au bureau, la tête pleine de promesses non tenues.',[
 C('Envoyer un mail d’excuses.',{relationship_boss_modifier:2,stress_level_increment:2}),
 C('Dire que tu étais en rendez-vous externe.',{relationship_boss_modifier:-2,hidden_crime_stat_modifier:1,karma_modifier:-1}),
 C('Rentrer chez toi, tout est perdu.',{job_performance_modifier:-4,stress_level_increment:-3})]),
E('formation_464','career_event','📚',{has_job:true,min_age:22,max_age:58},.15,'Les RH te proposent une formation payée de six mois sur ton temps libre, avec un diplôme à la clé.',[
 C('Accepter, il faut se former.',{smarts_modifier:3,discipline_modifier:2,stress_level_increment:6,job_performance_modifier:5,bank_balance_modifier:-100}),
 C('Refuser, la vie est courte.',{happiness_modifier:2})]),
E('pause_dej_465','career_event','🥪',{has_job:true},.15,'Un collègue propose un déjeuner gastronomique en terrasse pour fêter la fin de la semaine. Le patron n’a rien vu passer.',[
 C('Y aller, avec le dessert.',{bank_balance_modifier:-35,happiness_modifier:4,relationship_boss_modifier:-1,add_friend:true}),
 C('Manger au bureau comme d’habitude.',{job_performance_modifier:1}),
 C('Inviter {boss} aussi.',{bank_balance_modifier:-60,relationship_boss_modifier:5,happiness_modifier:2})])
]);

})();
