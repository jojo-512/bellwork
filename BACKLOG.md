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

## Batch 2 — the 90-day layer

- [x] Log bell weight per session (one-tap chip). Rounds PRs are meaningless across weight changes. This is logging, not a progression nudge. Pulled into Batch 1; PRs are scoped per weight.
- Consistency view: 13-week dot grid plus rounds over time per focus.
- Default focus based on the last two sessions so consecutive days rotate, still overridable.

## Batch 3 — deployment

- Service worker for offline use (hotel gyms with bad wifi). A second file is fine now that it's hosted.

## Batch 4 — content and layout

- Complex pool is press-heavy and pull-light. Add 2 to 3 pull-dominant hybrids (e.g. swing + high pull, gorilla row + sumo deadlift, clean + bent row). Each needs hand-authored side and front pose coordinates.
- Compact in-workout mode: once the timer starts, cards collapse to name and reps, tap to expand.
