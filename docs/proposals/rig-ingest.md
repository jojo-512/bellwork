# Proposal: ingesting movements on the rig

Status: **draft for Joe's review.** Nothing in the app is built from this until Joe approves an implementation plan.
Author: Claude, 2026-10-14.
Builds on: [`rig-animation.md`](./rig-animation.md) §0 (the rig), `INGEST.md` (catalog rules, unchanged), and the Oct 7 notes format in `docs/animation-ingest-redesign.md` §4b on `cursor/rig-v2-shoulders-9b80`.

---

## 1. The flow

The repo is the hand-off point, so it doesn't matter which agent watched the video.

1. **Notes.** Joe gives a video to any agent that can watch it and reach the repo (today, the Cursor project agent, using its saved ingest skill). It follows [`docs/ingest/notes-spec.md`](../ingest/notes-spec.md): one notes file per video, covering every movement in it (often five or six), committed on its own branch with a PR.
2. **Review.** Joe tells the rendering agent (Claude by default, per `AGENTS.md`) that the PR is up. Claude checks it in three steps:
   - first, that nothing private went in (§3);
   - then each movement against the catalog under `INGEST.md` §4–5;
   - then posts a short summary on the PR: one line per movement with Claude's recommendation (new, cue edit, duplicate or skip).
3. **Joe picks** which movements to animate. Notes are a pantry, not a queue.
4. **Animate.** Claude builds each picked movement from named building blocks (§2) on the PR's branch, or on a branch made from it, and runs the checks (§4).
5. **Joe reviews on his phone.** Claude publishes one private review page per PR, with a picker for the movements in it. Each movement shows the animation in side, front and three-quarter views and one still per phase. Joe approves each one or says what to change, and Claude changes it.
6. **Merge.** In the same PR, Claude deletes the notes file and leaves only the approved animations, then squash-merges with Joe's go-ahead. `main` gets a single commit per video with the animations and no notes.

Until the app implementation plan is approved and built, the animations land as rig data beside the prototypes. After that they go straight into `movements.js` as `pending`.

**Time:** about 10–15 minutes of Claude time per movement; a five-movement video can run in parallel.

## 2. Building blocks

Named positions Claude composes a movement from. Each one is a small set of rig values, so the same name means the same position in every movement. The notes use the same words (spec §5).

- **Bodies:**
  - standing: `stand`, `hinge`, `hike`, `quarter_squat`, `squat_bottom`, `split_front`, `split_back`, `lateral_lunge`
  - floor: `half_kneel`, `tall_kneel`, `lying`, `table_top`, `plank`, `side_plank`
- **Hands**, placed relative to the shoulder so they follow the torso:
  - one hand: `hang`, `between_legs`, `rack`, `chin`, `overhead`, `row_top`, `over_chest`
  - two hands: `goblet`, `horns_overhead`, `halo_side`
- **Elbow presets:** `hang`, `pull`, `rack`, `press`, `row`.
- **Bell:** `hanging`, `racked`, `horns`, `bottoms_up`, `floor`.

The list grows only when a real movement needs it. Clean + squat + press already needed `hike`, `squat_bottom`, `rack`, `overhead` and the elbow presets.

## 3. Privacy

The repo is public, and a PR stays public after it is closed or its file is deleted. Deleting the notes on merge keeps `main` tidy, but it doesn't make them private. So the spec forbids:
- links, account names and anything about the person in the video;
- screenshots and footage;
- health reasoning.

Claude checks every notes PR for these before anything else. If a PR breaks a rule, Claude tells Joe instead of building on it.

If text-only notes turn out not to be enough for good animations, the fallback is a private notes repo, where stills and links are safe. That's a free private repo with no site; only the animations come to this one. Revisit this after the first few videos.

## 4. Checks before Joe sees anything

These run on every movement, on both sides:

- **Reach:** every hand and foot target is within reach, and lockouts reach at least 95% of the arm's length.
- **Floor:** nothing goes below the floor, and the bell clears it except where it's meant to rest there.
- **Clearance:** the bell stays clear of the head, torso and legs.
- **No snaps:** the bell's speed stays below a cap.
- **Planted feet:** feet that should stay planted don't move.
- **Mechanics:** a phase-by-phase visual check of every phase in all three views against the notes, the cue and how a coach teaches each position. Anything Claude couldn't get right is stated on the review page. Anything the notes marked `uncertain` is asked of Joe, not invented.

The numeric checks are a script today, written for the clean + squat + press trial. It moves into the repo as part of the app plan, so every agent runs the same one.

## 5. Cursor's role

As in `AGENTS.md`: Cursor can author an animation when Joe asks, with Opus picked by hand, following this same flow, and Claude runs §4 on it before Joe reviews.

## 6. Decisions and open question

1. **Convert the existing pool first** (Joe, 2026-10-14), in batches, starting with Complex. New videos wait until the conversion is done, so the app never runs two animation systems for long.
2. **Open:** which video goes through this flow first, once conversion is under way. A five- or six-movement one would test the multi-movement handling.
