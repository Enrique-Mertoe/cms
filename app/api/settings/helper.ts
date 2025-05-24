// app/api/settings/helper.ts
'use server';

import { getSystemSettings, updateSystemSettings } from "@/src/lib/config/file-manager";

// Default system settings structure
// @ts-ignore
export const DEFAULT_SYSTEM_SETTINGS = {
    general: {
        site_name: 'Your Website',
        site_tagline: 'Professional services for your business',
        site_logo: '/images/logo.svg',
        favicon: '/favicon.ico',
        admin_email: 'admin@example.com',
        timezone: 'UTC',
        date_format: 'YYYY-MM-DD',
        time_format: '24h'
    },
    appearance: {
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        font_heading: 'Inter',
        font_body: 'Inter',
        enable_dark_mode: true,
        default_theme: 'light',
        custom_css: ''
    },
    notifications: {
        email_notifications: true,
        content_updates: true,
        security_alerts: true,
        newsletter_frequency: 'weekly',
        notification_email: 'admin@example.com'
    },
    security: {
        two_factor_auth: false,
        password_expiry_days: 90,
        session_timeout_minutes: 30,
        allowed_login_attempts: 5,
        require_strong_passwords: true
    },
    content: {
        enable_comments: true,
        moderate_comments: true,
        enable_revisions: true,
        max_revisions: 10,
        auto_save_interval: 60
    },
    advanced: {
        maintenance_mode: false,
        debug_mode: false,
        cache_enabled: true,
        cache_lifetime: 3600,
        gzip_compression: true,
        minify_html: true,
        minify_css: true,
        minify_js: true
    },
    meta: {
        updated: new Date().toISOString(),
        updatedBy: 'system'
    }
};

/**
 * Get system settings, merging with defaults if needed
 */
export async function getSystemSettingsWithDefaults() {
    try {
        const settings = await getSystemSettings();

        // If settings file is empty or missing sections, merge with defaults
        if (Object.keys(settings).length === 0) {
            return DEFAULT_SYSTEM_SETTINGS;
        }

        // Ensure all sections exist by merging with defaults
        const mergedSettings = { ...DEFAULT_SYSTEM_SETTINGS };

        for (const section in settings) {
            if (mergedSettings[section]) {
                mergedSettings[section] = {
                    ...mergedSettings[section],
                    ...settings[section]
                };
            } else {
                mergedSettings[section] = settings[section];
            }
        }

        return mergedSettings;
    } catch (error) {
        console.error('Error getting system settings:', error);
        return DEFAULT_SYSTEM_SETTINGS;
    }
}

/**
 * Update system settings
 */
export async function saveSystemSettings(data: any) {
    try {
        // Ensure meta section exists
        const settingsToSave = {
            ...data,
            meta: {
                ...(data.meta || {}),
                updated: new Date().toISOString()
            }
        };

        return await updateSystemSettings(settingsToSave);
    } catch (error) {
        console.error('Error saving system settings:', error);
        return false;
    }
}

// Import from client-safe file if needed in the future
// import { getSettingDescriptions } from '@/src/lib/settings/descriptions';
