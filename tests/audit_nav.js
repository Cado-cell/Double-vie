/* Audit de navigation : profondeur des menus, longueur des listes, nombre de touches pour atteindre chaque action.
   Usage :  node tests/audit_nav.js [âge ...]   (par défaut 8 16 30 70) */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
const ages=process.argv.slice(2).map(Number).filter(Boolean);if(!ages.length)ages.push(8,16,30,70);
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const all={};
 for(const age of ages){
  const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());
  await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('#goBtn');
  await pg.evaluate(a=>{while(cur().age<a&&cur().alive){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}cur().money=50000;render()},age);
  const info=await pg.evaluate(()=>({age:cur().age,alive:cur().alive}));
  const panels=[];const seen=new Set();
  const snap=()=>pg.evaluate(()=>({title:document.getElementById('ptitle').textContent,depth:STACK.length,rows:[...document.querySelectorAll('#pbody .row,#pbody .tile')].map(el=>({t:(el.querySelector('b')||el).textContent.trim().slice(0,40),nav:!!el.querySelector('.chev')||el.classList.contains('tile'),dis:el.disabled}))}));
  async function visit(path){
    const s=await snap();const key=path.join('>')+'|'+s.title;if(seen.has(key)||s.depth>4)return;seen.add(key);
    panels.push({path:path.join(' › '),title:s.title,depth:s.depth,n:s.rows.length,nav:s.rows.filter(r=>r.nav).length,act:s.rows.filter(r=>!r.nav).length,locked:s.rows.filter(r=>r.dis).length});
    const navIdx=s.rows.map((r,i)=>r.nav&&!r.dis?i:-1).filter(i=>i>=0);
    for(const i of navIdx){
      const before=s.depth;
      await pg.evaluate(i=>document.querySelectorAll('#pbody .row,#pbody .tile')[i].click(),i);await pg.waitForTimeout(40);
      const d=await pg.evaluate(()=>STACK.length);
      if(d>before){await visit(path.concat(s.rows[i].t));await pg.evaluate(()=>back());await pg.waitForTimeout(30)}
    }
  }
  for(const [name,fn] of [['Métier','pWork'],['Biens','pAssets'],['Relations','pRel'],['Activités','pAct'],['Menu','pMenu']]){
    await pg.evaluate(f=>{closeSheet();openPanel(window[f]||eval(f))},fn);await visit([name]);
  }
  all[age]={info,panels};
  await pg.close();
 }
 for(const age of ages){
  const {panels,info}=all[age];const acts=panels.reduce((s,p)=>s+p.act,0),locked=panels.reduce((s,p)=>s+p.locked,0);
  const byDepth={};panels.forEach(p=>{byDepth[p.depth+1]=(byDepth[p.depth+1]||0)+p.act});
  console.log(`\n=== Âge ${info.age} : ${panels.length} panneaux, ${acts} actions (dont ${locked} grisées) ===`);
  console.log('Actions atteintes en N touches (onglet inclus) :',JSON.stringify(byDepth));
  console.log('Listes les plus longues :',panels.slice().sort((a,b)=>b.n-a.n).slice(0,8).map(p=>`${p.title} (${p.n})`).join(' · '));
  console.log('Panneaux avec >40 % d’éléments grisés :',panels.filter(p=>p.n>=4&&p.locked/p.n>.4).map(p=>`${p.title} ${p.locked}/${p.n}`).join(' · ')||'aucun');
  console.log('Panneaux de profondeur 3+ :',panels.filter(p=>p.depth>=3).length);
 }
 fs.writeFileSync(require('path').join(require('os').tmpdir(),'audit_nav.json'),JSON.stringify(all,null,1));await b.close()})();
