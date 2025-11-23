"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/auth.css"

export const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      await login(username, password)
      navigate("/dashboard")
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="background-overlay"></div>
      <img src="/image/1.png" alt="Campus" className="food-image food-1" />
      <img src="/image/3.png" alt="Campus" className="food-image food-3" />
      <img src="/image/5.png" alt="Campus" className="food-image food-5" />
      <img src="/image/6.png" alt="Campus" className="food-image food-6" />
      <img src="/image/7.png" alt="Campus" className="food-image food-7" />

      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="logo">
            <i className="fas fa-tools"></i>
            <h2>KampusCare</h2>
            <p>Campus Facility Care System</p>
          </div>

          <div className="input-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i> Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={`auth-button ${loading ? "loading" : ""}`} disabled={loading}>
            <span className="button-text">Login</span>
            <span className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </span>
          </button>

          {message && <div className={`message ${message.includes("Invalid") ? "error" : "success"}`}>{message}</div>}

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
