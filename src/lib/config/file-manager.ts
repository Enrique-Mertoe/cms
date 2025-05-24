import fs from 'fs/promises';
import path from 'path';
import {parse as parseToml, stringify as stringifyToml} from '@iarna/toml';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const CONFIG_DIR = path.join(DATA_DIR, 'config');
const CONTENT_DIR = path.join(DATA_DIR, 'content');

// Cache for configuration files
const configCache = new Map<string, any>();
const contentCache = new Map<string, any>();

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

export function clearCache() {
    configCache.clear();
    contentCache.clear();
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