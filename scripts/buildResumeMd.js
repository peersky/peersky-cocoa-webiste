/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_FILE = path.join(ROOT, "content", "resume.mdx");
const OUT_FILE = path.join(ROOT, "public", "resume.md");

function mdxToMarkdown(src) {
  let out = src;

  // Drop MDX import statements
  out = out.replace(/^import\s.*$\n?/gm, "");

  // Flatten <HStack>…</HStack> tag clouds into a plain markdown list
  out = out.replace(/<HStack[^>]*>([\s\S]*?)<\/HStack>/g, (_m, inner) => {
    const items = [...inner.matchAll(/<Tag[^>]*>([\s\S]*?)<\/Tag>/g)].map(
      (t) => t[1].trim()
    );
    return items.map((item) => `- ${item}`).join("\n");
  });

  // Strip any remaining JSX tags, keeping their inner text
  out = out.replace(/<\/?[A-Z][a-zA-Z]*[^>]*>/g, "");

  // Collapse runs of blank lines left behind
  out = out.replace(/\n{3,}/g, "\n\n").trimStart();

  return out;
}

function main() {
  const src = fs.readFileSync(SRC_FILE, "utf8");
  const md = mdxToMarkdown(src);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, md, "utf8");
  console.log(`buildResumeMd: wrote ${path.relative(ROOT, OUT_FILE)}`);
}

main();
