// Simple in-memory rate limiter (для development)
// В production використовуйте Redis (Upstash)

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export async function rateLimit(
    identifier: string,
    maxRequests: number,
    windowSeconds: number
): Promise<{ limited: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Якщо немає запису або час скинувся
    if (!record || now > record.resetTime) {
        const resetTime = now + windowSeconds * 1000;
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime,
        });

        return {
            limited: false,
            remaining: maxRequests - 1,
            resetAt: resetTime,
        };
    }

    // Перевірка ліміту
    if (record.count >= maxRequests) {
        return {
            limited: true,
            remaining: 0,
            resetAt: record.resetTime,
        };
    }

    // Збільшити лічильник
    record.count += 1;

    return {
        limited: false,
        remaining: maxRequests - record.count,
        resetAt: record.resetTime,
    };
}

// Очищення старих записів (запускати періодично)
export function cleanupRateLimitStore() {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// Очищення кожні 5 хвилин
if (typeof window === 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
