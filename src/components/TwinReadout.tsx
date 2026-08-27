import { useEffect, useMemo, useRef, useState } from "react";
import "./TwinReadout.css";

/*
 * THE SIGNATURE ELEMENT (03_DESIGN_SYSTEM.md).
 *
 *   "Every place a result appears (app result card, dashboard row, loading
 *    state) shows two synced thin horizontal traces side by side: a teal trace
 *    (classical confidence curve) and a violet trace (quantum layer
 *    status/fidelity). They animate into sync when a result resolves."
 *
 * So the component has two states and the transition between them IS the point:
 *
 *   state "live"     — the two traces drift out of phase. Used while analysing.
 *   state "resolved" — the violet trace converges onto the teal trace's phase
 *                      and settles. Used once a result exists.
 *
 * The sync-on-reveal is one of only two animated moments doc 03 permits in the
 * entire product (the other is the capture alignment pulse), so it is animated
 * properly — a real eased interpolation of the violet trace's phase and
 * amplitude — rather than a CSS fade.
 */

export type TwinReadoutSize = "row" | "strip" | "hero";

interface Props {
  /** Classical confidence curve. Values in [0,1]. */
  classical: number[];
  /**
   * Quantum layer status / fidelity curve. Values in [0,1].
   *
   * `null` = no quantum circuit was executed for this case (the offline
   * classical-only path — 2 of the 24 demo cases, where `case.quantum` is null
   * in cases.json). The violet lane then renders idle and NO expectation value
   * is printed. Callers must pass null rather than a zero-filled array: an
   * all-zero trace renders as a measured `Q 0`, which asserts a Pauli-Z
   * expectation of 0.00 for a circuit that never ran, in the one colour the
   * palette reserves for the quantum layer.
   */
  quantum: number[] | null;
  /** false = traces drift (analysing). true = traces sync (result exists). */
  resolved?: boolean;
  size?: TwinReadoutSize;
  /** Tint the teal trace to the risk tier instead of clinical teal. */
  tierColor?: string;
  /** Show the numeric end-values beside the traces. */
  showValues?: boolean;
  label?: string;
  className?: string;
}

const GEOM: Record<TwinReadoutSize, { w: number; h: number; gap: number; stroke: number }> = {
  row: { w: 132, h: 26, gap: 3, stroke: 1.15 },
  strip: { w: 300, h: 54, gap: 6, stroke: 1.5 },
  hero: { w: 420, h: 76, gap: 8, stroke: 1.75 },
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Catmull-Rom-ish smoothed polyline through the sampled points. */
function smoothPath(values: number[], w: number, h: number, pad: number): string {
  if (values.length === 0) return "";
  const n = values.length;
  const x = (i: number) => pad + (i / (n - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - v * (h - pad * 2);

  if (n < 3) return `M ${x(0)} ${y(values[0])} L ${x(n - 1)} ${y(values[n - 1])}`;

  let d = `M ${x(0).toFixed(2)} ${y(values[0]).toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const x0 = x(i);
    const y0 = y(values[i]);
    const x1 = x(i + 1);
    const y1 = y(values[i + 1]);
    const cx = (x0 + x1) / 2;
    d += ` C ${cx.toFixed(2)} ${y0.toFixed(2)} ${cx.toFixed(2)} ${y1.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

/** Resample a trace to a fixed length so the two traces always align in x. */
function resample(values: number[], n: number): number[] {
  if (values.length === 0) return new Array(n).fill(0.5);
  if (values.length === n) return values;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (values.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(values.length - 1, lo + 1);
    out.push(values[lo] + (values[hi] - values[lo]) * (t - lo));
  }
  return out;
}

const SAMPLES = 44;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function TwinReadout({
  classical,
  quantum,
  resolved = true,
  size = "row",
  tierColor,
  showValues = false,
  label,
  className = "",
}: Props) {
  const { w, h, gap, stroke } = GEOM[size];
  const pad = stroke + 1.5;
  const laneH = (h - gap) / 2;

  /* Did the quantum stage actually execute for this case? Everything violet on
     this component is gated on this flag. */
  const ran = quantum !== null && quantum.length > 0;

  const cTrace = useMemo(() => resample(classical, SAMPLES), [classical]);
  const qTrace = useMemo(() => resample(quantum ?? [], SAMPLES), [quantum]);

  // sync ∈ [0,1]: 0 = fully drifted apart, 1 = locked together.
  // phase advances only while unresolved, which is what makes the "analysing"
  // state visibly move instead of sitting still at sync=0.
  const [sync, setSync] = useState(resolved && prefersReducedMotion() ? 1 : 0);
  const [phase, setPhase] = useState(0);
  const syncRef = useRef(sync);
  syncRef.current = sync;
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setSync(resolved ? 1 : 0);
      setPhase(0);
      return;
    }

    let start: number | null = null;
    const from = syncRef.current;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;

      if (resolved) {
        // Converge to locked, then stop animating entirely (doc 03: restraint).
        const t = Math.min(1, elapsed / 900);
        setSync(from + (1 - from) * easeOutCubic(t));
        if (t < 1) {
          raf.current = requestAnimationFrame(tick);
        }
      } else {
        // Unresolved: the two traces slide against each other continuously.
        setSync(0);
        setPhase(elapsed / 1000);
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [resolved]);

  // While drifting, the violet trace is phase-shifted and flattened toward its
  // mean; as `sync` -> 1 it recovers its true shape and phase.
  const qMean = useMemo(
    () => qTrace.reduce((a, b) => a + b, 0) / Math.max(1, qTrace.length),
    [qTrace],
  );

  const qShown = useMemo(() => {
    if (sync >= 0.999) return qTrace;
    const flat = 1 - sync;
    // Drift offset: a continuous slide while analysing, collapsing to zero as
    // the traces lock.
    const shiftSamples = Math.round(flat * 9 + phase * 6) % qTrace.length;
    return qTrace.map((_, i) => {
      const src = qTrace[(i + shiftSamples) % qTrace.length];
      return src * (1 - flat) + qMean * flat;
    });
  }, [qTrace, sync, phase, qMean]);

  const cPath = smoothPath(cTrace, w, laneH, pad);
  const qPath = smoothPath(qShown, w, laneH, pad);

  const tealStroke = tierColor ?? "var(--clinical-teal)";
  /* With no quantum stage there is nothing to lock onto, so the lane never
     claims a sync — the tick stays hidden and the trace is never drawn. */
  const locked = ran && sync >= 0.999;

  const cEnd = cTrace[cTrace.length - 1] ?? 0;
  const qEnd = qTrace[qTrace.length - 1] ?? 0;

  return (
    <div
      className={`twin twin--${size} ${locked ? "is-locked" : "is-drifting"} ${
        ran ? "" : "is-noq"
      } ${className}`}
      data-resolved={resolved}
      data-quantum-ran={ran}
    >
      {label && <span className="twin__label label">{label}</span>}

      <div className="twin__body">
        <svg
          className="twin__svg"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={
            /* The violet lane is NOT a percentage and NOT a confidence. Its final
               sample is the circuit's Pauli-Z expectation value <Z_0> mapped from
               [-1,1] into [0,1] purely for display — see build_trace((z0 + 1) / 2)
               in quantum/run_pipeline.py. An earlier label read "quantum layer NN
               percent", which handed screen-reader users a confidence figure that
               no sighted user is shown anywhere. The teal lane genuinely is a
               confidence (the classical head's max softmax probability), so that
               half keeps "percent".

               The third branch exists because the first two both described a
               quantum trace. On the offline classical-only cases there is no
               circuit and no expectation value, so a screen-reader user was being
               told a measurement existed — and told its value was 0.00. */
            !ran
              ? `Twin readout. Teal lane, classical confidence ${(cEnd * 100).toFixed(0)} percent. ` +
                `Violet lane idle: no quantum circuit was executed for this case, which took the ` +
                `offline classical-only path. No expectation value exists to report.`
              : resolved
                ? `Twin readout, synced. Teal lane, classical confidence ${(cEnd * 100).toFixed(0)} percent. ` +
                  `Violet lane, quantum expectation-value readout ${qEnd.toFixed(2)} on a zero-to-one display scale, ` +
                  `not a percentage and not a confidence.`
                : "Twin readout, analysing. Classical and quantum traces not yet synced."
          }
        >
          {/* teal lane — classical / clinical layer */}
          <g transform={`translate(0,0)`}>
            <line
              x1={0}
              y1={laneH - pad / 2}
              x2={w}
              y2={laneH - pad / 2}
              className="twin__base"
            />
            <path d={cPath} fill="none" stroke={tealStroke} strokeWidth={stroke} className="twin__trace" />
          </g>

          {/* violet lane — quantum layer, and only ever the quantum layer.
              When no circuit ran, the lane keeps its baseline (so the component
              still reads as two lanes) but draws no trace: violet appearing at
              all would assert quantum work that did not happen. */}
          <g transform={`translate(0,${laneH + gap})`}>
            <line
              x1={0}
              y1={laneH - pad / 2}
              x2={w}
              y2={laneH - pad / 2}
              className={`twin__base ${ran ? "" : "twin__base--idle"}`}
            />
            {ran && (
              <path
                d={qPath}
                fill="none"
                stroke="var(--quantum-violet)"
                strokeWidth={stroke}
                className="twin__trace twin__trace--q"
              />
            )}
          </g>

          {/* sync tick: appears only once the two traces have locked */}
          <line
            x1={w - pad}
            y1={pad}
            x2={w - pad}
            y2={h - pad}
            className="twin__synctick"
            style={{ opacity: locked ? 1 : 0 }}
          />
        </svg>

        {showValues && (
          /* Each figure is tagged C / Q and sits on its own lane's baseline. The
             tags exist because in a dense card grid two bare stacked numerals
             read as noise — you cannot tell which lane either belongs to
             without counting pixels. */
          <div className="twin__values mono">
            <span
              className="twin__v twin__v--c"
              style={{ color: tealStroke }}
              title="Classical confidence, percent."
            >
              <i aria-hidden="true">C</i>
              {(cEnd * 100).toFixed(0)}
              <em aria-hidden="true">%</em>
            </span>
            {/* The C figure carries a visible "%" and the Q figure does not.
                That is the whole disambiguation, and it has to be visible:
                both figures previously rendered as bare integers on the same
                0-100 scale in the same face, so the only thing distinguishing a
                confidence from a Pauli-Z expectation value was a hover title —
                which never fires on a projector and never fires on touch, and
                these figures appear in the mobile flow. The title stays as the
                long-form explanation for anyone who can hover. */}
            {ran ? (
              <span
                className="twin__v twin__v--q"
                title="Quantum lane: Pauli-Z expectation value, mapped onto a 0–100 display scale. Not a percentage or a confidence."
              >
                <i aria-hidden="true">Q</i>
                {(qEnd * 100).toFixed(0)}
              </span>
            ) : (
              <span
                className="twin__v twin__v--q twin__v--idle"
                title="No quantum circuit ran for this case — it took the offline classical-only path, so there is no expectation value to display."
              >
                <i aria-hidden="true">Q</i>
                <span aria-hidden="true">—</span>
                <span className="sr-only">not run</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TwinReadout;
