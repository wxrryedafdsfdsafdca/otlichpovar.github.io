// Service Worker для От-Личный повар
const CACHE_NAME = 'ot-lichny-povar-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Установлен');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Активирован');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Удаление старого кэша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  // Пропускаем запросы к внешним API
  if (event.request.url.includes('api.') || event.request.url.includes('firebase')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кэша если есть
        if (response) {
          return response;
        }

        // Иначе делаем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Проверяем валидность ответа
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ для кэширования
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback для ошибок сети
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Новое уведомление от От-Личный повар',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение',
        icon: 'icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: 'icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('От-Личный повар', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
  console.log('Notification click received:', event.notification);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Фоновая синхронизация
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync started');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Здесь можно добавить логику фоновой синхронизации
  // Например, синхронизация корзины или заказов
  console.log('Выполняется фоновая синхронизация');
}

// Периодическая синхронизация (для обновления данных)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateCachedContent());
  }
});

async function updateCachedContent() {
  // Обновление кэшированного контента
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        await cache.put(request, response);
      }
    } catch (error) {
      console.log('Ошибка при обновлении кэша:', error);
    }
  }
}