import { parseMREOutput } from './workflow.js';
import fs from 'fs';

// Simulated malformed output where README.md & FIX.md are embedded inside styles.css
const simulated = `===== PROJECT STRUCTURE =====\n/mre\n  package.json\n  styles.css\n\n===== FILE: package.json =====\n{\n  \"name\": \"mre\"\n}\n\n===== FILE: styles.css =====\nbody { color: red; }\n===== FILE: README.md =====\n# Bug Repro\nSteps here.\n===== FILE: FIX.md =====\nRoot cause and fix guidance.\n`; 

const parsed = parseMREOutput(simulated);
console.log('Parsed files:', parsed.files.map(f => f.filename));
for (const f of parsed.files) {
  console.log(`--- ${f.filename} ---\n${f.content.substring(0,80)}\n`);
}
