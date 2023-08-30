self.addEventListener('install',function(event){
    console.log('[service worker] Installing service worker',event);
    event.waitUntil(
        caches.open('static')
        .then(function(cache){
            console.log('[service worker] Precaching App Shell');
            // cache.add('/index.html')
            cache.addAll([
                '/',
                '/index.html',
                '/src/js/app.js',
                '/src/js/feed.js',
                '/src/js/material.min.js',
                '/src/css/app.css',
                '/src/css/feed.css',
                '/src/images/main-image.jpg',
                'https://fonts.googleapis.com/css?family=Roboto:400,700',
                'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
                'https://fonts.googleapis.com/icon?family=Material+Icons'
            ])
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
                return fetch(event.request)
                    .then(function(res){
                        return caches.open('dynamic')
                            .then(function(cache){
                                cache.put(event.request.url,res.clone())
                                    return res;
                            })
                    })
                    .catch(function(err){
                        
                    })
            }
        })        
    );
});