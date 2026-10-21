/* Deux Vies — module « Cinéma » (id showbiz)
   Deux carrières spéciales : ACTEUR (castings, adéquation au rôle, contacts, réputation, publicités et plateaux télé de star)
   et RÉALISATEUR (11 genres, budgets, casting, incidents de tournage, box-office, critique, César, Palme d’or, filmographie).
   État : L.sb = {contacts, filmo, aff, crit, drep, fund, script, pub, talk, off, adl, tvl, yr, last} ; L.films (réalisateur, format de la version simple) ;
   L.job.works / L.job.agent (anciens champs) sont repris. Monde : G.sb = {trend, hit}. */
(()=>{
const MOD='showbiz';
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const etoiles=n=>{const k=Math.round(lim(n,0,5));return '★'.repeat(k)+'☆'.repeat(5-k)};
const dec=n=>String(Math.round(n*10)/10).replace('.',',');
try{if(typeof FEM!=='undefined'){FEM['comédien']=FEM['comédien']||'comédienne'}}catch(e){}

const LAD_A=['Comédien de doublage','Figurant','Second rôle','Premier rôle','Star de cinéma'];
const LAD_R=['Assistant réalisateur','Réalisateur','Réalisateur reconnu','Maître du cinéma'];

/* ---------- Données ---------- */
// poids [apparence, jeu, notoriété] par genre (somme 0,75 ; le reste = affinité avec le genre)
const PROF={'Action':[.25,.2,.3],'Comédie':[.15,.45,.15],'Drame':[.1,.4,.25],'Horreur':[.2,.3,.25],'Science-fiction':[.2,.25,.3],'Romance':[.4,.25,.1],'Animation':[.05,.55,.15],'Thriller':[.15,.35,.25],'Documentaire':[.05,.3,.4],'Western':[.2,.25,.3],'Comédie musicale':[.2,.4,.15]};
const PRESS={'Drame':.45,'Documentaire':.5,'Thriller':.2,'Western':.15,'Romance':0,'Science-fiction':-.05,'Animation':.1,'Comédie':-.15,'Horreur':-.3,'Action':-.4,'Comédie musicale':-.05};
const BOX={'Action':2.4,'Science-fiction':2.2,'Animation':2.5,'Comédie':2,'Horreur':2.6,'Romance':1.5,'Drame':1.1,'Thriller':1.6,'Documentaire':.6,'Western':1,'Comédie musicale':1.4};
const PALMEF={'Drame':1.3,'Documentaire':1.2,'Thriller':1.1,'Romance':1,'Western':1,'Animation':.8,'Science-fiction':.7,'Comédie musicale':.6,'Horreur':.5,'Comédie':.5,'Action':.4};
const KIND={film:{n:'Film',ic:'🎬',pay:1,fame:1},serie:{n:'Série',ic:'📺',pay:.8,fame:.8},pub:{n:'Publicité',ic:'📣',pay:1.1,fame:.4},theatre:{n:'Théâtre',ic:'🎭',pay:.45,fame:.5}};
const ROLES=[{n:'Voix de doublage',pay:3000,req:0,prest:1},{n:'Figuration',pay:2500,req:0,prest:1},{n:'Petit rôle',pay:6000,req:5,prest:2},{n:'Second rôle',pay:22000,req:20,prest:3},{n:'Premier rôle',pay:80000,req:40,prest:4},{n:'Rôle-titre',pay:250000,req:60,prest:5}];
const LV_ROLES=[[0,0,0,1,1,2],[1,2,2,3],[2,3,3,4],[3,4,4,5],[4,5,5,5]];
const REQ_LV=[0,5,20,40,60];
const SERIE_A=['Brigade','Cabinet','Commissariat','Hôpital','Village','Lycée','Boulangerie','Famille','Quartier','Pension'];
const SERIE_B=['Saint-Léon','de la Rive','des Lilas','Moreau','du Port','Bellevue','des Tilleuls','de Mérignac'];
const PIECES=['Le Cid','Cyrano de Bergerac','Les Fourberies de Scapin','Le Bourgeois gentilhomme','Phèdre','On ne badine pas avec l’amour','Fin de partie','Le Jeu de l’amour et du hasard'];
const BRANDS=[['Parfum Éclat de Lune','un parfum',.1],['Montres Maison Vauclair','des montres de luxe',.05],['Eau Source Cristalline','une eau minérale',.04],['Voitures Citrovelle','une berline familiale',.12],['Fromages Pâturâge','un camembert',.08],['Banque Mutuelle du Sud','une banque',.18],['Café Grand’Mère Noire','un café',.06],['Prêt-à-porter Rue Mazarine','une ligne de vêtements',.07],['Yaourts Prairie d’Or','des yaourts',.05],['Lessive Blancheur Totale','une lessive',.1]];
const TALKS=['Le Grand Canapé','Vivement Samedi Soir','Quotidien Express','C’est dans mon salon','La Grande Soirée','Midi chez vous','Le Divan de minuit','Tout le monde en parle-moi'];
const KLAB={dir:['Réalisateur','Réalisatrice'],act:['Acteur','Actrice'],cast:['Directeur de casting','Directrice de casting'],prod:['Producteur','Productrice']};
const KIC={dir:'🎥',act:'🎭',cast:'📋',prod:'💼'};
const ACT_INTRO=['Le directeur de casting te fait entrer dans une salle qui sent le café froid.','Tu patientes dans le couloir avec quinze sosies de toi-même.','On te tend trois pages de texte et dix minutes de préparation.','Une caméra rouge te regarde fixement. Elle ne cligne pas.'];
const FAILS=['On te remercie, « on te rappellera ». Personne ne rappelle jamais.','Le rôle revient à un cousin du producteur.','Tu es trop grand, trop petit, trop blond ou pas assez. Au choix.','Ton audition était bien, mais celle d’un autre était un feu d’artifice.','Le réalisateur cherchait « quelqu’un de plus… comment dire… moins toi ».'];
const WINS=['Le réalisateur se lève et applaudit. Bon signe.','On te rappelle avant même que tu aies repris le métro.','Le directeur de casting t’appelle « mon trésor » : tu as le rôle.','Après dix minutes de silence, la production lâche : « C’est lui. C’est elle. »'];
const INCIDENTS=[
 {t:'Une tempête s’invite sur le tournage et menace le calendrier.',c:[['Tout tourner en intérieur',-3,'Vous réécrivez la scène dans un garage : plus intime, moins spectaculaire.'],['Attendre l’éclaircie',2,'Le soleil revient, la lumière est sublime, la production grince des dents.'],['Tourner sous la pluie coûte que coûte',[8,-8],'La scène sous le déluge deviendra culte… ou noyée.']]},
 {t:'Ta vedette fait un caprice : elle ne sortira de sa loge qu’avec des macarons.',c:[['Aller chercher les macarons',1,'Quarante macarons plus tard, la scène est dans la boîte.'],['Faire tourner sans elle',-4,'Le champ-contrechamp se fait avec une doublure. Ça se voit.'],['La recadrer fermement',[5,-6],'Un silence glacial… puis une performance électrique, ou pas.']]},
 {t:'Le producteur veut absolument un placement de produit dans la scène finale.',c:[['Refuser net',3,'Intégrité artistique sauvée. Le producteur boude.'],['Accepter avec ironie',2,'Le yaourt apparaît dans un plan drôle. Tout le monde y gagne.'],['Accepter sans discuter',-5,'Le yaourt occupe la moitié de l’écran.']]},
 {t:'Le chef opérateur propose un plan-séquence de sept minutes. Très risqué.',c:[['Tenter le plan-séquence',[9,-7],'Quatorzième prise : le plan est… quelque chose.'],['Découper classiquement',0,'Tu restes sur du solide.'],['Négocier un plan de quatre minutes',3,'Compromis élégant.']]},
 {t:'Une scène clé ne fonctionne pas : le dialogue sonne faux.',c:[['Réécrire la nuit même',[7,-3],'Au petit matin, la scène brille ou tombe à plat.'],['Laisser les acteurs improviser',[6,-5],'L’improvisation est un pari : tu le prends.'],['Couper la scène au montage',-2,'Le film y perd un peu de chair.']]},
 {t:'Le budget dérape : il manque de quoi payer la dernière semaine.',c:[['Rogner sur les décors',-3,'Les couloirs de l’hôpital ressemblent à une cave.'],['Négocier une rallonge',[4,-4],'Le producteur grogne puis signe… ou pas.'],['Écourter le tournage',-5,'Le dernier acte est tourné à la va-vite.']]}
];

/* ---------- État ---------- */
const isAct=L=>!!(L&&L.job&&L.job.sp&&L.job.c==='acteur');
const isDir=L=>!!(L&&L.job&&L.job.sp&&L.job.c==='realisateur');
function sb(L){
  let s=L.sb;if(!s||typeof s!=='object')s=L.sb={};
  if(!Array.isArray(s.contacts))s.contacts=[];
  if(!Array.isArray(s.filmo))s.filmo=[];
  if(!s.aff||typeof s.aff!=='object')s.aff={};
  for(const k of ['crit','drep']){if(typeof s[k]!=='number')s[k]=k==='crit'?30:30}
  for(const k of ['fund','script','pub','talk'])if(typeof s[k]!=='number')s[k]=0;
  if(!Array.isArray(L.films))L.films=[];
  return s;
}
function gsb(){if(typeof G==='undefined'||!G)return {trend:'',hit:null};if(!G.sb||typeof G.sb!=='object')G.sb={trend:pick(MOVIE_GENRES),hit:null};if(!G.sb.trend)G.sb.trend=pick(MOVIE_GENRES);return G.sb}
function jmig(L){
  const j=L&&L.job;if(!j||!j.sp)return;
  if(j.c==='acteur'&&!j.v2){j.v2=1;const o=j.lvl||0;j.lvl=o<=0?1:o===1?2:o===2?3:o===3?3:4;j.works=j.works||0;j.perf=j.perf==null?50:j.perf}
  if(j.c==='realisateur'){if(j.works==null)j.works=0;if(!j.v2){j.v2=1;if(j.perf==null)j.perf=50}}
}
const ycount=L=>{const s=sb(L);return s.yr&&s.yr.age===L.age?s.yr.n:0};
function ybump(L){const s=sb(L);if(!s.yr||s.yr.age!==L.age)s.yr={age:L.age,n:0};s.yr.n++}
const salaryA=L=>{jmig(L);const j=L.job,s=sb(L);return Math.round([9000,16000,38000,95000,320000][lim(j.lvl||0,0,4)]*(.6+L.fame/150)*(.85+s.crit/330))};
const SAL_R=[25000,60000,150000,400000];
const salaryR=L=>{jmig(L);const j=L.job;return Math.round(SAL_R[lim(j.lvl||0,0,3)]*(.6+L.fame/150))};

/* ---------- Contacts ---------- */
const lab=c=>(KLAB[c.kind]||KLAB.act)[c.gender==='F'?1:0];
function mkContact(L,kind,rel){
  const g=chance(.5)?'H':'F';
  return {id:nid(),first:rname(g,L.country),last:rlast(L.country),gender:g,kind,rel:rel!=null?rel:R(35,60),fame:kind==='act'?R(10,80):R(5,60),t:L.age};
}
function addContact(L,kind,rel){
  const s=sb(L);const c=mkContact(L,kind,rel);s.contacts.push(c);
  if(s.contacts.length>14){s.contacts.sort((a,b)=>b.rel-a.rel);s.contacts.length=14}
  return c;
}
function seed(L){const s=sb(L);for(const k of ['dir','cast','act','prod'])if(!s.contacts.some(c=>c.kind===k))addContact(L,k)}
const relTxt=r=>r>=80?'Très proche':r>=60?'Bons rapports':r>=40?'Cordial':r>=20?'Froid':'Brouillés';
const cById=(L,id)=>sb(L).contacts.find(c=>c.id===id);

/* ---------- Adéquation et castings ---------- */
function fitOf(L,g,req,extra){
  const s=sb(L),p=PROF[g]||[.2,.35,.2];
  const sk=lim(skillOf(L,'comedie'),0,100);
  const fs=lim(50+(L.fame-req)*1.6,0,100);
  const aff=lim(s.aff[g]||0,0,100);
  const raw=p[0]*L.st.looks+p[1]*sk+p[2]*fs+.25*(aff+10);
  return Math.round(lim(10+raw*.9+(extra||0),3,99));
}
function parts(L,g,req){
  const s=sb(L),p=PROF[g]||[.2,.35,.2];
  return {looks:Math.round(L.st.looks),jeu:Math.round(lim(skillOf(L,'comedie'),0,100)),fame:Math.round(lim(50+(L.fame-req)*1.6,0,100)),aff:Math.round(lim(s.aff[g]||0,0,100)),w:p};
}
const offFit=(L,o)=>fitOf(L,o.g,ROLES[o.rid].req,(o.boost||0)*8+((L.job&&L.job.perf||50)-50)/10);
const pLand=(L,o)=>lim(offFit(L,o)/100*.85-(o.prest-1)*.035+((L.job&&L.job.agent)?.07:0)+(o.boost>0?.06:0),.05,.93);
function titleFor(kind){
  if(kind==='serie')return `${pick(SERIE_A)} ${pick(SERIE_B)}`;
  if(kind==='theatre')return pick(PIECES);
  if(kind==='pub')return pick(BRANDS)[0];
  return `${pick(TITLE_A)} ${pick(TITLE_B)}`;
}
function mkOffer(L,i,c,forceHigh){
  const lv=lim(L.job?L.job.lvl||0:0,0,4);
  const kind=wpick({film:lv>=1?5:3,serie:4,pub:lv>=4?1:3,theatre:2});
  const rid=forceHigh?Math.min(5,pick(LV_ROLES[lv])+1):pick(LV_ROLES[lv]);const R0=ROLES[rid];
  const g=kind==='pub'?pick(['Comédie','Romance','Animation','Action']):kind==='theatre'?pick(['Drame','Comédie','Romance','Comédie musicale']):pick(MOVIE_GENRES);
  let prest=lim(R0.prest+pick([-1,0,0,1]),1,5);
  const boost=c?(c.rel>=70?1:c.rel<30?-1:0):0;
  if(boost>0)prest=Math.min(5,prest+1);
  const dg=c?c.gender:(chance(.5)?'H':'F');
  const dn=c?`${c.first} ${c.last}`:`${rname(dg,L.country)} ${rlast(L.country)}`;
  let pay=R0.pay*KIND[kind].pay*(.7+L.fame/110)*R(85,120)/100*(1+(prest-R0.prest)*.1)*(boost>0?1.15:1)*(g===gsb().trend?1.1:1)*(forceHigh?1.3:1);
  return {id:i,kind,g,rid,title:titleFor(kind),prest,cid:c?c.id:null,dn,dg,pay:Math.round(pay),done:0,boost};
}
function offers(L){
  const s=sb(L);seed(L);
  if(s.off&&s.off.age===L.age&&Array.isArray(s.off.list))return s.off.list;
  const dirs=s.contacts.filter(c=>c.kind==='dir');const list=[];
  for(let i=0;i<3;i++){
    let c=null;
    if(dirs.length&&chance(.55)){const w={};dirs.forEach((d,k)=>w[k]=Math.max(1,d.rel));c=dirs[+wpick(w)]}
    list.push(mkOffer(L,i,c,false));
  }
  s.off={age:L.age,list};return list;
}

function audition(L,o){
  const s=sb(L),j=L.job,K=KIND[o.kind],R0=ROLES[o.rid];
  const p=pLand(L,o);const c=o.cid?cById(L,o.cid):null;
  const ch=[
    {t:'Tout donner',pri:1,fn:()=>verdict(L,o,p+.05)},
    {t:'Rester naturel',fn:()=>verdict(L,o,p)},
    {t:'Tenter un coup de poker',fn:()=>verdict(L,o,p+(chance(.5)?.2:-.15))}];
  if(c&&c.rel>=50)ch.push({t:`Rappeler ${c.first} pour qu’${ge(c,'il','elle')} glisse un mot`,fn:()=>{c.rel=lim(c.rel-4,0,100);return verdict(L,o,p+.1)}});
  modal({title:`Casting · ${K.n}`,icon:K.ic,text:`« ${o.title} » (${o.g.toLowerCase()}), ${R0.n.toLowerCase()}, sous la direction de ${o.dn}. ${pick(ACT_INTRO)} Adéquation : ${offFit(L,o)} %.`,choices:ch});
}
function verdict(L,o,p){
  if(o.done)return '';
  if(chance(lim(p,.04,.95)))return landRole(L,o);
  o.done=-1;chg(L,{happy:-R(2,4)});
  return out(L,`🎭 Casting raté pour « ${o.title} ». ${pick(FAILS)}`);
}
function landRole(L,o){
  const j=L.job,s=sb(L),K=KIND[o.kind],R0=ROLES[o.rid];
  const fit=offFit(L,o);
  const net=Math.round(o.pay*(j.agent?.9:1));
  earn(L,net);j.works=(j.works||0)+1;o.done=1;ybump(L);
  const q=fit*.45+(j.perf||50)*.2+L.st.smarts*.05+R(0,30)+o.prest*2+(o.boost>0?4:0);
  const score=lim((q-10)/12,1,5);
  const fg=Math.max(0,Math.round((2+o.prest*1.6)*K.fame*(score/3)*(1.1-L.fame/130)));
  chg(L,{fame:fg,happy:4+(score>=4?3:0)});
  j.perf=lim((j.perf||50)+Math.round((score-3)*3),0,100);
  s.crit=lim(s.crit+(score-3)*1.8*(o.prest/3),0,100);
  s.aff[o.g]=lim((s.aff[o.g]||0)+R(4,8),0,100);
  s.last={t:o.title,age:L.age,score};
  // contacts
  let c=o.cid?cById(L,o.cid):null;
  if(c){c.rel=lim(c.rel+R(4,9)+(score>=4?3:0),0,100);c.t=L.age}
  else{c=addContact(L,'dir',R(42,56));c.first=(o.dn||'').split(' ')[0]||c.first;c.last=(o.dn||'').split(' ').slice(1).join(' ')||c.last;c.gender=o.dg||c.gender;c.t=L.age}
  if(chance(.35)){const a=addContact(L,'act',R(40,60));a.t=L.age}
  let extra='';
  if(o.g==='Action'&&chance(.1)){const d=R(4,14);chg(L,{health:-d});extra=' Une cascade tourne mal : tu repars avec quelques points de suture.'}
  let award='';
  if(o.kind==='film'&&j.lvl>=1&&score>=3.8&&chance(.05+(score-3.8)*.12+s.crit/600)){
    const nom=o.rid>=4?ge(L,'du meilleur acteur','de la meilleure actrice'):o.rid===3?'du meilleur second rôle':'de la révélation';
    award=`César ${nom}`;track(L,'cesars');chg(L,{fame:6,happy:10});s.crit=lim(s.crit+4,0,100);
    extra+=` 🏆 Tu remportes le César ${nom} !`;
  }
  s.filmo.push({t:o.title,kind:o.kind,g:o.g,role:R0.n,pay:net,age:L.age,score,dir:o.dn,award});
  if(s.filmo.length>60)s.filmo.shift();
  const verbe=o.rid===0?'Tu prêtes ta voix à':o.rid===1?'Tu apparais en figuration dans':`Tu décroches ${R0.n.toLowerCase()} dans`;
  const sorte={film:'le film',serie:'la série',pub:'la publicité',theatre:'la pièce'}[o.kind];
  const avis=score>=4.2?'Accueil enthousiaste.':score>=3?'Accueil correct.':'Accueil tiède.';
  return out(L,`${K.ic} ${verbe} ${sorte} « ${o.title} » de ${o.dn}. Cachet : ${fmt(net)}. ${etoiles(score)} ${avis}${extra}`);
}

/* ---------- Publicités et plateaux (star) ---------- */
function adsList(L){
  const s=sb(L);
  if(!s.adl||s.adl.age!==L.age||!Array.isArray(s.adl.list))s.adl={age:L.age,list:shuffle(BRANDS).slice(0,4).map((b,i)=>({id:i,b:b[0],cat:b[1],risk:b[2],pay:Math.round(R(120,420)*1000*(.5+L.fame/100))}))};
  return s.adl.list;
}
function tvList(L){
  const s=sb(L);
  if(!s.tvl||s.tvl.age!==L.age||!Array.isArray(s.tvl.list))s.tvl={age:L.age,list:shuffle(TALKS).slice(0,4)};
  return s.tvl.list;
}
function pAds(){
  const L=cur();if(!isAct(L)||L.job.lvl<4)return {title:'Publicités',html:note('Les marques ne se bousculent que pour les stars de cinéma.')};
  const s=sb(L);
  const rows=adsList(L).map(a=>act(L,{ic:'💶',t:a.b,s:`Campagne pour ${a.cat} · ${fmt(a.pay)}`,key:'sbad'+a.id,dis:(s.ad&&s.ad.age===L.age&&s.ad.n>=2)?'Deux campagnes par an maximum':'',fn:L=>{
    if(!s.ad||s.ad.age!==L.age)s.ad={age:L.age,n:0};s.ad.n++;
    earn(L,a.pay);s.pub++;chg(L,{fame:R(0,2),happy:3});s.crit=lim(s.crit-R(1,3),0,100);
    let t=`📣 Tu deviens le visage de ${a.b}. Chèque : ${fmt(a.pay)}. La critique murmure que tu « te vends », mais le compte en banque sourit.`;
    if(chance(a.risk)){chg(L,{fame:-3,happy:-4});t+=' Hélas, le spot est parodié partout sur les réseaux : le sourire figé fait le tour du pays.'}
    return out(L,t)}}));
  return {title:'Publicités',html:note('Une fois star, les marques te font la cour. Chaque campagne rapporte gros, mais elle écorne un peu ton image d’artiste.')+group(`Campagnes proposées (${s.pub} depuis tes débuts)`,rows)};
}
function pTalk(){
  const L=cur();if(!isAct(L)||L.job.lvl<4)return {title:'Plateaux télé',html:note('Les talk-shows n’invitent que les stars de cinéma.')};
  const s=sb(L);
  const rows=tvList(L).map((n,i)=>act(L,{ic:'📺',t:n,s:'Interview, canapé et applaudissements',key:'sbtv'+i,fn:L=>{
    modal({title:n,icon:'📺',text:`L’animateur te serre la main : « Alors, ${L.first}, parlez-nous de vous ! » Le public retient son souffle.`,choices:[
      {t:'Charmant et drôle',pri:1,fn:()=>{const ok=chance(.4+lim(skillOf(L,'comedie'),0,100)/200);s.talk++;if(ok){chg(L,{fame:R(2,5),happy:5});s.crit=lim(s.crit+1,0,100);earn(L,R(2000,9000));return out(L,`📺 Chez « ${n} », tu fais salle comble de rires : l’extrait de ta blague totalise des millions de vues.`)}chg(L,{fame:-1,happy:-3});return out(L,`📺 Chez « ${n} », ta blague tombe à plat. Le public rit jaune, l’animateur sauve la situation.`)}},
      {t:'Sincère, un peu ému',fn:()=>{s.talk++;chg(L,{fame:R(1,3),happy:4,karma:2});s.crit=lim(s.crit+R(1,3),0,100);earn(L,R(2000,9000));return out(L,`📺 Chez « ${n} », tu parles de tes débuts difficiles. Le public est touché, la critique aussi.`)}},
      {t:'Provocateur',fn:()=>{s.talk++;if(chance(.5)){chg(L,{fame:R(4,8),happy:2});return out(L,`📺 Chez « ${n} », tu lances une petite phrase qui enflamme les réseaux. Tout le pays en parle.`)}chg(L,{fame:R(-4,0),karma:-3,happy:-5});s.crit=lim(s.crit-3,0,100);return out(L,`📺 Chez « ${n} », ta provocation passe très mal. Les excuses publiques s’imposent.`)}}]});
    return 'Direction le plateau.'}}));
  return {title:'Plateaux télé',html:note('Les talk-shows de star : de la notoriété, un peu de cachet… et le risque de la petite phrase de trop.')+group(`Invitations (${s.talk} passages en tout)`,rows)};
}

/* ---------- Panneaux acteur ---------- */
function pCast(){
  const L=cur();if(!isAct(L))return {title:'Castings',html:note('Tu n’es pas comédien.')};
  const s=sb(L),g=gsb(),yr=ycount(L);
  const rows=offers(L).map(o=>{const K=KIND[o.kind],R0=ROLES[o.rid];
    return act(L,{ic:K.ic,t:`${K.n} « ${o.title} »`,s:`${R0.n} · ${o.g} · de ${o.dn}${o.boost>0?' (ton réseau t’appuie)':''} · cachet ${fmtk(o.pay)} · prestige ${'★'.repeat(o.prest)} · adéquation ${offFit(L,o)} %`,
      key:'sbo'+o.id,dis:o.done===1?'Rôle décroché':o.done===-1?'Casting raté':yr>=2?'Agenda complet (2 rôles par an)':'',fn:L=>{audition(L,o);return 'Direction la salle de casting.'}})});
  let h=note('Trois offres de casting par an. L’adéquation tient compte de ton apparence, de ton jeu, de ta notoriété et de ton affinité avec le genre. Tu peux décrocher deux rôles par an.')+group(`Offres de l’année (${yr}/2 rôles obtenus)`,rows);
  h+=note(`Genre à la mode : ${g.trend.toLowerCase()} (cachets +10 %).${g.hit?` Au box-office : « ${g.hit.t} » (${g.hit.g.toLowerCase()}).`:''}`);
  return {title:'Castings',html:h};
}
function pMatrix(){
  const L=cur();if(!isAct(L))return {title:'Adéquation',html:note('Tu n’es pas comédien.')};
  const lv=lim(L.job.lvl||0,0,4);
  const list=MOVIE_GENRES.map(g=>({g,f:fitOf(L,g,REQ_LV[lv],0),p:parts(L,g,REQ_LV[lv])})).sort((a,b)=>b.f-a.f);
  const rows=list.map(x=>`<div class="stat"><b>${esc(x.g)}</b><span class="n">${x.f} %</span>${bar(x.f)}</div><p class="note">Apparence ${x.p.looks} · Jeu ${x.p.jeu} · Notoriété ${x.p.fame} · Affinité ${x.p.aff}</p>`).join('');
  return {title:'Matrice d’adéquation',html:note(`Ton meilleur terrain : ${list[0].g.toLowerCase()} (${list[0].f} %). Plus tu joues un genre, plus ton affinité progresse.`)+rows};
}
function pRep(){
  const L=cur(),s=sb(L);const w=Math.round(.6*L.fame+.4*s.crit);
  const tier=w>=85?'Icône mondiale':w>=70?'Star internationale':w>=55?'Célèbre en France':w>=40?'Visage familier':w>=22?'Connu dans le métier':'Inconnu du grand public';
  const fl=(L.films||[]).length,fa=s.filmo.length;
  let h=card('Réputation mondiale',tier,`${w} / 100`,statLine('Notoriété',L.fame)+statLine('Réputation critique',s.crit)+(isDir(L)?statLine('Réputation de réalisateur',s.drep):''));
  h+=group('Palmarès',[row({ic:'🏆',t:`${L.tr.cesars||0} César`,s:'Récompenses du cinéma français'}),row({ic:'🌴',t:`${L.tr.palme||0} Palme d’or`,s:'Festival de Cannes'}),row({ic:'🎞️',t:`${fa} rôle${fa>1?'s':''}, ${fl} film${fl>1?'s réalisés':' réalisé'}`,s:'Filmographie consultable'}),row({ic:'📣',t:`${s.pub} campagne${s.pub>1?'s':''} publicitaire${s.pub>1?'s':''}, ${s.talk} plateau${s.talk>1?'x':''} télé`,s:'Visibilité médiatique'})]);
  return {title:'Réputation',html:h};
}
function pWorks(){
  const L=cur(),s=sb(L);
  const A=s.filmo.slice().reverse().slice(0,40),F=(L.films||[]).slice().reverse().slice(0,40);
  let h='';
  if(F.length)h+=group('Films réalisés',F.map(f=>row({ic:'🎥',t:`${f.t} (${f.age} ans)`,s:`${f.g} · ${etoiles(f.score)}${f.press?` · presse ${dec(f.press)}`:''} · box-office ${fmtk(f.box)}${f.award?' · 🏆 '+f.award:''}`})));
  if(A.length)h+=group('Rôles',A.map(f=>row({ic:(KIND[f.kind]||KIND.film).ic,t:`${f.t} (${f.age} ans)`,s:`${(KIND[f.kind]||KIND.film).n} · ${f.role} · ${f.g} · ${etoiles(f.score)}${f.award?' · 🏆 '+f.award:''}`})));
  return {title:'Filmographie',html:h||note('Rien pour l’instant : tes rôles et tes films apparaîtront ici.')};
}
function pContacts(){
  const L=cur(),s=sb(L);seed(L);
  const list=s.contacts.slice().sort((a,b)=>b.rel-a.rel);
  const rows=list.map(c=>row({ic:KIC[c.kind]||'🎭',t:`${c.first} ${c.last}`,s:`${lab(c)} · ${relTxt(c.rel)}`,right:mini(c.rel),a:()=>pushPanel(()=>pContact(c.id))}));
  return {title:'Contacts du milieu',html:note('Dans le cinéma, tout est une affaire de réseau. De bonnes relations amènent de meilleures offres ; les amitiés s’entretiennent, sinon elles s’effacent.')+group('Carnet d’adresses',rows)};
}
function pContact(id){
  const L=cur(),s=sb(L),c=cById(L,id);
  if(!c)return {title:'Contact',html:note('Vous vous êtes perdus de vue.')};
  const dirm=isDir(L);
  const dCost=Math.round(150+c.fame*4);
  const rows=[
    act(L,{ic:'🍽️',t:'Inviter à dîner',s:`${fmt(dCost)} · on parle boulot entre deux desserts`,cost:dCost,key:'sbd'+id,fn:L=>{
      c.rel=lim(c.rel+R(8,15),0,100);c.t=L.age;let t=`Dîner avec ${c.first} ${c.last} dans un bistrot de Saint-Germain.`;
      if(chance(.25)){s.crit=lim(s.crit+1,0,100);chg(L,{fame:1});t+=` ${ge(c,'Il','Elle')} glisse ton nom à la bonne personne.`}
      return out(L,'🍽️ '+t)}}),
    act(L,{ic:'📱',t:'Garder le contact',s:'Un message, un petit mot, un like',key:'sbk'+id,fn:L=>{c.rel=lim(c.rel+R(2,5),0,100);c.t=L.age;return out(L,`📱 Tu envoies un petit mot à ${c.first}. Ça fait toujours plaisir.`)}}),
    row({ic:'💢',t:'Chercher la bagarre',s:'Un conflit peut faire du bruit… ou des dégâts',danger:1,a:()=>conflit(L,c)})];
  if(!dirm&&isAct(L)&&c.kind==='dir')rows.splice(2,0,act(L,{ic:'🙏',t:'Demander un coup de pouce',s:c.rel>=65?'Un rôle sur mesure, au prix d’une faveur':'Il faut une relation d’au moins 65 %',key:'sbf'+id,dis:c.rel>=65?(offers(L).length>=4?'Une seule faveur par an':''):'Relation insuffisante',fn:L=>{
    c.rel=lim(c.rel-8,0,100);const o=mkOffer(L,offers(L).length,c,true);offers(L).push(o);return out(L,`🙏 ${c.first} te glisse un projet : « ${o.title} ». Regarde tes offres de casting.`)}}));
  if(dirm&&c.kind==='prod')rows.splice(2,0,act(L,{ic:'💼',t:'Parler financement',s:c.rel>=50?'Faire monter la confiance des investisseurs':'Relation d’au moins 50 % requise',key:'sbp'+id,dis:c.rel>=50?'':'Relation insuffisante',fn:L=>{s.fund=lim(s.fund+R(5,12),0,60);c.rel=lim(c.rel+3,0,100);return out(L,`💼 ${c.first} promet d’appuyer ton prochain dossier auprès des financeurs. Confiance des financeurs : ${s.fund}.`)}}));
  const head=card(lab(c),`${c.first} ${c.last}`,`${relTxt(c.rel)} · notoriété ${c.fame}`,statLine('Relation',c.rel));
  return {title:`${c.first} ${c.last}`,html:head+group('Actions',rows)};
}
function conflit(L,c){
  modal({title:'Conflit',icon:'💢',text:`Entre ${c.first} ${c.last} et toi, ça couve depuis un tournage : une phrase de trop, une scène volée…`,choices:[
    {t:'Claquer la porte',fn:()=>{c.rel=lim(c.rel-R(18,30),0,100);chg(L,{stress:6,happy:-3});return out(L,`💢 Tu claques la porte au nez de ${c.first}. Le milieu est petit : ça se saura.`)}},
    {t:'Régler ça dans la presse',danger:1,fn:()=>{c.rel=lim(c.rel-R(25,40),0,100);chg(L,{fame:R(1,4),karma:-2,happy:-2});sb(L).crit=lim(sb(L).crit-R(0,3),0,100);return out(L,`💢 Ta querelle avec ${c.first} fait la une des magazines people. Les audiences adorent.`)}},
    {t:'Crever l’abcès calmement',pri:1,fn:()=>{if(chance(.5+L.hid.discipline/300)){c.rel=lim(c.rel+R(5,12),0,100);chg(L,{karma:2});return out(L,`🤝 Après une longue discussion, ${c.first} et toi repartez sur de bonnes bases.`)}c.rel=lim(c.rel-R(8,15),0,100);return out(L,`${c.first} reste sur ses positions. La discussion tourne court.`)}}]});
}

/* ---------- Carrière acteur ---------- */
function applyActeur(L){
  const go=bonus=>{
    const p=lim(.18+bonus+L.st.looks/400+lim(skillOf(L,'comedie'),0,100)/180+(hasDeg(L,'cinema')?.05:0),.04,.92);
    if(!chance(p))return out(L,'🎭 Refusé : ce ne sera pas pour cette fois. Les castings, c’est comme les crêpes : on rate la première.');
    const old=L.job;
    L.job={c:'acteur',sp:1,lvl:0,perf:R(45,65),y:0,works:0,v2:1};
    if(old&&old.sp&&old.c==='acteur'){L.job.lvl=old.lvl;L.job.works=old.works||0}
    L.retired=false;sb(L);seed(L);chg(L,{happy:10,fame:3});
    return out(L,`🎬 Te voilà ${title(L).toLowerCase()} ! Le métier commence par la voix : tu prêtes la tienne à des dessins animés et à des séries étrangères.`);
  };
  modal({title:'Audition · Acteur',icon:'🎬',text:'Le directeur de casting te demande d’improviser une scène de rupture dans un ascenseur en panne.',choices:[
    {t:'Tout donner',pri:1,fn:()=>go(.05)},{t:'Rester naturel',fn:()=>go(0)},{t:'Tenter un coup de poker',fn:()=>go(chance(.5)?.22:-.15)}]});
  return 'Direction l’audition.';
}
function promoteA(L){
  const j=L.job,s=sb(L);
  const W=[1,3,6,10],F=[0,8,25,48],C=[0,0,35,50];
  while(j.lvl<4&&(j.works||0)>=W[j.lvl]&&L.fame>=F[j.lvl]&&s.crit>=C[j.lvl]){
    j.lvl++;chg(L,{happy:10,fame:3});
    say(L,`📈 Tu deviens ${title(L).toLowerCase()} !`);
    if(j.lvl===4){track(L,'movieStar');track(L,'topCareer');say(L,'⭐ Ton nom s’affiche en lettres lumineuses sur les Champs-Élysées. Les publicités et les plateaux télé te tendent les bras.')}
  }
}
function yearA(L){
  jmig(L);const j=L.job,s=sb(L);seed(L);
  j.perf=lim((j.perf||50)+R(-6,6)+(L.hid.discipline-50)/25,0,100);
  const n=ycount(L);
  if(j.lvl>=2&&n===0){chg(L,{fame:-R(1,3)});say(L,'Tu as fait peu de bruit cette année : le public commence à t’oublier.')}
  if(j.lvl>=4&&L.fame<35&&chance(.5)){j.lvl=3;say(L,'🎬 Les propositions se raréfient : tu perds ton statut de star de cinéma.')}
  for(const c of s.contacts){if(c.t!==L.age)c.rel=lim(c.rel-R(1,4),0,100)}
  s.contacts=s.contacts.filter(c=>c.rel>0||c.t===L.age);
  s.crit=lim(s.crit-(s.crit>50?1:0)+(s.crit<30?1:0),0,100);
  promoteA(L);
  earn(L,salaryA(L));
}
function panelA(L){
  jmig(L);const j=L.job,s=sb(L),n=ycount(L);
  const rows=[
    nav('📋','Castings de l’année',`${n}/2 rôles obtenus · 3 offres à étudier`,pCast),
    nav('📒','Contacts du milieu',`${s.contacts.length} contact${s.contacts.length>1?'s':''} · réalisateurs, partenaires, producteurs`,pContacts),
    nav('🌍','Réputation mondiale',`Notoriété ${L.fame} · critique ${Math.round(s.crit)} · ${L.tr.cesars||0} César`,pRep),
    nav('📊','Matrice d’adéquation','Ton score pour chaque genre',pMatrix),
    nav('🎞️','Filmographie',`${s.filmo.length} rôle${s.filmo.length>1?'s':''} à ton actif`,pWorks)];
  if(j.lvl>=4){rows.push(nav('📣','Publicités lucratives',`${s.pub} campagne${s.pub>1?'s':''}`,pAds));rows.push(nav('📺','Plateaux télé',`${s.talk} passage${s.talk>1?'s':''}`,pTalk))}
  rows.push(act(L,{ic:'🎓',t:'Cours d’art dramatique',s:'Améliore ton jeu · 1 500 €',cost:1500,key:'cours',fn:L=>{L.skills.theatre=clamp((L.skills.theatre||0)+R(6,12));chg(L,{smarts:1});return out(L,'🎓 Tu travailles Tchekhov au Cours Florent. Ton jeu gagne en finesse.')}}));
  if(!j.agent)rows.push(act(L,{ic:'🤝',t:'Engager un agent',s:'Plus de chances aux castings, 10 % de commission',fn:L=>{j.agent=1;return out(L,'🤝 Tu signes avec un agent artistique. Ton téléphone sonne enfin.')}}));
  rows.push(act(L,{ic:'📣',t:'Faire la promotion de ton dernier film',s:s.last?`« ${s.last.t} »`:'Aucun film récent',key:'promo',dis:s.last?'':'Rien à promouvoir',fn:L=>{
    const bon=s.last&&s.last.score>=3.4;chg(L,{fame:bon?R(2,5):R(0,2),happy:-1});if(bon)s.crit=lim(s.crit+1,0,100);
    return out(L,`📣 Plateaux télé, radios, avant-premières pour « ${s.last.t} ». ${bon?'On ne parle que de toi.':'Les journalistes sont polis, sans plus.'}`)}}));
  return group('Comédien',rows);
}

/* ---------- Carrière réalisateur ---------- */
const TIERS=[{n:'Petit budget',b:5e5,fee:30000,lv:0},{n:'Budget moyen',b:5e6,fee:150000,lv:1},{n:'Superproduction',b:6e7,fee:700000,lv:2}];
function trendBonus(g){return gsb().trend===g?1.25:1}
function directFilm(L){
  const trend=gsb().trend;
  modal({title:'Nouveau film',icon:'🎥',text:`Quel genre de film veux-tu réaliser ? Le public a un faible pour le ${trend.toLowerCase()} cette année.`,choices:MOVIE_GENRES.map(g=>({t:g,fn:()=>stepBudget(L,{g})}))});
}
function stepBudget(L,F){
  const j=L.job;
  const ch=TIERS.filter(t=>t.lv<=j.lvl).map(t=>({t:`${t.n} (${fmtk(t.b)})`,fn:()=>{F.tier=t;F.b=t.b;stepScript(L,F)}}));
  if(L.money>=150000)ch.push({t:'Autoproduction (150 000 € de ta poche)',fn:()=>{spend(L,150000);F.tier=TIERS[0];F.b=TIERS[0].b;F.self=1;stepScript(L,F)}});
  modal({title:`${F.g} · budget`,icon:'💼',text:'Quel budget ? Les studios ne confient les gros budgets qu’aux réalisateurs confirmés. En autoproduction, tu risques ton argent mais tu gardes une grande part des recettes.',choices:ch});
}
function stepScript(L,F){
  const s=sb(L);
  const ch=[
    {t:'Scénario original',fn:()=>{F.q=R(-5,12);F.scn='orig';stepCast(L,F)}},
    {t:'Adaptation d’un roman à succès',fn:()=>{F.q=4;F.scn='adapt';stepCast(L,F)}},
    {t:'Réécrire le scénario à la dernière minute',fn:()=>{F.q=chance(.5)?10:-8;F.scn='rush';stepCast(L,F)}}];
  if(s.script>0)ch.unshift({t:`Ton propre scénario (${s.script} points d’écriture)`,pri:1,fn:()=>{F.q=Math.min(14,4+s.script/3);F.scn='own';s.script=0;stepCast(L,F)}});
  modal({title:'Le scénario',icon:'📜',text:'Tout part d’une page blanche… ou presque. Quel scénario portes-tu à l’écran ?',choices:ch});
}
function stepCast(L,F){
  const s=sb(L);seed(L);
  const o=(typeof G!=='undefined'&&G.players&&G.players.length>1)?G.players[1-idxOf(L)]:null;
  const castO=o&&o.alive&&o.job&&o.job.c==='acteur';
  const acts=s.contacts.filter(c=>c.kind==='act').sort((a,b)=>b.fame-a.fame).slice(0,2);
  const ch=[
    {t:'Des inconnus talentueux',fn:()=>{F.star=0;F.q+=2;stepIncident(L,F)}},
    {t:'Une star bankable (+20 % de budget)',fn:()=>{F.star=12;F.b*=1.2;stepIncident(L,F)}}];
  for(const c of acts)ch.push({t:`${c.first} ${c.last} (notoriété ${c.fame}, relation ${c.rel} %)`,fn:()=>{F.star=4+c.fame/12;F.q+=(c.rel-50)/12;c.rel=lim(c.rel+R(3,8),0,100);c.t=L.age;F.cid=c.id;stepIncident(L,F)}});
  if(castO)ch.push({t:`${o.first}, l’autre joueur`,fn:()=>{
    const cachet=Math.round(F.tier.b*.015);
    o.job.works=(o.job.works||0)+1;chg(o,{fame:6});earn(o,cachet);
    const so=sb(o);so.filmo.push({t:'(film de '+L.first+')',kind:'film',g:F.g,role:'Rôle principal',pay:cachet,age:o.age,score:3,dir:L.first+' '+L.last,award:''});
    say(o,`🎬 ${L.first} te confie le rôle principal de son prochain film. Cachet : ${fmt(cachet)}.`);
    F.star=8+o.fame/10;F.other=o;stepIncident(L,F)}});
  modal({title:'Casting',icon:'🎭',text:'Qui sera la tête d’affiche ? Une grande notoriété attire le public ; de bons rapports avec les comédiens font aussi la différence.',choices:ch});
}
function stepIncident(L,F){
  const inc=pick(INCIDENTS);
  modal({title:'Tournage',icon:'🎬',text:inc.t,choices:inc.c.map(([t,dq,txt])=>({t,fn:()=>{F.q+=dq;say(L,'🎬 '+txt);finishFilm(L,F);return txt}}))});
}
function finishFilm(L,F){
  const j=L.job,s=sb(L);const g=F.g,budget=F.b;
  const sk=L.st.smarts/3+(j.perf||50)/3+L.fame/6+F.star+R(0,35)+F.q+(hasDeg(L,'cinema')?4:0)+s.fund/10+(s.drep-30)/10;
  const score=lim(sk/22+(Math.random()-.5),1,5);
  const press=lim(score+(PRESS[g]||0)+(F.scn==='own'||F.scn==='orig'?.15:0)+(Math.random()-.5)*.6,1,5);
  const pub=lim(score-(PRESS[g]||0)*.6+F.star/60+(Math.random()-.5)*.6,1,5);
  const box=Math.round(budget*(BOX[g]||1.5)*(((score+pub)/2)/3)*R(40,160)/100*(1+F.star/80)*trendBonus(g));
  let fee,bonus;
  if(F.self){fee=Math.round(F.tier.fee*.5);bonus=Math.round(box*.22)}
  else{fee=Math.round(F.tier.fee*(.6+j.lvl*.25)*(.7+L.fame/160));bonus=Math.round(lim((box-budget*1.6)*.025,0,1e9))}
  earn(L,fee+bonus);
  let award='';
  if(press>=3.8&&chance(.18+(press-3.8)*.3+s.drep/500)){award='César du meilleur film';track(L,'cesars');chg(L,{fame:8,happy:6});s.drep=lim(s.drep+6,0,100)}
  const t=`${pick(TITLE_A)} ${pick(TITLE_B)}`;
  const rec={t,g,score,press,pub,box,budget:Math.round(budget),tier:F.tier.n,award,age:L.age};
  (L.films=Array.isArray(L.films)?L.films:[]).push(rec);
  j.works=(j.works||0)+1;
  s.drep=lim(s.drep+(score-3)*3,0,100);s.crit=lim(s.crit+(press*20-s.crit)*.15,0,100);
  s.fund=lim(s.fund-4,0,60);
  chg(L,{fame:Math.round(score*2)+(box>budget*3?3:0),happy:score>=3?8:-4});j.perf=lim((j.perf||50)+Math.round((score-3)*3),0,100);
  s.last={t,age:L.age,score};
  if(F.cid){const c=cById(L,F.cid);if(c){c.fame=lim(c.fame+(score>=3.5?2:-1),0,100)}}
  if(F.other){chg(F.other,{fame:score>=3.5?3:0})}
  // monde
  const w=gsb();if(!w.hit||box>w.hit.box)w.hit={t,g,box};
  const avis=score>=4.3?'chef-d’œuvre':score>=3.3?'beau succès d’estime':score>=2.3?'accueil mitigé':'bide retentissant';
  const res=out(L,`🎬 « ${t} » (${g.toLowerCase()}, ${F.tier.n.toLowerCase()}${F.self?', autoproduit':''}) : ${etoiles(score)} · presse ${dec(press)}/5, public ${dec(pub)}/5 · ${fmtk(box)} au box-office · ${avis}. Tu touches ${fmt(fee+bonus)}.${award?` 🏆 ${award} !`:''}`);
  if(press>=3.2){
    modal({title:'Festival de Cannes',icon:'🌴',text:`Les critiques adorent « ${t} ». Veux-tu présenter ton film à la sélection du Festival de Cannes ?`,choices:[
      {t:'Envoyer le film à Cannes',pri:1,fn:()=>cannes(L,rec)},
      {t:'Rester chez soi',fn:()=>'Pas de tapis rouge cette année.'}]});
  }
  return res;
}
function cannes(L,rec){
  const s=sb(L);
  const sel=.25+(rec.press-3.2)*.35+L.fame/400+(rec.g==='Drame'||rec.g==='Documentaire'?.1:0);
  if(!chance(lim(sel,.05,.9))){chg(L,{happy:-3});return out(L,`🌴 « ${rec.t} » n’est pas retenu en sélection officielle. La Croisette attendra.`)}
  chg(L,{fame:4,happy:5});
  const pal=rec.press>=4.3?.25+(rec.press-4.3)*.5+s.drep/600:rec.press>=3.8?.07:.015;
  if(chance(lim(pal*(PALMEF[rec.g]||.8),0,.8))){
    track(L,'palme');chg(L,{fame:15,happy:15});s.drep=lim(s.drep+10,0,100);s.crit=lim(s.crit+6,0,100);rec.award=(rec.award?rec.award+' · ':'')+'Palme d’or';
    return out(L,`🌴 PALME D’OR ! Le jury remet la plus haute récompense à « ${rec.t} ». Standing ovation de treize minutes sur la Croisette.`);
  }
  if(chance(.35)){const p=pick(['Grand Prix','Prix du jury','Prix de la mise en scène','Prix du scénario']);chg(L,{fame:4});rec.award=(rec.award?rec.award+' · ':'')+p+' à Cannes';return out(L,`🌴 « ${rec.t} » repart de Cannes avec le ${p}. Pas la Palme, mais quelle montée des marches !`)}
  return out(L,`🌴 « ${rec.t} » est montré en sélection officielle et salué par les applaudissements. La Palme ira à un autre.`);
}
function applyRealisateur(L){
  const go=bonus=>{
    const p=lim(.15+bonus+(hasDeg(L,'cinema')?.4:0)+L.st.smarts/400+lim(skillOf(L,'ecriture'),0,100)/400,.03,.92);
    if(!chance(p))return out(L,'🎥 Refusé : le producteur trouve ton projet « très intéressant », c’est-à-dire non.');
    const old=L.job;
    L.job={c:'realisateur',sp:1,lvl:0,perf:R(45,65),y:0,works:0,v2:1};
    if(old&&old.sp&&old.c==='realisateur'){L.job.lvl=old.lvl;L.job.works=old.works||0}
    L.retired=false;sb(L);seed(L);chg(L,{happy:10,fame:3});
    return out(L,`🎥 Te voilà ${title(L).toLowerCase()} ! Quelqu’un te tend un clap : « Silence, on tourne ! »`);
  };
  modal({title:'Audition · Réalisateur',icon:'🎥',text:'Un producteur te reçoit pour écouter ton projet de film dans son bureau de Boulogne-Billancourt.',choices:[
    {t:'Tout donner',pri:1,fn:()=>go(.05)},{t:'Rester naturel',fn:()=>go(0)},{t:'Tenter un coup de poker',fn:()=>go(chance(.5)?.22:-.15)}]});
  return 'Direction le bureau du producteur.';
}
function yearR(L){
  jmig(L);const j=L.job,s=sb(L);seed(L);
  j.perf=lim((j.perf||50)+R(-6,6)+(L.hid.discipline-50)/25,0,100);
  for(const c of s.contacts){if(c.t!==L.age)c.rel=lim(c.rel-R(1,3),0,100)}
  s.contacts=s.contacts.filter(c=>c.rel>0||c.t===L.age);
  if(j.lvl<LAD_R.length-1&&(j.works||0)>=j.lvl*2+1&&(j.lvl<2||s.drep>=45)){
    j.lvl++;chg(L,{happy:10,fame:5});say(L,`📈 Tu deviens ${title(L).toLowerCase()} !`);
    if(j.lvl===LAD_R.length-1){track(L,'topCareer');say(L,'🎥 Ton nom suffit à vendre un film : on parle de « film de '+L.last+' ».')}
  }
  s.fund=lim(s.fund-1,0,60);
  earn(L,salaryR(L));
}
function panelR(L){
  jmig(L);const j=L.job,s=sb(L);const nf=(L.films||[]).length;
  const rows=[
    act(L,{ic:'🎥',t:'Réaliser un film',s:'Onze genres, trois budgets, un casting à choisir',key:'film',fn:L=>{directFilm(L);return 'Moteur… action !'}}),
    act(L,{ic:'📜',t:'Écrire un scénario',s:`Points d’écriture : ${s.script} · utilisables pour ton prochain film`,key:'script',fn:L=>{const g=R(8,16)+Math.round(lim(skillOf(L,'ecriture'),0,100)/10);s.script=lim(s.script+g,0,60);chg(L,{smarts:1});return out(L,`📜 Tu écris toute l’année, un café à la main. Le scénario prend forme (+${g} points d’écriture).`)}}),
    act(L,{ic:'💼',t:'Rencontrer des producteurs',s:'Élargit ton réseau et rassure les financeurs',key:'prodmeet',fn:L=>{const c=addContact(L,'prod',R(40,55));s.fund=lim(s.fund+R(3,7),0,60);return out(L,`💼 Tu déjeunes avec ${c.first} ${c.last}, ${lab(c).toLowerCase()}. Confiance des financeurs : ${s.fund}.`)}}),
    act(L,{ic:'🎞️',t:'Festival de courts métrages',s:'800 € · pour se faire un nom',cost:800,key:'fest',fn:L=>{const ok=chance(.3+s.drep/250);if(ok){chg(L,{fame:R(2,4),happy:5});s.drep=lim(s.drep+3,0,100);addContact(L,'act',R(45,60));return out(L,'🎞️ Ton court métrage fait sensation à Clermont-Ferrand : un jeune comédien prometteur te laisse son numéro.')}chg(L,{happy:1});return out(L,'🎞️ Ton court métrage passe devant une salle clairsemée. Au moins il y avait des chaises confortables.')}}),
    act(L,{ic:'📣',t:'Tournée de presse',s:s.last?`« ${s.last.t} »`:'Aucun film récent',key:'presse',dis:s.last?'':'Rien à promouvoir',fn:L=>{const bon=s.last&&s.last.score>=3.4;chg(L,{fame:bon?R(2,4):R(0,1),happy:-1});return out(L,`📣 Radios, journaux et plateaux pour « ${s.last.t} ». ${bon?'Les spectateurs sont curieux.':'On t’écoute avec bienveillance.'}`)}}),
    nav('📒','Contacts du milieu',`${s.contacts.length} contact${s.contacts.length>1?'s':''} · acteurs, producteurs, équipes`,pContacts),
    nav('🌍','Réputation et palmarès',`Notoriété ${L.fame} · réalisateur ${Math.round(s.drep)} · ${L.tr.palme||0} Palme`,pRep),
    nav('🎞️','Filmographie',`${nf} film${nf>1?'s':''} réalisé${nf>1?'s':''}`,pWorks)];
  return group('Réalisateur',rows);
}

/* ---------- Évènements dynamiques ---------- */
function eventsHook(L){
  if(L.age<16||L.prison)return 0;
  const s=sb(L);let n=0;
  if(isAct(L)&&chance(.2)){
    const c=s.contacts.filter(x=>x.kind==='dir'&&x.rel>=65)[0];
    if(c){
      const o=mkOffer(L,99,c,true);
      modal({title:'Un coup de fil',icon:'📞',text:`${c.first} ${c.last}, ${lab(c).toLowerCase()}, t’appelle : « J’ai un projet qui te ressemble : « ${o.title} ». Le rôle est pour toi, sans casting. » Cachet : ${fmt(o.pay)}.`,choices:[
        {t:'Accepter tout de suite',pri:1,fn:()=>{o.done=0;return landRole(L,o)}},
        {t:'Négocier un meilleur cachet',fn:()=>{if(chance(.55)){o.pay=Math.round(o.pay*1.3);return landRole(L,o)}c.rel=lim(c.rel-6,0,100);return out(L,`${c.first} trouve que tu en demandes trop et confie le rôle à quelqu’un d’autre.`)}},
        {t:'Refuser poliment',fn:()=>{c.rel=lim(c.rel-3,0,100);return 'Tu déclines avec élégance.'}}]});
      n++;
    }
  }
  if(isDir(L)&&chance(.18)){
    modal({title:'Une commande',icon:'📞',text:'Un producteur te propose de réaliser, en trois semaines, un téléfilm de commande.',choices:[
      {t:'Accepter le contrat',fn:()=>{const g=Math.round(salaryR(L)*.2);earn(L,g);chg(L,{happy:2});s.drep=lim(s.drep-2,0,100);return out(L,`📺 Téléfilm bouclé dans les temps. Tu touches ${fmt(g)}, sans gloire particulière.`)}},
      {t:'Décliner pour ton projet personnel',fn:()=>{chg(L,{karma:1,happy:1});return out(L,'Tu préfères préserver ton emploi du temps pour ton propre projet.')}}]});
    n++;
  }
  return n;
}

/* ---------- Évènements JSON ---------- */
const EV=[
{id:'showbiz_fan',category:'career_event',icon:'🤩',conditions:{min_age:16,min_fame:20,mod_cond:{mod:MOD,fn:'acteur'}},probability_weight:0.12,
 prompt_text:'Un groupe d’admirateurs t’attend à la sortie du théâtre avec des affiches et des stylos.',
 choices:[{choice_text:'Signer des autographes pendant une heure',consequences:{fame_modifier:2,happiness_modifier:5,result_text:'Tu signes, tu souris, tu poses. Les fans repartent comblés.'}},
  {choice_text:'Filer par la porte de service',consequences:{fame_modifier:-1,karma_modifier:-2,result_text:'Tu t’éclipses discrètement. Un fan déçu te qualifie de « snob » sur Internet.'}}]},
{id:'showbiz_paparazzi',category:'career_event',icon:'📸',conditions:{min_age:18,min_fame:35,mod_cond:{mod:MOD,fn:'acteur'}},probability_weight:0.1,
 prompt_text:'Des photographes te surprennent au restaurant avec une personne mystère. La une du magazine people est déjà imprimée.',
 choices:[{choice_text:'Porter plainte pour atteinte à la vie privée',consequences:{bank_balance_modifier:[-3000,-800],karma_modifier:2,result_text:'Tes avocats font le job. Le magazine publie un démenti en page 14.'}},
  {choice_text:'Assumer et sourire sur le tapis rouge',consequences:{fame_modifier:3,happiness_modifier:2,mod_effect:{mod:MOD,fn:'crit',args:{d:-1}},result_text:'Tu assumes avec classe. Les réseaux sont conquis.'}},
  {choice_text:'Démentir en bloc',consequences:{karma_modifier:-3,fame_modifier:1,result_text:'Personne ne te croit, mais tout le monde en parle.'}}]},
{id:'showbiz_critique',category:'career_event',icon:'🗞️',conditions:{min_age:18,mod_cond:{mod:MOD,fn:'hasFilm'}},probability_weight:0.1,
 prompt_text:'Un critique influent a descendu ton dernier travail en trois paragraphes vachards.',
 choices:[{choice_text:'Répondre sur les réseaux',consequences:{fame_modifier:2,happiness_modifier:-2,mod_effect:{mod:MOD,fn:'crit',args:{d:-3}},result_text:'Ta réponse est reprise partout, et pas toujours à ton avantage.'}},
  {choice_text:'L’inviter à déjeuner',consequences:{bank_balance_modifier:-120,karma_modifier:2,mod_effect:{mod:MOD,fn:'crit',args:{d:2}},result_text:'Autour d’un steak-frites, le critique se radoucit : « Au fond, je suis un grand sentimental. »'}},
  {choice_text:'L’ignorer',consequences:{willpower_modifier:2,result_text:'Tu ranges la critique au fond d’un tiroir. Avec les autres.'}}]},
{id:'showbiz_trac',category:'career_event',icon:'😰',conditions:{min_age:16,mod_cond:{mod:MOD,fn:'acteur'}},probability_weight:0.12,
 prompt_text:'C’est le soir de la première. Le trac te noue l’estomac et tes répliques s’effacent.',
 choices:[{choice_text:'Respirer et faire confiance au texte',consequences:{willpower_modifier:3,happiness_modifier:3,result_text:'Le rideau se lève, les mots reviennent. Tu es dans le rôle.'}},
  {choice_text:'Boire un petit verre pour se donner du courage',consequences:{health_modifier:-2,happiness_modifier:2,karma_modifier:-1,result_text:'Tu joues avec un léger flottement. Les spectateurs y voient de l’audace.'}},
  {choice_text:'Appeler ton agent pour tout annuler',consequences:{happiness_modifier:-4,job_performance_modifier:-6,result_text:'Ton agent te rappelle à l’ordre : on ne s’échappe pas le soir de la première.'}}]},
{id:'showbiz_syndicat',category:'career_event',icon:'📢',conditions:{min_age:18,mod_cond:{mod:MOD,fn:'acteur'},max_fame:30},probability_weight:0.08,
 prompt_text:'Les intermittents du spectacle manifestent pour défendre leurs droits. Les tournages sont suspendus pour quelques semaines.',
 choices:[{choice_text:'Rejoindre le cortège',consequences:{karma_modifier:3,bank_balance_modifier:[-1500,-400],happiness_modifier:3,result_text:'Tu défiles avec tes collègues. Les cachets attendront.'}},
  {choice_text:'Continuer à travailler à côté',consequences:{bank_balance_modifier:[200,900],karma_modifier:-1,result_text:'Tu fais des extras dans un café-théâtre pour boucler le mois.'}}]},
{id:'showbiz_hollywood',category:'career_event',icon:'🇺🇸',conditions:{min_age:20,mod_cond:{mod:MOD,fn:'star'}},probability_weight:0.07,once:true,
 prompt_text:'Un grand studio américain te propose un petit rôle dans une superproduction. Tournage de trois mois à Los Angeles.',
 choices:[{choice_text:'Accepter le contrat américain',consequences:{bank_balance_modifier:[120000,380000],fame_modifier:5,happiness_modifier:4,mod_effect:{mod:MOD,fn:'crit',args:{d:-2}},result_text:'Tu enfiles une cape devant un fond vert pendant trois mois. Le chèque, lui, est bien réel.'}},
  {choice_text:'Rester fidèle au cinéma français',consequences:{karma_modifier:3,fame_modifier:1,mod_effect:{mod:MOD,fn:'crit',args:{d:3}},result_text:'Tu refuses l’appel d’Hollywood. Les cinéphiles te vénèrent.'}}]},
{id:'showbiz_rumeur',category:'career_event',icon:'💬',conditions:{min_age:18,has_partner:true,min_fame:25,mod_cond:{mod:MOD,fn:'acteur'}},probability_weight:0.08,
 prompt_text:'Un tabloïd prétend que tu as une liaison avec ta partenaire de tournage. Ton conjoint ne rit pas du tout.',
 choices:[{choice_text:'Tout expliquer calmement',consequences:{relationship_partner_modifier:4,happiness_modifier:-1,result_text:'Après une longue conversation, vous riez de l’absurdité de l’affaire.'}},
  {choice_text:'Hausser les épaules',consequences:{relationship_partner_modifier:-8,fame_modifier:2,result_text:'« C’est du cinéma », dis-tu. Ton conjoint n’a pas trouvé ça drôle.'}}]},
{id:'showbiz_cannes_tel',category:'career_event',icon:'🌴',conditions:{min_age:22,mod_cond:{mod:MOD,fn:'realisateur'},min_fame:15},probability_weight:0.09,
 prompt_text:'Le délégué général du Festival de Cannes t’invite à déjeuner pour « discuter de tes projets ».',
 choices:[{choice_text:'Venir avec ton dernier montage',consequences:{fame_modifier:2,mod_effect:{mod:MOD,fn:'reseau',args:{d:6,kind:'prod'}},result_text:'Le déjeuner est cordial. Il note ton nom sur un petit carnet.'}},
  {choice_text:'Parler de tout sauf de cinéma',consequences:{happiness_modifier:3,result_text:'Vous parlez de pétanque pendant deux heures. Il adore.'}}]},
{id:'showbiz_coupe',category:'career_event',icon:'✂️',conditions:{min_age:22,mod_cond:{mod:MOD,fn:'realisateur'}},probability_weight:0.1,
 prompt_text:'Le producteur exige de couper vingt minutes de ton dernier film, « pour les séances de 20 h ».',
 choices:[{choice_text:'Refuser, le final cut est sacré',consequences:{karma_modifier:2,job_performance_modifier:4,mod_effect:{mod:MOD,fn:'crit',args:{d:2}},result_text:'Tu tiens bon. Le producteur claque la porte, mais le film reste intact.'}},
  {choice_text:'Accepter les coupes',consequences:{bank_balance_modifier:[5000,25000],mod_effect:{mod:MOD,fn:'crit',args:{d:-2}},result_text:'La version courte sort en salles. Elle est plus fluide, plus plate aussi.'}},
  {choice_text:'Négocier dix minutes de moins',consequences:{bank_balance_modifier:[1000,6000],happiness_modifier:1,result_text:'Compromis à la française : tout le monde est vexé, mais un peu moins.'}}]},
{id:'showbiz_retro',category:'career_event',icon:'🏛️',conditions:{min_age:30,mod_cond:{mod:MOD,fn:'cesar'}},probability_weight:0.06,
 prompt_text:'La Cinémathèque te consacre une rétrospective. Les gens font la queue sur le trottoir.',
 consequences:{fame_modifier:3,happiness_modifier:6,result_text:'Tu te revois à vingt ans sur grand écran, avec une coupe de cheveux discutable. Standing ovation.'}}
];
const effects={
  crit(L,a){const s=sb(L);const d=+a.d||0;s.crit=lim(s.crit+d,0,100);return ''},
  reseau(L,a){const s=sb(L);seed(L);const l=s.contacts.filter(c=>!a.kind||c.kind===a.kind);const c=l.length?pick(l):null;if(c){c.rel=lim(c.rel+(+a.d||5),0,100);c.t=L.age}return ''},
  newContact(L,a){const c=addContact(L,a.kind||'act');return `Tu fais la connaissance de ${c.first} ${c.last}, ${lab(c).toLowerCase()}.`}
};
const conds={
  acteur:L=>isAct(L),
  realisateur:L=>isDir(L),
  star:L=>isAct(L)&&L.job.lvl>=4,
  cesar:L=>(L.tr&&L.tr.cesars||0)>0,
  hasFilm:L=>(isAct(L)||isDir(L))&&((sb(L).filmo.length>0)||((L.films||[]).length>0))
};

/* ---------- Module ---------- */
registerMod({
  id:MOD,
  special:{
    acteur:{n:'Acteur',ic:'🎬',desc:'Castings, contacts, réputation, publicités et plateaux télé',ladder:LAD_A,req:{age:16},
      apply:applyActeur,
      year:yearA,
      salary:salaryA,
      panel:panelA},
    realisateur:{n:'Réalisateur',ic:'🎥',desc:'Onze genres de films, box-office, César et Palme d’or',ladder:LAD_R,req:{age:20},
      apply:applyRealisateur,
      year:yearR,
      salary:salaryR,
      panel:panelR}
  },
  worldInit(){const w=gsb();if(!w.hit)w.hit=null},
  worldYear(){const w=gsb();if(chance(.45))w.trend=pick(MOVIE_GENRES);if(chance(.6)){const g=pick(MOVIE_GENRES);w.hit={t:`${pick(TITLE_A)} ${pick(TITLE_B)}`,g,box:Math.round(R(20,400)*1e6)}}},
  events:eventsHook,
  eventsDb:EV,
  effects,
  conds,
  badges(L){
    const b=[];
    if(isAct(L)&&L.job.lvl>=4)b.push('⭐ Star de cinéma');
    if(L.tr&&L.tr.palme)b.push('🌴 Palme d’or');
    if(L.tr&&L.tr.cesars)b.push('🏆 César ×'+L.tr.cesars);
    return b;
  },
  sheetRows(L){
    const s=L.sb;const n=(s&&Array.isArray(s.filmo)?s.filmo.length:0)+((L.films||[]).length||0);
    return n?[nav('🎞️','Filmographie',`${n} œuvre${n>1?'s':''}`,pWorks)]:[];
  },
  inherit(D,L){
    if(!D||!D.sb||!L)return;
    L.sb={contacts:(D.sb.contacts||[]).slice(0,6).map(c=>Object.assign({},c,{rel:Math.round((c.rel||40)/2)})),filmo:[],aff:{},crit:20,drep:20,fund:0,script:0,pub:0,talk:0};
  }
});
})();
