# Bellwork — session log

Where we left off. Any agent (Cursor or Claude) updates this file at the end of each working session, and whenever it opens, merges or closes a pull request: add a dated entry under Last session and keep Next current. Read it before starting work.

## Next

0. **Rig conversion: 51 of 58 movements are on the rig.** Joe approved standing batch 3 on [PR #17](https://github.com/jojo-512/bellwork/pull/17): standing pullover (`standing_pullover`), overhead tricep extension (`tricep_ext`), and throw over (`throw_over`). `TO_REVIEW` is empty. Batches 1 and 2 are on [PR #16](https://github.com/jojo-512/bellwork/pull/16) and [PR #15](https://github.com/jojo-512/bellwork/pull/15). Seven Standard movements still use the old figure: four floor movements for the next batch (floor press, push-up on the bell, Russian twist, dead bug pullover) and three held because the rig cannot show them cleanly (windmill, plank pull-through, tall-kneeling press). Plan: [proposals/rig-app-plan.md](./proposals/rig-app-plan.md).
1. **For Joe: thruster and lateral lunge + press.** Both still tip the forearm back about 16 degrees on the way down. Decide whether that fix rides with the next review or waits. The approved overhead press is the form to match.
2. **For Joe: Vision Batch 3 slot template.** Nothing is pending, and Complex can fill a pull slot (renegade, swing + high pull, gorilla row + sumo), so the old "wait for pending approvals" blocker is gone. The five-slot template (hinge, squat-or-lunge, push, pull, core) is not built. Sequencing call: finish the remaining Standard figures first, or plan Batch 3 now. Five slots stays the number.
3. **Battery and heat.** Still the open item in [punchlist.md](./punchlist.md). Needs a real gym session with the rig figures on screen, including time in the Library.
4. Keep dropping gym bugs into [punchlist.md](./punchlist.md).

## Last session (2026-11-23, Cursor, standing rig batch 3)

- **How it was built:** `movements.js` only. Reused the approved horns grip, goblet, and `horns_overhead`. No `rig.js` or `blocks.js` changes. `npm run check` passes with the same five warnings. 51 of 58 movements are on the rig (was 48).
- **Standing pullover:** horns at the chest, long soft arms arc over the crown and finish just behind the head. Ribs stay down. No lockout. Card views: side + three-quarter. Joe approved it on the first pass.
- **Overhead tricep extension:** `horns_overhead` lockout, then the elbows sit further back so the bell can drop behind the head. `fling` stays 0, so the bell hangs handle-up the whole rep. Card views: side + three-quarter. Joe approved it after that change.
- **Throw over:** standing scoop, both shoulders in one cycle (`sides: "right"`). Horns stay 9 cm apart and the elbows stay on one tucked pole. The bell path was widened so it finishes about 30 cm off the midline, out past the shoulder (was 19 cm, tucked against the side of the head). `fling` is 0.06 at the shoulder and 0.2 at the tip. Card views: side + front.
- **Joe approved all three** and gave the go-ahead to merge. `TO_REVIEW` is empty. [PR #17](https://github.com/jojo-512/bellwork/pull/17) merged to `main`. 51 of 58 movements are on the rig.

## Earlier (2026-11-23, Cursor, standing rig batch 2)

- **How it was built:** `movements.js` only, on the approved hinge and the bent-over row. The dead-stop parks the bell with `on: "floor"` and `floorAt`, the same way the gorilla row does. No `rig.js` or `blocks.js` changes. `npm run check` passes with the same five warnings, none of them new. 48 of 58 movements are on the rig (was 45).
- **Dead-stop row:** the bell parks under the shoulder, just in front of the toes and a little outside the foot, with the arm hanging straight. It comes almost straight up for the first 20 cm, then back to the lower ribs beside the hip. The `row` elbow drives up and back, ending about 9 cm above the shoulder, with no sideways flare. The torso is at 82° and the hips are low. A floor bell with this rig's arm length holds the shoulders at about 0.76 m, so the knees stay well bent. The bell finishes just outside the thigh, which is what clears the leg checks. The free arm hangs. Card views: side + front.
- **Reverse fly:** every phase uses the same pole, `[-0.15, 0.6, -0.7]`, so the elbow sits out and back at the bottom and up and back at the top, and cannot flip between phases. The first pass inverted at the top: its pole's forward component points at the floor in the hinge. The hands follow an arc around the shoulder at about 97% reach, so the elbows stay at 25–34° of bend on every sampled frame. Card views: side + front.
- **Ballistic row:** a still hang with nearly straight arms (26–31° bend), then a short, explosive pull to the lower ribs (hand x 0.05, like the bent-over row). The bell rises about 30 cm in a quarter second. Both hands meet 12 cm apart on the handle, where the bell floats about 5 cm above where the hand would hold it (`on: "air"`). The other hand catches it and rides it down into the opposite hang. `floorAt` is the same on every phase. Card views: side + front.
- **Ballistic row elbows:** both arms use one pole on every phase, `[-0.6, 0.5, -1]`. The elbows stay within 2 cm inside to 3 cm outside the shoulder line in every frame. The earlier pass blended the `hang` and `row` poles: its elbows sat 6–11 cm inside the shoulders, and the forearm leaned about 55° forward at the top.
- **Review rounds:** Joe sent all three back after the first pass (dead-stop elbow flare, fly elbows inverting, ballistic float too low). Then he approved the dead-stop row and the reverse fly, and sent the ballistic row back once more for the elbows.
- **Joe approved all three** and gave the go-ahead to merge. `TO_REVIEW` is empty. [PR #15](https://github.com/jojo-512/bellwork/pull/15) merged to `main`. 48 of 58 movements are on the rig.

## Earlier (2026-11-23, Cursor — standing rig batch 1)

- **How it was built:** four Standard standing movements, `movements.js` only. Reused the approved goblet, reverse lunge, overhead lockout, and the curl on the horns. No `rig.js` or `blocks.js` changes. `npm run check` passes with the same five warnings, none of them on these four. 45 of 58 movements are on the rig (was 41).
- **Split squat:** planted goblet version of the reverse lunge. The feet stay split the whole rep (`sides: "right"`, same stance for the set). Rear knee drops to about 7 cm. Card views: side + three-quarter, because the front view hides the stride.
- **Overhead lunge:** the reverse-lunge steps with the arm locked the whole time, the same lockout as the overhead press. The free arm hangs. `sides: "right"`. Alternating would swing the locked bell from one hand to the other through the head between reps. Card views: side + three-quarter.
- **Upright row:** standing, both hands on the handle. Elbows rise up and out and the bell finishes at the chin. No hip snap. One elbow change on the way up. Card views: side + front. Joe sent the first pass back: the bell stopped around the belly. The hands now finish at chin height and the bell hangs just under them, elbows above the hands.
- **Super slow curl:** the curl half of curl + halo. Horns up, elbows stay at the ribs. `dur` stays 5.0, so the loop is about 2.3 s up and 2.3 s down.
- **For review:** in the side view the racked overhead bell stacks on the head, because it sits beside the fist. Front and three-quarter show the gap. Same note as the overhead press. In the front view the upright-row bell stacks on the chin because it is centered in front of the face; three-quarter shows the gap. The elbows sit high and out. At the bottom of the split squat the front knee is about 2 cm past the toe.
- **Joe approved all four** and gave the go-ahead to merge. `TO_REVIEW` is empty. [PR #16](https://github.com/jojo-512/bellwork/pull/16) merged to `main`. 45 of 58 movements are on the rig.

## Earlier (2026-11-23, Claude, AGENTS.md: Cursor's authoring model)

- Joe asked Grok on Cursor to author the standing pilot (PR #13) to compare it with Opus and to use his Cursor allowance. `AGENTS.md` still required Opus for Cursor, so it now says Cursor authors on the model Joe picks, and records the Grok trial. Claude still checks every movement whoever authors it. Joe is running a larger Grok sample on the next round. Docs only.

## Earlier (2026-11-19, Cursor, Grok 4.7 high fast — standing Standard rig pilot, 3 movements)

- **How it was built:** one pass on a branch off `9e4ba0c` (PR #11). Reused the approved rack, squat, overhead-press, and RDL blocks. No `rig.js` or `blocks.js` changes. `npm run check` passes with the same five existing warnings, none of them on these three. 41 of 58 movements are on the rig (was 38).
- **Front rack squat:** the rack from clean + squat (elbow in front, bell on the forearm) through the goblet squat's depth (`squat_bottom`, knees out). The free arm hangs. Card views: side + front.
- **Push press, first pass:** a shallow dip, then the arm pressed most of the way. Sent back: the legs were straight while the hand was only about 10 cm off the rack.
- **Push press, revised:** the dip is deeper (pelvis 0.75, was 0.82) with the hips over the feet and the knees forward. At the end of the drive the legs are straight and the hand is already at the approved press point `[0.28, 1.6, 0.16]` with the press elbow. The Chin phase on the way up is gone. Dip to Drive is 0.30 s and Drive to lockout is 0.18 s, so the legs do the launch and the arm only finishes. The way down is still the controlled press lower. In the in-between frames the forearm stays vertical (the elbow is never more than about 1 cm in front of the hand).
- **Single-leg RDL:** the approved RDL hinge and bell height. The bell hand is opposite the standing leg. The rear leg reaches back in line with the torso and holds. Card views: side + three-quarter.
- **Single-leg RDL, revised:** the free arm no longer reaches out to a T. It hangs beside the bell, near the standing shin, through the hinge, the bottom, and the stand-up.
- **Joe approved all three** (`front_squat`, `push_press`, `single_leg_rdl`). 41 of 58 movements are on the rig. 11 standing and 6 floor/kneeling movements still use the old figure. `TO_REVIEW` emptied for the merge, the same way PR #11 left it. [PR #13](https://github.com/jojo-512/bellwork/pull/13) merged into `main` at `73ddd91` with Joe's go-ahead.

## Earlier (2026-11-19, Cursor, docs cleanup)

- Docs only. [PR #12](https://github.com/jojo-512/bellwork/pull/12) on `cursor/docs-cleanup-69cf`. No app code. No remote branches deleted.
- `docs/session.md`: Next items that were already shipped or obsolete are gone (pose cleanup, the install/export check, the Complex PR-number check, and the "later slice" that still listed swing + high pull, gorilla + sumo, carries, and halo as pending). Next is the remaining 20 Standard figures, the thruster and lateral lunge + press call, the Batch 3 sequencing call, and the battery/heat gym test.
- `docs/vision-roadmap.md`: status refresh against `9e4ba0c`. v1.2 decisions unchanged. Pool and rig counts updated. Batch 1 and Batch 2 marked shipped. Batch 3 noted as unbuilt, with its pull-slot precondition met.
- `docs/punchlist.md` left as-is. Battery and heat stays open.

## Earlier (2026-11-19, Claude, Complex follow-up + Standard rig batch 2)

- **How it was built:** Claude orchestrated; eight subagents worked in parallel worktrees from a shared brief, each saving a frame-by-frame filmstrip of the whole rep so the reviewer checks in-between frames, not only phase stills (the gap that let the first snatch rework through). Claude integrated, ran the checks and reviewed every filmstrip. No `rig.js` or `blocks.js` changes.
- **Complex follow-up:** the approved Standard clean (higher pull, Float, deeper Catch) is now in clean & press, clean + reverse lunge, clean + squat + press and clean + racked carry. The approved Standard snatch (swing arc, turn-over above the head) is in snatch + overhead lunge and snatch + overhead carry. The middle parts are unchanged.
  - Timing: `dur` raised so the clean and snatch play at the Standard speed. Clean + squat + press and clean + racked carry use slightly shorter clean `t` values instead, so their approved squat, press and steps keep their speed (and the squat + press elbow stays under the speed limit). Clean + squat + press has a short "Stand" in the rack after the catch so the dip doesn't bounce into the squat. The overhead carry walks about 14% faster.
- **Standard batch 2:**
  - RDL: two hands on the handle, a slightly higher-hip hinge than `hinge` so the knees read soft, bell riding the thighs to just below the knee.
  - Around the world: the pass from around the world + squat, closed by a hand-to-hand pass in front. One direction per set, like atw_squat.
  - Suitcase march and racked march: the same legs; the knee lifts higher than in halo march (which was short of hip height). Halo march unchanged.
  - Overhead press: rack to lockout and back, with new "Chin" phases so the forearm stays vertical and the elbow stays under the hand. Claude sent the first version back: the press copied from clean & press threw the elbow forward and angled the forearm back toward the face between the rack and the press. That flaw is still in clean & press and the other Complex presses; carry the fix over once Joe approves it.
  - Bent-over row: stays hinged, free hand braced on the left knee. Gorilla row: the row half of gorilla + sumo, alternating, bell parked on the floor.
  - High pull: a short hinge, hip snap, elbows up and out, bell straight up close to the body. Distinct from swing + high pull. The bell tops out at collarbone height, under the cue's "chin".
- **Joe's phone review:** approved 13 of 14. High pull rejected: it should be one smooth, continuous lift where the bell never stops on the way up, and the elbows hinged in steps instead of flaring out smoothly. Sent back for one continuous pull with fewer phases and a monotone elbow path.
- High pull rework: three phases on the way up (Hinge, Hips through, Pull), one elbow change from `hang` to `high_pull`, the bell's upward speed single-peaked. Cost: a shallower hinge with more knee bend and the arms starting slightly bent.
- With the overhead press approved, its fix (forearm vertical, elbow under the hand) is being carried into the Complex rack presses: clean & press, clean + squat + press, and bottoms-up press if it has the same flaw.
  - Done: all three fixed (elbow under the hand, worst 2 cm, was 19). Clean & press's press now plays at the overhead press speed, about 40% slower. Thruster and lateral lunge + press have a milder version (16 degrees) and are unchanged pending Joe.
- `TO_REVIEW` now lists the four for the second round: high pull, clean & press, clean + squat + press, bottoms-up press. The other 13 are approved.
- **Joe's second review:** high pull approved. Clean & press and clean + squat + press rejected: the vertical forearm is right, but the elbow flares out to the side, which is bad pressing form. Bottoms-up press is acceptable but should keep the elbow tighter. The approved overhead press has the same flare, so all four presses are being reworked together: the elbow stays in front of the body (30 to 45 degrees out from straight ahead), the fist rises in front of the face, and the arm turns toward the ear only at lockout.
  - Done: the elbow's sideways offset is 9 to 12 cm (was 24 to 26) and the upper arm stays within 28 degrees of straight ahead (was 56 to 64), with the forearm still vertical in the side view. New "Past the head" phases where the arm turns out. The press point is at mouth height, since a vertical forearm at forehead height forces the upper arm horizontal. `TO_REVIEW` lists the four presses for a third round; high pull approved.
- **Final review:** Joe approved the four presses, so all 18 changes in PR #11 are approved (14 movements, plus the press fix in bottoms-up press and the re-reviews). `TO_REVIEW` emptied and PR #11 merged by Claude with Joe's go-ahead.

## Earlier (2026-11-11, Claude, Standard rig batch 1)

- **How it was built:** Claude orchestrated and eight subagents each authored one movement in its own worktree, from a brief naming the approved Complex movement to cut from. Claude integrated the eight commits, ran `npm run check`, and looked at every phase in side, front and three-quarter views. No `rig.js` or `blocks.js` changes.
- **Swing:** the two-hand swing from swing + goblet squat (hike, drive, float, drop). The float hands are 1 cm further out and up so the arms read long.
- **Clean:** clean & press up to the rack, with the catch dip, then the drop.
- **Snatch:** snatch + overhead lunge without the lunge, with a short hold at lockout.
- **Goblet squat:** the thruster's squat without the press.
- **Reverse lunge:** reverse lunge + twist without the twist, alternating, with a short hold at the bottom.
- **Lateral lunge:** lateral lunge + press without the press.
- **Halo:** the bottoms-up halo from halo + press-out, alternating direction each rep.
- **Sumo deadlift:** the two-hand half of gorilla + sumo. A short "Touch down" phase rests the bell on the floor each rep; without it the two-hand hold leaves the bell 1.4 cm up.
- **For Joe to judge:** the sumo bottom uses the approved `sumo_bottom` body, which is close to a flat back and reads less "chest up" than the cue. In the goblet squat the elbows are inside the knees from the front but above them from the side, as in the thruster.
- Views: side + front for swing and goblet squat; side + three-quarter for clean, snatch and reverse lunge; front + three-quarter for lateral lunge, halo and sumo deadlift.
- **Joe's phone review:** approved swing, goblet squat, reverse lunge, lateral lunge, halo and sumo deadlift. Changes from his notes:
  - Swing: the bell hangs more under the hands at the float (`fling` 0.3, was 0.5).
  - Clean: the bell rises about 17 cm higher with a short "Float" phase, and the catch dips 4 cm deeper, so the body drops under the bell.
  - Snatch: a bigger swing arc. A deeper backswing behind the legs, the bell arcs out in front with a long arm, the elbow bends late ("Turn over"), then the punch-through. No near-body high pull.
  - Snatch, second pass: Joe rejected the first rework because the bell hinged beside the face. The hand now keeps rising in front of the face with the bell trailing, and the bell rolls over the fist above the head in the last part of the punch. The way down mirrors it. Swing and clean approved.
- **Final review:** Joe approved the snatch, so all eight are approved. `TO_REVIEW` emptied and PR #10 merged by Claude with Joe's go-ahead.
- The revised clean and snatch now differ from the Complex movements that contain them (clean & press, clean + lunge, clean + squat + press, clean + racked carry, snatch + lunge, snatch + overhead carry). If Joe approves the revisions, carry them into those as a follow-up.

## Earlier (2026-11-04, Claude, approvals in data)

- Joe approved halo march, clean + racked carry and snatch + overhead carry in the preview. Approvals there are saved only in that preview's own browser storage, so `pending` is removed from all three in `movements.js` instead. No movement is pending now. `check.mjs` now only warns about an old figure's geometry when the movement is on the rig, since the app no longer shows that figure. That had made the two carries' old stepping leg fail once they left pending.

## Earlier (2026-10-15, Claude, rig batch 5: floor, snatch, carries)

- **Contact sheet:** a "To review" group at the top of the movement menu and the picker lists only the open batch (`TO_REVIEW` in `contact.jsx`; update it when a batch opens or merges). Joe asked for it.
- **Sit-up to press:** lying (pelvis 0.1 m, pitch and lean -90, knees bent), curl up, sit tall, press overhead on the horns, lower, roll down. The press goes up in front of the face, not through it.
- **Push-up + row (renegade):** plank on the toes, feet wide. The right hand is on the handle of the bell parked on the floor, the left flat on the floor. Push-up, then row to the ribs with the hips square, set it down. It alternates sides. The rig has no sideways roll, so the hand on the raised handle stays bent at the top.
- **Bottoms-up press:** one hand, `fling: 1`, so the bell sits upside down above the fist from the rack to lockout and back.
- **Squat + press-out:** goblet, squat to the bottom, press straight out and hold, pull back, stand.
- **Snatch:** the clean's hike and drive, a high pull, a punch-through with the bell rolling onto the forearm, then lockout. Snatch + lunge reverse-lunges with the arm locked; snatch + overhead carry walks in place. Both tip the bell over in front and drop to the hike. With the arm straight overhead, the elbow bends out to the side, because the press direction lies along a straight arm and snapped.
- **Clean + racked carry:** the clean, then walking in place with the bell racked.
- **Joe's phone review:** approved push-up + row, squat + press-out, bottoms-up press, snatch + overhead lunge, snatch + overhead carry and clean + racked carry. Sit-up to press: the sit-up was approved, but the press looked like a swing. It now rises straight up in front of the chin, with the bell tipped forward (`fling: 0.5`) as it passes the face.
- Sit-up to press approved after the change. `TO_REVIEW` is emptied for the merge, so the review page shows no "To review" group until the next batch fills it.
- Merged by Claude with Joe's go-ahead (merge commit df2a106).
- Views: side + three-quarter for the sit-up, renegade, snatch + lunge and squat + press-out; side + front for the bottoms-up press and both carries.

## Earlier (2026-10-15, Claude, rig batch 4: halos and figure-8s)

- **Rig:** on the horns, `fling` tips the bell outward and up from hanging (1 is bottoms-up). With `fling` 0 it hangs under the hands as before, so earlier movements don't change. `on: "air"` lets go of the bell for a moment (it sits at `floorAt`) for a pop to a catch.
- **Drawing:** when the bell passes behind the head, the head hides it, so the halo reads in the front view.
- **Halo:** eight points around the head, written as world positions for both hands, because both hands sit on the same side of the head as the bell goes round. The elbows lift and point forward behind the head. Halo + press, curl + halo and halo march share the same path.
- **Halo + press:** chest, halo, back to the chest, press straight out with the bell bottoms-up. One direction on the card.
- **Curl + halo:** a curl on the horns (the bell turns with the forearms), the halo, back to the chest, lower. It alternates direction each rep, as the cue says.
- **Halo march:** the halo, lower, regrip to the right hand, suitcase at the side, march (right knee, left knee), regrip on the horns. It is still `pending` in the app.
- **Around the world + squat:** right hip, both hands meet behind the back to pass, left hip, catch in front onto the horns, goblet squat, stand, release to the right hand.
- **Figure 8 to hold:** wide quarter squat. Each pass goes in front of the knee, between the legs, to the other hand reaching round behind that leg, then round the outside back to the front. After both legs, the bell swings up and is caught at the chest. The rig has no hold on the ball of the bell, so the catch is shown on the horns.
- **Joe's phone review:** around the world + squat approved; the suitcase part of halo march is fine. Changes from his notes:
  - Halo: the elbows now go up, so the arms pass over the head. This applies to all three halo movements.
  - Curl + halo: the bell stays upright, horns up, through the curl and at the chest, and tips back a little during the halo. Halo + press and halo march keep the bottoms-up halo from their grip notes.
  - Figure 8 to hold: the hips stay at quarter-squat depth through the catch, and the bell leaves the hand for a moment at the pop, so the end no longer reads as a stand-up or a clean. Second pass: the phases either side of the pop set the same `floorAt`, so the bell rises and settles in one arc. Without it, `floorAt` blends in from its floor default and the bell dips.
- **Final review:** Joe approved all five with the revisions. Merged by Claude with Joe's go-ahead (merge commit 2555e2e).
- Card views: front + three-quarter for all five.

## Earlier (2026-10-15, Claude, rig batch 3: hinge and pull)

- **Rig:** a two-hand handle hold (`on: "handle"`), where the bell hangs from the middle of both hands. A per-phase `fling` (0 to 1) swings the bell out in line with the forearms, as at the top of a swing. A `shoulder` hand frame gives an arm hanging straight down (`hang`), and the floor bell's handle sits 2 cm higher.
  - The hand-off check now applies only where one hand is involved, so regripping from the handle to the horns isn't treated as a pass.
- **New blocks:** `hinge` and `sumo_bottom` bodies; `backswing` and `hang` hands; `row` and `high_pull` elbows; `wide` stance. `overhead_horns` is renamed `horns_overhead` to match the notes vocabulary, which now lists the new words.
- **Swing + high pull and swing + goblet squat:** a two-hand swing (deeper backswing, the bell in line with the arms at the float). The high pull drives the elbows high and outside; the squat catches the bell onto the horns at the float.
- **RDL + row:** a one-hand hinge with the arms hanging, a hold, a row to the hip with the elbow back, then stand.
- **Gorilla row + sumo deadlift:** wide stance, alternating the rowing hand each rep (right rep, then left). Row, park the bell on the floor, regrip with both hands, sumo-deadlift to stand, lower.
- **Timing:** a phase's `t` is the time to move from that phase to the next one, not time spent in it. Missing that first gave the sumo stand-up 0.15 s, which the speed check caught.
- Card views: side + front for all four; gorilla + sumo leads with front.
- **Joe's phone review:** approved RDL + row, lateral lunge + press, clean + squat + press, reverse lunge + twist and thruster. Swing + goblet squat was approved with a nit.
- **Changes from his notes:**
  - Swing + high pull: the bell now stays hanging, handle up, from the float through the pull and release.
  - Swing + goblet squat: less fling at the float, so the bell shows more gravity.
  - Gorilla row: the elbow drives up and out (`row_wide`) and the torso opens 22° toward the rowing arm.
  - Clean + reverse lunge: views changed to side + three-quarter.
  - Clean & press: a knee dip when the bell lands in the rack (`Catch`). Joe picks side or three-quarter once he has seen it.
- **Second review:** Joe approved all of batch 3 and the revisions. Views: swing + high pull front + three-quarter; gorilla + sumo front + three-quarter; clean & press three-quarter + front. Merged by Claude with Joe's go-ahead (merge commit ae3fc9f).
- The contact sheet gained a movement menu at the top of each sheet, since the published review page could not reach the picker.

## Earlier (2026-10-14, Claude, rig batch 2: lunges)

- Reverse lunge + twist, clean + reverse lunge and lateral lunge + press carry `rig` and pass the checks. The lunges reuse the blocks (no new body blocks): the back foot is a per-phase `footR` target, flat or on its toes, and the front foot stays planted.
- Reverse lunge + twist follows the prototype, alternating right then left (`sides: "alternate"`). The twist turns the ribcage over the front leg with the hips square.
- Clean + reverse lunge is the step 1a clean, then the right leg steps back with the bell racked on the right.
- Lateral lunge + press steps the right foot out to 0.76 m and sits into the right hip, then stands and presses by the horns like the thruster.
- Card views (Claude's suggestion, for Joe to confirm): lunge + twist side + three-quarter (the twist reads best there), lateral lunge front + three-quarter (side hides the lateral step), clean + lunge side + front.
- The floor patch now covers every foot position in the rep, so a wide stance stays on it; movements with feet under the hips draw the same patch as before.
- Opened [PR #5](https://github.com/jojo-512/bellwork/pull/5). Joe approved all three and confirmed the views; merged by Claude with his go-ahead (merge commit ef713b4).

## Earlier (2026-10-14, Claude, rig step 1b)

- `RigFigure` in `bellwork.jsx`: a canvas per view, one shared 30 fps loop that paints only figures on screen (IntersectionObserver), pixels freed when a figure scrolls off, sharpness capped at 2×, one shared clock so a movement's views stay in step and the timer's re-render never restarts them, and reduced motion draws the movement's `still` phase.
- The switch: a movement with `rig` counts as figured (`hasPoses`), the workout card shows its `rig.views` with labels from `VIEW_LABELS`, and the Library's side/front toggle picks from `rig.views`. The contact sheet already switched in 1a. Movements without `rig` keep the old `Figure`.
- Clean & press and thruster now carry `rig`, and both pass the checks. Clean & press is clean + squat + press without the squat, with a mid-press phase. Thruster uses two new hand blocks (`goblet`, `overhead_horns`) and a `goblet` elbow, holds the bell by the horns throughout, and presses forward of the face so the bell clears the head; overhead the bell hangs under the hands, as a horns grip does (the old figure drew it above them).
- Checked in the built app at 390×844: card, Library (both toggles) and reduced motion; no console errors. Private previews published from the session for Joe.
- Opened [PR #4](https://github.com/jojo-512/bellwork/pull/4). Joe approved clean & press and thruster on his phone, logged the battery check as an open punchlist item, and gave the go-ahead; merged by Claude (merge commit 96599dd).

## Earlier (2026-10-14, Claude, rig step 1a)

- Joe approved the app plan. Built step 1a on `claude/pensive-cori-xlhxdn`: `rig.js` (one rig merged from the prototypes: IK, per-phase bell hand as blend weights, monotone sampler, fixed framing at 80 px/m with ground at 178, fixed depth shading, drawing, checks), `blocks.js` (bodies, hands, elbow presets, stances), `checkRig`/`validateRig` wired into `npm run check`, and a rig mode on the contact sheet.
- Clean + squat + press now carries `rig` data (blocks plus overrides; block targets land within 1.4 cm of the prototype's). The app still draws its old figure.
- The new checks caught three faults in the approved trial and they're fixed: the hike hand was 2.3 cm out of reach (`between_legs` moved to where the hand lands), the legs over-straightened between Pull to rack and Rack (sampler overshoot; slopes are now monotone), and the elbow snapped at 6 m/s from Bottom to Drive + press (the press is now about halfway at the mid-drive phase, hand [0.12, 1.5, 0.2]; elbow peak under 5 m/s).
- The prototype pages in `docs/prototypes/` are kept for the record; the contact sheet replaces them for review.
- Opened [PR #3](https://github.com/jojo-512/bellwork/pull/3) (step 1a, with the plan commits) into `main`. Merged by Claude with Joe's go-ahead (merge commit 6d6673e).

## Earlier (2026-10-14, Claude, app plan)

- Drafted [proposals/rig-app-plan.md](./proposals/rig-app-plan.md) for Joe's approval. Recommended: canvas renderer, ship Complex per batch, three-quarter view only on the review page, right side only in the app.
- An independent Claude subagent reviewed the plan against the code and prototypes. Main finds: bell hand must be per phase (Complex changes hands mid-rep), the speed check must cover every joint (the elbow peaks fastest in clean + squat + press), fixed framing and shading, phone canvas memory, split slice 1 into rig-only and app PRs, estimates roughly doubled. Plan revised; §7 lists the changes. Decision 4 changed to right-then-left for alternating movements; decision 3 widened to any two views per movement.

## Earlier (2026-10-14, Claude, animation bake-off and decision)

- **Bake-off:** the same clean + squat + press brief went to Cursor on Grok (about 30 min), Cursor on Opus at medium effort (about 26 min, about 2% of a month's Cursor Opus allowance) and a Claude subagent that saw neither Cursor build (11 min). Cursor on Opus and Claude came out close on quality, Grok behind; Claude was fastest, kept the data smallest and followed the cue's press timing most closely. Cursor's first run on Auto missed the lockout and the clean.
- **Decision (Joe):** Claude authors rig animations. Cursor stays available with Opus picked by hand when timing doesn't matter, and Claude checks any movement Cursor authors. Recorded in a new `AGENTS.md` Animation section. The repo stays public for now (no private folders exist in a public repo); added the public-repo rule to `AGENTS.md`.
- **`CLAUDE.md` added:** it points Claude sessions to `AGENTS.md`, so both agents read one rulebook.
- **Clean + squat + press revised:** a deeper hike (hips back, shins near vertical) and a per-phase elbow preset (hang, pull, rack, press) on the bell arm, which keeps the elbow tucked in the clean and steadies the press. Both Cursor runs also found the elbow needs a per-phase direction; named presets keep the data small. Carry this into the shared rig.
- Drafted [proposals/rig-ingest.md](./proposals/rig-ingest.md) and the notes contract [ingest/notes-spec.md](./ingest/notes-spec.md). Any agent that can watch a video writes one notes file per video (often five or six movements) and opens a PR; Claude reviews it, Joe picks movements, Claude animates on that PR, Joe approves on his phone, and the notes file is deleted before a squash merge. Text-only notes in the public repo first; a private notes repo is the fallback if renders suffer.
- **Joe's calls:** text-only notes in the public repo first; convert the existing pool before new videos, starting with Complex. Merged this branch (with PR #1's rig proposal and prototypes) to `main`.
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

- None on product scope. No movement is `pending`. The open calls are the two in Next: the thruster and lateral lunge + press follow-up, and whether Vision Batch 3 waits until the remaining 20 figures are on the rig.

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
