const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
 await pg.setContent('<body></body>');await pg.evaluate(fs.readFileSync('src/avatar.js','utf8')+';window.AVATAR_R=AV_A;');
 const r=await pg.evaluate(()=>{const A=AVATAR_R;let bad=[],n=0;const ages=[0,1,2,5,9,13,16,20,35,50,62,75,90];
  const parse=new DOMParser();
  const all=(k,arr)=>arr;
  for(let i=0;i<1500;i++){const g=i%2?'F':'H';const look=A.random(g);
   // forcer toutes les options au moins une fois
   look.hair=A.HAIRS[i%A.HAIRS.length];look.beard=A.BEARDS[(i>>1)%A.BEARDS.length];look.glasses=A.GLASSES[(i>>2)%A.GLASSES.length];look.acc=A.ACCS[(i>>1)%A.ACCS.length];look.top=A.TOPS[(i>>2)%A.TOPS.length];look.face=A.FACES[i%5];look.nose=A.NOSES[(i>>1)%5];look.lips=A.LIPS[i%3];look.makeup=A.MAKEUPS[i%6];look.mark=A.MARKS[i%4];
   for(const age of [ages[i%ages.length],ages[(i*7)%ages.length]]){for(const mood of [10,50,90]){
    try{const svg=A.render(look,{age,gender:g,mood,dead:i%11===0,crown:i%13===0,glasses:i%17===0});n++;
     const d=parse.parseFromString(svg,'image/svg+xml');if(d.querySelector('parsererror'))bad.push(['xml',JSON.stringify(look),age]);
     if(/NaN|undefined/.test(svg))bad.push(['nan',JSON.stringify(look),age]);}catch(e){bad.push(['throw',e.message,JSON.stringify(look),age])}}}}
  // anciens formats
  for(const old of [{skin:2,hc:1,eye:0,hair:1,shirt:3},{skin:0,hc:5,eye:2,hair:3,shirt:7},{},null,undefined,'x']){try{const s=A.render(old,{age:30,gender:'F',mood:60});if(/NaN|undefined/.test(s))bad.push(['old-nan',JSON.stringify(old)])}catch(e){bad.push(['old-throw',String(old),e.message])}}
  return {n,bad:bad.slice(0,8),nbad:bad.length}});
 console.log(JSON.stringify(r));await b.close()})();
