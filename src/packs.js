/* Deux Vies — systèmes intégrés au cœur : armée, royauté, réseaux sociaux.
   Les autres extensions vivent dans les fichiers mod_*.js (voir registerMod dans engine.js). */

const skillOf=(L,t)=>{let m=0;for(const Ls of LESSONS)if(Ls.t===t)m=Math.max(m,L.skills[Ls.k]||0);return m+(L.talent===t?35:0)};
function spark(vals,w=72,h=22){if(!vals||vals.length<2)return '';const mn=Math.min(...vals),mx=Math.max(...vals),r=mx-mn||1;const pts=vals.map((v,i)=>`${(i/(vals.length-1)*w).toFixed(1)},${(h-2-(v-mn)/r*(h-4)).toFixed(1)}`).join(' ');const up=vals[vals.length-1]>=vals[0];return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(${up?'--good':'--bad'})" stroke-width="1.6" stroke-linejoin="round"/></svg>`}

/* ================= Armée ================= */
function militaryYear(L){
  const j=L.job;if(!j||!j.mil)return 0;
  if(chance(.25)){
    modal({title:`${L.first} · opération extérieure`,icon:'🎖️',text:`Ton unité est déployée en opération ${pick(['au Sahel','au Moyen-Orient','dans les Balkans','en mer Rouge'])}.`,choices:[
      {t:'Prendre la tête de la patrouille',fn:()=>{if(chance(.06)){L.st.health=clamp(L.st.health-40);return out(L,'Tu es grièvement blessé lors d’un accrochage.')}j.perf=clamp(j.perf+12);if(chance(.35)){track(L,'medals');chg(L,{fame:3,happy:8});return out(L,'🎖️ Tu reçois la croix de la Valeur militaire.')}return out(L,'Mission accomplie. Ton commandant te félicite.')}},
      {t:'Rester en soutien logistique',fn:()=>{j.perf=clamp(j.perf+3);return out(L,'Tu assures le ravitaillement sans encombre.')}},
      {t:'Soigner les blessés',fn:()=>{chg(L,{karma:6});j.perf=clamp(j.perf+6);return out(L,'Tu sauves la vie d’un camarade.')}}]});
    return 1;
  }
  return 0;
}

/* ================= Royauté ================= */
function royalTitle(L){const r=L.royal;if(!r)return '';const mon=COUNTRIES[r.country].mon;if(r.throne)return `${mon[L.gender==='F'?1:0]} de ${r.country}`;return ge(L,'Prince','Princesse')}
function royalSuccession(L,p){
  const r=L.royal;if(!r||r.throne||r.exiled)return;
  r.line=Math.max(1,r.line-1);
  if(r.line===1&&L.age>=16){r.throne=true;track(L,'throne');chg(L,{fame:30,happy:10});say(L,`👑 Tu montes sur le trône : ${royalTitle(L)}. Vive ${L.gender==='F'?'la reine':'le roi'} !`)}
}
function royalYear(L){
  const r=L.royal;if(!r||r.exiled)return;
  r.approval=clamp(r.approval+R(-6,4)+(L.hid.karma-50)/20);
  L.fame=Math.max(L.fame,r.throne?90:60);
  if(r.throne&&r.approval<12&&chance(.4)){r.exiled=true;r.throne=false;say(L,'🔥 Une révolution éclate. Tu dois fuir le pays et vivre en exil.');chg(L,{happy:-25})}
}
function pRoyal(){
  const L=cur(),r=L.royal;if(!r)return {title:'Royauté',html:note('Tu ne fais plus partie de la famille royale.')};const H=[
    act(L,{ic:'👋',t:'Apparition publique',s:'Popularité',key:'r_app',fn:L=>{r.approval=clamp(r.approval+R(2,7));return out(L,'Tu salues la foule depuis le balcon du palais.')}}),
    act(L,{ic:'🤲',t:'Visiter une œuvre de charité',s:'Karma et popularité',key:'r_char',fn:L=>{r.approval=clamp(r.approval+R(3,8));chg(L,{karma:5});return out(L,'Tu inaugures un hôpital pour enfants.')}}),
    act(L,{ic:'💃',t:'Organiser un bal au palais',s:'Rencontres de la haute société',key:'r_bal',fn:L=>{chg(L,{happy:6});if(!L.partner&&L.age>=18&&chance(.4)){const p=person(likeG(L),L.age+R(-4,4),pick(ROYAL_HOUSES),L.country);p.job='aristocrate';findLove(L,p);return out(L,'Une personne de sang noble attire ton regard.')}return out(L,'Valses, champagne et lustres en cristal.')}}),
    act(L,{ic:'🛥️',t:'Escapade discrète sur un yacht',s:'Bonheur, risque de scandale',key:'r_yacht',fn:L=>{chg(L,{happy:8});if(chance(.3)){r.approval=clamp(r.approval-10);track(L,'scandals');return out(L,'Les tabloïds publient des photos de tes vacances. Scandale !')}return out(L,'Une semaine de farniente en Méditerranée.')}})
  ];
  if(r.throne){
    H.push(act(L,{ic:'🎙️',t:'Prononcer un discours à la nation',key:'r_disc',fn:L=>{if(chance(.5+L.st.smarts/300)){r.approval=clamp(r.approval+8);return out(L,'Ton discours émeut le pays.')}r.approval=clamp(r.approval-6);return out(L,'Ton discours tombe à plat.')}}));
    H.push(act(L,{ic:'⚖️',t:'Gracier un prisonnier',key:'r_grace',fn:L=>{r.approval=clamp(r.approval+R(-5,8));chg(L,{karma:4});return out(L,'Ta grâce royale fait débat.')}}));
    H.push(row({ic:'🏳️',t:'Abdiquer',danger:1,a:()=>pushPanel(confirmP('Abdiquer ?','Tu renonces au trône au profit de ton héritier.',()=>{r.throne=false;r.line=2;chg(L,{happy:-5});return out(L,'Tu abdiques. Une page se tourne.')}))}));
  }
  H.push(row({ic:'🚪',t:'Renoncer à tes titres',s:'Tu pourras travailler comme tout le monde',danger:1,a:()=>pushPanel(confirmP('Renoncer à tes titres ?','Tu perds ton rang et tes revenus royaux.',()=>{L.royal=null;return out(L,'Tu renonces à tes titres royaux.')}))}));
  return {title:royalTitle(L),html:card(r.throne?'Souverain':'Famille royale',royalTitle(L),r.throne?`Revenus de la liste civile : ${fmt(2500000)} par an`:`${r.line===1?'Héritier direct':`${r.line}e`} dans l’ordre de succession`,statLine('Popularité',r.approval))+group('Devoirs royaux',H)};
}

/* ================= Réseaux sociaux ================= */
const PLATFORMS={InstaFlash:{d:'Photos',k:'looks'},TikTak:{d:'Vidéos courtes',k:'crazy'},VidéoTube:{d:'Vidéos longues',k:'smarts'},Piaf:{d:'Messages courts',k:'smarts'}};
function socialYear(L){
  const S=L.social;let tot=0;
  for(const pf in S.pf){S.pf[pf]=Math.max(0,Math.round(S.pf[pf]*(.92+R(0,10)/100)));tot+=S.pf[pf]}
  if(tot>=100000&&!S.verified){S.verified=true;say(L,'✔️ Ton compte est certifié.')}
  if(tot>0)L.fame=Math.max(L.fame,clamp(Math.log10(tot+1)*14-20));
}
function pSocial(){
  const L=cur();const S=L.social;
  const tot=Object.values(S.pf).reduce((s,n)=>s+n,0);
  const rows=Object.entries(PLATFORMS).map(([pf,P])=>{
    if(S.pf[pf]==null)return act(L,{ic:'➕',t:`Créer un compte ${pf}`,s:P.d,min:13,fn:L=>{S.pf[pf]=R(5,60);return out(L,`Tu crées ton compte ${pf}.`)}});
    return row({ic:'📱',t:pf,s:`${fmtn(S.pf[pf])} abonnés · ${P.d}`,right:'›',a:()=>pushPanel(pPlatform(pf))});
  });
  return {title:'Réseaux sociaux',html:card('Influence',`${fmtn(tot)} abonnés`,S.verified?'Compte certifié ✔️':'Certification à 100 000 abonnés','')+group('Plateformes',rows)};
}
function pPlatform(pf){return ()=>{
  const L=cur(),S=L.social;const P=PLATFORMS[pf];const stat=P.k==='looks'?L.st.looks:P.k==='crazy'?L.hid.crazy:L.st.smarts;
  const gain=m=>{const base=Math.round((S.pf[pf]*.08+R(5,80))*(.5+stat/100)*(1+L.fame/40)*m);const viral=chance(.04+L.hid.crazy/1500);const n=viral?base*R(20,80):base;S.pf[pf]+=n;return {n,viral}};
  return {title:pf,html:card(P.d,`${fmtn(S.pf[pf])} abonnés`,'','')+group('Publier',[
    act(L,{ic:'📷',t:'Publier un post',key:'post_'+pf,fn:L=>{const {n,viral}=gain(1);return out(L,viral?`🔥 Ton post sur ${pf} devient viral : +${fmtn(n)} abonnés !`:`Ton post sur ${pf} t’apporte ${fmtn(n)} abonnés.`)}}),
    act(L,{ic:'🔴',t:'Lancer un live',key:'live_'+pf,fn:L=>{const {n,viral}=gain(1.6);chg(L,{happy:2});return out(L,viral?`🔥 Ton live explose les compteurs : +${fmtn(n)} abonnés !`:`Live sympa : +${fmtn(n)} abonnés.`)}}),
    act(L,{ic:'🤝',t:'Accepter un partenariat sponsorisé',s:'Dès 10 000 abonnés',dis:S.pf[pf]<10000?'Pas encore assez d’abonnés':'',key:'spon_'+pf,fn:L=>{const g=Math.round(S.pf[pf]*R(1,4)/100);earn(L,g);S.pf[pf]=Math.round(S.pf[pf]*.97);return out(L,`Partenariat avec une marque de ${pick(['thé détox','baskets','cosmétiques','montres','jeux mobiles'])} : ${fmt(g)}.`)}}),
    act(L,{ic:'🧨',t:'Lancer une polémique',s:'Risqué',key:'pol_'+pf,fn:L=>{if(chance(.5)){const {n}=gain(3);return out(L,`La polémique fait le buzz : +${fmtn(n)} abonnés.`)}S.pf[pf]=Math.round(S.pf[pf]*.7);track(L,'scandals');return out(L,'Bad buzz : tu perds 30 % de tes abonnés.')}}),
    row({ic:'🗑️',t:'Supprimer le compte',danger:1,a:()=>pushPanel(confirmP(`Supprimer ${pf} ?`,'Tous tes abonnés seront perdus.',()=>{delete S.pf[pf];STACK.pop();return out(L,`Tu supprimes ton compte ${pf}.`)}))})])};
}}

/* ================= Points d’entrée ================= */
function packsYear(L){
  royalYear(L);socialYear(L);
  modCall('year',L);
}
function packEvents(L){
  let q=militaryYear(L);
  if(L.royal&&!L.royal.exiled&&chance(.2)){q++;modal({title:`${royalTitle(L)}`,icon:'👑',text:pick(['Un journaliste publie une biographie non autorisée de ta famille.','Le Premier ministre sollicite une audience privée.','Un chef d’État étranger t’invite à un dîner officiel.']),choices:[{t:'Répondre avec grâce',fn:()=>{L.royal.approval=clamp(L.royal.approval+5);return 'Tu gères la situation avec élégance.'}},{t:'Ignorer',fn:()=>{L.royal.approval=clamp(L.royal.approval-3);return 'Ton silence est commenté.'}}]})}
  for(const n of modCall('events',L))q+=(+n||0);
  return q;
}
