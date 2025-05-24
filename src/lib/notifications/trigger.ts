'use server';

import { addNotification } from '@/app/api/notifications/helper';
import { getServerSession } from 'next-auth';
import { authConfig as authOptions } from '@/app/api/auth/[...nextauth]/route';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

/**
 * Trigger a new system notification
 * 
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type (success, info, warning, error)
 * @param userId - Optional user ID to target a specific user (if not provided, notification is system-wide)
 * @returns The created notification or null if creation failed
 */
export async function triggerNotification(
  title: string,
  message: string,
  type: NotificationType = 'info',
  userId?: string
) {
  try {
    // Create the notification
    const notification = await addNotification({
      title,
      message,
      type,
      userId,
      read: false
    });
    
    return notification;
  } catch (error) {
    console.error('Error triggering notification:', error);
    return null;
  }
}

/**
 * Trigger a notification for the current user
 * 
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type (success, info, warning, error)
 * @returns The created notification or null if creation failed
 */
export async function triggerUserNotification(
  title: string,
  message: string,
  type: NotificationType = 'info'
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error('No authenticated user found');
    }
    
    return triggerNotification(title, message, type, session.user.email);
  } catch (error) {
    console.error('Error triggering user notification:', error);
    return null;
  }
}

/**
 * Trigger a content update notification
 * 
 * @param contentType - Type of content that was updated (e.g., 'page', 'post', 'media')
 * @param contentName - Name of the content item
 * @param action - Action performed (e.g., 'created', 'updated', 'deleted')
 * @returns The created notification or null if creation failed
 */
export async function triggerContentNotification(
  contentType: string,
  contentName: string,
  action: 'created' | 'updated' | 'deleted'
) {
  const title = `Content ${action.charAt(0).toUpperCase() + action.slice(1)}`;
  const message = `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} "${contentName}" has been ${action}`;
  const type: NotificationType = action === 'deleted' ? 'warning' : 'success';
  
  return triggerNotification(title, message, type);
}

/**
 * Trigger a system notification for all users
 * 
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type (success, info, warning, error)
 * @returns The created notification or null if creation failed
 */
export async function triggerSystemNotification(
  title: string,
  message: string,
  type: NotificationType = 'info'
) {
  return triggerNotification(title, message, type);
}

/**
 * Trigger a security notification
 * 
 * @param action - Security action (e.g., 'login', 'password_change', 'permission_change')
 * @param details - Additional details about the action
 * @param userId - Optional user ID to target a specific user
 * @returns The created notification or null if creation failed
 */
export async function triggerSecurityNotification(
  action: string,
  details: string,
  userId?: string
) {
  const title = `Security Alert: ${action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')}`;
  const message = details;
  const type: NotificationType = 'warning';
  
  return triggerNotification(title, message, type, userId);
}