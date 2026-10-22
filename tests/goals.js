/* Projets des proches : chacun a un but, qui avance, que l'on peut soutenir, et dont on apprend la réussite. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={assigned:0,done:0,asks:0,gave:0,refused:0,badText:0,news:0,kinds:{},rows:0,progOk:true};
  const M=modById('goals');
  const drain=()=>{let k=0;while(curM&&k++<40){const t=(curM.text||'')+(curM.html||'');if(/undefined|NaN|\[object/.test(t))out.badText++;const c=curM.choices;
    if(/projet de/.test(curM.title||'')){out.asks++;const i=Math.floor(Math.random()*c.length);chooseM(i)}else if(c&&c.length)chooseM(0);else endModal('')}};
  for(let i=0;i<30;i++){
    const L=makeLife({first:'G'+i,last:'Z'});G.players=[L];G.turn=0;L.age=25;L.money=60000;
    for(let k=0;k<4;k++){const f=addFriend(L);f.age=R(22,50)}
    for(;L.age<=75;L.age++){for(const p of L.family)if(p.alive!==false&&p.type!=='pet'){p.age=Math.max(p.age,14);p.rel=Math.max(p.rel,55)}M.year(L);drain()}
    for(const p of L.family){if(p.goal){out.assigned++;out.kinds[p.goal.k]=1;if(p.goal.done!=null)out.done++;if(p.goal.prog<0||p.goal.prog>100||isNaN(p.goal.prog))out.progOk=false;if(p.memo&&p.memo.gave)out.gave++;if(p.memo&&p.memo.refused)out.refused++}}
    for(const bl of L.log)for(const x of bl.lines)if(/^🎯/.test(x))out.news++;
  }
  // lignes dans la fiche d'une personne
  const L=makeLife({first:'H',last:'Z'});G.players=[L];G.turn=0;L.age=30;const f=addFriend(L);f.goal={k:'aventure',t:'faire le tour du monde',prog:40};
  out.rows=M.personRows(L,f).length;
  f.goal.done=33;out.rowsDone=M.personRows(L,f).length;
  return out});
 r.ok=!errs.length&&r.assigned>=80&&r.done>=30&&r.asks>=20&&r.gave>=5&&r.badText===0&&r.news>=30&&Object.keys(r.kinds).length===6&&r.progOk&&r.rows===2&&r.rowsDone===1;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
