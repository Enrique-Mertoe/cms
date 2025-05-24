// app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig as  authOptions } from '@/app/api/auth/[...nextauth]/route';
import {getAllContentSections, getContentItem, getContentSection, updateContentItem} from './helper';

// GET /api/content - Get all content sections
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        const item = searchParams.get('item');

        // If specific section and item requested
        if (section && item) {
            const content = await getContentItem(section, item);
            return NextResponse.json(content);
        }

        // If only section requested
        if (section) {
            const sectionContent = await getContentSection(section);
            return NextResponse.json(sectionContent);
        }

        // Get all content sections overview
        const contentSections = await getAllContentSections();
        return NextResponse.json(contentSections);

    } catch (error) {
        console.error('Content API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content' },
            { status: 500 }
        );
    }
}

// PUT /api/content - Update content
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { section, item, data } = body;

        if (!section || !item || !data) {
            return NextResponse.json(
                { error: 'Missing required fields: section, item, data' },
                { status: 400 }
            );
        }

        const success = await updateContentItem(section, item, data);

        if (success) {
            return NextResponse.json({ message: 'Content updated successfully' });
        } else {
            return NextResponse.json(
                { error: 'Failed to update content' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Content Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update content' },
            { status: 500 }
        );
    }
}
