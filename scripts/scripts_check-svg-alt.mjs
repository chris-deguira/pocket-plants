import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const IGNORED = new Set([".git", ".github", "node_modules"]);
const problems = [];

function* svgFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED.has(entry.name)) yield* svgFiles(join(dir, entry.name));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
      yield join(dir, entry.name);
    }
  }
}

function hasAccessibleName(source) {
  const svgTag = source.match(/<svg\b[^>]*>/i)?.[0];
  if (!svgTag) return false;

  const ariaLabel = svgTag.match(/\baria-label\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.[1] ?? svgTag.match(/\baria-label\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.[2];
  if (ariaLabel?.trim()) return true;

  const title = source.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1];
  if (title?.replace(/<[^>]*>/g, "").trim()) return true;

  const labelledBy = svgTag.match(/\baria-labelledby\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.[1] ?? svgTag.match(/\baria-labelledby\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.[2];
  if (!labelledBy) return false;

  return labelledBy
    .split(/\s+/)
    .some((id) => {
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = source.match(new RegExp(`<[^>]+\\s\\bid\\s*=\\s*["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, "i"));
      const text = match?.[1]?.replace(/<[^>]*>/g, "").trim();
      return Boolean(text);
    });
}

for (const file of svgFiles(root)) {
  const source = readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  if (!hasAccessibleName(source)) {
    problems.push(`${relative(root, file)}: missing accessible name (add aria-label, <title>, or aria-labelledby)`);
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} SVG file${problems.length === 1 ? "" : "s"} without an accessible name:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`Checked ${[...svgFiles(root)].length} SVG files: all have accessible names.`);