import { parseMREOutput, parseProjectStructure, normalizeMREFiles } from './workflow.js';

const messy = `===== PROJECT STRUCTURE =====\n/mre\n  package.json\n  index.js\n  README.md\n  FIX.md\n\n===== FILE: index.js =====\nconsole.log('broken start');\n===== FILE: README.md =====\n# Repro\nSteps\n===== FILE: FIX.md =====\nFix details\n===== FILE: styles.css =====\nbody{color:red;}===== FILE: README.md =====\n# Nested README\n===== FILE: FIX.md =====\nNested fix\n`;

const parsed = parseMREOutput(messy);
const declared = parseProjectStructure(messy);
const normalized = normalizeMREFiles(parsed.files, declared, 'TypeError: x is not a function');
console.log('Declared structure:', declared);
console.log('Parsed files:', parsed.files.map(f=>f.filename));
console.log('Normalized files:', normalized.map(f=>f.filename));
for (const f of normalized) {
  console.log(`--- ${f.filename} ---\n${f.content.substring(0,120)}\n`);
}
