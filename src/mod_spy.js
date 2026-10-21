/* Deux Vies — module « Agent secret » (id spy)
   Service Hexagone : recrutement, grades, réseau de sources et d’agents, missions d’infiltration à choix tactiques,
   vol de données (mini-jeu), neutralisation de cibles (sans violence graphique), incidents et scandales, façades.
   État : L.spy = {v,rank,missions,cover,merit,heat,intel,net:[],log:[],lost,burned,since,out,ban,ret,abroad,top}
   Migre l’ancien format {rank,missions,cover} de mod_legacy.js sans rien perdre. */
(()=>{
const MOD='spy';
const PAY=[38000,48000,62000,80000,110000];
const MERIT=[0,25,70,140,240];
const RANKS=['Recrue','Agent de terrain','Agent confirmé','Chef de mission','Directeur des opérations'];
const CITIES=['Vienne','Istanbul','Moscou','Le Caire','Buenos Aires','Hong Kong','Berlin','Casablanca','Reykjavik','Singapour'];
const FRONTS=[['Café de quartier',180000],['Librairie ancienne',240000],['Agence de voyages',320000],['Galerie d’art',650000],['Hôtel particulier',1800000]];
const GADGET=1500;
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const rk=S=>clampN(S.rank|0,0,4);
const rankName=(L,S)=>fem(RANKS[rk(S)],L);

/* ---------- État ---------- */
function newSpy(L){return {v:2,rank:0,missions:0,cover:100,merit:0,heat:0,intel:0,net:[],log:[],lost:0,burned:0,since:L.age,out:0,ban:0,ret:0,abroad:0,top:0}}
function sp(L){
  const S=L&&L.spy;if(!S||typeof S!=='object')return null;
  if(typeof S.rank!=='number'||isNaN(S.rank))S.rank=0;S.rank=rk(S);
  if(typeof S.missions!=='number')S.missions=0;
  if(typeof S.cover!=='number')S.cover=100;S.cover=clamp(S.cover);
  if(typeof S.merit!=='number')S.merit=Math.max(MERIT[S.rank],S.missions*10);
  for(const k of ['heat','intel','lost','burned','out','ban','ret','abroad','top'])if(typeof S[k]!=='number')S[k]=0;
  if(typeof S.since!=='number')S.since=L.age;
  if(!Array.isArray(S.net))S.net=[];
  S.net=S.net.filter(m=>m&&typeof m==='object');
  S.net.forEach(m=>{if(!m.id)m.id=nid();if(typeof m.skill!=='number')m.skill=R(30,70);if(typeof m.loyal!=='number')m.loyal=R(40,70);if(!m.st)m.st='actif';if(!m.role)m.role='source';if(!m.first)m.first=rname(m.gender||'H','France');if(!m.last)m.last=rlast('France');if(!m.gender)m.gender='H';m.rel=m.loyal;m.type='friend';m.alive=true;if(typeof m.age!=='number')m.age=R(25,55)});
  if(!Array.isArray(S.log))S.log=[];
  return S;
}
const isActive=(L,S)=>!!S&&!S.out&&!S.ret;
const actif=L=>{const S=sp(L);return isActive(L,S)};
const members=S=>S.net.filter(m=>m.st!=='perdu');
const actives=S=>S.net.filter(m=>m.st==='actif');
const capOf=S=>2+rk(S)*2;
const fronts=L=>L.assets.filter(a=>a&&a.kind==='front');
const logS=(L,S,t)=>{S.log.push(`${L.age} ans : ${t}`);if(S.log.length>30)S.log.shift()};
const coverDn=(S,n)=>{S.cover=clamp(S.cover-n)};
const heatUp=(S,n)=>{S.heat=clamp(S.heat+n)};
const jobName=L=>{try{return L.job&&!L.job.sp&&!L.job.mil?title(L).toLowerCase():'sans emploi officiel'}catch(e){return 'ton emploi'}};
const roleName=m=>m.role==='agent'?'agent de terrain':'source';
const stName=m=>({actif:'actif',grillé:'grillé',retourné:'retourné',perdu:'perdu'}[m.st]||m.st);
const hint=p=>p<.3?'très risqué':p<.5?'risqué':p<.7?'honnête':'favorable';

function promo(L,S){
  let t='';
  while(S.rank<4&&S.merit>=MERIT[S.rank+1]){
    S.rank++;t+=` 🕶️ Promotion : tu deviens ${rankName(L,S).toLowerCase()}.`;chg(L,{happy:6});logS(L,S,`promotion, ${rankName(L,S).toLowerCase()}`);
    if(S.rank===4&&!S.top){S.top=1;track(L,'topCareer');t+=' Tu diriges désormais les opérations du Service.'}
  }
  if(t)say(L,t.trim());
  return t;
}
function rng(L,salt){let h=2166136261;const s=String(L.id)+':'+L.age+':'+salt;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const seeded=(arr,r,k)=>arr.map(x=>[r(),x]).sort((a,b)=>a[0]-b[0]).slice(0,k).map(x=>x[1]);
const primeOf=(S,steps,f)=>Math.round(8000*(1+rk(S)*.7)*(1+(steps-3)*.2)*(f||1)/100)*100;

/* ---------- Incidents, scandales ---------- */
function foreign(L){const c=Object.keys(COUNTRIES).filter(x=>x!==L.country);return pick(c.length?c:['Russie'])}
function incident(L,S,sev,city){
  sev=sev||1;
  const nf=Math.min(3,fronts(L).length);
  if(nf&&chance(.15*nf)){coverDn(S,6);say(L,`🏪 Ta façade encaisse le choc : ${fronts(L)[0].name.toLowerCase()} fournit une explication parfaitement ennuyeuse.`);return '🏪 Ta façade te sauve la mise.'}
  const w={};
  if(members(S).length)w.agent=3;
  w.diplo=3;w.scandal=2;
  if(sev>=2)w.fired=(S.rank===0?2.2:1.2)+(S.cover<25?1:0);
  if(sev>=3&&S.cover<40)w.prison=2.5;
  const k=wpick(w);let t='';
  if(k==='agent'){
    const m=pick(members(S));m.st='perdu';S.lost++;chg(L,{karma:-4,happy:-9,stress:6});
    t=`💔 ${m.first} ${m.last} (${m.job||'contact'}) a disparu des radars après l’opération${city?' à '+city:''}. Le Service ne commente pas.`;
    S.net=S.net.filter(x=>x!==m);
  }else if(k==='diplo'){
    const c=foreign(L);coverDn(S,15);S.merit=Math.max(0,S.merit-6);heatUp(S,10);chg(L,{fame:R(2,6),karma:-R(3,8),happy:-8});track(L,'scandals');
    t=`🌐 Incident diplomatique : l’ambassadeur de ${c} est convoqué au Quai d’Orsay. Quelqu’un, au ministère, veut une explication… et ce quelqu’un te cherche.`;
  }else if(k==='scandal'){
    coverDn(S,25);heatUp(S,12);chg(L,{fame:R(5,12),karma:-5,happy:-10,stress:8});track(L,'scandals');
    if(L.job&&!L.job.sp&&!L.job.mil)L.job.perf=clamp((L.job.perf||50)-15);
    t=`📰 Scandale politique : un hebdomadaire publie « l’affaire ${pick(['du faux traiteur','des micros de la rue Cler','du dîner de Vienne','de la clé USB'])} ». Des députés réclament une commission d’enquête.`;
    if(S.cover<10)S.merit=Math.max(0,S.merit-10);
  }else if(k==='fired'){
    S.out=1;S.ban=L.age+5;S.net=[];chg(L,{happy:-15,karma:-2,stress:8});
    t='🚪 Le Service te radie. Ton badge est désactivé par un stagiaire, ton réseau dissous en une après-midi. Tu es prié d’oublier tout ce que tu sais.';
  }else{
    S.cover=Math.min(S.cover,30);const y=R(1,4);L.prison=y;S.abroad=1;if(jobOk(L))L.job=null;L.part=null;chg(L,{happy:-15,stress:10,fame:R(2,8)});track(L,'scandals');
    t=`⛓️ Ta couverture saute${city?' à '+city:''}. Tu es ${ge(L,'arrêté','arrêtée')} et ${ge(L,'condamné','condamnée')} à ${An(y)} de prison à l’étranger. Le Service nie te connaître, pour l’instant.`;
  }
  logS(L,S,t.replace(/^\S+\s/,'').slice(0,70));
  return out(L,t);
}

/* ---------- Mini-jeu : vol de données ---------- */
const CODES=['A7','3F','K9','Z2','B5','7M','Q1','X8','4D','R6','9H','C3','T0','E4','W5','J2','8N','P7'];
function dataGame(L,o){
  const S=sp(L);const lvl=clampN(o.level||1,1,3);
  const len=clampN(3+lvl-(L.st.smarts>=75?1:0),3,6);
  let tries=3+(L.st.smarts>=70?1:0)+(o.bonus||0);
  const pool=shuffle(CODES.slice()).slice(0,12);const seq=shuffle(pool.slice()).slice(0,len);
  let phase='show',pos=0,msg='',done=false,win=false;const hit=new Set();
  modal({title:o.title||'Vol de données',icon:'💻',html:'',choices:[],mount:el=>{
    const draw=()=>{
      let h='';
      if(done)h=`<p class="gmsg">${esc(msg)}</p><div class="gbtns">${gbtn('end','Continuer',1)}</div>`;
      else if(phase==='show'){
        h=`<p class="gsub">Retiens la séquence d’accès (${len} codes, dans l’ordre).</p><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0">${seq.map((c,i)=>`<span style="border:1px solid currentColor;border-radius:8px;padding:6px 10px;font-weight:700;font-variant-numeric:tabular-nums">${i+1}. ${esc(c)}</span>`).join('')}</div><div class="gbtns">${gbtn('ready','Je l’ai en tête',1)}</div>`;
      }else{
        h=`<p class="gsub">Code ${pos+1} sur ${len} · ${tries} essai${tries>1?'s':''} avant l’alarme</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0">${pool.map((c,i)=>`<button type="button" class="btn" style="min-height:48px;font-weight:700" data-g="c${i}"${hit.has(i)?' disabled':''}>${esc(c)}</button>`).join('')}</div><div class="gbtns">${gbtn('peek','Revoir la séquence (−1 essai)',0,tries<=1)}</div>`;
      }
      el.innerHTML=h;
    };
    el.onclick=e=>{
      const b=e.target.closest('[data-g]');if(!b||b.disabled)return;const k=b.dataset.g;
      if(done){if(k==='end'){const cb=o.onEnd;endModal(msg);if(cb)cb(win,tries)}return}
      if(k==='ready'&&phase==='show'){phase='play'}
      else if(k==='peek'&&phase==='play'&&tries>1){tries--;phase='show';pos=0;hit.clear()}
      else if(k[0]==='c'&&phase==='play'){
        const i=+k.slice(1);
        if(pool[i]===seq[pos]){hit.add(i);pos++;if(pos>=len){done=true;win=true;msg='Accès accordé. Les données se copient sur ta clé, pendant que le serveur ronronne.'}}
        else{tries--;pos=0;hit.clear();if(tries<=0){done=true;msg='Alarme silencieuse déclenchée : la session est coupée et ton adresse est tracée.'}}
      }
      draw();
    };
    draw();
  }});
}

/* ---------- Réseau : recrutement d’espions ---------- */
const JOBS_RES=['attaché de presse','chauffeur d’ambassade','secrétaire de direction','technicien réseau','douanier','banquier privé','barman d’hôtel','interprète','journaliste','bibliothécaire','concierge de palace','consultant','standardiste','informaticien','guide touristique','comptable'];
const MOTIFS={argent:'endetté, il rêve d’une vie plus confortable',idéal:'idéaliste, il croit à de grandes causes',peur:'rancunier, il cache des secrets embarrassants',amitié:'solitaire, il cherche surtout de la compagnie'};
const APPR=[['argent','Proposer une enveloppe discrète (3 000 €)',45],['idéal','Faire appel à ses convictions',70],['peur','Exercer une pression feutrée',35],['amitié','Gagner son amitié, un verre après l’autre',65]];
function mkMember(L,p,role,loyal,pid){
  return {id:nid(),pid:pid||null,first:p.first,last:p.last,gender:p.gender,age:p.age,look:p.look,job:p.job||pick(JOBS_RES),role,skill:clamp(p.skill!=null?p.skill:R(30,85)),loyal:clamp(loyal),rel:clamp(loyal),st:'actif',type:'friend',alive:true,since:L.age,done:0};
}
function recruitFlow(L){
  const S=sp(L);if(!S)return;
  const cands=[0,1,2].map(()=>{const c=pick(Object.keys(COUNTRIES));const p=person(pick(['H','F']),R(24,58),null,c);p.job=pick(JOBS_RES);p.skill=R(25,85);p.motif=pick(Object.keys(MOTIFS));return p});
  modal({title:'Candidats à la sollicitation',icon:'🕶️',text:'Le Service a repéré trois profils intéressants autour de toi. Lequel approches-tu ?',choices:[
    ...cands.map(p=>({t:`${p.first} ${p.last}, ${An(p.age)} · ${p.job} · ${MOTIFS[p.motif]}`,fn:()=>{approach(L,S,p);return ''}})),
    {t:'Laisser tomber'}]});
}
function approach(L,S,p){
  modal({title:`${p.first} ${p.last}`,icon:'🤝',text:`${cap(p.job)}, ${An(p.age)}. Comment l’abordes-tu ?`,choices:[
    ...APPR.filter(a=>a[0]!=='argent'||L.money>=3000).map(([m,lab,loy])=>({t:lab,fn:()=>{
      if(m==='argent')spend(L,3000);
      const pr=clampN(.28+(L.st.looks+L.st.smarts)/420+(p.motif===m?.3:0)+(S.cover-60)/400,.1,.9);
      if(chance(pr)){
        if(members(S).length>=capOf(S))return out(L,'Ton réseau est déjà au maximum de ce que tu peux gérer.');
        const role=chance(.5)?'agent':'source';const mem=mkMember(L,p,role,loy+R(-10,12)+(p.motif===m?10:0));
        S.net.push(mem);S.merit+=2;if(m==='peur'){chg(L,{karma:-5})}
        const t=`🕶️ ${p.first} ${p.last} accepte de travailler pour toi (${roleName(mem)}, ${mem.job}).`;logS(L,S,`recrutement de ${p.first} ${p.last}`);promo(L,S);return out(L,t);
      }
      coverDn(S,R(4,10));heatUp(S,R(2,6));
      if(m==='peur'&&chance(.3))return incident(L,S,1);
      return out(L,`${p.first} te regarde de travers et change de trottoir. Tu viens peut-être de te faire remarquer.`);
    }})),
    {t:'Renoncer'}]});
}

/* ---------- Missions ---------- */
const APP={
  discret:{lab:'Approche discrète',ic:'🌘',sc:L=>(L.hid.willpower+L.hid.discipline)/2},
  social:{lab:'Ingénierie sociale',ic:'🎭',sc:L=>(L.st.looks+L.st.smarts)/2},
  force:{lab:'Passer en force',ic:'💪',sc:L=>L.hid.athletic*.6+L.st.health*.4},
  gadget:{lab:'Gadget du laboratoire',ic:'🔧',sc:L=>52+L.st.smarts*.18}
};
const OK={
  discret:['Tu te glisses comme une ombre, personne ne se retourne.','Silence, patience, et la porte s’ouvre toute seule.','Tu passes entre les gouttes. Sans le moindre bruit.'],
  social:['Ton sourire et ton faux badge font des miracles.','Tu racontes une histoire si ennuyeuse que personne n’ose te contrôler.','On te sert un café et on te tient la porte. Quel accueil !'],
  force:['Tu forces le passage, plus vite que l’alarme.','Un geste précis, un instant de panique en face, et tu es déjà passé.','Pas très subtil, mais redoutablement efficace.'],
  gadget:['Le stylo-caméra du laboratoire fonctionne enfin du premier coup.','Le petit boîtier brouille tout dans un rayon de dix mètres.','Mention spéciale à l’ingénieur qui a cousu ce capteur dans ta doublure.'],
  appui:['Ton contact assure parfaitement sa partie.','Le signal convenu arrive pile à l’heure : ton relais a tenu sa promesse.','Travail d’équipe impeccable, sans un mot de trop.']
};
const KO={
  discret:['Une latte de parquet craque. Tout le monde se tourne vers toi.','Un chien de garde, que personne n’avait signalé, aboie.'],
  social:['Ton accent éveille les soupçons. On appelle un supérieur.','On te demande une pièce que tu n’as pas : « Vous n’êtes pas sur la liste. »'],
  force:['Le fracas réveille tout l’étage. Subtil comme un déménagement.','L’alarme hurle. Tu avais pourtant dit « discrètement ».'],
  gadget:['Le gadget tombe en panne… le jour de l’inspection de la batterie.','Le boîtier émet un bip, très reconnaissable, au pire moment.'],
  appui:['Ton relais arrive en retard, et trop nerveux pour être crédible.','Le contact bafouille, et l’affaire tourne à l’interrogatoire.']
};
const MISSIONS=[
 {n:'Infiltrer une ambassade',ic:'🏛️',r:0,steps:[{s:'Franchir le contrôle de l’ambassade à {v} avec un badge de traiteur',d:45,fav:'social'},{s:'Atteindre le bureau du consul sans croiser la sécurité',d:55,fav:'discret'},{s:'Copier les dossiers du consul sur son serveur',hack:1}]},
 {n:'Exfiltrer un informateur',ic:'🧳',r:0,steps:[{s:'Organiser un rendez-vous discret avec l’informateur, dans un café de {v}',d:40,fav:'discret'},{s:'Semer deux hommes en imperméable dans les ruelles',d:50,fav:'discret'},{s:'Franchir la frontière avec de faux papiers',d:55,fav:'social'}]},
 {n:'Récupérer une clé USB volée',ic:'💾',r:0,steps:[{s:'Gagner la confiance du voleur à la table de baccara d’un casino de {v}',d:45,fav:'social'},{s:'Subtiliser la clé dans la poche d’un veston de soie',d:55,fav:'discret'},{s:'Quitter l’hôtel sans éveiller les soupçons',d:50,fav:'gadget'}]},
 {n:'Surveiller un sommet clandestin',ic:'🎧',r:0,steps:[{s:'Poser des micros dans la salle de conférence d’un hôtel de {v}',d:50,fav:'gadget'},{s:'Filer un attaché jusqu’au lieu de la réunion',d:45,fav:'discret'},{s:'Rapporter l’essentiel sans trahir ta présence',d:45,fav:'social'}]},
 {n:'Démasquer une taupe',ic:'🐀',r:1,steps:[{s:'Analyser trois mois de communications du poste de {v}',d:50,fav:'gadget'},{s:'Pénétrer la messagerie interne du poste',hack:1},{s:'Tendre un piège avec un faux document',d:55,fav:'social'},{s:'Mener l’entretien avec le suspect, très poliment',d:60,fav:'social'}]},
 {n:'Saboter un prototype',ic:'⚙️',r:1,steps:[{s:'Pénétrer dans l’usine de {v}, un dimanche',d:55,fav:'discret'},{s:'Désactiver le prototype sans le casser',d:60,fav:'gadget'},{s:'T’échapper par les toits avant la ronde',d:55,fav:'force'}]},
 {n:'Négocier la libération d’un otage',ic:'🕊️',r:2,steps:[{s:'Prendre contact avec un intermédiaire à {v}',d:55,fav:'social'},{s:'Localiser le lieu de détention dans les serveurs locaux',hack:2},{s:'Négocier les conditions de l’échange',d:65,fav:'social'},{s:'Ramener tout le monde à l’aéroport',d:60,fav:'discret'}]},
 {n:'Retourner un diplomate',ic:'🍷',r:2,steps:[{s:'Repérer la faille de ta cible, un diplomate en poste à {v}',d:55,fav:'social'},{s:'L’inviter à dîner dans un restaurant sans caméra',d:60,fav:'social'},{s:'Le convaincre de changer de camp',d:65,fav:'social'}]},
 {n:'Déjouer un cyber-sabotage',ic:'🛰️',r:3,steps:[{s:'Retrouver le serveur d’où partent les attaques, à {v}',d:60,fav:'gadget'},{s:'Percer les défenses du serveur',hack:2},{s:'Neutraliser le relais physique dans un sous-sol',d:65,fav:'force'},{s:'Effacer toutes les traces de ton passage',d:60,fav:'discret'}]},
 {n:'Opération Minuit',ic:'🌙',r:3,steps:[{s:'Infiltrer une soirée de gala à {v}, smoking de location',d:60,fav:'social'},{s:'Localiser le coffre des œuvres volées',d:65,fav:'discret'},{s:'Forcer le coffre avant minuit',hack:3},{s:'Sortir en même temps que le buffet',d:65,fav:'gadget'}]}
];
function offers(L,S){
  const r=rng(L,'m');const list=MISSIONS.filter(m=>m.r<=rk(S));
  return seeded(list,r,Math.min(4,list.length)).map((M,i)=>({M,city:CITIES[Math.floor(r()*CITIES.length)]}));
}
function bestMember(S,used){
  const c=actives(S).filter(m=>!used[m.id]);if(!c.length)return null;
  return c.sort((a,b)=>(b.role==='agent'?12:0)+b.skill+b.loyal*.4-((a.role==='agent'?12:0)+a.skill+a.loyal*.4))[0];
}
function pStep(L,S,ap,T,mb,intel){
  let sc;
  if(ap==='appui')sc=mb.skill*.55+mb.loyal*.45+(mb.role==='agent'?6:-2);else sc=APP[ap].sc(L);
  const p=.42+(sc-T.d)/110+(T.fav===ap?.12:0)+(S.cover-60)/220-S.heat/320+intel*.06+Math.min(3,fronts(L).length)*.02;
  return clampN(p,.08,.92);
}
function startMission(L,M,city){
  const S=sp(L);if(!S)return;
  const st={wins:0,fails:0,crit:0,used:{}};const intel=S.intel||0;S.intel=0;const n=M.steps.length;
  const step=i=>{
    if(i>=n)return endMission(L,S,M,city,st,intel);
    const T=M.steps[i];const txt=T.s.replace('{v}',city)+'.';const ttl=`${M.n} · étape ${i+1}/${n}`;
    if(T.hack){
      modal({title:ttl,icon:M.ic||'🕶️',text:txt+(intel?' Le renseignement obtenu t’aidera.':''),choices:[{t:'Lancer l’intrusion',pri:1,fn:()=>{
        dataGame(L,{level:T.hack,city,bonus:intel?1:0,title:`${M.n} · données`,onEnd:win=>{
          if(win){st.wins++;S.merit+=1}else{st.fails++;st.crit++;coverDn(S,R(6,14));heatUp(S,R(6,12))}
          step(i+1)}});
        return '';}}]});
      return;
    }
    const mb=bestMember(S,st.used);const ch=[];
    const mk=ap=>{const p=pStep(L,S,ap,T,ap==='appui'?mb:null,intel);
      return {t:`${APP[ap]?APP[ap].lab:'Appui de '+mb.first}${ap==='gadget'?` (−${fmt(GADGET)})`:''}${ap==='appui'?` (${roleName(mb)})`:''} · ${hint(p)}`,fn:()=>{
        if(ap==='gadget')spend(L,GADGET);if(ap==='appui')st.used[mb.id]=1;
        let t;
        if(chance(p)){st.wins++;t=pick(OK[ap]);if(ap==='appui'){mb.loyal=clamp(mb.loyal+2);mb.skill=clamp(mb.skill+1)}}
        else{
          st.fails++;coverDn(S,Math.round(R(5,13)*(ap==='force'?1.3:1)));heatUp(S,ap==='force'?R(8,15):R(3,8));
          if(chance(ap==='force'?.35:.18))st.crit++;
          t=pick(KO[ap]);
          if(ap==='appui'&&chance(.35)){mb.st='grillé';S.burned++;t+=` ${mb.first} est grillé${mb.gender==='F'?'e':''} : il faudra le faire sortir.`}
        }
        const o=out(L,t);step(i+1);return o;}};};
    ch.push(mk('discret'),mk('social'),mk('force'));
    if(L.money>=GADGET)ch.push(mk('gadget'));
    if(mb)ch.push(mk('appui'));
    modal({title:ttl,icon:M.ic||'🕶️',text:txt+(intel?' Le renseignement obtenu t’aidera.':''),choices:ch});
  };
  step(0);
}
function endMission(L,S,M,city,st,intel){
  const n=M.steps.length;const need=Math.ceil(n*.6);
  if(st.wins>=need){
    const g=primeOf(S,n,R(70,140)/100);earn(L,g,1);S.missions++;track(L,'missions');
    S.merit+=8+n*2+(st.fails===0?3:0);chg(L,{happy:6,stress:R(2,5),karma:M.n.includes('otage')?4:0});
    for(const id in st.used){const m=S.net.find(x=>x.id===id);if(m){m.loyal=clamp(m.loyal+R(1,4));m.skill=clamp(m.skill+R(0,2))}}
    heatUp(S,st.crit*4);
    let t=`🕶️ Mission réussie à ${city} : ${M.n.toLowerCase()}. Prime : ${fmt(g)}.`;
    logS(L,S,`${M.n.toLowerCase()} à ${city}, réussie`);
    const p=promo(L,S);if(p)t+=p;
    return out(L,t);
  }
  coverDn(S,R(8,18));heatUp(S,R(4,9));chg(L,{happy:-6,stress:R(3,7)});S.merit=Math.max(0,S.merit-3);
  logS(L,S,`${M.n.toLowerCase()} à ${city}, échec`);
  let t=`Mission ratée à ${city} : ${M.n.toLowerCase()}. Tu rentres de justesse, un peu plus transparent${ge(L,'','e')} qu’avant.`;
  const pi=clampN(.2+st.crit*.25+S.heat/300,.05,.85);
  if(chance(pi)){say(L,t);return incident(L,S,st.crit>=2?3:st.crit?2:1,city)}
  return out(L,t);
}

/* ---------- Vol de données (action autonome) ---------- */
const HACKS=[
 [1,'Serveur d’une PME de défense','Peu protégé, peu rémunérateur',1],
 [2,'Réseau d’un ministère étranger','Pare-feu sérieux, données précieuses',2],
 [3,'Coffre numérique d’un cartel financier','Alarme nerveuse, gros potentiel',3]
];
function pHack(L,S,lvl){
  dataGame(L,{level:lvl,title:'Vol de données',bonus:S.intel>0?1:0,onEnd:win=>{
    if(win){
      const g=Math.round(lvl*R(30,90)*100*(1+rk(S)*.4)/100)*100;earn(L,g,1);S.intel=Math.min(3,(S.intel||0)+1);S.merit+=3+lvl*2;chg(L,{happy:3,stress:2});
      logS(L,S,'données volées, niveau '+lvl);say(L,`💻 Données copiées (niveau ${lvl}). Prime : ${fmt(g)}, et un renseignement qui servira à la prochaine opération.`);
      promo(L,S);
    }else{
      coverDn(S,R(6,14));heatUp(S,R(6,12));chg(L,{stress:4});logS(L,S,'intrusion détectée, niveau '+lvl);
      if(chance(.2*lvl)){incident(L,S,lvl>=3?2:1)}else say(L,'💻 Intrusion repérée. Tu coupes la connexion avant que l’on remonte jusqu’à toi… ou presque.');
    }
  }});
}

/* ---------- Neutralisation de cibles ---------- */
const T_FIRST=['Viktor','Amira','Dragan','Lena','Ravi','Ilona','Marek','Yasmine','Tomas','Nadia','Boris','Selim','Katia','Hassan','Irina','Luka'];
const T_LAST=['Volkov','Karimi','Petrescu','Laurent-Berg','Okonkwo','Marchand','Zielinski','Haddad','Novak','Castellan','Dumitru','Rossetti','Brandt','Ivanov','Mendes','Bellamy'];
const T_ROLE=[['intermédiaire d’un trafic d’armes anciennes',false],['pirate informatique au service d’un État',true],['diplomate corrompu',true],['faussaire de passeports',false],['financier de réseaux douteux',true],['ancien officier devenu mercenaire',false],['courtier en secrets industriels',true],['chef d’un cercle de contrebande de bijoux',false]];
function targets(L,S){
  const r=rng(L,'t');const out=[];
  for(let i=0;i<3;i++){const ro=T_ROLE[Math.floor(r()*T_ROLE.length)];
    out.push({name:`${T_FIRST[Math.floor(r()*T_FIRST.length)]} ${T_LAST[Math.floor(r()*T_LAST.length)]}`,role:ro[0],defect:ro[1],city:CITIES[Math.floor(r()*CITIES.length)],lvl:clampN(1+Math.floor(r()*(rk(S)+1.5)),1,3)})}
  return out;
}
function targetOp(L,S,T){
  const D=38+T.lvl*10;let k=0;
  const recon=(lab,sc,hot)=>({t:lab,fn:()=>{
    const p=clampN(.45+(sc-D)/110,.12,.9);
    if(chance(p)){k=chance(.35)?2:1;say(L,'Le dossier se remplit : horaires, habitudes, points faibles.')}
    else{k=0;heatUp(S,hot);coverDn(S,R(3,8));say(L,'Le repérage tourne court : la cible a changé de routine.')}
    decide();return '';}});
  const decide=()=>{
    const best=bestMember(S,{});const ag=best?best.skill/10:0;
    const pCap=clampN(.38+((L.hid.athletic*.4+L.hid.willpower*.3+L.hid.discipline*.3)-D)/110+k*.08+ag/100,.1,.9);
    const pDis=clampN(.38+((L.st.smarts*.6+L.st.looks*.2+20)-D)/110+k*.08+ag/100,.1,.9);
    const pExf=clampN(.35+((L.hid.willpower+L.st.smarts)/2-D)/110+k*.08+ag/100,.1,.88);
    const ch=[
      {t:`Capturer ${T.name} · ${hint(pCap)}`,fn:()=>{
        if(chance(pCap)){const g=primeOf(S,3,1.1);earn(L,g,1);S.merit+=11;S.missions++;track(L,'missions');chg(L,{happy:6,karma:1,stress:3});promo(L,S);logS(L,S,`capture de ${T.name}`);
          return out(L,`🕶️ ${T.name}, ${T.role}, est remis aux autorités à ${T.city}, sans une égratignure. Prime : ${fmt(g)}.`)}
        coverDn(S,R(8,16));heatUp(S,R(8,14));chg(L,{happy:-6});logS(L,S,`échec de capture de ${T.name}`);
        const t=`${T.name} file par une porte de service et s’évapore. Quelqu’un pose des questions sur le suspect qui l’a manqué.`;
        if(chance(.3+T.lvl*.1)){say(L,t);return incident(L,S,2,T.city)}return out(L,t)}},
      {t:`Le discréditer · ${hint(pDis)}`,fn:()=>{
        if(chance(pDis)){const g=primeOf(S,3,.9);earn(L,g,1);S.merit+=9;S.missions++;track(L,'missions');chg(L,{happy:3,karma:-3});promo(L,S);logS(L,S,`discrédit de ${T.name}`);
          return out(L,`📰 Des documents « retrouvés » ruinent la réputation de ${T.name}. Son réseau l’abandonne en moins d’une semaine. Prime : ${fmt(g)}.`)}
        coverDn(S,R(8,15));heatUp(S,R(5,10));chg(L,{karma:-4});logS(L,S,`discrédit raté de ${T.name}`);
        const t=`L’opération se retourne : la presse accuse la France d’une campagne de calomnie contre ${T.name}.`;
        if(chance(.55)){say(L,t);return incident(L,S,1,T.city)}return out(L,t)}}];
    if(T.defect&&best)ch.push({t:`L’exfiltrer avec l’aide de ${best.first} · ${hint(pExf)}`,fn:()=>{
      if(chance(pExf)){S.merit+=10;S.missions++;track(L,'missions');chg(L,{happy:5,karma:2});best.loyal=clamp(best.loyal+3);
        const parts=T.name.split(' ');
        if(members(S).length<capOf(S)){const mem=mkMember(L,{first:parts[0],last:parts.slice(1).join(' ')||'X',gender:chance(.5)?'H':'F',age:R(30,55),look:best.look,job:T.role.split(' ')[0]==='ancien'?'consultant en sécurité':'ex-'+T.role.split(' ')[0],skill:R(60,92)},'source',R(40,60));S.net.push(mem)}
        promo(L,S);logS(L,S,`exfiltration de ${T.name}`);
        return out(L,`🕶️ ${T.name} passe de l’autre côté. Il accepte de collaborer avec le Service Hexagone et livre ses premiers secrets autour d’un thé.`)}
      best.st='grillé';S.burned++;coverDn(S,R(8,14));heatUp(S,R(6,12));logS(L,S,`exfiltration ratée de ${T.name}`);
      const t=`L’exfiltration échoue : ${best.first} est repéré${best.gender==='F'?'e':''} au poste-frontière.`;
      if(chance(.4)){say(L,t);return incident(L,S,2,T.city)}return out(L,t)}});
    ch.push({t:'Le laisser filer',fn:()=>{
      const r=Math.random();chg(L,{karma:2});S.merit=Math.max(0,S.merit-1);
      if(r<.2){S.intel=Math.min(3,S.intel+1);logS(L,S,`${T.name} laissé filer, mais reconnaissant`);return out(L,`${T.name} te remercie par un message codé, accompagné d’un tuyau précieux (+1 renseignement).`)}
      if(r<.45){heatUp(S,R(6,10));return out(L,`Tu laisses filer ${T.name}. Deux mois plus tard, un de ses amis te passe le bonjour, de loin.`)}
      return out(L,`Tu laisses filer ${T.name}. Ton rapport est étrangement laconique.`)}});
    modal({title:`Cible : ${T.name}`,icon:'🎯',text:`${cap(T.role)} à ${T.city}. Aucune violence : le Service préfère l’art de la persuasion. Que décides-tu ?`,choices:ch});
  };
  const mem=actives(S).filter(m=>m.role==='source').sort((a,b)=>b.skill-a.skill)[0];
  modal({title:`Cible : ${T.name}`,icon:'🎯',text:`${cap(T.role)}, basé à ${T.city}. Comment prépares-tu l’opération ?`,choices:[
    recon('Filer la cible en personne',(L.hid.willpower+L.hid.discipline)/2,R(4,8)),
    recon('Écoutes et recoupements de données',L.st.smarts,R(2,6)),
    ...(mem?[recon(`Interroger ${mem.first} (source)`,mem.skill*.8+mem.loyal*.2,R(1,3))]:[])]});
}

/* ---------- Alertes opérationnelles ---------- */
const ttl=L=>({title:'Alerte opérationnelle',icon:'🕶️'});
const ALERTS=[
 {w:3,ok:(L,S)=>actives(S).length>0,run(L,S){
   const m=pick(actives(S));
   modal({...ttl(L),text:`${m.first} ${m.last} (${m.job}) te fait parvenir un signal convenu : il veut te voir ce soir.`,choices:[
     {t:'Le retrouver dans un parc, en pleine nuit',fn:()=>{if(chance(.5+(L.hid.willpower)/300)){m.loyal=clamp(m.loyal+R(4,9));S.intel=Math.min(3,S.intel+1);S.merit+=2;return out(L,`${m.first} te glisse une enveloppe : des informations de première main (+1 renseignement).`)}heatUp(S,6);return out(L,'Des promeneurs trop attentifs rôdent autour du banc. Vous repartez chacun de votre côté, sans rien échanger.')}},
     {t:'Répondre par une petite annonce codée',fn:()=>{m.loyal=clamp(m.loyal+2);return out(L,`${m.first} comprend le message à la lecture du Parisien. Prudent.`)}},
     {t:'Ignorer le signal',fn:()=>{m.loyal=clamp(m.loyal-R(6,12));return out(L,`${m.first} ne comprendra pas ton silence. Sa loyauté en prend un coup.`)}}]});}},
 {w:3,ok:()=>true,run(L,S){
   modal({...ttl(L),text:'Depuis trois jours, la même berline grise se gare à deux rues de chez toi. Deux silhouettes en imperméable. Cliché, mais efficace.',choices:[
     {t:'Les semer dans le métro',fn:()=>{if(chance(.45+((L.hid.willpower+L.hid.discipline)/2)/250)){chg(L,{stress:-2});return out(L,'Changement à Châtelet, passage par la sortie de service : tu les perds à la troisième correspondance.')}coverDn(S,8);heatUp(S,6);return out(L,'Tu rates ta correspondance. Ils ne te lâchent plus.')}},
     {t:'Aller leur parler, tout sourire',fn:()=>{if(chance(.4+L.st.looks/300)){S.merit+=1;return out(L,'C’étaient des stagiaires du Service chargés de tester ta vigilance. Tu les emmènes boire un café.')}coverDn(S,10);heatUp(S,8);return out(L,'Ils ne sont pas du tout du Service. Gênant pour tout le monde.')}},
     {t:'Agir comme si de rien n’était',fn:()=>{if(chance(.6))return out(L,'Au bout d’une semaine, la berline disparaît. Mystère.');heatUp(S,10);return out(L,'La filature continue. Tu dors avec un œil ouvert.')}}]});}},
 {w:2,ok:(L,S)=>S.rank>=1,run(L,S){
   modal({...ttl(L),text:'Une fuite a été repérée au sein du Service : quelqu’un renseigne l’autre camp. Les regards se font soupçonneux à la machine à café.',choices:[
     {t:'Enquêter discrètement de ton côté',fn:()=>{if(chance(.4+L.st.smarts/250)){S.merit+=5;promo(L,S);return out(L,'Tu remontes la piste jusqu’à un intendant trop bavard. Ton chef t’adresse un hochement de tête.')}coverDn(S,10);heatUp(S,5);return out(L,'Tes questions agacent quelqu’un. Tu es soudain beaucoup moins discret.')}},
     {t:'Signaler tes soupçons à ta hiérarchie',fn:()=>{S.merit+=1;return out(L,'Ton chef note tout dans un petit carnet noir. Prudent.')}},
     {t:'Ne rien dire, ne rien voir',fn:()=>{heatUp(S,5);return out(L,'Tu regardes tes chaussures. La taupe, elle, continue à creuser.')}}]});}},
 {w:2,ok:L=>!!L.partner,run(L,S){
   const p=partnerOf(L);const nm=p?p.first:'ton partenaire';
   const rel=d=>{if(typeof partnerRel==='function')partnerRel(L,d)};
   modal({...ttl(L),text:`${nm} s’étonne de tes déplacements : « Un séminaire à ${pick(CITIES)}, encore ? Et pourquoi ton passeport a-t-il quatre tampons de plus ? »`,choices:[
     {t:'Inventer une histoire crédible',fn:()=>{if(chance(.45+L.st.smarts/250)){rel(2);return out(L,`${nm} hoche la tête. Ton histoire de salon professionnel tient la route.`)}rel(-6);return out(L,`${nm} lève un sourcil. Il y a des détails que même un faux salon ne peut expliquer.`)}},
     {t:'En dire un peu plus',fn:()=>{coverDn(S,10);rel(6);return out(L,`Tu glisses à ${nm} que tu « travailles pour l’administration ». C’est vrai, techniquement.`)}},
     {t:'Te vexer et changer de sujet',fn:()=>{rel(-8);return out(L,'La soirée est un peu glaciale. La fondue a refroidi.')}}]});}},
 {w:2,ok:(L,S)=>S.rank>=1,run(L,S){
   const c=foreign(L);
   modal({...ttl(L),text:`Un « consultant en développement » de ${c} t’invite à déjeuner et glisse que ses employeurs paient bien les gens bien informés.`,choices:[
     {t:'Refuser net',fn:()=>{chg(L,{karma:2});S.merit+=1;return out(L,'Tu paies l’addition et pars sans tourner la tête.')}},
     {t:'Jouer double jeu',fn:()=>{if(chance(.4+L.st.smarts/250+L.hid.willpower/500)){S.intel=Math.min(3,S.intel+1);S.merit+=6;promo(L,S);return out(L,'Tu nourris l’adversaire de fausses informations, et tu en retires de vraies (+1 renseignement).')}return incident(L,S,2)}},
     {t:'Tout rapporter à ton chef',fn:()=>{S.merit+=3;return out(L,'Ton chef sourit enfin. Il aime les agents qui racontent leurs déjeuners.')}}]});}},
 {w:2,ok:()=>true,run(L,S){
   modal({...ttl(L),text:'Audit interne : un inspecteur du Service vérifie que ta couverture professionnelle est irréprochable. Il demande à voir ta « fiche de poste » et ta machine à café.',choices:[
     {t:'Présenter des dossiers impeccables',fn:()=>{if(chance(.4+L.hid.discipline/220)){S.cover=clamp(S.cover+R(6,12));S.merit+=2;return out(L,'L’inspecteur est conquis par ton classement en couleurs.')}coverDn(S,8);return out(L,'Il remarque une incohérence de date. Il note. Beaucoup.')}},
     {t:'Charmer l’inspecteur',fn:()=>{if(chance(.35+L.st.looks/260)){S.cover=clamp(S.cover+R(3,8));return out(L,'Il repart avec un sourire et un pot de miel de ta région.')}S.merit=Math.max(0,S.merit-2);return out(L,'Il n’est pas sensible à ton charme. Ni au miel.')}}]});}},
 {w:2,ok:(L,S)=>S.heat>=20||S.cover<60,run(L,S){
   modal({...ttl(L),text:'Un journaliste d’investigation te recontacte pour la troisième fois : « Cette société de conseil dont vous parlez, elle n’a ni employés ni locaux, non ? »',choices:[
     {t:'Démentir fermement',fn:()=>{if(chance(.5+L.st.smarts/300)){return out(L,'Ton démenti est si ferme qu’il en devient convaincant.')}coverDn(S,10);chg(L,{fame:2});return out(L,'Ton démenti est repris par trois sites. Pas dans le bon sens.')}},
     {t:L.money>=15000?`Acheter son silence (${fmt(15000)})`:'Lui offrir un déjeuner',fn:()=>{if(L.money>=15000){spend(L,15000);chg(L,{karma:-3});return out(L,'Le journaliste a soudain un autre sujet. Dommage pour lui, pratique pour toi.')}if(chance(.35)){return out(L,'Autour d’un confit de canard, il oublie ses questions.')}heatUp(S,6);return out(L,'Il mange, il prend des notes, il repart.')}},
     {t:'Le laisser enquêter',fn:()=>{heatUp(S,8);coverDn(S,8);return out(L,'Son papier ne sortira peut-être jamais. Peut-être.')}}]});}},
 {w:3,ok:(L,S)=>actives(S).length>0&&S.rank>=1,run(L,S){
   const m=pick(actives(S));
   modal({...ttl(L),text:`${m.first} ${m.last} sonne l’alarme : on le suit, il craint d’être démasqué. Il demande ton aide.`,choices:[
     {t:L.money>=8000?`Organiser son exfiltration (${fmt(8000)})`:'Lui conseiller de se mettre au vert',fn:()=>{if(L.money>=8000)spend(L,8000);if(chance(.7)){m.loyal=clamp(m.loyal+R(8,14));return out(L,`${m.first} disparaît quelques semaines puis réapparaît, à ton service pour la vie.`)}m.st='grillé';S.burned++;return out(L,`${m.first} est repéré à la gare. Il est maintenant grillé.`)}},
     {t:'Le laisser se débrouiller',fn:()=>{chg(L,{karma:-3});m.loyal=clamp(m.loyal-R(12,20));if(chance(.5)){m.st='grillé';S.burned++;return out(L,`${m.first} se fait cueillir. Tu le saurais en lisant le journal.`)}return out(L,`${m.first} s’en sort seul. Il ne t’oubliera pas.`)}}]});}},
 {w:2,ok:L=>fronts(L).length>0,run(L,S){
   const f=fronts(L)[0];
   modal({...ttl(L),text:`Un contrôleur des impôts s’intéresse de très près à « ${f.name.toLowerCase()} », dont la comptabilité ressemble à un roman de science-fiction.`,choices:[
     {t:'Le recevoir avec un café et des papiers en règle',fn:()=>{if(chance(.55+L.hid.discipline/250)){S.cover=clamp(S.cover+4);return out(L,'Contrôle terminé. Le contrôleur repart avec un croissant et une pile de reçus.')}spend(L,6000);return out(L,'Redressement mineur : 6 000 €. La légende a un coût.')}},
     {t:'Demander l’appui du Service',fn:()=>{S.merit=Math.max(0,S.merit-1);return out(L,'Un coup de téléphone, et le dossier s’égare miraculeusement. On te le rappellera.')}}]});}},
 {w:2,ok:(L,S)=>S.rank>=2,run(L,S){
   const g=primeOf(S,3,.9);
   modal({...ttl(L),text:'Ton chef t’attend dans la salle de crise : une affaire urgente, un délai de quarante-huit heures, et pas d’autre volontaire.',choices:[
     {t:'Prendre l’affaire',pri:1,fn:()=>{if(chance(.45+(L.st.smarts+L.hid.willpower)/400)){earn(L,g,1);S.merit+=7;promo(L,S);return out(L,`Tu boucles le dossier à temps. Prime exceptionnelle : ${fmt(g)}.`)}coverDn(S,10);chg(L,{stress:6});return out(L,'Le délai était vraiment trop court. Ton chef évitera de t’en reparler.')}},
     {t:'Décliner poliment',fn:()=>{S.merit=Math.max(0,S.merit-1);chg(L,{stress:-2});return out(L,'Quelqu’un d’autre s’en charge. Tu as passé une soirée tranquille.')}}]});}}
];
function alerts(L){
  const S=sp(L);if(!isActive(L,S)||L.prison||L.age<20)return 0;
  let n=0;const pool=ALERTS.filter(a=>{try{return a.ok(L,S)}catch(e){return false}});
  const rolls=chance(.55)?(S.rank>=3&&chance(.25)?2:1):0;
  for(let i=0;i<rolls&&pool.length;i++){
    const w={};pool.forEach((a,j)=>w[j]=a.w);const j=+wpick(w);const a=pool.splice(j,1)[0];
    try{a.run(L,S);n++}catch(e){console.error(e)}
  }
  return n;
}

/* ---------- Panneaux ---------- */
function pSpy(){
  const L=cur();const S=sp(L);
  if(!S)return pRecruit(L);
  if(S.out)return pOut(L,S);
  if(S.ret)return {title:'Service Hexagone',html:card('Retraité du Service',rankName(L,S),`${S.missions} mission${S.missions>1?'s':''} réussie${S.missions>1?'s':''}`)+note('Tu es à la retraite, mais le Service n’oublie rien. Ni toi.')+group('Façades',[nav('🏪','Mes façades',`${fronts(L).length} bien${fronts(L).length>1?'s':''}`,pFronts)])};
  const next=S.rank<4?MERIT[S.rank+1]:MERIT[4];const lo=MERIT[S.rank];
  const pct=S.rank>=4?100:clamp((S.merit-lo)/(next-lo)*100);
  const mm=members(S);
  const H=[
    card('Agent secret',rankName(L,S),`${S.missions} mission${S.missions>1?'s':''} réussie${S.missions>1?'s':''} · couverture : ${jobName(L)} · solde ${fmt(PAY[rk(S)])} par an`,statLine('Couverture',S.cover)+statLine('Discrétion',100-S.heat)+(S.rank<4?statLine('Avancement',pct):'')+(S.intel>0?`<p class="note">Renseignement en réserve : ${S.intel}.</p>`:'')),
    L.prison?note('Tu es en prison à l’étranger. Le Service négocie en coulisses.'):'',
    group('Opérations',[
      nav('🗺️','Missions d’infiltration',`${offers(L,S).length} offre${offers(L,S).length>1?'s':''} cette année`,pMissions),
      nav('🎯','Neutraliser une cible','Capturer, discréditer, exfiltrer ou laisser filer',pTargets),
      act(L,{ic:'💻',t:'Voler des données',s:'Mini-jeu : séquence de codes',key:'spyd',dis:L.prison?'En prison':'',nav:pHacks})]),
    group('Réseau et couverture',[
      nav('🕵️','Mon réseau',`${mm.length}/${capOf(S)} contact${mm.length>1?'s':''} · ${actives(S).length} actif${actives(S).length>1?'s':''}`,pNet),
      nav('🏪','Façades',`${fronts(L).length} bien${fronts(L).length>1?'s':''} · protègent ta couverture`,pFronts),
      nav('📁','Dossier personnel','Journal des opérations et état de service',pDossier)]),
    group('',[row({ic:'🚪',t:'Démissionner du service',danger:1,a:()=>pushPanel(confirmP('Quitter le service ?','Tu devras garder le secret toute ta vie, et ton réseau sera dissous.',()=>{L.spy=null;return out(L,'Tu rends ton badge. Officiellement, tu n’as jamais existé.')}))})])
  ];
  return {title:'Service Hexagone',html:H.join('')};
}
function pHacks(){
  const L=cur();const S=sp(L);if(!S)return pRecruit(L);
  return {title:'Vol de données',html:note('Retiens la séquence de codes puis clique dessus dans l’ordre. Une erreur coûte un essai ; à zéro, l’alarme sonne.')+group('Choisir une cible',HACKS.map(([lvl,n,s])=>act(L,{ic:'💻',t:n,s:`${s} · niveau ${lvl}`,key:'spyd',dis:lvl>rk(S)+1?`Réservé au grade ${RANKS[lvl-1].toLowerCase()}`:L.prison?'En prison':'',fn:L=>{STACK.pop();pHack(L,S,lvl);return ''}})))};
}
function pRecruit(L){
  const miss=reqMiss(L,{age:22,deg:['*lic','*master','*doc'],smarts:60,clean:1});
  return {title:'Service Hexagone',html:note('Le Service Hexagone recrute des esprits brillants, discrets et sans casier judiciaire. Tu garderas ton emploi actuel comme couverture, et tu ne pourras jamais en parler.')+card('Conditions','22 ans, une licence ou plus, intelligence 60 % min., casier vierge','')+group('Recrutement',[act(L,{ic:'🕶️',t:'Passer les épreuves de sélection',s:'Test psychotechnique, filature, entretien',dis:miss,key:'spytry',fn:L=>{selection(L);return ''}})])};
}
function pOut(L,S){
  const wait=Math.max(0,S.ban-L.age);
  return {title:'Service Hexagone',html:card('Radié du Service',rankName(L,S),`${S.missions} mission${S.missions>1?'s':''} réussie${S.missions>1?'s':''}`)+note(wait?`On ne revient pas dans le Service avant ${An(wait)}.`:'Un ancien contact te laisse entendre qu’une réintégration discrète reste possible.')+group('',[
    act(L,{ic:'🔁',t:'Demander une réintégration',s:'Chances limitées',dis:wait?`Dans ${An(wait)}`:'',key:'spyre',fn:L=>{
      if(chance(.3+L.st.smarts/300-(L.record?.15:0))){S.out=0;S.ban=0;S.rank=Math.max(0,S.rank-1);S.cover=60;S.heat=20;S.merit=MERIT[S.rank];return out(L,'🕶️ Le Service te reprend, à un grade en dessous et sous haute surveillance.')}
      return out(L,'La réponse est une jolie lettre polie qui ne dit rien du tout.')}})])};
}
function pMissions(){
  const L=cur();const S=sp(L);if(!S)return pRecruit(L);
  const o=offers(L,S);
  return {title:'Missions',html:note('Une mission par an. Chaque étape propose plusieurs approches : la bonne dépend de la situation, de tes talents et de ton réseau. Un renseignement en réserve améliore tes chances.')+group('Offres du Service',o.map(({M,city})=>act(L,{ic:M.ic||'🗺️',t:M.n,s:`${city} · ${M.steps.length} étapes · prime d’environ ${fmtk(primeOf(S,M.steps.length))}`,key:'spym',dis:L.prison?'En prison':'',fn:L=>{STACK.pop();startMission(L,M,city);return ''}})))};
}
function pTargets(){
  const L=cur();const S=sp(L);if(!S)return pRecruit(L);
  return {title:'Cibles',html:note('Le Service préfère les solutions propres : on capture, on discrédite, on exfiltre, ou on regarde passer. Une opération par an.')+group('Cibles identifiées',targets(L,S).map(T=>act(L,{ic:'🎯',t:T.name,s:`${cap(T.role)} · ${T.city} · menace ${'●'.repeat(T.lvl)}${'○'.repeat(3-T.lvl)}`,key:'spyt',dis:L.prison?'En prison':'',fn:L=>{STACK.pop();targetOp(L,S,T);return ''}})))};
}
function pNet(){
  const L=cur();const S=sp(L);if(!S)return pRecruit(L);
  const mm=members(S);
  return {title:'Mon réseau',html:note('Sources et agents sont ta force : ils t’apportent des informations et un appui sur le terrain. Mais ils peuvent être grillés, perdus ou retournés.')+card('Réseau',`${mm.length} / ${capOf(S)}`,'La taille maximale augmente avec ton grade')+group('Recruter',[act(L,{ic:'🤝',t:'Recruter une source',s:'Approcher un candidat',key:'spyr',dis:mm.length>=capOf(S)?'Réseau au maximum':L.prison?'En prison':'',fn:L=>{recruitFlow(L);return ''}})])+(mm.length?group('Contacts',mm.map(m=>row({av:avatar(m),t:`${m.first} ${m.last}`,s:`${cap(roleName(m))} · ${m.job} · ${stName(m)} · compétence ${m.skill} % · loyauté ${m.loyal} %`,right:'›',a:()=>pushPanel(pMemberOf(m.id))}))):note('Ton réseau est vide pour l’instant.'))};
}
const pMemberOf=id=>()=>{
  const L=cur();const S=sp(L);const m=S&&S.net.find(x=>x.id===id);
  if(!m)return {title:'Contact',html:note('Ce contact n’existe plus.')};
  const H=[card(`${m.first} ${m.last}`,cap(roleName(m)),`${m.job} · ${An(m.age)} · ${stName(m)}`,statLine('Compétence',m.skill)+statLine('Loyauté',m.loyal))];
  const drop=lab=>row({ic:'🚪',t:lab,danger:1,a:()=>pushPanel(confirmP(lab,`${m.first} sera retiré de ton réseau.`,()=>{S.net=S.net.filter(x=>x.id!==id);STACK.pop();if(m.pid){const f=L.family.find(p=>p.id===m.pid);if(f)f.rel=clamp(f.rel-15)}if(m.loyal<40&&chance(.4)){heatUp(S,8);return out(L,`${m.first} est parti${m.gender==='F'?'e':''} fâché${m.gender==='F'?'e':''}. Il pourrait parler.`)}return out(L,`${m.first} quitte ton réseau.`)}))});
  if(m.st==='actif'){
    H.push(group('Entretenir',[
      act(L,{ic:'💶',t:'Verser une prime',s:fmt(2500),cost:2500,key:'spyp'+id,fn:L=>{m.loyal=clamp(m.loyal+R(6,12));return out(L,`${m.first} apprécie ton geste. Sa loyauté grimpe.`)}}),
      act(L,{ic:'🍷',t:'Rencontre discrète',s:'Gagner sa confiance',key:'spym'+id,fn:L=>{m.loyal=clamp(m.loyal+R(3,8));if(chance(.15)){heatUp(S,R(2,5));return out(L,`Vous bavardez longuement, trop peut-être : un serveur vous a regardés un peu longuement.`)}return out(L,`Un long dîner avec ${m.first}. Vous parlez surtout de tout autre chose.`)}}),
      act(L,{ic:'🎓',t:'Formation aux techniques',s:fmt(4000),cost:4000,key:'spyf'+id,fn:L=>{m.skill=clamp(m.skill+R(4,9));return out(L,`${m.first} apprend à semer une filature et à lire sur les lèvres.`)}})]));
    H.push(group('',[drop('Congédier')]));
  }else if(m.st==='grillé'){
    H.push(note(`${m.first} est grillé${m.gender==='F'?'e':''}. Chaque jour compte.`));
    H.push(group('Que faire ?',[
      act(L,{ic:'🛫',t:'L’exfiltrer',s:fmt(12000),cost:12000,key:'spyx'+id,fn:L=>{if(chance(.55+L.st.smarts/300)){m.st='actif';m.loyal=clamp(m.loyal+R(8,16));return out(L,`${m.first} est sain${m.gender==='F'?'e':''} et sauf${m.gender==='F'?'ve':''}. Il te doit une fière chandelle.`)}m.st='perdu';S.lost++;S.net=S.net.filter(x=>x.id!==id);STACK.pop();chg(L,{karma:-3,happy:-8});return out(L,`L’exfiltration échoue. ${m.first} est perdu${m.gender==='F'?'e':''} pour le Service.`)}}),
      row({ic:'🕯️',t:'L’abandonner à son sort',danger:1,a:()=>pushPanel(confirmP('Abandonner ?',`${m.first} sera perdu.`,()=>{m.st='perdu';S.lost++;S.net=S.net.filter(x=>x.id!==id);STACK.pop();chg(L,{karma:-8,happy:-10});return out(L,`Tu laisses tomber ${m.first}. Tu ne dormiras pas très bien.`)}))})]));
  }else{
    H.push(note(`${m.first} a été retourné${m.gender==='F'?'e':''} : il travaille pour l’autre camp et brouille tes opérations.`));
    H.push(group('Que faire ?',[
      act(L,{ic:'🎭',t:'Le retourner à nouveau',s:'Contre-intoxication',key:'spyc'+id,fn:L=>{if(chance(.35+L.st.smarts/250)){m.st='actif';m.loyal=55;S.merit+=3;S.intel=Math.min(3,S.intel+1);return out(L,`Joli coup : ${m.first} redevient ton agent… et te livre des secrets de ses nouveaux patrons (+1 renseignement).`)}heatUp(S,8);coverDn(S,6);return out(L,`${m.first} t’envoie balader. Mauvaise idée.`)}}),
      drop('L’écarter du réseau')]));
  }
  return {title:`${m.first} ${m.last}`,html:H.join('')};
};
function pFronts(){
  const L=cur();const S=sp(L);const F=fronts(L);
  const H=[note('Une façade respectable explique tes revenus et tes déplacements, et amortit les scandales.')];
  if(F.length)H.push(group('Mes façades',F.map(f=>row({ic:'🏪',t:f.name,s:`Valeur ${fmt(f.value||0)}`,right:'›',a:()=>pushPanel(pAsset(f.id))}))));
  if(S&&isActive(L,S)&&F.length)H.push(group('Entretien',[act(L,{ic:'🧾',t:'Soigner la légende',s:fmt(2000*F.length),cost:2000*F.length,key:'spyfr',fn:L=>{S.cover=clamp(S.cover+R(6,12));return out(L,'Livre de comptes impeccable, personnel sympathique, clients figurants : la façade brille.')}})]));
  H.push(group('Acquérir une façade',FRONTS.map(([n,p])=>act(L,{ic:'🏪',t:n,s:`${fmt(p)} · protège ta couverture`,cost:p,dis:F.some(f=>f.name===n)?'Déjà acquise':'',fn:L=>{L.assets.push({id:nid(),kind:'front',name:n,value:p});return out(L,`Tu achètes une façade : ${n.toLowerCase()}. Officiellement, c’est ton investissement préféré.`)}}))));
  return {title:'Façades',html:H.join('')};
}
function pDossier(){
  const L=cur();const S=sp(L);if(!S)return pRecruit(L);
  const log=S.log.slice(-8).reverse();
  return {title:'Dossier personnel',html:card('État de service',rankName(L,S),`Entré${ge(L,'','e')} au Service à ${An(S.since)}`,'')+card('Bilan',`${S.missions} missions`,`${S.lost} contact${S.lost>1?'s':''} perdu${S.lost>1?'s':''} · ${S.burned} grillé${S.burned>1?'s':''}`)+(log.length?group('Journal',log.map(t=>`<p class="note">${esc(t)}</p>`)):note('Rien à signaler. Officiellement, rien ne signale jamais rien.'))};
}

/* ---------- Recrutement : épreuves ---------- */
function selection(L){
  let ok=0;
  const ep=(title,text,opts)=>({title,text,opts});
  const E=[
    ep('Test psychotechnique','Soixante questions en quarante minutes, dans une salle sans fenêtre. Ton approche ?',[['Répondre vite à tout',L.st.smarts],['Prendre ton temps, méthodiquement',L.hid.discipline],['Te fier à ton intuition',100-Math.abs(L.hid.crazy-40)]]),
    ep('Filature d’entraînement','On te demande de suivre un inconnu dans Paris pendant deux heures sans te faire repérer.',[['Rester à distance',(L.hid.athletic+L.hid.willpower)/2],['Te fondre dans la foule',L.st.looks],['Te faire passer pour un touriste',(L.st.smarts+L.st.looks)/2]]),
    ep('Entretien final','Trois examinateurs impassibles. L’un d’eux joue avec un stylo. L’autre n’a pas cillé depuis dix minutes.',[['Répondre avec franchise',(L.hid.karma+L.hid.willpower)/2],['Mentir avec aplomb',(L.st.smarts+L.hid.crazy)/2],['Poser toi-même une question',(L.st.smarts+L.hid.discipline)/2]])
  ];
  const step=i=>{
    if(i>=E.length){
      if(ok>=2){L.spy=newSpy(L);chg(L,{happy:10});logS(L,L.spy,'entrée au Service Hexagone');return out(L,'🕶️ Bienvenue au Service Hexagone. Tu ne diras jamais rien à personne, y compris à ton chat.')}
      return out(L,'Ta candidature est écartée. On te remercie de ton intérêt pour l’administration, sans autre précision.');
    }
    const e=E[i];
    modal({title:`${e.title} · ${i+1}/3`,icon:'🕶️',text:e.text,choices:e.opts.map(([lab,sc])=>({t:lab,fn:()=>{const good=chance(clampN(.28+sc/160,.1,.85));if(good)ok++;const o=out(L,good?`${e.title} : réussi.`:`${e.title} : tu as fait mieux.`);step(i+1);return o}}))});
  };
  step(0);
}

/* ---------- Évènements JSON ---------- */
const conds={actif(L,a){const S=sp(L);return isActive(L,S)&&!L.prison&&S.rank>=((a&&a.rank)||0)},
  reseau(L){const S=sp(L);return isActive(L,S)&&actives(S).length>0}};
const effects={
  merit(L,a){const S=sp(L);if(!S)return '';S.merit+=(a&&a.n)||3;promo(L,S);return ''},
  cover(L,a){const S=sp(L);if(!S)return '';S.cover=clamp(S.cover+((a&&a.n)||0));if(a&&a.heat)heatUp(S,a.heat);return ''},
  entrainer(L,a){const S=sp(L);if(!S)return '';const m=pick(actives(S));if(!m)return '';m.skill=clamp(m.skill+R(3,7));return `${m.first} progresse.`},
  prime(L,a){const S=sp(L);if(!S)return '';const m=pick(actives(S));if(!m)return '';if(L.money>=1500){spend(L,1500);m.loyal=clamp(m.loyal+R(5,10));return `Tu aides ${m.first}.`}return ''},
  scandale(L){const S=sp(L);if(!S)return '';return incident(L,S,1)},
  fete(L){const S=sp(L);if(!S)return '';S.intel=Math.min(3,S.intel+1);return 'Un renseignement glané au passage.'}
};
const eventsDb=[
 {id:'spy_decoration',category:'career_event',icon:'🎖️',once:true,conditions:{min_age:30,mod_cond:{mod:MOD,fn:'actif',args:{rank:2}}},probability_weight:.12,
  prompt_text:'Le directeur du Service te convoque pour une cérémonie à huis clos : on te remet une médaille que tu ne pourras jamais porter.',
  choices:[{choice_text:'Accepter, ému',consequences:{happiness_modifier:6,mod_effect:{mod:MOD,fn:'merit',args:{n:6}},result_text:'Une poignée de main, un diplôme sans nom. Précieux.'}},
           {choice_text:'Refuser poliment',consequences:{karma_modifier:2,mod_effect:{mod:MOD,fn:'merit',args:{n:2}},result_text:'Ton directeur sourit : modeste, en plus.'}}]},
 {id:'spy_collegue',category:'social',icon:'☕',conditions:{min_age:22,mod_cond:{mod:MOD,fn:'actif',args:{}}},probability_weight:.1,
  prompt_text:'Une collègue du Service t’invite à boire un verre, sans parler de travail. Enfin, on va essayer.',
  choices:[{choice_text:'Y aller',consequences:{happiness_modifier:5,add_friend:{},stress_level_increment:-2,result_text:'Vous parlez de cinéma, de cuisine et de tout, sauf de ce qui vous réunit.'}},
           {choice_text:'Rentrer te reposer',consequences:{happiness_modifier:1,health_modifier:1}}]},
 {id:'spy_vacances',category:'life_event',icon:'🧳',conditions:{min_age:22,mod_cond:{mod:MOD,fn:'actif',args:{}}},probability_weight:.12,
  prompt_text:'Tes vacances à la mer sont annulées à la dernière minute : « une affaire urgente ». Tu rembourses les billets de train en silence.',
  consequences:{happiness_modifier:-4,stress_level_increment:3,mod_effect:{mod:MOD,fn:'merit',args:{n:2}}}},
 {id:'spy_famille',category:'family',icon:'🍽️',conditions:{min_age:22,has_kids:true,mod_cond:{mod:MOD,fn:'actif',args:{}}},probability_weight:.09,
  prompt_text:'Ton enfant demande devant tout le monde : « Papa, maman, ça fait quoi, exactement, ton travail ? »',
  choices:[{choice_text:'« Conseil en organisation. »',consequences:{relationship_parents_modifier:0,mod_effect:{mod:MOD,fn:'cover',args:{n:2}},result_text:'Un mot aussi ennuyeux qu’efficace : plus personne n’a posé de question.'}},
           {choice_text:'Faire une blague et changer de sujet',consequences:{happiness_modifier:2,mod_effect:{mod:MOD,fn:'cover',args:{n:-3,heat:2}},result_text:'Le silence est un peu long. Ta sœur glisse un « bon, le dessert ? ».'}}]},
 {id:'spy_vieil_agent',category:'social',icon:'🧓',conditions:{min_age:35,mod_cond:{mod:MOD,fn:'reseau',args:{}}},probability_weight:.08,
  prompt_text:'Un ancien du Service, à la retraite depuis vingt ans, te prend à part dans un café : il connaît toutes les ficelles et veut les transmettre à ton réseau.',
  choices:[{choice_text:'Le laisser former tes agents',consequences:{mod_effect:{mod:MOD,fn:'entrainer',args:{}},happiness_modifier:3}},
           {choice_text:'Décliner, par prudence',consequences:{mod_effect:{mod:MOD,fn:'cover',args:{n:3}}}}]},
 {id:'spy_reseau_aide',category:'social',icon:'🤝',conditions:{min_age:25,mod_cond:{mod:MOD,fn:'reseau',args:{}}},probability_weight:.1,
  prompt_text:'L’un de tes contacts traverse une mauvaise passe : une facture inattendue, un enfant malade. Il n’ose pas demander.',
  choices:[{choice_text:'Lui donner un coup de main (1 500 €)',consequences:{karma_modifier:3,mod_effect:{mod:MOD,fn:'prime',args:{}}}},
           {choice_text:'Faire comme si de rien n’était',consequences:{karma_modifier:-1}}]},
 {id:'spy_cocktail',category:'social',icon:'🥂',conditions:{min_age:25,mod_cond:{mod:MOD,fn:'actif',args:{rank:1}}},probability_weight:.08,
  prompt_text:'Un cocktail mondain réunit toute la diplomatie parisienne. Tu y vas « par hasard », évidemment.',
  choices:[{choice_text:'Écouter aux portes du buffet',consequences:{mod_effect:{mod:MOD,fn:'fete',args:{}},happiness_modifier:2}},
           {choice_text:'Parler de la météo toute la soirée',consequences:{happiness_modifier:1}}]},
 {id:'spy_fuite_presse',category:'career_event',icon:'📰',conditions:{min_age:28,max_hidden:{karma:60},mod_cond:{mod:MOD,fn:'actif',args:{rank:2}}},probability_weight:.03,
  prompt_text:'Un site d’information publie des extraits de notes internes. Ton nom n’y figure pas… mais un ancien de ton équipe s’y trouve.',
  consequences:{mod_effect:{mod:MOD,fn:'scandale',args:{}}}}
];

/* ---------- Module ---------- */
const entry=L=>{const S=sp(L);return {ic:'🕶️',t:'Service de renseignement',s:isActive(L,S)?`${rankName(L,S)} · ${members(S).length} contact${members(S).length>1?'s':''} · couverture ${S.cover} %`:S&&S.out?'Radié du Service':S&&S.ret?'À la retraite du Service':'Rejoins le Service Hexagone (secret)',panel:pSpy,min:18}};
registerMod({
  id:MOD,
  worldInit(){},
  year(L){
    const S=sp(L);if(!S)return;
    if(S.out||S.ret)return;
    if(L.prison){
      if(S.abroad&&chance(.25)){L.prison=0;S.abroad=0;S.cover=40;L.jail={gang:null,resp:0};say(L,'🕊️ Après des négociations discrètes, tu es libéré dans le cadre d’un échange de prisonniers. Personne ne te posera de questions.');logS(L,S,'libéré lors d’un échange de prisonniers')}
      return;
    }
    if(S.abroad)S.abroad=0;
    if(L.age>=65){S.ret=1;say(L,'🕶️ Tu pars à la retraite du Service Hexagone avec une montre et un silence éternel.');return}
    earn(L,PAY[rk(S)]);
    S.merit+=R(1,3);S.cover=clamp(S.cover+R(2,5)+Math.min(3,fronts(L).length)*3);S.heat=clamp(S.heat-R(4,9));
    const lines=[];
    S.net.forEach(m=>{
      m.age++;
      if(m.st==='actif'){
        m.loyal=clamp(m.loyal+R(-7,2));m.skill=clamp(m.skill+R(0,2));
        if(chance(clampN(.03+S.heat/500-m.skill/1200+(S.cover<40?.05:0),.01,.25))){m.st='grillé';S.burned++;lines.push(`${m.first} ${m.last} est grillé${m.gender==='F'?'e':''}.`)}
        else if(m.loyal<32&&chance(.3)){m.st='retourné';lines.push(`${m.first} ${m.last} est passé${m.gender==='F'?'e':''} à l’ennemi.`)}
      }else if(m.st==='grillé'){
        if(chance(.5)){m.st='perdu';S.lost++;chg(L,{karma:-3,happy:-6});lines.push(`${m.first} ${m.last} a disparu après avoir été grillé${m.gender==='F'?'e':''}.`)}
      }else if(m.st==='retourné'){coverDn(S,4);heatUp(S,4)}
      m.rel=m.loyal;
    });
    S.net=S.net.filter(m=>m.st!=='perdu');
    if(lines.length)say(L,'🕵️ '+lines.join(' '));
    if(S.cover<15&&chance(.25)){say(L,'Ta couverture vacille sérieusement ces temps-ci.');incident(L,S,1)}
    if(chance(.18)){const fr=friends(L);if(fr.length){const f=pick(fr);f.rel=clamp(f.rel-R(2,5));say(L,`🍽️ Tu as annulé tant de dîners que ${f.first} ne t’invite plus qu’à contrecœur.`)}}
    promo(L,S);
  },
  events(L){return alerts(L)},
  eventsDb,conds,effects,
  workRows(L){return L.age>=18?[nav('🕶️','Service de renseignement',entry(L).s,pSpy)]:[]},
  activities(L){return [entry(L)]},
  jailed(L){const S=sp(L);if(S&&!S.out&&!S.ret&&!S.abroad){S.out=1;S.ban=L.age+8;S.net=[];say(L,'🕶️ Le Service te radie : un casier judiciaire est incompatible avec la fonction.')}},
  personRows(L,p){
    const S=sp(L);if(!isActive(L,S)||!p||p.type!=='friend'||p.alive===false||p.age<18||p.player)return [];
    if(S.net.some(m=>m.pid===p.id))return [];
    return [act(L,{ic:'🕶️',t:'Sonder comme source',s:`Réseau : ${members(S).length}/${capOf(S)}`,key:'spyso'+p.id,dis:members(S).length>=capOf(S)?'Réseau au maximum':L.prison?'En prison':'',fn:L=>{
      const pr=clampN(.2+(p.rel||50)/200+L.st.smarts/500,.1,.75);
      if(chance(pr)){const m=mkMember(L,{first:p.first,last:p.last,gender:p.gender,age:p.age,look:p.look,job:p.job||'sans profession',skill:clamp(p.smarts||R(30,70))},chance(.5)?'agent':'source',(p.rel||60)-R(0,15),p.id);S.net.push(m);S.merit+=2;logS(L,S,`${p.first} recruté parmi tes amis`);return out(L,`🕶️ ${p.first} accepte de t’aider. Il croit sans doute rendre un service à un ami.`)}
      p.rel=clamp((p.rel||50)-15);heatUp(S,R(2,5));return out(L,`${p.first} se vexe : « Tu me prends pour qui ? » Votre amitié en prend un coup.`)}})];
  }
});
})();
