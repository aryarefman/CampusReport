import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText, PlusCircle, Shield, User, Mail,
  CheckCircle, Clock, AlertCircle, TrendingUp,
  Calendar, MapPin, Eye, X, Tag, BarChart3
} from 'lucide-react';
import { AnalyticsCharts } from '../components/AnalyticsCharts';

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
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // States for My Reports
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [myStats, setMyStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, done: 0 });

  // States for All Campus Reports
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allStats, setAllStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, done: 0 });

  // Analytics States
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // UI States
  const [loading, setLoading] = useState(true);
  const [showAllReports, setShowAllReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchUserAnalytics();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's own reports
      const myResponse = await axios.get('http://localhost:3000/reports/my-reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const myReportsData = myResponse.data.data || [];

      // Fetch all campus reports
      const allResponse = await axios.get('http://localhost:3000/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allReportsData = allResponse.data.data || [];

      // Calculate My Reports stats
      const myStatsData = {
        total: myReportsData.length,
        pending: myReportsData.filter((r: Report) => r.status === 'pending').length,
        inProgress: myReportsData.filter((r: Report) => r.status === 'in progress').length,
        done: myReportsData.filter((r: Report) => r.status === 'done').length,
      };

      // Calculate All Campus stats
      const allStatsData = {
        total: allReportsData.length,
        pending: allReportsData.filter((r: Report) => r.status === 'pending').length,
        inProgress: allReportsData.filter((r: Report) => r.status === 'in progress').length,
        done: allReportsData.filter((r: Report) => r.status === 'done').length,
      };

      setMyReports(myReportsData);
      setMyStats(myStatsData);
      setAllReports(allReportsData);
      setAllStats(allStatsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:3000/reports/analytics?scope=personal', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openDetailModal = (report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return '#95a5a6';
    switch (category) {
      case 'incident': return '#ff6b6b';
      case 'event': return '#4ecdc4';
      case 'facility': return '#ffd93d';
      case 'other': return '#a29bfe';
      default: return '#95a5a6';
    }
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return 'Other';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const calculateAccountAge = (createdAt?: string) => {
    if (!createdAt) return 'Unknown';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} months`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} years, ${diffMonths % 12} months`;
  };

  const displayedReports = showAllReports ? allReports : allReports.slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <main style={{ padding: '100px 20px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: 'var(--primary-color)',
            marginBottom: '8px',
            fontWeight: '700'
          }}>
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)'
          }}>
            View your reports and all campus reports for transparency
          </p>
        </header>

        {/* My Reports Statistics */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            marginBottom: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <TrendingUp size={28} />
            My Reports Statistics
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {/* My Total */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--primary-color)',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Total</p>
                  <h3 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', fontWeight: '700', margin: 0 }}>{myStats.total}</h3>
                </div>
                <FileText size={24} color="var(--primary-color)" />
              </div>
            </div>

            {/* My Pending */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid #ffd93d',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Pending</p>
                  <h3 style={{ fontSize: '2.2rem', color: '#ffd93d', fontWeight: '700', margin: 0 }}>{myStats.pending}</h3>
                </div>
                <Clock size={24} color="#ffd93d" />
              </div>
            </div>

            {/* My In Progress */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid #4ecdc4',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>In Progress</p>
                  <h3 style={{ fontSize: '2.2rem', color: '#4ecdc4', fontWeight: '700', margin: 0 }}>{myStats.inProgress}</h3>
                </div>
                <TrendingUp size={24} color="#4ecdc4" />
              </div>
            </div>

            {/* My Done */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid #90ee90',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Done</p>
                  <h3 style={{ fontSize: '2.2rem', color: '#90ee90', fontWeight: '700', margin: 0 }}>{myStats.done}</h3>
                </div>
                <CheckCircle size={24} color="#90ee90" />
              </div>
            </div>
          </div>
        </div>

        {/* User Analytics Charts */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            marginBottom: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <BarChart3 size={28} />
            My Reports Analytics
          </h2>
          <AnalyticsCharts data={userAnalytics} loading={analyticsLoading} />
        </div>

        {/* Campus Reports Statistics */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            All Campus Reports Statistics
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {/* Campus Total */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Total</p>
                  <h3 style={{ fontSize: '2.2rem', color: 'var(--accent-color)', fontWeight: '700', margin: 0 }}>{allStats.total}</h3>
                </div>
                <FileText size={24} color="var(--accent-color)" />
              </div>
            </div>

            {/* Campus Pending */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Pending</p>
                  <h3 style={{ fontSize: '2.2rem', color: '#ffd93d', fontWeight: '700', margin: 0 }}>{allStats.pending}</h3>
                </div>
                <Clock size={24} color="#ffd93d" />
              </div>
            </div>

            {/* Campus In Progress */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>In Progress</p>
                  <h3 style={{ fontSize: '2.2rem', color: '#4ecdc4', fontWeight: '700', margin: 0 }}>{allStats.inProgress}</h3>
                </div>
                <TrendingUp size={24} color="#4ecdc4" />
              </div>
            </div>

            {/* Campus Done */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease'
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Done</p>
                  <h3 style={{ fontSize: '2.2rem', color: '#90ee90', fontWeight: '700', margin: 0 }}>{allStats.done}</h3>
                </div>
                <CheckCircle size={24} color="#90ee90" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '25px',
          marginBottom: '40px'
        }}>
          {/* Account Overview */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '15px',
                borderRadius: '12px',
                backgroundColor: 'rgba(93, 173, 226, 0.1)'
              }}>
                <User size={40} color="var(--accent-color)" />
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}>
                Account Overview
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                <Mail size={18} />
                <span>{user?.email || 'user@example.com'}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                <Shield size={18} />
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: user?.role === 'admin' ? 'rgba(139, 111, 71, 0.2)' : 'rgba(93, 173, 226, 0.2)',
                  color: user?.role === 'admin' ? 'var(--secondary-color)' : 'var(--accent-color)',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}>
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                <Calendar size={18} />
                <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
              }}>
                <Clock size={18} />
                <span>Member for {calculateAccountAge(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{
              fontSize: '1.4rem',
              color: 'var(--text-primary)',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/report')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '15px 20px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <PlusCircle size={20} />
                Submit New Report
              </button>
              <button
                onClick={() => navigate('/my-reports')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '15px 20px',
                  backgroundColor: 'rgba(93, 173, 226, 0.1)',
                  color: 'var(--accent-color)',
                  border: '1px solid var(--accent-color)',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <Eye size={20} />
                View My Reports
              </button>
            </div>
          </div>
        </div>

        {/* Recent Campus Reports */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{
            fontSize: '1.4rem',
            color: 'var(--text-primary)',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={24} />
            Recent Campus Reports (All Users)
          </h3>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Loading...</p>
          ) : displayedReports.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No reports yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayedReports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => openDetailModal(report)}
                  style={{
                    padding: '18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                      {report.title}
                    </h4>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: getCategoryColor(report.category) + '30',
                      color: getCategoryColor(report.category),
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {getCategoryLabel(report.category)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor:
                        report.status === 'pending' ? 'rgba(255, 215, 0, 0.2)' :
                          report.status === 'in progress' ? 'rgba(135, 206, 235, 0.2)' : 'rgba(144, 238, 144, 0.2)',
                      color:
                        report.status === 'pending' ? '#ffd700' :
                          report.status === 'in progress' ? '#87ceeb' : '#90ee90',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {report.status.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} />
                      {new Date(report.date || report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {allReports.length > 5 && (
            <button
              onClick={() => setShowAllReports(!showAllReports)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: 'var(--accent-color)',
                border: '1px solid var(--accent-color)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(93, 173, 226, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {showAllReports ? 'Show Less' : 'View All Recent Reports'}
            </button>
          )}
        </div>

        {/* Detail Modal - Same as ReportList */}
        {showDetailModal && selectedReport && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }} onClick={closeDetailModal}>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-color)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                padding: '25px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.5rem' }}>Report Details</h2>
                <button onClick={closeDetailModal} style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s'
                }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={24} color="var(--text-primary)" />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '25px' }}>
                {/* Image */}
                {selectedReport.photoUrl && (
                  <img
                    src={`http://localhost:3000${selectedReport.photoUrl}`}
                    alt={selectedReport.title}
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}
                  />
                )}

                {/* Title and Category */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: getCategoryColor(selectedReport.category),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}>
                      {getCategoryLabel(selectedReport.category)}
                    </span>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor:
                        selectedReport.status === 'pending' ? 'rgba(255, 215, 0, 0.9)' :
                          selectedReport.status === 'in progress' ? 'rgba(135, 206, 235, 0.9)' : 'rgba(144, 238, 144, 0.9)',
                      color: '#333',
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}>
                      {selectedReport.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 style={{ margin: '10px 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>{selectedReport.title}</h3>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Description</h4>
                  <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedReport.description}</p>
                </div>

                {/* Date */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Date</h4>
                  <p style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    {new Date(selectedReport.date || selectedReport.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Location */}
                {(selectedReport.mapsLink || (selectedReport.location?.lat && selectedReport.location?.lng)) && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Location</h4>

                    {/* Google Maps Embed */}
                    {selectedReport.mapsLink ? (
                      <>
                        <div style={{
                          marginBottom: '15px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          height: '300px'
                        }}>
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedReport.location?.lat || 0},${selectedReport.location?.lng || 0}&zoom=15`}
                          />
                        </div>
                        <a
                          href={selectedReport.mapsLink}
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
                            fontFamily: 'inherit',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 173, 226, 0.2)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 173, 226, 0.1)'}
                        >
                          <MapPin size={18} />
                          Open in Google Maps
                        </a>
                      </>
                    ) : (
                      <>
                        <div style={{
                          marginBottom: '15px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          height: '300px'
                        }}>
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedReport.location.lat},${selectedReport.location.lng}&zoom=15`}
                          />
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.location.lat},${selectedReport.location.lng}`}
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
                            fontFamily: 'inherit',
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
                )}

                {/* Submitted Date */}
                <div style={{
                  marginTop: '25px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}>
                  Submitted on {new Date(selectedReport.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
