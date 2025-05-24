// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig as authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  getNotifications, 
  addNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  Notification
} from './helper';

// GET /api/notifications - Get all notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get notifications for the current user
    const userId = session.user?.email;
    const notifications = await getNotifications(userId);

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Notifications API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Add a new notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users to create notifications
    // Temporarily commented out for development - uncomment in production
    // if (session.user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const body = await request.json();
    const { title, message, type, userId } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, type' },
        { status: 400 }
      );
    }

    const notification = await addNotification({
      title,
      message,
      type,
      userId,
      read: false
    });

    if (notification) {
      return NextResponse.json({
        message: 'Notification created successfully',
        notification
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notification Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/:id - Mark a notification as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id && action !== 'markAllRead') {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      );
    }

    let success = false;

    if (action === 'markAllRead') {
      // Mark all notifications as read for the current user
      const userId = session.user?.email;
      success = await markAllNotificationsAsRead(userId);
    } else {
      // Mark a single notification as read
      success = await markNotificationAsRead(id as string);
    }

    if (success) {
      return NextResponse.json({
        message: action === 'markAllRead' 
          ? 'All notifications marked as read' 
          : 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notification Update Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/:id - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id && action !== 'deleteAll') {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      );
    }

    let success = false;

    if (action === 'deleteAll') {
      // Delete all notifications for the current user
      const userId = session.user?.email;
      success = await deleteAllNotifications(userId);
    } else {
      // Delete a single notification
      success = await deleteNotification(id as string);
    }

    if (success) {
      return NextResponse.json({
        message: action === 'deleteAll' 
          ? 'All notifications deleted' 
          : 'Notification deleted'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notification Deletion Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}