const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const drain=()=>{let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}};
  for(let i=0;i<12;i++){ageUp();drain()}
  const L=cur();L.money=50000;const out={};
  out.map=['Flûte à bec','Clavier électronique','Ukulélé','Guitare acoustique','Micro de karaoké','Piano à queue','Casque audio','Ballon de foot','Kimono de judo','Boîte de feutres','Vélo'].map(n=>n+'→'+JSON.stringify(gearSkill(n)));
  out.noGear=gearBonus(L,'guitare');
  const it=SHOP[0][4].find(x=>x[0]==='Guitare acoustique');
  const s0=L.skills.guitare||0;shopGive(L,it,200,'Test');out.afterBuy=[s0,L.skills.guitare];out.bonus=gearBonus(L,'guitare');
  // leçons : gains avec et sans guitare
  const gain=(withGear)=>{let t=0;for(let i=0;i<400;i++){const M=JSON.parse(JSON.stringify(L));M.lessons=['guitare'];M.skills.guitare=0;if(!withGear)M.assets=M.assets.filter(a=>!/guitare/i.test(a.name));lessonsYear(M);t+=M.skills.guitare}return +(t/400).toFixed(2)};
  out.lessonAvg={sans:gain(false),avec:gain(true)};
  openPanel(pAssets);out.assetsPanel=true;
  const a=L.assets.find(x=>/Guitare/.test(x.name));out.assetKind=a&&a.kind;
  try{openPanel(()=>pAssetDetail?pAssetDetail(a.id):pOwned)}catch(e){out.detailErr=e.message}
  try{openPanel(()=>shopCat('musique')())}catch(e){out.shopErr=e.message}
  out.shopRows=[...document.querySelectorAll('.sheet .s, .sheet .rs, #sheet .sub')].slice(0,0).length;
  return out});
 console.log(JSON.stringify(r,null,1));
 const txt=await pg.evaluate(()=>document.body.innerText);console.log((txt.match(/aide en [a-zé]+/g)||[]).join(' | '));
 console.log('errs',errs);await b.close()})();
