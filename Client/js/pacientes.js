import { IslaAPI } from "./api.js";

async function cargarPacientes() {
    const tabla = document.getElementById("tablaPacientes");
    if (!tabla) return; // No estamos en lista.html

    const respuesta = await IslaAPI.getPacientes();
    const pacientes = respuesta?.data || [];

    tabla.innerHTML = "";

    pacientes.forEach(p => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombre} ${p.apellido}</td>
            <td>${p.edad}</td>
            <td>${p.telefono}</td>
            <td>${p.correo}</td>
            <td>${p.diagnostico}</td>
            <td>
                <a class="btn btn-warning btn-sm me-2" href="editar.html?id=${p.id}">Editar</a>
                <button class="btn btn-danger btn-sm" onclick="eliminarPaciente(${p.id})">Eliminar</button>
            </td>
        `;

        tabla.appendChild(tr);
    });
}

if (document.getElementById("formCrearPaciente")) {

    document.getElementById("formCrearPaciente").addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            edad: parseInt(document.getElementById("edad").value),
            telefono: document.getElementById("telefono").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            diagnostico: document.getElementById("diagnostico").value.trim()
        };

        await IslaAPI.createPaciente(data);

        window.location.href = "lista.html";
    });
}

async function cargarPacienteEditar() {
    const form = document.getElementById("formEditarPaciente");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const resp = await IslaAPI.getPaciente(id);
    const p = resp?.data;

    if (!p) {
        alert("Error al cargar el paciente");
        return;
    }

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("apellido").value = p.apellido;
    document.getElementById("edad").value = p.edad;
    document.getElementById("telefono").value = p.telefono;
    document.getElementById("correo").value = p.correo;
    document.getElementById("diagnostico").value = p.diagnostico;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            edad: parseInt(document.getElementById("edad").value),
            telefono: document.getElementById("telefono").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            diagnostico: document.getElementById("diagnostico").value.trim()
        };

        await IslaAPI.updatePaciente(id, data);

        window.location.href = "lista.html";
    });
}

async function eliminarPaciente(id) {
    if (!confirm("¿Seguro que deseas eliminar este paciente?")) return;

    await IslaAPI.deletePaciente(id);

    location.reload();
}

cargarPacientes();
cargarPacienteEditar();

window.eliminarPaciente = eliminarPaciente;