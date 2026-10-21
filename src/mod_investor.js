/* Deux Vies — module « Investisseur » (id investor)
   Marché de capitaux partagé par toutes les vies (G.mk) : 12 actions, 3 crypto-monnaies, 6 matières premières,
   OAT 10 ans et obligations d’entreprise. État propre à chaque vie : L.inv
     h:{id:{q,c}}  positions (quantité, prix de revient total)      b:[obligations]      tb:[turbos et produits structurés]
     bets:[]  paris issus du journal financier      vh:[]  valeur du portefeuille année par année
     real/ry/carry  plus-values réalisées (cumul / année fiscale / moins-values reportables)      tip, lastTip, ins  conseils */
(()=>{
const MOD='investor';
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const r6=v=>Math.round(v*1e6)/1e6;
const EPS=1e-6;
const CATN={stock:'Actions',crypto:'Crypto-monnaies',com:'Matières premières'};
const FEE={stock:.005,crypto:.015,com:.01};

/* ================= Catalogue ================= */
const SEC={
  'Luxe':{ic:'💎',dy:.018,b:1.1,up:'les clients fortunés se ruent sur les malles en cuir',dn:'même les influenceurs achètent désormais d’occasion'},
  'Aéronautique':{ic:'✈️',dy:.015,b:1.2,up:'les carnets de commandes sont pleins pour dix ans',dn:'un volcan islandais cloue les avions au sol'},
  'Énergie':{ic:'⚡',dy:.05,b:.8,up:'un hiver glacial fait tourner les radiateurs à plein régime',dn:'un hiver tout doux fait plonger la demande'},
  'Technologie':{ic:'💻',dy:.006,b:1.35,up:'l’intelligence artificielle met tout le monde d’accord',dn:'une bulle technologique se dégonfle bruyamment'},
  'Santé':{ic:'💊',dy:.012,b:.7,up:'une vague de nouveaux médicaments est autorisée',dn:'Bruxelles encadre sévèrement le prix des médicaments'},
  'Banque':{ic:'🏦',dy:.06,b:1.2,up:'la hausse des taux regonfle les marges',dn:'des créances douteuses refont surface'},
  'Agroalimentaire':{ic:'🧀',dy:.03,b:.55,up:'le panier de courses augmente, les marges aussi',dn:'la grande distribution déclare la guerre des prix'},
  'Automobile':{ic:'🚗',dy:.04,b:1.3,up:'la prime à la conversion relance les ventes',dn:'de nouvelles normes antipollution font tousser les constructeurs'},
  'Jeux vidéo':{ic:'🎮',dy:0,b:1.25,up:'une console nouvelle génération bat tous les records',dn:'les joueurs boudent les suites de suites'},
  'Immobilier':{ic:'🏢',dy:.045,b:.9,up:'les taux de crédit baissent et les acheteurs reviennent',dn:'les taux grimpent et les agences sont désertes'},
  'Télécoms':{ic:'📡',dy:.055,b:.6,up:'la fibre arrive enfin au fond de la Creuse',dn:'la guerre des forfaits à 2 € reprend de plus belle'},
  'Spatial':{ic:'🚀',dy:0,b:1.5,up:'un contrat géant pour une constellation de satellites est signé',dn:'un lanceur explose en vol (sans équipage, heureusement)'}
};
const DESC={
  LUXR:'Maroquinerie, parfums et malles de voyage depuis 1854. Un sac coûte un SMIC et la liste d’attente dure deux ans.',
  AERO:'Avionneur toulousain. Ses carnets de commandes sont pleins, ses usines un peu moins.',
  VOLT:'Énergéticien historique : centrales, éoliennes et factures que personne ne comprend.',
  PIXL:'Champion français du cloud. Baby-foot, open space et ambitions mondiales.',
  BIOG:'Biotech lyonnaise. Chaque essai clinique peut doubler le cours… ou le diviser par deux.',
  BQHX:'La banque de ton grand-père. Solide, ennuyeuse et généreuse en dividendes.',
  DLCO:'Fromages, biscuits et yaourts. On mange même en temps de crise.',
  MOTO:'Constructeur automobile. Sensible aux cycles économiques, aux normes et aux primes à la conversion.',
  LUDI:'Studio de jeux vidéo. Un succès planétaire ou un report de plus, rarement entre les deux.',
  PIER:'Foncière immobilière : bureaux, centres commerciaux et loyers bien réguliers.',
  TLCM:'Opérateur télécoms. Box, forfaits et guerre des prix permanente.',
  COSM:'Start-up spatiale. Des fusées, des rêves, et pas un centime de bénéfice.',
  BPC:'La toute première crypto-monnaie. Ton oncle en parle à chaque repas de famille.',
  ETH:'Une blockchain programmable. Personne n’a vraiment compris, mais tout le monde en veut.',
  CHAT:'Une crypto-monnaie née d’un mème de chat. Aucune utilité, énormément d’enthousiasme.',
  XAU:'La valeur refuge par excellence. Ne rapporte rien, mais rassure tout le monde quand ça tangue.',
  XAG:'Le petit frère de l’or, en plus nerveux. On en met aussi dans les panneaux solaires.',
  BRNT:'L’or noir. Suspendu aux tensions géopolitiques et aux humeurs des pays producteurs.',
  BLE:'La matière première de ta baguette. Ici, c’est la météo qui fait la loi.',
  CUIV:'On l’appelle « Docteur Cuivre » : son prix prédit l’économie mondiale mieux que les économistes.',
  CAFE:'Le carburant des salles de marché. Un gel au Brésil et les cours s’affolent.'
};
const LIST=[],DEF={};
const addA=A=>{if(!A||!A.id||DEF[A.id])return;LIST.push(A);DEF[A.id]=A};
const STK=(typeof STOCKS!=='undefined'&&Array.isArray(STOCKS)&&STOCKS.length)?STOCKS:[
  {t:'LUXR',n:'Maison Lumière',s:'Luxe',p:310,v:.22},{t:'AERO',n:'Aérodyne',s:'Aéronautique',p:145,v:.25},{t:'VOLT',n:'Voltéo',s:'Énergie',p:28,v:.2},
  {t:'PIXL',n:'Pixelia',s:'Technologie',p:96,v:.35},{t:'BIOG',n:'Biogène',s:'Santé',p:62,v:.4},{t:'BQHX',n:'Banque Hexagone',s:'Banque',p:54,v:.18},
  {t:'DLCO',n:'Délices & Co',s:'Agroalimentaire',p:88,v:.12},{t:'MOTO',n:'Motorama',s:'Automobile',p:41,v:.28},{t:'LUDI',n:'Ludiverse',s:'Jeux vidéo',p:73,v:.38},
  {t:'PIER',n:'Pierre & Toit',s:'Immobilier',p:67,v:.15},{t:'TLCM',n:'Télécomète',s:'Télécoms',p:19,v:.16},{t:'COSM',n:'Cosmonix',s:'Spatial',p:120,v:.5}];
const CRY=(typeof CRYPTOS!=='undefined'&&Array.isArray(CRYPTOS)&&CRYPTOS.length)?CRYPTOS:[{t:'BPC',n:'BitPièce',p:42000,v:.65},{t:'ETH',n:'Éthéron',p:2600,v:.8},{t:'CHAT',n:'ChatCoin',p:.12,v:1.4}];
for(const s of STK){if(!s||!s.t)continue;const S=SEC[s.s]||{ic:'🏛️',dy:.02,b:1};addA({id:s.t,n:s.n||s.t,cat:'stock',sec:s.s||'Divers',p0:+s.p||50,v:+s.v||.25,beta:S.b,dy:S.dy,mu:.07-S.dy,mr:.12,ic:S.ic,frac:false,desc:DESC[s.t]||''})}
const CRY_X={BPC:['🪙',1],ETH:['💠',1.15],CHAT:['🐱',1.5]};
for(const c of CRY){if(!c||!c.t)continue;const X=CRY_X[c.t]||['🪙',1.2];addA({id:c.t,n:c.n||c.t,cat:'crypto',p0:+c.p||1,v:+c.v||.8,beta:X[1],dy:0,mu:.06,mr:.08,ic:X[0],frac:true,desc:DESC[c.t]||''})}
const COMS=[['XAU','Or','once','onces','d’or',2300,.15,-.25,'🥇'],['XAG','Argent','once','onces','d’argent',27,.28,.2,'🥈'],['BRNT','Pétrole brut','baril','barils','de pétrole brut',78,.34,.5,'🛢️'],
  ['BLE','Blé','tonne','tonnes','de blé',230,.24,0,'🌾'],['CUIV','Cuivre','tonne','tonnes','de cuivre',8500,.24,.7,'🔶'],['CAFE','Café arabica','tonne','tonnes','de café',3800,.32,.1,'☕']];
for(const [id,n,u,us,de,p,v,b,ic] of COMS)addA({id,n,cat:'com',unit:u,units:us,de,p0:p,v,beta:b,dy:0,mu:.025,mr:.22,ic,frac:true,desc:DESC[id]||''});
const STOCK_L=LIST.filter(A=>A.cat==='stock');
const SECTORS=[...new Set(STOCK_L.map(A=>A.sec))];
const COM_NEWS={
  XAU:['les banques centrales font le plein de lingots','l’or perd de son éclat face à des taux élevés'],
  XAG:['les fabricants de panneaux solaires s’arrachent l’argent-métal','les stocks d’argent débordent des coffres'],
  BRNT:['les pays producteurs ferment les vannes','surproduction : les pétroliers font la queue au large'],
  BLE:['la sécheresse frappe les grandes plaines céréalières','récolte record : les silos débordent'],
  CUIV:['la transition électrique réclame des milliers de kilomètres de câbles','les chantiers asiatiques tournent au ralenti'],
  CAFE:['le gel frappe les plantations brésiliennes','récolte exceptionnelle en Colombie et au Vietnam']
};
const TAIL_UP=['des résultats bien meilleurs que prévu','un contrat historique signé en Asie','une rumeur de rachat qui se confirme','un produit vedette en rupture de stock partout'];
const TAIL_DN=['avertissement sur les résultats','le PDG démissionne en pleine conférence de presse','un audit révèle des comptes très « créatifs »','une amende record infligée par Bruxelles'];
const RAT=[['A',.05,.004],['BBB',.058,.01],['BB',.067,.025],['B',.077,.05],['CCC',.087,.09]];
const PRIV=['Camping Les Flots Bleus SA','Fromageries du Haut-Jura','TrottiCiel, trottinettes volantes','Chantiers navals de Lorient','Croissants Express','Remontées mécaniques du Mont-Fictif','Escargots de Bourgogne Industries','Papeteries du Vercors'];

/* ================= Formats ================= */
const pxF=p=>{if(!isFinite(p))return '—';const a=Math.abs(p);let s;if(a>=1000)s=Math.round(p).toLocaleString('fr-FR');else if(a>=1)s=p.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2});else s=p.toLocaleString('fr-FR',{minimumFractionDigits:3,maximumFractionDigits:5});return s+' €'};
const pctF=x=>{if(!isFinite(x))return '—';const v=x*100,a=Math.abs(v);return (v>=0?'+':'−')+(a>=100?Math.round(a).toLocaleString('fr-FR'):a.toFixed(1).replace('.',','))+' %'};
const pctA=x=>pctF(Math.abs(x)).slice(1);
const pcF=r=>((r||0)*100).toFixed(2).replace('.',',')+' %';
const sgK=n=>(n>0?'+':'')+fmtk(n);
const colV=x=>`var(${x>=0?'--good':'--bad'})`;
const varH=x=>`<span style="color:${colV(x)};font-weight:600">${pctF(x)}</span>`;
const qtyF=q=>{const x=r6(q);return Number.isInteger(x)?fmtn(x):x.toLocaleString('fr-FR',{maximumFractionDigits:x<1?6:3})};
const qtyLab=(A,q)=>A.cat==='stock'?`${qtyF(q)} action${q>=2?'s':''}`:A.cat==='crypto'?`${qtyF(q)} ${A.n}`:`${qtyF(q)} ${q>=2?A.units:A.unit}`;
const phr=(A,q)=>A.cat==='stock'?`${qtyF(q)} action${q>=2?'s':''} ${A.n}`:A.cat==='crypto'?`${qtyF(q)} ${A.n}`:`${qtyF(q)} ${q>=2?A.units:A.unit} ${A.de}`;
const volLab=v=>v<.15?'faible':v<.3?'modérée':v<.5?'forte':v<.9?'très forte':'extrême';
const riskLab=p=>p<.005?'très faible':p<.015?'faible':p<.03?'modéré':p<.06?'élevé':'très élevé';
const ago=d=>d<=0?'Cette année':d===1?'L’an dernier':`Il y a ${d} ans`;
const btnG=(g,t,pri,dis)=>`<button type="button" class="btn${pri?' pri':''}" data-g="${g}"${dis?' disabled':''}>${esc(t)}</button>`;

/* ================= Marché mondial (G.mk) ================= */
function priceOf(id){const a=G&&G.mk&&G.mk.a&&G.mk.a[id];return a&&a.p>0&&isFinite(a.p)?a.p:(DEF[id]?DEF[id].p0:0)}
function addPend(M,id,x){if(!DEF[id]||!isFinite(x))return;const c0=+M.pend[id]||0;M.pend[id]=lim((1+c0)*(1+x)-1,-.85,3)}
function genCorp(M){
  const res=[],used={};
  for(let i=0;i<6&&res.length<4;i++){
    const listed=chance(.65)&&STOCK_L.length;let iss=null,n;
    if(listed){const A=pick(STOCK_L);iss=A.id;n=A.n}else n=pick(PRIV);
    if(used[n])continue;used[n]=1;
    const ri=+(listed?wpick({0:3,1:4,2:3,3:1,4:.5}):wpick({1:1,2:3,3:3,4:2}));const [rt,base,risk]=RAT[ri]||RAT[1];
    const r=Math.round(lim(base+((M.oat||.03)-.03)*.5+R(-3,3)/1000,.05,.09)*10000)/10000;
    res.push({k:'c'+M.y+'_'+i,iss,n,rt,r,m:R(3,8),risk});
  }
  return res;
}
const oatOffer=M=>({k:'oat'+M.y,oat:true,n:'OAT 10 ans',iss:null,rt:'AA',r:M.oat,m:10,risk:0});
function tick(M,silent){
  M.y++;const N=[];const push=(ic,t)=>{if(!silent)N.push({y:M.y,ic,t})};
  let m=.05+gauss()*.13,reg='';const u=Math.random();
  if(u<.05){m=-R(22,42)/100;reg='krach'}else if(u<.1){m=R(16,30)/100;reg='boom'}
  let c=gauss()*.3,creg='';const u2=Math.random();
  if(u2<.12){c=-R(50,80)/100;creg='hiver'}else if(u2<.24){c=R(45,100)/100;creg='folie'}
  const cf=gauss()*.06;
  const sec={};
  for(const s of SECTORS){sec[s]=gauss()*.05;if(chance(.05)){const up=chance(.5);sec[s]+=(up?1:-1)*R(15,30)/100;const S=SEC[s];if(S)push(up?'🟢':'🔴',`${S.ic} ${s} : ${up?'forte hausse':'trou d’air'}, ${up?S.up:S.dn}.`)}}
  const spec={};
  for(const A of LIST)if(A.cat==='com'&&chance(.08)){const up=chance(.55);spec[A.id]=(up?1:-1)*R(15,35)/100;const T=COM_NEWS[A.id];if(T)push(A.ic,`${A.n} ${up?'en flèche':'en repli'} : ${T[up?0:1]}.`)}
  const tails=[];
  for(const A of LIST){
    const a=M.a[A.id];
    const dev=Math.log(a.p/A.p0)-A.mu*M.y;
    let r=A.mu-A.mr*dev+A.v*.75*gauss();
    if(A.cat==='stock')r+=A.beta*(m-.05)+(sec[A.sec]||0);
    else if(A.cat==='crypto')r+=A.beta*c;
    else r+=cf+A.beta*(m-.05)*.5+(spec[A.id]||0);
    if(A.cat==='stock'&&chance(.025)){const up=chance(.5);const j=up?R(35,110)/100:-R(35,65)/100;r+=Math.log(1+j);tails.push([A,up])}
    r=lim(r,-2.5,2.5);
    let np=a.p*Math.exp(r);
    const b=+M.pend[A.id];if(b&&isFinite(b))np*=1+lim(b,-.9,4);
    if(!isFinite(np)||np<=0)np=a.p;
    np=+lim(np,A.p0*.003,A.p0*400).toPrecision(6);
    a.prev=a.p;a.p=np;a.h=(Array.isArray(a.h)?a.h:[]).concat(np).slice(-15);
  }
  M.pend={};
  for(const [A,up] of tails){const a=M.a[A.id],x=a.p/a.prev-1;if(up&&x>.2)push('🚀',`${A.n} bondit de ${pctA(x)} : ${pick(TAIL_UP)}.`);else if(!up&&x<-.2)push('💥',`${A.n} s’effondre de ${pctA(x)} : ${pick(TAIL_DN)}.`)}
  const ix=STOCK_L.length?Math.round(STOCK_L.reduce((s,A)=>s+M.a[A.id].p/A.p0,0)/STOCK_L.length*1000):1000;
  const ixPrev=M.ix.length?M.ix[M.ix.length-1]:ix;M.ix=M.ix.concat(ix).slice(-15);
  const ixr=ixPrev?ix/ixPrev-1:0;
  const oat0=M.oat;M.oat=Math.round(lim(M.oat+(.03-M.oat)*.2+gauss()*.003-(reg==='krach'?.004:0),.005,.065)*10000)/10000;
  M.corp=genCorp(M);
  if(!silent){
    const H=[];
    if(reg==='krach')H.push(['📉',pick([`Krach boursier : l’indice HX12 dévisse de ${pctA(ixr)}. Les traders fixent leurs écrans, livides.`,`Année noire à la Bourse de Paris : l’HX12 perd ${pctA(ixr)}. On a vu des courtiers pleurer devant la machine à café.`])]);
    else if(reg==='boom')H.push(['📈',pick([`Euphorie boursière : l’HX12 s’envole de ${pctA(ixr)}. Même ton dentiste parle de stock-options.`,`Année faste : l’HX12 grimpe de ${pctA(ixr)}. Les terrasses du quartier de la Bourse affichent complet.`])]);
    else H.push(['📊',`Bilan de l’année : l’indice HX12 termine à ${fmtn(ix)} points (${pctF(ixr)}).`]);
    const bp=DEF.BPC&&M.a.BPC,bx=bp?bp.p/bp.prev-1:0;
    if(creg==='hiver'&&bp)H.push(['🥶',`Hiver crypto : la BitPièce ${bx<0?'perd '+pctA(bx):'stagne'}. Les « hodlers » serrent les dents.`]);
    else if(creg==='folie'&&bp)H.push(['🚀',`Folie crypto : la BitPièce ${bx>0?'prend '+pctF(bx):'fait du yoyo'}. Ton beau-frère parle de quitter son travail.`]);
    if(Math.abs(M.oat-oat0)>=.002)H.push(['🏛️',`Le taux de l’OAT 10 ans ${M.oat>oat0?'grimpe':'recule'} à ${pcF(M.oat)}.`]);
    for(const [ic,t] of H)N.unshift({y:M.y,ic,t});
    M.news=(Array.isArray(M.news)?M.news:[]).concat(N).slice(-24);
  }
  M.last={y:M.y,ixr,reg,creg};
}
function mkNew(){
  const M={v:1,y:-14,a:{},pend:{},news:[],ix:[1000],oat:.03,corp:[],last:null};
  for(const A of LIST)M.a[A.id]={p:A.p0,prev:A.p0,h:[A.p0]};
  for(let i=0;i<14;i++)tick(M,true);
  M.last=null;
  M.news=[{y:M.y,ic:'🔔',t:'La cloche retentit : les marchés ouvrent une nouvelle séance. Bonne chance aux audacieux.'}];
  return M;
}
function mkFix(M){
  if(typeof M.y!=='number'||!isFinite(M.y))M.y=0;
  if(!M.pend||typeof M.pend!=='object')M.pend={};
  if(!Array.isArray(M.news))M.news=[];
  if(!Array.isArray(M.ix)||!M.ix.length)M.ix=[1000];
  if(typeof M.oat!=='number'||!isFinite(M.oat))M.oat=.03;
  for(const A of LIST){
    let a=M.a[A.id];if(!a||typeof a!=='object')a=M.a[A.id]={};
    if(!(a.p>0)||!isFinite(a.p))a.p=A.p0;if(!(a.prev>0)||!isFinite(a.prev))a.prev=a.p;
    if(!Array.isArray(a.h))a.h=[];if(a.h.some(x=>!(x>0)||!isFinite(x)))a.h=a.h.filter(x=>x>0&&isFinite(x));if(!a.h.length)a.h=[a.p];
  }
  if(!Array.isArray(M.corp)||!M.corp.length)M.corp=genCorp(M);
  return M;
}
function mkGet(){if(!G)return null;if(!G.mk||typeof G.mk!=='object'||!G.mk.a||typeof G.mk.a!=='object')G.mk=mkNew();return mkFix(G.mk)}

/* ================= État d’une vie (L.inv) ================= */
function invSt(L){
  let I=L.inv;if(!I||typeof I!=='object'||Array.isArray(I))I=L.inv={};
  if(!I.h||typeof I.h!=='object'||Array.isArray(I.h))I.h={};
  for(const k of ['b','tb','bets','vh'])if(!Array.isArray(I[k]))I[k]=[];
  for(const k of ['real','ry','carry','div','divY','cpY','n','tipN','tipOk','lastRet'])if(typeof I[k]!=='number'||!isFinite(I[k]))I[k]=0;
  if(typeof I.seen!=='number'||!isFinite(I.seen))I.seen=G&&G.mk&&typeof G.mk.y==='number'?G.mk.y:0;
  for(const id in I.h){const h=I.h[id];if(!h||typeof h!=='object'||!isFinite(h.q)||!(h.q>EPS)){delete I.h[id];continue}if(!isFinite(h.c)||!(h.c>=0))h.c=0}
  if(I.b.some(b=>!b||!(b.f>0)||!isFinite(b.f)))I.b=I.b.filter(b=>b&&b.f>0&&isFinite(b.f));
  for(const b of I.b){if(!b.id)b.id=nid();if(typeof b.m!=='number'||!isFinite(b.m))b.m=1;if(typeof b.r!=='number'||!isFinite(b.r))b.r=.03;if(!b.n)b.n='Obligation';if(typeof b.risk!=='number')b.risk=b.oat?0:.02}
  if(I.tb.some(t=>!t||!(t.s>0)||!DEF[t.a]))I.tb=I.tb.filter(t=>t&&t.s>0&&DEF[t.a]);
  if(I.bets.some(b=>!b||!DEF[b.a]||!(b.p0>0)))I.bets=I.bets.filter(b=>b&&DEF[b.a]&&b.p0>0);
  if(I.vh.some(v=>!isFinite(v)))I.vh=I.vh.filter(v=>isFinite(v));
  if(I.tip&&(!DEF[I.tip.a]||!(I.tip.p0>0)))I.tip=null;
  return I;
}
function holdVal(L){
  const r={stock:0,crypto:0,com:0,pv:0,cost:0};const I=L&&L.inv;if(!I||!I.h||typeof I.h!=='object')return r;
  for(const id in I.h){const h=I.h[id],A=DEF[id];if(!A||!h||!(h.q>0))continue;const v=h.q*priceOf(id);if(!isFinite(v))continue;r[A.cat]+=v;r.pv+=v;r.cost+=(+h.c||0)}
  return r;
}
const bondFace=L=>{const I=L&&L.inv;return I&&Array.isArray(I.b)?I.b.reduce((s,b)=>s+(b&&b.f>0&&isFinite(b.f)?b.f:0),0):0};
const tbStake=L=>{const I=L&&L.inv;return I&&Array.isArray(I.tb)?I.tb.reduce((s,t)=>s+(t&&t.s>0&&isFinite(t.s)?t.s:0),0):0};
const invTotal=L=>holdVal(L).pv+bondFace(L)+tbStake(L);
function riskOf(L){
  const V=holdVal(L),bF=bondFace(L),tS=tbStake(L),tot=V.pv+bF+tS;if(tot<=0)return null;
  let s=bF*.03+tS;const I=L.inv;for(const id in I.h){const A=DEF[id],h=I.h[id];if(A&&h&&h.q>0)s+=h.q*priceOf(id)*A.v}s/=tot;
  const lab=s<.1?['Prudent','Ton banquier t’adore.']:s<.22?['Équilibré','Ni trop, ni trop peu.']:s<.4?['Dynamique','Tu aimes les sensations.']:s<.75?['Casse-cou','Ton cardiologue te déconseille l’appli de Bourse.']:['Kamikaze','Tu joues ta fortune à pile ou face.'];
  return {s,lab:lab[0],d:lab[1]};
}

/* ================= Opérations ================= */
function addHold(I,id,q,c){const h=I.h[id]||(I.h[id]={q:0,c:0});h.q=r6(h.q+q);h.c=Math.round((h.c+c)*100)/100}
function buyQ(L,id,q,cost,unit){const I=invSt(L),A=DEF[id];addHold(I,id,q,cost);I.n++;track(L,'trades');return `🟢 Tu achètes ${phr(A,q)} à ${pxF(unit||priceOf(id))} (${fmt(cost)} frais compris).`}
function buyAmt(L,id,amt,prem){
  const A=DEF[id];if(!A)return [false,''];
  const p=priceOf(id)*(1+(prem||0)/100),f=FEE[A.cat]||.01;
  const q=A.frac?r6(amt/(p*(1+f))):Math.floor(amt/(p*(1+f)));
  if(!(q>0))return [false,`Le montant ne suffit pas pour acheter ${A.cat==='stock'?'une seule action '+A.n:A.n}.`];
  const cost=Math.max(1,Math.round(q*p*(1+f)));if(cost>L.money)return [false,'Fonds insuffisants.'];
  L.money-=cost;return [true,buyQ(L,id,q,cost,p)];
}
function sellCore(L,id,q,prem){
  const I=invSt(L),A=DEF[id],h=I.h[id];if(!A||!h||!(h.q>0))return null;
  q=Math.min(q,h.q);const p=priceOf(id)*(1+(prem||0)/100),f=FEE[A.cat]||.01;
  const proceeds=Math.round(q*p*(1-f));const basis=h.c*(q/h.q);const gain=Math.round(proceeds-basis);
  h.q=r6(h.q-q);h.c=Math.max(0,Math.round((h.c-basis)*100)/100);if(h.q<=EPS)delete I.h[id];
  L.money+=proceeds;I.real+=gain;I.ry+=gain;I.n++;track(L,'trades');if(gain>0)track(L,'stockGains',gain);
  return {q,p,proceeds,gain};
}
function sellQ(L,id,q,prem){
  const A=DEF[id];const r=sellCore(L,id,q,prem);if(!r)return 'Tu ne possèdes pas cet actif.';
  return `🔴 Tu vends ${phr(A,r.q)} à ${pxF(r.p)} : ${fmt(r.proceeds)} encaissés, ${r.gain>=0?'plus-value':'moins-value'} de ${fmt(Math.abs(r.gain))}.`;
}
function sellAmt(L,id,amt){
  const I=invSt(L),A=DEF[id],h=I.h[id];if(!A||!h||!(h.q>0))return 'Tu ne possèdes pas cet actif.';
  const p=priceOf(id),f=FEE[A.cat]||.01;const q=A.frac?Math.min(h.q,r6(amt/(p*(1-f)))):Math.min(h.q,Math.ceil(amt/(p*(1-f))));
  return sellQ(L,id,q);
}
function openTurbo(L,id,s){
  const I=invSt(L),M=mkGet(),A=DEF[id];if(!A||!(s>0))return '';
  I.tb.push({id:nid(),a:id,s:Math.round(s),p0:priceOf(id),y:M.y,k:'short'});I.n++;track(L,'trades');
  return `🎯 Tu paries ${fmt(s)} sur la baisse de ${A.n} : un turbo baissier qui peut doubler ta mise si le cours s’effondre, et s’annule s’il double.`;
}
function buyBond(L,o,amt){
  const I=invSt(L),M=mkGet();
  const ex=I.b.find(b=>b.k===o.k&&b.y===M.y);
  if(ex)ex.f+=amt;else I.b.push({id:nid(),k:o.k,oat:!!o.oat,n:o.n,iss:o.iss||null,rt:o.rt||'AA',r:o.r,f:amt,m:o.m,t:o.m,risk:o.risk||0,y:M.y});
  I.n++;track(L,'trades');
  return `📜 Tu souscris ${fmt(amt)} ${o.oat?'d’OAT 10 ans':'d’obligations '+o.n} à ${pcF(o.r)} par an pendant ${An(o.m)}.`;
}
function bondPx(b,M){
  if(b.oat)return lim(1+(b.r-M.oat)*b.m*.85,.6,1.5);
  const base=(RAT.find(x=>x[0]===b.rt)||RAT[1])[1];let k=1+(b.r-base-(M.oat-.03)*.5)*b.m*.5-.02;
  const ia=b.iss&&M.a[b.iss];if(ia&&ia.prev>0&&ia.p/ia.prev<.65)k-=.2;
  return lim(k,.3,1.3);
}
function sellBond(L,id){
  const I=invSt(L),M=mkGet(),b=I.b.find(x=>x.id===id);if(!b)return 'Cette obligation n’est plus dans ton portefeuille.';
  const v=Math.round(b.f*bondPx(b,M));const g=v-b.f;L.money+=v;I.real+=g;I.ry+=g;if(g>0)track(L,'stockGains',g);I.b=I.b.filter(x=>x!==b);I.n++;
  return `📜 Tu revends ton obligation ${b.n} sur le marché secondaire : ${fmt(v)} pour ${fmt(b.f)} de nominal.`;
}
function sellCat(L,cat){
  const I=invSt(L);let n=0,tot=0,g=0;
  for(const A of LIST)if(A.cat===cat&&I.h[A.id]&&I.h[A.id].q>0){const r=sellCore(L,A.id,I.h[A.id].q);if(r){n++;tot+=r.proceeds;g+=r.gain}}
  if(!n)return '';
  return `🧺 Tu soldes ${n} ligne${n>1?'s':''} (${CATN[cat].toLowerCase()}) : ${fmt(tot)} encaissés, ${g>=0?'plus-value':'moins-value'} de ${fmt(Math.abs(g))}.`;
}
function biasFrom(M,a){
  if(!a.b)return;const truth=a.p==null?true:chance(a.p);const spec=truth?a.b:a.f;if(!spec)return;
  const tg=Array.isArray(a.ids)?a.ids:a.bc?LIST.filter(A=>A.cat===a.bc).map(A=>A.id):a.a?[a.a]:[];
  if(Array.isArray(spec)){for(const id of tg)addPend(M,id,R(spec[0],spec[1])/100)}
  else for(const id in spec)if(Array.isArray(spec[id]))addPend(M,id,R(spec[id][0],spec[id][1])/100);
}

/* ================= Conseillers financiers ================= */
const ADV=[
  {k:'kevin',sn:'Kévin',n:'Kévin, « coach en liberté financière »',ic:'🧢',cost:150,rel:.4,s:'Formation vidéo à 150 € · 1,2 million d’abonnés, zéro diplôme'},
  {k:'banque',sn:'ton conseiller bancaire',n:'Ton conseiller bancaire',ic:'🏦',cost:0,rel:.5,s:'Gratuit · il a des objectifs commerciaux'},
  {k:'cgp',sn:'Mme Delmas',n:'Mme Delmas, conseillère en gestion de patrimoine',ic:'👩‍💼',cost:2500,rel:.62,s:'2 500 € la consultation · sérieuse et méthodique'},
  {k:'prive',sn:'la banque Vasseur & Fils',n:'Banque privée Vasseur & Fils',ic:'🎩',cost:20000,rel:.75,s:'20 000 € · réservée aux patrimoines de plus de 250 000 €',minW:250000},
  {k:'initie',sn:'ton ami bien informé',n:'Un ami qui « connaît du monde »',ic:'🤫',cost:0,rel:.9,s:'Information privilégiée · strictement illégal',ins:true}
];
const TIPS={
  kevin:[['« Frère, {n}, c’est le futur. Fais-moi confiance, j’ai une Lamborghini (de location). »','« {n} va faire x10, c’est mathématique. J’ai fait un graphique avec des flèches. »'],['« {n} ? C’est fini, crois-moi. Sors de là avant qu’il soit trop tard. »','« Mon intuition me dit de fuir {n}. Mon intuition se trompe rarement. Enfin, parfois. »']],
  banque:[['« Je vous recommande vivement {n}. Ce n’est pas du tout lié à mes objectifs commerciaux du trimestre. »','« {n} correspond parfaitement à votre profil. Enfin, à celui que j’ai coché pour vous. »'],['« Entre nous, je serais prudent sur {n}. Mais ne le répétez pas à ma direction. »','« Vous devriez alléger {n}. C’est la note interne qui le dit, pas moi. »']],
  cgp:[['« Les fondamentaux de {n} sont encourageants. J’y placerais une part raisonnable de votre épargne. »','« {n} est sous-évalué au regard de ses flux de trésorerie. Je suis plutôt acheteuse. »'],['« Je serais prudente sur {n} : les marges se dégradent depuis trois trimestres. »','« {n} me semble trop cher. Je prendrais mes bénéfices. »']],
  prive:[['« Nos analystes à Genève sont formels : {n} est nettement sous-évalué. » Le café t’est servi dans une tasse en porcelaine de Limoges.','« Notre comité d’investissement a retenu {n}. Un conseil que nous ne donnons qu’à nos meilleurs clients. »'],['« Nous recommandons de réduire l’exposition à {n}. Discrètement, bien sûr. »','« Notre comité est très réservé sur {n}. Nous en sortons nous-mêmes. »']],
  initie:[['« Tu ne tiens pas ça de moi, mais {n} va annoncer un énorme contrat la semaine prochaine. » Il regarde par-dessus son épaule.','« J’ai vu passer un document… {n} va exploser. Tu n’as rien entendu. »'],['« Tu ne tiens pas ça de moi, mais {n} va annoncer de très mauvais chiffres. »','« Sors de {n}, vite. Ne me demande pas pourquoi. »']]
};
function followBuy(L,id,amt,adv){
  const I=invSt(L),M=mkGet();if(L.money<amt)return 'Fonds insuffisants.';
  const [ok,t]=buyAmt(L,id,amt);if(!ok)return t;
  if(adv.ins){I.ins={a:id,amt,y:M.y};chg(L,{karma:-6,crime:5})}
  return out(L,t);
}
function askTip(L,adv){
  const I=invSt(L),M=mkGet();
  let pool=adv.k==='kevin'?(chance(.6)?LIST.filter(A=>A.cat==='crypto'):LIST.filter(A=>A.cat!=='com')):adv.k==='banque'&&DEF.BQHX&&chance(.5)?[DEF.BQHX]:adv.ins?STOCK_L:LIST;
  if(!pool.length)pool=LIST;
  const A=pick(pool);const held=!!(I.h[A.id]&&I.h[A.id].q>0);
  const dir=(held&&chance(.4))||chance(.12)?-1:1;
  const right=chance(adv.rel);
  addPend(M,A.id,(right?dir*(adv.ins?R(15,32):R(8,22)):-dir*R(4,15))/100);
  I.tip={a:A.id,dir,y:M.y,wn:adv.sn,p0:priceOf(A.id)};I.tipN++;
  const T=TIPS[adv.k]||TIPS.cgp;const text=pick(T[dir>0?0:1]).replace('{n}',A.n);
  const money=Math.max(0,L.money),a5=Math.round(money*.05),a20=Math.round(money*.2);
  const ch=[];
  if(dir>0){
    if(a5>=300)ch.push({t:`Investir 5 % de tes liquidités (${fmt(a5)})`,fn:()=>followBuy(L,A.id,a5,adv)});
    if(a20>=300)ch.push({t:`Investir 20 % de tes liquidités (${fmt(a20)})`,fn:()=>followBuy(L,A.id,a20,adv)});
  }else{
    if(held)ch.push({t:`Vendre toutes tes positions sur ${A.n}`,fn:()=>{const h=invSt(L).h[A.id];return out(L,h&&h.q>0?sellQ(L,A.id,h.q):'Plus rien à vendre.')}});
    if(a5>=300)ch.push({t:`Parier sur la baisse (${fmt(a5)})`,fn:()=>{if(L.money<a5)return 'Fonds insuffisants.';L.money-=a5;return out(L,openTurbo(L,A.id,a5))}});
  }
  ch.push({t:dir>0?'Ne pas suivre le conseil':'Ne rien faire',fn:()=>out(L,`Tu remercies ${adv.sn} et tu gardes ton argent au chaud.`)});
  modal({title:adv.n,icon:adv.ic,text,choices:ch});
  return '';
}

/* ================= Mini-jeu : séance de day trading ================= */
const DT_UP=['Un gros acheteur serait sur le marché','Les carnets d’ordres penchent à l’achat','Un analyste vedette relève son objectif','Rumeur de bons chiffres dans l’heure','Les algorithmes s’emballent à la hausse'];
const DT_DN=['Une vente massive se prépare, dit-on','Les carnets d’ordres penchent à la vente','Un analyste vedette dégrade le titre','Rumeur d’avertissement sur résultats','Les algorithmes coupent leurs positions'];
function dayTrade(L,stake){
  const I=invSt(L);const N=10;const rel=lim(.55+(L.st.smarts||50)/500,.55,.75);
  let price=100,cash=stake,units=0,t=0,done=false,msg='',dir=1,hl='';const hist=[100];
  const plan=()=>{dir=chance(.5)?1:-1;const hint=chance(rel)?dir:-dir;hl=pick(hint>0?DT_UP:DT_DN)};plan();
  const finish=()=>{
    if(units>0){cash+=units*price*.999;units=0}done=true;
    const fin=Math.round(cash),g=fin-stake;L.money+=fin;I.real+=g;I.ry+=g;I.n++;track(L,'trades');if(g>0)track(L,'stockGains',g);
    msg=g>stake*.08?`Séance de folie : +${fmt(g)} ! Tu te sens l’âme d’un loup de la finance.`:g>0?`Séance gagnante : +${fmt(g)}. Pas mal pour un mardi.`:g===0?'Séance blanche : tu repars avec ta mise.':g>-stake*.08?`Séance perdante : ${fmt(g)}. Le marché t’a eu à l’usure.`:`Séance cauchemar : ${fmt(g)}. Tu refermes l’ordinateur d’un coup sec.`;
  };
  const step=()=>{price=Math.max(1,price*(1+dir*R(1,5)/100+gauss()*.008));hist.push(Math.round(price*100)/100);t++;if(t>=N)finish();else plan()};
  modal({title:`Day trading · mise ${fmt(stake)}`,icon:'⚡',html:'',choices:[],mount:el=>{
    const draw=()=>{const val=cash+units*price,pl=val-stake;
      el.innerHTML=`<p class="gsub">${done?'La cloche a sonné, la séance est terminée.':`Décision ${t+1} sur ${N} · « ${esc(hl)} »`}</p>${spark(hist,300,70)}<div class="card kv"><div><small>Cours du turbo</small><b>${esc(price.toFixed(2).replace('.',','))}</b></div><div><small>Position</small><b>${units>0?'Acheteur':'Liquide'}</b></div><div><small>Valeur</small><b>${fmt(val)}</b></div><div><small>Résultat</small><b style="color:${colV(pl)}">${pl>=0?'+':''}${fmt(pl)}</b></div></div>${done?`<p class="gmsg">${esc(msg)}</p>`:''}<div class="gbtns">${done?btnG('end','Fermer la plateforme',1):btnG('buy','Acheter',1,units>0)+btnG('sell','Vendre',0,!(units>0))+btnG('wait','Attendre')}</div>`};
    el.onclick=e=>{const b=e.target.closest('[data-g]');if(!b||b.disabled)return;const k=b.dataset.g;
      if(k==='end'){say(L,'⚡ '+msg);endModal(msg);return}
      if(done)return;
      if(k==='buy'&&!(units>0)){units=cash*.999/price;cash=0}
      else if(k==='sell'&&units>0){cash=units*price*.999;units=0}
      step();draw()};
    draw();
  }});
}

/* ================= Interface ================= */
function shareLine(n,s){return `<div class="stat"><b>${esc(n)}</b><span class="n">${Math.round(s*100)} %</span><span class="bar"><i style="width:${lim(s*100,0,100)}%;background:var(--pc)"></i></span></div>`}
function pMarket(){
  const L=cur(),M=mkGet();
  if(!M)return {title:'Bourse et marchés',html:note('Les marchés sont fermés.')};
  if(L.age<18)return {title:'Bourse et marchés',html:note('Il faut avoir 18 ans pour ouvrir un compte-titres. En attendant, il reste le Monopoly.')};
  const I=invSt(L),V=holdVal(L),bF=bondFace(L),tS=tbStake(L),lat=V.pv-V.cost,tot=V.pv+bF+tS;
  let h=`<div class="card kv"><div><small>Portefeuille</small><b>${fmtk(V.pv)}</b></div><div><small>Obligations</small><b>${fmtk(bF)}</b></div><div><small>Plus-values latentes</small><b style="color:${colV(lat)}">${sgK(Math.round(lat))}</b></div><div><small>Plus-values réalisées</small><b style="color:${colV(I.real)}">${sgK(Math.round(I.real))}</b></div><div><small>Dividendes et coupons</small><b>${fmtk(I.divY+I.cpY)}</b></div><div><small>Liquidités</small><b>${fmtk(L.money)}</b></div></div>`;
  const ix=M.ix[M.ix.length-1],ixr=M.ix.length>1?ix/M.ix[M.ix.length-2]-1:0;
  h+=card('Indice HX12',`${fmtn(ix)} points`,`${pctF(ixr)} sur un an · OAT 10 ans : ${pcF(M.oat)}`,spark(M.ix,300,48));
  if(I.vh.length>1)h+=card('Tes placements',fmtk(tot),`Évolution sur ${An(I.vh.length-1)}${I.carry<0?` · moins-values reportables : ${fmt(-I.carry)}`:''}`,spark(I.vh.concat(Math.round(tot)),300,52));
  if(tot>0){
    const rk=riskOf(L);const parts=[['Actions',V.stock],['Crypto-monnaies',V.crypto],['Matières premières',V.com],['Obligations',bF],['Paris et produits structurés',tS]].filter(x=>x[1]>0);
    h+=card('Répartition',rk?`Profil ${rk.lab.toLowerCase()}`:'',rk?rk.d:'',parts.map(([n,v])=>shareLine(n,v/tot)).join(''));
  }
  if(L.prison)h+=note('Depuis ta cellule, impossible de passer des ordres. Tes placements, eux, continuent de vivre leur vie.');
  const pos=Object.keys(I.h).filter(id=>DEF[id]&&I.h[id].q>0).map(id=>({id,v:I.h[id].q*priceOf(id)})).sort((a,b)=>b.v-a.v);
  if(pos.length)h+=group('Mes positions',pos.map(({id,v})=>{const A=DEF[id],ho=I.h[id],pl=ho.c>0?v/ho.c-1:0;return row({ic:A.ic,t:A.n,s:`${qtyLab(A,ho.q)} · ${fmt(v)} · ${pctF(pl)}`,right:'›',a:()=>pushPanel(pAsset(id))})}));
  if(I.tb.length)h+=group('Paris en cours',I.tb.map(t=>{const A=DEF[t.a];return row({ic:t.k==='struct'?'🏦':'🎯',t:t.k==='struct'?'Autocall Sérénité Plus':`Turbo baissier sur ${A.n}`,s:t.k==='struct'?`${fmt(t.s)} engagés · verdict l’an prochain`:`${fmt(t.s)} misés à ${pxF(t.p0)} · cours actuel ${pxF(priceOf(t.a))} · dénouement l’an prochain`})}));
  h+=group('Marchés',[
    nav('🏛️','Actions',`${STOCK_L.length} valeurs de l’indice HX12 · dividendes annuels`,pList('stock')),
    nav('🪙','Crypto-monnaies','BitPièce, Éthéron, ChatCoin · très volatiles',pList('crypto')),
    nav('🛢️','Matières premières','Or, argent, pétrole, blé, cuivre, café',pList('com')),
    nav('📜','Obligations',`OAT 10 ans à ${pcF(M.oat)} · entreprises de 5 à 9 %`,pBonds)]);
  h+=group('Conseil et outils',[
    nav('💼','Conseiller financier',I.tip?'Un tuyau est en cours':'Un tuyau par an, plus ou moins fiable',pAdvisor),
    nav('📰','Journal financier','Les gros titres des dernières années',pNews),
    nav('🧮','Matrice de volatilité','Risque, bêta et corrélations',pVol),
    act(L,{ic:'⚡',t:'Séance de day trading',s:'Dix décisions en direct, une fois par an',key:'inv_day',dis:L.prison?'En prison':L.money<1000?'Il faut au moins 1 000 € de liquidités':'',fn:L=>{
      modal({title:'Day trading',icon:'⚡',text:'Tu t’installes devant trois écrans et un café serré. Quelle mise engages-tu pour cette séance ?',choices:[1000,10000,50000].filter(s=>L.money>=s).map(s=>({t:`Miser ${fmt(s)}`,fn:()=>{if(L.money<s)return 'Fonds insuffisants.';L.money-=s;dayTrade(L,s);return ''}})).concat([{t:'Finalement non',fn:()=>{delete L.used.inv_day;return 'Tu refermes la plateforme sans rien toucher.'}}])});return ''}})]);
  h+=note('Frais de courtage : 0,5 % sur les actions, 1 % sur les matières premières, 1,5 % sur les crypto-monnaies. Les plus-values réalisées sont soumises à la flat tax de 30 % l’année suivante, les moins-values se reportent.');
  return {title:'Bourse et marchés',html:h};
}
const pList=cat=>()=>{
  const L=cur(),M=mkGet(),I=invSt(L);
  const intro={stock:'Douze valeurs de l’indice HX12. La plupart versent un dividende chaque année, sauf les rêveuses comme Cosmonix ou Ludiverse.',crypto:'Trois crypto-monnaies. Ça monte comme une fusée et ça redescend comme une enclume. Fractions autorisées.',com:'Matières premières cotées à l’unité de référence (once, baril, tonne). Fractions autorisées.'}[cat]||'';
  const rows=LIST.filter(A=>A.cat===cat).map(A=>{const a=M.a[A.id],p=a.p,y1=a.h.length>1?p/a.h[a.h.length-2]-1:0,ho=I.h[A.id];
    return row({ic:A.ic,t:A.cat==='stock'?`${A.n} · ${A.id}`:A.n,s:`${A.cat==='stock'?A.sec+' · ':''}${pxF(p)}${A.cat==='com'?' / '+A.unit:''}${ho&&ho.q>0?` · ${qtyLab(A,ho.q)} en portefeuille`:''}`,
      right:`<span style="display:grid;justify-items:end;gap:2px">${spark(a.h,64,20)}${varH(y1)}</span>`,a:()=>pushPanel(pAsset(A.id))})});
  return {title:CATN[cat]||'Marché',html:note(intro)+group('Cours et variation sur un an',rows)};
};
const pAsset=id=>()=>{
  const L=cur(),M=mkGet(),I=invSt(L),A=DEF[id],a=M&&M.a[id];
  if(!A||!a)return {title:'Actif',html:note('Cet actif n’est plus coté.')};
  const p=a.p,hs=a.h,y1=hs.length>1?p/hs[hs.length-2]-1:0,y5=hs.length>5?p/hs[hs.length-6]-1:null;
  const hi=Math.max(...hs),lo=Math.min(...hs),f=FEE[A.cat]||.01;
  const ho=I.h[id],q=ho&&ho.q>0?ho.q:0;
  const unitTxt=A.cat==='stock'?'par action':A.cat==='crypto'?'par unité':'par '+A.unit;
  let h=card(`${A.ic} ${A.cat==='stock'?A.sec+' · '+A.id:CATN[A.cat]}`,pxF(p),`${unitTxt} · ${pctF(y1)} sur un an${y5!=null?` · ${pctF(y5)} sur cinq ans`:''}`,
    spark(hs,300,64)+`<div class="cs">Plus haut sur ${An(hs.length)} : ${esc(pxF(hi))} · plus bas : ${esc(pxF(lo))}<br>Volatilité ${volLab(A.v)} (${Math.round(A.v*100)} % par an)${A.dy?` · dividende ${pcF(A.dy)} par an`:''} · frais ${pcF(f)} par ordre</div>`);
  if(q>0){const v=q*p,lt=v-ho.c;h+=card('Ta position',qtyLab(A,q),`Valeur ${fmt(v)} · prix de revient ${pxF(ho.c/q)} · ${lt>=0?'plus-value':'moins-value'} latente de ${fmt(Math.abs(lt))} (${pctF(ho.c>0?lt/ho.c:0)})${A.dy?` · dividende attendu : ${fmt(v*A.dy)} par an`:''}`,'')}
  if(A.desc)h+=note(A.desc);
  if(L.age<18)return {title:A.n,html:h+note('Il faut avoir 18 ans pour passer des ordres.')};
  if(L.prison)return {title:A.n,html:h+note('Impossible de passer des ordres depuis ta cellule.')};
  const qs=(A.frac&&p>=500?[.1]:[]).concat([1,10,100]);
  const B=qs.map(n=>{const cost=Math.max(1,Math.round(n*p*(1+f)));return act(L,{ic:'🟢',t:`Acheter ${qtyLab(A,n)}`,s:`${fmt(cost)} frais compris`,cost,fn:L=>out(L,buyQ(L,id,n,cost))})});
  for(const amt of [1000,10000,100000]){
    const n=A.frac?r6(amt/(p*(1+f))):Math.floor(amt/(p*(1+f)));const cost=n>0?Math.max(1,Math.round(n*p*(1+f))):amt;
    B.push(act(L,{ic:'💶',t:`Investir ${fmt(amt)}`,s:n>0?`Soit ${qtyLab(A,n)}`:'',dis:n>0?'':`Une action coûte ${pxF(p)}`,cost,fn:L=>out(L,buyQ(L,id,n,cost))}));
  }
  h+=group('Acheter',B);
  h+=`<div class="card"><label class="f">Montant libre (€)<input id="inv-amt" type="number" min="0" step="100" inputmode="numeric" placeholder="Par exemple 2 500" autocomplete="off"></label></div>`;
  const readAmt=()=>{const el=document.getElementById('inv-amt');const v=el?Math.round(+String(el.value).replace(/\s/g,'').replace(',','.')):0;return v>0&&isFinite(v)?v:0};
  h+=group('',[
    row({ic:'✍️',t:'Acheter pour ce montant',s:'Saisis un montant ci-dessus',a:()=>{const v=readAmt();if(!v){toast('Indique un montant en euros.');return}if(v>L.money){toast('Fonds insuffisants.');return}run(()=>{const [ok,t]=buyAmt(L,id,v);return ok?out(L,t):t})}}),
    row({ic:'✍️',t:'Vendre pour ce montant',s:q>0?'Dans la limite de ta position':'Aucune position',dis:!(q>0),a:()=>{const v=readAmt();if(!v){toast('Indique un montant en euros.');return}run(()=>out(L,sellAmt(L,id,v)))}})]);
  const S=qs.map(n=>act(L,{ic:'🔴',t:`Vendre ${qtyLab(A,n)}`,s:`Environ ${fmt(n*p*(1-f))} encaissés`,dis:q+EPS<n?'Position insuffisante':'',fn:L=>out(L,sellQ(L,id,n))}));
  for(const amt of [1000,10000])S.push(act(L,{ic:'💶',t:`Vendre pour ${fmt(amt)}`,dis:q*p*(1-f)<amt?'Position insuffisante':'',fn:L=>out(L,sellAmt(L,id,amt))}));
  S.push(act(L,{ic:'🧺',t:'Tout vendre',s:q>0?`Environ ${fmt(q*p*(1-f))} encaissés`:'',dis:q>0?'':'Aucune position',danger:1,fn:L=>out(L,sellQ(L,id,q))}));
  h+=group('Vendre',S);
  h+=group('Parier sur la baisse',[1000,10000].map(amt=>act(L,{ic:'🎯',t:`Turbo baissier de ${fmt(amt)}`,s:'Dénoué dans un an : jusqu’à ×2 si le cours s’effondre, perdu s’il double',cost:amt,fn:L=>out(L,openTurbo(L,id,amt))})));
  return {title:A.n,html:h};
};
function pBonds(){
  const L=cur(),M=mkGet(),I=invSt(L);
  let h=card('Taux de référence',`OAT 10 ans : ${pcF(M.oat)}`,'Une obligation verse un coupon chaque année et rembourse son nominal à l’échéance. Les entreprises paient davantage… parce qu’elles peuvent faire défaut.','');
  if(I.b.length)h+=group('Mes obligations',I.b.map(b=>row({ic:b.oat?'🇫🇷':'📜',t:b.n,s:`${fmt(b.f)} à ${pcF(b.r)} · ${b.m<=1?'échéance l’an prochain':'échéance dans '+An(b.m)}${b.oat?'':' · note '+b.rt}`,right:'›',a:()=>pushPanel(pBond(b.id))})));
  else h+=note('Tu ne détiens aucune obligation pour l’instant.');
  if(L.age<18||L.prison)return {title:'Obligations',html:h};
  h+=group('Émissions de l’année',[oatOffer(M)].concat(M.corp).map(o=>row({ic:o.oat?'🇫🇷':'🏭',t:o.oat?o.n:`Obligation ${o.n}`,s:`${pcF(o.r)} par an · ${An(o.m)} · ${o.oat?'garantie par l’État':'note '+o.rt+' · risque '+riskLab(o.risk)}`,right:'›',a:()=>pushPanel(pOffer(o.k))})));
  return {title:'Obligations',html:h};
}
const pOffer=k=>()=>{
  const L=cur(),M=mkGet();const o=[oatOffer(M)].concat(M.corp).find(x=>x.k===k);
  if(!o)return {title:'Émission',html:note('Cette émission est close. De nouvelles offres arrivent chaque année.')};
  const cp=Math.round(10000*o.r);
  let h=card(o.oat?'Dette de l’État français':`Note de crédit : ${o.rt}`,pcF(o.r)+' par an',`${o.oat?'OAT 10 ans':'Obligation '+o.n} · échéance dans ${An(o.m)} · coupon de ${fmt(cp)} par an pour 10 000 € placés`,
    `<div class="cs">${o.oat?'Risque de défaut quasi nul. Revendable à tout moment, à un prix qui dépend des taux.':`Risque de défaut ${riskLab(o.risk)} (environ ${pcF(o.risk).replace(',00','')} par an). En cas de faillite, tu ne récupères qu’une partie du nominal.${o.iss&&DEF[o.iss]?` Émetteur coté : ${esc(DEF[o.iss].n)}.`:''}`}</div>`);
  if(L.prison)return {title:o.oat?o.n:o.n,html:h+note('Impossible de souscrire depuis ta cellule.')};
  h+=group('Souscrire',[1000,10000,100000,1000000].map(amt=>act(L,{ic:'📜',t:`Placer ${fmt(amt)}`,s:`Coupon annuel : ${fmt(amt*o.r)}`,cost:amt,fn:L=>out(L,buyBond(L,o,amt))})));
  return {title:o.oat?'OAT 10 ans':o.n,html:h};
};
const pBond=id=>()=>{
  const L=cur(),M=mkGet(),I=invSt(L);const b=I.b.find(x=>x.id===id);
  if(!b)return {title:'Obligation',html:note('Cette obligation n’est plus dans ton portefeuille.')};
  const v=Math.round(b.f*bondPx(b,M));
  let h=card(b.oat?'Obligation d’État':`Obligation d’entreprise · note ${b.rt}`,fmt(b.f),`${pcF(b.r)} par an · coupon de ${fmt(b.f*b.r)} · ${b.m<=1?'remboursement l’an prochain':'remboursement dans '+An(b.m)}`,`<div class="cs">Valeur de revente aujourd’hui : ${esc(fmt(v))}${b.oat?'':` · risque de défaut ${riskLab(b.risk)}`}</div>`);
  if(L.prison)return {title:b.n,html:h+note('Impossible de revendre depuis ta cellule.')};
  h+=group('',[row({ic:'💶',t:'Revendre sur le marché secondaire',s:`Tu toucherais ${fmt(v)}`,danger:1,a:()=>pushPanel(confirmP('Revendre cette obligation ?',`Tu toucheras ${fmt(v)} au lieu d’attendre le remboursement de ${fmt(b.f)} à l’échéance.`,()=>{const t=sellBond(L,id);STACK.pop();return out(L,t)},'Revendre'))})]);
  return {title:b.n,html:h};
};
function pAdvisor(){
  const L=cur(),I=invSt(L);const W=netWorth(L);
  let h=card('Conseil en investissement',I.tipN?`${I.tipOk} tuyau${I.tipOk>1?'x':''} juste${I.tipOk>1?'s':''} sur ${I.tipN}`:'Aucun tuyau reçu','Un conseil par an. Plus on paie, plus c’est fiable… en théorie.','');
  if(I.tip&&DEF[I.tip.a])h+=note(`Tuyau en cours : ${DEF[I.tip.a].n} ${I.tip.dir>0?'à l’achat':'à la vente'}, de la part de ${I.tip.wn}. Verdict l’an prochain.`);
  else if(I.lastTip&&DEF[I.lastTip.a])h+=note(`Dernier tuyau : ${DEF[I.lastTip.a].n}, ${I.lastTip.good?'bien vu':'raté'} (${pctF(I.lastTip.ret)} sur un an).`);
  h+=group('Demander conseil',ADV.map(a=>act(L,{ic:a.ic,t:a.n,s:a.s,cost:a.cost,key:'inv_tip',danger:a.ins?1:0,dis:L.prison?'En prison':L.age<18?'Dès 18 ans':a.minW&&W<a.minW?'Patrimoine de 250 000 € minimum':'',fn:L=>askTip(L,a)})));
  if(I.ins)h+=note('🤫 Tu as profité d’une information privilégiée. Espérons que personne ne fasse le rapprochement…');
  return {title:'Conseiller financier',html:h};
}
function pNews(){
  const M=mkGet();const items=M.news.slice().reverse();
  return {title:'Journal financier',html:note('Les gros titres des dernières années. Les rumeurs, elles, tombent sans prévenir.')+
    (items.length?`<div class="list">${items.map(n=>`<div class="row"><span class="ic">${esc(n.ic||'📰')}</span><span class="rt"><b>${esc(n.t)}</b><small>${esc(ago(M.y-n.y))}</small></span></div>`).join('')}</div>`:note('Aucune nouvelle pour l’instant.'))};
}
function corrTable(M){
  const groups=[['Actions',STOCK_L],['Crypto',LIST.filter(A=>A.cat==='crypto')],['Mat. prem.',LIST.filter(A=>A.cat==='com'&&A.id!=='XAU')],['Or',LIST.filter(A=>A.id==='XAU')]].filter(g=>g[1].length);
  const n=Math.min(...LIST.map(A=>M.a[A.id].h.length))-1;if(n<4||groups.length<2)return '';
  const ser=groups.map(([,as])=>{const r=[];for(let i=0;i<n;i++){let s=0;for(const A of as){const h=M.a[A.id].h,k=h.length-n-1+i;s+=Math.log(h[k+1]/h[k])}r.push(s/as.length)}return r});
  const avg=x=>x.reduce((s,v)=>s+v,0)/x.length;
  const cor=(x,y)=>{const mx=avg(x),my=avg(y);let a=0,b=0,c=0;for(let i=0;i<x.length;i++){a+=(x[i]-mx)*(y[i]-my);b+=(x[i]-mx)**2;c+=(y[i]-my)**2}return b&&c?a/Math.sqrt(b*c):0};
  const cell=v=>`<td style="padding:6px 2px;border-radius:6px;background:color-mix(in srgb,var(${v>=0?'--good':'--bad'}) ${Math.round(Math.abs(v)*55)}%,transparent);font-family:var(--mono)">${v.toFixed(2).replace('.',',').replace('-','−')}</td>`;
  return `<div class="card"><div class="ck">Corrélations sur ${An(n)}</div><table style="width:100%;border-collapse:separate;border-spacing:3px;font-size:12px;text-align:center"><tr><th></th>${groups.map(g=>`<th style="font-weight:600;color:var(--muted)">${esc(g[0])}</th>`).join('')}</tr>${groups.map((g,i)=>`<tr><th style="text-align:left;font-weight:600;color:var(--muted)">${esc(g[0])}</th>${groups.map((_,j)=>cell(i===j?1:cor(ser[i],ser[j]))).join('')}</tr>`).join('')}</table><div class="cs">Proche de 1 : ces actifs montent et baissent ensemble. Négatif : l’un compense l’autre.</div></div>`;
}
function pVol(){
  const M=mkGet();
  let h=note('σ : amplitude typique des variations annuelles. β : sensibilité aux mouvements du marché (négatif : valeur refuge). Les actions d’un même secteur bougent ensemble, les crypto-monnaies suivent leur propre humeur.');
  h+=corrTable(M);
  for(const cat of ['stock','crypto','com'])h+=group(CATN[cat],LIST.filter(A=>A.cat===cat).map(A=>row({ic:A.ic,t:A.n,s:`σ ${Math.round(A.v*100)} % (${volLab(A.v)}) · β ${A.beta.toFixed(2).replace('.',',').replace('-','−')}${A.dy?` · dividende ${pcF(A.dy)}`:''}`,
    right:`<span class="bar" style="width:64px"><i style="width:${lim(A.v*70,4,100)}%;background:var(${A.v<.3?'--good':A.v<.6?'--warn':'--bad'})"></i></span>`,a:()=>pushPanel(pAsset(A.id))})));
  return {title:'Matrice de volatilité',html:h};
}

/* ================= Bilan annuel d’une vie ================= */
function invYear(L){
  const I0=L.inv;if(!I0||typeof I0!=='object')return;
  const I=invSt(L),M=mkGet();if(!M)return;
  const lines=[];
  // Flat tax sur les plus-values réalisées l’an passé (moins-values reportables)
  {const net=I.ry+I.carry;if(net>0){const tax=Math.round(net*.3);if(tax>0){spend(L,tax);lines.push(`🧾 Flat tax de 30 % sur tes plus-values de l’an dernier : ${fmt(tax)}.`)}I.carry=0}else I.carry=Math.max(-1e9,Math.round(net));I.ry=0}
  // Dividendes
  let div=0;for(const id in I.h){const A=DEF[id],h=I.h[id];if(A&&A.dy&&h.q>0)div+=h.q*priceOf(id)*A.dy}
  div=Math.round(div);I.divY=div>0?div:0;if(div>0){earn(L,div);I.div+=div}
  // Obligations : défauts, coupons, échéances
  let cp=0;
  for(const b of I.b.slice()){
    let pd=b.oat?0:(b.risk||0);const ia=b.iss&&M.a[b.iss];if(ia&&ia.prev>0&&ia.p/ia.prev<.65)pd+=.12;
    if(pd>0&&chance(pd)){const rec=R(15,45)/100,back=Math.round(b.f*rec),loss=b.f-back;L.money+=back;I.real-=loss;I.ry-=loss;I.b=I.b.filter(x=>x!==b);track(L,'bondDefaults');chg(L,{happy:-4});
      lines.push(`💥 Défaut de paiement : ${b.n} ne rembourse que ${Math.round(rec*100)} % de ton obligation (${fmt(back)} récupérés sur ${fmt(b.f)}).`);continue}
    cp+=Math.round(b.f*b.r);b.m--;
    if(b.m<=0){L.money+=b.f;I.b=I.b.filter(x=>x!==b);lines.push(`✅ Ton obligation ${b.n} arrive à échéance : ${fmt(b.f)} te sont remboursés.`)}
  }
  I.cpY=cp;if(cp>0)earn(L,cp);
  if(div>0||cp>0)lines.push(`💶 Revenus de placement : ${[div>0?fmt(div)+' de dividendes':'',cp>0?fmt(cp)+' de coupons':''].filter(Boolean).join(' et ')}.`);
  // Turbos et produits structurés
  for(const t of I.tb.slice()){
    if(!(M.y>t.y))continue;const A=DEF[t.a];let pay,msg;
    if(t.k==='struct'){const u=Math.random();pay=u<.55?Math.round(t.s*1.08):u<.85?t.s:Math.round(t.s*R(55,75)/100);
      msg=pay>t.s?`🏦 Ton produit structuré « Autocall Sérénité Plus » se déclenche : ${fmt(pay)} remboursés, coupon compris.`:pay===t.s?`🏦 Ton produit structuré te rend ta mise, ${fmt(pay)}, sans le moindre coupon. Sérénité, en effet.`:`🏦 La barrière de ton produit structuré est franchie : tu ne récupères que ${fmt(pay)} sur ${fmt(t.s)}. Les « conditions » étaient en petits caractères.`}
    else{const ret=priceOf(t.a)/t.p0-1;pay=Math.round(t.s*Math.max(0,1-ret));
      msg=pay<=0?`🎯 Ton turbo baissier sur ${A.n} est désactivé : le cours a doublé, ta mise de ${fmt(t.s)} s’envole.`:pay>t.s?`🎯 Ton pari sur la baisse de ${A.n} paie : ${fmt(pay)} encaissés pour ${fmt(t.s)} misés (cours ${pctF(ret)}).`:`🎯 Raté : ${A.n} n’a pas baissé (${pctF(ret)}). Ton turbo ne te rend que ${fmt(pay)} sur ${fmt(t.s)}.`}
    L.money+=pay;const g=pay-t.s;I.real+=g;I.ry+=g;if(g>0)track(L,'stockGains',g);I.tb=I.tb.filter(x=>x!==t);lines.push(msg);
  }
  // Rumeurs du journal financier
  for(const b of I.bets.slice()){
    if(!(M.y>b.y))continue;I.bets=I.bets.filter(x=>x!==b);const A=DEF[b.a];if(!A)continue;
    const ret=priceOf(b.a)/b.p0-1,lab=b.lab||A.n;let t='';
    if(b.d==='buy')t=ret>.03?`ton flair a payé, ${A.n} prend ${pctF(ret)}.`:ret<-.03?`aïe, ${A.n} recule de ${pctA(ret)}.`:`${A.n} n’a presque pas bougé (${pctF(ret)}).`;
    else if(b.d==='sell'||b.d==='short')t=ret<-.03?`bien vu, ${A.n} chute de ${pctA(ret)}.`:ret>.03?`dommage, ${A.n} prend ${pctF(ret)} après ta décision.`:`${A.n} fait du surplace (${pctF(ret)}).`;
    else t=ret>.12?`${A.n} s’envole de ${pctF(ret)}. Tu as regardé passer le train.`:ret<-.12?`${A.n} plonge de ${pctA(ret)}. Tu as bien fait de rester à l’écart.`:'';
    if(t)lines.push(`📰 ${lab} : ${t}`);
  }
  // Verdict du tuyau
  if(I.tip&&M.y>I.tip.y){const t=I.tip;I.tip=null;const A=DEF[t.a];if(A){const ret=priceOf(t.a)/t.p0-1,good=ret*t.dir>0;if(good)I.tipOk++;I.lastTip={a:t.a,dir:t.dir,ret,good,wn:t.wn};lines.push(`💼 Le tuyau de ${t.wn} sur ${A.n} ${good?'était le bon':'tombe à plat'} : ${pctF(ret)} sur un an.`)}}
  // Performance de l’année
  if(M.y>I.seen){
    let v0=0,v1=0,st=0,cr=0;
    for(const id in I.h){const A=DEF[id],a=M.a[id],h=I.h[id];if(!A||!a||!(h.q>0))continue;const prev=a.h.length>1?a.h[a.h.length-2]:a.p;v0+=h.q*prev;v1+=h.q*a.p;if(A.cat==='stock')st+=h.q*a.p;if(A.cat==='crypto')cr+=h.q*a.p}
    if(v0>0){
      const ret=v1/v0-1;I.lastRet=ret;
      const head=ret>.3?'🚀 Année exceptionnelle en Bourse':ret>.08?'📈 Belle année en Bourse':ret>-.08?'📊 Année calme en Bourse':ret>-.3?'📉 Année difficile en Bourse':'💥 Année noire en Bourse';
      lines.push(`${head} : tes placements ${ret>=0?'prennent '+pctF(ret):'perdent '+pctA(ret)}. Ton portefeuille vaut ${fmtk(v1)}.`);
      const ls=M.last;if(ls&&ls.y===M.y){if(ls.reg==='krach'&&st>0)lines.push(`📉 Krach boursier : l’indice HX12 perd ${pctA(ls.ixr)} sur l’année.`);if(ls.creg==='hiver'&&cr>0)lines.push('🥶 Hiver crypto : tes jetons ont pris un coup de froid.');if(ls.creg==='folie'&&cr>0)lines.push('🚀 Folie crypto : tes jetons s’envolent, ton entourage te demande des conseils.')}
    }else I.lastRet=0;
    I.seen=M.y;
  }
  const tot=invTotal(L);
  if(tot>0||I.vh.length)I.vh=I.vh.concat(Math.round(tot)).slice(-15);
  if(tot>0)trackMax(L,'portfolioMax',Math.round(tot));
  for(const l of lines)say(L,l);
}

/* ================= Évènements dynamiques ================= */
function biggest(L,cat){const I=L.inv;let best=null,bv=0;for(const id in I.h){const A=DEF[id],h=I.h[id];if(!A||(cat&&A.cat!==cat)||!(h.q>0))continue;const v=h.q*priceOf(id);if(v>bv){bv=v;best=id}}return best}
function loseAll(L,id){const I=invSt(L),h=I.h[id];if(!h)return 0;const c=Math.round(h.c||0);I.real-=c;delete I.h[id];return c}
function invEvents(L){
  if(!L||!L.alive||L.age<18||L.prison||!G||!L.inv)return 0;
  const I=invSt(L),M=mkGet();if(!M)return 0;
  if(I.ins&&M.y>I.ins.y){
    const ins=I.ins;I.ins=null;
    if(chance(.4)){
      const A=DEF[ins.a];const fine=Math.max(15000,Math.round((ins.amt||0)*.5));
      modal({title:'Autorité des marchés financiers',icon:'🕵️',text:`Des enquêteurs du gendarme de la Bourse s’intéressent à tes achats de ${A?A.n:'titres'} juste avant une annonce majeure. Coïncidence ? Ils n’y croient pas une seconde.`,choices:[
        {t:`Coopérer et transiger (${fmt(fine)})`,fn:()=>{spend(L,fine);chg(L,{happy:-6,karma:2});return out(L,`Tu signes une transaction avec le gendarme de la Bourse : ${fmt(fine)} d’amende et la promesse de ne plus recommencer.`)}},
        {t:'Nier en bloc',fn:()=>{if(chance(.35)){chg(L,{stress:6});return out(L,'Faute de preuves, l’enquête est classée sans suite. Tu as eu chaud.')}
          if(typeof trial==='function'){trial(L,{n:'Délit d’initié',jail:[0,3],fine,lawyer:Math.max(25000,Math.round(fine*.6))});return out(L,'L’affaire est renvoyée devant le tribunal correctionnel.')}
          spend(L,fine*2);return out(L,`Les enquêteurs ont tout reconstitué : ${fmt(fine*2)} d’amende.`)}},
        {t:'Rejeter la faute sur ton ami',fn:()=>{chg(L,{karma:-8});if(chance(.5))return out(L,'Ton ami prend tout. Tu t’en sors… et tu perds un ami.');spend(L,Math.round(fine*1.5));return out(L,`Ton ami a gardé tous vos messages. Amende alourdie : ${fmt(fine*1.5)}.`)}}]});
      return 1;
    }
  }
  const V=holdVal(L);
  if(I.panicY!==M.y&&I.lastRet<=-.22&&V.stock+V.crypto>=5000&&chance(.55)){
    I.panicY=M.y;
    modal({title:'Panique à bord',icon:'😱',text:`Ton portefeuille a fondu de ${pctA(I.lastRet)} cette année. Ton application de Bourse est devenue rouge vif. Que fais-tu ?`,choices:[
      {t:'Tout vendre dans la panique',fn:()=>{const t=[sellCat(L,'stock'),sellCat(L,'crypto')].filter(Boolean).join(' ');chg(L,{happy:-3,stress:-6});return out(L,t||'Il n’y avait plus rien à vendre.')}},
      {t:'Tenir bon : on ne vend pas au plus bas',fn:()=>{chg(L,{willpower:3,stress:4});return out(L,'Tu désinstalles l’appli de Bourse et tu pars marcher en forêt. Le long terme, c’est le long terme.')}},
      {t:'Renforcer à la baisse (10 % de tes liquidités)',fn:()=>{const id=biggest(L,'stock')||biggest(L,'crypto');const amt=Math.round(Math.max(0,L.money)*.1);if(!id||amt<300)return out(L,'Tu n’as pas assez de liquidités pour renforcer.');const [ok,t]=buyAmt(L,id,amt);chg(L,{stress:3});return ok?out(L,t):t}}]});
    return 1;
  }
  if(V.stock>=1000&&chance(.06)){
    const A=DEF[biggest(L,'stock')];if(A){
      modal({title:`Assemblée générale · ${A.n}`,icon:'🎤',text:`En tant qu’actionnaire, tu es convié${ge(L,'','e')} à l’assemblée générale annuelle de ${A.n}, dans les salons d’un grand hôtel parisien. Le PDG s’apprête à présenter « une année pleine de défis ».`,choices:[
        {t:'Interpeller le PDG sur sa rémunération',fn:()=>{chg(L,{karma:3});if(chance(.5)){chg(L,{fame:1,happy:4});return out(L,'La salle t’applaudit, le PDG transpire. Une vidéo de ton intervention circule.')}return out(L,'Ton micro est coupé au bout de dix secondes. Démocratie actionnariale.')}},
        {t:'Foncer au buffet',fn:()=>{chg(L,{happy:4,health:-1});return out(L,'Petits fours, champagne et macarons : ton dividende en nature.')}},
        {t:'Voter toutes les résolutions sans les lire',fn:()=>out(L,'Comme 98 % des actionnaires. Tu repars avec un stylo siglé.')},
        {t:'Rester chez toi',fn:()=>'Tu suis l’assemblée en direct sur internet, en pyjama.'}]});
      return 1;
    }
  }
  if(V.crypto>=2000&&chance(.035)){
    const id=biggest(L,'crypto'),A=DEF[id];if(A){
      modal({title:'Phrase secrète égarée',icon:'🔐',text:`Impossible de remettre la main sur la phrase secrète de ton portefeuille de ${A.n}. Douze mots, quelque part, sur un bout de papier…`,choices:[
        {t:'Fouiller tes vieux carnets',fn:()=>{if(chance(.55))return out(L,'Victoire : elle était au dos d’une facture de pizza, dans un tiroir de la cuisine.');const c=loseAll(L,id);chg(L,{happy:-10});return out(L,`Rien. Tes ${A.n} sont perdus à jamais (${fmt(c)} investis).`)}},
        {t:`Payer un spécialiste de la récupération (${fmt(3000)})`,fn:()=>{if(L.money<3000)return 'Fonds insuffisants.';spend(L,3000);if(chance(.85))return out(L,'Le spécialiste retrouve l’accès en deux jours. Tu imprimes la phrase en trois exemplaires.');const c=loseAll(L,id);chg(L,{happy:-10});return out(L,`Même le spécialiste abandonne. Tes ${A.n} sont perdus (${fmt(c)} investis).`)}},
        {t:'Laisser tomber',fn:()=>{const c=loseAll(L,id);chg(L,{happy:-8});return out(L,`Tu fais une croix sur tes ${A.n} (${fmt(c)} investis). Dur.`)}}]});
      return 1;
    }
  }
  return 0;
}

/* ================= Effets et conditions pour les évènements JSON ================= */
const effects={
  trade(L,a){
    a=a||{};if(!L||L.age<18)return '';const M=mkGet();if(!M)return '';const I=invSt(L);
    biasFrom(M,a);
    const res=[];if(a.msg)res.push(a.msg);
    const money=Math.max(0,L.money);const amtOf=d=>a.amt?Math.min(a.amt,money):Math.round(money*(a.pct||d)/100);
    const p0=DEF[a.a]?priceOf(a.a):0;
    switch(a.do){
      case 'buy':{if(!DEF[a.a])break;const amt=amtOf(10);if(amt<300){res.push('Tes liquidités sont trop maigres pour suivre le mouvement.');break}res.push(buyAmt(L,a.a,amt,a.prem)[1]);break}
      case 'sell':{const h=I.h[a.a];res.push(h&&h.q>0?sellQ(L,a.a,h.q):'Tu n’en détiens pas.');break}
      case 'opa':{const h=I.h[a.a];res.push(h&&h.q>0?sellQ(L,a.a,h.q,a.prem||25):'Tu n’en détiens pas.');break}
      case 'sellCat':{res.push(sellCat(L,a.cat)||'Il n’y avait rien à vendre.');break}
      case 'short':{if(!DEF[a.a])break;const amt=amtOf(5);if(amt<300){res.push('Tes liquidités sont trop maigres pour parier.');break}L.money-=amt;res.push(openTurbo(L,a.a,amt));break}
      case 'oat':{const amt=amtOf(10);if(amt<1000){res.push('Pas assez de liquidités pour souscrire des OAT.');break}L.money-=amt;res.push(buyBond(L,oatOffer(M),amt));break}
      case 'ico':{const amt=a.amt||2000,tok=a.tok||'le jeton';if(L.money<amt){res.push('Tu n’as pas les fonds nécessaires.');break}L.money-=amt;
        if(chance(a.p2||.12)){const g=Math.round(amt*(a.mult||5)),gain=g-amt;L.money+=g;I.real+=gain;I.ry+=gain;track(L,'stockGains',gain);res.push(`Contre toute attente, ${tok} s’envole et tu revends tout pour ${fmt(g)} !`)}
        else{I.real-=amt;res.push(`Trois semaines plus tard, le site affiche « Erreur 404 ». Tes ${fmt(amt)} sont partis avec ${tok}.`)}break}
      case 'struct':{const amt=a.amt||10000;if(L.money<amt){res.push('Tu n’as pas les fonds nécessaires.');break}const ref=DEF.BQHX?'BQHX':STOCK_L[0]&&STOCK_L[0].id;if(!ref)break;L.money-=amt;I.tb.push({id:nid(),a:ref,s:amt,p0:priceOf(ref),y:M.y,k:'struct'});I.n++;res.push(`Tu souscris ${fmt(amt)} d’Autocall Sérénité Plus. Verdict dans un an.`);break}
    }
    const d=a.do||'none';
    if(DEF[a.a]&&p0>0&&['buy','sell','short','none'].includes(d))I.bets=I.bets.filter(b=>!(b.a===a.a&&b.y===M.y)).concat({a:a.a,p0,y:M.y,d,lab:a.lab||''}).slice(-8);
    return res.filter(Boolean).join(' ');
  }
};
const conds={
  canPlay(L,a){a=a||{};if(!L||L.age<18||L.prison)return false;const min=a.min||5000;return L.money>=min||invTotal(L)>=min/2},
  holds(L,a){const I=L&&L.inv;const h=I&&I.h&&a&&I.h[a.a];return !!(h&&h.q>0)},
  holdsCat(L,a){const I=L&&L.inv;if(!I||!I.h)return false;for(const id in I.h){const A=DEF[id],h=I.h[id];if(A&&h&&A.cat===(a&&a.cat)&&h.q>0)return true}return false}
};

/* ================= Journal financier : évènements JSON ================= */
const CND=(min,x)=>Object.assign({min_age:18,in_prison:false,mod_cond:{mod:MOD,fn:'canPlay',args:{min:min||5000}}},x||{});
const HOLD=a=>({mod_cond:{mod:MOD,fn:'holds',args:{a}}});
const HOLDC=cat=>({mod_cond:{mod:MOD,fn:'holdsCat',args:{cat}}});
function NEWS(id,o){
  const e={id:'investor_'+id,category:'finance',icon:o.ic||'📰',probability_weight:o.w||.08,conditions:CND(o.min,o.cond),prompt_text:o.t,
    choices:o.c.map(c=>{
      const args=Object.assign({},o.x||{},c.x||{},{do:c.d||'none'});if(c.m)args.msg=c.m;
      const ch={choice_text:c.t,consequences:Object.assign({},c.q||{},{mod_effect:{mod:MOD,fn:'trade',args}})};
      const cond=c.cond||((args.do==='sell'||args.do==='opa'||c.hold)?HOLD(args.a):args.do==='sellCat'?HOLDC(args.cat):null);
      if(cond)ch.conditions=cond;return ch})};
  if(o.once)e.once=true;
  return e;
}
const STOCK_IDS=STOCK_L.map(A=>A.id);
const eventsDb=[
  NEWS('fusion_pixelia',{t:'📰 Les Échos de la Bourse : « Rumeur de fusion chez Pixelia. » Un géant américain du logiciel serait prêt à racheter le champion français du cloud. Rien n’est confirmé, mais les forums d’investisseurs ne parlent que de ça.',
    x:{a:'PIXL',p:.55,b:[15,35],f:[-14,-4],lab:'Rumeur de fusion chez Pixelia'},
    c:[{t:'Acheter des actions Pixelia avant la hausse',d:'buy',x:{pct:10},m:'Tu passes ton ordre avant tout le monde. Enfin, tu crois.',q:{stress_level_increment:3}},
       {t:'Faire tapis : 25 % de tes liquidités',d:'buy',x:{pct:25},m:'La fortune sourit aux audacieux, paraît-il.',q:{stress_level_increment:8}},
       {t:'Vendre tes Pixelia : trop beau pour être vrai',d:'sell'},
       {t:'Ignorer la rumeur',d:'none',m:'Tu as mieux à faire que d’écouter les bruits de couloir.'}]}),
  NEWS('scandale_hexagone',{ic:'🚨',t:'📺 BFN Business, édition spéciale : des enquêteurs perquisitionnent le siège de Banque Hexagone. On parle de comptes « légèrement arrangés ». La direction dément… mollement.',
    x:{a:'BQHX',p:.7,b:[-45,-18],f:[2,10],lab:'Scandale comptable chez Banque Hexagone'},
    c:[{t:'Vendre tes actions Banque Hexagone sur-le-champ',d:'sell',m:'Tu cliques sur « vendre » avant même la fin du reportage.'},
       {t:'Parier sur la baisse (turbo, 5 % de tes liquidités)',d:'short',x:{pct:5},q:{stress_level_increment:4}},
       {t:'Acheter : on achète au son du canon',d:'buy',x:{pct:10},m:'Tu achètes pendant que tout le monde vend. Courageux, ou inconscient.'},
       {t:'Changer de chaîne',d:'none',m:'Tu tombes sur un documentaire animalier. Bien plus reposant.'}]}),
  NEWS('gisement_volteo',{ic:'⛽',t:'📰 La Tribune Boursière : Voltéo aurait découvert un gisement de gaz géant au large de la Guyane. Les géologues parlent de « la découverte de la décennie ». Les géologues disent souvent ça.',
    x:{a:'VOLT',p:.6,b:[18,45],f:[-12,-2],lab:'Le gisement de Voltéo'},
    c:[{t:'Acheter des actions Voltéo',d:'buy',x:{pct:10},m:'Tu mises sur les profondeurs de l’Atlantique.'},
       {t:'Vendre tes Voltéo, l’annonce est déjà dans les cours',d:'sell'},
       {t:'Attendre la confirmation officielle',d:'none',m:'La prudence est mère de la sûreté, comme dit ta grand-mère.'}]}),
  NEWS('regulation_crypto',{ic:'🏛️',t:'📰 Le Journal des Finances : Bruxelles préparerait une régulation très stricte des crypto-monnaies. Identité obligatoire, plateformes contrôlées, fin des jetons farfelus. Les forums crypto crient au complot.',
    x:{ids:['BPC','ETH','CHAT'],a:'BPC',p:.65,b:[-40,-15],f:[8,30],lab:'Le projet de régulation des crypto-monnaies'},
    c:[{t:'Liquider toutes tes crypto-monnaies',d:'sellCat',x:{cat:'crypto'},m:'Tu reviens sagement à l’euro.'},
       {t:'Acheter de la BitPièce : « la régulation, c’est l’adoption ! »',d:'buy',x:{pct:8}},
       {t:'Parier sur la baisse de la BitPièce (5 %)',d:'short',x:{pct:5}},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('chatcoin_milliardaire',{ic:'🐱',t:'📱 Un milliardaire excentrique publie la photo d’un chat à lunettes de soleil, avec un seul mot : « ChatCoin ». Les forums s’embrasent, ton cousin t’envoie quatorze messages.',
    x:{a:'CHAT',p:.5,b:[80,300],f:[-60,-30],lab:'Le message du milliardaire sur ChatCoin'},
    c:[{t:'Acheter du ChatCoin, direction la Lune !',d:'buy',x:{pct:5},q:{stress_level_increment:5,happiness_modifier:2}},
       {t:'Juste un peu, pour rigoler (1 %)',d:'buy',x:{pct:1},m:'Une petite folie, pour l’anecdote.'},
       {t:'Vendre tes ChatCoin à ceux qui y croient',d:'sell'},
       {t:'Rire et ranger ton téléphone',d:'none',q:{happiness_modifier:1}}]}),
  NEWS('biogene_phase3',{ic:'🧪',t:'📰 Le Petit Boursier : Biogène publiera demain les résultats de phase III de son traitement contre la calvitie. Des millions de crânes dégarnis retiennent leur souffle.',
    x:{a:'BIOG',p:.5,b:[30,80],f:[-50,-25],lab:'Les résultats cliniques de Biogène'},
    c:[{t:'Acheter des actions Biogène',d:'buy',x:{pct:10},q:{stress_level_increment:4}},
       {t:'Parier contre Biogène (turbo, 5 %)',d:'short',x:{pct:5}},
       {t:'Vendre tes Biogène avant le verdict',d:'sell'},
       {t:'Laisser les biologistes travailler',d:'none'}]}),
  NEWS('cosmonix_atterrissage',{ic:'🚀',t:'📺 BFN Business en direct : Cosmonix tente ce soir de faire atterrir son lanceur réutilisable sur une barge au large de Kourou. Toute la salle de marché a sorti le pop-corn.',
    x:{a:'COSM',p:.5,b:[25,60],f:[-40,-15],lab:'L’atterrissage de Cosmonix'},
    c:[{t:'Acheter avant le décollage',d:'buy',x:{pct:10},q:{stress_level_increment:4}},
       {t:'Parier sur un plat (turbo, 5 %)',d:'short',x:{pct:5}},
       {t:'Vendre tes Cosmonix avant le direct',d:'sell'},
       {t:'Regarder sans parier',d:'none',q:{happiness_modifier:2},m:'Tu regardes le direct en mangeant des chips. Quel spectacle !'}]}),
  NEWS('ludiverse_report',{ic:'🎮',t:'🎙️ Radio Patrimoine : Ludiverse repousserait encore la sortie de « Chevaliers de Brocéliande », attendu depuis six ans. Un stagiaire aurait renversé du café sur le serveur.',
    x:{a:'LUDI',p:.6,b:[-28,-10],f:[5,18],lab:'Le report du jeu de Ludiverse'},
    c:[{t:'Vendre tes Ludiverse',d:'sell'},
       {t:'Parier sur la baisse (turbo, 5 %)',d:'short',x:{pct:5}},
       {t:'Acheter : les joueurs pardonnent toujours',d:'buy',x:{pct:10}},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('motorama_rappel',{ic:'🚗',t:'📰 Les Échos de la Bourse : Motorama rappellerait 300 000 voitures pour un frein à main un peu trop… détendu. La marque parle d’une « opération de confort ».',
    x:{a:'MOTO',p:.7,b:[-22,-8],f:[-3,6],lab:'Le rappel géant de Motorama'},
    c:[{t:'Vendre tes Motorama',d:'sell'},
       {t:'Parier sur la baisse (turbo, 5 %)',d:'short',x:{pct:5}},
       {t:'Acheter, le marché exagère toujours',d:'buy',x:{pct:10}},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('lumiere_comptoir',{ic:'👜',min:3000,t:'☕ Au comptoir du café, un habitué jure que Maison Lumière fait un carton en Asie : « Ma nièce y travaille, les sacs partent comme des petits pains ! » La rubrique boursière du zinc n’a jamais été très fiable.',
    x:{a:'LUXR',p:.45,b:[10,28],f:[-12,-3],lab:'Le tuyau du comptoir sur Maison Lumière'},
    c:[{t:'Acheter des actions Maison Lumière',d:'buy',x:{pct:10}},
       {t:'Vendre tes Maison Lumière',d:'sell'},
       {t:'Commander un autre café',d:'none',m:'Un allongé, s’il vous plaît.'}]}),
  NEWS('aerodyne_commande',{ic:'✈️',t:'📰 La Tribune Boursière : Aérodyne serait sur le point de décrocher une commande de 200 avions auprès d’une compagnie du Golfe. Signature attendue « dans les prochains jours ».',
    x:{a:'AERO',p:.55,b:[12,30],f:[-15,-5],lab:'La commande géante d’Aérodyne'},
    c:[{t:'Acheter des actions Aérodyne',d:'buy',x:{pct:10}},
       {t:'Vendre tes Aérodyne',d:'sell'},
       {t:'Attendre la signature',d:'none'}]}),
  NEWS('delices_camembert',{ic:'🧀',t:'📰 Le Journal des Finances : Délices & Co rappelle deux millions de camemberts « au goût anormalement prononcé ». Les amateurs de fromage sont perplexes.',
    x:{a:'DLCO',p:.6,b:[-15,-5],f:[0,6],lab:'Le rappel de camemberts de Délices & Co'},
    c:[{t:'Vendre tes Délices & Co',d:'sell'},
       {t:'Acheter : un fromage qui sent fort, c’est bon signe',d:'buy',x:{pct:10}},
       {t:'Ne rien faire',d:'none',m:'Tu ouvres ton frigo, par précaution.'}]}),
  NEWS('hausse_taux',{ic:'🏦',t:'📺 BFN Business : la banque centrale envisagerait une hausse surprise de ses taux directeurs. L’immobilier tousse, les banquiers se frottent les mains.',
    x:{a:'PIER',p:.55,b:{PIER:[-18,-6],BQHX:[4,12],TLCM:[-8,-2]},f:{PIER:[2,8],BQHX:[-6,0]},lab:'La hausse des taux'},
    c:[{t:'Vendre tes Pierre & Toit',d:'sell'},
       {t:'Acheter Banque Hexagone, les banques adorent les taux hauts',d:'buy',x:{a:'BQHX',pct:10}},
       {t:'Mettre 10 % de tes liquidités à l’abri en OAT',d:'oat',x:{pct:10}},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('opa_telecomete',{ic:'📢',w:.06,t:'📢 Officiel : un opérateur espagnol lance une OPA sur Télécomète, avec une prime de 30 % sur le dernier cours. Le conseil d’administration se dit « ouvert à la discussion ».',
    x:{a:'TLCM',b:[24,32],lab:'L’OPA sur Télécomète'},
    c:[{t:'Apporter tes titres à l’offre',d:'opa',x:{prem:30},m:'Tu cèdes tes titres au prix de l’offre.',q:{happiness_modifier:4}},
       {t:'Garder tes titres en espérant une surenchère',d:'none',hold:true,m:'Tu parie sur une contre-offre. Les requins rôdent.'},
       {t:'Acheter maintenant, il reste un peu de marge',d:'buy',x:{pct:5,prem:26},m:'Le cours a déjà bondi, mais tu tentes ta chance.'},
       {t:'Regarder les requins se battre',d:'none'}]}),
  NEWS('or_refuge',{ic:'🥇',t:'📰 Les Échos de la Bourse : les tensions géopolitiques s’aggravent et les investisseurs se ruent sur l’or. Les bijoutiers de la rue de la Paix ne savent plus où donner de la tête.',
    x:{a:'XAU',p:.7,b:[8,22],f:[-8,-2],lab:'La ruée vers l’or'},
    c:[{t:'Acheter de l’or',d:'buy',x:{pct:10},m:'Tu achètes quelques lingots virtuels.'},
       {t:'Vendre ton or au plus haut',d:'sell'},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('secheresse_ble',{ic:'🌾',t:'🌡️ Le Journal des Finances : les météorologues annoncent une sécheresse historique sur la Beauce et les grandes plaines céréalières. Les boulangers s’inquiètent pour le prix de la baguette.',
    x:{a:'BLE',p:.65,b:[20,50],f:[-12,0],lab:'La sécheresse sur le blé'},
    c:[{t:'Acheter du blé',d:'buy',x:{pct:10}},
       {t:'Vendre ton blé',d:'sell'},
       {t:'Prier pour la pluie',d:'none',m:'Tu ressors ton parapluie, par superstition.'}]}),
  NEWS('gel_cafe',{ic:'☕',t:'🎙️ Radio Patrimoine : un gel tardif menacerait les plantations de café au Brésil. Dans les salles de marché, on rationne déjà les expressos.',
    x:{a:'CAFE',p:.6,b:[20,60],f:[-10,0],lab:'Le gel sur les caféiers'},
    c:[{t:'Acheter du café',d:'buy',x:{pct:10}},
       {t:'Vendre ton café',d:'sell'},
       {t:'Passer au thé',d:'none',m:'Un thé vert, et tu observes de loin.'}]}),
  NEWS('petrole_vienne',{ic:'🛢️',t:'📺 BFN Business : les grands pays producteurs de pétrole se réunissent à Vienne pour « ajuster » leur production. Traduction : ils aimeraient bien faire monter les prix.',
    x:{a:'BRNT',p:.6,b:{BRNT:[15,35],VOLT:[4,12]},f:{BRNT:[-15,-5]},lab:'La réunion des pays producteurs'},
    c:[{t:'Acheter du pétrole',d:'buy',x:{pct:10}},
       {t:'Acheter des actions Voltéo',d:'buy',x:{a:'VOLT',pct:10}},
       {t:'Vendre ton pétrole',d:'sell'},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('cuivre_electrique',{ic:'🔌',t:'📰 La Tribune Boursière : la demande de cuivre exploserait avec les voitures électriques. Un analyste parle déjà d’un « nouveau pétrole rouge ».',
    x:{a:'CUIV',p:.6,b:[12,30],f:[-10,-2],lab:'La ruée sur le cuivre'},
    c:[{t:'Acheter du cuivre',d:'buy',x:{pct:10}},
       {t:'Vendre ton cuivre',d:'sell'},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('argent_forum',{ic:'🥈',t:'💬 Sur un forum d’investisseurs amateurs, des milliers de membres jurent de « faire exploser » le cours de l’argent-métal. Leur mascotte est un singe en costume.',
    x:{a:'XAG',p:.4,b:[25,70],f:[-25,-5],lab:'L’offensive des petits porteurs sur l’argent'},
    c:[{t:'Rejoindre le mouvement',d:'buy',x:{pct:10},q:{happiness_modifier:2}},
       {t:'Vendre ton argent-métal',d:'sell'},
       {t:'Parier contre eux (turbo, 5 %)',d:'short',x:{pct:5}},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('prophete_krach',{ic:'🔮',w:.07,t:'📺 Sur le plateau de BFN Business, un économiste star (il a prédit neuf des deux derniers krachs) annonce une apocalypse boursière « d’ici la fin de l’année ».',
    x:{ids:STOCK_IDS,p:.25,b:[-25,-8],f:[-3,6],lab:'La prophétie de krach'},
    c:[{t:'Tout vendre et dormir tranquille',d:'sellCat',x:{cat:'stock'}},
       {t:'Te réfugier sur les obligations d’État (20 %)',d:'oat',x:{pct:20}},
       {t:'Acheter de l’or, au cas où',d:'buy',x:{a:'XAU',pct:10}},
       {t:'Zapper : il dit ça tous les ans',d:'none'}]}),
  NEWS('etheron_maj',{ic:'💠',t:'📰 Le Journal des Finances : Éthéron bascule ce week-end vers une mise à jour majeure de son réseau. Les développeurs promettent que « rien ne peut mal tourner ».',
    x:{a:'ETH',p:.5,b:[20,70],f:[-40,-15],lab:'La mise à jour d’Éthéron'},
    c:[{t:'Acheter de l’Éthéron',d:'buy',x:{pct:8}},
       {t:'Parier sur un bug (turbo, 5 %)',d:'short',x:{pct:5}},
       {t:'Vendre ton Éthéron',d:'sell'},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('bitpiece_fonds',{ic:'🪙',t:'📰 Les Échos de la Bourse : les autorités américaines s’apprêteraient à valider un fonds indiciel BitPièce. Wall Street pourrait bientôt en vendre à ta grand-mère.',
    x:{a:'BPC',p:.6,b:[25,80],f:[-20,-5],lab:'Le fonds indiciel BitPièce'},
    c:[{t:'Acheter de la BitPièce',d:'buy',x:{pct:8}},
       {t:'Vendre ta BitPièce',d:'sell'},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('baguettecoin',{ic:'🥖',once:true,min:3000,w:.06,t:'🥖 Un ami d’ami te propose d’entrer dans la prévente du jeton « BaguetteCoin », « adossé au prix de la baguette tradition ». Le site a été créé il y a trois jours.',
    c:[{t:'Investir 2 000 €',d:'ico',x:{amt:2000,p2:.12,mult:6,tok:'BaguetteCoin'},cond:{min_bank_balance:2000}},
       {t:'Investir 10 000 €, la vie est courte',d:'ico',x:{amt:10000,p2:.12,mult:6,tok:'BaguetteCoin'},cond:{min_bank_balance:10000},q:{stress_level_increment:5}},
       {t:'Décliner poliment',d:'none',m:'Tu préfères acheter de vraies baguettes.',q:{smarts_modifier:1}}]}),
  NEWS('coiffeur_pierre',{ic:'💇',min:3000,t:'💇 Entre deux coups de ciseaux, ton coiffeur te glisse un tuyau « en béton » : Pierre & Toit va racheter tous les centres commerciaux de France. Il le tient d’un client.',
    x:{a:'PIER',p:.35,b:[10,25],f:[-12,-3],lab:'Le tuyau du coiffeur sur Pierre & Toit'},
    c:[{t:'Acheter des actions Pierre & Toit',d:'buy',x:{pct:10}},
       {t:'Vendre tes Pierre & Toit',d:'sell'},
       {t:'Demander juste une coupe',d:'none',m:'Un dégradé, et pas de conseils financiers, merci.'}]}),
  NEWS('pdg_ludiverse',{ic:'🐐',t:'📱 Le PDG de Ludiverse annonce sa démission sur les réseaux sociaux : il part élever des chèvres dans le Larzac. Les analystes hésitent entre panique et soulagement.',
    x:{a:'LUDI',p:.5,b:[-20,-8],f:[3,15],lab:'La démission du PDG de Ludiverse'},
    c:[{t:'Vendre tes Ludiverse',d:'sell'},
       {t:'Acheter, un nouveau PDG ne peut pas faire pire',d:'buy',x:{pct:10}},
       {t:'Ne rien faire',d:'none'}]}),
  NEWS('produit_structure',{ic:'🏦',min:10000,w:.05,t:'🏦 Ton banquier t’invite dans son bureau pour te présenter « Autocall Sérénité Plus », un produit structuré « à capital garanti… sous certaines conditions ». La brochure fait quarante pages.',
    c:[{t:'Souscrire pour 10 000 €',d:'struct',x:{amt:10000},cond:{min_bank_balance:10000}},
       {t:'Demander à lire les quarante pages',d:'none',m:'Tu t’endors page douze. Tu ne signes rien.',q:{smarts_modifier:1}},
       {t:'Refuser poliment',d:'none',m:'Ton banquier range sa brochure, un peu déçu.'}]})
];

/* ================= Enregistrement ================= */
registerMod({
  id:MOD,
  worldInit(){mkGet()},
  worldYear(){const M=mkGet();if(M)tick(M,false)},
  year:invYear,
  events:invEvents,
  eventsDb,effects,conds,
  assetRows(L){const t=invTotal(L);const I=L.inv;return [nav('📈','Bourse et marchés',t>0?`Placements : ${fmtk(t)}${I&&I.lastRet?` · ${pctF(I.lastRet)} cette année`:''}`:'Actions, obligations, crypto, matières premières',pMarket)]},
  activities(L){return [{ic:'📈',t:'Bourse',s:'Actions, obligations, crypto, matières premières',panel:pMarket,min:18}]},
  netWorth(L){const v=invTotal(L);return isFinite(v)?Math.round(v):0},
  badges(L){const t=invTotal(L);return t>=5e6?['🐋 Baleine boursière']:t>=5e5?['📈 Investisseur']:[]},
  inherit(D,L){
    const S=D&&D.inv;if(!S||typeof S!=='object')return;let c;try{c=JSON.parse(JSON.stringify(S))}catch(e){return}
    L.inv=c;const I=invSt(L);
    for(const id in I.h){const h=I.h[id];h.c=Math.round(h.q*priceOf(id)*100)/100}
    Object.assign(I,{real:0,ry:0,carry:0,div:0,divY:0,cpY:0,vh:[],bets:[],tip:null,lastTip:null,ins:null,tipN:0,tipOk:0,n:0,lastRet:0,panicY:null,seen:G&&G.mk?G.mk.y:0});
    const v=invTotal(L);if(v>0)say(L,`📈 Le portefeuille de ${D.first} te revient aussi : ${fmt(v)} en actions, obligations et autres placements.`);
  }
});
})();
