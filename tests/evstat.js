const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/src/test.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={};
  out.legacy=EVENTS.length;out.legacyChoice=EVENTS.filter(e=>e.c).length;
  const db=evAll();out.db=db.length;const cats={};db.forEach(e=>cats[e.category||'?']=(cats[e.category||'?']||0)+1);out.cats=cats;
  out.chains=db.filter(e=>JSON.stringify(e).includes('next_forced_event_id')||JSON.stringify(e).includes('retaliation')).length;
  out.moduleEvents=MODS.filter(m=>m.events).map(m=>m.id).join(',');
  // taille du vivier par âge, personnage type (célibataire puis en couple, avec emploi à l’âge adulte)
  out.pool={};
  for(const a of [4,8,13,17,22,30,40,55,70,85]){
    const L=makeLife({});L.age=a;L.edu.stage=a>=18?'done':(a>=15?'lycee':a>=11?'college':'primaire');if(a>=18){L.edu.degrees.push('bac');L.job={c:'vente',lvl:1,perf:60,y:3,sal:30000,boss:newBoss(L)};L.money=20000}
    if(a>=22){setPartner(L,Object.assign(person('H',a,null,L.country),{type:'partner'}))}
    if(a>=28){const c=person('H',3,L.last,L.country);c.type='child';L.family.push(c)}
    let leg=0,dbn=0;for(const e of EVENTS){let ok=false;try{ok=!!e.w(L)}catch(x){}if(ok&&!!L.prison===!!e.jail)leg++}
    for(const e of db){let ok=false;try{ok=evCond(L,e.conditions)}catch(x){}if(ok&&e.probability_weight!==0)dbn++}
    out.pool[a]=leg+'+'+dbn}
  // répétition sur une vie complète (textes de fenêtres)
  const om=window.modal;let cap=[];window.modal=function(m){cap.push((m.title||'').replace(/^[^,]+,\s*/,'')+'|'+String(m.text||m.html||'').slice(0,60));return om.apply(this,arguments)};
  const per=[];const freq={};
  for(let n=0;n<6;n++){G.players[0]=makeLife({});cap=[];for(let g=0;g<110&&cur().alive;g++){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}
    const seen={};cap.forEach(t=>seen[t]=(seen[t]||0)+1);const keys=Object.keys(seen);const rep=keys.filter(t=>seen[t]>1);
    per.push({total:cap.length,distinct:keys.length,repeated:rep.length,age:cur().age});keys.forEach(k=>freq[k]=(freq[k]||0)+seen[k])}
  out.per=per;out.top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[1]+'× '+x[0].slice(0,70));
  return out});
 console.log(JSON.stringify(r,null,1));console.log('errs',errs);await b.close()})();
