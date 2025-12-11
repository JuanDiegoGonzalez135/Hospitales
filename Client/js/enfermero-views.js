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
                        ? `<button class="btn btn-info btn-sm" onclick="verDatosPacientePorCama(${cama.id})">Ver Paciente</button>` 
                        : `<button class="btn btn-secondary btn-sm" disabled>Cama Vacía</button>`
                    }
                </td>
            `;

            tablaCamas.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al cargar camas asignadas:", error);
        tablaCamas.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar las camas.</td></tr>';
    }
}


// --- FUNCIÓN DE ESCANEO QR / DATOS DE PACIENTE ---

/**
 * Busca los datos básicos de un paciente usando el ID de la cama.
 * (Cumple con el requisito: Modulo para escaneo de QR, pero para ver los datos básicos del paciente)
 * @param {number} camaId - El ID de la cama (simulando la lectura del QR).
 * @param {boolean} fromQrPage - Indica si se llama desde la página de Escanear QR.
 */
export async function verDatosPacientePorCama(camaId, fromQrPage = false) {
    if (!camaId) {
        if (fromQrPage) alert("Por favor, introduce un ID de cama.");
        return;
    }

    // Ocultar resultados previos si estamos en la página de QR
    const resultadoDiv = document.getElementById("resultadoPaciente");
    const titulo = document.getElementById("resultadoTitulo");
    if (fromQrPage && resultadoDiv && titulo) {
        resultadoDiv.style.display = 'none';
        titulo.style.display = 'none';
    }

    try {
        // Llama al endpoint: GET /enfermero/cama/{camaId}/paciente
        const resp = await EnfermeroAPI.datosPaciente(camaId);

        if (resp && !resp.error && resp.data) {
            const paciente = resp.data;
            
            if (fromQrPage) {
                // Mostrar resultados en la página de Escanear QR
                document.getElementById("pacienteNombre").textContent = paciente.nombre || 'N/A';
                document.getElementById("pacienteApellido").textContent = paciente.apellido || 'N/A';
                document.getElementById("pacienteEdad").textContent = paciente.edad || 'N/A';
                document.getElementById("pacienteDiagnostico").textContent = paciente.diagnostico || 'N/A';
                resultadoDiv.style.display = 'block';
                titulo.style.display = 'block';
            } else {
                // Mostrar alerta si se llama desde la tabla de camas asignadas
                alert(`Datos Básicos del Paciente (Cama ID: ${camaId}):\n`
                    + `Nombre: ${paciente.nombre} ${paciente.apellido}\n`
                    + `Edad: ${paciente.edad}\n`
                    + `Diagnóstico: ${paciente.diagnostico}\n\n`
                    + `(No es el expediente médico completo)`);
            }
        } else {
            const msg = resp?.message || 'No se encontró un paciente asignado a esa cama o la cama no existe.';
            alert(msg);
        }
    } catch (error) {
        console.error("Error al obtener datos del paciente:", error);
        alert("Ocurrió un error al comunicarse con el servidor.");
    }
}

/**
 * Configura el listener para el formulario de Escanear QR.
 */
export function configurarFormularioEscanearQR() {
    const form = document.getElementById("formEscanearQR");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const camaId = document.getElementById("camaIdInput").value;
        // Llamar a la función de búsqueda indicando que viene de la página de QR (true)
        verDatosPacientePorCama(camaId, true);
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
            <button class="btn btn-sm btn-outline-danger" onclick="marcarComoAtendida(${notif.id})">Marcar como atendida</button>
        `;
        notifContainer.appendChild(div);
    });

    // Función para manejar el clic en "Marcar como atendida"
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