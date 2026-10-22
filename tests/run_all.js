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
 ['proches vivants (agents)','agents.js',[],o=>/"ok":true/.test(o)],
 ['souvenirs et rappels','memory.js',[],o=>/"ok":true/.test(o)],
 ['mémoire des proches et héritage','will.js',[],o=>/"ok":true/.test(o)],
 ['personnages récurrents','recurring.js',[],o=>/"ok":true/.test(o)],
 ['projets des proches','goals.js',[],o=>/"ok":true/.test(o)],
 ['personnalité qui se révèle','persona.js',[],o=>/"ok":true/.test(o)],
 ['à deux, chacun chez soi','duo.js',[],o=>/"ok":true/.test(o)],
 ['cadeaux','gifts.js',[],o=>/"ok":true/.test(o)],
 ['usure et entretien des biens','wear.js',[],o=>/"ok":true/.test(o)],
 ['rêves de vie','dreams.js',[],o=>/"ok":true/.test(o)],
 ['trait choisi à la création','traits.js',[],o=>/"ok":true/.test(o)],
 ['jalons de l’enfance','events4.js',[],o=>/"ok":true/.test(o)],
 ['carrière avancée (rythme, augmentation, retraite)','career.js',[],o=>/"ok":true/.test(o)],
 ['bilan de fin de vie et carte image','share.js',[],o=>/"ok":true/.test(o)],
 ['visite guidée et « Quoi de neuf »','tuto.js',[],o=>/"ok":true/.test(o)],
 ['aides ponctuelles','hints.js',[],o=>/"ok":true/.test(o)],
 ['panneau ouvert : rien ne bouge derrière','sheetlock.js',[],o=>/"ok":true/.test(o)],
 ['plafonds de navigation (simplicité)','nav_budget.js',[],o=>/"ok":true/.test(o)],
 ['hors connexion (paquet publié)','pwatest2.js',[],o=>/erreurs \[\]/.test(o)&&/"cached":8/.test(o)]
];
let bad=0;
/* Un test qui échoue est relancé une fois : une panne due au hasard ou à une machine lente passe au second essai,
   une vraie régression échoue deux fois. */
function run(file,args,ok){
  const r=spawnSync('node',[path.join(__dirname,file),...args],{cwd:ROOT,encoding:'utf8',timeout:600000});
  const out=(r.stdout||'')+(r.stderr||'');return {pass:r.status===0&&ok(out),out};
}
for(const [name,file,args,ok] of T){
  const t=Date.now();let res=run(file,args,ok),retry=false;
  if(!res.pass){retry=true;res=run(file,args,ok)}
  console.log((res.pass?'OK     ':'ÉCHEC  ')+name+(retry&&res.pass?' (réussi au 2e essai)':'')+'  ('+Math.round((Date.now()-t)/1000)+' s)');
  if(!res.pass){bad++;console.log(res.out.split('\n').slice(-12).join('\n'))}
}
srv.kill();console.log(bad?`\n${bad} test(s) en échec`:'\nTous les tests passent');process.exit(bad?1:0);
