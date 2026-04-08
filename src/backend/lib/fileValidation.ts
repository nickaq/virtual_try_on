import { ApiError } from './errorHandler';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_PREFIXES = ['image/'];

/**
 * Validates an uploaded image file for type and size.
 * Throws ApiError if validation fails.
 */
export function validateImageFile(file: File): void {
    if (!ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
        throw new ApiError(400, 'File must be an image');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new ApiError(400, 'File size must be less than 10MB');
    }
}
