
const BASE_URL = 'http://127.0.0.1:8080/api/hospitales/paciente'; 
const COOLDOWN_SECONDS = 12; // Coincide con la configuración de PacienteService

// Datos persistentes localStorage
let camaId = localStorage.getItem('camaId') || null;
let camaCodigo = localStorage.getItem('camaCodigo') || null; 
let dispositivoId = localStorage.getItem('dispositivoId') || null;

// Referencias a elementos del DOM
const scanView = document.getElementById('scan-view');1
const helpView = document.getElementById('help-view');
const qrScannerId = 'qr-scanner';
const scanErrorMessage = document.getElementById('scan-error-message');
const camaCodigoDisplay = document.getElementById('cama-codigo-display');
const helpButton = document.getElementById('help-button');
const cooldownMessage = document.getElementById('cooldown-message');
const countdownSpan = document.getElementById('countdown');
const disconnectButton = document.getElementById('disconnect-button');

// Instancia de Html5QrcodeScanner
let html5QrcodeScanner = null;
let cooldownTimer = null;


// =================================================================
// UTILIDADES
// =================================================================

/**
 * Genera y/o recupera un ID de dispositivo persistente.
 */
function getDeviceId() {
    if (!dispositivoId) {
        // Generar un UUID simple.
        dispositivoId = 'dev-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('dispositivoId', dispositivoId);
    }
    return dispositivoId;
}

/**
 * Muestra la vista de Escaneo (QR) e inicializa el scanner.
 */
function showScanView() {
    scanView.classList.remove('hidden');
    helpView.classList.add('hidden');
    scanErrorMessage.classList.add('hidden'); // Ocultar errores previos
    
    if (!html5QrcodeScanner) {
        initializeScanner();
    } else {
        // Re-renderizar si ya existe (para usar la cámara de nuevo)
        html5QrcodeScanner.render(onScanSuccess, onScanError);
    }
}

/**
 * Muestra la vista de Ayuda y detiene el scanner.
 */
function showHelpView() {
    // 1. Detener el scanner para liberar la cámara
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(err => {
            console.error("Error al detener el scanner:", err);
        });
    }
    
    // 2. Mostrar la vista de ayuda
    scanView.classList.add('hidden');
    helpView.classList.remove('hidden');
    camaCodigoDisplay.textContent = camaCodigo; // Mostrar el código de la cama
    
    // 3. Resetear el estado del botón
    cooldownMessage.classList.add('hidden');
    helpButton.disabled = false;
    helpButton.textContent = 'SOLICITAR ASISTENCIA';
}

// =================================================================
// LÓGICA DE ESCANEO Y VINCULACIÓN
// =================================================================

function initializeScanner() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        qrScannerId,
        { fps: 10, qrbox: 250, disableFlip: false },
        false // verbose
    );
    html5QrcodeScanner.render(onScanSuccess, onScanError);
}

/**
 * Se ejecuta al detectar un código QR.
 * @param {string} codigoCamaQR El contenido del QR (el código de la cama).
 */
async function onScanSuccess(codigoCamaQR) {
    if (camaId) return; // Si ya estamos vinculados, ignorar

    try {
        // 1. Detener el scanner inmediatamente
        await html5QrcodeScanner.clear();

        // 2. Preparar datos y endpoint
        const deviceId = getDeviceId();
        const endpoint = `${BASE_URL}/vincular/`; 

        // 3. Llamada al Backend para Vincular Dispositivo
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deviceId: deviceId, 
                codigoCama: codigoCamaQR 
            })
        });

        const apiResponse = await response.json();
        
        if (apiResponse.error || response.status !== 200) {
            // Mensaje de error (e.g., Código no encontrado o sin paciente)
            const msg = apiResponse.message || 'Error desconocido al vincular.';
            alert(`Error de vinculación: ${msg}`);
            showScanView(); // Volver a escanear
            return;
        }

        // Éxito en la vinculación - DEBEMOS OBTENER EL ID NUMÉRICO
        const data = apiResponse.data;
        
        if (!data || !data.camaId) {
             // Si el servicio no devuelve el camaId, no podemos llamar a /ayuda
            alert('Error interno: El servidor no devolvió el ID de la cama.');
            showScanView(); 
            return;
        }

        // Guardar datos
        camaId = data.camaId;
        camaCodigo = codigoCamaQR;
        localStorage.setItem('camaId', camaId);
        localStorage.setItem('camaCodigo', camaCodigo);
        
        alert(`✅ Dispositivo vinculado a la cama: ${camaCodigo}`);
        showHelpView();

    } catch (error) {
        console.error("Error en la vinculación:", error);
        scanErrorMessage.textContent = 'Error: Falló la conexión con el servidor o el QR no es válido.';
        scanErrorMessage.classList.remove('hidden');
        showScanView(); // Volver a mostrar el scanner si falló la conexión
    }
}

function onScanError(errorMessage) {
    // Si la cámara no puede iniciar, mostramos un error más claro.
    if (errorMessage.includes("NotAllowedError") || errorMessage.includes("no camera")) {
        scanErrorMessage.textContent = 'Error: No se pudo iniciar la cámara. Asegúrese de tener permisos de cámara.';
        scanErrorMessage.classList.remove('hidden');
    }
}

// =================================================================
// LÓGICA DE ASISTENCIA Y COOLDOWN
// =================================================================

async function requestHelp() {
    if (!camaId) {
        alert('Dispositivo no vinculado. Por favor, escanee el QR de la cama.');
        showScanView();
        return;
    }
    
    // 1. Deshabilitar inmediatamente
    helpButton.disabled = true;
    helpButton.textContent = 'ENVIANDO...';

    // 2. Llamada al Backend para Solicitar Ayuda (usando el ID numérico)
    const endpoint = `${BASE_URL}/ayuda/${camaId}/`;
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
        });

        const apiResponse = await response.json();

        if (apiResponse.error) {
            // Manejo del Cooldown retornado por el backend
            if (apiResponse.message.includes("Cooldown")) {
                // El backend nos dice cuántos segundos faltan
                const match = apiResponse.message.match(/(\d+)s/);
                const waitTime = match ? parseInt(match[1]) : COOLDOWN_SECONDS; 
                startCooldown(waitTime); 
                return;
            } else {
                // Otro error del backend (ej: cama sin paciente)
                alert(`Error: ${apiResponse.message}`);
                helpButton.disabled = false;
                helpButton.textContent = 'SOLICITAR ASISTENCIA';
                return;
            }
        }

        // Éxito: Iniciar cooldown
        // Usar el valor del backend o el por defecto (12s)
        const cooldownS = apiResponse.data.cooldown_s || COOLDOWN_SECONDS; 
        startCooldown(cooldownS);
        console.log('Solicitud de asistencia enviada.');

    } catch (error) {
        console.error("Error en la solicitud de ayuda:", error);
        alert('Error de conexión con el servidor. Intente de nuevo.');
        helpButton.disabled = false;
        helpButton.textContent = 'SOLICITAR ASISTENCIA';
    }
}

/**
 * Inicia el contador de cooldown en la interfaz.
 * @param {number} seconds Duración del cooldown.
 */
function startCooldown(seconds) {
    let timeLeft = seconds;
    cooldownMessage.classList.remove('hidden');
    helpButton.disabled = true;
    helpButton.textContent = 'ESPERE...';

    if (cooldownTimer) clearInterval(cooldownTimer);

    countdownSpan.textContent = timeLeft;

    cooldownTimer = setInterval(() => {
        timeLeft--;
        countdownSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(cooldownTimer);
            cooldownMessage.classList.add('hidden');
            helpButton.disabled = false;
            helpButton.textContent = 'SOLICITAR ASISTENCIA';
        }
    }, 1000);
}

// =================================================================
// INICIALIZACIÓN
// =================================================================

function disconnectDevice() {
    if (confirm('¿Está seguro de que desea desvincular este dispositivo? Perderá la conexión con la cama.')) {
        // Borrar el estado local de vinculación
        localStorage.removeItem('camaId');
        localStorage.removeItem('camaCodigo');
        camaId = null;
        camaCodigo = null;
        if (cooldownTimer) clearInterval(cooldownTimer);
        alert('Dispositivo desvinculado. Será redirigido a la vista de escaneo.');
        location.reload(); 
    }
}

/**
 * Función principal para determinar qué vista cargar al inicio.
 */
function init() {
    getDeviceId(); // Asegurar que el ID del dispositivo existe
    
    if (camaId && camaCodigo) {
        // Si hay datos de vinculación guardados, ir a la vista de ayuda
        showHelpView();
    } else {
        // Si no, forzar la vista de escaneo QR
        showScanView();
    }
}

// Asignación de eventos
helpButton.addEventListener('click', requestHelp);
disconnectButton.addEventListener('click', disconnectDevice);

// Iniciar la aplicación al cargar el script
init();