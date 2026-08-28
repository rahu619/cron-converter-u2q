# cron-u2q web

A tiny [crontab.guru]-style playground for
[cron-converter-u2q](https://www.npmjs.com/package/cron-converter-u2q). Two
boxes — Unix and Quartz — that stay in sync as you type, plus a plain-English
description and the next three run times for whichever expression you're
editing. Ships with dark and light themes (defaults to your OS preference,
toggle in the header), one-click copy buttons for both expressions, and
relative countdowns next to each upcoming run.

Built with [Vite](https://vite.dev/) and vanilla TypeScript; the only runtime
dependency is the published `cron-converter-u2q` package itself.

## Local development

Requires Node `^20.19.0 || >=22.12.0` (Vite 7).

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build into web/dist/
npm run preview    # serve the production build locally
```

## How it works

- Typing in the **Unix** box validates it, converts it into the Quartz box,
  and renders the description + next runs for the Unix expression.
- Typing in the **Quartz** box does the reverse. Expressions using `L`, `W`,
  or `#` (or non-zero seconds) validate fine in Quartz but can't round-trip to
  Unix — the UI shows the library's exact error under the Unix box and still
  describes the Quartz schedule.
- Invalid input shows the validator's field-level error message inline and
  keeps the last good results visible (dimmed).
- Next runs are computed in the browser's local timezone (shown next to the
  heading), each with a relative countdown.
- The header toggle switches dark/light; the choice persists in
  `localStorage`, and first visits follow `prefers-color-scheme`.

## Deploying

The app is fully static (`npm run build` → `web/dist/`) and pulls
`cron-converter-u2q` from npm, so there is no workspace wiring to configure.
`vite.config.ts` sets `base: './'`, so the build works from any subpath —
including GitHub Pages' project-page URL — without further changes.

### GitHub Pages (no external account needed)

`.github/workflows/pages.yml` builds this folder and publishes it to GitHub
Pages on every push to `main`. One-time setup in the repo:

1. **Settings → Pages → Source** → choose **GitHub Actions**.
2. Push (or use **Actions → Deploy web playground → Run workflow**).

The site lands at `https://rahu619.github.io/cron-converter-u2q/`. The
relative asset base means the hashed `dist/` files resolve correctly under the
project subpath.

### Vercel

1. Import the repository.
2. Set **Root Directory** to `web` (Framework preset: Vite is auto-detected;
   `vercel.json` pins the build command and output dir as a fallback).
3. Deploy — e.g. `https://cron-u2q.vercel.app`.

### Netlify

1. New site from Git, then set **Base directory** to `web`.
2. `netlify.toml` in this folder supplies the build command, publish dir
   (`dist`), and Node version — no extra configuration needed.

Vercel and Netlify serve the single page at `/`; no SPA rewrites are required.

[crontab.guru]: https://crontab.guru/
