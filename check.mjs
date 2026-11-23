#!/usr/bin/env node
/* check.mjs — validate movement data. No new dependencies (uses esbuild already in the repo).
   Run: npm run check
   Every movement carries a rig. Legacy stick-figure fields are rejected.
*/

import * as esbuild from "esbuild";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const KNOWN_TAGS = new Set(["upper", "lower", "core", "full"]);
const KNOWN_POOLS = new Set(["standard", "complex"]);
const LEGACY_FIELDS = ["poses", "posesF", "frontOnly", "bellFlip"];

async function loadMovements() {
  const result = await esbuild.build({
    stdin: {
      contents: 'export * from "./movements.js"; export { validateRig, checkRig } from "./rig.js";',
      resolveDir: __dirname,
    },
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
  });
  const module = { exports: {} };
  const fn = new Function("module", "exports", "require", result.outputFiles[0].text);
  fn(module, module.exports, require);
  return module.exports;
}

async function main() {
  const { EXERCISES, PATTERN_ORDER, validateRig, checkRig } = await loadMovements();
  const errors = [];
  const warnings = [];
  const ids = new Set();
  const patterns = new Set(PATTERN_ORDER);

  if (!Array.isArray(EXERCISES) || !EXERCISES.length) errors.push("EXERCISES is empty");
  if (!Array.isArray(PATTERN_ORDER) || !PATTERN_ORDER.length) errors.push("PATTERN_ORDER is empty");

  const knownGroups = new Set(
    EXERCISES.map((e) => e.variantGroup).filter((g) => typeof g === "string" && g)
  );

  for (const ex of EXERCISES) {
    const label = ex && ex.id ? ex.id : "(missing id)";

    if (typeof ex.id !== "string" || !/^[a-z][a-z0-9_]*$/.test(ex.id)) {
      errors.push(`${label}: id must be snake_case`);
    } else if (ids.has(ex.id)) {
      errors.push(`${label}: duplicate id`);
    } else {
      ids.add(ex.id);
    }

    if (typeof ex.name !== "string" || !ex.name.trim()) errors.push(`${label}: name required`);

    if (!Array.isArray(ex.tags) || !ex.tags.length) {
      errors.push(`${label}: tags required`);
    } else {
      for (const t of ex.tags) {
        if (!KNOWN_TAGS.has(t)) errors.push(`${label}: unknown tag "${t}"`);
      }
    }

    if (!patterns.has(ex.pattern)) {
      errors.push(`${label}: pattern "${ex.pattern}" not in PATTERN_ORDER`);
    }

    if (typeof ex.reps !== "string" || !ex.reps.trim()) {
      errors.push(`${label}: reps must be a non-empty string`);
    }

    if (typeof ex.dur !== "number" || !(ex.dur > 0)) {
      errors.push(`${label}: dur must be a positive number`);
    }

    if (!Array.isArray(ex.pools) || !ex.pools.length) {
      errors.push(`${label}: pools must be a non-empty array`);
    } else {
      for (const p of ex.pools) {
        if (!KNOWN_POOLS.has(p)) errors.push(`${label}: unknown pool "${p}"`);
      }
      if (new Set(ex.pools).size !== ex.pools.length) {
        errors.push(`${label}: pools has duplicates`);
      }
    }

    if ("pending" in ex && typeof ex.pending !== "boolean") {
      errors.push(`${label}: pending must be boolean when present`);
    }

    if ("variantGroup" in ex && ex.variantGroup != null) {
      if (typeof ex.variantGroup !== "string" || !/^[a-z][a-z0-9_]*$/.test(ex.variantGroup)) {
        errors.push(`${label}: variantGroup must be a snake_case string`);
      }
    }

    for (const key of LEGACY_FIELDS) {
      if (ex && key in ex) errors.push(`${label}: legacy field "${key}" is not allowed`);
    }
  }

  /* Rig on every movement (rig.js, docs/proposals/rig-app-plan.md §3.5): data shape, then
     geometry on both sides — reach, lockout, floor, bell clearance, joint speed, bend
     direction, hand-offs, framing. A pending movement warns. One in rotation fails. */
  let rigCount = 0;
  for (const ex of EXERCISES) {
    const label = ex && ex.id ? ex.id : "(missing id)";
    if (!ex || !ex.rig) {
      errors.push(`${label}: rig is required`);
      continue;
    }
    rigCount++;
    const shape = validateRig(ex);
    for (const msg of shape) errors.push(`${label}.${msg}`);
    if (shape.length) continue;
    for (const msg of checkRig(ex)) {
      const line = `${label}: rig ${msg}`;
      if (ex.pending) warnings.push(line);
      else errors.push(line);
    }
  }

  for (const w of warnings) console.warn("warn:", w);
  if (errors.length) {
    console.error(`check failed: ${errors.length} error(s)`);
    for (const e of errors) console.error(" -", e);
    process.exit(1);
  }
  const warnNote = warnings.length ? `, ${warnings.length} warning(s)` : "";
  console.log(`check ok: ${EXERCISES.length} movements (${rigCount} on the rig), ${knownGroups.size} variant groups${warnNote}, patterns=[${PATTERN_ORDER.join(", ")}]`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
