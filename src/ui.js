/* Deux Vies — interface */

/* ---------- Modale et toast ---------- */
let MQ=[],curM=null,inChoice=false;
const busy=()=>!!curM||MQ.length>0;
function modal(m){if(inChoice)MQ.unshift(m);else MQ.push(m);if(!curM&&!inChoice)nextModal()}
/* Visage de la personne dont parle un évènement (famille, conjoint, patron, amis, inconnus). */
const FACE_RULES=[[/\b(ta mère|ta maman|maman)\b/i,L=>{const p=parents(L);return p.find(x=>x.gender==='F')||p[0]}],[/\b(ton père|ton papa|papa)\b/i,L=>{const p=parents(L);return p.find(x=>x.gender==='H')||p[0]}],
  [/\b(grand-mère|mamie|mémé|grand-père|papi|papy|grands-parents)\b/i,(L,t)=>{const g=L.family.filter(x=>x.type==='grand'&&x.alive);return g.find(x=>x.gender===(/grand-père|papi|papy/i.test(t)?'H':'F'))||g[0]}],
  [/\b(ton frère|ta sœur|ta soeur|petit frère|petite sœur|grand frère|grande sœur)\b/i,(L,t)=>{const g=L.family.filter(x=>x.type==='sibling'&&x.alive);return g.find(x=>x.gender===(/frère/i.test(t)?'H':'F'))||g[0]}],
  [/\b(ta fille|ton fils|ton enfant|tes enfants|ton bébé|ta petite fille|ton petit-fils)\b/i,L=>{const k=L.family.filter(x=>(x.type==='child'||x.type==='grandkid')&&x.alive);return k[Math.floor(Math.random()*k.length)]}],
  [/\b(ton conjoint|ta conjointe|ton mari|ta femme|ton épouse|ton partenaire|ta partenaire|ta moitié|ton amoureux|ton amoureuse|ton petit ami|ta petite amie|ton fiancé|ta fiancée)\b/i,L=>L.partner?partnerOf(L):null],
  [/\b(ton patron|ta patronne|ton chef|ta cheffe|ton supérieur|ta supérieure|ton employeur)\b/i,L=>bossOf(L)],
  [/\b(ton ami|ton amie|ton meilleur ami|ta meilleure amie|ton pote|ton copain|ta copine|tes amis|un ami|une amie|un copain)\b/i,L=>{const f=friends(L);return f[Math.floor(Math.random()*f.length)]}]];
const STRANGER_RE=/\b(ton voisin|ta voisine|un inconnu|une inconnue|un homme|une femme|un type|une dame|un vieil homme|une vieille dame|un collègue|une collègue|ton collègue|ta collègue|ton professeur|ta professeure|ton prof|ta prof|un client|une cliente|un vendeur|une vendeuse|un policier|une policière|un médecin|une médecin|un inconnu)\b/i;
function modalFace(m){
  if(!G||!G.players)return '';const L=cur();if(!L)return '';
  const t=String(m.text||String(m.html||'').replace(/<[^>]+>/g,' ')||'');
  for(const [re,fn] of FACE_RULES){if(re.test(t)){const p=fn(L,t);if(p&&p.look)return avatar(p,{happy:60})}}
  const mm=t.match(STRANGER_RE);
  if(mm){const g=/(voisine|inconnue|femme|dame|collègue|professeure|prof\b|cliente|vendeuse|policière|médecin)/i.test(mm[0])&&!/ton collègue|un collègue|ton prof\b|ton professeur|un homme|un type|un vieil homme|un inconnu|ton voisin/i.test(mm[0])?'F':'H';
    const age=/vieil|vieille/i.test(mm[0])?72:Math.max(20,Math.min(60,L.age+Math.floor(Math.random()*17)-8));
    return avatar({look:AVATAR_R.random(g),gender:g,age,alive:true,rel:60},{happy:60})}
  return '';
}
function nextModal(){
  curM=MQ.shift()||null;const el=$('#modal');
  if(!curM){el.hidden=true;render();return}
  try{FX.modal()}catch(e){}
  $('#mbox').style.setProperty('--pc',`var(--p${(curM.pc!=null?curM.pc:G?G.turn:0)+1})`);
  {const mi=$('#micon');let face='';try{face=curM.av!==undefined?curM.av:modalFace(curM)}catch(e){console.error(e)}
   mi.classList.toggle('av',!!face);mi.innerHTML=face||(curM.icon?(ico(curM.icon)||esc(curM.icon)):'');mi.hidden=!(face||curM.icon)}
  $('#mtitle').textContent=curM.title||'';
  const tx=$('#mtext');tx.onclick=null;if(curM.html)tx.innerHTML=curM.html;else tx.textContent=curM.text||'';
  const ch=curM.choices||(curM.mount?[]:[{t:'Continuer'}]);
  $('#mch').innerHTML=ch.map((c,i)=>`<button type="button" class="btn${c.pri||ch.length===1?' pri':''}${c.danger?' danger':''}" data-m="${i}">${esc(c.t)}</button>`).join('');
  el.hidden=false;
  if(curM.mount)curM.mount(tx);
  render();
  const f=$('#mch button');if(f)f.focus({preventScroll:true});
}
function chooseM(i){
  const m=curM;if(!m)return;const ch=m.choices||[{t:'Continuer'}];const c=ch[i];if(!c)return;
  curM=null;let r;inChoice=true;
  try{r=c.fn?c.fn():null}catch(e){console.error(e)}
  inChoice=false;
  if(typeof r==='string'&&r)toast(r);
  save();nextModal();
}
function endModal(r){if(!curM)return;curM=null;if(typeof r==='string'&&r)toast(r);save();nextModal()}
let tT;
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;el.style.animation='none';void el.offsetWidth;el.style.animation='';clearTimeout(tT);tT=setTimeout(()=>{el.hidden=true},3800)}

/* ---------- Panneaux ---------- */
let ACTS=[],STACK=[],lastTop=null;
const A=fn=>{if(!fn)return -1;ACTS.push(fn);return ACTS.length-1};
function openPanel(f){STACK=[f];lastTop=null;showSheet()}
function pushPanel(f){STACK.push(f);showSheet()}
function back(){STACK.pop();STACK.length?showSheet():closeSheet()}
function closeSheet(){STACK=[];lastTop=null;$('#sheet').hidden=true}
const RECENTS={};
function trackRecent(f,title){
  if(!G||!title||STACK[0]!==pAct||STACK.length<3)return;
  const R=RECENTS[G.turn]||(RECENTS[G.turn]=[]),i=R.findIndex(x=>x.t===title);if(i>=0)R.splice(i,1);
  R.unshift({t:title,f,ic:'🕘'});RECENTS[G.turn]=R.slice(0,3);
}
function showSheet(){
  const f=STACK[STACK.length-1];if(!f||!G){closeSheet();return}
  let r;try{r=f()}catch(e){console.error(e);r={title:'Oups',html:note('Ce panneau a rencontré un problème.')}}
  const b=$('#pbody');const keep=lastTop===f?b.scrollTop:0;
  trackRecent(f,r.title);
  $('#ptitle').textContent=r.title;b.innerHTML=r.html;$('#pback').hidden=STACK.length<2;$('#sheet').hidden=false;
  if(r.after)r.after(b);b.scrollTop=keep;lastTop=f;
}
function run(fn){let r;try{r=fn()}catch(e){console.error(e)}if(G&&G.players){const L=cur();if(L)track(L,'actions')}if(typeof r==='string'&&r)toast(r);if(G){save();checkChallenges(cur())}render()}
const tone=v=>v>=67?'':v>=34?' w':' b';
function bar(v){return `<span class="bar${tone(v)}"><i style="width:${clamp(v)}%"></i></span>`}
function mini(v){return `<span class="mini${tone(v)}" title="Relation ${v} %"><i style="width:${clamp(v)}%"></i></span>`}
function statLine(n,v){return `<div class="stat"><b>${esc(n)}</b><span class="n">${clamp(v)} %</span>${bar(v)}</div>`}
function card(k,v,s,extra){return `<div class="card">${k?`<div class="ck">${esc(k)}</div>`:''}${v?`<div class="cv">${esc(v)}</div>`:''}${s?`<div class="cs">${esc(s)}</div>`:''}${extra||''}</div>`}
const EMO_RE=/^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u20E3|\p{Emoji_Modifier}|\u200D(?:\p{Extended_Pictographic}))*)\s*/u;
function hueOf(k){let h=0;for(const ch of String(k))h=(h*31+ch.codePointAt(0))>>>0;return 1+h%7}
/* Style des icônes : emoji en couleur (par défaut) ou icônes au trait. */
const ICMODE={mode:(()=>{try{return localStorage.getItem('dv.icons')==='line'?'line':'emoji'}catch(e){return 'emoji'}})()};
try{document.documentElement.dataset.icons=ICMODE.mode}catch(e){}
const ico=k=>(ICMODE.mode==='emoji'?null:(k&&typeof iconSvg==='function'&&iconSvg(k)))||null;
function toggleIcons(){ICMODE.mode=ICMODE.mode==='emoji'?'line':'emoji';try{localStorage.setItem('dv.icons',ICMODE.mode)}catch(e){}document.documentElement.dataset.icons=ICMODE.mode;render()}
function icTile(ic){if(!ic)return '';const s=ico(ic);return s?`<span class="ic h${hueOf(ic)}">${s}</span>`:`<span class="ic e h${hueOf(ic)}">${ic}</span>`}
function emoSplit(t){const m=String(t).match(EMO_RE);return m?[m[1],String(t).slice(m[0].length)]:[null,String(t)]}
function emoInline(t){const [e,r]=emoSplit(t);if(!e)return esc(r);const s=ico(e);return (s||esc(e))+' '+esc(r)}
function row(o){const ic=o.av?`<span class="ic av">${o.av}</span>`:icTile(o.ic);return `<button type="button" class="row${o.danger?' danger':''}"${o.lock?' data-lock="1"':''} ${o.dis?'disabled':''} data-a="${o.dis?-1:A(o.a)}">${ic}<span class="rt"><b>${esc(o.t)}</b>${o.s?`<small>${esc(o.s)}</small>`:''}</span>${o.right==='›'?'<span class="rr chev">›</span>':o.right?`<span class="rr">${o.right}</span>`:''}</button>`}
function act(L,o){
  let s=o.s||'',dis=false;
  let lock=false;
  if(o.min&&L.age<o.min){s=`Dès ${o.min} ans`;dis=true;lock=true}
  else if(o.key&&L.used[o.key]){s='Déjà fait cette année';dis=true}
  else if(o.dis){s=o.dis;dis=true}
  else if(o.cost&&L.money<o.cost){s=`${fmt(o.cost)} · fonds insuffisants`;dis=true}
  const a=o.nav?()=>pushPanel(o.nav):()=>run(()=>{if(o.key){L.used[o.key]=1;track(L,'k_'+o.key)}if(o.cost)L.money-=o.cost;return o.fn(L)});
  return row({ic:o.ic,av:o.av,t:o.t,s,dis,a,right:o.nav?'›':o.right||'',danger:o.danger,lock});
}
const nav=(ic,t,s,f,dis)=>row({ic,t,s,right:'›',a:()=>pushPanel(f),dis});
function tile(o){const ic=o.av?`<span class="ic av">${o.av}</span>`:icTile(o.ic);return `<button type="button" class="tile" ${o.dis?'disabled':''} data-a="${o.dis?-1:A(o.a)}">${ic}<span><b>${esc(o.t)}</b>${o.s?`<small>${esc(o.s)}</small>`:''}</span></button>`}
const tiles=list=>{list=list.filter(Boolean);return list.length?`<div class="tiles">${list.join('')}</div>`:''};
const ntile=(ic,t,s,f,dis)=>tile({ic,t,s,a:()=>pushPanel(f),dis});
/* Les actions réservées à un âge qu'on n'a pas encore sont masquées : une seule ligne rappelle qu'elles existent. */
function group(t,rows){rows=rows.filter(Boolean);if(!rows.length)return '';
  const keep=rows.filter(r=>!/data-lock="1"/.test(r)),n=rows.length-keep.length;
  const note=n?`<p class="lockn">🔒 ${n} ${n>1?'actions se débloquent':'action se débloque'} en grandissant</p>`:'';
  const head=t?`<h3 class="sec">${esc(t)}</h3>`:'';
  return keep.length?`${head}<div class="list">${keep.join('')}</div>${note}`:(note?`${head}${note}`:'');
}
const note=t=>`<p class="note">${esc(t)}</p>`;
/* Aide ponctuelle : une seule fois par appareil, au premier passage dans un écran, fermable d’une touche.
   Masquée pendant les tests automatiques (sauf si window.__forceHints est posé). */
function hintsSeen(){try{return JSON.parse(localStorage.getItem('dv.hints')||'{}')}catch(e){return {}}}
function hint(key,text,icon){
  if(typeof navigator!=='undefined'&&navigator.webdriver&&!window.__forceHints)return '';
  if(hintsSeen()[key])return '';
  return `<button type="button" class="hint" data-a="${A(()=>{try{const o=hintsSeen();o[key]=1;localStorage.setItem('dv.hints',JSON.stringify(o))}catch(e){}render()})}"><span class="hi">${icon||'💡'}</span><span class="ht">${esc(text)}</span><b>OK</b></button>`;
}
function confirmP(title,text,fn,label){return ()=>({title,html:note(text)+group('',[row({ic:'⚠️',t:label||'Confirmer',danger:1,a:()=>{STACK.pop();run(fn)}}),row({ic:'↩️',t:'Annuler',a:back})])})}

/* ---------- Avatars ---------- */
const PET_IC={'Chien':'🐶','Chat':'🐱','Lapin':'🐰','Hamster':'🐹','Cochon d’Inde':'🐹','Perroquet':'🦜','Tortue':'🐢','Furet':'🦦','Cheval':'🐴','Serpent':'🐍','Poisson rouge':'🐟','Chèvre naine':'🐐'};
function avatar(p,o={}){
  if(!p)return '';
  if(p.type==='pet')return `<span class="pet">${PET_IC[p.species]||'🐾'}</span>`;
  let svg='';
  try{svg=AVATAR_R.render(p.look,{age:p.age||0,gender:p.gender,mood:o.happy!=null?o.happy:(p.rel!=null?p.rel:62),dead:p.alive===false,crown:!!o.crown,glasses:!!o.glasses})}catch(e){console.error(e)}
  return `<span class="avw${p.alive===false?' dead':''}">${svg}</span>`;
}
/* ---------- Éditeur d’apparence ---------- */
const LOOK_OPTS={hair:[['court','Court'],['rase','Rasé'],['meche','Mèche'],['undercut','Undercut'],['pixie','Pixie'],['boucle','Bouclé'],['afro','Afro'],['milong','Mi-long'],['ondule','Ondulé'],['long','Long'],['frange','Frange'],['carre','Carré'],['queue','Queue'],['chignon','Chignon'],['manbun','Chignon homme'],['tresses','Tresses'],['locs','Locks'],['crete','Crête'],['degarni','Dégarni'],['chauve','Chauve']],
  face:[['ovale','Ovale'],['rond','Rond'],['carre','Carré'],['long','Allongé'],['coeur','En cœur']],
  nose:[['droit','Droit'],['fin','Fin'],['large','Large'],['retrousse','Retroussé'],['aquilin','Aquilin']],
  lips:[['fines','Fines'],['moyennes','Moyennes'],['pleines','Pleines']],
  makeup:[['aucun','Aucun'],['naturel','Naturel'],['rouge','Rouge à lèvres'],['rose','Rose'],['prune','Prune'],['smoky','Smoky']],
  mark:[['aucune','Aucune'],['grain','Grain de beauté'],['cicatrice','Cicatrice'],['acne','Acné']],
  eyes:[['ronds','Ronds'],['amande','En amande'],['rieurs','Rieurs'],['miclos','Mi-clos']],brows:[['naturels','Naturels'],['arques','Arqués'],['epais','Épais'],['fins','Fins']],
  beard:[['aucune','Aucune'],['barbe3j','3 jours'],['barbe','Barbe'],['barbelongue','Barbe longue'],['bouc','Bouc'],['goatee','Bouc et moustache'],['moustache','Moustache'],['collier','Collier'],['favoris','Favoris']],
  glasses:[['aucune','Aucunes'],['rondes','Rondes'],['carrees','Carrées'],['demi','Demi-cerclées'],['aviateur','Aviateur'],['chat','Œil de chat'],['solaires','Solaires']],
  acc:[['aucun','Aucun'],['boucles','Boucles'],['piercing','Piercing'],['casquette','Casquette'],['bonnet','Bonnet'],['chapeau','Chapeau'],['bandana','Bandana'],['voile','Voile'],['bandeau','Bandeau'],['fleur','Fleur']],
  top:[['tshirt','T-shirt'],['polo','Polo'],['sweat','Sweat'],['chemise','Chemise'],['veste','Veste'],['costume','Costume'],['robe','Robe'],['debardeur','Débardeur'],['pull','Pull'],['blouse','Blouse']]};
function normLook(l,g){
  const base=AVATAR_R.random(g);l=l||{};const out=Object.assign({},base);
  if(typeof l.hair==='number'||l.shirt!=null){out.skin=Math.min(7,Math.round((l.skin||0)*7/5));out.hc=[0,1,2,4,5,7][l.hc]??base.hc;out.eye=[0,3,2,1][l.eye]??base.eye;out.topc=(l.shirt||0)%10;return out}
  for(const k in base)if(l[k]!==undefined&&l[k]!==null)out[k]=l[k];return out;
}
const LED={};
function ledOpen(id,look,ctx){LED[id]={look:normLook(look,ctx.gender),ctx}}
function ledInner(id){
  const S=LED[id];if(!S)return '';const {look,ctx}=S,A=AVATAR_R;const ma=Math.max(ctx.age||0,24);
  const big=A.render(look,{age:ctx.age,gender:ctx.gender,mood:85});
  const sw=(k,cols)=>`<div class="sw">${cols.map((c,i)=>`<button type="button" class="${look[k]===i?'on':''}" style="--c:${c}" data-lk="${k}|${i}|n" aria-label="Couleur ${i+1}"></button>`).join('')}</div>`;
  const opts=(k,mini)=>`<div class="${mini?'opts':'chips'}">${LOOK_OPTS[k].map(([v,n])=>`<button type="button" class="${look[k]===v?'on':''}" data-lk="${k}|${v}|s">${mini?`<span class="mav">${A.render(Object.assign({},look,{[k]:v}),{age:ma,gender:ctx.gender,mood:70})}</span>`:''}${esc(n)}</button>`).join('')}</div>`;
  const sec=(t,b)=>`<div class="led-sec"><h4>${t}</h4>${b}</div>`;
  return `<div class="led-top"><div class="led-prev">${big}</div><div class="led-acts"><button type="button" class="btn" data-led-rand="${id}">Style aléatoire</button><button type="button" class="btn" data-lk="freckles|1|b">${look.freckles?'Retirer':'Ajouter'} les taches de rousseur</button></div></div>`
    +sec('Peau',sw('skin',A.SKINS))+sec('Forme du visage',opts('face',1))+sec('Coiffure',opts('hair',1))+sec('Couleur des cheveux',sw('hc',A.HAIR_COLORS))
    +sec('Yeux',sw('eye',A.EYE_COLORS)+'<div style="height:10px"></div>'+opts('eyes'))+sec('Sourcils',opts('brows'))
    +sec('Nez',opts('nose'))+sec('Lèvres',opts('lips'))+sec('Maquillage',opts('makeup'))+sec('Particularités',opts('mark'))
    +(ma>=16?sec('Pilosité',opts('beard',1)):'')+sec('Lunettes',opts('glasses',1))+sec('Accessoire',opts('acc',1))
    +sec('Tenue',opts('top',1)+'<div style="height:10px"></div>'+sw('topc',A.TOP_COLORS))+sec('Fond du portrait',sw('bg',A.BG_COLORS));
}
function ledRefresh(id){const box=document.querySelector(`[data-led="${id}"]`);if(box)box.innerHTML=ledInner(id);const s=document.getElementById(id+'-sav');if(s&&LED[id])s.innerHTML=AVATAR_R.render(LED[id].look,{age:24,gender:LED[id].ctx.gender,mood:85})}
function pLook(tid){return ()=>{
  const L=cur();const p=tid==='self'?L:byId(L,tid);if(!p||p.type==='pet')return {title:'Apparence',html:note('Impossible de modifier cette apparence.')};
  const id='g_'+String(tid).replace(/\W/g,'_');if(!LED[id]||LED[id].pid!==p.id){ledOpen(id,p.look,{age:p.age,gender:p.gender});LED[id].pid=p.id}
  return {title:tid==='self'?'Ton apparence':`Apparence de ${p.first}`,html:note('Touche une option pour la voir aussitôt sur le portrait. Rien n’est appliqué avant d’enregistrer.')+`<div class="led" data-led="${id}">${ledInner(id)}</div>`+group('',[row({ic:'✅',t:'Enregistrer ce style',a:()=>{p.look=Object.assign({},LED[id].look);delete LED[id];STACK.pop();run(()=>tid==='self'?'Nouveau style enregistré.':`${p.first} a changé de style.`)}}),row({ic:'↩️',t:'Annuler',a:()=>{delete LED[id];back()}})])};
}}
const avOf=(p,L)=>avatar(p,L?{happy:L.st.happy,glasses:L.flags.glasses,crown:L.royal&&L.royal.throne}:{happy:p.rel});

/* ---------- Écran principal ---------- */
function obitHtml(L){
  const ks=kids(L);const rb=RIBBONS.find(r=>r.k===L.ribbon)||RIBBONS[RIBBONS.length-1];const ages=snapAges(L).slice(-6).reverse();
  return `<div class="obit"><div class="obav">${avatar(L,{happy:50})}</div><div class="ok">Repose en paix</div><h2>${esc(L.first)} ${esc(L.last)}</h2><p>${L.age} ans · ${esc(L.cause||'')}</p>
  <div class="ribbon"><span>${rb.ic}</span><div><b>Ruban : ${esc(rb.n)}</b><small>${esc(rb.d)}</small></div></div>
  <p class="epi">« ${esc(lifeEpitaph(L))} »</p><p class="prov">${esc(lifeProverb(L))}<br><small>${esc(lifeFact(L))}</small><br><small>Score de vie : <b>${lifeScore(L)} / 100</b></small></p>${(()=>{const a=lifeAwards(L);return a.length?`<div class="awards">${a.map(x=>`<span class="award" title="${esc(x.d)}">${emoInline(x.ic+' '+x.n)}</span>`).join('')}</div>`:''})()}
  <dl><div><dt>Patrimoine</dt><dd>${fmt(netWorth(L))}</dd></div><div><dt>Dernier métier</dt><dd>${esc(jobLabel(L))}</dd></div><div><dt>Enfants</dt><dd>${allKids(L).length}</dd></div><div><dt>Génération</dt><dd>${L.gen}</dd></div></dl>
  <div class="list">${row({ic:'📤',t:'Partager mon bilan',s:'Une image à envoyer à ta moitié',a:()=>shareLife(L,'share')})}${row({ic:'💾',t:'Enregistrer l’image',s:'Dans ta galerie',a:()=>shareLife(L,'save')})}${typeof duoPanel==='function'?row({ic:'💞',t:'Comparer avec ta moitié',s:'Échange de codes',a:()=>pushPanel(duoPanel)}):''}${ks.map(k=>row({av:avatar(k),t:`Continuer en tant que ${k.first}`,s:`${role(k)} · ${An(k.age)}${L.will.heir&&L.will.heir!==k.id?' · non désigné héritier':' · hérite de ta fortune'}`,right:'›',a:()=>{continueAs(G.turn,k.id);save();render()}})).join('')}
  ${ages.length?row({ic:'⏳',t:'Remonter le temps',s:`Revenir à ${An(ages[0])} ou avant`,right:'›',a:()=>openPanel(pTime)}):''}
  ${row({ic:'🌱',t:'Commencer une nouvelle vie',s:'Nouveau prénom, nouveau départ',right:'›',a:()=>openPanel(pNewLife(G.turn))})}</div></div>`;
}
function badges(L){const b=[`${L.zodiac}`];if(L.royal&&!L.royal.exiled)b.push('👑 '+(L.royal.throne?'Souverain':'Royal'));if(L.fame>=20)b.push(`⭐ ${L.fame} %`);if(L.prison)b.push(`🔒 ${An(L.prison)}`);if(L.ill.length)b.push('🤒 '+L.ill.length);if(L.social.verified)b.push('✔️');for(const x of modCall('badges',L))b.push(...[].concat(x));return b.map(x=>`<span class="bdg">${emoInline(x)}</span>`).join('')}
function logLine(x){const [e,r]=emoSplit(x);if(!e)return `<p><span class="le">·</span><span>${esc(r)}</span></p>`;const s=ico(e);return `<p>${s?`<span class="li h${hueOf(e)}">${s}</span>`:`<span class="le">${esc(e)}</span>`}<span>${esc(r)}</span></p>`}
/* Idées rapides : jusqu'à 3 raccourcis d'après la situation, à une touche de l'écran principal. */
function quickActs(L){
  if(!L.alive||L.prison||!G)return [];
  const q=actPick(L,actItems(L)).map(([i])=>({ic:i[1],t:i[2],f:i[4]}));
  if(inSchool(L)){if(!q.some(x=>x.f===pWork))q.unshift({ic:'📚',t:'Études',f:pWork})}
  else if(L.age>=16&&L.age<65&&!L.job&&!q.some(x=>x.f===pWork))q.unshift({ic:'💼',t:'Emploi',f:pWork});
  return q.slice(0,3);
}
function renderMain(){
  const app=$('#app'),su=$('#setup');
  if(!G){app.hidden=true;if(su.hidden){buildSetup();su.hidden=false}return}
  su.hidden=true;app.hidden=false;
  const L=cur();const rs=document.documentElement.style;rs.setProperty('--pc',`var(--p${G.turn+1})`);rs.setProperty('--pc-2',`var(--p${G.turn+1}-2)`);
  $('#players').innerHTML=G.mode===2?G.players.map((p,i)=>`<span class="chip${i===G.turn?' on':''}" style="--c:var(--p${i+1})"><span class="cav">${avatar(p,{happy:p.st.happy})}</span><span class="ctx"><b>${esc(p.first)}</b><small>${fmtk(p.money)}</small></span></span>`).join(''):'';
  const pt=L.partner?partnerOf(L):null;
  $('#idcard').innerHTML=`<button type="button" class="avatar" data-a="${A(()=>openPanel(pSheet))}" aria-label="Fiche personnage">${avOf(L,L)}</button><div class="who"><h1>${esc(L.first)} ${esc(L.last)}</h1><p>${esc([An(L.age),jobLabel(L)].join(' · '))}</p><p class="bdgs">${badges(L)}${pt?`<span class="bdg pt">${emoInline('💞 '+pt.first)}</span>`:''}</p></div><div class="cash"><small>Compte</small><span class="cn" data-v="${Math.round(L.money)}">${fmt(L.money)}</span>${Math.abs(netWorth(L)-L.money)>=1000?`<em>Patrimoine ${fmtk(netWorth(L))}</em>`:''}</div>`;
  {const qa=$('#qa');const q=quickActs(L);qa.innerHTML=q.length?'<span class="qh" aria-hidden="true">💡</span>'+q.map(x=>`<button type="button" class="qchip" data-a="${A(()=>openPanel(x.f))}"><span class="qe">${x.ic}</span>${esc(x.t)}</button>`).join(''):'';qa.hidden=!q.length}
  const log=$('#log');
  log.innerHTML=L.log.map(b=>`<div class="yr"><div class="ya">${b.age}<small>${b.age>1?'ans':'an'}</small></div><div class="yl">${b.lines.map(logLine).join('')}</div></div>`).join('')+(L.alive?'':obitHtml(L));
  if(L.alive)log.scrollTop=log.scrollHeight;else{const ob=log.querySelector('.obit');if(ob)log.scrollTop=ob.offsetTop-30}
  $('#stats').innerHTML=[['😊','Bonheur',L.st.happy],['❤️','Santé',L.st.health],['🧠','Intelligence',L.st.smarts],['✨','Apparence',L.st.looks]].map(([i,n,v])=>`<div class="stat m"><span class="si">${ico(i)||i}</span><b>${n}</b><span class="n">${v} %</span>${bar(v)}</div>`).join('');
  $('#tWorkL').textContent=inSchool(L)?'École':'Métier';{const te=$('#tWork .te');if(te)te.textContent=inSchool(L)?'🎓':'💼'}
  document.querySelectorAll('.tabs .tab').forEach(b=>b.disabled=!L.alive);
  $('#ageBtn').disabled=!L.alive||busy();
  try{FX.afterRender(L)}catch(e){console.error(e)}
  try{TUTO.afterRender(L)}catch(e){console.error(e)}
}
function render(){ACTS=[];renderMain();if(STACK.length&&G)showSheet()}

/* ---------- Fiche personnage, arbre, rubans, défis ---------- */
function pSheet(){
  const L=cur();const sk=Object.entries(L.skills).filter(([,v])=>v>0).map(([k,v])=>{const Ls=LESSONS.find(x=>x.k===k);return `${Ls?Ls.n:k} ${v} %${Ls&&Ls.belt?` (ceinture ${BELTS[Math.min(6,Math.floor(v/15))]})`:''}`});
  const lic=[L.lic.car&&'permis B',L.lic.boat&&'permis bateau',L.lic.pilot&&'licence de pilote'].filter(Boolean);
  return {title:'Fiche personnage',html:`<div class="sheethead">${avOf(L,L)}<div><div class="cv">${esc(L.first)} ${esc(L.last)}</div><div class="cs">${ge(L,'Né','Née')} le ${L.bday[0]} ${MONTHS[L.bday[1]-1]} · ${esc(L.zodiac)} · ${esc(L.city)}, ${esc(L.country)} · génération ${L.gen}</div></div></div>`
    +card('Statistiques','','',statLine('Bonheur',L.st.happy)+statLine('Santé',L.st.health)+statLine('Intelligence',L.st.smarts)+statLine('Apparence',L.st.looks))
    +card('Statistiques cachées','','',statLine('Karma',L.hid.karma)+statLine('Notoriété',L.fame)+statLine('Discipline',L.hid.discipline)+statLine('Volonté',L.hid.willpower)+statLine('Fertilité',L.hid.fertility)+statLine('Athlétisme',L.hid.athletic)+statLine('Folie',L.hid.crazy)+statLine('Stress',L.hid.stress||0)+statLine('Crime',L.hid.crime||0))
    +card('Profil','','',`<div class="cs">Talent : ${L.talent?TALENTS[L.talent]:'aucun'} · Attirance : ${{H:'hommes',F:'femmes',both:'hommes et femmes'}[L.likes]}<br>Diplômes : ${L.edu.degrees.length?L.edu.degrees.map(degName).join(', '):'aucun'}<br>Compétences : ${sk.length?sk.join(', '):'aucune'}<br>Permis : ${lic.length?lic.join(', '):'aucun'}<br>Casier judiciaire : ${L.record?L.record+' condamnation'+(L.record>1?'s':''):'vierge'}${L.smoker?'<br>Fumeur':''}${L.addict.alcool>30?`<br>Dépendance à l’alcool : ${L.addict.alcool} %`:''}${L.addict.jeu>30?`<br>Dépendance au jeu : ${L.addict.jeu} %`:''}${L.ill.length?`<br>Maladies : ${L.ill.map(k=>DIS[k].n).join(', ')}`:''}<br>Patrimoine net : ${fmt(netWorth(L))}</div>`)
    +group('',[...modCall('sheetRows',L).flat(),nav('🎨','Modifier l’apparence','Coiffure, couleurs, tenue, accessoires',pLook('self')),nav('🌳','Arbre généalogique','Toute ta famille',pTree)])};
}
function pTree(){
  const L=cur();const sec=(t,f)=>{const l=L.family.filter(f);return l.length?group(t,l.map(p=>row({av:avatar(p),t:`${p.first} ${p.last}`,s:`${role(p)} · ${p.alive?An(p.age):(p.gender==='F'?'décédée':'décédé')}`}))):''};
  const p=partnerOf(L);
  return {title:'Arbre généalogique',html:sec('Grands-parents',x=>x.type==='grand')+sec('Parents',x=>x.type==='parent')+group('Ta génération',[row({av:avOf(L,L),t:`${L.first} ${L.last}`,s:`Toi · ${An(L.age)}`}),p?row({av:avatar(p),t:`${p.first} ${p.last}`,s:`${partnerLabel(L)} · ${An(p.age)}`}):''].concat(L.family.filter(x=>x.type==='sibling').map(x=>row({av:avatar(x),t:`${x.first} ${x.last}`,s:`${role(x)} · ${x.alive?An(x.age):'décédé'}`}))))+sec('Enfants',x=>x.type==='child')+sec('Petits-enfants',x=>x.type==='grandkid')};
}
function pRibbons(){const n=Object.values(G.ribbons).filter(Boolean).length;return {title:'Rubans',html:note(`Chaque vie terminée reçoit un ruban. ${n} sur ${RIBBONS.length} obtenus.`)+`<div class="rgrid">${RIBBONS.map(r=>{const c=G.ribbons[r.k]||0;return `<div class="rb${c?'':' off'}"><span>${r.ic}</span><b>${esc(r.n)}</b><small>${esc(r.d)}</small>${c?`<em>×${c}</em>`:''}</div>`}).join('')}</div>`}}
const chRow=c=>row({ic:G.challenges[c.k]?'🏅':'🔒',t:c.n,s:c.d,right:G.challenges[c.k]?'Réussi':''});
function pChallenges(){const done=CHALLENGES.filter(c=>G.challenges[c.k]),todo=CHALLENGES.filter(c=>!G.challenges[c.k]);const n=done.length;
  return {title:'Défis',html:note(`${n} défi${n>1?'s':''} réussi${n>1?'s':''} sur ${CHALLENGES.length}. Ils restent acquis d’une vie à l’autre.`)+group('À relever',todo.slice(0,6).map(chRow))
    +group('',[todo.length>6?row({ic:'🔒',t:`Voir les ${todo.length-6} autres défis`,right:'›',a:()=>pushPanel(()=>pChallengesList(false))}):null,n?row({ic:'🏅',t:`Défis réussis (${n})`,right:'›',a:()=>pushPanel(()=>pChallengesList(true))}):null])}}
function pChallengesList(d){return {title:d?'Défis réussis':'Défis à relever',html:group('',CHALLENGES.filter(c=>!!G.challenges[c.k]===d).map(chRow))}}
function pCem(){return {title:'Cimetière familial',html:G.cemetery.length?group('Ils ont vécu',G.cemetery.map(c=>{const rb=RIBBONS.find(r=>r.k===c.ribbon);return row({av:avatar({look:c.look,gender:c.gender,age:c.age,alive:false}),t:c.name,s:`${c.age} ans · ${c.cause} · ${c.job} · ${fmt(c.worth)}`,right:rb?rb.ic:''})})):note('Personne n’y repose encore.')}}
function pTime(){
  const L=cur();const ages=snapAges(L).slice().reverse();
  return {title:'Machine à remonter le temps',html:note('Reviens à un âge précédent pour changer tes choix. Tout ce qui s’est passé depuis est effacé.')+(ages.length?group('Destinations',ages.map(a=>row({ic:'⏳',t:`Revenir à ${An(a)}`,s:`${L.age-a} an${L.age-a>1?'s':''} en arrière`,a:()=>pushPanel(confirmP(`Revenir à ${An(a)} ?`,'Les années suivantes seront effacées.',()=>{const r=timeTravel(G.turn,a);closeSheet();return r},'Remonter le temps'))}))):note('Aucun souvenir disponible pour l’instant : vieillis d’un an d’abord.'))};
}

/* ---------- Métier et école ---------- */
const HOURS={light:['Tranquille (35 h)','Plus de temps pour toi : bonheur en hausse, performance en baisse.'],normal:['Normal (39 h)','Équilibré : ni fatigue, ni coup de pouce.'],heavy:['Intense (50 h)','Performance en hausse, mais stress et fatigue aussi.']};
function pHours(){const L=cur();return {title:'Rythme de travail',html:note('Ton rythme joue chaque année sur ta performance, ton stress et ton bonheur.')+group('',Object.entries(HOURS).map(([k,[n,d]])=>row({ic:k==='light'?'🌴':k==='heavy'?'🔥':'⏱️',t:n,s:(L.job&&(L.job.hours||'normal')===k?'Rythme actuel · ':'')+d,a:()=>run(()=>{if(L.job)L.job.hours=k;STACK.pop();return 'Rythme de travail : '+n.toLowerCase()+'.'})})))}}
function pWork(){
  const L=cur();let h='';
  if(L.prison)return {title:'Prison',html:card('Détention',`Peine restante : ${An(L.prison)}`,'Les activités de détention sont dans l’onglet Activités.')};
  if(L.age<6)h+=note(L.age<3?`${ge(L,'Trop petit','Trop petite')} pour l’école. Profite de la sieste.`:'Maternelle : pâte à modeler, comptines et sieste.');
  if(inSchool(L)){
    const e=L.edu,g=(e.grades/5).toFixed(1).replace('.',',');
    h+=card(schoolName(L),classe(L),e.clique?`Groupe : ${e.clique}${e.team?` · équipe de ${e.team}`:''}`:e.team?`Équipe de ${e.team}`:'',`<div class="stat"><b>Moyenne générale</b><span class="n">${g}/20</span>${bar(e.grades)}</div>${inHigher(L)?'':statLine('Popularité',e.pop)}`);
    const H=[
      act(L,{ic:'📚',t:'Réviser sérieusement',s:'Moyenne et intelligence en hausse',key:'study',fn:L=>{e.grades=clamp(e.grades+R(4,10));chg(L,{smarts:R(1,3),happy:-2,discipline:1});return out(L,'Tu passes tes soirées à réviser.')}}),
      act(L,{ic:'🛹',t:'Sécher les cours',s:'Plus de fun, moins de notes',key:'skip',fn:L=>{e.grades=clamp(e.grades-R(4,10));chg(L,{happy:R(3,6)});if(!inHigher(L)&&chance(.3)){relParent(L,-8);return out(L,'Tes parents ont reçu un appel de l’établissement.')}return out(L,'Tu passes la journée au parc.')}}),
      act(L,{ic:'🧑‍🏫',t:'Parler au professeur principal',key:'prof',fn:L=>{if(chance(.6)){e.grades=clamp(e.grades+3);return out(L,'Ton professeur te donne de bons conseils de méthode.')}return out(L,'Il te reproche ton bavardage.')}})];
    if(!inHigher(L)&&L.age>=11){
      H.push(act(L,{ic:'👥',t:e.clique?`Quitter le groupe des ${e.clique}`:'Rejoindre un groupe',s:'Les populaires, les sportifs, les intellos…',key:'clique',fn:L=>{if(e.clique){e.clique=null;return out(L,'Tu prends tes distances avec ta bande.')}modal({title:'Quel groupe ?',text:'Avec qui traînes-tu à la récré ?',choices:[['populaires','looks',5],['sportifs','athletic',4],['intellos','smarts',3],['artistes','happy',4],['gothiques','crazy',4],['geeks','smarts',2]].map(([n,k,v])=>({t:cap(n),fn:()=>{const ok=chance(n==='populaires'?(L.st.looks+e.pop)/200:.75);if(!ok)return out(L,`Les ${n} ne veulent pas de toi.`);e.clique=n;e.pop=clamp(e.pop+(n==='populaires'?15:5));chg(L,{[k]:v});return out(L,`Tu rejoins la bande des ${n}.`)}}))})}}));
      H.push(act(L,{ic:'⚽',t:e.team?`Quitter l’équipe de ${e.team}`:'Rejoindre une équipe sportive',key:'team',fn:L=>{if(e.team){e.team=null;return out(L,'Tu quittes l’équipe.')}modal({title:'Quelle équipe ?',text:'Le coach organise des sélections.',choices:['football','basket','handball','athlétisme','natation'].map(t=>({t:cap(t),fn:()=>{if(chance((L.hid.athletic+L.st.health)/180)){e.team=t;chg(L,{athletic:4,health:2});e.pop=clamp(e.pop+5);return out(L,`Tu es ${ge(L,'sélectionné','sélectionnée')} dans l’équipe de ${t}.`)}return out(L,'Le coach ne te retient pas.')}}))})}}));
      H.push(act(L,{ic:'🎭',t:'Monter un spectacle de fin d’année',key:'spectacle',fn:L=>{L.skills.theatre=clamp((L.skills.theatre||0)+R(3,8));e.pop=clamp(e.pop+4);chg(L,{happy:4});return out(L,'Tu brilles sur la scène du gymnase.')}}));
    }
    H.push(inHigher(L)
      ?row({ic:'🚪',t:'Abandonner tes études',danger:1,a:()=>pushPanel(confirmP('Abandonner tes études ?','Tu perdras les années en cours.',()=>{e.stage='done';chg(L,{happy:-3});return out(L,'Tu abandonnes tes études.')}))})
      :act(L,{ic:'🚪',t:'Quitter l’école',min:16,danger:1,nav:confirmP('Quitter l’école ?','Tu n’auras pas le bac et certains métiers te seront fermés.',()=>{e.stage='done';return out(L,'Tu quittes l’école.')})}));
    h+=group(inHigher(L)?'À la fac':'À l’école',H);
  }
  if(L.edu.degrees.length)h+=note('Diplômes : '+L.edu.degrees.map(degName).join(' · '));
  if(L.royal&&!L.royal.exiled)h+=group('Famille royale',[nav('👑','Devoirs royaux',royalTitle(L),pRoyal)]);
  if(L.job){
    if(L.job.sp){const S=SPECIALS[L.job.c]||{n:'Carrière'};h+=card(S.n,title(L),`${fmt(salary(L))} par an environ · ${An(L.job.y||0)} de carrière`,statLine('Performance',L.job.perf||50)+(S.noFame?'':statLine('Notoriété',L.fame)));try{h+=S.panel?S.panel(L)||'':''}catch(e){console.error(e)}}
    else{const C=L.job.mil?{n:L.job.branch}:CAREERS[L.job.c];h+=card(C.n,title(L),`${fmt(salary(L))} par an · ${An(L.job.y)} à ce poste`,statLine('Performance',L.job.perf));}
    const H=[];
    if(!L.job.sp){
      const B=bossOf(L);if(B)H.push(row({av:avatar(B),t:`${L.job.mil?'Supérieur':ge(B,'Patron','Patronne')} : ${B.first} ${B.last}`,s:'Relation avec ta hiérarchie',right:mini(B.rel),a:()=>pushPanel(pBoss)}));
      H.push(row({ic:'⏱️',t:'Rythme de travail',s:`${HOURS[L.job.hours||'normal'][0]} · touche pour changer`,right:'›',a:()=>pushPanel(pHours)}));
      H.push(act(L,{ic:'💪',t:'Travailler plus dur',s:'Performance en hausse, fatigue aussi',key:'work',fn:L=>{L.job.perf=clamp(L.job.perf+R(5,11));chg(L,{happy:-2,health:-1});return out(L,'Tu enchaînes les heures et ça se voit.')}}));
      H.push(act(L,{ic:'😴',t:'Lever le pied',s:'Bonheur en hausse, performance en baisse',key:'slack',fn:L=>{L.job.perf=clamp(L.job.perf-R(4,9));chg(L,{happy:4});return out(L,'Pauses café prolongées et longues réunions.')}}));
      H.push(act(L,{ic:'💶',t:'Demander une augmentation',key:'raise',dis:L.job.raiseWait>0?`Reviens dans ${An(L.job.raiseWait)}`:'',fn:L=>{if(chance(L.job.perf/150)){const p=R(4,12);L.job.sal=Math.round(L.job.sal*(1+p/100));L.job.raiseWait=2;return out(L,`Augmentation accordée : +${p} %. Prochaine demande dans 2 ans.`)}L.job.perf=clamp(L.job.perf-5);L.job.raiseWait=1;return out(L,'Ta demande d’augmentation est refusée. Réessaie l’an prochain.')}}));
      H.push(act(L,{ic:'📈',t:'Demander une promotion',key:'promo',dis:L.job.lvl>=ladderOf(L.job).length-1?'Tu es au sommet':'',fn:L=>{const j=L.job;if(j.perf>=70&&chance(.5)){j.lvl++;j.y=0;j.sal=Math.round(j.sal*(j.mil?MILITARY.step:CAREERS[j.c].step));chg(L,{happy:8});if(j.lvl===ladderOf(j).length-1)track(L,'topCareer');return out(L,`📈 Promotion ! Tu deviens ${title(L).toLowerCase()}.`)}j.perf=clamp(j.perf-3);return out(L,'Pas cette année, te répond-on.')}}));
      H.push(act(L,{ic:'☕',t:'Sympathiser avec un collègue',key:'coll',fn:L=>{const f=addFriend(L,{coworker:1,age:L.age+R(-8,8)});return out(L,`Tu sympathises avec ${f.first} à la machine à café.`)}}));
    }
    H.push(act(L,{ic:'🏖️',t:L.job.mil?'Prendre ta retraite militaire':'Prendre ta retraite',s:L.job.mil?'Après 15 ans de service':`Pension : ${fmt(calcPension(L))} par an`,min:L.job.mil?0:60,dis:L.job.mil&&L.job.y<15&&(L.tr.militaryYears||0)<15?'Après 15 ans de service':'',nav:confirmP('Prendre ta retraite ?',`Pension estimée : ${fmt(calcPension(L))} par an, d’après tes 5 meilleures années et ta durée de carrière.`,()=>retire(L))}));
    H.push(row({ic:'🚪',t:L.job.mil?'Quitter l’armée':'Démissionner',danger:1,a:()=>pushPanel(confirmP(L.job.mil?'Quitter l’armée ?':'Démissionner ?','Tu perdras ton salaire. Pas de chômage après une démission.',()=>{const t=title(L);L.job=null;chg(L,{happy:2});return out(L,`Tu quittes ton poste de ${t.toLowerCase()}.`)}))}));
    h+=group('Au travail',H);
  }else if(L.retired)h+=note(`Tu es à la retraite. Pension : ${fmt(L.pension)} par an.`);
  else if(L.flags.chomage>0)h+=note(`Tu touches l’allocation chômage encore ${An(L.flags.chomage)}.`);
  if(L.part)h+=group('Petit boulot',[row({ic:'🧾',t:fem(PART_TIME[L.part.k].n,L),s:`${fmt(PART_TIME[L.part.k].sal)} par an · touche pour démissionner`,danger:1,a:()=>run(()=>{const n=PART_TIME[L.part.k].n;L.part=null;return out(L,`Tu quittes ton job : ${n.toLowerCase()}.`)})})]);
  const T2=[];
  if(!inSchool(L)&&L.edu.degrees.includes('bac')&&L.age<60)T2.push(nav('🎓','Reprendre des études','Université et grandes écoles',pMajors));
  if(L.age>=14)T2.push(nav('💼','Offres d’emploi',L.job?'Changer de métier':`${Object.keys(CAREERS).length} métiers`,pJobs));
  if(L.age>=14)T2.push(nav('🧾','Jobs étudiants et temps partiel','Compatible avec les études',pPartTime));
  if(L.age>=6)T2.push(nav('🪙','Petits boulots','Un peu d’argent de poche',pGigs));
  if(L.age>=13)T2.push(nav('🌟','Carrières spéciales','Acteur, musicien, sportif, astronaute…',pSpecials));
  if(L.age>=17)T2.push(nav('🎖️','Armée','Terre, Marine, Air, Légion étrangère',pArmy));
  for(const r of modCall('workRows',L))T2.push(...[].concat(r));
  h+=group('Carrière',T2);
  return {title:inSchool(L)?'École':'Métier',html:hint('work',inSchool(L)?'À l’école, les notes comptent pour la suite : réviser aide, sécher beaucoup moins.':L.job?'Ta performance décide des augmentations et des promotions : travaille dur… sans t’épuiser.':'Cherche un métier dans « Offres d’emploi » : ton argent en dépend.','🎒')+h};
}
function majorRow(L,k,M){return M.type==='lic'
  ?row({ic:'📘',t:M.n,s:`${An(M.y)}${canMajor(L,k)?'':` · ${M.g/5}/20 de moyenne requis`}`,dis:!canMajor(L,k),a:()=>{STACK.length=0;closeSheet();run(()=>enroll(L,k))}})
  :row({ic:'🏫',t:M.n,s:`${M.dip} · ${An(M.y)} · ${fmt(M.cost||250)} par an${canMajor(L,k)?'':M.needLic?' · licence requise':` · ${M.g/5}/20 requis`}`,dis:!canMajor(L,k),a:()=>{STACK.length=0;closeSheet();run(()=>enroll(L,k))}})}
function pMajors(){const L=cur();const E=Object.entries(MAJORS);const ok=E.filter(([k])=>canMajor(L,k));
  const best=ok.slice().sort((a,b)=>b[1].g-a[1].g).slice(0,5);
  return {title:'Études supérieures',html:note('Les filières sélectives regardent ta moyenne. Les écoles privées coûtent cher : bourse, parents ou prêt étudiant.')
    +(best.length?group('Les plus ambitieuses pour toi',best.map(([k,M])=>majorRow(L,k,M))):note('Aucune filière ne t’est encore accessible : travaille ta moyenne.'))
    +`<h3 class="sec">Toutes les filières</h3>`+tiles([ntile('📘',`Licences (${E.filter(([,M])=>M.type==='lic').length})`,'3 ans, puis master et doctorat',()=>pMajorsType('lic')),ntile('🏫',`Écoles et filières longues (${E.filter(([,M])=>M.type==='ecole').length})`,'Diplôme direct, parfois payant',()=>pMajorsType('ecole'))])}}
function pMajorsType(t){const L=cur();return {title:t==='lic'?'Licences':'Écoles',html:group('',Object.entries(MAJORS).filter(([,M])=>M.type===t).map(([k,M])=>majorRow(L,k,M)))}}
/* Offres d'emploi : d'abord les 5 meilleures pour toi, puis les secteurs (au lieu d'une liste de 55 lignes). */
const JOB_SECTORS=[['svc','🛍️','Commerce et services',['resto','vente','caisse','call','poste','menage','secret','immo','banqueg','steward']],
  ['man','🛠️','Métiers manuels',['btp','plomb','elec','menuis','meca','coiff','boul','esthe','cuisine','agri','peche']],
  ['trans','🚚','Transport',['livr','taxi','pilote','capit']],
  ['secu','🛡️','Sécurité et service public',['secu','police','gendarme','pomp','douane']],
  ['sante','🩺','Santé et soins',['soin','infi','med','chir','pharma','dent','veto','psy']],
  ['edu','🎓','Éducation, science et culture',['prof','cherch','culture','journ','coach','musicien','graph']],
  ['biz','💼','Droit, finance et affaires',['droit','juge','notaire','mkt','finance','compta','diplo']],
  ['tech','💻','Tech et ingénierie',['dev','ing','archi']]];
function jobSectors(){const known=new Set(JOB_SECTORS.flatMap(x=>x[3]));const rest=Object.keys(CAREERS).filter(k=>!known.has(k));return rest.length?JOB_SECTORS.concat([['autres','🧩','Autres métiers',rest]]):JOB_SECTORS}
function jobRow(L,k,ic){const C=CAREERS[k];const miss=reqMiss(L,C.req);const same=L.job&&L.job.c===k;return {ok:!(miss||same),row:row({ic:ic||'💼',t:fem(C.ladder[0],L),s:`${C.n} · ${fmt(C.base*(costOf(L)*.6+.4))} par an${miss?' · '+miss:same?' · ton métier actuel':''}`,dis:!!(miss||same),a:()=>applyJob(L,k),right:miss||same?'':'Postuler'})}}
function pJobs(){
  const L=cur();const SEC=jobSectors();const icOf={};SEC.forEach(([,ic,,ks])=>ks.forEach(k=>icOf[k]=ic));
  const all=Object.keys(CAREERS).map(k=>Object.assign({k},jobRow(L,k,icOf[k])));
  const best=all.filter(x=>x.ok).sort((a,b)=>CAREERS[b.k].base-CAREERS[a.k].base).slice(0,5);
  const secs=SEC.map(([id,ic,n,ks])=>{const kk=ks.filter(k=>CAREERS[k]);const ok=kk.filter(k=>all.find(x=>x.k===k).ok).length;return ntile(ic,n,`${ok} accessible${ok>1?'s':''} sur ${kk.length}`,()=>pJobsSector(id))});
  return {title:'Offres d’emploi',html:note('Ton métier évolue avec ta performance : promotions, augmentations, ou licenciement.')
    +(best.length?group('Les mieux payés pour toi',best.map(x=>x.row)):note('Aucun métier ne t’est encore accessible : continue tes études ou passe un diplôme. Chaque secteur indique ce qu’il manque.'))
    +`<h3 class="sec">Par secteur</h3>`+tiles(secs)};
}
function pJobsSector(id){
  const L=cur();const sec=jobSectors().find(x=>x[0]===id);if(!sec)return {title:'Métiers',html:note('Secteur introuvable.')};
  const rows=sec[3].filter(k=>CAREERS[k]).map(k=>jobRow(L,k,sec[1])).sort((a,b)=>b.ok-a.ok);
  return {title:sec[2],html:group('',rows.map(x=>x.row))};
}
function pPartTime(){const L=cur();return {title:'Temps partiel',html:group('Offres',Object.entries(PART_TIME).map(([k,P])=>act(L,{ic:'🧾',t:fem(P.n,L),s:`${fmt(P.sal)} par an`,min:P.min,dis:L.part?'Tu as déjà un petit boulot':P.smarts&&L.st.smarts<P.smarts?`Intelligence ${P.smarts} % min.`:L.prison?'En prison':'',fn:L=>{if(chance(.7)){L.part={k,y:0};return out(L,`Tu décroches un job : ${fem(P.n,L).toLowerCase()}.`)}return out(L,'Le poste est déjà pris.')}})))}}
function pGigs(){const L=cur();return {title:'Petits boulots',html:note('Chaque petit boulot peut se faire une fois par an.')+group('',GIGS.map(g=>act(L,{ic:'🪙',t:g.n,s:`${fmt(g.gain[0])} à ${fmt(g.gain[1])}`,min:g.min,key:'gig_'+g.k,dis:L.prison?'En prison':'',fn:L=>{let n=R(g.gain[0],g.gain[1]);if(g.skill)n=Math.round(n*(.5+skillOf(L,g.skill)/100));earn(L,n);return out(L,`${g.n} : tu gagnes ${fmt(n)}.`)}})))}}
function pSpecials(){const L=cur();const list=Object.entries(SPECIALS);return {title:'Carrières spéciales',html:note('Des carrières à part, où la notoriété fait la différence. Les leçons et le talent augmentent tes chances.')+(list.length?group('',list.map(([k,S])=>{const miss=reqMiss(L,S.req);const same=L.job&&L.job.c===k;return row({ic:S.ic||'🌟',t:S.n,s:`${S.desc||''}${miss?' · '+miss:same?' · ta carrière actuelle':''}`,dis:!!(miss||same),right:'Tenter',a:()=>{try{S.apply(L)}catch(e){console.error(e)}save();render()}})})):note('Aucune carrière spéciale disponible.'))}}
function pArmy(){const L=cur();return {title:'Armée',html:note('Un engagement dans l’armée : solde régulière, promotions et opérations extérieures.')+group('S’engager',MILITARY.branches.map(b=>act(L,{ic:'🎖️',t:b,min:17,dis:L.job&&L.job.mil?'Déjà engagé':L.royal?'Interdit aux membres de la famille royale':'',fn:L=>enlist(L,b)})))}}

/* ---------- Biens ---------- */
function market(L){if(!L.market){const c=costOf(L);L.market={houses:shuffle(HOUSE_TYPES).slice(0,6).map(([n,f])=>({name:n,place:pick(COUNTRIES[L.country].cities),price:Math.round(160000*f*c*R(80,120)/100/1000)*1000})),cars:shuffle(CARS).slice(0,6).map(([n,p,k])=>({name:n,price:Math.round(p*R(92,108)/10000)*100,scooter:k==='scooter'}))}}return L.market}
function homeLabel(L){const h=L.home&&L.assets.find(a=>a.id===L.home);if(h)return `Propriétaire : ${h.name}`;if(L.withParents&&parentsAlive(L))return 'Chez tes parents';if(L.age<18)return 'Chez tes parents';return `Locataire à ${L.city} · ${fmt(L.rent||9000*costOf(L))} par an`}
const KIND_IC={house:'🏠',car:'🚗',boat:'⛵',plane:'✈️',jewel:'💍',art:'🖼️',instrument:'🎸',heirloom:'🏺',front:'🏪',collectible:'🧸',goods:'🎁'};
function pAssets(){
  const L=cur();const kid=L.age<18;
  const h=`<div class="card kv"><div><small>Compte courant</small><b>${fmt(L.money)}</b></div><div><small>Patrimoine net</small><b>${fmt(netWorth(L))}</b></div>${L.debt?`<div><small>Prêt étudiant</small><b>${fmt(L.debt)}</b></div>`:''}</div>`;
  const ts=[ntile('🛏️','Logement',homeLabel(L),pHousing,L.age<16||L.prison)];
  if(!L.prison){
    if(!kid)ts.push(ntile('🏠','Immobilier','Annonces de l’année',pHouses),ntile('🚗','Véhicules','Voitures, bateaux, avions',pVehicles),ntile('💎','Luxe et collection','Bijoux, art, objets rares',pLuxe));
    if(L.age>=4)ts.push(ntile('🛍️','Boutique',kid?'Musique, jouets, sport, techno':'Musique, sport, techno, loisirs',pShop));
  }
  ts.push(ntile('🧰','Mes biens',`${L.assets.length} objet${L.assets.length>1?'s':''}`,pOwned));
  if(!kid&&!L.prison&&modCall('assetRows',L).flat().length)ts.push(ntile('📈','Investir','Bourse, entreprise, zoo…',pInvest));
  return {title:'Biens',html:h+hint('assets','Ici tu achètes, tu loues et tu investis. Un logement bien loué paie pour toi.','🏠')+tiles(ts)+(L.prison?note('Impossible de faire des achats depuis ta cellule.'):kid?note('Tu peux acheter avec ton argent de poche, ou demander à tes parents.'):'')};
}
function pOwned(){const L=cur();
  return {title:'Mes biens',html:L.assets.length?group('Mes biens',L.assets.map(a=>row({ic:KIND_IC[a.kind]||'📦',t:a.name,s:`Valeur ${fmt(a.value)}${a.loan?` · il reste ${fmt(a.loan)} à rembourser`:''}${a.rented?` · loué à ${a.rented.name}`:''}${L.home===a.id?' · ta résidence':''}${a.cond!=null?` · état ${a.cond} %`:''}`,right:'›',a:()=>pushPanel(pAsset(a.id))}))):note('Tu ne possèdes rien pour l’instant.')};
}
function pVehicles(){const L=cur();return {title:'Véhicules',html:tiles([ntile('🚗','Voitures',L.lic.car?'Permis B en poche':'Permis B requis (sauf scooter)',pCars),ntile('⛵','Bateaux',L.lic.boat?'Permis bateau en poche':'Permis bateau requis',pBoats),ntile('✈️','Avions et hélicoptères',L.lic.pilot?'Licence de pilote en poche':'Licence de pilote requise',pPlanes)])}}
function pLuxe(){return {title:'Luxe et collection',html:tiles([ntile('💍','Bijouterie','Bagues, montres, diamants',pJewels),ntile('🖼️','Galerie d’art','Placements qui prennent de la valeur',pArt),ntile('🧸','Objets de collection','Leur cote monte… ou s’effondre',pCollect)])}}
function pInvest(){const L=cur();return {title:'Investir',html:group('',modCall('assetRows',L).flat())}}
function pHousing(){
  const L=cur();const c=costOf(L);const opts=[['Studio meublé',Math.round(6500*c)],['Colocation sympa',Math.round(5200*c)],['Appartement deux pièces',Math.round(9000*c)],['Grand appartement lumineux',Math.round(16000*c)],['Loft avec terrasse',Math.round(32000*c)]];
  return {title:'Logement',html:note(`Actuellement : ${homeLabel(L)}.`)+group('Louer à '+L.city,opts.map(([n,r])=>act(L,{ic:'🔑',t:n,s:`${fmt(r)} par an`,min:16,fn:L=>{L.home=null;L.withParents=false;L.rent=r;chg(L,{happy:5});STACK.pop();return out(L,`Tu emménages : ${n.toLowerCase()}.`)}})))+group('Autres options',[
    parentsAlive(L)?act(L,{ic:'🏡',t:'Retourner chez tes parents',dis:L.withParents&&!L.home?'Tu y vis déjà':'',fn:L=>{L.home=null;L.withParents=true;chg(L,{happy:-3});STACK.pop();return out(L,'Tu retournes vivre chez tes parents.')}}):null,
    ...L.assets.filter(a=>a.kind==='house'&&!a.rented&&a.id!==L.home).map(a=>act(L,{ic:'🏠',t:`Emménager : ${a.name}`,fn:L=>{L.home=a.id;L.withParents=false;STACK.pop();return out(L,`Tu emménages dans ${a.name.toLowerCase()}.`)}}))])};
}
function pAsset(id){return ()=>{
  const L=cur();const a=L.assets.find(x=>x.id===id);if(!a)return {title:'Bien',html:note('Ce bien n’existe plus.')};
  const net=a.value-(a.loan||0);const H=[];
  if(a.kind==='house'){
    if(L.home!==a.id&&!a.rented)H.push(act(L,{ic:'🛏️',t:'Y emménager',fn:L=>{L.home=a.id;L.withParents=false;return out(L,`Tu emménages dans ${a.name.toLowerCase()}.`)}}));
    for(const r of modCall('assetDetailRows',L,a))H.push(...[].concat(r));
    H.push(act(L,{ic:'🔧',t:'Rénover',s:fmt(a.value*.05),cost:Math.round(a.value*.05),key:'ren_'+id,fn:L=>{a.cond=100;a.value=Math.round(a.value*1.06);return out(L,'Travaux terminés. Le bien prend de la valeur.')}}));
  }
  if(a.kind==='car')H.push(act(L,{ic:'🔧',t:'Passer au garage',s:'600 €',cost:600,key:'gar_'+id,fn:L=>{a.cond=clamp((a.cond||50)+35);return out(L,'Vidange, freins et pneus neufs.')}}));
  if(a.kind==='instrument')H.push(act(L,{ic:'🎶',t:'En jouer',key:'play_'+id,fn:L=>{const gs=gearSkill(a.name);const k=gs?gs[0]:a.name.includes('Piano')?'piano':a.name.includes('Batterie')?'batterie':a.name.includes('Violon')?'violon':'guitare';L.skills[k]=clamp((L.skills[k]||0)+R(2,6)+(gs?gs[1]:0));chg(L,{happy:3});return out(L,'Tu joues pendant des heures.')}}));
  H.push(row({ic:'💶',t:'Vendre',s:`Tu toucherais ${fmt(net)}`,danger:1,a:()=>pushPanel(confirmP(`Vendre : ${a.name}`,`Tu toucheras ${fmt(net)}.`,()=>{L.assets=L.assets.filter(x=>x.id!==id);if(L.home===id)L.home=null;L.money+=net;STACK.pop();return out(L,`Tu vends ${a.name.toLowerCase()} pour ${fmt(a.value)}.`)},'Vendre'))}));
  return {title:a.name,html:card(a.kind==='house'?'Immobilier':'Bien',fmt(a.value),`${a.loan?`Il reste ${fmt(a.loan)} à rembourser sur ${An(a.left)} · `:''}${a.cond!=null?`État : ${a.cond} %`:''}`,'')+group('',H)};
}}
function pHouses(){const L=cur();const M=market(L);return {title:'Immobilier',html:note('Nouvelles annonces chaque année. Les prix dépendent du pays où tu vis.')+group('Annonces',M.houses.map((x,i)=>row({ic:'🏠',t:`${x.name} · ${x.place}`,s:fmt(x.price),right:'›',a:()=>pushPanel(()=>pBuyHouse(i))})))}}
function pBuyHouse(i){
  const L=cur();const x=market(L).houses[i];if(!x)return {title:'Annonce',html:note('Ce bien vient d’être vendu.')};
  const down=Math.round(x.price*.2),loan=x.price-down,pay=Math.round(loan*1.3/20);const inc=(L.job?salary(L):0)+(L.retired?L.pension:0)+(L.royal?400000:0);const ok=inc*.35>=pay;
  const buy=credit=>L=>{const a={id:nid(),kind:'house',name:`${x.name} · ${x.place}`,value:x.price,loan:credit?loan:0,pay:credit?pay:0,left:credit?20:0,cond:R(60,100)};L.assets.push(a);if(!L.home&&!(L.withParents&&L.age<22)){L.home=a.id;L.withParents=false}L.market.houses.splice(i,1);STACK.pop();chg(L,{happy:10});trackMax(L,'houses',L.assets.filter(a=>a.kind==='house').length);return out(L,`🏠 Tu achètes : ${x.name.toLowerCase()} (${x.place})${credit?', avec un crédit sur 20 ans':''}.`)};
  return {title:x.name,html:card(x.place,fmt(x.price),`Charges et impôt local : environ ${fmt(x.price*.008)} par an.`,'')+group('Financement',[act(L,{ic:'💶',t:'Payer comptant',s:fmt(x.price),cost:x.price,fn:buy(false)}),act(L,{ic:'🏦',t:'Emprunter sur 20 ans',s:`Tu paies ${fmt(down)} tout de suite · ${fmt(pay/12)} par mois`,dis:!ok?'Refusé : les mensualités doivent rester sous 35 % de tes revenus':'',cost:down,fn:buy(true)})])};
}
const buyList=(title,list,kind,ic,need)=>()=>{const L=cur();return {title,html:group('',list.map(([n,p])=>act(L,{ic,t:n,s:fmt(p),cost:p,dis:need&&need(n),fn:L=>{L.assets.push({id:nid(),kind,name:n,value:Math.round(p*.9),cond:kind==='car'?100:undefined});chg(L,{happy:kind==='jewel'?3:5});return out(L,`Tu t’offres : ${n.toLowerCase()}.`)}})))}};
function pCars(){const L=cur();const M=market(L);return {title:'Concession',html:group('Véhicules disponibles',M.cars.map((x,i)=>act(L,{ic:'🚗',t:x.name,s:fmt(x.price),cost:x.price,dis:!L.lic.car&&!x.scooter?'Permis B requis':'',fn:L=>{L.assets.push({id:nid(),kind:'car',name:x.name,value:x.price,cond:100});L.market.cars.splice(i,1);chg(L,{happy:6});return out(L,`🚗 Tu t’offres : ${x.name}.`)}})))}}
const pBoats=()=>buyList('Bateaux',BOATS,'boat','⛵',n=>!cur().lic.boat&&n!=='Kayak de mer'?'Permis bateau requis':'')();
const pPlanes=()=>buyList('Avions',PLANES,'plane','✈️',()=>!cur().lic.pilot?'Licence de pilote requise':'')();
const pJewels=()=>buyList('Bijouterie',JEWELS,'jewel','💍')();
const pArt=()=>buyList('Galerie d’art',ART,'art','🖼️')();
const pInstr=()=>buyList('Magasin de musique',INSTRUMENTS,'instrument','🎸')();
/* ---------- Boutique (enfants, ados et adultes) ---------- */
const SHOP=[
 ['musique','🎸','Musique','Instruments et son',[
  ['Flûte à bec',15,5,'🎶',{happy:3},'instrument'],['Micro de karaoké',35,5,'🎤',{happy:5}],['Ukulélé',60,6,'🎸',{happy:5},'instrument'],['Clavier électronique',300,7,'🎹',{happy:6},'instrument'],['Violon d’étude',600,7,'🎻',{happy:5,smarts:1},'instrument'],['Casque audio',80,8,'🎧',{happy:4}],['Guitare acoustique',250,8,'🎸',{happy:6},'instrument'],['Piano numérique',900,9,'🎹',{happy:7,smarts:1},'instrument'],['Batterie électronique',900,10,'🥁',{happy:8},'instrument'],['Platines de DJ',400,13,'🎛️',{happy:7}]]],
 ['jouets','🧸','Jouets et jeux','Peluches, jeux, consoles',[
  ['Peluche',20,3,'🧸',{happy:3}],['Puzzle',15,4,'🧩',{happy:2,smarts:1}],['Boîte de Lego',60,5,'🧱',{happy:5,smarts:1}],['Cerf-volant',15,5,'🪁',{happy:3}],['Jeu de société',25,6,'🎲',{happy:4}],['Console portable',150,8,'🎮',{happy:7}],['Télescope',120,9,'🔭',{happy:4,smarts:2}],['Console de salon',350,9,'🎮',{happy:9}],['Jeu vidéo',60,8,'🕹️',{happy:5}]]],
 ['sport','⚽','Sport','Vélo, ballons, glisse',[
  ['Ballon de foot',20,5,'⚽',{happy:3,athletic:1}],['Trottinette',70,5,'🛴',{happy:5,athletic:1}],['Vélo',150,6,'🚲',{happy:6,athletic:2,health:1}],['Kimono de judo',40,6,'🥋',{happy:3,athletic:1}],['Rollers',90,7,'🛼',{happy:5,athletic:2}],['Raquette de tennis',60,7,'🎾',{happy:3,athletic:1}],['Skateboard',80,8,'🛹',{happy:5,athletic:2}],['Planche de surf',250,12,'🏄',{happy:6,athletic:2}],['Scooter 50 cc',1800,14,'🛵',{happy:10},'goods','parents']]],
 ['techno','📱','Techno','Téléphone, ordinateur, photo',[
  ['Tablette',250,8,'📱',{happy:5,smarts:1}],['Montre connectée',120,10,'⌚',{happy:4,pop:3}],['Appareil photo',200,10,'📷',{happy:5}],['Smartphone',350,11,'📱',{happy:7,pop:6}],['Ordinateur portable',700,12,'💻',{happy:6,smarts:2}],['Drone',150,12,'🛸',{happy:6}]]],
 ['creatif','🎨','Créatif et livres','Dessin, lecture, sciences',[
  ['Boîte de feutres',15,3,'🖍️',{happy:2,skill:['dessin',3]}],['Kit de peinture',40,5,'🎨',{happy:4,skill:['dessin',5]}],['Livre illustré',12,5,'📖',{happy:2,smarts:1}],['Kit de magie',30,6,'🪄',{happy:4}],['Encyclopédie',40,7,'📚',{happy:2,smarts:2}],['Chevalet',90,8,'🖼️',{happy:3,skill:['dessin',6]}],['Carnet d’écriture',10,8,'📓',{happy:2,smarts:1}],['Kit de chimie',45,9,'🧪',{happy:3,smarts:2}]]],
 ['look','👟','Look','Baskets, sacs, accessoires',[
  ['Sac à dos',40,5,'🎒',{happy:2}],['Baskets de marque',120,8,'👟',{happy:5,looks:1,pop:3}],['Lunettes de soleil',60,8,'🕶️',{happy:3,looks:1}],['Montre',80,10,'⌚',{happy:3,looks:1}],['Bijou',40,11,'💍',{happy:3,looks:1}],['Trousse de beauté',35,13,'💄',{happy:3,looks:1}]]]
];
const shopPrice=(L,p)=>Math.max(5,Math.round(p*(.75+.25*costOf(L))));
function shopGive(L,it,price,how){
  const [n,p0,min,ic,fx,kind]=it;const f=Object.assign({},fx);
  const sk=f.skill;delete f.skill;const pop=f.pop;delete f.pop;
  L.assets.push({id:nid(),kind:kind||'goods',name:n,value:Math.round(shopPrice(L,p0)*.5)});
  chg(L,f);if(sk)L.skills[sk[0]]=clamp((L.skills[sk[0]]||0)+sk[1]);else{const gs=gearSkill(n);if(gs)L.skills[gs[0]]=clamp((L.skills[gs[0]]||0)+gs[1]+1)}if(pop&&L.edu)L.edu.pop=clamp(L.edu.pop+pop);
  if(price>0)spend(L,price);
  return out(L,`${ic} ${how} : ${n.toLowerCase()}.`);
}
function askParents(L,it,price){
  const [n,p0,min,ic,fx,kind,only]=it;
  L.used.asks=(L.used.asks||0)+1;
  const ps=parents(L);if(!ps.length)return out(L,'Tu n’as personne à qui demander.');
  if(L.used.asks>3)return out(L,'Tes parents en ont assez de tes demandes pour cette année.');
  ps.forEach(p=>{if(p.gen==null)p.gen=R(15,90)});
  const best=ps.slice().sort((a,b)=>b.rel-a.rel)[0];const gen=Math.max(...ps.map(p=>p.gen));
  const pr=Math.max(.04,Math.min(.92,.22+best.rel/200+gen/300-price/(1100*costOf(L))-(L.used.asks-1)*.12));
  const who=best.gender==='F'?'Ta mère':'Ton père';
  if(chance(pr)){relParent(L,3);return shopGive(L,it,0,`${who} t’offre`)}
  if(price>=60&&chance(.4)){
    const half=Math.round(price/2);
    modal({title:n,icon:ic,text:`${who} propose : « On paie la moitié, tu paies le reste. » (${fmt(half)} pour toi)`,choices:[{t:`Accepter (${fmt(half)})`,fn:()=>{if(L.money<half)return 'Tu n’as pas assez d’argent pour ta moitié.';relParent(L,1);return shopGive(L,it,half,`${who} participe, tu t’offres`)}},{t:'Laisser tomber'}]});
    return out(L,`${who} hésite au sujet de : ${n.toLowerCase()}.`);
  }
  relParent(L,-2);
  return out(L,`${who} refuse : « ${pick(['On verra à Noël.','C’est beaucoup trop cher.','Tu as déjà assez de jouets !','Fais d’abord tes devoirs.','On n’est pas des banquiers, tu sais.'])} »`);
}
function shopBuy(L,it){
  const [n,p0,min,ic,fx,kind,only]=it;const price=shopPrice(L,p0);
  const ask=L.age<18&&parentsAlive(L);const ch=[];
  if(only!=='parents')ch.push({t:`Payer avec mon argent (${fmt(price)})`,fn:()=>{if(L.money<price)return 'Tu n’as pas assez d’argent.';return shopGive(L,it,price,'Tu t’offres')}});
  if(ask)ch.push({t:'Demander à mes parents',fn:()=>askParents(L,it,price)});
  ch.push({t:'Laisser tomber'});
  modal({title:n,icon:ic,text:`Prix : ${fmt(price)}. Tu as ${fmt(L.money)} sur ton compte.${only==='parents'&&!ask?' Il faut l’accord de tes parents.':''}`,choices:ch});
}
function pShop(){const L=cur();const ts=SHOP.map(([id,ic,t,sub,list])=>ntile(ic,t,sub,shopCat(id)));return {title:'Boutique',html:note(L.age<18?'Achète avec ton argent de poche ou demande à tes parents : plus ils t’aiment, plus ils disent oui.':'Tes petits plaisirs du quotidien.')+tiles(ts)}}
const shopCat=id=>()=>{const L=cur();const cat=SHOP.find(c=>c[0]===id);const rows=cat[4].map(it=>{const [n,p0,min,ic,fx,kind,only]=it;const owned=L.assets.some(a=>a.name===n);const price=shopPrice(L,p0);return act(L,{ic,t:n,s:`${fmt(price)}${gearSkill(n)?` · aide en ${(LESSONS.find(l=>l.k===gearSkill(n)[0])||{n:''}).n.toLowerCase()}`:''}${only==='parents'?' · accord des parents':''}`,min,dis:owned?'Tu l’as déjà':L.prison?'En prison':'',fn:L=>{shopBuy(L,it);return ''}})});return {title:cat[2],html:group('',rows)}};

function pCollect(){const L=cur();if(!L.collectMk||L.collectMk.age!==L.age)L.collectMk={age:L.age,px:COLLECTIBLES.map(([n,p,v])=>Math.max(5,Math.round(p*Math.exp(gauss()*v*.6))))};return {title:'Objets de collection',html:note('La cote de chaque objet évolue chaque année. Achète bas, revends haut.')+group('Brocante, salles de vente et vide-greniers',COLLECTIBLES.map(([n,p,v],i)=>{const px=L.collectMk.px[i];return act(L,{ic:'🧸',t:n,s:`${fmt(px)} · cote ${px>=p?'en hausse':'en baisse'}`,cost:px,min:12,fn:L=>{L.assets.push({id:nid(),kind:'collectible',name:n,value:px,vol:v});chg(L,{happy:3});return out(L,`Tu ajoutes à ta collection : ${n.toLowerCase()}.`)}})}))}}

/* ---------- Relations ---------- */
function findLove(L,pre){
  L.used.love=(L.used.love||0)+1;
  const g=likeG(L);const a=L.age<18?clamp(L.age+R(-1,1),14,17):Math.max(18,L.age+R(-7,7));
  const p=pre||person(g,a,null,L.country);p.age=p.age||a;const job=p.job||(a<18?'lycéen':a<23&&chance(.5)?'étudiant':pick(NPC_JOBS));
  modal({title:'Rencontre',icon:'💘',html:`<div class="cand"><div class="cavatar">${avatar(p)}</div><div><b>${esc(p.first)} ${esc(p.last)}, ${An(p.age)}</b><br><span class="muted">${esc(cap(job))}</span></div></div><div class="cand2">${statLine('Apparence',p.looks)}${statLine('Intelligence',p.smarts)}</div>`,choices:[
    {t:'Proposer un rendez-vous',pri:1,fn:()=>{const pr=.4+(L.st.looks-p.looks)/180+(L.st.happy-50)/400+(L.fame/300);if(chance(pr)){setPartner(L,p);chg(L,{happy:10});return out(L,`💕 Premier rendez-vous réussi avec ${p.first}. Vous êtes en couple !`)}chg(L,{happy:-4});return out(L,`${p.first} ne donne pas suite.`)}},
    ...(L.age<18||p.age<18?[]:[{t:'Aventure d’un soir',fn:()=>{if(chance(.5+(L.st.looks-p.looks)/150)){chg(L,{happy:6});track(L,'partners');if(L.partner&&chance(.3))return breakUp(L,`${pn(L)} découvre ton infidélité.`);return out(L,`Une nuit passionnée avec ${p.first}. Sans lendemain.`)}return out(L,`${p.first} décline poliment.`)}}]),
    {t:L.used.love<4?'Voir un autre profil':'Plus de profils cette année',fn:()=>{if(L.used.love<4)findLove(L)}},
    {t:'Laisser tomber'}]});
}
function declare(L){
  const oi=1-G.turn,o=G.players[oi];
  modal({title:`${o.first}, c’est pour toi`,icon:'💌',text:`${L.first} te déclare sa flamme. Que réponds-tu ?`,pc:oi,choices:[
    {t:'Oui, mille fois oui',pri:1,fn:()=>{L.partner={status:'couple',rel:85,link:oi,since:L.age};o.partner={status:'couple',rel:85,link:G.turn,since:o.age};track(L,'partners');track(o,'partners');chg(L,{happy:15});chg(o,{happy:15});say(o,`💕 ${L.first} et toi, vous êtes en couple !`);return out(L,`💕 ${o.first} et toi, vous êtes en couple !`)}},
    {t:'Désolé, non',fn:()=>{chg(L,{happy:-10});return out(L,`${o.first} t’a mis un râteau.`)}}]});
}
function propose(L){
  const p=partnerOf(L);const o=linkedOther(L);
  if(o){const oi=L.partner.link;modal({title:`${o.first}, c’est pour toi`,icon:'💍',text:`${L.first} pose un genou à terre et te demande en mariage.`,pc:oi,choices:[
    {t:'Oui !',pri:1,fn:()=>{setStatus(L,'fiance');chg(L,{happy:12});chg(o,{happy:12});say(o,`💍 Tu es ${ge(o,'fiancé','fiancée')} à ${L.first} !`);return out(L,`💍 ${o.first} a dit oui ! Vous êtes fiancés.`)}},
    {t:'Pas encore',fn:()=>{partnerRel(L,-5);chg(L,{happy:-8});return out(L,`${o.first} n’est pas encore ${ge(o,'prêt','prête')}.`)}}]});return}
  if(chance(L.partner.rel/110)){setStatus(L,'fiance');chg(L,{happy:12});return out(L,`💍 ${p.first} a dit oui ! Vous êtes fiancés.`)}
  partnerRel(L,-12);chg(L,{happy:-10});return out(L,`${p.first} a dit non. Moment gênant.`);
}
function pWedding(){
  const L=cur();const p=partnerOf(L);
  const wed=(txt,h)=>L=>{setStatus(L,'marie');chg(L,{happy:h});partnerRel(L,10);const o=linkedOther(L);if(o){chg(o,{happy:h});say(o,'💒 '+txt)}STACK.pop();checkChallenges(L);return out(L,'💒 '+txt)};
  return {title:'Le mariage',html:note(`Comment ${p.first} et toi voulez-vous vous dire oui ?`)+group('Formule',[
    act(L,{ic:'🏛️',t:'Mairie, en petit comité',s:'300 €',cost:300,fn:wed(`Vous vous dites oui à la mairie de ${L.city}.`,8)}),
    act(L,{ic:'🌻',t:'Mariage champêtre',s:'8 000 €',cost:8000,fn:wed('Mariage champêtre sous les guirlandes lumineuses. Tout le monde danse jusqu’à l’aube.',14)}),
    act(L,{ic:'🏰',t:'Grand mariage au château',s:'25 000 €',cost:25000,fn:wed('Grand mariage au château : pièce montée, feu d’artifice et tonton qui fait un discours.',20)}),
    act(L,{ic:'🎰',t:'Fuguer à Las Vegas',s:'3 000 €',cost:3000,fn:wed('Mariage express à Las Vegas, célébré par un sosie d’Elvis.',12)})])
    +group('Option',[act(L,{ic:'📜',t:L.partner.prenup?'Contrat de mariage signé':'Signer un contrat de mariage',s:'Protège ton patrimoine en cas de divorce',dis:L.partner.prenup?'Déjà signé':'',fn:L=>{if(L.partner.link==null&&chance(.3)){partnerRel(L,-10);L.partner.prenup=1;return out(L,`${p.first} signe, mais se sent blessé.`)}L.partner.prenup=1;return out(L,'Contrat de mariage signé chez le notaire.')}})])};
}
/* ---------- Fiche profil d’un personnage ---------- */
function pbarRow(n,v,cls){v=clamp(v||0);return `<div class="pbar"><span>${esc(n)}</span><span class="bar ${cls||tone(v).trim()}"><i style="width:${v}%"></i></span><em>${v} %</em></div>`}
function profileCard(p,o){
  const name=p.type==='pet'?p.first:`${p.first} ${p.last}`;
  const rows=(o.rows||[]).filter(r=>r&&r[1]!=null&&r[1]!=='').map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  const bars=(o.bars||[]).filter(Boolean).map(([n,v,c])=>pbarRow(n,v,c)).join('');
  return `<div class="pcard"><div class="pcard-h"><span class="pcard-av">${o.av||avatar(p)}</span><div class="pcard-t"><div class="rl">${esc(o.role||'')}</div><div class="nm">${esc(name)}</div>${o.sub?`<div class="sb">${esc(o.sub)}</div>`:''}</div></div><div class="pcard-b"><div class="pcard-k">Profil</div><dl class="ptab">${rows}</dl>${bars?`<div class="pbars">${bars}</div>`:''}</div></div>`;
}
function jobOfNpc(p){if(p.alive===false)return '';if(p.type==='pet')return '';if(p.age<3)return 'Bébé';if(p.age<6)return 'Maternelle';if(p.age<18)return p.age<11?'Écolier':p.age<15?'Collégien':'Lycéen';return cap(p.job||'Sans emploi')}
function sharedKids(L,key,since){const ks=allKids(L);const t=ks.filter(k=>k.coparent&&k.coparent===key);if(t.length||ks.some(k=>k.coparent))return t.length;return since!=null?ks.filter(k=>k.age<=L.age-since).length:0}
function personProfile(L,p,extra={}){
  const ill=(p.ill||[]).map(illName);
  if(p.type==='pet'){const P=PETS[p.species]||[0,8,14];const lifeLeft=Math.max(0,(p.max||P[2])-p.age);
    return profileCard(p,{role:p.species,sub:p.alive?An(p.age):`Mort à ${An(p.age)}`,rows:[['Relation',`${p.gender==='F'?'Ta':'Ton'} ${p.species.toLowerCase()}`],['Âge',An(p.age)],['Espèce',p.species],['Forme',!p.alive?'—':lifeLeft<=1?'Très âgé':lifeLeft<=3?'Vieillissant':'En pleine forme']],bars:p.alive?[['Relation',p.rel],['Énergie',clamp(100-p.age/(p.max||P[2])*100),'v']]:[]})}
  const kidsOf=p.type==='child'?L.family.filter(g=>g.type==='grandkid'&&g.parentName===p.first).length:p.type==='ex'?sharedKids(L,p.origId||p.id):null;
  const rows=[['Relation',extra.relLabel||role(p)],['Âge',p.alive===false?`Décédé${p.gender==='F'?'e':''} à ${An(p.age)}`:An(p.age)]];
  if(extra.together!=null)rows.push(['Années ensemble',String(extra.together)]);
  if(p.type==='ex'&&p.together)rows.push(['Années ensemble',String(p.together)]);
  if(extra.kids!=null)rows.push(['Enfants',String(extra.kids)]);else if(kidsOf!=null)rows.push(['Enfants',String(kidsOf)]);
  rows.push(['Profession',extra.job||jobOfNpc(p)]);
  const w=extra.noWealth?null:npcWealth(L,p);if(w){if(w.pocket)rows.push(['Argent de poche',`≈ ${fmt(w.cash)}`]);else{rows.push([w.ret?'Retraite':'Revenus',`≈ ${fmtk(w.inc)} par an`]);rows.push(['Patrimoine estimé',`≈ ${fmtk(w.cash)}`])}}
  if(p.alive!==false)rows.push(['Maladies',ill.length?cap(ill.join(', ')):'Aucune']);
  if(extra.more)rows.push(...extra.more);
  const bars=p.alive===false?[]:[['Relation',extra.rel!=null?extra.rel:p.rel],['Apparence',p.looks??50],['Intelligence',p.smarts??50],['Santé',p.health??70],['Folie',p.crazy??20,'v'],['Gloire',p.fame??0,'g']];
  return profileCard(p,{role:extra.role||role(p),sub:extra.sub,rows,bars,av:extra.av});
}
function pPartner(){
  const L=cur();if(!L.partner)return {title:'Couple',html:note('Tu es célibataire.')};
  const p=partnerOf(L),st=L.partner.status,linked=L.partner.link!=null;
  const H=[
    act(L,{ic:'💑',t:'Passer du temps ensemble',key:'pt',fn:L=>{partnerRel(L,R(4,10));chg(L,{happy:3});return out(L,pick([`Balade au bord de l’eau avec ${p.first}.`,`Soirée série sous un plaid avec ${p.first}.`,`Vous cuisinez une raclette, ${p.first} et toi.`,`Brocante du dimanche avec ${p.first}.`]))}}),
    act(L,{ic:'🕯️',t:'Dîner en amoureux',s:'80 €',cost:80,min:16,key:'pd',fn:L=>{partnerRel(L,R(5,12));chg(L,{happy:4});return out(L,`Dîner aux chandelles avec ${p.first}.`)}}),
    act(L,{ic:'🎁',t:'Offrir un bijou',s:'400 €',cost:400,min:16,key:'pg',fn:L=>{partnerRel(L,R(8,15));return out(L,`${p.first} est ${p.gender==='F'?'ravie':'ravi'}.`)}}),
    act(L,{ic:'🏝️',t:'Partir en week-end en amoureux',s:'900 €',cost:900,min:18,key:'pw',fn:L=>{partnerRel(L,R(8,16));chg(L,{happy:7});track(L,'trips');return out(L,`Week-end à ${pick(['Venise','Étretat','Annecy','Biarritz','Lisbonne'])} avec ${p.first}.`)}}),
    act(L,{ic:'💬',t:'Faire un compliment',key:'pc',fn:L=>{partnerRel(L,R(2,6));return out(L,`${p.first} rougit.`)}}),
    act(L,{ic:'💢',t:'Se disputer',key:'px',fn:L=>{partnerRel(L,-R(8,15));chg(L,{happy:-3});return out(L,`Grosse dispute avec ${p.first}.`)}})];
  if(st==='couple')H.push(act(L,{ic:'💍',t:'Demander en mariage',s:'Bague : 1 500 €',min:18,dis:p.age<18?`${p.first} est trop jeune`:'',cost:1500,key:'prop',fn:L=>propose(L)}));
  if(st==='fiance')H.push(act(L,{ic:'💒',t:'Organiser le mariage',s:'Mairie, champêtre, château ou Las Vegas',nav:pWedding}));
  if(L.age>=18&&!L.prison)H.push(act(L,{ic:'👶',t:'Essayer d’avoir un bébé',key:'baby',fn:L=>tryBaby(L)}));
  for(const r of modCall('partnerRows',L))H.push(...[].concat(r));
  H.push(row({ic:'💔',t:st==='marie'?'Divorcer':'Rompre',danger:1,a:()=>pushPanel(confirmP(st==='marie'?'Divorcer ?':'Rompre ?',st==='marie'&&!linked&&!L.partner.prenup?'Sans contrat de mariage, le divorce te coûtera 40 % de tes économies.':'Pas de retour en arrière possible.',()=>{STACK.pop();return breakUp(L,`Tu quittes ${p.first}.`)}))}));
  const o=linkedOther(L);const pp=o?{first:o.first,last:o.last,gender:o.gender,age:o.age,look:o.look,alive:o.alive,looks:o.st.looks,smarts:o.st.smarts,health:o.st.health,crazy:o.hid.crazy,fame:o.fame,ill:o.ill,type:'partner'}:p;
  const key=linked?'player'+L.partner.link:p.id;
  const prof=personProfile(L,pp,{role:partnerLabel(L)+(linked?` · joueur ${L.partner.link+1}`:''),relLabel:partnerLabel(L),together:L.age-(L.partner.since??L.age),kids:sharedKids(L,key,L.partner.since),job:linked?jobLabel(o):jobOfNpc(p),rel:L.partner.rel,av:linked?avOf(o,o):avatar(p),
    more:[].concat(linked?[['Compte',fmt(o.money)],['Patrimoine net',fmtk(netWorth(o))]]:[],L.partner.status==='marie'?[['Mariés depuis',An(L.age-(L.partner.wedAge??L.age))],['Contrat de mariage',L.partner.prenup?'Oui':'Non']]:[]),noWealth:linked});
  return {title:partnerLabel(L),html:prof+group('Ensemble',H)};
}
function pBoss(){
  const L=cur();const B=bossOf(L);if(!B)return {title:'Hiérarchie',html:note('Tu n’as pas de supérieur.')};
  const head=personProfile(L,B,{role:L.job.mil?'Supérieur hiérarchique':ge(B,'Patron','Patronne'),relLabel:L.job.mil?'Supérieur':ge(B,'Patron','Patronne'),job:L.job.mil?`Officier · ${L.job.branch}`:`${cap(B.job||'Direction')} · ${(CAREERS[L.job.c]||{n:''}).n}`,more:[['Ton ancienneté',An(L.job.y||0)]],sub:'Une bonne relation aide à obtenir des promotions.'});
  return {title:L.job.mil?'Supérieur':ge(B,'Patron','Patronne'),html:head+group('Actions',[
    act(L,{ic:'💬',t:'Discuter de ton travail',key:'b_talk',fn:L=>{B.rel=clamp(B.rel+R(2,6));return out(L,`Bon échange avec ${B.first} sur tes projets.`)}}),
    act(L,{ic:'☕',t:'Lui offrir un café',key:'b_cafe',fn:L=>{B.rel=clamp(B.rel+R(1,4));return out(L,`${B.first} apprécie l’attention.`)}}),
    act(L,{ic:'🌷',t:'Le flatter',key:'b_flat',fn:L=>{if(chance(.6)){B.rel=clamp(B.rel+R(3,8));return out(L,`${B.first} rosit de plaisir.`)}B.rel=clamp(B.rel-4);return out(L,`${B.first} voit clair dans ton jeu.`)}}),
    act(L,{ic:'🧭',t:'Demander conseil pour ta carrière',key:'b_conseil',fn:L=>{B.rel=clamp(B.rel+R(2,5));L.job.perf=clamp(L.job.perf+R(1,4));return out(L,`${B.first} te donne de précieux conseils.`)}}),
    act(L,{ic:'🧾',t:'Te plaindre de lui aux RH',key:'b_rh',danger:1,fn:L=>{B.rel=clamp(B.rel-R(15,25));if(chance(.3)){L.job.perf=clamp(L.job.perf+5);return out(L,'Les RH te donnent raison. Ambiance glaciale.')}return out(L,'Les RH classent ta plainte. Ton patron l’apprend.')}}),
    act(L,{ic:'💢',t:'Lui tenir tête en réunion',key:'b_tete',danger:1,fn:L=>{if(chance(.35)){B.rel=clamp(B.rel+5);chg(L,{happy:4});return out(L,'Ton aplomb impressionne.')}B.rel=clamp(B.rel-R(10,18));return out(L,`${B.first} ne te le pardonnera pas de sitôt.`)}})])};
}
const wTag=(L,p)=>{const w=p&&p.type!=='pet'?npcWealth(L,p):null;return w&&!w.pocket?` · ≈ ${fmtk(w.cash)}`:''};
function spendTime(L,p){p.seen=L.age;p.rel=clamp(p.rel+R(3,10));chg(L,{happy:2});return out(L,pick([`Cinéma avec ${p.first}.`,`Longue balade avec ${p.first}.`,`Soirée jeux de société avec ${p.first}.`,`Pique-nique avec ${p.first}.`]))}
function pRel(){
  const L=cur();let h='';const top=[];
  if(!L.partner&&!L.prison)top.push(act(L,{ic:'💘',t:'Trouver l’amour',s:'Applis, soirées, coups de foudre',min:14,dis:(L.used.love||0)>=4?'Plus de profils cette année':'',fn:L=>{findLove(L)}}));
  if(G.mode===2&&G.players.length>1){
    const oi=1-G.turn,o=G.players[oi];const fam=L.family.some(p=>p.first===o.first&&p.last===o.last);
    if(o&&o.alive&&!L.partner&&!o.partner&&!L.prison&&!fam)top.push(act(L,{ic:'💌',t:`Déclarer ta flamme à ${o.first}`,s:`Joueur ${oi+1} · ${An(o.age)}`,min:14,dis:o.age<14?`${o.first} est trop jeune`:'',key:'decl',fn:L=>{declare(L)}}));
  }
  if(!L.prison)top.push(act(L,{ic:'🤝',t:'Se faire un nouvel ami',s:'École, travail, voisinage',min:4,key:'friend',fn:L=>{const f=addFriend(L);chg(L,{happy:4});return out(L,`Tu te lies d’amitié avec ${f.first}.`)}}));
  h+=group('Rencontres',top);
  {const need=L.family.filter(p=>p.alive&&p.type!=='pet'&&p.type!=='enemy'&&p.type!=='ex'&&p.type!=='grandkid'&&p.age>=4&&p.rel<75&&!L.used['t'+p.id]).sort((a,b)=>a.rel-b.rel).slice(0,3);
   if(!L.prison)h+=group('À voir en ce moment',need.map(p=>act(L,{av:avatar(p),t:`Passer du temps avec ${p.first}`,s:`${role(p)} · relation ${Math.round(p.rel)} %`,key:'t'+p.id,fn:L=>spendTime(L,p)})))}
  {const B=bossOf(L);if(B)h+=group('Travail',[row({av:avatar(B),t:`${B.first} ${B.last}`,s:`${L.job.mil?'Supérieur':ge(B,'Patron','Patronne')} · ${An(B.age)}${wTag(L,B)}`,right:mini(B.rel),a:()=>pushPanel(pBoss)})])}
  if(L.partner){const p=partnerOf(L);h+=group('Couple',[row({av:avatar(p),t:`${p.first} ${p.last}`,s:`${partnerLabel(L)} · ${An(p.age)}${L.partner.link!=null?` · joueur ${L.partner.link+1} · ${fmtk(linkedOther(L).money)}`:wTag(L,L.partner.p)}`,right:mini(L.partner.rel),a:()=>pushPanel(pPartner)})])}
  for(const [n,f] of [['Parents',p=>p.type==='parent'],['Grands-parents',p=>p.type==='grand'],['Frères et sœurs',p=>p.type==='sibling'],['Enfants',p=>p.type==='child'],['Petits-enfants',p=>p.type==='grandkid'],['Amis et collègues',p=>p.type==='friend'],['Ex',p=>p.type==='ex'],['Ennemis',p=>p.type==='enemy'],['Animaux',p=>p.type==='pet']]){
    const list=L.family.filter(f);
    if(list.length)h+=group(n,list.map(p=>row({av:avatar(p),t:p.type==='pet'?p.first:`${p.first} ${p.last}`,s:`${role(p)} · ${p.alive?An(p.age):(p.gender==='F'?'décédée':'décédé')}${wTag(L,p)}`,right:p.alive?mini(p.rel):'',a:()=>pushPanel(()=>pPerson(p.id))})));
  }
  return {title:'Relations',html:hint('rel','Touche une personne pour passer du temps avec elle. Une relation qu’on néglige s’abîme !','💞')+h};
}
function pPerson(id){
  const L=cur();const p=byId(L,id);if(!p)return {title:'Relations',html:note('Cette personne ne fait plus partie de ta vie.')};
  const name=p.type==='pet'?p.first:`${p.first} ${p.last}`;const head=personProfile(L,p);
  if(!p.alive)return {title:role(p),html:head+group('Souvenir',[act(L,{ic:'💐',t:'Fleurir sa tombe',s:'20 €',cost:20,key:'tomb'+id,fn:L=>{chg(L,{happy:3});return out(L,`Tu déposes des fleurs pour ${p.first}.`)}})])};
  const H=[];const g=(t,amt,d)=>act(L,{ic:'🎁',t,s:fmt(amt),cost:amt,min:6,key:'g'+id,fn:L=>{p.rel=clamp(p.rel+d);track(L,'given',amt);return out(L,`${p.first} adore ton cadeau.`)}});
  if(p.type==='pet'){
    H.push(act(L,{ic:'🎾',t:`Jouer avec ${p.first}`,key:'t'+id,fn:L=>{p.rel=clamp(p.rel+8);chg(L,{happy:R(3,6)});return out(L,`Tu joues avec ${p.first}. Bonheur total.`)}}));
    if(['Chien','Cheval','Chèvre naine'].includes(p.species))H.push(act(L,{ic:'🌳',t:'Partir en balade',key:'w'+id,fn:L=>{p.rel=clamp(p.rel+6);chg(L,{health:2,happy:3});return out(L,`Longue balade avec ${p.first}.`)}}));
    H.push(act(L,{ic:'🦴',t:'Acheter des friandises',s:'15 €',cost:15,key:'g'+id,fn:L=>{p.rel=clamp(p.rel+5);return out(L,`${p.first} engloutit tout en trois secondes.`)}}));
    H.push(act(L,{ic:'💉',t:'Visite chez le vétérinaire',s:'80 €',cost:80,key:'v'+id,fn:L=>{p.max+=chance(.5)?1:0;return out(L,`${p.first} est en pleine forme.`)}}));
    H.push(row({ic:'🏠',t:'Confier à un refuge',danger:1,a:()=>pushPanel(confirmP(`Confier ${p.first} à un refuge ?`,'Tu ne le reverras pas.',()=>{L.family=L.family.filter(x=>x.id!==id);STACK.pop();chg(L,{karma:-3,happy:-4});return out(L,`Tu confies ${p.first} à la SPA.`)}))}));
  }else{
    H.push(act(L,{ic:'☕',t:'Passer du temps ensemble',key:'t'+id,fn:L=>spendTime(L,p)}));
    H.push(act(L,{ic:'💬',t:'Discuter',key:'d'+id,fn:L=>{p.rel=clamp(p.rel+R(1,5));return out(L,`Bonne conversation avec ${p.first}.`)}}));
    H.push(act(L,{ic:'🌷',t:'Faire un compliment',key:'c'+id,fn:L=>{p.rel=clamp(p.rel+R(1,4));return out(L,`${p.first} est touché par ton compliment.`)}}));
    H.push(g('Offrir des chocolats',25,R(2,6)));
    if(L.age>=18&&!L.used['g'+id])H.push(act(L,{ic:'💎',t:'Offrir un cadeau de luxe',s:'1 500 €',cost:1500,key:'g'+id,fn:L=>{p.rel=clamp(p.rel+R(10,18));track(L,'given',1500);return out(L,`${p.first} n’en revient pas.`)}}));
    if((p.type==='parent'||p.type==='grand')&&L.age<30)H.push(act(L,{ic:'💶',t:'Demander de l’argent',key:'m'+id,fn:L=>{if(chance(p.rel/140)){const v=L.age<18?R(10,150):R(200,3000)*(L.royal?10:1);L.money+=v;return out(L,`${p.first} te donne ${fmt(v)}.`)}p.rel=clamp(p.rel-4);return out(L,`${p.first} refuse.`)}}));
    if(p.type==='child'){
      if(L.age>=18)H.push(act(L,{ic:'💶',t:'Lui donner 1 000 €',cost:1000,key:'m'+id,fn:L=>{p.rel=clamp(p.rel+10);track(L,'given',1000);return out(L,`${p.first} te remercie.`)}}));
      if(p.age<18)H.push(act(L,{ic:'📖',t:'L’aider à faire ses devoirs',key:'h'+id,fn:L=>{p.smarts=clamp(p.smarts+R(2,6));p.rel=clamp(p.rel+3);return out(L,`Tu aides ${p.first} avec ses fractions.`)}}));
    }
    if(p.type==='ex')H.push(act(L,{ic:'🔁',t:'Tenter de te remettre ensemble',key:'x2'+id,dis:L.partner?'Tu es déjà en couple':'',fn:L=>{if(chance(p.rel/90)){const q=Object.assign({},p);L.family=L.family.filter(x=>x.id!==id);setPartner(L,q);STACK.pop();return out(L,`💕 Vous vous remettez ensemble, ${q.first} et toi.`)}p.rel=clamp(p.rel-5);return out(L,`${p.first} refuse.`)}}));
    if(p.type==='enemy')H.push(act(L,{ic:'🕊️',t:'Faire la paix',key:'peace'+id,fn:L=>{if(chance(.5)){p.type='friend';p.rel=45;return out(L,`Vous enterrez la hache de guerre, ${p.first} et toi.`)}return out(L,`${p.first} te tourne le dos.`)}}));
    H.push(act(L,{ic:'🤡',t:'Faire une farce',key:'f'+id,fn:L=>{if(chance(.5)){p.rel=clamp(p.rel+3);chg(L,{happy:4});return out(L,`${p.first} rit de bon cœur.`)}p.rel=clamp(p.rel-8);return out(L,`${p.first} ne trouve pas ça drôle du tout.`)}}));
    H.push(act(L,{ic:'💢',t:'Se disputer',key:'x'+id,fn:L=>{p.rel=clamp(p.rel-R(6,15));chg(L,{happy:-2});return out(L,`Dispute houleuse avec ${p.first}.`)}}));
    H.push(act(L,{ic:'🗯️',t:'L’insulter',key:'i'+id,fn:L=>{p.rel=clamp(p.rel-R(12,25));chg(L,{karma:-3});return out(L,`Tu traites ${p.first} de tous les noms.`)}}));
    if(p.type==='friend')H.push(row({ic:'🚪',t:'Mettre fin à l’amitié',danger:1,a:()=>pushPanel(confirmP('Mettre fin à l’amitié ?',`Tu ne verras plus ${p.first}.`,()=>{L.family=L.family.filter(x=>x.id!==id);STACK.pop();return out(L,`Tu coupes les ponts avec ${p.first}.`)}))}));
  }
  for(const r of modCall('personRows',L,p))H.push(...[].concat(r));
  H.push(nav('✨','Modifier (mode Dieu)','Relation, apparence, intelligence',pGodPerson(id)));
  return {title:p.type==='pet'?p.species:role(p),html:head+group('Actions',H)};
}

/* ---------- Activités ---------- */
const ACT_CATS=[['coeur','💘','Cœur et amis'],['corps','🧘','Corps et santé'],['loisirs','🎉','Loisirs et sorties'],['argent','💰','Argent et jeux'],['pouvoir','🏛️','Pouvoir et influence'],['ombre','🕶️','Zone d’ombre'],['demarches','🗂️','Démarches'],['outils','✨','Outils']];
const ACT_MAP={'Bourse':'argent','Zoo':'argent','Loto progressif':'argent','Marché noir':'ombre','Service de renseignement':'ombre','Le milieu':'ombre','Politique':'pouvoir','Mouvement spirituel':'pouvoir','Entreprise':'pouvoir','Chirurgien esthétique':'corps','Jeux et loisirs':'loisirs'};
function actItems(L){
  const it=[['coeur','💘','Amour','Rencontres et appli',pLove,14],['coeur','📱','Réseaux sociaux','Abonnés, partenariats, certification',pSocial,13],['coeur','🐾','Animaux','Refuge et animalerie',pPetShop,8],['coeur','👶','Fertilité et adoption','FIV, adoption',pFert,18],['coeur','🤝','Bénévolat','Donner de ton temps',null,12],
    ['corps','🧘','Corps et esprit','Sport, méditation, coiffeur',pMind,4],['corps','🩺','Santé','Médecin, hôpital, psy, chirurgie',pHealth,0],['corps','💊','Désintox','Soigner une dépendance',pRehab,14],
    ['loisirs','🎓','Leçons et loisirs','Musique, danse, sport, arts',pLessons,4],['loisirs','🎉','Sorties','Soirées, festivals, cinéma',pOut,10],['loisirs','✈️','Vacances','Douze destinations',pVac,18],
    ['argent','🎰','Casino','Blackjack, roulette, courses',pCasino,18],['argent','🎟️','Loterie','Loto, EuroMillions, grattage',pLotto,18],
    ['ombre','🦹','Crimes','Petits et gros coups',pCrime,10],
    ['demarches','🚘','Permis et licences','Voiture, bateau, avion',pLic,16],['demarches','🪪','Identité','Nom, genre',pIdentity,16],['demarches','🌍','Émigrer','Changer de pays',pEmigrate,18],['demarches','📜','Testament','Choisir ton héritier',pWill,18],['demarches','⚖️','Procès','Porter plainte',pLaw,18],
    ['outils','⏳','Machine à remonter le temps','Reviens en arrière',pTime,0],['outils','✨','Mode Dieu','Tout modifier, gratuitement',pGod,0]];
  if(L.royal&&!L.royal.exiled)it.push(['pouvoir','👑','Devoirs royaux',royalTitle(L),pRoyal,0]);
  for(const x of modCall('activities',L).flat())it.push([ACT_MAP[x.t]||'loisirs',x.ic,x.t,x.s,x.panel,x.min||0]);
  return it;
}
function actRow(L,[c,ic,t,s,f,min]){return f?act(L,{ic,t,s,min,nav:f}):act(L,{ic,t,s,min,key:'benevolat',fn:L=>{chg(L,{karma:R(4,8),happy:3});return out(L,pick(['Tu sers des repas aux Restos du Cœur.','Tu donnes des cours de lecture à des enfants.','Tu nettoies une plage avec une association.','Tu promènes les chiens de la SPA.']))}})}
const actCatPanel=id=>()=>{const L=cur();const cat=ACT_CATS.find(c=>c[0]===id);const its=actItems(L).filter(i=>i[0]===id);return {title:cat[2],html:group('',its.map(i=>actRow(L,i)))}};
/* Les catégories avancées (argent, pouvoir, zone d'ombre, outils) sont rangées derrière « Plus d'aventures ». */
const ACT_ADV=['argent','pouvoir','ombre','outils'];
function actCatTile(L,items,id){const cat=ACT_CATS.find(c=>c[0]===id);if(!cat)return '';const av=items.filter(i=>i[0]===id&&(i[5]||0)<=L.age);if(!av.length)return '';const names=av.map(i=>i[2]);return tile({ic:cat[1],t:cat[2],s:names.slice(0,3).join(', ')+(names.length>3?'…':''),a:()=>pushPanel(actCatPanel(id))})}
function pAdventures(){const L=cur();const items=actItems(L);return {title:'Plus d’aventures',html:note('Argent, pouvoir, zones d’ombre, outils… à découvrir quand tu te sens prêt.')+tiles(ACT_ADV.map(id=>actCatTile(L,items,id)))}}
function pAct(){
  const L=cur();if(L.prison)return pPrison();
  const items=actItems(L);
  const rec=(RECENTS[G.turn]||[]).map(x=>tile({ic:x.ic,t:x.t,s:'Utilisé récemment',a:()=>pushPanel(x.f)}));
  const adv=ACT_ADV.filter(id=>actCatTile(L,items,id));
  const ts=ACT_CATS.filter(c=>!ACT_ADV.includes(c[0])).map(c=>actCatTile(L,items,c[0]));
  if(adv.length)ts.push(tile({ic:'🧭',t:'Plus d’aventures',s:adv.map(id=>ACT_CATS.find(c=>c[0]===id)[2]).join(', '),a:()=>pushPanel(pAdventures)}));
  const sug=actPick(L,items).map(([i,why])=>tile({ic:i[1],t:i[2],s:why,a:()=>pushPanel(i[4])}));
  return {title:'Activités',html:hint('act','« Juste pour toi » propose les idées du moment. Le reste est rangé par catégorie.','🎯')+(sug.length?`<h3 class="sec">Juste pour toi</h3>${tiles(sug)}`:'')+(rec.length?`<h3 class="sec">Récents</h3>${tiles(rec)}`:'')+`<h3 class="sec">Tout</h3>`+tiles(ts)};
}
/* Suggestions du moment, d’après la situation du personnage. */
function actPick(L,items){
  const by=n=>items.find(i=>i[2]===n&&i[4]&&(i[5]||0)<=L.age);const out=[];
  const add=(n,ok,why)=>{const i=ok&&by(n);if(i&&!out.some(o=>o[0]===i))out.push([i,why])};
  add('Santé',L.ill.length>0,'Tu ne te sens pas bien');
  add('Amour',!L.partner&&L.age>=14&&L.age<85,'Tu es célibataire');
  add('Leçons et loisirs',L.age>=4&&L.age<22,'Développe tes talents');
  add('Sorties',L.st.happy<55&&L.age>=10,'Un petit coup de blues ?');
  add('Corps et esprit',L.st.health<60,'Reprends des forces');
  add('Réseaux sociaux',L.age>=13&&!L.social.verified,'Gagne en notoriété');
  add('Bourse',L.age>=20&&L.money>25000,'Fais travailler ton argent');
  add('Entreprise',L.age>=22&&L.money>80000&&!L.job,'Lance ta société');
  add('Vacances',L.age>=18&&L.money>4000,'Tu as de quoi te faire plaisir');
  return out.slice(0,3);
}
function pLove(){const L=cur();return {title:'Amour',html:group('',[act(L,{ic:'💘',t:'Appli de rencontre',s:'Fais défiler les profils',min:14,dis:(L.used.love||0)>=4?'Plus de profils cette année':L.partner?'Tu es en couple (tu peux quand même regarder…)':'',fn:L=>{findLove(L)}}),act(L,{ic:'🍸',t:'Speed dating',s:'30 €',cost:30,min:18,key:'speed',fn:L=>{findLove(L);return ''}}),act(L,{ic:'💋',t:'Tenter de séduire un inconnu au bar',min:18,key:'bar_love',fn:L=>{findLove(L);return ''}})])}}
function pMind(){
  const L=cur();
  return {title:'Corps et esprit',html:group('',[
    act(L,{ic:'🏋️',t:'Salle de sport',s:'Santé et apparence',min:12,key:'gym',fn:L=>{chg(L,{health:R(2,6),looks:R(0,3),happy:1,athletic:2});return out(L,pick(['Séance jambes. Tu ne sens plus tes cuisses.','Tu cours 5 km sur le tapis.','Cours de boxe : tu te défoules.']))}}),
    act(L,{ic:'🧘',t:'Yoga',s:'Santé et bonheur',min:10,key:'yoga',fn:L=>{chg(L,{health:R(1,4),happy:R(2,5),stress:-R(4,9)});return out(L,'Salutation au soleil. Tu respires enfin.')}}),
    act(L,{ic:'🕉️',t:'Méditation',s:'Bonheur et volonté',min:8,key:'med',fn:L=>{chg(L,{happy:R(3,7),willpower:2,stress:-R(5,12)});return out(L,'Vingt minutes de méditation en pleine conscience.')}}),
    act(L,{ic:'📚',t:'Bibliothèque',s:'Intelligence',min:5,key:'lib',fn:L=>{chg(L,{smarts:R(1,5)});return out(L,pick(['Tu dévores un roman de Zola.','Tu lis un livre d’astrophysique.','Tu empruntes trois BD et un essai.','Tu relis Le Petit Prince.']))}}),
    act(L,{ic:'🚶',t:'Promenade',s:'Un peu de tout',min:4,key:'walk',fn:L=>{chg(L,{health:1,happy:2});return out(L,'Une longue promenade au grand air.')}}),
    act(L,{ic:'🥗',t:'Changer d’alimentation',min:14,key:'diet',fn:L=>{modal({title:'Régime',text:'Quel régime adoptes-tu ?',choices:[['Équilibré',{health:4}],['Végétarien',{health:3,karma:2}],['Sans sucre',{health:3,looks:1,happy:-2}],['Malbouffe assumée',{happy:5,health:-4}]].map(([t,d])=>({t,fn:()=>{chg(L,d);return out(L,`Tu adoptes un régime : ${t.toLowerCase()}.`)}}))})}}),
    act(L,{ic:'💇',t:'Salon de coiffure',s:'Nouvelle coupe, nouvelle couleur, nouveau style',min:8,nav:pLook('self')}),
    act(L,{ic:'💆',t:'Journée au spa',s:'250 €',cost:250,min:16,key:'spa',fn:L=>{chg(L,{happy:R(5,9),looks:1,stress:-R(6,12)});return out(L,'Hammam, massage et peignoir moelleux.')}})])};
}
const LESSON_IC={musique:'🎸',danse:'💃',comedie:'🎭',mannequinat:'📸',peinture:'🎨',ecriture:'✍️',cuisine:'🍳',sport:'⚽',sciences:'🔬'};
function lessonRow(L,Ls){return act(L,{ic:LESSON_IC[Ls.t]||'➕',t:Ls.n,s:`${TALENTS[Ls.t]}${L.talent===Ls.t?' · ton talent !':''}${L.skills[Ls.k]?` · niveau ${L.skills[Ls.k]} %`:''}`,min:Ls.min,dis:L.lessons.length>=3?'Trois leçons maximum':L.prison?'En prison':'',fn:L=>{L.lessons.push(Ls.k);return out(L,`Tu t’inscris : ${Ls.n.toLowerCase()}.`)}})}
function pLessons(){
  const L=cur();const free=LESSONS.filter(Ls=>!L.lessons.includes(Ls.k)&&(Ls.min||0)<=L.age);
  const types=[...new Set(free.map(Ls=>Ls.t))];
  const mine=L.talent?free.filter(Ls=>Ls.t===L.talent):[];
  return {title:'Leçons et loisirs',html:note(`Les leçons progressent chaque année. ${L.age<18?'Tes parents paient.':'Chaque leçon coûte 600 € par an.'} Trois leçons maximum en même temps.`)
    +group('Mes leçons',L.lessons.map(k=>{const Ls=LESSONS.find(x=>x.k===k);return row({ic:LESSON_IC[Ls.t]||'🎯',t:Ls.n,s:`Niveau ${L.skills[k]||0} %${Ls.belt?` · ceinture ${BELTS[Math.min(6,Math.floor((L.skills[k]||0)/15))]}`:''} · touche pour arrêter`,a:()=>run(()=>{L.lessons=L.lessons.filter(x=>x!==k);return `Tu arrêtes : ${Ls.n.toLowerCase()}.`})})}))
    +group('Ton talent',mine.map(Ls=>lessonRow(L,Ls)))
    +(types.length?`<h3 class="sec">S’inscrire</h3>`+tiles(types.map(t=>ntile(LESSON_IC[t]||'➕',TALENTS[t],`${free.filter(Ls=>Ls.t===t).length} activité${free.filter(Ls=>Ls.t===t).length>1?'s':''}`,()=>pLessonsType(t)))):'')};
}
function pLessonsType(t){const L=cur();return {title:TALENTS[t]||'Leçons',html:group('',LESSONS.filter(Ls=>Ls.t===t&&!L.lessons.includes(Ls.k)).map(Ls=>lessonRow(L,Ls)))}}
function pHealth(){
  const L=cur();const ill=L.ill.map(k=>DIS[k].n).join(', ');
  return {title:'Santé',html:(ill?note(`À soigner : ${ill}.`):'')+group('Soins',[
    act(L,{ic:'🩺',t:'Médecin généraliste',s:'25 € avec la carte Vitale',key:'doc',fn:L=>{if(L.age>=18)L.money-=25;return cureTry(L,1,'Le médecin')}}),
    act(L,{ic:'🏥',t:'Hôpital',s:'300 € · meilleures chances de guérison',min:0,cost:L.age>=18?300:0,key:'hosp',fn:L=>cureTry(L,1.4,'L’hôpital')}),
    act(L,{ic:'🛋️',t:'Psychologue',s:'60 € · bonheur et santé mentale',cost:L.age>=18?60:0,min:6,key:'psy',fn:L=>{chg(L,{happy:R(4,10)});const m=L.ill.filter(k=>DIS[k].mental&&chance(.5));L.ill=L.ill.filter(k=>!m.includes(k));return out(L,m.length?`Les séances t’aident à surmonter ${m.map(k=>DIS[k].n).join(', ')}.`:'Tu vides ton sac. Ça fait du bien.')}}),
    act(L,{ic:'🪄',t:'Rebouteux',s:'40 € · méthodes douteuses',cost:40,min:10,key:'rebout',fn:L=>{const r=Math.random();if(r<.3&&L.ill.length){const k=L.ill.shift();return out(L,`Miracle : le rebouteux te guérit de ${DIS[k].n}.`)}if(r<.6){chg(L,{health:-5});return out(L,'Sa tisane te rend malade comme un chien.')}return out(L,'Il fait des gestes étranges au-dessus de ta tête. Aucun effet.')}}),
    act(L,{ic:'🦷',t:'Dentiste',s:'50 €',cost:50,min:4,key:'dent',fn:L=>{chg(L,{looks:1,health:1});return out(L,'Aucune carie. Bravo.')}})])
    +group('Chirurgie esthétique',SURGERIES.map(([n,p,z])=>act(L,{ic:'💉',t:n,s:fmt(p),cost:p,min:18,key:'surg',fn:L=>{if(chance(.12)){chg(L,{looks:-R(6,14),happy:-6});return out(L,`${n} : l’opération a mal tourné.`)}chg(L,{looks:R(4,12),happy:4});return out(L,`${n} : le résultat est bluffant pour ${z}.`)}})))};
}
function cureTry(L,m,who){if(!L.ill.length){chg(L,{health:R(0,3)});return out(L,`${who} te trouve en pleine forme.`)}const cured=L.ill.filter(k=>chance(Math.min(.97,DIS[k].cure*m)));L.ill=L.ill.filter(k=>!cured.includes(k));chg(L,{health:R(1,5)});return out(L,cured.length?`Guérison : ${cured.map(k=>DIS[k].n).join(', ')}.`:'Le traitement n’a pas encore fait effet.')}
function pRehab(){const L=cur();const a=Object.entries(L.addict).filter(([,v])=>v>20);return {title:'Désintox',html:(a.length?'':note('Tu n’as aucune dépendance sérieuse.'))+group('Cures',[act(L,{ic:'💊',t:'Cure de désintoxication',s:'5 000 € · un mois en clinique',cost:5000,dis:!a.length?'Aucune dépendance':'',key:'rehab',fn:L=>{let m=[];for(const [k,v] of a){if(chance(.4+L.hid.willpower/200)){L.addict[k]=Math.max(0,v-R(40,70));m.push(k)}}chg(L,{health:5});return out(L,m.length?'Cure réussie. Tu reprends le contrôle.':'Tu rechutes à la sortie de la clinique.')}}),act(L,{ic:'🫂',t:'Groupe de parole',s:'Gratuit',dis:!a.length?'Aucune dépendance':'',key:'aa',fn:L=>{for(const [k] of a)L.addict[k]=clamp(L.addict[k]-R(5,15));chg(L,{willpower:3});return out(L,'Tu partages ton histoire. Les autres t’écoutent.')}})])}}
function drink(L,n){L.addict.alcool=clamp(L.addict.alcool+n*(L.hid.willpower<40?2:1))}
function pOut(){
  const L=cur();
  return {title:'Sorties',html:group('',[
    act(L,{ic:'🥳',t:'Soirée chez des amis',s:'Bonheur et rencontres',min:14,key:'party',fn:L=>{chg(L,{happy:R(4,9)});const r=Math.random();if(L.age>=16&&r<.15){drink(L,8);chg(L,{health:-5});return out(L,'Tu as trop bu. Gueule de bois carabinée.')}if(r<.4&&!L.partner&&(L.used.love||0)<4&&L.age>=15){findLove(L);return out(L,'Quelqu’un te tape dans l’œil…')}if(r<.6){const f=addFriend(L);return out(L,`Tu sympathises avec ${f.first}.`)}return out(L,'Super soirée, tu danses jusqu’à l’aube.')}}),
    act(L,{ic:'🪩',t:'Boîte de nuit',s:'25 € l’entrée',cost:25,min:18,key:'club',fn:L=>{modal({title:'En boîte',text:'Que fais-tu ?',choices:[{t:'Danser toute la nuit',fn:()=>{chg(L,{happy:7,health:1});return out(L,'Tu danses jusqu’à la fermeture.')}},{t:'Enchaîner les verres',fn:()=>{drink(L,10);chg(L,{happy:6,health:-4});return out(L,'La nuit est floue. Très floue.')}},{t:'Draguer',fn:()=>{findLove(L);return ''}}]})}}),
    act(L,{ic:'🍺',t:'Bar avec des amis',s:'40 €',cost:40,min:18,key:'bar',fn:L=>{drink(L,4);chg(L,{happy:5});friends(L).slice(0,3).forEach(f=>f.rel=clamp(f.rel+4));return out(L,'Apéro en terrasse jusqu’à la nuit tombée.')}}),
    act(L,{ic:'🎬',t:'Cinéma',s:'12 €',cost:12,min:5,key:'cine',fn:L=>{const [m,h]=pick(MOVIES);chg(L,{happy:h+2});return out(L,`Tu vas voir ${m} au cinéma.`)}}),
    act(L,{ic:'🎸',t:'Festival',min:15,key:'fest',fn:L=>{modal({title:'Festival',text:'Quel festival ?',choices:FESTIVALS.map(([n,p])=>({t:`${n}${p?` (${p} €)`:' (gratuit)'}`,fn:()=>{if(L.money<p)return 'Fonds insuffisants.';L.money-=p;chg(L,{happy:R(6,12)});if(chance(.3)){const f=addFriend(L);return out(L,`${n} : concerts géniaux, et tu rencontres ${f.first}.`)}return out(L,`${n} : trois jours de concerts mémorables.`)}}))})}}),
    act(L,{ic:'🎭',t:'Théâtre',s:'35 €',cost:35,min:8,key:'theatre',fn:L=>{chg(L,{happy:4,smarts:2});return out(L,`Tu vas voir ${pick(['Cyrano de Bergerac','Le Misanthrope','une pièce de boulevard','En attendant Godot'])}.`)}})])};
}
function pVac(){const L=cur();return {title:'Vacances',html:note('Un grand voyage par an.')+group('Destinations',VACATIONS.map(([d,c,h,txt])=>act(L,{ic:'✈️',t:d,s:fmt(c*costOf(L)),cost:Math.round(c*costOf(L)),key:'vac',dis:L.prison?'En prison':'',fn:L=>{chg(L,{happy:h,health:2,stress:-R(8,18)});track(L,'trips');STACK.pop();if(chance(.08)){chg(L,{health:-6});return out(L,`${d} : ${txt} Mais tu attrapes une intoxication alimentaire.`)}if(!L.partner&&chance(.12)&&L.age>=18){const p=person(likeG(L),L.age+R(-5,5),null,pick(Object.keys(COUNTRIES)));p.job='rencontré en voyage';findLove(L,p)}return out(L,`🌴 ${d} : ${txt}`)}})))}}
function pCasino(){
  const L=cur();const tick=()=>{L.addict.jeu=clamp(L.addict.jeu+(L.hid.willpower<40?3:1));track(L,'gamble')};
  return {title:'Casino',html:note('Le jeu peut créer une dépendance.')+group('Blackjack',[100,1000,10000].map(b=>act(L,{ic:'🃏',t:`Table à ${fmt(b)}`,cost:b,fn:L=>{tick();gBlackjack(L,b)}})))
    +group('Roulette (rouge)',[100,1000,10000,100000].map(b=>act(L,{ic:'🎡',t:`Miser ${fmt(b)}`,cost:b,fn:L=>{tick();if(chance(18/37)){L.money+=2*b;if(b>=10000)say(L,`🎡 Rouge ! Tu gagnes ${fmt(b)} au casino.`);return `Rouge ! Tu gagnes ${fmt(b)}.`}if(b>=10000)say(L,`🎡 Noir… Tu perds ${fmt(b)} au casino.`);return `Noir… Tu perds ${fmt(b)}.`}})))
    +group('Machines à sous',[10,100,1000].map(b=>act(L,{ic:'🎰',t:`Mise de ${fmt(b)}`,cost:b,fn:L=>{tick();gSlots(L,b)}})))
    +group('Courses hippiques',[20,200,2000].map(b=>act(L,{ic:'🐎',t:`Parier ${fmt(b)}`,cost:b,fn:L=>{tick();gHorses(L,b)}})))};
}
function pLotto(){
  const L=cur();
  const draw=(cost,odds,lo,hi,name)=>L=>{const r=Math.random();if(r<odds){const g=R(lo,hi);L.money+=g;chg(L,{happy:30});track(L,'jackpot');return out(L,`🎉 JACKPOT ! Tu gagnes ${fmt(g)} au ${name} !`)}if(r<1/150){const g=R(100,3000);L.money+=g;return out(L,`Tu gagnes ${fmt(g)} au ${name}.`)}if(r<.1){L.money+=cost*2;return `Petit gain : ${fmt(cost*2)}.`}return 'Perdu. Pas cette fois.'};
  return {title:'Loterie',html:group('',[act(L,{ic:'🎱',t:'Loto',s:'2,20 € la grille',cost:2.2,fn:draw(2.2,1/5000,2e6,15e6,'Loto')}),act(L,{ic:'⭐',t:'EuroMillions',s:'2,50 € la grille',cost:2.5,fn:draw(2.5,1/12000,17e6,150e6,'EuroMillions')}),act(L,{ic:'🪙',t:'Jeu à gratter',s:'5 €',cost:5,fn:L=>{gScratch(L)}})])};
}
function trial(L,C){
  modal({title:'Au tribunal',icon:'⚖️',text:`Tu comparais pour ${C.n.toLowerCase()}. Que fais-tu ?`,choices:[
    {t:'Plaider coupable',fn:()=>sentence(L,C,.7)},
    {t:'Plaider non coupable',fn:()=>chance(.35)?out(L,`${ge(L,'Acquitté','Acquittée')} faute de preuves !`):sentence(L,C,1.2)},
    {t:`Prendre un avocat commis d’office`,fn:()=>chance(.25)?out(L,'Ton avocat obtient la relaxe.'):sentence(L,C,.9)},
    {t:`Engager un ténor du barreau (${fmt(C.lawyer)})`,fn:()=>{L.money-=C.lawyer;return chance(.6)?out(L,'Ton avocat obtient la relaxe.'):sentence(L,C,.8)}}]});
}
function sentence(L,C,m){
  const yrs=Math.round(R(C.jail[0],C.jail[1])*m);L.record++;
  if(yrs<=0){L.money-=C.fine;return out(L,`Tu écopes d’une amende de ${fmt(C.fine)}.`)}
  L.flags.appeal=0;
  if(L.age<18){const y=Math.min(2,yrs);L.prison=y;return out(L,`Tu es ${ge(L,'placé','placée')} en centre éducatif fermé pour ${An(y)}.`)}
  L.prison=yrs;const lost=jobOk(L)||L.part;if(jobOk(L))L.job=null;L.part=null;modCall('jailed',L);
  if(L.partner&&L.partner.link==null&&chance(.4))breakUp(L,`${partnerOf(L).first} te quitte pendant le procès.`);
  return out(L,`⛓️ Tu es ${ge(L,'condamné','condamnée')} à ${An(yrs)} de prison ferme.${lost?' Tu perds ton emploi.':''}`);
}
function doCrime(L,C){
  if(C.game==='burglary'){gBurglary(L,C);return ''}
  const p=C.p+(C.smart?(L.st.smarts-50)/200:0)+(L.hid.crazy-50)/400+(L.hid.crime||0)/400+(L.talent==='crime'?.12:0);chg(L,{crime:R(2,6)});
  if(chance(p)){const g=C.gain[1]?R(C.gain[0],C.gain[1]):0;L.money+=g;chg(L,{karma:-6,happy:3});track(L,'crimes');return out(L,g?`${C.ic} ${C.n} réussi : tu empoches ${fmt(g)}.`:`${C.ic} ${C.n} : personne ne t’a vu.`)}
  track(L,'crimes');chg(L,{karma:-4,happy:-8});say(L,`🚔 ${C.n} raté. Tu es ${ge(L,'arrêté','arrêtée')} par la police.`);
  trial(L,C);return '';
}
function pCrime(){const L=cur();return {title:'Crimes',html:note('Chaque délit peut rapporter gros, ou finir au tribunal. Un casier judiciaire ferme certains métiers.')+group('Délits',CRIMES.map(C=>act(L,{ic:C.ic,t:C.n,s:C.gain[1]?`Gain : ${fmt(C.gain[0])} à ${fmt(C.gain[1])}`:'Pour le frisson',min:C.min,key:'crime_'+C.k,dis:C.needJob&&!jobOk(L)?'Il te faut un emploi':C.needMoney&&L.money<C.needMoney?`Il faut au moins ${fmt(C.needMoney)}`:'',fn:L=>doCrime(L,C)})))}}
function pPrison(){
  const L=cur();
  return {title:'Prison',html:card('Détention',`Peine restante : ${An(L.prison)}`,L.jail.gang?`Membre de ${L.jail.gang}`:'Tu ne fais partie d’aucun gang','')+group('En détention',[
    act(L,{ic:'😇',t:'Bonne conduite',s:'Chance de remise de peine',key:'gc',fn:L=>{if(chance(.3)){L.prison=Math.max(0,L.prison-1);return out(L,L.prison?`Remise de peine d’un an. Encore ${An(L.prison)}.`:'Remise de peine : tu es libre !')}return out(L,'Le juge d’application des peines reste de marbre.')}}),
    act(L,{ic:'💪',t:'Musculation dans la cour',key:'gym',fn:L=>{chg(L,{health:R(2,6),looks:R(0,3),athletic:2});return out(L,'Pompes, tractions, gainage. Tu prends du muscle.')}}),
    act(L,{ic:'📚',t:'Bibliothèque de la prison',key:'lib',fn:L=>{chg(L,{smarts:R(2,5)});return out(L,'Tu lis Le Comte de Monte-Cristo. Inspirant.')}}),
    act(L,{ic:'🎓',t:'Passer un diplôme en détention',key:'dip',dis:hasDeg(L,'bac')?'Tu as déjà le bac':'',fn:L=>{if(chance(L.st.smarts/120)){L.edu.degrees.push('bac');return out(L,'🎓 Tu obtiens ton bac en prison !')}return out(L,'Tu échoues à l’examen.')}}),
    act(L,{ic:'⚖️',t:'Faire appel',s:'Avocat : 2 500 €',cost:2500,dis:L.flags.appeal?'Appel déjà tenté':'',fn:L=>{L.flags.appeal=1;if(chance(.3)){L.prison=Math.ceil(L.prison/2);return out(L,`Appel gagné : ta peine passe à ${An(L.prison)}.`)}return out(L,'Appel rejeté.')}}),
    act(L,{ic:'🗝️',t:'Tenter de t’évader',s:'Mini-jeu : trouve la sortie sans croiser les gardiens',key:'esc',danger:1,fn:L=>{gEscape(L)}})])};
}
function pLic(){
  const L=cur();
  const lic=(k,n,cost,min,p,txt)=>act(L,{ic:'🪪',t:n,s:fmt(cost),cost,min,key:'lic_'+k,dis:L.lic[k]?'Déjà obtenu':L.prison?'En prison':'',fn:L=>{if(chance(p)){L.lic[k]=true;chg(L,{happy:6});return out(L,`🪪 ${txt}`)}return out(L,`${ge(L,'Recalé','Recalée')} à l’examen. Réessaie l’an prochain.`)}});
  return {title:'Permis et licences',html:group('',[lic('car','Permis de conduire (B)',1600,18,.45+L.st.smarts/300,'Permis B en poche !'),lic('boat','Permis bateau',450,16,.7+L.st.smarts/400,'Permis bateau obtenu.'),lic('pilot','Licence de pilote privé',12000,17,.3+L.st.smarts/200,'Licence de pilote obtenue. Le ciel est à toi.')])};
}
function pFert(){
  const L=cur();const p=partnerOf(L);
  return {title:'Fertilité et adoption',html:group('',[
    act(L,{ic:'🧪',t:'Fécondation in vitro (FIV)',s:'5 000 € · avec ton partenaire ou un donneur',cost:5000,min:18,key:'ivf',dis:L.gender==='H'&&(!p||p.gender==='H')?'Il faut une personne pour porter l’enfant':'',fn:L=>tryBaby(L,true)}),
    act(L,{ic:'❄️',t:'Congeler tes ovocytes',s:'3 000 € · préserve ta fertilité',cost:3000,min:25,dis:L.gender!=='F'?'Réservé aux femmes':L.flags.eggs?'Déjà fait':'',fn:L=>{L.flags.eggs=1;L.hid.fertility=clamp(L.hid.fertility+20);return out(L,'Tes ovocytes sont conservés pour plus tard.')}}),
    act(L,{ic:'🧸',t:'Adopter un enfant',s:'Frais de procédure : 8 000 €',cost:8000,min:21,key:'adopt',fn:adoptChild})])};
}
function pPetShop(){const L=cur();return {title:'Animaux',html:note(L.age<18?'Tes parents paient, s’ils sont d’accord.':'Chaque animal a sa propre espérance de vie.')+group('Adopter',Object.entries(PETS).map(([sp,[c]])=>act(L,{av:`<span class="pet">${PET_IC[sp]||'🐾'}</span>`,t:sp,s:fmt(c),cost:L.age<18?0:c,key:'pet',fn:L=>{if(L.age<18&&!chance(.5)){relParent(L,-2);return out(L,'Tes parents refusent.')}const p=addPet(L,sp);chg(L,{happy:8});trackMax(L,'pets',pets(L).length);return out(L,`🐾 Tu adoptes ${p.first}, ${p.gender==='F'?'une':'un'} ${sp.toLowerCase()}.`)}})))}}
function pLaw(){const L=cur();return {title:'Procès',html:note('Porte plainte et tente d’obtenir des dommages et intérêts.')+group('Poursuivre',LAWSUITS.map(S=>act(L,{ic:'⚖️',t:S.n,s:S.why,key:'law',fn:L=>{modal({title:'Ton avocat',icon:'⚖️',text:`Plainte contre ${S.n.toLowerCase()} pour ${S.why}.`,choices:[['Avocat commis d’office (gratuit)',0,.75],['Avocat réputé (5 000 €)',5000,1],['Ténor du barreau (25 000 €)',25000,1.3]].map(([t,c,m])=>({t,fn:()=>{L.money-=c;if(chance(S.p*m)){const g=R(S.gain[0],S.gain[1]);L.money+=g;return out(L,`⚖️ Procès gagné contre ${S.n.toLowerCase()} : ${fmt(g)} de dommages et intérêts.`)}return out(L,`Procès perdu contre ${S.n.toLowerCase()}.`)}}))})}})))}}
function pWill(){const L=cur();const ks=allKids(L).filter(k=>k.alive);return {title:'Testament',html:note('En France, tes enfants ont toujours droit à une part réservataire. L’héritier désigné reprend tes biens.')+group('Héritier principal',[act(L,{ic:'⚖️',t:'Partage égal (par défaut)',dis:!L.will.heir?'Choix actuel':'',fn:L=>{L.will.heir=null;return 'Testament mis à jour.'}}),...ks.map(k=>act(L,{av:avatar(k),t:`${k.first} ${k.last}`,s:`${role(k)} · ${An(k.age)}`,dis:L.will.heir===k.id?'Héritier désigné':'',fn:L=>{L.will.heir=k.id;return out(L,`📜 Tu désignes ${k.first} comme héritier principal.`)}}))])+group('Dons aux associations',[0,10,25,50].map(p=>act(L,{ic:'🎗️',t:`${p} % de ta fortune`,dis:L.will.charity===p?'Choix actuel':'',fn:L=>{L.will.charity=p;if(p)track(L,'given',Math.round(netWorth(L)*p/100));return 'Testament mis à jour.'}})))}}
function pIdentity(){const L=cur();return {title:'Identité',html:`<div class="card"><div class="two"><label class="f">Prénom<input id="rn-first" value="${esc(L.first)}" autocomplete="off" maxlength="30"></label><label class="f">Nom<input id="rn-last" value="${esc(L.last)}" autocomplete="off" maxlength="30"></label></div></div>`+group('',[row({ic:'🪪',t:'Changer de nom',s:'Démarche en mairie · 50 €',a:()=>{const f=$('#rn-first').value.trim(),l=$('#rn-last').value.trim();if(!f||!l){toast('Indique un prénom et un nom.');return}run(()=>{L.money-=50;L.first=f.slice(0,30);L.last=l.slice(0,30);return out(L,`Tu t’appelles désormais ${L.first} ${L.last}.`)})}}),act(L,{ic:'⚧️',t:'Transition de genre',s:'Parcours médical · 15 000 €',min:18,cost:15000,key:'trans',fn:L=>{L.gender=L.gender==='F'?'H':'F';chg(L,{happy:15});return out(L,`Tu entames ta transition. Tu te sens enfin ${ge(L,'toi-même','toi-même')}.`)}})])}}
/* Émigrer : destinations populaires puis continents (au lieu de 58 pays en vrac). */
const COUNTRY_GROUPS=[['eur1','🇪🇺','Europe de l’Ouest et du Sud',['France','Belgique','Suisse','Monaco','Luxembourg','Italie','Espagne','Portugal','Royaume-Uni','Irlande','Allemagne','Autriche','Pays-Bas','Grèce']],
  ['eur2','🏔️','Europe du Nord et de l’Est',['Suède','Norvège','Danemark','Finlande','Islande','Pologne','Tchéquie','Russie','Ukraine']],
  ['ame','🌎','Amériques',['Canada','États-Unis','Mexique','Cuba','Haïti','Colombie','Pérou','Brésil','Chili','Argentine']],
  ['afr','🌍','Afrique',['Maroc','Algérie','Tunisie','Égypte','Sénégal','Mali','Côte d’Ivoire','Cameroun','Nigeria','RD Congo','Angola','Cap-Vert','Afrique du Sud']],
  ['asie','🌏','Asie et Moyen-Orient',['Turquie','Liban','Jordanie','Arabie saoudite','Émirats arabes unis','Inde','Chine','Corée du Sud','Japon','Vietnam','Thaïlande']],
  ['oce','🏝️','Océanie',['Australie','Nouvelle-Zélande']]];
const POPULAR_COUNTRIES=['Canada','États-Unis','Royaume-Uni','Suisse','Espagne','Japon','Australie','Émirats arabes unis'];
function emigRow(L,c){return act(L,{ic:'🌍',t:c,s:fmt(3000),cost:3000,dis:L.prison?'En prison':'',fn:L=>{L.country=c;L.city=pick(COUNTRIES[c].cities);let lost='';if(jobOk(L)){L.job=null;lost=' Tu quittes ton emploi.'}if(inHigher(L))L.edu.stage='done';L.market=null;L.rent=0;STACK.length=0;closeSheet();track(L,'trips');return out(L,`🌍 Tu t’installes à ${L.city} (${c}).${lost}`)}})}
function pEmigrate(){const L=cur();const has=c=>COUNTRIES[c]&&c!==L.country;
  const listed=new Set(COUNTRY_GROUPS.flatMap(g=>g[3]));const other=Object.keys(COUNTRIES).filter(c=>c!==L.country&&!listed.has(c));
  const groups=other.length?COUNTRY_GROUPS.concat([['autres','🧭','Autres pays',other]]):COUNTRY_GROUPS;
  const ts=groups.map(([id,ic,n,cs])=>{const k=cs.filter(has).length;return k?ntile(ic,n,`${k} pays`,()=>pEmigrateGroup(id)):''});
  return {title:'Émigrer',html:note('Tu quittes ton emploi actuel, sauf si ta carrière dépend de ta notoriété.')+group('Destinations populaires',POPULAR_COUNTRIES.filter(has).slice(0,6).map(c=>emigRow(L,c)))+`<h3 class="sec">Par région</h3>`+tiles(ts)}}
function pEmigrateGroup(id){const L=cur();const all=COUNTRY_GROUPS.concat([['autres','🧭','Autres pays',Object.keys(COUNTRIES).filter(c=>!COUNTRY_GROUPS.some(g=>g[3].includes(c)))]]);const g=all.find(x=>x[0]===id);if(!g)return {title:'Émigrer',html:note('Région introuvable.')};
  return {title:g[2],html:group('',g[3].filter(c=>COUNTRIES[c]&&c!==L.country).map(c=>emigRow(L,c)))}}

/* ---------- Mode Dieu ---------- */
function sliders(list){return list.map(([id,lab,v])=>`<label class="sl" for="g-${id}"><span>${lab}<output id="o-${id}">${v}</output></span><input type="range" id="g-${id}" min="0" max="100" value="${v}"></label>`).join('')}
const bindSliders=b=>b.querySelectorAll('input[type=range]').forEach(r=>r.addEventListener('input',()=>{const o=b.querySelector('#o-'+r.id.slice(2));if(o)o.textContent=r.value}));
const opt=(v,l,s)=>`<option value="${esc(v)}"${String(v)===String(s)?' selected':''}>${esc(l)}</option>`;
function pGod(){
  const L=cur();
  const html=`<div class="card">${sliders([['happy','Bonheur',L.st.happy],['health','Santé',L.st.health],['smarts','Intelligence',L.st.smarts],['looks','Apparence',L.st.looks]])}</div>
  <h3 class="sec">Statistiques cachées</h3><div class="card">${sliders([['fame','Notoriété',L.fame],['karma','Karma',L.hid.karma],['discipline','Discipline',L.hid.discipline],['willpower','Volonté',L.hid.willpower],['fertility','Fertilité',L.hid.fertility],['athletic','Athlétisme',L.hid.athletic],['crazy','Folie',L.hid.crazy],['stress','Stress',L.hid.stress||0],['crime','Crime',L.hid.crime||0]])}</div>
  <h3 class="sec">Identité et apparence</h3><div class="card">
  <label class="f">Argent sur le compte (€)<input id="g-money" type="number" inputmode="numeric" value="${Math.round(L.money)}"></label>
  <div class="two"><label class="f">Prénom<input id="g-first" value="${esc(L.first)}" autocomplete="off"></label><label class="f">Nom<input id="g-last" value="${esc(L.last)}" autocomplete="off"></label></div>
  <div class="two"><label class="f">Genre<select id="g-gender">${opt('F','Femme',L.gender)}${opt('H','Homme',L.gender)}</select></label><label class="f">Attirance<select id="g-likes">${opt('H','Hommes',L.likes)}${opt('F','Femmes',L.likes)}${opt('both','Les deux',L.likes)}</select></label></div>
  <label class="f">Talent<select id="g-talent">${opt('','Aucun',L.talent||'')}${Object.entries(TALENTS).map(([k,n])=>opt(k,n,L.talent)).join('')}</select></label></div>`
  +group('Apparence',[nav('🎨','Modifier ton apparence','Éditeur complet',pLook('self'))])
  +group('',[row({ic:'✨',t:'Appliquer les changements',a:()=>run(()=>{for(const k of ['happy','health','smarts','looks'])L.st[k]=+$('#g-'+k).value;L.fame=+$('#g-fame').value;for(const k of HIDK)L.hid[k]=+$('#g-'+k).value;const m=parseInt($('#g-money').value,10);if(!isNaN(m))L.money=Math.max(-1e9,Math.min(1e12,m));const f=$('#g-first').value.trim(),l=$('#g-last').value.trim();if(f)L.first=f.slice(0,30);if(l)L.last=l.slice(0,30);L.gender=$('#g-gender').value;L.likes=$('#g-likes').value;L.talent=$('#g-talent').value||null;return 'Ta vie a été modifiée.'})})])
  +`<h3 class="sec">Diplômes</h3><div class="card"><div class="two"><select id="g-deg" aria-label="Diplôme">${['bac',...Object.keys(TRADES).map(t=>'cap_'+t),...Object.keys(MAJORS).filter(k=>MAJORS[k].type==='lic').flatMap(k=>['lic_'+k,'master_'+k,'doc_'+k]),...Object.keys(MAJORS).filter(k=>MAJORS[k].type==='ecole')].map(d=>opt(d,degName(d),'')).join('')}</select><button type="button" class="btn" data-a="${A(()=>run(()=>{const d=$('#g-deg').value;if(!L.edu.degrees.includes(d))L.edu.degrees.push(d);if(d!=='bac'&&!d.startsWith('cap_')&&!L.edu.degrees.includes('bac'))L.edu.degrees.push('bac');if(L.age>=18&&!inSchool(L))L.edu.stage='done';return 'Diplôme ajouté.'}))}">Ajouter</button></div></div>`
  +group('Miracles',[
    row({ic:'💊',t:'Guérir toutes les maladies et dépendances',a:()=>run(()=>{L.ill=[];L.addict={alcool:0,jeu:0};L.smoker=false;L.st.health=Math.max(L.st.health,70);return 'Tu es en pleine santé.'})}),
    row({ic:'🧾',t:'Effacer le casier judiciaire',a:()=>run(()=>{L.record=0;return 'Casier judiciaire vierge.'})}),
    row({ic:'🔓',t:'Sortir de prison',dis:!L.prison,a:()=>run(()=>{L.prison=0;L.jail={gang:null,resp:0};return 'Tu es libre.'})}),
    row({ic:'🪪',t:'Obtenir tous les permis',a:()=>run(()=>{L.lic={car:true,boat:true,pilot:true};return 'Permis B, bateau et licence de pilote en poche.'})}),
    row({ic:'💸',t:'Effacer toutes les dettes',a:()=>run(()=>{L.debt=0;L.assets.forEach(a=>{a.loan=0;a.left=0});if(L.money<0)L.money=0;return 'Plus aucune dette.'})}),
    row({ic:'👑',t:L.royal?'Quitter la famille royale':'Rejoindre une famille royale',s:COUNTRIES[L.country].mon?'':'Le pays doit être une monarchie',dis:!L.royal&&!COUNTRIES[L.country].mon,a:()=>run(()=>{if(L.royal){L.royal=null;return 'Tu n’es plus de sang royal.'}L.royal={country:L.country,line:1,approval:70,throne:L.age>=18};if(L.royal.throne)track(L,'throne');return `👑 ${royalTitle(L)}.`})})]);
  return {title:'Mode Dieu',html,after:bindSliders};
}
function pGodPerson(id){return ()=>{
  const L=cur();const p=byId(L,id);if(!p)return {title:'Mode Dieu',html:''};
  return {title:`Modifier ${p.first}`,html:`<div class="card">${sliders([['rel','Relation',p.rel],['plooks','Apparence',p.looks??50],['psmarts','Intelligence',p.smarts??50],['phealth','Santé',p.health??70],['pcrazy','Folie',p.crazy??20],['pfame','Gloire',p.fame??0]])}</div>`+group('',[nav('🎨','Modifier son apparence','Éditeur complet',pLook(id)),row({ic:'✨',t:'Appliquer',a:()=>run(()=>{p.rel=+$('#g-rel').value;p.looks=+$('#g-plooks').value;p.smarts=+$('#g-psmarts').value;p.health=+$('#g-phealth').value;p.crazy=+$('#g-pcrazy').value;p.fame=+$('#g-pfame').value;return `${p.first} a été modifié.`})})]),after:bindSliders};
}}

/* ---------- Menu ---------- */
const SETUP_LOOK={};
const rndForm=g=>({first:rname(g,'France'),last:rlast('France'),gender:g,likes:g==='H'?'F':'H',country:'France',talent:'rand',royal:false});
function formHtml(px,d,label,color){
  if(!LED[px])ledOpen(px,AVATAR_R.random(d.gender),{age:24,gender:d.gender});
  return `<div class="pform" style="--c:var(--${color})"><div class="phead"><span class="dot"></span>${esc(label)}<button type="button" class="link" data-refill="${px}">Tirer au sort</button></div>
  <div class="two"><label class="f">Prénom<input id="${px}-first" value="${esc(d.first)}" autocomplete="off" maxlength="30"></label><label class="f">Nom<input id="${px}-last" value="${esc(d.last)}" autocomplete="off" maxlength="30"></label></div>
  <div class="two"><label class="f">Genre<select id="${px}-gender">${opt('F','Femme',d.gender)}${opt('H','Homme',d.gender)}</select></label><label class="f">Attirance<select id="${px}-likes">${opt('H','Hommes',d.likes)}${opt('F','Femmes',d.likes)}${opt('both','Les deux',d.likes)}</select></label></div>
  <div class="two"><label class="f">Pays de naissance<select id="${px}-country">${Object.keys(COUNTRIES).map(c=>opt(c,c+(COUNTRIES[c].mon?' 👑':''),d.country)).join('')}</select></label><label class="f">Talent<select id="${px}-talent">${opt('rand','Au hasard',d.talent)}${opt('','Aucun',d.talent)}${Object.entries(TALENTS).map(([k,n])=>opt(k,n,d.talent)).join('')}</select></label></div>
  ${typeof TRAIT_CHOICES!=='undefined'?`<label class="f">Trait de caractère<select id="${px}-trait">${opt('rand','Au hasard',d.trait||'rand')}${TRAIT_CHOICES.map(([k,n])=>opt(k,n,d.trait||'rand')).join('')}</select></label>
  ${typeof TRAIT_QUIZ!=='undefined'?`<details class="quiz"><summary>Pas sûr${d.gender==='F'?'e':''} ? Trois questions pour choisir</summary>${TRAIT_QUIZ.map((qz,i)=>`<label class="f">${esc(qz.q)}<select data-quiz="${px}"><option value="">—</option>${qz.a.map(([t,k])=>`<option value="${k}">${esc(t)}</option>`).join('')}</select></label>`).join('')}<p class="note" id="${px}-quizres"></p></details>`:''}`:''}
  ${typeof applySeed==='function'?`<details class="quiz"><summary>Départ partagé avec ta moitié</summary><p class="note">Entrez le même mot sur vos deux téléphones : vous commencerez avec le même personnage.</p><div class="two"><label class="f">Votre mot<input id="${px}-seed" autocomplete="off" maxlength="30" placeholder="par exemple : banane"></label><button type="button" class="link" data-seed="${px}" style="align-self:end;padding:12px 6px">Utiliser ce mot</button></div></details>`:''}
  <label class="chk"><input type="checkbox" id="${px}-royal"${d.royal?' checked':''}> Naître dans une famille royale <small>(pays marqués 👑)</small></label>
  <details class="led-wrap"><summary><span class="sav" id="${px}-sav">${AVATAR_R.render(LED[px].look,{age:24,gender:d.gender,mood:85})}</span><span>Apparence<small>Coiffure, couleurs, tenue : touche pour personnaliser</small></span></summary><div class="led" data-led="${px}">${ledInner(px)}</div></details></div>`;
}
function refill(px){const d=rndForm(pick(['H','F']));if(LED[px]){LED[px].look=AVATAR_R.random(d.gender);LED[px].ctx.gender=d.gender;ledRefresh(px)}for(const k of ['first','last','gender','likes']){const el=document.getElementById(`${px}-${k}`);if(el)el.value=d[k]}}
function readForm(px){const v=k=>{const el=document.getElementById(`${px}-${k}`);return el?el.value.trim():''};const g=v('gender')||'F';const c=v('country')||'France';const t=v('talent');const roy=document.getElementById(`${px}-royal`);
  return {first:v('first').slice(0,30)||rname(g,c),last:v('last').slice(0,30)||rlast(c),gender:g,likes:v('likes')||(g==='H'?'F':'H'),country:c,talent:t==='rand'?undefined:(t||null),trait:v('trait')&&v('trait')!=='rand'?v('trait'):undefined,royal:!!(roy&&roy.checked&&COUNTRIES[c].mon),look:LED[px]?Object.assign({},LED[px].look):undefined}}
function pNewLife(idx){delete LED.nl;return ()=>({title:idx>=G.players.length?'Second joueur':'Nouvelle vie',html:`<div class="forms" style="margin-top:12px">${formHtml('nl',rndForm(pick(['H','F'])),`Joueur ${idx+1}`,`p${idx+1}`)}</div>`+group('',[row({ic:'🌱',t:'Commencer cette vie',a:()=>{const L=makeLife(readForm('nl'));if(idx>=G.players.length){G.players.push(L);G.mode=2}else{if(G.snaps)delete G.snaps[G.players[idx].id];G.players[idx]=L}closeSheet();save();render();toast(`${L.first} vient de naître.`)}})])})}
function pMenu(){
  const nR=Object.values(G.ribbons).filter(Boolean).length,nC=Object.keys(G.challenges).length;
  return {title:'Menu',html:group('Outils',modCall('menuRows',cur()).flat())+group('Collection',[nav('🎀','Rubans',`${nR} sur ${RIBBONS.length}`,pRibbons),nav('🏅','Défis',`${nC} sur ${CHALLENGES.length}`,pChallenges),nav('🪦','Cimetière familial',`${G.cemetery.length} vie${G.cemetery.length>1?'s':''} terminée${G.cemetery.length>1?'s':''}`,pCem)])
    +group('Personnage',[nav('🪪','Fiche personnage','Toutes tes statistiques',pSheet),nav('🌳','Arbre généalogique','Ta famille',pTree),nav('⏳','Machine à remonter le temps','Reviens en arrière',pTime)])
    +group('Réglages',[row({ic:'🔊',t:'Sons',s:FX.st.sound?'Activés · touche pour couper':'Coupés · touche pour activer',a:()=>FX.toggle('sound')}),row({ic:'📳',t:'Vibrations',s:FX.st.haptic?'Activées · touche pour couper':'Coupées · touche pour activer',a:()=>FX.toggle('haptic')}),row({ic:'🎨',t:'Style des icônes',s:ICMODE.mode==='emoji'?'Emoji en couleur · touche pour passer au trait':'Icônes au trait · touche pour passer aux emoji',a:toggleIcons}),row({ic:'🎓',t:'Revoir la visite guidée',s:'Les bases en 6 écrans',a:()=>{closeSheet();TUTO.start()}})])
    +group('Partie',[G.mode===1?nav('👥','Ajouter un second joueur','Jouez à deux sur le même téléphone',pNewLife(G.players.length)):null,
      row({ic:'🗑️',t:'Nouvelle partie',s:'Efface la partie en cours',danger:1,a:()=>pushPanel(confirmP('Nouvelle partie ?','La partie en cours, les rubans et les défis seront effacés de ce navigateur.',()=>{G=null;try{localStorage.removeItem(KEY)}catch(e){}closeSheet();return ''},'Tout effacer'))})])
    +`<p class="cs" style="text-align:center;opacity:.6;margin:14px 0 0">Double Vie · version ${window.DV_VERSION||'locale'}</p>`+`<h3 class="sec">Comment jouer</h3><div class="card"><div class="cs">Le bouton <b>Âge</b> fait passer une année. Entre deux années, explore les onglets : études et métier, biens, relations, activités. Touche ton avatar pour voir ta fiche complète. À deux, vous jouez chacun votre tour et vous pouvez vous déclarer votre flamme, vous marier et avoir des enfants ensemble. Tout est débloqué : mode Dieu, machine à remonter le temps, carrières spéciales, royauté, zoo, Bourse, agent secret, mouvement spirituel, marché noir. La partie est sauvegardée automatiquement dans ce navigateur.</div></div>`};
}

/* ---------- Écran de départ ---------- */
let setupMode=2;
function buildSetup(){
  for(const k of ['s1','s2'])delete LED[k];
  const g1=pick(['H','F']),g2=g1==='H'?'F':'H';
  $('#setup').innerHTML=`<div class="hero"><h1><span class="a">Double</span> <span class="b">Vie</span></h1><p>Un simulateur de vie à jouer seul ou à deux, sur le même téléphone. Naissance, école, premier amour, carrière, mariage, enfants, héritage : chaque appui sur Âge fait passer une année.</p>
  <ul class="perks"><li>Mode Dieu</li><li>Machine à remonter le temps</li><li>Carrières spéciales</li><li>Royauté</li><li>Politique</li><li>Agent secret</li><li>Zoo</li><li>Bourse</li><li>Propriétaire bailleur</li><li>Mouvement spirituel</li><li>Marché noir</li><li>Réalisateur</li><li>Rubans et défis</li></ul></div>
  <div class="seg" role="group" aria-label="Nombre de joueurs"><button type="button" data-mode="1" aria-pressed="${setupMode===1}">Solo</button><button type="button" data-mode="2" aria-pressed="${setupMode===2}">À deux</button></div>
  <div class="forms">${formHtml('s1',rndForm(g1),'Joueur 1','p1')}<div id="s2wrap"${setupMode===1?' hidden':''} style="display:grid">${formHtml('s2',rndForm(g2),'Joueur 2','p2')}</div></div>
  <button type="button" class="go" id="goBtn">Naître</button>`;
}
function startGame(){
  const players=[makeLife(readForm('s1'))];if(setupMode===2)players.push(makeLife(readForm('s2')));
  G={v:2,sv:SAVE_V,mode:setupMode,players,turn:0,cemetery:[],ribbons:{},challenges:{},snaps:{}};modCall('worldInit');save();render();
}

/* ---------- Évènements DOM ---------- */
document.addEventListener('change',e=>{
  const q=e.target.closest&&e.target.closest('select[data-quiz]');if(!q||typeof traitQuizResult!=='function')return;
  const px=q.dataset.quiz,ans=[...document.querySelectorAll(`select[data-quiz="${px}"]`)].map(s=>s.value);
  if(ans.some(a=>!a))return;
  const k=traitQuizResult(ans),sel=document.getElementById(`${px}-trait`),res=document.getElementById(`${px}-quizres`);
  if(k&&sel){sel.value=k;const o=sel.options[sel.selectedIndex];if(res)res.textContent=`Ton trait : ${o?o.textContent:k}. Tu peux encore le changer ci-dessus.`}
});
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-refill]');if(r){refill(r.dataset.refill);return}
  const sd=e.target.closest('[data-seed]');if(sd&&typeof applySeed==='function'){applySeed(sd.dataset.seed);return}
  const lk=e.target.closest('[data-lk]');if(lk){const box=lk.closest('[data-led]');const id=box&&box.dataset.led;const S=id&&LED[id];if(S){const [k,v,t]=lk.dataset.lk.split('|');S.look[k]=t==='n'?+v:t==='b'?!S.look[k]:v;ledRefresh(id)}return}
  const lr=e.target.closest('[data-led-rand]');if(lr){const id=lr.dataset.ledRand;const S=LED[id];if(S){S.look=AVATAR_R.random(S.ctx.gender);ledRefresh(id)}return}
  const md=e.target.closest('[data-mode]');if(md){setupMode=+md.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.mode===setupMode)));const w=$('#s2wrap');if(w)w.hidden=setupMode===1;return}
  if(e.target.closest('#goBtn')){startGame();return}
  const m=e.target.closest('[data-m]');if(m){chooseM(+m.dataset.m);return}
  const b=e.target.closest('[data-a]');if(b&&!b.disabled){const f=ACTS[+b.dataset.a];if(f)f()}
});
$('#ageBtn').addEventListener('click',ageUp);
$('#tWork').addEventListener('click',()=>openPanel(pWork));
$('#tAssets').addEventListener('click',()=>openPanel(pAssets));
$('#tRel').addEventListener('click',()=>openPanel(pRel));
$('#tAct').addEventListener('click',()=>openPanel(pAct));
$('#menuBtn').addEventListener('click',()=>openPanel(pMenu));
$('#pback').addEventListener('click',back);
$('#pclose').addEventListener('click',closeSheet);
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')closeSheet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!curM&&STACK.length)closeSheet()});

/* ---------- Démarrage ---------- */
window.claude?.hot?.snapshot?.(()=>G);
function migrate(){
  if(!G)return;G.ribbons=G.ribbons||{};G.challenges=G.challenges||{};G.snaps=G.snaps||{};
  if((G.sv||2)<3){
    for(const L of G.players){L.hid.stress=L.hid.stress??R(5,25);L.hid.crime=L.hid.crime??0;L.forced=L.forced||[];L.yr=L.yr||{inc:0,dep:0,tax:0};
      {let v=(L.bonds||0);if(G.mk&&G.mk.px)for(const t in (L.port||{}))v+=(L.port[t]||0)*(G.mk.px[t]||0);v=Math.round(v);if(v>0){L.money+=v;say(L,'📈 Ton portefeuille de la version précédente est converti en liquidités : '+fmt(v)+'.')}L.port={};L.bonds=0}
      if(L.job&&L.job.sp&&!SPECIALS[L.job.c])L.job=null;}
    G.mk=null;G.snaps={};G.sv=3;
  }
}
function start(data){G=(data&&data.players)?data:load();if(G&&(!G.players||G.v!==2))G=null;if(G){migrate();modCall('worldInit')}render()}
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
