# site

The landing page for the [wdl-dev](https://github.com/wdl-dev) repositories,
served as a single WDL Worker — and it's [live at wdl.dev](https://wdl.dev).

This is a standard WDL Worker project — scaffolded with `wdl init` and deployed
through the `wdl` CLI (`npm run deploy` → `wdl deploy .`), the same path any
tenant uses. `src/index.js` renders the page HTML; the CSS, logo, and favicon
are served from the **ASSETS** store and resolved at request time with
`env.ASSETS.url()`. There is no local fallback — develop by deploying and
testing on the platform.

## Layout

```
src/index.js             worker entry — renders the page and the repo list
public/                  ASSETS: styles.css, favicon.svg, og.png
brand/WDL-black.svg      brand source the favicon and OG image are generated from
scripts/build-logo.mjs   regenerates public/favicon.svg + public/og.png from brand/WDL-black.svg
wrangler.jsonc           worker config (assets.directory = ./public, route wdl.dev/*)
AGENTS.md / CLAUDE.md    pointers to the per-feature docs shipped with @wdl-dev/cli
```

The repositories shown on the page are defined in the `REPOS` array at the top
of `src/index.js`. The page styling lives in `public/styles.css`.

## Brand assets

`public/favicon.svg` and `public/og.png` (the social share card) are generated
from `brand/WDL-black.svg`. After changing the brand files, regenerate them:

```sh
npm run build:logo
```

## Deploy

Releases go through the `wdl` CLI — not `wrangler deploy` (which targets
Cloudflare). The `wdl.dev` route is operator-declared; this repo claims it via
`routes` in `wrangler.jsonc`.

```sh
npm install
npm run dry-run    # wrangler bundle check, nothing uploaded
npm run deploy     # wdl deploy . --ns site — bundles, uploads assets, promotes
```
