'use server';

import fs from 'fs/promises';
import path from 'path';
import {parse as parseToml, stringify as stringifyToml} from '@iarna/toml';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const CONFIG_DIR = path.join(DATA_DIR, 'config');
const CONTENT_DIR = path.join(DATA_DIR, 'content');
const MEDIA_DIR = path.join(process.cwd(), 'public/media');
const TRASH_DIR = path.join(MEDIA_DIR, '.trash');
// Hidden system settings directory - deep in the file structure for security
const SYSTEM_DIR = path.join(process.cwd(), '.system', '.config', '.settings');

// Cache for configuration files
const configCache = new Map<string, any>();
const contentCache = new Map<string, any>();
const systemCache = new Map<string, any>();

export async function readConfigFile(filename: string) {
    const cacheKey = `config:${filename}`;

    if (configCache.has(cacheKey)) {
        return configCache.get(cacheKey);
    }

    try {
        const filePath = path.join(CONFIG_DIR, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = parseToml(content);

        configCache.set(cacheKey, parsed);
        return parsed;
    } catch (error) {
        console.error(`Error reading config file ${filename}:`, error);
        return {};
    }
}

export async function writeConfigFile(filename: string, data: any) {
    try {
        const filePath = path.join(CONFIG_DIR, filename);
        const tomlContent = stringifyToml(data);
        await fs.writeFile(filePath, tomlContent, 'utf-8');

        // Update cache
        const cacheKey = `config:${filename}`;
        configCache.set(cacheKey, data);

        return true;
    } catch (error) {
        console.error(`Error writing config file ${filename}:`, error);
        return false;
    }
}

export async function readContentFile(type: string, filename: string) {
    const cacheKey = `content:${type}:${filename}`;

    if (contentCache.has(cacheKey)) {
        return contentCache.get(cacheKey);
    }

    try {
        const filePath = path.join(CONTENT_DIR, type, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = parseToml(content);

        contentCache.set(cacheKey, parsed);
        return parsed;
    } catch (error) {
        console.error(`Error reading content file ${type}/${filename}:`, error);
        return {};
    }
}

export async function writeContentFile(type: string, filename: string, data: any) {
    try {
        const filePath = path.join(CONTENT_DIR, type, filename);
        const tomlContent = stringifyToml(data);
        await fs.writeFile(filePath, tomlContent, 'utf-8');

        // Update cache
        const cacheKey = `content:${type}:${filename}`;
        contentCache.set(cacheKey, data);

        return true;
    } catch (error) {
        console.error(`Error writing content file ${type}/${filename}:`, error);
        return false;
    }
}

export async function clearCache() {
    configCache.clear();
    contentCache.clear();
    systemCache.clear();
}

// Ensure system directory exists
async function ensureSystemDirectoryExists() {
    try {
        await fs.mkdir(SYSTEM_DIR, { recursive: true });
        return true;
    } catch (error) {
        console.error('Error creating system directory:', error);
        return false;
    }
}

export async function readSystemFile(filename: string) {
    const cacheKey = `system:${filename}`;

    if (systemCache.has(cacheKey)) {
        return systemCache.get(cacheKey);
    }

    try {
        await ensureSystemDirectoryExists();
        const filePath = path.join(SYSTEM_DIR, filename);

        try {
            await fs.access(filePath);
        } catch {
            // File doesn't exist yet, return empty object
            return {};
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = parseToml(content);

        systemCache.set(cacheKey, parsed);
        return parsed;
    } catch (error) {
        console.error(`Error reading system file ${filename}:`, error);
        return {};
    }
}

export async function writeSystemFile(filename: string, data: any) {
    try {
        await ensureSystemDirectoryExists();
        const filePath = path.join(SYSTEM_DIR, filename);
        const tomlContent = stringifyToml(data);
        await fs.writeFile(filePath, tomlContent, 'utf-8');

        // Update cache
        const cacheKey = `system:${filename}`;
        systemCache.set(cacheKey, data);

        return true;
    } catch (error) {
        console.error(`Error writing system file ${filename}:`, error);
        return false;
    }
}

export async function listFiles(directory: string) {
    try {
        const dirPath = path.join(DATA_DIR, directory);
        const files = await fs.readdir(dirPath, {withFileTypes: true});
        return files
            .filter(file => file.isFile() && file.name.endsWith(".toml"))
            .map(file => file.name);
    } catch (error) {
        console.error(`Error listing files in ${directory}:`, error);
        return [];
    }
}

export async function listDirectories(directory: string) {
    try {
        const dirPath = path.join(DATA_DIR, directory);
        const entries = await fs.readdir(dirPath, {withFileTypes: true});
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    } catch (error) {
        console.error(`Error listing directories in ${directory}:`, error);
        return [];
    }
}

export async function fileExists(directory: string, filename: string) {
    try {
        const filePath = path.join(DATA_DIR, directory, filename);
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function deleteFile(directory: string, filename: string) {
    try {
        const filePath = path.join(DATA_DIR, directory, filename);
        await fs.unlink(filePath);

        // Clear from cache
        const cacheKey = directory.includes('config')
            ? `config:${filename}`
            : `content:${directory}:${filename}`;

        if (directory.includes('config')) {
            configCache.delete(cacheKey);
        } else {
            contentCache.delete(cacheKey);
        }

        return true;
    } catch (error) {
        console.error(`Error deleting file ${directory}/${filename}:`, error);
        return false;
    }
}

export async function ensureDirectoryExists(directory: string) {
    try {
        const dirPath = path.join(DATA_DIR, directory);
        await fs.mkdir(dirPath, {recursive: true});
        return true;
    } catch (error) {
        console.error(`Error creating directory ${directory}:`, error);
        return false;
    }
}

export async function copyFile(srcDirectory: string, srcFilename: string, destDirectory: string, destFilename: string) {
    try {
        const srcPath = path.join(DATA_DIR, srcDirectory, srcFilename);
        const destPath = path.join(DATA_DIR, destDirectory, destFilename);

        await ensureDirectoryExists(destDirectory);
        await fs.copyFile(srcPath, destPath);

        return true;
    } catch (error) {
        console.error(`Error copying file from ${srcDirectory}/${srcFilename} to ${destDirectory}/${destFilename}:`, error);
        return false;
    }
}

export async function getFileStats(directory: string, filename: string) {
    try {
        const filePath = path.join(DATA_DIR, directory, filename);
        const stats = await fs.stat(filePath);
        return {
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory()
        };
    } catch (error) {
        console.error(`Error getting file stats for ${directory}/${filename}:`, error);
        return null;
    }
}

// Utility functions for specific content types
export async function getSiteConfig() {
    return await readConfigFile('site.toml');
}

export async function getThemeConfig() {
    return await readConfigFile('theme.toml');
}

export async function getNavigationConfig() {
    return await readConfigFile('navigation.toml');
}

export async function getSEOConfig() {
    return await readConfigFile('seo.toml');
}

export async function getPageContent(page: string) {
    return await readContentFile('pages', `${page}.toml`);
}

export async function getComponentContent(component: string) {
    return await readContentFile('components', `${component}.toml`);
}

export async function updateSiteConfig(data: any) {
    return await writeConfigFile('site.toml', data);
}

export async function updateThemeConfig(data: any) {
    return await writeConfigFile('theme.toml', data);
}

export async function updateNavigationConfig(data: any) {
    return await writeConfigFile('navigation.toml', data);
}

export async function updateSEOConfig(data: any) {
    return await writeConfigFile('seo.toml', data);
}

export async function updatePageContent(page: string, data: any) {
    return await writeContentFile('pages', `${page}.toml`, data);
}

export async function updateComponentContent(component: string, data: any) {
    return await writeContentFile('components', `${component}.toml`, data);
}

// System settings functions
export async function getSystemSettings() {
    return await readSystemFile('system-settings.toml');
}

export async function updateSystemSettings(data: any) {
    return await writeSystemFile('system-settings.toml', data);
}

// Backup and restore functionality
export async function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(DATA_DIR, 'backups', timestamp);

        await ensureDirectoryExists(`backups/${timestamp}`);

        // Copy config files
        const configFiles = await listFiles('config');
        for (const file of configFiles) {
            await copyFile('config', file, `backups/${timestamp}/config`, file);
        }

        // Copy content files
        const contentTypes = await listDirectories('content');
        for (const type of contentTypes) {
            const contentFiles = await listFiles(`content/${type}`);
            for (const file of contentFiles) {
                await copyFile(`content/${type}`, file, `backups/${timestamp}/content/${type}`, file);
            }
        }

        return timestamp;
    } catch (error) {
        console.error('Error creating backup:', error);
        return null;
    }
}

export async function restoreBackup(timestamp: string) {
    try {
        const backupDir = `backups/${timestamp}`;

        // Restore config files
        const configFiles = await listFiles(`${backupDir}/config`);
        for (const file of configFiles) {
            await copyFile(`${backupDir}/config`, file, 'config', file);
        }

        // Restore content files
        const contentTypes = await listDirectories(`${backupDir}/content`);
        for (const type of contentTypes) {
            const contentFiles = await listFiles(`${backupDir}/content/${type}`);
            for (const file of contentFiles) {
                await copyFile(`${backupDir}/content/${type}`, file, `content/${type}`, file);
            }
        }

        // Clear cache after restore
        clearCache();

        return true;
    } catch (error) {
        console.error(`Error restoring backup ${timestamp}:`, error);
        return false;
    }
}

// Media file management functions

/**
 * Ensures the media directory exists
 */
export async function ensureMediaDirectoryExists() {
    try {
        await fs.mkdir(MEDIA_DIR, { recursive: true });
        await fs.mkdir(TRASH_DIR, { recursive: true });
        return true;
    } catch (error) {
        console.error('Error creating media directories:', error);
        return false;
    }
}

/**
 * List all media files in a directory
 * @param directory - Directory path relative to media root
 * @returns Array of file information objects
 */
export async function listMediaFiles(directory: string = '') {
    try {
        const dirPath = path.join(MEDIA_DIR, directory);
        await ensureMediaDirectoryExists();

        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const result = [];

        for (const entry of entries) {
            // Skip hidden files and directories (starting with .)
            if (entry.name.startsWith('.')) continue;

            const entryPath = path.join(directory, entry.name);
            const fullPath = path.join(MEDIA_DIR, entryPath);
            const stats = await fs.stat(fullPath);

            const item: any = {
                id: uuidv4(),
                name: entry.name,
                path: entryPath.replace(/\\/g, '/'),
                isDirectory: entry.isDirectory(),
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };

            if (!entry.isDirectory()) {
                // Add file-specific properties
                const ext = path.extname(entry.name).toLowerCase();
                item.extension = ext;
                item.type = getMediaType(ext);

                // For images, get dimensions
                if (item.type === 'image') {
                    try {
                        const metadata = await sharp(fullPath).metadata();
                        item.dimensions = {
                            width: metadata.width,
                            height: metadata.height
                        };
                    } catch (err) {
                        console.error(`Error getting image dimensions for ${fullPath}:`, err);
                    }
                }
            }

            result.push(item);
        }

        return result;
    } catch (error) {
        console.error(`Error listing media files in ${directory}:`, error);
        return [];
    }
}

/**
 * Get media file type based on extension
 */
function getMediaType(extension: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'];
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a'];
    const documentExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md'];

    if (imageExts.includes(extension)) return 'image';
    if (videoExts.includes(extension)) return 'video';
    if (audioExts.includes(extension)) return 'audio';
    if (documentExts.includes(extension)) return 'document';
    return 'other';
}

/**
 * Create a new directory in the media folder
 * @param directory - Parent directory path relative to media root
 * @param name - New directory name
 */
export async function createMediaDirectory(directory: string, name: string) {
    try {
        const dirPath = path.join(MEDIA_DIR, directory, name);
        await fs.mkdir(dirPath, { recursive: true });
        return true;
    } catch (error) {
        console.error(`Error creating directory ${directory}/${name}:`, error);
        return false;
    }
}

/**
 * Upload a file to the media directory
 * @param directory - Directory path relative to media root
 * @param file - File object with buffer and filename
 * @param options - Upload options including optimization settings
 */
export async function uploadMediaFile(
    directory: string, 
    file: { buffer: Buffer, originalname: string, mimetype: string },
    options: { 
        optimize?: boolean, 
        maxWidth?: number, 
        maxHeight?: number,
        quality?: number
    } = {}
) {
    try {
        await ensureMediaDirectoryExists();

        const dirPath = path.join(MEDIA_DIR, directory);
        await fs.mkdir(dirPath, { recursive: true });

        // Generate a safe filename
        const filename = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const filePath = path.join(dirPath, filename);

        // Check if the file is an image that can be optimized
        const isOptimizableImage = file.mimetype.startsWith('image/') && 
            ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) &&
            options.optimize;

        if (isOptimizableImage) {
            // Optimize the image
            let sharpInstance = sharp(file.buffer);

            // Resize if dimensions are provided
            if (options.maxWidth || options.maxHeight) {
                sharpInstance = sharpInstance.resize({
                    width: options.maxWidth,
                    height: options.maxHeight,
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }

            // Set quality
            if (options.quality) {
                if (file.mimetype === 'image/jpeg') {
                    sharpInstance = sharpInstance.jpeg({ quality: options.quality });
                } else if (file.mimetype === 'image/png') {
                    sharpInstance = sharpInstance.png({ quality: options.quality });
                } else if (file.mimetype === 'image/webp') {
                    sharpInstance = sharpInstance.webp({ quality: options.quality });
                }
            }

            // Save the optimized image
            await sharpInstance.toFile(filePath);
        } else {
            // Save the original file without optimization
            await fs.writeFile(filePath, file.buffer);
        }

        // Get file stats
        const stats = await fs.stat(filePath);

        // Prepare result object
        const result: any = {
            name: filename,
            path: path.join(directory, filename).replace(/\\/g, '/'),
            size: stats.size,
            type: file.mimetype,
            created: stats.birthtime,
            modified: stats.mtime
        };

        // Add image dimensions if it's an image
        if (file.mimetype.startsWith('image/')) {
            try {
                const metadata = await sharp(filePath).metadata();
                result.dimensions = {
                    width: metadata.width,
                    height: metadata.height
                };
            } catch (err) {
                console.error(`Error getting image dimensions for ${filePath}:`, err);
            }
        }

        return result;
    } catch (error) {
        console.error(`Error uploading file to ${directory}:`, error);
        return null;
    }
}

/**
 * Move a file or directory to trash
 * @param filePath - Path relative to media root
 */
export async function moveToTrash(filePath: string) {
    try {
        await ensureMediaDirectoryExists();

        const sourcePath = path.join(MEDIA_DIR, filePath);
        const filename = path.basename(filePath);

        // Create a unique name to avoid conflicts in trash
        const trashFilename = `${Date.now()}_${filename}`;
        const trashPath = path.join(TRASH_DIR, trashFilename);

        // Store original path for potential restore
        const metadataPath = path.join(TRASH_DIR, `${trashFilename}.meta.json`);
        await fs.writeFile(metadataPath, JSON.stringify({
            originalPath: filePath,
            deletedAt: new Date().toISOString()
        }));

        // Move the file to trash
        await fs.rename(sourcePath, trashPath);

        return true;
    } catch (error) {
        console.error(`Error moving ${filePath} to trash:`, error);
        return false;
    }
}

/**
 * List all items in the trash
 */
export async function listTrash() {
    try {
        await ensureMediaDirectoryExists();

        const entries = await fs.readdir(TRASH_DIR, { withFileTypes: true });
        const result = [];

        for (const entry of entries) {
            // Skip metadata files
            if (entry.name.endsWith('.meta.json')) continue;

            const fullPath = path.join(TRASH_DIR, entry.name);
            const stats = await fs.stat(fullPath);

            // Try to get original path from metadata
            let originalPath = '';
            let deletedAt = '';
            try {
                const metadataPath = path.join(TRASH_DIR, `${entry.name}.meta.json`);
                const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                const metadata = JSON.parse(metadataContent);
                originalPath = metadata.originalPath;
                deletedAt = metadata.deletedAt;
            } catch (err) {
                // Metadata file might not exist
                originalPath = entry.name;
            }

            result.push({
                name: entry.name,
                originalPath,
                deletedAt,
                isDirectory: entry.isDirectory(),
                size: stats.size,
                modified: stats.mtime
            });
        }

        return result;
    } catch (error) {
        console.error('Error listing trash:', error);
        return [];
    }
}

/**
 * Restore a file from trash
 * @param trashFilename - Filename in the trash directory
 */
export async function restoreFromTrash(trashFilename: string) {
    try {
        const trashPath = path.join(TRASH_DIR, trashFilename);
        const metadataPath = path.join(TRASH_DIR, `${trashFilename}.meta.json`);

        // Get original path from metadata
        let originalPath = '';
        try {
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);
            originalPath = metadata.originalPath;
        } catch (err) {
            // If metadata doesn't exist, use the filename as the path
            originalPath = trashFilename;
        }

        const restorePath = path.join(MEDIA_DIR, originalPath);

        // Ensure the directory exists
        await fs.mkdir(path.dirname(restorePath), { recursive: true });

        // Restore the file
        await fs.rename(trashPath, restorePath);

        // Remove metadata file if it exists
        try {
            await fs.unlink(metadataPath);
        } catch (err) {
            // Ignore if metadata file doesn't exist
        }

        return true;
    } catch (error) {
        console.error(`Error restoring ${trashFilename} from trash:`, error);
        return false;
    }
}

/**
 * Permanently delete a file from trash
 * @param trashFilename - Filename in the trash directory
 */
export async function deleteFromTrash(trashFilename: string) {
    try {
        const trashPath = path.join(TRASH_DIR, trashFilename);
        const metadataPath = path.join(TRASH_DIR, `${trashFilename}.meta.json`);

        // Delete the file
        await fs.unlink(trashPath);

        // Delete metadata file if it exists
        try {
            await fs.unlink(metadataPath);
        } catch (err) {
            // Ignore if metadata file doesn't exist
        }

        return true;
    } catch (error) {
        console.error(`Error deleting ${trashFilename} from trash:`, error);
        return false;
    }
}

/**
 * Empty the trash (delete all files)
 */
export async function emptyTrash() {
    try {
        const entries = await fs.readdir(TRASH_DIR);

        for (const entry of entries) {
            await fs.unlink(path.join(TRASH_DIR, entry));
        }

        return true;
    } catch (error) {
        console.error('Error emptying trash:', error);
        return false;
    }
}

/**
 * Rename a file or directory
 * @param filePath - Current path relative to media root
 * @param newName - New name for the file or directory
 */
export async function renameMedia(filePath: string, newName: string) {
    try {
        const currentPath = path.join(MEDIA_DIR, filePath);
        const dirName = path.dirname(filePath);
        const newPath = path.join(MEDIA_DIR, dirName, newName);

        await fs.rename(currentPath, newPath);

        return {
            name: newName,
            path: path.join(dirName, newName).replace(/\\/g, '/')
        };
    } catch (error) {
        console.error(`Error renaming ${filePath} to ${newName}:`, error);
        return null;
    }
}

/**
 * Move a file or directory to a new location
 * @param sourcePath - Source path relative to media root
 * @param destinationDir - Destination directory path relative to media root
 */
export async function moveMedia(sourcePath: string, destinationDir: string) {
    try {
        const sourceFullPath = path.join(MEDIA_DIR, sourcePath);
        const filename = path.basename(sourcePath);
        const destFullPath = path.join(MEDIA_DIR, destinationDir, filename);

        // Ensure destination directory exists
        await fs.mkdir(path.join(MEDIA_DIR, destinationDir), { recursive: true });

        // Move the file
        await fs.rename(sourceFullPath, destFullPath);

        return {
            name: filename,
            path: path.join(destinationDir, filename).replace(/\\/g, '/')
        };
    } catch (error) {
        console.error(`Error moving ${sourcePath} to ${destinationDir}:`, error);
        return null;
    }
}

/**
 * Copy a file or directory to a new location
 * @param sourcePath - Source path relative to media root
 * @param destinationDir - Destination directory path relative to media root
 */
export async function copyMedia(sourcePath: string, destinationDir: string) {
    try {
        const sourceFullPath = path.join(MEDIA_DIR, sourcePath);
        const filename = path.basename(sourcePath);
        const destFullPath = path.join(MEDIA_DIR, destinationDir, filename);

        // Ensure destination directory exists
        await fs.mkdir(path.join(MEDIA_DIR, destinationDir), { recursive: true });

        // Check if source is a directory
        const stats = await fs.stat(sourceFullPath);

        if (stats.isDirectory()) {
            // Copy directory recursively
            await copyDir(sourceFullPath, destFullPath);
        } else {
            // Copy file
            await fs.copyFile(sourceFullPath, destFullPath);
        }

        return {
            name: filename,
            path: path.join(destinationDir, filename).replace(/\\/g, '/')
        };
    } catch (error) {
        console.error(`Error copying ${sourcePath} to ${destinationDir}:`, error);
        return null;
    }
}

/**
 * Helper function to copy a directory recursively
 */
async function copyDir(source: string, destination: string) {
    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}
