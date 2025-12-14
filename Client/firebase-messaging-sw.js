importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCLeB8IF-NQRZesoKQga_HE6SPx-jzbaO0",
    authDomain: "pwa-10b-20223tn127.firebaseapp.com",
    projectId: "pwa-10b-20223tn127",
    storageBucket: "pwa-10b-20223tn127.firebasestorage.app",
    messagingSenderId: "316679629697",
    appId: "1:316679629697:web:2d691dd2be862813f39680"
});
const messaging = firebase.messaging();

// Notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icon.png"
    });
});
