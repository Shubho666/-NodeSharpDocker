const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error("Usage: node setDpi.js <image-path>");
    process.exit(1);
  }

  if (!fs.existsSync(input)) {
    console.error("File not found:", input);
    process.exit(1);
  }

  const ext = path.extname(input);
  const base = path.basename(input, ext);
  const output = path.join(path.dirname(input), `${base}_300dpi${ext}`);

  await sharp(input)
    .withMetadata({ density: 300 })
    .toFile(output);

  console.log("Output:", output);
}

main();