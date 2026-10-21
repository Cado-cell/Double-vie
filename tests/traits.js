/* Trait de caractère choisi à la création. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();
 const r={};
 r.options=await pg.evaluate(()=>document.querySelectorAll('#s1-trait option').length);
 r.api=await pg.evaluate(()=>{let ok=0;for(let i=0;i<60;i++){const L=makeLife({trait:'bos',first:'T',last:'T'});if(L.traits&&L.traits.bos)ok++}return ok});
 await pg.click('[data-mode="1"]');await pg.selectOption('#s1-trait','gen');await pg.click('#goBtn');
 r.ui=await pg.evaluate(()=>!!(cur().traits&&cur().traits.gen));
 r.ok=!errs.length&&r.options>=8&&r.api===60&&r.ui;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
