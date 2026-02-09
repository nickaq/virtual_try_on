'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { mockProducts, filterProducts } from '@/lib/mockData';
import './page.css';

export default function CatalogPage() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
    const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = filterProducts({
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        priceRange,
        seasons: selectedSeasons.length > 0 ? selectedSeasons : undefined,
    }).filter(product => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query);
    });

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleSeason = (season: string) => {
        setSelectedSeasons(prev =>
            prev.includes(season)
                ? prev.filter(s => s !== season)
                : [...prev, season]
        );
    };

    return (
        <div className="catalog-page">
            <div className="container">
                <div className="catalog-header">
                    <h1>Каталог</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Пошук товарів..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="catalog-layout">
                    <aside className="filters-sidebar">
                        <div className="filter-section">
                            <h3>Категорії</h3>
                            <div className="filter-options">
                                {['jackets', 'pants', 'shirts', 'shoes', 'accessories'].map(cat => (
                                    <label key={cat} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => toggleCategory(cat)}
                                        />
                                        <span>{getCategoryName(cat)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Ціна</h3>
                            <div className="price-range">
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                />
                                <div className="price-labels">
                                    <span>€0</span>
                                    <span>€{priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h3>Сезон</h3>
                            <div className="filter-options">
                                {['spring', 'summer', 'fall', 'winter', 'all-season'].map(season => (
                                    <label key={season} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedSeasons.includes(season)}
                                            onChange={() => toggleSeason(season)}
                                        />
                                        <span>{getSeasonName(season)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setSelectedCategories([]);
                                setSelectedSeasons([]);
                                setPriceRange([0, 500]);
                                setSearchQuery('');
                            }}
                        >
                            Скинути фільтри
                        </button>
                    </aside>

                    <div className="catalog-content">
                        <div className="catalog-info">
                            <p className="results-count">
                                Знайдено товарів: <strong>{filteredProducts.length}</strong>
                            </p>
                        </div>

                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="no-results">
                                <p>Товари не знайдено. Спробуйте змінити фільтри.</p>
                            </div>
                        )}
                    </div>
                </div>
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
