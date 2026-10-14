# Lift ingest — easier render → review → approve

Status: **Joe approved (2026-10-01).** Open question answered: yes — on a single-lift review, **approve** or **push** is the push OK for that lift's commit (clear `pending`, or ship pending). Not a standing approval. Tooling/app changes still need their own push OK. §4 “Build first” is on `main` (`40b6536`), pushed 2026-10-01.

The question: when you send one lift for ingestion, how do we get from "here's a movement" to "it's in my rotation" with fewer round-trips?

---

## 1. Current friction

Canon pass 1 is the evidence: 12 lifts landed pending, **2 were right first time**, 1 was dropped, 3 were fixed in slice 1, and **6 are still waiting** (reverse fly, swing + high pull, gorilla + sumo, both carries, halo march).

1. **The agent can't see what it draws.** It writes joint coordinates and runs `npm run check`, which checks the data's shape, not what the figure looks like. "Arms detach from bell," "reads as an upright row," "one-leg weirdness": none of these can fail a check today.
2. **You're the first person to see the figure, and only after it's live.** The loop is: author, show the diff (text, which can't show an animation), push OK, wait for Pages, open on your phone, write prose feedback, re-author. Try Live on the agent's desktop sits in between and adds friction instead of removing it.
3. **Three gates per fix.** Plan OK, diff OK, push OK, and pose cleanup runs in small slices, so a two-figure fix can cost three messages from you.
4. **Approval has two paths.** The phone tap writes `bellwork-approved` on that device only, and an agent has to fold it into the repo later. You've already said you'd rather approve repo-side by message.
5. **Feedback is prose about frames you can't point at.** "Animation order vs cue" is hard to act on when nobody can say "frame 3."

Most of the pain comes from points 1 and 2. Gates and approval paths are process, and process is cheap to fix.

---

## 2. Options, ranked by effort vs pain relief

All five keep your rules: plan before build, show the diff, nothing reaches `main` without your explicit OK, `pending` still means Library-only, and there's no new structure for Complex.

### A. One reply per lift *(docs only · relief: medium)*

Fold the gates into one message per lift.

- **You send:** a message in Project chat: `ingest: <name>, <reps>`, plus the link if you have one. An ingest worker (grok) picks it up.
- **Poses:** authored exactly as today.
- **Review:** the agent sends one message with the classification line (pattern, pools, variant group, reps, cue), the diff summary, and the options **push · redo `<note>` · drop**. For a single lift that one message covers both plan and diff, so there's no separate plan step.
- **Approve lands:** you say "approve swing high pull." The agent clears `pending` in `movements.js` and pushes that one-line commit. The phone button stays, but becomes optional.
- **Still manual:** watching the figure on your phone after it's live, and writing prose feedback.

Cheapest, but it doesn't fix the real problem: figures still reach you wrong.

### B. The agent looks at its own figures before you do *(small build · relief: high)* — **core of the recommendation**

Give the authoring agent eyes, plus a few mechanical checks.

- **You send:** same as A. **New, optional:** attach 1–2 screenshots from the reel (start position and the hardest position). The agent can't watch video, but it can read stills, and a still of the top of a high pull is better than a sentence.
- **Poses:** after `npm run check` passes, the agent opens a **contact sheet**, a review-only page showing each keyframe large, side and front, numbered 1…n. It screenshots the sheet, compares it with your screenshots and the cue, and fixes the figure itself (up to ~3 rounds) before you see anything.
- **New checks in `npm run check`** (pure JS, no dependencies), aimed at the actual pass-1 failures:
  - bell within a few units of the gripping hand (`ha` / `haR`) in every frame, so arms can't drift off the bell (reverse fly)
  - limb lengths roughly constant across frames, so legs and arms don't stretch or shrink (carries, halo)
  - planted ankles stay at the ground line unless the pose is a step or a lunge
- **Review:** the agent's one message (as in A) now includes the **contact sheet image and a short loop clip** of side and front views. You review the animation in chat, on your phone, *before* the push.
- **Approve lands:** as in A. Once you've seen the figure in chat, you can choose between:
  - **push**: ships pending, and you check it in the gym
  - **approve**: ships with `pending` already cleared, one gate instead of two
- **Still manual:** judging whether the figure *reads as* the movement. No check can say "this looks like a squat, not a lunge." That stays your call, but you make it from a picture in chat instead of after a deploy.

### C. Numbered frames for feedback *(rides along with B · relief: medium)*

The contact sheet numbers its frames, and the Library card can show the same numbers when expanded. Then feedback becomes "gorilla + sumo: swap frames 2 and 3" or "halo frame 2: bell behind the head, not over it." This turns prose into an edit the agent can act on. It costs almost nothing on top of B.

### D. Batch redo rounds by lift, not by slice *(process · relief: medium)*

For the 6 lifts still pending: one worker takes **one lift at a time** through B and sends you a single message per lift. You reply per lift. Approved lifts go out together in one push you OK once. This replaces "plan a slice, build a slice, push a slice" for pose fixes. Plans stay mandatory for app or schema changes.

### E. Pose editor *(large build · relief: high, but only for new shapes)*

Still parked, and it should stay that way. You'd drag joints on a page and export the entry. That's only worth building once Tier B shapes (half get-up, Cossack) pile up and B's self-review keeps failing on shapes the vocabulary doesn't have. The roadmap's cost breakdown still holds.

**Not recommended:** extracting poses from video with pose-estimation models. That's a platform-sized dependency for one user's stick figures, and the vocabulary approach already works for Tier A. Branch preview links on third-party hosts were also ruled out: checked today, raw.githack returns 403 and jsDelivr returns 404 for the repo's `index.html`. Pages serves `main` only, so the reliable way to review before a push is a picture or clip in chat.

| | Effort | Pain relief | Changes what you do |
|---|---|---|---|
| A. One reply per lift | docs only | medium | one reply instead of 3 gates |
| **B. Agent self-review + sheet in chat** | small (review page + checks) | **high** | review in chat, before the push |
| C. Numbered frames | tiny, with B | medium | feedback by frame number |
| D. Per-lift redo rounds | process | medium | one message per lift |
| E. Pose editor | large | high for Tier B only | you edit poses yourself |

---

## 3. Recommended default: send one lift

**A + B + C, as a single flow.**

1. **You:** `ingest: swing + high pull, 8 reps` in Project chat, plus a link and/or 1–2 screenshots. Nothing else.
2. **Worker (grok):** follows `INGEST.md`. It drafts the entry, runs `npm run build` and `npm run check` (with the new mechanical checks), screenshots the contact sheet, and fixes the figure until it matches your screenshots and the cue. If it can't get a shape right, it ships text-only (the existing rule).
3. **Worker → you, one message:** contact sheet with numbered frames, a short loop clip, the classification line, and **push · approve · redo `<frame/note>` · drop**.
4. **You reply one word** (or a frame note).
   - **approve:** commit with `pending` cleared, then push.
   - **push:** commit with `pending: true`, then push. Later, "approve `<lift>`" makes a one-line repo flip and push.
   - **redo:** back to step 2 with your note. Nothing has been pushed.
5. **Catalog:** approval always lands in `movements.js`. The phone button stays as a backup, and any device approvals get folded in on the next pass, as now.

What you stop doing: writing a plan reply for a single lift, opening Try Live, and checking figures only after deploy.

---

## 4. Build first vs later

**First (one small slice, through the normal plan → diff → push OK):**

1. `INGEST.md` §7 rewritten as the flow above: one message, reply words, approve = repo flip, screenshots welcome, and "look at the contact sheet before showing Joe."
2. **Contact sheet view.** A review-only page, separate from the main app so it can't break it, that renders one movement's keyframes large with frame numbers. It reuses the existing `Figure`.
3. **Three mechanical checks** in `check.mjs`: bell-to-hand, limb length, grounded feet. Run them once on the existing 57 lifts, expecting them to flag the 6 known-bad ones.

**Then use it, not build more:** run the 6 still-pending lifts through the new flow, one at a time (option D). That's the real test, the same way canon pass 1 tested `INGEST.md`.

**Later, only if the trial shows a need:** frame numbers on Library cards (C beyond the sheet), more checks drawn from what still slips through, and the pose editor (E) once Tier B shapes queue up.

---

## 5. Stick-figure limit (Joe, 2026-10-07)

The Grok-bot reel trial showed a real hole: **advanced movements cannot be tracked well with these simple renderings.** Ingest stays inside what `Figure` can actually draw. If the thing that makes the lift different cannot be shown (hand switch, thoracic twist, one trap, floor pullover arc, no-bell push-up), it is a cue on an existing card or a decline — not a new lookalike. Details: [video ingest trial](./video-ingest-trial-2026-10-07.md).

---

## 6. Open question — answered yes (2026-10-01)

**Does your "approve" (or "push") reply count as the explicit push OK for that one lift's commit?** Yes. This covers both an approve from the contact sheet and an "approve `<lift>`" flip for a lift that's already pending. It isn't a standing approval, because it's one explicit OK per message and per lift. The roadmap's "no standing approval" rule still holds. Tooling and app changes still need a separate push OK.
