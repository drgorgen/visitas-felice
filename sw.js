// Service worker da versão web (iPhone, parte 2, spec §6). MODELO: scripts/gerar-sw.mjs troca os dois marcadores
// (ARQUIVOS e CACHE, logo abaixo) pela lista exata dos arquivos do app e pelo nome do cache da versão, e grava web-dist/sw.js.
// Script clássico (sem import): é o formato que todo Safari do iPhone aceita.
//  - install: guarda todos os arquivos; NÃO pula a espera (a versão nova só assume quando a pessoa toca em Atualizar);
//  - activate: apaga os caches de versões antigas (só depois de assumir, nunca antes);
//  - fetch: tudo do cache; navegação recebe o index.html guardado (o app funciona sem internet);
//  - message 'pular-espera': assume agora (a página recarrega no controllerchange).
const ARQUIVOS = ["./",".nojekyll","assets/index-Cxc3JUD3.css","assets/index-Dd69Za_C.js","assets/logo-felice-Bej_ZlmF.png","assets/web-B2AuWH1l.js","assets/web-CrbGRyJU.js","assets/web-yeSSDwXB.js","icone-180.png","icone-192.png","icone-512.png","index.html","manifest.webmanifest"];
const CACHE = "visitas-1.2.0-a9a76ea5";
const PREFIXO = 'visitas-';

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    for (const nome of await caches.keys()) {
      if (nome.startsWith(PREFIXO) && nome !== CACHE) await caches.delete(nome);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  evento.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (pedido.mode === 'navigate') return (await cache.match('./index.html')) ?? fetch(pedido);
    return (await cache.match(pedido)) ?? fetch(pedido);
  })());
});

self.addEventListener('message', (evento) => {
  if (evento.data === 'pular-espera') self.skipWaiting();
});
