/* blocks.js — named building blocks for rig phases (docs/proposals/rig-ingest.md §2).
   Pure data. rig.js expands a phase's block names into numbers; a phase can override any value.
   The same words are used in movement notes (docs/ingest/notes-spec.md §5).
   The list grows only when a real movement needs a new block. */

// Bodies: pelvis [x, y] in meters (x forward, y up), ribcage lean in degrees from vertical.
export const BODIES = {
  stand: { pelvis: [0, 0.94], lean: 2 },
  hike: { pelvis: [-0.24, 0.84], lean: 64 },
  squat_bottom: { pelvis: [-0.16, 0.5], lean: 20 },
};

/* Hands, authored for the right hand (z is the figure's right; the left hand mirrors z).
   frame "torso": [forward, up, out] from the neck, so it follows the ribcage (rack, overhead).
   frame "pelvis": [x, y, z] from the pelvis in world axes (hands hanging by the body).
   frame "world": fixed in the room, under gravity (between the legs). */
export const HANDS = {
  between_legs: { frame: "world", at: [0.01, 0.56, 0.045] },
  rack: { frame: "torso", at: [0.146, -0.075, 0.06] },
  overhead: { frame: "torso", at: [0.0, 0.53, 0.17] },
  thigh: { frame: "pelvis", at: [0.04, -0.06, 0.26] },
};

/* Elbow bend directions: [up, out, forward] in the ribcage frame. Picked per phase.
   The standing set comes from clean + squat + press; the floor set from the floor prototypes. */
export const ELBOWS = {
  hang: [-0.3, 0.1, -1],
  pull: [-0.8, 0, -0.4],
  rack: [-1, 0.08, 0],
  press: [-1, 0.12, 0.2],
  free: [-0.3, 0.3, -1],
  floor_press: [-0.6, 0.8, -0.5],
  dead_bug: [-0.2, 0.8, -0.2],
};

// How a single bell sits in one hand: 0 hangs from the handle, 1 rests on the outside of the forearm.
export const BELL_STATES = { hanging: 0, racked: 1 };

// Stances. Feet: ankle target, toes (0 flat, 1 on the toes), air (0 planted, 1 lifted).
export const FEET = {
  hip_width: { footL: { at: [0, 0.08, -0.16], toes: 0, air: 0 }, footR: { at: [0, 0.08, 0.16], toes: 0, air: 0 } },
};
