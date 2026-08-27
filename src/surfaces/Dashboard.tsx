import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useBundle } from "../bundle";
import { AppTutorialModal } from "../components/AppTutorialModal";
import CaseDetail from "../components/CaseDetail";
import { relativeAge } from "../data";
import {
  REVIEW_LABEL,
  TIER_ORDER,
  pct,
  type Case,
  type RiskTier,
} from "../types";
import "./Dashboard.css";

/*
 * QuOra Triage Dashboard — Medical Teal & Lab White Clinical Diagnostic Portal
 */

type SortKey = "tier" | "score" | "recent" | "confidence";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "tier", label: "Priority (High Risk First)" },
  { key: "score", label: "Highest Risk Score" },
  { key: "confidence", label: "Model Confidence" },
  { key: "recent", label: "Most Recent" },
];

const TIER_FILTERS: (RiskTier | "ALL")[] = ["ALL", "HIGH", "SUSPICIOUS", "LOW"];

function formatCaseNumber(id: string): string {
  return id.replace("DEMO-", "");
}

function sortCases(cases: Case[], key: SortKey): Case[] {
  const out = [...cases];
  switch (key) {
    case "tier":
      out.sort(
        (a, b) =>
          TIER_ORDER[a.fusion.risk_tier] - TIER_ORDER[b.fusion.risk_tier] ||
          b.fusion.risk_score - a.fusion.risk_score,
      );
      break;
    case "score":
      out.sort((a, b) => b.fusion.risk_score - a.fusion.risk_score);
      break;
    case "recent":
      out.sort((a, b) => b.captured_at.localeCompare(a.captured_at));
      break;
    case "confidence":
      out.sort((a, b) => b.fusion.confidence - a.fusion.confidence);
      break;
  }
  return out;
}

export default function Dashboard() {
  const { cases } = useBundle();
  const { caseId } = useParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("tier");
  const [tierFilter, setTierFilter] = useState<RiskTier | "ALL">("ALL");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGuideBar, setShowGuideBar] = useState(true);

  const selected = caseId ? cases.cases.find((c) => c.case_id === caseId) : undefined;

  const stats = useMemo(() => {
    const all = cases.cases;
    const high = all.filter((c) => c.fusion.risk_tier === "HIGH").length;
    const suspicious = all.filter((c) => c.fusion.risk_tier === "SUSPICIOUS").length;
    const low = all.filter((c) => c.fusion.risk_tier === "LOW").length;
    const routed = all.filter((c) => c.review.routed).length;

    return {
      total: all.length,
      high,
      suspicious,
      low,
      routed,
      cleared: all.length - routed,
    };
  }, [cases]);

  const visible = useMemo(() => {
    let list = cases.cases;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.case_id.toLowerCase().includes(q) ||
          c.lesion.site.toLowerCase().includes(q) ||
          c.lesion.clinical_appearance.toLowerCase().includes(q) ||
          c.patient.district.toLowerCase().includes(q) ||
          c.patient.state.toLowerCase().includes(q) ||
          `${c.patient.age_years}${c.patient.sex}`.toLowerCase().includes(q),
      );
    }

    if (tierFilter !== "ALL") {
      list = list.filter((c) => c.fusion.risk_tier === tierFilter);
    }

    if (reviewOnly) {
      list = list.filter((c) => c.review.routed);
    }

    return sortCases(list, sort);
  }, [cases, search, sort, tierFilter, reviewOnly]);

  return (
    <div className={`dash ${selected ? "dash--split" : ""}`}>
      <div className="dash__col">
        <div className="dash__pad">
          {/* Header Title & Actions Section */}
          <div className="dash__head">
            <div>
              <div className="dash__title-row">
                <h1 className="dash__title">Patient Triage Queue</h1>
                <span className="dash__status-badge">
                  <span className="dash__status-dot" /> Live Pipeline
                </span>
              </div>
              <p className="dash__subtitle">
                AI-prioritized oral lesion triage · Click any patient card to review heatmaps and clinical records
              </p>
            </div>

            <div className="dash__quick-actions">
              <button
                className="btn btn--tutorial"
                onClick={() => setShowTutorial(true)}
                title="Open interactive walkthrough guide"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>System Guide &amp; Tutorial</span>
              </button>
              <Link to="/upload" className="btn btn--primary">
                <span>+</span> Upload &amp; Screen Photo
              </Link>
            </div>
          </div>

          {/* ---- Quantum Target & QPU Backend Status Ribbon (IBM Heron r2 v5.6) ---- */}
          <section className="dash__target-banner" aria-label="Quantum processing target">
            <div className="dash__target-left">
              <div className="dash__target-tag">
                <span className="dash__target-pulse" />
                <span>Quantum QPU Target</span>
              </div>
              <div className="dash__target-info">
                <span className="dash__target-label">Processor Target:</span>
                <strong className="dash__target-chip">IBM Heron r2 v5.6</strong>
                <span className="dash__target-sub">156-Qubit Heavy-Hex QPU Architecture</span>
              </div>
            </div>
            <div className="dash__target-right">
              <div className="dash__target-pill">
                <span className="dash__target-pill-k">Circuit</span>
                <span className="dash__target-pill-v">4-Qubit VQC Angle Embedding</span>
              </div>
              <div className="dash__target-pill">
                <span className="dash__target-pill-k">Shots</span>
                <span className="dash__target-pill-v">2,048 Runs</span>
              </div>
              <div className="dash__target-pill">
                <span className="dash__target-pill-k">Fidelity</span>
                <span className="dash__target-pill-v">0.866</span>
              </div>
            </div>
          </section>

          {/* ---- Interactive Quick Start / Help Guide Banner ---- */}
          {showGuideBar && (
            <div className="guide-banner">
              <div className="guide-banner__header">
                <div className="guide-banner__title-group">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--medical-teal)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <strong>Quick System Guide: Where to click &amp; what happens</strong>
                </div>
                <div className="guide-banner__controls">
                  <button
                    className="guide-banner__tour-link"
                    onClick={() => setShowTutorial(true)}
                  >
                    Open Step-by-Step Tour →
                  </button>
                  <button
                    className="guide-banner__close"
                    onClick={() => setShowGuideBar(false)}
                    title="Dismiss guide bar"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="guide-banner__steps">
                <div
                  className="guide-step"
                  onClick={() => setTierFilter("HIGH")}
                  title="Click to filter High Risk cases"
                >
                  <span className="guide-step__num">1</span>
                  <div>
                    <strong>Filter Priority Cases</strong>
                    <p>Click on <em>High Risk</em>, <em>Suspicious</em>, or <em>Low Risk</em> cards below to isolate cases.</p>
                  </div>
                </div>

                <div
                  className="guide-step"
                  onClick={() => setShowTutorial(true)}
                  title="Learn how to upload and analyze scans"
                >
                  <span className="guide-step__num">2</span>
                  <div>
                    <strong>Screen New Images</strong>
                    <p>Use <em>&apos;Upload &amp; Screen&apos;</em> tab to upload lesion photos for instant 4-qubit VQC analysis on <em>IBM Heron r2 v5.6</em>.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="guide-step__num">3</span>
                  <div>
                    <strong>Review Diagnostic File</strong>
                    <p>Click <em>&apos;View Details →&apos;</em> on any patient card to inspect Grad-CAM heatmaps &amp; routing.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- Executive KPI Summary Cards ---- */}
          <section className="dash__kpis" aria-label="Clinical triage statistics">
            {/* KPI 1: Active Queue (Highlighted with Medical Teal Glow) */}
            <div
              className={`kpi-card kpi-card--teal-primary ${tierFilter === "ALL" && !reviewOnly ? "is-selected" : ""}`}
              onClick={() => {
                setTierFilter("ALL");
                setReviewOnly(false);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="kpi-card__top">
                <span className="kpi-card__label">Active Screening Queue</span>
                <span className="kpi-card__pill kpi-card__pill--teal">
                  {stats.routed} Action Needed
                </span>
              </div>
              <div className="kpi-card__metric">
                <span className="kpi-card__num kpi-card__num--teal">{stats.total}</span>
                <span className="kpi-card__unit">Patients</span>
              </div>
              <div className="kpi-card__breakdown">
                <div
                  className="kpi-card__seg kpi-card__seg--high"
                  style={{ width: `${(stats.high / stats.total) * 100}%` }}
                  title={`${stats.high} High Risk`}
                />
                <div
                  className="kpi-card__seg kpi-card__seg--susp"
                  style={{ width: `${(stats.suspicious / stats.total) * 100}%` }}
                  title={`${stats.suspicious} Suspicious`}
                />
                <div
                  className="kpi-card__seg kpi-card__seg--low"
                  style={{ width: `${(stats.low / stats.total) * 100}%` }}
                  title={`${stats.low} Low Risk`}
                />
              </div>
            </div>

            {/* KPI 2: High Risk */}
            <div
              className={`kpi-card kpi-card--high ${tierFilter === "HIGH" ? "is-selected" : ""}`}
              onClick={() => setTierFilter("HIGH")}
              role="button"
              tabIndex={0}
            >
              <div className="kpi-card__top">
                <span className="kpi-card__label">High Risk Findings</span>
                <span className="kpi-card__pill kpi-card__pill--high">Critical</span>
              </div>
              <div className="kpi-card__metric">
                <span className="kpi-card__num kpi-card__num--high">{stats.high}</span>
                <span className="kpi-card__sub">Immediate Biopsy / Specialist</span>
              </div>
              <div className="kpi-card__foot">
                <span>{(stats.high / stats.total * 100).toFixed(0)}% of screened queue</span>
              </div>
            </div>

            {/* KPI 3: Suspicious */}
            <div
              className={`kpi-card kpi-card--susp ${tierFilter === "SUSPICIOUS" ? "is-selected" : ""}`}
              onClick={() => setTierFilter("SUSPICIOUS")}
              role="button"
              tabIndex={0}
            >
              <div className="kpi-card__top">
                <span className="kpi-card__label">Suspicious Lesions</span>
                <span className="kpi-card__pill kpi-card__pill--susp">Review</span>
              </div>
              <div className="kpi-card__metric">
                <span className="kpi-card__num kpi-card__num--susp">{stats.suspicious}</span>
                <span className="kpi-card__sub">Secondary Clinical Triage</span>
              </div>
              <div className="kpi-card__foot">
                <span>{(stats.suspicious / stats.total * 100).toFixed(0)}% of screened queue</span>
              </div>
            </div>

            {/* KPI 4: Low Risk (Medical Teal) */}
            <div
              className={`kpi-card kpi-card--low ${tierFilter === "LOW" ? "is-selected" : ""}`}
              onClick={() => setTierFilter("LOW")}
              role="button"
              tabIndex={0}
            >
              <div className="kpi-card__top">
                <span className="kpi-card__label">Low Risk / Benign</span>
                <span className="kpi-card__pill kpi-card__pill--low">Routine</span>
              </div>
              <div className="kpi-card__metric">
                <span className="kpi-card__num kpi-card__num--low">{stats.low}</span>
                <span className="kpi-card__sub">Routine 6-Month Recall</span>
              </div>
              <div className="kpi-card__foot">
                <span>{(stats.low / stats.total * 100).toFixed(0)}% of screened queue</span>
              </div>
            </div>
          </section>

          {/* ---- Medical Teal Filter & Search Toolbar ---- */}
          <section className="dash__toolbar" aria-label="Filters and sorting">
            <div className="dash__search-wrap">
              <svg className="dash__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="dash__search-input"
                placeholder="Filter by Patient ID, Site (Tongue, Palate), District..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="dash__search-clear"
                  onClick={() => setSearch("")}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="dash__filters">
              {/* Risk Tier Filter */}
              <div className="dash__tier-tabs" role="tablist">
                {TIER_FILTERS.map((t) => {
                  const count =
                    t === "ALL"
                      ? stats.total
                      : t === "HIGH"
                      ? stats.high
                      : t === "SUSPICIOUS"
                      ? stats.suspicious
                      : stats.low;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`dash__tier-tab ${tierFilter === t ? "is-active" : ""} ${
                        t !== "ALL" ? `dash__tier-tab--${t.toLowerCase()}` : ""
                      }`}
                      onClick={() => setTierFilter(t)}
                    >
                      <span>{t === "ALL" ? "All Cases" : t.charAt(0) + t.slice(1).toLowerCase()}</span>
                      <span className="dash__tier-tab-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort Selector */}
              <div className="dash__sort-wrap">
                <select
                  className="dash__sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort cases"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Filter Toggle */}
              <label className="dash__toggle">
                <input
                  type="checkbox"
                  checked={reviewOnly}
                  onChange={(e) => setReviewOnly(e.target.checked)}
                />
                <span>Action Needed ({stats.routed})</span>
              </label>
            </div>
          </section>

          {/* Results Count & Reset */}
          <div className="dash__results-header">
            <span className="dash__count">
              Showing <strong>{visible.length}</strong> of {cases.count} clinical cases
            </span>
            {(search || tierFilter !== "ALL" || reviewOnly) && (
              <button
                className="dash__reset-btn"
                onClick={() => {
                  setSearch("");
                  setTierFilter("ALL");
                  setReviewOnly(false);
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* ---- Patient Cards Grid ---- */}
          {visible.length > 0 ? (
            <div className="dash__grid">
              {visible.map((c) => (
                <CaseCard key={c.case_id} kase={c} active={c.case_id === caseId} />
              ))}
            </div>
          ) : (
            <div className="dash__empty">
              <svg className="dash__empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h3>No matching patient records found</h3>
              <p>Adjust your search query or clear active filters to view all patients.</p>
              <button
                className="btn btn--primary"
                onClick={() => {
                  setSearch("");
                  setTierFilter("ALL");
                  setReviewOnly(false);
                }}
              >
                Show All Records
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- Case Detail Sidebar Drawer ---- */}
      {selected && (
        <aside className="dash__detail" aria-label="Case detail">
          <div className="dash__detailtop">
            <div>
              <span className="label">Clinical Case Review</span>
              <h3 className="dash__detailtitle">{formatCaseNumber(selected.case_id)}</h3>
            </div>
            <Link className="dash__close" to="/dashboard" aria-label="Close case detail">
              ✕ Close Panel
            </Link>
          </div>
          <div className="dash__detailscroll">
            <CaseDetail kase={selected} />
          </div>
        </aside>
      )}

      {/* ---- Interactive Walkthrough Tutorial Modal ---- */}
      <AppTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}

/* ------------------------------- case card -------------------------------- */

function CaseCard({ kase, active }: { kase: Case; active: boolean }) {
  const tier = kase.fusion.risk_tier;
  const q = kase.quantum;
  const riskPct = (kase.fusion.risk_score * 100).toFixed(1);

  return (
    <Link
      to={`/dashboard/${kase.case_id}`}
      className={`card card--${tier.toLowerCase()} ${active ? "is-active" : ""}`}
      title="Click to open patient diagnostic drawer with heatmaps and routing"
    >
      {/* Top Header */}
      <div className="card__header">
        <div className="card__id-row">
          <span className="card__id">{formatCaseNumber(kase.case_id)}</span>
          <span className="card__time">{relativeAge(kase.captured_at)}</span>
        </div>
        <span className={`card__tier-badge card__tier-badge--${tier.toLowerCase()}`}>
          <span className="card__tier-dot" />
          {tier === "HIGH" ? "HIGH RISK" : tier === "SUSPICIOUS" ? "SUSPICIOUS" : "LOW RISK"}
        </span>
      </div>

      {/* Patient demographics */}
      <div className="card__patient">
        <span className="card__age-sex">
          {kase.patient.age_years} yrs · {kase.patient.sex === "M" ? "Male" : "Female"}
        </span>
        <span className="card__dot-sep">·</span>
        <span className="card__location">
          {kase.patient.district}, {kase.patient.state}
        </span>
      </div>

      {/* Lesion Info Box with Medical Teal Accent */}
      <div className="card__lesion">
        <div className="card__site-badge">
          <span className="card__site-label">Site:</span>
          <span className="card__site-val">{kase.lesion.site}</span>
        </div>
        <p className="card__appearance">{kase.lesion.clinical_appearance}</p>
      </div>

      {/* AI Risk Score Bar */}
      <div className="card__score-section">
        <div className="card__score-header">
          <span className="card__score-title">AI Triage Risk</span>
          <span className="card__score-num">{riskPct}%</span>
        </div>
        <div className="card__meter">
          <div
            className={`card__meter-fill card__meter-fill--${tier.toLowerCase()}`}
            style={{ width: `${Math.max(4, Math.min(100, kase.fusion.risk_score * 100))}%` }}
          />
        </div>
      </div>

      {/* Dual Head Breakdown (Classical vs Quantum VQC on IBM Heron) */}
      <div className="card__heads">
        <div className="card__head-pill card__head-pill--teal">
          <span className="card__head-name">Classical Head</span>
          <span className="card__head-pct">{pct(kase.fusion.classical_confidence, 0)}</span>
        </div>
        {q && (
          <div className="card__head-pill card__head-pill--quantum">
            <span className="card__head-name">Heron VQC</span>
            <span className="card__head-pct">{pct(kase.fusion.quantum_confidence ?? 0, 0)}</span>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="card__footer">
        <span className="card__review-tag">
          {REVIEW_LABEL[kase.review.status]}
        </span>
        <span className="card__open-btn">
          View Details →
        </span>
      </div>
    </Link>
  );
}
