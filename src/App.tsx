import {
  NavLink,
  Navigate,
  Route,
  HashRouter as Router,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { BundleProvider } from "./bundle";
import { Brand } from "./components/Brand";
import Dashboard from "./surfaces/Dashboard";
import Login from "./surfaces/Login";
import UploadPortal from "./surfaces/UploadPortal";
import QuantumPanel from "./surfaces/QuantumPanel";
import "./App.css";

/*
 * QuOra Clinical Platform — Enterprise Hospital Triage & Diagnostic Portal
 */

const TABS = [
  { to: "/upload", label: "Image Screening" },
  { to: "/dashboard", label: "Triage Queue" },
  { to: "/quantum", label: "Quantum Analytics" },
];

function UserBadge() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="user-badge">
      <div className="user-badge__profile">
        <div className="user-badge__avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-badge__info">
          <span className="user-badge__name">{user.name}</span>
          <span className="user-badge__role">{user.role}</span>
        </div>
      </div>
      <button
        className="user-badge__logout-btn"
        onClick={logout}
        title="Sign out of QuOra"
        aria-label="Sign out"
      >
        <svg
          className="user-badge__logout-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Sign Out</span>
      </button>
    </div>
  );
}

function Chrome() {
  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead__plate">
          <Brand size={24} />
        </div>

        <nav className="masthead__nav" aria-label="Main Navigation">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) => `tab ${isActive ? "is-active" : ""}`}
            >
              <span className="tab__label">{t.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="masthead__facility">
          <span className="masthead__facility-dot">●</span>
          <span className="masthead__facility-name">Apollo Oncology Hub</span>
          <span className="masthead__facility-tag">Hospital Network</span>
        </div>

        <UserBadge />
      </header>

      <main className="shell__main">
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPortal />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:caseId" element={<Dashboard />} />
          <Route path="/quantum" element={<QuantumPanel />} />
          <Route path="*" element={<Navigate to="/upload" replace />} />
        </Routes>
      </main>

      <footer className="footer-bar">
        <div className="footer-bar__left">
          <span className="footer-bar__status-dot">●</span>
          <span>Quantum Hybrid VQC Engine <strong>Active</strong></span>
          <span className="footer-bar__sep">·</span>
          <span>Quantum Target: <strong>IBM Heron r2 v5.6</strong></span>
        </div>
        <div className="footer-bar__right">
          <span>QuOra Clinical Decision Support Platform v2.4</span>
        </div>
      </footer>
    </div>
  );
}

/** Gate: show login if unauthenticated, app shell if logged in */
function AuthGate() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <BundleProvider>
      <Chrome />
    </BundleProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </Router>
  );
}
