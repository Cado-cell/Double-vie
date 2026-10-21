/* Deux Vies — module « Affaires et rue » (id business_street)
   1. Entreprise (L.biz) : start-up ou rachat, allocation du capital, stocks, lancements marketing, équipe, rapport annuel, cession / Bourse
   2. Débrouillard de rue (carrière spéciale « arnaqueur ») : territoires, combines, vigilance policière
   3. Trafiquant (carrière spéciale « trafiquant ») : contenu abstrait, chaîne d’approvisionnement, territoires, rivalité, chaleur policière
   Reprend et migre l’ancien format L.biz de mod_legacy.js (name, sector, value, share, emp, y, mk, ipo). */
(()=>{
const MOD='business_street';
const num=(v,d)=>typeof v==='number'&&isFinite(v)?v:d;
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
const rng=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
const co=L=>{try{return costOf(L)||1}catch(e){return 1}};
const pc=v=>(Math.round(v*10)/10).toString().replace('.',',')+' %';
const sgn=n=>(n>=0?'+':'−')+fmtk(Math.abs(n));

/* =====================================================================
   1. ENTREPRISE
   ===================================================================== */
const SECT={
 'Restauration':{ic:'🍽️',u:'couverts',p:28,c:14,pe:4000,obs:.55,g:.03,vol:.12,mkt:18e6,mult:.9,txt:'Marges serrées et produits frais : le gaspillage coûte cher.'},
 'Mode':{ic:'👗',u:'pièces',p:60,c:22,pe:1800,obs:.3,g:.04,vol:.22,mkt:25e6,mult:1.1,txt:'Les collections se démodent vite : gare aux invendus.'},
 'Technologie':{ic:'💻',u:'appareils',p:400,c:170,pe:300,obs:.35,g:.09,vol:.3,mkt:60e6,mult:2.2,txt:'Croissance forte, marché volatil, stock vite périmé.'},
 'Cosmétiques':{ic:'💄',u:'flacons',p:30,c:8,pe:3500,obs:.12,g:.05,vol:.15,mkt:30e6,mult:1.6,txt:'Belles marges, image de marque décisive.'},
 'Jeux vidéo':{ic:'🎮',u:'copies',p:45,c:12,pe:2500,obs:.08,g:.06,vol:.4,mkt:45e6,mult:2,txt:'Un hit ou rien : la demande est imprévisible.'},
 'Transport':{ic:'🚚',u:'courses',p:90,c:55,pe:1300,obs:.85,g:.025,vol:.1,mkt:22e6,mult:.8,txt:'Une course non vendue est perdue pour toujours.'},
 'Agroalimentaire':{ic:'🥖',u:'colis',p:6,c:3.2,pe:20000,obs:.45,g:.02,vol:.1,mkt:35e6,mult:.9,txt:'Gros volumes, petites marges, péremption rapide.'},
 'Énergie solaire':{ic:'☀️',u:'installations',p:9000,c:6200,pe:13,obs:.02,g:.08,vol:.2,mkt:55e6,mult:1.7,txt:'Peu de ventes mais de gros chantiers.'}
};
const PLAN=[.6,.85,1,1.3,1.8];
const PLANN=['Très prudente (60 %)','Prudente (85 %)','Ajustée (100 %)','Ambitieuse (130 %)','Pari de stock (180 %)'];
const LAUNCH=[
 {n:'Aucun lancement',ic:'💤',m:1,base:0,pr:0,s:'Pas de dépense, pas d’effet.'},
 {n:'Campagne d’affichage',ic:'🪧',m:1.08,base:4000,pr:.015,s:'Demande ×1,08. Sûr et discret.'},
 {n:'Opération influenceurs',ic:'🤳',m:1.2,base:10000,pr:.04,s:'Demande ×1,2… mais un bad buzz peut tout gâcher.'},
 {n:'Spot à la télévision',ic:'📺',m:1.45,base:60000,pr:.09,s:'Demande ×1,45. Très cher, très visible.'}
];
const WAGE=[{n:'Salaires bas',m:.85,s:'−15 % de masse salariale. Le moral descend, les départs montent.'},{n:'Salaires du marché',m:1,s:'Rien à signaler.'},{n:'Salaires élevés',m:1.25,s:'+25 % de masse salariale. Équipe motivée, productive, fidèle.'}];
const PRE=['Nova','Hexa','Atelier','Maison','Studio','Groupe','Lumen','Kiwi','Mistral','Canopée','Octave','Les Ateliers','Maison','Éclat','Bouclier','Origami','Tournesol','Cap'];
const SUF=['Azur','Volta','Canopée','Mistral','Ondine','& Fils','Lab','Express','France','Factory','Hexagone','Lumière','Partners','Délices'];
const bizName=L=>`${pick(PRE)} ${pick([L.last,pick(SUF)])}`;
const sect=B=>SECT[B.sector]||SECT['Technologie'];
const launchCost=(B,k)=>Math.round(LAUNCH[k].base+LAUNCH[k].pr*num(B.rev,0));
const satur=(B,S,c)=>Math.max(0,(num(B.rev,0)/(S.mkt*c)-.15)*1.5);
const g0=(B,S,c)=>S.g+(B.tech-30)/400+(B.brand-30)/350-satur(B,S,c);
const fcast=(B,S,c,k)=>Math.max(1,B.dem*(1+g0(B,S,c))*LAUNCH[lim(k|0,0,3)].m);
const bval=(B,S)=>Math.max(0,Math.round((B.cash+num(B.rev,0)*S.mult*(1+lim(num(B.gr,0),-.3,.5))+num(B.stock,0)*S.c*.5+B.brand*num(B.rev,0)*.003)*(B.ipo?1+num(B.px,0):1)));

function fill(B,S){
  B.name=String(B.name||'Ma société');
  B.share=lim(Math.round(num(B.share,100)),1,100);B.emp=Math.max(0,Math.round(num(B.emp,0)));B.y=Math.max(0,Math.round(num(B.y,0)));
  const a=B.alloc;
  if(!a||typeof a!=='object'||['rd','mk','prod','res'].some(k=>num(a[k],-1)<0)||Math.abs(a.rd+a.mk+a.prod+a.res-100)>1)B.alloc={rd:15,mk:20,prod:55,res:10};
  B.wage=[0,1,2].includes(B.wage)?B.wage:1;B.morale=lim(num(B.morale,65),0,100);B.brand=lim(num(B.brand,30+num(B.mk,0)*3),0,100);B.tech=lim(num(B.tech,30),0,100);
  B.stock=Math.max(0,Math.round(num(B.stock,0)));B.plan=lim(Math.round(num(B.plan,2)),0,4);B.launch=lim(Math.round(num(B.launch,0)),0,3);B.pay=[0,30,60].includes(B.pay)?B.pay:30;
  B.cash=num(B.cash,0);B.rev=Math.max(0,num(B.rev,0));B.profit=num(B.profit,0);B.dem=Math.max(1,num(B.dem,B.rev/S.p||1));B.gr=num(B.gr,0);B.msh=num(B.msh,0);B.px=num(B.px,0);
  if(!Array.isArray(B.hist))B.hist=[];
  B.value=Math.max(0,Math.round(num(B.value,bval(B,S))));
}
function bz(L){
  const B=L.biz;if(!B||typeof B!=='object')return null;
  if(!SECT[B.sector])B.sector='Restauration';
  const S=SECT[B.sector];
  if(!B.v2){ /* migration depuis la version simple */
    const val=Math.max(5000,num(B.value,20000));B.value=val;
    B.emp=Math.max(0,Math.round(num(B.emp,1))-1); /* l’ancien effectif comptait le fondateur */
    B.cash=Math.round(val*.12);
    B.rev=Math.round(Math.max((val-B.cash)/S.mult,B.emp*S.p*S.pe*.5));
    if(B.y>0&&B.emp===0&&num(B.value,0)>1e6)B.emp=Math.round(B.rev/(S.p*S.pe));
    B.dem=Math.max(1,B.rev/S.p);B.v2=1;
  }
  fill(B,S);return B;
}
function newBiz(L,name,sector,capital){
  const S=SECT[sector];
  L.biz={v2:1,name,sector,share:100,emp:0,y:0,mk:0,cash:capital,rev:0,profit:0,dem:Math.max(1,capital*1.2/S.p),stock:0,plan:2,launch:0,pay:30,wage:1,morale:70,brand:30,tech:30,alloc:{rd:15,mk:20,prod:55,res:10},hist:[],gr:0,px:0,value:capital,cap0:capital};
  trackMax(L,'bizMax',capital);track(L,'bizCreated');
  return L.biz;
}
function offers(L){
  const r=rng(hash(L.id+'|'+L.age+'|rachat'));const ks=Object.keys(SECT);const out=[];
  for(let i=0;i<3;i++){
    const k=ks[Math.floor(r()*ks.length)],S=SECT[k];
    const rev=Math.round((150000+Math.pow(r(),2)*2400000)/1000)*1000;
    const price=Math.round(rev*S.mult*(.8+r()*.5)*(.6+co(L)*.4)/1000)*1000+20000;
    const nm=`${PRE[Math.floor(r()*PRE.length)]} ${[L.last,SUF[Math.floor(r()*SUF.length)]][Math.floor(r()*2)]}`;
    const emp=Math.max(0,Math.round(rev/(S.p*S.pe))-1);
    out.push({k,nm,rev,price,emp,brand:Math.round(25+r()*40),tech:Math.round(25+r()*40),y:Math.round(2+r()*9)});
  }
  return out;
}
function buyBiz(L,o){
  const S=SECT[o.k];
  L.biz={v2:1,name:o.nm,sector:o.k,share:100,emp:o.emp,y:0,mk:0,cash:Math.round(o.rev*.08),rev:o.rev,profit:Math.round(o.rev*.05),dem:Math.max(1,o.rev/S.p),stock:0,plan:2,launch:0,pay:30,wage:1,morale:55,brand:o.brand,tech:o.tech,alloc:{rd:15,mk:20,prod:55,res:10},hist:[],gr:.02,px:0,value:o.price,bought:1};
  L.biz.value=Math.max(o.price,bval(L.biz,S));
  trackMax(L,'bizMax',L.biz.value);track(L,'bizBought');
  return out(L,`🏢 Tu rachètes ${o.nm} (${o.k.toLowerCase()}) pour ${fmt(o.price)}. Les ${o.emp+1} personnes de l’équipe te regardent d’un air méfiant.`);
}

function advice(B,S,r){
  const a=[];
  if(r.lost>r.D*.12)a.push(`Rupture de stock : tu as raté ${fmtn(r.lost)} ${S.u} de ventes. Produis davantage ou finance mieux la production.`);
  if(r.left>(r.sold+r.left)*.25&&r.left>3)a.push(`Surstock : ${fmtn(r.left)} ${S.u} sont restés en rayon${S.obs>.3?' et une partie a déjà fini à la poubelle':''}. Vise un plan de production plus prudent.`);
  if(B.morale<45)a.push('Le moral des équipes est bas : relève les salaires ou offre une formation avant que les meilleurs ne partent.');
  if(r.profit<0)a.push('Tu perds de l’argent : réduis les dépenses de marketing ou de R&D, ou relève la production.');
  if(B.cash<0)a.push('Ton compte est à découvert : la banque facture des intérêts salés.');
  if(B.tech<35)a.push('Ta technologie prend du retard : dote davantage la R&D.');
  if(B.brand<30)a.push('Ta marque est peu connue : un lancement marketing ferait du bien.');
  if(r.msh>25)a.push('Tu atteins la saturation du marché local : pense au rachat d’un concurrent ou à l’Introduction en Bourse.');
  if(!a.length)a.push('Année équilibrée. Continue comme ça, mais ne t’endors pas.');
  return a.slice(0,3);
}
function reportHtml(B,S,r){
  const rows=[['Chiffre d’affaires',fmtk(r.rev)],['Bénéfice',sgn(r.profit)],['Part de marché',pc(r.msh)],['Ventes',`${fmtn(r.sold)} ${S.u}`],['Production',`${fmtn(r.units)} ${S.u}`],['Stock restant',`${fmtn(B.stock)} ${S.u}`],['Masse salariale',fmtk(r.payroll)],['Argent en caisse',sgn(B.cash)],['Valeur de l’entreprise',fmtk(B.value)]];
  return '<table style="width:100%;border-collapse:collapse">'+rows.map(([a,b])=>`<tr><td style="padding:3px 0;opacity:.75">${esc(a)}</td><td style="text-align:right"><b>${esc(b)}</b></td></tr>`).join('')+'</table>'
    +'<p style="margin-top:10px"><b>Conseils du directeur financier</b></p>'+advice(B,S,r).map(t=>`<p style="margin:4px 0">• ${esc(t)}</p>`).join('');
}

function bizYear(L){
  const B=bz(L);if(!B)return;
  const S=sect(B),c=co(L);B.y++;
  /* équipe */
  const wm=WAGE[B.wage].m;
  const payroll=Math.round(B.emp*30000*(c*.5+.5)*wm);
  B.morale=clamp(B.morale+[-7,0,6][B.wage]+(B.profit>0?1:-3)+R(-3,3)-(L.prison?4:0));
  let quits=0;
  if(B.emp>0&&B.morale<38){quits=Math.min(B.emp,Math.max(1,Math.round(B.emp*R(6,22)/100)));B.emp-=quits;B.morale=clamp(B.morale+4)}
  const prodv=.6+.5*B.morale/100;
  const cap=Math.max(1,Math.round((B.emp+1.5*(L.prison?.3:1))*S.pe*prodv));
  /* allocation du capital */
  const cash0=Math.max(0,B.cash);
  const rdS=Math.round(cash0*B.alloc.rd/100),mkS=Math.round(cash0*B.alloc.mk/100);
  const pb=Math.round(cash0*B.alloc.prod/100)+Math.round(B.rev*.3);
  const base=Math.max(15000,B.rev*.1);
  B.tech=clamp(B.tech-3+Math.min(14,rdS/base*12));
  /* lancement */
  let k=B.launch;while(k>0&&cash0-rdS-mkS<launchCost(B,k))k--;
  const lc=launchCost(B,k);let lm=LAUNCH[k].m,buzz=0;
  if(k===2&&chance(.22)){lm=.92;buzz=1;B.brand=clamp(B.brand-6)}
  B.brand=clamp(B.brand-3+Math.min(14,mkS/base*12)+k*2);
  /* demande */
  const gE=g0(B,S,c);
  const g=gE+gauss()*S.vol*.6+(chance(.08)?-.08:0);
  const org=Math.max(1,B.dem*(1+g));
  const D=Math.max(0,Math.round(org*lm));
  /* production et stocks */
  const exp=Math.max(1,B.dem*(1+gE)*LAUNCH[k].m);
  const planned=Math.max(0,Math.round(exp*PLAN[B.plan])-B.stock);
  const uc=S.c*(1-(B.tech-50)/500);
  const units=Math.max(0,Math.min(planned,cap,Math.floor(pb/uc)));
  const avail=B.stock+units,sold=Math.min(D,avail),lost=Math.max(0,D-avail),left=avail-sold;
  const obs=Math.round(left*S.obs),stockN=left-obs;
  if(lost>0)B.brand=clamp(B.brand-Math.min(8,lost/Math.max(1,D)*20));
  /* comptes */
  const price=S.p*(1+(B.brand-50)/400);
  const rev=Math.round(sold*price);
  const prodCost=Math.round(units*uc),storage=Math.round(stockN*S.c*.08);
  const overhead=Math.round(2000*c+rev*.025);
  const interest=B.cash<0?Math.round(-B.cash*.09):0;
  const profit=rev-prodCost-storage-payroll-overhead-rdS-mkS-lc-interest;
  const tax=Math.max(0,Math.round(profit*.25));
  B.cash=Math.round(B.cash-rdS-mkS-lc-prodCost-storage-payroll-overhead-interest+rev-tax);
  let divT=0,divMe=0;const net=profit-tax;
  if(net>0&&B.pay>0&&B.cash>0){divT=Math.round(Math.min(B.cash*.8,net*B.pay/100));B.cash-=divT;divMe=Math.round(divT*B.share/100);if(divMe>0)earn(L,divMe)}
  /* mise à jour de l’état */
  B.stock=stockN;B.dem=Math.max(1,org*(1+.12*(lm-1)));B.gr=B.rev>0?lim(rev/B.rev-1,-.9,3):.1;B.rev=rev;B.profit=profit;
  const msh=rev/(S.mkt*c)*100;B.msh=msh;B.mk=0;
  if(B.ipo)B.px=lim(B.px+gauss()*.07,-.3,.4);
  B.value=bval(B,S);
  const res={rev,profit,sold,units,lost,left,D,payroll,msh};
  B.hist.push({a:L.age,rev,profit,sh:Math.round(msh*10)/10});if(B.hist.length>10)B.hist.shift();
  trackMax(L,'bizMax',B.value);
  if(B.value>=2e6)chg(L,{fame:1});
  /* faillite */
  if(B.value<2000||B.cash<-(rev*.5+30000*c)){
    say(L,`💸 ${B.name} dépose le bilan. Les créanciers se partagent ce qu’il reste, et toi, tu gardes les cernes.`);
    L.biz=null;chg(L,{happy:-15,stress:10});track(L,'bizFail');return;
  }
  const lines=[`📊 ${B.name} : chiffre d’affaires ${fmtk(rev)}, ${profit>=0?'bénéfice':'perte'} ${fmtk(Math.abs(profit))}.`];
  if(divMe>0)lines.push(`Tu perçois ${fmt(divMe)} de part des bénéficess.`);
  if(quits)lines.push(`${quits} salarié${quits>1?'s ont':' a'} démissionné.`);
  if(dropped(B,k))lines.push('Faute de argent en caisse, le lancement marketing a été revu à la baisse.');
  if(buzz)lines.push('Bad buzz : l’opération influenceurs vire au fiasco sur les réseaux.');
  say(L,lines.join(' '));
  B.rep=reportHtml(B,S,res);B.repAge=L.age;
  modal({title:`${B.name} · rapport annuel`,icon:S.ic,html:B.rep,choices:[{t:'Continuer'}]});
}
const dropped=(B,k)=>k<B.launch;

/* ---------- Panneaux entreprise ---------- */
function pBiz(){
  const L=cur();const B=bz(L);
  if(!B)return {title:'Entreprise',html:note('Lance ta start-up ou rachète une société existante. Dimensionne tes stocks, soigne ton équipe, et un jour peut-être la Bourse t’ouvrira ses portes.')
    +`<div class="card"><label class="f">Nom de ta start-up (facultatif)<input id="bz-name" maxlength="40" autocomplete="off" placeholder="Laisser vide pour un nom généré"></label></div>`
    +group('Créer une start-up',Object.keys(SECT).map(k=>row({ic:SECT[k].ic,t:k,s:SECT[k].txt,right:'›',a:()=>createFlow(L,k)})))
    +group('Racheter une société',offers(L).map(o=>act(L,{ic:SECT[o.k].ic,t:`${o.nm} · ${o.k}`,s:`CA ${fmtk(o.rev)} · ${o.emp+1} personne${o.emp?'s':''} · ${o.y} ans d’existence · ${fmt(o.price)}`,cost:o.price,min:18,fn:L=>buyBiz(L,o)})))
    +note('Les offres de rachat changent chaque année.')};
  const S=sect(B),c=co(L);
  const fc=Math.round(fcast(B,S,c,B.launch));
  const ex=statLine('Moral des équipes',B.morale)+statLine('Image de marque',B.brand)+statLine('Technologie et R&D',B.tech);
  return {title:B.name,html:card(`${B.sector}${B.ipo?' · cotée en Bourse':''}`,fmtk(B.value),`Tu détiens ${B.share} % · ta part vaut ${fmtk(B.value*B.share/100)} · ${An(B.y)} d’existence`,ex)
    +note(`Argent en caisse ${fmtk(B.cash)} · dernier chiffre d’affaires ${fmtk(B.rev)} · ${B.profit>=0?'bénéfice':'perte'} ${fmtk(Math.abs(B.profit))} · part de marché ${pc(B.msh)} · ${B.emp+1} personne${B.emp?'s':''}`)
    +note(`Demande attendue cette année : environ ${fmtn(fc)} ${S.u}.`)
    +group('Piloter l’année',[
      nav('🧮','Allocation du capital',`R&D ${B.alloc.rd} % · marketing ${B.alloc.mk} % · production ${B.alloc.prod} % · réserve ${B.alloc.res} %`,pAlloc),
      nav('📦','Production et stocks',`${PLANN[B.plan]} · stock : ${fmtn(B.stock)} ${S.u}`,pStock),
      nav('📣','Lancement marketing',LAUNCH[B.launch].n,pLaunch),
      nav('👥','Équipe et salaires',`${B.emp+1} personne${B.emp?'s':''} · ${WAGE[B.wage].n.toLowerCase()}`,pTeam)])
    +group('Bilan et avenir',[
      row({ic:'📊',t:'Rapport annuel',s:B.rep?`Exercice de ${B.repAge} ans`:'Disponible après la première année',dis:!B.rep,a:()=>modal({title:`${B.name} · rapport annuel`,icon:S.ic,html:B.rep||'',choices:[{t:'Fermer'}]})}),
      nav('🏗️','Croissance externe',`Concurrents et investisseurs`,pGrowth),
      nav('🔔','Cession et Bourse',B.value>=5e6?'Introduction en Bourse possible':'Vendre ou entrer en Bourse (dès 5 M€)',pExit)])};
}
function createFlow(L,k){
  const el=document.getElementById('bz-name');const nm=(el&&el.value.trim().slice(0,40))||bizName(L);
  const caps=[20000,50000,100000,250000,1000000].filter(x=>x<=L.money);
  if(!caps.length){toast('Il te faut au moins 20 000 € de capital.');return}
  modal({title:`Créer ${nm}`,icon:SECT[k].ic,text:`Quel capital de départ injectes-tu dans ta start-up (${k.toLowerCase()}) ? Plus tu mets, plus tu démarres fort, mais c’est ton argent.`,choices:caps.map((x,i)=>({t:`${fmt(x)}`,pri:i===0,fn:()=>{spend(L,x);newBiz(L,nm,k,x);return out(L,`🏢 Tu fonds ${nm} (${k.toLowerCase()}) avec ${fmt(x)} de capital. Les statuts sont signés, le café est offert.`)}})).concat([{t:'Renoncer'}])});
}
const PRESETS=[['Équilibré',{rd:20,mk:20,prod:40,res:20}],['Cap sur la R&D',{rd:45,mk:10,prod:30,res:15}],['Offensive marketing',{rd:10,mk:45,prod:30,res:15}],['Tout pour la production',{rd:10,mk:10,prod:65,res:15}],['Prudence',{rd:5,mk:5,prod:40,res:50}]];
const ALN={rd:['🔬','R&D'],mk:['📣','Marketing'],prod:['🏭','Production'],res:['🏦','Réserve']};
function shift(B,k,d){const A=B.alloc;
  if(d<0){const t=Math.min(-d,A[k]);A[k]-=t;if(k!=='res')A.res+=t;else A.prod+=t;return t}
  let need=d;for(const s of ['res','prod','mk','rd']){if(s===k||need<=0)continue;const min=s==='prod'?10:0;const t=Math.min(need,A[s]-min);if(t>0){A[s]-=t;need-=t}}
  A[k]+=d-need;return d-need;
}
function pAlloc(){
  const L=cur();const B=bz(L);if(!B)return {title:'Allocation',html:note('Pas d’entreprise.')};
  const cash=Math.max(0,B.cash);const A=B.alloc;
  const rows=[];
  for(const k of ['rd','mk','prod','res'])rows.push(row({ic:ALN[k][0],t:`${ALN[k][1]} : ${A[k]} %`,s:`≈ ${fmtk(cash*A[k]/100)} sur l’année · toucher pour +10 points`,right:'+10',a:()=>run(()=>{const t=shift(B,k,10);return t?`${ALN[k][1]} : ${A[k]} %`:'Rien à retirer ailleurs.'})}),row({ic:'➖',t:`Retirer 10 points à ${ALN[k][1].toLowerCase()}`,dis:A[k]<=0,a:()=>run(()=>{shift(B,k,-10);return `${ALN[k][1]} : ${A[k]} %`})}));
  return {title:'Allocation du capital',html:note('Chaque année, ta argent en caisse est répartie : la R&D améliore ton produit et réduit tes coûts, le marketing nourrit la marque, la production finance les stocks, la réserve ne bouge pas.')
    +card('Argent en caisse',fmtk(B.cash),`R&D ${A.rd} % · marketing ${A.mk} % · production ${A.prod} % · réserve ${A.res} %`)
    +group('Répartitions types',PRESETS.map(([n,v])=>row({ic:'🧮',t:n,s:`R&D ${v.rd} · marketing ${v.mk} · production ${v.prod} · réserve ${v.res}`,a:()=>run(()=>{B.alloc=Object.assign({},v);return `Allocation : ${n.toLowerCase()}.`})})))
    +group('Réglage fin',rows)
    +group('Part des bénéficess',[0,30,60].map(p=>row({ic:'💶',t:p?`Verser ${p} % du bénéfice net`:'Ne rien verser',s:p?'Imposable pour toi, mais ça fait plaisir':'Tout reste dans l’entreprise',right:B.pay===p?'✓':'',a:()=>run(()=>{B.pay=p;return p?`Part des bénéficess : ${p} % du bénéfice net.`:'Plus de part des bénéficess.'})})))};
}
function pStock(){
  const L=cur();const B=bz(L);if(!B)return {title:'Stocks',html:note('Pas d’entreprise.')};
  const S=sect(B),c=co(L);const fc=fcast(B,S,c,B.launch);const spread=S.vol*.6*1.3;
  const cap=Math.round((B.emp+1.5)*S.pe*(.6+.5*B.morale/100));
  const uc=S.c*(1-(B.tech-50)/500);
  return {title:'Production et stocks',html:note('Ce que tu produis face à ce que les clients veulent : trop peu, ce sont des ventes perdues et une marque qui s’use ; trop, des invendus qui coûtent de la place, et parfois périment.')
    +card('Demande attendue',`${fmtn(fc*(1-spread))} à ${fmtn(fc*(1+spread))} ${S.u}`,`Capacité de production : ${fmtn(cap)} ${S.u} · stock actuel : ${fmtn(B.stock)} · perte de stock invendu : ${Math.round(S.obs*100)} %`)
    +group('Plan de production',PLAN.map((m,i)=>{const u=Math.max(0,Math.round(fc*m)-B.stock);return row({ic:['🐢','🚶','🎯','🚀','🎲'][i],t:PLANN[i],s:`≈ ${fmtn(u)} ${S.u} à produire · ${fmtk(u*uc)} de coût`,right:B.plan===i?'✓':'',a:()=>run(()=>{B.plan=i;return `Production : ${PLANN[i].toLowerCase()}.`})})}))
    +note('La production réelle est bornée par ta capacité (effectif et moral) et par le budget de production de l’allocation du capital.')};
}
function pLaunch(){
  const L=cur();const B=bz(L);if(!B)return {title:'Marketing',html:note('Pas d’entreprise.')};
  return {title:'Lancement marketing',html:note('Un lancement multiplie la demande de l’année et laisse une trace dans les esprits. Le coût est prélevé sur la argent en caisse en fin d’année ; sans fonds suffisants, l’opération est revue à la baisse.')
    +group('Choisir un lancement',LAUNCH.map((l,i)=>row({ic:l.ic,t:l.n,s:`${l.s} Coût : ${fmtk(launchCost(B,i))}`,right:B.launch===i?'✓':'',a:()=>run(()=>{B.launch=i;return `Lancement : ${l.n.toLowerCase()}.`})})))};
}
function pTeam(){
  const L=cur();const B=bz(L);if(!B)return {title:'Équipe',html:note('Pas d’entreprise.')};
  const c=co(L),per=Math.round(30000*(c*.5+.5)*WAGE[B.wage].m);
  return {title:'Équipe et salaires',html:card('Masse salariale',fmtk(B.emp*per),`${B.emp} salarié${B.emp>1?'s':''} + toi · ${fmt(per)} par salarié et par an`,statLine('Moral',B.morale)+statLine('Productivité',Math.round((.6+.5*B.morale/100)*90)))
    +group('Niveau de salaire',WAGE.map((w,i)=>row({ic:['📉','⚖️','📈'][i],t:w.n,s:w.s,right:B.wage===i?'✓':'',a:()=>run(()=>{B.wage=i;return `${w.n} : c’est noté.`})})))
    +group('Effectifs',[
      act(L,{ic:'🧑‍💼',t:'Recruter 1 personne',s:`+${fmt(per)} par an`,key:'bz_rec1',dis:B.emp>=400?'Effectif maximal':'',fn:L=>{B.emp++;B.morale=clamp(B.morale+1);return out(L,`${B.name} recrute une nouvelle tête.`)}}),
      act(L,{ic:'👥',t:'Recruter 5 personnes',s:`+${fmt(per*5)} par an`,key:'bz_rec5',dis:B.emp>=400?'Effectif maximal':'',fn:L=>{B.emp+=5;B.morale=clamp(B.morale+3);return out(L,`${B.name} recrute cinq personnes d’un coup. Le café s’épuise.`)}}),
      act(L,{ic:'👋',t:'Licencier 1 personne',s:'Moral en baisse',key:'bz_lic',dis:B.emp<1?'Tu es seul à bord':'',fn:L=>{B.emp--;B.morale=clamp(B.morale-R(4,9));return out(L,'Un départ contraint : l’ambiance n’est plus la même.')}}),
      act(L,{ic:'🎓',t:'Offrir une formation',s:`${fmt(Math.round(1500*Math.max(1,B.emp)))} · moral +8`,cost:Math.round(1500*Math.max(1,B.emp)),key:'bz_form',fn:L=>{B.morale=clamp(B.morale+8);B.tech=clamp(B.tech+2);return out(L,'Séminaire de cohésion, formations et croissants : les équipes reviennent regonflées.')}})])};
}
function pGrowth(){
  const L=cur();const B=bz(L);if(!B)return {title:'Croissance',html:note('Pas d’entreprise.')};
  const S=sect(B);const costA=Math.round(Math.max(30000,B.value*.25));
  return {title:'Croissance externe',html:note('Rachète un concurrent pour grossir d’un coup, ou fais entrer des investisseurs au capital.')
    +group('Options',[
      act(L,{ic:'🥊',t:'Racheter un concurrent',s:`${fmt(costA)} · demande +25 %, équipe élargie, moral secoué`,cost:costA,key:'bz_acq',fn:L=>{const ne=Math.max(1,Math.round(B.emp*.2));B.emp+=ne;B.dem*=1.25;B.morale=clamp(B.morale-6);B.brand=clamp(B.brand+3);track(L,'bizBought');return out(L,`🥊 Tu absorbes un concurrent de ${B.sector.toLowerCase()} et ${ne} de ses salariés.`)}}),
      act(L,{ic:'🦄',t:'Lever des fonds',s:`Cède 20 % pour environ ${fmtk(B.value*.2*.85)} de argent en caisse`,key:'bz_vc',dis:B.share<=30?'Tu ne contrôlerais plus ta société':'',fn:L=>{const g=Math.round(B.value*.2*.85);B.share-=20;B.cash+=g;B.value=bval(B,S);return out(L,`🦄 Des investisseurs injectent ${fmt(g)} contre 20 % du capital.`)}})])};
}
function pExit(){
  const L=cur();const B=bz(L);if(!B)return {title:'Cession',html:note('Pas d’entreprise.')};
  const S=sect(B);const mine=Math.round(B.value*B.share/100);
  return {title:'Cession et Bourse',html:card('Valeur de l’entreprise',fmtk(B.value),`Ta part (${B.share} %) : ${fmtk(mine)}`)
    +group('Sortir ou grandir',[
      act(L,{ic:'🔔',t:'Introduction en Bourse',s:B.ipo?'Déjà cotée':'Mise sur le marché de 25 % du capital · valeur minimale : 5 M€',dis:B.ipo?'Déjà cotée':B.value<5e6?'Valeur minimale : 5 M€':'',fn:L=>{const g=Math.round(B.value*.25*.95);B.ipo=1;B.share=Math.max(1,Math.round(B.share*.75));B.cash+=g;B.px=.08;B.value=bval(B,S);chg(L,{fame:10,happy:8});track(L,'ipo');return out(L,`🔔 ${B.name} entre en Bourse. Tu sonnes la cloche, 25 % du capital passe au public et ${fmt(g)} entrent en caisse.`)}}),
      row({ic:'🤝',t:'Vendre l’entreprise',s:`Tu toucherais environ ${fmtk(mine)}`,a:()=>pushPanel(confirmP(`Vendre ${B.name} ?`,'Un repreneur est prêt à signer. Il te faudra tourner la page.',()=>{const g=Math.round(B.value*B.share/100*R(92,108)/100);earn(L,g,1);L.biz=null;chg(L,{happy:6});track(L,'bizSold');return out(L,`🤝 Tu vends ${B.name} pour ${fmt(g)}. Tu gardes le logo en souvenir.`)},'Vendre'))})])};
}

/* =====================================================================
   2. DÉBROUILLARD DE RUE
   ===================================================================== */
const TERRS=[{k:'gare',ic:'🚉',n:'La gare'},{k:'centre',ic:'🏙️',n:'Le centre-ville'},{k:'marche',ic:'🧺',n:'Le marché'},{k:'touristes',ic:'📸',n:'Le quartier touristique'}];
const COMB=[
 {k:'pick',ic:'🧤',n:'Pickpocket',terr:'gare',g:[300,1400],r:.22,h:14,ok:['Dans la cohue du quai, tu repars plus léger de souci et plus lourd de billets.','Un voyageur pressé ne verra jamais rien venir. Il ratera aussi son train.','Trois mains qui se croisent, une valise qui roule, et c’est plié.'],ko:['Un contrôleur a l’œil vif : tu te retrouves plaqué contre un distributeur de billets.','Une caméra, un agent de sécurité, un « suivez-moi » : fin de partie.']},
 {k:'musique',ic:'🎸',n:'Musique de rue',terr:'centre',g:[200,900],r:.05,h:3,soft:1,ok:['Ton « Les Champs-Élysées » version punk à chien fait un tabac : la casquette déborde.','Deux touristes dansent, un enfant te tend une pièce rouge. Tu te sens artiste.','La reprise de « Alors on danse » rassemble tout le centre-ville.'],ko:['Un riverain appelle la police municipale pour tapage : tu es verbalisé.','Tu joues sans autorisation de la mairie, et le règlement te le rappelle.']},
 {k:'bonneteau',ic:'🃏',n:'Bonneteau',terr:'marche',g:[400,1800],r:.25,h:16,ok:['« Où est la reine ? » Les badauds se pressent, la reine reste introuvable.','Un complice s’enflamme, la foule suit, la mise grimpe.','Les cartes sont rapides, les clients sont confiants : excellente matinée.'],ko:['Un faux client était un vrai policier en civil. Il est courtois, mais ferme.','La foule se retourne contre toi et les sirènes ne se font pas attendre.']},
 {k:'guide',ic:'🗼',n:'Faux guide touristique',terr:'touristes',g:[500,2200],r:.14,h:9,ok:['Tu racontes que cette boulangerie a nourri Napoléon : tout le groupe applaudit et paie.','Visite guidée de « lieux secrets » : une pizzeria, un lampadaire, un pigeon. Pourboire généreux.','Le groupe de Canadiens adore ton histoire de la Révolution. Elle est entièrement inventée.'],ko:['Un vrai guide te démasque devant son groupe : la scène devient virale et peu flatteuse.','Une plainte pour usurpation de titre : un agent te prie de le suivre.']},
 {k:'sauvette',ic:'🕶️',n:'Vente à la sauvette',terr:'centre',g:[250,1000],r:.1,h:6,soft:1,ok:['Les petites tours Eiffel partent comme des petits pains, sur ta nappe prête à se replier.','Parapluies par temps de pluie, éventails par canicule : tu as un sens aigu du marché.','Fausses lunettes de soleil, vrais bénéfices, nappe pliée en trois secondes.'],ko:['La police municipale confisque ta marchandise sans sourire.','Il a suffi d’un regard et la nappe est partie… avec ta recette.']}
];
function sj(L){
  const j=L.job;if(!j||j.c!=='arnaqueur')return null;
  j.lvl=lim(Math.round(num(j.lvl,0)),0,2);
  if(!j.terr||typeof j.terr!=='object')j.terr={};
  for(const T of TERRS)j.terr[T.k]=lim(num(j.terr[T.k],T.k==='gare'?15:5),0,100);
  j.heat=lim(num(j.heat,0),0,100);j.acts=Math.max(0,num(j.acts,0));j.inc=num(j.inc,0);j.last=num(j.last,0);j.tot=num(j.tot,0);j.perf=lim(num(j.perf,50),0,100);j.y=num(j.y,0);
  return j;
}
const sCap=j=>5+j.lvl*2;
const sCtl=j=>TERRS.reduce((s,T)=>s+j.terr[T.k],0);
const labS=(L,lv)=>[['Petit arnaqueur','Petite arnaqueuse'],['Débrouillard de quartier','Débrouillarde de quartier'],['Roi de la rue','Reine de la rue']][lv][L&&L.gender==='F'?1:0];
function doCombine(L,C){
  const j=sj(L);if(!j)return '';
  j.acts++;
  const ctl=j.terr[C.terr];
  const mult=(1+j.lvl*1.4)*(1+ctl/100)*(C.k==='musique'?.7+skillOf(L,'musique')/160:1)*(.8+j.perf/250);
  const pA=lim(C.r*(1+j.heat/70)*(1-j.lvl*.08),.02,.7);
  j.heat=clamp(j.heat+C.h+R(-2,3));
  if(chance(pA)){
    chg(L,{karma:-1,happy:-6,crime:R(1,4)});j.perf=clamp(j.perf-6);track(L,'crimes');
    say(L,`${C.ic} ${pick(C.ko)}`);
    if(C.soft&&j.heat<60){const f=R(135,450)*(1+j.lvl);spend(L,f);return out(L,`${C.n} : verbalisé, amende de ${fmt(f)}.`)}
    j.heat=35;j.acts=99;
    trial(L,{n:'Escroquerie',jail:[0,2+j.lvl],fine:1500*(1+j.lvl),lawyer:6000*(1+j.lvl)});return '';
  }
  const gain=Math.max(20,Math.round(R(C.g[0],C.g[1])*mult/10)*10);
  earn(L,gain);j.inc+=gain;j.tot+=gain;j.perf=clamp(j.perf+R(0,2));
  chg(L,{karma:-1,happy:2,crime:1});
  return out(L,`${C.ic} ${C.n} : ${pick(C.ok)} (+${fmt(gain)})`);
}
function claim(L,T){
  const j=sj(L);if(!j)return '';
  j.acts++;
  const p=lim(.45+j.perf/300+j.lvl*.08-j.terr[T.k]/300,.2,.85);
  if(chance(p)){const d=R(8,18);j.terr[T.k]=Math.min(100,j.terr[T.k]+d);j.perf=clamp(j.perf+2);j.heat=clamp(j.heat+4);
    return out(L,`${T.ic} ${T.n} de ${L.city} passe sous ton influence : +${d} points de contrôle. Les commerçants te saluent… ou font semblant.`)}
  j.heat=clamp(j.heat+8);j.perf=clamp(j.perf-3);chg(L,{health:-R(1,6),happy:-3});
  return out(L,`${T.ic} Les habitués de ${T.n.toLowerCase()} te font comprendre que tu n’es pas chez toi. Tu repars avec un bleu et une leçon.`);
}
function sYear(L){
  const j=sj(L);if(!j)return;
  if(L.prison){j.heat=Math.max(0,j.heat-15);for(const T of TERRS)j.terr[T.k]=Math.max(0,j.terr[T.k]-R(2,8));return}
  let pas=0;
  if(j.lvl>=1)pas=Math.round(sCtl(j)*(30+j.lvl*40)*(.8+Math.random()*.4));
  if(pas>0)earn(L,pas);
  j.last=j.inc+pas;j.inc=0;j.acts=0;
  j.heat=Math.max(0,j.heat-20);
  j.perf=clamp(j.perf+R(-4,3));
  if(j.last>0)say(L,`🃏 Ta saison de rue à ${L.city} t’a rapporté ${fmt(j.last)}${pas?` dont ${fmt(pas)} de dîme sur tes coins`:''}.`);
  if(chance(.3)&&sCtl(j)>20){const T=pick(TERRS.filter(t=>j.terr[t.k]>0));if(T){const d=R(5,18);j.terr[T.k]=Math.max(0,j.terr[T.k]-d);say(L,`Une bande rivale grignote ${T.n.toLowerCase()} : −${d} points de contrôle.`)}}
  if(j.heat>=70&&chance(.35)){say(L,'🚨 Grosse opération de police dans le quartier : on te cueille.');j.heat=35;trial(L,{n:'Escroquerie en bande',jail:[0,2+j.lvl],fine:1500*(1+j.lvl),lawyer:6000*(1+j.lvl)})}
  chg(L,{stress:R(0,2)});
  if(j.lvl<2){
    const ctl=sCtl(j);
    if(j.lvl===0&&ctl>=120&&j.perf>=60&&j.y>=2||j.lvl===1&&ctl>=260&&j.perf>=75&&j.y>=4){j.lvl++;chg(L,{happy:8,fame:2});say(L,`🃏 Dans la rue, on t’appelle désormais « ${labS(L,j.lvl)} ». Ça en jette.`);if(j.lvl===2)track(L,'topCareer')}
  }
  if(L.age>=64&&chance(.5)){L.pension=Math.round(Math.max(3000,j.last)*.3);L.retired=true;L.job=null;say(L,'🃏 Tu raccroches la casquette. Les pigeons du centre-ville te regretteront.')}
}
function pStreet(L){
  const j=sj(L);if(!j)return '';
  const left=sCap(j)-j.acts;const done=left<=0;
  const rows=COMB.map(C=>act(L,{ic:C.ic,t:C.n,s:`${TERRS.find(T=>T.k===C.terr).n} (${j.terr[C.terr]} %) · ${fmt(C.g[0])} à ${fmt(C.g[1])} · risque ${Math.round(lim(C.r*(1+j.heat/70)*(1-j.lvl*.08),.02,.7)*100)} %`,dis:L.prison?'En prison':done?'Plus de souffle cette année':'',fn:L=>doCombine(L,C)}));
  const terr=TERRS.map(T=>act(L,{ic:T.ic,t:`Étendre : ${T.n}`,s:`Contrôle ${j.terr[T.k]} % · bonus de gains ×${(1+j.terr[T.k]/100).toFixed(2).replace('.',',')}`,dis:L.prison?'En prison':done?'Plus de souffle cette année':j.terr[T.k]>=100?'Territoire acquis':'',fn:L=>claim(L,T)}));
  const cov=[
    act(L,{ic:'🤫',t:'Se faire discret',s:'Vigilance −15, mais ça prend une journée',dis:done?'Plus de souffle cette année':'',fn:L=>{j.acts++;j.heat=Math.max(0,j.heat-15);return out(L,'Tu changes de café, de casquette et de trottoir. Les agents ne te voient plus.')}}),
    act(L,{ic:'🥐',t:'Arroser un agent de quartier',s:`${fmt(800*(1+j.lvl))} · vigilance −25 (peut mal tourner)`,cost:800*(1+j.lvl),key:'st_pot',fn:L=>{if(chance(.7)){j.heat=Math.max(0,j.heat-25);return out(L,'Un agent « oublie » de te voir pendant quelques semaines. Les croissants font des miracles.')}j.heat=clamp(j.heat+10);return out(L,'L’agent encaisse et te regarde quand même. Voilà qui ne rassure pas.')}})];
  return statLine('Vigilance policière',j.heat)
    +note(`Journées de rue disponibles : ${Math.max(0,left)}/${sCap(j)} · cette année : ${fmt(j.inc)} · territoire total : ${sCtl(j)}/400`)
    +group('Combines',rows)+group('Territoires',terr)+group('Se couvrir',cov);
}

/* =====================================================================
   3. TRAFIQUANT (contenu abstrait)
   ===================================================================== */
const TN=['Les quais','La gare','Le centre commercial','La cité des Acacias','La zone industrielle'];
const RIV=['Le cartel de la Côte','La Compagnie du Nord','Les Frères Kaïdo','Le Syndicat du Port','Le clan Moretti','L’Association des Hauts-de-Marne'];
const SUPN=['Le Grossiste du port','La filière de l’Est','Le cousin de Marseille','Un intermédiaire discret','Les Frères Aubrac','Madame Odette','L’importateur de Lyon','Le cousin d’Anvers'];
const MIX=['Qualité maximale','Équilibre','Marge maximale'];
const MIXS=['Clients fidèles, volume normal. Image soignée.','Un peu plus de volume, une qualité honnête.','25 % de volume en plus mais une qualité en berne : clients mécontents, incidents, attention policière.'];
const labT=(L,lv)=>[['Petit revendeur','Petite revendeuse'],['Grossiste','Grossiste'],['Baron régional','Baronne régionale'],['Chef de cartel','Cheffe de cartel']][lv][L&&L.gender==='F'?1:0];
function mkSup(){return shuffle(SUPN).slice(0,3).map((n,i)=>{const q=[R(25,42),R(48,65),R(70,92)][i];return {id:nid(),n,q,price:Math.round((3000+q*60)*R(90,115)/100/50)*50,rel:R(40,95)}})}
function tj(L){
  const j=L.job;if(!j||j.c!=='trafiquant')return null;
  j.lvl=lim(Math.round(num(j.lvl,0)),0,3);
  if(!Array.isArray(j.sup)||!j.sup.length)j.sup=mkSup();
  j.stock=Math.max(0,num(j.stock,0));j.q=num(j.q,50);j.mix=[0,1,2].includes(j.mix)?j.mix:1;
  j.heat=lim(num(j.heat,10),0,100);j.inf=lim(num(j.inf,0),0,100);j.rep=lim(num(j.rep,50),0,100);j.war=lim(num(j.war,0),0,100);
  j.vol=num(j.vol,0);j.last=num(j.last,0);j.inc=num(j.inc,0);j.low=num(j.low,0);j.pact=num(j.pact,0);j.y=num(j.y,0);j.perf=lim(num(j.perf,50),0,100);
  if(!Array.isArray(j.men))j.men=[];
  if(!Array.isArray(j.terr)||j.terr.length!==TN.length||j.terr.some(v=>typeof v!=='number'))j.terr=TN.map((n,i)=>i===0?20:0);
  if(!j.rival||typeof j.rival!=='object')j.rival={n:pick(RIV),pow:R(30,60)};
  j.rival.pow=lim(num(j.rival.pow,40),5,100);
  return j;
}
const act_=j=>j.men.filter(m=>m.st==='actif');
const tCtl=j=>j.terr.reduce((s,v)=>s+v,0);
const tStr=j=>Math.round(15+act_(j).length*7+j.lvl*10+tCtl(j)/10);
const tCap=j=>Math.round((2+j.lvl*5+act_(j).filter(m=>m.role==='rev').length*3+act_(j).filter(m=>m.role==='guet').length)*(1+tCtl(j)/250)*(.6+j.rep/125));
const tQ=j=>Math.max(5,j.q-14*j.mix);
const tPrice=j=>Math.round((8000+tQ(j)*60)*(1+tCtl(j)/500));
function newMan(L,role){
  const g=pick(['H','F']);
  return {id:nid(),first:rname(g,L.country),last:rlast(L.country),g,role,loyal:R(40,75),st:'actif',mole:chance(.1)?1:0,vet:0,age:R(18,42)};
}
const mn=m=>`${m.first} ${m.last}`;
const roleN=m=>m.role==='guet'?(m.g==='F'?'guetteuse':'guetteur'):(m.g==='F'?'revendeuse':'revendeur');
function buyLots(L,j,s,n){
  const cost=Math.round(s.price*n*(n>=5?.9:1));
  if(chance(s.rel/100)){
    const got=n;j.q=Math.round((j.stock*j.q+got*s.q)/(j.stock+got));j.stock+=got;s.rel=clamp(s.rel+R(0,3));
    return out(L,`📦 ${s.n} livre ${n} lot${n>1?'s':''} de marchandise (qualité ${s.q} %). Aucune question, aucun reçu.`);
  }
  if(chance(.5)){s.rel=clamp(s.rel-R(10,20));return out(L,`📦 ${s.n} ne se présente pas au rendez-vous et ton acompte de ${fmt(cost)} s’évapore.`)}
  j.heat=clamp(j.heat+R(5,10));s.rel=clamp(s.rel-R(5,10));
  return out(L,`📦 La livraison de ${s.n} est interceptée en route. Perte sèche de ${fmt(cost)} et un peu de chaleur en plus.`);
}
function sellLots(L,j,n){
  n=Math.min(n,j.stock);if(n<=0)return '';
  const gross=Math.round(n*(1+.25*j.mix)*tPrice(j)*.85*(.9+Math.random()*.2));
  j.stock-=n;j.vol+=n*(1+.25*j.mix);earn(L,gross,1);j.inc+=gross;
  j.heat=clamp(j.heat+n*2);chg(L,{karma:-2,stress:2});
  return out(L,`💼 Tu écoules ${n} lot${n>1?'s':''} à la volée : ${fmt(gross)} en liquide. Les pourboires aux intermédiaires font le reste.`);
}
function warAt(L,j,i){
  const my=tStr(j),p=lim(.3+(my-j.rival.pow)/130,.1,.8);
  j.war=clamp(j.war+15);j.heat=clamp(j.heat+R(8,16));chg(L,{karma:-R(4,8),stress:R(5,10),crime:R(3,7)});track(L,'crimes');
  if(chance(p)){
    const d=R(25,45);j.terr[i]=Math.min(100,j.terr[i]+d);j.rival.pow=Math.max(5,j.rival.pow-R(2,6));j.perf=clamp(j.perf+4);
    return out(L,`🔥 Une nuit agitée dans ${TN[i].toLowerCase()} : des volets qui claquent, des sirènes plus loin, et au matin le secteur t’appartient (+${d} points). Les journaux parlent de « tensions entre bandes ».`);
  }
  const lost=act_(j).slice(0,R(1,2));lost.forEach(m=>{m.st='parti'});
  j.terr[i]=Math.max(0,j.terr[i]-R(5,15));chg(L,{health:-R(2,10),happy:-8});
  return out(L,`🔥 L’assaut sur ${TN[i].toLowerCase()} tourne mal. ${lost.length?`${lost.length} de tes hommes disparaissent du paysage, `:''}tu te replies avec quelques bleus et beaucoup de peur.`);
}
function tYear(L){
  const j=tj(L);if(!j)return;
  /* prison : le réseau se délite */
  if(L.prison){j.heat=Math.max(0,j.heat-10);j.terr=j.terr.map(v=>Math.max(0,v-R(3,9)));j.stock=0;return}
  const lines=[];
  /* ventes annuelles */
  let sold=0,gross=0;
  if(!j.low){
    const cap=tCap(j),vf=1+.25*j.mix;
    const S=Math.min(Math.floor(j.stock*vf),cap);
    if(S>0){
      gross=Math.round(S*tPrice(j)*(.9+Math.random()*.2));sold=S;
      j.stock-=Math.ceil(S/vf);j.vol+=S;earn(L,gross,1);j.inc+=gross;
      j.heat=clamp(j.heat+Math.min(15,S*.5));
      lines.push(`Tes réseaux écoulent ${sold} lots : ${fmt(gross)} en liquide.`);
    }else if(j.stock<=0)lines.push('Plus de marchandise : les points de vente restent vides.');
  }else{lines.push('Tu as fait le mort toute l’année : zéro vente, zéro risque.');j.heat=Math.max(0,j.heat-25)}
  j.low=0;
  j.rep=clamp(j.rep+(tQ(j)-45)/6+R(-2,2));
  if(j.mix===2&&chance(.35)){j.heat=clamp(j.heat+8);lines.push('Des clients tombent malades, la presse locale s’en mêle.')}
  /* équipe */
  let pay=0;
  for(const m of j.men){
    if(m.st==='arrêté'){if(L.age>=(m.back||0)){m.st='actif';m.loyal=clamp(m.loyal-10);lines.push(`${mn(m)} est de retour parmi vous.`)}continue}
    if(m.st==='retourné'){j.inf=clamp(j.inf+2);continue}
    if(m.st!=='actif')continue;
    pay+=m.role==='guet'?5000:9000;
    m.loyal=clamp(m.loyal+R(-6,3));
    if(m.mole)j.inf=clamp(j.inf+R(4,9));
    if(m.loyal<30&&chance(.3*(m.vet?.3:1))){m.st='retourné';j.inf=clamp(j.inf+12);lines.push(`${mn(m)} a été vu${m.g==='F'?'e':''} en train de parler à des gens en civil.`)}
    else if(chance(.02+j.heat/400)){m.st='arrêté';m.back=L.age+R(1,2);
      if(m.loyal<55){j.heat=clamp(j.heat+10);j.inf=clamp(j.inf+8);lines.push(`${mn(m)} est interpellé${m.g==='F'?'e':''} et parle beaucoup.`)}else lines.push(`${mn(m)} est interpellé${m.g==='F'?'e':''} mais ne dit pas un mot.`)}
  }
  j.men=j.men.filter(m=>m.st!=='parti');
  if(pay>0){spend(L,pay);lines.push(`Salaires et primes : ${fmt(pay)}.`);if(L.money<0)act_(j).forEach(m=>{m.loyal=clamp(m.loyal-15)})}
  /* rival, guerre */
  j.rival.pow=lim(j.rival.pow+(j.pact>0?R(-2,2):R(-3,5)),5,100);
  if(j.pact>0)j.pact--;
  j.war=Math.max(0,j.war-10);
  if(j.war>40&&chance(.3)){
    chg(L,{stress:R(3,7),health:-R(3,9)});
    lines.push(pick(['Une nuit, des coups de feu résonnent dans la rue ; ta voiture est criblée, pas toi. Tu ne dors plus.','On tente de te faire comprendre que la guerre est ouverte. Tu t’en tires avec la peur de ta vie.']));
  }
  if(j.pact<=0&&j.rival.pow>tStr(j)+15&&chance(.35)){const i=Math.floor(Math.random()*TN.length);if(j.terr[i]>0){const d=R(10,25);j.terr[i]=Math.max(0,j.terr[i]-d);lines.push(`${j.rival.n} prend du terrain à ${TN[i].toLowerCase()} (−${d} points).`)}}
  /* police */
  j.heat=Math.max(0,j.heat-8);
  const pOp=lim(j.heat/160+j.inf/200+(j.war>50?.05:0),0,.7);
  if(chance(pOp)){
    const lost=j.stock;j.stock=0;
    const a=act_(j).filter(()=>chance(.3));a.forEach(m=>{m.st='arrêté';m.back=L.age+R(1,3)});
    lines.push(`🚨 Coup de filet : la police saisit ${lost?lost+' lot'+(lost>1?'s':''):'tout ce qu’elle trouve'}${a.length?` et interpelle ${a.length} de tes hommes`:''}.`);
    chg(L,{stress:R(5,10)});
    const pArr=lim((j.heat+j.inf)/200,.1,.8);
    j.heat=30;j.inf=Math.round(j.inf*.5);
    say(L,'🚨 '+lines.join(' '));
    if(chance(pArr)){chg(L,{karma:-5,happy:-12});trial(L,{n:'Trafic en bande organisée',jail:[3,8+j.lvl*2],fine:40000*(1+j.lvl),lawyer:90000});return}
    lines.length=0;
  }
  /* bilan moral */
  chg(L,{stress:R(2,5),karma:-R(1,3),happy:-R(0,3)});
  if(chance(.2))lines.push(pick(['Tu regardes les passants en te demandant combien d’entre eux sont des clients.','Tu raccompagnes ta famille en voiture et vérifies trois fois ton rétroviseur.','Un soir, une vieille dame te sourit gentiment. Tu te sens bizarre.']));
  /* fournisseurs */
  j.sup.forEach(s=>{s.price=Math.max(1500,Math.round(s.price*(1+gauss()*.08)/50)*50);s.rel=clamp(s.rel+R(-5,5))});
  j.last=j.inc;j.inc=0;j.perf=clamp(j.perf+R(-4,4));
  if(lines.length)say(L,'💼 '+lines.join(' '));
  /* promotion */
  const held=j.terr.filter(v=>v>=40).length,men=act_(j).length;
  const up=(j.lvl===0&&j.vol>=6&&tCtl(j)>=60&&j.y>=1)||(j.lvl===1&&j.vol>=30&&held>=3&&men>=4&&j.y>=3)||(j.lvl===2&&j.vol>=90&&held>=4&&(j.rival.pow<=50||j.pact>0)&&j.y>=6);
  if(up&&j.lvl<3){j.lvl++;chg(L,{happy:6,fame:2,karma:-2});say(L,`💼 Dans le milieu, on te traite désormais en ${labT(L,j.lvl).toLowerCase()}. Les regards changent, les ennuis aussi.`);if(j.lvl===3)track(L,'topCareer')}
  if(L.age>=66&&chance(.5)){L.pension=Math.round(Math.max(4000,j.last)*.08);L.retired=true;L.job=null;say(L,'💼 Tu te retires discrètement. Personne ne vient te chercher, pour l’instant.')}
}

/* ---------- Panneaux trafiquant ---------- */
function pTrade(L){
  const j=tj(L);if(!j)return '';
  const rows=[
    nav('📦','Approvisionnement',`${j.sup.length} fournisseurs · stock : ${j.stock} lot${j.stock>1?'s':''}`,pSupply),
    nav('⚖️','Qualité et marge',`${MIX[j.mix]} · ≈ ${fmt(tPrice(j))} le lot`,pMix),
    nav('🗺️','Territoires et guerre',`${j.terr.filter(v=>v>=40).length}/5 secteurs tenus · force ${tStr(j)} contre ${j.rival.pow}`,pTerr),
    nav('🧑‍🤝‍🧑','Guetteurs et revendeurs',`${act_(j).length} actif${act_(j).length>1?'s':''} sur ${j.men.length}`,pMen),
    nav('🚨','Police et chaleur',`Chaleur ${j.heat} % · infiltration ${j.inf} %`,pPolice),
    nav('🦂','Cartel rival',`${j.rival.n} · puissance ${j.rival.pow}`,pRival)];
  return statLine('Chaleur policière',j.heat)+statLine('Réputation auprès des clients',j.rep)
    +note(`Capacité de vente : ${tCap(j)} lots par an · ventes cumulées : ${fmtn(j.vol)} lots · cette année : ${fmt(j.inc)}`)
    +group('Gérer le trafic',rows);
}
function pSupply(){
  const L=cur();const j=tj(L);if(!j)return {title:'Approvisionnement',html:note('Tu n’es pas dans le trafic.')};
  const rows=[];
  for(const s of j.sup){
    rows.push(card(s.n,`Qualité ${s.q} %`,`${fmt(s.price)} le lot · fiabilité ${s.rel} %`));
    rows.push(group('',[1,3,5].map(n=>{const cost=Math.round(s.price*n*(n>=5?.9:1));return act(L,{ic:'📦',t:`Commander ${n} lot${n>1?'s':''}`,s:`${fmt(cost)}${n>=5?' (−10 % de gros)':''}`,cost,dis:L.prison?'En prison':'',fn:L=>buyLots(L,j,s,n)})})));
  }
  return {title:'Approvisionnement',html:note('La marchandise passe par des fournisseurs qui ne signent aucun contrat. Bonne qualité, bon prix et fiabilité ne vont jamais ensemble très longtemps.')+card('En stock',`${j.stock} lot${j.stock>1?'s':''}`,`Qualité moyenne ${Math.round(j.q)} %`)+rows.join('')};
}
function pMix(){
  const L=cur();const j=tj(L);if(!j)return {title:'Qualité',html:note('Tu n’es pas dans le trafic.')};
  return {title:'Qualité et marge',html:note('La qualité que tu fais vendre détermine ton image : un produit « allongé » rapporte plus à court terme, mais lasse ta clientèle et attire l’attention.')
    +card('Prix du lot',fmt(tPrice(j)),`Qualité effective ${tQ(j)} % · réputation ${j.rep} % · volume ×${(1+.25*j.mix).toFixed(2).replace('.',',')}`)
    +group('Réglage',MIX.map((n,i)=>row({ic:['💎','⚖️','🧪'][i],t:n,s:MIXS[i],right:j.mix===i?'✓':'',a:()=>run(()=>{j.mix=i;return `Réglage : ${n.toLowerCase()}.`})})))
    +group('Ventes',[
      act(L,{ic:'💼',t:'Écouler 1 lot à la volée',s:'Argent immédiat à 85 % du prix, chaleur en plus',dis:L.prison?'En prison':j.stock<1?'Plus de stock':'',fn:L=>sellLots(L,j,1)}),
      act(L,{ic:'💼',t:'Écouler 3 lots à la volée',s:'Argent immédiat, chaleur nettement en plus',dis:L.prison?'En prison':j.stock<3?'Pas assez de stock':'',key:'tr_dir3',fn:L=>sellLots(L,j,3)}),
      act(L,{ic:'🕳️',t:'Faire le mort cette année',s:'Pas de ventes pendant 12 mois, chaleur −25',key:'tr_low',dis:j.low?'Déjà décidé':'',fn:L=>{j.low=1;return out(L,'Tu coupes les téléphones et tu te fais oublier. Les clients vont s’en souvenir.')}})])};
}
function pTerr(){
  const L=cur();const j=tj(L);if(!j)return {title:'Territoires',html:note('Tu n’es pas dans le trafic.')};
  const men=act_(j).length;
  return {title:'Territoires et guerre',html:note('Chaque secteur te donne des clients ; le prendre à un rival est un pari dont tu ne sortiras pas indemne. Le journal parlera de « tensions », jamais de toi.')
    +card('Rapport de force',`${tStr(j)} contre ${j.rival.pow}`,`Tension : ${j.war} % · ${men} homme${men>1?'s':''} actif${men>1?'s':''}`,statLine('Tension entre bandes',j.war))
    +group('Secteurs',TN.map((n,i)=>act(L,{ic:['⚓','🚉','🛍️','🏘️','🏭'][i],t:`Prendre : ${n}`,s:`Contrôle ${j.terr[i]} % · coût logistique 4 000 €`,cost:4000,dis:L.prison?'En prison':men<1?'Il te faut au moins un homme':j.terr[i]>=100?'Secteur tenu':'',fn:L=>warAt(L,j,i)})))};
}
function pMen(){
  const L=cur();const j=tj(L);if(!j)return {title:'Équipe',html:note('Tu n’es pas dans le trafic.')};
  const cr=(role,cost)=>act(L,{ic:role==='guet'?'👀':'🧑‍💼',t:role==='guet'?'Recruter un guetteur':'Recruter un revendeur',s:`${fmt(cost)} · salaire ${role==='guet'?'5 000':'9 000'} € par an`,cost,dis:L.prison?'En prison':j.men.filter(m=>m.st!=='parti').length>=(4+j.lvl*4)?'Équipe au complet':'',fn:L=>{const m=newMan(L,role);j.men.push(m);return out(L,`🧑‍🤝‍🧑 ${mn(m)} rejoint ton équipe comme ${roleN(m)}. Il vaut mieux vérifier son passé.`)}});
  return {title:'Guetteurs et revendeurs',html:note('Les guetteurs gardent les coins et réduisent la chaleur ; les revendeurs écoulent le gros du stock. Un homme qui n’est plus loyal est un problème qui parle.')
    +group('Équipe',j.men.map(m=>row({ic:m.role==='guet'?'👀':'🧑‍💼',t:`${mn(m)} · ${roleN(m)}`,s:`${m.st==='actif'?'actif':m.st==='arrêté'?'interpellé':'retourné'} · loyauté ${m.loyal} %${m.vet?' · vérifié':''}`,right:mini(m.loyal),a:()=>pushPanel(()=>pMan(m.id))})))
    +group('Recrutement',[cr('guet',2000),cr('rev',4000)])};
}
function pMan(id){
  const L=cur();const j=tj(L);const m=j&&j.men.find(x=>x.id===id);
  if(!m)return {title:'Équipe',html:note('Cette personne a disparu.')};
  return {title:mn(m),html:card(cap(roleN(m)),`Loyauté ${m.loyal} %`,m.st==='actif'?'Actif':m.st==='arrêté'?'Interpellé : de retour d’ici quelque temps':'Retourné : il parle à la police')
    +group('Actions',[
      act(L,{ic:'🎁',t:'Verser une prime',s:'1 500 € · loyauté +12',cost:1500,dis:m.st==='parti'?'Parti':'',fn:L=>{m.loyal=clamp(m.loyal+12);return out(L,`Tu glisses une enveloppe à ${m.first}. Un sourire en retour, et peut-être de la fidélité.`)}}),
      act(L,{ic:'🔍',t:'Enquêter sur lui',s:'1 500 € · révèle un éventuel indic',cost:1500,dis:m.vet?'Déjà vérifié':'',fn:L=>{m.vet=1;if(m.mole){m.st='parti';j.inf=Math.max(0,j.inf-10);STACK.pop();return out(L,`🔍 Ton enquête sur ${m.first} révèle un indic. Tu le chasses avant qu’il n’en dise trop.`)}return out(L,`${m.first} est clair${m.g==='F'?'e':''}. Tu respires.`)}}),
      act(L,{ic:'⚖️',t:'Payer son avocat',s:'5 000 € · loyauté +20',cost:5000,dis:m.st!=='arrêté'?'Pas interpellé':'',fn:L=>{m.loyal=clamp(m.loyal+20);return out(L,`L’avocat de ${m.first} fait du bon travail. La reconnaissance est un ciment solide.`)}}),
      act(L,{ic:'🚪',t:'Le chasser de la ville',s:'Karma −3, infiltration −10 s’il était retourné',dis:m.st==='parti'?'Parti':'',danger:1,fn:L=>{const t=m.st==='retourné';m.st='parti';if(t)j.inf=Math.max(0,j.inf-10);chg(L,{karma:-3});STACK.pop();return out(L,`${mn(m)} quitte la ville avec un aller simple et une mauvaise mémoire.`)}})])};
}
function pPolice(){
  const L=cur();const j=tj(L);if(!j)return {title:'Police',html:note('Tu n’es pas dans le trafic.')};
  const cost=8000*(1+j.lvl);
  return {title:'Police et chaleur',html:note('Plus tu vends, plus tu es visible. Une chaleur élevée attire les coups de filet, une infiltration élevée les rend redoutables.')
    +statLine('Chaleur policière',j.heat)+statLine('Infiltration du réseau',j.inf)
    +note(`Risque d’opération cette année : environ ${Math.round(lim(j.heat/160+j.inf/200+(j.war>50?.05:0),0,.7)*100)} %`)
    +group('Se protéger',[
      act(L,{ic:'🕶️',t:'Corrompre un contact',s:`${fmt(cost)} · chaleur −20, infiltration −10 (80 % de réussite)`,cost,key:'tr_cor',dis:L.prison?'En prison':'',fn:L=>{if(chance(.8)){j.heat=Math.max(0,j.heat-20);j.inf=Math.max(0,j.inf-10);chg(L,{karma:-3});return out(L,'Un contact bien placé égare un dossier. Ça se paie, ça se paie cher, ça se paie encore.')}j.heat=clamp(j.heat+5);return out(L,'Le contact encaisse et ne fait rien. Tu as peut-être été escroqué à ton tour.')}}),
      act(L,{ic:'🧹',t:'Nettoyer le réseau',s:'Infiltration −15, loyauté des hommes −5',dis:L.prison?'En prison':'',key:'tr_clean',fn:L=>{j.inf=Math.max(0,j.inf-15);j.men.forEach(m=>{m.loyal=clamp(m.loyal-5)});return out(L,'Tu changes les téléphones, les lieux de rendez-vous et les habitudes. Tes hommes râlent mais le réseau respire.')}}),
      act(L,{ic:'🏳️',t:'Raccrocher',s:'Quitter le trafic (le rival n’oubliera pas)',danger:1,nav:confirmP('Raccrocher ?','Tu quittes le trafic, mais un cartel ne t’oublie pas facilement.',()=>{const w=j.war>=40||j.rival.pow>70;L.job=null;chg(L,{happy:5,stress:-8});if(w&&chance(.4)){chg(L,{health:-R(5,15)});return out(L,'Tu raccroches. Quelques semaines plus tard, un message anonyme te rappelle qu’on ne quitte pas le milieu gratuitement.')}return out(L,'Tu raccroches. Personne ne te cherche. Pour l’instant.')},'Raccrocher')})])};
}
function pRival(){
  const L=cur();const j=tj(L);if(!j)return {title:'Rival',html:note('Tu n’es pas dans le trafic.')};
  return {title:j.rival.n,html:note('Un cartel rival convoite tes secteurs. Négocier coûte cher ; ne rien faire coûte davantage.')
    +card('Rapport de force',`${tStr(j)} contre ${j.rival.pow}`,j.pact>0?`Trêve en cours (${j.pact} an${j.pact>1?'s':''})`:j.war>=40?'Guerre ouverte':'Tension sous contrôle',statLine('Puissance du rival',j.rival.pow)+statLine('Ta force',tStr(j)))
    +group('Diplomatie',[
      act(L,{ic:'🤝',t:'Proposer une trêve',s:'10 000 € · accord de 3 ans, guerre à zéro',cost:10000,dis:L.prison?'En prison':j.pact>0?'Déjà en trêve':'',key:'tr_pact',fn:L=>{if(chance(.3+j.lvl*.1+(j.war>50?-.1:0))){j.pact=3;j.war=0;return out(L,`🤝 ${j.rival.n} accepte de s’asseoir autour d’une table. Les territoires sont partagés, du moins sur le papier.`)}j.war=clamp(j.war+8);return out(L,`${j.rival.n} repousse ta proposition avec mépris.`)}}),
      act(L,{ic:'📞',t:'Les balancer à la police',s:'Puissance du rival −5 à −12 (50 % de succès)',dis:L.prison?'En prison':'',key:'tr_bal',fn:L=>{if(chance(.5)){const d=R(5,12);j.rival.pow=Math.max(5,j.rival.pow-d);chg(L,{karma:-3});return out(L,`Un tuyau anonyme fait tomber une partie du réseau de ${j.rival.n} (−${d}).`)}j.heat=clamp(j.heat+10);return out(L,'Ton tuyau n’a rien donné, et la police se demande d’où il venait.')}})])};
}
function pTraf(L){return pTrade(L)}

/* =====================================================================
   Évènements JSON
   ===================================================================== */
const ev=(id,category,icon,conditions,w,prompt,x)=>Object.assign({id:MOD+'_'+id,category,icon,conditions,probability_weight:w,prompt_text:prompt},Array.isArray(x)?{choices:x}:{consequences:x});
const fx=(fn,args)=>({mod_effect:{mod:MOD,fn,args}});
const ch=(t,fn,args)=>({choice_text:t,consequences:fx(fn,args)});
const hasB={mod_state:'biz'};
const eventsDb=[
 ev('controle','career_event','🧾',{min_age:20,...hasB},.04,'Les services fiscaux annoncent un contrôle de la comptabilité de ta société. Le contrôleur arrive avec un grand sourire et un petit ordinateur.',[ch('Tout ouvrir, coopérer','bizEv',{k:'controle',v:0}),ch('Engager un avocat fiscaliste (6 000 €)','bizEv',{k:'controle',v:1})]),
 ev('buzz','career_event','📱',{min_age:18,...hasB},.04,'Une vidéo de ton produit devient virale sur les réseaux : l’algorithme t’aime bien aujourd’hui.',fx('bizEv',{k:'buzz'})),
 ev('copie','career_event','🕵️',{min_age:20,...hasB},.04,'Un concurrent sort une copie à peine déguisée de ton produit, avec un prix cassé.',[ch('Baisser tes prix','bizEv',{k:'copie',v:0}),ch('Investir en R&D pour garder une longueur d’avance','bizEv',{k:'copie',v:1}),ch('Porter plainte','bizEv',{k:'copie',v:2})]),
 ev('cle','career_event','🧑‍💼',{min_age:20,...hasB,mod_cond:{mod:MOD,fn:'biz',args:{emp:3}}},.04,'Ton meilleur salarié annonce qu’un concurrent lui propose un poste mieux payé.',[ch('Augmenter son salaire (15 000 €)','bizEv',{k:'cle',v:0}),ch('Le laisser partir','bizEv',{k:'cle',v:1})]),
 ev('offre','career_event','💼',{min_age:22,...hasB,mod_cond:{mod:MOD,fn:'biz',args:{value:300000}}},.03,'Un grand groupe t’appelle : il rêve d’acheter ta société et propose un joli chèque.',[ch('Accepter l’offre','bizEv',{k:'offre',v:0}),ch('Refuser poliment','bizEv',{k:'offre',v:1})]),
 ev('greve','career_event','✊',{min_age:20,...hasB,mod_cond:{mod:MOD,fn:'biz',args:{emp:5}}},.03,'Les salariés de ta société menacent de faire grève pour obtenir une prime.',[ch('Négocier et payer','bizEv',{k:'greve',v:0}),ch('Tenir bon','bizEv',{k:'greve',v:1})]),
 ev('prix','career_event','🏅',{min_age:18,...hasB},.025,'Ta société reçoit un trophée de l’innovation décerné par la chambre de commerce.',fx('bizEv',{k:'prix'})),
 ev('incident','career_event','🔥',{min_age:18,...hasB},.025,'Un court-circuit ravage une partie de ton entrepôt dans la nuit.',fx('bizEv',{k:'incident'})),
 ev('st_rivale','career_event','🥊',{min_age:14,mod_cond:{mod:MOD,fn:'is',args:{c:'arnaqueur'}}},.12,'Une bande rivale vient marcher sur tes plates-bandes dans le quartier.',[ch('Défendre ton coin','streetEv',{k:'rivale',v:0}),ch('Céder un peu de terrain','streetEv',{k:'rivale',v:1}),ch('Négocier (500 €)','streetEv',{k:'rivale',v:2})]),
 ev('st_discret','career_event','👮',{min_age:14,mod_cond:{mod:MOD,fn:'is',args:{c:'arnaqueur',heat:40}}},.15,'Une patrouille ralentit à ton niveau : on te reconnaît, on se parle bas.',[ch('Lever le pied quelques jours','streetEv',{k:'discret',v:0}),ch('Continuer comme si de rien n’était','streetEv',{k:'discret',v:1})]),
 ev('st_mentor','career_event','🧓',{min_age:14,mod_cond:{mod:MOD,fn:'is',args:{c:'arnaqueur'}}},.08,'Un vieux de la vieille du quartier te prend sous son aile et t’apprend deux ou trois astuces de survie.',fx('streetEv',{k:'mentor'})),
 ev('tr_taupe','career_event','🐀',{min_age:18,mod_cond:{mod:MOD,fn:'is',args:{c:'trafiquant',inf:20}}},.15,'Une rumeur circule : quelqu’un de ton équipe parlerait à la police.',[ch('Faire le tri (3 000 €)','tradeEv',{k:'taupe',v:0}),ch('Ignorer la rumeur','tradeEv',{k:'taupe',v:1})]),
 ev('tr_menace','career_event','✉️',{min_age:18,mod_cond:{mod:MOD,fn:'is',args:{c:'trafiquant'}}},.12,'Un messager du cartel rival dépose une enveloppe sans timbre : ils veulent « discuter » de tes secteurs.',[ch('Accepter la discussion (3 000 €)','tradeEv',{k:'menace',v:0}),ch('Tenir tête','tradeEv',{k:'menace',v:1}),ch('Alerter discrètement la police','tradeEv',{k:'menace',v:2})]),
 ev('tr_vereux','career_event','🕴️',{min_age:18,mod_cond:{mod:MOD,fn:'is',args:{c:'trafiquant',lvl:1}}},.1,'Un policier de ta connaissance propose de « faciliter les choses » contre une petite enveloppe mensuelle.',[ch('Accepter (5 000 €)','tradeEv',{k:'vereux',v:0}),ch('Refuser','tradeEv',{k:'vereux',v:1})]),
 ev('tr_remords','career_event','🌙',{min_age:18,mod_cond:{mod:MOD,fn:'is',args:{c:'trafiquant'}}},.06,'Une nuit sans sommeil, tu repenses à tout ce que ton métier a déjà coûté à d’autres.',fx('tradeEv',{k:'remords'}))
];
const conds={
  biz(L,a){const B=bz(L);if(!B)return false;if(a.emp&&B.emp<a.emp)return false;if(a.value&&B.value<a.value)return false;return true},
  is(L,a){const j=L.job;if(!j||j.c!==a.c)return false;if(a.heat){const s=sj(L);if(!s||s.heat<a.heat)return false}if(a.inf){const t=tj(L);if(!t||t.inf<a.inf)return false}if(a.lvl&&j.lvl<a.lvl)return false;return true}
};
const effects={
  bizEv(L,a){
    const B=bz(L);if(!B)return '';const S=sect(B);const v=a.v||0;
    switch(a.k){
      case 'controle':{const pen=Math.round(Math.max(2000,B.value*.01*R(1,4))*(v?.4:1)+(v?6000:0));B.cash-=pen;if(!v&&chance(.3)){chg(L,{stress:6});return `Le contrôle relève quelques erreurs : ${fmt(pen)} de redressement et une nuit blanche.`}return v?`L’avocat plaide et le redressement se limite à ${fmt(pen)}, honoraires compris.`:`Le contrôleur repart avec un redressement de ${fmt(pen)}.`}
      case 'buzz':{const d=R(8,16);B.brand=clamp(B.brand+d);B.dem*=1.12;chg(L,{happy:5,fame:2});return `📱 La vidéo cumule des millions de vues : la marque gagne ${d} points d’image et la demande décolle.`}
      case 'copie':if(v===0){B.dem*=1.04;B.cash-=Math.round(B.rev*.03);B.brand=clamp(B.brand-2);return 'Tu alignes tes prix. Les clients restent, tes marges fondent un peu.'}
        if(v===1){B.tech=clamp(B.tech+8);B.cash-=Math.round(B.rev*.04);return 'Ta nouvelle gamme met à nouveau les copieurs à distance respectable (+8 en technologie).'}
        if(chance(.4)){B.dem*=1.03;return 'La justice te donne raison et la copie est retirée du marché.'}B.dem*=.93;B.cash-=3000;return 'La procédure traîne en longueur et la copie reste en rayon. Tu perds un peu de terrain.';
      case 'cle':if(v===0){B.cash-=15000;B.morale=clamp(B.morale+4);return 'Tu augmentes ton meilleur élément. Il reste, tes autres salariés le savent.'}
        B.emp=Math.max(0,B.emp-1);B.tech=clamp(B.tech-5);B.morale=clamp(B.morale-3);return 'Il part chez le concurrent avec ses dossiers et ses habitudes. Tu le regretteras.';
      case 'offre':if(v===0){const g=Math.round(B.value*B.share/100*R(125,160)/100);earn(L,g,1);L.biz=null;chg(L,{happy:8});track(L,'bizSold');return `🤝 Tu cèdes ${B.name} pour ${fmt(g)}.`}B.morale=clamp(B.morale+2);return 'Tu déclines : ta société n’est pas à vendre. Pas aujourd’hui.';
      case 'greve':if(v===0){B.cash-=Math.round(B.emp*1200);B.morale=clamp(B.morale+8);return 'La prime est négociée, la grève évitée et l’ambiance remonte.'}
        if(chance(.5)){B.morale=clamp(B.morale-12);B.dem*=.95;return 'La grève dure plusieurs jours : livraisons en retard et ambiance glaciale.'}B.morale=clamp(B.morale-4);return 'Ta fermeté fait son effet : les troupes rentrent dans le rang.';
      case 'prix':B.tech=clamp(B.tech+10);B.brand=clamp(B.brand+8);chg(L,{fame:3,happy:6});return '🏅 Le trophée trône à l’accueil : +10 en technologie, +8 en image de marque.';
      case 'incident':{const l=Math.round(B.stock*.7);B.stock-=l;const ass=Math.round(l*S.c*.6);B.cash+=ass;chg(L,{stress:4});return l?`🔥 ${fmtn(l)} ${S.u} partent en fumée, l’assurance rembourse ${fmt(ass)}.`:'🔥 Plus de peur que de mal : l’entrepôt était presque vide.'}
    }
    return '';
  },
  streetEv(L,a){
    const j=sj(L);if(!j)return '';const v=a.v||0;
    const T=pick(TERRS.filter(t=>j.terr[t.k]>0))||TERRS[0];
    switch(a.k){
      case 'rivale':if(v===0){if(chance(.5+j.perf/300)){j.terr[T.k]=Math.min(100,j.terr[T.k]+R(3,8));j.perf=clamp(j.perf+3);return 'Tu tiens ton coin et la rumeur de ton caractère fait le reste.'}chg(L,{health:-R(3,10)});j.terr[T.k]=Math.max(0,j.terr[T.k]-R(5,12));return 'La bagarre tourne court et mal : tu perds du terrain et un peu de dignité.'}
        if(v===1){j.terr[T.k]=Math.max(0,j.terr[T.k]-R(8,16));return 'Tu cèdes un bout de trottoir. Ça pique l’orgueil mais pas le portefeuille.'}
        if(L.money<500){j.terr[T.k]=Math.max(0,j.terr[T.k]-8);return 'Tu n’as même pas de quoi négocier : tu cèdes du terrain.'}
        spend(L,500);return 'Une négociation, un café, 500 € : le partage du quartier est acté.';
      case 'discret':if(v===0){j.heat=Math.max(0,j.heat-20);return 'Tu te fais discret quelques jours : la patrouille passe son chemin.'}
        if(chance(.3)){j.heat=35;trial(L,{n:'Escroquerie',jail:[0,2+j.lvl],fine:1500*(1+j.lvl),lawyer:6000*(1+j.lvl)});return ''}return 'Tu continues, imperturbable, et la patrouille finit par s’en aller.';
      case 'mentor':j.perf=clamp(j.perf+8);j.heat=Math.max(0,j.heat-8);return '🧓 Le vieux t’apprend à lire les clients et à repérer les uniformes à cinquante mètres.';
    }
    return '';
  },
  tradeEv(L,a){
    const j=tj(L);if(!j)return '';const v=a.v||0;
    switch(a.k){
      case 'taupe':if(v===0){if(L.money<3000)return 'Tu n’as pas de quoi payer l’enquête : la rumeur continue de courir.';spend(L,3000);const m=j.men.find(x=>x.st==='retourné'||x.mole);if(m){m.st='parti';j.inf=Math.max(0,j.inf-15);chg(L,{karma:-2});return `Ton enquête vise juste : ${mn(m)} quitte la ville précipitamment.`}j.inf=Math.max(0,j.inf-5);return 'Personne dans ton équipe n’est coupable. La rumeur venait d’ailleurs.'}
        j.men.forEach(m=>{m.loyal=clamp(m.loyal-8)});j.inf=clamp(j.inf+4);return 'Tu fais mine d’ignorer la rumeur. Le soupçon, lui, circule.';
      case 'menace':if(v===0){if(L.money<3000)return 'Tu n’as même pas de quoi payer le café : la discussion tourne court.';spend(L,3000);if(chance(.45)){j.pact=2;j.war=0;return 'Autour d’une table et de quelques cafés, vous évitez le pire. Pour deux ans.'}j.war=clamp(j.war+10);return 'La discussion n’aboutit pas. Tu repars avec une impression désagréable.'}
        if(v===1){j.war=clamp(j.war+20);chg(L,{stress:5});return 'Tu refuses de céder. Le cartel prend ça comme une déclaration.'}
        if(chance(.5)){j.rival.pow=Math.max(5,j.rival.pow-R(5,10));chg(L,{karma:-3});return 'Un tuyau bien placé fait tomber un convoi de ton rival.'}j.heat=clamp(j.heat+8);return 'Ton appel anonyme n’a rien donné et attire l’attention sur toi.';
      case 'vereux':if(v===0){if(L.money<5000)return 'Tu n’as pas de quoi graisser la patte.';spend(L,5000);j.heat=Math.max(0,j.heat-20);j.inf=clamp(j.inf+4);chg(L,{karma:-3});return 'Le policier te prévient des opérations prévues, moyennant enveloppe. Il sait aussi où tu habites.'}
        chg(L,{karma:1});return 'Tu refuses. Le policier sourit et note quelque chose dans son carnet.';
      case 'remords':chg(L,{karma:2,happy:-6,stress:4});return 'Tu ne dors pas, tu fixes le plafond. Le lendemain, tout recommence comme avant.';
    }
    return '';
  }
};

/* =====================================================================
   Carrières spéciales
   ===================================================================== */
const special={
  arnaqueur:{n:'Débrouillard de rue',ic:'🃏',desc:'Pickpocket, musique de rue, bonneteau, faux guide, vente à la sauvette',ladder:['Petit arnaqueur','Débrouillard de quartier','Roi de la rue'],req:{age:14},
    apply(L){
      const go=p=>{
        if(!chance(lim(p,.1,.9)))return out(L,'L’ancien éclate de rire : « Reviens quand tu auras grandi, petit. »');
        L.job={c:'arnaqueur',sp:1,lvl:0,perf:R(40,60),y:0,terr:{gare:15,centre:5,marche:5,touristes:5},heat:0,acts:0,inc:0,last:0,tot:0};L.retired=false;
        chg(L,{happy:5,karma:-2});
        return out(L,`🃏 Tu es adopté par la rue de ${L.city}. Te voilà ${ge(L,'petit arnaqueur','petite arnaqueuse')}.`);
      };
      modal({title:'Faire ses preuves dans la rue',icon:'🃏',text:`Un ancien du quartier de ${L.city} t’observe en terrasse, un petit crème à la main : « Montre-moi ce que tu sais faire. »`,choices:[
        {t:'Baratiner un passant pour lui vendre le journal de la veille',fn:()=>go(.35+L.st.smarts/300)},
        {t:'Jouer les touristes perdus pour tester sa vigilance',fn:()=>go(.3+L.st.looks/400)},
        {t:'Faire le guet et apprendre en silence',fn:()=>go(.65)},
        {t:'Renoncer'}]});
    },
    year(L){sYear(L)},
    salary(L){const j=sj(L);return j?(j.last||[2500,12000,60000][j.lvl]):0},
    panel(L){return pStreet(L)}},
  trafiquant:{n:'Trafiquant',ic:'🧳',desc:'Chaîne d’approvisionnement, territoires, rivalités et chaleur policière (contenu abstrait)',ladder:['Petit revendeur','Grossiste','Baron régional','Chef de cartel'],req:{age:18},
    apply(L){
      const go=p=>{
        if(!chance(lim(p,.1,.85)))return out(L,'L’intermédiaire te regarde de haut en bas : « On ne travaille pas avec les curieux. » La porte se referme.');
        L.job={c:'trafiquant',sp:1,lvl:0,perf:R(40,60),y:0,sup:mkSup(),stock:1,q:50,mix:1,heat:10,inf:0,rep:50,war:0,vol:0,last:0,inc:0,low:0,pact:0,men:[],terr:TN.map((n,i)=>i===0?20:0),rival:{n:pick(RIV),pow:R(30,60)}};
        L.retired=false;chg(L,{happy:2,karma:-6,stress:6,crime:8});track(L,'crimes');
        return out(L,`🧳 Un intermédiaire te confie un premier lot de marchandise à écouler à ${L.city}. Te voilà ${ge(L,'petit revendeur','petite revendeuse')}, pour le meilleur et surtout le pire.`);
      };
      modal({title:'Premier contact',icon:'🧳',text:'Un ami d’ami te présente un intermédiaire qui cherche quelqu’un de fiable pour « écouler de la marchandise ». Dans un café de la gare, il te jauge du regard.',choices:[
        {t:'Jouer l’assurance : « Je connais du monde. »',fn:()=>go(.3+L.st.smarts/400+L.hid.crime/300)},
        {t:'Rester discret et laisser parler',fn:()=>go(.4)},
        {t:'Mettre un peu d’argent sur la table pour montrer ta bonne foi (2 000 €)',fn:()=>{if(L.money<2000)return out(L,'Tu n’as pas les 2 000 €. L’intermédiaire part sans un mot.');spend(L,2000);return go(.7)}},
        {t:'Renoncer'}]});
    },
    year(L){tYear(L)},
    salary(L){const j=tj(L);return j?(j.last||[8000,60000,350000,1200000][j.lvl]):0},
    panel(L){return pTraf(L)}}
};

/* =====================================================================
   Module
   ===================================================================== */
const entryS=L=>{const B=bz(L);return B?`${B.name} · valeur ${fmtk(B.value)}`:'Crée ta start-up ou rachète une société'};
registerMod({
  id:MOD,
  special,
  year(L){bizYear(L)},
  eventsDb,conds,effects,
  workRows(L){return L.age>=18?[nav('🏢','Entreprise',entryS(L),pBiz)]:[]},
  netWorth(L){const B=L.biz;return B&&typeof B==='object'?Math.round(num(B.value,0)*lim(num(B.share,100),0,100)/100):0},
  jobLabel(L){
    const j=L.job;
    if(j&&j.sp&&j.c==='arnaqueur')return labS(L,lim(Math.round(num(j.lvl,0)),0,2));
    if(j&&j.sp&&j.c==='trafiquant')return labT(L,lim(Math.round(num(j.lvl,0)),0,3));
    if(!j&&L.biz)return ge(L,'Chef d’entreprise','Cheffe d’entreprise');
    return null;
  },
  badges(L){const B=L.biz;return B&&typeof B==='object'?['🏢 '+String(B.name||'Entreprise')]:[]},
  inherit(D,L){if(D.biz){L.biz=D.biz;const B=bz(L);if(B)say(L,`🏢 Tu hérites de ${B.name} et de ses ${B.emp+1} personne${B.emp?'s':''}.`)}},
  jailed(L){
    const j=tj(L);
    if(j){j.stock=0;j.men.forEach(m=>{m.loyal=clamp(m.loyal-15)});j.heat=30;j.inf=Math.round(j.inf*.5);j.terr=j.terr.map(v=>Math.round(v*.75));say(L,'💼 Ton réseau se disperse pendant ton absence : les secteurs, les hommes, tout s’effrite.')}
    const s=sj(L);if(s){s.acts=99;s.heat=30}
  }
});
})();
