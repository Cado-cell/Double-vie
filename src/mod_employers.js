/* Deux Vies — module « Employeurs » (id employers)
   Entreprises fictives par secteur, moral d’entreprise, évènements d’entreprise, concurrents, mutation, syndicalisme. */
(()=>{
const MOD='employers';
const SECT={banque:'Banque et finance',hopital:'Santé',resto:'Restauration',info:'Informatique et ingénierie',commerce:'Commerce',btp:'Bâtiment',transport:'Transport et logistique',ecole:'Enseignement',droit:'Droit et notariat',immo:'Immobilier',aero:'Aéronautique',gd:'Grande distribution',services:'Services aux entreprises',terre:'Terre et mer',artisan:'Artisanat et beauté',media:'Médias et création',public:'Fonction publique'};
const MAP={resto:'resto',cuisine:'resto',vente:'commerce',caisse:'gd',btp:'btp',plomb:'btp',elec:'btp',menuis:'btp',archi:'btp',menage:'services',secu:'services',call:'services',secret:'services',livr:'transport',taxi:'transport',poste:'transport',capit:'transport',agri:'terre',peche:'terre',coiff:'artisan',esthe:'artisan',boul:'artisan',meca:'artisan',soin:'hopital',infi:'hopital',med:'hopital',chir:'hopital',pharma:'hopital',dent:'hopital',veto:'hopital',psy:'hopital',police:'public',gendarme:'public',pomp:'public',douane:'public',juge:'public',diplo:'public',cherch:'public',immo:'immo',banqueg:'banque',finance:'banque',compta:'banque',steward:'aero',pilote:'aero',prof:'ecole',dev:'info',ing:'info',droit:'droit',notaire:'droit',mkt:'media',graph:'media',journ:'media',culture:'media',musicien:'media',coach:'media'};
/* [nom, effectif, réputation 0-100, style] */
const CAT={
banque:[['Banque Vermeil',18000,70,'costumes et objectifs trimestriels'],['Crédit des Trois Rivières',4500,60,'sérieux et hiérarchique'],['Caisse Rurale de Val-Clair',300,75,'ambiance familiale'],['NéoBanque Pixel',120,55,'startup décontractée, babyfoot inclus']],
hopital:[['Centre hospitalier de Bellerive',3500,65,'équipes soudées, gardes interminables'],['Clinique Saint-Aubin',400,72,'confort et rigueur'],['Polyclinique des Mimosas',250,58,'ambiance familiale'],['Hôpital Universitaire du Nord-Est',9000,80,'cadences infernales mais prestige']],
resto:[['Brasserie Chez Marcel',15,60,'ambiance familiale'],['Le Grand Café du Port',40,55,'cadences infernales'],['Groupe Table & Saveurs',900,50,'chaîne bien huilée'],['Maison Beaulieu',25,85,'exigence étoilée']],
info:[['Sofitech Conseil',6000,55,'projets sans fin'],['Pixelforge Studio',80,70,'startup décontractée'],['Algoria Systèmes',1200,65,'sérieux, télétravail partiel'],['Ingénia Group',15000,72,'grande maison, process lourds']],
commerce:[['Boutique Maison Lucette',8,65,'ambiance familiale'],['Mode & Compagnie',600,50,'objectifs de vente stricts'],['Les Galeries du Centre',2500,58,'rayons bondés, soldes éreintants'],['Bricolo Plus',1200,60,'bonne humeur et gilets orange']],
btp:[['Bâtir Sud-Ouest',1800,58,'chantiers en plein vent'],['Maçonnerie Delorme & Fils',20,70,'ambiance familiale'],['Groupe Édifice',12000,66,'gros chantiers, gros délais'],['Archi-Concept',45,68,'créatif et tatillon']],
transport:[['Transports Lavigne',250,55,'cadences infernales'],['Rapido Express',3000,48,'livraisons en 24 h chrono'],['Trans-Alpes Logistique',900,62,'sérieux et ponctuel'],['Compagnie Maritime de l’Atlantique',1500,66,'longues traversées']],
ecole:[['Collège Jean-Moulin',70,62,'équipe pédagogique soudée'],['Lycée Victor-Hélène',120,60,'réunions interminables'],['École privée Sainte-Clotilde',40,70,'discipline et tradition'],['Académie Montessori du Lac',25,75,'pédagogie douce']],
droit:[['Cabinet Dufresne & Associés',60,78,'prestigieux, horaires à rallonge'],['Étude Maître Lambert',12,65,'ambiance familiale'],['Cabinet Mercier-Blanc',200,70,'dossiers à la chaîne'],['Étude notariale Courtois',15,72,'tradition et parchemins']],
immo:[['Agence du Vieux Port',10,60,'ambiance familiale'],['Immo Prestige',80,68,'commissions et sourires'],['Groupe Foncia-Nova',1500,52,'objectifs agressifs'],['Maisons & Horizons',35,64,'convivial']],
aero:[['AéroNova Industries',22000,80,'prestige, process rigoureux'],['SkyFrance Compagnie',9000,66,'décalages horaires et escales'],['Turbolux Aéro',700,70,'ingénieurs passionnés'],['Atelier Cumulus',60,60,'ambiance familiale']],
gd:[['Hyper Bonprix',280,48,'cadences infernales'],['Supermarché Les Halles',90,60,'ambiance familiale'],['Groupe Mercadia',900,52,'rayons impeccables, pauses chronométrées'],['Drive Express Casino-Sud',60,56,'ambiance sportive']],
services:[['Net & Éclat Services',400,50,'horaires décalés'],['Vigilance Sécurité',1200,52,'rondes de nuit'],['Allo-Contact Plateau',600,45,'cadences infernales'],['Cabinet Gestion Plus',50,62,'ambiance familiale']],
terre:[['Coopérative Terre de France',700,58,'saisons rythmées'],['Ferme des Trois Chênes',12,68,'ambiance familiale'],['Armement Pêche du Large',200,52,'départs à l’aube'],['Domaine Beau-Soleil',30,72,'vignes et bonne humeur']],
artisan:[['Salon Chez Odette',6,66,'ambiance familiale'],['Garage Moreau & Fils',14,62,'cambouis et radio'],['Boulangerie Au Fournil Doré',9,74,'réveil à 3 h du matin'],['Réseau Beauté Éclat',300,55,'chaîne bien huilée']],
media:[['Le Courrier Libre',150,60,'bouclages à rallonge'],['Studio Lumière Production',60,68,'créatif et désordonné'],['Groupe Média Horizon',3000,62,'open space bruyant'],['Théâtre du Petit Faune',20,70,'passion et petits cachets']],
public:[['Préfecture régionale',900,50,'rigueur administrative'],['Direction départementale de l’Intérieur',1500,55,'hiérarchie stricte'],['Service public du Grand Est',700,52,'tampons et dossiers']]
};
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const ok=L=>{const j=L&&L.job;return !!(j&&!j.sp&&!j.mil&&j.c&&typeof j.c==='string')};
const secOf=c=>MAP[c]||'services';
const mk=(sec,r,mood)=>({name:r[0],sector:sec,size:r[1],rep:r[2],style:r[3],mood:mood!=null?mood:lim(r[2]+R(-15,15),5,95)});
const sizeLbl=n=>n<10?`TPE · ${n} salarié${n>1?'s':''}`:n<250?`PME · ${fmtn(n)} salariés`:n<5000?`Grande entreprise · ${fmtn(n)} salariés`:`Groupe · ${fmtn(n)} salariés`;
function pickCo(sec,not){const l=(CAT[sec]||CAT.services).filter(r=>r[0]!==not);return pick(l)}
function offers(L){
  const e=L.job.employer,sec=e.sector;if(sec==='public'){e.offers={y:L.age,l:[]};return}
  const l=(CAT[sec]||[]).filter(r=>r[0]!==e.name).sort(()=>Math.random()-.5).slice(0,R(2,3));
  e.offers={y:L.age,l:l.map(r=>{const f=lim(.9+(r[2]-55)/200+R(-8,16)/100,.8,1.3);return Object.assign(mk(sec,r),{sal:Math.round(L.job.sal*f)})})};
}
function ensure(L){
  if(!ok(L))return null;const j=L.job;
  if(!j.employer||typeof j.employer!=='object'||!j.employer.name){const sec=secOf(j.c);const e=mk(sec,pickCo(sec));e.since=L.age;j.employer=e;
    say(L,`🏢 Tu es ${ge(L,'embauché','embauchée')} chez ${e.name} (${SECT[sec].toLowerCase()}).`)}
  const e=j.employer;if(typeof e.mood!=='number')e.mood=50;if(typeof e.since!=='number')e.since=L.age;if(typeof e.size!=='number')e.size=50;
  if(!e.offers||e.offers.y!==L.age)offers(L);return e;
}
function boss(L){try{return bossOf(L)}catch(x){return null}}
function layoff(L,t){
  say(L,t);L.job=null;L.flags.chomage=2;L.flags.fired=1;chg(L,{happy:-12,stress:6});
}
function yearEv(L){
  const j=L.job,e=j.employer,m=e.mood,big=e.size>=500;let t;
  const roll=Math.random();if(roll>.2)return;
  const k=pick(['prime','prime','plan','fusion','rachat','directeur','tele','greve']);
  if(k==='prime'){if(m<40&&chance(.6))return;const p=Math.round(j.sal*R(3,10)/100);earn(L,p);j.perf=clamp(j.perf+3);chg(L,{happy:4});e.mood=clamp(m+4);say(L,`🎁 ${e.name} verse une prime de fin d’année : ${fmt(p)}.`)}
  else if(k==='plan'){if(m>60&&chance(.6))return;e.mood=clamp(m-15);if(chance(.3+(j.perf<40?.3:0)-(j.perf>75?.2:0))){layoff(L,`📉 Plan social chez ${e.name} : tu fais partie des ${ge(L,'licenciés','licenciées')}. Dur, dur.`)}else{j.perf=clamp(j.perf-4);chg(L,{stress:8,happy:-4});say(L,`📉 Plan social chez ${e.name} : tu échappes aux suppressions de postes, mais l’ambiance est glaciale.`)}}
  else if(k==='fusion'){const n=pickCo(e.sector,e.name);e.name=n[0]+' – '+e.name.split(/ [–-] /)[0].slice(0,18);e.size=Math.round(e.size*R(15,30)/10);e.mood=clamp(m-8);const d=R(-3,6);j.sal=Math.round(j.sal*(1+d/100));chg(L,{stress:4});say(L,`🤝 Fusion : ton entreprise devient ${e.name}. Nouveau logo, nouveaux badges${d>0?` et ${d} % de salaire en plus`:''}.`)}
  else if(k==='rachat'){const d=R(-4,5);j.sal=Math.round(j.sal*(1+d/100));e.mood=clamp(m+R(-12,10));e.size=Math.round(e.size*R(11,20)/10);chg(L,{stress:3});say(L,`💼 ${e.name} est rachetée par un fonds d’investissement. ${d>=0?'Les nouveaux actionnaires revalorisent ton salaire.':'Les économies commencent : ton salaire baisse un peu.'}`)}
  else if(k==='directeur'){const g=chance(.5);e.mood=clamp(m+(g?10:-10));j.perf=clamp(j.perf+(g?3:-3));if(chance(.4)){j.boss=newBoss(L)}say(L,`🧑‍💼 Nouveau directeur chez ${e.name} : ${g?'plein d’idées, et plutôt sympathique':'tout un programme, beaucoup de slides et peu de sourires'}.`)}
  else if(k==='tele'){e.tele=1;j.perf=clamp(j.perf+3);chg(L,{happy:4,stress:-4});e.mood=clamp(m+6);say(L,`🏠 ${e.name} instaure le télétravail deux jours par semaine. Pyjama et visioconférences.`)}
  else if(k==='greve'){const c=Math.round(j.sal*.02);if(c>0)L.money-=c;e.mood=clamp(m+(chance(.5)?8:-5));chg(L,{stress:2,karma:1});if(big&&chance(.5)){j.sal=Math.round(j.sal*1.02);t=' Les négociations aboutissent : +2 % pour tout le monde.'}say(L,`✊ Grève chez ${e.name} : tu perds ${fmt(c)} de salaire mais tu manifestes en bonne compagnie.${t||''}`)}
}
function year(L){
  if(!ok(L))return;const e=ensure(L);if(!e)return;const j=L.job;
  e.mood=clamp(e.mood+R(-6,6)+(e.rep-e.mood)/12+(e.tele?1:0));
  if(e.mood<25&&e.size<30&&chance(.08)){layoff(L,`🚪 ${e.name} met la clé sous la porte. Te voilà ${ge(L,'sans emploi','sans emploi')}.`);return}
  yearEv(L);
  if(L.job===j&&j.employer)offers(L);
}
/* ---------- Panneaux ---------- */
function jobOffer(L,o){
  const j=L.job,e=j.employer;const pc=lim(.45+(j.perf-50)/120+(L.st.smarts-50)/400+(o.rep>75?-.1:0),.2,.85);
  if(!chance(pc)){chg(L,{happy:-2});return out(L,`📨 ${o.name} décline ta candidature. « Nous gardons votre CV. » Bien sûr.`)}
  const old=e.name;j.sal=Math.max(1000,Math.round(o.sal));j.y=0;j.boss=newBoss(L);j.perf=clamp(R(48,62));
  j.employer={name:o.name,sector:o.sector,size:o.size,rep:o.rep,style:o.style,mood:o.mood,since:L.age};
  chg(L,{happy:6,stress:3});return out(L,`📝 Tu quittes ${old} pour ${o.name}, à ${fmt(j.sal)} par an. Nouveau patron, nouvelle machine à café.`);
}
function pEmployer(){
  const L=cur();if(!ok(L)||!L.job.employer)return {title:'Mon employeur',html:note('Aucun employeur pour le moment.')};
  const j=L.job,e=j.employer;if(!e.offers)e.offers={y:0,l:[]};const anc=Math.max(0,L.age-(e.since||L.age));
  const cow=(L.family||[]).filter(p=>p&&p.type==='friend'&&p.coworker&&p.alive!==false);
  const cr=cow.map(p=>row({av:avOf(p),t:`${p.first} ${p.last||''}`.trim(),s:`Collègue · ${An(p.age)} · relation ${Math.round(p.rel||0)} %`}));
  const off=(e.offers&&e.offers.l)||[];
  const orows=off.map(o=>act(L,{ic:'📨',t:`${o.name}`,s:`${fmt(o.sal)} par an · ${sizeLbl(o.size)} · ${o.style}`,key:'emp_post',fn:L=>jobOffer(L,o)}));
  return {title:'Mon employeur',html:
    card(e.name,SECT[e.sector]||'',`${sizeLbl(e.size)} · « ${e.style||'ambiance classique'} »`)
    +`<div class="list">`+`<div class="stat"><b>Moral de l’entreprise</b><span class="n">${Math.round(e.mood)} %</span>${bar(e.mood)}</div>`+`</div>`
    +note(`Ancienneté : ${anc} an${anc>1?'s':''}${e.tele?' · télétravail partiel':''}.`)
    +group('Collègues',[...cr,act(L,{ic:'☕',t:'Rencontrer un nouveau collègue',s:'Une fois par an',key:'emp_cow',fn:L=>{const f=addFriend(L,{coworker:1,age:L.age+R(-8,8)});chg(L,{happy:3});return out(L,`☕ À la cantine, tu sympathises avec ${f.first}.`)}})])
    +group('Carrière',[
      ...(off.length?orows:[e.sector==='public'?row({ic:'🏛️',t:'Postuler chez un concurrent',s:'Pas de concurrent dans la fonction publique',dis:1}):row({ic:'📨',t:'Postuler chez un concurrent',s:'Aucune offre cette année',dis:1})]),
      act(L,{ic:'🔁',t:'Demander une mutation',s:'Nouveau service, nouveau patron',key:'emp_mut',fn:L=>{
        if(chance(.35+(j.perf-50)/150)){j.boss=newBoss(L);const d=R(-2,4);j.sal=Math.round(j.sal*(1+d/100));j.y=Math.max(0,j.y-1);chg(L,{happy:3,stress:-2});return out(L,`🔁 Mutation acceptée : nouveau service, nouveau patron, ${d>0?'et une petite augmentation':'même salaire'}.`)}
        const b=boss(L);if(b)b.rel=clamp(b.rel-4);chg(L,{happy:-2});return out(L,'🔁 Ta demande de mutation est refusée « faute de poste disponible ».')}}),
      act(L,{ic:'✊',t:'Faire du syndicalisme',s:'Défendre les collègues, au risque de fâcher la direction',key:'emp_syn',fn:L=>{
        if(chance(.25)){j.sal=Math.round(j.sal*(1+R(2,4)/100));e.mood=clamp(e.mood+6);chg(L,{karma:3,happy:4,stress:2});return out(L,'✊ Victoire syndicale : une augmentation générale est obtenue. Tes collègues te paient un café.')}
        const b=boss(L);if(b&&chance(.5))b.rel=clamp(b.rel-5);chg(L,{karma:2,stress:3});j.perf=clamp(j.perf-1);return out(L,'✊ Tu portes la voix de tes collègues. La direction promet d’« étudier la question ».')}})
    ])};
}
registerMod({
  id:MOD,
  year(L){try{year(L)}catch(x){console.error(x)}},
  workRows(L){try{if(!ok(L))return[];const e=L.job.employer;if(!e||!e.name)return[];return [nav('🏢','Mon employeur',`${e.name} · moral ${Math.round(e.mood)} %`,pEmployer)]}catch(x){console.error(x);return[]}}
});
})();
