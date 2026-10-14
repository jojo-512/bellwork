# Proposal: joint-angle rig for movement animation

Status: **direction chosen, implementation plan not approved.** On 2026-10-14 Joe chose the rig as the way Bellwork animates, after comparing prototypes. This reopens the Rig v2 decision of 2026-10-07. Nothing in the app changes until Joe approves an implementation plan (see `AGENTS.md`).
Author: Claude, 2026-10-13, revised 2026-10-14. Reviewer: Cursor agent, then Joe.
Prototypes (standalone pages, not part of the build): [`lunge-twist-rig.html`](../prototypes/lunge-twist-rig.html), [`floor-press-rig.html`](../prototypes/floor-press-rig.html), [`dead-bug-rig.html`](../prototypes/dead-bug-rig.html). The original [`swing-rig.html`](../prototypes/swing-rig.html) is superseded.
Also covers: a proposed change to the Batch 3 slot template, five slots to six (§5).

---

## 0. Revision 2 (2026-10-14): what changed after review

Sections 1 to 8 below are the original proposal, kept for the record. Where they conflict with this section, this section wins.

**The rig that was chosen** is the one in the three prototypes above, not the swing prototype. It answers the review's technical objections:

| Review objection (swing prototype) | Revised rig |
|---|---|
| Sagittal-only joint angles (shin, knee, hip, shoulder) | 3D skeleton. Legs and arms are solved with two-bone IK from foot and hand targets, so split stances, single-arm work and lateral positions are targets, not new angle fields. |
| Ankle-rooted FK | Rooted at the pelvis. Split stances, lifted feet and floor work all work from the same root. |
| No thoracic twist | Spine lean and twist are separate from a square pelvis (lunge + twist). |
| Bell oriented along the forearm | Bell hangs under gravity: from the handle (goblet, horns) or resting on the outside of the forearm (rack). |
| Floor work untested | Lying down is the same skeleton with pelvis and ribcage tilted to -90° (floor press, dead bug). |
| Left and right authored separately | The other side is computed by mirroring. |

**Withdrawn from the original proposal:**

- **§3.1, one figure plus drag-to-rotate.** Accepted the review point: the phone is on the floor and hands are busy. The workout screen keeps side and front. Each movement can choose its camera for each view (a lying body needs a different "front" than a standing one), and three-quarter is available for a Library detail view.
- **§4, MediaPipe and video files.** Dropped. The Research Rob notes workflow stays as the ingest source.
- **§2 field shape.** Replaced by per-phase targets (below).

**What one movement stores** in the prototypes: a list of phases, each with a relative time `t`, the pelvis position, pelvis pitch, spine lean and twist, foot targets (flat, on toes, or in the air), hand targets, and per-movement constants (how the bell is held, which way each elbow bends). Shared code does the rest: skeleton, IK, bell hang, mirroring, smooth interpolation.

**Known gaps** (from the prototype notes): floor contact is authored, not enforced, so a check is needed to keep limbs above the floor; the spine is one rigid segment, so cues like "low back stays down" can't be shown; each arm needs a bend-direction value; a lying body has no single front view that works for every movement.

**Questions for the second Cursor review:**

1. **Renderer.** The prototypes draw to canvas with `requestAnimationFrame`. Is canvas the simpler path for the app, or should the rig be sampled into `Figure`'s SMIL frames? Pause, reduced motion and the contact sheet need to keep working either way.
2. **Rig v2 carry-over.** Which parts of Slice 1 and Slice 2 carry over (`t` timing, `hold` vocabulary, `checkAir`, `twist`/`shrug`/`mirror` helpers) and which are superseded (Slice 3 arc interpolation)?
3. **Migration without two systems.** The review's objection to dual authoring stands. What's the cleanest path: convert the whole pool in batches behind a flag before any new authoring, or something else?
4. **Authoring and `INGEST.md`.** Can a worker compose phases reliably from named building blocks (standing, lying, split stance, goblet, rack, table-top legs) the way it composes `S_*`/`F_*` primitives today?
5. **`check.mjs`.** Proposed checks: every target within limb reach, nothing below the floor, bell clear of the floor, `hold` rules preserved. Anything missing?

**Six slots (§5)** stay proposed, sequenced after the pending carries are approved and Standard has a couple of plain carries, per the review's pool-depth finding.

## 1. The problem

Joe's report from gym use: as the pool has grown, the stick figures look too basic, and adding movements makes it worse rather than better. Two causes in the current format:

- **Too few keyframes.** Most movements are two or three poses blended in a straight line. A swing is `S_HINGE` to `S_SWTOP` and back, so the float, the drop before the hinge, and the hip snap never appear.
- **Free-floating points.** Each pose is a set of `[x, y]` screen coordinates. Nothing holds bone lengths constant, so limbs can stretch or shrink between frames, and every movement needs side and front views drawn separately (`poses` and `posesF`).

Size is not the constraint. A swing's coordinate data is a few hundred bytes. Earlier concerns about bloat apply to video, GIFs or per-movement 3D models, none of which this proposal uses.

## 2. The proposal

Replace hand-placed coordinates with **motion data played on one shared skeleton.**

- **The rig is defined once:** bone lengths, joint layout, shoulder and hip widths, and the drawing code. Every movement uses it.
- **A movement stores only joint angles over time:** a list of named phases, each with a relative duration and a handful of angles (shin tilt, knee bend, hip bend, shoulder angle, elbow bend, plus which hand holds the bell and how).
- **Forward kinematics** turns angles into joint positions, so bone lengths can't change and poses can't distort.
- **Smooth interpolation** (cubic, through the phases) instead of straight lines between two poses.
- **Any camera angle from one dataset.** The rig is 3D in a simple way (left and right limbs offset sideways), so side, three-quarter and front views all come from the same phases.

The prototype rebuilds the swing this way: 7 phases (Float, Drop, Hike, Backswing, Drive, Snap, Rise), about 400 bytes of motion data, viewable from side, ¾ or front. The angles were authored by hand from swing mechanics and are close, not coach-verified.

Sketch of a movement entry under this proposal (field names to be settled in review):

```js
{
  id: "swing", name: "Kettlebell swing", pattern: "Hinge", /* existing fields unchanged */
  motion: {
    dur: 1.6,
    camera: 0,            // default view in degrees: 0 side, 90 front
    bell: "two-hand",
    phases: [
      { name: "Float",     t: .18, shin: 2, knee: 3,  hip: -3, shoulder: 88 },
      { name: "Drop",      t: .12, shin: 2, knee: 4,  hip: -1, shoulder: 40 },
      // ...
    ],
  },
}
```

## 3. Decisions proposed

1. **One figure on the workout screen, not side and front together.** Two figures halve the size on a phone viewed from a few feet away. Each movement stores a **default camera angle** (side for hinges and squats, front for lateral lunges, sumo stance and halos, ¾ for presses and rows), and Joe can drag to rotate.
2. **Side-by-side or orbiting views belong on a Library detail screen**, for learning a new movement, not mid-workout. Same data, so it's an easy later add.
3. **Keep the existing renderer as long as possible.** The simplest migration is a small function that samples the rig into the frame format `Figure` already animates (many frames plus `keyTimes`), so the SMIL-based renderer, pause behaviour and reduced-motion handling stay as they are. Only the camera drag would need new code.
4. **No new dependencies.** The rig is plain math, about 100 lines. Fits "no framework" and the single-file build.
5. **Migrate movement by movement.** A movement with `motion` uses the rig; one without keeps `poses`/`posesF`. `npm run check` validates whichever is present.

## 4. How this connects to ingestion

`vision-roadmap.md` §8 notes that an agent can't watch an Instagram video. That has changed: Joe now has an agent that watches a video and breaks it into phases with cues. What's missing is turning that into an animation. The rig format closes the gap:

1. The video agent splits the movement into phases, writes cues, and assigns `pattern` (as today, per `INGEST.md`).
2. A pose-estimation library (MediaPipe Pose is the common free option) extracts body landmarks frame by frame from the clip.
3. A script converts landmarks to rig angles and keeps the frames at each phase boundary.
4. The result lands as a `pending` movement with a `motion` block. Joe scrubs it on his phone and approves, same as today.

Known limits to plan for: the bell often hides a hand, side-on footage loses depth, and fast ballistic moves blur. The phone review step stays essential. Downloading video files from Instagram may conflict with their terms, so the input should be a screen recording or a source that allows it.

This also changes the case for the parked **pose editor**: with a rig, the editor is a few angle sliders per phase rather than dragging points, which makes Tier B authoring cheaper.

## 5. Slot template: six slots instead of five

This is a separate change from the rig and can be approved or rejected on its own.

Batch 3 plans a five-slot template: hinge, squat-or-lunge, push, pull, core. Joe has said the five came from mirroring the AMRAP format popular on Instagram, not from a training requirement, and he's open to changing it. Proposed: **six slots.**

| Slot | Draws from |
|---|---|
| Hinge | Hinge |
| Knee-dominant | Squat, Lunge |
| Push | Push |
| Pull | Pull |
| Core | Anti-extension, Anti-rotation (Rotation and Flexion as fallback) |
| Carry | Carry, Anti-lean |

Why:

- **Carries and anti-lean every session instead of sometimes.** With one core slot, carries compete with four other core types, and `vision-roadmap.md` §3 settles for "at least one carry" per week. At two or three strength days a week that's unreliable. A dedicated slot makes the cheapest hard whole-body work (§3's own description) a fixture.
- **More rest per pattern within a round.** With six stations, each pattern comes around less often, so later rounds of a hinge are done less fatigued. That favours form over pace, which matters more to Joe than round count.
- **Splits core into the two jobs that matter most:** resisting extension and rotation, and resisting side bend under load.

Costs:

- About one fewer round in a 20 to 25 minute session, and slightly less volume per movement.
- One more bell transition per round.
- Round counts from five-slot and six-slot sessions aren't comparable.

How to keep it reversible without an in-app toggle:

- **Define the template as data**, a short list of slots each naming the patterns it can draw from. Going back to five is removing one entry.
- **Record the template on each saved session** (for example `slots: 6`), so history and PRs stay honest if it ever changes. PRs only compare sessions with the same template.
- **No UI toggle for now.** It would need its own PR scoping and puts a rarely used setting on the workout screen; `vision-roadmap.md` rejected the 2-bell toggle on similar grounds. Revisit if Joe finds himself wanting to switch regularly.

Open items for review:

- How the six slots interact with focus chips (Upper, Lower, Core) and with Complex mode, where hybrids span several patterns. Does a hybrid fill one slot, or the slot of its first pattern?
- Pool depth: Carry and Anti-lean together have five movements today, Anti-rotation has one. Enough to fill the slots, thin for variety.
- Whether "five movements" in `AGENTS.md` and `vision-roadmap.md` §3 and §10 should be updated once this is decided.

The rig work doesn't block the slot template or depend on it; slots only need `pattern`.

## 6. Related items (no change proposed, noted for alignment)

- **Pool depth for slots:** Anti-rotation has one movement (plank pull-through). Worth a few more before the core slot rotates through the anti-movement types.
- **Optional movement flag for back-sensitive days:** a generic field such as `loads: ["endRangeExtension", "loadedRotation"]` on movements like windmill, Russian twist and heavy overhead work, so a future setting could steer around them. Open question, not a request to build.
- **Fitness-plan integration:** Joe trains strength 2 to 3 days a week alongside golf, swimming and running. Whether Bellwork should offer named strength days (A/B/C with a different lower-body emphasis each day) on top of the daily seeded circuit is open. `vision-roadmap.md` §11 says no second workout structure, so this would need Joe's decision first.

## 7. Questions for the Cursor review

1. Does sampling the rig into the existing `Figure` frame format fit cleanly, or does the camera drag make a canvas renderer the simpler path?
2. Any interaction with `checkAir`, `hold`, `bellFlip` or `frontOnly` that the rig needs to preserve?
3. Is the field shape in §2 compatible with how `check.mjs` and `INGEST.md` are organized?
4. What would you migrate first after the swing to prove the format on a different shape (a lunge, a press, a floor movement)?
5. On the six-slot template (§5): does defining slots as data fit `buildCircuit` cleanly, and how should focus chips and Complex hybrids map onto slots?

## 8. Suggested next step if approved

Build a slice on a branch: the rig module, the sampler, the swing migrated, and one contrasting movement (reverse lunge or overhead press). Joe reviews on his phone before anything else moves.
