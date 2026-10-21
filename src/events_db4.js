/* Deux Vies — évènements 4 : jalons de la petite enfance (préfixe evt4_). */
(()=>{
EVENT_DB.push(...[
{id:'evt4_premiers_mots',category:'childhood',icon:'🗣️',once:true,conditions:{min_age:1,max_age:1},probability_weight:1.2,
 prompt_text:'Ça y est : tu prononces tes tout premiers mots. Toute la famille retient son souffle.',
 choices:[
  {choice_text:'« Maman ! »',consequences:{relationship_parents_modifier:6,happiness_modifier:4,result_text:'Ta mère pleure de joie, ton père fait semblant de ne pas être jaloux.'}},
  {choice_text:'« Papa ! »',consequences:{relationship_parents_modifier:6,happiness_modifier:4,result_text:'Ton père fait le tour de la maison en criant victoire.'}},
  {choice_text:'« Encore ! »',consequences:{smarts_modifier:2,happiness_modifier:3,result_text:'Premier mot : une demande. Tu as déjà compris comment ça marche.'}}]},
{id:'evt4_premiers_pas',category:'childhood',icon:'👣',once:true,conditions:{min_age:1,max_age:2},probability_weight:1.1,
 prompt_text:'Tu te mets debout, tu lâches le canapé… et tu fais ton premier pas !',
 choices:[
  {choice_text:'Foncer vers les bras de tes parents.',consequences:{relationship_parents_modifier:5,happiness_modifier:5,health_modifier:1,result_text:'Trois pas, une chute, des applaudissements. Ta carrière de marcheur est lancée.'}},
  {choice_text:'Courir droit vers le chat.',consequences:{happiness_modifier:3,smarts_modifier:1,result_text:'Le chat s’enfuit. Toi, tu as découvert la vitesse.'}},
  {choice_text:'Te rasseoir : c’était assez d’efforts.',consequences:{happiness_modifier:1,result_text:'Tu as fait ton exploit de la journée. La suite attendra demain.'}}]},
{id:'evt4_caprice_super',category:'childhood',icon:'😭',conditions:{min_age:2,max_age:4},probability_weight:0.9,
 prompt_text:'Au supermarché, tes parents refusent le paquet de bonbons. Tout le rayon te regarde.',
 choices:[
  {choice_text:'Te jeter par terre en hurlant.',consequences:{relationship_parents_modifier:-5,happiness_modifier:-2,result_text:'Tes parents poussent le caddie sans te regarder. Le caissier te félicite pour ta performance.'}},
  {choice_text:'Faire les yeux de chat potté.',consequences:{relationship_parents_modifier:2,happiness_modifier:3,result_text:'Ça marche : un seul bonbon, mais un bonbon quand même.'}},
  {choice_text:'Accepter et choisir un fruit.',consequences:{relationship_parents_modifier:5,health_modifier:2,karma_modifier:1,result_text:'Tes parents n’en reviennent pas. Ils t’offrent une compote.'}}]},
{id:'evt4_maternelle',category:'childhood',icon:'🎒',once:true,conditions:{min_age:3,max_age:3},probability_weight:1.2,
 prompt_text:'Premier jour de maternelle. Ta mère a les yeux humides, toi tu serres ton doudou.',
 choices:[
  {choice_text:'Lâcher sa main et courir vers le toboggan.',consequences:{happiness_modifier:5,add_friend:1,result_text:'Tu te fais un copain avant même la fin de la matinée.'}},
  {choice_text:'T’accrocher à sa jambe.',consequences:{relationship_parents_modifier:4,happiness_modifier:-2,result_text:'Il faudra deux adultes pour te décrocher. Tu t’y feras, promis.'}},
  {choice_text:'Te cacher dans la cabane à jouets.',consequences:{happiness_modifier:2,smarts_modifier:1,result_text:'La maîtresse te retrouve une heure plus tard, endormi, un cube sur la tête.'}}]},
{id:'evt4_ami_imaginaire',category:'childhood',icon:'👻',once:true,conditions:{min_age:3,max_age:6},probability_weight:0.6,
 prompt_text:'Tu as un nouvel ami que personne d’autre ne voit. Il s’appelle Monsieur Patate et il a des opinions.',
 choices:[
  {choice_text:'Lui mettre un couvert à table.',consequences:{happiness_modifier:4,relationship_parents_modifier:2,result_text:'Tes parents jouent le jeu. Monsieur Patate refuse les légumes.'}},
  {choice_text:'Lui confier tes secrets.',consequences:{happiness_modifier:3,smarts_modifier:2,result_text:'Il est un excellent confident. Il ne répète rien.'}},
  {choice_text:'Le présenter à la maîtresse.',consequences:{happiness_modifier:1,result_text:'La maîtresse hoche la tête avec beaucoup de sérieux. Tu es ravi.'}}]},
{id:'evt4_velo',category:'childhood',icon:'🚲',once:true,conditions:{min_age:5,max_age:7},probability_weight:1.0,
 prompt_text:'Papa retire les petites roues de ton vélo. « Je te tiens ! » dit-il. Tu sens bien qu’il ne te tient plus.',
 choices:[
  {choice_text:'Pédaler de toutes tes forces.',consequences:{health_modifier:2,happiness_modifier:6,relationship_parents_modifier:4,result_text:'Tu roules ! Tu roules ! Et tu ne sais pas encore freiner.'}},
  {choice_text:'Tomber trois fois, puis réussir.',consequences:{health_modifier:-1,happiness_modifier:6,discipline_modifier:2,result_text:'Genoux écorchés, sourire immense : tu as appris à ne jamais abandonner.'}},
  {choice_text:'Garder les petites roues encore un peu.',consequences:{happiness_modifier:1,result_text:'Pas de honte : tu y viendras à ton rythme.'}}]},
{id:'evt4_cp',category:'childhood',icon:'📖',once:true,conditions:{min_age:6,max_age:6},probability_weight:1.2,
 prompt_text:'Rentrée au CP. La maîtresse t’annonce que cette année, tu vas apprendre à lire. Tu as hâte, et un peu peur.',
 choices:[
  {choice_text:'Lever le doigt à chaque question.',consequences:{smarts_modifier:3,happiness_modifier:2,result_text:'Tu es déjà le chouchou. Tes camarades te trouvent un peu bruyant.'}},
  {choice_text:'Compter les mouches au plafond.',consequences:{smarts_modifier:-1,happiness_modifier:2,result_text:'Le plafond n’a plus de secret pour toi. Les lettres, c’est pour plus tard.'}},
  {choice_text:'Partager ton goûter avec ton voisin de table.',consequences:{add_friend:1,happiness_modifier:4,karma_modifier:1,result_text:'Un biscuit, un ami. L’école commence bien.'}}]},
{id:'evt4_anniv_copains',category:'childhood',icon:'🎂',conditions:{min_age:4,max_age:10},probability_weight:0.9,
 prompt_text:'C’est ton anniversaire ! Tes parents organisent un goûter avec tes copains, des ballons et un gâteau bien trop gros.',
 choices:[
  {choice_text:'Souffler les bougies d’un seul coup.',consequences:{happiness_modifier:6,add_friend:1,relationship_parents_modifier:3,result_text:'Un vœu, des applaudissements et de la crème sur le nez.'}},
  {choice_text:'Faire une bataille de gâteau.',consequences:{happiness_modifier:7,relationship_parents_modifier:-4,result_text:'Un souvenir légendaire. Tes parents, eux, nettoient encore le plafond.'}},
  {choice_text:'Offrir une part à chacun, très sérieusement.',consequences:{happiness_modifier:3,karma_modifier:2,smarts_modifier:1,result_text:'Tout le monde est servi à égalité. Tu feras un excellent notaire.'}}]}
]);
})();
