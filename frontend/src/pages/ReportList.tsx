import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import {
    MapPin,
    Calendar,
    Image as ImageIcon,
    FileText,
    Edit,
    Trash2,
    Eye,
    X,
    Building,
    AlertTriangle,
    MessageSquare,
    Star,
    Clock,
    CheckCircle,
    HelpCircle,
    AlertCircle
} from 'lucide-react';

interface Report {
    _id: string;
    title: string;
    description: string;
    category: 'incident' | 'event' | 'facility' | 'other';
    photoUrl?: string;
    location: {
        lat: number;
        lng: number;
    };
    mapsLink?: string;
    date: string;
    status: 'pending' | 'in progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    feedback?: string;
    rating?: number;
    adminComments?: Array<{
        comment: string;
        adminName: string;
        timestamp: string;
    }>;
    createdAt: string;
}

export default function ReportList() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (status) params.append('status', status);
                if (category) params.append('category', category);
                if (priority) params.append('priority', priority);

                const response = await axios.get(`http://localhost:3000/reports/my-reports?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReports(response.data.data);
            } catch (error) {
                console.error('Error fetching reports:', error);
                toast.error('Failed to fetch your reports');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (token) fetchReports();
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [token, search, status, category, priority]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
            await axios.delete(`http://localhost:3000/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(reports.filter(r => r._id !== id));
            toast.success('Report deleted successfully');
            if (selectedReport?._id === id) closeModal();
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error('Failed to delete report');
        }
    };

    const openModal = (report: Report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedReport(null), 300);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return '#2ecc71';
            case 'medium': return '#f1c40f';
            case 'high': return '#e67e22';
            case 'critical': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'incident': return <AlertTriangle size={16} />;
            case 'event': return <Calendar size={16} />;
            case 'facility': return <Building size={16} />;
            default: return <HelpCircle size={16} />;
        }
    };

    return (
        <div className="report-list" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-1px' }}>
                        My Reports
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Track and manage your submitted reports</p>
                </div>
                <button
                    onClick={() => navigate('/report')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
                    }}
                >
                    <Edit size={18} />
                    Create New Report
                </button>
            </div>

            {/* Filters */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '30px',
                backgroundColor: 'var(--card-bg)',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)'
            }}>
                <input
                    type="text"
                    placeholder="Search reports..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                >
                    <option value="">All Categories</option>
                    <option value="incident">Incident</option>
                    <option value="event">Event</option>
                    <option value="facility">Facility</option>
                    <option value="other">Other</option>
                </select>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            {/* Reports Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading reports...</div>
            ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <FileText size={48} style={{ marginBottom: '20px', color: 'var(--text-muted)' }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>No reports found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or create a new report.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                    {reports.map((report) => (
                        <div
                            key={report._id}
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-md)',
                                border: '1px solid var(--border-color)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                        >
                            {/* Card Image */}
                            <div style={{ height: '180px', backgroundColor: '#2a2a2a', position: 'relative', overflow: 'hidden' }}>
                                {report.photoUrl ? (
                                    <img
                                        src={`http://localhost:3000${report.photoUrl}`}
                                        alt={report.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    backgroundColor:
                                        report.status === 'pending' ? 'rgba(255, 215, 0, 0.9)' :
                                            report.status === 'in progress' ? 'rgba(52, 152, 219, 0.9)' : 'rgba(46, 204, 113, 0.9)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {report.status}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <span style={{ color: getPriorityColor(report.priority) }}>
                                        <AlertTriangle size={14} />
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                                        {report.priority} Priority
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '700', lineHeight: '1.4' }}>
                                    {report.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {report.description}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <Calendar size={14} />
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => openModal(report)}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '5px' }}
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/report/edit/${report._id}`)}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', padding: '5px' }}
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(report._id)}
                                            style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '5px' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SPLIT LAYOUT MODAL */}
            {isModalOpen && selectedReport && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '20px',
                        backdropFilter: 'blur(5px)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '20px',
                            maxWidth: '1000px',
                            width: '95%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-lg)',
                            border: '1px solid var(--border-color)',
                            animation: 'slideIn 0.3s ease-out',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 20,
                                transition: 'all 0.2s',
                                backdropFilter: 'blur(4px)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            height: '100%',
                            overflow: 'auto'
                        }}>
                            {/* Left Column: Visuals (Photo & Map) */}
                            <div style={{
                                flex: '1 1 400px',
                                padding: '30px',
                                backgroundColor: 'var(--background-alt)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                borderRight: '1px solid var(--border-color)'
                            }}>
                                {/* Photo */}
                                <div style={{
                                    width: '100%',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: 'var(--shadow-md)',
                                    position: 'relative',
                                    aspectRatio: '16/9',
                                    backgroundColor: '#2a2a2a'
                                }}>
                                    {selectedReport.photoUrl ? (
                                        <img
                                            src={`http://localhost:3000${selectedReport.photoUrl}`}
                                            alt={selectedReport.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                            <ImageIcon size={64} />
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        left: '15px',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        backdropFilter: 'blur(4px)',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <Calendar size={14} />
                                        {new Date(selectedReport.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Map */}
                                {selectedReport.location && (
                                    <div style={{
                                        flex: 1,
                                        minHeight: '250px',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border-color)',
                                        boxShadow: 'var(--shadow-md)',
                                        position: 'relative'
                                    }}>
                                        <iframe
                                            title="Report Location"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            style={{ border: 0 }}
                                            src={`https://maps.google.com/maps?q=${selectedReport.location.lat},${selectedReport.location.lng}&z=15&output=embed`}
                                            allowFullScreen
                                        ></iframe>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.location.lat},${selectedReport.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                position: 'absolute',
                                                bottom: '15px',
                                                right: '15px',
                                                padding: '8px 16px',
                                                backgroundColor: 'var(--primary-color)',
                                                color: 'white',
                                                borderRadius: '20px',
                                                textDecoration: 'none',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <MapPin size={14} />
                                            Open in Maps
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Details & Interaction */}
                            <div style={{
                                flex: '1 1 400px',
                                padding: '30px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '25px',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}>
                                {/* Header */}
                                <div>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            backgroundColor:
                                                selectedReport.status === 'pending' ? 'rgba(255, 215, 0, 0.15)' :
                                                    selectedReport.status === 'in progress' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                                            color:
                                                selectedReport.status === 'pending' ? '#f1c40f' :
                                                    selectedReport.status === 'in progress' ? '#3498db' : '#2ecc71',
                                            fontWeight: '600',
                                            fontSize: '0.85rem',
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: `1px solid ${selectedReport.status === 'pending' ? '#f1c40f' : selectedReport.status === 'in progress' ? '#3498db' : '#2ecc71'}`
                                        }}>
                                            {selectedReport.status === 'pending' ? <AlertCircle size={14} /> :
                                                selectedReport.status === 'in progress' ? <Clock size={14} /> : <CheckCircle size={14} />}
                                            {selectedReport.status}
                                        </span>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: getPriorityColor(selectedReport.priority) + '20',
                                            color: getPriorityColor(selectedReport.priority),
                                            fontWeight: '600',
                                            fontSize: '0.85rem',
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: `1px solid ${getPriorityColor(selectedReport.priority)}`
                                        }}>
                                            <AlertTriangle size={14} />
                                            {selectedReport.priority} Priority
                                        </span>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: 'var(--background-alt)',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '600',
                                            fontSize: '0.85rem',
                                            textTransform: 'capitalize',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            {getCategoryIcon(selectedReport.category)}
                                            {selectedReport.category}
                                        </span>
                                    </div>

                                    <h2 style={{
                                        margin: 0,
                                        color: 'var(--text-primary)',
                                        fontSize: '1.8rem',
                                        lineHeight: '1.3',
                                        fontWeight: '700'
                                    }}>
                                        {selectedReport.title}
                                    </h2>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 style={{
                                        margin: '0 0 10px 0',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Description
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        color: 'var(--text-primary)',
                                        lineHeight: '1.7',
                                        fontSize: '1.05rem',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedReport.description}
                                    </p>
                                </div>

                                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', width: '100%' }}></div>

                                {/* Admin Comments Section */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: '0 0 15px 0',
                                        color: 'var(--text-primary)',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <MessageSquare size={18} />
                                        Updates & Comments
                                    </h3>

                                    {selectedReport.adminComments && selectedReport.adminComments.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {selectedReport.adminComments.map((comment, index) => (
                                                <div key={index} style={{
                                                    padding: '15px',
                                                    backgroundColor: 'var(--background-alt)',
                                                    borderRadius: '12px',
                                                    borderLeft: '3px solid var(--accent-color)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{comment.adminName}</span>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                            {new Date(comment.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>{comment.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            backgroundColor: 'var(--background-alt)',
                                            borderRadius: '12px',
                                            color: 'var(--text-muted)',
                                            fontStyle: 'italic'
                                        }}>
                                            No updates from administrators yet.
                                        </div>
                                    )}
                                </div>

                                {/* User Feedback (if done) */}
                                {selectedReport.status === 'done' && (
                                    <div style={{
                                        marginTop: 'auto',
                                        padding: '20px',
                                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(46, 204, 113, 0.3)'
                                    }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Star size={18} fill="#27ae60" />
                                            Feedback
                                        </h4>
                                        {selectedReport.rating && (
                                            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < selectedReport.rating! ? "#f1c40f" : "none"} color={i < selectedReport.rating! ? "#f1c40f" : "#bdc3c7"} />
                                                ))}
                                            </div>
                                        )}
                                        {selectedReport.feedback ? (
                                            <p style={{ margin: 0, color: 'var(--text-primary)', fontStyle: 'italic' }}>"{selectedReport.feedback}"</p>
                                        ) : (
                                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>No feedback provided yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                /* Responsive modal */
                @media (max-width: 768px) {
                    .report-list {
                        padding: 15px !important;
                    }
                }
            `}</style>
        </div>
    );
}
