/*
 * Copies the generated artifacts from data/generated into web/public/data so
 * Vite serves them.
 *
 * Why copy rather than fetch from an API: a live pitch must not depend on a
 * Python process staying up or a port being free. There is no server in this
 * build at all — the app is a static bundle over these static artifacts, and the
 * pipeline runs offline, ahead of time. The dashboard therefore cannot fail on
 * stage for a reason outside the browser.
 *
 * Runs automatically via the predev / prebuild npm hooks.
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "..", "..", "data", "generated");
const dest = resolve(here, "..", "public", "data");

const REQUIRED = ["cases.json", "quantum_runs.json", "benchmark.json", "manifest.json"];

if (!existsSync(src)) {
  console.error(`[sync-data] missing ${src}`);
  console.error("[sync-data] run:  cd quantum && python train_benchmark.py && python run_pipeline.py");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

const copied = [];
for (const name of readdirSync(src)) {
  if (!name.endsWith(".json") && !name.endsWith(".csv")) continue;
  cpSync(join(src, name), join(dest, name));
  copied.push(name);
}

const missing = REQUIRED.filter((f) => !copied.includes(f));
if (missing.length) {
  console.error(`[sync-data] required artifact(s) not generated: ${missing.join(", ")}`);
  console.error("[sync-data] run:  cd quantum && python train_benchmark.py && python run_pipeline.py");
  process.exit(1);
}

console.log(`[sync-data] copied ${copied.length} artifact(s) -> web/public/data`);
