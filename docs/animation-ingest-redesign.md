# Animation + ingest redesign: plan for review

Status: **Joe approved 2026-10-07. Slice 1 is on `main` (`aaaf2e5`): `hold`, `t`, and `ballistic_row`.** Slice 2 is on `cursor/rig-v2-shoulders-9b80`, pushed 2026-10-14 (the original local commit was `aa8b049`; this branch restores that tree). On 2026-10-14 Joe chose the joint-angle rig in PR #1 instead of continuing Rig v2. This file is the Oct 7 record. Joe redid the shoulder drawing: each shoulder is its own line from `neck` (`neck`→`shR` and `neck`→`shL`), not a flat bar. Helpers are `twist`, `shrug`, `mirror`, and `withHold`. Proofs, both pending: `rotational_gorilla_row` and `unilateral_shrug`. Poses that omit the new keys still match the pre-slice figure (116 legacy views, 0 SVG diffs).

Inputs: [video ingest trial](./video-ingest-trial-2026-10-07.md), [lift ingest workflow](./lift-ingest-workflow.md) §5, `preferences.md`, [vision roadmap](./vision-roadmap.md) (Phase 1 is bell-only, the pose editor is parked, Tier A/B).

**Recommendation in one line:** extend the stick figure, don't replace it. Add a small set of optional, additive rig keys ("Rig v2") and teach the outside agent to write notes in the same vocabulary. This unlocks all four blocked bell moves without touching the look of the existing 57. Ship it as three small slices, each proven on one blocked move.

---

## 1. Current model

**Data.** Each movement has `poses` (side view) and `posesF` (front view). These are arrays of 2–6 keyframes of raw `[x, y]` joints in a 200×200 box, with the ground line at y=178. `poses.js` holds 8 side primitives and 7 front primitives, plus `P()` / `FS()` helpers. Across the 57 movements there are 182 keyframes per view. 26 movements use 2 frames and 19 use 4. Eight movements pin `head`, and about 7 are floor shapes written as one-off coordinates.

**Joints it can express**

| View | Joints | What that means |
|---|---|---|
| Side | `hip, sh, el, ha, kn, an` + optional trail leg `kn2/an2` (dimmed) | One arm only. A two-hand move or a hand change can't be seen from the side |
| Front | `hip, sh, elR/haR, elL/haL, knR/anR, knL/anL` | Both arms start from one `sh` point. No shoulder width, so no shrug and no chest turn |
| Both | `head` derived 13u past `sh` along hip→sh (or pinned) | Lifting `sh` lifts the head. The torso is one straight line |

**Bell rules.** Every frame must have `bell`. `Figure` always draws it, and if `bell` is missing it falls back to the hand. `check.mjs` requires the bell within 18u of the nearest hand (`ha`, or `haR`/`haL`). Because of that, a released bell can't pass the check, and a bodyweight move can't be drawn at all. `bellFlip` only changes where the handle is drawn.

**Motion.** SMIL `<animate>` with `calcMode="linear"`. Keyframes are evenly spaced and loop back to frame 1. Joints move in straight lines, so:
- every phase of a rep takes the same time (no snap, no pause, no float)
- arcs become chords and forearms shrink mid-move (halos already run a forearm from about 3u to 36u)

**Ground.** The line is always drawn at y=178. Floor poses are hand-placed near it. The checks skip any pose with hip y ≥ 146.

**Checks** (`check.mjs`): schema; bell-to-hand; standing leg length and stretch across frames; feet on the line. These warn on pending lifts and fail on lifts in rotation. Floor, kneeling, and wide-split poses are skipped. The checks don't know which hand holds the bell, and they have no notion of time, shoulders, or lying down.

**Review.** `contact.html?id=` shows the keyframes numbered, side and front, plus a loop. The review flow is the A+B+C flow in the lift ingest workflow doc.

**Bottom line.** The figure is a good coach for standing, hinging, bell-in-hand shapes (Tier A). All five trial blocks come from four specific missing pieces, not from the stick-figure style:

| Blocked move | Missing piece |
|---|---|
| Ballistic row | No way to say which hand holds the bell or that it's in the air; no per-phase timing; no far arm in side view |
| Rotational gorilla row | No shoulder width, so the chest can't turn |
| Unilateral shrug | No shoulder width; head is tied to `sh` |
| Laying pullover | No supine primitive; linear lerp flattens the overhead arc |
| Push-up (no bell) | Bell is always drawn; no `load` field. **Product-blocked too** (Phase 1 is bell-only, and Joe said keep it out) |

---

## 2. What an outside video-notes agent needs from Bellwork

Research Rob can watch a reel. The Bellwork worker can't, so the worker works from Rob's notes plus stills. To land a move cleanly, Rob needs:

1. **A published vocabulary.** A short list of the bases, arm positions, bell-hold states, modifiers, and tempo words the figure can draw. The names in the list are the same names as the functions and constants in `poses.js`, so notes compile straight to pose code instead of invented coordinates.
2. **A fixed notes shape.** One move per note, using the v1 schema in §4. That includes a one-line **differentiator** ("what makes this not `<nearest id>`").
3. **A capability gate with reason codes.** If the differentiator maps to the vocabulary, the move is drawable. If it doesn't, Bellwork declines with a gap code such as `gap: twist` or `gap: no_bell`. Gap codes are tracked so the next rig increment is justified by real demand, not by guessing.
4. **Catalog-first matching.** Rob lists the ids he thinks are nearest. The worker still decides between new entry, cue edit, and decline under `INGEST.md` §4–5. The trial showed this works: High pull was recognised as `high_pull`.
5. **Camera honesty.** For each view, note whether Rob actually saw it (front / side / three-quarter, full body / waist-up). A view Rob didn't see is drawn from the nearest primitive and flagged on the contact sheet. It is never invented in detail.
6. **Still timestamps.** Start, hardest position, and the differentiator moment. These become the screenshots `INGEST.md` §7 already asks for.
7. **Hard rules carried in the note.** No guessed weight. `reps_seen` is informational and never overwrites catalog `reps`. Bodyweight is marked `load: none`. No footage, links or creator details go into the repo.
8. **Joe still picks.** Notes are a pantry, not a queue. Nothing reaches `INBOX.md` until Joe says `ingest: <name>`.

---

## 3. Options, ranked

| # | Option | Effort (technical) | Unlocks | Risk to the 57 | Phone SPA / Pages fit |
|---|---|---|---|---|---|
| **1** | **Rig v2: extend the stick figure** (recommended) | `Figure` gains about 80–120 lines; `poses.js` gains about 100 lines of primitives and pose operations; `check.mjs` gains about 80 lines of rules; `contact.jsx` gains about 10. No new dependencies; every new key is optional | Ballistic row, rotational gorilla row, shrug, laying pullover. Push-up is technically possible but stays product-blocked. Also helps the paused halo redo (arcs, two shoulders) | **None by construction.** A pose without the new keys normalizes to exactly today's points. Proven once by rendering all 57 before and after and diffing the SVG | Same single-file `index.html`; bundle grows by a few KB; SMIL `keyTimes` works on iOS Safari |
| 2 | Pose compiler (3D-lite): author joint angles once, project to side and front | New compile module of about 200–300 lines; new angle-based vocabulary; legacy 2D poses kept side by side, so two authoring paths | Everything Rig v2 unlocks, plus guaranteed side/front agreement and fixed bone lengths | Low if legacy is untouched, but two paths live forever, or there's a risky migration of 182 hand-made frames whose depth was never consistent | Fine (pure JS) |
| 3 | Hybrid cue-only: cue lines on existing cards, text-only cards labelled "not drawn" | `INGEST.md` rules only | No figures. Rotational gorilla row as a cue on `gorilla_row` | None | Fine |
| 4 | Keep iterating as-is, decline the rest | None | Nothing; the stopping rule becomes permanent | None | Fine |
| 5 | Asset redesign: Lottie, Rive, sprite clips, reel video, or pose estimation (e.g. MediaPipe) | New runtime (tens to hundreds of KB, Rive is WASM) or MB-scale video; authoring in outside tools neither Joe nor an agent can drive; per-move assets | In theory, anything | High. Visual style splits from the 57, or all 57 get redrawn | Poor: breaks or bloats the single-file build. Reel footage belongs to the creator. Waist-up reels have no legs to estimate |

**Why 1 over 2.** Option 2 is cleaner in theory, but it adds a second authoring model and asks the worker to think in 3D angles. That's harder for an LLM than "start from `F_HINGE`, apply `twist(25)`." Rig v2 gets the same four unlocks with additive keys. Option 2 stays parked, like the pose editor. Revisit it only if the Rig v2 contact-sheet self-review keeps failing on two-view agreement.

**Why not 3 or 4.** These are the "decline forever" path. They protect the catalog, but Rob's notes would mostly die at the gate. A modest overhaul is enough to change that.

---

## 4. Recommendation: Rig v2 plus bot notes v1

### 4a. Rig v2 (additive, opt-in per movement)

**New pose keys.** All are optional. When a key is absent the pose behaves exactly as today.

| Key | View | Meaning | Default |
|---|---|---|---|
| `neck` | both | Top of the spine. The torso runs hip→neck, and the head is derived from hip→neck | `sh` |
| `shR`, `shL` | front | Shoulder points the arms attach to. A shoulder bar is drawn only when they differ | both = `sh` |
| `el2`, `ha2` | side | Far arm, dimmed like `kn2/an2` | absent |
| `hold` | both | Where the bell is: `R` · `L` · `both` · `air` · `floor` · `none` | nearest hand (today's behaviour) |
| `t` | both | Relative time of the move *from* this frame to the next. Becomes SMIL `keyTimes` | `1` (evenly spaced, as today) |
| `ground` | both | `feet` or `back`. Picks which checks apply | inferred: `back` when hip y ≥ 146 |

**New movement-level fields.**
- `rig: 2` turns on bone-angle interpolation and the v2 checks.
- `load: "bell" | "none"`, default `bell`. With `load: "none"` the bell isn't drawn. The Phase 1 pool policy is unchanged: the check fails `load: "none"` on a non-pending lift until Joe opens Phase 2.

**Renderer changes in `Figure`.**
1. A `normalize(pose)` step fills in the defaults above. Legacy output is identical.
2. Per-frame `t` becomes `keyTimes`. That gives a snap, a pause, or the short float of a mid-air switch.
3. For `rig: 2` movements only, the renderer adds in-between frames by interpolating bone angles about the parent joint (about 6 sub-steps per segment). Arcs stay arcs and bone lengths stay fixed. The contact sheet still shows only the authored keyframes.
4. A shoulder bar is drawn when `shR ≠ shL`. The side view draws the far arm dimmed. No bell is drawn when `hold: none` / `load: none`.

**New primitives and pose operations in `poses.js`.** These are pure functions, so the worker composes poses instead of inventing coordinates.
- `S_SUPINE`, `F_SUPINE`, and `S_SUPINE_OH` (arms overhead on the floor).
- Arm positions keyed off the shoulder, so they still work after a twist or shrug: `hang`, `row_top`, `rack`, `chin`, `overhead`, `brace_knee`, `over_chest`, `overhead_floor`.
- `mirror(pose)` swaps R and L for alternating sides. `twist(pose, deg)` narrows and tilts the shoulder bar and moves the rowing shoulder up. `shrug(pose, side)` raises one shoulder point and keeps `neck` (and so the head) in place. `withHold(pose, h)` sets `hold`.

**New checks in `check.mjs`.** Same rule as now: warn on pending, fail in rotation.
- The bell must be near the hand named by `hold`. `air` is allowed for at most one consecutive frame, with held frames on both sides, the bell above the hands, and a short `t` (≤ 0.6).
- Side and front must agree on `hold` in every frame.
- `rig: 2`: each bone keeps its length within ±10% across frames. Today's carry and halo stretching can't happen.
- Shoulder width is capped. `neck` must sit between `shR` and `shL`.
- `ground: back`: hip, shoulder, and head stay in the floor band, and the foot checks are skipped.
- `load: none` is rejected on non-pending lifts (Phase 1 guard).

### 4b. Bot notes v1 (Research Rob → Bellwork)

One YAML block per move, posted in Project chat or saved as a file in the Project store. Only the final movement entry goes into the repo. Every word in `base`, `arms`, `hold`, `modifiers`, and `tempo` has to come from the published vocabulary. Anything else is a gap.

```yaml
bellwork_notes: 1
name: Ballistic row
source:
  url: <reel url>
  clip: "0:42-0:58"
  camera: front_waist_up       # front|side|three_quarter + _full|_waist_up
load: bell                     # bell | none
bells: 1
weight: unknown                # never guess
grip: One hand on the handle, knuckles down
reps_seen: 20 alternating      # info only
laterality: alternating        # bilateral | unilateral | alternating
tempo: ballistic               # controlled | ballistic | pause_at:<phase>
nearest_ids: [row, dead_stop_row]
differentiator: Bell is let go at the top of the row and caught by the other hand
phases:                        # 2-6, in order; one phase = one keyframe
  - { label: start,  base: hinge, arms: { R: hang,    L: hang },    hold: R,   t: 1 }
  - { label: top,    base: hinge, arms: { R: row_top, L: hang },    hold: R,   t: 0.5 }
  - { label: switch, base: hinge, arms: { R: hang,    L: row_top }, hold: air, t: 0.4 }
  - { label: catch,  base: hinge, arms: { R: hang,    L: row_top }, hold: L,   t: 1 }
modifiers: []                  # e.g. twist:25R, shrug:L
seen_views: [front]
uncertain: [flat-back depth - camera is waist-up]
stills: ["0:44 start", "0:46 switch"]
gaps: []                       # Rob fills these if he can't map something
```

**Worker reply to Rob and Joe.** It contains a decision (new entry, cue edit on `<id>`, or decline `gap:<code>`), the contact sheet, and the loop. That is the existing `INGEST.md` §7 message plus one line that Rob can learn from.

**Starting gap codes:** `hand_switch`, `twist`, `shrug_unilateral`, `supine`, `no_bell`, `unseen_view`, `two_bell_only`, `out_of_scope`. Each Rig v2 slice retires its codes.

**Rule change (needs Joe's OK; the coordinator owns `preferences.md`).** The stick-figure limit becomes a **capability gate**: ingest when the differentiator maps to the published vocabulary, decline with a gap code when it doesn't. The "no lookalikes" rule stays.

---

## 5. Phased plan (smallest proof first)

Each slice goes through the normal app/schema plan → diff → push OK. Each one has a single proof move that lands **pending**, reviewed on the contact sheet.

**Slice 1: bell hold and timing** (proof: **ballistic row**)
- Build: `normalize`, `hold`, `t`/`keyTimes`, side far arm `el2/ha2`, hold-aware bell check, side/front hold agreement, hold and `t` shown on contact-sheet frames, vocabulary table in `INGEST.md`, notes v1 in `INGEST.md`.
- Proof: render all 57 movements before and after and confirm the SVG is identical (one-off script, not committed). Then ballistic row goes from the trial notes, through notes v1, to a pending card in `variantGroup: "row"`.
- Exit criteria: legacy output unchanged; Joe says the loop reads as a hand switch on his phone.

**Slice 2: shoulders** (proof: **rotational gorilla row**, then **shrug**) — **redo restored from `aa8b049` on `cursor/rig-v2-shoulders-9b80`, pushed 2026-10-14.**
- Landed: `neck`, front `shR` / `shL`, a line from the neck to each shoulder (no flat bar across them), `twist()`, `shrug()`, `mirror()`, `withHold()`, shoulder-span cap (40), neck-between-shoulders check. Absent keys still render as today.
- Proofs are new pending cards, not an in-place edit of `gorilla_row`: `rotational_gorilla_row` (`variantGroup: "row"`) and `unilateral_shrug` (no group — nothing else is a shrug). The side view of the gorilla row stays a one-arm hinge. The turn is the working shoulder rising off the neck while the other stays down.
- Reply words: **push OK** ships with `pending`. **approve** clears `pending` and ships. **redo** / **drop** as usual.

**Slice 3: floor and arcs** (proof: **laying pullover**)
- Build: `rig: 2` bone-angle interpolation, `S_SUPINE`/`F_SUPINE`/`S_SUPINE_OH`, `ground: back` checks, bone-length check.
- After this, `halo_march` (and `halo`, if Joe wants) can be redone on `rig: 2`, because two shoulders and true arcs are what that redo was missing.

**Not in any slice:** push-ups or `load: none` in the pool (Phase 2 product call), the pose compiler, the pose editor, assets, and pose estimation. The carries (`clean_carry`, `snatch_oh_carry`) don't depend on this redesign. Their only warning is trail-thigh length, which can be fixed with today's figure whenever Joe un-pauses them.

---

## 6. Open questions

None block this recommendation. Two defaults are assumed and can be overridden:
1. **Rig v2 is opt-in per movement.** The 57 keep today's look, with no shoulder bar unless a pose sets `shR/shL`. Restyling the whole catalog would be a separate, later choice.
2. **The first proof move is ballistic row.** It exercises hold and timing, the smallest slice. Shrug could go first instead, but it has lower training value for the product promise.
