import fs from 'fs/promises';
import path from 'path';
import { parse as parseToml, stringify as stringifyToml } from '@iarna/toml';

const DATA_DIR = path.join(process.cwd(), 'data');
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
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.endsWith('.toml
