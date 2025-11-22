import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import Archiver from 'archiver';
import { PassThrough } from 'stream';

const TEXT_EXTS = new Set([
  '.js','.jsx','.ts','.tsx','.json','.cjs','.mjs','.html','.css',
  '.md','.txt','.yml','.yaml','.py','.java','.xml','.sh','.env','.gitignore'
]);

const IGNORE_DIRS = new Set(['node_modules','.git','.next','dist','build','.turbo','.parcel-cache','coverage']);

export async function extractZipToText(zipPath, maxBytes = 200 * 1024) {
  const dir = path.join(path.dirname(zipPath), 'unzipped', Date.now().toString());
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: dir })).promise();

  let output = '';
  const walk = async (p) => {
    const entries = await fs.promises.readdir(p, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(p, ent.name);
      const rel = path.relative(dir, full);
      if (ent.isDirectory()) {
        if (IGNORE_DIRS.has(ent.name)) continue;
        await walk(full);
      } else {
        const ext = path.extname(ent.name).toLowerCase();
        if (!TEXT_EXTS.has(ext)) continue;
        const stat = await fs.promises.stat(full);
        if (stat.size > maxBytes) continue;
        const content = await fs.promises.readFile(full, 'utf8');
        output += `\n\n// FILE: ${rel}\n${content}\n`;
      }
    }
  };
  await walk(dir);
  return output.trim();
}

export function parseMREOutput(text) {
  const fileBlocks = [];
  const filePattern = /===== FILE:\s*([^\n]+)\s*=====([\s\S]*?)(?=(?:\n===== FILE:|\n===== RUNNING INSTRUCTIONS =====|\n===== ERROR REPRODUCTION NOTES =====|$))/g;
  let match;
  while ((match = filePattern.exec(text)) !== null) {
    const filename = match[1].trim();
    const rawContent = match[2];
    const content = rawContent.replace(/^(\r?\n)/, '');
    fileBlocks.push({ filename, content });
  }

  // Heuristic: if README.md or FIX.md content appears concatenated inside another file (e.g., styles.css), extract embedded markers.
  const embeddedPattern = /===== FILE:\s*([^\n]+)\s*=====/g;
  const expanded = [];
  for (const fb of fileBlocks) {
    const inner = fb.content;
    if (embeddedPattern.test(inner)) {
      // Re-run parse on the content itself to split embedded files.
      const innerBlocks = [];
      embeddedPattern.lastIndex = 0;
      const subPattern = /===== FILE:\s*([^\n]+)\s*=====([\s\S]*?)(?=(?:\n===== FILE:|$))/g;
      let m;
      while ((m = subPattern.exec(inner)) !== null) {
        innerBlocks.push({ filename: m[1].trim(), content: m[2].replace(/^(\r?\n)/, '') });
      }
      // If we successfully extracted >0, skip original merged block.
      if (innerBlocks.length) {
        expanded.push(...innerBlocks);
        continue;
      }
    }
    expanded.push(fb);
  }

  return { files: expanded };
}

// Parse the PROJECT STRUCTURE section to obtain an allowed file set.
export function parseProjectStructure(text) {
  const structureMatch = text.match(/===== PROJECT STRUCTURE =====\n([\s\S]*?)(?=\n===== FILE:|$)/);
  if (!structureMatch) return [];
  const lines = structureMatch[1].split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const files = new Set();
  for (const line of lines) {
    // Normalize tree lines like 'package.json', 'index.js', or '/mre', 'utils/' etc.
    if (/^[A-Za-z0-9_.-]+\.(js|jsx|ts|tsx|json|md|css|html|py|java|sh|txt)$/i.test(line)) {
      files.add(line);
    }
  }
  return Array.from(files);
}

// Normalize files list against declared structure, ensure README.md & FIX.md standalone, strip system prompt leaks.
export function normalizeMREFiles(allFiles, declaredFiles, originalError) {
  const required = new Set(['README.md','FIX.md']);
  const declared = new Set(declaredFiles);
  const cleaned = [];
  for (const f of allFiles) {
    // Keep if declared or required.
    if (declared.size && !declared.has(f.filename) && !required.has(f.filename)) continue;
    let content = f.content;
    // Remove accidental re-inclusion of system prompt heading.
    content = content.replace(/Minimal Bug Recreator – WebDev Focus[\s\S]*?Your single mission:[\s\S]*?\n?/,'').trim();
    // Ensure original error is referenced in README.md if missing.
    if (f.filename === 'README.md' && originalError && !content.includes(originalError)) {
      content += `\n\n---\nOriginal Error Message:\n${originalError}`;
    }
    cleaned.push({ filename: f.filename, content });
  }
  // Guarantee required files.
  if (!cleaned.some(f => f.filename === 'README.md')) {
    cleaned.push({ filename: 'README.md', content: originalError ? `Minimal Repro README\n\nOriginal Error:\n${originalError}` : 'Minimal Repro README' });
  }
  if (!cleaned.some(f => f.filename === 'FIX.md')) {
    cleaned.push({ filename: 'FIX.md', content: 'FIX.md missing from model output. Add root cause explanation here.' });
  }
  return cleaned;
}

export async function writeMREToDisk(files, outDir) {
  await fs.promises.rm(outDir, { recursive: true, force: true });
  await fs.promises.mkdir(outDir, { recursive: true });
  for (const f of files) {
    const full = path.join(outDir, f.filename);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, f.content, 'utf8');
  }
}

export async function zipDirToBuffer(dirPath) {
  return new Promise((resolve, reject) => {
    try {
      const archive = Archiver('zip', { zlib: { level: 9 } });
      const stream = new PassThrough();
      const chunks = [];

      stream.on('data', (d) => chunks.push(d));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));

      archive.on('error', reject);
      archive.on('warning', (warn) => {
        if (warn.code === 'ENOENT') return; // ignore missing file warnings
        reject(warn);
      });
      archive.on('finish', () => {
        // 'finish' fires when all data has been flushed to stream
      });

      archive.pipe(stream);
      archive.directory(dirPath, false);
      archive.finalize();
    } catch (e) {
      reject(e);
    }
  });
}

// Simple self-test utility (manual invocation) to verify zipping works.
// Not used in production flow.
export async function __selfTestZip() {
  const tmpRoot = path.join(process.cwd(), 'zip-selftest');
  await fs.promises.rm(tmpRoot, { recursive: true, force: true });
  await fs.promises.mkdir(tmpRoot, { recursive: true });
  await fs.promises.writeFile(path.join(tmpRoot, 'example.txt'), 'Hello Zip Test', 'utf8');
  const buf = await zipDirToBuffer(tmpRoot);
  return { size: buf.length };
}
