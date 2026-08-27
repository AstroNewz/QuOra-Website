import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AppTutorialModal.css";

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    step: "01",
    badge: "Step 1: Patient Triage Queue",
    title: "Prioritize High-Risk Patients First",
    desc: "The Triage Dashboard automatically risk-stratifies incoming oral lesion scans into three clinical tiers:",
    bullets: [
      {
        icon: "■",
        color: "var(--brick-bright)",
        title: "High Risk Alerts (Red)",
        text: "Urgent cases with high malignancy probability. Flagged for immediate specialist biopsy.",
      },
      {
        icon: "▲",
        color: "var(--amber-bright)",
        title: "Suspicious Findings (Amber)",
        text: "Potential precancerous lesions requiring secondary optical follow-up.",
      },
      {
        icon: "●",
        color: "var(--teal-bright)",
        title: "Low Risk / Benign (Teal)",
        text: "Benign oral mucosa conditions routed to routine 6-month recall.",
      },
    ],
    actionHint: "Tip: Click any KPI card or filter tab above the table to isolate urgent cases.",
    iconType: "queue",
  },
  {
    step: "02",
    badge: "Step 2: Instant Image Screening",
    title: "Upload Lesion Scans for Quantum AI Analysis",
    desc: "Click on 'Image Screening' in the top navigation bar to analyze new patient oral photographs:",
    bullets: [
      {
        icon: "1",
        color: "var(--teal-bright)",
        title: "Drag & Drop Image Upload",
        text: "Supports JPEG, PNG, and TIFF formats up to 25MB from any lab camera or smartphone.",
      },
      {
        icon: "2",
        color: "var(--violet-bright)",
        title: "Hybrid Quantum VQC Engine",
        text: "Executes 4-qubit variational quantum circuits with 2,048 measurement shots for enhanced feature space mapping.",
      },
      {
        icon: "3",
        color: "var(--teal-bright)",
        title: "Instant Triage Decision",
        text: "Returns risk score, confidence margin, and synchronized classical vs. quantum readout in under 3 seconds.",
      },
    ],
    actionHint: "Tip: You can test the screening workflow anytime using pre-loaded cases from the library.",
    iconType: "screen",
  },
  {
    step: "03",
    badge: "Step 3: Clinical Drill-Down & Verification",
    title: "Inspect Explainability Heatmaps & Telemetry",
    desc: "Click on any patient card on the dashboard to open the side diagnostic review drawer:",
    bullets: [
      {
        icon: "H",
        color: "var(--violet-bright)",
        title: "Grad-CAM Lesion Heatmap",
        text: "Visual spatial attribution showing exactly which oral tissue areas drove the AI's risk assessment.",
      },
      {
        icon: "Z",
        color: "var(--teal-bright)",
        title: "Quantum State Metrics",
        text: "Inspect Pauli-Z expectation values, circuit depth, and quantum state fidelity (0.866).",
      },
      {
        icon: "R",
        color: "var(--brick-bright)",
        title: "Clinician Action & Routing",
        text: "Clear the patient or escalate immediately to an oncology specialist with one click.",
      },
    ],
    actionHint: "Tip: Click 'View Details →' on any patient card to inspect full records.",
    iconType: "analytics",
  },
];

function StepIcon({ type }: { type: string }) {
  if (type === "queue") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
      </svg>
    );
  }
  if (type === "screen") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function AppTutorialModal({ isOpen, onClose }: AppTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const current = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleGoToScreening = () => {
    onClose();
    navigate("/upload");
  };

  return (
    <div className="tutorial-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="tutorial-modal__header">
          <div className="tutorial-modal__badge-row">
            <span className="tutorial-modal__step-pill">{current.badge}</span>
            <span className="tutorial-modal__counter">
              {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <button className="tutorial-modal__close" onClick={onClose} title="Close tutorial">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="tutorial-modal__body">
          <div className="tutorial-modal__hero">
            <div className="tutorial-modal__icon">
              <StepIcon type={current.iconType} />
            </div>
            <div>
              <h2 className="tutorial-modal__title">{current.title}</h2>
              <p className="tutorial-modal__desc">{current.desc}</p>
            </div>
          </div>

          {/* Bullets */}
          <div className="tutorial-modal__list">
            {current.bullets.map((b, i) => (
              <div key={i} className="tutorial-modal__item">
                <div
                  className="tutorial-modal__bullet-icon"
                  style={{ color: b.color, borderColor: b.color }}
                >
                  {b.icon}
                </div>
                <div className="tutorial-modal__bullet-content">
                  <strong className="tutorial-modal__bullet-title">{b.title}</strong>
                  <p className="tutorial-modal__bullet-text">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Hint */}
          <div className="tutorial-modal__hint">
            <span>{current.actionHint}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="tutorial-modal__footer">
          {/* Step dots */}
          <div className="tutorial-modal__dots">
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`tutorial-modal__dot ${i === currentStep ? "is-active" : ""}`}
                onClick={() => setCurrentStep(i)}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="tutorial-modal__btn-group">
            {currentStep === 1 && (
              <button className="btn btn--secondary" onClick={handleGoToScreening}>
                Go to Screening Portal →
              </button>
            )}
            {currentStep > 0 && (
              <button className="btn btn--secondary" onClick={handlePrev}>
                ← Back
              </button>
            )}
            <button className="btn btn--primary" onClick={handleNext}>
              {isLast ? "Start Using Platform →" : "Next Step →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
