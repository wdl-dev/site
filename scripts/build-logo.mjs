// Regenerates public/favicon.svg from brand/WDL-black.svg.
// Usage: node scripts/build-logo.mjs   (or: npm run build:logo)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "brand/WDL-black.svg"), "utf8");
const paths = [...source.matchAll(/<path\b[^>]*?\bd="([^"]+)"/g)].map((m) => m[1]);

if (paths.length === 0) throw new Error("no <path> elements found in brand/WDL-black.svg");

// Favicon: dark rounded square + white mark, self-contained for both themes.
const favSvg =
  `<svg viewBox="0 0 644 644" xmlns="http://www.w3.org/2000/svg">` +
  `<rect width="644" height="644" rx="140" fill="#0a0a0a"/>` +
  paths.map((d) => `<path d="${d}" fill="#fff"/>`).join("") +
  `</svg>\n`;

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public/favicon.svg"), favSvg);
console.log(`wrote public/favicon.svg (${paths.length} paths)`);
