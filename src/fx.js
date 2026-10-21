/* Deux Vies — effets de jeu : compteur d’argent, variations de jauges, confettis, vibrations et sons discrets.
   Tout est optionnel (Menu → Sons / Vibrations) et respecte « réduire les animations » du téléphone. */
const FX=(()=>{
  const st={haptic:true,sound:false};
  try{const v=JSON.parse(localStorage.getItem('dv.fx')||'{}');if(typeof v.haptic==='boolean')st.haptic=v.haptic;if(typeof v.sound==='boolean')st.sound=v.sound}catch(e){}
  const persist=()=>{try{localStorage.setItem('dv.fx',JSON.stringify(st))}catch(e){}};
  const calm=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
  const last={cash:{},st:{},log:{}};
  let ac=null;

  /* ---------- Sons (synthétisés, aucun fichier) ---------- */
  function tone(f,d,type,vol,when){
    if(!st.sound)return;
    try{
      ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();
      const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+(when||0);
      o.type=type;o.frequency.value=f;o.connect(g);g.connect(ac.destination);
      g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.02);
    }catch(e){}
  }
  const SOUNDS={
    tap:()=>tone(520,.07,'triangle',.05),
    age:()=>tone(660,.07,'sine',.05),
    coin:()=>{tone(880,.08,'square',.03);tone(1318,.14,'square',.03,.08)},
    bad:()=>{tone(220,.2,'sawtooth',.04);tone(165,.26,'sawtooth',.04,.14)},
    win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.18,'triangle',.05,i*.09))
  };
  const play=n=>{const f=SOUNDS[n];if(f)f()};
  const buzz=p=>{if(st.haptic&&navigator.vibrate){try{navigator.vibrate(p)}catch(e){}}};

  /* ---------- Calque d’effets ---------- */
  function layer(){let l=document.getElementById('fxl');if(!l){l=document.createElement('div');l.id='fxl';l.className='fxl';l.setAttribute('aria-hidden','true');document.body.appendChild(l)}return l}

  function confetti(n){
    if(calm())return;n=n||80;const L=layer(),W=innerWidth,H=innerHeight,cols=['#FF4F93','#2F6BFF','#FFC63A','#1FB254','#8B5CF6','#FF9A1F'];
    for(let i=0;i<n;i++){
      const p=document.createElement('i');p.className='cf';const w=6+Math.random()*6,h=8+Math.random()*8;
      p.style.cssText=`left:${Math.random()*W}px;width:${w}px;height:${h}px;background:${cols[i%cols.length]};border-radius:${Math.random()<.3?'50%':'2px'}`;
      L.appendChild(p);if(!p.animate){p.remove();continue}
      const dx=(Math.random()-.5)*160,dy=H*(.55+Math.random()*.45),rot=(Math.random()-.5)*900;
      const a=p.animate([{transform:'translate(0,-20px) rotate(0deg)',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg)`,opacity:1,offset:.85},{transform:`translate(${dx*1.1}px,${dy+30}px) rotate(${rot*1.1}deg)`,opacity:0}],{duration:1500+Math.random()*1200,delay:Math.random()*250,easing:'cubic-bezier(.25,.6,.4,1)',fill:'forwards'});
      a.onfinish=()=>p.remove();
    }
  }

  function deltas(items){
    if(calm()||!items.length)return;const host=document.getElementById('stats');if(!host)return;
    const r=host.getBoundingClientRect(),L=layer();
    items.slice(0,4).forEach(([e,d],i)=>{
      const el=document.createElement('div');el.className='fxd '+(d>0?'up':'down');el.textContent=`${d>0?'+':'−'}${Math.abs(d)} ${e}`;
      el.style.left=Math.max(8,Math.min(innerWidth-90,r.left+10+i*((r.width-20)/4)))+'px';el.style.top=(r.top-6)+'px';
      L.appendChild(el);if(!el.animate){el.remove();return}
      const a=el.animate([{transform:'translateY(6px) scale(.8)',opacity:0},{transform:'translateY(-10px) scale(1.05)',opacity:1,offset:.2},{transform:'translateY(-44px) scale(1)',opacity:1,offset:.75},{transform:'translateY(-62px)',opacity:0}],{duration:1500,delay:i*120,easing:'ease-out',fill:'both'});
      a.onfinish=()=>el.remove();
    });
  }

  /* ---------- Réactions au journal de l’année ---------- */
  const WIN=/(^|\s)(🎓|💒|👶|🎉|🏆|🥇|🎂|💍|🎊)|JACKPOT|diplôm|décroches ton bac|promotion|se marie|félicitations|enceinte|accouch/i;
  const BAD=/(^|\s)(☠️|🕯️|🚑|🔒)|décès|est mort|est morte|meurt|licenci|accident|divorc|te quitte|condamn|incendie/i;
  function reactions(txt){
    if(WIN.test(txt)){confetti();play('win');buzz([30,40,30])}
    else if(BAD.test(txt)){play('bad');buzz([60,40,80])}
  }

  /* ---------- Appelé après chaque affichage de l’écran principal ---------- */
  function afterRender(L){
    if(!G||!L)return;const k=G.turn+'|'+L.first+'|'+L.last+'|'+(L.gen||1);const quiet=document.hidden;
    const cn=document.querySelector('#idcard .cn');
    if(cn){
      const to=+cn.dataset.v,from=last.cash[k];last.cash[k]=to;
      if(from!=null&&from!==to&&!calm()&&!quiet){
        const cash=cn.closest('.cash');if(cash)cash.classList.add(to>from?'up':'down');
        if(to-from>=1000)play('coin');
        const t0=performance.now();cn.textContent=fmt(from);
        const step=t=>{const p=Math.min(1,(t-t0)/700),e=1-Math.pow(1-p,3);cn.textContent=fmt(from+(to-from)*e);
          if(p<1)requestAnimationFrame(step);else setTimeout(()=>{if(cash)cash.classList.remove('up','down')},500)};
        requestAnimationFrame(step);
      }
    }
    const cu={happy:L.st.happy,health:L.st.health,smarts:L.st.smarts,looks:L.st.looks},pv=last.st[k];last.st[k]=cu;
    if(pv&&!quiet){
      const it=[];for(const [f,e] of [['happy','😊'],['health','❤️'],['smarts','🧠'],['looks','✨']]){const d=Math.round(cu[f]-pv[f]);if(Math.abs(d)>=2)it.push([e,d])}
      it.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));deltas(it);
    }
    const lb=L.log&&L.log[L.log.length-1];
    if(lb){
      const sig={age:lb.age,n:lb.lines.length},pl=last.log[k];last.log[k]=sig;
      if(pl&&!quiet){
        const fresh=pl.age===sig.age?(sig.n>pl.n?lb.lines.slice(pl.n):[]):lb.lines;
        if(fresh.length)reactions(fresh.join(' '));
      }
    }
  }

  function toggle(key){st[key]=!st[key];persist();if(st.sound)play('tap');if(st.haptic&&key==='haptic')buzz(20);try{render()}catch(e){}}

  document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('.age');if(b&&!b.disabled){buzz(8);play('age')}},true);

  return {st,toggle,afterRender,confetti,deltas,play,buzz,modal:()=>{buzz(12);play('tap')}};
})();
