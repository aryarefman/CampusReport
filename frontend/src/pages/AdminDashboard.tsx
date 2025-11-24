import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import type { ReportStats } from '../services/api';
import { CheckCircle, Clock, AlertCircle, FileText, MapPin, Image as ImageIcon, Filter, MessageSquare, Send } from 'lucide-react';

interface Report {
    _id: string;
    title: string;
    description: string;
    photoUrl?: string;
    location: {
        lat: number;
        lng: number;
    };
    status: 'pending' | 'in progress' | 'done';
    userId: string;
    createdAt: string;
    adminComments?: Array<{
        comment: string;
        adminName: string;
        timestamp: string;
    }>;
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reportsResponse, statsData] = await Promise.all([
                axios.get('http://localhost:3000/reports', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: filter !== 'all' ? { status: filter } : {}
                }),
                apiService.getReportStats()
            ]);

            setReports(reportsResponse.data.data);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, filter]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await axios.patch(`http://localhost:3000/reports/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Status updated successfully');
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const addComment = async (reportId: string) => {
        const comment = commentInputs[reportId]?.trim();
        if (!comment) {
            toast.error('Please enter a comment');
            return;
        }

        try {
            await axios.post(`http://localhost:3000/reports/${reportId}/comment`,
                { comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Comment added successfully');
            setCommentInputs({ ...commentInputs, [reportId]: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        }
    };

    if (loading) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: 'var(--text-secondary)'
        }}>
            Loading dashboard...
        </div>
    );

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '2.2rem',
                    marginBottom: '8px'
                }}>
                    <FileText size={36} />
                    Admin Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Manage facility reports and monitor campus maintenance
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <div style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                padding: '10px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(93, 173, 226, 0.1)'
                            }}>
                                <FileText size={24} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Total Reports</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.total}</p>
                    </div>

                    <div style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                padding: '10px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 215, 0, 0.1)'
                            }}>
                                <AlertCircle size={24} color="#d4b106" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Pending</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.pending}</p>
                    </div>

                    <div style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                padding: '10px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(135, 206, 235, 0.1)'
                            }}>
                                <Clock size={24} color="#0077be" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>In Progress</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.inProgress}</p>
                    </div>

                    <div style={{
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                padding: '10px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(144, 238, 144, 0.1)'
                            }}>
                                <CheckCircle size={24} color="#228b22" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Completed</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.done}</p>
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div style={{
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <Filter size={20} color="var(--text-secondary)" />
                <label style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Filter by Status:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <option value="all">All Reports</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Completed</option>
                </select>
            </div>

            {/* Reports Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '25px'
            }}>
                {reports.map((report) => (
                    <div key={report._id} style={{
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-md)',
                        border: '1px solid var(--border-color)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}>
                        {/* Image Section */}
                        <div style={{
                            height: '200px',
                            backgroundColor: '#2a2a2a',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {report.photoUrl ? (
                                <img
                                    src={`http://localhost:3000${report.photoUrl}`}
                                    alt={report.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-muted)'
                                }}>
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
                                        report.status === 'in progress' ? 'rgba(135, 206, 235, 0.9)' : 'rgba(144, 238, 144, 0.9)',
                                color: '#333',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                {report.status.toUpperCase()}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{
                                margin: '0 0 10px 0',
                                color: 'var(--text-primary)',
                                fontSize: '1.25rem'
                            }}>{report.title}</h3>

                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                marginBottom: '20px',
                                flex: 1
                            }}>{report.description}</p>

                            {/* Location Link */}
                            {report.location && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: 'var(--accent-color)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        marginBottom: '15px'
                                    }}
                                >
                                    <MapPin size={16} />
                                    View Location on Map
                                </a>
                            )}

                            {/* Status Update */}
                            <div style={{
                                borderTop: '1px solid var(--border-color)',
                                paddingTop: '15px'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    Update Status:
                                </label>
                                <select
                                    value={report.status}
                                    onChange={(e) => updateStatus(report._id, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        backgroundColor: 'var(--input-bg)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="done">Completed</option>
                                </select>
                            </div>

                            {/* Admin Comments Section */}
                            <div style={{
                                borderTop: '1px solid var(--border-color)',
                                paddingTop: '15px',
                                marginTop: '15px'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '10px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    <MessageSquare size={16} />
                                    Admin Comments:
                                </label>

                                {/* Existing Comments */}
                                {report.adminComments && report.adminComments.length > 0 && (
                                    <div style={{
                                        marginBottom: '12px',
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                        padding: '10px',
                                        backgroundColor: 'rgba(93, 173, 226, 0.05)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        {report.adminComments.map((comment, idx) => (
                                            <div key={idx} style={{
                                                marginBottom: idx < report.adminComments!.length - 1 ? '10px' : '0',
                                                paddingBottom: idx < report.adminComments!.length - 1 ? '10px' : '0',
                                                borderBottom: idx < report.adminComments!.length - 1 ? '1px solid var(--border-color)' : 'none'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '4px'
                                                }}>
                                                    {comment.comment}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-muted)',
                                                    fontStyle: 'italic'
                                                }}>
                                                    — {comment.adminName} • {new Date(comment.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment Input */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={commentInputs[report._id] || ''}
                                        onChange={(e) => setCommentInputs({ ...commentInputs, [report._id]: e.target.value })}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                addComment(report._id);
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={() => addComment(report._id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: 'var(--accent-color)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            transition: 'opacity 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        <Send size={14} />
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {reports.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)'
                }}>
                    <FileText size={64} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                        No reports found for the selected filter.
                    </p>
                </div>
            )}
        </div>
    );
}
