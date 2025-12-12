const STATIC_CACHE_NAME = 'app-shell-v2'; // Cambié la versión para forzar la actualización
const DYNAMIC_CACHE_NAME = 'api-data-v1';

// Usar rutas ABSOLUTAS (empezando con /) para asegurar que el precaching funciona
// sin importar dónde se encuentre el SW o la página que lo llama.
const LOCAL_APP_SHELL_ASSETS = [
    '/', // Representa el index.html
    '/index.html',
    '/views/paciente/dashboard.html',
    '/views/paciente/js/pacienteApp.js',
    '/manifest.json',
    '/sw.js',
    '/css/bootstrap.min.css',
    '/css/navbar.css',
    '/css/paciente.css',
    '/css/style-forms.css',
    '/css/style-login.css',
    '/components/navbar.html',
    '/icons/180.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/views/enfermero/dashboard.html',
    '/views/enfermero/camas-asignadas.html',
    '/views/enfermero/escanear-qr.html',
    '/js/enfermeros.js',
    '/js/enfermero-views.js',
    '/js/api.js',
    '/js/login.js', // Corregido: la ruta ahora es absoluta
    '/js/pacientes.js'
];

const EXTERNAL_APP_SHELL_ASSETS = [
    'https://unpkg.com/html5-qrcode',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11'
];


// Función auxiliar para precachear con manejo de errores para recursos externos
function precacheAll(cache, urls) {
    const requests = urls.map(url => {
        return fetch(url).then(response => {
            if (!response.ok) {
                console.warn(`[SW WARN] No se pudo precachear ${url}: Estatus ${response.status}`);
                return null; // Devuelve null para que Promise.all no falle
            }
            return cache.put(url, response);
        }).catch(err => {
            console.warn(`[SW WARN] Falló la red al precachear ${url}:`, err);
            return null;
        });
    });
    return Promise.all(requests);
}

self.addEventListener('install', event => {
    console.log('[SW] Iniciando instalación...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('[SW] Precaching App Shell (Local Assets)...');
                // 1. Precaching de activos locales (debe ser estricto)
                return cache.addAll(LOCAL_APP_SHELL_ASSETS)
                    .then(() => {
                        console.log('[SW] Precaching App Shell (External Assets)...');
                        // 2. Precaching de activos externos (con manejo de errores)
                        return precacheAll(cache, EXTERNAL_APP_SHELL_ASSETS);
                    });
            })
            .then(() => {
                console.log('[SW] Instalación completa. Forzando activación.');
                return self.skipWaiting();
            })
            .catch(err => {
                 // Si falla un activo local, la instalación fallará.
                console.error('[SW ERROR] Falló la instalación (revisa rutas locales):', err);
                // NOTA: Si ves este error, DEBES corregir la ruta en LOCAL_APP_SHELL_ASSETS
            })
    );
});

// ... (El resto del código de activate y fetch es correcto y no necesita cambios)

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
            .then(() => self.clients.claim()) // <-- Toma el control inmediatamente
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
                // Si no está en caché (y no es App Shell), va a la red.
                return response || fetch(event.request);
            })
    );
});