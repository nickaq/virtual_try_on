'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TryOnUploader from '@/frontend/components/TryOnUploader';
import TryOnResult from '@/frontend/components/TryOnResult';
import { submitTryOnJob, pollJobUntilComplete, TryOnApiError } from '@/frontend/lib/tryonApi';
import type { TryOnStatusResponse } from '@/backend/types/tryon';
import './page.css';

function TryOnContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('product');

    const [userImage, setUserImage] = useState<File | null>(null);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [garmentType, setGarmentType] = useState<string>('');
    const [mode, setMode] = useState<'draft' | 'final'>('final');
    const [realismLevel, setRealismLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobStatus, setJobStatus] = useState<TryOnStatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userImagePreview, setUserImagePreview] = useState<string | null>(null);

    const handleUserImageSelect = (file: File | null) => {
        if (!file) {
            setUserImage(null);
            setUserImagePreview(null);
            return;
        }
        setUserImage(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setUserImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!userImage || !productImage) {
            setError('Please upload both your photo and select a product');
            return;
        }

        setError(null);
        setIsSubmitting(true);
        setJobStatus(null);

        try {
            // Submit job
            const response = await submitTryOnJob({
                userImage,
                productImage,
                productId: productId || undefined,
                garmentType: garmentType || undefined,
                mode,
                realismLevel,
                preserveFace: true,
                preserveBackground: true,
                maxRetries: 2
            });

            // Poll for completion
            const finalStatus = await pollJobUntilComplete(response.job_id, {
                onStatusUpdate: (status) => {
                    setJobStatus(status);
                },
                pollInterval: 2000
            });

            setJobStatus(finalStatus);

            if (finalStatus.status === 'FAILED') {
                setError(finalStatus.error_message || 'Try-on failed');
            }
        } catch (err) {
            if (err instanceof TryOnApiError) {
                setError(err.message);
            } else {
                setError('Failed to process try-on request');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const showForm = !jobStatus || jobStatus.status === 'FAILED';

    return (
        <div className="tryon-page">
            <div className="tryon-container">
                {/* Header */}
                <div className="tryon-header">
                    <h1>Virtual Try-On</h1>
                    <p>See how clothes look on you with AI-powered virtual try-on</p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="tryon-error">
                        <p className="error-title">Error</p>
                        <p className="error-text">{error}</p>
                    </div>
                )}

                {/* Upload Form */}
                {showForm ? (
                    <div className="tryon-form-card">
                        <div className="tryon-upload-grid">
                            {/* User Image */}
                            <TryOnUploader
                                label="Your Photo"
                                onImageSelect={handleUserImageSelect}
                                currentImage={userImage}
                            />

                            {/* Product Image */}
                            <TryOnUploader
                                label="Product Image"
                                onImageSelect={(file) => setProductImage(file)}
                                currentImage={productImage}
                            />
                        </div>

                        {/* Options */}
                        <div className="tryon-options-grid">
                            {/* Garment Type */}
                            <div>
                                <label className="tryon-option-label">
                                    Garment Type (Optional)
                                </label>
                                <select
                                    value={garmentType}
                                    onChange={(e) => setGarmentType(e.target.value)}
                                    className="tryon-select"
                                >
                                    <option value="">Auto-detect</option>
                                    <option value="tshirt">T-Shirt</option>
                                    <option value="shirt">Shirt</option>
                                    <option value="jacket">Jacket</option>
                                    <option value="hoodie">Hoodie</option>
                                    <option value="dress">Dress</option>
                                    <option value="pants">Pants</option>
                                </select>
                            </div>

                            {/* Processing Mode */}
                            <div>
                                <label className="tryon-option-label">
                                    Processing Mode
                                </label>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as 'draft' | 'final')}
                                    className="tryon-select"
                                >
                                    <option value="final">Final (Photorealistic)</option>
                                    <option value="draft">Draft (Fast Preview)</option>
                                </select>
                            </div>

                            {/* Realism Level */}
                            <div>
                                <label className="tryon-option-label">
                                    Realism Level: {realismLevel}
                                </label>
                                <div className="tryon-range-wrapper">
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={realismLevel}
                                        onChange={(e) => setRealismLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                                        disabled={mode === 'draft'}
                                    />
                                    <div className="tryon-range-labels">
                                        <span>Fast</span>
                                        <span>Detailed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="tryon-submit-wrapper">
                            <button
                                onClick={handleSubmit}
                                disabled={!userImage || !productImage || isSubmitting}
                                className="tryon-submit-btn"
                            >
                                {isSubmitting ? (
                                    <span className="tryon-submit-content">
                                        <div className="tryon-submit-spinner"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    'Try On Now'
                                )}
                            </button>
                        </div>

                        {/* Info */}
                        <p className="tryon-info-text">
                            Processing typically takes 10-30 seconds
                        </p>
                    </div>
                ) : null}

                {/* Result Display */}
                {jobStatus && (
                    <TryOnResult
                        status={jobStatus}
                        userImagePreview={userImagePreview || undefined}
                    />
                )}

                {/* How It Works */}
                {!jobStatus && (
                    <div className="tryon-how-it-works">
                        <h2>How It Works</h2>
                        <div className="tryon-steps-grid">
                            <div className="tryon-step">
                                <div className="tryon-step-number">1</div>
                                <h3>Upload Your Photo</h3>
                                <p>Take a selfie or upload a full-body photo with good lighting</p>
                            </div>
                            <div className="tryon-step">
                                <div className="tryon-step-number">2</div>
                                <h3>Select Product</h3>
                                <p>Choose the clothing item you want to try on</p>
                            </div>
                            <div className="tryon-step">
                                <div className="tryon-step-number">3</div>
                                <h3>See the Result</h3>
                                <p>AI generates a photorealistic image with you wearing the product</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TryOnPage() {
    return (
        <Suspense fallback={
            <div className="tryon-loading">
                <div className="tryon-loading-spinner"></div>
            </div>
        }>
            <TryOnContent />
        </Suspense>
    );
}
