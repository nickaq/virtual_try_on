import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { handleApiError } from '@/backend/lib/errorHandler';

// GET /api/try-on/:jobId - статус примірювання
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;
        const job = await prisma.tryOnJob.findUnique({
            where: { id: jobId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                userImage: true,
            },
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job не знайдено' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: job.id,
            status: job.status,
            productId: job.productId,
            userPhotoUrl: job.userImage?.filepath ?? null,
            resultPhotoUrl: job.resultPath,
            errorMessage: job.errorMessage,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        });

    } catch (error) {
        return handleApiError(error, 'GET /api/try-on/:jobId');
    }
}
