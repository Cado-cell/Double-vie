/* Deux Vies — module « À deux, chacun chez soi » (id duo)
   Aucun serveur : on s'échange des codes (à copier-coller dans un message).
   • Mon code : résumé de ma vie (âge, patrimoine, enfants, prix, score de vie, personnalité) + mon visage.
   • Comparer : on colle le code de l'autre, le jeu compare les deux vies ligne par ligne.
   • Inviter : le personnage de l'autre entre dans ma vie comme un ami, qui agit comme les autres proches.
   • Départ partagé : un mot commun (« banane ») donne le même personnage de départ aux deux joueurs.
   Le code est du JSON encodé en texte ; tout ce qui entre est nettoyé (longueurs, valeurs, visage normalisé). */
(()=>{
const MOD='duo';
const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>{const b=s.replace(/-/g,'+').replace(/_/g,'/');return decodeURIComponent(escape(atob(b+'='.repeat((4-b.length%4)%4))))};
const txt=(v,n)=>String(v==null?'':v).replace(/[\u0000-\u001f<>]/g,'').slice(0,n);
const num=(v,lo,hi)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,Math.round(v))):lo};

/* ---------- Mon code ---------- */
function summary(L){
  const pe=(L.persona&&L.persona.bestName)||'';
  return {v:1,n:L.first,l:L.last,g:L.gender,a:L.age,al:L.alive===false?0:1,nw:Math.round(netWorth(L)),kd:allKids(L).length,sc:lifeScore(L),
    aw:lifeAwards(L).map(x=>x.n),pe,jb:String(jobLabel(L)||''),ct:L.country,lk:L.look};
}
const myCode=L=>'DV1.'+b64e(JSON.stringify(summary(L)));
/* Renvoie un résumé nettoyé, ou null si le texte n'est pas un code valable. */
function parse(text){
  const m=String(text||'').replace(/\s+/g,'').match(/DV1\.([A-Za-z0-9_-]{20,6000})/);if(!m)return null;
  let j;try{j=JSON.parse(b64d(m[1]))}catch(e){return null}
  if(!j||typeof j!=='object'||j.v!==1)return null;
  const g=j.g==='F'?'F':'H';
  let lk=null;try{lk=AVATAR_R.normalize(j.lk&&typeof j.lk==='object'?j.lk:{},g)}catch(e){return null}
  return {n:txt(j.n,30)||'Inconnu',l:txt(j.l,30),g,a:num(j.a,0,130),al:j.al?1:0,nw:num(j.nw,-1e10,1e12),kd:num(j.kd,0,60),sc:num(j.sc,0,100),
    aw:(Array.isArray(j.aw)?j.aw:[]).slice(0,3).map(x=>txt(x,30)).filter(Boolean),pe:txt(j.pe,30),jb:txt(j.jb,40),ct:COUNTRIES[j.ct]?j.ct:'France',lk};
}

/* ---------- Départ partagé ---------- */
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
/* Même mot = même personnage de départ. Math.random est détourné le temps de la génération, puis rétabli. */
function seeded(word){
  const w=String(word||'').trim().toLowerCase();if(!w)return null;
  const rng=mulberry(hash(w)),orig=Math.random;Math.random=rng;
  try{
    const g=rng()<.5?'H':'F',cs=Object.keys(COUNTRIES),c=cs[Math.floor(rng()*cs.length)];
    const tal=Object.keys(TALENTS),trs=(typeof TRAIT_CHOICES!=='undefined'?TRAIT_CHOICES:[]).map(x=>x[0]);
    return {first:rname(g,c),last:rlast(c),gender:g,likes:g==='H'?'F':'H',country:c,talent:tal[Math.floor(rng()*tal.length)],trait:trs.length?trs[Math.floor(rng()*trs.length)]:'rand',look:AVATAR_R.random(g)};
  }finally{Math.random=orig}
}
window.applySeed=px=>{
  const el=document.getElementById(`${px}-seed`),f=seeded(el&&el.value);
  if(!f){toast('Entre un mot que ta moitié connaît aussi.');return}
  for(const k of ['first','last','gender','likes','country','talent','trait']){const e=document.getElementById(`${px}-${k}`);if(e&&f[k]!=null)e.value=f[k]}
  const roy=document.getElementById(`${px}-royal`);if(roy)roy.checked=false;
  if(LED[px]){LED[px].look=f.look;LED[px].ctx.gender=f.gender;ledRefresh(px)}
  toast(`Départ partagé : ${f.first} ${f.last}, ${f.country}.`);
};
window.duoSeeded=seeded;

/* ---------- Comparaison et invitation ---------- */
const money=n=>Math.abs(n)>=1e6?fmtk(n):fmt(n);
function otherAv(o){try{return avatar({look:o.lk,gender:o.g,age:o.a,alive:!!o.al,rel:70},{happy:60})}catch(e){return ''}}
function invited(L,o){return ((L.duo&&L.duo.invited)||[]).includes(o.n+'|'+o.l)}
function invite(L,o){
  const p=person(o.g,Math.max(16,Math.min(90,o.a||30)),o.l,L.country);
  p.first=o.n;p.look=o.lk;p.type='friend';p.tag='echange';p.rel=70;p.seen=L.age;if(o.jb)p.job=o.jb;
  L.family.push(p);L.duo=L.duo||{};L.duo.invited=(L.duo.invited||[]).concat(o.n+'|'+o.l);
  chg(L,{happy:4});return out(L,`💞 ${o.n} ${o.l} entre dans ta vie. ${ge(p,'Il','Elle')} vient d’une autre vie, mais le courant passe tout de suite.`);
}
const pCompare=o=>()=>{
  const L=cur(),me=summary(L);
  const line=(ic,t,mine,theirs,a,b)=>row({ic,t,s:`Toi : ${mine} · ${o.n} : ${theirs}`,right:a>b?'🏆 toi':a<b?`🏆 ${esc(o.n)}`:'🤝'});
  const win=me.sc===o.sc?0:me.sc>o.sc?1:-1;
  const verdict=win===0?'Égalité parfaite : vous avez vécu à égalité.':win>0?`Tu l’emportes de ${me.sc-o.sc} point${me.sc-o.sc>1?'s':''}.`:`${o.n} l’emporte de ${o.sc-me.sc} point${o.sc-me.sc>1?'s':''}.`;
  const head=group('',[row({av:avatar(L,{happy:60}),t:`${L.first} ${L.last}`,s:`${An(me.a)} · ${me.al?'en vie':'décédé'+(L.gender==='F'?'e':'')}${me.jb?' · '+me.jb:''}`}),
    row({av:otherAv(o),t:`${o.n} ${o.l}`,s:`${An(o.a)} · ${o.al?'en vie':'décédé'+(o.g==='F'?'e':'')}${o.jb?' · '+o.jb:''}`})]);
  const rows=group('Vos deux vies',[
    line('⭐','Score de vie',`${me.sc} / 100`,`${o.sc} / 100`,me.sc,o.sc),
    line('💰','Patrimoine',money(me.nw),money(o.nw),me.nw,o.nw),
    line('👨‍👩‍👧','Enfants',String(me.kd),String(o.kd),me.kd,o.kd),
    line('⏳','Âge',An(me.a),An(o.a),me.a,o.a),
    me.aw.length||o.aw.length?row({ic:'🏅',t:'Prix',s:`Toi : ${me.aw.join(', ')||'aucun'} · ${o.n} : ${o.aw.join(', ')||'aucun'}`}):null,
    me.pe||o.pe?row({ic:'🪞',t:'Personnalité',s:`Toi : ${me.pe||'—'} · ${o.n} : ${o.pe||'—'}`}):null]);
  return {title:`Toi et ${o.n}`,html:head+card('Verdict',`${me.sc} contre ${o.sc}`,verdict,'')+rows
    +group('Et maintenant ?',[invited(L,o)?null:act(L,{ic:'💞',t:`Inviter ${o.n} dans ma vie`,s:`${ge({gender:o.g},'Il','Elle')} deviendra un ami qui agit comme les autres proches`,fn:L=>{const t=invite(L,o);STACK.pop();return t}})])};
};

/* ---------- Panneau principal ---------- */
function copy(text){
  const ta=document.getElementById('duo-code');
  const done=ok=>toast(ok?'Code copié. Colle-le dans un message.':'Sélectionne le code ci-dessus et copie-le.');
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>done(true),()=>fallback())}else fallback()}catch(e){fallback()}
  function fallback(){try{if(ta){ta.focus();ta.select();done(document.execCommand('copy'))}else done(false)}catch(e){done(false)}}
}
function pDuo(){
  const L=cur();if(!L)return {title:'À deux',html:note('Aucun personnage.')};
  const code=myCode(L);
  const canShare=typeof navigator.share==='function';
  return {title:'À deux, chacun chez soi',html:note('Chacun joue sur son téléphone. Échangez vos codes pour comparer vos vies, ou pour vous inviter l’un dans la vie de l’autre.')
    +`<h3 class="sec">Mon code</h3><div class="card"><label class="f">À envoyer à ta moitié<textarea id="duo-code" readonly rows="3" style="font-size:12px;word-break:break-all">${esc(code)}</textarea></label></div>`
    +group('',[row({ic:'📋',t:'Copier mon code',a:()=>copy(code)}),canShare?row({ic:'📤',t:'Envoyer mon code',s:'Par message',a:()=>{try{navigator.share({title:'Mon code Double Vie',text:code})}catch(e){}}}):null])
    +`<h3 class="sec">Le code de l’autre</h3><div class="card"><label class="f">Colle ici le code reçu<textarea id="duo-in" rows="3" placeholder="DV1.…" style="font-size:12px" autocomplete="off"></textarea></label></div>`
    +group('',[row({ic:'🔍',t:'Comparer nos deux vies',a:()=>{const el=document.getElementById('duo-in'),o=parse(el&&el.value);if(!o){toast('Ce code n’est pas valable. Colle-le en entier.');return}pushPanel(pCompare(o))}})])
    +`<h3 class="sec">Même départ</h3><p class="note">Pour commencer avec le même personnage, entrez le même mot dans « Départ partagé », au moment de créer une vie.</p>`};
}
window.duoPanel=pDuo;

registerMod({id:MOD,
  menuRows(L){return L?[nav('💞','À deux, chacun chez soi','Codes pour comparer vos vies',pDuo)]:[]}
});
window.duoParse=parse;window.duoCode=myCode;window.duoCompare=pCompare;window.duoInvite=invite;
})();
