"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/create-report.css"

export const CreateReportPage = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photoBase64: "",
    location: { lat: -6.2, lng: 106.8, address: "" },
    aiAnalysis: null,
  })

  const [photoPreview, setPhotoPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [step, setStep] = useState(1)

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target.result.split(",")[1]
        setFormData({ ...formData, photoBase64: base64, aiAnalysis: null })
        setPhotoPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzePhotoWithAI = async () => {
    if (!formData.photoBase64) {
      setMessage("Please select a photo first")
      return
    }

    setAiLoading(true)
    setMessage("")

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/detect-damage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photoBase64: formData.photoBase64,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      const data = await response.json()
      setFormData({ ...formData, aiAnalysis: data.analysis })
      setMessage("AI analysis completed successfully!")
    } catch (error) {
      setMessage(`AI Analysis Error: ${error.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLocationChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      location: { ...formData.location, [name]: value },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (!formData.title || !formData.photoBase64 || !formData.location) {
        throw new Error("Please fill all required fields")
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          photoBase64: formData.photoBase64,
          location: formData.location,
          aiAnalysis: formData.aiAnalysis,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      setMessage("Report created successfully!")
      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-report-page">
      <header className="report-header">
        <div className="header-content">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            <i className="fas fa-chevron-left"></i> Back
          </button>
          <h1>Report Facility Damage - CampusReport</h1>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
          </div>
        </div>
      </header>

      <main className="report-content">
        <form onSubmit={handleSubmit} className="report-form">
          {/* Step 1: Photo Upload with AI Analysis */}
          {step === 1 && (
            <div className="form-step">
              <h2>Step 1: Take or Upload Photo</h2>
              <div className="photo-upload-area">
                {photoPreview ? (
                  <div className="photo-preview">
                    <img src={photoPreview || "/placeholder.svg"} alt="Damage photo" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview("")
                        setFormData({ ...formData, photoBase64: "", aiAnalysis: null })
                      }}
                      className="change-photo-btn"
                    >
                      <i className="fas fa-times"></i> Change Photo
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Click to upload or drag and drop</p>
                    <small>PNG, JPG up to 10MB</small>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} hidden />
              </div>

              {photoPreview && (
                <div className="ai-section">
                  <button
                    type="button"
                    onClick={analyzePhotoWithAI}
                    className={`analyze-btn ${aiLoading ? "loading" : ""}`}
                    disabled={aiLoading}
                  >
                    <span className="button-text">
                      <i className="fas fa-brain"></i> Analyze with AI
                    </span>
                    <span className="loading-spinner">
                      <i className="fas fa-spinner fa-spin"></i>
                    </span>
                  </button>

                  {formData.aiAnalysis && (
                    <div className="ai-results">
                      <h3>
                        <i className="fas fa-check-circle"></i> AI Analysis Results
                      </h3>
                      <div className="result-item">
                        <strong>Detected Object:</strong>
                        <p>{formData.aiAnalysis.detected_object}</p>
                      </div>
                      <div className="result-item">
                        <strong>Damage Type:</strong>
                        <p>{formData.aiAnalysis.damage_type}</p>
                      </div>
                      <div className="result-item">
                        <strong>Severity:</strong>
                        <p className={`severity-${formData.aiAnalysis.severity}`}>
                          {formData.aiAnalysis.severity.toUpperCase()}
                        </p>
                      </div>
                      <div className="result-item">
                        <strong>Repair Recommendation:</strong>
                        <p>{formData.aiAnalysis.repair_recommendation}</p>
                      </div>
                      <div className="result-item">
                        <strong>Confidence Level:</strong>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: `${formData.aiAnalysis.confidence_level * 100}%` }}
                          ></div>
                        </div>
                        <small>{(formData.aiAnalysis.confidence_level * 100).toFixed(1)}%</small>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (photoPreview) {
                    setStep(2)
                  } else {
                    setMessage("Please upload a photo first")
                  }
                }}
                className="next-btn"
                disabled={!photoPreview || aiLoading}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}

          {/* Step 2: Report Details */}
          {step === 2 && (
            <div className="form-step">
              <h2>Step 2: Report Details</h2>

              <div className="form-group">
                <label htmlFor="title">
                  <i className="fas fa-heading"></i> Report Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={
                    formData.aiAnalysis ? formData.aiAnalysis.detected_object : "e.g., Broken Window in Building A"
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <i className="fas fa-align-left"></i> Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={
                    formData.aiAnalysis
                      ? `AI detected: ${formData.aiAnalysis.repair_recommendation}`
                      : "Provide additional details about the damage..."
                  }
                  rows="4"
                  disabled={loading}
                ></textarea>
              </div>

              {formData.aiAnalysis && (
                <div className="ai-info-box">
                  <i className="fas fa-lightbulb"></i>
                  <p>
                    AI Analysis suggests: <strong>{formData.aiAnalysis.repair_recommendation}</strong>
                  </p>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setStep(1)} className="back-step-btn" disabled={loading}>
                  <i className="fas fa-chevron-left"></i> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="next-btn" disabled={loading}>
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="form-step">
              <h2>Step 3: Location Information</h2>

              <div className="form-group">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt"></i> Location Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  placeholder="e.g., Building A, Room 101"
                  disabled={loading}
                />
              </div>

              <div className="location-note">
                <i className="fas fa-info-circle"></i>
                <p>
                  Default coordinates: Latitude {formData.location.lat.toFixed(2)}, Longitude{" "}
                  {formData.location.lng.toFixed(2)}
                </p>
              </div>

              <div className="photo-summary">
                <h3>Summary</h3>
                {photoPreview && (
                  <img src={photoPreview || "/placeholder.svg"} alt="Summary" className="summary-image" />
                )}
                <p>
                  <strong>Title:</strong> {formData.title}
                </p>
                <p>
                  <strong>Description:</strong> {formData.description || "N/A"}
                </p>
                <p>
                  <strong>Location:</strong> {formData.location.address || "Default location"}
                </p>
                {formData.aiAnalysis && (
                  <>
                    <p>
                      <strong>AI Detected:</strong> {formData.aiAnalysis.detected_object}
                    </p>
                    <p>
                      <strong>Damage Type:</strong> {formData.aiAnalysis.damage_type}
                    </p>
                  </>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setStep(2)} className="back-step-btn" disabled={loading}>
                  <i className="fas fa-chevron-left"></i> Back
                </button>
                <button type="submit" className={`submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
                  <span className="button-text">Submit Report</span>
                  <span className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                  </span>
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`message ${message.includes("successfully") || message.includes("completed") ? "success" : "error"}`}
            >
              {message}
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
