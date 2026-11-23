# Plan: delete the legacy stick-figure renderer

Status: **approved by Joe, 2026-11-23**, all five recommended calls. This file is the reasoning for the PR that executes it.

Audited `origin/main` at `72407b9` (merge of [PR #19](https://github.com/jojo-512/bellwork/pull/19), 2026-11-23). The workspace checkout was four commits behind that commit when the audit started; the notes below are from the fetched tree, not from the stale checkout.

This is the execution checklist for the deletion already named in [`docs/proposals/rig-app-plan.md`](https://github.com/jojo-512/bellwork/blob/main/docs/proposals/rig-app-plan.md) §4 and in `docs/session.md` Next item 0. It does not reopen the rig decisions (canvas, per-movement views, right-then-left for alternating movements).

---

## What is already true

All **58** movements have `rig`. None are `pending`. The workout card and the Library already take the `ex.rig` branch and draw `RigFigure`. The legacy `Figure` component is unreachable on those screens.

`npm run check` on this commit exits 0 with **5 warnings and 0 errors**:

```
warn: windmill: frontOnly but poses is also set
warn: pull_through: frontOnly but poses is also set
warn: figure8_hold: frontOnly but poses is also set
warn: clean_carry: side frame 3: thigh2 is 47u (max 42 on a standing leg)
warn: snatch_oh_carry: side frame 3: thigh2 is 49u (max 42 on a standing leg)
check ok: 58 movements (58 on the rig), 7 variant groups, 5 warning(s), ...
```

The comment at the top of the pose-geometry section in `check.mjs` still says `reverse_fly` warns. It does not. Do not redraw those two carries to silence the warnings. Delete the pose data and the pose checks, and all five lines go away.

The 2-minute primer is plain text (halos, hinges, goblet squats, easy swings). It does not look up a movement and does not draw a figure.

---

## Alignment with the existing plan

`rig-app-plan.md` §4, after the pool is converted, deletes:

`Figure`, `headFrom`, `SIDE_SEGS` / `FRONT_SEGS`, `keyTimesFor`, `hasPoses`, `poses.js`, the old pose checks in `check.mjs`, the contact sheet's old frame rows, and the fields `poses`, `posesF`, `hold`, `t`, `bellFlip`, and `frontOnly` (replaced by `views`).

That list is right, with three corrections from the code as it is now:

1. **Pose `t` and `hold` are not rig `t` and `on`.** Only the `t` and `hold` keys on stick-figure frames go away. Phase `t` stays and is already required by `validateRig`. Bell ownership stays `rig.on` / per-phase `on`. The only movement that sets pose `hold` or pose `t` is `ballistic_row`, and its rig already uses `on: "air"`.
2. **`frontOnly` is already superseded.** The three movements that set it (`windmill`, `pull_through`, `figure8_hold`) all have `rig.views: ["front", "quarter"]`. The workout card never reads `frontOnly` when `rig` is set. Removing the flag does not add a side view and does not collapse the card to one panel.
3. **The contact sheet's old figure is not only the dead non-rig `Sheet`.** `RigSheet` still appends a "Before" loop for 56 of 58 movements, with the caption "the figure the app shows today." That caption is false. `pull_through` and `figure8_hold` hide it only because their side pose list is length 1 (`poses.length > 1` is the condition), even though their front lists are 4 and 5 frames.

`build.mjs` and `package.json` do not name the legacy renderer. The scripts stay `node build.mjs` and `node check.mjs`. The generated `index.html` and `contact.html` are committed, so the PR rebuilds them. Do not hand-edit them.

---

## Inventory

### `poses.js` — delete the file

36 lines, 2,678 bytes. Exports `P`, `FS`, and the `S_*` / `F_*` primitives.

**Only importer:** `movements.js` lines 5–9. Nothing else imports it. `bellwork.jsx`, `contact.jsx`, `check.mjs`, `rig.js`, and `blocks.js` do not. The five files in `docs/prototypes/` are self-contained HTML; they copied coordinates in, they do not import the module. Deleting `poses.js` does not break them.

### `movements.js` — delete pose fields, keep `rig`

1,721 lines, 142,024 bytes. About **538 lines / ~38 KB** are the `poses` and `posesF` arrays (181 side frames, 190 front frames). Every movement has both arrays. After the strip the file is roughly 1,180 lines. The `rig` blocks (~756 lines) stay.

Also delete:

| Field | Where it still is | What replaces it |
|---|---|---|
| `poses`, `posesF` | all 58 | `rig` |
| `frontOnly: true` | `windmill`, `pull_through` (on the `pools` line), `figure8_hold` (on the `reps` line) | `rig.views` |
| `bellFlip: true` | `bottoms_up_press` only | per-phase `fling: 1`, already set on every phase |
| pose-frame `hold`, `t` | `ballistic_row` only (`R` / `L` / `air`, and short `t`) | rig `on: "air"` and phase `t` |

Drop the `poses.js` import and the file comment that says pose primitives come from `poses.js`.

Keep, unchanged: `id`, `name`, `tags`, `pattern`, `reps`, `dur`, `pools`, `variantGroup`, `pending`, `cue`, `grip`, `twoBell`, `rig`, `STANDARD`, `HYBRIDS`, `EXERCISES`, `PATTERN_ORDER`.

`dur` stays top-level, as the app plan decided. Do not move it inside `rig`.

**Do not remove `frontOnly` in a commit that still runs the old pose check.** Today those three movements have unequal lists (windmill 2 side vs 4 front, pull-through 1 vs 4, figure-8 1 vs 5). The mismatch is legal only because `frontOnly` is set. Clearing the flag first turns the three warnings into length-mismatch **errors**. Pose fields, `frontOnly`, `bellFlip`, and the pose checks leave in the same change.

### Card views already on `rig` (do not re-pick them)

Zero movements have a single view. `validateRig` allows one or two of `side`, `front`, `quarter`. Keep that. The rig card already centers a single view (`flex: "0 1 62%"` when `views.length === 1`, `bellwork.jsx` around line 1127). That layout stays even though nothing uses it today.

| `rig.views` | Count | Notes |
|---|---|---|
| `["side", "front"]` | 22 | Library toggle matches both labels |
| `["front", "quarter"]` | 18 | Includes the three old `frontOnly` movements |
| `["side", "quarter"]` | 16 | Library "front" falls through to three-quarter |
| `["quarter", "front"]` | 1 | `clean_press`. Order is the card order |
| `["front", "side"]` | 1 | `suitcase_march`. Front is drawn first |

`sides`: 50 `"right"`, 8 `"alternate"` (`gorilla_row`, `halo`, `rev_lunge`, `dead_bug`, `lunge_twist`, `renegade`, `curl_halo`, `gorilla_sumo`). This deletion does not touch `rig.js` or `blocks.js`, including the windmill `roll` added in PR #19.

Pools: 36 Standard-only, 19 Complex-only, 3 in both (`clean_press`, `thruster`, `situp_press`). Same membership the vision doc already records. Only the rig count is stale there.

### `bellwork.jsx` — delete the SVG renderer and the dead branches

The legacy block is lines **118–236**: `headFrom`, `SIDE_SEGS`, `FRONT_SEGS`, `keyTimesFor`, and `export function Figure`. About 119 lines. `Figure` is the SMIL `<svg>` (200×200 viewBox, ground line at y=178, `bellFlip` handle offset, `hold: "none"` fade).

Call sites, all dead while every movement has `rig`:

| Site | Lines | What it does today |
|---|---|---|
| `hasPoses` | 73–77 | Returns true immediately when `ex.rig` is set. The `frontOnly` / `poses` / `posesF` tests never run |
| Library count | 446, 452 | `waitingFigures` is 0, so "waiting on figures" is never shown |
| Library card | 505–526 | `poses` is computed only when `figured && !ex.rig`. Every card takes `RigFigure` |
| Workout card | 1124–1146 | `ex.rig` draws one canvas per `rig.views`. The `hasPoses` / `Figure` / `frontOnly` branch is the `else` |

The 2-minute primer is lines **1054–1073**. Leave it. It is a `<div>` of coaching text under a show/hide button.

`RigFigure`, `rigViews`, `rigBuild`, the shared 30 fps loop, reduced-motion still, and `VIEW_LABELS` stay.

**Library toggle stays.** It is rig behavior, not the legacy renderer. `showSide` picks `"side"` or `"front"`. If that camera is in `rig.views`, it is used. Otherwise "side" falls back to `views[0]` and "front" falls back to the last view (`bellwork.jsx` 510–511). Consequences, already true today, and not a regression if they survive:

- `swing` (`side` + `front`): the toggle switches cameras.
- `snatch` (`side` + `quarter`): "front" shows three-quarter.
- `windmill` (`front` + `quarter`): **both** toggle positions show front. Three-quarter is on the workout card and the contact sheet, and is not reachable from the Library toggle.

Do not "fix" that in this PR. It is a separate UI change, and several movements would start showing a different Library camera.

After the deletion, `hasPoses`, the "waiting on figures" phrase, the Library "No figure yet" empty state, and the workout's `else` branch are dead. **Recommendation:** delete them, and require `rig` (decision 1 below). If Joe wants a text-only escape hatch for a future movement, the only branch to keep is "no `rig` → name, cue, and grip, no figure." Do not keep a `Figure` fallback behind it.

`Figure` is exported. The only external importer is `contact.jsx` line 4. `entry.jsx` imports the default app, not `Figure`.

### `contact.jsx` — delete every legacy branch

| Piece | Lines | Fate |
|---|---|---|
| `import { Figure } from "./bellwork.jsx"` | 4 | Delete. After this, the contact sheet does not import `bellwork.jsx` at all |
| `framesOf` | 31–37 | Delete |
| Non-rig `Sheet` (frame rows, "front only", "No figure on this card") | 39–80 | Delete. `Sheet` becomes `return <RigSheet ex={ex} />` |
| "Before" comparison inside `RigSheet` | 249–254 | Delete. This is the live SVG, on 56 sheets |
| `poseNote`, `FrameRow`, `LoopRow` | 259–314 | Delete. They exist only to draw `Figure` |
| Picker groups "Pending" (`pending && !rig`) and "In rotation" (`!pending && !rig`) | 319–320, 334–335 | Delete the empty groups |
| Switcher optgroup "Old figures" (`!rig`) | 364, 374 | Delete the empty group |

Keep the rig review page: three cameras, phase stills, scrub, speed, checks panel, "On card" mark, `TO_REVIEW` (currently `[]`).

Tree-shaking already limits the damage of that import. In the current minified contact bundle, `bellwork.jsx` contributes **2,850 bytes** (the `Figure` slice), not the workout app. Deleting the import removes that coupling anyway. A future edit to `bellwork.jsx` should not be able to change the review bundle.

### Build and check

`package.json`: no script change.

`build.mjs`: no logic change. It bundles `entry.jsx` → `index.html` and `contact.jsx` → `contact.html`. Rebuild both.

`check.mjs` is 465 lines. The pose half is roughly lines 16–17 and 36–335, plus the pose block inside the schema loop at 401–430. About 300 lines. Delete:

- `SIDE_KEYS`, `FRONT_KEYS`, `isPair` (pose-only)
- `checkPoseMeta`, `checkPoseSide`, `checkPoseFront`
- the geometry constants (`BELL_MAX`, `HOLDS`, `LEG_MAX`, `ARM_MAX`, floor/knee/split thresholds, `SIDE_LEGS`, `FRONT_LEGS`, `SIDE_ARMS`, `FRONT_ARMS`)
- `checkBell`, `namedHands`, `isGripHold`, `checkAir`, `checkHoldAgreement`, `checkLimbs`, `checkFeet`, `poseGeometry`
- the `hasSide` / `hasFront` / `frontOnly` / length-mismatch block, including the rule "if it has `rig`, pose geometry only warns"

Keep the schema loop: `id`, `name`, `tags`, `pattern` ∈ `PATTERN_ORDER`, `reps`, `pools`, duplicate pools, `pending` boolean, `variantGroup` snake_case.

Keep the rig loop: `validateRig` + `checkRig`, pending warns, in-rotation fails. Do not change thresholds, sample count, or what `checkRig` measures.

**Replace the pose checks with these invariants:**

1. Every movement has `rig`. Missing `rig` is an error, not a warning. The success line already prints `(N on the rig)`; after this, N is the whole pool.
2. `poses`, `posesF`, `frontOnly`, and `bellFlip` on a movement are errors (`legacy field "…" is not allowed`), so a later ingest cannot put them back.
3. `dur` is a positive number. This is already required when `rig` exists; once `rig` is required it covers the pool. Do not also require `dur` "when poses exist."
4. `validateRig` already errors unless `rig.views` is one or two of `side`, `front`, `quarter`, in the authored order. Do not require exactly two. Do not require that `side` be one of them. Do not sort the array. Card order is the array order (`clean_press`, `suitcase_march`).
5. Zero warnings is the bar. The logger already omits the warning clause when the list is empty. Expected line:

```
check ok: 58 movements (58 on the rig), 7 variant groups, patterns=[Hinge, Squat, Push, Pull, Lunge, Rotation, Anti-rotation, Anti-extension, Anti-lean, Flexion, Carry]
```

No `warn:` lines, exit 0. A new movement may raise the count above 58. Do not hard-code 58 in the check. Do hard-code "no movement without `rig`."

Pending rig geometry still warns, and an approved movement's rig geometry still fails. Nothing is pending today. That split stays, because `INGEST.md` still ships new work as `pending: true` until Joe says approve.

---

## Docs: update vs leave

### Update in the same PR (living instructions)

| File | What to change |
|---|---|
| `AGENTS.md` | Line 5 can say the figures are the rig, two views chosen from side, front, and three-quarter. Line 37: drop "pose vocabulary in `poses.js`." Movement data is `movements.js`, every movement carries `rig`, blocks live in `blocks.js`, review at `contact.html?id=`. Line 42: the check validates ids, pools, patterns, and the rig checks. It does not validate poses |
| `INGEST.md` | This is the authority a fresh agent follows. Rewrite §2 (drop `poses`, `posesF`, `frontOnly`, `bellFlip`; `dur` required with `rig`; `rig` required), §6 (delete the 200×200 / `P` / `S_*` / `F_*` / `hold` / pose `t` vocabulary; point at `blocks.js`, `rig-ingest.md` §2, and one real movement in `movements.js` instead of pasting a giant phase list), §7 steps that say omit `poses`, open numbered side/front frames, and treat pose warnings as the backlog, §8 (the `clean_carry` example is still the old figure; replace it with a classification example that includes a `rig` pointer, not a second copy of the phases), §9 checklist, §10 lessons 2, 4, 6, and 7 (pose-count mismatch, compose from `S_*`, pose warnings on other lifts). Keep §3–5 (pools, `variantGroup`, when to author nothing). Those are the catalog rules and they are still right |
| `docs/session.md` | Next item 0 becomes done, with the PR link. Add a Last session entry. Fix the contradiction in the current Last session: it says PR #19 is "ready to merge. Not merged," while Next and `72407b9` say it is merged. Leave older entries alone, including the ones that describe pose work |
| `README.md` | The check blurb still says pose checks warn on pending and fail in rotation. The contact-sheet blurb still says numbered side and front keyframes. The layout table still describes `check.mjs` as "schema plus pose warnings." Point those three at the rig. Add `movements.js`, `rig.js`, `blocks.js` to the layout table only if the row stays one line each. Do not turn the README into a guide |
| `docs/vision-roadmap.md` | Only the stale rig-status sentences. "Pool now" still says 38 of 58 are on the rig and 20 Standard movements use the old figure, and the knee-dominant bullet still says front rack squat, split squat, and overhead lunge are on the old figure. Pool membership (39 Standard, 22 Complex, 3 both) is still right. Correct the rig sentences. Do not rewrite the canon history or the pattern table |

`CLAUDE.md` only points at `AGENTS.md`. No edit.

`docs/punchlist.md`: no open item is the old renderer. The battery/heat line stays open and is not this PR. The done line about `kn2` / `an2` opacity is history. Leave the file.

`docs/ingest/notes-spec.md` and `docs/proposals/rig-ingest.md` already speak the rig vocabulary (`body`, `bell_hand`, phases). They do not tell anyone to author `poses.js`. No edit required for the deletion. `rig-ingest.md` is still marked draft; do not quietly promote it.

### Leave untouched

| Path | Why |
|---|---|
| `docs/proposals/rig-app-plan.md`, `rig-animation.md`, `rig-ingest.md` | Decision record. §4 is the list this plan executes. Editing it rewrites an approved plan. `docs/session.md` points at the PR instead |
| `docs/prototypes/*.html` (five files, ~119 KB) | Bake-off pages. Not imported by `build.mjs`. `docs/README.md` already says they are not part of the build. They embed frozen copies of old poses; that is the point of keeping them |
| `docs/batch-2-plan.md` | Shipped 2026-09-30. It discusses `poses.js` and `Figure` as the then-current design |
| `BACKLOG.md` | The `poses.js` checkbox is a completed item |
| `INBOX.md` | Drop queue. No renderer contract |
| Older `docs/session.md` entries | The log is supposed to stay |

When the build starts, the two-agent rule is that the reasoning lives in `docs/proposals/` on the PR. Copy this plan (trimmed of the store frontmatter) to `docs/proposals/legacy-renderer-removal.md` as part of that PR. Do not add that file before Joe approves the plan.

---

## Bundle size

Measured with a throwaway build of `72407b9`, then the same tree with pose fields and the legacy renderer removed. Not a repo change. Minified bytes are esbuild's `bytesInOutput`.

| | `index.html` | `contact.html` |
|---|---|---|
| Now | 336,799 bytes (gzip 101,076) | 286,313 bytes (gzip 77,756) |
| After | 303,141 bytes (gzip 93,231) | 249,294 bytes (gzip 69,503) |
| Delta | **−33.7 KB raw, −7.8 KB gzip** | **−37.0 KB raw, −8.3 KB gzip** |

What leaves the minified JavaScript:

| Piece | index bundle | contact bundle |
|---|---|---|
| Pose arrays inside `movements.js` | 28,382 bytes | 28,382 bytes |
| `poses.js` | 1,603 | 1,603 |
| `Figure` and its helpers | 3,631 (bellwork 31,314 → 27,683) | 2,850 (the entire `bellwork.jsx` slice) |
| Legacy contact-sheet components | — | ~4,143 (contact.jsx 15,852 → 11,709) |

React-dom is ~130 KB of the ~293 KB app bundle and does not change. Gzip is the number GitHub Pages actually sends, and the pose coordinates compress hard, so the phone saves about 8 KB. That is not the reason to do this.

Runtime canvas count does not change: the Library already draws one rig canvas per card, the workout already draws one per view. The battery/heat punchlist item is untouched.

The PR diff will look large because `index.html` and `contact.html` are committed build output. That noise is the rebuild, not a hand edit.

There is no service worker. A home-screen copy of the site can keep the previous `index.html` until iOS refetches it. After a later deploy, reopen the app once. The figures on screen should look the same either way.

---

## Edge cases and tradeoffs

**Workout and Library pixels should not change.** Every card already uses `RigFigure`. The risk is deleting a branch badly (a syntax error, or the Library toggle simplified by accident), not a visual migration. The contact sheet **does** change: 56 movements lose the "Before" SVG loop. That loop is the only place the old figure is still shown.

**`frontOnly` vs `rig.views`.** Safe to delete the flag. The three movements already show front and three-quarter, two panels, labels from `VIEW_LABELS`. The old single-panel `frontOnly` CSS (centered, `flex: "0 1 62%"`) exists only on the dead `Figure` branch. The rig branch has its own one-view layout and keeps it, so a future one-view movement still has a place to land. No movement is one-view today, so there is no fixture for that layout. Do not delete the layout for lack of a fixture.

**`bellFlip` vs `fling`.** `bottoms_up_press` is the only `bellFlip`. The SVG used it to draw the handle below the mass. The rig draws the same idea with `fling` (0 hangs under the hands, 1 is bottoms-up). Every phase of that press already has `fling: 1`. Deleting `bellFlip` does not change the canvas.

**Pose `hold` / `t` vs phase fields.** Same word, different object. A sweep that deletes every key named `t` or `hold` will destroy phase timing. Delete the keys only inside `poses` / `posesF`, which goes away with those arrays.

**Warm-up.** No figure, no id lookup. Smoke-check that the show/hide still opens the same four lines.

**Text-only cards.** `INGEST.md` still says a movement that cannot be drawn ships with `poses` omitted. Nothing in the pool uses that state (`waitingFigures` is 0, no movement lacks `poses` or `rig`). The rig and the contact sheet replaced the reason for that hatch. Recommendation is to close it: a new movement is not in `movements.js` until it has a `rig`, and `pending` remains the "not in the workout yet" switch. The cost is that an agent can no longer land a cue-only card in one pass. The gain is one renderer and a check that cannot pass a movement the app cannot draw.

**Requiring `rig`.** `validateRig` plus `checkRig` then apply to the whole pool, which they already do in practice (58 of 58). Making it an error stops a future movement from compiling into a blank card by accident. It does not add new geometric strictness.

**Historical docs and prototypes.** Keeping them costs nothing on the phone and saves the bake-off. The cost is a future agent quoting `INGEST.md` from memory, or quoting the prototypes, and reintroducing `P()`. The mitigation is the check rejecting legacy fields, and `INGEST.md` no longer teaching them. Deleting the prototypes does not make the git history smaller in a meaningful way and throws away the record `rig-app-plan.md` points at.

**Partial deletion.** The failure mode to avoid is a mid-PR tree where `frontOnly` is gone, poses remain, and `npm run check` fails on the three length mismatches. One change set.

**Out of scope, on purpose.** Thruster and lateral lunge + press forearm angle (session Next item 1). The five-slot template (item 2). Battery and heat (item 3). Library three-quarter. New rig checks. Any edit to `rig.js` or `blocks.js`.

---

## Decisions Joe should make before anyone builds

1. **Require `rig` on every movement, and delete the text-only card.** Recommended. `pending` still keeps a movement out of the draw. The alternative is a single remaining branch: no `rig` means name, cue, and grip, the check warns, and poses are not a fallback.
2. **Leave `docs/proposals/` and `docs/prototypes/` as history.** Recommended. The alternative is deleting the five prototype HTML files. They are not in the app bundle.
3. **Do not change the Library side/front toggle in this PR.** Recommended. Front + three-quarter movements will keep showing front in both toggle positions. A toggle that can show three-quarter is a separate change.
4. **In the same PR, update `AGENTS.md`, `INGEST.md`, `README.md`, the rig-status sentences in `docs/vision-roadmap.md`, and `docs/session.md`.** Recommended. Leave the proposal files, prototypes, `batch-2-plan.md`, `BACKLOG.md`, and older session entries.
5. **This PR is the deletion only.** It does not include the forearm fix or the slot template. `docs/session.md` already asks which of those comes next; this plan assumes the deletion is the code change.

If Joe says go with no edits to this list, build it as the recommended column.

---

## Execution

Branch from latest `origin/main` (this audit is `72407b9`; fetch first). One PR. Do not push `main`.

1. Run `npm run check` before editing. Stop if it is not "58 movements (58 on the rig)" and the five warnings named above. The catalog moved.
2. In one change set:
   - Delete `poses.js`.
   - Strip `poses`, `posesF`, `frontOnly`, `bellFlip`, and the `poses.js` import from `movements.js`.
   - Delete `Figure` and its helpers, `hasPoses`, and both fallback branches in `bellwork.jsx`. Leave `RigFigure`, `rigViews`, and the Library toggle formula alone.
   - Delete the legacy contact-sheet pieces, including the "Before" loop, and the `bellwork.jsx` import.
   - Replace the pose half of `check.mjs` with the invariants in the check section.
   - Update the living docs listed above. Add `docs/proposals/legacy-renderer-removal.md` as the PR reasoning (this document, without the store frontmatter).
   - `npm run build` so `index.html` and `contact.html` match.
3. `npm run check` exits 0 with no `warn:` lines.
4. Search the repo for `poses.js`, `posesF`, `frontOnly`, `bellFlip`, `function Figure`, `SIDE_SEGS`, `headFrom`, `checkAir`. Remaining hits should be only under `docs/proposals/`, `docs/prototypes/`, `docs/batch-2-plan.md`, `BACKLOG.md`, and older `docs/session.md` / `docs/vision-roadmap.md` narrative. `INGEST.md`, `AGENTS.md`, and `README.md` should not teach the old path.
5. Do not touch `rig.js` or `blocks.js`. If a diff appears there, it is a mistake.

### Browser smoke

Serve the built files (any static server). Phone width, 390×844. Confirm behavior, not a single screenshot.

Workout card, two canvases, labels match `rig.views`, no `<svg>` inside a card:

- `swing` — side then front
- `windmill` — front then three-quarter (this is the old `frontOnly` case)
- `snatch` or `dead_bug` — side then three-quarter
- `clean_press` — three-quarter then front
- `suitcase_march` — front then side
- one alternating movement (`halo` or `lunge_twist`) still plays

Also: reduced motion draws a still. Primer opens and closes as text. Library toggle on `swing` switches side/front. Library toggle on `windmill` shows front both times (known, not a bug to fix here). Library toggle on `snatch` shows three-quarter under the front button. Reshuffle and Swap do not throw. Start and Pause do not throw. Console has no errors.

Contact sheet:

- `contact.html?id=windmill` is the rig sheet (three views, phase stills, checks pass). No "Before" section, no SVG.
- `contact.html?id=swing` the same.
- `contact.html` with no id lists all 58 under "On the rig." No "Old figures" group, no empty "In rotation" group of stick figures.

If a card is blank or a label disagrees with `rig.views`, stop. That is a broken `rigViews` edit, not a pose leftover.
