'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSettingDescriptions } from '@/src/lib/settings/descriptions';
import {
    Save,
    RefreshCw,
    User,
    Globe,
    Bell,
    Shield,
    Mail,
    Smartphone,
    Palette,
    FileText,
    CheckCircle,
    AlertCircle,
    Info,
    Settings as SettingsIcon,
    Clock,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

// Default settings structure (will be replaced with API data)
const INITIAL_SETTINGS_DATA = {
    general: {},
    appearance: {},
    notifications: {},
    security: {},
    content: {},
    advanced: {}
};

export default function SettingsDashboardPage() {
    const { data: session } = useSession();
    const [settingsData, setSettingsData] = useState(INITIAL_SETTINGS_DATA);
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [lastModified, setLastModified] = useState(new Date().toISOString());

    // Load settings data from API
    useEffect(() => {
        const loadSettingsData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/settings');

                if (!response.ok) {
                    throw new Error('Failed to fetch settings');
                }

                const data = await response.json();
                setSettingsData(data.settings);
                setLastModified(data.lastModified);
            } catch (error) {
                console.error('Error loading settings:', error);
                // Keep the initial empty structure if there's an error
            } finally {
                setIsLoading(false);
            }
        };

        loadSettingsData();
    }, []);

    // Handle save
    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    settings: settingsData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }

            const data = await response.json();

            // Success
            // @ts-ignore
            setSaveStatus('success');
            setLastModified(data.lastModified || new Date().toISOString());
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Save error:', error);
            // @ts-ignore
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const updateSettingsValue = (path:any, value:any) => {
        const keys = path.split('.');
        const newData = { ...settingsData };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            // @ts-ignore
            current = current[keys[i]];
        }

        // @ts-ignore
        current[keys[keys.length - 1]] = value;
        setSettingsData(newData);
    };

    const getSelectedData = () => {
        // @ts-ignore
        return settingsData[selectedCategory] || {};
    };

    const getCategoryIcon = (category:any) => {
        const icons = {
            general: Globe,
            appearance: Palette,
            notifications: Bell,
            security: Shield,
            content: FileText,
            advanced: SettingsIcon
        };
        // @ts-ignore
        return icons[category] || Globe;
    };

    const getCategoryDescription = (category:any) => {
        const descriptions = {
            general: 'Basic website information and settings',
            appearance: 'Customize the look and feel of your website',
            notifications: 'Configure email and system notifications',
            security: 'Manage security settings and access controls',
            content: 'Content management and publishing settings',
            advanced: 'Advanced system configuration options'
        };
        // @ts-ignore
        return descriptions[category] || '';
    };

    const renderFieldEditor = (key:any, value:any, path = '') => {
        const fullPath = path ? `${path}.${key}` : key;
        // @ts-ignore
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (typeof value === 'boolean') {
            return (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white">
                    <div>
                        <label htmlFor={fullPath} className="block text-sm font-medium text-gray-900">
                            {label}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                            {getSettingDescription(key)}
                        </p>
                    </div>
                    <button
                        onClick={() => updateSettingsValue(fullPath, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                        {value ? (
                            <ToggleRight className="absolute right-1 w-4 h-4 text-white" />
                        ) : (
                            <ToggleLeft className="absolute left-1 w-4 h-4 text-gray-400" />
                        )}
                    </button>
                </div>
            );
        }

        if (key.includes('color')) {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <div className="flex items-center space-x-3">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                            className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={`Enter ${label.toLowerCase()}`}
                        />
                    </div>
                </div>
            );
        }

        if (key.includes('font')) {
            const fontOptions = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                        ))}
                    </select>
                </div>
            );
        }

        if (key === 'timezone') {
            const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {timezones.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                        ))}
                    </select>
                </div>
            );
        }

        if (key === 'date_format') {
            const formats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'MMMM D, YYYY'];
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {formats.map(format => (
                            <option key={format} value={format}>{format}</option>
                        ))}
                    </select>
                </div>
            );
        }

        if (key === 'time_format') {
            const formats = ['12h', '24h'];
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {formats.map(format => (
                            <option key={format} value={format}>{format}</option>
                        ))}
                    </select>
                </div>
            );
        }

        if (key === 'newsletter_frequency') {
            const frequencies = ['daily', 'weekly', 'monthly', 'never'];
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        {frequencies.map(freq => (
                            <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
                        ))}
                    </select>
                </div>
            );
        }

        if (key.includes('email')) {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <input
                        type="email"
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                </div>
            );
        }

        if (key.includes('css')) {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <textarea
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                        placeholder={`/* Add your custom CSS here */`}
                    />
                </div>
            );
        }

        if (key.includes('logo') || key.includes('favicon')) {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={`Enter ${label.toLowerCase()} URL`}
                        />
                        {value && (
                            <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                <img
                                    src={value}
                                    alt={`${label} preview`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => (
                                        //@ts-ignore
                                        e.target.style.display = 'none')}
                                />
                            </div>
                        )}
                        <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                            Choose File
                        </button>
                    </div>
                </div>
            );
        }

        if (typeof value === 'number') {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => updateSettingsValue(fullPath, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                </div>
            );
        }

        return (
            <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => updateSettingsValue(fullPath, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            </div>
        );
    };

    const getSettingDescription = (key:any) => {
        const descriptions = getSettingDescriptions();
        // @ts-ignore
        return descriptions[key] || 'Configure this setting';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Configure your website settings and preferences</p>
                </div>

                <div className="flex items-center space-x-3">
                    {saveStatus && (
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                            saveStatus === 'success'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                        }`}>
                            {saveStatus === 'success' ? (
                                <CheckCircle className="w-4 h-4"/>
                            ) : (
                                <AlertCircle className="w-4 h-4"/>
                            )}
                            <span>
                                {saveStatus === 'success' ? 'Saved successfully' : 'Save failed'}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin"/>
                        ) : (
                            <Save className="w-4 h-4 mr-2"/>
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Settings Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h3 className="font-medium text-gray-900">Settings Categories</h3>

                        {isLoading ? (
                            <div className="text-center py-4">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400"/>
                                <p className="text-sm text-gray-500 mt-2">Loading settings...</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {Object.keys(settingsData).map((category) => {
                                    const CategoryIcon = getCategoryIcon(category);
                                    return (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${
                                                selectedCategory === category
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <CategoryIcon className="w-5 h-5"/>
                                            <div className="flex-1">
                                                <div className="font-medium capitalize">{category}</div>
                                                <div className="text-xs text-gray-500">
                                                    {getCategoryDescription(category)}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                        <div className="flex items-center space-x-3 text-blue-600">
                            <Info className="w-5 h-5" />
                            <h3 className="font-medium">Settings Tips</h3>
                        </div>
                        <div className="mt-4 text-sm text-gray-600 space-y-3">
                            <p>
                                Changes to settings take effect immediately after saving.
                            </p>
                            <p>
                                Some settings may require a cache clear to be visible on your site.
                            </p>
                            <p>
                                Remember to test your site after making significant changes.
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-2" />
                                Last updated: {new Date(lastModified).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Editor */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                                        {selectedCategory} Settings
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {getCategoryDescription(selectedCategory)}
                                        {lastModified && (
                                            <span className="ml-2 text-xs">
                                                • Last updated: {new Date(lastModified).toLocaleDateString()}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3"/>
                                    <span className="text-gray-600">Loading settings...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedCategory === 'security' || selectedCategory === 'content' || selectedCategory === 'advanced' ? (
                                        // Toggle style for boolean-heavy categories
                                        <div className="space-y-4">
                                            {Object.entries(getSelectedData()).map(([key, value]) =>
                                                renderFieldEditor(key, value, selectedCategory)
                                            )}
                                        </div>
                                    ) : (
                                        // Standard form style for other categories
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(getSelectedData()).map(([key, value]) =>
                                                renderFieldEditor(key, value, selectedCategory)
                                            )}
                                        </div>
                                    )}

                                    {selectedCategory === 'advanced' && (
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                                                <div className="flex items-start">
                                                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                                                    <div>
                                                        <h3 className="text-sm font-medium text-yellow-800">Caution</h3>
                                                        <p className="text-sm text-yellow-700 mt-1">
                                                            These advanced settings can significantly impact your website's performance and functionality.
                                                            Please make changes carefully and test thoroughly after saving.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
