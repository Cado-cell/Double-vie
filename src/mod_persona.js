/* Deux Vies — module « Personnalité qui se révèle » (id persona)
   Ce que tu fais le plus souvent façonne qui tu es. Chaque année, le jeu additionne tes habitudes (soirées, travail, études, voyages,
   dons, sport, famille) ; quand l'une domine nettement, les autres te voient comme un « Fêtard », un « Bosseur »… Cette personnalité
   amène des évènements à elle, et rester fidèle à soi-même rend heureux (récompense tous les 5 ans, prix dans le bilan).
   État par vie : L.persona = {arch, years, bestYears, bestName}. */
(()=>{
const MOD='persona';
const k=(L,n)=>(L.tr&&L.tr['k_'+n])||0,t=(L,n)=>(L.tr&&L.tr[n])||0;
const ARCH={
  fete:{ic:'🥳',n:['Fêtard','Fêtarde'],d:'Toujours partant pour la soirée suivante.',s:L=>2*(k(L,'party')+k(L,'bar')+k(L,'club')+k(L,'fest'))+k(L,'bar_love')},
  bosseur:{ic:'💼',n:['Bosseur','Bosseuse'],d:'Le travail d’abord, le reste ensuite.',s:L=>2*k(L,'work')+3*k(L,'promo')+2*k(L,'raise')+8*t(L,'topCareer')+(L.job?(L.job.y||0)*.5:0)},
  cerveau:{ic:'🧠',n:['Cérébral','Cérébrale'],d:'Un livre, une idée, une conférence : tout est bon pour apprendre.',s:L=>2*(k(L,'study')+k(L,'lib'))+k(L,'doc')+3*k(L,'dip')+k(L,'prof')+3*((L.edu&&L.edu.degrees&&L.edu.degrees.length)||0)},
  aventurier:{ic:'🧭',n:['Aventurier','Aventurière'],d:'Le prochain billet d’avion t’attend déjà.',s:L=>3*t(L,'trips')+1.5*t(L,'crimes')+2*k(L,'speed')+2*t(L,'missions')+5*t(L,'escaped')},
  genereux:{ic:'💝',n:['Grand cœur','Grand cœur'],d:'Donner te fait plus de bien qu’à ceux qui reçoivent.',s:L=>t(L,'given')/400+3*k(L,'benevolat')+2*k(L,'adopt')+Math.max(0,((L.hid&&L.hid.karma)||50)-50)/3},
  zen:{ic:'🧘',n:['Zen','Zen'],d:'Respirer, marcher, courir : le calme avant tout.',s:L=>2*k(L,'gym')+k(L,'yoga')+k(L,'med')+k(L,'walk')+k(L,'diet')},
  famille:{ic:'👨‍👩‍👧',n:['Pilier de famille','Pilier de famille'],d:'Les tiens sont ton monde.',s:L=>4*allKids(L).length+.8*t(L,'marriedYears')+(L.family||[]).filter(p=>p.alive!==false&&p.rel>=75&&(p.type==='parent'||p.type==='sibling'||p.type==='child')).length}
};
const KEYS=Object.keys(ARCH);
const nm=(L,a)=>ARCH[a].n[L.gender==='F'?1:0];
const ps=L=>{if(!L.persona||typeof L.persona!=='object')L.persona={arch:null,years:0,bestYears:0,bestName:''};return L.persona};
const scores=L=>KEYS.map(a=>[a,Math.round(ARCH[a].s(L)*10)/10]).sort((x,y)=>y[1]-x[1]);

function year(L){
  if(!L||L.age<14||L.alive===false)return;
  const P=ps(L),sc=scores(L),[a,s1]=sc[0],s2=sc[1][1];
  const clear=s1>=14&&s1>=s2*1.25?a:null;
  if(!clear){if(P.arch){P.arch=null;P.years=0}return}
  if(P.arch===clear){
    P.years++;
    if(P.years>P.bestYears){P.bestYears=P.years;P.bestName=nm(L,clear)}
    if(P.years%5===0){chg(L,{happy:3});track(L,'coherent');say(L,`🪞 Cela fait ${P.years} ans que tu es fidèle à toi-même : « ${nm(L,clear)} ». Ça rend ${ge(L,'heureux','heureuse')}.`)}
    return;
  }
  const first=!P.bestYears&&!P.arch;
  P.arch=clear;P.years=1;if(!P.bestYears){P.bestYears=1;P.bestName=nm(L,clear)}
  say(L,`🪞 ${first?'Ta personnalité se dessine':'Les gens te voient autrement'} : on te prend maintenant pour ${ARCH[clear].ic} « ${nm(L,clear)} ».`);
}

const conds={arch:(L,args)=>!!(L.persona&&L.persona.arch===args.k)};
const E=(id,k,icon,prompt,choices)=>({id:'persona_'+id,category:'persona',icon,conditions:Object.assign({min_age:16,mod_cond:{mod:MOD,fn:'arch',args:{k}}},id==='bosseur'?{has_job:true}:{}),probability_weight:.14,prompt_text:prompt,choices});
const eventsDb=[
  E('fete','fete','🎶','Un ami t’envoie un message : « After chez moi, tout de suite, ramène du monde ! » Il est deux heures du matin.',[
    {choice_text:'Y aller, évidemment.',consequences:{happiness_modifier:5,health_modifier:-2,bank_balance_modifier:-60,result_text:'Tu rentres au lever du soleil avec un chapeau qui n’est pas le tien.'}},
    {choice_text:'Passer ton tour pour une fois.',consequences:{happiness_modifier:-1,health_modifier:1,result_text:'Tu dors huit heures. Ça ne te ressemble pas, et tu te sens bizarrement fier.'}},
    {choice_text:'Organiser la prochaine chez toi.',consequences:{happiness_modifier:4,bank_balance_modifier:-150,add_friend:{},result_text:'Ta soirée devient une légende de l’immeuble. Quelqu’un a oublié un canapé.'}}]),
  E('bosseur','bosseur','📞','Un chasseur de têtes t’appelle : « On entend beaucoup de bien de vous. Un café, cette semaine ? »',[
    {choice_text:'Négocier une meilleure offre.',consequences:{salary_multiplier:1.05,job_performance_modifier:3,result_text:'Ton patron comprend soudain ton vrai potentiel. Ton salaire aussi.'}},
    {choice_text:'Rester fidèle à ton équipe.',consequences:{karma_modifier:1,happiness_modifier:2,job_performance_modifier:4,result_text:'Tu choisis le camp de la loyauté. Ton équipe ne l’oubliera pas.'}},
    {choice_text:'Raccrocher : tu as une réunion.',consequences:{job_performance_modifier:2,stress_level_increment:2,result_text:'Tu travailles. Le chasseur de têtes rappelle quand même, plus tard.'}}]),
  E('cerveau','cerveau','🎤','Une conférence passionnante sur « tout ce qu’on ne sait pas encore » a lieu près de chez toi. Il reste une place au premier rang.',[
    {choice_text:'Poser LA question.',consequences:{smarts_modifier:2,happiness_modifier:2,result_text:'Le conférencier reste silencieux trois secondes, puis dit : « Excellente question. » Tu fais semblant de ne pas rougir.'}},
    {choice_text:'Prendre des notes pendant deux heures.',consequences:{smarts_modifier:3,result_text:'Ton cahier est plein, ta tête aussi.'}},
    {choice_text:'Dormir au fond de la salle.',consequences:{happiness_modifier:1,health_modifier:1,result_text:'Tu dormais mieux que prévu. Le conférencier n’a rien vu.'}}]),
  E('aventurier','aventurier','✈️','Une compagnie aérienne casse ses prix : une destination au bout du monde, départ demain, pas de retour garanti à l’heure.',[
    {choice_text:'Partir sur un coup de tête (800 €).',consequences:{bank_balance_modifier:-800,happiness_modifier:6,smarts_modifier:1,track:{trips:1},result_text:'Tu atterris au bout du monde avec un sac à moitié rempli. C’est exactement ce qu’il te fallait.'}},
    {choice_text:'Réserver pour plus tard.',consequences:{happiness_modifier:1,result_text:'Le billet « plus tard » ne partira jamais, mais l’idée fait du bien.'}},
    {choice_text:'Rester raisonnable.',consequences:{happiness_modifier:-2,result_text:'Tu dis non. Ton passeport soupire dans le tiroir.'}}]),
  E('genereux','genereux','🤲','Une association qui aide des familles du quartier cherche des bénévoles pour le week-end. Tu connais le responsable, il te regarde avec espoir.',[
    {choice_text:'Donner ton week-end.',consequences:{karma_modifier:3,happiness_modifier:4,result_text:'Tu rentres fatigué et le cœur plein. Quelqu’un t’a appelé « monsieur le sauveur ».'}},
    {choice_text:'Faire un don de 200 €.',consequences:{bank_balance_modifier:-200,karma_modifier:2,happiness_modifier:2,track:{given:200},result_text:'Un reçu, un merci, un sourire sincère.'}},
    {choice_text:'Pas cette fois.',consequences:{happiness_modifier:-1,result_text:'Tu t’excuses. Le responsable hoche la tête, un peu déçu.'}}]),
  E('zen','zen','🧘','Un ami te propose un stage de silence de trois jours dans la montagne. Pas de téléphone, pas de parole, beaucoup de soupe.',[
    {choice_text:'Y aller (150 €).',consequences:{bank_balance_modifier:-150,stress_level_increment:-8,happiness_modifier:3,health_modifier:1,result_text:'Trois jours de silence, trois jours de paix. Tu as presque entendu une pensée traverser.'}},
    {choice_text:'Méditer chez toi.',consequences:{stress_level_increment:-3,result_text:'Dix minutes de respiration, un chat qui miaule. C’est déjà ça.'}},
    {choice_text:'Trop calme pour toi.',consequences:{happiness_modifier:0,result_text:'Tu préfères le bruit de ton quotidien. Chacun son rythme.'}}]),
  E('famille','famille','🍲','Dimanche midi : tout le monde vient chez toi sans prévenir. La marmite est vide et le frigo aussi.',[
    {choice_text:'Cuisiner pour tout le monde.',consequences:{relationship_parents_modifier:4,happiness_modifier:4,bank_balance_modifier:-40,result_text:'Un festin improvisé et les rires qui vont avec. Tu es le centre de la famille.'}},
    {choice_text:'Inviter aussi les voisins.',consequences:{karma_modifier:1,happiness_modifier:3,add_friend:{},result_text:'La table est trop petite, la soirée aussi. Les voisins reviennent la semaine suivante.'}},
    {choice_text:'Commander des pizzas.',consequences:{happiness_modifier:2,bank_balance_modifier:-60,result_text:'Personne ne se plaint. Les cartons font office de nappe.'}}])
];

function pPersona(){
  const L=cur();if(!L)return {title:'Personnalité',html:note('Aucun personnage.')};
  const P=ps(L),sc=scores(L).slice(0,5),top=sc[0][1]||1;
  const head=P.arch?card(`${ARCH[P.arch].ic} ${nm(L,P.arch)}`,`${P.years} an${P.years>1?'s':''}`,ARCH[P.arch].d,''):
    note(L.age<14?'Ta personnalité se dessinera à partir de 14 ans, d’après ce que tu fais le plus souvent.':'Elle se dessine encore. Continue : ce que tu fais le plus souvent finira par se voir.');
  return {title:'Personnalité',html:head+note('Chaque choix compte. Rester fidèle à toi-même rend heureux : un petit bonus tous les 5 ans, et un prix dans ton bilan.')
    +`<h3 class="sec">Ce que tu fais le plus souvent</h3>`+sc.map(([a,s])=>statLine(`${ARCH[a].ic} ${nm(L,a)}`,Math.round(Math.min(100,s/Math.max(top,20)*100)))).join('')};
}
registerMod({
  id:MOD,born(L){if(L)L.persona={arch:null,years:0,bestYears:0,bestName:''}},heirInit(D,L){if(L)L.persona={arch:null,years:0,bestYears:0,bestName:''}},
  year,conds,eventsDb,
  sheetRows(L){
    const P=ps(L);
    return [nav('🪞','Personnalité',P.arch?`${nm(L,P.arch)} depuis ${P.years} an${P.years>1?'s':''}`:L.age<14?'Se dessine à partir de 14 ans':'Se dessine avec tes choix',pPersona)];
  }
});
})();
