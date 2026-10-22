/* Effets : compteur d'argent, variations de jauges, confettis, réglages sons/vibrations. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('#goBtn');
 const r={};
 await pg.evaluate(()=>{for(let i=0;i<14;i++){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}});
 await pg.waitForTimeout(300);
 r.defaults=await pg.evaluate(()=>({haptic:FX.st.haptic,sound:FX.st.sound}));
 // compteur d'argent
 await pg.evaluate(()=>{cur().money+=5000;render()});
 r.cashClass=await pg.evaluate(()=>document.querySelector('#idcard .cash').classList.contains('up'));
 await pg.waitForTimeout(1300);
 r.cashFinal=await pg.evaluate(()=>document.querySelector('#idcard .cn').textContent===fmt(cur().money));
 // variation de jauges
 await pg.evaluate(()=>{cur().st.happy=Math.max(0,cur().st.happy-20);render()});
 r.deltas=await pg.evaluate(()=>document.querySelectorAll('#fxl .fxd').length);
 // confettis sur un diplôme
 await pg.evaluate(()=>{const L=cur();L.log[L.log.length-1].lines.push('🎓 Tu décroches ton bac !');render()});
 r.confetti=await pg.evaluate(()=>document.querySelectorAll('#fxl .cf').length);
 // gâteau d'anniversaire
 await pg.evaluate(()=>{const L=cur();L.age=17;render();L.age=18;render()});
 r.cake=await pg.evaluate(()=>document.querySelectorAll('#fxl .fxcake').length);
 r.blink=await pg.evaluate(()=>document.querySelectorAll('#idcard .avatar .blk').length);
 // réglages
 await pg.evaluate(()=>FX.toggle('sound'));
 r.persisted=await pg.evaluate(()=>JSON.parse(localStorage.getItem('dv.fx')).sound===true&&FX.st.sound===true);
 await pg.evaluate(()=>FX.toggle('sound'));
 r.menu=await pg.evaluate(()=>{openPanel(pMenu);const t=document.getElementById('pbody').innerText;return /Sons/.test(t)&&/Vibrations/.test(t)});
 // vieillir longtemps sans erreur
 await pg.evaluate(()=>{closeSheet();for(let i=0;i<40;i++){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}});
 r.ok=!errs.length&&r.defaults.haptic===true&&r.defaults.sound===false&&r.cashClass&&r.cashFinal&&r.deltas>0&&r.confetti>0&&r.cake>0&&r.blink>=1&&r.persisted&&r.menu;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
