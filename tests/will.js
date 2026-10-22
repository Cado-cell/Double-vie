/* Mémoire des proches et héritage : ce que tu as fait pour un proche (aide, refus) revient plus tard,
   et le testament dépend de votre relation et du temps écoulé depuis votre dernière rencontre. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={};
  const mk=(age,rel,seen,memo)=>{const L=makeLife({first:'T',last:'Z'});G.players=[L];G.turn=0;L.age=age;L.money=0;
   const p={id:'p'+Math.random(),first:'Mamie',last:'Z',gender:'F',type:'parent',age:96,health:0,rel,seen,alive:true,ill:[],memo};L.family=[p];return [L,p]};
  // facteur de testament
  const [L0,p0]=mk(40,90,40);const [L1,p1]=mk(40,20,10);
  out.fClose=willFactor(L0,p0).f;out.fFar=willFactor(L1,p1).f;
  // héritages moyens : proche et vu récemment / brouillé et perdu de vue
  const run=(rel,gapAge)=>{let tot=0,none=0,n=300;for(let i=0;i<n;i++){const [L,p]=mk(40,rel,40-gapAge);let k=0;while(p.alive&&k++<80)familyYear(L);tot+=L.money;if(L.log.some(b=>b.lines.some(x=>/ne te laisse rien/.test(x))))none++}return {mean:tot/n,none}};
  const close=run(90,0),far=run(15,12);out.closeMean=Math.round(close.mean);out.farMean=Math.round(far.mean);out.farNone=far.none;out.closeNone=close.none;
  // remerciement après un don
  let thanks=0,back=0;for(let i=0;i<200;i++){const [L,p]=mk(30,70,30,{gave:1000});p.age=50;p.health=70;p.id='loyal-'+i;L.money=0;p.memo.thanked=0;for(let k=0;k<6&&!p.memo.thanked;k++)modCall('year',L);if(p.memo.thanked){thanks++;back+=L.money}}
  out.thanks=thanks;out.back=back;
  // rancune après un refus
  let grudge=0;for(let i=0;i<200;i++){const [L,p]=mk(30,70,30,{refused:1});p.age=50;p.health=70;for(let k=0;k<6&&!p.memo.grudged;k++)modCall('year',L);if(p.memo.grudged)grudge++}
  out.grudge=grudge;
  return out});
 r.ok=!errs.length&&r.fClose>=1.3&&r.fFar<=.3&&r.closeMean>2*r.farMean&&r.farNone>=20&&r.closeNone===0&&r.thanks>=45&&r.grudge>=30;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
