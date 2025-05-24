/**
 * Client-safe settings descriptions
 * This file contains only client-safe code and can be imported by client components
 */

/**
 * Get setting descriptions for UI
 */
export function getSettingDescriptions() {
    return {
        site_name: 'The name of your website displayed in the browser title',
        site_tagline: 'A short description of your website',
        site_logo: 'Your website logo displayed in the header',
        favicon: 'Icon shown in browser tabs',
        admin_email: 'Main administrator email address',
        timezone: 'Default timezone for your website',
        date_format: 'How dates are displayed on your website',
        time_format: 'How times are displayed on your website',
        primary_color: 'Main color used throughout your website',
        secondary_color: 'Accent color used for highlights and buttons',
        font_heading: 'Font used for headings and titles',
        font_body: 'Font used for body text and paragraphs',
        enable_dark_mode: 'Allow users to switch to dark mode',
        default_theme: 'Default theme for new visitors',
        custom_css: 'Add custom CSS styles to your website',
        email_notifications: 'Send email notifications for important events',
        content_updates: 'Notify when content is updated',
        security_alerts: 'Receive alerts about security issues',
        newsletter_frequency: 'How often to send newsletter updates',
        notification_email: 'Email address to receive notifications',
        two_factor_auth: 'Require a second verification step when logging in',
        password_expiry_days: 'Days until passwords must be changed',
        session_timeout_minutes: 'Minutes until users are logged out automatically',
        allowed_login_attempts: 'Number of failed login attempts before lockout',
        require_strong_passwords: 'Enforce password complexity requirements',
        enable_comments: 'Allow visitors to leave comments on content',
        moderate_comments: 'Review comments before publishing',
        enable_revisions: 'Keep track of content changes',
        max_revisions: 'Maximum number of revisions to store per content item',
        auto_save_interval: 'Seconds between automatic content saves',
        maintenance_mode: 'Put site in maintenance mode (only admins can access)',
        debug_mode: 'Enable detailed error messages and logging',
        cache_enabled: 'Cache pages for faster loading',
        cache_lifetime: 'Seconds to keep cached pages',
        gzip_compression: 'Compress pages to reduce load time',
        minify_html: 'Remove whitespace from HTML for faster loading',
        minify_css: 'Compress CSS files',
        minify_js: 'Compress JavaScript files'
    };
}