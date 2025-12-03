import { IslaAPI } from "./api.js";

async function cargarCamas() {
    const tabla = document.getElementById("tablaCamas");
    if (!tabla) return;

    const respuesta = await IslaAPI.getCamas();
    const camas = respuesta?.data || [];

    tabla.innerHTML = "";

    camas.forEach(c => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.codigo}</td>
            <td>${c.numero}</td>
            <td>${c.habitacion?.nombre || "Sin habitación"}</td>
            <td>${c.paciente ? c.paciente.nombre + " " + c.paciente.apellido : "Libre"}</td>
            <td>
                <a href="editar.html?id=${c.id}">Editar</a>
                <button onclick="eliminarCama(${c.id})">Eliminar</button>
                <a href="generar-qr.html?id=${c.id}">Generar QR</a>
            </td>
        `;

        tabla.appendChild(tr);
    });
}

async function cargarHabitacionesEnSelect() {
    const select = document.getElementById("habitacion");
    if (!select) return;

    const resp = await IslaAPI.getHabitaciones();
    const habitaciones = resp?.data || [];

    select.innerHTML = "";

    habitaciones.forEach(h => {
        const opt = document.createElement("option");
        opt.value = h.id;
        opt.textContent = h.nombre;
        select.appendChild(opt);
    });
}

if (document.getElementById("formCrearCama")) {

    cargarHabitacionesEnSelect();

    document.getElementById("formCrearCama").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            codigo: document.getElementById("codigo").value,
            numero: document.getElementById("numero").value,
            habitacion: { id: document.getElementById("habitacion").value }
        };

        await IslaAPI.createCama(data);

        window.location.href = "lista.html";
    });
}

async function cargarCamaEditar() {
    const form = document.getElementById("formEditarCama");
    if (!form) return;

    cargarHabitacionesEnSelect();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const respuesta = await IslaAPI.getCama(id);
    const c = respuesta?.data;

    if (!c) {
        alert("Error al cargar la cama.");
        return;
    }

    document.getElementById("codigo").value = c.codigo;
    document.getElementById("numero").value = c.numero;
    document.getElementById("habitacion").value = c.habitacion?.id;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            codigo: document.getElementById("codigo").value,
            numero: document.getElementById("numero").value,
            habitacion: { id: document.getElementById("habitacion").value }
        };

        await IslaAPI.updateCama(id, data);

        window.location.href = "lista.html";
    });
}

async function eliminarCama(id) {
    if (!confirm("¿Seguro que deseas eliminar esta cama?")) return;

    await IslaAPI.deleteCama(id);

    location.reload();
}

cargarCamas();
cargarCamaEditar();

window.eliminarCama = eliminarCama;
