/* Deux Vies — module « Rêves de vie » (id dreams)
   État par vie : L.dreams = [{k, done?}] (done = âge de réalisation), L.dreamAsk = {âge:1}.
   À 12, 25 et 40 ans le personnage choisit un rêve ; la fiche personnage montre la progression ; chaque rêve réalisé donne du bonheur. */
(()=>{
const MOD='dreams';
const DR={
  riche:{ic:'💰',n:'Devenir millionnaire',d:'Avoir un patrimoine d’un million d’euros.',p:L=>Math.min(1,Math.max(0,netWorth(L))/1e6),t:L=>netWorth(L)>=1e6},
  famille:{ic:'👨‍👩‍👧‍👦',n:'Fonder une grande famille',d:'Avoir au moins trois enfants.',p:L=>Math.min(1,allKids(L).length/3),t:L=>allKids(L).length>=3},
  voyageur:{ic:'🌍',n:'Faire le tour du monde',d:'Partir en voyage dix fois.',p:L=>Math.min(1,((L.tr&&L.tr.trips)||0)/10),t:L=>((L.tr&&L.tr.trips)||0)>=10},
  savant:{ic:'🎓',n:'Faire de longues études',d:'Décrocher un master ou un doctorat.',p:L=>(hasDeg(L,'*master')||hasDeg(L,'*doc'))?1:hasDeg(L,'*lic')?.5:hasDeg(L,'bac')?.25:0,t:L=>hasDeg(L,'*master')||hasDeg(L,'*doc')},
  star:{ic:'⭐',n:'Devenir célèbre',d:'Atteindre 60 % de notoriété.',p:L=>Math.min(1,Math.max(L.fame||0,(L.tr&&L.tr.fameMax)||0)/60),t:L=>Math.max(L.fame||0,(L.tr&&L.tr.fameMax)||0)>=60},
  amour:{ic:'💍',n:'Un amour qui dure',d:'Rester marié pendant 25 ans.',p:L=>Math.min(1,((L.tr&&L.tr.marriedYears)||0)/25),t:L=>((L.tr&&L.tr.marriedYears)||0)>=25},
  sommet:{ic:'🏆',n:'Atteindre le sommet',d:'Arriver en haut de l’échelle dans un métier.',p:L=>(L.tr&&L.tr.topCareer)?1:L.job?Math.min(.9,(L.job.lvl||0)/6):0,t:L=>!!(L.tr&&L.tr.topCareer)},
  proprio:{ic:'🏠',n:'Être propriétaire',d:'Posséder deux logements.',p:L=>Math.min(1,L.assets.filter(a=>a.kind==='house').length/2),t:L=>L.assets.filter(a=>a.kind==='house').length>=2},
  amis:{ic:'🥳',n:'Être entouré',d:'Avoir huit vrais amis.',p:L=>Math.min(1,friends(L).filter(p=>p.rel>=60).length/8),t:L=>friends(L).filter(p=>p.rel>=60).length>=8},
  genereux:{ic:'💝',n:'Être généreux',d:'Donner 20 000 € au total.',p:L=>Math.min(1,((L.tr&&L.tr.given)||0)/20000),t:L=>((L.tr&&L.tr.given)||0)>=20000},
  bete:{ic:'🐾',n:'Une vie avec des animaux',d:'Avoir trois animaux en même temps.',p:L=>Math.min(1,pets(L).length/3),t:L=>pets(L).length>=3}
};
const KEYS=Object.keys(DR);
const ASK_AGES=[12,25,40];
const mine=L=>(L&&L.dreams)||[];
function born(L){if(L)L.dreams=[];}
function heirInit(D,L){if(L)L.dreams=[];}
function adopt(L,k){if(!L.dreams)L.dreams=[];if(L.dreams.length>=3||L.dreams.some(d=>d.k===k))return;L.dreams.push({k});say(L,`🌟 Nouveau rêve : ${DR[k].n.toLowerCase()}.`)}
function options(L){const have=new Set(mine(L).map(d=>d.k));return KEYS.filter(k=>!have.has(k))}
function year(L){
  if(!L)return;if(!L.dreams)L.dreams=[];if(!L.dreamAsk)L.dreamAsk={};
  for(const d of L.dreams){
    if(d.done!=null||!DR[d.k])continue;
    let ok=false;try{ok=DR[d.k].t(L)}catch(e){console.error(e)}
    if(ok){d.done=L.age;chg(L,{happy:12});track(L,'dreams');say(L,`🌟 Rêve réalisé : ${DR[d.k].n.toLowerCase()} !`)}
  }
  const key=ASK_AGES.includes(L.age)&&!L.dreamAsk[L.age]?L.age:(L.age>=12&&L.age<60&&!L.dreams.length&&!L.dreamAsk.first?'first':null);
  if(key!==null&&L.alive!==false&&L.dreams.length<3){
    L.dreamAsk[key]=1;const pool=options(L);if(!pool.length)return;
    const three=shuffle(pool.slice()).slice(0,3);
    modal({title:L.age<18?'Quand je serai grand…':'Un rêve ?',icon:'🌟',text:L.age<18?'Qu’est-ce que tu aimerais vraiment réaliser dans la vie ?':'Qu’est-ce qui te ferait vraiment plaisir, maintenant ?',
      choices:three.map(k=>({t:`${DR[k].ic} ${DR[k].n}`,fn:()=>{adopt(L,k);return `Rêve choisi : ${DR[k].n.toLowerCase()}.`}})).concat([{t:'Je verrai plus tard'}])});
  }
}
function pDreams(){
  const L=cur();if(!L)return {title:'Rêves',html:note('Aucun personnage.')};
  const list=mine(L);
  const rows=list.map(d=>{const D=DR[d.k];if(!D)return '';const pc=d.done!=null?100:Math.round(D.p(L)*100);
    return row({ic:D.ic,t:D.n,s:d.done!=null?`${D.d} · réalisé à ${d.done} ans ✔`:`${D.d} · ${pc} %`,right:mini(pc)})});
  const free=options(L);
  return {title:'Mes rêves',html:note(list.length?'Chaque rêve réalisé te rend heureux. À la fin de la vie, ils comptent dans ton bilan.':'Tu n’as pas encore de rêve. À 12, 25 et 40 ans, on te demandera ce qui te ferait plaisir, ou choisis-en un dès maintenant.')
    +group('Mes rêves',rows)
    +(L.age>=8&&list.length<3&&free.length?group('En choisir un',free.slice(0,6).map(k=>act(L,{ic:DR[k].ic,t:DR[k].n,s:DR[k].d,fn:L=>{adopt(L,k);return `Rêve choisi : ${DR[k].n.toLowerCase()}.`}}))):'')};
}
registerMod({
  id:MOD,
  born,year,heirInit,
  sheetRows(L){
    const l=mine(L),done=l.filter(d=>d.done!=null).length;
    return [nav('🌟','Mes rêves',l.length?`${done} réalisé${done>1?'s':''} sur ${l.length}`:'Choisis ce qui compte pour toi',pDreams)];
  }
});
})();
