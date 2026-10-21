/* Visite guidée du premier lancement et fenêtre « Quoi de neuf ». */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{window.__forceTuto=true;window.DV_NEWS=['Test A : une nouveauté','Test B : une autre'];});
 const pg=await ctx.newPage();await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const url='file://'+process.cwd()+'/'+dir+'/shot.html';const r={};
 await pg.goto(url);await pg.click('[data-mode="1"]');await pg.click('#goBtn');await pg.waitForTimeout(900);
 r.started=await pg.evaluate(()=>!!document.getElementById('tuto')&&/ÂGE/.test(document.querySelector('#tuto .tip b').textContent));
 const titles=[];
 for(let i=0;i<9;i++){const t=await pg.evaluate(()=>{const e=document.querySelector('#tuto .tip b');return e?e.textContent:null});if(!t)break;titles.push(t);await pg.click('#tuto .next');await pg.waitForTimeout(120)}
 r.steps=titles.length;r.finished=await pg.evaluate(()=>!document.getElementById('tuto')&&localStorage.getItem('dv.tuto')==='1');
 await pg.click('#ageBtn');await pg.waitForTimeout(1200);
 r.ageWorks=await pg.evaluate(()=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}return cur().age});r.ageWorks=r.ageWorks>=1;
 // rechargement : plus de visite, et pas de « Quoi de neuf » juste après la première visite
 await pg.reload();await pg.waitForTimeout(1200);
 r.reload=await pg.evaluate(()=>!document.getElementById('tuto')&&document.getElementById('modal').hidden);
 // nouveauté publiée : la fenêtre apparaît une seule fois
 await pg.evaluate(()=>localStorage.setItem('dv.news','ancien'));await pg.reload();await pg.waitForTimeout(1200);
 r.news=await pg.evaluate(()=>!document.getElementById('modal').hidden&&/Test A/.test(document.getElementById('mtext').innerHTML));
 await pg.evaluate(()=>{chooseM(0)});await pg.reload();await pg.waitForTimeout(1200);
 r.newsOnce=await pg.evaluate(()=>document.getElementById('modal').hidden);
 // revoir la visite depuis le menu
 await pg.evaluate(()=>{openPanel(pMenu)});r.menuRow=await pg.evaluate(()=>/Revoir la visite guidée/.test(document.getElementById('pbody').innerText));
 r.ok=!errs.length&&r.started&&r.steps>=5&&r.finished&&r.ageWorks&&r.reload&&r.news&&r.newsOnce&&r.menuRow;
 await pg.screenshot({path:'/tmp/tuto_menu.png'});
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
