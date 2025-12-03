import { EnfermeroAPI } from "./api.js";

async function cargarEnfermeros() {
    const tabla = document.getElementById("tablaEnfermeros");
    if (!tabla) return;

    const respuesta = await EnfermeroAPI.getAll();
    const enfermeros = respuesta?.data || [];

    tabla.innerHTML = "";

    enfermeros.forEach(e => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${e.nombre}</td>
            <td>${e.apellido}</td>
            <td>${e.telefono}</td>
            <td>${e.correo}</td>
            
            <td>
                <a href="editar.html?id=${e.id}">Editar</a>
                <button onclick="eliminarEnfermero(${e.id})">Eliminar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });
}

if (document.getElementById("formCrearEnfermero")) {

    document.getElementById("formCrearEnfermero").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            telefono: document.getElementById("telefono").value,
            correo: document.getElementById("correo").value,
            password: document.getElementById("password").value
        };

        await EnfermeroAPI.create(data);

        window.location.href = "lista.html";
    });
}

async function cargarEnfermeroEditar() {
    const form = document.getElementById("formEditarEnfermero");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const resp = await EnfermeroAPI.get(id);
    const enfermero = resp?.data;

    document.getElementById("nombre").value = enfermero.nombre;
    document.getElementById("apellido").value = enfermero.apellido;
    document.getElementById("telefono").value = enfermero.telefono;
    document.getElementById("correo").value = enfermero.correo;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            telefono: document.getElementById("telefono").value,
            correo: document.getElementById("correo").value
        };

        await EnfermeroAPI.update(id, data);

        window.location.href = "lista.html";
    });
}

async function eliminarEnfermero(id) {
    if (!confirm("¿Seguro que deseas eliminar este enfermero?")) return;

    await EnfermeroAPI.delete(id);

    location.reload();
}

cargarEnfermeros();
cargarEnfermeroEditar();

window.eliminarEnfermero = eliminarEnfermero;
