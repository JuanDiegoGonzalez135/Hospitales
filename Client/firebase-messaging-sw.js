// /firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBAWTKgfSNUEQKYVAdbFod4R40IBsBilmI",
  authDomain: "hospital-isla.firebaseapp.com",
  projectId: "hospital-isla",
  storageBucket: "hospital-isla.firebasestorage.app",
  messagingSenderId: "663019128300",
  appId: "1:663019128300:web:aeefbdb8a3239ec3d7ecc9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const title = payload.notification?.title || 'Solicitud de ayuda';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png'
  };
  self.registration.showNotification(title, options);
});
