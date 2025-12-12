const BASE_URL = 'http://127.0.0.1:8081/api/hospitales/paciente'; 
const COOLDOWN_SECONDS = 12;

// --- DATOS PERSISTENTES---
let camaId = localStorage.getItem('camaId') || null;
let camaCodigo = localStorage.getItem('camaCodigo') || null; 
let dispositivoId = localStorage.getItem('dispositivoId') || null;

// Banderas y referencias
let isProcessingScan = false; 
let html5QrcodeScanner = null;
let cooldownTimer = null;

let scanView, helpView, qrScannerId, scanErrorMessage, camaCodigoDisplay;
let helpButton, cooldownMessage, countdownSpan; // Ya no necesitamos disconnectButton aquí

// DECLARACIÓN DE VARIABLES DOM 
let scanView, helpView, qrScannerId, scanErrorMessage, camaCodigoDisplay;
let helpButton, cooldownMessage, countdownSpan; // Ya no necesitamos disconnectButton aquí


// =================================================================
// SWEETALERT UTILITIES
// =================================================================

function showSuccessAlert(title, text) {
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        confirmButtonText: 'Aceptar',
        customClass: {
            container: 'paciente-swal-container',
            popup: 'paciente-swal-popup',
            confirmButton: 'paciente-swal-confirm-button',
        }
    });
}


function showInfoAlert(title, text, icon = 'info') {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: 'Aceptar',
        customClass: {
            container: 'paciente-swal-container',
            popup: 'paciente-swal-popup',
            confirmButton: 'paciente-swal-confirm-button',
        }
    });
}


function showErrorAlert(title, text) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: text,
        confirmButtonText: 'Aceptar',
        customClass: {
            container: 'paciente-swal-container',
            popup: 'paciente-swal-popup',
            confirmButton: 'paciente-swal-confirm-button-error',
        }
    });
}

// =================================================================
// PERSISTENCIA Y UTILIDADES
// =================================================================

function getDeviceId() {
    if (!dispositivoId) {
        dispositivoId = 'dev-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('dispositivoId', dispositivoId);
    }
    return dispositivoId;
}

function saveSession(cId, cCode) {
    camaId = cId;
    camaCodigo = cCode;
    localStorage.setItem('camaId', cId);
    localStorage.setItem('camaCodigo', cCode);
}
function clearSession() {
    localStorage.removeItem('camaId');
    localStorage.removeItem('camaCodigo');
    camaId = null;
    camaCodigo = null;
    if (cooldownTimer) clearInterval(cooldownTimer);
}

function showScanView() {
    scanView?.classList.remove('hidden');
    helpView?.classList.add('hidden');
    scanErrorMessage?.classList.add('hidden'); 
    
    if (!html5QrcodeScanner) {
        initializeScanner();
    } else {
        html5QrcodeScanner.render(onScanSuccess, onScanError);
    }
}

function showHelpView() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(err => {
            console.error("Error al detener el scanner:", err);
        });
    }
    
    scanView?.classList.add('hidden');
    helpView?.classList.remove('hidden');
    camaCodigoDisplay.textContent = camaCodigo; 
    
    cooldownMessage?.classList.add('hidden');
    helpButton.disabled = false;
    helpButton.textContent = 'SOLICITAR ASISTENCIA';
}

function initializeScanner() {
    if (typeof Html5QrcodeScanner === 'undefined') {
        console.error("La librería Html5QrcodeScanner no está cargada.");
        scanErrorMessage.textContent = 'Error: No se encontró la librería del scanner.';
        scanErrorMessage.classList.remove('hidden');
        return;
    }
    
    html5QrcodeScanner = new Html5QrcodeScanner(
        qrScannerId,
        { fps: 10, qrbox: 250, disableFlip: false },
        false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanError);
}

/**
 * Se ejecuta al detectar un código QR.
 * @param {string} codigoCamaQR - Contenido completo del QR (string JSON).
 */
async function onScanSuccess(codigoCamaQR) {
    if (camaId || isProcessingScan) {
        return; 
    }

    isProcessingScan = true;
    let codigoCama; 

    try {
        await html5QrcodeScanner.clear();

        // 1. ANÁLISIS DEL CÓDIGO QR
        try {
            const camaData = JSON.parse(codigoCamaQR);
            codigoCama = camaData.codigo; 
        } catch (e) {
            console.error("Error al parsear JSON del QR:", e);
            showErrorAlert("Error de QR", "El código QR no tiene el formato de datos de cama esperado (JSON inválido).");
            isProcessingScan = false;
            showScanView();
            return;
        }
        
        if (!codigoCama) {
            showErrorAlert("Error de QR", "No se pudo encontrar la propiedad 'codigo' dentro del QR.");
            isProcessingScan = false;
            showScanView();
            return;
        }
        
        // 2. LLAMADA AL BACKEND
        const deviceId = getDeviceId();
        const endpoint = `${BASE_URL}/vincular/`; 

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deviceId: deviceId, 
                codigoCama: codigoCama 
            })
        });

        const apiResponse = await response.json();
        
        // 3. MANEJO COMPLETO DE RESPUESTA Y ERRORES
        if (apiResponse.error || response.status !== 200) {
            const msg = apiResponse.mensaje || apiResponse.message || 'Error desconocido al vincular.';
            
            showErrorAlert("Error de vinculación", msg);
            
            isProcessingScan = false;
            showScanView(); // Regresa a la vista de escaneo
            return;
        }

        const data = apiResponse.data;
        
        if (!data || !data.camaId) {
            showErrorAlert("Error interno", 'El servidor no devolvió el ID de la cama.');
            isProcessingScan = false;
            showScanView(); 
            return;
        }

        // 4. GUARDAR SESIÓN Y MOSTRAR VISTA DE AYUDA        
        saveSession(data.camaId, codigoCama);
        showSuccessAlert("¡Vinculación exitosa!", 'Dispositivo vinculado y asignado a la cama: ' + codigoCama);
        showHelpView();


    } catch (error) {
        console.error("Error de conexión/fetch en la vinculación:", error);
        scanErrorMessage.textContent = 'Error: Falló la conexión con el servidor. Intente de nuevo.';
        scanErrorMessage.classList.remove('hidden');
        showScanView(); 
    } finally {
        isProcessingScan = false;
    }
}

function onScanError(errorMessage) {
    if (scanView?.classList.contains('hidden') || isProcessingScan) return; 

    if (errorMessage.includes("NotAllowedError") || errorMessage.includes("no camera")) {
        scanErrorMessage.textContent = 'Error: No se pudo iniciar la cámara. Asegúrese de tener permisos.';
        scanErrorMessage.classList.remove('hidden');
    }
}


async function requestHelp() {
    if (!camaId) {
        showInfoAlert('Dispositivo no vinculado', 'Por favor, escanee el QR de la cama.');
        showScanView();
        return;
    }
    
    helpButton.disabled = true;
    helpButton.textContent = 'ENVIANDO...';

    const endpoint = `${BASE_URL}/ayuda/${camaId}/`;
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
        });

        const apiResponse = await response.json();

        if (apiResponse.error) {
            // Manejo específico del Cooldown o cualquier otro error
            if (apiResponse.mensaje && apiResponse.mensaje.includes("Cooldown")) {
                const match = apiResponse.mensaje.match(/(\d+)s/);
                const waitTime = match ? parseInt(match[1]) : COOLDOWN_SECONDS; 
                startCooldown(waitTime); 
                return;
            } else {
                const msg = apiResponse.mensaje || apiResponse.message || 'Error al solicitar asistencia.';
                showErrorAlert("Error de solicitud", msg);
                helpButton.disabled = false;
                helpButton.textContent = 'SOLICITAR ASISTENCIA';
                return;
            }
        }

        // Cooldown exitoso
        const cooldownS = (apiResponse.data && apiResponse.data.cooldown_s) || COOLDOWN_SECONDS; 
        startCooldown(cooldownS);
        showSuccessAlert("¡Solicitud enviada!", 'Se ha notificado al personal.');

    } catch (error) {
        console.error("Error en la solicitud de ayuda:", error);
        showErrorAlert("Error de conexión", 'Error de conexión con el servidor. Intente de nuevo.');
        helpButton.disabled = false;
        helpButton.textContent = 'SOLICITAR ASISTENCIA';
    }
}

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

async function disconnectDevice() {
    
    if (!camaId) {
        // No hay cama vinculada en local, simplemente limpiamos por seguridad y recargamos.
        clearSession();
        showInfoAlert('Desvinculación local', 'Dispositivo desvinculado. Será redirigido a la vista de escaneo.');
        location.reload(); 
        return;
    }
    
    // Reemplazo de window.confirm por SweetAlert
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Desea desvincular?',
        text: '¿Está seguro de que desea desvincular este dispositivo y liberar la cama?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, desvincular',
        cancelButtonText: 'Cancelar',
        customClass: {
            container: 'paciente-swal-container',
            popup: 'paciente-swal-popup',
            confirmButton: 'paciente-swal-confirm-button-danger',
            cancelButton: 'paciente-swal-confirm-button',
        }
    });

    if (result.isConfirmed) {
        const endpoint = `${BASE_URL}/desvincular/${camaId}/`;
        
        try {
            // 1. Llamada al backend para liberar la cama
            const response = await fetch(endpoint, {
                method: 'POST',
            });

            // Leer la respuesta (incluso si hay error HTTP, para obtener el mensaje)
            const apiResponse = await response.json();

            if (apiResponse.error || response.status !== 200) {
                const msg = apiResponse.mensaje || 'Error desconocido al intentar liberar la cama.';
                console.error("Error del backend:", apiResponse);
                showErrorAlert('Error al desvincular', `${msg}. Se borrará la sesión local, pero la cama puede seguir ocupada en el sistema.`);
            } else {
                showSuccessAlert('¡Éxito!', 'Cama liberada y dispositivo desvinculado con éxito.');
            }
            
        } catch (error) {
            console.error("Error de conexión al intentar desvincular:", error);
            showErrorAlert('Error de conexión', 'Error de conexión con el servidor al desvincular. Borrando sesión local.');
        } finally {
            // 2. Siempre limpiamos la sesión local
            clearSession();
            // 3. Recargar la página para mostrar la vista de escaneo
            location.reload(); 
        }
    }
}

/**
 * Función principal para determinar qué vista cargar al inicio.
 */
function init() {
    scanView = document.getElementById('scan-view'); 
    helpView = document.getElementById('help-view');
    qrScannerId = 'qr-scanner';
    scanErrorMessage = document.getElementById('scan-error-message');
    camaCodigoDisplay = document.getElementById('cama-codigo-display');
    helpButton = document.getElementById('help-button');
    cooldownMessage = document.getElementById('cooldown-message');
    countdownSpan = document.getElementById('countdown');

    if (helpButton) helpButton.addEventListener('click', requestHelp);
    
    getDeviceId(); 
    
    if (camaId && camaCodigo) {
        showHelpView();
    } else {
        showScanView();
    }
}

document.addEventListener('DOMContentLoaded', init);