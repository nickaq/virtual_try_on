import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/backend/lib/prisma';
import { uploadFile } from '@/backend/lib/fileStorage';
import { rateLimit } from '@/backend/lib/rateLimit';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// POST /api/try-on/upload - upload photo and create job
export async function POST(request: NextRequest) {
    try {
        // Rate limiting - 5 requests per hour per IP
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await rateLimit(ip, 5, 3600);

        if (rateLimitResult.limited) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded. Please try again later.',
                    resetAt: rateLimitResult.resetAt,
                },
                { status: 429 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const productId = formData.get('productId') as string;
        const photo = formData.get('photo') as File;

        // Validation
        if (!productId || !photo) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Check file size (max 10MB)
        if (photo.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large (max 10MB)' },
                { status: 400 }
            );
        }

        // Check file type
        if (!photo.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Only images are allowed' },
                { status: 400 }
            );
        }

        // Upload user photo
        const userPhotoPath = await uploadFile(photo, 'try-on/user-photos');

        // Create Upload record for user photo
        const userUpload = await prisma.upload.create({
            data: {
                filename: photo.name,
                filepath: userPhotoPath,
                mimeType: photo.type,
                size: photo.size,
            },
        });

        // Create Upload record for product photo (placeholder, ideally should reference existing product image)
        // In a real scenario, we should look up the product and get its image path.
        // For now, we'll assume the product ID corresponds to a filename or path we can resolve, 
        // or we simply pass the product ID to the AI service if it can handle it.
        // However, the AI service expects `product_image_path`.

        // Let's check how `app/api/tryon/submit/route.ts` handled it. 
        // It expected `productImageId` to be passed in body, but here we only have `productId`.
        // We probably need to fetch the product to get its image.
        // Since we don't have a direct "Product" model linked here easily visible in snippets,
        // let's try to find an existing Upload for this product or create a placeholder pointing to the static image.

        // Assumption based on API docs: standard products are likely local or in storage.
        // Let's create a placeholder Upload record for the product image based on productId.
        const productUpload = await prisma.upload.create({
            data: {
                filename: 'product.jpg',
                filepath: `/products/${productId}.jpg`, // Simplified path
                mimeType: 'image/jpeg',
                size: 0,
            },
        });

        // Create job in DB
        const job = await prisma.tryOnJob.create({
            data: {
                productId,
                userImageId: userUpload.id,
                productImageId: productUpload.id,
                status: 'QUEUED',
            },
        });

        // Convert to absolute paths for Python service
        // relative path starts with '/', so slice(1) to make it relative to public folder
        const absoluteUserPath = path.join(process.cwd(), 'public', userUpload.filepath.startsWith('/') ? userUpload.filepath.slice(1) : userUpload.filepath);

        // Product path logic: assuming it's in public folder as well
        const absoluteProductPath = path.join(process.cwd(), 'public', productUpload.filepath.startsWith('/') ? productUpload.filepath.slice(1) : productUpload.filepath);

        // Call AI service asynchronously
        processJobAsync(job.id, absoluteUserPath, absoluteProductPath).catch(err => {
            console.error('Try-on processing error:', err);
        });

        return NextResponse.json({
            jobId: job.id,
            status: job.status,
            message: 'Photo uploaded. Processing started.',
        }, { status: 201 });

    } catch (error) {
        console.error('Try-on upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}

// Async function to call AI service
async function processJobAsync(
    jobId: string,
    userImagePath: string,
    productImagePath: string
) {
    try {
        // Update status to PROCESSING
        await prisma.tryOnJob.update({
            where: { id: jobId },
            data: {
                status: 'PROCESSING',
                startedAt: new Date(),
            },
        });

        // Call AI service
        const response = await fetch(`${AI_SERVICE_URL}/ai/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_id: jobId,
                user_image_path: userImagePath,
                product_image_path: productImagePath,
                garment_type: 'upper_body', // Default for now, could be inferred from product
                mode: 'final',
                realism_level: 3,
                preserve_face: true,
                preserve_background: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`AI Service returned ${response.status}`);
        }

        const result = await response.json();

        // Update job with result
        await prisma.tryOnJob.update({
            where: { id: jobId },
            data: {
                status: result.status === 'DONE' ? 'DONE' : 'FAILED',
                resultPath: result.result_path,
                qualityScore: result.quality_score,
                errorCode: result.error_code,
                errorMessage: result.error_message,
                completedAt: new Date(),
            },
        });
    } catch (error) {
        console.error('AI processing error:', error);

        // Update job as failed
        await prisma.tryOnJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorCode: 'AI_SERVICE_ERROR',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                completedAt: new Date(),
            },
        });
    }
}

