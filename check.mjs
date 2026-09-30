#!/usr/bin/env node
/* check.mjs — validate movement data. No new dependencies (uses esbuild already in the repo).
   Run: npm run check
*/

import * as esbuild from "esbuild";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const KNOWN_TAGS = new Set(["upper", "lower", "core", "full"]);
const KNOWN_POOLS = new Set(["standard", "complex"]);
const SIDE_KEYS = ["hip", "sh", "el", "ha", "kn", "an"];
const FRONT_KEYS = ["hip", "sh", "elR", "haR", "elL", "haL", "knR", "anR", "knL", "anL"];

async function loadMovements() {
  const result = await esbuild.build({
    entryPoints: [join(__dirname, "movements.js")],
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

function isPair(v) {
  return Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === "number" && Number.isFinite(n));
}

function checkPoseSide(pose, where, errors) {
  for (const k of SIDE_KEYS) {
    if (!isPair(pose[k])) errors.push(`${where}: side pose missing ${k}`);
  }
  if (!isPair(pose.bell)) errors.push(`${where}: side pose missing bell [x,y]`);
}

function checkPoseFront(pose, where, errors) {
  for (const k of FRONT_KEYS) {
    if (!isPair(pose[k])) errors.push(`${where}: front pose missing ${k}`);
  }
  if (!isPair(pose.bell)) errors.push(`${where}: front pose missing bell [x,y]`);
}

async function main() {
  const { EXERCISES, PATTERN_ORDER } = await loadMovements();
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

    const hasSide = Array.isArray(ex.poses) && ex.poses.length > 0;
    const hasFront = Array.isArray(ex.posesF) && ex.posesF.length > 0;
    if (hasSide || hasFront) {
      if (typeof ex.dur !== "number" || !(ex.dur > 0)) {
        errors.push(`${label}: dur must be a positive number when poses exist`);
      }
      if (ex.frontOnly) {
        if (!hasFront) errors.push(`${label}: frontOnly requires posesF`);
        if (hasSide) warnings.push(`${label}: frontOnly but poses is also set`);
        ex.posesF.forEach((p, i) => checkPoseFront(p, `${label}.posesF[${i}]`, errors));
      } else {
        if (!hasSide || !hasFront) {
          errors.push(`${label}: both poses and posesF required (or set frontOnly)`);
        } else {
          if (ex.poses.length !== ex.posesF.length) {
            errors.push(`${label}: poses (${ex.poses.length}) and posesF (${ex.posesF.length}) length mismatch`);
          }
          ex.poses.forEach((p, i) => checkPoseSide(p, `${label}.poses[${i}]`, errors));
          ex.posesF.forEach((p, i) => checkPoseFront(p, `${label}.posesF[${i}]`, errors));
        }
      }
    }
  }

  for (const w of warnings) console.warn("warn:", w);
  if (errors.length) {
    console.error(`check failed: ${errors.length} error(s)`);
    for (const e of errors) console.error(" -", e);
    process.exit(1);
  }
  console.log(`check ok: ${EXERCISES.length} movements, ${knownGroups.size} variant groups, patterns=[${PATTERN_ORDER.join(", ")}]`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
