const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const h=fs.readFileSync('src/deux-vies.html','utf8');fs.writeFileSync('src/test.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 await pg.goto('file://'+process.cwd()+'/src/test.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(async()=>{
  const out={},errs=[];console.error=(...a)=>errs.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join('|'):String(x)).join(' '));
  const drain=()=>{let n=0;while(curM&&n++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}};
  out.mods=MODS.map(m=>m.id).join(',');
  // 1. grossesse
  let L=cur();L.age=28;L.gender='F';L.edu.stage='done';L.hid.fertility=100;setPartner(L,Object.assign(person('H',30,null,L.country),{type:'partner'}));
  let t='';for(let i=0;i<12&&!L.preg;i++){L.used={};t=tryBaby(L,false)}
  out.preg=!!L.preg;out.pregText=t;
  for(let i=0;i<3;i++){ageUp();drain()}
  out.kidsAfter=allKids(L).length;out.pregLeft=!!L.preg;
  // 2. enfants vivants + héritage
  L=cur();L.money=500000;const c=person('H',20,L.last,L.country);c.type='child';L.family.push(c);
  for(let i=0;i<12;i++){ageUp();drain()}
  const kid=L.family.filter(p=>p.type==='child'&&p.alive).sort((a,b)=>b.age-a.age)[0];
  out.kid=kid&&{age:kid.age,job:kid.job,life:kid.life&&{deg:kid.life.degrees,job:kid.life.job,sal:kid.life.sal,money:kid.life.money}};
  // panneaux nouveaux
  for(const [n,f] of [['sheet',pSheet],['menu',pMenu],['rel',pRel]]){try{openPanel(f);out['p_'+n]=document.getElementById('pbody').innerText.length>50}catch(e){errs.push(n+' '+e.message)}}
  closeSheet();
  // 3. sauvegardes : enregistrer / charger
  const before=cur().age;
  try{const m=modById('saves');const rows=m.menuRows(cur());out.saveRow=rows.length}catch(e){errs.push('saves '+e.message)}
  L=cur();L.alive=false;L.cause='test';die(L,'test');
  const ks=kids(L);out.heirKids=ks.length;
  if(ks.length){continueAs(G.turn,ks[0].id);drain();const H=cur();out.heir={age:H.age,job:H.job&&H.job.c,deg:H.edu.degrees.join('/'),money:Math.round(H.money),log:H.log[H.log.length-1].lines.slice(-2)}}
  // traits
  out.traits=Object.keys(cur().traits||{});
  out.errs=[...new Set(errs)];return out});
 console.log(JSON.stringify(r,null,1));console.log('page errs',errs);await b.close()})();
