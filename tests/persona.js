/* Personnalité qui se révèle : archétype d'après les habitudes, fidélité récompensée, évènements propres, fiche personnage. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={};const M=modById('persona');
  const mk=()=>{const L=makeLife({first:'P',last:'Z',gender:'H'});G.players=[L];G.turn=0;L.age=20;L.tr=L.tr||{};return L};
  // 1. rien de marquant : pas d'archétype
  let L=mk();M.year(L);out.none=L.persona.arch===null;
  // 2. fêtard marqué
  L=mk();L.tr.k_party=12;L.tr.k_bar=4;M.year(L);out.arch=L.persona.arch;out.years1=L.persona.years;
  out.msg=L.log.some(b=>b.lines.some(x=>/Ta personnalité se dessine/.test(x)));
  // 3. fidélité : 5 ans de suite
  for(let i=0;i<4;i++){L.age++;M.year(L)}
  out.years5=L.persona.years;out.reward=L.log.some(b=>b.lines.some(x=>/fidèle à toi-même/.test(x)));out.coherent=(L.tr.coherent||0);
  // 4. changement d'archétype
  L.tr.k_gym=60;L.tr.k_yoga=20;L.age++;M.year(L);out.switched=L.persona.arch==='zen'&&L.persona.years===1;
  // 5. prix de fin de vie
  L=mk();L.tr.k_party=30;for(let i=0;i<10;i++){L.age++;M.year(L)}
  out.award=lifeAwards(L).some(a=>/Fidèle à/.test(a.n));
  // 6. évènements propres : condition liée à l'archétype
  const evs=M.eventsDb;out.events=evs.length;
  L=mk();L.tr.k_party=30;M.year(L);
  out.cond=evCond(L,evs.find(e=>e.id==='persona_fete').conditions)&&!evCond(L,evs.find(e=>e.id==='persona_zen').conditions);
  // 7. ces évènements se jouent sans erreur et sans texte cassé
  let bad=0,played=0;for(const e of evs){const L2=mk();L2.job={c:Object.keys(CAREERS)[0],perf:60,sal:30000,lvl:0,y:3};L2.tr.k_party=30;L2.persona.arch=e.id.replace('persona_','');
    for(let ch=0;ch<(e.choices||[]).length;ch++){const L3=mk();L3.job=L2.job;L3.money=5000;try{const txt=evApply(L3,e.choices[ch].consequences,e);played++;if(/undefined|NaN/.test(txt+e.prompt_text))bad++}catch(x){bad++}}}
  out.played=played;out.bad=bad;
  // 8. fiche personnage : ligne Personnalité et panneau
  L=mk();L.tr.k_party=30;M.year(L);render();openPanel(pSheet);out.sheet=/Personnalité/.test(document.getElementById('pbody').innerText);
  closeSheet();
  return out});
 r.ok=!errs.length&&r.none&&r.arch==='fete'&&r.years1===1&&r.msg&&r.years5===5&&r.reward&&r.coherent>=1&&r.switched&&r.award&&r.events===7&&r.cond&&r.played>=18&&r.bad===0&&r.sheet;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
