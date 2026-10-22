/* Deux Vies — module « Pouvoir » (id power)
   1. POLITIQUE (L.pol) : conseiller municipal → maire → président de région → député → ministre (nomination) → président de la République.
      Financement de campagne (fonds personnels, dons, plafond légal, contrôle des comptes), meetings et thèmes de discours,
      sondages par segments (jeunes, retraités, ruraux, urbains), votes de lois, élections, mandats, nominations.
   2. CRIME ORGANISÉ (L.mob) : familles du milieu, hiérarchie Associé → Soldat → Capitaine → Sous-chef → Parrain,
      racket de commerces, coups de rue, respect et loyauté, indics infiltrés, opérations de police, chaleur, procès.
   Migration : l’ancien format L.pol {office,party,approval,support,cand,term,prev} et L.mob {fam,rank,resp,heat} est repris sans perte. */
(()=>{
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const nn=(v,d)=>(typeof v==='number'&&isFinite(v))?v:d;
const sg=v=>{const r=Math.round(v);return (r>0?'+':r<0?'−':'')+Math.abs(r)};
const arr=v=>Array.isArray(v)?v:[];

/* =====================================================================
   POLITIQUE : données
   ===================================================================== */
const SEG=['jeunes','retraites','ruraux','urbains'];
const SEGN={jeunes:'Jeunes',retraites:'Retraités',ruraux:'Ruraux',urbains:'Urbains'};
const SEGL={jeunes:'Les jeunes',retraites:'Les retraités',ruraux:'Les ruraux',urbains:'Les urbains'};
const SEGI={jeunes:'🎒',retraites:'🧓',ruraux:'🌾',urbains:'🏙️'};
const NAT_W=[.22,.3,.2,.28];
const POLS=[
 {k:'conseiller',n:'Conseiller municipal',f:'Conseillère municipale',sal:6000,term:6,min:18,plaf:12000,diff:-3,w:[.2,.25,.15,.4],lieu:'au conseil municipal'},
 {k:'maire',n:'Maire',f:'Maire',sal:42000,term:6,min:21,plaf:60000,diff:1,w:[.18,.32,.2,.3],lieu:'à la mairie'},
 {k:'region',n:'Président de région',f:'Présidente de région',sal:75000,term:6,min:25,plaf:150000,diff:4,w:[.2,.3,.25,.25],lieu:'à l’hôtel de région'},
 {k:'depute',n:'Député',f:'Députée',sal:87000,term:5,min:23,plaf:120000,diff:5,w:NAT_W,lieu:'à l’Assemblée nationale'},
 {k:'ministre',n:'Ministre',f:'Ministre',sal:125000,term:5,min:25,appointed:1,plaf:0,diff:0,w:NAT_W,lieu:'au gouvernement'},
 {k:'president',n:'Président de la République',f:'Présidente de la République',sal:185000,term:5,min:35,plaf:600000,diff:9,w:NAT_W,lieu:'à l’Élysée'}
];
const FAME_WIN=[3,6,10,14,0,40];
const THEMES=[
 {k:'securite',n:'Sécurité',ic:'🚓',m:[-1,3,2,1],q:'Patrouilles, caméras et fermeté'},
 {k:'ecologie',n:'Écologie',ic:'🌱',m:[3,0,-1,2],q:'Climat, vélos et sobriété'},
 {k:'achat',n:'Pouvoir d’achat',ic:'🛒',m:[2,1,3,1],q:'Le prix de la baguette et du carburant'},
 {k:'education',n:'Éducation',ic:'🎓',m:[3,0,1,2],q:'Écoles, profs et cantines'},
 {k:'sante',n:'Santé',ic:'🩺',m:[0,3,2,1],q:'Hôpitaux, urgences et déserts médicaux'},
 {k:'emploi',n:'Emploi',ic:'🧰',m:[3,0,2,2],q:'Usines, apprentissage et salaires'},
 {k:'logement',n:'Logement',ic:'🏠',m:[3,-1,-1,3],q:'Loyers, HLM et passoires thermiques'},
 {k:'retraites',n:'Retraites',ic:'⏳',m:[-2,4,1,0],q:'L’âge de départ, toujours'},
 {k:'agriculture',n:'Agriculture',ic:'🚜',m:[0,1,4,-1],q:'Paysans, prix et normes'},
 {k:'transports',n:'Transports',ic:'🚆',m:[1,0,-1,3],q:'Trains à l’heure, tramways et RER'},
 {k:'culture',n:'Culture',ic:'🎭',m:[2,0,-1,3],q:'Festivals, médiathèques et théâtres'}
];
const PARTY_X=[
 {tilt:[3,-2,0,2],fav:'education',d:'Réformateurs pressés, start-up et petites vestes cintrées.'},
 {tilt:[-2,3,2,-1],fav:'securite',d:'Le parti des banquets, des maires de province et du rosbif.'},
 {tilt:[3,-2,-3,3],fav:'ecologie',d:'Vélos, vélos, vélos, et un peu de compost.'},
 {tilt:[0,1,0,0],fav:'achat',d:'Ni gauche ni droite, bien au contraire.'},
 {tilt:[-1,0,3,-2],fav:'agriculture',d:'La voix des ronds-points, des tracteurs et des comices agricoles.'},
 {tilt:[0,0,0,0],fav:null,d:'Pas de carte, pas de chef, pas de caisse commune. Que de la liberté.'}
];
const px=name=>{const i=typeof PARTIES!=='undefined'?PARTIES.indexOf(name):-1;return PARTY_X[i]||{tilt:[0,0,0,0],fav:null,d:''}};
const pidx=name=>typeof PARTIES!=='undefined'?PARTIES.indexOf(name):-1;
const LAWS=[
 /* lv 0 : conseil municipal ou régional */
 {lv:0,n:'Pistes cyclables sur tout le centre-ville',t:'Le projet supprime la moitié des places de stationnement.',e:[3,-2,-3,4],p:[1,-1,1,0,-1,0]},
 {lv:0,n:'Transports gratuits pour les moins de 25 ans',t:'Coût estimé : un nouveau rond-point en moins.',e:[4,-1,0,2],p:[1,-1,1,0,0,0]},
 {lv:0,n:'Réouverture de la maternité de la sous-préfecture',t:'Les futurs parents font le déplacement en nombre.',e:[0,2,4,0],p:[0,1,0,1,1,0]},
 {lv:0,n:'Interdiction des trottinettes en libre-service',t:'Les trottoirs sont encombrés, les jeunes beaucoup moins ravis.',e:[-4,2,1,1],p:[-1,1,-1,0,0,0]},
 {lv:0,n:'Hausse de la taxe foncière pour financer la piscine',t:'La piscine promet un toboggan. Les propriétaires promettent des banderoles.',e:[1,-3,-1,0],p:[0,-1,0,0,-1,0]},
 {lv:0,n:'Vidéosurveillance dans tout le centre-ville',t:'Soixante caméras, dont une qui filme surtout un pigeon.',e:[-1,3,0,2],p:[-1,1,-1,0,0,0]},
 {lv:0,n:'Cantines 100 % bio et locales',t:'Les carottes viendront de moins de trente kilomètres.',e:[2,0,2,1],p:[1,0,1,0,1,0]},
 {lv:0,n:'Fermeture du bureau de poste du hameau',t:'Économie : 40 000 € par an. Tollé : garanti.',e:[0,-2,-4,1],p:[0,0,0,0,-1,0]},
 {lv:0,n:'Festival d’été sur la place du marché',t:'Trois jours de concerts et d’odeurs de merguez.',e:[2,1,1,2],p:[1,0,0,1,0,0]},
 {lv:0,n:'Zone à faibles émissions dans l’agglomération',t:'Les vieilles Clio sont priées de rester au garage.',e:[1,-1,-4,2],p:[1,-1,1,0,-1,0]},
 /* lv 1 : Assemblée, gouvernement, Élysée */
 {lv:1,n:'Réforme des retraites',t:'Deux ans de plus avant la quille. Les syndicats sortent les drapeaux.',e:[2,-5,-1,0],p:[0,1,-1,1,0,0]},
 {lv:1,n:'Taxe carbone sur les carburants',t:'Le plein coûtera plus cher, la planète aussi vous le rendra. Peut-être.',e:[2,-1,-4,2],p:[1,-1,1,0,-1,0]},
 {lv:1,n:'Recrutement de 10 000 policiers',t:'Une réponse à l’insécurité, financée par un autre budget.',e:[-1,3,2,1],p:[0,1,-1,0,1,0]},
 {lv:1,n:'Repas à un euro pour tous les étudiants',t:'Le RU devient le restaurant préféré de la jeunesse.',e:[4,0,0,1],p:[1,0,1,1,0,0]},
 {lv:1,n:'Plan contre les déserts médicaux',t:'Des médecins « volontaires » dans les zones sous-dotées.',e:[0,3,4,1],p:[0,1,0,1,1,0]},
 {lv:1,n:'Interdiction de certains pesticides',t:'Les abeilles sont ravies. Les agriculteurs, beaucoup moins.',e:[1,0,-4,2],p:[1,-1,1,0,-1,0]},
 {lv:1,n:'Droit au télétravail',t:'Deux jours par semaine en pantoufles, sauf pour les plombiers.',e:[3,0,-1,3],p:[1,0,0,1,0,0]},
 {lv:1,n:'Revalorisation du minimum vieillesse',t:'Une hausse de 100 € par mois, à financer par quelqu’un.',e:[-1,4,1,0],p:[0,1,0,1,1,0]},
 {lv:1,n:'Plafonnement des loyers dans les grandes villes',t:'Les locataires applaudissent, les propriétaires envisagent l’exil.',e:[3,-1,-1,4],p:[1,-1,1,0,-1,0]},
 {lv:1,n:'Retour définitif à l’heure d’été',t:'La loi la plus commentée du quinquennat, sans aucune raison.',e:[1,1,-1,1],p:[0,0,0,0,0,0]},
 {lv:1,n:'Réforme de l’audiovisuel public',t:'Les journalistes sortent de leur studio. Le débat est vif.',e:[0,1,1,0],p:[0,1,-1,0,0,0]}
];

/* ---------- monde : l’actualité ---------- */
function W(){
  const g=(typeof G!=='undefined'&&G)?G:null;
  if(!g)return {hot:'achat',mood:0,yr:0};
  let w=g.pw;if(!w||typeof w!=='object')w=g.pw={};
  if(!THEMES.some(t=>t.k===w.hot))w.hot=pick(THEMES).k;
  w.mood=nn(w.mood,0);w.yr=nn(w.yr,0);
  return w;
}
const themeOf=k=>THEMES.find(t=>t.k===k)||THEMES[2];
const moodWord=m=>m>4?'plutôt optimiste':m<-4?'franchement morose':'incertain';

/* ---------- état ---------- */
function pol(L){
  let P=L.pol;
  if(!P||typeof P!=='object')P=L.pol={pv:2,office:-1,party:null,approval:50};
  if(P.pv!==2){
    const mp=i=>{
      if(typeof i!=='number'||i<0)return -1;
      let k=(typeof OFFICES!=='undefined'&&OFFICES[i])?OFFICES[i].k:null;if(k==='senateur')k='depute';
      return POLS.findIndex(x=>x.k===k);
    };
    const sup=nn(P.support,0);
    P.office=mp(P.office);
    P.cand=(P.cand==null)?null:(mp(P.cand)>=0?mp(P.cand):null);
    P.prev=(P.prev==null||mp(P.prev)<0)?null:mp(P.prev);
    P.best=Math.max(P.office,P.prev==null?-1:P.prev,-1);
    if(P.cand!=null)P.camp=lim((sup-25)/3,0,15);
    P.pv=2;
  }
  if(P.office==null||typeof P.office!=='number')P.office=-1;
  if(P.cand===undefined)P.cand=null;
  if(P.prev===undefined)P.prev=null;
  if(typeof P.best!=='number')P.best=Math.max(P.office,P.prev==null?-1:P.prev,-1);
  if(P.party===undefined)P.party=null;
  P.approval=nn(P.approval,50);
  if(!P.seg||typeof P.seg!=='object')P.seg={};
  SEG.forEach(s=>{if(typeof P.seg[s]!=='number'||!isFinite(P.seg[s]))P.seg[s]=lim(P.approval+R(-3,3),3,97)});
  if(!P.sp||typeof P.sp!=='object')P.sp=Object.assign({},P.seg);
  if(P.office>=0&&typeof P.term!=='number')P.term=POLS[P.office].term;
  const D=(k,v)=>{if(typeof P[k]!=='number')P[k]=v};
  D('camp',0);D('funds',0);D('don',0);D('black',0);D('perso',0);D('spent',0);D('mgr',0);D('flips',0);D('loy',60);D('ban',0);
  D('wins',0);D('losses',0);D('laws',0);D('pres',0);D('scand',0);D('baseTerm',0);
  if(P.base===undefined)P.base=null;
  if(P.theme===undefined)P.theme=null;
  if(!Array.isArray(P.hist))P.hist=[P.approval];
  if(!P.react||typeof P.react!=='object')P.react={};
  if(P.hint===undefined)P.hint=null;
  return P;
}
const lab=(L,i)=>{const O=POLS[i];return O?(L&&L.gender==='F'?O.f:O.n):''};
const wOf=i=>(POLS[i]&&POLS[i].w)||NAT_W;
const avgW=(P,i)=>{const w=wOf(i);return SEG.reduce((s,k,j)=>s+P.seg[k]*w[j],0)};
const refIdx=P=>P.office>=0?P.office:(P.cand!=null?P.cand:(P.prev!=null&&P.prev!==4?P.prev:1));
function sync(P){P.approval=Math.round(avgW(P,refIdx(P)))}
const thr=i=>50+(POLS[i]?POLS[i].diff:0);
function intent(L,P,i){
  const inc=(i===P.office||i===P.prev)?4+W().mood/5:0;
  return lim(Math.round(avgW(P,i)+P.camp+(L.fame-15)/12+(L.hid.karma-50)/14+inc),0,100);
}
const ctxIdx=P=>P.cand!=null?P.cand:Math.max(0,P.office>=0&&P.office!==4?P.office:(P.base!=null?P.base:1));
const meetCost=i=>Math.max(100,Math.round(POLS[i].plaf*.015/10)*10);
const donCap=i=>Math.round(POLS[i].plaf*.6);
const canPay=(L,P,c)=>L.money+(P.cand!=null?P.funds:0)>=c;
function pay(L,P,c){
  c=Math.round(c);if(c<=0)return;
  if(P.cand!=null){
    const f=Math.min(P.funds,c);P.funds-=f;const rest=c-f;
    if(rest>0){spend(L,rest);P.perso+=rest}
    P.spent+=c;
  }else spend(L,c);
}
function shift(P,d,m){SEG.forEach((s,i)=>{P.seg[s]=lim(P.seg[s]+d[i]*(m==null?1:m),3,97)})}
function stats(P){
  return statLine('Popularité moyenne',P.approval)+SEG.map(s=>{
    const dl=P.sp&&typeof P.sp[s]==='number'?Math.round(P.seg[s]-P.sp[s]):0;
    return statLine(`${SEGI[s]} ${SEGN[s]}${dl?` (${sg(dl)})`:''}`,P.seg[s]);
  }).join('');
}
function reaction(d){
  const e=SEG.map((s,i)=>[s,d[i]]).sort((a,b)=>b[1]-a[1]);
  const vb=v=>v>=4?'te font une ovation':v>=2?'applaudissent':v>=.8?'hochent la tête poliment':v>-.8?'restent de marbre':v>-2?'grimacent':'sifflent';
  const a=e[0],b=e[3];
  return `${SEGL[a[0]]} ${vb(a[1])} (${sg(a[1])}), ${SEGL[b[0]].toLowerCase()} ${vb(b[1])} (${sg(b[1])}).`;
}

/* =====================================================================
   POLITIQUE : actions
   ===================================================================== */
function joinParty(L,P,name){
  const X=px(name),old=P.party?px(P.party):null,had=!!P.party;
  if(!P.party){const bonus=(L.powerLegacy&&L.powerLegacy.party===name)?4:0;SEG.forEach((s,i)=>{P.seg[s]=lim(P.seg[s]+X.tilt[i]*1.5+bonus+Math.round((L.fame-10)/12),3,97)});P.loy=60+(bonus?15:0)}
  else{SEG.forEach((s,i)=>{P.seg[s]=lim(P.seg[s]+(X.tilt[i]-old.tilt[i])*1.5,3,97)});P.loy=45;P.seg.jeunes=lim(P.seg.jeunes-3,3,97)}
  P.party=name;P.sp=Object.assign({},P.seg);sync(P);
  return out(L,had?`🏛️ Tu quittes ton parti pour ${name}. On te traite de girouette dans tous les cafés du commerce.`:`🏛️ Tu prends ta carte : ${name}. ${X.d}`);
}
function runMiss(L,P,i){
  const O=POLS[i];
  if(L.age<O.min)return `Dès ${O.min} ans`;
  if(L.prison)return 'Impossible en prison';
  if(P.ban>0)return `Inéligible encore ${An(P.ban)}`;
  if(O.k==='president'){if(P.best<3)return 'Avoir été député ou ministre';if(P.pres>=2)return 'Limite de deux mandats atteinte'}
  if(L.record>=2&&i>=3)return 'Casier judiciaire trop chargé';
  return '';
}
function startCamp(L,P,i){
  P.cand=i;P.camp=0;P.funds=0;P.don=0;P.black=0;P.perso=0;P.spent=0;P.mgr=0;
  if(L.powerLegacy&&L.powerLegacy.best>=i)P.camp=2;
  return out(L,`🗳️ Tu annonces ta candidature : ${lab(L,i).toLowerCase()}. La campagne court jusqu’à la fin de l’année.`);
}
function resetCamp(P){P.cand=null;P.camp=0;P.funds=0;P.don=0;P.black=0;P.perso=0;P.spent=0;P.mgr=0}

function speech(L,P,th,tgt,mode){
  const w=W(),i=ctxIdx(P),c=mode==='gov'?0:meetCost(i);
  pay(L,P,c);
  let g=1.7*(1+(L.st.smarts-50)/220+L.fame/260+(L.hid.willpower-50)/300);
  if(th.k===w.hot)g*=1.45;
  const X=px(P.party);if(X.fav===th.k)g*=1.15;
  if(P.theme&&P.theme!==th.k){P.flips++;}
  g/=1+Math.max(0,P.flips-1)*.08;
  P.theme=th.k;
  const d=SEG.map((s,j)=>th.m[j]*g*(tgt?(tgt===s?1.9:.45):1)+(R(-10,10)/10));
  d.forEach((v,j)=>{P.seg[SEG[j]]=lim(P.seg[SEG[j]]+v,3,97)});
  P.react[th.k]=d.map(Math.round);
  chg(L,{stress:2});
  if(P.cand!=null)P.camp=lim(P.camp+Math.max(0,d.reduce((s,v,j)=>s+v*wOf(i)[j],0)*.25),0,30);
  sync(P);
  const open=pick(['Salle comble','Une halle des fêtes pleine à craquer','Un gymnase surchauffé','Quelques drapeaux et beaucoup de café','Un micro qui grésille, puis un triomphe'].concat(th.k===w.hot?['Tout le monde ne parle que de ça']:[]));
  return out(L,`${th.ic} ${open} : ${th.n.toLowerCase()}. ${reaction(d)}`);
}
function meeting(L,P,th){
  modal({title:`Meeting : ${th.n}`,icon:th.ic,text:`${th.q}. À qui t’adresses-tu ce soir ?`,choices:[
    {t:'À tout le monde',pri:1,fn:()=>speech(L,P,th,null)},
    ...SEG.map(s=>({t:`Cibler : ${SEGN[s].toLowerCase()}`,fn:()=>speech(L,P,th,s)}))]});
  return '';
}
function scandalHit(L,P,sev,txt){
  SEG.forEach(s=>{P.seg[s]=lim(P.seg[s]-(sev*2+R(0,3)),3,97)});
  P.loy=lim(P.loy-5,0,100);P.scand++;track(L,'scandals');chg(L,{happy:-6});sync(P);
  return out(L,txt);
}

/* ---------- élections ---------- */
function holdElection(L,P){
  const i=P.cand,O=POLS[i],w=W();
  const inter=intent(L,P,i),score=inter+R(-6,6),t=thr(i);
  const won=score>=t;
  const share=won?lim(51+(score-t)*.5,51,78):lim(49-(t-score)*.7,6,49);
  const donC=donCap(i);let sc=null;
  if(P.don>donC)sc={k:'dons',over:P.don-donC};
  else if(P.spent>O.plaf)sc={k:'dep',over:P.spent-O.plaf};
  if(P.black>0&&chance(.3+P.black/O.plaf*.9))sc={k:'noir',over:Math.max(P.black,sc?sc.over:0)};
  const was=(i===P.office||i===P.prev);
  const priorOffice=P.office,priorTerm=P.term;let inval=false;
  let txt;
  if(won){
    P.office=i;P.term=O.term;P.prev=i;P.best=Math.max(P.best,i);P.wins++;P.base=null;
    shift(P,[3,3,3,3]);chg(L,{happy:12,fame:FAME_WIN[i]});
    if(i===5){P.pres++;track(L,'president')}
    const el=was?ge(L,'Réélu','Réélue'):ge(L,'Élu','Élue');
    if(i===5){
      const r1=lim(Math.round(share*.45+R(-2,2)),12,38);
      txt=`🗳️ ${el} ! Au premier tour, tu arrives en tête avec ${r1} %. Au second tour, tu l’emportes avec ${Math.round(share)} % des voix. Tu entres ${O.lieu} : ${lab(L,i).toLowerCase()}.`;
    }else txt=`🗳️ ${el} ${i===3?'dans ta circonscription':''} avec ${Math.round(share)} % des voix. Tu deviens ${lab(L,i).toLowerCase()}, ${O.lieu}.`.replace('  ',' ');
  }else{
    P.losses++;shift(P,[-2,-2,-2,-2]);chg(L,{happy:-8,fame:1});
    txt=i===5&&share<30?`🗳️ Éliminé${ge(L,'','e')} dès le premier tour de la présidentielle : ${Math.round(share*.5)} %. La nuit est longue.`:`🗳️ Défaite : ${Math.round(share)} % des voix seulement. ${pick(['Ton QG se vide en silence.','Tes militants chantent quand même.','Ton adversaire a eu la décence de ne pas faire de discours.','Le champagne reste au frigo.'])}`;
  }
  let ref=0;
  if(!sc){ref=Math.min(P.perso,Math.round(O.plaf*.475));if(ref>0){L.money+=ref}}
  const lines=[txt];
  if(ref>0)lines.push(`L’État te rembourse ${fmt(ref)} de tes dépenses de campagne.`);
  if(sc){
    const ratio=sc.over/O.plaf;
    const fine=Math.round(Math.min(Math.max(0,L.money)*.5,sc.over*.35+2000));
    if(fine>0)spend(L,fine);
    SEG.forEach(s=>{P.seg[s]=lim(P.seg[s]-(4+Math.min(10,ratio*25)),3,97)});
    P.loy=lim(P.loy-8,0,100);P.scand++;track(L,'scandals');chg(L,{karma:-3,happy:-8});
    let m=sc.k==='noir'?'🔍 La Commission des comptes de campagne découvre une caisse noire.':sc.k==='dons'?`🔍 La Commission des comptes de campagne constate que tu as dépassé le plafond légal des dons de ${fmt(sc.over)}.`:`🔍 La Commission des comptes de campagne relève que tu as dépassé le plafond légal des dépenses de ${fmt(sc.over)}.`;
    m+=` Ton compte est rejeté, amende : ${fmt(fine)}.`;
    if(sc.k==='noir'){P.ban=Math.max(P.ban,R(1,3));if(chance(.5))L.record++;m+=` Tu es déclaré inéligible ${An(P.ban)}.`}
    if(won&&(sc.k==='noir'||ratio>.3)&&chance(.55)){
      inval=true;P.office=priorOffice;P.term=priorTerm;P.wins--;m+=' L’élection est invalidée : ton siège part avec l’eau du bain.';
      if(i===5){P.pres--}
    }
    lines.push(m);
  }
  lines.forEach(x=>say(L,x));
  modal({title:won?'Soirée électorale : victoire':'Soirée électorale',icon:'🗳️',text:lines.join('\n\n')});
  resetCamp(P);
  return won&&!inval;
}
function endMandate(L,P){
  const i=P.office;
  say(L,`Ton mandat de ${lab(L,i).toLowerCase()} arrive à son terme. Tu peux te représenter.`);
  P.prev=i;P.office=-1;P.term=0;
}
function ministryYear(L,P){
  P.term--;if(P.base!=null)P.baseTerm--;
  let leave=false;
  if(P.approval<38&&chance(.45)){say(L,'📰 Le Premier ministre te retire ton portefeuille après une série de sondages catastrophiques.');leave=true}
  else if(P.term<=0||chance(.12)){say(L,'Remaniement : tu quittes le gouvernement.');leave=true}
  if(leave){
    const b=P.base;P.office=-1;P.prev=4;P.term=0;
    if(b!=null&&P.baseTerm>0){P.office=b;P.term=P.baseTerm;say(L,`Tu retrouves ton mandat de ${lab(L,b).toLowerCase()}.`)}
    P.base=null;
  }
}
function nominate(L,P,asked){
  const p=(asked?.3:.1)+(P.approval-55)/150+(P.loy-50)/300+(P.party==='Indépendant'?-.1:0)+L.fame/500;
  if(P.approval<(asked?55:60)||P.office<1||P.office>3)return false;
  if(!chance(lim(p,.04,.8)))return false;
  P.base=P.office;P.baseTerm=P.term;P.office=4;P.term=R(2,5);P.best=Math.max(P.best,4);P.prev=4;
  chg(L,{happy:8,fame:6});shift(P,[1,1,1,1]);
  say(L,`📞 ${pick(['Le Président t’appelle','Matignon te joint','On te glisse à l’oreille'])} : tu es nommé${ge(L,'','e')} ministre${P.party==='Indépendant'?' (sans étiquette, ce qui fait jaser)':''} !`);
  return true;
}
function polYear(L){
  if(!L.pol)return;
  const P=pol(L),w=W();
  if(P.ban>0)P.ban--;
  P.flips=Math.max(0,P.flips-1);
  SEG.forEach(s=>{P.seg[s]=lim(P.seg[s]+(50-P.seg[s])*.07+(P.office>=0?w.mood/7+R(-2,2):R(-1,1)),3,97)});
  let fresh=false;
  if(P.cand!=null){
    if(L.prison||P.ban>0){say(L,'🗳️ Ta candidature est invalidée : tu ne peux pas te présenter.');resetCamp(P)}
    else fresh=holdElection(L,P);
  }
  if(P.office>=0){
    const O=POLS[P.office];
    earn(L,O.sal);
    if(!fresh){
      if(P.office===4)ministryYear(L,P);
      else{P.term--;if(P.term<=0)endMandate(L,P)}
      if(P.office>=1&&P.office<=3)nominate(L,P,false);
    }
    if(P.office>=0&&chance(.1+(P.scand>0?.04:0)))scandalFlash(L,P);
  }
  sync(P);
  P.sp=Object.assign({},P.seg);
  P.hist.push(P.approval);if(P.hist.length>12)P.hist.shift();
}
function scandalFlash(L,P){
  // affaire de presse déclenchée plus tard par events() ; ici, simple érosion
  shift(P,[-1,-1,-1,-1]);
}

/* ---------- panneaux de la politique ---------- */
function pPolitics(){
  const L=cur(),P=pol(L),w=W();
  if(L.age<18)return {title:'Politique',html:note('Reviens à ta majorité : il faut avoir 18 ans pour prendre une carte de parti.')};
  if(!P.party){
    return {title:'Politique',html:note('Pour faire carrière, commence par choisir un parti : il te donne des électeurs, des thèmes de prédilection et un peu d’argent.')+group('Partis',(typeof PARTIES!=='undefined'?PARTIES:[]).map(p=>act(L,{ic:'🏛️',t:p,s:px(p).d,min:18,fn:L=>joinParty(L,P,p)})))};
  }
  const H=[];const th=themeOf(w.hot);
  const inOff=P.office>=0;
  const status=inOff?lab(L,P.office):(P.cand!=null?`${ge(L,'Candidat','Candidate')} : ${lab(L,P.cand)}`:'Sans mandat');
  const sub=inOff?(P.office===4?`Au gouvernement · ${fmt(POLS[4].sal)} par an`:`Fin du mandat dans ${An(Math.max(0,P.term))} · ${fmt(POLS[P.office].sal)} par an`):(P.ban>0?`Inéligible encore ${An(P.ban)}`:`Dernier mandat : ${P.prev!=null?lab(L,P.prev).toLowerCase():'aucun'}`);
  H.push(card(P.party,status,sub,stats(P)));
  H.push(note(`À la une : ${th.n.toLowerCase()}. Climat national : ${moodWord(w.mood)}.`));
  if(P.cand!=null){
    const i=P.cand,it=intent(L,P,i);
    H.push(card('Campagne en cours',lab(L,i),`Résultat à la fin de l’année · il faut ${thr(i)} % pour gagner`,statLine('Intentions de vote',it)));
    H.push(group('Faire campagne',[
      nav('💶','Financement','Fonds personnels, dons et contrôle des comptes',pFunds),
      nav('🎤','Meetings et discours','Choisis tes thèmes, cible tes électeurs',pSpeech),
      nav('📺','Médias et terrain','Débats, interviews, porte-à-porte, affiches',pMedia)]));
    H.push(group('',[row({ic:'🏳️',t:'Retirer ma candidature',danger:1,a:()=>pushPanel(confirmP('Retirer ta candidature ?','Les fonds collectés seront perdus et ton équipe sera déçue.',()=>{const q=cur(),p=pol(q);resetCamp(p);p.loy=lim(p.loy-6,0,100);return out(q,'Tu retires ta candidature. Les militants plient les banderoles.')}))})]));
  }else{
    const opts=POLS.map((O,i)=>({O,i})).filter(({O,i})=>!O.appointed&&(i<=P.best+1||(O.k==='president'&&P.best>=3)));
    H.push(group('Se présenter',opts.map(({O,i})=>act(L,{ic:'🗳️',t:`Candidature : ${lab(L,i)}`,s:`Mandat de ${O.term} ans · plafond de dépenses ${fmtk(O.plaf)}`,min:O.min,dis:runMiss(L,P,i),fn:L=>startCamp(L,P,i)}))));
  }
  if(inOff){
    const rows=[
      nav('📜','Politique publique','Réformer sur un thème, une fois par an',pReform),
      nav('🎤','Discours et tournées','Entretenir ta cote auprès des électeurs',pSpeech),
      act(L,{ic:'✂️',t:'Inaugurer quelque chose',s:'Ruban, ciseaux, photographe',key:'pw_inau',fn:L=>{const o=pick(['une médiathèque','un rond-point à fleurs','une piscine municipale','une ligne de tramway','un city-stade','une maison de santé']);shift(P,[.5,1,1,1.5]);sync(P);return out(L,`✂️ Tu coupes le ruban d’${o}. Le buffet est meilleur que le discours.`)}}),
      act(L,{ic:'🪑',t:'Tenir une permanence',s:'Recevoir les habitants',key:'pw_perm',fn:L=>{shift(P,[0,1.5,2.5,.5]);chg(L,{stress:3});sync(P);return out(L,`🪑 Une file d’attente de quarante personnes. Quatre veulent un logement, trois une place en crèche, un seulement un selfie.`)}}),
      act(L,{ic:'📺',t:'Tournée des plateaux',s:'Risque de gaffe en direct',key:'pw_tv',fn:L=>{
        if(chance(.7+L.st.smarts/500)){shift(P,[1.5,1,.5,2]);chg(L,{fame:2});sync(P);return out(L,'📺 Ton passage sur le plateau fait un carton d’audience.')}
        shift(P,[-2,-1.5,-1,-2]);sync(P);return out(L,'📺 Une phrase sortie de son contexte tourne en boucle. Ton service de presse a des cernes.')}}),
      P.office>=1&&P.office<=3?act(L,{ic:'📞',t:'Solliciter un portefeuille',s:'Faire jouer ton réseau pour devenir ministre',key:'pw_sol',fn:L=>{if(nominate(L,P,true))return out(L,'📞 Ton appel porte ses fruits : tu es nommé ministre.');P.loy=lim(P.loy-2,0,100);return out(L,'📞 « On te rappellera », dit-on à l’autre bout du fil. On ne te rappellera pas.')}}):'',
      P.office===5?act(L,{ic:'🎙️',t:'Discours à la nation',s:'Le fameux regard dans la caméra',key:'pw_nation',fn:L=>{const d=R(-3,5);shift(P,[d,d,d,d]);sync(P);return out(L,d>1?'🎙️ Vingt minutes d’allocution : le pays est tout ouïe.':'🎙️ Tout le monde a changé de chaîne au bout de trois minutes.')}}):'',
      P.office===5?act(L,{ic:'🏛️',t:'Dissoudre l’Assemblée',s:'Quitte ou double',key:'pw_diss',danger:1,fn:L=>{if(chance(.5+(P.approval-50)/150)){shift(P,[2,2,2,2]);P.loy=lim(P.loy+6,0,100);sync(P);return out(L,'🏛️ Les Français te donnent une majorité. Tu respires.')}shift(P,[-5,-5,-5,-5]);sync(P);return out(L,'🏛️ Les urnes te renvoient une cohabitation. Ambiance Conseil des ministres : froide.')}}):'',
      act(L,{ic:'💶',t:'Accepter une enveloppe',s:'Illégal',key:'pw_env',danger:1,fn:L=>envelope(L,P)}),
      row({ic:'🚪',t:'Démissionner',danger:1,a:()=>pushPanel(confirmP('Démissionner ?','Tu quittes ton mandat. Tu pourras te représenter.',()=>{const q=cur(),p=pol(q);p.prev=p.office;p.office=-1;p.term=0;p.base=null;return out(q,'Tu démissionnes. Les caméras sont déjà parties.')}))})
    ];
    H.push(group('Exercer le pouvoir',rows));
  }
  H.push(group('Opinion',[nav('📊','Sondages et historique','Segments, tendance et étude d’opinion',pPolls)]));
  const X=px(P.party);
  H.push(group('Parti',[
    card('Loyauté envers ton parti',`${Math.round(P.loy)} %`,P.party==='Indépendant'?'Sans étiquette : pas de consignes de vote, pas d’aide.':`Thème de prédilection : ${X.fav?themeOf(X.fav).n.toLowerCase():'aucun'}.`),
    row({ic:'🔁',t:'Changer de parti',s:'On t’appellera girouette',a:()=>pushPanel(pChangeParty)})]));
  return {title:'Politique',html:H.join('')};
}
function pChangeParty(){
  const L=cur(),P=pol(L);
  return {title:'Changer de parti',html:note('Ta popularité chez les jeunes en prendra un coup, et la confiance de ton nouveau parti sera à reconquérir.')+group('Partis',(typeof PARTIES!=='undefined'?PARTIES:[]).filter(p=>p!==P.party).map(p=>act(L,{ic:'🏛️',t:p,s:px(p).d,key:'pw_party',fn:L=>{STACK.pop();return joinParty(L,P,p)}})))};
}
function envelope(L,P){
  const O=POLS[Math.max(0,P.office)];
  const g=Math.round(R(15000,60000)*(1+P.office*.45)/100)*100;
  if(chance(.28+P.scand*.06)){
    scandalHit(L,P,4,'💥 Une enquête de presse révèle une enveloppe suspecte à ton nom. Ta cote s’effondre.');
    L.record++;
    trial(L,{n:'corruption passive',jail:[0,3],fine:Math.round(g*.8),lawyer:30000+O.sal});
    return '';
  }
  L.money+=g;chg(L,{karma:-8,crime:3});
  return out(L,`💶 Tu empoches ${fmt(g)} sans que personne ne regarde. Tu dors quand même moins bien.`);
}
function pPolls(){
  const L=cur(),P=pol(L),w=W();
  const th=themeOf(w.hot);
  const H=[card('Moyenne des sondages',`${P.approval} %`,`Pondérée pour ${lab(L,refIdx(P)).toLowerCase()}`,stats(P)+(typeof spark==='function'&&P.hist.length>1?`<div style="margin-top:8px">${spark(P.hist)}</div>`:''))];
  H.push(note(`Actualité : ${th.n.toLowerCase()} domine le débat. Les discours sur ce thème portent mieux ce trimestre.`));
  const lines=Object.keys(P.react).slice(-5).map(k=>{const r=P.react[k];return `${themeOf(k).ic} ${themeOf(k).n} : ${SEG.map((s,i)=>`${SEGN[s]} ${sg(r[i])}`).join(' · ')}`});
  if(lines.length)H.push(group('Derniers discours',lines.map(t=>`<p class="note">${esc(t)}</p>`)));
  if(P.hint)H.push(group('Étude d’opinion',[`<p class="note">${esc(`Ton point faible : ${SEGL[P.hint.s].toLowerCase()}. Parle de ${themeOf(P.hint.t).n.toLowerCase()} pour les reconquérir.`)}</p>`]));
  const c=Math.max(300,Math.round(POLS[ctxIdx(P)].plaf*.02/10)*10);
  H.push(group('Commander',[act(L,{ic:'📈',t:'Étude d’opinion',s:`${fmt(c)} · révèle ton point faible et le meilleur thème`,key:'pw_etude',cost:c,fn:L=>{
    const weak=SEG.slice().sort((a,b)=>P.seg[a]-P.seg[b])[0];const j=SEG.indexOf(weak);
    const best=THEMES.slice().sort((a,b)=>b.m[j]-a.m[j])[0];
    P.hint={s:weak,t:best.k};
    return out(L,`📈 L’institut est formel : ${SEGL[weak].toLowerCase()} te boudent. Un bon sujet pour eux : ${best.n.toLowerCase()}.`)}})]));
  return {title:'Sondages',html:H.join('')};
}
function pSpeech(){
  const L=cur(),P=pol(L),w=W();const i=ctxIdx(P);const c=meetCost(i);
  const rows=THEMES.map(t=>act(L,{ic:t.ic,t:`${t.n}${t.k===w.hot?' · à la une':''}${t.k===P.theme?' · ton thème':''}`,s:`${t.q} · ${fmt(c)}`,min:18,key:'pw_m_'+t.k,dis:canPay(L,P,c)?'':'Fonds insuffisants',fn:L=>meeting(L,P,t)}));
  let html=note('Chaque thème résonne différemment selon les électorats. Rester sur un même thème t’apporte de la crédibilité ; en changer sans cesse fait de toi une girouette.');
  if(P.theme)html+=note(`Ton thème actuel : ${themeOf(P.theme).n.toLowerCase()}.${P.flips>1?' On commence à te trouver changeant.':''}`);
  html+=group('Meetings',rows);
  const lines=Object.keys(P.react).slice(-4).map(k=>`${themeOf(k).ic} ${themeOf(k).n} : ${SEG.map((s,j)=>`${SEGN[s]} ${sg(P.react[k][j])}`).join(' · ')}`);
  if(lines.length)html+=group('Ce qui a marché',lines.map(t=>`<p class="note">${esc(t)}</p>`));
  return {title:'Meetings et discours',html};
}
function pMedia(){
  const L=cur(),P=pol(L);const i=ctxIdx(P),O=POLS[i];
  const camp=(v)=>{P.camp=lim(P.camp+v*(P.mgr?1.2:1),0,30)};
  const ad=(f,lo,hi,ic,t,s,key)=>{const c=Math.round(O.plaf*f/10)*10;return act(L,{ic,t,s:`${s} · ${fmt(c)}`,key,dis:P.cand==null?'Pendant la campagne':(canPay(L,P,c)?'':'Fonds insuffisants'),fn:L=>{pay(L,P,c);const v=R(lo,hi);camp(v);return out(L,`${ic} ${t} : +${v} point${v>1?'s':''} d’intentions de vote.`)}})};
  const live=P.cand==null?'Pendant la campagne':'';
  const rows=[
    act(L,{ic:'📺',t:'Débat télévisé',s:'Ton aplomb fait la différence',key:'pw_deb',dis:live,fn:L=>{const d=(L.st.smarts-50)/7+(L.hid.willpower-50)/14+R(-6,8);camp(d*.7);if(d>0)chg(L,{fame:2});return out(L,d>3?'📺 Tu remportes le débat haut la main. Ton adversaire a perdu son sourire.':d>-2?'📺 Un débat sans vainqueur, mais sans casse.':'📺 Une gaffe en direct. Les réseaux s’en donnent à cœur joie.')}}),
    act(L,{ic:'📻',t:'Interview à la radio du matin',s:'Trois questions piégées',key:'pw_radio',dis:live,fn:L=>{const d=R(-2,5)+L.st.smarts/40+(themeOf(W().hot).k===P.theme?2:0);camp(d*.6);return out(L,d>3?'📻 Ta réponse sur le carburant devient la citation du jour.':'📻 L’intervieweur te coupe trois fois, mais tu tiens.')}}),
    act(L,{ic:'📱',t:'Vidéo sur les réseaux sociaux',s:'Viral ou plat',key:'pw_vid',dis:live,fn:L=>{if(chance(.5)){const v=R(3,7);camp(v);shift(P,[2,0,0,1]);return out(L,`📱 Ta vidéo fait ${R(2,9)} millions de vues. Les jeunes te suivent.`)}shift(P,[-2,0,0,-.5]);return out(L,'📱 Ta vidéo est moquée dans tous les mèmes. Les jeunes rient, mais pas avec toi.')}}),
    act(L,{ic:'🚪',t:'Porte-à-porte',s:'Tu serres des centaines de mains',key:'pw_porte',dis:live,fn:L=>{camp(R(1,4));shift(P,[0,.5,1.5,.5]);chg(L,{health:-1});return out(L,'🚪 Trois chiens, une tarte aux pommes et une conversation d’une heure sur les poubelles.')}}),
    act(L,{ic:'🥬',t:'Marché du samedi matin',s:'Du fromage et des poignées de main',key:'pw_marche',dis:live,fn:L=>{camp(R(1,3));shift(P,[0,2,1,0]);return out(L,'🥬 Les retraités t’offrent des pommes. Tu repars avec trois kilos de légumes.')}}),
    act(L,{ic:'🚇',t:'Tractage à la sortie du métro',s:'Les urbains pressés',key:'pw_tract',dis:live,fn:L=>{camp(R(1,3));shift(P,[1,0,-.5,1.5]);return out(L,'🚇 La moitié de tes tracts finit dans la poubelle, l’autre sert d’éventail.')}}),
    ad(.05,2,3,'📰','Affiches et tracts','Papier glacé','pw_aff'),
    ad(.12,3,5,'📻','Spots radio','Saturer les ondes','pw_spot'),
    ad(.25,5,9,'🎬','Clip télé et campagne en ligne','Le gros calibre','pw_clip'),
    act(L,{ic:'🧑‍💼',t:'Engager un directeur de campagne',s:`${fmt(Math.round(O.plaf*.04))} · +20 % sur tes actions de campagne`,key:'pw_mgr',dis:live||(P.mgr?'Déjà engagé':(canPay(L,P,Math.round(O.plaf*.04))?'':'Fonds insuffisants')),fn:L=>{pay(L,P,O.plaf*.04);P.mgr=1;return out(L,'🧑‍💼 Un vieux briscard de dix campagnes prend les rênes de ton équipe.')}})
  ];
  return {title:'Médias et terrain',html:note('Les actions de campagne gonflent tes intentions de vote. Elles s’ajoutent à l’état de ton opinion dans chaque segment.')+card('Intentions de vote',`${intent(L,P,i)} %`,`Victoire à partir de ${thr(i)} %`)+group('Actions',rows)};
}
function pFunds(){
  const L=cur(),P=pol(L);const i=ctxIdx(P),O=POLS[i];
  const plaf=O.plaf,dc=donCap(i);
  const live=P.cand==null?'Pendant la campagne':'';
  const don=(f,lo,hi,cost,ic,t,s,key,karma)=>act(L,{ic,t,s:`${s}${cost?` · coût ${fmt(Math.round(plaf*cost))}`:''}`,key,dis:live||(cost&&L.money<plaf*cost?'Fonds insuffisants':''),fn:L=>{
    if(cost)spend(L,Math.round(plaf*cost));
    const v=Math.round(plaf*R(lo,hi)/100/10)*10*f;P.funds+=v;P.don+=v;if(karma)chg(L,{karma});
    return out(L,`💶 ${t} : ${fmt(v)} collectés.`)}});
  const perso=f=>act(L,{ic:'👛',t:`Apporter ${Math.round(f*100)} % du plafond`,s:`${fmt(Math.round(plaf*f))} de ta poche`,cost:Math.round(plaf*f),dis:live,fn:L=>{const v=Math.round(plaf*f);P.funds+=v;P.perso+=v;return out(L,`👛 Tu verses ${fmt(v)} dans les caisses de campagne.`)}});
  const ratioD=lim(P.don/dc*100,0,100),ratioS=lim(P.spent/plaf*100,0,100);
  const html=note('Les dons sont plafonnés par la loi, tout comme les dépenses. La Commission des comptes de campagne vérifie tout après l’élection : dépasser un plafond, ou cacher de l’argent, déclenche un scandale.')
    +card('Plafond légal des dons',fmt(dc),`Déclarés : ${fmt(P.don)} · dépenses : ${fmt(P.spent)} / ${fmt(plaf)}`,statLine('Dons déclarés (plafond)',ratioD)+statLine('Dépenses (plafond)',ratioS))
    +card('Fonds de campagne disponibles',fmt(P.funds),P.black>0?'Dont de l’argent non déclaré. On ne sait jamais.':'Argent propre jusqu’à preuve du contraire.')
    +group('Fonds personnels',[perso(.1),perso(.25),perso(.5)])
    +group('Collecter des dons (déclarés)',[
      don(1,2,6,0,'🤳','Cagnotte en ligne','Quelques centaines de petits dons','pw_cagnotte',0),
      don(1,5,12,.03,'🥂','Dîner de collecte','Un traiteur, des notables','pw_diner',0),
      don(1,10,18,0,'🏢','Mécènes et entreprises','Ils attendent un retour d’ascenseur','pw_mecenes',-2),
      act(L,{ic:'🏛️',t:'Aide du parti',s:P.party&&P.party!=='Indépendant'?`Selon ta loyauté (${Math.round(P.loy)} %)`:'Réservé aux membres d’un parti',key:'pw_aide',dis:live||(!P.party||P.party==='Indépendant'?'Pas de parti':P.loy<50?'Loyauté insuffisante':''),fn:L=>{const v=Math.round(plaf*(.08+P.loy/1000)/10)*10;P.funds+=v;P.don+=v;P.loy=lim(P.loy-4,0,100);return out(L,`🏛️ Le parti t’envoie ${fmt(v)} et une liste de consignes.`)}})])
    +group('Zone grise',[act(L,{ic:'💼',t:'Dons en liquide, sans reçu',s:'Illégal · détecté à la vérification des comptes, parfois',key:'pw_noir',danger:1,dis:live,fn:L=>{const v=Math.round(plaf*R(10,20)/100/10)*10;P.funds+=v;P.black+=v;chg(L,{karma:-6,crime:2});return out(L,`💼 Une enveloppe kraft arrive discrètement : ${fmt(v)} en petites coupures.`)}})]);
  return {title:'Financement de campagne',html};
}
function pReform(){
  const L=cur(),P=pol(L);
  const O=POLS[P.office>=0?P.office:1];
  const rows=THEMES.map(t=>act(L,{ic:t.ic,t:t.n,s:`${t.q}`,key:'pw_ref',dis:P.office<0?'Il faut un mandat':'',fn:L=>{
    const ok=chance(lim(.55+(L.st.smarts-50)/300+(P.approval-50)/300,.2,.9));
    if(ok){const g=2.2*(t.k===W().hot?1.3:1);SEG.forEach((s,j)=>{P.seg[s]=lim(P.seg[s]+t.m[j]*g*.9,3,97)});P.react[t.k]=t.m.map(v=>Math.round(v*g*.9));sync(P);chg(L,{stress:3});
      return out(L,`📜 Ta réforme « ${t.n.toLowerCase()} » est adoptée. ${reaction(t.m.map(v=>v*g*.9))}`)}
    shift(P,[-1,-1,-1,-1]);P.loy=lim(P.loy-1,0,100);sync(P);
    return out(L,`📜 Ta réforme « ${t.n.toLowerCase()} » est bloquée ${pick(['par l’opposition','par le Conseil constitutionnel','par une grève surprise','par un amendement mystérieux'])}.`)}}));
  return {title:'Politique publique',html:note(`Une réforme par an ${O.lieu}. Elle améliore ou dégrade ta cote selon les segments, et peut échouer.`)+group('Thèmes',rows)};
}

/* ---------- votes de lois ---------- */
function applyVote(L,P,law,v){
  const k=v==='pour'?1:v==='contre'?-.7:-.15;
  SEG.forEach((s,i)=>{P.seg[s]=lim(P.seg[s]+law.e[i]*k*.9,3,97)});
  const idx=pidx(P.party),st=idx>=0?(law.p[idx]||0):0;
  let ltxt='';
  if(P.party!=='Indépendant'){
    if((v==='pour'&&st>0)||(v==='contre'&&st<0)){P.loy=lim(P.loy+5,0,100);ltxt=' Ton parti applaudit.'}
    else if((v==='pour'&&st<0)||(v==='contre'&&st>0)){P.loy=lim(P.loy-7,0,100);ltxt=' Le chef de ton parti te lance un regard noir.'}
    else if(v==='abstention')P.loy=lim(P.loy-1,0,100);
  }
  P.laws++;track(L,'votes');sync(P);
  const d=law.e.map(x=>x*k*.9);
  return out(L,`📜 ${v==='pour'?'Pour':v==='contre'?'Contre':'Abstention'} : « ${law.n} ». ${reaction(d)}${ltxt}`);
}
function voteLaw(L,P){
  const lv=P.office>=3?1:0;
  const law=pick(LAWS.filter(x=>x.lv===lv));
  const o=P.office;
  const lbl=o===4?['Défendre le texte','Demander son retrait','Laisser le Parlement trancher']:o===5?['Promulguer la loi','Renvoyer le texte au Parlement','Saisir le Conseil constitutionnel']:['Voter pour','Voter contre','S’abstenir'];
  modal({title:o>=3?'Vote au Parlement':'Délibération',icon:'📜',text:`${law.n}.\n${law.t}\nCe texte te vaudra des louanges chez certains, et des reproches chez d’autres.`,choices:[
    {t:lbl[0],pri:1,fn:()=>applyVote(L,P,law,'pour')},
    {t:lbl[1],fn:()=>applyVote(L,P,law,'contre')},
    {t:lbl[2],fn:()=>applyVote(L,P,law,'abstention')}]});
}
function pressStory(L,P){
  const story=pick([
    ['Une facture de restaurant de 3 400 € dont une grande partie en homards fuite dans la presse.','la facture'],
    ['Ton ancien collaborateur raconte à la télévision des déjeuners très arrosés aux frais de la République.','le déjeuner'],
    ['Un hebdomadaire révèle que ton chauffeur de fonction avait aussi un autre employeur : toi, pour ses courses.','le chauffeur'],
    ['Une photo de toi en vacances sur un yacht prêté par un « ami » circule sur les réseaux.','le yacht']]);
  modal({title:'Révélations dans la presse',icon:'📰',text:story[0],choices:[
    {t:'Rembourser et présenter des excuses',fn:()=>{spend(L,Math.round(R(2000,8000)));chg(L,{karma:2});shift(P,[-.5,-.5,-.5,-.5]);sync(P);return out(L,'📰 Tes excuses sont jugées sincères. L’affaire s’éteint en deux jours.')}},
    {t:'Tout démentir',fn:()=>{if(chance(.5)){sync(P);return out(L,'📰 Le démenti passe. L’affaire s’éteint.')}return scandalHit(L,P,3,`📰 Le démenti s’effondre : ${story[1]} devient ton cauchemar du mois.`)}},
    {t:'Attaquer le journal en diffamation',fn:()=>{spend(L,3000);if(chance(.4)){shift(P,[1,1,1,1]);sync(P);return out(L,'📰 Le tribunal te donne raison. Le journal s’excuse en petits caractères.')}return scandalHit(L,P,2,'📰 La plainte est perçue comme une tentative de censure. Mauvaise idée.')}}]});
}

/* =====================================================================
   CRIME ORGANISÉ : données
   ===================================================================== */
const RANKS=['Associé','Soldat','Capitaine','Sous-chef','Parrain'];
const RANKF=['Associée','Soldat','Capitaine','Sous-cheffe','Marraine'];
const RTHR=[0,25,60,110,180];
const CUT=[.6,.5,.4,.25,.05];
const CREWMAX=[2,4,6,8,12];
const WAGE=6000,RETAINER=8000;
const FAMX=[
 {z:'les calanques',s:'trafic de contrefaçons et de poissons « tombés du camion »'},
 {z:'le vieux quartier',s:'restaurants, cercles de jeux et pizzas à emporter'},
 {z:'le port',s:'containers égarés et dockers très discrets'},
 {z:'les cités',s:'recel, scooters et petites coupures'},
 {z:'les berges du canal',s:'bars de nuit, péniches et fêtes sans autorisation'}
];
const KINDS=[
 {n:'Bar-tabac',ic:'🚬',pot:[3000,9000],res:[25,60]},{n:'Boulangerie',ic:'🥖',pot:[1500,5000],res:[15,45]},
 {n:'Pizzeria',ic:'🍕',pot:[2500,7000],res:[20,55]},{n:'Kebab',ic:'🥙',pot:[2000,6000],res:[20,55]},
 {n:'Pressing',ic:'🧺',pot:[1500,4500],res:[15,40]},{n:'Garage automobile',ic:'🔧',pot:[6000,15000],res:[35,70]},
 {n:'Restaurant gastronomique',ic:'🍽️',pot:[9000,25000],res:[40,75]},{n:'Boîte de nuit',ic:'🪩',pot:[12000,35000],res:[50,85]},
 {n:'Bijouterie',ic:'💍',pot:[8000,20000],res:[45,80]},{n:'Supérette',ic:'🛒',pot:[3000,8000],res:[25,55]},
 {n:'Salon de coiffure',ic:'✂️',pot:[1500,4000],res:[15,40]},{n:'Fleuriste',ic:'💐',pot:[1200,3500],res:[10,35]},
 {n:'Concession automobile',ic:'🚗',pot:[15000,40000],res:[55,90]}
];
const SHOPN=['Chez Dédé','Le Marseillais','La Belle Époque','Le Petit Marcel','Chez Mamie','Le Fiacre','La Bonne Étoile','L’Étoile du Nord','Chez Momo','Le Select','Au Rendez-vous','Le Cadran','Les Trois Frères','La Boule d’Or'];
const HEISTS=[
 {k:'sac',n:'Vol à la tire dans le métro',ic:'👜',rank:0,gain:[300,2500],risk:.10,heat:3,crew:0,resp:2,jail:[0,1]},
 {k:'cambr',n:'Cambriolage d’une villa',ic:'🏚️',rank:0,gain:[4000,18000],risk:.18,heat:6,crew:1,resp:4,jail:[1,2]},
 {k:'bijou',n:'Braquage d’une bijouterie',ic:'💎',rank:1,gain:[25000,90000],risk:.30,heat:16,crew:2,resp:9,jail:[3,8]},
 {k:'camion',n:'Détournement d’un camion de marchandises',ic:'🚚',rank:1,gain:[20000,70000],risk:.26,heat:12,crew:2,resp:8,jail:[2,6]},
 {k:'entrepot',n:'Casse d’un entrepôt logistique',ic:'🏭',rank:2,gain:[40000,150000],risk:.30,heat:18,crew:3,resp:12,jail:[3,8]},
 {k:'fourgon',n:'Coup du siècle : fourgon blindé',ic:'🚐',rank:3,gain:[120000,400000],risk:.42,heat:28,crew:4,resp:22,jail:[6,14]}
];
const MISSIONS=[
 {n:'Récupérer une dette',ic:'🧾',rank:0,gain:[1500,9000],risk:.10,resp:4,heat:3},
 {n:'Convoyer un colis sans poser de questions',ic:'📦',rank:0,gain:[2500,12000],risk:.14,resp:5,heat:5},
 {n:'Organiser une partie de cartes clandestine',ic:'🃏',rank:1,gain:[3000,16000],risk:.12,resp:6,heat:4},
 {n:'Convaincre un témoin d’avoir mauvaise mémoire',ic:'🤫',rank:1,gain:[2000,14000],risk:.18,resp:8,heat:8},
 {n:'Surveiller une bande rivale',ic:'🔭',rank:2,gain:[0,0],risk:.10,resp:7,heat:3}
];
const MOLE_TELLS=[
 'Pose beaucoup trop de questions sur les dates et les lieux.',
 'Disparaît toujours juste avant les coups, sans explication.',
 'Son téléphone sonne à des heures bizarres : il s’enferme pour répondre.',
 'Dépense plus qu’il ne gagne, mais jamais là où on le voit.',
 'Prend des notes dans un petit carnet qu’il cache dès qu’on approche.',
 'S’est montré étrangement curieux de ta planque.',
 'Évite soigneusement les photos de groupe.'
];
const DECOYS=[
 'Ronfle comme un tracteur : on l’entend à trois pièces.',
 'A un cousin gendarme (mais ils ne se parlent plus).',
 'Cache une liaison avec la sœur d’un rival.',
 'Joue aux courses : il est toujours fauché.',
 'Lit des romans policiers en cachette.',
 'Rentre tard parce qu’il fait des heures sup’ à la boulangerie de sa tante.',
 'Fait des selfies tout le temps (mais ne les publie jamais).'
];
const ROLES=['Guetteur','Chauffeur','Cogneur','Perceur de coffres','Faussaire','Informaticien','Livreur','Cerveau'];
const NICKS=['Le Gros','Lunettes','Pitbull','Fantôme','Tonton','Le Belge','Doudou','Cigogne','Dentelle','Pépé','Mini','Le Comptable','Roudoudou','Marteau'];

/* ---------- état du milieu ---------- */
function mob(L){
  let M=L.mob;
  if(!M||typeof M!=='object')return null;
  if(M.mv!==2){
    const old=lim(Math.round(nn(M.rank,0)),0,5);
    M.rank=[0,1,2,2,3,4][old];
    M.resp=Math.max(nn(M.resp,0),RTHR[M.rank]);
    M.heat=lim(nn(M.heat,0)*12,0,100);
    M.mv=2;
  }
  M.rank=lim(Math.round(nn(M.rank,0)),0,4);
  if(typeof M.fam!=='string')M.fam=(typeof MOB_FAMILIES!=='undefined'&&MOB_FAMILIES[0])||'La Famille';
  M.resp=nn(M.resp,0);M.heat=lim(nn(M.heat,0),0,100);M.loy=lim(nn(M.loy,60),0,100);
  if(!Array.isArray(M.crew))M.crew=[];
  M.crew=M.crew.filter(c=>c&&typeof c==='object'&&c.id!=null);
  M.crew.forEach(c=>{c.loy=nn(c.loy,60);c.skill=nn(c.skill,50);if(!c.first)c.first=rname('H','France');if(!c.role)c.role=pick(ROLES);if(c.nick===undefined)c.nick=pick(NICKS)});
  if(!Array.isArray(M.targets))M.targets=null;
  if(M.city===undefined)M.city=null;
  M.prep=nn(M.prep,0);M.lawyer=nn(M.lawyer,0);M.cop=nn(M.cop,0);M.wait=nn(M.wait,0);
  if(M.opY===undefined)M.opY=null;
  return M;
}
function famX(f){const i=typeof MOB_FAMILIES!=='undefined'?MOB_FAMILIES.indexOf(f):-1;return FAMX[(i<0?0:i)%FAMX.length]}
const rk=(L,i)=>(L.gender==='F'?RANKF:RANKS)[i];
function genTarget(){
  const K=pick(KINDS);
  return {id:nid(),n:`${K.n} « ${pick(SHOPN)} »`,k:K.n,ic:K.ic,pot:Math.round(R(K.pot[0],K.pot[1])/100)*100,res:R(K.res[0],K.res[1]),st:0,tr:0,y:0};
}
function targets(L,M){
  if(!Array.isArray(M.targets)||M.city!==L.city||M.targets.length<4){
    M.city=L.city;M.targets=[];for(let i=0;i<8;i++)M.targets.push(genTarget());
  }
  M.targets.forEach(T=>{T.st=nn(T.st,0);T.tr=nn(T.tr,0);T.res=nn(T.res,40);T.pot=nn(T.pot,3000);T.y=nn(T.y,0)});
  return M.targets;
}
const payingOf=M=>(M.targets||[]).filter(T=>T.st===1);
const grossOf=M=>payingOf(M).reduce((s,T)=>s+T.tr,0);
function newCrew(L,M){
  const g=chance(.8)?'H':'F';
  const c={id:nid(),first:rname(g,'France'),g,nick:pick(NICKS),role:pick(ROLES),skill:R(30,90),loy:R(45,85),mole:false,tell:'',obs:null};
  if(chance(.1+M.heat/700)){c.mole=true;c.tell=chance(.8)?pick(MOLE_TELLS):'';if(M.opY==null)M.opY=R(2,4)}
  else if(chance(.3))c.tell=pick(DECOYS);
  return c;
}
const moleOf=M=>M.crew.find(c=>c.mole);
function charge(M,n,lo,hi,fine){
  const k=M&&M.lawyer?1:0;
  return {n,jail:[Math.max(0,lo-k),Math.max(1,hi-k*2)],fine,lawyer:Math.round(fine*1.5)+10000};
}
function addHeat(L,M,n){M.heat=lim(M.heat+n,0,100)}
function newMob(L,f){
  const heir=L.powerLegacy&&L.powerLegacy.fam===f;
  return {mv:2,fam:f,rank:0,resp:heir?20:5,loy:heir?70:55,heat:0,crew:[],targets:null,city:null,prep:0,lawyer:0,cop:0,opY:null,wait:0};
}
function promoCheck(L,M){return M.rank<4&&M.resp>=RTHR[M.rank+1]}

/* ---------- année du milieu ---------- */
function raid(L,M){
  const m=moleOf(M);
  const nm=m?m.first:'ton ancien homme de confiance';
  const half=Math.floor(M.crew.length/2);
  M.crew=M.crew.filter(c=>!c.mole);
  for(let i=0;i<half;i++)M.crew.splice(R(0,Math.max(0,M.crew.length-1)),1);
  M.opY=null;
  const C=charge(M,'participation à une organisation criminelle',3+M.rank,9+M.rank*2,40000+M.rank*20000);
  if(M.cop){C.jail=[Math.max(0,C.jail[0]-1),Math.max(1,C.jail[1]-3)]}
  M.heat=35;
  say(L,`🚨 Coup de filet : ${nm} était un indic infiltré. Les policiers sonnent chez toi à l’aube.`);
  modal({title:'Coup de filet',icon:'🚨',text:`Des mois d’écoutes et un indic infiltré (${nm}) : la police débarque à l’aube chez toi et dans la moitié de ton équipe.${M.cop?' Ton contact au commissariat t’avait prévenu trop tard.':''}`,choices:[
    {t:'Te laisser interpeller',pri:1,fn:()=>{trial(L,C);return ''}},
    {t:'Tenter de filer par les toits',fn:()=>{
      if(chance(.3+L.hid.athletic/300)){M.resp=Math.max(0,M.resp-10);M.heat=40;chg(L,{karma:-2});return out(L,'🏃 Tu files sur les toits sous la pluie. Tu es en cavale, mais libre.')}
      C.jail=[C.jail[0]+1,C.jail[1]+2];trial(L,C);return out(L,'🏃 Ta cavale s’arrête sur une tuile glissante.')}}]});
}
function arrestTrial(L,M){
  const C=charge(M,pick(['association de malfaiteurs','recel en bande organisée','extorsion']),1+Math.floor(M.rank/2),4+M.rank*2,20000+M.rank*8000);
  M.heat=Math.max(15,M.heat-25);
  say(L,'🚔 Perquisition à l’aube : la brigade criminelle te passe les menottes.');
  trial(L,C);
}
function mobYear(L){
  if(!L.mob)return;
  const M=mob(L);if(!M)return;
  if(L.prison){M.heat=lim(M.heat-10,0,100);return}
  targets(L,M);
  M.heat=lim(M.heat-8-(M.cop?6:0)+M.rank*1,0,100);
  M.prep=0;
  /* rackets */
  let lost=0;
  M.targets.forEach(T=>{if(T.st===1){if(chance(T.res/350)){T.st=0;T.tr=0;T.res=Math.min(95,T.res+6);lost++}else T.y++}else if(T.st===2&&chance(.3)){T.st=0}});
  const gross=grossOf(M),share=Math.round(gross*(1-CUT[M.rank]));
  if(share>0){earn(L,share,1);say(L,`🎩 Les commerçants « protégés » rapportent ${fmt(gross)} ; ta part, après le tribut à la famille : ${fmt(share)}.`)}
  if(lost)say(L,`${lost>1?lost+' commerçants arrêtent':'Un commerçant arrête'} de payer.`);
  if(M.targets.length<10&&chance(.7))M.targets.push(genTarget());
  if(M.targets.length>11){const free=M.targets.findIndex(T=>T.st===0);if(free>=0)M.targets.splice(free,1)}
  if(M.rank>=3){const d=R(8000,24000)*(M.rank-2);earn(L,d,1);say(L,`🎩 La part de la famille te rapporte ${fmt(d)}.`)}
  /* équipe */
  const wages=M.crew.length*WAGE;
  if(wages>0){
    if(L.money>=wages){spend(L,wages);M.crew.forEach(c=>{c.loy=lim(c.loy+2,0,100)})}
    else{M.crew.forEach(c=>{c.loy=lim(c.loy-8,0,100)});say(L,'Tes hommes n’ont pas été payés. L’ambiance est électrique.')}
  }
  if(M.lawyer){if(L.money>=RETAINER)spend(L,RETAINER);else{M.lawyer=0;say(L,'Tu ne peux plus payer l’avocat de la famille.')}}
  for(const c of M.crew.slice()){
    if(c.loy<20&&chance(.35)){M.crew=M.crew.filter(x=>x!==c);addHeat(L,M,8);say(L,`${c.first} « ${c.nick} » claque la porte en emportant des informations.`)}
  }
  if(M.heat>50&&M.crew.length&&chance(.15)){const c=pick(M.crew);M.crew=M.crew.filter(x=>x!==c);say(L,`${c.first} « ${c.nick} » est interpellé${c.g==='F'?'e':''} à un contrôle routier.`);if(c.mole===false&&chance(.3))addHeat(L,M,4)}
  /* loyauté de la famille */
  M.loy=lim(M.loy+(55-M.loy)*.1,0,100);
  /* attente de la succession */
  if(M.wait&&M.rank===3&&M.resp>=RTHR[4]&&chance(.25)){M.rank=4;M.wait=0;M.loy=70;track(L,'parrain');say(L,`🎩 Le vieux parrain prend sa retraite en Corse : tu deviens ${ge(L,'le nouveau parrain','la nouvelle marraine')} de ${M.fam}.`)}
  /* indic */
  let raided=false;
  if(moleOf(M)){
    M.opY=(M.opY==null?3:M.opY)-1;addHeat(L,M,6);
    if(M.opY<=0){raided=true;raid(L,M)}
  }else if(M.crew.length&&M.heat>=25&&chance(.05+M.heat/450)){
    const c=pick(M.crew);c.mole=true;c.tell=chance(.8)?pick(MOLE_TELLS):'';M.opY=R(2,4);
  }
  /* arrestation */
  if(!raided&&M.heat>=45&&chance((M.heat-35)/220))arrestTrial(L,M);
}

/* ---------- panneaux du milieu ---------- */
function joinTest(L,f){
  const X=famX(f);
  const heir=L.powerLegacy&&L.powerLegacy.fam===f;
  const base=.25+(L.record?.25:0)+(50-L.hid.karma)/200+(L.hid.crime||0)/400+(heir?.35:0);
  const res=(b,txt)=>()=>{
    if(chance(lim(base+b,.05,.9))){L.mob=newMob(L,f);chg(L,{karma:-5,crime:4});return out(L,`🎩 ${f} t’accepte comme associé${ge(L,'','e')}. ${txt}`)}
    return out(L,`🎩 ${f} ne te fait pas confiance. « On te rappellera. » Personne ne te rappellera.`);
  };
  modal({title:f,icon:'🎩',text:`Un homme en veste de cuir t’a donné rendez-vous ${pick(['derrière une pizzeria','dans l’arrière-salle d’un bar-tabac','sur un quai désert','dans une boucherie fermée'])}. « ${pick(['On dit que tu sais te taire.','Ici, on ne pose pas de questions.','On cherche quelqu’un de fiable. Tu l’es ?'])} » La famille tient ${X.z} : ${X.s}.`,choices:[
    {t:'Garder un sac pendant une nuit, sans l’ouvrir',pri:1,fn:res(.12,'Tu n’as pas ouvert le sac. C’est exactement ce qu’on attendait.')},
    {t:'Rendre un petit service à un « ami de la famille »',fn:res(.05,'Un petit service, un grand début.')},
    {t:'Offrir un café et ta bonne volonté',fn:res(-.05,'Ils apprécient les bonnes manières.')},
    {t:'Repartir sans rien dire',fn:()=>'Tu changes de trottoir. Prudent.'}]});
  return '';
}
function pMob(){
  const L=cur();
  if(L.age<18)return {title:'Le milieu',html:note('Les familles ne recrutent pas les mineurs. Pas encore.')};
  const M=mob(L);
  if(!M){
    const fams=(typeof MOB_FAMILIES!=='undefined'?MOB_FAMILIES:[]);
    return {title:'Le milieu',html:note('Les familles du milieu recrutent les gens qui savent se taire. Un casier judiciaire est un plus, la discrétion est obligatoire.')+group('Familles',fams.map(f=>act(L,{ic:'🎩',t:f,s:`Active ${famX(f).z}`,min:18,key:'pw_join',fn:L=>joinTest(L,f)})))};
  }
  targets(L,M);
  const gross=grossOf(M),share=Math.round(gross*(1-CUT[M.rank]));
  const next=M.rank<4?`Respect pour ${rk(L,M.rank+1).toLowerCase()} : ${M.resp} / ${RTHR[M.rank+1]}`:'Tu es au sommet';
  const alert=M.heat>=70?'La police est sur tes talons !':M.heat>=45?'Tu sens des regards dans la rue.':M.heat>=20?'Quelques voitures banalisées, rien de grave.':'Tout est calme.';
  const H=[];
  H.push(card(M.fam,rk(L,M.rank),`${next} · Loyauté de la famille : ${Math.round(M.loy)} %`,statLine('Discrétion',100-M.heat)+`<p class="note">${esc(alert)}</p>`));
  H.push(group('Le business',[
    nav('🏪','Racket',`${payingOf(M).length} commerce${payingOf(M).length>1?'s':''} · ta part : ${fmt(share)} par an`,pRacket),
    nav('🧨','Coups de rue','Bijouteries, camions, entrepôts',pHeists),
    nav('👥','Ton équipe',`${M.crew.length} / ${CREWMAX[M.rank]} homme${CREWMAX[M.rank]>1?'s':''} de main${moleOf(M)&&M.heat>=30?' · quelque chose cloche…':''}`,pCrew)]));
  H.push(group('Commissions de la famille',MISSIONS.map((J,i)=>act(L,{ic:J.ic,t:J.n,s:J.gain[1]?`Gain : ${fmt(J.gain[0])} à ${fmt(J.gain[1])}`:`Pour le respect de la famille`,key:'pw_mi'+i,dis:M.rank<J.rank?`Dès le rang de ${rk(L,J.rank).toLowerCase()}`:'',fn:L=>mission(L,M,J)}))));
  const promo=[];
  if(M.rank<3)promo.push(act(L,{ic:'📈',t:'Demander une promotion',s:promoCheck(L,M)?`Passer ${rk(L,M.rank+1).toLowerCase()}`:next,key:'pw_promo',dis:promoCheck(L,M)?'':`Il te faut ${RTHR[M.rank+1]} de respect`,fn:L=>{
    if(chance(lim(.55+M.loy/250,.3,.95))){M.rank++;M.loy=lim(M.loy+5,0,100);chg(L,{happy:6});return out(L,`🎩 Après un déjeuner interminable, tu deviens ${rk(L,M.rank).toLowerCase()}.`)}
    M.loy=lim(M.loy-3,0,100);return out(L,'🎩 « Pas encore », dit le parrain en resservant du vin.')}}));
  else if(M.rank===3)promo.push(act(L,{ic:'👑',t:'Prendre la tête de la famille',s:promoCheck(L,M)?'Un coup à ne pas rater':`Il te faut ${RTHR[4]} de respect`,key:'pw_succ',danger:1,dis:promoCheck(L,M)?'':`Il te faut ${RTHR[4]} de respect`,fn:L=>succession(L,M)}));
  if(M.rank===4){
    promo.push(act(L,{ic:'💼',t:'Faire payer une taxe',s:'Une taxe en plus sur tous les territoires',key:'pw_dime',fn:L=>{const d=R(15000,40000);earn(L,d,1);addHeat(L,M,8);M.loy=lim(M.loy-3,0,100);track(L,'crimes');chg(L,{karma:-3,crime:2});return out(L,`💼 Tes capitaines apportent ${fmt(d)}. Certains font la grimace.`)}}));
    promo.push(act(L,{ic:'🍷',t:'Réunir la Commission',s:'Arbitrer les querelles de territoires',key:'pw_commission',fn:L=>{const d=R(2,6);M.loy=lim(M.loy+d,0,100);M.crew.forEach(c=>{c.loy=lim(c.loy+d,0,100)});return out(L,'🍷 Autour d’une longue table, tu tranches trois litiges et un désaccord sur le dessert. Le respect grandit.')}}));
  }
  H.push(group('Hiérarchie',promo));
  H.push(group('Discrétion',[
    act(L,{ic:'🏖️',t:'Se mettre au vert',s:'Baisse la chaleur, rapporte moins',key:'pw_vert',fn:L=>{addHeat(L,M,-30);M.resp=Math.max(0,M.resp-2);return out(L,'🏖️ Tu passes quelques mois à pêcher à Palavas. La police t’oublie un peu.')}}),
    act(L,{ic:'🕶️',t:'Graisser la patte d’un policier',s:`${fmt(10000)} · la chaleur baisse, et il te prévient parfois`,cost:10000,key:'pw_cop',danger:1,fn:L=>{if(chance(.8)){M.cop=1;addHeat(L,M,-20);chg(L,{karma:-3});return out(L,'🕶️ Un brigadier compréhensif accepte l’enveloppe. Il n’a rien vu, comme d’habitude.')}addHeat(L,M,10);return out(L,'🕶️ Le policier refuse et note ta plaque. Mauvaise pioche.')}}),
    act(L,{ic:'⚖️',t:M.lawyer?'Résilier l’avocat de la famille':'Payer l’avocat de la famille',s:M.lawyer?'Tu économises 8 000 € par an':`${fmt(RETAINER)} par an · des peines allégées`,key:'pw_avocat',fn:L=>{M.lawyer=M.lawyer?0:1;return out(L,M.lawyer?'⚖️ Maître Valmont est désormais à ton service.':'⚖️ Tu rompts le contrat. Maître Valmont est offensé.')}})]));
  H.push(group('',[row({ic:'🚪',t:'Quitter la famille',danger:1,a:()=>pushPanel(confirmP('Quitter le milieu ?','On ne quitte pas une famille si facilement.',()=>{const q=cur();if(chance(.3)){q.st.health=clamp(q.st.health-35);q.mob=null;return out(q,'On te fait payer ton départ. Tu finis à l’hôpital, mais tu es libre.')}q.mob=null;return out(q,'La famille te laisse partir, avec un dernier avertissement.')}))})]));
  return {title:M.fam,html:H.join('')};
}
function mission(L,M,J){
  const crewHelp=M.crew.length*.01;
  if(chance(lim(J.risk*(1+M.heat/100)-crewHelp,.03,.8))){
    addHeat(L,M,J.heat+4);track(L,'crimes');chg(L,{karma:-3,crime:2});
    say(L,`🚔 Mission ratée : ${J.n.toLowerCase()}. La police t’arrête.`);
    trial(L,charge(M,J.n.toLowerCase(),0,3,15000));return '';
  }
  const g=J.gain[1]?R(J.gain[0],J.gain[1]):0;
  if(g){earn(L,Math.round(g*(1-CUT[M.rank]*.5)),1)}
  M.resp+=J.resp;M.loy=lim(M.loy+2,0,100);addHeat(L,M,J.heat);track(L,'crimes');chg(L,{karma:-3,crime:2});
  return out(L,`${J.ic} Mission accomplie : ${J.n.toLowerCase()}${g?`. Ta part : ${fmt(Math.round(g*(1-CUT[M.rank]*.5)))}`:''}. Le respect grandit.`);
}
function succession(L,M){
  modal({title:'La succession',icon:'👑',text:'Le vieux parrain n’en a plus pour longtemps, mais personne ne veut attendre. Comment prends-tu la tête de la famille ?',choices:[
    {t:'Un coup de force pendant le baptême du petit-fils',fn:()=>{
      const p=lim(.3+M.crew.length*.03+M.loy/300+M.resp/800,.1,.85);
      if(chance(p)){M.rank=4;M.loy=75;M.resp+=10;addHeat(L,M,20);track(L,'parrain');track(L,'crimes');chg(L,{karma:-8,crime:6,fame:2});return out(L,`👑 La nuit est courte et l’aube est calme : tu es ${ge(L,'le nouveau parrain','la nouvelle marraine')} de ${M.fam}.`)}
      M.rank=1;M.resp=RTHR[1];M.crew=[];M.loy=20;chg(L,{health:-20,happy:-15});return out(L,'👑 Le coup échoue. Tu es rétrogradé, ton équipe dispersée, et tu as de la chance d’être en vie.')}},
    {t:`Acheter l’appui des capitaines (${fmt(30000)})`,fn:()=>{
      if(L.money<30000)return out(L,'💶 Tu n’as pas de quoi payer leurs bonnes dispositions.');
      spend(L,30000);
      if(chance(M.loy>=50?.8:.45)){M.rank=4;M.loy=70;track(L,'parrain');chg(L,{karma:-3,fame:2});return out(L,`👑 Les capitaines votent pour toi. ${ge(L,'Te voici parrain','Te voici marraine')} de ${M.fam}.`)}
      M.loy=lim(M.loy-10,0,100);return out(L,'👑 Ils ont pris l’argent et voté pour un autre. Classique.')}},
    {t:'Attendre la retraite du vieux parrain',fn:()=>{M.wait=1;return out(L,'⏳ Tu patientes en servant le café. Un jour, ton heure viendra.')}}]});
  return '';
}
function pRacket(){
  const L=cur(),M=mob(L);
  if(!M)return {title:'Racket',html:note('Tu n’appartiens à aucune famille.')};
  const T=targets(L,M);
  const gross=grossOf(M),share=Math.round(gross*(1-CUT[M.rank]));
  const stateTxt=t=>t.st===1?`Paie ${fmt(t.tr)} par an`:t.st===2?'Hostile · a déjà appelé la police':`Potentiel ${fmt(t.pot)} · résistance ${t.res} %`;
  const rows=T.map(t=>nav(t.ic,t.n,stateTxt(t),targetP(t.id)));
  return {title:`Racket · ${L.city}`,html:note(`Chaque commerce du quartier a un potentiel de revenus et une résistance. La famille garde ${Math.round(CUT[M.rank]*100)} % du tribut.`)+card('Revenus annuels',fmt(share),`Tribut total : ${fmt(gross)} · ${payingOf(M).length} commerce${payingOf(M).length>1?'s':''} sous protection`)+group(`Commerces de ${L.city}`,rows)};
}
function racketP(M,T,hard){
  let p=.30+M.rank*.05+M.resp/500+M.crew.length*.025+(hard?.16:0)-T.res/160-M.heat/400;
  if(T.st===2)p-=.2;
  return lim(p,.05,.9);
}
function targetP(id){
  return ()=>{
    const L=cur(),M=mob(L);
    const T=M&&M.targets?M.targets.find(x=>x.id===id):null;
    if(!M||!T)return {title:'Commerce',html:note('Ce commerce n’existe plus.')};
    const H=[card(T.k,T.n,T.st===1?`Sous protection depuis ${An(T.y)} · ${fmt(T.tr)} par an`:T.st===2?'Le commerçant est hostile.':`Potentiel ${fmt(T.pot)} par an`,statLine('Résistance',T.res))];
    const rows=[];
    if(T.st!==1){
      rows.push(act(L,{ic:'🤝',t:'Proposer une « protection » amiable',s:`Réussite estimée : ${Math.round(racketP(M,T,false)*100)} %`,key:'pw_rk_'+T.id,dis:T.st===2?'Il est hostile : calme-le d’abord':'',fn:L=>{
        if(chance(racketP(M,T,false))){T.st=1;T.tr=Math.round(T.pot*(.6+Math.random()*.2)/100)*100;T.y=0;M.resp+=2;addHeat(L,M,2);track(L,'crimes');chg(L,{karma:-2,crime:1});STACK.pop();return out(L,`🏪 ${T.n} accepte la « protection » : ${fmt(T.tr)} par an. « Pour la sécurité du quartier. »`)}
        T.res=Math.min(95,T.res+4);addHeat(L,M,2);return out(L,`🏪 Le commerçant de ${T.n} fait semblant de ne pas comprendre. Il appelle ses cousins.`)}}));
      rows.push(act(L,{ic:'😠',t:'Mettre la pression',s:`Plus de gains, plus de chaleur · réussite : ${Math.round(racketP(M,T,true)*100)} %`,key:'pw_rk_'+T.id,danger:1,fn:L=>{
        track(L,'crimes');chg(L,{karma:-4,crime:3});
        if(chance(racketP(M,T,true))){T.st=1;T.tr=Math.round(T.pot*.95/100)*100;T.y=0;M.resp+=4;addHeat(L,M,7);STACK.pop();return out(L,`🏪 Après quelques visites de tes hommes, ${T.n} cède : ${fmt(T.tr)} par an.`)}
        T.st=2;T.res=Math.min(95,T.res+10);addHeat(L,M,10);
        if(chance(.25+M.heat/300)){say(L,'🚔 Le commerçant a porté plainte. La police débarque.');trial(L,charge(M,'extorsion',0,3,15000));return ''}
        return out(L,`🏪 ${T.n} refuse et menace de porter plainte. L’ambiance est tendue.`)}}));
      if(T.st===2)rows.push(act(L,{ic:'🍷',t:'Calmer le jeu',s:`${fmt(500)} de gestes commerciaux`,cost:500,key:'pw_calm_'+T.id,fn:L=>{T.st=0;T.res=Math.max(10,T.res-6);return out(L,'🍷 Une bouteille et des excuses : le commerçant retrouve un peu de sérénité.')}}));
    }else{
      rows.push(act(L,{ic:'📈',t:'Augmenter le tribut de 25 %',s:'Il risque de se rebeller',key:'pw_up_'+T.id,fn:L=>{
        if(chance(.3+T.res/250)){T.st=2;T.tr=0;T.res=Math.min(95,T.res+8);addHeat(L,M,6);return out(L,'🏪 Le commerçant refuse la hausse et ferme à clé. Tu perds un client.')}
        T.tr=Math.round(T.tr*1.25/100)*100;return out(L,`🏪 Le tribut grimpe à ${fmt(T.tr)} par an. Personne ne dit rien.`)}}));
      rows.push(act(L,{ic:'🕊️',t:'Lâcher l’affaire',s:'Le commerçant respire enfin',key:'pw_rel_'+T.id,fn:L=>{T.st=0;T.tr=0;T.res=Math.max(10,T.res-10);chg(L,{karma:2});STACK.pop();return out(L,'🕊️ Tu cesses de passer. Le commerçant n’en revient pas.')}}));
    }
    H.push(group('Actions',rows));
    return {title:T.n,html:H.join('')};
  };
}
function pHeists(){
  const L=cur(),M=mob(L);
  if(!M)return {title:'Coups de rue',html:note('Tu n’appartiens à aucune famille.')};
  const rows=HEISTS.map(h=>{
    const need=h.crew,missing=need-M.crew.length;
    return act(L,{ic:h.ic,t:h.n,s:`Gain : ${fmtk(h.gain[0])} à ${fmtk(h.gain[1])} · équipe : ${need}`,key:'pw_h_'+h.k,dis:M.rank<h.rank?`Dès le rang de ${rk(L,h.rank).toLowerCase()}`:(missing>0?`Il te manque ${missing} homme${missing>1?'s':''}`:''),fn:L=>heist(L,M,h)});
  });
  return {title:'Coups de rue',html:note('Chaque coup rapporte gros mais fait monter la chaleur. Un repérage soigneux diminue le risque et fait monter le butin.')+card('Préparation',M.prep?'Repérage fait':'Aucun repérage',`Discrétion : ${100-M.heat} %`)+group('Préparer',[act(L,{ic:'🔭',t:'Faire un repérage',s:`${fmt(500)} · −10 points de risque sur le prochain coup`,cost:500,key:'pw_scout',dis:M.prep?'Déjà fait':'',fn:L=>{M.prep=1;addHeat(L,M,1);return out(L,'🔭 Tu passes trois jours dans une camionnette à observer, avec un thermos et des sandwichs.')}})])+group('Coups',rows)};
}
function heist(L,M,h){
  const skill=M.crew.length?M.crew.reduce((s,c)=>s+c.skill,0)/M.crew.length:40;
  const miss=Math.max(0,h.crew-M.crew.length);
  const p=lim(h.risk-skill/400+M.heat/250-(M.prep?.1:0)+miss*.08+.1,.05,.85);
  const prep=M.prep;M.prep=0;
  track(L,'crimes');chg(L,{karma:-4,crime:R(2,5)});
  if(chance(p)){
    addHeat(L,M,Math.round(h.heat*1.4));
    if(chance(.55)){
      say(L,`🚔 ${h.n} raté. La police te serre.`);
      if(M.crew.length&&chance(.5)){const c=pick(M.crew);M.crew=M.crew.filter(x=>x!==c)}
      trial(L,charge(M,h.n.toLowerCase().replace(/^coup du siècle : /,''),h.jail[0],h.jail[1],Math.round(h.gain[0]*.4)));return '';
    }
    M.resp=Math.max(0,M.resp-2);
    return out(L,`${h.ic} ${h.n} : tout part de travers, vous filez les mains vides. La police est plus attentive.`);
  }
  let g=R(h.gain[0],h.gain[1]);if(prep)g=Math.round(g*1.15);
  const mine=Math.round(g*(1-CUT[M.rank]*.5));
  earn(L,mine,1);M.resp+=h.resp;addHeat(L,M,h.heat);M.loy=lim(M.loy+2,0,100);chg(L,{happy:3});
  return out(L,`${h.ic} ${h.n} réussi : le butin atteint ${fmt(g)}, ta part ${fmt(mine)}. Le respect grandit.`);
}

/* ---------- l’équipe et les indics ---------- */
function susWord(c){
  if(c.obs==null)return 'Pas encore observé';
  if(c.obs.confirmed)return c.mole?'Démasqué : c’est l’indic !':'Innocent';
  const s=c.obs.sus;
  return s>=70?'Très suspect':s>=45?'Louche':s>=20?'Rien de particulier':'Au-dessus de tout soupçon';
}
function pCrew(){
  const L=cur(),M=mob(L);
  if(!M)return {title:'Ton équipe',html:note('Tu n’appartiens à aucune famille.')};
  const rows=M.crew.map(c=>nav('👤',`${c.first} « ${c.nick} »`,`${c.role} · loyauté ${Math.round(c.loy)} % · ${susWord(c)}`,memberP(c.id)));
  const full=M.crew.length>=CREWMAX[M.rank];
  const sus=M.heat>=30?'La police semble très bien renseignée sur tes affaires. Un indic se cache peut-être parmi vous.':'Pour l’instant, personne n’a l’air de te trahir.';
  return {title:'Ton équipe',html:note(`Chaque homme coûte ${fmt(WAGE)} par an. Plus l’équipe est grande, plus le risque de trahison est élevé. ${sus}`)+group(`Hommes de main (${M.crew.length}/${CREWMAX[M.rank]})`,rows)+group('Gérer',[
    act(L,{ic:'🤝',t:'Recruter un homme de main',s:`${fmt(1500)} · il faut s’en méfier un minimum`,cost:1500,key:'pw_recrute',dis:full?'Équipe au complet':'',fn:L=>{const c=newCrew(L,M);M.crew.push(c);return out(L,`🤝 ${c.first} « ${c.nick} » rejoint ton équipe comme ${c.role.toLowerCase()}.`)}}),
    act(L,{ic:'🕵️',t:'Mener une enquête interne',s:`${fmt(2000)} · observer chacun avec plus de précision`,cost:2000,key:'pw_enquete',dis:M.crew.length?'':'Personne à surveiller',fn:L=>{
      M.crew.forEach(c=>{c.obs={y:L.age,sus:c.mole?R(60,95):R(0,40)+(c.tell?R(0,15):0)}});
      return out(L,'🕵️ Tu fais suivre chacun de tes hommes pendant deux semaines. Le rapport est sur ton bureau.')}}),
    act(L,{ic:'🎁',t:'Offrir une prime à toute l’équipe',s:`${fmt(Math.max(1,M.crew.length)*1000)}`,cost:Math.max(1,M.crew.length)*1000,key:'pw_prime',dis:M.crew.length?'':'Personne à récompenser',fn:L=>{M.crew.forEach(c=>{c.loy=lim(c.loy+8,0,100)});return out(L,'🎁 Une enveloppe pour chacun et un méchoui dans la cour : l’équipe est ravie.')}})])};
}
function memberP(id){
  return ()=>{
    const L=cur(),M=mob(L);
    const c=M?M.crew.find(x=>x.id===id):null;
    if(!M||!c)return {title:'Équipe',html:note('Cet homme n’est plus dans ton équipe.')};
    const H=[card(c.role,`${c.first} « ${c.nick} »`,susWord(c),statLine('Loyauté',c.loy)+statLine('Talent',c.skill))];
    if(c.obs&&(c.tell||c.obs.sus>=45))H.push(`<p class="note">${esc(c.tell?`Tu as remarqué un truc : ${c.tell}`:'Il y a quelque chose de louche dans son comportement, mais rien de précis.')}</p>`);
    H.push(group('Actions',[
      act(L,{ic:'👀',t:'Observer discrètement',s:'Gratuit, mais pas toujours fiable',key:'pw_obs_'+c.id,fn:L=>{
        let sus=c.mole?R(55,95):R(0,45)+(c.tell?R(0,25):0);
        if(chance(.15))sus=c.mole?R(20,50):R(55,75);
        c.obs={y:L.age,sus};
        return out(L,sus>=70?`👀 ${c.first} t’a l’air vraiment bizarre depuis quelque temps.`:sus>=45?`👀 Il y a quelque chose de pas net chez ${c.first}.`:`👀 Rien d’anormal chez ${c.first}.`)}}),
      act(L,{ic:'🪤',t:'Lui tendre un faux tuyau',s:`${fmt(1500)} · tu lui confies une fausse information`,cost:1500,key:'pw_trap',fn:L=>{
        if(c.mole){
          if(chance(.85)){c.obs={y:L.age,sus:100,confirmed:true};addHeat(L,M,-8);return out(L,`🪤 La police débarque à l’entrepôt vide que tu avais confié à ${c.first}. Aucun doute possible.`)}
          c.obs={y:L.age,sus:10};return out(L,`🪤 Rien ne se passe. ${c.first} a-t-il tout gardé pour lui, ou est-il vraiment innocent ?`)}
        if(chance(.85)){c.obs={y:L.age,sus:2,confirmed:true};c.loy=lim(c.loy+3,0,100);return out(L,`🪤 Personne n’est venu à l’entrepôt vide. ${c.first} est probablement réglo.`)}
        c.obs={y:L.age,sus:70};return out(L,`🪤 Une voiture banalisée passe devant l’entrepôt vide… coïncidence ? ${c.first} te paraît tout à coup suspect.`)}}),
      act(L,{ic:'🕵️',t:'Le confronter',s:'Si tu te trompes, l’équipe s’en souviendra',key:'pw_acc_'+c.id,danger:1,fn:L=>accuse(L,M,c)}),
      act(L,{ic:'🎁',t:'Lui offrir une prime',s:fmt(2000),cost:2000,key:'pw_cadeau_'+c.id,fn:L=>{c.loy=lim(c.loy+15,0,100);return out(L,`🎁 ${c.first} est très touché${c.g==='F'?'e':''} de ton geste.`)}}),
      row({ic:'🚪',t:'Le congédier',danger:1,a:()=>pushPanel(confirmP('Le congédier ?','Il pourrait parler.',()=>{const q=cur(),m=mob(q);if(!m)return '';m.crew=m.crew.filter(x=>x.id!==id);if(chance(.15))addHeat(q,m,8);if(m.crew.every(x=>!x.mole))m.opY=null;return out(q,`🚪 ${c.first} ${c.g==='F'?'range ses affaires':'range ses affaires'} et quitte l’équipe.`)}))})]));
    return {title:`${c.first} « ${c.nick} »`,html:H.join('')};
  };
}
function accuse(L,M,c){
  modal({title:'Face à face',icon:'🕵️',text:`Tu convoques ${c.first} « ${c.nick} » dans l’arrière-salle d’un café fermé. Il nie tout en bloc, les mains moites.`,choices:[
    {t:'Le confronter avec ce que tu sais',pri:1,fn:()=>unmask(L,M,c)},
    {t:'Laisser tomber',fn:()=>out(L,'🕵️ Tu gardes ton sang-froid, pour l’instant.')}]});
  return '';
}
function unmask(L,M,c){
  if(c.mole){
    M.crew=M.crew.filter(x=>x!==c);M.opY=null;M.resp+=6;
    modal({title:'L’indic démasqué',icon:'🎯',text:`${c.first} finit par craquer : il travaillait bien pour la police. Que fais-tu de lui ?`,choices:[
      {t:'Lui faire transmettre de fausses informations',pri:1,fn:()=>{addHeat(L,M,-25);M.resp+=6;return out(L,'🎯 La police se lance sur de fausses pistes pendant des mois. Tu respires.')}},
      {t:'Le chasser de la ville, avec un avertissement',fn:()=>{addHeat(L,M,-10);return out(L,'🎯 Il prend le premier train pour Lille. On ne le reverra pas.')}},
      {t:'Lui offrir un généreux billet pour l’étranger',fn:()=>{spend(L,5000);addHeat(L,M,-15);return out(L,'🎯 Un aller simple pour Montevideo, tous frais payés. Tout le monde y gagne.')}}]});
    return out(L,'🎯 Tu viens de démasquer un indic !');
  }
  M.crew=M.crew.filter(x=>x!==c);
  M.crew.forEach(x=>{x.loy=lim(x.loy-8,0,100)});M.resp=Math.max(0,M.resp-6);M.loy=lim(M.loy-4,0,100);
  if(chance(.5))addHeat(L,M,6);
  return out(L,`🕵️ Tu t’es trompé : ${c.first} n’était pas l’indic. Il claque la porte, et l’équipe prend note de ton manque de discernement.`);
}

/* ---------- évènements dynamiques du milieu ---------- */
function mobEvents(L){
  const M=mob(L);if(!M||L.prison)return 0;
  let q=0;
  if(M.heat>=55&&chance(.25)){
    q++;
    modal({title:'Surveillance',icon:'🚔',text:`Une camionnette de plombiers stationne devant ta planque depuis trois jours. Personne n’a appelé de plombier.`,choices:[
      {t:`Changer de planque (${fmt(1500)})`,fn:()=>{spend(L,1500);addHeat(L,M,-15);return out(L,'🏚️ Tu déménages en pleine nuit. Les « plombiers » en seront pour leurs frais.')}},
      {t:'Faire semblant de rien',fn:()=>{addHeat(L,M,5);return out(L,'🚔 Tu salues les plombiers d’un signe de la main. Ils notent tout.')}},
      {t:'Les noyer sous de fausses pistes',fn:()=>{if(chance(.5+L.st.smarts/300)){addHeat(L,M,-20);return out(L,'🎭 Tu organises un faux transport devant leurs yeux. Ils suivent un camion de poireaux.')}addHeat(L,M,8);return out(L,'🎭 Ta mise en scène est trop grossière. Ils ne sont pas dupes.')}}]});
  }
  if(M.rank>=1&&chance(.1)){
    q++;
    modal({title:'Bande rivale',icon:'🥷',text:'Une petite bande rivale commence à lever des fonds sur ton territoire, sous le nom d’une association de quartier.',choices:[
      {t:'Négocier un partage',fn:()=>{M.targets=arr(M.targets);M.resp+=2;return out(L,'🤝 Un partage honnête, selon des principes qui ne le sont pas toujours. Le calme revient.')}},
      {t:'Montrer les dents',fn:()=>{if(chance(lim(.35+M.crew.length*.05+M.resp/600,.2,.85))){M.resp+=7;addHeat(L,M,8);track(L,'crimes');chg(L,{karma:-3,crime:2});return out(L,'🥷 Ils plient bagage. On parle de toi dans tous les bars de la ville.')}M.resp=Math.max(0,M.resp-4);addHeat(L,M,12);return out(L,'🥷 Ils répliquent. Quelques vitrines sautent, et la police s’en mêle.')}},
      {t:'En référer au parrain',fn:()=>{M.loy=lim(M.loy-3,0,100);return out(L,'🎩 Le parrain règle ça d’un coup de fil. Tu paraîtras un peu moins autonome.')}}]});
  }
  const m=moleOf(M);
  if(m&&chance(.4)){
    q++;
    const wrong=M.crew.filter(x=>x!==m);
    const target=(wrong.length&&chance(.2))?pick(wrong):m;
    const tell=target===m&&m.tell?m.tell:pick(DECOYS);
    modal({title:'Un détail qui cloche',icon:'🕵️',text:`Tu remarques quelque chose chez ${target.first} « ${target.nick} » : ${tell.charAt(0).toLowerCase()+tell.slice(1)}`,choices:[
      {t:'Garder cette information en tête',fn:()=>{target.obs={y:L.age,sus:target===m?R(60,80):R(45,65)};return out(L,`🕵️ Tu gardes ${target.first} à l’œil.`)}},
      {t:'Oublier, c’est sûrement rien',fn:()=>'Tu hausses les épaules.'}]});
  }
  if(M.rank>=1&&M.rank<=3&&chance(.1)){
    q++;
    modal({title:'Invitation',icon:'🍷',text:'Le parrain t’invite à déjeuner dans sa propriété. Il aimerait « qu’on se connaisse mieux », et que tu participes à la cagnotte de la famille.',choices:[
      {t:`Participer (${fmt(3000)})`,fn:()=>{if(L.money<3000)return out(L,'💶 Tu n’as pas de quoi. Gêne.');spend(L,3000);M.loy=lim(M.loy+10,0,100);M.resp+=3;return out(L,'🍷 Le parrain lève son verre à ta santé.')}},
      {t:'Décliner poliment',fn:()=>{M.loy=lim(M.loy-6,0,100);return out(L,'🍷 « Dommage », dit le parrain avec un sourire qui ne l’est pas.')}}]});
  }
  return q;
}

/* =====================================================================
   Évènements JSON : conditions et effets spécifiques
   ===================================================================== */
const effects={
  seg(L,a){const P=pol(L);const s=SEG.includes(a.s)?a.s:'urbains';const d=Array.isArray(a.d)?R(a.d[0],a.d[1]):nn(a.d,0);P.seg[s]=lim(P.seg[s]+d,3,97);sync(P);return ''},
  allseg(L,a){const P=pol(L);const d=Array.isArray(a.d)?R(a.d[0],a.d[1]):nn(a.d,0);shift(P,[d,d,d,d]);sync(P);return ''},
  loy(L,a){const P=pol(L);P.loy=lim(P.loy+nn(a.d,0),0,100);return ''},
  camp(L,a){const P=pol(L);if(P.cand!=null)P.camp=lim(P.camp+nn(a.d,0),0,30);return ''},
  fund(L,a){const P=pol(L);if(P.cand!=null){const v=Math.round(POLS[P.cand].plaf*nn(a.f,.05));P.funds+=v;if(a.black)P.black+=v;else P.don+=v}return ''},
  heat(L,a){const M=mob(L);if(M)M.heat=lim(M.heat+nn(a.d,0),0,100);return ''},
  resp(L,a){const M=mob(L);if(M)M.resp=Math.max(0,M.resp+nn(a.d,0));return ''},
  mloy(L,a){const M=mob(L);if(M)M.loy=lim(M.loy+nn(a.d,0),0,100);return ''}
};
const conds={
  inOffice(L){return !!L.pol&&pol(L).office>=0},
  candidate(L){return !!L.pol&&pol(L).cand!=null},
  inMob(L){return !!mob(L)},
  hotMob(L,a){const M=mob(L);return !!M&&M.heat>=nn(a.min,40)}
};
const ME=(fn,args)=>({mod_effect:{mod:'power',fn,args}});
const eventsDb=[
 {id:'power_ev_marche',category:'political',icon:'🥕',conditions:{min_age:18,mod_cond:{mod:'power',fn:'inOffice'}},probability_weight:.12,
  prompt_text:'Sur le marché du samedi, une habitante t’intercepte : le trottoir de sa rue est dans un état pitoyable, et elle t’a déjà écrit quatre lettres.',
  choices:[
   {choice_text:'Promettre des travaux dès la semaine prochaine',consequences:Object.assign({stress_level_increment:2,result_text:'Elle sort son téléphone pour te filmer. Tu as intérêt à tenir parole.'},ME('seg',{s:'ruraux',d:[1,3]}))},
   {choice_text:'Lui expliquer que ce n’est pas ta compétence',consequences:Object.assign({karma_modifier:1,result_text:'Elle hausse les épaules et va se plaindre ailleurs.'},ME('seg',{s:'ruraux',d:-2}))},
   {choice_text:'Faire réparer le trottoir à tes frais',consequences:Object.assign({bank_balance_modifier:-1200,karma_modifier:3,result_text:'Le trottoir est refait en une semaine. Elle t’offre un clafoutis.'},ME('allseg',{d:1}))}]},
 {id:'power_ev_cantine',category:'political',icon:'🥗',conditions:{min_age:18,mod_cond:{mod:'power',fn:'inOffice'}},probability_weight:.1,
  prompt_text:'Les parents d’élèves réclament une cantine entièrement bio. Le budget, lui, réclame une cantine entièrement surgelée.',
  choices:[
   {choice_text:'Voter la cantine bio',consequences:Object.assign({bank_balance_modifier:-500,result_text:'Les parents applaudissent. Le trésorier se prend la tête dans les mains.'},ME('seg',{s:'jeunes',d:[2,4]}))},
   {choice_text:'Maintenir le menu actuel',consequences:Object.assign({result_text:'Ils reviennent avec des pancartes en forme de carottes.'},ME('seg',{s:'jeunes',d:-2}))}]},
 {id:'power_ev_lobbyiste',category:'political',icon:'🍽️',conditions:{min_age:25,mod_cond:{mod:'power',fn:'inOffice'}},probability_weight:.07,
  prompt_text:'Un lobbyiste t’invite dans un restaurant étoilé pour te parler « d’un amendement très technique ».',
  choices:[
   {choice_text:'Accepter le déjeuner, et le cadeau qui va avec',consequences:Object.assign({bank_balance_modifier:[5000,15000],karma_modifier:-5,hidden_crime_stat_modifier:2,probability_of_retaliation_trigger:.35,retaliation_event_id:'power_ev_fuite',result_text:'Le menu dégustation était excellent. L’enveloppe aussi.'},ME('loy',{d:-2}))},
   {choice_text:'Décliner et l’annoncer publiquement',consequences:Object.assign({karma_modifier:4,result_text:'Tes électeurs apprécient. Le lobbyiste beaucoup moins.'},ME('allseg',{d:2}))}]},
 {id:'power_ev_fuite',category:'political',icon:'📰',once:true,conditions:{min_age:25,mod_cond:{mod:'power',fn:'inOffice'}},probability_weight:0,
  prompt_text:'Un journaliste a retrouvé la trace de ton déjeuner avec le lobbyiste. Il passe à l’antenne ce soir.',
  choices:[
   {choice_text:'Tout reconnaître et rendre l’argent',consequences:Object.assign({bank_balance_modifier:-6000,karma_modifier:3,result_text:'Tu rends l’argent. Le scandale se dégonfle.'},ME('allseg',{d:-1}))},
   {choice_text:'Parler d’un complot',consequences:Object.assign({karma_modifier:-3,result_text:'Personne n’y croit. Les sondages dévissent.'},ME('allseg',{d:-5}))}]},
 {id:'power_ev_selfie',category:'political',icon:'🤳',conditions:{min_age:18,mod_cond:{mod:'power',fn:'candidate'}},probability_weight:.12,
  prompt_text:'Un selfie avec un inconnu en gilet jaune devient viral. Le légendaire « Raymond » te serre dans ses bras devant la caméra.',
  choices:[
   {choice_text:'Surfer sur la vague',consequences:Object.assign({fame_modifier:2,result_text:'Ton QG crie de joie : les dons affluent.'},ME('camp',{d:3}),{})},
   {choice_text:'Rester sobre',consequences:Object.assign({karma_modifier:1,result_text:'Tu laisses retomber la vague.'},ME('camp',{d:1}))}]},
 {id:'power_ev_don',category:'political',icon:'💼',conditions:{min_age:21,mod_cond:{mod:'power',fn:'candidate'}},probability_weight:.1,
  prompt_text:'Un entrepreneur propose de financer ta campagne d’un chèque généreux, de préférence « sans reçu, ça simplifie ».',
  choices:[
   {choice_text:'Accepter l’argent liquide',consequences:Object.assign({karma_modifier:-5,hidden_crime_stat_modifier:2,result_text:'Tu glisses l’enveloppe dans ton tiroir. Elle y pèse lourd.'},ME('fund',{f:.12,black:1}))},
   {choice_text:'Exiger un don déclaré',consequences:Object.assign({karma_modifier:2,result_text:'L’entrepreneur grommelle mais signe un chèque dans les règles.'},ME('fund',{f:.04}))},
   {choice_text:'Refuser',consequences:Object.assign({karma_modifier:3,result_text:'Tu refuses poliment. Il va voir le concurrent.'},{})}]},
 {id:'power_ev_bar',category:'crime',icon:'☕',conditions:{min_age:18,mod_cond:{mod:'power',fn:'inMob'}},probability_weight:.1,
  prompt_text:'Le patron d’un bar te sert un café et te glisse qu’il « connaît des gens » qui pourraient s’intéresser à ton… quartier.',
  choices:[
   {choice_text:'Lui rappeler à qui appartient le quartier',consequences:Object.assign({karma_modifier:-2,result_text:'Il baisse les yeux. L’affaire est close.'},ME('resp',{d:2}))},
   {choice_text:'L’écouter, il a peut-être des infos',consequences:Object.assign({result_text:'Il te parle d’une bande rivale. Utile, mais bavard.'},ME('heat',{d:3}))}]},
 {id:'power_ev_cousin',category:'crime',icon:'🚔',conditions:{min_age:18,mod_cond:{mod:'power',fn:'inMob'}},probability_weight:.07,
  prompt_text:'Ton cousin gendarme t’invite à dîner. Il parle de tout, sauf de ton travail. Il regarde beaucoup ton téléphone.',
  choices:[
   {choice_text:'Y aller, et surveiller ce que tu dis',consequences:Object.assign({karma_modifier:1,result_text:'Le dîner est étrangement cordial. Tu repars avec des tupperwares.'},ME('heat',{d:-4}))},
   {choice_text:'Décliner l’invitation',consequences:Object.assign({relationship_parents_modifier:-3,result_text:'Il se vexe. La famille jase.'},ME('mloy',{d:1}))}]},
 {id:'power_ev_mariage',category:'crime',icon:'💒',conditions:{min_age:20,mod_cond:{mod:'power',fn:'inMob'}},probability_weight:.08,
  prompt_text:'Le parrain marie sa fille. Toute la famille est conviée, et le cadeau est « libre », c’est-à-dire obligatoire.',
  choices:[
   {choice_text:'Offrir une enveloppe généreuse',consequences:Object.assign({bank_balance_modifier:-2500,happiness_modifier:3,result_text:'Le parrain te tape sur l’épaule devant tout le monde.'},ME('mloy',{d:6}))},
   {choice_text:'Offrir un grille-pain',consequences:Object.assign({bank_balance_modifier:-50,result_text:'Le silence qui suit est très long.'},ME('mloy',{d:-8}))}]},
 {id:'power_ev_planque',category:'crime',icon:'🏚️',conditions:{min_age:18,mod_cond:{mod:'power',fn:'hotMob',args:{min:50}}},probability_weight:.15,
  prompt_text:'Un voisin t’a vu sortir de nuit avec un sac suspect et en a parlé à la police. Elle passe « vérifier un détail ».',
  choices:[
   {choice_text:'Offrir un café et jouer les innocents',consequences:Object.assign({result_text:'Les policiers repartent avec un paquet de gâteaux et des soupçons.'},ME('heat',{d:3}))},
   {choice_text:'Déménager en vitesse',consequences:Object.assign({bank_balance_modifier:-1500,stress_level_increment:3,result_text:'Tu changes d’adresse. Le voisin est soulagé.'},ME('heat',{d:-10}))}]}
];

/* =====================================================================
   Enregistrement du module
   ===================================================================== */
registerMod({
  id:'power',
  eventsDb,effects,conds,
  worldInit(){W()},
  worldYear(){
    const w=W();w.yr++;
    w.mood=lim(w.mood+R(-4,4)+(w.mood>0?-1:w.mood<0?1:0),-10,10);
    if(chance(.55))w.hot=pick(THEMES.filter(t=>t.k!==w.hot)).k;
  },
  year(L){polYear(L);mobYear(L)},
  events(L){
    let q=0;
    if(L.prison||L.age<18)return 0;
    if(L.pol){
      const P=pol(L);
      if(P.office>=0&&P.cand==null){
        if(chance(.55)){voteLaw(L,P);q++}
        if(chance(.2)){voteLaw(L,P);q++}
        if(chance(.07+(P.scand>0?.03:0))){pressStory(L,P);q++}
      }
    }
    q+=mobEvents(L);
    return q;
  },
  workRows(L){
    if(L.age<18)return [];
    const P=L.pol?pol(L):null,M=mob(L);
    return [
      nav('🏛️','Politique',P&&P.office>=0?lab(L,P.office):(P&&P.cand!=null?`${ge(L,'Candidat','Candidate')} : ${lab(L,P.cand).toLowerCase()}`:'Du conseil municipal à l’Élysée'),pPolitics),
      nav('🎩','Le milieu',M?`${M.fam} · ${rk(L,M.rank)}`:'Crime organisé et familles',pMob)
    ];
  },
  activities(L){
    return [
      {ic:'🎩',t:'Le milieu',s:'Crime organisé',panel:pMob,min:18},
      {ic:'🏛️',t:'Politique',s:'Élections',panel:pPolitics,min:18}
    ];
  },
  jobLabel(L){
    if(L.pol){const P=pol(L);if(P.office>=0)return lab(L,P.office)}
    return null;
  },
  badges(L){
    const b=[];
    if(L.pol){const P=pol(L);if(P.office>=0&&P.party)b.push('🏛️ '+P.party);else if(P.cand!=null)b.push('🗳️ '+ge(L,'Candidat','Candidate'))}
    const M=mob(L);if(M)b.push('🎩 '+rk(L,M.rank));
    return b;
  },
  inherit(D,L){
    const leg={};
    if(D.mob&&D.mob.fam&&nn(D.mob.rank,0)>=2)leg.fam=D.mob.fam;
    if(D.pol&&D.pol.party)leg.party=D.pol.party;
    if(D.pol&&typeof D.pol.best==='number'&&D.pol.best>=0)leg.best=D.pol.best;
    if(Object.keys(leg).length)L.powerLegacy=leg;
  },
  jailed(L){
    if(L.pol){const P=pol(L);if(P.cand!=null)resetCamp(P);if(P.office>=0){P.prev=P.office;P.office=-1;P.term=0;P.base=null}}
  }
});
})();
