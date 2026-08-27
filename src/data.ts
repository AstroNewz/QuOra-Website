/*
 * Artifact loader.
 *
 * Reads the static JSON produced by the Python pipeline. Deliberately no API
 * dependency: a live pitch must not be able to fail because a Python process
 * died or a port was taken. There is no server in this build — the app is a
 * static bundle over static artifacts, and the pipeline runs offline, ahead of
 * time. Regenerate with `cd quantum && python train_benchmark.py &&
 * python run_pipeline.py`, then `npm run sync-data` (predev/prebuild do it).
 */

import type { Benchmark, Case, CaseCollection, QuantumRunLog } from "./types";

const BASE = import.meta.env.BASE_URL ?? "/";

async function loadJson<T>(name: string): Promise<T> {
  const res = await fetch(`${BASE}data/${name}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Could not load data/${name} (HTTP ${res.status}). ` +
        `Generate the artifacts first:  cd quantum && python train_benchmark.py && python run_pipeline.py`,
    );
  }
  return (await res.json()) as T;
}

export const loadCases = () => loadJson<CaseCollection>("cases.json");
export const loadBenchmark = () => loadJson<Benchmark>("benchmark.json");
export const loadQuantumRuns = () => loadJson<QuantumRunLog>("quantum_runs.json");

export interface Bundle {
  cases: CaseCollection;
  benchmark: Benchmark;
  runs: QuantumRunLog;
}

export async function loadBundle(): Promise<Bundle> {
  const [cases, benchmark, runs] = await Promise.all([
    loadCases(),
    loadBenchmark(),
    loadQuantumRuns(),
  ]);
  return { cases, benchmark, runs };
}

/* --------------------------------- helpers -------------------------------- */

export function findCase(collection: CaseCollection, id: string): Case | undefined {
  return collection.cases.find((c) => c.case_id === id);
}

/** IST display, matching the deployment geography. */
export function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    })
    .replace(",", "");
}

export function formatShortStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

export function relativeAge(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const hours = (now.getTime() - d.getTime()) / 36e5;
  if (Number.isNaN(hours)) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m ago`;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
