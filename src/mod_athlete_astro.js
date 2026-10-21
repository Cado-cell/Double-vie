/* Deux Vies — module « Sport et espace » (id athlete_astro)
   1. Sportif pro (clé sport) : draft, entraînement ciblé, blessures, saisons simulées, phases finales, Hall of Fame
   2. Astronaute (clé astro) : sélection, indicateurs de l’agence, scénarios de survie, missions, artefact, publications
   Migre l’ancien format de mod_legacy.js (L.job.c sport/astro avec lvl, perf, sport, team, works) sans rien perdre. */
(()=>{
const MOD='athlete_astro';
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const rd=Math.round;
const dec=n=>String(rd(n*10)/10).replace('.',',');
const pl=(n,s,p)=>`${n} ${n>1?(p||s+'s'):s}`;

/* ================= SPORTIF PRO ================= */
const CFG={
 foot:{ic:'⚽',lesson:'football',w:{cardio:.25,muscu:.15,vitesse:.3,technique:.3},games:34,draw:1,teams:18,
  pos:{'attaquant':[.4,.15],'milieu':[.15,.3],'défenseur':[.05,.06],'gardien':[0,.01]},
  titles:[{n:'le championnat',league:1},{n:'la Coupe de France',rounds:5,off:.12},{n:'la Ligue des champions',rounds:4,off:.02,maxRank:3}]},
 basket:{ic:'🏀',lesson:'',w:{cardio:.25,muscu:.2,vitesse:.25,technique:.3},games:34,draw:0,teams:16,
  pos:{'meneur':[13,7],'ailier':[17,3],'pivot':[12,2]},
  titles:[{n:'le championnat',rounds:4,off:0,maxRank:8},{n:'la Coupe de France',rounds:3,off:.1}]},
 rugby:{ic:'🏉',lesson:'',w:{cardio:.2,muscu:.35,vitesse:.2,technique:.25},games:26,draw:1,teams:14,
  pos:{'pilier':[.1,1],'demi':[.2,6],'ailier':[.55,3],'arrière':[.3,7]},
  titles:[{n:'le Bouclier de Brennus',rounds:3,off:0,maxRank:6},{n:'la Coupe d’Europe',rounds:3,off:-.04,maxRank:4}]},
 tennis:{ic:'🎾',lesson:'tennis',solo:1,w:{cardio:.25,muscu:.15,vitesse:.25,technique:.35},pos:{},
  tourn:[['l’Open d’Australie',7,.06],['Roland-Garros',7,.06],['Wimbledon',7,.06],['l’US Open',7,.06],['le Masters de Monte-Carlo',6,.04],['le Masters de Madrid',6,.04],['le Masters de Paris-Bercy',6,.04],['un tournoi de Marseille',5,.1],['un tournoi de Lyon',5,.1],['un tournoi de Montpellier',5,.1],['un tournoi de Metz',5,.1]]},
 velo:{ic:'🚴',lesson:'',solo:1,w:{cardio:.4,muscu:.2,vitesse:.2,technique:.2},pos:{'grimpeur':0,'sprinteur':0,'rouleur':0,'puncheur':0},
  tourn:[['le Tour de France',1],['le Giro',1],['la Vuelta',1],['Paris-Roubaix',0],['Milan-San Remo',0],['le Tour des Flandres',0],['Liège-Bastogne-Liège',0],['le Critérium du Dauphiné',0],['Paris-Nice',0],['la Flèche Wallonne',0],['les Strade Bianche',0],['le Tour de Suisse',0],['le Tour du Pays basque',0],['les championnats nationaux',0],['une étape de montagne reine',0]]}
};
const SAL=[30000,450000,1500000,3600000];
const ATTRS=[['cardio','🫁','Cardio'],['muscu','🏋️','Musculation'],['vitesse','⚡','Vitesse'],['technique','🎯','Technique'],['recup','🧊','Récupération']];
const INTS=['Ménagée','Normale','Intense'];
/* [libellé, mois min, mois max, poids, attribut touché, grave] */
const INJ=[
 ['une contracture',1,1,26,'muscu',0],['une élongation',1,2,26,'vitesse',0],['une entorse de la cheville',1,3,24,'vitesse',0],
 ['une tendinite',2,4,18,'cardio',0],['une commotion',1,3,10,'technique',0],['une déchirure musculaire',2,4,14,'muscu',0],
 ['une fracture de fatigue',3,5,8,'cardio',0],['une luxation de l’épaule',3,6,6,'muscu',0],
 ['une rupture des ligaments croisés',7,10,6,'vitesse',1],['une rupture du tendon d’Achille',8,12,4,'vitesse',1],['une hernie discale',9,14,2,'muscu',1]];
const TRAIN_TXT={
 cardio:['Footing à l’aube sur les quais, fractionné en côte : tes poumons crient grâce.','Séance de vélo et de fractionné court : tu finis en apnée.'],
 muscu:['Squats, gainage et développé couché : ta salle sent la fonte et le café.','Circuit de force avec le préparateur physique : tes cuisses t’en veulent.'],
 vitesse:['Sprints, appuis et haies avec le coach : tu bats ton record.','Échelles de rythme et départs arrêtés : tes appuis claquent.'],
 technique:['Cent fois le même geste, jusqu’à ce qu’il devienne naturel.','Atelier vidéo puis répétition : le coach te corrige au millimètre.'],
 recup:['Kiné, bain froid et sommeil : ton corps te dit merci.','Massage, étirements et nuit de dix heures : tu revis.']};
const TROPH_FR={foot:'⚽',basket:'🏀',rugby:'🏉',tennis:'🎾',velo:'🚴'};

function sjob(L){return L.job&&L.job.c==='sport'?L.job:null}
function ensureSport(L){
  const j=sjob(L);if(!j)return null;
  if(j.v!==2){
    j.v=2;if(!CFG[j.sport])j.sport='foot';
    const S=SPORTS[j.sport]||SPORTS.foot;
    j.lvl=[0,1,1,2,3][lim(j.lvl||0,0,4)];
    if(!S.solo&&!j.team)j.team=pick(S.team||['FC Lumière']);
    const ath=L.hid&&L.hid.athletic!=null?L.hid.athletic:50;
    j.attr={};for(const [k] of ATTRS)j.attr[k]=clamp(ath*.6+22+R(-8,8)+(k==='technique'?skillOf(L,'sport')/4:0));
  }
  if(typeof j.perf!=='number')j.perf=R(45,65);
  if(!j.attr||typeof j.attr!=='object')j.attr={};
  for(const [k] of ATTRS)if(typeof j.attr[k]!=='number')j.attr[k]=R(35,60);
  for(const k of ['fat','over','y','works'])if(typeof j[k]!=='number')j[k]=0;
  if(!(j.int>=1&&j.int<=3))j.int=2;
  if(typeof j.tq!=='number')j.tq=R(40,70);
  if(!j.tot)j.tot={g:0,w:0,d:0,l:0,s1:0,s2:0,titles:0};
  if(!Array.isArray(j.hist))j.hist=[];
  const C=CFG[j.sport];
  if(!j.pos||(Object.keys(C.pos).length&&!(j.pos in C.pos)))j.pos=Object.keys(C.pos).length?pick(Object.keys(C.pos)):'';
  return j;
}
function ratingOf(L,j){
  const C=CFG[j.sport];let s=0;for(const k in C.w)s+=(j.attr[k]||0)*C.w[k];
  const a=L.age,rec=(j.attr.recup||50);
  let adj=0;if(a<22)adj=-(22-a)*1.2;else if(a>29)adj=-(a-29)*1.6*(1-rec/220);
  return lim(s*.72+(j.perf||50)*.13+L.st.health*.15+adj-j.over/12,5,99);
}
function injRisk(L,j){
  const p=.05+Math.max(0,L.age-25)*.012+j.fat/450+j.over/300+(j.int-2)*.04+(L.st.health<60?(60-L.st.health)/500:0)-((j.attr.recup||50)-50)/1200;
  return lim(p,.02,.6);
}
function sSalary(L){
  const j=L.job;if(!j)return 0;
  let b=SAL[lim(j.lvl||0,0,3)]*(.6+L.fame/150);
  if(j.sport==='tennis')b*=.8;if(j.sport==='velo')b*=.7;if(j.sponsor)b*=1.15;
  return Math.min(rd(b),9000000);
}
function statTxt(sp,s1,s2,p){
  const m=Math.max(1,p);
  if(sp==='foot')return `${pl(s1,'but')} et ${pl(s2,'passe décisive','passes décisives')}`;
  if(sp==='basket')return `${dec(s1/m)} points et ${dec(s2/m)} passes par match`;
  if(sp==='rugby')return `${pl(s1,'essai')} et ${pl(s2,'point')} au pied`;
  if(sp==='tennis')return `${pl(s1,'titre')} et ${fmtn(s2)} aces`;
  return `${pl(s1,'victoire')} et ${pl(s2,'podium')}`;
}
function wlLabel(sp){return sp==='velo'?['victoire','podium','autre classement']:sp==='tennis'?['victoire','','défaite']:['victoire','nul','défaite']}

/* --- Blessures --- */
function injure(L,j,src){
  const tab=INJ.map(x=>x[3]*(x[5]?(1+Math.max(0,L.age-24)/6):1));
  let tot=tab.reduce((a,b)=>a+b,0),r=Math.random()*tot,i=0;
  for(;i<tab.length-1;i++){r-=tab[i];if(r<=0)break}
  const [nm,m1,m2,,key,grave]=INJ[i];
  const m=R(m1,m2)+(L.age>=33&&grave?R(1,3):0);
  if(grave&&L.age>=27&&chance(lim((L.age-26)*.06,0,.5))){
    chg(L,{health:-R(6,12),happy:-12});
    return endCareer(L,j,'blessure',nm);
  }
  if(j.int===3&&chance(.008)){chg(L,{health:-R(8,14),happy:-14});return endCareer(L,j,'blessure','une blessure irréversible au genou')}
  j.inj={t:nm,m};j.attr[key]=clamp(j.attr[key]-(grave?R(3,8):R(0,3)));
  chg(L,{health:-R(1,4)-(grave?R(3,6):0),happy:-R(3,7)});j.fat=clamp(j.fat-10);
  return out(L,`🩹 ${src||'Pendant la saison'}, tu te fais ${nm}. Indisponible environ ${pl(m,'mois','mois')}.`);
}

/* --- Fin de carrière --- */
function endCareer(L,j,why,txt){
  const tot=j.tot||{};const hof=j.lvl>=3||(tot.titles||0)>=8;
  const sal=sSalary(L);
  L.spx={sport:j.sport,lvl:j.lvl,tot:Object.assign({},tot),hof:hof?1:0,age:L.age,why};
  L.job=null;L.retired=true;L.pension=Math.round(sal*.1);
  chg(L,{happy:why==='age'?6:-8,fame:hof?10:0});
  let t;
  if(why==='blessure')t=`🩹 ${cap(txt)} met fin à ta carrière de sportif${ge(L,'','ve')} professionnel${ge(L,'','le')}. Tu raccroches à ${L.age} ans.`;
  else t=`Tu raccroches les crampons à ${L.age} ans, sous les applaudissements du stade.`;
  if(hof){track(L,'hallOfFame');say(L,`🏛️ Tu es intronisé${ge(L,'','e')} au Hall of Fame : ton maillot est retiré et accroché au plafond.`)}
  t+=` Palmarès : ${pl(tot.titles||0,'titre')}.`;
  return out(L,t);
}

/* --- Saison --- */
function playSeason(L,j){
  const C=CFG[j.sport];
  const lost=j.inj?Math.min(12,j.inj.m):0;
  const avail=1-lost/12;
  if(j.inj){j.inj.m-=12;if(j.inj.m<=0)j.inj=null}
  const rating=ratingOf(L,j),form=rating+R(-12,12);
  const share=avail*[.45,.85,1,1][lim(j.lvl,0,3)];
  const res={w:0,d:0,l:0,played:0,s1:0,s2:0,titles:[],rank:0,rating:rd(rating),form:rd(form),share,avail};
  if(share<.12){res.skipped=1;return res}
  if(!C.solo){
    j.tq=lim((j.tq||55)+R(-6,6),25,85);
    const N=C.games;
    const pw=lim(.32+(j.tq-50)/150+(form-50)/450+(C.draw?0:.18),.08,.85);
    const pd=C.draw?lim(.25-Math.abs(pw-.4)*.2,.1,.26):0;
    for(let i=0;i<N;i++){const r=Math.random();if(r<pw)res.w++;else if(r<pw+pd)res.d++;else res.l++}
    const wr=(res.w+res.d*.4)/N;
    res.rank=clamp(1+(.62-wr)/.5*(C.teams-1)+R(-1,1),1,C.teams);
    res.played=rd(N*share);
    const pp=C.pos[j.pos]||[.1,.1],f=form/55;
    res.s1=rd(res.played*pp[0]*f*R(60,140)/100);res.s2=rd(res.played*pp[1]*f*R(60,140)/100);
    const ps=lim(.3+(j.tq-50)/150+(form-50)/400,.12,.72);
    for(const T of C.titles){
      if(T.league){if(res.rank===1)res.titles.push(T.n);continue}
      if(T.maxRank&&res.rank>T.maxRank)continue;
      let ok=true;for(let k=0;k<T.rounds;k++)if(!chance(lim(ps+T.off,.08,.8))){ok=false;break}
      if(ok)res.titles.push(T.n);
    }
  }else if(j.sport==='tennis'){
    const nT=Math.max(1,rd(C.tourn.length*share));
    for(const [nm,rounds,off] of C.tourn.slice(0,nT)){
      let won=0;
      for(let r=0;r<rounds;r++){if(chance(lim(.4+(form-55)/110+off-r*.01,.1,.92))){won++;res.w++}else{res.l++;break}}
      if(won===rounds){res.titles.push(nm);res.s1++}
    }
    res.played=res.w+res.l;res.s2=rd(res.played*R(3,9)*form/55);
    res.rank=clamp(300*Math.exp(-(form-30)/13),1,999);
  }else{
    const nR=Math.max(1,rd(C.tourn.length*share));
    for(const [nm,grand] of C.tourn.slice(0,nR)){
      const pb=(j.pos==='grimpeur'&&grand?4:0)+(j.pos==='sprinteur'&&!grand?4:0);
      const sc=form+R(-30,30)-(grand?4:0)+pb;
      if(sc>=96){res.w++;res.s1++;res.titles.push(nm)}else if(sc>=82){res.d++;res.s2++}else res.l++;
    }
    res.played=res.w+res.d+res.l;res.rank=clamp(200*Math.exp(-(form-30)/12),1,999);
  }
  return res;
}
function sportYear(L){
  const j=ensureSport(L);if(!j)return;
  const C=CFG[j.sport],S=SPORTS[j.sport]||SPORTS.foot;
  /* blessures de saison */
  const p=injRisk(L,j);
  if(!j.inj||j.inj.m<=0){
    if(chance(p)){injure(L,j);if(!L.job)return}
    else if(chance(p*.4)){injure(L,j);if(!L.job)return}
  }
  const res=playSeason(L,j);
  /* bilan */
  const team=S.solo?'ton équipe d’entraîneurs':j.team;
  if(res.skipped){
    say(L,`🩹 Saison blanche : ${j.inj?'ta blessure':'ton indisponibilité'} t’a tenu${ge(L,'','e')} à l’écart des terrains.`);
    j.perf=clamp(j.perf-R(3,8));
  }else{
    const lab=wlLabel(j.sport);
    let line;
    if(!S.solo)line=`${C.ic} Saison ${S.n.toLowerCase()} avec ${team} : ${res.w} V, ${res.d} N, ${res.l} D, ${res.rank}${res.rank===1?'er':'e'} sur ${C.teams}. ${cap(statTxt(j.sport,res.s1,res.s2,res.played))} en ${pl(res.played,'match','matchs')}.`;
    else if(j.sport==='tennis')line=`${C.ic} Saison de tennis : ${res.w} victoires pour ${res.l} défaites, ${pl(res.s1,'titre')}, classement mondial n° ${res.rank}.`;
    else line=`${C.ic} Saison cycliste : ${pl(res.w,'victoire')}, ${pl(res.d,'podium')}, ${res.l} autres classements.`;
    say(L,line);
    if(res.avail<.9&&res.avail>0)say(L,`Tu as manqué ${rd((1-res.avail)*12)} mois de compétition à cause de ta blessure.`);
    for(const t of res.titles){
      const star=res.share>=.35||S.solo;
      if(star){track(L,'trophies');j.tot.titles++;chg(L,{fame:R(3,8),happy:10});say(L,`🏆 Tu remportes ${t} !`)}
      else say(L,`🏆 Ton équipe remporte ${t}, mais tu as surtout vu la fête depuis le banc.`);
    }
    j.hist.push({age:L.age,team:S.solo?S.n:j.team,w:res.w,d:res.d,l:res.l,s1:res.s1,s2:res.s2,rank:res.rank,titles:res.titles.slice(),rating:res.rating,txt:statTxt(j.sport,res.s1,res.s2,res.played),played:res.played,lab:lab.join('|')});
    if(j.hist.length>20)j.hist.shift();
    const T=j.tot;T.g+=res.played;T.w+=res.w;T.d+=res.d;T.l+=res.l;T.s1+=res.s1;T.s2+=res.s2;
    j.perf=clamp(j.perf+(res.rating-j.perf)*.3+R(-4,4));
    chg(L,{fame:Math.round((res.rating-55)/12)+R(-1,2)});
    if(res.titles.length)earn(L,Math.round(sSalary(L)*.05*res.titles.length));
    j.works=(j.works||0)+1;
  }
  /* repos et vieillissement des qualités */
  j.fat=clamp(j.fat*.45+4+j.int*6-(j.attr.recup||50)/12);
  j.over=j.fat>70?clamp(j.over+12):clamp(j.over-9);
  for(const [k] of ATTRS){
    if(L.age<25)j.attr[k]=clamp(j.attr[k]+R(0,2));
    else if(L.age>=31&&k!=='technique'&&k!=='recup')j.attr[k]=clamp(j.attr[k]-R(0,3)*((L.age-30)/3)*(1-(j.attr.recup||50)/160));
  }
  if(L.age>=33&&chance(.4))chg(L,{health:-1});
  /* promotion et renvoi */
  const rating=res.rating,lvl=j.lvl;
  const okP=[j.y>=1&&rating>=52,j.y>=3&&rating>=62&&res.share>=.6,j.y>=4&&rating>=70&&((j.tot.titles||0)>=2||L.fame>=60)][lvl];
  if(lvl<3&&okP&&!res.skipped&&chance(.7)){
    j.lvl++;chg(L,{happy:10,fame:5});say(L,`📈 Tu deviens ${title(L).toLowerCase()} !`);
    if(j.lvl===3){track(L,'topCareer');say(L,'🏛️ Le public te surnomme déjà « la Légende ».')}
  }else if(lvl===0&&j.y>=4&&rating<45&&chance(.5)){
    say(L,'Le club ne renouvelle pas ton contrat : l’espoir s’est éteint.');L.job=null;chg(L,{happy:-10});return;
  }
  earn(L,sSalary(L));
  /* retraite */
  if(L.age>=35&&(L.age>=38||chance((L.age-34)*.25)||(L.age>=33&&rating<38&&chance(.4))))endCareer(L,j,'age');
}

/* --- Sélection / draft --- */
function elig(L,s){
  const C=CFG[s],a=L.age,ath=L.hid.athletic||0,he=L.st.health,
    tech=clamp(skillOf(L,'sport')+(C.lesson&&(L.skills[C.lesson]||0)>0?10:0)),men=((L.hid.discipline||0)+(L.hid.willpower||0))/2;
  const agePts=a>=16&&a<=23?20:a<=26?9:a<=29?3:0;
  const rows=[
    {n:'Âge',v:`${a} ans`,req:'16 à 23 ans',ok:a>=16&&a<=23,pts:agePts,max:20},
    {n:'Athlétisme',v:`${rd(ath)} %`,req:'55 % min.',ok:ath>=55,pts:ath*.3,max:30},
    {n:'Santé',v:`${rd(he)} %`,req:'60 % min.',ok:he>=60,pts:he*.15,max:15},
    {n:'Technique junior',v:`${rd(tech)} %`,req:'30 % min.',ok:tech>=30,pts:tech*.15,max:15},
    {n:'Mental',v:`${rd(men)} %`,req:'40 % min.',ok:men>=40,pts:men*.2,max:20}];
  return {rows,total:rows.reduce((s,r)=>s+r.pts,0)};
}
function eligHtml(L,s){
  const E=elig(L,s);
  const tr=E.rows.map(r=>`<tr><td>${esc(r.n)}</td><td>${esc(r.v)}</td><td>${esc(r.req)}</td><td>${r.ok?'✅':'❌'}</td></tr>`).join('');
  return `<p>${esc(L.age<18?'Le centre de formation étudie ton dossier :':'Les recruteurs étudient ton dossier :')}</p><table style="width:100%;font-size:.92em;text-align:left"><tr><th>Critère</th><th>Toi</th><th>Exigé</th><th></th></tr>${tr}</table><p><b>Score de sélection : ${rd(E.total)} / 100</b></p>`;
}
function applySport(L){
  modal({title:'Sportif pro',icon:'🏆',text:L.age<=23?'Quel sport veux-tu pratiquer à haut niveau ?':'Tu es déjà âgé pour un recrutement, mais un club peut encore te tester. Quel sport ?',
    choices:[...Object.entries(SPORTS).map(([s,S])=>({t:`${CFG[s]?CFG[s].ic:'🏅'} ${S.n}`,fn:()=>{
      if(!CFG[s])return out(L,'Ce sport n’est pas encore ouvert au recrutement.');
      modal({title:`Sélection · ${S.n}`,icon:CFG[s].ic,html:eligHtml(L,s),choices:[{t:'Passer l’épreuve',pri:1,fn:()=>trialSport(L,s)},{t:'Renoncer'}]});
    }})),{t:'Renoncer'}]});
}
function trialSport(L,s){
  const C=CFG[s],S=SPORTS[s],E=elig(L,s);
  const base=lim((E.total-42)/65,.03,.85);
  const go=(b,txt)=>{
    if(!chance(lim(base+b,.03,.92))){chg(L,{happy:-5});return out(L,`Refusé : ${S.n.toLowerCase()} pro, ce ne sera pas pour cette fois. ${txt}`)}
    const team=S.solo?null:pick(S.team);
    L.job={c:'sport',sp:1,v:2,sport:s,team,lvl:0,perf:R(45,65),y:0,works:0};L.retired=false;
    ensureSport(L);
    chg(L,{happy:12,fame:3,athletic:2});
    return out(L,`${C.ic} ${L.age<18?'Le centre de formation t’accueille':'Tu signes ton premier contrat'}${team?` avec ${team}`:''} : te voilà ${title(L).toLowerCase()} (${L.job.pos||S.n.toLowerCase()}).`);
  };
  const q=S.solo?(s==='tennis'?'Un coach réputé t’observe pendant un tournoi de qualification.':'Le directeur sportif t’emmène sur une sortie en peloton : il guette tes relances.'):'Le recruteur te regarde jouer un match d’essai, calepin à la main.';
  modal({title:`Épreuve · ${S.n}`,icon:C.ic,text:q,choices:[
    {t:'Tout donner physiquement',fn:()=>go(((L.hid.athletic||0)-50)/300,'Tu étais pourtant bien dans le rythme.')},
    {t:'Miser sur la technique',fn:()=>go((skillOf(L,'sport')-20)/250,'Le geste manquait de régularité.')},
    {t:'Rester discipliné et tactique',fn:()=>go(((L.hid.discipline||0)-50)/300+.02,'Trop prudent, peut-être.')},
    {t:'Tenter le geste spectaculaire',fn:()=>go(chance(.45)?.22:-.15,'Le geste n’a pas convaincu.')}]});
}

/* --- Panneaux sportifs --- */
function pTrain(){
  const L=cur(),j=ensureSport(L);if(!j)return {title:'Entraînement',html:note('Tu n’es plus sportif professionnel.')};
  const risk=rd(injRisk(L,j)*100);
  const rows=ATTRS.map(([k,ic,n])=>act(L,{ic,t:n,s:`${rd(j.attr[k])} %${k==='recup'?' · soulage la fatigue':''}`,key:'st_'+k,
    dis:j.inj&&k!=='recup'?`Blessé : ${j.inj.t}`:'',fn:L=>trainSess(L,k)}));
  rows.push(act(L,{ic:'🩺',t:'Rééducation intensive',s:j.inj?`${fmt(3000)} · réduit l’arrêt de deux mois`:'Aucune blessure à soigner',cost:3000,key:'st_reeduc',dis:j.inj?'':'Aucune blessure à soigner',
    fn:L=>{const jj=sjob(L);if(!jj||!jj.inj)return '';jj.inj.m=Math.max(0,jj.inj.m-2);let t=`Séances de balnéo et de renfo : ton arrêt raccourcit.`;if(chance(.12)){jj.inj.m+=2;t='Rechute à l’entraînement : la rééducation était trop pressée.'}if(jj.inj.m<=0){jj.inj=null;t+=' Tu es de nouveau apte !'}return out(L,t)}}));
  return {title:'Entraînement',html:card('Risque de blessure',`${risk} %`,'Âge, fatigue, surentraînement et intensité de la préparation')
    +statLine('Fatigue',j.fat)+statLine('Surentraînement',j.over)
    +(j.inj?note(`Blessure en cours : ${j.inj.t} (encore ${pl(Math.max(1,j.inj.m),'mois','mois')}).`):'')
    +group('Séances ciblées (une par an chacune)',rows)};
}
function trainSess(L,k){
  const j=ensureSport(L);if(!j)return '';
  let t;
  if(k==='recup'){
    j.fat=clamp(j.fat-25);j.over=clamp(j.over-12);j.attr.recup=clamp(j.attr.recup+R(2,5));chg(L,{health:1});
    if(j.inj){j.inj.m=Math.max(0,j.inj.m-1);if(j.inj.m<=0)j.inj=null}
    return out(L,pick(TRAIN_TXT.recup));
  }
  const g=R(3,7)*(L.age<22?1.3:L.age>31?.6:1)*(j.int===3?1.3:j.int===1?.75:1);
  j.attr[k]=clamp(j.attr[k]+g);j.fat=clamp(j.fat+8+j.int*5);
  if(j.fat>72)j.over=clamp(j.over+10);
  chg(L,{athletic:k==='technique'?0:1,health:k==='muscu'?0:1});
  t=pick(TRAIN_TXT[k]);
  if(chance(injRisk(L,j)*.28)){t+=' '+injure(L,j,'À l’entraînement')}
  return out(L,t);
}
function pBilan(){
  const L=cur(),j=ensureSport(L);if(!j)return {title:'Saisons',html:note('Pas de carrière en cours.')};
  const C=CFG[j.sport];
  const h=j.hist.slice().reverse().map(x=>row({ic:x.titles.length?'🏆':C.ic,t:`${x.age} ans · ${x.team}`,s:`${C.solo?(j.sport==='tennis'?`${x.w} V · ${x.l} D · n° ${x.rank}`:`${x.w} victoires · ${x.d} podiums`):`${x.w} V · ${x.d} N · ${x.l} D · ${x.rank}e`} · ${x.txt}${x.titles.length?' · '+x.titles.join(', '):''}`}));
  return {title:'Bilans de saison',html:h.length?group('Dernières saisons',h):note('Aucune saison jouée pour le moment. Le bilan s’écrit au passage à l’année suivante.')};
}
function pStats(){
  const L=cur(),j=ensureSport(L);if(!j)return {title:'Statistiques',html:note('Pas de carrière en cours.')};
  const T=j.tot,C=CFG[j.sport];
  return {title:'Statistiques de carrière',html:card('Palmarès',pl(T.titles||0,'titre'),`${fmtn(T.g)} ${C.solo?'matchs et courses':'matchs'} disputés`)
    +group('Totaux',[row({ic:'📈',t:'Bilan cumulé',s:j.sport==='velo'?`${T.w} victoires · ${T.d} podiums · ${T.l} autres`:`${T.w} V · ${T.d} N · ${T.l} D`}),row({ic:'🎯',t:'Statistiques',s:statTxt(j.sport,T.s1,T.s2,T.g)}),row({ic:'⭐',t:'Notoriété',s:`${L.fame} %`})])};
}
function sportPanel(L){
  const j=ensureSport(L);if(!j)return '';
  const C=CFG[j.sport],S=SPORTS[j.sport]||SPORTS.foot;
  const last=j.hist[j.hist.length-1];
  const rt=rd(ratingOf(L,j));
  let h=card(`${C.ic} ${S.n}${j.pos?' · '+j.pos:''}`,S.solo?'Circuit professionnel':j.team,last?`Dernière saison : ${last.txt}`:'Première saison à jouer',
    ATTRS.map(([k,,n])=>statLine(n,j.attr[k])).join('')+statLine('Niveau de jeu',rt));
  if(j.inj)h+=note(`🩹 Blessé : ${j.inj.t}, encore ${pl(Math.max(1,j.inj.m),'mois','mois')} d’indisponibilité.`);
  const rows=[
    nav('🏋️','Entraînement ciblé',`Risque de blessure : ${rd(injRisk(L,j)*100)} %`,pTrain),
    nav('📅','Bilans de saison',`${j.hist.length} saison${j.hist.length>1?'s':''} jouée${j.hist.length>1?'s':''}`,pBilan),
    nav('📊','Statistiques de carrière',`${pl(j.tot.titles||0,'titre')} au palmarès`,pStats),
    act(L,{ic:'🔥',t:`Intensité de la préparation : ${INTS[j.int-1].toLowerCase()}`,s:'Plus intense = plus de progrès, plus de risques',fn:L=>{const jj=sjob(L);if(!jj)return '';jj.int=jj.int%3+1;return out(L,`Tu règles ta préparation sur « ${INTS[jj.int-1].toLowerCase()} ».`)}}),
    act(L,{ic:'✍️',t:'Négocier une prolongation',key:'nego',fn:L=>{const jj=sjob(L);if(!jj)return '';if(chance(jj.perf/130)){chg(L,{fame:3});return out(L,'Contrat prolongé avec une belle revalorisation. Ton agent exulte.')}return out(L,'Les dirigeants ne veulent pas augmenter ton salaire.')}}),
    act(L,{ic:'🧢',t:j.sponsor?'Contrat de sponsoring en cours':'Chercher un sponsor',s:j.sponsor?'+15 % de revenus':'Équipementier ou marque de boisson',key:'sponsor',dis:j.sponsor?'Déjà sponsorisé':'',
      fn:L=>{const jj=sjob(L);if(!jj)return '';if(chance(.25+L.fame/200)){jj.sponsor=1;chg(L,{fame:2});return out(L,'🧢 Un équipementier te signe un contrat : ton visage sera sur les affiches.')}return out(L,'Les marques préfèrent un autre visage pour l’instant.')}})];
  if(!S.solo)rows.push(act(L,{ic:'🔁',t:'Demander un transfert',key:'transfert',fn:L=>{const jj=sjob(L);if(!jj)return '';const t=pick(S.team.filter(x=>x!==jj.team));jj.team=t;jj.tq=R(35,75);L.fame=clamp(L.fame+2);return out(L,`Transfert accepté : tu rejoins ${t}.`)}}));
  rows.push(act(L,{ic:'🏁',t:'Prendre sa retraite sportive',s:'Définitif',nav:confirmP('Retraite sportive','Veux-tu vraiment arrêter ta carrière ?',()=>{const L=cur(),jj=sjob(L);return jj?endCareer(L,jj,'age'):''},'Raccrocher')}));
  return h+group(`${S.n} · ${title(L)}`,rows);
}

/* ================= ASTRONAUTE ================= */
const DEST={
 iss:{n:'Station spatiale internationale',ic:'🛰️',nsc:1,pay:.25,fame:8,tele:[4,8],rad:4,lvl:1,note:50,art:.004},
 moon:{n:'Base lunaire',ic:'🌕',nsc:2,pay:.5,fame:25,tele:[8,14],rad:10,lvl:2,note:65,art:.03},
 mars:{n:'Mars',ic:'🔴',nsc:3,pay:.9,fame:40,tele:[14,24],rad:22,lvl:3,note:75,art:.06}};
const ASAL=[55000,85000,115000,160000];
/* [libellé, qualité, succès, échec] */
const SCEN=[
 {k:'depress',ic:'🌬️',t:'Dépressurisation',steps:[
  {x:'Une alarme retentit : la pression chute dans le module. Tes oreilles se bouchent et les écrans affichent « FUITE ».',c:[
   ['Chercher la fuite avec le détecteur à ultrasons',.9,'Tu repères un sifflement derrière un panneau.','Tu perds deux minutes précieuses à tâtonner.'],
   ['Fermer les écoutilles et appeler le sol',.6,'Le module est isolé, mais la fuite continue.','Le contrôle au sol met trop de temps à répondre.'],
   ['Enfiler ton casque et attendre les instructions',.3,'Par chance, le reste de l’équipage a eu le bon réflexe.','Pendant que tu attends, la pression continue de chuter.']]},
  {x:'La pression se stabilise un instant. Il faut maintenant sécuriser l’équipage.',c:[
   ['Rassembler tout le monde dans le module refuge',.9,'Tout le monde est à l’abri, comptage terminé.','Le comptage est chaotique : on perd du temps.'],
   ['Aider d’abord le plus novice à s’équiper',.6,'Il enfile sa combinaison en tremblant mais s’en sort.','Dans la confusion, tu oublies une écoutille ouverte.'],
   ['Foncer vers la fuite sans te protéger',.25,'Tu y arrives de justesse, le cœur battant.','Ton ombilical se coince : tu perds un temps fou.']]},
  {x:'Reste à colmater la brèche avant que les réserves d’air ne s’épuisent.',c:[
   ['Poser le patch d’urgence en suivant la procédure',.9,'Le patch tient : la pression remonte doucement.','Le patch est mal collé et se décolle une première fois.'],
   ['Improviser avec du ruban adhésif spatial',.55,'Le bricolage tient miraculeusement.','Le ruban se décolle sous la pression.'],
   ['Sacrifier le module et le fermer définitivement',.5,'Module sacrifié, équipage sain et sauf.','La fermeture force un repli dans un état de stress extrême.']]}]},
 {k:'solar',ic:'☀️',t:'Tempête solaire',steps:[
  {x:'Le centre de météo spatiale annonce une éruption solaire majeure : le rayonnement va exploser dans quelques heures.',c:[
   ['Rejoindre sans attendre l’abri blindé de la station',.9,'Tu es à l’abri bien avant le pic.','Tu mets du temps à rejoindre l’abri.'],
   ['Finir d’abord l’expérience en cours',.4,'Tu termines juste à temps, soulagé.','Le chrono tourne : tu t’exposes un peu trop.'],
   ['Demander au sol de confirmer l’alerte',.55,'Le sol confirme et te donne l’itinéraire le plus sûr.','La confirmation arrive trop tard.']]},
  {x:'À l’abri, il faut protéger l’électronique de bord et les expériences sensibles.',c:[
   ['Couper les systèmes non essentiels, un par un',.9,'Tous les systèmes critiques sont mis en veille propre.','Tu en oublies un : une alarme grésille.'],
   ['Tout éteindre d’un coup',.5,'Le redémarrage sera pénible mais tout est sauf.','Une surcharge grille un ordinateur secondaire.'],
   ['Garder tout allumé pour surveiller',.25,'Tu as de la chance : rien ne casse.','Plusieurs capteurs saturent et lâchent.']]},
  {x:'Le rayonnement atteint son pic. Le plus dur : patienter dans l’abri avec l’équipage.',c:[
   ['Faire un point calme avec tout le monde',.9,'Tout l’équipage reste serein.','Le moral flanche malgré tout.'],
   ['Lancer une partie de cartes en apesanteur',.65,'Le fou rire détend l’atmosphère.','La partie vire à la dispute.'],
   ['Rester silencieux dans ton coin',.35,'Tu t’en sors, plus seul que jamais.','L’angoisse te ronge et se voit.']]}]},
 {k:'thruster',ic:'🔧',t:'Panne de propulseur',steps:[
  {x:'Un propulseur d’orientation tombe en panne : le vaisseau commence à dériver doucement.',c:[
   ['Lancer le diagnostic complet',.9,'Le diagnostic isole la vanne défectueuse.','Le diagnostic prend un temps précieux.'],
   ['Basculer sur le propulseur de secours',.65,'Le secours démarre, la dérive s’arrête.','Le secours démarre mal et chauffe.'],
   ['Redémarrer tout le système à l’aveugle',.3,'Contre toute attente, ça repart.','Le redémarrage aggrave la dérive.']]},
  {x:'La trajectoire doit être corrigée à la main avant la fenêtre d’approche.',c:[
   ['Calculer la poussée avec le simulateur du bord',.9,'Tes calculs sont justes au dixième de degré près.','Un décimal mal placé te fait perdre un peu de carburant.'],
   ['Suivre les consignes du centre de contrôle',.7,'Le sol te guide pas à pas, avec un léger décalage.','Les consignes arrivent avec du retard.'],
   ['Piloter au jugé, manette en main',.3,'Ton instinct de pilote fait des merveilles.','Tu corriges trop fort et recommences.']]},
  {x:'La manœuvre finale est engagée. Tout dépend du moindre geste.',c:[
   ['Exécuter la séquence automatique en surveillant',.85,'Allumage parfait.','L’allumage est un peu brutal.'],
   ['Reprendre les commandes en manuel',.5,'Beau geste de pilote : trajectoire parfaite.','Tu dépasses la cible et corriges en urgence.'],
   ['Reporter la manœuvre d’une orbite',.55,'La prudence paie : tu reprends ton souffle.','Ce délai t’épuise et consomme des réserves.']]}]},
 {k:'eva',ic:'👨‍🚀',t:'Sortie extravéhiculaire',steps:[
  {x:'Sortie dans le vide pour réparer un panneau solaire. Dernière vérification avant d’ouvrir le sas.',c:[
   ['Refaire toute la liste de contrôle à haute voix',.9,'Tout est carré : étanchéité, oxygène, longes.','La vérification est bâclée à cause du stress.'],
   ['Faire confiance à ton binôme',.6,'Il avait tout vérifié, comme toujours.','Un joint est mal serré : petite alerte.'],
   ['Sortir vite pour gagner du temps',.25,'Tout se passe bien, ouf.','Une fuite d’air fait tinter ton casque.']]},
  {x:'Dehors, un outil t’échappe des mains et file vers l’infini.',c:[
   ['Le laisser partir et continuer avec l’autre',.9,'Tu gardes ton sang-froid.','Tu perds la concentration et ralentis.'],
   ['Tendre le bras pour le rattraper',.45,'Tu l’attrapes au vol, applaudissements au sol.','Tu perds l’équilibre quelques secondes.'],
   ['Détacher ta longe pour le récupérer',.1,'Tu t’en tires sans y croire.','Tu te retrouves à flotter loin de la structure.']]},
  {x:'Le soleil se couche dans trois minutes. Il faut rentrer.',c:[
   ['Revenir par le chemin le plus court',.9,'Tu rentres au sas avec de la marge.','Le chemin est plus long que prévu.'],
   ['Terminer la dernière soudure d’abord',.5,'Soudure finie, juste avant la nuit.','La nuit tombe : tes lampes s’épuisent.'],
   ['Demander à ton binôme de te tracter',.65,'Une corde et deux bras : retour express.','Le remorquage tourne au ballet maladroit.']]}]}];

function ajob(L){return L.job&&L.job.c==='astro'?L.job:null}
function astx(L){
  const A=L.astx&&typeof L.astx==='object'?L.astx:(L.astx={});
  if(typeof A.tele!=='number')A.tele=0;
  for(const k of ['msn','pubs'])if(!Array.isArray(A[k]))A[k]=[];
  for(const k of ['artifact','iss','moon','mars'])if(typeof A[k]!=='number')A[k]=0;
  return A;
}
function ensureAstro(L){
  const j=ajob(L);if(!j)return null;
  if(j.v!==2){
    j.v=2;j.lvl=[0,1,3][lim(j.lvl||0,0,2)];
    const base=typeof j.perf==='number'?j.perf:50;
    j.ind={fit:clamp(L.st.health-8+R(-5,5)),sim:clamp(base+R(-10,10)),sci:clamp(L.st.smarts-8+R(-5,5))};
  }
  if(!j.ind||typeof j.ind!=='object')j.ind={fit:R(60,80),sim:R(50,70),sci:R(60,80)};
  for(const k of ['fit','sim','sci'])if(typeof j.ind[k]!=='number')j.ind[k]=R(50,75);
  for(const k of ['y','away','rad','last','works'])if(typeof j[k]!=='number')j[k]=0;
  j.perf=agNote(j);astx(L);
  return j;
}
function agNote(j){return clamp(j.ind.fit*.3+j.ind.sim*.35+j.ind.sci*.35)}
function aSalary(L){
  const j=L.job;if(!j)return 0;
  return rd(ASAL[lim(j.lvl||0,0,3)]*(1+L.fame/400)*(j.away>0?1.25:1));
}

/* --- Sélection --- */
function applyAstro(L){
  let sc=0;const d={n:0};
  const fin=()=>{
    const p=lim(.1+(L.st.smarts-75)/80+(L.st.health-80)/80+sc,.04,.92);
    if(!chance(p)){chg(L,{happy:-6});return out(L,'Refusé : l’agence spatiale ne te retient pas cette année. La sélection est impitoyable.')}
    L.job={c:'astro',sp:1,v:2,lvl:0,perf:R(45,65),y:0,works:0,away:0,rad:0,last:0,
      ind:{fit:clamp(L.st.health-8+R(-4,4)),sim:R(40,60),sci:clamp(L.st.smarts-8+R(-4,4))}};
    L.retired=false;ensureAstro(L);chg(L,{happy:15,fame:3});
    return out(L,`🚀 Sélectionné${ge(L,'','e')} parmi des milliers de candidats : te voilà ${title(L).toLowerCase()} !`);
  };
  const step=(ttl,txt,ch)=>{modal({title:ttl,icon:'🚀',text:txt,choices:ch.map(([t,b,f])=>({t,fn:()=>{sc+=b;return f()}}))})};
  step('Sélection · Centrifugeuse','Première épreuve : la centrifugeuse monte à huit g. Ta vision se rétrécit.',[
    ['Serrer les dents et respirer en rythme',.07,()=>step('Sélection · Entretien','Psychologues et ingénieurs te reçoivent. « Que ferais-tu si votre binôme paniquait en pleine mission ? »',[
      ['Le rassurer, puis reprendre la checklist',.08,()=>simu()],['Prendre les commandes à sa place',-.03,()=>simu()],['Plaisanter pour détendre l’atmosphère',.03,()=>simu()]])],
    ['Fermer les yeux et attendre que ça passe',-.02,()=>step('Sélection · Entretien','Le jury t’interroge sur ton goût du risque.',[
      ['Parler de rigueur et de procédures',.07,()=>simu()],['Parler de passion pour l’inconnu',.03,()=>simu()],['Rester évasif',-.04,()=>simu()]])],
    ['Tenter de lire les instruments pendant le test',.02,()=>step('Sélection · Entretien','Le jury t’observe : « Pourquoi voulez-vous partir ? »',[
      ['Pour la science, évidemment',.06,()=>simu()],['Pour le rêve d’enfant',.04,()=>simu()],['Pour la gloire',-.06,()=>simu()]])]]);
  function simu(){
    modal({title:'Sélection · Simulateur',icon:'🚀',text:'Dernière épreuve : une panne simulée en plein arrimage avec la station.',choices:[
      {t:'Suivre la procédure à la lettre',fn:()=>{sc+=.07;return fin()}},
      {t:'Improviser avec ton instinct de pilote',fn:()=>{sc+=chance(.5)?.14:-.08;return fin()}},
      {t:'Demander conseil à l’instructeur',fn:()=>{sc+=.02;return fin()}}]});
  }
}

/* --- Scénarios de survie --- */
function runScen(L,sc,done,fails,i,prev){
  const j=ajob(L);if(!j){return}
  const note=agNote(j),st=sc.steps[i];
  const html=(prev?`<p><em>${esc(prev)}</em></p>`:'')+`<p><b>Étape ${i+1} sur ${sc.steps.length}</b></p><p>${esc(st.x)}</p>`;
  modal({title:sc.t,icon:sc.ic,html,choices:shuffle(st.c).map(([t,q,ok,ko])=>({t,fn:()=>{
    const p=lim(q*(.55+note/200)+.05+(j.cal||0),.08,.97);const good=chance(p);
    const f=fails+(good?0:1),msg=good?ok:ko;
    if(i+1<sc.steps.length)runScen(L,sc,done,f,i+1,msg);else done(f,msg);
    return '';
  }}))});
}
function mission(L,d){
  const j=ensureAstro(L);if(!j)return '';
  const D=DEST[d];j.last=L.age;if(d==='mars')j.away=1;
  const list=shuffle(SCEN).slice(0,D.nsc),acc={f:0,s:0,prev:''};
  const next=k=>{
    if(k>=list.length)return conclude(L,d,acc);
    runScen(L,list[k],(f,msg)=>{acc.f+=f;acc.s+=list[k].steps.length;acc.prev=msg;next(k+1)},0,0,acc.prev);
  };
  modal({title:`${D.n} · décollage`,icon:'🚀',text:`Compte à rebours en cours pour ${D.n.toLowerCase()}. Les moteurs grondent sous ton siège, la capsule vibre. Comment te prépares-tu ?`,choices:[
    {t:'Respirer calmement et fermer les yeux',fn:()=>{j.cal=.04;next(0);return ''}},
    {t:'Relire une dernière fois ta checklist',fn:()=>{j.cal=.03;next(0);return ''}},
    {t:'Plaisanter avec ton équipage pour détendre l’ambiance',fn:()=>{j.cal=.02;next(0);return ''}}]});
  return '';
}
function conclude(L,d,acc){
  const j=ajob(L);if(!j)return '';
  const A=astx(L),D=DEST[d],note=agNote(j),ratio=acc.f/Math.max(1,acc.s);
  j.cal=0;
  if(ratio>=.6&&chance(.4*(1.3-note/100))){
    L.st.health=0;A.msn.push({d,age:L.age,r:'perdu'});
    modal({title:'Mission perdue',icon:'💥',text:`${acc.prev} Malgré les efforts de l’équipage, la mission tourne à la catastrophe. Le monde entier retient son souffle.`,choices:[{t:'Continuer'}]});
    return out(L,`💥 Une avarie critique survient pendant la mission (${D.n.toLowerCase()}).`);
  }
  const rf=ratio<.2?1:ratio<.45?.75:.4;
  const q=ratio<.2?'réussie avec brio':ratio<.45?'accomplie malgré quelques frayeurs':'écourtée, après des heures éprouvantes';
  const pay=rd(aSalary(L)*D.pay*rf),tele=rd(R(D.tele[0],D.tele[1])*rf);
  earn(L,pay);A.tele+=tele;A.msn.push({d,age:L.age,r:q});A[d]=(A[d]||0)+1;
  chg(L,{fame:rd(D.fame*rf),happy:rd(15*rf)-(ratio>=.45?6:0),health:-R(1,3)-(ratio>=.45?R(3,8):0)});
  j.rad=lim(j.rad+D.rad,0,100);j.ind.sim=clamp(j.ind.sim+(ratio<.45?4:1));j.ind.fit=clamp(j.ind.fit-R(2,6));j.works=(j.works||0)+1;
  track(L,'space');if(d==='moon'||d==='mars')track(L,'moon');
  let t=ratio<.2?(d==='mars'?'🔴 Tu poses le pied sur Mars. L’humanité entière te regarde.':d==='moon'?'🌕 Tu marches sur la Lune. Un petit pas pour toi, un grand pour ton compte en banque.':'🛰️ Six mois à bord de la station. La Terre est si belle depuis la coupole.'):`Mission ${q}.`;
  t+=` Prime : ${fmt(pay)}. Télémétrie récoltée : ${tele}.`;
  const art=ratio<.45&&!A.artifact&&chance(D.art*(.5+note/100));
  modal({title:`Retour de mission · ${D.n}`,icon:D.ic,html:`<p><em>${esc(acc.prev)}</em></p><p>${esc(`Mission ${q}.`)}</p><p>${esc(`Prime de ${fmt(pay)}, ${tele} unités de télémétrie à exploiter.`)}</p>`,choices:[{t:'Continuer',fn:()=>{if(art)artifact(L,d);return ''}}]});
  return out(L,t);
}

/* --- Artefact extraterrestre --- */
function artifact(L,d){
  const A=astx(L);if(A.artifact)return;
  const where=d==='mars'?'dans une fissure du plateau martien':d==='moon'?'au fond d’un cratère lunaire à l’ombre éternelle':'accroché à la coque de la station';
  const fin=(fame,money,karma,txt)=>{
    A.artifact=1;A.tele+=30;track(L,'artifact');chg(L,{fame,karma,happy:25});earn(L,money,1);
    return out(L,`👽 ${txt} Notoriété ${fame>0?'+':''}${fame}, ${fmt(money)} de droits et de reportages.`);
  };
  modal({title:'Découverte',icon:'👽',text:`Au cours d’une sortie, ${where}, ta lampe éclaire un fragment métallique lisse, tiède au toucher, couvert de motifs qui ne figurent dans aucun catalogue. Ton cœur s’emballe.`,choices:[
    {t:'Le signaler immédiatement au centre de contrôle',pri:1,fn:()=>fin(55,R(700000,1300000),4,'La communauté scientifique mondiale se mobilise autour de ta découverte : l’histoire retiendra ton nom.')},
    {t:'Le photographier puis le prélever avec soin',fn:()=>fin(48,R(900000,1500000),2,'Ton échantillon est examiné dans les laboratoires les plus sophistiqués de la planète.')},
    {t:'Le garder secret quelques heures',danger:1,fn:()=>{
      if(chance(.45)){return fin(32,R(300000,700000),-6,'L’affaire fuite dans la presse : on te reproche ton silence, mais l’objet reste fascinant.')}
      return fin(52,R(800000,1400000),-3,'Tu avertis finalement le sol, avec quelques heures de retard, et personne n’ose t’en vouloir.')}}]});
}

/* --- Publications --- */
const TIERS=[{n:'Revue régionale d’ingénierie',mod:18,fame:2,grant:[3000,6000]},{n:'Revue internationale à comité de lecture',mod:0,fame:5,grant:[6000,12000]},{n:'Nature Cosmos, la grande revue',mod:-18,fame:12,grant:[12000,25000]}];
const REVIEW_OK=['Données de télémétrie convaincantes, méthode rigoureuse.','Article clair, conclusions solides.','Une contribution précieuse au domaine.'];
const REVIEW_MAJ=['Statistiques à reprendre, mais le sujet est prometteur.','Les barres d’erreur sont trop optimistes.','Une section entière à réécrire.'];
const REVIEW_KO=['Échantillon trop mince pour conclure.','Les résultats sont déjà connus.','Le relecteur 2 voulait une autre figure et n’a pas aimé la tienne.'];
function hIdx(A){const c=A.pubs.map(p=>p.cit||0).sort((a,b)=>b-a);let h=0;c.forEach((v,i)=>{if(v>=i+1)h=i+1});return h}
function pubStart(L){
  const A=astx(L),j=ajob(L);if(!j)return '';
  const topics=[['Physiologie en microgravité',0,8],['Météorologie solaire',0,8],['Matériaux en vide spatial',0,8],['Systèmes de support vie',0,8]];
  if(A.moon>0)topics.push(['Géologie lunaire',4,10]);
  if(A.mars>0)topics.push(['Géologie martienne',6,12]);
  if(A.artifact)topics.push(['Analyse d’un artefact inconnu',25,20]);
  modal({title:'Nouvelle publication',icon:'📄',text:`Télémétrie disponible : ${A.tele}. Quel sujet traiter ?`,choices:[...topics.map(([n,b,c])=>({t:`${n} (${c} unités)`,fn:()=>{
    if(A.tele<c)return out(L,'Pas assez de télémétrie exploitable pour ce sujet.');
    modal({title:'Quelle revue ?',icon:'📄',text:'Les grandes revues rejettent plus souvent, mais rapportent davantage.',choices:[...TIERS.map((T,ti)=>({t:T.n,fn:()=>{
      A.tele-=c;j.pubDone=L.age;
      const Q=j.ind.sci*.5+Math.min(30,A.tele*1.2+c)+b+T.mod+R(-12,12);
      review(L,n,ti,Q,false);return '';
    }})),{t:'Annuler'}]});return '';
  }})),{t:'Annuler'}]});
  return '';
}
function review(L,topic,ti,Q,retry){
  const A=astx(L),T=TIERS[ti];
  const vs=[0,1,2].map(()=>Q+R(-15,15)+(retry?8:0));
  const acc=vs.filter(v=>v>=60).length,maj=vs.filter(v=>v>=40&&v<60).length;
  const html=vs.map((v,i)=>`<p><b>Relecteur ${i+1}</b> · ${v>=60?'accepte':v>=40?'demande des corrections majeures':'rejette'} : ${esc(pick(v>=60?REVIEW_OK:v>=40?REVIEW_MAJ:REVIEW_KO))}</p>`).join('');
  if(acc>=2){
    const g=R(T.grant[0],T.grant[1]);
    A.pubs.push({t:topic,rev:T.n,age:L.age,cit:0,tier:ti});earn(L,g,1);track(L,'publications');
    const j=ajob(L);if(j)j.ind.sci=clamp(j.ind.sci+R(2,5));chg(L,{fame:T.fame,happy:8,smarts:1});
    modal({title:'Évaluation par les pairs',icon:'📄',html:html+`<p><b>Accepté !</b> Ton article « ${esc(topic)} » paraît dans ${esc(T.n)}. Prime de recherche : ${esc(fmt(g))}.</p>`,choices:[{t:'Continuer'}]});
    return out(L,`📄 Publication acceptée dans ${T.n} : « ${topic} ».`);
  }
  if(acc+maj>=2&&A.tele>=3){
    modal({title:'Évaluation par les pairs',icon:'📄',html:html+'<p>Les relecteurs veulent des corrections majeures avant de décider.</p>',choices:[
      {t:'Réviser et resoumettre (3 unités de télémétrie)',pri:1,fn:()=>{A.tele-=3;review(L,topic,ti,Q+6,true);return ''}},
      {t:'Retirer l’article',fn:()=>out(L,'Tu retires ton article, à contrecœur.')}]});
    return '';
  }
  chg(L,{happy:-4});
  modal({title:'Évaluation par les pairs',icon:'📄',html:html+'<p><b>Rejeté.</b> Ce sera pour la prochaine fois.</p>',choices:[{t:'Continuer'}]});
  return out(L,`📄 Ton article « ${topic} » est rejeté par ${T.n}.`);
}
function pPubs(){
  const L=cur(),A=astx(L),j=ensureAstro(L);
  const rows=A.pubs.slice().reverse().map(p=>row({ic:'📄',t:p.t,s:`${p.rev} · ${p.age} ans · ${pl(p.cit||0,'citation')}`}));
  return {title:'Publications',html:card('Télémétrie à exploiter',String(A.tele),'Récoltée en mission, elle sert à nourrir tes articles')
    +card('Impact scientifique',`h = ${hIdx(A)}`,`${pl(A.pubs.length,'publication')} · ${pl(A.pubs.reduce((s,p)=>s+(p.cit||0),0),'citation')}`)
    +group('',[act(L,{ic:'✍️',t:'Rédiger une publication',s:'Évaluée par les pairs',key:'a_pub',dis:!j?'Plus en activité':A.tele<8?'Il faut au moins 8 unités de télémétrie':'',fn:L=>pubStart(L)})])
    +(rows.length?group('Tes articles',rows):note('Aucune publication pour le moment.'))};
}
function pMissions(){
  const L=cur(),A=astx(L);
  const rows=A.msn.slice().reverse().map(m=>row({ic:DEST[m.d]?DEST[m.d].ic:'🚀',t:DEST[m.d]?DEST[m.d].n:'Mission',s:`${m.age} ans · ${m.r}`}));
  return {title:'Journal de missions',html:rows.length?group('Missions',rows):note('Aucune mission pour le moment.')};
}
function astroPanel(L){
  const j=ensureAstro(L);if(!j)return '';
  const A=astx(L),note0=agNote(j);
  const h=card('Agence spatiale',`Note de l’agence : ${note0} / 100`,`${pl(A.msn.length,'mission')} · radiations ${rd(j.rad)} %`,
    statLine('Condition physique',j.ind.fit)+statLine('Simulateur',j.ind.sim)+statLine('Sciences',j.ind.sci));
  const tr=[
    act(L,{ic:'🌀',t:'Entraînement en centrifugeuse',s:'Condition physique',key:'a_fit',fn:L=>{const jj=ajob(L);if(!jj)return '';jj.ind.fit=clamp(jj.ind.fit+R(4,9));chg(L,{health:2});return out(L,pick(['Huit g dans la centrifugeuse : tu tiens bon.','Tapis, vélo et gainage : l’espace aime les corps solides.']))}}),
    act(L,{ic:'🕹️',t:'Séance de simulateur',s:'Pilotage et procédures',key:'a_sim',fn:L=>{const jj=ajob(L);if(!jj)return '';jj.ind.sim=clamp(jj.ind.sim+R(4,9));return out(L,pick(['Tu rejoues l’arrimage dix fois, jusqu’à ce que ça devienne un réflexe.','Panne simulée sur panne simulée : l’instructeur est sadique.']))}}),
    act(L,{ic:'🔬',t:'Études scientifiques',s:'Sciences et intelligence',key:'a_sci',fn:L=>{const jj=ajob(L);if(!jj)return '';jj.ind.sci=clamp(jj.ind.sci+R(4,9));chg(L,{smarts:1});return out(L,pick(['Tu révises la mécanique orbitale jusque tard dans la nuit.','Cours de géologie planétaire avec un chercheur du CNES.']))}}),
    act(L,{ic:'🏊',t:'Piscine de flottabilité neutre',s:'Entraînement aux sorties dans le vide',key:'a_eva',fn:L=>{const jj=ajob(L);if(!jj)return '';jj.ind.sim=clamp(jj.ind.sim+R(2,5));jj.ind.fit=clamp(jj.ind.fit+R(2,5));return out(L,'Six heures en combinaison au fond de la piscine : tu comprends enfin le mot « effort ».')}})];
  const ms=[];
  const dest=Object.entries(DEST).filter(([,D])=>j.lvl>=D.lvl&&note0>=D.note).map(([k])=>k);
  const why=j.lvl<1?'Il faut d’abord être Pilote':j.last===L.age?'Déjà parti cette année':j.away>0?'Encore en transit lointain':!dest.length?'Note de l’agence insuffisante':'';
  ms.push(act(L,{ic:'🚀',t:'Partir en mission',s:why||`Destinations ouvertes : ${dest.map(k=>DEST[k].n.toLowerCase()).join(', ')}`,dis:why,fn:L=>{
    const jj=ensureAstro(L);if(!jj)return '';
    modal({title:'Mission spatiale',icon:'🚀',text:'Où pars-tu ?',choices:[...Object.entries(DEST).map(([k,D])=>({t:`${D.ic} ${D.n}${jj.lvl>=D.lvl&&agNote(jj)>=D.note?'':' (non qualifié)'}`,fn:()=>{
      if(jj.lvl<D.lvl||agNote(jj)<D.note)return out(L,'Tu n’es pas encore qualifié pour cette destination.');
      return mission(L,k);
    }})),{t:'Annuler'}]});return '';}}));
  ms.push(nav('📄','Publications',`${pl(A.pubs.length,'article')} · télémétrie ${A.tele}`,pPubs));
  ms.push(nav('📓','Journal de missions',`${pl(A.msn.length,'mission')}`,pMissions));
  if(A.artifact)ms.push(row({ic:'👽',t:'Artefact extraterrestre',s:'Tu as changé l’histoire de l’humanité.'}));
  return h+group('Entraînement',tr)+group(`Astronaute · ${title(L)}`,ms);
}
function astroYear(L){
  const j=ensureAstro(L);if(!j)return;
  const A=astx(L);
  j.ind.fit=clamp(j.ind.fit-R(1,3)-(L.age>45?R(0,2):0));j.ind.sim=clamp(j.ind.sim-R(0,2));j.ind.sci=clamp(j.ind.sci-R(0,1));
  j.perf=agNote(j);
  if(j.away>0)j.away--;
  if(j.rad>0)j.rad=Math.max(0,j.rad-2);
  if(j.rad>70&&chance(.5)){chg(L,{health:-R(1,3)});say(L,'☢️ Tes années de rayonnement cosmique commencent à se payer.')}
  for(const p of A.pubs)p.cit=(p.cit||0)+R(0,3+(p.tier||0)*4);
  if(A.pubs.length>0&&chance(.2))say(L,`📄 Tes publications sont citées ${pl(A.pubs.reduce((s,p)=>s+(p.cit||0),0),'fois')} au total.`);
  const note=j.perf,ms=A.msn.filter(m=>m.r!=='perdu').length;
  const ok=[j.y>=2&&note>=60,ms>=2&&note>=68&&j.y>=5,(A.moon+A.mars)>=1&&note>=75&&j.y>=8][j.lvl];
  if(j.lvl<3&&ok&&chance(.75)){
    j.lvl++;chg(L,{happy:10,fame:4});say(L,`📈 Tu deviens ${title(L).toLowerCase()} !`);
    if(j.lvl===3)track(L,'topCareer');
  }else if(note<35&&j.y>=3&&chance(.4)){
    say(L,'L’agence te radie du corps des astronautes : tes résultats sont trop faibles.');L.job=null;chg(L,{happy:-15});return;
  }
  earn(L,aSalary(L));
  if(L.age>=58&&(L.age>=62||chance((L.age-57)*.2)))retire(L);
}

/* ================= Évènements JSON ================= */
const effects={
  buzz(L,a){
    const j=sjob(L);if(!j)return '';
    const f=(a&&a.fame)|0;chg(L,{fame:f});j.perf=clamp(j.perf+((a&&a.perf)|0));
    return a&&a.text?a.text:'';
  },
  sponsor(L){
    const j=ensureSport(L);if(!j)return '';
    if(j.sponsor)return 'Tu étais déjà sponsorisé : la marque te propose un bonus de fidélité.';
    j.sponsor=1;chg(L,{fame:3});return 'Le contrat de sponsoring te rapporte 15 % de revenus en plus.';
  },
  tune(L,a){
    const j=ensureSport(L);if(!j)return '';
    const k=(a&&a.attr)||'technique';j.attr[k]=clamp(j.attr[k]+((a&&a.n)|0));return '';
  },
  tele(L,a){
    const j=ajob(L);if(!j)return '';
    const A=astx(L);A.tele+=(a&&a.n)|0;
    if(a&&a.sci)j.ind.sci=clamp(j.ind.sci+a.sci);
    return '';
  }
};
const conds={
  isSport(L){return !!sjob(L)},
  isAstro(L){return !!ajob(L)},
  starSport(L){const j=sjob(L);return !!j&&(j.lvl||0)>=1},
  flyer(L){const j=ajob(L);return !!j&&(j.lvl||0)>=1}
};
const eventsDb=[
 {id:'athlete_astro_presse',category:'career_event',icon:'🎙️',probability_weight:.12,
  conditions:{min_age:16,mod_cond:{mod:MOD,fn:'isSport'}},
  prompt_text:'À la sortie du match, un journaliste de la presse sportive te tend son micro devant les caméras : « Alors, ce résultat ? »',
  choices:[
   {choice_text:'Rester humble et saluer tes coéquipiers',consequences:{karma_modifier:2,happiness_modifier:2,mod_effect:{mod:MOD,fn:'buzz',args:{fame:2,perf:2}},result_text:'Les supporters adorent ton humilité.'}},
   {choice_text:'Lancer une petite polémique sur l’arbitrage',consequences:{karma_modifier:-3,happiness_modifier:-1,mod_effect:{mod:MOD,fn:'buzz',args:{fame:6,perf:-2}},result_text:'Les réseaux s’enflamment, ton club s’agace.'}},
   {choice_text:'Dédier la victoire à ta grand-mère',consequences:{happiness_modifier:4,mod_effect:{mod:MOD,fn:'buzz',args:{fame:3}},result_text:'Tout le pays a la larme à l’œil.'}}]},
 {id:'athlete_astro_sponsor',category:'career_event',icon:'🧢',probability_weight:.08,once:true,
  conditions:{min_age:17,mod_cond:{mod:MOD,fn:'starSport'}},
  prompt_text:'Un équipementier propose de t’associer à sa nouvelle campagne publicitaire.',
  choices:[
   {choice_text:'Signer pour la campagne',consequences:{mod_effect:{mod:MOD,fn:'sponsor'},fame_modifier:2}},
   {choice_text:'Refuser, tu préfères rester concentré sur le terrain',consequences:{karma_modifier:2,discipline_modifier:3,result_text:'Ton agent lève les yeux au ciel, ton coach sourit.'}},
   {choice_text:'Exiger un cachet doublé',consequences:{bank_balance_modifier:[10000,60000],karma_modifier:-1,result_text:'La marque grince des dents, puis accepte.'}}]},
 {id:'athlete_astro_coach',category:'career_event',icon:'📋',probability_weight:.1,
  conditions:{min_age:16,mod_cond:{mod:MOD,fn:'isSport'}},
  prompt_text:'Un nouveau préparateur physique débarque, sifflet autour du cou, avec des méthodes qui font grincer les genoux.',
  choices:[
   {choice_text:'Suivre son plan à la lettre',consequences:{stress_level_increment:4,mod_effect:{mod:MOD,fn:'tune',args:{attr:'cardio',n:4}},result_text:'Tu souffres, mais ton cardio décolle.'}},
   {choice_text:'Adapter le plan à ton corps',consequences:{happiness_modifier:2,mod_effect:{mod:MOD,fn:'tune',args:{attr:'recup',n:3}},result_text:'Un compromis intelligent, ton corps te remercie.'}},
   {choice_text:'Faire la sourde oreille',consequences:{job_performance_modifier:-3,happiness_modifier:1}}]},
 {id:'athlete_astro_ecole',category:'career_event',icon:'🏫',probability_weight:.12,
  conditions:{min_age:24,mod_cond:{mod:MOD,fn:'isAstro'}},
  prompt_text:'Une classe de CM2 t’invite à parler du métier d’astronaute. Un petit lève la main : « C’est vrai qu’on mange de la nourriture en tube ? »',
  choices:[
   {choice_text:'Répondre avec humour et sérieux',consequences:{happiness_modifier:5,karma_modifier:3,fame_modifier:1,result_text:'Les enfants veulent tous partir dans l’espace.'}},
   {choice_text:'Montrer un tube de purée en apesanteur simulée',consequences:{happiness_modifier:4,fame_modifier:2,result_text:'La classe est en délire : un beau coup de com’.'}},
   {choice_text:'Décliner, tu as trop de travail',consequences:{karma_modifier:-1,stress_level_increment:2}}]},
 {id:'athlete_astro_signal',category:'career_event',icon:'📡',probability_weight:.1,
  conditions:{min_age:24,mod_cond:{mod:MOD,fn:'flyer'}},
  prompt_text:'Depuis le centre de contrôle, un ingénieur t’appelle : une rafale de données inhabituelle vient d’arriver de la dernière mission.',
  choices:[
   {choice_text:'Passer la nuit à les analyser',consequences:{stress_level_increment:3,mod_effect:{mod:MOD,fn:'tele',args:{n:5,sci:2}},result_text:'Tu découvres un motif fascinant dans les mesures.'}},
   {choice_text:'Transmettre aux chercheurs et dormir',consequences:{happiness_modifier:2,mod_effect:{mod:MOD,fn:'tele',args:{n:2}},result_text:'Les chercheurs te remercient dès le lendemain.'}},
   {choice_text:'Ignorer, tu as déjà trop de dossiers',consequences:{job_performance_modifier:-2}}]},
 {id:'athlete_astro_enfant',category:'career_event',icon:'🔭',probability_weight:.06,once:true,
  conditions:{min_age:24,mod_cond:{mod:MOD,fn:'isAstro'}},
  prompt_text:'Un petit garçon du quartier te demande un autographe, une étoile dessinée au feutre sur sa casquette.',
  choices:[
   {choice_text:'Signer et lui offrir ton badge de mission',consequences:{karma_modifier:5,happiness_modifier:6,result_text:'Il court l’annoncer à toute la rue.'}},
   {choice_text:'Signer rapidement et filer',consequences:{karma_modifier:1}}]}
];

/* ================= Enregistrement ================= */
registerMod({
  id:MOD,
  special:{
   sport:{n:'Sportif pro',ic:'🏆',desc:'Draft, entraînement, blessures, saisons et Hall of Fame',ladder:['Espoir','Titulaire','Capitaine','Légende'],
     req:{age:16,maxAge:23,health:60},apply:L=>applySport(L),year:L=>sportYear(L),salary:L=>sSalary(L),panel:L=>sportPanel(L)},
   astro:{n:'Astronaute',ic:'🚀',desc:'Missions vers la station, la Lune et Mars',ladder:['Cadet','Pilote','Spécialiste de mission','Commandant'],
     req:{age:24,deg:['ingenieur','medecine','*doc','master_sciences','master_maths'],health:80,smarts:75},
     apply:L=>applyAstro(L),year:L=>astroYear(L),salary:L=>aSalary(L),panel:L=>astroPanel(L)}
  },
  pension(L){
    if(sjob(L))return Math.round(sSalary(L)*.1);
    if(ajob(L))return Math.round(aSalary(L)*.7);
    return undefined;
  },
  badges(L){
    const b=[];
    if(L.spx&&L.spx.hof)b.push('🏛️ Hall of Fame');
    const A=L.astx;if(A){if(A.artifact)b.push('👽 Artefact');else if((A.mars||0)>0)b.push('🔴 Mars');else if((A.moon||0)>0)b.push('🌕 Lune')}
    return b;
  },
  sheetRows(L){
    const r=[];const s=L.spx;
    if(s&&s.tot){const S=SPORTS[s.sport]||{n:'Sport'};r.push(row({ic:s.hof?'🏛️':'🏆',t:`Carrière sportive${s.hof?' · Hall of Fame':''}`,s:`${S.n} · ${pl(s.tot.titles||0,'titre')} · ${fmtn(s.tot.g||0)} matchs ou courses`}))}
    const A=L.astx;
    if(A&&((A.msn||[]).length||(A.pubs||[]).length))r.push(row({ic:'🚀',t:'Carrière spatiale',s:`${pl((A.msn||[]).length,'mission')} · ${pl((A.pubs||[]).length,'publication')}${A.artifact?' · artefact découvert':''}`}));
    return r;
  },
  eventsDb,effects,conds
});
})();
