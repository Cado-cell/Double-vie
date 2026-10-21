/* Carrière avancée : rythme de travail, délai entre deux augmentations, retraite d'après les meilleures années. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const L=cur();const mk=hours=>{L.age=30;L.edu.stage='done';L.job={c:'dev',lvl:0,perf:55,y:0,sal:34000,boss:newBoss(L),hours};L.tr={};L.st.stress=undefined};
  const run=(hours,n,trials)=>{let perf=0,health=0;for(let t=0;t<trials;t++){mk(hours);L.st.health=80;L.hid.stress=30;for(let i=0;i<n;i++){const keep=L.job;workYear(L);if(!L.job){L.job=keep}}perf+=L.job.perf;health+=L.st.health}return {perf:perf/trials,health:health/trials}};
  const heavy=run('heavy',3,200),light=run('light',3,200),normal=run('normal',3,200);
  // retraite
  mk('normal');for(let i=0;i<30;i++){L.job.sal=30000+i*1000;workYear(L);if(!L.job){L.job={c:'dev',lvl:0,perf:55,y:0,sal:30000+i*1000,boss:newBoss(L)}}}
  const best=L.tr.best5.slice();const avg=best.reduce((s,v)=>s+v,0)/best.length;const pension=calcPension(L),wy=L.tr.workY;
  // délai d'augmentation
  mk('normal');L.job.raiseWait=2;L.age=40;closeSheet();openPanel(pWork);const t1=document.getElementById('pbody').innerText;const waits=/Reviens dans 2 ans/.test(t1);
  L.job.raiseWait=0;render();closeSheet();openPanel(pWork);const t2=document.getElementById('pbody').innerText;
  const free=!/Reviens dans/.test(t2);
  closeSheet();openPanel(pWork);pushPanel(pHours);const hp=/Intense/.test(document.getElementById('pbody').innerText);
  return {heavy,light,normal,workY:wy,best:best.length,avg:Math.round(avg),pension,ratio:+(pension/avg).toFixed(2),waits,free,hp}});
 r.ok=!errs.length&&r.heavy.perf>r.normal.perf+5&&r.normal.perf>r.light.perf+5&&r.heavy.health<r.light.health+1&&r.workY>=30&&r.best===5&&r.ratio>=.5&&r.ratio<=.75&&r.waits&&r.free&&r.hp;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
