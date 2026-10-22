/* Deux Vies — module « Cadeaux » (id gifts)
   Offrir un cadeau à un proche ou à son partenaire : le choix dépend de l'âge de la personne, de ses goûts (deux centres d'intérêt
   stables par personne) et du budget du joueur. Un cadeau par personne et par an. Un cadeau qui plaît compte beaucoup plus,
   un cadeau trop cher offert à quelqu'un qu'on connaît mal met mal à l'aise. Pas d'état propre au module (L.used['g'+id] / 'pg'). */
(()=>{
const MOD='gifts';
const TAG={jeux:'les jeux',lecture:'la lecture',sport:'le sport',tech:'la technologie',cuisine:'la cuisine',mode:'la mode',nature:'la nature et les voyages',musique:'la musique',art:'l’art',maison:'le confort de la maison'};
const TAGS=Object.keys(TAG);
/* [nom, prix, icône, goût, âge min, âge max, romantique] — prix pour un pays au coût de la vie moyen */
const ITEMS=[
  // bébés et tout-petits
  ['Une peluche douce',15,'🧸','jeux',0,6],['Un mobile musical',25,'🎶','musique',0,3],['Des vêtements tout doux',35,'👶','mode',0,5],['Une couverture brodée',60,'🛏️','maison',0,8],
  // enfants
  ['Un livre illustré',12,'📚','lecture',3,11],['Un puzzle',15,'🧩','jeux',3,12],['Un ballon',18,'⚽','sport',4,14],['Un cerf-volant',15,'🪁','nature',4,12],['Un kit de peinture',25,'🎨','art',4,12],
  ['Une boîte de Lego',35,'🧱','jeux',4,13],['Un jeu vidéo',50,'🎮','tech',6,40],['Un ukulélé',60,'🎸','musique',5,40],['Une journée au parc d’attractions',80,'🎢','jeux',4,16],
  ['Un télescope',120,'🔭','tech',6,60],['Un vélo',150,'🚲','sport',5,15],['Une tablette',280,'💻','tech',6,16],
  // ados
  ['Un manga',10,'📖','lecture',11,25],['Un sweat à la mode',90,'🧥','mode',11,26],['Un casque audio',80,'🎧','musique',11,45],['Un skateboard',80,'🛹','sport',10,25],
  ['Une place de concert',70,'🎟️','musique',12,50],['Des baskets',110,'👟','mode',11,45],['Des cours de chant',120,'🎤','musique',12,50],['Un smartphone',350,'📱','tech',11,60],['Une console de jeux',350,'🎮','tech',10,45],
  // adultes
  ['Des chocolats',25,'🍫','cuisine',6,99],['Un bouquet de fleurs',30,'💐','nature',10,99],['Un roman',18,'📚','lecture',14,99],['Une bonne bouteille',45,'🍷','cuisine',18,99],['Une écharpe',40,'🧣','mode',12,99],
  ['Une enceinte',90,'🔊','musique',14,70],['Un dîner au restaurant',120,'🍽️','cuisine',16,99],['Un atelier de poterie',100,'🏺','art',16,99],['Du matériel de randonnée',180,'🥾','sport',14,70],
  ['Une estampe',200,'🖼️','art',18,99],['Une montre',350,'⌚','mode',16,99],['Un week-end surprise',450,'🧳','nature',18,99],['Un équipement de cuisine pro',400,'🍳','cuisine',20,80],
  ['Un ordinateur portable',900,'💻','tech',14,70],['Un vélo électrique',1200,'🚲','sport',16,75],['Un fauteuil design',700,'🛋️','maison',20,99],['Un bijou précieux',1500,'💎','mode',18,99],['Un voyage de rêve',3500,'✈️','nature',18,99],
  // seniors
  ['Une plante en pot',25,'🌸','nature',50,99],['Une pâtisserie de chez le meilleur',30,'🍰','cuisine',50,99],['Un livre en gros caractères',20,'📖','lecture',60,99],['Des jeux de mémoire',25,'🧩','jeux',55,99],
  ['Un plaid bien chaud',45,'🧶','maison',55,99],['Une radio',60,'📻','musique',55,99],['Un album des photos de famille',60,'🎞️','art',50,99],['Une sortie en car',80,'🚌','nature',55,99],['Un fauteuil relax',500,'🛋️','maison',60,99],['Un séjour thermal',900,'🏖️','nature',55,99],
  // en couple
  ['Une lettre d’amour à la main',0,'💌','art',16,99,1],['Des roses rouges',45,'🌹','nature',16,99,1],['Un concert à deux',160,'🎶','musique',16,99,1],['Un dîner aux chandelles',180,'🕯️','cuisine',16,99,1],
  ['Un bijou pour elle ou lui',400,'💍','mode',16,99,1],['Une escapade romantique',1200,'🏝️','nature',18,99,1]
];
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
const tastes=p=>{const h=hash(`${p.id||''}${p.first}${p.last||''}`),a=h%TAGS.length;let b=(h>>>9)%TAGS.length;if(b===a)b=(b+3)%TAGS.length;return [TAGS[a],TAGS[b]]};
const px=(L,v)=>v<=0?0:Math.max(5,Math.round(v*Math.min(2,costOf(L))/5)*5);
const tierOf=v=>v<30?1:v<120?2:v<500?3:4;
function shuffled(arr,seed){const r=seedRng(seed),a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function give(L,p,partner,item,price){
  const liked=tastes(p).includes(item[3]),tier=tierOf(price||0);
  const base={1:[1,3],2:[3,6],3:[6,10],4:[10,15]}[tier];
  let gain=R(base[0],base[1]);gain=liked?Math.round(gain*1.5):Math.max(1,Math.round(gain*.8));
  if(item[6])gain=Math.round(gain*1.2);
  const rel=partner?L.partner.rel:p.rel;let awkward=false;
  if(!partner&&rel<40&&price>=500){gain=Math.max(1,Math.round(gain/2));awkward=true}
  if(partner)partnerRel(L,gain);else{p.rel=clamp(p.rel+gain);p.seen=L.age;if(price>=100){const m=p.memo||(p.memo={});m.gave=(m.gave||0)+price}}
  if(price>0)track(L,'given',price);
  if(price>=200)chg(L,{karma:1,happy:1});
  const he=ge(p,'il','elle'),rav=ge(p,'ravi','ravie');
  if(awkward)return out(L,`🎁 ${p.first} est gêné${ge(p,'','e')} d’un cadeau aussi cher venant de quelqu’un qu’${he} connaît si peu. ${item[2]} Ça ne se refuse pas, mais…`);
  if(liked)return out(L,`🎁 ${item[2]} ${p.first} est ${rav} : c’est exactement ce qui lui faisait envie !`);
  return out(L,`🎁 ${item[2]} ${p.first} apprécie ton cadeau${price<=0?', fait avec le cœur':''}.`);
}
const pGift=id=>()=>{
  const L=cur(),partner=id==='partner',p=partner?partnerOf(L):byId(L,id);
  if(!p||p.alive===false)return {title:'Offrir un cadeau',html:note('Cette personne ne fait plus partie de ta vie.')};
  const key=partner?'pg':'g'+id;
  if(L.used[key])return {title:'Offrir un cadeau',html:note(`Tu as déjà offert un cadeau à ${p.first} cette année. Un par an et par personne, c’est la tradition.`)};
  const money=Math.max(0,L.money),rel=partner?L.partner.rel:p.rel,know=partner||rel>=40||['parent','sibling','child','grand'].includes(p.type);
  const tst=tastes(p);
  const all=ITEMS.filter(i=>p.age>=i[4]&&p.age<=i[5]&&(!i[6]||partner));
  const withPx=shuffled(all.map(i=>({i,v:px(L,i[1])})),`${p.id||p.first}:${L.age}`);
  const aff=withPx.filter(x=>x.v>0&&x.v<=money);
  // les cadeaux qui plaisent d'abord, puis le reste au hasard stable pour l'année
  const liked=x=>tst.includes(x.i[3])?0:1;
  const sorted=aff.slice().sort((a,b)=>liked(a)-liked(b));
  const take=(lo,hi,n)=>sorted.filter(x=>x.v>=lo&&x.v<hi).slice(0,n);
  const small=take(1,60,3),nice=take(60,500,3),big=take(500,1e9,2);
  const dream=withPx.filter(x=>x.v>money&&x.v>=100).sort((a,b)=>a.v-b.v)[0];
  const row1=x=>act(L,{ic:x.i[2],t:x.i[0],s:`${fmt(x.v)}${know&&tst.includes(x.i[3])?' · il ou elle adorerait':''}`,cost:x.v,key,fn:L=>give(L,p,partner,x.i,x.v)});
  const free=withPx.find(x=>x.v===0&&x.i[6]&&partner);
  const handmade=partner&&free?row1(free):act(L,{ic:'✂️',t:'Un cadeau fait main',s:'Gratuit, mais personnel',key,fn:L=>give(L,p,partner,['Un cadeau fait main',0,'✂️','art',0,99],0)});
  const note1=know?`D’après ce que tu sais, ${p.first} aime ${TAG[tst[0]]} et ${TAG[tst[1]]}.`:`Tu ne connais pas assez ${p.first} pour deviner ses goûts. Tu as ${fmt(money)} de côté.`;
  return {title:`Un cadeau pour ${p.first}`,html:note(note1+` Budget : ${fmt(money)}.`)
    +group('Sans dépenser',[handmade])
    +group('Petits cadeaux',small.map(row1))
    +group('Beaux cadeaux',nice.map(row1))
    +group('Gros cadeaux',big.map(row1))
    +(dream?group('Un jour peut-être',[row1(dream)]):'')};
};
window.pGift=pGift;window.giftGive=give;
window.giftTastes=tastes;window.giftItems=()=>ITEMS;
registerMod({id:MOD});
})();
