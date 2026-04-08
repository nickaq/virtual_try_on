'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TryOnStatusResponse } from '@/backend/types/tryon';
import './TryOnResult.css';

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

    const statusClass = isProcessing ? 'processing' : isDone ? 'done' : isFailed ? 'failed' : '';

    const [timestamp] = useState(() => Date.now());

    const resultImageUrl = status.result_image_url
        ? `${process.env.NEXT_PUBLIC_TRYON_API_URL}${status.result_image_url}?t=${timestamp}`
        : null;

    return (
        <div className="tryon-result">
            {/* Status Banner */}
            <div className={`status-banner ${statusClass}`}>
                <div className="status-header">
                    <div>
                        <h3 className={`status-title ${statusClass}`}>
                            {getStatusMessage()}
                        </h3>
                        {status.quality_score && (
                            <p className="quality-score">
                                Quality Score: {(status.quality_score * 100).toFixed(0)}%
                            </p>
                        )}
                    </div>

                    {isProcessing && (
                        <div className="spinner"></div>
                    )}
                </div>

                {/* Progress indicator */}
                {isProcessing && (
                    <div className="progress-container">
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill"></div>
                        </div>
                        <p className="progress-text">
                            This usually takes 10-30 seconds...
                        </p>
                    </div>
                )}

                {/* Error message */}
                {isFailed && status.error_message && (
                    <div className="error-details">
                        <p className="error-code">Error: {status.error_code}</p>
                        <p className="error-msg">{status.error_message}</p>
                    </div>
                )}
            </div>

            {/* Result Display */}
            {isDone && resultImageUrl && (
                <div className="result-content">
                    {/* Toggle View */}
                    <div className="view-toggle">
                        <button
                            onClick={() => setShowComparison(false)}
                            className={`view-toggle-btn ${!showComparison ? 'active' : ''}`}
                        >
                            Result
                        </button>
                        {userImagePreview && (
                            <button
                                onClick={() => setShowComparison(true)}
                                className={`view-toggle-btn ${showComparison ? 'active' : ''}`}
                            >
                                Before/After
                            </button>
                        )}
                    </div>

                    {/* Image Display */}
                    {!showComparison ? (
                        <div className="result-image-container">
                            <Image
                                src={resultImageUrl}
                                alt="Try-on result"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    ) : userImagePreview && (
                        <div className="comparison-container">
                            <div className="comparison-images">
                                {/* Before */}
                                <div
                                    className="comparison-before"
                                    style={{ width: `${sliderPosition}%` }}
                                >
                                    <Image
                                        src={userImagePreview}
                                        alt="Original"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="comparison-label before">
                                        Before
                                    </div>
                                </div>

                                {/* After */}
                                <div className="comparison-after">
                                    <Image
                                        src={resultImageUrl}
                                        alt="Result"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="comparison-label after">
                                        After
                                    </div>
                                </div>
                            </div>

                            {/* Slider */}
                            <div
                                className="comparison-slider-line"
                                style={{ left: `${sliderPosition}%` }}
                            >
                                <div className="comparison-slider-handle">
                                    <svg width="16" height="16" fill="none" stroke="#4b5563" viewBox="0 0 24 24">
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
                                className="comparison-range-input"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="result-actions">
                        <a
                            href={resultImageUrl}
                            download={`tryon-result-${status.job_id}.png`}
                            className="result-download-btn"
                        >
                            Download Result
                        </a>
                        <button
                            onClick={() => window.location.reload()}
                            className="result-retry-btn"
                        >
                            Try Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
