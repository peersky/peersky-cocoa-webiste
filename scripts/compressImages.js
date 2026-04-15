// scripts/compressImages.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PUBLIC = path.join(__dirname, "..", "public");
const BUILD = path.join(__dirname, "..", "build");

(async () => {
  const files = await fs.promises.readdir(PUBLIC, { recursive: true });
  for (const file of files) {
    const src = path.join(PUBLIC, file);
    const dst = path.join(BUILD, file);
    if (/\.(png|jpe?g)$/i.test(src)) {
      await fs.promises.mkdir(path.dirname(dst), { recursive: true });
      await sharp(src)
        .resize(1920)
        .jpeg({ quality: 80 })
        .png({ quality: 90 })
        .toFile(dst);
    } else {
      await fs.promises.cp(src, dst);
    }
  }
})();
