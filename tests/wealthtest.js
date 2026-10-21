const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();
 await pg.click('[data-mode="2"]');await pg.click('#goBtn');
 const drain=()=>pg.evaluate(()=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}});
 await pg.evaluate(()=>{for(let i=0;i<30;i++){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}G.players[0].money=48250;G.players[1].money=1250000;render()});
 await pg.waitForTimeout(300);await pg.screenshot({path:'w_main.png'});
 const info=await pg.evaluate(()=>{const L=cur();const out=[];for(const p of L.family.filter(x=>x.alive).slice(0,8))out.push([p.type,p.age,p.job,JSON.stringify(npcWealth(L,p))]);const a=JSON.stringify(npcWealth(L,L.family[0])),b=JSON.stringify(npcWealth(L,L.family[0]));return {out,stable:a===b,chips:document.querySelector('#players').innerText.replace(/\n/g,' | ')}});
 console.log(JSON.stringify(info,null,1));
 await pg.evaluate(()=>{const L=cur();const p=L.family.find(x=>x.type==='parent'&&x.alive)||L.family.find(x=>x.alive);openPanel(()=>pPerson(p.id))});
 await pg.waitForTimeout(400);await pg.screenshot({path:'w_parent.png'});
 await pg.evaluate(()=>openPanel(pRel));await pg.waitForTimeout(400);await pg.screenshot({path:'w_rel.png'});
 // partner lié
 const r=await pg.evaluate(()=>{const L=cur();const o=G.players[1-G.turn];L.partner={status:'couple',link:1-G.turn,rel:80,since:L.age,p:null};o.partner={status:'couple',link:G.turn,rel:80,since:o.age};try{openPanel(pPartner);return 'ok'}catch(e){return 'ERR '+e.message}});
 console.log('partner lié',r);await pg.waitForTimeout(400);await pg.screenshot({path:'w_partner.png'});
 console.log('errs',errs);await b.close()})();
