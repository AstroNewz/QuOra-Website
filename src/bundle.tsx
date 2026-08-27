import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadBundle, type Bundle } from "./data";

/*
 * One fetch for the whole app.
 *
 * The three surfaces all read the same four artifacts. Loading them once at the
 * shell means switching between Dashboard / Capture / Quantum during a live
 * pitch is instant — no spinner mid-demo.
 */

const BundleContext = createContext<Bundle | null>(null);

export function useBundle(): Bundle {
  const b = useContext(BundleContext);
  if (!b) throw new Error("useBundle() called outside <BundleProvider>");
  return b;
}

export function BundleProvider({ children }: { children: ReactNode }) {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadBundle()
      .then((b) => alive && setBundle(b))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <div className="boot boot--error">
        <p className="label">Artifact load failed</p>
        <pre className="boot__err mono">{error}</pre>
        <p className="boot__hint">
          The web app reads static JSON produced by the Python pipeline. Regenerate it, then
          reload.
        </p>
      </div>
    );
  }

  if (!bundle) {
    // Deliberately not a spinner. An instrument reports what it is doing.
    return (
      <div className="boot">
        <p className="label">QuOra · loading artifacts</p>
        <ul className="boot__list mono">
          <li>cases.json</li>
          <li>benchmark.json</li>
          <li>quantum_runs.json</li>
        </ul>
      </div>
    );
  }

  return <BundleContext.Provider value={bundle}>{children}</BundleContext.Provider>;
}
