const chokidar = require("chokidar");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const INPUT_DIR = "/data/input";
const OUTPUT_DIR = "/data/output";

const MAX_WORKERS = 8; // number of parallel jobs

let queue = [];
let activeWorkers = 0;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processImage(file) {
  try {
    const ext = path.extname(file);
    const base = path.basename(file, ext);

    const output = path.join(OUTPUT_DIR, `${base}_100dpi${ext}`);

    console.log("Processing:", file);

    await sharp(file)
      .withMetadata({ density: 100 })
      .toFile(output);

    console.log("Saved:", output);

  } catch (err) {
    console.error("Error:", err);
  }
}

async function worker() {
  if (queue.length === 0 || activeWorkers >= MAX_WORKERS) return;

  const file = queue.shift();
  activeWorkers++;

  try {
    await processImage(file);
  } finally {
    activeWorkers--;
    worker(); // start next job
  }
}

function enqueue(file) {
  queue.push(file);
  worker();
}

console.log("Watching folder:", INPUT_DIR);

const watcher = chokidar.watch(INPUT_DIR, {
  persistent: true,
  ignoreInitial: true,
  usePolling: true,
  interval: 2000,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 500
  }
});

watcher.on("add", (file) => {
  console.log("File detected:", file);
  enqueue(file);
});