// /front/js/enfermero-views.js

import { EnfermeroAPI } from "./api.js";

// --- SIMULACIÓN DE DATOS Y ESTADO ---
// ATENCIÓN: EN UN ENTORNO REAL, REEMPLAZAR '1' POR LA LÓGICA DE AUTENTICACIÓN.
const ENFERMERO_ID = 1; 
const NOTIF_STATUS_KEY = 'enfermero_notificaciones_activas';
const NOTIF_STORAGE_KEY = 'notificaciones_simuladas'; // Para simular notificaciones de ayuda

// Inicializar el estado de notificaciones si no existe (por defecto: activas)
if (localStorage.getItem(NOTIF_STATUS_KEY) === null) {
    localStorage.setItem(NOTIF_STATUS_KEY, 'true');
}

// --- FUNCIONES DE NOTIFICACIONES ---

/**
 * Carga y actualiza el texto y color del botón de notificaciones en el navbar.
 */
export function cargarEstadoNotificaciones() {
    const status = localStorage.getItem(NOTIF_STATUS_KEY) === 'true';
    const toggleBtn = document.getElementById("toggleNotificacionesBtn");
    const notifStatusSpan = document.getElementById("notifStatus");

    if (notifStatusSpan) {
        notifStatusSpan.textContent = status ? "Desactivar Notificaciones" : "Activar Notificaciones";
    }
    
    if (toggleBtn) {
        // Amarillo (warning) para la acción de DESACTIVAR, Verde (success) para ACTIVAR
        toggleBtn.className = status 
            ? "btn btn-warning ms-3" 
            : "btn btn-success ms-3"; 
    }
}

/**
 * Alterna el estado de las notificaciones y llama al backend.
 * (Cumple con el requisito: Desactivar notificaciones al terminar el turno)
 */
export async function toggleNotificaciones() {
    const currentStatus = localStorage.getItem(NOTIF_STATUS_KEY) === 'true';
    const newStatus = !currentStatus;

    try {
        // Llama al endpoint: POST /enfermero/{id}/notificaciones/{activar}
        const resp = await EnfermeroAPI.setNotificaciones(ENFERMERO_ID, newStatus);
        
        if (resp && !resp.error) {
            localStorage.setItem(NOTIF_STATUS_KEY, newStatus.toString());
            alert(`Notificaciones ${newStatus ? 'activadas' : 'desactivadas'} correctamente.`);
            cargarEstadoNotificaciones(); // Actualizar el botón inmediatamente
        } else {
            alert(`Error al actualizar el estado de notificaciones: ${resp?.message || 'Error de conexión'}`);
        }
    } catch (error) {
        console.error("Error al llamar a setNotificaciones:", error);
        alert("Ocurrió un error al intentar cambiar el estado de notificaciones.");
    }
}


// --- FUNCIÓN DE CAMAS ASIGNADAS ---

/**
 * Carga la lista de camas asignadas al enfermero y las muestra en una tabla.
 * (Cumple con el requisito: Opción de "ver camas asignadas")
 */
export async function cargarCamasAsignadas() {
    const tablaCamas = document.getElementById("tablaCamasAsignadas");
    if (!tablaCamas) return;

    tablaCamas.innerHTML = '<tr><td colspan="6" class="text-center">Cargando camas...</td></tr>';

    try {
        // Llama al endpoint: GET /enfermero/{id}/camas
        const resp = await EnfermeroAPI.verCamasAsignadas(ENFERMERO_ID);
        const camas = resp?.data || [];

        tablaCamas.innerHTML = ""; 

        if (camas.length === 0) {
            tablaCamas.innerHTML = '<tr><td colspan="6" class="text-center">No tienes camas asignadas.</td></tr>';
            return;
        }

        camas.forEach(cama => {
            const pacienteNombreCompleto = cama.paciente 
                ? `${cama.paciente.nombre} ${cama.paciente.apellido}` 
                : 'Vacía';

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${cama.id}</td>
                <td>${cama.codigo}</td>
                <td>${cama.numero}</td>
                <td>${cama.habitacion?.nombre || 'N/A'}</td>
                <td>${pacienteNombreCompleto}</td>
                
                <td>
                    ${cama.paciente 
                        // El onclick sigue usando el nombre anterior porque es un string, 
                        // pero la función exportada ahora tiene el nombre corregido. 
                        // Se recomienda cambiar el 'onclick' en el HTML si es posible, 
                        // o cambiar el nombre de la función abajo en JS.
                        ? `<button class="btn btn-info btn-sm" onclick="window.verDatosPacientePorCama(${cama.id})">Ver Paciente</button>` 
                        : `<button class="btn btn-secondary btn-sm" disabled>Cama Vacía</button>`
                    }
                </td>
            `;

            tablaCamas.appendChild(tr);
        });

        // NOTA: Para que el onclick funcione en el HTML cargado, 
        // debes exportar la función y asignarla al scope global (window) 
        // en tu archivo camas-asignadas.html (ver Nota Importante).

    } catch (error) {
        console.error("Error al cargar camas asignadas:", error);
        tablaCamas.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar las camas.</td></tr>';
    }
}

/**
 * Muestra una alerta con los datos básicos de un paciente.
 * * *CORRECCIÓN 2/2:* Se renombró de 'verDatosPacientePorCamaDesdeLista' a 'verDatosPacientePorCama'
 * para coincidir con el error en camas-asignadas.html.
 * * @param {number} camaId - El ID de la cama.
 */
export async function verDatosPacientePorCama(camaId) { 
    if (!camaId) return;

    try {
        // Llama al endpoint: GET /enfermero/cama/{camaId}/paciente
        const resp = await EnfermeroAPI.datosPaciente(camaId);

        if (resp && !resp.error && resp.data) {
            const paciente = resp.data;
            // Mostrar alerta
            alert(`Datos Básicos del Paciente (Cama ID: ${camaId}):\n`
                + `Nombre: ${paciente.nombre} ${paciente.apellido}\n`
                + `Edad: ${paciente.edad}\n`
                + `Diagnóstico: ${paciente.diagnostico}\n\n`
                + `(No es el expediente médico completo)`);
        } else {
            const msg = resp?.message || 'No se encontró un paciente asignado a esa cama o la cama no existe.';
            alert(msg);
        }
    } catch (error) {
        console.error("Error al obtener datos del paciente:", error);
        alert("Ocurrió un error al comunicarse con el servidor.");
    }
}


// --- FUNCIÓN DE ESCANEO QR / DATOS DE PACIENTE ---

/**
 * Busca los datos básicos de un paciente usando el ID de la cama y
 * rellena los campos del formulario de Escanear QR.
 * @param {number} camaId - El ID de la cama.
 */
async function rellenarDatosPacienteEnQR(camaId) {
    // Rellenar con "Cargando..." mientras llega la respuesta
    document.getElementById("pacienteNombre").textContent = "Cargando...";
    document.getElementById("pacienteApellido").textContent = "Cargando...";
    document.getElementById("pacienteEdad").textContent = "Cargando...";
    document.getElementById("pacienteDiagnostico").textContent = "Cargando...";

    try {
        // Llama al endpoint: GET /enfermero/cama/{camaId}/paciente
        const resp = await EnfermeroAPI.datosPaciente(camaId);

        if (resp && !resp.error && resp.data) {
            const paciente = resp.data;
            
            document.getElementById("pacienteAsignado").textContent = `Sí (ID: ${paciente.id})`;
            document.getElementById("pacienteNombre").textContent = paciente.nombre;
            document.getElementById("pacienteApellido").textContent = paciente.apellido;
            document.getElementById("pacienteEdad").textContent = paciente.edad;
            document.getElementById("pacienteDiagnostico").textContent = paciente.diagnostico;
            document.getElementById("pacienteDetalleInfo").style.display = 'block';

        } else {
            // Si el API falla al traer los datos detallados del paciente
            document.getElementById("pacienteAsignado").textContent = "Error al obtener datos detallados";
            document.getElementById("pacienteNombre").textContent = "N/A";
            document.getElementById("pacienteApellido").textContent = "N/A";
            document.getElementById("pacienteEdad").textContent = "N/A";
            document.getElementById("pacienteDiagnostico").textContent = "N/A";
            document.getElementById("pacienteDetalleInfo").style.display = 'none'; // Ocultar si hay error
            console.warn(`Error al obtener datos detallados del paciente para cama ${camaId}: ${resp?.message}`);
        }
    } catch (error) {
        console.error("Error de red al obtener datos del paciente:", error);
        document.getElementById("pacienteAsignado").textContent = "Error de red";
        document.getElementById("pacienteDetalleInfo").style.display = 'none';
    }
}


/**
 * Muestra los detalles de la cama y llama a la API para obtener el paciente.
 * * *CORRECCIÓN 1/2:* Se agregó 'export' y se renombró de 'mostrarDetallesCama' a 'verDatosDetalladosCama'
 * para coincidir con el error en escanear-qr.html.
 * * @param {object} camaData - Objeto con los datos de la cama (idealmente del QR o API de cama completa).
 */
export function verDatosDetalladosCama(camaData) { // <<-- CORREGIDO
    const resultadoTitulo = document.getElementById("resultadoTitulo");
    const resultadoDiv = document.getElementById("resultadoPaciente");
    
    // 1. Mostrar datos de la Cama
    document.getElementById("camaDetalleId").textContent = camaData.id || 'N/A';
    document.getElementById("camaDetalleCodigo").textContent = camaData.codigo || 'N/A';
    document.getElementById("camaDetalleHabitacion").textContent = camaData.habitacion?.nombre || 'N/A';
    document.getElementById("camaDetalleEstado").textContent = camaData.estado || 'N/A';
    document.getElementById("pacienteDetalleInfo").style.display = 'none';
    document.getElementById("pacienteAsignado").textContent = "Cargando...";

    resultadoTitulo.style.display = 'block';
    resultadoDiv.style.display = 'block';

    // 2. Comprobar si hay paciente asignado o si la cama está vacía
    if (camaData.paciente) {
        document.getElementById("pacienteAsignado").textContent = `Sí (ID: ${camaData.paciente.id} - Obteniendo datos detallados...)`;
        // 3. Llamar a la API para obtener los datos completos del paciente
        rellenarDatosPacienteEnQR(camaData.id);
        
    } else {
        document.getElementById("pacienteAsignado").textContent = "Ninguno";
        document.getElementById("pacienteNombre").textContent = "N/A";
        document.getElementById("pacienteApellido").textContent = "N/A";
        document.getElementById("pacienteEdad").textContent = "N/A";
        document.getElementById("pacienteDiagnostico").textContent = "N/A";
    }
}


// --- FUNCIÓN DE ESCANEO QR CON CÁMARA ---

/**
 * Inicia la cámara y el escaneo de códigos QR.
 */
export function iniciarEscaneoQR() {
    if (typeof Html5Qrcode === 'undefined') {
        console.error("Librería Html5Qrcode no cargada.");
        return;
    }

    const html5QrCode = new Html5Qrcode("reader");
    const qrStatus = document.getElementById("qrStatus");

    // Configuración para el escáner (priorizar enfoque y precisión)
    const qrCodeConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

    const onScanSuccess = (decodedText, decodedResult) => {
        html5QrCode.stop().then((ignore) => {
            console.log(`QR detectado (JSON): ${decodedText}`);
            qrStatus.textContent = `QR detectado. Procesando datos...`;
            
            try {
                // Intentar parsear el JSON que viene en el QR
                const camaData = JSON.parse(decodedText);
                
                if (camaData && camaData.id) {
                    // Usamos la función renombrada
                    verDatosDetalladosCama(camaData);
                } else {
                    throw new Error("El JSON del QR no contiene un ID de cama válido.");
                }

            } catch (error) {
                alert(`Error al procesar el código QR: ${error.message}. Asegúrate de que el código es un JSON de Cama válido.`);
                console.error(error);
                // Reiniciar el escáner
                setTimeout(() => iniciarEscaneoQR(), 3000);
            }

        }).catch((err) => {
            console.error("Error al detener el escáner:", err);
            // Mostrar la opción manual si hay un error crítico
        });
    };
    
    const onScanFailure = (errorMessage) => {
        // Se ignora el error de escaneo continuo
    };

    // Iniciar el escáner, priorizando la cámara trasera ("environment")
    html5QrCode.start(
        { facingMode: "environment" }, // Pide permiso y activa la cámara
        qrCodeConfig,
        onScanSuccess,
        onScanFailure
    ).then(() => {
        qrStatus.textContent = "Cámara activada. Si se requiere, acepta el permiso de la cámara.";
        // Ocultar resultados anteriores
        document.getElementById("resultadoTitulo").style.display = 'none';
        document.getElementById("resultadoPaciente").style.display = 'none';
    }).catch((err) => {
        qrStatus.textContent = "Error: No se pudo acceder a la cámara. Revisa los permisos o usa la entrada manual.";
        console.error("Error al iniciar la cámara:", err);
        alert("No se pudo iniciar la cámara. El dispositivo podría no tener permisos o no ser compatible. Se ha activado la opción de entrada manual.");
        
        // Mostrar la opción de entrada manual automáticamente
        document.getElementById('qrScannerContainer').style.display = 'none';
        document.getElementById('manualInputForm').style.display = 'block';
    });
}


// --- FUNCIÓN DE BÚSQUEDA MANUAL (Corregida) ---

/**
 * Configura el listener para el formulario de Escanear QR (manual).
 * NOTA: Esta era la función que estaba duplicada en tu script original.
 */
export function configurarFormularioEscanearQR() {
    const form = document.getElementById("formEscanearQR");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const camaId = document.getElementById("camaIdInput").value;

        if (!camaId) {
            alert("Ingresa un ID de cama.");
            return;
        }

        // SIMULACIÓN: En lugar de buscar solo el paciente, en la búsqueda manual
        // se debería buscar la cama completa (como si la API devolviera el objeto
        // de la Cama, que incluye el paciente y la habitación)
        try {
            // **IMPORTANTE**: Necesitas un endpoint en el backend para obtener los
            // detalles de una cama por su ID. Aquí estoy simulando que el endpoint
            // de datosPaciente devuelve el objeto Cama completo.
            
            // Usamos el endpoint de paciente para simular la obtención de datos
            // Necesitas el endpoint de Cama completa para un flujo real.
            
            const resp = await EnfermeroAPI.datosPaciente(camaId); // Usando un ID de Cama

            if (resp && !resp.error && resp.data) {
                // Aquí deberías recibir los datos de la Cama { id, codigo, paciente: {...}, habitacion: {...} }
                verDatosDetalladosCama(resp.data); // Usamos la función renombrada
            } else {
                const msg = resp?.message || 'No se encontró la cama o paciente asociado.';
                alert(`Error de búsqueda manual (Cama ID ${camaId}): ${msg}`);
                // Limpiar resultados
                document.getElementById("resultadoTitulo").style.display = 'none';
                document.getElementById("resultadoPaciente").style.display = 'none';
            }
        } catch (error) {
            console.error("Error al obtener datos del paciente:", error);
            alert("Ocurrió un error de red al comunicarse con el servidor.");
        }
    });
}


// --- FUNCIÓN DE SIMULACIÓN DE NOTIFICACIONES EN DASHBOARD ---

/**
 * Función que simula la recepción de notificaciones de ayuda del paciente.
 * NOTA: En la vida real, esto debe ser un listener a un canal WebSocket para recibir
 * el evento de "paciente solicita ayuda" en tiempo real.
 * (Cumple con el requisito: Recibe la notificación de cuando el paciente pide ayuda)
 */
export function simularNotificacion() {
    const notifContainer = document.getElementById("listaNotificaciones");
    const notifVacias = document.getElementById("notificacionesVacias");
    if (!notifContainer || !notifVacias) return;

    // Simulación: Si no hay notificaciones guardadas, simular una para mostrar la funcionalidad.
    let notificaciones = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
    
    if (notificaciones.length === 0) {
        // Simular que el paciente de la cama ID 5 ha pedido ayuda.
        notificaciones.push({ 
            id: Date.now(), 
            camaId: 5, 
            codigoCama: 'C-005', 
            paciente: 'Juan Pérez' 
        });
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notificaciones));
    }

    notifVacias.style.display = notificaciones.length > 0 ? 'none' : 'block';
    notifContainer.innerHTML = '';

    notificaciones.forEach(notif => {
        const div = document.createElement("div");
        div.className = "alert alert-danger d-flex justify-content-between align-items-center";
        div.setAttribute("role", "alert");
        div.id = `notif-${notif.id}`;

        div.innerHTML = `
            <div>
                <strong>¡ALERTA!</strong> El paciente <strong>${notif.paciente || 'Desconocido'}</strong> de la Cama <strong>${notif.codigoCama} (ID: ${notif.camaId})</strong> solicita ayuda.
                <p class="mb-0"><small>${new Date(notif.id).toLocaleTimeString()}</small></p>
            </div>
            <button class="btn btn-sm btn-outline-danger" onclick="window.marcarComoAtendida(${notif.id})">Marcar como atendida</button>
        `;
        notifContainer.appendChild(div);
    });

    // Función para manejar el clic en "Marcar como atendida" y hacerla global
    window.marcarComoAtendida = (notifId) => {
        let notifs = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
        notifs = notifs.filter(n => n.id !== notifId);
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
        document.getElementById(`notif-${notifId}`)?.remove();

        if (notifs.length === 0 && notifVacias) {
            notifVacias.style.display = 'block';
        }

        console.log("Notificación marcada como atendida:", notifId);
        // Aquí se enviaría una señal al backend para limpiar el estado de ayuda del paciente.
    };
}