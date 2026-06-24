const ORG = "https://github.com/wdl-dev";

const REPOS = [
  {
    name: "wdl",
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
    role: "cli",
    blurb:
      "Ships your code to a WDL platform. Bundles the project with Wrangler v4, uploads " +
      "it to the control plane, and manages D1, R2, KV, queues, secrets, and `wdl tail` " +
      "logs inside your own namespace. Nothing is ever sent to Cloudflare.",
    meta: "Node.js · npm",
    links: [
      { label: "GitHub", href: `${ORG}/cli` },
      { label: "npm", href: "https://www.npmjs.com/package/@wdl-dev/cli" },
    ],
  },
  {
    name: "site",
    role: "site",
    blurb:
      "This page — a single WDL Worker scaffolded with `wdl init`. It renders its own " +
      "HTML and serves its CSS and favicon through ASSETS, deployed on WDL itself. " +
      "The page you are reading is the response.",
    meta: "Worker · ASSETS",
    links: [{ label: "GitHub", href: `${ORG}/site` }],
  },
];

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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

const repoRow = (repo) => `<article class="repo">
        <div class="repo-role"><span class="dot" aria-hidden="true"></span>${escape(repo.role)}</div>
        <div class="repo-body">
          <h3 class="repo-name">${escape(repo.name)}</h3>
          <p class="repo-blurb">${richText(repo.blurb)}</p>
          <div class="repo-foot">
            <span class="repo-links">${linkRow(repo.links)}</span>
            <span class="repo-meta">${escape(repo.meta)}</span>
          </div>
        </div>
      </article>`;

const page = ({ cssUrl, faviconUrl }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>WDL — self-hosted Workers platform</title>
<meta name="description" content="WDL — a self-hosted, multi-tenant Workers platform on workerd, its CLI, and this site.">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${escape(faviconUrl)}">
<link rel="stylesheet" href="${escape(cssUrl)}">
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <p class="eyebrow">Self-hosted Workers platform</p>
      <h1>Workers, on your own metal.</h1>
      <p class="sub">WDL runs Cloudflare&nbsp;Workers&ndash;shaped code on stock
        <b>workerd</b> — multi-tenant, immutable, and namespaced to&nbsp;you.</p>
      <div class="inset" role="img"
           aria-label="Scaffold a worker named WDL, deploy it, then curl https://demo.wdl.sh/WDL">
        <div class="line"><span class="prompt">$ </span>wdl init . --worker <span class="slot">WDL</span></div>
        <div class="line"><span class="prompt">$ </span>wdl deploy .</div>
        <div class="line"><span class="prompt">$ </span>curl https://<span class="slot">demo</span>.wdl.sh/<span class="slot">WDL</span></div>
      </div>
    </section>

    <main>
      <div class="repos-head">Three repositories</div>
      ${REPOS.map(repoRow).join("\n      ")}
    </main>

    <footer>
      <p class="colophon">This page is itself a WDL Worker, deployed with <code>wdl deploy</code>
        — like you'd ship your own.</p>
      <p class="colophon">The hosted platform isn't live yet. To be a seed user, email
        <a href="mailto:hi@wdl.dev">hi@wdl.dev</a>.</p>
      <div class="foot-row">
        <span>Sean Consulting OÜ · Apache-2.0</span>
        <a href="${ORG}" target="_blank" rel="noopener">GitHub ↗</a>
      </div>
    </footer>
  </div>
</body>
</html>`;

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === "/healthz") {
      return new Response("ok", { headers: { "content-type": "text/plain" } });
    }
    const [cssUrl, faviconUrl] = await Promise.all([
      env.ASSETS.url("styles.css"),
      env.ASSETS.url("favicon.svg"),
    ]);
    return new Response(page({ cssUrl, faviconUrl }), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};
