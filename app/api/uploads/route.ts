import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/backend/lib/prisma';

const STORAGE_PATH = join(process.cwd(), 'storage', 'uploads');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${randomUUID()}.${ext}`;
        const filepath = join(STORAGE_PATH, filename);
        const relativeFilepath = `storage/uploads/${filename}`;

        // Save file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Create Upload record in database
        const upload = await prisma.upload.create({
            data: {
                filename: file.name,
                filepath: relativeFilepath,
                mimeType: file.type,
                size: file.size,
                userId: null, // TODO: Get from session when auth is implemented
            },
        });

        return NextResponse.json({
            id: upload.id,
            filename: upload.filename,
            filepath: upload.filepath,
            size: upload.size,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
