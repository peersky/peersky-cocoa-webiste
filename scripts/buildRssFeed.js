/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://peersky.xyz";
const FEED_TITLE = "Peersky — Writing";
const FEED_DESCRIPTION =
  "Notes, essays and longer-form pieces on protocols, hardware, governance and the quieter side of building. By Tims Pečerskis.";
const FEED_LANGUAGE = "en";
const AUTHOR_EMAIL = "t@peersky.xyz";
const AUTHOR_NAME = "Tims Pečerskis";

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const INDEX_FILE = path.join(CONTENT_DIR, "index.tsx");
const OUT_FILE = path.join(ROOT, "public", "feed.xml");

function escapeXml(input) {
  if (input === undefined || input === null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getActivePostFiles() {
  const src = fs.readFileSync(INDEX_FILE, "utf8");

  const importRegex =
    /^\s*import\s+\*\s+as\s+(\w+)\s+from\s+"\.\/([^"]+\.mdx)";/gm;
  const aliasToFile = new Map();
  let match;
  while ((match = importRegex.exec(src)) !== null) {
    aliasToFile.set(match[1], match[2]);
  }

  const exportBlockMatch = src.match(/export\s*\{([\s\S]*?)\}\s*;/);
  if (!exportBlockMatch) return [];
  const exportBlock = exportBlockMatch[1];

  const activeAliases = exportBlock
    .split(/\r?\n/)
    .map((line) => line.split("//")[0].trim().replace(/,$/, "").trim())
    .filter(Boolean);

  return activeAliases
    .map((alias) => ({ alias, file: aliasToFile.get(alias) }))
    .filter((entry) => entry.file);
}

function parseMeta(mdxPath) {
  const src = fs.readFileSync(mdxPath, "utf8");
  const m = src.match(
    /export\s+const\s+meta\s*=\s*(\{[\s\S]*?\});/m
  );
  if (!m) return null;
  const objectLiteral = m[1];
  try {
    const meta = new Function(`return (${objectLiteral});`)();
    return meta;
  } catch (err) {
    console.warn(`buildRssFeed: failed to parse meta in ${mdxPath}: ${err.message}`);
    return null;
  }
}

function toRfc822(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return new Date(0).toUTCString();
  return d.toUTCString();
}

function buildItem(meta) {
  const url = `${SITE_URL}/blog/${meta.path}`;
  const pubDate = toRfc822(meta.date);
  const categories = (meta.tags || [])
    .map((t) => `    <category>${escapeXml(t)}</category>`)
    .join("\n");
  const enclosure = meta.image
    ? `    <enclosure url="${escapeXml(SITE_URL + meta.image)}" type="image/png" />`
    : "";
  return `  <item>
    <title>${escapeXml(meta.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(meta.description || "")}</description>
    <author>${escapeXml(`${AUTHOR_EMAIL} (${meta.author || AUTHOR_NAME})`)}</author>
${categories}
${enclosure}
  </item>`.replace(/^\s*\n/gm, "");
}

function main() {
  const active = getActivePostFiles();
  const posts = active
    .map(({ file }) => {
      const meta = parseMeta(path.join(CONTENT_DIR, file));
      return meta;
    })
    .filter((meta) => meta && meta.title && meta.path && meta.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const lastBuildDate = new Date().toUTCString();
  const latestPubDate = posts.length ? toRfc822(posts[0].date) : lastBuildDate;
  const items = posts.map(buildItem).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(FEED_TITLE)}</title>
  <link>${SITE_URL}/blog</link>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  <description>${escapeXml(FEED_DESCRIPTION)}</description>
  <language>${FEED_LANGUAGE}</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <pubDate>${latestPubDate}</pubDate>
  <managingEditor>${escapeXml(`${AUTHOR_EMAIL} (${AUTHOR_NAME})`)}</managingEditor>
  <webMaster>${escapeXml(`${AUTHOR_EMAIL} (${AUTHOR_NAME})`)}</webMaster>
${items}
</channel>
</rss>
`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, xml, "utf8");
  console.log(
    `buildRssFeed: wrote ${posts.length} item(s) → ${path.relative(ROOT, OUT_FILE)}`
  );
}

main();
