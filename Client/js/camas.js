import { IslaAPI } from "./api.js";

async function cargarCamas() {
    const tabla = document.getElementById("tablaCamas");
    if (!tabla) return;

    const resp = await IslaAPI.getCamas();
    const camas = resp?.data || [];

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

function validarCampos(codigo, numero, habitacion, errCodigo, errNumero, errHabitacion) {
    let valido = true;

    errCodigo.textContent = "";
    errNumero.textContent = "";
    errHabitacion.textContent = "";

    if (!/^[a-zA-Z0-9]{3,}$/.test(codigo)) {
        errCodigo.textContent = "El código debe tener mínimo 3 caracteres alfanuméricos.";
        valido = false;
    }

    if (!/^[0-9]+$/.test(numero) || parseInt(numero) < 1) {
        errNumero.textContent = "El número debe ser un entero mayor o igual a 1.";
        valido = false;
    }

    if (!habitacion) {
        errHabitacion.textContent = "Selecciona una habitación válida.";
        valido = false;
    }

    return valido;
}

if (document.getElementById("formCrearCama")) {

    cargarHabitacionesEnSelect();

    const form = document.getElementById("formCrearCama");

    const errCodigo = document.createElement("small");
    const errNumero = document.createElement("small");
    const errHabitacion = document.createElement("small");

    errCodigo.classList.add("text-danger");
    errNumero.classList.add("text-danger");
    errHabitacion.classList.add("text-danger");

    document.getElementById("codigo").after(errCodigo);
    document.getElementById("numero").after(errNumero);
    document.getElementById("habitacion").after(errHabitacion);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const codigo = document.getElementById("codigo").value.trim();
        const numero = document.getElementById("numero").value.trim();
        const habitacion = document.getElementById("habitacion").value;

        if (!validarCampos(codigo, numero, habitacion, errCodigo, errNumero, errHabitacion)) return;

        await IslaAPI.createCama({
            codigo,
            numero,
            habitacion: { id: habitacion }
        });

        window.location.href = "lista.html";
    });
}

async function cargarCamaEditar() {
    const form = document.getElementById("formEditarCama");
    if (!form) return;

    await cargarHabitacionesEnSelect();

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

    const errCodigo = document.createElement("small");
    const errNumero = document.createElement("small");
    const errHabitacion = document.createElement("small");

    errCodigo.classList.add("text-danger");
    errNumero.classList.add("text-danger");
    errHabitacion.classList.add("text-danger");

    document.getElementById("codigo").after(errCodigo);
    document.getElementById("numero").after(errNumero);
    document.getElementById("habitacion").after(errHabitacion);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errCodigo.textContent = "";
        errNumero.textContent = "";
        errHabitacion.textContent = "";

        let valido = true;

        const codigo = document.getElementById("codigo").value.trim();
        const numero = document.getElementById("numero").value.trim();
        const habitacion = document.getElementById("habitacion").value;

        if (!/^[a-zA-Z0-9]{3,}$/.test(codigo)) {
            errCodigo.textContent = "El código debe tener mínimo 3 caracteres y solo letras/números.";
            valido = false;
        }

        if (!/^[0-9]+$/.test(numero) || parseInt(numero) < 1) {
            errNumero.textContent = "El número debe ser mayor o igual a 1.";
            valido = false;
        }

        if (!habitacion) {
            errHabitacion.textContent = "Selecciona una habitación válida.";
            valido = false;
        }

        if (!valido) return;

        const data = {
            codigo,
            numero,
            habitacion: { id: habitacion }
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

window.eliminarCama = eliminarCama;

cargarCamas();
cargarCamaEditar();