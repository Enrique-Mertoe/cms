import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as fileManager from '@/src/lib/config/file-manager';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm'
];

// Ensure user is authenticated
async function isAuthenticated() {
  const session = await getServerSession();
  return !!session;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const directory = formData.get('directory') as string || '';
    const optimize = formData.get('optimize') === 'true';
    const maxWidth = parseInt(formData.get('maxWidth') as string || '0', 10) || undefined;
    const maxHeight = parseInt(formData.get('maxHeight') as string || '0', 10) || undefined;
    const quality = parseInt(formData.get('quality') as string || '0', 10) || undefined;
    
    // Get file from form data
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds the maximum allowed size (${MAX_FILE_SIZE / (1024 * 1024)}MB)` 
      }, { status: 400 });
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed',
        allowedTypes: ALLOWED_FILE_TYPES
      }, { status: 400 });
    }
    
    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload the file
    const result = await fileManager.uploadMediaFile(
      directory,
      {
        buffer,
        originalname: file.name,
        mimetype: file.type
      },
      {
        optimize,
        maxWidth,
        maxHeight,
        quality
      }
    );
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      file: result
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const directory = formData.get('directory') as string || '';
    const optimize = formData.get('optimize') === 'true';
    const maxWidth = parseInt(formData.get('maxWidth') as string || '0', 10) || undefined;
    const maxHeight = parseInt(formData.get('maxHeight') as string || '0', 10) || undefined;
    const quality = parseInt(formData.get('quality') as string || '0', 10) || undefined;
    
    // Get files from form data
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }
    
    // Process each file
    const results = [];
    const errors = [];
    
    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({
          name: file.name,
          error: `File size exceeds the maximum allowed size (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
        });
        continue;
      }
      
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push({
          name: file.name,
          error: 'File type not allowed'
        });
        continue;
      }
      
      try {
        // Convert File to Buffer for processing
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Upload the file
        const result = await fileManager.uploadMediaFile(
          directory,
          {
            buffer,
            originalname: file.name,
            mimetype: file.type
          },
          {
            optimize,
            maxWidth,
            maxHeight,
            quality
          }
        );
        
        if (result) {
          results.push(result);
        } else {
          errors.push({
            name: file.name,
            error: 'Failed to upload file'
          });
        }
      } catch (err) {
        errors.push({
          name: file.name,
          error: 'Error processing file'
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Uploaded ${results.length} files successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      files: results,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}