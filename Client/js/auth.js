// ============================
// auth.js
// ============================

// 1) Obtener token
export function getToken() {
    return localStorage.getItem("token");
}

// 2) Decodificar token (SIN librerías externas)
function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (e) {
        console.error("Error al decodificar token:", e);
        return null;
    }
}

// 3) Extraer rol del token
export function obtenerRol() {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeToken(token);
    return decoded?.role || null;
}

// 4) Proteger rutas (si no hay token, regresar a login)
export function protegerRuta() {
    const token = getToken();

    if (!token) {
        window.location.href = "../../index.html";
        return;
    }

    const rol = obtenerRol();
    console.log("ROL DETECTADO:", rol);

    return rol;
}

// 5) Mostrar/ocultar elementos según rol
export function aplicarVistaPorRol() {
    const rol = obtenerRol();

    if (!rol) return;

    // Ejemplo de elementos
    const adminViews = document.querySelectorAll(".view-admin");
    const nurseViews = document.querySelectorAll(".view-nurse");
    const patientViews = document.querySelectorAll(".view-patient");

    // Ocultar todo
    adminViews.forEach(el => el.style.display = "none");
    nurseViews.forEach(el => el.style.display = "none");
    patientViews.forEach(el => el.style.display = "none");

    // Mostrar solo lo que toca
    if (rol === "ADMIN") adminViews.forEach(el => el.style.display = "block");
    if (rol === "ENFERMERO") nurseViews.forEach(el => el.style.display = "block");
    if (rol === "PACIENTE") patientViews.forEach(el => el.style.display = "block");
}

// 6) Cerrar sesión
export function logout() {
    localStorage.removeItem("token");
    window.location.href = "../../index.html";
}