# Bellwork Batch 2 — plan for approval

Status: **v1.0 — shipped to `main` 2026-09-30.** Live: https://jojo-512.github.io/bellwork/
Source of truth for product intent: [vision-roadmap.md](./vision-roadmap.md) §6–§8 and §10 (Batch 2)
Repo: https://github.com/jojo-512/bellwork · deploy record: Project `internal/batch-2-build-status.md`

---

## 1. What Batch 2 is for

**Adding a movement gets easy, then the pool gets deep.**

Today a new movement means hand-editing a 90KB single file with no written rule for how to classify
it, no way to see the stick figure before it starts showing up in real workouts, and two flag names
(`hybrid`, `advancedOnly`) that nobody can explain. That's why the pool has sat at 46 movements with
**one** pull-pattern movement in Complex — your primary mode.

So Batch 2 builds the loop first and uses it to fill the canon second. The loop is the thing you'll
still be using in six months; the content is what proves the loop works.

### Verified against the code today

I re-counted `bellwork.jsx` at `d53e729`. Batch 1 did not touch any movement data, so every number
in the roadmap still holds exactly:

| | Total | Standard | Complex |
|---|---|---|---|
| Movements | **46** | 32 | 17 (3 also Standard) |
| Pull | | 4 | **1** |
| Squat | | 2 | 3 |
| Lunge | | 2 | 3 |
| Anti-rotation / anti-extension / anti-lean | | 1 / 2 / 2 | **0 / 0 / 0** |
| Carry | | **0** | **0** |

Also confirmed: `advancedOnly` is a strict subset of `hybrid` (14 of 17), so the `pools` rename is a
genuine one-to-one mapping with no movement changing pool. The three double-members are
`clean_press`, `thruster`, `situp_press`, exactly as the roadmap says.

---

## 2. In scope

The seven Batch 2 items from roadmap §10, plus the two things the code review says they drag along:

1. `EXERCISES` moves out of `bellwork.jsx` into a data module.
2. `hybrid` + `advancedOnly` → one `pools` field; internal mode `advanced` → `complex`.
   **Plus the storage migration** — `"advanced"` is written into sticky prefs, the resumable run,
   *and* every session-log entry, and the PR lookup keys off it (`:1344`). Not migrating would
   silently reset your Complex PRs.
3. **`INGEST.md`** — the instruction file. The main deliverable of the batch.
4. `pending: true` staging — a Pending section in the Library, excluded from the workout draw, with
   an "Add to rotation" button whose approvals live on the device.
5. `variantGroup` — at most one movement per group per circuit, in the draw **and in Swap**.
6. Text-only cards — `poses` becomes optional so a movement can enter un-illustrated.
7. **The canon pass**, authored *through* the new loop, targeting the worst training defects first.

Plus: a movement-data validator so the loop can check its own work, and doc sync (`AGENTS.md`,
`BACKLOG.md`).

## 3. Out of scope

Everything in Batch 3 and 4 — slot template, recency-aware picking, swap-as-preference, compact
in-workout mode, the 13-week dot grid. Also still parked: pose editor, in-app Add Movement screen,
tempo/pause as separate entries, service worker, bodyweight and anything else Phase 2, focus
rotation (cut). The known midnight bug (the circuit doesn't refresh if the app stays open across
midnight, `:1189` deps) stays out unless it bites you.

**One thing I'd keep out that you might expect in:** the full canon list (~20 movements, taking the
pool to ~66). Decided at ~10 instead (§7 item 4) — the first content pass is small on purpose, for the
reason in §5.

---

## 4. Ordered work slices

Each slice ends with a working app and `npm run build` passing. One branch, one commit per slice, and
per `AGENTS.md` nothing is pushed until you see the diff and say go.

### Slice 1 — Movement data moves out of the app file *(pure move, zero behavior change)*

`bellwork.jsx` is 1,820 lines and the movement array is 690 of them (`:57–748`). The pose vocabulary
(`P`, `FS`, `S_*`, `F_*` at `:30–55`) is data too — it exists only to compose movement entries — so it
moves with them. `SIDE_SEGS` / `FRONT_SEGS` / `Figure` are the renderer and stay.

Result: three files instead of one, with `bellwork.jsx` still the app. esbuild already follows
imports, so `build.mjs` and `index.template.html` don't change and the output is still a single
self-contained `index.html`.

**Tradeoff, honestly:** this costs a little of the "one file to understand" property you value. I
think it's worth it — a movement diff becomes readable — and three files with a header comment each
is still something you can hold in your head. **Decided: three files** (§7 item 1).

**How we know it worked:** movement count is still 46, and the circuit for a fixed date/focus/mode/salt
is identical before and after.

### Slice 2 — `pools` rename and the `complex` rename, with migration

Two renames and one data migration, still zero intended behavior change.

- `hybrid` / `advancedOnly` → `pools: ["standard"] | ["complex"] | ["standard","complex"]`. Mechanical
  at `:778–782` (`poolFor`) and `:992–995` (Library groups).
- Internal mode string `"advanced"` → `"complex"`: `:1448` (chips), `:1483`, `:1659`, and the stale
  header comment at `:6`.
- **Migration, the part with actual risk.** `"advanced"` is persisted in `bellwork-prefs` (`:1173`),
  `bellwork-run` (`:1182`), and every entry in `bellwork-sessions` (`:1298`), and the PR key is
  `focus|mode|weight` (`:1342–1344`). Read-time normalization maps `"advanced"` → `"complex"` on load
  for all three, the session log is rewritten once so exports are consistent, and `importSessions`
  (`:910`) accepts both spellings forever. Your Complex PR history survives the rename.

**Why this is second and not later:** it's the prerequisite for `INGEST.md`. An agent can't classify
new movements against a rule nobody can state, and "a single movement gets `["standard"]`, a chain
gets `["complex"]`, a chain you'd count as one lift gets both" is a rule you can state in one line.

### Slice 3 — The three schema features the loop needs

These are the app-side changes that make a staged, un-illustrated, variant-aware movement safe to
add. All three are small; they're grouped because they touch the same two functions.

**3a. `pending: true`.** Excluded from `poolFor` unless approved. A Pending section in the Library
where you can watch the figure loop in the gym, and an "Add to rotation" button that writes the id
to a new device key (`bellwork-approved`). The agent folds those approvals into the data file on its
next pass; stale ids for movements that are no longer pending are ignored.

*The one wrinkle worth deciding:* approving a movement changes the pool, which changes what
`buildCircuit` returns for today's seed. If you approve something mid-session, today's circuit could
shift under you on the next reload. Cleanest fix is to store the five picked ids in the resumable-run
record at START and restore those, which also makes resumed runs exact. **Decided: freeze the ids**
(§7 item 9).

**3b. `variantGroup`.** One field, one rule: at most one movement per group per circuit — enforced in
both passes of `buildCircuit` (`:791–799`) *and* in `swapExercise` (`:1211`), or Swap hands you the
sibling you just avoided. Documented fallback when the constraint can't be met: unique pattern +
unique group → unique group only → anything not already picked, so the picker still returns five.

*The tradeoff:* grouping shrinks effective variety in the small pools. Lower + Complex has only 8
eligible movements today; group three of them and you're choosing 5 from 6. So groups get assigned
conservatively — only where two movements genuinely shouldn't share a day (the swing family, the
press family, goblet/front squat, the marches, the rows) — and the count gets checked per
focus × mode before we call it done. **Decided: groups go on the existing 46 in this slice** (§7 item 8).

**3c. Optional `poses`.** A movement without figures renders as a clean text card in the Library and
in the circuit. Un-illustrated is a temporary state to be drained, not a tier — so the Library shows
how many are waiting on figures.

### Slice 4 — `INGEST.md`, the validator, and the queue

The main deliverable. `INGEST.md` has to let a *fresh* agent session with no other context produce
an entry indistinguishable from the last one. Contents:

- The schema field by field — `id`, `name`, `tags`, `pattern`, `reps`, `dur`, `pools`, `variantGroup`,
  `pending`, `cue`, `grip`, `poses`, `posesF`, and the three odd ones (`twoBell`, `frontOnly`,
  `bellFlip`).
- How to choose `pattern` from the fixed list, and `tags` from upper/lower/core/full.
- The one-line `pools` rule, and the `variantGroup` rule.
- `reps` and `dur` conventions (`reps` is a plain string — `"6 / dir"`, `"20 steps"`, `"30 s"` all
  work; `dur` is animation seconds, 1.5–3.4 today).
- The pose vocabulary and how to compose from it: the 200×200 viewBox, the ground line at y=178,
  the `bell` coordinate, the `kn2`/`an2` alternating-leg extras, when a movement is front-only.
- **When to author nothing** — per roadmap §6, tempo, pause, and "travel instead of marching" are cue
  lines on an existing card, not new entries.
- The workflow: draft → `npm run build` → validate → show Joe the diff → wait for go-ahead → push →
  the movement is live but `pending` → Joe approves in the gym or by message.
- A fully worked example, the roadmap's `clean_carry`, so there's a reference entry to copy.

Alongside it: a small no-dependency validator (`npm run check`) asserting unique ids, known pattern,
known tags, valid `pools`, a `reps` string, pose keys complete where poses exist, known
`variantGroup`, and that a `bell` coordinate exists in every pose. This is what makes "it builds" into
"it's actually well-formed," and it's the cheapest quality gate in the batch. **Decided: in, no new
dependencies** (§7 item 6).

And `INBOX.md` — the agent's own queue for drops it hasn't processed yet, at the repo root (§7 item 7).
Your file to never touch.

### Slice 5 — Canon pass 1, authored through the loop

The first real use of `INGEST.md`, which is also how we find out whether it's any good. Targeting the
defects in priority order from roadmap §7, not the whole list:

1. **Complex pull** — swing + high pull, clean + bent row, gorilla row + sumo deadlift. Takes your
   primary mode from 1 pull-pattern movement to 4 and moves the press:pull ratio off 7:2.
2. **Complex anti-movement / carry** — the categories Complex literally cannot reach today.
3. **Knee-dominant depth** — front/racked squat, split squat, overhead lunge.
4. **Pull depth in Standard** — single-arm dead-stop row, upright row, reverse fly.

All Tier A, all composed from the existing pose vocabulary. Everything lands `pending: true`, so the
worst case is a wrong stick figure in a corner of the Library. Then `INGEST.md` gets revised from
whatever went wrong — that revision is the real output of this slice.

**Carry needs one small app change:** `"Carry"` has to join `PATTERN_ORDER` (`:750`) or carry
movements sort to the front of every circuit. The two existing marches stay Anti-lean and gain a
"room to walk?" cue line; `Carry` gets its own new entries (§7 item 3).

### Slice 6 — Canon pass 2 *(out of Batch 2, decided)*

The rest of roadmap §7: unilateral and bottoms-up variants, travelling swing, suitcase deadlift,
bottoms-up clean, overhead squat, walking lunge, Cossack squat (Tier B), and the half get-up
(Tier B — new supine and propped shapes the vocabulary doesn't have). These get done through the loop
as they come up rather than as a batch item, which is the whole point of having a loop (§7 items 4
and 5). The half get-up is the first drop after the loop lands, so Tier B authoring tests it.

---

## 5. Risks and tradeoffs

**The pool outrunning Batch 3.** Roadmap §7 names this: past a point every movement is unfamiliar and
you end up reading cue text instead of training. Growth is safe *because* of the slot template,
variant groups, and preference weighting — and two of those three are Batch 3. So canon pass 1 is
deliberately ~10 movements aimed at defects, not ~20 aimed at a number.

**The rename touching your session log.** This is the one place Batch 2 can lose data you care about.
Mitigations: normalize on read rather than trusting a one-shot rewrite, keep accepting both spellings
on import, and **export your log from the app before you install the build** — an acceptance check,
not a suggestion.

**Device-only approvals.** An in-app approval lives only in that phone's storage until the agent syncs
it. Clear Safari data and you'll be re-approving. Already accepted in roadmap §8; worth remembering.

**Variant groups quietly shrinking small pools.** Covered in slice 3b: conservative grouping plus a
count check per focus × mode.

**An agent authoring poses it can't see.** Unavoidable and already designed around — `pending` exists
precisely because the figure can only be reviewed by watching it on your phone. Expect a couple of
re-authoring rounds in canon pass 1; that's the loop working, not the loop failing.

**Three files instead of one.** Discussed in slice 1. Real cost, worth paying, bounded at three.

---

## 6. What "done" looks like

- A new movement can be added by messaging an agent, and it lands correct, pending, and unable to
  affect a workout until you approve it.
- `INGEST.md` is good enough that two different agent sessions produce consistent entries.
- Complex mode can hand you a pull, an anti-movement, and a carry.
- Lower day stops being 5 of the same 8 movements.
- Your Complex PRs survived the rename.
- `npm run build` passes, the app still works offline from the file, and nothing about the clock,
  audio, Wake Lock, or persistence from Batch 1 regressed.

---

## 7. Decided (Joe, 2026-09-30)

All eleven scoping items are closed. Joe took every recommendation, so nothing in §4 changed shape —
this section is now the record, not a question list.

1. **File split: three files.** `poses.js` (the `P`/`FS` helpers and the `S_*`/`F_*` vocabulary),
   `movements.js` (the 46 entries + `PATTERN_ORDER`), `bellwork.jsx` (the app).
2. **Session-log migration: rewrite.** Normalize `"advanced"` → `"complex"` on read *and* rewrite the
   stored log once, so exports are clean. Import keeps accepting both spellings.
3. **Carries: new entries.** `suitcase_march` and `racked_march` stay Anti-lean and gain a "room to
   walk?" cue line; the new `Carry` pattern comes from genuinely new entries.
4. **Canon pass 1: ~10 movements**, aimed at the Complex-pull, Complex-core/carry, knee-dominant and
   Standard-pull gaps. Not the full ~20.
5. **Half get-up: deferred** to the first ingestion drop after the loop lands, so Tier B authoring
   tests the loop instead of blocking the batch.
6. **Validator: yes.** One small `npm run check`, **no new dependencies**.
7. **`INBOX.md`: repo root**, committed, so any fresh agent session finds the queue.
8. **Variant groups on the existing 46: yes**, conservatively, in slice 3, with the per-focus × mode
   count check.
9. **Approving during a live run: freeze** the five picked circuit ids in the saved run record.
10. **Posting drops: project chat.** Tell the Project agent and it spawns an ingestion worker per
    drop — no new habit, no standing thread to maintain. `INGEST.md` still has to stand alone so any
    agent session or a fresh clone can use it.
11. **Push cadence: one review.** One branch, commits per slice, a single diff review and push
    go-ahead at the end of the batch.

### Still open

Nothing on scope. Pending Library approvals and Joe's Complex PR check after install.

---

## Changelog

- **v1.0** — All 11 scoping items decided by Joe; §7 turned from questions into the decision record.
  No change to scope or slice order — every recommendation was taken. Build brief promoted to ready.
- **v0.1** — First Batch 2 plan. Counts re-verified against `d53e729`; storage migration, the
  approve-during-a-run wrinkle, the validator, and the `PATTERN_ORDER` carry detail added on top of
  the roadmap's seven items.
