// app/api/admin/system/backups/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {getServerSession} from 'next-auth/next';
import {authConfig as authOptions} from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs/promises';
import path from 'path';
import {Session as Ses, User as Usr} from "next-auth";

type User = Usr & {
    role: string
}

type Session = Ses & {
    user: User
}

interface BackupInfo {
    id: string;
    timestamp: string;
    size: string;
    type: 'automatic' | 'manual';
    status: 'completed' | 'failed' | 'in-progress';
}

export async function GET(request: NextRequest) {
    try {
        const session: Session | null = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }

        const backups = await getBackupList();

        return NextResponse.json({backups});
    } catch (error) {
        console.error('Error fetching backups:', error);
        return NextResponse.json(
            {error: 'Failed to fetch backups'},
            {status: 500}
        );
    }
}

async function getBackupList(): Promise<BackupInfo[]> {
    const backupsDir = path.join(process.cwd(), 'src/data/backups');

    try {
        // Ensure backups directory exists
        await fs.mkdir(backupsDir, {recursive: true});

        const entries = await fs.readdir(backupsDir, {withFileTypes: true});
        const backupDirs = entries.filter(entry => entry.isDirectory());

        const backups: BackupInfo[] = [];

        for (const dir of backupDirs) {
            const backupPath = path.join(backupsDir, dir.name);
            const metaPath = path.join(backupPath, 'meta.json');

            try {
                // Try to read metadata file
                const metaContent = await fs.readFile(metaPath, 'utf-8');
                const meta = JSON.parse(metaContent);

                backups.push({
                    id: dir.name,
                    timestamp: meta.timestamp,
                    size: meta.size || await calculateBackupSize(backupPath),
                    type: meta.type || 'manual',
                    status: meta.status || 'completed'
                });
            } catch (error) {
                // If no metadata file, create backup info from directory
                const stats = await fs.stat(backupPath);
                const size = await calculateBackupSize(backupPath);

                backups.push({
                    id: dir.name,
                    timestamp: stats.birthtime.toISOString(),
                    size: formatBytes(size),
                    type: 'manual',
                    status: 'completed'
                });
            }
        }

        // Sort by timestamp, newest first
        backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return backups;
    } catch (error) {
        console.error('Error reading backups directory:', error);
        return [];
    }
}

async function calculateBackupSize(backupPath: string): Promise<number> {
    try {
        let totalSize = 0;

        const entries = await fs.readdir(backupPath, {withFileTypes: true});

        for (const entry of entries) {
            const fullPath = path.join(backupPath, entry.name);

            if (entry.isDirectory()) {
                totalSize += await calculateBackupSize(fullPath);
            } else {
                const stats = await fs.stat(fullPath);
                totalSize += stats.size;
            }
        }

        return totalSize;
    } catch (error) {
        return 0;
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}