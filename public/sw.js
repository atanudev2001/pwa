importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

let cache_static_name = 'static-v12';
let cache_dynamic_name = 'dynamic-v3';
var static_files = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
  ];

var dbPromise = idb.open('posts-store', 1, function (db) {
    if (!db.objectStoreNames.contains('posts')) {
      db.createObjectStore('posts', {keyPath: 'id'});
    }
  });
  
self.addEventListener('install',function(event){
    console.log('[service worker] Installing service worker',event);
    event.waitUntil(
        caches.open(cache_static_name)
        .then(function(cache){
            console.log('[service worker] Precaching App Shell');
            // cache.add('/index.html')
            cache.addAll(static_files);
        })
        )
});

self.addEventListener('activate',function(event){
    console.log('[service worker] activating service worker',event);
    event.waitUntil(
        caches.keys()
            .then(function(keylist){
                return Promise.all(keylist.map(function(key){
                    if(key != cache_static_name && key != cache_dynamic_name){
                        console.log('[service worker] Removing old cach.',key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});


function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function (event) {

    var url = 'http://localhost:3000/pwapost';
    if (event.request.url.indexOf(url) > -1) {
      event.respondWith(fetch(event.request)
        .then(function (res) {
          var clonedRes = res.clone();
          clonedRes.json()
            .then(function(data) {
              for (var key in data) {
                dbPromise
                  .then(function(db) {
                    var tx = db.transaction('posts', 'readwrite');
                    var store = tx.objectStore('posts');
                    store.put(data[key]);
                    return tx.complete;
                  });
              }
            });
          return res;
        })
      );
    } else if (isInArray(event.request.url, static_files)) {
      event.respondWith(
        caches.match(event.request)
      );
    } else {
      event.respondWith(
        caches.match(event.request)
          .then(function (response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request)
                .then(function (res) {
                  return caches.open(cache_dynamic_name)
                    .then(function (cache) {
                      // trimCache(CACHE_DYNAMIC_NAME, 3);
                      cache.put(event.request.url, res.clone());
                      return res;
                    })
                })
                .catch(function (err) {
                  return caches.open(cache_static_name)
                    .then(function (cache) {
                      if (event.request.headers.get('accept').includes('text/html')) {
                        return cache.match('/offline.html');
                      }
                    });
                });
            }
          })
      );
    }
  });
// self.addEventListener('fetch',function(event){
//     if (!(event.request.url.indexOf('http') === 0)) return;

//     event.respondWith(
//         fetch(event.request)
//         .catch(function(err){
//             return caches.match(event.request);
//         })
//     ) 
       
// });

//Cache Only strategy

// self.addEventListener('fetch',function(event){
//     event.respondWith(
//         caches.match(event.request)
//     );
// });

//Network Only strategy

// self.addEventListener('fetch',function(event){
//     event.respondWith(
//         fetch(event.request)
//     );
// });

self.addEventListener('sync',function(e){
    console.log('[Service worker] Background syncing',e);
    if(e.tag === 'sync-new-post'){
        console.log('[Service worker] syncying new post');
        e.waitUntil(
            readAllData('sync-posts')
                .then(function(data){
                  for(var dt of data){
                    fetch('http://localhost:3000/pwapost',{
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                      },
                      body: JSON.stringify({
                        id:dt.id,
                        title:dt.title,
                        location:dt.location,
                        images:dt.images
                      })
                    })
                    .then(function(res){
                      console.log('sent data',res);
                      if(res.ok){
                        res.json()
                          .then(function(resdata){
                            deleteItemFromData('sync-posts',resdata.id);
                          });
                      }
                    })
                    .catch(function(err){
                      console.log('Error while sending data',err);
                    })
                  }
                })
        );
    }
});

self.addEventListener('notificationclick', function(e){
  let notification = e.notification;
  let action = e.action;

  console.log('notification:', notification);

  if(action === 'confirm'){
    console.log('confirm was choosen');
    notification.close();
  }else{
    console.log(action);
    notification.close();
  }
});

self.addEventListener('notificationclose', function(e){
  console.log('notification was closed',e);
});


