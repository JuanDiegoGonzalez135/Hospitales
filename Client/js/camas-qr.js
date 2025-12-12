import { IslaAPI } from "./api.js";
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registrado:', reg))
    .catch(err => console.error('Error al registrar el SW:', err));
}
// --- Leer ID de cama desde la URL ---
const params = new URLSearchParams(window.location.search);
const camaId = params.get("id");

const canvas = document.getElementById("qrCanvas");
const estadoCama = document.getElementById("estadoCama");
const btnDescargar = document.getElementById("btnDescargarQR");

async function cargarQR() {
    if (!camaId) {
        alert("No se recibió ID de la cama");
        return;
    }

    // ----- 1. Obtener QR desde API -----
    const respQR = await IslaAPI.generarQR(camaId);

    if (respQR.error) {
        alert("Error al generar QR");
        return;
    }

    const base64 = respQR.data.base64;

    // ----- 2. Dibujar QR en canvas -----
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
    };

    // ----- 3. Consultar estado de la cama -----
    const respCama = await IslaAPI.getCama(camaId);

    if (respCama.error) {
        estadoCama.textContent = "Error obteniendo información";
        return;
    }

    const cama = respCama.data;

    if (cama.paciente) {
        estadoCama.textContent = `Estado: Ocupada por ${cama.paciente.nombre} ${cama.paciente.apellido}`;
    } else {
        estadoCama.textContent = "Estado: Libre";
    }
}

// ----- DESCARGAR QR -----
btnDescargar.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `cama_${camaId}_qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
});

// Ejecutar al cargar
cargarQR();
