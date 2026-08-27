import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBundle } from "../bundle";
import { LesionView } from "../components/LesionView";
import { NotADiagnosis, SimulatedBadge, SyntheticNote } from "../components/Provenance";
import { RiskTierReadout } from "../components/RiskTier";
import { TwinReadout } from "../components/TwinReadout";
import {
  REVIEW_LABEL,
  TIER_ORDER,
  fixed,
  pct,
  tierVar,
  type Case,
  type GateComponent,
} from "../types";
import "./MobileFlow.css";

/*
 * Mobile capture + result flow.
 *
 * 03_DESIGN_SYSTEM.md: "single-focus screens, one action each. Numbered step
 * tracker (Position -> Capture -> Analyze -> Result) ... Live alignment ring
 * with subtle pulse — the only motion on this screen."
 *
 * HONESTY NOTE, which is also stated on screen: pressing Analyze does not run a
 * new Aer job from the browser. It replays the recorded execution for the
 * selected case — the shots, depth and fidelity shown are the ones that really
 * were measured when quantum/run_pipeline.py ran that case. The step timings are
 * presentation, the numbers are not.
 */

const STEPS = ["Position", "Capture", "Analyze", "Result"] as const;
type Step = 0 | 1 | 2 | 3;

/*
 * The analyse sequence mirrors the real pipeline stages in 02.
 *
 * `offline` is the label to use when the selected case carries no quantum block.
 * Two of the 24 cases run the classical-only fallback (run_pipeline.py:
 * N_OFFLINE_CASES = 2) and on those, angle encoding and the shot readout never
 * happened at all, and "fusion" is the classical head passed straight through —
 * `fused_proba = c_proba`. Animating the violet rows for such a case would
 * assert a measurement nobody took, so they are relabelled and never light up.
 */
const STAGES: { at: number; label: string; lane: "c" | "q"; offline?: string }[] = [
  { at: 0, label: "Preprocess · white balance, crop, denoise", lane: "c" },
  { at: 620, label: "Classical layer · 8-dim feature vector", lane: "c" },
  {
    at: 1420,
    label: "Quantum layer · angle encode, 4 qubits",
    lane: "q",
    offline: "Quantum layer · angle encode — NOT RUN on this case",
  },
  {
    at: 2180,
    label: "Quantum layer · 2048 shots, ⟨Z⟩ + ⟨ZZ⟩ readout",
    lane: "q",
    offline: "Quantum layer · shot readout — NOT RUN on this case",
  },
  {
    at: 2860,
    label: "Fusion · classical + quantum heads",
    lane: "c",
    offline: "Fusion · classical head only, nothing to fuse",
  },
];

const ANALYZE_MS = 3500;

/*
 * Provenance ledger for the presenter panel.
 *
 * This replaced three headed paragraphs of prose. The register was wrong: a
 * presenter being questioned mid-pitch needs to find one line, not re-read an
 * essay, and a wall of body text is also the thing that made this surface look
 * authored-by-machine rather than designed. Every claim from the prose version
 * survives here at the same strength — the flag carries "is this real", the line
 * carries what it covers.
 *
 * Flags follow the palette grammar: teal for what genuinely runs, amber for what
 * is staged ("attention, not alarm"). Violet is not used, because none of these
 * rows is itself the quantum layer.
 *
 * It is a function of the case rather than a constant because two rows are not
 * true of every case. The offline pair has `quantum === null`, so for them there
 * are no measured readouts to claim and the tier came from the classical head
 * alone. A ledger that reads the same for all 24 cases would be asserting a
 * quantum measurement on two cases that never entered the quantum lane.
 */
function ledgerFor(kase: Case): { flag: string; real: boolean; text: string }[] {
  const q = kase.quantum;
  return [
    { flag: "REAL", real: true, text: "Quality-gate thresholds, retry logic and routing rules" },
    q
      ? {
          flag: "REAL",
          real: true,
          text: "Quantum readouts — measured when this case ran on local Aer",
        }
      : {
          flag: "N/A",
          real: false,
          text: "No quantum readouts on this case — it took the classical-only offline path",
        },
    q
      ? { flag: "REAL", real: true, text: "Tier from the trained hybrid model, not a lookup table" }
      : {
          flag: "REAL",
          real: true,
          text: "Tier from the trained classical head alone — no fusion, still not a lookup table",
        },
    { flag: "SYNTH", real: false, text: "No camera, no photograph — the frame is a procedural phantom" },
    { flag: "REPLAY", real: false, text: "Analyze replays this case's recorded run; no circuit is dispatched" },
    { flag: "ILLUS", real: false, text: "Attribution overlay is illustrative; no CNN was trained" },
  ];
}

/*
 * The three gated components, read off the case in artifact order.
 *
 * Keyed by GateComponent["key"] so that if quantum/synthetic_data.py::GATE_SPEC
 * ever grows a fourth component, this fails to compile instead of quietly
 * dropping it from the screen.
 */
function gateValues(kase: Case): Record<GateComponent["key"], number> {
  return {
    blur_score: kase.capture.blur_score,
    illumination_score: kase.capture.illumination_score,
    framing_score: kase.capture.framing_score,
  };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export default function MobileFlow() {
  const { cases } = useBundle();
  const { caseId } = useParams();
  const navigate = useNavigate();

  // Default to the highest-risk case: the most useful one to demo first.
  const ordered = useMemo(
    () =>
      [...cases.cases].sort(
        (a, b) =>
          TIER_ORDER[a.fusion.risk_tier] - TIER_ORDER[b.fusion.risk_tier] ||
          b.fusion.risk_score - a.fusion.risk_score,
      ),
    [cases],
  );
  const active: Case =
    (caseId ? cases.cases.find((c) => c.case_id === caseId) : undefined) ?? ordered[0];

  const [step, setStep] = useState<Step>(0);
  const [elapsed, setElapsed] = useState(0);
  const [sent, setSent] = useState(false);
  const raf = useRef<number | null>(null);

  const reset = useCallback(() => {
    setStep(0);
    setElapsed(0);
    setSent(false);
  }, []);

  // Switching case restarts the flow — a presenter never wants a stale result
  // screen from the previous case still on the device.
  useEffect(() => {
    reset();
  }, [active.case_id, reset]);

  // Analyse progress clock.
  useEffect(() => {
    if (step !== 2) return;
    if (prefersReducedMotion()) {
      setElapsed(ANALYZE_MS);
      const t = setTimeout(() => setStep(3), 400);
      return () => clearTimeout(t);
    }
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const e = ts - start;
      setElapsed(e);
      if (e < ANALYZE_MS) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setStep(3);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [step]);

  const q = active.quantum;
  const tier = active.fusion.risk_tier;
  const offline = active.pipeline_mode === "OFFLINE_CLASSICAL_FALLBACK";

  return (
    <div className="flow">
      {/* -------------------------- the device -------------------------- */}
      <div className="flow__stage">
        <div className="device" role="region" aria-label="Field capture device">
          {/* Bezel strip. Three cells: who the device is, which case is loaded,
              and link state — the things a field unit would actually show. */}
          <div className="device__bezel mono">
            <span className="device__plate">QuOra field</span>
            <span className="device__loaded">{active.case_id}</span>
            <span className={`device__net ${offline ? "is-off" : ""}`}>
              {offline ? "◌ offline" : "◍ synced"}
            </span>
          </div>

          {/* Step tracker, sharing the masthead's selected-channel idiom: mono
              index, single-line label, teal bar on the top edge when live. */}
          <ol className="steps" aria-label="Capture steps">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={`steps__i ${i === step ? "is-on" : ""} ${i < step ? "is-done" : ""}`}
                aria-current={i === step ? "step" : undefined}
              >
                <span className="steps__n">{i + 1}</span>
                <span className="steps__l">{s}</span>
              </li>
            ))}
          </ol>

          <div className="device__screen">
            {step === 0 && <PositionStep kase={active} onNext={() => setStep(1)} />}
            {step === 1 && (
              <CaptureStep kase={active} onNext={() => setStep(2)} onRetry={() => setStep(0)} />
            )}
            {step === 2 && <AnalyzeStep kase={active} elapsed={elapsed} />}
            {step === 3 && (
              <ResultStep
                kase={active}
                sent={sent}
                onSend={() => setSent(true)}
                onRestart={reset}
                onOpenDashboard={() => navigate(`/dashboard/${active.case_id}`)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ------------------------ presenter panel ------------------------ */}
      <aside className="flow__side" aria-label="Presenter notes">
        <div className="side__head">
          <h1 className="side__title">Field capture</h1>
          <p className="side__standfirst">
            The four screens a trained health worker moves through on a phone: frame the
            lesion, clear the quality gate, run the hybrid pipeline, act on the tier.
          </p>
        </div>

        <label className="picker">
          <span className="label">Case to replay</span>
          <select
            value={active.case_id}
            onChange={(e) => navigate(`/capture/${e.target.value}`)}
          >
            {ordered.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} · {c.fusion.risk_tier}
                {c.pipeline_mode === "OFFLINE_CLASSICAL_FALLBACK" ? " · offline" : ""}
              </option>
            ))}
          </select>
        </label>

        {/* ---- provenance ledger ---- */}
        <div className="side__block">
          <span className="label">Provenance</span>
          <ul className="ledger">
            {ledgerFor(active).map((row) => (
              <li key={row.text} className={`ledger__r ${row.real ? "is-real" : "is-staged"}`}>
                <span className="ledger__f mono">{row.flag}</span>
                <span className="ledger__t">{row.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- selected case ---- */}
        <div className="side__block">
          <span className="label">Loaded case</span>
          <dl className="side__dl mono">
            <div>
              <dt>Tier</dt>
              <dd style={{ color: tierVar(tier) }}>{tier}</dd>
            </div>
            <div>
              <dt>Risk score</dt>
              <dd>{fixed(active.fusion.risk_score, 4)}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{active.pipeline_mode}</dd>
            </div>
            <div>
              <dt>Run id</dt>
              <dd>{q ? q.run_id : "—"}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------- step 1 ---------------------------------- */

function PositionStep({ kase, onNext }: { kase: Case; onNext: () => void }) {
  /*
   * The gate is read off the artifact (cases.capture_gate, published from
   * quantum/synthetic_data.py::GATE_SPEC) rather than restated here.
   *
   * This screen used to colour all three meters against a shared 0.62 and draw
   * every marker at 62% — a threshold that appears nowhere in the pipeline. The
   * real gate is three independent floors (blur 0.55, illumination 0.50, framing
   * 0.50), so each meter now carries its own, from the artifact.
   */
  const { cases } = useBundle();
  const gate = cases.capture_gate;
  const values = gateValues(kase);

  // The live meters settle toward the values the case actually recorded.
  const [t, setT] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setT(1);
      return;
    }
    let start: number | null = null;
    let id = 0;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      setT(Math.min(1, (ts - start) / 1600));
      if (ts - start < 1600) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const aligned = t > 0.98;
  const settle = (v: number) => 0.42 + (v - 0.42) * t;

  return (
    <div className="scr">
      <p className="scr__instr">Frame the lesion inside the ring. Hold still.</p>

      <div className="viewfinder">
        <LesionView kase={kase} size={244} showOverlay={false} compactLabel />
        {/* The one animated moment permitted on this screen (doc 03). */}
        <span
          className={`ring ${aligned ? "ring--locked" : ""}`}
          aria-hidden="true"
        />
        <span className="viewfinder__tag mono">CALIBRATION PHANTOM · LIVE VIEWFINDER</span>
        <span className={`viewfinder__lock mono ${aligned ? "is-on" : ""}`}>
          {aligned ? "ALIGNED" : "ALIGNING…"}
        </span>
      </div>

      <div className="livemeters">
        {gate.components.map((comp) => {
          const cur = settle(values[comp.key]);
          // Each component clears its own floor or it does not clear at all.
          const ok = cur >= comp.min;
          return (
            <div className="livemeter" key={comp.key}>
              <span className="label">{comp.label}</span>
              <div className="livemeter__track">
                <div
                  className={`livemeter__fill ${ok ? "is-ok" : ""}`}
                  style={{ width: `${cur * 100}%` }}
                />
                <span className="livemeter__gate" style={{ left: `${comp.min * 100}%` }} />
              </div>
              <span className="livemeter__v mono">{cur.toFixed(2)}</span>
              <span className="livemeter__min mono">≥{comp.min.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <button type="button" className="btn btn--primary scr__cta" disabled={!aligned} onClick={onNext}>
        {aligned ? "Capture" : "Waiting for alignment"}
      </button>
    </div>
  );
}

/* ------------------------------- step 2 ---------------------------------- */

function CaptureStep({
  kase,
  onNext,
  onRetry,
}: {
  kase: Case;
  onNext: () => void;
  onRetry: () => void;
}) {
  const c = kase.capture;
  // Same source of truth as the position screen: the published gate, not a
  // number typed in here. See the note in PositionStep.
  const { cases } = useBundle();
  const gate = cases.capture_gate;
  const values = gateValues(kase);
  return (
    <div className="scr">
      <p className="scr__instr">Capture held. Checking image quality before analysis.</p>

      <div className="viewfinder viewfinder--frozen">
        <LesionView kase={kase} size={244} showOverlay={false} compactLabel />
        <span className="viewfinder__tag mono">FRAME HELD · OPTICAL CAPTURE</span>
      </div>

      <div className={`gatecard ${c.gate_passed ? "gatecard--pass" : "gatecard--fail"}`}>
        <div className="gatecard__top">
          <span className="label">Quality gate</span>
          <span className="gatecard__verdict mono">{c.gate_passed ? "PASSED" : "REJECTED"}</span>
        </div>
        {/* Each floor tested on its own, and shown that way. A weighted composite
            would let a badly blurred frame through on the strength of good
            framing, which is exactly why the pipeline never gates on one. */}
        <ul className="gatecard__notes">
          {gate.components.map((comp) => {
            const v = values[comp.key];
            const ok = v >= comp.min;
            return (
              <li key={comp.key}>
                {comp.label}{" "}
                <span className="mono">
                  {v.toFixed(3)} · min {comp.min.toFixed(2)} · {ok ? "PASS" : "FAIL"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="gatecard__score mono">
          {gate.composite.label.toLowerCase()} {c.quality_score.toFixed(3)} · not gated
        </p>
        <p className="scr__fine">{gate.composite.note}</p>
        <ul className="gatecard__notes">
          {c.gate_notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="gatecard__retries mono">
          retries: {c.retries} of {gate.max_retries} permitted
        </p>
      </div>

      <p className="scr__fine">
        Rejecting a bad frame at the device is why the pipeline can run offline — a blurred capture
        never consumes a review slot.
      </p>

      <div className="scr__row scr__row--foot">
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Recapture
        </button>
        <button type="button" className="btn btn--primary" onClick={onNext} disabled={!c.gate_passed}>
          Analyze
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- step 3 ---------------------------------- */

function AnalyzeStep({ kase, elapsed }: { kase: Case; elapsed: number }) {
  const q = kase.quantum;

  /*
   * A case with no quantum block never entered the quantum lane, so its two
   * violet rows are relabelled (see STAGES) and marked as not run. Only the
   * quantum lane is skipped: the fusion row still resolves, because the classical
   * head really does produce this case's tier — it is just not a fusion.
   */
  const stages = useMemo(
    () =>
      STAGES.map((s) => ({
        at: s.at,
        lane: s.lane,
        label: q ? s.label : (s.offline ?? s.label),
        skipped: !q && s.lane === "q",
      })),
    [q],
  );

  // Progress is tracked over the stages that actually ran, so on an offline case
  // the classical row keeps the highlight through the quantum window instead of
  // handing it to a row that executed nothing.
  const ran = stages.filter((s) => !s.skipped);
  const done = ran.filter((s) => elapsed >= s.at);
  const current = done[done.length - 1];
  const progress = Math.min(1, elapsed / ANALYZE_MS);

  return (
    <div className="scr">
      {/* "Hybrid" is only true when there is a quantum block to hybridise with. */}
      <p className="scr__instr">
        {q ? "Running hybrid pipeline." : "Running classical pipeline · offline, quantum layer skipped."}
      </p>

      <div className="viewfinder viewfinder--frozen">
        <LesionView kase={kase} size={244} showOverlay overlayProgress={progress * 0.9} compactLabel />
        <span className="viewfinder__tag mono">ANALYSING</span>
      </div>

      {/* Twin readout in its unresolved state: the traces drift while working. */}
      <TwinReadout
        classical={kase.classical.trace}
        quantum={q ? q.trace : null}
        resolved={false}
        size="strip"
        label={q ? "Classical / quantum · not yet synced" : "Classical only · quantum lane idle"}
      />

      <ol className="stages">
        {stages.map((s) => {
          const state = s.skipped
            ? "skip"
            : elapsed >= s.at
              ? s === current
                ? "on"
                : "done"
              : "wait";
          return (
            <li key={s.label} className={`stages__i stages__i--${s.lane} is-${state}`}>
              <span className="stages__dot" aria-hidden="true" />
              <span className="stages__l">{s.label}</span>
            </li>
          );
        })}
      </ol>

      {/* Progress by stage, each segment carrying its own lane's colour. A skipped
          segment stays empty — a filling violet bar would claim quantum work. */}
      <div className="analyzebar" aria-hidden="true">
        {stages.map((s, i) => {
          const span = (stages[i + 1]?.at ?? ANALYZE_MS) - s.at;
          const local = s.skipped ? 0 : Math.max(0, Math.min(1, (elapsed - s.at) / span));
          return (
            <span
              key={s.label}
              className={`analyzebar__s analyzebar__s--${s.lane}`}
              style={{ flexGrow: span }}
            >
              <i style={{ width: `${local * 100}%` }} />
            </span>
          );
        })}
      </div>

      <p className="scr__fine">
        {q ? (
          <>
            Replaying recorded execution <span className="mono">{q.run_id}</span> — {q.shots}{" "}
            shots on <span className="mono">{q.backend}</span>. No circuit is dispatched from the
            browser.
          </>
        ) : (
          <>Offline fallback: classical head only, no quantum stage for this case.</>
        )}
      </p>
    </div>
  );
}

/* ------------------------------- step 4 ---------------------------------- */

function ResultStep({
  kase,
  sent,
  onSend,
  onRestart,
  onOpenDashboard,
}: {
  kase: Case;
  sent: boolean;
  onSend: () => void;
  onRestart: () => void;
  onOpenDashboard: () => void;
}) {
  const q = kase.quantum;
  const tier = kase.fusion.risk_tier;

  return (
    <div className="scr scr--result">
      {/* Heatmap as the visual anchor (doc 03). */}
      <div className="viewfinder viewfinder--result">
        <LesionView kase={kase} size={244} showOverlay overlayProgress={1} compactLabel />
        <span className="viewfinder__tag mono">GRAD-CAM SPATIAL ATTRIBUTION</span>
      </div>

      <RiskTierReadout
        tier={tier}
        confidence={kase.fusion.confidence}
        margin={kase.fusion.margin}
        runnerUp={kase.fusion.runner_up_tier}
      />

      {/* Twin readout strip beneath the anchor, syncing on reveal (doc 03). */}
      <TwinReadout
        classical={kase.classical.trace}
        quantum={q ? q.trace : null}
        resolved
        size="strip"
        tierColor={tierVar(tier)}
        showValues
        label={q ? "Classical / quantum · synced" : "Classical only · quantum lane idle"}
      />

      <div className="resultmeta">
        <div className="field">
          <span className="label">Risk score</span>
          <span className="field__v">{fixed(kase.fusion.risk_score, 4)}</span>
        </div>
        <div className="field">
          <span className="label">Heads</span>
          <span className="field__v">{kase.fusion.agreement}</span>
        </div>
        {q && (
          <div className="field">
            <span className="label">Quantum layer</span>
            <span className="field__v">
              fidelity {q.fidelity.toFixed(4)} <SimulatedBadge simulated={q.simulated} size="sm" />
            </span>
          </div>
        )}
      </div>

      <div className="side__block">
        <span className="label">Why this tier</span>
        <ul className="side__ul">
          {kase.fusion.drivers.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {/* The drivers above name features, so the caveat about where those features
            came from belongs at the point of explanation, not only in the dashboard's
            detail panel. A reader should not be able to learn why the tier was
            assigned without learning that the vector is a labelled stand-in. */}
        <p className="scr__fine mono">{kase.classical.backbone_status}</p>
      </div>

      <SyntheticNote>{kase.heatmap.provenance}</SyntheticNote>

      <div className="routing">
        <span className="label">Routing</span>
        <p className="routing__p">{kase.review.routing_reason}</p>
        <p className="routing__p routing__p--dim mono">
          {REVIEW_LABEL[kase.review.status]}
          {kase.review.sla_hours !== null && ` · target ${kase.review.sla_hours} h`}
        </p>
      </div>

      <div className="scr__row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onSend}
          disabled={sent}
        >
          {sent
            ? "Queued for review"
            : kase.review.routed
              ? "Send to review"
              : "Save to record"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onOpenDashboard}>
          Open in dashboard
        </button>
      </div>

      {sent && (
        <p className="scr__fine">
          Queued locally. Nothing left this browser — no server, no telemedicine partner is
          connected in this build.
        </p>
      )}

      <button type="button" className="scr__restart" onClick={onRestart}>
        Restart flow
      </button>

      <NotADiagnosis />
      <p className="scr__conf mono">confidence {pct(kase.fusion.confidence)}</p>
    </div>
  );
}
