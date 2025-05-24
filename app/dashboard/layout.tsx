// app/dashboard/layout.tsx
'use client';

import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardSidebar from '@/src/components/dashboard/sidebar';
import DashboardHeader from '@/src/components/dashboard/header';
import React, { useState, useEffect } from "react";
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        redirect('/auth/signin');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden">
            <DashboardSidebar
                collapsed={sidebarCollapsed}
                onToggle={setSidebarCollapsed}
                isMobile={isMobile}
            />

            <div className={`transition-all duration-300 ${
                isMobile ? 'lg:pl-0' : sidebarCollapsed ? 'lg:pl-[6rem]' : 'lg:pl-[250px]'
            }`}>
                <DashboardHeader sidebarCollapsed={sidebarCollapsed} />

                <main className="relative">
                    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile backdrop */}
            {isMobile && !sidebarCollapsed && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
        </div>
    );
}