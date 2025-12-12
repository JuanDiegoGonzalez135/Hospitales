const STATIC_CACHE_NAME = 'app-shell-v1';
const DYNAMIC_CACHE_NAME = 'api-data-v1';

const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './views/paciente/dashboard.html',
    './views/paciente/js/pacienteApp.js',
    './manifest.json',
    './sw.js',
    './css/bootstrap.min.css',
    './css/navbar.css',
    './css/paciente.css',
    './css/style-forms.css',
    './css/style-login.css',
    './components/navbar.html',
    './icons/180.png',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './views/enfermero/dashboard.html',
    './views/enfermero/camas-asignadas.html',
    './views/enfermero/escanear-qr.html',
    './js/enfermeros.js',
    './js/enfermero-views.js',
    './js/api.js',
    'https://unpkg.com/html5-qrcode', 
    'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];

self.addEventListener('install', event => {
    console.log('[SW] Iniciando instalación...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('[SW] Precaching App Shell (Cache Only)...');
                return cache.addAll(APP_SHELL_ASSETS);
            })
            .then(() => {
                console.log('[SW] Instalación completa. Forzando activación.');
                return self.skipWaiting();
            })
            .catch(err => console.error('[SW ERROR] Falló la instalación:', err))
    );
});

// Activación: Limpieza de cachés antiguas y toma de control
self.addEventListener('activate', event => {
    const cacheAllowList = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheAllowList.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
            .then(() => self.clients.claim()) // <-- Nueva línea crítica: Toma el control inmediatamente
    );
    console.log('[SW] Activado y tomando control.');
});

// Fetch: Aplicación de Estrategias de Caché
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const requestPath = url.pathname;

    // 1. Estrategia Network First para APIs (Datos dinámicos)
    if (requestPath.includes('/api/hospitales/paciente')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Manejo de caché dinámico solo para GET
                    if (event.request.method === 'GET' && response.ok) {
                        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                            // Clona la respuesta antes de ponerla en caché, ya que el cuerpo (body) solo se puede leer una vez.
                            cache.put(event.request, response.clone());
                            return response;
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usa la caché dinámica como fallback
                    return caches.match(event.request);
                })
        );
        return;
    }

    // 2. Estrategia Cache First / Cache Only para App Shell (Archivos Estáticos)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si no está en caché (y no es App Shell), va a la red. (Estrategia Cache First)
                return response || fetch(event.request);
            })
    );
});