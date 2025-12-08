// /front/js/api/Api.js

const API_BASE = "http://localhost:8080/api/hospitales";

async function request(url, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    if (body) options.body = JSON.stringify(body);
    const resp = await fetch(url, options);
    return await resp.json();
}

/* --------------------- PACIENTE APP --------------------- */

export const PacienteAPI = {

    // POST /paciente/vincular
    vincular(deviceId, codigoCama) {
        return request(`${API_BASE}/paciente/vincular`, "POST", {
            deviceId, codigoCama
        });
    },

    // POST /paciente/ayuda/{idCama}
    solicitarAyuda(idCama) {
        return request(`${API_BASE}/paciente/ayuda/${idCama}`, "POST");
    }
};


/* --------------------- ISLA CRUD --------------------- */

export const IslaAPI = {

    /* ---- CAMAS ---- */

    getCamas() {
        return request(`${API_BASE}/isla/camas`);
    },

    getCama(id) {
        return request(`${API_BASE}/isla/camas/${id}`);
    },

    createCama(data) {
        return request(`${API_BASE}/isla/camas`, "POST", data);
    },

    updateCama(id, data) {
        return request(`${API_BASE}/isla/camas/${id}`, "PUT", data);
    },

    deleteCama(id) {
        return request(`${API_BASE}/isla/camas/${id}`, "DELETE");
    },


    /* ---- PACIENTES CRUD ---- */

    getPacientes() {
        return request(`${API_BASE}/isla/pacientes`);
    },

    getPaciente(id) {
        return request(`${API_BASE}/isla/pacientes/${id}`);
    },

    createPaciente(data) {
        return request(`${API_BASE}/isla/pacientes`, "POST", data);
    },

    updatePaciente(id, data) {
        return request(`${API_BASE}/isla/pacientes/${id}`, "PUT", data);
    },

    deletePaciente(id) {
        return request(`${API_BASE}/isla/pacientes/${id}`, "DELETE");
    },


    /* ---- ASIGNACIONES ---- */

    asignarPaciente(camaId, pacienteId) {
        return request(`${API_BASE}/isla/camas/${camaId}/asignarPaciente/${pacienteId}`, "POST");
    },

    asignarEnfermero(camaId, enfermeroId) {
        return request(`${API_BASE}/isla/camas/${camaId}/asignarEnfermero/${enfermeroId}`, "POST");
    },


    /* ---- QR ---- */

    generarQR(camaId) {
        return request(`${API_BASE}/isla/camas/${camaId}/qr`);
    },


    /* ---- REVOCAR DISPOSITIVO ---- */

    revocarDispositivo(camaId) {
        return request(`${API_BASE}/isla/camas/${camaId}/revocarDispositivo`, "POST");
    },


    /* ---- HABITACIONES CRUD ---- */

    getHabitaciones() {
        return request(`${API_BASE}/isla/habitaciones`);
    },

    getHabitacion(id) {
        return request(`${API_BASE}/isla/habitaciones/${id}`);
    },

    createHabitacion(data) {
        return request(`${API_BASE}/isla/habitaciones`, "POST", data);
    },

    updateHabitacion(id, data) {
        return request(`${API_BASE}/isla/habitaciones/${id}`, "PUT", data);
    },

    deleteHabitacion(id) {
        return request(`${API_BASE}/isla/habitaciones/${id}`, "DELETE");
    },


    /* ---- NOTIFICACIONES ---- */

    getNotificaciones() {
        return request(`${API_BASE}/isla/notificaciones`);
    },

    getNotificacionesPorCama(camaId) {
        return request(`${API_BASE}/isla/notificaciones/cama/${camaId}`);
    }
};


/* --------------------- ENFERMEROS NUEVO CONTROLLER --------------------- */

export const EnfermeroAPI = {

    getAll() {
        return request(`${API_BASE}/enfermero`);
    },

    get(id) {
        return request(`${API_BASE}/enfermero/${id}`);
    },

    create(data) {
        return request(`${API_BASE}/enfermero`, "POST", data);
    },

    update(id, data) {
        return request(`${API_BASE}/enfermero/${id}`, "PUT", data);
    },

    delete(id) {
        return request(`${API_BASE}/enfermero/${id}`, "DELETE");
    },

    setNotificaciones(id, activar) {
        return request(`${API_BASE}/enfermero/${id}/notificaciones/${activar}`, "POST");
    },

    verCamasAsignadas(id) {
        return request(`${API_BASE}/enfermero/${id}/camas`);
    },

    datosPaciente(camaId) {
        return request(`${API_BASE}/enfermero/cama/${camaId}/paciente`);
    },

    registrarToken(idEnfermero, token) {
        return request(`${API_BASE}/enfermero/registrar-token/${idEnfermero}`,
            "POST",
            { token }
        );
    }
};

/* --------------------- AUTH --------------------- */

export const AuthAPI = {
    login(correo, password) {
        return request("http://localhost:8080/api/auth", "POST", {
            correo,
            password
        });
    }
};