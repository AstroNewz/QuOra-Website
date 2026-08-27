/*
 * The QuOra Brand Identity Component.
 * Faithfully matches quora_refined_v1_logo.svg:
 *   - Clinical Teal arc: #1B6E71 (classical ML layer, 270-degree arc)
 *   - Quantum Violet arc: #5B4B9E (quantum VQC layer, 90-degree arc)
 *   - Graphite Ink Q tail: #14181D (crisp diagonal stroke forming Q)
 *   - Space Grotesk / Display wordmark in #14181D
 */

interface MarkProps {
  size?: number;
  weight?: number;
  className?: string;
  tailColor?: string;
}

export function BrandMark({
  size = 28,
  weight = 5.5,
  className,
  tailColor = "#14181D",
}: MarkProps) {
  return (
    <svg
      className={`mark ${className ?? ""}`}
      width={size}
      height={size}
      viewBox="-56 -56 112 112"
      role="img"
      aria-label="QuOra Brand Mark"
      focusable="false"
      style={{ overflow: "visible" }}
    >
      {/* Classical arc — Clinical Teal (#1B6E71), the 270-deg lower arc */}
      <path
        d="M 0 -48 A 48 48 0 1 1 -33.9 33.9"
        fill="none"
        stroke="#1B6E71"
        strokeWidth={weight}
        strokeLinecap="round"
      />
      {/* Quantum arc — Quantum Violet (#5B4B9E), the 90-deg upper arc */}
      <path
        d="M -33.9 33.9 A 48 48 0 0 1 0 -48"
        fill="none"
        stroke="#5B4B9E"
        strokeWidth={weight}
        strokeLinecap="round"
      />
      {/* Diagonal tail forming the Q character in Graphite Ink */}
      <line
        x1="24"
        y1="24"
        x2="48"
        y2="48"
        stroke={tailColor}
        strokeWidth={weight}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Complete QuOra Brand Component with dual-arc mark and typographic wordmark.
 */
export function Brand({
  size = 28,
  subtitle,
  className,
}: {
  size?: number;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`brand ${className ?? ""}`}>
      <div className="brand__mark-wrap">
        <BrandMark size={size} />
      </div>
      <div className="brand__text">
        <span className="brand__word">QuOra</span>
        {subtitle && <span className="brand__sub">{subtitle}</span>}
      </div>
    </div>
  );
}
