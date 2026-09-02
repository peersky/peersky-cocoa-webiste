// pretext — text-measurement library. Zero dependencies. Measures line-wrap + per-word layout
// without DOM reflow, via Canvas2D measureText + Intl.Segmenter (word/grapheme segmentation, incl.
// CJK). NOT an animation engine — build motion on top of these measurements.
// Source: https://github.com/chenglou/pretext · MIT. ESM port of noolog-landing js/pretext.js.

let canvas = null;
let ctx = null;

function ensureCtx() {
  if (!ctx && typeof document !== "undefined") {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
  }
  return ctx;
}

function fontString(cfg = {}) {
  const weight = cfg.weight ? cfg.weight + " " : "";
  const size = (cfg.size || 16) + "px ";
  const family = cfg.family || "sans-serif";
  return weight + size + family;
}

function widthOf(text, font) {
  const c = ensureCtx();
  if (!c) return text.length * 8; // headless fallback
  c.font = font;
  return c.measureText(text).width;
}

function words(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "word" });
    const out = [];
    for (const s of seg.segment(text)) out.push(s.segment);
    return out;
  }
  return text.split(/(\s+)/).filter((t) => t.length);
}

// Measure wrapped layout. Returns { width, height, lineHeight, lines:[{text,width}] }.
export function measure(text, cfg = {}) {
  const font = fontString(cfg);
  const maxWidth = cfg.maxWidth || Infinity;
  const lineHeight = cfg.lineHeight || (cfg.size || 16) * 1.4;
  const toks = words(text);
  const lines = [];
  let cur = "";
  for (let i = 0; i < toks.length; i++) {
    const trial = cur + toks[i];
    if (widthOf(trial, font) > maxWidth && cur.trim() !== "") {
      lines.push({ text: cur.trim(), width: widthOf(cur.trim(), font) });
      cur = toks[i].replace(/^\s+/, "");
    } else {
      cur = trial;
    }
  }
  if (cur.trim() !== "") lines.push({ text: cur.trim(), width: widthOf(cur.trim(), font) });
  const width = lines.reduce((m, l) => Math.max(m, l.width), 0);
  return { width, height: lines.length * lineHeight, lineHeight, lines };
}

// Per-word boxes for a single line: [{text, x, width}] with cumulative x offsets.
export function layoutWords(text, cfg = {}) {
  const font = fontString(cfg);
  const space = widthOf(" ", font);
  const parts = text.split(/\s+/).filter(Boolean);
  let x = 0;
  const boxes = parts.map((w) => {
    const wWidth = widthOf(w, font);
    const box = { text: w, x, width: wWidth };
    x += wWidth + space;
    return box;
  });
  return { words: boxes, width: Math.max(0, x - space) };
}

// Per-character boxes: [{ch, x, width}] with cumulative x offsets, grapheme-aware. Used to
// place each glyph at its own depth for a 3D fly-in.
export function layoutChars(text, cfg = {}) {
  const font = fontString(cfg);
  let graphemes;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    graphemes = [];
    for (const g of seg.segment(text)) graphemes.push(g.segment);
  } else {
    graphemes = text.split("");
  }
  let x = 0;
  const chars = graphemes.map((ch) => {
    const w = widthOf(ch, font);
    const box = { ch, x, width: w };
    x += w;
    return box;
  });
  return { chars, width: x };
}
