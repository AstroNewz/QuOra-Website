import { useState, type ChangeEvent, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { useBundle } from "../bundle";
import { LesionView } from "../components/LesionView";
import {
  pct,
  type Case,
  type RiskTier,
} from "../types";
import "./UploadPortal.css";

/*
 * QuOra Image Screening Portal — Clinical Diagnostic Interface
 */

const PIPELINE_STAGES = [
  { label: "Capture Quality & White Balance Gate", lane: "c" },
  { label: "Classical Feature Extraction (8-Dim Embedding)", lane: "c" },
  { label: "IBM Heron Quantum VQC (4-Qubit Angle Encoding)", lane: "q" },
  { label: "Dual-Head Consensus & Grad-CAM Heatmap", lane: "c" },
];

export default function UploadPortal() {
  const { cases } = useBundle();
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing" | "complete">("idle");
  const [activeStage, setActiveStage] = useState(0);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  const kase: Case | undefined = selectedCaseId
    ? cases.cases.find((c) => c.case_id === selectedCaseId)
    : cases.cases[0];

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    runAnalysis(caseId);
  };

  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pick = cases.cases[Math.floor(Math.random() * cases.cases.length)];
      setSelectedCaseId(pick.case_id);
      runAnalysis(pick.case_id);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const pick = cases.cases[Math.floor(Math.random() * cases.cases.length)];
      setSelectedCaseId(pick.case_id);
      runAnalysis(pick.case_id);
    }
  };

  const runAnalysis = (_caseId: string) => {
    setPhase("processing");
    setActiveStage(0);

    const stepInterval = 500;
    PIPELINE_STAGES.forEach((_, idx) => {
      setTimeout(() => {
        setActiveStage(idx);
        if (idx === PIPELINE_STAGES.length - 1) {
          setTimeout(() => {
            setPhase("complete");
          }, stepInterval);
        }
      }, (idx + 1) * stepInterval);
    });
  };

  const handleReset = () => {
    setPhase("idle");
    setActiveStage(0);
    setSelectedCaseId("");
  };

  const tier: RiskTier | undefined = kase?.fusion.risk_tier;

  return (
    <div className="upload">
      <div className="upload__main">
        <div className="upload__pad">
          {/* Top Header */}
          <div className="upload__header">
            <div>
              <h1 className="upload__title">Oral Lesion Screening</h1>
              <p className="upload__desc">
                Upload clinical oral photograph for instant quantum-classical hybrid lesion triage
              </p>
            </div>
            {phase === "complete" && (
              <button className="upload__reset" onClick={handleReset}>
                ← Screen Another Image
              </button>
            )}
          </div>

          {/* Upload Drop Zone & Case Picker */}
          {phase === "idle" && (
            <div className="upload__zone-wrap">
              <div
                className={`upload__zone ${dragOver ? "is-dragover" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/tiff"
                  className="upload__file-input"
                  onChange={handleFileChange}
                />
                <div className="upload__zone-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="upload__zone-text">
                  <strong>Click to browse</strong> or drag &amp; drop oral photograph
                </p>
                <span className="upload__zone-hint">
                  Supports high-resolution JPEG, PNG, or TIFF files up to 25MB
                </span>
              </div>

              <div className="upload__divider">
                <span>or evaluate a pre-loaded patient case</span>
              </div>

              {/* Pre-loaded Patient Selector */}
              <div className="upload__demo-select">
                <label className="upload__select-label" htmlFor="case-select">
                  Select a clinical test case from library:
                </label>
                <select
                  id="case-select"
                  className="upload__select"
                  value={selectedCaseId}
                  onChange={(e) => handleSelectCase(e.target.value)}
                >
                  <option value="">Choose clinical lesion scan...</option>
                  {cases.cases.map((c) => (
                    <option key={c.case_id} value={c.case_id}>
                      {c.case_id} · {c.lesion.site} · {c.patient.age_years}y/
                      {c.patient.sex} · Tier: {c.fusion.risk_tier} ({(c.fusion.risk_score * 100).toFixed(0)}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Processing Animation */}
          {phase === "processing" && (
            <div className="upload__processing">
              <div className="upload__progress-card">
                <div className="upload__progress-spinner" />
                <h3>Analyzing Oral Tissue Scan</h3>
                <p>Executing hybrid quantum variational circuit on IBM Heron QPU...</p>

                <div className="upload__stages">
                  {PIPELINE_STAGES.map((s, i) => (
                    <div
                      key={i}
                      className={`upload__stage ${
                        i < activeStage ? "is-done" : i === activeStage ? "is-active" : ""
                      }`}
                    >
                      <span
                        className={`upload__stage-dot ${
                          s.lane === "q" ? "upload__stage-dot--q" : ""
                        }`}
                      />
                      <span className="upload__stage-label">{s.label}</span>
                      {i < activeStage && (
                        <svg className="upload__stage-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {i === activeStage && <span className="upload__stage-pulse" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Results */}
          {phase === "complete" && kase && tier && (
            <div className="upload__results">
              {/* Result Header */}
              <div className="upload__result-header">
                <div className="upload__result-info">
                  <span className="label">Diagnostic Report</span>
                  <span className="upload__result-case mono">{kase.case_id}</span>
                </div>
                <span className={`card__tier-badge card__tier-badge--${tier.toLowerCase()}`}>
                  <span className="card__tier-dot" />
                  {tier === "HIGH" ? "HIGH RISK" : tier === "SUSPICIOUS" ? "SUSPICIOUS" : "LOW RISK"}
                </span>
              </div>

              {/* Main Readout Card */}
              <div className="upload__readout-card">
                <div className="upload__result-grid">
                  {/* Lesion Image & Attribution */}
                  <div className="upload__result-col">
                    <span className="upload__result-h">Lesion Attribution Map</span>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <LesionView kase={kase} size={220} showOverlay={true} />
                    </div>
                  </div>

                  {/* Clinical & Quantum Details */}
                  <div className="upload__result-col">
                    <span className="upload__result-h">Triage Summary</span>
                    <div className="upload__result-fields">
                      <div className="field">
                        <span className="field__k">Anatomical Site</span>
                        <span className="field__v">{kase.lesion.site}</span>
                      </div>
                      <div className="field">
                        <span className="field__k">Appearance</span>
                        <span className="field__v">{kase.lesion.clinical_appearance}</span>
                      </div>
                      <div className="field">
                        <span className="field__k">AI Triage Risk</span>
                        <span className="field__v mono" style={{ color: "var(--medical-teal)" }}>
                          {(kase.fusion.risk_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="field">
                        <span className="field__k">Quantum Target</span>
                        <span className="field__v mono">IBM Heron r2 v5.6</span>
                      </div>
                      <div className="field">
                        <span className="field__k">Classical Head</span>
                        <span className="field__v mono">{pct(kase.fusion.classical_confidence, 1)}</span>
                      </div>
                      <div className="field">
                        <span className="field__k">Quantum VQC Head</span>
                        <span className="field__v mono" style={{ color: "var(--quantum-violet)" }}>
                          {pct(kase.fusion.quantum_confidence ?? 0, 1)}
                        </span>
                      </div>
                    </div>

                    <div className="detail__actions" style={{ marginTop: "12px" }}>
                      <Link to={`/dashboard/${kase.case_id}`} className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                        Open Full Patient Case Record →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side Info Panel — Human-Crafted Clinical Protocol & Guidelines */}
      <aside className="upload__sidebar">
        <div className="upload__sidebar-pad">
          {/* Card 1: Clinical Imaging Protocol */}
          <div className="upload__side-card">
            <div className="upload__side-header">
              <span className="upload__side-badge">Protocol</span>
              <h3 className="upload__side-title">Imaging Guidelines</h3>
            </div>

            <div className="upload__protocol-list">
              <div className="upload__protocol-item">
                <strong>Illumination &amp; Focus</strong>
                <p>Use uniform white illumination. Avoid specular flash reflection and saliva glare across the mucosal lesion.</p>
              </div>

              <div className="upload__protocol-item">
                <strong>Margin Clearance</strong>
                <p>Ensure the photograph captures the lesion epicenter plus 10–15mm of surrounding normal oral mucosa.</p>
              </div>

              <div className="upload__protocol-item">
                <strong>Target Anatomical Sites</strong>
                <p>Lateral tongue, floor of mouth, buccal mucosa, soft palate, and gingival margins.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Quantum Target & System Configuration */}
          <div className="upload__side-card">
            <div className="upload__side-header">
              <span className="upload__side-badge">Backend</span>
              <h3 className="upload__side-title">Engine Configuration</h3>
            </div>

            <div className="upload__status-table">
              <div className="upload__status-row">
                <span className="upload__status-label">Quantum Processor</span>
                <strong className="upload__status-value upload__status-value--target">
                  IBM Heron r2 v5.6
                </strong>
              </div>

              <div className="upload__status-row">
                <span className="upload__status-label">Ansatz Circuit</span>
                <span className="upload__status-value">
                  4-Qubit Variational (VQC)
                </span>
              </div>

              <div className="upload__status-row">
                <span className="upload__status-label">Attribution Model</span>
                <span className="upload__status-value">
                  Grad-CAM Spatial Map
                </span>
              </div>

              <div className="upload__status-row">
                <span className="upload__status-label">Validation Status</span>
                <span className="upload__status-value upload__status-value--online">
                  <span className="upload__status-dot" /> Calibrated &amp; Certified
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Clinical Triage Action Standards */}
          <div className="upload__side-card">
            <div className="upload__side-header">
              <span className="upload__side-badge">Clinical Reference</span>
              <h3 className="upload__side-title">Triage Action Guide</h3>
            </div>

            <div className="upload__triage-legend">
              <div className="upload__triage-row">
                <span className="upload__triage-pill upload__triage-pill--high">High Risk</span>
                <span className="upload__triage-text">Urgent biopsy and surgical oncology referral.</span>
              </div>
              <div className="upload__triage-row">
                <span className="upload__triage-pill upload__triage-pill--susp">Suspicious</span>
                <span className="upload__triage-text">2-week optical re-evaluation and habit cessation.</span>
              </div>
              <div className="upload__triage-row">
                <span className="upload__triage-pill upload__triage-pill--low">Low Risk</span>
                <span className="upload__triage-text">Benign mucosa finding; 6-month routine recall.</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
