import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import Dropzone from 'react-dropzone';
import { toast } from 'react-toastify';
import { Upload, MapPin, FileText, Send, X, Calendar, Tag } from 'lucide-react';

export default function Report() {
    const { token, user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'incident' | 'event' | 'facility' | 'other'>('facility');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [mapsLink, setMapsLink] = useState('');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            const fetchReport = async () => {
                try {
                    const response = await axios.get(`http://localhost:3000/reports/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const report = response.data.data;
                    setTitle(report.title);
                    setDescription(report.description);
                    setCategory(report.category);
                    setDate(report.date ? report.date.split('T')[0] : report.createdAt.split('T')[0]);
                    setMapsLink(report.mapsLink || '');
                    if (report.photoUrl) {
                        setPhotoPreview(`http://localhost:3000${report.photoUrl}`);
                    }
                } catch (error) {
                    console.error('Error fetching report:', error);
                    toast.error('Failed to load report details');
                }
            };
            fetchReport();
        }
    }, [id, isEditing, token]);

    // Auto-generate description template when key fields change (only for new reports)
    useEffect(() => {
        if (!isEditing && title && category && date) {
            const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            let template = `${categoryLabel} Report: ${title}\n\n`;
            template += `Date of Occurrence: ${formattedDate}\n`;

            if (mapsLink) {
                template += `Location: ${mapsLink}\n`;
            }

            template += `\nDescription:\n`;
            template += `This ${category} report was submitted regarding "${title}". `;

            if (photo) {
                template += `Photo evidence has been attached for reference. `;
            }

            template += `Please review and take appropriate action.\n\n`;
            template += `[You can edit this description or add more details here]`;

            setDescription(template);
        }
    }, [title, category, date, mapsLink, photo, isEditing]);

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

    const extractCoordinatesFromMapsLink = (link: string): { lat: number; lng: number } | null => {
        try {
            const patterns = [
                /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng format
                /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng format
                /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng format
            ];

            for (const pattern of patterns) {
                const match = link.match(pattern);
                if (match) {
                    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
                }
            }
        } catch (error) {
            console.error('Error extracting coordinates:', error);
        }
        return null;
    };

    // Extract coordinates when maps link changes
    useEffect(() => {
        if (mapsLink) {
            const extracted = extractCoordinatesFromMapsLink(mapsLink);
            setCoords(extracted);
        } else {
            setCoords(null);
        }
    }, [mapsLink]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Debug logging
        console.log('Form submission:', { title, description, category, isEditing });

        // Trim whitespace for validation
        const trimmedTitle = title?.trim();
        const trimmedDescription = description?.trim();

        if (!trimmedTitle || !trimmedDescription || !category) {
            console.error('Validation failed:', {
                title: trimmedTitle,
                description: trimmedDescription,
                category
            });
            toast.error('Title, description, and category are required');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('date', date);
        formData.append('userId', user?.id || '');

        // Handle Google Maps link
        if (mapsLink) {
            formData.append('mapsLink', mapsLink);
            if (coords) {
                formData.append('lat', coords.lat.toString());
                formData.append('lng', coords.lng.toString());
            }
        }

        if (photo) {
            formData.append('photo', photo);
        }

        try {
            if (isEditing) {
                await axios.put(`http://localhost:3000/reports/${id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Report updated successfully');
                navigate('/my-reports');
            } else {
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
                setCategory('facility');
                setDate(new Date().toISOString().split('T')[0]);
                setPhoto(null);
                setPhotoPreview(null);
                setMapsLink('');
                setCoords(null);
            }
        } catch (err) {
            console.error(err);
            toast.error(isEditing ? 'Failed to update report' : 'Failed to submit report');
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
                    {isEditing ? 'Edit Report' : 'Submit Report'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Category */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <Tag size={18} />
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value as any)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        >
                            <option value="facility">Facility Issue</option>
                            <option value="incident">Incident</option>
                            <option value="event">Event</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Title */}
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
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Date */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <Calendar size={18} />
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Photo Evidence */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Photo Evidence (Optional)
                        </label>

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
                                                {isDragActive ? 'Drop the image here' : 'Drag & drop an image, or click to select'}
                                            </p>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: '300px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(255, 0, 0, 0.8)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 0, 0, 1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 0, 0, 0.8)'}
                                >
                                    <X size={18} color="white" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Google Maps Link */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <MapPin size={18} />
                            Google Maps Link (Optional)
                        </label>
                        <input
                            type="text"
                            value={mapsLink}
                            onChange={e => setMapsLink(e.target.value)}
                            placeholder="Paste Google Maps link here..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none',
                                marginBottom: '15px'
                            }}
                        />

                        {/* Embedded Google Maps */}
                        {coords && (
                            <>
                                <div style={{
                                    marginBottom: '15px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-color)',
                                    height: '250px'
                                }}>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${coords.lat},${coords.lng}&zoom=15`}
                                    />
                                </div>
                                <a
                                    href={mapsLink}
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
                            </>
                        )}
                    </div>

                    {/* Description (Auto-filled, editable) */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            Description
                            <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginLeft: '8px' }}>
                                (Auto-filled - you can edit)
                            </span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            rows={8}
                            placeholder="Description will be auto-filled when you enter title, category, and date..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--input-bg)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-md)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        <Send size={20} />
                        {isEditing ? 'Update Report' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
}
