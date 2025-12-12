import { IslaAPI, EnfermeroAPI } from "./api.js";
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registrado:', reg))
    .catch(err => console.error('Error al registrar el SW:', err));
}
const tbody = document.getElementById("tabla-asignaciones");

let camasGlobal = [];

async function cargarDatos() {
    const camasResp = await IslaAPI.getCamas();
    const enfermerosResp = await EnfermeroAPI.getAll();

    if (camasResp.error || enfermerosResp.error) {
        return Swal.fire({
            title: "Error",
            text: "Hubo un problema cargando la información.",
            icon: "error",
        });
    }

    camasGlobal = camasResp.data;
    const enfermeros = enfermerosResp.data;

    tbody.innerHTML = "";

    camasGlobal.forEach(cama => {
        const listaEnfermeros = cama.enfermeros ? Array.from(cama.enfermeros) : [];

        const nombres =
            listaEnfermeros.length > 0
                ? listaEnfermeros.map(e => e.nombre).join(", ")
                : "Sin asignar";

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cama.id}</td>
            <td>${cama.codigo || "Sin código"}</td>
            <td>${nombres}</td>
            <td class="d-flex gap-2">
                <select id="enf-${cama.id}">
                    <option value="">Seleccione...</option>
                    ${enfermeros.map(e => `<option value="${e.id}">${e.nombre}</option>`).join("")}
                </select>
                <button data-cama="${cama.id}" class="btn btn-primary btn-sm">Asignar</button>
            </td>
        `;

        tbody.appendChild(fila);
    });

    agregarEventos();
}

function agregarEventos() {
    const botones = document.querySelectorAll("button[data-cama]");

    botones.forEach(btn => {
        btn.addEventListener("click", async () => {
            const camaId = btn.getAttribute("data-cama");
            const select = document.getElementById(`enf-${camaId}`);
            const enfermeroId = select.value;

            if (!enfermeroId) {
                return Swal.fire({
                    title: "Selecciona un enfermero",
                    text: "Debes elegir un enfermero antes de asignar.",
                    icon: "warning",
                });
            }

            const cama = camasGlobal.find(c => c.id == camaId);
            const enfermerosAsignados = cama.enfermeros || [];

            if (enfermerosAsignados.some(e => e.id == enfermeroId)) {
                return Swal.fire({
                    title: "Ya asignado",
                    text: "Este enfermero ya está asignado a esta cama.",
                    icon: "info",
                });
            }

            const resp = await IslaAPI.asignarEnfermero(camaId, enfermeroId);

            if (resp.error) {
                return Swal.fire({
                    title: "Error en la asignación",
                    text: resp.mensaje || "No se pudo completar la asignación.",
                    icon: "error",
                });
            }

            Swal.fire({
                title: "¡Asignación exitosa!",
                text: "El enfermero fue asignado correctamente.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            cargarDatos();
        });
    });
}

cargarDatos();