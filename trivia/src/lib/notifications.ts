export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function scheduleStreakReminder(time: string): void {
  if (!("serviceWorker" in navigator)) return;

  // Store the reminder time for the service worker to use
  localStorage.setItem("streakReminderTime", time);

  // Register a periodic check via the service worker
  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: "SCHEDULE_REMINDER",
      time,
    });
  });
}

export function showNotification(
  title: string,
  body: string,
  icon?: string
): void {
  if (Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: icon ?? "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "trivia-reminder",
      });
    });
  }
}
