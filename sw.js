// 무진기행 따라 걷는 순천 문학 - Service Worker
// 전시/오프라인(비행기모드) 사용을 위한 전체 자산 캐싱 서비스 워커
var CACHE_VERSION = 'mujin-v2';
var CACHE_NAME = 'mujin-cache-' + CACHE_VERSION;

var PRECACHE_URLS = [
  './',
  'fonts/dmmono-400.woff',
  'fonts/dmmono-500.woff',
  'fonts/ibmplex-400.woff',
  'fonts/ibmplex-500.woff',
  'fonts/ibmplex-600.woff',
  'fonts/ibmplex-700.woff',
  'fonts/notoserif-500.woff',
  'fonts/notoserif-600.woff',
  'fonts/notoserif-700.woff',
  'fonts/notoserif-800.woff',
  'icons/icon-1024.png',
  'icons/icon-120.png',
  'icons/icon-128.png',
  'icons/icon-144.png',
  'icons/icon-152.png',
  'icons/icon-167.png',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-32.png',
  'icons/icon-384.png',
  'icons/icon-48.png',
  'icons/icon-512.png',
  'icons/icon-72.png',
  'icons/icon-96.png',
  'icons/icon-maskable-512.png',
  'images/gallery/full/g01.jpg',
  'images/gallery/full/g02.jpg',
  'images/gallery/full/g03.jpg',
  'images/gallery/full/g04.jpg',
  'images/gallery/full/g05.jpg',
  'images/gallery/full/g06.jpg',
  'images/gallery/full/g07.jpg',
  'images/gallery/full/g08.jpg',
  'images/gallery/full/g09.jpg',
  'images/gallery/full/g10.jpg',
  'images/gallery/full/g11.jpg',
  'images/gallery/full/g12.jpg',
  'images/gallery/full/g13.jpg',
  'images/gallery/full/g14.jpg',
  'images/gallery/full/g15.jpg',
  'images/gallery/full/g16.jpg',
  'images/gallery/full/g17.jpg',
  'images/gallery/full/g18.jpg',
  'images/gallery/full/g19.jpg',
  'images/gallery/full/g20.jpg',
  'images/gallery/full/g21.jpg',
  'images/gallery/full/g22.jpg',
  'images/gallery/full/g23.jpg',
  'images/gallery/full/g24.jpg',
  'images/gallery/full/g25.jpg',
  'images/gallery/full/g26.jpg',
  'images/gallery/full/g27.jpg',
  'images/gallery/full/g28.jpg',
  'images/gallery/full/g29.jpg',
  'images/gallery/full/g30.jpg',
  'images/gallery/full/g31.jpg',
  'images/gallery/full/g32.jpg',
  'images/gallery/full/g33.jpg',
  'images/gallery/full/g34.jpg',
  'images/gallery/full/g35.jpg',
  'images/gallery/thumb/g01.jpg',
  'images/gallery/thumb/g02.jpg',
  'images/gallery/thumb/g03.jpg',
  'images/gallery/thumb/g04.jpg',
  'images/gallery/thumb/g05.jpg',
  'images/gallery/thumb/g06.jpg',
  'images/gallery/thumb/g07.jpg',
  'images/gallery/thumb/g08.jpg',
  'images/gallery/thumb/g09.jpg',
  'images/gallery/thumb/g10.jpg',
  'images/gallery/thumb/g11.jpg',
  'images/gallery/thumb/g12.jpg',
  'images/gallery/thumb/g13.jpg',
  'images/gallery/thumb/g14.jpg',
  'images/gallery/thumb/g15.jpg',
  'images/gallery/thumb/g16.jpg',
  'images/gallery/thumb/g17.jpg',
  'images/gallery/thumb/g18.jpg',
  'images/gallery/thumb/g19.jpg',
  'images/gallery/thumb/g20.jpg',
  'images/gallery/thumb/g21.jpg',
  'images/gallery/thumb/g22.jpg',
  'images/gallery/thumb/g23.jpg',
  'images/gallery/thumb/g24.jpg',
  'images/gallery/thumb/g25.jpg',
  'images/gallery/thumb/g26.jpg',
  'images/gallery/thumb/g27.jpg',
  'images/gallery/thumb/g28.jpg',
  'images/gallery/thumb/g29.jpg',
  'images/gallery/thumb/g30.jpg',
  'images/gallery/thumb/g31.jpg',
  'images/gallery/thumb/g32.jpg',
  'images/gallery/thumb/g33.jpg',
  'images/gallery/thumb/g34.jpg',
  'images/gallery/thumb/g35.jpg',
  'index.html',
  'manifest.json'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(PRECACHE_URLS).catch(function(err){
        console.warn('[SW] precache error', err);
      });
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

// Cache-first: 오프라인(비행기모드) 우선 지원. 캐시에 없으면 네트워크 시도 후 캐시에 저장.
self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(function(cached){
      if(cached) return cached;
      return fetch(req).then(function(res){
        if(res && res.status === 200 && res.type === 'basic'){
          var resClone = res.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(req, resClone);
          });
        }
        return res;
      }).catch(function(){
        // 네비게이션 요청인데 오프라인이고 캐시도 없을 경우 메인 페이지로 폴백
        if(req.mode === 'navigate'){
          return caches.match('index.html');
        }
      });
    })
  );
});
