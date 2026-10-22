/* Personnages récurrents : rival d'école, meilleur ami d'enfance, voisin pénible, ex qui revient, rumeurs. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={lives:0,rival:0,bestie:0,voisin:0,steps:{rival:{},bestie:{},voisin:{}},badText:0,modals:0,roles:{},rumors:0,faces:0};
  const drain=()=>{let k=0;while(curM&&k++<40){const t=(curM.text||'')+(curM.html||'');out.modals++;if(/undefined|NaN|\[object/.test(t))out.badText++;if(curM.av)out.faces++;const c=curM.choices;if(c&&c.length)chooseM(Math.floor(Math.random()*c.length));else endModal('')}};
  for(let i=0;i<36;i++){
    const L=makeLife({first:'R'+i,last:'Z'});G.players=[L];G.turn=0;out.lives++;
    L.withParents=false;L.job={c:Object.keys(CAREERS)[0],perf:60,sal:30000,lvl:0,y:3};const M=modById('recurring');
    for(L.age=5;L.age<=80;L.age++){for(const q of L.family)if(q.type!=='pet'&&q.alive!==false)q.age=Math.max(q.age,3);M.year(L);drain()}
    const rc=L.rec||{};
    for(const k of ['rival','bestie','voisin'])if(rc[k]&&rc[k].id){out[k]++;const s=rc[k].step;out.steps[k][s]=(out.steps[k][s]||0)+1;const p=byId(L,rc[k].id);if(p)out.roles[role(p)]=1}
    for(const bl of L.log)for(const x of bl.lines)if(/^🗣️/.test(x)&&/On raconte|Une rumeur|On parle de toi|Il paraît/.test(x))out.rumors++;
  }
  // l'ex qui revient : un ex dans l'entourage, plusieurs années
  const L=makeLife({first:'E',last:'Z'});G.players=[L];G.turn=0;L.age=30;L.partner=null;
  const ex=person('F',29,null,L.country);ex.type='ex';ex.rel=20;L.family.push(ex);
  const M2=modById('recurring');let guard=0;while((!L.rec||!L.rec.ex||L.rec.ex.step<1)&&guard++<400){M2.year(L);drain()}
  out.exStep1=L.rec&&L.rec.ex?L.rec.ex.step:0;
  L.age+=7;guard=0;while(L.rec.ex.step<2&&guard++<400){M2.year(L);drain()}
  out.exStep2=L.rec.ex.step;
  // étiquettes
  const p={gender:'F',type:'friend',tag:'rival'},q={gender:'H',type:'friend',tag:'voisin'};
  out.labels=[role(p),role(q),poss(p),poss(q)];
  return out});
 r.ok=!errs.length&&r.badText===0&&r.rival>=5&&r.bestie>=10&&r.voisin>=5&&r.exStep1>=1&&r.exStep2===2&&r.faces>=10&&r.rumors>=10&&r.labels.join('|')==='Rivale|Voisin|ta rivale|ton voisin';
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
