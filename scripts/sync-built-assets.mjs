import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "assets");
const targetDirs = [
  path.join(rootDir, ".obsidian-build", "assets"),
  path.join(rootDir, ".obsidian-build", "_site", "assets"),
];

for (const targetDir of targetDirs) {
  await fs.mkdir(targetDir, { recursive: true });
  await syncDirectory(sourceDir, targetDir);
}

console.log(`Synced built assets to ${targetDirs.join(", ")}`);

async function syncDirectory(source, destination) {
  const [sourceEntries, destinationEntries] = await Promise.all([
    fs.readdir(source, { withFileTypes: true }),
    fs.readdir(destination, { withFileTypes: true }).catch(() => []),
  ]);

  const sourceNames = new Set(sourceEntries.map((entry) => entry.name));

  for (const entry of destinationEntries) {
    if (entry.name === "generated") {
      continue;
    }

    if (!sourceNames.has(entry.name)) {
      await fs.rm(path.join(destination, entry.name), { recursive: true, force: true });
    }
  }

  for (const entry of sourceEntries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destinationPath, { recursive: true });
      await syncDirectory(sourcePath, destinationPath);
      continue;
    }

    await fs.copyFile(sourcePath, destinationPath);
  }
}
