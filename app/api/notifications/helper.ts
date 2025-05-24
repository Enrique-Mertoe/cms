'use server';

import { readSystemFile, writeSystemFile } from "@/src/lib/config/file-manager";
import { v4 as uuidv4 } from 'uuid';

// Notification types
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
  userId?: string; // Optional: to support user-specific notifications
}

// Get all notifications
export async function getNotifications(userId?: string) {
  try {
    const data = await readSystemFile('notifications.toml');
    
    if (!data || !data.notifications || !Array.isArray(data.notifications)) {
      return [];
    }
    
    // If userId is provided, filter notifications for that user
    if (userId) {
      return data.notifications.filter((notification: Notification) => 
        !notification.userId || notification.userId === userId
      );
    }
    
    return data.notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Add a new notification
export async function addNotification(notification: Omit<Notification, 'id' | 'time'>) {
  try {
    const data = await readSystemFile('notifications.toml');
    const notifications = data.notifications || [];
    
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      time: new Date().toISOString(),
      read: false
    };
    
    const updatedData = {
      ...data,
      notifications: [newNotification, ...notifications]
    };
    
    const success = await writeSystemFile('notifications.toml', updatedData);
    
    if (success) {
      return newNotification;
    }
    return null;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(id: string) {
  try {
    const data = await readSystemFile('notifications.toml');
    
    if (!data || !data.notifications || !Array.isArray(data.notifications)) {
      return false;
    }
    
    const notifications = data.notifications.map((notification: Notification) => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    const updatedData = {
      ...data,
      notifications
    };
    
    return await writeSystemFile('notifications.toml', updatedData);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId?: string) {
  try {
    const data = await readSystemFile('notifications.toml');
    
    if (!data || !data.notifications || !Array.isArray(data.notifications)) {
      return false;
    }
    
    const notifications = data.notifications.map((notification: Notification) => {
      // If userId is provided, only mark notifications for that user
      if (!userId || !notification.userId || notification.userId === userId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    const updatedData = {
      ...data,
      notifications
    };
    
    return await writeSystemFile('notifications.toml', updatedData);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

// Delete a notification
export async function deleteNotification(id: string) {
  try {
    const data = await readSystemFile('notifications.toml');
    
    if (!data || !data.notifications || !Array.isArray(data.notifications)) {
      return false;
    }
    
    const notifications = data.notifications.filter(
      (notification: Notification) => notification.id !== id
    );
    
    const updatedData = {
      ...data,
      notifications
    };
    
    return await writeSystemFile('notifications.toml', updatedData);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

// Delete all notifications
export async function deleteAllNotifications(userId?: string) {
  try {
    const data = await readSystemFile('notifications.toml');
    
    if (!data || !data.notifications) {
      return false;
    }
    
    let notifications = [];
    
    // If userId is provided, only delete notifications for that user
    if (userId) {
      notifications = data.notifications.filter(
        (notification: Notification) => notification.userId && notification.userId !== userId
      );
    }
    
    const updatedData = {
      ...data,
      notifications
    };
    
    return await writeSystemFile('notifications.toml', updatedData);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return false;
  }
}