/* Rêves de vie : choix à 12 ans, réalisation, bilan. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={};const L=cur();
  // vieillir jusqu'à 11 ans puis passer 12 : le choix doit apparaître
  const drain=(pick)=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(pick&&/rêve|Qu’est-ce/i.test((curM.title||'')+(curM.text||''))?0:0)}};
  while(L.age<11){ageUp();drain()}
  ageUp();let asked=false;let k=0;while(curM&&k++<40){const c=curM.choices;if(/Qu’est-ce/.test(curM.text||'')&&/Je verrai plus tard/.test(JSON.stringify(c.map(x=>x.t)))){asked=true;chooseM(0)}else if(!c||!c.length)endModal('');else chooseM(0)}
  out.asked=asked;out.dreams=(L.dreams||[]).length;
  // réalisation : forcer le rêve « riche »
  L.dreams=[{k:'riche'}];L.money=2e6;ageUp();drain();
  out.done=L.dreams[0].done!=null;out.log=JSON.stringify(L.log.slice(-1)).includes('Rêve réalisé');
  // panneau
  closeSheet();openPanel(pSheet);out.sheetRow=/Mes rêves/.test(document.getElementById('pbody').innerText);
  [...document.querySelectorAll('#pbody .row')].find(x=>/Mes rêves/.test(x.textContent)).click();const t=document.getElementById('pbody').innerText;out.panel=/Devenir millionnaire/.test(t)&&/réalisé à/.test(t);
  // bilan
  L.dreams=[{k:'riche',done:30},{k:'savant',done:25}];out.award=lifeAwards(L).some(a=>a.n==='Rêveur comblé');
  return out});
 r.ok=!errs.length&&r.asked&&r.dreams===1&&r.done&&r.log&&r.sheetRow&&r.panel&&r.award;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
