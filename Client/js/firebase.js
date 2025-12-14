// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLeB8IF-NQRZesoKQga_HE6SPx-jzbaO0",
  authDomain: "pwa-10b-20223tn127.firebaseapp.com",
  projectId: "pwa-10b-20223tn127",
  storageBucket: "pwa-10b-20223tn127.firebasestorage.app",
  messagingSenderId: "316679629697",
  appId: "1:316679629697:web:2d691dd2be862813f39680"
};

// Inicializar app Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicio de mensajería
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
