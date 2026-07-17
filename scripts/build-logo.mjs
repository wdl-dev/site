// Regenerates the public/ brand outputs (hero-w.svg, favicon.svg, logo.png,
// og.png) from brand/WDL-mark.svg.
// Usage: node scripts/build-logo.mjs   (or: npm run build:logo)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "brand/WDL-mark.svg"), "utf8");
const paths = [...source.matchAll(/<path\b[^>]*?\bd="([^"]+)"/g)].map((m) => m[1]);

if (paths.length === 0) throw new Error("no <path> elements found in brand/WDL-mark.svg");

const mark = (fill) => paths.map((d) => `<path d="${d}" fill="${fill}"/>`).join("");
// The base silhouette is the only path containing the W's far-left edge. Match
// that geometry explicitly so reordering the source paths cannot change output.
const heroWPath = paths.find((d) => d.includes("L68 318.175"));
if (!heroWPath) throw new Error("W base path not found in brand/WDL-mark.svg");

mkdirSync(join(root, "public"), { recursive: true });

// Favicon: dark rounded square + white mark, self-contained for both themes.
const favSvg =
  `<svg viewBox="0 0 644 644" xmlns="http://www.w3.org/2000/svg">` +
  `<rect width="644" height="644" rx="140" fill="#0a0a0a"/>` +
  mark("#fff") +
  `</svg>\n`;
writeFileSync(join(root, "public/favicon.svg"), favSvg);
console.log(`wrote public/favicon.svg (${paths.length} paths)`);

// JSON-LD logo — Google's logo rich result prefers bitmaps over SVG.
await sharp(Buffer.from(favSvg)).resize(512, 512).png().toFile(join(root, "public/logo.png"));
console.log("wrote public/logo.png (512×512)");

// The mark's paths sit inset in the 644×644 brand box; measure the visible
// bbox so layout uses the ink, not the box.
const probe = await sharp(
  Buffer.from(
    `<svg width="644" height="644" viewBox="0 0 644 644" xmlns="http://www.w3.org/2000/svg">${mark("#fff")}</svg>`,
  ),
)
  .png()
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });
const box = {
  x: -probe.info.trimOffsetLeft,
  y: -probe.info.trimOffsetTop,
  w: probe.info.width,
  h: probe.info.height,
};

// Deliberate lower-left crop in the canonical 644×644 coordinate system.
// The SVG viewport performs the crop, so no clip path or transparent framing is needed.
const heroWBox = { x: 68, y: 318, w: 265, h: 176 };
const heroWSvg =
  `<svg width="${heroWBox.w}" height="${heroWBox.h}" ` +
  `viewBox="${heroWBox.x} ${heroWBox.y} ${heroWBox.w} ${heroWBox.h}" ` +
  `xmlns="http://www.w3.org/2000/svg"><path d="${heroWPath}" fill="#000"/></svg>\n`;
writeFileSync(join(root, "public/hero-w.svg"), heroWSvg);
console.log(`wrote public/hero-w.svg (${heroWBox.w}×${heroWBox.h})`);

// OG card text is rasterized with the build machine's DejaVu fonts (standard
// on Linux); the PNG is committed, so only regeneration needs them.
// Keep all meaningful content inside the centered 630×630 crop used by
// small social thumbnails, while retaining the standard 1200×630 OG canvas.
const MARK_W = 260;
const s = MARK_W / box.w;
const ogSvg =
  `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">` +
  `<rect width="1200" height="630" fill="#0a0a0a"/>` +
  `<g transform="translate(${600 - MARK_W / 2 - box.x * s} ${110 - box.y * s}) scale(${s})">` +
  mark("#fff") +
  `</g>` +
  `<text x="600" y="400" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="64" letter-spacing="-2" fill="#e9e9e3">Workers, on` +
  `<tspan x="600" dy="78">your own metal.</tspan></text>` +
  `</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile(join(root, "public/og.png"));
console.log("wrote public/og.png (1200×630)");
