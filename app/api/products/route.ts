import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products - список товарів з фільтрацією та пагінацією
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const season = searchParams.get('season');

        const skip = (page - 1) * limit;

        // Побудова where clause
        const where: any = {};

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        if (season) {
            where.season = season;
        }

        // Отримання товарів з пагінацією
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.product.count({ where }),
        ]);

        // Парсинг JSON полів
        const formattedProducts = products.map(product => ({
            ...product,
            sizes: JSON.parse(product.sizes),
            colors: JSON.parse(product.colors),
        }));

        return NextResponse.json({
            products: formattedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json(
            { error: 'Помилка отримання товарів' },
            { status: 500 }
        );
    }
}
