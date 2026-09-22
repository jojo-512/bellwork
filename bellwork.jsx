import { useState, useEffect, useRef, useMemo } from "react";

/* ============================================================
   BELLWORK v4 — 20-minute kettlebell AMRAP generator
   - Standard mode: 28 single movements
   - Advanced mode: all-hybrid pool (16 chained combos)
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

const STANDARD = [
  {
    id: "swing", name: "Kettlebell swing", tags: ["lower", "full"], pattern: "Hinge",
    reps: "15 reps", twoBell: true, dur: 1.5,
    cue: "Hips back, snap forward. Arms are just ropes — the hips throw the bell.",
    grip: "Both hands hooked on the handle, thumbs loose.",
    poses: [S_HINGE, S_SWTOP],
    posesF: [
      FS({ hip: [100, 118], sh: [100, 82], elR: [108, 104], haR: [104, 126], elL: [92, 104], haL: [96, 126], knR: [112, 148], knL: [88, 148], bell: [100, 134] }),
      FS({ elR: [110, 76], haR: [104, 82], elL: [90, 76], haL: [96, 82], bell: [100, 90] }),
    ],
  },
  {
    id: "goblet_squat", name: "Goblet squat", tags: ["lower"], pattern: "Squat",
    reps: "10 reps", twoBell: true, dur: 1.8,
    cue: "Bell tight to chest, elbows track inside knees, stand tall through the heels.",
    grip: "Hold the horns (sides of the handle), bell hanging below your hands.",
    poses: [S_GOBLET, S_SQUAT],
    posesF: [F_GOBLET, F_SQUAT],
  },
  {
    id: "ohp", name: "Overhead press", tags: ["upper"], pattern: "Push",
    reps: "8 / side", twoBell: true, dur: 1.7,
    cue: "Ribs down, glutes tight. Press to a locked-out arm by your ear — no lean-back.",
    grip: "Rack grip — handle diagonal across the palm, bell resting on the back of the forearm.",
    poses: [S_RACK, P([100, 106], [100, 68], [103, 50], [102, 32], [100, 141], [100, 176], { bell: [106, 26] })],
    posesF: [F_RACK, F_OH],
  },
  {
    id: "push_press", name: "Push press", tags: ["upper", "full"], pattern: "Push",
    reps: "8 / side", twoBell: true, dur: 1.9,
    cue: "Shallow knee dip, drive up, let the legs launch the bell past the sticking point.",
    grip: "Rack grip — bell on the forearm, wrist straight, knuckles to the ceiling at lockout.",
    poses: [
      S_RACK,
      P([100, 120], [100, 84], [110, 100], [110, 84], [106, 148], [100, 176], { bell: [115, 80] }),
      S_OH,
    ],
    posesF: [
      F_RACK,
      FS({ hip: [100, 118], sh: [100, 80], elR: [114, 96], haR: [110, 80], knR: [112, 148], knL: [88, 148], bell: [113, 74] }),
      F_OH,
    ],
  },
  {
    id: "row", name: "Bent-over row", tags: ["upper"], pattern: "Pull",
    reps: "10 / side", twoBell: true, dur: 1.5,
    cue: "Flat back, pull the bell to your hip pocket, squeeze the shoulder blade.",
    grip: "One hand on the handle, knuckles down, wrist neutral.",
    poses: [
      P([94, 116], [128, 92], [132, 112], [136, 132], [102, 148], [100, 176], { bell: [136, 138] }),
      P([94, 116], [128, 92], [116, 102], [122, 114], [102, 148], [100, 176], { bell: [122, 120] }),
    ],
    posesF: [
      FS({ sh: [100, 82], hip: [100, 112], elR: [114, 100], haR: [114, 122], knR: [108, 144], knL: [92, 144], bell: [114, 128] }),
      FS({ sh: [100, 82], hip: [100, 112], elR: [124, 94], haR: [112, 100], knR: [108, 144], knL: [92, 144], bell: [112, 106] }),
    ],
  },
  {
    id: "gorilla_row", name: "Gorilla row", tags: ["upper"], pattern: "Pull",
    reps: "8 / side", twoBell: true, dur: 1.6,
    cue: "Deep hinge, bell on the floor between your feet. Row to the hip, switch hands each rep.",
    grip: "Handle grip, alternating hands rep to rep. Free hand can brace on your knee.",
    poses: [
      P([92, 122], [126, 102], [130, 128], [130, 152], [102, 150], [100, 176], { bell: [130, 160] }),
      P([92, 122], [126, 102], [112, 110], [118, 122], [102, 150], [100, 176], { bell: [118, 128] }),
    ],
    posesF: [
      FS({ sh: [100, 88], hip: [100, 116], elR: [106, 130], haR: [104, 150], elL: [94, 130], haL: [96, 150], knR: [112, 148], knL: [88, 148], bell: [100, 158] }),
      FS({ sh: [100, 88], hip: [100, 116], elR: [120, 106], haR: [110, 114], elL: [94, 130], haL: [96, 150], knR: [112, 148], knL: [88, 148], bell: [108, 120] }),
    ],
  },
  {
    id: "high_pull", name: "High pull", tags: ["upper", "full"], pattern: "Pull",
    reps: "12 reps", dur: 1.4,
    cue: "Hip snap first, then elbow high and outside. Bell floats to chin height.",
    grip: "Both hands on the handle, loose hook grip.",
    poses: [
      P([96, 120], [122, 96], [116, 116], [106, 136], [104, 150], [100, 176], { bell: [102, 144] }),
      P([100, 104], [100, 68], [116, 62], [104, 70], [100, 141], [100, 176], { bell: [104, 78] }),
    ],
    posesF: [
      FS({ hip: [100, 114], sh: [100, 78], elR: [108, 100], haR: [102, 124], knR: [110, 146], knL: [90, 146], bell: [100, 132] }),
      FS({ elR: [126, 64], haR: [108, 68], bell: [106, 76] }),
    ],
  },
  {
    id: "floor_press", name: "Floor press", tags: ["upper"], pattern: "Push",
    reps: "10 / side", twoBell: true, dur: 1.7,
    cue: "Lying down, elbow stops at the floor, press straight up over the chest.",
    grip: "Rack grip — bell rests on the forearm, wrist straight, press from the chest.",
    poses: [
      P([104, 162], [66, 162], [70, 144], [68, 128], [126, 138], [140, 162], { bell: [70, 121], head: [50, 158] }),
      P([104, 162], [66, 162], [67, 138], [66, 104], [126, 138], [140, 162], { bell: [68, 97], head: [50, 158] }),
    ],
    posesF: [
      { hip: [100, 164], sh: [100, 156], head: [100, 142], knR: [112, 136], anR: [112, 168], knL: [88, 136], anL: [88, 168], elR: [120, 142], haR: [120, 118], bell: [120, 110] },
      { hip: [100, 164], sh: [100, 156], head: [100, 142], knR: [112, 136], anR: [112, 168], knL: [88, 136], anL: [88, 168], elR: [120, 128], haR: [120, 98], bell: [120, 90] },
    ],
  },
  {
    id: "tall_kneel_press", name: "Tall-kneeling press", tags: ["upper", "core"], pattern: "Push",
    reps: "8 / side", dur: 1.8,
    cue: "Both knees down, glutes squeezed, press without leaning. Kills the cheat.",
    grip: "Rack grip — handle diagonal in the palm, bell on the forearm.",
    poses: [
      P([100, 122], [100, 84], [110, 100], [110, 86], [100, 172], [134, 172], { bell: [115, 82] }),
      P([100, 122], [100, 84], [103, 64], [102, 46], [100, 172], [134, 172], { bell: [106, 40] }),
    ],
    posesF: [
      FS({ hip: [100, 124], sh: [100, 86], elR: [114, 102], haR: [110, 86], elL: [88, 104], haL: [86, 120], knR: [110, 170], anR: [112, 174], knL: [90, 170], anL: [88, 174], bell: [113, 80] }),
      FS({ hip: [100, 124], sh: [100, 86], elR: [110, 64], haR: [108, 44], elL: [88, 104], haL: [86, 120], knR: [110, 170], anR: [112, 174], knL: [90, 170], anL: [88, 174], bell: [110, 38] }),
    ],
  },
  {
    id: "pushup_on_bell", name: "Push-up on the bell", tags: ["upper"], pattern: "Push",
    reps: "10 reps", dur: 1.7,
    cue: "Bell dead-center under your chest. Unstable on purpose — brace hard.",
    grip: "Both hands stacked on the handle, wrists locked straight.",
    poses: [
      P([116, 148], [74, 136], [74, 152], [74, 166], [140, 160], [162, 174], { bell: [74, 168], head: [62, 124] }),
      P([116, 156], [74, 150], [62, 156], [72, 166], [140, 162], [162, 174], { bell: [74, 168], head: [60, 140] }),
    ],
    posesF: [
      { hip: [100, 150], sh: [100, 136], head: [100, 118], elR: [114, 150], haR: [104, 164], elL: [86, 150], haL: [96, 164], knR: [106, 150], anR: [108, 158], knL: [94, 150], anL: [92, 158], bell: [100, 166] },
      { hip: [100, 154], sh: [100, 148], head: [100, 134], elR: [120, 152], haR: [104, 164], elL: [80, 152], haL: [96, 164], knR: [106, 152], anR: [108, 158], knL: [94, 152], anL: [92, 158], bell: [100, 166] },
    ],
  },
  {
    id: "halo", name: "Halo", tags: ["upper", "core"], pattern: "Rotation",
    reps: "8 / dir", dur: 2.4,
    cue: "Bell orbits the head, ribs stay stacked. Small circles, no arching.",
    grip: "Bell upside down — hands on the horns, ball on top.",
    poses: [
      P([100, 106], [100, 68], [112, 60], [112, 44], [100, 141], [100, 176], { bell: [116, 40] }),
      P([100, 106], [100, 68], [100, 52], [98, 30], [100, 141], [100, 176], { bell: [98, 24] }),
      P([100, 106], [100, 68], [88, 58], [84, 42], [100, 141], [100, 176], { bell: [80, 38] }),
      P([100, 106], [100, 68], [104, 62], [106, 50], [100, 141], [100, 176], { bell: [108, 48] }),
    ],
    posesF: [
      FS({ elR: [114, 58], haR: [110, 44], elL: [92, 64], haL: [96, 52], bell: [112, 40] }),
      FS({ elR: [106, 48], haR: [100, 32], elL: [94, 48], haL: [98, 34], bell: [100, 26] }),
      FS({ elR: [88, 58], haR: [88, 44], elL: [108, 62], haL: [102, 50], bell: [86, 40] }),
      FS({ elR: [104, 64], haR: [102, 52], elL: [96, 64], haL: [98, 54], bell: [104, 48] }),
    ],
  },
  {
    id: "rev_lunge", name: "Reverse lunge", tags: ["lower"], pattern: "Lunge",
    reps: "8 / side", twoBell: true, dur: 1.9,
    cue: "Step back, drop the rear knee, drive through the front heel to stand.",
    grip: "Goblet grip at the chest — hands on the horns.",
    poses: [
      P([100, 106], [100, 68], [112, 84], [114, 72], [100, 141], [100, 176], { bell: [119, 72], kn2: [100, 141], an2: [100, 176] }),
      P([98, 130], [100, 92], [112, 108], [114, 96], [112, 150], [112, 176], { bell: [119, 96], kn2: [80, 162], an2: [66, 176] }),
    ],
    posesF: [F_GOBLET, F_LUNGE],
  },
  {
    id: "lateral_lunge", name: "Lateral lunge", tags: ["lower"], pattern: "Lunge",
    reps: "8 / side", dur: 1.9,
    cue: "Big step sideways, sit into that hip, other leg stays straight. Push back to center.",
    grip: "Goblet grip at the chest — hands on the horns.",
    poses: [
      S_GOBLET,
      P([96, 126], [102, 90], [114, 106], [116, 94], [112, 152], [118, 176], { bell: [121, 94], kn2: [80, 146], an2: [70, 176] }),
    ],
    posesF: [
      F_GOBLET,
      FS({ hip: [116, 134], sh: [108, 96], elR: [122, 114], haR: [114, 104], elL: [94, 114], haL: [102, 104], knR: [136, 152], anR: [142, 176], knL: [93, 153], anL: [70, 176], bell: [108, 102] }),
    ],
  },
  {
    id: "rdl", name: "Romanian deadlift", tags: ["lower"], pattern: "Hinge",
    reps: "12 reps", twoBell: true, dur: 1.9,
    cue: "Soft knees, push the hips back until the hamstrings bite. Bell rides the legs.",
    grip: "Both hands on the handle, bell hanging in front of your thighs.",
    poses: [
      P([100, 106], [100, 68], [104, 88], [106, 108], [100, 141], [100, 176], { bell: [106, 115] }),
      P([90, 118], [126, 96], [128, 116], [122, 142], [98, 150], [100, 176], { bell: [122, 149] }),
    ],
    posesF: [
      FS({ elR: [106, 90], haR: [104, 110], elL: [94, 90], haL: [96, 110], bell: [100, 118] }),
      FS({ sh: [100, 88], hip: [100, 114], elR: [106, 110], haR: [104, 138], elL: [94, 110], haL: [96, 138], knR: [108, 146], knL: [92, 146], bell: [100, 146] }),
    ],
  },
  {
    id: "single_leg_rdl", name: "Single-leg RDL", tags: ["lower"], pattern: "Hinge",
    reps: "6 / side", dur: 2.2,
    cue: "Hinge on one leg, back leg reaches behind like a counterweight. Slow beats sloppy.",
    grip: "Handle grip in the hand opposite the standing leg.",
    poses: [
      P([100, 106], [100, 68], [104, 88], [106, 108], [100, 141], [100, 176], { bell: [106, 115], kn2: [100, 141], an2: [100, 176] }),
      P([100, 112], [132, 100], [130, 120], [124, 144], [100, 144], [100, 176], { bell: [124, 151], kn2: [76, 118], an2: [54, 122] }),
    ],
    posesF: [
      FS({ elR: [106, 90], haR: [104, 110], elL: [94, 90], haL: [96, 110], bell: [100, 118] }),
      FS({ sh: [100, 90], hip: [100, 116], elR: [106, 114], haR: [102, 138], elL: [94, 114], haL: [98, 138], knR: [104, 148], anR: [104, 176], knL: [92, 138], anL: [90, 158], bell: [100, 146] }),
    ],
  },
  {
    id: "sumo_deadlift", name: "Sumo deadlift", tags: ["lower"], pattern: "Hinge",
    reps: "12 reps", dur: 1.7,
    cue: "Wide stance, bell between your feet. Chest up, drive the floor away.",
    grip: "Both hands on the handle between your feet.",
    poses: [
      P([96, 130], [118, 102], [118, 126], [112, 150], [110, 152], [106, 176], { bell: [110, 158] }),
      P([100, 106], [100, 68], [104, 90], [106, 112], [100, 141], [100, 176], { bell: [106, 120] }),
    ],
    posesF: [
      FS({ hip: [100, 134], sh: [100, 100], elR: [106, 122], haR: [104, 148], elL: [94, 122], haL: [96, 148], knR: [128, 150], anR: [134, 176], knL: [72, 150], anL: [66, 176], bell: [100, 156] }),
      FS({ elR: [106, 92], haR: [104, 112], elL: [94, 92], haL: [96, 112], knR: [114, 142], anR: [118, 176], knL: [86, 142], anL: [82, 176], bell: [100, 120] }),
    ],
  },
  {
    id: "clean", name: "Kettlebell clean", tags: ["upper", "full"], pattern: "Hinge",
    reps: "8 / side", twoBell: true, dur: 1.6,
    cue: "Hike it back, keep the bell close, and let it roll softly around the wrist into the rack.",
    grip: "One hand, loose hook on the handle — grip firms up only when it lands in the rack.",
    poses: [
      P([96, 122], [124, 98], [116, 118], [104, 138], [104, 150], [100, 176], { bell: [100, 145] }),
      S_RACK,
    ],
    posesF: [F_HINGE, F_RACK],
  },
  {
    id: "clean_press", name: "Clean & press", tags: ["upper", "full"], pattern: "Push",
    reps: "6 / side", twoBell: true, dur: 2.4, hybrid: true,
    cue: "Clean it soft to the rack, then press. Reset your breath at the rack each rep.",
    grip: "Loose hook on the clean, then rack grip — handle diagonal, bell on the forearm — for the press.",
    poses: [
      P([96, 122], [124, 98], [116, 118], [104, 138], [104, 150], [100, 176], { bell: [100, 145] }),
      S_RACK, S_OH, S_RACK,
    ],
    posesF: [F_HINGE, F_RACK, F_OH, F_RACK],
  },
  {
    id: "thruster", name: "Thruster", tags: ["lower", "full"], pattern: "Squat",
    reps: "8 reps", twoBell: true, dur: 2.1, hybrid: true,
    cue: "Front squat straight into a press — one motion. The squat drive throws the bell up.",
    grip: "Goblet grip on the horns; press the bell straight up from the chest.",
    poses: [
      S_SQUAT,
      S_GOBLET,
      P([100, 104], [100, 66], [106, 52], [102, 36], [100, 140], [100, 176], { bell: [102, 30] }),
      S_GOBLET,
    ],
    posesF: [
      F_SQUAT,
      F_GOBLET,
      FS({ elR: [110, 52], haR: [104, 36], elL: [90, 52], haL: [96, 36], bell: [100, 30] }),
      F_GOBLET,
    ],
  },
  {
    id: "snatch", name: "Snatch", tags: ["full"], pattern: "Hinge",
    reps: "6 / side", dur: 1.9,
    cue: "One pull from hinge to overhead. Punch through at the top so the bell lands soft.",
    grip: "One hand, loose hook — let the handle rotate in your palm as you punch through the top.",
    poses: [
      P([96, 124], [126, 98], [118, 118], [104, 138], [104, 150], [100, 176], { bell: [98, 145] }),
      P([100, 102], [100, 66], [114, 58], [106, 48], [100, 140], [100, 176], { bell: [108, 44] }),
      S_OH,
    ],
    posesF: [
      FS({ hip: [100, 118], sh: [100, 82], elR: [108, 104], haR: [102, 128], knR: [112, 148], knL: [88, 148], bell: [100, 136] }),
      FS({ elR: [124, 60], haR: [106, 64], bell: [104, 72] }),
      F_OH,
    ],
  },
  {
    id: "russian_twist", name: "Russian twist", tags: ["core"], pattern: "Rotation",
    reps: "10 / side", dur: 1.5,
    cue: "Lean back, chest proud, rotate from the ribcage — the bell taps each side.",
    grip: "Hands on the horns, bell held at the chest.",
    poses: [
      P([102, 156], [80, 122], [98, 130], [116, 136], [126, 140], [142, 152], { bell: [120, 140], head: [74, 110] }),
      P([102, 156], [80, 122], [84, 138], [76, 150], [126, 140], [142, 152], { bell: [72, 154], head: [74, 110] }),
    ],
    posesF: [
      { hip: [100, 152], sh: [100, 112], elR: [116, 128], haR: [126, 138], elL: [106, 130], haL: [122, 140], knR: [114, 132], anR: [118, 154], knL: [86, 132], anL: [82, 154], bell: [130, 142] },
      { hip: [100, 152], sh: [100, 112], elR: [94, 130], haR: [78, 140], elL: [84, 128], haL: [74, 138], knR: [114, 132], anR: [118, 154], knL: [86, 132], anL: [82, 154], bell: [70, 142] },
    ],
  },
  {
    id: "windmill", name: "Windmill", tags: ["core"], pattern: "Hinge",
    reps: "5 / side", dur: 3.0, frontOnly: true,
    cue: "Bell locked overhead in one arm the whole time. Hips push toward the bell side, free hand slides down its own leg. Eyes on the bell.",
    grip: "Rack-style grip locked overhead — handle diagonal in the palm, wrist straight.",
    poses: [S_OH, P([90, 112], [118, 122], [120, 100], [122, 80], [96, 146], [100, 176], { bell: [126, 74] })],
    posesF: [
      FS({ elR: [106, 46], haR: [104, 28], bell: [106, 22], elL: [88, 90], haL: [86, 110] }),
      FS({ hip: [108, 110], sh: [88, 94], elR: [92, 66], haR: [94, 44], elL: [92, 116], haL: [94, 138], knR: [116, 142], anR: [124, 176], knL: [90, 146], anL: [78, 176], bell: [96, 38] }),
      FS({ hip: [112, 112], sh: [76, 102], elR: [80, 76], haR: [82, 52], elL: [82, 128], haL: [82, 158], knR: [118, 142], anR: [128, 176], knL: [92, 148], anL: [76, 176], bell: [84, 46] }),
      FS({ hip: [108, 110], sh: [88, 94], elR: [92, 66], haR: [94, 44], elL: [92, 116], haL: [94, 138], knR: [116, 142], anR: [124, 176], knL: [90, 146], anL: [78, 176], bell: [96, 38] }),
    ],
  },
  {
    id: "around_world", name: "Around the world", tags: ["core"], pattern: "Rotation",
    reps: "8 / dir", dur: 2.2,
    cue: "Pass the bell in a circle around your hips. Hips stay square — no swaying.",
    grip: "Handle grip, passing hand to hand behind your back and in front.",
    poses: [
      P([100, 106], [100, 68], [110, 100], [116, 118], [100, 141], [100, 176], { bell: [118, 122] }),
      P([100, 106], [100, 68], [104, 100], [102, 122], [100, 141], [100, 176], { bell: [100, 128] }),
      P([100, 106], [100, 68], [94, 100], [86, 118], [100, 141], [100, 176], { bell: [84, 122] }),
      P([100, 106], [100, 68], [102, 98], [102, 116], [100, 141], [100, 176], { bell: [100, 116] }),
    ],
    posesF: [
      FS({ elR: [116, 100], haR: [124, 116], elL: [92, 96], haL: [90, 110], bell: [130, 120] }),
      FS({ elR: [110, 102], haR: [106, 120], elL: [90, 102], haL: [94, 120], bell: [100, 126] }),
      FS({ elR: [108, 96], haR: [110, 110], elL: [84, 100], haL: [76, 116], bell: [70, 120] }),
      FS({ elR: [110, 98], haR: [108, 112], elL: [90, 98], haL: [92, 112], bell: [100, 114] }),
    ],
  },
  {
    id: "pull_through", name: "Plank pull-through", tags: ["core"], pattern: "Anti-rotation",
    reps: "8 / side", dur: 2.2, frontOnly: true,
    cue: "Rigid plank, hips dead still. Drag the bell under you without twisting.",
    grip: "Grab the handle with the reaching hand, drag it across, release, re-plant.",
    poses: [
      P([116, 150], [74, 138], [74, 156], [74, 174], [140, 160], [162, 174], { bell: [98, 168], head: [62, 126] }),
    ],
    posesF: [
      { hip: [100, 148], sh: [100, 138], head: [100, 122], elR: [116, 150], haR: [118, 170], elL: [84, 150], haL: [82, 170], knR: [106, 148], anR: [108, 156], knL: [94, 148], anL: [92, 156], bell: [132, 166] },
      { hip: [100, 148], sh: [100, 138], head: [100, 122], elR: [116, 150], haR: [118, 170], elL: [104, 152], haL: [124, 164], knR: [106, 148], anR: [108, 156], knL: [94, 148], anL: [92, 156], bell: [132, 166] },
      { hip: [100, 148], sh: [100, 138], head: [100, 122], elR: [116, 150], haR: [118, 170], elL: [84, 150], haL: [82, 170], knR: [106, 148], anR: [108, 156], knL: [94, 148], anL: [92, 156], bell: [68, 166] },
      { hip: [100, 148], sh: [100, 138], head: [100, 122], elR: [96, 152], haR: [76, 164], elL: [84, 150], haL: [82, 170], knR: [106, 148], anR: [108, 156], knL: [94, 148], anL: [92, 156], bell: [68, 166] },
    ],
  },
  {
    id: "dead_bug", name: "Dead bug pullover", tags: ["core"], pattern: "Anti-extension",
    reps: "10 reps", dur: 2.2,
    cue: "Bell over your chest. Lower it overhead as one leg extends, other leg holds at 90. Alternate legs, low back glued down.",
    grip: "Hold the horns, or cradle the ball in both palms.",
    poses: [
      P([104, 162], [66, 162], [68, 142], [66, 122], [122, 132], [138, 140], { bell: [68, 115], head: [50, 158], kn2: [122, 132], an2: [138, 140] }),
      P([104, 162], [66, 162], [56, 146], [42, 132], [136, 150], [160, 156], { bell: [40, 125], head: [50, 158], kn2: [122, 132], an2: [138, 140] }),
    ],
    posesF: [
      { hip: [100, 164], sh: [100, 156], head: [100, 142], elR: [112, 140], haR: [106, 122], elL: [88, 140], haL: [94, 122], knR: [112, 134], anR: [112, 164], knL: [88, 134], anL: [88, 164], bell: [100, 114] },
      { hip: [100, 164], sh: [100, 156], head: [100, 142], elR: [112, 132], haR: [106, 112], elL: [88, 132], haL: [94, 112], knR: [112, 134], anR: [112, 164], knL: [88, 148], anL: [88, 172], bell: [100, 104] },
    ],
  },
  {
    id: "situp_press", name: "Sit-up to press", tags: ["core"], pattern: "Flexion",
    reps: "10 reps", dur: 2.2, hybrid: true,
    cue: "Curl up with the bell at your chest, press overhead at the top, control back down.",
    grip: "Hands on the horns at the chest; press with both hands on the way up.",
    poses: [
      P([104, 162], [68, 158], [76, 146], [82, 134], [124, 138], [138, 162], { bell: [84, 128], head: [52, 152] }),
      P([104, 162], [92, 120], [104, 132], [110, 120], [124, 138], [138, 162], { bell: [115, 116], head: [88, 108] }),
      P([104, 162], [92, 118], [96, 100], [94, 82], [124, 138], [138, 162], { bell: [97, 76], head: [88, 106] }),
    ],
    posesF: [
      { hip: [100, 162], sh: [100, 154], head: [100, 142], elR: [110, 146], haR: [104, 140], elL: [90, 146], haL: [96, 140], knR: [112, 134], anR: [112, 164], knL: [88, 134], anL: [88, 164], bell: [100, 136] },
      { hip: [100, 158], sh: [100, 116], head: [100, 100], elR: [112, 130], haR: [104, 122], elL: [88, 130], haL: [96, 122], knR: [112, 134], anR: [112, 160], knL: [88, 134], anL: [88, 160], bell: [100, 118] },
      { hip: [100, 158], sh: [100, 114], head: [100, 98], elR: [110, 90], haR: [104, 70], elL: [90, 90], haL: [96, 70], knR: [112, 134], anR: [112, 160], knL: [88, 134], anL: [88, 160], bell: [100, 62] },
    ],
  },
  {
    id: "suitcase_march", name: "Suitcase march", tags: ["core"], pattern: "Anti-lean",
    reps: "10 / side", twoBell: true, dur: 1.3,
    cue: "Bell in one hand at your side, march tall. Don't let the loaded side pull you over.",
    grip: "Handle grip at your side, like carrying a suitcase.",
    poses: [
      P([100, 106], [100, 68], [104, 90], [106, 112], [116, 124], [116, 148], { bell: [106, 120], kn2: [100, 141], an2: [100, 176] }),
      P([100, 106], [100, 68], [104, 90], [106, 112], [100, 141], [100, 176], { bell: [106, 120], kn2: [100, 141], an2: [100, 176] }),
    ],
    posesF: [
      FS({ elR: [114, 92], haR: [114, 112], knL: [88, 112], anL: [88, 140], bell: [116, 120] }),
      FS({ elR: [114, 92], haR: [114, 112], bell: [116, 120] }),
    ],
  },
  {
    id: "racked_march", name: "Racked march", tags: ["core"], pattern: "Anti-lean",
    reps: "20 steps", twoBell: true, dur: 1.3,
    cue: "Bell in the rack at your chest, march in place. Ribs down, no arching around the load.",
    grip: "Rack grip — handle diagonal in the palm, bell resting on the forearm.",
    poses: [
      P([100, 106], [100, 68], [110, 86], [110, 70], [116, 124], [116, 148], { bell: [115, 66], kn2: [100, 141], an2: [100, 176] }),
      P([100, 106], [100, 68], [110, 86], [110, 70], [100, 141], [100, 176], { bell: [115, 66], kn2: [100, 141], an2: [100, 176] }),
    ],
    posesF: [
      FS({ elR: [114, 84], haR: [110, 68], knL: [88, 112], anL: [88, 140], bell: [113, 62] }),
      FS({ elR: [114, 84], haR: [110, 68], bell: [113, 62] }),
    ],
  },
  {
    id: "standing_pullover", name: "Standing pullover", tags: ["upper", "core"], pattern: "Anti-extension",
    reps: "10 reps", dur: 2.6,
    cue: "Like a soccer throw-in: long arms, bell from chest to overhead and just behind your head. Ribs down so the low back doesn't arch.",
    grip: "Both hands on the horns, arms long with a soft elbow bend.",
    poses: [
      P([100, 106], [100, 68], [108, 88], [114, 98], [100, 141], [100, 176], { bell: [116, 102] }),
      P([100, 106], [100, 68], [103, 48], [102, 32], [100, 141], [100, 176], { bell: [104, 26] }),
      P([100, 106], [100, 68], [94, 54], [84, 46], [100, 141], [100, 176], { bell: [80, 46] }),
      P([100, 106], [100, 68], [103, 48], [102, 32], [100, 141], [100, 176], { bell: [104, 26] }),
    ],
    posesF: [
      FS({ elR: [112, 88], haR: [108, 98], elL: [88, 88], haL: [92, 98], bell: [100, 102] }),
      FS({ elR: [110, 50], haR: [104, 34], elL: [90, 50], haL: [96, 34], bell: [100, 28] }),
      FS({ elR: [112, 54], haR: [106, 44], elL: [88, 54], haL: [94, 44], bell: [100, 42] }),
      FS({ elR: [110, 50], haR: [104, 34], elL: [90, 50], haL: [96, 34], bell: [100, 28] }),
    ],
  },
  {
    id: "tricep_ext", name: "Overhead tricep extension", tags: ["upper"], pattern: "Push",
    reps: "10 reps", dur: 2.0,
    cue: "Elbows point at the ceiling and stay narrow. Bell dips behind your head, then extend all the way to lockout.",
    grip: "Hands on the horns, reverse grip, ball hanging behind your head at the bottom.",
    poses: [
      P([100, 106], [100, 68], [104, 48], [102, 32], [100, 141], [100, 176], { bell: [102, 26] }),
      P([100, 106], [100, 68], [102, 50], [88, 60], [100, 141], [100, 176], { bell: [84, 66] }),
    ],
    posesF: [
      FS({ elR: [110, 50], haR: [104, 34], elL: [90, 50], haL: [96, 34], bell: [100, 28] }),
      FS({ elR: [112, 52], haR: [108, 60], elL: [88, 52], haL: [92, 60], bell: [100, 64] }),
    ],
  },
  {
    id: "throw_over", name: "Throw over", tags: ["upper", "core"], pattern: "Rotation",
    reps: "5 / side", dur: 2.6,
    cue: "Scoop from chest height up and over one shoulder, tipping the top of the bell behind you like dumping a shovel. Back to center, then the other side.",
    grip: "Hands on the horns; wrists tip the bell over the shoulder at the top.",
    poses: [
      P([100, 106], [100, 68], [108, 90], [112, 80], [100, 141], [100, 176], { bell: [114, 84] }),
      P([100, 106], [100, 68], [98, 52], [90, 42], [100, 141], [100, 176], { bell: [86, 40] }),
    ],
    posesF: [
      FS({ elR: [112, 90], haR: [106, 84], elL: [88, 90], haL: [94, 84], bell: [100, 88] }),
      FS({ elR: [118, 62], haR: [116, 48], elL: [96, 66], haL: [104, 52], bell: [118, 42] }),
      FS({ elR: [112, 90], haR: [106, 84], elL: [88, 90], haL: [94, 84], bell: [100, 88] }),
      FS({ elR: [82, 62], haR: [84, 48], elL: [104, 66], haL: [96, 52], bell: [82, 42] }),
    ],
  },
  {
    id: "slow_curl", name: "Super slow curl", tags: ["upper"], pattern: "Pull",
    reps: "10 slow reps", dur: 5.0,
    cue: "Three to four seconds up, three to four down, no swing. The slow negative is the exercise.",
    grip: "Hands on the horns, elbows pinned to your ribs.",
    poses: [
      P([100, 106], [100, 68], [106, 90], [106, 112], [100, 141], [100, 176], { bell: [108, 118] }),
      P([100, 106], [100, 68], [106, 92], [112, 76], [100, 141], [100, 176], { bell: [114, 72] }),
    ],
    posesF: [
      FS({ elR: [110, 92], haR: [106, 112], elL: [90, 92], haL: [94, 112], bell: [100, 118] }),
      FS({ elR: [112, 88], haR: [106, 74], elL: [88, 88], haL: [94, 74], bell: [100, 70] }),
    ],
  },
];

/* ============ ADVANCED HYBRID POOL ============ */
const HYBRIDS = [
  {
    id: "halo_press", name: "Halo + chest press-out", tags: ["upper", "core"], pattern: "Rotation",
    reps: "6 / dir", dur: 3.2, advancedOnly: true, hybrid: true,
    cue: "Full halo around the head, then when the bell comes back to the front, press it straight out at chest height. Ribs stay down through both.",
    grip: "Bell upside down on the horns for the halo; keep the horns grip for the press-out.",
    poses: [
      P([100, 106], [100, 68], [112, 60], [112, 44], [100, 141], [100, 176], { bell: [116, 40] }),
      P([100, 106], [100, 68], [100, 52], [98, 30], [100, 141], [100, 176], { bell: [98, 24] }),
      P([100, 106], [100, 68], [88, 58], [84, 42], [100, 141], [100, 176], { bell: [80, 38] }),
      P([100, 106], [100, 68], [110, 74], [112, 72], [100, 141], [100, 176], { bell: [116, 72] }),
      P([100, 106], [100, 68], [122, 74], [140, 74], [100, 141], [100, 176], { bell: [146, 76] }),
      P([100, 106], [100, 68], [110, 74], [112, 72], [100, 141], [100, 176], { bell: [116, 72] }),
    ],
    posesF: [
      FS({ elR: [114, 58], haR: [110, 44], elL: [92, 64], haL: [96, 52], bell: [112, 40] }),
      FS({ elR: [106, 48], haR: [100, 32], elL: [94, 48], haL: [98, 34], bell: [100, 26] }),
      FS({ elR: [88, 58], haR: [88, 44], elL: [108, 62], haL: [102, 50], bell: [86, 40] }),
      FS({ elR: [112, 74], haR: [106, 70], elL: [88, 74], haL: [94, 70], bell: [100, 68] }),
      FS({ elR: [110, 72], haR: [104, 78], elL: [90, 72], haL: [96, 78], bell: [100, 84] }),
      FS({ elR: [112, 74], haR: [106, 70], elL: [88, 74], haL: [94, 70], bell: [100, 68] }),
    ],
  },
  {
    id: "lunge_twist", name: "Reverse lunge + twist", tags: ["lower", "core"], pattern: "Lunge",
    reps: "6 / side", dur: 2.8, advancedOnly: true, hybrid: true,
    cue: "Step back into the lunge, then rotate the bell over your front leg. Twist from the ribcage, hips stay square. Untwist before you stand.",
    grip: "Goblet grip on the horns, elbows tucked through the twist.",
    poses: [
      P([100, 106], [100, 68], [112, 84], [114, 72], [100, 141], [100, 176], { bell: [119, 72], kn2: [100, 141], an2: [100, 176] }),
      P([98, 130], [100, 92], [112, 108], [114, 96], [112, 150], [112, 176], { bell: [119, 96], kn2: [80, 162], an2: [66, 176] }),
      P([98, 130], [102, 92], [122, 102], [134, 100], [112, 150], [112, 176], { bell: [140, 102], kn2: [80, 162], an2: [66, 176] }),
      P([98, 130], [100, 92], [112, 108], [114, 96], [112, 150], [112, 176], { bell: [119, 96], kn2: [80, 162], an2: [66, 176] }),
    ],
    posesF: [
      F_GOBLET,
      F_LUNGE,
      FS({ hip: [100, 134], sh: [102, 96], elR: [122, 108], haR: [130, 102], elL: [98, 112], haL: [122, 104], knR: [108, 153], anR: [108, 176], knL: [90, 165], anL: [84, 175], bell: [136, 104] }),
      F_LUNGE,
    ],
  },
  {
    id: "swing_squat", name: "Swing + goblet squat", tags: ["lower", "full"], pattern: "Hinge",
    reps: "8 reps", twoBell: true, dur: 3.0, advancedOnly: true, hybrid: true,
    cue: "Swing to chest height, catch the bell in the goblet at the top, squat, stand, drop back into the swing. One catch, one squat, every rep.",
    grip: "Handle for the swing, catch onto the horns for the squat, back to the handle on the drop.",
    poses: [S_HINGE, S_SWTOP, S_GOBLET, S_SQUAT, S_GOBLET],
    posesF: [
      FS({ hip: [100, 118], sh: [100, 82], elR: [108, 104], haR: [104, 126], elL: [92, 104], haL: [96, 126], knR: [112, 148], knL: [88, 148], bell: [100, 134] }),
      FS({ elR: [110, 76], haR: [104, 82], elL: [90, 76], haL: [96, 82], bell: [100, 90] }),
      F_GOBLET, F_SQUAT, F_GOBLET,
    ],
  },
  {
    id: "clean_lunge", name: "Clean + reverse lunge", tags: ["lower", "full"], pattern: "Lunge",
    reps: "6 / side", twoBell: true, dur: 2.8, advancedOnly: true, hybrid: true,
    cue: "Clean to the rack, lunge back on the same-side leg, stand, drop and repeat. The rack position has to survive the lunge.",
    grip: "Loose hook on the clean, rack grip — bell on the forearm — through the lunge.",
    poses: [
      P([96, 122], [124, 98], [116, 118], [104, 138], [104, 150], [100, 176], { bell: [100, 145] }),
      S_RACK, S_LUNGE_R, S_RACK,
    ],
    posesF: [
      F_HINGE, F_RACK,
      FS({ hip: [100, 134], sh: [100, 96], elR: [114, 112], haR: [110, 96], elL: [86, 114], haL: [84, 130], knR: [108, 153], anR: [108, 176], knL: [90, 165], anL: [84, 175], bell: [113, 90] }),
      F_RACK,
    ],
  },
  {
    id: "clean_squat_press", name: "Clean + squat + press", tags: ["upper", "full"], pattern: "Squat",
    reps: "5 / side", twoBell: true, dur: 3.4, advancedOnly: true, hybrid: true,
    cue: "Clean, front squat, then press on the way up — the squat drive feeds the press. The whole chain is one breath cycle.",
    grip: "Loose hook to the clean, rack grip through the squat and press.",
    poses: [
      P([96, 122], [124, 98], [116, 118], [104, 138], [104, 150], [100, 176], { bell: [100, 145] }),
      S_RACK, S_RACKSQ, S_RACK, S_OH, S_RACK,
    ],
    posesF: [F_HINGE, F_RACK, F_RACKSQ, F_RACK, F_OH, F_RACK],
  },
  {
    id: "lat_lunge_press", name: "Lateral lunge + press", tags: ["lower", "upper"], pattern: "Lunge",
    reps: "6 / side", dur: 3.0, advancedOnly: true, hybrid: true,
    cue: "Lateral lunge, drive back to standing, and press overhead as you arrive. Two planes of motion in one rep.",
    grip: "Goblet grip through the lunge, press from the chest with both hands on the horns.",
    poses: [
      S_GOBLET,
      P([96, 126], [102, 90], [114, 106], [116, 94], [112, 152], [118, 176], { bell: [121, 94], kn2: [80, 146], an2: [70, 176] }),
      S_GOBLET,
      P([100, 104], [100, 66], [106, 52], [102, 36], [100, 140], [100, 176], { bell: [102, 30] }),
      S_GOBLET,
    ],
    posesF: [
      F_GOBLET,
      FS({ hip: [116, 134], sh: [108, 96], elR: [122, 114], haR: [114, 104], elL: [94, 114], haL: [102, 104], knR: [136, 152], anR: [142, 176], knL: [93, 153], anL: [70, 176], bell: [108, 102] }),
      F_GOBLET,
      FS({ elR: [110, 52], haR: [104, 36], elL: [90, 52], haL: [96, 36], bell: [100, 30] }),
      F_GOBLET,
    ],
  },
  {
    id: "snatch_lunge", name: "Snatch + overhead lunge", tags: ["full"], pattern: "Hinge",
    reps: "5 / side", dur: 3.2, advancedOnly: true, hybrid: true,
    cue: "Snatch to lockout, then reverse lunge with the bell still overhead. If the arm bends, the set is over.",
    grip: "Loose hook through the snatch; locked-out rack-style grip overhead for the lunge.",
    poses: [
      P([96, 124], [126, 98], [118, 118], [104, 138], [104, 150], [100, 176], { bell: [98, 145] }),
      S_OH,
      P([98, 128], [100, 90], [103, 70], [102, 52], [112, 150], [112, 176], { bell: [106, 46], kn2: [80, 162], an2: [66, 176] }),
      S_OH,
    ],
    posesF: [
      FS({ hip: [100, 118], sh: [100, 82], elR: [108, 104], haR: [102, 128], knR: [112, 148], knL: [88, 148], bell: [100, 136] }),
      F_OH,
      FS({ hip: [100, 134], sh: [100, 96], elR: [110, 72], haR: [108, 52], elL: [86, 114], haL: [84, 130], knR: [108, 153], anR: [108, 176], knL: [90, 165], anL: [84, 175], bell: [110, 46] }),
      F_OH,
    ],
  },
  {
    id: "renegade", name: "Push-up + row", tags: ["upper", "core"], pattern: "Pull",
    reps: "8 reps", twoBell: true, dur: 2.8, advancedOnly: true, hybrid: true,
    cue: "Push-up with one hand on the bell, then row it to your ribs without the hips rotating. Feet wide for a stable base.",
    grip: "One hand on the handle, one flat on the floor. Swap sides each rep or halfway.",
    poses: [
      P([116, 148], [74, 136], [74, 152], [74, 166], [140, 160], [162, 174], { bell: [74, 168], head: [62, 124] }),
      P([116, 156], [74, 150], [62, 156], [72, 166], [140, 162], [162, 174], { bell: [74, 168], head: [60, 140] }),
      P([116, 148], [74, 136], [74, 152], [74, 166], [140, 160], [162, 174], { bell: [74, 168], head: [62, 124] }),
      P([116, 148], [74, 136], [64, 142], [70, 148], [140, 160], [162, 174], { bell: [70, 152], head: [62, 124] }),
      P([116, 148], [74, 136], [74, 152], [74, 166], [140, 160], [162, 174], { bell: [74, 168], head: [62, 124] }),
    ],
    posesF: [
      { hip: [100, 150], sh: [100, 136], head: [100, 118], elR: [116, 150], haR: [116, 164], elL: [84, 150], haL: [84, 164], knR: [110, 150], anR: [114, 158], knL: [90, 150], anL: [86, 158], bell: [116, 166] },
      { hip: [100, 154], sh: [100, 148], head: [100, 134], elR: [124, 152], haR: [116, 164], elL: [76, 152], haL: [84, 164], knR: [110, 152], anR: [114, 158], knL: [90, 152], anL: [86, 158], bell: [116, 166] },
      { hip: [100, 150], sh: [100, 136], head: [100, 118], elR: [116, 150], haR: [116, 164], elL: [84, 150], haL: [84, 164], knR: [110, 150], anR: [114, 158], knL: [90, 150], anL: [86, 158], bell: [116, 166] },
      { hip: [100, 150], sh: [100, 136], head: [100, 118], elR: [118, 142], haR: [114, 148], elL: [84, 150], haL: [84, 164], knR: [110, 150], anR: [114, 158], knL: [90, 150], anL: [86, 158], bell: [114, 150] },
      { hip: [100, 150], sh: [100, 136], head: [100, 118], elR: [116, 150], haR: [116, 164], elL: [84, 150], haL: [84, 164], knR: [110, 150], anR: [114, 158], knL: [90, 150], anL: [86, 158], bell: [116, 166] },
    ],
  },
  {
    id: "bottoms_up_press", name: "Bottoms-up press", tags: ["upper"], pattern: "Push",
    reps: "5 / side", dur: 2.4, advancedOnly: true, hybrid: true, bellFlip: true,
    cue: "Bell balanced upside down — ball on top, handle in your fist. Crush the grip and press slow. If it tips, guide it down and reset.",
    grip: "Crush grip on the handle, bell inverted. Wrist dead straight or it falls.",
    poses: [
      P([100, 106], [100, 68], [110, 86], [110, 70], [100, 141], [100, 176], { bell: [111, 62] }),
      P([100, 106], [100, 68], [103, 50], [102, 32], [100, 141], [100, 176], { bell: [102, 24] }),
    ],
    posesF: [
      FS({ elR: [114, 84], haR: [110, 68], bell: [110, 60] }),
      FS({ elR: [110, 46], haR: [108, 26], bell: [108, 18] }),
    ],
  },
  {
    id: "squat_pressout", name: "Squat + press-out", tags: ["lower", "core"], pattern: "Squat",
    reps: "8 reps", dur: 2.8, advancedOnly: true, hybrid: true,
    cue: "Squat to the bottom, hold, press the bell straight out at arm's length, pull it back, then stand. The press-out is a core exercise wearing a squat costume.",
    grip: "Goblet grip on the horns; press out and pull back with control.",
    poses: [
      S_GOBLET, S_SQUAT,
      P([100, 142], [106, 102], [122, 106], [140, 108], [118, 156], [104, 176], { bell: [146, 110] }),
      S_SQUAT,
    ],
    posesF: [
      F_GOBLET, F_SQUAT,
      FS({ hip: [100, 140], sh: [100, 102], elR: [112, 106], haR: [106, 112], elL: [88, 106], haL: [94, 112], knR: [124, 152], anR: [114, 176], knL: [76, 152], anL: [86, 176], bell: [100, 118] }),
      F_SQUAT,
    ],
  },
  {
    id: "figure8_hold", name: "Figure 8 to hold", tags: ["core"], pattern: "Rotation",
    reps: "8 reps", dur: 3.0, advancedOnly: true, hybrid: true, frontOnly: true,
    cue: "Weave the bell in a figure 8 between your legs, then pop it up and catch it at your chest with both hands. Stay low in a quarter squat throughout.",
    grip: "Handle grip, passing hand to hand between the legs; catch on the ball at the chest.",
    poses: [
      P([100, 116], [100, 80], [110, 104], [114, 126], [106, 148], [100, 176], { bell: [116, 130] }),
    ],
    posesF: [
      FS({ hip: [100, 120], sh: [100, 84], elR: [116, 106], haR: [122, 124], elL: [90, 106], haL: [88, 120], knR: [114, 150], anR: [118, 176], knL: [86, 150], anL: [82, 176], bell: [128, 128] }),
      FS({ hip: [100, 120], sh: [100, 84], elR: [110, 110], haR: [104, 136], elL: [90, 106], haL: [88, 120], knR: [114, 150], anR: [118, 176], knL: [86, 150], anL: [82, 176], bell: [100, 148] }),
      FS({ hip: [100, 120], sh: [100, 84], elR: [110, 104], haR: [108, 118], elL: [84, 106], haL: [78, 124], knR: [114, 150], anR: [118, 176], knL: [86, 150], anL: [82, 176], bell: [72, 128] }),
      FS({ hip: [100, 120], sh: [100, 84], elR: [110, 104], haR: [108, 120], elL: [90, 110], haL: [96, 136], knR: [114, 150], anR: [118, 176], knL: [86, 150], anL: [82, 176], bell: [100, 148] }),
      FS({ hip: [100, 116], sh: [100, 80], elR: [112, 96], haR: [106, 86], elL: [88, 96], haL: [94, 86], knR: [112, 148], anR: [116, 176], knL: [88, 148], anL: [84, 176], bell: [100, 84] }),
    ],
  },
  {
    id: "rdl_row", name: "RDL + row", tags: ["lower", "upper"], pattern: "Hinge",
    reps: "6 / side", twoBell: true, dur: 3.0, advancedOnly: true, hybrid: true,
    cue: "Hinge down, hold the bottom, row the bell to your ribs, lower it, then stand. The hold is where the hamstrings earn it.",
    grip: "One hand on the handle; keep the lat tight so the bell doesn't drift forward.",
    poses: [
      P([100, 106], [100, 68], [104, 88], [106, 108], [100, 141], [100, 176], { bell: [106, 115] }),
      P([90, 118], [126, 96], [128, 116], [122, 142], [98, 150], [100, 176], { bell: [122, 149] }),
      P([90, 118], [126, 96], [112, 104], [118, 118], [98, 150], [100, 176], { bell: [118, 124] }),
      P([90, 118], [126, 96], [128, 116], [122, 142], [98, 150], [100, 176], { bell: [122, 149] }),
    ],
    posesF: [
      FS({ elR: [106, 90], haR: [104, 110], elL: [94, 90], haL: [96, 110], bell: [100, 118] }),
      FS({ sh: [100, 88], hip: [100, 114], elR: [106, 110], haR: [104, 138], elL: [94, 110], haL: [96, 138], knR: [108, 146], knL: [92, 146], bell: [100, 146] }),
      FS({ sh: [100, 88], hip: [100, 114], elR: [122, 100], haR: [110, 108], elL: [94, 110], haL: [96, 138], knR: [108, 146], knL: [92, 146], bell: [108, 114] }),
      FS({ sh: [100, 88], hip: [100, 114], elR: [106, 110], haR: [104, 138], elL: [94, 110], haL: [96, 138], knR: [108, 146], knL: [92, 146], bell: [100, 146] }),
    ],
  },
  {
    id: "atw_squat", name: "Around the world + squat", tags: ["core", "lower"], pattern: "Rotation",
    reps: "6 / dir", dur: 3.4, advancedOnly: true, hybrid: true,
    cue: "One full pass around the hips, catch the bell in the goblet, squat, stand, release into the next pass. Hips square on the pass, heels down in the squat.",
    grip: "Handle hand-to-hand around the body, then the horns for the squat.",
    poses: [
      P([100, 106], [100, 68], [110, 100], [116, 118], [100, 141], [100, 176], { bell: [118, 122] }),
      P([100, 106], [100, 68], [94, 100], [86, 118], [100, 141], [100, 176], { bell: [84, 122] }),
      S_GOBLET, S_SQUAT, S_GOBLET,
    ],
    posesF: [
      FS({ elR: [116, 100], haR: [124, 116], elL: [92, 96], haL: [90, 110], bell: [130, 120] }),
      FS({ elR: [108, 96], haR: [110, 110], elL: [84, 100], haL: [76, 116], bell: [70, 120] }),
      F_GOBLET, F_SQUAT, F_GOBLET,
    ],
  },
  {
    id: "curl_halo", name: "Curl + halo", tags: ["upper", "core"], pattern: "Rotation",
    reps: "5 / dir", dur: 3.4, advancedOnly: true, hybrid: true,
    cue: "Curl the bell to your chest, flow straight into a halo around the head, back to the chest, lower. Alternate halo direction each rep.",
    grip: "Hands on the horns for the curl; keep the horns grip through the halo.",
    poses: [
      P([100, 106], [100, 68], [106, 90], [106, 112], [100, 141], [100, 176], { bell: [108, 118] }),
      P([100, 106], [100, 68], [106, 92], [112, 76], [100, 141], [100, 176], { bell: [114, 72] }),
      P([100, 106], [100, 68], [100, 52], [98, 30], [100, 141], [100, 176], { bell: [98, 24] }),
      P([100, 106], [100, 68], [88, 58], [84, 42], [100, 141], [100, 176], { bell: [80, 38] }),
      P([100, 106], [100, 68], [106, 92], [112, 76], [100, 141], [100, 176], { bell: [114, 72] }),
    ],
    posesF: [
      FS({ elR: [110, 92], haR: [106, 112], elL: [90, 92], haL: [94, 112], bell: [100, 118] }),
      FS({ elR: [112, 88], haR: [106, 74], elL: [88, 88], haL: [94, 74], bell: [100, 70] }),
      FS({ elR: [106, 48], haR: [100, 32], elL: [94, 48], haL: [98, 34], bell: [100, 26] }),
      FS({ elR: [88, 58], haR: [88, 44], elL: [108, 62], haL: [102, 50], bell: [86, 40] }),
      FS({ elR: [112, 88], haR: [106, 74], elL: [88, 88], haL: [94, 74], bell: [100, 70] }),
    ],
  },
];

const EXERCISES = [...STANDARD, ...HYBRIDS];

const PATTERN_ORDER = ["Hinge", "Squat", "Push", "Pull", "Lunge", "Rotation", "Anti-rotation", "Anti-extension", "Anti-lean", "Flexion"];

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

function poolFor(mode) {
  return mode === "advanced"
    ? EXERCISES.filter((e) => e.hybrid)
    : EXERCISES.filter((e) => !e.advancedOnly);
}

function buildCircuit(focus, mode, salt) {
  const today = localDate();
  const rand = mulberry32(seedFrom(today + focus.join("+") + mode + salt));
  const wantFull = focus.includes("full");
  let pool = poolFor(mode).filter((e) => (wantFull ? true : e.tags.some((t) => focus.includes(t))));
  pool = [...pool].sort(() => rand() - 0.5);
  const picked = [];
  const usedPatterns = new Set();
  for (const ex of pool) {
    if (picked.length >= 5) break;
    if (!usedPatterns.has(ex.pattern)) { picked.push(ex); usedPatterns.add(ex.pattern); }
  }
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
  ["hip", "kn2", 3, 0.35], ["kn2", "an2", 3, 0.35],
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

function Figure({ poses, dur, color, animate, bellFlip }) {
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

async function loadSessions() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
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
        if (Array.isArray(incoming)) onLoad(incoming);
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

function Library({ reduced }) {
  const [tagFilter, setTagFilter] = useState(null);
  const [showSide, setShowSide] = useState(true);
  const displayFont = "'Big Shoulders Display', 'Arial Narrow', sans-serif";
  const groups = [
    { title: "Standard", items: EXERCISES.filter((e) => !e.advancedOnly) },
    { title: "Complex", items: EXERCISES.filter((e) => e.hybrid) },
  ];
  const uniqueCount = EXERCISES.length;
  return (
    <div>
      <div style={{ color: COLORS.chalkDim, fontSize: 15, marginBottom: 12, lineHeight: 1.5 }}>
        {uniqueCount} movements total: {groups[0].items.length} in Standard, {groups[1].items.length} in Complex
        (a few hybrids live in both pools). Tap a focus to filter.
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
                const poses = ex.frontOnly ? ex.posesF : (showSide ? ex.poses : ex.posesF);
                return (
                  <div key={g.title + ex.id} style={{
                    background: COLORS.panel, border: `1px solid ${COLORS.panelEdge}`,
                    borderRadius: 12, padding: 10,
                  }}>
                    <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.panelEdge}`, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                      <Figure poses={poses} dur={ex.dur} color={exColor} animate={!reduced} bellFlip={ex.bellFlip} />
                    </div>
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
    const prefs = readJSON(PREFS_KEY);
    if (prefs) {
      if (prefs.mode === "standard" || prefs.mode === "advanced") setMode(prefs.mode);
      if (DURATIONS.includes(prefs.durationMin)) {
        setDurationMin(prefs.durationMin);
        setSecondsLeft(prefs.durationMin * 60);
      }
      if (WEIGHTS_LB.includes(prefs.weightLb)) setWeightLb(prefs.weightLb);
    }

    const run = readJSON(RUN_KEY);
    if (runIsFresh(run)) {
      if (Array.isArray(run.focus) && run.focus.length) setFocus(run.focus);
      if (run.mode === "standard" || run.mode === "advanced") setMode(run.mode);
      setSalt(run.salt || "");
      setSwaps(run.swaps || {});
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
      // while running the end timestamp is the source of truth for the clock
      secondsLeft: running ? null : secondsRef.current,
      prBefore: prBeforeRef.current,
    });
  }, [hydrated, started, finished, focus, mode, salt, swaps, durationMin, weightLb, rounds, running, endAt]);

  const baseCircuit = useMemo(() => buildCircuit(focus, mode, salt), [focus, mode, salt]);
  const circuit = useMemo(
    () => baseCircuit.map((ex, i) => (swaps[i] ? EXERCISES.find((e) => e.id === swaps[i]) || ex : ex)),
    [baseCircuit, swaps]
  );

  const toggleFocus = (key) => {
    setSwaps({});
    setFocus((cur) => {
      if (key === "full") return ["full"];
      let next = cur.filter((k) => k !== "full");
      if (next.includes(key)) next = next.filter((k) => k !== key);
      else next = next.length >= 2 ? [next[1], key] : [...next, key];
      return next.length ? next : ["full"];
    });
  };

  const setModeSafe = (m) => {
    setMode(m);
    setSwaps({});
  };

  const swapExercise = (idx) => {
    const currentIds = circuit.map((e) => e.id);
    const wantFull = focus.includes("full");
    const eligible = poolFor(mode).filter(
      (e) => !currentIds.includes(e.id) && (wantFull ? true : e.tags.some((t) => focus.includes(t)))
    );
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
          <Library reduced={reduced} />
        ) : (
        <>

        {/* mode toggle */}
        <div style={{
          display: "flex", border: `1.5px solid ${COLORS.panelEdge}`, borderRadius: 10,
          overflow: "hidden", marginBottom: 12,
        }}>
          {[["standard", "STANDARD"], ["advanced", "COMPLEX"]].map(([key, label]) => {
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
          {mode === "advanced"
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
            <button onClick={() => { setSalt(String(Math.random())); setSwaps({}); }}
              style={{
                background: "transparent", border: `1.5px solid ${COLORS.panelEdge}`,
                color: COLORS.chalkDim, borderRadius: 8, padding: "6px 12px", fontSize: 14, fontWeight: 600,
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
                  {s.mode === "advanced" ? " · Complex" : ""}{s.weightLb ? ` · ${s.weightLb} lb` : ""}{s.partial ? " · partial" : ""}
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
