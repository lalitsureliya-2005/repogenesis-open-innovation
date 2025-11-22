# Minimal Bug Recreator (Working Example)

End-to-end example that:
- Accepts error + snippet + optional stack + optional ZIP
- Converts ZIP contents to text
- Builds a strict prompt for your local Ollama (llama3.1:8b)
- Parses the MRE output
- Writes files and returns a ready-to-run ZIP to the frontend

## Quick start

### 1) Backend
```bash
cd Backend
cp .env.example .env
# edit .env if your Ollama host/port differ
npm install
npm run dev
```

### 2) Frontend (Vite + React)
```bash
cd ../Frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite (default http://localhost:5173), and make sure the backend runs on http://localhost:5000.

## Notes
- Backend expects Ollama at `http://127.0.0.1:11434/api/generate` by default.
- The parser expects the LLM to follow the *exact* "FINAL OUTPUT FORMAT".
- Adjust file filtering in `src/utils/workflow.js` as needed.
