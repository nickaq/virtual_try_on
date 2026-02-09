import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/:id - деtalі товару
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
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
        console.error('Product API error:', error);
        return NextResponse.json(
            { error: 'Помилка отримання товару' },
            { status: 500 }
        );
    }
}
