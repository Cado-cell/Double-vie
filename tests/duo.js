/* À deux, chacun chez soi : code de vie, comparaison, invitation, départ partagé, codes mal formés ou piégés. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();
 const r={};
 // départ partagé (écran de création)
 r.seed=await pg.evaluate(()=>{
  const f1=duoSeeded('Banane'),f2=duoSeeded('  banane '),f3=duoSeeded('ananas');
  const same=JSON.stringify(f1)===JSON.stringify(f2),diff=JSON.stringify(f1)!==JSON.stringify(f3);
  const rnd=Math.random;const restored=typeof rnd==='function'&&Math.random()!==Math.random();
  document.getElementById('s1-seed').value='banane';applySeed('s1');
  const a=[document.getElementById('s1-first').value,document.getElementById('s1-last').value,document.getElementById('s1-country').value];
  document.getElementById('s1-seed').value='ananas';applySeed('s1');document.getElementById('s1-seed').value='banane';applySeed('s1');
  const b2=[document.getElementById('s1-first').value,document.getElementById('s1-last').value,document.getElementById('s1-country').value];
  return {same,diff,restored,form:a.join()===b2.join()&&a[0]===f1.first&&a[2]===f1.country,empty:duoSeeded('  ')===null}});
 await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 await pg.evaluate(()=>{for(let i=0;i<30;i++){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}});
 // mon code et analyse
 r.code=await pg.evaluate(()=>{const L=cur();const c=duoCode(L);const o=duoParse(c);
  return {pref:c.slice(0,4),len:c.length,name:o&&o.n===L.first&&o.l===L.last,age:o&&o.a===L.age,sc:o&&o.sc===lifeScore(L),look:!!(o&&o.lk&&typeof o.lk==='object')}});
 // codes mal formés ou piégés
 r.bad=await pg.evaluate(()=>{
  const enc=o=>'DV1.'+btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const L=cur();const base=JSON.parse(decodeURIComponent(escape(atob(duoCode(L).slice(4).replace(/-/g,'+').replace(/_/g,'/')+'=='.slice(0,0)))))
  ;const out={};
  out.garbage=[duoParse(''),duoParse('abc'),duoParse('DV1.!!!'),duoParse('DV1.'+'A'.repeat(30)),duoParse(enc({v:2,n:'x'})),duoParse(enc('texte')),duoParse(null)].every(x=>x===null);
  const evil=duoParse(enc(Object.assign({},base,{n:'<img src=x onerror=alert(1)>Léa',l:'Z'.repeat(500),a:9999,sc:-50,nw:'abc',kd:1e9,aw:['<b>x</b>',1,2,3,4,5],ct:'Nulle part',lk:{hair:'<script>',skin:99999}})));
  out.evilClean=!!evil&&!/[<>]/.test(evil.n)&&evil.l.length<=30&&evil.a===130&&evil.sc===0&&evil.kd===60&&evil.aw.length<=3&&evil.ct==='France';
  return out});
 // comparaison : on se compare à une vie fabriquée
 r.cmp=await pg.evaluate(()=>{
  const L=cur();const enc=o=>'DV1.'+btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const code=enc({v:1,n:'Camille',l:'Durand',g:'F',a:41,al:1,nw:2500000,kd:2,sc:80,aw:['Millionnaire'],pe:'Bosseuse',jb:'Chirurgienne',ct:'France',lk:L.look});
  openPanel(duoPanel);const t=document.getElementById('pbody');
  const panel=!!document.getElementById('duo-code')&&/Mon code/.test(t.innerText);
  document.getElementById('duo-in').value='n’importe quoi';[...t.querySelectorAll('button.row')].find(x=>/Comparer/.test(x.innerText)).click();
  const refused=document.getElementById('ptitle').textContent==='À deux, chacun chez soi';
  document.getElementById('duo-in').value='Voici mon code : '+code+' à bientôt';[...t.querySelectorAll('button.row')].find(x=>/Comparer/.test(x.innerText)).click();
  const txt=document.getElementById('pbody').innerText;
  return {panel,refused,title:document.getElementById('ptitle').textContent,verdict:/verdict/i.test(txt),names:/Camille/.test(txt)&&new RegExp(L.first).test(txt),rows:/Score de vie/.test(txt)&&/Patrimoine/.test(txt)&&/Enfants/.test(txt),trophy:/🏆/.test(txt),inviteRow:/Inviter Camille/.test(txt)}});
 // invitation
 r.invite=await pg.evaluate(()=>{
  const L=cur(),n0=L.family.length;[...document.querySelectorAll('#pbody button.row')].find(x=>/Inviter Camille/.test(x.innerText)).click();
  const p=L.family.find(x=>x.tag==='echange');
  return {added:L.family.length===n0+1,role:p&&role(p),face:!!(p&&p.look),name:p&&p.first==='Camille'&&p.last==='Durand',stillThere:L.family.filter(x=>x.tag==='echange').length}});
 // le menu et le bilan proposent l'entrée
 r.menu=await pg.evaluate(()=>{closeSheet();openPanel(pMenu);return /À deux, chacun chez soi/.test(document.getElementById('pbody').innerText)});
 r.obit=await pg.evaluate(()=>{closeSheet();const L=cur();L.alive=false;L.cause='vieillesse';render();const o=document.querySelector('.obit');return !!o&&/Score de vie/.test(o.innerText)&&/Comparer avec ta moitié/.test(o.innerText)});
 r.ok=!errs.length&&r.seed.same&&r.seed.diff&&r.seed.restored&&r.seed.form&&r.seed.empty&&r.code.pref==='DV1.'&&r.code.name&&r.code.age&&r.code.sc&&r.code.look&&r.bad.garbage&&r.bad.evilClean
  &&r.cmp.panel&&r.cmp.refused&&r.cmp.verdict&&r.cmp.names&&r.cmp.rows&&r.cmp.trophy&&r.cmp.inviteRow&&r.invite.added&&/Ami.? d’une autre vie/.test(r.invite.role)&&r.invite.face&&r.invite.name&&r.invite.stillThere===1&&r.menu&&r.obit;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
