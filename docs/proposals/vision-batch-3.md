# Bellwork Batch 3 — plan for approval

Status: **decisions locked (v1.0, 2026-11-25).** Nothing in the repo has been edited. Awaiting explicit go-ahead from Joe before starting PR A.

Audited `origin/main` at `8fb0c04` (merge of [PR #20](https://github.com/jojo-512/bellwork/pull/20), 2026-11-23). The local checkout was behind that commit. Every count below is from the fetched tree.

Source of truth for product intent: [docs/vision-roadmap.md](https://github.com/jojo-512/bellwork/blob/main/docs/vision-roadmap.md) §3, §6, §9, and §10 (Batch 3). Precedent for shape: [docs/batch-2-plan.md](https://github.com/jojo-512/bellwork/blob/main/docs/batch-2-plan.md).

Standing decisions this plan does not reopen: no 2-bell toggle, Complex is a pool and not a second workout structure, no progression nudge, five slots stays the number, tempo and pause stay cue lines, half get-up stays out, clean + bent row stays out, default mode stays `standard`.

---

## 1. What Batch 3 is for

**A whole-body day is whole-body, it doesn't repeat yesterday, and it drifts toward what you swap away.**

The pool is 58 movements, nothing is `pending`, and Complex can fill a pull. The picker is still the Batch 2 picker: shuffle, take the first five unique *pattern labels*, then relax. On the live catalog that fails the product promise in Complex, which is the primary mode.

Measured on the current `buildCircuit` (empty salt, 4,000 local dates, the live `sort(() => rand() - 0.5)` shuffle, run in V8):

| Full body, empty salt | Misses at least one slot | Hinge | Knee | Push | Pull | Core |
|---|---:|---:|---:|---:|---:|---:|
| Standard | **71%** | 18% | 19% | 21% | 19% | 6% |
| Complex | **88%** | 35% | 9% | **40%** | **39%** | 2% |

A uniform shuffle of the same three-pass rule is a bit harsher on Complex push (about half of days). Safari's sort can nudge the exact rate. The shape will not move: most Complex full-body days are missing a push, a pull, or a hinge.

The roadmap's picture of the bug is "full body can legally return five core movements." That hole is real and, on this catalog, unused: **0 of 4,000** full-body days in either mode were five core-pattern movements. Core patterns are the small ones, so they lose the first-five-patterns race. The failure you actually get is a missing push or pull.

---

## 2. Inventory

### In scope — the four Batch 3 items, unchanged from the roadmap

1. **Recency-aware picking.** Exclude the last session's movements from today's draw. The picker is a pure function of `(date, focus, mode, salt)` today, so two days in a row can share four of five movements. The log already stores the names.
2. **Slot template.** Hinge, squat-or-lunge, push, pull, core, with a documented fallback. Five slots, not six.
3. **Swap-as-preference.** Persist swap counts. Soft-weight the draw. Preference reorders inside a slot. It never removes the slot.
4. **Compact in-workout mode.** Cards collapse to name and reps once the clock starts.

Item 1 is the one that was never in `BACKLOG.md`. The slot-template line still sitting unchecked under Backlog Batch 1 is this same item. Backlog's own "Batch 3" is the service worker, which the roadmap parked past Phase 1. Vision-roadmap batch numbers win.

### Out of scope

- The 13-week dot grid (Vision Batch 4).
- Service worker, focus-rotation default (cut), long-press mute, thumbs, a ratings screen, a recommendation model.
- Any new movement, including half get-up. This batch does not deepen Complex push. The thin slot is called out below and left alone.
- A weekly carry quota, and any extra weight that would push the pull:push ratio toward 1:1.5. The daily template already gives 1:1 on days that can fill every slot. The weekly ratio stays a consequence of the pool.
- Progression, a second workout structure, a 2-bell toggle.
- Re-tagging movements, except the one `variantGroup` edit in decision D3.
- Sticky focus, sorting the focus chips inside the seed string, persisting a pre-start Reshuffle across reload, the midnight "app left open" bug.
- Decaying swap counts by date. A cap is in D8. A half-life is not.

### One batch, two PRs

The four items split cleanly into a picker change and a layout change.

| PR | What ships | Why it is its own diff |
|---|---|---|
| **PR A — picker** | Slot template, fallback, carry/march group, recency, swap-in-slot, swap weights, card order | One function (`buildCircuit` / `swapExercise`). Shipping the pieces on separate deploys would reshuffle today more than once. |
| **PR B — compact cards** | Collapse while the clock is in progress | JSX and CSS only. The five exercises do not change. |

**Recommended: two PRs, A then B, both Batch 3.** You review A on the phone as "did today's five feel like a whole-body day" without the cards also changing shape. B is small enough to ride in A if you would rather have one review, the way Batch 2 was one branch. Say so and it folds in.

PR A is three commits on one branch, merged together: (1) slots, fallback, order, carry/march group, (2) recency and `exerciseIds`, (3) swap-in-slot and weights. `npm run check` and the simulator pass on each commit.

---

## 3. Pool coverage

### How a pattern maps to a slot

The slot comes from `pattern`. Tags decide whether the focus filter lets that movement in. A movement is never in two slots.

| Slot | Patterns |
|---|---|
| hinge | Hinge |
| squat-or-lunge | Squat, Lunge |
| push | Push |
| pull | Pull |
| core | Rotation, Anti-extension, Anti-rotation, Anti-lean, Flexion, **Carry** |

Every pattern on the 58 is in that table. Nothing is left over once Carry is in core.

**Carry lands in core.** Both carries are tagged `full, core`, and the roadmap's daily five has no sixth slot. The alternative — leaving Carry outside the template — deletes them from every full-body Complex day, because that day can already fill hinge, knee, push, pull, and core without them. They would survive only on focus chips that cannot fill all five. That throws away `clean_carry` and `snatch_oh_carry`.

Cost of putting them in core, said plainly: today a Carry is its own pattern label, so it wins a seat in the first-five-patterns race on about **46%** of Complex full-body days (same 4,000-date run). Inside an 8-deep core slot, two carries are about **1 day in 4** if weights are even. Across a week of Complex full-body that is still about two carries. A rule that *guarantees* one carry per week is out of scope (D2).

### Catalog

58 movements. 39 Standard, 22 Complex, 3 in both (`clean_press`, `thruster`, `situp_press`). Nothing is `pending`. Names are unique, 58 of 58, which is what makes old logs usable for recency. Seven `variantGroup`s today: `swing`, `goblet_squat`, `press`, `row`, `march`, `racked_carry`, `oh_carry`. The last three matter in D3. `swing` has one member and changes nothing until a sibling exists. Leave it.

Pattern membership, counting a dual-pool movement in both columns. This matches the roadmap's 2026-11-23 table.

| Pattern | Standard | Complex | Slot |
|---|---:|---:|---|
| Hinge | 7 | 3 | hinge |
| Squat | 3 | 3 | knee |
| Lunge | 4 | 3 | knee |
| Push | 7 | 2 | push |
| Pull | 8 | 3 | pull |
| Rotation | 4 | 4 | core |
| Anti-extension | 2 | 0 | core |
| Anti-rotation | 1 | 0 | core |
| Anti-lean | 2 | 1 | core |
| Flexion | 1 | 1 | core |
| Carry | 0 | 2 | core |
| **Slot totals** | **7 / 7 / 7 / 8 / 10** | **3 / 6 / 2 / 3 / 8** | hinge / knee / push / pull / core |

### Full-body rosters

These are the days the template is for. Tags are included where the movement would surprise you on a narrower chip.

**Standard full body — 39 — every slot is healthy (smallest is 7).**

- Hinge (7): `swing`, `rdl`, `single_leg_rdl`, `sumo_deadlift`, `clean` (upper, full), `snatch` (full only), `windmill` (core only).
- Knee (7): `goblet_squat`, `front_squat`, `thruster`, `rev_lunge`, `lateral_lunge`, `split_squat`, `overhead_lunge`.
- Push (7): `ohp`, `push_press`, `floor_press`, `tall_kneel_press`, `pushup_on_bell`, `tricep_ext`, `clean_press`.
- Pull (8): `row`, `gorilla_row`, `high_pull`, `dead_stop_row`, `ballistic_row`, `upright_row`, `reverse_fly`, `slow_curl`.
- Core (10): `halo`, `russian_twist`, `around_world`, `throw_over`, `dead_bug`, `standing_pullover`, `pull_through`, `suitcase_march`, `racked_march`, `situp_press`.

**Complex full body — 22 — push is the thin slot.**

- Hinge (3): `swing_squat`, `snatch_lunge` (full only), `rdl_row` (lower, upper).
- Knee (6): `thruster`, `clean_squat_press` (upper, full — no lower tag), `squat_pressout`, `lunge_twist`, `clean_lunge`, `lat_lunge_press`.
- Push (2): `clean_press`, `bottoms_up_press`.
- Pull (3): `renegade`, `swing_high_pull`, `gorilla_sumo`.
- Core (8): `halo_press`, `figure8_hold`, `atw_squat`, `curl_halo`, `situp_press`, `halo_march`, `clean_carry`, `snatch_oh_carry`.

`windmill` is a side bend filed as Hinge. Once every Standard full-body day has a hinge, it is the hinge on **1 day in 7** at even weights (about 14%). Today it is the hinge on about 9% of those days, because some days have no hinge at all. D4 leaves the filing alone.

`snatch_lunge` is filed as Hinge, so the lunge inside it does not eat the knee slot. A day that draws it still gets a separate squat or lunge. That is the right reading of the pattern field.

### Every focus chip

The filter is the one already in `buildCircuit`. Full body keeps every movement in the mode. Any other chip keeps a movement when **any** of its tags is in the chip list. The `full` tag on a movement does not match an Upper, Lower, or Core chip. `snatch` (`full` only) is a full-body movement. Pair order does not matter for this table. `upper+lower` and `lower+upper` are the same pool and different seeds (section 4).

A slot of **0, 1, or 2** is thin. Those cells are marked.

| Focus | Mode | Pool | Hinge | Knee | Push | Pull | Core | All five fillable? |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Full body | Standard | 39 | 7 | 7 | 7 | 8 | 10 | yes |
| Full body | Complex | 22 | 3 | 6 | **2** | 3 | 8 | yes |
| Upper | Standard | 19 | **1** | **0** | 7 | 8 | 3 | no |
| Upper | Complex | 10 | **1** | **2** | **2** | 3 | **2** | yes |
| Lower | Standard | 11 | 4 | 7 | **0** | **0** | **0** | no |
| Lower | Complex | 9 | **2** | 5 | **0** | **1** | **1** | no |
| Core | Standard | 12 | **1** | **0** | **1** | **0** | 10 | no |
| Core | Complex | 11 | **0** | **2** | **0** | **1** | 8 | no |
| Upper+Lower | Standard | 30 | 5 | 7 | 7 | 8 | 3 | yes |
| Upper+Lower | Complex | 16 | **2** | 6 | **2** | 3 | 3 | yes |
| Upper+Core | Standard | 27 | **2** | **0** | 7 | 8 | 10 | no |
| Upper+Core | Complex | 18 | **1** | 4 | **2** | 3 | 8 | yes |
| Lower+Core | Standard | 23 | 5 | 7 | **1** | **0** | 10 | no |
| Lower+Core | Complex | 17 | **2** | 5 | **0** | **2** | 8 | no |

Smallest filtered pool is Complex Lower at 9, so every chip can still return five cards. The template never has to return a short circuit on this catalog.

**Thin cells, by name.**

- Standard Upper hinge: `clean` only. Knee: empty.
- Standard Upper+Core hinge: `clean`, `windmill`. Knee: empty.
- Standard Lower: no push, no pull, no core-pattern movement. The day is hinges and knees. That is what the Lower chip means.
- Standard Core hinge: `windmill` only. Push: `tall_kneel_press` only. Knee and pull: empty.
- Standard Lower+Core push: `tall_kneel_press` only. Pull: empty.
- Complex push, wherever it exists: `clean_press` and `bottoms_up_press` only. Full, Upper, Upper+Lower, Upper+Core. Lower, Core, and Lower+Core have no Complex push at all.
- Complex Upper hinge: `rdl_row` only. Knee: `clean_squat_press`, `lat_lunge_press`. Core: `halo_press`, `curl_halo`.
- Complex Upper+Core hinge: `rdl_row` only.
- Complex Upper+Lower hinge: `swing_squat`, `rdl_row`.
- Complex Lower hinge: `swing_squat`, `rdl_row`. Pull: `gorilla_sumo` only. Core: `atw_squat` only.
- Complex Lower+Core hinge: `swing_squat`, `rdl_row`. Pull: `renegade`, `gorilla_sumo`.
- Complex Core knee: `lunge_twist`, `squat_pressout`. Pull: `renegade` only. Hinge and push: empty.

Two consequences of "yes, all five fillable" on a 1-deep slot, so they are not a surprise after deploy:

- Every **Complex Upper** day and every **Complex Upper+Core** day has `rdl_row` as its hinge. It is the only candidate. Recency cannot rotate it away. The next draw relaxes recency and takes it again.
- **Upper+Lower never shows a carry.** Both carries are tagged `full, core`. The marches are tagged `core` only. Upper+Lower's core slot is `halo`, `standing_pullover`, `throw_over` in Standard (3) and `halo_press`, `atw_squat`, `curl_halo` in Complex (3).

No variant group crosses two slots today. Groups only limit which *sibling* can share the circuit. They do not empty a slot.

| Group | Members | Slot | What the group changes |
|---|---|---|---|
| `press` | `ohp`, `push_press` | push | Standard push still has five other presses. |
| `row` | `row`, `gorilla_row`, `dead_stop_row`, `ballistic_row` | pull | 4 of 8 Standard pulls. The slot still fills. Swap may replace one row with another row, because the card that is leaving releases its group. Swap may not introduce a row while a different card still holds one. |
| `goblet_squat` | `goblet_squat`, `front_squat` | knee | Same slot, both Lower. |
| `march` | `suitcase_march`, `racked_march` | core | Already cannot share a day. |
| `racked_carry` | `clean_carry` | core | Singleton. Does **not** exclude `racked_march`. |
| `oh_carry` | `snatch_oh_carry` | core | Singleton. Does **not** exclude anyone. |
| `swing` | `swing` | hinge | Singleton. Leave it. |

`halo_march` has no group.

### March / carry

The roadmap rule is unchanged: marches and carries both stay, and a circuit never contains both. The code does not enforce it. The five movements are:

| id | Pattern | Group today | Pools | Tags |
|---|---|---|---|---|
| `suitcase_march` | Anti-lean | `march` | standard | core |
| `racked_march` | Anti-lean | `march` | standard | core |
| `halo_march` | Anti-lean | none | complex | core |
| `clean_carry` | Carry | `racked_carry` | complex | full, core |
| `snatch_oh_carry` | Carry | `oh_carry` | complex | full, core |

On the current picker, same 4,000-date V8 run, a Complex circuit contains both a march and a carry on **9%** of full-body days, **44%** of Core days, **15%** of Upper+Core days, and **18%** of Lower+Core days. Two carries in one circuit showed up **0** times. Pass 1 already keeps a single Carry pattern. The hole is march plus carry, because those are different pattern labels.

On a day where the template runs, the core slot picks one movement, so march-plus-carry is already impossible. The shared group still earns its keep on the chips where the template does not run, and on Swap, which can pull a carry into a different card while a march sits on the core card.

### Fallback when a slot has 0 candidates

**Recommended rule (D5).** Look at the filtered pool *before* recency.

- If every slot has at least one candidate, fill one per slot. That is the whole-body guarantee. It fires for Standard Full and Upper+Lower, and for Complex Full, Upper, Upper+Lower, and Upper+Core.
- If any slot has zero, do not borrow from outside the chip. A Lower day does not grow a press. Draw five with today's three-pass walk (unique pattern, then unique group, then anything left), still inside the filter, still with the carry/march exclusion, recency, and weights.

Recency is applied after that test. A 1-deep slot still counts as fillable. If yesterday used that one movement, the draw relaxes recency for that slot and takes it. Coverage beats freshness. Preference never drives a weight to zero, so it cannot empty a slot either.

Worked examples:

- **Complex full body.** Template on. One hinge, one knee, one of the two presses, one of the three pulls, one core. A carry appears only by winning the core slot.
- **Standard Lower.** Template off (push, pull, and core are empty). Five cards from 4 hinges and 7 knees. Groups still apply, so `goblet_squat` and `front_squat` will not both appear.
- **Standard Core.** Template off. The day stays a core day. It does **not** become "windmill + tall-kneeling press + three core movements" every time. That lock would be the result of forcing slots onto a chip that cannot fill them, and it is the reason D5 is written this way.
- **Complex Upper.** Template on, hinge fixed as `rdl_row`. The other four slots rotate inside pools of 2, 2, 3, and 2.

When the three-pass path excludes yesterday and fewer than five movements remain, yesterday's movements are added back at the end of the list until the circuit can reach five. Same idea as relaxing a slot: a short pool is worse than a repeat.

---

## 4. How this meets the app that is already there

### The seed stays byte-for-byte

```
today + focus.join("+") + seedMode + salt
```

`today` is `localDate()` (`YYYY-MM-DD`, local, not UTC). `seedMode` is `"advanced"` when the mode is Complex and `"standard"` otherwise. That pre-rename spelling is on purpose, from Batch 2, so Complex days did not reshuffle when the mode string changed. This batch does not "correct" it.

`focus.join("+")` follows chip tap order. Upper then Lower seeds `upper+lower`. Lower then Upper seeds `lower+upper`. Those are different circuits today. Leave that alone. The PR key already sorts focus (`upper+lower` either way). The seed does not, and will not.

Salt `""` is today's circuit. Reshuffle sets salt to `String(Math.random())`, clears swaps, and clears frozen ids. It stays disabled once the clock has started. Recency and swap weights still apply after a reshuffle. Reshuffle does not reset swap counts.

The shuffle itself changes. The live `sort(() => rand() - 0.5)` is a biased shuffle, and the exact permutation depends on the engine's sort. The new draw uses `mulberry32(seedFrom(seed))` only, via weighted picks. Same seed, same history, same counts, same circuit on the phone and in Node. That is a one-time break with today's permutation even before slots are applied.

History and swap counts are **inputs** to the draw. They are not hashed into the seed string. Putting them in the seed would make Reshuffle and "yesterday" impossible to reason about separately.

### One-time circuit change on deploy

The day PR A reaches the live site, anyone who is not inside a frozen run gets a new five, including salt `""`. That is the point of the template.

An in-progress run is safe. `runIsFresh` restores today's run, `circuitIds` are frozen at START, and swaps replay on top. A run is fresh only when its date is today and its clock has not been finished for more than an hour. Older runs are already discarded.

A reload after the deploy, with no run in progress, builds a new circuit. GitHub Pages can show the previous bundle until that reload. The service worker that would make that worse stays parked.

Approving the plan is not approval to push `main`.

### Swap

Today Swap takes any other in-filter movement, skipping variant groups that are still on the other four cards, and if that set is empty it allows the group clash. It uses `Math.random()`, not the seed. The choice is stored on the in-progress run as `swaps[cardIndex] = id`, so a reload mid-workout keeps it. Finishing the workout deletes the run. Nothing about the swap survives as a preference. The roadmap's line that the replacement "isn't even persisted" is stale for the in-progress run and still true for taste.

**Recommended Swap (D7).**

1. Same slot, same focus, same mode, not already on the circuit, group free, carry/march family free.
2. If that set is empty, widen to any in-filter movement with the same exclusions.
3. If that set is empty, the tap does nothing.

The card that is leaving releases its group, so a bent-over row can become a gorilla row. A march cannot become a carry while the other one is still on the circuit, and a carry cannot be widened onto a different card while a march remains. The replacement is uniform among the legal set, so a Swap still feels like a change of pace. Weights apply to the daily draw, not to the tap.

### Recency, and what localStorage already holds

| Key | What is in it | This batch |
|---|---|---|
| `bellwork-sessions` | Last 200 sessions. Each is `{ date, focus, mode, weightLb, rounds, minutes, partial, exercises }`. `exercises` is **names**, not ids. | Reader accepts `exerciseIds` when present, else maps names. Writer adds `exerciseIds` from now on. Names stay, so old exports still read. |
| `bellwork-prefs` | `{ mode, durationMin, weightLb }`. Focus is not sticky. | Untouched. |
| `bellwork-run` | The in-progress workout, including `salt`, `swaps`, `circuitIds`. Cleared when the workout ends. | Untouched. Frozen ids keep a live workout stable. |
| `bellwork-approved` | Pending ids approved on this phone. | Untouched. The pool filter still honors it. Nothing is pending. |
| `bellwork-swap-counts` | Does not exist. | New. `{ [id]: number }`. The movement swapped *away* increments. The arrival does not. |

**Last session** means the latest log entry whose `date` is strictly before today, within the last 7 calendar days (`1 <= daysBetween(entry.date, today) <= 7`), and whose exercise list is non-empty. Partials count. A session saved today does not. Finishing this morning's workout must not rebuild this morning's five. Two sessions yesterday: only the later one counts, not the union. A skipped day: the last workout you actually logged still counts up to 7 days back; if more than 7 days have passed, no recency exclusion applies. One session of memory, not a multi-day window.

Cross-mode is by id. `clean_press` yesterday in Standard is excluded from Complex today. `swing` yesterday does nothing to Complex, because Complex has no `swing`.

On a template day the exclude is per slot. Yesterday's push drops out of the push slot. The other press remains, which on Complex full body means the two presses alternate across consecutive logged days. If the exclude would empty a slot, that slot ignores recency. On a three-pass day, yesterday's ids are removed first and added back only if fewer than five movements remain.

Old rows have names only. All 58 names are unique, so they resolve. A later rename will make that old row skip recency. That is acceptable. New rows carry ids so a rename does not matter again.

PRs are `focus|mode|weight` and the best round count. The picker does not read or write them. PR history is unaffected.

### Card order

`PATTERN_ORDER` today is Hinge, Squat, Push, Pull, Lunge, Rotation, Anti-rotation, Anti-extension, Anti-lean, Flexion, Carry. A lunge sorts *after* the pull. A rotation can sort *before* a lunge. The pattern label on the card is the only UI that cares.

**Recommended (D9):** sort by slot (hinge, knee, push, pull, core), and break ties with `PATTERN_ORDER`. On a template day the cards always read hinge, knee, push, pull, core, including when the knee is a lunge and when the core is a carry. On a Lower day the hinges sit together and the knees sit together. No new label, no new chip. `PATTERN_ORDER` stays the tie-break and the Library's business. It stops being the circuit order.

---

## 5. Decisions

All 12 decisions were walked through and locked by Joe on 2026-11-25.

**D1. Two PRs.** Picker first, compact cards second. Fold compact into the picker PR if you want one phone review. (Locked: two PRs.)

**D2. Carry fills the core slot.** Equal weight with the other core movements, plus whatever swap counts that movement has earned. No weekly carry quota and no extra carry boost. Flip this only if you want a boost; do not leave Carry slotless, or full-body Complex stops drawing both carries.

**D3. One variant group, `carry_march`, on the five march and carry ids.** `suitcase_march`, `racked_march`, `halo_march`, `clean_carry`, `snatch_oh_carry`. The singleton groups `racked_carry` and `oh_carry` go away. `check.mjs` asserts those five share that group and nothing else is in it, so the next carry someone ingests fails the check until it joins the group. One sentence in `INGEST.md` says the same thing. This is the whole march/carry mechanic. No new field.

**D4. `windmill` stays pattern Hinge.** It remains a legal Standard full-body hinge, about 1 day in 7 once the template is on. The other option is filing it as Anti-lean so it competes in the core slot instead. That is a one-line data change with a real training effect, and it is not required to make the template correct. Default is to leave movement data alone except D3.

**D5. Whole-body guarantee only when every slot has at least one in-filter candidate.** Otherwise the three-pass walk, inside the chip. Never fill a hole with an out-of-focus movement. This is what keeps a Core day from locking into windmill plus tall-kneeling press.

**D6. Recency is the single latest session dated strictly before today and within the last 7 calendar days.** Partials count. Sessions dated today do not. If more than 7 days have passed since the last logged session, no recency exclusion applies. Store `exerciseIds` going forward, resolve old rows by name. Relax per slot (template path) or add back (three-pass path) when the exclude would leave the circuit short. No multi-day window.

**D7. Swap stays in the card's slot, then widens inside the filter, then no-ops.** Uniform among the legal replacements. The departing group is released. Carry/march exclusion holds on the widen step.

**D8. Swap counts live in `bellwork-swap-counts`.** Increment the id that left the card, capped at 5. Draw weight is `1 / (1 + min(count, 5))`. A movement you always swap is about six times less likely than a fresh one, and it can still appear. The cap is there so a movement you hated in October does not effectively vanish by April. No decay clock, no new UI. Weights affect the daily draw only.

**D9. Circuit order is slot order, then `PATTERN_ORDER`.** Pattern text on the card stays.

**D10. Seed string unchanged, including Complex hashed as `"advanced"`.** One new five on the deploy day for anyone not in a frozen run. Say go before that deploy, same as always.

**D11. Compact cards, PR B (with Canvas mockup first).** Before coding PR B, present 2 or 3 interactive 375px layout options in a Cursor Canvas for Joe to pick the exact look. While `started && !finished` (paused counts), each card shows name, reps, the pattern line, the 2-bell badge if it has one, and Swap. Figures, cue, and grip open on a tap of the card and close on a second tap. Cards toggle independently. Swap does not toggle the card. When the workout finishes, cards are full again. Collapsing the canvases while the clock runs is also the right shape for the open battery note. It does not close that punchlist item. That still wants a gym session.

**D12. No new movements in this batch.** Complex push stays two deep on purpose. Recency will alternate `clean_press` and `bottoms_up_press` across consecutive Complex days. If that alternation feels too small in the gym, the fix is a later ingestion, not a picker special case.

---

## 6. Verification

No new dependencies.

`npm run check` stays the movement-data gate. It must pass. With D3, it also fails if a carry or a march sits outside `carry_march`.

A new `scripts/sim-circuit.mjs`, run with `node scripts/sim-circuit.mjs`, imports the real `buildCircuit` (history and counts passed in, so the test does not touch `localStorage`). It runs at least 4,000 dates × both modes × all seven focus filters, at empty counts and again with a hostile count map. Invariants, all of them hard failures:

- Length is 5 on every current chip (the smallest pool is 9).
- No duplicate ids.
- No duplicate `variantGroup`.
- At most one of the five `carry_march` ids.
- When the pre-recency pool can fill every slot: the five cards occupy five slots, one each.
- When it cannot: every card is inside the focus filter. A Standard Lower card is never a push, a pull, or a core pattern.
- Recency: if a slot had another legal candidate that was not in yesterday's set, the pick is not in yesterday's set. A prior session 7 calendar days before `today` triggers recency exclusion; a prior session 8+ days before `today` does not.
- Determinism: same date, focus order, mode, salt, history, and counts produce the same ids. The Complex seed string still contains `advanced`.
- A golden fixture: one fixed date, empty history, zero counts, both modes, full body, asserted id-for-id. This is the tripwire that keeps a later refactor from quietly reshuffling.
- Weights: in a 2-deep slot, a movement at the cap and a movement at 0. Over 2,000 seeds the capped one appears on under 30% of draws (even odds would be 50%, the formula says about 1/7). Loose on purpose so the test does not flake. Preference does not empty the slot: the capped movement still appears.
- Swap: with two legal same-slot alternatives, 200 swap taps all stay in the slot. With none, the tap stays inside the filter. With a march already on the circuit, a widened swap is never a carry.

Phone, after each PR, at 375px wide and at a normal phone width. The picker PR: full-body Complex and Standard, Upper, Lower, Core, Upper+Lower, Reshuffle, one Swap, start the clock, confirm the five ids do not change across reload, finish, confirm the next load can differ once the saved session is "yesterday" relative to a changed date fixture or a second real day. The compact PR: start, confirm figures are gone, tap a long name (`Gorilla row + sumo deadlift`, `Overhead tricep extension`) and confirm the row wraps and the timer bar still fits, Swap without expanding, expand one card, pause, finish, confirm full cards return. Library is unchanged and gets a glance so the card work did not leak.

---

## 7. What "done" looks like

- A Complex full-body day contains a hinge, a knee-dominant, a push, a pull, and a core movement. Every time.
- A Standard full-body day does the same. About one of those hinges in seven is the windmill, until you say otherwise (D4).
- Yesterday's five are out of today's draw wherever a slot has someone else to offer.
- Movements you swap away show up less, and a slot of one still shows up.
- A march and a carry never share a circuit, including after Swap.
- A Lower day is still a lower day.
- The in-progress workout you already started survives the deploy.
- Compact cards are the second PR, and the timer bar on a 375px screen still fits.

---

## Changelog

- **v1.0 (2026-11-25)** — Joe walked through and locked D1–D12: all plan defaults confirmed, with D6 capped at 7 calendar days (sessions older than a week do not trigger recency exclusion) and D11 adding a 375px interactive Canvas mockup before PR B code starts. Awaiting explicit go-ahead to build PR A.
- **v0.1** — Plan for approval. Counts and the 4,000-date miss rates taken from `origin/main` at `8fb0c04`. No repo edits.
