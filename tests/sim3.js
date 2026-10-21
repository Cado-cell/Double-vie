const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
 const N=+process.argv[2]||1500;
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});
 const errs=[];pg.on('pageerror',e=>errs.push('PAGE '+e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!m.text().includes('ERR_TUNNEL')&&!m.text().includes('net::'))errs.push('CONSOLE '+m.text())});
 await pg.route('**/fonts.g*/**',r=>r.abort());{const fs=require('fs');const h=fs.readFileSync('src/deux-vies.html','utf8');fs.writeFileSync('src/test.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');}await pg.goto('file://'+process.cwd()+'/src/test.html');
 await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();
 await pg.click('#goBtn');
 const rnd=a=>a[Math.floor(Math.random()*a.length)];
 let ages=0;
 for(let i=0;i<N;i++){
  try{
  if(await pg.isVisible('#tuto')){await pg.click('#tuto .skip');continue}
  if(await pg.isVisible('#goBtn')){await pg.click('#goBtn');continue}
  if(await pg.isVisible('#modal')){
    const bs=await pg.$$('#mch button:not([disabled])');
    if(bs.length){await rnd(bs).click();continue}
    const gs=await pg.$$('#mtext [data-g]:not([disabled])');
    if(gs.length){await rnd(gs).click();continue}
    await pg.waitForTimeout(150);continue}
  if(await pg.isVisible('#sheet')){
    const rows=await pg.$$('#pbody button.row:not([disabled]), #pbody button.tile:not([disabled]), #pbody button.btn');
    if(rows.length&&Math.random()<.75){const r=rnd(rows);const t=await r.innerText();if(/Nouvelle partie|Tout effacer|Revoir la visite guidée/.test(t)){await pg.click('#pclose');continue}await r.click();continue}
    await pg.click('#pclose');continue}
  const ob=await pg.$$('.obit button.row');
  if(ob.length){await rnd(ob).click();if(await pg.isVisible('#sheet')){const r=await pg.$$('#pbody button.row');if(r.length)await r[r.length-1].click()}continue}
  if(Math.random()<.4){await pg.click(rnd(['#tWork','#tAssets','#tRel','#tAct','#menuBtn','.avatar']));continue}
  if(!(await pg.isDisabled('#ageBtn'))){await pg.click('#ageBtn');ages++}
  }catch(e){errs.push('SIM '+e.message.split('\n')[0])}
 }
 const st=await pg.evaluate(()=>({players:G&&G.players.map(p=>[p.first,p.age,p.alive,Math.round(p.money),p.job&&p.job.c,p.partner&&p.partner.status,p.edu.degrees.join('/'),p.gen]),cem:G&&G.cemetery.length,rib:G&&G.ribbons,ch:G&&Object.keys(G.challenges)}));
 console.log(JSON.stringify(st),'ages',ages);
 await pg.screenshot({path:'shot.png'});
 console.log('ERRORS',errs.length);console.log([...new Set(errs)].slice(0,25).join('\n'));
 await b.close();
})();
