'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/product/${product.id}`} className="product-card">
            <div className="product-image">
                <div className="img-placeholder">
                    <span>📸</span>
                </div>
                {!product.inStock && <div className="out-of-stock-badge">Немає в наявності</div>}
            </div>

            <div className="product-info">
                <div className="product-category">{getCategoryName(product.category)}</div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description.substring(0, 80)}...</p>

                <div className="product-footer">
                    <div className="product-price">€{product.price}</div>
                    <div className="product-colors">
                        {product.colors.slice(0, 3).map((color, index) => (
                            <div key={index} className="color-dot" title={color} />
                        ))}
                        {product.colors.length > 3 && <span className="color-more">+{product.colors.length - 3}</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function getCategoryName(category: string): string {
    const names: Record<string, string> = {
        jackets: 'Куртки',
        pants: 'Штани',
        shirts: 'Сорочки',
        shoes: 'Взуття',
        accessories: 'Аксесуари',
    };
    return names[category] || category;
}
