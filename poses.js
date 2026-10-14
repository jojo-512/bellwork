/* poses.js — shared stick-figure pose vocabulary.
   Side (S_*) and front (F_*) primitives composed into movement entries in movements.js.
   Coordinates are [x, y] in a 200×200 viewBox; y increases downward; ground is y=178. */

const P = (hip, sh, el, ha, kn, an, extra = {}) => ({ hip, sh, el, ha, kn, an, ...extra });
const FS = (o = {}) => ({
  hip: [100, 106], sh: [100, 68],
  elR: [112, 88], haR: [114, 108], elL: [88, 88], haL: [86, 108],
  knR: [108, 141], anR: [110, 176], knL: [92, 141], anL: [90, 176],
  ...o,
});

/* ---- shared side-view pose vocabulary ---- */
const S_HINGE = P([96, 124], [128, 98], [118, 118], [104, 138], [104, 150], [100, 176], { bell: [96, 146] });
const S_RACK = P([100, 106], [100, 68], [110, 86], [110, 70], [100, 141], [100, 176], { bell: [115, 66] });
const S_OH = P([100, 104], [100, 66], [103, 48], [102, 30], [100, 140], [100, 176], { bell: [106, 24] });
const S_GOBLET = P([100, 106], [100, 68], [112, 84], [114, 72], [100, 141], [100, 176], { bell: [119, 72] });
const S_SQUAT = P([100, 142], [106, 102], [118, 116], [120, 104], [118, 156], [104, 176], { bell: [125, 104] });
const S_RACKSQ = P([100, 140], [106, 102], [114, 114], [112, 104], [118, 155], [104, 176], { bell: [117, 100] });
const S_LUNGE_R = P([98, 130], [100, 92], [110, 108], [110, 94], [112, 150], [112, 176], { bell: [115, 90], kn2: [80, 162], an2: [66, 176] });
const S_SWTOP = P([100, 104], [100, 68], [122, 72], [144, 76], [100, 141], [100, 176], { bell: [150, 78] });

/* ---- shared front-view pose vocabulary ---- */
const F_RACK = FS({ elR: [114, 84], haR: [110, 68], bell: [113, 62] });
const F_OH = FS({ elR: [110, 44], haR: [108, 26], bell: [110, 20] });
const F_GOBLET = FS({ elR: [114, 86], haR: [106, 76], elL: [86, 86], haL: [94, 76], bell: [100, 74] });
const F_SQUAT = FS({ hip: [100, 140], sh: [100, 102], elR: [116, 120], haR: [106, 110], elL: [84, 120], haL: [94, 110], knR: [124, 152], anR: [114, 176], knL: [76, 152], anL: [86, 176], bell: [100, 108] });
const F_RACKSQ = FS({ hip: [100, 140], sh: [100, 102], elR: [116, 118], haR: [108, 108], knR: [124, 152], anR: [114, 176], knL: [76, 152], anL: [86, 176], bell: [111, 102] });
const F_HINGE = FS({ hip: [100, 118], sh: [100, 82], elR: [108, 104], haR: [102, 128], knR: [112, 148], knL: [88, 148], bell: [100, 136] });
const F_LUNGE = FS({ hip: [100, 134], sh: [100, 96], elR: [114, 114], haR: [106, 104], elL: [86, 114], haL: [94, 104], knR: [108, 153], anR: [108, 176], knL: [90, 165], anL: [84, 175], bell: [100, 102] });

/* Two collarbones from the neck, not one bar through both shoulders.
   Resting shoulders sit below the neck so the joint reads as a shallow V. */
const SHOULDER_HALF = 16;
const SHOULDER_DROP = 8;
const TWIST_MAX = 70;

function isPair(v) {
  return Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === "number" && Number.isFinite(n));
}
function r1(n) {
  return Math.round(n * 10) / 10;
}
function rpt(p) {
  return [r1(p[0]), r1(p[1])];
}
function isFrontPose(pose) {
  return isPair(pose.elR) || isPair(pose.haR) || isPair(pose.shR);
}

/* Move a point by the same delta as its shoulder, so bone length stays. */
function reparent(pt, from, to) {
  if (!isPair(pt) || !isPair(from) || !isPair(to)) return pt;
  return rpt([pt[0] + to[0] - from[0], pt[1] + to[1] - from[1]]);
}

/* Bell follows the hand named by `hold`. Omitted hold follows the nearer hand.
   air / floor / none stay put — the bell is not in a hand. */
function shiftBell(pose, dR, dL) {
  const bell = pose.bell;
  if (!isPair(bell)) return bell;
  const hold = pose.hold;
  if (hold === "air" || hold === "floor" || hold === "none") return bell;
  let d = null;
  if (hold === "R") d = dR;
  else if (hold === "L") d = dL;
  else if (hold === "both") d = [(dR[0] + dL[0]) / 2, (dR[1] + dL[1]) / 2];
  else if (isPair(pose.haR) && isPair(pose.haL)) {
    const dr = Math.hypot(bell[0] - pose.haR[0], bell[1] - pose.haR[1]);
    const dl = Math.hypot(bell[0] - pose.haL[0], bell[1] - pose.haL[1]);
    d = dr <= dl ? dR : dL;
  } else if (isPair(pose.haR)) d = dR;
  else if (isPair(pose.haL)) d = dL;
  else if (isPair(pose.ha)) d = dR;
  return d ? rpt([bell[0] + d[0], bell[1] + d[1]]) : bell;
}

/* Positive degrees: the right shoulder climbs toward the ear and the chest
   narrows (turn toward the right). The other shoulder stays down, so the two
   collarbones are not one tilted line. Negative lifts the left. Neck stays
   at `sh` unless the pose already set one, so the head stays.
   `twist(pose, 0)` opens a resting V and does nothing else. Side poses are
   returned unchanged — a side view has one shoulder. */
function twist(pose, degrees = 0) {
  if (!pose || !isPair(pose.sh) || !isFrontPose(pose)) return pose;
  const deg = Number.isFinite(degrees) ? degrees : 0;
  const mag = Math.min(Math.abs(deg), TWIST_MAX);
  const rad = (mag * Math.PI) / 180;
  const sign = deg >= 0 ? 1 : -1;
  const half = SHOULDER_HALF * Math.cos(rad);
  const rise = 22 * Math.sin(rad);
  const neck = isPair(pose.neck) ? pose.neck : [pose.sh[0], pose.sh[1]];
  const yR = neck[1] + SHOULDER_DROP + (sign > 0 ? -rise : rise * 0.35);
  const yL = neck[1] + SHOULDER_DROP + (sign < 0 ? -rise : rise * 0.35);
  const shR = rpt([neck[0] + half, yR]);
  const shL = rpt([neck[0] - half, yL]);
  const fromR = isPair(pose.shR) ? pose.shR : pose.sh;
  const fromL = isPair(pose.shL) ? pose.shL : pose.sh;
  const dR = [shR[0] - fromR[0], shR[1] - fromR[1]];
  const dL = [shL[0] - fromL[0], shL[1] - fromL[1]];
  return {
    ...pose,
    neck,
    shR,
    shL,
    elR: reparent(pose.elR, fromR, shR),
    haR: reparent(pose.haR, fromR, shR),
    elL: reparent(pose.elL, fromL, shL),
    haL: reparent(pose.haL, fromL, shL),
    bell: shiftBell(pose, dR, dL),
  };
}

/* Raise one shoulder (or both) toward the ear. Neck stays, so the head stays.
   A front pose with no shoulders yet gets the resting V first, then one
   collarbone swings up off that V. On a side pose the one shoulder rises
   off `neck` and steps forward so the joint clears the head circle. */
function shrug(pose, side = "R", lift = 16) {
  if (!pose || !isPair(pose.sh)) return pose;
  const up = Math.abs(Number.isFinite(lift) ? lift : 16);
  if (isFrontPose(pose)) {
    const base = isPair(pose.shR) && isPair(pose.shL) ? pose : twist(pose, 0);
    const moveR = side === "R" || side === "both";
    const moveL = side === "L" || side === "both";
    const shR = moveR ? [base.shR[0], r1(base.shR[1] - up)] : base.shR;
    const shL = moveL ? [base.shL[0], r1(base.shL[1] - up)] : base.shL;
    const dR = [shR[0] - base.shR[0], shR[1] - base.shR[1]];
    const dL = [shL[0] - base.shL[0], shL[1] - base.shL[1]];
    return {
      ...base,
      shR,
      shL,
      elR: reparent(base.elR, base.shR, shR),
      haR: reparent(base.haR, base.shR, shR),
      elL: reparent(base.elL, base.shL, shL),
      haL: reparent(base.haL, base.shL, shL),
      bell: shiftBell(base, dR, dL),
    };
  }
  const neck = isPair(pose.neck) ? pose.neck : [pose.sh[0], pose.sh[1]];
  const sh = rpt([pose.sh[0] + 10, pose.sh[1] - up]);
  const d = [sh[0] - pose.sh[0], sh[1] - pose.sh[1]];
  const shift = (pt) => (isPair(pt) ? rpt([pt[0] + d[0], pt[1] + d[1]]) : pt);
  const hold = pose.hold;
  const moveBell = hold == null || hold === "R" || hold === "L" || hold === "both";
  return {
    ...pose,
    neck,
    sh,
    el: shift(pose.el),
    ha: shift(pose.ha),
    bell: moveBell ? shift(pose.bell) : pose.bell,
  };
}

/* Swap right and left and reflect x across the center of the 200-wide box.
   A symmetric pose stays put. `hold` flips R ↔ L. */
function mirror(pose) {
  if (!pose) return pose;
  const flip = (p) => (isPair(p) ? [r1(200 - p[0]), p[1]] : p);
  const out = { ...pose };
  for (const k of ["hip", "sh", "neck", "head", "bell", "el", "ha", "kn", "an", "kn2", "an2"]) {
    if (isPair(pose[k])) out[k] = flip(pose[k]);
  }
  for (const [a, b] of [["elR", "elL"], ["haR", "haL"], ["knR", "knL"], ["anR", "anL"], ["shR", "shL"]]) {
    const A = isPair(pose[a]) ? flip(pose[a]) : null;
    const B = isPair(pose[b]) ? flip(pose[b]) : null;
    if (B) out[a] = B;
    else delete out[a];
    if (A) out[b] = A;
    else delete out[b];
  }
  if (pose.hold === "R") out.hold = "L";
  else if (pose.hold === "L") out.hold = "R";
  return out;
}

function withHold(pose, hold) {
  return { ...pose, hold };
}

export {
  P, FS,
  S_HINGE, S_RACK, S_OH, S_GOBLET, S_SQUAT, S_RACKSQ, S_LUNGE_R, S_SWTOP,
  F_RACK, F_OH, F_GOBLET, F_SQUAT, F_RACKSQ, F_HINGE, F_LUNGE,
  twist, shrug, mirror, withHold,
};
