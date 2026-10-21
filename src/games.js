/* Deux Vies — mini-jeux (s’affichent dans la fenêtre modale) */

function gameModal(title,icon,draw){modal({title,icon,html:'',choices:[],mount:el=>{el.innerHTML='';draw(el)}})}
const gbtn=(id,t,pri,dis)=>`<button type="button" class="btn${pri?' pri':''}" data-g="${id}"${dis?' disabled':''}>${esc(t)}</button>`;
function finishGame(L,msg,log){if(log)say(L,msg);save();endModal(msg)}

/* Blackjack */
function gBlackjack(L,bet){
  const deck=shuffle([].concat(...['♠','♥','♦','♣'].map(s=>['A','2','3','4','5','6','7','8','9','10','V','D','R'].map(v=>({v,s})))));
  const d=()=>deck.pop();const P=[d(),d()],D=[d(),d()];let done=false,msg='',stake=bet;
  const val=h=>{let t=0,a=0;for(const c of h){if(c.v==='A'){a++;t+=11}else if('VDR'.includes(c.v)||c.v==='10')t+=10;else t+=+c.v}while(t>21&&a){t-=10;a--}return t};
  const cardH=(c,hide)=>hide?'<span class="pc back">🂠</span>':`<span class="pc${c.s==='♥'||c.s==='♦'?' red':''}">${c.v}<small>${c.s}</small></span>`;
  const settle=()=>{done=true;const p=val(P);while(val(D)<17)D.push(d());const q=val(D);
    if(p>21){msg=`Tu dépasses 21. Tu perds ${fmt(stake)}.`}
    else if(p===21&&P.length===2&&!(q===21&&D.length===2)){L.money+=Math.round(stake*2.5);msg=`Blackjack ! Tu gagnes ${fmt(stake*1.5)}.`}
    else if(q>21||p>q){L.money+=stake*2;msg=`Tu gagnes ${fmt(stake)} !`}
    else if(p===q){L.money+=stake;msg='Égalité : tu récupères ta mise.'}
    else msg=`La banque gagne. Tu perds ${fmt(stake)}.`};
  gameModal(`Blackjack · mise ${fmt(bet)}`,'🃏',el=>{
    const draw=()=>{el.innerHTML=`<div class="table"><div class="hand"><small>Croupier ${done?'· '+val(D):''}</small><div>${D.map((c,i)=>cardH(c,!done&&i===1)).join('')}</div></div><div class="hand"><small>Toi · ${val(P)}</small><div>${P.map(c=>cardH(c)).join('')}</div></div>${done?`<p class="gmsg">${esc(msg)}</p>`:''}</div><div class="gbtns">${done?gbtn('end','Continuer',1):gbtn('hit','Tirer une carte',1)+gbtn('stand','Rester')+gbtn('dbl','Doubler la mise',0,P.length>2||L.money<bet)}</div>`};
    el.onclick=e=>{const b=e.target.closest('[data-g]');if(!b||b.disabled)return;const k=b.dataset.g;
      if(k==='hit'){P.push(d());if(val(P)>=21)settle()}
      else if(k==='stand')settle();
      else if(k==='dbl'){L.money-=bet;stake=bet*2;P.push(d());settle()}
      else if(k==='end'){finishGame(L,msg,stake>=10000);return}
      draw()};
    if(val(P)===21)settle();draw();
  });
}

/* Machines à sous */
function gSlots(L,bet){
  const S=['🍒','🍋','🔔','⭐','💎','7️⃣'];let reels=['❔','❔','❔'],msg='',spinning=true;
  gameModal(`Machine à sous · ${fmt(bet)}`,'🎰',el=>{
    const draw=()=>{el.innerHTML=`<div class="slots">${reels.map(r=>`<span>${r}</span>`).join('')}</div>${msg?`<p class="gmsg">${esc(msg)}</p>`:''}<div class="gbtns">${spinning?gbtn('x','Les rouleaux tournent…',0,1):gbtn('end','Continuer',1)}</div>`};
    el.onclick=e=>{const b=e.target.closest('[data-g]');if(b&&b.dataset.g==='end')finishGame(L,msg,bet>=1000)};
    let n=0;const iv=setInterval(()=>{reels=reels.map(()=>pick(S));draw();if(++n>12){clearInterval(iv);
      reels=[pick(S),pick(S),pick(S)];if(chance(.12))reels[1]=reels[0];if(chance(.06))reels[2]=reels[0];
      const [a,b,c]=reels;let m=0;if(a===b&&b===c)m={'💎':50,'7️⃣':25,'⭐':12}[a]||6;else if(a===b||b===c||a===c)m=1.5;
      if(m){L.money+=Math.round(bet*m);msg=`Gagné ! Tu remportes ${fmt(bet*m)}.`}else msg='Perdu.';spinning=false;draw()}},90);
    draw();
  });
}

/* Courses hippiques */
function gHorses(L,bet){
  const H=[['Éclair de Lune',2],['Petit Tonnerre',3],['Belle de Mai',5],['Prince Noir',8],['Caramel Mou',12],['Ultime Chance',20]];
  let pickI=-1,pos=H.map(()=>0),winner=-1,msg='';
  gameModal(`Courses hippiques · ${fmt(bet)}`,'🐎',el=>{
    const draw=()=>{el.innerHTML=`<p class="gsub">${pickI<0?'Sur quel cheval paries-tu ?':'Ils sont partis !'}</p><div class="race">${H.map(([n,o],i)=>`<div class="lane${i===pickI?' mine':''}"><span class="hn">${esc(n)} <small>×${o}</small></span><span class="track"><i style="left:calc(${pos[i]}% - ${pos[i]*.22}px)">🏇</i></span></div>`).join('')}</div>${msg?`<p class="gmsg">${esc(msg)}</p>`:''}<div class="gbtns">${pickI<0?H.map((h,i)=>gbtn('h'+i,h[0])).join(''):winner>=0?gbtn('end','Continuer',1):''}</div>`};
    el.onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;const k=b.dataset.g;
      if(k==='end'){finishGame(L,msg,bet>=2000);return}
      if(k[0]==='h'&&pickI<0){pickI=+k.slice(1);const w={};H.forEach((h,i)=>w[i]=1/h[1]);const W=+wpick(w);
        const iv=setInterval(()=>{pos=pos.map((p,i)=>Math.min(100,p+R(1,5)+(i===W?1.6:0)));const f=pos.findIndex(p=>p>=100);
          if(f>=0){clearInterval(iv);winner=f;if(winner===pickI){L.money+=bet*H[pickI][1];msg=`${H[pickI][0]} l’emporte ! Tu gagnes ${fmt(bet*H[pickI][1])}.`}else msg=`${H[winner][0]} gagne la course. Tu perds ta mise.`}draw()},70)}
      draw()};
    draw();
  });
}

/* Jeu à gratter */
function gScratch(L){
  const vals=[0,0,2,5,10,20,100,1000];let grid=Array.from({length:9},()=>pick(vals));
  if(chance(.3)){const v=pick([2,5,10,20,100,1000].slice(0,chance(.9)?4:6));const idx=shuffle([0,1,2,3,4,5,6,7,8]).slice(0,3);idx.forEach(i=>grid[i]=v)}
  const open=Array(9).fill(false);let msg='';
  const res=()=>{const c={};grid.forEach(v=>{if(v)c[v]=(c[v]||0)+1});const w=Object.keys(c).filter(v=>c[v]>=3).map(Number);return w.length?Math.max(...w):0};
  gameModal('Jeu à gratter','🪙',el=>{
    const draw=()=>{el.innerHTML=`<p class="gsub">Trois montants identiques et tu gagnes ce montant.</p><div class="scratch">${grid.map((v,i)=>`<button type="button" class="cell${open[i]?' open':''}" data-g="c${i}">${open[i]?(v?fmt(v):'—'):'?'}</button>`).join('')}</div>${msg?`<p class="gmsg">${esc(msg)}</p>`:''}<div class="gbtns">${msg?gbtn('end','Continuer',1):gbtn('all','Tout gratter')}</div>`};
    const check=()=>{if(open.every(Boolean)){const g=res();if(g){L.money+=g;msg=`Gagné : ${fmt(g)} !`;if(g>=1000)say(L,`🪙 Ticket gagnant : ${fmt(g)}.`)}else msg='Perdu.'}};
    el.onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;const k=b.dataset.g;
      if(k==='end'){finishGame(L,msg);return}
      if(k==='all')open.fill(true);else if(k[0]==='c')open[+k.slice(1)]=true;
      if(!msg)check();draw()};
    draw();
  });
}

/* Évasion : labyrinthe */
function makeMaze(n){
  const g=Array.from({length:n},()=>Array(n).fill(1));const st=[[1,1]];g[1][1]=0;
  while(st.length){const [x,y]=st[st.length-1];const nb=shuffle([[2,0],[-2,0],[0,2],[0,-2]]).map(([dx,dy])=>[x+dx,y+dy,x+dx/2,y+dy/2]).filter(([a,b])=>a>0&&b>0&&a<n-1&&b<n-1&&g[b][a]);
    if(!nb.length){st.pop();continue}const [a,b,c,d]=nb[0];g[b][a]=0;g[d][c]=0;st.push([a,b])}
  for(let i=0;i<n*1.2;i++){const x=R(1,n-2),y=R(1,n-2);if((x+y)%2)g[y][x]=0}
  g[n-2][n-1]=0;return g;
}
function gEscape(L){
  const n=11;const g=makeMaze(n);let p=[1,1];const exit=[n-1,n-2];
  const free=[];for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)if(!g[y][x]&&x+y>8)free.push([x,y]);
  let guards=shuffle(free).slice(0,2+(L.prison>5?1:0));let over='',moves=0;
  const step=(dx,dy)=>{if(over)return;const nx=p[0]+dx,ny=p[1]+dy;if(nx<0||ny<0||nx>=n||ny>=n||g[ny][nx])return;p=[nx,ny];moves++;
    if(nx===exit[0]&&ny===exit[1]){over='win';return}
    guards=guards.map(([x,y])=>{const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[x+a,y+b]).filter(([a,b])=>a>0&&b>0&&a<n&&b<n&&!g[b][a]);if(!opts.length)return [x,y];
      if(chance(.55)){opts.sort((A,B)=>Math.abs(A[0]-p[0])+Math.abs(A[1]-p[1])-Math.abs(B[0]-p[0])-Math.abs(B[1]-p[1]));return opts[0]}return pick(opts)});
    if(guards.some(([x,y])=>x===p[0]&&y===p[1]))over='lose'};
  gameModal('Évasion','🗝️',el=>{
    const draw=()=>{let h='<div class="maze" style="--n:'+n+'">';for(let y=0;y<n;y++)for(let x=0;x<n;x++){const gu=guards.some(([a,b])=>a===x&&b===y);h+=`<span class="${g[y][x]?'w':'f'}">${p[0]===x&&p[1]===y?'🏃':gu?'👮':x===exit[0]&&y===exit[1]?'🚪':''}</span>`}h+='</div>';
      el.innerHTML=`<p class="gsub">Rejoins la porte 🚪 sans croiser les surveillants 👮.</p>${h}${over?`<p class="gmsg">${over==='win'?'Tu t’es évadé !':'Un surveillant te plaque au sol.'}</p>`:''}<div class="pad">${over?gbtn('end','Continuer',1):`<span></span>${gbtn('u','↑')}<span></span>${gbtn('l','←')}${gbtn('d','↓')}${gbtn('r','→')}`}</div>`};
    const key=e=>{const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m&&!over){e.preventDefault();step(...m);draw()}};
    document.addEventListener('keydown',key);
    el.onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;const k=b.dataset.g;
      if(k==='end'){document.removeEventListener('keydown',key);
        if(over==='win'){L.prison=0;L.wanted=true;L.jail={gang:null,resp:0};track(L,'escaped');chg(L,{happy:15});finishGame(L,'🗝️ Évasion réussie ! Tu te fonds dans la nature.',true)}
        else{L.prison+=2;chg(L,{happy:-8});finishGame(L,`${ge(L,'Rattrapé','Rattrapée')} par les surveillants. Deux ans de plus.`,true)}return}
      step(...{u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}[k]);draw()};
    draw();
  });
}

/* Cambriolage */
function gBurglary(L,C){
  const rooms=shuffle([['Salon','📺'],['Cuisine','🍳'],['Chambre','🛏️'],['Bureau','🖥️'],['Garage','🚗'],['Grenier','📦']]).slice(0,5);
  const done=Array(rooms.length).fill(false);let loot=0,alarm=0,msg='',over=false;const items=[];
  gameModal('Cambriolage','🏠',el=>{
    const draw=()=>{el.innerHTML=`<p class="gsub">Fouille les pièces, mais chaque bruit rapproche l’alarme.</p><div class="alarm">${[0,1,2].map(i=>`<i class="${i<alarm?'on':''}"></i>`).join('')}<span>Bruit</span></div><div class="rooms">${rooms.map(([n,ic],i)=>`<button type="button" class="room${done[i]?' done':''}" data-g="r${i}"${done[i]||over?' disabled':''}><span>${ic}</span>${esc(n)}</button>`).join('')}</div><p class="gsub">Butin : <b>${fmt(loot)}</b>${items.length?' · '+esc(items.join(', ')):''}</p>${msg?`<p class="gmsg">${esc(msg)}</p>`:''}<div class="gbtns">${over?gbtn('end','Continuer',1):gbtn('leave','Partir avec le butin',1)}</div>`};
    el.onclick=e=>{const b=e.target.closest('[data-g]');if(!b||b.disabled)return;const k=b.dataset.g;
      if(k==='end'){if(alarm>=3){track(L,'crimes');chg(L,{karma:-4,happy:-8});say(L,`🚔 L’alarme se déclenche. Tu es ${ge(L,'arrêté','arrêtée')}.`);endModal('');trial(L,C)}else finishGame(L,msg,true);return}
      if(k==='leave'){over=true;L.money+=loot;track(L,'crimes');chg(L,{karma:-6,happy:3});msg=loot?`Tu repars avec ${fmt(loot)} de butin.`:'Tu repars bredouille.'}
      else{const i=+k.slice(1);done[i]=true;const r=Math.random();
        if(r<.55){const v=R(100,3000)*(i+1);loot+=v;items.push(pick(['une montre','des bijoux','un ordinateur','du liquide','un tableau','une console']))}
        else if(r<.85){alarm++;if(alarm>=3){over=true;msg='La lumière s’allume. Des sirènes approchent…'}}
      }
      draw()};
    draw();
  });
}
