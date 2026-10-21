/* Deux Vies — module « Grossesse » (id pregnancy)
   Remplace la naissance immédiate : test de conception, neuf mois de grossesse (une année de jeu), échographie,
   complications possibles, accouchement avec choix du prénom. État : L.preg (voir babyAttempt), L.pregPartner (autre joueur lié). */
(()=>{
const MOD='pregnancy';
const other=L=>{try{return linkedOther(L)}catch(e){return null}};
const clearPreg=L=>{delete L.preg;const o=other(L);if(o)delete o.pregPartner};
const motherAge=(L,p)=>L.gender==='F'?L.age:(p?p.age:L.age);

/* Orphelin : grossesse sans mère possible, ou drapeau sans grossesse en face */
function sane(L){
  if(L.preg){
    const g=L.preg;
    if(typeof g.due!=='number'||typeof g.start!=='number'){clearPreg(L);return false}
    if(!g.motherIsPlayer&&!g.ivf&&!L.partner&&!g.pl){clearPreg(L);return false}
    if(!g.motherIsPlayer&&!g.ivf&&L.partner&&!partnerOf(L)){clearPreg(L);return false}
  }
  if(L.pregPartner){const o=other(L);if(!o||!o.preg)delete L.pregPartner}
  return !!L.preg;
}

/* ---------- Conception ---------- */
function attempt(L,ivf){
  const p=partnerOf(L);if(!p&&!ivf)return '';
  if(L.preg)return out(L,'Une grossesse est déjà en cours.');
  if(p&&L.gender===p.gender&&!ivf)return out(L,'À deux, ce n’est pas possible biologiquement. Pensez à l’adoption ou à la PMA.');
  const mother=motherAge(L,p);
  if(mother>(ivf?52:46))return out(L,'Il est trop tard pour une grossesse.');
  const fert=L.gender==='F'?((L.hid&&L.hid.fertility)||70):70;
  const base=(mother<35?.5:mother<40?.3:.12)*(0.6+fert/125)*(ivf?1.4:1);
  if(!chance(Math.min(.9,base)))return out(L,ivf?'La FIV n’a pas fonctionné cette fois.':'Pas de bébé cette fois-ci.');
  const twins=chance(ivf?.15:.03),mp=L.gender==='F';
  L.preg={due:L.age+1,twins,ivf:!!ivf,motherIsPlayer:mp,partnerName:p?p.first:'',start:L.age,checks:0,
    pl:p?{id:p.id||null,last:p.last,look:p.look,link:L.partner&&L.partner.link!=null?'player'+L.partner.link:null}:null};
  chg(L,{happy:8});
  const txt=mp?'🤰 Test positif : tu attends un bébé !':(p?`🤰 ${p.first} attend un bébé !`:'🤰 La FIV a fonctionné : un bébé est en route !');
  const o=other(L);if(o){o.pregPartner=true;chg(o,{happy:8});say(o,mp?`🤰 ${L.first} attend un bébé de toi !`:'🤰 Tu attends un bébé !')}
  return out(L,txt);
}

/* ---------- Échographie ---------- */
function echo(L){
  const g=L.preg;if(!g||g.echo)return 0;g.echo=1;
  g.sexes=[];for(let i=0;i<(g.twins?2:1);i++)g.sexes.push(pick(['H','F']));
  const desc=g.sexes.map(s=>s==='F'?'une fille':'un garçon').join(' et ');
  modal({title:'Échographie',icon:'🩻',text:g.twins?'Le médecin fronce les sourcils, puis sourit : il y en a deux !':'Sur l’écran, une petite silhouette s’agite. Le médecin demande si vous voulez connaître le sexe du bébé.',
    choices:[{t:'Le savoir',pri:1,fn:()=>{g.know=1;chg(L,{happy:4});return out(L,`🩻 Échographie : ${desc} !`)}},
      {t:'Garder la surprise',fn:()=>{chg(L,{happy:2});return out(L,'🩻 Échographie : vous gardez la surprise.')}}]});
  modal({title:'Suivi de grossesse',icon:'🏥',text:'Il reste des visites médicales au programme. Les ferez-vous toutes ?',
    choices:[{t:'Toutes les visites (300 €)',pri:1,fn:()=>{if(L.money>=300){spend(L,300);g.checks=(g.checks||0)+3;return out(L,'🏥 Vous ne manquez aucune visite de suivi.')}g.checks=(g.checks||0)+1;return out(L,'🏥 Budget serré : vous faites le minimum.')}},
      {t:'En sauter une',fn:()=>{g.skip=1;chg(L,{stress:-3});return out(L,'🏥 Vous sautez une visite. Tout ira bien, sans doute.')}}]});
  return 2;
}

/* ---------- Complications ---------- */
function complications(L){
  const g=L.preg,p=partnerOf(L),ma=motherAge(L,p);
  const hl=g.motherIsPlayer?L.st.health:(p&&p.health)||80,st=g.motherIsPlayer?L.st.stress:30;
  let r=.10+(ma>38?.08:0)+(hl<40?.08:0)+(st>70?.06:0)-Math.min(.08,(g.checks||0)*.02)-(g.rest?.02:0)-(g.vit?.02:0)+(g.skip?.05:0);
  if(chance(Math.max(.03,r))){
    chg(L,{happy:-18,stress:8});partnerRel(L,-4);if(g.motherIsPlayer)chg(L,{health:-4});
    const o=other(L);if(o)chg(o,{happy:-18});
    const t=g.motherIsPlayer?'💔 Tu perds le bébé. Le chagrin est immense, et tu as besoin de temps.':'💔 La grossesse s’arrête : une fausse couche. Vous traversez cette épreuve ensemble.';
    clearPreg(L);if(o)say(o,t);out(L,t);return false;
  }
  if(chance(.15+(ma>38?.1:0))){
    const c=g.checks>=3?400:900;spend(L,c);if(g.motherIsPlayer)chg(L,{health:-8});chg(L,{stress:6});
    out(L,`🏥 Grossesse à risque : repos strict et examens en plus. Facture : ${fmt(c)}.`);
  }
  if(L.partner&&!L.partner.link&&L.partner.rel<35&&chance(.5)&&p){
    const nm=p.first;breakUp(L,`${nm} ne se sent pas prêt${p.gender==='F'?'e':''} à fonder une famille et s’en va.`);
  }
  return true;
}

/* ---------- Accouchement ---------- */
function birth(L){
  const g=L.preg;if(!g)return;
  const pl=g.pl||{},p=partnerOf(L)||(pl.last?{last:pl.last,look:pl.look,id:pl.id}:null);
  if(!complications(L))return;
  const last=p&&L.gender!=='H'&&p.gender==='H'?p.last:(p&&p.last&&L.gender==='F'&&p.gender==='H'?p.last:L.last);
  const born=[];
  for(let i=0;i<(g.twins?2:1);i++){
    const sx=(g.sexes&&g.sexes[i])||pick(['H','F']);
    const c=person(sx,0,last||L.last,L.country,[L,p]);c.type='child';c.rel=R(85,100);
    c.coparent=pl.link||(L.partner&&L.partner.link!=null?'player'+L.partner.link:(pl.id||(p&&p.id)||null));
    c.look=genLook(L.look,p&&p.look,c.gender);addChild(L,c);born.push(c);
  }
  const o=other(L);
  const mum=g.motherIsPlayer;chg(L,{happy:15,stress:5});if(mum)chg(L,{health:-3});partnerRel(L,8);
  trackMax(L,'kidsMax',allKids(L).length);
  const txt=born.length===2?`👶 Des jumeaux ! Bienvenue à ${born[0].first} et ${born[1].first}.`:`👶 C’est ${born[0].gender==='F'?'une fille':'un garçon'} ! Bienvenue à ${born[0].first}.`;
  if(o){chg(o,{happy:15});say(o,txt);trackMax(o,'kidsMax',allKids(o).length)}
  out(L,txt);clearPreg(L);
  born.forEach(c=>nameModal(L,c));
  afterBirth(L,born);
}
function nameModal(L,c){
  const F=c.gender==='F',o=other(L);
  const names=[];let n=0;while(names.length<3&&n++<30){const x=rname(c.gender,L.country);if(x!==c.first&&!names.includes(x))names.push(x)}
  const apply=nm=>{
    const upd=q=>{const k=q.family.find(z=>z.id===c.id);if(k)k.first=nm};
    upd(L);if(o)upd(o);return out(L,`🍼 ${F?'Elle':'Il'} s’appellera ${nm}.`);
  };
  modal({title:F?'Une petite fille !':'Un petit garçon !',icon:'👶',text:`Comment appeler ${F?'cette petite merveille':'ce petit bonhomme'} ? ${F?'Elle':'Il'} s’appelle pour l’instant ${c.first}.`,
    choices:names.map(x=>({t:x,fn:()=>apply(x)})).concat([{t:'Garder le prénom proposé ('+c.first+')',pri:1,fn:()=>apply(c.first)}])});
}
function afterBirth(L,born){
  const c=born[0];
  if(chance(.5))modal({title:'Baby shower',icon:'🎁',text:`Tes proches organisent une fête surprise pour l’arrivée de ${c.first}. Cadeaux, gâteau et barboteuses à gogo.`,
    choices:[{t:'En profiter pleinement',pri:1,fn:()=>{chg(L,{happy:8,stress:-4});partnerRel(L,3);if(chance(.5))earn(L,R(100,400),1);return out(L,'🎁 Une belle fête, et la commode du bébé déborde de cadeaux.')}},
      {t:'Rester discret',fn:()=>{chg(L,{happy:3});return out(L,'🎁 Tu remercies tout le monde et files te reposer.')}}]});
  else modal({title:'Nuits blanches',icon:'😴',text:`${c.first} a décidé que la nuit était faite pour les câlins et les biberons à 3 h du matin.`,
    choices:[{t:'Faire les nuits à tour de rôle',pri:1,fn:()=>{chg(L,{stress:7,happy:2});partnerRel(L,L.partner?4:0);return out(L,'😴 Vous tenez le coup en vous relayant. Café, café, café.')}},
      {t:'Tout assumer',fn:()=>{chg(L,{stress:14,health:-3,happy:-2});partnerRel(L,-3);return out(L,'😴 Tu es épuisé'+ge(L,'','e')+', mais le bébé dort enfin.')}},
      {t:'Payer une baby-sitter de nuit (400 €)',fn:()=>{if(L.money<400)return 'Pas assez d’argent pour ça.';spend(L,400);chg(L,{stress:-3,happy:3});return out(L,'😴 Une nounou de nuit : le luxe ultime.')}}]});
}

/* ---------- Panneau ---------- */
function panel(){
  const L=cur();const g=L&&L.preg;
  if(!L)return {title:'Grossesse',html:note('Rien à signaler.')};
  if(!g)return {title:'Grossesse',html:note(L.pregPartner?'Ton partenaire attend un bébé. Soutiens-le au mieux.':'Aucune grossesse en cours.')};
  const mum=g.motherIsPlayer,who=mum?'Tu attends':(g.partnerName?`${g.partnerName} attend`:'Un bébé est attendu');
  const left=Math.max(0,g.due-L.age);
  const info=`${who} ${g.twins&&g.echo?'des jumeaux':'un bébé'}. Naissance prévue ${left>0?'dans environ '+An(left):'très bientôt'}. Visites de suivi : ${g.checks||0}.${g.know&&g.sexes?' Sexe connu : '+g.sexes.map(s=>s==='F'?'fille':'garçon').join(' et ')+'.':''}`;
  return {title:'Grossesse en cours',html:note(info)+group('Soins',[
    act(L,{ic:'🏥',t:'Visite de suivi',s:'250 € · réduit les risques',cost:250,key:'preg_visit',fn:L=>{if(L.preg){L.preg.checks=(L.preg.checks||0)+1;L.preg.skip=0}chg(L,{stress:-3,happy:2});return out(L,'🏥 Visite de suivi : tout est en ordre.')}}),
    act(L,{ic:'🛋️',t:'Se reposer',s:'Gratuit · moins de stress',key:'preg_rest',fn:L=>{if(L.preg)L.preg.rest=1;chg(L,{stress:-8,health:2});return out(L,'🛋️ Une année tout en douceur : sieste, thé et pieds en l’air.')}}),
    act(L,{ic:'💊',t:'Prendre des vitamines',s:'40 €',cost:40,key:'preg_vit',fn:L=>{if(L.preg)L.preg.vit=1;chg(L,{health:3});return out(L,'💊 Acide folique et fer au petit-déjeuner.')}})
  ])};
}

registerMod({
  id:MOD,
  babyAttempt(L,ivf){try{return attempt(L,ivf)||''}catch(e){console.error(e);return ''}},
  year(L){
    if(!sane(L))return;
    if(L.age<L.preg.due)return;
    if(!L.preg.echo)echo(L);
    birth(L);
  },
  events(L){
    if(!sane(L))return 0;
    if(L.preg.echo||L.age<=L.preg.start||L.age>=L.preg.due)return 0;
    return echo(L);
  },
  sheetRows(L){
    if(!L||!sane(L)&&!L.pregPartner)return [];
    return [nav('🤰','Grossesse en cours',L.preg?(L.preg.motherIsPlayer?'Ton bébé grandit':'Un bébé est en route'):'Ton partenaire attend un bébé',panel)];
  },
  inherit(D,L){delete L.preg;delete L.pregPartner},
  born(L){delete L.preg;delete L.pregPartner}
});
})();
