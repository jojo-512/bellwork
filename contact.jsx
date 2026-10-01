import { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { EXERCISES } from "./movements.js";
import { Figure } from "./bellwork.jsx";

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

function FrameRow({ label, poses, color, bellFlip }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px", color: COLORS.chalkDim }}>
        {label}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {poses.map((pose, i) => (
          <div key={i} data-frame={i + 1} data-view={label.toLowerCase()} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 12px 0" }}>
              <span style={{ fontFamily: '"Big Shoulders Display", sans-serif', fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{i + 1}</span>
              <span style={{ color: COLORS.chalkDim, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
            </div>
            <div style={{ height: 300, background: COLORS.bg }}>
              <Figure poses={[pose]} dur={1} color={color} animate={false} bellFlip={bellFlip} />
            </div>
          </div>
        ))}
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

function Picker({ missing }) {
  const pending = EXERCISES.filter((e) => e.pending);
  const rest = EXERCISES.filter((e) => !e.pending);
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
      <Group title="Pending" items={pending} />
      <Group title="In rotation" items={rest} />
    </div>
  );
}

function Group({ title, items }) {
  if (!items.length) return null;
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.chalkDim }}>{title}</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((ex) => (
          <li key={ex.id} style={{ borderTop: `1px solid ${COLORS.panelEdge}` }}>
            <a href={`?id=${ex.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", color: COLORS.chalk, textDecoration: "none", fontSize: 18 }}>
              <span>{ex.name}</span>
              <span style={{ color: COLORS.chalkDim }}>{ex.id}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  const id = useMemo(() => new URLSearchParams(window.location.search).get("id") || "", []);
  const ex = EXERCISES.find((e) => e.id === id);
  useEffect(() => {
    document.title = ex ? `${ex.name} · contact sheet` : "Bellwork contact sheet";
  }, [ex]);
  if (!id || !ex) return <Picker missing={id || null} />;
  return <Sheet ex={ex} />;
}

createRoot(document.getElementById("root")).render(<App />);
