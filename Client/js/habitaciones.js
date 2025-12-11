import { IslaAPI } from "./api.js";
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log('SW registrado:', reg))
    .catch(err => console.error('Error al registrar el SW:', err));
}
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

function crearErrorSpan(inputId) {
    const span = document.createElement("small");
    span.classList.add("text-danger");
    document.getElementById(inputId).after(span);
    return span;
}

if (document.getElementById("formCrearHabitacion")) {

    const errNombre = crearErrorSpan("nombre");

    document.getElementById("formCrearHabitacion").addEventListener("submit", async (e) => {
        e.preventDefault();

        errNombre.textContent = "";

        const nombre = document.getElementById("nombre").value.trim();
        let valido = true;

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]{3,}$/.test(nombre)) {
            errNombre.textContent = "El nombre debe tener mínimo 3 caracteres.";
            valido = false;
        }

        if (!valido) return;

        await IslaAPI.createHabitacion({ nombre });

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

    if (!h) {
        alert("No se pudo cargar la habitación.");
        return;
    }

    document.getElementById("nombre").value = h.nombre;

    const errNombre = crearErrorSpan("nombre");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errNombre.textContent = "";

        const nombre = document.getElementById("nombre").value.trim();
        let valido = true;

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]{3,}$/.test(nombre)) {
            errNombre.textContent = "El nombre debe tener mínimo 3 caracteres.";
            valido = false;
        }

        if (!valido) return;

        await IslaAPI.updateHabitacion(id, { nombre });

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