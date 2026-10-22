/* Deux Vies — module « Proches vivants » (id agents), première version.
   Chaque année, un proche (parent, frère ou sœur, ami, grand-parent, enfant adulte) agit de lui-même selon sa personnalité,
   la qualité de votre relation et le temps écoulé depuis votre dernière rencontre : appel, visite, demande d'argent, dispute,
   réconciliation, reproche, déménagement, nouveau métier, remerciement ou rancune. Mémoire par personne : p.seen (âge de votre dernière rencontre), p.act (dernière action),
   p.memo (ce que tu lui as donné ou refusé : gave, refused, thanked, grudged). Le testament en tient compte (willFactor dans engine.js). */
(()=>{
const MOD='agents';
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
/* Personnalité stable, déduite de l'identité du personnage. */
const pers=p=>{const h=hash(p.id||p.first);return {sociable:h%100,loyal:(h>>>7)%100,impulsif:Math.min(100,Math.round(((p.crazy??40)+((h>>>14)%100))/2))}};
const eligible=L=>(L.family||[]).filter(p=>p&&p.alive!==false&&p.age>=12&&['parent','sibling','friend','grand','child'].includes(p.type)&&p.tag!=='rival'&&p.tag!=='voisin'&&!(p.type==='child'&&p.age<18));
const em=t=>t;
function pickWeighted(items){const tot=items.reduce((s,x)=>s+x[1],0);let r=Math.random()*tot;for(const [v,w] of items){r-=w;if(r<=0)return v}return items[items.length-1][0]}

function act(L,p){
  if(p.seen==null)p.seen=L.age;
  const S=t=>{say(L,t);return true};
  const P=pers(p),adult=p.age>=18,gap=L.age-p.seen,close=p.rel>=60;
  const opts=[['call',3+P.sociable/40],['birthday',1+P.loyal/60]];
  if(adult&&(p.type==='friend'||p.type==='sibling'||p.type==='parent'||p.type==='grand'))opts.push(['visit',1.5+P.sociable/50]);
  if(adult&&p.type!=='grand'&&p.type!=='parent'){opts.push(['job',1],['move',.7])}
  if(adult&&L.money>=600&&p.type!=='grand')opts.push(['money',.8+(close?.5:0)+(P.loyal<40?.4:0)]);
  if(p.rel<50)opts.push(['fight',.3+P.impulsif/90+(50-p.rel)/80]);
  if(p.rel<40&&P.loyal>35)opts.push(['peace',2.5]);
  if(gap>=3&&p.rel<85)opts.push(['neglect',1+gap/3]);
  const m=p.memo||(p.memo={});
  if(m.gave>0&&!m.thanked&&P.loyal>35)opts.push(['thanks',2.5]);
  if(m.refused>0&&!m.grudged&&P.loyal<70)opts.push(['grudge',1.5]);
  const k=pickWeighted(opts);
  switch(k){
    case 'call':p.rel=clamp(p.rel+2);p.seen=L.age;return S(`📞 ${p.first} t’appelle pour prendre de tes nouvelles. Vous parlez deux heures.`);
    case 'birthday':p.rel=clamp(p.rel+2);p.seen=L.age;return S(`🎂 ${p.first} te souhaite ton anniversaire avec un message beaucoup trop long.`);
    case 'visit':p.rel=clamp(p.rel+3);p.seen=L.age;chg(L,{happy:2});return S(`🚪 ${p.first} passe te voir à l’improviste, avec un gâteau à moitié écrasé.`);
    case 'job':{const j=pick(NPC_JOBS.filter(x=>x!=='sans emploi'));p.job=j;return S(`🗞️ ${p.first} change de métier : ${j}.`)}
    case 'move':{const c=pick(COUNTRIES[L.country].cities);p.rel=clamp(p.rel-2);return S(`📦 ${p.first} déménage à ${c}. Les week-ends ensemble vont devenir rares.`)}
    case 'fight':p.rel=clamp(p.rel-10);return S(`💢 ${p.first} s’énerve contre toi après un malentendu. Le ton monte, la porte claque.`);
    case 'peace':p.rel=clamp(p.rel+10);p.seen=L.age;return S(`🤝 ${p.first} te tend la main après vos mots de travers. Vous vous réconciliez.`);
    case 'neglect':p.rel=clamp(p.rel-6);return S(`📭 ${p.first} trouve que tu ne donnes plus de nouvelles depuis ${An(gap)}.${p.type==='parent'||p.type==='grand'?' Tu sens que son testament pourrait s’en ressentir.':''}`);
    case 'thanks':{m.thanked=1;p.rel=clamp(p.rel+8);p.seen=L.age;const back=P.loyal>50?Math.round(m.gave*.5/50)*50:0;if(back>=50){earn(L,back);return S(`🎁 ${p.first} se souvient de ton coup de pouce et te rend ${fmt(back)} avec un petit mot.`)}return S(`💌 ${p.first} te dit que ton aide l’a marqué${ge(p,'','e')} : « Je n’oublie pas. »`)}
    case 'grudge':m.grudged=1;p.rel=clamp(p.rel-4);return S(`😒 ${p.first} n’a pas oublié le jour où tu as refusé de l’aider. Il y a des silences qui durent.`);
    case 'money':{
      const base=p.type==='friend'?R(100,1500):R(200,3000),amt=Math.max(50,Math.round(base*Math.min(2,costOf(L))/50)*50);
      if(L.money<amt*2)return S(`📞 ${p.first} aurait voulu te demander un coup de pouce, mais renonce en voyant ta situation.`);
      modal({title:p.first,icon:'💶',text:`${p.first} (${role(p).toLowerCase()}) te demande ${fmt(amt)} : « Juste un petit coup de pouce, je te rembourse vite. »`,choices:[
        {t:`Donner ${fmt(amt)}`,fn:()=>{if(L.money<amt)return 'Tu n’as plus assez d’argent.';L.money-=amt;p.rel=clamp(p.rel+8);p.seen=L.age;m.gave=(m.gave||0)+amt;chg(L,{karma:2});track(L,'given',amt);return out(L,`💶 Tu donnes ${fmt(amt)} à ${p.first}. ${P.loyal>50?'Il y aura un merci, et peut-être un remboursement.':'Tu n’en entendras plus parler.'}`)}},
        {t:`Prêter la moitié (${fmt(Math.round(amt/2))})`,fn:()=>{const h=Math.round(amt/2);if(L.money<h)return 'Tu n’as plus assez d’argent.';L.money-=h;p.rel=clamp(p.rel+3);m.gave=(m.gave||0)+h;return out(L,`💶 Tu prêtes ${fmt(h)} à ${p.first}.`)}},
        {t:'Refuser poliment',fn:()=>{p.rel=clamp(p.rel-(close?9:5));m.refused=(m.refused||0)+1;return out(L,`${p.first} encaisse le refus, un peu vexé${ge(p,'','e')}.`)}}]});
      return true}
  }
}
function year(L){
  if(!L||L.age<10||L.prison||L.alive===false)return;
  const c=eligible(L);c.forEach(p=>{if(p.seen==null)p.seen=L.age});if(!c.length||Math.random()>.6)return;
  const w=c.map(p=>[p,Math.max(.2,(1+p.rel/50)*(p.act!=null&&L.age-p.act<2?.3:1))]);
  const p=pickWeighted(w);p.act=L.age;
  try{if(act(L,p))track(L,'agentEvents')}catch(e){console.error(e)}
}
registerMod({id:MOD,year});
})();
