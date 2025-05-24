// components/dashboard/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Image,
    Search,
    Palette,
    Settings,
    Users,
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Content', href: '/dashboard/content', icon: FileText },
    { name: 'Media', href: '/dashboard/media', icon: Image },
    { name: 'SEO', href: '/dashboard/seo', icon: Search },
    { name: 'Theme', href: '/dashboard/theme', icon: Palette },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System', href: '/admin/system', icon: Settings },
];

interface DashboardSidebarProps {
    collapsed: boolean;
    onToggle: (collapsed: boolean) => void;
    isMobile: boolean;
}

export default function DashboardSidebar({
                                             collapsed,
                                             onToggle,
                                             isMobile
                                         }: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-50  p-3 shadow-xl border-r border-gray-200 transition-all duration-300 ${
                collapsed ? 'w-[6rem]' : 'w-[250px]'
            } ${isMobile && collapsed ? '-translate-x-full' : 'translate-x-0'}`}>

                <div className="flex h-full flex-col">
                    {/* Logo Section */}
                    <div className="flex h-16 items-center rounded-md justify-between px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                        {!collapsed && (
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-white font-bold text-sm">CMS</span>
                                </div>
                                <span className="ml-3 text-lg font-semibold text-white">Dashboard</span>
                            </div>
                        )}

                        <button
                            onClick={() => onToggle(!collapsed)}
                            className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors text-white"
                        >
                            {isMobile ? (
                                collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />
                            ) : (
                                collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                        {/* Main Navigation */}
                        <div className="space-y-1">
                            {!collapsed && (
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Main Menu
                                </p>
                            )}
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                                        }`}
                                        title={collapsed ? item.name : undefined}
                                    >
                                        <item.icon className={`flex-shrink-0 w-5 h-5 ${
                                            collapsed ? 'mx-auto' : 'mr-3'
                                        } ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                                        {!collapsed && (
                                            <span className="truncate">{item.name}</span>
                                        )}
                                        {!collapsed && isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Admin Section */}
                        <div className="pt-6 mt-6 border-t border-gray-200">
                            {!collapsed && (
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Administration
                                </p>
                            )}
                            <div className="space-y-1">
                                {adminNavigation.map((item) => {
                                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-purple-50 text-purple-700 shadow-sm border-l-4 border-purple-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                                            }`}
                                            title={collapsed ? item.name : undefined}
                                        >
                                            <item.icon className={`flex-shrink-0 w-5 h-5 ${
                                                collapsed ? 'mx-auto' : 'mr-3'
                                            } ${isActive ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                                            {!collapsed && (
                                                <span className="truncate">{item.name}</span>
                                            )}
                                            {!collapsed && isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>

                    {/* User Actions */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <button
                            onClick={() => signOut()}
                            className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
                                collapsed ? 'justify-center' : ''
                            }`}
                            title={collapsed ? 'Sign Out' : undefined}
                        >
                            <LogOut className={`w-5 h-5 ${
                                collapsed ? '' : 'mr-3'
                            } text-gray-500 group-hover:text-red-500 transition-colors`} />
                            {!collapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
