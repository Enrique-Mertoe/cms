// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig as authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getSystemSettingsWithDefaults, saveSystemSettings, resetSystemSettings } from './helper';

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
            // Trigger a notification for the settings update
            try {
                const { triggerSystemNotification } = await import('@/src/lib/notifications/trigger');
                await triggerSystemNotification(
                    'Settings Updated',
                    'System settings have been updated successfully',
                    'success'
                );
            } catch (notificationError) {
                console.error('Failed to create notification:', notificationError);
                // Continue with the response even if notification creation fails
            }

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

// POST /api/settings/reset - Reset system settings to defaults
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow admin users to reset system settings
        // Temporarily commented out for development - uncomment in production
        // if (session.user?.role !== 'admin') {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action !== 'reset') {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        const success = await resetSystemSettings();

        if (success) {
            return NextResponse.json({ 
                message: 'Settings reset successfully',
                lastModified: new Date().toISOString()
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to reset settings' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Settings Reset Error:', error);
        return NextResponse.json(
            { error: 'Failed to reset settings' },
            { status: 500 }
        );
    }
}
