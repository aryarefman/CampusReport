"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/admin-dashboard.css"

export const AdminDashboardPage = () => {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard")
      return
    }
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (reportsList) => {
    const stats = {
      total: reportsList.length,
      pending: reportsList.filter((r) => r.status === "pending").length,
      inProgress: reportsList.filter((r) => r.status === "in_progress").length,
      completed: reportsList.filter((r) => r.status === "completed").length,
    }
    setStats(stats)
  }

  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updated = await response.json()
        setReports(reports.map((r) => (r._id === reportId ? updated.report : r)))
        setSelectedReport(updated.report)
        calculateStats(reports.map((r) => (r._id === reportId ? updated.report : r)))
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getFilteredReports = () => {
    return reports.filter((report) => {
      const matchesStatus = filterStatus === "all" || report.status === filterStatus
      const matchesSeverity = filterSeverity === "all" || report.aiAnalysis?.severity === filterSeverity
      return matchesStatus && matchesSeverity
    })
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

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f39c12",
      in_progress: "#3498db",
      completed: "#2ecc71",
      rejected: "#e74c3c",
    }
    return colors[status] || "#95a5a6"
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const filteredReports = getFilteredReports()

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-shield-alt"></i>
            <h1>CampusReport - Admin Dashboard</h1>
          </div>
          <div className="user-info">
            <span>{user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-content">
        <section className="stats-section">
          <h2>Report Verification Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <i className="fas fa-file-alt"></i>
              <div>
                <h3>{stats.total}</h3>
                <p>Total Reports</p>
              </div>
            </div>
            <div className="stat-card pending">
              <i className="fas fa-clock"></i>
              <div>
                <h3>{stats.pending}</h3>
                <p>Pending Verification</p>
              </div>
            </div>
            <div className="stat-card in-progress">
              <i className="fas fa-wrench"></i>
              <div>
                <h3>{stats.inProgress}</h3>
                <p>In Progress Repair</p>
              </div>
            </div>
            <div className="stat-card completed">
              <i className="fas fa-check-circle"></i>
              <div>
                <h3>{stats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>
        </section>

        <section className="reports-section">
          <div className="section-header">
            <h2>Damage Reports for Verification</h2>
            <div className="filters">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No reports to verify</p>
            </div>
          ) : (
            <div className="reports-table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Reporter</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Damage Type</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report._id}>
                      <td className="title-cell">
                        <button onClick={() => setSelectedReport(report)} className="title-btn">
                          {report.title}
                        </button>
                      </td>
                      <td>{report.userId?.username || "Unknown"}</td>
                      <td>
                        <span
                          className="badge severity"
                          style={{ backgroundColor: getSeverityColor(report.aiAnalysis?.severity) }}
                        >
                          {report.aiAnalysis?.severity || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className="badge status" style={{ backgroundColor: getStatusColor(report.status) }}>
                          {report.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>{report.aiAnalysis?.damage_type || "N/A"}</td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => setSelectedReport(report)} className="view-btn">
                          <i className="fas fa-eye"></i> Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedReport && (
          <div className="report-detail-modal">
            <div className="modal-overlay" onClick={() => setSelectedReport(null)}></div>
            <div className="modal-content">
              <button onClick={() => setSelectedReport(null)} className="close-btn">
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-header">
                <h2>{selectedReport.title}</h2>
                <div className="modal-badges">
                  <span className="badge" style={{ backgroundColor: getStatusColor(selectedReport.status) }}>
                    {selectedReport.status.replace("_", " ").toUpperCase()}
                  </span>
                  {selectedReport.aiAnalysis?.severity && (
                    <span
                      className="badge"
                      style={{ backgroundColor: getSeverityColor(selectedReport.aiAnalysis.severity) }}
                    >
                      {selectedReport.aiAnalysis.severity.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <h3>Report Information</h3>
                  <p>
                    <strong>Reporter:</strong> {selectedReport.userId?.username} ({selectedReport.userId?.email})
                  </p>
                  <p>
                    <strong>Date Submitted:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedReport.location?.address || "Not specified"}
                  </p>
                  {selectedReport.description && (
                    <p>
                      <strong>Description:</strong> {selectedReport.description}
                    </p>
                  )}
                </div>

                {selectedReport.aiAnalysis && (
                  <div className="modal-section ai-section">
                    <h3>AI Analysis Results</h3>
                    <p>
                      <strong>Detected Object:</strong> {selectedReport.aiAnalysis.detected_object}
                    </p>
                    <p>
                      <strong>Damage Type:</strong> {selectedReport.aiAnalysis.damage_type}
                    </p>
                    <p>
                      <strong>Repair Recommendation:</strong> {selectedReport.aiAnalysis.repair_recommendation}
                    </p>
                    <p>
                      <strong>Confidence Level:</strong> {(selectedReport.aiAnalysis.confidence_level * 100).toFixed(1)}
                      %
                    </p>
                  </div>
                )}

                <div className="modal-section status-section">
                  <h3>Update Repair Status</h3>
                  <div className="status-buttons">
                    {["pending", "in_progress", "completed", "rejected"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedReport._id, status)}
                        className={`status-btn ${selectedReport.status === status ? "active" : ""}`}
                        disabled={updatingStatus}
                        style={
                          selectedReport.status === status
                            ? { backgroundColor: getStatusColor(status), color: "#fff" }
                            : {}
                        }
                      >
                        {status === "pending"
                          ? "Verify Needed"
                          : status === "in_progress"
                            ? "Repair In Progress"
                            : status === "completed"
                              ? "Repair Done"
                              : "Reject Report"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={() => navigate(`/map?highlight=${selectedReport._id}`)} className="map-btn">
                  <i className="fas fa-map"></i> View on Map
                </button>
                <button onClick={() => setSelectedReport(null)} className="close-modal-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
