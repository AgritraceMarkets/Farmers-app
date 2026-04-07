// Notification Service - Handles browser push notifications

class NotificationService {
  constructor() {
    this.permission = false;
    this.registration = null;
  }

  // Check if browser supports notifications
  isSupported() {
    return "Notification" in window;
  }

  // Get current permission status
  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Request permission from user
  async requestPermission() {
    if (!this.isSupported()) {
      console.log("This browser does not support notifications");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission === "granted";
      
      if (this.permission) {
        console.log("Notification permission granted");
        // Show a welcome notification
        this.showNotification(
          "✅ Notifications Enabled",
          "You will now receive reminders for your farming tasks!",
          "/icon.png",
          false
        );
      } else if (permission === "denied") {
        console.log("Notification permission denied");
      }
      
      return this.permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  // Show a simple notification
  showNotification(title, body, icon = "/icon.png", requireInteraction = true) {
    if (!this.isSupported()) {
      console.log("Notifications not supported");
      return;
    }

    if (Notification.permission !== "granted") {
      console.log("Notifications not permitted. Current status:", Notification.permission);
      return;
    }

    try {
      const notification = new Notification(title, {
        body: body,
        icon: icon,
        badge: "/badge.png",
        vibrate: [200, 100, 200],
        requireInteraction: requireInteraction,
        tag: "agritrace-task",
        renotify: true,
        silent: false
      });

      // Handle notification click
      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
      
      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  // Show notification for upcoming events
  showUpcomingTask(task) {
    const daysRemaining = task.days_remaining;
    let urgency = "";
    let icon = "/icon.png";
    
    if (daysRemaining <= 1) {
      urgency = "⚠️ URGENT: ";
      icon = "/urgent-icon.png";
    } else if (daysRemaining <= 2) {
      urgency = "🔔 REMINDER: ";
      icon = "/reminder-icon.png";
    } else {
      urgency = "📅 Coming up: ";
    }
    
    const title = `${urgency}${task.stage_name}`;
    const body = `${task.crop_name} needs ${task.stage_name.toLowerCase()} in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}!`;
    
    this.showNotification(title, body, icon, true);
  }

  // Check for upcoming events and send notifications
  checkUpcomingEvents(events) {
    if (!this.isSupported()) return;
    if (Notification.permission !== "granted") {
      console.log("Notifications not permitted");
      return;
    }
    
    if (!events || events.length === 0) {
      console.log("No upcoming events");
      return;
    }
    
    // Get already shown notifications from localStorage
    const shownNotifications = JSON.parse(localStorage.getItem("agritrace_notifications") || "{}");
    const today = new Date().toDateString();
    
    events.forEach(event => {
      const notificationKey = `${event.planting_id}_${event.stage_name}`;
      
      // Check if we've shown this notification today
      if (!shownNotifications[notificationKey] || shownNotifications[notificationKey] !== today) {
        // Send notification for events within 3 days
        if (event.days_remaining <= 3 && event.days_remaining >= 0) {
          this.showUpcomingTask(event);
          
          // Mark as shown
          shownNotifications[notificationKey] = today;
          localStorage.setItem("agritrace_notifications", JSON.stringify(shownNotifications));
        }
      }
    });
  }

  // Clear old notifications from localStorage (keep last 7 days)
  clearOldNotifications() {
    const shownNotifications = JSON.parse(localStorage.getItem("agritrace_notifications") || "{}");
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let changed = false;
    Object.keys(shownNotifications).forEach(key => {
      const date = new Date(shownNotifications[key]);
      if (date < oneWeekAgo) {
        delete shownNotifications[key];
        changed = true;
      }
    });
    
    if (changed) {
      localStorage.setItem("agritrace_notifications", JSON.stringify(shownNotifications));
    }
  }

  // Test notification
  testNotification() {
    if (!this.isSupported()) {
      alert("Your browser does not support notifications");
      return false;
    }
    
    if (Notification.permission !== "granted") {
      alert("Please enable notifications first. Click the 'Enable Notifications' button.");
      return false;
    }
    
    this.showNotification(
      "🔔 Test Notification",
      "If you can see this, notifications are working perfectly!",
      "/icon.png",
      false
    );
    return true;
  }
}

export default new NotificationService();