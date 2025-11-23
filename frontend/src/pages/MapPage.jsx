"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { MapComponent } from "../components/MapComponent"
import "../styles/map.css"

export const MapPage = () => {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const endpoint =
        user?.role === "admin"
          ? `${import.meta.env.VITE_API_URL}/api/reports`
          : `${import.meta.env.VITE_API_URL}/api/reports/user/${user?.id}`

      const response = await fetch(endpoint, {
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

  const getFilteredReports = () => {
    return reports.filter((report) => {
      const matchesSeverity = filterSeverity === "all" || report.aiAnalysis?.severity === filterSeverity
      const matchesStatus = filterStatus === "all" || report.status === filterStatus
      return matchesSeverity && matchesStatus
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

  const filteredReports = getFilteredReports()

  return (
    <div className="map-page">
      <header className="map-header">
        <div className="header-content">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            <i className="fas fa-chevron-left"></i> Back to Dashboard
          </button>
          <h1>
            <i className="fas fa-map"></i> Facility Reports Map
          </h1>
        </div>
      </header>

      <main className="map-container-main">
        <div className="map-wrapper">
          {loading ? (
            <div className="loading-map">Loading map...</div>
          ) : (
            <MapComponent
              reports={filteredReports}
              onMarkerClick={setSelectedReport}
              getSeverityColor={getSeverityColor}
            />
          )}
        </div>

        <aside className="map-sidebar">
          <div className="sidebar-content">
            <h2>Report Filters</h2>

            <div className="filter-group">
              <label htmlFor="severity-filter">
                <i className="fas fa-exclamation-triangle"></i> Severity
              </label>
              <select
                id="severity-filter"
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

            <div className="filter-group">
              <label htmlFor="status-filter">
                <i className="fas fa-tasks"></i> Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="reports-list">
              <h3>Reports ({filteredReports.length})</h3>
              <div className="reports-scroll">
                {filteredReports.length === 0 ? (
                  <p className="no-reports">No reports found</p>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report._id}
                      className={`report-item ${selectedReport?._id === report._id ? "active" : ""}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="report-item-header">
                        <h4>{report.title}</h4>
                        <div className="item-badges">
                          <span
                            className="severity-badge"
                            style={{ backgroundColor: getSeverityColor(report.aiAnalysis?.severity) }}
                          >
                            {report.aiAnalysis?.severity || "N/A"}
                          </span>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(report.status) }}>
                            {report.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      {report.aiAnalysis && <p className="report-item-info">{report.aiAnalysis.damage_type}</p>}
                      <small>{new Date(report.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {selectedReport && (
          <div className="report-detail-popup">
            <button onClick={() => setSelectedReport(null)} className="close-popup">
              <i className="fas fa-times"></i>
            </button>
            <div className="popup-content">
              <h3>{selectedReport.title}</h3>
              <div className="popup-badges">
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

              {selectedReport.location?.address && (
                <p>
                  <strong>Location:</strong> {selectedReport.location.address}
                </p>
              )}

              {selectedReport.description && (
                <p>
                  <strong>Description:</strong> {selectedReport.description}
                </p>
              )}

              {selectedReport.aiAnalysis && (
                <div className="ai-info">
                  <h4>AI Analysis</h4>
                  <p>
                    <strong>Detected:</strong> {selectedReport.aiAnalysis.detected_object}
                  </p>
                  <p>
                    <strong>Damage:</strong> {selectedReport.aiAnalysis.damage_type}
                  </p>
                  <p>
                    <strong>Recommendation:</strong> {selectedReport.aiAnalysis.repair_recommendation}
                  </p>
                </div>
              )}

              <small>Reported: {new Date(selectedReport.createdAt).toLocaleString()}</small>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
