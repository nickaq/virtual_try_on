import { Product } from './types';

export const mockProducts: Product[] = [
    // Jackets
    {
        id: '1',
        name: 'Premium Wool Coat',
        category: 'jackets',
        price: 299,
        description: 'Elegant wool coat perfect for cold weather. Features a classic design with modern tailoring.',
        composition: '80% Wool, 15% Polyester, 5% Cashmere',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'Navy', 'Charcoal'],
        season: 'winter',
        inStock: true,
        images: ['/placeholder-jacket-1.jpg'],
    },
    {
        id: '2',
        name: 'Leather Biker Jacket',
        category: 'jackets',
        price: 449,
        description: 'Genuine leather jacket with asymmetric zipper and quilted shoulders.',
        composition: '100% Genuine Leather',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Brown'],
        season: 'fall',
        inStock: true,
        images: ['/placeholder-jacket-2.jpg'],
    },
    {
        id: '3',
        name: 'Lightweight Bomber Jacket',
        category: 'jackets',
        price: 159,
        description: 'Versatile bomber jacket suitable for transitional seasons.',
        composition: '100% Nylon',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Olive', 'Navy', 'Black'],
        season: 'spring',
        inStock: true,
        images: ['/placeholder-jacket-3.jpg'],
    },

    // Pants
    {
        id: '4',
        name: 'Classic Wool Trousers',
        category: 'pants',
        price: 129,
        description: 'Timeless wool trousers with a tailored fit. Perfect for business or formal occasions.',
        composition: '70% Wool, 30% Polyester',
        sizes: ['28', '30', '32', '34', '36', '38'],
        colors: ['Black', 'Navy', 'Gray'],
        season: 'all-season',
        inStock: true,
        images: ['/placeholder-pants-1.jpg'],
    },
    {
        id: '5',
        name: 'Slim Fit Chinos',
        category: 'pants',
        price: 89,
        description: 'Modern slim-fit chinos for casual and smart-casual looks.',
        composition: '97% Cotton, 3% Elastane',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Beige', 'Navy', 'Olive', 'Black'],
        season: 'all-season',
        inStock: true,
        images: ['/placeholder-pants-2.jpg'],
    },
    {
        id: '6',
        name: 'Premium Denim Jeans',
        category: 'pants',
        price: 119,
        description: 'High-quality selvedge denim with a comfortable regular fit.',
        composition: '100% Cotton Denim',
        sizes: ['28', '30', '32', '34', '36', '38'],
        colors: ['Indigo', 'Black', 'Light Wash'],
        season: 'all-season',
        inStock: true,
        images: ['/placeholder-pants-3.jpg'],
    },

    // Shirts
    {
        id: '7',
        name: 'Oxford Dress Shirt',
        category: 'shirts',
        price: 79,
        description: 'Classic oxford shirt perfect for office and formal events.',
        composition: '100% Cotton',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Light Blue', 'Pink'],
        season: 'all-season',
        inStock: true,
        images: ['/placeholder-shirt-1.jpg'],
    },
    {
        id: '8',
        name: 'Casual Linen Shirt',
        category: 'shirts',
        price: 69,
        description: 'Breathable linen shirt for warm weather.',
        composition: '100% Linen',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Navy', 'Sage'],
        season: 'summer',
        inStock: true,
        images: ['/placeholder-shirt-2.jpg'],
    },
    {
        id: '9',
        name: 'Flannel Checkered Shirt',
        category: 'shirts',
        price: 59,
        description: 'Warm flannel shirt with classic check pattern.',
        composition: '100% Cotton Flannel',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Red/Black', 'Blue/Navy', 'Green/Black'],
        season: 'winter',
        inStock: true,
        images: ['/placeholder-shirt-3.jpg'],
    },

    // Shoes
    {
        id: '10',
        name: 'Leather Derby Shoes',
        category: 'shoes',
        price: 189,
        description: 'Classic leather derby shoes for formal occasions.',
        composition: 'Genuine Leather Upper, Leather Sole',
        sizes: ['39', '40', '41', '42', '43', '44', '45'],
        colors: ['Black', 'Brown'],
        season: 'all-season',
        inStock: true,
        images: ['/placeholder-shoes-1.jpg'],
    },
    {
        id: '11',
        name: 'White Leather Sneakers',
        category: 'shoes',
        price: 129,
        description: 'Minimalist white leather sneakers for everyday wear.',
        composition: 'Leather Upper, Rubber Sole',
        sizes: ['39', '40', '41', '42', '43', '44'],
        colors: ['White', 'White/Navy'],
        season: 'all-season',
        inStock: true,
        images: ['/placeholder-shoes-2.jpg'],
    },
    {
        id: '12',
        name: 'Suede Chelsea Boots',
        category: 'shoes',
        price: 219,
        description: 'Premium suede Chelsea boots with elastic side panels.',
        composition: 'Suede Upper, Leather Lining, Rubber Sole',
        sizes: ['40', '41', '42', '43', '44', '45'],
        colors: ['Tan', 'Navy', 'Black'],
        season: 'fall',
        inStock: true,
        images: ['/placeholder-shoes-3.jpg'],
    },

    // Accessories
    {
        id: '13',
        name: 'Cashmere Scarf',
        category: 'accessories',
        price: 89,
        description: 'Luxurious cashmere scarf for cold weather.',
        composition: '100% Cashmere',
        sizes: ['One Size'],
        colors: ['Navy', 'Gray', 'Burgundy', 'Camel'],
        season: 'winter',
        inStock: true,
        images: ['/placeholder-accessory-1.jpg'],
    },
    {
        id: '14',
        name: 'Leather Belt',
        category: 'accessories',
        price: 59,
        description: 'Classic leather belt with silver buckle.',
        composition: '100% Genuine Leather',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Brown', 'Tan'],
        season: 'all-season',
        inStock: true,
        images: ['/placeholder-accessory-2.jpg'],
    },
    {
        id: '15',
        name: 'Wool Beanie',
        category: 'accessories',
        price: 39,
        description: 'Warm wool beanie for winter.',
        composition: '100% Merino Wool',
        sizes: ['One Size'],
        colors: ['Black', 'Navy', 'Gray', 'Burgundy'],
        season: 'winter',
        inStock: true,
        images: ['/placeholder-accessory-3.jpg'],
    },
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
    return mockProducts.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
    return mockProducts.filter(p => p.category === category);
};

export const searchProducts = (query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return mockProducts.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
};

export const filterProducts = (filters: {
    categories?: string[];
    priceRange?: [number, number];
    sizes?: string[];
    colors?: string[];
    seasons?: string[];
}): Product[] => {
    return mockProducts.filter(product => {
        if (filters.categories && filters.categories.length > 0) {
            if (!filters.categories.includes(product.category)) return false;
        }

        if (filters.priceRange) {
            const [min, max] = filters.priceRange;
            if (product.price < min || product.price > max) return false;
        }

        if (filters.sizes && filters.sizes.length > 0) {
            if (!product.sizes.some(size => filters.sizes!.includes(size))) return false;
        }

        if (filters.colors && filters.colors.length > 0) {
            if (!product.colors.some(color => filters.colors!.includes(color))) return false;
        }

        if (filters.seasons && filters.seasons.length > 0) {
            if (!filters.seasons.includes(product.season)) return false;
        }

        return true;
    });
};
