# Bellwork — agent notes

## WHAT IT IS

Bellwork is my kettlebell AMRAP workout timer, built for real gym use on my iPhone. Daily seeded 5-exercise circuit, animated stick figures (side and front views), Standard pool of single movements and Complex pool of chained hybrids, focus chips (Upper/Lower/Core/Full body, up to two), sticky timer bar (15 to 30 min), +1 ROUND, session history with PRs scoped per focus and mode, partial session saving, warm-up primer, Library view. Complex mode is my primary use case and design priority.

The product promise: an easy 20 to 30 minute workout you can do day after day, working the whole body, and end up in a much better place 90 days later. Judge changes against that.

Product context: [`docs/vision-roadmap.md`](./docs/vision-roadmap.md), [`docs/punchlist.md`](./docs/punchlist.md), [`docs/session.md`](./docs/session.md).

## HOW I WORK

- Plan before building. Propose a plan with honest tradeoffs, then wait for my approval. Don't build until I approve.
- Prefer the simpler solution. Don't add dependencies, frameworks, or structure the app doesn't need.
- Decisions already made, don't re-propose: no 2-bell toggle (badge instead), Complex mode is not a separate workout structure, no progression nudge feature.
- Pushing to main deploys to the live site via GitHub Pages. Never push without my explicit go-ahead. Show me the diff first.
- Two agents work in this repo: Cursor and Claude. Proposals arrive as a branch plus a pull request, with the reasoning in `docs/proposals/`. Review the PR before building on it, and update `docs/session.md` at the end of every session and whenever you open, merge or close a PR, so the other agent can pick up.
- Feedback comes from real gym sessions. When I report an animation or form issue, treat the movement mechanics as the spec.
- The repo is public. Never commit personal details, health or medical reasoning, creator names or handles, video links or footage.

## Animation

- Movements animate on the pelvis-rooted rig (`docs/proposals/rig-animation.md` §0, prototypes in `docs/prototypes/`). Decided 2026-10-14.
- Claude authors rig animations by default: it was faster and simpler in a side-by-side trial, and doesn't use Cursor credits. Cursor can author one when Joe asks, with Opus selected by hand (not Auto).
- Every movement, whoever authors it, is checked by Claude before it goes into the app: each phase in side, front and three-quarter views, against the movement mechanics and its `cue`, plus the numeric checks (reach, floor, bell clear of the body, no snaps).
- Joe approves each movement on his phone before it ships.

## Build and deploy

```bash
npm i
npm run build
npm run check
```

- `bellwork.jsx` is the app source of truth. Movement data lives in `movements.js` (pose vocabulary in `poses.js`).
- `INGEST.md` is the authority for adding movements. `INBOX.md` is the agent's drop queue.
- Mode strings are `standard` / `complex` (older `"advanced"` is normalized on read).
- `npm run build` compiles with esbuild and writes a single self-contained `index.html` (Pages entry).
- `npm run check` validates movement data (ids, pools, poses, patterns) with no extra dependencies.
- Google Fonts stay as `<link>` tags in the HTML shell (do not self-host unless asked).
- Default workout mode is `standard`.
- When a GitHub remote exists, push to `main` deploys via GitHub Pages — only with explicit go-ahead.
