# INGEST — how to add a movement to Bellwork

This file is the whole instruction set. A fresh agent session with only this
repo should produce an entry indistinguishable from the last one. Do not look
elsewhere for classification rules.

---

## 1. What Bellwork is

Bellwork is a one-bell kettlebell AMRAP timer for gym use on an iPhone. Each
day it draws a five-movement circuit from a Standard pool (single lifts) or a
Complex pool (chained hybrids). The product promise: an easy 20–30 minute
workout you can do day after day, working the whole body, and end up in a much
better place 90 days later. Judge every entry against that.

The figure is the pelvis-rooted rig. There is one renderer.

---

## 2. The schema, field by field

Add new entries to `movements.js`. Every entry is a plain object in `STANDARD`
or `HYBRIDS`, then `EXERCISES` combines them. Named positions live in
`blocks.js`. The check rejects `poses`, `posesF`, `frontOnly`, and `bellFlip`.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | snake_case, unique across the whole pool |
| `name` | yes | Title case, what Joe reads on the card |
| `tags` | yes | Subset of `upper` / `lower` / `core` / `full`. The **first** tag drives the card colour |
| `pattern` | yes | Must be in `PATTERN_ORDER` (see below) |
| `reps` | yes | Plain string — `"15 reps"`, `"6 / side"`, `"6 / dir"`, `"20 steps"`, `"30 s"` |
| `dur` | yes | Length of one rep in seconds. Stays on the movement, not inside `rig`. The pool sits around 1.5–5.0 |
| `pools` | yes | See the pools rule below |
| `variantGroup` | optional | See the variantGroup rule below |
| `pending` | ship as `true` | New movements always land pending. The card still shows the rig |
| `cue` | yes | One or two sentences of form coaching |
| `grip` | yes | How the hand holds the bell |
| `twoBell` | optional | `true` when a second bell is optional — shows a badge, not a toggle |
| `rig` | yes | Phases on the rig. See §6 |

`PATTERN_ORDER` (Carry is on the list — add any new pattern here **before** the entry):

```
Hinge, Squat, Push, Pull, Lunge, Rotation, Anti-rotation, Anti-extension, Anti-lean, Flexion, Carry
```

If you introduce a pattern not on that list, add it to `PATTERN_ORDER` in
`movements.js` **before** shipping the entry — unknown patterns sort to the
front of every circuit (`indexOf` returns -1).

---

## 3. The pools rule (verbatim)

- A **single movement** gets `pools: ["standard"]`.
- A **sequence of two or three lifts** gets `pools: ["complex"]`.
- A chain you'd count as **one lift**, or a single movement hard enough to
  earn a Complex day, gets `pools: ["standard", "complex"]`.

That's the whole rule. Examples already in the pool: `clean_press`,
`thruster`, and `situp_press` are the three double-members.

---

## 4. The variantGroup rule

Same pattern and same basic shape as an existing movement → share its
`variantGroup` so they never land in one circuit. The picker enforces **at
most one per group per circuit**, including on Swap.

Groups already in use: `swing`, `press`, `goblet_squat`, `march`, `row`,
`racked_carry`, `oh_carry`. New families get a new snake_case group id. Leave
the field off when the movement has no near-sibling. Carries do **not** share
the `march` group — a day can hand both a march and a carry.

---

## 5. When to author nothing

Tempo, pause, and "room to walk? travel instead of marching" are **cue lines
on the existing card**, not new entries. A difference too subtle for a cue
line is not an entry at all. Prefer editing the cue over minting a near-duplicate.

---

## 6. The rig

A movement the app cannot draw does not ship. There is no text-only card.
`pending: true` keeps it out of the workout until Joe approves it. The Library
and the circuit still show the figure.

Open a movement that is already right and match its shape. `swing` is the
short two-hand hinge. `clean_carry` is a chain that walks. `windmill` is the
side-bend (`roll`). The named blocks, and the words the notes use, are in
`blocks.js` and [`docs/proposals/rig-ingest.md`](docs/proposals/rig-ingest.md) §2.

```js
rig: {
  still: "Float",             // phase name drawn when reduced motion is on
  sides: "right",             // or "alternate": a right rep, then a left rep
  views: ["side", "front"],   // one or two of side, front, quarter, in card order
  feet: "hip_width",
  on: "handle",               // R, L, handle, horns, floor, or air. A phase can override on
  phases: [
    { name: "Hike", t: 0.35, body: "hike", handR: "backswing", handL: "backswing", elR: "hang", elL: "hang", fling: 1 },
  ],
}
```

`t` on a phase is the time to move from that phase to the next, in the same
units the sampler already uses. It is not a stick-figure frame weight. `dur`
is still the length of the whole loop.

`views` defaults, when you are choosing, to side and front. Use three-quarter
where side or front hides the movement: a lateral step, a twist, a halo.
Order is the order of the panels on the card. One view is allowed. None of
the current pool uses a single view. Do not sort the array.

`fling` from 0 to 1 tips the bell out along the forearm. 0 hangs under the
hands. 1 is bottoms-up. `on: "air"` lets go of the bell for a moment. Do not
set `bellFlip`.

`validateRig` checks the shape: feet, `on`, `sides`, `views`, phase names,
phase `t`, blocks, `still`. `checkRig` then samples the rep on both sides:
reach, lockout, floor, bell clearance, joint speed, bend direction, hand-offs,
planted feet, framing in each view the card shows. Those checks do not know
whether the rep reads as the lift. The contact sheet is that check.

---

## 7. The workflow

Joe sends one lift. You answer once. He replies once. That reply is the push
OK for **that lift's commit only** — not a standing approval, and not a push
OK for an app or schema change.

1. **Joe sends** `ingest: <name>, <reps>` in Project chat. A link is optional.
   Screenshots are optional and useful: the start position and the hardest
   position. Read `INBOX.md` if you are finishing queued work.
2. **Decide:** new entry, cue edit on an existing card, or decline (too subtle).
   Draft the object in `movements.js`, with a `rig`. A new movement is
   `pending: true` until he replies **approve**.
3. **`npm run build` then `npm run check`.** Schema problems fail the check,
   including a missing `rig` and any legacy pose field. Rig geometry **warns**
   on a pending lift and **fails** the check on a lift already in rotation.
   Fix every warning on the lift you are authoring. Warnings on other pending
   lifts are not yours to redraw in this pass.
4. **Look at the contact sheet before you show Joe.** Open
   `contact.html?id=<id>` (built by `npm run build`; any static server, or
   the file itself). It is a review page, separate from the workout. Side,
   front, and three-quarter play. Each phase is a still in each view. The
   views the card will show are marked "on card". Screenshot the sheet,
   compare it to his stills and the cue, and fix the figure yourself — up to
   about 3 rounds. If you cannot get the shape right, do not ship the entry.
5. **One message.** Contact sheet image, a short loop, the classification
   line (pattern, pools, variant group, reps, cue), and the reply words
   **push · approve · redo · drop**.
6. **His reply:**
   - **approve** — clear `pending` in `movements.js`, commit, push. The lift
     enters the pool. No phone tap.
   - **push** — commit with `pending: true`, push. It stays Library-only.
     Later, `approve <lift>` is a one-line flip and push; that reply is the
     push OK for the flip.
   - **redo** — back to step 3 with his note. Nothing has been pushed. Phase
     names on the sheet are what he marks up.
   - **drop** — do not ship it.
7. The phone **Add to rotation** button stays as a backup. On a later pass,
   fold device approvals (`bellwork-approved` in localStorage) into
   `movements.js`. Stale ids for movements that are no longer pending are
   ignored on purpose.

App and schema changes still need their own plan, diff, and push OK. Pushing
to `main` deploys the live site.

### Contact sheet

```
contact.html?id=swing_high_pull
```

No `id`, or an unknown one, lists every movement under "On the rig". The
loop and the phase stills are the review. The card shows only the views in
`rig.views`, in that order.

---

## 8. Worked example — `clean_carry`

Classification, not a second copy of the phases. The figure is the `rig`
already on `clean_carry` in `movements.js`. Match that shape. Do not add
`poses`.

```js
{
  id: "clean_carry",
  name: "Clean + racked carry",
  tags: ["full", "core"],
  pattern: "Carry",
  reps: "20 steps",
  dur: 2.8,
  pools: ["complex"],
  variantGroup: "racked_carry",
  pending: true,
  cue: "Clean to the rack, then walk tall. Ribs down — the carry is the work, not the clean.",
  grip: "Loose hook on the clean, rack grip — bell on the forearm — through the walk.",
  twoBell: true,
  rig: {
    still: "Walk",
    sides: "right",
    views: ["side", "front"],
    // phases: the clean, then the racked walk. Copy them from movements.js.
  },
}
```

Why these choices: it's a two-part chain → Complex only; Carry is the pattern
that matters for the day, not Hinge; it shares no group with the marches
(`march`) so a Lower/Core day can still hand both a march and a carry;
`pending: true` so it stays out of the workout until the figure is approved.
The sketch above is not a shippable `rig`. `validateRig` requires `feet`,
`on`, and at least two phases. Use the entry in `movements.js`.

---

## 9. Self-check before showing the diff

- [ ] `id` is unique snake_case; `name` reads cleanly on a phone card
- [ ] First tag is the colour you intend; all tags are upper/lower/core/full
- [ ] `pattern` is in `PATTERN_ORDER` (add it there first if new)
- [ ] `pools` follows the one-line rule above
- [ ] Near-siblings share a `variantGroup`; no group collision you didn't mean
- [ ] `reps` is a plain string; `dur` is a positive number on the movement
- [ ] `rig` is present. No `poses`, `posesF`, `frontOnly`, or `bellFlip`
- [ ] `views` is one or two of `side`, `front`, `quarter`, in the order the card should show them
- [ ] `sides` is `"right"` or `"alternate"`. Phase `t` values are on the phases, and they are positive
- [ ] `still` names a real phase
- [ ] `pending: true` on a new entry you have not been told to approve
- [ ] `npm run build` and `npm run check` — no schema errors; no rig warnings on **this** lift
- [ ] You opened `contact.html?id=<id>`, and the phases match the cue and his stills in side, front, and three-quarter
- [ ] You have **not** pushed — his **approve** or **push** reply is the push OK for this lift

## 10. Lessons from the pool

Things that bit once, so they shouldn't bite again:

1. **Add the pattern to `PATTERN_ORDER` before the first entry that uses it.**
   Carry went in first; without it, every carry sorted to the front of every
   circuit.
2. **A movement without a `rig` does not ship.** The check fails. Do not leave
   a text card behind "for later."
3. **Travel vs march is a cue line**, not a new card. The suitcase and racked
   marches already say "Room to walk? Travel instead of marching in place."
4. **Compose from the blocks.** If you need a position that isn't in
   `blocks.js`, say so and keep the override on that phase. Do not invent a
   stick figure.
5. **Carries get their own variant groups** (`racked_carry`, `oh_carry`), not
   `march`. Marches stay Anti-lean.
6. **Look at the sheet before Joe does.** `npm run check` does not know whether
   a figure reads as the lift. Swing + high pull can pass the rig checks and
   still look like an upright row. The contact sheet is the review.
7. **Rig warnings on other pending lifts are not your job** during a one-lift
   ingest. Fix the lift he named. The checks warn on pending and fail on a
   lift that's already in rotation.
8. **Do not delete phase `t` thinking it is the old frame weight.** Phase `t`
   is the timing. The old per-frame `t` and `hold` left with `poses`.
