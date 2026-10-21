const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/src/test.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(async()=>{
  const e2=[];console.error=(...a)=>e2.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join('|'):String(x)).join(' '));
  const drain=()=>{let n=0;while(curM&&n++<60){const c=curM.choices;if(curM.mount&&(!c||!c.length))endModal('');else chooseM(Math.floor(Math.random()*Math.max(1,(c||[1]).length)))}};
  const L=cur();L.age=34;L.money=2e6;L.edu.stage='done';L.edu.degrees.push('bac');L.prison=0;L.job=null;
  L.zoo={name:'Zoo test',an:[{sp:'Lion',name:'Simba',age:3,h:90},{sp:'Lion',name:'Nala',age:4,h:85}],rep:50,y:2,land:300000};
  L.spy={rank:1,missions:3,cover:80};L.cult={name:'Ordre du Test',fol:50,dev:60,heat:10};
  L.mob={fam:'Le Clan des Calanques',rank:1,resp:30,heat:1};L.pol={office:1,party:'Union Républicaine',approval:60,support:0,cand:null,term:3};
  L.biz={name:'Nova Test',sector:'Technologie',value:500000,share:100,emp:5,y:2,mk:0};L.bm={stock:{'Montres contrefaites':10},heat:5};
  L.assets.push({id:nid(),kind:'house',name:'Maison test',value:300000,loan:0,pay:0,left:0,cond:70,rented:{name:'Jean Test',rent:12000,rel:70,late:0}});
  const before=JSON.stringify({z:L.zoo.an.length,s:L.spy.rank,c:L.cult.fol,m:L.mob.rank,p:L.pol.office,b:L.biz.value});
  for(let i=0;i<8;i++){ageUp();drain();if(!cur().alive)break}
  const M=cur();const out={before,after:JSON.stringify({z:M.zoo&&M.zoo.an&&M.zoo.an.length,s:M.spy&&M.spy.rank,c:M.cult&&M.cult.fol,m:M.mob&&M.mob.rank,p:M.pol&&M.pol.office,b:M.biz&&M.biz.value}),alive:M.alive,age:M.age,rented:M.assets.filter(a=>a.rented).length};
  // ouverture de tous les panneaux de modules
  let opened=0;for(const m of MODS){try{if(m.activities)for(const x of [].concat(m.activities(M)||[])){if(x&&x.panel){openPanel(x.panel);opened++}}}catch(e){e2.push('panel '+m.id+' '+e.message)}}
  closeSheet();out.opened=opened;
  // carrière spéciale à l’ancien format
  M.alive=true;M.job={c:'acteur',sp:1,lvl:2,perf:60,y:3,works:4};for(let i=0;i<4;i++){ageUp();drain()}
  M.job&&(out.job={c:M.job.c,lvl:M.job.lvl});out.errs=[...new Set(e2)];return out});
 console.log(JSON.stringify(r,null,1));console.log('page errs',errs);await b.close()})();
