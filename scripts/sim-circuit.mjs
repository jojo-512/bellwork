#!/usr/bin/env node
/* sim-circuit.mjs — simulate buildCircuit across dates, modes, and focus chips.
   Run: node scripts/sim-circuit.mjs
   Imports the real buildCircuit from bellwork.jsx via esbuild (no new dependencies).
*/

import * as esbuild from "esbuild";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);

const CARRY_MARCH_IDS = new Set([
  "suitcase_march",
  "racked_march",
  "halo_march",
  "clean_carry",
  "snatch_oh_carry",
]);

const MODES = ["standard", "complex"];
const FOCUSES = [
  ["full"],
  ["upper"],
  ["lower"],
  ["core"],
  ["upper", "lower"],
  ["upper", "core"],
  ["lower", "core"],
];

async function loadApp() {
  const result = await esbuild.build({
    stdin: {
      contents: 'export * from "./bellwork.jsx"; export { EXERCISES, PATTERN_ORDER } from "./movements.js";',
      resolveDir: root,
    },
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    jsx: "automatic",
    packages: "external",
  });
  const mod = { exports: {} };
  const fn = new Function("module", "exports", "require", result.outputFiles[0].text);
  fn(mod, mod.exports, require);
  return mod.exports;
}

function makeDates(count, startYear = 2020) {
  const out = [];
  const t0 = Date.UTC(startYear, 0, 1);
  for (let i = 0; i < count; i++) {
    const d = new Date(t0 + i * 86400000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

function assertInvariants(circuit, { mode, focus, exercises, SLOT_ORDER, slotFor, PATTERN_ORDER }) {
  const wantFull = focus.includes("full");
  const filteredPool = exercises.filter(
    (e) => e.pools.includes(mode) && !e.pending && (wantFull || e.tags.some((t) => focus.includes(t)))
  );
  const poolIds = new Set(filteredPool.map((e) => e.id));
  const bySlot = Object.fromEntries(SLOT_ORDER.map((s) => [s, []]));
  for (const ex of filteredPool) bySlot[slotFor(ex.pattern)].push(ex);
  const allSlotsFillable = SLOT_ORDER.every((s) => bySlot[s].length > 0);

  assert.equal(circuit.length, 5, `${mode} ${focus.join("+")}: expected 5 cards, got ${circuit.length}`);

  const ids = new Set();
  const groups = new Set();
  let carryMarchCount = 0;

  for (const ex of circuit) {
    assert.ok(poolIds.has(ex.id), `${mode} ${focus.join("+")}: ${ex.id} outside focus/mode filter`);
    assert.ok(!ids.has(ex.id), `${mode} ${focus.join("+")}: duplicate id ${ex.id}`);
    ids.add(ex.id);
    if (ex.variantGroup) {
      assert.ok(!groups.has(ex.variantGroup), `${mode} ${focus.join("+")}: duplicate variantGroup ${ex.variantGroup}`);
      groups.add(ex.variantGroup);
    }
    if (CARRY_MARCH_IDS.has(ex.id)) carryMarchCount++;
  }

  assert.ok(carryMarchCount <= 1, `${mode} ${focus.join("+")}: ${carryMarchCount} carry_march movements in one circuit`);

  if (allSlotsFillable) {
    const slots = circuit.map((e) => slotFor(e.pattern));
    assert.deepEqual(slots, SLOT_ORDER, `${mode} ${focus.join("+")}: expected one per slot in order, got ${slots.join(",")}`);
  } else {
    // Non-template chips must still stay inside the filter and sorted by slot then PATTERN_ORDER.
    if (mode === "standard" && focus.length === 1 && focus[0] === "lower") {
      for (const ex of circuit) {
        assert.ok(
          slotFor(ex.pattern) === "hinge" || slotFor(ex.pattern) === "knee",
          `standard lower leaked ${ex.id} (${ex.pattern})`
        );
      }
    }
    for (let i = 1; i < circuit.length; i++) {
      const a = circuit[i - 1], b = circuit[i];
      const sa = SLOT_ORDER.indexOf(slotFor(a.pattern));
      const sb = SLOT_ORDER.indexOf(slotFor(b.pattern));
      assert.ok(
        sa < sb || (sa === sb && PATTERN_ORDER.indexOf(a.pattern) <= PATTERN_ORDER.indexOf(b.pattern)),
        `${mode} ${focus.join("+")}: out of sort order (${a.pattern} before ${b.pattern})`
      );
    }
  }
}

async function main() {
  const { buildCircuit, SLOT_ORDER, slotFor, seedString, EXERCISES, PATTERN_ORDER } = await loadApp();
  const dates = makeDates(4000);

  // 1. Seed contract: Complex still hashes as "advanced"
  assert.equal(seedString("2026-11-25", ["full"], "complex", ""), "2026-11-25fulladvanced");
  assert.equal(seedString("2026-11-25", ["upper", "lower"], "standard", "abc"), "2026-11-25upper+lowerstandardabc");

  // 2. 4,000 dates x 2 modes x 7 focus filters
  let totalDraws = 0;
  for (const mode of MODES) {
    for (const focus of FOCUSES) {
      for (const today of dates) {
        const c = buildCircuit(focus, mode, "", [], { today });
        assertInvariants(c, { mode, focus, exercises: EXERCISES, SLOT_ORDER, slotFor, PATTERN_ORDER });
        totalDraws++;
      }
    }
  }

  // 3. Determinism
  const a = buildCircuit(["upper", "lower"], "complex", "salt1", [], { today: "2026-11-25" });
  const b = buildCircuit(["upper", "lower"], "complex", "salt1", [], { today: "2026-11-25" });
  assert.deepEqual(a.map((e) => e.id), b.map((e) => e.id), "determinism failed");

  console.log(`sim-circuit ok (stage 1): ${totalDraws} draws checked across ${dates.length} dates x ${MODES.length} modes x ${FOCUSES.length} focuses`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
