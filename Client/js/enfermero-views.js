// /front/js/enfermero-views.js
import { EnfermeroAPI } from "./api.js";
import { requestPermissionAndRegister } from "./firebase.js";

// Obtener ID del enfermero desde sesión/contexto real
const ENFERMERO_ID = 1;
requestPermissionAndRegister(ENFERMERO_ID); // Registrar FCM al cargar la vista

const NOTIF_STATUS_KEY = 'enfermero_notificaciones_activas';

// Inicializar estado de notificaciones si no existe
if (localStorage.getItem(NOTIF_STATUS_KEY) === null) {
    localStorage.setItem(NOTIF_STATUS_KEY, 'true');
}

// --- FUNCIONES DE NOTIFICACIONES ---
export function cargarEstadoNotificaciones() {
    const status = localStorage.getItem(NOTIF_STATUS_KEY) === 'true';
    const toggleBtn = document.getElementById("toggleNotificacionesBtn");
    const notifStatusSpan = document.getElementById("notifStatus");

    if (notifStatusSpan) {
        notifStatusSpan.textContent = status ? "Desactivar Notificaciones" : "Activar Notificaciones";
    }
    
    if (toggleBtn) {
        toggleBtn.className = status ? "btn btn-warning ms-3" : "btn btn-success ms-3"; 
    }
}

export async function toggleNotificaciones() {
    const currentStatus = localStorage.getItem(NOTIF_STATUS_KEY) === 'true';
    const newStatus = !currentStatus;

    try {
        const resp = await EnfermeroAPI.setNotificaciones(ENFERMERO_ID, newStatus);
        if (resp && !resp.error) {
            localStorage.setItem(NOTIF_STATUS_KEY, newStatus.toString());
            alert(`Notificaciones ${newStatus ? 'activadas' : 'desactivadas'} correctamente.`);
            cargarEstadoNotificaciones();
        } else {
            alert(`Error al actualizar el estado de notificaciones: ${resp?.message || 'Error de conexión'}`);
        }
    } catch (error) {
        console.error("Error al llamar a setNotificaciones:", error);
        alert("Ocurrió un error al intentar cambiar el estado de notificaciones.");
    }
}

// --- FUNCIÓN PARA RECIBIR NOTIFICACIONES EN VIVO ---
window.marcarComoAtendida = async (notifId) => {
    const div = document.getElementById(`notif-${notifId}`);
    div?.remove();

    // Avisar al backend que se atendió la notificación
    try {
        await EnfermeroAPI.marcarNotificacionAtendida(ENFERMERO_ID, notifId);
    } catch (err) {
        console.error("Error al marcar notificación como atendida:", err);
    }

    const notifContainer = document.getElementById("listaNotificaciones");
    const notifVacias = document.getElementById("notificacionesVacias");
    if (notifContainer && notifVacias && notifContainer.children.length === 0) {
        notifVacias.style.display = 'block';
    }
};

// --- FUNCIONES DE CAMAS ASIGNADAS Y PACIENTES ---
export async function cargarCamasAsignadas() {
    const tablaCamas = document.getElementById("tablaCamasAsignadas");
    if (!tablaCamas) return;

    tablaCamas.innerHTML = '<tr><td colspan="6" class="text-center">Cargando camas...</td></tr>';

    try {
        const resp = await EnfermeroAPI.verCamasAsignadas(ENFERMERO_ID);
        const camas = resp?.data || [];
        tablaCamas.innerHTML = ""; 

        if (camas.length === 0) {
            tablaCamas.innerHTML = '<tr><td colspan="6" class="text-center">No tienes camas asignadas.</td></tr>';
            return;
        }

        camas.forEach(cama => {
            const pacienteNombreCompleto = cama.paciente ? `${cama.paciente.nombre} ${cama.paciente.apellido}` : 'Vacía';
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${cama.id}</td>
                <td>${cama.codigo}</td>
                <td>${cama.numero}</td>
                <td>${cama.habitacion?.nombre || 'N/A'}</td>
                <td>${pacienteNombreCompleto}</td>
                <td>
                    ${cama.paciente 
                        ? `<button class="btn btn-info btn-sm" onclick="window.verDatosPacientePorCama(${cama.id})">Ver Paciente</button>` 
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

export async function verDatosPacientePorCama(camaId) { 
    if (!camaId) return;

    try {
        const resp = await EnfermeroAPI.datosPaciente(camaId);
        if (resp && !resp.error && resp.data) {
            const paciente = resp.data;
            alert(`Datos Básicos del Paciente (Cama ID: ${camaId}):\nNombre: ${paciente.nombre} ${paciente.apellido}\nEdad: ${paciente.edad}\nDiagnóstico: ${paciente.diagnostico}\n\n(No es el expediente médico completo)`);
        } else {
            alert(resp?.message || 'No se encontró un paciente asignado a esa cama o la cama no existe.');
        }
    } catch (error) {
        console.error("Error al obtener datos del paciente:", error);
        alert("Ocurrió un error al comunicarse con el servidor.");
    }
}

// --- FUNCIONES DE ESCANEO QR Y MANUAL ---
async function rellenarDatosPacienteEnQR(camaId) { /* ...igual que antes... */ }
export function verDatosDetalladosCama(camaData) { /* ...igual que antes... */ }
export function iniciarEscaneoQR() { /* ...igual que antes... */ }
export function configurarFormularioEscanearQR() { /* ...igual que antes... */ }

// --- ELIMINAR SIMULACIÓN DE NOTIFICACIONES ---