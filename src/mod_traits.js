/* Deux Vies — module « Traits » (id traits)
   État par vie : L.traits = {clé:true}. Compteurs de pratique : L.tr['k_<clé>']. */
(()=>{
const MOD='traits';
const TR={
  opti:{n:'Optimiste',ic:'😄',r:1,good:1,x:['gri'],d:'Le verre est à moitié plein, et parfois même débordant. +bonheur chaque année.'},
  rat:{n:'Rat de bibliothèque',ic:'📚',r:1,good:1,x:[],d:'Plus à l’aise avec un livre qu’avec une foule. Gagne en intelligence, davantage encore en lisant.'},
  int:{n:'Intello',ic:'🤓',r:1,good:1,x:[],d:'Les devoirs, c’est un loisir. L’intelligence progresse doucement.'},
  gen:{n:'Génie',ic:'🧠',r:4,good:1,x:[],d:'Un esprit rare. L’intelligence grimpe vite, les études sont presque une formalité.'},
  bos:{n:'Bosseur',ic:'💼',r:2,good:1,x:['fai'],d:'Premier arrivé, dernier parti. Meilleure performance au travail.'},
  soi:{n:'Soigné',ic:'✨',r:1,good:1,x:['neg'],d:'Toujours impeccable. L’apparence s’améliore.'},
  med:{n:'Méditatif',ic:'🧘',r:3,good:1,x:[],d:'Calme comme un lac de montagne. Le stress s’évapore.'},
  gri:{n:'Grincheux',ic:'😠',r:1,good:0,x:['opti'],d:'Tout est prétexte à râler. Le bonheur baisse chaque année.'},
  fai:{n:'Fainéant',ic:'🛋️',r:1,good:0,x:['bos'],d:'Le canapé est un mode de vie. Moins de performance, mais moins de stress.'},
  mal:{n:'Maladif',ic:'🤧',r:2,good:0,x:[],d:'Un rhume n’attend jamais bien longtemps. La santé s’érode.'},
  neg:{n:'Négligé',ic:'🧦',r:1,good:0,x:['soi'],d:'Les chaussettes dépareillées sont un style. L’apparence se dégrade.'},
  tha:{n:'Thanatophobe',ic:'💀',r:2,good:0,x:[],d:'La peur de la mort te suit partout. Plus de stress, mais une vigilance qui protège la santé.'},
  lun:{n:'Lunatique',ic:'🎭',r:2,good:0,x:['ins'],d:'Ce matin radieux, ce soir orageux. L’humeur varie fortement d’une année à l’autre.'},
  ins:{n:'Insensible',ic:'🗿',r:2,good:0,x:['lun'],d:'Peu d’émotions : le bonheur se stabilise autour du milieu.'},
  soc:{n:'Sociable',ic:'🥳',r:1,good:1,x:[],d:'Le roi (ou la reine) des soirées. Les relations s’érodent moins vite.'}
};
const KEYS=Object.keys(TR);
/* compteur de pratique -> [trait, seuil] */
const LEARN={k_med:['med',6],k_lib:['rat',6],k_study:['int',8],k_gym:['soi',8],k_party:['soc',8],k_walk:['opti',10],k_yoga:['med',8],k_doc:['tha',8]};
const conflicts=(t,k)=>KEYS.filter(o=>t[o]&&(TR[o].x.includes(k)||TR[k].x.includes(o)));
const has=(L,k)=>!!(L&&L.traits&&L.traits[k]);
const tl=L=>KEYS.filter(k=>L&&L.traits&&L.traits[k]);
const people=L=>((L&&L.family)||[]).filter(p=>p&&p.alive!==false&&p.rel!=null);

function add(L,k){
  if(!L.traits)L.traits={};
  const lost=conflicts(L.traits,k);lost.forEach(o=>delete L.traits[o]);
  L.traits[k]=true;return lost;
}

function born(L,opts){
  if(!L)return;
  if(!L.traits||typeof L.traits!=='object')L.traits={};
  if(opts&&opts.family)return;
  const n=R(0,3);
  for(let i=0;i<n;i++){
    const k=pick(KEYS);
    if(L.traits[k]||conflicts(L.traits,k).length)continue;
    if(R(1,TR[k].r)===1)L.traits[k]=true;
  }
}

function heirInit(D,L,child){
  if(!L)return;
  L.traits={};
  const src=(D&&D.traits)||{};
  for(const k of KEYS)if(src[k]&&TR[k]&&chance(.4)&&!conflicts(L.traits,k).length)L.traits[k]=true;
}

function year(L){
  if(!L)return;
  if(!L.traits||typeof L.traits!=='object')L.traits={};
  if(!L.tr)L.tr={};
  const t=L.traits,d={};
  const a=(k,v)=>{d[k]=(d[k]||0)+v};
  if(t.opti)a('happy',2);
  if(t.gri)a('happy',-2);
  if(t.rat){a('smarts',1);if((L.tr.k_lib||0)>0)a('smarts',1)}
  if(t.int)a('smarts',1);
  if(t.gen)a('smarts',2+(L.age<30?1:0));
  if(t.soi)a('looks',1);
  if(t.neg)a('looks',-1);
  if(t.med)a('stress',-3);
  if(t.fai)a('stress',-2);
  if(t.mal)a('health',-2);
  if(t.tha){a('stress',2);a('health',1)}
  if(t.lun)a('happy',R(-6,6));
  if(t.ins&&L.st){const h=L.st.happy;a('happy',Math.round(((h>60?-1:h<40?1:0)*3)))}
  chg(L,d);
  if(L.job&&typeof L.job.perf==='number'){
    const p=(t.bos?3:0)-(t.fai?3:0)+(t.gen?1:0);
    if(p)L.job.perf=clamp(L.job.perf+p);
  }
  if(t.soc)for(const p of people(L))if(p.rel<100&&chance(.3))p.rel=clamp(p.rel+1);

  /* apprentissage par la pratique */
  for(const c in LEARN){
    const [k,th]=LEARN[c];
    if((L.tr[c]||0)<th)continue;
    if(t[k]){L.tr[c]=0;continue}
    if(!chance(.25))continue;
    L.tr[c]=0;
    const lost=add(L,k);
    out(L,`${TR[k].ic} Tu as gagné le trait « ${TR[k].n} » à force de pratique.`);
    lost.forEach(o=>out(L,`${TR[o].ic} Tu as perdu le trait « ${TR[o].n} », incompatible avec « ${TR[k].n} ».`));
  }
}

function card1(L,k){
  const T=TR[k];
  return act(L,{ic:T.ic,t:T.n,s:T.d,right:`<span class="${T.good?'':'b'}">${T.good?'+':'−'}</span>`,danger:!T.good,
    fn:()=>out(L,`${T.ic} Tu as déjà le trait « ${T.n} ».`)});
}

function pTraits(){
  const L=cur();if(!L)return {title:'Traits',html:note('Aucun personnage.')};
  if(!L.traits)L.traits={};
  const mine=tl(L),rest=KEYS.filter(k=>!L.traits[k]);
  const own=mine.map(k=>{
    const T=TR[k];
    return act(L,{ic:T.ic,t:`Retirer : ${T.n}`,s:T.d,right:T.good?'😊':'😬',danger:!T.good,
      fn:()=>{delete L.traits[k];return out(L,`${T.ic} Tu n’as plus le trait « ${T.n} ».`)}});
  });
  const addr=rest.map(k=>{
    const T=TR[k],cf=conflicts(L.traits,k);
    return act(L,{ic:T.ic,t:T.n,s:T.d+(cf.length?` (remplace : ${cf.map(o=>TR[o].n).join(', ')})`:''),right:`${'★'.repeat(5-T.r)}`,
      fn:()=>{const lost=add(L,k);lost.forEach(o=>out(L,`${TR[o].ic} « ${TR[o].n} » disparaît, car incompatible avec « ${T.n} ».`));return out(L,`${T.ic} Tu as maintenant le trait « ${T.n} ».`)}});
  });
  const prog=Object.keys(LEARN).filter(c=>(L.tr&&L.tr[c]>0)&&!L.traits[LEARN[c][0]]).map(c=>{
    const [k,th]=LEARN[c],T=TR[k];
    return `<div class="stat"><b>${esc(T.n)}</b><span class="n">${Math.min(L.tr[c],th)}/${th}</span>${bar(Math.min(100,100*L.tr[c]/th))}</div>`;
  }).join('');
  return {title:'Traits',html:
    note(mine.length?`Tu es défini${ge(L,'','e')} par ${mine.length} trait${mine.length>1?'s':''}. À force de pratique, d’autres peuvent s’ajouter.`:'Aucun trait marquant pour l’instant. Un peu fade, non ?')
    +group('Tes traits',own)
    +(prog?`<h3 class="sec">En apprentissage</h3>${prog}`:'')
    +group('Ajouter un trait',addr)};
}

registerMod({
  id:MOD,
  born,year,heirInit,
  sheetRows(L){
    const n=tl(L).length;
    return [nav('🧩','Traits',n?tl(L).map(k=>TR[k].n).join(', '):'Aucun trait',pTraits)];
  },
  badges(L){
    const k=tl(L).find(x=>TR[x].r>=3);
    return k?[`${TR[k].ic} ${TR[k].n}`]:[];
  }
});
})();
