import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaArrowRight } from "react-icons/fa";
import "../styles/index.css";

function UsernamePrompt() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Username is required");
      setIsSubmitting(false);
      return;
    }

    try {
      localStorage.setItem("username", trimmedUsername);
      console.log("Username saved to localStorage:", trimmedUsername);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate async
      navigate("/app");
    } catch (err) {
      console.error("Failed to save username:", err);
      setError("Failed to save username");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "1.5rem" }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        background: "var(--card-bg)",
        padding: "2rem",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-md)",
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Welcome
        </h1>
        <p style={{ fontSize: "clamp(0.875rem, 3vw, 1rem)", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Please enter your username to get started
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ textAlign: "left" }}>
            <label htmlFor="username" style={{ fontSize: "clamp(0.875rem, 2.5vw, 1rem)", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "0.25rem" }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <FaUser style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.25rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                  color: "var(--text-primary)",
                  background: "var(--background)",
                }}
              />
            </div>
            {error && <p style={{ color: "var(--expense)", fontSize: "clamp(0.75rem, 2vw, 0.875rem)", marginTop: "0.25rem", textAlign: "left" }}>{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.75rem",
              background: "var(--primary-dark)",
              color: "var(--background)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {isSubmitting ? "Saving..." : <>Continue <FaArrowRight /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UsernamePrompt;