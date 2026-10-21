/* Deux Vies — module « Enfants vivants » (id kids)
   Chaque enfant de L.family (type 'child') reçoit p.life, mis à jour chaque année :
     degrees, stage (none|primaire|college|lycee|pro|cap|fac|master|doc|done), major, trade, y, fund, adv, retry,
     job (clé CAREERS), lvl, sal, years, money, debt, owed, spouse, married, divorced, boost, sim (dernier âge simulé)
   L’héritier reprend cette vie via heirInit. Tout l’état est dans p.life. */
(()=>{
const STUDY=['primaire','college','lycee','pro','cap','fac','master','doc'];
const STG={none:'trop jeune pour l’école',primaire:'école primaire',college:'collège',lycee:'lycée',pro:'lycée professionnel',cap:'CAP',fac:'études supérieures',master:'master',doc:'doctorat',done:'études terminées'};
const num=(v,d)=>typeof v==='number'&&isFinite(v)?v:(d||0);
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const F=p=>p&&p.gender==='F';
const studying=lf=>STUDY.includes(lf.stage);

function ensure(p){
  let lf=p.life;
  if(!lf||typeof lf!=='object')lf=p.life={};
  if(!Array.isArray(lf.degrees))lf.degrees=[];
  const d={stage:'none',major:null,job:null,lvl:0,sal:0,years:0,money:0,debt:0,owed:0,spouse:null,married:false,divorced:0,y:0,sim:0,boost:0,fund:null,adv:null,retry:0,trade:null};
  for(const k in d)if(lf[k]===undefined)lf[k]=d[k];
  for(const k of ['lvl','sal','years','money','debt','owed','y','sim','divorced'])lf[k]=num(lf[k]);
  if(lf.job&&!(typeof CAREERS!=='undefined'&&CAREERS[lf.job]))lf.job=null;
  return lf;
}
const hasD=(lf,d)=>{const D=lf.degrees;if(d==='*lic')return D.some(x=>x.startsWith('lic_'));if(d==='*master')return D.some(x=>x.startsWith('master_'));if(d==='*doc')return D.some(x=>x.startsWith('doc_'))||D.includes('medecine');return D.includes(d)};
const dn=k=>{try{return degName(k)}catch(e){return k}};
function wpick(a){let t=0;for(const x of a)t+=x[1];if(t<=0)return null;let r=Math.random()*t;for(const x of a){r-=x[1];if(r<=0)return x[0]}return a[a.length-1][0]}
function addDeg(L,p,lf,d,q){if(lf.degrees.includes(d))return;lf.degrees.push(d);if(!q)say(L,`🎓 ${p.first} décroche : ${dn(d).toLowerCase()}.`)}
function meets(lf,p,C,a){
  const r=C.req||{},S=num(p.smarts,50);
  if(r.age&&a<r.age)return false;if(r.license)return false;
  if(r.deg&&!r.deg.some(d=>hasD(lf,d)))return false;
  if(r.smarts&&S<r.smarts)return false;if(r.looks&&num(p.looks,50)<r.looks)return false;if(r.health&&num(p.health,70)<r.health)return false;
  return true;
}
const title=lf=>{const C=lf.job&&CAREERS[lf.job];return C?C.ladder[Math.min(lf.lvl,C.ladder.length-1)]:''};
const costK=L=>{try{return costOf(L)}catch(e){return 1}};

/* ---------- Études ---------- */
function chooseHigher(L,p,lf,q){
  const S=num(p.smarts,50),adv=lf.adv;
  if(adv==='travail'||adv==='pro'){lf.stage='done';return}
  const pool=Object.keys(MAJORS).filter(k=>{const M=MAJORS[k];return !M.needLic&&!M.talent&&M.g<=S+8}).map(k=>{
    const M=MAJORS[k];let w=1;if(adv===k)w+=9;if((M.cost||250)>1000&&L.money<30000)w*=.3;return [k,w]});
  const go=chance(lim(.22+S/130+(L.money>80000?.1:0)+(adv&&MAJORS[adv]?.25:0),0,.95));
  const k=go?wpick(pool):null;
  if(!k){lf.stage='done';return}
  const M=MAJORS[k],cost=M.cost||250;
  lf.stage='fac';lf.major=k;lf.y=0;lf.adv=null;
  lf.fund=(cost<=1000||L.money>=cost*M.y*2.5+20000)?'parents':'pret';
  if(!q)say(L,`📚 ${p.first} s’inscrit en ${M.n.toLowerCase()}.`);
}
function studyStep(L,p,lf,a,q){
  const S=num(p.smarts,50),st=lf.stage;
  if(st==='none'&&a>=6)lf.stage='primaire';
  else if(st==='primaire'&&a>=11)lf.stage='college';
  else if(st==='college'&&a>=15){
    if(chance(.55+S/150)){addDeg(L,p,lf,'brevet',q)}
    const T=Object.keys(TRADES);
    const pro=lf.adv==='pro'||(lf.adv!=='travail'&&!MAJORS[lf.adv]&&((S<42&&chance(.5))||chance(.08)));
    if(pro){lf.trade=pick(T);lf.stage=S<30&&chance(.4)?'cap':'pro';lf.y=0;if(!q)say(L,`🛠️ ${p.first} choisit la voie professionnelle : ${TRADES[lf.trade]}.`)}
    else lf.stage='lycee';
    if(lf.adv==='pro')lf.adv=null;
  }
  else if(st==='cap'&&a>=17){addDeg(L,p,lf,'cap_'+lf.trade,q);lf.stage='done'}
  else if(st==='pro'&&a>=18){
    if(chance(.7+S/300)){addDeg(L,p,lf,'bacpro_'+lf.trade,q);addDeg(L,p,lf,'bac',true)}
    lf.stage='done';
  }
  else if(st==='lycee'&&a>=18){
    if(chance(lim(.4+S/120+(lf.retry?.15:0),.1,.97))){addDeg(L,p,lf,'bac',q);chooseHigher(L,p,lf,q)}
    else if(!lf.retry){lf.retry=1;if(!q)say(L,`📝 ${p.first} rate le bac et le repasse l’an prochain.`)}
    else{lf.stage='done';if(!q)say(L,`📝 ${p.first} renonce au bac.`)}
  }
  else if(st==='fac'||st==='master'||st==='doc'){
    const M=MAJORS[lf.major];if(!M){lf.stage='done';return}
    lf.y++;const cost=M.cost||250;
    if(lf.fund==='pret'&&cost>1000)lf.debt+=cost;else if(lf.fund==='parents')spend(L,Math.round(cost*(st==='fac'?1:.5)));
    if(S+R(-20,20)<M.g-18&&chance(.22)){lf.stage='done';if(!q)say(L,`📉 ${p.first} abandonne ses études en cours de route.`);return}
    if(st==='fac'&&lf.y>=M.y){
      if(M.type==='lic'){addDeg(L,p,lf,'lic_'+lf.major,q);if(chance(.3+S/200)){lf.stage='master';lf.y=0}else lf.stage='done'}
      else{addDeg(L,p,lf,lf.major,q);lf.stage='done'}
    }else if(st==='master'&&lf.y>=2){
      addDeg(L,p,lf,'master_'+lf.major,q);if(S>75&&chance(.12)){lf.stage='doc';lf.y=0}else lf.stage='done';
    }else if(st==='doc'&&lf.y>=3){addDeg(L,p,lf,'doc_'+lf.major,q);lf.stage='done'}
  }
}

/* ---------- Travail, argent, couple ---------- */
function findJob(L,p,lf,a,q){
  const first=!lf.years&&!lf.firstDone;
  const pc=lf.boost?.95:.7;
  if(!chance(pc))return;
  const diploma=lf.degrees.some(d=>d!=='brevet'&&d!=='bac');
  const c=Object.keys(CAREERS).filter(k=>meets(lf,p,CAREERS[k],a)).map(k=>[k,CAREERS[k].req&&CAREERS[k].req.deg?(diploma?8:3):(diploma?.2:1)]);
  const k=wpick(c);if(!k)return;
  const C=CAREERS[k];lf.job=k;lf.lvl=0;lf.years=0;lf.boost=0;
  lf.sal=Math.round(C.base*(costK(L)*.6+.4)*R(95,108)/100);
  if(!q)say(L,`💼 ${p.first} ${first?'décroche son premier emploi':'retrouve du travail'} : ${C.ladder[0].toLowerCase()}.`);
  lf.firstDone=1;
}
function workStep(L,p,lf,a,q){
  if(studying(lf)||a<16||lf.stage==='none')return;
  if(lf.job){
    const C=CAREERS[lf.job];
    if(a>=63){lf.job=null;lf.retired=1;return}
    lf.years++;
    if(lf.lvl<C.ladder.length-1&&chance(.11+num(p.smarts,50)/500)){
      lf.lvl++;lf.sal=Math.round(lf.sal*Math.min(C.step||1.2,1.35));
      if(!q)say(L,`📈 ${p.first} est promu${F(p)?'e':''} : ${C.ladder[lf.lvl].toLowerCase()}.`);
    }else lf.sal=Math.round(lf.sal*1.02);
    if(chance(.025)){lf.job=null;lf.years=0}
  }else if(!lf.retired)findJob(L,p,lf,a,q);
}
function moneyStep(L,p,lf,a,q){
  if(a<18){lf.money+=R(0,120);return}
  let inc=0,cost=lf.married?24000:14000;
  if(lf.job)inc=lf.sal*.72;else if(lf.retired)inc=num(lf.sal)*.5;else if(studying(lf)){inc=1500;cost=7000}else inc=11500;
  if(lf.married&&lf.spouse&&lf.spouse.job&&lf.spouse.job!=='sans emploi')inc+=7000;
  if(lf.stage==='done'&&lf.debt>0&&a>=22){const pay=Math.min(lf.debt,Math.max(1500,Math.round(lf.debt*.12)));lf.money-=pay;lf.debt-=pay}
  lf.money=Math.round(lf.money+inc-cost+R(-1500,2500));
  if(lf.money>0)lf.money=Math.round(lf.money*1.012);
  if(lf.owed>0&&lf.money>lf.owed*1.5+5000){const r=lf.owed;lf.owed=0;lf.money-=r;earn(L,r,1);if(!q)say(L,`💶 ${p.first} te rembourse ${fmt(r)}.`)}
  if(lf.money<-15000){
    lf.money=0;lf.debt=Math.round(lf.debt*.5);lf.bk=(lf.bk||0)+1;
    if(!q)say(L,`💸 ${p.first} fait faillite : les créanciers frappent à la porte.`);
  }
}
function coupleStep(L,p,lf,a,q){
  if(lf.spouse)lf.spouse.age=num(lf.spouse.age,a)+1;
  if(p.married&&!lf.married){
    const g=chance(.92)?(p.gender==='H'?'F':'H'):p.gender;
    const sp=person(g,Math.max(18,a+R(-4,4)),null,L.country);
    lf.spouse={first:sp.first,last:sp.last,gender:sp.gender,age:sp.age,look:sp.look,job:sp.job||pick(NPC_JOBS),looks:sp.looks,smarts:sp.smarts};
    lf.married=true;
    if(!q)say(L,`💍 ${p.first} épouse ${sp.first} ${sp.last}, ${lf.spouse.job}.`);
  }else if(lf.married&&!p.married){lf.married=false;lf.spouse=null}
  else if(lf.married&&a>=26&&chance(.012+(lf.money<0?.01:0))){
    const n=lf.spouse?lf.spouse.first:'son conjoint';
    lf.married=false;lf.divorced++;lf.spouse=null;p.married=0;lf.money=Math.round(lf.money*.6);
    if(!q)say(L,`💔 ${p.first} divorce de ${n}.`);
  }
}
function label(p,lf,a){
  if(a<18&&!lf.job)return p.job;
  if(studying(lf))return F(p)?'étudiante':'étudiant';
  if(lf.job)return title(lf);
  if(lf.retired)return F(p)?'retraitée':'retraité';
  return 'sans emploi';
}
function lifeStep(L,p,lf,a,q){
  studyStep(L,p,lf,a,q);workStep(L,p,lf,a,q);moneyStep(L,p,lf,a,q);coupleStep(L,p,lf,a,q);
}
function simulate(L,p){
  const lf=ensure(p),a=num(p.age);
  const q=a-lf.sim>2;let n=0;
  while(lf.sim<a&&n++<70){lf.sim++;lifeStep(L,p,lf,lf.sim,q)}
  lf.sim=Math.max(lf.sim,a);
  const l=label(p,lf,a);if(l)p.job=l;
  return lf;
}

/* ---------- Panneau récapitulatif ---------- */
const kid=(L,id)=>{try{return (L.family||[]).find(x=>x.id===id&&x.type==='child')}catch(e){return null}};
function advPanel(id){return ()=>{
  const L=cur(),p=kid(L,id);if(!p)return {title:'Conseil',html:note('Cet enfant n’est plus là.')};
  const lf=ensure(p);
  const mk=(ic,t,k,s)=>act(L,{ic,t,s:s||'',key:'kadv'+id,fn:L=>{lf.adv=k;p.rel=lim(num(p.rel,60)+3,0,100);return out(L,`Tu conseilles à ${p.first} : ${t.toLowerCase()}.`)}});
  const open=!studying(lf)||['primaire','college','lycee'].includes(lf.stage);
  return {title:`Conseiller ${p.first}`,html:note(open?'Un conseil de parent n’a jamais décidé de tout, mais il pèse dans la balance.':'Les études sont déjà engagées : trop tard pour changer de cap.')+
    (open?group('',[mk('🛠️','Une filière professionnelle','pro'),mk('💼','Travailler tôt','travail'),mk('⚖️','Le droit','droit'),mk('🩺','La médecine','medecine'),mk('💻','L’informatique','info'),mk('📊','Une école de commerce','commerce'),mk('⚙️','Une école d’ingénieurs','ingenieur'),mk('🎨','Les arts','arts'),mk('↩️','Ne rien conseiller',null)]):'')};
}}
function lifePanel(id){return ()=>{
  const L=cur(),p=kid(L,id);if(!p)return {title:'Sa vie',html:note('Cet enfant n’est plus là.')};
  const lf=ensure(p);
  const degs=lf.degrees.map(dn);
  const M=lf.major&&MAJORS[lf.major];
  const sp=lf.spouse;
  const cards=`<div class="cards">${card('Études',STG[lf.stage]||'—',M&&studying(lf)?M.n:(lf.adv&&lf.adv!=='travail'&&lf.adv!=='pro'&&MAJORS[lf.adv]?'Conseillé : '+MAJORS[lf.adv].n:''))}${card('Métier',title(lf)||(lf.retired?'Retraite':'Sans emploi'),lf.job?CAREERS[lf.job].n+' · '+An(lf.years):'')}${card('Salaire',lf.job?fmt(lf.sal)+' / an':'—','')}${card('Argent',fmt(lf.money),lf.debt>0?'Dette : '+fmt(lf.debt):'')}</div>`;
  const info=note(`${degs.length?'Diplômes : '+degs.join(', ')+'.':'Aucun diplôme pour l’instant.'} ${sp?`Marié${F(p)?'e':''} à ${sp.first} ${sp.last} (${sp.job}).`:'Célibataire.'}${lf.divorced?` Divorcé${F(p)?'e':''} ${lf.divorced} fois.`:''}${lf.owed>0?` Il te doit ${fmt(lf.owed)}.`:''}`);
  const debtCost=Math.round(Math.min(lf.debt,30000)),payCost=debtCost>0?debtCost:(studying(lf)&&lf.fund==='pret'?3000:0);
  const acts=[
    act(L,{ic:'🎓',t:'Payer ses études',s:payCost?(debtCost>0?`Rembourser sa dette · ${fmt(payCost)}`:'Prendre en charge ses frais · '+fmt(payCost)):'Rien à payer',dis:payCost?null:'Rien à payer',cost:payCost,key:'kpay'+id,
      fn:L=>{lf.debt=Math.max(0,lf.debt-debtCost);if(studying(lf)&&lf.fund==='pret')lf.fund='parents';p.rel=lim(num(p.rel,60)+6,0,100);return out(L,`Tu règles les frais de ${p.first} : ${fmt(payCost)}.`)}}),
    act(L,{ic:'🤝',t:'Lui prêter 5 000 €',s:'Il te le rendra peut-être',cost:5000,min:0,key:'kloan'+id,dis:p.age<18?'Trop jeune':null,
      fn:L=>{lf.money+=5000;lf.owed+=5000;p.rel=lim(num(p.rel,60)+4,0,100);return out(L,`Tu prêtes 5 000 € à ${p.first}.`)}}),
    nav('🧭','Lui conseiller une filière',lf.adv?'Conseil donné':'Orientation, études, avenir',advPanel(id)),
    act(L,{ic:'📞',t:'Un coup de pouce pour l’emploi',s:'Un CV, un appel, un café avec un ami',key:'kjob'+id,
      dis:(lf.job||studying(lf)||p.age<16||lf.retired)?(lf.job?'Il a déjà un emploi':'Pas concerné pour l’instant'):null,
      fn:L=>{lf.boost=1;p.rel=lim(num(p.rel,60)+3,0,100);return out(L,`Tu passes quelques coups de fil pour ${p.first}.`)}})
  ];
  return {title:`La vie de ${p.first}`,html:cards+info+group('Que faire ?',acts)};
}}

registerMod({
  id:'kids',
  year(L){
    if(!L||!Array.isArray(L.family))return;
    for(const p of L.family){
      if(!p||p.type!=='child'||p.alive===false)continue;
      try{simulate(L,p)}catch(e){console.error('kids '+(p.first||''),e)}
    }
  },
  personRows(L,p){
    if(!p||p.type!=='child'||p.alive===false)return [];
    ensure(p);
    return [nav('🔎','Suivre sa vie',p.age<6?'Encore tout petit':'Études, métier, argent, conjoint',lifePanel(p.id),p.age<6)];
  },
  heirInit(D,L,child){
    if(!L||!child||!child.life)return;
    const lf=simulate(D,child);
    const e=L.edu,a=L.age;
    e.degrees=lf.degrees.slice();
    const map={none:'none',primaire:'primaire',college:'college',lycee:'lycee',pro:'pro',cap:'cap',fac:'fac',master:'master',doc:'doc',done:'done'};
    e.stage=map[lf.stage]||'done';
    if(lf.trade)e.trade=lf.trade;
    if(studying(lf)&&['fac','master','doc'].includes(lf.stage)){e.major=lf.major;e.y=lf.y;e.fund=lf.fund==='pret'?'pret':'parents'}
    else if(['pro','cap'].includes(lf.stage))e.y=lf.y||0;
    if(a>=18&&lf.stage==='done')L.withParents=false;
    if(lf.job&&CAREERS[lf.job]){
      L.job={c:lf.job,lvl:Math.min(lf.lvl,CAREERS[lf.job].ladder.length-1),perf:60,y:lf.years,sal:lf.sal,boss:newBoss(L)};L.retired=false;
    }
    L.money+=Math.round(lf.money);
    L.debt=Math.max(0,Math.round(lf.debt));
    let txt=lf.job?title(lf).toLowerCase():(studying(lf)?(F(L)?'étudiante':'étudiant'):(lf.retired?(ge(L,'retraité','retraitée')):'sans emploi'));
    if(lf.spouse&&lf.married){
      const sp=person(lf.spouse.gender||'F',num(lf.spouse.age,a),lf.spouse.last,L.country);
      Object.assign(sp,{first:lf.spouse.first,last:lf.spouse.last,look:lf.spouse.look||sp.look,job:lf.spouse.job||sp.job,type:'partner'});
      if(lf.spouse.looks!=null)sp.looks=lf.spouse.looks;if(lf.spouse.smarts!=null)sp.smarts=lf.spouse.smarts;
      L.partner={status:'marie',rel:70,link:null,p:sp,since:a,wedAge:a};
      txt+=`, ${ge(L,'marié','mariée')} à ${sp.first}`;
    }
    if(lf.debt>0)txt+=`, ${fmt(lf.debt)} de dette`;
    say(L,`🧬 Tu reprends la vie de ${child.first} : ${txt}.`);
  }
});
})();
