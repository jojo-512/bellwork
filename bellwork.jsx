import { useState, useEffect, useRef, useMemo } from "react";
import { EXERCISES, PATTERN_ORDER } from "./movements.js";

/* ============================================================
   BELLWORK v4 — 20-minute kettlebell AMRAP generator
   - Standard mode: 32 single movements
   - Complex mode: hybrid pool (17 chained combos; 3 also in Standard)
   - Dual side/front animated figures, grips, 2-bell badges
   - Partial sessions save on reset; PRs scoped per mode+focus
   ============================================================ */

const COLORS = {
  bg: "#17181B",
  panel: "#1F2125",
  panelEdge: "#2A2D33",
  chalk: "#EFEBE2",
  chalkDim: "#9A968C",
  upper: "#C4402F",
  lower: "#3E8E5A",
  core: "#E0AE1E",
  full: "#7B5EA7",
};

const FOCUS_META = {
  upper: { label: "Upper", color: COLORS.upper },
  lower: { label: "Lower", color: COLORS.lower },
  core: { label: "Core", color: COLORS.core },
  full: { label: "Full body", color: COLORS.full },
};

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFrom(str) {
  let h = 1779033703;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/* Local calendar date as YYYY-MM-DD. toISOString() would give UTC, which in
   Austin flips to tomorrow at 6-7pm and logs the session on the wrong day. */
function localDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function poolFor(mode, approved = []) {
  return EXERCISES.filter((e) => {
    if (!e.pools.includes(mode)) return false;
    if (e.pending && !approved.includes(e.id)) return false;
    return true;
  });
}

/* Old builds stored mode as "advanced". Map it so prefs, runs, and the
   session log keep matching Complex PRs after the rename. */
function normalizeMode(m) {
  if (m === "advanced") return "complex";
  return m === "complex" ? "complex" : "standard";
}

function hasPoses(ex) {
  if (ex.frontOnly) return Array.isArray(ex.posesF) && ex.posesF.length > 0;
  return Array.isArray(ex.poses) && ex.poses.length > 0 && Array.isArray(ex.posesF) && ex.posesF.length > 0;
}

function buildCircuit(focus, mode, salt, approved = []) {
  const today = localDate();
  // Seed with the pre-rename mode string so Complex days don't reshuffle
  // under everyone who already knows today's picks.
  const seedMode = mode === "complex" ? "advanced" : mode;
  const rand = mulberry32(seedFrom(today + focus.join("+") + seedMode + salt));
  const wantFull = focus.includes("full");
  let pool = poolFor(mode, approved).filter((e) => (wantFull ? true : e.tags.some((t) => focus.includes(t))));
  pool = [...pool].sort(() => rand() - 0.5);
  const picked = [];
  const usedPatterns = new Set();
  const usedGroups = new Set();

  // Pass 1: unique pattern and unique variant group
  for (const ex of pool) {
    if (picked.length >= 5) break;
    if (usedPatterns.has(ex.pattern)) continue;
    if (ex.variantGroup && usedGroups.has(ex.variantGroup)) continue;
    picked.push(ex);
    usedPatterns.add(ex.pattern);
    if (ex.variantGroup) usedGroups.add(ex.variantGroup);
  }
  // Pass 2: unique group only (pattern may repeat)
  for (const ex of pool) {
    if (picked.length >= 5) break;
    if (picked.includes(ex)) continue;
    if (ex.variantGroup && usedGroups.has(ex.variantGroup)) continue;
    picked.push(ex);
    if (ex.variantGroup) usedGroups.add(ex.variantGroup);
  }
  // Pass 3: anything not already picked — always return five when the pool can
  for (const ex of pool) {
    if (picked.length >= 5) break;
    if (!picked.includes(ex)) picked.push(ex);
  }
  picked.sort((a, b) => PATTERN_ORDER.indexOf(a.pattern) - PATTERN_ORDER.indexOf(b.pattern));
  return picked;
}

function headFrom(pose) {
  if (pose.head) return pose.head;
  const [hx, hy] = pose.hip;
  const [sx, sy] = pose.sh;
  const dx = sx - hx, dy = sy - hy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [sx + (dx / len) * 13, sy + (dy / len) * 13];
}

const SIDE_SEGS = [
  // Trail leg (kn2/an2) sits behind the stance leg. Dim it so a split reads as two legs.
  ["hip", "kn2", 2.8, 0.28], ["kn2", "an2", 2.8, 0.28],
  ["hip", "sh", 3.8, 1], ["hip", "kn", 3.4, 1], ["kn", "an", 3.4, 1],
  ["sh", "el", 3.2, 1], ["el", "ha", 3.2, 1],
];
const FRONT_SEGS = [
  ["hip", "sh", 3.8, 1],
  ["hip", "knR", 3.4, 1], ["knR", "anR", 3.4, 1],
  ["hip", "knL", 3.4, 1], ["knL", "anL", 3.4, 1],
  ["sh", "elR", 3.2, 1], ["elR", "haR", 3.2, 1],
  ["sh", "elL", 3.2, 1], ["elL", "haL", 3.2, 1],
];

export function Figure({ poses, dur, color, animate, bellFlip }) {
  const svgRef = useRef(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      if (!animate && svg.pauseAnimations) svg.pauseAnimations();
      else if (svg.unpauseAnimations) svg.unpauseAnimations();
    } catch (e) {}
  }, [animate]);

  const durS = `${dur}s`;
  const cyc = (getter) => {
    const vals = poses.map(getter);
    return [...vals, vals[0]];
  };
  const anim = (name, vals) => (
    <animate attributeName={name} values={vals.join(";")} dur={durS} repeatCount="indefinite" calcMode="linear" />
  );
  const segs = poses[0].elR ? FRONT_SEGS : SIDE_SEGS;
  const heads = cyc(headFrom);
  const bells = cyc((p) => p.bell || p.ha || p.haR);
  const hOff = bellFlip ? 7 : -7;
  return (
    <svg ref={svgRef} viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-hidden="true">
      <line x1="18" y1="178" x2="182" y2="178" stroke={COLORS.panelEdge} strokeWidth="2" />
      {segs.map(([aKey, bKey, w, op], i) => {
        if (!poses[0][aKey] || !poses[0][bKey]) return null;
        const A = cyc((p) => p[aKey]);
        const B = cyc((p) => p[bKey]);
        return (
          <line key={i} x1={A[0][0]} y1={A[0][1]} x2={B[0][0]} y2={B[0][1]}
            stroke={COLORS.chalk} strokeWidth={w} strokeLinecap="round" opacity={op}>
            {anim("x1", A.map((v) => v[0]))}
            {anim("y1", A.map((v) => v[1]))}
            {anim("x2", B.map((v) => v[0]))}
            {anim("y2", B.map((v) => v[1]))}
          </line>
        );
      })}
      <circle cx={heads[0][0]} cy={heads[0][1]} r="8" fill="none" stroke={COLORS.chalk} strokeWidth="3">
        {anim("cx", heads.map((v) => v[0]))}
        {anim("cy", heads.map((v) => v[1]))}
      </circle>
      <circle cx={bells[0][0]} cy={bells[0][1]} r="7.5" fill={color}>
        {anim("cx", bells.map((v) => v[0]))}
        {anim("cy", bells.map((v) => v[1]))}
      </circle>
      <circle cx={bells[0][0]} cy={bells[0][1] + hOff} r="4.5" fill="none" stroke={color} strokeWidth="2.6">
        {anim("cx", bells.map((v) => v[0]))}
        {anim("cy", bells.map((v) => v[1] + hOff))}
      </circle>
    </svg>
  );
}

const STORE_KEY = "bellwork-sessions";
const PREFS_KEY = "bellwork-prefs";
const RUN_KEY = "bellwork-run";
const APPROVED_KEY = "bellwork-approved";

function readApproved() {
  const raw = readJSON(APPROVED_KEY);
  return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
}
function writeApproved(ids) {
  writeJSON(APPROVED_KEY, ids);
}

async function loadSessions() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    let dirty = false;
    const normalized = list.map((s) => {
      if (!s || typeof s !== "object") return s;
      if (s.mode === "advanced") {
        dirty = true;
        return { ...s, mode: "complex" };
      }
      return s;
    });
    if (dirty) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(normalized.slice(-200))); } catch (e) {}
    }
    return normalized;
  } catch { return []; }
}
async function saveSessions(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-200))); } catch (e) {}
}

function exportSessions(list) {
  try {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bellwork-log-${localDate()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (e) {}
}

function importSessions(onLoad) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(String(reader.result));
        if (Array.isArray(incoming)) {
          onLoad(incoming.map((s) => {
            if (!s || typeof s !== "object") return s;
            if (s.mode === "advanced") return { ...s, mode: "complex" };
            return s;
          }));
        }
      } catch (e) {}
    };
    reader.readAsText(file);
  };
  input.click();
}

const DURATIONS = [15, 20, 25, 30];
const WEIGHTS_LB = [25, 30, 35, 40, 45];

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function clearKey(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

/* A saved run is only worth restoring if it belongs to today and its clock
   hasn't been done for more than an hour. Anything older is yesterday's ghost. */
function runIsFresh(run) {
  if (!run || typeof run !== "object") return false;
  if (run.date !== localDate()) return false;
  const endsAt = run.endAt || (run.savedAt || 0) + (run.secondsLeft || 0) * 1000;
  return Date.now() <= endsAt + 60 * 60 * 1000;
}

/* ---- beeps ----
   iOS only lets us make sound from an AudioContext created or resumed inside a
   real tap, so unlockBeeps() runs in the START / Resume handler. */
let beepCtx = null;

function unlockBeeps() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!beepCtx) beepCtx = new Ctx();
    if (beepCtx.state === "suspended") beepCtx.resume();
  } catch (e) {}
}

function playBeeps(count) {
  try {
    if (!beepCtx) return;
    if (beepCtx.state === "suspended") beepCtx.resume();
    for (let i = 0; i < count; i++) {
      const at = beepCtx.currentTime + i * 0.3;
      const osc = beepCtx.createOscillator();
      const gain = beepCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.4, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
      osc.connect(gain).connect(beepCtx.destination);
      osc.start(at);
      osc.stop(at + 0.22);
    }
  } catch (e) {}
}

function Library({ reduced, approved, onApprove }) {
  const [tagFilter, setTagFilter] = useState(null);
  const [showSide, setShowSide] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const displayFont = "'Big Shoulders Display', 'Arial Narrow', sans-serif";
  const isPending = (e) => e.pending && !approved.includes(e.id);
  const pendingItems = EXERCISES.filter(isPending);
  const rotation = EXERCISES.filter((e) => !isPending(e));
  const groups = [
    { title: "Pending", items: pendingItems, pending: true },
    { title: "Standard", items: rotation.filter((e) => e.pools.includes("standard")) },
    { title: "Complex", items: rotation.filter((e) => e.pools.includes("complex")) },
  ];
  const waitingFigures = EXERCISES.filter((e) => !hasPoses(e)).length;
  return (
    <div>
      <div style={{ color: COLORS.chalkDim, fontSize: 15, marginBottom: 12, lineHeight: 1.5 }}>
        {rotation.length} movements in rotation
        {pendingItems.length ? ` · ${pendingItems.length} pending` : ""}
        {waitingFigures ? ` · ${waitingFigures} waiting on figures` : ""}
        . A few live in both Standard and Complex. Tap a focus to filter.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {Object.entries(FOCUS_META).filter(([k]) => k !== "full").map(([key, meta]) => {
          const active = tagFilter === key;
          return (
            <button key={key} onClick={() => setTagFilter(active ? null : key)}
              style={{
                border: `2px solid ${active ? meta.color : COLORS.panelEdge}`,
                background: active ? meta.color : "transparent",
                color: active ? "#111" : COLORS.chalkDim,
                borderRadius: 999, padding: "6px 14px", fontSize: 14.5, fontWeight: 600,
              }}>
              {meta.label}
            </button>
          );
        })}
      </div>
      <div style={{
        display: "inline-flex", border: `1.5px solid ${COLORS.panelEdge}`, borderRadius: 8,
        overflow: "hidden", marginBottom: 16,
      }}>
        {[[true, "SIDE VIEW"], [false, "FRONT VIEW"]].map(([val, label]) => {
          const active = showSide === val;
          return (
            <button key={label} onClick={() => setShowSide(val)}
              style={{
                padding: "7px 14px", border: "none",
                background: active ? COLORS.chalk : "transparent",
                color: active ? "#111" : COLORS.chalkDim,
                fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
              }}>
              {label}
            </button>
          );
        })}
      </div>
      {groups.map((g) => {
        if (g.pending && !g.items.length) return null;
        const items = tagFilter ? g.items.filter((e) => e.tags.includes(tagFilter)) : g.items;
        if (!items.length) return null;
        return (
          <div key={g.title} style={{ marginBottom: 22 }}>
            <div style={{
              fontFamily: displayFont, fontWeight: 800, fontSize: 20, letterSpacing: "0.05em",
              textTransform: "uppercase", marginBottom: 10,
            }}>
              {g.title} <span style={{ color: COLORS.chalkDim, fontSize: 16 }}>· {items.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {items.map((ex) => {
                const exColor = FOCUS_META[ex.tags[0]].color;
                const figured = hasPoses(ex);
                const poses = figured
                  ? (ex.frontOnly ? ex.posesF : (showSide ? ex.poses : ex.posesF))
                  : null;
                const open = expandedId === ex.id;
                return (
                  <div
                    key={g.title + ex.id}
                    onClick={() => setExpandedId(open ? null : ex.id)}
                    style={{
                      background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`,
                      borderRadius: 12, padding: 10, cursor: "pointer",
                    }}
                  >
                    {figured && poses ? (
                      <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                        <Figure poses={poses} dur={ex.dur} color={exColor} animate={!reduced} bellFlip={ex.bellFlip} />
                      </div>
                    ) : (
                      <div style={{
                        background: COLORS.bg, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 8,
                        padding: "14px 10px", marginBottom: 8, color: COLORS.chalkDim, fontSize: 13, lineHeight: 1.4,
                      }}>
                        No figure yet — tap for cue and grip.
                      </div>
                    )}
                    <div style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 16, letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1.15 }}>
                      {ex.name}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4, gap: 6 }}>
                      <span style={{ color: COLORS.chalkDim, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {ex.pattern}
                      </span>
                      <span style={{ color: exColor, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>{ex.reps}</span>
                    </div>
                    <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                      {ex.tags.map((t) => (
                        <span key={t} style={{ width: 10, height: 10, borderRadius: 5, background: FOCUS_META[t].color, display: "inline-block" }} title={FOCUS_META[t].label} />
                      ))}
                      {ex.twoBell && (
                        <span style={{ color: COLORS.chalkDim, fontSize: 12.5, fontWeight: 600, marginLeft: 2 }}>2-bell opt.</span>
                      )}
                    </div>
                    {open && (
                      <>
                        <div style={{ fontSize: 17, lineHeight: 1.5, marginTop: 10, color: COLORS.chalk }}>
                          {ex.cue}
                        </div>
                        <div style={{ fontSize: 16, lineHeight: 1.5, marginTop: 6, color: COLORS.chalkDim }}>
                          <span style={{ fontWeight: 600 }}>Grip:</span> {ex.grip}
                        </div>
                      </>
                    )}
                    {g.pending && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove(ex.id);
                        }}
                        style={{
                          marginTop: 10, width: "100%",
                          background: COLORS.chalk, color: "#111", border: "none",
                          borderRadius: 8, padding: "8px 10px",
                          fontSize: 13.5, fontWeight: 700, letterSpacing: "0.04em",
                        }}
                      >
                        Add to rotation
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Bellwork() {
  const [focus, setFocus] = useState(["full"]);
  const [mode, setMode] = useState("standard");
  const [view, setView] = useState("workout");
  const [salt, setSalt] = useState("");
  const [swaps, setSwaps] = useState({});
  const [durationMin, setDurationMin] = useState(20);
  const [secondsLeft, setSecondsLeft] = useState(20 * 60);
  const [endAt, setEndAt] = useState(null);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [weightLb, setWeightLb] = useState(35);
  const [sessions, setSessions] = useState([]);
  const [finished, setFinished] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [warmOpen, setWarmOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [approved, setApproved] = useState([]);
  const [frozenIds, setFrozenIds] = useState(null);
  const savedRef = useRef(false);
  const circuitTopRef = useRef(null);
  const roundsRef = useRef(0);
  roundsRef.current = rounds;
  const secondsRef = useRef(20 * 60);
  secondsRef.current = secondsLeft;
  const prBeforeRef = useRef(0);
  const beeped60Ref = useRef(false);
  const beeped0Ref = useRef(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    loadSessions().then(setSessions);
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mq.matches);
      const fn = (e) => setReduced(e.matches);
      mq.addEventListener?.("change", fn);
      return () => mq.removeEventListener?.("change", fn);
    } catch (e) {}
  }, []);

  /* restore sticky prefs, then an in-progress run if there is a fresh one */
  useEffect(() => {
    setApproved(readApproved());

    const prefs = readJSON(PREFS_KEY);
    if (prefs) {
      if (prefs.mode === "standard" || prefs.mode === "advanced" || prefs.mode === "complex") {
        setMode(normalizeMode(prefs.mode));
      }
      if (DURATIONS.includes(prefs.durationMin)) {
        setDurationMin(prefs.durationMin);
        setSecondsLeft(prefs.durationMin * 60);
      }
      if (WEIGHTS_LB.includes(prefs.weightLb)) setWeightLb(prefs.weightLb);
    }

    const run = readJSON(RUN_KEY);
    if (runIsFresh(run)) {
      if (Array.isArray(run.focus) && run.focus.length) setFocus(run.focus);
      if (run.mode === "standard" || run.mode === "advanced" || run.mode === "complex") {
        setMode(normalizeMode(run.mode));
      }
      setSalt(run.salt || "");
      setSwaps(run.swaps || {});
      if (Array.isArray(run.circuitIds) && run.circuitIds.length) setFrozenIds(run.circuitIds);
      if (DURATIONS.includes(run.durationMin)) setDurationMin(run.durationMin);
      if (WEIGHTS_LB.includes(run.weightLb)) setWeightLb(run.weightLb);
      setRounds(run.rounds || 0);
      setStarted(true);
      prBeforeRef.current = run.prBefore || 0;

      const remaining = run.endAt
        ? Math.ceil((run.endAt - Date.now()) / 1000)
        : run.secondsLeft || 0;
      setSecondsLeft(Math.max(0, remaining));
      // a beep already fired if the run was past that point before the reload
      beeped60Ref.current = remaining <= 60;
      beeped0Ref.current = remaining <= 0;
      if (remaining <= 0) setFinished(true);
      else if (run.running && run.endAt) {
        setEndAt(run.endAt);
        setRunning(true);
      }
    } else {
      clearKey(RUN_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJSON(PREFS_KEY, { mode, durationMin, weightLb });
  }, [hydrated, mode, durationMin, weightLb]);

  useEffect(() => {
    if (!hydrated) return;
    if (!started || finished) { clearKey(RUN_KEY); return; }
    writeJSON(RUN_KEY, {
      date: localDate(),
      savedAt: Date.now(),
      focus, mode, salt, swaps, durationMin, weightLb, rounds, running, endAt,
      circuitIds: frozenIds || undefined,
      // while running the end timestamp is the source of truth for the clock
      secondsLeft: running ? null : secondsRef.current,
      prBefore: prBeforeRef.current,
    });
  }, [hydrated, started, finished, focus, mode, salt, swaps, durationMin, weightLb, rounds, running, endAt, frozenIds]);

  const baseCircuit = useMemo(() => {
    if (frozenIds && frozenIds.length) {
      const resolved = frozenIds.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean);
      if (resolved.length === frozenIds.length && resolved.length > 0) return resolved;
    }
    return buildCircuit(focus, mode, salt, approved);
  }, [focus, mode, salt, approved, frozenIds]);
  const circuit = useMemo(
    () => baseCircuit.map((ex, i) => (swaps[i] ? EXERCISES.find((e) => e.id === swaps[i]) || ex : ex)),
    [baseCircuit, swaps]
  );

  const approveMovement = (id) => {
    setApproved((cur) => {
      if (cur.includes(id)) return cur;
      const next = [...cur, id];
      writeApproved(next);
      return next;
    });
  };

  const toggleFocus = (key) => {
    if (started) return;
    setSwaps({});
    setFrozenIds(null);
    setFocus((cur) => {
      if (key === "full") return ["full"];
      let next = cur.filter((k) => k !== "full");
      if (next.includes(key)) next = next.filter((k) => k !== key);
      else next = next.length >= 2 ? [next[1], key] : [...next, key];
      return next.length ? next : ["full"];
    });
  };

  const setModeSafe = (m) => {
    if (started) return;
    setMode(m);
    setSwaps({});
    setFrozenIds(null);
  };

  const swapExercise = (idx) => {
    const currentIds = circuit.map((e) => e.id);
    const wantFull = focus.includes("full");
    const otherGroups = new Set(
      circuit.filter((_, i) => i !== idx).map((e) => e.variantGroup).filter(Boolean)
    );
    const tagOk = (e) => (wantFull ? true : e.tags.some((t) => focus.includes(t)));
    const base = poolFor(mode, approved).filter(
      (e) => !currentIds.includes(e.id) && tagOk(e)
    );
    let eligible = base.filter((e) => !(e.variantGroup && otherGroups.has(e.variantGroup)));
    if (!eligible.length) eligible = base;
    if (!eligible.length) return;
    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    setSwaps((s) => ({ ...s, [idx]: pick.id }));
  };

  /* The clock is derived from the end timestamp, never counted down, so locking
     the phone or backgrounding the app can't stall it. The interval only
     re-renders; visibilitychange catches up after iOS froze our timers. */
  useEffect(() => {
    if (!running || endAt == null) return;

    const sync = () => {
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 60 && !beeped60Ref.current) {
        beeped60Ref.current = true;
        playBeeps(1);
      }
      if (remaining <= 0) {
        if (!beeped0Ref.current) {
          beeped0Ref.current = true;
          playBeeps(3);
        }
        setRunning(false);
        setEndAt(null);
        setFinished(true);
      }
    };

    sync();
    const id = setInterval(sync, 250);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running, endAt]);

  /* Keep the screen on while the clock runs, where the browser supports it. */
  useEffect(() => {
    const release = () => {
      try { wakeLockRef.current?.release(); } catch (e) {}
      wakeLockRef.current = null;
    };
    if (!running) { release(); return; }

    let dropped = false;
    const acquire = async () => {
      try {
        if (dropped || wakeLockRef.current || !("wakeLock" in navigator)) return;
        const lock = await navigator.wakeLock.request("screen");
        if (dropped) { lock.release(); return; }
        wakeLockRef.current = lock;
        lock.addEventListener?.("release", () => {
          if (wakeLockRef.current === lock) wakeLockRef.current = null;
        });
      } catch (e) {} // unsupported, or the OS said no — the clock still works
    };

    acquire();
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      dropped = true;
      document.removeEventListener("visibilitychange", onVisible);
      release();
    };
  }, [running]);

  const persistSession = (roundCount, partial) => {
    if (savedRef.current || roundCount <= 0) return;
    savedRef.current = true;
    const elapsedMin = Math.max(1, Math.round((durationMin * 60 - secondsRef.current) / 60));
    const entry = {
      date: localDate(),
      focus: [...focus],
      mode,
      weightLb,
      rounds: roundCount,
      minutes: elapsedMin,
      partial: !!partial,
      exercises: circuit.map((e) => e.name),
    };
    setSessions((prev) => {
      const next = [...prev, entry];
      saveSessions(next);
      return next;
    });
  };

  const mergeSessions = (incoming) => {
    setSessions((prev) => {
      const sig = (s) => [s.date, (s.focus || []).join("+"), s.mode, s.weightLb || "", s.rounds, s.minutes].join("|");
      const seen = new Set(prev.map(sig));
      const merged = [...prev];
      for (const s of incoming) {
        if (s && typeof s === "object" && !seen.has(sig(s))) {
          seen.add(sig(s));
          merged.push(s);
        }
      }
      merged.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      saveSessions(merged);
      return merged;
    });
  };

  useEffect(() => {
    if (finished) persistSession(roundsRef.current, false);
  }, [finished]); // eslint-disable-line

  const changeDuration = (dir) => {
    const i = DURATIONS.indexOf(durationMin);
    const ni = Math.min(DURATIONS.length - 1, Math.max(0, i + dir));
    setDurationMin(DURATIONS[ni]);
    setSecondsLeft(DURATIONS[ni] * 60);
  };

  /* Best rounds at this focus + mode + bell weight. Sessions logged before the
     app tracked weight have no weightLb, so they sit out of weighted PRs. */
  const prKey = [...focus].sort().join("+") + "|" + mode + "|" + weightLb;
  const prRounds = sessions
    .filter((s) => s.weightLb && [...(s.focus || [])].sort().join("+") + "|" + (s.mode || "standard") + "|" + s.weightLb === prKey)
    .reduce((m, s) => Math.max(m, s.rounds || 0), 0);

  const startTimer = () => {
    unlockBeeps();
    // the number to beat, captured before this session gets logged
    prBeforeRef.current = prRounds;
    beeped60Ref.current = false;
    beeped0Ref.current = false;
    // Freeze today's five so approving a pending mid-run can't reshuffle them.
    setFrozenIds(baseCircuit.map((e) => e.id));
    setStarted(true);
    setEndAt(Date.now() + secondsRef.current * 1000);
    setRunning(true);
  };

  const pauseTimer = () => {
    if (endAt != null) setSecondsLeft(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    setEndAt(null);
    setRunning(false);
  };

  const resumeTimer = () => {
    unlockBeeps();
    setEndAt(Date.now() + secondsRef.current * 1000);
    setRunning(true);
  };

  const finishNow = () => {
    setEndAt(null);
    setRunning(false);
    setFinished(true);
  };

  const resetTimer = () => {
    if (started && !finished) persistSession(roundsRef.current, true);
    setRunning(false);
    setEndAt(null);
    setStarted(false);
    setFinished(false);
    setFrozenIds(null);
    savedRef.current = false;
    beeped60Ref.current = false;
    beeped0Ref.current = false;
    setSecondsLeft(durationMin * 60);
    setRounds(0);
  };

  const addRound = () => {
    setRounds((r) => r + 1);
    try {
      circuitTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {}
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const accent = focus.includes("full") || focus.length > 1 ? COLORS.full : FOCUS_META[focus[0]].color;
  const focusLabel = focus.includes("full") ? "Full body" : focus.map((f) => FOCUS_META[f].label).join(" + ");
  const prBefore = started || finished ? prBeforeRef.current : prRounds;
  const newPr = finished && rounds > 0 && rounds > prBefore;
  const lastSessions = [...sessions].slice(-3).reverse();
  const displayFont = "'Big Shoulders Display', 'Arial Narrow', sans-serif";

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.chalk,
      fontFamily: "'Big Shoulders Text', 'Arial Narrow', 'Helvetica Neue', sans-serif",
      display: "flex", justifyContent: "center",
    }}>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { font-family: inherit; cursor: pointer; }
        button:focus-visible { outline: 2px solid ${COLORS.chalk}; outline-offset: 2px; }
        @keyframes pulseAccent { 0%,100% { opacity: 1 } 50% { opacity: .55 } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 560, padding: "20px 16px 160px" }}>
        <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 40, letterSpacing: "0.04em", lineHeight: 1 }}>
              BELLWORK
            </div>
            <div style={{ color: COLORS.chalkDim, fontSize: 16, marginTop: 4 }}>
              One bell. As many rounds as you've got.
            </div>
          </div>
          <button onClick={() => setView((v) => (v === "library" ? "workout" : "library"))}
            style={{
              background: "transparent", border: `1.5px solid ${COLORS.panelEdge}`,
              color: COLORS.chalkDim, borderRadius: 8, padding: "8px 14px",
              fontSize: 14.5, fontWeight: 600, marginTop: 4, whiteSpace: "nowrap",
            }}>
            {view === "library" ? "Back" : "Library"}
          </button>
        </header>

        {view === "library" ? (
          <Library reduced={reduced} approved={approved} onApprove={approveMovement} />
        ) : (
        <>

        {/* mode toggle */}
        <div style={{
          display: "flex", border: `1.5px solid ${COLORS.panelEdge}`, borderRadius: 10,
          overflow: "hidden", marginBottom: 12,
        }}>
          {[["standard", "STANDARD"], ["complex", "COMPLEX"]].map(([key, label]) => {
            const active = mode === key;
            return (
              <button key={key} onClick={() => setModeSafe(key)} aria-pressed={active}
                style={{
                  flex: 1, padding: "10px 8px", border: "none",
                  background: active ? COLORS.chalk : "transparent",
                  color: active ? "#111" : COLORS.chalkDim,
                  fontFamily: displayFont, fontWeight: 800, fontSize: 15, letterSpacing: "0.06em",
                }}>
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          {Object.entries(FOCUS_META).map(([key, meta]) => {
            const active = focus.includes(key);
            return (
              <button key={key} onClick={() => toggleFocus(key)} aria-pressed={active}
                style={{
                  border: `2px solid ${active ? meta.color : COLORS.panelEdge}`,
                  background: active ? meta.color : "transparent",
                  color: active ? "#111" : COLORS.chalkDim,
                  borderRadius: 999, padding: "8px 16px",
                  fontSize: 15.5, fontWeight: 600, letterSpacing: "0.03em",
                  transition: "all .15s ease",
                }}>
                {meta.label}
              </button>
            );
          })}
        </div>
        <div style={{ color: COLORS.chalkDim, fontSize: 14.5, marginBottom: 12 }}>
          {mode === "complex"
            ? "All chained combos. Hybrids punish sloppy reps — cap the set the moment form slips."
            : "Pick up to two, or Full body. Today's circuit is fixed per focus — same picks if you reopen."}
        </div>

        {/* Bell weight is picked before START: the session saves itself the
            moment the clock hits 0, so there is no "after" to ask in. */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          marginBottom: 14, opacity: started ? 0.55 : 1,
        }}>
          <span style={{ color: COLORS.chalkDim, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Bell
          </span>
          {WEIGHTS_LB.map((w) => {
            const active = weightLb === w;
            return (
              <button key={w} onClick={() => setWeightLb(w)} disabled={started} aria-pressed={active}
                style={{
                  border: `2px solid ${active ? COLORS.chalk : COLORS.panelEdge}`,
                  background: active ? COLORS.chalk : "transparent",
                  color: active ? "#111" : COLORS.chalkDim,
                  borderRadius: 999, padding: "7px 12px", minWidth: 46,
                  fontSize: 15, fontWeight: 700,
                }}>
                {w}
              </button>
            );
          })}
          <span style={{ color: COLORS.chalkDim, fontSize: 14, fontWeight: 600 }}>lb</span>
        </div>

        <div style={{
          background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 16,
        }}>
          <button onClick={() => setWarmOpen((o) => !o)}
            style={{
              background: "transparent", border: "none", color: COLORS.chalk,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              width: "100%", padding: 0, fontSize: 15, fontWeight: 600, letterSpacing: "0.04em",
            }}>
            <span style={{ textTransform: "uppercase", fontFamily: displayFont, fontSize: 17 }}>
              2-minute primer
            </span>
            <span style={{ color: COLORS.chalkDim, fontSize: 15 }}>{warmOpen ? "Hide" : "Show"}</span>
          </button>
          {warmOpen && (
            <div style={{ marginTop: 8, color: COLORS.chalkDim, fontSize: 16, lineHeight: 1.7 }}>
              10 halos each way, light bell · 10 bodyweight hip hinges · 5 slow goblet squats, pry your knees out at the bottom · 10 easy swings at half effort. Then start the clock.
            </div>
          )}
        </div>

        <div ref={circuitTopRef} style={{ scrollMarginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontFamily: displayFont, fontWeight: 600, fontSize: 22, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Today · <span style={{ color: accent }}>{focusLabel}</span>
            </div>
            <button onClick={() => { if (started) return; setSalt(String(Math.random())); setSwaps({}); setFrozenIds(null); }}
              style={{
                background: "transparent", border: `1.5px solid ${COLORS.panelEdge}`,
                color: COLORS.chalkDim, borderRadius: 8, padding: "6px 12px", fontSize: 14, fontWeight: 600,
                opacity: started ? 0.4 : 1,
              }}>
              Reshuffle
            </button>
          </div>
          <div style={{ color: COLORS.chalkDim, fontSize: 14.5, marginBottom: 10 }}>
            Loop the circuit for the full clock. Finish all five, tap +1 round.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {circuit.map((ex, i) => {
            const exColor = FOCUS_META[ex.tags.find((t) => focus.includes(t)) || ex.tags[0]].color;
            return (
              <div key={ex.id + i} style={{
                background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`,
                borderRadius: 14, padding: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 21, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {ex.name}
                  </div>
                  <div style={{ color: exColor, fontWeight: 700, fontSize: 21, whiteSpace: "nowrap" }}>
                    {ex.reps}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ color: COLORS.chalkDim, fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {ex.pattern}
                  </span>
                  {ex.twoBell && (
                    <span style={{
                      border: `1px solid ${COLORS.chalkDim}`, color: COLORS.chalkDim,
                      borderRadius: 999, padding: "2px 10px", fontSize: 13.5, fontWeight: 600,
                    }}>
                      2 bells optional
                    </span>
                  )}
                </div>
                {hasPoses(ex) ? (
                  <div style={{ display: "flex", gap: 10 }}>
                    {!ex.frontOnly && (
                      <div style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ textAlign: "center", color: COLORS.chalkDim, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", paddingTop: 6 }}>SIDE</div>
                        <Figure poses={ex.poses} dur={ex.dur} color={exColor} animate={!reduced} bellFlip={ex.bellFlip} />
                      </div>
                    )}
                    <div style={{ flex: ex.frontOnly ? "0 1 62%" : 1, margin: ex.frontOnly ? "0 auto" : 0, background: COLORS.bg, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ textAlign: "center", color: COLORS.chalkDim, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", paddingTop: 6 }}>FRONT</div>
                      <Figure poses={ex.posesF} dur={ex.dur} color={exColor} animate={!reduced} bellFlip={ex.bellFlip} />
                    </div>
                  </div>
                ) : null}
                <div style={{ fontSize: 17, lineHeight: 1.5, marginTop: 10, color: COLORS.chalk }}>
                  {ex.cue}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, marginTop: 6 }}>
                  <div style={{ fontSize: 16, lineHeight: 1.5, color: COLORS.chalkDim }}>
                    <span style={{ fontWeight: 600 }}>Grip:</span> {ex.grip}
                  </div>
                  <button onClick={() => swapExercise(i)}
                    style={{
                      background: "transparent", border: "none", color: COLORS.chalkDim,
                      fontSize: 14, fontWeight: 600, textDecoration: "underline",
                      textUnderlineOffset: 3, padding: 2, whiteSpace: "nowrap",
                    }}>
                    Swap
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {(
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 10 }}>
              <div style={{
                fontFamily: displayFont, fontWeight: 600, fontSize: 17, letterSpacing: "0.06em",
                textTransform: "uppercase", color: COLORS.chalkDim,
              }}>
                Recent sessions
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {sessions.length > 0 && (
                  <button onClick={() => exportSessions(sessions)}
                    style={{
                      background: "transparent", border: "none", color: COLORS.chalkDim,
                      fontSize: 14, fontWeight: 600, textDecoration: "underline",
                      textUnderlineOffset: 3, padding: 2,
                    }}>
                    Save log
                  </button>
                )}
                <button onClick={() => importSessions(mergeSessions)}
                  style={{
                    background: "transparent", border: "none", color: COLORS.chalkDim,
                    fontSize: 14, fontWeight: 600, textDecoration: "underline",
                    textUnderlineOffset: 3, padding: 2,
                  }}>
                  Restore
                </button>
              </div>
            </div>
            {lastSessions.length === 0 && (
              <div style={{ color: COLORS.chalkDim, fontSize: 15.5, paddingBottom: 8 }}>
                No sessions yet. Finish a clock and it lands here.
              </div>
            )}
            {lastSessions.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "8px 2px",
                borderBottom: `1px solid ${COLORS.panelEdge}`, fontSize: 15.5,
              }}>
                <span style={{ color: COLORS.chalkDim }}>
                  {s.date} · {(s.focus || []).map((f) => FOCUS_META[f]?.label || f).join(" + ")}
                  {normalizeMode(s.mode) === "complex" ? " · Complex" : ""}{s.weightLb ? ` · ${s.weightLb} lb` : ""}{s.partial ? " · partial" : ""}
                </span>
                <span style={{ fontWeight: 600 }}>{s.rounds} rounds</span>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </div>

      {/* sticky timer bar */}
      {view !== "library" && (
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(23,24,27,0.97)", borderTop: `1px solid ${COLORS.panelEdge}`,
        backdropFilter: "blur(8px)", display: "flex", justifyContent: "center",
      }}>
        <div style={{
          width: "100%", maxWidth: 560,
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {/* Row 1: clock and score. Row 2: the buttons. Two rows so everything
              still fits, with big targets, on a 375px phone. */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 96 }}>
              {!started && !finished && (
                <button onClick={() => changeDuration(-1)} aria-label="Shorter workout"
                  disabled={durationMin === DURATIONS[0]}
                  style={{
                    background: "transparent", border: `1.5px solid ${COLORS.panelEdge}`,
                    color: COLORS.chalkDim, borderRadius: 8, padding: "6px 10px",
                    fontSize: 17, fontWeight: 600, opacity: durationMin === DURATIONS[0] ? 0.35 : 1,
                  }}>
                  −
                </button>
              )}
              <div>
                <div style={{
                  fontFamily: displayFont, fontWeight: 800, fontSize: 32, lineHeight: 1, letterSpacing: "0.02em",
                  fontVariantNumeric: "tabular-nums",
                  color: finished || (running && secondsLeft <= 60) ? accent : COLORS.chalk,
                }}>
                  {mm}:{ss}
                </div>
                <div style={{ color: COLORS.chalkDim, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>
                  {finished ? "TIME" : running ? "RUNNING" : started ? "PAUSED" : "READY"}
                </div>
              </div>
              {!started && !finished && (
                <button onClick={() => changeDuration(1)} aria-label="Longer workout"
                  disabled={durationMin === DURATIONS[DURATIONS.length - 1]}
                  style={{
                    background: "transparent", border: `1.5px solid ${COLORS.panelEdge}`,
                    color: COLORS.chalkDim, borderRadius: 8, padding: "6px 10px",
                    fontSize: 17, fontWeight: 600,
                    opacity: durationMin === DURATIONS[DURATIONS.length - 1] ? 0.35 : 1,
                  }}>
                  +
                </button>
              )}
            </div>

            <div style={{ flex: 1 }} />

            {!started && !finished ? (
              <button onClick={startTimer}
                style={{
                  background: accent, border: "none", color: "#111",
                  borderRadius: 12, padding: "14px 28px",
                  fontFamily: displayFont, fontWeight: 800, fontSize: 20, letterSpacing: "0.05em",
                }}>
                START
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {newPr && (
                  <span style={{
                    background: accent, color: "#111", borderRadius: 8, padding: "5px 9px",
                    fontFamily: displayFont, fontWeight: 800, fontSize: 16,
                    letterSpacing: "0.06em", whiteSpace: "nowrap",
                  }}>
                    NEW PR
                  </span>
                )}
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: displayFont, fontWeight: 800, fontSize: 28, lineHeight: 1,
                    color: finished ? accent : COLORS.chalk,
                  }}>
                    {rounds}
                  </div>
                  <div style={{ color: COLORS.chalkDim, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    ROUNDS{prBefore > 0 ? (newPr ? ` · WAS ${prBefore}` : ` · PR ${prBefore}`) : ""}
                  </div>
                </div>
              </div>
            )}
          </div>

          {(started || finished) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {finished ? (
                <button onClick={resetTimer}
                  style={{
                    flex: 1, border: `2px solid ${accent}`, background: "transparent", color: COLORS.chalk,
                    borderRadius: 12, padding: "14px 22px",
                    fontFamily: displayFont, fontWeight: 800, fontSize: 18, letterSpacing: "0.04em",
                  }}>
                  RESET
                </button>
              ) : (
                <>
                  <button onClick={running ? pauseTimer : resumeTimer}
                    style={{
                      flex: "1 1 0", minWidth: 0,
                      border: `2px solid ${COLORS.panelEdge}`, background: "transparent",
                      color: COLORS.chalkDim, borderRadius: 10, padding: "14px 6px",
                      fontSize: 15, fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                    {running ? "Pause" : "Resume"}
                  </button>
                  {!running && (
                    <button onClick={finishNow}
                      style={{
                        flex: "1 1 0", minWidth: 0,
                        border: `2px solid ${accent}`, background: "transparent",
                        color: COLORS.chalk, borderRadius: 10, padding: "14px 6px",
                        fontSize: 15, fontWeight: 600, whiteSpace: "nowrap",
                      }}>
                      Finish
                    </button>
                  )}
                  <button onClick={() => setRounds((r) => Math.max(0, r - 1))} aria-label="Undo round"
                    style={{
                      flex: "0 0 54px",
                      background: "transparent", border: `1.5px solid ${COLORS.panelEdge}`,
                      color: COLORS.chalkDim, borderRadius: 10, padding: "14px 6px", fontSize: 15, fontWeight: 600,
                    }}>
                    –1
                  </button>
                  <button onClick={addRound}
                    style={{
                      flex: "1.6 1 0", minWidth: 0,
                      background: accent, border: "none", color: "#111",
                      borderRadius: 12, padding: "14px 8px",
                      fontFamily: displayFont, fontWeight: 800, fontSize: 19, letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}>
                    +1 ROUND
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
