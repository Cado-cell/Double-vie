/* Double Vie — service worker : hors connexion + mises à jour automatiques. */
const VERSION='20261022-100152';
const CACHE='double-vie-'+VERSION;
const FILES=["./", "index.html", "app.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error(f);return c.put(f,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('double-vie-')||k.startsWith('deux-vies-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* Réseau d'abord (toujours la dernière version quand il y a du réseau), cache en secours hors connexion. */
function netFirst(r){
  return new Promise(res=>{
    let done=false;const out=x=>{if(!done){done=true;res(x)}};
    const hit=()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match('index.html'));
    const t=setTimeout(()=>hit().then(h=>{if(h)out(h)}),4000);
    fetch(r.url,{cache:'no-cache'}).then(x=>{clearTimeout(t);if(x.ok){const cp=x.clone();caches.open(CACHE).then(c=>c.put(r.url,cp))}out(x)}).catch(()=>{clearTimeout(t);hit().then(h=>out(h||Response.error()))});
  });
}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const same=new URL(r.url).origin===location.origin;
  if(same)e.respondWith(netFirst(r));
  else e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r)))
});
