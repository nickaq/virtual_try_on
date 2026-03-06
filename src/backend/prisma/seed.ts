import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
    {
        name: 'Premium Wool Coat',
        description: 'Класичне вовняне пальто преміум якості з елегантним кроєм. Ідеально для холодної погоди.',
        price: 299.99,
        category: 'jackets',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Чорний', 'Темно-сірий', 'Верблюжий']),
        season: 'winter',
        composition: '90% вовна, 10% кашемір',
        inStock: true,
    },
    {
        name: 'Slim Fit Chinos',
        description: 'Стильні брюки чінос з зауженим кроєм. Універсальний вибір для повсякденного та smart casual образу.',
        price: 89.99,
        category: 'pants',
        sizes: JSON.stringify(['28', '30', '32', '34', '36']),
        colors: JSON.stringify(['Бежевий', 'Синій', 'Чорний', 'Оливковий']),
        season: 'all-season',
        composition: '98% бавовна, 2% еластан',
        inStock: true,
    },
    {
        name: 'Oxford Button-Down Shirt',
        description: 'Класична оксфордська сорочка на гудзиках. Обов\'язковий елемент гардеробу.',
        price: 69.99,
        category: 'shirts',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        colors: JSON.stringify(['Білий', 'Блакитний', 'Рожевий']),
        season: 'all-season',
        composition: '100% бавовна',
        inStock: true,
    },
    {
        name: 'Leather Chelsea Boots',
        description: 'Преміум шкіряні черевики челсі з еластичними вставками по боках.',
        price: 199.99,
        category: 'shoes',
        sizes: JSON.stringify(['40', '41', '42', '43', '44', '45']),
        colors: JSON.stringify(['Чорний', 'Коричневий']),
        season: 'fall',
        composition: '100% натуральна шкіра',
        inStock: true,
    },
    {
        name: 'Designer Leather Wallet',
        description: 'Компактний шкіряний гаманець ручної роботи з RFID захистом.',
        price: 79.99,
        category: 'accessories',
        sizes: JSON.stringify(['One Size']),
        colors: JSON.stringify(['Чорний', 'Коричневий', 'Темно-синій']),
        season: 'all-season',
        composition: '100% натуральна шкіра',
        inStock: true,
    },
    {
        name: 'Denim Jacket',
        description: 'Класична джинсова куртка trucker style. Вічний тренд.',
        price: 119.99,
        category: 'jackets',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Світло-синій', 'Темно-синій', 'Чорний']),
        season: 'spring',
        composition: '100% бавовна',
        inStock: true,
    },
    {
        name: 'Linen Summer Shirt',
        description: 'Легка лляна сорочка для спекотних днів. Дихаюча тканина.',
        price: 59.99,
        category: 'shirts',
        sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Білий', 'Бежевий', 'Блакитний']),
        season: 'summer',
        composition: '100% льон',
        inStock: true,
    },
    {
        name: 'Cargo Pants',
        description: 'Практичні брюки cargo з великими кишенями. Street style.',
        price: 99.99,
        category: 'pants',
        sizes: JSON.stringify(['28', '30', '32', '34']),
        colors: JSON.stringify(['Хакі', 'Чорний', 'Темно-зелений']),
        season: 'all-season',
        composition: '65% поліестер, 35% бавовна',
        inStock: true,
    },
    {
        name: 'White Sneakers',
        description: 'Мінімалістичні білі кросівки. Must-have для casual образу.',
        price: 89.99,
        category: 'shoes',
        sizes: JSON.stringify(['40', '41', '42', '43', '44']),
        colors: JSON.stringify(['Білий']),
        season: 'all-season',
        composition: 'Шкіра та текстиль',
        inStock: true,
    },
    {
        name: 'Wool Scarf',
        description: 'М\'який вовняний шарф з класичним візерунком.',
        price: 49.99,
        category: 'accessories',
        sizes: JSON.stringify(['One Size']),
        colors: JSON.stringify(['Сірий', 'Темно-синій', 'Бордовий']),
        season: 'winter',
        composition: '100% мериносова вовна',
        inStock: true,
    },
];

async function main() {
    console.log('Початок seed...');

    // Видалити існуючі дані
    await prisma.tryOnJob.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();

    // Додати products
    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }

    console.log(`✓ Створено ${products.length} товарів`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
