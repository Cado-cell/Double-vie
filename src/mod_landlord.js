/* Deux Vies — module « Propriétaire bailleur » (id landlord)
   Gestion locative complète : biens à rénover, travaux, sélection des locataires par entretien, loyers,
   impayés, procédure d’expulsion, assurances, agence, évènements d’arrière-plan.
   État : L.landlord (compteurs, historique, options) ; par bien : a.rented, a.cond, a.tier, a.works, a.pend, a.pos, a.cands, a.evict, a.vacY.
   Réutilise le format de mod_legacy.js : a.rented={name,rent,rel,late,...} (champs manquants initialisés). */
(()=>{
const MOD='landlord';

/* ---------- Données ---------- */
const POS={bas:{n:'Un peu moins cher que les autres',m:.88,s:'Plus de candidats sérieux, et des locataires qui restent'},
  marche:{n:'Au prix habituel',m:1,s:'Le bon équilibre entre loyer et logement vide'},
  haut:{n:'Plus cher que les autres',m:1.15,s:'Plus de loyer… si quelqu’un accepte de signer'}};
const TIERN=['Standard','Soigné','Haut de gamme'];
const JOBS=[['serveur','serveuse',19000,8],['infirmier','infirmière',31000,15],['professeur des écoles','professeure des écoles',33000,20],
  ['développeur','développeuse',48000,10],['comptable','comptable',38000,15],['étudiant','étudiante',7000,0],['intérimaire','intérimaire',17000,3],
  ['auto-entrepreneur','auto-entrepreneuse',24000,6],['fonctionnaire territorial','fonctionnaire territoriale',32000,20],
  ['cadre commercial','cadre commerciale',58000,12],['chef cuisinier','cheffe cuisinière',34000,12],['retraité','retraitée',21000,0],
  ['artisan plombier','artisane plombière',36000,15],['pharmacien','pharmacienne',62000,10],['agent SNCF','agente SNCF',30000,15],
  ['community manager','community manager',27000,4]];
const TRAITS=['soigneux','tranquille','tranquille','bricoleur','bruyant','fêtard','procédurier'];
const GUAR={Aucun:'Personne ne se porte garant',Parents:'Ses parents paieront s’il ne peut pas',Visale:'Garantie de l’État (Visale)',Société:'Une société paiera à sa place'};
const NEIGH=['Mme Lambert, du troisième','M. Fournier, président du conseil syndical','le voisin du dessous','la gardienne de l’immeuble','un voisin retraité très vigilant','Mme Bouchard, du palier d’en face'];
const TIER_EMO=['😬','😐','🙂'];
const STYLES=[{t:'Poser la question sans détour',acc:.88,vex:.12},{t:'Demander poliment, en laissant parler',acc:.72,vex:0},{t:'En parler comme entre amis, sans insister',acc:.55,vex:0}];
const QS=[
 {k:'départ',q:'Pourquoi quittez-vous votre logement actuel ?',ans:[
  ['Il se plaint longuement de son propriétaire, des voisins, du syndic et du facteur. Les griefs se contredisent un peu.','Départ « un peu précipité ». Il change de sujet dès que tu demandes si le dépôt de garantie lui a été rendu.'],
  ['Le quartier est devenu trop bruyant à son goût. Rien d’alarmant, rien de très précis non plus.','Il cherche plus grand. L’ancien propriétaire « n’a pas fait d’histoires », dit-il, sans plus de détails.'],
  ['Il se rapproche de son travail et laisse un logement impeccable : son ancien bailleur lui a même écrit une lettre de recommandation.','Fin de bail, tout s’est très bien passé. Il te tend un quitus signé de son précédent propriétaire.']]},
 {k:'incident',q:'Si une fuite ou une panne survient, que faites-vous ?',ans:[
  ['Il hausse les épaules : « C’est au propriétaire de gérer, non ? » Il ne sait visiblement pas où se trouve le robinet d’arrêt.','Il répond en demandant qui paiera, avant même d’avoir évoqué la fuite.'],
  ['« Je vous appelle quand je peux. » Il a l’air sincère, mais pas pressé.','Il avoue qu’il attendrait un peu pour voir si ça se règle tout seul.'],
  ['Il prévient dans l’heure, photos à l’appui, et demande quel plombier tu préfères.','Il coupe l’eau, éponge, te prévient et te transmet le devis qu’il a déjà demandé. Tu l’embaucherais presque.']]},
 {k:'références',q:'Puis-je appeler votre précédent propriétaire ?',ans:[
  ['Il « n’a plus le numéro ». Un ami commun glisse qu’il y a eu des lettres de relance.','Il promet de te rappeler. Il ne te rappellera pas.'],
  ['Il hésite, puis donne un numéro. L’ancien bailleur est poli, vague, et ne le recommande pas à fond.','L’ancien propriétaire dit : « Il n’y a pas eu de problème majeur. » Le mot « majeur » reste dans l’air.'],
  ['Il note aussitôt le numéro. Au téléphone, l’ancien bailleur parle de lui comme du « locataire idéal ».','Il donne trois contacts d’un coup. Tous disent du bien de lui.']]},
 {k:'soirées',q:'Comment sont vos soirées et vos week-ends ?',ans:[
  ['Il parle de « grosses soirées » à trois reprises et sourit chaque fois un peu plus largement.','Il demande si l’insonorisation est bonne. Il ne dit pas pourquoi.'],
  ['Quelques amis de temps en temps, rien d’excessif, « enfin, ça dépend des week-ends ».','Cinéma, bar, canapé. Un profil tout à fait normal.'],
  ['Randonnée, cuisine et séries sous plaid. Les voisins ne l’entendront que tousser.','Il joue du violoncelle, mais avec une sourdine, précise-t-il spontanément.']]},
 {k:'justificatifs',q:'Pouvez-vous fournir vos trois derniers bulletins de paie en original ?',ans:[
  ['Les documents sont des photocopies pâlies, avec une police qui ne ressemble à rien. Hum.','Il se rappelle soudain qu’il a un autre rendez-vous.'],
  ['Il les enverra demain par courriel, promis : il les cherche dans ses papiers.','Il en retrouve deux sur trois dans son sac. Le troisième est « chez sa mère ».'],
  ['Il sort une pochette parfaitement classée. Même l’avis d’imposition y est.','Tout est là, agrafé par date, avec un surligneur jaune sur les montants.']]}
];

/* ---------- État ---------- */
function S(L){
  if(!L.landlord||typeof L.landlord!=='object')L.landlord={};
  const s=L.landlord;
  if(!Array.isArray(s.hist))s.hist=[];
  if(!Array.isArray(s.fix))s.fix=[];
  for(const k of ['income','lastPaid','unpaid','vacLoss','evictions','leases','bought','reno','bribes'])s[k]=+s[k]||0;
  if(s.fixAge==null)s.fixAge=-1;
  s.pno=!!s.pno;s.gli=!!s.gli;s.agency=!!s.agency;
  return s;
}
function hist(L,t){const s=S(L);s.hist.push({age:L.age,t});if(s.hist.length>40)s.hist.splice(0,s.hist.length-40);return t}
const houses=L=>(L.assets||[]).filter(a=>a&&a.kind==='house');
const lets=L=>houses(L).filter(a=>a.rented&&L.home!==a.id);
const kk=L=>costOf(L)||1;
const pct=(x,d=1)=>(x*100).toFixed(d).replace('.',',')+' %';
const ratioTxt=x=>x.toFixed(1).replace('.',',');
function norm(a){
  if(typeof a.cond!=='number'||isNaN(a.cond))a.cond=80;
  a.tier=Math.max(0,Math.min(2,+a.tier||0));
  a.works=Math.max(0,+a.works||0);a.vacY=+a.vacY||0;
  if(!POS[a.pos])a.pos='marche';
  if(a.apps)a.apps=null;
  if(a.rented){const r=a.rented;r.late=+r.late||0;r.arrears=+r.arrears||0;r.years=+r.years||0;r.rel=typeof r.rel==='number'?r.rel:60;
    if(r.since==null)r.since=0;if(!r.trait)r.trait='tranquille';if(!r.guar)r.guar='Aucun';if(!r.job)r.job='locataire';
    r.rent=Math.max(0,Math.round(+r.rent||0));if(r.dep==null)r.dep=Math.round(r.rent/12)}
  return a;
}
const fc=c=>.45+.55*Math.max(0,Math.min(100,c))/100;
const tf=t=>1+.12*t;
const baseOf=a=>a.value/(fc(a.cond)*tf(a.tier||0));
const maxRent=a=>Math.max(1800,Math.round(a.value*(.04+.004*(a.tier||0))*(.7+.4*a.cond/100)/100)*100);
function posOf(a){const r=a.rented;if(!r)return a.pos||'marche';const q=r.rent/maxRent(a);return q<.94?'bas':q>1.08?'haut':'marche'}
const dpe=a=>a.cond>=90?'A':a.cond>=80?'B':a.cond>=65?'C':a.cond>=50?'D':a.cond>=38?'E':a.cond>=25?'F':'G';
const dpeBan=a=>a.cond<25;
const first=r=>String(r.name||'Le locataire').split(' ')[0];
const lc=s=>String(s||'').toLowerCase();
const cover=(L,c)=>Math.round(c*(S(L).pno?.3:1)*(kk(L)>1?1:1));
const freeHouses=L=>houses(L).filter(a=>L.home!==a.id);
function statusOf(L,a){
  if(L.home===a.id)return 'Ta résidence';
  if(a.works>0)return `Travaux en cours (${a.works} an${a.works>1?'s':''})`;
  const r=a.rented;
  if(r)return `${r.name} · ${fmt(r.rent)} par an${r.arrears>0?` · impayés ${fmt(r.arrears)}`:r.late?' · retard de paiement':''}${a.evict?' · procédure en cours':''}`;
  return a.vacY>0?`Vide depuis ${a.vacY} an${a.vacY>1?'s':''}`:'Vide';
}
function income(L){return (L.job?salary(L):0)+(L.retired?L.pension||0:0)+(L.royal?400000:0)+Math.round(lets(L).reduce((t,a)=>t+a.rented.rent,0)*.7)}

/* ---------- Dossiers de candidature ---------- */
function genCands(L,a){
  norm(a);const mk=maxRent(a),pos=a.pos,pm=POS[pos].m,k=kk(L);
  const n=pos==='haut'?+wpick({0:.15,1:.3,2:.3,3:.25}):3;
  const list=[];
  for(let i=0;i<n;i++){
    const g=pick(['H','F']),J=pick(JOBS);
    const rent=Math.round(mk*pm*R(97,103)/100/10)*10;
    const real=Math.round(J[2]*k*R(80,125)/100/100)*100;
    const fake=chance(.1);
    const shown=fake?Math.round(real*R(125,160)/100/100)*100:real;
    const sen=J[3]?R(0,J[3]):0;
    const ratio=real/Math.max(1,rent);
    const guar=wpick(ratio<2.6?{Aucun:.2,Parents:.35,Visale:.3,Société:.15}:ratio<4?{Aucun:.45,Parents:.2,Visale:.2,Société:.15}:{Aucun:.75,Parents:.1,Visale:.05,Société:.1});
    const trait=pick(TRAITS);
    let rel=45+Math.max(-25,Math.min(20,(ratio-3)*5))+({Visale:8,Parents:6,Société:10,Aucun:0}[guar])+Math.min(sen,10)*1.2+R(-22,22)+(pos==='bas'?6:pos==='haut'?-6:0);
    if(trait==='fêtard')rel-=8;if(trait==='soigneux')rel+=5;if(fake)rel-=10;
    list.push({id:nid(),name:`${rname(g,L.country)} ${rlast(L.country)}`,g,job:g==='F'?J[1]:J[0],inc:shown,real,sen,guar,rent,rel:clamp(rel,8,98),trait,fake,clues:[],int:false,out:false,ret:J[0]==='retraité',stud:J[0]==='étudiant'});
  }
  return list;
}
function sign(L,a,c){
  norm(a);const s=S(L);
  if(a.rented||!a.cands||!a.cands.includes(c))return '';
  if(L.home===a.id)return 'Tu vis dans ce logement.';
  const elig=c.inc>=2.8*c.rent&&!c.fake;
  a.rented={name:c.name,g:c.g,job:c.job,rent:c.rent,rel:c.rel,late:0,arrears:0,since:L.age,years:0,guar:c.guar,trait:c.trait,inc:c.inc,dep:Math.round(c.rent/12),gliOk:elig,fake:c.fake,sen:c.sen};
  a.cands=null;a.vacY=0;a.lent=true;a.evict=null;s.leases++;
  trackMax(L,'rentals',lets(L).length);chg(L,{happy:2});
  hist(L,`${c.name} signe le bail de ${a.name.toLowerCase()} (${fmt(c.rent)} par an).`);
  return out(L,`🔑 ${a.name} est loué à ${c.name}, ${lc(c.job)}, pour ${fmt(c.rent)} par an.`);
}
function interview(L,a,c){
  const qs=shuffle(QS).slice(0,3);c.int=true;c.clues=[];
  const listHtml=()=>c.clues.length?`<p>${c.clues.map(x=>`${TIER_EMO[x.tone]} <b>${esc(x.k)}</b> : ${esc(x.a)}`).join('<br><br>')}</p>`:'';
  const finale=()=>{
    if(c.vexed&&chance(.5)){c.out=true;a.cands=(a.cands||[]).filter(x=>x!==c);
      modal({title:`Entretien · ${c.name}`,icon:'🗣️',text:`${first(c)} se lève, froissé par ton ton direct : « Je crois que je vais chercher ailleurs. » La porte claque doucement.`});return}
    modal({title:`Entretien · ${c.name}`,icon:'🤝',html:`<p>L’entretien est terminé. Voici ce que tu en retiens :</p>${listHtml()}<p class="muted">À toi de décider.</p>`,choices:[
      {t:'Lui confier les clés (signer le bail)',pri:1,fn:()=>sign(L,a,c)},
      {t:'Garder le dossier sous le coude',fn:()=>''},
      {t:'Refuser le dossier',fn:()=>{a.cands=(a.cands||[]).filter(x=>x!==c);return `Dossier de ${first(c)} décliné.`}}]});
  };
  const step=i=>{
    if(i>=qs.length){finale();return}
    const q=qs[i];
    modal({title:`Entretien · ${c.name}`,icon:'🗣️',html:`<p>${esc(c.name)}, ${esc(lc(c.job))}, s’assoit en face de toi. Question ${i+1} sur ${qs.length} : <b>« ${esc(q.q)} »</b></p>${listHtml()}<p class="muted">Comment la poses-tu ?</p>`,
      choices:STYLES.map(st=>({t:st.t,fn:()=>{
        let tier=c.rel<42?0:c.rel<68?1:2;
        if(q.k==='justificatifs'&&c.fake&&chance(.85))tier=0;
        else if(q.k==='soirées'&&(c.trait==='fêtard'||c.trait==='bruyant')&&chance(.8))tier=0;
        if(!chance(st.acc))tier=pick([0,1,2].filter(x=>x!==tier));
        const txt=pick(q.ans[tier]);c.clues.push({k:q.k[0].toUpperCase()+q.k.slice(1),a:txt,tone:tier});
        if(st.vex&&chance(st.vex))c.vexed=true;
        step(i+1);return '';}}))});
  };
  step(0);
}

/* ---------- Travaux ---------- */
const REN=[
 {k:'rafr',ic:'🎨',n:'Rafraîchissement',p:.03,txt:'Peinture, sols, joints et un grand coup de propre. Possible avec un locataire dans les murs.'},
 {k:'compl',ic:'🛠️',n:'Rénovation complète',p:.10,txt:'Électricité, plomberie, isolation, cuisine et salle de bain refaites. Bien vide pendant un an.',risk:.22},
 {k:'gamme',ic:'✨',n:'Montée en gamme',p:.18,txt:'Parquet, cuisine équipée, domotique, balcon refait : le bien monte d’un cran. Bien vide pendant un an.',risk:.15}];
function renoCost(a,lv){return Math.round(baseOf(a)*lv.p/10)*10}
function renoDis(L,a,lv){
  if(a.works>0)return 'Chantier en cours';
  if(L.prison)return 'En prison';
  if(lv.k==='rafr')return a.cond>=85?'Déjà en très bon état':'';
  if(L.home===a.id)return 'Tu habites ici : impossible de vider les lieux';
  if(a.rented)return 'Logement occupé : il doit être vide';
  if(lv.k==='compl')return a.cond>=90?'Déjà rénové à neuf':'';
  return a.tier>=2?'Déjà au sommet de la gamme':'';
}
function renoDo(L,a,lv){
  const s=S(L);const b=baseOf(a),cost=renoCost(a,lv);s.reno++;track(L,'renovations');
  if(lv.k==='rafr'){
    const nc=Math.min(85,a.cond+18);a.cond=nc;a.value=Math.round(b*fc(nc)*tf(a.tier));
    if(a.rented)a.rented.rel=clamp(a.rented.rel+3);
    chg(L,{happy:2});hist(L,`Rafraîchissement de ${a.name.toLowerCase()} (${fmt(cost)}).`);
    return out(L,`🎨 Coup de peinture et sols neufs dans ${a.name.toLowerCase()} : état ${nc} %.`);
  }
  const tier=lv.k==='gamme'?Math.min(2,a.tier+1):a.tier;const nc=lv.k==='gamme'?100:96;
  a.works=1;a.pend={cond:nc,tier,base:b};a.cands=null;
  let t=`🛠️ Le chantier démarre à ${a.name.toLowerCase()} : ${lv.k==='gamme'?'cuisine, parquet et domotique':'tout est refait de la cave au grenier'}. Le bien sera prêt dans un an.`;
  if(chance(lv.risk)){const x=Math.round(cost*R(25,45)/100);spend(L,x);t+=` Mauvaise surprise : ${pick(['de l’amiante dans les faux plafonds','une installation électrique d’un autre siècle','un mur porteur très fatigué','des canalisations en plomb'])}. Surcoût : ${fmt(x)}.`}
  hist(L,`${lv.n} de ${a.name.toLowerCase()} lancée (${fmt(cost)}).`);
  return out(L,t);
}
function finishWorks(L,a,s){
  const p=a.pend;if(!p)return;
  a.cond=p.cond;a.tier=p.tier;a.value=Math.round(p.base*fc(a.cond)*tf(a.tier)*R(97,104)/100);a.pend=null;a.cands=null;a.pubY=null;
  say(L,`🔨 Travaux terminés à ${a.name.toLowerCase()} : valeur ${fmt(a.value)}, état ${a.cond} %, note énergie ${dpe(a)}. Loyer habituel : ${fmt(maxRent(a))} par an.`);
  hist(L,`Fin du chantier de ${a.name.toLowerCase()}.`);
}

/* ---------- Procédure d’expulsion ---------- */
const STEPS=['','Huissier envoyé pour réclamer les loyers','Convocation au tribunal','Jugement rendu : le locataire doit partir','Ordre de quitter les lieux donné','Aide de la police demandée'];
function evAct(L,a,r,step){
  const s=S(L);
  if(step===1){
    a.evict={step:1,wait:0,spent:350,winter:0,age:L.age};
    if(r.arrears>0&&chance(.2+r.rel/300)){const v=r.arrears;earn(L,v);r.arrears=0;r.late=0;r.rel=clamp(r.rel-10);a.evict=null;return out(L,`📬 L’huissier passe : ${first(r)} règle ses ${fmt(v)} de loyers en retard dans les deux mois. La procédure s’arrête là.`)}
    return out(L,`📬 L’huissier réclame les loyers à ${r.name}. Les deux mois s’écoulent sans paiement : tu peux maintenant aller au tribunal.`);
  }
  if(step===2){a.evict.step=2;a.evict.wait=1;a.evict.spent+=1200;return out(L,'⚖️ Tu as saisi le tribunal. L’audience aura lieu dans les prochains mois.')}
  if(step===4){a.evict.step=4;a.evict.spent+=400;return out(L,`📜 ${r.name} a reçu l’ordre de quitter les lieux. Il a deux mois pour partir.`)}
  if(step===5){a.evict.step=5;a.evict.wait=1;a.evict.spent+=600;return out(L,'🚔 Tu as demandé l’aide de la police à la préfecture. Réponse attendue d’ici la fin de l’année.')}
  return '';
}
function evictTick(L,a,r,s){
  const e=a.evict;if(!e)return;
  if(r.arrears<=0&&r.late<=0){a.evict=null;say(L,`📬 ${first(r)} est à jour de ses loyers : la procédure est classée.`);return}
  if(e.step===2&&e.wait){
    e.wait=0;
    if(chance(.8)){e.step=3;say(L,`⚖️ Le tribunal donne raison au propriétaire : ${r.name} doit quitter le logement.`)}
    else{a.evict=null;r.arrears=Math.round(r.arrears/2);r.late=0;say(L,`⚖️ Le juge laisse plus de temps à ${r.name} pour payer. Les frais de justice sont perdus, tout est à refaire.`)}
  }else if(e.step===5&&e.wait){
    const mo=R(1,12);
    if(mo>=11||mo<=3){e.winter++;say(L,`❄️ Pas d’expulsion en hiver (du 1er novembre au 31 mars) : la préfecture attend pour ${r.name}. Tu patientes encore.`)}
    else{
      spend(L,500);let t=`🚪 ${r.name} est expulsé${r.g==='F'?'e':''} au printemps, sans heurts. Serrurier et déménageurs : ${fmt(500)}. ${fmt(r.arrears)} de loyers non payés partent en fumée.`;
      if(s.gli&&r.gliOk){const b=Math.round(e.spent*.8);earn(L,b,1);t+=` Ton assurance loyers impayés rembourse ${fmt(b)} de frais.`}
      say(L,t);s.evictions++;track(L,'evictions');chg(L,{happy:-3,karma:-1});hist(L,`${r.name} expulsé de ${a.name.toLowerCase()}.`);
      a.rented=null;a.evict=null;a.vacY=0;a.cands=null;
    }
  }
}

/* ---------- Passage d’une année ---------- */
function yHouse(L,a,s,ctx){
  norm(a);
  if(L.home===a.id){if(a.rented)say(L,`🏠 Tu t’installes dans ${a.name.toLowerCase()} : ${a.rented.name} doit quitter les lieux.`);a.rented=null;a.evict=null;a.cands=null;return}
  if(a.works>0){a.works--;ctx.vac++;if(a.works<=0)finishWorks(L,a,s);return}
  const r=a.rented;
  if(!r){
    a.vacY++;a.cands=null;ctx.vac++;
    const mk=maxRent(a),loss=Math.round(mk*POS[a.pos].m);
    if(s.agency&&!a.hold&&!dpeBan(a)&&a.cond>=30){
      a.cands=genCands(L,a);const c=a.cands.length?pick(a.cands):null;if(!c){a.cands=null;return}c.rel=clamp(c.rel+R(-8,8));
      const half=Math.round(c.rent/2);
      if(c.real>=2*c.rent){sign(L,a,c);if(a.rented){earn(L,half);ctx.paid+=half;say(L,`🏢 Ton agence trouve un locataire pour ${a.name.toLowerCase()} en cours d’année : ${a.rented.name}.`)}return}
      a.cands=null;
    }
    if(a.lent||a.pubY!=null){
      s.vacLoss+=loss;say(L,`🕸️ ${a.name} est resté vide : environ ${fmt(loss)} de loyers perdus.`);
      if(a.vacY>=2){const t=Math.round(a.value*.01);spend(L,t);say(L,`🏛️ Taxe sur les logements vides : ${fmt(t)}. Le fisc n’aime pas les volets fermés.`)}
    }
    return;
  }
  r.years++;
  const mk=maxRent(a),ef=posOf(a);
  /* Paiement des loyers */
  const pu=Math.min(.5,Math.max(.02,(100-r.rel)/230+(r.arrears>0?.08:0)+(ef==='haut'?.04:0)-(ef==='bas'?.03:0)));
  if(chance(pu)){
    const m=R(1,5),lost=Math.round(r.rent*m/12);
    earn(L,r.rent-lost);ctx.paid+=r.rent-lost;r.arrears+=lost;r.late++;s.unpaid+=lost;
    say(L,`📉 ${r.name} saute ${m} mois de loyer pour ${a.name.toLowerCase()} : ${fmt(lost)} non payés${r.arrears>lost?` (${fmt(r.arrears)} au total)`:''}.`);
  }else{
    earn(L,r.rent);ctx.paid+=r.rent;r.late=0;
    if(r.arrears>0){const rep=Math.min(r.arrears,Math.round(r.rent*.3));earn(L,rep);ctx.paid+=rep;r.arrears-=rep;say(L,`💶 ${r.name} rembourse ${fmt(rep)} de loyers en retard.`)}
  }
  if(r.gliOk)ctx.elig+=r.rent;
  if(s.gli&&r.gliOk&&r.arrears>0&&r.late>=1){const v=Math.round(r.arrears*.8);earn(L,v);ctx.paid+=v;say(L,`🛡️ Ton assurance loyers impayés paie ${fmt(v)} de loyers en retard de ${r.name}.`);r.arrears=0}
  if(r.late>=2&&r.arrears>0&&r.guar!=='Aucun'){
    const f={Visale:.9,Parents:.55,Société:.8}[r.guar]||0;const v=Math.round(r.arrears*f);
    if(v>0){earn(L,v);ctx.paid+=v;r.arrears-=v;say(L,`🤝 Le garant (${lc(GUAR[r.guar])}) règle ${fmt(v)} de dettes de ${r.name}.`)}
  }
  evictTick(L,a,r,s);
  /* Indexation, usure, humeur */
  if(a.cond>=38&&r.rent<mk*1.2)r.rent=Math.round(r.rent*(1+R(10,28)/1000));
  if(r.trait==='fêtard'||r.trait==='bruyant')a.cond=clamp(a.cond-R(1,4));
  else if(r.trait==='bricoleur')a.cond=clamp(a.cond+R(0,2));
  if(r.years>6)a.cond=clamp(a.cond-1);
  r.rel=clamp(r.rel+R(-3,2)+(ef==='bas'?2:ef==='haut'?-3:0)+(a.cond>=70?1:a.cond<40?-3:0));
  /* Départ */
  let pl=.05+(ef==='haut'?.07:0)-(ef==='bas'?.02:0)+(r.rel<35?.05:0)+(a.cond<40?.08:0)+(r.years>=8?.04:0);
  const sneak=r.late>=2&&chance(.2);
  if(r.notice||sneak||chance(pl)){
    let why=r.notice?`quitte les lieux parce que tu le lui as demandé`:sneak?'disparaît sans laisser d’adresse':pick(['change de ville pour le travail','déménage pour se rapprocher de sa famille','achète son propre logement','part s’installer à l’étranger','trouve un loyer moins cher']);
    if(!r.notice&&!sneak&&a.cond<40)why='part en claquant la porte : le logement est dans un état déplorable';
    const dmgP=.25+(r.trait==='fêtard'?.25:0)+(r.trait==='bruyant'?.1:0)-(r.trait==='soigneux'?.2:0);
    let t=`🚚 ${r.name} ${why}.`;
    if(chance(dmgP)){const d=Math.round(R(300,2500)*kk(L)*tf(a.tier));const dep=r.dep||0;if(dep>0)earn(L,Math.min(dep,d),1);spend(L,Math.max(0,d-dep));a.cond=clamp(a.cond-R(3,10));t+=` En sortant, il laisse des dégâts (${fmt(d)}) ; sa caution couvre ${fmt(Math.min(dep,d))}.`}
    if(r.arrears>0&&!sneak&&!r.notice)t+=` Loyers non payés : ${fmt(r.arrears)}.`;
    say(L,t);hist(L,`${r.name} quitte ${a.name.toLowerCase()}.`);
    a.rented=null;a.evict=null;a.vacY=0;a.cands=null;a.pubY=null;
  }
}
function yearAll(L){
  if(L.age<18)return;
  const s=S(L),hs=houses(L);if(!hs.length)return;
  const ctx={paid:0,elig:0,vac:0};
  for(const a of hs){try{yHouse(L,a,s,ctx)}catch(e){console.error(e)}}
  const k=kk(L),nf=freeHouses(L).length;
  if(s.pno&&nf){spend(L,Math.round(150*k*nf))}
  if(s.gli&&ctx.elig)spend(L,Math.round(ctx.elig*.028));
  if(s.agency&&ctx.paid)spend(L,Math.round(ctx.paid*.07));
  s.income+=ctx.paid;s.lastPaid=ctx.paid;
  if(ctx.paid>0)say(L,`🏠 Loyers reçus cette année : ${fmt(ctx.paid)}${(s.pno||s.gli||s.agency)?` (assurances et frais d’agence retirés ensuite)`:''}.`);
  trackMax(L,'rentals',lets(L).length);
  trackMax(L,'houses',hs.length);
}

/* ---------- Évènements en fenêtre ---------- */
const tenantOf=a=>a.rented?first(a.rented):'';
function chooseHouse(L,pred){const l=shuffle(freeHouses(L).map(norm)).filter(pred);return l[0]||null}
function evEau(L,a){
  const r=a.rented,k=kk(L),c=Math.round(R(700,2600)*k),s=S(L);
  modal({title:'Dégât des eaux',icon:'💧',text:r?`${tenantOf(a)} t’appelle, affolé${r.g==='F'?'e':''} : une canalisation a lâché dans ${a.name.toLowerCase()}. Le plafond du voisin du dessous commence à se tacher.`:`Une fuite s’est déclarée dans ${a.name.toLowerCase()}, vide depuis des mois. Personne ne l’a vue ; le parquet, si.`,choices:[
    {t:`Plombier en urgence (~${fmt(cover(L,c))})`,pri:1,fn:()=>{spend(L,cover(L,c));a.cond=clamp(a.cond+3);if(r)r.rel=clamp(r.rel+6);return out(L,`💧 Le plombier arrive en une heure, répare, et laisse une facture de ${fmt(cover(L,c))}.${s.pno?' Ton assurance paie le reste.':''}`)}},
    {t:'Déclarer le sinistre à l’assurance',fn:()=>{
      if(s.pno){spend(L,300);a.cond=clamp(a.cond+3);if(chance(.3)){if(r)r.rel=clamp(r.rel-2);return out(L,'💧 Tu paies 300 € de ta poche. L’expert met trois semaines à venir, mais tout est remboursé.')}return out(L,'💧 Tu paies 300 € de ta poche. Le reste est réglé sans histoire grâce à ton assurance.')}
      const x=Math.round(c*.9);spend(L,x);if(r)r.rel=clamp(r.rel-4);chg(L,{happy:-2});return out(L,`💧 Sans assurance, c’est la guerre des experts : tu paies presque tout, soit ${fmt(x)}.`)}},
    {t:'Bricoler toi-même (avec un tuto)',fn:()=>{
      if(chance(.35+L.st.smarts/300)){spend(L,150);return out(L,'💧 Un joint, une clé à molette, trois jurons : ça tient. Tu es fier de toi.')}
      const x=Math.round(c*1.5);spend(L,x);a.cond=clamp(a.cond-8);if(r)r.rel=clamp(r.rel-4);return out(L,`💧 Le joint a lâché pendant la nuit. L’addition de ${fmt(x)} est plus salée que prévu.`)}}]});
  return 1;
}
function evChaudiere(L,a){
  const r=a.rented,k=kk(L);
  modal({title:'Chaudière en panne',icon:'🔥',text:`Il fait ${R(9,13)} degrés dans ${a.name.toLowerCase()} et ${tenantOf(a)} envoie un message en majuscules : « LA CHAUDIÈRE EST MORTE ». Le chauffage, c’est à toi de le réparer.`,choices:[
    {t:`Remplacer par une chaudière neuve (${fmt(3500*k)})`,pri:1,fn:()=>{spend(L,Math.round(3500*k));a.cond=clamp(a.cond+8);r.rel=clamp(r.rel+8);return out(L,'🔥 Chaudière neuve, facture moins chaude. Le locataire t’envoie un « merci » avec trois émojis.')}},
    {t:`Faire réparer (${fmt(900*k)})`,fn:()=>{spend(L,Math.round(900*k));r.rel=clamp(r.rel+2);if(chance(.35)){a.cond=clamp(a.cond-3);return out(L,'🔥 Réparée… jusqu’à l’hiver suivant. Le plombier te reconnaît déjà au téléphone.')}return out(L,'🔥 Réparation de fortune, mais ça repart.')}},
    {t:'Faire attendre (un peu)',danger:true,fn:()=>{r.rel=clamp(r.rel-10);a.cond=clamp(a.cond-3);chg(L,{karma:-2});if(chance(.3)){r.rent=Math.round(r.rent*.9);return out(L,'🔥 Le locataire se plaint à la mairie. Le loyer baisse de 10 % le temps de la panne.')}return out(L,'🔥 Il grelotte, tu ne le saurais pas. Ou presque : ses messages sont devenus plus froids que l’appartement.')}}]});
  return 1;
}
function evToiture(L,a){
  const r=a.rented,k=kk(L),full=Math.round(a.value*.05/10)*10,patch=Math.round(a.value*.01/10)*10;
  modal({title:'Toit qui fuit',icon:'🏚️',text:`Après l’orage, ${r?`${tenantOf(a)} te dit`:'le gardien te dit'} qu’une tache brune s’étend au plafond de ${a.name.toLowerCase()}. La toiture date de l’époque où l’on portait des perruques.`,choices:[
    {t:`Refaire la toiture (${fmt(full)})`,pri:1,fn:()=>{spend(L,full);a.cond=clamp(a.cond+14);a.value=Math.round(a.value*1.03);if(r)r.rel=clamp(r.rel+5);return out(L,`🏚️ Couvreurs, tuiles neuves, échafaudage sur la façade : ${fmt(full)}. Le logement respire.`)}},
    {t:`Colmater (${fmt(patch)})`,fn:()=>{spend(L,patch);a.cond=clamp(a.cond-2);return out(L,'🏚️ Un petit rafistolage en attendant mieux. Le mieux, lui, ne vient jamais très vite.')}},
    {t:'Attendre le prochain orage',danger:true,fn:()=>{a.cond=clamp(a.cond-15);if(r)r.rel=clamp(r.rel-9);return out(L,'🏚️ Le prochain orage est arrivé, avec une flaque dans le salon.')}}]});
  return 1;
}
function evLitige(L,a){
  const ls=lets(L);const b=ls.length>1?shuffle(ls.filter(x=>x!==a))[0]:null;const v=pick(NEIGH);
  const ra=a.rented;
  const t=b?`${first(ra)} (${a.name.toLowerCase()}) et ${first(b.rented)} (${b.name.toLowerCase()}) se disputent pour le local à vélos, le parking et, accessoirement, l’honneur. Chacun t’appelle pour te donner raison.`
    :`${v} te signale que ${first(ra)} laisse ${pick(['ses poubelles dans le couloir','sa trottinette électrique dans le hall','son chien aboyer toute la journée','sa musique résonner jusqu’à minuit'])}. Une pétition circule déjà.`;
  modal({title:'Dispute de voisins',icon:'📣',text:t,choices:[
    {t:'Les faire discuter ensemble',pri:1,fn:()=>{if(chance(.6)){ra.rel=clamp(ra.rel+2);if(b)b.rented.rel=clamp(b.rented.rel+2);chg(L,{karma:2});return out(L,'📣 Autour d’un café, les esprits s’apaisent. La paix des ménages est revenue.')}ra.rel=clamp(ra.rel-3);return out(L,'📣 La discussion tourne court : chacun repart plus vexé qu’avant.')}},
    {t:'Envoyer une lettre recommandée',fn:()=>{ra.rel=clamp(ra.rel-5);if(b)b.rented.rel=clamp(b.rented.rel-3);return out(L,'📣 La lettre règle le problème sur le papier. Le locataire, lui, est moins aimable la fois suivante.')}},
    {t:'Ne rien faire',fn:()=>{if(chance(.4)){chg(L,{stress:4});return out(L,'📣 Le conflit s’envenime : l’immeuble te réclame une réunion en urgence.')}return out(L,'📣 Le calme revient tout seul. Parfois, c’est ça, l’art de la gestion.')}}]});
  return 1;
}
function evBruit(L,a){
  const r=a.rented;
  modal({title:'Un colocataire surprise',icon:'🎸',text:`${v1(a)} te raconte que ${first(r)} a accueilli un « ami » qui s’est installé pour de bon. Il répète de la batterie le mercredi soir.`,choices:[
    {t:'Accepter, avec +10 % de loyer',pri:1,fn:()=>{r.rent=Math.round(r.rent*1.1);r.rel=clamp(r.rel-2);return out(L,`🎸 C’est signé : ${fmt(r.rent)} par an, batterie comprise.`)}},
    {t:'Exiger son départ',fn:()=>{r.rel=clamp(r.rel-10);if(chance(.3)){r.notice=1;return out(L,'🎸 Vexé, ton locataire annonce qu’il part.')}return out(L,'🎸 Le batteur déménage ses cymbales. Le silence est revenu.')}},
    {t:'Laisser couler',fn:()=>{a.cond=clamp(a.cond-3);chg(L,{stress:3});return out(L,'🎸 Les plaintes des voisins affluent. Les murs aussi souffrent un peu.')}}]});
  return 1;
}
function v1(a){return pick(NEIGH)}
function evTravaux(L,a){
  const r=a.rented,c=Math.round(a.value*.01/10)*10;
  const what=pick(['changer les volets qui ne ferment plus','repeindre le salon, « parce que ça fait jaune »','remplacer la robinetterie qui goutte','poser des prises supplémentaires','refaire le joint de la douche']);
  modal({title:'Demande de travaux',icon:'🧰',text:`${tenantOf(a)} te demande poliment de ${what}. Le bail n’en dit rien, mais c’est raisonnable.`,choices:[
    {t:`Accepter (${fmt(c)})`,pri:1,fn:()=>{spend(L,c);a.cond=clamp(a.cond+5);r.rel=clamp(r.rel+8);return out(L,`🧰 Les travaux sont faits. ${tenantOf(a)} est ravi${r.g==='F'?'e':''} et te le fait savoir.`)}},
    {t:`Proposer de partager la facture (${fmt(c/2)})`,fn:()=>{spend(L,Math.round(c/2));a.cond=clamp(a.cond+3);r.rel=clamp(r.rel+2);return out(L,'🧰 Compromis à la française : on paie la moitié chacun.')}},
    {t:'Refuser',danger:true,fn:()=>{r.rel=clamp(r.rel-8);return out(L,'🧰 Refus net. Le locataire marmonne, puis rumine dans son coin.')}}]});
  return 1;
}
function evDelai(L,a){
  const r=a.rented,t=Math.round(r.arrears);
  modal({title:'Un délai de paiement',icon:'📞',text:`${r.name} t’appelle : ${pick(['son employeur a des difficultés','il a eu des frais médicaux imprévus','sa voiture est tombée en panne','un virement s’est perdu'])}. Il te doit ${fmt(t)} et te demande de payer en plusieurs fois.`,choices:[
    {t:'Le laisser payer en plusieurs fois',pri:1,fn:()=>{r.rel=clamp(r.rel+7);r.arrears=Math.round(r.arrears*.8);chg(L,{karma:2});return out(L,'📞 Vous trouvez un arrangement. La confiance, ça se cultive aussi à crédit.')}},
    {t:'Rester ferme',fn:()=>{r.rel=clamp(r.rel-6);if(chance(.45)){const v=Math.round(r.arrears*.5);earn(L,v);r.arrears-=v;return out(L,`📞 La fermeté paie : ${fmt(v)} arrivent dès la semaine suivante.`)}return out(L,'📞 Pas un centime de plus. L’ambiance devient glaciale.')}}]});
  return 1;
}
function evSquat(L,a){
  const c=Math.round(R(600,1800)*kk(L));
  modal({title:'Des squatteurs ?',icon:'🔒',text:`Le voisin t’appelle : de la lumière brille dans ${a.name.toLowerCase()}, pourtant vide. Quelqu’un s’y est installé en ton absence.`,choices:[
    {t:'Faire constater par un huissier',pri:1,fn:()=>{spend(L,c);if(chance(.7)){a.cond=clamp(a.cond-3);return out(L,`🔒 Constat, avertissement, départ sous quarante-huit heures. Frais : ${fmt(c)}.`)}a.cond=clamp(a.cond-8);chg(L,{stress:6});return out(L,`🔒 Les occupants partent… après des semaines et des dégâts. Frais : ${fmt(c)}.`)}},
    {t:'Négocier directement',fn:()=>{const x=Math.round(c*.5);if(chance(.55)){spend(L,x);return out(L,`🔒 Contre ${fmt(x)}, ils plient bagage et laissent même un mot d’excuse.`)}a.cond=clamp(a.cond-10);chg(L,{stress:6});return out(L,'🔒 La discussion tourne mal, le bien aussi.')}}]});
  return 1;
}
function evDpe(L,a){
  const c=Math.round(a.value*.04/10)*10,r=a.rented;
  modal({title:'Contrôle énergétique',icon:'🌡️',text:`Un expert vérifie ${a.name.toLowerCase()} : note énergie ${dpe(a)} (de A, très bien, à G, très mauvais). ${dpe(a)==='G'?'Le logement laisse passer le froid : on ne pourra bientôt plus le louer.':'Pour les notes F et G, le loyer ne peut plus monter.'}`,choices:[
    {t:`Isoler et changer les fenêtres (${fmt(c)})`,pri:1,fn:()=>{spend(L,c);a.cond=clamp(a.cond+20);a.value=Math.round(a.value*1.04);if(r)r.rel=clamp(r.rel+4);return out(L,`🌡️ Nouvelle note énergie : ${dpe(a)}. Les factures du locataire fondent, la valeur monte.`)}},
    {t:'Ignorer (pour l’instant)',danger:true,fn:()=>{a.cond=clamp(a.cond-2);return out(L,'🌡️ Le papier finit au fond d’un tiroir. Il faudra bien en reparler.')}}]});
  return 1;
}
function evBonus(L,a){
  const r=a.rented;
  modal({title:'Un bon locataire',icon:'🌟',text:`${r.name} est chez toi depuis ${r.years} an${r.years>1?'s':''}, sans jamais faire de vagues. ${pick(['Il propose de repeindre l’entrée lui-même.','Il t’apporte des confitures maison.','Il demande si tu veux qu’il surveille le bien pendant les vacances.'])}`,choices:[
    {t:'Le remercier d’un geste (−1 mois de loyer)',fn:()=>{r.rel=clamp(r.rel+8);r.rent=Math.round(r.rent*1.0);spend(L,Math.round(r.rent/12));chg(L,{karma:3,happy:3});return out(L,'🌟 Il est touché. Tu viens de gagner un locataire pour dix ans.')}},
    {t:'Lui proposer de prolonger le bail',pri:1,fn:()=>{r.rel=clamp(r.rel+3);r.notice=0;chg(L,{happy:2});return out(L,'🌟 Bail reconduit. Il ne partira pas de sitôt.')}}]});
  return 1;
}
function evSyndic(L,a){
  const c=Math.round(a.value*.012/10)*10;
  modal({title:'Facture de l’immeuble',icon:'🏢',text:`Le gestionnaire de l’immeuble réclame ${fmt(c)} pour refaire la façade de ${a.name.toLowerCase()}. Les copropriétaires ont voté, malgré ton absence.`,choices:[
    {t:'Payer sans discuter',pri:1,fn:()=>{spend(L,c);a.cond=clamp(a.cond+4);a.value=Math.round(a.value*1.01);return out(L,`🏢 ${fmt(c)} versés. La façade est belle ; le gestionnaire, content.`)}},
    {t:'Contester la facture',fn:()=>{if(chance(.4)){const x=Math.round(c*.6);spend(L,x);return out(L,`🏢 Tu obtiens une réduction : ${fmt(x)} seulement.`)}spend(L,Math.round(c*1.05));chg(L,{stress:3});return out(L,'🏢 Contestation refusée, avec une pénalité de retard.')}}]});
  return 1;
}
const EVS=[
 {w:1.6,pick:L=>chooseHouse(L,a=>a.cond<88),run:evEau},
 {w:1.3,pick:L=>chooseHouse(L,a=>a.rented&&a.cond<82),run:evChaudiere},
 {w:1,pick:L=>chooseHouse(L,a=>a.cond<68),run:evToiture},
 {w:1.1,pick:L=>chooseHouse(L,a=>a.rented),run:evLitige,soft:1},
 {w:1.1,pick:L=>chooseHouse(L,a=>a.rented&&['bruyant','fêtard'].includes(a.rented.trait)),run:evBruit,soft:1},
 {w:1.3,pick:L=>chooseHouse(L,a=>a.rented&&!a.rented.arrears),run:evTravaux,soft:1},
 {w:3,pick:L=>chooseHouse(L,a=>a.rented&&a.rented.arrears>0&&!a.evict),run:evDelai},
 {w:1.2,pick:L=>chooseHouse(L,a=>!a.rented&&a.works<=0&&a.vacY>=1),run:evSquat},
 {w:1.4,pick:L=>chooseHouse(L,a=>a.cond<50),run:evDpe},
 {w:1.2,pick:L=>chooseHouse(L,a=>a.rented&&a.rented.rel>=70&&a.rented.years>=2),run:evBonus,soft:1},
 {w:.8,pick:L=>chooseHouse(L,a=>true),run:evSyndic}];
function events(L){
  if(L.age<18||L.prison)return 0;
  const s=S(L),n=lets(L).length,vac=freeHouses(L).filter(a=>!a.rented).length;
  if(!n&&!vac)return 0;
  const p=Math.min(.85,.12+.2*n+.05*vac);
  let q=0,tries=chance(.3)&&n>=2?2:1;
  for(let t=0;t<tries&&chance(p);t++){
    const cs=EVS.map(e=>({e,a:e.pick(L)})).filter(x=>x.a);if(!cs.length)break;
    const w={};cs.forEach((x,i)=>w[i]=x.e.w);const x=cs[+wpick(w)];
    if(s.agency&&x.e.soft&&chance(.6)){say(L,`🏢 Ton agence règle un petit souci à ${x.a.name.toLowerCase()} sans te déranger.`);continue}
    try{q+=x.e.run(L,x.a)||0}catch(e){console.error(e)}
  }
  return q;
}

/* ---------- Effets et conditions pour évènements JSON ---------- */
const effects={
  tenantRel(L,args){
    const l=lets(L).map(norm);if(!l.length)return '';
    const f=args&&args.pick==='good'?l.filter(a=>a.rented.rel>=65):args&&args.pick==='arrears'?l.filter(a=>a.rented.arrears>0):l;
    const a=pick(f.length?f:l);const r=a.rented;r.rel=clamp(r.rel+((args&&args.d)||0));return '';
  },
  chargesVides(L){
    const v=freeHouses(L).filter(a=>!a.rented).map(norm);if(!v.length)return '';
    const a=pick(v);const c=Math.round(a.value*.003/10)*10+120;spend(L,c);a.cond=clamp(a.cond-1);return `Charges et entretien pour ${a.name.toLowerCase()} : ${fmt(c)}.`;
  },
  controleFiscal(L,args){
    const c=Math.round(R(300,1200)*kk(L));spend(L,c);return `Facture de l’expert-comptable : ${fmt(c)}.`;
  }
};
const conds={
  rented:L=>lets(L).length>0,
  good:L=>lets(L).some(a=>a.rented.rel>=65),
  vacant:L=>freeHouses(L).some(a=>!a.rented&&a.works<=0),
  arrears:L=>lets(L).some(a=>a.rented.arrears>0)
};
const eventsDb=[
 {id:'landlord_cadeau',category:'landlord',icon:'🎁',conditions:{min_age:18,mod_cond:{mod:MOD,fn:'good',args:{}}},probability_weight:.1,
  prompt_text:'Ton locataire sonne à ta porte avec une boîte de chocolats et un sourire gêné : « Pour la patience, et pour le chauffage qui marche. »',
  choices:[{choice_text:'Accepter avec le sourire',consequences:{happiness_modifier:3,mod_effect:{mod:MOD,fn:'tenantRel',args:{d:5,pick:'good'}},result_text:'Le chocolat est excellent. Le lien aussi.'}},
   {choice_text:'Refuser poliment : « Ne vous croyez pas obligé. »',consequences:{karma_modifier:2,happiness_modifier:1,mod_effect:{mod:MOD,fn:'tenantRel',args:{d:2,pick:'good'}},result_text:'Il insiste, tu cèdes à moitié : une seule praline.'}}]},
 {id:'landlord_voisin',category:'landlord',icon:'📣',conditions:{min_age:18,mod_cond:{mod:MOD,fn:'rented',args:{}}},probability_weight:.12,
  prompt_text:'La gardienne te téléphone : « Votre locataire est charmant, mais sa télé, elle, ne l’est pas. » Elle attend une réponse avant la prochaine réunion de l’immeuble.',
  choices:[{choice_text:'Parler gentiment au locataire',consequences:{mod_effect:{mod:MOD,fn:'tenantRel',args:{d:-1}},happiness_modifier:1,result_text:'Un mot aimable, un casque audio : la paix revient.'}},
   {choice_text:'Envoyer une lettre officielle',consequences:{mod_effect:{mod:MOD,fn:'tenantRel',args:{d:-5}},stress_level_increment:2,result_text:'La lettre est partie. L’ambiance, un peu moins bien.'}},
   {choice_text:'Promettre de voir ça… un jour',consequences:{karma_modifier:-1,stress_level_increment:3,result_text:'La gardienne soupire longuement, un soupir qui s’entend jusqu’à Lyon.'}}]},
 {id:'landlord_fisc',category:'landlord',icon:'🧾',conditions:{min_age:22,min_bank_balance:3000,mod_cond:{mod:MOD,fn:'rented',args:{}}},probability_weight:.07,
  prompt_text:'Les impôts te demandent de justifier l’argent des loyers. Le papier à en-tête t’en dit déjà beaucoup sur le ton de la conversation.',
  choices:[{choice_text:'Engager un expert-comptable',consequences:{mod_effect:{mod:MOD,fn:'controleFiscal',args:{}},stress_level_increment:-2,result_text:'Dossier propre, tout est en règle.'}},
   {choice_text:'Tout refaire toi-même, la nuit',consequences:{stress_level_increment:6,smarts_modifier:1,result_text:'Quinze heures de formulaires plus tard, tu as compris comment déclarer des loyers.'}}]},
 {id:'landlord_vide',category:'landlord',icon:'🕸️',conditions:{min_age:18,mod_cond:{mod:MOD,fn:'vacant',args:{}}},probability_weight:.1,
  prompt_text:'En passant devant ton bien vide, tu remarques une boîte aux lettres qui déborde de prospectus et un volet resté ouvert.',
  consequences:{mod_effect:{mod:MOD,fn:'chargesVides',args:{}},stress_level_increment:1}},
 {id:'landlord_retard',category:'landlord',icon:'📬',conditions:{min_age:18,mod_cond:{mod:MOD,fn:'arrears',args:{}}},probability_weight:.12,
  prompt_text:'Un SMS de ton locataire en retard : « Désolé pour le loyer, je me rattrape bientôt. » Il y a un émoji qui pleure. Ou qui rit. Difficile à dire.',
  choices:[{choice_text:'Répondre avec bienveillance',consequences:{mod_effect:{mod:MOD,fn:'tenantRel',args:{d:5,pick:'arrears'}},karma_modifier:1,result_text:'Un message poli, et la tension retombe.'}},
   {choice_text:'Répondre sèchement par courrier',consequences:{mod_effect:{mod:MOD,fn:'tenantRel',args:{d:-6,pick:'arrears'}},stress_level_increment:2,result_text:'Le courrier part, la réponse ne vient pas.'}}]}
];

/* ---------- Panneaux ---------- */
function pGestion(){
  const L=cur();const s=S(L);const hs=houses(L).map(norm);const ls=lets(L);
  const rent=ls.reduce((t,a)=>t+a.rented.rent,0),val=hs.reduce((t,a)=>t+a.value,0);
  const vac=freeHouses(L).filter(a=>!a.rented).length,arr=ls.reduce((t,a)=>t+a.rented.arrears,0);
  let h=card('Loyers de l’année',fmt(rent),`${ls.length} logement${ls.length>1?'s':''} loué${ls.length>1?'s':''} · ${vac} vide${vac>1?'s':''} · rapporte ${val?pct(rent/val):'—'} par an${arr?` · loyers non payés ${fmt(arr)}`:''}`);
  if(!hs.length)h+=note('Tu n’as aucun logement. Achète-en un dans l’immobilier, ou déniche un logement à rénover : un bon locataire paie pour toi.');
  h+=group('Mes logements',hs.map(a=>row({ic:L.home===a.id?'🏠':a.rented?'🔑':'🧱',t:a.name,s:statusOf(L,a),right:'›',a:()=>pushPanel(pManage(a.id))})));
  h+=group('Acquérir',[nav('🏚️','Logements à rénover','Prix bas, logement abîmé, gros potentiel',pFix,L.age<18||!!L.prison)]);
  h+=group('Assurances et agence',[
    act(L,{ic:'🛡️',t:`Assurance du logement${s.pno?' · active':''}`,s:'150 € par logement et par an · paie 70 % des dégâts',right:s.pno?'✔':'',fn:L=>{const q=S(L);q.pno=!q.pno;return out(L,q.pno?'🛡️ Assurance souscrite pour tous tes logements.':'🛡️ Assurance résiliée.')}}),
    act(L,{ic:'📑',t:`Assurance loyers impayés${s.gli?' · active':''}`,s:'2,8 % des loyers · paie 80 % des loyers non payés (si le locataire gagne au moins 2,8 fois le loyer)',right:s.gli?'✔':'',fn:L=>{const q=S(L);q.gli=!q.gli;return out(L,q.gli?'📑 Assurance loyers impayés souscrite.':'📑 Assurance loyers impayés résiliée.')}}),
    act(L,{ic:'🏢',t:`Agence immobilière${s.agency?' · active':''}`,s:'7 % des loyers · elle trouve les locataires et règle les petits soucis à ta place',right:s.agency?'✔':'',fn:L=>{const q=S(L);q.agency=!q.agency;return out(L,q.agency?'🏢 Tu confies tes biens à une agence.':'🏢 Tu reprends la gestion en direct.')}})]);
  h+=hs.length||s.hist.length?group('Bilan',[row({ic:'💶',t:'Loyers reçus au total',s:fmt(s.income),right:''}),row({ic:'📉',t:'Loyers non payés',s:fmt(s.unpaid),right:''}),row({ic:'🕸️',t:'Loyers perdus (logement vide)',s:fmt(s.vacLoss),right:''}),row({ic:'🚪',t:'Expulsions menées',s:String(s.evictions),right:''}),row({ic:'🛠️',t:'Chantiers de rénovation',s:String(s.reno),right:''})]):'';
  h+=s.hist.length?group('Historique récent',s.hist.slice(-8).reverse().map(x=>row({ic:'📒',t:x.t,s:`À ${An(x.age)}`}))):'';
  return {title:'Mes locations',html:h};
}
function pManage(id){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);
  if(!a)return {title:'Location',html:note('Ce bien n’existe plus.')};
  norm(a);const s=S(L);const mk=maxRent(a);const r=a.rented;
  let h=card(`${TIERN[a.tier]} · note énergie ${dpe(a)}`,fmt(a.value),`Loyer habituel : ${fmt(mk)} par an · rapporte ${pct((r?r.rent:mk)/Math.max(1,a.value))} par an`,statLine('État du bien',a.cond));
  if(L.home===a.id)return {title:a.name,html:h+note('Tu habites ici : tu ne peux pas le louer. Déménage d’abord, puis reviens.')+group('Travaux',[nav('🔨','Travaux et rénovation','Rafraîchir ton chez-toi',pRenov(id))])};
  if(a.works>0)h+=note(`Travaux en cours : le logement est vide et sera prêt dans ${a.works} an${a.works>1?'s':''}. Aucun loyer d’ici là.`);
  if(dpeBan(a)&&!r)h+=note('Note énergie G : le logement laisse passer le froid, on n’a plus le droit de le louer. Il faut d’abord des travaux.');
  else if(dpe(a)==='F'||dpe(a)==='G')h+=note('Note énergie F ou G : le loyer ne peut plus monter, et la location sera bientôt interdite.');
  if(r){
    const ef=posOf(a);
    h+=card('Locataire',r.name,`${cap(r.job)} · depuis ${r.years<1?'cette année':`${r.years} an${r.years>1?'s':''}`} · loyer ${fmt(r.rent)} par an (${POS[ef].n.toLowerCase()})${r.arrears?` · impayés ${fmt(r.arrears)}`:''}`,r.years>=1?statLine('Ponctualité observée',r.rel):'')+(r.years<1?note('La première année dira si le dossier était solide.'):'')+(r.notice?note('Tu lui as demandé de partir : il quittera le logement d’ici la fin de l’année.'):'')+(a.evict?note(`Expulsion en cours : ${STEPS[a.evict.step]}.`):'');
    h+=group('Gérer la location',[
      nav('💶','Changer le loyer',`Actuellement ${fmt(r.rent)} par an`,pRevise(id)),
      nav('🚪','Fin du bail ou expulsion',r.arrears>0||r.late?'Loyers non payés : tu peux agir':'Demander de partir, départ à l’amiable',pEvict(id)),
      act(L,{ic:'🔍',t:'Visiter le logement',s:'Vérifie l’état du logement et la vie du locataire',key:'insp_'+id,fn:L=>{
        if(chance(.35)){const c=Math.round(R(100,500)*kk(L));spend(L,c);a.cond=clamp(a.cond+3);return out(L,`🔍 Tu repères un détail à corriger (${pick(['une moisissure naissante','un joint fatigué','un radiateur qui fuit','une serrure grippée'])}) : ${fmt(c)} de réparation.`)}
        r.rel=clamp(r.rel+1);return out(L,`🔍 ${first(r)} t’accueille avec le thé. ${pick(['Le logement est bien tenu.','Rien à signaler, à part un cactus mal en point.','Les murs sont couverts d’affiches, mais propres.'])}`)}})]);
  }else if(a.works<=0){
    const pubd=a.pubY===L.age;
    h+=group('Fixer le loyer',Object.keys(POS).map(k=>row({ic:'💶',t:`${POS[k].n} · ${fmt(Math.round(mk*POS[k].m/10)*10)} par an`,s:POS[k].s,right:a.pos===k?'✔':'',dis:pubd&&(a.cands||[]).length>0?'Annonce déjà publiée cette année':'',a:()=>run(()=>{a.pos=k;a.cands=null;return ''})})));
    const ban=dpeBan(a)?'Note énergie G : location interdite':L.prison?'En prison':pubd?'Annonce déjà publiée cette année':'';
    h+=group('Trouver un locataire',[
      act(L,{ic:'📰',t:'Publier l’annonce',s:'Les candidats arrivent aussitôt (une annonce par an)',dis:ban,fn:L=>{a.pubY=L.age;a.cands=genCands(L,a);a.vacY=a.vacY||0;
        return out(L,a.cands.length?`📰 L’annonce de ${a.name.toLowerCase()} reçoit ${a.cands.length} dossier${a.cands.length>1?'s':''}.`:`📰 Aucun dossier à ce prix pour ${a.name.toLowerCase()}. Il faudra baisser le loyer ou attendre.`)}}),
      a.cands&&a.cands.length?nav('📄','Candidats',`${a.cands.length} dossier${a.cands.length>1?'s':''} à regarder`,pCands(id)):null,
      row({ic:a.hold?'⏸️':'▶️',t:a.hold?'Logement gardé vide (l’agence ne le loue pas)':'Ne pas confier à l’agence',s:a.hold?'Touche pour autoriser la location':'Utile avant de lancer des travaux',a:()=>run(()=>{a.hold=!a.hold;return ''})})]);
  }
  h+=group('Travaux',[nav('🔨','Travaux et rénovation','Rafraîchir, rénover, monter en gamme',pRenov(id))]);
  return {title:a.name,html:h};
}}
function pCands(id){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);
  if(!a||!a.cands)return {title:'Dossiers',html:note('Aucun dossier pour l’instant. Publie une annonce.')};
  if(!a.cands.length)return {title:'Dossiers',html:note('Plus aucun dossier. Une nouvelle annonce sera possible l’an prochain.')};
  return {title:'Candidats',html:note(`Loyer demandé : environ ${fmt(a.cands[0].rent)} par an. Bon réflexe : choisir quelqu’un qui gagne au moins 3 fois le loyer. Un entretien en dit souvent plus que les papiers.`)+group('Candidats',a.cands.map(c=>row({ic:'📄',t:c.name,s:`${cap(c.job)} · ${fmt(c.inc)} par an · ${c.guar==='Aucun'?'sans garant':lc(GUAR[c.guar])}`,right:`×${ratioTxt(c.inc/Math.max(1,c.rent))}`,a:()=>pushPanel(pCand(id,c.id))})))};
}}
function pCand(id,cid){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);const c=a&&a.cands&&a.cands.find(x=>x.id===cid);
  if(!c)return {title:'Dossier',html:note('Ce dossier n’est plus disponible.')};
  const ratio=c.inc/Math.max(1,c.rent);
  const h=card(`${cap(c.job)}`,c.name,`Revenus ${fmt(c.inc)} par an · ${c.ret?'retraité':c.stud?'étudiant':`${c.sen} an${c.sen>1?'s':''} dans son métier`} · ${GUAR[c.guar]}`,`<div class="cs">Loyer ${fmt(c.rent)} par an · revenus = ${ratioTxt(ratio)} fois le loyer</div>`)
    +(c.clues.length?group('Ce que l’entretien a révélé',c.clues.map(x=>row({ic:TIER_EMO[x.tone],t:x.k,s:x.a}))):note('Aucun entretien pour l’instant.'));
  return {title:'Dossier',html:h+group('Décision',[
    act(L,{ic:'🗣️',t:'Faire passer un entretien',s:c.int?'Entretien déjà mené':'Trois questions pour sonder le candidat',dis:c.int?'Entretien déjà mené':'',fn:L=>{interview(L,a,c);return ''}}),
    act(L,{ic:'🔑',t:'Signer le bail',s:`${fmt(c.rent)} par an`,fn:L=>{const t=sign(L,a,c);STACK.pop();if(!a.cands||!a.cands.length)STACK.pop();return t}}),
    act(L,{ic:'🗑️',t:'Refuser le dossier',danger:true,fn:L=>{a.cands=a.cands.filter(x=>x!==c);STACK.pop();return `Dossier de ${first(c)} décliné.`}})])};
}}
function pRevise(id){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);
  if(!a||!a.rented)return {title:'Loyer',html:note('Aucun locataire.')};
  norm(a);const r=a.rented,mk=maxRent(a);
  return {title:'Changer le loyer',html:card('Loyer actuel',fmt(r.rent),`Prix habituel : ${fmt(mk)} par an · ${POS[posOf(a)].n.toLowerCase()}`)+note('Un loyer trop haut fait fuir les locataires et les rend moins fiables ; un loyer bas les attache. Une révision par an.')+group('Options',[
    act(L,{ic:'⚖️',t:'Mettre au prix habituel',s:r.rent>=mk?'Déjà au prix habituel':`Passer à ${fmt(mk)}`,key:'rev_'+id,dis:r.rent>=mk?'Déjà au prix habituel':dpe(a)>'E'?'Note énergie F ou G : loyer bloqué':'',fn:L=>{const d=mk/Math.max(1,r.rent)-1;r.rent=mk;r.rel=clamp(r.rel-Math.round(8+d*40));return out(L,`⚖️ Le loyer passe à ${fmt(mk)}. ${first(r)} négocie, râle, et signe.`)}}),
    act(L,{ic:'📈',t:'Augmenter de 5 %',s:`Passer à ${fmt(r.rent*1.05)}`,key:'rev_'+id,dis:r.rent>=mk*1.2?'Déjà bien plus cher que les autres':dpe(a)>'E'?'Note énergie F ou G : loyer bloqué':'',fn:L=>{r.rent=Math.round(r.rent*1.05);r.rel=clamp(r.rel-5);return out(L,'📈 Hausse de 5 % acceptée du bout des lèvres.')}}),
    act(L,{ic:'📉',t:'Baisser de 5 %',s:`Passer à ${fmt(r.rent*.95)}`,key:'rev_'+id,fn:L=>{r.rent=Math.round(r.rent*.95);r.rel=clamp(r.rel+7);return out(L,'📉 Un geste de ta part : ton locataire t’en est reconnaissant.')}})])};
}}
function pEvict(id){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);
  if(!a||!a.rented)return {title:'Fin du bail',html:note('Aucun locataire pour l’instant.')};
  norm(a);const r=a.rented,e=a.evict,s=S(L);
  const mot=r.arrears>0||r.late>0;
  let h=card('Situation',r.name,mot?`Loyers non payés : ${fmt(r.arrears)} · ${r.late} année${r.late>1?'s':''} de retard`:'Tout est payé',e?`<div class="cs">Où en est-on : ${esc(STEPS[e.step])}${e.winter?` · ${e.winter} report${e.winter>1?'s':''} à cause de l’hiver`:''}</div>`:'');
  h+=note('Pour expulser un locataire, il faut plusieurs étapes : l’huissier réclame les loyers (deux mois), le tribunal, le jugement, l’ordre de quitter les lieux (deux mois), puis la police. Pas d’expulsion du 1er novembre au 31 mars : une décision peut attendre le printemps.');
  const rows=[];
  if(!e){
    rows.push(act(L,{ic:'💬',t:'Relancer à l’amiable',s:'Gratuit · un coup de fil, un courrier gentil',key:'ami_'+id,dis:mot?'':'Tout est payé',fn:L=>{
      if(chance(.35+r.rel/200)){const v=Math.round(r.arrears*R(40,100)/100);earn(L,v);r.arrears-=v;r.late=r.arrears>0?r.late:0;return out(L,`💬 ${first(r)} se met à jour en partie : ${fmt(v)} reçus.`)}
      r.rel=clamp(r.rel-4);return out(L,'💬 Il promet, il promet… sans rien virer.')}}));
    rows.push(act(L,{ic:'📬',t:'Envoyer l’huissier réclamer les loyers',s:`${fmt(350)} · le locataire a deux mois pour payer`,cost:350,dis:mot?'':'Tout est payé : pas de motif',fn:L=>{return evAct(L,a,r,1)}}));
  }else{
    if(e.step===1)rows.push(act(L,{ic:'⚖️',t:'Aller au tribunal',s:`${fmt(1200)} · l’audience aura lieu d’ici la fin de l’année`,cost:1200,fn:L=>{return evAct(L,a,r,2)}}));
    if(e.step===2)rows.push(row({ic:'⏳',t:'Tribunal : en attente',s:'Le jugement sera rendu d’ici la fin de l’année',dis:'En attente',a:()=>{}}));
    if(e.step===3)rows.push(act(L,{ic:'📜',t:'Ordonner au locataire de partir',s:`${fmt(400)} · il a deux mois pour partir`,cost:400,fn:L=>{return evAct(L,a,r,4)}}));
    if(e.step===4)rows.push(act(L,{ic:'🚔',t:'Demander l’aide de la police',s:`${fmt(600)} · la préfecture décide (pas d’expulsion en hiver)`,cost:600,fn:L=>{return evAct(L,a,r,5)}}));
    if(e.step===5)rows.push(row({ic:'⏳',t:'Préfecture : en attente',s:'Pas d’expulsion du 1er novembre au 31 mars',dis:'En attente',a:()=>{}}));
    rows.push(act(L,{ic:'🏳️',t:'Abandonner l’expulsion',s:'Les frais déjà payés sont perdus',fn:L=>{a.evict=null;STACK.length>1&&STACK.pop();return out(L,'🏳️ Tu renonces à l’expulsion.')}}));
  }
  const fee=Math.round(r.rent/2);
  const rows2=[
    act(L,{ic:'🎁',t:'Payer le locataire pour qu’il parte',s:`${fmt(fee)} · départ à l’amiable, loyers non payés effacés`,dis:L.money<fee?'Fonds insuffisants':'',fn:L=>{
      if(chance(.75)){spend(L,fee);hist(L,`${r.name} quitte ${a.name.toLowerCase()} à l’amiable.`);a.rented=null;a.evict=null;a.vacY=0;a.cands=null;STACK.pop();return out(L,`🎁 ${first(r)} prend l’enveloppe et les clés partent avec elle. Il part sans faire d’histoire.`)}
      r.rel=clamp(r.rel-5);return out(L,'🎁 Il refuse, vexé : « Je ne suis pas à vendre. »')}}),
    act(L,{ic:'📮',t:'Demander au locataire de partir',s:r.years<3?'Possible seulement quand le bail de trois ans se termine':'Le locataire part d’ici la fin de l’année',dis:r.notice?'Déjà demandé':r.years<3?'Bail de 3 ans en cours':'',fn:L=>{r.notice=1;chg(L,{karma:-1});return out(L,`📮 ${r.name} doit quitter le logement dans six mois.`)}})];
  return {title:'Fin du bail ou expulsion',html:h+group('Expulsion',rows)+group('Autres solutions',rows2)};
}}
window.landlordRenov=id=>pRenov(id);
function pRenov(id){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);
  if(!a)return {title:'Travaux',html:note('Ce bien n’existe plus.')};
  norm(a);
  return {title:'Travaux et rénovation',html:card(`${TIERN[a.tier]} · état ${a.cond} %`,fmt(a.value),`De gros travaux vident le logement pendant un an. Le prix dépend de ce que vaut le logement en bon état (${fmt(baseOf(a))}).`,statLine('État du bien',a.cond))
    +group('Niveaux de travaux',REN.map(lv=>{const c=renoCost(a,lv);return act(L,{ic:lv.ic,t:lv.n,s:`${fmt(c)} · ${lv.txt}`,cost:c,key:lv.k==='rafr'?'rafr_'+id:'',dis:renoDis(L,a,lv),fn:L=>renoDo(L,a,lv)})}))};
}}
function newFix(L){
  const s=S(L),k=kk(L);
  if(s.fixAge===L.age&&s.fix.length)return s.fix;
  const city=COUNTRIES[L.country]?COUNTRIES[L.country].cities:[L.city];
  s.fix=shuffle(HOUSE_TYPES.filter(([n,f])=>f<=5)).slice(0,3).map(([n,f])=>{
    const base=Math.round(160000*f*k*R(80,120)/100/1000)*1000,cond=R(12,38);
    const price=Math.max(8000,Math.round(base*fc(cond)*R(88,100)/100/1000)*1000);
    return {id:nid(),n,place:pick(city),base,cond,price,est:Math.round(base*R(92,108)/100/1000)*1000,defect:pick(['toiture à reprendre','électricité très ancienne','humidité dans les murs','cuisine des années soixante-dix','sans chauffage central','vente rapide après un héritage','sols défoncés'])};
  });
  s.fixAge=L.age;return s.fix;
}
function pFix(){
  const L=cur();const list=newFix(L);
  return {title:'Logements à rénover',html:note('Annonces de l’année : les prix sont bas, les logements abîmés. Après les travaux, la valeur peut grimper nettement, mais de gros travaux prennent un an sans loyer.')+group('Annonces',list.map(x=>row({ic:'🏚️',t:`${x.n} à rénover · ${x.place}`,s:`${fmt(x.price)} · état ${x.cond} % · ${x.defect}`,right:'›',a:()=>pushPanel(pFixBuy(x.id))})))};
}
function pFixBuy(id){return ()=>{
  const L=cur();const s=S(L);const x=s.fix.find(f=>f.id===id);
  if(!x)return {title:'Annonce',html:note('Ce bien vient d’être vendu.')};
  const down=Math.round(x.price*.2),loan=x.price-down,pay=Math.round(loan*1.3/20);
  const ok=income(L)*.35>=pay;
  const buy=credit=>L=>{
    const a={id:nid(),kind:'house',name:`${x.n} à rénover · ${x.place}`,value:x.price,loan:credit?loan:0,pay:credit?pay:0,left:credit?20:0,cond:x.cond,fixer:1,tier:0,works:0,vacY:0,pos:'marche'};
    L.assets.push(a);s.fix=s.fix.filter(f=>f!==x);s.bought++;
    trackMax(L,'houses',houses(L).length);chg(L,{happy:4});hist(L,`Achat de ${a.name.toLowerCase()} (${fmt(x.price)}).`);
    STACK.pop();return out(L,`🏚️ Tu achètes ${a.name.toLowerCase()}${credit?', en empruntant sur 20 ans':' comptant'}. Le notaire a l’air amusé.`);
  };
  return {title:`${x.n} à rénover`,html:card(x.place,fmt(x.price),`État ${x.cond} % · ${x.defect} · charges et impôt local : ${fmt(x.price*.008)} par an`,statLine('État du bien',x.cond))+note(`Après de gros travaux, le logement vaudrait environ ${fmt(x.est)}. Les travaux coûteraient environ ${fmt(Math.round(x.base*.10))}, sans compter les mauvaises surprises.`)+group('Financement',[
    act(L,{ic:'💶',t:'Payer comptant',s:fmt(x.price),cost:x.price,fn:buy(false)}),
    act(L,{ic:'🏦',t:'Emprunter sur 20 ans',s:`Tu paies ${fmt(down)} tout de suite · ${fmt(pay/12)} par mois`,cost:down,dis:!ok?'Refusé : les mensualités doivent rester sous 35 % de tes revenus (les loyers comptent pour 70 %)':'',fn:buy(true)})])};
}}

/* ---------- Migration, héritage ---------- */
function resetAsset(a){a.evict=null;a.works=0;a.pend=null;a.cands=null;a.vacY=0;a.pubY=null;a.rented=null}

registerMod({
  id:MOD,
  worldInit(){},
  born(L){try{S(L)}catch(e){console.error(e)}},
  year(L){try{yearAll(L)}catch(e){console.error(e)}},
  events,
  eventsDb,effects,conds,
  assetRows(L){
    if(L.age<18)return [];
    const n=lets(L).length,h=houses(L).length;
    return [nav('🔑','Mes locations',h?`${n} logement${n>1?'s':''} loué${n>1?'s':''} sur ${h} · ${fmtk(lets(L).reduce((t,a)=>t+a.rented.rent,0))} par an`:'Achète, rénove, loue',pGestion)];
  },
  assetDetailRows(L,a){
    if(a.kind!=='house'||L.home===a.id)return [];
    norm(a);
    return [nav('🔑','Gérer la location',statusOf(L,a),pManage(a.id))];
  },
  badges(L){const n=lets(L).length;return n>0?[`Propriétaire · ${n} logement${n>1?'s':''}`]:[]},
  inherit(D,L){try{L.landlord=null;S(L);for(const a of houses(L))resetAsset(a)}catch(e){console.error(e)}}
});
})();
