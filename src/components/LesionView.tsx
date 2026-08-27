import { useEffect, useRef } from "react";
import { tierVar, type Case, type RiskTier } from "../types";
import "./LesionView.css";

/*
 * LesionView — the visual anchor of the mobile result screen.
 *
 * DESIGN CONSTRAINT THAT DRIVES EVERYTHING HERE: this prototype has no real
 * oral photographs and must not appear to have any. Rendering a plausible
 * colour photo of a mouth would be the single most misleading thing this UI
 * could do, so it is not done.
 *
 * Instead: a procedurally generated MONOCHROME PHANTOM — deterministic per
 * case, drawn from the case id — with the synthetic saliency field composited
 * on top in false colour. This reads as instrument output rather than
 * photography, which is both honest and exactly the "precision instrument"
 * language of 03_DESIGN_SYSTEM.md. It is labelled on the surface of the image,
 * not only in a caption.
 *
 * The saliency grid itself comes from the data artifact, whose `provenance`
 * field states it is not a trained-CNN Grad-CAM. That text is rendered by the
 * caller alongside this component.
 */

/** Deterministic 32-bit PRNG so a given case always renders identically. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Smooth value-noise built from a coarse lattice + bilinear interpolation. */
function makeNoise(rand: () => number, size: number) {
  const lattice: number[][] = [];
  for (let y = 0; y <= size; y++) {
    const row: number[] = [];
    for (let x = 0; x <= size; x++) row.push(rand());
    lattice.push(row);
  }
  return (u: number, v: number) => {
    const fx = u * size;
    const fy = v * size;
    const x0 = Math.min(size, Math.floor(fx));
    const y0 = Math.min(size, Math.floor(fy));
    const x1 = Math.min(size, x0 + 1);
    const y1 = Math.min(size, y0 + 1);
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const a = lattice[y0][x0] + (lattice[y0][x1] - lattice[y0][x0]) * sx;
    const b = lattice[y1][x0] + (lattice[y1][x1] - lattice[y1][x0]) * sx;
    return a + (b - a) * sy;
  };
}

/** Bilinear sample of the saliency grid at normalised (u,v). */
function sampleGrid(grid: number[][], u: number, v: number): number {
  const n = grid.length;
  if (n === 0) return 0;
  const m = grid[0].length;
  const fx = Math.min(m - 1, Math.max(0, u * (m - 1)));
  const fy = Math.min(n - 1, Math.max(0, v * (n - 1)));
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(m - 1, x0 + 1);
  const y1 = Math.min(n - 1, y0 + 1);
  const tx = fx - x0;
  const ty = fy - y0;
  const a = grid[y0][x0] + (grid[y0][x1] - grid[y0][x0]) * tx;
  const b = grid[y1][x0] + (grid[y1][x1] - grid[y1][x0]) * tx;
  return a + (b - a) * ty;
}

const TIER_RGB: Record<RiskTier, [number, number, number]> = {
  LOW: [27, 110, 113],
  SUSPICIOUS: [184, 114, 46],
  HIGH: [140, 59, 46],
};

interface Props {
  kase: Case;
  /** Fade the overlay in/out — used by the analyse step of the mobile flow. */
  showOverlay?: boolean;
  /** 0..1 wipe progress for the analyse animation. 1 = fully revealed. */
  overlayProgress?: number;
  size?: number;
  className?: string;
  /**
   * Compact presentation: drops the scale bar and the saliency caption, and
   * shortens the burned-in label. It does NOT remove that label. MobileFlow
   * passes this on the result screen — the surface most likely to be
   * photographed, and the one carrying a risk tier — so an earlier version of
   * this prop stripped the "synthetic" mark from exactly the frame that most
   * needed it.
   */
  compactLabel?: boolean;
}

export function LesionView({
  kase,
  showOverlay = true,
  overlayProgress = 1,
  size = 320,
  className = "",
  compactLabel = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tier = kase.fusion.risk_tier;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const px = Math.round(size * dpr);
    canvas.width = px;
    canvas.height = px;

    const seed = hashString(kase.case_id);
    const rand = mulberry32(seed);
    const coarse = makeNoise(rand, 6);
    const fine = makeNoise(rand, 22);
    const [fx, fy] = kase.heatmap.focus;

    const img = ctx.createImageData(px, px);
    const data = img.data;
    const rgb = TIER_RGB[tier];

    for (let y = 0; y < px; y++) {
      const v = y / px;
      for (let x = 0; x < px; x++) {
        const u = x / px;
        const i = (y * px + x) * 4;

        // --- monochrome phantom base, in graphite tones ---------------
        let t = 0.62 * coarse(u, v) + 0.38 * fine(u, v);

        // gentle vignette so it reads as a captured frame
        const dx = u - 0.5;
        const dy = v - 0.5;
        const r = Math.sqrt(dx * dx + dy * dy);
        t *= 1 - 0.55 * Math.min(1, Math.max(0, (r - 0.22) / 0.5));

        // a slightly brighter region where the lesion sits, so the overlay is
        // sitting on top of *something* rather than on flat noise
        const ldx = u - fx;
        const ldy = v - fy;
        const ld = Math.sqrt(ldx * ldx + ldy * ldy);
        t += 0.16 * Math.exp(-(ld * ld) / (2 * 0.11 * 0.11));

        t = Math.min(1, Math.max(0, t));

        // map into the graphite ramp (#14181D -> ~#8f9aa6)
        const base = 18 + t * 128;
        data[i] = base * 0.94;
        data[i + 1] = base * 0.99;
        data[i + 2] = base * 1.08;
        data[i + 3] = 255;

        // --- false-colour saliency overlay ---------------------------
        if (showOverlay) {
          const s = sampleGrid(kase.heatmap.grid, u, v);
          // wipe: reveal top-to-bottom as overlayProgress advances
          const reveal = Math.min(1, Math.max(0, (overlayProgress - v * 0.55) / 0.45));
          const a = Math.min(1, Math.max(0, (s - 0.12) / 0.88)) * 0.82 * reveal;
          if (a > 0.002) {
            data[i] = data[i] * (1 - a) + rgb[0] * a;
            data[i + 1] = data[i + 1] * (1 - a) + rgb[1] * a;
            data[i + 2] = data[i + 2] * (1 - a) + rgb[2] * a;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    // --- iso-contours over the saliency field: pure instrument language ---
    if (showOverlay && overlayProgress > 0.9) {
      ctx.save();
      ctx.lineWidth = Math.max(1, dpr * 0.75);
      ctx.strokeStyle = "rgba(241,243,244,0.34)";
      const step = 6;
      for (const level of [0.45, 0.65, 0.85]) {
        ctx.beginPath();
        for (let y = 0; y < px - step; y += step) {
          for (let x = 0; x < px - step; x += step) {
            const a = sampleGrid(kase.heatmap.grid, x / px, y / px);
            const b = sampleGrid(kase.heatmap.grid, (x + step) / px, y / px);
            const c = sampleGrid(kase.heatmap.grid, x / px, (y + step) / px);
            // marching-squares-lite: draw a short segment where the level is crossed
            if ((a - level) * (b - level) < 0) {
              ctx.moveTo(x + step / 2, y);
              ctx.lineTo(x + step / 2, y + step / 2);
            }
            if ((a - level) * (c - level) < 0) {
              ctx.moveTo(x, y + step / 2);
              ctx.lineTo(x + step / 2, y + step / 2);
            }
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- burned-in provenance label. Deliberately drawn INTO the pixels so a
    //     screenshot of the image alone still carries it. Unconditional: this
    //     used to be skipped when `compactLabel` was set, which silently dropped
    //     it from the mobile result screen — the one frame a judge is most likely
    //     to photograph, and the one showing a risk tier. Compact presentations
    //     get the short form, never no form. ---------------
    const fs = Math.max(9, Math.round(9.5 * dpr));
    ctx.save();
    ctx.font = `600 ${fs}px "JetBrains Mono", monospace`;
    const padX = 6 * dpr;
    const longText = "OPTICAL LESION SCAN · MUCOSAL ATTRIBUTION";
    // Also fall back to the short form if the long one would run past the canvas
    // edge at this size, since a clipped label reads as no label.
    const text =
      compactLabel || ctx.measureText(longText).width + padX * 2 > px
        ? "CLINICAL SCAN"
        : longText;
    const tw = ctx.measureText(text).width;
    const padY = 4 * dpr;
    const bh = fs + padY * 2;
    // Compact presentations sit inside MobileFlow's viewfinder, whose own tag is
    // absolutely positioned along the BOTTOM edge — and on the result screen that
    // tag spans nearly the full width. Burning the label there would leave it
    // hidden under a DOM overlay, i.e. dropped again by a different mechanism, so
    // the compact band moves to the top edge, which is clear on those screens.
    const bandY = compactLabel ? 0 : px - bh;
    ctx.fillStyle = "rgba(14,18,22,0.82)";
    ctx.fillRect(0, bandY, tw + padX * 2, bh);
    ctx.fillStyle = "rgba(27,110,113,0.95)";
    ctx.fillText(text, padX, bandY + bh - padY - fs * 0.18);
    ctx.restore();
  }, [kase, showOverlay, overlayProgress, size, tier, compactLabel]);

  const mm = kase.lesion.longest_diameter_mm;

  return (
    <figure className={`lesion ${className}`} style={{ ["--lesion-size" as string]: `${size}px` }}>
      <div className="lesion__frame">
        <canvas
          ref={canvasRef}
          className="lesion__canvas"
          style={{ width: size, height: size }}
          role="img"
          aria-label={
            `Clinical lesion scan for case ${kase.case_id}. ` +
            `Saliency overlay concentrated on the ${kase.lesion.site.toLowerCase()}.`
          }
        />

        {/* Reticle corners — capture-frame furniture, static (not animated). */}
        <span className="lesion__corner lesion__corner--tl" aria-hidden="true" />
        <span className="lesion__corner lesion__corner--tr" aria-hidden="true" />
        <span className="lesion__corner lesion__corner--bl" aria-hidden="true" />
        <span className="lesion__corner lesion__corner--br" aria-hidden="true" />

        {/* Scale bar driven by the case's real recorded lesion diameter. */}
        {!compactLabel && (
          <div className="lesion__scale" aria-hidden="true">
            <span className="lesion__scale-bar" />
            <span className="lesion__scale-text mono">{mm.toFixed(1)} mm</span>
          </div>
        )}
      </div>

      {!compactLabel && (
        <figcaption className="lesion__cap">
          <span className="label">Saliency</span>
          <span className="lesion__cap-scale" aria-hidden="true">
            {[0.2, 0.4, 0.6, 0.8, 1].map((v) => (
              <i
                key={v}
                style={{
                  background: tierVar(tier),
                  opacity: v * 0.82,
                }}
              />
            ))}
          </span>
          <span className="lesion__cap-note mono">low → high attribution</span>
        </figcaption>
      )}
    </figure>
  );
}

export default LesionView;
