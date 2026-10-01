# Bellwork

Kettlebell AMRAP workout timer. Source of truth is `bellwork.jsx`; `npm run build` produces a single self-contained `index.html` for GitHub Pages.

## Setup

```bash
npm i
npm run build
```

Open `index.html` locally (any static server), or deploy by pushing `main` to GitHub Pages when a remote exists.

`npm run check` validates `movements.js`. Schema problems fail the run. Pose checks (bell on the hand, standing leg length, feet on the ground line) warn on a pending lift and fail on a lift already in rotation.

## Contact sheet

Review page for one movement. Not linked from the workout. After `npm run build`:

```
contact.html?id=swing_high_pull
```

Keyframes are numbered, side and front. How a lift gets ingested is `INGEST.md`.

## Docs

Product vision, punchlist, and session notes live in [`docs/`](./docs/) (`vision-roadmap.md`, `punchlist.md`, `session.md`).

## Layout

| File | Role |
|---|---|
| `bellwork.jsx` | App source |
| `entry.jsx` | Mounts the app on `#root` |
| `index.template.html` | HTML/PWA shell (meta, icons, manifest, fonts) |
| `build.mjs` | esbuild → inlines bundles into `index.html` and `contact.html` |
| `index.html` | Built Pages entry (generated) |
| `contact.jsx` | Review-only contact sheet (generated `contact.html`) |
| `check.mjs` | `npm run check` — schema plus pose warnings |
