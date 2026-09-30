# Bellwork backlog

Do not implement from this file until Joe approves a plan. Setup and rebuild come first.

## Batch 1 — mechanical fixes

Shipped 2026-09-23 except the slot template, which was deferred.

- [x] Timer uses setInterval decrements, which drift or stall when iOS locks the screen. Compute remaining time from a stored start timestamp; add Wake Lock API.
- [x] Audio beep at 1:00 remaining and 0:00 (START tap unlocks audio on iOS).
- [x] Daily seed and session dates use toISOString (UTC), so the circuit flips to tomorrow's in the evening in Austin. Use local date.
- [ ] Full body doesn't guarantee whole body: picker takes first five unique patterns, core is split into five pattern labels, so it can produce a "full body" day with no leg-dominant move or no pull. Use a slot template: hinge, squat or lunge, push, pull, core.
- [x] Reshuffle salt, swaps, and in-progress timer aren't persisted, so a reload loses them. Sticky prefs (mode, duration, weight) too.
- [x] New PR state on the finish bar.
- [x] Check timer bar fit on a 375px-wide screen while running.

iPhone Batch 1 checks done (Joe OK 2026-09-23): lock/timer, beeps + silent switch, Wake Lock, bar height.

## Batch 2 — open the ingestion loop, then fill the canon

Shipped on branch `cursor/batch-2-movement-loop-c1db` (awaiting Joe's push go-ahead).

- [x] Move `EXERCISES` out of `bellwork.jsx` into `movements.js` (+ `poses.js`).
- [x] `hybrid` + `advancedOnly` → one `pools` field; internal mode `advanced` → `complex`, with storage migration.
- [x] `INGEST.md` — standalone authority for adding movements. `INBOX.md` at repo root. `npm run check`.
- [x] `pending: true` staging + Library "Add to rotation"; freeze circuit ids in a live run.
- [x] `variantGroup` in the draw and in Swap (conservative groups on the existing 46).
- [x] Optional `poses` — text cards when un-illustrated.
- [x] Canon pass 1 (~12 pending): Complex pull hybrids, carries, anti-lean chain, knee-dominant, Standard pull depth. Half get-up deferred to the first post-loop drop.
- Consistency view: 13-week dot grid plus rounds over time per focus. (Batch 3+)
- Default focus based on the last two sessions so consecutive days rotate, still overridable. (Batch 3+)

## Batch 3 — deployment

- Service worker for offline use (hotel gyms with bad wifi). A second file is fine now that it's hosted.

## Batch 4 — content and layout

- [x] Complex pool is press-heavy and pull-light. Add pull-dominant hybrids (swing + high pull, gorilla row + sumo deadlift, clean + bent row). Landed in Batch 2 canon pass 1 as `pending: true`.
- Compact in-workout mode: once the timer starts, cards collapse to name and reps, tap to expand.
