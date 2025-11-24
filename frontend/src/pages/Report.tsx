import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import Dropzone from 'react-dropzone';
import { toast } from 'react-toastify';
import { Upload, MapPin, FileText, Send, X } from 'lucide-react';

const defaultCenter = { lat: -6.2, lng: 106.816666 }; // Jakarta default

export default function Report() {
    const { token, user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number }>(defaultCenter);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setPhoto(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            toast.error('Title and description are required');
            return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('lat', location.lat.toString());
        formData.append('lng', location.lng.toString());
        formData.append('userId', user?.id || '');
        if (photo) {
            formData.append('photo', photo);
        }
        try {
            await axios.post('http://localhost:3000/reports', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Report submitted successfully');
            // reset form
            setTitle('');
            setDescription('');
            setPhoto(null);
            setPhotoPreview(null);
            setLocation(defaultCenter);
        } catch (err) {
            console.error(err);
            toast.error('Failed to submit report');
        }
    };

    return (
        <div className="report-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{
                backgroundColor: 'var(--card-bg)',
                padding: '30px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(10px)'
            }}>
                <h2 style={{
                    marginBottom: '25px',
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '1.8rem'
                }}>
                    <FileText size={28} />
                    Submit Facility Report
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Broken AC in Library"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            placeholder="Describe the issue in detail..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>Photo Evidence</label>

                        {!photoPreview ? (
                            <Dropzone onDrop={onDrop} accept={{ 'image/*': [] }} multiple={false}>
                                {({ getRootProps, getInputProps, isDragActive }) => (
                                    <section
                                        {...getRootProps()}
                                        style={{
                                            border: '2px dashed var(--border-color)',
                                            borderRadius: '12px',
                                            padding: '30px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: isDragActive ? 'var(--card-hover)' : 'rgba(255, 255, 255, 0.02)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <Upload size={32} color="var(--text-secondary)" />
                                            <p style={{ color: 'var(--text-secondary)' }}>
                                                {isDragActive ? "Drop the photo here..." : "Drag & drop a photo here, or click to select"}
                                            </p>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                        ) : (
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: '400px',
                                        objectFit: 'cover',
                                        borderRadius: '12px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.8)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
                                >
                                    <X size={20} />
                                </button>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '10px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem'
                                }}>
                                    {photo?.name}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Location
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            marginBottom: '15px'
                        }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={location.lat}
                                    onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) || 0 })}
                                    placeholder="-6.2"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={location.lng}
                                    onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) || 0 })}
                                    placeholder="106.816666"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Embedded Google Maps */}
                        <div style={{
                            marginBottom: '15px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            height: '400px'
                        }}>
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${location.lat},${location.lng}&zoom=15`}
                            />
                        </div>

                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                backgroundColor: 'rgba(93, 173, 226, 0.1)',
                                color: 'var(--accent-color)',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 173, 226, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 173, 226, 0.1)'}
                        >
                            <MapPin size={18} />
                            Open in Google Maps
                        </a>

                        <p style={{
                            marginTop: '12px',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic'
                        }}>
                            💡 Tip: Change the coordinates above to see the map update automatically!
                        </p>
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
                    >
                        <Send size={20} />
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
}
