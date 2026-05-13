# Phase 4: Recommendation Orchestration

This folder contains the complete, self-contained end-to-end orchestration logic. 
No files have been split into the global `src/` directory; everything required for Phase 4 is right here.

### Files
- `llm-client.js`: Groq API interaction and mock fail-safes.
- `logger.js`: Tracing and logging execution steps.
- `orchestrator.js`: Core pipeline logic combining previous phases.
- `run-phase4.js`: Test runner script.

### Usage
```bash
$env:GROQ_API_KEY="your_api_key_here"
node run-phase4.js
```
