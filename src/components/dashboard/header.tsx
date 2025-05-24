// components/dashboard/header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Search, User, Settings, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface DashboardHeaderProps {
    sidebarCollapsed: boolean;
}

export default function DashboardHeader({ sidebarCollapsed }: DashboardHeaderProps) {
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const notifications = [
        {
            id: 1,
            title: 'Content Updated',
            message: 'Home page content has been successfully updated',
            time: '5 minutes ago',
            read: false,
            type: 'success'
        },
        {
            id: 2,
            title: 'New Image Uploaded',
            message: 'Team photo added to media library',
            time: '1 hour ago',
            read: false,
            type: 'info'
        },
        {
            id: 3,
            title: 'SEO Optimization',
            message: 'Meta tags updated for better search visibility',
            time: '2 hours ago',
            read: true,
            type: 'success'
        },
        {
            id: 4,
            title: 'System Backup',
            message: 'Daily backup completed successfully',
            time: '6 hours ago',
            read: true,
            type: 'info'
        }
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

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
                                                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
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
                                                            notification.type === 'success'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {notification.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 border-t border-gray-200 text-center">
                                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        View all notifications
                                    </button>
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