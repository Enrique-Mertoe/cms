// components/dashboard/header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Search, User, Settings, LogOut, Menu, Sun, Moon, Trash2, Check, ExternalLink } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

// Notification type from API
interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'success' | 'info' | 'warning' | 'error';
    userId?: string;
}

interface DashboardHeaderProps {
    sidebarCollapsed: boolean;
}

export default function DashboardHeader({ sidebarCollapsed }: DashboardHeaderProps) {
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/notifications');

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications?id=${id}`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            // Update local state
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === id 
                        ? { ...notification, read: true } 
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications?action=markAllRead', {
                method: 'PATCH',
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            // Update local state
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (id: string, event: React.MouseEvent) => {
        // Prevent the notification click event from firing
        event.stopPropagation();

        try {
            const response = await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Update local state
            const updatedNotifications = notifications.filter(n => n.id !== id);
            setNotifications(updatedNotifications);
            setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Format relative time
    const formatRelativeTime = (isoTime: string) => {
        const date = new Date(isoTime);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

        return date.toLocaleDateString();
    };

    // Fetch notifications when component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdropFilter backdrop-blur-lg border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                {/* Left side - Search */}
                <div className="flex items-center flex-1 max-w-lg">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search content, pages, media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center space-x-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        title="Toggle dark mode"
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowUserMenu(false);
                            }}
                            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">{unreadCount} unread</span>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-gray-500">
                                            Loading notifications...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => !notification.read && markAsRead(notification.id)}
                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                    !notification.read ? 'bg-blue-50/50' : ''
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                                        !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {notification.title}
                                                            </p>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                notification.type === 'success' ? 'bg-green-100 text-green-700' :
                                                                notification.type === 'info' ? 'bg-blue-100 text-blue-700' :
                                                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                                {notification.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <p className="text-xs text-gray-500">
                                                                {formatRelativeTime(notification.time)}
                                                            </p>
                                                            <button 
                                                                onClick={(e) => deleteNotification(notification.id, e)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Delete notification"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-3 border-t border-gray-200 text-center">
                                    <Link 
                                        href="/dashboard/notifications" 
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
                                    >
                                        View all notifications
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => {
                                setShowUserMenu(!showUserMenu);
                                setShowNotifications(false);
                            }}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white font-medium text-sm">
                                    {session?.user?.name ? getInitials(session.user.name) : 'U'}
                                </span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                    {session?.user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize truncate max-w-32">
                                    {
                                        //@ts-ignore
                                        session?.user?.role?.replace('_', ' ') || 'Content Manager'
                                    }
                                </p>
                            </div>
                        </button>

                        {/* User Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium">
                                                {session?.user?.name ? getInitials(session.user.name) : 'U'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {session?.user?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {session?.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <User className="w-4 h-4 mr-3 text-gray-500" />
                                        Profile Settings
                                    </button>
                                    <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                                        Preferences
                                    </button>
                                </div>

                                <div className="border-t border-gray-200 py-2">
                                    <button
                                        onClick={() => signOut()}
                                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
