import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  FileText, PlusCircle, Shield, User, Mail, Hash,
  CheckCircle, Zap
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <main style={{ padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
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
            CampusReport Dashboard
          </p>
        </header>

        {/* Dashboard Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '25px',
          marginBottom: '40px'
        }}>
          {/* User Card */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
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
                <Hash size={18} />
                <span>ID: {user?.id?.slice(0, 8) || 'N/A'}...</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
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
                backgroundColor: 'rgba(144, 238, 144, 0.1)'
              }}>
                <CheckCircle size={40} color="var(--success-color)" />
              </div>
              <h3 style={{
                fontSize: '1.4rem',
                color: 'var(--text-primary)',
                fontWeight: '600'
              }}>
                Account Status
              </h3>
            </div>
            <p style={{
              fontSize: '1.2rem',
              color: 'var(--success-color)',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Active & Verified
            </p>
            <div>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'rgba(144, 238, 144, 0.2)',
                color: 'var(--success-color)',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Authenticated
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
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
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }}>
                <Zap size={40} color="#d4b106" />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.4rem',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  Quick Actions
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem'
                }}>
                  Manage your reports
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/report')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
              >
                <PlusCircle size={18} />
                Submit Report
              </button>
              <button
                onClick={() => navigate('/my-reports')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: 'var(--primary-color)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--primary-color)';
                }}
              >
                <FileText size={18} />
                My Reports
              </button>
            </div>
          </div>

          {/* Admin Access Card (conditionally rendered) */}
          {user?.role === 'admin' && (
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
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
                  backgroundColor: 'rgba(139, 111, 71, 0.1)'
                }}>
                  <Shield size={40} color="var(--secondary-color)" />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.4rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    Admin Access
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem'
                  }}>
                    Facility Management
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  width: '100%',
                  backgroundColor: 'var(--secondary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Shield size={18} />
                Go to Admin Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <p>© 2025 CampusReport. All rights reserved.</p>
      </footer>
    </div>
  );
}
