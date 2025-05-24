
// app/api/content/[section]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig as  authOptions } from '@/app/api/auth/[...nextauth]/route';
import {getContentItem, getContentSection, updateContentItem} from '../helper';

export async function GET(
    request: NextRequest,
    { params }: { params: { section: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const item = searchParams.get('item');

        if (item) {
            // Get specific item from section
            const content = await getContentItem(params.section, item);
            return NextResponse.json(content);
        } else {
            // Get all items from section
            const sectionContent = await getContentSection(params.section);
            return NextResponse.json(sectionContent);
        }

    } catch (error) {
        console.error('Section API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch section content' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { section: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { item, data } = body;

        if (!item || !data) {
            return NextResponse.json(
                { error: 'Missing required fields: item, data' },
                { status: 400 }
            );
        }

        const success = await updateContentItem(params.section, item, data);

        if (success) {
            return NextResponse.json({ message: 'Content updated successfully' });
        } else {
            return NextResponse.json(
                { error: 'Failed to update content' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Section Update Error:', error);
        return NextResponse.json(
            { error: 'Failed to update content' },
            { status: 500 }
        );
    }
}