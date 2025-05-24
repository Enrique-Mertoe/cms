'use client';

import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import {redirect} from 'next/navigation';
import {Session as Ses, User as Usr} from "next-auth";

type User = Usr & {
    role: string
}

type Session = Ses & {
    user: User
}

interface SystemStats {
    uptime: string;
    memory: {
        used: string;
        total: string;
        percentage: number;
    };
    storage: {
        used: string;
        total: string;
        percentage: number;
    };
    cache: {
        config: number;
        content: number;
        images: number;
    };
    performance: {
        avgResponseTime: number;
        totalRequests: number;
        errorRate: number;
    };
}

interface BackupInfo {
    id: string;
    timestamp: string;
    size: string;
    type: 'automatic' | 'manual';
    status: 'completed' | 'failed' | 'in-progress';
}

interface SystemLog {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    category: 'system' | 'security' | 'performance' | 'backup';
}

export default function AdminSystemPage() {
    const {data: ses, status} = useSession();
    const session = ses as Session
    const [activeTab, setActiveTab] = useState('overview');
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [cacheClearing, setCacheClearing] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (status === 'loading') return;
        if (!session || session.user?.role !== 'admin') {
            redirect('/dashboard');
        }
    }, [session, status]);

    // Load system data
    useEffect(() => {
        if (session?.user?.role === 'admin') {
            loadSystemData();
        }
    }, [session]);

    const loadSystemData = async () => {
        try {
            const [statsRes, backupsRes, logsRes] = await Promise.all([
                fetch('/api/admin/system/stats'),
                fetch('/api/admin/system/backups'),
                fetch('/api/admin/system/logs')
            ]);

            if (statsRes.ok) {
                const stats = await statsRes.json();
                setSystemStats(stats);
            }

            if (backupsRes.ok) {
                const backupsData = await backupsRes.json();
                setBackups(backupsData.backups || []);
            }

            if (logsRes.ok) {
                const logsData = await logsRes.json();
                setLogs(logsData.logs || []);
            }
        } catch (error) {
            console.error('Error loading system data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        setBackupInProgress(true);
        try {
            const response = await fetch('/api/admin/system/backup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({type: 'manual'})
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Backup created successfully: ${result.timestamp}`);
                loadSystemData(); // Refresh backup list
            } else {
                alert('Failed to create backup');
            }
        } catch (error) {
            alert('Error creating backup');
        } finally {
            setBackupInProgress(false);
        }
    };

    const restoreBackup = async (backupId: string) => {
        if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
            return;
        }

        try {
            const response = await fetch('/api/admin/system/restore', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({backupId})
            });

            if (response.ok) {
                alert('Backup restored successfully. Please refresh the page.');
                window.location.reload();
            } else {
                alert('Failed to restore backup');
            }
        } catch (error) {
            alert('Error restoring backup');
        }
    };

    const clearCache = async (type: 'all' | 'config' | 'content' | 'images') => {
        setCacheClearing(true);
        try {
            const response = await fetch('/api/admin/system/cache', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({type})
            });

            if (response.ok) {
                alert(`${type === 'all' ? 'All caches' : type + ' cache'} cleared successfully`);
                loadSystemData(); // Refresh stats
            } else {
                alert('Failed to clear cache');
            }
        } catch (error) {
            alert('Error clearing cache');
        } finally {
            setCacheClearing(false);
        }
    };

    const optimizeSystem = async () => {
        try {
            const response = await fetch('/api/admin/system/optimize', {
                method: 'POST'
            });

            if (response.ok) {
                alert('System optimization completed');
                loadSystemData();
            } else {
                alert('Failed to optimize system');
            }
        } catch (error) {
            alert('Error optimizing system');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading system data...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        {id: 'overview', label: 'System Overview'},
        {id: 'backups', label: 'Backups & Recovery'},
        {id: 'performance', label: 'Performance'},
        {id: 'logs', label: 'System Logs'},
        {id: 'maintenance', label: 'Maintenance'}
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">System Management</h1>
                    <p className="text-gray-600 mt-2">Monitor and manage system health, backups, and performance</p>
                </div>

                {/* System Status Alert */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="ml-3">
                            <p className="text-green-800 font-medium">System Status: Operational</p>
                            <p className="text-green-700 text-sm">All services running normally</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && systemStats && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">System Overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-blue-900">Uptime</h3>
                                    <p className="text-2xl font-bold text-blue-600">{systemStats.uptime}</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-green-900">Memory Usage</h3>
                                    <p className="text-2xl font-bold text-green-600">{systemStats.memory.percentage}%</p>
                                    <p className="text-sm text-green-700">{systemStats.memory.used} / {systemStats.memory.total}</p>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-yellow-900">Storage</h3>
                                    <p className="text-2xl font-bold text-yellow-600">{systemStats.storage.percentage}%</p>
                                    <p className="text-sm text-yellow-700">{systemStats.storage.used} / {systemStats.storage.total}</p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-purple-900">Avg Response</h3>
                                    <p className="text-2xl font-bold text-purple-600">{systemStats.performance.avgResponseTime}ms</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium mb-4">Cache Status</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Config Cache</span>
                                            <span className="font-medium">{systemStats.cache.config} items</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Content Cache</span>
                                            <span className="font-medium">{systemStats.cache.content} items</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Image Cache</span>
                                            <span className="font-medium">{systemStats.cache.images} items</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-4">Performance Metrics</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Total Requests</span>
                                            <span
                                                className="font-medium">{systemStats.performance.totalRequests.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Error Rate</span>
                                            <span className="font-medium">{systemStats.performance.errorRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Backups Tab */}
                    {activeTab === 'backups' && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Backup Management</h2>
                                <button
                                    onClick={createBackup}
                                    disabled={backupInProgress}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    {backupInProgress ? 'Creating...' : 'Create Backup'}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {backups.map((backup) => (
                                        <tr key={backup.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(backup.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              backup.type === 'automatic'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                          }`}>
                            {backup.type}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {backup.size}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                          }`}>
                            {backup.status}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {backup.status === 'completed' && (
                                                    <button
                                                        onClick={() => restoreBackup(backup.id)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Restore
                                                    </button>
                                                )}
                                                <button className="text-red-600 hover:text-red-900">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Performance Tab */}
                    {activeTab === 'performance' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Performance Optimization</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-4">Cache Management</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => clearCache('all')}
                                            disabled={cacheClearing}
                                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded font-medium"
                                        >
                                            Clear All Caches
                                        </button>
                                        <button
                                            onClick={() => clearCache('config')}
                                            disabled={cacheClearing}
                                            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded font-medium"
                                        >
                                            Clear Config Cache
                                        </button>
                                        <button
                                            onClick={() => clearCache('content')}
                                            disabled={cacheClearing}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded font-medium"
                                        >
                                            Clear Content Cache
                                        </button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-4">System Optimization</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={optimizeSystem}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                                        >
                                            Optimize System
                                        </button>
                                        <p className="text-sm text-gray-600">
                                            This will optimize file structures, clean temporary files, and rebuild
                                            caches.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logs Tab */}
                    {activeTab === 'logs' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">System Logs</h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.slice(0, 50).map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                                  log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                          }`}>
                            {log.level}
                          </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.category}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {log.message}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">System Maintenance</h2>

                            <div className="space-y-6">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Security Settings</h3>
                                    <p className="text-gray-600 mb-4">Manage system security and access controls</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span>Two-Factor Authentication</span>
                                            <button
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Session Timeout</span>
                                            <span className="text-gray-600">30 minutes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">File Management</h3>
                                    <p className="text-gray-600 mb-4">Clean up temporary files and optimize storage</p>
                                    <div className="space-x-4">
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                            Clean Temp Files
                                        </button>
                                        <button
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded">
                                            Optimize Images
                                        </button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Database Maintenance</h3>
                                    <p className="text-gray-600 mb-4">Although file-based, optimize TOML file
                                        structure</p>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                                        Optimize File Structure
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}