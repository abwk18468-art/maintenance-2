/* حسن صدام — عامل خدمة: يخزّن هيكل التطبيق ليفتح بسرعة وبدون إنترنت، ولا يخزّن بيانات Firebase */
const V = 'hs-shell-v10';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;                 // Firebase/Google وغيرها تمر مباشرة
  if (u.pathname.endsWith('/track.html') || u.pathname.endsWith('/statement.html')) return;
  if (r.mode === 'navigate') {                                                        // الصفحة: الشبكة أولاً ثم النسخة المخزّنة
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put('index.html', c)); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});
