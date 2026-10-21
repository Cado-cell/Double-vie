/* Deux Vies — module « Sauvegardes » (id saves)
   6 emplacements (deuxvies.slot.1-6), 3 copies automatiques tournantes (deuxvies.auto.0-2), export/import JSON, rapport d’erreur. */
(()=>{
const SLOTS=6,AUTO=3,ERRS=[];
let toasted=false;
const sk=i=>'deuxvies.slot.'+i,ak=i=>'deuxvies.auto.'+i;
const lsGet=k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}};
const lsSet=(k,o)=>{try{localStorage.setItem(k,JSON.stringify(o));return null}catch(e){
  return e&&(e.name==='QuotaExceededError'||e.code===22||e.code===1014||/quota/i.test(e.message||''))?'Espace de stockage plein : supprime un emplacement ou exporte ta partie.':'Stockage indisponible sur cet appareil.'}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
function summary(){
  try{const ps=(G&&G.players)||[];const gen=Math.max(1,...ps.map(p=>(p&&p.gen)||1));
    return ps.map(p=>`${p.first} (${p.age} ans${p.alive===false?', décédé'+(p.gender==='F'?'e':''):''})`).join(', ')+' · génération '+gen}catch(e){return 'Partie en cours'}
}
function snap(name){return {name,savedAt:new Date().toISOString(),summary:summary(),json:JSON.stringify(G)}}
const when=s=>{try{return new Date(s).toLocaleString('fr-FR',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}};
const valid=o=>!!o&&typeof o==='object'&&Array.isArray(o.players)&&o.players.length>0;
function load(json){
  let o;try{o=JSON.parse(json)}catch(e){return 'Sauvegarde illisible.'}
  if(!valid(o))return 'Sauvegarde invalide : aucune vie trouvée.';
  G=o;try{migrate()}catch(e){console.error(e)}
  try{modCall('worldInit')}catch(e){console.error(e)}
  closeSheet();render();return 'Partie chargée.';
}
function el(id){return document.getElementById(id)}
function copyText(id,okMsg){
  const t=el(id);if(!t)return 'Champ introuvable.';
  const txt=t.value;
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(()=>toast(okMsg),()=>{t.select();toast('Sélectionné : copie-le avec Ctrl+C.')});return ''}}catch(e){}
  try{t.select();t.setSelectionRange(0,txt.length);if(document.execCommand&&document.execCommand('copy'))return okMsg}catch(e){}
  return 'Sélectionné : copie-le avec Ctrl+C.';
}
function importText(txt){
  let o;try{o=JSON.parse(txt)}catch(e){return null}
  return valid(o)?txt:null;
}
function ask(title,text,fn,label){pushPanel(confirmP(title,text,fn,label))}

/* ---------- Panneaux ---------- */
function pSlot(i){return ()=>{
  const d=lsGet(sk(i));
  return {title:'Emplacement '+i,html:(d?note(`${d.name} · ${when(d.savedAt)} · ${d.summary||''}`):note('Emplacement libre.'))+group('',[
    row({ic:'💾',t:'Enregistrer ici',s:d?'Remplace la sauvegarde existante':'Sauvegarde la partie en cours',right:'›',a:()=>{
      const doIt=()=>{const e=lsSet(sk(i),snap('Emplacement '+i));return e||`Partie enregistrée (emplacement ${i}).`};
      if(d)ask('Écraser ?',`L’emplacement ${i} contient déjà une partie. Elle sera remplacée.`,()=>{back2(doIt)},'Écraser');else{run(doIt);}}}),
    d?row({ic:'📂',t:'Charger',s:'Remplace la partie en cours',right:'›',a:()=>ask('Charger ?','La partie en cours sera remplacée. Pense à l’enregistrer avant.',()=>load(d.json),'Charger')}):'',
    d?row({ic:'🗑️',t:'Supprimer',danger:1,a:()=>ask('Supprimer ?','Cette sauvegarde sera effacée définitivement.',()=>{lsDel(sk(i));return 'Emplacement vidé.'},'Supprimer')}):''])};
}}
function back2(f){const r=f();if(r)toast(r)}
function main(){
  let size='?';try{size=(JSON.stringify(G).length/1024).toFixed(1).replace('.',',')+' Ko'}catch(e){}
  const slots=[];for(let i=1;i<=SLOTS;i++){const d=lsGet(sk(i));slots.push(nav(d?'💾':'📄',d?d.name:'Emplacement '+i+' (libre)',d?`${when(d.savedAt)} · ${d.summary||''}`:'Touche pour enregistrer',pSlot(i)))}
  const autos=[];for(let i=0;i<AUTO;i++){const d=lsGet(ak(i));if(d)autos.push(row({ic:'🔄',t:'Copie du '+when(d.savedAt),s:d.summary||'',right:'›',a:()=>ask('Charger la copie ?','La partie en cours sera remplacée.',()=>load(d.json),'Charger')}))}
  let json='';try{json=JSON.stringify(G)}catch(e){}
  const rep=ERRS.map(e=>`[${e.t}] ${e.m}${e.s?'\n'+e.s:''}`).join('\n\n');
  return {title:'Sauvegardes',html:note('Taille de la sauvegarde courante : '+size+'. La partie est aussi enregistrée automatiquement dans ce navigateur.')
    +group('Emplacements',slots)+group('Copies automatiques',autos.length?autos:[])+(autos.length?'':note('Aucune copie automatique pour l’instant : elles arrivent à chaque nouvelle année.'))
    +`<h3 class="sec">Exporter</h3>`+note('Copie ce texte pour garder ta partie ailleurs.')
    +`<textarea id="sv-json" readonly rows="4" style="width:100%;font:12px monospace">${esc(json)}</textarea>`
    +group('',[row({ic:'📋',t:'Copier',a:()=>{const r=copyText('sv-json','Sauvegarde copiée.');if(r)toast(r)}})])
    +`<h3 class="sec">Importer</h3>`+note('Colle une sauvegarde ou choisis un fichier, puis importe.')
    +`<textarea id="sv-in" rows="3" style="width:100%;font:12px monospace" placeholder="Colle ici le texte de sauvegarde"></textarea>`
    +`<input type="file" id="sv-file" accept=".json,.txt,application/json,text/plain" style="margin:8px 0;max-width:100%">`
    +group('',[row({ic:'📥',t:'Importer',s:'Remplace la partie en cours',a:()=>{
      const doImp=txt=>{if(!importText(txt)){toast('Texte invalide : aucune vie trouvée.');return}
        ask('Importer ?','La partie en cours sera remplacée par cette sauvegarde.',()=>load(txt),'Importer')};
      const f=el('sv-file'),t=el('sv-in');
      if(t&&t.value.trim())return doImp(t.value.trim());
      if(f&&f.files&&f.files[0]){try{const fr=new FileReader();fr.onload=()=>doImp(String(fr.result||'').trim());fr.onerror=()=>toast('Lecture du fichier impossible.');fr.readAsText(f.files[0])}catch(e){toast('Lecture du fichier impossible.')}return}
      toast('Colle un texte ou choisis un fichier d’abord.')}})])
    +`<h3 class="sec">Rapport d’erreur</h3>`+(ERRS.length?note(ERRS.length+' erreur(s) enregistrée(s) pendant cette session.'):note('Aucune erreur pour l’instant.'))
    +`<textarea id="sv-err" readonly rows="4" style="width:100%;font:12px monospace">${esc(rep)}</textarea>`
    +group('',[row({ic:'📋',t:'Copier le rapport',a:()=>{const r=copyText('sv-err','Rapport copié.');if(r)toast(r)}})])};
}

/* ---------- Erreurs ---------- */
function addErr(m,s){
  try{ERRS.push({t:new Date().toLocaleTimeString('fr-FR'),m:String(m||'Erreur inconnue').slice(0,300),s:String(s||'').split('\n').slice(0,4).join('\n').slice(0,500)});
    while(ERRS.length>20)ERRS.shift();
    if(!toasted){toasted=true;if(typeof toast==='function')toast('Une erreur est survenue : voir Menu > Sauvegardes')}}catch(e){}
}
if(typeof window!=='undefined'&&window.addEventListener){
  window.addEventListener('error',e=>{try{addErr(e&&e.message,e&&e.error&&e.error.stack)}catch(x){}});
  window.addEventListener('unhandledrejection',e=>{try{const r=e&&e.reason;addErr(r&&r.message||r,r&&r.stack)}catch(x){}});
}

registerMod({id:'saves',
  menuRows(L){return [nav('💾','Sauvegardes','Emplacements, export, import, erreurs',main)]},
  year(L){
    try{if(!G||!valid(G))return;
      const prev=[];for(let i=0;i<AUTO;i++)prev.push(localStorage.getItem(ak(i)));
      const next=JSON.stringify(snap('Copie automatique'));
      const arr=[next,prev[0],prev[1]];
      for(let i=0;i<AUTO;i++){if(arr[i])try{localStorage.setItem(ak(i),arr[i])}catch(e){break}}
    }catch(e){}
  }
});
})();
