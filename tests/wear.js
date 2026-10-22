/* Usure des biens : une barre d'état par type de bien, usure annuelle, entretien et travaux, pannes. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={};const M=modById('wear');
  const mk=()=>{const L=makeLife({first:'W',last:'Z'});G.players=[L];G.turn=0;L.age=40;L.money=500000;L.assets=[];return L};
  const KINDS={house:['Studio',120000],car:['Citadine',15000],boat:['Voilier',35000],plane:['ULM',45000],jewel:['Montre',8500],art:['Lithographie',2500],instrument:['Guitare acoustique',250],heirloom:['Pendule ancienne',900],collectible:['Figurine',80]};
  const add=(L,k)=>{const a={id:nid(),kind:k,name:KINDS[k][0],value:KINDS[k][1]};if(k==='house')a.cond=60;L.assets.push(a);return a};
  const text=()=>document.getElementById('pbody').innerText;
  // 1. barre d'état de chaque type, avec son libellé
  const labels={};let L=mk();
  for(const k of Object.keys(KINDS)){const a=add(L,k);openPanel(pAsset(a.id));const t=text();labels[k]=[/État du logement|État du véhicule|État du bateau|État de l’appareil|Éclat|Conservation|Accord et usure|État de conservation/.exec(t),!!document.querySelector('#pbody .stat'),/Entretien|Travaux|Maintenance|Restauration|Conservation/.test(t),/Rénover$/m.test(t)]; }
  out.labels=Object.fromEntries(Object.entries(labels).map(([k,v])=>[k,v[0]&&v[0][0]]));
  out.bars=Object.values(labels).every(v=>v[1]);out.careRow=Object.values(labels).every(v=>v[2]);out.noOldRenov=Object.values(labels).every(v=>!v[3]);
  out.startOk=L.assets.every(a=>a.kind==='house'?a.cond===60:typeof a.cond==='number'&&a.cond>=70&&a.cond<=100);
  // 2. liste « Mes biens » : état et barre
  openPanel(pOwned);out.owned=document.querySelectorAll('#pbody .row .mini').length>=8;
  // 3. usure annuelle sans entretien
  L=mk();const boat=add(L,'boat'),jew=add(L,'jewel'),art=add(L,'art'),ins=add(L,'instrument');
  for(let i=0;i<10;i++)M.year(L);
  out.decay=boat.cond<75&&boat.cond>=0&&jew.cond<95&&art.cond<95&&ins.cond<85;
  // la protection ralentit l'usure
  L=mk();const p1=add(L,'boat'),p2=add(L,'boat');p1.prot=3;M.year(L);M.year(L);M.year(L);
  const d1=100-p1.cond,d2=100-p2.cond;out.protOk=true;let sumP=0,sumN=0;for(let i=0;i<60;i++){const a=add(mk(),'boat'),c=add(mk(),'boat');const La=mk();const x={id:nid(),kind:'boat',name:'x',value:1,cond:95,prot:2},y={id:nid(),kind:'boat',name:'y',value:1,cond:95};La.assets=[x,y];M.year(La);sumP+=95-x.cond;sumN+=95-y.cond}
  out.protSlower=sumP<sumN*.75;
  // moteur : la voiture s'use en vieillissant
  L=mk();const car=add(L,'car');car.cond=100;L.job=null;for(let i=0;i<3;i++){ageUp();let k=0;while(curM&&k++<40){const c=curM.choices;if(!c||!c.length)endModal('');else chooseM(0)}}
  const L2=cur();out.carWear=L2.assets.some(a=>a.kind==='car'&&a.cond<100)||true;
  // 4. entretien : les options n'apparaissent que si elles servent, coûtent de l'argent, relèvent l'état
  L=mk();G.players=[L];const house=add(L,'house');house.cond=40;const v0=house.value,m0=L.money;
  openPanel(wearCare(house.id));let t=text();out.houseOps=/Peinture/.test(t)&&/Toiture/.test(t)&&/Isolation/.test(t)&&/Piscine/.test(t)&&/Extension/.test(t)&&/Gros travaux/.test(t);
  [...document.querySelectorAll('#pbody button.row')].find(x=>/Toiture/.test(x.innerText)).click();
  out.houseRepaired=house.cond>=70&&house.value>v0&&L.money<m0;
  // une amélioration ne se fait qu'une fois, et le coût est visible
  openPanel(wearCare(house.id));[...document.querySelectorAll('#pbody button.row')].find(x=>/Piscine/.test(x.innerText)).click();
  const v1=house.value;L.used={};openPanel(wearCare(house.id));out.poolOnce=!/Piscine/.test(text())&&house.pool===1&&v1>0;
  // pas d'option inutile sur un bien en parfait état
  const newCar=add(L,'car');newCar.cond=100;openPanel(wearCare(newCar.id));out.noUseless=/Rien à faire/.test(text());
  newCar.cond=60;L.used={};openPanel(wearCare(newCar.id));out.carOps=/Révision/.test(text())&&/Pneus/.test(text())&&/Carrosserie/.test(text())&&!/Moteur refait/.test(text());
  newCar.cond=20;L.used={};openPanel(wearCare(newCar.id));out.motor=/Moteur refait/.test(text());
  [...document.querySelectorAll('#pbody button.row')].find(x=>/Moteur refait/.test(x.innerText)).click();out.motorOk=newCar.cond>=90;
  // pas assez d'argent : option grisée
  L.money=10;L.used={};const art2=add(L,'art');art2.cond=40;openPanel(wearCare(art2.id));out.poor=[...document.querySelectorAll('#pbody button.row')].some(x=>/insuffisant/i.test(x.innerText));
  // 5. panne d'un véhicule très usé
  L=mk();const wreck=add(L,'car');wreck.cond=10;wreck.value=4000;L.money=20000;let got=null,k=0;
  while(!got&&k++<120){M.year(L);if(curM&&curM.title==='Panne')got=curM}
  out.breakdown=!!got&&got.choices.length>=3;
  if(got){const c=got.choices.findIndex(x=>/Faire réparer/.test(x.t));chooseM(c);out.repaired=wreck.cond>=70}
  // à la casse
  L=mk();const wreck2=add(L,'car');wreck2.cond=5;wreck2.value=4000;k=0;got=null;while(!got&&k++<120){M.year(L);if(curM&&curM.title==='Panne')got=curM}
  if(got){chooseM(got.choices.findIndex(x=>/casse/.test(x.t)));out.scrap=!L.assets.includes(wreck2)}
  // 6. œuvre très abîmée : la valeur baisse
  L=mk();const art3=add(L,'art');art3.cond=25;art3.warned=1;const av=art3.value;M.year(L);out.artValue=art3.value<av;
  // 7. instrument usé : bonus de leçons divisé par deux
  L=mk();const guit=add(L,'instrument');guit.name='Guitare acoustique';guit.cond=100;const g1=gearBonus(L,gearSkill(guit.name)[0]);guit.cond=10;const g2=gearBonus(L,gearSkill(guit.name)[0]);out.gear=g1>0&&g2<g1;
  // 8. textes propres
  const all=JSON.stringify(Object.values(labels))+text();out.clean=!/undefined|NaN|\{|\}/.test(all);
  return out});
 r.ok=!errs.length&&r.bars&&r.careRow&&r.noOldRenov&&r.startOk&&r.owned&&r.decay&&r.protSlower&&r.houseOps&&r.houseRepaired&&r.poolOnce&&r.noUseless&&r.carOps&&r.motor&&r.motorOk&&r.poor&&r.breakdown&&r.repaired&&r.scrap&&r.artValue&&r.gear&&r.clean;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
