import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const rootDir = process.cwd();
const buildDir = path.join(rootDir, ".obsidian-build");
const copiedTopLevelEntries = [
  ".github",
  "assets",
  "attachments",
  "collections",
  "pages",
  "scripts",
  "src",
  "utilities",
  "_includes",
  "_layouts",
  ".gitignore",
  "autocomplete.txt",
  "CNAME",
  "Gemfile",
  "Gemfile.lock",
  "LICENSE",
  "package-lock.json",
  "package.json",
  "postcss.config.js",
  "SearchData.json",
  "tailwind.config.js",
  "tsconfig.json",
  "vite.config.cjs",
  "_config.yml",
];

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const WIKI_LINK_RE = /(!)?\[\[([^[\]]+?)\]\]/g;
const CODE_FENCE_RE = /```[\s\S]*?```/g;

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

const RESPONSIVE_PHOTO_WIDTHS = [640, 960, 1280, 1800];
const RESPONSIVE_PHOTO_OUTPUT_DIR = "assets/generated/photos";
const responsivePhotoVariantPromises = new Map();

const SKIP_COPY_NAMES = new Set([
  ".bundle",
  ".bundle-wsl",
  ".git",
  ".jekyll-cache",
  ".obsidian-build",
  "_site",
  "node_modules",
  "vendor",
]);

const COLLECTION_ROUTES = new Map([
  ["_notes", "/note/"],
  ["_writing", "/writing/"],
  ["_topics", "/topic/"],
  ["_supersets", "/superset/"],
  ["_hidden", "/"],
]);

const inboundGraph = {};

await fs.mkdir(buildDir, { recursive: true });
await syncWorkspace(rootDir, buildDir);

const markdownFiles = await listMarkdownFiles(buildDir);
const documentIndex = buildDocumentIndex(markdownFiles);
const assetIndex = await buildAssetIndex(buildDir);
const documents = uniqueDocuments(documentIndex);

for (const document of documents) {
  const original = await fs.readFile(document.fullPath, "utf8");
  const { frontMatter, body } = splitFrontMatter(original);
  const updatedFrontMatter = ensurePermalink(frontMatter, document.url);
  const { content, outboundLinks } = await transformBody(body, documentIndex, assetIndex, {
    responsiveImages: isPhotosLayout(frontMatter),
  });
  registerBacklinks(document, outboundLinks);
  await fs.writeFile(document.fullPath, `${updatedFrontMatter}${content}`, "utf8");
}

const wikiGraphPath = path.join(buildDir, "_data", "wiki_graph.json");
await fs.mkdir(path.dirname(wikiGraphPath), { recursive: true });
await fs.writeFile(wikiGraphPath, `${JSON.stringify(inboundGraph, null, 2)}\n`, "utf8");

console.log(`Prepared Jekyll build in ${buildDir}`);

async function syncWorkspace(sourceDir, destinationDir) {
  for (const name of copiedTopLevelEntries) {
    const sourcePath = path.join(sourceDir, name);
    const destinationPath = path.join(destinationDir, name);

    try {
      const stats = await fs.stat(sourcePath);

      if (stats.isDirectory()) {
        await syncDirectory(sourcePath, destinationPath);
      } else {
        await fs.mkdir(path.dirname(destinationPath), { recursive: true });
        await fs.copyFile(sourcePath, destinationPath);
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        await fs.rm(destinationPath, { recursive: true, force: true });
        continue;
      }
      throw error;
    }
  }
}

async function syncDirectory(sourceDir, destinationDir) {
  await fs.mkdir(destinationDir, { recursive: true });
  const [sourceEntries, destinationEntries] = await Promise.all([
    fs.readdir(sourceDir, { withFileTypes: true }),
    fs.readdir(destinationDir, { withFileTypes: true }).catch(() => []),
  ]);

  const sourceNames = new Set(sourceEntries.map((entry) => entry.name));

  for (const entry of destinationEntries) {
    const destinationPath = path.join(destinationDir, entry.name);
    if (shouldPreserveGeneratedAsset(destinationPath)) {
      continue;
    }

    if (!sourceNames.has(entry.name)) {
      await fs.rm(destinationPath, { recursive: true, force: true });
    }
  }

  for (const entry of sourceEntries) {
    if (SKIP_COPY_NAMES.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await syncDirectory(sourcePath, destinationPath);
      continue;
    }

    await fs.copyFile(sourcePath, destinationPath);
  }
}

async function listMarkdownFiles(searchRoot) {
  const files = [];
  await walk(searchRoot, async (entryPath) => {
    if (entryPath.endsWith(".md")) {
      files.push(entryPath);
    }
  });
  return files;
}

async function buildAssetIndex(searchRoot) {
  const files = [];
  await walk(searchRoot, async (entryPath) => {
    const relativePath = toPosix(path.relative(searchRoot, entryPath));
    if (
      relativePath.startsWith("attachments/") ||
      relativePath.startsWith("assets/")
    ) {
      files.push(entryPath);
    }
  });

  const index = new Map();

  for (const fullPath of files) {
    const fileName = path.basename(fullPath);
    const relativePath = toPosix(path.relative(searchRoot, fullPath));
    const relativeUrl = `/${relativePath}`;
    const record = { fullPath, relativePath, relativeUrl, fileName };

    pushIndexValue(index, relativePath, record);
    pushIndexValue(index, `/${relativePath}`, record);
    pushIndexValue(index, relativePath.toLowerCase(), record);
    pushIndexValue(index, `/${relativePath.toLowerCase()}`, record);
    pushIndexValue(index, fileName, record);
    pushIndexValue(index, fileName.toLowerCase(), record);
  }

  return index;
}

function buildDocumentIndex(files) {
  const index = new Map();

  for (const fullPath of files) {
    const relativePath = toPosix(path.relative(buildDir, fullPath));
    if (!shouldIndexDocument(relativePath)) {
      continue;
    }

    const source = readFileSync(fullPath, "utf8");
    const { frontMatter } = splitFrontMatter(source);
    const frontMatterTitle = readFrontMatterValue(frontMatter, "title");
    const frontMatterPermalink = readFrontMatterValue(frontMatter, "permalink");
    const fileBaseName = path.basename(fullPath, ".md");
    const title = frontMatterTitle || fileBaseName;
    const url = normalizeUrl(
      frontMatterPermalink || buildDefaultUrl(relativePath, fileBaseName),
    );

    const record = {
      fullPath,
      relativePath,
      title,
      fileBaseName,
      url,
      date: readFrontMatterValue(frontMatter, "date") || "",
    };

    pushIndexValue(index, fileBaseName, record);
    pushIndexValue(index, fileBaseName.toLowerCase(), record);
    pushIndexValue(index, title, record);
    pushIndexValue(index, title.toLowerCase(), record);
  }

  return index;
}

function shouldIndexDocument(relativePath) {
  return (
    relativePath.startsWith("collections/") ||
    relativePath.startsWith("pages/")
  );
}

function splitFrontMatter(source) {
  const match = source.match(FRONT_MATTER_RE);
  if (!match) {
    return { frontMatter: "", body: source };
  }

  return {
    frontMatter: match[0],
    body: source.slice(match[0].length),
  };
}

function ensurePermalink(frontMatter, permalink) {
  if (!frontMatter) {
    return `---\npermalink: ${permalink}\n---\n`;
  }

  if (/^permalink:/m.test(frontMatter)) {
    return frontMatter;
  }

  return frontMatter.replace(/\r?\n---\r?\n?$/, `\npermalink: ${permalink}\n---\n`);
}

function readFrontMatterValue(frontMatter, key) {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
}

function shouldPreserveGeneratedAsset(entryPath) {
  const relativePath = toPosix(path.relative(buildDir, entryPath));
  return relativePath === "assets/generated";
}

function isPhotosLayout(frontMatter) {
  return readFrontMatterValue(frontMatter, "layout") === "photos";
}

function buildDefaultUrl(relativePath, fileBaseName) {
  const segments = relativePath.split("/");
  const collectionName = segments[1];
  const prefix = COLLECTION_ROUTES.get(collectionName);

  if (prefix) {
    return `${prefix}${slugifyTitle(fileBaseName)}`;
  }

  if (segments[0] === "pages") {
    const routeSegments = segments.slice(1);
    routeSegments[routeSegments.length - 1] = slugifyTitle(fileBaseName);
    return `/${routeSegments.join("/")}`;
  }

  return `/${slugifyTitle(fileBaseName)}`;
}

function slugifyTitle(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .replace(/_/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeUrl(url) {
  if (!url.startsWith("/")) {
    return `/${url}`;
  }
  return url;
}

async function transformBody(body, documentIndex, assetIndex, options = {}) {
  const codeBlocks = [];
  const maskedBody = body.replace(CODE_FENCE_RE, (block) => {
    const token = `@@CODE_BLOCK_${codeBlocks.length}@@`;
    codeBlocks.push(block);
    return token;
  });

  const outboundLinks = [];
  const replacements = [];
  maskedBody.replace(WIKI_LINK_RE, (match, isEmbed, rawTarget) => {
    const { target, label } = parseTarget(rawTarget);
    const assetMatch = resolveAssetIndexValue(assetIndex, target);
    const documentMatch = resolveIndexValue(documentIndex, target);

    if (isEmbed) {
      replacements.push(renderEmbed(target, label, assetMatch, options));
      return match;
    }

    if (assetMatch) {
      replacements.push(Promise.resolve(`[${escapeMarkdownLabel(label || target)}](${assetMatch.relativeUrl})`));
      return match;
    }

    if (documentMatch) {
      outboundLinks.push(documentMatch);
      replacements.push(Promise.resolve(`[${escapeMarkdownLabel(label || documentMatch.title)}](${documentMatch.url})`));
      return match;
    }

    replacements.push(Promise.resolve(`<span class="missing-link">${escapeHtml(target)}</span> - <span class="tooltip">This page hasn't been made yet</span>`));
    return match;
  });

  const resolvedReplacements = await Promise.all(replacements);
  let replacementIndex = 0;
  const transformed = maskedBody.replace(WIKI_LINK_RE, () => {
    const replacement = resolvedReplacements[replacementIndex];
    replacementIndex += 1;
    return replacement;
  });

  const restored = transformed.replace(/@@CODE_BLOCK_(\d+)@@/g, (_, index) => {
    return codeBlocks[Number(index)];
  });

  return { content: restored, outboundLinks };
}

function parseTarget(rawTarget) {
  const delimiter = rawTarget.includes("@#") ? "@#" : rawTarget.includes("|") ? "|" : "";
  if (!delimiter) {
    return { target: rawTarget.trim(), label: "" };
  }

  const [target, ...rest] = rawTarget.split(delimiter);
  return {
    target: target.trim(),
    label: rest.join(delimiter).trim(),
  };
}

async function renderEmbed(target, label, assetMatch, options = {}) {
  if (!assetMatch) {
    return `<span class="missing-link">${escapeHtml(target)}</span> - <span class="tooltip">This page hasn't been made yet</span>`;
  }

  const extension = path.extname(assetMatch.fileName).toLowerCase();
  if (extension === ".pdf") {
    const text = escapeHtml(label || target);
    return `<span class="pdf-download"><a download href="${assetMatch.relativeUrl}">${text}</a></span>`;
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    if (options.responsiveImages && isResizableImage(extension)) {
      return renderResponsiveImage(target, label, assetMatch);
    }

    const alt = escapeMarkdownLabel(label || "");
    return `![${alt}](${assetMatch.relativeUrl})`;
  }

  return `[${escapeMarkdownLabel(label || target)}](${assetMatch.relativeUrl})`;
}

function registerBacklinks(document, outboundLinks) {
  const seen = new Set();

  for (const linkedDocument of outboundLinks) {
    if (linkedDocument.url === document.url || seen.has(linkedDocument.url)) {
      continue;
    }

    seen.add(linkedDocument.url);

    if (!inboundGraph[linkedDocument.url]) {
      inboundGraph[linkedDocument.url] = [];
    }

    inboundGraph[linkedDocument.url].push({
      title: document.title,
      url: document.url,
      date: document.date,
    });
  }
}

function resolveIndexValue(index, key) {
  const direct = index.get(key);
  if (direct?.length) {
    return direct[0];
  }

  const lower = index.get(key.toLowerCase());
  if (lower?.length) {
    return lower[0];
  }

  return null;
}

function isResizableImage(extension) {
  return [".jpeg", ".jpg", ".png", ".webp"].includes(extension);
}

async function renderResponsiveImage(target, label, assetMatch) {
  const metadata = await sharp(assetMatch.fullPath).metadata();
  const sourceWidth = metadata.width || RESPONSIVE_PHOTO_WIDTHS.at(-1);
  const sourceHeight = metadata.height || "";
  const sourceHash = await hashFile(assetMatch.fullPath);
  const variantWidths = RESPONSIVE_PHOTO_WIDTHS.filter((width) => width <= sourceWidth);
  const widths = variantWidths.length > 0 ? variantWidths : [sourceWidth];
  const variants = await Promise.all(widths.map((width) => ensureResponsivePhotoVariant(assetMatch, width, sourceHash)));
  const largestVariant = variants.at(-1);
  const alt = escapeHtml(label || target);
  const widthAttr = sourceWidth ? ` width="${sourceWidth}"` : "";
  const heightAttr = sourceHeight ? ` height="${sourceHeight}"` : "";

  return `<img src="${largestVariant.relativeUrl}" srcset="${variants.map((variant) => `${variant.relativeUrl} ${variant.width}w`).join(", ")}" sizes="(max-width: 767px) calc(100vw - 2rem), min(100vw - 4rem, 68rem)" alt="${alt}" loading="lazy" decoding="async"${widthAttr}${heightAttr}>`;
}

async function ensureResponsivePhotoVariant(assetMatch, width, sourceHash) {
  const extension = ".webp";
  const sourceBaseName = path.basename(assetMatch.fileName, path.extname(assetMatch.fileName));
  const outputFileName = `${slugifyTitle(sourceBaseName)}-${sourceHash.slice(0, 10)}-${width}w${extension}`;
  const relativePath = toPosix(path.join(RESPONSIVE_PHOTO_OUTPUT_DIR, outputFileName));
  const outputPath = path.join(buildDir, relativePath);
  const cacheKey = `${outputPath}:${width}`;

  if (!responsivePhotoVariantPromises.has(cacheKey)) {
    responsivePhotoVariantPromises.set(cacheKey, writeResponsivePhotoVariant(assetMatch.fullPath, outputPath, width));
  }

  await responsivePhotoVariantPromises.get(cacheKey);

  return {
    width,
    relativeUrl: `/${relativePath}`,
  };
}

async function writeResponsivePhotoVariant(sourcePath, outputPath, width) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await fs.access(outputPath);
  } catch {
    await sharp(sourcePath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);
  }
}

async function hashFile(filePath) {
  const { createHash } = await import("node:crypto");
  const buffer = await fs.readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

function resolveAssetIndexValue(index, key) {
  const normalized = normalizeAssetTarget(key);
  const exactMatch = resolveIndexValue(index, normalized);
  if (exactMatch) {
    return exactMatch;
  }

  const fileName = path.posix.basename(normalized);
  if (fileName !== normalized) {
    return resolveIndexValue(index, fileName);
  }

  return null;
}

function normalizeAssetTarget(value) {
  return toPosix(value.trim())
    .replace(/^\/+/, "")
    .replace(/^\.\//, "");
}

function pushIndexValue(index, key, value) {
  if (!key) {
    return;
  }

  if (!index.has(key)) {
    index.set(key, []);
  }

  index.get(key).push(value);
}

function uniqueDocuments(index) {
  const records = [];
  const seenPaths = new Set();

  for (const values of index.values()) {
    for (const value of values) {
      if (seenPaths.has(value.fullPath)) {
        continue;
      }
      seenPaths.add(value.fullPath);
      records.push(value);
    }
  }

  return records;
}

async function walk(currentDir, visitor) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_COPY_NAMES.has(entry.name)) {
        continue;
      }
      await walk(fullPath, visitor);
      continue;
    }

    await visitor(fullPath);
  }
}

function escapeMarkdownLabel(value) {
  return value.replace(/([\[\]])/g, "\\$1");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}
