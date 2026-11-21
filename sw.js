const V="chacha-v2-2";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>clients.claim()))});
// Réseau d'abord (pour recevoir les mises à jour). Si internet est coupé OU si le serveur
// renvoie une erreur (500, 404…), on garde la copie en cache et on ne la remplace jamais par la page d'erreur.
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!="GET"||new URL(r.url).origin!=location.origin)return;
  e.respondWith(
    fetch(r).then(x=>{
      if(x.ok){const y=x.clone();caches.open(V).then(c=>c.put(r,y));return x}
      return caches.match(r,{ignoreSearch:true}).then(m=>m||x);
    }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("index.html")))
  );
});
