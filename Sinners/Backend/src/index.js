import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildPrompt } from './utils/prompt.js';
import { extractZipToText, writeMREToDisk, zipDirToBuffer, parseMREOutput, parseProjectStructure, normalizeMREFiles } from './utils/workflow.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/generate', upload.single('projectZip'), async (req, res) => {
  try {
    const errorMessage = req.body.errorMessage || '';
    const codeSnippet = req.body.codeSnippet || '';
    const stackTrace = req.body.stackTrace || '';
    const variant = req.body.variant || '';
    const uploadedZipPath = req.file ? req.file.path : null;

    let filesText = '';
    if (uploadedZipPath) {
      filesText = await extractZipToText(uploadedZipPath);
    } else {
      // Fallback: include the single code snippet as a file block
      filesText = `//user-snippet.js\n${codeSnippet}`;
    }

    const prompt = buildPrompt({ filesText, errorMessage, stackTrace, variant });

    // Call local Ollama
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate';
    const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';

    const resp = await axios.post(ollamaUrl, {
      model,
      prompt,
      stream: false
    }, { timeout: 1000 * 60 * 5 });

    const output = resp.data && (resp.data.response || resp.data);
    let text = typeof output === 'string' ? output : JSON.stringify(output);
    if (!text || !text.trim()) {
      console.warn('[MBR] Model returned empty response; injecting diagnostic placeholder.');
      text = '===== PROJECT STRUCTURE =====\n(no content – model empty)\n\n===== FILE: README.md =====\nModel responded with empty payload. Check model availability, prompt length, or timeout.';
    }

    const parsed = parseMREOutput(text);
    const declared = parseProjectStructure(text);
    let filesToWrite = normalizeMREFiles(parsed.files, declared, errorMessage);
    if (!filesToWrite.length) {
      console.warn('[MBR] No FILE sections parsed – creating fallback RAW_MODEL_OUTPUT.txt');
      filesToWrite = [
        { filename: 'RAW_MODEL_OUTPUT.txt', content: text },
        { filename: 'README.md', content: 'The model response did not include any "===== FILE:" sections. Raw output has been saved to RAW_MODEL_OUTPUT.txt for inspection.' }
      ];
    }
    console.log(`[MBR] Parsed/using ${filesToWrite.length} file(s) for MRE.`);

    const outDir = path.join(__dirname, '..', 'mre-output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    await writeMREToDisk(filesToWrite, outDir);
    const zipBuffer = await zipDirToBuffer(outDir);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=mre.zip');
    res.send(zipBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Failed to generate MRE' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[MBR] Backend running on http://localhost:${PORT}`));
