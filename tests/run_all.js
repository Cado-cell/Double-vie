/* Lance toute la batterie de tests depuis la racine du dépôt :  node tests/run_all.js
   Prérequis : playwright installé globalement (npm i -g playwright) et le paquet construit
   (python3 tools/build_pwa.py && node tools/make_icons.js). Code de sortie 0 = tout est bon. */
const {spawnSync,spawn}=require('child_process');const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const srv=spawn('python3',['-m','http.server','8765'],{cwd:path.join(ROOT,'pwa'),stdio:'ignore'});
const T=[
 ['avatars (9 000 rendus)','fuzzav.js',[],o=>{try{return JSON.parse(o.trim().split('\n').pop()).nbad===0}catch(e){return false}}],
 ['parcours de l’interface','crawl.js',[],o=>/ERRORS 0/.test(o)],
 ['simulation de vies','sim3.js',['100'],o=>/ERRORS 0/.test(o)],
 ['sauvegardes','savetest.js',[],o=>/errs \[\]/.test(o)],
 ['migration d’anciennes sauvegardes','legacymig.js',[],o=>/errs": \[\]|errs \[\]/.test(o)],
 ['boutique des enfants','kidshop.js',[],o=>!/Error|TypeError/.test(o)],
 ['matériel et compétences','geartest.js',[],o=>/errs \[\]/.test(o)],
 ['effets (animations, sons, réglages)','fx.js',[],o=>/"ok":true/.test(o)],
 ['simplicité (idées rapides, éléments masqués, récents)','simplicity.js',[],o=>/"ok":true/.test(o)],
 ['trait choisi à la création','traits.js',[],o=>/"ok":true/.test(o)],
 ['jalons de l’enfance','events4.js',[],o=>/"ok":true/.test(o)],
 ['carrière avancée (rythme, augmentation, retraite)','career.js',[],o=>/"ok":true/.test(o)],
 ['bilan de fin de vie et carte image','share.js',[],o=>/"ok":true/.test(o)],
 ['visite guidée et « Quoi de neuf »','tuto.js',[],o=>/"ok":true/.test(o)],
 ['plafonds de navigation (simplicité)','nav_budget.js',[],o=>/"ok":true/.test(o)],
 ['hors connexion (paquet publié)','pwatest2.js',[],o=>/erreurs \[\]/.test(o)&&/"cached":8/.test(o)]
];
let bad=0;
for(const [name,file,args,ok] of T){
  const t=Date.now();const r=spawnSync('node',[path.join(__dirname,file),...args],{cwd:ROOT,encoding:'utf8',timeout:600000});
  const out=(r.stdout||'')+(r.stderr||'');const pass=r.status===0&&ok(out);
  console.log((pass?'OK     ':'ÉCHEC  ')+name+'  ('+Math.round((Date.now()-t)/1000)+' s)');if(!pass){bad++;console.log(out.split('\n').slice(-12).join('\n'))}
}
srv.kill();console.log(bad?`\n${bad} test(s) en échec`:'\nTous les tests passent');process.exit(bad?1:0);
