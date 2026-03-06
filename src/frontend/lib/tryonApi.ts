/**
 * API Client for Virtual Try-On Backend
 */

import type {
    TryOnJobRequest,
    TryOnJobResponse,
    TryOnStatusResponse,
} from '@/backend/types/tryon';

const API_BASE_URL = process.env.NEXT_PUBLIC_TRYON_API_URL || 'http://localhost:8000';

export class TryOnApiError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'TryOnApiError';
    }
}

/**
 * Submit a virtual try-on job to the backend
 */
export async function submitTryOnJob(request: TryOnJobRequest): Promise<TryOnJobResponse> {
    const formData = new FormData();

    // Add images
    if (request.userImage) {
        formData.append('user_image', request.userImage);
    } else if (request.userImageUrl) {
        formData.append('user_image_url', request.userImageUrl);
    } else {
        throw new TryOnApiError('User image is required', 'MISSING_USER_IMAGE');
    }

    if (request.productImage) {
        formData.append('product_image', request.productImage);
    } else if (request.productImageUrl) {
        formData.append('product_image_url', request.productImageUrl);
    } else {
        throw new TryOnApiError('Product image is required', 'MISSING_PRODUCT_IMAGE');
    }

    // Add optional parameters
    if (request.productId) formData.append('product_id', request.productId);
    if (request.garmentType) formData.append('garment_type', request.garmentType);
    if (request.mode) formData.append('mode', request.mode);
    if (request.preserveFace !== undefined) formData.append('preserve_face', String(request.preserveFace));
    if (request.preserveBackground !== undefined) formData.append('preserve_background', String(request.preserveBackground));
    if (request.realismLevel) formData.append('realism_level', String(request.realismLevel));
    if (request.maxRetries !== undefined) formData.append('max_retries', String(request.maxRetries));

    try {
        const response = await fetch(`${API_BASE_URL}/api/tryon/submit`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new TryOnApiError(
                error.detail || `HTTP ${response.status}: ${response.statusText}`,
                'SUBMIT_FAILED',
                error
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TryOnApiError) throw error;

        throw new TryOnApiError(
            `Failed to submit try-on job: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'NETWORK_ERROR',
            error
        );
    }
}

/**
 * Check the status of a try-on job
 */
export async function checkJobStatus(jobId: string): Promise<TryOnStatusResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tryon/status/${jobId}`);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new TryOnApiError(
                error.detail || `HTTP ${response.status}: ${response.statusText}`,
                'STATUS_CHECK_FAILED',
                error
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TryOnApiError) throw error;

        throw new TryOnApiError(
            `Failed to check job status: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'NETWORK_ERROR',
            error
        );
    }
}

/**
 * Get the result image URL for a completed job
 */
export function getResultImageUrl(jobId: string): string {
    return `${API_BASE_URL}/api/tryon/result/${jobId}`;
}

/**
 * Poll job status until completion or failure
 */
export async function pollJobUntilComplete(
    jobId: string,
    options: {
        onStatusUpdate?: (status: TryOnStatusResponse) => void;
        pollInterval?: number;
        maxAttempts?: number;
    } = {}
): Promise<TryOnStatusResponse> {
    const {
        onStatusUpdate,
        pollInterval = 2000, // Poll every 2 seconds
        maxAttempts = 150 // 5 minutes max (150 * 2s)
    } = options;

    let attempts = 0;

    while (attempts < maxAttempts) {
        const status = await checkJobStatus(jobId);

        if (onStatusUpdate) {
            onStatusUpdate(status);
        }

        if (status.status === 'DONE' || status.status === 'FAILED') {
            return status;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
    }

    throw new TryOnApiError(
        'Job polling timed out',
        'TIMEOUT',
        { jobId, attempts }
    );
}

/**
 * Health check for the backend API
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
