# Minimal Bug Recreator Backend

## Summary

This project generates minimal, reproducible examples for web development bugs.

## Steps to Run

1. Clone this repository.
2. Run `npm install` in the root directory.
3. Run `node src/index.js`.

## Expected Error Output

```
ReferenceError: fileURLToPath is not defined
    at file:///C:/Users/krsur/Desktop/Testing/Backend/src/index.js:12:20   
    at ModuleJob.run (node:internal/modules/esm/module_job:274:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:644:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:98:5)
```

## Minimal Context

This error occurs when trying to run the backend server.

---
Original Error Message:
const __filename = fileURLToPath(import.meta.url);
                   ^

ReferenceError: fileURLToPath is not defined
    at file:///C:/Users/krsur/Desktop/Testing/Backend/src/index.js:12:20   
    at ModuleJob.run (node:internal/modules/esm/module_job:274:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:644:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:98:5)
