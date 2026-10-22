/* Deux Vies — bilan de fin de vie : prix décernés, épitaphe et carte à partager (image). */
function lifeAwards(L){
  const t=L.tr||{},nw=netWorth(L),A=[];
  const add=(score,ic,n,d)=>A.push({score,ic,n,d});
  if(nw>=1e6)add(9,'💰','Millionnaire',fmtk(nw)+' laissés');
  if((t.given||0)>=5000)add(8,'💝','Le plus généreux',fmtk(t.given)+' donnés');
  if((t.kidsMax||0)>=3)add(7,'👨‍👩‍👧‍👦','Grande famille',(t.kidsMax)+' enfants');
  if((t.marriedYears||0)>=25)add(7,'💍','Fidèle',(t.marriedYears)+' ans de mariage');
  if((t.marriages||0)>=3)add(5,'💔','Cœur d’artichaut',(t.marriages)+' mariages');
  if((t.trips||0)>=5)add(6,'🌍','Globe-trotteur',(t.trips)+' voyages');
  if((t.fameMax||0)>=60||L.fame>=60)add(8,'⭐','Célébrité','connu' +ge(L,'','e')+' de tous');
  if((t.crimes||0)>=8)add(6,'🕶️','Casier chargé',(t.crimes)+' mauvais coups');
  if((t.jackpot||0)>=1)add(6,'🍀','Chanceux','un jackpot');
  if((t.houses||0)>=3)add(5,'🏠','Propriétaire',(t.houses)+' biens');
  if((t.pets||0)>=3)add(4,'🐾','Ami des bêtes',(t.pets)+' animaux');
  if((t.scandals||0)>=2)add(5,'📰','Dans les journaux',(t.scandals)+' scandales');
  if(L.st&&L.st.smarts>=90)add(4,'🧠','Esprit brillant','');
  const dn=(L.dreams||[]).filter(d=>d.done!=null).length;if(dn>=2)add(7,'🌟','Rêveur comblé',dn+' rêves réalisés');
  if(L.persona&&L.persona.bestYears>=10)add(6,'🪞',ge(L,'Fidèle à lui-même','Fidèle à elle-même'),`${L.persona.bestName} pendant ${L.persona.bestYears} ans`);
  if((L.rec&&L.rec.bestie&&L.rec.bestie.step>=5))add(5,'🤝','Ami pour la vie','un meilleur ami d’enfance gardé');
  if(L.age>=95)add(6,'🎂','Centenaire ou presque',L.age+' ans');
  A.sort((a,b)=>b.score-a.score);
  return A.slice(0,3);
}
function lifeEpitaph(L){
  const t=L.tr||{},il=ge(L,'Il','Elle');
  if(netWorth(L)>=1e6)return `${il} a compté chaque euro, sauf les derniers.`;
  if((t.kidsMax||0)>=3)return `${il} laisse une grande famille et de gros souvenirs de Noël.`;
  if((t.crimes||0)>=8)return `${il} n’a jamais été vraiment innocent${ge(L,'','e')}, mais tellement sympathique.`;
  if((t.trips||0)>=5)return `${il} a vu du pays et en a rapporté des histoires.`;
  if(L.fame>=50)return 'Ses fans pleurent encore.';
  if(L.age<30)return `${il} est parti${ge(L,'','e')} trop tôt, mais pas sans avoir fait parler de ${ge(L,'lui','elle')}.`;
  return `${il} a vécu, tout simplement. C’est déjà beaucoup.`;
}
/* Proverbe et petit fait de fin de vie, choisis d’après le thème de la vie (même logique que l’épitaphe). */
const PROVERBS={rich:['L’argent ne fait pas le bonheur, mais il aide à le chercher.','Qui paie ses dettes s’enrichit.','On ne prête qu’aux riches.'],
  family:['Les enfants sont les ancres de la vie.','Tel arbre, tels fruits.','La famille, c’est là où la vie commence et où l’amour ne finit pas.'],
  crime:['L’occasion fait le larron.','Il ne faut jamais dire : fontaine, je ne boirai pas de ton eau.','Pas vu, pas pris.'],
  travel:['Les voyages forment la jeunesse.','Qui ne risque rien n’a rien.','Le monde appartient à ceux qui se lèvent tôt.'],
  fame:['Il n’y a pas de fumée sans feu.','Pour vivre heureux, vivons cachés.','La gloire est un feu de paille.'],
  young:['Vivre vite, c’est vivre deux fois.','Les plus belles bougies brûlent des deux bouts.','Rien ne sert de courir, il faut partir à point.'],
  plain:['Petit à petit, l’oiseau fait son nid.','Tout est bien qui finit bien.','On ne voit bien qu’avec le cœur.','Chaque jour suffit à sa peine… et à sa joie.']};
function lifeProverb(L){
  const t=L.tr||{};
  const theme=netWorth(L)>=1e6?'rich':(t.kidsMax||0)>=3?'family':(t.crimes||0)>=8?'crime':(t.trips||0)>=5?'travel':L.fame>=50?'fame':L.age<30?'young':'plain';
  const list=PROVERBS[theme];let h=0;for(const c of String(L.first||'')+String(L.last||''))h=(h*31+c.charCodeAt(0))>>>0;
  return list[h%list.length];
}
function lifeFact(L){const d=Math.round(L.age*365.25);return `Le saviez-vous ? Tu as vécu environ ${d.toLocaleString('fr-FR')} jours, soit à peu près ${Math.round(L.age*1095).toLocaleString('fr-FR')} repas.`}
/* Score de vie sur 100 : fortune, famille, prix, longévité, rêves, bonheur, notoriété. Sert à comparer deux vies. */
function lifeScore(L){
  const nw=Math.max(0,netWorth(L)),dn=(L.dreams||[]).filter(d=>d.done!=null).length;
  let s=Math.min(30,Math.log10(nw+1)*4);
  s+=Math.min(15,allKids(L).length*3)+Math.min(15,lifeAwards(L).length*5)+Math.min(15,(L.age||0)/6);
  s+=Math.min(10,dn*3.5)+Math.min(10,((L.st&&L.st.happy)||50)/10)+Math.min(5,(L.fame||0)/12);
  return Math.round(Math.max(0,Math.min(100,s)));
}
function lifeFacts(L){return [['Patrimoine',fmtk(netWorth(L))],['Dernier métier',cap(String(jobLabel(L)||'Sans emploi'))],['Enfants',String(allKids(L).length)],['Génération',String(L.gen||1)]]}

function cardWrap(x,text,cx,y,maxW,lh,maxLines){
  const words=String(text).split(' ');let line='',n=0;
  for(const w of words){const t=line?line+' '+w:w;if(x.measureText(t).width>maxW&&line){x.fillText(line,cx,y);y+=lh;line=w;if(++n>=maxLines-1)break}else line=t}
  x.fillText(line,cx,y);return y+lh;
}
function cardRound(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
function lifeCard(L){
  return new Promise((resolve,reject)=>{
    try{
      const W=1080,H=1500,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
      const NAVY='#1B1A47',F='"Baloo 2","Arial Rounded MT Bold","Nunito",system-ui,sans-serif';
      x.fillStyle='#FFF1CC';x.fillRect(0,0,W,H);x.fillStyle='#F8D98C';
      for(let j=0;j<H;j+=72)for(let i=0;i<W;i+=72){x.beginPath();x.arc(i+10,j+12,3.4,0,7);x.fill()}
      x.fillStyle=NAVY;x.fillRect(0,0,W,150);x.textAlign='center';x.textBaseline='alphabetic';
      x.font=`800 84px ${F}`;x.fillStyle='#fff';const w1=x.measureText('Double ').width,w2=x.measureText('Vie').width;
      x.textAlign='left';x.fillText('Double ',(W-w1-w2)/2,106);x.fillStyle='#FF6FAE';x.fillText('Vie',(W-w1-w2)/2+w1,106);x.textAlign='center';
      x.fillStyle=NAVY;cardRound(x,60,208,960,1214,44);x.fill();x.fillStyle='#fff';cardRound(x,60,196,960,1214,44);x.fill();x.lineWidth=8;x.strokeStyle=NAVY;x.stroke();
      const svg=AVATAR_R.render(L.look,{age:L.age,gender:L.gender,mood:62}).replace('<svg ','<svg width="440" height="440" ');
      const img=new Image();
      img.onload=()=>{
        x.save();x.beginPath();x.arc(540,400,165,0,7);x.clip();x.fillStyle='#FFF7E0';x.fillRect(370,230,340,340);x.drawImage(img,315,193,450,450);x.restore();
        x.lineWidth=10;x.strokeStyle=NAVY;x.beginPath();x.arc(540,400,165,0,7);x.stroke();
        x.fillStyle=NAVY;x.font=`800 78px ${F}`;x.fillText(`${L.first} ${L.last}`,540,680);
        x.fillStyle='#6A6896';x.font=`700 40px ${F}`;x.fillText(`${L.age} ans${L.cause?' · '+L.cause:''}`,540,735);
        const rb=(typeof RIBBONS!=='undefined'&&RIBBONS.find(r=>r.k===L.ribbon))||null;
        if(rb){x.font=`800 44px ${F}`;const tw=x.measureText(rb.n).width+90;x.fillStyle='#FFC63A';cardRound(x,540-tw/2,770,tw,76,38);x.fill();x.lineWidth=6;x.strokeStyle=NAVY;x.stroke();x.fillStyle=NAVY;x.fillText(`${rb.ic} ${rb.n}`,540,824)}
        x.fillStyle='#2D2B63';x.font=`italic 700 40px ${F}`;let y=cardWrap(x,'« '+lifeEpitaph(L)+' »',540,915,820,52,3);
        const facts=lifeFacts(L),gx=[130,560],gy=Math.max(y+10,1030);
        facts.forEach(([k,v],i)=>{const X=gx[i%2],Y=gy+Math.floor(i/2)*112;x.fillStyle='#FFF7E0';cardRound(x,X,Y,390,96,24);x.fill();x.lineWidth=4;x.strokeStyle='rgba(27,26,71,.25)';x.stroke();
          x.textAlign='left';x.fillStyle='#6A6896';x.font=`800 24px ${F}`;x.fillText(k.toUpperCase(),X+22,Y+36);x.fillStyle=NAVY;x.font=`800 38px ${F}`;let vv=v;while(x.measureText(vv).width>350&&vv.length>3)vv=vv.slice(0,-2);if(vv!==v)vv+='…';x.fillText(vv,X+22,Y+78);x.textAlign='center'});
        const aw=lifeAwards(L);if(aw.length){x.font=`800 28px ${F}`;let ax=0;const ws=aw.map(a=>x.measureText(`${a.ic} ${a.n}`).width+40),tot=ws.reduce((s,v)=>s+v,0)+12*(aw.length-1);ax=540-tot/2;
          aw.forEach((a,i)=>{x.fillStyle='#E5DCFF';cardRound(x,ax,gy+232,ws[i],60,30);x.fill();x.lineWidth=4;x.strokeStyle=NAVY;x.stroke();x.fillStyle=NAVY;x.textAlign='left';x.fillText(`${a.ic} ${a.n}`,ax+20,gy+273);x.textAlign='center';ax+=ws[i]+12})}
        x.fillStyle=NAVY;x.font=`700 32px ${F}`;x.fillText('Joue à Double Vie · '+location.host+location.pathname.replace(/index\.html$/,''),540,1462);
        c.toBlob(b=>b?resolve(b):reject(new Error('image')),'image/png');
      };
      img.onerror=()=>reject(new Error('avatar'));
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    }catch(e){reject(e)}
  });
}
async function shareLife(L,mode){
  try{
    const blob=await lifeCard(L);const name=`bilan-${String(L.first).toLowerCase().replace(/[^a-z0-9]+/g,'-')}.png`;
    const file=new File([blob],name,{type:'image/png'});
    if(mode==='share'&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Mon bilan de vie',text:`Voici la vie de ${L.first} dans Double Vie !`});return}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
    toast(mode==='share'?'Le partage n’est pas disponible ici : l’image est enregistrée.':'Image enregistrée.');
  }catch(e){if(e&&e.name==='AbortError')return;console.error(e);toast('Impossible de créer l’image.')}
}
