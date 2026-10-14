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

---

## 2. The schema, field by field

Add new entries to `movements.js` (pose primitives live in `poses.js`). Every
entry is a plain object in `STANDARD` or `HYBRIDS`, then `EXERCISES` combines
them.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | snake_case, unique across the whole pool |
| `name` | yes | Title case, what Joe reads on the card |
| `tags` | yes | Subset of `upper` / `lower` / `core` / `full`. The **first** tag drives the card colour |
| `pattern` | yes | Must be in `PATTERN_ORDER` (see below) |
| `reps` | yes | Plain string — `"15 reps"`, `"6 / side"`, `"6 / dir"`, `"20 steps"`, `"30 s"` |
| `dur` | when poses exist | Animation length in seconds (current pool sits around 1.5–3.4) |
| `pools` | yes | See the pools rule below |
| `variantGroup` | optional | See the variantGroup rule below |
| `pending` | ship as `true` | New movements always land pending |
| `cue` | yes | One or two sentences of form coaching |
| `grip` | yes | How the hand holds the bell |
| `poses` | optional | Side-view keyframes; omit for a text-only card |
| `posesF` | optional | Front-view keyframes; required if `poses` is set (unless `frontOnly`) |
| `twoBell` | optional | `true` when a second bell is optional — shows a badge, not a toggle |
| `frontOnly` | optional | `true` when the side view doesn't help (e.g. floor work shown head-on) |
| `bellFlip` | optional | `true` when the bell is bottoms-up — the figure draws the handle below the mass |

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

## 6. The pose vocabulary

Figures draw in a **200×200** viewBox. The ground line is at **y=178**.
Coordinates are `[x, y]` with **y increasing downward**. Prefer **2–3 poses**
per movement (keyframes the SVG interpolates between).

### Side view — required keys

`hip`, `sh`, `el`, `ha`, `kn`, `an`, plus `bell: [x, y]`.

Optional extras used by marches and lunges: `kn2`, `an2` (the trailing /
alternating leg).

Build with `P(hip, sh, el, ha, kn, an, extra)` from `poses.js`, or compose
from the shared primitives:

- `S_HINGE`, `S_RACK`, `S_OH`, `S_GOBLET`, `S_SQUAT`, `S_RACKSQ`, `S_LUNGE_R`, `S_SWTOP`

### Front view — required keys

`hip`, `sh`, `elR`, `haR`, `elL`, `haL`, `knR`, `anR`, `knL`, `anL`, plus `bell`.

Build with `FS({ ...overrides })`, or compose from:

- `F_RACK`, `F_OH`, `F_GOBLET`, `F_SQUAT`, `F_RACKSQ`, `F_HINGE`, `F_LUNGE`

### Head

You usually don't set `head`. `headFrom` in the app derives it from the hip→shoulder
vector, 13 units past the shoulder. Only set `pose.head` when that looks wrong.

### Hold and timing (optional)

Leave these off and the figure is unchanged: the bell stays with the nearest
hand, and the frames are evenly spaced.

`hold` is where the bell is. Set the same value on the side frame and the
front frame. The check fails (or warns, if the lift is pending) when they
disagree.

| `hold` | What it draws and what the check allows |
|---|---|
| `R` / `L` | Bell within 18 of that hand. The side view has one arm — that arm is the working hand. |
| `both` | Two-hand grip. On the front view the bell must be within 18 of each hand. |
| `air` | One weightless frame. The bell may leave the hand. It has to sit above the hands, the frames before and after must be a hand hold (`R`, `L`, `both`, or omitted), and `t` must be ≤ 0.6. Two `air` frames in a row fail. |
| `floor` | Bell set down, center near the ground (`y` ≥ 160). It does not have to stay in the hand. |
| `none` | Bell is not drawn on that frame. |

`t` is the relative time from this frame to the next, including the loop back
to frame 1. The default is `1`, which is today's even spacing. A smaller `t`
is a snap or a short float; a larger `t` holds. The numbers are weights, not
seconds — `dur` is still the length of the whole loop. Put the same `t` on
the side frame and the front frame.

`ballistic_row` is the example: `hold: "air"` on the float, with a short `t`,
so the bell changes hands instead of sliding from palm to palm.

### Shoulders (optional)

Leave these off and the figure is unchanged: both arms still leave the one
`sh` point, and the head still sits on the hip→`sh` line.

`neck` is the top of the spine. The head is derived from hip→`neck` (13 units
past it), and it defaults to `sh`. Set it when a shoulder moves and the head
should stay.

`shR` and `shL` are the front shoulder points the arms attach to. Set them
together. Each one gets its own line from `neck` (`neck`→`shR` and
`neck`→`shL`). There is no bar drawn straight across both shoulders. The
check caps the span at 40 and requires `neck` (or `sh`, if you omitted
`neck`) to sit between the two points.

Pose helpers in `poses.js`. They add keys; they don't replace the pose.

| Helper | What it does |
|---|---|
| `twist(pose, deg)` | Front only. Positive degrees lift the right shoulder toward the ear and narrow the chest; the left stays down. Negative lifts the left. `twist(pose, 0)` opens a resting V under the neck. Neck stays put, so the head stays. |
| `shrug(pose, side, lift)` | Raises `R`, `L`, or `both` along its own line from the neck. Neck stays. On a side pose the one shoulder rises off `neck`. |
| `mirror(pose)` | Swaps right and left and reflects x across the center of the box. `hold` flips `R` ↔ `L`. |
| `withHold(pose, hold)` | Sets `hold`. |

`rotational_gorilla_row` is the turn: a hinge, a row, and the working shoulder rising off the neck while the other stays down on the knee. The side view is still one arm. `unilateral_shrug` lifts one collarbone toward the ear. The head stays on `neck`.

### Text-only is fine

If you can't get a figure right in this pass, omit `poses` / `posesF`. The
Library and circuit cards render name, pattern, reps, cue, grip, and tag dots.
Un-illustrated is a state to drain, not a tier — ship `pending: true` either way.

---

## 7. The workflow

Joe sends one lift. You answer once. He replies once. That reply is the push
OK for **that lift's commit only** — not a standing approval, and not a push
OK for an app or schema change.

1. **Joe sends** `ingest: <name>, <reps>` in Project chat. A link is optional.
   Screenshots are optional and useful: the start position and the hardest
   position. Read `INBOX.md` if you are finishing queued work.
2. **Decide:** new entry, cue edit on an existing card, or decline (too subtle).
   Draft the object in `movements.js`. A new movement is `pending: true` until
   he replies **approve**.
3. **`npm run build` then `npm run check`.** Schema problems fail the check.
   The pose checks (bell off the hand — or off the hand named by `hold` —
   a standing leg that stretches, a foot off the ground line, a shoulder bar
   wider than 40 or a neck that misses the bar, plus the `air`
   rules in §6) **warn** on a pending lift and **fail** the check on a lift
   already in rotation. Fix every warning on the lift you are authoring. Warnings on other pending lifts are the known backlog — do not
   redraw them in this pass. Thresholds and the skips (floor work, kneeling,
   wide splits, arm length across frames) are at the top of the pose section
   in `check.mjs`.
4. **Look at the contact sheet before you show Joe.** Open
   `contact.html?id=<id>` (built by `npm run build`; any static server, or
   the file itself). It is a review page, separate from the workout. One
   movement, keyframes large, side and front, numbered **1…n**. Screenshot
   the sheet, compare it to his stills and the cue, and fix the figure
   yourself — up to about 3 rounds. If you cannot get the shape right, omit
   `poses` / `posesF` and ship text-only with `pending: true`.
5. **One message.** Contact sheet image, a short loop of side and front, the
   classification line (pattern, pools, variant group, reps, cue), and the
   reply words **push · approve · redo · drop**.
6. **His reply:**
   - **approve** — clear `pending` in `movements.js`, commit, push. The lift
     enters the pool. No phone tap.
   - **push** — commit with `pending: true`, push. It stays Library-only.
     Later, `approve <lift>` is a one-line flip and push; that reply is the
     push OK for the flip.
   - **redo** — back to step 3 with his note (`redo 3: bell behind the head`).
     Nothing has been pushed. Frame numbers match the sheet.
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

No `id`, or an unknown one, lists every movement. `frontOnly` shows the front
row only. A text-only card says so. The loop under the frames is for the clip
in the review message; the numbered frames are what he marks up.

---

## 8. Worked example — `clean_carry`

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
  poses: [
    P([96, 122], [124, 98], [116, 118], [104, 138], [104, 150], [100, 176], { bell: [100, 145] }),
    S_RACK,
    P([100, 106], [100, 68], [110, 86], [110, 70], [116, 124], [116, 148], { bell: [115, 66], kn2: [84, 150], an2: [78, 176] }),
    P([100, 106], [100, 68], [110, 86], [110, 70], [100, 141], [100, 176], { bell: [115, 66], kn2: [116, 124], an2: [116, 148] }),
  ],
  posesF: [
    F_HINGE,
    F_RACK,
    FS({ hip: [100, 106], sh: [100, 68], elR: [114, 84], haR: [110, 68], knR: [112, 128], anR: [112, 156], knL: [90, 141], anL: [90, 176], bell: [113, 62] }),
    FS({ hip: [100, 106], sh: [100, 68], elR: [114, 84], haR: [110, 68], knR: [108, 141], anR: [110, 176], knL: [88, 128], anL: [88, 156], bell: [113, 62] }),
  ],
}
```

Why these choices: it's a two-part chain → Complex only; Carry is the pattern
that matters for the day, not Hinge; it shares no group with the marches
(`march`) so a Lower/Core day can still hand both a march and a carry; `pending:
true` so a wrong figure can't ruin a session.

---

## 9. Self-check before showing the diff

- [ ] `id` is unique snake_case; `name` reads cleanly on a phone card
- [ ] First tag is the colour you intend; all tags are upper/lower/core/full
- [ ] `pattern` is in `PATTERN_ORDER` (add it there first if new)
- [ ] `pools` follows the one-line rule above
- [ ] Near-siblings share a `variantGroup`; no group collision you didn't mean
- [ ] `reps` is a plain string; `dur` is set if there are poses
- [ ] Every pose has the required keys and a `bell: [x, y]`
- [ ] If you set `hold` or `t`, the side and front frames agree, and an `air` frame is a single short float above the hands
- [ ] If you set `shR` / `shL`, both are set, the span is at most 40, and `neck` sits between them. Omit them and the figure matches today
- [ ] Side and front pose counts match (unless `frontOnly`)
- [ ] Prefer composing from `S_*` / `F_*` primitives over inventing coordinates
- [ ] `pending: true` on a new entry you have not been told to approve
- [ ] `npm run build` and `npm run check` — no schema errors; no pose warnings on **this** lift
- [ ] You opened `contact.html?id=<id>`, and the numbered frames match the cue and his stills
- [ ] You have **not** pushed — his **approve** or **push** reply is the push OK for this lift

## 10. Lessons from canon pass 1

Things that bit once, so they shouldn't bite again:

1. **Add the pattern to `PATTERN_ORDER` before the first entry that uses it.**
   Carry went in first; without it, every carry sorted to the front of every
   circuit.
2. **Pose count mismatch fails `npm run check`.** Side and front arrays must
   be the same length (unless `frontOnly`). Pad by repeating a hold pose if
   the front view needs more frames.
3. **Travel vs march is a cue line**, not a new card. The suitcase and racked
   marches already say "Room to walk? Travel instead of marching in place."
4. **Compose from the vocabulary.** The `clean_carry` example and the rest of
   pass 1 are almost entirely `S_HINGE` / `S_RACK` / `S_OH` / march `kn2`/`an2`
   extras. If you need a shape that isn't there, ship text-only (`poses`
   omitted) with `pending: true` rather than inventing a bad figure.
5. **Carries get their own variant groups** (`racked_carry`, `oh_carry`), not
   `march`. Marches stay Anti-lean.
6. **Look at the sheet before Joe does.** `npm run check` does not know whether
   a figure reads as the lift. Swing + high pull can pass the pose checks and
   still look like an upright row. The contact sheet is the review.
7. **Pose warnings on other pending lifts are not your job** during a one-lift
   ingest. Fix the lift he named. The checks warn on pending and fail on a
   lift that's already in rotation.
