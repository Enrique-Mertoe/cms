'use client';

import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import {
    Save,
    Edit3,
    Eye,
    FileText,
    ImageIcon,
    Settings,
    Plus,
    Trash2,
    Copy,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';

// Mock data - replace with actual API calls
const CONTENT_SECTIONS = [
    {id: 'pages', name: 'Pages', icon: FileText, description: 'Manage website pages'},
    {id: 'components', name: 'Components', icon: Settings, description: 'Manage reusable components'},
    {id: 'blog', name: 'Blog Posts', icon: Edit3, description: 'Manage blog content'}
];

const PAGE_TYPES = {
    pages: ['home', 'about', 'services', 'contact'],
    components: ['testimonials', 'gallery', 'team', 'features'],
    blog: ['posts']
};

export default function DashboardContentPage() {
    const {data: session} = useSession();
    const [selectedSection, setSelectedSection] = useState('pages');
    const [selectedItem, setSelectedItem] = useState('home');
    const [contentData, setContentData] = useState({});
    const [contentSections, setContentSections] = useState({});
    const [availableItems, setAvailableItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [lastModified, setLastModified] = useState(null);

    // Check URL parameters on mount
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sectionParam = queryParams.get('section');
        const itemParam = queryParams.get('item');

        if (sectionParam) {
            setSelectedSection(sectionParam);
        }

        if (itemParam) {
            setSelectedItem(itemParam);
        }

        fetchContentSections();
    }, []);

    // Load specific content when selection changes
    useEffect(() => {
        if (selectedSection && selectedItem) {
            loadContent();

            // Update URL with current selection without page reload
            const url = new URL(window.location.href);
            url.searchParams.set('section', selectedSection);
            url.searchParams.set('item', selectedItem);
            window.history.pushState({}, '', url);
        }
    }, [selectedSection, selectedItem]);

    const fetchContentSections = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/content');
            if (!response.ok) throw new Error('Failed to fetch content');

            const data = await response.json();
            setContentSections(data.sections || {});

            // Set default selections if available
            const firstSection = Object.keys(data.sections)[0];
            if (firstSection && data.sections[firstSection].items.length > 0) {
                setSelectedSection(firstSection);
                setSelectedItem(data.sections[firstSection].items[0]);
                setAvailableItems(data.sections[firstSection].items);
            }
        } catch (error) {
            console.error('Failed to fetch content sections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadContent = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/content/${selectedSection}?item=${selectedItem}`);
            if (!response.ok) throw new Error('Failed to fetch content');

            const result = await response.json();
            setContentData(result.data || {});
            setLastModified(result.lastModified);
        } catch (error) {
            console.error('Failed to load content:', error);
            setContentData({});
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultContent = () => {
        if (selectedSection === 'pages' && selectedItem === 'home') {
            return {
                meta: {
                    title: 'Welcome to Our Website',
                    description: 'Professional services for your business needs',
                    keywords: ['business', 'services', 'professional'],
                    updated: new Date().toISOString()
                },
                hero: {
                    title: 'Transform Your Business',
                    subtitle: 'Professional solutions that drive results',
                    cta_text: 'Get Started',
                    cta_link: '/contact',
                    background_image: '/images/hero-bg.jpg'
                },
                about_preview: {
                    title: 'About Our Company',
                    content: 'We provide exceptional services with over 10 years of experience.',
                    image: '/images/about-preview.jpg'
                },
                features: [
                    {
                        title: 'Quality Service',
                        description: 'We deliver high-quality solutions',
                        icon: 'check-circle'
                    }
                ]
            };
        }
        return {};
    };

    const saveContent = async () => {
        setSaving(true);
        setSaveStatus(null);

        try {
            const response = await fetch(`/api/content/${selectedSection}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    item: selectedItem,
                    data: contentData
                })
            });

            if (response.ok) {
                setSaveStatus('success');
                // Reload content to get updated lastModified timestamp
                await loadContent();
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Save failed');
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleSectionChange = (sectionId: any) => {
        setSelectedSection(sectionId);
        // @ts-ignore
        const sectionItems = contentSections[sectionId]?.items || [];
        setAvailableItems(sectionItems);
        if (sectionItems.length > 0) {
            setSelectedItem(sectionItems[0]);
        }
    };

    const updateNestedValue = (path: any, value: any) => {
        const keys = path.split('.');
        const newData = {...contentData};
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            // @ts-ignore
            if (!current[keys[i]]) current[keys[i]] = {};
            // @ts-ignore
            current = current[keys[i]];
        }

        // @ts-ignore
        current[keys[keys.length - 1]] = value;
        setContentData(newData);
    };

    const addArrayItem = (path: any) => {
        const keys = path.split('.');
        const newData = {...contentData};
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            // @ts-ignore
            if (!current[keys[i]]) current[keys[i]] = {};
            // @ts-ignore
            current = current[keys[i]];
        }

        // @ts-ignore
        if (!current[keys[keys.length - 1]]) {
            // @ts-ignore
            current[keys[keys.length - 1]] = [];
        }

        // @ts-ignore
        current[keys[keys.length - 1]].push({
            title: 'New Item',
            description: 'Description here...',
            icon: 'star'
        });

        setContentData(newData);
    };

    const removeArrayItem = (path: any, index: any) => {
        const keys = path.split('.');
        const newData = {...contentData};
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
            // @ts-ignore
            current = current[keys[i]];
        }

        // @ts-ignore
        current[keys[keys.length - 1]].splice(index, 1);
        setContentData(newData);
    };

    const renderFieldEditor = (key: any, value: any, path = '') => {
        const fullPath = path ? `${path}.${key}` : key;

        if (Array.isArray(value)) {
            return (
                <div key={key} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</h4>
                        <button
                            onClick={() => addArrayItem(fullPath)}
                            className="inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                        >
                            <Plus className="w-4 h-4 mr-1"/>
                            Add Item
                        </button>
                    </div>

                    {value.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Item {index + 1}</span>
                                <button
                                    onClick={() => removeArrayItem(fullPath, index)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>

                            {Object.entries(item).map(([itemKey, itemValue]) => (
                                renderFieldEditor(itemKey, itemValue, `${fullPath}.${index}`)
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof value === 'object' && value !== null) {
            return (
                <div key={key} className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</h4>
                    {Object.entries(value).map(([subKey, subValue]) =>
                        renderFieldEditor(subKey, subValue, fullPath)
                    )}
                </div>
            );
        }

        if (typeof value === 'string') {
            const isTextArea = value.length > 100 || key.includes('content') || key.includes('description');
            const isImage = key.includes('image') || key.includes('background');

            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                        {key.replace('_', ' ')}
                    </label>

                    {isImage ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => updateNestedValue(fullPath, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Image URL or path"
                            />
                            {value && (
                                <div className="relative w-32 h-20 bg-gray-100 rounded-md overflow-hidden">
                                    <img
                                        src={value}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>
                    ) : isTextArea ? (
                        <textarea
                            value={value}
                            onChange={(e) => updateNestedValue(fullPath, e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${key.replace('_', ' ')}`}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => updateNestedValue(fullPath, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter ${key.replace('_', ' ')}`}
                        />
                    )}
                </div>
            );
        }

        return (
            <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace('_', ' ')}
                </label>
                <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => updateNestedValue(fullPath, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                    <p className="text-gray-600">Edit and manage your website content</p>
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
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Eye className="w-4 h-4 mr-2"/>
                        {showPreview ? 'Hide Preview' : 'Preview'}
                    </button>

                    <button
                        onClick={saveContent}
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
                {/* Content Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        <h3 className="font-medium text-gray-900">Content Sections</h3>

                        {isLoading ? (
                            <div className="text-center py-4">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-gray-400"/>
                                <p className="text-sm text-gray-500 mt-2">Loading sections...</p>
                            </div>
                        ) : (
                            Object.entries(contentSections).map(([sectionId, section]) => {
                                const sectionConfig = CONTENT_SECTIONS.find(s => s.id === sectionId) || {
                                    id: sectionId,
                                    name: sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
                                    icon: FileText,
                                    description: `Manage ${sectionId} content`
                                };
                                const Icon = sectionConfig.icon;

                                return (
                                    <div key={sectionId}>
                                        <button
                                            onClick={() => handleSectionChange(sectionId)}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left ${
                                                selectedSection === sectionId
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5"/>
                                            <div className="flex-1">
                                                <div className="font-medium">{sectionConfig.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {
                                                        //@ts-ignore
                                                        section.count} items
                                                </div>
                                            </div>
                                        </button>

                                        {selectedSection === sectionId &&
                                            //@ts-ignore
                                            section.items && (
                                                <div className="ml-8 mt-2 space-y-1">
                                                    {
                                                        //@ts-ignore
                                                        section.items.map((item) => (
                                                            <button
                                                                key={item}
                                                                onClick={() => setSelectedItem(item)}
                                                                className={`w-full text-left px-3 py-1 text-sm rounded-md capitalize ${
                                                                    selectedItem === item
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {item.replace('_', ' ')}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Content Editor */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                                        {selectedSection} - {selectedItem.replace('_', ' ')}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Edit content for {selectedItem} in {selectedSection}
                                        {lastModified && (
                                            <span className="ml-2 text-xs">
                        • Last updated: {new Date(lastModified).toLocaleDateString()}
                      </span>
                                        )}
                                    </p>
                                </div>

                                <button
                                    onClick={loadContent}
                                    className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    <RefreshCw className="w-4 h-4 mr-1"/>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3"/>
                                    <span className="text-gray-600">Loading content...</span>
                                </div>
                            ) : Object.keys(contentData).length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(contentData).map(([key, value]) =>
                                        renderFieldEditor(key, value)
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
                                    <p className="text-gray-500">
                                        This content section appears to be empty. Start by adding some content.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                             onClick={() => setShowPreview(false)}></div>

                        <div
                            className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Content Preview</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <div className="px-6 py-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                  {JSON.stringify(contentData, null, 2)}
                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
