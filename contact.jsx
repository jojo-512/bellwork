import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { EXERCISES } from "./movements.js";
import { Figure } from "./bellwork.jsx";
import { build, solve, draw, checkRig, validateRig, VIEWS, VIEW_LABELS } from "./rig.js";

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
  warn: "#E0AE1E",
};

/* The open batch, listed first in the menu so Joe reviews only these.
   Update when a batch opens or merges. */
const TO_REVIEW = ["situp_press", "snatch_lunge", "renegade", "bottoms_up_press", "squat_pressout", "clean_carry", "snatch_oh_carry"];
const reviewItems = () => TO_REVIEW.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean);
const notReview = (e) => !TO_REVIEW.includes(e.id);

function colorFor(ex) {
  const tag = ex && ex.tags && ex.tags[0];
  return COLORS[tag] || COLORS.chalk;
}

function framesOf(ex) {
  if (!ex) return { side: [], front: [], frontOnly: false };
  const frontOnly = !!ex.frontOnly;
  const side = !frontOnly && Array.isArray(ex.poses) ? ex.poses : [];
  const front = Array.isArray(ex.posesF) ? ex.posesF : [];
  return { side, front, frontOnly };
}

function Sheet({ ex }) {
  if (ex.rig) return <RigSheet ex={ex} />;
  const color = colorFor(ex);
  const { side, front, frontOnly } = framesOf(ex);
  const hasFigure = side.length > 0 || front.length > 0;
  const n = Math.max(side.length, front.length);

  return (
    <article data-contact-sheet={ex.id} style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px 64px" }}>
      <p style={{ margin: "0 0 8px", color: COLORS.chalkDim, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>
        Contact sheet · review only
      </p>
      <h1 style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontWeight: 800, fontSize: 42, lineHeight: 0.95, margin: "0 0 10px" }}>
        {ex.name}
      </h1>
      <p style={{ margin: "0 0 14px", color: COLORS.chalkDim, fontSize: 18 }}>
        <span style={{ color: COLORS.chalk }}>{ex.id}</span>
        {" · "}{ex.pattern}
        {" · "}{ex.reps}
        {ex.pending ? <span style={{ color: COLORS.warn }}> · pending</span> : null}
        {frontOnly ? " · front only" : null}
        {hasFigure ? ` · ${n} frame${n === 1 ? "" : "s"}` : null}
      </p>
      <p style={{ margin: "0 0 6px", fontSize: 18, lineHeight: 1.45, maxWidth: 720 }}>{ex.cue}</p>
      <p style={{ margin: "0 0 28px", color: COLORS.chalkDim, fontSize: 16, lineHeight: 1.4, maxWidth: 720 }}>
        Grip: {ex.grip}
      </p>

      {!hasFigure ? (
        <p style={{ padding: 18, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 12, background: COLORS.panel, color: COLORS.chalkDim }}>
          No figure on this card. It ships as name, cue, and grip only.
        </p>
      ) : (
        <>
          {side.length > 0 && <FrameRow label="Side" poses={side} color={color} bellFlip={ex.bellFlip} />}
          {front.length > 0 && <FrameRow label="Front" poses={front} color={color} bellFlip={ex.bellFlip} />}
          <LoopRow side={side} front={front} dur={ex.dur || 2} color={color} bellFlip={ex.bellFlip} />
        </>
      )}
    </article>
  );
}

/* ---------------- Rig mode: the review page for movements on the rig ----------------
   Side, front and three-quarter playing, one still per phase in each view, the phase data
   and the check results. Views the workout card will show are marked "on card". */

const H2 = { fontFamily: '"Big Shoulders Display", sans-serif', fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px", color: COLORS.chalkDim };
const ALL_VIEWS = Object.keys(VIEWS);

// Size a canvas for its CSS width at up to 2× pixel density, drawing into a 200×200 box.
function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 160;
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr); }
  const ctx = cv.getContext("2d");
  ctx.setTransform(cv.width / 200, 0, 0, cv.height / 200, 0, 0);
  return ctx;
}

function Still({ ex, built, at, view, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    const paint = () => draw(fitCanvas(cv), solve(built.smp.at(at).state, built.m), view, color, ex.rig.frame);
    paint();
    window.addEventListener("resize", paint);
    return () => window.removeEventListener("resize", paint);
  }, [ex, built, at, view, color]);
  return <canvas ref={ref} style={{ width: "100%", aspectRatio: "1", display: "block" }} />;
}

function Btn({ on, children, ...rest }) {
  return (
    <button aria-pressed={on} {...rest} style={{
      background: on ? COLORS.chalk : "transparent", color: on ? COLORS.bg : COLORS.chalk,
      border: `1px solid ${on ? COLORS.chalk : COLORS.panelEdge}`, borderRadius: 999, padding: "6px 14px",
      font: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer",
    }}>{children}</button>
  );
}

function RigSheet({ ex }) {
  const color = colorFor(ex);
  const rig = ex.rig;
  const reduced = useMemo(() => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  const [side, setSide] = useState("R");
  const [playing, setPlaying] = useState(!reduced);
  const [speed, setSpeed] = useState(1);
  const built = useMemo(() => ({ R: build(ex, "R"), L: build(ex, "L") }), [ex]);
  const cur = built[side];
  const canvases = useRef({});
  const phaseRef = useRef(null), scrubRef = useRef(null);
  const clock = useRef(0), last = useRef(null);
  const live = useRef({ playing, speed, cur });
  live.current = { playing, speed, cur };
  const shape = useMemo(() => validateRig(ex), [ex]);
  const issues = useMemo(() => (shape.length ? [] : checkRig(ex)), [ex, shape]);

  useEffect(() => {
    let raf;
    const frame = (ts) => {
      const { playing: on, speed: sp, cur: c } = live.current;
      if (last.current !== null && on) clock.current += ((ts - last.current) / 1000) * sp;
      last.current = ts;
      const total = c.smp.total, u = ((clock.current % total) + total) % total;
      const { state, phase } = c.smp.at(u), r = solve(state, c.m);
      for (const w of ALL_VIEWS) { const cv = canvases.current[w]; if (cv) draw(fitCanvas(cv), r, w, color, rig.frame); }
      if (phaseRef.current) phaseRef.current.textContent = phase;
      if (scrubRef.current && on) scrubRef.current.value = String(Math.round((u / total) * 1000));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [color, rig]);

  const sides = rig.sides === "alternate" ? "right, then left (alternating)" : "right side on the card";
  return (
    <article data-contact-sheet={ex.id} data-rig="1" style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 16px 64px" }}>
      <p style={{ margin: "0 0 8px", color: COLORS.chalkDim, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>
        Contact sheet · rig · review only
      </p>
      <h1 style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontWeight: 800, fontSize: 42, lineHeight: 0.95, margin: "0 0 10px" }}>{ex.name}</h1>
      <p style={{ margin: "0 0 14px", color: COLORS.chalkDim, fontSize: 18 }}>
        <span style={{ color: COLORS.chalk }}>{ex.id}</span>{" · "}{ex.pattern}{" · "}{ex.reps}
        {ex.pending ? <span style={{ color: COLORS.warn }}> · pending</span> : null}
        {` · ${rig.phases.length} phases · ${ex.dur}s a rep · ${sides}`}
      </p>
      <p style={{ margin: "0 0 6px", fontSize: 18, lineHeight: 1.45, maxWidth: 720 }}>{ex.cue}</p>
      <p style={{ margin: "0 0 20px", color: COLORS.chalkDim, fontSize: 16, lineHeight: 1.4, maxWidth: 720 }}>Grip: {ex.grip}</p>

      <section data-checks style={{ marginBottom: 20, padding: "12px 14px", border: `1px solid ${shape.length || issues.length ? COLORS.warn : COLORS.panelEdge}`, borderRadius: 12, background: COLORS.panel }}>
        {shape.length || issues.length ? (
          <>
            <div style={{ color: COLORS.warn, fontWeight: 600, marginBottom: 6 }}>Checks: {shape.length + issues.length} to fix</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>{[...shape, ...issues].map((m) => <li key={m}>{m}</li>)}</ul>
          </>
        ) : (
          <div><span style={{ fontWeight: 600 }}>Checks pass</span><span style={{ color: COLORS.chalkDim }}> · reach, lockout, floor, bell clearance, joint speed, bend direction, hand-offs, framing, both sides</span></div>
        )}
      </section>

      <div style={{ position: "sticky", top: 0, zIndex: 2, background: COLORS.bg, padding: "8px 0 10px", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Btn on={playing} onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</Btn>
        {[1, 0.5, 0.25].map((s) => <Btn key={s} on={speed === s} onClick={() => setSpeed(s)}>{s === 1 ? "1×" : s === 0.5 ? "½×" : "¼×"}</Btn>)}
        {rig.sides !== "alternate" && ["R", "L"].map((k) => <Btn key={k} on={side === k} onClick={() => setSide(k)}>{k === "R" ? "Right hand" : "Left hand"}</Btn>)}
        <input ref={scrubRef} type="range" min="0" max="1000" defaultValue="0" aria-label="Scrub"
          onInput={(e) => { setPlaying(false); clock.current = (e.target.value / 1000) * cur.smp.total; }}
          style={{ flex: "1 1 200px", minWidth: 0 }} />
        <span ref={phaseRef} style={{ minWidth: 120, fontWeight: 600 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 28 }}>
        {ALL_VIEWS.map((w) => (
          <div key={w} data-view={w} style={{ background: COLORS.panel, border: `1px solid ${rig.views.includes(w) ? COLORS.chalkDim : COLORS.panelEdge}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px 0", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span style={{ color: COLORS.chalkDim }}>{VIEW_LABELS[w]}</span>
              {rig.views.includes(w) ? <span>On card</span> : null}
            </div>
            <canvas ref={(el) => { canvases.current[w] = el; }} style={{ width: "100%", aspectRatio: "1", display: "block", background: COLORS.bg }} />
          </div>
        ))}
      </div>

      {ALL_VIEWS.map((w) => (
        <section key={w} style={{ marginBottom: 24 }}>
          <h2 style={H2}>{VIEW_LABELS[w]} · each phase{rig.views.includes(w) ? " · on card" : ""}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
            {cur.cycle.map((p, i) => (
              <div key={i} data-phase={i + 1} data-view={w} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "6px 8px 0", fontSize: 13, lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 800 }}>{i + 1}</span> <span style={{ color: COLORS.chalkDim }}>{p.name}</span>
                </div>
                <Still ex={ex} built={cur} at={cur.smp.starts[i]} view={w} color={color} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section style={{ marginBottom: 24 }}>
        <h2 style={H2}>Phases</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 15, minWidth: 560 }}>
            <thead><tr style={{ color: COLORS.chalkDim, textAlign: "left" }}>
              {["#", "Phase", "Time", "Body", "Bell hand", "Free hand", "Elbow", "Bell", "Lock"].map((h) => <th key={h} style={{ padding: "4px 10px 4px 0", fontWeight: 600 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rig.phases.map((p, i) => {
                const f = (x) => (x == null ? "" : Array.isArray(x) ? x.join(", ") : String(x));
                const body = p.body ? p.body + (p.pelvis || p.lean != null ? " *" : "") : `pelvis ${f(p.pelvis)} · lean ${p.lean}`;
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.panelEdge}` }}>
                    <td style={{ padding: "4px 10px 4px 0" }}>{i + 1}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{p.name}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{p.t}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{body}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{f(rig.on === "L" ? p.handL : p.handR) || "thigh"}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{f(rig.on === "L" ? p.handR : p.handL) || "thigh"}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{f(rig.on === "L" ? p.elL : p.elR) || "free"}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{f(p.bell) || "hanging"}{p.on ? ` · ${p.on}` : ""}</td>
                    <td style={{ padding: "4px 10px 4px 0" }}>{f(p.lock)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ color: COLORS.chalkDim, fontSize: 15 }}>Named values come from blocks.js; numbers are meters (x forward, y up, z right). * a block with overrides.</p>
      </section>

      {Array.isArray(ex.poses) && ex.poses.length > 1 ? (
        <section>
          <p style={{ color: COLORS.chalkDim, fontSize: 16, margin: "0 0 10px" }}>Before: the figure the app shows today, for comparison.</p>
          <LoopRow side={ex.frontOnly ? [] : ex.poses} front={ex.posesF || []} dur={ex.dur || 2} color={color} bellFlip={ex.bellFlip} />
        </section>
      ) : null}
    </article>
  );
}

function poseNote(pose) {
  const parts = [];
  if (pose.hold) parts.push(`hold ${pose.hold}`);
  if (pose.t != null) parts.push(`t ${pose.t}`);
  return parts.join(" · ");
}

function FrameRow({ label, poses, color, bellFlip }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px", color: COLORS.chalkDim }}>
        {label}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {poses.map((pose, i) => {
          const note = poseNote(pose);
          return (
          <div key={i} data-frame={i + 1} data-view={label.toLowerCase()} data-hold={pose.hold || undefined} data-t={pose.t != null ? String(pose.t) : undefined} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, padding: "8px 12px 0" }}>
              <span style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{i + 1}</span>
              <span style={{ color: COLORS.chalkDim, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "right" }}>{note ? `${label} · ${note}` : label}</span>
            </div>
            <div style={{ height: 300, background: COLORS.bg }}>
              <Figure poses={[pose]} dur={1} color={color} animate={false} bellFlip={bellFlip} />
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

function LoopRow({ side, front, dur, color, bellFlip }) {
  const cells = [];
  if (side.length > 1) cells.push({ label: "Side loop", poses: side });
  if (front.length > 1) cells.push({ label: "Front loop", poses: front });
  if (!cells.length) return null;
  return (
    <section>
      <h2 style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px", color: COLORS.chalkDim }}>
        Loop
      </h2>
      <div className="loop-grid" style={cells.length < 2 ? { gridTemplateColumns: "1fr" } : undefined}>
        {cells.map((cell) => (
          <div key={cell.label} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px 0", color: COLORS.chalkDim, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>{cell.label}</div>
            <div style={{ height: 240, background: COLORS.bg }}>
              <Figure poses={cell.poses} dur={dur} color={color} animate bellFlip={bellFlip} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Picker({ missing, onPick }) {
  const review = reviewItems();
  const onRig = EXERCISES.filter((e) => e.rig && notReview(e));
  const pending = EXERCISES.filter((e) => e.pending && !e.rig && notReview(e));
  const rest = EXERCISES.filter((e) => !e.pending && !e.rig && notReview(e));
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 64px" }}>
      <p style={{ margin: "0 0 8px", color: COLORS.chalkDim, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 13, fontWeight: 600 }}>
        Contact sheet · review only
      </p>
      <h1 style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontWeight: 800, fontSize: 40, margin: "0 0 12px" }}>
        {missing ? `No movement “${missing}”` : "Pick a movement"}
      </h1>
      <p style={{ color: COLORS.chalkDim, fontSize: 18, lineHeight: 1.45, marginTop: 0 }}>
        Open one lift with <span style={{ color: COLORS.chalk }}>?id=swing_high_pull</span>. This page is not the workout.
      </p>
      <Group title="To review" items={review} onPick={onPick} />
      <Group title="On the rig" items={onRig} onPick={onPick} />
      <Group title="Pending" items={pending} onPick={onPick} />
      <Group title="In rotation" items={rest} onPick={onPick} />
    </div>
  );
}

function Group({ title, items, onPick }) {
  if (!items.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.chalkDim }}>{title}</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((ex) => (
          <li key={ex.id} style={{ borderTop: `1px solid ${COLORS.panelEdge}` }}>
            <a href={`?id=${ex.id}`} onClick={(e) => { e.preventDefault(); onPick(ex.id); }} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", color: COLORS.chalk, textDecoration: "none", fontSize: 18 }}>
              <span>{ex.name}</span>
              <span style={{ color: COLORS.chalkDim }}>{ex.id}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Movement switcher at the top of every sheet. It switches in place, so it also works where
   the page can't navigate to a new address (the published review page). */
function Switcher({ id, onPick }) {
  const review = reviewItems();
  const onRig = EXERCISES.filter((e) => e.rig && notReview(e));
  const rest = EXERCISES.filter((e) => !e.rig && notReview(e));
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 20px 0" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, color: COLORS.chalkDim, fontSize: 15 }}>
        Movement
        <select value={id} onChange={(e) => onPick(e.target.value)}
          style={{ flex: "0 1 360px", minWidth: 0, background: COLORS.panel, color: COLORS.chalk, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 8, padding: "8px 10px", fontSize: 16 }}>
          {!id && <option value="">Pick a movement</option>}
          {review.length > 0 && <optgroup label="To review">{review.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup>}
          <optgroup label="On the rig">{onRig.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup>
          <optgroup label="Old figures">{rest.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</optgroup>
        </select>
      </label>
    </div>
  );
}

function App() {
  const [id, setId] = useState(() => new URLSearchParams(window.location.search).get("id") || "");
  const ex = EXERCISES.find((e) => e.id === id);
  const pick = (next) => {
    setId(next);
    window.scrollTo(0, 0);
    try { window.history.replaceState(null, "", `?id=${next}`); } catch (e) {}
  };
  useEffect(() => {
    document.title = ex ? `${ex.name} · contact sheet` : "Bellwork contact sheet";
  }, [ex]);
  if (!id || !ex) return <Picker missing={id || null} onPick={pick} />;
  return (
    <>
      <Switcher id={id} onPick={pick} />
      <Sheet key={id} ex={ex} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
