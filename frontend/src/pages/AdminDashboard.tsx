import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import type { ReportStats } from '../services/api';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    MapPin,
    Image as ImageIcon,
    Filter,
    MessageSquare,
    Send,
    Search,
    BarChart2,
    List,
    Users,
    TrendingUp,
    AlertTriangle,
    Award,
    Trophy,
    Medal,
    Eye,
    X,
    Trash2,
    Building,
    Calendar,
    Star,
    HelpCircle,
    Download,
    Activity
} from 'lucide-react';
import { AnalyticsCharts } from '../components/AnalyticsCharts';

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
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    userId: string;
    createdAt: string;
    feedback?: string;
    rating?: number;
    adminComments?: Array<{
        _id?: string;
        comment: string;
        adminName: string;
        timestamp: string;
    }>;
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');

    // Admin exclusive states
    const [userStats, setUserStats] = useState<any>(null);
    const [priorityReports, setPriorityReports] = useState<Report[]>([]);
    const [activityFeed, setActivityFeed] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Modal states
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');

    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (category) params.append('category', category);
            if (priority) params.append('priority', priority);
            if (dateRange.start) params.append('startDate', dateRange.start);
            if (dateRange.end) params.append('endDate', dateRange.end);

            const [reportsResponse, statsData, analytics, userStatsData, priorityReportsData, activityData] = await Promise.all([
                axios.get(`http://localhost:3000/reports?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                apiService.getReportStats(),
                apiService.getAnalytics('global'),
                axios.get('http://localhost:3000/users/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:3000/users/priority-reports', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:3000/reports/activity', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setReports(reportsResponse.data.data);
            setStats(statsData);
            setAnalyticsData(analytics);
            setUserStats(userStatsData.data.data);
            setPriorityReports(priorityReportsData.data.data);
            setActivityFeed(activityData.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (token) fetchData();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [token, search, status, category, priority, dateRange]);

    const exportCSV = async () => {
        try {
            const response = await axios.get('http://localhost:3000/reports/export', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export CSV');
        }
    };

    const updateReportState = async (id: string, field: 'status' | 'priority', value: string) => {
        try {
            await axios.patch(`http://localhost:3000/reports/${id}/status`,
                { [field]: value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
            fetchData();

            // Update selected report if modal is open
            if (selectedReport && selectedReport._id === id) {
                setSelectedReport(prev => prev ? { ...prev, [field]: value } : null);
            }
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            toast.error(`Failed to update ${field}`);
        }
    };

    const addComment = async (reportId: string) => {
        const comment = commentInputs[reportId]?.trim();
        if (!comment) {
            toast.error('Please enter a comment');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:3000/reports/${reportId}/comment`,
                { comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Comment added successfully');
            setCommentInputs({ ...commentInputs, [reportId]: '' });
            fetchData();

            // Update selected report if modal is open
            if (selectedReport && selectedReport._id === reportId) {
                setSelectedReport(response.data.data);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        }
    };

    const deleteComment = async (reportId: string, commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await axios.delete(`http://localhost:3000/reports/${reportId}/comment/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Comment deleted successfully');
            fetchData();

            // Update selected report if modal is open
            if (selectedReport && selectedReport._id === reportId) {
                setSelectedReport(response.data.data);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
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

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'facility': return <Building size={24} />;
            case 'incident': return <AlertTriangle size={24} />;
            case 'event': return <Calendar size={24} />;
            case 'other': return <FileText size={24} />;
            default: return <HelpCircle size={24} />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return '#e74c3c';
            case 'high': return '#e67e22';
            case 'medium': return '#f39c12';
            case 'low': return '#27ae60';
            default: return '#95a5a6';
        }
    };

    if (loading && !reports.length && !stats) return (
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
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
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

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--card-bg)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: activeTab === 'dashboard' ? 'var(--accent-color)' : 'transparent',
                            color: activeTab === 'dashboard' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                        }}
                    >
                        <BarChart2 size={18} />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: activeTab === 'reports' ? 'var(--accent-color)' : 'transparent',
                            color: activeTab === 'reports' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                        }}
                    >
                        <List size={18} />
                        Manage Reports
                    </button>
                </div>
            </div>

            {/* Stats Cards - Always Visible */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(93, 173, 226, 0.1)' }}>
                                <FileText size={24} color="var(--accent-color)" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Total Reports</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.total}</p>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
                                <AlertCircle size={24} color="#d4b106" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Pending</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.pending}</p>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(135, 206, 235, 0.1)' }}>
                                <Clock size={24} color="#0077be" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>In Progress</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.inProgress}</p>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(144, 238, 144, 0.1)' }}>
                                <CheckCircle size={24} color="#228b22" />
                            </div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Completed</h3>
                        </div>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.done}</p>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'dashboard' ? (
                <>
                    {/* User Statistics - Admin Exclusive */}
                    {userStats && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px',
                            marginBottom: '40px'
                        }}>
                            <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(139, 111, 71, 0.1)' }}>
                                        <Users size={24} color="var(--secondary-color)" />
                                    </div>
                                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Total Users</h3>
                                </div>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{userStats.totalUsers}</p>
                            </div>

                            <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(46, 204, 113, 0.1)' }}>
                                        <TrendingUp size={24} color="#2ecc71" />
                                    </div>
                                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600' }}>Active Users (30d)</h3>
                                </div>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{userStats.activeUsers}</p>
                            </div>
                        </div>
                    )}

                    {/* Priority Alerts - Admin Exclusive */}
                    {priorityReports.length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '40px',
                            border: '2px solid #e74c3c',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <h3 style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#e74c3c',
                                marginBottom: '20px',
                                fontSize: '1.3rem',
                                fontWeight: '700'
                            }}>
                                <AlertTriangle size={24} />
                                Priority Alerts ({priorityReports.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {priorityReports.slice(0, 5).map((report) => (
                                    <div key={report._id} style={{
                                        padding: '15px',
                                        backgroundColor: 'rgba(231, 76, 60, 0.05)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(231, 76, 60, 0.2)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 5px 0', fontSize: '1rem' }}>{report.title}</h4>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '12px',
                                                    backgroundColor: report.priority === 'critical' ? '#e74c3c' : '#e67e22',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {report.priority?.toUpperCase()}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setActiveTab('reports');
                                                setSearch(report.title);
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: '#e74c3c',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity Feed - Admin Exclusive */}
                    {activityFeed.length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '40px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <h3 style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: 'var(--text-primary)',
                                marginBottom: '20px',
                                fontSize: '1.3rem',
                                fontWeight: '600'
                            }}>
                                <Activity size={24} />
                                Recent Activity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {activityFeed.map((item: any) => (
                                    <div key={item.id + item.date} style={{
                                        display: 'flex',
                                        gap: '15px',
                                        paddingBottom: '15px',
                                        borderBottom: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{
                                            padding: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: item.type === 'new_report' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(155, 89, 182, 0.1)',
                                            height: 'fit-content'
                                        }}>
                                            {item.type === 'new_report' ? <FileText size={20} color="#3498db" /> : <MessageSquare size={20} color="#9b59b6" />}
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 5px 0', color: 'var(--text-primary)', fontWeight: '500' }}>
                                                {item.details}
                                            </p>
                                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {new Date(item.date).toLocaleString()} • {item.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Users Table - Admin Exclusive */}
                    {userStats && userStats.topContributors && userStats.topContributors.length > 0 && (
                        <div style={{
                            backgroundColor: 'var(--card-bg)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '40px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <h3 style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: 'var(--text-primary)',
                                marginBottom: '20px',
                                fontSize: '1.3rem',
                                fontWeight: '600'
                            }}>
                                <Users size={24} />
                                Top Contributors
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Rank</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Username</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Email</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Reports</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userStats.topContributors.map((user: any, index: number) => (
                                            <tr key={user.userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>
                                                    {index === 0 ? <Trophy size={20} color="#FFD700" /> :
                                                        index === 1 ? <Medal size={20} color="#C0C0C0" /> :
                                                            index === 2 ? <Award size={20} color="#CD7F32" /> :
                                                                `#${index + 1}`}
                                                </td>
                                                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{user.username}</td>
                                                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>{user.reportCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Analytics Charts */}
                    <AnalyticsCharts data={analyticsData} loading={loading} />
                </>
            ) : (
                <>
                    {/* Search and Filters */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '30px',
                        flexWrap: 'wrap',
                        backgroundColor: 'var(--card-bg)',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--input-bg)',
                                    color: 'var(--text-primary)',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none' }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in progress">In Progress</option>
                            <option value="done">Completed</option>
                        </select>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none' }}
                        >
                            <option value="">All Categories</option>
                            <option value="facility">Facility</option>
                            <option value="incident">Incident</option>
                            <option value="event">Event</option>
                            <option value="other">Other</option>
                        </select>

                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            style={{ flex: 1, minWidth: '150px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none' }}
                        >
                            <option value="">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    {/* Date Range & Export */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '30px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--card-bg)',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>From:</span>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>To:</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={exportCSV}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#219150'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27ae60'}
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
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
                                flexDirection: 'column',
                                position: 'relative'
                            }}>
                                {/* Priority Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px',
                                    zIndex: 10,
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    backgroundColor:
                                        report.priority === 'critical' ? '#e74c3c' :
                                            report.priority === 'high' ? '#e67e22' :
                                                report.priority === 'medium' ? '#f1c40f' : '#2ecc71',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {report.priority ? report.priority.toUpperCase() : 'MEDIUM'}
                                </div>

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
                                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-primary)', fontSize: '1.25rem' }}>{report.title}</h3>

                                    {report.location && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${report.location.lat},${report.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '15px' }}
                                        >
                                            <MapPin size={16} />
                                            View Location
                                        </a>
                                    )}

                                    {/* Management Section */}
                                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Status</label>
                                            <select
                                                value={report.status}
                                                onChange={(e) => updateReportState(report._id, 'status', e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in progress">In Progress</option>
                                                <option value="done">Completed</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Priority</label>
                                            <select
                                                value={report.priority || 'medium'}
                                                onChange={(e) => updateReportState(report._id, 'priority', e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <button
                                        onClick={() => openModal(report)}
                                        style={{
                                            marginTop: '15px',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '5px',
                                            padding: '10px 12px',
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <Eye size={16} />
                                        View Details & Comments
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {reports.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <FileText size={64} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>No reports found for the selected filter.</p>
                        </div>
                    )}
                </>
            )}

            {/* Detail Modal - Split Layout */}
            {isModalOpen && selectedReport && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '20px',
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
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
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
                                        Admin Comments
                                    </h3>

                                    {selectedReport.adminComments && selectedReport.adminComments.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                            {selectedReport.adminComments.map((comment, index) => (
                                                <div key={index} style={{
                                                    padding: '15px',
                                                    backgroundColor: 'var(--background-alt)',
                                                    borderRadius: '12px',
                                                    borderLeft: '3px solid var(--accent-color)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{comment.adminName}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                                {new Date(comment.timestamp).toLocaleString()}
                                                            </span>
                                                            {comment._id && (
                                                                <button
                                                                    onClick={() => deleteComment(selectedReport._id, comment._id!)}
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#e74c3c',
                                                                        cursor: 'pointer',
                                                                        padding: '4px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    title="Delete Comment"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{comment.comment}</p>
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
                                            fontStyle: 'italic',
                                            marginBottom: '20px'
                                        }}>
                                            No comments from administrators yet.
                                        </div>
                                    )}

                                    {/* Add Comment Form */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={commentInputs[selectedReport._id] || ''}
                                            onChange={(e) => setCommentInputs({ ...commentInputs, [selectedReport._id]: e.target.value })}
                                            onKeyPress={(e) => { if (e.key === 'Enter') addComment(selectedReport._id); }}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                backgroundColor: 'var(--input-bg)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={() => addComment(selectedReport._id)}
                                            style={{
                                                padding: '0 20px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: 'var(--accent-color)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.95rem',
                                                fontWeight: '600',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            <Send size={18} />
                                            Send
                                        </button>
                                    </div>
                                </div>

                                {/* User Feedback */}
                                {(selectedReport.feedback || selectedReport.rating) && (
                                    <>
                                        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', width: '100%' }}></div>
                                        <div>
                                            <h3 style={{
                                                margin: '0 0 15px 0',
                                                color: 'var(--text-primary)',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <Star size={18} />
                                                User Feedback
                                            </h3>
                                            {selectedReport.rating && (
                                                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Rating:</span>
                                                    <div style={{ display: 'flex', gap: '3px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={18}
                                                                fill={i < selectedReport.rating! ? "#f39c12" : "none"}
                                                                color={i < selectedReport.rating! ? "#f39c12" : "var(--text-muted)"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedReport.feedback && (
                                                <p style={{
                                                    margin: 0,
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: '1.6',
                                                    fontSize: '1rem',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {selectedReport.feedback}
                                                </p>
                                            )}
                                        </div>
                                    </>
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
            `}</style>
        </div>
    );
}
