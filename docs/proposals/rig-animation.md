# Proposal: joint-angle rig for movement animation

Status: **proposal, not approved.** Nothing in the app changes until Joe approves a plan (see `AGENTS.md`).
Author: Claude, 2026-10-13. Reviewer: Cursor agent, then Joe.
Prototype: [`docs/prototypes/swing-rig.html`](../prototypes/swing-rig.html) (standalone page, not part of the build).
Also covers: a proposed change to the Batch 3 slot template, five slots to six (§5).

---

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
