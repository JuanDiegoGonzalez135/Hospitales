import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { EnfermeroAPI } from "./api.js";

const messaging = getMessaging();

export async function requestPermissionAndRegister(idEnfermero) {
    try {
        // Pedir permiso al navegador
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Permiso denegado");

        // Obtener token FCM
        const token = await getToken(messaging, {
            vapidKey: "BFb2NoKUv1uYm5eEXX4o4CwRtucYeIw14q6F_0mTqfkPCkZn4vW0bQ6n_u9JonV6YB4lcFRUAt-Y2PCw7w1LSwU"
        });
        if (!token) throw new Error("No se pudo obtener el token FCM");

        // Registrar el token en backend
        await EnfermeroAPI.registrarToken(idEnfermero, token);
        console.log("Token registrado correctamente:", token);

        // Escuchar notificaciones mientras la app está abierta
        onMessage(messaging, (payload) => {
            console.log("Notificación recibida:", payload);

            const notifContainer = document.getElementById("listaNotificaciones");
            const notifVacias = document.getElementById("notificacionesVacias");
            if (!notifContainer || !notifVacias) return;

            notifVacias.style.display = "none";

            const idNotif = Date.now();
            const div = document.createElement("div");
            div.className = "alert alert-danger d-flex justify-content-between align-items-center";
            div.setAttribute("role", "alert");
            div.id = `notif-${idNotif}`;

            div.innerHTML = `
                <div>
                    <strong>¡ALERTA!</strong> ${payload.notification?.title || "Paciente solicita ayuda"}<br>
                    ${payload.notification?.body || ""}
                    <p class="mb-0"><small>${new Date().toLocaleTimeString()}</small></p>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="window.marcarComoAtendida(${idNotif})">Marcar como atendida</button>
            `;

            notifContainer.appendChild(div);
        });

    } catch (err) {
        console.error("Error al registrar notificaciones:", err);
    }
}