// Service Worker for push notifications
self.addEventListener("push", (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: "/badge.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
      plantingId: data.plantingId
    },
    actions: [
      {
        action: "view",
        title: "View Details"
      },
      {
        action: "dismiss",
        title: "Dismiss"
      }
    ],
    requireInteraction: true,
    tag: "agritrace-task"
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.action === "view") {
    const url = event.notification.data?.url || "/";
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  event.waitUntil(self.skipWaiting());
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim());
});