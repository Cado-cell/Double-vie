const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route('**/fonts.g*/**',r=>r.abort());
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/src/test.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const bins={enfance:[0,17],adulte:[18,64],senior:[65,120]};const S={};for(const k in bins)S[k]={years:0,modals:0,lines:0,maxModals:0,maxLines:0,bilan:0,quiet:0,samples:[]};
  const om=window.modal;let cnt=0;window.modal=function(m){cnt++;return om.apply(this,arguments)};
  const kinds={};
  for(let n=0;n<5;n++){
   G.players[0]=makeLife({});
   for(let g=0;g<130&&cur().alive;g++){
    cnt=0;const L=cur();ageUp();let k=0;
    while(curM&&k++<40){kinds[(curM.title||'').replace(/\d+/g,'N').slice(0,30)]=(kinds[(curM.title||'').replace(/\d+/g,'N').slice(0,30)]||0)+1;const c=curM.choices;if(curM.mount&&(!c||!c.length))endModal('');else chooseM(0)}
    const a=L.age;const bk=Object.keys(bins).find(x=>a>=bins[x][0]&&a<=bins[x][1]);if(!bk)continue;
    const blk=L.log.filter(x=>x.age===a)[0];const lines=blk?blk.lines.length:0;const s=S[bk];
    s.years++;s.modals+=cnt;s.lines+=lines;s.maxModals=Math.max(s.maxModals,cnt);s.maxLines=Math.max(s.maxLines,lines);
    if(blk&&blk.lines.some(x=>x.startsWith('Bilan de l’année')))s.bilan++;
    if(blk&&blk.lines.length===1&&/tranquille|notable|comme les autres|doucement|sans histoire/.test(blk.lines[0]))s.quiet++;
    if(s.samples.length<3&&lines>=5)s.samples.push(blk.lines);
   }}
  const top=Object.entries(kinds).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return {S,top};
 });
 for(const k in r.S){const s=r.S[k];console.log(k,'années',s.years,'| fenêtres/an',(s.modals/s.years).toFixed(2),'(max',s.maxModals+')','| lignes/an',(s.lines/s.years).toFixed(1),'(max',s.maxLines+')','| bilan financier',Math.round(100*s.bilan/s.years)+'%','| années vides',Math.round(100*s.quiet/s.years)+'%')}
 console.log('plus longs exemples adulte:',JSON.stringify(r.S.adulte.samples[0]||[]).slice(0,700));
 console.log('titres de fenêtres les plus fréquents:',r.top.map(x=>x.join('×')).join(' ; '));
 console.log('errs',errs);await b.close()})();
