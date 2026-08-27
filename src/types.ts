/*
 * QuOra — TypeScript mirror of quantum/schema.py.
 *
 * Provenance flags (`synthetic`, `simulated`) are part of the contract, not
 * metadata. Components below consume them to render the demo banner and the
 * simulator badge, so a record cannot reach the screen without its provenance
 * reaching the screen with it.
 */

export const DEMO_DISCLAIMER =
  "QuOra Clinical Decision Support · AI Triage Protocol.";

export type RiskTier = "LOW" | "SUSPICIOUS" | "HIGH";

export type ReviewStatus =
  | "NO_REVIEW_REQUIRED"
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "CLINICIAN_CLEARED"
  | "ESCALATED_TO_SPECIALIST";

export type PipelineMode = "HYBRID" | "OFFLINE_CLASSICAL_FALLBACK";

export interface Patient {
  pseudonym: string;
  age_years: number;
  sex: string;
  district: string;
  state: string;
  risk_factors: string[];
  years_exposure: number;
  tobacco_areca_use: string;
}

export interface Lesion {
  site: string;
  clinical_appearance: string;
  longest_diameter_mm: number;
  reference_pattern: string;
}

export interface CaptureQuality {
  quality_score: number;
  blur_score: number;
  illumination_score: number;
  framing_score: number;
  gate_passed: boolean;
  gate_notes: string[];
  retries: number;
}

export interface ClassicalStage {
  features: number[];
  confidence: number;
  baseline_probability: number;
  backbone: string;
  backbone_status: string;
  trace: number[];
}

export interface QuantumStage {
  expectation: number;
  probability: number;
  fidelity: number;
  run_id: string;
  backend: string;
  n_qubits: number;
  shots: number;
  circuit_depth: number;
  /** true = local Aer simulator, NOT IBM Quantum hardware. Drives the UI badge. */
  simulated: boolean;
  hardware_vendor: string | null;
  trace: number[];
}

export interface Fusion {
  risk_score: number;
  risk_tier: RiskTier;
  confidence: number;
  /**
   * Gap between the winning tier and the runner-up. Deliberately NOT a
   * confidence interval — a single forward pass has no sampling distribution to
   * derive one from, so any interval shown here would have to be invented. See
   * the note in quantum/run_pipeline.py.
   */
  margin: number;
  runner_up_tier: RiskTier;
  /** Each head's own probability for the winning tier. Null quantum = offline. */
  classical_confidence: number;
  quantum_confidence: number | null;
  agreement: string;
  drivers: string[];
}

export interface Heatmap {
  grid: number[][];
  resolution: number;
  focus: [number, number] | number[];
  method: string;
  /** Explicit statement that this is not a trained-model output. Rendered in UI. */
  provenance: string;
}

export interface Review {
  status: ReviewStatus;
  routed: boolean;
  routing_reason: string;
  assigned_role: string | null;
  sla_hours: number | null;
}

export interface Case {
  case_id: string;
  synthetic: boolean;
  disclaimer: string;
  captured_at: string;
  pipeline_mode: PipelineMode;
  patient: Patient;
  lesion: Lesion;
  capture: CaptureQuality;
  classical: ClassicalStage;
  quantum: QuantumStage | null;
  fusion: Fusion;
  heatmap: Heatmap;
  review: Review;
  /** The generator's true tier before inter-observer label noise. Kept so the
   *  dashboard can show honest per-case model correctness rather than implying
   *  the prediction is ground truth. */
  synthetic_ground_truth?: RiskTier;
  predicted_matches_truth?: boolean;
}

export interface CaseCollection {
  artifact: string;
  generated_at: string;
  synthetic: boolean;
  disclaimer: string;
  provenance: string;
  count: number;
  tier_counts: Record<string, number>;
  capture_gate: CaptureGate;
  /** Feature names in vector order, from the generator. Label from this. */
  feature_order: string[];
  cases: Case[];
}

/*
 * The quality gate, published by the pipeline rather than restated here.
 *
 * `quantum/synthetic_data.py::GATE_SPEC` is the single source of truth. The UI
 * renders these numbers; it must never hardcode a threshold of its own. An
 * earlier build printed "threshold 0.620" on the capture screen — a figure that
 * appeared nowhere in the pipeline, which gated on three separate per-component
 * floors and never on the composite at all. Reading the gate off the artifact
 * makes that class of drift impossible.
 */
export interface GateComponent {
  key: "blur_score" | "illumination_score" | "framing_score";
  label: string;
  min: number;
}

export interface CaptureGate {
  components: GateComponent[];
  composite: {
    key: string;
    label: string;
    weights: Record<string, number>;
    /** null on purpose: the composite is a display summary, not a gate. */
    min: number | null;
    note: string;
  };
  max_retries: number;
  rule: string;
}

/* ---------------- benchmark artifact (from train_benchmark.py) ------------- */

export interface BenchmarkArm {
  arm: string;
  kind: "classical" | "hybrid";
  notes: string;
  accuracy: number;
  accuracy_95ci_wilson: number[];
  macro_f1: number;
  macro_auc_ovr: number | null;
  log_loss: number;
  high_risk_recall: number | null;
  high_risk_called_low: number;
  referral_sensitivity: number | null;
  confusion_matrix: number[][];
  confusion_matrix_labels: string[];
  n_test: number;
}

export interface McNemarResult {
  comparison?: string;
  discordant_a_right_b_wrong: number;
  discordant_a_wrong_b_right: number;
  n_discordant: number;
  p_value: number;
  significant_at_05: boolean;
  test: string;
}

export interface Benchmark {
  artifact: string;
  generated_at: string;
  data_provenance: string;
  claim_scope: string;
  execution_target: string;
  simulated: boolean;
  real_quantum_hardware_used: boolean;
  ibm_quantum_job_submitted: boolean;
  hardware_note: string;
  dataset: {
    n_total: number;
    n_train: number;
    n_test: number;
    n_features: number;
    class_counts: Record<string, number>;
    test_fraction: number;
    seed: number;
    split: string;
    label_noise_rate: number;
    label_noise_applied: number;
    label_noise_note: string;
    difficulty_note: string;
  };
  circuit: {
    n_qubits: number;
    reps: number;
    n_trainable_parameters: number;
    depth: number;
    size: number;
    encoding: string;
    entanglement: string;
    observables: string[];
    fingerprint: string;
    transpiled_depth_measured: number;
  };
  training: {
    optimizer: string;
    max_iterations: number;
    circuit_batch_evaluations: number;
    wall_clock_seconds: number;
    initial_train_log_loss: number;
    final_train_log_loss: number;
    best_train_log_loss: number;
    converged: boolean;
    history: { iteration: number; train_log_loss: number }[];
  };
  fidelity: {
    mean: number;
    min: number;
    max: number;
    std: number;
    n_circuits: number;
    method: string;
    noise_model: string;
    one_qubit_error_rate: number;
    two_qubit_error_rate: number;
    note: string;
  };
  sampled_run_example: QuantumRunMeta;
  arms: BenchmarkArm[];
  significance: Record<string, McNemarResult | string>;
  headline: {
    best_arm: string;
    best_accuracy: number;
    hybrid_accuracy: number;
    hybrid_accuracy_95ci: number[];
    matched_classical_accuracy: number;
    matched_linear_accuracy: number;
    hybrid_minus_matched_classical: number;
    hybrid_minus_matched_linear: number;
    any_difference_significant: boolean;
    interpretation: string;
  };
  environment: Record<string, string>;
  total_wall_clock_seconds: number;
  started_at: string;
}

export interface QuantumRunMeta {
  backend: string;
  backend_version: string;
  n_qubits: number;
  shots: number;
  circuit_depth: number;
  circuit_size: number;
  two_qubit_gates: number;
  wall_ms: number;
  simulated: boolean;
  hardware_vendor: string | null;
}

export interface QuantumRunRecord extends QuantumRunMeta {
  run_id: string;
  case_id: string;
  /** Real wall-clock stamp taken immediately before the circuit executed.
   *  Not a submission time — nothing is submitted anywhere. */
  executed_at: string;
  fidelity: number;
  expectations: number[];
  observable_labels: string[];
  status: string;
}

export interface QuantumRunLog {
  artifact: string;
  generated_at: string;
  simulated: boolean;
  real_quantum_hardware_used: boolean;
  ibm_quantum_job_submitted: boolean;
  disclaimer: string;
  execution_target: string;
  hardware_note: string;
  environment: Record<string, string>;
  circuit: Benchmark["circuit"];
  noise_model: {
    noise_model: string;
    one_qubit_error_rate: number;
    two_qubit_error_rate: number;
    note: string;
  } | null;
  runs: QuantumRunRecord[];
  aggregate: {
    n_runs: number;
    /** Which fidelity population this aggregate covers. benchmark.json carries a
     *  different one (24 held-out circuits vs these 22 per-case runs). */
    population: string;
    total_shots: number;
    mean_fidelity: number;
    min_fidelity: number;
    max_fidelity: number;
    mean_wall_ms: number;
    total_wall_ms: number;
  };
}

/* ---------------------------- display helpers ----------------------------- */

export const TIER_LABEL: Record<RiskTier, string> = {
  LOW: "Low risk",
  SUSPICIOUS: "Suspicious",
  HIGH: "High risk",
};

/** Glyph paired with every tier colour — doc 03 forbids colour-only signalling. */
export const TIER_GLYPH: Record<RiskTier, string> = {
  LOW: "●",
  SUSPICIOUS: "▲",
  HIGH: "■",
};

export const TIER_ORDER: Record<RiskTier, number> = {
  HIGH: 0,
  SUSPICIOUS: 1,
  LOW: 2,
};

export const REVIEW_LABEL: Record<ReviewStatus, string> = {
  NO_REVIEW_REQUIRED: "No referral raised",
  PENDING_REVIEW: "Pending review",
  IN_REVIEW: "In review",
  CLINICIAN_CLEARED: "Clinician cleared",
  ESCALATED_TO_SPECIALIST: "Escalated to specialist",
};

export function tierVar(tier: RiskTier): string {
  return tier === "LOW"
    ? "var(--tier-low)"
    : tier === "SUSPICIOUS"
      ? "var(--tier-suspicious)"
      : "var(--tier-high)";
}

export function tierVarBright(tier: RiskTier): string {
  return tier === "LOW"
    ? "var(--tier-low-bright)"
    : tier === "SUSPICIOUS"
      ? "var(--tier-suspicious-bright)"
      : "var(--tier-high-bright)";
}

export function tierVarWash(tier: RiskTier): string {
  return tier === "LOW"
    ? "var(--tier-low-wash)"
    : tier === "SUSPICIOUS"
      ? "var(--tier-suspicious-wash)"
      : "var(--tier-high-wash)";
}

export function pct(x: number, digits = 1): string {
  return `${(x * 100).toFixed(digits)}%`;
}

export function fixed(x: number, digits = 4): string {
  return x.toFixed(digits);
}

export function signed(x: number, digits = 4): string {
  return `${x >= 0 ? "+" : ""}${x.toFixed(digits)}`;
}
