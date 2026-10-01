# Bellwork — session log

Where we left off. Update at the end of each working session (or ask the Project agent to).

## Next

1. Pose cleanup slice 1 is on `main` and will go live with the GitHub Pages deploy.
2. Split squat, Overhead lunge, and Dead-stop row are approved in data (`pending` removed) — they enter the draw without a phone tap. Rear leg on side view is dimmer (opacity 0.28, was 0.35) anywhere `kn2`/`an2` exist, including carries.
3. Later slice, still pending and untouched: reverse fly, swing + high pull, gorilla + sumo, carries, halo.
4. **Export was recommended before install** — if you haven't, export the session log once, then hard-refresh / re-add Home Screen.
5. After install: verify **Complex PR numbers** match pre-migration.
6. Slot template (whole-body guarantee) — Batch 3, after the remaining pending approvals land in rotation.
7. Keep dropping gym bugs into [punchlist.md](./punchlist.md)

## Last session (2026-10-01)

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

- **Shipped Batch 1** to `main` (`2cec3bb`) → https://jojo-512.github.io/bellwork/
- Docs trio pushed to repo (`d53e729`): vision-roadmap · punchlist · session
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
