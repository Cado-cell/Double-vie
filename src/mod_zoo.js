/* Deux Vies — module « Zoo » (id zoo)
   Gestion d’un parc zoologique : terrain, enclos par espèce, animaux, reproduction, personnel, sécurité du public,
   billetterie, aménagements, évènements (évasion, épidémie, inspection, militants…).
   État : L.zoo = {name,an:[{sp,name,age,h,sex}],rep,y,land, (migrés) ha,ticket,mkt,enc:{espèce:{c,cap,breed}},staff:{keep,vet,sec},up:{},hist,last,pen,nb,log}
   Le format de la version simple (name, an, rep, y, land) est repris et complété sans rien perdre. */
(()=>{
const MOD='zoo';
const cl=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const num=(v,d)=>typeof v==='number'&&isFinite(v)?v:d;
const pl=(n,s,p)=>n>1?p:s;

/* ---------- Catalogue ---------- */
const EXTRA={'Lémurien':[6000,5,600],'Tapir':[18000,6,1500],'Tortue géante':[30000,9,1200],'Okapi':[45000,11,3000],'Dragon de Komodo':[55000,13,2500],'Léopard des neiges':[85000,20,5500],'Orang-outan':[130000,24,8000]};
const SP=Object.assign({},EXTRA,typeof ZOO_ANIMALS!=='undefined'?ZOO_ANIMALS:{});
/* danger (0-7), espérance de vie, âge de maturité, fécondité annuelle, icône */
const INFO={'Suricate':[1,12,1,.35,'🦦'],'Flamant rose':[1,40,3,.3,'🦩'],'Pingouin':[1,20,3,.3,'🐧'],'Loup':[4,15,2,.28,'🐺'],'Kangourou':[2,20,2,.3,'🦘'],'Zèbre':[2,25,3,.25,'🦓'],
 'Paresseux':[0,30,3,.2,'🦥'],'Crocodile':[5,50,6,.25,'🐊'],'Koala':[0,15,3,.2,'🐨'],'Lion':[7,16,3,.25,'🦁'],'Tigre':[7,16,3,.22,'🐯'],'Hippopotame':[6,40,5,.15,'🦛'],
 'Girafe':[2,25,4,.15,'🦒'],'Ours polaire':[7,25,5,.15,'🐻‍❄️'],'Gorille':[5,35,7,.1,'🦍'],'Rhinocéros':[5,40,6,.1,'🦏'],'Éléphant':[5,55,10,.08,'🐘'],'Panda géant':[1,20,5,.06,'🐼'],
 'Lémurien':[0,20,2,.35,'🐒'],'Tapir':[1,28,3,.2,'🐗'],'Tortue géante':[0,90,15,.12,'🐢'],'Okapi':[1,22,3,.15,'🦓'],'Dragon de Komodo':[5,30,5,.2,'🦎'],'Léopard des neiges':[6,18,3,.2,'🐆'],'Orang-outan':[3,40,8,.1,'🦧']};
const inf=sp=>INFO[sp]||[3,20,3,.2,'🐾'];
const spd=sp=>SP[sp]||[10000,5,1000];
const ic=sp=>inf(sp)[4];
const DANG=['inoffensif','paisible','tranquille','prudence','costaud','dangereux','très dangereux','redoutable'];
const WAGE={keep:30000,vet:64000,sec:33000};
const UPS={
  cam:{n:'Vidéosurveillance',ic:'📹',p:45000,y:5000,d:'Caméras partout et un écran dans la cabine du gardien : +8 de sécurité.'},
  sas:{n:'Doubles clôtures et sas',ic:'🚧',p:90000,y:6000,d:'Deux barrières valent mieux qu’une : +12 de sécurité.'},
  clin:{n:'Clinique vétérinaire',ic:'🏥',p:150000,y:20000,d:'Un vétérinaire suit 40 animaux au lieu de 25 et les épidémies sont mieux contenues.'},
  resto:{n:'Restaurant « La Savane »',ic:'🍟',p:120000,y:25000,d:'Environ 3,20 € de plus dépensés par visiteur.'},
  boutique:{n:'Boutique de peluches',ic:'🧸',p:70000,y:10000,d:'Environ 2,20 € de plus par visiteur. Le suricate en peluche est un best-seller.'},
  jeux:{n:'Aire de jeux « Mini-Safari »',ic:'🛝',p:55000,y:4000,d:'Les familles adorent : environ 8 % de visiteurs en plus.'},
  contrat:{n:'Contrat d’entretien annuel',ic:'🧰',p:30000,y:0,d:'Un prestataire remet les enclos en état chaque année (2 500 € par enclos et par an).'}
};
const NAMES_M=['Simba','Gaston','Titan','Baloo','Kouros','Zeus','Marius','Rocco','Bernard','Ulysse'];
const NAMES_F=['Nala','Mireille','Gisèle','Bagheera','Pâquerette','Cléo','Marcelle','Hortense','Jeanne','Lola'];
const babyName=sex=>pick(chance(.5)?(sex==='F'?NAMES_F:NAMES_M):PETN);

/* ---------- État ---------- */
function mig(L){
  const Z=L&&L.zoo;if(!Z||typeof Z!=='object')return null;
  if(!Array.isArray(Z.an))Z.an=[];
  Z.name=Z.name||'Zoo';Z.rep=cl(num(Z.rep,50));Z.y=num(Z.y,0);Z.land=num(Z.land,Math.round(250000*costOf(L)));
  Z.an=Z.an.filter(a=>a&&SP[a.sp]);
  Z.an.forEach(a=>{if(a.sex!=='H'&&a.sex!=='F')a.sex=chance(.5)?'H':'F';a.age=num(a.age,1);a.h=cl(num(a.h,80));if(!a.name)a.name=pick(PETN)});
  if(!Z.enc||typeof Z.enc!=='object')Z.enc={};
  const cnt={};Z.an.forEach(a=>cnt[a.sp]=(cnt[a.sp]||0)+1);
  for(const sp in cnt){const e=Z.enc[sp];if(!e||typeof e!=='object')Z.enc[sp]={c:60,cap:Math.max(4,cnt[sp]+(cnt[sp]%2)),breed:true};}
  for(const sp in Z.enc){const e=Z.enc[sp];if(!SP[sp]){delete Z.enc[sp];continue}e.c=cl(num(e.c,60));e.cap=Math.max(2,Math.round(num(e.cap,4)));e.breed=!!e.breed}
  Z.ha=Math.max(num(Z.ha,0),Math.ceil(Object.keys(Z.enc).length/2),4);
  Z.ticket=cl(Math.round(num(Z.ticket,16)),4,60);Z.mkt=cl(Math.round(num(Z.mkt,0)),0,2);
  if(!Z.up||typeof Z.up!=='object')Z.up={};
  if(!Z.staff||typeof Z.staff!=='object'){const n=Z.an.length;Z.staff={keep:Math.ceil(n/6),vet:Math.ceil(n/25),sec:n?Math.ceil(n/10):0}}
  ['keep','vet','sec'].forEach(k=>Z.staff[k]=Math.max(0,Math.round(num(Z.staff[k],0))));
  if(!Array.isArray(Z.hist))Z.hist=[];if(!Z.last||typeof Z.last!=='object')Z.last=null;
  Z.pen=cl(num(Z.pen,0),0,.9);if(!Array.isArray(Z.nb))Z.nb=[];if(!Array.isArray(Z.log))Z.log=[];
  return Z;
}
const zlog=(Z,t)=>{Z.log.push(t);if(Z.log.length>12)Z.log.shift()};
const encCost=(L,sp,cap)=>Math.round((8000+spd(sp)[0]*.4)*(cap/4)*(.8+.2*costOf(L)));
const encValue=(L,Z)=>Object.entries(Z.enc).reduce((s,[sp,e])=>s+encCost(L,sp,e.cap)*.4*(e.c/100+.3),0);
const animalValue=a=>Math.round(spd(a.sp)[0]*(a.age<=1?.45:.6)*(.4+.6*a.h/100));
function zooValue(L){const Z=mig(L);if(!Z)return 0;return Math.round(Z.land*.9+Z.an.reduce((s,a)=>s+animalValue(a),0)+encValue(L,Z)+Object.keys(Z.up).filter(k=>Z.up[k]&&UPS[k]).reduce((s,k)=>s+UPS[k].p*.5,0))}

/* ---------- Calculs (lecture seule) ---------- */
function calc(L,Z){
  const cc=costOf(L);const n=Z.an.length;const cnt={};Z.an.forEach(a=>cnt[a.sp]=(cnt[a.sp]||0)+1);
  const dang=Z.an.reduce((s,a)=>s+inf(a.sp)[0],0);
  const need={keep:Math.ceil(n/6),vet:Math.ceil(n/(Z.up.clin?40:25)),sec:n?Math.ceil(n/10+dang/25):0};
  const cover={};for(const k of ['keep','vet','sec'])cover[k]=need[k]?Math.min(1,Z.staff[k]/need[k]):1;
  const bonus=(Z.up.cam?8:0)+(Z.up.sas?12:0);
  const per={};let sum=0,mn=100,risk=0;
  for(const sp in cnt){
    const e=Z.enc[sp]||{c:0,cap:0};const d=inf(sp)[0];
    const lvl=cl(35+25*cover.sec+.25*e.c+bonus-d*3-(cnt[sp]>e.cap?10:0));
    const r=Math.pow(1-lvl/100,1.5)*.22*(.2+d/7*.8);
    per[sp]={n:cnt[sp],d,lvl,r,c:e.c};sum+=lvl*cnt[sp];mn=Math.min(mn,lvl);risk+=r;
  }
  const secLvl=n?Math.round(.6*sum/n+.4*mn):100;risk=cl(risk,0,.45);
  const attr=Z.an.reduce((s,a)=>s+spd(a.sp)[1]*(a.h/100)*(a.age<=1?1.25:1),0);
  const priceF=1.9*Math.exp(-Z.ticket/25);
  const mk=[1,1.06,1.14][Z.mkt];
  const vis=Math.round(attr*350*(.4+Z.rep/100)*priceF*(Z.up.jeux?1.08:1)*mk*(1-Z.pen));
  const perV=(Z.up.resto?3.2:0)+(Z.up.boutique?2.2:0);
  const rev=Math.round(vis*(Z.ticket+perV));
  const nEnc=Object.keys(Z.enc).length;
  const wages=Math.round((Z.staff.keep*WAGE.keep+Z.staff.vet*WAGE.vet+Z.staff.sec*WAGE.sec)*cc);
  const feed=Z.an.reduce((s,a)=>s+spd(a.sp)[2],0);
  const upk=Object.keys(Z.up).filter(k=>Z.up[k]&&UPS[k]).reduce((s,k)=>s+UPS[k].y,0)+(Z.up.contrat?2500*nEnc:0);
  const mkc=[0,20000,60000][Z.mkt];
  const brd=Object.values(Z.enc).filter(e=>e.breed).length*6000;
  const over=Math.round((40000+Z.ha*3000+nEnc*1500)*cc);
  const exp=Math.round(wages+feed+upk*cc+mkc*cc+brd*cc+over+vis*1.2);
  const avgH=n?Math.round(Z.an.reduce((s,a)=>s+a.h,0)/n):100;
  const avgC=n?Math.round(Object.keys(cnt).reduce((s,sp)=>s+(Z.enc[sp]?Z.enc[sp].c:0)*cnt[sp],0)/n):100;
  return {n,cnt,dang,need,cover,per,secLvl,risk,attr,vis,perV,rev,exp,profit:rev-exp,wages,feed,avgH,avgC,upk:Math.round(upk*cc+mkc*cc+brd*cc),over};
}
const secLabel=v=>v>=80?'Excellente':v>=65?'Solide':v>=50?'Correcte':v>=35?'Fragile':'Passoire';
const pct=x=>String(Math.round(x*1000)/10).replace('.',',')+' %';

/* ---------- Animaux ---------- */
function addBaby(L,Z,sp,quiet){
  const e=Z.enc[sp];const sex=chance(.5)?'H':'F';
  const inEnc=Z.an.filter(a=>a.sp===sp).length;
  if(!e||inEnc>=e.cap){const g=Math.round(spd(sp)[0]*.35);earn(L,g,1);zlog(Z,`Jeune ${sp.toLowerCase()} cédé à un autre parc (${fmt(g)}).`);if(!quiet)say(L,`🍼 Un bébé ${sp.toLowerCase()} naît, mais l’enclos est plein : il part vers un autre parc pour ${fmt(g)}.`);return null}
  const b={sp,name:babyName(sex),age:0,h:90,sex};Z.an.push(b);Z.rep=cl(Z.rep+3);Z.nb.push({sp,name:b.name});
  if(!quiet)say(L,`🍼 Naissance au zoo : ${b.name}, un bébé ${sp.toLowerCase()} !`);
  track(L,'zooBirths');return b;
}
function sellAnimal(L,Z,a){
  const p=animalValue(a);earn(L,p,1);Z.an=Z.an.filter(x=>x!==a);Z.rep=cl(Z.rep-(a.age>1&&spd(a.sp)[1]>=18?1:0));
  return out(L,`🤝 Tu cèdes ${a.name} (${a.sp.toLowerCase()}) à un autre parc pour ${fmt(p)}.`);
}
function damages(L,lo,hi){const m=Math.round(R(lo,hi)*costOf(L));spend(L,m);return m}

/* ---------- Année ---------- */
function yearZoo(L){
  const Z=mig(L);if(!Z)return;
  Z.y++;const c=calc(L,Z);const weather=.88+Math.random()*.24;
  const vis=Math.round(c.vis*weather);
  const rev=Math.round(vis*(Z.ticket+c.perV));
  const exp=Math.round(c.wages+c.feed+c.upk+c.over+vis*1.2);
  if(rev)earn(L,rev);if(exp)spend(L,exp);
  /* enclos */
  const ctr=Z.up.contrat;
  for(const sp in Z.enc){const e=Z.enc[sp];e.c=cl(e.c-(ctr?R(2,5):R(8,15))+(c.cover.keep>=1?3:0));if(ctr)e.c=Math.max(e.c,70)}
  /* animaux : santé, vieillesse */
  const cnt={};Z.an.forEach(a=>cnt[a.sp]=(cnt[a.sp]||0)+1);
  Z.an.forEach(a=>{
    a.age++;const life=inf(a.sp)[1];const e=Z.enc[a.sp];
    let d=-R(0,5)+Math.round(c.cover.vet*5)+Math.round(c.cover.keep*2)-Math.round((1-c.cover.keep)*10)-Math.round((1-c.cover.vet)*6);
    if(e){if(e.c<35)d-=8;else if(e.c<55)d-=3;else if(e.c>=80)d+=2;if(cnt[a.sp]>e.cap)d-=6}else d-=10;
    if(a.age>life*.8)d-=R(2,6);
    a.h=cl(a.h+d);
  });
  const dead=Z.an.filter(a=>a.h<=5||a.age>inf(a.sp)[1]+R(-2,3));
  if(dead.length){
    Z.an=Z.an.filter(a=>!dead.includes(a));
    const old=dead.filter(a=>a.h>5),sick=dead.filter(a=>a.h<=5);
    if(old.length)say(L,`🕯️ ${old.map(a=>a.name).join(', ')} ${pl(old.length,'s’éteint','s’éteignent')} de vieillesse au zoo. Les soigneurs ont la gorge serrée.`);
    if(sick.length){say(L,`🥀 ${sick.map(a=>a.name).join(', ')} ${pl(sick.length,'n’a pas survécu','n’ont pas survécu')} à des soins insuffisants. La presse locale s’en empare.`);Z.rep=cl(Z.rep-6*sick.length);chg(L,{karma:-2*sick.length,happy:-3})}
    Z.rep=cl(Z.rep-old.length);
  }
  /* reproduction */
  let births=0;
  for(const sp in Z.enc){
    const e=Z.enc[sp];if(!e.breed)continue;const mat=inf(sp)[2];
    const adults=Z.an.filter(a=>a.sp===sp&&a.age>=mat&&a.h>=50);
    const F=adults.filter(a=>a.sex==='F').length,M=adults.filter(a=>a.sex==='H').length;
    if(!F||!M)continue;
    for(let i=0;i<Math.min(F,M,2);i++)if(chance(inf(sp)[3])){addBaby(L,Z,sp);births++}
  }
  /* réputation */
  if(Z.an.length){
    const n2=calc(L,Z);
    let target=35+n2.avgH*.35+(n2.secLvl>70?5:0)+Z.mkt*3-Math.max(0,Z.ticket-32);
    if(c.cover.keep<.7)target-=8;
    Z.rep=cl(Z.rep+Math.round((target-Z.rep)/5)+R(-2,2));
  }else Z.rep=cl(Z.rep+R(-1,1));
  if(Z.rep>=80&&chance(.25))chg(L,{fame:1});
  if(Z.ticket>=40&&chance(.4))say(L,'💸 Les familles râlent : 40 € l’entrée, c’est le prix d’un week-end au ski.');
  /* trésorerie */
  if(L.money<0){Z.rep=cl(Z.rep-3);const k=['keep','sec','vet'].find(x=>Z.staff[x]>(x==='vet'?0:1));if(k&&chance(.6)){Z.staff[k]--;say(L,'📉 Faute d’argent en caisse, un employé du zoo démissionne.')}}
  Z.pen=0;
  const profit=rev-exp;Z.last={y:Z.y,vis,rev,exp,profit,weather:Math.round(weather*100)};Z.hist.push(profit);if(Z.hist.length>8)Z.hist.shift();
  say(L,`🦒 ${Z.name} : ${fmtn(vis)} visiteurs, ${fmt(rev)} de recettes, ${fmt(exp)} de dépenses${births?` et ${births} naissance${births>1?'s':''}`:''}.`);
  trackMax(L,'zooMax',Z.an.length);trackMax(L,'zooSpecies',Object.keys(Z.enc).length);
}

/* ---------- Évènements dynamiques ---------- */
function weightedSpecies(c){
  const w={};for(const sp in c.per)w[sp]=Math.max(.001,c.per[sp].r);
  return String(wpick(w));
}
function escape(L,Z,c){
  const sp=weightedSpecies(c);const pool=Z.an.filter(a=>a.sp===sp);if(!pool.length)return 0;
  const a=pick(pool);const d=inf(sp)[0];const e=Z.enc[sp];const nm=sp.toLowerCase();
  const vets=Z.staff.vet;
  const intro=d>=5?`🚨 Alerte rouge ! Une porte mal verrouillée : ${a.name}, ${nm}, se promène dans les allées du zoo, sous les yeux de visiteurs tétanisés.`
    :d>=2?`⚠️ ${a.name}, ${nm}, a trouvé la sortie de son enclos et trottine vers l’aire de pique-nique. Les sandwiches ne sont plus en sécurité.`
    :`🐾 ${a.name}, ${nm}, s’est faufilé hors de son enclos et fait la tournée du restaurant. Les clients adorent, l’assureur moins.`;
  const gone=()=>!Z.an.includes(a);
  const fixEnc=()=>{if(e)e.c=Math.min(e.c,cl(e.c-20))};
  const fail=(lo,hi,txt)=>{const m=damages(L,lo,hi);Z.rep=cl(Z.rep-(d>=5?18:10));a.h=cl(a.h-15);chg(L,{karma:-1,stress:6,happy:-6});track(L,'zooIncident');return out(L,`${txt} Indemnités et frais d’avocat : ${fmt(m)}.`)};
  modal({title:Z.name,icon:ic(sp),text:intro+' Que fais-tu ?',choices:[
    {t:'Évacuer les visiteurs et boucler le parc',pri:1,fn:()=>{if(gone())return '';fixEnc();Z.pen=cl(Z.pen+.1,0,.9);Z.rep=cl(Z.rep-2);if(chance(.15))a.h=cl(a.h-10);return out(L,`🚧 Le parc est évacué dans le calme. ${a.name} regagne son enclos avec l’équipe vétérinaire. Tu perds une journée de recettes, mais personne n’est blessé.`)}},
    {t:'Endormir l’animal avec une fléchette',fn:()=>{if(gone())return '';fixEnc();const p=cl(.35+.15*Math.min(vets,3)+c.secLvl/300-(d>=5?.1:0),.25,.92);
      if(chance(p)){Z.rep=cl(Z.rep+3);chg(L,{happy:3});return out(L,`💉 Tir parfait du vétérinaire : ${a.name} fait une sieste et regagne l’enclos sur un brancard. Les visiteurs applaudissent.`)}
      return fail(8000,45000,`😱 La fléchette rate sa cible et ${a.name} panique. Quelques visiteurs sont bousculés.`)}},
    {t:'Laisser les agents gérer discrètement',fn:()=>{if(gone())return '';fixEnc();const p=cl(.3+.5*c.cover.sec,.2,.75);
      if(chance(p))return out(L,`🤫 Les agents guident ${a.name} jusqu’à son enclos avec un seau de nourriture. Personne n’a rien vu, ou presque.`);
      return fail(8000,40000,`📰 Un visiteur filme tout et la vidéo fait le tour des réseaux : « Le zoo où les ${nm}s sont en liberté. »`)}},
    {t:'Appeler les pompiers et la gendarmerie',fn:()=>{if(gone())return '';fixEnc();Z.rep=cl(Z.rep-4);a.h=cl(a.h-R(5,20));
      if(d>=5&&chance(.12)){Z.an=Z.an.filter(x=>x!==a);return out(L,`🚒 Les secours sécurisent le parc, mais ${a.name} est confié à un refuge spécialisé : il ne reviendra pas chez toi. Les images passent en boucle aux informations.`)}
      return out(L,`🚒 Gendarmes, pompiers et vétérinaires interviennent. ${a.name} rentre au bercail, un peu vexé. Les images passent au journal de 20 heures.`)}}]});
  return 1;
}
function epidemic(L,Z,c){
  const sps=Object.keys(c.cnt);if(!sps.length)return 0;
  const sp=pick(sps);const nm=sp.toLowerCase();
  const herd=()=>Z.an.filter(a=>a.sp===sp);
  const cost=Math.round((12000+c.n*400)*costOf(L));
  modal({title:Z.name,icon:'🤒',text:`Les ${nm}s toussent, boudent leur repas et se tiennent à l’écart. Le vétérinaire redoute une épidémie qui pourrait gagner tout le parc.`,choices:[
    {t:`Équipe vétérinaire d’urgence (${fmt(cost)})`,pri:1,fn:()=>{spend(L,cost);const ok=chance(Math.min(.95,.8+Z.staff.vet*.03+(Z.up.clin?.05:0)));herd().forEach(a=>a.h=cl(a.h-(ok?R(0,6):R(10,20))));
      if(ok){Z.rep=cl(Z.rep+1);return out(L,`🩺 Traitements, isolement et patience : les ${nm}s se remettent et personne d’autre n’est contaminé.`)}
      Z.rep=cl(Z.rep-3);return out(L,`🩺 L’équipe arrive trop tard pour certains : les ${nm}s sont éprouvés mais soignés. Une rude semaine.`)}},
    {t:'Fermer le parc en quarantaine',fn:()=>{Z.pen=cl(Z.pen+.25,0,.9);const ok=chance(.7);herd().forEach(a=>a.h=cl(a.h-(ok?R(0,5):R(8,15))));
      return out(L,ok?`🚪 Le parc ferme quelques semaines. Cela coûte cher en billets, mais l’épidémie est étouffée dans l’œuf.`:`🚪 La quarantaine freine le mal, sans l’éteindre tout à fait. Les ${nm}s sont affaiblis.`)}},
    {t:'Laisser passer, ça va s’arranger',danger:1,fn:()=>{let lost=0;herd().forEach(a=>{a.h=cl(a.h-R(15,40));if(a.h<=5)lost++});
      Z.an=Z.an.filter(a=>a.h>5);chg(L,{karma:-2});
      if(lost){Z.rep=cl(Z.rep-8);return out(L,`🥀 Faute de soins, ${lost} ${nm}${lost>1?'s ne s’en remettent':' ne s’en remet'} pas. La presse et les associations ne te ratent pas.`)}
      return out(L,`😬 Les ${nm}s s’en sortent de justesse. Tu l’as échappé belle, mais pas question de recommencer.`)}}]});
  return 1;
}
function naming(L,Z){
  const b=Z.nb.shift();Z.nb=[];if(!b)return 0;const a=Z.an.find(x=>x.name===b.name&&x.sp===b.sp);if(!a)return 0;
  const nm=b.sp.toLowerCase();
  modal({title:Z.name,icon:'🍼',text:`Un bébé ${nm} est né ! Il s’appelle pour l’instant « ${b.name} », nom provisoire écrit au feutre sur la fiche. Qui choisit le prénom définitif ?`,choices:[
    {t:'Laisser voter les enfants des écoles',pri:1,fn:()=>{const n=pick(['Chantilly','Patatras','Zébulon','Mimosa','Câlin','Kiwi','Bamboo','Tchoupi']);a.name=n;Z.rep=cl(Z.rep+3);chg(L,{happy:3});return out(L,`🗳️ Les écoliers ont voté : le petit s’appellera ${n}. Une cérémonie est organisée.`)}},
    {t:'Vendre le baptême à un sponsor',fn:()=>{const g=Math.round(R(4000,15000)*costOf(L));earn(L,g);a.name=pick(['Banquette','Crédito','Baguette Junior','Garagiste']);Z.rep=cl(Z.rep-1);return out(L,`💶 Une enseigne locale paie ${fmt(g)} pour baptiser le bébé. Les puristes grincent des dents.`)}},
    {t:'Garder le nom provisoire',fn:()=>out(L,`✏️ ${b.name} reste ${b.name}. Simple, efficace, économique.`)}]});
  return 1;
}

/* ---------- Évènements JSON : effets et conditions ---------- */
function okZoo(L){const Z=mig(L);return Z&&Z.an.length>0?Z:null}
const effects={
  inspection(L,args){
    const Z=okZoo(L);if(!Z)return '';const c=calc(L,Z);const good=c.avgC>=55&&c.cover.vet>=.8&&c.cover.keep>=.8&&c.secLvl>=50;
    const m=(args&&args.mode)||'honest';const cc=costOf(L);
    if(m==='lunch'){spend(L,Math.round(800*cc));chg(L,{karma:-4});
      if(good||chance(.5)){Z.rep=cl(Z.rep+2);return out(L,'🍽️ Le déjeuner trois services convainc l’inspecteur : rapport favorable. Ton karma, lui, digère mal.')}
      const f=damages(L,8000,40000);Z.rep=cl(Z.rep-5);return out(L,`🍽️ L’inspecteur finit le dessert puis dresse un procès-verbal salé : ${fmt(f)} d’amende, et une mention pour « tentative de séduction gastronomique ».`)}
    if(good){Z.rep=cl(Z.rep+6);chg(L,{happy:4,karma:1});return out(L,'🩺 L’inspection vétérinaire se passe très bien : le rapport salue vos soigneurs et vos enclos. Tu l’encadres à l’entrée.')}
    const f=damages(L,5000,30000);Z.rep=cl(Z.rep-4);chg(L,{stress:5});
    for(const sp in Z.enc)Z.enc[sp].c=Math.min(100,Z.enc[sp].c+10);
    return out(L,`🩺 L’inspecteur relève des manquements (effectifs, enclos ou soins) : ${fmt(f)} d’amende et mise en demeure. Tu fais retaper quelques grillages.`);
  },
  protest(L,args){
    const Z=okZoo(L);if(!Z)return '';const c=calc(L,Z);const just=c.avgH<60||c.avgC<50||c.cover.keep<.7;const m=(args&&args.mode)||'dialogue';
    if(m==='com'){spend(L,Math.round(5000*costOf(L)));Z.rep=cl(Z.rep+(just?1:4));return out(L,`📣 Une campagne « Nos animaux, notre fierté » ${just?'passe mal : les militants montrent les photos des enclos défraîchis':'rassure le public'}.`)}
    if(m==='ignore'){if(just){Z.rep=cl(Z.rep-8);chg(L,{karma:-2});return out(L,'📰 Les militants avaient des photos qui parlent : les journaux relaient et la fréquentation chute.')}Z.rep=cl(Z.rep-2);Z.pen=cl(Z.pen+.05,0,.9);return out(L,'🪧 La manifestation fait du bruit mais peu de dégâts. Quelques familles passent leur chemin.')}
    if(m==='police'){Z.rep=cl(Z.rep-6);chg(L,{karma:-3,stress:4});return out(L,'🚓 Faire évacuer les manifestants fait de très belles images… pour la mauvaise cause. Le zoo en pâtit.')}
    if(just){Z.rep=cl(Z.rep+3);chg(L,{karma:2});return out(L,'🤝 Tu écoutes les militants, reconnais les défauts du parc et promets des travaux. Ils repartent mi-figue mi-raisin, mais le public apprécie.')}
    Z.rep=cl(Z.rep+2);chg(L,{happy:2});return out(L,'🤝 Tu invites les militants à visiter les coulisses. Ils repartent avec un sac de peluches et moins de pancartes.');
  },
  sponsor(L,args){
    const Z=okZoo(L);if(!Z)return '';const m=(args&&args.mode)||'accept';
    if(m==='accept'){const g=Math.round(R(15000,60000)*costOf(L));earn(L,g);Z.rep=cl(Z.rep-2);return out(L,`🏷️ Un fabricant de croquettes finance le parc : ${fmt(g)} contre son logo sur chaque panneau. Même les flamants roses portent le badge.`)}
    chg(L,{happy:2,karma:1});return out(L,'🙅 Tu déclines poliment. Les allées resteront sans logo, et le budget un peu plus serré.');
  },
  ecole(L){
    const Z=okZoo(L);if(!Z)return '';const g=Math.round(R(4000,18000)*costOf(L));earn(L,g);Z.rep=cl(Z.rep+2);
    return out(L,`🚌 Trois classes de CE2 débarquent pour une sortie pédagogique : ${fmt(g)} de recettes et un concert de « Regardez, un ${pick(Z.an).sp.toLowerCase()} ! ».`);
  },
  viral(L){
    const Z=okZoo(L);if(!Z)return '';const a=pick(Z.an);
    if(chance(.8)){const g=Math.round(R(2000,12000)*costOf(L));earn(L,g,1);Z.rep=cl(Z.rep+R(4,9));chg(L,{fame:R(1,3),happy:3});return out(L,`📱 Une vidéo de ${a.name} (${a.sp.toLowerCase()}) faisant n’importe quoi dépasse le million de vues. Les visiteurs affluent, les dons aussi : ${fmt(g)}.`)}
    Z.rep=cl(Z.rep-4);return out(L,`📱 Une vidéo montre ${a.name} dans une posture embarrassante, sous-titrée « le zoo n’a même pas de quoi le nourrir ». Fausse, mais virale.`);
  },
  greve(L,args){
    const Z=okZoo(L);if(!Z)return '';const m=(args&&args.mode)||'negocier';const cc=costOf(L);
    if(m==='negocier'){const p=damages(L,8000,20000);Z.rep=cl(Z.rep+1);chg(L,{happy:1});return out(L,`🤝 Après une nuit de discussions et de café froid, une prime de ${fmt(p)} met fin à la grève.`)}
    if(m==='interim'){const p=damages(L,5000,12000);Z.rep=cl(Z.rep-1);Z.an.forEach(a=>a.h=cl(a.h-R(0,4)));return out(L,`🧢 Des intérimaires à ${fmt(p)} assurent le service. Les animaux ne reconnaissent pas leurs soigneurs et le font savoir.`)}
    Z.an.forEach(a=>a.h=cl(a.h-R(5,12)));Z.rep=cl(Z.rep-4);chg(L,{karma:-1});
    if(Z.staff.keep>1&&chance(.5)){Z.staff.keep--;return out(L,'🪧 Tu tiens bon. La grève dure, les animaux souffrent et un soigneur ne reviendra pas.')}
    return out(L,'🪧 Tu tiens bon. La grève s’essouffle au bout d’une semaine, mais l’ambiance est glaciale.');
  },
  legs(L){
    const Z=okZoo(L);if(!Z)return '';const g=Math.round(R(10000,50000)*costOf(L));earn(L,g,1);Z.rep=cl(Z.rep+1);chg(L,{happy:3,karma:1});
    return out(L,`💌 Une vieille dame, abonnée depuis quarante ans, lègue ${fmt(g)} au zoo « pour que les girafes soient heureuses ». Tu fais poser une plaque.`);
  },
  surprise(L){
    const Z=okZoo(L);if(!Z)return '';
    const sps=Object.keys(Z.enc).filter(sp=>Z.an.some(a=>a.sp===sp&&a.sex==='F'&&a.age>=inf(sp)[2])&&Z.an.some(a=>a.sp===sp&&a.sex==='H'&&a.age>=inf(sp)[2]));
    if(!sps.length)return out(L,'🍼 Les soigneurs ont cru à une grossesse, c’était juste un bon repas. Fausse alerte.');
    const sp=pick(sps);const b=addBaby(L,Z,sp,true);
    if(!b)return out(L,`🍼 Surprise : une naissance dans l’enclos des ${sp.toLowerCase()}s ! Faute de place, le petit part vers un autre parc.`);
    return out(L,`🍼 Surprise ! ${b.name}, un bébé ${sp.toLowerCase()}, voit le jour sans que personne s’y attende. Le registre est mis à jour au stylo.`);
  }
};
const conds={open(L){return !!okZoo(L)}};
function ev(id,icon,w,txt,choices,extra){
  const e={id:MOD+'_'+id,category:'career_event',icon,conditions:Object.assign({min_age:21,mod_state:'zoo',mod_cond:{mod:MOD,fn:'open'}},extra||{}),probability_weight:w,prompt_text:txt};
  if(Array.isArray(choices))e.choices=choices.map(([t,fn,args])=>({choice_text:t,consequences:{mod_effect:{mod:MOD,fn,args:args||{}}}}));
  else e.consequences={mod_effect:{mod:MOD,fn:choices}};
  return e;
}
const eventsDb=[
  ev('inspection','🩺',.1,'Les services vétérinaires de l’État annoncent une inspection surprise dans ton zoo. L’inspecteur arrive avec sa mallette et un air très peu commode.',[['Tout montrer, en toute transparence','inspection',{mode:'honest'}],['Lui offrir un déjeuner un peu trop généreux','inspection',{mode:'lunch'}]]),
  ev('militants','🪧',.09,'Un collectif de militants pour la cause animale manifeste devant l’entrée du zoo avec des pancartes, un mégaphone et un panda géant en carton.',[['Les inviter à dialoguer','protest',{mode:'dialogue'}],['Lancer une campagne de communication','protest',{mode:'com'}],['Faire comme si de rien n’était','protest',{mode:'ignore'}],['Les faire évacuer','protest',{mode:'police'}]]),
  ev('sponsor','🏷️',.07,'Un fabricant de croquettes veut devenir le « partenaire officiel » du zoo, avec son logo sur chaque panneau, poubelle et maillot de soigneur.',[['Accepter le contrat','sponsor',{mode:'accept'}],['Refuser poliment','sponsor',{mode:'refuse'}]]),
  ev('ecole','🚌',.08,'Une école de la région réserve une sortie pédagogique au zoo.','ecole'),
  ev('viral','📱',.07,'Une vidéo tournée dans ton zoo commence à circuler sur les réseaux sociaux.','viral'),
  ev('greve','🪧',.05,'Les soigneurs de ton zoo se mettent en grève : ils réclament une prime « odeur de fauve ».',[['Négocier une prime','greve',{mode:'negocier'}],['Faire appel à des intérimaires','greve',{mode:'interim'}],['Tenir bon','greve',{mode:'tenir'}]]),
  ev('legs','💌',.04,'Le notaire t’appelle : une habituée du zoo a pensé au parc dans son testament.','legs'),
  ev('surprise','🍼',.07,'Un des soigneurs jure avoir vu un petit où il n’y en avait pas la veille.','surprise')
];

/* ---------- Panneaux ---------- */
const plural=n=>`${n} animal${n>1?'aux':''}`.replace('animalaux','animaux');
function pZoo(){
  const L=cur();const Z=mig(L);if(!Z)return pOpen(L);
  const c=calc(L,Z);
  const lines=[
    card(Z.name,plural(c.n),`Valeur estimée du parc : ${fmt(zooValue(L))}`,statLine('Réputation',Z.rep)+statLine('Santé moyenne des animaux',c.avgH)+statLine('Sécurité du public',c.secLvl)),
    note(`Prévision annuelle : ${fmtn(c.vis)} visiteurs, ${fmt(c.rev)} de recettes pour ${fmt(c.exp)} de dépenses, soit ${c.profit>=0?'un bénéfice':'un déficit'} d’environ ${fmt(Math.abs(c.profit))}.`)];
  if(Z.last)lines.push(note(`Bilan de l’an dernier : ${fmtn(Z.last.vis)} visiteurs, résultat ${Z.last.profit>=0?'+':'−'}${fmt(Math.abs(Z.last.profit))}.`));
  if(c.n&&(c.cover.keep<1||c.cover.vet<1||c.cover.sec<1))lines.push(note('⚠️ Sous-effectif : vos équipes ne suffisent pas pour tous les animaux. Les bêtes et la sécurité en souffrent.'));
  if(c.risk>=.15)lines.push(note(`🚨 Risque d’évasion élevé (${pct(c.risk)} par an). Renforce la sécurité.`));
  return {title:Z.name,html:lines.join('')+group('Gestion',[
    nav('🏞️','Enclos et animaux',`${Object.keys(Z.enc).length} enclos sur ${Z.ha*2} possibles`,pEnc),
    nav('🧑‍🌾','Personnel',`${Z.staff.keep+Z.staff.vet+Z.staff.sec} employés · ${fmtk(c.wages)} par an`,pStaff),
    nav('🛡️','Sécurité du public',`Niveau ${secLabel(c.secLvl).toLowerCase()} · risque d’évasion ${pct(c.risk)}`,pSec),
    nav('🎟️','Entrées et comptes',`Entrée à ${fmt(Z.ticket)}`,pFin),
    nav('🍼','Reproduction',`${Object.values(Z.enc).filter(e=>e.breed).length} programme${Object.values(Z.enc).filter(e=>e.breed).length>1?'s':''} en cours`,pBreed),
    nav('🏗️','Aménagements et terrain',`${Z.ha} hectares`,pUp)])
    +group('Cession',[row({ic:'🤝',t:'Vendre le parc',s:fmt(zooValue(L)),danger:1,a:()=>pushPanel(confirmP('Vendre le zoo ?','Un repreneur rachète le terrain, les enclos et tous les animaux.',()=>{const v=zooValue(L);earn(L,v,1);L.zoo=null;return out(L,`🤝 Tu vends ton zoo pour ${fmt(v)}. Les suricates te font une haie d’honneur.`)},'Vendre'))})])};
}
function pOpen(L){
  const p=Math.round(250000*costOf(L));const def=`${pick(ZOO_NAMES)} de ${L.city}`;
  return {title:'Zoo',html:note('Ouvre ton propre parc zoologique : achète un terrain, construis des enclos, recrute du personnel et accueille des animaux exotiques. Les visiteurs paient l’entrée, les animaux coûtent cher à nourrir… et à garder en sécurité.')
    +`<div class="card"><label class="f">Nom du parc<input id="zoo_name" value="${esc(def)}" autocomplete="off" maxlength="40"></label></div>`
    +group('Ouvrir',[act(L,{ic:'🦒',t:'Acheter un terrain et ouvrir un zoo',s:`${fmt(p)} · 4 hectares`,cost:p,min:21,fn:L=>{
      const el=document.getElementById('zoo_name');const raw=el&&el.value?String(el.value).trim().slice(0,40):'';const n=raw||def;
      L.zoo={name:n,an:[],rep:50,y:0,land:p};mig(L);return out(L,`🦒 Tu ouvres « ${n} ». Il reste à bâtir les enclos, recruter une équipe et trouver quelques pensionnaires.`)}})])};
}
function pEnc(){
  const L=cur();const Z=mig(L);if(!Z)return pOpen(L);const c=calc(L,Z);
  const rows=Object.keys(Z.enc).map(sp=>{const e=Z.enc[sp];const k=c.cnt[sp]||0;return nav(ic(sp),sp,`${k}/${e.cap} places · état ${e.c} % · danger ${inf(sp)[0]}/7`,()=>pSpecies(sp))});
  const total=Object.keys(Z.enc).reduce((s,sp)=>s+Math.round(encCost(L,sp,Z.enc[sp].cap)*.12*(1-Z.enc[sp].c/100)),0);
  const maint=act(L,{ic:'🧰',t:'Entretien de tous les enclos',s:Object.keys(Z.enc).length?fmt(total):'',cost:total,key:'zoo_maint_all',dis:Object.keys(Z.enc).length?(total<=0?'Tout est en parfait état':''):'Aucun enclos',fn:L=>{Object.values(Z.enc).forEach(e=>e.c=100);return out(L,'🧰 Tous les enclos sont remis à neuf : grillages, mares et bardages.')}});
  const build=group('Construire un enclos',Object.keys(SP).filter(sp=>!Z.enc[sp]).map(sp=>{const cost=encCost(L,sp,4);const full=Object.keys(Z.enc).length>=Z.ha*2;
    return act(L,{ic:ic(sp),t:`Enclos pour ${sp.toLowerCase()}`,s:`${fmt(cost)} · 4 places · animal ${fmt(spd(sp)[0])} · attractivité ${spd(sp)[1]}`,cost,dis:full?'Terrain plein : agrandis le parc':'',fn:L=>{Z.enc[sp]={c:100,cap:4,breed:false};return out(L,`🏞️ Un enclos pour ${sp.toLowerCase()}s sort de terre.`)}})}));
  return {title:'Enclos et animaux',html:note('Un enclos par espèce. Il faut une place libre pour accueillir un animal ; un enclos mal entretenu augmente le risque d’évasion et fatigue les bêtes.')
    +group('Enclos existants',rows)+(rows.length?group('',[maint]):'')+build};
}
function pSpecies(sp){
  const L=cur();const Z=mig(L);const e=Z&&Z.enc[sp];if(!Z||!e)return {title:sp,html:note('Cet enclos n’existe plus.')};
  const list=Z.an.filter(a=>a.sp===sp);const price=spd(sp)[0];
  const mcost=Math.round(encCost(L,sp,e.cap)*.12*(1-e.c/100));const ecost=Math.round(encCost(L,sp,2)*1.1);
  const acts=[
    act(L,{ic:'🧰',t:'Entretien de l’enclos',s:mcost>0?fmt(mcost):'',cost:mcost,key:'zoo_m_'+sp,dis:mcost<=0?'En parfait état':'',fn:L=>{e.c=100;return out(L,`🧰 L’enclos des ${sp.toLowerCase()}s est remis à neuf.`)}}),
    act(L,{ic:'➕',t:'Agrandir l’enclos (+2 places)',s:fmt(ecost),cost:ecost,dis:e.cap>=20?'Taille maximale atteinte':'',fn:L=>{e.cap+=2;return out(L,`📐 L’enclos des ${sp.toLowerCase()}s passe à ${e.cap} places.`)}}),
    act(L,{ic:ic(sp),t:`Acheter un ${sp.toLowerCase()}`,s:`${fmt(price)} · attractivité ${spd(sp)[1]} · entretien ${fmt(spd(sp)[2])}/an`,cost:price,dis:list.length>=e.cap?'Enclos complet':'',fn:L=>{const sex=chance(.5)?'H':'F';const a={sp,name:babyName(sex),age:R(1,5),h:R(75,100),sex};Z.an.push(a);trackMax(L,'zooMax',Z.an.length);return out(L,`${ic(sp)} ${a.name}, ${a.sex==='F'?'une':'un'} ${sp.toLowerCase()} de ${An(a.age)}, rejoint le zoo.`)}}),
    row({ic:'🍼',t:e.breed?'Programme de reproduction : actif':'Programme de reproduction : arrêté',s:'Un mâle et une femelle adultes sont nécessaires (6 000 €/an)',a:()=>run(()=>{e.breed=!e.breed;return out(L,e.breed?`🍼 Programme de reproduction lancé pour les ${sp.toLowerCase()}s.`:`🍼 Programme de reproduction arrêté pour les ${sp.toLowerCase()}s.`)})}),
    list.length?'':row({ic:'🧱',t:'Démolir l’enclos',s:`Récupère ${fmt(Math.round(encCost(L,sp,e.cap)*.3))}`,danger:1,a:()=>run(()=>{const g=Math.round(encCost(L,sp,e.cap)*.3);earn(L,g,1);delete Z.enc[sp];STACK.pop();return out(L,`🧱 L’enclos des ${sp.toLowerCase()}s est démoli (${fmt(g)} de matériaux revendus).`)})})];
  const young=list.filter(a=>a.age<=2);
  const sellYoung=young.length?act(L,{ic:'🐣',t:`Vendre les jeunes (${young.length})`,s:fmt(young.reduce((s,a)=>s+animalValue(a),0)),fn:L=>{const g=young.reduce((s,a)=>s+animalValue(a),0);Z.an=Z.an.filter(a=>!young.includes(a));earn(L,g,1);return out(L,`🐣 Tu cèdes ${young.length} jeune${young.length>1?'s':''} ${sp.toLowerCase()} à d’autres parcs pour ${fmt(g)}.`)}}):'';
  const ani=list.map(a=>act(L,{ic:a.sex==='F'?'♀️':'♂️',t:`${a.name}${a.age<=1?' (bébé)':''}`,s:`${An(a.age)} · santé ${a.h} % · vendu ${fmt(animalValue(a))}`,fn:L=>sellAnimal(L,Z,a)}));
  return {title:sp,html:card(sp,`${list.length}/${e.cap} places`,`${DANG[inf(sp)[0]]} · attractivité ${spd(sp)[1]} · espérance de vie ${An(inf(sp)[1])}`,statLine('État de l’enclos',e.c))+group('Actions',acts)+(sellYoung?group('',[sellYoung]):'')+(ani.length?group('Pensionnaires (toucher pour vendre)',ani):'')};
}
function pStaff(){
  const L=cur();const Z=mig(L);if(!Z)return pOpen(L);const c=calc(L,Z);const cc=costOf(L);
  const defs=[['keep','🧑‍🌾','Soigneurs','chacun gère 6 animaux'],['vet','🩺','Vétérinaires',`chacun suit ${Z.up.clin?40:25} animaux`],['sec','💂','Agents de sécurité','un pour 10 animaux, plus pour les fauves']];
  const html=defs.map(([k,i,n,d])=>{const w=Math.round(WAGE[k]*cc);const sev=Math.round(w*.4);
    return `<h3 class="sec">${n}</h3>`+card(`${Z.staff[k]} en poste`,`Besoin : ${c.need[k]}`,`${d} · ${fmt(w)} par an chacun`,statLine('Couverture',Math.round(c.cover[k]*100)))
      +group('',[act(L,{ic:'➕',t:`Recruter (${fmt(2500)})`,s:`Salaire ${fmt(w)}/an`,cost:2500,dis:Z.staff[k]>=40?'Effectif maximal':'',fn:L=>{Z.staff[k]++;return out(L,`${i} Un nouveau membre rejoint l’équipe (${n.toLowerCase()}).`)}}),
        act(L,{ic:'➖',t:'Licencier',s:`Indemnités ${fmt(sev)}`,cost:sev,dis:Z.staff[k]<=0?'Personne à licencier':'',fn:L=>{Z.staff[k]--;chg(L,{karma:-1});return out(L,`${i} Tu te sépares d’un employé (${n.toLowerCase()}). L’ambiance fraîchit.`)}})])}).join('');
  return {title:'Personnel',html:note(`Masse salariale : ${fmt(c.wages)} par an. Le sous-effectif fait baisser la santé des animaux et la sécurité du public.`)+html};
}
function pSec(){
  const L=cur();const Z=mig(L);if(!Z)return pOpen(L);const c=calc(L,Z);
  const sps=Object.keys(c.per).sort((a,b)=>c.per[b].r-c.per[a].r);
  const mat=sps.map(sp=>{const p=c.per[sp];return row({ic:ic(sp),t:`${sp} · danger ${p.d}/7 (${DANG[p.d]})`,s:`Enclos ${p.c} % · sécurité ${Math.round(p.lvl)} % · risque ${pct(p.r)}/an`,right:p.r>=.06?'🔴':p.r>=.025?'🟠':'🟢',a:()=>pushPanel(()=>pSpecies(sp))})});
  const ups=['cam','sas'].map(k=>{const U=UPS[k];const cost=Math.round(U.p*costOf(L));return act(L,{ic:U.ic,t:U.n,s:Z.up[k]?'Installé':`${fmt(cost)} · ${U.d}`,cost:Z.up[k]?0:cost,dis:Z.up[k]?'Déjà installé':'',fn:L=>{Z.up[k]=1;return out(L,`${U.ic} ${U.n} : installation terminée.`)}})});
  return {title:'Sécurité du public',html:card('Niveau de sécurité',`${c.secLvl} % · ${secLabel(c.secLvl)}`,`Risque d’évasion : ${pct(c.risk)} par an`,statLine('Agents de sécurité',Math.round(c.cover.sec*100))+statLine('État moyen des enclos',c.avgC))
    +note('Le niveau dépend des agents, de l’état des enclos, des équipements et de la dangerosité des espèces. Une évasion peut coûter cher en indemnités et en réputation.')
    +group('Les risques du zoo',mat)+group('Équipements de sécurité',ups)};
}
function pFin(){
  const L=cur();const Z=mig(L);if(!Z)return pOpen(L);const c=calc(L,Z);
  const presets=[8,12,16,20,25,32,40].map(t=>act(L,{ic:t===Z.ticket?'✅':'🎟️',t:`Billet à ${fmt(t)}`,s:t===Z.ticket?'Tarif actuel':t<12?'Accessible, très fréquenté':t>=32?'Élitiste : réputation en baisse':'',dis:t===Z.ticket?'Tarif actuel':'',fn:L=>{Z.ticket=t;return out(L,`🎟️ L’entrée passe à ${fmt(t)}.`)}}));
  const mk=['Aucune publicité','Campagne locale (20 000 €/an)','Campagne nationale (60 000 €/an)'].map((n,i)=>act(L,{ic:i===Z.mkt?'✅':'📣',t:n,s:i===Z.mkt?'En cours':'',dis:i===Z.mkt?'En cours':'',fn:L=>{Z.mkt=i;return out(L,`📣 Budget de communication : ${n.toLowerCase()}.`)}}));
  const lines=[['Entrées vendues',c.vis*Z.ticket],['Restaurant et boutique',Math.round(c.vis*c.perV)],['Salaires',-c.wages],['Nourriture des animaux',-c.feed],['Équipements, publicité, programmes',-c.upk],['Frais divers et accueil',-(c.over+Math.round(c.vis*1.2))]].map(([n,v])=>`<div class="stat"><b>${esc(n)}</b><span class="n">${v>=0?'+':'−'}${fmt(Math.abs(v))}</span></div>`).join('');
  return {title:'Entrées et comptes',html:card('Résultat prévu',`${c.profit>=0?'+':'−'}${fmt(Math.abs(c.profit))}`,`${fmtn(c.vis)} visiteurs attendus · réputation ${Z.rep} %`,lines)
    +note('Un billet cher rapporte plus par visiteur, mais en fait venir moins ; le prix idéal se situe autour de 25 €. Les recettes sont versées chaque année, selon la météo et la saison.')
    +group('Prix de l’entrée',presets)+group('Communication',mk)};
}
function pBreed(){
  const L=cur();const Z=mig(L);if(!Z)return pOpen(L);
  const rows=Object.keys(Z.enc).map(sp=>{const e=Z.enc[sp];const mat=inf(sp)[2];const ad=Z.an.filter(a=>a.sp===sp&&a.age>=mat&&a.h>=50);const F=ad.filter(a=>a.sex==='F').length,M=ad.filter(a=>a.sex==='H').length;
    const couples=Math.min(F,M);
    return act(L,{ic:ic(sp),t:`${sp} : ${couples} couple${couples>1?'s':''}`,s:`${M} mâle${M>1?'s':''}, ${F} femelle${F>1?'s':''} adultes · ${e.breed?'programme actif':'programme arrêté'} · fécondité ${pct(inf(sp)[3])}`,fn:L=>{e.breed=!e.breed;return out(L,e.breed?`🍼 Programme de reproduction lancé pour les ${sp.toLowerCase()}s.`:`🍼 Programme de reproduction arrêté pour les ${sp.toLowerCase()}s.`)}})});
  const young=Z.an.filter(a=>a.age<=2);const val=young.reduce((s,a)=>s+animalValue(a),0);
  return {title:'Reproduction',html:note('Chaque année, un couple adulte en bonne santé peut donner naissance. Les petits sont adorés du public (+ d’attractivité) ; si l’enclos est plein, ils sont cédés à un autre parc. Toucher une espèce active ou arrête son programme (6 000 € par an).')
    +group('Programmes',rows)
    +group('Vente des petits',[act(L,{ic:'🐣',t:`Vendre tous les jeunes (${young.length})`,s:young.length?fmt(val):'',dis:young.length?'':'Aucun jeune',fn:L=>{Z.an=Z.an.filter(a=>!young.includes(a));earn(L,val,1);return out(L,`🐣 ${young.length} jeune${young.length>1?'s':''} ${young.length>1?'partent':'part'} vers d’autres parcs pour ${fmt(val)}.`)}})])};
}
function pUp(){
  const L=cur();const Z=mig(L);if(!Z)return pOpen(L);const cc=costOf(L);const eCost=Math.round(60000*cc);
  const ups=Object.keys(UPS).map(k=>{const U=UPS[k];const cost=Math.round(U.p*cc);return act(L,{ic:U.ic,t:U.n,s:Z.up[k]?'Installé':`${fmt(cost)} · ${U.d}`,cost:Z.up[k]?0:cost,dis:Z.up[k]?'Déjà installé':'',fn:L=>{Z.up[k]=1;return out(L,`${U.ic} ${U.n} : c’est fait.`)}})});
  return {title:'Aménagements et terrain',html:card('Terrain',`${Z.ha} hectares`,`${Object.keys(Z.enc).length} enclos sur ${Z.ha*2} emplacements`)
    +group('Terrain',[act(L,{ic:'🌳',t:'Acheter un hectare de plus',s:`${fmt(eCost)} · 2 emplacements d’enclos`,cost:eCost,dis:Z.ha>=30?'Superficie maximale':'',fn:L=>{Z.ha++;Z.land+=Math.round(eCost*.8);return out(L,`🌳 Le zoo s’agrandit : ${Z.ha} hectares.`)}})])
    +group('Aménagements',ups)};
}

/* ---------- Module ---------- */
registerMod({
  id:MOD,
  year:yearZoo,
  events(L){
    const Z=mig(L);if(!Z||!Z.an.length)return 0;
    let q=0;const c=calc(L,Z);
    if(Z.nb.length)q+=naming(L,Z);else Z.nb=[];
    if(q<2&&chance(c.risk))q+=escape(L,Z,c);
    const crowd=Object.keys(c.cnt).some(sp=>Z.enc[sp]&&c.cnt[sp]>Z.enc[sp].cap);
    const pe=.03+(1-c.cover.vet)*.14+(crowd?.03:0)-(Z.up.clin?.02:0);
    if(q<2&&chance(Math.max(.01,pe)))q+=epidemic(L,Z,c);
    return q;
  },
  eventsDb,effects,conds,
  activities(L){return [{ic:'🦒',t:'Zoo',s:L.zoo?L.zoo.name:'Ouvre ton parc animalier',panel:pZoo,min:21}]},
  assetRows(L){return [nav('🦒','Zoo',L.zoo?`${L.zoo.name} · ${plural((L.zoo.an||[]).length)}`:'Ouvre ton parc animalier',pZoo)]},
  netWorth(L){return zooValue(L)},
  inherit(D,L){if(D&&D.zoo&&!L.zoo){L.zoo=D.zoo;mig(L)}},
  badges(L){return L.zoo&&L.zoo.name?['🦒 Directeur de zoo'.replace('Directeur',ge(L,'Directeur','Directrice'))]:[]}
});
})();
