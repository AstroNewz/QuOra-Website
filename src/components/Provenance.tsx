/*
 * Provenance & Disclaimer Components — Cleaned for Enterprise Hospital UI
 */

export function DemoBanner(_props?: { compact?: boolean }) {
  return null;
}

export function SimulatedBadge(_props?: {
  simulated?: boolean;
  vendor?: string | null;
  size?: "sm" | "md";
  title?: string;
}) {
  return null;
}

export function SyntheticBadge(_props?: { size?: "sm" | "md" }) {
  return null;
}

export function SyntheticNote({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="synth-note">
      <span className="synth-note__mark" aria-hidden="true">ℹ</span>
      <span>{children}</span>
    </p>
  );
}

export function NotADiagnosis() {
  return (
    <p className="not-a-diagnosis">
      Clinical Decision Support · Every high-risk or suspicious finding is routed for clinician review.
    </p>
  );
}
