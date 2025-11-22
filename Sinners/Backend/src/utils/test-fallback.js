import fs from 'fs';
import path from 'path';
import { parseMREOutput, writeMREToDisk, zipDirToBuffer } from './workflow.js';

// Simulate a model response that FAILS to include any FILE sections.
const mockModelOutput = `===== PROJECT STRUCTURE =====\n(no files produced)\n\n===== RUNNING INSTRUCTIONS =====\nnode index.js\n\n===== ERROR REPRODUCTION NOTES =====\nNo files were produced.`;

async function main() {
  const parsed = parseMREOutput(mockModelOutput);
  let filesToWrite = parsed.files;
  if (!filesToWrite.length) {
    console.warn('[fallback-test] No FILE sections parsed – creating fallback files');
    filesToWrite = [
      { filename: 'RAW_MODEL_OUTPUT.txt', content: mockModelOutput },
      { filename: 'README.md', content: 'Fallback engaged: original model output had no FILE sections.' }
    ];
  }
  console.log(`[fallback-test] Using ${filesToWrite.length} file(s).`);

  const outDir = path.join(process.cwd(), 'mre-output-fallback-test');
  await fs.promises.rm(outDir, { recursive: true, force: true });
  await fs.promises.mkdir(outDir, { recursive: true });
  await writeMREToDisk(filesToWrite, outDir);
  const zipBuffer = await zipDirToBuffer(outDir);
  console.log('[fallback-test] Zip size bytes:', zipBuffer.length);
  const written = filesToWrite.map(f => f.filename).join(', ');
  console.log('[fallback-test] Files in zip:', written);
}

main().catch(e => { console.error(e); process.exit(1); });
