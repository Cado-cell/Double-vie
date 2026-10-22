/* Panneau ou fenêtre ouverts : un balayage ne doit pas faire bouger l'écran de derrière. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844},hasTouch:true});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 await pg.evaluate(()=>{for(let i=0;i<20;i++){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}});
 const r=await pg.evaluate(()=>{
  const out={};
  const swipe=el=>{const e=new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[]});el.dispatchEvent(e);return e.defaultPrevented};
  // panneau fermé : le geste n'est pas touché
  out.closed=swipe(document.body);
  // panneau ouvert, liste courte : tout est bloqué
  openPanel(()=>({title:'Court',html:group('',[row({ic:'🔹',t:'Une ligne',s:'Rien d’autre'})])}));let pb=document.getElementById('pbody');
  out.short=pb.scrollHeight<=pb.clientHeight+1;
  out.scrim=swipe(document.getElementById('sheet'));out.header=swipe(document.getElementById('ptitle'));out.rowShort=swipe(pb.querySelector('.row'));
  // liste longue : on peut défiler dedans, mais pas sur le fond ni l'en-tête
  closeSheet();openPanel(pAct);pb=document.getElementById('pbody');
  pb.insertAdjacentHTML('beforeend','<div style="height:3000px"></div>');
  out.long=pb.scrollHeight>pb.clientHeight+1;out.rowLong=swipe(pb.querySelector('.tile,.row'));out.scrimLong=swipe(document.getElementById('sheet'));out.headerLong=swipe(document.getElementById('ptitle'));
  // défilement horizontal à l'intérieur d'un panneau : autorisé
  pb.insertAdjacentHTML('beforeend','<div id="hs" style="overflow-x:auto;width:120px"><div style="width:600px;height:20px">x</div></div>');out.hscroll=swipe(document.getElementById('hs').firstChild);
  // champ de saisie : jamais bloqué
  pb.insertAdjacentHTML('beforeend','<textarea id="tt"></textarea>');out.field=swipe(document.getElementById('tt'));
  closeSheet();out.afterClose=swipe(document.body);
  // styles
  const cs=s=>getComputedStyle(document.querySelector(s));
  openPanel(pAct);out.css={sheet:cs('#sheet').touchAction,pb:cs('.pb').touchAction,overscroll:cs('.pb').overscrollBehaviorY,bodyOverflow:getComputedStyle(document.body).overflow};
  closeSheet();
  // fenêtre de dialogue
  modal({title:'Test',text:'Un texte court.',choices:[{t:'OK'}]});out.modalShort=swipe(document.getElementById('modal'));out.modalText=swipe(document.getElementById('mtext'));
  return out});
 r.ok=!errs.length&&r.closed===false&&r.short&&r.scrim&&r.header&&r.rowShort&&r.long&&r.rowLong===false&&r.scrimLong&&r.headerLong&&r.field===false&&r.hscroll===false&&r.afterClose===false
  &&r.css.sheet==='none'&&r.css.pb==='pan-x pan-y'&&r.css.overscroll==='contain'&&r.css.bodyOverflow==='hidden'&&r.modalShort&&r.modalText;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
