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

`PATTERN_ORDER` today (Carry joins this list when the first carry ships):

```
Hinge, Squat, Push, Pull, Lunge, Rotation, Anti-rotation, Anti-extension, Anti-lean, Flexion
```

If you introduce a pattern not on that list (including `Carry`), add it to
`PATTERN_ORDER` in `movements.js` **before** shipping the entry — unknown
patterns sort to the front of every circuit (`indexOf` returns -1).

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

Groups already in use: `swing`, `press`, `goblet_squat`, `march`, `row`.
New families get a new snake_case group id (e.g. `racked_carry`). Leave the
field off when the movement has no near-sibling.

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

### Text-only is fine

If you can't get a figure right in this pass, omit `poses` / `posesF`. The
Library and circuit cards render name, pattern, reps, cue, grip, and tag dots.
Un-illustrated is a state to drain, not a tier — ship `pending: true` either way.

---

## 7. The workflow

1. Read Joe's drop (and `INBOX.md` if you're finishing queued work).
2. Decide: new entry, cue edit on an existing card, or decline (too subtle).
3. Draft the object in `movements.js`. New movements ship with `pending: true`.
4. `npm run build` then `npm run check`.
5. Show Joe the diff. **Wait for an explicit go-ahead before pushing.**
6. After push, the movement is live with `pending: true` — it appears in the
   Library Pending section and never enters a workout draw.
7. Joe approves in the gym ("Add to rotation") or by message. On a later pass,
   clear `pending` in the data file and fold any device approvals
   (`bellwork-approved` in localStorage) into that cleanup. Stale approval ids
   for movements that are no longer pending are ignored on purpose.

Never push without Joe's go-ahead. Pushing to `main` deploys the live site.

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
- [ ] Side and front pose counts match (unless `frontOnly`)
- [ ] `pending: true` on every new entry
- [ ] `npm run build` and `npm run check` both pass
- [ ] You have **not** pushed — waiting on Joe's go-ahead
