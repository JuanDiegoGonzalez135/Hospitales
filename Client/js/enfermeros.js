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

function crearErrorSpan(inputId) {
    const span = document.createElement("small");
    span.classList.add("text-danger");
    document.getElementById(inputId).after(span);
    return span;
}

if (document.getElementById("formCrearEnfermero")) {

    const errNombre = crearErrorSpan("nombre");
    const errApellido = crearErrorSpan("apellido");
    const errTelefono = crearErrorSpan("telefono");
    const errCorreo = crearErrorSpan("correo");
    const errPassword = crearErrorSpan("password");

    document.getElementById("formCrearEnfermero").addEventListener("submit", async (e) => {
        e.preventDefault();

        errNombre.textContent = "";
        errApellido.textContent = "";
        errTelefono.textContent = "";
        errCorreo.textContent = "";
        errPassword.textContent = "";

        let valido = true;

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(nombre)) {
            errNombre.textContent = "Nombre mínimo 3 letras.";
            valido = false;
        }

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(apellido)) {
            errApellido.textContent = "Apellido mínimo 3 letras.";
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

        if (password.length < 6) {
            errPassword.textContent = "La contraseña debe tener mínimo 6 caracteres.";
            valido = false;
        }

        if (!valido) return;

        const data = { nombre, apellido, telefono, correo, password };

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
    const e = resp?.data;

    if (!e) {
        alert("Error cargando enfermero");
        return;
    }

    document.getElementById("nombre").value = e.nombre;
    document.getElementById("apellido").value = e.apellido;
    document.getElementById("telefono").value = e.telefono;
    document.getElementById("correo").value = e.correo;

    const errNombre = crearErrorSpan("nombre");
    const errApellido = crearErrorSpan("apellido");
    const errTelefono = crearErrorSpan("telefono");
    const errCorreo = crearErrorSpan("correo");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errNombre.textContent = "";
        errApellido.textContent = "";
        errTelefono.textContent = "";
        errCorreo.textContent = "";

        let valido = true;

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("correo").value.trim();

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(nombre)) {
            errNombre.textContent = "Nombre mínimo 3 letras.";
            valido = false;
        }

        if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,}$/.test(apellido)) {
            errApellido.textContent = "Apellido mínimo 3 letras.";
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

        if (!valido) return;

        const data = { nombre, apellido, telefono, correo };

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