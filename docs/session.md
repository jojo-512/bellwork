# Bellwork — session log

Where we left off. Any agent (Cursor or Claude) updates this file at the end of each working session, and whenever it opens, merges or closes a pull request: add a dated entry under Last session and keep Next current. Read it before starting work.

## Next

0. **Animation: batch 3 (hinge and pull) built ([PR #6](https://github.com/jojo-512/bellwork/pull/6)), in Joe's phone review.** Batch 2 is on `main` ([PR #5](https://github.com/jojo-512/bellwork/pull/5)). Batch 3 puts swing + goblet squat, RDL + row, swing + high pull and gorilla row + sumo deadlift on the rig; Joe confirms each on his phone, then it merges with his go-ahead. Battery and heat are an open punchlist item, to be judged in the gym. Plan: [proposals/rig-app-plan.md](./proposals/rig-app-plan.md). Next: batch 4 (halos and figure-8s).
1. Pose cleanup slice 1 is on `main` and will go live with the GitHub Pages deploy.
2. Split squat, Overhead lunge, and Dead-stop row are approved in data (`pending` removed) — they enter the draw without a phone tap. Rear leg on side view is dimmer (opacity 0.28, was 0.35) anywhere `kn2`/`an2` exist, including carries.
3. Later slice, still pending and untouched: reverse fly, swing + high pull, gorilla + sumo, carries, halo.
4. **Export was recommended before install** — if you haven't, export the session log once, then hard-refresh / re-add Home Screen.
5. After install: verify **Complex PR numbers** match pre-migration.
6. Slot template (whole-body guarantee) — Batch 3, after the remaining pending approvals land in rotation.
7. Keep dropping gym bugs into [punchlist.md](./punchlist.md)

## Last session (2026-10-15, Claude, rig batch 3: hinge and pull)

- **Rig:** a two-hand handle hold (`on: "handle"`), where the bell hangs from the middle of both hands. A per-phase `fling` (0 to 1) swings the bell out in line with the forearms, as at the top of a swing. A `shoulder` hand frame gives an arm hanging straight down (`hang`), and the floor bell's handle sits 2 cm higher.
  - The hand-off check now applies only where one hand is involved, so regripping from the handle to the horns isn't treated as a pass.
- **New blocks:** `hinge` and `sumo_bottom` bodies; `backswing` and `hang` hands; `row` and `high_pull` elbows; `wide` stance. `overhead_horns` is renamed `horns_overhead` to match the notes vocabulary, which now lists the new words.
- **Swing + high pull and swing + goblet squat:** a two-hand swing (deeper backswing, the bell in line with the arms at the float). The high pull drives the elbows high and outside; the squat catches the bell onto the horns at the float.
- **RDL + row:** a one-hand hinge with the arms hanging, a hold, a row to the hip with the elbow back, then stand.
- **Gorilla row + sumo deadlift:** wide stance, alternating the rowing hand each rep (right rep, then left). Row, park the bell on the floor, regrip with both hands, sumo-deadlift to stand, lower.
- **Timing:** a phase's `t` is the time to move from that phase to the next one, not time spent in it. Missing that first gave the sumo stand-up 0.15 s, which the speed check caught.
- Card views: side + front for all four; gorilla + sumo leads with front.
- **Joe's phone review:** approved RDL + row, lateral lunge + press, clean + squat + press, reverse lunge + twist and thruster. Swing + goblet squat was approved with a nit.
- **Changes from his notes:**
  - Swing + high pull: the bell now stays hanging, handle up, from the float through the pull and release.
  - Swing + goblet squat: less fling at the float, so the bell shows more gravity.
  - Gorilla row: the elbow drives up and out (`row_wide`) and the torso opens 22° toward the rowing arm.
  - Clean + reverse lunge: views changed to side + three-quarter.
  - Clean & press: a knee dip when the bell lands in the rack (`Catch`). Joe picks side or three-quarter once he has seen it.
- The contact sheet gained a movement menu at the top of each sheet, since the published review page could not reach the picker.

## Earlier (2026-10-14, Claude, rig batch 2: lunges)

- Reverse lunge + twist, clean + reverse lunge and lateral lunge + press carry `rig` and pass the checks. The lunges reuse the blocks (no new body blocks): the back foot is a per-phase `footR` target, flat or on its toes, and the front foot stays planted.
- Reverse lunge + twist follows the prototype, alternating right then left (`sides: "alternate"`). The twist turns the ribcage over the front leg with the hips square.
- Clean + reverse lunge is the step 1a clean, then the right leg steps back with the bell racked on the right.
- Lateral lunge + press steps the right foot out to 0.76 m and sits into the right hip, then stands and presses by the horns like the thruster.
- Card views (Claude's suggestion, for Joe to confirm): lunge + twist side + three-quarter (the twist reads best there), lateral lunge front + three-quarter (side hides the lateral step), clean + lunge side + front.
- The floor patch now covers every foot position in the rep, so a wide stance stays on it; movements with feet under the hips draw the same patch as before.
- Opened [PR #5](https://github.com/jojo-512/bellwork/pull/5). Joe approved all three and confirmed the views; merged by Claude with his go-ahead (merge commit ef713b4).

## Earlier (2026-10-14, Claude, rig step 1b)

- `RigFigure` in `bellwork.jsx`: a canvas per view, one shared 30 fps loop that paints only figures on screen (IntersectionObserver), pixels freed when a figure scrolls off, sharpness capped at 2×, one shared clock so a movement's views stay in step and the timer's re-render never restarts them, and reduced motion draws the movement's `still` phase.
- The switch: a movement with `rig` counts as figured (`hasPoses`), the workout card shows its `rig.views` with labels from `VIEW_LABELS`, and the Library's side/front toggle picks from `rig.views`. The contact sheet already switched in 1a. Movements without `rig` keep the old `Figure`.
- Clean & press and thruster now carry `rig`, and both pass the checks. Clean & press is clean + squat + press without the squat, with a mid-press phase. Thruster uses two new hand blocks (`goblet`, `overhead_horns`) and a `goblet` elbow, holds the bell by the horns throughout, and presses forward of the face so the bell clears the head; overhead the bell hangs under the hands, as a horns grip does (the old figure drew it above them).
- Checked in the built app at 390×844: card, Library (both toggles) and reduced motion; no console errors. Private previews published from the session for Joe.
- Opened [PR #4](https://github.com/jojo-512/bellwork/pull/4). Joe approved clean & press and thruster on his phone, logged the battery check as an open punchlist item, and gave the go-ahead; merged by Claude (merge commit 96599dd).

## Earlier (2026-10-14, Claude, rig step 1a)

- Joe approved the app plan. Built step 1a on `claude/pensive-cori-xlhxdn`: `rig.js` (one rig merged from the prototypes: IK, per-phase bell hand as blend weights, monotone sampler, fixed framing at 80 px/m with ground at 178, fixed depth shading, drawing, checks), `blocks.js` (bodies, hands, elbow presets, stances), `checkRig`/`validateRig` wired into `npm run check`, and a rig mode on the contact sheet.
- Clean + squat + press now carries `rig` data (blocks plus overrides; block targets land within 1.4 cm of the prototype's). The app still draws its old figure.
- The new checks caught three faults in the approved trial and they're fixed: the hike hand was 2.3 cm out of reach (`between_legs` moved to where the hand lands), the legs over-straightened between Pull to rack and Rack (sampler overshoot; slopes are now monotone), and the elbow snapped at 6 m/s from Bottom to Drive + press (the press is now about halfway at the mid-drive phase, hand [0.12, 1.5, 0.2]; elbow peak under 5 m/s).
- The prototype pages in `docs/prototypes/` are kept for the record; the contact sheet replaces them for review.
- Opened [PR #3](https://github.com/jojo-512/bellwork/pull/3) (step 1a, with the plan commits) into `main`. Merged by Claude with Joe's go-ahead (merge commit 6d6673e).

## Earlier (2026-10-14, Claude, app plan)

- Drafted [proposals/rig-app-plan.md](./proposals/rig-app-plan.md) for Joe's approval. Recommended: canvas renderer, ship Complex per batch, three-quarter view only on the review page, right side only in the app.
- An independent Claude subagent reviewed the plan against the code and prototypes. Main finds: bell hand must be per phase (Complex changes hands mid-rep), the speed check must cover every joint (the elbow peaks fastest in clean + squat + press), fixed framing and shading, phone canvas memory, split slice 1 into rig-only and app PRs, estimates roughly doubled. Plan revised; §7 lists the changes. Decision 4 changed to right-then-left for alternating movements; decision 3 widened to any two views per movement.

## Earlier (2026-10-14, Claude, animation bake-off and decision)

- **Bake-off:** the same clean + squat + press brief went to Cursor on Grok (about 30 min), Cursor on Opus at medium effort (about 26 min, about 2% of a month's Cursor Opus allowance) and a Claude subagent that saw neither Cursor build (11 min). Cursor on Opus and Claude came out close on quality, Grok behind; Claude was fastest, kept the data smallest and followed the cue's press timing most closely. Cursor's first run on Auto missed the lockout and the clean.
- **Decision (Joe):** Claude authors rig animations. Cursor stays available with Opus picked by hand when timing doesn't matter, and Claude checks any movement Cursor authors. Recorded in a new `AGENTS.md` Animation section. The repo stays public for now (no private folders exist in a public repo); added the public-repo rule to `AGENTS.md`.
- **`CLAUDE.md` added:** it points Claude sessions to `AGENTS.md`, so both agents read one rulebook.
- **Clean + squat + press revised:** a deeper hike (hips back, shins near vertical) and a per-phase elbow preset (hang, pull, rack, press) on the bell arm, which keeps the elbow tucked in the clean and steadies the press. Both Cursor runs also found the elbow needs a per-phase direction; named presets keep the data small. Carry this into the shared rig.
- Drafted [proposals/rig-ingest.md](./proposals/rig-ingest.md) and the notes contract [ingest/notes-spec.md](./ingest/notes-spec.md). Any agent that can watch a video writes one notes file per video (often five or six movements) and opens a PR; Claude reviews it, Joe picks movements, Claude animates on that PR, Joe approves on his phone, and the notes file is deleted before a squash merge. Text-only notes in the public repo first; a private notes repo is the fallback if renders suffer.
- **Joe's calls:** text-only notes in the public repo first; convert the existing pool before new videos, starting with Complex. Merged this branch (with PR #1's rig proposal and prototypes) to `main`.
- The three Cursor trial branches are to be deleted; this session can't delete remote branches, so Joe is doing it on GitHub.

## Earlier (2026-10-14, Claude, clean + squat + press rig trial)

- Trial page: [prototypes/clean-squat-press-rig.html](./prototypes/clean-squat-press-rig.html). First standing complex on the pelvis-rooted rig, beside the current app's six poses. Eleven phases: hike, drive, pull to rack, rack, squat, bottom, drive + press, lockout, lower, lower to rack, drop. The press starts on the way up from the squat, per the cue. Right/Left hand toggle; left is a computed mirror.
- Rig extended in two places (page only, no app code): a per-phase `rack` value blends a single bell between hanging from the hand and resting on the outside of the forearm, so the clean rolls the bell round the hand; a per-movement `kneeOut` lets the knees track out in the squat.
- Checked numerically and in screenshots: arm at 98% of full reach at lockout, nothing below the floor, the bell clears head, torso and legs through the whole rep. Open issue noted on the page: one elbow direction per arm is a compromise (clean-pull elbow drifts back and out; press elbow is sensitive to the hand target).
- Branch `claude/pensive-cori-xlhxdn`, no PR.

## Earlier (2026-10-14, Claude, history cleanup)

- **Repo history rewritten and every branch force-pushed**, `main` included (files on `main` unchanged). Removed: Joe's full name and personal email from commit metadata (now the GitHub username and no-reply address), a third-party creator handle and video detail, and Cursor subagent IDs. Every commit has a new ID; commit IDs in the docs were updated on this branch.
- **Ingest rule changed:** no footage, links or creator details go into the repo, and the `bellwork_notes` template has no `creator` field (`docs/animation-ingest-redesign.md` on the Slice 2 branch).
- **Old clones are unsafe.** Any clone made before this rewrite still holds the old history. Clone fresh; never merge, rebase or push from an old clone.
- Joe deleted the old Cursor project and isn't carrying over its notes. GitHub can still serve old commits to anyone with a direct link until it cleans up; a GitHub Support purge request is the remaining step.

## Earlier (2026-10-14, Cursor)

- Joe chose the joint-angle rig over Rig v2. No app code in this pass.
- Pushed `cursor/rig-v2-shoulders-9b80` at `6c11c43` with `docs/animation-ingest-redesign.md`, `docs/lift-ingest-workflow.md`, and `docs/video-ingest-trial-2026-10-07.md`. Shoulder tree restored as `27953e8` from local `aa8b049` (that commit was never on origin). Not merged to `main`.
- Second review posted on PR #1: [review](https://github.com/jojo-512/bellwork/pull/1#pullrequestreview-5512574578), with notes on the proposal and the three rig prototypes. No build until Joe approves a plan.

## Earlier (2026-10-14, Claude, public-repo check)

- Scanned every branch and all 43 commits after Cursor's push. No keys, tokens or passwords. No health detail in current files. Flagged a personal email in commit metadata, a third-party handle in an ingest doc, and Cursor subagent IDs in history; all removed in the history cleanup above.

## Earlier (2026-10-14, Claude)

- Floor work tested on the rig: [prototypes/floor-press-rig.html](./prototypes/floor-press-rig.html) and [prototypes/dead-bug-rig.html](./prototypes/dead-bug-rig.html), each beside the current app's poses. Lying down is the same skeleton tilted to -90°; bell hangs under gravity (rack on the forearm, horns from the handle); other side mirrored. Gaps noted on the pages: floor contact authored not enforced, rigid spine, no single front view works for every floor movement (floor press reads from the feet, dead bug from above).
- Joe's call: the rig looks better than the current app in every view and is the way to animate. Not every movement will get a perfect camera; side plus three-quarter give the context.
- Proposal revised (§0): withdrawn drag-to-rotate and MediaPipe; side and front stay on the workout screen; six slots stay, sequenced after pending carries are approved and Standard has a couple of plain carries.
- Still missing from the repo: `animation-ingest-redesign.md`, `lift-ingest-workflow.md`, `video-ingest-trial-2026-10-07.md`, and the Rig v2 Slice 2 branch. The posted reply asks Cursor to commit and push them.
- §6 movement flag reworded to a neutral load flag (repo is public).

## Earlier (2026-10-13, Claude, later)

- Cursor reviewed PR #1. Valid points accepted: the swing prototype was sagittal-only, ankle-rooted, and oriented the bell along the forearm; MediaPipe was trialled and rejected; drag-to-rotate doesn't suit a phone on the floor. Pool depth confirmed on `main`: Complex has no approved Carry, Anti-lean, Anti-extension or Anti-rotation; Standard's two Anti-lean marches share `variantGroup: "march"`.
- Joe said the Rig v2 approval (Oct 7) was made quickly while travelling and is open to revisit.
- New prototype: [prototypes/lunge-twist-rig.html](./prototypes/lunge-twist-rig.html). Pelvis-rooted 3D rig, two-bone IK for legs and arms from foot and hand targets, spine twist separate from a square pelvis, goblet bell hanging under gravity, left side generated by mirroring. Side, front and three-quarter views shown together. Joe: way better than the current version.
- Gap: the decision docs the review cites (`animation-ingest-redesign.md`, `lift-ingest-workflow.md`, `video-ingest-trial-2026-10-07.md`) and the Rig v2 Slice 2 branch are not in the repo, so Claude can't read them.

## Earlier (2026-10-13, Claude)

- **Proposal opened, not approved:** joint-angle rig for animation. Write-up in [proposals/rig-animation.md](./proposals/rig-animation.md), prototype swing in [prototypes/swing-rig.html](./prototypes/swing-rig.html). Branch `claude/rig-animation-proposal`. Also proposes six workout slots instead of five (§5), reversible by keeping the template as data. Nothing in the app changed.
- Next: Cursor reviews the PR (questions in §7 of the proposal), then Joe decides.

## Earlier (2026-10-01)

- **Pose cleanup slice 1 shipped** to `main` (`cursor/pose-cleanup-slice1-4325`). Live after Pages deploys: https://jojo-512.github.io/bellwork/
  - Front rack squat and Upright row approved in data (`pending` removed) — they enter the workout draw without a phone tap.
  - Side-view trail leg (`kn2`/`an2`) opacity 0.35 → 0.28 and a slightly thinner stroke, so the rear leg reads behind the stance leg.
  - Split squat, Overhead lunge, and Dead-stop row redrawn, then approved in data (`pending` removed). Split stays planted, overhead lunge steps back with the bell locked out, dead-stop row rests the bell on the floor.
  - Clean + bent row (`clean_row`) removed.
- **Library expand shipped** to `main`: tap a Library card for cue + grip (Add to rotation stays its own button). Live: https://jojo-512.github.io/bellwork/
- Branch `cursor/library-expand-cue-grip-5d9e`.

## Earlier (2026-09-30)

- **Batch 2 shipped** to `main` (see deploy record in Project `internal/batch-2-build-status.md`). Live: https://jojo-512.github.io/bellwork/
- Branch `cursor/batch-2-movement-loop-c1db`: data split, pools/complex migration, pending + variantGroup + text cards, `INGEST.md` / `npm run check` / `INBOX.md`, canon pass 1 (12 pending).

## Earlier (2026-09-30)

- **Batch 2 scoped and decided.** Joe answered all 11 scoping items; plan locked at **v1.0**; build approved and completed.

## Earlier (2026-09-23)

- Joe confirmed Batch 1 **iPhone Home Screen** checks: lock/timer, beeps + silent switch, Wake Lock, taller bar OK
- Punchlist cleared; docs synced to repo `main`

## Earlier (2026-09-23)

- **Shipped Batch 1** to `main` (`d56afdd`) → https://jojo-512.github.io/bellwork/
- Docs trio pushed to repo (`5e902d3`): vision-roadmap · punchlist · session
- Vision roadmap locked at **v1.2**

## Open questions

- None on Batch 2 scope. Pending movements wait on Joe's Library approvals.

## Pointers

| Doc | Role |
|---|---|
| [vision-roadmap.md](./vision-roadmap.md) | Plan + decisions |
| [batch-2-plan.md](./batch-2-plan.md) | Batch 2 scope + decisions (shipped) |
| [punchlist.md](./punchlist.md) | Small bugs / polish |
| Repo `BACKLOG.md` | Feature batches (checkbox progress) |
| Repo `AGENTS.md` | How we work + build/deploy |
| Repo `INGEST.md` | How to add a movement |
| Live site | https://jojo-512.github.io/bellwork/ |
| Repo | https://github.com/jojo-512/bellwork |
