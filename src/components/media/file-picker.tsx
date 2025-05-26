'use client';

import {useState, useEffect, useCallback} from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/src/components/ui/dialog';
import {
    FolderPlus,
    Upload,
    Search,
    Grid,
    List,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Home,
    Image as ImageIcon,
    FileText,
    File,
    Video,
    Music,
    X,
    RefreshCw,
    Check,
    AlertCircle
} from 'lucide-react';
import {Button} from '@/src/components/ui/button';
import {Input} from '@/src/components/ui/input';
import * as mediaService from '@/src/lib/services/media-service';
import {MediaFile} from '@/src/lib/services/media-service';

interface FilePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (file: MediaFile | MediaFile[] | null) => void;
    title?: string;
    allowedTypes?: string[];
    multiple?: boolean;
}

// Helper functions
const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFileIcon = (file: MediaFile) => {
    if (file.isDirectory) return FolderPlus;
    if (file.type?.startsWith('image')) return ImageIcon;
    if (file.type?.startsWith('video')) return Video;
    if (file.type?.startsWith('audio')) return Music;
    if (file.type === 'application/pdf') return FileText;
    return File;
};

interface FilePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (file: MediaFile | MediaFile[] | null) => void;
    title?: string;
    allowedTypes?: string[];
    multiple?: boolean;
}

export function FilePicker({
                               open,
                               onOpenChange,
                               onSelect,
                               title = 'Select File',
                               allowedTypes = [],
                               multiple = false
                           }: FilePickerProps) {
    const [currentPath, setCurrentPath] = useState('/');
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [history, setHistory] = useState<string[]>(['/']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([{name: 'Media', path: '/'}]);
    const [error, setError] = useState<string | null>(null);

    // Load files for the current directory
    const loadFiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get files from the media service
            let data = await mediaService.listMediaFiles(currentPath);

            // Filter by search query if provided
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                data = data.filter(file => file.name.toLowerCase().includes(query));
            }

            setFiles(data);
        } catch (err) {
            console.error('Error loading files:', err);
            setError('Failed to load files. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPath, searchQuery]);

    // Load files when directory or search changes
    useEffect(() => {
        if (open) {
            loadFiles().then();
        }
    }, [open, loadFiles]);

    // Update breadcrumbs when path changes
    useEffect(() => {
        if (currentPath === '/') {
            setBreadcrumbs([{name: 'Media', path: '/'}]);
            return;
        }

        const pathParts = currentPath.split('/').filter(Boolean);
        const breadcrumbItems = [{name: 'Media', path: '/'}];
        let currentBreadcrumbPath = '';

        pathParts.forEach(part => {
            currentBreadcrumbPath += `/${part}`;
            breadcrumbItems.push({
                name: part.charAt(0).toUpperCase() + part.slice(1),
                path: currentBreadcrumbPath
            });
        });

        setBreadcrumbs(breadcrumbItems);
    }, [currentPath]);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setCurrentPath('/');
            setSelectedFiles([]);
            setSearchQuery('');
            setHistory(['/']);
            setHistoryIndex(0);
        }
    }, [open]);

    // Navigation functions
    const navigateTo = (path: string) => {
        if (path !== currentPath) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(path);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setCurrentPath(path);
            setSelectedFiles([]);
        }
    };

    const navigateBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCurrentPath(history[historyIndex - 1]);
            setSelectedFiles([]);
        }
    };

    const navigateForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCurrentPath(history[historyIndex + 1]);
            setSelectedFiles([]);
        }
    };
    const allowed = (file: mediaService.MediaFile) => {
        return allowedTypes.some(type => file.type?.startsWith(type.split('/')[0]))
    }
    // File selection
    const toggleFileSelection = (file: MediaFile, event: React.MouseEvent) => {
        if (file.isDirectory) {
            // Navigate into directory on click
            navigateTo(file.path);
            return;
        }


        // Check if file type is allowed
        if (allowedTypes.length > 0 && file.type && !allowed(file)) {
            return;
        }

        if (multiple) {
            if (event.ctrlKey || event.metaKey) {
                // Multi-select with Ctrl/Cmd
                setSelectedFiles(prev => {
                    const isSelected = prev.some(f => f.id === file.id);
                    return isSelected
                        ? prev.filter(f => f.id !== file.id)
                        : [...prev, file];
                });
            } else {
                // Single select
                setSelectedFiles(prev =>
                    prev.length === 1 && prev[0].id === file.id ? [] : [file]
                );
            }
        } else {
            // Single select mode
            setSelectedFiles([file]);
        }
    };

    // Handle file selection confirmation
    const handleSelect = () => {
        if (multiple) {
            onSelect(selectedFiles.length > 0 ? selectedFiles : null);
        } else {
            onSelect(selectedFiles.length > 0 ? selectedFiles[0] : null);
        }
        onOpenChange(false);
    };

    // Filter files by allowed types
    const filteredFiles = allowedTypes.length > 0
        ? files.filter(file => file.isDirectory || !file.type || allowed(file))
        : files;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                {/* Toolbar */}
                <div
                    className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex flex-wrap items-center justify-between gap-3 rounded-md mb-4">
                    {/* Navigation Controls */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={navigateBack}
                            disabled={historyIndex <= 0}
                            className={`p-1.5 rounded-md ${historyIndex <= 0 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
                            title="Back"
                        >
                            <ArrowLeft className="w-4 h-4"/>
                        </button>

                        <button
                            onClick={navigateForward}
                            disabled={historyIndex >= history.length - 1}
                            className={`p-1.5 rounded-md ${historyIndex >= history.length - 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
                            title="Forward"
                        >
                            <ArrowRight className="w-4 h-4"/>
                        </button>

                        <button
                            onClick={() => navigateTo('/')}
                            className="p-1.5 rounded-md text-gray-700 hover:bg-gray-200"
                            title="Home"
                        >
                            <Home className="w-4 h-4"/>
                        </button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center">
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.path} className="flex items-center">
                                    {index > 0 && <ChevronRight className="w-3 h-3 text-gray-400 mx-1"/>}
                                    <button
                                        onClick={() => navigateTo(crumb.path)}
                                        className={`px-2 py-1 rounded-md text-xs ${
                                            currentPath === crumb.path
                                                ? 'font-medium text-blue-600'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        {crumb.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search and View Controls */}
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 w-40"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-2"/>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-2"
                                >
                                    <X className="w-3 h-3 text-gray-400 hover:text-gray-600"/>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center bg-gray-200 rounded-md p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                                title="Grid view"
                            >
                                <Grid className="w-4 h-4"/>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                                title="List view"
                            >
                                <List className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* File Browser */}
                <div className="flex-1 overflow-y-auto min-h-[300px] p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600"/>
                            <span className="ml-2 text-gray-600">Loading files...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                            <AlertCircle className="w-8 h-8 mb-2"/>
                            <p>{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadFiles}
                                className="mt-2"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <File className="w-8 h-8 mb-2"/>
                            <p>No files found</p>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
                            : 'space-y-1'
                        }>
                            {filteredFiles.map(file => {
                                const FileIcon = getFileIcon(file);
                                const isSelected = selectedFiles.some(f => f.id === file.id);
                                const isDisabled = !file.isDirectory && allowedTypes.length > 0 && file.type && !allowed(file);
                                return (
                                    <div
                                        key={file.id}
                                        className={`
                      ${viewMode === 'grid'
                                            ? 'bg-white p-3 rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer select-none'
                                            : 'bg-white p-2 rounded-lg border hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer select-none flex items-center'
                                        }
                      ${isSelected ? 'ring-2 ring-blue-500 border-blue-400' : 'border-gray-200'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                                        onClick={(e) => !isDisabled && toggleFileSelection(file, e)}
                                    >
                                        {viewMode === 'grid' ? (
                                            <>

                                                <div className="flex justify-center mb-2">
                                                    {file.type?.startsWith('image') && !file.isDirectory ? (
                                                        <div
                                                            className="w-14 h-14 bg-gray-900 rounded-lg overflow-hidden">

                                                            <img
                                                                src={`/media${file.path}`}
                                                                alt={file.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                                                                file.isDirectory ? 'bg-blue-50' : 'bg-gray-100'
                                                            }`}>
                                                            <FileIcon className={`w-7 h-7 ${
                                                                file.isDirectory ? 'text-blue-500' : 'text-gray-500'
                                                            }`}/>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-center text-xs font-medium text-gray-700 truncate">{file.name}</p>
                                                {!file.isDirectory && (
                                                    <p className="text-center text-xs text-gray-500 mt-1">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {file.type?.startsWith('image/') && !file.isDirectory ? (
                                                    <div
                                                        className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                                        <img
                                                            src={`/media${file.path}`}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${
                                                            file.isDirectory ? 'bg-blue-50' : 'bg-gray-100'
                                                        }`}>
                                                        <FileIcon className={`w-4 h-4 ${
                                                            file.isDirectory ? 'text-blue-500' : 'text-gray-500'
                                                        }`}/>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {file.isDirectory
                                                            ? 'Folder'
                                                            : `${formatFileSize(file.size)} • ${new Date(file.modified).toLocaleDateString()}`
                                                        }
                                                    </p>
                                                </div>
                                                {file.isDirectory && (
                                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                                                )}
                                                {isSelected && !file.isDirectory && (
                                                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0"/>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-gray-200 pt-3 mt-2">
                    <div className="flex-1 text-sm text-gray-500">
                        {selectedFiles.length > 0
                            ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                            : 'No files selected'
                        }
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSelect}
                        disabled={selectedFiles.length === 0}
                    >
                        Select
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
