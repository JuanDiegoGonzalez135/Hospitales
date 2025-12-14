// dashboard-enfermero.js
import { messaging } from "./firebase.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging.js";
import { EnfermeroAPI } from "./api.js";

// Función principal para registrar el dispositivo del enfermero
async function registrarDispositivoEnfermero() {
    const idEnfermero = localStorage.getItem("id"); // debe estar guardado en login

    if (!idEnfermero) {
        console.warn("No se encontró idEnfermero en localStorage");
        return;
    }

    try {
        // Pedir permisos de notificación si no se han concedido
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Permiso de notificaciones denegado");
            return;
        }

        // Obtener el token de FCM
        const token = await getToken(messaging, {
            vapidKey: "BOwSTYEWZ4j5vzORRdbNvRbp6yW-IIvaorOOrSKhybTXCU-S9jrLxAKxeyyRm05Ae7_D7kFDbnrM1sG5aSA7uZw"
        });

        if (!token) {
            console.warn("No se pudo obtener el token de notificaciones");
            return;
        }

        console.log("Token FCM obtenido:", token);

        // Enviar token al backend
        const response = await EnfermeroAPI.registrarToken(idEnfermero, token);
        if (response && !response.error) {
            console.log("Token registrado correctamente en la base:", response);
        } else {
            console.error("Error registrando token en backend:", response);
        }

    } catch (error) {
        console.error("Error registrando dispositivo:", error);
    }
}

// Ejecutar al cargar el dashboard
registrarDispositivoEnfermero();
