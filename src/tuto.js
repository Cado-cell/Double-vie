/* Deux Vies — prise en main : visite guidée du premier lancement et fenêtre « Quoi de neuf ». */
const TUTO=(()=>{
  const auto=()=>{try{return !navigator.webdriver||!!window.__forceTuto}catch(e){return true}};
  const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
  const firstVisit=get('dv.news')===null&&get('deuxvies.v2')===null;
  if(firstVisit&&window.DV_NEWS&&window.DV_NEWS.length)set('dv.news',window.DV_NEWS.join('|'));
  const STEPS=[
    ['#ageBtn','Touche ÂGE pour vivre une année','Un événement peut arriver : à toi de choisir. Tout s’enregistre tout seul.'],
    ['#idcard','Ton personnage','Ton argent, ton métier et ton âge. Touche ton visage pour voir ta fiche complète.'],
    ['#stats','Tes quatre jauges','Bonheur, santé, intelligence, apparence. Essaie de les garder bien remplies !'],
    ['#qa','Idées rapides','Le jeu te propose des raccourcis adaptés à ta situation du moment.'],
    ['.tabs','Ce que tu peux faire','École ou métier, biens, relations, activités : explore entre deux années.'],
    ['#menuBtn','Le Menu','Sauvegardes, sons, collection… Bonne vie !']
  ];
  let step=-1,box=null,asked=false,newsDone=false;
  const visible=e=>{if(!e||e.hidden)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
  const open=()=>!document.getElementById('modal').hidden||!document.getElementById('sheet').hidden;

  function draw(){
    if(!box)return;
    let i=step;while(i<STEPS.length&&!visible(document.querySelector(STEPS[i][0])))i++;
    if(i>=STEPS.length){finish();return}
    step=i;const [sel,title,text]=STEPS[i],t=document.querySelector(sel).getBoundingClientRect(),pad=6;
    const last=STEPS.slice(i+1).every(s=>!visible(document.querySelector(s[0])));
    box.innerHTML=`<div class="spot" style="left:${t.left-pad}px;top:${t.top-pad}px;width:${t.width+pad*2}px;height:${t.height+pad*2}px"></div>
      <div class="tip" role="dialog" aria-live="polite"><b>${title}</b><p>${text}</p>
      <div class="tr"><button type="button" class="skip">Passer</button><span class="dots">${STEPS.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</span><button type="button" class="next">${last?'Compris !':'Suivant'}</button></div></div>`;
    const tip=box.querySelector('.tip'),h=tip.offsetHeight;
    tip.style.top=(t.bottom+pad+16+h<innerHeight-8?t.bottom+pad+16:Math.max(8,t.top-pad-16-h))+'px';
    box.querySelector('.skip').onclick=finish;
    box.querySelector('.next').onclick=()=>{step++;if(last)finish();else draw()};
  }
  function start(){
    if(box)return;box=document.createElement('div');box.id='tuto';box.className='tuto';document.body.appendChild(box);step=0;draw();
    window.addEventListener('resize',draw);
  }
  function finish(){
    set('dv.tuto','1');if(box){box.remove();box=null}step=-1;window.removeEventListener('resize',draw);
  }

  function news(){
    const N=window.DV_NEWS;if(newsDone||!N||!N.length)return;newsDone=true;
    const sig=N.join('|'),seen=get('dv.news');set('dv.news',sig);
    if(firstVisit||seen===sig)return;
    modal({title:'Quoi de neuf ?',icon:'🆕',html:'<ul class="news">'+N.slice(0,4).map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>',choices:[{t:'Compris'}]});
  }

  function afterRender(L){
    if(!auto()||!G||!G.players||!L||box||open())return;
    if(!asked&&get('dv.tuto')!=='1'&&L.alive&&L.age<=1){asked=true;setTimeout(()=>{if(!open()&&!box)start()},450);return}
    if(!asked)news();
  }
  return {afterRender,start:()=>{finish();start()},finish,news};
})();
