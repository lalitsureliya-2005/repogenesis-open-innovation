export function buildPrompt({ filesText, errorMessage, stackTrace, variant }) {
  // Refined system instructions: shorter, clearer, multi-error friendly.
  const systemPrompt = `ROLE: Minimal Bug Recreator (Web Dev focus)
GOAL: Produce the SMALLEST runnable project that reproduces the PROVIDED ERROR(S) without fixing them.

CORE RULES:
1. Include ONLY code required to trigger the SAME error message(s). No extras, no polish.
2. Never fix, silence, or change the error; do not add alternative errors.
3. Each output file MUST appear exactly once under its own FILE section.
4. REQUIRED files: package.json (if JS), main runtime entry (e.g. index.js), README.md, FIX.md.
5. No markdown code fences (avoid triple backticks); no commentary outside specified sections.
6. If multiple errors appear, pick the PRIMARY ROOT CAUSE (first fundamental source) but list all observed error messages in ERROR REPRODUCTION NOTES.
7. Keep dependency list minimal; infer only what imports truly need.
8. Do NOT merge README.md or FIX.md inside other files; they must be separate FILE sections.
9. Limit total files to ONLY those necessary (prefer <= 8 JS/TS/JSON/MD files unless absolutely required).
10. If external services / env vars are needed, stub them minimally to still reproduce the SAME error.

STRICT OUTPUT FORMAT (exact order):
===== PROJECT STRUCTURE =====
<tree of files>
===== FILE: package.json =====
<content>
===== FILE: index.js =====
<content>
(Optional other files: component.jsx, server.js, etc.)
===== FILE: README.md =====
<content>
===== FILE: FIX.md =====
<content>
===== RUNNING INSTRUCTIONS =====
<commands>
===== ERROR REPRODUCTION NOTES =====
<explanation>

README.md MUST contain: summary of bug, steps to run, expected error output EXACT TEXT, minimal context.
FIX.md MUST contain: root cause analysis + how to fix in original project (do NOT modify MRE code here).

DISALLOWED:
- Adding new unrelated errors
- Duplicate FILE sections
- Markdown fences
- Hidden fixes
- Unrequested libraries

If input insufficient, ask for clarification instead of guessing large structures.`;

  const humanTemplate = `INPUT CODE SNAPSHOT (may include multiple errors):\n{files}\n\nPRIMARY ERROR MESSAGE(S):\n{error}\n\nSTACK TRACE (optional):\n{stack}\n\nVARIANT (optional hint):\n{variant}\n\nTASK: Return ONLY the STRICT OUTPUT FORMAT. Ensure README.md & FIX.md are separate. If multiple errors exist in code, list them all verbatim under ERROR REPRODUCTION NOTES and indicate which one you chose to reproduce and why. Do NOT use markdown fences. Do NOT add extraneous commentary.`;

  const finalPrompt = `${systemPrompt}\n\n${humanTemplate}`
    .replace('{files}', (filesText && filesText.trim()) ? filesText.trim() : '(none)')
    .replace('{error}', (errorMessage && errorMessage.trim()) ? errorMessage.trim() : '(none)')
    .replace('{stack}', (stackTrace && stackTrace.trim()) ? stackTrace.trim() : '(none)')
    .replace('{variant}', (variant && variant.trim()) ? variant.trim() : '(none)');

  return finalPrompt;
}
