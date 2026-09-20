const CACHE="wilson-v27";
const CORE=[
  "/",
  "/index.html",
  "/styles.css?v=27",
  "/src/game.js?v=27",
  "/manifest.webmanifest",
  "/icon.svg",
  "/vendor/phaser-3.90.0.min.js",
  "/assets/kenney/medievalRTS_spritesheet@2.png",
  "/assets/kenney/medievalRTS_spritesheet@2.xml",
  "/assets/characters/nino_F.svg",
  "/assets/characters/nino_M.svg",
  "/assets/characters/recolector_F.svg",
  "/assets/characters/recolector_M.svg",
  "/assets/characters/explorador_F.svg",
  "/assets/characters/explorador_M.svg",
  "/assets/characters/cazador_F.svg",
  "/assets/characters/cazador_M.svg",
  "/assets/characters/constructor_F.svg",
  "/assets/characters/constructor_M.svg",
  "/assets/characters/le%C3%B1ador_F.svg",
  "/assets/characters/le%C3%B1ador_M.svg",
  "/assets/characters/agricultor_F.svg",
  "/assets/characters/agricultor_M.svg"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith("/api/"))return;

  const immutable=url.pathname.startsWith("/assets/")||url.pathname.startsWith("/vendor/");
  if(immutable){
    event.respondWith(
      caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("/index.html")))
  );
});
