import { useState, type FormEvent } from "react";
import { BrandMark } from "../components/Brand";
import { useAuth } from "../auth";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!userId.trim()) {
      setError("Please enter your staff ID or email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(userId, password);
      if (!ok) {
        setError("Incorrect password. Please enter the valid password.");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="login">
      {/* Atmospheric background */}
      <div className="login__bg">
        <div className="login__orb login__orb--teal" />
        <div className="login__orb login__orb--violet" />
      </div>

      <div className="login__container">
        {/* Left panel — Branding */}
        <div className="login__hero">
          <div className="login__hero-content">
            <div className="login__logo">
              <BrandMark size={56} weight={5} />
            </div>
            <h1 className="login__title">QuOra</h1>
            <p className="login__subtitle">
              Hybrid Quantum–Classical<br />Oral Cancer Screening
            </p>

            <div className="login__features">
              <div className="login__feat">
                <div className="login__feat-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 9h6l-6 6h6" />
                  </svg>
                </div>
                <div>
                  <strong>Quantum-Enhanced Analysis</strong>
                  <span>4-qubit variational circuit on IBM Heron QPU</span>
                </div>
              </div>

              <div className="login__feat">
                <div className="login__feat-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <div>
                  <strong>Triage Decision Support</strong>
                  <span>Risk-stratified screening with Grad-CAM explainability</span>
                </div>
              </div>

              <div className="login__feat">
                <div className="login__feat-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <strong>Built for Field Deployment</strong>
                  <span>Offline fallback, no specialized hardware required</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — Sign-in form */}
        <div className="login__form-panel">
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__form-head">
              <h2 className="login__form-title">Sign in to QuOra</h2>
              <p className="login__form-sub">
                Access the diagnostic screening portal
              </p>
            </div>

            <div className="login__fields">
              <div className="login__field">
                <label className="login__label" htmlFor="login-id">
                  User ID
                </label>
                <input
                  id="login-id"
                  className="login__input"
                  type="text"
                  placeholder="Enter your staff ID or email"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="login__field">
                <label className="login__label" htmlFor="login-pw">
                  Password
                </label>
                <input
                  id="login-pw"
                  className="login__input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="login__error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              className="login__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login__spinner" />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="login__footer">
              <span className="login__footer-note">
                Authorized personnel only · All sessions are logged
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
