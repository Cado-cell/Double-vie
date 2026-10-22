/* Deux Vies — module « Mouvement spirituel » (id cult)
   Remplace la version simple de mod_legacy.js (L.cult = {name,fol,dev,heat,temple}) et migre son état.
   État par vie : L.cult = {name,fol,dev(ferveur),heat(attention des autorités),temple,
     docs[3 doctrines],est(0-4 domaine),tithe(0-30 %),loy(0-100),rival,convictions,q(évènements en attente),log[],since}
   Brouillon d’édition : L._cd (nom + doctrines en cours de choix). */
(()=>{
const MOD='cult';

/* ---------- Données ---------- */
const DOCS={
  cosmos:{n:'Énergies cosmiques',ic:'🌌',d:'Les astres parlent, le maître traduit. Les horoscopes sont inclus.',rec:.10,fer:6,tithe:.05,loy:0,heat:1},
  detox:{n:'Bien-être et détox',ic:'🥬',d:'Jus verts, jeûnes et cristaux. Les médecins froncent les sourcils.',rec:.25,fer:0,tithe:.10,loy:-1,heat:2},
  prosp:{n:'Évangile de la prospérité',ic:'💰',d:'Plus tu donnes, plus l’univers te le rend. Surtout à nous.',rec:.15,fer:0,tithe:.35,loy:-2,heat:5},
  apoc:{n:'Fin du monde jeudi prochain',ic:'☄️',d:'Date repoussée chaque fois, mais la ferveur reste intacte.',rec:.20,fer:12,tithe:.10,loy:3,heat:5},
  terre:{n:'Retour à la terre',ic:'🌱',d:'Potager, chèvres et sobriété. Peu d’argent, beaucoup de cohésion.',rec:-.05,fer:4,tithe:-.15,loy:4,heat:-2},
  anciens:{n:'Sagesse des anciens',ic:'🔮',d:'Rituels hérités d’une grand-mère druide, ou presque.',rec:0,fer:3,tithe:0,loy:2,heat:0},
  num:{n:'Éveil numérique',ic:'📲',d:'Méditation guidée par application et pensée positive en abonnement.',rec:.30,fer:-4,tithe:.10,loy:-3,heat:2},
  silence:{n:'Vœu de silence',ic:'🤫',d:'On ne dit rien, on paie en regards. Très discret, très fidèle.',rec:-.15,fer:8,tithe:-.05,loy:6,heat:-3}
};
const DKEYS=Object.keys(DOCS);
const ESTATES=[
  {n:'Salle des fêtes louée',ic:'🪑',cap:25,cost:0,up:5000,val:0,req:0,d:'Chaises pliantes, néon blafard et vin chaud après la séance.'},
  {n:'Maison communautaire',ic:'🏠',cap:80,cost:180000,up:16000,val:150000,req:15,d:'Une grande bâtisse de banlieue : dortoirs, cuisine collective et planning des tâches.'},
  {n:'Domaine à la campagne',ic:'🏡',cap:250,cost:650000,up:42000,val:560000,req:50,d:'Un château un peu fatigué entouré de champs, avec une chapelle désaffectée.'},
  {n:'Temple',ic:'🏛️',cap:800,cost:2200000,up:110000,val:1900000,req:150,d:'Un édifice monumental en forme de tournesol. Le parking est complet les jours de fête.'},
  {n:'Cité idéale',ic:'🌇',cap:3000,cost:9000000,up:340000,val:7600000,req:500,d:'Un village entier consacré à la Lumière, avec boulangerie spirituelle et mairie dissidente.'}
];
const CHANNELS=[
  {k:'cu_tr',ic:'📄',t:'Tracts dans les boîtes aux lettres',cost:300,base:[2,8],heat:1,s:'Peu cher, peu visible'},
  {k:'cu_cf',ic:'🎤',t:'Conférence gratuite',cost:2500,base:[8,24],heat:2,s:'Salle des fêtes, buffet et diaporama'},
  {k:'cu_rs',ic:'📱',t:'Campagne sur les réseaux sociaux',cost:1500,base:[6,50],heat:3,fame:1,s:'Rendement très variable, signalements fréquents'},
  {k:'cu_sg',ic:'🧘',t:'Stage de bien-être',cost:9000,base:[15,40],heat:5,stage:1,s:'Week-end « lâcher-prise » : rapporte et recrute'},
  {k:'cu_bo',ic:'🗣️',t:'Bouche-à-oreille des fidèles',cost:0,base:[1,6],heat:0,wom:1,s:'Gratuit, discret, dépend de la loyauté'}
];
const SERMONS=['Ton sermon sur la patience des tournesols fait pleurer le premier rang.','Tu parles une heure de la lumière intérieure. Personne ne regarde sa montre, ou presque.','Tu improvises une parabole sur un hérisson et une trottinette. Standing ovation.','Tu fais respirer toute la salle en rythme. Quelqu’un s’endort, tu dis que c’est un signe.','Tu cites un philosophe imaginaire, et tout le monde note religieusement.'];
const PRE=['Association','Cercle','Voie','Sanctuaire','Fraternité','Alliance','Ordre','Collectif'];
const POST=['du Tournesol levant','de l’Écho serein','des Marées intérieures','de la Clarté retrouvée','du Souffle premier','des Veilleurs de l’aube','de la Lumière tranquille','du Grand Silence joyeux','des Sources vives'];

const evn=v=>Array.isArray(v)?R(v[0],v[1]):v;
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const genName=()=>`${pick(CULT_A||PRE)} ${pick(CULT_B||POST)}`;
const genName2=()=>chance(.5)?genName():`${pick(PRE)} ${pick(POST)}`;

/* ---------- État ---------- */
function st(L){
  const C=L&&L.cult;if(!C||typeof C!=='object')return null;
  C.name=String(C.name||'Mouvement sans nom');
  C.fol=Math.max(0,Math.round(+C.fol||0));
  C.dev=clampN(Math.round(C.dev==null?50:+C.dev),0,100);
  C.heat=clampN(Math.round(+C.heat||0),0,100);
  if(typeof C.est!=='number'||C.est<0||C.est>4)C.est=C.temple?3:0;
  if(C.temple&&C.est<3)C.est=3;
  C.temple=C.est>=3?1:0;
  if(!Array.isArray(C.docs))C.docs=[];
  C.docs=C.docs.filter(k=>DOCS[k]).slice(0,3);
  C.tithe=clampN(Math.round(C.tithe==null?10:+C.tithe),0,30);
  C.loy=clampN(Math.round(C.loy==null?C.dev:+C.loy),0,100);
  if(C.rival&&typeof C.rival!=='object')C.rival=null;
  if(C.rival){C.rival.fol=Math.max(0,Math.round(+C.rival.fol||0));C.rival.name=String(C.rival.name||'Un mouvement dissident')}
  C.convictions=+C.convictions||0;
  if(!Array.isArray(C.q))C.q=[];
  if(!Array.isArray(C.log))C.log=[];
  if(typeof C.since!=='number')C.since=L.age;
  return C;
}
function lg(L,C,t){C.log.push(`${L.age} ans : ${t}`);if(C.log.length>10)C.log.shift()}
function dm(C){const m={rec:0,fer:0,tithe:0,loy:0,heat:0};for(const k of C.docs){const d=DOCS[k];if(d)for(const x in m)m[x]+=d[x]}return m}
const capOf=C=>ESTATES[C.est].cap;
const sgn=n=>(n>0?'+':n<0?'−':'')+Math.abs(n);
const pc=n=>(n>0?'+':n<0?'−':'')+Math.abs(Math.round(n*100))+' %';
function modTxt(d){return `Recrutement ${pc(d.rec)} · Ferveur ${sgn(d.fer)} · Dons ${pc(d.tithe)} · Loyauté ${sgn(d.loy)} · Autorités ${sgn(d.heat)}`}
const adj=(C,k,v)=>{C[k]=clampN(Math.round(C[k]+v),0,100)};
/* revenu annuel prévu (hors événements) */
function proj(L,C){
  const m=dm(C);const per=(35+70*C.tithe)*(C.loy/100)*(.5+C.dev/100)*(1+m.tithe);
  return Math.max(0,Math.round(C.fol*per*(L.prison>0?.4:1)));
}
function join(L,C,n){
  n=Math.max(0,Math.round(n));const room=Math.max(0,capOf(C)-C.fol);n=Math.min(n,room);
  if(n>0){C.loy=Math.round((C.loy*C.fol+60*n)/(C.fol+n));C.fol+=n;trackMax(L,'followers',C.fol)}
  return n;
}

/* ---------- Création et édition ---------- */
function draft(L,mode){
  let d=L._cd;
  if(!d||d.mode!==mode){const C=st(L);d=L._cd={mode,name:mode==='edit'&&C?C.name:genName2(),docs:mode==='edit'&&C?C.docs.slice():[]}}
  if(!Array.isArray(d.docs))d.docs=[];
  return d;
}
function syncName(d){const el=typeof document!=='undefined'?document.getElementById('cu-name'):null;if(el&&typeof el.value==='string')d.name=el.value}
function nameOf(d){const n=String(d.name||'').trim().slice(0,50);return n||genName2()}
function pEditor(mode){
  return ()=>{
    const L=cur();const d=draft(L,mode);const found=mode==='found';
    const sel=d.docs;
    const rows=DKEYS.map(k=>{const D=DOCS[k];const on=sel.includes(k);
      return row({ic:D.ic,t:D.n+(on?'  ✓':''),s:`${D.d} ${modTxt(D)}`,dis:!on&&sel.length>=3,a:()=>{syncName(d);run(()=>{const i=d.docs.indexOf(k);if(i>=0)d.docs.splice(i,1);else if(d.docs.length<3)d.docs.push(k);return ''})}})});
    const total=sel.reduce((m,k)=>{const D=DOCS[k];for(const x in m)m[x]+=D[x];return m},{rec:0,fer:0,tithe:0,loy:0,heat:0});
    const go=found
      ?act(L,{ic:'🕯️',t:'Fonder le mouvement',s:'5 000 € de frais de lancement : statuts, tampon, cierges',min:21,cost:5000,dis:sel.length<3?'Choisis 3 doctrines':'',fn:L=>{
          syncName(d);const nm=nameOf(d);
          L.cult={name:nm,fol:R(3,12),dev:50,heat:0,est:0,temple:0,docs:sel.slice(0,3),tithe:10,loy:62,rival:null,convictions:0,q:[],log:[],since:L.age};
          const C=st(L);L._cd=null;STACK.pop();trackMax(L,'followers',C.fol);lg(L,C,'fondation du mouvement');
          return out(L,`🕯️ Tu fondes ${nm}. Les premières chaises pliantes sont déjà dans le coffre de ta voiture.`)}})
      :act(L,{ic:'📜',t:'Appliquer la réforme doctrinale',s:'15 000 € : nouvelle brochure, nouvelle cérémonie, nouveaux mécontents',cost:15000,key:'cu_ref',dis:sel.length<3?'Choisis 3 doctrines':'',fn:L=>{
          const C=st(L);syncName(d);const nm=nameOf(d);
          const changed=sel.slice().sort().join()!==C.docs.slice().sort().join();
          const renamed=nm!==C.name;
          C.docs=sel.slice(0,3);if(renamed)C.name=nm;
          if(changed){adj(C,'loy',-R(6,12));adj(C,'dev',R(-4,6))}
          L._cd=null;STACK.pop();lg(L,C,changed?'réforme doctrinale':'nouveau nom');
          return out(L,changed?`📜 La doctrine de ${C.name} est remaniée. Quelques fidèles regrettent l’ancienne brochure.`:`📜 Le mouvement s’appelle désormais ${C.name}. Il faut refaire les tampons.`)}});
    const html=note(found?'Donne un nom à ton mouvement et choisis les trois doctrines qui en feront le charme (et les ennuis).':'Tu peux rebaptiser le mouvement ou réformer sa doctrine. Un changement de doctrine ébranle la loyauté.')
      +`<div class="card"><label class="f">Nom du mouvement<input id="cu-name" value="${esc(d.name)}" maxlength="50" autocomplete="off"></label></div>`
      +group('',[row({ic:'🎲',t:'Générer un nom',s:'Le générateur de la Lumière intérieure',a:()=>run(()=>{d.name=genName2();return ''})})])
      +card('Doctrines',`${sel.length} / 3`,sel.length?modTxt(total):'Aucune doctrine choisie')
      +group('Doctrines disponibles',rows)
      +group('',[go]);
    return {title:found?'Fonder un mouvement':'Doctrine et nom',html,after:b=>{const i=b.querySelector('#cu-name');if(i)i.oninput=()=>{d.name=i.value}}};
  };
}

/* ---------- Panneaux ---------- */
function pMain(){
  const L=cur();const C=st(L);
  if(!C){
    return {title:'Mouvement spirituel',html:note('Fonde ton propre mouvement : nom, doctrines, adeptes, domaine. Tu récolteras des dons… et l’attention de la Miviludes. Satire garantie, sectarisme déconseillé.')
      +group('Fonder',[act(L,{ic:'🕯️',t:'Fonder un mouvement',s:'Nom, trois doctrines, 5 000 €',min:21,nav:pEditor('found')})])};
  }
  const E=ESTATES[C.est];const m=dm(C);const inc=proj(L,C);
  const html=card(C.name,`${fmtn(C.fol)} adepte${C.fol>1?'s':''} / ${fmtn(E.cap)}`,`${E.n} · dons ${C.tithe} % · revenus prévus ${fmt(inc)} par an, entretien ${fmt(E.up)}`,statLine('Loyauté',C.loy)+statLine('Ferveur',C.dev)+statLine('Attention des autorités',C.heat))
    +(C.docs.length<3?group('Doctrine incomplète',[nav('📜','Définir la doctrine','Choisis tes trois doctrines et rebaptise éventuellement le mouvement',pEditor('edit'))]):'')
    +(C.docs.length?card('Doctrine',C.docs.map(k=>DOCS[k].n).join(' · '),modTxt(m)):'')
    +(C.rival?card('Mouvement rival',C.rival.name,`${fmtn(C.rival.fol)} adepte${C.rival.fol>1?'s':''} : ils débauchent les tiens`):'')
    +group('Gérer',[
      nav('📢','Recrutement','Tracts, conférences, réseaux, stages, bouche-à-oreille',pRecruit),
      nav('💶','Dons des fidèles',`Part de leur argent : ${C.tithe} %`,pTithe),
      nav(E.ic,'Domaine',`${E.n} · ${fmtn(E.cap)} places`,pEstate),
      nav('📜','Doctrine et nom','Rebaptiser ou réformer',pEditor('edit'))])
    +group('Vie spirituelle',[
      act(L,{ic:'🙏',t:'Prononcer un sermon',s:'Loyauté et ferveur',key:'cu_ser',fn:L=>{const C=st(L);adj(C,'loy',R(3,8));adj(C,'dev',R(3,8));chg(L,{happy:2});return out(L,'🙏 '+pick(SERMONS))}}),
      act(L,{ic:'🕯️',t:'Cérémonie collective',s:`${fmt(1500*(1+C.est))} : bougies, encens, buffet`,cost:1500*(1+C.est),key:'cu_cer',dis:C.fol<3?'Il faut au moins quelques adeptes':'',fn:L=>{const C=st(L);adj(C,'loy',R(4,9));adj(C,'dev',R(2,6));const g=Math.round(C.fol*R(8,25)*(L.prison>0?0:1));earn(L,g);adj(C,'heat',1);return out(L,`🕯️ La cérémonie rapporte ${fmt(g)} de dons spontanés. Le buffet, lui, s’est évaporé.`)}}),
      act(L,{ic:'⛰️',t:'Retraite initiatique',s:'3 000 € : une semaine en Ardèche, tarif tout compris',cost:3000,key:'cu_ret',dis:C.fol<5?'Pas assez d’adeptes':'',fn:L=>{const C=st(L);const g=Math.round(C.fol*R(50,160)*(.4+C.loy/160));earn(L,g);adj(C,'heat',5);adj(C,'dev',R(2,7));return out(L,`⛰️ Une semaine de silence et de soupe aux orties rapporte ${fmt(g)}.`)}}),
      act(L,{ic:'🤝',t:'Œuvres caritatives',s:'12 000 € : soupe populaire au nom du mouvement',cost:12000,key:'cu_oeu',fn:L=>{const C=st(L);adj(C,'heat',-R(6,12));chg(L,{karma:3,fame:1});adj(C,'loy',2);return out(L,'🤝 Ta soupe populaire fait bonne impression. Le journal local parle de « générosité ».')}}),
      act(L,{ic:'🧹',t:'Faire profil bas',s:'Moins de bruit, moins de regards',key:'cu_bas',fn:L=>{const C=st(L);adj(C,'heat',-R(8,15));return out(L,'🧹 Tu supprimes les affiches, les posts et les capes. Les autorités s’endorment.')}}),
      act(L,{ic:'📖',t:'Écrire un livre',s:'4 000 € : « Mon chemin vers la Lumière (et la TVA) »',cost:4000,key:'cu_liv',fn:L=>{const C=st(L);const ok=chance(.45+L.st.smarts/250);if(ok){const g=R(2000,25000);earn(L,g);chg(L,{fame:R(1,4)});const n=join(L,C,R(5,30));adj(C,'dev',3);return out(L,`📖 Ton livre se vend dans les gares : ${fmt(g)} de droits et ${n} nouvelle${n>1?'s':''} recrue${n>1?'s':''}.`)}chg(L,{happy:-3});return out(L,'📖 Ton livre finit au rayon « développement personnel », entre deux méthodes de rangement.')}}),
      act(L,{ic:'📺',t:'Passer à la télévision',s:L.fame>=15?'Plateau du matin, risque de question piège':'Il faut un peu de notoriété (15 %)',dis:L.fame>=15?'':'Notoriété insuffisante',key:'cu_tv',fn:L=>{const C=st(L);chg(L,{fame:R(2,6)});adj(C,'heat',R(5,12));const n=join(L,C,R(15,60)*(1+L.fame/80));return out(L,`📺 Face caméra, tu restes zen. ${n} téléspectateur${n>1?'s':''} rejoin${n>1?'nent':'t'} le mouvement ; la Miviludes aussi a regardé.`)}})])
    +(C.rival?group('Rival',[
      act(L,{ic:'🕊️',t:'Négocier la réconciliation',s:'10 000 € : médiation et tisane',cost:10000,key:'cu_rec',fn:L=>{const C=st(L);if(!C.rival)return '';if(chance(.35+C.loy/200)){const g=Math.round(C.rival.fol*.6);const n=join(L,C,g);const nm=C.rival.name;C.rival=null;lg(L,C,'réconciliation avec les dissidents');return out(L,`🕊️ ${nm} se rallie au mouvement : ${n} adepte${n>1?'s':''} reviennent, un peu gênés.`)}return out(L,'🕊️ La médiation échoue. Le rival reste sur ses positions et sur le buffet.')}}),
      act(L,{ic:'📞',t:'Signaler le rival aux autorités',s:'Karma en baisse, mais lui aussi aura des ennuis',key:'cu_den',fn:L=>{const C=st(L);if(!C.rival)return '';chg(L,{karma:-6});if(chance(.5)){const nm=C.rival.name;C.rival=null;adj(C,'heat',4);lg(L,C,'le rival est démantelé');return out(L,`📞 La brigade s’intéresse à ${nm}, qui se dissout dans la discrétion.`)}C.rival.fol=Math.round(C.rival.fol*.7);adj(C,'loy',-3);return out(L,'📞 Ta dénonciation fait jaser : on t’accuse de jalousie spirituelle.')}})]):'')
    +(C.log.length?group('Journal du mouvement',C.log.slice(-5).reverse().map(t=>`<p class="note">${esc(t)}</p>`)):'')
    +group('',[row({ic:'🚪',t:'Dissoudre le mouvement',s:'Définitif',danger:1,a:()=>pushPanel(confirmP('Dissoudre le mouvement ?',C.est>0?'Tes adeptes devront trouver une autre lumière. Le domaine sera revendu au prix du marché : tu en tires 70 % de sa valeur.':'Tes adeptes devront trouver une autre lumière.',()=>{const c=st(L);if(!c)return '';const g=Math.round(ESTATES[c.est].val*.7);if(g>0)L.money+=g;L.cult=null;L._cd=null;chg(L,{karma:4});return out(L,`🚪 Tu dissous le mouvement.${g>0?` Le domaine est revendu ${fmt(g)}.`:''} Les adeptes te remercient, une larme à l’œil.`)}))})]);
  return {title:C.name,html};
}

function pRecruit(){
  const L=cur();const C=st(L);if(!C)return {title:'Recrutement',html:note('Aucun mouvement.')};
  const m=dm(C);
  const rows=CHANNELS.map(ch=>act(L,{ic:ch.ic,t:ch.t,s:`${ch.cost?fmt(ch.cost):'Gratuit'} · ${ch.base[0]} à ${ch.base[1]} recrues · ${ch.s}`,cost:ch.cost,key:ch.k,
    dis:C.fol>=capOf(C)?'Domaine complet : agrandis-le':(ch.wom&&C.fol<5?'Il faut au moins 5 adeptes':''),
    fn:L=>{
      const C=st(L);const m=dm(C);
      let n=R(ch.base[0],ch.base[1])*(1+m.rec)*(.6+L.st.looks/150);
      if(ch.fame)n*=1+L.fame/40;
      if(ch.wom)n*=.4+C.loy/60;
      if(ch.stage){const g=Math.round(R(15,40)*R(150,420));earn(L,g);}
      n=join(L,C,Math.max(1,Math.round(n)));
      adj(C,'heat',ch.heat+(chance(.2)?R(0,3):0));
      let t;
      if(n===0)t=`${ch.ic} Il n’y a plus de place au domaine : les nouveaux repartent déçus.`;
      else t=`${ch.ic} ${pick(['Les passants hésitent, puis certains te suivent.','Quelqu’un demande si c’est gratuit. Il reste.','Le message circule dans les chats de quartier.','Une dame au regard clair sort son chéquier.'])} ${n} nouvelle${n>1?'s':''} recrue${n>1?'s':''}.`;
      if(ch.stage)t+=' Le stage a aussi fait rentrer quelques euros.';
      if(ch.fame&&chance(.15)){adj(C,'heat',R(4,9));t+=' Un internaute vigilant te signale.';}
      return out(L,t);
    }}));
  return {title:'Recrutement',html:note(`${C.fol} / ${capOf(C)} adeptes. Rendement doctrinal : ${pc(m.rec)}. Chaque canal ne se pratique qu’une fois par an. Les gros canaux attirent l’attention.`)+group('Canaux',rows)};
}

function pTithe(){
  const L=cur();const C=st(L);if(!C)return {title:'Dons des fidèles',html:note('Aucun mouvement.')};
  const rows=[0,5,10,15,20,25,30].map(t=>row({ic:t===C.tithe?'✅':'💶',t:`${t} %`,s:t===0?'Dons libres : fidélité maximale':t<=10?'Participation raisonnable':t<=20?'Les fidèles serrent la ceinture':'Les fidèles mangent des pâtes, toi du caviar',dis:t===C.tithe,a:()=>run(()=>{const c=st(L);const dd=t-c.tithe;c.tithe=t;adj(c,'loy',-dd*.5);lg(L,c,`dons fixés à ${t} %`);return out(L,dd>0?`💶 Tu demandes plus aux fidèles : ${t} %. Quelques fronts se plissent.`:`💶 Tu demandes moins aux fidèles : ${t} %. Soupirs de soulagement.`)})}));
  return {title:'Dons des fidèles',html:card('Part demandée',`${C.tithe} %`,`Revenus prévus : ${fmt(proj(L,C))} par an`,statLine('Loyauté',C.loy))+note('Demander beaucoup aux fidèles gonfle les revenus mais use leur loyauté chaque année. En dessous de 30 % de loyauté, la mutinerie rôde. Au-dessus de 15 %, les autorités commencent à compter.')+group('Part de leur argent',rows)};
}

function pEstate(){
  const L=cur();const C=st(L);if(!C)return {title:'Domaine',html:note('Aucun mouvement.')};
  const cur_=ESTATES[C.est];
  const rows=ESTATES.map((E,i)=>{
    if(i<C.est)return row({ic:E.ic,t:E.n,s:'Dépassé',dis:true,a:()=>{}});
    if(i===C.est)return row({ic:'✅',t:E.n+' (actuel)',s:`${fmtn(E.cap)} places · entretien ${fmt(E.up)} par an`,dis:true,a:()=>{}});
    const nxt=i===C.est+1;
    return act(L,{ic:E.ic,t:E.n,s:`${fmt(E.cost)} · ${fmtn(E.cap)} places · entretien ${fmt(E.up)} par an. ${E.d}`,cost:E.cost,
      dis:!nxt?'Une étape à la fois':C.fol<E.req?`Il faut au moins ${E.req} adeptes`:'',
      fn:L=>{const c=st(L);c.est=i;c.temple=i>=3?1:0;adj(c,'dev',R(5,12));adj(c,'loy',R(3,7));adj(c,'heat',i>=3?R(4,9):R(1,4));lg(L,c,`installation : ${E.n}`);STACK.pop();
        return out(L,`${E.ic} ${C.name} s’installe : ${E.n}. ${i>=3?'Les voisins ont déjà écrit à la mairie.':'Les adeptes apportent des chaises.'}`)}});
  });
  return {title:'Domaine',html:card(cur_.n,`${fmtn(C.fol)} / ${fmtn(cur_.cap)} places`,`Valeur ${fmt(cur_.val)} · entretien ${fmt(cur_.up)} par an`)+note('Un domaine plus grand accueille plus d’adeptes et réconforte les fidèles, mais coûte cher en entretien. Si le mouvement dépasse sa capacité, les adeptes s’entassent et la loyauté en souffre.')+group('Améliorations',rows)};
}

/* ---------- Année ---------- */
function year(L){
  const C=st(L);if(!C)return;
  const m=dm(C),E=ESTATES[C.est],jail=L.prison>0;
  /* entretien */
  spend(L,E.up);
  if(L.money<0){adj(C,'loy',-6);lg(L,C,'arriérés d’entretien');say(L,`🕯️ ${C.name} n’a plus de quoi payer l’entretien de ${E.n.toLowerCase()}. Les adeptes se cotisent, ça grince.`)}
  /* loyauté */
  const over=Math.max(0,C.fol-capOf(C));
  let d=3+m.loy-C.tithe*.45+(C.dev-50)/12+C.est*1.2-(over/Math.max(1,capOf(C)))*30+R(-4,4);
  if(jail)d-=15;if(C.rival&&C.rival.fol>0)d-=2;if(C.heat>70)d-=3;
  adj(C,'loy',d);
  adj(C,'dev',(50+m.fer+(C.loy-50)/4-C.dev)*.25+R(-2,2));
  /* adeptes */
  const before=C.fol;
  if(C.fol>0){
    if(C.loy>=60&&!jail){const g=Math.round(C.fol*(.03+Math.max(0,m.rec)*.05)*(C.loy-50)/50+R(0,3));join(L,C,g)}
    else if(C.loy<40)C.fol=Math.max(0,C.fol-Math.round(C.fol*(40-C.loy)/200+R(0,2)));
    if(jail)C.fol=Math.max(0,Math.round(C.fol*.9));
    if(C.fol>capOf(C)){C.fol=capOf(C)}
  }
  if(C.rival){
    C.rival.fol=Math.round(C.rival.fol*1.05+R(0,2));
    if(C.fol>0&&chance(.3)){const n=Math.min(C.fol,Math.max(1,Math.round(C.fol*.04)));C.fol-=n;C.rival.fol+=n;say(L,`🕯️ ${n} adepte${n>1?'s':''} passe${n>1?'nt':''} chez ${C.rival.name}.`)}
    if(C.rival.fol<=0)C.rival=null;
  }
  trackMax(L,'followers',C.fol);
  /* revenus récurrents */
  const inc=proj(L,C);
  if(inc>0){earn(L,inc);say(L,`🕯️ ${C.name} : ${fmt(inc)} de dons cette année pour ${fmtn(C.fol)} adepte${C.fol>1?'s':''}.`)}
  if(C.loy>=80&&C.fol>=10&&!jail&&chance(.25)){const g=R(10000,60000)*(1+C.est);earn(L,g,1);say(L,`🕯️ Une fidèle lègue ${fmt(g)} au mouvement. Ses neveux sont moins enthousiastes.`)}
  if(C.fol>before+8)say(L,`🕯️ ${C.name} s’agrandit : +${C.fol-before} adeptes.`);
  else if(C.fol<before-5)say(L,`🕯️ ${C.name} perd ${before-C.fol} adeptes cette année.`);
  /* attention des autorités */
  adj(C,'heat',C.fol/250+m.heat+Math.max(0,C.tithe-12)*.35+(C.loy<40?3:0)+(C.est>=3?1.5:0)+(inc>400000?2:0)-4);
  /* évènements en attente (consommés par events) */
  C.q=[];
  if(C.heat>=60&&chance(.15+(C.heat-60)/120))C.q.push(inc>300000&&chance(.5)?'fisc':'probe');
  else if(C.loy<30&&C.fol>=10&&chance(.45))C.q.push('mutiny');
  if(C.fol<=0){say(L,`🕯️ Plus un seul adepte : ${C.name} n’existe plus que sur le papier.`)}
}

/* ---------- Enquête et mutinerie ---------- */
function probe(L,C,kind){
  const fin=kind==='fisc';
  const tit=fin?'Brigade financière':'Miviludes';
  const txt=fin?`Des enquêteurs de la brigade financière épluchent les comptes de ${C.name} : dons, travaux du domaine. On te convoque.`:`La Miviludes a reçu plusieurs signalements sur ${C.name}. Deux enquêteurs frappent à la porte, un dossier sous le bras.`;
  const m=dm(C);
  const base=clampN(.72-C.heat/190-Math.max(0,C.tithe-15)*.01-m.heat*.02,.1,.8);
  const end=(L,ok,boost)=>{
    if(chance(clampN(base+boost,.05,.92))){C.heat=Math.max(20,C.heat-25);lg(L,C,'enquête classée');adj(C,'dev',3);return out(L,fin?'⚖️ Les comptes tiennent la route, ou presque. Dossier classé.':'⚖️ Les enquêteurs ne trouvent rien de caractérisé. Dossier classé, soupirs de soulagement.')}
    C.heat=35;lg(L,C,'mis en examen pour abus de faiblesse');say(L,'🚨 L’enquête débouche sur des poursuites pour abus de faiblesse.');
    trial(L,{n:'Abus de faiblesse',jail:[1,5],fine:50000,lawyer:30000});return '';
  };
  const ch=[
    {t:'Tout leur montrer, thé et gâteaux à l’appui',pri:1,fn:()=>{chg(L,{karma:2});return end(L,1,C.tithe<=10?.08:-.05)}},
    {t:'Nier en bloc et crier à la persécution',fn:()=>{adj(C,'loy',6);adj(C,'dev',8);return end(L,0,-.15)}},
    {t:'Dissoudre le mouvement en urgence',danger:1,fn:()=>{L.cult=null;L._cd=null;chg(L,{karma:2});return out(L,'🚪 Tu dissous le mouvement avant la fin de l’audition. Les enquêteurs n’ont plus qu’à fermer leur dossier.')}}
  ];
  if(L.money>=30000)ch.splice(1,0,{t:`Engager un avocat spécialisé (${fmt(30000)})`,fn:()=>{L.money-=30000;return end(L,1,.22)}});
  modal({title:tit,icon:'🚨',text:txt,choices:ch});
  return 1;
}
function mutiny(L,C){
  const lost=Math.max(1,Math.round(C.fol*R(20,40)/100));
  const rn=genName2();
  const mk=n=>{C.fol=Math.max(0,C.fol-n);C.rival={name:rn,fol:(C.rival?C.rival.fol:0)+n};lg(L,C,`schisme : ${rn}`)};
  modal({title:'Mutinerie',icon:'🔥',text:`La coupe est pleine. Un groupe d’adeptes, mené par un ancien trésorier, exige des comptes et des dons moins lourds. Il menace de fonder son propre mouvement, avec un meilleur buffet.`,choices:[
    {t:'Faire des concessions : dons réduits',pri:1,fn:()=>{C.tithe=Math.max(0,C.tithe-5);adj(C,'loy',R(12,20));chg(L,{karma:2});lg(L,C,'concessions aux mutins');return out(L,'🕊️ Tu demandes moins d’argent et promets plus de transparence. Le calme revient, le coffre un peu moins plein.')}},
    {t:'Réprimer : excommunier les meneurs',danger:1,fn:()=>{chg(L,{karma:-5});if(chance(.5)){const n=Math.max(1,Math.round(lost/2));mk(n);adj(C,'heat',R(5,12));return out(L,`🔥 Les meneurs claquent la porte avec ${n} fidèles et créent ${rn}. Ils parlent déjà à la presse.`)}adj(C,'loy',-5);adj(C,'dev',R(3,8));return out(L,'🔥 La menace d’excommunication fait taire la salle. Pour l’instant.')}},
    {t:'Les laisser partir',fn:()=>{mk(lost);adj(C,'loy',R(8,14));return out(L,`🚶 ${lost} adepte${lost>1?'s':''} partent fonder ${rn}. Ceux qui restent n’en sont que plus fervents.`)}}
  ]});
  return 1;
}

/* ---------- Évènements dynamiques ---------- */
function can(L,n){return L.money>=n}
const RANDOM=[
  {id:'journaliste',w:C=>C.fol>=15,run:(L,C)=>({title:'Un journaliste',icon:'🎙️',text:`Un journaliste d’une grande émission d’enquête demande à suivre une journée de ${C.name}, « en toute neutralité ».`,choices:[
    {t:'Accepter l’interview',fn:()=>{chg(L,{fame:R(2,6)});if(chance(.5)){const n=join(L,C,R(10,40));adj(C,'heat',R(2,6));return out(L,`🎙️ Reportage plutôt flatteur : ${n} nouvelle${n>1?'s':''} recrue${n>1?'s':''}.`)}adj(C,'heat',R(8,16));adj(C,'loy',-4);return out(L,'🎙️ Le montage est cruel : on te voit réciter ta brochure en bermuda. Les signalements pleuvent.')}},
    {t:'Refuser poliment',fn:()=>{adj(C,'heat',2);return out(L,'🎙️ Tu fermes la porte. Le journaliste dira que tu as « refusé de répondre ».')}}]})},
  {id:'exadepte',w:C=>C.fol>=10&&C.heat>=20,run:(L,C)=>({title:'Un ex-adepte',icon:'📣',text:'Un ancien adepte raconte sur les réseaux qu’il a laissé ses économies au mouvement et qu’on lui a ensuite « suggéré » de ne plus voir sa famille.',choices:[
    ...(can(L,10000)?[{t:'Proposer un geste financier (10 000 €)',fn:()=>{L.money-=10000;adj(C,'heat',-R(4,8));chg(L,{karma:3});return out(L,'📣 Il retire sa publication. Un peu tard pour la bonne image, mais ça aide.')}}]:[]),
    {t:'Ne rien dire',fn:()=>{adj(C,'heat',R(5,10));adj(C,'loy',-R(2,5));return out(L,'📣 La vidéo dépasse les 300 000 vues. Les adeptes se posent des questions.')}},
    {t:'Publier un démenti vibrant',fn:()=>{if(chance(.5)){adj(C,'loy',4);return out(L,'📣 Ton démenti rassure les fidèles et agace tous les autres.')}adj(C,'heat',R(6,12));return out(L,'📣 Ton démenti est repris par les moqueurs de la toile.')}}]})},
  {id:'donateur',w:C=>C.fol>=8,run:(L,C)=>({title:'Un généreux donateur',icon:'🎁',text:'Un retraité fortuné propose de vous léguer une grosse somme, à condition de « ne pas en parler à ses enfants ».',choices:[
    {t:'Accepter le don',fn:()=>{const g=R(20000,150000);earn(L,g,1);adj(C,'heat',R(5,10));chg(L,{karma:-4});return out(L,`🎁 Tu encaisses ${fmt(g)}. Les enfants, eux, ont engagé un avocat.`)}},
    {t:'Refuser et le conseiller sur la prudence',fn:()=>{chg(L,{karma:6,happy:3});adj(C,'heat',-2);return out(L,'🎁 Tu refuses. Le vieux monsieur te regarde avec respect et finit par donner à la SPA.')}}]})},
  {id:'voisins',w:C=>C.est>=1,run:(L,C)=>({title:'Voisins mécontents',icon:'🏘️',text:`Les voisins du domaine se plaignent des chants à 5 h du matin, des camionnettes et de l’odeur d’encens. La mairie s’en mêle.`,choices:[
    ...(can(L,6000)?[{t:'Offrir un déjeuner de réconciliation (6 000 €)',fn:()=>{L.money-=6000;adj(C,'heat',-R(2,6));return out(L,'🏘️ La paella fait des miracles de voisinage.')}}]:[]),
    {t:'Passer en force',fn:()=>{adj(C,'heat',R(5,10));adj(C,'loy',2);return out(L,'🏘️ Le conflit s’envenime. Un panneau « Secte, dehors » apparaît sur la haie.')}},
    {t:'Chanter plus bas',fn:()=>{adj(C,'dev',-3);return out(L,'🏘️ Les chants se font murmures. Les adeptes regrettent un peu la ferveur.')}}]})},
  {id:'miracle',w:C=>C.fol>=10,run:(L,C)=>({title:'Un miracle ?',icon:'✨',text:'Un adepte jure que sa migraine a disparu en regardant ta photo. Trois autres affirment avoir vu un halo autour de la machine à café.',choices:[
    {t:'En faire grand bruit',fn:()=>{adj(C,'dev',R(6,12));const n=join(L,C,R(5,25));adj(C,'heat',R(3,7));chg(L,{karma:-3});return out(L,`✨ Le miracle fait le tour du quartier : ${n} recrue${n>1?'s':''}. Les médecins grincent des dents.`)}},
    {t:'Calmer les esprits',fn:()=>{chg(L,{karma:4});adj(C,'loy',3);return out(L,'✨ Tu rappelles qu’un bon sommeil aide aussi. Les fidèles apprécient ta modestie.')}}]})},
  {id:'star',w:C=>C.fol>=40,run:(L,C)=>({title:'Une célébrité s’intéresse à vous',icon:'🌟',text:'Un acteur à la mode (celui des yaourts) souhaite suivre vos enseignements. Il propose de les citer dans une interview.',choices:[
    {t:'L’accueillir en grande pompe',fn:()=>{chg(L,{fame:R(3,8)});const n=join(L,C,R(20,80));adj(C,'heat',R(4,9));return out(L,`🌟 L’interview fait du bruit : ${n} recrue${n>1?'s':''}, et quelques sourcils levés.`)}},
    {t:'Rester discret',fn:()=>{adj(C,'loy',3);return out(L,'🌟 Tu l’accueilles comme n’importe quel fidèle. Il adore ça, étonnamment.')}}]})},
  {id:'lieutenant',w:C=>C.fol>=25,run:(L,C)=>({title:'Un second trop ambitieux',icon:'🧑‍🤝‍🧑',text:'Ton bras droit, aussi dévoué que talentueux, laisse entendre que le mouvement irait mieux avec lui à la barre.',choices:[
    {t:'Le promouvoir responsable de la communication',fn:()=>{adj(C,'loy',R(3,8));if(chance(.3)){adj(C,'heat',R(3,8));return out(L,'🧑‍🤝‍🧑 Il se montre enthousiaste, trop : les posts du mouvement deviennent borderline.')}return out(L,'🧑‍🤝‍🧑 Il s’épanouit et ramène du monde. Ça pourrait être pire.')}},
    {t:'Le recadrer devant tout le monde',fn:()=>{if(chance(.4)){adj(C,'loy',-5);const n=Math.max(1,Math.round(C.fol*.08));C.fol-=n;C.rival={name:genName2(),fol:(C.rival?C.rival.fol:0)+n};lg(L,C,'schisme du bras droit');return out(L,`🧑‍🤝‍🧑 Il claque la porte avec ${n} fidèles et fonde ${C.rival.name}.`)}adj(C,'dev',4);return out(L,'🧑‍🤝‍🧑 Il baisse la tête. Pour combien de temps ?')}}]})},
  {id:'urssaf',w:C=>C.fol>=30&&C.est>=1,run:(L,C)=>{const amt=Math.round(Math.max(3000,proj(L,C)*.08));return {title:'Contrôle de l’Urssaf',icon:'🧾',text:'Un contrôleur s’interroge sur le statut « bénévole » de vingt personnes qui cuisinent, nettoient et distribuent des tracts à temps plein.',choices:[
    ...(can(L,amt)?[{t:`Régulariser (${fmt(amt)})`,fn:()=>{L.money-=amt;adj(C,'heat',-3);return out(L,'🧾 Tu règles la note et signes des contrats. Les bénévoles sont ravis d’être salariés.')}}]:[]),
    {t:'Contester',fn:()=>{adj(C,'heat',R(6,12));if(chance(.4)){L.money-=amt*2;return out(L,`🧾 Redressement doublé : ${fmt(amt*2)}. L’expression « bénévolat spirituel » ne convainc pas.`)}return out(L,'🧾 L’affaire traîne. Le contrôleur reviendra.')}}]}}},
  {id:'famille',w:C=>C.fol>=8,run:(L,C)=>({title:'Une famille inquiète',icon:'👪',text:'Les parents d’une jeune recrue viennent récupérer leur enfant. Ils sont polis, mais très déterminés.',choices:[
    {t:'La laisser partir avec eux',pri:1,fn:()=>{C.fol=Math.max(0,C.fol-1);adj(C,'heat',-R(3,6));chg(L,{karma:5});return out(L,'👪 La famille repart. Tu leur donnes même une brochure pour la route.')}},
    {t:'Refuser de la laisser partir',danger:1,fn:()=>{chg(L,{karma:-8});adj(C,'heat',R(10,18));adj(C,'dev',4);return out(L,'👪 La famille quitte les lieux en colère. Le téléphone du commissariat va chauffer.')}}]})},
  {id:'solstice',w:C=>C.fol>=8&&true,run:(L,C)=>({title:'Le solstice',icon:'🔆',text:'Le solstice approche. La tradition du mouvement veut qu’on marche pieds nus dans la rosée en chantant du Brassens.',choices:[
    ...(can(L,5000)?[{t:'Organiser une grande fête (5 000 €)',pri:1,fn:()=>{L.money-=5000;adj(C,'loy',R(8,14));adj(C,'dev',R(5,10));const n=join(L,C,R(3,15));return out(L,`🔆 Fête magnifique. ${n} invité${n>1?'s':''} reste${n>1?'nt':''} pour le dessert.`)}}]:[]),
    {t:'Rester sobre et recueillis',fn:()=>{adj(C,'loy',R(2,5));return out(L,'🔆 Une cérémonie sobre, un vieux disque, des tisanes. Ça fait du bien.')}}]})},
  {id:'incident',w:C=>C.est>=2,run:(L,C)=>{const amt=R(10000,40000)*C.est;return {title:'Dégâts au domaine',icon:'🔧',text:`Un orage arrache une partie de la toiture de ${ESTATES[C.est].n.toLowerCase()}. Les adeptes proposent de réparer à la corde et à la bonne volonté.`,choices:[
    ...(can(L,amt)?[{t:`Faire appel à un couvreur (${fmt(amt)})`,fn:()=>{L.money-=amt;return out(L,'🔧 Toit refait, ciel dégagé. Tu paies la facture sans souffler mot.')}}]:[]),
    {t:'Laisser les adeptes bricoler',fn:()=>{if(chance(.4)){adj(C,'loy',-4);chg(L,{health:-2});return out(L,'🔧 Il pleut à l’intérieur. L’ambiance est moins zen.')}adj(C,'dev',5);return out(L,'🔧 Le toit tient, la ferveur monte. Ils se sentent utiles.')}}]}}},
  {id:'documentaire',w:C=>C.fol>=50&&C.fame>=0,run:(L,C)=>({title:'Un documentaire',icon:'🎬',text:'Une plateforme de streaming prépare un documentaire en trois épisodes sur les mouvements spirituels en France. Elle veut ton avis, et un peu de lumière.',choices:[
    {t:'Coopérer avec la production',fn:()=>{chg(L,{fame:R(4,10)});if(chance(.5)){const n=join(L,C,R(25,100));return out(L,`🎬 Le documentaire est plutôt tendre : ${n} recrue${n>1?'s':''}.`)}adj(C,'heat',R(10,20));adj(C,'loy',-5);return out(L,'🎬 Le titre est « Dans la tête du gourou ». Le générique ne te flatte pas.')}},
    {t:'Refuser de participer',fn:()=>{adj(C,'heat',3);return out(L,'🎬 Ils feront sans toi, avec des témoignages anonymes et de la musique inquiétante.')}}]})}
];
function events(L){
  const C=st(L);if(!C)return 0;
  let n=0;
  const q=C.q.slice();C.q=[];
  for(const k of q){
    if(!L.cult)break;
    if(k==='probe'||k==='fisc')n+=probe(L,C,k);
    else if(k==='mutiny')n+=mutiny(L,C);
  }
  if(!L.cult||n>0||C.fol<=0)return n;
  if(chance(.45)){
    const ok=RANDOM.filter(e=>{try{return e.w(C)}catch(x){return false}});
    if(ok.length){const e=pick(ok);const m=e.run(L,C);if(m){modal(m);n++}}
  }
  return n;
}

/* ---------- Évènements JSON ---------- */
const effects={
  adj(L,a){const C=st(L);if(!C)return '';a=a||{};
    for(const k of ['loy','dev','heat'])if(a[k])adj(C,k,evn(a[k]));
    if(a.fol){const n=evn(a.fol);if(n>0)join(L,C,n);else C.fol=Math.max(0,C.fol+n)}
    if(a.cash){const g=evn(a.cash);if(g>=0)earn(L,g,a.free?1:0);else spend(L,-g)}
    return a.txt?String(a.txt):''}
};
const conds={
  ready(L,a){const C=st(L);if(!C)return false;a=a||{};
    return C.fol>=(a.minFol||0)&&C.fol<=(a.maxFol==null?1e9:a.maxFol)&&C.loy>=(a.minLoy||0)&&C.loy<=(a.maxLoy==null?100:a.maxLoy)&&C.heat>=(a.minHeat||0)&&C.heat<=(a.maxHeat==null?100:a.maxHeat)&&C.est>=(a.minEst||0)}
};
const fx=(o)=>({mod_effect:{mod:MOD,fn:'adj',args:o}});
const eventsDb=[
  {id:'cult_pelerin',category:'cult_event',icon:'🚶',conditions:{min_age:21,mod_state:'cult',mod_cond:{mod:MOD,fn:'ready',args:{minFol:5}}},probability_weight:.12,
    prompt_text:'Un pèlerin barbu frappe à la porte du mouvement, un sac à dos sur l’épaule : « On m’a dit que vous serviez de la soupe. »',
    choices:[{choice_text:'L’accueillir pour la nuit',consequences:{...fx({loy:3,fol:[0,2]}),happiness_modifier:2,karma_modifier:2,result_text:'Il reste trois jours et réécrit le règlement intérieur.'}},
             {choice_text:'Lui indiquer la gare',consequences:{...fx({dev:-2}),result_text:'La soupe reste dans la marmite.'}}]},
  {id:'cult_graffiti',category:'cult_event',icon:'🎨',conditions:{min_age:21,mod_state:'cult',mod_cond:{mod:MOD,fn:'ready',args:{minFol:10}}},probability_weight:.1,
    prompt_text:'Un matin, la façade du lieu de culte est couverte d’un graffiti : « Gourou, rends l’argent ». Les adeptes sont indignés.',
    choices:[{choice_text:'Repeindre et n’en parler à personne',consequences:{bank_balance_modifier:[-1500,-300],...fx({heat:-2}),result_text:'Un coup de rouleau et il n’y paraît plus.'}},
             {choice_text:'Organiser une veillée de réparation',consequences:{...fx({loy:6,dev:5,heat:3}),result_text:'La veillée soude le groupe, et attire une patrouille de police curieuse.'}}]},
  {id:'cult_cadeau',category:'cult_event',icon:'🎁',conditions:{min_age:21,mod_state:'cult',mod_cond:{mod:MOD,fn:'ready',args:{minFol:15,minLoy:55}}},probability_weight:.1,
    prompt_text:'Les adeptes se sont cotisés pour t’offrir un cadeau de l’année : une cape en lin brodée d’un tournesol géant.',
    consequences:{...fx({dev:3}),happiness_modifier:4,bank_balance_modifier:[0,0],result_text:'Tu la portes une fois. Les photos circulent encore.'}},
  {id:'cult_signalement',category:'cult_event',icon:'📬',conditions:{min_age:21,mod_state:'cult',mod_cond:{mod:MOD,fn:'ready',args:{minFol:20,minHeat:25}}},probability_weight:.1,
    prompt_text:'Une lettre anonyme à la préfecture dénonce des « pratiques douteuses » au sein du mouvement. Elle est signée « Un voisin qui dort mal ».',
    choices:[{choice_text:'Répondre par une lettre calme et argumentée',consequences:{...fx({heat:-5}),karma_modifier:1,result_text:'Ton courrier est jugé plutôt courtois.'}},
             {choice_text:'Ignorer',consequences:{...fx({heat:4}),result_text:'La lettre est classée, en attendant la suivante.'}}]},
  {id:'cult_bilan',category:'cult_event',icon:'📊',conditions:{min_age:21,mod_state:'cult',mod_cond:{mod:MOD,fn:'ready',args:{minFol:30,minEst:1}}},probability_weight:.08,
    prompt_text:'Le trésorier du mouvement te présente un bilan comptable avec cinq colonnes, dont une intitulée « divers spirituels ».',
    choices:[{choice_text:'Tout faire certifier (3 000 €)',consequences:{bank_balance_modifier:-3000,...fx({heat:-6,loy:2}),result_text:'L’expert-comptable lève un sourcil mais signe.'}},
             {choice_text:'Garder les comptes tels quels',consequences:{...fx({heat:3}),result_text:'Le trésorier hausse les épaules. « On verra plus tard. »'}}]}
];

/* ---------- Module ---------- */
registerMod({
  id:MOD,
  year,events,eventsDb,effects,conds,
  activities(L){
    const C=L.cult?st(L):null;
    return [{ic:'🕯️',t:'Mouvement spirituel',s:C?`${fmtn(C.fol)} adepte${C.fol>1?'s':''} · loyauté ${C.loy} %`:'Fonder une communauté et récolter des dons',panel:pMain,min:21}];
  },
  netWorth(L){const C=st(L);return C?ESTATES[C.est].val:0},
  badges(L){return L.cult?['🕯️ Gourou']:[]},
  jobLabel(){return null},
  jailed(L){
    const C=st(L);if(!C)return;
    C.convictions++;adj(C,'loy',-12);C.fol=Math.max(0,Math.round(C.fol*.85));C.heat=Math.max(C.heat,35);lg(L,C,'le gourou est condamné');
    if(C.convictions>=2){say(L,`⚖️ Le tribunal prononce la dissolution de ${C.name}. Les adeptes se dispersent.`);L.cult=null;L._cd=null}
    else say(L,`🕯️ Sans toi, ${C.name} vacille. Les adeptes te rendent visite au parloir.`);
  },
  inherit(D,L){
    if(D&&D.cult&&!L.cult){
      const c=JSON.parse(JSON.stringify(D.cult));c.q=[];c.log=[];c.loy=clampN((+c.loy||50)-15,0,100);c.dev=clampN((+c.dev||50)-10,0,100);c.since=L.age;
      L.cult=c;say(L,`🕯️ Tu hérites de la direction de ${c.name}. Les adeptes te regardent avec un mélange de ferveur et d’inquiétude.`);
    }
  },
  personRows(L,p){
    const C=L.cult?st(L):null;if(!C||!p||!p.alive||p.type==='pet'||(p.age||0)<18)return [];
    const id=p.id;
    return [act(L,{ic:'🕯️',t:p.cult?'Déjà membre du mouvement':'Inviter à rejoindre le mouvement',s:p.cult?'':'Elle ou il a peut-être un cœur à éclairer',key:'cult_inv'+id,dis:p.cult?'Déjà membre':C.fol>=capOf(C)?'Domaine complet':'',fn:L=>{
      const c=st(L);if(!c)return '';
      const pr=clampN((p.rel||50)/130+(p.crazy||0)/300-(p.smarts||50)/400-(p.type==='parent'||p.type==='grand'?.1:0),.05,.75);
      if(chance(pr)){p.cult=1;join(L,c,1);p.rel=clampN((p.rel||50)+2,0,100);return out(L,`🕯️ ${p.first} accepte de venir à une réunion. Il ou elle revient, et prend même des notes.`)}
      p.rel=clampN((p.rel||50)-R(3,9),0,100);adj(c,'heat',1);return out(L,`🕯️ ${p.first} lève les yeux au ciel. « Tu es sûr que ça va ? » L’invitation fait un flop.`)}})];
  }
});
})();
