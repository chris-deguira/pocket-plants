// Checks every HTML page in the repository for common problems.
// Run with: node scripts/check-site.mjs
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = process.cwd();
const IGNORED = new Set([".git", ".github", "node_modules"]);
const problems = [];

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* htmlFiles(full);
    } else if (entry.endsWith(".html")) {
      yield full;
    }
  }
}

function report(file, message) {
  problems.push(`${relative(root, file)}: ${message}`);
}

function checkLink(file, source, value) {
  if (/^(https?:|mailto:|tel:|data:|\/\/)/i.test(value)) return;

  if (value.startsWith("#")) {
    const id = value.slice(1);
    if (id && !new RegExp(`\\sid\\s*=\\s*["']${id}["']`).test(source)) {
      report(file, `link to missing anchor "${value}"`);
    }
    return;
  }

  if (value.startsWith("/")) {
    report(file, `absolute link "${value}" will break on a project site; use a relative link`);
    return;
  }

  const path = value.split("#")[0].split("?")[0];
  if (path === "") return;
  let target = resolve(dirname(file), path);
  if (path.endsWith("/")) target = join(target, "index.html");
  if (!existsSync(target)) {
    report(file, `broken link "${value}"`);
  }
}

let pages = 0;
for (const file of htmlFiles(root)) {
  pages += 1;
  const source = readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");

  if (!/<html[^>]*\slang\s*=/i.test(source)) report(file, "missing lang attribute on <html>");
  if (!/<title>\s*\S[\s\S]*?<\/title>/i.test(source)) report(file, "missing or empty <title>");

  for (const tag of source.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\salt\s*=/i.test(tag)) report(file, `image without alt text: ${tag.slice(0, 70)}`);
  }

  for (const match of source.matchAll(/\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    checkLink(file, source, match[1] ?? match[2]);
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`Checked ${pages} pages: no problems found.`);
