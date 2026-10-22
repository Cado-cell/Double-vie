/* Cadeaux : choix selon l'âge, les goûts et le budget ; un cadeau par an ; cadeau qui plaît ; gêne ; partenaire. */
const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');const dir='src';
(async()=>{const b=await chromium.launch();
 const h=fs.readFileSync(dir+'/deux-vies.html','utf8');fs.writeFileSync(dir+'/shot.html','<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+h+'</body></html>');
 const pg=await b.newPage({viewport:{width:390,height:844}});await pg.route('**/fonts.g*/**',r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.cwd()+'/'+dir+'/shot.html');await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});await pg.reload();await pg.click('[data-mode="1"]');await pg.click('#goBtn');
 const r=await pg.evaluate(()=>{
  const out={};
  const mk=(age,money)=>{const L=makeLife({first:'D',last:'Z'});G.players=[L];G.turn=0;L.age=35;L.money=money;return L};
  const add=(L,age,rel,type)=>{const p=person(pick(['H','F']),age,null,L.country);p.type=type||'friend';p.rel=rel==null?70:rel;L.family.push(p);return p};
  const panel=(L,id)=>{closeSheet();openPanel(giftPanelFor(id));return document.getElementById('pbody')};
  window.giftPanelFor=id=>pGift(id);
  const rows=(L,id)=>{G.players=[L];G.turn=0;openPanel(pGift(id));const t=document.getElementById('pbody');const r=[...t.querySelectorAll('.row')].map(x=>x.innerText.replace(/\s+/g,' ').trim());closeSheet();return r};
  // 1. selon l'âge
  const ages={};
  for(const a of [2,8,15,35,75]){const L=mk(35,5000);const p=add(L,a);ages[a]=rows(L,p.id)}
  out.baby=!ages[2].some(x=>/ordinateur|Smartphone|voyage de rêve|Dîner au restaurant/i.test(x))&&ages[2].some(x=>/peluche|mobile|vêtements|couverture/i.test(x));
  out.kid=!ages[8].some(x=>/bijou|ordinateur portable|montre|Un voyage/i.test(x))&&ages[8].some(x=>/Lego|livre|puzzle|ballon|vélo|jeu vidéo|kit/i.test(x));
  out.teen=ages[15].some(x=>/baskets|casque|smartphone|console|manga|skateboard|sweat|concert/i.test(x));
  out.adult=ages[35].some(x=>/bouteille|restaurant|montre|week-end|chocolats|roman/i.test(x));
  out.senior=ages[75].some(x=>/plante|plaid|radio|livre en gros|thermal|fauteuil|pâtisserie|car/i.test(x))&&!ages[75].some(x=>/skateboard|manga|console/i.test(x));
  out.maxRows=Math.max(...Object.values(ages).map(a=>a.length));
  // 2. selon le budget
  const poor=mk(35,30),mid=mk(35,2000),rich=mk(35,500000);
  const pp=add(poor,35),pm=add(mid,35),pr=add(rich,35);
  const R1=rows(poor,pp.id),R2=rows(mid,pm.id),R3=rows(rich,pr.id);
  const price=t=>{const m=t.replace(/\s/g,'').match(/(\d+)€/);return m?+m[1]:0};
  const aff=a=>a.filter(x=>!/insuffisant/i.test(x));
  out.poorMax=Math.max(0,...aff(R1).map(price));out.richMax=Math.max(0,...aff(R3).map(price));out.poorDream=R1.some(x=>/insuffisant/i.test(x));
  out.poorHasFree=R1.some(x=>/fait main/i.test(x));out.richHasBig=R3.some(x=>price(x)>=500);out.midNoBig=!aff(R2).some(x=>price(x)>2000);
  // 3. cadeau qui plaît
  const trial=(liked)=>{let tot=0,n=80;for(let i=0;i<n;i++){const L=mk(35,9999);const it=giftItems().find(x=>x[0]==='Un roman');
    let p;do{p=add(L,35,50);L.family.pop()}while(giftTastes(p).includes(it[3])!==liked);L.family.push(p);const r0=p.rel;giftGive(L,p,false,it,20);tot+=p.rel-r0}return tot/n};
  out.likedGain=trial(true);out.otherGain=trial(false);
  // 4. un cadeau par an : après le cadeau le panneau l'indique
  {const L=mk(35,3000);const p=add(L,40);openPanel(pGift(p.id));const rw=[...document.querySelectorAll('#pbody button.row')].find(x=>/fait main/.test(x.innerText));rw.click();
   out.usedNote=/déjà offert/.test((openPanel(pGift(p.id)),document.getElementById('pbody').innerText));closeSheet()}
  // 5. gêne : cadeau de luxe à un quasi-inconnu
  {const L=mk(35,100000);const p=add(L,40,15);const it=giftItems().find(x=>x[0]==='Un bijou précieux');const t=giftGive(L,p,false,it,1500);out.awkward=/gêné/.test(t)}
  // 6. partenaire : cadeaux romantiques, effet sur la relation de couple
  {const L=mk(35,5000);const q=person('F',33,null,L.country);setPartner(L,q);L.partner.rel=50;const rw=rows(L,'partner');out.partnerRom=rw.some(x=>/roses|lettre d’amour|dîner aux chandelles|concert à deux/i.test(x));
   const it=giftItems().find(x=>x[0]==='Des roses rouges');const r0=L.partner.rel;giftGive(L,partnerOf(L),true,it,45);out.partnerRel=L.partner.rel>r0}
  // 7. les cadeaux de la personne : ligne dans sa fiche
  {const L=mk(35,500);const p=add(L,30);openPanel(()=>pPerson(p.id));out.personRow=/Offrir un cadeau/.test(document.getElementById('pbody').innerText);closeSheet()}
  // 8. texte propre
  const all=[...ages[2],...ages[8],...ages[15],...ages[35],...ages[75],...R1,...R2,...R3].join(' ');out.clean=!/undefined|NaN|\{|\}/.test(all);
  return out});
 r.ok=!errs.length&&r.baby&&r.kid&&r.teen&&r.adult&&r.senior&&r.maxRows<=10&&r.poorMax<=30&&r.richMax>=500&&r.poorHasFree&&r.poorDream&&r.richHasBig&&r.midNoBig&&r.likedGain>r.otherGain*1.2&&r.usedNote&&r.awkward&&r.partnerRom&&r.partnerRel&&r.personRow&&r.clean;
 console.log(JSON.stringify(r));console.log('errs',JSON.stringify(errs));await b.close()})();
