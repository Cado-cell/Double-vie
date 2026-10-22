/* Deux Vies — module « Usure et entretien des biens » (id wear)
   Chaque bien a une barre d'état (a.cond, 100 = comme neuf) adaptée à sa nature : état du logement, du véhicule, du bateau,
   de l'appareil, éclat d'un bijou, conservation d'une œuvre, accord d'un instrument… Sans entretien l'état baisse chaque année
   (et la valeur avec, sous 30 %). Chaque bien a ses propres options d'entretien et de travaux (écran « Entretien » du bien).
   Les maisons et les voitures sont usées par le moteur du jeu (engine.js) ; les autres biens le sont ici.
   Pannes : un véhicule en très mauvais état finit par tomber en panne. État du bien : a.cond, a.prot (années de protection),
   a.insul / a.terr / a.pool / a.ext (améliorations déjà faites sur une maison). */
(()=>{
const MOD='wear';
/* lab : libellé de la barre · start : état d'un bien neuf · decay : perte annuelle [min,max] (maisons et voitures : moteur) */
const WEAR={
  house:{lab:'État du logement',start:80,decay:null,verb:'Travaux et améliorations',ic:'🔨'},
  car:{lab:'État du véhicule',start:100,decay:null,verb:'Entretien et réparations',ic:'🔧'},
  boat:{lab:'État du bateau',start:95,decay:[3,7],verb:'Entretien du bateau',ic:'⚓'},
  plane:{lab:'État de l’appareil',start:95,decay:[2,5],verb:'Maintenance de l’appareil',ic:'🛠️'},
  jewel:{lab:'Éclat',start:100,decay:[1,3],verb:'Entretien du bijou',ic:'✨'},
  art:{lab:'Conservation',start:100,decay:[1,3],verb:'Conservation de l’œuvre',ic:'🖌️'},
  instrument:{lab:'Accord et usure',start:100,decay:[2,5],verb:'Entretien de l’instrument',ic:'🎼'},
  heirloom:{lab:'Conservation',start:70,decay:[1,2],verb:'Restauration',ic:'🏺'},
  collectible:{lab:'État de conservation',start:90,decay:[1,2],verb:'Conservation',ic:'🧸'}
};
const SHORT={house:'logement',car:'véhicule',boat:'bateau',plane:'appareil',jewel:'éclat',art:'conservation',instrument:'accord',heirloom:'conservation',collectible:'conservation'};
const fc=c=>.45+.55*Math.max(0,Math.min(100,c))/100;       // même formule que la gestion locative
const k$=(L,v)=>Math.max(5,Math.round(v*Math.min(2,costOf(L))/10)*10);
/* Options d'entretien par type : [clé, icône, titre, effet en mots, coût fixe, % de la valeur, coût mini, gain d'état, % de valeur gagné, drapeau « une seule fois », protection (années), condition d'affichage] */
const OPS={
  house:[
    ['paint','🎨','Peinture et petits travaux','Rafraîchit l’intérieur',0,1.2,800,15,0,0,0,a=>a.cond<92],
    ['roof','🏚️','Toiture et plomberie','Les vraies réparations',0,3,2500,30,0,0,0,a=>a.cond<75],
    ['insul','🌡️','Isolation et fenêtres','Factures plus basses, logement plus sain',0,4,3000,10,3,'insul',0,a=>!a.insul],
    ['terr','🌿','Terrasse et jardin','Un coin de paradis',0,5,3500,0,4,'terr',0,a=>!a.terr],
    ['pool','🏊','Piscine','Tous les étés en vacances',0,8,9000,0,5,'pool',0,a=>!a.pool],
    ['ext','📐','Extension : une pièce de plus','Plus de place, plus de valeur',0,15,20000,0,12,'ext',0,a=>!a.ext]
  ],
  car:[
    ['serv','🛢️','Révision','Vidange, filtres, niveaux',250,0,0,25,0,0,0,a=>a.cond<85],
    ['tyre','🛞','Pneus et freins','Pour rouler en sécurité',450,0,0,20,0,0,0,a=>a.cond<80],
    ['body','🚘','Carrosserie','Plus de rayures, plus de valeur',900,0,0,30,3,0,0,a=>a.cond<70],
    ['motor','⚙️','Moteur refait à neuf','La grosse opération',2500,0,0,60,8,0,0,a=>a.cond<45]
  ],
  boat:[
    ['hull','🛥️','Carénage de la coque','Antifouling et peinture',0,3,300,35,0,0,0,a=>a.cond<80],
    ['eng','⚙️','Révision du moteur','Avant la saison',0,2,200,25,0,0,0,a=>a.cond<85],
    ['winter','🧊','Hivernage','Abri et bâche : l’usure ralentit',0,1,80,0,0,0,1,a=>!a.prot]
  ],
  plane:[
    ['check','📋','Visite annuelle','Obligatoire pour voler tranquille',0,3,1500,30,0,0,0,a=>a.cond<85],
    ['over','⚙️','Révision moteur complète','Le grand ménage mécanique',0,6,4000,40,0,0,0,a=>a.cond<60]
  ],
  jewel:[
    ['clean','🧼','Nettoyage chez le bijoutier','Il brille comme au premier jour',50,0,0,25,0,0,0,a=>a.cond<90],
    ['mount','🔩','Réparer la monture','Griffes, fermoir, chaîne',200,0,0,40,1,0,0,a=>a.cond<60]
  ],
  art:[
    ['dust','🧽','Dépoussiérage par un expert','Un petit soin',150,0,0,15,0,0,0,a=>a.cond<90],
    ['rest','🖌️','Restauration','Un restaurateur reprend l’œuvre',0,4,300,40,6,0,0,a=>a.cond<60],
    ['glass','🪟','Vitrine et éclairage adaptés','Conservation ralentie pendant 3 ans',0,2,200,0,0,0,3,a=>!a.prot]
  ],
  instrument:[
    ['tune','🎚️','Accordage','Retrouver le bon son',40,0,0,25,0,0,0,a=>a.cond<85],
    ['luth','🪕','Révision chez un luthier','Pour qu’il dure encore',0,6,100,50,2,0,0,a=>a.cond<50]
  ],
  heirloom:[
    ['rest','🏺','Restauration soignée','Redonner du lustre',0,5,200,35,4,0,0,a=>a.cond<70]
  ],
  collectible:[
    ['case','🪟','Vitrine de protection','Conservation ralentie pendant 3 ans',60,0,0,20,0,0,3,a=>!a.prot]
  ]
};

const has=a=>a&&WEAR[a.kind];
function norm(a){
  if(!has(a))return a;
  if(typeof a.cond!=='number'||!isFinite(a.cond))a.cond=WEAR[a.kind].start;
  a.cond=Math.max(0,Math.min(100,Math.round(a.cond)));return a;
}
window.wearStart=kind=>WEAR[kind]?WEAR[kind].start:undefined;
window.wearNorm=norm;
window.wearBar=a=>has(a)?statLine(WEAR[a.kind].lab,norm(a).cond):'';
window.wearShort=a=>has(a)?`${SHORT[a.kind]} ${norm(a).cond} %`:'';
window.wearUse=(a,n)=>{if(has(a)){norm(a);a.cond=Math.max(0,a.cond-(n||1))}};

function opCost(L,a,o){return o[4]?k$(L,o[4]):k$(L,Math.max(o[6],a.value*o[5]/100))}
function runOp(L,a,o){
  const lab=WEAR[a.kind].lab,before=a.cond;
  if(a.kind==='house'&&o[7]>0){const c1=Math.min(100,a.cond+o[7]);a.value=Math.round(a.value*fc(c1)/fc(a.cond));a.cond=c1}
  else a.cond=Math.min(100,a.cond+o[7]);
  if(o[8])a.value=Math.round(a.value*(1+o[8]/100));
  if(o[9])a[o[9]]=1;
  if(o[10])a.prot=o[10];
  if(o[0]==='motor')a.cond=Math.max(a.cond,90);
  if(['terr','pool'].includes(o[0]))chg(L,{happy:o[0]==='pool'?5:3});
  if(o[0]==='ext')chg(L,{happy:2});
  track(L,'repairs');
  return out(L,`${o[1]} ${o[2]} : ${a.name.toLowerCase()}${a.cond>before?` passe à ${a.cond} % (${lab.toLowerCase()})`:' est amélioré'}.`);
}
const pCare=id=>()=>{
  const L=cur(),a=L.assets.find(x=>x.id===id);
  if(!a||!has(a))return {title:'Entretien',html:note('Ce bien n’existe plus.')};
  norm(a);const W=WEAR[a.kind];
  const ops=(OPS[a.kind]||[]).filter(o=>o[11](a));
  const rows=ops.map(o=>{const c=opCost(L,a,o);return act(L,{ic:o[1],t:o[2],s:`${fmt(c)} · ${o[3]}`,cost:c,key:'care_'+o[0]+a.id,fn:L=>runOp(L,a,o)})});
  if(a.kind==='house'&&typeof landlordRenov==='function')rows.push(nav('🏗️','Gros travaux (chantier d’un an)','Rénovation complète ou montée en gamme',landlordRenov(a.id)));
  const warn=a.cond<30?note('Très usé : la valeur baisse plus vite'+(['car','boat','plane'].includes(a.kind)?' et une panne peut arriver n’importe quand.':'.')):'';
  return {title:W.verb,html:card(a.name,fmt(a.value),a.prot>0?`Protégé encore ${a.prot} an${a.prot>1?'s':''} : l’usure ralentit.`:'Sans entretien, l’état baisse chaque année.',statLine(W.lab,a.cond))+warn
    +(rows.length?group('Que faire ?',rows):note('Rien à faire pour l’instant : ce bien est en très bon état.'))};
};
window.wearCare=pCare;

/* ---------- Une année passe ---------- */
function breakdown(L,a){
  const k=a.kind,what={car:'tombe en panne sur le bord de la route',boat:'prend l’eau au port',plane:'refuse de démarrer sur le tarmac'}[k];
  const cost=k$(L,Math.max(k==='car'?600:k==='boat'?1500:6000,a.value*.12));
  modal({title:'Panne',icon:KIND_IC[k]||'🔧',text:`${a.name} ${what}. Il est dans un état vraiment fatigué (${a.cond} %).`,choices:[
    L.money>=cost?{t:`Faire réparer (${fmt(cost)})`,pri:1,fn:()=>{spend(L,cost);a.cond=Math.max(a.cond,70);return out(L,`🔧 Réparé pour ${fmt(cost)} : ${a.name.toLowerCase()} repart comme neuf (${a.cond} %).`)}}:null,
    {t:'Rouler (ou naviguer) quand même',danger:true,fn:()=>{a.cond=Math.max(0,a.cond-8);if(chance(.3)){chg(L,{health:-8,stress:4,happy:-3});return out(L,`💥 Ça tourne mal : accident avec ${a.name.toLowerCase()}. Tu t’en sors avec une belle frayeur et quelques bleus.`)}return out(L,`😬 Tu t’en sors cette fois-ci, mais ${a.name.toLowerCase()} n’en a plus pour longtemps.`)}},
    {t:'Vendre à la casse',fn:()=>{const v=Math.round(a.value*.25);L.assets=L.assets.filter(x=>x!==a);if(L.home===a.id)L.home=null;earn(L,v,1);return out(L,`🏚️ ${a.name} part à la casse pour ${fmt(v)}.`)}}].filter(Boolean)});
}
function year(L){
  if(!L||L.age<10||L.alive===false)return;
  let asked=false;
  for(const a of [...(L.assets||[])]){
    if(!has(a))continue;norm(a);const W=WEAR[a.kind];
    if(W.decay){
      const d=R(W.decay[0],W.decay[1]);a.cond=Math.max(0,a.cond-Math.round(d*(a.prot>0?.5:1)));
    }
    if(a.prot>0)a.prot--;
    if(a.cond<30&&!['house','car','boat','plane'].includes(a.kind)&&a.kind!=='instrument')a.value=Math.round(a.value*.97);
    if(a.cond<30&&!a.warned){a.warned=1;say(L,`⚠️ ${a.name} : état très dégradé (${a.cond} %). Un peu d’entretien s’impose.`)}
    else if(a.cond>=45)a.warned=0;
    if(!asked&&['car','boat','plane'].includes(a.kind)&&a.cond<25&&chance(.3)){asked=true;breakdown(L,a)}
  }
}
registerMod({id:MOD,year,
  assetDetailRows(L,a){
    if(!has(a))return [];norm(a);
    return [nav(WEAR[a.kind].ic,WEAR[a.kind].verb,`${WEAR[a.kind].lab} : ${a.cond} %`,pCare(a.id))];
  }});
})();
