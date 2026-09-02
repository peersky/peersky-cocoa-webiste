/* eslint-disable @typescript-eslint/no-var-requires */
// Generates public/resume.pdf from public/resume.md with a clean, single-column
// text layer (ATS/recruiter-pipeline parsable) — no browser print involved.
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ROOT = path.resolve(__dirname, "..");
const SRC_FILE = path.join(ROOT, "public", "resume.md");
const OUT_FILE = path.join(ROOT, "public", "resume.pdf");
const FONT_DIR = path.join(ROOT, "assets", "fonts");

const FONTS = {
  regular: path.join(FONT_DIR, "DejaVuSans.ttf"),
  bold: path.join(FONT_DIR, "DejaVuSans-Bold.ttf"),
  italic: path.join(FONT_DIR, "DejaVuSans-Oblique.ttf"),
  boldItalic: path.join(FONT_DIR, "DejaVuSans-BoldOblique.ttf"),
};

// --- inline markdown → styled runs -----------------------------------------

const INLINE_RE =
  /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))|(\*([^*]+)\*)|(`([^`]+)`)/;

function parseInline(text, style = {}) {
  const runs = [];
  let rest = text;
  while (rest.length) {
    const m = rest.match(INLINE_RE);
    if (!m) {
      runs.push({ text: rest, ...style });
      break;
    }
    if (m.index > 0) runs.push({ text: rest.slice(0, m.index), ...style });
    if (m[1]) {
      runs.push(...parseInline(m[2], { ...style, bold: true }));
    } else if (m[3]) {
      runs.push(...parseInline(m[4], { ...style, link: m[5] }));
    } else if (m[6]) {
      runs.push(...parseInline(m[7], { ...style, italic: true }));
    } else if (m[8]) {
      runs.push({ text: m[9], ...style, code: true });
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return runs;
}

// --- rendering --------------------------------------------------------------

function fontFor(run) {
  if (run.bold && run.italic) return "BodyBoldItalic";
  if (run.bold) return "BodyBold";
  if (run.italic) return "BodyItalic";
  return "Body";
}

function writeRuns(doc, runs, opts) {
  runs.forEach((run, i) => {
    doc.font(fontFor(run)).text(run.text, {
      ...opts,
      continued: i < runs.length - 1,
      link: run.link || undefined,
      underline: false,
    });
  });
  if (!runs.length) doc.text("", opts);
}

function ensureRoom(doc, needed) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) doc.addPage();
}

function render(md) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 54, bottom: 54, left: 54, right: 54 },
    info: {
      Title: "Resume — Tim Pečerskis",
      Author: "Tim Pečerskis",
      Subject: "Resume / CV",
      Keywords:
        "resume, cv, Tim Pecerskis, engineer, blockchain, AI, embedded, RF",
    },
  });
  doc.registerFont("Body", FONTS.regular);
  doc.registerFont("BodyBold", FONTS.bold);
  doc.registerFont("BodyItalic", FONTS.italic);
  doc.registerFont("BodyBoldItalic", FONTS.boldItalic);

  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const lines = md.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      doc.fontSize(19).fillColor("black");
      writeRuns(doc, parseInline(trimmed.slice(2), { bold: true }), { width });
      doc.moveDown(0.6);
    } else if (trimmed.startsWith("## ")) {
      ensureRoom(doc, 90);
      doc.moveDown(0.8);
      doc.fontSize(14).fillColor("black");
      writeRuns(doc, parseInline(trimmed.slice(3), { bold: true }), { width });
      doc
        .moveTo(doc.page.margins.left, doc.y + 3)
        .lineTo(doc.page.margins.left + width, doc.y + 3)
        .lineWidth(0.7)
        .strokeColor("#999999")
        .stroke();
      doc.fillColor("black").moveDown(0.5);
    } else if (trimmed.startsWith("### ")) {
      ensureRoom(doc, 70);
      doc.moveDown(0.6);
      doc.fontSize(11.5).fillColor("black");
      writeRuns(doc, parseInline(trimmed.slice(4), { bold: true }), { width });
      doc.moveDown(0.2);
    } else if (/^-\s+/.test(trimmed) || /^\s+-\s+/.test(line)) {
      const nested = /^\s+-/.test(line);
      const indent = nested ? 28 : 12;
      doc.fontSize(9.5).fillColor("black");
      const x = doc.page.margins.left + indent;
      const bulletWidth = width - indent - 10;
      ensureRoom(doc, 24);
      const y = doc.y;
      doc.font("Body").text("•", x, y, { lineBreak: false });
      doc.x = x + 10;
      doc.y = y;
      writeRuns(doc, parseInline(trimmed.replace(/^-\s+/, "")), {
        width: bulletWidth,
      });
      doc.x = doc.page.margins.left;
      doc.moveDown(0.15);
    } else {
      // paragraph (covers *date* lines too — parsed as italic inline)
      doc.fontSize(9.5).fillColor("black");
      writeRuns(doc, parseInline(trimmed), { width, lineGap: 1.5 });
      doc.moveDown(0.35);
    }
  }

  return doc;
}

function main() {
  for (const f of Object.values(FONTS)) {
    if (!fs.existsSync(f)) {
      console.error(`buildResumePdf: missing font ${f}`);
      process.exit(1);
    }
  }
  const md = fs.readFileSync(SRC_FILE, "utf8");
  const doc = render(md);
  const out = fs.createWriteStream(OUT_FILE);
  doc.pipe(out);
  doc.end();
  out.on("finish", () => {
    const kb = Math.round(fs.statSync(OUT_FILE).size / 1024);
    console.log(
      `buildResumePdf: wrote ${path.relative(ROOT, OUT_FILE)} (${kb} KB)`
    );
  });
}

main();
