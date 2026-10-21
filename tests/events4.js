/* Jalons de la petite enfance (evt4_*). */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const ev=EVENT_DB.filter(e=>e.id.startsWith('evt4_'));const out={n:ev.length,played:0,bad:[]};
  for(const e of ev){try{const L=cur();L.age=Math.max(e.conditions.min_age,1);if(!evCond(L,e.conditions))out.bad.push(e.id+':cond');
    for(let c=0;c<e.choices.length;c++){evRun(L,e);if(curM&&curM.choices&&curM.choices[c]){chooseM(c);out.played++}else if(curM){endModal('')}}}catch(x){out.bad.push(e.id+':'+x.message)}}
  // l'enfant croise bien ces événements au fil des années
  const seen=new Set();for(let t=0;t<60;t++){const L=makeLife({first:'E',last:'E'});L.age=0;G.players=[L];G.turn=0;for(let a=0;a<11;a++){const flagsBefore=Object.keys(L.flags).filter(k=>k.startsWith('e_evt4_'));ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}Object.keys(L.flags).filter(k=>k.startsWith('e_evt4_')).forEach(x=>seen.add(x))}
  out.seen=seen.size;return out});
 r.ok=!errs.length&&r.n===8&&r.bad.length===0&&r.played>=16&&r.seen>=6;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
