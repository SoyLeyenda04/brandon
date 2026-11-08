// firebase-messaging-sw.js
// ⚠️ DEBE estar en la RAÍZ del dominio: https://tudominio.com/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCx75EIrWrRym40d3Ntjy8d_PjDy5V5Gp8",
  authDomain: "chat-online-f6753.firebaseapp.com",
  databaseURL: "https://chat-online-f6753-default-rtdb.firebaseio.com",
  projectId: "chat-online-f6753",
  storageBucket: "chat-online-f6753.appspot.com",
  messagingSenderId: "106228514889",
  appId: "1:106228514889:web:9dcfe5153d63eb55325a0c"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ==================== NOTIFICACIONES EN BACKGROUND ====================
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notificación en background:', payload);

  const title = (payload.notification && payload.notification.title)
    || (payload.data && payload.data.title)
    || 'Babilonia777';

  const body = (payload.notification && payload.notification.body)
    || (payload.data && payload.data.body)
    || 'Nuevo mensaje';

  const notificationOptions = {
    body: body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💬</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💬</text></svg>',
    data: payload.data || {},
    tag: 'chat-message',
    renotify: true
  };

  self.registration.showNotification(title, notificationOptions);
});

// ==================== CLICK EN LA NOTIFICACIÓN ====================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});