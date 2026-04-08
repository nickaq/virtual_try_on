/**
 * Shared formatting utilities for category and season display names.
 */

const categoryNames: Record<string, string> = {
    jackets: 'Куртки',
    pants: 'Штани',
    shirts: 'Сорочки',
    shoes: 'Взуття',
    accessories: 'Аксесуари',
};

const seasonNames: Record<string, string> = {
    spring: 'Весна',
    summer: 'Літо',
    fall: 'Осінь',
    winter: 'Зима',
    'all-season': 'Всесезонний',
};

export function getCategoryName(category: string): string {
    return categoryNames[category] || category;
}

export function getSeasonName(season: string): string {
    return seasonNames[season] || season;
}
