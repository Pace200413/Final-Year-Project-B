const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./public/360-original";
const outputDir = "./public/360";

// Make sure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir);

async function run() {
  for (const file of files) {

    // Only process JPG / JPEG
    if (!file.toLowerCase().endsWith(".jpg") && !file.toLowerCase().endsWith(".jpeg")) {
      continue;
    }

    const inputFile = path.join(inputDir, file);
    const outputFile = path.join(outputDir, file);

    // Skip if already resized
    if (fs.existsSync(outputFile)) {
      console.log("⏭ Skipping (already resized):", file);
      continue;
    }

    console.log("🔧 Compressing:", file);

    await sharp(inputFile)
      .resize(4096, 2048)                 // 360 image resolution
      .jpeg({ quality: 70, mozjpeg: true }) // compress
      .toFile(outputFile);
  }

  console.log("✅ Done compressing images!");
}

run().catch((err) => {
  console.error("❌ Error:", err);
});