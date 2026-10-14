# Movement notes: what to write and where

You're the notes agent. Joe has given you a video of kettlebell exercises. A video often shows several, five or six is common. You write structured notes on each one. A rendering agent who **cannot see the video** turns your notes into an animation on Bellwork's rig. Your notes are all it has, so precision matters more than brevity.

You write notes only. You don't author animations, edit `movements.js` or decide what goes into the app. Joe picks what to ingest.

---

## 1. Hard rules (the repo is public)

Everything you commit, including in a PR that is later closed or has the file deleted, stays public on GitHub. So:

- **No links**, video IDs, account names, handles or channel names.
- **Nothing about the person in the video:** no name, face, body, clothing, age, voice or anything else that could identify them. Describe the movement only.
- **No screenshots, frames or footage.** Text only.
- **No health or medical reasoning**, such as injuries, pain or conditions.
- **Never guess the bell's weight.** Write `unknown` if it isn't shown.

If you're unsure whether something breaks a rule, leave it out.

## 2. Where it goes

1. **Branch:** `notes/YYYY-MM-DD-<slug>` from `main`. The slug names the movements, not the source, for example `notes/2026-10-15-clean-press-row-set`.
2. **File:** one file per video at `docs/inbox/YYYY-MM-DD-<slug>.yaml`, holding every movement in the video in the order shown.
3. **Commit only that file.** Touch nothing else.
4. **Open a PR** into `main` titled `Notes: <slug>`. The body lists each movement on one line: its name and your suggested decision (§4). Then stop.

The rendering agent reviews the PR, Joe picks which movements to animate, and the notes file is deleted when the animations are approved.

## 3. Before you write

Read `movements.js` (the catalog) and `INGEST.md` §3–5 (pools and the rules for when to author nothing). For each movement in the video, find the existing entries closest to it. Many videos repeat movements Bellwork already has, and that's worth saying.

## 4. The format

```yaml
notes: 1
video_summary: Five-movement single-bell complex, standing, done for reps per side
camera_seen: [front_full, side_full]      # views you actually saw: front | side | three_quarter, each _full or _waist_up
movements:
  - name: Clean + squat + press
    order_in_video: 1
    nearest_ids: [clean_squat_press, rack_squat]
    suggested: duplicate                  # new | cue_edit | duplicate | skip
    why: Same chain as clean_squat_press; the press starts on the way up as in its cue
    load: bell                            # bell | none
    bells: 1                              # 1 | 2
    weight: unknown
    grip: One hand on the handle, loose hook for the clean, rack grip for squat and press
    laterality: unilateral                # bilateral | unilateral | alternating
    reps_seen: 5 per side                 # information only
    differentiator: Press begins while rising out of the squat, not after standing
    cues_seen:                            # coaching points shown or said, in your own words
      - Bell travels close to the body on the clean
      - Elbow stays tucked in the rack through the squat
    phases:                               # in order, as many as the movement needs (usually 4-12)
      - label: hike
        body: hinge
        feet: hip width, flat, toes slightly out
        bell_hand: between_legs
        bell: hanging
        free_hand: thigh
        time: medium                      # fast | medium | slow | hold
        detail: >
          Hips well back, shins near vertical, back flat at roughly 60 degrees
          from vertical. Bell behind the knees, between the legs, arm straight.
      - label: rack
        body: stand
        feet: same
        bell_hand: rack
        bell: racked
        free_hand: thigh
        time: medium
        detail: >
          Standing tall. Hand at chin height, close to the centre line. Elbow
          down and tucked against the ribs. Bell resting on the outside of the
          forearm.
    uncertain:
      - Knee width at the bottom of the squat; camera is slightly high
```

**Field notes**
- **`suggested`:**
  - `duplicate`: it's already in the catalog as is.
  - `cue_edit`: it's in the catalog, but the video shows a cue worth adding.
  - `new`: it isn't in the catalog.
  - `skip`: out of scope. Phase 1 is bell-only, and some movements are too subtle to draw (see `INGEST.md` §5).
- **`body`, `bell_hand`, `bell`, `free_hand`:** use the words in §5. If none fits, write `other:` and describe it in plain words.
- **`detail` is the most important field.** For each phase, describe:
  - **Hips:** height (above, level with or below the knees) and how far back.
  - **Torso:** angle from vertical, in rough degrees.
  - **Knees:** direction (over the toes, out, in) and how far forward of the ankles.
  - **Feet:** stance width, whether either foot is forward or back, and toe direction.
  - **Bell hand:** position relative to the body: chin, shoulder, hip, between the knees, overhead.
  - **Elbow:** direction (tucked, flared, behind the body, under the bell).
  - **Bell:** which way it sits (hanging, on the forearm, upside down) and where it is.
- **`time`:** roughly how long the move into this phase takes compared with the others. `hold` means a pause.
- **`uncertain`:** anything you couldn't see clearly. Say so rather than guessing. The rendering agent asks Joe instead of inventing it.

## 5. Vocabulary

- **body:**
  - standing: `stand`, `hinge`, `hike`, `quarter_squat`, `squat_bottom`, `split_front`, `split_back`, `lateral_lunge`
  - floor: `half_kneel`, `tall_kneel`, `lying`, `table_top`, `plank`, `side_plank`
- **bell_hand:**
  - one hand: `hang`, `between_legs`, `rack`, `chin`, `overhead`, `row_top`, `over_chest`
  - two hands: `goblet`, `horns_overhead`, `halo_side`
- **bell:** `hanging`, `racked`, `horns`, `bottoms_up`, `floor`
- **free_hand:** `thigh`, `side`, `forward`, `out`, `on_bell`, `floor`

The rendering agent adds words as movements need them.
