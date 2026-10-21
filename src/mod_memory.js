/* Deux Vies — module « Souvenirs » (id memory)
   Le jeu retient les grands moments de la vie (mariage, naissance, diplôme, promotion, deuil, rupture)
   et y revient 5, 10, 15, 20… ans plus tard. État par vie : L.mem = [{a, t, k, done}], L.memSeen = {âge: nb de lignes lues}. */
(()=>{
const MOD='memory';
const GOOD=/(^|\s)(💒|👶|🎓|🏆|📈|💍|🥇)|diplôm|décroches ton bac|Promotion|se marie|accouch/;
const BAD=/(^|\s)(🕯️|💔|☠️)|est mort|est morte|te quitte|divorc|décès/;
const ANNIV=[5,10,15,20,25,30,40,50,60];
const strip=t=>{const [e,r]=emoSplit(t);return (r||t).replace(/\s+/g,' ').trim()};
function scan(L){
  if(!L.mem)L.mem=[];if(!L.memSeen)L.memSeen={};
  for(const b of (L.log||[]).slice(-2)){
    const seen=L.memSeen[b.age]||0;
    for(let i=seen;i<b.lines.length;i++){
      const line=b.lines[i];const k=BAD.test(line)?'bad':GOOD.test(line)?'good':null;
      if(k&&line.length>12&&L.mem.length<60)L.mem.push({a:b.age,t:strip(line).slice(0,150),k});
    }
    L.memSeen[b.age]=b.lines.length;
  }
  for(const a of Object.keys(L.memSeen))if(+a<L.age-3)delete L.memSeen[a];
}
function year(L){
  if(!L)return;scan(L);
  const due=L.mem.find(m=>{const n=L.age-m.a;return ANNIV.includes(n)&&!(m.done||[]).includes(n)});
  if(!due)return;
  const n=L.age-due.a;due.done=(due.done||[]).concat(n);
  const good=due.k==='good';
  say(L,`🕰️ Il y a ${n} ans : ${due.t.charAt(0).toLowerCase()+due.t.slice(1)}${/[.!?…]$/.test(due.t)?'':'.'} ${good?'Un sourire te vient.':'Une bougie, une pensée.'}`);
  chg(L,good?{happy:2}:{happy:-2,karma:1});
}
function pMem(){
  const L=cur();if(!L)return {title:'Souvenirs',html:note('Aucun personnage.')};
  const list=(L.mem||[]).slice().reverse().slice(0,25);
  return {title:'Souvenirs',html:note(list.length?'Les grands moments de ta vie. Le jeu y repense tous les 5 ans.':'Tes grands moments (mariage, naissance, diplôme, deuil…) viendront s’ajouter ici.')
    +group('Album',list.map(m=>row({ic:m.k==='good'?'🌟':'🕯️',t:m.t,s:`à ${m.a} ans${m.done&&m.done.length?` · rappelé ${m.done.length} fois`:''}`})))};
}
registerMod({
  id:MOD,
  born(L){if(L){L.mem=[];L.memSeen={}}},
  heirInit(D,L){if(L){L.mem=[];L.memSeen={}}},
  year,
  sheetRows(L){const n=(L&&L.mem||[]).length;return [nav('🕰️','Souvenirs',n?`${n} souvenir${n>1?'s':''} gardé${n>1?'s':''}`:'Aucun pour l’instant',pMem)]}
});
})();
