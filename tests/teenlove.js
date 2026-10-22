/* Amours d'école : coup de cœur dès 12 ans, camarades du même âge, rien d'adulte avant 18 ans. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={};
  const mk=age=>{const L=makeLife({first:'T',last:'Z'});G.players=[L];G.turn=0;L.age=age;L.money=200;L.edu.stage=L.edu.stage||'school';return L};
  const text=()=>document.getElementById('pbody').innerText;
  const drain=()=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(c&&c.length)chooseM(0);else endModal('')}};
  // 1. l'action existe à partir de 12 ans, pas avant
  const has=age=>{const L=mk(age);closeSheet();openPanel(pRel);return /coup de cœur à l’école|Trouver l’amour/.test(text())};
  out.age11=has(11);out.age12=has(12);out.age13=has(13);out.age16=/Trouver l’amour/.test((()=>{const L=mk(16);closeSheet();openPanel(pRel);return text()})());
  // 2. les camarades rencontrés ont le même âge, jamais adultes
  const ages={};
  for(const a of [12,13,15,17]){const seen=[];for(let i=0;i<60;i++){const L=mk(a);findLove(L);if(curM){const m=curM.html||'';const mm=m.match(/, (\d+) ans/);if(mm)seen.push(+mm[1]);out.noAdv=(out.noAdv!==false)&&!(curM.choices||[]).some(c=>/soir/i.test(c.t));drain()}}
    ages[a]=[Math.min(...seen),Math.max(...seen)]}
  out.ages=ages;
  out.agesOk=ages[12][0]>=12&&ages[12][1]<=13&&ages[13][0]>=12&&ages[13][1]<=14&&ages[15][0]>=14&&ages[15][1]<=16&&ages[17][0]>=16&&ages[17][1]<=17;
  // 3. on peut sortir ensemble à 13 ans (version école)
  let L=mk(13),ok=0;for(let i=0;i<80&&!L.partner;i++){L.used={};findLove(L);if(curM){const j=curM.choices.findIndex(c=>/sortir ensemble/.test(c.t));if(j>=0)chooseM(j);else endModal('')}drain();}
  out.together=!!L.partner;
  // 4. fiche du partenaire pour un mineur
  if(!L.partner){setPartner(L,person('F',13,null,L.country))}
  closeSheet();openPanel(pPartner);const t=text();
  out.partnerTeen=/Sortie au cinéma/.test(t)&&!/Dîner en amoureux|Essayer d’avoir un bébé|Demander en mariage|week-end en amoureux|Répliques de séduction/.test(t)&&/Mot doux/.test(t)&&/Offrir un cadeau/.test(t);
  // 5. pas d'évènement de couple d'adulte avant 18 ans
  const ids=new Set();const orig=window.evRun;window.evRun=function(LL,e){ids.add(e.id);return orig.apply(this,arguments)};
  let blockedBad=0;
  for(let i=0;i<500;i++){const LL=mk(12+(i%6));setPartner(LL,person('F',LL.age,null,LL.country));try{rollEvents(LL)}catch(e){}drain()}
  window.evRun=orig;
  const bad=[...ids].filter(id=>{const e=evById(id);return e&&coupleCond(e.conditions)&&!TEEN_COUPLE_OK(id)});
  out.bad=bad;out.teenEvents=[...ids].filter(id=>/^evt_teen_/.test(id)).length;
  // 6. l'adulte garde les évènements de couple
  const A=mk(30);out.adultOk=!teenBlocked(A,evById('evt_couple_crise_342'))&&teenBlocked(mk(15),evById('evt_couple_crise_342'))&&!teenBlocked(mk(15),evById('evt_teen_cine'))&&!teenBlocked(mk(15),evById('evt_couple_gift'));
  // 7. le texte des évènements d'école est propre
  const txt=EVENT_DB.filter(e=>/^evt_teen_/.test(e.id)).map(e=>e.prompt_text+JSON.stringify(e.choices)).join(' ');out.clean=!/undefined|NaN/.test(txt);
  out.teenCount=EVENT_DB.filter(e=>/^evt_teen_/.test(e.id)).length;
  return out});
 r.ok=!errs.length&&!r.age11&&r.age12&&r.age13&&r.age16&&r.agesOk&&r.noAdv!==false&&r.together&&r.partnerTeen&&r.bad.length===0&&r.teenEvents>=3&&r.adultOk&&r.clean&&r.teenCount===5;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
