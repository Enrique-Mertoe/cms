/**
 * Media Service
 * 
 * Provides methods for interacting with the media API
 */

// Types
export interface FileDimensions {
  width: number;
  height: number;
}

export interface MediaFile {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  type?: string;
  extension?: string;
  dimensions?: FileDimensions;
  created: Date;
  modified: Date;
  url?: string;
}

export interface TrashItem {
  name: string;
  originalPath: string;
  deletedAt: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

export interface UploadOptions {
  optimize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

// API Methods

/**
 * List media files in a directory
 */
export async function listMediaFiles(directory: string = ''): Promise<MediaFile[]> {
  try {
    const response = await fetch(`/api/media?directory=${encodeURIComponent(directory)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list media files');
    }

    const data = await response.json();
    
    // Convert date strings to Date objects
    return data.items.map((item: any) => ({
      ...item,
      created: new Date(item.created),
      modified: new Date(item.modified),
      // Add URL for frontend use
      url: item.isDirectory ? undefined : `/media${item.path}`
    }));
  } catch (error) {
    console.error('Error listing media files:', error);
    throw error;
  }
}

/**
 * List items in the trash
 */
export async function listTrash(): Promise<TrashItem[]> {
  try {
    const response = await fetch('/api/media?trash=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list trash');
    }

    const data = await response.json();
    
    // Convert date strings to Date objects
    return data.items.map((item: any) => ({
      ...item,
      modified: new Date(item.modified)
    }));
  } catch (error) {
    console.error('Error listing trash:', error);
    throw error;
  }
}

/**
 * Create a new directory
 */
export async function createDirectory(directory: string, name: string): Promise<boolean> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createDirectory',
        directory,
        name
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create directory');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
}

/**
 * Rename a file or directory
 */
export async function renameMedia(path: string, newName: string): Promise<MediaFile> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'rename',
        path,
        newName
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to rename item');
    }

    const data = await response.json();
    return {
      ...data.item,
      url: `/media${data.item.path}`
    };
  } catch (error) {
    console.error('Error renaming item:', error);
    throw error;
  }
}

/**
 * Move a file or directory
 */
export async function moveMedia(sourcePath: string, destinationDir: string): Promise<MediaFile> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'move',
        sourcePath,
        destinationDir
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to move item');
    }

    const data = await response.json();
    return {
      ...data.item,
      url: `/media${data.item.path}`
    };
  } catch (error) {
    console.error('Error moving item:', error);
    throw error;
  }
}

/**
 * Copy a file or directory
 */
export async function copyMedia(sourcePath: string, destinationDir: string): Promise<MediaFile> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'copy',
        sourcePath,
        destinationDir
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to copy item');
    }

    const data = await response.json();
    return {
      ...data.item,
      url: `/media${data.item.path}`
    };
  } catch (error) {
    console.error('Error copying item:', error);
    throw error;
  }
}

/**
 * Move a file or directory to trash
 */
export async function moveToTrash(path: string): Promise<boolean> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'moveToTrash',
        path
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to move item to trash');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error moving item to trash:', error);
    throw error;
  }
}

/**
 * Restore a file from trash
 */
export async function restoreFromTrash(filename: string): Promise<boolean> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'restoreFromTrash',
        filename
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to restore item from trash');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error restoring item from trash:', error);
    throw error;
  }
}

/**
 * Delete a file from trash permanently
 */
export async function deleteFromTrash(filename: string): Promise<boolean> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteFromTrash',
        filename
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

/**
 * Empty the trash
 */
export async function emptyTrash(): Promise<boolean> {
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'emptyTrash'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to empty trash');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error emptying trash:', error);
    throw error;
  }
}

/**
 * Upload a single file
 */
export async function uploadFile(
  file: File, 
  directory: string = '',
  options: UploadOptions = {}
): Promise<MediaFile> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);
    
    if (options.optimize !== undefined) {
      formData.append('optimize', options.optimize.toString());
    }
    
    if (options.maxWidth) {
      formData.append('maxWidth', options.maxWidth.toString());
    }
    
    if (options.maxHeight) {
      formData.append('maxHeight', options.maxHeight.toString());
    }
    
    if (options.quality) {
      formData.append('quality', options.quality.toString());
    }
    
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const data = await response.json();
    
    return {
      ...data.file,
      created: new Date(data.file.created),
      modified: new Date(data.file.modified),
      url: `/media${data.file.path}`
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[], 
  directory: string = '',
  options: UploadOptions = {}
): Promise<{ files: MediaFile[], errors?: any[] }> {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    
    formData.append('directory', directory);
    
    if (options.optimize !== undefined) {
      formData.append('optimize', options.optimize.toString());
    }
    
    if (options.maxWidth) {
      formData.append('maxWidth', options.maxWidth.toString());
    }
    
    if (options.maxHeight) {
      formData.append('maxHeight', options.maxHeight.toString());
    }
    
    if (options.quality) {
      formData.append('quality', options.quality.toString());
    }
    
    const response = await fetch('/api/media/upload', {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload files');
    }

    const data = await response.json();
    
    const uploadedFiles = data.files.map((file: any) => ({
      ...file,
      created: new Date(file.created),
      modified: new Date(file.modified),
      url: `/media${file.path}`
    }));
    
    return {
      files: uploadedFiles,
      errors: data.errors
    };
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}