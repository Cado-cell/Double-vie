/* Deux Vies — extensions reprises de la version monolithique et branchées sur le registre de modules :
   carrières spéciales (acteur, musicien, sportif, mannequin, réalisateur, astronaute), politique, milieu, agent secret,
   entreprise, mouvement spirituel, zoo, location de logements, marché noir. */
(()=>{
const filmTitle=()=>`${pick(TITLE_A)} ${pick(TITLE_B)}`;
const stars=n=>'★'.repeat(Math.round(n))+'☆'.repeat(5-Math.round(n));
const SPECIAL={
 acteur:{n:'Acteur',ic:'🎬',ladder:['Figurant','Second rôle','Acteur principal','Tête d’affiche','Star de cinéma'],req:{age:16,looks:45},desc:'Auditions, tournages et César'},
 musique:{n:'Musicien',ic:'🎤',ladder:['Musicien de rue','Artiste indépendant','Artiste signé','Disque d’or','Star internationale'],req:{age:14},desc:'Albums, tournées et Victoires de la musique'},
 sport:{n:'Sportif pro',ic:'🏆',ladder:['Espoir','Joueur pro','Titulaire','Capitaine','Légende'],req:{age:16,health:70,maxAge:28},desc:'Saisons, trophées et transferts'},
 mannequin:{n:'Mannequin',ic:'📸',ladder:['Mannequin débutant','Mannequin','Top-modèle','Égérie de luxe'],req:{age:16,looks:72},desc:'Défilés et campagnes de luxe'},
 realisateur:{n:'Réalisateur',ic:'🎥',ladder:['Assistant réalisateur','Réalisateur','Réalisateur reconnu','Maître du cinéma'],req:{age:20},desc:'Onze genres de films, box-office et Palme d’or'},
 astro:{n:'Astronaute',ic:'🚀',ladder:['Candidat astronaute','Astronaute','Commandant de mission'],req:{age:24,deg:['ingenieur','medecine','*doc','master_sciences','master_maths'],health:80,smarts:75},desc:'Missions vers la station spatiale, la Lune et Mars'}
};
/* ================= Carrières spéciales ================= */
const SP_PAY={acteur:[12000,30000,90000,300000,1500000],musique:[3000,15000,60000,250000,1200000],sport:[20000,120000,500000,1800000,4000000],mannequin:[15000,60000,300000,1000000],realisateur:[25000,60000,150000,400000],astro:[55000,85000,120000]};
function spSalary(L){const j=L.job;const b=(SP_PAY[j.c]||[20000])[j.lvl]||20000;return Math.round(b*(.6+L.fame/150)*(j.c==='sport'&&j.sport==='tennis'?.8:1))}
function spPromote(L){const j=L.job,lad=SPECIAL[j.c].ladder;if(j.lvl>=lad.length-1)return;j.lvl++;chg(L,{happy:10,fame:5});say(L,`📈 Tu deviens ${title(L).toLowerCase()} !`);if(j.lvl===lad.length-1)track(L,'topCareer')}
function spYear(L){
  const j=L.job;j.perf=clamp(j.perf+R(-6,6)+(L.hid.discipline-50)/25);
  if(j.c!=='astro')L.fame=clamp(L.fame+Math.round((j.perf-50)/12)+R(-2,3));
  if(j.c==='sport'){
    const a=L.age,form=(L.st.health+L.hid.athletic+j.perf)/3+R(-15,15)-(a>31?(a-31)*4:0);
    const S=SPORTS[j.sport];
    if(form>78&&chance(.45)){const tr=S.solo?pick(['Roland-Garros','l’Open d’Australie','Wimbledon','l’US Open']):j.sport==='velo'?pick(['le Tour de France','Paris-Roubaix','le Giro']):pick(['le championnat','la coupe nationale','la Ligue des champions']);track(L,'trophies');chg(L,{fame:8,happy:10});say(L,`🏆 Tu remportes ${tr} !`)}
    else say(L,`Saison ${form>60?'solide':form>45?'correcte':'difficile'} avec ${S.solo?'ton coach':j.team}.`);
    if(form>70&&j.y>=2)spPromote(L);
    if(a>=36&&chance(.5)){say(L,'Tu prends ta retraite sportive sous les applaudissements.');L.job=null;L.retired=true;L.pension=Math.round(spSalary({job:Object.assign({},j),fame:L.fame})*.1);return}
  }else if(j.c==='acteur'){if((j.works||0)>=j.lvl*2+1&&L.fame>=j.lvl*18)spPromote(L);
    if(j.lvl>=2&&chance(.12+L.fame/400)){track(L,'cesars');chg(L,{fame:6,happy:10});say(L,`🏆 Tu reçois le César ${pick(['de la meilleure interprétation','du meilleur second rôle','de la révélation'])} !`)}}
  else if(j.c==='musique'){if((j.works||0)>=j.lvl+1&&L.fame>=j.lvl*18)spPromote(L);
    if(j.lvl>=2&&chance(.1+L.fame/400)){chg(L,{fame:6,happy:10});say(L,`🏆 Victoire de la musique : ${pick(['album de l’année','artiste de l’année','chanson de l’année'])} !`)}}
  else if(j.c==='mannequin'){if(j.perf>70&&j.y>=2&&L.st.looks>60)spPromote(L);if(L.age>35&&chance(.3)){say(L,'Les agences te proposent moins de contrats. Tu tires ta révérence.');L.job=null;return}}
  else if(j.c==='realisateur'){if((j.works||0)>=j.lvl*2+1)spPromote(L)}
  else if(j.c==='astro'){if(j.perf>70&&j.y>=3)spPromote(L)}
  earn(L,spSalary(L));
}
function applySpecial(L,k){
  const S=SPECIAL[k];
  const go=(bonus,extra)=>{
    let p=.15+bonus;
    if(k==='acteur')p+=L.st.looks/400+skillOf(L,'comedie')/180;
    if(k==='musique')p+=skillOf(L,'musique')/160;
    if(k==='sport')p+=(L.hid.athletic+L.st.health)/400+skillOf(L,'sport')/250;
    if(k==='mannequin')p+=(L.st.looks-70)/50+skillOf(L,'mannequinat')/300;
    if(k==='realisateur')p+=(hasDeg(L,'cinema')?.4:0)+L.st.smarts/400;
    if(k==='astro')p+=(L.st.smarts-75)/80+(L.st.health-80)/80;
    if(!chance(Math.max(.03,Math.min(.92,p))))return out(L,`Refusé : ${S.n.toLowerCase()}, ce ne sera pas pour cette fois.`);
    L.job=Object.assign({c:k,sp:1,lvl:0,perf:R(45,65),y:0,works:0},extra||{});L.retired=false;
    chg(L,{happy:10,fame:3});return out(L,`${S.ic} Te voilà ${title(L).toLowerCase()} !`);
  };
  if(k==='sport'){modal({title:'Sportif pro',text:'Quel sport ?',choices:Object.entries(SPORTS).map(([s,S2])=>({t:S2.n,fn:()=>{modal({title:`Essai · ${S2.n}`,text:S2.solo?'Un entraîneur réputé t’observe pendant un tournoi.':'Le recruteur du club te regarde jouer un match d’essai.',choices:[{t:'Tout donner',fn:()=>go(.08,{sport:s,team:S2.team?pick(S2.team):null})},{t:'Jouer collectif',fn:()=>go(.03,{sport:s,team:S2.team?pick(S2.team):null})},{t:'Tenter un geste spectaculaire',fn:()=>go(chance(.5)?.25:-.15,{sport:s,team:S2.team?pick(S2.team):null})}]})}}))});return}
  if(k==='musique'){modal({title:'Musicien',text:'Quel style de musique ?',choices:MUSIC_GENRES.map(g=>({t:g,fn:()=>{modal({title:`Audition · ${g}`,text:'Le producteur veut entendre ta maquette.',choices:[{t:'Jouer ta meilleure compo',fn:()=>go(.05,{genre:g})},{t:'Faire une reprise connue',fn:()=>go(0,{genre:g})},{t:'Improviser en direct',fn:()=>go(chance(.5)?.22:-.15,{genre:g})}]})}}))});return}
  const q={acteur:'Le directeur de casting te demande d’improviser une scène de rupture.',mannequin:'L’agence te demande de défiler devant le jury.',realisateur:'Un producteur te reçoit pour écouter ton projet de film.',astro:'Épreuves de sélection : centrifugeuse, tests psychologiques et entretien.'}[k];
  modal({title:`Audition · ${S.n}`,icon:S.ic,text:q,choices:[{t:'Tout donner',fn:()=>go(.05)},{t:'Rester naturel',fn:()=>go(0)},{t:'Tenter un coup de poker',fn:()=>go(chance(.5)?.22:-.15)}]});
}
function pSpecialJob(L){
  const j=L.job,S=SPECIAL[j.c];const H=[];
  if(j.c==='acteur'){
    H.push(act(L,{ic:'🎭',t:'Passer une audition',s:'Film, série ou publicité',key:'aud',fn:L=>{
      const kind=pick(['un film','une série','une pièce de théâtre','une publicité']);const g=pick(MOVIE_GENRES);const role=j.lvl>=2?'le rôle principal':pick(['un second rôle','un petit rôle','une apparition']);
      const p=.35+skillOf(L,'comedie')/250+L.fame/300+(j.agent?.15:0);
      if(!chance(Math.min(.9,p)))return out(L,'Le casting choisit quelqu’un d’autre.');
      const t=filmTitle();const pay=Math.round(spSalary(L)*R(20,60)/100);j.works++;earn(L,pay);chg(L,{fame:R(2,6),happy:5});
      return out(L,`🎬 Tu décroches ${role} dans ${kind} (${g.toLowerCase()}) : « ${t} ». Cachet : ${fmt(pay)}.`)}}));
    H.push(act(L,{ic:'🎓',t:'Cours d’art dramatique',s:'Améliore ton jeu · 1 500 €',cost:1500,key:'cours',fn:L=>{L.skills.theatre=clamp((L.skills.theatre||0)+R(6,12));return out(L,'Tu travailles Tchekhov au Cours Florent.')}}));
    if(!j.agent)H.push(act(L,{ic:'🤝',t:'Engager un agent',s:'Plus de castings, 10 % de commission',fn:L=>{j.agent=1;return out(L,'Tu signes avec un agent artistique.')}}));
    H.push(act(L,{ic:'📣',t:'Faire la promotion de ton dernier film',key:'promo',fn:L=>{chg(L,{fame:R(2,5),happy:-1});return out(L,'Plateaux télé, radios, avant-premières. On ne parle que de toi.')}}));
  }
  if(j.c==='musique'){
    H.push(act(L,{ic:'💿',t:'Enregistrer un album',s:'Un an de studio',key:'album',fn:L=>{
      const t=filmTitle(),q=skillOf(L,'musique')/2+L.fame/3+R(0,40);const sales=Math.round(Math.pow(Math.max(5,q),2.6)*(j.lvl+1)*3);const money=Math.round(sales*1.4);j.works++;earn(L,money);chg(L,{fame:Math.round(q/20),happy:6});
      const cert=sales>=500000?' Disque de diamant !':sales>=100000?' Disque de platine !':sales>=50000?' Disque d’or !':'';
      return out(L,`💿 Ton album « ${t} » (${(j.genre||'pop').toLowerCase()}) se vend à ${fmtn(sales)} exemplaires.${cert} Tu touches ${fmt(money)}.`)}}));
    H.push(act(L,{ic:'🎤',t:'Partir en tournée',s:'Fatigant mais lucratif',key:'tour',min:16,fn:L=>{const g=Math.round((L.fame*L.fame*25+3000)*R(70,130)/100);earn(L,g);chg(L,{health:-4,happy:6,fame:2});return out(L,`🎤 Tournée de ${R(12,60)} dates. Recette : ${fmt(g)}.`)}}));
    H.push(act(L,{ic:'🎼',t:'Composer un single',key:'single',fn:L=>{if(chance(.15+skillOf(L,'musique')/400)){chg(L,{fame:8});return out(L,'🔥 Ton single devient le tube de l’été.')}chg(L,{fame:1});return out(L,'Ton single passe inaperçu.')}}));
  }
  if(j.c==='sport'){
    H.push(act(L,{ic:'🏋️',t:'S’entraîner dur',key:'train',fn:L=>{j.perf=clamp(j.perf+R(5,10));chg(L,{athletic:3,health:2});return out(L,'Double séance tous les jours. Tu es affûté.')}}));
    H.push(act(L,{ic:'✍️',t:'Négocier une prolongation',key:'nego',fn:L=>{if(chance(j.perf/130)){L.fame=clamp(L.fame+3);return out(L,'Contrat prolongé avec une belle revalorisation.')}return out(L,'Les dirigeants ne veulent pas augmenter ton salaire.')}}));
    if(!SPORTS[j.sport].solo)H.push(act(L,{ic:'🔁',t:'Demander un transfert',key:'transfert',fn:L=>{const t=pick(SPORTS[j.sport].team.filter(x=>x!==j.team));j.team=t;L.fame=clamp(L.fame+2);return out(L,`Transfert accepté : tu rejoins ${t}.`)}}));
  }
  if(j.c==='mannequin'){
    H.push(act(L,{ic:'👠',t:'Défiler à la Fashion Week',key:'defile',fn:L=>{const g=Math.round(spSalary(L)*.2);earn(L,g);chg(L,{fame:3});j.perf=clamp(j.perf+5);return out(L,`Tu défiles pour ${pick(['une maison parisienne','un créateur japonais','une marque italienne'])}. ${fmt(g)} de cachet.`)}}));
    H.push(act(L,{ic:'📸',t:'Campagne pour une maison de luxe',key:'campagne',fn:L=>{if(chance(.3+L.fame/200)){const g=Math.round(spSalary(L)*.5);earn(L,g);chg(L,{fame:6});return out(L,`📸 Tu deviens le visage d’un nouveau parfum. ${fmt(g)}.`)}return out(L,'La marque choisit un autre visage.')}}));
    H.push(act(L,{ic:'🥗',t:'Surveiller ta ligne',key:'ligne',fn:L=>{chg(L,{looks:2,happy:-2});j.perf=clamp(j.perf+4);return out(L,'Salade, footing, eau citronnée.')}}));
  }
  if(j.c==='realisateur')H.push(act(L,{ic:'🎥',t:'Réaliser un film',s:'Onze genres possibles',key:'film',fn:L=>{directFilm(L)}}));
  if(j.c==='astro'){
    H.push(act(L,{ic:'🌀',t:'Entraînement en centrifugeuse',key:'centri',fn:L=>{j.perf=clamp(j.perf+R(4,9));chg(L,{health:2});return out(L,'Huit g dans la centrifugeuse. Tu tiens bon.')}}));
    if(j.lvl>=1)H.push(act(L,{ic:'🚀',t:'Partir en mission',s:j.lvl>=2?'Station spatiale, Lune ou Mars':'Station spatiale internationale',key:'mission',fn:L=>{spaceMission(L)}}));
  }
  if(j.works)H.push(row({ic:'📚',t:'Filmographie et œuvres',s:`${j.works} réalisation${j.works>1?'s':''}`,a:()=>pushPanel(pWorks)}));
  return group(`${S.n} · ${title(L)}`,H);
}
function pWorks(){const L=cur();const F=(L.films||[]).slice().reverse();return {title:'Œuvres',html:F.length?group('Films réalisés',F.map(f=>row({t:`${f.t} (${f.age} ans)`,s:`${f.g} · ${stars(f.score)} · box-office ${fmtk(f.box)}${f.award?' · '+f.award:''}`}))):note('Tes rôles et albums figurent dans ton journal de vie.')}}
function directFilm(L){
  const j=L.job;
  modal({title:'Nouveau film',icon:'🎥',text:'Quel genre de film veux-tu réaliser ?',choices:MOVIE_GENRES.map(g=>({t:g,fn:()=>{
    modal({title:`${g} · budget`,text:'Quel budget ?',choices:[[`Petit budget (500 000 €)`,5e5,1],[`Budget moyen (5 M€)`,5e6,2],[`Superproduction (60 M€)`,6e7,3]].map(([t,b,lv])=>({t,fn:()=>{
      const o=G.players.length>1?G.players[1-idxOf(L)]:null;const castO=o&&o.alive&&o.job&&o.job.c==='acteur';
      modal({title:'Casting',text:'Qui sera la tête d’affiche ?',choices:[
        {t:'Des inconnus talentueux',fn:()=>shoot(L,g,b,lv,0)},
        {t:'Une star bankable (+20 % de budget)',fn:()=>shoot(L,g,b*1.2,lv,12)},
        ...(castO?[{t:`${o.first}, l’autre joueur`,fn:()=>{o.job.works++;chg(o,{fame:6});say(o,`🎬 ${L.first} te confie le rôle principal de son prochain film.`);return shoot(L,g,b,lv,8+o.fame/10)}}]:[])
      ]})}}))})}}))});
}
function shoot(L,g,budget,lv,star){
  const j=L.job;const sk=L.st.smarts/3+j.perf/3+L.fame/6+star+R(0,35);
  const score=Math.max(1,Math.min(5,(sk/22)+R(-1,1)*.5));
  const mult={'Action':2.4,'Science-fiction':2.2,'Animation':2.5,'Comédie':2,'Horreur':2.6,'Romance':1.5,'Drame':1.1,'Thriller':1.6,'Documentaire':.6,'Western':1,'Comédie musicale':1.4}[g];
  const box=Math.round(budget*mult*(score/3)*R(40,160)/100);
  const profit=Math.round((box-budget)*.15+budget*.05);
  let award='';
  if(score>=4.4&&['Drame','Documentaire','Thriller','Romance','Western'].includes(g)&&chance(.35)){award='Palme d’or';track(L,'palme');chg(L,{fame:15})}
  else if(score>=4&&chance(.3)){award='César du meilleur film';track(L,'cesars');chg(L,{fame:8})}
  const t=filmTitle();(L.films=L.films||[]).push({t,g,score,box,award,age:L.age});j.works++;earn(L,Math.max(profit,20000));chg(L,{fame:Math.round(score*2),happy:score>=3?8:-4});
  return out(L,`🎬 « ${t} » (${g.toLowerCase()}) : ${stars(score)} · ${fmtk(box)} au box-office${award?` · 🏆 ${award} !`:''}.`);
}
function spaceMission(L){
  const j=L.job;const opts=[['Station spatiale internationale',.015,'space']];if(j.lvl>=2){opts.push(['Base lunaire',.05,'moon'],['Mars',.12,'mars'])}
  modal({title:'Mission spatiale',icon:'🚀',text:'Où pars-tu ?',choices:opts.map(([d,r,k])=>({t:d,fn:()=>{
    if(chance(r)){L.st.health=0;return out(L,'💥 Une avarie critique survient pendant le vol.')}
    track(L,'space');if(k==='moon'||k==='mars')track(L,'moon');chg(L,{fame:k==='mars'?40:k==='moon'?25:8,happy:15});j.perf=clamp(j.perf+10);
    return out(L,k==='mars'?'🔴 Tu poses le pied sur Mars. L’humanité entière te regarde.':k==='moon'?'🌕 Tu marches sur la Lune. Un petit pas pour toi.':'🛰️ Six mois à bord de la station spatiale. La Terre est si belle.')}}))});
}


/* ================= Politique ================= */
function polYear(L){
  const P=L.pol;if(!P)return;
  if(P.cand!=null){
    const O=OFFICES[P.cand];const score=P.support+R(-15,15);
    if(score>=50){
      const was=P.office;P.office=P.cand;P.term=O.term;P.approval=clamp(55+R(-5,10));chg(L,{happy:12,fame:O.k==='president'?40:5+P.office*3});
      say(L,`🗳️ ${was===P.cand?'Réélu':'Élu'} ! Tu deviens ${fem(O.n,L).toLowerCase()} avec ${clamp(score,50,80)} % des voix.`);
      if(O.k==='president')track(L,'president');
    }else say(L,`🗳️ Défaite à l’élection : ${clamp(score,10,49)} % des voix seulement.`);
    P.cand=null;P.support=0;
  }
  if(P.office>=0){
    const O=OFFICES[P.office];earn(L,O.sal);P.term--;P.approval=clamp(P.approval+R(-6,3));
    if(P.term<=0){if(O.appointed){say(L,'Remaniement : tu quittes le gouvernement.');P.office=Math.max(-1,P.prev==null?-1:P.prev)}else{say(L,`Ton mandat de ${O.n.toLowerCase()} arrive à son terme. Tu peux te représenter.`);P.prev=P.office;P.office=-1}}
    if(P.office>=2&&P.office<4&&P.approval>70&&chance(.2)){P.prev=P.office;P.office=4;P.term=5;say(L,'📞 Le Président t’appelle : tu es nommé ministre !')}
  }
}
function pPolitics(){
  const L=cur();if(!L.pol)L.pol={office:-1,party:null,approval:50,support:0,cand:null};const P=L.pol;const H=[];
  if(!P.party){return {title:'Politique',html:note('Pour faire carrière en politique, commence par rejoindre un parti.')+group('Partis',PARTIES.map(p=>act(L,{ic:'🏛️',t:p,min:18,fn:L=>{P.party=p;return out(L,`Tu prends ta carte : ${p}.`)}})))}}
  if(P.office>=0)H.push(card(P.party,fem(OFFICES[P.office].n,L),`Fin du mandat dans ${An(P.term)} · ${fmt(OFFICES[P.office].sal)} par an`,statLine('Popularité',P.approval)));
  if(P.cand!=null){
    H.push(card('Campagne en cours',OFFICES[P.cand].n,'Résultat à la fin de l’année',statLine('Intentions de vote',clamp(P.support))));
    H.push(group('Faire campagne',[
      act(L,{ic:'🎤',t:'Tenir un meeting',key:'c_meet',fn:L=>{P.support+=R(2,8)+L.fame/20;return out(L,'Salle comble et drapeaux qui flottent.')}}),
      act(L,{ic:'📺',t:'Débat télévisé',key:'c_deb',fn:L=>{const d=R(-6,10)+(L.st.smarts-50)/8;P.support+=d;return out(L,d>0?'Tu remportes le débat haut la main.':'Une gaffe en direct. Les réseaux s’en donnent à cœur joie.')}}),
      act(L,{ic:'🚪',t:'Faire du porte-à-porte',key:'c_porte',fn:L=>{P.support+=R(1,5);chg(L,{health:-1});return out(L,'Tu serres des centaines de mains.')}}),
      act(L,{ic:'📰',t:'Campagne d’affichage',s:fmt(OFFICES[P.cand].cost||5000),cost:OFFICES[P.cand].cost||5000,key:'c_pub',fn:L=>{P.support+=R(4,10);return out(L,'Ton visage s’affiche sur tous les panneaux.')}}),
      act(L,{ic:'🤝',t:'Promettre la lune',key:'c_promesse',fn:L=>{P.support+=R(3,9);chg(L,{karma:-3});return out(L,'Baisse des impôts, hausse des salaires et soleil garanti.')}})]));
  }else{
    const next=OFFICES.map((O,i)=>({O,i})).filter(({O,i})=>!O.appointed&&(i<=Math.max(P.office,P.prev??-1)+1||i===P.office||i===P.prev)&&!(O.k==='president'&&Math.max(P.office,P.prev??-1)<2));
    H.push(group('Se présenter',next.map(({O,i})=>act(L,{ic:'🗳️',t:`Candidature : ${O.n}`,s:`Mandat de ${O.term} ans · campagne d’un an`,min:O.min,fn:L=>{P.cand=i;P.support=25+L.fame/4+(P.office>=0?10:0)+(L.hid.karma-50)/5+R(-5,5);return out(L,`Tu annonces ta candidature : ${O.n.toLowerCase()}.`)}}))));
  }
  if(P.office>=0)H.push(group('Exercer le pouvoir',[
    act(L,{ic:'📜',t:'Proposer une loi',key:'p_loi',fn:L=>{const d=R(-8,10);P.approval=clamp(P.approval+d);return out(L,d>0?`Ta loi ${pick(['sur la semaine de quatre jours','contre le gaspillage alimentaire','pour la gratuité des musées','sur les pistes cyclables'])} est adoptée.`:'Ta loi est rejetée par l’opposition.')}}),
    act(L,{ic:'✂️',t:'Inaugurer quelque chose',key:'p_inau',fn:L=>{P.approval=clamp(P.approval+R(1,5));return out(L,`Tu coupes le ruban d’${pick(['une médiathèque','un rond-point','une piscine municipale','une ligne de tramway'])}.`)}}),
    act(L,{ic:'💶',t:'Accepter une enveloppe',s:'Illégal',key:'p_env',danger:1,fn:L=>{const g=R(20000,200000);if(chance(.3)){P.approval=clamp(P.approval-30);L.record++;track(L,'scandals');return out(L,'💥 Affaire de corruption révélée par la presse ! Ta popularité s’effondre.')}L.money+=g;chg(L,{karma:-8});return out(L,`Tu empoches ${fmt(g)} discrètement.`)}}),
    row({ic:'🚪',t:'Démissionner',danger:1,a:()=>pushPanel(confirmP('Démissionner ?','Tu quittes ton mandat.',()=>{P.prev=P.office;P.office=-1;return out(L,'Tu démissionnes.')}))})]));
  H.push(group('Parti',[row({ic:'🔁',t:'Changer de parti',s:P.party,a:()=>run(()=>{P.party=pick(PARTIES.filter(x=>x!==P.party));P.approval=clamp(P.approval-8);return out(L,`Tu rejoins ${P.party}. On te traite de girouette.`)})})]));
  return {title:'Politique',html:H.join('')};
}

/* ================= Milieu ================= */
function mobYear(L){const M=L.mob;if(!M)return;if(L.prison)return;if(chance(.08+M.rank*.02)){M.heat=(M.heat||0)+1;say(L,'La brigade criminelle s’intéresse à ta famille.')}}
function pMob(){
  const L=cur();
  if(!L.mob)return {title:'Le milieu',html:note('Les familles du milieu recrutent les gens qui savent se taire. Un casier judiciaire est un plus.')+group('Familles',MOB_FAMILIES.map(f=>act(L,{ic:'🎩',t:f,min:18,key:'mobtry',fn:L=>{if(chance(.25+(L.record?.3:0)+(50-L.hid.karma)/150)){L.mob={fam:f,rank:0,resp:0};chg(L,{karma:-5});return out(L,`🎩 ${f} t’accepte comme associé.`)}return out(L,`${f} ne te fait pas confiance.`)}})))};
  const M=L.mob;
  const H=MOB_JOBS.map(J=>act(L,{ic:'💼',t:J.n,s:J.cost?`Coût : ${fmt(J.cost)} · respect`:`Gain : ${fmt(J.gain[0])} à ${fmt(J.gain[1])}`,key:'mob_'+J.n,cost:J.cost||0,fn:L=>{
    if(chance(J.risk*(1+(M.heat||0)*.2))){L.record++;return mobTrial(L,J)}
    const g=J.gain[1]?R(J.gain[0],J.gain[1]):0;L.money+=g;M.resp+=J.resp;chg(L,{karma:-3});
    let msg=`Mission réussie${g?` : ${fmt(g)} empochés`:''}.`;
    if(M.rank<MOB_RANKS.length-1&&M.resp>=(M.rank+1)*20){M.rank++;msg+=` Tu deviens ${MOB_RANKS[M.rank].toLowerCase()}.`;if(M.rank===MOB_RANKS.length-1){track(L,'parrain');msg+=' 🎩 Tu es le nouveau parrain.'}}
    return out(L,msg)}}));
  H.push(row({ic:'🚪',t:'Quitter la famille',danger:1,a:()=>pushPanel(confirmP('Quitter le milieu ?','On ne quitte pas une famille si facilement.',()=>{if(chance(.3)){L.st.health=clamp(L.st.health-35);L.mob=null;return out(L,'On te le fait payer. Tu finis à l’hôpital, mais tu es libre.')}L.mob=null;return out(L,'La famille te laisse partir.')}))}));
  return {title:M.fam,html:card('Le milieu',MOB_RANKS[M.rank],`Respect : ${M.resp} · surveillance policière : ${M.heat||0}`,'')+group('Missions',H)};
}
function mobTrial(L,J){const C={n:J.n,jail:[2,8],fine:20000,lawyer:30000};say(L,`Mission ratée : ${J.n.toLowerCase()}. La police t’arrête.`);trial(L,C);return ''}

/* ================= Agent secret ================= */
function spyYear(L){const S=L.spy;if(!S)return;earn(L,[38000,48000,62000,80000,110000][S.rank]);S.cover=clamp(S.cover+R(2,6))}
function pSpy(){
  const L=cur();
  if(!L.spy){const miss=reqMiss(L,{age:22,deg:['*lic','*master','sciencespo','droit','ingenieur'],smarts:60,clean:1});return {title:'Service Hexagone',html:note('Le Service Hexagone recrute des agents discrets, intelligents et sans casier judiciaire. Tu garderas ton emploi actuel comme couverture.')+group('Recrutement',[act(L,{ic:'🕶️',t:'Postuler au service de renseignement',dis:miss,key:'spytry',fn:L=>{if(chance(.35+L.st.smarts/300)){L.spy={rank:0,missions:0,cover:100};return out(L,'🕶️ Bienvenue au Service Hexagone, agent.')}return out(L,'Ta candidature est écartée. Personne ne te dira pourquoi.')}})])}}
  const S=L.spy;
  const H=SPY_MISSIONS.map((M,i)=>act(L,{ic:'🗺️',t:M.n,s:`Destination : ${SPY_CITIES[(i+L.age)%SPY_CITIES.length]}`,key:'spym',fn:L=>{runMission(L,M,SPY_CITIES[(i+L.age)%SPY_CITIES.length]);}}));
  const F=L.assets.filter(a=>a.kind==='front');
  return {title:'Service Hexagone',html:card('Agent secret',SPY_RANKS[S.rank],`${S.missions} mission${S.missions>1?'s':''} réussie${S.missions>1?'s':''}${F.length?` · façade : ${F[0].name.toLowerCase()}`:''}`,statLine('Couverture',S.cover))+group('Missions (une par an)',H)+group('Façades',SPY_FRONTS.map(([n,p])=>act(L,{ic:'🏪',t:n,s:`${fmt(p)} · protège ta couverture`,cost:p,dis:F.some(f=>f.name===n)?'Déjà acquise':'',fn:L=>{L.assets.push({id:nid(),kind:'front',name:n,value:p});return out(L,`Tu achètes une façade : ${n.toLowerCase()}.`)}})))+group('',[row({ic:'🚪',t:'Démissionner du service',danger:1,a:()=>pushPanel(confirmP('Quitter le service ?','Tu devras garder le secret toute ta vie.',()=>{L.spy=null;return out(L,'Tu rends ton badge. Officiellement, tu n’as jamais existé.')}))})])};
}
function runMission(L,M,city){
  const S=L.spy;let ok=0;const stat={charme:L.st.looks,agilite:L.hid.athletic,sangfroid:L.hid.willpower,intelligence:L.st.smarts};
  const step=i=>{
    if(i>=M.steps.length){
      if(ok>=2){S.missions++;track(L,'missions');const g=R(8000,40000)*(S.rank+1);L.money+=g;chg(L,{happy:8});let m=`🕶️ Mission réussie à ${city} : ${M.n.toLowerCase()}. Prime : ${fmt(g)}.`;if(S.rank<SPY_RANKS.length-1&&S.missions>=(S.rank+1)*3){S.rank++;m+=` Tu deviens ${SPY_RANKS[S.rank].toLowerCase()}.`}return out(L,m)}
      const front=L.assets.some(a=>a.kind==='front');S.cover=clamp(S.cover-R(10,30)*(front?.5:1));
      if(S.cover<20&&chance(.5)){L.prison=R(2,6);say(L,`🚨 Ta couverture saute à ${city}. Tu es ${ge(L,'arrêté','arrêtée')} et ${ge(L,'condamné','condamnée')} à ${An(L.prison)} de prison à l’étranger.`);L.spy=null;return 'Arrestation à l’étranger.'}
      return out(L,`Mission ratée à ${city}. Tu rentres de justesse.`);
    }
    const [lab,k]=M.steps[i];
    modal({title:`${M.n} · étape ${i+1}/3`,icon:'🕶️',text:lab+'.',choices:[
      {t:'Approche prudente',fn:()=>{if(chance(.45+stat[k]/250))ok++;return step(i+1)}},
      {t:'Approche audacieuse',fn:()=>{if(chance(.25+stat[k]/170))ok++;else S.cover=clamp(S.cover-8);return step(i+1)}},
      {t:'Gadget du laboratoire',fn:()=>{if(chance(.6))ok++;return step(i+1)}}]});
    return '';
  };
  step(0);
}

/* ================= Entreprise ================= */
const SECTORS=['Restauration','Mode','Technologie','Cosmétiques','Jeux vidéo','Transport','Agroalimentaire','Énergie solaire'];
function bizYear(L){
  const B=L.biz;if(!B)return;B.y++;
  const g=gauss()*.25+(L.st.smarts-50)/400+(B.mk||0)*.04+(B.emp||1)*.004;B.mk=0;
  B.value=Math.max(0,Math.round(B.value*(1+g)));const profit=Math.round(B.value*R(4,14)/100*B.share/100);
  if(B.value<2000){say(L,`💸 ${B.name} fait faillite.`);L.biz=null;chg(L,{happy:-15});return}
  earn(L,profit);say(L,`📊 ${B.name} : ${g>=0?'+':''}${Math.round(g*100)} % de croissance. Ta part des bénéfices : ${fmt(profit)}.`);
  trackMax(L,'bizMax',B.value);
}
function pBiz(){
  const L=cur();
  if(!L.biz)return {title:'Entreprise',html:note('Crée ton entreprise : sa valeur évolue chaque année selon le marché, ton intelligence et tes décisions.')+group('Secteurs',SECTORS.map(s=>act(L,{ic:'🏢',t:`Créer une entreprise : ${s.toLowerCase()}`,s:'Capital de départ : 20 000 €',cost:20000,min:18,fn:L=>{const nm=`${pick(['Nova','Hexa','Atelier','Maison','Studio','Groupe','Lumen','Kiwi'])} ${pick([L.last,pick(['Azur','Volta','Canopée','Mistral','Ondine'])])}`;L.biz={name:nm,sector:s,value:20000,share:100,emp:1,y:0,mk:0};return out(L,`🏢 Tu fondes ${nm} (${s.toLowerCase()}).`)}})))};
  const B=L.biz;
  return {title:B.name,html:card(B.sector,fmtk(B.value),`Tu détiens ${B.share} % · ${B.emp} salarié${B.emp>1?'s':''} · ${An(B.y)} d’existence`,'')+group('Gestion',[
    act(L,{ic:'💶',t:'Investir 50 000 €',s:'Augmente la valeur',cost:50000,fn:L=>{B.value+=Math.round(50000*R(70,130)/100);return out(L,`Tu réinvestis dans ${B.name}.`)}}),
    act(L,{ic:'📣',t:'Campagne marketing',s:'10 000 €',cost:10000,key:'b_mk',fn:L=>{B.mk=(B.mk||0)+2;return out(L,'Ta campagne publicitaire fait parler de la marque.')}}),
    act(L,{ic:'🧑‍💼',t:'Recruter',s:'+10 salariés',key:'b_rec',fn:L=>{B.emp+=10;B.value=Math.round(B.value*.97);return out(L,'Dix nouvelles recrues rejoignent l’équipe.')}}),
    act(L,{ic:'🦄',t:'Lever des fonds',s:'Cède 20 % pour du capital',key:'b_vc',dis:B.share<=30?'Tu ne contrôlerais plus ta société':'',fn:L=>{const g=Math.round(B.value*.2);B.share-=20;B.value+=g;return out(L,`Des investisseurs injectent ${fmt(g)} contre 20 % du capital.`)}}),
    act(L,{ic:'🔔',t:'Introduction en Bourse',dis:B.value<5e6?'Valeur minimale : 5 M€':B.ipo?'Déjà cotée':'',fn:L=>{B.ipo=1;B.value=Math.round(B.value*1.5);chg(L,{fame:10});return out(L,`🔔 ${B.name} entre en Bourse. Sa valeur bondit de 50 %.`)}}),
    row({ic:'🤝',t:'Vendre l’entreprise',s:`Tu toucherais ${fmt(B.value*B.share/100)}`,a:()=>pushPanel(confirmP(`Vendre ${B.name} ?`,'Un repreneur est prêt à signer.',()=>{const g=Math.round(B.value*B.share/100);L.money+=g;L.biz=null;return out(L,`🤝 Tu vends ${B.name} pour ${fmt(g)}.`)},'Vendre'))})])};
}

/* ================= Mouvement spirituel ================= */
function cultYear(L){
  const C=L.cult;if(!C)return;
  C.fol=Math.max(0,Math.round(C.fol*(1+(C.dev-50)/200)+R(-3,6)));const don=Math.round(C.fol*C.dev*2.5);earn(L,don);trackMax(L,'followers',C.fol);
  C.heat=clamp((C.heat||0)+C.fol/150+R(0,4));
  if(C.heat>70&&chance(.35)){say(L,`🚨 Enquête de la brigade financière sur ${C.name}.`);if(chance(.5)){L.record++;L.prison=R(1,4);say(L,`Tu es ${ge(L,'condamné','condamnée')} à ${An(L.prison)} de prison pour abus de faiblesse.`);L.cult=null}else{C.heat=30;say(L,'Faute de preuves, l’enquête est classée.')}}
}
function pCult(){
  const L=cur();
  if(!L.cult)return {title:'Mouvement spirituel',html:note('Fonde ton propre mouvement, réunis des adeptes et récolte leurs dons. Attention à la brigade financière.')+group('Fonder',[act(L,{ic:'🕯️',t:'Fonder un mouvement',s:'5 000 € de frais de lancement',cost:5000,min:21,fn:L=>{const n=`${pick(CULT_A)} ${pick(CULT_B)}`;L.cult={name:n,fol:R(3,12),dev:50,heat:0};return out(L,`🕯️ Tu fondes ${n}.`)}})])};
  const C=L.cult;
  return {title:C.name,html:card('Gourou',`${fmtn(C.fol)} adepte${C.fol>1?'s':''}`,`Dons estimés : ${fmt(C.fol*C.dev*2.5)} par an`,statLine('Ferveur',C.dev)+statLine('Attention des autorités',C.heat))+group('Activités',[
    act(L,{ic:'📢',t:'Recruter des adeptes',key:'cu_rec',fn:L=>{const n=Math.round(R(2,15)*(1+L.fame/20)*(.5+L.st.looks/100));C.fol+=n;return out(L,`${n} nouvelles personnes rejoignent ${C.name}.`)}}),
    act(L,{ic:'🙏',t:'Prononcer un sermon',key:'cu_ser',fn:L=>{C.dev=clamp(C.dev+R(3,10));return out(L,'Ton sermon sur l’énergie du soleil couchant fait pleurer l’assemblée.')}}),
    act(L,{ic:'⛰️',t:'Organiser une retraite payante',key:'cu_ret',fn:L=>{const g=C.fol*R(50,200);earn(L,g);C.heat=clamp(C.heat+5);return out(L,`Une semaine de méditation en Ardèche rapporte ${fmt(g)}.`)}}),
    act(L,{ic:'🏛️',t:'Construire un temple',s:'250 000 €',cost:250000,dis:C.temple?'Déjà construit':'',fn:L=>{C.temple=1;C.dev=clamp(C.dev+20);return out(L,'Ton temple en forme de tournesol domine la vallée.')}}),
    act(L,{ic:'🧹',t:'Faire profil bas',key:'cu_bas',fn:L=>{C.heat=clamp(C.heat-R(8,15));return out(L,'Tu calmes le jeu pendant quelque temps.')}}),
    row({ic:'🚪',t:'Dissoudre le mouvement',danger:1,a:()=>pushPanel(confirmP('Dissoudre le mouvement ?','Tes adeptes devront trouver une autre lumière.',()=>{L.cult=null;chg(L,{karma:5});return out(L,'Tu dissous ton mouvement.')}))})])};
}

/* ================= Zoo ================= */
function zooValue(L){const Z=L.zoo;if(!Z)return 0;return Z.land+Z.an.reduce((s,a)=>s+ZOO_ANIMALS[a.sp][0]*.7,0)}
function zooYear(L){
  const Z=L.zoo;if(!Z)return;Z.y++;
  const attr=Z.an.reduce((s,a)=>s+ZOO_ANIMALS[a.sp][1]*(a.h/100),0);const visitors=Math.round(attr*900*(.5+Z.rep/100));
  const upkeep=Z.an.reduce((s,a)=>s+ZOO_ANIMALS[a.sp][2],0)+40000;const income=visitors*16;
  earn(L,income);spend(L,upkeep);
  for(const a of Z.an){a.age++;a.h=clamp(a.h+R(-12,4))}
  const dead=Z.an.filter(a=>a.h<=5||a.age>R(18,40));if(dead.length){Z.an=Z.an.filter(a=>!dead.includes(a));say(L,`🦓 ${dead.map(a=>a.name).join(', ')} ${dead.length>1?'sont morts':'est mort'} au zoo.`);Z.rep=clamp(Z.rep-5)}
  const sp={};Z.an.forEach(a=>sp[a.sp]=(sp[a.sp]||0)+1);for(const s in sp)if(sp[s]>=2&&chance(.2)){const nm=pick(PETN);Z.an.push({sp:s,name:nm,age:0,h:90});say(L,`🍼 Naissance au zoo : ${nm}, un bébé ${s.toLowerCase()} !`);Z.rep=clamp(Z.rep+4)}
  Z.rep=clamp(Z.rep+R(-3,3));trackMax(L,'zooMax',Z.an.length);
  say(L,`🎟️ ${Z.name} : ${fmtn(visitors)} visiteurs, ${fmt(income-upkeep)} de résultat.`);
}
function pZoo(){
  const L=cur();
  if(!L.zoo){const p=Math.round(250000*costOf(L));return {title:'Zoo',html:note('Ouvre ton propre parc zoologique. Les visiteurs paient l’entrée, les animaux coûtent cher à nourrir.')+group('Ouvrir',[act(L,{ic:'🦒',t:'Acheter un terrain et ouvrir un zoo',s:fmt(p),cost:p,min:21,fn:L=>{const n=`${pick(ZOO_NAMES)} de ${L.city}`;L.zoo={name:n,an:[],rep:50,y:0,land:p};return out(L,`🦒 Tu ouvres ${n}.`)}})])}}
  const Z=L.zoo;
  return {title:Z.name,html:card('Zoo',`${Z.an.length} animal${Z.an.length>1?'aux':''}`,`Valeur estimée : ${fmt(zooValue(L))}`,statLine('Réputation',Z.rep))
    +(Z.an.length?group('Pensionnaires',Z.an.map(a=>row({ic:'🐾',t:`${a.name} · ${a.sp.toLowerCase()}`,s:`${An(a.age)} · santé ${a.h} %`,right:'Vendre',a:()=>run(()=>{Z.an=Z.an.filter(x=>x!==a);L.money+=Math.round(ZOO_ANIMALS[a.sp][0]*.6);return out(L,`Tu cèdes ${a.name} à un autre parc.`)})}))):'')
    +group('Gestion',[
      act(L,{ic:'💉',t:'Faire venir les vétérinaires',s:'15 000 €',cost:15000,key:'z_vet',fn:L=>{Z.an.forEach(a=>a.h=clamp(a.h+R(15,30)));return out(L,'Bilan de santé pour tous les animaux.')}}),
      act(L,{ic:'📣',t:'Campagne publicitaire',s:'20 000 €',cost:20000,key:'z_pub',fn:L=>{Z.rep=clamp(Z.rep+R(5,12));return out(L,'Affiches dans tout le pays.')}}),
      act(L,{ic:'🏗️',t:'Rénover les enclos',s:'60 000 €',cost:60000,key:'z_ren',fn:L=>{Z.rep=clamp(Z.rep+R(8,15));Z.an.forEach(a=>a.h=clamp(a.h+10));return out(L,'Des enclos tout neufs, plus grands et plus verts.')}}),
      row({ic:'🤝',t:'Vendre le zoo',s:fmt(zooValue(L)),danger:1,a:()=>pushPanel(confirmP('Vendre le zoo ?','Un repreneur reprend le parc et tous ses animaux.',()=>{L.money+=zooValue(L);L.zoo=null;return out(L,'Tu vends ton zoo.')},'Vendre'))})])
    +group('Acheter un animal',Object.entries(ZOO_ANIMALS).map(([sp,[p,at,up]])=>act(L,{ic:'🛒',t:sp,s:`${fmt(p)} · attractivité ${at} · entretien ${fmt(up)}/an`,cost:p,fn:L=>{const nm=pick(PETN);Z.an.push({sp,name:nm,age:R(1,6),h:R(75,100)});trackMax(L,'zooMax',Z.an.length);return out(L,`🦁 ${nm}, ${sp.toLowerCase()}, arrive au zoo.`)}})))};
}

/* ================= Propriétaire bailleur ================= */
function landlordYear(L){
  for(const a of L.assets){const r=a.rented;if(a.kind!=='house'||!r)continue;
    if(chance(r.rel/100)){earn(L,r.rent)}else{say(L,`🏠 ${r.name} ne paie pas son loyer pour ${a.name.toLowerCase()}.`);r.late=(r.late||0)+1}
    if(chance(.15)){const c=R(500,6000);spend(L,c);a.cond=clamp((a.cond||70)+5);say(L,`🔧 Réparation à prévoir dans ${a.name.toLowerCase()} : ${fmt(c)}.`)}
    if(chance(.1)){say(L,`${r.name} quitte ${a.name.toLowerCase()}. Le logement est libre.`);a.rented=null}
  }
}
function pRentOut(id){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);if(!a)return {title:'Location',html:note('Ce bien n’existe plus.')};
  const base=Math.round(a.value*.045);
  if(a.rented){const r=a.rented;return {title:a.name,html:card('Locataire',r.name,`Loyer : ${fmt(r.rent)} par an · ${r.late?`${r.late} impayé${r.late>1?'s':''}`:'paie à l’heure'}`,statLine('Fiabilité',r.rel))+group('Gestion',[
    act(L,{ic:'📈',t:'Augmenter le loyer de 10 %',key:'aug_'+id,fn:L=>{r.rent=Math.round(r.rent*1.1);r.rel=clamp(r.rel-8);return out(L,'Le locataire râle, mais signe l’avenant.')}}),
    act(L,{ic:'🔧',t:'Rénover le logement',s:fmt(a.value*.05),cost:Math.round(a.value*.05),key:'ren_'+id,fn:L=>{a.cond=100;a.value=Math.round(a.value*1.06);r.rel=clamp(r.rel+8);return out(L,'Cuisine neuve, peinture fraîche. Valeur en hausse.')}}),
    row({ic:'🚪',t:'Expulser le locataire',danger:1,a:()=>pushPanel(confirmP('Expulser le locataire ?','La procédure prend du temps et coûte des frais d’avocat.',()=>{L.money-=2500;a.rented=null;STACK.pop();return out(L,`Tu expulses ${r.name}.`)}))})])}}
  if(L.home===a.id)return {title:a.name,html:note('Tu habites ce logement. Déménage d’abord pour le louer.')};
  if(!a.apps)a.apps=[0,1,2].map(()=>{const g=pick(['H','F']);return {name:`${rname(g,L.country)} ${rlast(L.country)}`,job:pick(NPC_JOBS),rel:R(35,98),offer:Math.round(base*R(85,115)/100)}});
  return {title:a.name,html:note(`Loyer de marché estimé : ${fmt(base)} par an. Choisis un locataire parmi les candidatures.`)+group('Candidatures',a.apps.map(c=>row({ic:'📄',t:c.name,s:`${cap(c.job)} · propose ${fmt(c.offer)} par an`,right:mini(c.rel),a:()=>run(()=>{a.rented={name:c.name,rent:c.offer,rel:c.rel,late:0};a.apps=null;STACK.pop();return out(L,`🔑 Tu loues ${a.name.toLowerCase()} à ${c.name}.`)})})))}
}}


/* ================= Marché noir ================= */
function bmPrices(L){if(!L.bm)L.bm={stock:{},heat:0};if(!L.bm.px||L.bm.pxAge!==L.age){L.bm.px={};for(const [k,[b,v]] of Object.entries(BM_ITEMS))L.bm.px[k]=Math.max(1,Math.round(b*(1+gauss()*v)));L.bm.pxAge=L.age}return L.bm.px}
function bmYear(L){const B=L.bm;if(!B)return;const vol=Object.values(B.stock).reduce((s,q)=>s+q,0);if(B.heat>20&&chance(B.heat/250)){say(L,'🚨 Descente de police dans ton entrepôt !');B.stock={};B.heat=0;L.record++;trial(L,{n:'Recel et contrebande',jail:[1,5],fine:15000,lawyer:12000})}else B.heat=Math.max(0,B.heat-5+vol/200)}
function pBlack(){
  const L=cur();const px=bmPrices(L);const B=L.bm;
  return {title:'Marché noir',html:note('Achète des marchandises à bas prix, revends-les quand les cours montent. Plus tu en manipules, plus la police s’intéresse à toi.')+card('Contrebandier',fmt(Object.entries(B.stock).reduce((s,[k,q])=>s+q*px[k],0)),'Valeur de ton stock aux prix de cette année',statLine('Attention de la police',clamp(B.heat)))
    +Object.entries(BM_ITEMS).map(([k])=>{const q=B.stock[k]||0;return group(`${k} · ${fmt(px[k])} l’unité${q?` · stock : ${q}`:''}`,[
      act(L,{ic:'🟢',t:'Acheter 10 unités',s:fmt(px[k]*10),cost:px[k]*10,min:16,fn:L=>{B.stock[k]=(B.stock[k]||0)+10;B.heat+=R(1,4);track(L,'crimes');return `Tu stockes 10 unités : ${k.toLowerCase()}.`}}),
      act(L,{ic:'🔴',t:`Tout revendre (${q})`,s:fmt(px[k]*q),dis:!q?'Rien en stock':'',fn:L=>{L.money+=px[k]*q;B.stock[k]=0;B.heat+=R(2,6);return out(L,`Tu écoules ${q} unités pour ${fmt(px[k]*q)}.`)}})])}).join('')};
}


const nrow=(ic,t,s,f)=>nav(ic,t,s,f);
const has=id=>MODS.some(m=>m.id===id);
registerMod({
  id:'legacy',
  special:Object.fromEntries(Object.entries(SPECIAL).map(([k,S])=>[k,{n:S.n,ic:S.ic,desc:S.desc,ladder:S.ladder,req:S.req,apply:L=>applySpecial(L,k),year:L=>spYear(L),salary:L=>spSalary(L),panel:L=>pSpecialJob(L),noFame:k==='astro'}])),
  year(L){if(!has('power')){polYear(L);mobYear(L)}if(!has('spy'))spyYear(L);if(!has('business_street'))bizYear(L);if(!has('cult'))cultYear(L);if(!has('zoo'))zooYear(L);if(!has('landlord'))landlordYear(L);if(!has('blackmarket'))bmYear(L)},
  events(L){
    let q=0;
    if(!has('zoo')&&L.zoo&&L.zoo.an.length&&chance(.12)){q++;const a=pick(L.zoo.an);modal({title:L.zoo.name,icon:'🦁',text:`${a.name}, ${a.sp.toLowerCase()}, s’est échappé de son enclos !`,choices:[{t:'Fermer le zoo et le rattraper',fn:()=>{L.zoo.rep=clamp(L.zoo.rep-3);return out(L,`${a.name} est rattrapé sans blessé.`)}},{t:'Laisser les soigneurs gérer discrètement',fn:()=>{if(chance(.5))return out(L,'Les soigneurs le ramènent avant l’ouverture.');L.zoo.rep=clamp(L.zoo.rep-15);return out(L,`📰 ${a.name} se promène en ville. La presse s’en donne à cœur joie.`)}}]})}
    return q;
  },
  workRows:L=>L.age>=18?[...(has('power')?[]:[nrow('🏛️','Politique',L.pol&&L.pol.office>=0?fem(OFFICES[L.pol.office].n,L):'Du conseil municipal à l’Élysée',pPolitics)]),...(has('business_street')?[]:[nrow('🏢','Entreprise',L.biz?L.biz.name:'Crée ta société',pBiz)])]:[],
  activities:L=>[
    {ic:'🏢',t:'Entreprise',s:'Crée ta société',panel:pBiz,min:18,id:'business_street'},
    {ic:'🕯️',t:'Mouvement spirituel',s:'Fonde ton mouvement',panel:pCult,min:21,id:'cult'},
    {ic:'🦒',t:'Zoo',s:'Ouvre ton parc animalier',panel:pZoo,min:21,id:'zoo'},
    {ic:'🕳️',t:'Marché noir',s:'Contrebande',panel:pBlack,min:16,id:'blackmarket'},
    {ic:'🕶️',t:'Service de renseignement',s:'Missions d’agent secret',panel:pSpy,min:18,id:'spy'},
    {ic:'🎩',t:'Le milieu',s:'Crime organisé',panel:pMob,min:18,id:'power'},
    {ic:'🏛️',t:'Politique',s:'Élections',panel:pPolitics,min:18,id:'power'}].filter(x=>!has(x.id)),
  assetRows:L=>[...(has('business_street')?[]:[nrow('🏢','Entreprise',L.biz?L.biz.name:'Crée ta société',pBiz)]),...(has('zoo')?[]:[nrow('🦒','Zoo',L.zoo?L.zoo.name:'Ouvre ton parc animalier',pZoo)]),...(has('blackmarket')?[]:[nrow('🕳️','Marché noir','Contrebande et contrefaçons',pBlack)])],
  assetDetailRows:(L,a)=>!has('landlord')&&a.kind==='house'&&L.home!==a.id?[nrow('🔑',a.rented?'Gérer la location':'Mettre en location',a.rented?`Loué à ${a.rented.name}`:'Choisis un locataire',pRentOut(a.id))]:[],
  netWorth:L=>(!has('business_street')&&L.biz?L.biz.value:0)+(!has('zoo')&&L.zoo?zooValue(L):0),
  jobLabel:L=>!has('power')&&L.pol&&L.pol.office>=0?fem(OFFICES[L.pol.office].n,L):(!has('business_street')&&!L.job&&L.biz?ge(L,'Chef d’entreprise','Cheffe d’entreprise'):null),
  inherit(D,L){if(!has('business_street'))L.biz=D.biz;if(!has('zoo'))L.zoo=D.zoo},
  jailed(L){if(!has('power')&&L.pol&&L.pol.office>=0)L.pol.office=-1}
});
})();
