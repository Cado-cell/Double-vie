/* Deux Vies — moteur de simulation */

/* ---------- Outils ---------- */
const $=s=>document.querySelector(s);
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const chance=p=>Math.random()<p;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Math.round(v)));
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>{n=Math.round(n||0);return (n<0?'−':'')+Math.abs(n).toLocaleString('fr-FR')+' €'};
const fmtk=n=>{const a=Math.abs(n),s=n<0?'−':'';if(a>=1e9)return s+(a/1e9).toFixed(1).replace('.',',')+' Md€';if(a>=1e6)return s+(a/1e6).toFixed(1).replace('.',',')+' M€';if(a>=1e4)return s+Math.round(a/1e3)+' k€';return fmt(n)};
const fmtn=n=>Math.round(n).toLocaleString('fr-FR');
const An=n=>n===0?'moins d’un an':n+(n>1?' ans':' an');
const ge=(L,m,f)=>L&&L.gender==='F'?f:m;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let SEQ=Date.now()%1e7;const nid=()=>'i'+(SEQ++).toString(36);
const wpick=o=>{const ks=Object.keys(o).filter(k=>o[k]>0);let t=ks.reduce((s,k)=>s+o[k],0),r=Math.random()*t;for(const k of ks){r-=o[k];if(r<=0)return k}return ks[0]};
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};

/* ---------- État ---------- */
const KEY='deuxvies.v2';
const SAVE_V=3;
let G=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(G))}catch(e){}}
function load(){try{const s=localStorage.getItem(KEY);return s?JSON.parse(s):null}catch(e){return null}}
const cur=()=>G.players[G.turn];
const idxOf=L=>G.players.indexOf(L);

/* ---------- Modules d’extension ----------
   Chaque fichier mod_*.js appelle registerMod({...}) avec les points d’accroche suivants (tous facultatifs) :
   id                          identifiant unique
   special:{clé:{n,ic,desc,ladder,req,apply(L),year(L),salary(L),panel(L)}}   carrières spéciales (L.job={c:clé,sp:1,lvl,...})
   worldInit()                 au lancement ou au chargement d’une partie (état partagé dans G)
   worldYear()                 une fois par année du monde (prix, marchés)
   year(L)                     chaque année de la vie L, après le travail (utiliser earn/spend/say)
   events(L) -> nombre         évènements en fenêtre ajoutés avec modal() ; renvoie le nombre ajouté
   eventsDb:[…]                évènements au format JSON (voir evRun dans events.js)
   effects:{nom(L,args)->texte} effets appelables depuis eventsDb via {mod_effect:{mod,fn,args}}
   conds:{nom(L,args)->bool}   conditions appelables depuis eventsDb via {mod_cond:{mod,fn,args}}
   workRows(L) -> [html]       lignes ajoutées à l’onglet Métier (groupe Carrière)
   activities(L) -> [{ic,t,s,panel,min}]  entrées ajoutées à l’onglet Activités
   assetRows(L) -> [html]      lignes ajoutées à l’onglet Biens (groupe Investir)
   assetDetailRows(L,a) -> [html]  lignes ajoutées à la fiche d’un bien
   netWorth(L) -> nombre       valeur ajoutée au patrimoine net
   jobLabel(L) -> texte|null   libellé de statut prioritaire (ex. Maire)
   badges(L) -> [texte]        pastilles sous le nom
   inherit(D,L)                transmettre l’état du module de la vie D à l’héritier L
   jailed(L)                   appelé quand L est condamné à de la prison ferme
   born(L,opts)                fin de makeLife (nouvelle vie, y compris un héritier) : initialiser l’état du module
   babyAttempt(L,ivf)->texte   intercepte tryBaby : renvoyer une chaîne (même vide) pour court-circuiter la naissance immédiate
   pension(L)->nombre          remplace le calcul de la pension (défaut : 55 % du salaire)
   heirInit(D,L,child)         après création de l’héritier L depuis l’enfant child de D : reprendre la vraie vie de l’enfant
   personRows(L,p)->[html]     lignes ajoutées dans la fiche d’une personne (liste Actions)
   sheetRows(L)->[html]        lignes ajoutées dans la fiche personnage
   menuRows(L)->[html]         lignes ajoutées en tête du Menu (groupe Outils)
   partnerRows(L)->[html]      lignes ajoutées dans la fiche du partenaire (liste Ensemble)
   Compteurs : chaque action avec clé (act key:'med') incrémente L.tr['k_med'] ; L.tr.actions compte les actions du joueur. */
const MODS=[];const SPECIALS={};
function registerMod(m){MODS.push(m);if(m.special)for(const k in m.special)SPECIALS[k]=Object.assign({mod:m.id},m.special[k])}
function modCall(h,...a){const r=[];for(const m of MODS)if(typeof m[h]==='function'){try{const v=m[h](...a);if(v!=null)r.push(v)}catch(e){console.error('module '+m.id+'.'+h,e)}}return r}
const modById=id=>MODS.find(m=>m.id===id);

/* ---------- Noms et apparence ---------- */
const poolOf=c=>NAMEPOOLS[(COUNTRIES[c]||COUNTRIES.France).pool];
const rname=(g,c)=>pick(poolOf(c||'France')[g]);
const rlast=c=>pick(poolOf(c||'France').L);
function genLook(a,b,g){
  if(typeof AVATAR_R!=='undefined'){try{return a&&b?AVATAR_R.inherit(a,b,g):AVATAR_R.random(g)}catch(x){console.error(x)}}
  const mix=(k,n)=>a&&b&&chance(.85)?(chance(.5)?a[k]:b[k]):R(0,n-1);
  return {skin:mix('skin',SKINS.length),hc:mix('hc',HAIRC.length-1),eye:mix('eye',EYEC.length),hair:R(0,3),shirt:R(0,SHIRTS.length-1)};
}
function zodiacOf(d,m){for(const [n,mm,dd] of ZODIAC)if(m<mm||(m===mm&&d<=dd))return n;return 'Capricorne'}

/* ---------- Personnes ---------- */
const NPC_JOBS=['boulanger','infirmière','comptable','professeur','mécanicien','avocate','plombier','pharmacienne','architecte','chauffeur de bus','fleuriste','policier','développeuse','agricultrice','journaliste','coiffeur','médecin','caissière','électricien','sans emploi','agent immobilier','cheffe de projet','pompier','vétérinaire'];
const NPC_PAY={boulanger:26000,infirmière:30000,comptable:38000,professeur:34000,mécanicien:28000,avocate:62000,plombier:32000,pharmacienne:48000,architecte:45000,'chauffeur de bus':27000,fleuriste:21000,policier:30000,développeuse:48000,agricultrice:24000,journaliste:34000,coiffeur:22000,médecin:82000,caissière:19000,électricien:31000,'sans emploi':11000,'agent immobilier':38000,'cheffe de projet':52000,pompier:29000,vétérinaire:50000};
/* Revenus et patrimoine estimés d’un PNJ : calculés à la demande, donc toujours à jour avec son âge. */
function npcWealth(L,p){
  if(!p||p.alive===false||p.type==='pet')return null;
  if(p.thrift==null){p.thrift=R(3,20)/100;p.luck=R(50,170)/100;p.pk=R(8,22)}
  const k=(COUNTRIES[L.country]||COUNTRIES.France).cost*.6+.4;
  if(p.age<18)return {inc:0,cash:Math.round(Math.min(p.age,17)*p.pk*k),pocket:1};
  const base=(NPC_PAY[(p.job||'').toLowerCase()]||28000)*(p.type==='boss'?2.2:1)*k;
  const ret=p.age>=65;
  const inc=Math.round(base*(ret?.55:1)*(p.fame>=40?1+p.fame/25:1));
  const worked=Math.max(0,Math.min(p.age,64)-(p.age<23?p.age:22));
  const cash=Math.round((base*worked*p.thrift*p.luck+base*.15)*(ret?.9:1));
  return {inc,cash,ret};
}
function person(g,age,last,country,parents){
  return {id:nid(),first:rname(g,country),last:last||rlast(country),gender:g,age,rel:R(55,95),alive:true,looks:R(10,100),smarts:R(10,100),health:R(60,100),crazy:R(0,70),fame:chance(.03)?R(20,80):R(0,8),ill:[],type:'friend',look:genLook(parents&&parents[0]&&parents[0].look,parents&&parents[1]&&parents[1].look,g),job:age>=22?pick(NPC_JOBS):''};
}
function role(p){const F=p.gender==='F';if(p.type==='friend'&&p.tag){if(p.tag==='rival')return F?'Rivale':'Rival';if(p.tag==='bestie')return F?'Meilleure amie':'Meilleur ami';if(p.tag==='voisin')return F?'Voisine':'Voisin';if(p.tag==='echange')return F?'Amie d’une autre vie':'Ami d’une autre vie'}switch(p.type){
  case 'parent':return F?'Mère':'Père';case 'sibling':return F?'Sœur':'Frère';case 'child':return F?'Fille':'Fils';
  case 'grand':return F?'Grand-mère':'Grand-père';case 'grandkid':return F?'Petite-fille':'Petit-fils';
  case 'friend':return p.coworker?(F?'Collègue':'Collègue'):(F?'Amie':'Ami');case 'enemy':return F?'Ennemie':'Ennemi';
  case 'ex':return F?'Ex':'Ex';case 'boss':return F?'Patronne':'Patron';case 'pet':return p.species;default:return ''}}
function poss(p){const r=role(p).toLowerCase();if(p.tag&&p.type==='friend')return (p.gender==='F'?'ta ':'ton ')+r;if(p.type==='friend'||p.type==='pet'||p.type==='ex'||p.type==='enemy')return 'ton '+r;return (p.gender==='F'?'ta ':'ton ')+r}
const kids=L=>L.family.filter(p=>p.type==='child'&&p.alive);
const allKids=L=>L.family.filter(p=>p.type==='child');
const friends=L=>L.family.filter(p=>p.type==='friend'&&p.alive);
const pets=L=>L.family.filter(p=>p.type==='pet'&&p.alive);
const parents=L=>L.family.filter(p=>p.type==='parent'&&p.alive);
const byId=(L,id)=>L.family.find(p=>p.id===id);
const parentsAlive=L=>parents(L).length;
const likeG=L=>L.likes==='both'?pick(['H','F']):L.likes;
function relParent(L,d){parents(L).forEach(p=>p.rel=clamp(p.rel+d))}
function addFriend(L,o={}){const f=person(pick(['H','F']),Math.max(4,L.age+R(-3,3)),null,L.country);f.type='friend';f.rel=R(55,80);Object.assign(f,o);L.family.push(f);return f}
function addPet(L,sp,name){const P=PETS[sp]||[100,8,14];const p={id:nid(),first:name||pick(PETN),species:sp,type:'pet',age:0,alive:true,rel:85,max:R(P[1],P[2]),gender:chance(.5)?'H':'F',last:''};L.family.push(p);return p}

/* ---------- Création d’une vie ---------- */
function makeLife(o={}){
  const g=o.gender||pick(['H','F']);const country=COUNTRIES[o.country]?o.country:'France';
  const d=R(1,28),m=R(1,12);
  const L={id:nid(),first:o.first||rname(g,country),last:o.last||rlast(country),gender:g,likes:o.likes||(g==='H'?'F':'H'),
    country,city:o.city||pick(COUNTRIES[country].cities),age:o.age||0,alive:true,money:o.money||0,
    bday:[d,m],zodiac:zodiacOf(d,m),look:o.look||genLook(null,null,g),
    st:o.st||{happy:R(60,95),health:R(72,100),smarts:R(15,100),looks:R(15,100)},
    hid:o.hid||{karma:50,discipline:R(20,80),willpower:R(20,80),fertility:R(30,100),athletic:R(10,90),crazy:R(0,60),stress:R(5,25),crime:0},
    fame:0,talent:o.talent!==undefined?o.talent:(chance(.35)?pick(Object.keys(TALENTS)):null),skills:{},lessons:[],
    family:o.family||[],partner:null,exes:0,
    edu:{stage:'none',grades:R(45,80),degrees:[],major:null,y:0,pop:R(30,70),clique:null,team:null,fund:null},
    job:null,part:null,retired:false,pension:0,assets:[],port:{},bonds:0,debt:0,home:null,withParents:true,rent:0,
    prison:0,jail:{gang:null,resp:0},record:0,wanted:false,ill:[],addict:{alcool:0,jeu:0},smoker:false,lic:{car:false,boat:false,pilot:false},
    social:{pf:{},verified:false},royal:null,pol:null,mob:null,spy:null,biz:null,cult:null,zoo:null,bm:null,will:{heir:null,charity:0},
    used:{},market:null,gen:o.gen||1,log:[],flags:{},tr:{},forced:[],yr:{inc:0,dep:0,tax:0}};
  if(o.royal&&COUNTRIES[country].mon){
    L.last=pick(ROYAL_HOUSES);L.royal={country,line:1,approval:R(55,85),throne:false};
  }
  if(!o.family){
    const fa=person('H',R(24,42),L.last,country);fa.type='parent';
    const mo=person('F',R(22,40),chance(.5)?L.last:rlast(country),country);mo.type='parent';
    if(!o.look)L.look=genLook(fa.look,mo.look,g);
    if(L.royal){fa.job=COUNTRIES[country].mon[0];fa.royal=1;mo.job=COUNTRIES[country].mon[1].replace('souveraine','consort');}
    L.family.push(fa,mo);
    for(const [par,tag] of [[fa,'p'],[mo,'m']])for(const gg of ['H','F']){const gp=person(gg,par.age+R(22,34),gg==='H'?par.last:rlast(country),country);gp.type='grand';gp.side=tag;if(gp.age<95)L.family.push(gp)}
    const n=L.royal?R(0,2):pick([0,0,1,1,1,2,3]);
    for(let i=0;i<n;i++){const s=person(pick(['H','F']),R(1,10),L.last,country,[fa,mo]);s.type='sibling';L.family.push(s);if(L.royal)L.royal.line++}
    say(L,`${ge(L,'Tu es né','Tu es née')} le ${d} ${MONTHS[m-1]} à ${L.city} (${L.country}). Signe astrologique : ${L.zodiac}.`);
    say(L,`Ta mère s’appelle ${mo.first} ${mo.last}, ton père ${fa.first} ${fa.last}.`);
    if(L.royal)say(L,`👑 Tu es ${ge(L,'né prince','née princesse')} de la maison ${L.last}, ${L.royal.line===1?'premier':L.royal.line+'e'} dans l’ordre de succession.`);
    if(L.talent)say(L,`Tu sembles avoir un don particulier : ${TALENTS[L.talent].toLowerCase()}.`);
  }else say(L,`Tu reprends le flambeau familial. Génération ${L.gen}.`);
  modCall('born',L,o);
  return L;
}

/* ---------- Journal ---------- */
function say(L,t){if(!t||!L)return;let b=L.log[L.log.length-1];if(!b||b.age!==L.age){b={age:L.age,lines:[]};L.log.push(b)}if(b.lines[b.lines.length-1]!==t)b.lines.push(t)}
function out(L,t){say(L,t);return t}
const HIDK=['karma','discipline','willpower','fertility','athletic','crazy','stress','crime'];
function chg(L,d){for(const k in d){const v=d[k];if(!v)continue;if(k==='money')L.money+=v;else if(k==='fame')L.fame=clamp(L.fame+v);else if(HIDK.includes(k))L.hid[k]=clamp((L.hid[k]||0)+v);else if(L.st[k]!=null)L.st[k]=clamp(L.st[k]+v)}}
function track(L,k,n=1){L.tr[k]=(L.tr[k]||0)+n}
function trackMax(L,k,v){if(v>(L.tr[k]||0))L.tr[k]=v}
function earn(L,n,notax){L.money+=n;L.yr.inc+=n;if(!notax)L.yr.tax=(L.yr.tax||0)+n}
function spend(L,n){L.money-=n;L.yr.dep+=n}

/* ---------- Couple ---------- */
function partnerOf(L){
  if(!L.partner)return null;
  if(L.partner.link!=null){const o=G.players[L.partner.link];if(!o){L.partner=null;return null}return {first:o.first,last:o.last,gender:o.gender,age:o.age,alive:o.alive,looks:o.st.looks,smarts:o.st.smarts,look:o.look,job:jobLabel(o),player:1}}
  return L.partner.p;
}
function linkedOther(L){return L.partner&&L.partner.link!=null?G.players[L.partner.link]:null}
function partnerLabel(L){const p=partnerOf(L);if(!p)return '';const F=p.gender==='F',s=L.partner.status;return s==='couple'?(F?'Petite amie':'Petit ami'):s==='fiance'?(F?'Fiancée':'Fiancé'):(F?'Épouse':'Époux')}
function partnerRel(L,d){if(!L.partner)return;L.partner.rel=clamp(L.partner.rel+d);const o=linkedOther(L);if(o&&o.partner)o.partner.rel=L.partner.rel}
function setStatus(L,s){L.partner.status=s;if(s==='marie'){L.partner.wedAge=L.age;track(L,'marriages')}const o=linkedOther(L);if(o&&o.partner){o.partner.status=s;if(s==='marie'){o.partner.wedAge=o.age;track(o,'marriages')}}}
function setPartner(L,p){p.type='partner';L.partner={status:'couple',rel:R(62,85),link:null,p,since:L.age};track(L,'partners')}
function breakUp(L,msg){
  const was=L.partner.status,o=linkedOther(L),p=partnerOf(L);let m=msg;
  if(o){if(o.partner){o.partner=null;o.exes++;chg(o,{happy:-10});say(o,`💔 ${L.first} et toi, c’est terminé.`)}}
  else{
    if(was==='marie'&&!L.partner.prenup){const loss=Math.round(Math.max(0,L.money)*.4);L.money-=loss;if(loss)m+=` Le divorce te coûte ${fmt(loss)}.`}
    if(p){const ex=Object.assign({},p,{type:'ex',rel:R(5,35),id:nid(),origId:p.id,together:L.age-(L.partner.since||L.age)});L.family.push(ex)}
  }
  L.partner=null;L.exes++;chg(L,{happy:-10});
  return out(L,'💔 '+m);
}
function addChild(L,c){L.family.push(c);const o=linkedOther(L);if(o)o.family.push(Object.assign({},c))}
function tryBaby(L,ivf){
  {const r=modCall('babyAttempt',L,ivf).find(x=>typeof x==='string');if(r!==undefined)return r}
  const p=partnerOf(L);if(!p&&!ivf)return '';
  if(p&&L.gender===p.gender&&!ivf)return out(L,'À deux, ce n’est pas possible biologiquement. Pensez à l’adoption ou à la PMA.');
  const mother=L.gender==='F'?L.age:(p?p.age:L.age);
  if(mother>(ivf?52:46))return out(L,'Il est trop tard pour une grossesse.');
  const fert=L.gender==='F'?L.hid.fertility:70;
  const base=(mother<35?.5:mother<40?.3:.12)*(0.6+fert/125)*(ivf?1.4:1);
  if(!chance(Math.min(.9,base)))return out(L,ivf?'La FIV n’a pas fonctionné cette fois.':'Pas de bébé cette fois-ci.');
  const last=p&&L.gender!=='H'&&p.gender==='H'?p.last:L.last;const n=chance(ivf?.15:.03)?2:1;const born=[];
  for(let i=0;i<n;i++){const c=person(pick(['H','F']),0,last,L.country,[L,p]);c.type='child';c.rel=R(85,100);c.coparent=L.partner?(L.partner.link!=null?'player'+L.partner.link:(p&&p.id)||null):null;c.look=genLook(L.look,p&&p.look,c.gender);addChild(L,c);born.push(c)}
  chg(L,{happy:15});partnerRel(L,8);trackMax(L,'kidsMax',allKids(L).length);
  const txt=n===2?`👶 Des jumeaux ! Bienvenue à ${born[0].first} et ${born[1].first}.`:`👶 C’est ${born[0].gender==='F'?'une fille':'un garçon'} ! Bienvenue à ${born[0].first}.`;
  const o=linkedOther(L);if(o){chg(o,{happy:15});say(o,txt);trackMax(o,'kidsMax',allKids(o).length)}
  return out(L,txt);
}
function adoptChild(L){const c=person(pick(['H','F']),R(0,8),L.last,L.country);c.type='child';c.rel=R(60,90);addChild(L,c);chg(L,{happy:12});trackMax(L,'kidsMax',allKids(L).length);const o=linkedOther(L);if(o)say(o,`Vous adoptez ${c.first}, ${An(c.age)}.`);return out(L,`👶 Tu adoptes ${c.first}, ${An(c.age)}.`)}

/* ---------- Diplômes et école ---------- */
const SCHOOL_STAGES=['primaire','college','lycee','pro','cap','fac','master','doc'];
const inSchool=L=>SCHOOL_STAGES.includes(L.edu.stage);
const inHigher=L=>['fac','master','doc'].includes(L.edu.stage);
function hasDeg(L,d){const D=L.edu.degrees;if(d==='*lic')return D.some(x=>x.startsWith('lic_'));if(d==='*master')return D.some(x=>x.startsWith('master_'));if(d==='*doc')return D.some(x=>x.startsWith('doc_'))||D.includes('medecine');return D.includes(d)}
function classe(L){const a=L.age,e=L.edu,s=e.stage;
  if(s==='primaire')return ['CP','CE1','CE2','CM1','CM2'][a-6]||'CM2';
  if(s==='college')return ['Sixième','Cinquième','Quatrième','Troisième'][a-11]||'Troisième';
  if(s==='lycee')return ['Seconde','Première','Terminale'][a-15]||'Terminale (redoublement)';
  if(s==='pro')return `Bac pro ${TRADES[e.trade]} · année ${e.y+1} sur 3`;
  if(s==='cap')return `CAP ${TRADES[e.trade]} · année ${e.y+1} sur 2`;
  if(s==='fac')return `${MAJORS[e.major].n} · année ${e.y+1} sur ${MAJORS[e.major].y}`;
  if(s==='master')return `Master ${deOf(MAJORS[e.major].n)} · année ${e.y+1} sur 2`;
  if(s==='doc')return `Doctorat ${deOf(MAJORS[e.major].n)} · année ${e.y+1} sur 3`;return ''}
function schoolName(L){return {primaire:'École primaire',college:'Collège',lycee:'Lycée général',pro:'Lycée professionnel',cap:'Centre de formation',fac:MAJORS[L.edu.major]&&MAJORS[L.edu.major].type==='ecole'?MAJORS[L.edu.major].n:'Université',master:'Université',doc:'Laboratoire de recherche'}[L.edu.stage]||''}
function canMajor(L,k){const M=MAJORS[k];if(!hasDeg(L,'bac'))return false;if(M.needLic&&!hasDeg(L,'*lic'))return false;if(hasDeg(L,M.type==='lic'?'lic_'+k:k))return false;return Math.max(L.edu.grades,L.st.smarts-10)+(M.talent&&L.talent===M.talent?20:0)>=M.g}
function fundStudies(L,k,cost,done){
  const opts=[];const total=cost*(MAJORS[k]?MAJORS[k].y:2);
  if(L.edu.grades>=75)opts.push({t:'Demander une bourse au mérite',fn:()=>{if(chance(.4+(L.edu.grades-75)/50)){L.edu.fund='bourse';return out(L,'🎉 Bourse obtenue : tes études sont gratuites.')}L.edu.fund=parentsAlive(L)?'parents':'pret';return out(L,'Bourse refusée. '+(L.edu.fund==='parents'?'Tes parents paieront.':'Tu contractes un prêt étudiant.'))}});
  if(parentsAlive(L))opts.push({t:'Demander à tes parents',fn:()=>{const rel=Math.max(...parents(L).map(p=>p.rel));if(chance(rel/110)){L.edu.fund='parents';return out(L,'Tes parents acceptent de payer tes études.')}L.edu.fund='pret';return out(L,'Tes parents refusent. Tu contractes un prêt étudiant.')}});
  opts.push({t:`Prêt étudiant (${fmt(cost)} par an)`,fn:()=>{L.edu.fund='pret';return out(L,'Tu signes un prêt étudiant.')}});
  if(L.money>=total)opts.push({t:`Payer toi-même (${fmt(total)} au total)`,fn:()=>{L.edu.fund='self';return out(L,'Tu financeras tes études toi-même.')}});
  modal({title:'Financer tes études',text:`Les frais de scolarité s’élèvent à ${fmt(cost)} par an.`,choices:opts});
}
function enroll(L,k){
  const M=MAJORS[k];L.edu.stage='fac';L.edu.major=k;L.edu.y=0;L.edu.fund='self';
  const cost=M.cost||250;
  if(cost>1000)fundStudies(L,k,cost);else L.edu.fund=parentsAlive(L)?'parents':'self';
  return out(L,`🎓 Tu t’inscris : ${M.n} (${An(M.y)} d’études).`);
}
function afterCollege(L){
  modal({title:`${L.first} · fin du collège`,text:'Quelle orientation choisis-tu pour la suite ?',choices:[
    {t:'Lycée général (bac en 3 ans)',pri:1,fn:()=>{L.edu.stage='lycee';return out(L,'Tu entres au lycée général, en seconde.')}},
    ...Object.entries(TRADES).slice(0,4).map(([k,n])=>({t:`Bac pro ${n}`,fn:()=>{L.edu.stage='pro';L.edu.trade=k;L.edu.y=0;return out(L,`Tu entres en lycée professionnel : bac pro ${n}.`)}})),
    {t:'CAP (deux ans, apprentissage d’un métier)',fn:()=>{modal({title:'Quel CAP ?',text:'Choisis ton futur métier.',choices:Object.entries(TRADES).map(([k,n])=>({t:'CAP '+n,fn:()=>{L.edu.stage='cap';L.edu.trade=k;L.edu.y=0;return out(L,`Tu commences un CAP ${n} en apprentissage.`)}}))})}}
  ]});
}
function orientation(L){
  const ch=Object.keys(MAJORS).filter(k=>canMajor(L,k)).map(k=>({t:`${MAJORS[k].n} (${An(MAJORS[k].y)})`,fn:()=>enroll(L,k)}));
  ch.push({t:'Entrer dans la vie active',fn:()=>{L.edu.stage='done';return out(L,'Tu te lances dans la vie active.')}});
  ch.push({t:'Prendre une année sabbatique',fn:()=>{L.edu.stage='done';chg(L,{happy:10});return out(L,'Une année sabbatique pour voyager et réfléchir.')}});
  ch.push({t:'Rejoindre l’armée',fn:()=>{L.edu.stage='done';return enlist(L,pick(MILITARY.branches))}});
  return {title:`${L.first} · bac en poche`,text:'Que fais-tu à la rentrée ?',choices:ch};
}
function bac(L){
  const s=L.edu.grades+R(-12,12);
  if(s>=40){
    L.edu.degrees.push('bac');L.edu.stage='bac';
    const m=s>=85?' avec mention très bien':s>=72?' avec mention bien':s>=60?' avec mention assez bien':'';
    chg(L,{happy:10});say(L,`🎓 Tu décroches ton bac${m} !`);modal(orientation(L));
  }else{
    chg(L,{happy:-10});say(L,'Tu rates le bac.');
    modal({title:`${L.first} · bac raté`,text:'Tu peux redoubler ta terminale ou arrêter les études.',choices:[
      {t:'Redoubler la terminale',fn:()=>{L.edu.stage='lycee';return out(L,'Tu redoubles ta terminale.')}},
      {t:'Arrêter les études',fn:()=>{L.edu.stage='done';return out(L,'Tu quittes le lycée sans le bac.')}}]});
  }
}
function finishMajor(L){
  const e=L.edu,M=MAJORS[e.major];
  if(M.type==='lic'){
    e.degrees.push('lic_'+e.major);e.stage='done';chg(L,{happy:10,smarts:4});say(L,`🎓 Diplôme obtenu : ${degName('lic_'+e.major)}.`);
    modal({title:`${L.first} · licence en poche`,text:'Veux-tu continuer en master ?',choices:[
      {t:'Continuer en master (2 ans)',pri:1,fn:()=>{e.stage='master';e.y=0;return out(L,`Tu entres en master ${deOf(M.n)}.`)}},
      {t:'Entrer dans la vie active',fn:()=>'Tu te lances dans la vie active.'}]});
  }else{e.degrees.push(e.major);e.stage='done';chg(L,{happy:12,smarts:5});say(L,`🎓 Diplôme obtenu : ${M.dip}. Bravo !`)}
}
function schoolYear(L){
  const e=L.edu,a=L.age;
  if(a===3&&e.stage==='none'){e.stage='mat';say(L,'Tu fais ta rentrée en maternelle.')}
  if(a>=6&&a<16&&(e.stage==='none'||e.stage==='mat')){e.stage='primaire';say(L,'✏️ Tu entres en CP. Cartable neuf, trousse pleine.')}
  else if(a>=11&&e.stage==='primaire'){e.stage='college';say(L,'Tu entres au collège, en sixième.')}
  else if(a>=15&&e.stage==='college'){
    if(e.grades+R(-10,10)>=35){e.degrees.push('brevet');say(L,'Tu obtiens le brevet des collèges.')}else say(L,'Tu rates le brevet.');
    e.stage='lycee';afterCollege(L);
  }
  else if(a>=18&&e.stage==='lycee')bac(L);
  else if(e.stage==='pro'){e.y++;if(e.y>=3){if(e.grades+R(-10,10)>=35){e.degrees.push('bacpro_'+e.trade,'bac');e.stage='done';chg(L,{happy:10});say(L,`🎓 Tu obtiens ton bac pro ${TRADES[e.trade]}.`)}else{e.y=2;say(L,'Tu rates ton bac pro. Tu redoubles.')}}}
  else if(e.stage==='cap'){e.y++;if(e.y>=2){e.degrees.push('cap_'+e.trade);e.stage='done';chg(L,{happy:8});say(L,`🎓 Tu obtiens ton CAP ${TRADES[e.trade]}.`)}}
  else if(inHigher(L)){
    e.y++;const M=MAJORS[e.major];
    const cost=e.stage==='fac'?(M.cost||250):250;
    if(e.fund==='pret')L.debt+=cost;else if(e.fund==='self')spend(L,cost);
    if(L.prison){e.stage='done';say(L,'Tu es radié de l’université.')}
    else if(e.grades<25&&chance(.35)){e.stage='done';chg(L,{happy:-10});say(L,`Tes résultats sont trop faibles : tu es ${ge(L,'renvoyé','renvoyée')}.`)}
    else if(e.stage==='fac'&&e.y>=M.y)finishMajor(L);
    else if(e.stage==='master'&&e.y>=2){e.degrees.push('master_'+e.major);e.stage='done';chg(L,{happy:10,smarts:4});say(L,`🎓 Diplôme obtenu : ${degName('master_'+e.major)}.`);
      if(e.grades>=55)modal({title:`${L.first} · master en poche`,text:'Ton directeur de mémoire te propose une thèse de doctorat.',choices:[{t:'Faire une thèse (3 ans)',pri:1,fn:()=>{e.stage='doc';e.y=0;return out(L,'Tu commences une thèse de doctorat.')}},{t:'Entrer dans la vie active',fn:()=>'Tu te lances dans la vie active.'}]})}
    else if(e.stage==='doc'&&e.y>=3){e.degrees.push('doc_'+e.major);e.stage='done';chg(L,{happy:12,smarts:6});say(L,`🎓 Tu soutiens ta thèse : ${degName('doc_'+e.major)}. Docteur !`)}
  }
  if(inSchool(L)){
    e.grades=clamp(e.grades+(L.st.smarts-e.grades)*.15+(L.hid.discipline-50)/25+R(-6,6)-(L.job&&!L.job.sp?3:0)-(L.part?2:0));chg(L,{smarts:R(0,2)});
    if(e.stage!=='doc'&&e.stage!=='master')e.pop=clamp(e.pop+R(-5,5)+(L.st.looks-50)/25);
  }
  if(e.stage==='done'&&L.debt>0&&e.fund==='pret'&&!L.flags.loanStart){L.flags.loanStart=1;say(L,`Tu dois rembourser ${fmt(L.debt)} de prêt étudiant.`)}
}
/* Matériel : un instrument, un kimono, un chevalet… accélère l’apprentissage de la compétence liée tant qu’on le possède. */
const GEAR=[[/piano à queue/i,'piano',3],[/flûte|clavier|piano/i,'piano',2],[/ukul|guitare/i,'guitare',2],[/violon/i,'violon',2],[/batterie/i,'batterie',2],[/micro de karaok/i,'chant',2],[/ballon de foot/i,'football',2],[/raquette/i,'tennis',2],[/kimono/i,'judo',2],[/feutres|peinture|chevalet/i,'dessin',2],[/carnet d.écriture/i,'ecriture',2],[/kit de magie/i,'theatre',1]];
const gearSkill=n=>{const g=GEAR.find(x=>x[0].test(n||''));return g?[g[1],g[2]]:null};
const gearBonus=(L,k)=>L.assets.reduce((m,a)=>{const g=gearSkill(a.name);return g&&g[0]===k?Math.max(m,g[1]):m},0);
function lessonsYear(L){
  for(const k of L.lessons){
    const Ls=LESSONS.find(x=>x.k===k);if(!Ls)continue;
    const gain=R(4,12)*(L.talent===Ls.t?1.7:1)*(.6+L.hid.discipline/125)+gearBonus(L,k)*1.5;
    const before=L.skills[k]||0;L.skills[k]=clamp(before+gain);
    if(L.age>=18)spend(L,600);
    if(Ls.belt){const b0=Math.min(6,Math.floor(before/15)),b1=Math.min(6,Math.floor(L.skills[k]/15));if(b1>b0){say(L,`🥋 ${Ls.n} : tu obtiens la ceinture ${BELTS[b1]}.`);if(b1===6){track(L,'blackBelt');}}}
    if(Ls.t==='sport')chg(L,{athletic:1,health:1});
  }
}

/* ---------- Travail ---------- */
const FEM={plongeur:'plongeuse',serveur:'serveuse',vendeur:'vendeuse',conseiller:'conseillère',directeur:'directrice',ouvrier:'ouvrière',livreur:'livreuse',chauffeur:'chauffeuse',gérant:'gérante',infirmier:'infirmière',développeur:'développeuse',avocat:'avocate',associé:'associée',collaborateur:'collaboratrice',acteur:'actrice',principal:'principale',musicien:'musicienne',signé:'signée',indépendant:'indépendante',débutant:'débutante',joueur:'joueuse',conducteur:'conductrice',spécialisé:'spécialisée',agrégé:'agrégée',certifié:'certifiée',ingénieur:'ingénieure','aide-soignant':'aide-soignante',bâtonnier:'bâtonnière',gardien:'gardienne',brigadier:'brigadière',financier:'financière',maître:'maîtresse',proviseur:'proviseure',professeur:'professeure',assistant:'assistante',hôte:'hôtesse',chargé:'chargée',téléconseiller:'téléconseillère',superviseur:'superviseuse',facteur:'factrice','facteur-guichetier':'factrice-guichetière',exploitant:'exploitante',apprenti:'apprentie',plombier:'plombière',artisan:'artisane',électricien:'électricienne',coiffeur:'coiffeuse',boulanger:'boulangère',mécanicien:'mécanicienne',menuisier:'menuisière',esthéticien:'esthéticienne',patron:'patronne',officier:'officière',négociateur:'négociatrice',steward:'hôtesse de l’air',contrôleur:'contrôleuse',inspecteur:'inspectrice',chirurgien:'chirurgienne',pharmacien:'pharmacienne',adjoint:'adjointe',président:'présidente',clinicien:'clinicienne',réputé:'réputée',rédacteur:'rédactrice',attaché:'attachée',ambassadeur:'ambassadrice','post-doctorant':'post-doctorante',chercheur:'chercheuse',conservateur:'conservatrice',préparateur:'préparatrice',entraîneur:'entraîneuse',commandant:'commandante',figurant:'figurante',candidat:'candidate',réalisateur:'réalisatrice',reconnu:'reconnue',agriculteur:'agricultrice',équipier:'équipière',grand:'grande',expert:'experte','expert-comptable':'experte-comptable',titulaire:'titulaire',caissier:'caissière',animateur:'animatrice',saisonnier:'saisonnière',régulier:'régulière',particulier:'particulière',premier:'première','marin-pêcheur':'marin-pêcheuse',pêcheur:'pêcheuse',second:'seconde',matelot:'matelote'};
function fem(t,L){if(!L||L.gender!=='F')return t;return t.split(' ').map(w=>{const f=FEM[w.toLowerCase()];if(!f)return w;return w[0]===w[0].toUpperCase()?cap(f):f}).join(' ')}
function title(L){const j=L.job;if(!j)return '';const lad=ladderOf(j);return fem(lad[Math.min(j.lvl,lad.length-1)]||'',L)}
function ladderOf(j){return j.mil?MILITARY.ranks:j.sp?((SPECIALS[j.c]&&SPECIALS[j.c].ladder)||['Carrière spéciale']):CAREERS[j.c].ladder}
function salary(L){const j=L.job;if(!j)return 0;if(j.sp){const S=SPECIALS[j.c];try{return S&&S.salary?Math.round(S.salary(L)||0):0}catch(e){console.error(e);return 0}}return Math.round(j.sal)}
function netWorth(L){return L.money+L.assets.reduce((s,a)=>s+a.value-(a.loan||0),0)+modCall('netWorth',L).reduce((s,v)=>s+(+v||0),0)-(L.debt||0)}
function jobLabel(L){
  if(L.prison)return ge(L,'Détenu','Détenue');
  if(L.royal&&L.royal.throne)return royalTitle(L);
  const ml=modCall('jobLabel',L).find(Boolean);if(ml)return ml;
  if(L.job)return title(L);
  if(inSchool(L)){const s=L.edu.stage;
    if(inHigher(L))return s==='doc'?ge(L,'Doctorant','Doctorante'):`${ge(L,'Étudiant','Étudiante')} · ${MAJORS[L.edu.major].n}`;
    if(s==='lycee'||s==='pro')return `${ge(L,'Lycéen','Lycéenne')} · ${classe(L)}`;if(s==='cap')return ge(L,'Apprenti','Apprentie')+' · CAP';
    if(s==='college')return `${ge(L,'Collégien','Collégienne')} · ${classe(L)}`;return `${ge(L,'Écolier','Écolière')} · ${classe(L)}`}
  if(L.royal)return royalTitle(L);
  if(L.part)return fem(PART_TIME[L.part.k].n,L);
  if(L.retired)return ge(L,'Retraité','Retraitée');
  if(L.age<3)return 'Bébé';if(L.age<6)return 'Maternelle';if(L.age<18)return 'Ado';
  return 'Sans emploi';
}
function reqMiss(L,r){const m=[];r=r||{};
  if(L.age<(r.age||18))m.push(`dès ${r.age||18} ans`);
  if(r.maxAge&&L.age>r.maxAge)m.push(`moins de ${r.maxAge} ans`);
  if(r.deg&&!r.deg.some(d=>hasDeg(L,d)))m.push('diplôme : '+r.deg.map(d=>d==='*lic'?'une licence':d==='*master'?'un master':d==='*doc'?'un doctorat':degName(d).toLowerCase()).slice(0,3).join(' ou '));
  if(r.health&&L.st.health<r.health)m.push(`santé ${r.health} % min.`);
  if(r.looks&&L.st.looks<r.looks)m.push(`apparence ${r.looks} % min.`);
  if(r.smarts&&L.st.smarts<r.smarts)m.push(`intelligence ${r.smarts} % min.`);
  if(r.clean&&L.record)m.push('casier judiciaire vierge');
  if(r.license&&!L.lic[r.license])m.push({car:'permis B',boat:'permis bateau',pilot:'licence de pilote'}[r.license]);
  if(L.prison)m.push('en prison');
  if(L.royal&&!r.royalOk)m.push('interdit aux membres de la famille royale');
  return m.join(', ')}
function hire(L,k,bonus){
  const C=CAREERS[k];let p=.3+L.st.smarts/250+L.st.looks/500+bonus+(L.hid.discipline-50)/400;
  if(L.record)p-=.2;
  if(!chance(Math.max(.05,Math.min(.95,p))))return out(L,`Candidature refusée pour le poste de ${fem(C.ladder[0],L).toLowerCase()}.`);
  L.job={c:k,lvl:0,perf:R(45,65),y:0,sal:Math.round(C.base*(COUNTRIES[L.country].cost*.6+.4)*R(95,108)/100),boss:newBoss(L)};L.retired=false;L.flags.chomage=0;
  chg(L,{happy:8});return out(L,`💼 Tu es ${ge(L,'embauché','embauchée')} : ${title(L)}, ${fmt(salary(L))} par an.`);
}
function newBoss(L){const b=person(pick(['H','F']),R(32,60),null,L.country);b.type='boss';b.rel=R(40,70);return b}
function bossOf(L){const j=L.job;if(!j||j.sp)return null;if(!j.boss)j.boss=newBoss(L);return j.boss}
function bossRel(L,d){const b=bossOf(L);if(b)b.rel=clamp(b.rel+d)}
function applyJob(L,k){
  const C=CAREERS[k];
  const IQ=[['Pourquoi devrions-nous vous embaucher ?',[[`Je suis ${ge(L,'motivé et travailleur','motivée et travailleuse')}.`,.08],[`Parce que je suis ${ge(L,'le meilleur','la meilleure')}, tout simplement.`,L.st.smarts>65?.15:-.15],['Honnêtement ? J’ai besoin d’argent.',-.05]]],
    ['Quel est votre plus grand défaut ?',[['Je suis trop perfectionniste.',0],[`Je suis parfois ${ge(L,'impatient','impatiente')}, j’y travaille.`,.08],['Je n’en ai aucun.',-.1]]],
    ['Où vous voyez-vous dans cinq ans ?',[['À votre place.',chance(.5)?.15:-.15],['Avec plus de responsabilités, ici.',.08],['Aucune idée.',-.08]]],
    ['Que savez-vous de notre entreprise ?',[['Tout : j’ai lu vos trois derniers rapports annuels.',L.st.smarts>55?.12:-.05],['Que vous recrutez.',-.1],['Que vous avez de bonnes valeurs.',.03]]]];
  const [q,ans]=pick(IQ);
  modal({title:`Entretien · ${fem(C.ladder[0],L)}`,icon:'🤝',text:q,choices:ans.map(([t,b])=>({t,fn:()=>hire(L,k,b)}))});
}
function enlist(L,branch){
  if(L.record>1)return out(L,'L’armée refuse ta candidature à cause de ton casier judiciaire.');
  if(L.st.health<45)return out(L,'Tu échoues à la visite médicale.');
  L.job={c:'armee',mil:1,branch,lvl:0,perf:R(45,65),y:0,sal:MILITARY.base,boss:newBoss(L)};L.job.boss.job='officier supérieur';L.retired=false;
  return out(L,`🎖️ Tu t’engages dans l’${branch==='Légion étrangère'?'a ':''}${branch}.`.replace('l’a Légion','la Légion').replace('l’Marine','la Marine'));
}
function workYear(L){
  if(L.part){L.part.y++;earn(L,PART_TIME[L.part.k].sal)}
  const j=L.job;if(!j)return;
  if(j.sp){j.y=(j.y||0)+1;const S=SPECIALS[j.c];if(S&&S.year){try{S.year(L)}catch(e){console.error(e)}}else if(!S){L.job=null}return}
  j.y++;if(j.raiseWait>0)j.raiseWait--;const boss=bossOf(L);if(boss)boss.rel=clamp(boss.rel+R(-3,2)+(j.perf-50)/25);
  const hrs=j.hours||'normal';
  j.perf=clamp(j.perf+R(-7,6)+(L.st.smarts>70?2:0)+(L.st.happy<30?-3:0)+(L.hid.discipline-50)/20+(L.addict.alcool>50?-6:0)+(hrs==='heavy'?6:hrs==='light'?-5:0));
  if(hrs==='heavy')chg(L,{stress:4,health:-1,happy:-1});else if(hrs==='light')chg(L,{stress:-3,happy:2});
  const lad=ladderOf(j);
  if(j.lvl<lad.length-1&&j.perf>=75&&j.y>=2&&chance(.55*(.6+(boss?boss.rel:50)/125))){
    j.lvl++;j.y=0;j.sal=Math.round(j.sal*(j.mil?MILITARY.step:CAREERS[j.c].step));j.perf=clamp(j.perf-12);chg(L,{happy:8,stress:4});say(L,`📈 Promotion ! Tu deviens ${title(L).toLowerCase()}.`);
    if(j.lvl===lad.length-1)track(L,'topCareer');
  }else if((j.perf<=15&&chance(.6))||(boss&&boss.rel<8&&j.perf<45&&chance(.4))){
    say(L,`Tu es ${ge(L,'licencié','licenciée')} de ton poste de ${title(L).toLowerCase()}.`);L.job=null;L.flags.chomage=2;L.flags.fired=1;chg(L,{happy:-12});return;
  }
  earn(L,salary(L));trackSalary(L,salary(L));
  if(j.mil)track(L,'militaryYears');
}
/* Retraite : moyenne des 5 meilleures années × 2 % par année travaillée (25 % à 75 %). Retombe sur 55 % du salaire si l'historique est trop court (anciennes sauvegardes). */
function trackSalary(L,sal){const t=L.tr;t.workY=(t.workY||0)+1;t.best5=(t.best5||[]).concat(Math.round(sal)).sort((a,b)=>b-a).slice(0,5)}
function calcPension(L){
  const r=modCall('pension',L).find(x=>typeof x==='number');if(r!==undefined)return Math.round(r);
  const t=L.tr||{};
  if((t.workY||0)>=5&&t.best5&&t.best5.length){const avg=t.best5.reduce((s,v)=>s+v,0)/t.best5.length;return Math.round(avg*Math.max(.25,Math.min(.75,t.workY*.02)))}
  return Math.round(salary(L)*.55);
}
function retire(L){const t=title(L);L.pension=calcPension(L);L.retired=true;L.job=null;chg(L,{happy:10});return out(L,`🏖️ Tu prends ta retraite après une carrière de ${t.toLowerCase()}. Pension : ${fmt(L.pension)} par an.`)}

/* ---------- Famille ---------- */
function npcDeath(a,h){return (a<50?.002:Math.min(.6,.004*Math.exp((a-50)/9.5)))*(h!=null&&h<30?2:1)}
/* Petits et grands maux des proches (affichés dans leur fiche) */
const NPC_MILD={flatulences:{n:'flatulences chroniques'},ronflements:{n:'ronflements de tracteur'},verrue:{n:'une verrue plantaire'},hoquet:{n:'un hoquet tenace'},pellicules:{n:'des pellicules'},mycose:{n:'une mycose du pied'},allergie_chat:{n:'une allergie aux chats'}};
const illName=k=>(DIS[k]||NPC_MILD[k]||{n:k}).n;
function npcHealthYear(L,p){
  if(p.type==='pet')return;
  p.ill=p.ill||[];
  if(p.ill.length&&chance(.25)){p.ill.splice(R(0,p.ill.length-1),1)}
  if(p.ill.length<2&&chance(.025+p.age/3500)){
    if(chance(.45)){const k=pick(Object.keys(NPC_MILD).filter(k=>!p.ill.includes(k)));if(k)p.ill.push(k)}
    else{const ks=Object.keys(DIS).filter(k=>!DIS[k].acute&&(DIS[k].min||0)<=p.age&&!p.ill.includes(k)&&k!=='poumon');if(ks.length){const k=pick(ks);p.ill.push(k);
      if(['cancer','cardiaque','alzheimer','diabete'].includes(k)&&['parent','child','sibling','grand'].includes(p.type))say(L,`🩺 ${cap(poss(p))}, ${p.first}, apprend qu’${p.gender==='F'?'elle':'il'} a ${DIS[k].n}.`)}}
  }
  for(const k of p.ill)if(DIS[k])p.health=clamp((p.health??70)+DIS[k].h/2);
  if(!p.ill.length)p.health=clamp((p.health??70)+(p.age<50?R(0,2):R(-3,1)));
}
/* Testament : ce que laisse un proche dépend de votre relation, du temps écoulé depuis votre dernière rencontre (p.seen) et de ce que vous avez fait pour lui (p.memo). */
function willFactor(L,p){
  const gap=Math.max(0,L.age-(p.seen==null?L.age:p.seen)),m=p.memo||{};
  let f=1;
  if(p.rel>=75)f*=1.3;else if(p.rel<35)f*=.5;
  if(gap>=5)f*=.5;else if(gap>=3)f*=.8;
  if(m.gave>0)f*=1.15;if(m.refused>0)f*=.85;
  return {f,gap};
}
function familyYear(L){
  for(const p of L.family){
    if(!p.alive)continue;p.age++;npcHealthYear(L,p);
    if(p.type==='pet'){if(p.age>=p.max){p.alive=false;chg(L,{happy:-8});say(L,`🐾 ${p.first}, ton ${p.species.toLowerCase()}, est mort de vieillesse.`)}continue}
    if(chance(npcDeath(p.age,p.health))){
      p.alive=false;chg(L,{happy:-(p.type==='friend'||p.type==='ex'?4:p.type==='parent'?15:p.type==='child'?25:10)});
      say(L,`🕯️ ${cap(poss(p))}, ${p.first}, est ${p.gender==='F'?'morte':'mort'} à ${p.age} ans.`);
      if((p.type==='parent'||p.type==='grand')&&L.age>=16&&chance(p.type==='parent'?.75:.4)){
        const w=willFactor(L,p);
        if(p.rel<25&&w.gap>=5&&chance(.6))say(L,`📜 ${p.first} ne te laisse rien : vous ne vous parliez plus depuis ${An(w.gap)}.`);
        else if(chance(.25)){const it=pick([['Montre à gousset de famille',R(800,6000)],['Collier de perles ancien',R(1500,12000)],['Pendule ancienne',R(600,4000)],['Tableau de famille',R(1000,30000)],['Service en argent',R(900,5000)]]);L.assets.push({id:nid(),kind:'heirloom',name:it[0],value:it[1]});say(L,`Tu hérites d’un objet de famille : ${it[0].toLowerCase()}.`)}
        else{const h=Math.round(R(2000,p.type==='parent'?90000:30000)*(L.royal?20:1)*w.f);earn(L,h,1);say(L,`Tu hérites de ${fmt(h)}.${w.f>=1.3?` Dans son testament, ${p.gender==='F'?'elle':'il'} disait que tu comptais énormément pour ${p.gender==='F'?'elle':'lui'}.`:w.f<=.6?` Le testament est plus maigre que prévu : vous vous étiez perdus de vue.`:''}`)}
      }
      if(L.royal&&p.royal&&!L.royal.throne)royalSuccession(L,p);
      continue;
    }
    p.rel=clamp(p.rel-R(0,3));
    if(p.type==='child'){
      if(p.age===18)say(L,`${p.first} fête ses 18 ans et quitte la maison.`);
      if(p.age>=24&&p.age<=40&&!p.married&&chance(.1)){p.married=1;say(L,`💒 ${p.first} se marie. Tu verses une larme à la mairie.`);chg(L,{happy:5})}
      if(p.age>=22&&p.age<=42&&chance(.09)){const gk=person(pick(['H','F']),0,p.gender==='H'?p.last:rlast(L.country),L.country);gk.type='grandkid';gk.rel=R(70,95);gk.parentName=p.first;L.family.push(gk);chg(L,{happy:8});say(L,`👶 ${p.first} a eu ${gk.gender==='F'?'une petite fille':'un petit garçon'} : ${gk.first}. Te voilà ${ge(L,'grand-père','grand-mère')} !`)}
      if(p.age>=22&&!p.job)p.job=pick(NPC_JOBS);
    }
  }
  L.family=L.family.filter(p=>{if((p.type==='friend'||p.type==='ex')&&p.alive&&p.rel<6){if(p.type==='friend')say(L,`Tu as perdu de vue ${p.first}.`);return false}return true});
  if(L.partner){
    if(L.partner.link==null){
      const p=L.partner.p;p.age++;
      if(chance(npcDeath(p.age,p.health))){const m=L.partner.status==='marie';L.partner=null;chg(L,{happy:-30});say(L,`🕯️ ${p.first} est ${p.gender==='F'?'morte':'mort'} à ${p.age} ans.${m?` Tu es ${ge(L,'veuf','veuve')}.`:''}`)}
      else{L.partner.rel=clamp(L.partner.rel-R(0,4));if(L.partner.rel<15&&chance(.5))breakUp(L,`${p.first} te quitte.`)}
    }else partnerRel(L,-R(0,2));
  }
  if(L.partner&&L.partner.status==='marie'){const y=L.age-(L.partner.wedAge||L.age);trackMax(L,'marriedYears',y)}
}

/* ---------- Finances ---------- */
const costOf=L=>(COUNTRIES[L.country]||COUNTRIES.France).cost;
function financeYear(L){
  if(L.age>=10&&L.age<18&&parentsAlive(L)&&!L.royal)earn(L,R(50,300),1);
  if(L.royal&&!L.royal.exiled)earn(L,L.royal.throne?2500000:L.age>=18?400000:0,1);
  if(L.retired)earn(L,L.pension);
  else if(L.age>=65&&!L.job&&!L.royal)earn(L,Math.round(11000*costOf(L)));
  const idle=L.age>=18&&!L.job&&!L.part&&!inHigher(L)&&!L.retired&&!L.prison&&!L.royal&&!(L.flags.chomage>0)&&L.age<65;
  if(idle&&L.money<20000)earn(L,Math.round(7500*costOf(L)),1);
  if(L.flags.chomage>0&&!L.job){earn(L,11000);L.flags.chomage--}
  if(L.partner&&L.partner.status==='marie'&&L.partner.link==null&&L.age>=22)earn(L,5000,1);
  if(L.age>=18&&!L.prison){
    const home=L.home&&L.assets.find(a=>a.id===L.home);
    if(home)spend(L,Math.round(1800*costOf(L)));
    else if(L.withParents&&parentsAlive(L)){if(L.age>27)chg(L,{happy:-2})}
    else if(inHigher(L))spend(L,Math.round(4500*costOf(L)));
    else{L.withParents=false;const r=L.rent||Math.round(9000*costOf(L));spend(L,idle&&L.money<20000?Math.round(r*.6):r)}
  }
  if(L.age>=18)spend(L,kids(L).filter(k=>k.age<18).length*Math.round(2600*costOf(L)));
  for(const a of L.assets){
    if(a.kind==='house'){a.value=Math.round(a.value*(1+R(-4,7)/100)*(a.cond<40?.98:1));spend(L,Math.round(a.value*.008));a.cond=clamp((a.cond==null?80:a.cond)-R(0,4));
      if(a.loan>0){spend(L,a.pay);a.left--;a.loan=a.left>0?Math.round(a.loan*a.left/(a.left+1)):0;if(a.loan===0)say(L,`🏠 Ton crédit pour ${a.name.toLowerCase()} est entièrement remboursé.`)}}
    else if(a.kind==='car'){a.value=Math.round(a.value*.86);spend(L,700);a.cond=clamp((a.cond==null?90:a.cond)-R(2,8))}
    else if(a.kind==='boat'||a.kind==='plane'){a.value=Math.round(a.value*.92);spend(L,Math.round(a.value*.04))}
    else if(a.kind==='art'||a.kind==='heirloom'||a.kind==='jewel'){a.value=Math.round(a.value*(1+R(-3,6)/100))}
    else if(a.kind==='goods'){a.value=Math.round(a.value*.82)}
    else if(a.kind==='collectible'){a.value=Math.max(5,Math.round(a.value*Math.exp(.03+gauss()*(a.vol||.25))))}
  }
  if(L.debt>0&&L.edu.stage==='done'&&L.age>=22){const pay=Math.min(L.debt,Math.max(1500,Math.round(L.debt*.12)));spend(L,pay);L.debt-=pay;if(L.debt<=0){L.debt=0;say(L,'Ton prêt étudiant est entièrement remboursé.')}}
  if(L.money<0&&L.age>=18){
    const ag=Math.min(2500,Math.round(-L.money*.08));spend(L,ag);chg(L,{happy:-5});
    if(L.money<-60000&&!L.assets.length){L.money=0;L.debt=0;chg(L,{happy:-10});say(L,'⚖️ La commission de surendettement efface tes dettes. Un nouveau départ.');}else
    if(L.money<-50000&&L.assets.length){const a=L.assets.slice().sort((x,y)=>y.value-x.value)[0];L.assets=L.assets.filter(x=>x!==a);if(L.home===a.id)L.home=null;L.money+=a.value-(a.loan||0);say(L,`⚠️ La banque saisit ${a.name.toLowerCase()} pour éponger tes dettes.`)}
    else say(L,`Ton compte est dans le rouge : ${fmt(ag)} d’agios.`);
  }
  if(L.money>0){const it=Math.round(Math.min(L.money,22950)*.024);if(it>0)earn(L,it,1)}
  const tax=incomeTax(L);if(tax>0){spend(L,tax);say(L,`🧾 Impôt sur le revenu : ${fmt(tax)}.`)}
  {const net=L.yr.inc-L.yr.dep;if(L.age>=18&&(Math.abs(net)>=30000*costOf(L)||L.money<0))say(L,`💶 Cette année : ${net>=0?'+':'−'}${fmt(Math.abs(net))} sur ton compte.`)}
  trackMax(L,'houses',L.assets.filter(a=>a.kind==='house').length);
  if(L.age<30&&L.money>=1e6)L.flags.million30=1;
}

/* Impôt sur le revenu : barème progressif français, avec quotient familial */
const TAX_BRACKETS=[[11497,0],[29315,.11],[83823,.30],[180294,.41],[Infinity,.45]];
function taxParts(L){let p=1;if(L.partner&&L.partner.status==='marie')p++;const k=kids(L).filter(x=>x.age<18).length;p+=k<=2?k*.5:1+(k-2);return p}
function incomeTax(L){
  const base=Math.max(0,(L.yr.tax||0)*.9);if(base<=0||L.prison)return 0;
  const c=costOf(L),parts=taxParts(L),q=base/parts;let t=0,prev=0;
  for(const [lim,rate] of TAX_BRACKETS){const top=lim*c;if(q>prev)t+=(Math.min(q,top)-prev)*rate;prev=top;if(q<=top)break}
  return Math.round(t*parts);
}


/* ---------- Santé ---------- */
function healthYear(L){
  for(const k of L.ill){const D=DIS[k];chg(L,{health:D.h,happy:D.hap||0,smarts:D.smarts||0})}
  if(L.ill.some(k=>DIS[k].acute)){const ac=L.ill.filter(k=>DIS[k].acute);L.ill=L.ill.filter(k=>!DIS[k].acute);say(L,`Tu te remets de ${ac.map(k=>DIS[k].n).join(' et de ')}.`)}
  const heal=L.ill.filter(k=>chance(.15));if(heal.length){L.ill=L.ill.filter(k=>!heal.includes(k));say(L,`Rémission : ${heal.map(k=>DIS[k].n).join(', ')}.`)}
  let d=L.age<30?R(-1,2):L.age<50?R(-1,1):L.age<70?R(-3,1):R(-5,0);if(L.smoker)d-=1;if(L.addict.alcool>50)d-=2;if(L.hid.stress>70)d-=2;if(!L.ill.length&&L.st.health<60)d+=R(1,3);chg(L,{health:d});
  if(L.age>35)chg(L,{looks:-R(0,L.age>50?3:2)});if(L.age>75)chg(L,{smarts:-R(0,2)});
  {const j=L.job;let s=(30-L.hid.stress)*.15;if(j&&!j.mil)s+=2+j.lvl*1.5+(j.perf>80?2:0);if(j&&j.mil)s+=3;if(L.money<0&&L.age>=18)s+=4;if(L.prison)s+=6;if(L.retired)s-=4;if(L.partner&&L.partner.rel>70)s-=2;chg(L,{stress:s+R(-3,3)});
   if(L.hid.stress>75){chg(L,{happy:-3});if(!L.ill.includes('burnout')&&L.job&&chance(.15)){L.ill.push('burnout');say(L,'🔥 Le stress a raison de toi : burn-out diagnostiqué.')}}}
  let h=(60-L.st.happy)*.12;if(L.partner&&L.partner.rel>70)h+=3;if(L.money<0&&L.age>=18)h-=3;if(L.prison)h-=6;if(L.addict.jeu>50||L.addict.alcool>50)h-=3;chg(L,{happy:h+R(-3,3)});
  if(L.ill.length<2&&chance(.03+L.age/2500+(L.smoker?.02:0))){
    const w={};for(const k in DIS)if(!L.ill.includes(k)&&(DIS[k].min||0)<=L.age&&(!DIS[k].max||L.age<=DIS[k].max))w[k]=DIS[k].w+(k==='poumon'&&L.smoker?2:0)+(DIS[k].mental&&L.st.happy<30?2:0);
    if(Object.keys(w).length){const k=wpick(w);L.ill.push(k);say(L,`🩺 Le médecin te diagnostique ${DIS[k].n}.`)}
  }
  L.hid.karma=clamp(L.hid.karma+(50-L.hid.karma)*.04);if(L.hid.crime>0)L.hid.crime=clamp(L.hid.crime-1);
  for(const a of ['alcool','jeu'])if(L.addict[a]>0){L.addict[a]=clamp(L.addict[a]+(L.hid.willpower<40?R(0,4):R(-4,1)));trackMax(L,'addict',L.addict[a])}
}
function prisonYear(L){
  if(L.prison>0){
    L.prison--;track(L,'jailYears');chg(L,{happy:-6});
    if(L.jail.gang&&chance(.2)){chg(L,{health:-R(5,15)});say(L,'Bagarre entre gangs dans la cour. Tu t’en sors avec des bleus.')}
    say(L,L.prison===0?'🔓 Tu sors de prison. L’air libre a un goût étrange.':`Encore ${An(L.prison)} derrière les barreaux.`);
    if(L.prison===0)L.jail={gang:null,resp:0};
  }
}
function milestones(L){
  const m={1:'Tu fais tes premiers pas.',2:'Ton premier mot : « non ».',4:'Tu sais faire tes lacets. Presque.',7:'Ta première dent de lait tombe. La petite souris passe.',13:'Te voilà ado. Ta chambre devient ton royaume.',30:'Trente ans : l’âge de raison, paraît-il.',50:'Cinquante ans. On te fait une fête surprise.',65:'L’âge de la retraite approche.',80:'Quatre-vingts bougies sur le gâteau.',100:'💯 Centenaire ! Le maire vient te féliciter en personne.'}[L.age];
  if(m)say(L,m);
  if(L.age===18)say(L,ge(L,'Tu es majeur !','Tu es majeure !'));
}
function deathCheck(L){
  if(L.st.health<=0)return L.ill.length?`des suites ${DIS[L.ill.slice().sort((a,b)=>DIS[a].h-DIS[b].h)[0]].de}`:'d’épuisement';
  let p=L.age<60?.0007:.0035*Math.exp((L.age-60)/8.5);
  if(L.st.health<25)p*=2.5;else if(L.st.health>80)p*=.5;if(L.smoker)p*=1.3;if(L.addict.alcool>60)p*=1.5;
  if(chance(Math.min(p,.7)))return L.age>=70?'de vieillesse, paisiblement':pick(['dans un accident de la route','d’une crise cardiaque','d’un AVC','dans un accident de ski','d’une rupture d’anévrisme']);
  return null;
}

/* ---------- Mort, rubans et défis ---------- */
function ribbonFor(L){
  const t=L.tr,w=netWorth(L);
  const has={president:t.president,royal:t.throne,astronaute:t.space,cinema:t.palme||(t.cesars||0)>=3,gourou:(t.followers||0)>=1000,espion:(t.missions||0)>=10,parrain:t.parrain,
    charge:w>=2e7,riche:w>=2.5e6,celebre:(t.fameMax||0)>=90,evade:t.escaped,criminel:(t.jailYears||0)>=15,bandit:(t.crimes||0)>=8,academique:hasDeg(L,'*doc'),
    heros:L.hid.karma>=95,fertile:(t.kidsMax||0)>=5,seducteur:(t.partners||0)>=8,fidele:(t.marriedYears||0)>=50,entrepreneur:(t.bizMax||0)>=1e7,immobilier:(t.houses||0)>=5,
    zoo:(t.zooMax||0)>=10||pets(L).length>=5,soldat:(t.militaryYears||0)>=10,sportif:t.trophies||t.blackBelt,voyageur:(t.trips||0)>=8,genereux:(t.given||0)>=50000,
    addict:(t.addict||0)>=70,centenaire:L.age>=100,malchanceux:L.age<30,pro:t.topCareer,genie:L.st.smarts>=95,beaute:L.st.looks>=95,paresseux:!(t.actions>0)&&L.age>=40};
  const r=RIBBONS.find(x=>has[x.k]);return r?r.k:'mediocre';
}
function die(L,cause){
  L.alive=false;L.cause=cause;say(L,`🕯️ ${ge(L,'Tu es mort','Tu es morte')} ${cause}, à ${L.age} ans.`);
  trackMax(L,'fameMax',L.fame);
  const rb=ribbonFor(L);L.ribbon=rb;G.ribbons[rb]=(G.ribbons[rb]||0)+1;
  G.cemetery.unshift({lid:L.id,name:`${L.first} ${L.last}`,age:L.age,gen:L.gen,worth:netWorth(L),job:jobLabel(L),kids:allKids(L).length,cause,ribbon:rb,look:L.look,gender:L.gender});
  const o=linkedOther(L);
  if(o&&o.partner){const m=o.partner.status==='marie';o.partner=null;chg(o,{happy:-30});say(o,`🕯️ ${L.first} est ${ge(L,'mort','morte')}.${m?` Tu es ${ge(o,'veuf','veuve')}.`:''}`)}
  checkChallenges(L);
}
function checkChallenges(L){
  if(!G)return;const t=L.tr,c=G.challenges;const done=[];
  const ok={elysee:t.president,blouse:L.job&&L.job.c==='med'&&L.job.lvl>=3,tribu:(t.kidsMax||0)>=6,evasion:t.escaped,million30:L.flags.million30,palme:t.palme,
    duo:G.players.length>1&&G.players.every(p=>p.partner&&p.partner.link!=null&&p.partner.status==='marie'),dynastie:L.gen>=4,cent:L.age>=100,lune:t.moon,
    ceinture:t.blackBelt,empire:(t.houses||0)>=8,arche:(t.zooMax||0)>=15,agent:(t.missions||0)>=20,retour:t.timeMachine,tetedaffiche:t.movieStar,jackpot:t.jackpot,couronne:t.throne};
  for(const ch of CHALLENGES)if(!c[ch.k]&&ok[ch.k]){c[ch.k]=1;done.push(ch.n)}
  if(done.length&&typeof toast==='function')toast(`🏅 Défi réussi : ${done.join(', ')}`);
}

/* ---------- Héritage ---------- */
function continueAs(idx,childId){
  const D=G.players[idx];const c=byId(D,childId);if(!c)return;
  const heir=!D.will.heir||D.will.heir===childId;
  const charity=D.will.charity||0;
  const fam=[{id:nid(),first:D.first,last:D.last,gender:D.gender,age:D.age,rel:c.rel,alive:false,type:'parent',looks:D.st.looks,smarts:D.st.smarts,look:D.look}];
  const pp=partnerOf(D);if(pp&&pp.alive!==false)fam.push({id:nid(),first:pp.first,last:pp.last,gender:pp.gender,age:pp.age,rel:R(60,90),alive:true,type:'parent',looks:pp.looks||50,smarts:pp.smarts||50,look:pp.look||genLook()});
  D.family.filter(p=>p.type==='child'&&p.id!==childId).forEach(s=>fam.push(Object.assign({},s,{type:'sibling',id:nid()})));
  D.family.filter(p=>p.type==='grandkid'&&p.parentName===c.first).forEach(g=>fam.push(Object.assign({},g,{type:'child',id:nid()})));
  const L=makeLife({first:c.first,last:c.last,gender:c.gender,age:c.age,family:fam,money:0,gen:(D.gen||1)+1,country:D.country,city:D.city,look:c.look||genLook(),st:{happy:R(55,90),health:R(65,100),smarts:c.smarts,looks:c.looks}});
  const a=L.age;
  if(a>=18){L.edu.degrees.push('bac');L.edu.stage='done';L.withParents=false}else if(a>=15)L.edu.stage='lycee';else if(a>=11)L.edu.stage='college';else if(a>=6)L.edu.stage='primaire';
  if(heir){
    L.money=Math.round(Math.max(0,D.money)*.8*(1-charity/100));
    L.assets=D.assets.map(x=>Object.assign({},x,{id:nid(),rented:null}));modCall('inherit',D,L);
    say(L,`📜 Tu hérites de ${fmt(L.money)} après les droits de succession${L.assets.length?`, et de ${L.assets.length} bien${L.assets.length>1?'s':''}`:''}.`);
  }else{L.money=Math.round(Math.max(0,netWorth(D))*.25);say(L,`📜 Le testament ne te désigne pas comme héritier principal. Ta part réservataire : ${fmt(L.money)}.`)}
  if(charity)say(L,`${D.first} a légué ${charity} % de sa fortune à des associations.`);
  if(D.royal){L.royal={country:D.royal.country,line:1,approval:R(50,80),throne:!!D.royal.throne};L.last=D.last;if(L.royal.throne){track(L,'throne');say(L,`👑 Tu montes sur le trône : ${royalTitle(L)}.`)}}
  modCall('heirInit',D,L,c);
  L.tr.actions=0;
  if(G.snaps)delete G.snaps[D.id];
  G.players[idx]=L;
}

/* ---------- Machine à remonter le temps ---------- */
function snapshot(L){
  G.snaps=G.snaps||{};const arr=(G.snaps[L.id]=G.snaps[L.id]||[]);
  const copy=Object.assign({},L,{log:null});arr.push({age:L.age,s:JSON.stringify(copy)});while(arr.length>12)arr.shift();
}
function snapAges(L){return ((G.snaps&&G.snaps[L.id])||[]).map(x=>x.age).filter(a=>a<L.age||!L.alive)}
function timeTravel(idx,age){
  const L=G.players[idx];const arr=G.snaps[L.id]||[];const sn=arr.find(x=>x.age===age);if(!sn)return '';
  const N=JSON.parse(sn.s);N.log=L.log.filter(b=>b.age<age);
  G.snaps[L.id]=arr.filter(x=>x.age<age);
  if(!L.alive){const i=G.cemetery.findIndex(c=>c.lid===L.id);if(i>=0){const rb=G.cemetery[i].ribbon;if(G.ribbons[rb])G.ribbons[rb]--;G.cemetery.splice(i,1)}}
  G.players[idx]=N;track(N,'timeMachine');
  G.players.forEach((P,i)=>{if(P.partner&&P.partner.link!=null){const o=G.players[P.partner.link];if(!o||!o.alive||!o.partner||o.partner.link!==i)P.partner=null}});
  say(N,`⏳ Tu remontes le temps jusqu’à tes ${An(age)}.`);
  checkChallenges(N);
  return `Retour à ${An(age)}.`;
}

/* ---------- Vieillir ---------- */
/* Générateur pseudo-aléatoire à graine : sert au « départ partagé » à deux (mêmes marchés et mêmes évènements du monde). */
function seedRng(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}let a=h>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(s,fn){const o=Math.random;Math.random=seedRng(s);try{return fn()}finally{Math.random=o}}
function ageUp(){
  if(!G||busy())return;const L=cur();if(!L.alive)return;
  closeSheet();snapshot(L);
  L.age++;L.used={};L.market=null;L.yr={inc:0,dep:0,tax:0};delete L._tmp;
  if(G.turn===0||G.players.length===1){if(G.shared)withSeed(`monde:${G.shared}:${L.age}`,()=>modCall('worldYear'));else modCall('worldYear')}
  familyYear(L);schoolYear(L);lessonsYear(L);workYear(L);packsYear(L);financeYear(L);healthYear(L);prisonYear(L);milestones(L);
  trackMax(L,'fameMax',L.fame);
  const cause=deathCheck(L);
  if(cause){die(L,cause);MQ.length=0;curM=null;$('#modal').hidden=true;save();render();return}
  const _modal=window.modal;let _n=0;window.modal=function(m){if(m&&!m.noCap&&++_n>2)return;return _modal.apply(this,arguments)};
  let q;try{q=rollEvents(L)}finally{window.modal=_modal}
  const b=L.log[L.log.length-1];if(!q&&(!b||b.age!==L.age))say(L,pick(QUIET));
  checkChallenges(L);
  if(G.mode===2&&G.players.length>1){
    const oi=1-G.turn,o=G.players[oi];
    if(o&&o.alive)modal({title:`Au tour de ${o.first}`,icon:'🔁',text:`${L.first} a fini son année. Passe le téléphone à ${o.first} (${An(o.age)}).`,pc:oi,choices:[{t:'À moi de jouer',pri:1,fn:()=>{G.turn=oi;closeSheet()}}]});
  }
  save();render();
}
