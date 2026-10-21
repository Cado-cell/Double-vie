/* Garde-fou de simplicité : échoue si la navigation se complique (listes trop longues, trop de panneaux, trop d'actions enfouies).
   Les plafonds se resserrent au fil des lots de simplicité : ne jamais les relever sans raison. Ils gardent environ 8 % de marge car la vie testée est tirée au hasard. */
const {spawnSync}=require('child_process');const fs=require('fs');const path=require('path');const os=require('os');
const BUDGET={
  8:{maxRows:30,panels:60,deep:5,total:200},
  30:{maxRows:30,panels:145,deep:150,total:700}
};
const r=spawnSync('node',[path.join(__dirname,'audit_nav.js'),...Object.keys(BUDGET)],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',timeout:900000});
if(r.status!==0){console.log((r.stdout||'')+(r.stderr||''));console.log('{"ok":false}');process.exit(1)}
const all=JSON.parse(fs.readFileSync(path.join(os.tmpdir(),'audit_nav.json'),'utf8'));
const res={};let ok=true;
for(const [age,b] of Object.entries(BUDGET)){
  const P=all[age].panels;
  const m={maxRows:Math.max(...P.map(p=>p.n)),panels:P.length,deep:P.filter(p=>p.depth>=4).reduce((s,p)=>s+p.act,0),total:P.reduce((s,p)=>s+p.act,0)};
  res[age]={mesure:m,plafond:b};
  for(const k of Object.keys(b))if(m[k]>b[k]){ok=false;console.log(`Âge ${age} : ${k} = ${m[k]} dépasse le plafond ${b[k]}`)}
}
console.log(JSON.stringify(res));console.log(JSON.stringify({ok}));process.exit(ok?0:1);
