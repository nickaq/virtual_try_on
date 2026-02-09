import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/fileStorage';
import { rateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

// TODO: Імплементувати реальну інтеграцію з Nano Banana API
async function callNanoBananaAPI(params: {
    userPhotoUrl: string;
    productId: string;
}): Promise<{ resultUrl: string; apiJobId: string }> {
    // Заглушка - в production використовувати реальний API
    console.log('Calling Nano Banana API with:', params);

    // Симуляція затримки API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Повернути тестовий результат
    return {
        resultUrl: params.userPhotoUrl, // Тимчасово повертаємо те саме фото
        apiJobId: `job_${Date.now()}`,
    };
}

// POST /api/try-on/upload - завантаження фото та створення job
export async function POST(request: NextRequest) {
    try {
        // Rate limiting - 5 запитів на годину на IP  
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await rateLimit(ip, 5, 3600);

        if (rateLimitResult.limited) {
            return NextResponse.json(
                {
                    error: 'Перевищено ліміт запитів. Спробуйте пізніше.',
                    resetAt: rateLimitResult.resetAt,
                },
                { status: 429 }
            );
        }

        // Парсинг form data
        const formData = await request.formData();
        const productId = formData.get('productId') as string;
        const photo = formData.get('photo') as File;

        // Валідація
        if (!productId || !photo) {
            return NextResponse.json(
                { error: 'Відсутні обов\'язкові параметри' },
                { status: 400 }
            );
        }

        // Перевірка розміру файлу (макс 10MB)
        if (photo.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Файл занадто великий (макс 10MB)' },
                { status: 400 }
            );
        }

        // Перевірка типу файлу
        if (!photo.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Дозволені лише зображення' },
                { status: 400 }
            );
        }

        // Завантажити фото користувача
        const userPhotoUrl = await uploadFile(photo, 'try-on/user-photos');

        // Створити job в БД
        const job = await prisma.tryOnJob.create({
            data: {
                userId: 'guest', // TODO: Додати реальний userId після auth
                productId,
                userPhotoUrl,
                status: 'PENDING',
                deleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
            },
        });

        // Запустити обробку асинхронно
        processTryOnJob(job.id).catch(err => {
            console.error('Try-on processing error:', err);
        });

        return NextResponse.json({
            jobId: job.id,
            status: job.status,
            message: 'Фото завантажено. Обробка почалася.',
        }, { status: 201 });

    } catch (error) {
        console.error('Try-on upload error:', error);
        return NextResponse.json(
            { error: 'Помилка завантаження фото' },
            { status: 500 }
        );
    }
}

// Асинхронна обробка try-on job
async function processTryOnJob(jobId: string) {
    try {
        // Оновити статус
        await prisma.tryOnJob.update({
            where: { id: jobId },
            data: { status: 'PROCESSING' },
        });

        const job = await prisma.tryOnJob.findUnique({
            where: { id: jobId },
        });

        if (!job) return;

        // Виклик Nano Banana API з retry логікою
        let lastError: any;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const result = await callNanoBananaAPI({
                    userPhotoUrl: job.userPhotoUrl,
                    productId: job.productId,
                });

                // Оновити результат
                await prisma.tryOnJob.update({
                    where: { id: jobId },
                    data: {
                        status: 'COMPLETED',
                        resultPhotoUrl: result.resultUrl,
                        apiJobId: result.apiJobId,
                    },
                });

                return; // Успіх

            } catch (error) {
                lastError = error;
                console.error(`Try-on attempt ${attempt + 1} failed:`, error);

                // Затримка перед наступною спробою
                if (attempt < 2) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }
            }
        }

        // Всі спроби провалились
        await prisma.tryOnJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorMessage: lastError?.message || 'Не вдалося обробити зображення',
            },
        });

    } catch (error) {
        console.error('Process try-on job error:', error);
    }
}
