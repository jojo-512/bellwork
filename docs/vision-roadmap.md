# Bellwork — vision and roadmap

Status: v1.2 · Batch 1 shipped 2026-09-23 (`main` `2cec3bb`) · Next: iPhone punchlist checks, then Batch 2 when approved
Live: https://jojo-512.github.io/bellwork/ · Repo: https://github.com/jojo-512/bellwork
Also see: [session.md](./session.md) (left off / next) · [punchlist.md](./punchlist.md) (small bugs) · repo `BACKLOG.md` (feature batches)

---

## 1. Vision

**One bell, 20–30 minutes, every day — the best a single kettlebell has to offer.**

Built for one user. Open it at the rack, today's circuit is already there, hit START, work. No
program to follow, no decisions before the first swing, no logging chore after.

Phase 1 assumes the *worst* gym, so it works in every gym:

- **One kettlebell, 20–40 lb.** No rack of bells, no barbell, no bench, no pull-up bar.
- **Abundant floor space when you have it**, and everything still works when you don't.
- **Bell movements only.** Bodyweight, mobility, and cardio are Phase 2.

Three properties matter, and everything in Phase 1 serves one of them:

- **Coverage** — a whole-body day actually hits a hinge, a knee-dominant, a push, a pull, and
  core. Not five labels that happen to differ.
- **Rotation you enjoy** — enough variety that the body keeps adapting, biased toward the
  movements you actually like. Not a variety quota.
- **A pool that keeps growing** — a tight loop for turning a good workout you saw online into
  movements in the app, because that content is plentiful and the pool is what bounds variety.

**What it is not:** a coach, a program, a social app, an account. It shows you a workout and
records it.

**A design constraint worth naming:** part of the point of this project is learning to code, so
prefer changes you can read six weeks later over changes that are clever. It's also why the
single-file build stays — one push deploys, and there's nothing to understand but the app.

---

## 2. Phases

**Phase 1 (now) — max out the bell.** Every pattern a single kettlebell can train, deep enough
to stay fresh and hard for 90 days, rock solid on an iPhone in any gym, with an easy way to keep
adding movements.

Done when: ~90 days of daily 20–30 minute sessions happened, every day covered the whole body,
you enjoyed most of them, and you can see the whole thing at a glance. Then you decide what's
next.

**Phase 2 (later) — beyond the bell.** Bodyweight, mobility and stretching, cardio. Mostly
content, not architecture. Movements will need a `load` notion (bell / bodyweight / none);
time-based prescriptions are already free, since `reps` is a plain string (`"6 / dir"`), so
`"30 s"` works today.

**Phase 3 (later) — the app gets an opinion.** Goals, coaching, conversational session
recommendations. The Phase 1 ingestion work (movements in data, stable ids, a documented schema)
is most of what makes this possible.

`AGENTS.md` records "no progression nudge." Reading that as a Phase 1 scope line, not a permanent
one — Phase 3 is explicitly that feature, and you'll call it when you're ready.

---

## 3. Why push / pull / legs / core

Whole-body training is organized by **movement pattern**, not muscle. Six patterns cover a body;
miss one for 90 days and you feel it.

| Pattern | With one bell | What it trains | Why it matters |
|---|---|---|---|
| **Hinge** | swing, RDL, clean, snatch | glutes, hamstrings, erectors | The bell's signature pattern and your main conditioning driver. Best value per minute. |
| **Squat** (knee-dominant) | goblet squat, front squat, thruster | quads, glutes | Hinge alone under-trains the quads. Not interchangeable. |
| **Lunge / single-leg** | reverse lunge, walking lunge, single-leg RDL | balance, hip stability, asymmetry | First thing dropped, first thing that matters past 40. Exposes left/right gaps a two-legged squat hides. |
| **Push** | overhead press, floor press, push press | shoulders, chest, triceps | Vertical and horizontal are different jobs. One bell favors vertical. |
| **Pull** | bent row, gorilla row, high pull, upright row | lats, mid-back, rear delts, biceps | **The pattern one-bell programs starve.** No bar, no cable, so it has to be deliberate. |
| **Core / anti-movement** | dead bug, plank pull-through, halo, windmill | resisting motion, not "abs" | Splits five ways: anti-extension, anti-rotation, anti-lateral-flexion, rotation, flexion. |

A seventh, and space unlocks it: **loaded carry** — suitcase, racked, overhead. The cheapest hard
whole-body work available with one bell. The app has zero today.

**Priority for a one-bell, 20–30 minute, daily program:**

1. **Every session:** one hinge, one knee-dominant, one push, one pull, one core. That's five
   slots — which is why the slot template is right and why five is the correct number.
2. **Across the week:** vertical *and* horizontal push; bilateral *and* unilateral legs; at least
   one carry.
3. **Ratio:** push-to-pull at least 1:1, closer to 1:1.5 favoring pull for a desk worker.
   Bellwork's Complex pool is currently **7 press-involving to 2 pull-involving** — the biggest
   training-quality defect in the app.

**One honest ceiling.** With one bell and no bar, pull will never fully balance push, and there's
no vertical pulling at all — every option is a row or a raise. That's physics, not a backlog item.

---

## 4. Staying hard at 20–40 lb

A light bell means the press and the row get easy well before day 90, and you can't add plates.
Since bodyweight is out of Phase 1, the lever set is narrow — but it's enough, and none of it
needs a coaching feature. In rough order of how much difficulty each adds at the same weight:

1. **Unilateral.** Single-arm swing, single-arm press, single-leg RDL, suitcase everything.
   Halves the load-sharing and adds an anti-rotation demand for free. Biggest single lever.
2. **Grip and center of mass.** Bottoms-up is an enormous jump at identical weight; horn grip and
   overhead positions likewise.
3. **Tempo and pause.** See section 5.
4. **Range.** Deeper squat, overhead position, deficit.
5. **Density.** More rounds on the same clock — already the AMRAP's built-in progression, and
   already logged.

This is **content plus prescription, not a feature.** The pool needs the harder variants in it;
you pick them when the easy version stops costing anything.

---

## 5. Tempo and pause — what I meant

Fair question, this was jargon. Both are ways to make the *same movement at the same weight*
harder by changing how you move through the rep.

**Tempo** = how fast each phase takes.

- *Normal goblet squat:* down and up at whatever speed feels natural, maybe a second each way.
- *Tempo goblet squat:* take **4 slow seconds to lower**, then stand up normally. Same 30 lb bell,
  roughly double the time your quads are under load per rep.
- *Slow eccentric press:* press up normally, then take 4 seconds to lower the bell.

**Pause** = holding still at the hardest position.

- *Paused goblet squat:* squat down, **hold at the bottom for 3 seconds**, then stand. Removes the
  bounce, so the muscles start each rep from a dead stop instead of using stored elastic energy.
- *Dead-stop swing:* park the bell on the floor between every rep instead of swinging
  continuously, so each swing starts from zero momentum.

You already have one of these in the pool: **`slow_curl` — "Super slow curl"** is exactly a tempo
variant.

**Decided: tempo and pause are a line on the existing card, not separate pool entries.**
Something like *"Too easy at this weight? Take 4 seconds to lower."* Reasons: it's the
same movement and the same animation, so a separate entry means duplicate stick figures for no
new information, and it dilutes the draw — you'd get "goblet squat" and "tempo goblet squat"
competing for the same slot. As a cue line it costs nothing and it's exactly section 4's ladder
made visible.

---

## 6. How movements get classified

### Variants, and the "never both together" rule

Your answer on marches and carries — *keep both, offer the carry when there's space, never both
in the same circuit* — generalizes into the one new picker concept Phase 1 needs. There are three
ways to express a variant, and picking the right one per case avoids bloating the pool.

**1. In-card option** — same movement, and the choice depends on something the app can't know.

The app has no idea whether you have floor space today, so it shouldn't guess. `suitcase_march`
and `racked_march` keep their entries and gain a line: *"Room to walk? Travel instead of marching
in place."* Same figures, same slot, zero pool dilution, and it can never collide with itself.
Tempo and pause (section 5) work the same way.

**2. Separate entry + variant group** — genuinely different movement, but too close to a sibling
to appear alongside it.

Single-arm swing really is a different movement from the two-arm swing — different demand,
different figure, worth rotating between. But you never want both in the same five. So movements
get a `variantGroup` id (`swing`, `press`, `goblet_squat`), and the picker draws **at most one per
group per circuit**. That's a small change with wide reach: it's what lets the canon add
single-arm, bottoms-up, and dead-stop versions freely without any day feeling repetitive.

This also compounds with preference weighting — within a group, the picker can lean toward the
variant you don't swap away.

**3. Nothing** — the difference is too subtle to be worth an entry or a line. Jerk versus push
press is probably here.

**One field, `variantGroup`, is the whole mechanic.** I'm deliberately *not* adding a `space`
flag, because option 1 handles space better than a field could.

### Standard, Complex, and what the flags actually mean

You asked whether I can explain `hybrid` / `advancedOnly` / Standard simply, and said that if I
can't, we should rethink. Here's the plain version, then the honest diagnosis.

**What the words are meant to mean:**

- **Standard** — a day made of single movements. One thing at a time: a swing, a press, a row.
- **Complex** — a day made of chained movements. Two or three things strung into one rep: swing
  then squat, clean then press.
- **`hybrid`** and **`advancedOnly`** — the two internal flags that sort movements into those two
  pools.

**What the code actually does.** Standard draws every movement *not* marked `advancedOnly`.
Complex draws every movement marked `hybrid`. Checked against the file: all 14 `advancedOnly`
movements are also `hybrid`, and nothing is `advancedOnly` without being `hybrid`. Three movements
— **Clean & press, Thruster, Sit-up to press** — are `hybrid` but not `advancedOnly`, so they show
up on *both* Standard and Complex days.

**The diagnosis: the model is fine, the names lie.** There are really just two membership
questions per movement — *can this appear on a Standard day?* and *can this appear on a Complex
day?* — and a movement can answer yes to one or both. That's coherent, and those three
double-membership movements aren't sloppiness: a thruster, a clean & press, and a sit-up to press
are chains that a lifter counts as **one lift**, so they legitimately belong in both pools.

What makes it unexplainable is the vocabulary:

- `hybrid` sounds like a *description of the movement* ("it's a chain") but functions as *pool
  membership* ("it's Complex-eligible").
- `advancedOnly` sounds like a *difficulty gate* but functions as *pool exclusion*. Nothing in the
  app gates on skill — the snatch is Standard-eligible.
- The mode is called `advanced` in code and **Complex** in the UI, so one idea has three names.
- And **Bottoms-up press** is flagged `hybrid` while not being a chain at all — it's a single press
  with the bell upside down. It's Complex-eligible because it's *hard*, which is a perfectly good
  call that the flag name can't express.

**Decided: rename, not redesign.** Replace both flags with one explicit field:

```
pools: ["standard"]              // single movements
pools: ["complex"]               // chains
pools: ["standard", "complex"]   // chains you'd count as one lift
```

Zero behavior change, no movement moves, nothing to re-author — every current entry maps
one-to-one. Rename the internal mode from `advanced` to `complex` at the same time so the code and
the UI finally use the same word.

**And then the `INGEST.md` rule is one line:** *a single movement gets `["standard"]`; a sequence
of two or three lifts gets `["complex"]`; a chain you'd count as one lift, or a single movement
that's hard enough to earn a Complex day, gets both.*

That's what makes this worth doing — not tidiness, but that an agent can't classify new movements
consistently against a rule nobody can state.

---

## 7. Where the bell canon is short

Counted from `bellwork.jsx` at commit `a2ed777`. **46 movements total** — 32 in the Standard pool,
17 in Complex (3 hybrids are also standard-eligible). To answer your question directly: yes, canon
means total movements in the pool, and the additions below would take it to roughly 66.

| Pattern | Standard | Complex |
|---|---|---|
| Hinge | 7 | 3 |
| Push | 7 | 2 |
| Pull | **4** | **1** |
| Squat | **2** | 3 |
| Lunge | **2** | 3 |
| Rotation | 4 | 4 |
| Anti-extension | 2 | **0** |
| Anti-lean | 2 | **0** |
| Anti-rotation | 1 | **0** |
| Flexion | 1 | 1 |
| Carry | **0** | **0** |

Five gaps, in priority order:

1. **Complex pull: one movement.** `renegade` is the only pull-pattern hybrid; `rdl_row` has a row
   in it but is filed as Hinge. Your primary mode has almost no pull.
2. **Complex mode has zero anti-movement core and zero carry.** Its core work is 4 Rotation plus 1
   Flexion, so Complex can *never* hand you an anti-rotation, an anti-extension, or a loaded
   march. A whole category is unreachable in the mode you actually use.
3. **No carry pattern exists**, despite space making it nearly free.
4. **Knee-dominant is thin:** 2 squats and 2 lunges against 7 hinges.
5. **Almost no unilateral or bottoms-up variants**, which per section 4 is where difficulty has to
   come from.

**Lower body is the thinnest pool in the app:** 8 eligible movements in either mode across only 3
patterns — so a Lower day can't even fill five unique patterns and falls through to the picker's
repeat-anything loop, giving you 5 of the same 8 every time.

### The canon list, with authoring cost

Nearly everything here is a standing or hinging shape, which is exactly what the existing pose
vocabulary covers (`S_HINGE`, `S_RACK`, `S_OH`, `S_GOBLET`, `S_SQUAT`, `S_RACKSQ`, `S_LUNGE_R`,
`S_SWTOP`, plus the `F_*` set). **Tier A** composes from those; **Tier B** needs new coordinates.

- **Carry** *(new pattern, Tier A, best value per unit of work)* — suitcase, racked, overhead.
  `suitcase_march` and `racked_march` already animate alternating legs via `kn2`/`an2` extras, so
  a travelling carry is that pose data with a new cue. Per section 6 these ride on the existing
  march cards.
- **Pull depth** *(Tier A)* — single-arm dead-stop row, upright row, bent-over reverse fly.
- **Knee-dominant** *(Tier A)* — front / single-arm racked squat, overhead squat, split squat,
  walking lunge, overhead lunge. *Cossack squat is Tier B* (novel deep lateral shape).
- **Unilateral and bottoms-up variants** *(Tier A, all in variant groups)* — single-arm swing,
  dead-stop swing, travelling swing, suitcase deadlift, bottoms-up clean.
- **Half get-up** *(Tier B, confirmed in)* — floor to elbow to hand, press the bell up, back down.
  Needs new supine and propped-up shapes the vocabulary doesn't have, so it's real authoring work,
  but far less than the full get-up and it fits an AMRAP round. The full get-up stays out: one rep
  runs 30–60 seconds, which breaks a five-movement circuit.
- **Complex hybrids** *(Tier A)* — pull-dominant (swing + high pull, clean + bent row, gorilla row
  + sumo deadlift), carry-terminated (clean + racked carry, snatch + overhead carry), and
  anti-movement chains, since Complex has none.

**The risk of a big pool, since "more the better."** Past a point, every movement is unfamiliar,
and you end up reading cue text instead of training. Three things already on the roadmap defuse
that: the slot template keeps coverage regardless of size, variant groups stop near-duplicates
colliding, and preference weighting lets the pool grow while your *days* stay curated. So growth
is safe — but it's safe *because* of Batch 3, which is an argument for not letting the pool run
far ahead of it.

---

## 8. The ingestion loop

You want to drop a link, forward an Instagram post, or just describe a movement, and have it land
in the app. That puts ingestion back in Phase 1 — I'd removed it in v0.4 on the assumption the
pool was converging on a fixed canon. It isn't; the content online is plentiful and you want to
keep pulling from it. Re-added.

**This is an agent workflow, not an app feature.** All three input styles you described are
conversation, and you post from wherever you are to a dedicated ingestion agent. So almost none of
it is Bellwork code, which is why it can be genuinely tight.

### The loop

1. **You post** — a link, a name, or a sentence, from your phone to the ingestion agent. No app
   UI, no GitHub, no file to open. This is the only step that needs you.
2. **`INGEST.md` — the instruction file.** The heart of the whole thing, and the only real
   deliverable. It tells any agent session, without further context: the movement schema field by
   field; how to classify `pattern` and `tags`; when something is `hybrid` versus `advancedOnly`;
   the `reps` and `dur` conventions; the pose vocabulary and how to compose from it; the
   `variantGroup` rule; and what to do after — build, verify, stage, never push without a
   go-ahead. This is what makes two different agent sessions produce consistent entries instead
   of each improvising.
3. **The agent keeps its own queue.** If you forward five things and it processes two, it writes
   the rest into `INBOX.md` itself. You never touch that file — it's the agent's scratchpad, not
   your inbox. That satisfies "maybe an inbox" without adding a step for you.
4. **Movements in a data module** — `EXERCISES` moves out of `bellwork.jsx`, so adding one is a
   small readable diff instead of an edit buried in an 80KB file.
5. **It stages for review** — see below.
6. **You confirm**, and it joins the rotation.

### What this looks like on a Tuesday

Concretely, end to end, so the process is reviewable rather than abstract.

1. **You're scrolling and you see a reel** — someone cleans the bell and walks with it racked. You
   send the ingestion agent the link plus one line: *"clean into racked carry, 20 steps."* The
   sentence matters because the agent can't watch the video. **This is the only step that involves
   you until step 6.**
2. **The agent reads `INGEST.md`** and drafts an entry: id `clean_carry`, name "Clean + racked
   carry", `pattern: "Carry"`, tags for the muscles it hits, `reps: "20 steps"`,
   `pools: ["complex"]`, `variantGroup: "racked_carry"` so it never lands alongside the racked
   march, plus the cue and grip text — and poses composed from the existing `S_HINGE` → `S_RACK`
   primitives and the march's alternating-leg motion.
3. **It builds and checks its own work** — `npm run build`, confirm the figure animates and the bell
   tracks the hands.
4. **It shows you the diff and waits for a go-ahead**, per your answer on pushes. Nothing is
   automatic.
5. **You say go, it pushes.** The movement is live on the site but carries `pending: true`.
6. **Next time you open Bellwork**, the Library has a Pending section with one entry in it. You
   watch the stick figure loop. Either it looks right — you say "approve the racked carry," the flag
   flips, and it joins the rotation. Or it's wrong — *"the bell should sit at the chest, not the
   shoulder"* — and it gets re-authored.
7. **Until you approve it, it never appears in a workout.** That's the whole point of the pending
   state: the cost of a bad entry is a wrong drawing in a corner of the Library, not a ruined
   session.

The reason step 6 exists at all is in the next section.

### Staging, and why review has to happen on your phone

You asked for staging plus review and confirmation, and there's a wrinkle worth naming: the two
things that actually need your eyes are **does the stick figure look right** and **is the
classification right**. A text diff can show you the second but not the first — you can't review
an animation in a code review.

So: **new movements ship with `pending: true`.** They appear in a Pending section of the Library,
where you can watch the figure loop on your phone in the gym, but they are **excluded from the
workout draw** until you confirm. A bad entry can't ruin a session; the worst case is a wrong
stick figure sitting in a corner of the Library until you look at it.

**Decided: both ways work.** You can approve by telling the agent, and there's an "Add to
rotation" button on each pending card so you can approve in the gym, right after watching the
figure, without an agent chat.

One implementation note for whoever builds it: the button can't edit the repo from your phone, so
an in-app approval is stored on the device and the movement joins your rotation immediately. The
agent folds those approvals back into the data file on its next pass, so the repo catches up. Until
it does, the approval lives only on that phone — worth knowing if you clear Safari data.

This composes with text-only entries. I dropped those in v0.4 and I'd bring them back narrower: a
movement can enter **without figures**, render as a clean text card, and get illustrated in a later
pass. The difference from v0.3 is that un-illustrated is a temporary state to be drained, not a
permanent tier — and pending plus un-illustrated is a perfectly good place for a movement to sit
for a few days.

### One honest limitation

An agent can't watch an Instagram video. Forwarding a post works when the caption or on-screen
text names the movements, which kettlebell content usually does. Otherwise the practical input is
your one-line description — *"clean into a racked carry, 20 steps"*. Naming the movement is the
part only you can do; everything after that is mechanical.

**Still parked: the pose editor.** Volume is back, but bell movements are mostly Tier A, and the
editor's value is concentrated in Tier B. If the queue starts filling with Tier B shapes, revisit
— the cost breakdown holds (one new file, one template, a few lines in `build.mjs`, reuses the
existing `Figure` renderer, separate entry point so it can't break the app).

**Still parked: an Add Movement screen in the app.** Capture on the phone is a paste into
`INBOX.md`. Build the screen only if that turns out to be the friction point.

---

## 9. Taste: the picker should know what you like

Variety as preference rather than mandate. This matters more as the pool grows — add twenty
movements without a taste signal and the average day gets *worse*.

**The signal already exists and we're discarding it.** Every Swap tap is you saying "not this
one." `swapExercise` picks a replacement into state that isn't even persisted. Persist a
per-movement swap count and draw swapped-often movements less often — **no new UI at all.**

Two honest problems:

- **The signal is noisy.** A swap can mean "don't like it," but also "shoulder's tweaked" or
  "someone's in that spot." So it's a soft weight, never a ban. If that feels too vague, add an
  explicit long-press mute *then*.
- **Taste fights coverage.** If you demote every pull, the slot template still has to fill the
  pull slot. Hard rule: **preference reorders within a slot, it never removes the slot.**

Not building: thumbs up/down on every card, a ratings screen, a recommendation model.

---

## 10. Phase 1 roadmap

Four batches, in dependency order.

### Batch 1 — Make the clock trustworthy

*The app is never the reason a session was short, wrong, or lost.*

1. **Local dates instead of UTC.** Three lines, zero risk, first because it corrupts data while it
   sits. In Austin the circuit flips to tomorrow's at 6–7pm and evening sessions log under the
   wrong day.
2. **Timestamp-anchored countdown.** Derive remaining from a stored start time. The current
   1-second `setInterval` stalls when iOS locks or you switch apps.
3. **Audio at 1:00 and 0:00.** There's no audio of any kind in the app today. Unlock a WebAudio
   context inside the START tap. WebAudio is the likeliest path to sounding with the silent switch
   on, but that has to be checked on your iPhone rather than assumed.
4. **Wake Lock — confirmed in.** Screen stays lit while the clock runs, so it's readable at a
   glance. Layered on #2, degrades silently where iOS doesn't support it.
5. **Persistence, as two mechanisms:** *sticky preferences* (mode and duration survive app close)
   and *resumable run* (salt, swaps, seconds, rounds survive a reload, with a staleness rule).
   Today only the session log persists, so every open resets to Standard + Full body + 20 min, and
   your primary mode costs 2–3 taps of re-setup every session.
6. **Weight, NEW PR, and the bar fix:** bell weight chip (**lb: 25 / 30 / 35 / 40 / 45**,
   last-used preselected — one line to change if the range is wrong), a clear NEW PR state on
   finish, and the 375px overflow fix. The weight has to be chosen *before or during* the run,
   because the app saves the session automatically the moment the clock hits zero — a chip on the
   finish screen would come too late to be recorded.

### Batch 2 — Open the ingestion loop, then fill the canon

*Adding a movement gets easy, then the pool gets deep.*

1. `EXERCISES` moves to a data module.
2. **`hybrid` + `advancedOnly` → `pools`**, and rename the internal `advanced` mode to `complex`.
   Pure rename, zero behavior change — but it's the prerequisite for #3, because an agent can't
   classify movements against a rule nobody can state.
3. **`INGEST.md`** — the instruction file. The main deliverable of this batch.
4. `pending: true` staging: a Pending section in the Library, excluded from the workout draw, with
   an "Add to rotation" button on each pending card. In-app approvals are stored on the device and
   synced into the data file by the agent on its next pass.
5. `variantGroup` support in the picker (at most one per group per circuit).
6. Text-only cards (optional `poses`).
7. **Then the canon:** carries, pull depth, knee-dominant depth, unilateral and bottoms-up
   variants, half get-up, and the missing Complex hybrids — authored *through* the new loop, which
   is also how we find out whether the loop is any good.

*Loop before content on purpose — the loop is what makes the content cheap, and you'll be using it
long after Batch 2 is done.*

### Batch 3 — Coverage and taste

*A whole-body day is whole-body, it doesn't repeat itself, and it drifts toward what you like.*

1. **Recency-aware picking** — exclude last session's movements from today's draw. The picker is
   currently a pure function of (date, focus, mode, salt) with no memory, so two consecutive days
   can legally repeat four of five movements. The log already stores the names. *New, not in
   `BACKLOG.md`, cheapest real freshness win available.*
2. **Slot template** — hinge, squat-or-lunge, push, pull, core, with a documented fallback.
   Today's picker takes the first five unique patterns from ten labels, five of which are
   core-only, so "full body" can legitimately return five core movements.
3. **Swap-as-preference** — persist swap counts, soft-weight the draw.
4. **Compact in-workout mode** — cards collapse to name and reps once the clock starts.

*After Batch 2 on purpose:* the slot template needs a pool that can fill a pull slot, or it hands
you `renegade` every Complex day.

### Batch 4 — See the 90 days

1. **13-week dot grid.** Just the grid. Weight and rounds are already in the log; charts can wait.

Last because the grid's value scales with clean data, and the data isn't clean until Batch 1.

### Cut and parked

- **Focus rotation default** (`BACKLOG.md` Batch 2) — **cut.** If the slot template works, every
  full-body day already covers everything.
- **Service worker** (`BACKLOG.md` Batch 3) — **parked past Phase 1.** On GitHub Pages it's the
  classic way to ship a fix and have your phone keep running last week's build.
- **Full Turkish get-up** — half get-up only; one rep of the full version runs 30–60 seconds.
- **Pose editor**, **Add Movement screen**, **tempo variants as separate entries**,
  **rounds-over-time charts**, **all of Phase 2 and 3.**

---

## 11. What not to do

- **No progression logic in Phase 1.** Harder variants in the pool are the mechanism.
- **Don't depend on equipment beyond one bell and floor space.** No bench, no step, no bar.
- **No bodyweight movements in Phase 1.** You're handling that yourself.
- **No accounts or cloud sync.** Export/import JSON already covers backup.
- **No second workout structure.** Complex is a movement pool, not a program. Decided.
- **No 2-bell toggle.** Badge stays. Decided.
- **No framework, router, or state library.** Single-file build is why deploy is one push.
- **No streaks, badges, or notifications.** The dot grid is evidence, not a motivation system.
- **Don't let the pool outrun Batch 3.** Growth is safe *because* of the slot template, variant
  groups, and preference weighting.

---

## 12. Open questions

None. Batch 1 is approved and ready to build (`internal/batch-1-build-brief.md`).

### Decided

- Tempo and pause are cue lines, not entries.
- Half get-up in, full get-up out.
- Marches and carries both stay; carry is offered on the march card, never both in one circuit.
- Wake Lock in.
- Weight chips: lb 25 / 30 / 35 / 40 / 45.
- Ingestion is an agent workflow driven by `INGEST.md`, staged with `pending: true`.
- Ingestion pushes follow the existing rule: show the diff, wait for a go-ahead. No standing
  approval.
- `hybrid` + `advancedOnly` become one `pools` field; the internal `advanced` mode is renamed
  `complex`. Pure rename, no movement changes pool.
- Pending movements can be approved by telling the agent *or* with an "Add to rotation" button in
  the app.
- Batch 1: bell weight is picked before START, last-used preselected.
- Batch 1: sessions logged before weight tracking don't count toward per-weight PRs.
- Batch 1: workouts ended early still count toward PRs, as they do today.

---

## Changelog

- **v1.2** — Joe confirmed the three Batch 1 defaults; moved them to Decided. Batch 1 ready to build.
- **v1.1** — Batch 1 approved. Aligned Batch 1 with the build brief: weight is chosen before or
  during the run (not on the finish screen), and the silent-switch claim is now "verify on device."
  Listed the three builder defaults awaiting Joe.
- **v1.0** — In-app "Add to rotation" button approved alongside agent approval. Noted that in-app
  approvals live on the device until the agent syncs them into the data file. All open questions
  closed.
- **v0.8** — `pools` rename approved. Agent approval set as the baseline for pending movements;
  the on-device button reduced to a yes/no. Re-checked the repo: still at `a2ed777`, so all code
  references hold.
- **v0.7** — Added a plain-English explanation of Standard / Complex / `hybrid` / `advancedOnly`,
  with the finding that the model is coherent but the names describe the wrong thing; proposed
  collapsing both flags into one `pools` field as a pure rename. Added a step-by-step Tuesday
  walkthrough of the ingestion loop so the pending/review process is concrete. Push approval stays
  as-is.
- **v0.6** — Joe's decisions locked in: tempo/pause as cue lines, Wake Lock in, weight chips
  25–45 lb. Ingestion reworked around a dedicated agent — `INGEST.md` as the instruction file, the
  agent maintaining its own `INBOX.md` queue, and `pending: true` staging with a Library section
  excluded from the draw, so review of the stick figure happens on the phone rather than in a diff.
- **v0.5** — Explained tempo and pause with examples and recommended them as cue lines rather than
  entries. Added the variants section: three ways to express a variant, plus `variantGroup` as the
  one new picker field, from Joe's "never both together" rule. Half get-up confirmed in, full
  get-up out. Ingestion re-added to Phase 1 as an agent workflow (`INBOX.md`, data module, schema
  doc, promotion checklist) rather than app UI, with text-only entries as a staging state.
  Reordered Batch 2 to open the loop before filling the canon.
- **v0.4** — Narrowed Phase 1 to bell-only. Parked the pose editor, dropped optional poses and
  ingestion machinery. Added the canon list with authoring tiers and the 20–40 lb progression
  ladder.
- **v0.3** — One bell + bodyweight, no bar, abundant space. Pose editor cost breakdown,
  swap-as-preference. Cut focus rotation, parked the service worker.
- **v0.2** — Restructured around Phase 1/2/3. Taxonomy primer, counted gap analysis, rotation
  math, Tier A/B/C split, recency-aware picking.
- **v0.1** — First draft from `AGENTS.md`, `BACKLOG.md`, and a read of `bellwork.jsx`.
