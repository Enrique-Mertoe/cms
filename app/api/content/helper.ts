import {
    listDirectories, 
    listFiles, 
    readContentFile, 
    writeContentFile,
    getFileStats
} from "@/src/lib/config/file-manager";

export async function getAllContentSections() {
    try {
        const sections = await listDirectories('content');
        const result = {};

        for (const sectionName of sections) {
            const items = await listFiles(`content/${sectionName}`);

            // @ts-ignore
            result[sectionName] = {
                name: sectionName,
                items: items.map(file => file.replace('.toml', '')),
                count: items.length
            };
        }

        return {
            sections: result,
            totalSections: Object.keys(result).length
        };
    } catch (error) {
        console.error('Error reading content sections:', error);
        return { sections: {}, totalSections: 0 };
    }
}

export async function getContentSection(sectionName: string) {
    try {
        const items = await listFiles(`content/${sectionName}`);
        const sectionData = {};

        for (const item of items) {
            const itemName = item.replace('.toml', '');
            const content = await readContentFile(sectionName, item);
            // @ts-ignore
            sectionData[itemName] = content;
        }

        return {
            section: sectionName,
            data: sectionData,
            itemCount: Object.keys(sectionData).length
        };
    } catch (error) {
        console.error(`Error reading section ${sectionName}:`, error);
        return { section: sectionName, data: {}, itemCount: 0 };
    }
}

export async function getContentItem(sectionName: string, itemName: string) {
    try {
        const filename = `${itemName}.toml`;
        const content = await readContentFile(sectionName, filename);
        const stats = await getFileStats(`content/${sectionName}`, filename);

        return {
            section: sectionName,
            item: itemName,
            data: content,
            lastModified: stats ? stats.modified : new Date()
        };
    } catch (error) {
        console.error(`Error reading ${sectionName}/${itemName}:`, error);

        // Return default structure if file doesn't exist
        return {
            section: sectionName,
            item: itemName,
            data: getDefaultContentStructure(sectionName, itemName),
            lastModified: new Date()
        };
    }
}

export async function updateContentItem(sectionName: string, itemName: string, data: any) {
    try {
        // Add metadata
        const contentWithMeta = {
            ...data,
            meta: {
                ...data.meta,
                updated: new Date().toISOString(),
                updatedBy: 'content-manager' // You can get this from session
            }
        };

        // Write file using file-manager
        const success = await writeContentFile(sectionName, `${itemName}.toml`, contentWithMeta);
        return success;
    } catch (error) {
        console.error(`Error updating ${sectionName}/${itemName}:`, error);
        return false;
    }
}

export function getDefaultContentStructure(sectionName: string, itemName: string) {
    const defaults = {
        pages: {
            home: {
                meta: {
                    title: 'Welcome to Our Website',
                    description: 'Professional services for your business needs',
                    keywords: ['business', 'services', 'professional']
                },
                hero: {
                    title: 'Transform Your Business',
                    subtitle: 'Professional solutions that drive results',
                    cta_text: 'Get Started',
                    cta_link: '/contact',
                    background_image: '/images/hero-bg.jpg'
                },
                features: []
            },
            about: {
                meta: {
                    title: 'About Us',
                    description: 'Learn about our company and team',
                    keywords: ['about', 'company', 'team']
                },
                hero: {
                    title: 'About Our Company',
                    subtitle: 'Our story and mission'
                },
                content: {
                    story: 'Our company story goes here...',
                    mission: 'Our mission statement...',
                    vision: 'Our vision for the future...'
                }
            }
        },
        components: {
            testimonials: {
                settings: {
                    title: 'What Our Clients Say',
                    subtitle: 'Real feedback from real customers',
                    display_count: 3
                },
                testimonials: []
            },
            gallery: {
                settings: {
                    title: 'Our Gallery',
                    subtitle: 'Showcase of our work'
                },
                images: []
            }
        }
    };

    // @ts-ignore
    return defaults[sectionName]?.[itemName] || {
        meta: {
            title: `${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`,
            description: `${itemName} page content`,
            keywords: [itemName]
        }
    };
}
