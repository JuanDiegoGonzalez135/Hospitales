import { EnfermeroAPI } from "./api.js";


async function cargarEnfermeros() {
    const tabla = document.getElementById("tablaEnfermeros");
    if (!tabla) return;

    const respuesta = await EnfermeroAPI.getAll();

    if (respuesta.error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los enfermeros."
        });
        return;
    }

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
                <a class="btn btn-warning btn-sm me-2" href="editar.html?id=${e.id}">Editar</a>
                <button class="btn btn-danger btn-sm me-2" onclick="eliminarEnfermero(${e.id})">Eliminar</button>
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
        const resp = await EnfermeroAPI.create(data);

        if (resp.error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: resp.mensaje || "No se pudo crear el enfermero."
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Enfermero creado",
            timer: 1200,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "lista.html";
        });
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
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cargar el enfermero."
        });
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

    form.addEventListener("submit", async (ev) => {
        ev.preventDefault();

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
        const updateResp = await EnfermeroAPI.update(id, data);

        if (updateResp.error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: updateResp.mensaje || "No se pudo actualizar."
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Enfermero actualizado",
            timer: 1200,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "lista.html";
        });
    });
}

async function eliminarEnfermero(id) {
    const confirm = await Swal.fire({
        title: "¿Eliminar enfermero?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    const resp = await EnfermeroAPI.delete(id);

    if (resp.error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: resp.mensaje || "No se pudo eliminar el enfermero."
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Enfermero eliminado",
        timer: 1000,
        showConfirmButton: false
    }).then(() => location.reload());
}

cargarEnfermeros();
cargarEnfermeroEditar();
window.eliminarEnfermero = eliminarEnfermero;