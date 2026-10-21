const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push('PAGE '+e.message+' @'+(e.stack||'').split('\n').slice(1,3).join(' ')));
 const fs=require('fs');const h=fs.readFileSync('src/deux-vies.html','utf8');fs.writeFileSync('src/test.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');await pg.goto('file://'+process.cwd()+'/src/test.html');
 await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();
 await pg.click('#goBtn');
 const res=await pg.evaluate(async()=>{
  const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' | '):String(x)).join(' '))};
  window.addEventListener('error',e=>errs.push('WIN '+e.message));
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function drain(){let n=0;while(curM&&n++<40){const c=curM.choices;if(curM.mount&&(!c||!c.length)){const gs=[...document.querySelectorAll('#mtext [data-g]:not([disabled])')];if(gs.length&&Math.random()<.85){gs[Math.floor(Math.random()*gs.length)].click();await sleep(5)}else{await sleep(120);if(curM&&curM.mount&&!document.querySelector('#mtext [data-g]:not([disabled])'))continue;if(curM&&curM.mount&&Math.random()<.3)endModal('x')}}else chooseM(Math.floor(Math.random()*Math.max(1,(c||[1]).length)))}if(curM&&n>=40){curM=null;MQ.length=0;$('#modal').hidden=true}}
  const boost=L=>{L.money=Math.max(L.money,5e7);L.lic={car:true,boat:true,pilot:true};if(L.age<30)L.age=30;['bac','medecine','ingenieur','droit','commerce','lic_info','master_psycho','doc_bio','cinema','sciencespo','conservatoire','lic_staps'].forEach(d=>{if(!L.edu.degrees.includes(d))L.edu.degrees.push(d)});if(!inSchool(L))L.edu.stage='done';L.st.smarts=90;L.st.health=95;L.st.looks=90;L.hid.athletic=90};
  const panels=[pWork,pAssets,pRel,pAct,pMenu,pSheet,pTree,pRibbons,pChallenges,pCem,pTime,pGod,pLove,pMind,pLessons,pHealth,pOut,pVac,pCasino,pLotto,pCrime,pLic,pFert,pPetShop,pSocial,pLaw,pWill,pIdentity,pEmigrate,pRehab,pJobs,pPartTime,pGigs,pSpecials,pArmy,pHousing,pHouses,pCars,pBoats,pPlanes,pJewels,pArt,pInstr,pMajors,pRoyal];
  let clicks=0;
  for(let round=0;round<40;round++){
    let L=cur();
    if(!L.alive){const k=kids(L);if(k.length&&Math.random()<.6)continueAs(G.turn,k[0].id);else{G.players[G.turn]=makeLife({royal:Math.random()<.5,country:'Belgique'})}L=cur()}
    boost(L);
    if(round%5===3){const ks=Object.keys(SPECIALS);if(ks.length){L.job=null;try{SPECIALS[ks[round%ks.length]].apply(L)}catch(e){errs.push('apply '+e.message)}await drain()}}
    if(round%10===7){L.royal={country:'Belgique',line:1,approval:60,throne:true}}
    const modPanels=[];for(const m of MODS){try{if(m.activities)for(const x of [].concat(m.activities(L)||[]))if(x&&x.panel)modPanels.push(x.panel)}catch(e){errs.push('activities '+m.id+' '+e.message)}}
    modPanels.push(()=>({title:'mods',html:modCall('workRows',L).flat().concat(modCall('assetRows',L).flat()).join('')}));
    for(const p of panels.concat(modPanels)){
      if(p===pRoyal&&!L.royal)continue;
      try{openPanel(p)}catch(e){errs.push('OPEN '+p.name+' '+e.message)}
      for(let d=0;d<3;d++){
        const rows=[...document.querySelectorAll('#pbody button.row:not([disabled]), #pbody button.tile:not([disabled]), #pbody .btn:not([disabled])')].filter(r=>!/Tout effacer|Nouvelle partie|Revoir la visite guidée/.test(r.textContent));
        if(!rows.length)break;
        rows[Math.floor(Math.random()*rows.length)].click();clicks++;
        await drain();
        if(cur()!==L)break;
      }
      await drain();
    }
    closeSheet();
    for(let a=0;a<3;a++){ageUp();await drain();if(G.mode===2&&curM)await drain()}
  }
  const L=cur();
  return {errs:[...new Set(errs)].slice(0,30),clicks,state:{age:L.age,alive:L.alive,job:L.job&&L.job.c,mods:MODS.map(m=>m.id),specials:Object.keys(SPECIALS),states:['inv','bm','cult','spy','zoo','pol','mob','biz'].filter(k=>L[k]),assets:L.assets.length,cem:G.cemetery.length,rib:G.ribbons,ch:Object.keys(G.challenges)}};
 });
 console.log(JSON.stringify(res.state));console.log('clicks',res.clicks);
 console.log('ERRORS',res.errs.length+errs.length);console.log(res.errs.concat(errs).join('\n'));
 await b.close();
})();
