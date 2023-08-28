self.addEventListener('install',function(event){
    console.log('[service worker] Installing service worker',event);
});

self.addEventListener('activate',function(event){
    console.log('[service worker] activating service worker',event);
    return self.clients.claim();
});

self.addEventListener('fetch',function(event){
    console.log('[service worker] Fetching something.....',event);
    event.respondWith(fetch(event.request));
});