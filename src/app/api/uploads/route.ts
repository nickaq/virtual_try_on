import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { handleApiError } from '@/backend/lib/errorHandler';
import { validateImageFile } from '@/backend/lib/fileValidation';
import { uploadFile } from '@/backend/lib/fileStorage';

const STORAGE_PATH = 'uploads';

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

        // Centralized validation
        validateImageFile(file);

        // Upload file via shared utility
        const filepath = await uploadFile(file, STORAGE_PATH);

        // Create Upload record in database
        const upload = await prisma.upload.create({
            data: {
                filename: file.name,
                filepath,
                mimeType: file.type,
                size: file.size,
                userId: null,
            },
        });

        return NextResponse.json({
            id: upload.id,
            filename: upload.filename,
            filepath: upload.filepath,
            size: upload.size,
        });
    } catch (error) {
        return handleApiError(error, 'POST /api/uploads');
    }
}
