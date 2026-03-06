export interface Product {
    id: string;
    name: string;
    category: 'jackets' | 'pants' | 'shirts' | 'shoes' | 'accessories';
    price: number;
    description: string;
    composition: string;
    sizes: string[];
    colors: string[];
    season: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
    inStock: boolean;
    images: string[];
}

export interface CartItem {
    product: Product;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
}

export interface Order {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    deliveryAddress: string;
}

export interface TryOnResult {
    id: string;
    productId: string;
    originalPhoto: string;
    resultPhoto: string;
    timestamp: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    products?: Product[];
}

export interface FilterOptions {
    categories: string[];
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
    seasons: string[];
}
