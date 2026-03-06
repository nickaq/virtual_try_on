'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TryOnStatusResponse } from '@/backend/types/tryon';

interface TryOnResultProps {
    status: TryOnStatusResponse;
    userImagePreview?: string;
}

export default function TryOnResult({ status, userImagePreview }: TryOnResultProps) {
    const [showComparison, setShowComparison] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(50);

    const isProcessing = status.status === 'QUEUED' || status.status === 'PROCESSING';
    const isDone = status.status === 'DONE';
    const isFailed = status.status === 'FAILED';

    const getStatusMessage = () => {
        switch (status.status) {
            case 'QUEUED':
                return 'Your request is queued...';
            case 'PROCESSING':
                return 'Creating your virtual try-on...';
            case 'DONE':
                return 'Complete!';
            case 'FAILED':
                return 'Failed';
            default:
                return status.status;
        }
    };

    const [timestamp] = useState(() => Date.now());

    const resultImageUrl = status.result_image_url
        ? `${process.env.NEXT_PUBLIC_TRYON_API_URL}${status.result_image_url}?t=${timestamp}`
        : null;

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Status Banner */}
            <div className={`
        px-6 py-4 rounded-lg mb-6
        ${isProcessing ? 'bg-blue-50 border border-blue-200' : ''}
        ${isDone ? 'bg-green-50 border border-green-200' : ''}
        ${isFailed ? 'bg-red-50 border border-red-200' : ''}
      `}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className={`
              text-lg font-semibold
              ${isProcessing ? 'text-blue-900' : ''}
              ${isDone ? 'text-green-900' : ''}
              ${isFailed ? 'text-red-900' : ''}
            `}>
                            {getStatusMessage()}
                        </h3>
                        {status.quality_score && (
                            <p className="text-sm text-gray-600 mt-1">
                                Quality Score: {(status.quality_score * 100).toFixed(0)}%
                            </p>
                        )}
                    </div>

                    {isProcessing && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    )}
                </div>

                {/* Progress indicator */}
                {isProcessing && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            This usually takes 10-30 seconds...
                        </p>
                    </div>
                )}

                {/* Error message */}
                {isFailed && status.error_message && (
                    <div className="mt-3 text-sm text-red-700">
                        <p className="font-medium">Error: {status.error_code}</p>
                        <p className="mt-1">{status.error_message}</p>
                    </div>
                )}
            </div>

            {/* Result Display */}
            {isDone && resultImageUrl && (
                <div className="space-y-4">
                    {/* Toggle View */}
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => setShowComparison(false)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${!showComparison
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Result
                        </button>
                        {userImagePreview && (
                            <button
                                onClick={() => setShowComparison(true)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${showComparison
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Before/After
                            </button>
                        )}
                    </div>

                    {/* Image Display */}
                    {!showComparison ? (
                        <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={resultImageUrl}
                                alt="Try-on result"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    ) : userImagePreview && (
                        <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gray-100">
                            <div className="absolute inset-0 flex">
                                {/* Before */}
                                <div
                                    className="relative h-full overflow-hidden"
                                    style={{ width: `${sliderPosition}%` }}
                                >
                                    <Image
                                        src={userImagePreview}
                                        alt="Original"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                        Before
                                    </div>
                                </div>

                                {/* After */}
                                <div className="relative flex-1 h-full overflow-hidden">
                                    <Image
                                        src={resultImageUrl}
                                        alt="Result"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                        After
                                    </div>
                                </div>
                            </div>

                            {/* Slider */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                                style={{ left: `${sliderPosition}%` }}
                            >
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderPosition}
                                onChange={(e) => setSliderPosition(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <a
                            href={resultImageUrl}
                            download={`tryon-result-${status.job_id}.png`}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Download Result
                        </a>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Try Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
