const CACHE_NAME = "trivia-master-v1";
const STATIC_ASSETS = ["/", "/play", "/categories", "/stats", "/settings"];

// Install: cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle streak reminder messages from the app
self.addEventListener("message", (event) => {
  if (event.data?.type === "SCHEDULE_REMINDER") {
    // Store the reminder time
    self.reminderTime = event.data.time;
  }
});

// Periodic notification check (runs when the browser wakes the SW)
function checkAndNotify() {
  const now = new Date();
  const time = self.reminderTime || "09:00";
  const [hours, minutes] = time.split(":").map(Number);

  if (now.getHours() === hours && now.getMinutes() >= minutes && now.getMinutes() < minutes + 5) {
    // Check if we already notified today
    const today = now.toISOString().split("T")[0];
    if (self.lastNotifiedDate !== today) {
      self.lastNotifiedDate = today;
      self.registration.showNotification("Trivia Master", {
        body: "Don't break your streak! Time for today's trivia session.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "streak-reminder",
        renotify: true,
        actions: [{ action: "play", title: "Play Now" }],
      });
    }
  }
}

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].navigate("/play");
      } else {
        self.clients.openWindow("/play");
      }
    })
  );
});
