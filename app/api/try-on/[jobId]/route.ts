import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/try-on/:jobId - статус примірювання
export async function GET(
    request: NextRequest,
    { params }: { params: { jobId: string } }
) {
    try {
        const job = await prisma.tryOnJob.findUnique({
            where: { id: params.jobId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job не знайдено' },
                { status: 404 }
            );
        }

        // TODO: Перевірити, що користувач має доступ до цього job

        return NextResponse.json({
            id: job.id,
            status: job.status,
            productId: job.productId,
            userPhotoUrl: job.userPhotoUrl,
            resultPhotoUrl: job.resultPhotoUrl,
            errorMessage: job.errorMessage,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        });

    } catch (error) {
        console.error('Try-on job status error:', error);
        return NextResponse.json(
            { error: 'Помилка отримання статусу' },
            { status: 500 }
        );
    }
}
