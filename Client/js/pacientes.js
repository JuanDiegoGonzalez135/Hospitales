import { IslaAPI } from "./api.js";

async function cargarPacientes() {
    const tabla = document.getElementById("tablaPacientes");
    if (!tabla) return;

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

function crearErrorSpan(id) {
    const span = document.createElement("small");
    span.classList.add("text-danger");
    document.getElementById(id).after(span);
    return span;
}

if (document.getElementById("formCrearPaciente")) {

    const errNombre = crearErrorSpan("nombre");
    const errApellido = crearErrorSpan("apellido");
    const errEdad = crearErrorSpan("edad");
    const errTelefono = crearErrorSpan("telefono");
    const errCorreo = crearErrorSpan("correo");
    const errDiagnostico = crearErrorSpan("diagnostico");

    document.getElementById("formCrearPaciente").addEventListener("submit", async (e) => {
        e.preventDefault();

        // limpiar
        errNombre.textContent = "";
        errApellido.textContent = "";
        errEdad.textContent = "";
        errTelefono.textContent = "";
        errCorreo.textContent = "";
        errDiagnostico.textContent = "";

        let valido = true;

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const edad = parseInt(document.getElementById("edad").value);
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const diagnostico = document.getElementById("diagnostico").value.trim();

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(nombre)) {
            errNombre.textContent = "Nombre mínimo 3 letras.";
            valido = false;
        }

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(apellido)) {
            errApellido.textContent = "Apellido mínimo 3 letras.";
            valido = false;
        }

        if (isNaN(edad) || edad < 1 || edad > 120) {
            errEdad.textContent = "Edad inválida.";
            valido = false;
        }

        if (!/^\d{10}$/.test(telefono)) {
            errTelefono.textContent = "Debe ser un número de 10 dígitos.";
            valido = false;
        }

        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
            errCorreo.textContent = "Correo inválido.";
            valido = false;
        }

        if (diagnostico.length < 5) {
            errDiagnostico.textContent = "Diagnóstico mínimo 5 caracteres.";
            valido = false;
        }

        if (!valido) return;

        await IslaAPI.createPaciente({
            nombre,
            apellido,
            edad,
            telefono,
            correo,
            diagnostico
        });

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

    const errNombre = crearErrorSpan("nombre");
    const errApellido = crearErrorSpan("apellido");
    const errEdad = crearErrorSpan("edad");
    const errTelefono = crearErrorSpan("telefono");
    const errCorreo = crearErrorSpan("correo");
    const errDiagnostico = crearErrorSpan("diagnostico");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errNombre.textContent = "";
        errApellido.textContent = "";
        errEdad.textContent = "";
        errTelefono.textContent = "";
        errCorreo.textContent = "";
        errDiagnostico.textContent = "";

        let valido = true;

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const edad = parseInt(document.getElementById("edad").value);
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const diagnostico = document.getElementById("diagnostico").value.trim();

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(nombre)) {
            errNombre.textContent = "Nombre mínimo 3 letras.";
            valido = false;
        }

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(apellido)) {
            errApellido.textContent = "Apellido mínimo 3 letras.";
            valido = false;
        }

        if (isNaN(edad) || edad < 1 || edad > 120) {
            errEdad.textContent = "Edad inválida.";
            valido = false;
        }

        if (!/^\d{10}$/.test(telefono)) {
            errTelefono.textContent = "Debe ser un número de 10 dígitos.";
            valido = false;
        }

        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
            errCorreo.textContent = "Correo inválido.";
            valido = false;
        }

        if (diagnostico.length < 5) {
            errDiagnostico.textContent = "Diagnóstico mínimo 5 caracteres.";
            valido = false;
        }

        if (!valido) return;

        await IslaAPI.updatePaciente(id, {
            nombre,
            apellido,
            edad,
            telefono,
            correo,
            diagnostico
        });

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