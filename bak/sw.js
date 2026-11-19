const C='bak-v23';
const A=['./','index.html','style.css?v=23','app.js?v=23','config.js?v=23','manifest.json','assets/logo.webp','assets/paper.webp','assets/bar.webp','assets/map.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type==='basic'){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));}return r}).catch(()=>caches.match(e.request)));
});
