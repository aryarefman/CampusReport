"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/dashboard.css"

export const DashboardPage = () => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/user/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f39c12",
      in_progress: "#3498db",
      completed: "#2ecc71",
      rejected: "#e74c3c",
    }
    return colors[status] || "#95a5a6"
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: "#2ecc71",
      medium: "#f39c12",
      high: "#e74c3c",
      critical: "#c0392b",
    }
    return colors[severity] || "#95a5a6"
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-tools"></i>
            <h1>CampusReport</h1>
          </div>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            {user?.role === "admin" && (
              <button onClick={() => navigate("/admin/dashboard")} className="admin-btn">
                <i className="fas fa-shield-alt"></i> Admin Panel
              </button>
            )}
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Your Reports</h2>
            <div className="header-actions">
              <button onClick={() => navigate("/map")} className="map-btn">
                <i className="fas fa-map"></i> View Map
              </button>
              <button onClick={() => navigate("/create-report")} className="create-btn">
                <i className="fas fa-plus"></i> Report New Damage
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No reports yet. Start by reporting your first facility issue!</p>
              <button onClick={() => navigate("/create-report")} className="create-btn">
                <i className="fas fa-plus"></i> Create First Report
              </button>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report._id} className="report-card">
                  <div className="report-header">
                    <h3>{report.title}</h3>
                    <div className="report-badges">
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(report.status) }}>
                        {report.status.replace("_", " ").toUpperCase()}
                      </span>
                      {report.aiAnalysis?.severity && (
                        <span
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(report.aiAnalysis.severity) }}
                        >
                          {report.aiAnalysis.severity.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {report.photoBase64 && (
                    <img
                      src={`data:image/jpeg;base64,${report.photoBase64.substring(0, 100)}...`}
                      alt="Report"
                      className="report-image"
                    />
                  )}

                  {report.aiAnalysis && (
                    <div className="ai-analysis">
                      <p>
                        <strong>Detected:</strong> {report.aiAnalysis.detected_object}
                      </p>
                      <p>
                        <strong>Damage Type:</strong> {report.aiAnalysis.damage_type}
                      </p>
                      <p>
                        <strong>Recommendation:</strong> {report.aiAnalysis.repair_recommendation}
                      </p>
                    </div>
                  )}

                  <div className="report-footer">
                    <small>{new Date(report.createdAt).toLocaleDateString()}</small>
                    <button onClick={() => navigate(`/report/${report._id}`)} className="view-btn">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
