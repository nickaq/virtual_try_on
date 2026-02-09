'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { getProductById, mockProducts } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';
import './page.css';

export default function ProductPage() {
    const params = useParams();
    const product = getProductById(params.id as string);
    const { addToCart } = useCart();

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [showTryOn, setShowTryOn] = useState(false);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

    if (!product) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h1>Товар не знайдено</h1>
                <Link href="/catalog" className="btn btn-primary">Повернутися до каталогу</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) {
            alert('Будь ласка, оберіть розмір та колір');
            return;
        }
        addToCart(product, selectedSize, selectedColor);
        alert('Товар додано до кошика!');
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedPhoto(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const similarProducts = mockProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 3);

    return (
        <div className="product-page">
            <div className="container">
                <div className="breadcrumbs">
                    <Link href="/">Головна</Link>
                    <span>/</span>
                    <Link href="/catalog">Каталог</Link>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                <div className="product-layout">
                    <div className="product-gallery">
                        <div className="main-image">
                            <div className="img-placeholder">
                                <span>📸</span>
                            </div>
                        </div>
                    </div>

                    <div className="product-details">
                        <div className="product-header">
                            <h1>{product.name}</h1>
                            <div className="product-price-large">€{product.price}</div>
                        </div>

                        <p className="product-description-full">{product.description}</p>

                        <div className="product-options">
                            <div className="option-group">
                                <label>Розмір</label>
                                <div className="size-options">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="option-group">
                                <label>Колір</label>
                                <div className="color-options">
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                            title={color}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="product-actions">
                            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                Додати до кошика
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => setShowTryOn(!showTryOn)}>
                                👔 Примірити
                            </button>
                        </div>

                        {showTryOn && (
                            <div className="try-on-section">
                                <h3>Віртуальне примірювання</h3>
                                <p>Завантажте своє фото, щоб побачити, як на вас виглядатиме ця річ</p>

                                {!uploadedPhoto ? (
                                    <div className="photo-upload">
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="photo-upload" className="upload-area">
                                            <div className="upload-icon">📸</div>
                                            <p>Натисніть для завантаження фото</p>
                                            <span className="upload-hint">JPG, PNG (макс. 10MB)</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="try-on-result">
                                        <div className="result-images">
                                            <div className="result-image">
                                                <p>Ваше фото</p>
                                                <div className="img-placeholder">
                                                    <span>📷</span>
                                                </div>
                                            </div>
                                            <div className="result-arrow">→</div>
                                            <div className="result-image">
                                                <p>Результат (обробляється...)</p>
                                                <div className="img-placeholder">
                                                    <div className="spinner"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn btn-secondary" onClick={() => setUploadedPhoto(null)}>
                                            Завантажити інше фото
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="product-info-section">
                            <h3>Склад</h3>
                            <p>{product.composition}</p>

                            <h3>Опис</h3>
                            <ul>
                                <li>Категорія: {getCategoryName(product.category)}</li>
                                <li>Сезон: {getSeasonName(product.season)}</li>
                                <li>Наявність: {product.inStock ? 'В наявності' : 'Немає в наявності'}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {similarProducts.length > 0 && (
                    <div className="similar-products">
                        <h2>Схожі товари</h2>
                        <div className="products-grid">
                            {similarProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
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

function getSeasonName(season: string): string {
    const names: Record<string, string> = {
        spring: 'Весна',
        summer: 'Літо',
        fall: 'Осінь',
        winter: 'Зима',
        'all-season': 'Всесезонний',
    };
    return names[season] || season;
}
