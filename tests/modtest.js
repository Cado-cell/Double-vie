// Usage : node modtest.js <fichier.js> <idModule|events> [tours]
//   ex. : node modtest.js mod_zoo.js zoo 40      ·   node modtest.js events_db.js events 30
// Ne charge que le cœur du jeu + le fichier indiqué, dans une page de test qui lui est propre.
// Charge le jeu dans Chromium, vérifie l'enregistrement du module, parcourt ses panneaux, déclenche ses évènements JSON et fait vieillir.
const path=require('path'),fs=require('fs');
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const DIR=path.join(__dirname,'src');
(async()=>{
 const file=process.argv[2],id=process.argv[3]||'all',rounds=+process.argv[4]||30;
 if(!file||!fs.existsSync(path.join(DIR,file))){console.log('Fichier introuvable : '+file);process.exit(2)}
 let h=fs.readFileSync(path.join(DIR,'deux-vies.html'),'utf8');
 const CORE=['data.js','avatar.js','icons.js','engine.js','events.js','packs.js','games.js','ui.js'];
 h=h.replace(/<script src="([^"]+)"><\/script>\n?/g,(m,src)=>CORE.includes(src)?m:'');
 h=h.replace('<script src="games.js"></script>','<script src="'+file+'"></script>\n<script src="games.js"></script>');
 const TEST='test_'+file.replace(/\W/g,'_')+'.html';
 fs.writeFileSync(path.join(DIR,TEST),'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route('**/fonts.gstatic.com/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n').slice(1,3).join(' ')));
 await pg.goto('file://'+path.join(DIR,TEST));
 await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();
 if(errs.length){console.log('ERREURS AU CHARGEMENT\n'+errs.join('\n'));await b.close();process.exit(1)}
 await pg.click('#goBtn');
 const res=await pg.evaluate(async([id,rounds])=>{
  const errs=[];console.error=(...a)=>errs.push('console.error: '+a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' | '):String(x)).join(' '));
  window.addEventListener('error',e=>errs.push('window.error: '+e.message));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const mods=id==='events'?[]:id==='all'?MODS:MODS.filter(m=>m.id===id);
  if(id!=='events'&&!mods.length)return {errs:['Module non enregistré : '+id+'. Modules présents : '+MODS.map(m=>m.id).join(', ')]};
  async function drain(){let n=0;while(curM&&n++<60){const c=curM.choices;if(curM.mount&&(!c||!c.length)){const gs=[...document.querySelectorAll('#mtext [data-g]:not([disabled]),#mtext button:not([disabled])')];if(gs.length&&Math.random()<.85){gs[Math.floor(Math.random()*gs.length)].click();await sleep(5)}else{await sleep(60);if(curM&&curM.mount&&Math.random()<.3)endModal('')}}else chooseM(Math.floor(Math.random()*Math.max(1,(c||[1]).length)))}if(curM){errs.push('Modale bloquée : '+(curM.title||'')+' / '+(curM.text||'').slice(0,60));curM=null;MQ.length=0;$('#modal').hidden=true}}
  const boost=L=>{L.money=Math.max(L.money,3e7);L.lic={car:true,boat:true,pilot:true};if(L.age<30)L.age=30;['bac','medecine','ingenieur','droit','commerce','lic_info','master_psycho','doc_bio','cinema','sciencespo','conservatoire','lic_staps','master_sciences'].forEach(d=>{if(!L.edu.degrees.includes(d))L.edu.degrees.push(d)});if(!inSchool(L))L.edu.stage='done';L.st.smarts=90;L.st.health=95;L.st.looks=90;L.hid.athletic=90;L.fame=Math.max(L.fame,40);L.prison=0};
  const stats={clicks:0,events:0,specialsTried:0};
  for(let r=0;r<rounds;r++){
    let L=cur();
    if(!L.alive){const k=kids(L);if(k.length&&Math.random()<.6)continueAs(G.turn,k[0].id);else G.players[G.turn]=makeLife({});L=cur()}
    boost(L);
    for(const m of mods){
      // carrières spéciales
      if(m.special&&r%3===0){const ks=Object.keys(m.special);const k=ks[r%ks.length];if(!L.job||!L.job.sp||Math.random()<.3){L.job=null;try{SPECIALS[k].apply(L)}catch(e){errs.push('apply '+k+': '+e.message)}stats.specialsTried++;await drain()}}
      // panneau virtuel avec toutes les entrées du module
      const rows=[];
      try{if(m.workRows)rows.push(...[].concat(m.workRows(L)||[]))}catch(e){errs.push(m.id+'.workRows: '+e.message)}
      try{if(m.assetRows)rows.push(...[].concat(m.assetRows(L)||[]))}catch(e){errs.push(m.id+'.assetRows: '+e.message)}
      try{if(m.activities)for(const a of [].concat(m.activities(L)||[]))rows.push(act(L,{ic:a.ic,t:a.t,s:a.s,min:a.min,nav:a.panel}))}catch(e){errs.push(m.id+'.activities: '+e.message)}
      try{if(m.assetDetailRows)for(const a of L.assets)rows.push(...[].concat(m.assetDetailRows(L,a)||[]))}catch(e){errs.push(m.id+'.assetDetailRows: '+e.message)}
      if(L.job&&L.job.sp&&SPECIALS[L.job.c]&&SPECIALS[L.job.c].mod===m.id){try{rows.push(SPECIALS[L.job.c].panel(L)||'')}catch(e){errs.push('panel special: '+e.message)}}
      const html=rows.join('');
      openPanel(()=>({title:'Test '+m.id,html:html||note('vide')}));
      for(let d=0;d<4;d++){
        const bs=[...document.querySelectorAll('#pbody button.row:not([disabled]), #pbody .btn:not([disabled])')];
        if(!bs.length)break;bs[Math.floor(Math.random()*bs.length)].click();stats.clicks++;await drain();if(cur()!==L||!L.alive)break;
      }
      closeSheet();
      // évènements JSON du module, déclenchés directement
      if(Array.isArray(m.eventsDb)&&m.eventsDb.length){const e=m.eventsDb[r%m.eventsDb.length];try{evRun(cur(),e);stats.events++}catch(x){errs.push('evRun '+e.id+': '+x.message)}await drain()}
    }
    if(id==='events'){const E=EVENT_DB;for(let i=0;i<Math.min(E.length,12);i++){const e=E[(r*12+i)%E.length];let okc;try{okc=evCond(cur(),e.conditions)}catch(x){errs.push('evCond '+e.id+': '+x.message)}try{evRun(cur(),e);stats.events++}catch(x){errs.push('evRun '+e.id+': '+x.message)}await drain();if(!cur().alive)break}}
    for(let a=0;a<2;a++){if(!cur().alive)break;ageUp();await drain()}
  }
  const L=cur();const st={};for(const m of mods)st[m.id]={netWorth:(()=>{try{return m.netWorth?m.netWorth(L):null}catch(e){return 'ERR '+e.message}})(),badges:(()=>{try{return m.badges?m.badges(L):null}catch(e){return 'ERR'}})(),jobLabel:(()=>{try{return m.jobLabel?m.jobLabel(L):null}catch(e){return 'ERR'}})()};
  // validation des évènements JSON
  for(const e of (id==='events'?EVENT_DB:[])){if(!e.id||!e.prompt_text)errs.push('Évènement incomplet : '+JSON.stringify(e).slice(0,80));for(const c of (e.choices||[]))for(const k in (c.consequences||{}))if(k==='next_forced_event_id'&&!evById(c.consequences[k]))errs.push('next_forced_event_id inconnu : '+c.consequences[k]+' dans '+e.id)}
  {const ids=evAll().map(e=>e.id);const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);if(dup.length)errs.push('Identifiants d’évènements en double : '+[...new Set(dup)].join(', '))}
  for(const m of mods)for(const e of (m.eventsDb||[])){if(!e.id||!e.prompt_text)errs.push('Évènement JSON incomplet dans '+m.id+': '+JSON.stringify(e).slice(0,80));for(const c of (e.choices||[]))for(const k in (c.consequences||{}))if(k==='next_forced_event_id'&&!evById(c.consequences[k]))errs.push('next_forced_event_id inconnu : '+c.consequences[k]+' dans '+e.id)}
  return {errs:[...new Set(errs)].slice(0,40),stats,state:st,age:L.age,job:L.job&&L.job.c,mods:MODS.map(m=>m.id),specials:Object.keys(SPECIALS),eventsDb:evAll().length};
 },[id,rounds]);
 console.log(JSON.stringify({mods:res.mods,specials:res.specials,eventsDb:res.eventsDb,stats:res.stats,state:res.state,age:res.age,job:res.job},null,1));
 const all=(res.errs||[]).concat(errs);
 console.log(all.length?('ERREURS ('+all.length+')\n'+all.join('\n')):'AUCUNE ERREUR');
 await b.close();process.exit(all.length?1:0);
})();
