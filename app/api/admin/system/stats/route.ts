// app/api/admin/system/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig as  authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs/promises';
import path from 'path';
import { performance as per } from 'perf_hooks';

export async function GET(request: NextRequest) {
    try {
        const session:any = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await getSystemStats();

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching system stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system stats' },
            { status: 500 }
        );
    }
}

async function getSystemStats() {
    const startTime = per.now();
    const dataDir = path.join(process.cwd(), 'src/data');

    // Calculate uptime (process uptime)
    const uptime = formatUptime(process.uptime());

    // Memory usage
    const memUsage = process.memoryUsage();
    const memory = {
        used: formatBytes(memUsage.heapUsed),
        total: formatBytes(memUsage.heapTotal),
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    };

    // Storage usage
    const storage = await getStorageStats(dataDir);

    // Cache statistics
    const cache = await getCacheStats();

    // Performance metrics (mock data - in production, you'd track this)
    const performance = {
        avgResponseTime: Math.round(per.now() - startTime),
        totalRequests: await getRequestCount(),
        errorRate: await getErrorRate()
    };

    return {
        uptime,
        memory,
        storage,
        cache,
        performance
    };
}

async function getStorageStats(dataDir: string) {
    try {
        const totalSize = await calculateDirectorySize(dataDir);
        const maxSize = 100 * 1024 * 1024; // 100MB max (configurable)

        return {
            used: formatBytes(totalSize),
            total: formatBytes(maxSize),
            percentage: Math.round((totalSize / maxSize) * 100)
        };
    } catch (error) {
        return {
            used: '0 B',
            total: '100 MB',
            percentage: 0
        };
    }
}

async function calculateDirectorySize(dirPath: string): Promise<number> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        let size = 0;

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                size += await calculateDirectorySize(fullPath);
            } else {
                const stats = await fs.stat(fullPath);
                size += stats.size;
            }
        }

        return size;
    } catch (error) {
        return 0;
    }
}

async function getCacheStats() {
    // In a real implementation, you'd track cache sizes
    // For now, we'll return mock data based on file counts
    const configDir = path.join(process.cwd(), 'src/data/config');
    const contentDir = path.join(process.cwd(), 'src/data/content');
    const imagesDir = path.join(process.cwd(), 'public/images');

    try {
        const [configFiles, contentFiles, imageFiles] = await Promise.all([
            countFiles(configDir),
            countFilesRecursive(contentDir),
            countFiles(imagesDir)
        ]);

        return {
            config: configFiles,
            content: contentFiles,
            images: imageFiles
        };
    } catch (error) {
        return {
            config: 0,
            content: 0,
            images: 0
        };
    }
}

async function countFiles(dirPath: string): Promise<number> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        return entries.filter(entry => entry.isFile()).length;
    } catch (error) {
        return 0;
    }
}

async function countFilesRecursive(dirPath: string): Promise<number> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        let count = 0;

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                count += await countFilesRecursive(fullPath);
            } else {
                count++;
            }
        }

        return count;
    } catch (error) {
        return 0;
    }
}

async function getRequestCount(): Promise<number> {
    // In production, you'd track this in logs or analytics
    // For demo purposes, return a mock value
    return Math.floor(Math.random() * 10000) + 5000;
}

async function getErrorRate(): Promise<number> {
    // In production, you'd calculate this from actual error logs
    // For demo purposes, return a low mock error rate
    return Math.random() * 2; // 0-2%
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}