const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/src/test.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 await pg.evaluate(()=>{for(let i=0;i<10;i++){ageUp();let k=0;while(curM&&k++<20){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}});
 const age1=await pg.evaluate(()=>cur().age);
 await pg.click('#menuBtn');await pg.click('text=Sauvegardes');await pg.waitForTimeout(200);
 const rows=await pg.$$eval('#pbody button.row',els=>els.map(e=>e.innerText.replace(/\n/g,' | ')));console.log(rows.slice(0,8));
 // enregistrer dans le 1er emplacement
 await pg.click('#pbody button.row:has-text("Emplacement 1")');await pg.waitForTimeout(200);console.log('sub',await pg.$$eval('#pbody button.row',els=>els.map(e=>e.innerText.replace(/\n/g,' | '))));
 const btn=await pg.$('#pbody button.row:has-text("Enregistrer")');if(btn){await btn.click();await pg.waitForTimeout(200);const c2=await pg.$('#pbody button.row:has-text("Confirmer")');if(c2){await c2.click();await pg.waitForTimeout(200)}}
 console.log('slot1',await pg.evaluate(()=>{const s=localStorage.getItem('src.slot.1');return s?JSON.parse(s).summary:null}));
 // vieillir puis recharger
 await pg.evaluate(()=>{closeSheet();for(let i=0;i<3;i++){ageUp();let k=0;while(curM&&k++<20){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}});
 const age2=await pg.evaluate(()=>cur().age);
 await pg.click('#menuBtn');await pg.click('text=Sauvegardes');await pg.waitForTimeout(200);
 await pg.click('#pbody button.row:has-text("Emplacement 1")');await pg.waitForTimeout(200);
 console.log('sub2',await pg.$$eval('#pbody button.row',els=>els.map(e=>e.innerText.replace(/\n/g,' | '))));
 const ld=await pg.$('#pbody button.row:has-text("Charger")');if(ld){await ld.click();await pg.waitForTimeout(200);console.log('confirm',await pg.$$eval('#pbody button.row',els=>els.map(e=>e.innerText.replace(/\n/g,' | '))));const conf=await pg.$('#pbody button.row:has-text("Charger cette"), #pbody button.row:has-text("Confirmer"), #pbody button.row.danger');if(conf){await conf.click();await pg.waitForTimeout(400)}}
 const age3=await pg.evaluate(()=>cur().age);
 console.log({age1,age2,age3,autos:await pg.evaluate(()=>[0,1,2].filter(i=>localStorage.getItem('src.auto.'+i)).length)});
 console.log('errs',errs);await b.close()})();
