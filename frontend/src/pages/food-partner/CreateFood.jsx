import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import '../../styles/create-food.css';
import { useNavigate } from 'react-router-dom';

const CreateFood = () => {
    const [ name, setName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ price, setPrice ] = useState('');
    const [ category, setCategory ] = useState('Veg');
    const [ smallPrice, setSmallPrice ] = useState('');
    const [ mediumPrice, setMediumPrice ] = useState('');
    const [ largePrice, setLargePrice ] = useState('');
    const [ videoFile, setVideoFile ] = useState(null);
    const [ videoURL, setVideoURL ] = useState('');
    const [ fileError, setFileError ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!videoFile) {
            setVideoURL('');
            return;
        }
        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);
        return () => URL.revokeObjectURL(url);
    }, [ videoFile ]);

    const onFileChange = (e) => {
        const file = e.target.files && e.target.files[ 0 ];
        if (!file) { setVideoFile(null); setFileError(''); return; }
        if (!file.type.startsWith('video/')) { setFileError('Please select a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[ 0 ];
        if (!file) { return; }
        if (!file.type.startsWith('video/')) { setFileError('Please drop a valid video file.'); return; }
        setFileError('');
        setVideoFile(file);
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const openFileDialog = () => fileInputRef.current?.click();

    const onSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', Number(price));
        formData.append('category', category);
        formData.append("video", videoFile);

        const portions = {
            small: Number(smallPrice) || Math.round(Number(price) * 0.8),
            medium: Number(mediumPrice) || Number(price),
            large: Number(largePrice) || Math.round(Number(price) * 1.3)
        };

        formData.append('portions', JSON.stringify(portions));

        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/food`, formData, {
                withCredentials: true,
            });

            console.log(response.data);
            navigate("/");
        } catch (error) {
            console.error("Create food failed:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Video uploads are disabled in Demo Mode to preserve server storage.");
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = useMemo(() => !name.trim() || !price || !videoFile || loading, [ name, price, videoFile, loading ]);

    return (
        <div className="create-food-page">
            <div className="create-food-card">
                <header className="create-food-header">
                    <h1 className="create-food-title">Create Food</h1>
                    <p className="create-food-subtitle">Upload a short video, give it a name, set pricing, and add a description.</p>
                </header>

                {/* 🟢 DEMO MODE INFORMATION BANNER */}
                <div style={{
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    color: '#eab308',
                    fontSize: '13px',
                    fontWeight: '600',
                    lineHeight: '1.4'
                }}>
                    🔒 <strong>Demo Mode Active:</strong> New video uploads are disabled on the public demo to preserve free server storage and bandwidth.
                </div>

                <form className="create-food-form" onSubmit={onSubmit}>
                    <div className="field-group">
                        <label htmlFor="foodVideo">Food Video</label>
                        <input
                            id="foodVideo"
                            ref={fileInputRef}
                            className="file-input-hidden"
                            type="file"
                            accept="video/*"
                            onChange={onFileChange}
                        />

                        <div
                            className="file-dropzone"
                            role="button"
                            tabIndex={0}
                            onClick={openFileDialog}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFileDialog(); } }}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        >
                            <div className="file-dropzone-inner">
                                <svg className="file-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M10.8 3.2a1 1 0 0 1 .4-.08h1.6a1 1 0 0 1 1 1v1.6h1.6a1 1 0 0 1 1 1v1.6h1.6a1 1 0 0 1 1 1v7.2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6.4a1 1 0 0 1 1-1h1.6V3.2a1 1 0 0 1 1-1h1.6a1 1 0 0 1 .6.2z" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5" fill="currentColor" />
                                </svg>
                                <div className="file-dropzone-text">
                                    <strong>Tap to upload</strong> or drag and drop
                                </div>
                                <div className="file-hint">MP4, WebM, MOV • Up to ~100MB</div>
                            </div>
                        </div>

                        {fileError && <p className="error-text" role="alert">{fileError}</p>}

                        {videoFile && (
                            <div className="file-chip" aria-live="polite">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5" />
                                </svg>
                                <span className="file-chip-name">{videoFile.name}</span>
                                <span className="file-chip-size">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</span>
                                <div className="file-chip-actions">
                                    <button type="button" className="btn-ghost" onClick={openFileDialog}>Change</button>
                                    <button type="button" className="btn-ghost danger" onClick={() => { setVideoFile(null); setFileError(''); }}>Remove</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {videoURL && (
                        <div className="video-preview">
                            <video className="video-preview-el" src={videoURL} controls playsInline preload="metadata" />
                        </div>
                    )}

                    <div className="field-group">
                        <label htmlFor="foodName">Name *</label>
                        <input
                            id="foodName"
                            type="text"
                            placeholder="e.g., Spicy Paneer Wrap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="field-group" style={{ flex: 1 }}>
                            <label htmlFor="foodPrice">Base Price (₹) *</label>
                            <input
                                id="foodPrice"
                                type="number"
                                placeholder="e.g., 199"
                                min="1"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field-group" style={{ flex: 1 }}>
                            <label htmlFor="foodCategory">Category</label>
                            <select
                                id="foodCategory"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', background: '#fff' }}
                            >
                                <option value="Veg">🟢 Veg</option>
                                <option value="Non-Veg">🔴 Non-Veg</option>
                                <option value="Vegan">🌱 Vegan</option>
                                <option value="Beverage">🥤 Beverage</option>
                            </select>
                        </div>
                    </div>

                    <div className="field-group" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                            Portion Prices (Optional)
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                placeholder="Small ₹"
                                value={smallPrice}
                                onChange={(e) => setSmallPrice(e.target.value)}
                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="number"
                                placeholder="Medium ₹"
                                value={mediumPrice}
                                onChange={(e) => setMediumPrice(e.target.value)}
                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="number"
                                placeholder="Large ₹"
                                value={largePrice}
                                onChange={(e) => setLargePrice(e.target.value)}
                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="foodDesc">Description</label>
                        <textarea
                            id="foodDesc"
                            rows={4}
                            placeholder="Write a short description: ingredients, taste, spice level, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button className="btn-primary" type="submit" disabled={isDisabled}>
                            {loading ? "Processing..." : "Save Food"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFood;