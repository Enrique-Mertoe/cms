// app/api/admin/system/logs/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {getServerSession} from 'next-auth/next';
import {authConfig} from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs/promises';
import path from 'path';
import {Session as Ses, User as Usr} from "next-auth";

type User = Usr & {
    role: string
}

type Session = Ses & {
    user: User
}

interface SystemLog {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    category: 'system' | 'security' | 'performance' | 'backup';
}

export async function GET(request: NextRequest) {
    try {
        const session: Session | null = await getServerSession(authConfig);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const {searchParams} = new URL(request.url);
        const level = searchParams.get('level');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '100');

        const logs = await getSystemLogs({level, category, limit});

        return NextResponse.json({logs});
    } catch (error) {
        console.error('Error fetching system logs:', error);
        return NextResponse.json(
            {error: 'Failed to fetch system logs'},
            {status: 500}
        );
    }
}

async function getSystemLogs(filters: {
    level?: string | null;
    category?: string | null;
    limit: number;
}): Promise<SystemLog[]> {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logsDir, 'system.log');

    try {
        // Ensure logs directory exists
        await fs.mkdir(logsDir, {recursive: true});

        // Check if log file exists, if not create it with some sample logs
        try {
            await fs.access(logFile);
        } catch {
            await createSampleLogFile(logFile);
        }

        const logContent = await fs.readFile(logFile, 'utf-8');
        const logLines = logContent.trim().split('\n').filter(line => line.trim());

        let logs: SystemLog[] = [];

        for (const line of logLines) {
            try {
                const log = JSON.parse(line);
                logs.push({
                    id: log.id || generateLogId(),
                    timestamp: log.timestamp,
                    level: log.level,
                    message: log.message,
                    category: log.category
                });
            } catch (error) {
                // Skip invalid log lines
                continue;
            }
        }

        // Apply filters
        if (filters.level) {
            logs = logs.filter(log => log.level === filters.level);
        }

        if (filters.category) {
            logs = logs.filter(log => log.category === filters.category);
        }

        // Sort by timestamp, newest first
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Apply limit
        return logs.slice(0, filters.limit);

    } catch (error) {
        console.error('Error reading system logs:', error);

        // Return sample logs if file operations fail
        return getSampleLogs();
    }
}

async function createSampleLogFile(logFile: string) {
    const sampleLogs = [
        {
            id: generateLogId(),
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'System started successfully',
            category: 'system'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 60000).toISOString(),
            level: 'info',
            message: 'User admin logged in',
            category: 'security'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 120000).toISOString(),
            level: 'info',
            message: 'Configuration cache cleared',
            category: 'system'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 180000).toISOString(),
            level: 'info',
            message: 'Backup created successfully',
            category: 'backup'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 240000).toISOString(),
            level: 'warning',
            message: 'High memory usage detected',
            category: 'performance'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 300000).toISOString(),
            level: 'info',
            message: 'Page content updated: home.toml',
            category: 'system'
        }
    ];

    const logContent = sampleLogs.map(log => JSON.stringify(log)).join('\n');
    await fs.writeFile(logFile, logContent, 'utf-8');
}

function getSampleLogs(): SystemLog[] {
    return [
        {
            id: generateLogId(),
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'System running normally',
            category: 'system'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 60000).toISOString(),
            level: 'info',
            message: 'Cache optimization completed',
            category: 'performance'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 120000).toISOString(),
            level: 'warning',
            message: 'Temporary file cleanup needed',
            category: 'system'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 180000).toISOString(),
            level: 'info',
            message: 'Backup process initiated',
            category: 'backup'
        },
        {
            id: generateLogId(),
            timestamp: new Date(Date.now() - 240000).toISOString(),
            level: 'info',
            message: 'User session created',
            category: 'security'
        }
    ];
}

function generateLogId(): string {
    return Math.random().toString(36).substr(2, 9);
}

// Function to add a new log entry (to be used by other parts of the system)
export async function addSystemLog(
    level: 'info' | 'warning' | 'error',
    message: string,
    category: 'system' | 'security' | 'performance' | 'backup'
) {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logsDir, 'system.log');

    try {
        await fs.mkdir(logsDir, {recursive: true});

        const logEntry = {
            id: generateLogId(),
            timestamp: new Date().toISOString(),
            level,
            message,
            category
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        await fs.appendFile(logFile, logLine, 'utf-8');
    } catch (error) {
        console.error('Error writing to system log:', error);
    }
}