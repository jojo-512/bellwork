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

export {
  P, FS,
  S_HINGE, S_RACK, S_OH, S_GOBLET, S_SQUAT, S_RACKSQ, S_LUNGE_R, S_SWTOP,
  F_RACK, F_OH, F_GOBLET, F_SQUAT, F_RACKSQ, F_HINGE, F_LUNGE,
};
