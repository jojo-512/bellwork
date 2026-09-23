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
- Feedback comes from real gym sessions. When I report an animation or form issue, treat the movement mechanics as the spec.

## Build and deploy

```bash
npm i
npm run build
```

- `bellwork.jsx` is the app source of truth.
- `npm run build` compiles with esbuild and writes a single self-contained `index.html` (Pages entry).
- Google Fonts stay as `<link>` tags in the HTML shell (do not self-host unless asked).
- Default workout mode is `standard`.
- When a GitHub remote exists, push to `main` deploys via GitHub Pages — only with explicit go-ahead.
