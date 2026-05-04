class NotificationService {
  constructor() {
    this.permission = typeof window !== 'undefined' ? Notification.permission : 'default';
  }

  async requestPermission() {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  getPermissionStatus() {
    return typeof window !== 'undefined' ? Notification.permission : 'default';
  }

  sendNotification(title, options = {}) {
    if (typeof window !== 'undefined' && this.getPermissionStatus() === "granted") {
      try {
        return new Notification(title, {
          icon: '/logo192.png', // Fallback to a common icon name or app logo
          badge: '/logo192.png',
          ...options
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
    return null;
  }

  checkUpcomingEvents(events) {
    if (!events || !Array.isArray(events) || events.length === 0) return;

    const now = new Date();
    events.forEach(event => {
      if (!event.task_name || !event.date) return;

      const eventDate = new Date(event.date);
      // Check if event is today or tomorrow
      const diffTime = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If event is within the next 2 days
      if (diffDays >= 0 && diffDays <= 2) {
        const title = `Upcoming Task: ${event.task_name}`;
        const body = `Your ${event.crop_name || 'crop'} needs attention: ${event.task_name} is scheduled for ${new Date(event.date).toLocaleDateString()}.`;
        
        // Use a more robust ID for deduplication
        const notificationId = `agritrace_notif_${event.id || event.task_name}_${event.date}`;
        
        if (!localStorage.getItem(notificationId)) {
          this.sendNotification(title, { 
            body,
            tag: notificationId, // Prevent duplicate notifications from showing if browser supports it
            requireInteraction: false
          });
          localStorage.setItem(notificationId, new Date().toISOString());
        }
      }
    });
  }

  clearOldNotifications() {
    if (typeof window === 'undefined') return;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('agritrace_notif_')) {
        try {
          const timestamp = new Date(localStorage.getItem(key));
          if (isNaN(timestamp.getTime()) || timestamp < oneWeekAgo) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
