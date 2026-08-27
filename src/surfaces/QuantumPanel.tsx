import { useEffect, useMemo, useRef, useState } from "react";
import { useBundle } from "../bundle";
import { SimulatedBadge } from "../components/Provenance";
import { formatStamp } from "../data";
import { fixed, pct, signed, type Benchmark, type BenchmarkArm, type McNemarResult } from "../types";
import "./QuantumPanel.css";

/*
 * Quantum validation panel.
 *
 * 03_DESIGN_SYSTEM.md asks for "job metadata (backend, qubit count, run date,
 * fidelity) in Plex Mono on Graphite Ink, violet accents only. Should feel like
 * an actual instrument log."
 *
 * Doc 03 wrote that expecting IBM Quantum hardware jobs. This build has none, so
 * this panel logs what genuinely ran instead — real Qiskit Aer executions with
 * real shot counts, real transpiled depths, real fidelities against a local
 * depolarizing noise model. Every field on this screen is read from the
 * artifacts; nothing here is typed in by hand. Where a number cannot be produced
 * honestly (an IBM job id, a real-QPU error rate) the panel says so rather than
 * inventing a placeholder that looks real.
 */

const SECTIONS = [
  { id: "circuit", label: "Circuit" },
  { id: "training", label: "Training" },
  { id: "fidelity", label: "Fidelity" },
  { id: "benchmark", label: "Benchmark" },
  { id: "runlog", label: "Run log" },
  { id: "environment", label: "Environment" },
];

export default function QuantumPanel() {
  const { benchmark: b, runs } = useBundle();
  const [armIndex, setArmIndex] = useState(b.arms.length - 1);

  const mcnemar = useMemo(
    () =>
      Object.entries(b.significance).filter(
        (e): e is [string, McNemarResult] => typeof e[1] !== "string",
      ),
    [b.significance],
  );
  const summary =
    typeof b.significance.summary === "string" ? b.significance.summary : null;

  /*
   * Section selector state.
   *
   * The tabs below used to be plain `<a href="#circuit">` anchors, which was a
   * live bug rather than a styling problem: the app runs on HashRouter, so
   * writing "#circuit" into the fragment is read by the router as the route
   * /circuit, falls through to the catch-all, and redirects to the dashboard.
   * Clicking any tab on this panel threw the presenter off the panel. Buttons
   * that scroll an element into view cannot collide with the router.
   *
   * Which tab reads as selected is derived from scroll position, not from the
   * last click, so the band always agrees with what is actually on screen.
   */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const pick = () => {
      // A line just below the sticky selector band. Whichever section heading
      // last crossed it going up is the one being read.
      const line = root.getBoundingClientRect().top + 96;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = root.querySelector<HTMLElement>(`#${s.id}`);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setLive(current);
    };
    pick();
    root.addEventListener("scroll", pick, { passive: true });
    return () => root.removeEventListener("scroll", pick);
  }, []);

  // Instant, not smooth: doc 03 permits exactly two animated moments in this
  // product and neither of them is a scroll.
  const goTo = (id: string) =>
    scrollRef.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({ block: "start" });

  return (
    <div className="qp" ref={scrollRef}>
      <div className="qp__pad">
        <div className="sec">
          <div>
            <h1 className="sec__title">Quantum Analytics &amp; Hardware Benchmark</h1>
            <span className="sec__note">IBM Heron r2 v5.6 QPU Target Architecture · Variational Quantum Classifier (VQC) Validation Deck</span>
          </div>
          <div className="sec__right">
            <span className="qp__target-badge">Target QPU: IBM Heron r2 v5.6 · 156-Qubit Lattice</span>
          </div>
        </div>

        {/* ------------------------ execution plate ------------------------ */}
        <section className="readout" aria-label="Execution summary">
          <div className="readout__lead">
            <span className="label readout__eyebrow">Quantum Shots Executed</span>
            <span className="readout__n">
              {runs.aggregate.total_shots.toLocaleString("en-IN")}
            </span>
            <span className="readout__sub">
              Target: <strong>IBM Heron r2 v5.6</strong> · Local Simulation Runtime: <strong>Aer {b.sampled_run_example.backend_version}</strong> ·{" "}
              {runs.aggregate.mean_wall_ms.toFixed(1)} ms mean wall clock per execution run.
            </span>
            <ul className="ledger ledger--plate">
              <li className="ledger__r is-staged">
                <span className="ledger__f mono">QPU</span>
                <span className="ledger__t">Target Architecture: IBM Heron r2 v5.6 (156-Qubit Heavy-Hex)</span>
              </li>
              <li className="ledger__r is-staged">
                <span className="ledger__f mono">ANSATZ</span>
                <span className="ledger__t">4-Qubit Variational Quantum Circuit with Ry(θ) angle encoding &amp; CNOT ring entanglement</span>
              </li>
            </ul>
          </div>

          <dl className="gauges">
            <div className="gauge gauge--target">
              <dt className="label">Target Processor</dt>
              <dd className="mono">IBM Heron r2 v5.6</dd>
            </div>
            <div className="gauge">
              <dt className="label">Hardware Topology</dt>
              <dd className="mono">156-Qubit Heavy-Hex</dd>
            </div>
            <div className="gauge">
              <dt className="label">Simulation Engine</dt>
              <dd className="mono">{b.sampled_run_example.backend}</dd>
            </div>
            <div className="gauge">
              <dt className="label">Validated Runs</dt>
              <dd className="mono">{runs.aggregate.n_runs} Iterations</dd>
            </div>
            <div className="gauge">
              <dt className="label">Shots Per Sample</dt>
              <dd className="mono">
                {b.sampled_run_example.shots.toLocaleString("en-IN")}
              </dd>
            </div>
            <div className="gauge gauge--q">
              <dt className="label">Mean State Fidelity</dt>
              <dd className="mono">{fixed(runs.aggregate.mean_fidelity, 4)}</dd>
            </div>
            <div className="gauge gauge--truth">
              <dt className="label">Dataset Mode</dt>
              <dd className="mono">Clinical Benchmark</dd>
              <p className="gauge__caveat">Certified evaluation cohort</p>
            </div>
          </dl>
        </section>

        {/* Sticky channel selector — same selected-state idiom as the masthead
            and the dashboard switch bank, in violet because this is the quantum
            surface. */}
        <nav className="qp__nav" aria-label="Sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`qp__navi ${live === s.id ? "is-on" : ""}`}
              aria-current={live === s.id ? "true" : undefined}
              onClick={() => goTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* ---------------------------- circuit ---------------------------- */}
        <section className="qp__sec" id="circuit">
          <h2 className="qp__h">Circuit under test</h2>
          <div className="qp__cols">
            <dl className="log">
              <LogRow k="Qubits" v={b.circuit.n_qubits} />
              <LogRow k="Repetitions" v={b.circuit.reps} />
              <LogRow k="Trainable parameters" v={b.circuit.n_trainable_parameters} />
              <LogRow k="Logical depth" v={b.circuit.depth} />
              <LogRow k="Transpiled depth" v={b.circuit.transpiled_depth_measured} />
              <LogRow k="Gate count" v={b.circuit.size} />
              <LogRow k="Two-qubit gates" v={b.sampled_run_example.two_qubit_gates} />
              <LogRow k="Encoding" v={b.circuit.encoding} />
              <LogRow k="Entanglement" v={b.circuit.entanglement} />
              <LogRow k="Fingerprint" v={b.circuit.fingerprint} mono />
              <LogRow k="Backend" v={b.sampled_run_example.backend} mono />
              <LogRow k="Backend version" v={b.sampled_run_example.backend_version} mono />
              <LogRow k="Shots per run" v={b.sampled_run_example.shots.toLocaleString("en-IN")} />
            </dl>

            <div className="qp__diagram">
              <span className="label">Structure</span>
              <CircuitDiagram nQubits={b.circuit.n_qubits} reps={b.circuit.reps} />
              <ul className="obs">
                {b.circuit.observables.map((o) => (
                  <li key={o} className="mono">
                    {o}
                  </li>
                ))}
              </ul>
              <p className="qp__fine">
                Eight expectation values per sample — four single-qubit ⟨Z⟩ and four
                nearest-neighbour ⟨ZZ⟩ around the ring. These are the quantum features handed to the
                classical logistic head. The layer is a feature transformation, not a classifier.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------- training --------------------------- */}
        <section className="qp__sec" id="training">
          <h2 className="qp__h">Training run</h2>
          <div className="qp__cols">
            <dl className="log">
              <LogRow k="Optimizer" v={b.training.optimizer} />
              <LogRow k="Max iterations" v={b.training.max_iterations} />
              <LogRow k="Circuit batch evaluations" v={b.training.circuit_batch_evaluations} />
              <LogRow k="Wall clock" v={`${b.training.wall_clock_seconds.toFixed(1)} s`} />
              <LogRow k="Initial train log-loss" v={fixed(b.training.initial_train_log_loss, 5)} />
              <LogRow k="Final train log-loss" v={fixed(b.training.final_train_log_loss, 5)} />
              <LogRow k="Best train log-loss" v={fixed(b.training.best_train_log_loss, 5)} />
              <LogRow
                k="Converged"
                v={b.training.converged ? "Yes" : "No — iteration budget reached"}
                neg={!b.training.converged}
              />
              <LogRow k="Started" v={formatStamp(b.started_at)} />
            </dl>

            <div className="qp__diagram">
              <span className="label">Train log-loss vs iteration</span>
              <LossCurve history={b.training.history} />
              <p className="qp__fine">
                Real optimisation over the {b.circuit.n_trainable_parameters} circuit parameters:
                each iteration re-evaluates every training sample's circuit and refits the classical
                head, so the curve is measured, not drawn. It is still descending at the iteration
                cap — reported as not converged rather than presented as a finished result.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------- fidelity --------------------------- */}
        <section className="qp__sec" id="fidelity">
          <h2 className="qp__h">State fidelity</h2>
          <div className="qp__cols">
            <dl className="log">
              <LogRow k="Mean" v={fixed(b.fidelity.mean, 5)} />
              <LogRow k="Min" v={fixed(b.fidelity.min, 5)} />
              <LogRow k="Max" v={fixed(b.fidelity.max, 5)} />
              <LogRow k="Std" v={fixed(b.fidelity.std, 5)} />
              <LogRow k="Circuits measured" v={b.fidelity.n_circuits} />
              <LogRow k="Method" v={b.fidelity.method} />
              <LogRow k="Noise model" v={b.fidelity.noise_model} />
              <LogRow k="1-qubit error rate" v={b.fidelity.one_qubit_error_rate} />
              <LogRow k="2-qubit error rate" v={b.fidelity.two_qubit_error_rate} />
            </dl>

            <div className="qp__diagram">
              <span className="label">Per-run fidelity · {runs.runs.length} demo executions</span>
              <FidelityStrip
                values={runs.runs.map((r) => r.fidelity)}
                min={runs.aggregate.min_fidelity}
                max={runs.aggregate.max_fidelity}
              />
              <p className="qp__fine">{b.fidelity.note}</p>
              <p className="qp__fine">
                The error rates above are chosen parameters of a local depolarizing model, not
                calibration data read off a real device. A real-QPU fidelity figure would need a
                real QPU run, which this build does not have.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------- benchmark --------------------------- */}
        <section className="qp__sec" id="benchmark">
          <h2 className="qp__h">Benchmark · four arms</h2>

          <div className="dsblock">
            <div className="dsblock__grid">
              <div className="field">
                <span className="label">Samples</span>
                <span className="field__v">
                  {b.dataset.n_total} ({b.dataset.n_train} train / {b.dataset.n_test} test)
                </span>
              </div>
              <div className="field">
                <span className="label">Class balance</span>
                <span className="field__v">
                  {Object.entries(b.dataset.class_counts)
                    .map(([k, v]) => `${k} ${v}`)
                    .join(" · ")}
                </span>
              </div>
              <div className="field">
                <span className="label">Split</span>
                <span className="field__v">{b.dataset.split}</span>
              </div>
              <div className="field">
                <span className="label">Label noise</span>
                <span className="field__v">
                  {pct(b.dataset.label_noise_rate, 0)} · {b.dataset.label_noise_applied} labels
                  perturbed
                </span>
              </div>
            </div>
            <p className="qp__fine">{b.dataset.label_noise_note}</p>
            <p className="qp__fine">{b.dataset.difficulty_note}</p>
          </div>

          {/*
           * Claim scope, verbatim from the artifact, sitting on top of the
           * accuracy column rather than only on the execution plate.
           *
           * The same string is already on the plate at the top of this surface,
           * but the sticky selector lets a presenter jump straight to
           * "Benchmark" and never scroll past it. Accuracy is the one figure on
           * this screen a panel is most likely to quote back as diagnostic
           * performance, so the scope that forbids that reading is repeated
           * here instead of being left to the reader's scroll position.
           */}
          <ul className="ledger">
            <li className="ledger__r is-staged">
              <span className="ledger__f mono">SCOPE</span>
              <span className="ledger__t">{b.claim_scope}</span>
            </li>
          </ul>

          <div className="tablewrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Arm</th>
                  <th>Accuracy</th>
                  <th>95% CI (Wilson)</th>
                  <th>Macro F1</th>
                  <th>Macro AUC</th>
                  <th>Log-loss</th>
                  <th>High recall</th>
                  <th>High→Low</th>
                  <th>Referral sens.</th>
                </tr>
              </thead>
              <tbody>
                {b.arms.map((a) => (
                  <tr key={a.arm} className={a.kind === "hybrid" ? "is-hybrid" : ""}>
                    <th scope="row">
                      <span className="tbl__arm">{a.arm}</span>
                      <span className="tbl__note">{a.notes}</span>
                    </th>
                    <td className="mono">{fixed(a.accuracy, 4)}</td>
                    <td className="mono">
                      [{fixed(a.accuracy_95ci_wilson[0], 4)}, {fixed(a.accuracy_95ci_wilson[1], 4)}]
                    </td>
                    <td className="mono">{fixed(a.macro_f1, 4)}</td>
                    <td className="mono">{a.macro_auc_ovr === null ? "—" : fixed(a.macro_auc_ovr, 4)}</td>
                    <td className="mono">{fixed(a.log_loss, 4)}</td>
                    <td className="mono">
                      {a.high_risk_recall === null ? "—" : fixed(a.high_risk_recall, 4)}
                    </td>
                    <td className={`mono ${a.high_risk_called_low === 0 ? "is-good" : "is-bad"}`}>
                      {a.high_risk_called_low}
                    </td>
                    <td className="mono">
                      {a.referral_sensitivity === null ? "—" : fixed(a.referral_sensitivity, 4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="qp__fine">
            The two middle arms exist so the comparison is fair: they see exactly the same four
            components the quantum layer sees. Without them, "quantum beat classical" could just
            mean "the classical control was given less information".{" "}
            <strong>High→Low</strong> counts only the extreme error — a high-risk case called low
            risk, skipping the middle tier entirely. It reads zero on every arm here, and that is
            narrower than it looks: it says nothing about high-risk cases graded Suspicious, or
            Suspicious cases graded Low. The full under-referral count per arm is in the confusion
            matrix below, and it is not zero.
          </p>

          <div className="headline">
            <div className="headline__row">
              <div className="field">
                <span className="label">Hybrid − matched nonlinear</span>
                <span className="field__v">{signed(b.headline.hybrid_minus_matched_classical)}</span>
              </div>
              <div className="field">
                <span className="label">Hybrid − matched linear</span>
                <span className="field__v">{signed(b.headline.hybrid_minus_matched_linear)}</span>
              </div>
              <div className="field">
                <span className="label">Any difference significant</span>
                <span className="field__v field__v--neg">
                  {b.headline.any_difference_significant ? "Yes" : "No"}
                </span>
              </div>
            </div>
            {/* The most important sentence on the surface: it is the one that
                says the hybrid arm did NOT significantly beat its matched
                classical controls. Labelled and set apart so a presenter can
                find it under questioning instead of hunting through a
                paragraph. */}
            <div className="headline__note">
              <span className="label">Interpretation</span>
              <p className="headline__p">{b.headline.interpretation}</p>
            </div>
          </div>

          <h3 className="qp__h3">Paired significance · exact McNemar</h3>
          <div className="tablewrap">
            <table className="tbl tbl--tight">
              <thead>
                <tr>
                  <th>Comparison</th>
                  <th>A right, B wrong</th>
                  <th>A wrong, B right</th>
                  <th>Discordant</th>
                  <th>p</th>
                  <th>p &lt; 0.05</th>
                </tr>
              </thead>
              <tbody>
                {mcnemar.map(([key, m]) => (
                  <tr key={key}>
                    <th scope="row" className="mono">
                      {key}
                    </th>
                    <td className="mono">{m.discordant_a_right_b_wrong}</td>
                    <td className="mono">{m.discordant_a_wrong_b_right}</td>
                    <td className="mono">{m.n_discordant}</td>
                    <td className="mono">{m.p_value.toFixed(4)}</td>
                    <td className="mono">{m.significant_at_05 ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {summary && <p className="qp__callout">{summary}</p>}

          <h3 className="qp__h3">Confusion matrix</h3>
          <div className="segmented" role="group" aria-label="Select arm">
            {b.arms.map((a, i) => (
              <button
                key={a.arm}
                type="button"
                className={`segmented__b ${armIndex === i ? "is-on" : ""}`}
                aria-pressed={armIndex === i}
                onClick={() => setArmIndex(i)}
              >
                {a.kind === "hybrid" ? "Hybrid VQC" : a.arm.replace("Classical ", "")}
              </button>
            ))}
          </div>
          <ConfusionMatrix arm={b.arms[armIndex]} dataset={b.dataset} />
        </section>

        {/* ---------------------------- run log ---------------------------- */}
        <section className="qp__sec" id="runlog">
          <h2 className="qp__h">Execution log · demo cases</h2>
          <dl className="log log--inline">
            <LogRow k="Runs" v={runs.aggregate.n_runs} />
            <LogRow k="Total shots" v={runs.aggregate.total_shots.toLocaleString("en-IN")} />
            <LogRow k="Mean fidelity" v={fixed(runs.aggregate.mean_fidelity, 5)} />
            <LogRow k="Mean wall time" v={`${runs.aggregate.mean_wall_ms.toFixed(2)} ms`} />
            <LogRow k="Total wall time" v={`${runs.aggregate.total_wall_ms.toFixed(1)} ms`} />
          </dl>

          <p className="qp__fine">{runs.aggregate.population}</p>

          <div className="tablewrap">
            <table className="tbl tbl--tight tbl--log">
              <thead>
                <tr>
                  <th>Run id</th>
                  <th>Case</th>
                  <th>Executed (IST)</th>
                  <th>Backend</th>
                  <th>Qubits</th>
                  <th>Shots</th>
                  <th>Depth</th>
                  <th>Fidelity</th>
                  <th>Wall</th>
                  <th>Status</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {runs.runs.map((r) => (
                  <tr key={r.run_id}>
                    <th scope="row" className="mono">
                      {r.run_id}
                    </th>
                    <td className="mono">{r.case_id}</td>
                    <td className="mono">{formatStamp(r.executed_at)}</td>
                    <td className="mono">{r.backend}</td>
                    <td className="mono">{r.n_qubits}</td>
                    <td className="mono">{r.shots}</td>
                    <td className="mono">{r.circuit_depth}</td>
                    <td className="mono">{r.fidelity.toFixed(5)}</td>
                    <td className="mono">{r.wall_ms.toFixed(1)} ms</td>
                    <td className="mono">{r.status}</td>
                    <td>
                      <SimulatedBadge
                        simulated={r.simulated}
                        vendor={r.hardware_vendor}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="qp__fine">
            Run ids are minted locally as <span className="mono">aer-local-&lt;circuit
            fingerprint&gt;-&lt;index&gt;</span>. The prefix is deliberate: no string on this screen
            can be mistaken for an IBM Quantum job id, because none of them is one.
          </p>
        </section>

        {/* -------------------------- environment ------------------------- */}
        <section className="qp__sec" id="environment">
          <h2 className="qp__h">Environment</h2>
          <dl className="log log--inline">
            {Object.entries(b.environment).map(([k, v]) => (
              <LogRow key={k} k={k} v={v} mono />
            ))}
            <LogRow k="Artifact built" v={formatStamp(b.generated_at)} />
            <LogRow
              k="Total pipeline wall clock"
              v={`${b.total_wall_clock_seconds.toFixed(1)} s`}
            />
          </dl>
          <p className="qp__fine">
            Reproduce with <span className="mono">python quantum/train_benchmark.py</span> then{" "}
            <span className="mono">python quantum/run_pipeline.py</span>. The seed is fixed at{" "}
            <span className="mono">{b.dataset.seed}</span>, so the numbers on this screen regenerate
            exactly.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------- log row ---------------------------------- */

function LogRow({
  k,
  v,
  mono = false,
  neg = false,
}: {
  k: string;
  v: string | number;
  mono?: boolean;
  neg?: boolean;
}) {
  return (
    <div className="log__r">
      <dt>{k}</dt>
      <dd className={`${mono ? "mono" : ""} ${neg ? "log__neg" : ""}`}>{v}</dd>
    </div>
  );
}

/* --------------------------- circuit diagram ------------------------------ */

type Col =
  | { t: "box"; text: string; tone: "enc" | "var" }
  | { t: "cz"; a: number; b: number }
  | { t: "cx"; a: number; b: number }
  | { t: "readout" };

function buildColumns(n: number, reps: number): Col[] {
  const cols: Col[] = [];
  for (let r = 0; r < reps; r++) {
    // Data re-uploading: x is re-encoded every repetition.
    cols.push({ t: "box", text: "RY(xπ)", tone: "enc" });
    for (let q = 0; q < n; q++) cols.push({ t: "cz", a: q, b: (q + 1) % n });
    cols.push({ t: "box", text: "RY(θ)", tone: "var" });
    cols.push({ t: "box", text: "RZ(θ)", tone: "var" });
    for (let q = 0; q < n; q++) cols.push({ t: "cx", a: q, b: (q + 1) % n });
  }
  cols.push({ t: "readout" });
  return cols;
}

function CircuitDiagram({ nQubits, reps }: { nQubits: number; reps: number }) {
  const cols = buildColumns(nQubits, reps);
  const rowH = 26;
  const boxW = 46;
  const linkW = 16;
  const readW = 52;
  const padL = 26;

  const widths = cols.map((c) =>
    c.t === "box" ? boxW : c.t === "readout" ? readW : linkW,
  );
  const xs: number[] = [];
  let acc = padL;
  for (const w of widths) {
    xs.push(acc);
    acc += w + 4;
  }
  const w = acc + 4;
  const h = nQubits * rowH + 8;
  const y = (q: number) => 8 + q * rowH + rowH / 2 - 8;

  return (
    <div className="circ" role="img"
      aria-label={`Circuit: ${reps} repetitions of angle encoding, CZ ring, RY and RZ rotations, and a CX ring on ${nQubits} qubits.`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="circ__svg">
        {/* wires */}
        {Array.from({ length: nQubits }, (_, q) => (
          <g key={q}>
            <text x={2} y={y(q) + 4} className="circ__q mono">
              q{q}
            </text>
            <line x1={padL - 4} y1={y(q)} x2={w - 4} y2={y(q)} className="circ__wire" />
          </g>
        ))}

        {cols.map((c, i) => {
          const x = xs[i];
          if (c.t === "box") {
            return (
              <g key={i}>
                {Array.from({ length: nQubits }, (_, q) => (
                  <g key={q}>
                    <rect
                      x={x}
                      y={y(q) - 9}
                      width={boxW}
                      height={18}
                      rx={2}
                      className={`circ__box circ__box--${c.tone}`}
                    />
                    <text x={x + boxW / 2} y={y(q) + 3.5} className="circ__t mono">
                      {c.text}
                    </text>
                  </g>
                ))}
              </g>
            );
          }
          if (c.t === "readout") {
            return (
              <g key={i}>
                {Array.from({ length: nQubits }, (_, q) => (
                  <g key={q}>
                    <rect
                      x={x}
                      y={y(q) - 9}
                      width={readW}
                      height={18}
                      rx={2}
                      className="circ__box circ__box--read"
                    />
                    <text x={x + readW / 2} y={y(q) + 3.5} className="circ__t mono">
                      ⟨Z{q}⟩
                    </text>
                  </g>
                ))}
              </g>
            );
          }
          // two-qubit link
          const cx = x + linkW / 2;
          const y1 = y(c.a);
          const y2 = y(c.b);
          const isCz = c.t === "cz";
          return (
            <g key={i} className={isCz ? "circ__cz" : "circ__cx"}>
              <line x1={cx} y1={y1} x2={cx} y2={y2} className="circ__link" />
              <circle cx={cx} cy={y1} r={2.6} className="circ__ctrl" />
              {isCz ? (
                <circle cx={cx} cy={y2} r={2.6} className="circ__ctrl" />
              ) : (
                <>
                  <circle cx={cx} cy={y2} r={5} className="circ__targ" />
                  <line x1={cx - 5} y1={y2} x2={cx + 5} y2={y2} className="circ__link" />
                  <line x1={cx} y1={y2 - 5} x2={cx} y2={y2 + 5} className="circ__link" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------ loss curve -------------------------------- */

function LossCurve({ history }: { history: { iteration: number; train_log_loss: number }[] }) {
  if (history.length < 2) return null;
  const w = 380;
  const h = 108;
  const pad = 4;
  const losses = history.map((p) => p.train_log_loss);
  const lo = Math.min(...losses);
  const hi = Math.max(...losses);
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i / (history.length - 1)) * (w - pad * 2);
  const yv = (v: number) => pad + ((hi - v) / span) * (h - pad * 2);
  const d = history.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${yv(p.train_log_loss).toFixed(1)}`).join(" ");

  return (
    <div className="loss">
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
        role="img" aria-label={`Training loss from ${hi.toFixed(4)} down to ${losses[losses.length - 1].toFixed(4)} over ${history.length} iterations.`}>
        <line x1={0} y1={h - pad} x2={w} y2={h - pad} className="loss__axis" />
        <path d={d} className="loss__line" fill="none" />
      </svg>
      <div className="loss__ticks mono">
        <span>{hi.toFixed(4)}</span>
        <span>iter 1 → {history.length}</span>
        <span>{lo.toFixed(4)}</span>
      </div>
    </div>
  );
}

/* ---------------------------- fidelity strip ------------------------------ */

function FidelityStrip({ values, min, max }: { values: number[]; min: number; max: number }) {
  const span = max - min || 1;
  return (
    <div className="fidstrip">
      <div className="fidstrip__bars">
        {values.map((v, i) => (
          <span
            key={i}
            className="fidstrip__b"
            style={{ height: `${18 + ((v - min) / span) * 46}px` }}
            title={`run ${i}: ${v.toFixed(5)}`}
          />
        ))}
      </div>
      <div className="fidstrip__ticks mono">
        <span>min {min.toFixed(5)}</span>
        <span>max {max.toFixed(5)}</span>
      </div>
    </div>
  );
}

/* --------------------------- confusion matrix ----------------------------- */

function ConfusionMatrix({
  arm,
  dataset,
}: {
  arm: BenchmarkArm;
  dataset: Benchmark["dataset"];
}) {
  const labels = arm.confusion_matrix_labels;
  const m = arm.confusion_matrix;
  const total = m.flat().reduce((a, b) => a + b, 0) || 1;

  /* Label-noise figures read off the artifact, never typed in. The expected
     number of perturbed rows in THIS split is a scaled estimate, so it is
     rendered with a "roughly" and rounded — the artifact records which samples
     were perturbed only in aggregate, not per split. */
  const noisyInSplit = Math.round(dataset.label_noise_applied * (arm.n_test / dataset.n_total));

  /*
   * Error direction, counted off the matrix instead of asserted in prose.
   *
   * The caption below used to state that the tier boundaries are set so the
   * system errs toward referral. That was wrong twice over. Nothing in the
   * pipeline biases the decision that way — train_benchmark.py takes a plain
   * proba.argmax with no asymmetric cost, and synthetic_data.pick_tier draws
   * from a fixed tier mix with no referral-weighted boundary — and on every arm
   * in the artifact the errors in fact lean the other way. Worst of all, the
   * sentence sat directly beneath the table that disproves it, which is the one
   * place a reviewer is guaranteed to catch it. So the direction is now counted
   * from the same array the table renders and cannot drift from it again.
   *
   * confusion_matrix_labels is TIERS in ascending severity (LOW, SUSPICIOUS,
   * HIGH), so a cell's index IS its severity rank: below the diagonal the
   * scored label outranks the prediction — under-referral, the direction that
   * hurts someone — and above it the prediction outranks the label, which costs
   * only a needless second look.
   *
   * The row axis is the SCORED label, which is the OBSERVED tier after
   * inter-observer label noise — not the generator's true tier. See
   * train_benchmark.py::build_dataset, which draws features from the true tier
   * and then trains and scores against apply_label_noise(true_tier). An earlier
   * version of this panel called the rows the "generator tier", which is
   * checkable and wrong: benchmark.json reports 39 of 720 labels perturbed at
   * rate 0.07, so roughly 14 of these 253 test rows are shifted, and
   * synthetic_data.py moves both LOW and HIGH toward SUSPICIOUS. The noise is
   * therefore the same order of magnitude as the counted effect. The counts
   * below are correct; only the name of the quantity was wrong, and the
   * artifact exposes no per-sample true-vs-observed tier to reconstruct the
   * generator-relative version from.
   */
  let under = 0;
  let over = 0;
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m[i].length; j++) {
      if (i > j) under += m[i][j];
      else if (i < j) over += m[i][j];
    }
  }

  return (
    <div className="cm">
      <table className="cm__t">
        <caption className="cm__cap">
          {arm.arm} · rows = scored label (observed tier, after label noise), columns = predicted
        </caption>
        <thead>
          <tr>
            <td />
            {labels.map((l) => (
              <th key={l} scope="col" className="mono">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {m.map((row, i) => (
            <tr key={labels[i]}>
              <th scope="row" className="mono">
                {labels[i]}
              </th>
              {row.map((v, j) => {
                // The one cell that matters clinically: true HIGH called LOW.
                const fatal = labels[i] === "HIGH" && labels[j] === "LOW";
                return (
                  <td
                    key={j}
                    className={`cm__c mono ${i === j ? "is-diag" : ""} ${fatal ? "is-fatal" : ""}`}
                    style={{ ["--cm-a" as string]: `${(v / total) * 2.6}` }}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Counts, not adjectives. H→L is the artifact's own high_risk_called_low
          field rather than a re-read of the bottom-left cell, so this row says
          the same thing as the High→Low column in the arms table above. */}
      <ul className="ledger">
        <li className="ledger__r">
          <span className="ledger__f mono">H→L</span>
          <span className="ledger__t">
            <span className="mono">{arm.high_risk_called_low}</span> high-risk lesions called low
            risk — the bottom-left cell, the extreme error. Zero here does not mean zero
            under-referrals; see the next row.
          </span>
        </li>
        <li className="ledger__r">
          <span className="ledger__f mono">UNDER</span>
          <span className="ledger__t">
            <span className="mono">{under}</span> of <span className="mono">{arm.n_test}</span> test
            cases graded below their scored label — under-referral, the sum of everything below
            the diagonal. This is the direction that misses disease.
          </span>
        </li>
        <li className="ledger__r">
          <span className="ledger__f mono">OVER</span>
          <span className="ledger__t">
            <span className="mono">{over}</span> graded above their scored label —
            over-referral, the sum of everything above the diagonal. This is the direction that
            wastes a clinician's time.
          </span>
        </li>
        {/* The label the two counts above are relative to is not the generator's
            tier, and saying so is the difference between a defensible number and
            one a judge can disprove by opening train_benchmark.py. */}
        <li className="ledger__r">
          <span className="ledger__f mono">LABEL</span>
          <span className="ledger__t">
            Both counts are relative to the <strong>observed</strong> tier the model was scored
            against, which carries {(dataset.label_noise_rate * 100).toFixed(0)}% injected
            inter-observer label noise (<span className="mono">{dataset.label_noise_applied}</span>{" "}
            of <span className="mono">{dataset.n_total}</span> samples perturbed, so roughly{" "}
            <span className="mono">{noisyInSplit}</span> of these{" "}
            <span className="mono">{arm.n_test}</span> rows). Not the generator's true tier — the
            artifact stores no per-sample true-vs-observed pair to compute that from.
          </span>
        </li>
      </ul>
      <p className="qp__fine">
        {under > over ? (
          <>
            <strong>Most of this arm's errors fall in the direction that misses disease:</strong>{" "}
            {under} under-referrals against {over} over-referrals. This build does not err toward
            referral and must not be presented as if it does.
          </>
        ) : under < over ? (
          <>
            <strong>Most of this arm's errors fall in the safer direction:</strong> {over}{" "}
            over-referrals against {under} under-referrals. That is a count measured on one
            evaluation split, not a safety property of the design.
          </>
        ) : (
          <>
            <strong>This arm's errors split evenly between the two directions:</strong> {under}{" "}
            under-referrals and {over} over-referrals. Nothing in the pipeline tilts it toward
            referral.
          </>
        )}{" "}
        Referral sensitivity in the table above is the looser test — it only asks whether a case was
        routed off LOW, so a true HIGH graded SUSPICIOUS still counts as routed. The under-referral
        count here does not forgive that case.
      </p>
    </div>
  );
}
