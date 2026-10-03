/* ガラガラくじ：オフライン用の保存。公開し直すと CACHE の番号が変わり、自動で入れ替わる */
const CACHE = "kuji-d6a7e5dcf6";
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
/* 保存するときはブラウザのキャッシュを通さず、必ずサーバーから取り直す（古い版を保存しないため） */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(u => new Request(u, { cache:"reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const TIMEOUT_MS = 3000;
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET" || url.origin !== location.origin) return;
  if(url.pathname.endsWith("/sw.js")) return;           // 版の確認用。常にサーバーへ
  const isPage = e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  const key = new Request(url.origin + url.pathname);   // ?v= などは無視して1つにまとめる
  if(isPage){
    /* ページ：ネットがあれば最新を取って保存し直す。つながらない・3秒で返事がないときは保存済みを返す */
    e.respondWith(caches.open(CACHE).then(c => {
      const net = fetch(new Request(url.href, { cache:"no-cache", credentials:"same-origin" }))
        .then(res => { if(res && res.ok) c.put(key, res.clone()); return res; });
      const timer = new Promise(r => setTimeout(r, TIMEOUT_MS));
      return Promise.race([net.catch(() => null), timer.then(() => null)])
        .then(res => res || c.match(key).then(hit => hit || net));
    }));
    return;
  }
  /* アイコンなど：保存済みを返し、なければ取りに行く */
  e.respondWith(caches.open(CACHE).then(c => c.match(key).then(hit => hit ||
    fetch(e.request).then(res => { if(res && res.ok) c.put(key, res.clone()); return res; }))));
});
