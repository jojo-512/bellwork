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

function checkPoseMeta(pose, where, errors, view) {
  if ("hold" in pose && pose.hold != null && !HOLDS.has(pose.hold)) {
    errors.push(`${where}: hold must be R, L, both, air, floor, or none`);
  }
  if ("t" in pose && pose.t != null) {
    if (typeof pose.t !== "number" || !Number.isFinite(pose.t) || pose.t <= 0) {
      errors.push(`${where}: t must be a positive number`);
    }
  }
  if ("neck" in pose && pose.neck != null && !isPair(pose.neck)) {
    errors.push(`${where}: neck must be [x, y]`);
  }
  const hasR = "shR" in pose && pose.shR != null;
  const hasL = "shL" in pose && pose.shL != null;
  if (hasR && !isPair(pose.shR)) errors.push(`${where}: shR must be [x, y]`);
  if (hasL && !isPair(pose.shL)) errors.push(`${where}: shL must be [x, y]`);
  if (view === "front" && hasR !== hasL) {
    errors.push(`${where}: set shR and shL together`);
  }
}

function checkPoseSide(pose, where, errors) {
  for (const k of SIDE_KEYS) {
    if (!isPair(pose[k])) errors.push(`${where}: side pose missing ${k}`);
  }
  if (!isPair(pose.bell)) errors.push(`${where}: side pose missing bell [x,y]`);
  checkPoseMeta(pose, where, errors, "side");
}

function checkPoseFront(pose, where, errors) {
  for (const k of FRONT_KEYS) {
    if (!isPair(pose[k])) errors.push(`${where}: front pose missing ${k}`);
  }
  if (!isPair(pose.bell)) errors.push(`${where}: front pose missing bell [x,y]`);
  checkPoseMeta(pose, where, errors, "front");
}

/* Pose geometry. Tuned against the 57-lift catalog on 2026-10-01.
   Pending lifts warn; a lift already in rotation fails the check.

   Bell: center within BELL_MAX of the nearer gripping hand, unless the
   pose sets `hold`.
   Side uses `ha`. Front uses the nearer of `haR` / `haL` — a left-side
   halo parks the bell on haL, and requiring haR flags approved halos.
   18 is past approved upright row (13.4) and plank pull-through (14.6).
   Bent-over reverse fly's open frame is ~48.
   `hold: "R"` / `"L"` checks that hand (the side view's one arm is the
   working hand). `"both"` checks each front hand. `"floor"` skips the
   hand and requires the bell near the ground. `"none"` draws no bell.
   `"air"` may leave the hand: one frame only, a hand hold on both
   sides (the loop counts), bell above the hands, and `t` ≤ 0.6.
   Side and front must name the same `hold` on each frame. Omitted
   `hold` is still "nearest hand", and two omissions agree.

   Legs: thigh/shin (and the trail leg) on a standing pose, capped at
   LEG_MAX. Also flag the same planted segment across frames when it
   stretches by LEG_RATIO and LEG_DELTA. Approved squats already shorten
   a thigh from ~35 to ~23, so a raw ratio on every frame false-flags
   the catalog. Arms are not compared across frames: approved halos and
   rows already run a forearm from ~3 to ~36. An arm longer than ARM_MAX
   (past gorilla row at 42) still warns.

   Skipped for limb length, on purpose:
   - floor / seated / plank (hip y >= FLOOR_HIP_Y)
   - a knee on the ground (knee y >= KNEE_DOWN_Y) — tall kneel
   - a wide split (two ankles on the line, |dx| >= SPLIT_DX) — lunge,
     split squat, windmill feet

   Feet: ground line is y=178; canon ankles sit at 174–176, so y>=170
   counts as planted. A clearly lifted foot (y < LIFT_CLEAR) is allowed
   when another ankle is planted — march, carry, lunge step, single-leg
   RDL. An ankle between those bands is a sloppy plant and always flags.
   Floor poses are skipped (the figure is not standing).

   Catalog result with these caps: reverse_fly (bell), clean_carry and
   snatch_oh_carry (trail thigh) warn. swing_high_pull, gorilla_sumo, and
   halo_march pass — their problems are "reads as the wrong lift" or frame
   order, which a length check cannot see.

   Shoulders (optional): when a front pose sets `shR` and `shL`, the span
   between them cannot exceed SHOULDER_MAX, and `neck` (default `sh`) has
   to sit between the two ends. The figure draws each as its own line from
   the neck. Absent keys skip the check. Upper-arm length is measured from
   `shR` / `shL` when those points exist, and from `sh` otherwise. */

const BELL_MAX = 18;
const SHOULDER_MAX = 40;
const NECK_ON_BAR = 12;
const HOLDS = new Set(["R", "L", "both", "air", "floor", "none"]);
const AIR_T_MAX = 0.6;
const FLOOR_BELL_Y = 160;
const LEG_MAX = 42;
const ARM_MAX = 46;
const LEG_RATIO = 1.75;
const LEG_DELTA = 12;
const FLOOR_HIP_Y = 146;
const KNEE_DOWN_Y = 168;
const PLANTED_MIN_Y = 170;
const PLANTED_MAX_Y = 186;
const LIFT_CLEAR = 164;
const SPLIT_DX = 24;

const SIDE_LEGS = [
  ["thigh", "hip", "kn", "an"],
  ["shin", "kn", "an", "an"],
  ["thigh2", "hip", "kn2", "an2"],
  ["shin2", "kn2", "an2", "an2"],
];
const FRONT_LEGS = [
  ["thighR", "hip", "knR", "anR"],
  ["shinR", "knR", "anR", "anR"],
  ["thighL", "hip", "knL", "anL"],
  ["shinL", "knL", "anL", "anL"],
];
const SIDE_ARMS = [
  ["uarm", "sh", "el"],
  ["farm", "el", "ha"],
];
const FRONT_ARMS = [
  ["uarmR", "sh", "elR"],
  ["farmR", "elR", "haR"],
  ["uarmL", "sh", "elL"],
  ["farmL", "elL", "haL"],
];

function len(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function segmentT(p, a, b) {
  const abx = b[0] - a[0], aby = b[1] - a[1];
  const ab2 = abx * abx + aby * aby;
  if (ab2 < 1e-6) return 0;
  return ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / ab2;
}

function distToSegment(p, a, b) {
  const abx = b[0] - a[0], aby = b[1] - a[1];
  const ab2 = abx * abx + aby * aby;
  if (ab2 < 1e-6) return len(p, a);
  const t = Math.max(0, Math.min(1, segmentT(p, a, b)));
  return len(p, [a[0] + abx * t, a[1] + aby * t]);
}

/* Drawn upper arm leaves the shoulder point, not the middle of the bar. */
function armEnds(pose, a, b) {
  if (a === "sh" && b === "elR" && isPair(pose.shR) && isPair(pose.elR)) return [pose.shR, pose.elR];
  if (a === "sh" && b === "elL" && isPair(pose.shL) && isPair(pose.elL)) return [pose.shL, pose.elL];
  if (!isPair(pose[a]) || !isPair(pose[b])) return null;
  return [pose[a], pose[b]];
}

function anklePoints(pose) {
  const out = [];
  for (const k of ["an", "an2", "anR", "anL"]) {
    if (isPair(pose[k])) out.push({ k, x: pose[k][0], y: pose[k][1] });
  }
  return out;
}

function isFloorPose(pose) {
  return isPair(pose.hip) && pose.hip[1] >= FLOOR_HIP_Y;
}

function isKneelingPose(pose) {
  return ["kn", "kn2", "knR", "knL"].some((k) => isPair(pose[k]) && pose[k][1] >= KNEE_DOWN_Y);
}

function isWideSplit(pose) {
  const planted = anklePoints(pose).filter((a) => a.y >= PLANTED_MIN_Y && a.y <= PLANTED_MAX_Y);
  let dx = 0;
  for (let i = 0; i < planted.length; i++) {
    for (let j = i + 1; j < planted.length; j++) {
      dx = Math.max(dx, Math.abs(planted[i].x - planted[j].x));
    }
  }
  return planted.length >= 2 && dx >= SPLIT_DX;
}

function skipLimbPose(pose) {
  return isFloorPose(pose) || isKneelingPose(pose) || isWideSplit(pose);
}

function checkBell(pose, view, frame, issues) {
  if (!isPair(pose.bell)) return;
  if (pose.hold === "none" || pose.hold === "air") return;
  if (pose.hold === "floor") {
    if (pose.bell[1] < FLOOR_BELL_Y) {
      issues.push(`${view} frame ${frame}: hold floor but the bell is not on the ground (y=${Math.round(pose.bell[1])})`);
    }
    return;
  }
  if (pose.hold === "R" || pose.hold === "L" || pose.hold === "both") {
    const named = namedHands(pose, view, pose.hold);
    if (!named.length) return;
    for (const [label, hand] of named) {
      const d = len(pose.bell, hand);
      if (d > BELL_MAX) {
        issues.push(`${view} frame ${frame}: bell is ${Math.round(d)}u from the ${label} hand (max ${BELL_MAX})`);
      }
    }
    return;
  }
  const hands = view === "side"
    ? (isPair(pose.ha) ? [pose.ha] : [])
    : [pose.haR, pose.haL].filter(isPair);
  if (!hands.length) return;
  const nearest = Math.min(...hands.map((h) => len(pose.bell, h)));
  if (nearest > BELL_MAX) {
    issues.push(`${view} frame ${frame}: bell is ${Math.round(nearest)}u from the nearest hand (max ${BELL_MAX})`);
  }
}

/* Side view has one arm, so R and L both mean that arm. Front view names haR / haL. */
function namedHands(pose, view, hold) {
  if (view === "side") {
    return isPair(pose.ha) ? [[hold === "both" ? "working" : hold, pose.ha]] : [];
  }
  const out = [];
  if ((hold === "R" || hold === "both") && isPair(pose.haR)) out.push(["R", pose.haR]);
  if ((hold === "L" || hold === "both") && isPair(pose.haL)) out.push(["L", pose.haL]);
  return out;
}

function isGripHold(hold) {
  return hold == null || hold === "R" || hold === "L" || hold === "both";
}

function checkAir(poses, view, issues) {
  const n = poses.length;
  for (let i = 0; i < n; i++) {
    if (poses[i].hold !== "air") continue;
    const frame = i + 1;
    const prev = poses[(i - 1 + n) % n];
    const next = poses[(i + 1) % n];
    if (prev.hold === "air" || next.hold === "air") {
      issues.push(`${view} frame ${frame}: hold air can only last one frame`);
    }
    if (!isGripHold(prev.hold) || !isGripHold(next.hold)) {
      issues.push(`${view} frame ${frame}: hold air needs a hand hold on the frames before and after`);
    }
    const t = poses[i].t == null ? 1 : poses[i].t;
    if (!(typeof t === "number" && t <= AIR_T_MAX)) {
      issues.push(`${view} frame ${frame}: hold air needs a short t (≤ ${AIR_T_MAX})`);
    }
    const hands = view === "side"
      ? [poses[i].ha].filter(isPair)
      : [poses[i].haR, poses[i].haL].filter(isPair);
    if (isPair(poses[i].bell) && hands.some((h) => !(poses[i].bell[1] < h[1]))) {
      issues.push(`${view} frame ${frame}: hold air but the bell is not above the hands`);
    }
  }
}

function checkHoldAgreement(ex, issues) {
  if (ex.frontOnly || !Array.isArray(ex.poses) || !Array.isArray(ex.posesF)) return;
  const n = Math.min(ex.poses.length, ex.posesF.length);
  for (let i = 0; i < n; i++) {
    const side = ex.poses[i].hold ?? null;
    const front = ex.posesF[i].hold ?? null;
    if (side !== front) {
      issues.push(`frame ${i + 1}: side hold ${side ?? "nearest"} ≠ front hold ${front ?? "nearest"}`);
    }
  }
}

function checkLimbs(poses, view, legs, arms, issues) {
  const plantedSamples = new Map();
  poses.forEach((pose, index) => {
    const frame = index + 1;
    if (skipLimbPose(pose)) return;
    for (const [name, a, b, ank] of legs) {
      if (!isPair(pose[a]) || !isPair(pose[b])) continue;
      const d = len(pose[a], pose[b]);
      if (d > LEG_MAX) {
        issues.push(`${view} frame ${frame}: ${name} is ${Math.round(d)}u (max ${LEG_MAX} on a standing leg)`);
      }
      if (isPair(pose[ank]) && pose[ank][1] >= PLANTED_MIN_Y && pose[ank][1] <= PLANTED_MAX_Y) {
        if (!plantedSamples.has(name)) plantedSamples.set(name, []);
        plantedSamples.get(name).push(d);
      }
    }
    for (const [name, a, b] of arms) {
      const ends = armEnds(pose, a, b);
      if (!ends) continue;
      const d = len(ends[0], ends[1]);
      if (d > ARM_MAX) {
        issues.push(`${view} frame ${frame}: ${name} is ${Math.round(d)}u (max ${ARM_MAX})`);
      }
    }
  });
  for (const [name, samples] of plantedSamples) {
    if (samples.length < 2) continue;
    const mn = Math.min(...samples);
    const mx = Math.max(...samples);
    if (mx / Math.max(mn, 0.5) >= LEG_RATIO && mx - mn >= LEG_DELTA) {
      issues.push(`${view}: planted ${name} runs ${Math.round(mn)}–${Math.round(mx)}u across frames`);
    }
  }
}

function checkShoulders(pose, view, frame, issues) {
  if (!isPair(pose.shR) || !isPair(pose.shL)) return;
  const width = len(pose.shR, pose.shL);
  if (width > SHOULDER_MAX) {
    issues.push(`${view} frame ${frame}: shoulder width is ${Math.round(width)}u (max ${SHOULDER_MAX})`);
  }
  const neck = isPair(pose.neck) ? pose.neck : pose.sh;
  if (!isPair(neck)) return;
  const t = segmentT(neck, pose.shR, pose.shL);
  const dist = distToSegment(neck, pose.shR, pose.shL);
  if (t < -0.05 || t > 1.05 || dist > NECK_ON_BAR) {
    issues.push(`${view} frame ${frame}: neck is not between the shoulders`);
  }
}

function checkFeet(pose, view, frame, issues) {
  if (isFloorPose(pose)) return;
  const ankles = anklePoints(pose);
  if (!ankles.length) return;
  const planted = ankles.filter((a) => a.y >= PLANTED_MIN_Y && a.y <= PLANTED_MAX_Y);
  for (const a of ankles) {
    if (a.y > PLANTED_MAX_Y) {
      issues.push(`${view} frame ${frame}: ${a.k} is below the ground line (y=${Math.round(a.y)})`);
    } else if (a.y >= LIFT_CLEAR && a.y < PLANTED_MIN_Y) {
      issues.push(`${view} frame ${frame}: ${a.k} is off the ground line (y=${Math.round(a.y)}, line 178)`);
    } else if (a.y < LIFT_CLEAR && planted.length === 0) {
      issues.push(`${view} frame ${frame}: no ankle on the ground line`);
      return;
    }
  }
}

function poseGeometry(ex) {
  const issues = [];
  const views = [];
  if (!ex.frontOnly && Array.isArray(ex.poses) && ex.poses.length) {
    views.push(["side", ex.poses, SIDE_LEGS, SIDE_ARMS]);
  }
  if (Array.isArray(ex.posesF) && ex.posesF.length) {
    views.push(["front", ex.posesF, FRONT_LEGS, FRONT_ARMS]);
  }
  checkHoldAgreement(ex, issues);
  for (const [view, poses, legs, arms] of views) {
    poses.forEach((pose, i) => {
      checkBell(pose, view, i + 1, issues);
      checkFeet(pose, view, i + 1, issues);
      if (view === "front") checkShoulders(pose, view, i + 1, issues);
    });
    checkAir(poses, view, issues);
    checkLimbs(poses, view, legs, arms, issues);
  }
  return issues;
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
      if (!errors.some((e) => e.startsWith(`${label}:`) || e.startsWith(`${label}.`))) {
        for (const msg of poseGeometry(ex)) {
          const line = `${label}: ${msg}`;
          if (ex.pending) warnings.push(line);
          else errors.push(line);
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
  const warnNote = warnings.length ? `, ${warnings.length} warning(s)` : "";
  console.log(`check ok: ${EXERCISES.length} movements, ${knownGroups.size} variant groups${warnNote}, patterns=[${PATTERN_ORDER.join(", ")}]`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
