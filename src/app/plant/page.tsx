'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { useAuth } from '@/lib/auth-context';
import { createImagePreview, revokeImagePreview, validateImageFile } from '@/lib/utils/storage';
import { DistrictSearchResult } from '@/lib/types';
import { DistrictSearch } from '@/components/ui/district-search';

function PlantPageContent() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [treeQuantity, setTreeQuantity] = useState<number>(1);
    const [treeName, setTreeName] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/?auth_required=true');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        return () => {
            if (previewUrl) revokeImagePreview(previewUrl);
        };
    }, [previewUrl]);

    const handleImageFile = (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid image file');
            return;
        }

        if (previewUrl) revokeImagePreview(previewUrl);
        setImage(file);
        setPreviewUrl(createImagePreview(file));
        setError(null);
        setSuccess(null);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleImageFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageFile(file);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!selectedDistrict) {
            setError('Please select a district');
            return;
        }

        if (!image) {
            setError('Please upload a tree photo');
            return;
        }

        if (!treeName.trim()) {
            setError('Please enter the tree name');
            return;
        }

        if (treeQuantity < 1) {
            setError('Please enter a valid number of trees');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('districtId', selectedDistrict.id);
            formData.append('districtName', selectedDistrict.name);
            formData.append('state', selectedDistrict.state);
            formData.append('treeName', treeName.trim());
            formData.append('treeQuantity', treeQuantity.toString());
            if (user?.uid) formData.append('userId', user.uid);
            if (user?.displayName) formData.append('userName', user.displayName);
            if (user?.email) formData.append('userEmail', user.email);
            formData.append('image', image);

            const res = await fetch('/api/plant', {
                method: 'POST',
                body: formData,
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error || 'Failed to submit contribution');
            }

            setSuccess('Tree contribution submitted successfully!');
            setImage(null);
            if (previewUrl) revokeImagePreview(previewUrl);
            setPreviewUrl(null);
            setTreeName('');
            setTreeQuantity(1);
            setSelectedDistrict(null);
            
            // Redirect to contribution page after 2 seconds
            setTimeout(() => {
                router.push('/contribution');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit contribution');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                <section className="pt-20 pb-12 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                                Plant a Tree
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Upload photo and details of trees you planted
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                            {/* District Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    District
                                </label>
                                <DistrictSearch
                                    onDistrictSelect={(district) => {
                                        setSelectedDistrict(district);
                                        setError(null);
                                    }}
                                />
                                {selectedDistrict && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        Selected: {selectedDistrict.name}, {selectedDistrict.state}
                                    </p>
                                )}
                            </div>

                            {/* Tree Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Trees
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={treeQuantity}
                                    onChange={(e) => setTreeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm text-gray-900 bg-white"
                                    placeholder="Enter number of trees"
                                />
                            </div>

                            {/* Tree Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tree Name / Species
                                </label>
                                <input
                                    type="text"
                                    value={treeName}
                                    onChange={(e) => setTreeName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-sm text-gray-900 bg-white"
                                    placeholder="e.g., Neem, Mango, Banyan, Peepal"
                                />
                            </div>

                            {/* Image Upload with Drag and Drop */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tree Photo
                                </label>
                                <div
                                    ref={dropZoneRef}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                        isDragging
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    {previewUrl ? (
                                        <div className="space-y-3">
                                            <img
                                                src={previewUrl}
                                                alt="Tree preview"
                                                className="mx-auto rounded-lg max-h-64 object-cover"
                                            />
                                            <p className="text-sm text-gray-600">
                                                Click to change photo
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PNG, JPG, WEBP up to 10MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 max-w-xs">
                                    By submitting, you confirm this photo is authentic and consent to its use for impact reporting.
                                </p>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default function PlantPage() {
    return (
        <Suspense fallback={
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
                <Footer />
            </>
        }>
            <PlantPageContent />
        </Suspense>
    );
}

