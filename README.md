# site

The landing page for the [wdl-dev](https://github.com/wdl-dev) repositories,
served as a single WDL Worker — and it's [live at wdl.dev](https://wdl.dev).

This is a standard WDL Worker project — scaffolded with `wdl init` and deployed
through the `wdl` CLI (`npm run deploy` → `wdl deploy .`), the same path any
tenant uses. `src/index.js` renders the page HTML; static files are served from
the **ASSETS** store. The Worker resolves them with `env.ASSETS.url()`, while
the CSS loads its watermark relatively. There is no local fallback — develop by
deploying and testing on the platform.

## Layout

```
src/index.js             worker entry — renders the page and the repo list
public/                  ASSETS: styles.css, hero-w.svg, favicon.svg, logo.png, og.png
brand/WDL-mark.svg       canonical transparent logo mark used by the asset generator
scripts/build-logo.mjs   regenerates hero-w.svg + favicon.svg + logo.png + og.png from the canonical mark
wrangler.jsonc           worker config (assets.directory = ./public, route wdl.dev/*)
test/worker.test.js      responses off the wire, run with `npm test`
AGENTS.md / CLAUDE.md    pointers to the per-feature docs shipped with @wdl-dev/cli
```

The repositories shown on the page are defined in the `REPOS` array at the top
of `src/index.js`. The page styling lives in `public/styles.css`.

## Brand assets

`brand/WDL-mark.svg` is the canonical, transparent logo geometry. The
`public/hero-w.svg` watermark, `public/favicon.svg`, `public/logo.png`, and
`public/og.png` outputs are generated from it. After changing the mark,
regenerate them:

```sh
npm run build:logo
```

## Deploy

Releases go through the `wdl` CLI — not `wrangler deploy` (which targets
Cloudflare). The `wdl.dev` route is operator-declared; this repo claims it via
`routes` in `wrangler.jsonc`. `workers_dev: false` there disables the
`<ns>.<platform-domain>` URL, so the Worker serves only on `wdl.dev`.

The Worker also serves `/robots.txt`, `/sitemap.xml`, and `/llms.txt` itself.

```sh
npm install
npm run dry-run    # wrangler bundle check, nothing uploaded
npm run deploy     # wdl deploy . --ns site — bundles, uploads assets, promotes
```
