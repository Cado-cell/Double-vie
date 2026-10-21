/* Bilan de fin de vie : prix, épitaphe, carte image. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844},acceptDownloads:true});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r={};
 await pg.evaluate(()=>{while(cur().age<58&&cur().alive){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}
   const L=cur();L.money=2500000;L.tr=Object.assign(L.tr||{},{given:20000,kidsMax:4,trips:7,jackpot:1});L.ribbon=L.ribbon||'president';render()});
 r.awards=await pg.evaluate(()=>lifeAwards(cur()).map(a=>a.n));
 r.epitaph=await pg.evaluate(()=>lifeEpitaph(cur()));
 const b64=await pg.evaluate(async()=>{const bl=await lifeCard(cur());const buf=new Uint8Array(await bl.arrayBuffer());let s='';for(const v of buf)s+=String.fromCharCode(v);return {size:bl.size,type:bl.type,b64:btoa(s)}});
 r.size=b64.size;r.type=b64.type;fs.writeFileSync('/tmp/card.png',Buffer.from(b64.b64,'base64'));
 // mort : le bilan affiche prix, épitaphe et boutons
 await pg.evaluate(()=>{const L=cur();L.alive=false;L.cause='vieillesse';render()});
 r.obit=await pg.evaluate(()=>{const o=document.querySelector('.obit');return !!o&&/Partager mon bilan/.test(o.innerText)&&!!o.querySelector('.epi')&&o.querySelectorAll('.award').length>0});
 const dl=pg.waitForEvent('download',{timeout:8000}).catch(()=>null);
 await pg.evaluate(()=>shareLife(cur(),'save'));const d=await dl;r.download=!!d&&/^bilan-.*\.png$/.test(d.suggestedFilename());
 r.ok=!errs.length&&r.awards.length>=2&&r.size>30000&&r.type==='image/png'&&r.obit&&r.download;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
