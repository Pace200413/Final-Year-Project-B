const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputDir = "./public/images360_original";
const outputDir = "./public/images360";

// Make sure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir);

async function run() {
  for (const file of files) {
    if (!file.toLowerCase().endsWith(".jpg") && !file.toLowerCase().endsWith(".jpeg")) {
      continue;
    }

    const inputFile = path.join(inputDir, file);
    const outputFile = path.join(outputDir, file);

    console.log("Compressing:", file);

    await sharp(inputFile)
      .resize(4096, 2048, { fit: "cover" }) // you can change size
      .jpeg({ quality: 70 })                // 60–80 is okay
      .toFile(outputFile);
  }

  console.log("✅ Done compressing all images!");
}

run().catch((err) => {
  console.error("❌ Error:", err);
});
