const ORG = "https://github.com/wdl-dev";

const REPOS = [
  {
    name: "wdl",
    group: "Core",
    role: "platform",
    blurb:
      "The multi-tenant Workers platform, built on stock Cloudflare workerd with " +
      "multi-replica failover. Loads immutable worker versions from Redis/Valkey, then " +
      "layers control/auth, KV, R2, D1, Durable Objects, queues, cron, Workflows, and " +
      "live log tailing around the runtime.",
    meta: "Rust · JS",
    links: [
      { label: "GitHub", href: `${ORG}/wdl` },
      { label: "wdl-workerd", href: "https://hub.docker.com/r/getwdl/wdl-workerd" },
      { label: "wdl-rust", href: "https://hub.docker.com/r/getwdl/wdl-rust" },
    ],
  },
  {
    name: "cli",
    group: "Core",
    role: "cli",
    blurb:
      "Ships your code to a WDL platform. Bundles the project with Wrangler v4, uploads " +
      "it to the control plane, and manages D1, R2, KV, queues, secrets, and `wdl tail` " +
      "logs inside your own namespace. Nothing is ever sent to Cloudflare.",
    meta: "JS · npm",
    links: [
      { label: "GitHub", href: `${ORG}/cli` },
      { label: "npm", href: "https://www.npmjs.com/package/@wdl-dev/cli" },
    ],
  },
  {
    name: "aws-sigv4",
    group: "Core",
    role: "library",
    blurb:
      "A small, zero-dependency AWS SigV4 signer for web-standard runtimes and " +
      "S3-compatible storage — a `SigV4Client` with sign() and fetch(), and nothing else.",
    meta: "TypeScript · npm",
    links: [
      { label: "GitHub", href: `${ORG}/aws-sigv4` },
      { label: "npm", href: "https://www.npmjs.com/package/@wdl-dev/aws-sigv4" },
    ],
  },
  {
    name: "chat",
    group: "Ecosystem",
    role: "product",
    blurb:
      "A WDL Worker that builds WDL Workers — an AI agent that turns one line into a " +
      "running worker: build in a MicroVM sandbox, deploy, preview. The reference " +
      "demo, running as a tenant on WDL.",
    meta: "JS · MicroVM",
    links: [
      { label: "GitHub", href: `${ORG}/chat` },
      { label: "chat.wdl.dev", href: "https://chat.wdl.dev" },
    ],
  },
  {
    name: "docs",
    group: "Ecosystem",
    role: "docs",
    blurb:
      "Every doc in these repositories on one domain, aggregated from their markdown at " +
      "build time. Append `.md` to any page — or ask for `text/markdown` — and an " +
      "agent gets the source, not the page.",
    meta: "Worker · ASSETS",
    links: [
      { label: "GitHub", href: `${ORG}/docs` },
      { label: "wdl.md", href: "https://wdl.md" },
    ],
  },
  {
    name: "site",
    group: "Ecosystem",
    role: "site",
    blurb:
      "This page — a single WDL Worker scaffolded with `wdl init`. It renders its own " +
      "HTML and serves its static files through ASSETS. You're reading its response.",
    meta: "Worker · ASSETS",
    links: [{ label: "GitHub", href: `${ORG}/site` }],
  },
];

// ≤125 chars: social previews truncate og:description around there.
const DESCRIPTION =
  "WDL — a self-hosted, multi-tenant Workers platform on stock workerd, " +
  "with its CLI, AI worker builder, and libraries.";

const SITE_URL = "https://wdl.dev/";
const SHARE_TEXT = "WDL — self-hosted Workers platform on stock workerd";
const SHARE_LINKS = [
  {
    label: "X",
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
  },
  {
    label: "Hacker News",
    href: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(SITE_URL)}&t=${encodeURIComponent(SHARE_TEXT)}`,
  },
  {
    label: "LinkedIn",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
  },
];

const CRAWLER_FILES = {
  "/robots.txt": {
    type: "text/plain; charset=utf-8",
    body: `# AI crawlers (GPTBot, ClaudeBot, PerplexityBot, and friends) are welcome.
User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`,
  },
  "/sitemap.xml": {
    type: "application/xml; charset=utf-8",
    body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}</loc></url>
</urlset>
`,
  },
  "/llms.txt": {
    type: "text/plain; charset=utf-8",
    body: `# WDL

> ${DESCRIPTION}

${
  "WDL is open-source serving infrastructure: a multi-tenant platform that runs " +
  "Cloudflare Workers–shaped code on stock workerd, with multi-replica failover, " +
  "immutable worker versions loaded from Redis/Valkey, and control/auth, KV, R2, " +
  "D1, Durable Objects, queues, cron, Workflows, and live log tailing layered " +
  "around the runtime. Code ships through the wdl CLI to your own control plane — " +
  "nothing is ever sent to Cloudflare. Everything is Apache-2.0, and the hosted " +
  "surfaces (per-namespace *.wdl.sh worker domains, chat.wdl.dev, wdl.md) are " +
  "themselves tenants running on this same infrastructure."
}

## Documentation

- [wdl.md](https://wdl.md): documentation for every repository here, aggregated from their markdown and served as a WDL Worker. Append \`.md\` to any page, or request \`text/markdown\`, to get the source instead of the HTML.
- [wdl.md/llms.txt](https://wdl.md/llms.txt): machine-readable index of the docs site.

## Repositories

${REPOS.map((r) => `- [${r.name}](${ORG}/${r.name}) (${r.role}): ${r.blurb}`).join("\n")}
`,
  },
};

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const repoCount = COUNT_WORDS[REPOS.length] ?? REPOS.length;
const GROUPS = [...new Set(REPOS.map((repo) => repo.group))];

export const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );

// Escape, then promote `inline code` spans (backticks are safe post-escape).
const richText = (s) => escape(s).replace(/`([^`]+)`/g, "<code>$1</code>");

const linkRow = (links) =>
  links
    .map(
      (l) =>
        `<a class="link" href="${escape(l.href)}" target="_blank" rel="noopener">${escape(
          l.label,
        )}<span class="ext" aria-hidden="true">↗</span></a>`,
    )
    .join("");

const repoRow = (repo) => `<div class="repo">
          <h4 class="repo-name">${escape(repo.name)}</h4>
          <small class="repo-role">${escape(repo.role)}</small>
          <p class="repo-blurb">${richText(repo.blurb)}</p>
          <div class="repo-foot">
            <span class="repo-links">${linkRow(repo.links)}</span>
            <span class="repo-meta">${escape(repo.meta)}</span>
          </div>
        </div>`;

// Keep both groups in one extractable block for Edge Reading Mode.
const repoGroup = (group) => `<div class="repo-group-label" role="heading" aria-level="3"><strong>${escape(group)}</strong></div>
        ${REPOS.filter((repo) => repo.group === group).map(repoRow).join("\n        ")}`;

const page = ({ cssUrl, faviconUrl, ogImageUrl, logoUrl }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WDL — self-hosted Workers platform</title>
<meta name="description" content="${escape(DESCRIPTION)}">
<link rel="canonical" href="${escape(SITE_URL)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="WDL">
<meta property="og:url" content="${escape(SITE_URL)}">
<meta property="og:title" content="WDL — self-hosted Workers platform">
<meta property="og:description" content="${escape(DESCRIPTION)}">
<meta property="og:image" content="${escape(ogImageUrl)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="WDL — Workers, on your own metal.">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "WDL",
      url: SITE_URL,
      logo: logoUrl,
      email: "hi@wdl.dev",
      sameAs: [ORG],
    },
    { "@type": "WebSite", name: "WDL", url: SITE_URL, description: DESCRIPTION },
  ],
}).replace(/</g, "\\u003c")}</script>
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${escape(faviconUrl)}">
<link rel="stylesheet" href="${escape(cssUrl)}">
</head>
<body>
  <div class="wrap">
    <main>
      <article aria-labelledby="page-title">
        <div class="hero">
          <p class="eyebrow">Self-hosted Workers platform</p>
          <h1 id="page-title">Workers, on your own metal.</h1>
          <p class="sub">WDL runs Cloudflare&nbsp;Workers&ndash;shaped code on stock
            <b>workerd</b> — multi-tenant, immutable, and namespaced to&nbsp;you.</p>
          <div class="inset" role="img"
               aria-label="Scaffold a worker named WDL, deploy it, then curl https://demo.wdl.sh/WDL">
            <div class="line"><span class="prompt">$ </span>wdl init . --worker <span class="slot">WDL</span></div>
            <div class="line"><span class="prompt">$ </span>wdl deploy .</div>
            <div class="line"><span class="prompt">$ </span>curl https://<span class="slot">demo</span>.wdl.sh/<span class="slot">WDL</span></div>
          </div>
        </div>

        <h2 class="repos-head">${escape(repoCount)} repositories</h2>
        ${GROUPS.map(repoGroup).join("\n        ")}
      </article>
    </main>

    <footer>
      <p class="colophon">This page is itself a WDL Worker on the hosted preview — a live,
        rolling demo, not a commercial service, no commitments. To test on it, email
        <a href="mailto:hi@wdl.dev">hi@wdl.dev</a>.</p>
      <p class="colophon">Not affiliated with, endorsed by, or sponsored by Cloudflare,&nbsp;Inc.
        Cloudflare, Workers, Wrangler, and workerd are its trademarks.</p>
      <div class="foot-row">
        <span>Sean Consulting OÜ · Apache-2.0</span>
        <span class="share-row">
          <span>Share</span>
          ${SHARE_LINKS.map(
            (l) => `<a href="${escape(l.href)}" target="_blank" rel="noopener">${escape(l.label)}</a>`,
          ).join("\n          ")}
          <button type="button" class="share-native" aria-label="More share options" hidden>More&hellip;</button>
        </span>
        <a href="${ORG}" target="_blank" rel="noopener">GitHub ↗</a>
      </div>
    </footer>
  </div>
  <script>
    const btn = document.querySelector(".share-native");
    if (navigator.share) {
      btn.hidden = false;
      btn.onclick = () =>
        navigator.share({ title: document.title, url: location.href }).catch(() => {});
    }
  </script>
</body>
</html>`;

// Kept in sync with the docs site (wdl.md) so both properties age alike.
const CACHEABLE = { "cache-control": "public, max-age=21600, stale-while-revalidate=86400" };
const UNCACHED = { "cache-control": "no-store" };

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const crawlerFile = CRAWLER_FILES[pathname];
    if (crawlerFile) {
      return new Response(crawlerFile.body, {
        headers: { ...CACHEABLE, "content-type": crawlerFile.type },
      });
    }
    if (pathname !== "/") {
      return new Response("Not found\n", {
        status: 404,
        headers: { ...UNCACHED, "content-type": "text/plain; charset=utf-8" },
      });
    }
    const [cssUrl, faviconUrl, ogImageUrl, logoUrl] = await Promise.all([
      env.ASSETS.url("styles.css"),
      env.ASSETS.url("favicon.svg"),
      env.ASSETS.url("og.png"),
      env.ASSETS.url("logo.png"),
    ]);
    return new Response(page({ cssUrl, faviconUrl, ogImageUrl, logoUrl }), {
      headers: { ...CACHEABLE, "content-type": "text/html; charset=utf-8" },
    });
  },
};
