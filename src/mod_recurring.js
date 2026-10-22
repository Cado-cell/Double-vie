/* Deux Vies — module « Personnages récurrents » (id recurring)
   Quatre personnes qui reviennent dans la vie, chacune avec une histoire en plusieurs étapes et des choix qui comptent :
   le rival d'école, le meilleur ami d'enfance, le voisin pénible et l'ex qui revient. Ils vivent dans L.family
   (visage, relation) avec p.tag ('rival', 'bestie', 'voisin'). Ajoute aussi des rumeurs légères.
   État par vie : L.rec = {rival:{id,step,stance}, bestie:{id,step}, voisin:{id,step}, ex:{step,y}}, L.rumorAt. */
(()=>{
const MOD='recurring';
const st=L=>{if(!L.rec||typeof L.rec!=='object')L.rec={};return L.rec};
const live=(L,k)=>{const r=st(L)[k];const p=r&&r.id?byId(L,r.id):null;return p&&p.alive!==false?p:null};
const face=p=>{try{return avatar(p,{happy:60})}catch(e){return ''}};
const sx=(p,m,f)=>p.gender==='F'?f:m;
function newPerson(L,k,tag,age,rel,gender){
  const p=person(gender||pick(['H','F']),Math.max(3,age),null,L.country);
  p.type='friend';p.tag=tag;p.rel=rel;p.seen=L.age;L.family.push(p);
  const r=st(L)[k]||(st(L)[k]={});r.id=p.id;r.step=0;r.y=L.age;
  return p;
}
const mood=(L,d)=>chg(L,d);

/* ---------- Le rival d'école ---------- */
function arcRival(L){
  const rec=st(L);let r=rec.rival;
  if(!r){
    if(!(L.age>=8&&L.age<=12&&chance(.35)))return false;
    const p=newPerson(L,'rival','rival',L.age+R(-1,1),35);r=rec.rival;
    modal({title:'Un rival en classe',icon:'🥊',av:face(p),text:`${p.first}, ${sx(p,'le nouveau','la nouvelle')} de la classe, te toise : « Je suis meilleur${sx(p,'','e')} que toi en tout. »`,choices:[
      {t:'Relever le défi',fn:()=>{p.rel=25;r.stance='duel';mood(L,{smarts:1,happy:-1,discipline:1});r.step=1;return out(L,`🥊 Duel lancé avec ${p.first}. Tout est prétexte à comparer les notes.`)}},
      {t:'Proposer de réviser ensemble',fn:()=>{p.rel=62;r.stance='friend';mood(L,{happy:2});r.step=1;return out(L,`📚 Tu révises avec ${p.first}. Le courant passe mieux que prévu.`)}},
      {t:'L’ignorer',fn:()=>{p.rel=38;r.stance='ignore';r.step=1;return out(L,`🙄 Tu fais comme si ${p.first} n’existait pas. Pas facile quand on est assis à côté.`)}}]});
    return true;
  }
  const p=live(L,'rival');if(!p)return false;
  if(r.step===1&&L.age>=16&&L.age<=19&&chance(.5)){
    const mine=L.st.smarts*.6+((L.edu&&L.edu.grades)||50)*.4,his=(p.smarts??50)+R(-12,12),win=mine>=his;
    const sty=r.stance;
    const txt=`Les résultats tombent : ${win?`tu finis devant ${p.first}`:`${p.first} finit devant toi`}. `+(sty==='duel'?'Le duel de toute une scolarité se termine… pour l’instant.':sty==='friend'?'Vous aviez révisé ensemble, ça compte.':'Vous ne vous parliez presque pas, mais tout le monde a regardé.');
    r.step=2;
    modal({title:'Les résultats',icon:'📋',av:face(p),text:txt,choices:[
      {t:win?'Rester beau joueur':'Féliciter, la tête haute',fn:()=>{p.rel=clamp(p.rel+10);mood(L,{happy:win?4:1,karma:1});return out(L,`🤝 Tu serres la main de ${p.first}. ${sx(p,'Il','Elle')} ne s’y attendait pas.`)}},
      {t:win?'Lui rappeler ta victoire':'Dire que les notes sont truquées',fn:()=>{p.rel=clamp(p.rel-10);mood(L,{happy:win?3:-2,karma:-1});return out(L,`😏 ${p.first} serre les dents. La rivalité est relancée.`)}}]});
    return true;
  }
  if(r.step===2&&L.age>=24&&L.age<=40&&L.job&&!L.prison&&chance(.35)){
    r.step=3;
    modal({title:'Ton ancien rival',icon:'💼',av:face(p),text:`${p.first}, ton rival d’école, est en lice pour la même promotion que toi. Quelle coïncidence.`,choices:[
      {t:'Jouer franc jeu',fn:()=>{
        if(chance(((L.job.perf||50)+25)/130)){L.job.sal=Math.round((L.job.sal||0)*1.05);mood(L,{happy:3});p.rel=clamp(p.rel+3);return out(L,`💼 Tu l’emportes à la loyale, devant ${p.first}. Une revanche qui a le goût du café de la machine.`)}
        L.job.perf=clamp((L.job.perf||50)-3);mood(L,{happy:-2});return out(L,`💼 ${p.first} décroche la place. Tu lui serres la main sans le dire.`)}},
      p.rel>=35?{t:'Proposer de faire équipe',fn:()=>{p.rel=clamp(p.rel+12);L.job.perf=clamp((L.job.perf||50)+4);mood(L,{karma:2,happy:3});return out(L,`🤝 Vous présentez un projet à deux. Plus personne ne comprend comment vous êtes devenus alliés.`)}}:null,
      {t:'Un petit coup bas',danger:true,fn:()=>{mood(L,{karma:-3});
        if(chance(.55)){L.job.perf=clamp((L.job.perf||50)+8);p.rel=5;p.type='enemy';return out(L,`😈 Ça marche. ${p.first} ne t’adresse plus la parole, et tu dors très bien.`)}
        L.job.perf=clamp((L.job.perf||50)-8);mood(L,{happy:-4,stress:3});return out(L,'😳 Ça se sait. Les regards en réunion en disent long.')}}].filter(Boolean)});
    return true;
  }
  if(r.step===3&&L.age>=45&&chance(.4)){
    r.step=4;
    modal({title:'Réunion d’anciens élèves',icon:'🎓',av:face(p),text:`Retrouvailles de l’école. ${p.first} s’avance vers toi, un verre à la main. Trente ans ont passé, les notes n’ont plus d’importance.`,choices:[
      {t:'Tendre la main',fn:()=>{p.rel=clamp(p.rel+25);if(p.type==='enemy')p.type='friend';mood(L,{happy:3,karma:1});return out(L,`🥂 Vous trinquez à vos vieilles bagarres de cour de récré. ${p.first} est devenu${sx(p,'','e')} un${sx(p,'','e')} vrai${sx(p,'','e')} ami${sx(p,'','e')}.`)}},
      {t:'Rester distant',fn:()=>{p.rel=clamp(p.rel-3);return out(L,`🙂 Un hochement de tête, deux phrases polies. ${p.first} repart vers le buffet.`)}}]});
    return true;
  }
  return false;
}

/* ---------- Le meilleur ami d'enfance ---------- */
function arcBestie(L){
  const rec=st(L);let r=rec.bestie;
  if(!r){
    if(!(L.age>=6&&L.age<=9&&chance(.5)))return false;
    const p=newPerson(L,'bestie','bestie',L.age,88);r=rec.bestie;r.step=1;r.since=L.age;
    say(L,`🧒 À l’école, tu te lies d’amitié avec ${p.first}. Une de ces amitiés qui promettent de durer toute la vie.`);
    return true;
  }
  const p=live(L,'bestie');if(!p)return false;
  if(r.step===1&&L.age>=11&&L.age<=14&&chance(.5)){
    r.step=2;p.far=true;
    modal({title:'Un départ',icon:'📦',av:face(p),text:`${p.first}, ton meilleur ami d’enfance, t’annonce que sa famille déménage à l’autre bout du pays. Vous avez une semaine.`,choices:[
      {t:'Promettre de s’écrire chaque semaine',fn:()=>{p.rel=70;r.stance='lettres';mood(L,{happy:-2});return out(L,`✉️ Vous échangez vos adresses et un serment solennel. ${p.first} s’en va, le nez dans la vitre.`)}},
      {t:'Lui offrir ton objet préféré',fn:()=>{p.rel=80;r.stance='cadeau';mood(L,{happy:-3,karma:1});return out(L,`🎁 Tu donnes ton objet préféré à ${p.first}. Il sera gardé toute une vie.`)}},
      {t:'Faire comme si ça ne te touchait pas',fn:()=>{p.rel=55;r.stance='froid';return out(L,`😶 « C’est pas grave. » Tu y repenseras longtemps.`)}}]});
    return true;
  }
  if(r.step===2&&L.age>=17&&L.age<=24&&chance(.5)){
    r.step=3;
    modal({title:'Un message du passé',icon:'📱',av:face(p),text:`Un message s’affiche : « Salut, c’est ${p.first} ! Tu te souviens de moi ? » Dix ans de silence en une ligne.`,choices:[
      {t:'Répondre tout de suite',fn:()=>{p.rel=clamp(p.rel+22);p.seen=L.age;p.far=false;mood(L,{happy:4});return out(L,`📱 Vous parlez jusqu’à l’aube. Rien n’a changé, tout a changé, c’est parfait.`)}},
      {t:'Mettre un petit pouce',fn:()=>{p.rel=clamp(p.rel+5);return out(L,`👍 Un pouce, un cœur, et la vie reprend son cours. Dommage.`)}},
      {t:'Ne pas répondre',fn:()=>{p.rel=clamp(p.rel-20);mood(L,{happy:-1});return out(L,`📵 Tu laisses le message sans réponse. Il y a des fantômes qu’on préfère laisser dormir.`)}}]});
    return true;
  }
  if(r.step===3&&L.age>=25&&L.age<=40&&chance(.45)){
    r.step=4;
    if(p.rel<40){say(L,`📭 Tu apprends par un ami commun que ${p.first} s’est marié${sx(p,'','e')}. Vous vous êtes perdus de vue, c’est comme ça.`);return true}
    modal({title:'Témoin de mariage',icon:'💒',av:face(p),text:`${p.first} se marie et te demande d’être ${sx(p,'son témoin','sa témoin')}. « Qui d’autre ? », dit-${sx(p,'il','elle')}.`,choices:[
      {t:L.money>=300?'Accepter avec joie (cadeau : 300 €)':'Accepter avec joie',fn:()=>{if(L.money>=300)spend(L,300);p.rel=clamp(p.rel+12);p.seen=L.age;mood(L,{happy:5,karma:1});return out(L,`💒 Ton discours fait pleurer toute la salle, y compris le DJ.`)}},
      {t:'Accepter, sans cadeau',fn:()=>{p.rel=clamp(p.rel+4);p.seen=L.age;mood(L,{happy:2});return out(L,`💒 Tu es là, c’est l’essentiel. Le cadeau suivra, peut-être.`)}},
      {t:'Décliner poliment',fn:()=>{p.rel=clamp(p.rel-20);mood(L,{happy:-3});return out(L,`😔 ${p.first} cache sa déception. Un « pas de souci » qui pèse une tonne.`)}}]});
    return true;
  }
  if(r.step===4&&L.age>=55&&L.age<=78&&chance(.3)){
    r.step=5;const n=Math.max(1,L.age-(r.since||7));
    modal({title:'Des décennies d’amitié',icon:'🥂',av:face(p),text:`${p.first} t’appelle : « Cela fait ${n} ans qu’on se connaît. On ne va pas laisser passer ça. »`,choices:[
      {t:'Faire le voyage pour le retrouver',fn:()=>{if(L.money>=400)spend(L,400);p.rel=95;p.seen=L.age;mood(L,{happy:8});return out(L,`🥂 Vous trinquez dans la même cuisine qu’à dix ans. L’adresse est restée, les rides aussi.`)}},
      {t:'Un long appel vidéo',fn:()=>{p.rel=clamp(p.rel+5);p.seen=L.age;mood(L,{happy:3});return out(L,`📞 Trois heures de souvenirs. Les petits-enfants demandent de qui vous parlez.`)}}]});
    return true;
  }
  return false;
}

/* ---------- Le voisin pénible ---------- */
const SOUCIS=['du bruit qui passe à travers le plancher','des poubelles qui ne sont pas sorties le bon jour','de ton paillasson qui dépasse de trois centimètres','d’une place de parking « qui lui appartient depuis 1987 »','de la musique du samedi soir','de ton vélo dans le couloir'];
function arcVoisin(L){
  const rec=st(L);let r=rec.voisin;
  if(!r){
    if(!(L.age>=22&&!(L.withParents&&parentsAlive(L))&&chance(.25)))return false;
    const p=newPerson(L,'voisin','voisin',R(48,72),40);r=rec.voisin;
    modal({title:'Le voisin',icon:'🚪',av:face(p),text:`${p.first}, ${sx(p,'ton voisin','ta voisine')} du dessus, sonne à ta porte à neuf heures du soir : « Je voulais juste vous dire que j’entends tout. »`,choices:[
      {t:'S’excuser poliment',fn:()=>{p.rel=55;r.stance='poli';r.step=1;r.y=L.age;mood(L,{stress:-1});return out(L,`🙏 Tu t’excuses et tu promets de baisser le son. ${p.first} repart presque souriant${sx(p,'','e')}.`)}},
      {t:'Lui répondre sèchement',fn:()=>{p.rel=20;r.stance='sec';r.step=1;r.y=L.age;mood(L,{stress:2});return out(L,`😤 La porte claque. ${p.first} note la date dans un petit carnet.`)}},
      {t:'Lui offrir un gâteau',fn:()=>{spend(L,10);p.rel=70;r.stance='gateau';r.step=1;r.y=L.age;mood(L,{happy:1,karma:1});return out(L,`🍰 Un gâteau, quelques mots gentils. ${p.first} n’en revient pas.`)}}]});
    return true;
  }
  const p=live(L,'voisin');if(!p)return false;
  if(r.step===1&&L.age-r.y>=2&&chance(.4)){
    r.step=2;r.y=L.age;
    modal({title:'Encore le voisin',icon:'🙄',av:face(p),text:`${p.first} se plaint ${pick(SOUCIS)}. Il y a décidément toujours quelque chose.`,choices:[
      {t:'En discuter calmement',fn:()=>{p.rel=clamp(p.rel+8);mood(L,{stress:-1});return out(L,`☕ Autour d’un café, le malentendu s’éclaircit. ${p.first} est moins redoutable en pantoufles.`)}},
      {t:'Contre-attaquer',fn:()=>{p.rel=clamp(p.rel-10);mood(L,{stress:2});return out(L,`📣 Les échanges sont vifs, l’escalier a tout entendu.`)}},
      {t:'Faire semblant de ne pas être là',fn:()=>{p.rel=clamp(p.rel-3);return out(L,`🤫 Tu retiens ta respiration jusqu’à ce que les pas s’éloignent.`)}}]});
    return true;
  }
  if(r.step===2&&L.age-r.y>=3&&chance(.4)){
    r.step=3;
    if(p.rel>=55){mood(L,{happy:3});p.rel=clamp(p.rel+10);say(L,`🥧 ${p.first} garde ton courrier pendant tes vacances et dépose une tarte sur ton paillasson. Qui aurait cru ça ?`);return true}
    if(p.rel>=30){say(L,`👋 Vous vous saluez maintenant d’un signe de tête dans l’escalier. C’est déjà beaucoup.`);return true}
    modal({title:'Les rumeurs de l’immeuble',icon:'🗣️',av:face(p),text:`Tu apprends que ${p.first} raconte des choses sur toi dans tout l’immeuble. Il paraît même qu’il y a une pétition.`,choices:[
      {t:'Frapper à sa porte pour discuter',fn:()=>{if(chance(.5)){p.rel=clamp(p.rel+25);mood(L,{happy:2});return out(L,`🕊️ ${p.first} ouvre, surpris${sx(p,'','e')}. Vous vous expliquez. La pétition finit à la poubelle.`)}p.rel=clamp(p.rel-5);mood(L,{stress:2});return out(L,`🚪 ${p.first} ne t’ouvre pas. Les rumeurs continuent de plus belle.`)}},
      {t:'Laisser dire',fn:()=>{mood(L,{happy:-3});return out(L,`🙃 Tu laisses courir. Un jour ou l’autre, quelqu’un d’autre sera la nouvelle victime.`)}}]});
    return true;
  }
  return false;
}

/* ---------- L'ex qui revient ---------- */
function arcEx(L){
  const rec=st(L);const r=rec.ex||(rec.ex={step:0,y:0});
  if(r.step>=2||L.age<21)return false;
  const exes=L.family.filter(p=>p.type==='ex'&&p.alive!==false&&p.age>=18);
  if(!exes.length)return false;
  if(r.step===0&&chance(.1)){
    const p=pick(exes);r.step=1;r.y=L.age;r.id=p.id;
    modal({title:'Un message à 2 h du matin',icon:'🌙',av:face(p),text:`Ton ex, ${p.first}, t’écrit : « Tu dors ? » Évidemment que non.`,choices:[
      {t:'Répondre',fn:()=>{
        if(L.partner){partnerRel(L,-12);mood(L,{stress:2});p.rel=clamp(p.rel+10);return out(L,`🌙 Tu réponds. Ton partenaire a le sommeil léger… et la mémoire longue.`)}
        if(chance(.5)){p.rel=clamp(p.rel+25);mood(L,{happy:4});return out(L,`☕ Vous prenez un café. Les bons souvenirs reviennent, les mauvais restent poliment à la porte.`)}
        mood(L,{happy:-1});return out(L,`☕ Un café, et vous vous rappelez très précisément pourquoi vous vous êtes quittés.`)}},
      {t:'Ignorer',fn:()=>{p.rel=clamp(p.rel-3);return out(L,`🙈 Tu lis, tu ne réponds pas. L’écran s’éteint, l’histoire aussi.`)}},
      {t:'Bloquer le numéro',fn:()=>{p.rel=clamp(p.rel-10);mood(L,{happy:1});return out(L,`🚫 Numéro bloqué. Un petit silence plein de paix.`)}}]});
    return true;
  }
  if(r.step===1&&L.age-r.y>=6&&chance(.3)){
    r.step=2;const p=byId(L,r.id)||pick(exes);
    say(L,`💌 ${p.first}, ton ex, t’envoie un faire-part : ${sx(p,'il','elle')} ${pick(['se marie','vient d’avoir un bébé','ouvre sa propre boutique'])}. Tu réponds par un message gentil et un peu pincé.`);
    mood(L,{happy:1});return true;
  }
  return false;
}

/* ---------- Rumeurs ---------- */
const RUMEURS=['pense à déménager','a repris des études','s’est mis${g} au yoga','cherche un nouveau travail','a adopté un chat','prépare une surprise pour son anniversaire','n’a pas été vu${g} depuis deux semaines (en vacances, paraît-il)'];
function rumor(L){
  if(L.age<12||L.prison)return;
  if(L.rumorAt!=null&&L.age-L.rumorAt<2)return;
  if(!chance(.22))return;
  L.rumorAt=L.age;
  const t=L.tr||{};
  const k=pick(['moi','autre','autre']);
  if(k==='moi'){
    if((t.crimes||0)>=3&&!L.prison){say(L,'🗣️ Une rumeur court sur toi : on dit que tu as des ennuis avec la loi. Les regards changent un peu.');chg(L,{happy:-1});return}
    if((L.hid&&L.hid.karma>=65)){say(L,'🗣️ On parle de toi comme de quelqu’un de généreux. Ça fait du bien de l’entendre.');chg(L,{happy:1});return}
    if(L.money>=500000){say(L,'🗣️ Il paraît que tu roules sur l’or. Les cousins éloignés appellent soudain beaucoup plus souvent.');return}
  }
  const pool=L.family.filter(p=>p.alive!==false&&p.type!=='pet'&&p.age>=10&&p.type!=='ex');
  if(!pool.length)return;
  const p=pick(pool),g=p.gender==='F'?'e':'';
  say(L,`🗣️ On raconte que ${p.first} ${pick(RUMEURS).replace(/\$\{g\}/g,g)}.`);
}

function year(L){
  if(!L||L.age<6||L.alive===false||L.prison)return;
  const arcs=shuffle([arcRival,arcBestie,arcVoisin,arcEx]);
  for(const f of arcs){try{if(f(L))break}catch(e){console.error('recurring',e)}}
  try{rumor(L)}catch(e){console.error('recurring.rumor',e)}
}
registerMod({id:MOD,born(L){if(L)L.rec={}},heirInit(D,L){if(L)L.rec={}},year});
})();
