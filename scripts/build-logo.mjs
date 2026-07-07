// Regenerates public/favicon.svg and public/og.png from brand/WDL-black.svg.
// Usage: node scripts/build-logo.mjs   (or: npm run build:logo)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "brand/WDL-black.svg"), "utf8");
const paths = [...source.matchAll(/<path\b[^>]*?\bd="([^"]+)"/g)].map((m) => m[1]);

if (paths.length === 0) throw new Error("no <path> elements found in brand/WDL-black.svg");

const mark = (fill) => paths.map((d) => `<path d="${d}" fill="${fill}"/>`).join("");

mkdirSync(join(root, "public"), { recursive: true });

// Favicon: dark rounded square + white mark, self-contained for both themes.
const favSvg =
  `<svg viewBox="0 0 644 644" xmlns="http://www.w3.org/2000/svg">` +
  `<rect width="644" height="644" rx="140" fill="#0a0a0a"/>` +
  mark("#fff") +
  `</svg>\n`;
writeFileSync(join(root, "public/favicon.svg"), favSvg);
console.log(`wrote public/favicon.svg (${paths.length} paths)`);

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

// OG card text is rasterized with the build machine's DejaVu fonts (standard
// on Linux); the PNG is committed, so only regeneration needs them.
const MARK_W = 250; // visible mark width in the 1200×630 canvas
const s = MARK_W / box.w;
const ogSvg =
  `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">` +
  `<rect width="1200" height="630" fill="#0a0a0a"/>` +
  `<g transform="translate(${80 - box.x * s} ${(630 - box.h * s) / 2 - box.y * s}) scale(${s})">` +
  mark("#fff") +
  `</g>` +
  `<text x="390" y="228" font-family="DejaVu Sans Mono" font-size="26" letter-spacing="5" fill="#8a8f99">SELF-HOSTED WORKERS PLATFORM</text>` +
  `<text x="386" y="320" font-family="DejaVu Sans" font-weight="bold" font-size="72" letter-spacing="-2" fill="#e9e9e3">Workers, on your` +
  `<tspan x="386" dy="86">own metal.</tspan></text>` +
  `</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile(join(root, "public/og.png"));
console.log("wrote public/og.png (1200×630)");
