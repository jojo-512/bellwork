# Bellwork

Kettlebell AMRAP workout timer. Source of truth is `bellwork.jsx`; `npm run build` produces a single self-contained `index.html` for GitHub Pages.

## Setup

```bash
npm i
npm run build
```

Open `index.html` locally (any static server), or deploy by pushing `main` to GitHub Pages when a remote exists.

## Layout

| File | Role |
|---|---|
| `bellwork.jsx` | App source |
| `entry.jsx` | Mounts the app on `#root` |
| `index.template.html` | HTML/PWA shell (meta, icons, manifest, fonts) |
| `build.mjs` | esbuild → inlines bundle into `index.html` |
| `index.html` | Built Pages entry (generated) |
