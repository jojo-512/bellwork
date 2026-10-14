# Plan: putting the rig in the app

Status: **draft for Joe's approval.** No app code until Joe approves it (see `AGENTS.md`).
Author: Claude, 2026-10-14.
Builds on: [`rig-animation.md`](./rig-animation.md) §0 (the rig), [`rig-ingest.md`](./rig-ingest.md) (the flow and checks), and the five prototypes in `docs/prototypes/`.

---

## 1. What changes

| Today | After |
|---|---|
| Each movement stores hand-placed `[x, y]` points for side (`poses`) and front (`posesF`) | Each movement stores `rig`: a short list of phases (pelvis, lean, twist, hand and foot targets, bell state, elbow preset, timing). Side and front are two cameras on the same 3D figure |
| `Figure` animates SVG lines with SMIL, straight lines between frames | `RigFigure` draws on a canvas: smooth timing, near limbs drawn over far ones, far limbs dimmed |
| `poses.js` holds the `S_*` / `F_*` vocabulary | `blocks.js` holds the named building blocks (`hinge`, `rack`, `squat_bottom`, elbow presets...) from `rig-ingest.md` §2 |
| `check.mjs` checks point pairs and bell-to-hand distance | `check.mjs` also runs the rig checks: reach, floor, bell clearance, no snaps, planted feet, on both sides |
| Each prototype carries its own copy of the rig code | One `rig.js` that the app, the check and the review page share |

Movements keep everything else as is: id, name, tags, pattern, reps, cue, grip, pools, `pending`, `twoBell`. Circuits, history, PRs and the timer are untouched.

## 2. Decisions for Joe

1. **Renderer: canvas (recommended) or SMIL.**
   - *Canvas* is what the prototypes use, so what Joe approves is exactly what ships. It keeps the depth order (the bell passing in front of or behind the legs, the near arm over the far one), which SVG can't change mid-animation without redrawing. Cost: about 150 lines for the component, and it needs one shared animation loop that only draws figures on screen, so the Library's 58 figures don't all run at once.
   - *SMIL* would sample the rig into `Figure`'s frames at load and reuse its pause and the contact sheet. Cost: fixed draw order (the bell between the legs in a swing draws on the wrong side), and `Figure` needs new segments for the second arm and leg anyway, so the reuse is smaller than it looks.
2. **Ship per batch (recommended) or hold until all of Complex is converted.** Per batch means each set of five or so movements reaches the gym as soon as Joe approves it, and the app runs both renderers until the last movement converts (one `if` in the card: `ex.rig ? <RigFigure> : <Figure>`). Holding means one bigger review and a longer wait. Either way the old renderer and `poses.js` are deleted once the Standard pool is converted.
3. **Three-quarter view.** The workout card keeps side and front, as decided. Recommended: no three-quarter in the app for now; it lives on the review page where Joe checks each movement. Revisit if the Library wants a detail view.
4. **Unilateral movements show the right side**, as today. The left is a mirror the checks run but the app doesn't draw.

## 3. Pieces

1. **`rig.js`** (pure math, no React, about 300 lines from the prototypes): skeleton and bone lengths, two-bone IK with pole vectors, pelvis tilt and spine lean and twist, the Hermite sampler that holds flat stretches flat, bell states (hanging, racked, horns, bottoms up, floor) with the per-phase `rack` blend, mirroring, cameras and fitting a view to the floor line. Merged from the five prototypes into one version that covers standing, split stance and lying.
2. **`blocks.js`**: the building blocks and elbow presets (`hang`, `pull`, `rack`, `press`, `row`), so a phase reads `{ body: "hinge", bell_hand: "between_legs", el: "hang" }` with small overrides where a movement needs them. Same words as the notes spec.
3. **`RigFigure`** in `bellwork.jsx`: a canvas sized to the card, sharp on the phone (device pixel ratio), the existing colours, one shared `requestAnimationFrame` loop with an IntersectionObserver so off-screen figures don't draw. Reduced motion draws one still phase (the movement's `still` phase, or its first) and doesn't animate, matching today's `animate={!reduced}`.
4. **Data:** `rig` on the movement in `movements.js`. Example shape, from clean + squat + press:
   ```js
   rig: {
     dur: 3.4, still: "Rack",
     feet: "hip_width", kneeOut: 0.12,
     phases: [
       { name: "Hike", t: 0.40, body: "hike", hand: "between_legs", el: "hang" },
       { name: "Rack", t: 0.30, body: "stand", hand: "rack", bell: "racked", el: "rack" },
       // ...
     ],
   }
   ```
   Cameras default to side and front; a lying movement can set its own.
5. **`check.mjs`:** adds the rig checks from `rig-ingest.md` §4, run on every movement with `rig`, both sides, sampled through the whole rep. The limits come from the clean + squat + press trial (lockout at least 95% of reach, bell clear of the body, a cap on bell speed). As today, a pending movement warns and an approved one fails. No new dependencies.
6. **Review page:** the contact sheet (`contact.html`, already built by `npm run build`) gains a rig mode: a picker of movements, side, front and three-quarter playing, one still per phase in each view, a scrub bar and ½× speed. This replaces the one-off prototype pages. Claude screenshots it for its own checks and publishes it to Joe for phone review.

## 4. Order of work

**Slice 1 (one PR):** `rig.js`, `blocks.js`, `RigFigure`, the rig checks, the contact sheet's rig mode, and three Complex movements that share the rack: clean + squat + press (done), clean + press and thruster. Joe reviews the three on his phone and in a private preview of the built app (published from this session, since Pages only deploys `main`), then it merges with Joe's go-ahead. This proves the whole chain on movements that are already close.

**Then Complex in four more batches,** grouped so each batch shares building blocks:

| Batch | Movements | New blocks it needs |
|---|---|---|
| 2. Lunges | lunge + twist (prototype exists), clean + lunge, lateral lunge + press, snatch + lunge | split stance, lateral lunge, overhead from the snatch |
| 3. Hinge and pull | swing + squat, RDL + row, swing + high pull, gorilla + sumo | hike, swing float, row elbow, two-hand handle |
| 4. Halos and figure-8s | halo + press, figure-8 hold, around-the-world squat, curl + halo, halo march | bell circling the head, hand-to-hand pass |
| 5. Floor and the rest | sit-up + press, renegade, bottoms-up press, squat + press-out, clean + carry, snatch + overhead carry | lying, plank, bottoms up, walking feet |

That's all 22 Complex movements (clean + press, thruster and sit-up + press are in both pools, so they convert here). The three pending carries stay pending until Joe approves them in the app, as now.

**After Complex:** the 36 Standard-only movements, in batches planned the same way, then `Figure`, `poses.js` and the old pose checks are deleted.

**Time:** slice 1 is the big one, about a session of Claude time. Each later batch is about an hour of Claude time plus Joe's review. Batch 4 is the hardest; halos are where the old figures were weakest and where the rig will need the most care.

## 5. Risks

- **Battery and smoothness** with several canvases animating. Mitigated by the shared loop and drawing only what's on screen; checked on Joe's phone in slice 1.
- **Halos and figure-8s** need the bell to circle the head and pass between hands. Not tried on the rig yet. If batch 4 can't get them right, those movements keep their old figures until it can, and the plan says so on the review page.
- **The rig's known gaps** (`rig-animation.md` §0): one rigid spine, toes can't turn out, the head doesn't move back for a press. They show in a few movements; none blocked the five prototypes.
- **Two renderers during conversion.** Kept to one switch in the card and deleted at the end, per the decision to convert before new videos.

## 6. Not in this plan

New movements from video (they wait for conversion), the six-slot template (`rig-animation.md` §5), and a pose editor.
