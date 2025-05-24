import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as fileManager from '@/src/lib/config/file-manager';

// Ensure user is authenticated
async function isAuthenticated() {
  const session = await getServerSession();
  return !!session;
}

// List media files in a directory
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const directory = searchParams.get('directory') || '';
    const includeTrash = searchParams.get('trash') === 'true';

    // List files or trash based on the request
    if (includeTrash) {
      const trashItems = await fileManager.listTrash();
      return NextResponse.json({ items: trashItems });
    } else {
      const files = await fileManager.listMediaFiles(directory);
      return NextResponse.json({ items: files });
    }
  } catch (error) {
    console.error('Error listing media files:', error);
    return NextResponse.json({ error: 'Failed to list media files' }, { status: 500 });
  }
}

// Create a new directory
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle different operations based on the action
    switch (body.action) {
      case 'createDirectory':
        if (!body.directory || !body.name) {
          return NextResponse.json({ error: 'Directory path and name are required' }, { status: 400 });
        }
        
        const success = await fileManager.createMediaDirectory(body.directory, body.name);
        
        if (success) {
          return NextResponse.json({ success: true, message: 'Directory created successfully' });
        } else {
          return NextResponse.json({ error: 'Failed to create directory' }, { status: 500 });
        }
        
      case 'rename':
        if (!body.path || !body.newName) {
          return NextResponse.json({ error: 'File path and new name are required' }, { status: 400 });
        }
        
        const renameResult = await fileManager.renameMedia(body.path, body.newName);
        
        if (renameResult) {
          return NextResponse.json({ success: true, item: renameResult });
        } else {
          return NextResponse.json({ error: 'Failed to rename item' }, { status: 500 });
        }
        
      case 'move':
        if (!body.sourcePath || !body.destinationDir) {
          return NextResponse.json({ error: 'Source path and destination directory are required' }, { status: 400 });
        }
        
        const moveResult = await fileManager.moveMedia(body.sourcePath, body.destinationDir);
        
        if (moveResult) {
          return NextResponse.json({ success: true, item: moveResult });
        } else {
          return NextResponse.json({ error: 'Failed to move item' }, { status: 500 });
        }
        
      case 'copy':
        if (!body.sourcePath || !body.destinationDir) {
          return NextResponse.json({ error: 'Source path and destination directory are required' }, { status: 400 });
        }
        
        const copyResult = await fileManager.copyMedia(body.sourcePath, body.destinationDir);
        
        if (copyResult) {
          return NextResponse.json({ success: true, item: copyResult });
        } else {
          return NextResponse.json({ error: 'Failed to copy item' }, { status: 500 });
        }
        
      case 'moveToTrash':
        if (!body.path) {
          return NextResponse.json({ error: 'File path is required' }, { status: 400 });
        }
        
        const trashResult = await fileManager.moveToTrash(body.path);
        
        if (trashResult) {
          return NextResponse.json({ success: true, message: 'Item moved to trash' });
        } else {
          return NextResponse.json({ error: 'Failed to move item to trash' }, { status: 500 });
        }
        
      case 'restoreFromTrash':
        if (!body.filename) {
          return NextResponse.json({ error: 'Trash filename is required' }, { status: 400 });
        }
        
        const restoreResult = await fileManager.restoreFromTrash(body.filename);
        
        if (restoreResult) {
          return NextResponse.json({ success: true, message: 'Item restored from trash' });
        } else {
          return NextResponse.json({ error: 'Failed to restore item from trash' }, { status: 500 });
        }
        
      case 'deleteFromTrash':
        if (!body.filename) {
          return NextResponse.json({ error: 'Trash filename is required' }, { status: 400 });
        }
        
        const deleteResult = await fileManager.deleteFromTrash(body.filename);
        
        if (deleteResult) {
          return NextResponse.json({ success: true, message: 'Item permanently deleted' });
        } else {
          return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
        }
        
      case 'emptyTrash':
        const emptyResult = await fileManager.emptyTrash();
        
        if (emptyResult) {
          return NextResponse.json({ success: true, message: 'Trash emptied successfully' });
        } else {
          return NextResponse.json({ error: 'Failed to empty trash' }, { status: 500 });
        }
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing media operation:', error);
    return NextResponse.json({ error: 'Failed to process operation' }, { status: 500 });
  }
}