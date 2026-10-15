/* rig.js — the pelvis-rooted 3D rig: skeleton, IK, bell, sampler, cameras, drawing and checks.
   Shared by the app, the contact sheet and check.mjs. Pure functions; drawing takes a 2D canvas context.
   Movement data lives on `ex.rig` in movements.js; named building blocks are in blocks.js.
   Plan: docs/proposals/rig-app-plan.md. Merged from the prototypes in docs/prototypes/. */

import { BODIES, HANDS, ELBOWS, FEET, BELL_STATES } from "./blocks.js";

// World: x forward, y up, z = figure's right. Meters.
export const BONES = {
  thigh: 0.44, shin: 0.43, spine: 0.5, neck: 0.12, headR: 0.095,
  upper: 0.29, fore: 0.27, hipW: 0.09, shW: 0.18,
  bellDrop: 0.1, hangDrop: 0.12, bellR: 0.08,
};
const B = BONES;

const v = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return mul(a, 1 / l); };
const rad = (d) => (d * Math.PI) / 180;
const flipZ = (a) => [a[0], a[1], -a[2]];

/* Two-bone IK: root, target, bone lengths, and a pole direction the middle joint bends toward.
   A target past full reach is clamped; `over` reports by how much so the check can fail it.
   `poleAngle` is the angle between pole and limb axis: near 0 the bend direction is undefined
   and the middle joint can jump. */
function ik(root, target, a, b, pole) {
  const d = sub(target, root), raw = len(d);
  const maxR = a + b - 1e-3, minR = Math.abs(a - b) + 1e-3;
  const dir = norm(d), dist = Math.min(maxR, Math.max(minR, raw));
  const cosA = (a * a + dist * dist - b * b) / (2 * a * dist), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const pn = norm(pole), along = dot(pn, dir);
  const perp = norm(sub(pn, mul(dir, along)));
  const mid = add(root, add(mul(dir, a * cosA), mul(perp, a * sinA)));
  return { mid, end: add(root, mul(dir, dist)), over: raw - (a + b), reach: raw / (a + b), poleAngle: Math.acos(Math.min(1, Math.abs(along))) * 180 / Math.PI };
}

// A body frame tilted in the sagittal plane: 0 is upright, -90 is lying on the back.
const tilt = (deg) => { const a = rad(deg); return { up: v(Math.sin(a), Math.cos(a), 0), fwd: v(Math.cos(a), -Math.sin(a), 0) }; };

// Ribcage frame for a pelvis position, lean and twist (positive twist turns toward the figure's left).
function ribcage(pelvis, lean, twist) {
  const T = tilt(lean), tw = rad(twist), r0 = v(0, 0, 1);
  const up = T.up;
  const fwd = add(mul(T.fwd, Math.cos(tw)), mul(r0, -Math.sin(tw)));
  const right = add(mul(r0, Math.cos(tw)), mul(T.fwd, Math.sin(tw)));
  const neck = add(pelvis, mul(up, B.spine));
  return { up, fwd, right, neck };
}

/* ---------------- State: one phase as numbers ----------------
   A raw state is what the sampler interpolates. Bell attachment is a set of weights
   (right hand, left hand, both hands on the horns, on the floor) so a hand-off blends
   instead of jumping; the check requires the hands to be together where it happens. */
const KEYS = [
  ["pelvis", 3], ["pitch", 1], ["lean", 1], ["twist", 1],
  ["footL", 3], ["toesL", 1], ["airL", 1], ["footR", 3], ["toesR", 1], ["airR", 1],
  ["handL", 3], ["handR", 3], ["poleL", 3], ["poleR", 3],
  ["rack", 1], ["fling", 1], ["wR", 1], ["wL", 1], ["wB", 1], ["wH", 1], ["wF", 1], ["floorAt", 3],
];
const flat = (s) => KEYS.flatMap(([k, n]) => (n === 1 ? [s[k]] : s[k]));
function unflat(a) {
  const s = {}; let i = 0;
  for (const [k, n] of KEYS) { s[k] = n === 1 ? a[i] : a.slice(i, i + n); i += n; }
  return s;
}

// Who holds the bell: one hand (R, L), both hands on the handle, both hands on the horns, or the floor.
const ON = { R: "wR", L: "wL", handle: "wB", horns: "wH", floor: "wF" };

/* Expand a movement's authored phases (block names plus overrides) into raw states.
   Authored as right-handed; the left side is a mirror. */
export function expand(rig) {
  const feet = typeof rig.feet === "string" ? FEET[rig.feet] : rig.feet;
  return rig.phases.map((p) => {
    const body = { pitch: 0, twist: 0, ...(p.body ? BODIES[p.body] : {}) };
    const pv = p.pelvis || body.pelvis;
    const pelvis = [pv[0], pv[1], pv[2] || 0];
    const lean = p.lean ?? body.lean, pitch = p.pitch ?? body.pitch, twist = p.twist ?? body.twist;
    const rib = ribcage(pelvis, lean, twist);
    const hand = (h, side) => {
      if (Array.isArray(h)) return h;                                    // world coordinates as written
      const blk = HANDS[h];
      if (blk.frame === "world") return [blk.at[0], blk.at[1], side * blk.at[2]];
      if (blk.frame === "pelvis") return [pelvis[0] + blk.at[0], pelvis[1] + blk.at[1], side * blk.at[2]];
      if (blk.frame === "shoulder") {
        const sh = add(add(rib.neck, mul(rib.right, side * B.shW)), mul(rib.up, -0.02));
        return [sh[0] + blk.at[0], sh[1] + blk.at[1], sh[2] + side * blk.at[2]];
      }
      // torso: offset from the neck along the ribcage's forward, up and right
      const [f, u, r] = blk.at;
      return add(rib.neck, add(add(mul(rib.fwd, f), mul(rib.up, u)), mul(rib.right, side * r)));
    };
    const pole = (e) => (Array.isArray(e) ? e : ELBOWS[e]);
    const on = p.on || rig.on;
    const rack = typeof p.bell === "number" ? p.bell : BELL_STATES[p.bell || "hanging"];
    const fl = p.footL || feet.footL, fr = p.footR || feet.footR;
    return {
      pelvis, pitch, lean, twist,
      footL: fl.at, toesL: fl.toes || 0, airL: fl.air || 0,
      footR: fr.at, toesR: fr.toes || 0, airR: fr.air || 0,
      handL: hand(p.handL || "thigh", -1), handR: hand(p.handR || "thigh", 1),
      poleL: pole(p.elL || "free"), poleR: pole(p.elR || "free"),
      rack, fling: p.fling || 0,
      wR: on === "R" ? 1 : 0, wL: on === "L" ? 1 : 0, wB: on === "handle" ? 1 : 0, wH: on === "horns" ? 1 : 0, wF: on === "floor" ? 1 : 0,
      floorAt: p.floorAt || [0.3, B.bellR, 0],
      name: p.name, t: p.t, lock: p.lock || [], on,
    };
  });
}

// Mirror: swap sides, flip z, reverse the twist.
export function mirror(st) {
  const sw = { R: "L", L: "R" };
  return {
    ...st,
    pelvis: flipZ(st.pelvis), twist: -st.twist,
    footL: flipZ(st.footR), toesL: st.toesR, airL: st.airR,
    footR: flipZ(st.footL), toesR: st.toesL, airR: st.airL,
    handL: flipZ(st.handR), handR: flipZ(st.handL),
    poleL: st.poleR, poleR: st.poleL,
    wR: st.wL, wL: st.wR, floorAt: flipZ(st.floorAt),
    lock: st.lock.map((k) => sw[k]), on: sw[st.on] || st.on,
  };
}

/* ---------------- Solve one state to joint positions ---------------- */
export function solve(s, m = {}) {
  const pel = s.pelvis;
  const P = tilt(s.pitch);
  const { up, fwd, right, neck } = ribcage(pel, s.lean, s.twist);
  const hip = (side) => add(pel, v(0, 0, side * B.hipW));           // pelvis stays square: hips never twist
  const shoulder = (side) => add(add(neck, mul(right, side * B.shW)), mul(up, -0.02));
  const head = add(neck, mul(up, B.neck));
  const legs = {}, arms = {}, ik2 = {};
  for (const [name, side] of [["L", -1], ["R", 1]]) {
    const at = s["foot" + name], toes = s["toes" + name], air = s["air" + name], h = hip(side);
    const k = ik(h, at, B.thigh, B.shin, add(add(P.fwd, mul(P.up, -0.15)), v(0, 0, side * (m.kneeOut ?? 0.08))));
    const floorToe = [0.17 - 0.05 * toes, -0.08 - 0.03 * toes, 0];      // flat or on the toes, pointing forward
    const airToe = mul(P.fwd, 0.15);                                     // foot off the floor: toes toward the shins
    const toe = add(k.end, add(mul(floorToe, 1 - air), mul(airToe, air)));
    legs[name] = { hip: h, knee: k.mid, ankle: k.end, toe };
    ik2["leg" + name] = k;
  }
  for (const [name, side] of [["L", -1], ["R", 1]]) {
    const sh = shoulder(side), [pu, pr, pf] = s["pole" + name];
    const e = ik(sh, s["hand" + name], B.upper, B.fore, add(add(mul(up, pu), mul(right, side * pr)), mul(fwd, pf)));
    arms[name] = { sh, elbow: e.mid, hand: e.end };
    ik2["arm" + name] = e;
  }
  /* The bell hangs under gravity. One hand blends two holds by `rack`:
     0 hangs from the handle, trailing the forearm when the arm points down;
     1 rests on the outside of the forearm. In between it rolls round the hand.
     `fling` (0 to 1) swings it out in line with the forearm, as at the top of a swing. */
  const down = v(0, -1, 0);
  const hangFrom = (handle, fore) => {
    const w = Math.max(0, dot(fore, down), s.fling);
    return add(handle, mul(norm(add(mul(down, 1 - w), mul(fore, w))), B.hangDrop));
  };
  const oneHand = (name, side) => {
    const a = arms[name], fore = norm(sub(a.hand, a.elbow));
    const hang = hangFrom(a.hand, fore);
    const rest = add(add(a.hand, v(0, -0.075, 0)), mul(right, side * 0.065));
    return { handle: a.hand, bell: add(mul(hang, 1 - s.rack), mul(rest, s.rack)) };
  };
  const horns = mul(add(arms.L.hand, arms.R.hand), 0.5);
  const both = hangFrom(horns, norm(add(norm(sub(arms.L.hand, arms.L.elbow)), norm(sub(arms.R.hand, arms.R.elbow)))));
  const holds = [
    [s.wR, oneHand("R", 1)],
    [s.wL, oneHand("L", -1)],
    [s.wB, { handle: horns, bell: both }],
    [s.wH, { handle: horns, bell: add(horns, v(0, -B.bellDrop, 0)) }],
    [s.wF, { handle: add(s.floorAt, v(0, B.bellR + 0.05, 0)), bell: s.floorAt }],
  ];
  const wt = holds.reduce((n, [w]) => n + Math.max(0, w), 0) || 1;
  let handle = [0, 0, 0], bell = [0, 0, 0];
  for (const [w, h] of holds) if (w > 0) { handle = add(handle, mul(h.handle, w / wt)); bell = add(bell, mul(h.bell, w / wt)); }
  return { pel, neck, head, fwd, legs, arms, handle, bell, ik: ik2, floor: m.floor };
}

/* ---------------- Sampler ----------------
   Smooth cubic through the phases. Holds flat stretches flat and never overshoots a phase. */
export function sampler(states) {
  const N = states.length, VALS = states.map(flat);
  const TOTAL = states.reduce((n, p) => n + p.t, 0);
  const T = []; { let acc = 0; for (const p of states) { T.push(acc); acc += p.t; } }
  const tAt = (i) => T[((i % N) + N) % N] + Math.floor(i / N) * TOTAL;
  const vAt = (i, k) => VALS[((i % N) + N) % N][k];
  function at(time) {
    const u = ((time % TOTAL) + TOTAL) % TOTAL;
    let i = N - 1; for (let j = 0; j < N; j++) if (u >= T[j]) i = j;
    const t0 = tAt(i), t1 = tAt(i + 1), h = t1 - t0, s = (u - t0) / h;
    const h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
    const out = [];
    for (let k = 0; k < VALS[0].length; k++) {
      const a = vAt(i, k), b = vAt(i + 1, k);
      // Monotone slopes: zero where the value turns or holds, capped so no stretch overshoots its ends.
      const d0 = (a - vAt(i - 1, k)) / (t0 - tAt(i - 1)), d1 = (b - a) / h, d2 = (vAt(i + 2, k) - b) / (tAt(i + 2) - t1);
      const slope = (dl, dr, est) => (dl * dr <= 0 ? 0 : Math.sign(dr) * Math.min(Math.abs(est), 3 * Math.abs(dl), 3 * Math.abs(dr)));
      const m0 = slope(d0, d1, (b - vAt(i - 1, k)) / (t1 - tAt(i - 1)));
      const m1 = slope(d1, d2, (vAt(i + 2, k) - a) / (tAt(i + 2) - t0));
      out.push(h00 * a + h10 * h * m0 + h01 * b + h11 * h * m1);
    }
    return { state: unflat(out), phase: states[i].name, index: i };
  }
  return { at, total: TOTAL, starts: T };
}

/* A movement ready to play: the cycle (one rep, or a rep then its mirror for alternating
   movements), scaled so one rep lasts `dur` seconds. `side: "L"` plays the mirrored rep. */
export function build(ex, side = "R") {
  const rep = expand(ex.rig);
  const repDur = rep.reduce((n, p) => n + p.t, 0);
  const k = (ex.dur || repDur) / repDur;
  const scaled = rep.map((p) => ({ ...p, t: p.t * k }));
  const one = side === "L" ? scaled.map(mirror) : scaled;
  const cycle = ex.rig.sides === "alternate" ? [...one, ...one.map(mirror)] : one;
  // The floor patch covers every foot position in the rep, so a wide stance stays on it.
  const feet = cycle.flatMap((p) => [p.footL, p.footR]);
  const floor = [Math.min(FLOOR[0], ...feet.map((f) => f[0] - 0.15)), Math.max(FLOOR[1], ...feet.map((f) => f[0] + 0.3)),
    Math.max(FLOOR[2], ...feet.map((f) => Math.abs(f[2]) + 0.2))];
  const m = { kneeOut: ex.rig.kneeOut, floor };
  return { cycle, smp: sampler(cycle), m };
}

/* ---------------- Cameras and framing ----------------
   Fixed scale for every movement, ground at y=178 in a 200×200 box, as the old figures. */
export const VIEWS = { side: [0, 6], front: [90, 8], quarter: [38, 14] };
export const VIEW_LABELS = { side: "Side", front: "Front", quarter: "Three-quarter" };
export const FRAME = { S: 80, ground: 178, cx: 100 };

export function camera(view, frame = {}) {
  const [yawDeg, pitchDeg] = VIEWS[view];
  const y = rad(yawDeg), p = rad(pitchDeg);
  const right = v(Math.cos(y), 0, -Math.sin(y)), toward = v(Math.sin(y), 0, Math.cos(y));
  const S = FRAME.S, ox = frame.x || 0;
  return (pt) => {
    const X = dot(pt, right) - ox, Y = pt[1], D = dot(pt, toward);
    return { x: FRAME.cx + X * S, y: FRAME.ground - (Y * Math.cos(p) - D * Math.sin(p)) * S, d: D * Math.cos(p) + Y * Math.sin(p) };
  };
}

const solvedPoints = (r) => [r.head, r.neck, r.pel, r.bell, r.handle,
  ...["L", "R"].flatMap((k) => [r.legs[k].hip, r.legs[k].knee, r.legs[k].ankle, r.legs[k].toe, r.arms[k].sh, r.arms[k].elbow, r.arms[k].hand])];

/* ---------------- Drawing ---------------- */
export const RIG_COLORS = { chalk: "#EFEBE2", edge: "#2A2D33", floor: "#24262B" };
const FLOOR = [-0.7, 0.7, 0.45];   // default floor patch: x from, x to, z half-width (m)
// Far limbs dim by a fixed depth scale, so a still limb never changes shade.
const DEPTH = [-0.25, 0.25];

function line(ctx, a, b, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
function ring(ctx, p, r, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke(); }
function disc(ctx, p, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); }

// Draw one solved state into a 200×200 box (the caller sets the transform for the canvas size).
export function draw(ctx, r, view, bellColor, frame) {
  const P2 = camera(view, frame), C = RIG_COLORS;
  ctx.clearRect(0, 0, 200, 200); ctx.lineCap = "round"; ctx.lineJoin = "round";
  const [fx0, fx1, fz] = r.floor || FLOOR, ox = (frame && frame.x) || 0;
  const corners = [[fx0 + ox, 0, -fz], [fx1 + ox, 0, -fz], [fx1 + ox, 0, fz], [fx0 + ox, 0, fz]].map(P2);
  ctx.globalAlpha = 1; ctx.fillStyle = C.floor; ctx.beginPath();
  corners.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.edge; ctx.lineWidth = 1; ctx.stroke();
  const items = [];
  const seg = (a, b, w) => { const A = P2(a), Bp = P2(b); items.push({ kind: "seg", A, B: Bp, w, d: (A.d + Bp.d) / 2 }); };
  for (const L of ["L", "R"]) {
    const g = r.legs[L]; seg(g.hip, g.knee, 3.4); seg(g.knee, g.ankle, 3.4); seg(g.ankle, g.toe, 2.8);
    const a = r.arms[L]; seg(a.sh, a.elbow, 3.1); seg(a.elbow, a.hand, 3.1);
  }
  seg(r.legs.L.hip, r.legs.R.hip, 3.4);
  seg(r.arms.L.sh, r.arms.R.sh, 3.4);
  seg(r.pel, r.neck, 3.8);
  const bellP = P2(r.bell), hd = P2(r.head);
  items.push({ kind: "bell", d: bellP.d }, { kind: "head", d: hd.d });
  items.sort((a, b) => a.d - b.d);
  for (const it of items) {
    if (it.kind === "bell") {
      const h = P2(r.handle);
      ctx.globalAlpha = 1; line(ctx, h, bellP, bellColor, 2.2);
      disc(ctx, bellP, B.bellR * FRAME.S, bellColor); ring(ctx, h, 3.6, bellColor, 2.4);
    } else if (it.kind === "head") {
      ctx.globalAlpha = 1; ring(ctx, hd, B.headR * FRAME.S, C.chalk, 3);
      line(ctx, P2(add(r.head, mul(r.fwd, B.headR * 0.9))), P2(add(r.head, mul(r.fwd, B.headR * 1.45))), C.chalk, 2.4);
    } else {
      const near = Math.min(1, Math.max(0, (it.d - DEPTH[0]) / (DEPTH[1] - DEPTH[0])));
      ctx.globalAlpha = 0.32 + 0.68 * near;
      line(ctx, it.A, it.B, C.chalk, it.w);
    }
  }
  ctx.globalAlpha = 1;
}

/* ---------------- Checks ----------------
   Run on one rep, right side and mirrored. Limits from the clean + squat + press trial. */
export const LIMITS = {
  over: 0.005,       // m past full reach before a limb target fails
  lock: 0.95,        // lockout phases reach at least this share of the arm
  floor: -0.01,      // m: lowest point allowed (toe on the floor is 0)
  bellFloor: -0.005, // m: bell bottom, unless it rests on the floor
  headGap: 0.02,     // m between bell and head
  limbGap: 0.0,      // m between bell surface and the line of the spine, thighs and shins
  speed: 5,          // m/s, any joint or the bell
  poleAngle: 12,     // degrees between an elbow or knee direction and its limb
  handOff: 0.1,      // m between the hands where the bell changes hands
  margin: 4,         // px inside the 200×200 box for every view the card shows
};

const segDist = (p, a, b) => {
  const ab = sub(b, a), ap = sub(p, a);
  const t = Math.max(0, Math.min(1, dot(ap, ab) / (dot(ab, ab) || 1)));
  return len(sub(p, add(a, mul(ab, t))));
};

export function validateRig(ex) {
  const errs = [], rig = ex.rig, names = new Set();
  if (!rig || !Array.isArray(rig.phases) || rig.phases.length < 2) return ["rig.phases needs at least two phases"];
  if (!(typeof rig.feet === "string" ? FEET[rig.feet] : rig.feet && rig.feet.footL && rig.feet.footR)) errs.push(`rig.feet "${rig.feet}" unknown`);
  if (!ON[rig.on]) errs.push(`rig.on must be R, L, handle, horns or floor`);
  if (!["right", "alternate"].includes(rig.sides)) errs.push(`rig.sides must be "right" or "alternate"`);
  const views = rig.views || [];
  if (!views.length || views.length > 2 || views.some((w) => !VIEWS[w])) errs.push(`rig.views must name one or two of ${Object.keys(VIEWS).join(", ")}`);
  rig.phases.forEach((p, i) => {
    const at = `rig.phases[${i}]${p.name ? ` (${p.name})` : ""}`;
    if (!p.name) errs.push(`${at}: name required`); else if (names.has(p.name)) errs.push(`${at}: duplicate name`); else names.add(p.name);
    if (!(typeof p.t === "number" && p.t > 0)) errs.push(`${at}: t must be a positive number`);
    if (p.body && !BODIES[p.body]) errs.push(`${at}: unknown body "${p.body}"`);
    if (!p.body && !(p.pelvis && typeof p.lean === "number")) errs.push(`${at}: needs a body block or pelvis and lean`);
    for (const k of ["handR", "handL"]) if (p[k] && !Array.isArray(p[k]) && !HANDS[p[k]]) errs.push(`${at}: unknown ${k} "${p[k]}"`);
    for (const k of ["elR", "elL"]) if (p[k] && !Array.isArray(p[k]) && !ELBOWS[p[k]]) errs.push(`${at}: unknown ${k} "${p[k]}"`);
    if (p.bell != null && typeof p.bell !== "number" && !(p.bell in BELL_STATES)) errs.push(`${at}: unknown bell "${p.bell}"`);
    if (p.on && !ON[p.on]) errs.push(`${at}: on must be R, L, handle, horns or floor`);
    if (p.fling != null && !(p.fling >= 0 && p.fling <= 1)) errs.push(`${at}: fling must be 0 to 1`);
    if (p.lock && (!Array.isArray(p.lock) || p.lock.some((k) => k !== "R" && k !== "L"))) errs.push(`${at}: lock must list R and/or L`);
  });
  if (rig.still && !names.has(rig.still)) errs.push(`rig.still "${rig.still}" is not a phase`);
  return errs;
}

// Geometry checks. Returns messages; empty means it passes.
export function checkRig(ex, N = 600) {
  const out = [], L = LIMITS, rig = ex.rig;
  for (const side of ["R", "L"]) {
    const { cycle, smp, m } = build({ ...ex, rig: { ...rig, sides: "right" } }, side);
    const tag = side === "R" ? "right" : "left";
    const worst = {};
    const note = (key, val, phase, bad) => { if (bad(val) && (!worst[key] || bad(val, worst[key].val))) worst[key] = { val, phase }; };
    let prev = null;
    const dt = smp.total / N;
    const cams = (rig.views || []).map((w) => [w, camera(w, rig.frame)]);
    for (let k = 0; k <= N; k++) {
      const { state, phase } = smp.at(k * dt), r = solve(state, m);
      for (const [lim, key] of [["armR", "arm R"], ["armL", "arm L"], ["legR", "leg R"], ["legL", "leg L"]]) {
        note(`reach ${key}`, r.ik[lim].over, phase, (x, w) => (w == null ? x > L.over : x > w));
        note(`pole ${key}`, r.ik[lim].poleAngle, phase, (x, w) => (w == null ? x < L.poleAngle : x < w));
      }
      const pts = solvedPoints(r);
      const lowest = Math.min(...pts.filter((p) => p !== r.bell && p !== r.handle).map((p) => p[1]), r.head[1] - B.headR);
      note("floor", lowest, phase, (x, w) => (w == null ? x < L.floor : x < w));
      if (state.wF < 0.5) note("bell floor", r.bell[1] - B.bellR, phase, (x, w) => (w == null ? x < L.bellFloor : x < w));
      note("bell head", len(sub(r.bell, r.head)) - B.bellR - B.headR, phase, (x, w) => (w == null ? x < L.headGap : x < w));
      const body = [[r.pel, r.neck, "spine"], ...["L", "R"].flatMap((x) => [[r.legs[x].hip, r.legs[x].knee, `thigh ${x}`], [r.legs[x].knee, r.legs[x].ankle, `shin ${x}`]])];
      for (const [a, b, nm] of body) note(`bell ${nm}`, segDist(r.bell, a, b) - B.bellR, phase, (x, w) => (w == null ? x < L.limbGap : x < w));
      if (prev) {
        const named = [["bell", r.bell, prev.bell], ["head", r.head, prev.head],
          ...["L", "R"].flatMap((x) => [[`elbow ${x}`, r.arms[x].elbow, prev.arms[x].elbow], [`hand ${x}`, r.arms[x].hand, prev.arms[x].hand], [`knee ${x}`, r.legs[x].knee, prev.legs[x].knee], [`ankle ${x}`, r.legs[x].ankle, prev.legs[x].ankle]])];
        for (const [nm, a, b] of named) note(`speed ${nm}`, len(sub(a, b)) / dt, phase, (x, w) => (w == null ? x > L.speed : x > w));
      }
      prev = r;
      for (const [w, cam] of cams) {
        for (const p of pts) {
          const q = cam(p), pad = p === r.bell ? B.bellR * FRAME.S : p === r.head ? B.headR * FRAME.S : 0;
          const o = Math.max(L.margin - (q.x - pad), (q.x + pad) - (200 - L.margin), L.margin - (q.y - pad), 0);
          note(`frame ${w}`, o, phase, (x, ww) => (ww == null ? x > 0 : x > ww));
        }
      }
    }
    const fmt = (key, { val, phase }) => {
      const cm = (x) => `${(x * 100).toFixed(1)} cm`;
      if (key.startsWith("reach")) return `${key.slice(6)} target ${cm(val)} past full reach`;
      if (key.startsWith("pole")) return `${key.slice(5)} bend direction within ${val.toFixed(0)}° of the limb (min ${L.poleAngle}°)`;
      if (key === "floor") return `body ${cm(-val)} below the floor`;
      if (key === "bell floor") return `bell ${cm(-val)} into the floor`;
      if (key === "bell head") return `bell ${cm(val)} from the head (min ${cm(L.headGap)})`;
      if (key.startsWith("bell ")) return `bell inside the ${key.slice(5)} by ${cm(-val)}`;
      if (key.startsWith("speed")) return `${key.slice(6)} moves ${val.toFixed(1)} m/s (max ${L.speed})`;
      if (key.startsWith("frame")) return `${key.slice(6)} view: ${val.toFixed(0)} px outside the card`;
      return key;
    };
    for (const key in worst) out.push(`${tag}: ${fmt(key, worst[key])} at ${worst[key].phase}`);
    // Lockouts and hand-offs, at the phase itself.
    cycle.forEach((p, i) => {
      const r = solve(smp.at(smp.starts[i]).state, m);
      for (const k of p.lock) {
        const reach = len(sub(r.arms[k].hand, r.arms[k].sh)) / (B.upper + B.fore);
        if (reach < L.lock) out.push(`${tag}: ${k} arm at ${(reach * 100).toFixed(0)}% of reach at lockout ${p.name} (min ${L.lock * 100}%)`);
      }
      const nx = cycle[(i + 1) % cycle.length];
      // A pass between hands needs the hands together; a regrip with both hands on (handle to horns) doesn't.
      const oneHanded = (o) => o === "R" || o === "L";
      if (nx.on !== p.on && (oneHanded(p.on) || oneHanded(nx.on))) {
        for (const [st, nm] of [[p, p.name], [nx, nx.name]]) {
          const rr = solve(smp.at(smp.starts[cycle.indexOf(st)]).state, m);
          const gap = len(sub(rr.arms.L.hand, rr.arms.R.hand));
          if ((p.on === "floor" || nx.on === "floor") ? false : gap > L.handOff) out.push(`${tag}: bell changes hands ${p.name} → ${nx.name} with the hands ${(gap * 100).toFixed(0)} cm apart at ${nm}`);
        }
      }
    });
  }
  return out;
}
