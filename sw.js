/* ============================================================================
 *  SERVICE WORKER — Estoque DigiPower                          V1.0
 *
 *  POR QUE EXISTE: o Chrome só oferece "Instalar aplicativo" para páginas
 *  com service worker. Sem instalar, não há ícone próprio nem número no ícone.
 *
 *  O QUE NÃO FAZ: não guarda dado nenhum do sistema. Itens, movimentos,
 *  inventários e fila vêm sempre do servidor, ao vivo. Aqui só ficam a casca
 *  da página e as imagens, para abrir rápido.
 * ========================================================================== */
var VERSAO = 'estoque-digipower-v2';
var CASCA = ['./', './index.html', './manifest.json', './icone_digipower_512.png', './logo_digipower_negativo.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(CASCA); })
                    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.map(function (n) { if (n !== VERSAO) { return caches.delete(n); } }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  /* Tudo que fala com o Google (o app em si) passa direto, sem cache. */
  if (url.indexOf('script.google.com') >= 0 || url.indexOf('googleusercontent.com') >= 0 ||
      url.indexOf(self.location.origin) !== 0 || e.request.method !== 'GET') { return; }
  /* Rede primeiro; o cache só cobre a abertura sem sinal. */
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copia = r.clone();
      caches.open(VERSAO).then(function (c) { c.put(e.request, copia); });
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
