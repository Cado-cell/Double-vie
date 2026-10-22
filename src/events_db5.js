/* Deux Vies — évènements 5 : amours d'école (préfixe evt_teen_). Seuls évènements de couple possibles avant 18 ans (voir teenBlocked dans events.js). */
(()=>{
EVENT_DB.push(...[
{id:'evt_teen_cine',category:'love',icon:'🎬',conditions:{has_partner:true,min_age:12,max_age:17},probability_weight:0.5,
 prompt_text:'{partner} te propose d’aller au cinéma samedi après-midi. Vous hésitez entre une comédie et un film d’horreur.',
 choices:[
  {choice_text:'Une comédie, bien sûr.',consequences:{relationship_partner_modifier:6,happiness_modifier:3,bank_balance_modifier:-10,result_text:'Vous riez si fort que le voisin de devant se retourne. Le pop-corn finit par terre.'}},
  {choice_text:'Le film d’horreur !',consequences:{relationship_partner_modifier:5,happiness_modifier:2,bank_balance_modifier:-10,result_text:'Vous sursautez en même temps, puis vous faites semblant de ne pas avoir eu peur.'}},
  {choice_text:'Inviter aussi les copains.',consequences:{relationship_partner_modifier:2,karma_modifier:1,happiness_modifier:3,bank_balance_modifier:-25,result_text:'On est huit dans la rangée. Vous ne vous parlez presque pas, mais tout le monde s’amuse.'}}]},
{id:'evt_teen_jalousie',category:'love',icon:'👀',conditions:{has_partner:true,min_age:12,max_age:17},probability_weight:0.35,
 prompt_text:'Pendant la récré, tu vois {partner} éclater de rire avec quelqu’un d’autre. Ton cœur fait un petit bond de travers.',
 choices:[
  {choice_text:'En parler calmement après les cours.',consequences:{relationship_partner_modifier:5,karma_modifier:1,result_text:'« Mais c’est juste un ami ! » Vous finissez par en rire ensemble.'}},
  {choice_text:'Bouder toute la journée.',consequences:{relationship_partner_modifier:-6,stress_level_increment:3,result_text:'Une journée entière de silence. Toute la classe l’a remarqué.'}},
  {choice_text:'Faire comme si de rien n’était.',consequences:{stress_level_increment:2,happiness_modifier:-1,result_text:'Tu serres les dents. Ça passera… sans doute.'}}]},
{id:'evt_teen_parents',category:'love',icon:'🏠',once:true,conditions:{has_partner:true,min_age:13,max_age:17},probability_weight:0.3,
 prompt_text:'Les parents de {partner} voudraient te rencontrer. Ils ont « juste quelques questions à te poser ».',
 choices:[
  {choice_text:'Mettre ta plus belle chemise.',consequences:{relationship_partner_modifier:6,happiness_modifier:2,result_text:'Tu réponds poliment à tout, même à la question sur tes projets d’avenir. Le père acquiert une certaine estime pour toi.'}},
  {choice_text:'Les inviter chez toi pour un goûter.',consequences:{relationship_partner_modifier:4,relationship_parents_modifier:3,result_text:'Les deux familles se découvrent autour d’un gâteau. Tes parents sortent les vieilles photos. Quelle horreur.'}},
  {choice_text:'Trouver une excuse.',consequences:{relationship_partner_modifier:-5,stress_level_increment:2,result_text:'« Désolé, j’ai un devoir… » Personne n’est dupe.'}}]},
{id:'evt_teen_boum',category:'love',icon:'🎶',conditions:{has_partner:true,min_age:13,max_age:17},probability_weight:0.4,
 prompt_text:'Une fête est organisée chez un camarade de classe. {partner} te demande si tu viens.',
 choices:[
  {choice_text:'Y aller avec {partner}.',consequences:{relationship_partner_modifier:5,happiness_modifier:4,result_text:'Vous dansez n’importe comment, vous riez beaucoup. Un souvenir de plus.'}},
  {choice_text:'Rester réviser.',consequences:{smarts_modifier:1,relationship_partner_modifier:-2,happiness_modifier:-1,result_text:'Les maths te remercient. Ton cœur un peu moins.'}}]},
{id:'evt_teen_rupture',category:'love',icon:'💔',conditions:{has_partner:true,min_age:12,max_age:17},probability_weight:0.18,
 prompt_text:'Un message de {partner} s’affiche sur ton téléphone : « Je crois qu’on devrait rester amis. »',
 choices:[
  {choice_text:'Accepter, la gorge serrée.',consequences:{break_up:true,happiness_modifier:-4,result_text:'Vous restez amis, mais les regards sont un peu gênés dans la cour.'}},
  {choice_text:'Demander une explication.',consequences:{relationship_partner_modifier:4,stress_level_increment:2,result_text:'Vous parlez longuement derrière le gymnase. Ça repart, doucement.'}}]}
]);
})();
