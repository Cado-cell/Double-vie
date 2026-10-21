/* Simplicité : idées rapides, actions verrouillées masquées, récents. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const errs=[];const r={};
 const open=async age=>{const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',x=>x.abort());pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('#goBtn');
  await pg.evaluate(a=>{while(cur().age<a&&cur().alive){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}render()},age);return pg};
 // adulte : idées rapides
 let pg=await open(30);
 r.chips=await pg.evaluate(()=>document.querySelectorAll('#qa .qchip').length);
 r.chipOpens=await pg.evaluate(()=>{const c=document.querySelector('#qa .qchip');if(!c)return false;c.click();return STACK.length===1&&!document.getElementById('sheet').hidden});
 // récents
 await pg.evaluate(()=>{closeSheet();openPanel(pAct);pushPanel(actCatPanel('loisirs'));pushPanel(pLessons);closeSheet();openPanel(pAct)});
 r.recents=await pg.evaluate(()=>/Récents/.test(document.getElementById('pbody').innerText));
 // listes longues regroupées
 r.jobs=await pg.evaluate(()=>{closeSheet();openPanel(()=>pJobs());const n1=document.querySelectorAll('#pbody .row,#pbody .tile').length;let max=0;for(const [id] of jobSectors()){closeSheet();openPanel(()=>pJobsSector(id));max=Math.max(max,document.querySelectorAll('#pbody .row').length)}return {n1,max}});
 r.emi=await pg.evaluate(()=>{closeSheet();openPanel(()=>pEmigrate());const n1=document.querySelectorAll('#pbody .row,#pbody .tile').length;let max=0;for(const [id] of COUNTRY_GROUPS){closeSheet();openPanel(()=>pEmigrateGroup(id));max=Math.max(max,document.querySelectorAll('#pbody .row').length)}return {n1,max}});
 r.long=await pg.evaluate(()=>{const out={};const L=cur();L.money=500000;
  const tryP=(name,f)=>{try{closeSheet();openPanel(f);out[name]=document.querySelectorAll('#pbody .row,#pbody .tile').length}catch(e){out[name]='ERR '+e.message}};
  tryP('majors',()=>pMajors());tryP('majorsLic',()=>pMajorsType('lic'));tryP('majorsEcole',()=>pMajorsType('ecole'));
  if(typeof pNews==='function'){tryP('news',()=>pNews());tryP('newsAll',()=>pNewsAll())}
  if(typeof pVol==='function'){tryP('vol',()=>pVol());tryP('volStock',()=>pVolCat('stock'))}
  if(typeof pContra==='function'){tryP('contra',()=>pContra());tryP('contraItem',()=>pContraItem(Object.keys(BM_ITEMS)[0]))}
  return out});
 await pg.close();
 // enfant : plus d'éléments grisés « Dès X ans »
 pg=await open(6);
 r.kid=await pg.evaluate(()=>{let dès=0,notes=0;const scan=()=>{document.querySelectorAll('#pbody .row[disabled] small').forEach(s=>{if(/^Dès \d+ ans/.test(s.textContent))dès++});notes+=document.querySelectorAll('#pbody .lockn').length};
  for(const f of [pWork,pAssets,pRel,pAct,pMenu]){closeSheet();openPanel(f);scan()}
  for(const [id] of ACT_CATS){closeSheet();openPanel(pAct);pushPanel(actCatPanel(id));scan()}
  return {dès,notes}});
 await pg.screenshot({path:'/tmp/simp_kid.png'});await pg.close();
 pg=await open(30);await pg.screenshot({path:'/tmp/simp_adult.png'});await pg.close();
 r.ok=!errs.length&&Object.values(r.long).every(v=>typeof v==='number'&&v<=30)&&r.jobs.n1<=14&&r.jobs.max<=12&&r.emi.n1<=14&&r.emi.max<=14&&r.chips>=1&&r.chipOpens&&r.recents&&r.kid.dès===0&&r.kid.notes>=1;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
