

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

        Swal.fire({
            icon: "error",
            title: "Token inválido",
            text: "Tu sesión no es válida. Inicia sesión nuevamente.",
        });

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
        Swal.fire({
            icon: "warning",
            title: "Sesión requerida",
            text: "Por favor inicia sesión para continuar.",
        }).then(() => {
            window.location.href = "../../index.html";
        });
        return;
    }

    const rol = obtenerRol();
    console.log("ROL DETECTADO:", rol);

    if (!rol) {
        Swal.fire({
            icon: "error",
            title: "Error de autenticación",
            text: "No se pudo determinar tu rol. Inicia sesión de nuevo.",
        }).then(() => {
            localStorage.removeItem("token");
            window.location.href = "../../index.html";
        });
    }

    return rol;
}

// 5) Mostrar/ocultar elementos según rol
export function aplicarVistaPorRol() {
    const rol = obtenerRol();

    if (!rol) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo validar tu perfil",
        });
        return;
    }

    const adminViews = document.querySelectorAll(".view-admin");
    const nurseViews = document.querySelectorAll(".view-nurse");
    const patientViews = document.querySelectorAll(".view-patient");

    // Ocultar todo
    adminViews.forEach(el => el.style.display = "none");
    nurseViews.forEach(el => el.style.display = "none");
    patientViews.forEach(el => el.style.display = "none");

    // Mostrar según rol
    if (rol === "ADMIN") adminViews.forEach(el => el.style.display = "block");
    if (rol === "ENFERMERO") nurseViews.forEach(el => el.style.display = "block");
    if (rol === "PACIENTE") patientViews.forEach(el => el.style.display = "block");
}

// 6) Cerrar sesión
export function logout() {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Tu sesión actual se cerrará.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("token");
            Swal.fire({
                icon: "success",
                title: "Sesión cerrada",
                timer: 1200,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "/index.html";
            });
        }
    });
}