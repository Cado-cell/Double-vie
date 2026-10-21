const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');
const specs=JSON.parse(process.argv[2]||'[]');const size=+process.argv[3]||190;const cols=+process.argv[4]||6;const out=process.argv[5]||'faces2.png';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:cols*(size+14)+20,height:600},deviceScaleFactor:1});
 const src=fs.readFileSync('src/avatar.js','utf8');
 await pg.setContent(`<body style="margin:0;background:#FFF1CC;font:11px sans-serif"><div id="g" style="display:grid;grid-template-columns:repeat(${cols},${size}px);gap:12px;padding:10px"></div></body>`);
 await pg.evaluate(src+';window.AVATAR_R=AV_A;');
 await pg.evaluate(([specs,size])=>{let h='';for(const sp of specs){const {g,age,mood,label,...look}=sp;
   const base={skin:2,hc:2,eye:0,eyes:'amande',brows:'naturels',hair:'court',beard:'aucune',glasses:'aucune',acc:'aucun',top:'tshirt',topc:4,bg:0};
   h+=`<div style="text-align:center"><div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;background:#fff">${AVATAR_R.render(Object.assign(base,look),{age:age??30,gender:g||'H',mood:mood??55})}</div>${label||JSON.stringify(look).slice(0,40)}</div>`}
  document.getElementById('g').innerHTML=h},[specs,size]);
 await pg.screenshot({path:out,fullPage:true});await b.close()})();
