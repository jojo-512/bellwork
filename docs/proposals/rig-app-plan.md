# Plan: putting the rig in the app

Status: **approved by Joe, 2026-10-14.** Step 1a built (rig, blocks, checks, review page; no change to the workout screen).
Author: Claude, 2026-10-14. Reviewed by an independent Claude subagent the same day; its findings are folded in below (§7 lists them).
Builds on: [`rig-animation.md`](./rig-animation.md) §0 (the rig), [`rig-ingest.md`](./rig-ingest.md) (the flow and checks), and the five prototypes in `docs/prototypes/`.

---

## 1. What changes

| Today | After |
|---|---|
| Each movement stores hand-placed `[x, y]` points for side (`poses`) and front (`posesF`) | Each movement stores `rig`: a short list of phases (pelvis, lean, twist, hand and foot targets, which hand holds the bell and how, elbow preset, timing). Each view is a camera on the same 3D figure |
| `Figure` animates SVG lines with SMIL, straight lines between frames | `RigFigure` draws on a canvas: smooth timing, near limbs drawn over far ones, far limbs dimmed |
| `poses.js` holds the `S_*` / `F_*` vocabulary | `blocks.js` holds the named building blocks (`hinge`, `rack`, `squat_bottom`, elbow presets...) from `rig-ingest.md` §2 |
| `check.mjs` checks point pairs and bell-to-hand distance | `check.mjs` also runs the rig checks (§3.5) on both sides |
| Each prototype carries its own copy of the rig code | One `rig.js` that the app, the check and the review page share |

Movements keep everything else as is: id, name, tags, pattern, reps, `dur`, cue, grip, pools, `pending`, `twoBell`. Circuits, history, PRs and the timer are untouched.

## 2. Decisions (Joe's calls)

1. **Renderer: canvas.** The prototypes Joe approved draw on canvas, so what he approves is what ships. Canvas redraws each frame back to front, so the bell and limbs pass in front of and behind each other correctly. SVG fixes the draw order for the whole animation; in one clean + squat + press rep the order changes 11 times in the side view and 21 times in the front view. Canvas needs the phone-specific work in §3.3.
2. **Ship per batch.** Each batch reaches the gym as soon as Joe approves it. Old and new figures sit side by side until the pool is converted, then the old renderer is deleted (§4).
3. **Views: any two of side, front and three-quarter, chosen per movement.** Default side and front. Claude suggests three-quarter on the review page where it reads clearly better (halos, around-the-world, lateral lunge, lunge + twist are the likely ones), and Joe confirms on his phone when he approves the movement. A movement can also show one view only (today's `frontOnly`, e.g. figure-8). Card labels follow the views.
4. **Sides.** Movements done one side at a time ("6 / side") show the right side. Movements that alternate every rep (renegade, "/ dir", alternating hands, lunge + twist) play a right rep then a left rep, as the lunge + twist and dead bug prototypes do. Set per movement with `sides: "right" | "alternate"`.

## 3. Pieces

1. **`rig.js`** (pure math, no React, about 300 lines): skeleton and bone lengths, two-bone IK with pole vectors, pelvis tilt and spine lean and twist, the Hermite sampler that holds flat stretches flat, bell states (hanging, racked, horns, bottoms up, floor) with the per-phase `rack` blend, mirroring, cameras. Merged from the five prototypes, which each carry a slightly different `solve()`, into one version that covers standing, split stance and lying.
   - **Fixed framing,** not the prototypes' per-movement zoom: one scale for standing and one for lying, so every card shows the figure at the same size, as today.
   - **Fixed depth shading:** far limbs dim by a fixed depth scale, not one recalculated each frame (which makes a still leg pulse).
2. **`blocks.js`**: pure data, expanded at load into the raw phase values, so the sampler, checks and renderer read one thing. A phase reads `{ body: "hinge", hand: "between_legs", el: "hang" }` with small overrides where a movement needs them. Same words as the notes spec.
   - Hand blocks say whether they follow the torso (rack, goblet, overhead) or hang with gravity (hang, between the legs).
   - Elbow presets cover standing (`hang`, `pull`, `rack`, `press`, `row`) and floor work (`floor_press`, `dead_bug`), plus the free arm.
3. **`RigFigure`** in `bellwork.jsx`: a canvas in the card, the existing colours, a `view` prop for the camera. Built for the phone:
   - one shared animation loop at 30 frames a second that draws only figures on screen (IntersectionObserver);
   - full-resolution backing only while on screen, sharpness capped at 2× in the Library, so 58 figures stay inside iPhone Safari's canvas memory limit;
   - registered once per movement, so the timer's once-a-second re-render doesn't restart it;
   - reduced motion draws one still phase (the movement's `still`, or its first) and doesn't animate, matching today's `animate={!reduced}`.
4. **Data:** `rig` on the movement in `movements.js`. Example shape, from clean + squat + press:
   ```js
   dur: 3.4,
   rig: {
     still: "Rack", sides: "right", views: ["side", "front"],
     feet: "hip_width", kneeOut: 0.12,
     phases: [
       { name: "Hike", t: 0.40, body: "hike", hand: "between_legs", bell: { on: "R", state: "hanging" }, el: "hang" },
       { name: "Rack", t: 0.30, body: "stand", hand: "rack", bell: { on: "R", state: "racked" }, el: "rack" },
       { name: "Lockout", t: 0.25, body: "stand", hand: "overhead", bell: { on: "R", state: "racked" }, el: "press", lock: ["R"] },
       // ...
     ],
   }
   ```
   - `bell.on` is per phase (`R`, `L`, `horns`, `handle`, `floor`), because Complex movements change hands mid-rep: swing + squat goes handle to horns, gorilla + sumo alternates hands, figure-8 and around-the-world pass hand to hand.
   - `lock` marks the phases that should reach full lockout, so the check knows which ones they are.
   - `dur` stays where it is today, so there's one duration per movement.
5. **`check.mjs`** adds the rig checks, run on every movement with `rig`, on both sides, sampled through the whole rep. As today, a pending movement warns and an approved one fails. No new dependencies.
   - **Reach:** no target past full reach (the IK quietly clamps one today), and every `lock` phase at least 95% of reach.
   - **Floor:** nothing below the floor; the bell off the floor except where it's meant to rest there.
   - **Clearance:** the bell clear of head, torso and legs.
   - **No snaps on any joint,** not just the bell: in clean + squat + press the elbow, not the bell, peaks fastest (5.9 m/s at the start of the press). Plus a guard against an elbow direction lining up with the arm, which lets the elbow jump about 25 cm in one frame.
   - **Hand-offs:** where `bell.on` changes, both hands are within a few centimetres.
   - **Planted feet** don't move.
   - **Framing:** everything stays inside the card in each view the movement shows.
6. **Review page:** the contact sheet (`contact.html`, already built by `npm run build`) gains a rig mode: a picker of movements, side, front and three-quarter playing, one still per phase in each view, a scrub bar and ½× speed, and a mark on the views the card will show. This replaces the one-off prototype pages. Claude screenshots it with the Playwright already in its environment (not a repo dependency) for its own checks, and publishes it to Joe for phone review.

## 4. Order of work

**Step 1a (one PR): the rig without the app.** `rig.js`, `blocks.js`, the rig checks, the contact sheet's rig mode, and clean + squat + press as data. Nothing on the workout screen changes, so Joe approves it on the review page alone.

**Step 1b (one PR): the rig in the app.** `RigFigure` and its loop, the card and Library switch, and three Complex movements that share the rack: clean + squat + press, clean + press and thruster. Joe reviews them on the review page and in a private preview of the built app (published from this session, since Pages only deploys `main`; history and approvals are empty there), then it merges with his go-ahead.

The switch touches more than the card: `hasPoses` (card, Library count), the Library's side/front toggle, and the contact sheet's frame rows all read the old pose lists. A movement with `rig` uses `RigFigure` in each of those; one without keeps `Figure`.

**Then Complex in four more batches,** grouped so each batch shares building blocks:

| Batch | Movements | New blocks it needs |
|---|---|---|
| 2. Lunges | lunge + twist (prototype exists), clean + lunge, lateral lunge + press | split stance, lateral lunge |
| 3. Hinge and pull | swing + squat, RDL + row, swing + high pull, gorilla + sumo | hike, swing float, row elbow, handle to horns, hand switch |
| 4. Halos and figure-8s | halo + press, figure-8 hold, around-the-world squat, curl + halo, halo march | bell circling the head, hand-to-hand pass |
| 5. Floor, snatch and the rest | sit-up + press, renegade, bottoms-up press, squat + press-out, clean + carry, snatch + lunge, snatch + overhead carry | lying, plank, bottoms up, walking feet, the snatch's flip over the hand |

That's all 22 Complex movements (clean + press, thruster and sit-up + press are in both pools, so they convert here). Snatch + lunge sits with snatch + overhead carry because both need the snatch's flip. The three pending carries stay pending until Joe approves them in the app, as now.

**After Complex:** the 36 Standard-only movements, in batches planned the same way. Then the old system is deleted: `Figure`, `headFrom`, `SIDE_SEGS`/`FRONT_SEGS`, `keyTimesFor`, `hasPoses`, `poses.js`, the old pose checks in `check.mjs`, the contact sheet's old frame rows, and the fields `poses`, `posesF`, `hold`, `t`, `bellFlip` and `frontOnly` (replaced by `views`).

**Time:** steps 1a and 1b together are about two sessions of Claude time. Each later batch is 2 to 3 hours of Claude time, because every phase is checked in three views and most batches extend the rig, plus about two rounds of Joe's phone review. Batch 4 is the hardest; halos are where the old figures were weakest and where the rig needs the most care.

## 5. Risks

- **Battery, smoothness and memory** with several canvases. Handled in §3.3; checked on Joe's phone in step 1b.
- **Halos and figure-8s** need the bell to circle the head and pass between hands. Not tried on the rig yet. If batch 4 can't get them right, those movements keep their old figures until it can, and the review page says so.
- **The rig's known gaps** (`rig-animation.md` §0): one rigid spine, toes can't turn out, the head doesn't move back for a press. They show in a few movements; none blocked the five prototypes.
- **Two renderers during conversion.** Kept to one switch per place a figure is drawn, and deleted at the end, per the decision to convert before new videos.

## 6. Not in this plan

New movements from video (they wait for conversion), the six-slot template (`rig-animation.md` §5), and a pose editor.

## 7. What the review changed

- Bell hand per phase (`bell.on`) and a hand-off check: the prototypes never change hands, several Complex movements do.
- Speed check on every joint, a guard on elbow direction, reach fails past 100%, `lock` marks lockout phases.
- Alternating movements play right then left (decision 4 changed from right only).
- Views chosen per movement, any two of three (decision 3 widened, confirmed with Joe).
- Fixed framing and fixed depth shading instead of the prototypes' per-movement zoom and per-frame shading.
- Phone memory limits for the Library and a 30 fps loop.
- The switch touches card, Library and contact sheet, not one `if`.
- Slice 1 split into 1a (rig and review page) and 1b (the app).
- Time estimates roughly doubled; snatch + lunge moved to the last batch.
- `dur` stays top-level; the deletion list is spelled out.
