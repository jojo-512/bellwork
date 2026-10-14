# Video ingest trial — 2026-10-07

Trial only. Research Rob’s notes from Joe’s attached reel (Instagram-style, 20-min AMRAP, one black cast-iron kettlebell). On-screen text and voiceover name each move. Camera is mostly front / waist-up. **Bell weight was not readable. It is not in this note and it was not added to the catalog.** Catalog reps are circuit defaults, not this reel’s counts.

Repo checked: `jojo-512/bellwork` `main` @ `ffbf8df255536f216c2983b2b2db9b1f63b09d37` (2026-10-05, “Approve bent-over reverse fly.”). Rules used: repo `INGEST.md`, `poses.js`, `movements.js`, `check.mjs`, `Figure` in `bellwork.jsx`, plus `docs/vision-roadmap.md` (Phase 1 bell-only) and `docs/lift-ingest-workflow.md`.

## 1. Can we ingest now?

**Partial.**

One of the six is already a card. The other five are not safe to add. The current figure can draw a standing hinge, a one-arm row, a two-hand pull, a deep gorilla hinge, a bell at the side, and (with custom coordinates already used by floor press / dead bug) someone on their back. It cannot draw the thing that makes four of these moves different, and the fifth is bodyweight, which Phase 1 excludes.

Nothing was added or edited.

## 2. Per movement

| Move | Already in the catalog? | Pattern fit | Pose vocabulary enough? | Gaps | Ingest now? |
|---|---|---|---|---|---|
| Ballistic Rows (20, alt.) | No. Near: `row`, `dead_stop_row`, `gorilla_row`, `rdl_row` (all `variantGroup: "row"` except `rdl_row`) | Pull, `pools: ["standard"]`, share `row` | Hinge + row to the chest is the same family as `row`. The mid-air hand switch is the move | **Mid-air switch.** Side view has one arm (`sh→el→ha`). Front has two hands, but the bell must stay within 18 units of a hand (`check.mjs` `BELL_MAX`) and frames lerp in a straight line. A released bell fails the check; a legal switch just slides the bell from hand to hand. No weightless frame. Waist-up camera: flat-back depth is uncertain | No |
| Laying Pullover (10) | No. Not `standing_pullover` (standing). Closest is `dead_bug` (“Dead bug pullover”), which adds alternating legs | Anti-extension, standard, single move. A cue edit on `dead_bug` would delete the leg pattern, so it would be its own card later | Supine figures exist (`floor_press`, `dead_bug`, `situp_press`) as one-off coordinates plus an explicit `head`. There is no `S_SUPINE` / `F_SUPINE` in `poses.js`. Horns grip is already used | **Supine is not a primitive.** `INGEST.md` says compose from `S_*` / `F_*` or ship text-only rather than invent a shape. Rob flagged the side profile as uncertain, and the side arc is the rep. Ground line still draws at y=178 through a floor pose | No |
| High Pull (10) | **Yes: `high_pull`** (in rotation, “12 reps”, both hands, elbow high, bell to chin, hip snap). Also `upright_row` (in rotation, close to the body, elbows to shoulder height, “don’t chase your chin”). Pending `swing_high_pull` is a different chain (swing, then pull) and the punchlist already says that figure reads as an upright row | The reel matches the `high_pull` card, not the hybrid | The **cue** matches a two-hand chin-height pull. The **front figure does not**: frame 2 only raises `elR` / `haR`; the left arm stays at the `FS()` default (down). `upright_row` is the card whose front frame actually shows both elbows high | Overlap, not a new id. Reel count is 10 vs catalog “12 reps” — do not overwrite a circuit default from one reel. “Path close to the body” sits between `high_pull` (elbow outside, hip snap) and `upright_row` (close, shoulder height). That cue tension is a Joe call, not a second card | Already there. Do not re-add |
| Rotational Gorilla Row (10/side) | **`gorilla_row`** is this shape without the rotation cue: deep hinge, row to the hip, switch hands, “Free hand can brace on your knee.” Pending `gorilla_sumo` is row then sumo deadlift — a different chain | Pull, would share `variantGroup: "row"` with `gorilla_row`. `INGEST.md` §5: same shape → cue line, not a new entry | Front view can lift one arm (gorilla row already does). It cannot twist a ribcage | **Rotation.** Torso is one line, `hip→sh`. One shoulder point for both arms. Catalog “rotation” (halo, around the world) is a bell path, not a turned chest. Waist-up camera: hinge depth and how much the chest actually turns are uncertain | No. Later, a cue line on `gorilla_row` if Joe wants the coaching without a new figure |
| Shrugs (20/side) | No. `suitcase_march` is a straight arm at the side, then a march — anti-lean, not a trap raise | Pull, standard, unilateral. No shrug pattern needed; Pull is on `PATTERN_ORDER` | Arm-at-side is Tier A. A one-shoulder raise is not | **Unilateral elevation.** `headFrom` parks the head 13 units past the shoulder along the hip→shoulder line, so lifting `sh` lifts the head unless `head` is pinned. Front view has one `sh`, so both arms leave the same point. One trap to the ear cannot be drawn. A tiny legal bob would not read as a shrug | No |
| Pushups (max, no bell) | No. `pushup_on_bell` and `renegade` both put a hand on the bell | Push, but **out of Phase 1**. Vision roadmap: bell only; bodyweight is Phase 2 and needs a `load` field. There is no `load` on the schema | Plank coordinates exist (`pushup_on_bell`, `pull_through`). The bell does not go away | **Bodyweight.** Every posed frame must include `bell`. `Figure` always draws a bell (if `bell` is missing it falls back to the hand). `"max reps"` is a legal `reps` string and nothing else — the app shows the string and runs a timed circuit. It does not count reps | No |

## 3. Overlap with existing ids

| Reel name | Use this id | Do not confuse with |
|---|---|---|
| High Pull | `high_pull` | `upright_row` (stricter, shoulder height, both elbows actually drawn high). `swing_high_pull` (pending Complex: swing then pull; figure redo still open) |
| Rotational Gorilla Row | `gorilla_row` for the hinge, knee brace, and row | `gorilla_sumo` (pending: row, park, then sumo deadlift). `row`, `dead_stop_row` (same `variantGroup: "row"`, no rotation) |
| Ballistic Rows | none yet | `row` / `dead_stop_row` / `gorilla_row` / `rdl_row`. A new id would share `row` so it never lands next to them |
| Laying Pullover | none yet | `standing_pullover` (standing, arms long). `dead_bug` (supine pullover **plus** a leg) |
| Shrugs | none | `suitcase_march` |
| Pushups | none | `pushup_on_bell`, `renegade` |

57 movements on this `main`. Still pending, untouched by this trial: `swing_high_pull`, `gorilla_sumo`, `clean_carry`, `snatch_oh_carry`, `halo_march`.

## 4. What was done in the repo

**No catalog change.** No branch, no commit, no edit to `movements.js`, `poses.js`, `INBOX.md`, or `INGEST.md`.

`main` left as cloned: `ffbf8df255536f216c2983b2b2db9b1f63b09d37`. Not pushed.

Why none of the five new moves cleared the bar: a new card has to be Tier A, drawable with the current `Figure` / `poses.js` model, and allowed by `INGEST.md` as a simple pending entry (text-only is allowed when a known shape just didn’t get drawn). These fail the “drawable” test, or they are bodyweight. Text-only pending would still put a card Joe cannot check against a figure, and it would invent a pool member the model cannot show. Weight was not guessed. Reel rep counts were not written onto existing cards.

## 5. What’s still missing

**Schema**

- `load`: `bell` / `bodyweight` / `none`, as Phase 2 already describes. Until that exists, `Figure` cannot omit the bell and a push-up does not belong in the pool.
- No per-movement weight field. Session weight stays on the chip (25–45 lb). An unread bell is not a catalog hole.
- `reps` stays a display string. “Max reps” needs an explicit product decision before it means anything other than text on the card. Today every station is already “as many as fit in the clock.”

**Pose primitives**

- A real hand switch: either a frame where the bell may leave the hand, or a non-lerped catch. Side view would also need a second arm (`el2` / `ha2`) or the switch only exists in the front view.
- Named supine poses (`S_SUPINE`, `F_SUPINE`) plus a rule for when the ground line is the floor under the body. Don’t author the laying pullover side arc until someone has seen that side.
- Two shoulders (`shL` / `shR`) so a shrug can lift one trap and a gorilla row can turn the chest. Pinning `head` is not enough.
- Thoracic rotation as a body shape, not a bell orbit.

**INGEST rules (not written — this trial didn’t edit the file)**

- One reel of six is not `ingest: <name>, <reps>`. Don’t batch them into `INBOX.md` until Joe names the ones he wants.
- If the only difference from an existing card cannot be drawn, it is a cue line or a decline, not a text-only card.
- Reel rep counts do not replace catalog `reps`.
- Never invent bell weight.
- Bodyweight stays declined until Phase 2 `load` exists.

Joe (2026-10-07): this trial uncovered a real hole — advanced movements can’t be tracked well with these simple renderings. Treat that as the ingest stopping rule, not a prompt to upgrade the figure yet.

**Joe decisions, whenever he wants them**

1. High pull: leave `high_pull` as-is, or redo the front frame so both elbows go high, and decide whether the cue stays “hip snap” or becomes a strict vertical pull. That is a figure fix on a card already in rotation, not a new id. `swing_high_pull` stays its own pending redo.
2. Rotational gorilla row: add one sentence to the `gorilla_row` cue (“turn the chest up as you row”), or wait until the torso can actually twist. Leave `gorilla_sumo` alone.
3. Ballistic rows: new card only after a hand-switch can be shown. Until then it would look like `row`.
4. Laying pullover: own card after a supine primitive and a side view he trusts. `dead_bug` is the wrong substitute. `standing_pullover` is the wrong substitute.
5. Shrugs: in the pool only after one shoulder can rise on its own.
6. Pushups: keep them out. He already does bodyweight himself. `pushup_on_bell` is the bell version.
