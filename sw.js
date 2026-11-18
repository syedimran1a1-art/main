/* V3 Specialized — offline shell. The app itself always comes fresh from the network when online; this copy is only used offline. Data lives in the app's own storage and Google Drive, never here. */
const CACHE = 'v3-shell-1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Google sign-in and Drive go straight to the network
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request.mode === 'navigate' ? './index.html' : e.request, c)); } return r; })
    .catch(() => caches.match(e.request.mode === 'navigate' ? './index.html' : e.request).then(r => r || caches.match('./index.html'))));
});
