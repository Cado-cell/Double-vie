/* Deux Vies — module « Petits ajouts » (id extras)
   1. Jeux et loisirs d’enfance   2. Chirurgiens esthétiques (L.surg)   3. Loto progressif (G.jackpot)
   4. Décès soudains de proches   5. Karma et durée de vie */
(()=>{
const MOD='extras';
const NOMS=['Dr Alix Verbeke','Dr Mathis Carrel','Dre Sonia Delmas','Dr Yann Marchetti','Dre Inès Beaulieu','Dr Olivier Lenoir','Dre Camille Fontaine','Dr Hugo Valmont','Dre Lucie Ferrand','Dr Maxime Roche'];
const ARTISTES=['Céline Dionnée','Les Petits Pois Sauteurs','DJ Baguette','Jean-Michel Tubes','Mamie Rock','Stromaé-Cola','Zazou Zéphyr','Les Chaussettes Orange','Angèle Divine','Orelsan Dupont','Vianney Vacances','Les Hérissons','Clara Luciani Bis','Patrick Bruel-Bruel','Camille Chat-Noir','Indochine Express','Booba Doudou','Christine and the Queenz','Julien Doré-Mi','Alizée Moi-Lolita'];
const GOUTS=['pop','rock','rap','électro','chanson française','jazz','classique'];
const CAUSES=['après avoir glissé sur une peau de banane au carnaval','d’un fou rire pendant un spectacle de mime','après une partie de pétanque trop disputée','à la suite d’une indigestion de fondue géante','en tombant d’une chaise en voulant changer une ampoule pour la dixième fois','après s’être pris les pieds dans une guirlande de Noël','d’un coup de froid attrapé en attendant le dernier bus','après une sieste un peu trop profonde sur un transat','en suivant aveuglément son GPS jusque dans un étang','d’une surdose de croissants au beurre','après un duel perdu contre une porte automatique','en voulant battre le record du monde de sudoku','d’un éternuement mal placé au sommet d’un escalier','après avoir mangé un champignon sans demander l’avis du pharmacien','de vieillesse, entouré de ses mots fléchés'];
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const ex=L=>L.extras||(L.extras={});
const dep=(L,n)=>{L.yr&&(L.yr.dep+=n)};

/* ---------- 1. Enfance ---------- */
function pEnfance(){const L=cur();const a=L.age;
  const rows=[
    act(L,{ic:'🧸',t:'Jouer avec tes jouets',s:'Camions, poupées et grands plans',min:0,key:'x_jouets',dis:a>6?'Tu es trop grand pour ça… ou presque':'',fn:L=>{chg(L,{happy:R(2,5)});return out(L,pick(['Tu construis un château de briques qui s’écroule glorieusement.','Tes peluches tiennent un conseil de famille. Tu présides.','Tu fais le tour de la maison en camion de pompiers.']))}}),
    act(L,{ic:'🎨',t:'Loisirs créatifs',s:'Dessin, pâte à modeler, collage',min:3,key:'x_creatif',dis:a>12?'Réservé aux plus jeunes':'',fn:L=>{const o=pick(['un dessin de famille avec quatre bras par personne','un chat en pâte à modeler (ou un chien, difficile à dire)','un collage de nouilles et de paillettes']);L.skills.dessin=clamp((L.skills.dessin||0)+R(2,5));chg(L,{happy:R(3,5)});return out(L,`Tu réalises ${o}. Chef-d’œuvre.`)}}),
    act(L,{ic:'🎧',t:'Écouter de la musique',s:'Choisir un artiste',min:3,nav:()=>pMusique()}),
    act(L,{ic:'🤗',t:'Faire un câlin à tes parents',s:parentsAlive(L)?'Gratuit et efficace':'',min:0,key:'x_calin',dis:parentsAlive(L)?'':'Plus de parents à câliner',fn:L=>{relParent(L,R(3,7));chg(L,{happy:R(2,4)});return out(L,'Un énorme câlin. Tes parents fondent comme du beurre.')}})];
  return {title:'Jeux et loisirs',html:note('Quand on est petit, il n’y a rien de plus sérieux que jouer.')+group('',rows)};
}
function pMusique(){const L=cur();
  const rows=ARTISTES.map(n=>act(L,{ic:'🎵',t:n,s:'Monter le son',key:'x_musique',fn:L=>{
    chg(L,{happy:R(2,5)});let t=`Tu écoutes ${n} en boucle. Tes voisins aussi.`;
    if(chance(.15)&&!ex(L).gout){ex(L).gout=pick(GOUTS);L.skills.musique=clamp((L.skills.musique||0)+R(2,6));t+=` Tu découvres ton goût pour le ${ex(L).gout}.`}
    return out(L,t)}}));
  return {title:'Écouter de la musique',html:note(ex(L).gout?`Ton style préféré : ${ex(L).gout}.`:'Quel artiste pour la bande-son du jour ?')+group('',rows)};
}

/* ---------- 2. Chirurgiens ---------- */
function chirs(L){
  const s=L.surg&&typeof L.surg==='object'?L.surg:(L.surg={});
  if(!Array.isArray(s.docs)||s.docs.length<2)s.docs=[0,1].map(()=>newDoc(s.docs&&s.docs[0]?s.docs[0].nom:''));
  if(!Array.isArray(s.log))s.log=[];
  return s;
}
function newDoc(avoid){let n;do n=pick(NOMS);while(n===avoid);return {nom:n,rep:R(20,100),mult:Math.round((.7+Math.random()*.9)*100)/100}}
function pChir(){const L=cur();const s=chirs(L);
  const rows=s.docs.map((d,i)=>row({ic:'🩺',t:d.nom,s:`Réputation ${d.rep} / 100 · tarifs ×${String(d.mult).replace('.',',')}`,right:'›',a:()=>pushPanel(()=>pChirDoc(i))}));
  const lg=s.log.length?group('Journal',s.log.slice(-5).reverse().map(t=>`<p class="note">${esc(t)}</p>`)):'';
  return {title:'Chirurgien esthétique',html:note('Les chirurgiens changent d’une année à l’autre. Les moins chers ne sont pas toujours les plus doués.')+group('Choisis ton chirurgien',rows)+lg};
}
function pChirDoc(i){const L=cur();const s=chirs(L);const d=s.docs[i];
  if(!d)return {title:'Chirurgien',html:note('Ce chirurgien n’est plus disponible.')};
  const ps=(typeof SURGERIES!=='undefined'?SURGERIES:[]).map(([n,c,w])=>{const cost=Math.round(c*d.mult);return act(L,{ic:'💉',t:n,s:`${fmt(cost)} · ${w}`,min:18,cost,fn:L=>operer(L,d,n,w)})});
  return {title:d.nom,html:card('Réputation',`${d.rep} / 100`,`Tarifs ×${String(d.mult).replace('.',',')}`)+group('Interventions',ps)};
}
function operer(L,d,n,w){
  const s=chirs(L);const risque=lim(.34-d.rep*.0032,.03,.3);let t;
  if(chance(risque)){const m=R(3,9);chg(L,{looks:-m,happy:-10,health:-R(2,6)});
    t=`${n} ratée chez ${d.nom} : ${w} garde des traces. Tu évites les miroirs un moment.`}
  else{const b=Math.round(2+d.rep/12+R(0,3));chg(L,{looks:b,happy:R(4,9)});
    t=`${n} réussie chez ${d.nom}. ${cap(w)} ${n==='Implants capillaires'||n==='Injections de botox'?'fait':'fait'} son effet : +${b} en beauté.`}
  track(L,'surgeries');s.log.push(`${L.age} ans : ${n}, ${d.nom}.`);if(s.log.length>20)s.log.shift();
  return out(L,'💉 '+t);
}

/* ---------- 3. Loto progressif ---------- */
const jp=()=>(typeof G!=='undefined'&&G&&G.jackpot>0)?G.jackpot:2000000;
function ticket(L,n){
  let t='';let gain=0;
  for(let i=0;i<n;i++){
    if(chance(1/25000)){gain=jp();earn(L,gain,1);track(L,'jackpot');G.jackpot=2000000;chg(L,{happy:40});
      t=`🎰 JACKPOT ! Tu empoches ${fmt(gain)} au loto progressif !`;break}
    const r=Math.random();
    if(r<.002)gain+=R(5000,30000);else if(r<.02)gain+=R(100,500);else if(r<.12)gain+=R(6,30);
  }
  if(!t){if(gain>0){earn(L,gain,1);chg(L,{happy:Math.min(8,2+Math.round(gain/500))});t=`Ticket${n>1?'s':''} gagnant${n>1?'s':''} : ${fmt(gain)}.`}
    else{chg(L,{happy:-1});t=`${n>1?'Tickets perdants':'Ticket perdant'}. Le jackpot attendra.`}}
  else gain=0;
  return out(L,t);
}
function pLoto(){const L=cur();
  const rows=[1,5,20].map(n=>act(L,{ic:'🎟️',t:`${n} ticket${n>1?'s':''}`,s:`${fmt(3*n)} · 1 chance sur 25 000 par ticket`,min:18,cost:3*n,fn:L=>{L.yr&&(L.yr.dep+=0);return ticket(L,n)}}));
  return {title:'Loto progressif',html:card('Cagnotte actuelle',fmtk(jp()),'Elle grossit chaque année jusqu’à ce que quelqu’un la remporte')+note('Lots secondaires fréquents, jackpot très rare. Joue pour le plaisir, pas pour payer le loyer.')+group('',rows)};
}

/* ---------- 4. Décès soudains ---------- */
function deces(L){
  const c=L.family.filter(p=>p&&p.alive&&p.type!=='pet');
  if(!c.length)return '';
  const p=pick(c);p.alive=false;const cause=pick(CAUSES);
  chg(L,{happy:-(p.type==='parent'?15:12)});
  const t=`🕯️ ${cap(poss(p))}, ${p.first}, est ${p.gender==='F'?'décédée':'décédé'} ${cause}.`;
  if((p.type==='parent'||p.type==='grand')&&L.age>=16&&chance(p.type==='parent'?.75:.4)){
    if(chance(.25)){const it=pick([['Montre à gousset de famille',R(800,6000)],['Collier de perles ancien',R(1500,12000)],['Pendule ancienne',R(600,4000)],['Tableau de famille',R(1000,30000)],['Service en argent',R(900,5000)]]);L.assets.push({id:nid(),kind:'heirloom',name:it[0],value:it[1]});say(L,`Tu hérites d’un objet de famille : ${it[0].toLowerCase()}.`)}
    else{const h=R(2000,p.type==='parent'?90000:30000)*(L.royal?20:1);earn(L,h,1);say(L,`Tu hérites de ${fmt(h)}.`)}
  }
  if(L.royal&&p.royal&&!L.royal.throne)royalSuccession(L,p);
  return t;
}

/* ---------- Module ---------- */
registerMod({
  id:MOD,
  worldInit(){if(typeof G!=='undefined'&&G&&!(G.jackpot>0))G.jackpot=2000000},
  worldYear(){if(typeof G==='undefined'||!G)return;G.jackpot=Math.round((G.jackpot>0?G.jackpot:2000000)+R(400000,3000000))},
  year(L){
    try{
      const k=L.st&&L.st.karma;if(k==null)return;
      if(k>=80&&chance(.5)){chg(L,{health:1});if(chance(.08))say(L,'🍀 Ta bonne étoile veille sur toi : tu te sens en pleine forme.')}
      else if(k<=20&&chance(.5)){chg(L,{health:-1});if(chance(.08))say(L,'🌩️ Le mauvais karma te colle aux basques : tu te sens barbouillé.')}
    }catch(e){console.error(e)}
  },
  activities(L){
    const r=[];
    if(L.age<=14)r.push({ic:'🧸',t:'Jeux et loisirs',s:'Jouets, dessin, musique et câlins',panel:pEnfance,min:0});
    r.push({ic:'💉',t:'Chirurgien esthétique',s:'Un coup de neuf, au risque d’un coup de rabot',panel:pChir,min:18});
    r.push({ic:'🎰',t:'Loto progressif',s:`Cagnotte : ${fmtk(jp())}`,panel:pLoto,min:18});
    return r;
  },
  eventsDb:[{id:'evt_extras_deces',category:'family',icon:'🕯️',conditions:{min_age:8},probability_weight:.03,
    prompt_text:'Une nouvelle triste parvient jusqu’à toi.',consequences:{mod_effect:{mod:MOD,fn:'deces'}}}],
  effects:{deces}
});
})();
