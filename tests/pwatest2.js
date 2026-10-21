const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_/.test(m.text()))errs.push('console '+m.text())});
 await pg.route('**/fonts.g*/**',r=>r.abort());
 await pg.goto('http://localhost:8765/index.html');await pg.evaluate(()=>navigator.serviceWorker.ready);await pg.waitForTimeout(2000);
 const man=await pg.evaluate(async()=>{const m=await (await fetch('manifest.webmanifest')).json();const ok=[];for(const i of m.icons){const r=await fetch(i.src);ok.push(i.src+':'+r.status)}const ks=await caches.keys();const c=ks.length?(await (await caches.open(ks[0])).keys()).length:0;return {ok,cached:c}});
 console.log('manifeste',JSON.stringify(man));
 await pg.reload();await pg.waitForTimeout(500);await ctx.setOffline(true);await pg.reload();await pg.waitForTimeout(800);
 await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{const drain=()=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}};
  for(let i=0;i<60;i++){ageUp();drain()}
  const L=cur();let opened=0;for(const f of [pWork,pAssets,pRel,pAct,pMenu,pSheet,pShop]){try{openPanel(f);opened++}catch(e){}}
  return {age:L.age,mods:MODS.length,opened,events:evAll().length}});
 console.log('hors connexion, 60 ans joués',JSON.stringify(r));console.log('erreurs',errs);await b.close()})();
