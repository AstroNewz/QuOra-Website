import { TIER_GLYPH, TIER_LABEL, type RiskTier } from "../types";
import "./RiskTier.css";

/*
 * Risk tier display.
 *
 * 03_DESIGN_SYSTEM.md, Accessibility Floor: "do not rely on color alone — pair
 * with text labels and icons for colorblind accessibility". So every tier
 * rendering here carries three redundant signals: colour, glyph, and word.
 * There is no colour-only variant available to callers, by design.
 */

export function RiskTierBadge({
  tier,
  size = "md",
  showGlyph = true,
}: {
  tier: RiskTier;
  size?: "sm" | "md" | "lg";
  showGlyph?: boolean;
}) {
  return (
    <span className={`tier tier--${tier.toLowerCase()} tier--${size} mono`}>
      {showGlyph && (
        <span className="tier__glyph" aria-hidden="true">
          {TIER_GLYPH[tier]}
        </span>
      )}
      <span className="tier__word">{TIER_LABEL[tier].toUpperCase()}</span>
    </span>
  );
}

/** The big Plex Mono tier readout used on the mobile result screen (doc 03). */
export function RiskTierReadout({
  tier,
  confidence,
  margin,
  runnerUp,
}: {
  tier: RiskTier;
  confidence: number;
  /** Gap to the runner-up tier. NOT a confidence interval — see types.ts. */
  margin?: number;
  runnerUp?: RiskTier;
}) {
  return (
    <div className={`tier-readout tier-readout--${tier.toLowerCase()}`}>
      <div className="tier-readout__top">
        <span className="tier-readout__glyph" aria-hidden="true">
          {TIER_GLYPH[tier]}
        </span>
        <span className="tier-readout__tier mono">{TIER_LABEL[tier].toUpperCase()}</span>
      </div>
      <div className="tier-readout__meta">
        <span className="label">Confidence</span>
        <span className="tier-readout__conf mono">{(confidence * 100).toFixed(1)}%</span>
        {/* This slot used to hold a bracketed interval. It reported a number the
            pipeline could not actually justify, so it now reports how close the
            call was — which is what a reader wanted from the interval anyway. */}
        {margin !== undefined && (
          <span className="tier-readout__margin mono">
            +{(margin * 100).toFixed(1)} pts over{" "}
            {runnerUp ? TIER_LABEL[runnerUp] : "runner-up"}
          </span>
        )}
      </div>
      {/* doc 02: "Confidence score always shown alongside the classification,
          never a bare label." Enforced structurally — this component cannot
          render a tier without its confidence. */}
    </div>
  );
}

/** Horizontal risk-score meter, tier-coloured, with the numeric value in mono. */
export function RiskScoreBar({ score, tier }: { score: number; tier: RiskTier }) {
  const pctWidth = Math.max(2, Math.min(100, score * 100));
  return (
    <div className="risk-bar">
      <div className="risk-bar__track" role="img" aria-label={`Risk score ${score.toFixed(3)} of 1`}>
        <div
          className={`risk-bar__fill risk-bar__fill--${tier.toLowerCase()}`}
          style={{ width: `${pctWidth}%` }}
        />
        {/* Tier thresholds, engraved. Makes the score legible as a position
            rather than an abstract number. */}
        <span className="risk-bar__tick" style={{ left: "33.3%" }} aria-hidden="true" />
        <span className="risk-bar__tick" style={{ left: "66.6%" }} aria-hidden="true" />
      </div>
      <span className="risk-bar__value mono">{score.toFixed(3)}</span>
    </div>
  );
}
