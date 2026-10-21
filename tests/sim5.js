const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
 const b=await chromium.launch();const pg=await b.newPage();
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 {const fs=require('fs');const h=fs.readFileSync('src/deux-vies.html','utf8');fs.writeFileSync('src/test.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');}await pg.goto('file://'+process.cwd()+'/src/test.html');
 await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();
 await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 await pg.evaluate(()=>{window.__e=[];console.error=(...a)=>__e.push(a.map(x=>x&&x.stack||String(x)).join(' '))});
 let lives=0,steps=0,slow=[];const t0=Date.now();
 while(lives<25&&Date.now()-t0<330000){
  const t=Date.now();
  const r=await pg.evaluate(()=>{const L=cur();const before=JSON.stringify({age:L.age,job:L.job,st:L.stage});ageUp();let k=0;while(curM&&k++<20){const c=curM.choices;if(curM.mount&&(!c||!c.length))endModal('');else if(!c||!c.length)chooseM(0);else chooseM(Math.floor(Math.random()*c.length))}
   if(!cur().alive){const D=cur();const ks=kids(D);const res=D.age+' '+D.ribbon+' '+Math.round(netWorth(D)/1000)+'k';if(ks.length&&Math.random()<.5)continueAs(0,ks[0].id);else{delete G.snaps[D.id];G.players[0]=makeLife({})}return {dead:res}}return {age:cur().age,size:JSON.stringify(G).length,logN:cur().log.length}});
  const dt=Date.now()-t;steps++;
  if(dt>1500)slow.push([dt,JSON.stringify(r)]);
  if(r.dead){lives++;process.stdout.write(r.dead+' | ')}
 }
 const e=await pg.evaluate(()=>window.__e.slice(0,10));
 console.log('\nlives',lives,'steps',steps,'time',Date.now()-t0);console.log('slow',slow.slice(0,10));console.log('ERR',e,errs);
 const sz=await pg.evaluate(()=>({g:JSON.stringify(G).length,snaps:JSON.stringify(G.snaps).length,cem:JSON.stringify(G.cemetery).length,dom:document.getElementsByTagName('*').length}));console.log(sz);
 await b.close();
})();
