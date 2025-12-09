import { IslaAPI } from "./api.js";

async function cargarHabitaciones() {
    const tabla = document.getElementById("tablaHabitaciones");
    if (!tabla) return;

    const respuesta = await IslaAPI.getHabitaciones();
    const habitaciones = respuesta?.data || [];

    tabla.innerHTML = "";

    habitaciones.forEach(h => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${h.id}</td>
            <td>${h.nombre}</td>
            <td>
                <a class="btn btn-warning btn-sm me-2" href="editar.html?id=${h.id}">Editar</a>
                <button class="btn btn-danger btn-sm" onclick="eliminarHabitacion(${h.id})">Eliminar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });
}

if (document.getElementById("formCrearHabitacion")) {

    document.getElementById("formCrearHabitacion").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            nombre: document.getElementById("nombre").value.trim(),
        };

        await IslaAPI.createHabitacion(data);

        window.location.href = "lista.html";
    });
}

async function cargarHabitacionEditar() {
    const form = document.getElementById("formEditarHabitacion");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const resp = await IslaAPI.getHabitacion(id);
    const h = resp?.data;

    document.getElementById("nombre").value = h.nombre;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            nombre: document.getElementById("nombre").value.trim(),
        };

        await IslaAPI.updateHabitacion(id, data);

        window.location.href = "lista.html";
    });
}

async function eliminarHabitacion(id) {
    if (!confirm("¿Seguro que deseas eliminar esta habitación?")) return;

    await IslaAPI.deleteHabitacion(id);

    location.reload();
}

cargarHabitaciones();
cargarHabitacionEditar();

window.eliminarHabitacion = eliminarHabitacion;