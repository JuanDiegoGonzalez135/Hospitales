// auth.js en /js/auth.js

export function protegerRuta() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../index.html";
        return;
    }
}

export function logout() {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
}