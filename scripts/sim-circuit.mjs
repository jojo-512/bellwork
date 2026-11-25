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
  const { buildCircuit, SLOT_ORDER, slotFor, seedString, daysBetween, lastSessionIds, EXERCISES, PATTERN_ORDER } = await loadApp();
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

  // 4. Recency invariants (D6)
  assert.equal(daysBetween("2026-11-24", "2026-11-25"), 1);
  assert.equal(daysBetween("2026-11-18", "2026-11-25"), 7);
  assert.equal(daysBetween("2026-11-17", "2026-11-25"), 8);
  assert.equal(daysBetween("2026-11-25", "2026-11-25"), 0);
  assert.equal(daysBetween("2026-03-07", "2026-03-08"), 1, "DST boundary failed");

  // 7-day cutoff vs 8-day cutoff (using Complex full body push slot: 2-deep)
  const day = "2026-11-25";
  const baseComplex = buildCircuit(["full"], "complex", "", [], { today: day });
  const basePush = baseComplex.find((e) => slotFor(e.pattern) === "push");
  const otherPush = basePush.id === "clean_press" ? "bottoms_up_press" : "clean_press";

  // 7 days before today -> excluded (must pick the other push)
  const with7Days = buildCircuit(["full"], "complex", "", [], {
    today: day,
    sessions: [{ date: "2026-11-18", exerciseIds: [basePush.id], exercises: [basePush.name], partial: false }],
  });
  assert.equal(
    with7Days.find((e) => slotFor(e.pattern) === "push").id,
    otherPush,
    "7-day-old session should trigger recency exclusion"
  );

  // 8 days before today -> NOT excluded (must match no-history draw)
  const with8Days = buildCircuit(["full"], "complex", "", [], {
    today: day,
    sessions: [{ date: "2026-11-17", exerciseIds: [basePush.id], exercises: [basePush.name], partial: false }],
  });
  assert.deepEqual(
    with8Days.map((e) => e.id),
    baseComplex.map((e) => e.id),
    "8-day-old session must NOT trigger recency exclusion"
  );

  // Session saved today is ignored
  const withToday = buildCircuit(["full"], "complex", "", [], {
    today: day,
    sessions: [{ date: day, exerciseIds: baseComplex.map((e) => e.id), exercises: baseComplex.map((e) => e.name) }],
  });
  assert.deepEqual(
    withToday.map((e) => e.id),
    baseComplex.map((e) => e.id),
    "session dated today must NOT trigger recency exclusion"
  );

  // Partials count, and legacy name-only logs resolve
  const withPartialLegacy = buildCircuit(["full"], "complex", "", [], {
    today: day,
    sessions: [{ date: "2026-11-24", exercises: [basePush.name], partial: true }],
  });
  assert.equal(
    withPartialLegacy.find((e) => slotFor(e.pattern) === "push").id,
    otherPush,
    "partial legacy name-only session should trigger recency exclusion"
  );

  // Two sessions yesterday: only the later one counts, not the union
  const idsFromTwo = lastSessionIds(
    [
      { date: "2026-11-24", exerciseIds: ["swing", "ohp"] },
      { date: "2026-11-24", exerciseIds: ["clean_press"] },
    ],
    day
  );
  assert.deepEqual([...idsFromTwo], ["clean_press"], "only the later same-day session should count");

  // Latest session empty exercises is skipped; non-empty earlier within 7d counts
  const idsSkipEmpty = lastSessionIds(
    [
      { date: "2026-11-22", exerciseIds: ["clean_press"] },
      { date: "2026-11-24", exercises: [] },
    ],
    day
  );
  assert.deepEqual([...idsSkipEmpty], ["clean_press"], "empty-exercise entry should be ignored");

  // Cross-mode by id: Standard clean_press yesterday excludes Complex clean_press today
  const crossMode = buildCircuit(["full"], "complex", "", [], {
    today: day,
    sessions: [{ date: "2026-11-24", mode: "standard", exerciseIds: ["clean_press", "swing"] }],
  });
  assert.equal(
    crossMode.find((e) => slotFor(e.pattern) === "push").id,
    "bottoms_up_press",
    "cross-mode recency by id failed"
  );

  // 1-deep slot relaxation: Complex Upper hinge is only rdl_row; must still appear even if done yesterday
  const complexUpper = buildCircuit(["upper"], "complex", "", [], {
    today: day,
    sessions: [{ date: "2026-11-24", exerciseIds: ["rdl_row"] }],
  });
  assertInvariants(complexUpper, { mode: "complex", focus: ["upper"], exercises: EXERCISES, SLOT_ORDER, slotFor, PATTERN_ORDER });
  assert.equal(complexUpper.find((e) => slotFor(e.pattern) === "hinge").id, "rdl_row");

  // Per-slot recency across consecutive days on all modes and focus chips
  let recencyChecks = 0;
  for (const mode of MODES) {
    for (const focus of FOCUSES) {
      const wantFull = focus.includes("full");
      const filteredPool = EXERCISES.filter(
        (e) => e.pools.includes(mode) && !e.pending && (wantFull || e.tags.some((t) => focus.includes(t)))
      );
      const bySlot = Object.fromEntries(SLOT_ORDER.map((s) => [s, []]));
      for (const ex of filteredPool) bySlot[slotFor(ex.pattern)].push(ex);
      const allSlotsFillable = SLOT_ORDER.every((s) => bySlot[s].length > 0);

      for (let i = 1; i <= 100; i++) {
        const yday = dates[i - 1];
        const tday = dates[i];
        const prev = buildCircuit(focus, mode, "", [], { today: yday });
        const prevIds = new Set(prev.map((e) => e.id));
        const curr = buildCircuit(focus, mode, "", [], {
          today: tday,
          sessions: [{ date: yday, exerciseIds: prev.map((e) => e.id), exercises: prev.map((e) => e.name) }],
        });
        assertInvariants(curr, { mode, focus, exercises: EXERCISES, SLOT_ORDER, slotFor, PATTERN_ORDER });
        if (allSlotsFillable) {
          for (const ex of curr) {
            const slot = slotFor(ex.pattern);
            const hasFreshAlt = bySlot[slot].some((c) => !prevIds.has(c.id));
            if (hasFreshAlt) {
              assert.ok(
                !prevIds.has(ex.id),
                `${mode} ${focus.join("+")} ${tday}: slot ${slot} repeated ${ex.id} despite fresh alternative`
              );
            }
          }
        }
        recencyChecks++;
      }
    }
  }

  // Adversarial Complex Core recency (5 of 8 non-carry_march yesterday -> still no duplicate carry_march!)
  const advCore = buildCircuit(["core"], "complex", "", [], {
    today: day,
    sessions: [{
      date: "2026-11-24",
      exerciseIds: ["halo_press", "figure8_hold", "atw_squat", "curl_halo", "situp_press"],
    }],
  });
  assertInvariants(advCore, { mode: "complex", focus: ["core"], exercises: EXERCISES, SLOT_ORDER, slotFor, PATTERN_ORDER });

  console.log(`sim-circuit ok (stage 2): ${totalDraws} base draws + ${recencyChecks} consecutive-day recency draws checked`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
