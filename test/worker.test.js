// The worker's responses as they come off the wire. escape() is the exception:
// it is unit-tested directly because it has no observable input path otherwise.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { escape } from "../src/index.js";

// The page route resolves asset URLs; every other route returns before it.
const ENV = { ASSETS: { url: async (p) => `https://assets.example/${p}` } };

const get = (path) => worker.fetch(new Request(`https://wdl.dev${path}`), ENV);

const CACHEABLE = "public, max-age=21600, stale-while-revalidate=86400";

const jsonLdOf = (html) => {
  const m = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  assert.ok(m, "JSON-LD script tag present");
  return JSON.parse(m[1]);
};

// ---- routing and headers ----

test("/ is a cacheable HTML page", async () => {
  const res = await get("/");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/html; charset=utf-8");
  assert.equal(res.headers.get("cache-control"), CACHEABLE);
});

test("unknown paths are an uncacheable 404", async () => {
  const res = await get("/nope");
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("crawler files are served with their own content types", async () => {
  const cases = [
    ["/robots.txt", "text/plain; charset=utf-8"],
    ["/sitemap.xml", "application/xml; charset=utf-8"],
    ["/llms.txt", "text/plain; charset=utf-8"],
  ];
  for (const [path, type] of cases) {
    const res = await get(path);
    assert.equal(res.status, 200, path);
    assert.equal(res.headers.get("content-type"), type, path);
    assert.equal(res.headers.get("cache-control"), CACHEABLE, path);
  }
});

test("robots.txt points at the sitemap", async () => {
  const body = await (await get("/robots.txt")).text();
  assert.match(body, /^Sitemap: https:\/\/wdl\.dev\/sitemap\.xml$/m);
});

// ---- page derived from the repo list ----

test("the repo count is spelled from the list length", async () => {
  const html = await (await get("/")).text();
  assert.match(html, /six repositories/);
});

test("repos are grouped under Core and Ecosystem", async () => {
  const html = await (await get("/")).text();
  for (const group of ["Core", "Ecosystem"]) {
    assert.ok(html.includes(`<strong>${group}</strong>`), group);
  }
});

test("the head carries canonical and parseable Organization JSON-LD", async () => {
  const html = await (await get("/")).text();
  assert.ok(html.includes('<link rel="canonical" href="https://wdl.dev/">'), "canonical");
  const types = jsonLdOf(html)["@graph"].map((n) => n["@type"]);
  assert.deepEqual(types, ["Organization", "WebSite"]);
});

test("the Organization logo is the raster, not the favicon", async () => {
  const org = jsonLdOf(await (await get("/")).text())["@graph"][0];
  assert.match(org.logo, /logo\.png$/);
});

// ---- llms.txt as an agent contract ----

test("llms.txt links every repo to the GitHub org", async () => {
  const body = await (await get("/llms.txt")).text();
  const links = [...body.matchAll(/\]\((https?:\/\/\S+?)\)/g)].map((m) => m[1]);
  const repoLinks = links.filter((l) => l.includes("github.com"));
  assert.ok(repoLinks.length >= 5, "at least five repo links");
  for (const l of repoLinks) assert.match(l, /^https:\/\/github\.com\/wdl-dev\//);
});

test("llms.txt routes agents to the docs site", async () => {
  const body = await (await get("/llms.txt")).text();
  assert.match(body, /^## Documentation$/m);
  assert.ok(body.includes("https://wdl.md/llms.txt"), "docs llms.txt link");
});

// ---- escape() ----

test("escape() encodes every HTML-significant character, single quote included", () => {
  // The single quote is the load-bearing one: encoding it keeps data from
  // closing a single-quoted attribute, so no template needs to avoid them.
  assert.equal(escape(`a&b<c>d"e'f`), "a&amp;b&lt;c&gt;d&quot;e&#39;f");
});
