#!/usr/bin/env node
/* sim-circuit.mjs — simulate buildCircuit and pickSwap across dates, modes, and focus chips.
   Run: node scripts/sim-circuit.mjs
   Imports the real buildCircuit and pickSwap from bellwork.jsx via esbuild (no new dependencies).
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

const GOLDEN_DATE = "2026-11-25";
const GOLDEN_STANDARD_FULL = [
  "swing",
  "thruster",
  "tall_kneel_press",
  "upright_row",
  "russian_twist",
];
const GOLDEN_COMPLEX_FULL = [
  "snatch_lunge",
  "clean_lunge",
  "clean_press",
  "swing_high_pull",
  "halo_press",
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

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
  const {
    buildCircuit,
    pickSwap,
    SLOT_ORDER,
    slotFor,
    seedString,
    daysBetween,
    lastSessionIds,
    swapWeight,
    SWAP_COUNT_CAP,
    EXERCISES,
    PATTERN_ORDER,
  } = await loadApp();

  const byId = new Map(EXERCISES.map((e) => [e.id, e]));
  const dates = makeDates(4000);

  // 1. Seed contract: Complex still hashes as "advanced"
  assert.equal(seedString("2026-11-25", ["full"], "complex", ""), "2026-11-25fulladvanced");
  assert.equal(seedString("2026-11-25", ["upper", "lower"], "standard", "abc"), "2026-11-25upper+lowerstandardabc");

  // 2. 4,000 dates x 2 modes x 7 focus filters at empty counts AND with a hostile count map
  const hostileCounts = {};
  EXERCISES.forEach((ex, i) => {
    if (i % 3 === 0) hostileCounts[ex.id] = 999; // over cap
    else if (i % 3 === 1) hostileCounts[ex.id] = 5; // at cap
    else hostileCounts[ex.id] = -3; // hostile negative
  });
  hostileCounts.clean_press = NaN;
  hostileCounts.rdl_row = Infinity;

  let emptyDraws = 0;
  let hostileDraws = 0;
  for (const mode of MODES) {
    for (const focus of FOCUSES) {
      for (const today of dates) {
        const c1 = buildCircuit(focus, mode, "", [], { today, sessions: [], swapCounts: {} });
        assertInvariants(c1, { mode, focus, exercises: EXERCISES, SLOT_ORDER, slotFor, PATTERN_ORDER });
        emptyDraws++;

        const c2 = buildCircuit(focus, mode, "", [], { today, sessions: [], swapCounts: hostileCounts });
        assertInvariants(c2, { mode, focus, exercises: EXERCISES, SLOT_ORDER, slotFor, PATTERN_ORDER });
        hostileDraws++;
      }
    }
  }

  // 3. Determinism
  const detHistory = [{ date: "2026-11-24", exerciseIds: ["swing_squat", "clean_press"] }];
  const detCounts = { thruster: 3, halo_press: 5 };
  const dA = buildCircuit(["upper", "lower"], "complex", "salt1", [], { today: GOLDEN_DATE, sessions: detHistory, swapCounts: detCounts });
  const dB = buildCircuit(["upper", "lower"], "complex", "salt1", [], { today: GOLDEN_DATE, sessions: detHistory, swapCounts: detCounts });
  assert.deepEqual(dA.map((e) => e.id), dB.map((e) => e.id), "determinism failed");

  // 4. Golden fixture (fixed date, empty history, zero counts, both modes, full body)
  const goldenStd = buildCircuit(["full"], "standard", "", [], { today: GOLDEN_DATE, sessions: [], swapCounts: {} });
  const goldenCpx = buildCircuit(["full"], "complex", "", [], { today: GOLDEN_DATE, sessions: [], swapCounts: {} });
  assert.deepEqual(goldenStd.map((e) => e.id), GOLDEN_STANDARD_FULL, "golden Standard full-body fixture drifted");
  assert.deepEqual(goldenCpx.map((e) => e.id), GOLDEN_COMPLEX_FULL, "golden Complex full-body fixture drifted");

  // 5. Recency invariants (D6)
  assert.equal(daysBetween("2026-11-24", "2026-11-25"), 1);
  assert.equal(daysBetween("2026-11-18", "2026-11-25"), 7);
  assert.equal(daysBetween("2026-11-17", "2026-11-25"), 8);
  assert.equal(daysBetween("2026-11-25", "2026-11-25"), 0);
  assert.equal(daysBetween("2026-03-07", "2026-03-08"), 1, "DST boundary failed");

  const baseComplex = buildCircuit(["full"], "complex", "", [], { today: GOLDEN_DATE });
  const basePush = baseComplex.find((e) => slotFor(e.pattern) === "push");
  const otherPush = basePush.id === "clean_press" ? "bottoms_up_press" : "clean_press";

  // 7 calendar days before today -> triggers exclusion
  const with7Days = buildCircuit(["full"], "complex", "", [], {
    today: GOLDEN_DATE,
    sessions: [{ date: "2026-11-18", exerciseIds: [basePush.id], exercises: [basePush.name], partial: false }],
  });
  assert.equal(
    with7Days.find((e) => slotFor(e.pattern) === "push").id,
    otherPush,
    "7-day-old session should trigger recency exclusion"
  );

  // 8 calendar days before today -> does NOT trigger exclusion
  const with8Days = buildCircuit(["full"], "complex", "", [], {
    today: GOLDEN_DATE,
    sessions: [{ date: "2026-11-17", exerciseIds: [basePush.id], exercises: [basePush.name], partial: false }],
  });
  assert.deepEqual(
    with8Days.map((e) => e.id),
    baseComplex.map((e) => e.id),
    "8-day-old session must NOT trigger recency exclusion"
  );

  // Session saved today is ignored
  const withToday = buildCircuit(["full"], "complex", "", [], {
    today: GOLDEN_DATE,
    sessions: [{ date: GOLDEN_DATE, exerciseIds: baseComplex.map((e) => e.id), exercises: baseComplex.map((e) => e.name) }],
  });
  assert.deepEqual(
    withToday.map((e) => e.id),
    baseComplex.map((e) => e.id),
    "session dated today must NOT trigger recency exclusion"
  );

  // Partials count, and legacy name-only logs resolve
  const withPartialLegacy = buildCircuit(["full"], "complex", "", [], {
    today: GOLDEN_DATE,
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
    GOLDEN_DATE
  );
  assert.deepEqual([...idsFromTwo], ["clean_press"], "only the later same-day session should count");

  // Empty exercises entry is skipped
  const idsSkipEmpty = lastSessionIds(
    [
      { date: "2026-11-22", exerciseIds: ["clean_press"] },
      { date: "2026-11-24", exercises: [] },
    ],
    GOLDEN_DATE
  );
  assert.deepEqual([...idsSkipEmpty], ["clean_press"], "empty-exercise entry should be ignored");

  // Cross-mode by id
  const crossMode = buildCircuit(["full"], "complex", "", [], {
    today: GOLDEN_DATE,
    sessions: [{ date: "2026-11-24", mode: "standard", exerciseIds: ["clean_press", "swing"] }],
  });
  assert.equal(
    crossMode.find((e) => slotFor(e.pattern) === "push").id,
    "bottoms_up_press",
    "cross-mode recency by id failed"
  );

  // 1-deep slot relaxation (Complex Upper hinge = rdl_row)
  const complexUpper = buildCircuit(["upper"], "complex", "", [], {
    today: GOLDEN_DATE,
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

  // Adversarial Complex Core recency (5 of 8 non-carry_march yesterday -> still no duplicate carry_march)
  const advCore = buildCircuit(["core"], "complex", "", [], {
    today: GOLDEN_DATE,
    sessions: [{
      date: "2026-11-24",
      exerciseIds: ["halo_press", "figure8_hold", "atw_squat", "curl_halo", "situp_press"],
    }],
  });
  assertInvariants(advCore, { mode: "complex", focus: ["core"], exercises: EXERCISES, SLOT_ORDER, slotFor, PATTERN_ORDER });

  // 6. Weights (D8): 2-deep slot, capped at 5 vs 0, 2,000 seeds -> < 30% and > 0%
  assert.equal(swapWeight("clean_press", {}), 1);
  assert.equal(swapWeight("clean_press", { clean_press: SWAP_COUNT_CAP }), 1 / 6);
  assert.equal(swapWeight("clean_press", { clean_press: 99 }), 1 / 6);

  let cappedHits = 0;
  const weightSeeds = 2000;
  for (let i = 0; i < weightSeeds; i++) {
    const c = buildCircuit(["full"], "complex", `w-${i}`, [], {
      today: GOLDEN_DATE,
      sessions: [],
      swapCounts: { clean_press: SWAP_COUNT_CAP, bottoms_up_press: 0 },
    });
    if (c.find((e) => slotFor(e.pattern) === "push").id === "clean_press") cappedHits++;
  }
  const cappedPct = (cappedHits / weightSeeds) * 100;
  assert.ok(cappedHits > 0, "capped movement vanished from 2-deep slot");
  assert.ok(cappedPct < 30, `capped movement appeared ${cappedPct.toFixed(1)}% (expected < 30%, theory ~14.3%)`);

  // 7. Swap invariants (D7)
  const swapRand = mulberry32(42);

  // 7a. Two legal same-slot alternatives (Complex full-body pull has 3 pulls: renegade, swing_high_pull, gorilla_sumo)
  const pullCircuit = ["snatch_lunge", "clean_lunge", "clean_press", "swing_high_pull", "halo_press"].map((id) => byId.get(id));
  const pullSeen = new Set();
  for (let i = 0; i < 200; i++) {
    const pick = pickSwap(pullCircuit, 3, ["full"], "complex", [], swapRand);
    assert.ok(pick, "swap returned null despite two same-slot alternatives");
    assert.equal(slotFor(pick.pattern), "pull", `same-slot swap left pull slot: ${pick.id}`);
    assert.notEqual(pick.id, "swing_high_pull", "swap returned departing id");
    pullSeen.add(pick.id);
  }
  assert.deepEqual([...pullSeen].sort(), ["gorilla_sumo", "renegade"], "expected both pull alternatives over 200 taps");

  // 7b. Zero same-slot alternatives -> widens inside the focus filter (Complex Upper hinge is only rdl_row)
  const cpxUpperCircuit = ["rdl_row", "clean_squat_press", "clean_press", "renegade", "halo_press"].map((id) => byId.get(id));
  const cpxUpperIds = new Set(
    EXERCISES.filter((e) => e.pools.includes("complex") && e.tags.includes("upper")).map((e) => e.id)
  );
  for (let i = 0; i < 200; i++) {
    const pick = pickSwap(cpxUpperCircuit, 0, ["upper"], "complex", [], swapRand);
    assert.ok(pick, "widened swap returned null despite in-filter alternatives");
    assert.ok(cpxUpperIds.has(pick.id), `widened swap left Complex Upper filter: ${pick.id}`);
    assert.ok(!cpxUpperCircuit.some((e) => e.id === pick.id), `widened swap duplicated circuit card: ${pick.id}`);
  }

  // 7c. March on circuit + widened swap (both Complex Core knee movements on circuit; swapping lunge_twist must widen, never pick carry)
  const marchCircuit = ["lunge_twist", "squat_pressout", "renegade", "halo_press", "halo_march"].map((id) => byId.get(id));
  for (let i = 0; i < 200; i++) {
    const pick = pickSwap(marchCircuit, 0, ["core"], "complex", [], swapRand);
    assert.ok(pick, "widened swap with march on circuit returned null");
    assert.ok(!CARRY_MARCH_IDS.has(pick.id), `widened swap picked carry/march (${pick.id}) while halo_march was on circuit`);
    assert.ok(!marchCircuit.some((e) => e.id === pick.id), "widened swap duplicated circuit card");
  }

  // 7d. Departing card releases its group (row can swap to another row; non-row cannot introduce a second row)
  const rowCircuit = ["clean", "ohp", "row", "halo", "standing_pullover"].map((id) => byId.get(id));
  let replacedRowWithRow = false;
  for (let i = 0; i < 200; i++) {
    const pick = pickSwap(rowCircuit, 2, ["upper"], "standard", [], swapRand);
    assert.ok(pick);
    assert.equal(slotFor(pick.pattern), "pull");
    if (pick.variantGroup === "row") replacedRowWithRow = true;
  }
  assert.ok(replacedRowWithRow, "departing row should release its group so another row is eligible");

  // Swapping clean (only Standard Upper hinge) widens across Standard Upper, but must never pick a second row
  for (let i = 0; i < 200; i++) {
    const pick = pickSwap(rowCircuit, 0, ["upper"], "standard", [], swapRand);
    assert.ok(pick);
    assert.notEqual(pick.variantGroup, "row", "widened swap introduced duplicate row group");
  }

  // 7e. No-op when no legal replacement exists (all Complex Lower movements already on circuit)
  const allCpxLower = EXERCISES.filter((e) => e.pools.includes("complex") && e.tags.includes("lower"));
  const noOpPick = pickSwap(allCpxLower, 0, ["lower"], "complex", [], swapRand);
  assert.equal(noOpPick, null, "expected null (no-op) when no legal replacement exists");

  console.log(
    `sim-circuit ok: ${emptyDraws} empty-count + ${hostileDraws} hostile-count draws, ` +
    `${recencyChecks} consecutive-day recency checks, 7d/8d cutoff ok, ` +
    `golden fixture ok, weight bias ${cappedPct.toFixed(1)}% (<30%, >0%), swap invariants ok`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
