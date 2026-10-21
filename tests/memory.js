/* Souvenirs : enregistrement des grands moments et rappel 5, 10… ans plus tard. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const drain=()=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}};
  const L=cur();while(L.age<20){ageUp();drain()}
  const out={};
  // enregistrement : une ligne de mariage écrite dans l'année est retenue
  say(L,'💒 Tu te maries à Nice, sous la pluie.');ageUp();drain();
  out.recorded=(L.mem||[]).some(m=>/te maries à Nice/.test(m.t)&&m.k==='good');
  // rappel : un souvenir vieux de 10 ans ressort
  L.mem=[{a:L.age+1-10,t:'Tu soutiens ta thèse de doctorat.',k:'good'},{a:L.age+1-5,t:'Ton grand-père est mort à 80 ans.',k:'bad'}];
  ageUp();drain();
  const lines=L.log.slice(-2).flatMap(b=>b.lines);
  out.callback=lines.some(x=>/Il y a (10|5) ans/.test(x));
  out.once=(L.mem[0].done||[]).includes(10)||(L.mem[1].done||[]).includes(5);
  // panneau
  closeSheet();openPanel(pSheet);[...document.querySelectorAll('#pbody .row')].find(x=>/Souvenirs/.test(x.textContent)).click();
  out.panel=/Album/.test(document.getElementById('pbody').innerText);
  return out});
 r.ok=!errs.length&&r.recorded&&r.callback&&r.once&&r.panel;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
