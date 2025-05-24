'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Save,
    RefreshCw,
    Globe,
    Search,
    TrendingUp,
    FileText,
    AlertCircle,
    CheckCircle,
    ArrowUpRight,
    Smartphone,
    Monitor,
    Info
} from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual API calls
const INITIAL_SEO_DATA = {
    global: {
        site_title: 'Your Website Name',
        site_description: 'Professional services for your business needs',
        site_keywords: ['business', 'services', 'professional', 'solutions'],
        social_image: '/images/social-share.jpg',
        favicon: '/favicon.ico',
        google_analytics_id: 'UA-XXXXXXXXX-X',
        enable_indexing: true
    },
    pages: {
        home: {
            title: 'Your Website - Professional Services for Business',
            description: 'Professional services for your business needs. We provide exceptional solutions with over 10 years of experience in the industry.',
            keywords: ['business', 'services', 'professional', 'home'],
            canonical_url: 'https://yourwebsite.com',
            og_type: 'website'
        },
        about: {
            title: 'About Our Company | Your Website',
            description: 'Learn about our company\'s mission, vision, and the team behind our success. Dedicated professionals committed to excellence.',
            keywords: ['about us', 'company', 'team', 'mission'],
            canonical_url: 'https://yourwebsite.com/about',
            og_type: 'website'
        },
        services: {
            title: 'Our Services | Your Website',
            description: 'Explore our comprehensive range of services designed to help your business grow and succeed in today\'s competitive market.',
            keywords: ['services', 'business solutions', 'consulting'],
            canonical_url: 'https://yourwebsite.com/services',
            og_type: 'website'
        },
        contact: {
            title: 'Contact Us | Your Website',
            description: 'Get in touch with our team for inquiries, support, or to schedule a consultation. We\'re here to help your business succeed.',
            keywords: ['contact', 'support', 'help', 'inquiry'],
            canonical_url: 'https://yourwebsite.com/contact',
            og_type: 'website'
        }
    }
};

export default function SEODashboardPage() {
    const { data: session } = useSession();
    const [seoData, setSeoData] = useState(INITIAL_SEO_DATA);
    const [selectedPage, setSelectedPage] = useState('global');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<any>(null);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [lastModified, setLastModified] = useState<string | null>(null);

    // Simulate loading SEO data
    useEffect(() => {
        const loadSeoData = async () => {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setSeoData(INITIAL_SEO_DATA);
            setLastModified(new Date().toISOString());
            setIsLoading(false);
        };

        loadSeoData();
    }, []);

    // Handle page selection from URL params
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const pageParam = queryParams.get('page');
        
        // @ts-ignore
        if (pageParam && (pageParam === 'global' || seoData.pages[pageParam])) {
            setSelectedPage(pageParam);
        }
    }, [seoData]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Success
            setSaveStatus('success');
            setLastModified(new Date().toISOString());
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const updateSeoValue = (path: string, value: any) => {
        const keys = path.split('.');
        const newData = { ...seoData };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            // @ts-ignore
            current = current[keys[i]];
        }

        // @ts-ignore
        current[keys[keys.length - 1]] = value;
        setSeoData(newData);
    };

    const getSelectedData = () => {
        if (selectedPage === 'global') {
            return seoData.global;
        }
        // @ts-ignore
        return seoData.pages[selectedPage];
    };

    const renderSearchPreview = () => {

        const data = selectedPage === 'global'
            ? seoData.pages.home
            // @ts-ignore
            : seoData.pages[selectedPage];
        
        const domain = 'yourwebsite.com';
        const path = selectedPage === 'home' ? '' : `/${selectedPage}`;
        
        if (previewMode === 'desktop') {
            return (
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm p-4">
                    <div className="search-result">
                        <div className="text-sm text-gray-600 mb-1">{domain}{path}</div>
                        <a href="#" className="text-xl text-blue-800 font-medium hover:underline">{data.title}</a>
                        <p className="text-sm text-gray-700 mt-1">
                            {data.description}
                        </p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm p-4 max-w-sm mx-auto">
                    <div className="search-result">
                        <div className="text-xs text-gray-600 mb-1">{domain}{path}</div>
                        <a href="#" className="text-base text-blue-800 font-medium hover:underline">
                            {data.title.length > 40 ? data.title.substring(0, 40) + '...' : data.title}
                        </a>
                        <p className="text-xs text-gray-700 mt-1">
                            {data.description.length > 80 ? data.description.substring(0, 80) + '...' : data.description}
                        </p>
                    </div>
                </div>
            );
        }
    };

    const renderFieldEditor = (key: string, value: any, path = '') => {
        const fullPath = path ? `${path}.${key}` : key;
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (Array.isArray(value)) {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {value.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                        const newValue = [...value];
                                        newValue[index] = e.target.value;
                                        updateSeoValue(fullPath, newValue);
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button
                                    onClick={() => {
                                        const newValue = value.filter((_: any, i: number) => i !== index);
                                        updateSeoValue(fullPath, newValue);
                                    }}
                                    className="px-2 py-2 bg-red-50 text-red-600 border border-l-0 border-gray-300 rounded-r-md hover:bg-red-100"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                updateSeoValue(fullPath, [...value, '']);
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
                        >
                            + Add
                        </button>
                    </div>
                </div>
            );
        }

        if (typeof value === 'boolean') {
            return (
                <div key={key} className="space-y-2">
                    <div className="flex items-center">
                        <input
                            id={fullPath}
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateSeoValue(fullPath, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={fullPath} className="ml-2 block text-sm font-medium text-gray-700">
                            {label}
                        </label>
                    </div>
                </div>
            );
        }

        return (
            <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
                {key.includes('description') ? (
                    <textarea
                        value={value}
                        onChange={(e) => updateSeoValue(fullPath, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                ) : key.includes('image') || key.includes('favicon') ? (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => updateSeoValue(fullPath, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={`Enter ${label.toLowerCase()} URL`}
                        />
                        {value && (
                            <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                <img
                                    src={value}
                                    alt={`${label} preview`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => updateSeoValue(fullPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
                    <p className="text-gray-600">Optimize your website for search engines</p>
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
                {/* SEO Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h3 className="font-medium text-gray-900">SEO Settings</h3>

                        {isLoading ? (
                            <div className="text-center py-4">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400"/>
                                <p className="text-sm text-gray-500 mt-2">Loading settings...</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedPage('global')}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${
                                        selectedPage === 'global'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Globe className="w-5 h-5"/>
                                    <div className="flex-1">
                                        <div className="font-medium">Global Settings</div>
                                        <div className="text-xs text-gray-500">Site-wide SEO configuration</div>
                                    </div>
                                </button>

                                <div className="pt-2 pb-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-1">
                                        Pages
                                    </div>
                                </div>

                                {Object.keys(seoData.pages).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setSelectedPage(page)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${
                                            selectedPage === page
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <FileText className="w-5 h-5"/>
                                        <div className="flex-1">
                                            <div className="font-medium capitalize">{page}</div>
                                            <div className="text-xs text-gray-500">
                                                {page === 'home' ? 'Homepage' : `${page.charAt(0).toUpperCase() + page.slice(1)} page`}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">Search Preview</h3>
                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setPreviewMode('desktop')}
                                    className={`p-1.5 rounded-md text-xs ${
                                        previewMode === 'desktop'
                                            ? 'bg-white shadow-sm text-gray-700'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <Monitor className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPreviewMode('mobile')}
                                    className={`p-1.5 rounded-md text-xs ${
                                        previewMode === 'mobile'
                                            ? 'bg-white shadow-sm text-gray-700'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    <Smartphone className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {selectedPage !== 'global' && renderSearchPreview()}

                        {selectedPage === 'global' && (
                            <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2">
                                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-700">
                                    Select a specific page to see its search preview
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SEO Editor */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {selectedPage === 'global' 
                                            ? 'Global SEO Settings' 
                                            : `SEO for ${selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)} Page`}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedPage === 'global'
                                            ? 'Configure site-wide SEO settings'
                                            : `Optimize SEO for your ${selectedPage} page`}
                                        {lastModified && (
                                            <span className="ml-2 text-xs">
                                                • Last updated: {new Date(lastModified).toLocaleDateString()}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {selectedPage !== 'global' && (
                                    <Link
                                        href={`/dashboard/content?section=pages&item=${selectedPage}`}
                                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Edit Content <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3"/>
                                    <span className="text-gray-600">Loading SEO settings...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(getSelectedData()).map(([key, value]) =>
                                        renderFieldEditor(key, value, selectedPage === 'global' ? 'global' : `pages.${selectedPage}`)
                                    )}
                                    
                                    {selectedPage !== 'global' && (
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <div className="flex items-start space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-md">
                                                    <Search className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">SEO Best Practices</h4>
                                                    <ul className="mt-2 space-y-2 text-sm text-gray-600">
                                                        <li className="flex items-start">
                                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                                                            Keep titles under 60 characters
                                                        </li>
                                                        <li className="flex items-start">
                                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                                                            Meta descriptions should be 150-160 characters
                                                        </li>
                                                        <li className="flex items-start">
                                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                                                            Use relevant keywords naturally in your content
                                                        </li>
                                                        <li className="flex items-start">
                                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                                                            Ensure canonical URLs are correctly formatted
                                                        </li>
                                                    </ul>
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