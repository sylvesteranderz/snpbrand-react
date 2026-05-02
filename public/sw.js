const CACHE = 'snp-admin-v1'

// Cache the app shell on install
self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/', '/new-order'])
    ).catch(() => {}) // don't fail install if caching fails
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Remove old caches
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      ),
    ])
  )
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Let Supabase API calls go straight to network — never cache them
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/rest/')) {
    return
  }

  // For navigation requests: network-first, fall back to cache (enables offline shell)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/') .then(r => r ?? new Response('Offline', { status: 503 }))
      )
    )
    return
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ?? fetch(event.request).then(response => {
        if (response.ok) {
          caches.open(CACHE).then(cache => cache.put(event.request, response.clone()))
        }
        return response
      })
    )
  )
})
