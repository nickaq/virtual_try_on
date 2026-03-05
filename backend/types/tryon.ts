/**
 * TypeScript types for Virtual Try-On API
 */

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'DONE' | 'FAILED';

export type ProcessingMode = 'draft' | 'final';

export type RealismLevel = 1 | 2 | 3 | 4 | 5;

export type GarmentType = 'tshirt' | 'jacket' | 'hoodie' | 'pants' | 'dress' | 'shirt';

export interface TryOnJobRequest {
    userImage?: File;
    userImageUrl?: string;
    productImage?: File;
    productImageUrl?: string;
    productId?: string;
    garmentType?: GarmentType | string;
    mode?: ProcessingMode;
    preserveFace?: boolean;
    preserveBackground?: boolean;
    realismLevel?: RealismLevel;
    maxRetries?: number;
}

export interface TryOnJobResponse {
    job_id: string;
    status: JobStatus;
    message: string;
}

export interface TryOnStatusResponse {
    job_id: string;
    status: JobStatus;
    result_image_url?: string;
    quality_score?: number;
    debug_artifacts?: Record<string, string>;
    error_code?: string;
    error_message?: string;
    retry_count: number;
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface TryOnError {
    code: string;
    message: string;
    details?: unknown;
}
