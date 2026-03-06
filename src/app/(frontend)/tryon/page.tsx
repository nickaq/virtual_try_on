'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TryOnUploader from '@/frontend/components/TryOnUploader';
import TryOnResult from '@/frontend/components/TryOnResult';
import { submitTryOnJob, pollJobUntilComplete, TryOnApiError } from '@/frontend/lib/tryonApi';
import type { TryOnStatusResponse } from '@/backend/types/tryon';

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

            console.log('Job submitted:', response.job_id);

            // Poll for completion
            const finalStatus = await pollJobUntilComplete(response.job_id, {
                onStatusUpdate: (status) => {
                    console.log('Status update:', status.status);
                    setJobStatus(status);
                },
                pollInterval: 2000
            });

            setJobStatus(finalStatus);

            if (finalStatus.status === 'FAILED') {
                setError(finalStatus.error_message || 'Try-on failed');
            }
        } catch (err) {
            console.error('Try-on error:', err);
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Virtual Try-On
                    </h1>
                    <p className="text-lg text-gray-600">
                        See how clothes look on you with AI-powered virtual try-on
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        <p className="font-medium">Error</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {/* Upload Form */}
                {showForm ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
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
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {/* Garment Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Garment Type (Optional)
                                </label>
                                <select
                                    value={garmentType}
                                    onChange={(e) => setGarmentType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Processing Mode
                                </label>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as 'draft' | 'final')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="final">Final (Photorealistic)</option>
                                    <option value="draft">Draft (Fast Preview)</option>
                                </select>
                            </div>

                            {/* Realism Level */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Realism Level: {realismLevel}
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={realismLevel}
                                    onChange={(e) => setRealismLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                                    className="w-full"
                                    disabled={mode === 'draft'}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Fast</span>
                                    <span>Detailed</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleSubmit}
                                disabled={!userImage || !productImage || isSubmitting}
                                className={`
                  px-8 py-4 rounded-lg font-semibold text-lg transition-all
                  ${!userImage || !productImage || isSubmitting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                                    }
                `}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    'Try On Now'
                                )}
                            </button>
                        </div>

                        {/* Info */}
                        <p className="text-center text-sm text-gray-500 mt-4">
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
                    <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-blue-600">1</span>
                                </div>
                                <h3 className="font-semibold mb-2">Upload Your Photo</h3>
                                <p className="text-sm text-gray-600">
                                    Take a selfie or upload a full-body photo with good lighting
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-blue-600">2</span>
                                </div>
                                <h3 className="font-semibold mb-2">Select Product</h3>
                                <p className="text-sm text-gray-600">
                                    Choose the clothing item you want to try on
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-blue-600">3</span>
                                </div>
                                <h3 className="font-semibold mb-2">See the Result</h3>
                                <p className="text-sm text-gray-600">
                                    AI generates a photorealistic image with you wearing the product
                                </p>
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
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <TryOnContent />
        </Suspense>
    );
}
