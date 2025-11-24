import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { MapPin, Calendar, Image as ImageIcon, FileText } from 'lucide-react';

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
    createdAt: string;
}

export default function ReportList() {
    const { token } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('http://localhost:3000/reports/my-reports', {
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

        if (token) {
            fetchReports();
        }
    }, [token]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>Loading reports...</div>;

    return (
        <div className="report-list" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{
                marginBottom: '30px',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '2rem'
            }}>
                <FileText size={32} />
                My Reports
            </h2>

            {reports.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>You haven't submitted any reports yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
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
                            }}
                        >
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

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1px solid var(--border-color)',
                                    paddingTop: '15px',
                                    marginTop: 'auto'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        <Calendar size={14} />
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>

                                    {report.location && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                color: 'var(--accent-color)',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <MapPin size={16} />
                                            View Map
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
