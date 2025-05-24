// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig as authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getSystemSettingsWithDefaults, saveSystemSettings } from './helper';

// GET /api/settings - Get system settings
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admin users to access system settings
        // Temporarily commented out for development - uncomment in production
        // if (session.user?.role !== 'admin') {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const settings = await getSystemSettingsWithDefaults();
        const lastModified = settings.meta?.updated || new Date().toISOString();

        return NextResponse.json({
            settings,
            lastModified
        });

    } catch (error) {
        console.error('Settings API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT /api/settings - Update system settings
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admin users to update system settings
        // Temporarily commented out for development - uncomment in production
        // if (session.user?.role !== 'admin') {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const body = await request.json();
        const { settings } = body;

        if (!settings) {
            return NextResponse.json(
                { error: 'Missing required field: settings' },
                { status: 400 }
            );
        }

        // Add metadata
        const settingsWithMeta = {
            ...settings,
            meta: {
                updated: new Date().toISOString(),
                //@ts-ignore
                updatedBy: session.user?.email || 'unknown'
            }
        };

        const success = await saveSystemSettings(settingsWithMeta);

        if (success) {
            return NextResponse.json({ 
                message: 'Settings updated successfully',
                lastModified: new Date().toISOString()
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to update settings' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Settings Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
