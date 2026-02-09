import winston from 'winston';

// Фільтр персональних даних
const sensitiveFields = ['password', 'email', 'phone', 'address', 'apiKey', 'token'];

function sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeData(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

// Створити logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'fashion-store' },
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});

// Console в development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

// Обгортки для безпечного логування
export const log = {
    info: (message: string, meta?: any) => {
        logger.info(message, sanitizeData(meta));
    },
    error: (message: string, error?: any, meta?: any) => {
        logger.error(message, {
            error: error?.message || error,
            stack: error?.stack,
            ...sanitizeData(meta),
        });
    },
    warn: (message: string, meta?: any) => {
        logger.warn(message, sanitizeData(meta));
    },
    debug: (message: string, meta?: any) => {
        logger.debug(message, sanitizeData(meta));
    },
};

export default logger;
