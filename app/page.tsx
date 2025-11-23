"use client"

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff6b35 0%, #e85d2a 100%)",
        color: "#fff",
        textAlign: "center",
        fontFamily: "Sen, sans-serif",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>KampusCare AI+Maps</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem", maxWidth: "600px" }}>
        Campus Facility Damage Reporting System with AI-Powered Detection
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <a
          href="/dashboard"
          style={{
            padding: "0.75rem 1.5rem",
            background: "#fff",
            color: "#ff6b35",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            transition: "transform 0.2s",
          }}
        >
          Go to Frontend
        </a>
        <a
          href="/api"
          style={{
            padding: "0.75rem 1.5rem",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            border: "1px solid #fff",
            transition: "background 0.2s",
          }}
        >
          Backend API Docs
        </a>
      </div>
      <p style={{ marginTop: "3rem", fontSize: "0.9rem", opacity: 0.8 }}>
        This Next.js page serves as an entry point. The main React frontend is running separately at /frontend
      </p>
    </div>
  )
}
