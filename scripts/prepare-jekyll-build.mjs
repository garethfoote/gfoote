import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

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
  const { content, outboundLinks } = transformBody(body, documentIndex, assetIndex);
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
    if (!sourceNames.has(entry.name)) {
      await fs.rm(path.join(destinationDir, entry.name), { recursive: true, force: true });
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
    const relativeUrl = `/${toPosix(path.relative(searchRoot, fullPath))}`;

    pushIndexValue(index, fileName, { fullPath, relativeUrl, fileName });
    pushIndexValue(index, fileName.toLowerCase(), { fullPath, relativeUrl, fileName });
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

function transformBody(body, documentIndex, assetIndex) {
  const codeBlocks = [];
  const maskedBody = body.replace(CODE_FENCE_RE, (block) => {
    const token = `@@CODE_BLOCK_${codeBlocks.length}@@`;
    codeBlocks.push(block);
    return token;
  });

  const outboundLinks = [];
  const transformed = maskedBody.replace(WIKI_LINK_RE, (_, isEmbed, rawTarget) => {
    const { target, label } = parseTarget(rawTarget);
    const assetMatch = resolveIndexValue(assetIndex, target);
    const documentMatch = resolveIndexValue(documentIndex, target);

    if (isEmbed) {
      return renderEmbed(target, label, assetMatch);
    }

    if (assetMatch) {
      return `[${escapeMarkdownLabel(label || target)}](${assetMatch.relativeUrl})`;
    }

    if (documentMatch) {
      outboundLinks.push(documentMatch);
      return `[${escapeMarkdownLabel(label || documentMatch.title)}](${documentMatch.url})`;
    }

    return `<span class="missing-link">${escapeHtml(target)}</span> - <span class="tooltip">This page hasn't been made yet</span>`;
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

function renderEmbed(target, label, assetMatch) {
  if (!assetMatch) {
    return `<span class="missing-link">${escapeHtml(target)}</span> - <span class="tooltip">This page hasn't been made yet</span>`;
  }

  const extension = path.extname(assetMatch.fileName).toLowerCase();
  if (extension === ".pdf") {
    const text = escapeHtml(label || target);
    return `<span class="pdf-download"><a download href="${assetMatch.relativeUrl}">${text}</a></span>`;
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
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
