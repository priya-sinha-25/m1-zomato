# Phase 3: LLM Prompt and Recommendation Formatting

This folder wraps the execution of Phase 3, which is responsible for:
1. Generating the system and user prompts to be sent to the LLM (`src/phase3/prompt.js`).
2. Validating the structured JSON response from the LLM against the response contracts (`src/phase3/validator.js`).
3. Running grounding heuristics on the generated explanations to ensure facts aren't hallucinated (`src/phase3/heuristics.js`).

## Running Phase 3

To test the module end-to-end with mock data, run:

```bash
node run-phase3.js
```
