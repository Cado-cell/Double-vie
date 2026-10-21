/* Deux Vies — module « Couple avancé » (id couple)
   État du partenaire PNJ : L.partner.x = {willpower, craziness, fertility, networth, kidsDesire, lastVows, seen}
   (seen = désir d’enfant et folie révélés). État de la vie : L.cpl = {lv (âge des derniers vœux), merged, mid}. */
(()=>{
const MOD='couple';
const lim=(v,a,b)=>Math.max(a,Math.min(b,v));
const isNpc=L=>!!(L&&L.partner&&L.partner.link==null&&L.partner.p);
const cp=L=>L.cpl&&typeof L.cpl==='object'?L.cpl:(L.cpl={});
const pareto=()=>{
  const v=13000*Math.pow(1-Math.random()*.985,-1/1.16);
  const n=Math.round(Math.min(v,5e7));
  return Math.random()<.12?-Math.round(n*.35):n;
};
function X(L){
  if(!isNpc(L))return null;
  const P=L.partner,p=P.p;
  if(!P.x||typeof P.x!=='object'){
    const old=p.age>=40;
    P.x={willpower:R(10,90),craziness:lim(Math.round((p.crazy!=null?p.crazy:R(0,60))+R(-10,15)),0,100),fertility:old?R(10,60):R(30,100),
      networth:pareto(),kidsDesire:old?R(0,50):R(10,100),lastVows:P.wedAge!=null?P.wedAge:null,seen:false};
  }
  return P.x;
}
const pName=L=>{const p=partnerOf(L);return p?p.first:'ton partenaire'};
const F=L=>{const p=partnerOf(L);return !!p&&p.gender==='F'};
const dispo=(L,v)=>v>=70?'très fort':v>=40?'plutôt présent':v>=15?'assez faible':'quasi inexistant';
const folie=v=>v>=75?'très imprévisible':v>=50?'un brin excentrique':v>=25?'plutôt posé':'d’un calme olympien';
const wedYears=L=>L.partner&&L.partner.status==='marie'?L.age-(L.partner.wedAge!=null?L.partner.wedAge:L.age):0;
const lastV=L=>{const c=cp(L);return c.lv!=null?c.lv:(L.partner&&L.partner.wedAge!=null?L.partner.wedAge:L.age)};

/* ---------- Panneau des vœux ---------- */
const VOWS=[
  {n:'À la mairie',ic:'🏛️',c:200,r:[8,14],t:'Quelques mots devant monsieur le maire, un café ensuite.'},
  {n:'Dans un champêtre',ic:'🌾',c:2500,r:[12,20],t:'Guirlandes, grange et accordéon : un vrai mariage de campagne.'},
  {n:'Au château',ic:'🏰',c:12000,r:[18,30],t:'Valets, champagne et pièce montée de trois étages.'}];
function pVows(){
  const L=cur(),n=pName(L);
  return {title:'Renouveler vos vœux',html:note(`Une seconde fois, avec ${n}, et sans le stress de la première.`)+group('Formule',VOWS.map(v=>act(L,{ic:v.ic,t:v.n,s:`${fmt(v.c)} · ${v.t}`,cost:v.c,fn:L=>{
    const g=R(v.r[0],v.r[1]);partnerRel(L,g);chg(L,{happy:R(5,9)});cp(L).lv=L.age;const x=X(L);if(x)x.lastVows=L.age;
    if(STACK.length>1)STACK.pop();
    return out(L,`💞 Vous renouvelez vos vœux ${v.n.toLowerCase()}. ${n} a les larmes aux yeux.`)}})))};
}
const pBreakEng=()=>confirmP('Rompre les fiançailles ?','La bague est perdue ou rendue selon l’humeur de ton ex-fiancé(e). Aucun retour possible.',()=>{
  const L=cur(),n=pName(L);STACK.pop();
  const back=L.partner&&L.partner.rel>=35&&chance(.6);
  if(back){L.money+=900;return breakUp(L,`Tu rends les fiançailles à ${n}. La bague est revendue, tu récupères 900 €.`)}
  return breakUp(L,`Les fiançailles avec ${n} sont rompues. La bague ne reviendra jamais.`)
},'Rompre les fiançailles');
const pMerge=()=>{const L=cur(),x=X(L);const n=pName(L);
  return {title:'Fusionner les comptes',html:note(x?`Vous mettriez en commun une partie du patrimoine de ${n} (${fmt(x.networth)}). Pratique en ménage ; moins en cas de divorce.`:'Indisponible.')+
    group('',[x?row({ic:'🏦',t:'Mettre en commun',s:x.networth>=0?`Tu reçois environ ${fmt(x.networth*.3)}`:`Tu hérites de dettes : ${fmt(-x.networth*.3)}`,a:()=>{STACK.pop();run(()=>{
      const L=cur(),x=X(L);if(!x||(L.partner&&L.partner.status!=='marie'))return '';
      const amt=Math.round(x.networth*.3);L.money+=amt;x.networth-=amt;const c=cp(L);c.merged=(c.merged||0)+amt;c.mid=L.partner.p.id;
      return out(L,amt>=0?`🏦 Vous fusionnez vos comptes : ${fmt(amt)} rejoignent ton solde.`:`🏦 Vous fusionnez vos comptes, et les dettes avec : ${fmt(amt)}.`)})}}):'',
      row({ic:'↩️',t:'Annuler',a:back})])};};

/* ---------- Conditions et effets ---------- */
const conds={
  pnj:L=>isNpc(L)&&!!X(L),
  mariePnj:L=>isNpc(L)&&L.partner.status==='marie',
  divorce:L=>isNpc(L)&&L.partner.status==='marie'&&(L.partner.rel<45||X(L).craziness>65),
  ransom:L=>isNpc(L)&&L.age>=22&&(L.money>=3000||X(L).networth>=20000),
  kids:L=>isNpc(L)&&L.age<=48&&partnerOf(L).age<=48&&X(L).kidsDesire>=65&&L.partner.status!=='couple',
  jealous:L=>isNpc(L)&&X(L).craziness>=60,
  gift:L=>isNpc(L)&&L.partner.rel>=50,
  anniv:L=>!!L.partner&&L.age-(L.partner.since!=null?L.partner.since:L.age)>=1,
  fired:L=>isNpc(L)&&partnerOf(L).age>=22&&partnerOf(L).age<=62&&X(L).networth>-200000,
  legacy:L=>isNpc(L)&&partnerOf(L).age>=35&&X(L).networth>=30000
};
const effects={
  therapy:L=>{
    if(L.money<1500)return `Pas assez d’argent pour la thérapie. ${pName(L)} soupire et boude.`;
    spend(L,1500);const x=X(L);
    if(chance(.65)){partnerRel(L,R(12,22));if(x)x.craziness=lim(x.craziness-R(3,10),0,100);chg(L,{happy:4,stress:-4});return `La thérapeute fait des miracles : vous vous reparlez enfin, ${pName(L)} et toi.`}
    partnerRel(L,-6);chg(L,{stress:3});return 'Trois séances, un mouchoir par personne, et rien de changé.';
  },
  accept:L=>breakUp(L,`Tu acceptes la décision de ${pName(L)}. Le divorce est prononcé.`),
  negotiate:L=>{
    const x=X(L),ok=chance(.5+(L.st.smarts-50)/200);
    if(ok){const g=Math.round(Math.max(0,L.money)*.05);const m=breakUp(L,`Tu négocies habilement la pension.`);return m+(g?` Tu sauves ${fmt(g)}.`:'')}
    const loss=Math.round(Math.max(0,L.money)*.15);spend(L,loss);if(x)x.networth+=Math.round(loss/2);
    return breakUp(L,`La négociation tourne mal : pension de ${fmt(loss)} en plus.`);
  },
  ransomPay:L=>{
    const sum=R(5,25)*1000,n=pName(L);
    if(L.money<sum){chg(L,{stress:8,happy:-6});partnerRel(L,-15);return `Tu n’as pas les ${fmt(sum)} demandés. ${n} est finalement relâché${F(L)?'e':''} grâce à un cousin policier, mais n’oublie pas.`}
    spend(L,sum);partnerRel(L,R(10,20));chg(L,{stress:6,happy:-3});
    return `Tu paies ${fmt(sum)}. ${n} revient sain${F(L)?'e':''} et sauf${F(L)?'ve':''}, reconnaissant${F(L)?'e':''}.`;
  },
  ransomPolice:L=>{
    const n=pName(L);
    if(chance(.7)){partnerRel(L,R(8,16));chg(L,{karma:3,stress:4});return `La police remonte la piste en deux jours. ${n} est sain${F(L)?'e':''} et sauf${F(L)?'ve':''}, tu es un héros discret.`}
    partnerRel(L,-8);chg(L,{stress:10,happy:-5});return `L’enquête s’éternise ; ${n} finit par rentrer seul${F(L)?'e':''}, fatigué${F(L)?'e':''} et vexé${F(L)?'e':''} par ta prudence.`;
  },
  ransomNothing:L=>{
    const n=pName(L);
    if(chance(.45)){partnerRel(L,-12);chg(L,{karma:-3,stress:6});return `Tu ne fais rien. ${n} se libère seul${F(L)?'e':''} et ne te le pardonne pas.`}
    partnerRel(L,-25);chg(L,{karma:-5,happy:-6});if(chance(.5))return breakUp(L,`Après ton silence, ${n} te quitte.`);
    return `Les ravisseurs se lassent et relâchent ${n}. L’ambiance à la maison est polaire.`;
  },
  tryKid:L=>{partnerRel(L,R(2,6));return tryBaby(L)||`Vous essayez, ${pName(L)} et toi.`},
  notNow:L=>{const x=X(L);if(x)x.kidsDesire=lim(x.kidsDesire-R(5,15),0,100);partnerRel(L,-R(5,12));return `${pName(L)} accepte, mais cache mal sa déception.`},
  jealReassure:L=>{partnerRel(L,R(4,9));const x=X(L);if(x)x.craziness=lim(x.craziness-R(1,5),0,100);chg(L,{stress:2});return `Tu rassures ${pName(L)} pendant une heure. Ça passe… jusqu’à la prochaine fois.`},
  jealQuarrel:L=>{partnerRel(L,-R(10,18));chg(L,{happy:-5,stress:5});return `Dispute mémorable. Les voisins ont tout entendu, ${pName(L)} aussi.`},
  gift:L=>{partnerRel(L,R(6,12));chg(L,{happy:7});const g=pick(['des billets pour un concert','un week-end en cabane dans les arbres','une montre gravée','un dîner dans ton restaurant préféré']);return `${pName(L)} t’offre ${g}. Quelle surprise !`},
  annivDin:L=>{if(L.money<150){partnerRel(L,2);return 'Un pique-nique sur le canapé fait l’affaire.'}spend(L,150);partnerRel(L,R(6,12));chg(L,{happy:4});return `Dîner pour fêter votre rencontre avec ${pName(L)}.`},
  annivForgot:L=>{partnerRel(L,-R(8,14));chg(L,{happy:-3});return `Tu as complètement oublié. ${pName(L)} a une mémoire d’éléphant.`},
  fired:L=>{const x=X(L);if(x)x.networth-=R(5,20)*1000;partnerRel(L,R(-3,3));chg(L,{stress:3});return `${pName(L)} perd son emploi. Le budget du couple tousse un peu.`},
  support:L=>{if(L.money<1000)return 'Tu es trop juste pour aider financièrement.';spend(L,1000);const x=X(L);if(x)x.networth-=R(5,20)*1000;partnerRel(L,R(8,14));chg(L,{karma:2});return `Tu avances 1 000 € à ${pName(L)}. Une promesse de remboursement, écrite sur une serviette.`},
  legacy:L=>{const x=X(L);if(!x)return '';const g=Math.round(Math.min(x.networth*.1,400000)+R(2000,12000));x.networth+=g;
    if(L.partner&&L.partner.status==='marie'){earn(L,Math.round(g*.3),true);return `Un oncle de ${pName(L)} lègue un joli magot au ménage : ${fmt(Math.round(g*.3))} pour toi.`}
    partnerRel(L,R(2,5));return `${pName(L)} hérite de ${fmt(g)}. Vous trinquez à l’oncle.`;
  }
};

for(const k of Object.keys(effects)){const f=effects[k];effects[k]=(L,a)=>{if(!L||!L.partner)return '';try{return f(L,a)}catch(e){console.error(e);return ''}}}
/* ---------- Évènements ---------- */
const MC=(fn,args)=>({mod_cond:{mod:MOD,fn,args}});
const ME=fn=>({mod_effect:{mod:MOD,fn}});
const eventsDb=[
 {id:'evt_couple_divorce',category:'love',icon:'💔',once:true,conditions:{mod_cond:{mod:MOD,fn:'divorce'}},probability_weight:.12,
  prompt_text:'{partner} te regarde droit dans les yeux : « Il faut qu’on parle. Je veux divorcer. »',
  choices:[{choice_text:'Proposer une thérapie de couple (1 500 €)',consequences:ME('therapy')},
           {choice_text:'Accepter le divorce',consequences:ME('accept')},
           {choice_text:'Négocier la pension',consequences:ME('negotiate')}]},
 {id:'evt_couple_ransom',category:'family',icon:'📞',conditions:MC('ransom'),probability_weight:.04,once:true,
  prompt_text:'Un appel anonyme : « On a {partner}. Il vous en coûtera quelques milliers d’euros pour le/la revoir. » Une voix très peu professionnelle…',
  choices:[{choice_text:'Payer la rançon',consequences:ME('ransomPay')},
           {choice_text:'Appeler la police',consequences:ME('ransomPolice')},
           {choice_text:'Ne rien faire',consequences:ME('ransomNothing')}]},
 {id:'evt_couple_kids',category:'love',icon:'👶',conditions:MC('kids'),probability_weight:.12,
  prompt_text:'{partner} ne parle plus que de ça : un bébé. Poussettes en vitrine, prénoms sur le frigo.',
  choices:[{choice_text:'Se lancer',consequences:ME('tryKid')},{choice_text:'Pas tout de suite',consequences:ME('notNow')}]},
 {id:'evt_couple_jealous',category:'love',icon:'😡',conditions:MC('jealous'),probability_weight:.13,
  prompt_text:'{partner} a lu un message sur ton téléphone. C’était ta grand-mère, mais le doute s’est installé.',
  choices:[{choice_text:'Rassurer, patiemment',consequences:ME('jealReassure')},{choice_text:'Hausser le ton',consequences:ME('jealQuarrel')}]},
 {id:'evt_couple_gift',category:'love',icon:'🎁',conditions:MC('gift'),probability_weight:.1,
  prompt_text:'{partner} rentre avec un grand sourire et un paquet maladroitement emballé.',consequences:ME('gift')},
 {id:'evt_couple_anniv',category:'love',icon:'🥂',conditions:MC('anniv'),probability_weight:.1,
  prompt_text:'C’est l’anniversaire de votre rencontre avec {partner}. Il paraît qu’il faut marquer le coup.',
  choices:[{choice_text:'Réserver une table (150 €)',consequences:ME('annivDin')},{choice_text:'Laisser passer la date',consequences:ME('annivForgot')}]},
 {id:'evt_couple_fired',category:'love',icon:'📦',conditions:MC('fired'),probability_weight:.07,
  prompt_text:'{partner} rentre avec un carton plein de fournitures de bureau : licencié(e).',
  choices:[{choice_text:'Le/la soutenir (1 000 €)',consequences:ME('support')},{choice_text:'Se contenter de dire « ça va aller »',consequences:ME('fired')}]},
 {id:'evt_couple_legacy',category:'family',icon:'📜',once:true,conditions:MC('legacy'),probability_weight:.05,
  prompt_text:'Un notaire appelle : un parent éloigné de {partner} laisse un héritage inattendu.',consequences:ME('legacy')}
];
registerMod({id:MOD,conds,effects,eventsDb,
  partnerRows(L){
    const P=L.partner;if(!P)return [];const rows=[],x=X(L),n=pName(L);
    rows.push(act(L,{ic:'🔮',t:'Parler de l’avenir',s:x&&x.seen?'Vous en avez déjà parlé':'Enfants, projets, tempérament',key:'cpTalk',min:16,fn:L=>{
      const x=X(L);
      if(!x){partnerRel(L,R(2,6));return out(L,`Vous parlez de l’avenir avec ${n}. Tout se passe bien.`)}
      x.seen=true;
      const d=x.kidsDesire,gap=d>=65?R(2,8):d<=20?-R(2,8):R(-3,4);
      partnerRel(L,gap);chg(L,{happy:gap>0?2:-1});
      return out(L,`🔮 ${n} : désir d’enfant ${dispo(L,d)}, caractère ${folie(x.craziness)}.`)}}));
    if(x&&x.seen)rows.push(row({ic:'📋',t:`Ce que tu sais d’${F(L)?'elle':'lui'}`,s:`Désir d’enfant ${dispo(L,x.kidsDesire)} · ${folie(x.craziness)}`,dis:1}));
    if(P.status==='marie'){
      const yrs=wedYears(L),since=L.age-lastV(L);
      rows.push(act(L,{ic:'💞',t:'Renouveler vos vœux',s:yrs<5?`Dans ${5-yrs} an${5-yrs>1?'s':''}`:since<5?`Dans ${5-since} an${5-since>1?'s':''}`:'Mairie, champêtre ou château',dis:yrs<5?`Dès 5 ans de mariage (${yrs})`:since<5?`Prochain renouvellement dans ${5-since} an(s)`:'',nav:pVows}));
      if(x)rows.push(act(L,{ic:'🏦',t:'Fusionner les comptes',s:cp(L).merged?'Déjà fait':`Patrimoine de ${n} : ${fmt(x.networth)}`,dis:cp(L).merged?'Comptes déjà fusionnés':'',nav:pMerge}));
    }
    if(P.status==='fiance')rows.push(row({ic:'💔',t:'Rompre les fiançailles',s:'La bague suivra… ou pas',danger:1,right:'›',a:()=>pushPanel(pBreakEng())}));
    return rows;
  },
  year(L){
    const P=L.partner,c=cp(L);
    if(c.merged&&(!P||P.p&&P.p.id!==c.mid)){
      const loss=Math.round(Math.abs(c.merged)*.5);
      if(c.merged>0){spend(L,loss);say(L,`💸 La séparation te coûte ${fmt(loss)} : le compte joint se partage.`)}
      c.merged=0;c.mid=null;
    }
    const x=X(L);if(!x||!P)return;
    const p=P.p;
    x.craziness=lim(x.craziness+R(-2,2)+(L.age>50?-1:0),0,100);
    if(p.age>30)x.kidsDesire=lim(x.kidsDesire-R(1,(p.age>40?7:3)),0,100);
    if(p.age>45)x.fertility=lim(x.fertility-R(2,8),0,100);
    const g=1+(Math.random()-.45)*.12;
    x.networth=Math.round(x.networth>=0?x.networth*g+R(0,2500):x.networth*(2-g)+R(0,1500));
    if(P.status==='marie'&&c.merged&&x.networth>0)x.networth=Math.round(x.networth*.98);
    if(x.craziness>=60&&chance((x.craziness-50)/160)){partnerRel(L,-R(2,7));chg(L,{stress:2});say(L,`💢 ${p.first} a fait une scène pour presque rien.`)}
    else if(x.craziness<30&&chance(.15))partnerRel(L,R(1,3));
    if(x.willpower>70&&P.rel<40&&chance(.2))partnerRel(L,-R(1,4));
  },
  inherit(D,L){if(D&&D.cpl&&L)L.cpl={}},
  born(L){L.cpl={}}
});
})();
