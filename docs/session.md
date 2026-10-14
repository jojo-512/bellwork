# Bellwork — session log

Where we left off. Any agent (Cursor or Claude) updates this file at the end of each working session, and whenever it opens, merges or closes a pull request: add a dated entry under Last session and keep Next current. Read it before starting work.

## Next

0. **Animation: rig chosen, Claude authors.** Clean + squat + press is the first standing complex on the rig ([page](./prototypes/clean-squat-press-rig.html), branch `claude/pensive-cori-xlhxdn`). Next: a short proposal for the rig ingestion process (Research Rob notes → rig phases → Claude check → Joe's phone approval), then an implementation plan for Joe to approve. PR #1 (`claude/rig-animation-proposal`) holds the direction; Cursor's second review is [here](https://github.com/jojo-512/bellwork/pull/1#pullrequestreview-5512574578). No app build yet.
1. Pose cleanup slice 1 is on `main` and will go live with the GitHub Pages deploy.
2. Split squat, Overhead lunge, and Dead-stop row are approved in data (`pending` removed) — they enter the draw without a phone tap. Rear leg on side view is dimmer (opacity 0.28, was 0.35) anywhere `kn2`/`an2` exist, including carries.
3. Later slice, still pending and untouched: reverse fly, swing + high pull, gorilla + sumo, carries, halo.
4. **Export was recommended before install** — if you haven't, export the session log once, then hard-refresh / re-add Home Screen.
5. After install: verify **Complex PR numbers** match pre-migration.
6. Slot template (whole-body guarantee) — Batch 3, after the remaining pending approvals land in rotation.
7. Keep dropping gym bugs into [punchlist.md](./punchlist.md)

## Last session (2026-10-14, Claude, animation bake-off and decision)

- **Bake-off:** the same clean + squat + press brief went to Cursor on Grok (about 30 min), Cursor on Opus at medium effort (about 26 min, about 2% of a month's Cursor Opus allowance) and a Claude subagent that saw neither Cursor build (11 min). Cursor on Opus and Claude came out close on quality, Grok behind; Claude was fastest, kept the data smallest and followed the cue's press timing most closely. Cursor's first run on Auto missed the lockout and the clean.
- **Decision (Joe):** Claude authors rig animations. Cursor stays available with Opus picked by hand when timing doesn't matter, and Claude checks any movement Cursor authors. Recorded in a new `AGENTS.md` Animation section. The repo stays public for now (no private folders exist in a public repo); added the public-repo rule to `AGENTS.md`.
- **`CLAUDE.md` added:** it points Claude sessions to `AGENTS.md`, so both agents read one rulebook.
- **Clean + squat + press revised:** a deeper hike (hips back, shins near vertical) and a per-phase elbow preset (hang, pull, rack, press) on the bell arm, which keeps the elbow tucked in the clean and steadies the press. Both Cursor runs also found the elbow needs a per-phase direction; named presets keep the data small. Carry this into the shared rig.
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
