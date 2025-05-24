// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import StatsCard from '@/src/components/dashboard/stats-card';
import SearchPreview from '@/src/components/dashboard/search-preview';
import {
    FileText,
    Image,
    Settings,
    Eye,
    Calendar,
    TrendingUp,
    Users,
    Globe,
    ArrowUpRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Zap
} from 'lucide-react';
import Link from 'next/link';

// Mock function to get stats - replace with your actual data fetching
async function getStats() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
        totalPages: 8,
        totalImages: 24,
        lastUpdate: new Date().toISOString(),
        siteViews: 1250,
        activeSessions: 3,
        contentSections: 12,
        totalUsers: 156,
        bounceRate: 32.5,
        avgSessionDuration: '3m 24s'
    };
}

export default async function DashboardPage() {
    const session = await getServerSession();
    const stats = await getStats();

    const quickActions = [
        {
            title: 'Edit Home Page',
            description: 'Update hero section and content',
            href: '/dashboard/content/home',
            icon: FileText,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        },
        {
            title: 'Manage Media',
            description: 'Upload and organize images',
            href: '/dashboard/media',
            icon: Image,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            title: 'SEO Settings',
            description: 'Optimize site for search engines',
            href: '/dashboard/seo',
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
        },
        {
            title: 'Theme Customization',
            description: 'Customize colors and fonts',
            href: '/dashboard/theme',
            icon: Settings,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-700'
        }
    ];

    const recentActivity = [
        {
            action: 'Updated About page content',
            time: '2 hours ago',
            user: session?.user?.name || 'You',
            type: 'update',
            icon: FileText
        },
        {
            action: 'Uploaded new team photos',
            time: '1 day ago',
            user: session?.user?.name || 'You',
            type: 'upload',
            icon: Image
        },
        {
            action: 'Modified theme colors',
            time: '3 days ago',
            user: session?.user?.name || 'You',
            type: 'theme',
            icon: Settings
        },
        {
            action: 'Updated SEO meta tags',
            time: '1 week ago',
            user: session?.user?.name || 'You',
            type: 'seo',
            icon: TrendingUp
        }
    ];

    const contentPages = [
        { name: 'Home Page', status: 'Published', updated: '2 hours ago', sections: 4, views: 850 },
        { name: 'About Page', status: 'Published', updated: '1 day ago', sections: 3, views: 324 },
        { name: 'Services', status: 'Draft', updated: '3 days ago', sections: 5, views: 0 },
        { name: 'Contact Page', status: 'Published', updated: '1 week ago', sections: 2, views: 156 },
        { name: 'Testimonials', status: 'Published', updated: '2 weeks ago', sections: 1, views: 89 },
        { name: 'Team Section', status: 'Published', updated: '1 month ago', sections: 1, views: 67 }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Here's what's happening with your website today.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview Site
                        </Link>
                        <Link
                            href="/dashboard/content"
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Quick Edit
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Pages</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPages}</p>
                            <p className="text-sm text-green-600 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +2 this month
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Media Files</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalImages}</p>
                            <p className="text-sm text-green-600 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +8 this week
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Image className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Site Views</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.siteViews.toLocaleString()}</p>
                            <p className="text-sm text-green-600 mt-1 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +15% this month
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSessions}</p>
                            <p className="text-sm text-blue-600 mt-1 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse inline-block"></span>
                                Online now
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                        <Link
                            href="/dashboard/content"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                            View all <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className="group block p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r hover:from-gray-50 hover:to-white"
                            >
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white mr-4 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                        <Link
                            href="/dashboard/settings"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                            View all <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <activity.icon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                    <div className="flex items-center mt-1 space-x-2">
                                        <p className="text-xs text-gray-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {activity.time}
                                        </p>
                                        <span className="text-xs text-gray-400">•</span>
                                        <p className="text-xs text-gray-500">by {activity.user}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Content Overview</h2>
                    <Link
                        href="/dashboard/content"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                        Manage all content <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {contentPages.map((page, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 truncate">{page.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    page.status === 'Published'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {page.status === 'Published' ? (
                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                    ) : (
                                        <AlertCircle className="w-3 h-3 inline mr-1" />
                                    )}
                                    {page.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{page.sections} sections</span>
                                    <span className="text-gray-600">{page.views} views</span>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Updated {page.updated}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search Engine Preview */}
            <SearchPreview />

            {/* Site Health */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Site Health & Performance</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <TrendingUp className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">SEO Score</h3>
                        <p className="text-3xl font-bold text-green-600 mb-1">92/100</p>
                        <p className="text-sm text-gray-600">Excellent optimization</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Globe className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
                        <p className="text-3xl font-bold text-blue-600 mb-1">95/100</p>
                        <p className="text-sm text-gray-600">Fast loading times</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Calendar className="w-10 h-10 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Last Backup</h3>
                        <p className="text-3xl font-bold text-purple-600 mb-1">Today</p>
                        <p className="text-sm text-gray-600">All content secured</p>
                        <div className="flex items-center justify-center mt-3">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-600">Up to date</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
