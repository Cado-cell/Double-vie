/* Deux Vies — module « Projets des proches » (id goals)
   Chaque proche a ses propres buts : un projet de vie (métier, famille, argent, aventure, études, passion) qui avance un peu chaque
   année, que tu peux soutenir (argent ou encouragements), et dont tu apprends la réussite. État par personne : p.goal = {k, t, prog, done?, asked?},
   p.memo (partagé avec mod_agents : gave / refused) pour que l'aide donnée ou refusée compte dans la relation et dans l'héritage. */
(()=>{
const MOD='goals';
const GOALS={
  metier:{ic:'💼',t:['décrocher la promotion de sa vie','se reconvertir dans le métier de ses rêves','passer son permis poids lourd','devenir chef d’équipe']},
  famille:{ic:'👨‍👩‍👧',t:['fonder une famille','se marier cet été','adopter un enfant','emménager avec son amoureux ou son amoureuse']},
  argent:{ic:'🏠',t:['acheter son premier appartement','rembourser toutes ses dettes','mettre assez de côté pour voyager','s’offrir une voiture neuve']},
  aventure:{ic:'🧭',t:['faire le tour du monde','traverser un désert à vélo','apprendre à surfer à Hawaï','partir un an au Canada']},
  etudes:{ic:'🎓',t:['reprendre des études','décrocher un diplôme','apprendre trois langues','passer le concours de ses rêves']},
  passion:{ic:'🎨',t:['ouvrir un petit restaurant','monter un groupe de musique','écrire un roman','ouvrir une boutique de plantes']}
};
const WHO=['parent','sibling','friend','child'];
const eligible=L=>(L.family||[]).filter(p=>p&&p.alive!==false&&WHO.includes(p.type)&&p.age>=14&&p.age<=62&&p.tag!=='rival'&&p.tag!=='voisin'&&!(p.type==='child'&&p.age<18));
const kinds=p=>Object.keys(GOALS).filter(k=>(k!=='etudes'||p.age<38)&&(k!=='famille'||(p.age>=20&&p.age<=46&&p.type!=='parent'))&&(k!=='metier'||p.age>=20));

function assign(L,p){
  const k=pick(kinds(p));p.goal={k,t:pick(GOALS[k].t),prog:R(0,20)};return p.goal;
}
function done(L,p){
  const g=p.goal;g.done=L.age;g.prog=100;
  const il=ge(p,'il','elle'),close=p.rel>=60;
  const news={
    metier:()=>{p.job=pick(NPC_JOBS.filter(x=>x!=='sans emploi'));return `🎯 ${p.first} y est arrivé${ge(p,'','e')} : ${g.t}. ${close?'Un appel joyeux, vous trinquez à distance.':'Tu l’apprends par un ami commun.'}`},
    famille:()=>`🎯 ${p.first} a réalisé son projet : ${g.t}. ${close?`Tu es invité${ge(L,'','e')} à fêter ça.`:'Une carte arrive dans ta boîte aux lettres.'}`,
    argent:()=>`🎯 ${p.first} y est enfin : ${g.t}. ${close?`${il} te fait visiter, très fier${ge(p,'','e')}.`:'Une photo des clés circule dans la famille.'}`,
    aventure:()=>`🎯 ${p.first} a réalisé son rêve : ${g.t}. ${close?'Une carte postale arrive, avec un grand soleil dessiné dessus.':'Les photos tournent sur les réseaux.'}`,
    etudes:()=>`🎯 ${p.first} a réussi : ${g.t}. ${close?'Tu as eu droit à un message en majuscules.':'La famille applaudit de loin.'}`,
    passion:()=>`🎯 ${p.first} s’est lancé${ge(p,'','e')} : ${g.t}. ${close?'Tu es dans les premiers invités.':'Tu en entends parler au détour d’une conversation.'}`
  };
  say(L,news[g.k]());
  if(close){chg(L,{happy:2});p.rel=clamp(p.rel+3)}
  const m=p.memo||(p.memo={});if(m.gave>0&&p.rel>=50&&!g.thanked){g.thanked=1;p.rel=clamp(p.rel+6);say(L,`💌 ${p.first} te remercie : « Sans ton aide, je n’y serais pas arrivé${ge(p,'','e')}. »`)}
}
function ask(L,p){
  const g=p.goal,m=p.memo||(p.memo={});g.asked=1;
  const amt=Math.max(50,Math.round(R(150,1200)*Math.min(2,costOf(L))/50)*50),can=L.money>=amt*2;
  modal({title:`Le projet de ${p.first}`,icon:GOALS[g.k].ic,av:avatar(p,{happy:65}),text:`${p.first} te parle de son projet : ${g.t}. « Ça avance, mais un petit coup de pouce changerait tout. »`,choices:[
    can?{t:`Donner ${fmt(amt)}`,fn:()=>{if(L.money<amt)return 'Tu n’as plus assez d’argent.';L.money-=amt;g.prog=Math.min(100,g.prog+30);p.rel=clamp(p.rel+10);p.seen=L.age;m.gave=(m.gave||0)+amt;chg(L,{karma:2,happy:2});track(L,'given',amt);return out(L,`💶 Tu donnes ${fmt(amt)} à ${p.first} pour son projet. ${ge(p,'Il','Elle')} en a les larmes aux yeux.`)}}:null,
    {t:'L’encourager de tout cœur',fn:()=>{g.prog=Math.min(100,g.prog+8);p.rel=clamp(p.rel+4);p.seen=L.age;return out(L,`💬 Tu crois en ${p.first}, et ça se voit. ${ge(p,'Il','Elle')} repart gonflé${ge(p,'','e')} à bloc.`)}},
    {t:'Pas cette fois',fn:()=>{p.rel=clamp(p.rel-3);m.refused=(m.refused||0)+1;return out(L,`🙁 ${p.first} comprend, mais ça se sent. Le projet avancera sans toi.`)}}].filter(Boolean)});
}
function year(L){
  if(!L||L.age<10||L.alive===false||L.prison)return;
  let news=0,asked=false;
  for(const p of eligible(L)){
    if(!p.goal){if(chance(.12))assign(L,p);continue}
    const g=p.goal;if(g.done!=null){if(L.age-g.done>=8&&chance(.15))assign(L,p);continue}
    g.prog=Math.min(100,g.prog+R(6,16));
    if(g.prog>=100){if(news<2){done(L,p);news++}else g.prog=96;continue}
    if(!asked&&!g.asked&&g.prog>=30&&g.prog<=80&&p.rel>=50&&chance(.3)){asked=true;ask(L,p)}
  }
}
function personRows(L,p){
  const g=p&&p.goal;if(!g||p.alive===false)return [];
  if(g.done!=null)return [row({ic:'✅',t:'Projet réalisé',s:`${g.t} · à ${g.done} ans`})];
  return [row({ic:GOALS[g.k].ic,t:'Son projet',s:`${g.t} · ${Math.round(g.prog)} %`,right:mini?mini(Math.round(g.prog)):''}),
    act(L,{ic:'💬',t:'L’encourager',s:'Un mot qui donne des ailes',key:'enc'+p.id,fn:L=>{p.goal.prog=Math.min(100,p.goal.prog+6);p.rel=clamp(p.rel+3);p.seen=L.age;return out(L,`💬 Tu encourages ${p.first}. ${ge(p,'Il','Elle')} y croit un peu plus.`)}})];
}
registerMod({id:MOD,year,personRows});
window.GOALS_KINDS=Object.keys(GOALS);
})();
