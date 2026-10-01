/* ガラガラくじ：オフライン用の保存。ファイルを更新したら CACHE の番号が変わり、自動で入れ替わる */
const CACHE = "kuji-2b18178919";
const FILES = [
  "./",
  "./index.html",
  "./1003-1.html",
  "./manifest-1003-1.webmanifest",
  "./icon-1003-1-180.png",
  "./icon-1003-1-512.png",
  "./1003-2.html",
  "./manifest-1003-2.webmanifest",
  "./icon-1003-2-180.png",
  "./icon-1003-2-512.png",
  "./1004-1.html",
  "./manifest-1004-1.webmanifest",
  "./icon-1004-1-180.png",
  "./icon-1004-1-512.png",
  "./1004-2.html",
  "./manifest-1004-2.webmanifest",
  "./icon-1004-2-180.png",
  "./icon-1004-2-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* 保存してある中身をすぐ返し（オフラインでも開ける）、つながっていれば裏で新しい版に入れ替える */
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch:true }).then(hit => {
    const net = fetch(e.request).then(res => { if(res && res.ok) c.put(e.request, res.clone()); return res; });
    if(hit){ net.catch(() => {}); return hit; }
    return net;
  })));
});
