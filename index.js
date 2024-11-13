import axios from "axios";
import fs from "fs";
import path from "path";
import { readFile } from "node:fs/promises";
const data = JSON.parse(
  await readFile(new URL("./data.json", import.meta.url))
);

function sanitizeFileName(name) {
  return name.replace(/[\/:*?"<>|]/g, "_");
}

async function downloadImage(item) {
  console.log(`Downloading ${item.name} image`);
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const filename = path.join(outputDir, `${sanitizeFileName(item.name)}.jpeg`);

  try {
    const response = await axios({
      url: item.image,
      method: "GET",
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filename);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Failed to download image for ${item.name}:`, error);
  }
}

(async () => {
  process.stdout.write("\x1Bc");
  console.log("Start downloading...");
  for (const item of data) {
    await downloadImage(item);
  }
})();
