import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        selectedSize: z.string(),
        selectedColor: z.string(),
    })),
    contactName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
});

// POST /api/orders - створення замовлення
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Валідація
        const validatedData = orderSchema.parse(body);

        // Отримати ціни товарів
        const productIds = validatedData.items.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        // Перевірка наявності товарів
        if (products.length !== productIds.length) {
            return NextResponse.json(
                { error: 'Деякі товари не знайдено' },
                { status: 400 }
            );
        }

        // Підрахунок total
        let total = 0;
        const orderItems = validatedData.items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            return {
                productId: item.productId,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
                price: product.price,
            };
        });

        // Створення замовлення (без userId для гостей)
        const order = await prisma.order.create({
            data: {
                userId: 'guest', // Тимчасово для гостей
                status: 'PENDING',
                total,
                contactName: validatedData.contactName,
                email: validatedData.email,
                phone: validatedData.phone,
                address: validatedData.address,
                city: validatedData.city,
                postalCode: validatedData.postalCode,
                country: validatedData.country,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json({
            orderId: order.id,
            status: order.status,
            total: order.total,
        }, { status: 201 });

    } catch (error) {
        console.error('Order creation error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Некоректні дані', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Помилка створення замовлення' },
            { status: 500 }
        );
    }
}

// GET /api/orders - список замовлень користувача
export async function GET(request: NextRequest) {
    try {
        // TODO: Додати перевірку auth після реалізації
        // const session = await auth();
        // if (!session?.user) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const orders = await prisma.order.findMany({
            // where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return NextResponse.json({ orders });

    } catch (error) {
        console.error('Orders fetch error:', error);
        return NextResponse.json(
            { error: 'Помилка отримання замовлень' },
            { status: 500 }
        );
    }
}
