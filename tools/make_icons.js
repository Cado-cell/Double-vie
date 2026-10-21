const {chromium}=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const fs=require('fs');
(async()=>{fs.mkdirSync('pwa',{recursive:true});
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE48F"/><stop offset="1" stop-color="#FFC63A"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><g fill="#F7B500" opacity=".55"><circle cx="70" cy="80" r="14"/><circle cx="446" cy="440" r="14"/><rect x="420" y="64" width="12" height="42" rx="6"/><rect x="405" y="79" width="42" height="12" rx="6"/><rect x="70" y="410" width="12" height="42" rx="6"/><rect x="55" y="425" width="42" height="12" rx="6"/></g><g stroke="#1B1A47" stroke-width="14" stroke-linejoin="round"><circle cx="214" cy="274" r="104" fill="#1B1A47" stroke="none"/><circle cx="298" cy="274" r="104" fill="#1B1A47" stroke="none"/><circle cx="214" cy="256" r="104" fill="#3F7BFF"/><circle cx="298" cy="256" r="104" fill="#FF4F93"/></g><path d="M256 168a104 104 0 0 1 0 176a104 104 0 0 1 0-176z" fill="#FFFFFF" stroke="#1B1A47" stroke-width="14" stroke-linejoin="round"/></svg>`;
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:512,height:512},deviceScaleFactor:1});
 for(const [name,size] of [['icon-512',512],['icon-maskable-512',512],['icon-192',192],['apple-touch-icon',180]]){
  await p.setViewportSize({width:size,height:size});
  await p.setContent(`<body style="margin:0;background:#FFC63A"><img src="data:image/svg+xml;utf8,${encodeURIComponent(svg)}" width="${size}" height="${size}" style="display:block"></body>`);
  await p.screenshot({path:`pwa/${name}.png`,clip:{x:0,y:0,width:size,height:size}});
 }
 await b.close();console.log('icônes ok')})();
