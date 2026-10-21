const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/src/test.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 await pg.evaluate(()=>{for(let i=0;i<9;i++){ageUp();let k=0;while(curM&&k++<20){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}cur().money=400});
 await pg.click('#tAssets');await pg.waitForTimeout(300);await pg.screenshot({path:'ks_1.png'});
 await pg.click('.tile:has-text("Boutique")');await pg.waitForTimeout(250);await pg.click('.tile:has-text("Musique")');await pg.waitForTimeout(250);await pg.screenshot({path:'ks_2.png'});
 await pg.click('button.row:has-text("Ukulélé")');await pg.waitForTimeout(250);await pg.screenshot({path:'ks_3.png'});
 console.log('choix',await pg.$$eval('#mch button',els=>els.map(e=>e.innerText)));
 await pg.click('#mch button:has-text("Payer avec mon argent")');await pg.waitForTimeout(300);
 const r1=await pg.evaluate(()=>({money:cur().money,assets:cur().assets.map(a=>a.name+':'+a.kind),last:cur().log[cur().log.length-1].lines.slice(-1)[0]}));console.log('achat perso',JSON.stringify(r1));
 // demander aux parents un objet cher, plusieurs essais
 const res=await pg.evaluate(async()=>{const out=[];for(let t=0;t<12;t++){const L=cur();L.used={};L.assets=L.assets.filter(a=>a.name!=='Console de salon');const it=SHOP[1][4].find(x=>x[0]==='Console de salon');shopBuy(L,it);chooseM(1);let n=0;while(curM&&n++<5){const c=curM.choices;if(c&&c.length>1&&/moitié/.test(curM.text||'')){chooseM(0)}else chooseM(Math.max(0,(c||[1]).length-1))}out.push(L.assets.some(a=>a.name==='Console de salon')?'oui':'non')}return out});
 console.log('demandes parents (12 essais):',res.join(','));
 await pg.screenshot({path:'ks_4.png'});console.log('errs',errs);await b.close()})();
