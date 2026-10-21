const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const {execSync}=require('child_process');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});const pg=await ctx.newPage();
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.route('**/fonts.g*/**',r=>r.abort());
 const ver=()=>pg.evaluate(()=>window.DV_VERSION||'(ancienne, sans numéro)');
 await pg.goto('http://127.0.0.1:8766/index.html');await pg.evaluate(()=>navigator.serviceWorker.ready);await pg.waitForTimeout(1500);await pg.reload();
 console.log('1. version installée :',await ver());
 execSync('cp pwa/* site_test/');   // mise en ligne de la nouvelle version
 const seen=[];
 for(let i=1;i<=3;i++){await pg.reload();await pg.waitForTimeout(2500);seen.push(await ver())}
 console.log('2. après 1/2/3 ouvertures :',seen.join(' → '));
 await pg.reload();await ctx.setOffline(true);await pg.reload();await pg.waitForTimeout(800);
 console.log('3. hors connexion :',await pg.evaluate(()=>({v:window.DV_VERSION,ok:typeof ageUp==='function'})));
 await ctx.setOffline(false);
 // test mise à jour suivante : la page nouvelle recharge toute seule
 execSync("sed -i \"s/DV_VERSION='[0-9-]*'/DV_VERSION='TEST2'/\" site_test/index.html; sed -i \"s/const VERSION='[0-9-]*'/const VERSION='TEST2'/\" site_test/sw.js");
 await pg.reload();await pg.waitForTimeout(3500);
 console.log('4. mise à jour suivante, après 1 ouverture :',await ver());
 console.log('erreurs',errs);await b.close()})();
