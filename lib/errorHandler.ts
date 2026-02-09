import { NextResponse } from 'next/server';
import { log } from './logger';
import { ZodError } from 'zod';

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational = true
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function handleApiError(error: any, context?: string) {
    // Логування помилки
    log.error(`API Error${context ? ` in ${context}` : ''}`, error, {
        statusCode: error?.statusCode,
        isOperational: error?.isOperational,
    });

    // Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: 'Некоректні дані',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
            { status: 400 }
        );
    }

    // Operational errors (відомі помилки)
    if (error instanceof ApiError && error.isOperational) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
        );
    }

    // Незнані помилки - не показувати деталі користувачу
    return NextResponse.json(
        { error: 'Внутрішня помилка сервера' },
        { status: 500 }
    );
}

// Helper для перевірки авторизації (додасться після імплементації auth)
export function requireAuth(session: any) {
    if (!session?.user) {
        throw new ApiError(401, 'Необхідна авторизація');
    }
    return session.user;
}
