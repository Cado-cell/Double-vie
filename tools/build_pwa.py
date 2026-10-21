import re,os,shutil,json,zipfile,subprocess,time
import sys
SP=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));D=SP+'/src';O=SP+'/pwa'
h=open(D+'/deux-vies.html').read()
scripts=re.findall(r'<script src="([^"]+)"></script>',h)
i=h.index('<style>');j=h.index('</style>')+8
style=h[i:j];body=h[j:]
body=re.sub(r'<script src="[^"]+"></script>\n?','',body).strip()
head_items=[l for l in h[:i].splitlines() if l.startswith('<link')]
VERSION=time.strftime('%Y%m%d-%H%M%S')
shutil.rmtree(O,ignore_errors=True);os.makedirs(O)
bundle='/* Double Vie — jeu complet (fichiers assemblés dans l’ordre de chargement) */\n'+''.join('\n/* ===== '+s+' ===== */\n'+open(D+'/'+s).read()+'\n;\n' for s in scripts)
open(O+'/app.js','w').write(bundle)
reset="<style>:root{padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>"
page=f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1B1A47" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0A0826" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Double Vie">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
{chr(10).join(head_items)}
<title>Double Vie</title>
{reset}
{style}
</head>
<body>
{body}
<script>window.DV_VERSION='{VERSION}'</script>
<script src="app.js"></script>
<script>if('serviceWorker' in navigator){{const had=!!navigator.serviceWorker.controller;let rl=0;navigator.serviceWorker.addEventListener('controllerchange',()=>{{if(had&&!rl){{rl=1;location.reload()}}}});window.addEventListener('load',()=>{{navigator.serviceWorker.register('sw.js',{{updateViaCache:'none'}}).then(r=>{{r.update().catch(()=>{{}});setInterval(()=>r.update().catch(()=>{{}}),600000)}}).catch(()=>{{}})}})}}</script>
</body>
</html>
"""
open(O+'/index.html','w').write(page)
json.dump({"name":"Double Vie","short_name":"Double Vie","description":"Simulateur de vie à jouer seul ou à deux.","lang":"fr","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#FFF1CC","theme_color":"#1B1A47","icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open(O+'/manifest.webmanifest','w'),ensure_ascii=False,indent=1)
files=['./','index.html','app.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png']
sw=f"""/* Double Vie — service worker : hors connexion + mises à jour automatiques. */
const VERSION='{VERSION}';
const CACHE='double-vie-'+VERSION;
const FILES={json.dumps(files)};
self.addEventListener('install',e=>{{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{{cache:'reload'}})).then(r=>{{if(!r.ok)throw new Error(f);return c.put(f,r)}})))).then(()=>self.skipWaiting()))}});
self.addEventListener('activate',e=>{{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('double-vie-')||k.startsWith('deux-vies-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))}});
/* Réseau d'abord (toujours la dernière version quand il y a du réseau), cache en secours hors connexion. */
function netFirst(r){{
  return new Promise(res=>{{
    let done=false;const out=x=>{{if(!done){{done=true;res(x)}}}};
    const hit=()=>caches.match(r,{{ignoreSearch:true}}).then(h=>h||caches.match('index.html'));
    const t=setTimeout(()=>hit().then(h=>{{if(h)out(h)}}),4000);
    fetch(r.url,{{cache:'no-cache'}}).then(x=>{{clearTimeout(t);if(x.ok){{const cp=x.clone();caches.open(CACHE).then(c=>c.put(r.url,cp))}}out(x)}}).catch(()=>{{clearTimeout(t);hit().then(h=>out(h||Response.error()))}});
  }});
}}
self.addEventListener('fetch',e=>{{
  const r=e.request;if(r.method!=='GET')return;
  const same=new URL(r.url).origin===location.origin;
  if(same)e.respondWith(netFirst(r));
  else e.respondWith(fetch(r).then(res=>{{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}}).catch(()=>caches.match(r)))
}});
"""
open(O+'/sw.js','w').write(sw)
print('index.html',len(page),'octets ; app.js',len(bundle),'octets ;',len(scripts),'scripts assemblés ; version',VERSION)

if '--publish' in sys.argv:
    subprocess.run(['node',SP+'/tools/make_icons.js'],cwd=SP,check=True)
    for fn in os.listdir(O):
        shutil.copy(O+'/'+fn,SP+'/'+fn)
    print('publié à la racine du dépôt :',', '.join(sorted(os.listdir(O))))
