/* Proches vivants : actions autonomes des proches, demandes d'argent, mémoire de la dernière rencontre. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={lives:0,events:0,asks:0,badMoney:0,kinds:{}};
  const drain=()=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(c&&c.length){if(/te demande/.test(curM.text||'')){out.asks++;const m0=cur().money;chooseM(Math.floor(Math.random()*c.length));if(cur().money<0&&m0>=0)out.badMoney++}else chooseM(Math.floor(Math.random()*c.length))}else endModal('')}};
  for(let i=0;i<14;i++){
    const L=makeLife({first:'A'+i,last:'Z'});G.players=[L];G.turn=0;out.lives++;
    while(L.age<55&&L.alive){ageUp();drain()}
    out.events+=(L.tr.agentEvents||0);
    for(const b of L.log)for(const x of b.lines){const m=x.match(/^(📞|🎂|🚪|🗞️|📦|💢|🤝|📭|💶)/);if(m)out.kinds[m[1]]=(out.kinds[m[1]]||0)+1}
  }
  out.perLife=Math.round(out.events/out.lives*10)/10;
  // mémoire : passer du temps met à jour la dernière rencontre
  const L2=makeLife({first:'B',last:'Z'});G.players=[L2];G.turn=0;while(L2.age<20){ageUp();drain()}
  const p=L2.family.find(x=>x.alive&&x.type==='parent');p.seen=1;spendTime(L2,p);out.seen=p.seen===L2.age;
  return out});
 r.ok=!errs.length&&r.events>=40&&r.badMoney===0&&r.seen&&Object.keys(r.kinds).length>=5;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
