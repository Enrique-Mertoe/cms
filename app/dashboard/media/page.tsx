'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
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
import { MediaFile } from '@/src/lib/services/media-service';

// File type helpers
const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
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
  const { data: session } = useSession();
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'file' | 'folder' | 'background'; id: string | null } | null>(null);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileDetailsOpen, setFileDetailsOpen] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState<MediaFile | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([{ name: 'Media', path: '/' }]);
  const [history, setHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const items = await mediaService.listMediaFiles(currentPath);
        setMediaItems(items);
      } catch (error) {
        console.error('Error loading media files:', error);
        setNotification({ 
          type: 'error', 
          message: 'Failed to load media files. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPath]);

  // Update breadcrumbs when path changes
  useEffect(() => {
    if (currentPath === '/') {
      setBreadcrumbs([{ name: 'Media', path: '/' }]);
      return;
    }

    const pathParts = currentPath.split('/').filter(Boolean);
    const breadcrumbItems = [{ name: 'Media', path: '/' }];
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

  // Search functionality
  const getFilteredItems = () => {
    const items = getCurrentItems();

    if (!searchQuery) {
      return {
        folders: items.filter(item => item.isDirectory),
        files: items.filter(item => !item.isDirectory)
      };
    }

    const query = searchQuery.toLowerCase();
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(query)
    );

    return {
      folders: filteredItems.filter(item => item.isDirectory),
      files: filteredItems.filter(item => !item.isDirectory)
    };
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

    // If right-clicking on an unselected item, select it
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
      setNotification({ type: 'error', message: 'Folder name cannot be empty' });
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
        setNotification({ type: 'success', message: `Folder "${newFolderName}" created successfully` });
      } else {
        setNotification({ type: 'error', message: 'Failed to create folder' });
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setNotification({ type: 'error', message: 'Failed to create folder' });
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
      setNotification({ type: 'error', message: 'Failed to upload files' });
    } finally {
      setIsUploading(false);
      setUploadDialogOpen(false);
      setUploadFiles([]);
    }
  };

  // Delete selected items
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
      setNotification({ type: 'error', message: 'Failed to move items to trash' });
    }
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
    const { folders: filteredFolders, files: filteredFiles } = getFilteredItems();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading files...</span>
        </div>
      );
    }

    if (filteredFolders.length === 0 && filteredFiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          {searchQuery ? (
            <>
              <Search className="w-12 h-12 mb-4 text-gray-400" />
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
              <FolderPlus className="w-12 h-12 mb-4 text-gray-400" />
              <p>This folder is empty</p>
              <div className="flex mt-4 space-x-4">
                <button 
                  onClick={() => setNewFolderDialogOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </button>
                <button 
                  onClick={handleFileUpload}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}`}>
        {filteredFolders.map(folder => (
          <div
            key={folder.id}
            className={`${
              viewMode === 'grid'
                ? 'bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none'
                : 'bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none flex items-center'
            } ${selectedItems.includes(folder.id) ? 'ring-2 ring-blue-500 border-blue-400' : ''}`}
            onClick={(e) => toggleItemSelection(folder.id, e)}
            onDoubleClick={() => navigateTo(folder.path)}
            onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FolderPlus className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-700 truncate">{folder.name}</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <FolderPlus className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{folder.name}</p>
                  <p className="text-xs text-gray-500">Folder</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </>
            )}
          </div>
        ))}

        {filteredFiles.map(file => {
          const FileIcon = getFileIcon(file.type);
          const isImage = file.type.startsWith('image/');

          return (
            <div
              key={file.id}
              className={`${
                viewMode === 'grid'
                  ? 'bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none'
                  : 'bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-none flex items-center'
              } ${selectedItems.includes(file.id) ? 'ring-2 ring-blue-500 border-blue-400' : ''}`}
              onClick={(e) => toggleItemSelection(file.id, e)}
              onDoubleClick={() => viewFileDetails(file.id)}
              onContextMenu={(e) => handleContextMenu(e, 'file', file.id)}
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
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-8 h-8 text-gray-500" />
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
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <FileIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {new Date(file.modified).toLocaleDateString()}</p>
                  </div>
                  <Info className="w-5 h-5 text-gray-400" />
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

    const { x, y, type, id } = contextMenu;

    const menuItems = (() => {
      if (type === 'background') {
        return [
          { label: 'New Folder', icon: FolderPlus, action: () => setNewFolderDialogOpen(true) },
          { label: 'Upload Files', icon: Upload, action: handleFileUpload },
          { label: 'Paste', icon: Copy, action: () => {}, disabled: true },
        ];
      }

      if (type === 'folder') {
        return [
          { label: 'Open', icon: FolderPlus, action: () => {
            const folder = mediaItems.find(item => item.id === id && item.isDirectory);
            if (folder) navigateTo(folder.path);
          }},
          { label: 'Rename', icon: Edit, action: () => {
            // TODO: Implement rename functionality
          }, disabled: true },
          { label: 'Delete', icon: Trash2, action: deleteSelectedItems },
        ];
      }

      // File context menu
      return [
        { label: 'View Details', icon: Info, action: () => {
          if (id) viewFileDetails(id);
        }},
        { label: 'Download', icon: Download, action: () => {
          const file = mediaItems.find(item => item.id === id && !item.isDirectory);
          if (file && file.url) {
            window.open(file.url, '_blank');
          }
        }},
        { label: 'Rename', icon: Edit, action: () => {
          // TODO: Implement rename functionality
        }, disabled: true },
        { label: 'Copy', icon: Copy, action: () => {
          // TODO: Implement copy functionality
        }, disabled: true },
        { label: 'Cut', icon: Scissors, action: () => {
          // TODO: Implement cut functionality
        }, disabled: true },
        { label: 'Delete', icon: Trash2, action: deleteSelectedItems },
      ];
    })();

    return (
      <div 
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        style={{ 
          left: x, 
          top: y,
          maxWidth: '200px',
          // Ensure menu doesn't go off screen
          transform: `translate(${x + 200 > window.innerWidth ? -200 : 0}px, ${y + menuItems.length * 36 > window.innerHeight ? -menuItems.length * 36 : 0}px)`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100 ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                setContextMenu(null);
              }
            }}
            disabled={item.disabled}
          >
            <item.icon className="w-4 h-4 mr-2 text-gray-600" />
            {item.label}
          </button>
        ))}
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
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage and organize your media files</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setNewFolderDialogOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </button>

          <button
            onClick={handleFileUpload}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            multiple
          />
        </div>
      </div>

      {/* File Browser */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={navigateBack}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded-md ${historyIndex <= 0 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={navigateForward}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded-md ${historyIndex >= history.length - 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'}`}
              title="Forward"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigateTo('/')}
              className="p-1.5 rounded-md text-gray-700 hover:bg-gray-200"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />}
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

          {/* Search and View Controls */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-gray-200 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-700 hover:bg-gray-300'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {selectedItems.length > 0 && (
              <button
                onClick={deleteSelectedItems}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
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
                Selected {uploadFiles.length} file(s) to upload to {currentPath === '/' ? 'root' : currentPath}
              </p>

              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                {uploadFiles.map((file, index) => {
                  return (
                    <div key={index} className="flex items-center py-1 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                        {(() => {
                          const FileIcon = getFileIcon(file.type);
                          return <FileIcon className="w-4 h-4 text-gray-500" />;
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
                    style={{ width: `${uploadProgress}%` }}
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
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
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
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[200px]">
                {selectedFileDetails.type?.startsWith('image/') ? (
                  <img 
                    src={selectedFileDetails.url} 
                    alt={selectedFileDetails.name}
                    className="max-w-full max-h-[300px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    {(() => {
                      const FileIcon = getFileIcon(selectedFileDetails.type || '');
                      return <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />;
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
                    <span className="col-span-2 text-gray-900">{selectedFileDetails.type || 'Unknown'}</span>
                  </div>

                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-gray-500">Size</span>
                    <span className="col-span-2 text-gray-900">{formatFileSize(selectedFileDetails.size)}</span>
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
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedFileDetails.path);
                      setNotification({ type: 'success', message: 'Path copied to clipboard' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
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
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <p>{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-md hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
