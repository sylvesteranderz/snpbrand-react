const CACHE = 'snp-admin-v1'

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/', '/new-order'])
    ).catch(() => {})
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', event => {
  // 1. Bypass all non-GET requests immediately (POST, PUT, DELETE, etc.)
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Let Supabase API and Storage calls go straight to the network
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/rest/')) return

  // Navigation: network-first, fall back to cached shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then(r => r ?? new Response('Offline', { status: 503 }))
      )
    )
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached

      return fetch(event.request).then(response => {
        if (response.ok) {
          // 2. Clone synchronously before returning so the body is not yet consumed
          const toCache = response.clone()
          caches.open(CACHE).then(cache => cache.put(event.request, toCache))
        }
        return response
      })
    })
  )
})
