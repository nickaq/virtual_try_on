import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/lib/prisma';
import { handleApiError } from '@/backend/lib/errorHandler';

// GET /api/products/:id - деtalі товару
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Товар не знайдено' },
                { status: 404 }
            );
        }

        // Парсинг JSON полів
        const formattedProduct = {
            ...product,
            sizes: JSON.parse(product.sizes),
            colors: JSON.parse(product.colors),
        };

        return NextResponse.json(formattedProduct);

    } catch (error) {
        return handleApiError(error, 'GET /api/products/:id');
    }
}
