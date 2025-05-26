'use client';

import React from 'react';
import {useState, useEffect, useRef} from 'react';
import {useSession} from 'next-auth/react';
import {
    Save,
    RefreshCw,
    FolderPlus,
    Upload,
    Trash2,
    Search,
    Grid,
    List,
    ChevronRight,
    MoreHorizontal,
    ArrowLeft,
    ArrowRight,
    Home,
    Image as ImageIcon,
    FileText,
    File,
    Video,
    Music,
    Download,
    Copy,
    Scissors,
    Edit,
    Info,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import * as mediaService from '@/src/lib/services/media-service';
import {MediaFile} from '@/src/lib/services/media-service';

// File type helpers
const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return ImageIcon;
    if (type.startsWith('video')) return Video;
    if (type.startsWith('audio')) return Music;
    if (type === 'application/pdf') return FileText;
    return File;
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export default function MediaDashboardPage() {
    const {data: session} = useSession();
    const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        type: 'file' | 'folder' | 'background';
        id: string | null
    } | null>(null);
    const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [fileDetailsOpen, setFileDetailsOpen] = useState(false);
    const [selectedFileDetails, setSelectedFileDetails] = useState<MediaFile | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([{name: 'Media', path: '/'}]);
    const [history, setHistory] = useState<string[]>(['/']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clipboard state for copy/cut operations
    const [clipboard, setClipboard] = useState<{
        items: MediaFile[];
        operation: 'copy' | 'cut' | null;
    }>({items: [], operation: null});

    // Sorting and filtering state
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterType, setFilterType] = useState<string | null>(null);

    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    // Trash state
    const [showTrash, setShowTrash] = useState(false);
    const [trashItems, setTrashItems] = useState<mediaService.TrashItem[]>([]);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (showTrash) {
                    // Load trash items
                    const items = await mediaService.listTrash();
                    setTrashItems(items);
                } else {
                    // Load regular media items
                    const items = await mediaService.listMediaFiles(currentPath);
                    setMediaItems(items);
                }
            } catch (error) {
                console.error('Error loading media files:', error);
                setNotification({
                    type: 'error',
                    message: `Failed to load ${showTrash ? 'trash' : 'media files'}. Please try again.`
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [currentPath, showTrash]);

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

    // Handle navigation
    const navigateTo = (path: string) => {
        // Add to history
        if (path !== currentPath) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(path);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }

        setCurrentPath(path);
        setSelectedItems([]);
        setContextMenu(null);
    };

    const navigateBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setCurrentPath(history[historyIndex - 1]);
            setSelectedItems([]);
            setContextMenu(null);
        }
    };

    const navigateForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setCurrentPath(history[historyIndex + 1]);
            setSelectedItems([]);
            setContextMenu(null);
        }
    };

    // Get current folder contents
    const getCurrentItems = () => {
        // Filter items for the current path
        return mediaItems.filter(item => {
            // For root path, show only items directly in the root
            if (currentPath === '/') {
                return item.path.split('/').filter(Boolean).length === 1 || item.path === '/';
            }

            // For other paths, show items whose path starts with the current path
            // but exclude the current path itself and items in subdirectories
            const relativePath = item.path.startsWith(currentPath)
                ? item.path.slice(currentPath.length)
                : item.path;

            // Only include items directly in this directory (no additional slashes)
            return item.path.startsWith(currentPath) &&
                relativePath.startsWith('/') &&
                !relativePath.slice(1).includes('/') &&
                item.path !== currentPath;
        });
    };

    // Get folders and files separately
    const getCurrentFolders = () => {
        return getCurrentItems().filter(item => item.isDirectory);
    };

    const getCurrentFiles = () => {
        return getCurrentItems().filter(item => !item.isDirectory);
    };

    // Search and filter functionality
    const getFilteredItems = () => {
        let items = getCurrentItems();

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query)
            );
        }

        // Apply file type filter
        if (filterType && filterType !== 'all') {
            items = items.filter(item =>
                item.isDirectory || // Always include directories
                (item.type && item.type.startsWith(filterType))
            );
        }

        // Split into folders and files
        let folders = items.filter(item => item.isDirectory);
        let files = items.filter(item => !item.isDirectory);

        // Apply sorting
        const sortFiles = (a: MediaFile, b: MediaFile) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'type':
                    comparison = (a.type || '').localeCompare(b.type || '');
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        };

        folders = folders.sort(sortFiles);
        files = files.sort(sortFiles);

        return {folders, files};
    };

    // Selection handling
    const toggleItemSelection = (id: string, event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey) {
            // Multi-select with Ctrl/Cmd
            setSelectedItems(prev =>
                prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
            );
        } else {
            // Single select
            setSelectedItems(prev => prev.length === 1 && prev[0] === id ? [] : [id]);
        }
    };

    // Context menu handling
    const handleContextMenu = (event: React.MouseEvent, type: 'file' | 'folder' | 'background', id: string | null) => {
        event.preventDefault();

        // // If right-clicking on an unselected item, select it
        if (id && !selectedItems.includes(id)) {
            setSelectedItems([id]);
        }

        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            type,
            id
        });
    };

    // Close context menu when clicking elsewhere
    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Create new folder
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            setNotification({type: 'error', message: 'Folder name cannot be empty'});
            return;
        }

        try {
            const success = await mediaService.createDirectory(currentPath, newFolderName.trim());

            if (success) {
                // Reload the files to show the new folder
                const items = await mediaService.listMediaFiles(currentPath);
                setMediaItems(items);

                setNewFolderName('');
                setNewFolderDialogOpen(false);
                setNotification({type: 'success', message: `Folder "${newFolderName}" created successfully`});
            } else {
                setNotification({type: 'error', message: 'Failed to create folder'});
            }
        } catch (error) {
            console.error('Error creating folder:', error);
            setNotification({type: 'error', message: 'Failed to create folder'});
        }
    };

    // File upload handling
    const handleFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUploadFiles(Array.from(event.target.files));
            setUploadDialogOpen(true);
        }
    };

    const processUpload = async () => {
        if (uploadFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Set up upload options
            const uploadOptions = {
                optimize: true,
                maxWidth: 1920,  // Max width for image optimization
                maxHeight: 1080, // Max height for image optimization
                quality: 85      // Quality for image optimization (0-100)
            };

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + 5;
                    return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
                });
            }, 300);

            // Upload the files
            const result = await mediaService.uploadFiles(uploadFiles, currentPath, uploadOptions);

            // Clear progress interval
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Reload the files to show the new uploads
            const items = await mediaService.listMediaFiles(currentPath);
            setMediaItems(items);

            // Show success message
            setNotification({
                type: 'success',
                message: `${result.files.length} file(s) uploaded successfully${
                    result.errors && result.errors.length > 0
                        ? ` (${result.errors.length} failed)`
                        : ''
                }`
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            setNotification({type: 'error', message: 'Failed to upload files'});
        } finally {
            setIsUploading(false);
            setUploadDialogOpen(false);
            setUploadFiles([]);
        }
    };

    // File operations

    // Copy selected items to clipboard
    const copySelectedItems = () => {
        if (selectedItems.length === 0) return;

        const itemsToCopy = mediaItems.filter(item => selectedItems.includes(item.id));
        setClipboard({
            items: itemsToCopy,
            operation: 'copy'
        });

        setNotification({
            type: 'success',
            message: `${itemsToCopy.length} item(s) copied to clipboard`
        });
    };

    // Cut selected items to clipboard
    const cutSelectedItems = () => {
        if (selectedItems.length === 0) return;

        const itemsToCut = mediaItems.filter(item => selectedItems.includes(item.id));
        setClipboard({
            items: itemsToCut,
            operation: 'cut'
        });

        setNotification({
            type: 'success',
            message: `${itemsToCut.length} item(s) cut to clipboard`
        });
    };

    // Paste items from clipboard to current directory
    const pasteItems = async () => {
        if (clipboard.items.length === 0 || !clipboard.operation) return;

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const item of clipboard.items) {
                try {
                    if (clipboard.operation === 'copy') {
                        await mediaService.copyMedia(item.path, currentPath);
                    } else if (clipboard.operation === 'cut') {
                        await mediaService.moveMedia(item.path, currentPath);
                    }
                    successCount++;
                } catch (err) {
                    console.error(`Error ${clipboard.operation === 'copy' ? 'copying' : 'moving'} item ${item.path}:`, err);
                    errorCount++;
                }
            }

            // If operation was cut, clear the clipboard after successful paste
            if (clipboard.operation === 'cut' && successCount > 0) {
                setClipboard({items: [], operation: null});
            }

            // Reload the files to reflect the changes
            const items = await mediaService.listMediaFiles(currentPath);
            setMediaItems(items);

            // Show notification
            if (successCount > 0) {
                setNotification({
                    type: 'success',
                    message: `${successCount} item(s) ${clipboard.operation === 'copy' ? 'copied' : 'moved'} successfully${
                        errorCount > 0 ? ` (${errorCount} failed)` : ''
                    }`
                });
            } else if (errorCount > 0) {
                setNotification({
                    type: 'error',
                    message: `Failed to ${clipboard.operation === 'copy' ? 'copy' : 'move'} items`
                });
            }
        } catch (error) {
            console.error(`Error ${clipboard.operation === 'copy' ? 'copying' : 'moving'} items:`, error);
            setNotification({
                type: 'error',
                message: `Failed to ${clipboard.operation === 'copy' ? 'copy' : 'move'} items`
            });
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
        setDraggedItem(id);
    };

    const handleDragOver = (e: React.DragEvent, id: string, isDirectory: boolean) => {
        e.preventDefault();
        // Only allow dropping on directories
        if (isDirectory && id !== draggedItem) {
            setDropTarget(id);
        }
    };

    const handleDragLeave = () => {
        setDropTarget(null);
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('text/plain');

        // Reset drag and drop state
        setDraggedItem(null);
        setDropTarget(null);

        // Don't do anything if dropping on itself
        if (sourceId === targetId) return;

        // Find the source and target items
        const sourceItem = mediaItems.find(item => item.id === sourceId);
        const targetItem = mediaItems.find(item => item.id === targetId && item.isDirectory);

        if (!sourceItem || !targetItem) return;

        try {
            // Move the source item to the target directory
            await mediaService.moveMedia(sourceItem.path, targetItem.path);

            // Reload the files to reflect the changes
            const items = await mediaService.listMediaFiles(currentPath);
            setMediaItems(items);

            setNotification({
                type: 'success',
                message: `${sourceItem.name} moved to ${targetItem.name}`
            });
        } catch (error) {
            console.error('Error moving item:', error);
            setNotification({
                type: 'error',
                message: 'Failed to move item'
            });
        }
    };

    // Compress selected items into a zip file
    const compressSelectedItems = async () => {
        if (selectedItems.length === 0) return;

        // TODO: Implement compression functionality
        // This would require adding a new API endpoint for compression

        setNotification({
            type: 'error',
            message: 'Compression functionality not implemented yet'
        });
    };

    // Extract a zip file
    const extractZipFile = async (fileId: string) => {
        const file = mediaItems.find(item => item.id === fileId);
        if (!file || !file.type || !file.type.includes('zip')) return;

        // TODO: Implement extraction functionality
        // This would require adding a new API endpoint for extraction

        setNotification({
            type: 'error',
            message: 'Extraction functionality not implemented yet'
        });
    };

    // Trash management functions

    // Delete selected items (move to trash)
    const deleteSelectedItems = async () => {
        if (selectedItems.length === 0) return;

        try {
            // Find the selected items in the mediaItems array
            const itemsToDelete = mediaItems.filter(item => selectedItems.includes(item.id));
            let successCount = 0;
            let errorCount = 0;

            // Move each item to trash
            for (const item of itemsToDelete) {
                try {
                    const success = await mediaService.moveToTrash(item.path);
                    if (success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    console.error(`Error moving item ${item.path} to trash:`, err);
                    errorCount++;
                }
            }

            // Reload the files to reflect the changes
            const items = await mediaService.listMediaFiles(currentPath);
            setMediaItems(items);

            // Clear selection
            setSelectedItems([]);

            // Show notification
            if (successCount > 0) {
                setNotification({
                    type: 'success',
                    message: `${successCount} item(s) moved to trash${
                        errorCount > 0 ? ` (${errorCount} failed)` : ''
                    }`
                });
            } else if (errorCount > 0) {
                setNotification({
                    type: 'error',
                    message: 'Failed to move items to trash'
                });
            }
        } catch (error) {
            console.error('Error deleting items:', error);
            setNotification({type: 'error', message: 'Failed to move items to trash'});
        }
    };

    // Restore items from trash
    const restoreFromTrash = async (filenames: string[]) => {
        if (filenames.length === 0) return;

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const filename of filenames) {
                try {
                    const success = await mediaService.restoreFromTrash(filename);
                    if (success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    console.error(`Error restoring item ${filename} from trash:`, err);
                    errorCount++;
                }
            }

            // Reload the trash items to reflect the changes
            const items = await mediaService.listTrash();
            setTrashItems(items);

            // Clear selection
            setSelectedItems([]);

            // Show notification
            if (successCount > 0) {
                setNotification({
                    type: 'success',
                    message: `${successCount} item(s) restored from trash${
                        errorCount > 0 ? ` (${errorCount} failed)` : ''
                    }`
                });
            } else if (errorCount > 0) {
                setNotification({
                    type: 'error',
                    message: 'Failed to restore items from trash'
                });
            }
        } catch (error) {
            console.error('Error restoring items from trash:', error);
            setNotification({type: 'error', message: 'Failed to restore items from trash'});
        }
    };

    // Permanently delete items from trash
    const deleteFromTrash = async (filenames: string[]) => {
        if (filenames.length === 0) return;

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const filename of filenames) {
                try {
                    const success = await mediaService.deleteFromTrash(filename);
                    if (success) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (err) {
                    console.error(`Error deleting item ${filename} from trash:`, err);
                    errorCount++;
                }
            }

            // Reload the trash items to reflect the changes
            const items = await mediaService.listTrash();
            setTrashItems(items);

            // Clear selection
            setSelectedItems([]);

            // Show notification
            if (successCount > 0) {
                setNotification({
                    type: 'success',
                    message: `${successCount} item(s) permanently deleted${
                        errorCount > 0 ? ` (${errorCount} failed)` : ''
                    }`
                });
            } else if (errorCount > 0) {
                setNotification({
                    type: 'error',
                    message: 'Failed to delete items from trash'
                });
            }
        } catch (error) {
            console.error('Error deleting items from trash:', error);
            setNotification({type: 'error', message: 'Failed to delete items from trash'});
        }
    };

    // Empty the trash (delete all items)
    const emptyTrash = async () => {
        try {
            const success = await mediaService.emptyTrash();

            if (success) {
                // Reload the trash items to reflect the changes
                const items = await mediaService.listTrash();
                setTrashItems(items);

                setNotification({
                    type: 'success',
                    message: 'Trash emptied successfully'
                });
            } else {
                setNotification({
                    type: 'error',
                    message: 'Failed to empty trash'
                });
            }
        } catch (error) {
            console.error('Error emptying trash:', error);
            setNotification({type: 'error', message: 'Failed to empty trash'});
        }
    };

    // Render trash items
    const renderTrashItems = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600"/>
                    <span className="ml-2 text-gray-600">Loading trash...</span>
                </div>
            );
        }

        if (trashItems.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Trash2 className="w-12 h-12 mb-4 text-gray-400"/>
                    <p>Trash is empty</p>
                    <button
                        onClick={() => setShowTrash(false)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2"/>
                        Back to Media
                    </button>
                </div>
            );
        }

        return (
            <div
                className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
                {trashItems.map(item => {
                    const FileIcon = item.isDirectory ? FolderPlus : getFileIcon(item.name.split('.').pop() || '');
                    const isSelected = selectedItems.includes(item.name);

                    return (
                        <div
                            key={item.name}
                            className={`${
                                viewMode === 'grid'
                                    ? 'bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none'
                                    : 'bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none flex items-center'
                            } ${isSelected ? 'ring-2 ring-blue-500 border-blue-400' : ''}`}
                            onClick={() => setSelectedItems(prev =>
                                prev.includes(item.name)
                                    ? prev.filter(name => name !== item.name)
                                    : [...prev, item.name]
                            )}
                        >
                            {viewMode === 'grid' ? (
                                <>
                                    <div className="flex justify-center mb-3">
                                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                            item.isDirectory ? 'bg-blue-50' : 'bg-gray-100'
                                        }`}>
                                            <FileIcon className={`w-8 h-8 ${
                                                item.isDirectory ? 'text-blue-500' : 'text-gray-500'
                                            }`}/>
                                        </div>
                                    </div>
                                    <p className="text-center text-sm font-medium text-gray-700 truncate">{item.name}</p>
                                    <p className="text-center text-xs text-gray-500 mt-1">
                                        {formatFileSize(item.size)} • {new Date(item.deletedAt).toLocaleDateString()}
                                    </p>

                                    {isSelected && (
                                        <div className="flex justify-center mt-2 space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    restoreFromTrash([item.name]);
                                                }}
                                                className="p-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                                                title="Restore"
                                            >
                                                <ArrowLeft className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteFromTrash([item.name]);
                                                }}
                                                className="p-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                                                title="Delete permanently"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                        item.isDirectory ? 'bg-blue-50' : 'bg-gray-100'
                                    }`}>
                                        <FileIcon className={`w-5 h-5 ${
                                            item.isDirectory ? 'text-blue-500' : 'text-gray-500'
                                        }`}/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(item.size)} • {new Date(item.deletedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    restoreFromTrash([item.name]);
                                                }}
                                                className="p-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                                                title="Restore"
                                            >
                                                <ArrowLeft className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteFromTrash([item.name]);
                                                }}
                                                className="p-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                                                title="Delete permanently"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // View file details
    const viewFileDetails = (fileId: string) => {
        const file = mediaItems.find(item => item.id === fileId && !item.isDirectory);
        if (file) {
            setSelectedFileDetails(file);
            setFileDetailsOpen(true);
        }
    };

    // Render file/folder items
    const renderItems = () => {
        if (showTrash) {
            return renderTrashItems();
        }

        const {folders: filteredFolders, files: filteredFiles} = getFilteredItems();

        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600"/>
                    <span className="ml-2 text-gray-600">Loading files...</span>
                </div>
            );
        }

        if (filteredFolders.length === 0 && filteredFiles.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    {searchQuery ? (
                        <>
                            <Search className="w-12 h-12 mb-4 text-gray-400"/>
                            <p>No results found for "{searchQuery}"</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 text-blue-600 hover:text-blue-800"
                            >
                                Clear search
                            </button>
                        </>
                    ) : (
                        <>
                            <FolderPlus className="w-12 h-12 mb-4 text-gray-400"/>
                            <p>This folder is empty</p>
                            <div className="flex mt-4 space-x-4">
                                <button
                                    onClick={() => setNewFolderDialogOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                >
                                    <FolderPlus className="w-4 h-4 mr-2"/>
                                    New Folder
                                </button>
                                <button
                                    onClick={handleFileUpload}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                >
                                    <Upload className="w-4 h-4 mr-2"/>
                                    Upload Files
                                </button>
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return (
            <div
                className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}`}>
                {filteredFolders.map(folder => (
                    <div
                        key={folder.id}
                        className={`${
                            viewMode === 'grid'
                                ? 'bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none'
                                : 'bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none flex items-center'
                        } ${selectedItems.includes(folder.id) ? 'ring-2 ring-blue-500 border-blue-400' : ''}
            ${dropTarget === folder.id ? 'ring-2 ring-green-500 border-green-400 bg-green-50' : ''}`}
                        onClick={(e) => toggleItemSelection(folder.id, e)}
                        onDoubleClick={() => navigateTo(folder.path)}
                        onContextMenu={(e) => {
                            e.stopPropagation()
                            handleContextMenu(e, 'folder', folder.id)
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, folder.id)}
                        onDragOver={(e) => handleDragOver(e, folder.id, true)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, folder.id)}
                    >
                        {viewMode === 'grid' ? (
                            <>
                                <div className="flex justify-center mb-3">
                                    <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <FolderPlus className="w-8 h-8 text-blue-500"/>
                                    </div>
                                </div>
                                <p className="text-center text-sm font-medium text-gray-700 truncate">{folder.name}</p>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                                    <FolderPlus className="w-5 h-5 text-blue-500"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{folder.name}</p>
                                    <p className="text-xs text-gray-500">Folder</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400"/>
                            </>
                        )}
                    </div>
                ))}

                {filteredFiles.map(file => {
                    //@ts-ignore
                    const FileIcon = getFileIcon(file.type);
                    //@ts-ignore
                    const isImage = file.type.startsWith('image');

                    return (
                        <div
                            key={file.id}
                            className={`${
                                viewMode === 'grid'
                                    ? 'bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none'
                                    : 'bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none flex items-center'
                            } ${selectedItems.includes(file.id) ? 'ring-2 ring-blue-500 border-blue-400' : ''}
              ${draggedItem === file.id ? 'opacity-50' : ''}`}
                            onClick={(e) => toggleItemSelection(file.id, e)}
                            onDoubleClick={() => viewFileDetails(file.id)}
                            onContextMenu={(e) => {
                                e.stopPropagation()
                                handleContextMenu(e, 'file', file.id)
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, file.id)}
                        >
                            {viewMode === 'grid' ? (
                                <>
                                    <div className="flex justify-center mb-3">
                                        {isImage ? (
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <FileIcon className="w-8 h-8 text-gray-500"/>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-center text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                    <p className="text-center text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                                </>
                            ) : (
                                <>
                                    {isImage ? (
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-3">
                                            <img
                                                src={file.url}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg==';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                            <FileIcon className="w-5 h-5 text-gray-500"/>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {new Date(file.modified).toLocaleDateString()}</p>
                                    </div>
                                    <Info className="w-5 h-5 text-gray-400"/>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render context menu
    const renderContextMenu = () => {
        if (!contextMenu) return null;

        const {x, y, type, id} = contextMenu;

        // Helper function to group menu items
        const createMenuGroup = (items: any[]) => {
            return items.map(item => ({
                ...item,
                className: item.className || ''
            }));
        };

        // Define menu items based on context type
        const menuItems = (() => {
            if (type === 'background') {
                return [
                    createMenuGroup([
                        {
                            label: 'View',
                            icon: Grid,
                            action: () => {
                            },
                            disabled: true,
                            className: 'font-medium text-gray-700'
                        },
                    ]),
                    createMenuGroup([
                        {
                            label: 'Sort by',
                            icon: ArrowRight,
                            action: () => {
                            },
                            disabled: true,
                            className: 'font-medium text-gray-700'
                        },
                    ]),
                    createMenuGroup([
                        {
                            label: 'New Folder',
                            icon: FolderPlus,
                            action: () => setNewFolderDialogOpen(true),
                            iconColor: 'text-blue-500'
                        },
                        {
                            label: 'Upload Files',
                            icon: Upload,
                            action: handleFileUpload,
                            iconColor: 'text-green-500'
                        },
                    ]),
                    createMenuGroup([
                        {
                            label: 'Paste',
                            icon: Copy,
                            action: pasteItems,
                            disabled: clipboard.items.length === 0 || !clipboard.operation,
                            iconColor: 'text-indigo-500'
                        },
                    ]),
                    createMenuGroup([
                        {
                            label: 'Select All',
                            icon: Check,
                            action: () => {
                                const allIds = getCurrentItems().map(item => item.id);
                                setSelectedItems(allIds);
                            },
                            iconColor: 'text-gray-500'
                        },
                    ]),
                ].flat();
            }

            if (type === 'folder') {

                const folder = mediaItems.find(item => item.id === id && item.isDirectory);

                return [
                    createMenuGroup([
                        {
                            label: 'Open',
                            icon: FolderPlus,
                            action: () => {
                                if (folder) navigateTo(folder.path);
                            },
                            iconColor: 'text-blue-500'
                        },
                    ]),
                    createMenuGroup([
                        {
                            label: 'Copy',
                            icon: Copy,
                            action: copySelectedItems,
                            iconColor: 'text-indigo-500'
                        },
                        {
                            label: 'Cut',
                            icon: Scissors,
                            action: cutSelectedItems,
                            iconColor: 'text-orange-500'
                        },
                    ]),
                    createMenuGroup([
                        {
                            label: 'Compress',
                            icon: Save,
                            action: compressSelectedItems,
                            iconColor: 'text-yellow-500'
                        },
                    ]),
                    createMenuGroup([
                        {
                            label: 'Move to Trash',
                            icon: Trash2,
                            action: deleteSelectedItems,
                            iconColor: 'text-red-500'
                        },
                    ]),
                ].flat();
            }

            // File context menu
            const file = mediaItems.find(item => item.id === id && !item.isDirectory);
            const isZip = file?.type?.includes('zip') || file?.name.endsWith('.zip');

            return [
                createMenuGroup([
                    {
                        label: 'View Details',
                        icon: Info,
                        action: () => {
                            if (id) viewFileDetails(id);
                        },
                        iconColor: 'text-blue-500'
                    },
                    {
                        label: 'Download',
                        icon: Download,
                        action: () => {
                            if (file && file.url) {
                                window.open(file.url, '_blank');
                            }
                        },
                        iconColor: 'text-green-500'
                    },
                ]),
                createMenuGroup([
                    {
                        label: 'Copy',
                        icon: Copy,
                        action: copySelectedItems,
                        iconColor: 'text-indigo-500'
                    },
                    {
                        label: 'Cut',
                        icon: Scissors,
                        action: cutSelectedItems,
                        iconColor: 'text-orange-500'
                    },
                ]),
                isZip ? createMenuGroup([
                    {
                        label: 'Extract Here',
                        icon: FileText,
                        action: () => extractZipFile(id || ''),
                        iconColor: 'text-yellow-500'
                    },
                ]) : createMenuGroup([
                    {
                        label: 'Compress',
                        icon: Save,
                        action: compressSelectedItems,
                        iconColor: 'text-yellow-500'
                    },
                ]),
                createMenuGroup([
                    {
                        label: 'Move to Trash',
                        icon: Trash2,
                        action: deleteSelectedItems,
                        iconColor: 'text-red-500'
                    },
                ]),
            ].flat();
        })();

        return (
            <div
                className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 overflow-hidden w-64"
                style={{
                    left: x,
                    top: y,
                    // Ensure menu doesn't go off screen
                    transform: `translate(${x + 260 > window.innerWidth ? -260 : 0}px, ${y + menuItems.length * 36 > window.innerHeight ? -menuItems.length * 36 : 0}px)`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {menuItems.map((item, index) => {
                    // Check if this is the first item of a group
                    const isFirstInGroup = index === 0 || menuItems[index - 1].className !== item.className;
                    // Add a divider before groups (except the first group)
                    const showDivider = isFirstInGroup && index > 0;

                    return (
                        <React.Fragment key={index}>
                            {showDivider && <div className="border-t border-gray-200 my-1"></div>}
                            <button
                                className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100 ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${item.className}`}
                                onClick={() => {
                                    if (!item.disabled) {
                                        item.action();
                                        setContextMenu(null);
                                    }
                                }}
                                disabled={item.disabled}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${item.iconColor || 'text-gray-600'}`}/>
                                {item.label}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            className="space-y-6"
            onContextMenu={(e) => handleContextMenu(e, 'background', null)}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {showTrash ? 'Trash' : 'Media Library'}
                    </h1>
                    <p className="text-gray-600">
                        {showTrash
                            ? 'Recover or permanently delete files from trash'
                            : 'Manage and organize your media files'}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {showTrash ? (
                        <>
                            <button
                                onClick={() => setShowTrash(false)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2"/>
                                Back to Media
                            </button>

                            {trashItems.length > 0 && (
                                <button
                                    onClick={emptyTrash}
                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    Empty Trash
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setNewFolderDialogOpen(true)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <FolderPlus className="w-4 h-4 mr-2"/>
                                New Folder
                            </button>

                            <button
                                onClick={handleFileUpload}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Upload className="w-4 h-4 mr-2"/>
                                Upload
                            </button>

                            <button
                                onClick={() => setShowTrash(true)}
                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Trash2 className="w-4 h-4 mr-2"/>
                                Trash
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInputChange}
                                className="hidden"
                                multiple
                            />
                        </>
                    )}
                </div>
            </div>

            {/* File Browser */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div
                    className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    {/* Navigation Controls */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={navigateBack}
                            disabled={historyIndex <= 0}
                            className={`p-1.5 rounded-md ${historyIndex <= 0 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
                            title="Back"
                        >
                            <ArrowLeft className="w-5 h-5"/>
                        </button>

                        <button
                            onClick={navigateForward}
                            disabled={historyIndex >= history.length - 1}
                            className={`p-1.5 rounded-md ${historyIndex >= history.length - 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
                            title="Forward"
                        >
                            <ArrowRight className="w-5 h-5"/>
                        </button>

                        <button
                            onClick={() => navigateTo('/')}
                            className="p-1.5 rounded-md text-gray-700 hover:bg-gray-200"
                            title="Home"
                        >
                            <Home className="w-5 h-5"/>
                        </button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center">
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.path} className="flex items-center">
                                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1"/>}
                                    <button
                                        onClick={() => navigateTo(crumb.path)}
                                        className={`px-2 py-1 rounded-md text-sm ${
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

                    {/* Search, Filter, and View Controls */}
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                            />
                            <Search
                                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600"/>
                                </button>
                            )}
                        </div>

                        {/* File Type Filter */}
                        <select
                            value={filterType || 'all'}
                            onChange={(e) => setFilterType(e.target.value === 'all' ? null : e.target.value)}
                            className="py-1.5 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Files</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="audio">Audio</option>
                            <option value="application/pdf">PDFs</option>
                            <option value="text">Text</option>
                            <option value="application/zip">Archives</option>
                        </select>

                        {/* Sort Controls */}
                        <div className="flex items-center space-x-1">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size' | 'type')}
                                className="py-1.5 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="name">Name</option>
                                <option value="date">Date</option>
                                <option value="size">Size</option>
                                <option value="type">Type</option>
                            </select>

                            <button
                                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-1.5 rounded-md border border-gray-300 hover:bg-gray-100"
                                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                            >
                                {sortDirection === 'asc' ?
                                    <ArrowRight className="w-4 h-4 rotate-90"/> :
                                    <ArrowRight className="w-4 h-4 -rotate-90"/>
                                }
                            </button>
                        </div>

                        <div className="flex items-center bg-gray-200 rounded-md p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                                title="Grid view"
                            >
                                <Grid className="w-4 h-4"/>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                                title="List view"
                            >
                                <List className="w-4 h-4"/>
                            </button>
                        </div>

                        {selectedItems.length > 0 && (
                            <button
                                onClick={deleteSelectedItems}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4 mr-1"/>
                                Move to Trash
                            </button>
                        )}
                    </div>
                </div>

                {/* File/Folder Grid */}
                <div className="p-6">
                    {renderItems()}
                </div>
            </div>

            {/* Context Menu */}
            {renderContextMenu()}

            {/* New Folder Dialog */}
            {newFolderDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
                        <div className="mb-4">
                            <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                                Folder Name
                            </label>
                            <input
                                type="text"
                                id="folderName"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter folder name"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setNewFolderName('');
                                    setNewFolderDialogOpen(false);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Dialog */}
            {uploadDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Selected {uploadFiles.length} file(s) to upload
                                to {currentPath === '/' ? 'root' : currentPath}
                            </p>

                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                                {uploadFiles.map((file, index) => {
                                    return (
                                        <div key={index}
                                             className="flex items-center py-1 border-b border-gray-100 last:border-0">
                                            <div
                                                className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                                                {(() => {
                                                    const FileIcon = getFileIcon(file.type);
                                                    return <FileIcon className="w-4 h-4 text-gray-500"/>;
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {isUploading && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">Uploading...</span>
                                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{width: `${uploadProgress}%`}}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setUploadFiles([]);
                                    setUploadDialogOpen(false);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={processUpload}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin"/>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2"/>
                                        Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Details Dialog */}
            {fileDetailsOpen && selectedFileDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">File Details</h3>
                            <button
                                onClick={() => setFileDetailsOpen(false)}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Preview */}
                            <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[200px]">
                                {selectedFileDetails.type?.startsWith('image') ? (
                                    <img
                                        src={selectedFileDetails.url}
                                        alt={selectedFileDetails.name}
                                        className="max-w-full max-h-[300px] object-contain"
                                    />
                                ) : (
                                    <div className="text-center">
                                        {(() => {
                                            const FileIcon = getFileIcon(selectedFileDetails.type || '');
                                            return <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-2"/>;
                                        })()}
                                        <p className="text-sm text-gray-500">No preview available</p>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-4">{selectedFileDetails.name}</h4>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 text-sm">
                                        <span className="text-gray-500">Type</span>
                                        <span
                                            className="col-span-2 text-gray-900">{selectedFileDetails.type || 'Unknown'}</span>
                                    </div>

                                    <div className="grid grid-cols-3 text-sm">
                                        <span className="text-gray-500">Size</span>
                                        <span
                                            className="col-span-2 text-gray-900">{formatFileSize(selectedFileDetails.size)}</span>
                                    </div>

                                    {selectedFileDetails.dimensions && (
                                        <div className="grid grid-cols-3 text-sm">
                                            <span className="text-gray-500">Dimensions</span>
                                            <span className="col-span-2 text-gray-900">
                        {selectedFileDetails.dimensions.width} × {selectedFileDetails.dimensions.height}
                      </span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 text-sm">
                                        <span className="text-gray-500">Created</span>
                                        <span className="col-span-2 text-gray-900">
                      {selectedFileDetails.created instanceof Date
                          ? selectedFileDetails.created.toLocaleString()
                          : new Date(selectedFileDetails.created).toLocaleString()}
                    </span>
                                    </div>

                                    <div className="grid grid-cols-3 text-sm">
                                        <span className="text-gray-500">Modified</span>
                                        <span className="col-span-2 text-gray-900">
                      {selectedFileDetails.modified instanceof Date
                          ? selectedFileDetails.modified.toLocaleString()
                          : new Date(selectedFileDetails.modified).toLocaleString()}
                    </span>
                                    </div>

                                    <div className="grid grid-cols-3 text-sm">
                                        <span className="text-gray-500">Path</span>
                                        <span className="col-span-2 text-gray-900 break-all">
                      {selectedFileDetails.path}
                    </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex space-x-3">
                                    <a
                                        href={selectedFileDetails.url}
                                        download={selectedFileDetails.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                                    >
                                        <Download className="w-4 h-4 mr-2"/>
                                        Download
                                    </a>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedFileDetails.path);
                                            setNotification({type: 'success', message: 'Path copied to clipboard'});
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <Copy className="w-4 h-4 mr-2"/>
                                        Copy Path
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div
                    className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 ${
                        notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? (
                        <Check className="w-5 h-5 text-green-500"/>
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-500"/>
                    )}
                    <p>{notification.message}</p>
                    <button
                        onClick={() => setNotification(null)}
                        className="p-1 rounded-md hover:bg-white hover:bg-opacity-20"
                    >
                        <X className="w-4 h-4"/>
                    </button>
                </div>
            )}
        </div>
    );
}
