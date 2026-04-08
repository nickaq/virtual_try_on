'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import './TryOnUploader.css';

interface TryOnUploaderProps {
    onImageSelect: (file: File | null) => void;
    currentImage?: File | null;
    label?: string;
    accept?: string;
}

export default function TryOnUploader({
    onImageSelect,
    label = "Upload Photo",
    accept = "image/jpeg,image/png,image/jpg"
}: TryOnUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback((file: File | null) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be less than 10MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onImageSelect(file);
    }, [onImageSelect]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    }, [handleFileChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    return (
        <div className="uploader-wrapper">
            <label className="uploader-label">
                {label}
            </label>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`uploader-dropzone ${isDragging ? 'dragging' : ''}`}
            >
                {preview ? (
                    <div className="uploader-preview">
                        <div className="uploader-preview-image">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setPreview(null);
                                onImageSelect(null as File | null);
                            }}
                            className="uploader-remove-btn"
                        >
                            Remove Image
                        </button>
                    </div>
                ) : (
                    <div className="uploader-placeholder">
                        <div className="uploader-icon">
                            <svg
                                width="48"
                                height="48"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <div className="uploader-text">
                            <label htmlFor={`file-upload-${label}`} className="uploader-text-link">
                                Click to upload
                            </label>
                            <span> or drag and drop</span>
                            <input
                                id={`file-upload-${label}`}
                                type="file"
                                accept={accept}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileChange(file);
                                }}
                                className="hidden"
                                style={{ display: 'none' }}
                            />
                        </div>
                        <p className="uploader-hint">
                            PNG, JPG up to 10MB
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
