import { AuthAPI } from "./api.js";

function decodeJWT(token) {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    const resp = await AuthAPI.login(correo, password);

    if (resp.error || !resp.data) {
        alert("Credenciales incorrectas");
        return;
    }

    const token = resp.data;
    const payload = decodeJWT(token);

    localStorage.setItem("token", token);
    localStorage.setItem("rol", payload.role);  // ADMIN, ENFERMERO, PACIENTE
    localStorage.setItem("correo", payload.sub);

    // Redirigir según el rol
    switch (payload.role) {
        case "ADMIN":
            window.location.href = "../views/admin/dashboard.html";
            break;
        case "ENFERMERO":
            window.location.href = "../views/enfermero/dashboard.html";
            break;
        case "PACIENTE":
            window.location.href = "../views/paciente/dashboard.html";
            break;
        default:
            alert("Rol no permitido");
            break;
    }
});