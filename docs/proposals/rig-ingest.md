# Proposal: ingesting movements on the rig

Status: **draft for Joe's review.** Nothing is built from this until Joe approves it.
Author: Claude, 2026-10-14.
Builds on: [`rig-animation.md`](./rig-animation.md) §0 (the rig), `INGEST.md` (catalog rules, unchanged), and the Oct 7 notes format in `docs/animation-ingest-redesign.md` §4b on `cursor/rig-v2-shoulders-9b80`.

---

## 1. The flow

1. **Joe finds a movement** and sends it to Research Rob. Rob writes notes in the format in §2. The video link stays with Joe and Rob; it never comes here.
2. **Joe says `ingest: <name>`** in a Claude session. He pastes Rob's notes and attaches 2–4 stills: the start, the hardest position, and the moment that makes it different. Claude can read images, not video, so the stills are what it checks positions against.
3. **Claude decides** under `INGEST.md` §4–5: a new entry, a cue edit on an existing one, or decline. Nothing changes here.
4. **Claude authors the phases** from named building blocks (§3), then tunes the numbers.
5. **Claude checks its own work** (§4) and fixes what fails.
6. **Joe reviews on his phone.** Claude publishes a private page: the animation in side, front and three-quarter views, plus one still per phase. Joe approves it or says what's wrong. Gym feedback later follows the same loop.
7. **Into the app** as `pending`. Joe's Library tap approves it, as today. This step depends on the app implementation plan, which is not approved yet. Until then, approved movements wait as prototype pages.

About 10–15 minutes of Claude time per movement, and several can run in parallel.

## 2. What Rob's notes need to say

This is the Oct 7 `bellwork_notes` format with three changes:
- phases describe body positions;
- there's no creator field and no link;
- the timing is per phase.

```yaml
bellwork_notes: 2
name: Clean + squat + press
load: bell                      # bell | none
bells: 1
grip: Loose hook to the clean, rack grip through the squat and press
laterality: unilateral          # bilateral | unilateral | alternating
nearest_ids: [clean_squat_press, rack_squat]
differentiator: Press starts on the way up from the squat
camera_seen: [front_full, side_full]   # only views Rob actually saw
phases:                         # in order; 4-12 is normal
  - { label: hike,   body: hinge,        bell_hand: between_legs, bell: hanging, free_hand: thigh, time: medium }
  - { label: rack,   body: stand,        bell_hand: rack,         bell: racked,  free_hand: thigh, time: medium }
  - { label: bottom, body: squat_bottom, bell_hand: rack,         bell: racked,  free_hand: forward, time: medium }
  - { label: lockout, body: stand,       bell_hand: overhead,     bell: racked,  free_hand: side,  time: hold }
uncertain: [knee width at the bottom; camera is high]
```

- **`body`, `bell_hand` and `bell`** use the words in §3. A word that isn't there is fine; Rob writes it plainly and Claude either adds a block or asks.
- **`time`:** `fast`, `medium`, `slow` or `hold`. Rob doesn't need numbers; Claude sets them and matches the catalog `dur`.
- **Weight:** never guess it. `reps_seen` stays informational, as before.

## 3. Building blocks

Named positions Claude composes a movement from. Each one is a small set of rig values, so the same name means the same position in every movement:

- **Bodies:**
  - Standing: `stand`, `hinge`, `hike`, `quarter_squat`, `squat_bottom`, `split_front`, `split_back`, `lateral_lunge`.
  - Floor: `lying`, `table_top`, `half_kneel`, `tall_kneel`, `plank`.
- **Hands**, placed relative to the shoulder so they follow the torso:
  - One hand: `hang`, `between_legs`, `rack`, `chin`, `overhead`, `row_top`, `over_chest`.
  - Two hands on the bell: `goblet`, `horns_overhead`, `halo_side`.
- **Elbow presets:** `hang`, `pull`, `rack`, `press`, `row`.
- **Bell:** `hanging`, `racked`, `horns`, `floor`.

The list grows only when a real movement needs a new entry. Clean + squat + press already needed `hike`, `squat_bottom`, `rack`, `overhead`, and the elbow presets.

## 4. Checks before Joe sees anything

These run on every movement, on both sides:

- **Reach:** every hand and foot target is within reach, and lockouts reach at least 95% of the arm's length.
- **Floor:** nothing goes below the floor, and the bell clears the floor except when it's meant to rest there.
- **Clearance:** the bell stays clear of the head, torso and legs.
- **No snaps:** the bell's speed stays below a cap.
- **Planted feet:** feet that should stay planted don't move.
- **Mechanics:** a phase-by-phase visual check against the `cue` and how a coach teaches each position. Claude reviews the stills in all three views and states anything it couldn't get right on the page.

The numeric checks are a script today (written for the trial). It would move into the repo as part of the app plan, so every agent runs the same one.

## 5. Cursor's role

As in `AGENTS.md`: Cursor can author a movement when Joe asks, with Opus picked by hand, following this same flow. Claude runs §4 on it before Joe reviews.

## 6. Questions for Joe

1. **Where do Rob's notes arrive?** Pasting them into the Claude session is simplest. `INBOX.md` also works, since the notes carry no link or creator details, but it means a commit per note.
2. **Converting the existing pool:** convert the current pool to the rig in batches before adding new movements, or interleave them? Converting first avoids running two animation systems for long.
3. **Review page:** one private page per movement, as with the prototypes, or one review page per batch?
