/* Deux Vies — module « Marché noir » (id blackmarket)
   1. Maison d’enchères clandestine (catalogue annuel, enchères en modale, expertise)
   2. Pièces achetées dans L.assets (kind:'art', stolen, fake, authenticated) : authentification, blanchiment, revente
   3. Receleurs, pièges policiers, descentes   4. Contrebande (BM_ITEMS)
   État : L.bm = {stock,heat,px,pxAge,lots,lotsAge,fences,fenceAge,rep,log,st} — migre l’ancien format {stock,heat,px,pxAge}. */
(()=>{
const MOD='blackmarket';

/* ---------- Données ---------- */
const CATS={
  A:{ic:'🏺',n:'Artefact historique',stolen:.6,fake:.3},
  V:{ic:'🖼️',n:'Tableau volé',stolen:.85,fake:.28},
  M:{ic:'📜',n:'Manuscrit',stolen:.45,fake:.25},
  J:{ic:'👑',n:'Joyau de la Couronne',stolen:.6,fake:.15},
  H:{ic:'⌚',n:'Montre d’exception',stolen:.4,fake:.3},
  S:{ic:'🗡️',n:'Souvenir d’Empire',stolen:.4,fake:.3}};
const TPL=[
 ['A','Amphore gallo-romaine de Lugdunum',6000,30000],['A','Bouclier de bronze de l’âge du fer',12000,60000],
 ['A','Buste d’empereur en marbre (fragment)',20000,120000],['A','Reliquaire émaillé de Limoges',15000,90000],
 ['A','Astrolabe du collège de Navarre',9000,45000],['A','Mosaïque de villa romaine d’Arles',25000,150000],
 ['V','« Nature morte aux cerises », école de Chardin',18000,90000],['V','« Paysage de Camargue », signé J. Valmy',8000,40000],
 ['V','Portrait de la duchesse, atelier de cour, 1860',14000,70000],['V','Étude de danseuse au fusain, fin XIXᵉ',6000,30000],
 ['V','Marine de Honfleur, huile sur panneau',7000,35000],['V','Affiche originale de cabaret, Montmartre 1894',3000,15000],
 ['V','Grand format abstrait des années 60, sans cadre',30000,200000],
 ['M','Lettres inédites d’un poète du Second Empire',5000,28000],['M','Chanson de geste enluminée',30000,160000],
 ['M','Journal de bord d’un corsaire malouin',8000,40000],['M','Partition autographe d’un opéra oublié',12000,70000],
 ['M','Carnet de recettes d’un maître queux de Versailles',4000,22000],
 ['J','Diadème « Rose de Lutèce », ancien joyau de la Couronne',80000,400000],['J','Collier « Larme de Bourbonnais »',60000,300000],
 ['J','Broche à l’aigle, écrin de l’Impératrice',40000,220000],['J','Bague sceau de la Maison de Valmorie',25000,120000],
 ['H','Montre de poche Lépine-Vaucanson, 1887',9000,45000],['H','Chronographe « Mille Miles 1964 », série unique',25000,130000],
 ['H','Tourbillon Delacroix-Perrin à répétition minutes',60000,300000],['H','Montre de bord d’un paquebot transatlantique',6000,30000],
 ['S','Épée d’apparat d’un maréchal du Premier Empire',15000,80000],['S','Casque de cuirassier de la Garde',8000,40000],
 ['S','Drapeau de régiment, 1815',10000,55000],['S','Pistolets de duel en écrin',9000,45000]];
const DESCS=['Vendu sans garantie. Les lunettes sont fournies à l’entrée.','Pièce « sortie d’une succession » (le notaire n’a pas été prévenu).',
 'Le commissaire-priseur ne connaît aucun nom et ne veut pas en connaître.','Superbe état, légère odeur de cave et de scandale.',
 'Présenté sous un drap, comme il se doit.','Lot très disputé entre amateurs aux poches profondes et à la mémoire courte.',
 'Le catalogue parle d’une « provenance prestigieuse ». Il ne dit pas laquelle.','Passé de main en main par des gens sans casier, officiellement.'];
const RIVALS=['Le baron de Sérizy','Mme Vanderhoeven','Un homme en lunettes fumées','Me Tardieu, pour un client anonyme','L’émissaire du Liechtenstein','La veuve Castellane','Le « Collectionneur »','Téléphone n° 4','Monsieur Paul, antiquaire','Une dame au chapeau à voilette'];
const FENCES=['Gaston « le Brocanteur »','Madame Irma, rue Mouffetard','Le Comte','Titi des Puces','Maître Colbert, « conseil en patrimoine »','Odile de la rue des Rosiers','Bébert Ferraille','La Marquise'];

/* ---------- Outils ---------- */
const money=n=>Math.round(+n||0);
const bmIsAsset=a=>a&&a.bm;
function genPx(B,age){
  if(B.px&&B.pxAge===age)return;
  B.pxPrev=B.px||null;B.px={};
  for(const [k,v] of Object.entries(BM_ITEMS)){const b=v[0],vol=v[1];B.px[k]=Math.max(1,Math.round(b*(1+gauss()*vol)))}
  B.pxAge=age;
}
function genLots(L,B){
  const n=R(4,6);const tp=shuffle(TPL.slice()).slice(0,n);
  return tp.map(([c,name,lo,hi])=>{
    const C=CATS[c];let est=R(lo,hi);if(chance(.1))est*=2;est=Math.round(est/100)*100;
    const stolen=chance(C.stolen)?1:0;const fake=chance(C.fake*R(60,140)/100)?1:0;
    const prov=chance(stolen?.85:.3)?'floue':'documentée';
    return {id:nid(),name,cat:c,ic:C.ic,est,stolen,fake,prov,
      start:Math.round(est*(stolen?R(22,35):R(40,55))/100/100)*100||100,
      real:Math.round(est*R(78,125)/100),fakeVal:Math.max(80,Math.round(est*R(2,6)/100)),
      fakeP:fake?R(40,85):R(3,35),expert:false,done:false,desc:pick(DESCS)};
  });
}
function genFences(B){
  const ns=shuffle(FENCES.slice()).slice(0,3);
  B.fences=ns.map(n=>{const cut=R(40,70)/100;return {n,cut,risk:Math.round((.03+(cut-.4)*.35)*1000)/1000}});
}
function ensure(L){
  let B=L.bm;
  if(!B||typeof B!=='object'||Array.isArray(B))B=L.bm={};
  if(!B.stock||typeof B.stock!=='object'||Array.isArray(B.stock))B.stock={};
  for(const k of Object.keys(B.stock)){const q=Math.floor(+B.stock[k]);if(q>0&&k in BM_ITEMS)B.stock[k]=q;else delete B.stock[k]}
  B.heat=Number.isFinite(+B.heat)?Math.max(0,Math.min(100,+B.heat)):0;
  if(!Number.isFinite(B.rep))B.rep=0;
  if(!Array.isArray(B.log))B.log=[];
  if(!B.st||typeof B.st!=='object')B.st={bought:0,sold:0,spent:0,gained:0,fakes:0,raids:0};
  for(const k of ['bought','sold','spent','gained','fakes','raids'])if(!Number.isFinite(B.st[k]))B.st[k]=0;
  if(!Number.isFinite(B.pxAge)||!B.px)B.pxAge=-1;
  genPx(B,L.age);
  if(!Array.isArray(B.lots)||B.lotsAge!==L.age){B.lots=genLots(L,B);B.lotsAge=L.age}
  if(!Array.isArray(B.fences)||B.fences.length<3||B.fenceAge!==L.age){genFences(B);B.fenceAge=L.age}
  return B;
}
const engaged=L=>!!(L.bm&&typeof L.bm==='object');
const myPieces=L=>L.assets.filter(bmIsAsset);
const stockUnits=B=>Object.values(B.stock).reduce((s,q)=>s+q,0);
const stockValue=B=>{if(!B||!B.px||!B.stock)return 0;let v=0;for(const [k,q] of Object.entries(B.stock))v+=(B.px[k]||0)*q;return v};
const addHeat=(B,n)=>{B.heat=Math.max(0,Math.min(100,B.heat+n))};
function logB(B,t){B.log.push(t);if(B.log.length>12)B.log.shift()}
function heatTxt(h){return h<15?'Personne ne te connaît':h<35?'Quelques regards en coin':h<60?'Un dossier s’ouvre quelque part':h<80?'Tu es dans le viseur de l’Office central':'Les écoutes tournent à plein régime'}
const truth=a=>a.fake?(a.real||Math.round(a.value*.04)):(a.real!=null?a.real:a.value);
const pieceHot=a=>!!(a&&a.stolen);

/* ---------- Pièces : authentification, blanchiment ---------- */
function authCost(a){return Math.max(300,Math.round(a.value*.05))}
function authenticate(L,a){
  const B=ensure(L);
  if(a.fake){a.fakeKnown=1;a.authenticated=false;a.value=money(a.real||a.value*.04);a.name=a.name.replace(/ \(copie\)$/,'')+' (copie)';chg(L,{happy:-8});B.st.fakes++;track(L,'bmFakes');
    return out(L,`🔍 L’expert pose sa loupe et soupire : « C’est une copie, Monsieur. Très belle, mais une copie. » Ta pièce ne vaut plus que ${fmt(a.value)}.`)}
  a.authenticated=true;a.value=money(truth(a));chg(L,{happy:R(2,5)});
  return out(L,`🔍 Certificat en main : « ${a.name} » est authentique, estimée ${fmt(a.value)}. L’expert encaisse avec un petit sourire.`);
}
function launder(L,a){
  const B=ensure(L);track(L,'crimes');chg(L,{crime:R(1,3),karma:-3});
  if(chance(.55)){a.stolen=0;addHeat(B,R(1,4));a.launderOk=1;return out(L,`📄 Un faussaire de la rue de Rivoli te fabrique un dossier de provenance impeccable : « collection privée, famille de notaires depuis 1890 ». La pièce est désormais présentable.`)}
  addHeat(B,R(8,15));return out(L,'📄 Le faux dossier de provenance sent l’encre fraîche. L’expert que tu as fait venir fronce les sourcils. Tu as payé pour rien, et on a vu ton visage.');
}

/* ---------- Revente chez un receleur ---------- */
function fenceBonus(B){return Math.min(.08,(B.rep||0)/1250)}
function fenceSale(L,aid,fi,forced){
  const B=ensure(L);const a=L.assets.find(x=>x.id===aid);if(!a)return '';
  const f=forced||B.fences[fi]||B.fences[0];const base=truth(a);
  // le receleur examine la pièce
  if(a.fake&&!a.fakeKnown&&!a.authenticated){
    if(chance(.75)){
      a.fakeKnown=1;a.value=money(a.real||a.value*.04);a.name=a.name.replace(/ \(copie\)$/,'')+' (copie)';B.st.fakes++;track(L,'bmFakes');chg(L,{happy:-6});addHeat(B,1);
      modal({title:'Le receleur éclate de rire',icon:'🤣',text:`${f.n} regarde ta pièce sous la lampe, puis te la rend : « Mon petit, c’est une copie de chez Maisons du Monde. Je t’en donne ${fmt(Math.round(a.value*f.cut))}, pour le cadre. »`,choices:[
        {t:`Accepter ${fmt(Math.round(a.value*f.cut))}`,fn:()=>{const o=Math.round(a.value*f.cut);L.assets=L.assets.filter(x=>x.id!==aid);earn(L,o,1);return out(L,`Tu laisses la copie contre ${fmt(o)}. Une leçon, payée cher.`)}},
        {t:'Garder le faux',fn:()=>out(L,'Tu ranges ta copie en silence. Elle fera un joli cadeau de Noël.')}]});
      return '';
    }
    // la fraude passe : le receleur paie le prix d’une vraie pièce
    const o=Math.round(a.value*(f.cut+fenceBonus(B)));
    L.assets=L.assets.filter(x=>x.id!==aid);earn(L,o,1);chg(L,{karma:-6,happy:3});addHeat(B,R(6,12));B.foe=(B.foe||0)+1;B.st.sold++;B.st.gained+=o;track(L,'crimes');track(L,'bmSold');
    return out(L,`😈 ${f.n} n’y voit que du feu : tu repars avec ${fmt(o)} pour une copie. Il faudra éviter son quartier un moment.`);
  }
  const bonus=fenceBonus(B);
  const stingP=Math.min(.6,(f.risk||.05)+B.heat/600+(pieceHot(a)?.03:0));
  const sting=!!(forced&&forced.sting)||(!forced&&chance(stingP));
  const fair=Math.round(base*Math.min(.78,f.cut+bonus));
  const offer=sting?Math.round(base*R(95,118)/100):fair;
  showOffer(L,aid,f,offer,sting,!sting);
  return '';
}
function showOffer(L,aid,f,offer,sting,canHaggle){
  const B=ensure(L);const a=L.assets.find(x=>x.id===aid);if(!a)return;
  const base=Math.max(1,truth(a));const pct=Math.round(offer/base*100);
  const ch=[
    {t:`Accepter ${fmt(offer)}`,pri:1,fn:()=>closeDeal(L,aid,offer,sting,f)},
    {t:'Flairer l’affaire (poser des questions)',fn:()=>sniff(L,aid,offer,sting,f)},
    ...(canHaggle?[{t:'Marchander (+12 %)',fn:()=>{
      if(chance(.5+(L.st.smarts-50)/300)){showOffer(L,aid,f,Math.round(offer*1.12),false,false);return ''}
      if(chance(.35))return out(L,`${f.n} referme sa valise : « Plus d’affaire. » Il ne reviendra pas avant l’an prochain.`);
      showOffer(L,aid,f,Math.round(offer*.95),false,false);return ''}}]:[]),
    {t:'Refuser et garder la pièce',fn:()=>out(L,sting?'Tu déclines poliment. L’acheteur hausse les épaules et disparaît un peu trop vite dans la foule.':'Tu déclines. Le receleur prétend qu’il a mieux ailleurs. Tu en doutes.')}];
  modal({title:sting?'Un acheteur très généreux':'Offre du receleur',icon:sting?'🕵️':'🤝',
    text:sting?`${f.n} te propose ${fmt(offer)} pour « ${a.name} », soit ${pct} % de sa valeur. Beaucoup trop beau pour être honnête ?`:`${f.n} fait tourner la pièce entre ses doigts. « Disons ${fmt(offer)}, soit ${pct} % de sa valeur. Pas de facture, pas de questions. »`,choices:ch});
}
function sniff(L,aid,offer,sting,f){
  const B=ensure(L);
  const p=Math.min(.92,.45+(L.st.smarts-50)/250+((L.hid&&L.hid.crime)||0)/400);
  if(sting){
    if(chance(p)){addHeat(B,3);return out(L,'🕵️ Le « collectionneur » ne sait pas répondre à une question simple sur la dorure. Tu t’éclipses avant que les camionnettes ne se garent. Flair excellent.')}
    return busted(L,aid,'Les questions n’ont pas suffi : c’était bien un policier infiltré.');
  }
  if(chance(.7)){modal({title:'Affaire réglo',icon:'✅',text:`Tout est limpide : ${f.n} est bien celui qu’il prétend être. Tu conclus ?`,choices:[
    {t:`Accepter ${fmt(offer)}`,pri:1,fn:()=>closeDeal(L,aid,offer,false,f)},{t:'Renoncer'}]});return ''}
  return out(L,`À force de poser des questions, tu vexes ${f.n}, qui range son carnet : « Je ne traite pas avec les paranos. »`);
}
function busted(L,aid,why){
  const B=ensure(L);const a=L.assets.find(x=>x.id===aid);
  if(a)L.assets=L.assets.filter(x=>x.id!==aid);
  B.st.raids++;addHeat(B,10);track(L,'crimes');chg(L,{karma:-3,happy:-12,stress:10});
  say(L,'🚨 '+why+' Menottes, saisie de la pièce, et une nuit au poste.');
  trial(L,{n:'Recel',jail:[1,5],fine:15000,lawyer:12000});
  return '';
}
function closeDeal(L,aid,offer,sting,f){
  const B=ensure(L);const a=L.assets.find(x=>x.id===aid);if(!a)return '';
  if(sting)return busted(L,aid,'Le « riche amateur » sort une carte tricolore : c’était un piège de la brigade de répression du banditisme.');
  L.assets=L.assets.filter(x=>x.id!==aid);earn(L,offer,1);
  B.st.sold++;B.st.gained+=offer;B.rep=Math.min(100,B.rep+3);
  const stolen=pieceHot(a);addHeat(B,stolen?R(5,11):R(2,5));if(stolen){track(L,'crimes');chg(L,{crime:R(1,3),karma:-3})}
  track(L,'bmSold');trackMax(L,'bmBest',offer);trackMax(L,'bmHeat',B.heat);
  const gain=offer-(a.paid||0);logB(B,`${L.age} ans : « ${a.name} » cédée ${fmt(offer)}.`);
  chg(L,{happy:gain>0?R(3,7):-2});
  return out(L,`💰 Enveloppe glissée, pièce emballée dans un vieux journal : tu encaisses ${fmt(offer)}${a.paid?(gain>=0?` (+${fmt(gain)} net)`:` (${fmt(gain)} net)`):''}.`);
}

/* ---------- Vente officielle ---------- */
function officialSale(L,aid){
  const B=ensure(L);const a=L.assets.find(x=>x.id===aid);if(!a)return '';
  const px=Math.round(a.value*R(88,104)/100*.9);
  L.assets=L.assets.filter(x=>x.id!==aid);earn(L,px,1);
  B.st.sold++;B.st.gained+=px;B.rep=Math.min(100,B.rep+2);track(L,'bmSold');trackMax(L,'bmBest',px);chg(L,{happy:R(3,6)});
  return out(L,`🏛️ Vente publique chez un commissaire-priseur parisien : « ${a.name} » part à ${fmt(px)} (frais et plus-value déduits). Aucun policier dans la salle, ça change.`);
}

/* ---------- Enchères ---------- */
const esq=s=>esc(String(s));
function openAuction(L,lotId){
  const B=ensure(L);const lot=B.lots.find(l=>l.id===lotId);if(!lot||lot.done)return '';
  lot.done=true;
  const fee=p=>Math.round(p*1.08);
  const rivals=shuffle(RIVALS.slice()).slice(0,R(2,3)).map(n=>({n,budget:Math.round(lot.est*R(40,115)/100),agr:R(35,80)/100,out:false}));
  let price=lot.start,leader=0,over=false,msg='';const log=[`${rivals[0].n} ouvre à ${fmt(price)}.`];
  const expCost=Math.max(250,Math.round(lot.est*.05));
  function respond(){
    for(const r of shuffle(rivals.filter(x=>!x.out))){
      if(Math.round(price*1.1)>r.budget){r.out=true;log.push(`${r.n} se retire.`);continue}
      if(chance(r.agr)){price=Math.min(r.budget,Math.round(price*pick([1.1,1.1,1.15,1.25])));leader=rivals.indexOf(r);log.push(`${r.n} relance à ${fmt(price)}.`);return false}
      r.out=true;log.push(`${r.n} lâche l’affaire.`);
    }
    return true;
  }
  function win(){
    const cost=fee(price);L.money-=cost;
    const a={id:nid(),kind:'art',name:lot.name,value:lot.est,real:lot.fake?lot.fakeVal:lot.real,bm:1,cat:lot.cat,
      stolen:lot.stolen?1:0,fake:!!lot.fake,authenticated:false,paid:cost,boughtAge:L.age};
    L.assets.push(a);B.lots=B.lots.filter(l=>l.id!==lot.id);B.st.bought++;B.st.spent+=cost;B.rep=Math.min(100,B.rep+2);
    if(lot.stolen){addHeat(B,R(4,9));track(L,'crimes');chg(L,{crime:R(1,3),karma:-4})}else addHeat(B,R(1,3));
    track(L,'bmLots');trackMax(L,'bmHeat',B.heat);chg(L,{happy:R(3,7)});logB(B,`${L.age} ans : « ${lot.name} » adjugée ${fmt(cost)}.`);
    const over_=price>lot.est;
    return out(L,`🔨 Adjugé ! « ${lot.name} » est à toi pour ${fmt(cost)} frais compris${over_?', au-dessus de l’estimation (malédiction du gagnant)':''}.`);
  }
  modal({title:'Salle des ventes',icon:'🔨',html:'',choices:[],mount:el=>{
    const draw=()=>{
      const p10=Math.round(price*1.1),p25=Math.round(price*1.25);
      const btn=(id,t,dis,pri)=>`<button type="button" class="btn${pri?' pri':''}" data-g="${id}"${dis?' disabled':''}>${esq(t)}</button>`;
      const risk=lot.expert?`<p class="note">Expertise : risque de faux estimé à <b>${lot.fakeP} %</b>.</p>`:'';
      el.innerHTML=`<p><b>${esq(lot.ic+' '+lot.name)}</b><br><span class="muted">Estimation ${esq(fmt(lot.est))} · frais de la maison 8 %</span></p>
        <p>Enchère actuelle : <b>${esq(fmt(price))}</b><br><span class="muted">Meneur : ${esq(rivals[leader].n)}</span></p>${risk}
        <p class="muted">${log.slice(-4).map(esq).join('<br>')}</p>
        <div class="gbtns" style="display:flex;flex-direction:column;gap:8px">
        ${btn('b10',`Surenchérir +10 % (${fmt(p10)})`,fee(p10)>L.money,1)}
        ${btn('b25',`Surenchérir +25 % (${fmt(p25)})`,fee(p25)>L.money)}
        ${btn('exp',lot.expert?'Expertise déjà obtenue':`Consulter l’expert (${fmt(expCost)})`,lot.expert||expCost>L.money)}
        ${btn('quit','Abandonner')}</div>`;
    };
    const finish=t=>{over=true;el.onclick=null;endModal(t)};
    el.onclick=ev=>{
      if(over)return;const b=ev.target.closest&&ev.target.closest('[data-g]');if(!b||b.disabled)return;const g=b.dataset.g;
      if(g==='exp'){L.money-=expCost;lot.expert=true;log.push('Un expert glisse son verdict à ton oreille.');draw();return}
      if(g==='quit'){finish(out(L,`Tu lèves la main pour dire non. « ${lot.name} » part chez un autre amateur.`));return}
      const np=g==='b25'?Math.round(price*1.25):Math.round(price*1.1);
      if(fee(np)>L.money){draw();return}
      price=np;leader=-1;log.push(`Tu mises ${fmt(price)}.`);
      if(respond()){finish(win());return}
      if(log.length>40){finish(win());return}
      draw();
    };
    draw();
  }});
  return '';
}

/* ---------- Pièges, faux, descentes (évènements) ---------- */
function fakeEvent(L,a){
  const B=ensure(L);
  modal({title:'Mauvaise nouvelle',icon:'🔍',text:`Un conservateur de passage regarde « ${a.name} » de plus près et lâche un petit rire gêné : c’est un faux, et pas des plus fins. Tu avais payé ${fmt(a.paid||a.value)}.`,choices:[
    {t:'Encaisser le coup',fn:()=>{a.fakeKnown=1;a.value=money(a.real||a.value*.04);a.name=a.name.replace(/ \(copie\)$/,'')+' (copie)';B.st.fakes++;track(L,'bmFakes');chg(L,{happy:-10});return out(L,'🪞 Tu ranges la copie dans le placard. Le vendeur, lui, a déjà changé de numéro.')}},
    {t:'La refiler à un autre amateur',danger:1,fn:()=>{
      a.fakeKnown=1;track(L,'crimes');chg(L,{karma:-8,crime:R(2,4)});
      if(chance(.55)){const o=Math.round((a.paid||a.value)*R(35,60)/100);L.assets=L.assets.filter(x=>x.id!==a.id);earn(L,o,1);addHeat(B,R(4,9));B.st.fakes++;return out(L,`😏 Un amateur pressé repart avec ta copie et ${fmt(o)} de moins en poche. Le karma te regarde de travers.`)}
      a.value=money(a.real||a.value*.04);B.st.fakes++;say(L,'🚨 L’amateur était un expert d’assurance. Plainte déposée.');trial(L,{n:'Escroquerie',jail:[0,3],fine:9000,lawyer:10000});return ''}},
    {t:'L’encadrer au salon',fn:()=>{a.fakeKnown=1;a.value=money(a.real||a.value*.04);a.name=a.name.replace(/ \(copie\)$/,'')+' (copie)';chg(L,{happy:-2,karma:2});B.st.fakes++;return out(L,'Tu l’accroches au-dessus du canapé en racontant que c’est un original. Personne ne vérifie.')}}]});
}
function stingEvent(L,a){
  const B=ensure(L);
  const f={n:pick(['Un inconnu en trench-coat','Une élégante dame au téléphone','Un jeune homme très poli','Un « collectionneur privé »']),cut:1,risk:.1,sting:true};
  const forcedSting=chance(.65);
  const base=truth(a);
  showOffer(L,a.id,f,Math.round(base*R(100,125)/100),forcedSting,false);
}
function tipEvent(L){
  const B=ensure(L);
  modal({title:'Un coup de fil anonyme',icon:'📞',text:'« Les amis de l’Office central s’intéressent à vos activités, Monsieur. Je dis ça, je ne dis rien. » Clic. Tu n’as pas reconnu la voix.'.replace('Monsieur',ge(L,'Monsieur','Madame')),choices:[
    {t:'Déménager discrètement le stock (5 000 €)',fn:()=>{if(L.money<5000)return out(L,'Pas de quoi payer le déménageur. Tu croises les doigts.');L.money-=5000;addHeat(B,-R(15,28));return out(L,'🚚 Un camion de déménagement « Dubois & Fils » vide ta cave en une nuit. La chaleur retombe.')}},
    {t:'Ignorer, c’est sûrement un mauvais plaisant',fn:()=>{addHeat(B,R(2,6));return out(L,'Tu hausses les épaules. Pourtant, tu vérifies deux fois le rétroviseur toute la semaine.')}},
    {t:'Faire profil bas pour un temps',fn:()=>{addHeat(B,-R(6,12));chg(L,{happy:-2});return out(L,'Tu te mets au vert : brocante, boulangerie, rien de suspect.')}}]});
}

/* ---------- Panneaux ---------- */
const lotLine=l=>`${l.ic} ${l.name}`;
function pMain(){
  const L=cur();const B=ensure(L);const ps=myPieces(L);
  const val=ps.reduce((s,a)=>s+a.value,0);const hot=ps.filter(pieceHot).length;
  const rows=[
    nav('🔨','Maison d’enchères clandestine',`${B.lots.filter(l=>!l.done).length} lots au catalogue de cette année`,pAuc),
    nav('🗃️','Ma collection',ps.length?`${ps.length} pièce${ps.length>1?'s':''} · ${fmt(val)}${hot?` · ${hot} « chaude${hot>1?'s':''} »`:''}`:'Aucune pièce pour l’instant',pColl),
    nav('📦','Contrebande',stockUnits(B)?`${stockUnits(B)} unités · ${fmt(stockValue(B))}`:'Cigarettes, sacs, montres… et leurs prix du jour',pContra),
    nav('🤝','Receleurs',`${B.fences.map(f=>f.n.split(/[ «,]/)[0]).join(', ')} cherchent des pièces`,pFences)];
  const disc=[
    act(L,{ic:'🧢',t:'Faire profil bas',s:'Moins de sorties, moins de soupçons',key:'bm_low',min:18,fn:L=>{const d=R(8,14);addHeat(B,-d);chg(L,{happy:-2});return out(L,`Tu te fais oublier quelque temps. L’attention de la police baisse de ${d} points.`)}}),
    act(L,{ic:'🥂',t:'Graisser la patte d’un inspecteur',s:'10 000 € · 70 % de réussite',cost:10000,key:'bm_corr',min:18,danger:1,fn:L=>{
      track(L,'crimes');chg(L,{crime:R(2,4),karma:-5});
      if(chance(.7)){const d=R(15,25);addHeat(B,-d);return out(L,`Une enveloppe change de poche au bistrot de la préfecture. L’attention de la police baisse de ${d} points.`)}
      addHeat(B,R(10,18));say(L,'🚨 L’inspecteur était intègre. Ou en tout cas, très mal acheté.');trial(L,{n:'Corruption',jail:[1,3],fine:20000,lawyer:15000});return ''}})];
  const lg=B.log.length?group('Dernières opérations',B.log.slice(-4).reverse().map(t=>`<p class="note">${esc(t)}</p>`)):'';
  return {title:'Marché noir',html:note('Un monde d’enchères sans notaire, de receleurs sans facture et de policiers sans uniforme. Chaque achat, chaque vente fait monter la chaleur.')
    +card('Réseau',`Réputation ${Math.round(B.rep)} / 100`,`${B.st.bought} achat${B.st.bought>1?'s':''} · ${B.st.sold} vente${B.st.sold>1?'s':''} · fakes démasqués : ${B.st.fakes}`,statLine('Attention de la police',B.heat)+`<div class="cs">${esc(heatTxt(B.heat))}</div>`)
    +group('Opérations',rows)+group('Discrétion',disc)+lg};
}
function pAuc(){
  const L=cur();const B=ensure(L);
  const rows=B.lots.map(l=>nav(l.ic,l.done?`${l.name} (adjugé)`:l.name,`${l.done?'Plus disponible':`Estimé ${fmt(l.est)} · mise à prix ${fmt(l.start)}`}`,pLot(l.id),l.done));
  return {title:'Enchères clandestines',html:note('Un nouveau catalogue chaque année, dans une arrière-salle d’hôtel particulier. Dress code : sobre. Questions : proscrites.')+group(`Catalogue de ${L.age} ans`,rows)};
}
function pLot(id){return ()=>{
  const L=cur();const B=ensure(L);const l=B.lots.find(x=>x.id===id);
  if(!l)return {title:'Lot',html:note('Ce lot n’est plus disponible.')};
  const expCost=Math.max(250,Math.round(l.est*.05));const minPay=Math.round(l.start*1.08);
  const rows=[
    act(L,{ic:'🔎',t:'Faire expertiser',s:l.expert?`Risque de faux : ${l.fakeP} %`:`${fmt(expCost)} (environ 5 % de l’estimation)`,cost:expCost,dis:l.expert?`Risque de faux : ${l.fakeP} %`:l.done?'Lot adjugé':'',fn:L=>{l.expert=true;return out(L,`L’expert examine « ${l.name} » à la loupe. Verdict : risque de faux estimé à ${l.fakeP} %.`)}}),
    act(L,{ic:'🔨',t:'Entrer en salle',s:`Mise à prix ${fmt(l.start)} · frais 8 %`,dis:l.done?'Lot adjugé':L.money<minPay?'Fonds insuffisants':'',fn:L=>{STACK.length>1&&STACK.pop();return openAuction(L,id)}})];
  return {title:l.name,html:card(CATS[l.cat].n,fmt(l.est),`Mise à prix ${fmt(l.start)} · provenance ${l.prov}`)+note(l.desc)
    +(l.expert?note(`Expertise : risque de faux estimé à ${l.fakeP} %.`):'')+note(l.prov==='floue'?'Dossier de provenance flou : mieux vaut ne pas poser de questions.':'Dossier de provenance bien rempli, ce qui ne prouve rien.')+group('',rows)};
}}
function pColl(){
  const L=cur();const ps=myPieces(L);
  const rows=ps.map(a=>nav(CATS[a.cat]?CATS[a.cat].ic:'🖼️',a.name,`${fmt(a.value)} · ${stateTxt(a)}`,pPiece(a.id)));
  return {title:'Ma collection',html:ps.length?note('Les pièces vont aussi dans l’onglet Biens, mais ici tu peux les authentifier, blanchir leur provenance ou les revendre.')+group('',rows):note('Ta cave est vide. Les enchères ouvrent chaque année.')};
}
function stateTxt(a){return (a.fakeKnown?'copie avérée':a.authenticated?'authentifiée':'non vérifiée')+(a.stolen?' · volée':' · provenance nette')}
function pPiece(id){return ()=>{
  const L=cur();const B=ensure(L);const a=L.assets.find(x=>x.id===id);
  if(!a)return {title:'Pièce',html:note('Cette pièce n’est plus dans ta collection.')};
  const cost=authCost(a);const known=a.authenticated||a.fakeKnown;
  const offOk=a.authenticated&&!a.stolen&&!a.fake;
  const lc=Math.round(a.value*.12);
  const rows=[
    act(L,{ic:'🔍',t:'Faire authentifier',s:known?stateTxt(a):`${fmt(cost)} · certificat d’expert`,cost,dis:known?'Déjà vérifiée':'',fn:L=>authenticate(L,a)}),
    act(L,{ic:'📄',t:'Fabriquer une provenance',s:a.stolen?`${fmt(lc)} · 55 % de réussite · illégal`:'',cost:lc,dis:a.stolen?'':'Provenance déjà propre',danger:1,key:'bm_prov_'+id,fn:L=>launder(L,a)}),
    act(L,{ic:'🏛️',t:'Vente officielle',s:offOk?`Environ ${fmt(Math.round(a.value*.9))}, sans risque`:'',dis:offOk?'':!a.authenticated?'Il faut une authentification':a.stolen?'Pièce volée : impossible':'Copie : sans intérêt',fn:L=>officialSale(L,id)}),
    ...B.fences.map((f,i)=>act(L,{ic:'🤝',t:`Revendre à ${f.n}`,s:`${Math.round(Math.min(.78,f.cut+fenceBonus(B))*100)} % de la valeur · risque de piège ${Math.round(Math.min(.6,f.risk+B.heat/600)*100)} %`,dis:a.fakeKnown&&a.value<200?'Sans valeur':'',fn:L=>fenceSale(L,id,i)}))];
  return {title:a.name,html:card(CATS[a.cat]?CATS[a.cat].n:'Pièce',fmt(a.value),stateTxt(a))+note(`Payée ${fmt(a.paid||0)}. ${a.stolen?'Pièce chaude : la police pourrait la saisir lors d’une descente.':'Elle ne figure sur aucun registre de vol.'}`)
    +statLine('Attention de la police',B.heat)+group('Que faire ?',rows)};
}}
function pFences(){
  const L=cur();const B=ensure(L);
  const rows=B.fences.map(f=>row({ic:'🤝',t:f.n,s:`Rachète à ${Math.round(Math.min(.78,f.cut+fenceBonus(B))*100)} % · prudence ${f.risk<.06?'élevée':f.risk<.1?'moyenne':'faible'}`}));
  return {title:'Receleurs',html:note('Les receleurs changent chaque année. Plus ils paient, plus ils sont sujets à n’être pas ce qu’ils prétendent. Pour revendre, ouvre une pièce dans ta collection.')+group('Cette année',rows)
    +note(`Ta réputation (${Math.round(B.rep)} / 100) améliore leurs offres jusqu’à 8 points.`)};
}
function contraActs(L,B,k){
  const px=B.px,room=Math.max(0,600-stockUnits(B)),q=B.stock[k]||0,p=px[k];
  const buy=(n)=>act(L,{ic:'🟢',t:`Acheter ${n} unités`,s:fmt(p*n),cost:p*n,min:18,dis:room<n?'Entrepôt plein (600 unités max.)':'',fn:L=>{B.stock[k]=(B.stock[k]||0)+n;addHeat(B,R(1,3)*Math.ceil(n/10));track(L,'crimes');chg(L,{crime:R(1,2),karma:-1});return out(L,`Tu stockes ${n} unités : ${k.toLowerCase()}.`)}});
  const sell=(n,lab)=>act(L,{ic:'🔴',t:lab,s:q?fmt(p*Math.min(n,q)):'',dis:!q?'Rien en stock':'',fn:L=>{const m=Math.min(n,B.stock[k]||0);const g=m*p;B.stock[k]=(B.stock[k]||0)-m;if(B.stock[k]<=0)delete B.stock[k];earn(L,g,1);addHeat(B,R(2,5)*Math.ceil(m/20));track(L,'crimes');chg(L,{crime:R(1,3)});B.st.gained+=g;trackMax(L,'bmHeat',B.heat);return out(L,`Tu écoules ${m} unités de ${k.toLowerCase()} pour ${fmt(g)}.`)}});
  return [buy(10),buy(50),sell(10,'Revendre 10 unités'),sell(99999,`Tout revendre (${q})`)];
}
function pContra(){
  const L=cur();const B=ensure(L);const px=B.px;
  const room=Math.max(0,600-stockUnits(B));
  const trend=k=>{const b=BM_ITEMS[k][0];const d=Math.round((px[k]/b-1)*100);return d>=0?`▲ +${d} %`:`▼ ${d} %`};
  const rows=Object.keys(BM_ITEMS).map(k=>{const q=B.stock[k]||0;return row({ic:'📦',t:k,s:`${fmt(px[k])} l’unité · ${trend(k)}${q?` · stock ${q}`:''}`,right:'›',a:()=>pushPanel(()=>pContraItem(k))})});
  return {title:'Contrebande',html:note('Les prix changent chaque année : achète quand ça creuse, revends quand ça grimpe. Le stock dort dans une cave à Aubervilliers.')
    +card('Stock',fmt(stockValue(B)),`${stockUnits(B)} unités · ${room} places libres`,statLine('Attention de la police',B.heat))+group('Marchandises',rows)};
}
function pContraItem(k){
  const L=cur();const B=ensure(L);if(!BM_ITEMS[k])return {title:'Contrebande',html:note('Marchandise introuvable.')};
  return {title:k,html:card('Prix du jour',fmt(B.px[k]),`Stock : ${B.stock[k]||0} unités`)+group('Acheter ou revendre',contraActs(L,B,k))};
}

/* ---------- Évènements JSON ---------- */
const effects={
  invitation(L){const B=ensure(L);B.rep=Math.min(100,B.rep+10);return out(L,'✉️ Une carte de visite sans nom ni adresse glisse sous ta porte : « Salle des ventes, jeudi, 23 h. Venez seul. » Te voici dans la confidence.')},
  brocante(L,{prix}){
    const p=prix||400;L.money-=p;
    if(chance(.2)){const v=R(5000,30000);L.assets.push({id:nid(),kind:'art',name:'Gravure trouvée en brocante',value:v,paid:p,bm:1,cat:'V',stolen:0,fake:false,authenticated:false,real:v});chg(L,{happy:10});return out(L,`🖼️ Un expert l’identifie : une gravure rare estimée ${fmt(v)} ! Le brocanteur n’a pas l’air ravi.`)}
    chg(L,{happy:-2});return out(L,'🖼️ Tu rentres avec un cadre et un bon fou rire. Le tableau ne vaut pas le papier peint.')},
  chaleur(L,{d}){const B=ensure(L);addHeat(B,+d||0);return out(L,(+d||0)<0?'Les choses se calment : tu te sens moins observé.':'On t’a vu au mauvais endroit. L’attention de la police monte.')},
  jalousie(L){const B=ensure(L);addHeat(B,R(6,14));B.rep=Math.max(0,B.rep-5);return out(L,'🐀 Un concurrent jaloux te dénonce par lettre anonyme. L’attention de la police monte.')}
};
const conds={
  nouveau(L){return !(L.bm&&typeof L.bm==='object'&&(L.bm.rep>0||(L.bm.st&&L.bm.st.bought>0)))},
  chaud(L,{min}){return !!(L.bm&&L.bm.heat>=(min||20))}
};
const eventsDb=[
 {id:'blackmarket_invitation',category:'crime',icon:'✉️',once:true,conditions:{min_age:20,min_bank_balance:20000,mod_cond:{mod:MOD,fn:'nouveau'}},probability_weight:.02,
  prompt_text:'Un ancien collègue de golf te glisse une carte noire : « Si tu aimes les belles choses et que tu détestes les factures… »',
  choices:[{choice_text:'Accepter l’invitation',consequences:{mod_effect:{mod:MOD,fn:'invitation'}}},{choice_text:'Décliner poliment',consequences:{karma_modifier:2,result_text:'Tu ranges la carte. Ta conscience te remercie.'}}]},
 {id:'blackmarket_brocante',category:'finance',icon:'🖼️',conditions:{min_age:18,min_bank_balance:2000},probability_weight:.03,
  prompt_text:'Au vide-grenier de la place du marché, un tableau poussiéreux t’interpelle. Le vendeur en veut 400 €.',
  choices:[{choice_text:'Tenter le coup (400 €)',consequences:{mod_effect:{mod:MOD,fn:'brocante',args:{prix:400}}}},{choice_text:'Passer ton chemin',consequences:{happiness_modifier:1}}]},
 {id:'blackmarket_mouchard',category:'crime',icon:'🐀',conditions:{min_age:18,mod_state:'bm',mod_cond:{mod:MOD,fn:'chaud',args:{min:25}}},probability_weight:.12,
  prompt_text:'Un mouchard du quartier te lance un regard lourd de sous-entendus devant la boulangerie.',
  choices:[{choice_text:'Lui payer son silence (3 000 €)',consequences:{bank_balance_modifier:-3000,mod_effect:{mod:MOD,fn:'chaleur',args:{d:-12}}}},
           {choice_text:'Le menacer de partir sans un mot',consequences:{karma_modifier:-2,mod_effect:{mod:MOD,fn:'jalousie'}}},
           {choice_text:'L’ignorer',consequences:{mod_effect:{mod:MOD,fn:'chaleur',args:{d:6}}}}]}
];

/* ---------- Année ---------- */
function yearBm(L){
  if(!engaged(L))return;
  const B=ensure(L);const hot=myPieces(L).filter(pieceHot);
  const vol=stockUnits(B);
  addHeat(B,-(6+R(0,4))+Math.min(6,vol/200));
  const risk=Math.min(.45,(B.heat+hot.length*2)/220);
  if(B.heat>20&&!L.prison&&chance(risk)){
    B.st.raids++;
    const seized=hot.length;L.assets=L.assets.filter(a=>!(bmIsAsset(a)&&pieceHot(a)));
    B.stock={};B.heat=Math.floor(B.heat*.2);track(L,'crimes');chg(L,{karma:-2,stress:12});
    say(L,`🚨 Descente de police à l’aube !${seized?` ${seized} pièce${seized>1?'s':''} « chaude${seized>1?'s':''} » saisie${seized>1?'s':''} et ton stock de contrebande avec.`:' Ton stock de contrebande est saisi.'}`);
    trial(L,{n:'Recel',jail:[1,5],fine:15000,lawyer:12000});
  }
  // décote lente du dossier : le catalogue sera régénéré par ensure()
  if(B.foe>0&&chance(.2)){B.foe--;addHeat(B,R(3,7));say(L,'Un receleur rancunier fait courir des bruits sur ton compte.')}
}

/* ---------- Module ---------- */
registerMod({
  id:MOD,
  year:yearBm,
  events(L){
    if(!engaged(L))return 0;
    const B=ensure(L);let q=0;
    const fk=L.assets.filter(a=>bmIsAsset(a)&&a.fake&&!a.fakeKnown&&!a.authenticated&&(L.age-(a.boughtAge||L.age))>=1);
    if(fk.length&&chance(.22)){q++;fakeEvent(L,pick(fk))}
    const hot=myPieces(L).filter(pieceHot);
    if(hot.length&&B.heat>=15&&chance(.08+B.heat/600)){q++;stingEvent(L,pick(hot))}
    if((B.heat>=30||hot.length>1)&&chance(.08)){q++;tipEvent(L)}
    return q;
  },
  activities(L){return [{ic:'🕳️',t:'Marché noir',s:engaged(L)&&L.bm.heat>=60?'Enchères, receleurs… la police rôde':'Enchères clandestines, receleurs, contrebande',panel:pMain,min:18}]},
  assetRows(L){return [nav('🕳️','Marché noir',myPieces(L).length?`${myPieces(L).length} pièce(s) en collection`:'Enchères, contrebande et receleurs',pMain)]},
  assetDetailRows(L,a){return bmIsAsset(a)?[nav('🕳️','Vérifier, nettoyer, revendre',stateTxt(a),pPiece(a.id))]:[]},
  netWorth(L){try{return engaged(L)?Math.round(stockValue(L.bm)):0}catch(e){return 0}},
  badges(L){return engaged(L)&&L.bm.heat>=60?['🚨 Sous surveillance']:[]},
  jailed(L){if(engaged(L)){L.bm.heat=Math.floor((+L.bm.heat||0)/2)}},
  eventsDb,effects,conds
});
})();
