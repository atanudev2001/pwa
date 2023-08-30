self.addEventListener('install',function(event){
    console.log('[service worker] Installing service worker',event);
    event.waitUntil(
        caches.open('static')
        .then(function(cache){
            console.log('[service worker] Precaching App Shell');
            cache.add('/index.html')
        })
        )
});

self.addEventListener('activate',function(event){
    console.log('[service worker] activating service worker',event);
    return self.clients.claim();
});

self.addEventListener('fetch',function(event){
    event.respondWith(
        caches.match(event.request)
        .then(function(response){
            if(response){
                return response;
            }else{
                return fetch(event.request);
            }
        })        
    );
});