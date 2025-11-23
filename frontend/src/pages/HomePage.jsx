"use client"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/home.css"

export const HomePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard")
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="home-page">
      <div className="background-overlay"></div>
      <img src="/image/1.png" alt="Campus" className="food-image food-1" />
      <img src="/image/3.png" alt="Campus" className="food-image food-3" />
      <img src="/image/5.png" alt="Campus" className="food-image food-5" />
      <img src="/image/6.png" alt="Campus" className="food-image food-6" />
      <img src="/image/7.png" alt="Campus" className="food-image food-7" />

      <main className="home-main-content">
        <div className="logo-home">
          <i className="fas fa-tools"></i>
          <h2>CampusReport</h2>
          <p className="logo-desc">Campus Facility Damage Reporting System</p>
        </div>
        <h1>
          Welcome to <span style={{ color: "var(--primary-color)" }}>CampusReport</span>
        </h1>
        <p className="desc">
          Report damaged campus facilities with AI-powered damage detection and verification. Help maintain our campus
          infrastructure with intelligent assessment and timely repairs.
        </p>
        <button onClick={handleGetStarted} className="cta-btn">
          Get Started
        </button>
        <nav className="home-links" aria-label="Authentication links">
          {!isAuthenticated ? (
            <>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigate("/login")
                }}
              >
                Sign In
              </a>{" "}
              |
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigate("/register")
                }}
              >
                Create Account
              </a>
            </>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                navigate("/dashboard")
              }}
            >
              Go to Dashboard
            </a>
          )}
        </nav>
      </main>
    </div>
  )
}
