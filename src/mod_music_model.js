/* Deux Vies — module « Musique et mode » (id music_model)
   Carrière spéciale MUSICIEN (clé musique) : instruments, groupe, contrat de maison de disques, albums, tournées, Victoires de la musique.
   Carrière spéciale MANNEQUIN (clé mannequin) : agences, entretien du corps, séances photo, Fashion Week, campagnes de luxe.
   État : L.music et L.model (migrent l’ancien L.job.genre / L.job.works / L.job.perf de la version simple). Monde : G.mmTrend. */
(()=>{
const MOD='music_model';
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const isJ=(L,c)=>!!(L&&L.job&&L.job.sp&&L.job.c===c);
const N=(q,o)=>({q,o});
const mgr=()=>(typeof G==='object'&&G)?G:{};

/* ============================ MUSICIEN : données ============================ */
const GM={'Pop':1.15,'Rap':1.2,'Rock':1,'Électro':1.05,'Variété française':1.1,'Jazz':.7,'R’n’B':1,'Métal':.75};
const gMult=g=>GM[g]||1;
const ALB_A=['Minuit','Velours','Béton','Soleil','Cendres','Néon','Mistral','Dimanche','Fièvre','Cristal','Marée','Zinc','Cerises','Azur','Tonnerre','Mélancolie','Sirop','Feu de camp'];
const ALB_B=['Électrique','Sauvage','Blanc','Éternel','de Banlieue','du Samedi Soir','Nocturne','Fragile','Géant','à Paris','Perdu','Tropical','Sans Retour','Mécanique','au Citron'];
const albumTitle=()=>`${pick(ALB_A)} ${pick(ALB_B)}`;
const BAND_NAMES=['Les Chaussettes Électriques','Baguette Magique','Les Hérissons Furieux','Crème Brûlée','Les Gilets Fluo','Camembert Sonore','Mardi Gras','Les Petits Pois Sauteurs','Bleu Marine','Les Escargots Rapides','Tonton Fusion','Les Pyjamas du Roi','Cassoulet Express','La Pétanque Atomique'];
const ROLES=[['Guitariste','Guitariste'],['Bassiste','Bassiste'],['Batteur','Batteuse'],['Claviériste','Claviériste'],['Chanteur','Chanteuse']];
const LABELS=[{n:'Disques du Pont-Neuf',fame:8},{n:'Sonic Baguette Records',fame:22},{n:'Maison Lumière Musique',fame:42},{n:'Hexagone Majors',fame:62}];
const PRODS=[
 {n:'Ton cousin et son home studio',cost:1500,q:30,d:'Un micro, une couette contre le mur et beaucoup d’enthousiasme.'},
 {n:'Studio de quartier à Montreuil',cost:12000,q:48,d:'Une vraie console et un chat de studio.'},
 {n:'Réalisateur artistique reconnu',cost:60000,q:68,d:'Trois disques d’or au compteur et un avis sur tout.'},
 {n:'Producteur de renom international',cost:200000,q:84,d:'Il a fait chanter les plus grands. Il facture comme eux.'}];
const VENUES=[
 {k:'bar',n:'Bars et cafés-concerts',ic:'🍺',cap:150,tk:12,dates:12,fame:0,cost:0,fat:8,fg:1,share:.5,d:'12 soirées, la bière est comprise'},
 {k:'salle',n:'Salles de concert de province',ic:'🎪',cap:800,tk:25,dates:12,fame:15,cost:3000,fat:12,fg:2,share:.32,d:'12 dates, de Lille à Perpignan'},
 {k:'olympia',n:'L’Olympia',ic:'🎭',cap:2000,tk:45,dates:6,fame:35,cost:20000,fat:15,fg:4,share:.3,d:'6 soirs rue Caumartin, le rideau rouge'},
 {k:'zenith',n:'Les Zénith de France',ic:'🏟️',cap:6000,tk:55,dates:6,fame:55,cost:90000,fat:22,fg:6,share:.28,d:'6 Zénith, camions et machine à fumée'},
 {k:'stade',n:'Le Stade de France',ic:'🌍',cap:60000,tk:65,dates:2,fame:78,cost:400000,fat:30,fg:9,share:.25,d:'2 soirs à Saint-Denis, 60 000 briquets'}];
const SEGN=['Ouverture','Cœur du concert','Rappel'];
const CERTN=['','disque d’or','disque de platine','disque de diamant'];
const certOf=n=>n>=500000?3:n>=100000?2:n>=50000?1:0;

/* ============================ MUSICIEN : état ============================ */
function ms(L){
  let m=L.music;if(!m||typeof m!=='object')m=L.music={};
  if(!m.inst||typeof m.inst!=='object')m.inst={};
  if(!Array.isArray(m.albums))m.albums=[];
  for(const [k,d] of [['hits',0],['tours',0],['gigs',0],['vic',0],['fatigue',0],['buzz',0],['cert',0],['stade',0],['busk',0],['idle',0],['actY',0]])if(typeof m[k]!=='number'||isNaN(m[k]))m[k]=d;
  if(!('band' in m))m.band=null;if(!('contract' in m))m.contract=null;if(!('offer' in m))m.offer=null;if(!('cer' in m))m.cer=null;if(!('quarrel' in m))m.quarrel=null;
  if(m.band&&(!Array.isArray(m.band.members)||!m.band.name))m.band=null;
  const j=isJ(L,'musique')?L.job:null;
  if(!m.genre)m.genre=(j&&j.genre)||'Pop';
  if(j){if(!j.genre)j.genre=m.genre;if(!m.mig){m.mig=1;if(!m.albums.length&&(j.works||0)>0)m.hits=Math.min(3,j.works)}}
  return m;
}
const mus=L=>lim(Math.round(skillOf(L,'musique')),0,100);
const albumsN=L=>Math.max(ms(L).albums.length,(L.job&&L.job.works)||0);
const lastAlbum=m=>m.albums[m.albums.length-1]||null;
const bandN=m=>m.band?m.band.members.length:0;
const shareOf=L=>1/(1+.45*bandN(ms(L)));
function bandBonus(L){const m=ms(L);if(!m.band||!m.band.members.length)return 0;const ms2=m.band.members;const avg=ms2.reduce((s,b)=>s+b.skill,0)/ms2.length;const ten=ms2.reduce((s,b)=>s+b.ten,0)/ms2.length;return Math.round(Math.min(12,ms2.length*3+avg/14)-ten/12)}
const roleOf=b=>(ROLES[b.role]||ROLES[0])[b.g==='F'?1:0];
const trendOf=()=>mgr().mmTrend;
function royalty(L,units){const m=ms(L),c=m.contract;
  if(c){let r=units*7*(c.roy||10)/100;if((c.unrec||0)>0){const rec=Math.min(c.unrec,r);c.unrec-=rec;r-=rec}return Math.round(r*shareOf(L))}
  return Math.round(units*3*shareOf(L))}
function baseRoy(L){const j=L.job;if(!j)return 0;const m=ms(L);const b=[2000,8000,30000,100000,400000][Math.min(4,j.lvl||0)];return Math.round(b*(.4+L.fame/100)*(albumsN(L)>0?1:.5)*shareOf(L))}
function checkPromo(L){
  if(!isJ(L,'musique'))return;const j=L.job,m=ms(L),n=albumsN(L);let up=false;
  if(j.lvl===0&&L.fame>=10&&(n>=1||m.gigs+m.tours>=2))up=true;
  else if(j.lvl===1&&(m.contract||(L.fame>=28&&n>=1)))up=true;
  else if(j.lvl===2&&m.cert>=2)up=true;
  else if(j.lvl===3&&L.fame>=85&&(m.cert>=3||m.stade>0))up=true;
  if(up&&j.lvl<4){j.lvl++;chg(L,{happy:10,fame:3});say(L,`📈 Ta carrière décolle : tu deviens ${title(L).toLowerCase()} !`);if(j.lvl>=4)track(L,'topCareer');checkPromo(L)}
}
function splitBand(L,why){
  const m=ms(L);if(!m.band)return '';const nm=m.band.name;m.band=null;m.quarrel=null;chg(L,{fame:-R(3,8),happy:-R(8,14)});m.buzz=Math.max(0,m.buzz-15);track(L,'bandSplits');
  return out(L,`💔 ${nm} se sépare ${why||'après une dernière engueulade'}. Tu continues en solo.`);
}
function makeBand(L,size,name){
  const m=ms(L);const roles=shuffle([0,1,2,3,4]).slice(0,size);const mem=roles.map(r=>{const g=chance(.5)?'H':'F';return {id:nid(),n:rname(g,L.country),g,role:r,skill:R(35,75),rel:R(60,90),ten:R(0,25)}});
  m.band={name,members:mem,since:L.age};track(L,'bands');
  return out(L,`🎸 Tu fondes ${name} avec ${mem.map(b=>b.n).join(', ')}.`);
}

/* ============================ MUSICIEN : audition ============================ */
function applyMusic(L){
  modal({title:'Musicien',icon:'🎤',text:'Quel style de musique veux-tu défendre ?',choices:MUSIC_GENRES.map(g=>({t:g,fn:()=>{
    const go=(bonus,how)=>{
      const p=lim(.18+bonus+mus(L)/170+(L.talent==='musique'?.1:0)+L.fame/500,.04,.92);
      if(!chance(p)){const Ls=LESSONS.filter(l=>l.t==='musique').sort((a,b)=>(L.skills[b.k]||0)-(L.skills[a.k]||0))[0];if(Ls)L.skills[Ls.k]=clamp((L.skills[Ls.k]||0)+2);chg(L,{happy:-3});return out(L,`🎤 ${how} : le producteur sourit poliment et te dit « on vous rappellera ». Retourne répéter.`)}
      L.job={c:'musique',sp:1,lvl:0,perf:R(45,65),y:0,works:0,genre:g};L.retired=false;const m=ms(L);m.genre=g;chg(L,{happy:10,fame:2});track(L,'musicCareer');
      return out(L,`🎤 ${how} : ça passe ! Te voilà ${title(L).toLowerCase()} de ${g.toLowerCase()}.`)};
    modal({title:`Audition · ${g}`,icon:'🎤',text:'Le producteur croise les bras. À toi de jouer.',choices:[
      {t:'Jouer ta meilleure composition',fn:()=>go(.06,'Ta composition')},
      {t:'Faire une reprise que tout le monde connaît',fn:()=>go(0,'Ta reprise')},
      {t:'Improviser en direct',danger:1,fn:()=>go(chance(.5)?.22:-.12,'Ton improvisation')}]});
  }}))});
}

/* ============================ MUSICIEN : contrat ============================ */
function mkOffer(L){
  let t=0;for(let i=0;i<LABELS.length;i++)if(L.fame>=LABELS[i].fame-4)t=i;
  if(t>0&&chance(.4))t--;
  return {label:LABELS[t].n,tier:t,adv:Math.round(R(15,35)*1000*(1+t*1.7)*(.6+L.fame/70)/500)*500,roy:Math.min(17,R(9,13)+t),albums:R(2,4),exp:L.age+1,rounds:0};
}
function signContract(L){
  const m=ms(L),o=m.offer;if(!o)return '';
  earn(L,o.adv);m.contract={label:o.label,tier:o.tier,adv:o.adv,roy:o.roy,left:o.albums,total:o.albums,unrec:o.adv,idle:0,age:L.age};m.offer=null;track(L,'contracts');chg(L,{happy:12,fame:3});
  let t=`✍️ Tu signes chez ${o.label} : ${fmt(o.adv)} d’avance, ${o.roy} % de royalties, ${o.albums} album${o.albums>1?'s':''}.`;
  if(isJ(L,'musique')&&L.job.lvl<2){L.job.lvl=2;t+=` Te voilà ${title(L).toLowerCase()} !`}
  return out(L,t);
}
function negotiate(L){
  const m=ms(L),o=m.offer;if(!o)return '';
  const last=o.rounds>=3;
  const ask=kind=>{
    o.rounds++;const p=lim(.55+(L.st.smarts-50)/220+L.fame/260+(mus(L)-40)/400-o.rounds*.1-(kind==='all'?.3:0),.08,.85);
    if(chance(p)){
      let t;
      if(kind==='adv'||kind==='all'){o.adv=Math.round(o.adv*(kind==='all'?1.2:1.3)/500)*500}
      if(kind==='roy'||kind==='all'){o.roy=Math.min(20,o.roy+(kind==='all'?1:2))}
      if(kind==='alb'||kind==='all'){o.albums=Math.max(1,o.albums-1)}
      t=pick(['Le directeur artistique soupire, griffonne et accepte.','« Bon, on peut faire un geste », glisse l’avocat du label.','Après un coup de fil à sa direction, il revient avec une nouvelle version.']);
      say(L,`✍️ Contre-offre acceptée. ${t}`);negotiate(L);return '';
    }
    if(o.rounds>=3||chance(kind==='all'?.7:.3)){m.offer=null;return out(L,`😬 ${o.label} retire son offre : « Vous êtes trop gourmand${ge(L,'','e')}. » La porte claque.`)}
    say(L,'Le label campe sur sa position.');negotiate(L);return '';
  };
  const ch=[{t:'Accepter et signer',pri:1,fn:()=>signContract(L)}];
  if(!last){ch.push({t:'Demander une avance plus élevée',fn:()=>ask('adv')},{t:'Demander plus de royalties',fn:()=>ask('roy')},{t:'Demander moins d’albums',fn:()=>ask('alb')},{t:'Tout demander d’un coup (risqué)',danger:1,fn:()=>ask('all')})}
  ch.push({t:'Refuser',danger:1,fn:()=>{m.offer=null;return out(L,`Tu déclines l’offre de ${o.label}. Ton manager a des sueurs froides.`)}});
  modal({title:`Contrat · ${o.label}`,icon:'✍️',html:`<p>Le directeur artistique pose le contrat sur la table.</p><p><b>Avance :</b> ${esc(fmt(o.adv))}<br><b>Royalties :</b> ${o.roy} % des ventes (après remboursement de l’avance)<br><b>Engagement :</b> ${o.albums} album${o.albums>1?'s':''}</p>${last?'<p><i>Le directeur regarde sa montre : c’est leur dernière offre.</i></p>':''}`,choices:ch});
  return '';
}

/* ============================ MUSICIEN : album ============================ */
function startAlbum(L){
  const t=trendOf();
  modal({title:'Nouvel album',icon:'💿',text:'Quel genre pour ce disque ?'+(t?` Le public raffole de ${t.toLowerCase()} cette année.`:''),choices:MUSIC_GENRES.map(g=>({t:g+(g===t?' · à la mode':'')+(g===ms(L).genre?' · ton style':''),fn:()=>pickProd(L,g)}))});
}
function pickProd(L,g){
  const m=ms(L),c=m.contract;
  const list=PRODS.map((p,i)=>({p,i})).filter(({p,i})=>c?i<=Math.min(3,(c.tier||0)+1):(L.money>=p.cost||i===0));
  modal({title:'Producteur',icon:'🎚️',text:c?'Le label avance les frais de studio, mais ils seront déduits de tes royalties.':'Tu paies le studio de ta poche.',choices:list.map(({p,i})=>({t:`${p.n} · ${fmt(p.cost)}`,fn:()=>{
    modal({title:'Nombre de titres',icon:'🎼',text:`${p.d} Combien de titres ?`,choices:[[6,'EP de 6 titres : court et nerveux'],[10,'Album de 10 titres : le format classique'],[14,'Double face de 14 titres : généreux, mais fatigant']].map(([n,t])=>({t,fn:()=>recordAlbum(L,g,i,n)}))});
  }}))});
}
function recordAlbum(L,g,pi,tracks){
  const m=ms(L),P=PRODS[pi],c=m.contract;
  if(!c){if(L.money<P.cost)return out(L,'Tu n’as plus de quoi payer ce studio : le projet est repoussé.');spend(L,P.cost)}
  else c.unrec=(c.unrec||0)+P.cost;
  const trend=trendOf()===g;
  const q=lim(Math.round(mus(L)*.28+P.q*.24+L.fame*.12+L.st.smarts*.04+bandBonus(L)+(g===m.genre?3:0)+(tracks===14?3:tracks===6?-3:0)+R(-12,18)-m.fatigue*.15+(L.talent==='musique'?4:0)),5,100);
  const reach=c?[260e3,520e3,950e3,1.7e6][Math.min(3,c.tier||0)]:130e3;
  const sales=Math.max(200,Math.round(Math.pow(q/100,2.3)*reach*(.45+L.fame/100)*gMult(g)*(trend?1.2:1)*(1+Math.min(.3,m.buzz/200))));
  const hits=Math.min(Math.floor(tracks/4),R(0,1)+(q>=60?1:0)+(q>=80?1:0));
  const cash=royalty(L,sales);earn(L,cash);
  const cert=certOf(sales);const t=albumTitle();
  m.albums.push({t,g,age:L.age,q,s0:sales,sales,cert,tracks,prod:P.n,label:!!c});
  if(m.albums.length>14)m.albums.shift();
  m.hits+=hits;m.cert=Math.max(m.cert,cert);m.idle=0;m.actY++;m.fatigue=lim(m.fatigue+(tracks>10?18:12),0,100);m.buzz=lim(m.buzz+(q-45)/2,0,100);m.genre=g;
  if(L.job){L.job.genre=g;L.job.works=(L.job.works||0)+1}
  const fg=Math.max(1,Math.round((Math.round(q/14)+hits*2+cert*2)*(1-L.fame/130)));
  chg(L,{fame:fg,happy:q>=55?8:2});track(L,'albums');trackMax(L,'bestSales',sales);if(hits)track(L,'hits',hits);
  if(cert)track(L,['goldAlbum','platinumAlbum','diamondAlbum'][cert-1]);
  let tx=`💿 « ${t} » (${g.toLowerCase()}, ${tracks} titres, produit par ${P.n.toLowerCase()}) : ${fmtn(sales)} exemplaires vendus.`;
  if(cert)tx+=` ${cap(CERTN[cert])} !`;
  if(hits)tx+=` ${hits} tube${hits>1?'s':''} passe${hits>1?'nt':''} en radio.`;
  tx+=cash>0?` Tu touches ${fmt(cash)}.`:(c&&c.unrec>0?' Pas de royalties : l’avance n’est pas encore remboursée.':'');
  if(c){c.left--;c.idle=0;if(c.left<=0){m.contract=null;tx+=` Ton contrat avec ${c.label} arrive à son terme : tu es libre.`}}
  out(L,tx);checkPromo(L);return tx;
}

/* ============================ MUSICIEN : tournée ============================ */
function startTour(L,V){
  modal({title:V.n,icon:V.ic,text:'Il faut composer la setlist en trois temps. Le public a de la mémoire, et les mauvaises idées aussi.',choices:[{t:'Composer la setlist',pri:1,fn:()=>seg(L,V,0,[])}]});
}
function seg(L,V,i,picks){
  const m=ms(L),la=lastAlbum(m);const o=[];
  if(m.hits>0)o.push(['tubes',`Tes tubes (${m.hits} au compteur)`]);
  if(la)o.push(['new',`Les nouveautés de « ${la.t} »`]);
  o.push(['cover','Des reprises que tout le monde connaît']);
  modal({title:`${V.n} · ${SEGN[i]}`,icon:'🎼',text:['Comment ouvres-tu le concert ?','Que joues-tu au milieu du concert ?','Et pour le rappel ?'][i],choices:o.map(([k,t])=>({t,fn:()=>{const p=picks.concat(k);if(i<2)seg(L,V,i+1,p);else concert(L,V,p)}}))});
}
function concert(L,V,picks){
  const m=ms(L),la=lastAlbum(m);let s=0;const cnt={};
  for(const k of picks){cnt[k]=(cnt[k]||0)+1;s+=k==='tubes'?70+Math.min(20,m.hits*3)+R(-5,5):k==='new'?(la?la.q*.9:50)+R(-15,15):58+R(-6,6)}
  s/=3;const variety=Object.keys(cnt).length;s+=variety===3?8:variety===1?-6:0;if((cnt.cover||0)>=2)s-=6;
  const rating=lim(Math.round(s*.6+mus(L)*.2+10+bandBonus(L)*.8-m.fatigue*.15-Math.max(0,V.fame-L.fame)*.5+(L.fame>V.fame+20?3:0)+R(-6,6)),5,100);
  const fill=lim(.3+rating/150+L.fame/400,.12,1);
  const cash=Math.round(V.cap*V.dates*V.tk*fill*V.share*shareOf(L));
  earn(L,cash);
  const fg=Math.round(V.fg*rating/70*(1-L.fame/140));
  chg(L,{fame:fg,happy:rating>=70?8:rating<40?-5:3,health:V.fat>=22?-R(1,3):0});
  m.fatigue=lim(m.fatigue+V.fat,0,100);m.buzz=lim(m.buzz+(rating-50)/2,0,100);m.actY++;
  if(V.k==='bar'||V.k==='salle')m.gigs++;else m.tours++;
  if(V.k==='stade'&&rating>=55)m.stade++;
  track(L,'tours');trackMax(L,'bestRating',rating);if(V.k==='olympia'&&rating>=60)track(L,'olympia');
  const verdict=rating>=85?pick(['Standing ovation et rappel à rallonge : la salle chante par cœur.','Les briquets s’allument, les téléphones aussi. Soirée mythique.']):rating>=65?pick(['Le public est conquis, la presse aussi.','Belle soirée : tu transpires, ils applaudissent.']):rating>=40?pick(['Concert correct, quelques bâillements au fond.','Ça fait le job, sans faire de miracle.']):pick(['La salle se vide pendant le rappel. Aïe.','Tu oublies deux fois les paroles. Le public, lui, n’oublie pas.']);
  const tx=`${V.ic} ${V.n} : note du public ${rating}/100, salle remplie à ${Math.round(fill*100)} %. ${verdict} Recette : ${fmt(cash)}.`;
  checkPromo(L);return out(L,tx);
}

/* ============================ MUSICIEN : panneaux ============================ */
function certLine(a){return a.cert?` · ${CERTN[a.cert]}`:''}
function pMusPractice(){
  const L=cur();const rows=LESSONS.filter(l=>l.t==='musique').map(Ls=>act(L,{ic:'🎸',t:`${Ls.n} · ${lim(Math.round(L.skills[Ls.k]||0),0,100)} %`,s:gearBonus(L,Ls.k)?'Ton instrument t’aide à progresser plus vite':'Une longue séance de travail. Un instrument à toi accélère les progrès',min:Ls.min,key:'mu_p_'+Ls.k,fn:L=>{
    const g=Math.max(2,R(3,8)+(L.talent==='musique'?2:0)+Math.round((L.hid.discipline-50)/20)+gearBonus(L,Ls.k));L.skills[Ls.k]=clamp((L.skills[Ls.k]||0)+g);chg(L,{happy:1});
    return out(L,pick([`Tu travailles ${Ls.n.toLowerCase()} jusqu’à ce que les voisins tapent au plafond.`,`Séance de ${Ls.n.toLowerCase()} : un passage difficile cède enfin.`,`Tu enchaînes les gammes et les ${Ls.n.toLowerCase()}, métronome à fond.`])+` (+${g})`)}}));
  const m=ms(L);
  rows.push(act(L,{ic:'🚇',t:'Jouer dans la rue ou le métro',s:'Quelques pièces, un peu de notoriété',key:'mu_busk',fn:L=>{
    const g=R(20,150);earn(L,g,1);m.busk++;chg(L,{fame:chance(.4)?1:0,happy:2});m.actY++;
    return out(L,pick([`Sur le quai de la ligne 4, une dame t’applaudit. Recette : ${fmt(g)}.`,`Un policier municipal te demande ton autorisation. Heureusement, tu en as une : ${fmt(g)} de recette.`,`Un enfant t’offre son goûter, les autres des pièces : ${fmt(g)}.`])+' ')}}));
  return {title:'Pratique musicale',html:note('Plus tu t’entraînes, plus tes albums et tes concerts s’en ressentent. Niveau global : '+mus(L)+' %.')+group('Instruments',rows)};
}
function pMusBand(){
  const L=cur(),m=ms(L),b=m.band;
  if(!b)return {title:'Groupe',html:note('Tu joues en solo : tout l’argent est pour toi, mais tu ne peux compter que sur toi-même. Un groupe améliore la qualité de tes disques et de tes concerts, mais partage les recettes.')+group('',[act(L,{ic:'🎸',t:'Fonder un groupe',s:'Duo, trio, quatuor ou quintette',fn:L=>{
    modal({title:'Fonder un groupe',icon:'🎸',text:'Combien de complices recrutes-tu ?',choices:[[1,'Un duo (1 musicien)'],[2,'Un trio (2 musiciens)'],[3,'Un quatuor (3 musiciens)'],[4,'Un quintette (4 musiciens)']].map(([n,t])=>({t,fn:()=>{
      const names=shuffle(BAND_NAMES.slice()).slice(0,3);
      modal({title:'Nom du groupe',icon:'🎸',text:'Il faut un nom qui claque sur une affiche.',choices:names.map(nm=>({t:nm,fn:()=>makeBand(L,n,nm)}))});}}))});return ''}})])};
  const rows=b.members.map((p,i)=>act(L,{ic:'🎶',t:`${p.n} · ${roleOf(p)}`,s:`Niveau ${p.skill} % · tension ${p.ten} %`,key:'mu_talk_'+p.id,fn:L=>{
    p.ten=lim(p.ten-R(10,22),0,100);p.rel=lim(p.rel+R(2,6),0,100);return out(L,pick([`Tu paies un café à ${p.n} et vous parlez franchement. L’ambiance s’apaise.`,`${p.n} te confie ses doutes. Vous finissez par rire.`,`Une longue discussion avec ${p.n} : les tensions retombent.`]))}}));
  const acts=[
    act(L,{ic:'🥁',t:'Répétition collective',s:'Le groupe progresse, ça frotte un peu',key:'mu_rehearse',fn:L=>{b.members.forEach(p=>{p.skill=lim(p.skill+R(2,5),0,100);p.ten=lim(p.ten+R(0,6),0,100)});const g=R(2,5);const Ls=LESSONS.filter(l=>l.t==='musique').sort((x,y)=>(L.skills[y.k]||0)-(L.skills[x.k]||0))[0];if(Ls)L.skills[Ls.k]=clamp((L.skills[Ls.k]||0)+g);return out(L,`Une semaine de répétition au local. ${b.name} sonne enfin comme un vrai groupe.`)}}),
    act(L,{ic:'🏕️',t:'Week-end de cohésion',s:'1 500 € · les tensions baissent pour de bon',cost:1500,key:'mu_week',fn:L=>{b.members.forEach(p=>{p.ten=lim(p.ten-R(15,30),0,100)});m.quarrel=null;chg(L,{happy:4});return out(L,'Gîte en Ardèche, barbecue, karaoké. Tout le monde se réconcilie, du moins jusqu’à dimanche soir.')}}),
    b.members.length<4?act(L,{ic:'➕',t:'Recruter un musicien',s:'Un nouveau talent, une nouvelle personnalité',key:'mu_recruit',fn:L=>{const free=[0,1,2,3,4].filter(r=>!b.members.some(p=>p.role===r));const r=free.length?pick(free):R(0,4);const g=chance(.5)?'H':'F';const p={id:nid(),n:rname(g,L.country),g,role:r,skill:R(40,80),rel:R(60,90),ten:R(0,15)};b.members.push(p);return out(L,`${p.n} rejoint ${b.name} comme ${roleOf(p).toLowerCase()}.`)}}):'',
    act(L,{ic:'🚪',t:'Mettre quelqu’un à la porte',s:'Remercier un membre du groupe',fn:L=>{
      modal({title:'Qui doit partir ?',icon:'🚪',text:'Ce n’est jamais une décision facile.',choices:b.members.map(p=>({t:`${p.n} · ${roleOf(p)}`,danger:1,fn:()=>{b.members=b.members.filter(x=>x.id!==p.id);chg(L,{happy:-4,karma:-2});if(!b.members.length)return splitBand(L,'faute de membres');return out(L,`${p.n} quitte le groupe en claquant la porte du local.`)}})).concat([{t:'Finalement non'}])});return ''}}),
    act(L,{ic:'💔',t:'Dissoudre le groupe',s:'Reprendre une carrière solo',danger:1,fn:L=>splitBand(L,'sur ta décision')})];
  return {title:b.name,html:card('Groupe',b.name,`${b.members.length+1} musiciens avec toi · fondé à ${b.since||L.age} ans`,'')+note(`Ta part des recettes : ${Math.round(shareOf(L)*100)} %. Bonus de qualité : ${bandBonus(L)}.`)+group('Membres',rows)+group('Vie du groupe',acts)};
}
function pMusLabel(){
  const L=cur(),m=ms(L),c=m.contract,o=m.offer,rows=[];let h='';
  if(c){h+=card('Contrat',c.label,`${c.roy} % de royalties · ${c.left} album${c.left>1?'s':''} restant${c.left>1?'s':''}`,`<div class="cs">Avance restant à rembourser : ${esc(fmt(Math.max(0,c.unrec||0)))}</div>`);
    rows.push(act(L,{ic:'📜',t:'Rompre le contrat',s:`Pénalité : ${fmt((c.adv||0)*.4)}`,danger:1,fn:L=>{const pen=Math.round((c.adv||0)*.4);modal({title:'Rompre le contrat',icon:'📜',text:`${c.label} réclame ${fmt(pen)} de dédommagement. Tu confirmes ?`,choices:[{t:'Rompre et payer',danger:1,fn:()=>{spend(L,pen);m.contract=null;chg(L,{fame:-4,happy:-4});return out(L,`Tu quittes ${c.label} en claquant la porte. Tes avocats s’occupent du reste.`)}},{t:'Garder le contrat'}]});return ''}}))}
  else h+=note('Pas de maison de disques : tu es en indépendant. Tu gardes une meilleure part par disque vendu, mais tu en vends moins et tu paies tes studios.');
  if(o)rows.push(act(L,{ic:'✍️',t:`Offre de ${o.label}`,s:`${fmt(o.adv)} d’avance · ${o.roy} % · ${o.albums} album${o.albums>1?'s':''}`,fn:L=>{negotiate(L);return ''}}));
  if(!c&&!o){const need=LABELS[0].fame;
    rows.push(act(L,{ic:'📞',t:'Démarcher les maisons de disques',s:L.fame<need?`Notoriété ${need} % requise`:'Envoyer ta maquette et ton dossier de presse',key:'mu_demarche',dis:!isJ(L,'musique')?'Réservé aux musiciens':L.fame<need?`Notoriété ${need} % minimum (tu as ${L.fame} %)`:(L.job.lvl<1?'Il faut d’abord être artiste indépendant':''),fn:L=>{
      const p=lim(.3+mus(L)/200+L.fame/200+(albumsN(L)?.1:0),.1,.85);
      if(!chance(p))return out(L,'Les maisons de disques ne répondent pas, ou presque. Un stagiaire t’écrit « super, à suivre ».');
      m.offer=mkOffer(L);say(L,`📨 ${m.offer.label} s’intéresse à toi.`);negotiate(L);return ''}}))}
  return {title:'Maison de disques',html:h+group('',rows)};
}
function pMusStudio(){
  const L=cur(),m=ms(L);const t=trendOf();
  const rows=[
    act(L,{ic:'💿',t:'Enregistrer un album',s:'Genre, producteur, nombre de titres',key:'mu_album',fn:L=>{startAlbum(L);return ''}}),
    act(L,{ic:'🎼',t:'Composer un single',s:'Un tube se cache peut-être dans ton carnet',key:'mu_single',fn:L=>{
      m.actY++;if(chance(.15+mus(L)/400+(m.buzz/500))){m.hits++;chg(L,{fame:R(3,8),happy:8});m.buzz=lim(m.buzz+15,0,100);return out(L,pick(['🔥 Ton single devient le tube de l’été : on le fredonne même à la boulangerie.','🔥 Ton single passe en boucle sur toutes les radios.']))}
      chg(L,{fame:1});return out(L,pick(['Ton single passe inaperçu. Même ta mère n’a pas liké.','Le single plaît à tes amis, c’est déjà ça.']))}}),
    act(L,{ic:'🛋️',t:'Prendre des vacances',s:'3 000 € · la fatigue baisse',cost:3000,key:'mu_rest',fn:L=>{m.fatigue=lim(m.fatigue-40,0,100);chg(L,{happy:6,health:2});return out(L,'Deux semaines sans micro, sans manager, sans mail. Tu rentres bronzé.')}}),
    act(L,{ic:'🎭',t:'Changer de style musical',s:`Actuellement : ${m.genre}`,key:'mu_genre',fn:L=>{modal({title:'Virage artistique',icon:'🎭',text:'Quel style adoptes-tu désormais ?',choices:MUSIC_GENRES.map(g=>({t:g,fn:()=>{m.genre=g;if(L.job)L.job.genre=g;chg(L,{fame:chance(.3)?-2:0,happy:2});return out(L,`Tu tournes la page : désormais, c’est du ${g.toLowerCase()}.`)}}))});return ''}})];
  const al=m.albums.slice().reverse().map(a=>row({ic:'💿',t:`« ${a.t} » · ${a.g}`,s:`${An(L.age-a.age)||'cette année'} · ${fmtn(a.sales)} exemplaires · note ${a.q}${certLine(a)}`}));
  return {title:'Studio',html:note(t?`Le genre à la mode cette année : ${t}.`:'Les modes passent, le talent reste (parfois).')+statLine('Fatigue',m.fatigue)+group('Création',rows)+(al.length?group('Discographie',al):note('Pas encore d’album sorti.'))};
}
function pMusTour(){
  const L=cur(),m=ms(L),c=m.contract;
  const rows=VENUES.map(V=>{const cost=Math.round(V.cost*(c?.5:1));
    return act(L,{ic:V.ic,t:V.n,s:`${V.d} · cap. ${fmtn(V.cap)}${cost?' · frais '+fmt(cost):''}`,cost,key:'mu_tour',dis:L.fame<V.fame?`Notoriété ${V.fame} % requise`:(m.fatigue>=90?'Tu es épuisé : repose-toi d’abord':''),fn:L=>{startTour(L,V);return ''}})});
  return {title:'Tournée',html:note('Une seule tournée par an. Choisis la salle à la hauteur de ta notoriété, puis compose ta setlist.')+statLine('Fatigue',m.fatigue)+statLine('Buzz auprès du public',m.buzz)+group('Salles',rows)+note(`Tubes : ${m.hits} · tournées : ${m.tours} · concerts : ${m.gigs}`)};
}
function panelMusic(L){
  const m=ms(L);
  const sal=baseRoy(L);
  return statLine('Niveau musical',mus(L))+statLine('Fatigue',m.fatigue)+note(`${m.genre}${m.band?' · '+m.band.name:' · en solo'}${m.contract?' · '+m.contract.label:''} · ${albumsN(L)} album${albumsN(L)>1?'s':''} · ${m.vic} Victoire${m.vic>1?'s':''} de la musique`)+group('Musicien',[
    nav('🎸','Pratique musicale','Instruments, rue et métro',pMusPractice),
    nav('🎙️','Studio et albums','Genre, producteur, ventes',pMusStudio),
    nav('🎤','Tournée et setlist','Du bar au Stade de France',pMusTour),
    nav('✍️','Maison de disques',m.contract?m.contract.label:m.offer?'Une offre t’attend':'Démarcher, négocier un contrat',pMusLabel),
    nav('👥',m.band?m.band.name:'Groupe',m.band?`${m.band.members.length} membres · tensions à surveiller`:'Solo ou en groupe ?',pMusBand)])+(sal?note(`Droits d’auteur et streaming : environ ${fmt(sal)} par an.`):'');
}
function yearMusic(L){
  const j=L.job;if(!isJ(L,'musique'))return;const m=ms(L);
  j.perf=clamp((j.perf||50)+R(-5,5)+(m.buzz-50)/25);
  if(m.fatigue>=75){chg(L,{health:-3,happy:-4});say(L,'😮‍💨 Les tournées, les studios, les plateaux : ton corps te fait payer l’addition.')}
  m.fatigue=lim(m.fatigue-20,0,100);
  const active=m.actY>0;m.actY=0;m.buzz=Math.round(m.buzz*.75);
  if(!active&&j.lvl>=1){chg(L,{fame:-2});if(j.lvl>=2)say(L,'Une année sans actualité : on commence à t’oublier.')}
  // ventes en traîne
  let tail=0,cash=0;
  for(const a of m.albums){const y=L.age-a.age;if(y>=1&&y<=3){const n=Math.round(a.s0*[.35,.15,.06][y-1]);if(n>0){a.sales+=n;tail+=n;const old=a.cert;a.cert=certOf(a.sales);if(a.cert>old){m.cert=Math.max(m.cert,a.cert);track(L,['goldAlbum','platinumAlbum','diamondAlbum'][a.cert-1]);chg(L,{fame:a.cert*2,happy:6});say(L,`🏅 « ${a.t} » passe ${CERTN[a.cert]} grâce aux ventes de l’année !`)}}}}
  if(tail>0){cash=royalty(L,tail);if(cash>0){earn(L,cash);say(L,`📀 Les ventes de ta discographie rapportent ${fmt(cash)} cette année.`)}}
  const roy=baseRoy(L);if(roy>0)earn(L,roy);
  // contrat
  const c=m.contract;if(c){c.idle=(c.idle||0)+1;if(c.idle>=3){m.contract=null;chg(L,{fame:-3,happy:-6});say(L,`📉 ${c.label} met fin à ton contrat : trois ans sans album, ça ne pardonne pas.`)}}
  if(m.offer&&m.offer.exp<L.age){say(L,`L’offre de ${m.offer.label} est restée sans réponse et a expiré.`);m.offer=null}
  // groupe
  if(m.band){let left=null;for(const p of m.band.members){p.ten=lim(p.ten+R(-4,9)+(L.fame>60?2:0),0,100);if(p.ten>=100&&!left)left=p}
    if(left){m.band.members=m.band.members.filter(x=>x.id!==left.id);say(L,`${left.n} quitte le groupe, à bout de nerfs.`);if(!m.band.members.length)splitBand(L,'faute de membres')}
    else if(m.band.members.some(p=>p.ten>=85)&&!m.quarrel)m.quarrel=m.band.members.find(p=>p.ten>=85).id}
  // Victoires de la musique
  const la=lastAlbum(m);
  if(j.lvl>=1&&la&&L.age-la.age<=2&&!m.cer&&chance(.12+(la.q-50)/250+L.fame/500)){
    m.cer={cat:pick(['Album de l’année','Chanson originale de l’année','Révélation de l’année',ge(L,'Artiste masculin de l’année','Artiste féminine de l’année'),'Concert de l’année'])};
  }
  checkPromo(L);
}
function eventsMusic(L){
  if(!isJ(L,'musique'))return 0;const m=ms(L),j=L.job;let n=0;
  if(m.cer){const cer=m.cer;m.cer=null;n++;
    modal({title:'Victoires de la musique',icon:'🏆',text:`Tu es ${ge(L,'nommé','nommée')} dans la catégorie « ${cer.cat} ». Le public est en smoking, les caméras tournent. Quelle attitude adoptes-tu ?`,choices:[
      {t:'Sobre et élégant',fn:()=>cerem(L,cer,.05)},{t:'Tenue extravagante qui fera le tour d’internet',fn:()=>cerem(L,cer,chance(.5)?.12:-.04)},{t:'Discours préparé depuis trois semaines',fn:()=>cerem(L,cer,.09)}]})}
  if(m.quarrel){const mb=bandMember(m,m.quarrel);m.quarrel=null;
    if(mb){n++;modal({title:'Ça tourne mal',icon:'💢',text:`${mb.n}, ${roleOf(mb).toLowerCase()} de ${m.band.name}, a claqué la porte du local après une dispute sur la setlist. Que fais-tu ?`,choices:[
      {t:'Jouer les médiateurs autour d’un resto',fn:()=>{if(L.money<200)return out(L,'Tu n’as pas de quoi payer le resto : la réconciliation tourne court.');spend(L,200);mb.ten=lim(mb.ten-35,0,100);mb.rel=lim(mb.rel+5,0,100);return out(L,`Un couscous plus tard, ${mb.n} et toi tombez dans les bras l’un de l’autre.`)}},
      {t:'Mettre les pieds dans le plat',fn:()=>{if(chance(.5+L.st.smarts/300)){mb.ten=lim(mb.ten-30,0,100);return out(L,`Ton franc-parler porte ses fruits : ${mb.n} revient, penaud.`)}return splitBand(L,`après un échange de mots que tout le monde regrette`)}},
      {t:'Laisser pourrir',danger:1,fn:()=>{if(chance(.6))return splitBand(L,`quand ${mb.n} claque la porte pour de bon`);mb.ten=lim(mb.ten-15,0,100);return out(L,'Tout le monde se calme tout seul. Pour cette fois.')}}]})}}
  if(m.fatigue>=85&&chance(.5)){n++;modal({title:'Épuisement',icon:'🥀',text:'Tu t’effondres dans les coulisses. Le médecin est formel : tu dois ralentir.',choices:[
    {t:'Prendre un mois de repos complet',pri:1,fn:()=>{m.fatigue=lim(m.fatigue-45,0,100);chg(L,{health:3,happy:2});return out(L,'Un mois chez ta grand-mère, à manger des crêpes. Tu reviens en forme.')}},
    {t:'Continuer coûte que coûte',danger:1,fn:()=>{chg(L,{health:-R(6,12),happy:-6});m.fatigue=lim(m.fatigue-10,0,100);return out(L,'Tu serres les dents. Ton corps proteste et ton manager aussi.')}}]})}
  if(!m.contract&&!m.offer&&j.lvl>=1&&L.fame>=LABELS[0].fame&&chance(.12)){n++;m.offer=mkOffer(L);
    modal({title:'Un talent scout',icon:'📨',text:`Un directeur artistique de ${m.offer.label} t’a vu sur scène et t’invite à déjeuner.`,choices:[{t:'Y aller et écouter l’offre',pri:1,fn:()=>{negotiate(L);return ''}},{t:'Décliner poliment',fn:()=>{m.offer=null;return out(L,'Tu préfères rester indépendant pour le moment.')}}]})}
  return n;
}
const bandMember=(m,id)=>m.band&&m.band.members.find(p=>p.id===id);
function cerem(L,cer,bonus){
  const m=ms(L),la=lastAlbum(m);
  const p=lim(.22+bonus+((la?la.q:50)-50)/200+L.fame/400,.05,.8);
  if(chance(p)){m.vic++;track(L,'victoires');chg(L,{fame:8,happy:14});return out(L,`🏆 Victoire de la musique : « ${cer.cat} » ! Tu brandis la statuette et tu oublies ton discours.`)}
  chg(L,{fame:2,happy:-2});return out(L,`La statuette de « ${cer.cat} » va à quelqu’un d’autre. Tu applaudis avec ton plus beau sourire.`);
}

/* ============================ MANNEQUIN : données ============================ */
const AGENCIES=[
 {n:'Agence Petite Annonce',tier:0,looks:55,shape:40,fame:0,lvl:0,mult:.8,cut:.2,d:'Beaucoup de castings, peu de glamour.'},
 {n:'Agence Faubourg Mode',tier:1,looks:66,shape:52,fame:5,lvl:0,mult:1,cut:.2,d:'Catalogues, e-commerce et publicités.'},
 {n:'Maison Muse Paris',tier:2,looks:76,shape:62,fame:20,lvl:1,mult:1.35,cut:.18,d:'Éditoriaux et défilés de créateurs.'},
 {n:'Étoile Absolue Models',tier:3,looks:84,shape:72,fame:40,lvl:2,mult:1.8,cut:.15,d:'L’élite des podiums, un carnet d’adresses en or.'}];
const MPAY=[15000,38000,110000,300000];
const FWS=[
 {k:'paris',n:'Paris',ic:'🗼',lvl:1,looks:70,shape:58,fame:8,pay:[9000,30000]},
 {k:'milan',n:'Milan',ic:'🍝',lvl:2,looks:75,shape:64,fame:22,pay:[14000,45000]},
 {k:'ny',n:'New York',ic:'🗽',lvl:2,looks:79,shape:68,fame:35,pay:[20000,70000]}];
const MAISONS=[
 {n:'Maison Valmont',ic:'👜',mult:1,fame:15},{n:'Parfums Ombelle',ic:'🧴',mult:1.1,fame:25},{n:'Joaillerie Saint-Honoré',ic:'💎',mult:1.3,fame:35},
 {n:'Atelier Delacroix',ic:'🧥',mult:1.6,fame:45},{n:'Maison Trianon',ic:'👑',mult:2,fame:60}];
const SHOOTS=[
 {t:'Éditorial sur les quais de Seine',intro:'Le photographe veut du naturel, avec Notre-Dame en fond et la lumière dorée de fin d’après-midi.',n:N('Il te demande de proposer un parti pris.',[
   ['Du naturel : marcher en riant, comme si personne ne te photographiait',8,'Le déclencheur crépite, il adore.',N('Un bateau-mouche passe et les touristes te repèrent.',[
      ['Leur faire un grand signe',-3,'Les touristes applaudissent, le photographe soupire.'],
      ['Ignorer le bateau et rester dans la lumière',9,'Magnifique : le contre-jour dore tes épaules.',N('Le photographe te glisse une écharpe rouge.',[['La nouer avec nonchalance',8,'Cliché de couverture assuré.'],['La tenir comme un trophée',2,'Un peu raide, mais efficace.']])],
      ['Te cacher derrière ton écharpe',3,'Mystérieux, ça marche à moitié.']])],
   ['Du dramatique : regard noir, cheveux dans le vent',2,'Ça pose son homme.',N('Le vent se lève vraiment.',[['Laisser faire le vent',9,'La photo de l’année, sans effort.'],['Retenir tes cheveux',-4,'Tu as l’air de lutter contre un séchoir.']])],
   ['Du décalé : poser avec une baguette sous le bras',-2,'Un peu cliché, mais le sourire est franc.',N('Un boulanger te reconnaît au loin.',[['Lui faire signe, la baguette brandie',7,'La scène est irrésistible, le photographe ne s’arrête plus.'],['Rester concentré',1,'Tu restes pro, la photo est correcte.']])]])},
 {t:'Campagne de parfum en studio',intro:'Fond blanc, lumière crue, une équipe de douze personnes qui chuchote.',n:N('La directrice artistique veut « de la sensualité sans en avoir l’air ».',[
   ['Fermer les yeux et sourire à peine',7,'Elle hoche la tête, le visage illuminé.',N('Le flacon est posé sur ton épaule.',[['Tenir la pose sans bouger',8,'Une statue de marbre : impeccable.'],['Le rattraper en riant quand il glisse',-3,'Un cri dans le studio… mais le rire est adorable.']])],
   ['Fixer l’objectif sans cligner',3,'Intense. Un peu trop, peut-être.',N('Tes yeux commencent à piquer.',[['Cligner et assumer',2,'Tu rattrapes le coup avec un clin d’œil.'],['Tenir encore dix secondes',6,'Larme au coin de l’œil : la maquilleuse hurle de joie.']])],
   ['Demander à voir les épreuves entre deux prises',-5,'La directrice artistique lève un sourcil.']])},
 {t:'Lookbook dans une friche industrielle',intro:'Un jeune créateur, un hangar désaffecté et des palettes pour podium.',n:N('Le créateur t’explique son concept : « la rouille est la nouvelle soie ».',[
   ['Jouer le jeu à fond, démarche de robot',6,'Le créateur applaudit.',N('On te demande de grimper sur une palette.',[['Monter avec grâce, talons compris',7,'Tu domines le hangar. Le lookbook est sauvé.'],['Refuser, c’est dangereux',-2,'Prudent, mais il faudra une doublure.'],['Monter en trébuchant',-6,'Tu t’en tires avec un fou rire collectif.']])],
   ['Rester naturel et suggérer des ajustements',5,'Il note tout dans un carnet.'],
   ['Râler sur la température du hangar',-6,'L’assistant te prête une couverture, mais l’ambiance est glacée.']])},
 {t:'Maillots de bain en Corse… en février',intro:'Soleil timide, vent de nord-est et 9 degrés. Le client veut « l’été ».',n:N('Le photographe te sourit : « on commence dans la mer ».',[
   ['Y aller courageusement, sourire figé',9,'Le client est ému par ton professionnalisme.',N('Une vague plus grosse que les autres arrive.',[['Rire et te laisser éclabousser',8,'La photo « spontanée » fera l’affiche.'],['Hurler et fuir',-5,'Tu bats le record du monde de la course à pied dans l’eau.']])],
   ['Négocier un plaid chauffant entre chaque prise',2,'Compromis raisonnable.'],
   ['Prétendre que ton contrat ne prévoit pas la mer',-8,'Le photographe soupire et prend note.']])}];

/* ============================ MANNEQUIN : état ============================ */
function md(L){
  let d=L.model;if(!d||typeof d!=='object')d=L.model={};
  if(typeof d.shape!=='number'||isNaN(d.shape))d.shape=lim(Math.round((((L.st&&L.st.health)||60)+((L.hid&&L.hid.athletic)||40))/2),20,90);
  for(const [k,v] of [['satis',50],['neg',0],['eff',0],['shoots',0],['shootsY',0],['fwN',0],['camps',0],['wins',0]])if(typeof d[k]!=='number'||isNaN(d[k]))d[k]=v;
  if(!d.fw||typeof d.fw!=='object')d.fw={};if(!('amb' in d))d.amb=null;
  if(isJ(L,'mannequin')&&typeof L.job.ag!=='number')L.job.ag=0;
  return d;
}
const cond=L=>Math.round(L.st.looks*.6+md(L).shape*.4);
const agOf=L=>AGENCIES[(L.job&&L.job.ag)||0]||AGENCIES[0];
function mPay(L){
  const j=L.job;if(!j)return 0;const d=md(L),ag=agOf(L);
  return Math.round((MPAY[Math.min(j.lvl||0,3)]||15000)*ag.mult*(.4+cond(L)/100)*(.6+L.fame/120)*(d.neg>=2?.5:1)*(1-ag.cut));
}
function endCareer(L,why){
  const d=md(L);L.job=null;d.pendingEnd=1;d.amb=null;track(L,'modelCareerDone');
  say(L,why||'Les agences te proposent de moins en moins de contrats. Tu tires ta révérence, des souvenirs plein les valises.');
}
function missAgency(L,ag,j){
  const d=md(L);const m=[];
  if(L.st.looks<ag.looks)m.push(`apparence ${ag.looks} % min.`);
  if(d.shape<ag.shape)m.push(`forme ${ag.shape} % min.`);
  if(L.fame<ag.fame)m.push(`notoriété ${ag.fame} % min.`);
  if(j&&(j.lvl||0)<ag.lvl)m.push('niveau de carrière insuffisant');
  return m.join(', ');
}
function auditionAgency(L,i,apply){
  const ag=AGENCIES[i],d=md(L);
  modal({title:`Casting · ${ag.n}`,icon:'📸',text:`${ag.d} Le jury t’observe sans rien dire. Comment te présentes-tu ?`,choices:[
    {t:'Marche assurée, menton haut',fn:()=>aud(.05)},{t:'Sourire solaire et regard complice',fn:()=>aud(.03)},{t:'Regard de tueur, comme sur Instagram',fn:()=>aud(chance(.5)?.14:-.08)}]});
  function aud(b){
    const miss=(L.st.looks<ag.looks?(ag.looks-L.st.looks)/120:0)+(d.shape<ag.shape?(ag.shape-d.shape)/160:0);
    const p=lim(.4+b+(L.st.looks-ag.looks)/160+(d.shape-ag.shape)/200+skillOf(L,'mannequinat')/400+(L.talent==='mannequinat'?.08:0)-miss-ag.tier*.06,.04,.9);
    if(!chance(p)){chg(L,{happy:-4});return out(L,`📸 ${ag.n} ne te retient pas : « Ce n’est pas ce que nous cherchons en ce moment. » Ça pique.`)}
    if(apply){L.job={c:'mannequin',sp:1,lvl:0,perf:R(45,65),y:0,works:0,ag:i};L.retired=false;chg(L,{happy:10,fame:2});track(L,'modelCareer');return out(L,`📸 ${ag.n} te signe ! Te voilà ${title(L).toLowerCase()}.`)}
    L.job.ag=i;chg(L,{happy:8,fame:1});return out(L,`📸 Tu rejoins ${ag.n}. Ton ancien agent fait semblant de ne pas pleurer.`);
  }
}
function applyModel(L){
  const list=AGENCIES.map((a,i)=>({a,i})).filter(({a})=>a.lvl===0);
  modal({title:'Mannequin',icon:'📸',text:'Dans quelle agence passes-tu le casting ?',choices:list.map(({a,i})=>({t:`${a.n} · apparence ${a.looks} % min.`,fn:()=>auditionAgency(L,i,true)}))});
}

/* ---------- séances photo ---------- */
function startShoot(L){
  const d=md(L);d.shootsY++;const S=pick(SHOOTS);
  modal({title:S.t,icon:'📸',text:S.intro,choices:[{t:'Entrer en studio',pri:1,fn:()=>shootStep(L,S,S.n,50,0,'')}]});
}
function shootStep(L,S,node,sat,depth,pre){
  modal({title:S.t,icon:'📸',text:(pre?pre+' ':'')+node.q,choices:node.o.map(o=>({t:o[0],fn:()=>{
    const dl=Math.round(o[1]+R(-4,4)+(cond(L)-65)/10+skillOf(L,'mannequinat')/25);const ns=sat+dl;
    if(o[3]&&depth<2)shootStep(L,S,o[3],ns,depth+1,o[2]);else return shootEnd(L,S,ns,o[2]);
  }}))});
}
function shootEnd(L,S,sat0,last){
  const d=md(L),j=L.job;const sat=lim(Math.round(sat0),0,100);
  if(!j)return '';
  const base=[800,2500,6000,15000][Math.min(j.lvl||0,3)]*agOf(L).mult;
  const pay=Math.round(base*(.4+sat/80)*R(90,115)/100*(1-agOf(L).cut));
  earn(L,pay);d.satis=Math.round(d.satis*.7+sat*.3);d.shoots++;track(L,'shoots');j.works=(j.works||0)+1;
  let t;
  if(sat>=75){chg(L,{fame:R(2,4),happy:6});j.perf=clamp((j.perf||50)+4);t=`📸 « ${S.t} » : le photographe est ravi (${sat} % de satisfaction). ${last} Il te recommande à tout son carnet d’adresses. Cachet : ${fmt(pay)}.`}
  else if(sat>=45){chg(L,{fame:1,happy:2});t=`📸 « ${S.t} » : séance correcte (${sat} % de satisfaction). ${last} Cachet : ${fmt(pay)}.`}
  else{chg(L,{happy:-4});j.perf=clamp((j.perf||50)-4);t=`📸 « ${S.t} » : le photographe n’est pas convaincu (${sat} % de satisfaction). ${last} Il murmure ton nom à l’agence, pas pour t’en dire du bien. Cachet : ${fmt(pay)}.`}
  return out(L,t);
}

/* ---------- Fashion Week ---------- */
function missFW(L,F,j){const d=md(L);const m=[];
  if((j.lvl||0)<F.lvl)m.push('niveau de carrière insuffisant');
  if(L.st.looks<F.looks)m.push(`apparence ${F.looks} % min. (tu as ${L.st.looks} %)`);
  if(d.shape<F.shape)m.push(`forme ${F.shape} % min. (tu as ${d.shape} %)`);
  if(L.fame<F.fame)m.push(`notoriété ${F.fame} % min.`);
  return m.join(' · ');
}
function applyFW(L,F){
  const d=md(L),j=L.job;
  const p=lim(.45+(L.st.looks-F.looks)/120+(d.shape-F.shape)/160+(j.perf||50)/300+agOf(L).tier*.05,.1,.92);
  if(!chance(p)){chg(L,{happy:-5});return out(L,`${F.ic} Casting de la Fashion Week de ${F.n} : tu n’es pas ${ge(L,'retenu','retenue')}. Les directeurs de casting étaient trop pressés pour te regarder deux fois.`)}
  modal({title:`Fashion Week · ${F.n}`,icon:F.ic,text:'Tu es retenu pour la saison. Quel défilé veux-tu ouvrir ?',choices:[
    {t:'Une grande maison, défilé de clôture (exigeant)',fn:()=>walk(L,F,1,1.6)},
    {t:'Un créateur émergent, ambiance underground',fn:()=>walk(L,F,.6,.9)},
    {t:'Un show spectaculaire aux chaussures vertigineuses',fn:()=>walk(L,F,.85,1.25)}]});
  return '';
}
function walk(L,F,diff,mult){
  const d=md(L),j=L.job;if(!j)return '';
  const s=(d.shape+L.st.looks)/2+(L.hid.athletic||40)*.2+R(-20,20)+(L.talent==='mannequinat'?6:0);
  const need=48+diff*14;d.fw[F.k]=(d.fw[F.k]||0)+1;d.fwN++;track(L,'fashionWeeks');
  const pay0=R(F.pay[0],F.pay[1])*mult*(.7+(j.lvl||0)*.2);
  if(s>=need+12){const pay=Math.round(pay0);earn(L,pay);chg(L,{fame:R(4,8),happy:10});j.perf=clamp((j.perf||50)+7);
    return out(L,`${F.ic} Fashion Week de ${F.n} : ${pick(['les flashs crépitent, la rangée de front se lève','la rédactrice en chef du premier rang esquisse un sourire, ce qui équivaut à une standing ovation','ton passage fait le buzz sur tous les réseaux'])}. Cachet : ${fmt(pay)}.`)}
  if(s>=need){const pay=Math.round(pay0*.8);earn(L,pay);chg(L,{fame:R(2,4),happy:5});j.perf=clamp((j.perf||50)+3);
    return out(L,`${F.ic} Fashion Week de ${F.n} : un défilé propre, sans fausse note. Cachet : ${fmt(pay)}.`)}
  const pay=Math.round(pay0*.4);earn(L,pay);chg(L,{happy:-6,fame:R(0,1)});j.perf=clamp((j.perf||50)-5);
  return out(L,`${F.ic} Fashion Week de ${F.n} : ${pick(['tu trébuches sur la dernière marche, un silence de cathédrale s’abat','un talon cède au milieu du podium','ta démarche est jugée « sans conviction » par un critique influent'])}. Cachet réduit : ${fmt(pay)}.`);
}

/* ---------- Campagnes de luxe ---------- */
function applyCampaign(L,M){
  const d=md(L),j=L.job;if(!j)return '';
  const p=lim(.25+(L.st.looks-75)/100+(d.shape-65)/150+L.fame/250+(d.satis-50)/300-M.mult*.04,.04,.8);
  if(!chance(p)){chg(L,{happy:-5});return out(L,`${M.ic} ${M.n} choisit un autre visage pour sa campagne. « Vous êtes très bien, mais ce n’est pas l’image que nous voulons. »`)}
  const pay=Math.round(R(120,300)*1000*M.mult*(1-agOf(L).cut));earn(L,pay);d.camps++;track(L,'campaigns');chg(L,{fame:R(6,10),happy:12});j.perf=clamp((j.perf||50)+6);
  const t=`${M.ic} Tu deviens le visage de ${M.n} ! Cachet : ${fmt(pay)}. Ton portrait s’affiche dans tout Paris.`;
  out(L,t);
  if((j.lvl||0)>=3&&!d.amb){
    const fee=Math.round(pay*.35);
    modal({title:`Ambassadeur de ${M.n}`,icon:M.ic,text:`La maison te propose un contrat d’exclusivité de 2 ans : ${fmt(fee)} par an, mais tu ne pourras pas faire campagne pour la concurrence.`,choices:[
      {t:'Signer l’exclusivité',pri:1,fn:()=>{d.amb={n:M.n,fee,y:2};return out(L,`✍️ Tu signes l’exclusivité avec ${M.n} : ${fmt(fee)} par an pendant 2 ans.`)}},{t:'Rester libre',fn:()=>out(L,'Tu préfères garder ta liberté de choix.')}]});
  }
  return t;
}

/* ---------- panneaux mannequin ---------- */
function pModCare(){
  const L=cur(),d=md(L);const e=fn=>L2=>{d.eff++;return fn(L2)};
  const diet=[
    act(L,{ic:'🥗',t:'Alimentation équilibrée',s:'1 200 € · nutritionniste, forme +4',cost:1200,key:'mm_diet',fn:e(L=>{d.shape=lim(d.shape+4,0,100);chg(L,{health:1});return out(L,'Ton nutritionniste te réconcilie avec les féculents. Tu te sens bien.')})}),
    act(L,{ic:'🍋',t:'Régime strict',s:'Forme +8, mais santé et moral en pâtissent',key:'mm_diet',fn:e(L=>{d.shape=lim(d.shape+8,0,100);chg(L,{health:-2,happy:-4,discipline:2});if(chance(.15))chg(L,{health:-5});return out(L,'Salades, citron chaud, regard sombre devant les boulangeries. Les résultats sont là, pas la joie.')})}),
    act(L,{ic:'🥤',t:'Cure de jus verts',s:'Forme +5, un peu de patience',key:'mm_diet',fn:e(L=>{d.shape=lim(d.shape+5,0,100);chg(L,{happy:-2});return out(L,'Une semaine de jus verts. Tu rêves de crêpes, mais ton teint est radieux.')})}),
    act(L,{ic:'🍔',t:'Craquer pour un menu maxi',s:'Le plaisir avant la ligne',key:'mm_cheat',fn:L=>{d.shape=lim(d.shape-3,0,100);chg(L,{happy:5});return out(L,'Un burger, des frites, un milkshake. Ton agent n’en saura rien. Probablement.')}})];
  const sport=[
    act(L,{ic:'🧘',t:'Pilates et yoga',s:'900 € · forme +4, apparence +1',cost:900,key:'mm_pil',fn:e(L=>{d.shape=lim(d.shape+4,0,100);chg(L,{looks:1,stress:-3});return out(L,'Tu tiens la planche trente secondes, puis une minute, puis tu abandonnes. Mais tu progresses.')})}),
    act(L,{ic:'🏃',t:'Course à pied au bord de l’eau',s:'Gratuit · forme +5, santé +2',key:'mm_run',fn:e(L=>{d.shape=lim(d.shape+5,0,100);chg(L,{health:2,athletic:2});return out(L,'Le canal Saint-Martin à l’aube, un écouteur dans l’oreille. Tu croises trois autres mannequins.')})}),
    act(L,{ic:'🏋️',t:'Salle de sport avec coach',s:'2 400 € · forme +8, athlétisme +3',cost:2400,key:'mm_gym',fn:e(L=>{d.shape=lim(d.shape+8,0,100);chg(L,{athletic:3,health:1});return out(L,'Un coach au torse impressionnant te fait faire quatre-vingt-dix squats. Tu marches comme un robot trois jours.')})}),
    act(L,{ic:'😴',t:'Dormir huit heures par nuit',s:'Gratuit · repos, forme +1',key:'mm_sleep',fn:L=>{d.shape=lim(d.shape+1,0,100);chg(L,{stress:-4,happy:2});return out(L,'Huit heures de sommeil, l’arme secrète des cernes en voie de disparition.')}})];
  const beauty=[
    act(L,{ic:'🧖',t:'Soins de la peau',s:'1 500 € · apparence +2',cost:1500,key:'mm_skin',fn:e(L=>{chg(L,{looks:2,happy:2});return out(L,'Masques, sérum, gommage : tu ressors avec une peau de bébé.')})}),
    act(L,{ic:'💇',t:'Coiffeur-coloriste',s:'600 € · apparence +1',cost:600,key:'mm_hair',fn:L=>{chg(L,{looks:1,happy:3});return out(L,'Une coupe signée dans un salon du Marais. Le coiffeur parle de « ton énergie ».')}})];
  return {title:'Entretien',html:note('Apparence et forme physique conditionnent tes contrats. Sans effort pendant l’année, ton agence le remarque : elle te retire des castings.')+statLine('Apparence',L.st.looks)+statLine('Forme physique',d.shape)+note(`Efforts cette année : ${d.eff}. Il en faut au moins 2 pour tenir ta forme.`)+group('Alimentation',diet)+group('Sport',sport)+group('Beauté',beauty)};
}
function pModAgency(){
  const L=cur(),j=L.job||{},d=md(L);
  const rows=AGENCIES.map((a,i)=>{const cur2=j.ag===i,miss=missAgency(L,a,j);
    return act(L,{ic:'🏢',t:`${a.n}${cur2?' · ton agence':''}`,s:`${a.d} Commission ${Math.round(a.cut*100)} %, cachets ×${String(a.mult).replace('.',',')}${miss?' · '+miss:''}`,key:'mm_aud',dis:cur2?'Ton agence actuelle':(miss?cap(miss):''),fn:L=>{auditionAgency(L,i,false);return ''}})});
  return {title:'Agences',html:note('Une agence plus prestigieuse ouvre les plus gros contrats, mais elle exige apparence et forme. Un seul casting par an.')+card('Agence actuelle',agOf(L).n,`Commission ${Math.round(agOf(L).cut*100)} %`,'')+group('Passer un casting',rows)};
}
function pModFW(){
  const L=cur(),j=L.job||{lvl:0},d=md(L);
  const rows=FWS.map(F=>{const miss=missFW(L,F,j);
    return act(L,{ic:F.ic,t:`Fashion Week de ${F.n}`,s:`Niveau ${F.lvl}+ · apparence ${F.looks} % · forme ${F.shape} % · ${d.fw[F.k]||0} défilé${(d.fw[F.k]||0)>1?'s':''} à ton actif`,key:'mm_fw_'+F.k,dis:miss?cap(miss):'',fn:L=>applyFW(L,F)})});
  return {title:'Fashion Week',html:note('Les sélections ont lieu une fois par an et par ville. Les seuils s’appliquent à l’apparence et à la forme physique.')+statLine('Apparence',L.st.looks)+statLine('Forme physique',d.shape)+group('Les trois capitales',rows)};
}
function pModCamp(){
  const L=cur(),j=L.job||{lvl:0},d=md(L);
  const rows=MAISONS.map(M=>act(L,{ic:M.ic,t:M.n,s:`Casting pour une campagne · notoriété ${M.fame} % min.`,key:'mm_camp',dis:(j.lvl||0)<2?'Réservé aux mannequins de défilé':L.fame<M.fame?`Notoriété ${M.fame} % requise`:'',fn:L=>applyCampaign(L,M)}));
  return {title:'Campagnes de luxe',html:note('Un seul casting par an. Les maisons choisissent des visages affûtés : apparence, forme et réputation comptent.')+(d.amb?card('Exclusivité en cours',d.amb.n,`${fmt(d.amb.fee)} par an · ${An(d.amb.y)} restant${d.amb.y>1?'s':''}`,''):'')+group('Maisons',rows)};
}
function panelModel(L){
  const d=md(L);const j=L.job;
  return statLine('Apparence',L.st.looks)+statLine('Forme physique',d.shape)+statLine('Satisfaction des photographes',d.satis)+note(`${agOf(L).n} · ${d.shoots} séance${d.shoots>1?'s':''} · ${d.camps} campagne${d.camps>1?'s':''} · ${d.fwN} défilé${d.fwN>1?'s':''}`+(d.neg>=2?' · Tu perds des contrats : prends soin de toi !':''))+group('Mannequin',[
    act(L,{ic:'📸',t:'Séance photo',s:`${3-d.shootsY>0?3-d.shootsY:0} séance${3-d.shootsY>1?'s':''} possible${3-d.shootsY>1?'s':''} cette année`,dis:d.shootsY>=3?'Tes plannings sont complets':'',fn:L=>{startShoot(L);return ''}}),
    nav('💪','Entretien','Régime, sport et soins',pModCare),
    nav('🏢','Agences','Changer d’agence',pModAgency),
    nav('👠','Fashion Week','Paris, Milan, New York',pModFW),
    nav('💎','Campagnes de luxe','Visage d’une maison',pModCamp),
    j&&j.lvl>=1&&L.age>=30?act(L,{ic:'🌅',t:'Prendre ta retraite de mannequin',s:'Tirer ta révérence avant qu’on te la propose',danger:1,fn:L=>{endCareer(L,'Tu annonces ta retraite de mannequin lors d’un dîner avec ton agence. Les photographes en pleurent presque.');return ''}}):''
  ]);
}
function yearModel(L){
  const j=L.job;if(!isJ(L,'mannequin'))return;const d=md(L),ag=agOf(L);
  const eff=d.eff;d.eff=0;d.shootsY=0;
  d.shape=lim(d.shape-R(3,7)+eff*3-(L.st.health<50?3:0),0,100);
  const c=cond(L);
  j.perf=clamp((j.perf||50)+R(-5,5)+(c-65)/6+(d.satis-50)/14);
  if(eff<1||L.st.looks<48||d.shape<38)d.neg++;else d.neg=Math.max(0,d.neg-1);
  const pay=mPay(L);earn(L,pay);
  if(d.neg>=4){endCareer(L,`${ag.n} met fin à ton contrat : entre apparence et forme négligées, tu n’étais plus au niveau.`);return}
  if(d.neg>=2){chg(L,{happy:-4});j.perf=clamp(j.perf-6);say(L,'📉 Tu as négligé ton apparence et ta forme : ton agence te retire de plusieurs castings et tes revenus s’en ressentent.')}
  else if(eff>=3)say(L,'💪 Hygiène de vie irréprochable : ton agent est aux anges.');
  if(d.amb){earn(L,d.amb.fee);d.amb.y--;if(d.amb.y<=0){say(L,`Ton exclusivité avec ${d.amb.n} s’achève.`);d.amb=null}}
  const lvl=j.lvl||0;
  const need=[{f:6,p:55,t:0},{f:20,p:65,t:1},{f:45,p:72,t:2}][lvl];
  if(need&&L.fame>=need.f&&j.perf>=need.p&&ag.tier>=need.t&&(j.y||0)>=1&&chance(.65)){j.lvl++;chg(L,{happy:10,fame:3});j.perf=clamp(j.perf-8);say(L,`📈 Ta carrière s’envole : tu deviens ${title(L).toLowerCase()} !`);if(j.lvl>=3)track(L,'topCareer')}
  if(L.age>=35){const p=Math.min(1,(L.age-33)*.22);if(L.age>=40||chance(p))endCareer(L)}
}
function eventsModel(L){
  const d=L.model;if(!d||!d.pendingEnd)return 0;d.pendingEnd=0;
  modal({title:'Après les podiums',icon:'🌅',text:'Ta carrière de mannequin touche à sa fin. Qu’imagines-tu pour la suite ?',choices:[
    {t:'Devenir consultant mode et conseiller en image',pri:1,fn:()=>{earn(L,R(15000,40000));chg(L,{happy:4});return out(L,'Tu conseilles de jeunes mannequins et des marques. Le téléphone ne désemplit pas.')}},
    {t:'Ouvrir un institut de beauté (20 000 €)',fn:()=>{if(L.money<20000)return out(L,'Les fonds manquent : le projet reste dans un tiroir.');spend(L,20000);chg(L,{happy:6});track(L,'beautyShop');return out(L,'Ton institut ouvre ses portes à deux pas de l’avenue Montaigne. Les premiers clients sont d’anciens collègues.')}},
    {t:'Tourner la page et profiter de la vie',fn:()=>{chg(L,{happy:8,stress:-8});return out(L,'Plus de régime, plus de talons. Tu savoures enfin un vrai croissant.')}}]});
  return 1;
}

/* ============================ Évènements JSON : effets et conditions ============================ */
const effects={
  viral(L){
    if(isJ(L,'musique')){const m=ms(L);if(chance(.7)){m.buzz=lim(m.buzz+20,0,100);chg(L,{fame:R(3,8),happy:8});return 'Ta vidéo fait des millions de vues. Les messages de fans débordent de ta boîte.'}chg(L,{happy:-6,fame:-1});return 'Ta vidéo est reprise pour de mauvaises raisons. Les commentaires sont impitoyables.'}
    return '';},
  radio(L,a){
    if(!isJ(L,'musique'))return '';const m=ms(L);
    if(a&&a.ok){m.buzz=lim(m.buzz+10,0,100);chg(L,{fame:R(2,5),happy:5});return 'L’interview est drôle et sincère : on en reparle partout.'}
    chg(L,{happy:-3,fame:-1});return 'Tu bégaies devant le micro. Le chroniqueur s’en donne à cœur joie.';},
  pressure(L,a){
    if(!isJ(L,'mannequin'))return '';const d=md(L);
    if(a&&a.diet){d.shape=lim(d.shape+6,0,100);chg(L,{happy:-5,health:-1});return 'Tu te plies au régime de ton agent. Ça marche, pas le moral.'}
    d.satis=lim(d.satis-2,0,100);chg(L,{happy:5,karma:2});return 'Tu refuses : « mon corps, mon règlement ». L’agent encaisse mal.';},
  stylist(L){
    if(!isJ(L,'mannequin'))return '';const d=md(L);d.satis=lim(d.satis+8,0,100);chg(L,{looks:2,fame:2});return 'Un styliste influent te prend sous son aile. Ton nom circule.';},
  fluFW(L){
    if(!isJ(L,'mannequin'))return '';const d=md(L);
    if(chance(.5)){d.shape=lim(d.shape-3,0,100);chg(L,{health:-3,happy:-3});return 'Tu défiles malgré la fièvre. Le fard à joues fait des miracles, pas ta santé.'}
    chg(L,{happy:-5});return 'Tu déclares forfait. L’agence remplace ton passage par une débutante.';}
};
const conds={musicien:L=>isJ(L,'musique'),mannequin:L=>isJ(L,'mannequin'),signe:L=>isJ(L,'musique')&&!!ms(L).contract,celebre:L=>(isJ(L,'musique')||isJ(L,'mannequin'))&&L.fame>=20};
const eventsDb=[
 {id:'music_model_fan_letter',category:'career_event',icon:'💌',conditions:{min_age:12,min_fame:8,mod_cond:{mod:MOD,fn:'musicien'}},probability_weight:.12,
  prompt_text:'Une lettre de fan arrive à ton nom, avec un dessin de toi en super-héros. Au dos : « Votre dernier album m’a sauvé la vie. »',
  consequences:{happiness_modifier:5,fame_modifier:1,result_text:'Tu accroches le dessin au-dessus de ton piano. Ça fait chaud au cœur.'}},
 {id:'music_model_viral',category:'career_event',icon:'📱',conditions:{min_age:12,mod_cond:{mod:MOD,fn:'musicien'}},probability_weight:.1,
  prompt_text:'Une de tes vidéos commence à circuler sur les réseaux sociaux. Poster une nouvelle reprise pourrait la propulser… ou l’enterrer.',
  choices:[{choice_text:'Poster une reprise en direct de ta cuisine',consequences:{mod_effect:{mod:MOD,fn:'viral'}}},{choice_text:'Ne rien faire et laisser faire',consequences:{happiness_modifier:1,result_text:'Tu laisses le numérique décider. La vague passe.'}}]},
 {id:'music_model_sacem',category:'career_event',icon:'🧾',conditions:{min_age:16,mod_cond:{mod:MOD,fn:'musicien'}},probability_weight:.08,
  prompt_text:'La société de gestion des droits d’auteur t’écrit : une régularisation que tu avais oubliée vient d’être versée.',
  consequences:{bank_balance_modifier:[500,4000],result_text:'Un virement inattendu : de quoi payer les cordes de la guitare pour deux ans.'}},
 {id:'music_model_radio',category:'career_event',icon:'📻',conditions:{min_age:14,min_fame:12,mod_cond:{mod:MOD,fn:'musicien'}},probability_weight:.1,
  prompt_text:'Une radio nationale t’invite pour une interview en direct à l’heure du petit-déjeuner.',
  choices:[{choice_text:'Venir préparé, avec quelques anecdotes drôles',consequences:{mod_effect:{mod:MOD,fn:'radio',args:{ok:true}}}},{choice_text:'Improviser sans filet',consequences:{mod_effect:{mod:MOD,fn:'radio',args:{ok:false}}}}]},
 {id:'music_model_label_party',category:'career_event',icon:'🥂',conditions:{min_age:16,min_fame:15,mod_cond:{mod:MOD,fn:'signe'}},probability_weight:.08,
  prompt_text:'Ta maison de disques organise une soirée de lancement dans un hôtel particulier. Tout le Paris de la musique y sera.',
  choices:[{choice_text:'Y aller et sortir le grand jeu',consequences:{fame_modifier:3,happiness_modifier:5,bank_balance_modifier:-300,result_text:'Tu rencontres un réalisateur de clips et un humoriste. La soirée finit à l’aube.'}},{choice_text:'Rester travailler en studio',consequences:{smarts_modifier:1,stress_level_increment:-2,result_text:'Tu préfères les vrais accords aux petits fours.'}}]},
 {id:'music_model_stylist',category:'career_event',icon:'🧵',conditions:{min_age:16,mod_cond:{mod:MOD,fn:'mannequin'}},probability_weight:.1,
  prompt_text:'Un styliste influent te repère dans le métro et te propose de te prêter une collection pour une série éditoriale.',
  choices:[{choice_text:'Accepter avec enthousiasme',consequences:{mod_effect:{mod:MOD,fn:'stylist'}}},{choice_text:'Demander l’avis de ton agent',consequences:{happiness_modifier:1,result_text:'Ton agent pique une crise : « Pourquoi ne pas m’avoir appelé tout de suite ? »'}}]},
 {id:'music_model_pressure',category:'career_event',icon:'⚖️',conditions:{min_age:16,mod_cond:{mod:MOD,fn:'mannequin'}},probability_weight:.1,
  prompt_text:'Ton agent te dit, la mine grave : « Ces derniers temps, tu as l’air un peu moins affûté. Il faudrait songer à un petit régime. »',
  choices:[{choice_text:'Te plier à ses recommandations',consequences:{mod_effect:{mod:MOD,fn:'pressure',args:{diet:true}}}},{choice_text:'Refuser fermement',consequences:{mod_effect:{mod:MOD,fn:'pressure',args:{diet:false}}}}]},
 {id:'music_model_flu',category:'career_event',icon:'🤧',conditions:{min_age:16,mod_cond:{mod:MOD,fn:'mannequin'}},probability_weight:.08,
  prompt_text:'La veille de ton plus gros défilé, tu te réveilles avec 38,5 de fièvre.',
  choices:[{choice_text:'Défiler quand même',consequences:{mod_effect:{mod:MOD,fn:'fluFW'}}},{choice_text:'Rester au lit',consequences:{happiness_modifier:-3,job_performance_modifier:-4,result_text:'L’agence te remplace par une autre. Tu regardes le défilé à la télé.'}}]},
 {id:'music_model_paparazzi',category:'career_event',icon:'📷',conditions:{min_age:16,min_fame:25,mod_cond:{mod:MOD,fn:'celebre'}},probability_weight:.1,
  prompt_text:'Des photographes te suivent depuis ton café du matin jusqu’au pressing. Ils veulent un cliché « sans filtre ».',
  choices:[{choice_text:'Poser avec un grand sourire',consequences:{fame_modifier:3,happiness_modifier:2,result_text:'Tu te prêtes au jeu. Tu fais la une de la presse people, de façon plutôt flatteuse.'}},{choice_text:'Les semer en scooter',consequences:{happiness_modifier:3,fame_modifier:1,result_text:'Tu t’échappes par une rue piétonne. Un livreur te félicite.'}},{choice_text:'Perdre ton sang-froid',consequences:{fame_modifier:-2,happiness_modifier:-4,karma_modifier:-2,result_text:'La vidéo de ton coup de sang fait le tour du web.'}}]}
];

/* ============================ Enregistrement ============================ */
registerMod({
  id:MOD,
  worldInit(){const g=mgr();if(g&&!g.mmTrend)g.mmTrend=pick(MUSIC_GENRES)},
  worldYear(){const g=mgr();if(g)g.mmTrend=pick(MUSIC_GENRES)},
  special:{
    musique:{n:'Musicien',ic:'🎤',desc:'Instruments, groupe, contrat, albums, tournées et Victoires de la musique',
      ladder:['Musicien amateur','Artiste indépendant','Artiste signé','Disque de platine','Star internationale'],req:{age:14},
      apply:applyMusic,year:yearMusic,salary:baseRoy,panel:panelMusic},
    mannequin:{n:'Mannequin',ic:'📸',desc:'Agences, séances photo, Fashion Week et campagnes de luxe',
      ladder:['Mannequin mains et pieds','Mannequin catalogue','Mannequin de défilé','Top-modèle'],req:{age:16,looks:55,maxAge:32},
      apply:applyModel,year:yearModel,salary:mPay,panel:panelModel}
  },
  events(L){let n=0;try{n+=eventsMusic(L)||0}catch(e){console.error(e)}try{n+=eventsModel(L)||0}catch(e){console.error(e)}return n},
  eventsDb,effects,conds
});
})();
